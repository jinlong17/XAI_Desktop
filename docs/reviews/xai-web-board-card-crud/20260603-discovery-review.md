# Discovery Review - xai-web-board-card-crud

| Field | Value |
|---|---|
| Feature | `xai-web-board-card-crud` |
| Roadmap | `docs/workflow/roadmap/xai-web-project-module.md` row #5 |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` PJ-WEB-03 |
| Date | 2026-06-03 PDT |
| Status | NEEDS_REVIEW |

## Problem

The Web Project module now has shipped card detail, typed dates, and list CRUD,
but its card lifecycle is still incomplete:

- card title edit exists only inside the detail modal, not as a lightweight board-surface action
- active cards cannot be archived or permanently removed as cards
- archived cards have no restore/delete manager
- drag-and-drop across lists appends to the target list, while same-list reorder is still a no-op
- active render surfaces do not have an explicit active-card selector contract

This leaves the board usable for capture and detail editing but not yet usable as
a Trello-like lightweight project board where cards can be reordered, retired,
and recovered without data loss.

## Current Runtime Facts

### `plugin-web-board-core`

- Owns the canonical nested persistence shape: `Board -> lists[] -> cards[]`.
- `BoardCard` currently has no lifecycle field.
- Existing pure helpers:
  - `addCardToListById(...)`
  - `moveCardToList(...)`
  - `updateCardInList(...)`
  - `mergeBoardCardPatch(...)`
- Existing shared UI:
  - `BoardView` owns DnD state and list drop handling.
  - `BoardList` renders cards and list menu.
  - `BoardCard` is a clickable/draggable article with no card menu.
- Existing DnD behavior:
  - cross-list drop moves the card to the end of the target list
  - same-list drop exits early and preserves the current order

### `plugin-web-board-workspaces`

- Owns the active `/app/board` writer path through `writeLists(...)`.
- Uses `activeLists = getActiveBoardLists(rawLists)` after row #4.
- Opens card detail from Board, Planner, Table, Calendar, and Timeline.
- Uses `updateCardInList(...)` for detail/date/table/timeline writes.
- Clears `activeCardRef` when a containing list is permanently deleted.

### `plugin-web-board-views`

- Has a standalone parity `BoardModule`.
- Uses `BoardView` for the board view.
- Uses `updateCardInList(...)` for Table/Calendar/Timeline inline mutations.
- Does not own the active `/app/board` workspace shell.

## Reference Product Alignment

This row maps to the Trello-style Card portion of Board/List/Card:

- cards are the concrete task units
- card title can be renamed quickly
- cards can be archived before destructive deletion
- cards keep detail payloads while moving through lists
- ordering is deterministic within a list

Trello-scale comments, full automation, integrations, templates, and advanced
checklist editing remain separate roadmap rows.

## Recommended Scope

Implement a narrow card lifecycle and ordering contract:

1. Add additive `BoardCard.archived?: boolean`.
2. Add pure board-core helpers for active/archived card selection, rename, move
   by offset within one list, archive, restore, and permanent delete.
3. Extend `BoardView` / `BoardList` / `BoardCard` with a compact card actions
   menu:
   - Rename card
   - Move up / Move down
   - Archive card
4. Add an archived-card manager in the workspace toolbar or adjacent to the
   shipped list archive manager:
   - Restore
   - Delete permanently
5. Filter archived cards before active Board/Table/Calendar/Dashboard/Timeline/
   Map/Planner/Filter/Overview rendering.
6. Keep active-card detail lookup against raw lists, but auto-close if the
   referenced card is archived or permanently deleted.

## Non-Goals

- No checklist item CRUD. Row #6 owns that.
- No storage key, schemaVersion, entity table, encrypted blob, backend sync, or
  route change. Row #7 owns storage contract work.
- No card drag position insertion by pointer Y in P0.
- No cross-list exact insertion point; cross-list moves may continue to append.
- No comments/activity feed expansion beyond preserving existing activity data.
- No permissions, sharing, automations, integrations, or templates.

## Risks

| Risk | Mitigation |
|---|---|
| Archived cards leak into alternate views. | Introduce card-level active selectors and run them before `applyFilter(...)` / view props. |
| Active detail modal stays open after archive/delete. | Workspace actions clear `activeCardRef` for the affected card. |
| Same-list reorder breaks cross-list DnD. | Keep cross-list helper behavior and add a separate `moveCardWithinListByOffset(...)`. |
| Card menu click opens detail modal. | Stop propagation inside card action controls. |
| Checklist row scope drifts. | Treat existing `checklistItems` as preserved data only; do not add checklist item edit UI in this row. |

## Recommended Phases

1. **P1 core contract**: data field, guard, selectors, pure helpers, exports,
   unit tests.
2. **P2 board UI**: card action menu, rename form, up/down/archive actions,
   shared `BoardView` prop contract, core + views parity hosts.
3. **P3 workspace orchestration**: archived-card manager, active-card filtering
   across all workspace surfaces, active detail cleanup, integration tests.
4. **P4 verification/ship docs**: package verification, Web integration check,
   smoke `/app/board`, roadmap and PLUGIN_MAP updates.
