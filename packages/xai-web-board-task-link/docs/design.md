# Design - xai-web-board-task-link

> Decision snapshot for the Web Project module P1 board-card to task link slice.

## Selected Option

**Option A** - implement a one-way "create/link task from board card" workflow.

This gives project cards a concrete Tasks integration without adding a full
existing-task picker, reverse Tasks UI, or event-bus contract.

## Review Doc Path

`docs/reviews/xai-web-board-task-link/20260603-discovery-review.md`

## Review Date / Version

2026-06-03 / v1

## Dependency Overview

```text
packages/xai-web-board-task-link/docs/   (workflow anchor only)

Runtime ownership
  plugin-web-tasks
    ├── exports board-link helper types/functions
    ├── owns TaskCol validation/seed fallback helper
    └── remains owner of xai_task_cols shape

  plugin-web-board-core
    ├── owns BoardCard.taskLink additive field
    └── owns guard/export acceptance

  plugin-web-board-workspaces
    ├── owns active /app/board card-detail UI
    ├── reads/writes xai_task_cols through Tasks public helpers
    └── patches BoardCard.taskLink through existing updateCard path
```

## User Flow

1. User opens a board card detail modal.
2. A Task section appears.
3. If no task is linked, the user can click "Create task".
4. The app creates a deterministic Task card under the appropriate task bucket:
   - `dueDate` in the past -> Overdue
   - `dueDate` within 7 days -> Next 7 Days
   - `dueDate` later than 7 days -> Later
   - no `dueDate` -> No Date
5. The board card stores `taskLink`.
6. If a task is linked, the detail modal shows its persisted bucket/status.
7. User can unlink without deleting the task.

## Frozen Assumptions

1. Board route remains `/app/board`.
2. Tasks route remains `/app/tasks`.
3. `xai_task_cols` remains the only Tasks storage key.
4. Board must import only from `@repo/plugin-web-tasks` public barrel.
5. Link id is deterministic per board/card.
6. Created task title mirrors card title.
7. Created task carries a source ref `{ type: "board-card", boardId, listId,
   cardId }`.
8. Existing-task picker is out of scope.
9. Task completion checkbox state is not persisted by Tasks today; Board status
   reflects persisted bucket/completed-group only.
10. Unlink does not delete the task.

## Out of Scope

- existing-task search/picker
- reverse link chip in `/app/tasks`
- task delete lifecycle cleanup
- event bus
- backend sync
- route aliases
- advanced task metadata mapping
