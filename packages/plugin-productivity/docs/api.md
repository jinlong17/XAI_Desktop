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

---

## Cross-window typed events (Phase 2026-05-23)

`plugin-productivity` is an emit-side owner of the following three event keys
on `@repo/core/events`. Consumers (Console / Web / future menu-bar surfaces)
subscribe via `useEventListener("productivity:...", handler)` in their own rows.

### `EventMap` additions (declared in `packages/core/src/types/events.ts`)

```ts
// Productivity events (emit-side owner: plugin-productivity)
'productivity:pomodoro-completed': {
  /** The mode that just finished (focus | short-break | long-break). */
  mode: PomodoroMode;
  /** Total focus cycles completed after the just-finished session (unchanged for break modes). */
  cyclesCompleted: number;
  /** Todo linked to the just-finished focus session; null for breaks or no-link focus. */
  linkedTodoId: string | null;
  /** ISO timestamp of completion (same value the store writes to lastCompletedAt). */
  completedAt: string;
  /** Configured duration of the just-finished session, in milliseconds. */
  durationMs: number;
};
'productivity:todo-due': {
  /** Todo whose dueDate boundary just crossed past now. */
  todoId: string;
  /** Snapshot of title at emit time (for downstream notifications). */
  title: string;
  /** Source dueDate value (YYYY-MM-DD). */
  dueDate: string;
  /** Eisenhower quadrant at emit time. */
  quadrant: TodoQuadrant;
  /** ISO timestamp of the local-end-of-day boundary that was crossed. */
  dueBoundaryAt: string;
};
'productivity:habit-reminder': {
  /** Habit that just transitioned to completed-for-today (checkIn success). */
  habitId: string;
  /** Snapshot of name at emit time. */
  name: string;
  frequency: HabitFrequency;
  /** UTC day key the check-in applied to (YYYY-MM-DD). */
  date: string;
  /** Post-checkIn streak value. */
  streak: number;
  /** ISO timestamp of the check-in. */
  completedAt: string;
};
```

The literal `PomodoroMode`, `TodoQuadrant`, and `HabitFrequency` referenced
above are domain unions owned by `packages/plugin-productivity/src/types.ts`.
Because `EventMap` lives in `@repo/core` and we will not introduce a reverse
dependency from core → plugin, the actual `events.ts` declaration will inline
the string-literal unions (e.g. `'focus' | 'short-break' | 'long-break'`,
`'do' | 'schedule' | 'delegate' | 'eliminate'`, `'daily' | 'weekdays' | 'weekly'`).
The plugin-side store-emit call signatures use the imported domain types so a
divergence in the plugin's union surface will fail `pnpm --filter
@repo/plugin-productivity check-types`.

### Error semantics

- Emit failure (e.g. running outside a Tauri runtime) is **swallowed** at the
  call site via `void emitEvent("productivity:...", payload).catch(() => undefined);`
  Emit is advisory: a missing IPC bridge must never break the store mutation
  that triggered it. This matches the existing pattern in
  `plugin-account/register-plugin.ts:62`.
- Listener subscription errors are the consumer's concern; not modeled here.

### Idempotency / dedup contract

Each event is emitted **at most once** per logical occurrence within a single
provider lifetime:

- `productivity:pomodoro-completed` — at most once per session-completion
  transition. Re-render / Strict Mode double-effect does not re-emit.
- `productivity:todo-due` — at most once per `(todoId, dueDate)` pair. If a
  Todo's `dueDate` is bumped to a later date and then re-crosses, it re-emits
  under the new key. If status moves to `done`/`archived`, no further emit
  for that pair.
- `productivity:habit-reminder` — at most once per `(habitId, date)` pair
  per provider lifetime. New UTC day key produces a new emit. Multiple
  same-day `checkIn(habitId)` calls (which increment `history[date].count`
  past 1) do not re-emit.

Provider remount or page reload resets the in-memory dedup set; this is the
documented limit of "per provider lifetime". A reload that re-hydrates an
already-past dueDate will re-emit at most once during the mount-time scan,
which downstream consumers must treat as idempotent (or use their own dedup).

### Permission notes

None. Cross-window typed events are local Tauri IPC; payload fields are
productivity-domain identifiers / mode tags / timestamps with no account-bound
PII.

### Versioning

- This is the v1 declaration of all three events. Additions to a payload
  shape (new optional field) are non-breaking.
- Removing a field or renaming an event key is breaking and would require an
  ADR-lite plus consumer migration.
