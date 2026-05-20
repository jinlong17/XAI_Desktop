# G4-E4 Habits Basics Feature Brief

## Goal

Create a simple habit tracker with local check-ins, streak calculation, labels, and compact calendar rendering.

## Scope

- Habit entity with frequency, streak, history, and label IDs.
- `useHabitStore` backed by `DataAdapter<Habit>`.
- `HabitCalendarMini`, `HabitCard`, and `HabitList`.

## Out of Scope

- Advanced recurrence rules.
- Reminder scheduling.
- Repository adapter.

## Validation

- `pnpm --filter @repo/plugin-productivity check-types`
