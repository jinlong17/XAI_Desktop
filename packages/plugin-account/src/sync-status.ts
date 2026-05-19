import { emitEvent } from '@repo/core/events';

export type SyncOperationKind = 'push' | 'pull';

export interface SyncStatusEmitter {
  syncStarted(kind: SyncOperationKind): Promise<void>;
  syncCompleted(kind: SyncOperationKind, durationMs: number): Promise<void>;
  syncFailed(kind: SyncOperationKind, error: unknown): Promise<void>;
}

export type SyncEventEmitter = typeof emitEvent;

export interface SyncStatusEmitterOptions {
  emit?: SyncEventEmitter;
  nowMs?: () => number;
}

export function createSyncStatusEmitter(
  options: SyncStatusEmitterOptions = {},
): SyncStatusEmitter {
  const emit = options.emit ?? emitEvent;

  return {
    async syncStarted(kind) {
      await emit('account:sync-started', { kind });
    },

    async syncCompleted(kind, durationMs) {
      await emit('account:sync-completed', { kind, durationMs });
    },

    async syncFailed(kind, error) {
      await emit('account:sync-failed', { kind, error: syncErrorMessage(error) });
    },
  };
}

export async function runObservedSync<T>(
  kind: SyncOperationKind,
  operation: () => Promise<T>,
  options: SyncStatusEmitterOptions = {},
): Promise<T> {
  const nowMs = options.nowMs ?? Date.now;
  const startedAt = nowMs();
  const status = createSyncStatusEmitter(options);

  await status.syncStarted(kind);
  try {
    const result = await operation();
    await status.syncCompleted(kind, Math.max(0, nowMs() - startedAt));
    return result;
  } catch (error) {
    await status.syncFailed(kind, error);
    throw error;
  }
}

function syncErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }
  return 'Sync failed';
}
