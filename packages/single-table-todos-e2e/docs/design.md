# single-table-todos-e2e — Design

Feature #30 is the Phase 0.3 exit slice for a single synced entity: `todos`.

## Implemented Local Core

- `packages/plugin-account/src/todo-sync.ts` owns the todo sync store.
- Local todo mutation writes the todo row and `sync_outbox` row through one
  `SqliteDriver.transaction()` call.
- Outbox rows are encoded as plaintext JSON until `pushBatch()` lazily encrypts
  at flush time through the existing crypto seam.
- The integration test uses the real push engine and the local `/sync/push`
  Edge Function core to verify conditional writes and conflict shadow behavior.

## Boundaries

- Host has no sync logic.
- `@repo/core-data` remains a generic driver boundary.
- `@repo/plugin-account` owns todo sync business logic and tests.

## Deferred

- Hosted Supabase deploy and real two-Mac E2E are blocked by #9.
- Real SQLCipher file dump PoC is blocked on binding `SqliteDriver` to the Rust
  SQLCipher runtime.
- Real menu-bar observation is deferred to the signed/running macOS shell.
