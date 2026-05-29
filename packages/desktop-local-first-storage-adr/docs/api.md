# desktop-local-first-storage-adr - API / Contract Notes

## Contract Summary

This row does not add runtime APIs yet. It freezes the contract assumptions that the future ADR and implementation rows must follow.

## Upstream Interfaces

### Governing ADR and roadmap interfaces

- `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
- `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- `docs/reviews/desktop-local-first-storage-adr/20260528-discovery-review.md`

### Existing shared data contracts

- `@repo/core-data` Repository v0:
  - `Repo<T extends RepoRecord>`
  - `RepoRecord`
  - `MigrationPlan`
  - `RepoMetadata`
  - `SyncScope = "device-local" | "account-sync"`
- `@repo/core-data` sync/outbox helpers:
  - stable mutation ids
  - commit sequence ordering
  - same-transaction enqueue expectations

### Existing browser persistence contracts

- `@repo/plugin-web-storage` owns browser localStorage keys and Web-pref migration hooks
- `@repo/core-data` browser Sync Blob and IndexedDB cache runtimes own browser durable sync/cache behavior

## Downstream Interfaces The ADR Must Freeze

### Desktop live-store ownership

- Native desktop live data is owned by the Tauri/Rust side
- Live entity storage path belongs under `app.path().app_data_dir()`
- Host config JSON under `app_config_dir()` remains a separate concern and must not become the live Phase 3 entity store

### Repository boundary

- `@repo/core-data` remains the canonical shared repository contract owner
- Later desktop rows may add native-driver helpers under `@repo/core-data`, but must not bypass the shared repo contract with plugin-specific persistence APIs

### Migration/import boundary

- Browser storage to desktop storage is an import/migration contract
- Import must be:
  - idempotent
  - observable
  - safely retryable
  - non-destructive to browser data by default
- Browser storage remains usable for pure Web sessions after desktop import

### Sync-log and conflict boundary

- Durable sync-log rows belong beside desktop entity data, not in browser-only stores
- Queue state, retry state, and conflict state must survive relaunch
- Conflict and rollback must remain explicit; successful sync must not be inferred from a queued write alone

## Planned ADR Artifact Contract

The future build-phase ADR at `docs/adr/0012-phase3-local-first-storage.md` must specify:

- selected primary store and rejected alternatives
- live DB filename/path policy
- backup/export location policy
- browser import source surfaces
- conflict ownership model
- queue/sync-log invariants
- which later rows may assume those decisions

## Error Semantics To Freeze

- Missing browser source data during import is a recoverable condition, not automatic failure
- Corrupt browser source data must be surfaced as partial/failed import, not silently dropped
- Queue conflicts must be represented as explicit conflict/failure states, not coerced into success
- Backup/import restore must validate through repository rules; raw file replacement is not acceptable as the default restore path

## Permission Notes

- No new browser permissions are implied
- Later desktop rows may require filesystem access for import/export, but that must stay in desktop-owned surfaces
- Repository and sync logic must not leak direct Tauri APIs into plugin business code

## Idempotency Notes

- Re-running browser import should converge without duplicating records or corrupting browser state
- Re-running queue replay after failure should preserve stable mutation identity
- Re-running backup restore verification should produce the same validation result for the same artifact
