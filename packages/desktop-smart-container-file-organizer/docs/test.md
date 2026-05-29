# desktop-smart-container-file-organizer - Test Strategy

## Test Goals

Prove that Smart Container can return as a narrow normal-window local-first organizer slice without reviving the full overlay runtime, leaking organizer data into account-sync, or hiding current path-authorization limits.

## Unit Coverage

### Organizer domain and persistence

- organizer entity contract enforces `device-local` semantics
- `migrateOrganizerLayoutToRepos(...)` preserves organizer data and converges on rerun
- `repositoryLayoutStore(...)` reads/writes organizer repos correctly after the row-`#20` cutover
- `useGridSystem.tsx` hydrates/saves through the repo-backed store without whiteout regression

### Organizer UI/domain helpers

- `SmartContainer.tsx` and `GridItem.tsx` still render the supported item families
- `gridItemFactory.ts` still emits valid organizer item records for `file` / `folder` / `app`
- `itemHealth.ts` surfaces explicit missing/authorization-needed states
- native-drop ingestion path rejects basename-only or malformed provenance in the normal-window slice

### Backup adoption

- organizer entity families are admitted into the shared desktop backup restorable set
- organizer records restore through the shared repo-validated path
- no organizer fallback to plugin-private `ExportService` is required for the durable slice

## Contract Coverage

- organizer records are `device-local`, not `account-sync`
- organizer writes do not create `sync.outbox` work
- the normal-window organizer path does not depend on `OrganizerLayer.tsx` or detached grid-window lifecycle
- after restart, persisted items may require explicit re-authorization for Finder/open actions and that state is surfaced honestly
- overlay-v2 remains optional and is not required for the first organizer slice

## E2E / Regression Scenarios

- migrate a legacy `xai-desktop-layout` payload into organizer repos, then load the organizer workspace from repo-backed state
- drop real file/folder/app paths into the organizer workspace and verify:
  - items render
  - current-session bookmark registration succeeds
  - reveal/open works in-session
- relaunch desktop runtime and verify:
  - organizer layout/items persist
  - filesystem actions requiring bookmark provenance return explicit recoverable authorization-needed behavior until re-authorized
- verify organizer records do not appear in sync/outbox paths
- verify organizer records participate in the shared local backup contract once included
- verify the normal host still builds and runs without overlay-v2 enabled

## Mock Strategy

- `@repo/core-data/testing` in-memory repos for organizer repo/migration/backup tests
- fake organizer record fixtures for:
  - grids
  - file items
  - folder items
  - app items
- bookmark authorization failures simulated at the `finderClient` / command seam for explicit re-authorization-state coverage
- host tests stay thin and cover mount/gating only; organizer business tests stay in `plugin-organizer` and `@repo/core-data`

## Verification Gates

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-organizer test`
- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Manual Desktop Verification

- verify the organizer workspace is reachable from the normal-window desktop product without overlay-v2 enabled
- verify native drag/drop yields real absolute paths in the active organizer surface
- verify relaunch persistence keeps organizer metadata/layout
- verify re-authorization-needed states are understandable after restart
- verify no transparent overlay, detached control window, or multi-grid overlay orchestration is required for the first slice

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | The first organizer slice runs in the normal-window host and does not require overlay-v2 |
| AC-2 | Organizer persistence uses repo-backed local-first storage instead of live localStorage state |
| AC-3 | Organizer records are `device-local` and do not leak into sync/outbox behavior |
| AC-4 | File/folder/app drag/drop works through native path-first input, not basename-only HTML5 fallback |
| AC-5 | Restart keeps organizer metadata/layout while filesystem actions remain honest about re-authorization requirements |
| AC-6 | Shared backup/export/import contract includes organizer records if the slice becomes durable |
| AC-7 | Row `#21` restoration scope remains deferred and untouched |
