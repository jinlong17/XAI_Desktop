# Discovery Review - desktop-smart-container-file-organizer

> Feature: `desktop-smart-container-file-organizer`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Roadmap Row: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#20`

## Scope

Decide whether Smart Container/file organizer should ship now as a post-Phase3 narrow slice, or remain deferred, using current repo evidence only.

## External Research

No external research required. This row is an internal architecture and source-truth decision over existing repo assets, ADRs, and Phase 3 contracts.

## Problem Framing

The repo preserved the organizer stack instead of deleting it, but the product context around it changed completely:

- ADR-0011 made the normal-window wrapped app the active desktop product
- row `#18` shipped the Phase 3 local-first foundation
- row `#19` reintroduced overlay-v2 only as an optional host mode
- `plugin-organizer` still contains the real Smart Container implementation, but its live runtime entry path is still overlay-era

So row `#20` is not "should Smart Container exist?" The repo already answered that by keeping:

- `packages/plugin-organizer/src/SmartContainer.tsx`
- `packages/plugin-organizer/src/GridItem.tsx`
- `packages/plugin-organizer/src/useGridSystem.tsx`
- `packages/plugin-organizer/src/layoutStore.ts`
- `packages/core-data/src/entities.ts`
- `packages/core-data/src/organizer-layout-migration.ts`

The real question is which of these assets still fit the post-Phase3 product:

1. what is worth keeping as the organizer domain
2. what must be refactored away from overlay-era orchestration
3. whether organizer records are local-only or syncable
4. whether row `#20` can ship a useful normal-window slice without accidentally becoming row `#21`

## Current Source Truth

### Product/runtime truth

- `apps/desktop/src/App.tsx` is now only a legacy non-overlay fallback shell
- the real product line is the wrapped `apps/web` normal-window runtime from ADR-0011
- `apps/desktop/src-tauri/src/app_config.rs` defaults `hostMode` to `normal`
- overlay lifecycle exists only behind optional `overlay_v2`

### Organizer code truth

- `packages/plugin-organizer` is a real package with active tests and public exports
- `SmartContainer.tsx`, `GridItem.tsx`, `gridItemFactory.ts`, `itemHealth.ts`, `autoClassify.ts`, and `finderClient.ts` are reusable business/domain assets
- `OrganizerLayer.tsx`, `useMultiWindowGrids.ts`, `useGridWindow.ts`, `GridWindow.tsx`, and `ControlWindow.tsx` are still tied to the old overlay/multi-window runtime
- `useFileDrop.ts` explicitly documents that its main-window HTML5 path is basename-only and not honest filesystem provenance
- `OrganizerGridContent.tsx` already contains the authoritative native Tauri drag-drop path handling pattern

### Local-first truth

- `packages/core-data/src/entities.ts` already defines:
  - `organizer.grid`
  - `organizer.item`
- `packages/core-data/src/organizer-layout-migration.ts` already migrates the legacy `xai-desktop-layout` blob into repo records
- `packages/plugin-organizer/src/layoutStore.ts` already provides both:
  - `localStorageLayoutStore()`
  - `repositoryLayoutStore(...)`
- `packages/plugin-organizer/src/useGridSystem.tsx` already accepts an injected `store`

### Constraint truth

- `apps/desktop/src-tauri/src/commands/bookmarks.rs` stores bookmarks in memory only per session
- `apps/desktop/src-tauri/src/commands/finder.rs` requires a registered bookmark before reveal/open succeeds
- `packages/core-data/src/desktop-backup.ts` currently does not include organizer entity types in the restorable set
- organizer repo adapters currently hardcode `syncScope: "account-sync"` even though organizer payloads are local-path-heavy

## Candidate Options

### Option A - Restore the legacy organizer runtime largely as-is

Description:

- treat the shipped overlay-v2 host as the main row-`#20` execution path
- reuse `OrganizerLayer.tsx`, `useMultiWindowGrids.ts`, `GridWindow.tsx`, and `ControlWindow.tsx` directly
- keep current organizer entity semantics close to legacy behavior

Pros:

- fastest path to "old organizer comes back"
- reuses the most existing code with the least extraction work

Cons:

- conflicts with ADR-0011 normal-window-first product
- makes optional overlay-v2 a hidden hard dependency
- collapses row `#20` into row `#21` restoration territory
- keeps the weakest current seams in the critical path:
  - overlay-era main orchestration
  - session-only bookmark access
  - account-sync organizer persistence for local absolute paths

Verdict:

- reject

### Option B - Ship a narrow normal-window Smart Container slice on local-first device-local storage

Description:

- treat Smart Container as a local-first organizer workspace inside the normal-window host
- reuse the stable business/domain pieces from `plugin-organizer`
- refactor away overlay-era orchestration and multi-window lifecycle as primary dependencies
- cut organizer persistence over to SQLite repos using existing migration/store seams
- make organizer records `device-local`
- rely on native Tauri drag-drop in the active interactive organizer surface, not `useFileDrop` basename fallback

Pros:

- matches the post-Phase3 product architecture
- uses the strongest repo evidence that already exists
- produces a real row-`#20` slice without restoring the whole legacy organizer stack
- keeps privacy/security honest because local file references stay local
- preserves overlay-v2 as optional future enhancement instead of silent dependency

Cons:

- requires extraction/refactor work rather than straight reuse
- first slice must tolerate the current session-only bookmark registry
- any wider organizer plugin restoration still remains for later work

Verdict:

- recommend

### Option C - Keep everything deferred and treat row `#20` as a drop/defer decision only

Description:

- document that Smart Container should remain postponed until a future broader organizer revival
- make no user-facing row-`#20` runtime plan

Pros:

- lowest immediate engineering risk
- avoids the bookmark/session and host-integration issues entirely

Cons:

- wastes the already-shipped organizer repo/migration seams
- leaves `organizer.grid` / `organizer.item` and `repositoryLayoutStore(...)` as stranded assets
- postpones a product surface the roadmap explicitly held back until local-first was stable
- creates pressure for row `#21` to become too broad

Verdict:

- keep as fallback only if review rejects the narrow-slice strategy

## Recommendation

Choose **Option B**.

The repo evidence supports a real but narrow row-`#20` product slice:

- the local-first persistence primitives already exist
- the reusable organizer UI/domain assets already exist
- the active product architecture is normal-window-first
- overlay-v2 is now optional and should stay optional

The key is to draw the line correctly:

- row `#20` owns Smart Container as a local-first file organizer slice
- row `#21` still owns any broader organizer plugin restoration / merge / retirement

## Keep / Refactor / Drop Matrix

### Keep

These match the row-`#20` product direction with minimal or no conceptual change:

| Asset | Why keep |
|---|---|
| `packages/plugin-organizer/src/SmartContainer.tsx` | core Smart Container business UI |
| `packages/plugin-organizer/src/GridItem.tsx` | item rendering and per-item actions |
| `packages/plugin-organizer/src/gridItemFactory.ts` | typed file/folder/app item creation |
| `packages/plugin-organizer/src/itemHealth.ts` | explicit missing/needs-action states fit local-first truth |
| `packages/plugin-organizer/src/autoClassify.ts` | organizer-owned categorization logic |
| `packages/plugin-organizer/src/finderClient.ts` | honest path-action IPC wrapper |
| `packages/plugin-organizer/src/layoutStore.ts` | already has the repo-backed persistence seam |
| `packages/plugin-organizer/src/useGridSystem.tsx` | store injection point already exists |
| `packages/core-data/src/entities.ts` organizer types | canonical shared record family already exists |

### Refactor

These are useful but incompatible with the row-`#20` target unless reshaped:

| Asset | Why refactor |
|---|---|
| `packages/core-data/src/organizer-layout-migration.ts` | currently stamps organizer rows as `account-sync`; row `#20` should make them `device-local` and keep validation/cutover order explicit |
| `packages/plugin-organizer/src/layoutStore.ts` | `repositoryLayoutStore(...)` should write organizer rows as `device-local` and support row-`#20` cutover order |
| `packages/core-data/src/entities.ts` | tighten organizer entity contracts so `syncScope` is device-local by design, similar to clipboard/calendar/provider-local state |
| `packages/plugin-organizer/src/OrganizerGridContent.tsx` | keep its native drag-drop/path registration logic, but extract it from detached-window assumptions so it can power the normal-window organizer surface |
| `packages/plugin-organizer/manifest.json` | current windows/events/commands still describe the old always-on overlay-oriented runtime and need alignment with the post-row-`#20` loading truth |
| `packages/core-data/src/desktop-backup.ts` | if organizer becomes durable product data, extend the existing generic backup contract to include organizer records rather than using plugin-private export logic |

### Drop / Defer From Row #20 Primary Path

These should not be the core of the first row-`#20` slice:

| Asset | Why defer/drop |
|---|---|
| `packages/plugin-organizer/src/OrganizerLayer.tsx` | overlay-era main-window orchestration; wrong primary entry for the normal-window slice |
| `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts` | detached grid-window lifecycle belongs to overlay/restoration work, not the first normal-window slice |
| `packages/plugin-organizer/src/hooks/useGridWindow.ts` | same reason; window-lifecycle helper, not row-`#20` core |
| `apps/desktop/src/windows/GridWindow.tsx` | useful reference, but not the primary host for the first slice |
| `apps/desktop/src/windows/ControlWindow.tsx` | row-`#20` should not depend on the overlay control window |
| `apps/desktop/src/windows/ConsoleWindow.tsx` | unrelated to the first organizer slice |
| `packages/plugin-organizer/src/hooks/useFileDrop.ts` as primary path | HTML5 basename-only main-window drop is not authoritative filesystem provenance |
| `packages/plugin-organizer/src/ExportService.ts` | row `#17` generic backup/export/import contract supersedes plugin-private export flow for durable organizer data |
| `apps/desktop/src-tauri/src/legacy_overlay.rs` and overlay bootstrap | optional host context only; not a row-`#20` dependency |
| `plugin-clipboard`, `plugin-widgets`, `plugin-meditation`, `plugin-pet` restoration | explicit row `#21+` territory, not row `#20` |

## Data Model Decision

### Canonical records

Keep:

- `organizer.grid`
- `organizer.item`

Do not invent a parallel organizer persistence contract outside `@repo/core-data`.

### Sync scope

Change organizer records to **`device-local`**.

Reason:

- `organizer.item` stores absolute local file/folder/app paths
- `organizer.grid` stores layout tied to a single device/window context
- pushing these through `account-sync` would create broken paths, privacy leakage, and misleading queue semantics

Implications:

- organizer writes do not enter `sync.outbox`
- reconnect/sync rows do not gain new organizer scope
- organizer data may participate in local backup/export/import through the existing generic bundle contract, but not cloud/device sync

### Initial item-family boundary

The first row-`#20` acceptance surface should freeze:

- `file`
- `folder`
- `app`

Existing URL-item support can remain compatible in code, but it is not the primary acceptance surface for this file-organizer row.

## Native macOS / Privacy / Security Boundaries

### Path provenance

- authoritative drop provenance for the first slice must come from Tauri/native drag-drop on the active organizer surface
- `useFileDrop.ts` remains non-authoritative because it only yields basenames in the old main-window HTML5 path

### Bookmark truth

Current repo truth:

- bookmarks live only in `BookmarkRegistry` in memory for the current session
- after restart, persisted organizer items can still render from cached metadata, but reveal/open actions may require re-authorization

Row-`#20` recommendation:

- do not fake persistent authorization
- show explicit re-authorization-required states/actions when Finder/open commands fail due to missing bookmark provenance
- treat persistent security-scoped bookmark storage as future follow-up work, not a hidden assumption

### Filesystem boundary

- no blanket filesystem scan
- no silent traversal outside user-initiated drop / picker flows
- no destructive file operations in the first slice

## Normal-Window UX Boundary

The first row-`#20` slice should live inside the normal-window product surface:

- mount Smart Container in the wrapped desktop app as a desktop-only organizer workspace/pane/route
- keep host changes thin:
  - route/module registration
  - runtime gating
  - provider wiring
- keep organizer business UI and state ownership in `packages/plugin-organizer`

Do not make the first slice depend on:

- detached overlay windows
- transparent main-window click-through
- desktop-wide multi-monitor orchestration

## Backup / Restore Boundary

If row `#20` makes organizer data durable in SQLite, it should adopt the shipped row-`#17` generic backup contract:

- extend `DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES` to include organizer entity families
- verify organizer records restore through repo validation
- do not revive `ExportService.ts` as a competing durability path

This is feature adoption of an existing shared backup contract, not a reopening of row `#17` scope.

## Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| session-only bookmarks hurt post-relaunch actions | items persist but open/reveal may fail until re-authorized | explicit item-health / reauthorize UX and truthful error handling |
| organizer records currently serialize as account-sync | privacy leak and broken cross-device semantics | tighten entity and store contracts to device-local before cutover |
| host integration drifts into row `#21` restoration | row boundaries blur quickly around organizer assets | keep normal-window slice single-surface and defer overlay/multi-window restoration explicitly |
| migration cutover can whiteout or duplicate state | old localStorage and new repo can diverge | run migration before repo-store cutover; keep legacy blob until smoke passes |
| backup contract mismatch | durable organizer data may be lost from backup artifacts | adopt row-`#17` restorable-entity extension in the same feature |

## Open Questions

These are small enough for build to resolve, not blockers to approving the plan:

1. Which exact desktop-only mount point is least invasive: a dedicated route, a shell module registration, or a settings/debug entry path?
2. Should the first re-authorization UX be drag-drop-only, or should build also add a user-initiated open-panel helper?
3. Should URL-item compatibility remain passive legacy support or be hidden entirely from the first product surface?

## Recommended Implementation Shape

### Phase 1 - Contract and asset cutover

- freeze keep/refactor/drop inventory
- tighten organizer records to `device-local`
- define the normal-window mount seam
- formally exclude overlay/multi-window runtime from the primary slice

### Phase 2 - Local-first persistence cutover

- create organizer grid/item repos through `createTauriRepo(...)`
- run `migrateOrganizerLayoutToRepos(...)` before enabling repo-backed store
- swap `GridSystemProvider` to `repositoryLayoutStore(...)`
- keep legacy `xai-desktop-layout` until smoke passes

### Phase 3 - Normal-window organizer workspace

- embed Smart Container UI in the normal host
- reuse native path-first drag/drop and bookmark registration logic
- surface item-health and re-authorization states honestly

### Phase 4 - Verification and backup adoption

- extend organizer entity families into the generic desktop backup contract
- run repo/plugin/web/desktop build gates
- manually verify drag/drop, relaunch persistence, and re-authorization behavior on macOS

## Final Recommendation

Approve row `#20` as a **narrow normal-window Smart Container slice** built on:

- existing `plugin-organizer` domain/UI assets
- existing `@repo/core-data` organizer entities and migration seam
- **device-local** organizer persistence
- honest session-auth filesystem boundaries

Reject both extremes:

- not a blanket restoration of the old overlay organizer runtime
- not a full defer/drop that leaves the shipped organizer repo seams stranded
