# Discovery Review - xai-web-board-automation-lite

| Field | Value |
|---|---|
| Feature | `xai-web-board-automation-lite` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #14 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- Board data is owned by `@repo/plugin-web-board-core`; active `/app/board`
  orchestration is in `@repo/plugin-web-board-workspaces`.
- Board cards have typed `startDate` / `dueDate`, string label ids, optional
  checklist rows, and archive state.
- Board writes already route through `writeLists()` in `BoardWorkspacesModule`,
  preserving either legacy array or v1 envelope storage format.
- There is no rule builder, rule storage key, reminder worker, notification
  service, or backend sync path.
- Semantic Done detection currently exists only as private logic in the
  workspace status ring; board-core does not yet expose automation helpers.

## Problem

The Project PRD asks for Trello-style lightweight automation presets:

- moving a card to Done marks it complete
- due-soon cards receive an urgent label
- a daily pass sorts cards by due date

Without a board-core helper, each UI path would need to duplicate date/list/card
logic and risk corrupting the `xai_boards_v2` persistence contract.

## Selected Direction

Add a pure `applyBoardAutomationLite()` helper to `@repo/plugin-web-board-core`
and wire it into active `/app/board`:

- board-core owns rule evaluation and immutable list transforms
- board-workspaces runs the daily preset once per board/day in the browser
- cross-list moves to a semantic Done list run the completion preset without
  forcing a full due-date re-sort
- a small toolbar control lets the user manually run the preset batch

## Acceptance

- Cards in a semantic Done list get `completedAt` set and checklist progress
  normalized to complete.
- Active non-Done cards due today or within the configured soon window get the
  `urgent` label without duplicates.
- Daily sort orders active non-Done list cards by valid due date first while
  preserving no-due relative order.
- Archived cards and archived lists are ignored by automation.
- Board storage format preservation remains intact.
- The public board-core barrel exports the helper, constants, and types.

## Out of Scope

- arbitrary no-code rule builder
- custom triggers/actions
- scheduled background worker while the app is closed
- notifications/reminders
- backend sync or server-side automation
- permission-aware team automation
- automatic removal of the urgent label
