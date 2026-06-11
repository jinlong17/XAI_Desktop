# Feature Brief - desktop-local-first-backup-export-import

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Source: `docs/reviews/desktop-local-first-backup-export-import/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#17`

## Feature Title

Desktop Local-First Backup Export Import

## Canonical Name

`desktop-local-first-backup-export-import`

## Naming Rationale

The roadmap slug already matches the real responsibility boundary:

- `desktop-local-first` - this is for the shipped Phase 3 desktop local-first runtime on branch `dev`
- `backup-export-import` - the row owns backup artifacts, explicit export/import flows, and restore verification
- it does not reopen storage selection, repository bridging, browser migration, offline queue, reconnect sync, or broad desktop UI redesign

## Motivation

ADR-0012 already froze the critical safety boundaries:

- the live SQLite file is host-owned under `app.path().app_data_dir()`
- backup/export artifacts must stay separate from the live DB path
- restore/import must go through repository-level validation instead of blind file replacement
- snapshot strategy is explicitly deferred to this row

Rows `#11` through `#16` also mean the desktop runtime now has real local-first state worth protecting:

- canonical bridge records in the desktop bridge namespace
- explicit browser-import ledger state
- durable `sync.outbox` queue state with retry/conflict/rollback metadata
- reconnect replay results and device-local calendar provider state

What is still missing is a conservative backup/export/import contract that lets a user recover representative local-first data without corrupting the live repository or replaying stale sync-log state.

## Target Outcome

Produce an approved implementation plan that:

- creates a single desktop backup artifact format for managed backups and explicit exports
- stores managed backups in the storage-ADR-safe location under app data, not in the live DB path and not in `app_config_dir()`
- restores supported local-first records only through repo-validated staging and explicit apply
- makes `corrupt`, `incompatible`, and `partial` outcomes visible and reviewable before live changes
- preserves truthful semantics around excluded or audit-only state such as `sync.outbox` and browser-import ledgers
- exposes only a minimal controlled desktop bridge/tool surface if runtime access is needed

## In Scope

- desktop backup artifact format and validation rules
- managed backup location policy under `app.path().app_data_dir()/backups/` or an equivalent app-data sibling
- explicit export/import flow for representative local-first desktop data
- restore verification before and after apply
- representative restorable data from the shipped desktop bridge/runtime:
  - `productivity.todo`
  - `productivity.habit`
  - `project.board`
  - `project.card`
  - `productivity.pomodoro_sessions`
  - `project.workspace_state`
  - `pet.state`
  - `settings.pref`
  - `calendar.provider_state`
- explicit semantics for excluded or audit-only state:
  - `sync.outbox`
  - `desktop.web_import_ledger`
  - `desktop.web_import_run`
- minimal runtime bridge exposure in existing desktop/web provider seams if needed for controlled testing or support actions

## Out of Scope

- blind copy or blind replacement of `xai-repo-v0.db`
- reopening SQLite-vs-other storage decisions
- cloud backup or remote account backup
- browser-storage export as a parallel source of truth
- changing row `#13` queue semantics or row `#14` reconnect semantics
- hidden note-model invention or backup for unsupported notes scope
- broad new settings/dashboard UI beyond a minimal controlled tool surface
- organizer, overlay, control-window, or legacy desktop restoration work

## Hard Constraints

- Follow ADR-0012:
  - live DB stays host-owned under `app_data_dir()`
  - backup/export artifacts stay separate from the live DB path
  - restore/import uses repository-level validation, not raw file replacement
- Do not corrupt or silently rewrite `sync.outbox` state.
- Do not bypass the shipped repository bridge contract when restoring representative data.
- Failure modes must be visible and recoverable:
  - corrupt bundle
  - incompatible bundle/schema
  - partial restore because excluded queue/import-ledger state was present
- Business logic stays in package owners and shared data seams; `apps/web/src/providers/AppProviders.tsx` may only mount thin runtime wiring.
- Use repo-real owners and seams:
  - `@repo/core-data`
  - `@repo/plugin-web-storage`
  - `apps/web/src/providers/AppProviders.tsx`
  - `apps/desktop/src-tauri/src/commands/database*.rs`

## Dependency Hints

- governing ADR:
  - `docs/adr/0012-phase3-local-first-storage.md`
- shipped Phase 3 seams:
  - `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md`
  - `packages/desktop-local-first-repository-bridge/docs/dev_log.md`
  - `packages/desktop-local-first-web-data-migration/docs/dev_log.md`
  - `packages/desktop-local-first-offline-edit-queue/docs/dev_log.md`
  - `packages/desktop-local-first-sync-reconnect/docs/dev_log.md`
  - `packages/desktop-calendar-sync-degraded-mode/docs/dev_log.md`
- active runtime/code owners:
  - `packages/core-data/`
  - `packages/plugin-web-storage/`
  - `apps/web/src/providers/AppProviders.tsx`
  - `apps/desktop/src-tauri/src/commands/database.rs`
  - `apps/desktop/src-tauri/src/commands/database_runtime.rs`
- host path precedent:
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `packages/desktop-basic-macos-menu-config-store/docs/design.md`

## Acceptance Signal

- A user can create a managed backup or explicit export for representative local-first data.
- Import first verifies the artifact and surfaces `full`, `partial`, `incompatible`, or `corrupt` status before live apply.
- Live restore applies only supported records through the repo seam and does not blind-swap the live SQLite file.
- Pending or historical sync/import audit state is either preserved safely or excluded with explicit partial-restore semantics rather than silently replayed.
- The plan ends with `packages/desktop-local-first-backup-export-import/docs/dev_log.md` at `NEEDS_REVIEW` with `Suggested Next = feature-review`.
