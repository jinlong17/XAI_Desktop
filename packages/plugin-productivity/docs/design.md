# Plugin Productivity Design

## Scope

`@repo/plugin-productivity` owns Todo, Pomodoro, and Habit business logic. It does not depend on `@repo/core-data` while the repository layer is still in development.

## Decisions

- Todo, Pomodoro, and Habit state are separated by Context hooks.
- Todo and Habit persistence use `DataAdapter<T>` with `LocalStorageAdapter<T>` as the mock-first default.
- Pomodoro is local UI/runtime state for now; completion links back to Todo by incrementing `pomodoroCount`.
- Label relationships are stored as string IDs. The package does not import `plugin-labels` directly while plugin APIs are still unstable.
- Eisenhower quadrant assignment is deterministic and based on title keywords plus due-date urgency.

---

## Phase: productivity:* typed events emit (2026-05-23)

| Field | Value |
|---|---|
| Review Doc | `docs/reviews/plugin-productivity/20260523-discovery-review.md` |
| Brief | `docs/reviews/plugin-productivity/20260523-feature-brief.md` |
| Review Date | 2026-05-23 |
| ADR-lite | not required (additive on existing `@repo/core/events` contract) |

### Selected option

Wire three additive cross-window typed events from inside the three productivity stores using the existing Stable `@repo/core/events` typed wrapper. No core business-logic surface change; `packages/core/src/types/events.ts` change is declaration only.

### Frozen assumptions (carried from discovery)

- **A1.** Event wire names are exactly: `productivity:pomodoro-completed`, `productivity:todo-due`, `productivity:habit-reminder`.
- **A2.** `EventMap` change in `packages/core/src/types/events.ts` is declaration-only — no business logic in core.
- **A3.** `packages/core/src/events/{emitter,listener,index}.ts` are not edited.
- **A4.** No UI changes (`components/**`, `web/**`, `console-views.tsx` are out of scope).
- **A5.** `Habit` entity is not extended with a reminder-time field in this row; `productivity:habit-reminder` fires on `checkIn(habitId)` success.
- **A6.** Emit-site failure is swallowed via `.catch(() => undefined)` for non-Tauri runtimes.
- **A7.** Dedup is per-provider via `useRef`; not persisted across reloads.

### Emit sites (where each emit fires)

| Store | Trigger | Source line range (current) | Mechanism |
|---|---|---|---|
| `usePomodoroStore.tsx` | session completion (any mode) | tick `useEffect` lines 102–134 writes `lastCompletedAt` + `status: "completed"` | New `useEffect` keyed on `state.lastCompletedAt` + `state.status === "completed"` reads pre-transition mode/duration from a `useRef<{mode, durationMs, cyclesCompleted, linkedTodoId} \| null>` captured inside the tick writer; emits then clears the ref. Dedup via `useRef<string \| null>` holding last-emitted ISO. |
| `useTodoStore.tsx` | dueDate boundary crossed for an open/in-progress todo | n/a — new logic | `useEffect` recomputed on `todos` change: scan for `todos` with non-empty `dueDate`, `status ∈ {open, in-progress}`, and `dueBoundaryAt(dueDate) ≤ Date.now()` not yet in dedup set → emit. Then schedule `setTimeout` for next future boundary; callback emits and re-schedules. Dedup `useRef<Set<string>>` keyed `${todoId}:${dueDate}`; entries pruned when status moves to done/archived or dueDate changes. |
| `useHabitStore.tsx` | successful `checkIn(habitId, date?)` resolves | new logic inside `checkIn` callback | After `persist({...})` resolves, compute dedup key `${habitId}:${date}` (default UTC today). If absent → add to `useRef<Set<string>>` and emit with the post-persist `streak` value. |

### Dedup mechanism

- **Pomodoro**: `useRef<string | null>` storing the last emitted `completedAt`. Emit gate: `if (current.lastEmittedAt === state.lastCompletedAt) return;`
- **Todo**: `useRef<Set<string>>` keyed `${todoId}:${dueDate}`. Cleared per-todo when:
  - `todo.dueDate` value mutates (entry for old dueDate is left stale; harmless because the new dueDate produces a different key)
  - `todo.status` transitions to `done` or `archived` (entry purged on the next effect run)
  - `todo` is removed (entry purged)
- **Habit**: `useRef<Set<string>>` keyed `${habitId}:${date}` (UTC day). Day boundary naturally re-keys; no explicit clear required.

### Payload shape

See `docs/api.md` for the TypeScript form. Discovery review §3.4 records the
per-field rationale.

### Non-Tauri runtime contract

Every `emitEvent(...)` call site wraps with `.catch(() => undefined)`. Vitest
runs without a Tauri IPC bridge; tests mock `@repo/core/events` so the network
path is never taken. The wrapper itself is not modified.

### Out of scope (re-stated)

- Consumer subscriptions (Console list refresh, menu-bar reminder, statistics surfaces) — separate future rows.
- Persistence schema changes for `Habit.reminderAt` — future row.
- PLUGIN_MAP Stable promotion for `plugin-productivity` — W0.C, not this row.
