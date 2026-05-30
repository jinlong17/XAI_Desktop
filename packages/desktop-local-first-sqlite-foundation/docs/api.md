# desktop-local-first-sqlite-foundation - API

## Scope

This row defines the desktop SQLite foundation contracts only. It does not add business-entity repositories or browser import flows.

## Upstream Interfaces

| Surface | Role |
|---|---|
| `docs/adr/0012-phase3-local-first-storage.md` | Governing authority for storage engine, live-path ownership, seam ownership, and deferrals |
| `packages/core-data/src/types.ts` | Canonical `Repo<T>`, `RepoRecord`, `RepoTransaction<T>`, `MigrationPlan`, `MigrationResult`, `RepoMetadata`, `SyncScope` contracts |
| `apps/desktop/src-tauri/src/error.rs` | Tauri command error code owner for `E1300` / `E1301` / `E1302` |

## Downstream Consumers

| Consumer | Expected use |
|---|---|
| `desktop-local-first-repository-bridge` | build entity repositories on top of the hardened foundation seam |
| `desktop-local-first-web-data-migration` | bootstrap/import into the live DB without owning the live store |
| `desktop-local-first-offline-edit-queue` | durable queue state on the same SQLite plane |
| `desktop-local-first-sync-reconnect` | reconnect/replay over the same typed repo + durability seam |

## Native Command Contract Assumptions

The current `db_*` family remains the likely host boundary. Build must keep command handlers generic and host-owned.

### Bootstrap / init

`db_init`

- input:
  - `namespace: string`
- behavior:
  - idempotent bootstrap
  - resolves the live DB path under `app_data_dir()`
  - creates/opens the SQLCipher DB
  - loads or creates the device-local database KEK in macOS Keychain
  - derives the DB key with the `xai.sqlite.v1` KDF domain separator
  - applies SQLCipher key material before any schema read/write
  - applies required schema bootstrap/migrations
- expected output shape:
  - `namespace: string`
  - `path: string`
  - `schemaVersion: number`
  - `migrationVersion: number`
  - `migrations: Array<{ id, fromVersion, toVersion, startedAtMs, completedAtMs, applied }>`
  - `appliedMigrations: Array<{ id, fromVersion, toVersion, startedAtMs, completedAtMs, applied }>`

### Record operations

`db_get`, `db_put`, `db_delete`, `db_list`, `db_put_batch`

- remain generic record/namespace operations
- must stay free of business-entity semantics
- `db_put_batch` remains the atomic write primitive for future same-transaction entity + outbox work

## Shared TypeScript Boundary Assumptions

The desktop TS client/driver should remain in `@repo/core-data`.

### Required behavior

- consume an injected `invoke` seam rather than importing Tauri directly
- expose a `Repo<T>`-compatible surface only where the implementation is honest
- surface metadata that matches native bootstrap reality
- keep desktop-only helpers out of browser business code paths

### Likely package surfaces

- existing root exports may be hardened
- explicit desktop-only subpath export: `@repo/core-data/desktop`
- do not create a second repository contract package

## Error Semantics

| Code | Meaning | Expected handling |
|---|---|---|
| `E1300` | database bootstrap contract/initialization failure (`db_init` missing, migration registry mismatch, or unsupported custom migrate plan on tauri client) | caller treats as setup/runtime contract failure, not recoverable business validation |
| `E1301` | invalid namespace/id/input payload | caller bug or malformed input; fail fast |
| `E1302` | backend FS/SQLite/open/migration error | surface diagnostically; do not mask as success |
| `E3011` | database key generation/derivation or invalid stored KEK material | surface as sync crypto failure; do not fall back to plaintext |

Build may refine the exact wording, but the docs/runtime surface must stay aligned.

## Permission and Boundary Notes

- only the desktop host may own Tauri command registration and native file access
- Web/runtime packages must not gain direct Tauri imports
- plugin/business code must consume typed seams from shared packages, not host internals

## Idempotency Notes

- bootstrap/init must be idempotent
- bootstrap/init must fail closed if the Keychain KEK is unavailable or malformed
- migration execution must be safe to re-run at startup when already up to date
- fixture/bootstrap helpers must make it easy to prove repeat-open and repeat-migrate behavior in tests
