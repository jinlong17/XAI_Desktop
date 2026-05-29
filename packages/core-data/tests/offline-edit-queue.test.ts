import { describe, expect, it } from "vitest";

import type {
  CardEntity,
  HabitEntity,
  ProjectEntity,
  RepoRecord,
  TodoEntity,
} from "../src";
import {
  buildOfflineMutationId,
  createMockCommitSeqAuthority,
  createInMemoryRepo,
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
