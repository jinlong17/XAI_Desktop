# repository-v0-contract — API

## Public Exports

`@repo/core-data` exports:

- `Repo`
- `RepoRecord`
- `RepoTransaction`
- `RepoListQuery`
- `RepoMetadata`
- `MigrationPlan`
- `MigrationResult`
- `SyncScope`
- `createInMemoryRepo`
- `createSqliteRepo`

## Repository v0

```ts
interface Repo<T extends RepoRecord> {
  get(id: string): Promise<T | undefined>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(query?: RepoListQuery<T>): Promise<T[]>;
  listByIndex<K extends Extract<keyof T, string>>(
    field: K,
    value: T[K],
    query?: RepoListQuery<T>,
  ): Promise<T[]>;
  transaction<R>(fn: (tx: RepoTransaction<T>) => Promise<R>): Promise<R>;
  migrate(plan: MigrationPlan<T>): Promise<MigrationResult>;
  metadata(): Promise<RepoMetadata>;
}
```

## Error Semantics

- Invalid record metadata throws `E3005`.
- Invalid migration order throws `E3006`.
- Unsupported SQL in the in-memory SQLite test driver throws a test-driver error and is not a production code.

## Compatibility

Existing callers using `get`, `put`, `delete`, and `list()` continue to work after they provide Repository v0 metadata on records. Downstream drivers must implement the full interface before being marked G2 complete.
