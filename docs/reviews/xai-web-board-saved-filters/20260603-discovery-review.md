# Discovery Review - xai-web-board-saved-filters

| Field | Value |
|---|---|
| Feature | `xai-web-board-saved-filters` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #10 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- `/app/board` currently keeps the active filter in `BoardWorkspacesModule`
  component state.
- `FilterState` is owned by `@repo/plugin-web-board-views` and has three
  facets: labels, members, and due range.
- `FilterPopover` mutates the parent state with checkbox/radio actions and a
  Clear button.
- `BoardWorkspacesModule` intentionally resets the filter to `EMPTY_FILTER`
  when the active board changes. The existing test `BWM-EXT-6` records that
  old render-only behavior.
- There is no registered storage key for board filters.

## Problem

The Project PRD requires saved filters so a user can keep a working view per
board. Today filters disappear on board switch/remount and cannot be reset as a
formal persisted board preference.

## Options Considered

### Option A - Persist one filter per board id

Store a small map under a new `xai_board_filter_by_id` key:

```ts
Record<string, { labels: string[]; members: string[]; dueRange: "all" | "overdue" | "today" | "week" }>
```

Pros:

- small contract
- per-board semantics match `xai_board_view_by_id`
- no changes to board/list/card data ownership
- can be narrowed safely from unknown storage

Cons:

- adds a new storage registry entry
- deleted board ids may leave harmless stale keys until a cleanup row

### Option B - Store filters inside each Board record

Pros:

- board delete naturally removes filters.

Cons:

- pollutes the core Board data model with UI preference state
- complicates storage envelope/logical entity projection
- makes future sync/export behavior ambiguous

### Option C - Only persist one global filter

Pros:

- smallest implementation.

Cons:

- wrong product behavior for multi-board use; a legal tracker and product
  board should not share the same filter.

## Selected Direction

Use Option A.

`plugin-web-board-workspaces` owns the shell-level Board UI preference, while
`plugin-web-storage` registers the key. Runtime converts between the persisted
array shape and the existing Set-based `FilterState`.

## Acceptance

- Missing/malformed `xai_board_filter_by_id` narrows to no saved filters.
- Selecting labels, members, or due range writes the active board's saved
  filter.
- Switching away and back to a board restores that board's filter.
- Clear resets the active board to `EMPTY_FILTER` and persists that reset.
- Board data in `xai_boards_v2` is not modified by filter changes.

## Out of Scope

- Named filter presets
- sharing filters between users
- cleanup of stale filter entries for deleted board ids
- syncing filters to backend storage
