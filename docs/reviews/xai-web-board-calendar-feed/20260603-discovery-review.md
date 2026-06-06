# Discovery Review - xai-web-board-calendar-feed

| Field | Value |
|---|---|
| Feature | `xai-web-board-calendar-feed` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #9 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- `/app/board` owns Board/List/Card data through `xai_boards_v2`.
- Row #3 shipped canonical `BoardCard.startDate` / `dueDate` ISO fields and
  helper metadata in `@repo/plugin-web-board-core`.
- Row #7 shipped `readBoardStorage(...)`, so consumers can read legacy raw
  `Board[]` and v1 envelope forms without importing internals.
- `/app/calendar` currently renders `SAMPLE_EVENTS` only. It has no user event
  storage key, and its banner still says sample data.
- Calendar listens to `web:shell:module-change` focus events, but it does not
  currently read Board data.

## Problem

The Product/Project PRD expects project card deadlines to appear in the global
Calendar module. Today the same Board card due date appears only inside Board's
own Calendar view. This keeps project deadlines invisible when users operate
from `/app/calendar`.

## Options Considered

### Option A - Calendar derives a read-only Board feed from `xai_boards_v2`

Calendar imports board-core public helpers, reads `usePref("xai_boards_v2")`,
projects active Board cards with valid `dueDate` or `startDate` into Calendar
event chips, and merges them with existing `SAMPLE_EVENTS` at render time.

Pros:

- no duplicate Calendar event storage
- no Board write-path changes
- works across legacy raw array and v1 envelope Board storage
- respects board-core schema ownership

Cons:

- Calendar gains a dependency on board-core
- board cards are read-only chips in Calendar for this row

### Option B - Board writes a new Calendar feed storage key

Pros:

- Calendar remains unaware of Board package.

Cons:

- duplicates Board card data
- creates sync/delete lifecycle problems immediately
- conflicts with row #9 wording: "without duplicating calendar data ownership"

### Option C - Board emits events to Calendar

Pros:

- low code footprint.

Cons:

- not durable across reload
- fails when Calendar mounts before Board
- does not satisfy "cards with dates appear" as persistent product behavior

## Selected Direction

Use Option A.

Calendar owns rendering the global calendar surface. Board-core owns Board data.
The row adds a read-only derived feed layer inside `@repo/plugin-web-calendar`
that consumes board-core's public storage/date helpers and never writes
Calendar-specific copies of Board cards.

## Implementation Notes

- Add `@repo/plugin-web-board-core` as a Calendar dependency.
- Add internal Calendar helper:
  - read valid Board storage only; absent/invalid Board storage produces no feed
  - skip archived boards' lists/cards where applicable
  - event date = `dueDate` first, then `startDate`
  - event title mirrors card title
  - color = `blue`
  - event source metadata = board/list/card ids
- Merge feed into Month, Week, and Day render paths.
- Keep Calendar listen-only on the event bus.

## Out of Scope

- Calendar event CRUD
- editing Board cards from Calendar
- dragging Board events in Calendar
- new storage key
- backend sync
- `/app/projects` route alias
- reverse navigation from Calendar chip to Board detail

## Acceptance

- With no `xai_boards_v2`, Calendar does not auto-seed Board cards.
- With valid Board storage, cards with canonical dates appear in Calendar.
- Archived cards/lists do not appear.
- Board v1 envelope storage is accepted.
- Existing Calendar sample-event tests remain stable.
