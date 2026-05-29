# Feature Brief - desktop-smart-container-file-organizer

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Source: `docs/reviews/desktop-smart-container-file-organizer/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#20`

## Feature Title

Desktop Smart Container File Organizer

## Canonical Name

`desktop-smart-container-file-organizer`

## Naming Rationale

The roadmap slug is already the correct boundary for this row:

- `desktop` keeps the work on the `dev` desktop/Tauri product line
- `smart-container` points at the retained grid/container concept rather than the full legacy overlay shell
- `file-organizer` narrows the first post-Phase3 slice to local file/folder/app organization instead of restoring every legacy organizer-adjacent surface

## Motivation

ADR-0011 demoted the old overlay/file-organizer stack to P3 Future until the normal-window React+Tauri+local-first product was stable. That prerequisite is now satisfied:

- row `#18` `desktop-phase3-integrated-rc-gate` is `SHIPPED`
- row `#19` `desktop-overlay-host-v2` is also `SHIPPED`, but remains optional
- the active desktop runtime is still the normal-window wrapped app, not the overlay host

The repo now contains enough concrete organizer evidence to stop treating Smart Container as a vague legacy idea:

- `packages/plugin-organizer/` still owns the real Smart Container business UI and item models
- `packages/core-data/src/entities.ts` already defines `organizer.grid` and `organizer.item`
- `packages/core-data/src/organizer-layout-migration.ts` already migrates legacy `xai-desktop-layout`
- `packages/plugin-organizer/src/layoutStore.ts` already exposes `repositoryLayoutStore(...)`
- `packages/plugin-organizer/src/useGridSystem.tsx` already supports an injected persistence store

But the current runtime shape is not yet suitable as-is for a post-Phase3 product slice:

- the default desktop host is a normal app window, while the organizer entry point is still overlay-era orchestration (`OrganizerLayer.tsx`)
- drag/drop on the old main overlay path depends on `useFileDrop`, which is explicitly basename-only and not honest path provenance
- organizer entities are currently written as `account-sync` even though the payload is dominated by absolute local paths and device/window state
- bookmark authorization is currently in-memory per session only, so persisted organizer items can survive restarts while Finder/open actions still require re-authorization

This row must decide whether Smart Container becomes a narrow local-first product slice now, or whether it should stay deferred. It must not silently turn into row `#21` full organizer/plugin restoration.

## Target Outcome

Produce an approved implementation plan that:

- recommends one clear keep/refactor/drop direction grounded in current source truth
- chooses whether row `#20` ships a narrow slice or an explicit defer/drop decision
- if shipped, mounts Smart Container in the normal-window host first instead of making overlay-v2 a hidden dependency
- keeps organizer persistence local-first and device-local, not account-sync
- reuses the existing repository/migration seams instead of re-inventing organizer storage
- treats path authorization and filesystem access honestly under current macOS/Tauri constraints
- keeps row `#21` separate for any broader organizer plugin restoration decision
- stops at `NEEDS_REVIEW` with `Suggested Next = feature-review`

## Recommended Slice

The planning recommendation is to implement a narrow post-Phase3 slice, not a full revival:

- embed one Smart Container workspace in the normal-window desktop host
- back it with SQLite repo records plus legacy-layout migration
- scope the first supported item families to `file`, `folder`, and `app`
- keep organizer data `device-local`
- reuse existing Finder/open/reveal commands only when the current session has user-authorized paths
- defer overlay/multi-window organizer restoration and any wider legacy plugin resurrection to later rows

## In Scope

- row `#20` planning only
- keep/refactor/drop inventory across:
  - `packages/plugin-organizer/src/*`
  - `packages/core-data/src/entities.ts`
  - `packages/core-data/src/organizer-layout-migration.ts`
  - `packages/core-data/src/desktop-backup.ts`
  - normal-window host/module mounting seams
- a normal-window-first Smart Container product slice
- local-first persistence cutover plan:
  - `createTauriRepo(...)`
  - `repositoryLayoutStore(...)`
  - `migrateOrganizerLayoutToRepos(...)`
- sync/privacy/security boundary decisions for organizer data
- explicit deferral of overlay-v2 and legacy organizer-plugin restoration
- executable verification strategy using real repo package names

## Out of Scope

- blanket restoration of `plugin-organizer`'s old overlay-era runtime
- row `#21` organizer-plugin-restoration work
- restoring `plugin-clipboard`, `plugin-widgets`, `plugin-meditation`, or other legacy P3 Future packages
- making overlay-v2 the primary entry path
- pretending `account-sync` is appropriate for absolute local filesystem paths
- inventing a fake persistent bookmark story that the current repo does not implement
- new cloud sync semantics for organizer data
- unrelated roadmap-row or manifest edits

## Hard Constraints

- Overlay host v2 is optional context only, not a hard dependency.
- The first supported product surface must respect the current normal-window host.
- Organizer business logic stays in organizer-owned packages; host code remains wiring only.
- Organizer records that represent local paths, local apps, and local layout/window state must stay `device-local`.
- File access remains user-initiated and bounded by current bookmark/authorization seams.
- The plan must state explicitly that `BookmarkRegistry` is session-memory only today.
- `useFileDrop` must not be treated as authoritative filesystem provenance for the normal-window slice.
- Do not silently fold row `#21` restoration scope into this row.
- Use the existing generic backup/import contract rather than plugin-private export systems if organizer data is made durable.

## Dependency Hints

- roadmap and seed:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - `docs/reviews/desktop-smart-container-file-organizer/20260528-roadmap-seed.md`
- governing ADRs and shipped gates:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/adr/0012-phase3-local-first-storage.md`
  - `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md`
  - `packages/desktop-overlay-host-v2/docs/design.md`
- organizer assets:
  - `packages/plugin-organizer/src/SmartContainer.tsx`
  - `packages/plugin-organizer/src/GridItem.tsx`
  - `packages/plugin-organizer/src/layoutStore.ts`
  - `packages/plugin-organizer/src/useGridSystem.tsx`
  - `packages/plugin-organizer/src/OrganizerLayer.tsx`
  - `packages/plugin-organizer/src/OrganizerGridContent.tsx`
  - `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts`
  - `packages/plugin-organizer/src/hooks/useGridWindow.ts`
  - `packages/plugin-organizer/src/hooks/useFileDrop.ts`
  - `packages/plugin-organizer/src/finderClient.ts`
- local-first/core-data seams:
  - `packages/core-data/src/entities.ts`
  - `packages/core-data/src/organizer-layout-migration.ts`
  - `packages/core-data/src/tauri-sqlite.ts`
  - `packages/core-data/src/desktop-backup.ts`
- host/runtime seams:
  - `apps/desktop/src/main.tsx`
  - `apps/desktop/src/App.tsx`
  - `apps/desktop/src/windows/GridWindow.tsx`
  - `apps/desktop/src-tauri/src/commands/bookmarks.rs`
  - `apps/desktop/src-tauri/src/commands/finder.rs`

## Acceptance Signal

- The plan explicitly recommends either a narrow row-`#20` slice or a defer/drop outcome, with repo evidence.
- Every major organizer/smart-container asset is classified as keep, refactor, or drop/defer.
- The persistence plan uses the shipped local-first seams and corrects organizer records to `device-local`.
- The normal-window host boundary is concrete enough to build without depending on overlay-v2.
- The path-authorization story is honest about session-only bookmarks and re-authorization UX.
- Row `#21` stays clearly separate as broader organizer/plugin restoration work.
