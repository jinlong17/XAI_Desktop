/** Device-local records never enter remote sync. */
export type SyncScope = "device-local" | "account-sync";

export type RepoSortDirection = "asc" | "desc";
export type RepoIndexKey<T extends RepoRecord> = Extract<keyof T, string>;

/**
 * Base record shape every Repository v0 entry must satisfy.
 *
 * `entityType` uses the `plugin.entity` naming form, for example
 * `organizer.grid` or `productivity.todo`.
 */
export interface RepoRecord {
  id: string;
  entityType: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  syncScope: SyncScope;
}

export interface RepoOrderBy<T extends RepoRecord = RepoRecord> {
  field: RepoIndexKey<T>;
  direction?: RepoSortDirection;
}

export interface RepoListQuery<T extends RepoRecord = RepoRecord> {
  entityType?: string;
  syncScope?: SyncScope;
  orderBy?: RepoOrderBy<T>;
  limit?: number;
}

export interface RepoMetadata {
  driver: string;
  namespace: string;
  schemaVersion: number;
  migrationVersion: number;
  recordCount: number;
  migrations: readonly MigrationResult[];
}

export interface MigrationResult {
  id: string;
  fromVersion: number;
  toVersion: number;
  startedAt: string;
  completedAt: string;
  applied: boolean;
}

export type MigrationStep<T extends RepoRecord> = (
  tx: RepoTransaction<T>,
) => Promise<void>;

export interface MigrationPlan<T extends RepoRecord = RepoRecord> {
  id: string;
  fromVersion: number;
  toVersion: number;
  steps: readonly MigrationStep<T>[];
}

export interface RepoOperations<T extends RepoRecord> {
  get(id: string): Promise<T | undefined>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(query?: RepoListQuery<T>): Promise<T[]>;
  listByIndex<K extends RepoIndexKey<T>>(
    field: K,
    value: T[K],
    query?: RepoListQuery<T>,
  ): Promise<T[]>;
  metadata(): Promise<RepoMetadata>;
}

export interface RepoTransaction<T extends RepoRecord>
  extends RepoOperations<T> {}

export interface Repo<T extends RepoRecord> extends RepoOperations<T> {
  transaction<R>(fn: (tx: RepoTransaction<T>) => Promise<R>): Promise<R>;
  migrate(plan: MigrationPlan<T>): Promise<MigrationResult>;
}
