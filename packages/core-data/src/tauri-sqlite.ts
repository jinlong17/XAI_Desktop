/**
 * Tauri-backed `SqliteDriver` factory.
 *
 * Wraps the Tauri `db_*` commands declared in
 * `apps/desktop/src-tauri/src/commands/database.rs` and exposes a
 * `SqliteDriver`-shaped object plus a thin `createTauriRepo()` helper
 * that returns a Repository v0-compatible API per namespace.
 *
 * Red line #4: this module NEVER imports `@tauri-apps/api` directly.
 * The caller must pass an `invoke` function obtained from
 * `useTauriInvoke()` (`@repo/core/hooks`).
 *
 * The PoC keeps a single shared connection on the Rust side; multiple
 * TS callers can reuse the returned driver safely.
 */

import {
  applyRepoIndexQuery,
  applyRepoListQuery,
  assertMigrationPlan,
  assertRepoRecord,
  skippedMigrationResult,
} from "./repo-utils";
import type {
  MigrationPlan,
  MigrationResult,
  Repo,
  RepoListQuery,
  RepoMetadata,
  RepoRecord,
  RepoTransaction,
} from "./types";

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

export interface CreateTauriRepoOptions {
  namespace: string;
  schemaVersion?: number;
  nowMs?: () => number;
}

export interface DbInitOutput {
  namespace: string;
  path: string;
  schemaVersion: number;
  migrationVersion: number;
  migrations: DbInitMigration[];
  appliedMigrations: DbInitMigration[];
}

export interface DbInitMigration {
  id: string;
  fromVersion: number;
  toVersion: number;
  startedAtMs: number;
  completedAtMs: number;
  applied: boolean;
}

/**
 * Initialize the Repository v0 SQLite database. Idempotent.
 *
 * Returns the namespace plus the resolved absolute path of the database
 * file so the caller can surface it in diagnostic UIs.
 */
export async function dbInit(
  invoke: InvokeFn,
  namespace: string,
): Promise<DbInitOutput> {
  return invoke<DbInitOutput>("db_init", { namespace });
}

/**
 * Create a Repository v0-compatible API bound to the Tauri SQLite
 * driver for a single namespace.
 *
 * The repo lazily calls `db_init` on its first operation. Subsequent
 * operations reuse the open connection.
 */
export function createTauriRepo<T extends RepoRecord>(
  invoke: InvokeFn,
  options: CreateTauriRepoOptions,
): Repo<T> {
  const { namespace } = options;
  const nowMs = options.nowMs ?? Date.now;
  let initialized: Promise<void> | undefined;
  let bootstrap: DbInitOutput | undefined;

  async function ensureInit(): Promise<void> {
    if (!initialized) {
      initialized = dbInit(invoke, namespace).then((result) => {
        bootstrap = result;
      });
    }
    await initialized;
  }

  function currentMigrationVersion(): number {
    return bootstrap?.migrationVersion ?? 0;
  }

  async function listAll(): Promise<T[]> {
    await ensureInit();
    const rows = await invoke<string[]>("db_list", {
      input: { namespace },
    });
    return rows.map((json) => {
      const parsed = JSON.parse(json) as T;
      assertRepoRecord(parsed);
      return parsed;
    });
  }

  const operations: RepoTransaction<T> = {
    async get(id: string): Promise<T | undefined> {
      await ensureInit();
      const raw = await invoke<string | null>("db_get", {
        input: { namespace, id },
      });
      if (raw == null) return undefined;
      const parsed = JSON.parse(raw) as T;
      assertRepoRecord(parsed);
      return parsed;
    },

    async put(record: T): Promise<void> {
      assertRepoRecord(record);
      await ensureInit();
      await invoke<void>("db_put", {
        input: {
          namespace,
          id: record.id,
          json: JSON.stringify(record),
          updatedAtMs: nowMs(),
        },
      });
    },

    async delete(id: string): Promise<void> {
      await ensureInit();
      await invoke<void>("db_delete", {
        input: { namespace, id },
      });
    },

    async list(query?: RepoListQuery<T>): Promise<T[]> {
      return applyRepoListQuery(await listAll(), query);
    },

    async listByIndex<K extends Extract<keyof T, string>>(
      field: K,
      value: T[K],
      query?: RepoListQuery<T>,
    ): Promise<T[]> {
      return applyRepoIndexQuery(await listAll(), field, value, query);
    },

    async metadata(): Promise<RepoMetadata> {
      const records = await listAll();
      return {
        driver: "tauri-sqlite",
        namespace,
        schemaVersion: bootstrap?.schemaVersion ?? options.schemaVersion ?? 1,
        migrationVersion: currentMigrationVersion(),
        recordCount: records.length,
        migrations: (bootstrap?.migrations ?? []).map(toMigrationResult),
      };
    },
  };

  return {
    ...operations,

    /**
     * Atomic transaction (G2.6 P0 fix).
     *
     * Writes (`put` / `delete`) inside the callback are buffered in a
     * TS-side queue and committed as ONE `db_put_batch` call at the end
     * of the callback. The Rust side wraps the batch in a SQLite
     * `BEGIN`/`COMMIT`, so a partial failure inside the batch — or a
     * throw from `fn` before the commit — leaves the database untouched.
     *
     * Reads (`get` / `list` / `listByIndex` / `metadata`) inside the
     * callback observe the pre-transaction state of the database; they
     * do NOT see uncommitted writes from the same transaction. Callers
     * who need read-after-write inside a transaction must keep their
     * in-flight state in JS until commit.
     */
    async transaction<R>(
      fn: (tx: RepoTransaction<T>) => Promise<R>,
    ): Promise<R> {
      await ensureInit();

      interface PendingPut<U extends RepoRecord> {
        op: "put";
        id: string;
        json: string;
        updatedAtMs: number;
        record: U;
      }
      interface PendingDelete {
        op: "delete";
        id: string;
      }
      type PendingEntry = PendingPut<T> | PendingDelete;

      const pending: PendingEntry[] = [];

      const txOps: RepoTransaction<T> = {
        async get(id: string): Promise<T | undefined> {
          return operations.get(id);
        },
        async put(record: T): Promise<void> {
          assertRepoRecord(record);
          pending.push({
            op: "put",
            id: record.id,
            json: JSON.stringify(record),
            updatedAtMs: nowMs(),
            record,
          });
        },
        async delete(id: string): Promise<void> {
          pending.push({ op: "delete", id });
        },
        list: operations.list,
        listByIndex: operations.listByIndex,
        metadata: operations.metadata,
      };

      // If `fn` throws we propagate without sending anything to Rust:
      // the database is untouched, matching the same-transaction
      // rollback contract.
      const result = await fn(txOps);

      if (pending.length === 0) {
        return result;
      }

      await invoke<void>("db_put_batch", {
        input: {
          namespace,
          entries: pending.map((entry) =>
            entry.op === "put"
              ? {
                  op: "put",
                  id: entry.id,
                  json: entry.json,
                  updatedAtMs: entry.updatedAtMs,
                }
              : { op: "delete", id: entry.id },
          ),
        },
      });

      return result;
    },

    async migrate(plan: MigrationPlan<T>): Promise<MigrationResult> {
      await ensureInit();
      const current = currentMigrationVersion();

      if (current >= plan.toVersion) {
        return skippedMigrationResult(plan, () => new Date().toISOString());
      }

      assertMigrationPlan(plan, current);
      throw new Error(
        "E1300: tauri-sqlite migrate(plan) is unsupported for host-owned runtime migrations; use native db_init registry migrations",
      );
    },
  };
}

function toMigrationResult(input: DbInitMigration): MigrationResult {
  return {
    id: input.id,
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    startedAt: new Date(input.startedAtMs).toISOString(),
    completedAt: new Date(input.completedAtMs).toISOString(),
    applied: input.applied,
  };
}
