/**
 * Repository v0 sync outbox — G2.6 baseline.
 *
 * The outbox is the single audit-able queue that downstream sync engines
 * read from to push local writes to a remote (Supabase, etc.). Every
 * `account-sync` entity mutation must enqueue an `OutboxEntry` in the
 * **same transaction** as the entity write so a crash between the two
 * cannot leave a record without its outbox row.
 *
 * This module owns:
 *
 * - The `OutboxEntry` record shape (an extension of `RepoRecord`).
 * - `enqueueOutboxEntry` — atomic helper that pairs an entity put with
 *   an outbox put inside a `Repo<T>.transaction(fn)` callback.
 * - `nextOutboxBatch` — drain helper for the sync engine.
 *
 * The actual Supabase / push-edge integration lives in
 * `packages/plugin-account` and is **deferred** until live Supabase
 * provisioning lands (see `xai-v1.deferred-gates.md`).
 */

import { assertRepoRecord } from "./repo-utils";
import type {
  Repo,
  RepoRecord,
  RepoTransaction,
} from "./types";

/** A single pending sync mutation queued for push. */
export interface OutboxEntry extends RepoRecord {
  entityType: "sync.outbox";
  /** Monotonic commit sequence assigned at enqueue time. */
  commitSeq: number;
  /** Deterministic mutation identifier — used for de-duplication on retry. */
  mutationId: string;
  /** Entity slug being mutated, e.g. `productivity.todo`. */
  targetEntityType: string;
  /** Entity id being mutated. */
  targetEntityId: string;
  /** Operation kind. */
  op: "put" | "delete";
  /** Encrypted payload envelope, opaque to the outbox. */
  payload: string;
  /** When the engine last attempted a push. */
  lastAttemptAt?: string;
  /** Retry counter; the engine bounds this. */
  retryCount: number;
  /** Optional revision used by the conditional-write conflict path. */
  baseRevision?: number;
}

export interface EnqueueOutboxInput<T extends RepoRecord> {
  entityRepo: Repo<T>;
  outboxRepo: Repo<OutboxEntry>;
  entity: T;
  op: "put" | "delete";
  payload: string;
  mutationId: string;
  baseRevision?: number;
  nowIso?: () => string;
  nextCommitSeq: () => number;
}

/**
 * Atomically write `entity` and an outbox row. The `entityRepo`
 * transaction wraps both writes so a crash mid-state cannot leave one
 * without the other.
 */
export async function enqueueOutboxEntry<T extends RepoRecord>(
  input: EnqueueOutboxInput<T>,
): Promise<OutboxEntry> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const commitSeq = input.nextCommitSeq();
  if (!Number.isInteger(commitSeq) || commitSeq < 1) {
    throw new Error("E3008: outbox commitSeq must be a positive integer");
  }
  const entry: OutboxEntry = {
    id: `outbox_${input.mutationId}`,
    entityType: "sync.outbox",
    schemaVersion: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    syncScope: "account-sync",
    commitSeq,
    mutationId: input.mutationId,
    targetEntityType: input.entity.entityType,
    targetEntityId: input.entity.id,
    op: input.op,
    payload: input.payload,
    retryCount: 0,
    baseRevision: input.baseRevision,
  };
  assertRepoRecord(entry);

  await input.entityRepo.transaction(async (entityTx: RepoTransaction<T>) => {
    if (input.op === "put") {
      await entityTx.put(input.entity);
    } else {
      await entityTx.delete(input.entity.id);
    }
    // The outbox lives in its own namespace, so we open a nested
    // transaction on the outbox repo to ensure ordering. Driver
    // semantics: the outer (entity) transaction commits last, so a
    // crash between the two phases on a SQLite backend rolls back the
    // entity write via the outer transaction's snapshot.
    await input.outboxRepo.transaction(async (outboxTx) => {
      await outboxTx.put(entry);
    });
  });

  return entry;
}

export interface OutboxBatchOptions {
  limit?: number;
}

/** Return the next batch of outbox entries ordered by `commitSeq`. */
export async function nextOutboxBatch(
  outboxRepo: Repo<OutboxEntry>,
  options: OutboxBatchOptions = {},
): Promise<OutboxEntry[]> {
  return outboxRepo.list({
    entityType: "sync.outbox",
    orderBy: { field: "commitSeq", direction: "asc" },
    limit: options.limit,
  });
}

/**
 * Monotonic in-process commit-seq allocator. Production code must use
 * the Rust-side commit-seq authority; this helper is for tests, mocks,
 * and the local-only fallback path.
 */
export function createMockCommitSeqAuthority(initial = 0) {
  let value = initial;
  return () => {
    value += 1;
    return value;
  };
}
