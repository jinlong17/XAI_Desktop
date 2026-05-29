import { describe, expect, it } from "vitest";

import type { RepoRecord, TodoEntity } from "../src";
import {
  createInMemoryRepo,
  createMockCommitSeqAuthority,
  markOfflineMutationRollbackPending,
  outboxIdFor,
  runReconnectSyncReplay,
  stageTodoOfflineEdit,
  type OutboxEntry,
  type ReconnectSyncContext,
  type ReconnectSyncTransport,
} from "../src";

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

function readyContext(overrides: Partial<ReconnectSyncContext> = {}): ReconnectSyncContext {
  return {
    accountId: "user-a",
    deviceId: "device-a",
    boundaryKey: "user-a",
    online: true,
    ...overrides,
  };
}

describe("runReconnectSyncReplay preflight gates", () => {
  it("returns strict gate failures before replay attempts", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row14-preflight",
    });

    const nextCommitSeq = createMockCommitSeqAuthority();
    await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-preflight", "2026-05-29T13:00:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });

    const alwaysAck: ReconnectSyncTransport = {
      replayMutation: async () => ({ outcome: "acknowledged" }),
    };

    await expect(
      runReconnectSyncReplay({
        repo,
        context: readyContext({ online: false }),
        transport: alwaysAck,
      }),
    ).resolves.toMatchObject({ preflight: "network_unavailable", attempted: 0 });

    await expect(
      runReconnectSyncReplay({
        repo,
        context: readyContext({ accountId: "" }),
        transport: alwaysAck,
      }),
    ).resolves.toMatchObject({ preflight: "account_required", attempted: 0 });

    await expect(
      runReconnectSyncReplay({
        repo,
        context: readyContext({ deviceId: "" }),
        transport: alwaysAck,
      }),
    ).resolves.toMatchObject({ preflight: "device_required", attempted: 0 });

    await expect(
      runReconnectSyncReplay({
        repo,
        context: readyContext(),
      }),
    ).resolves.toMatchObject({ preflight: "transport_unavailable", attempted: 0 });
  });

  it("returns queue_empty when no replayable queue rows exist", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row14-preflight-empty",
    });

    await expect(
      runReconnectSyncReplay({
        repo,
        context: readyContext(),
        transport: {
          replayMutation: async () => ({ outcome: "acknowledged" }),
        },
      }),
    ).resolves.toMatchObject({ preflight: "queue_empty", attempted: 0 });
  });
});

describe("runReconnectSyncReplay outcomes", () => {
  it("marks acknowledged and duplicate outcomes as synced", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row14-ack-duplicate",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(0);

    const first = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-ack", "2026-05-29T13:10:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });
    const second = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-dup", "2026-05-29T13:11:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });

    expect(first.status).toBe("queued");
    expect(second.status).toBe("queued");
    if (first.status !== "queued" || second.status !== "queued") {
      return;
    }

    const result = await runReconnectSyncReplay({
      repo,
      context: readyContext({
        nowIso: (() => {
          let call = 0;
          return () => `2026-05-29T13:12:0${call++}.000Z`;
        })(),
      }),
      transport: {
        replayMutation: async (entry) => {
          if (entry.mutationId === first.mutationId) {
            return {
              outcome: "acknowledged",
              remoteRevision: 6,
              remoteCommitSeq: "120",
            };
          }
          return {
            outcome: "duplicate",
            remoteRevision: 7,
            remoteCommitSeq: "121",
          };
        },
      },
    });

    expect(result).toMatchObject({
      preflight: "ready",
      attempted: 2,
      acknowledged: 1,
      duplicates: 1,
      conflicts: 0,
      retryableFailures: 0,
      deferred: 0,
    });

    const firstOutbox = (await repo.get(outboxIdFor(first.mutationId))) as OutboxEntry;
    const secondOutbox = (await repo.get(outboxIdFor(second.mutationId))) as OutboxEntry;
    expect(firstOutbox.queueStatus).toBe("synced");
    expect(firstOutbox.remoteRevision).toBe(6);
    expect(secondOutbox.queueStatus).toBe("synced");
    expect(secondOutbox.remoteCommitSeq).toBe("121");
  });

  it("preserves conflict/retry/deferred semantics and skips rollback_pending", async () => {
    const repo = createInMemoryRepo<RepoRecord | OutboxEntry>({
      namespace: "row14-outcomes",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(20);

    const conflict = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-conflict", "2026-05-29T13:20:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });
    const retryable = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-retry", "2026-05-29T13:21:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });
    const deferred = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-deferred", "2026-05-29T13:22:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });
    const rollbackPending = await stageTodoOfflineEdit({
      repo,
      entity: todoFixture("todo-rollback", "2026-05-29T13:23:00.000Z"),
      op: "put",
      boundaryKey: "user-a",
      nextCommitSeq,
    });

    if (
      conflict.status !== "queued" ||
      retryable.status !== "queued" ||
      deferred.status !== "queued" ||
      rollbackPending.status !== "queued"
    ) {
      throw new Error("Expected queued staging status for row14 outcome test");
    }

    await markOfflineMutationRollbackPending({
      repo,
      mutationId: rollbackPending.mutationId,
      reason: "manual-review",
      nowIso: () => "2026-05-29T13:24:00.000Z",
    });

    const replay = await runReconnectSyncReplay({
      repo,
      context: readyContext({
        nowIso: (() => {
          let idx = 0;
          return () => `2026-05-29T13:25:0${idx++}.000Z`;
        })(),
      }),
      transport: {
        replayMutation: async (entry) => {
          if (entry.mutationId === conflict.mutationId) {
            return {
              outcome: "conflict",
              message: "revision mismatch",
              remoteRevision: 88,
            };
          }
          if (entry.mutationId === retryable.mutationId) {
            return {
              outcome: "retryable_failure",
              code: "network_timeout",
              message: "retry later",
            };
          }
          return {
            outcome: "deferred",
            code: "transport_busy",
            message: "deferred by limiter",
          };
        },
      },
    });

    expect(replay).toMatchObject({
      preflight: "ready",
      attempted: 3,
      acknowledged: 0,
      duplicates: 0,
      conflicts: 1,
      retryableFailures: 1,
      deferred: 1,
    });

    const conflictRow = (await repo.get(outboxIdFor(conflict.mutationId))) as OutboxEntry;
    const retryRow = (await repo.get(outboxIdFor(retryable.mutationId))) as OutboxEntry;
    const deferredRow = (await repo.get(outboxIdFor(deferred.mutationId))) as OutboxEntry;
    const rollbackRow = (await repo.get(outboxIdFor(rollbackPending.mutationId))) as OutboxEntry;

    expect(conflictRow.queueStatus).toBe("conflict");
    expect(conflictRow.lastFailureMessage).toContain("remote revision 88");
    expect(retryRow.queueStatus).toBe("retryable_failure");
    expect(retryRow.retryCount).toBe(1);
    expect(deferredRow.queueStatus).toBe("replay_deferred");
    expect(deferredRow.retryCount).toBe(0);
    expect(rollbackRow.queueStatus).toBe("rollback_pending");
  });
});
