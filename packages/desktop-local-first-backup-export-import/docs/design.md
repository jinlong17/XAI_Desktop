# desktop-local-first-backup-export-import - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A - repo-managed backup bundle with staged validation and post-restore verification; canonical representative local-first records are restorable, while `sync.outbox` and import-ledger state remain explicit excluded/audit-only data with partial-restore semantics when present |
| Review Doc Path | `docs/reviews/desktop-local-first-backup-export-import/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P1 Phase 3 backup/export/import safety row |
| Governing ADR | `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- ADR-0012 is final for live DB ownership, backup/live separation, and repo-validated restore.
- Row `#11` canonical bridge records are the authoritative representative local-first data surface for this row.
- Row `#12` import-ledger and row `#13/#14` `sync.outbox` records are operationally sensitive and must not be blindly restored into live state.
- Notes remain unsupported because there is still no canonical active notes owner in the shipped desktop bridge.
- Managed backups default to an app-data backup directory, not `app_config_dir()` and not the live DB file path.
- Business logic stays in shared data/package owners; host code owns only filesystem and command registration.

## Dependency Overview

- Shared contract and validation owner:
  - `packages/core-data/`
- Active desktop runtime owner:
  - `packages/plugin-web-storage/`
  - `apps/web/src/providers/AppProviders.tsx`
- Native file/path owner:
  - `apps/desktop/src-tauri/src/commands/database.rs`
  - `apps/desktop/src-tauri/src/commands/database_runtime.rs`
- Supporting Phase 3 evidence:
  - `packages/desktop-local-first-repository-bridge/`
  - `packages/desktop-local-first-web-data-migration/`
  - `packages/desktop-local-first-offline-edit-queue/`
  - `packages/desktop-local-first-sync-reconnect/`
  - `packages/desktop-calendar-sync-degraded-mode/`

## Boundary Decision

- Keep `packages/desktop-local-first-backup-export-import/` as the workflow/docs anchor only.
- Put generic bundle schema, classification, and restore-verification helpers in `@repo/core-data`.
- Put backup-safe directory ownership and bundle file I/O in Tauri command modules.
- Put only a minimal controlled desktop runtime bridge in `@repo/plugin-web-storage` and `AppProviders` if the product needs callable backup/export/import actions.
- Do not put backup business logic in `apps/web` host code and do not add raw DB file replacement flows.

## Required Runtime Outcome

- The desktop runtime can create one backup artifact format for managed backups and explicit exports.
- Verification happens before live apply and can report `full`, `partial`, `corrupt`, `incompatible`, or `failed`.
- Restore applies only supported canonical local-first records through repo transactions.
- `sync.outbox` and browser-import ledger state are never silently replayed into live state; if they are present in the artifact, the restore result is explicitly partial.
