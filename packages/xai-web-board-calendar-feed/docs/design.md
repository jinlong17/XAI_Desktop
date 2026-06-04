# Design - xai-web-board-calendar-feed

## Selected Model

Calendar renders a read-only, derived Board feed:

```text
xai_boards_v2
  -> @repo/plugin-web-board-core read/date helpers
  -> Calendar internal boardCalendarFeed helpers
  -> Month / Week / Day event chips
```

No Calendar-specific copy of Board cards is stored.

## User Behavior

1. User sets a Board card due date in `/app/board`.
2. User opens `/app/calendar`.
3. The dated card appears as an all-day calendar chip on that date.
4. If the card is archived or its list is archived, it disappears from Calendar.

## Rendering Rules

- `dueDate` is preferred.
- `startDate` is used only when `dueDate` is absent.
- Events are all-day for this row.
- Board feed color uses Calendar `blue`.
- Title mirrors the card's bilingual title.
- Month, Week, and Day views all receive the merged feed.

## Ownership Rules

- Board data owner: `@repo/plugin-web-board-core`.
- Calendar render owner: `@repo/plugin-web-calendar`.
- Storage owner: existing `xai_boards_v2`; no new key.
- Event bus: unchanged listen-only Calendar behavior.

## Future Work

- Calendar chip click to open Board card detail.
- Drag Board event to change Board card due date.
- Board events in export/import/delete flows through logical entities.
