# repository-v0-contract — Test Plan

## Automated Tests

- Reusable contract tests run against:
  - `createInMemoryRepo`
  - `createSqliteRepo` + `createInMemorySqliteDriver`
- Coverage:
  - CRUD roundtrip
  - metadata and audit fields preserved
  - `list(query?)` filters and explicit stable ordering
  - `listByIndex`
  - transaction rollback
  - migration idempotency
  - syncScope filtering

## Commands

```bash
pnpm --filter @repo/core-data test
pnpm --filter @repo/core-data check-types
rg -n '@repo/plugin-|@tauri-apps/api' packages/core-data/src
```

## Deferred Tests

- Real SQLCipher wrong-key and dump-copy checks are G2.2.
- localStorage inventory and UI migration smoke are G2.3.
- Live Supabase/multi-device sync is G2.6/G9.
