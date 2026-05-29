# Feature Brief - desktop-local-first-storage-adr

| Field | Value |
|---|---|
| Feature | desktop-local-first-storage-adr |
| Title | Phase 3 Desktop Local-First Storage ADR |
| Date | 2026-05-28 |
| Source | `docs/reviews/desktop-local-first-storage-adr/20260528-roadmap-seed.md` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Draft and accept the Phase 3 storage ADR that locks the desktop local-first storage architecture before implementation begins. The ADR must decide the primary desktop store, the Web/Desktop ownership boundary, migration and import rules, sync-log and conflict semantics, repository interfaces, and backup/export location policy.

## Naming Rationale

`desktop-local-first-storage-adr` is already the canonical roadmap slug and matches the work exactly:

- `desktop` - the decision is for the Tauri desktop product on branch `dev`
- `local-first-storage` - the subject is the persistent data architecture for Phase 3
- `adr` - this row is an architecture gate, not an implementation slice

## Motivation

- ADR-0011 makes Phase 3 local-first storage its own gate and leaves the engine choice advisory only.
- The repo already contains useful evidence packages (`sqlcipher-local-db`, `core-data-sqlite-driver`, `repository-v0-contract`, Web IndexedDB and localStorage contracts), but those artifacts were built for earlier or browser-specific concerns and do not, by themselves, authorize the Phase 3 desktop architecture.
- Later Phase 3 rows depend on stable answers for import boundaries, queue/conflict semantics, backup policy, and repository contracts. Those rows should not have to reopen foundational storage questions.

## Scope

- Produce a reviewable discovery and planning package for the Phase 3 storage ADR
- Compare desktop-primary storage candidates:
  - SQLite via the Tauri/Rust layer
  - IndexedDB/browser-owned storage reused inside desktop
  - file-first JSON/document storage
- Reconcile existing evidence from:
  - `packages/sqlcipher-local-db`
  - `packages/core-data-sqlite-driver`
  - `packages/repository-v0-contract`
  - `packages/core-data`
  - `packages/web-encrypted-indexeddb-cache`
  - `packages/plugin-web-storage`
  - `packages/xai-web-persistence-contract`
  - `packages/web-sync-blob-driver`
- Freeze the required ADR deliverables:
  - canonical ADR artifact path under `docs/adr/`
  - selected primary store and why
  - migration and import boundary from browser Web data to desktop
  - sync-log format and conflict model expectations
  - repository interface and ownership boundaries
  - live database path plus backup/export location policy
  - explicit row unlock rules for later Phase 3 features

## Non-goals

- No production storage implementation
- No Tauri command, Rust schema, or repository code changes
- No Web browser behavior rewrite
- No overlay/control/grid or organizer revival
- No decision that local LLM/Ollama becomes a default dependency
- No direct reopening of Phase 1 or Phase 2 rows

## Constraints

- `desktop-local-first-storage-adr` must ship before `desktop-local-first-sqlite-foundation` or any other Phase 3 implementation row starts unless a human edits the roadmap manifest
- Existing evidence packages are inputs, not automatic decisions
- Browser Web behavior must stay intact; migration/import must be one-way into desktop unless a later ADR explicitly changes that
- Shared business contracts should stay in stable shared surfaces such as `@repo/core-data`; do not invent plugin-to-plugin imports
- Live data location, backup/export policy, and account/device scope must be explicit enough for later implementation and verification work

## Current Baseline

- `desktop-phase2-integrated-rc-gate` is SHIPPED and unlocks this Phase 3 architecture row
- `desktop-real-macos-release-smoke` remains an external release prerequisite but does not block this ADR gate
- Desktop host config already uses a host-owned path policy under `app_config_dir` for config-only data
- `apps/desktop/src-tauri/src/commands/database.rs` already proves a desktop `app_data_dir` SQLite path can be bridged, but encryption and final Phase 3 semantics remain deferred
- `@repo/core-data` already exports Repository v0, a SQLite-shaped driver seam, a Tauri SQLite bridge, browser Sync Blob runtime, IndexedDB cache runtime, and a sync outbox primitive
- Browser persistence remains split between:
  - `@repo/plugin-web-storage` for localStorage preferences and module state
  - `@repo/core-data` / `web-encrypted-indexeddb-cache` for encrypted IndexedDB-backed syncable data

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The plan selects a recommended desktop-primary storage architecture and records the rejected alternatives
- The ADR artifact to be produced during build is named and scoped clearly enough that `feature-build` can author it without reopening discovery
- The plan defines what later rows may assume versus what they still own
- `packages/desktop-local-first-storage-adr/docs/dev_log.md` ends at `NEEDS_REVIEW` with `Suggested Next = feature-review`

## ADR Artifact To Produce During Build

- Proposed path: `docs/adr/0012-phase3-local-first-storage.md`
- Required sections:
  - decision context and governing authority
  - evaluated storage options
  - selected desktop-primary store
  - browser import and migration rules
  - sync-log and conflict semantics
  - repository and package ownership boundaries
  - live DB path and backup/export location policy
  - later-row unlock rules

## Deferred Validation

- Review pass on discovery report and docs quartet
- Future build pass authoring the ADR file
- Later implementation verification:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
  - `pnpm --filter @repo/core-data test`
  - desktop import/migration/manual smoke once runtime code exists
