# Discovery Review - xai-web-board-list-crud

| Field | Value |
|---|---|
| Date | 2026-06-03 |
| Feature | `xai-web-board-list-crud` |
| Feature Title | Web Project module P0 list CRUD slice |
| Canonical Name Rationale | Matches roadmap row #4 exactly and keeps the slice scoped to list-level create/rename/archive/delete/reorder behavior on the current Web board runtime. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #4 |
| Source PRD / Audit | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Requirement | Add list rename, delete/archive, and reorder for `/app/board` while preserving row #2 card detail, row #3 typed dates, and the existing board writer path in `plugin-web-board-workspaces`. |
| Status | Draft for feature-review |
| External Research | No external research required - internal runtime contract slice, no library or service selection |

## 1. Problem framing

The current Web board runtime already supports:

- add list via `addNewList(...)`
- add card via the per-list composer
- set/remove list color via `setListColor(...)`
- move cards between lists via `moveCardToList(...)`
- open card detail via row #2
- typed card dates via row #3

What it still cannot do is manage the lifecycle of a list once it exists. The visible gap is not just cosmetic:

- users cannot rename workflow columns they create
- users cannot reorder PM/custom columns without rebuilding the board
- users cannot safely archive or delete stale lists
- the board module still assumes list identity is mostly static after creation

This row needs to fix that without spilling into card CRUD, checklist editing, storage-version work, or route changes.

The feature-review revise notes exposed two build-blocking contract gaps that the planning pack must solve before build:

- active renders can diverge from persisted `lists[]` once archived lists are hidden, but current add-card still writes by visible index
- the previous `key === null` editability rule leaves the first-run default `/app/board` with zero list CRUD affordance because `b-default` and the Basic Kanban template use keyed columns

## 2. Current code findings

### 2.1 What already exists

- `packages/plugin-web-board-core/src/internal/boardOps.ts` owns pure list/card mutations for add-list, add-card, set-list-color, move-card, and update-card.
- `packages/plugin-web-board-core/src/BoardView.tsx` still drives card-composer writes as `addCard(listIdx)` with `draftListIdx`, so the Kanban surface is still index-based.
- `packages/plugin-web-board-core/src/BoardList.tsx` already owns the list dots menu, card composer affordance, and color swatches.
- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` owns the active `/app/board` shell, the persisted board writer path, and the row #2 card-detail modal state.
- `packages/plugin-web-board-views/src/BoardModule.tsx` mirrors the same `BoardView` plumbing for the standalone board-views package path.
- `packages/plugin-web-board-core/src/internal/seed/board-data.ts` shows the real first-run behavior:
  - `b-default` uses template `kanban` with keyed lists `backlog/today/week/later/done`
  - PM boards use `key: null` lists with immutable `pm-*` ids
  - blank boards start empty and only create `key: null` lists
- `packages/plugin-web-board-workspaces/src/internal/ringMath.ts` still infers PM "Done" semantics from visible label text, which becomes fragile once rename/archive lands.

### 2.2 What is missing

- no pure list rename helper
- no pure list reorder helper
- no pure list archive/delete helper
- no canonical `getActiveBoardLists(...)` / `getArchivedBoardLists(...)` selector seam
- no list-id-owned add-card helper for the filtered-board surface
- no board-surface affordance for rename/reorder/destructive actions beyond color
- no archived-list restore/delete manager
- no template-aware editability rule that keeps first-run Basic Kanban usable without widening into PM/template semantics churn

### 2.3 Important constraints from shipped rows

- Row #1 `xai-web-project-prd-sync` is already satisfied in this branch baseline; no additional docs prerequisite is blocking this row.
- Row #2 `xai-web-board-card-detail` is shipped and must keep working against the same nested `board -> list -> card` persistence path.
- Row #3 `xai-web-board-date-model` is shipped and typed `startDate` / `dueDate` must remain intact when lists move, archive, or delete.
- Current route truth remains `/app/board`; this row must not revive `/app/projects`.
- No new storage key, `schemaVersion`, backend sync, or route change belongs here; row #7 owns storage-contract work.
- `plugin-web-board-workspaces` remains the active writer for `/app/board`; this row should not create a competing persistence owner.

## 3. Candidate options

### Option A - core-owned list mutation helpers + workspace-owned management UI, with listId-based writes and template-aware editability

Add list CRUD as an additive extension of the current board-core/workspaces split:

- `plugin-web-board-core` adds pure helpers for rename, move-by-offset, archive, restore, and delete
- `plugin-web-board-core` adds selectors for active vs archived lists
- `plugin-web-board-core` moves board-surface add-card from visible index ownership to `listId` ownership
- `plugin-web-board-workspaces` keeps the only active `/app/board` writer path and owns the archived-list manager
- reorder is exposed as deterministic `Move left` / `Move right` commands, not list-level drag-and-drop
- P0 editability becomes template-aware:
  - PM/custom/blank lists remain editable
  - keyed Basic Kanban lists are also manageable on `/app/board`, but keep immutable `key` semantics

Pros:

- fixes the archived-gap write hazard without changing storage shape
- keeps all writes on the existing `writeLists(...)` path
- avoids a second DnD system on top of the shipped card DnD behavior
- gives first-run `/app/board` immediate list CRUD affordance
- preserves card detail/date behavior because cards stay nested under their list
- fits the user's inline-build constraint better than a drag-heavy rewrite

Cons:

- requires explicit visible-order vs raw-order rules once archived gaps exist
- requires the shared BoardView contract to change from index to `listId`
- requires keyed-kanban rename semantics to distinguish immutable `key` from visible label override

### Option B - keep `key === null` as the only editable boundary and narrow row #4 to PM/custom/blank boards

Rejected for this revise pass.

Why:

- leaves the first-run default `/app/board` with no list rename/reorder/archive/delete affordance
- makes "no CRUD on the board users land on first" a product side effect instead of a deliberate UX rule
- does not address the user's explicit concern about row #4 usability on the default board

### Option C - full horizontal list drag-and-drop

Rejected for P0.

Why:

- introduces a second HTML5 drag system alongside current card drag/drop
- much harder to make stable and testable in a short inline build phase
- does not solve rename/archive semantics by itself

### Option D - destructive delete only, no archive model

Rejected as the primary path.

Why:

- deleting a non-empty list forces card-loss or card-migration policy into a row that explicitly should stay out of card CRUD
- too risky once rows #2 and #3 have put richer state under cards

## 4. Recommendation

Choose **Option A**.

### 4.1 Exact scope

This row should ship:

- rename for editable lists
- reorder for editable lists via `Move left` / `Move right`
- archive for non-empty editable lists
- immediate delete for empty editable lists
- archived-list restore + permanent delete in a minimal manager surface
- list-id-owned write routing for Kanban list-targeted actions after archived lists are hidden

This row should not ship:

- list drag-and-drop
- card migration between lists as part of delete/archive
- storage-version or backend sync work
- route/shell changes

### 4.2 Canonical raw vs visible list contract

Freeze one storage/render rule for the build:

- persisted source of truth remains the board's raw `lists[]`
- archived lists stay in that raw array with `archived: true`
- active renders derive `activeLists = getActiveBoardLists(rawLists)` before any board/table/calendar/dashboard/timeline/map/planner/filter/PM-overview render
- archived-list manager derives `archivedLists = getArchivedBoardLists(rawLists)` from the same raw array

That means render-time filtering is explicit and centralized, but storage order remains one array.

### 4.3 Reorder semantics with archived gaps

Left/right movement must be evaluated in **visible active order**, not raw array adjacency.

Recommended rule:

- find the target list inside `activeLists`
- find its visible active neighbor at `offset = -1 | +1`
- swap the raw-array positions of those two active lists
- leave any archived entries at their current raw indices

Example:

- raw persisted order: `[active:A, archived:X, active:B]`
- visible active order: `[A, B]`
- `Move B left` writes raw order `[B, archived:X, A]`
- `Move A right` writes the same raw order

This preserves hidden archived gaps while making visible movement intuitive.

### 4.4 Write-path identity

List-targeted board writes should no longer rely on visible list index.

Recommended change:

- shared `BoardView` contract moves from `draftListIdx` / `addCard(listIdx)` to `draftListId` / `addCard(listId)`
- board-core adds `addCardToListById(...)`
- workspace and parity hosts keep `writeLists(...)`, but all list-targeted writes become `listId`-owned:
  - add card
  - rename list
  - set color
  - move left/right
  - archive/restore/delete

This is the cleanest way to keep filtered visible lists safe once archived lists are hidden.

### 4.5 Template-aware editability

P0 editability should become explicit:

- `template === "pm"`:
  - lists remain editable
  - immutable semantics come from seeded `pm-*` ids, not visible labels
- `template === "blank"`:
  - all created lists are editable (`key === null`)
- `template === "kanban"`:
  - all kanban lists remain editable on `/app/board`
  - rename writes a `customName` override but preserves immutable `key`
  - keyed default lanes preserve `key` until permanent delete

This gives the default board a usable CRUD surface without broadening into PM template re-definition.

### 4.6 Rename and label-resolution rule

For keyed Basic Kanban lists:

- `key` remains the semantic identity and fallback label source
- rename writes `customName = { en, zh }`
- display resolution prefers `customName` when present, then falls back to the keyed dictionary

That lets users rename "Today" to "Now" without losing the underlying `today` identity.

### 4.7 Destructive policy

Keep one explicit rule for active surfaces:

- editable + non-empty -> **Archive**
- editable + empty -> **Delete**

Archived-list manager actions:

- `Restore`
- `Delete permanently`

For keyed Basic Kanban lists, archive/restore preserves `key`, `customName`, color, and nested cards exactly. Permanent delete is still allowed only from the archived manager; it is an explicit destructive choice, not the default board-surface action.

### 4.8 PM semantics rule

PM overview math must stop depending on visible labels.

Recommended preservation rule:

- PM workflow semantics derive from immutable id families:
  - `pm-todo`
  - `pm-prog`
  - `pm-review`
  - `pm-blocked`
  - `pm-done`
- archived PM lists are excluded from overview math and active renders
- rename never changes the PM semantic bucket because it does not rewrite list ids

## 5. Exact ownership

### `plugin-web-board-core` owns

- additive list metadata (`archived?: boolean`)
- display-name resolution rule for keyed rename override
- list-id-based add-card helper
- pure list mutation helpers
- active/archived list selectors
- list-level menu affordance contract in `BoardList` / `BoardView`
- guard acceptance for archived lists in persisted blobs

Likely files:

- `packages/plugin-web-board-core/src/types.ts`
- `packages/plugin-web-board-core/src/internal/boardOps.ts`
- `packages/plugin-web-board-core/src/internal/isBoardArray.ts`
- `packages/plugin-web-board-core/src/BoardList.tsx`
- `packages/plugin-web-board-core/src/BoardView.tsx`
- `packages/plugin-web-board-core/src/index.ts`
- `packages/plugin-web-board-core/src/__tests__/*`

### `plugin-web-board-workspaces` owns

- active `/app/board` write orchestration
- canonical `rawLists -> activeLists -> filteredActiveLists` render pipeline
- archived-list manager surface
- PM overview semantic fixes where rename/archive would otherwise break counts
- active-card cleanup when a list is permanently deleted

Likely files:

- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`
- `packages/plugin-web-board-workspaces/src/internal/ringMath.ts`
- `packages/plugin-web-board-workspaces/src/internal/strings.ts`
- new archived-list manager component(s) under `src/`
- `packages/plugin-web-board-workspaces/src/__tests__/*`

### `plugin-web-board-views` owns

- parity-only adoption if the shared `BoardView` prop contract changes from index to `listId`
- no new alternate-view-specific list CRUD UI
- no card CRUD/date logic expansion

Likely files:

- `packages/plugin-web-board-views/src/BoardModule.tsx`
- package-local tests only if `BoardView` prop surface changes

### Non-owners

- `apps/web` route/shell registrations
- `plugin-web-storage` registry or key naming
- `plugin-project`
- checklist/card/detail data contracts beyond keeping nested cards intact

## 6. API / data recommendations

### 6.1 Additive list shape

Recommended additive field:

```ts
interface BoardList {
  archived?: boolean;
}
```

This row should not add `schemaVersion`, `sortIndex`, or backend ids.

### 6.2 Mutation context

Template-aware editability needs template context. Recommended pure-helper context:

```ts
interface BoardListMutationContext {
  template: BoardTemplate;
}
```

### 6.3 Pure helper set

Recommended board-core pure helpers:

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

### 6.4 Shared BoardView contract changes

Recommended prop-direction change:

```ts
interface BoardViewProps {
  draftListId: string | null;
  setDraftListId: (next: string | null) => void;
  addCard: (listId: string) => void;
}
```

### 6.5 Guard acceptance

- persisted list guards should accept `archived?: boolean`
- keyed lists may now also carry `customName` when a kanban rename override exists
- no schema migration engine is required in this row; additive narrowing is enough

## 7. Risks and open questions

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Index-based add-card survives into build | Archived gaps can write to the wrong list | Move BoardView composer state and add-card write path to `listId` before enabling archive filtering |
| R2 | Visible-order movement is underspecified | Reorder feels random once archived gaps exist | Freeze active-order neighbor swap semantics in board-core helper tests |
| R3 | Keyed-kanban rename confuses semantic identity | Default board labels drift or regress | Preserve immutable `key`; use `customName` as visible override only |
| R4 | PM overview still keys off text | Rename breaks status banner | Move PM semantics to immutable `pm-*` id families and exclude archived lists |
| R5 | Permanent delete of archived keyed kanban list removes a seeded lane | User can remove the original lane shape | Keep archive as the primary destructive action; make permanent delete explicit and manager-only |

## 8. Final recommendation

Proceed with a narrow build on top of the current `/app/board` runtime:

- one persisted `lists[]` source of truth
- render-time active/archive selectors
- list-id-owned list-targeted writes
- visible-order left/right semantics with archived gaps preserved in raw order
- minimal keyed-kanban exception so first-run `/app/board` is actually manageable

That resolves both review blockers without reopening row #2, row #3, storage-contract work, or route truth.
