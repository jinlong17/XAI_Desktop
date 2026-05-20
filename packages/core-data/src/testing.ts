import type { SqlParams, SqliteDriver, SqlValue } from "./sqlite";
import { SQLITE_STATEMENTS } from "./sqlite";
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

/**
 * In-memory `Repo` implementation for use in unit tests. Zero external
 * dependencies; no Tauri, no SQLite, no network.
 */
export interface InMemoryRepoOptions {
  namespace?: string;
  schemaVersion?: number;
  migrationVersion?: number;
  nowIso?: () => string;
}

export function createInMemoryRepo<T extends RepoRecord>(
  options: InMemoryRepoOptions = {},
): Repo<T> {
  const store = new Map<string, T>();
  const namespace = options.namespace ?? "in-memory";
  const schemaVersion = options.schemaVersion ?? 1;
  const nowIso = options.nowIso ?? (() => new Date().toISOString());
  let migrationVersion = options.migrationVersion ?? 0;
  const migrations: MigrationResult[] = [];

  const operations: RepoTransaction<T> = {
    async get(id: string): Promise<T | undefined> {
      return store.get(id);
    },

    async put(record: T): Promise<void> {
      assertRepoRecord(record);
      store.set(record.id, record);
    },

    async delete(id: string): Promise<void> {
      store.delete(id);
    },

    async list(query?: RepoListQuery<T>): Promise<T[]> {
      return applyRepoListQuery(store.values(), query);
    },

    async listByIndex<K extends Extract<keyof T, string>>(
      field: K,
      value: T[K],
      query?: RepoListQuery<T>,
    ): Promise<T[]> {
      return applyRepoIndexQuery(store.values(), field, value, query);
    },

    async metadata(): Promise<RepoMetadata> {
      return {
        driver: "in-memory",
        namespace,
        schemaVersion,
        migrationVersion,
        recordCount: store.size,
        migrations: [...migrations],
      };
    },
  };

  return {
    ...operations,

    async transaction<R>(
      fn: (tx: RepoTransaction<T>) => Promise<R>,
    ): Promise<R> {
      const snapshot = new Map(store);
      try {
        return await fn(operations);
      } catch (error) {
        store.clear();
        for (const [id, record] of snapshot) {
          store.set(id, record);
        }
        throw error;
      }
    },

    async migrate(plan: MigrationPlan<T>): Promise<MigrationResult> {
      if (migrationVersion >= plan.toVersion) {
        return skippedMigrationResult(plan, nowIso);
      }

      assertMigrationPlan(plan, migrationVersion);
      const startedAt = nowIso();

      await this.transaction(async (tx) => {
        for (const step of plan.steps) {
          await step(tx);
        }
      });

      migrationVersion = plan.toVersion;
      const result: MigrationResult = {
        id: plan.id,
        fromVersion: plan.fromVersion,
        toVersion: plan.toVersion,
        startedAt,
        completedAt: nowIso(),
        applied: true,
      };
      migrations.push(result);
      return result;
    },
  };
}

export function createInMemorySqliteDriver(): SqliteDriver {
  const records = new Map<string, StoredRow>();
  const txLog: string[] = [];

  const driver: SqliteDriver = {
    async execute(sql: string, params: SqlParams = []): Promise<void> {
      const normalized = normalizeSql(sql);
      txLog.push(normalized);

      if (normalized === normalizeSql(SQLITE_STATEMENTS.createRecords)) {
        return;
      }

      if (normalized === normalizeSql(SQLITE_STATEMENTS.upsertRecord)) {
        const [namespace, id, json, updatedAtMs] = params;
        records.set(rowKey(asString(namespace), asString(id)), {
          namespace: asString(namespace),
          id: asString(id),
          json: asString(json),
          updatedAtMs: asNumber(updatedAtMs),
        });
        return;
      }

      if (normalized === normalizeSql(SQLITE_STATEMENTS.deleteRecord)) {
        const [namespace, id] = params;
        records.delete(rowKey(asString(namespace), asString(id)));
        return;
      }

      throw new Error(`unsupported test SQL execute: ${normalized}`);
    },

    async query<T extends Record<string, unknown>>(
      sql: string,
      params: SqlParams = [],
    ): Promise<T[]> {
      const normalized = normalizeSql(sql);
      txLog.push(normalized);

      if (normalized === normalizeSql(SQLITE_STATEMENTS.selectRecord)) {
        const [namespace, id] = params;
        const row = records.get(rowKey(asString(namespace), asString(id)));
        return (row ? [{ json: row.json }] : []) as unknown as T[];
      }

      if (normalized === normalizeSql(SQLITE_STATEMENTS.selectAll)) {
        const [namespace] = params;
        return [...records.values()]
          .filter((row) => row.namespace === namespace)
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((row) => ({ json: row.json })) as unknown as T[];
      }

      throw new Error(`unsupported test SQL query: ${normalized}`);
    },

    async transaction<T>(fn: (tx: SqliteDriver) => Promise<T>): Promise<T> {
      const snapshot = new Map(records);
      try {
        return await fn(driver);
      } catch (error) {
        records.clear();
        for (const [id, record] of snapshot) {
          records.set(id, record);
        }
        throw error;
      }
    },
  };

  return driver;
}

interface StoredRow {
  namespace: string;
  id: string;
  json: string;
  updatedAtMs: number;
}

function rowKey(namespace: string, id: string): string {
  return `${namespace}\u0000${id}`;
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

function asString(value: SqlValue | undefined): string {
  if (typeof value !== "string") {
    throw new Error("expected string SQL param");
  }
  return value;
}

function asNumber(value: SqlValue | undefined): number {
  if (typeof value !== "number") {
    throw new Error("expected number SQL param");
  }
  return value;
}
