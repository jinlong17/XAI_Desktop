# Test Strategy - xai-web-board-list-crud

## 1. Test framework

- Reuse package-local Vitest + jsdom setups in `plugin-web-board-core`, `plugin-web-board-workspaces`, and any touched `plugin-web-board-views` parity tests.
- Prefer focused unit and integration tests in the owning runtime package rather than adding a new runner under this workflow anchor package.

## 2. Unit coverage

### `plugin-web-board-core`

- `addCardToListById(...)` appends to the correct raw list by stable `listId`
- `addCardToListById(...)` rejects blank input and unknown ids
- `renameList(...)` mirrors the new name into `customName.en` and `customName.zh`
- `renameList(...)` preserves keyed-kanban `key` while using `customName` as the visible override
- `moveListByOffset(...)` swaps raw positions by visible active order and leaves archived gaps in place
- `moveListByOffset(...)` rejects out-of-range visible moves
- `archiveList(...)` toggles `archived: true` without mutating nested cards
- `restoreList(...)` clears archived state without mutating nested cards
- `deleteList(...)` removes empty active lists and archived lists, but rejects non-empty active lists
- active/archived list selectors return stable filtered arrays without mutating the source
- board guards accept additive `archived?: boolean` and keyed lists with `customName` overrides
- shared `resolveListName(...)` behavior prefers `customName` over keyed fallback labels

### `plugin-web-board-workspaces`

- board-surface add-card routes through `listId`, not filtered visible index
- raw `lists[]` is narrowed to `activeLists` before `applyFilter(...)`
- archived lists are removed from active board render input before Board/Table/Calendar/Timeline/Dashboard/Planner/FilterPopover/StatusOverviewBanner mount
- archived-list manager restore/delete flows update localStorage as expected
- active-card detail closes safely if its containing list is permanently deleted
- PM overview math still computes "Done" after a PM list has been renamed

### `plugin-web-board-views`

- only if touched: standalone `BoardModule` stays compatible with the updated `BoardView` listId-based prop contract
- only if touched: board-views add-card still writes to the correct raw list after prop migration

## 3. Contract coverage

### Active-vs-raw ordering cases

- raw `[A(active), X(archived), B(active)]` -> visible `[A, B]`
- `Move B left` writes raw `[B, X, A]`
- `Move A right` writes raw `[B, X, A]`
- `addCardToListById(raw, "B", "...")` still appends to raw list `B`, not visible index `1`

### Core list lifecycle cases

- editable list rename persists through `xai_boards_v2`
- editable list reorder persists through `xai_boards_v2`
- archive preserves nested cards, including row #2 detail fields and row #3 typed dates
- restore returns the archived list to active renders with the same nested card data
- delete of an empty active list removes only that list
- keyed-kanban rename preserves immutable `key`
- PM rename preserves immutable `pm-*` ids

### Archived visibility cases

- archived lists are absent from:
  - Kanban board columns
  - Table rows
  - Calendar entries
  - Timeline bars
  - Dashboard counts
  - Planner slots
  - FilterPopover source lists
  - PM overview ring math
- archived lists are present only in the archived-list manager until restored or permanently deleted

### First-run/default board cases

- first-run `b-default` keyed kanban columns expose rename/reorder/archive affordances
- renamed keyed kanban columns render the override label after reload
- restoring an archived keyed kanban column restores the same `key`, `customName`, color, and cards

## 4. Integration / regression scenarios

1. Open first-run `/app/board`, rename a keyed kanban list, reload, and confirm the override label persists while the board still behaves normally.
2. Move a visible active list left across an archived gap, reload, and confirm the visible order persists while the archived list keeps its raw position.
3. Add a card to a visible list after another list in the raw array has been archived, and confirm the new card lands in the intended list.
4. Archive a non-empty editable list and confirm its cards disappear from active Board/Table/Calendar/Timeline/Dashboard/Planner/filter/overview surfaces without data loss.
5. Restore that archived list and confirm its cards reappear with the same title/detail/date state.
6. Delete an empty active list and confirm only that list is removed.
7. Attempt to delete a non-empty active list and confirm the UI blocks it without mutating persisted data.
8. Rename a PM `Done` list and confirm status overview still reports completion correctly.
9. Permanently delete an archived list and confirm any stale active-card reference closes safely.

## 5. Mock strategy

- keep `usePref` localStorage-backed in tests
- avoid backend mocks; this row is local-only
- use plain seeded boards from `makeDefaultBoards()` plus minimal custom fixtures for editable/archived-gap cases
- include both:
  - a first-run keyed `kanban` fixture
  - a PM fixture with immutable `pm-*` ids
- do not mock row #2 card detail data or row #3 typed dates away; include representative `description`, `checklistItems`, `attachments`, `startDate`, and `dueDate` fields in at least one preserved-card fixture
- do not introduce card CRUD or storage-version mocks; those are out of scope

## 6. Acceptance criteria

| ID | Acceptance |
|---|---|
| AC1 | First-run `/app/board` keyed Basic Kanban lists expose list CRUD affordance in this row. |
| AC2 | List-targeted board writes use `listId` ownership, not visible list index ownership. |
| AC3 | Visible left/right reorder is evaluated in active visible order and preserves archived gaps in raw persisted order. |
| AC4 | Keyed kanban rename preserves immutable `key` while persisting a visible `customName` override. |
| AC5 | PM and blank/custom lists remain editable without changing PM semantic id families. |
| AC6 | Non-empty active lists archive instead of deleting directly. |
| AC7 | Empty active lists can delete immediately. |
| AC8 | Archived lists can be restored or permanently deleted from a minimal archived-list manager. |
| AC9 | Archived lists are hidden from active Board/Table/Calendar/Timeline/Dashboard/Planner/filter/overview renders. |
| AC10 | Cards inside reordered or archived/restored lists preserve row #2 detail fields and row #3 typed dates. |
| AC11 | No route change, storage-key change, schemaVersion work, or backend sync work is introduced. |

## 7. Manual verification checklist

- Open first-run `/app/board` on `b-default`.
- Rename a keyed kanban list and reload the page.
- Move a visible list left/right after archiving another list, then reload the page.
- Add a card to a visible list after an archived gap exists and confirm it lands in the right list.
- Archive a non-empty list and confirm it disappears from board and alternate views.
- Open the archived-list manager, restore the list, and confirm its cards return intact.
- Delete an empty list.
- Open a PM board, rename the PM `Done` column, and verify overview counts still look correct.
