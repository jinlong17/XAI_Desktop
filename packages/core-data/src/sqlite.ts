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

export type SqlValue = string | number | null;
export type SqlParams = readonly SqlValue[];

export interface SqliteDriver {
  execute(sql: string, params?: SqlParams): Promise<void>;
  query<T extends Record<string, unknown>>(
    sql: string,
    params?: SqlParams,
  ): Promise<T[]>;
  transaction<T>(fn: (tx: SqliteDriver) => Promise<T>): Promise<T>;
}

export type MutationKind = "put" | "delete";

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
  driverName?: string;
  schemaVersion?: number;
  migrationVersion?: number;
  nowMs?: () => number;
  nowIso?: () => string;
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
  const driverName = options.driverName ?? "sqlite";
  const schemaVersion = options.schemaVersion ?? 1;
  const nowIso = options.nowIso ?? (() => new Date().toISOString());
  const nowMs = options.nowMs ?? Date.now;
  let migrationVersion = options.migrationVersion ?? 0;
  const migrations: MigrationResult[] = [];
  let initPromise: Promise<void> | undefined;

  async function init(): Promise<void> {
    initPromise ??= driver.execute(CREATE_RECORDS_SQL);
    await initPromise;
  }

  function operationsFor(activeDriver: SqliteDriver): RepoTransaction<T> {
    async function allRecords(): Promise<T[]> {
      const rows = await activeDriver.query<{ json: string }>(SELECT_ALL_SQL, [
        options.namespace,
      ]);
      return rows.map((row) => parseRecord<T>(row.json));
    }

    return {
      async get(id: string): Promise<T | undefined> {
        const rows = await activeDriver.query<{ json: string }>(
          SELECT_RECORD_SQL,
          [options.namespace, id],
        );
        return rows[0] ? parseRecord<T>(rows[0].json) : undefined;
      },

      async put(record: T): Promise<void> {
        assertRepoRecord(record);
        await activeDriver.execute(UPSERT_RECORD_SQL, [
          options.namespace,
          record.id,
          JSON.stringify(record),
          nowMs(),
        ]);
        await options.onMutation?.(
          {
            kind: "put",
            namespace: options.namespace,
            id: record.id,
            record,
          },
          activeDriver,
        );
      },

      async delete(id: string): Promise<void> {
        await activeDriver.execute(DELETE_RECORD_SQL, [options.namespace, id]);
        await options.onMutation?.(
          {
            kind: "delete",
            namespace: options.namespace,
            id,
          },
          activeDriver,
        );
      },

      async list(query?: RepoListQuery<T>): Promise<T[]> {
        return applyRepoListQuery(await allRecords(), query);
      },

      async listByIndex<K extends Extract<keyof T, string>>(
        field: K,
        value: T[K],
        query?: RepoListQuery<T>,
      ): Promise<T[]> {
        return applyRepoIndexQuery(await allRecords(), field, value, query);
      },

      async metadata(): Promise<RepoMetadata> {
        return {
          driver: driverName,
          namespace: options.namespace,
          schemaVersion,
          migrationVersion,
          recordCount: (await allRecords()).length,
          migrations: [...migrations],
        };
      },
    };
  }

  const rootOperations = operationsFor(driver);

  const repo: SqliteRepo<T> = {
    init,

    async get(id: string): Promise<T | undefined> {
      await init();
      return rootOperations.get(id);
    },

    async put(record: T): Promise<void> {
      await init();
      await driver.transaction((tx) => operationsFor(tx).put(record));
    },

    async delete(id: string): Promise<void> {
      await init();
      await driver.transaction((tx) => operationsFor(tx).delete(id));
    },

    async list(query?: RepoListQuery<T>): Promise<T[]> {
      await init();
      return rootOperations.list(query);
    },

    async listByIndex<K extends Extract<keyof T, string>>(
      field: K,
      value: T[K],
      query?: RepoListQuery<T>,
    ): Promise<T[]> {
      await init();
      return rootOperations.listByIndex(field, value, query);
    },

    async metadata(): Promise<RepoMetadata> {
      await init();
      return rootOperations.metadata();
    },

    async transaction<R>(
      fn: (tx: RepoTransaction<T>) => Promise<R>,
    ): Promise<R> {
      await init();
      return driver.transaction((tx) => fn(operationsFor(tx)));
    },

    async migrate(plan: MigrationPlan<T>): Promise<MigrationResult> {
      await init();

      if (migrationVersion >= plan.toVersion) {
        return skippedMigrationResult(plan, nowIso);
      }

      assertMigrationPlan(plan, migrationVersion);
      const startedAt = nowIso();

      await repo.transaction(async (tx) => {
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

  return repo;
}

function parseRecord<T extends RepoRecord>(json: string): T {
  const parsed = JSON.parse(json) as T;
  assertRepoRecord(parsed);
  return parsed;
}

export const SQLITE_STATEMENTS = {
  createRecords: CREATE_RECORDS_SQL,
  upsertRecord: UPSERT_RECORD_SQL,
  selectRecord: SELECT_RECORD_SQL,
  selectAll: SELECT_ALL_SQL,
  deleteRecord: DELETE_RECORD_SQL,
} as const;
