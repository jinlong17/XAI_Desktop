import {
  OFFLINE_QUEUE_REPLAYABLE_STATUSES,
  listOfflineQueueMutations,
  markOfflineMutationConflict,
  markOfflineMutationReplayDeferred,
  markOfflineMutationRetryableFailure,
  markOfflineMutationSynced,
} from "./offline-edit-queue";
import type { OutboxEntry } from "./sync-outbox";
import type { Repo, RepoRecord } from "./types";

export type ReconnectSyncPreflightStatus =
  | "ready"
  | "network_unavailable"
  | "account_required"
  | "device_required"
  | "transport_unavailable"
  | "queue_empty";

export type ReconnectSyncMutationOutcome =
  | "acknowledged"
  | "duplicate"
  | "conflict"
  | "retryable_failure"
  | "deferred";

export interface ReconnectSyncContext {
  accountId: string;
  deviceId: string;
  boundaryKey: string;
  online: boolean;
  nowIso?: () => string;
}

export type ReconnectSyncTransportResult =
  | {
      outcome: "acknowledged" | "duplicate";
      remoteRevision?: number;
      remoteCommitSeq?: string;
    }
  | {
      outcome: "conflict";
      message: string;
      remoteRevision?: number;
    }
  | {
      outcome: "retryable_failure" | "deferred";
      code: string;
      message: string;
    };

export interface ReconnectSyncTransport {
  replayMutation(
    entry: OutboxEntry,
    context: ReconnectSyncContext,
  ): Promise<ReconnectSyncTransportResult>;
}

export interface ReconnectSyncReplayInput {
  repo: Repo<RepoRecord | OutboxEntry>;
  context?: Partial<ReconnectSyncContext>;
  transport?: ReconnectSyncTransport;
  limit?: number;
}

export interface ReconnectSyncReplayResult {
  preflight: ReconnectSyncPreflightStatus;
  attempted: number;
  acknowledged: number;
  duplicates: number;
  conflicts: number;
  retryableFailures: number;
  deferred: number;
  mutationResults: Array<{
    mutationId: string;
    outcome: ReconnectSyncMutationOutcome;
    message?: string;
  }>;
}

const DEFAULT_RECONNECT_LIMIT = 50;

export async function runReconnectSyncReplay(
  input: ReconnectSyncReplayInput,
): Promise<ReconnectSyncReplayResult> {
  const context = normalizeContext(input.context ?? {});
  const preflight = await resolvePreflight({
    repo: input.repo,
    context,
    transport: input.transport,
  });
  if (preflight !== "ready") {
    return emptyReplayResult(preflight);
  }

  const pendingRows = await listOfflineQueueMutations(input.repo, {
    boundaryKey: context.boundaryKey,
    statuses: OFFLINE_QUEUE_REPLAYABLE_STATUSES,
    limit: sanitizeLimit(input.limit),
  });

  const nowIso = context.nowIso ?? (() => new Date().toISOString());
  const summary: ReconnectSyncReplayResult = emptyReplayResult("ready");

  for (const row of pendingRows) {
    const attemptAt = nowIso();
    const transportResult = await input.transport!.replayMutation(row, context);
    summary.attempted += 1;

    switch (transportResult.outcome) {
      case "acknowledged": {
        const updated = await markOfflineMutationSynced({
          repo: input.repo,
          mutationId: row.mutationId,
          ackedAt: attemptAt,
          remoteRevision: transportResult.remoteRevision,
          remoteCommitSeq: transportResult.remoteCommitSeq,
        });
        if (!updated.ok) {
          summary.deferred += 1;
          summary.mutationResults.push({
            mutationId: row.mutationId,
            outcome: "deferred",
            message: updated.message,
          });
          break;
        }
        summary.acknowledged += 1;
        summary.mutationResults.push({
          mutationId: row.mutationId,
          outcome: "acknowledged",
        });
        break;
      }
      case "duplicate": {
        const updated = await markOfflineMutationSynced({
          repo: input.repo,
          mutationId: row.mutationId,
          ackedAt: attemptAt,
          remoteRevision: transportResult.remoteRevision,
          remoteCommitSeq: transportResult.remoteCommitSeq,
        });
        if (!updated.ok) {
          summary.deferred += 1;
          summary.mutationResults.push({
            mutationId: row.mutationId,
            outcome: "deferred",
            message: updated.message,
          });
          break;
        }
        summary.duplicates += 1;
        summary.mutationResults.push({
          mutationId: row.mutationId,
          outcome: "duplicate",
        });
        break;
      }
      case "conflict": {
        const message = formatConflictMessage(
          transportResult.message,
          transportResult.remoteRevision,
        );
        await markOfflineMutationConflict({
          repo: input.repo,
          mutationId: row.mutationId,
          message,
          attemptAt,
        });
        summary.conflicts += 1;
        summary.mutationResults.push({
          mutationId: row.mutationId,
          outcome: "conflict",
          message,
        });
        break;
      }
      case "retryable_failure": {
        await markOfflineMutationRetryableFailure({
          repo: input.repo,
          mutationId: row.mutationId,
          failureCode: transportResult.code,
          message: transportResult.message,
          attemptAt,
        });
        summary.retryableFailures += 1;
        summary.mutationResults.push({
          mutationId: row.mutationId,
          outcome: "retryable_failure",
          message: `${transportResult.code}: ${transportResult.message}`,
        });
        break;
      }
      case "deferred": {
        await markOfflineMutationReplayDeferred({
          repo: input.repo,
          mutationId: row.mutationId,
          failureCode: transportResult.code,
          message: transportResult.message,
          attemptAt,
        });
        summary.deferred += 1;
        summary.mutationResults.push({
          mutationId: row.mutationId,
          outcome: "deferred",
          message: `${transportResult.code}: ${transportResult.message}`,
        });
        break;
      }
      default: {
        const exhaustive: never = transportResult;
        throw new Error(`E3044: unsupported reconnect transport outcome ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  return summary;
}

function emptyReplayResult(
  preflight: ReconnectSyncPreflightStatus,
): ReconnectSyncReplayResult {
  return {
    preflight,
    attempted: 0,
    acknowledged: 0,
    duplicates: 0,
    conflicts: 0,
    retryableFailures: 0,
    deferred: 0,
    mutationResults: [],
  };
}

async function resolvePreflight(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  context: ReconnectSyncContext;
  transport?: ReconnectSyncTransport;
}): Promise<ReconnectSyncPreflightStatus> {
  const { context, repo, transport } = input;

  if (!context.online) {
    return "network_unavailable";
  }
  if (context.accountId.length === 0) {
    return "account_required";
  }
  if (context.deviceId.length === 0) {
    return "device_required";
  }
  if (!transport) {
    return "transport_unavailable";
  }

  const queued = await listOfflineQueueMutations(repo, {
    boundaryKey: context.boundaryKey,
    statuses: OFFLINE_QUEUE_REPLAYABLE_STATUSES,
    limit: 1,
  });
  if (queued.length === 0) {
    return "queue_empty";
  }

  return "ready";
}

function normalizeContext(context: Partial<ReconnectSyncContext>): ReconnectSyncContext {
  const accountId = normalizeText(context.accountId);
  return {
    accountId,
    deviceId: normalizeText(context.deviceId),
    boundaryKey: normalizeText(context.boundaryKey) || accountId,
    online: context.online === true,
    nowIso: context.nowIso,
  };
}

function normalizeText(value: string | undefined): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function sanitizeLimit(limit: number | undefined): number {
  if (!Number.isInteger(limit) || !limit || limit < 1) {
    return DEFAULT_RECONNECT_LIMIT;
  }
  return limit;
}

function formatConflictMessage(message: string, remoteRevision: number | undefined): string {
  if (!Number.isFinite(remoteRevision)) {
    return message;
  }
  return `${message} (remote revision ${remoteRevision})`;
}
