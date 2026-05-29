/**
 * Repository v0 sync outbox — G2.6 baseline.
 *
 * The outbox is the single audit-able queue that downstream sync engines
 * read from to push local writes to a remote (Supabase, etc.). Every
 * `account-sync` entity mutation must enqueue an `OutboxEntry` in the
 * **same transaction** as the entity write so a crash between the two
 * cannot leave a record without its outbox row.
 *
 * Atomicity model (G2.6 P0 fix):
 *
 * The entity row and its outbox row share the SAME repo namespace. The
 * outbox row's id is prefixed with `OUTBOX_ID_PREFIX` (`__outbox__`).
 * Because both rows live in one namespace, `Repo<T>.transaction(fn)`
 * commits them atomically:
 *
 * - `createInMemoryRepo` → snapshot-restoring transaction.
 * - `createSqliteRepo` (in-process SQLite driver) → `BEGIN`/`COMMIT` on
 *   the driver.
 * - `createTauriRepo` (production / on-disk SQLite) → buffered batch
 *   committed via the `db_put_batch` Tauri command, which wraps the
 *   batch in one SQLite transaction on the Rust side.
 *
 * This module owns:
 *
 * - The `OutboxEntry` record shape (an extension of `RepoRecord`).
 * - `enqueueOutboxEntry` — atomic helper that pairs an entity put/delete
 *   with an outbox put inside a single `Repo.transaction(fn)` callback.
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

/**
 * Reserved id prefix that marks a row as a sync-outbox row inside a
 * shared entity namespace. Application code must NEVER mint an entity
 * with this prefix as its id.
 */
export const OUTBOX_ID_PREFIX = "__outbox__";

/** Convert a mutationId into the outbox row's id. */
export function outboxIdFor(mutationId: string): string {
  return `${OUTBOX_ID_PREFIX}${mutationId}`;
}

/** True if the given record id is reserved for an outbox row. */
export function isOutboxId(id: string): boolean {
  return id.startsWith(OUTBOX_ID_PREFIX);
}

export const OUTBOX_QUEUE_STATUSES = [
  "queued",
  "replay_deferred",
  "retryable_failure",
  "conflict",
  "rollback_pending",
  "rolled_back",
] as const;

export type OutboxQueueStatus = (typeof OUTBOX_QUEUE_STATUSES)[number];

export interface OutboxRollbackSafety {
  /**
   * Entity `updatedAt` expected when rollback is attempted. Rollback code
   * must verify this before applying a destructive change.
   */
  expectedEntityUpdatedAt: string;
  /**
   * Serialized previous entity snapshot for rollback restore when needed.
   * Undefined means no snapshot is available.
   */
  previousEntityPayload?: string;
  /** True when a previous entity existed before this mutation. */
  previousEntityExisted: boolean;
}

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
  /** Local queue state (row #13). */
  queueStatus: OutboxQueueStatus;
  /** Boundary key owning this queued mutation (account/user/session scope). */
  boundaryKey: string;
  /** Monotonic local revision used for rollback/replay ordering. */
  localRevision: number;
  /** Last status transition timestamp. */
  statusUpdatedAt: string;
  /** Last local failure marker (never implies remote acknowledgement). */
  lastFailureCode?: string;
  lastFailureMessage?: string;
  lastFailureAt?: string;
  /** Conflict marker timestamp for explicit conflict visibility. */
  conflictAt?: string;
  /** Rollback audit markers. */
  rollbackRequestedAt?: string;
  rollbackReason?: string;
  rollbackAppliedAt?: string;
  rollbackSafety?: OutboxRollbackSafety;
}

/**
 * `enqueueOutboxEntry` takes ONE repo. The entity row and the outbox row
 * share its namespace; the outbox row uses the reserved id prefix
 * `OUTBOX_ID_PREFIX` so it cannot collide with an entity id.
 *
 * Backwards-compatibility note: the historical signature carried both
 * `entityRepo` and `outboxRepo`. Inline migration callers wired both to
 * the same repo while we land the SQLite atomic path; we now accept
 * either shape. When `outboxRepo` is provided, it must be the same
 * `Repo` instance as `entityRepo` — passing two different repos throws
 * because the underlying drivers cannot commit two namespaces atomically.
 */
export interface EnqueueOutboxInput<T extends RepoRecord> {
  /**
   * Repo whose namespace will hold BOTH the entity row and its outbox
   * row. Required.
   */
  entityRepo: Repo<T | OutboxEntry>;
  /**
   * Deprecated: present for source compatibility with the prior
   * dual-namespace shape. If supplied, MUST be the same `Repo` instance
   * as `entityRepo`. Two separate repos cannot be committed atomically
   * against the on-disk SQLite driver and are rejected at runtime.
   */
  outboxRepo?: Repo<T | OutboxEntry>;
  entity: T;
  op: "put" | "delete";
  payload: string;
  mutationId: string;
  baseRevision?: number;
  boundaryKey?: string;
  queueStatus?: OutboxQueueStatus;
  localRevision?: number;
  rollbackSafety?: OutboxRollbackSafety;
  nowIso?: () => string;
  nextCommitSeq: () => number;
}

/**
 * Atomically write `entity` and an outbox row inside a single
 * `Repo.transaction(fn)` call. The transaction guarantees that either
 * both rows are committed or neither — see the module-level header for
 * the per-driver atomicity model.
 */
export async function enqueueOutboxEntry<T extends RepoRecord>(
  input: EnqueueOutboxInput<T>,
): Promise<OutboxEntry> {
  if (input.outboxRepo !== undefined && input.outboxRepo !== input.entityRepo) {
    throw new Error(
      "E3009: enqueueOutboxEntry requires the entity repo and outbox repo to be the same Repo instance — split namespaces cannot commit atomically",
    );
  }
  if (isOutboxId(input.entity.id)) {
    throw new Error(
      `E3010: entity id ${input.entity.id} collides with the reserved outbox prefix \`${OUTBOX_ID_PREFIX}\``,
    );
  }

  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const commitSeq = input.nextCommitSeq();
  if (!Number.isInteger(commitSeq) || commitSeq < 1) {
    throw new Error("E3008: outbox commitSeq must be a positive integer");
  }
  const queueStatus = input.queueStatus ?? "replay_deferred";
  if (!OUTBOX_QUEUE_STATUSES.includes(queueStatus)) {
    throw new Error(`E3011: unsupported outbox queueStatus "${queueStatus}"`);
  }
  const localRevision = input.localRevision ?? commitSeq;
  if (!Number.isInteger(localRevision) || localRevision < 1) {
    throw new Error("E3012: outbox localRevision must be a positive integer");
  }
  const boundaryKey = input.boundaryKey?.trim() || "local-session";
  if (input.rollbackSafety) {
    const expected = input.rollbackSafety.expectedEntityUpdatedAt?.trim() ?? "";
    if (expected.length === 0) {
      throw new Error("E3013: rollbackSafety.expectedEntityUpdatedAt is required");
    }
  }
  const entry: OutboxEntry = {
    id: outboxIdFor(input.mutationId),
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
    queueStatus,
    boundaryKey,
    localRevision,
    statusUpdatedAt: nowIso(),
    rollbackSafety: input.rollbackSafety,
  };
  assertRepoRecord(entry);

  await input.entityRepo.transaction(async (tx: RepoTransaction<T | OutboxEntry>) => {
    if (input.op === "put") {
      await tx.put(input.entity);
    } else {
      await tx.delete(input.entity.id);
    }
    await tx.put(entry);
  });

  return entry;
}

export interface OutboxBatchOptions {
  limit?: number;
}

/**
 * Return the next batch of outbox entries ordered by `commitSeq`. The
 * caller passes the shared entity/outbox repo; this helper filters by
 * `entityType === "sync.outbox"` so non-outbox rows in the same
 * namespace are ignored.
 *
 * The repo is typed as `Repo<OutboxEntry>` because the caller is
 * narrowing to the outbox view — pass the shared repo cast through
 * `as unknown as Repo<OutboxEntry>` when reading from a heterogeneous
 * namespace.
 */
export async function nextOutboxBatch(
  repo: Repo<OutboxEntry>,
  options: OutboxBatchOptions = {},
): Promise<OutboxEntry[]> {
  const rows = await repo.list({
    entityType: "sync.outbox",
    orderBy: { field: "commitSeq", direction: "asc" },
    limit: options.limit,
  });
  return rows.filter((row) => isOutboxId(row.id));
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
