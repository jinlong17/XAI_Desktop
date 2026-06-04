# Test Strategy - xai-web-board-card-crud

## 1. Test framework

- Reuse package-local Vitest + jsdom in `plugin-web-board-core`,
  `plugin-web-board-workspaces`, and touched `plugin-web-board-views`.
- Keep tests close to the owning runtime package.
- Keep localStorage-backed `usePref` behavior for integration coverage.

## 2. Unit coverage

### `plugin-web-board-core`

- guard accepts `BoardCard.archived?: boolean`
- guard rejects malformed `archived` card values
- `getActiveBoardCards(...)` hides archived cards without mutating input
- `getActiveBoardCardLists(...)` filters archived cards inside active lists
- `getArchivedBoardCards(...)` returns list/card records from raw lists
- `renameCard(...)` mirrors title to `en` and `zh`
- `renameCard(...)` rejects blank/unknown ids
- `moveCardWithinListByOffset(...)` swaps by active-card order across archived
  card gaps
- `moveCardWithinListByOffset(...)` rejects out-of-bounds moves
- `archiveCard(...)` preserves all detail/date/checklist fields while setting
  `archived: true`
- `restoreCard(...)` clears `archived`
- `deleteCard(...)` removes only the target card
- helper set does not mutate input arrays

### Shared UI

- `BoardCard` renders a card action trigger when callbacks are provided
- clicking the action trigger does not open detail
- rename form calls `renameCard(...)`
- move up/down call signed offsets and disable at active bounds
- archive calls `archiveCard(...)`
- `BoardView` passes list/card ids through the shared prop contract

### `plugin-web-board-workspaces`

- board card rename persists to `xai_boards_v2`
- card archive hides the card from Kanban and closes active detail
- archived-card manager restores the card to active renders
- archived-card manager permanently deletes with confirmation
- archived cards are hidden from Table view
- active-card filtering happens before Planner/Filter/PM overview input

### `plugin-web-board-views`

- standalone `BoardModule` remains compatible with the updated `BoardView`
  props
- board-view card menu actions persist through its local writer path

## 3. Contract scenarios

1. Raw cards `[A(active), X(archived), B(active)]`, move `B` up => raw
   `[B, X, A]`.
2. Archive a card with `description`, `checklistItems`, `attachments`,
   `activity`, `startDate`, `dueDate`, `location`, and `cover`; restore it and
   confirm all fields survive.
3. Rename a card from the board surface, reload from localStorage, and confirm
   both bilingual title fields match.
4. Archive an open detail card and confirm the modal closes.
5. Switch to Table view after archiving a card and confirm it is absent.
6. Restore archived card from manager and confirm it reappears in Board and
   Table views.
7. Permanently delete archived card and confirm no stale active card reference
   remains.

## 4. Manual verification checklist

- Open `/app/board`.
- Open a card menu and rename a card.
- Move a card up/down within one list.
- Archive a card and confirm it disappears without deleting its list.
- Open the archived-card manager, restore the card, and confirm it returns.
- Archive again, permanently delete, and confirm the card is gone after reload.
- Switch to Table/Calendar/Timeline and confirm archived cards are hidden.

## 5. Acceptance criteria

| ID | Acceptance |
|---|---|
| AC1 | Active cards can be renamed from the board surface. |
| AC2 | Active cards can be archived without losing detail/date/checklist data. |
| AC3 | Archived cards can be restored from an archived-card manager. |
| AC4 | Archived cards can be permanently deleted only from the manager after confirmation. |
| AC5 | Cards can move up/down within the same active list with deterministic persisted ordering. |
| AC6 | Archived cards are hidden from all active board/view/panel surfaces. |
| AC7 | Card menu actions do not accidentally open card detail. |
| AC8 | Existing cross-list card DnD still works. |
| AC9 | No checklist editor, route, storage-key, schemaVersion, or backend-sync scope is introduced. |
