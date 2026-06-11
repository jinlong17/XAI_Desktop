# desktop-smart-container-file-organizer - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option B - narrow normal-window Smart Container slice on local-first SQLite repos, with organizer records refactored to `device-local` and overlay/multi-window restoration deferred |
| Review Doc Path | `docs/reviews/desktop-smart-container-file-organizer/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P3+ Future post-Phase3 organizer slice |
| Governing ADRs | `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`, `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- The first row-`#20` product surface is normal-window-first. Overlay-v2 remains optional context only.
- Organizer business logic stays organizer-owned; host code may mount and gate it, but may not absorb organizer state or rules.
- `organizer.grid` and `organizer.item` remain the canonical organizer record families.
- Organizer file references, app references, and layout state are `device-local`, not `account-sync`.
- The first supported row-`#20` item families are `file`, `folder`, and `app`.
- Current bookmark authorization is session-memory only. The plan must preserve that truth instead of pretending persistent native bookmark storage already exists.
- Generic desktop backup/export/import remains shared-contract territory in `@repo/core-data`; organizer must adopt that contract instead of reviving plugin-private durability flows.
- Row `#21` still owns broader organizer/plugin restoration decisions.

## Dependency Overview

- Organizer business/domain owner:
  - `packages/plugin-organizer/`
- Shared local-first contracts:
  - `packages/core-data/src/entities.ts`
  - `packages/core-data/src/organizer-layout-migration.ts`
  - `packages/core-data/src/tauri-sqlite.ts`
  - `packages/core-data/src/desktop-backup.ts`
- Host/runtime seams:
  - `apps/desktop/src/main.tsx`
  - `apps/desktop/src/App.tsx`
  - wrapped `apps/web` desktop runtime/module mounting seam
- Native filesystem/path authorization:
  - `apps/desktop/src-tauri/src/commands/bookmarks.rs`
  - `apps/desktop/src-tauri/src/commands/finder.rs`
- Optional future-only context:
  - `packages/desktop-overlay-host-v2/docs/design.md`

## Boundary Decision

- Keep `packages/desktop-smart-container-file-organizer/` as the workflow/docs anchor only.
- Land Smart Container business/UI/state changes in `packages/plugin-organizer/`.
- Land shared organizer record and backup-contract changes in `@repo/core-data`.
- Keep host edits thin and limited to desktop-only route/module/provider wiring.
- Do not route the first slice through `OrganizerLayer.tsx`, `useMultiWindowGrids.ts`, overlay control windows, or detached grid-window lifecycle as the primary runtime.

## Asset Disposition Summary

### Keep

- `SmartContainer.tsx`
- `GridItem.tsx`
- `gridItemFactory.ts`
- `itemHealth.ts`
- `autoClassify.ts`
- `finderClient.ts`
- `layoutStore.ts`
- `useGridSystem.tsx`
- `organizer.grid` / `organizer.item`

### Refactor

- `organizer-layout-migration.ts`
- `repositoryLayoutStore(...)`
- organizer entity `syncScope` contract
- `OrganizerGridContent.tsx` native drop path for normal-window embedding
- `plugin-organizer/manifest.json`
- `desktop-backup.ts` restorable organizer entity set

### Defer / Drop From Primary Slice

- `OrganizerLayer.tsx`
- `useMultiWindowGrids.ts`
- `useGridWindow.ts`
- `GridWindow.tsx`
- `ControlWindow.tsx`
- `ConsoleWindow.tsx`
- `useFileDrop.ts` as authoritative drop path
- `ExportService.ts` as organizer durability owner
- overlay bootstrap / legacy overlay runtime
- row `#21` organizer plugin restoration scope

## Required Runtime Outcome

- Smart Container is available from the normal-window desktop product without requiring overlay-v2.
- Organizer state persists through SQLite-backed repo records after an explicit migration/cutover.
- Organizer records are written as `device-local` and do not participate in sync-outbox/reconnect.
- File-system actions remain user-authorized and honest:
  - native path-first drop when available
  - session-only authorization truth on restart
  - explicit re-authorization-needed states when required
- Durable organizer data participates in the existing shared desktop backup contract once implemented.
