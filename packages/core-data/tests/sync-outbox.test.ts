import { describe, expect, it } from "vitest";

import {
  createMockCommitSeqAuthority,
  enqueueOutboxEntry,
  nextOutboxBatch,
  type OutboxEntry,
} from "../src/sync-outbox";
import { createInMemoryRepo } from "../src/testing";
import type { TodoEntity } from "../src/entities";

function todoFixture(id: string, overrides: Partial<TodoEntity> = {}): TodoEntity {
  return {
    id,
    entityType: "productivity.todo",
    schemaVersion: 1,
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
    syncScope: "account-sync",
    title: id,
    done: false,
    labelIds: [],
    ...overrides,
  };
}

describe("enqueueOutboxEntry", () => {
  it("writes the entity and its outbox row in the same transaction", async () => {
    const entityRepo = createInMemoryRepo<TodoEntity>({
      namespace: "productivity.todos",
    });
    const outboxRepo = createInMemoryRepo<OutboxEntry>({
      namespace: "sync.outbox",
    });
    const nextCommitSeq = createMockCommitSeqAuthority();

    const entry = await enqueueOutboxEntry({
      entityRepo,
      outboxRepo,
      entity: todoFixture("todo-1", { title: "first" }),
      op: "put",
      payload: "ENC(first)",
      mutationId: "mut-1",
      nextCommitSeq,
      nowIso: () => "2026-05-20T00:01:00.000Z",
    });

    expect(entry).toMatchObject({
      id: "outbox_mut-1",
      commitSeq: 1,
      targetEntityType: "productivity.todo",
      targetEntityId: "todo-1",
      op: "put",
    });

    const todo = await entityRepo.get("todo-1");
    expect(todo).toMatchObject({ id: "todo-1", title: "first" });

    const outbox = await nextOutboxBatch(outboxRepo);
    expect(outbox).toHaveLength(1);
    expect(outbox[0]).toEqual(entry);
  });

  it("rolls back the entity write when the outbox write throws", async () => {
    const entityRepo = createInMemoryRepo<TodoEntity>({
      namespace: "productivity.todos",
    });
    const baseOutbox = createInMemoryRepo<OutboxEntry>({
      namespace: "sync.outbox",
    });
    // Force the outbox put to throw to prove the outer transaction rolls back.
    const sabotagedOutbox = {
      ...baseOutbox,
      async transaction<R>(fn: (tx: typeof baseOutbox) => Promise<R>) {
        return baseOutbox.transaction(async (tx) => {
          await tx.put({
            ...(await firstOutboxRow()),
            id: "trip",
          });
          throw new Error("simulated outbox failure");
          return fn(tx);
        });
      },
    } as typeof baseOutbox;

    async function firstOutboxRow(): Promise<OutboxEntry> {
      return {
        id: "trip",
        entityType: "sync.outbox",
        schemaVersion: 1,
        createdAt: "x",
        updatedAt: "x",
        syncScope: "account-sync",
        commitSeq: 0,
        mutationId: "trip",
        targetEntityType: "productivity.todo",
        targetEntityId: "todo-x",
        op: "put",
        payload: "",
        retryCount: 0,
      };
    }

    await expect(
      enqueueOutboxEntry({
        entityRepo,
        outboxRepo: sabotagedOutbox,
        entity: todoFixture("todo-2"),
        op: "put",
        payload: "ENC",
        mutationId: "mut-2",
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow("simulated outbox failure");

    // Entity rollback: the put inside the outer transaction must NOT
    // survive — that is the same-transaction guarantee G2.6 promises.
    await expect(entityRepo.get("todo-2")).resolves.toBeUndefined();
  });

  it("orders the batch by commitSeq", async () => {
    const entityRepo = createInMemoryRepo<TodoEntity>({
      namespace: "productivity.todos",
    });
    const outboxRepo = createInMemoryRepo<OutboxEntry>({
      namespace: "sync.outbox",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(99);

    await enqueueOutboxEntry({
      entityRepo,
      outboxRepo,
      entity: todoFixture("todo-1"),
      op: "put",
      payload: "ENC1",
      mutationId: "mut-a",
      nextCommitSeq,
    });
    await enqueueOutboxEntry({
      entityRepo,
      outboxRepo,
      entity: todoFixture("todo-2"),
      op: "put",
      payload: "ENC2",
      mutationId: "mut-b",
      nextCommitSeq,
    });
    await enqueueOutboxEntry({
      entityRepo,
      outboxRepo,
      entity: todoFixture("todo-1"),
      op: "delete",
      payload: "ENCdel",
      mutationId: "mut-c",
      nextCommitSeq,
    });

    const batch = await nextOutboxBatch(outboxRepo, { limit: 2 });
    expect(batch.map((row) => row.mutationId)).toEqual(["mut-a", "mut-b"]);
    expect(batch[0].commitSeq).toBe(100);
    expect(batch[1].commitSeq).toBe(101);
  });

  it("supports delete ops and clears the entity inside the outer transaction", async () => {
    const entityRepo = createInMemoryRepo<TodoEntity>({
      namespace: "productivity.todos",
    });
    const outboxRepo = createInMemoryRepo<OutboxEntry>({
      namespace: "sync.outbox",
    });
    const nextCommitSeq = createMockCommitSeqAuthority();
    const entity = todoFixture("todo-1");
    await entityRepo.put(entity);

    const entry = await enqueueOutboxEntry({
      entityRepo,
      outboxRepo,
      entity,
      op: "delete",
      payload: "ENC(del)",
      mutationId: "mut-d",
      nextCommitSeq,
    });
    expect(entry.op).toBe("delete");
    await expect(entityRepo.get("todo-1")).resolves.toBeUndefined();
  });
});
