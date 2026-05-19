import type { SqlParams, SqliteDriver, SqlValue } from './sqlite';
import { SQLITE_STATEMENTS } from './sqlite';
import type { Repo, RepoRecord } from './types';

/**
 * In-memory `Repo` implementation for use in unit tests.
 *
 * This is the mock backend other wave-0 rows will depend on.
 * Zero external dependencies; no Tauri, no SQLite, no network.
 *
 * Usage (from a plugin test):
 *   import { createInMemoryRepo } from '@repo/core-data';
 *   const repo = createInMemoryRepo<MyRecord>();
 */
export function createInMemoryRepo<T extends RepoRecord>(): Repo<T> {
  const store = new Map<string, T>();

  return {
    async get(id: string): Promise<T | undefined> {
      return store.get(id);
    },

    async put(record: T): Promise<void> {
      store.set(record.id, record);
    },

    async delete(id: string): Promise<void> {
      store.delete(id);
    },

    async list(): Promise<T[]> {
      return [...store.values()];
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
      return fn(driver);
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
  return sql.replace(/\s+/g, ' ').trim();
}

function asString(value: SqlValue | undefined): string {
  if (typeof value !== 'string') {
    throw new Error('expected string SQL param');
  }
  return value;
}

function asNumber(value: SqlValue | undefined): number {
  if (typeof value !== 'number') {
    throw new Error('expected number SQL param');
  }
  return value;
}
