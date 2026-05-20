# Plugin Productivity API

## Todo

- `TodoStoreProvider`
- `useTodoStore`
- `autoAssignQuadrant`
- `TodoQuickAdd`
- `TodoItem`
- `TodoList`
- `EisenhowerMatrix`

## Pomodoro

- `PomodoroStoreProvider`
- `usePomodoroStore`
- `PomodoroTimer`
- `PomodoroOverlay`

## Habits

- `HabitStoreProvider`
- `useHabitStore`
- `HabitCalendarMini`
- `HabitCard`
- `HabitList`

## Persistence

Todo and Habit stores accept `DataAdapter<T>` and default to package-local `LocalStorageAdapter<T>`.
