# desktop-local-first-sqlite-foundation - Test Strategy

## Test Goals

Prove that the desktop SQLite foundation is usable as a safe base for later entity rows without regressing browser-safe boundaries.

## Unit Coverage

### Rust

- DB path resolution stays under `app_data_dir()`
- bootstrap creates/opens the live DB deterministically
- SQLCipher keying is applied before bootstrap/schema access
- plain SQLite reads and wrong-key opens fail against the live DB fixture
- migration registry executes in order and is idempotent when already applied
- reopen persistence survives process restarts
- invalid migration/bootstrap states fail with stable error codes
- concrete coverage lives in `commands::database_runtime::tests::*` and `commands::database::tests::*`

### TypeScript

- desktop repo/client surface satisfies the current repository contract truth
- metadata reflects native bootstrap/migration state honestly
- transaction behavior matches the documented guarantees
- malformed JSON / malformed record / bad namespace/id paths fail cleanly
- concrete fixture harness: `packages/core-data/tests/tauri-sqlite.test.ts` fake `invoke` storage

## Contract Coverage

- run the canonical `packages/core-data/tests/repository-contract.ts` expectations against the desktop-backed seam or a faithful test harness for it
- for tauri driver specifically, verify `migrate(plan)` honesty:
  - skip when bootstrap already has `toVersion`
  - `E1300` for unsupported non-native migration plans
  - `E3006` for `fromVersion` mismatch
- verify the docs/runtime surface stays aligned for:
  - bootstrap metadata
  - migration semantics
  - `db_put_batch` atomicity expectations
  - `E1300` / `E1301` / `E1302` handling

## E2E / Regression Scenarios

- first bootstrap on an empty DB path
- second bootstrap on an already-initialized DB path
- migration from an older schema fixture to the current schema
- plain-open and wrong-key negative checks for encrypted DB files
- failed migration/transaction leaves prior durable state intact
- desktop repo changes do not break Web/browser build safety
- desktop app bundle still builds with the foundation enabled

## Mock Strategy

- Rust:
  - temp-directory DB fixtures
  - fixture DBs representing old schema versions
- TypeScript:
  - fake `invoke` seam for command/metadata behavior
  - existing in-memory repo/sqlite helpers from `@repo/core-data/testing`
  - browser-safe import/build checks rather than runtime Tauri execution in Web tests

## Verification Gates

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto database_runtime::tests`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto database::tests`
- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop build`

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | live DB path is host-owned under `app_data_dir()` and not conflated with config/export paths |
| AC-2 | bootstrap/migration is idempotent and reports honest metadata |
| AC-3 | desktop repo/client boundary is typed and contract-honest |
| AC-4 | fixture/test harness exists for both Rust and TypeScript |
| AC-5 | Web/browser build safety is preserved |
| AC-6 | desktop Tauri app bundle builds with the `crypto` feature enabled |
| AC-7 | live DB file rejects plain SQLite reads and wrong-key SQLCipher opens |
