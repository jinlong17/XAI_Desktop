# desktop-local-first-sqlite-foundation - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A - reuse and harden `@repo/core-data` plus the existing Tauri `db_*` seam; keep this feature package as the workflow/docs owner only |
| Review Doc Path | `docs/reviews/desktop-local-first-sqlite-foundation/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 3 storage foundation row |
| Governing ADR | `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- ADR-0012 is final for storage choice, live-path ownership, shared seam ownership, import direction, and backup/live separation.
- This row implements only the database foundation:
  - live DB file policy
  - migration/bootstrap runtime
  - typed repository/driver boundary
  - test fixtures/harness
- This row does not implement entity repositories, browser import, queue/reconnect, conflict UI, backup/export UX, AI offline policy, calendar degraded mode, or overlay/control/grid restoration.
- Business logic stays out of the Tauri host. The host may own only generic runtime/bootstrap seams.
- Browser-safe boundaries remain mandatory: no direct Tauri APIs in Web/plugin business code.

## Dependency Overview

- Shared contract owner:
  - `packages/core-data/`
- Native runtime owner:
  - `apps/desktop/src-tauri/src/commands/database.rs`
  - `apps/desktop/src-tauri/src/commands/database_runtime.rs`
- Supporting evidence:
  - `packages/sqlcipher-local-db/`
  - `packages/core-data-sqlite-driver/`
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `docs/workflow/roadmap/codex-reviews/core-data-sqlite-driver/output.md`

## Boundary Decision

- Keep `packages/desktop-local-first-sqlite-foundation/` as the workflow/docs anchor only.
- Reuse and harden `@repo/core-data` for the typed desktop repository client/driver seam.
- Reuse and harden the existing Tauri `db_*` surface rather than creating a second runtime package.
- If browser-safe separation needs to be clearer, add an explicit desktop-only export/subpath in `@repo/core-data` instead of inventing a new package.
- Browser-safe separation is now explicit via `@repo/core-data/desktop`.

## Required Runtime Outcome

- The native bootstrap path must resolve and own the live DB under `app_data_dir()`.
- The live DB must be SQLCipher-encrypted before any bootstrap/schema access:
  - database KEK lives in macOS Keychain as device-local secret material
  - DB key is HKDF-derived with the `xai.sqlite.v1` domain separator
  - JS never receives raw key bytes or key handles for this bootstrap path
- Migration execution must happen deterministically during bootstrap and surface migration metadata honestly.
- The TypeScript desktop repo/client must be contract-honest:
  - no fake `migrate()` surface
  - no hidden transaction caveats
  - explicit metadata/error behavior
- Rust command handlers should stay thin wrappers over generic runtime/bootstrap logic.
  - Landed: `database.rs` command handlers wrap `database_runtime::open_and_bootstrap`.
  - Landed: bootstrap metadata includes schema/migration version and migration log summary.

## Implementation Phases

### Phase 1 - Native bootstrap and migration runtime

- live DB path/filename policy under `app_data_dir()`
- SQLCipher `PRAGMA key` applied from a Keychain-backed device-local KEK
- migration registry/bootstrap execution in the host runtime
- thin `db_*` command wrappers over the runtime
- honest bootstrap metadata returned to TS

### Phase 2 - Shared desktop repo boundary hardening

- harden `@repo/core-data` desktop client/driver seam
- align `Repo<T>` / migration / metadata behavior with current contract truth
- keep browser-safe boundaries explicit

### Phase 3 - Fixture and contract harness

- Rust temp DB fixtures + migration failure/reopen tests
- TypeScript desktop driver fixtures + repository-contract coverage
- focused negative tests for bad input, malformed records, and bootstrap errors

### Phase 4 - Cross-stack verification gate

- run Rust + TypeScript + browser-safe build + desktop bundle verification
- align docs/status to the actual shipped foundation surface
- stop at `READY_FOR_VERIFY`
