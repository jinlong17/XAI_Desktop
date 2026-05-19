import type { Repo, RepoRecord } from './types';

export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

export interface LocalStorageMigrationOptions<T extends RepoRecord> {
  storage: StorageLike;
  keyPrefix: string;
  repo: Repo<T>;
  parse?: (raw: string, key: string) => T;
  removeAfterMigrate?: boolean;
}

export interface LocalStorageMigrationResult {
  migrated: number;
  skipped: number;
  removed: number;
}

export async function migrateLocalStorageToRepo<T extends RepoRecord>(
  options: LocalStorageMigrationOptions<T>,
): Promise<LocalStorageMigrationResult> {
  const keys = snapshotKeys(options.storage).filter((key) =>
    key.startsWith(options.keyPrefix),
  );
  let migrated = 0;
  let skipped = 0;
  let removed = 0;

  for (const key of keys) {
    const raw = options.storage.getItem(key);
    if (raw === null) {
      skipped += 1;
      continue;
    }

    const record = parseRecord(options, raw, key);
    if (!record.id) {
      skipped += 1;
      continue;
    }

    await options.repo.put(record);
    migrated += 1;

    if (options.removeAfterMigrate) {
      options.storage.removeItem(key);
      removed += 1;
    }
  }

  return { migrated, skipped, removed };
}

function snapshotKeys(storage: StorageLike): string[] {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key !== null) {
      keys.push(key);
    }
  }
  return keys;
}

function parseRecord<T extends RepoRecord>(
  options: LocalStorageMigrationOptions<T>,
  raw: string,
  key: string,
): T {
  if (options.parse) {
    return options.parse(raw, key);
  }
  return JSON.parse(raw) as T;
}
