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

import { applyRepoIndexQuery, applyRepoListQuery, assertRepoRecord } from "./repo-utils";
import type {
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

  async function ensureInit(): Promise<void> {
    if (!initialized) {
      initialized = invoke<DbInitOutput>("db_init", { namespace }).then(
        () => undefined,
      );
    }
    await initialized;
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
        schemaVersion: options.schemaVersion ?? 1,
        migrationVersion: 0,
        recordCount: records.length,
        migrations: [],
      };
    },
  };

  return {
    ...operations,

    /**
     * NOTE: G2.2 PoC scope. Cross-command atomicity will be added when
     * the Tauri command surface gains `db_transaction_begin` and
     * `db_transaction_commit`. The TS surface keeps the contract shape
     * so callers do not need to rewrite when that lands.
     */
    async transaction<R>(
      fn: (tx: RepoTransaction<T>) => Promise<R>,
    ): Promise<R> {
      await ensureInit();
      return fn(operations);
    },

    async migrate(): Promise<never> {
      throw new Error(
        "E1300: tauri-sqlite migrate() not yet wired — use createSqliteRepo in tests or wait for G2.2 follow-up",
      );
    },
  };
}
