/**
 * Abstract async CRUD interface seam.
 *
 * Implementations:
 *   - `createInMemoryRepo()` in testing.ts — used in unit tests (no external deps)
 *   - SQLCipher driver — deferred to a later sync wave
 *
 * Depends only on @repo/core (red line #8). Never import @repo/plugin-*.
 */

/** Base record shape every Repo entry must satisfy. */
export interface RepoRecord {
  id: string;
}

/**
 * Async CRUD interface for plugin data stores.
 * All operations are keyed by `record.id` (string).
 */
export interface Repo<T extends RepoRecord> {
  /** Retrieve a record by id. Returns undefined if not found. */
  get(id: string): Promise<T | undefined>;

  /** Insert or replace a record. */
  put(record: T): Promise<void>;

  /** Delete a record by id. No-op if not found. */
  delete(id: string): Promise<void>;

  /** List all records. Order is implementation-defined. */
  list(): Promise<T[]>;
}
