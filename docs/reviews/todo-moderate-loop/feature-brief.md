# G4-E2 Todo Moderate Loop Feature Brief

## Goal

Create a Todo workflow that supports quick capture, deterministic Eisenhower quadrant assignment, list rendering, and Pomodoro handoff.

## Scope

- Todo entity with status, priority, quadrant, due date, labels, and Pomodoro count.
- `useTodoStore` backed by `DataAdapter<Todo>`.
- `TodoQuickAdd`, `TodoItem`, `TodoList`, and `EisenhowerMatrix`.
- Mock-first LocalStorage persistence.

## Out of Scope

- Repository adapter.
- Desktop event ingestion from organizer grids.
- Cross-device sync.

## Validation

- `pnpm --filter @repo/plugin-productivity check-types`
