# G4-E3 Pomodoro Timer Feature Brief

## Goal

Add a Pomodoro timer that runs 25/5/15 minute cycles and can be tied to a selected Todo.

## Scope

- `usePomodoroStore` for runtime timer state.
- `PomodoroTimer` for console/control usage.
- `PomodoroOverlay` as a pure React lightweight desktop overlay.
- Todo integration through selected todo ID and `pomodoroCount` increment on completed focus cycle.

## Out of Scope

- Native overlay window registration.
- OS notifications.
- Background execution when the React tree is unmounted.

## Validation

- `pnpm --filter @repo/plugin-productivity check-types`
