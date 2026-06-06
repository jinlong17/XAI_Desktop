# API Contract - xai-web-board-automation-lite

## Board-Core Helper

```ts
const BOARD_AUTOMATION_URGENT_LABEL_ID = "urgent";
const BOARD_AUTOMATION_DUE_SOON_DAYS = 2;

interface BoardAutomationLiteOptions {
  now?: Date;
  urgentLabelId?: string;
  dueSoonDays?: number;
  sortDueDates?: boolean;
}

interface BoardAutomationLiteStats {
  completedCards: number;
  urgentLabelsAdded: number;
  sortedLists: number;
}

interface BoardAutomationLiteResult {
  lists: BoardListData[];
  changed: boolean;
  stats: BoardAutomationLiteStats;
}

function applyBoardAutomationLite(
  lists: readonly BoardListData[],
  options?: BoardAutomationLiteOptions,
): BoardAutomationLiteResult;
```

## Data Contract

`BoardCard.completedAt?: string` is an additive ISO datetime marker set when a
card is completed by automation. Existing storage remains backward compatible.

## Runtime Contract

- The helper is pure and does not touch `localStorage`.
- Active `/app/board` is responsible for writing returned lists through the
  existing board storage preservation helper.
- `sortDueDates: false` may be used for event-triggered completion automation
  when a move to Done should not reorder the board.

## Non-Contracts

- no persisted automation settings
- no rule builder schema
- no backend API
- no event-bus notification
