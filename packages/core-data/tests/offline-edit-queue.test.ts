import { describe, expect, it } from "vitest";

import type {
  CardEntity,
  HabitEntity,
  ProjectEntity,
  RepoRecord,
  TodoEntity,
} from "../src";
import {
  applyOfflineMutationRollback,
  buildOfflineMutationId,
  createMockCommitSeqAuthority,
  createInMemoryRepo,
  getOfflineQueueSummary,
  listOfflineQueueMutations,
  markOfflineMutationConflict,
  markOfflineMutationRetryableFailure,
  markOfflineMutationRollbackPending,
  nextOutboxBatch,
  outboxIdForQueuedResult,
  stageHabitOfflineEdit,
  stageOfflineEditMutation,
  stageProjectBoardOfflineEdit,
  stageProjectCardOfflineEdit,
  stageTodoOfflineEdit,
  type OutboxEntry,
} from "../src";

type SharedRepo = ReturnType<typeof createInMemoryRepo<RepoRecord | OutboxEntry>>;

function asOutboxView(repo: SharedRepo) {
  return repo as unknown as ReturnType<typeof createInMemoryRepo<OutboxEntry>>;
}

function todoFixture(id: string, updatedAt: string): TodoEntity {
  return {
    id,
    entityType: "productivity.todo",
    schemaVersion: 1,
    createdAt: updatedAt,
    updatedAt,
    syncScope: "account-sync",
    title: id,
    done: false,
    labelIds: [],
  };
}

function habitFixture(id: string, updatedAt: string): HabitEntity {
  return {
    id,
    entityType: "productivity.habit",
    schemaVersion: 1,
    createdAt: updatedAt,
    updatedAt,
    syncScope: "account-sync",
    title: id,
    cadence: "daily",
    completions: [],
    labelIds: [],
  };
}

function boardFixture(id: string, updatedAt: string): ProjectEntity {
  return {
    id,
    entityType: "project.board",
    schemaVersion: 1,
    createdAt: updatedAt,
    updatedAt,
    syncScope: "account-sync",
    title: id,
    labelIds: [],
  };
}

function cardFixture(id: string, updatedAt: string): CardEntity {
  return {
    id,
    entityType: "project.card",
    schemaVersion: 1,
    createdAt: updatedAt,
    updatedAt,
    syncScope: "account-sync",
    projectId: "board-1",
    title: id,
    status: "todo",
    position: 1,
    labelIds: [],
  };
}

describe("offline edit queue staging", () => {
  it("stages representative account-sync put operations with outbox metadata", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase2-put",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(200);

    const todoResult = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-1", "2026-05-29T10:00:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });
    const habitResult = await stageHabitOfflineEdit({
      repo,
      entity: habitFixture("habit-1", "2026-05-29T10:01:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });
    const boardResult = await stageProjectBoardOfflineEdit({
      repo,
      entity: boardFixture("board-1", "2026-05-29T10:02:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });
    const cardResult = await stageProjectCardOfflineEdit({
      repo,
      entity: cardFixture("card-1", "2026-05-29T10:03:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });

    expect(todoResult.status).toBe("queued");
    expect(habitResult.status).toBe("queued");
    expect(boardResult.status).toBe("queued");
    expect(cardResult.status).toBe("queued");

    const batch = await nextOutboxBatch(asOutboxView(repo));
    expect(batch).toHaveLength(4);
    expect(batch.map((entry) => entry.targetEntityType)).toEqual([
      "productivity.todo",
      "productivity.habit",
      "project.board",
      "project.card",
    ]);
    expect(batch.map((entry) => entry.queueStatus)).toEqual([
      "queued",
      "queued",
      "queued",
      "queued",
    ]);
    expect(batch.map((entry) => entry.boundaryKey)).toEqual([
      "user-a",
      "user-a",
      "user-a",
      "user-a",
    ]);
  });

  it("stages delete operations and preserves rollback-safety snapshot", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase2-delete",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(10);
    const existing = cardFixture("card-delete", "2026-05-29T10:10:00.000Z");
    await repo.put(existing);

    const result = await stageProjectCardOfflineEdit({
      repo,
      entity: existing,
      op: "delete",
      boundaryKey: "user-b",
      nextCommitSeq,
    });

    expect(result.status).toBe("queued");
    if (result.status !== "queued") {
      return;
    }
    await expect(repo.get(existing.id)).resolves.toBeUndefined();

    const outboxRow = (await repo.get(result.outboxId)) as OutboxEntry | undefined;
    expect(outboxRow?.rollbackSafety?.previousEntityExisted).toBe(true);
    expect(outboxRow?.rollbackSafety?.previousEntityPayload).toContain(existing.id);
  });

  it("returns explicit not_queueable for device-local records", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase2-device-local",
    });

    const result = await stageOfflineEditMutation({
      repo,
      entity: {
        id: "xai_pref_week_start",
        entityType: "settings.pref",
        schemaVersion: 1,
        createdAt: "2026-05-29T10:20:00.000Z",
        updatedAt: "2026-05-29T10:20:00.000Z",
        syncScope: "device-local",
        storageKey: "xai_pref_week_start",
        value: "mon",
      } as RepoRecord,
      op: "put",
      boundaryKey: "user-c",
      nextCommitSeq: createMockCommitSeqAuthority(),
    });

    expect(result).toEqual({
      status: "not_queueable",
      reason: "device_local",
      entityType: "settings.pref",
    });

    const batch = await nextOutboxBatch(asOutboxView(repo));
    expect(batch).toEqual([]);
  });

  it("returns explicit not_queueable for unsupported account-sync surfaces", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase2-unsupported",
    });

    const result = await stageOfflineEditMutation({
      repo,
      entity: {
        id: "label-1",
        entityType: "labels.label",
        schemaVersion: 1,
        createdAt: "2026-05-29T10:25:00.000Z",
        updatedAt: "2026-05-29T10:25:00.000Z",
        syncScope: "account-sync",
        name: "Work",
        color: "#112233",
      } as RepoRecord,
      op: "put",
      boundaryKey: "user-c",
      nextCommitSeq: createMockCommitSeqAuthority(),
    });

    expect(result).toEqual({
      status: "not_queueable",
      reason: "unsupported_surface",
      entityType: "labels.label",
    });
  });

  it("builds deterministic mutation ids and outbox ids for fixed inputs", async () => {
    const mutationIdA = buildOfflineMutationId({
      boundaryKey: " user-a ",
      entityType: "productivity.todo",
      entityId: "todo-1",
      op: "put",
      localRevision: 9,
    });
    const mutationIdB = buildOfflineMutationId({
      boundaryKey: "user-a",
      entityType: "productivity.todo",
      entityId: "todo-1",
      op: "put",
      localRevision: 9,
    });
    expect(mutationIdA).toBe(mutationIdB);

    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase2-mutation-id",
    });
    const queued = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-queued", "2026-05-29T10:30:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      mutationId: "manual-id-1",
      nextCommitSeq: createMockCommitSeqAuthority(),
    });
    expect(queued.status).toBe("queued");
    if (queued.status === "queued") {
      expect(outboxIdForQueuedResult(queued)).toBe(queued.outboxId);
    }
  });
});

describe("offline queue observability and rollback safety", () => {
  it("lists queue entries by commit order and summarizes by status", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase3-list",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(0);

    const todo = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-order-1", "2026-05-29T11:00:00.000Z"),
      op: "put",
      boundaryKey: "user-z",
      nextCommitSeq,
    });
    const board = await stageProjectBoardOfflineEdit({
      repo,
      entity: boardFixture("board-order-2", "2026-05-29T11:01:00.000Z"),
      op: "put",
      boundaryKey: "user-z",
      nextCommitSeq,
    });
    const card = await stageProjectCardOfflineEdit({
      repo,
      entity: cardFixture("card-order-3", "2026-05-29T11:02:00.000Z"),
      op: "put",
      boundaryKey: "user-z",
      nextCommitSeq,
    });

    expect(todo.status).toBe("queued");
    expect(board.status).toBe("queued");
    expect(card.status).toBe("queued");
    if (todo.status !== "queued" || board.status !== "queued" || card.status !== "queued") {
      return;
    }

    await markOfflineMutationRetryableFailure({
      repo,
      mutationId: board.mutationId,
      failureCode: "network_timeout",
      message: "retry later",
      nowIso: () => "2026-05-29T11:03:00.000Z",
    });
    await markOfflineMutationConflict({
      repo,
      mutationId: card.mutationId,
      message: "local conflict marker",
      nowIso: () => "2026-05-29T11:04:00.000Z",
    });

    const ordered = await listOfflineQueueMutations(repo, { boundaryKey: "user-z" });
    expect(ordered.map((row) => row.commitSeq)).toEqual([1, 2, 3]);
    expect(ordered.map((row) => row.queueStatus)).toEqual([
      "queued",
      "retryable_failure",
      "conflict",
    ]);

    const summary = await getOfflineQueueSummary(repo, { boundaryKey: "user-z" });
    expect(summary.total).toBe(3);
    expect(summary.oldestCommitSeq).toBe(1);
    expect(summary.newestCommitSeq).toBe(3);
    expect(summary.byStatus.queued).toBe(1);
    expect(summary.byStatus.retryable_failure).toBe(1);
    expect(summary.byStatus.conflict).toBe(1);
  });

  it("applies rollback when rollback safety checks pass", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase3-rollback-ok",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(10);
    const current = todoFixture("todo-rb-ok", "2026-05-29T11:10:00.000Z");
    await repo.put(current);

    const staged = await stageTodoOfflineEdit({
      repo,
      entity: {
        ...current,
        title: "edited title",
      },
      op: "put",
      boundaryKey: "user-rb",
      nextCommitSeq,
    });
    expect(staged.status).toBe("queued");
    if (staged.status !== "queued") {
      return;
    }

    await markOfflineMutationRollbackPending({
      repo,
      mutationId: staged.mutationId,
      reason: "user-requested",
      nowIso: () => "2026-05-29T11:11:00.000Z",
    });

    const rollback = await applyOfflineMutationRollback({
      repo,
      mutationId: staged.mutationId,
      reason: "manual-revert",
      nowIso: () => "2026-05-29T11:12:00.000Z",
    });
    expect(rollback.status).toBe("rolled_back");

    const restored = (await repo.get(current.id)) as TodoEntity | undefined;
    expect(restored?.title).toBe(current.title);

    const outbox = (await repo.get(staged.outboxId)) as OutboxEntry | undefined;
    expect(outbox?.queueStatus).toBe("rolled_back");
    expect(outbox?.rollbackAppliedAt).toBe("2026-05-29T11:12:00.000Z");
  });

  it("refuses rollback when entity revision diverged and marks conflict", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row13-phase3-rollback-conflict",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(20);
    const current = todoFixture("todo-rb-conflict", "2026-05-29T11:20:00.000Z");
    await repo.put(current);

    const staged = await stageTodoOfflineEdit({
      repo,
      entity: {
        ...current,
        title: "staged update",
      },
      op: "put",
      boundaryKey: "user-rb2",
      nextCommitSeq,
    });
    expect(staged.status).toBe("queued");
    if (staged.status !== "queued") {
      return;
    }

    await repo.put({
      ...current,
      title: "newer local edit",
      updatedAt: "2026-05-29T11:25:00.000Z",
    });

    const rollback = await applyOfflineMutationRollback({
      repo,
      mutationId: staged.mutationId,
      reason: "manual-revert",
      nowIso: () => "2026-05-29T11:26:00.000Z",
    });
    expect(rollback.status).toBe("conflict");

    const outbox = (await repo.get(staged.outboxId)) as OutboxEntry | undefined;
    expect(outbox?.queueStatus).toBe("conflict");
    expect(outbox?.lastFailureCode).toBe("conflict");
    expect(outbox?.conflictAt).toBe("2026-05-29T11:26:00.000Z");
  });
});
