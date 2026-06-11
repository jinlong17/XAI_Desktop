import { describe, expect, it } from "vitest";

import {
  createMockCommitSeqAuthority,
  enqueueOutboxEntry,
  isOutboxId,
  nextOutboxBatch,
  OUTBOX_ID_PREFIX,
  outboxIdFor,
  type OutboxEntry,
} from "../src/sync-outbox";
import { createSqliteRepo } from "../src/sqlite";
import {
  createInMemoryRepo,
  createInMemorySqliteDriver,
} from "../src/testing";
import type { TodoEntity } from "../src/entities";
import type { Repo, RepoRecord } from "../src/types";

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

/** Heterogeneous repo holding both entity rows and outbox rows. */
type SharedRepo = Repo<TodoEntity | OutboxEntry>;

function asOutboxView(repo: SharedRepo): Repo<OutboxEntry> {
  return repo as unknown as Repo<OutboxEntry>;
}

describe("enqueueOutboxEntry", () => {
  it("writes the entity and its outbox row in the same transaction", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    const nextCommitSeq = createMockCommitSeqAuthority();

    const entry = await enqueueOutboxEntry({
      entityRepo: repo,
      entity: todoFixture("todo-1", { title: "first" }),
      op: "put",
      payload: "ENC(first)",
      mutationId: "mut-1",
      nextCommitSeq,
      nowIso: () => "2026-05-20T00:01:00.000Z",
    });

    expect(entry).toMatchObject({
      id: outboxIdFor("mut-1"),
      commitSeq: 1,
      targetEntityType: "productivity.todo",
      targetEntityId: "todo-1",
      op: "put",
      queueStatus: "replay_deferred",
      boundaryKey: "local-session",
      localRevision: 1,
    });
    expect(isOutboxId(entry.id)).toBe(true);
    expect(entry.id.startsWith(OUTBOX_ID_PREFIX)).toBe(true);

    const todo = (await repo.get("todo-1")) as TodoEntity | undefined;
    expect(todo).toMatchObject({ id: "todo-1", title: "first" });

    const outbox = await nextOutboxBatch(asOutboxView(repo));
    expect(outbox).toHaveLength(1);
    expect(outbox[0]).toEqual(entry);
  });

  it("rolls back the entity write when the transaction throws (in-memory)", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    // Sabotage: wrap transaction so the fn runs but the commit boundary
    // ultimately throws — the snapshot-restore must undo the entity put.
    const sabotagedRepo: SharedRepo = {
      ...repo,
      async transaction<R>(
        fn: (tx: Parameters<typeof repo.transaction>[0] extends (tx: infer X) => unknown ? X : never) => Promise<R>,
      ) {
        return repo.transaction(async (tx) => {
          await fn(tx as never);
          throw new Error("simulated commit failure");
        });
      },
    } as SharedRepo;

    await expect(
      enqueueOutboxEntry({
        entityRepo: sabotagedRepo,
        entity: todoFixture("todo-2"),
        op: "put",
        payload: "ENC",
        mutationId: "mut-2",
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow("simulated commit failure");

    // Both rows must be rolled back — the same-transaction guarantee.
    await expect(repo.get("todo-2")).resolves.toBeUndefined();
    await expect(repo.get(outboxIdFor("mut-2"))).resolves.toBeUndefined();
  });

  it("rolls back the entity write on the in-process SQLite driver path", async () => {
    // Real SQLite (in-memory driver). Sabotage forces the outer
    // transaction to throw AFTER the entity has been written inside the
    // BEGIN, proving the SQLite driver actually issues a ROLLBACK.
    const driver = createInMemorySqliteDriver();
    const baseRepo = createSqliteRepo<TodoEntity | OutboxEntry>(driver, {
      namespace: "productivity.todos",
    });

    const sabotagedRepo: SharedRepo = {
      ...baseRepo,
      async transaction<R>(fn: (tx: never) => Promise<R>) {
        return baseRepo.transaction(async (tx) => {
          await fn(tx as never);
          throw new Error("simulated sqlite commit failure");
        });
      },
    } as SharedRepo;

    await expect(
      enqueueOutboxEntry({
        entityRepo: sabotagedRepo,
        entity: todoFixture("todo-sqlite"),
        op: "put",
        payload: "ENC",
        mutationId: "mut-sqlite",
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow("simulated sqlite commit failure");

    // Entity AND outbox row must NOT survive in the SQLite store.
    await expect(baseRepo.get("todo-sqlite")).resolves.toBeUndefined();
    await expect(
      baseRepo.get(outboxIdFor("mut-sqlite")),
    ).resolves.toBeUndefined();
  });

  it("rejects an entity whose id collides with the reserved outbox prefix", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    await expect(
      enqueueOutboxEntry({
        entityRepo: repo,
        entity: todoFixture(`${OUTBOX_ID_PREFIX}sneaky`),
        op: "put",
        payload: "ENC",
        mutationId: "mut-x",
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow(/E3010/);
  });

  it("rejects a split entityRepo / outboxRepo pair (cannot commit atomically)", async () => {
    const repoA = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    const repoB = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "sync.outbox",
    });
    await expect(
      enqueueOutboxEntry({
        entityRepo: repoA,
        outboxRepo: repoB,
        entity: todoFixture("todo-split"),
        op: "put",
        payload: "ENC",
        mutationId: "mut-split",
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow(/E3009/);
  });

  it("rejects unsupported queue status", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    await expect(
      enqueueOutboxEntry({
        entityRepo: repo,
        entity: todoFixture("todo-invalid-status"),
        op: "put",
        payload: "ENC",
        mutationId: "mut-invalid-status",
        queueStatus: "invalid" as never,
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow(/E3011/);
  });

  it("rejects invalid local revision", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    await expect(
      enqueueOutboxEntry({
        entityRepo: repo,
        entity: todoFixture("todo-invalid-local-rev"),
        op: "put",
        payload: "ENC",
        mutationId: "mut-invalid-local-rev",
        localRevision: 0,
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow(/E3012/);
  });

  it("requires rollback safety expectedEntityUpdatedAt when rollbackSafety is provided", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    await expect(
      enqueueOutboxEntry({
        entityRepo: repo,
        entity: todoFixture("todo-invalid-rollback"),
        op: "put",
        payload: "ENC",
        mutationId: "mut-invalid-rollback",
        rollbackSafety: {
          expectedEntityUpdatedAt: " ",
          previousEntityExisted: false,
        },
        nextCommitSeq: createMockCommitSeqAuthority(),
      }),
    ).rejects.toThrow(/E3013/);
  });

  it("orders the batch by commitSeq", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    const nextCommitSeq = createMockCommitSeqAuthority(99);

    await enqueueOutboxEntry({
      entityRepo: repo,
      entity: todoFixture("todo-1"),
      op: "put",
      payload: "ENC1",
      mutationId: "mut-a",
      nextCommitSeq,
    });
    await enqueueOutboxEntry({
      entityRepo: repo,
      entity: todoFixture("todo-2"),
      op: "put",
      payload: "ENC2",
      mutationId: "mut-b",
      nextCommitSeq,
    });
    await enqueueOutboxEntry({
      entityRepo: repo,
      entity: todoFixture("todo-1"),
      op: "delete",
      payload: "ENCdel",
      mutationId: "mut-c",
      nextCommitSeq,
    });

    const batch = await nextOutboxBatch(asOutboxView(repo), { limit: 2 });
    expect(batch.map((row) => row.mutationId)).toEqual(["mut-a", "mut-b"]);
    expect(batch[0].commitSeq).toBe(100);
    expect(batch[1].commitSeq).toBe(101);
  });

  it("supports delete ops and clears the entity inside the same transaction", async () => {
    const repo = createInMemoryRepo<TodoEntity | OutboxEntry>({
      namespace: "productivity.todos",
    });
    const nextCommitSeq = createMockCommitSeqAuthority();
    const entity = todoFixture("todo-1");
    await repo.put(entity);

    const entry = await enqueueOutboxEntry({
      entityRepo: repo,
      entity,
      op: "delete",
      payload: "ENC(del)",
      mutationId: "mut-d",
      queueStatus: "queued",
      boundaryKey: "user-a",
      localRevision: 44,
      rollbackSafety: {
        expectedEntityUpdatedAt: entity.updatedAt,
        previousEntityExisted: true,
        previousEntityPayload: JSON.stringify(entity),
      },
      nextCommitSeq,
    });
    expect(entry.op).toBe("delete");
    expect(entry.queueStatus).toBe("queued");
    expect(entry.boundaryKey).toBe("user-a");
    expect(entry.localRevision).toBe(44);
    expect(entry.rollbackSafety?.previousEntityExisted).toBe(true);
    await expect(repo.get("todo-1")).resolves.toBeUndefined();
  });
});

describe("isOutboxId / outboxIdFor", () => {
  it("round-trips a mutation id through the outbox prefix", () => {
    const id = outboxIdFor("abc");
    expect(id).toBe(`${OUTBOX_ID_PREFIX}abc`);
    expect(isOutboxId(id)).toBe(true);
    expect(isOutboxId("abc")).toBe(false);
  });

  it("classifies non-outbox repo records as non-outbox", () => {
    const record: RepoRecord = {
      id: "todo-1",
      entityType: "productivity.todo",
      schemaVersion: 1,
      createdAt: "x",
      updatedAt: "x",
      syncScope: "account-sync",
    };
    expect(isOutboxId(record.id)).toBe(false);
  });
});
