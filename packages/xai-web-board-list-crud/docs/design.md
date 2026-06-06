# Design - xai-web-board-list-crud

> Decision snapshot for the Web Project module P0 list CRUD slice on `/app/board`.

## Selected Option

**Option A (revised)** - extend the existing board package family with:

- core-owned pure list mutation helpers
- canonical active vs archived list selectors
- list-id-owned board writes instead of visible-index writes
- command-based reorder with visible-order semantics
- workspace-owned archived-list management
- a minimal keyed-kanban exception so the first-run default board is manageable

## Review Doc Path

`docs/reviews/xai-web-board-list-crud/20260603-discovery-review.md`

## Review Date / Version

2026-06-03 / v2

## Dependency Overview

```text
packages/xai-web-board-list-crud/docs/   (workflow anchor only)

Runtime ownership
  plugin-web-board-core
    ├── owns BoardList shape, active/archive selectors, and pure list mutation helpers
    ├── owns keyed-list visible-name override rule (customName over key fallback)
    ├── owns list-id-based add-card helper and shared BoardView/BoardList prop contract
    └── remains the only owner of nested board->list->card persistence shape

  plugin-web-board-workspaces
    ├── owns active /app/board shell and the only board writer path
    ├── owns rawLists -> activeLists -> filteredActiveLists render orchestration
    ├── owns archived-list manager and destructive confirmation flow
    └── fixes PM status semantics that currently depend on visible labels

  plugin-web-board-views
    ├── may need prop-parity adoption if BoardView contract changes from index to listId
    └── does not own new list CRUD UI or alternate-view-specific mutations

Non-owners
  apps/web shell registrations          -> unchanged for this slice
  plugin-web-storage registry          -> unchanged for this slice
  xai-web-board-card-crud              -> owns later card rename/archive/reorder
  xai-web-board-storage-contract       -> owns schemaVersion / migration work
  plugin-project runtime               -> reference only, no imports
```

## Frozen Assumptions

1. **Current route truth stays `/app/board`.** No `/app/projects` change, alias, or nested route work lands in this row.
2. **`plugin-web-board-workspaces` remains the only active board writer.** All list CRUD writes continue through its existing `writeLists(...)` path.
3. **Raw persisted truth remains one `lists[]` array.** This row does not add `sortIndex`, split entities, or a second storage surface.
4. **Archived lists stay inside that raw array.** They are marked via additive `archived?: boolean`, not moved to a separate blob.
5. **Canonical render pipeline is `rawLists -> activeLists -> filteredActiveLists`.**
6. **Archived filtering happens before every active render.** Board, Table, Calendar, Dashboard, Timeline, Map, Planner, FilterPopover, and PM overview all consume active lists only.
7. **Reorder is command-based in P0.** `Move left` / `Move right` is in scope; list-level drag-and-drop is not.
8. **Left/right movement is evaluated in visible active order.** When raw order contains archived gaps, the helper swaps the raw positions of neighboring active lists and leaves archived entries in place.
9. **List-targeted writes move to `listId` ownership.** Shared BoardView composer state becomes `draftListId`; add-card no longer depends on visible list index.
10. **PM, blank, and existing custom kanban lists remain editable.** PM semantics come from immutable `pm-*` ids, not visible labels; blank-board lists are always custom `key === null` lists.
11. **Basic Kanban keyed lists are also manageable in P0.** Rename/reorder/archive/delete is allowed on `/app/board`, but `key` remains immutable semantic identity.
12. **Keyed-kanban rename writes a `customName` override.** Visible labels prefer `customName`; fallback remains the keyed dictionary.
13. **Archive is the primary destructive path for non-empty active lists.** Empty active lists can delete immediately; permanent delete is manager-only.
14. **Archived keyed-kanban and PM lists preserve identity on restore.** `key`, `customName`, color, and nested cards round-trip unchanged until permanent delete.
15. **PM status semantics must stop depending on visible names.** Rename must not break overview counts or "Done" detection.
16. **Row #2 and row #3 behavior is frozen.** Card detail and typed dates must survive rename/reorder/archive/delete unchanged at the card object level.
17. **No new storage key, schemaVersion, backend sync, or route change is introduced.**

## Exact File Ownership

### `plugin-web-board-core`

- `src/types.ts`
- `src/internal/boardOps.ts`
- `src/internal/isBoardArray.ts`
- `src/BoardList.tsx`
- `src/BoardView.tsx`
- `src/index.ts`
- corresponding `src/__tests__/*`

### `plugin-web-board-workspaces`

- `src/BoardWorkspacesModule.tsx`
- `src/internal/ringMath.ts`
- `src/internal/strings.ts`
- new archived-list manager component(s) under `src/`
- corresponding `src/__tests__/*`

### `plugin-web-board-views`

- `src/BoardModule.tsx` only if shared `BoardView` prop parity requires it
- package-local tests only if touched

## Out of Scope

- card rename/archive/delete/reorder
- checklist item editing
- `schemaVersion`, migration, or encrypted-blob entity decomposition
- route/shell changes
- list drag-and-drop
- PM template redefinition beyond id-based semantic preservation
- board-level permissions/share/backend sync
