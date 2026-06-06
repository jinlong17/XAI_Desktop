# Discovery Review - xai-web-board-task-link

| Field | Value |
|---|---|
| Feature | `xai-web-board-task-link` |
| Roadmap | `docs/workflow/roadmap/xai-web-project-module.md` row #8 |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` PJ-WEB-06 |
| Date | 2026-06-03 PDT |
| Status | NEEDS_REVIEW |

## Problem

The Web Project/Board module now has a real card detail modal and storage
contract, but board cards still cannot participate in the shipped Tasks module.
Users can track project work in `/app/board` or task buckets in `/app/tasks`,
but there is no connection between them.

Current gaps:

- Board cards have no stable reference to a Task.
- Card detail cannot create a task from the card.
- Card detail cannot show whether a linked task is in Overdue / Next 7 / Later /
  No Date / Completed.
- Board package does not have a safe public Tasks helper and must not import
  `packages/xai-web-tasks/src/internal/*`.

## Current Runtime Facts

### Board

- `BoardCard` is owned by `@repo/plugin-web-board-core`.
- Detail modal is owned by `@repo/plugin-web-board-workspaces`.
- Board storage is `xai_boards_v2`, now with row #7 read/migration/entity helper
  support.
- Card detail writes go through `updateCardInList(...)`.

### Tasks

- Runtime package is `@repo/plugin-web-tasks`.
- Public surface currently exports:
  - `TasksModule`
  - `tasksWebModuleRegistration`
  - `TaskCard`, `TaskCol`, `BucketId`, `TaskTagId`, `TaskTitleBundle`
- Actual persisted key is `xai_task_cols`.
- Tasks docs explicitly say consumers must not import internal modules.
- `TasksModule` persists task columns after drag/drop.
- Completion checkbox state is currently in-memory only; persisted completed
  tasks only exist in `TaskCol.completed` seed/group data.

## Reference Product Alignment

Trello cards can be treated as project task records. This row does not attempt a
full bidirectional task-management system. It adds the minimum useful link:

- create a task from the board card
- store a stable task reference on the card
- surface the task's persisted bucket/status back inside card detail

This matches the lightweight Project module direction without turning Board into
a second Tasks editor.

## Recommended Scope

1. Extend `BoardCard` with an additive task-link field.
2. Extend `@repo/plugin-web-tasks` public surface with safe helpers:
   - load task columns from raw `xai_task_cols` or seed
   - create a Task card from a board-card reference
   - upsert/find a board-linked task
3. In Board card detail:
   - show a "Task" section
   - if unlinked, show Create task
   - if linked, show task bucket/status and Unlink
4. Store the created task in `xai_task_cols`.
5. Store the task reference in `BoardCard.taskLink`.
6. Keep link unlinking local to the board card. Unlink does not delete the task.

## Non-Goals

- No existing-task picker/search.
- No Task detail/editor modal.
- No router navigation to a specific task.
- No reverse link UI in Tasks.
- No task delete when a board card is deleted.
- No persisted completed checkbox state.
- No event-bus changes.
- No backend sync.

## Risks

| Risk | Mitigation |
|---|---|
| Board imports Tasks internals. | Add public Tasks helpers and import only from `@repo/plugin-web-tasks`. |
| Linked status promises more than Tasks persists. | Status reflects persisted bucket/completed group only; document in API/dev_log. |
| Task duplication on repeated clicks. | Upsert by deterministic board-linked task id/source. |
| Card archive/delete leaves orphan tasks. | Accept for v1; unlink/delete cleanup is separate lifecycle policy. |
| Storage key shape conflicts with registry placeholder type. | Reuse Tasks package boundary helper; Board never writes raw unvalidated shapes. |

## Recommended Phases

1. **P1 docs/contract**: discovery/design/api/test/dev_log.
2. **P2 tasks public helper**: additive public task-link helper and guard updates.
3. **P3 board core/detail integration**: `BoardCard.taskLink`, guard, detail UI,
   workspace `xai_task_cols` read/write.
4. **P4 verification/ship docs**: package tests, Web gates, smoke `/app/board`.
