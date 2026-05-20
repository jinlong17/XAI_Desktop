# core-data-sqlite-driver — Design Snapshot

## Scope

- Feature: `core-data-sqlite-driver` (#20)
- Package: `@repo/core-data`
- Status: repository abstraction shipped locally; live SQLCipher binding deferred

## Architecture

`@repo/core-data` now exposes a SQLite-shaped driver boundary:

- `SqliteDriver`: `execute`, `query`, and `transaction`.
- `createSqliteRepo`: namespace-scoped JSON record repository backed by SQL statements.
- `MutationHook`: same-transaction hook seam for future outbox writes.
- `migrateLocalStorageToRepo`: idempotent legacy localStorage import.
- `createInMemorySqliteDriver`: `@repo/core-data/testing` driver for plugin unit tests with no Tauri and no other plugin.

The package still imports no `@tauri-apps/api` and no plugin package. Consumers inject the real driver later.

## Data Model

```sql
CREATE TABLE IF NOT EXISTS core_data_records (
  namespace TEXT NOT NULL,
  id TEXT NOT NULL,
  json TEXT NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  PRIMARY KEY (namespace, id)
)
```

This is intentionally generic for Phase 0.3. Entity-specific SQLite tables and encrypted sync outbox expansion are downstream rows.

## Deferred Runtime Binding

- Actual Tauri/Rust SQLCipher driver binding to `SqlCipherDb` from #16.
- SQLite dump PoC proving copied DB files are unreadable without KEK.
- Entity-specific schema/migration set from PRD §6.3.
