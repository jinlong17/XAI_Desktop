# Plugin Productivity Design

## Scope

`@repo/plugin-productivity` owns Todo, Pomodoro, and Habit business logic. It does not depend on `@repo/core-data` while the repository layer is still in development.

## Decisions

- Todo, Pomodoro, and Habit state are separated by Context hooks.
- Todo and Habit persistence use `DataAdapter<T>` with `LocalStorageAdapter<T>` as the mock-first default.
- Pomodoro is local UI/runtime state for now; completion links back to Todo by incrementing `pomodoroCount`.
- Label relationships are stored as string IDs. The package does not import `plugin-labels` directly while plugin APIs are still unstable.
- Eisenhower quadrant assignment is deterministic and based on title keywords plus due-date urgency.
