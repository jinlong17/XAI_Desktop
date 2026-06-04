# API Contract - xai-web-board-calendar-feed

## Package Dependency

`@repo/plugin-web-calendar` may import from the public barrel:

```ts
import {
  readBoardStorage,
  getBoardCardDateMeta,
} from "@repo/plugin-web-board-core";
```

It must not import board-core internals.

## Internal Feed Types

```ts
interface BoardCalendarEventSource {
  type: "board-card";
  boardId: string;
  listId: string;
  cardId: string;
}

interface CalEvent {
  c: "mint" | "amber" | "blue" | "violet";
  t: { en: string; zh: string };
  time?: string;
  endTime?: string;
  source?: BoardCalendarEventSource;
}
```

`source` is additive and optional.

## Helper Semantics

```ts
function boardCalendarEventsByDate(rawBoards: unknown): Record<string, CalEvent[]>;
function mergeEventsForMonth(base: CalEventsByDay, feed: Record<string, CalEvent[]>, month: { year: number; month: number }): CalEventsByDay;
function mergeEventsForDateKeys(base: CalEventsByDay, feed: Record<string, CalEvent[]>, dateKeys: readonly string[]): CalEventsByDay;
```

Rules:

- invalid or absent Board storage returns an empty feed
- valid raw Board array and v1 envelope are both accepted
- archived lists and archived cards are skipped
- date = `dueDate ?? startDate`
- same date preserves sample events first, Board events after

## Non-Contracts

- Board event chips are not editable.
- Board event chips do not yet navigate to `/app/board`.
- Calendar does not write `xai_boards_v2`.
