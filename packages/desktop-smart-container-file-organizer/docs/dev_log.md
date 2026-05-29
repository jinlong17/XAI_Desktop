# desktop-smart-container-file-organizer - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-smart-container-file-organizer |
| Title | Desktop Smart Container File Organizer |
| Current Phase | FEATURE_BUILD |
| Status | APPROVED |
| Suggested Next | feature-auto-build |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex) |
| Updated | 2026-05-29 07:25 PDT |
| Brief | `docs/reviews/desktop-smart-container-file-organizer/20260529-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-smart-container-file-organizer/20260529-discovery-review.md` |
| Risks | The row has one deliberate product constraint and one honest runtime limitation. Product-wise, a correct row-`#20` slice must stay normal-window-first and avoid turning optional overlay-v2 into an implicit dependency or silently absorbing row `#21` organizer/plugin restoration scope. Runtime-wise, the current bookmark registry is session-memory only, so persisted organizer items may outlive authorization for Finder/open actions after relaunch; the first slice must surface that explicitly instead of faking persistent access. |
| Blockers | None. |
| Review Notes | APPROVED. The plan stays correctly narrow around a normal-window-first Smart Container slice, keeps row `#21` restoration separate, and is repo-truthful about `device-local` organizer data, session-only bookmarks, and backup adoption through `@repo/core-data`. Carry two build-stage recommendations: pin the exact `apps/web` organizer mount files before Phase 3 wiring, and keep the `plugin-organizer/manifest.json` update aligned with the runtime that actually loads after the slice lands. |

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#20`
- Seed: `docs/reviews/desktop-smart-container-file-organizer/20260528-roadmap-seed.md`
- Dependency baseline:
  - row `#18` `desktop-phase3-integrated-rc-gate` is `SHIPPED`
  - row `#19` `desktop-overlay-host-v2` is `SHIPPED` but optional, not required for this row
  - row `#21` remains downstream and must stay separate from this row

## Phase Plan

### Phase 1 - Contract and asset normalization

Status: COMPLETED

- freeze keep/refactor/drop decisions across organizer, core-data, and host seams
- correct organizer persistence semantics from `account-sync` to `device-local`
- define the normal-window organizer mount boundary
- explicitly reject overlay/multi-window restoration as the primary row-`#20` runtime

### Phase 2 - Local-first persistence cutover

Status: COMPLETED

- create organizer repos via `createTauriRepo(...)`
- run `migrateOrganizerLayoutToRepos(...)` before repo-backed cutover
- enable `repositoryLayoutStore(...)` for the live organizer slice
- keep legacy `xai-desktop-layout` until smoke passes

### Phase 3 - Normal-window Smart Container workspace

Status: COMPLETED

- embed Smart Container in the normal-window desktop product
- reuse native path-first drag/drop in the interactive organizer surface
- surface item-health and explicit re-authorization-needed states
- keep host changes thin and organizer business logic package-owned

### Phase 4 - Verification and shared backup adoption

Status: PENDING

- extend organizer record families into the shared desktop backup contract if the slice is durable
- run core-data, organizer, web, rust, and desktop bundle gates
- record explicit manual macOS verification for drag/drop, relaunch persistence, and re-authorization behavior

## Explicit Deferrals

- no blanket restoration of overlay-era organizer runtime
- no hidden dependency on `overlay_v2`
- no organizer cloud sync or reconnect queue scope
- no resurrection of other legacy organizer-adjacent plugins
- no fake persistent bookmark/security-scope story beyond what the repo actually implements today

## Review Focus

- Is the recommendation narrow enough to keep row `#20` separate from row `#21` while still shipping real product value?
- Does the plan make the normal-window host the primary entry path instead of silently depending on overlay-v2?
- Is the `device-local` organizer decision strong enough given the current absolute-path-heavy data model?
- Does the plan handle session-only bookmark truth honestly enough for a shipped local-first slice?
- Are the keep/refactor/drop and backup-adoption boundaries concrete enough for `feature-build` to execute phase by phase?

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-29 07:01 PDT | feature-plan (Codex, gpt-5 inline) | Fresh planning pass. Read the roadmap row/seed, workflow and ADR authority, shipped Phase 3 / optional overlay docs, `PLUGIN_MAP`, current organizer package docs, core-data organizer entities/migration/backup seams, and live host/bookmark/finder source. Produced the feature brief, discovery review, and docs quartet with a clear recommendation: keep the organizer domain and repo migration seams, refactor persistence/contracts to `device-local`, ship a normal-window Smart Container slice first, and defer overlay-era multi-window/plugin restoration to later rows. | — | feature-review |
| 2026-05-29 07:10 PDT | feature-review (Codex, gpt-5 inline) | Review pass complete. Re-read the workflow/SOP/roadmap authority plus the feature brief, discovery review, docs quartet, organizer/core-data source seams, desktop host/web runtime seams, and bookmark/finder command truth. Approved the narrow row-`#20` plan because it keeps normal-window host as primary, preserves row `#21` as a separate restoration decision, uses real package/test commands, and stays honest about `device-local` organizer data plus session-only path authorization. | — | feature-auto-build |
| 2026-05-29 07:19 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 1 complete (Contract and asset normalization). Normalized organizer persistence semantics to `device-local` across core-data entities, runtime validation, migration adapters, layout store adapters, and item factories; updated organizer manifest metadata to align with row-`#20` normal-window-first runtime boundary instead of overlay-era command/window assumptions. | `e73ab00a` | Phase 2 |
| 2026-05-29 07:21 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 2 complete (Local-first persistence cutover). Added `createOrganizerDesktopLayoutStore(...)` as the organizer-owned repo bootstrap seam: it creates Tauri repos, runs `migrateOrganizerLayoutToRepos(...)` before first load/save, keeps legacy `xai-desktop-layout` (`removeLegacy: false`), and falls back to local store when Tauri runtime is unavailable. | `9c9a258e` | Phase 3 |
| 2026-05-29 07:25 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 3 complete (Normal-window Smart Container workspace). Added plugin-owned `OrganizerWorkspaceModule` for the desktop normal-window runtime, wired `apps/web` organizer mount files explicitly (`smartContainerOrganizerRegistration.tsx` + shell/App registration path), used native Tauri drag-drop path ingestion (no basename fallback), and surfaced explicit in-item re-authorization/path-failure states for Finder actions. | pending (recorded next phase) | Phase 4 |
