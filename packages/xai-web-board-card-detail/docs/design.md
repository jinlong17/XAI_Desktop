# Design — xai-web-board-card-detail

> Decision snapshot for the first P0 actionable card-detail slice on the Web Project module.

## Selected Option

**Option A** — modal-first, route-compatible card-detail surface in `@repo/plugin-web-board-workspaces`, backed by additive card-detail schema + compatibility helpers in `@repo/plugin-web-board-core`, with alternate-view open-card passthrough in `@repo/plugin-web-board-views`.

## Review Doc Path

`docs/reviews/xai-web-board-card-detail/20260603-discovery-review.md`

## Review Date / Version

2026-06-03 / v2

## Dependency Overview

```text
packages/xai-web-board-card-detail/docs/   (workflow anchor only)

Runtime ownership
  plugin-web-board-workspaces
    ├── owns modal shell, detail surface, open-state orchestration
    ├── depends on plugin-web-board-core public index.ts only
    └── passes open-card handlers into board + planner + alternate-view surfaces

  plugin-web-board-core
    ├── owns BoardCard schema and compatibility normalization
    ├── owns xai_boards_v2 / xai_active_board data path
    ├── exports PM_LABELS, BoardMemberOption, and BOARD_MEMBER_OPTIONS
    └── remains the only owner of board card persistence semantics

  plugin-web-board-views
    ├── owns Table / Calendar / Timeline click passthrough
    └── must stay compatible with board-core's legacy display fields in this row

Non-owners
  apps/web shell registrations          -> unchanged for this slice
  plugin-web-storage registry          -> unchanged for this slice
  plugin-project runtime               -> reference only, no imports
```

## Frozen Assumptions

1. **Current route truth stays `/app/board`.** This row ships a modal on the current module route and does not introduce a dedicated board-detail route.
2. **Surface is route-compatible, not route-first.** The detail body must be reusable later by a page shell, but P0 mounts it as a modal.
3. **`plugin-web-board-core` remains the single persistence authority.** All card-detail edits continue to flow through `xai_boards_v2`.
4. **Schema changes are additive only.** Existing persisted boards lacking new detail fields must still load safely.
5. **Title remains mirrored bilingual state.** Editing title continues to write the same value into both `title.en` and `title.zh`.
6. **Detail-only freeform text uses plain `string`.** `description`, checklist item text, and activity-note body do not become `BilingualText` in this row.
7. **Dates gain narrow authoritative ISO fields only if required for the detail form.** `startDate` / `dueDate` may be added, but this row must still maintain legacy `start` / `due` / `dueEn` / `dueLate` compatibility for current views.
8. **Checklist and attachment arrays become canonical when present.** Existing aggregate fields (`checklist`, `attach`) are derived compatibility outputs, not separate sources of truth.
9. **Labels stay on the current board-local model.** This row continues using `PM_LABELS`; it does not pull in `plugin-labels`.
10. **Members stay on the current available local model.** This row extracts a shared `BoardMemberOption` contract (`{ id, name, color }`) plus `BOARD_MEMBER_OPTIONS` from current Web board data instead of inventing real account-backed membership. Public owner is `@repo/plugin-web-board-core` via `src/index.ts`.
11. **No storage-registry edit.** `plugin-web-storage` key ownership and schemaVersion remain unchanged in this slice.
12. **No host-level route/shell edit is required.** The feature is fully owned by the board package family.
13. **Activity is stub-only if included.** No mentions, notifications, syncing, or multi-user authorship semantics.
14. **Dependency prerequisite is docs/branch based, not workflow-state based.** Row #1 (`xai-web-project-prd-sync`) is already materially satisfied on branches containing commit `e79ecc5 docs(web): formalize project module plan`; downstream agents should re-audit only if those project-module docs drift again.

## Exact File Ownership

### `plugin-web-board-core`

- `src/types.ts`
- `src/internal/isBoardArray.ts`
- `src/internal/boardOps.ts`
- `src/internal/seed/board-data.ts`
- `src/index.ts`
- corresponding `src/__tests__/*`

### `plugin-web-board-workspaces`

- `src/BoardWorkspacesModule.tsx`
- `src/PlannerPanel.tsx`
- `src/index.ts`
- `src/styles.css`
- new detail-surface files under `src/`
- corresponding `src/__tests__/*`

### `plugin-web-board-views`

- `src/TableView.tsx`
- `src/BoardCalendarView.tsx`
- `src/TimelineView.tsx`
- `src/BoardModule.tsx`
- corresponding `src/__tests__/*`

## Out of Scope

- dedicated `/app/board/...` nested routing
- full typed date migration across all views
- board/list/card archive/delete/reorder beyond what detail editing strictly needs
- real sharing, permissions, automation, or third-party integrations
- server sync / encrypted entity decomposition / export-import
