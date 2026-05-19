import { describe, expect, it, vi } from 'vitest';

import {
  createSyncStatusEmitter,
  runObservedSync,
  type SyncEventEmitter,
} from '../src/sync-status';

describe('createSyncStatusEmitter', () => {
  it('emits the account sync lifecycle events from plugin-account', async () => {
    const emit = vi.fn<SyncEventEmitter>(async () => undefined);
    const status = createSyncStatusEmitter({ emit });

    await status.syncStarted('push');
    await status.syncCompleted('push', 17);
    await status.syncFailed('pull', new Error('E3015: revision rollback'));

    expect(emit.mock.calls).toEqual([
      ['account:sync-started', { kind: 'push' }],
      ['account:sync-completed', { kind: 'push', durationMs: 17 }],
      ['account:sync-failed', { kind: 'pull', error: 'E3015: revision rollback' }],
    ]);
  });
});

describe('runObservedSync', () => {
  it('wraps a successful operation with started and completed events', async () => {
    const emit = vi.fn<SyncEventEmitter>(async () => undefined);
    let now = 100;

    await expect(
      runObservedSync('pull', async () => 'ok', {
        emit,
        nowMs: () => {
          now += 25;
          return now;
        },
      }),
    ).resolves.toBe('ok');

    expect(emit.mock.calls).toEqual([
      ['account:sync-started', { kind: 'pull' }],
      ['account:sync-completed', { kind: 'pull', durationMs: 25 }],
    ]);
  });

  it('emits failed and rethrows when the operation rejects', async () => {
    const emit = vi.fn<SyncEventEmitter>(async () => undefined);
    const error = new Error('E3003: pull failed');

    await expect(
      runObservedSync('pull', async () => {
        throw error;
      }, { emit, nowMs: () => 10 }),
    ).rejects.toBe(error);

    expect(emit.mock.calls).toEqual([
      ['account:sync-started', { kind: 'pull' }],
      ['account:sync-failed', { kind: 'pull', error: 'E3003: pull failed' }],
    ]);
  });
});
