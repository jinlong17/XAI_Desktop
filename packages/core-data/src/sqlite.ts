import type { Repo, RepoRecord } from './types';

export type SqlValue = string | number | null;
export type SqlParams = readonly SqlValue[];

export interface SqliteDriver {
  execute(sql: string, params?: SqlParams): Promise<void>;
  query<T extends Record<string, unknown>>(sql: string, params?: SqlParams): Promise<T[]>;
  transaction<T>(fn: (tx: SqliteDriver) => Promise<T>): Promise<T>;
}

export type MutationKind = 'put' | 'delete';

export interface RepoMutation<T extends RepoRecord> {
  kind: MutationKind;
  namespace: string;
  id: string;
  record?: T;
}

export type MutationHook<T extends RepoRecord> = (
  mutation: RepoMutation<T>,
  tx: SqliteDriver,
) => Promise<void>;

export interface SqliteRepoOptions<T extends RepoRecord> {
  namespace: string;
  nowMs?: () => number;
  onMutation?: MutationHook<T>;
}

export interface SqliteRepo<T extends RepoRecord> extends Repo<T> {
  init(): Promise<void>;
}

const CREATE_RECORDS_SQL = `
CREATE TABLE IF NOT EXISTS core_data_records (
  namespace TEXT NOT NULL,
  id TEXT NOT NULL,
  json TEXT NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  PRIMARY KEY (namespace, id)
)`;

const UPSERT_RECORD_SQL = `
INSERT INTO core_data_records (namespace, id, json, updated_at_ms)
VALUES (?, ?, ?, ?)
ON CONFLICT(namespace, id) DO UPDATE SET
  json = excluded.json,
  updated_at_ms = excluded.updated_at_ms`;

const SELECT_RECORD_SQL = `
SELECT json FROM core_data_records
WHERE namespace = ? AND id = ?`;

const SELECT_ALL_SQL = `
SELECT json FROM core_data_records
WHERE namespace = ?
ORDER BY id ASC`;

const DELETE_RECORD_SQL = `
DELETE FROM core_data_records
WHERE namespace = ? AND id = ?`;

export function createSqliteRepo<T extends RepoRecord>(
  driver: SqliteDriver,
  options: SqliteRepoOptions<T>,
): SqliteRepo<T> {
  const nowMs = options.nowMs ?? Date.now;

  async function init(): Promise<void> {
    await driver.execute(CREATE_RECORDS_SQL);
  }

  return {
    init,

    async get(id: string): Promise<T | undefined> {
      await init();
      const rows = await driver.query<{ json: string }>(SELECT_RECORD_SQL, [
        options.namespace,
        id,
      ]);
      return rows[0] ? parseRecord<T>(rows[0].json) : undefined;
    },

    async put(record: T): Promise<void> {
      await init();
      await driver.transaction(async (tx) => {
        await tx.execute(UPSERT_RECORD_SQL, [
          options.namespace,
          record.id,
          JSON.stringify(record),
          nowMs(),
        ]);
        await options.onMutation?.(
          {
            kind: 'put',
            namespace: options.namespace,
            id: record.id,
            record,
          },
          tx,
        );
      });
    },

    async delete(id: string): Promise<void> {
      await init();
      await driver.transaction(async (tx) => {
        await tx.execute(DELETE_RECORD_SQL, [options.namespace, id]);
        await options.onMutation?.(
          {
            kind: 'delete',
            namespace: options.namespace,
            id,
          },
          tx,
        );
      });
    },

    async list(): Promise<T[]> {
      await init();
      const rows = await driver.query<{ json: string }>(SELECT_ALL_SQL, [
        options.namespace,
      ]);
      return rows.map((row) => parseRecord<T>(row.json));
    },
  };
}

function parseRecord<T extends RepoRecord>(json: string): T {
  const parsed = JSON.parse(json) as T;
  if (typeof parsed.id !== 'string' || parsed.id.length === 0) {
    throw new Error('E3005: core-data record JSON is missing id');
  }
  return parsed;
}

export const SQLITE_STATEMENTS = {
  createRecords: CREATE_RECORDS_SQL,
  upsertRecord: UPSERT_RECORD_SQL,
  selectRecord: SELECT_RECORD_SQL,
  selectAll: SELECT_ALL_SQL,
  deleteRecord: DELETE_RECORD_SQL,
} as const;
