# Plugin Project Design

## Scope

`@repo/plugin-project` owns a mock-first project board scaffold with pure React drag/drop card movement.

## Decisions

- Projects and Cards use separate `DataAdapter<T>` instances because they are separate entities.
- Board lists live inside `Project.lists`; cards reference lists by `listId`.
- Drag/drop is implemented with native React event handlers and local store updates. No new dependency is introduced.
- Labels are stored as string IDs to avoid direct dependency on `plugin-labels`.
- Card detail supports description and checklist editing while keeping the requested Card fields intact.
