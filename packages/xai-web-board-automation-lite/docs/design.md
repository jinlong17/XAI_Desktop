# Design - xai-web-board-automation-lite

## Selected Model

Automation Lite is a browser-local preset runner:

```text
BoardWorkspacesModule
  -> applyBoardAutomationLite(lists, options)
  -> preserveBoardStorageFormat(rawBoards, nextBoards)
  -> xai_boards_v2
```

The rules are fixed presets, not user-authored rules.

## Preset Rules

1. Done completion
   - A list is semantic Done when `key === "done"` or its custom name matches
     Done/Completed/Complete/已完成/完成.
   - Active cards in semantic Done lists receive `completedAt`.
   - Checklist rows are marked done and aggregate checklist progress becomes
     `done = total`.

2. Due-soon urgent label
   - Active non-Done cards with a valid typed/recoverable `dueDate` from today
     through the next 2 days receive label id `urgent`.
   - Existing labels are preserved and duplicates are not created.
   - Archived cards and Done cards are skipped.

3. Daily due sort
   - Active non-Done cards with valid due dates sort before cards without a due
     date.
   - Due cards sort ascending by `dueDate`.
   - Cards without valid due dates preserve relative order.
   - Archived cards remain ignored by visible automation.

## User Behavior

- Opening a board runs the preset batch once for that board/day in the current
  browser session.
- Moving a card into Done runs completion automation immediately.
- The toolbar includes a manual preset run control for explicit reruns.

## Non-Goals

- no rule builder
- no custom actions
- no storage key for automation definitions
- no backend scheduler
- no notifications
- no permission model
