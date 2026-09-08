# API Contract - xai-web-board-card-crud

> Planning contract for the Web Project module P0 card CRUD slice. This extends
> the shipped board model without adding a new storage key or route.

## 0. Runtime contract summary

This feature extends the existing Web board package family:

- `@repo/plugin-web-board-core` owns card lifecycle helpers and shared card UI
  props.
- `@repo/plugin-web-board-workspaces` owns the active `/app/board` writer path
  and archived-card manager.
- `@repo/plugin-web-board-views` remains parity-only for the shared `BoardView`
  prop surface.

## 1. Card data contract

Additive field:

```ts
interface BoardCard {
  archived?: boolean;
}
```

Rules:

- omitted or `false` means active
- `true` means hidden from active board renders but still persisted inside the
  same containing list
- existing card detail fields must be preserved byte-for-byte unless the user
  edits the card title
- no `sortIndex`, `schemaVersion`, or separate card collection is added

## 2. Active-card render contract

Canonical active pipeline:

```ts
const rawLists = activeBoard.lists;
const activeLists = getActiveBoardLists(rawLists);
const activeCardLists = getActiveBoardCardLists(activeLists);
const filteredLists = applyFilter(activeCardLists, filter);
const archivedCards = getArchivedBoardCards(rawLists);
```

Rules:

- list archive filtering remains first
- card archive filtering is second
- active views consume active-card lists
- archived-card manager consumes archived card records derived from raw lists
- active-card detail lookup may inspect raw lists, but must reject archived cards
  as active detail targets

Surfaces that must hide archived cards:

- `BoardView`
- `TableView`
- `BoardCalendarView`
- `BoardDashboardView`
- `TimelineView`
- `MapView`
- `PlannerPanel`
- `FilterPopover`
- `StatusOverviewBanner`

## 3. Pure board-core helper seam

Recommended helpers:

```ts
interface ArchivedBoardCardRecord {
  listId: string;
  list: BoardList;
  card: BoardCard;
}

function getActiveBoardCards(cards: readonly BoardCard[]): BoardCard[];

function getActiveBoardCardLists(lists: readonly BoardList[]): BoardList[];

function getArchivedBoardCards(
  lists: readonly BoardList[],
): ArchivedBoardCardRecord[];

function renameCard(
  lists: readonly BoardList[],
  listId: string,
  cardId: string,
  titleText: string,
): BoardList[];

function moveCardWithinListByOffset(
  lists: readonly BoardList[],
  listId: string,
  cardId: string,
  offset: -1 | 1,
): BoardList[];

function archiveCard(
  lists: readonly BoardList[],
  listId: string,
  cardId: string,
): BoardList[];

function restoreCard(
  lists: readonly BoardList[],
  listId: string,
  cardId: string,
): BoardList[];

function deleteCard(
  lists: readonly BoardList[],
  listId: string,
  cardId: string,
): BoardList[];
```

Helper semantics:

- unknown list/card ids -> no-op, same reference
- whitespace-only rename -> no-op, same reference
- rename mirrors `title.en` and `title.zh`
- active card archive sets `archived: true` and preserves all other fields
- restore clears `archived`
- permanent delete removes the card from its list
- delete is intended for archived-manager use; UI must not expose direct active
  permanent delete
- same-list move evaluates active card order and swaps raw positions across
  archived card gaps

Example:

```ts
rawCards = [A(active), X(archived), B(active)]
moveCardWithinListByOffset(lists, "L", "B", -1)
// => [B(active), X(archived), A(active)]
```

## 4. Shared BoardView / BoardList / BoardCard surface

Recommended callback additions:

```ts
interface BoardViewProps {
  cardMenu: string | null;
  setCardMenu: (id: string | null) => void;
  renameCard: (listId: string, cardId: string, title: string) => void;
  moveCardWithinListByOffset: (
    listId: string,
    cardId: string,
    offset: -1 | 1,
  ) => void;
  canMoveCardWithinListByOffset: (
    listId: string,
    cardId: string,
    offset: -1 | 1,
  ) => boolean;
  archiveCard: (listId: string, cardId: string) => void;
}
```

Expected UI behavior:

- card body click still opens detail
- card menu click stops propagation
- menu contains rename, move up, move down, archive
- move buttons disable at active-card bounds
- archive closes the menu and any open detail for that card

## 5. Workspace archived-card manager

Recommended record source:

```ts
const archivedCards = getArchivedBoardCards(rawLists);
```

Manager actions:

- Restore
- Delete permanently

Permanent delete requires `window.confirm(...)`. Restoring or deleting a card
must write through `writeLists(...)`, not directly mutate local storage.

## 6. Storage and compatibility

- Existing persisted boards without `archived` fields remain valid.
- Runtime guard accepts `archived?: boolean` on `BoardCard`.
- Invalid archived shapes reject the board blob and fall back to defaults, same
  as other malformed board data.
- No storage registry changes are required.
