# API Contract — xai-web-board-card-detail

> Planning contract for the P0 Web board card-detail slice. This document describes intended runtime boundaries and additive data assumptions; it does not imply the code already exists.

## 0. Runtime contract summary

This feature does not create a new app module or storage key. It extends the existing board package family:

- `@repo/plugin-web-board-core` owns card schema, guards, compatibility derivation, and persistence helpers.
- `@repo/plugin-web-board-core` also owns the public `BoardMemberOption` type and `BOARD_MEMBER_OPTIONS` constant used by both Table and detail editors.
- `@repo/plugin-web-board-workspaces` owns card-detail open state and the modal/detail UI.
- `@repo/plugin-web-board-views` owns alternate-view click passthrough to the same detail surface.

## 1. Upstream interfaces

### 1.1 Existing inputs reused

- `BoardViewProps.onOpenCard?: (cardId: string, listId: string) => void`
- `TableViewProps.onOpenCard?: (card: BoardCardData, listId: string) => void`
- `BoardCalendarViewProps.onOpenCard?: (card: BoardCardData, listId: string) => void`
- `TimelineViewProps.onOpenCard?: (card: BoardCardData, listId: string) => void`
- `PlannerPanelProps.onOpenCard?: (cardId: string, listId: string) => void`

### 1.2 New workspace-level state contract

`BoardWorkspacesModule` should own a route-compatible active-card reference:

```ts
interface ActiveBoardCardRef {
  boardId: string;
  listId: string;
  cardId: string;
}
```

Behavior:

- `null` means no detail surface mounted.
- setting a valid ref opens the card-detail modal
- clearing the ref closes the modal

## 2. Board card schema additions

Recommended additive `BoardCard` fields in `plugin-web-board-core`:

```ts
interface BoardChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface BoardCardAttachmentLink {
  id: string;
  url: string;
  title?: string;
}

interface BoardCardActivityEntry {
  id: string;
  kind: "note";
  body: string;
  createdAt: string;
  authorId?: string;
}

interface BoardCard {
  description?: string;
  checklistItems?: BoardChecklistItem[];
  attachments?: BoardCardAttachmentLink[];
  activity?: BoardCardActivityEntry[];
  startDate?: string;
  dueDate?: string;
}
```

Field semantics:

- `description`: plain text, rendered identically in EN/ZH for now
- `checklistItems`: canonical checklist source when present
- `attachments`: URL-only list for P0; no file-upload contract
- `activity`: append-only note stub only
- `startDate` / `dueDate`: ISO date-only strings (`YYYY-MM-DD`) if adopted in this slice

## 3. Compatibility contract

This row must keep current view surfaces working.

### 3.1 Checklist

- If `checklistItems` exists, derive `checklist.done` and `checklist.total` from it.
- If `checklistItems` is absent, existing aggregate `checklist` remains valid input.
- Current card chips and Table progress continue to consume the aggregate shape during this row.

### 3.2 Attachments

- If `attachments` exists, derive `attach` from `attachments.length`.
- Existing card visuals may keep rendering `attach`.

### 3.3 Dates

- If `startDate` / `dueDate` are introduced, board-core must derive legacy `start` / `due` / `dueEn` / `dueLate` display fields for current views.
- This row must not require every alternate view to switch to ISO parsing.

### 3.4 Labels and members

- `labels: string[]` continues using current `PM_LABELS`
- `members: string[]` continues using current local board member ids
- the public member option owner is `@repo/plugin-web-board-core` via `packages/plugin-web-board-core/src/index.ts`
- build workers should replace TableView-local `MOCK_MEMBERS` with the shared board-core export instead of inventing a new member model

Exact member option contract:

```ts
export interface BoardMemberOption {
  id: string;
  name: string;
  color: string;
}

export const BOARD_MEMBER_OPTIONS: readonly BoardMemberOption[];
```

Initial semantic source:

- the current Web board mock-member set (`u1`, `u2`, `u3`)
- declared in `packages/plugin-web-board-core/src/internal/seed/board-data.ts`
- re-exported from `packages/plugin-web-board-core/src/index.ts`

## 4. Detail-surface component contract

Recommended workspace-owned split:

```ts
interface BoardCardDetailSurfaceProps {
  lang: "en" | "zh";
  boardId: string;
  listId: string;
  card: BoardCardData;
  labelOptions: readonly BoardLabel[];
  memberOptions: readonly BoardMemberOption[];
  onPatchCard: (patch: Partial<BoardCardData>) => void;
  onReplaceChecklist: (items: BoardChecklistItem[]) => void;
  onReplaceAttachments: (items: BoardCardAttachmentLink[]) => void;
  onAppendActivityNote?: (body: string) => void;
  onClose: () => void;
}
```

Recommended modal wrapper:

```ts
interface BoardCardDetailModalProps extends BoardCardDetailSurfaceProps {
  open: boolean;
}
```

The modal wrapper is P0-specific. The surface props should stay reusable for a future page shell.

Import rule:

- consumers should import `type BoardMemberOption` and `BOARD_MEMBER_OPTIONS` from `@repo/plugin-web-board-core`
- no consumer should define a second public member-option shape for this slice

## 5. Persistence contract

- No new storage keys.
- Reads continue from `xai_boards_v2`.
- Writes continue through the existing board update path in `BoardWorkspacesModule`.
- Existing invalid/malformed board blobs must still fall back safely via board-core guards.

Recommended core behavior:

- normalize missing optional detail fields on read without mutating persisted state eagerly
- when a detail edit occurs, write the updated card plus any derived compatibility fields in the same atomic board-array update

## 6. Error semantics

This slice stays local-only and should remain fail-soft.

- unknown `cardId` or `listId` when opening detail -> no crash, close/no-op
- malformed legacy card missing new fields -> render empty/default detail sections
- invalid attachment URL input -> reject the specific add action in UI; do not corrupt saved board data
- invalid date input -> reject the specific edit in UI; preserve last valid persisted values
- failed persistence write through `usePref` -> surface remains in-memory only for that render cycle; no new custom error transport is introduced in this row

## 7. Idempotency and consistency notes

- Reopening a card without edits must not rewrite `xai_boards_v2`.
- Editing title/description/dates/labels/members should update only the targeted card.
- Checklist and attachment operations should be array-replacement or deterministic item CRUD so repeated saves do not duplicate items accidentally.
- Cross-view consistency requirement for this row is “same entity, one storage write path”; it is not “all views rewritten to ISO-native date logic”.

## 8. Downstream testable outcomes

- Board/Table/Calendar/Timeline/Planner all open the same detail surface.
- After detail edits, Kanban chip counts and Table progress remain aligned.
- Legacy boards created before this row remain readable.
- No direct import from `packages/plugin-project/src/**`.
