# API Contract - xai-web-board-list-crud

> Planning contract for the Web Project module P0 list CRUD slice. This document describes intended runtime seams and destructive rules; it does not imply the implementation already exists.

## 0. Runtime contract summary

This feature does not create a new module or storage key. It extends the current Web board package family:

- `@repo/plugin-web-board-core` owns list shape, list mutation helpers, active/archive selectors, and shared `BoardView` / `BoardList` affordance contracts.
- `@repo/plugin-web-board-workspaces` owns the active `/app/board` writer path, archived-list manager, PM overview semantics, and render-time filtering of archived lists.
- `@repo/plugin-web-board-views` remains parity-only if the shared `BoardView` prop surface changes from visible index to `listId`.

## 1. List data contract

Recommended additive `BoardList` field:

```ts
interface BoardList {
  archived?: boolean;
}
```

Rules:

- omitted or `false` means active
- `true` means hidden from active board renders but still persisted in the same board blob
- keyed kanban lists may now also carry `customName` as a visible label override
- no `sortIndex` or `schemaVersion` is added in this row

## 2. Raw vs active render contract

Canonical render pipeline:

```ts
const rawLists = activeBoard.lists;
const activeLists = getActiveBoardLists(rawLists);
const filteredActiveLists = applyFilter(activeLists, filter);
const archivedLists = getArchivedBoardLists(rawLists);
```

Rules:

- `rawLists` is the persisted source of truth
- active renders consume `activeLists` or `filteredActiveLists`, never raw archived entries directly
- archived-list manager consumes `archivedLists`
- active-card detail lookup may still resolve against raw lists so restore/delete cleanup can reason about hidden lists safely

Surfaces that must use active lists only:

- `BoardView`
- `TableView`
- `BoardCalendarView`
- `BoardDashboardView`
- `TimelineView`
- `MapView`
- `PlannerPanel`
- `FilterPopover`
- `StatusOverviewBanner`

## 3. Template-aware editability

### 3.1 Mutation context

Recommended helper context:

```ts
interface BoardListMutationContext {
  template: BoardTemplate;
}
```

### 3.2 Editability matrix

| Board template | List identity | Editable in row #4? | Notes |
|---|---|---|---|
| `pm` | seeded `pm-*` ids with `key === null` | yes | rename/reorder/archive/delete allowed; semantic status comes from immutable id family |
| `blank` | user-created `key === null` | yes | no special template semantics |
| `kanban` | custom `key === null` lists | yes | same editability as other custom lists |
| `kanban` | keyed defaults (`backlog`, `today`, `week`, `later`, `done`) | yes | rename uses `customName` override; `key` remains immutable |
| future non-kanban keyed lists | `key !== null` outside kanban | no by default | out of scope for this row |

Recommended guard:

```ts
canManageList(template, list) ===
  template === "kanban" || list.key === null;
```

## 4. Pure board-core helper seam

Recommended additive helpers:

```ts
function addCardToListById(
  lists: readonly BoardList[],
  listId: string,
  cardTitleText: string,
): BoardList[];

function renameList(
  lists: readonly BoardList[],
  listId: string,
  name: string,
  ctx: BoardListMutationContext,
): BoardList[];

function moveListByOffset(
  lists: readonly BoardList[],
  listId: string,
  offset: -1 | 1,
  ctx: BoardListMutationContext,
): BoardList[];

function archiveList(
  lists: readonly BoardList[],
  listId: string,
  ctx: BoardListMutationContext,
): BoardList[];

function restoreList(
  lists: readonly BoardList[],
  listId: string,
  ctx: BoardListMutationContext,
): BoardList[];

function deleteList(
  lists: readonly BoardList[],
  listId: string,
  ctx: BoardListMutationContext,
): BoardList[];

function getActiveBoardLists(
  lists: readonly BoardList[],
): BoardList[];

function getArchivedBoardLists(
  lists: readonly BoardList[],
): BoardList[];
```

Helper semantics:

- unknown `listId` -> no-op, same reference
- whitespace-only rename -> no-op, same reference
- disallowed mutation for current template/list pair -> no-op, same reference
- `moveListByOffset(...)` out of visible active bounds -> no-op, same reference
- archive/restore preserve nested cards byte-for-byte
- delete rejects non-empty active lists
- delete may remove archived lists permanently from the archived manager path

## 5. Name-resolution contract

Display resolution must support keyed-kanban rename without losing semantic identity.

Recommended rule:

```ts
resolveListName(list, lang):
  if (list.customName?.[lang]) return list.customName[lang];
  if (list.key) return LIST_KEY_LABEL[list.key]?.[lang] ?? list.key;
  return fallbackUntitled;
```

Implications:

- kanban rename stores `customName = { en, zh }`
- `key` remains the semantic fallback and restore identity
- PM lists already use `customName` and are unaffected

## 6. Reorder contract

P0 reorder stays command-based:

```ts
moveListByOffset(lists, listId, -1, ctx) // Move left
moveListByOffset(lists, listId, +1, ctx) // Move right
```

Rules:

- movement is evaluated in visible active order, not raw-array adjacency
- implementation swaps the raw-array positions of the target active list and its nearest visible active neighbor
- archived entries keep their existing raw positions
- no list drag MIME, pointer math, or DnD contract is introduced

Example:

```ts
raw = [A(active), X(archived), B(active)]
moveListByOffset(raw, "B", -1, { template: "kanban" })
// => [B(active), X(archived), A(active)]
```

## 7. Archive / delete contract

### 7.1 Active-list destructive policy

- editable + non-empty -> **Archive**
- editable + empty -> **Delete**
- non-editable -> reject

Archive means:

- set `archived: true`
- keep the list and all nested cards in the same board blob
- hide the list from active renders

Delete means:

- remove the list entry from the current board's raw `lists[]`
- only permitted when the active list is empty, or when an archived-list manager executes permanent delete

### 7.2 Archived-list manager policy

Recommended manager actions:

- `Restore`
- `Delete permanently`

Permanent delete of an archived list is allowed only from the archived-list manager and only after explicit confirmation. This keeps card-loss out of the primary board surface while still satisfying list delete/archive lifecycle needs.

## 8. BoardView / BoardList surface contract

Recommended shared callback additions:

```ts
interface BoardViewProps {
  draftListId: string | null;
  setDraftListId: (next: string | null) => void;
  addCard: (listId: string) => void;
  renameList: (listId: string, name: string) => void;
  moveListByOffset: (listId: string, offset: -1 | 1) => void;
  archiveList: (listId: string) => void;
  deleteList: (listId: string) => void;
}
```

Expected UI behavior:

- current color picker and add-card affordances remain
- editable lists gain rename/reorder/destructive actions in the dots menu
- `addCard` targets the list's stable id, not its visible array position

Exact prop names may differ in build, but ownership should stay in the shared board-core surface, not duplicate in workspaces and board-views separately.

## 9. Workspaces orchestration contract

`BoardWorkspacesModule` remains the current write owner:

- all list CRUD flows route through `writeLists(...)`
- archived-list filtering happens before passing lists into Board/Table/Calendar/Timeline/Dashboard/Planner/filter/overview surfaces
- archived-list manager reads from the same active board blob and writes back through the same path
- list-targeted writes from visible board UI must route by `listId`, not by filtered visible index

Recommended workspaces-level behavior:

- close list-management popovers after a successful mutation
- clear any active card ref if its list becomes permanently deleted
- archive should not auto-open card detail or move cards

## 10. PM semantics preservation contract

Current PM overview math must stop depending on visible names.

Recommended rule:

- PM workflow lists derive semantics from immutable id families:
  - `pm-todo`
  - `pm-prog`
  - `pm-review`
  - `pm-blocked`
  - `pm-done`
- renamed PM labels are presentation-only
- archived PM lists are excluded from overview math and active renders

## 11. Error semantics

This slice stays local-only and fail-soft.

- invalid list id -> no-op
- rename with blank input -> no-op
- move beyond visible active bounds -> no-op
- attempt to mutate a disallowed template/list pair -> no-op
- delete non-empty active list -> reject action in UI; do not mutate persisted data
- stale active-card ref after permanent delete -> close the detail surface safely

## 12. Idempotency and consistency notes

- reopening a list menu without saving does not rewrite storage
- repeated archive on an already archived list is a no-op
- repeated restore on an active list is a no-op
- rename/reorder touches only the targeted board's `lists[]`
- archive/delete never rewrites nested card fields other than preserving or removing the containing list
- visible board writes still produce one `writeLists(...)` call per user action

## 13. Testable outcomes

- first-run `/app/board` keyed kanban lists expose list CRUD affordance without losing immutable `key` semantics
- visible board writes still target the intended raw list even when archived gaps exist in persisted order
- archived lists disappear from active Board/Table/Calendar/Timeline/Dashboard/Planner/filter/overview renders
- PM overview stays correct after PM list rename because semantics use immutable ids
- row #2 card detail and row #3 typed card dates remain intact for cards inside lists that are reordered or archived/restored
- no storage key, route, or backend contract changes
