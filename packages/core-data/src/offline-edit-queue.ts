import {
  enqueueOutboxEntry,
  nextOutboxBatch,
  outboxIdFor,
  type OutboxQueueStatus,
  type OutboxEntry,
  type OutboxRollbackSafety,
} from "./sync-outbox";
import type {
  CardEntity,
  HabitEntity,
  ProjectEntity,
  RepoEntityType,
  TodoEntity,
} from "./entities";
import type { Repo, RepoRecord } from "./types";

export const OFFLINE_QUEUEABLE_ENTITY_TYPES = [
  "productivity.todo",
  "productivity.habit",
  "project.board",
  "project.card",
] as const;

export type OfflineQueueableEntityType =
  (typeof OFFLINE_QUEUEABLE_ENTITY_TYPES)[number];

const OFFLINE_QUEUEABLE_SET: ReadonlySet<string> = new Set(
  OFFLINE_QUEUEABLE_ENTITY_TYPES,
);

export const OFFLINE_QUEUE_UNRESOLVED_STATUSES = [
  "queued",
  "replay_deferred",
  "retryable_failure",
  "conflict",
  "rollback_pending",
] as const satisfies readonly OutboxQueueStatus[];

export const OFFLINE_QUEUE_REPLAYABLE_STATUSES = [
  "queued",
  "replay_deferred",
  "retryable_failure",
] as const satisfies readonly OutboxQueueStatus[];

export type OfflineEditOperation = "put" | "delete";

export interface OfflineEditQueueRequest<T extends RepoRecord> {
  repo: Repo<T | OutboxEntry>;
  entity: T;
  op: OfflineEditOperation;
  boundaryKey: string;
  nextCommitSeq: () => number;
  baseRevision?: number;
  mutationId?: string;
  nowIso?: () => string;
}

export type OfflineEditQueueStatus =
  | "queued"
  | "not_queueable"
  | "failed";

export type OfflineEditQueueResult =
  | {
      status: "queued";
      mutationId: string;
      outboxId: string;
      commitSeq: number;
    }
  | {
      status: "not_queueable";
      reason: "device_local" | "unsupported_surface";
      entityType: string;
    }
  | {
      status: "failed";
      reason: "repo_unavailable" | "write_failed" | "contract_mismatch";
      message: string;
    };

type QueuePayloadEnvelope<T extends RepoRecord> = {
  row: 13;
  op: OfflineEditOperation;
  boundaryKey: string;
  entityType: string;
  entityId: string;
  baseRevision?: number;
  localRevision: number;
  stagedAt: string;
  entity: T;
};

export function isOfflineQueueableEntity(
  entityType: string,
): entityType is OfflineQueueableEntityType {
  return OFFLINE_QUEUEABLE_SET.has(entityType);
}

export async function stageOfflineEditMutation<T extends RepoRecord>(
  input: OfflineEditQueueRequest<T>,
): Promise<OfflineEditQueueResult> {
  const entityType = input.entity.entityType;
  if (input.entity.syncScope !== "account-sync") {
    return {
      status: "not_queueable",
      reason: "device_local",
      entityType,
    };
  }
  if (!isOfflineQueueableEntity(entityType)) {
    return {
      status: "not_queueable",
      reason: "unsupported_surface",
      entityType,
    };
  }

  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const boundaryKey = normalizeBoundaryKey(input.boundaryKey);
  const localRevision = input.nextCommitSeq();
  const mutationId =
    input.mutationId ??
    buildOfflineMutationId({
      boundaryKey,
      entityType,
      entityId: input.entity.id,
      op: input.op,
      localRevision,
    });
  const stagedAt = nowIso();

  try {
    const previous = await input.repo.get(input.entity.id);
    if (previous && previous.entityType !== entityType) {
      return {
        status: "failed",
        reason: "contract_mismatch",
        message: `Expected existing entityType "${entityType}" for "${input.entity.id}" but got "${previous.entityType}".`,
      };
    }

    const payloadEnvelope: QueuePayloadEnvelope<T> = {
      row: 13,
      op: input.op,
      boundaryKey,
      entityType,
      entityId: input.entity.id,
      baseRevision: input.baseRevision,
      localRevision,
      stagedAt,
      entity: input.entity,
    };
    const rollbackSafety = buildRollbackSafety(previous, input.entity);

    const outbox = await enqueueOutboxEntry({
      entityRepo: input.repo,
      entity: input.entity,
      op: input.op,
      payload: JSON.stringify(payloadEnvelope),
      mutationId,
      baseRevision: input.baseRevision,
      boundaryKey,
      queueStatus: "queued",
      localRevision,
      rollbackSafety,
      nowIso: () => stagedAt,
      nextCommitSeq: () => localRevision,
    });

    return {
      status: "queued",
      mutationId,
      outboxId: outbox.id,
      commitSeq: outbox.commitSeq,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/E3009|E3010|E3011|E3012|E3013/.test(message)) {
      return {
        status: "failed",
        reason: "contract_mismatch",
        message,
      };
    }
    if (/unavailable|invoke|repo/i.test(message)) {
      return {
        status: "failed",
        reason: "repo_unavailable",
        message,
      };
    }
    return {
      status: "failed",
      reason: "write_failed",
      message,
    };
  }
}

export function stageTodoOfflineEdit(
  input: Omit<OfflineEditQueueRequest<TodoEntity>, "entity"> & {
    entity: TodoEntity;
  },
) {
  return stageOfflineEditMutation(input);
}

export function stageHabitOfflineEdit(
  input: Omit<OfflineEditQueueRequest<HabitEntity>, "entity"> & {
    entity: HabitEntity;
  },
) {
  return stageOfflineEditMutation(input);
}

export function stageProjectBoardOfflineEdit(
  input: Omit<OfflineEditQueueRequest<ProjectEntity>, "entity"> & {
    entity: ProjectEntity;
  },
) {
  return stageOfflineEditMutation(input);
}

export function stageProjectCardOfflineEdit(
  input: Omit<OfflineEditQueueRequest<CardEntity>, "entity"> & {
    entity: CardEntity;
  },
) {
  return stageOfflineEditMutation(input);
}

export function isDeviceLocalRepoEntityType(entityType: RepoEntityType): boolean {
  return (
    entityType === "productivity.tasks_state" ||
    entityType === "productivity.habits_state" ||
    entityType === "productivity.pomodoro_sessions" ||
    entityType === "project.workspace_state" ||
    entityType === "pet.state" ||
    entityType === "settings.pref" ||
    entityType === "calendar.provider_state" ||
    entityType === "clipboard.item"
  );
}

export function buildOfflineMutationId(input: {
  boundaryKey: string;
  entityType: string;
  entityId: string;
  op: OfflineEditOperation;
  localRevision: number;
}): string {
  const canonical = [
    "row13",
    normalizeBoundaryKey(input.boundaryKey),
    input.entityType.trim(),
    input.entityId.trim(),
    input.op,
    String(input.localRevision),
  ].join("|");
  const digest = fnv1aHash(canonical);
  return `row13:${input.localRevision}:${digest}`;
}

function normalizeBoundaryKey(boundaryKey: string): string {
  const trimmed = boundaryKey.trim();
  return trimmed.length > 0 ? trimmed : "local-session";
}

function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let idx = 0; idx < input.length; idx += 1) {
    hash ^= input.charCodeAt(idx);
    hash = Math.imul(hash, 0x01000193);
    hash >>>= 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function buildRollbackSafety(
  previous: RepoRecord | undefined,
  entity: RepoRecord,
): OutboxRollbackSafety {
  return {
    expectedEntityUpdatedAt: entity.updatedAt,
    previousEntityExisted: Boolean(previous),
    previousEntityPayload: previous ? JSON.stringify(previous) : undefined,
  };
}

export function isQueuedOfflineResult(
  result: OfflineEditQueueResult,
): result is Extract<OfflineEditQueueResult, { status: "queued" }> {
  return result.status === "queued";
}

export function outboxIdForQueuedResult(
  result: Extract<OfflineEditQueueResult, { status: "queued" }>,
): string {
  return outboxIdFor(result.mutationId);
}

export interface OfflineQueueListOptions {
  boundaryKey?: string;
  statuses?: readonly OutboxQueueStatus[];
  limit?: number;
}

export async function listOfflineQueueMutations(
  repo: Repo<RepoRecord | OutboxEntry>,
  options: OfflineQueueListOptions = {},
): Promise<OutboxEntry[]> {
  const rows = await nextOutboxBatch(
    repo as unknown as Repo<OutboxEntry>,
    options.limit ? { limit: options.limit } : {},
  );
  const normalizedBoundaryKey = options.boundaryKey
    ? normalizeBoundaryKey(options.boundaryKey)
    : null;
  const statusSet = options.statuses
    ? new Set(options.statuses)
    : new Set<OutboxQueueStatus>(OFFLINE_QUEUE_UNRESOLVED_STATUSES);

  return rows.filter((row) => {
    if (row.id !== outboxIdFor(row.mutationId)) {
      return false;
    }
    if (normalizedBoundaryKey && row.boundaryKey !== normalizedBoundaryKey) {
      return false;
    }
    return statusSet.has(row.queueStatus);
  });
}

export interface OfflineQueueSummary {
  total: number;
  byStatus: Record<OutboxQueueStatus, number>;
  oldestCommitSeq: number | null;
  newestCommitSeq: number | null;
}

export async function getOfflineQueueSummary(
  repo: Repo<RepoRecord | OutboxEntry>,
  options: Pick<OfflineQueueListOptions, "boundaryKey"> = {},
): Promise<OfflineQueueSummary> {
  const rows = await listOfflineQueueMutations(repo, {
    boundaryKey: options.boundaryKey,
  });
  const byStatus: Record<OutboxQueueStatus, number> = {
    queued: 0,
    replay_deferred: 0,
    retryable_failure: 0,
    conflict: 0,
    rollback_pending: 0,
    synced: 0,
    rolled_back: 0,
  };
  for (const row of rows) {
    byStatus[row.queueStatus] += 1;
  }

  return {
    total: rows.length,
    byStatus,
    oldestCommitSeq: rows.at(0)?.commitSeq ?? null,
    newestCommitSeq: rows.at(-1)?.commitSeq ?? null,
  };
}

type QueueStatusUpdateResult =
  | { ok: true; row: OutboxEntry }
  | { ok: false; reason: "not_found"; message: string };

type QueueStatusUpdatePatch = {
  queueStatus: OutboxQueueStatus;
  retryCountDelta?: number;
  lastAttemptAt?: string;
  ackedAt?: string;
  remoteRevision?: number;
  remoteCommitSeq?: string;
  lastFailureCode?: string;
  lastFailureMessage?: string;
  clearFailure?: boolean;
  conflictAt?: string;
  rollbackRequestedAt?: string;
  rollbackReason?: string;
  rollbackAppliedAt?: string;
};

async function updateOutboxQueueStatus(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  mutationId: string;
  patch: QueueStatusUpdatePatch;
  nowIso?: () => string;
}): Promise<QueueStatusUpdateResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const id = outboxIdFor(input.mutationId);
  const row = (await input.repo.get(id)) as OutboxEntry | undefined;
  if (!row || row.entityType !== "sync.outbox") {
    return {
      ok: false,
      reason: "not_found",
      message: `Outbox mutation "${input.mutationId}" not found`,
    };
  }

  const timestamp = nowIso();
  const next: OutboxEntry = {
    ...row,
    queueStatus: input.patch.queueStatus,
    retryCount: row.retryCount + (input.patch.retryCountDelta ?? 0),
    lastAttemptAt: input.patch.lastAttemptAt ?? row.lastAttemptAt,
    ackedAt: input.patch.ackedAt ?? row.ackedAt,
    remoteRevision: input.patch.remoteRevision ?? row.remoteRevision,
    remoteCommitSeq: input.patch.remoteCommitSeq ?? row.remoteCommitSeq,
    statusUpdatedAt: timestamp,
    updatedAt: timestamp,
    conflictAt: input.patch.conflictAt ?? row.conflictAt,
    rollbackRequestedAt: input.patch.rollbackRequestedAt ?? row.rollbackRequestedAt,
    rollbackReason: input.patch.rollbackReason ?? row.rollbackReason,
    rollbackAppliedAt: input.patch.rollbackAppliedAt ?? row.rollbackAppliedAt,
  };

  if (input.patch.clearFailure) {
    next.lastFailureCode = undefined;
    next.lastFailureMessage = undefined;
    next.lastFailureAt = undefined;
  } else if (input.patch.lastFailureCode || input.patch.lastFailureMessage) {
    next.lastFailureCode = input.patch.lastFailureCode ?? row.lastFailureCode;
    next.lastFailureMessage =
      input.patch.lastFailureMessage ?? row.lastFailureMessage;
    next.lastFailureAt = timestamp;
  }

  await input.repo.put(next);
  return { ok: true, row: next };
}

export async function markOfflineMutationRetryableFailure(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  mutationId: string;
  failureCode: string;
  message: string;
  attemptAt?: string;
  nowIso?: () => string;
}): Promise<QueueStatusUpdateResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const attemptAt = input.attemptAt ?? nowIso();
  return updateOutboxQueueStatus({
    repo: input.repo,
    mutationId: input.mutationId,
    nowIso: () => attemptAt,
    patch: {
      queueStatus: "retryable_failure",
      retryCountDelta: 1,
      lastAttemptAt: attemptAt,
      lastFailureCode: input.failureCode,
      lastFailureMessage: input.message,
    },
  });
}

export async function markOfflineMutationConflict(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  mutationId: string;
  message: string;
  attemptAt?: string;
  nowIso?: () => string;
}): Promise<QueueStatusUpdateResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const attemptAt = input.attemptAt ?? nowIso();
  const conflictAt = attemptAt;
  return updateOutboxQueueStatus({
    repo: input.repo,
    mutationId: input.mutationId,
    nowIso: () => conflictAt,
    patch: {
      queueStatus: "conflict",
      lastAttemptAt: attemptAt,
      conflictAt,
      lastFailureCode: "conflict",
      lastFailureMessage: input.message,
    },
  });
}

export async function markOfflineMutationReplayDeferred(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  mutationId: string;
  failureCode: string;
  message: string;
  attemptAt?: string;
  nowIso?: () => string;
}): Promise<QueueStatusUpdateResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const attemptAt = input.attemptAt ?? nowIso();
  return updateOutboxQueueStatus({
    repo: input.repo,
    mutationId: input.mutationId,
    nowIso: () => attemptAt,
    patch: {
      queueStatus: "replay_deferred",
      lastAttemptAt: attemptAt,
      lastFailureCode: input.failureCode,
      lastFailureMessage: input.message,
    },
  });
}

export async function markOfflineMutationSynced(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  mutationId: string;
  ackedAt?: string;
  remoteRevision?: number;
  remoteCommitSeq?: string;
  nowIso?: () => string;
}): Promise<QueueStatusUpdateResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const ackedAt = input.ackedAt ?? nowIso();
  return updateOutboxQueueStatus({
    repo: input.repo,
    mutationId: input.mutationId,
    nowIso: () => ackedAt,
    patch: {
      queueStatus: "synced",
      lastAttemptAt: ackedAt,
      ackedAt,
      remoteRevision: input.remoteRevision,
      remoteCommitSeq: input.remoteCommitSeq,
      clearFailure: true,
    },
  });
}

export async function markOfflineMutationRollbackPending(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  mutationId: string;
  reason: string;
  nowIso?: () => string;
}): Promise<QueueStatusUpdateResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const requestedAt = nowIso();
  return updateOutboxQueueStatus({
    repo: input.repo,
    mutationId: input.mutationId,
    nowIso: () => requestedAt,
    patch: {
      queueStatus: "rollback_pending",
      rollbackRequestedAt: requestedAt,
      rollbackReason: input.reason,
    },
  });
}

export type OfflineRollbackResult =
  | {
      status: "rolled_back";
      mutationId: string;
      outboxId: string;
    }
  | {
      status: "conflict";
      mutationId: string;
      outboxId: string;
      reason: "rollback_not_safe";
      message: string;
    }
  | {
      status: "failed";
      mutationId: string;
      reason: "not_found" | "invalid_snapshot" | "write_failed";
      message: string;
    };

export async function applyOfflineMutationRollback(input: {
  repo: Repo<RepoRecord | OutboxEntry>;
  mutationId: string;
  reason: string;
  nowIso?: () => string;
}): Promise<OfflineRollbackResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const rowId = outboxIdFor(input.mutationId);
  const row = (await input.repo.get(rowId)) as OutboxEntry | undefined;
  if (!row || row.entityType !== "sync.outbox") {
    return {
      status: "failed",
      mutationId: input.mutationId,
      reason: "not_found",
      message: `Outbox mutation "${input.mutationId}" not found`,
    };
  }
  if (!row.rollbackSafety) {
    return {
      status: "failed",
      mutationId: input.mutationId,
      reason: "invalid_snapshot",
      message: "Rollback safety metadata is missing",
    };
  }

  const current = await input.repo.get(row.targetEntityId);
  if (
    current &&
    current.updatedAt !== row.rollbackSafety.expectedEntityUpdatedAt
  ) {
    const conflictMessage =
      "Rollback refused because current entity revision diverged from expected local revision";
    await markOfflineMutationConflict({
      repo: input.repo,
      mutationId: input.mutationId,
      message: conflictMessage,
      nowIso,
    });
    return {
      status: "conflict",
      mutationId: input.mutationId,
      outboxId: rowId,
      reason: "rollback_not_safe",
      message: conflictMessage,
    };
  }

  const rollbackTarget = deserializeRollbackSnapshot(
    row.rollbackSafety.previousEntityPayload,
  );
  if (row.rollbackSafety.previousEntityExisted && !rollbackTarget) {
    return {
      status: "failed",
      mutationId: input.mutationId,
      reason: "invalid_snapshot",
      message: "Rollback snapshot is required but missing/invalid",
    };
  }

  const appliedAt = nowIso();

  try {
    await input.repo.transaction(async (tx) => {
      if (rollbackTarget) {
        await tx.put(rollbackTarget);
      } else {
        await tx.delete(row.targetEntityId);
      }

      const updatedRow: OutboxEntry = {
        ...row,
        queueStatus: "rolled_back",
        rollbackAppliedAt: appliedAt,
        rollbackReason: input.reason,
        statusUpdatedAt: appliedAt,
        updatedAt: appliedAt,
      };
      await tx.put(updatedRow);
    });
  } catch (error) {
    return {
      status: "failed",
      mutationId: input.mutationId,
      reason: "write_failed",
      message: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    status: "rolled_back",
    mutationId: input.mutationId,
    outboxId: rowId,
  };
}

function deserializeRollbackSnapshot(payload: string | undefined): RepoRecord | null {
  if (!payload) {
    return null;
  }
  try {
    const parsed = JSON.parse(payload) as RepoRecord;
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.entityType === "string" &&
      typeof parsed.createdAt === "string" &&
      typeof parsed.updatedAt === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
