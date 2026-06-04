# Design - xai-web-board-card-crud

> Decision snapshot for the Web Project module P0 card CRUD slice on `/app/board`.

## Selected Option

**Option A** - extend the shipped board package family with:

- core-owned card lifecycle helpers
- additive `archived?: boolean` on `BoardCard`
- active-card filtering without changing storage keys
- shared card actions menu in board-core
- workspace-owned archived-card manager
- same-list command reorder with stable card id ownership

## Review Doc Path

`docs/reviews/xai-web-board-card-crud/20260603-discovery-review.md`

## Review Date / Version

2026-06-03 / v1

## Dependency Overview

```text
packages/xai-web-board-card-crud/docs/   (workflow anchor only)

Runtime ownership
  plugin-web-board-core
    ├── owns BoardCard archived field and runtime guard acceptance
    ├── owns pure card lifecycle/order helpers
    ├── owns shared BoardCard / BoardList / BoardView action props
    └── remains the only owner of nested board->list->card persistence shape

  plugin-web-board-workspaces
    ├── owns active /app/board writer path
    ├── owns rawLists -> activeLists -> active-card-filtered lists orchestration
    ├── owns archived-card manager and permanent-delete confirmation
    └── owns active-card detail cleanup after card archive/delete

  plugin-web-board-views
    ├── adopts BoardView prop parity if shared card action props change
    └── continues to own Table/Calendar/Timeline inline date/field edits only

Non-owners
  xai-web-board-checklist-editor        -> owns checklist item CRUD
  xai-web-board-storage-contract        -> owns schemaVersion / migration work
  apps/web shell registrations          -> unchanged for this slice
  plugin-web-storage registry           -> unchanged for this slice
```

## Frozen Assumptions

1. Current route truth stays `/app/board`; no `/app/projects` route lands here.
2. `xai_boards_v2` remains the only board data storage key.
3. Raw persisted truth remains `boards[].lists[].cards[]`; no `sortIndex` or
   entity split is added.
4. Archived cards stay inside their containing list with `archived: true`.
5. Active surfaces consume active lists whose `cards` arrays have archived cards
   filtered out.
6. The archived-card manager may scan raw active-board lists and show archived
   cards with their list name.
7. Card rename writes `title.en` and `title.zh` as a bilingual mirror, matching
   existing add-card/detail-modal behavior.
8. Same-list reorder is command-based: `Move up` / `Move down`.
9. Cross-list drag remains supported and may continue to append to the target
   list. Exact pointer-position insertion is out of scope.
10. Archive is the primary destructive action for active cards.
11. Permanent card delete is allowed only from the archived-card manager after
    confirmation.
12. Card detail, labels, members, attachments, activity, checklistItems, typed
    dates, location, and cover must be preserved through rename/reorder/archive/
    restore.
13. Active-card detail closes when that card is archived or permanently deleted.
14. No checklist item edit controls are added in this row.

## Exact File Ownership

### `plugin-web-board-core`

- `src/types.ts`
- `src/internal/isBoardArray.ts`
- `src/internal/boardOps.ts`
- `src/BoardCard.tsx`
- `src/BoardList.tsx`
- `src/BoardView.tsx`
- `src/BoardModule.tsx`
- `src/index.ts`
- corresponding `src/__tests__/*`

### `plugin-web-board-workspaces`

- `src/BoardWorkspacesModule.tsx`
- new `src/ArchivedCardsManager.tsx`
- `src/internal/strings.ts` if microcopy is centralized
- corresponding `src/__tests__/*`

### `plugin-web-board-views`

- `src/BoardModule.tsx`
- package-local tests only if touched for BoardView prop parity

## Out of Scope

- checklist item CRUD and progress editor
- schemaVersion / migration / encrypted blob sync contract
- route/shell changes
- cross-list exact insertion position
- labels/members CRUD beyond existing detail modal
- comments/activity authoring beyond preserving existing activity fields
- automations, integrations, templates, sharing, permissions
