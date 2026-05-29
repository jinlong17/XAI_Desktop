# desktop-local-first-storage-adr - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A - desktop-primary SQLite via Tauri/Rust, browser-owned Web stores preserved, one-way import into desktop, shared repository contracts in `@repo/core-data` |
| Review Doc Path | `docs/reviews/desktop-local-first-storage-adr/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 3 architecture gate / ADR authoring row |
| Planned ADR Artifact | `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- This row is an architecture gate only. It must not implement production storage code.
- ADR-0011 remains authoritative: Phase 3 local-first storage is a separate gate from Phase 1 and Phase 2.
- Existing evidence packages (`sqlcipher-local-db`, `core-data-sqlite-driver`, `repository-v0-contract`, `web-encrypted-indexeddb-cache`) are inputs, not automatic decisions.
- Web browser behavior must remain intact; browser localStorage and IndexedDB are migration/import sources, not the desktop live system of record.
- Shared repository contracts belong in `@repo/core-data`; later Phase 3 rows must not invent parallel plugin-owned repository APIs.
- Overlay/control/grid and organizer revival stay out of scope for this ADR.

## Dependency Overview

- Governing authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Desktop evidence:
  - `packages/sqlcipher-local-db`
  - `packages/core-data-sqlite-driver`
  - `apps/desktop/src-tauri/src/commands/database.rs`
  - `packages/desktop-basic-macos-menu-config-store/docs/`
- Shared contract evidence:
  - `packages/repository-v0-contract`
  - `packages/core-data`
- Web/browser evidence:
  - `packages/plugin-web-storage`
  - `packages/xai-web-persistence-contract`
  - `packages/web-encrypted-indexeddb-cache`
  - `packages/web-sync-blob-driver`

## Required ADR Outcome

The build-phase ADR must freeze:

- desktop primary store = SQLite
- live DB path policy under native `app_data_dir`
- backup/export location policy distinct from the live DB path
- one-way browser-to-desktop import boundary
- append-only durable sync-log direction and explicit conflict semantics
- `@repo/core-data` as the shared repository contract owner
- explicit unlock rules for later Phase 3 rows
