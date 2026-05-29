# desktop-local-first-backup-export-import - Test Strategy

## Test Goals

Prove that representative desktop local-first data can be backed up, exported, verified, and restored safely without violating ADR-0012, corrupting live queue/import state, or hiding partial/corrupt/incompatible outcomes.

## Unit Coverage

### Shared bundle contract / core-data

- backup manifest and bundle version validation
- allowed restorable entity-family classification
- excluded-state classification for `sync.outbox` and `desktop.web_import_*`
- deterministic restorable fingerprint generation
- pre-apply verification result mapping: full vs partial vs corrupt vs incompatible
- post-apply verification against live repo contents

### Native host path and file handling

- managed backup directory resolves under `app.path().app_data_dir()` and not under `app_config_dir()`
- artifact write/read failures surface stable error codes/messages
- verify-only path does not mutate live repo state

### Desktop runtime bridge

- desktop-only runtime exposure when `desktop-phase1-offline` is active
- browser runtime keeps backup/import helpers absent or gated
- last-report state and event/report publication stay aligned if a report surface is added

## Contract Coverage

- raw live DB replacement is never the default restore path
- supported records restore only through repo-validated transactions
- excluded `sync.outbox` and import-ledger state do not silently re-enter live state
- partial restore is explicit when excluded state is present
- corrupt or incompatible bundles fail before live mutation
- unsupported notes scope stays unsupported and is not invented by backup import

## E2E / Regression Scenarios

- desktop runtime with representative bridge data and no unresolved outbox rows:
  - create managed backup
  - verify bundle reports full
  - import/apply into a clean repo
  - post-restore verification passes
- desktop runtime with unresolved `sync.outbox` rows present:
  - create backup/export
  - verify reports partial because queue state is excluded
  - restore applies supported records only
  - live outbox remains untouched or empty by design
- bundle contains malformed JSON or invalid record shape:
  - verify/import returns corrupt
  - live repo remains unchanged
- bundle version or entity-family matrix is unsupported:
  - verify/import returns incompatible
  - live repo remains unchanged
- live apply transaction fails mid-restore:
  - supported records rollback fully
  - final result is failed, not partial success
- browser runtime (`web-live`) does not expose active desktop backup/import commands
- desktop app bundle still builds with backup/import wiring present

## Mock Strategy

- `@repo/core-data/testing` in-memory repo for bundle classification and restore-apply tests
- fake representative bridge records covering todo/habit/board/card/pomodoro/workspace/pet/settings/calendar-provider state
- fake `sync.outbox` and `desktop.web_import_*` rows for excluded-state and partial-restore assertions
- Rust temp-directory fixtures for managed backup path/file tests
- `AppProviders`-level tests verify mount/gating only; host tests do not own backup business logic

## Verification Gates

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | Managed backups use the ADR-safe app-data backup location and not the live DB path or `app_config_dir()` |
| AC-2 | Representative canonical local-first records export and restore through repo-validated flows |
| AC-3 | `sync.outbox` and import-ledger state do not silently corrupt or re-enter live state |
| AC-4 | Partial restore is explicit when excluded queue/import state is present |
| AC-5 | Corrupt bundles fail before live mutation |
| AC-6 | Incompatible bundles fail before live mutation |
| AC-7 | Post-restore verification can prove whether the supported record set matches the artifact |
| AC-8 | Browser-safe web and desktop build/test gates still pass |
