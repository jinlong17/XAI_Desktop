# desktop-smart-container-file-organizer - API

## Scope

This row defines the contract assumptions for a narrow local-first Smart Container/file organizer slice. It does not restore the full legacy organizer runtime, re-open overlay as a default host, or add cloud sync semantics for organizer records.

## Upstream Interfaces

| Surface | Role |
|---|---|
| `docs/adr/0011-p1-react-tauri-local-first-hybrid.md` | normal-window-first desktop authority |
| `docs/adr/0012-phase3-local-first-storage.md` | SQLite ownership, import boundary, and local-first storage authority |
| `packages/core-data/src/types.ts` | `Repo<T>`, `RepoRecord`, transaction, and sync-scope contract |
| `packages/core-data/src/entities.ts` | canonical `organizer.grid` / `organizer.item` record families |
| `packages/core-data/src/organizer-layout-migration.ts` | legacy `xai-desktop-layout` import seam |
| `packages/core-data/src/desktop-backup.ts` | shared backup/export/import contract to adopt for durable organizer records |
| `apps/desktop/src-tauri/src/commands/bookmarks.rs` | session bookmark registration/clear semantics |
| `apps/desktop/src-tauri/src/commands/finder.rs` | reveal/open authorization gate |

## Downstream Consumers

| Consumer | Expected use |
|---|---|
| normal-window desktop organizer surface | render Smart Containers and item actions |
| host runtime/module wiring | mount the organizer surface only in desktop runtime |
| backup/export/import flow | include organizer records once the slice becomes durable |
| later verify/integrated RC work | prove organizer data stays local-first, device-local, and honest about authorization |

## Data Model Assumptions

### Canonical entity families

Keep:

- `organizer.grid`
- `organizer.item`

Do not introduce a parallel plugin-private repository contract.

### Sync scope

Organizer entities should be treated as:

```ts
type OrganizerSyncScope = "device-local";
```

Recommended direction for build:

- tighten `GridEntity` and `GridItemEntity` to `syncScope: "device-local"` at the type/runtime boundary
- ensure organizer writes are not fed into `sync.outbox`
- keep organizer queue/reconnect scope explicitly unsupported

### Organizer record semantics

- `organizer.grid`
  - title
  - rect / layout metadata
  - fold/lock/view state
  - item ordering
- `organizer.item`
  - `kind = "file" | "folder" | "app"` for the initial acceptance surface
  - absolute local path reference
  - display metadata/icon
  - optional best-effort metadata only; no hidden filesystem crawl contract

URL-item compatibility may remain in code, but is not part of the primary row-`#20` acceptance surface.

## Persistence Contract

Recommended cutover path:

1. create organizer repos with `createTauriRepo(...)`
2. run `migrateOrganizerLayoutToRepos(...)`
3. keep the legacy `xai-desktop-layout` blob until smoke passes
4. switch `GridSystemProvider` to `repositoryLayoutStore(...)`

Important boundary:

- do not describe the row as complete if the organizer surface is still using localStorage as the live source of truth

## Host / UI Contract

- normal-window host is the primary mount point
- host code may:
  - register route/module entry
  - inject repo/store/runtime wiring
  - gate desktop-only visibility
- host code may not:
  - own organizer persistence rules
  - own organizer item classification logic
  - become a second organizer data store

Explicit non-contract for the first slice:

- `OrganizerLayer.tsx`
- `useMultiWindowGrids.ts`
- `useGridWindow.ts`
- detached overlay grid windows

## Native Drag / Path Authorization Contract

### Drag/drop

Use native path-first drag/drop on the interactive organizer surface as the authoritative filesystem input path.

Do not use the HTML5 main-window `useFileDrop` path as authoritative because it only returns basenames in the old overlay path.

### Bookmark authorization

Current source truth:

- `register_path_bookmark` stores canonical paths in an in-memory registry only
- `reveal_in_finder` / `open_path` fail if no current-session bookmark exists

Row-`#20` contract assumption:

- organizer item rendering may survive restart from persisted metadata
- filesystem actions after restart may require re-authorization
- the UI must surface explicit recoverable authorization-needed states instead of pretending access persists forever

### Error semantics

Recommended organizer-facing failure kinds:

| Kind | Meaning | Expected handling |
|---|---|---|
| `authorization_required` | item exists in organizer data but current session lacks a bookmark | recoverable UI state; prompt re-drop or re-authorize |
| `path_missing` | persisted path no longer exists on disk | recoverable item-health state |
| `repo_unavailable` | SQLite/repo seam failed to open | explicit load/save failure state |
| `migration_failed` | legacy cutover could not complete safely | preserve legacy state; fail visibly |
| `backup_contract_mismatch` | organizer entity types were not admitted into the shared backup surface | fail verify/build; do not fall back to plugin-private export |

## Backup / Restore Contract

If row `#20` makes organizer data durable, it should adopt the existing shared desktop backup surface:

- add organizer entity families to `DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES`
- verify organizer restore through repo validation
- keep organizer records local-only even if they are restorable through local backup

Do not revive or depend on `packages/plugin-organizer/src/ExportService.ts` as the primary durability/export contract.

## Permission Notes

- no blanket filesystem traversal
- no direct `@tauri-apps/api` imports from business packages
- no hidden overlay/window capability dependency for the first slice
- no automatic organizer participation in sync/reconnect pipelines

## Idempotency Notes

- rerunning `migrateOrganizerLayoutToRepos(...)` against unchanged organizer data should remain convergent
- re-saving organizer layout should not duplicate records
- re-registering a path bookmark in the current session remains idempotent
- reloading the organizer surface after a repo-open failure should not corrupt existing persisted state
