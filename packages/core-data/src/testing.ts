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
