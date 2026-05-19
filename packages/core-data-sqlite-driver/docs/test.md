# core-data-sqlite-driver — Test Strategy

## Local Checks

- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/core-data test`
- Red-line grep for import/export of `@tauri-apps/api`, deep `@repo/*/src/internal`, and plugin packages in `packages/core-data/src`.

## Covered Assertions

- SQLite repo CRUD works through the driver boundary.
- List ordering is deterministic by id for the in-memory SQLite test driver.
- Mutation hook fires for put/delete and receives the transaction driver.
- localStorage migration is idempotent across repeated runs.
- Migration can remove legacy keys after successful writes.
- Existing Keychain wrapper and simple in-memory repo tests still pass.

## Deferred Gates

- Real SQLCipher-backed driver integration.
- SQLite dump PoC / copied-file negative test.
- PRD §6.3 entity-specific schema and sync outbox transaction wiring.
