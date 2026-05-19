# core-data-sqlite-driver — API Contract

## Root Export

`@repo/core-data` exports:

- `createSqliteRepo`
- `migrateLocalStorageToRepo`
- `SQLITE_STATEMENTS`
- SQLite driver/repo/mutation types
- existing Keychain wrappers
- existing in-memory `Repo` testing helper

## Testing Subpath

`@repo/core-data/testing` exports from `src/testing.ts`, including:

- `createInMemoryRepo`
- `createInMemorySqliteDriver`

## Repository Contract

```ts
const repo = createSqliteRepo<T>(driver, {
  namespace: 'todos',
  onMutation: async (mutation, tx) => {
    // future sync_outbox writes use tx
  },
});
```

All records must satisfy `RepoRecord` (`id: string`). Values are stored as JSON behind the SQLite driver boundary.

## Migration Contract

`migrateLocalStorageToRepo({ storage, keyPrefix, repo })` snapshots matching keys, parses each value as JSON by default, and upserts into the repo. Re-running the migration is idempotent because repo writes are upserts. `removeAfterMigrate` removes legacy keys after successful writes.
