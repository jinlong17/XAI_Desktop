import {
  enqueueOutboxEntry,
  outboxIdFor,
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
