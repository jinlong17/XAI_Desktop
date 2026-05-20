# Plugin Productivity Test Notes

## Current Gates

- `pnpm --filter @repo/plugin-productivity check-types`

## Manual Coverage

- Create a todo from quick add and confirm quadrant assignment.
- Drag a todo between Eisenhower quadrants.
- Select a todo and start Pomodoro.
- Complete a focus cycle and confirm the selected todo increments `pomodoroCount`.
- Create a habit and check in for today.
- Confirm `HabitCalendarMini` reflects history counts.
