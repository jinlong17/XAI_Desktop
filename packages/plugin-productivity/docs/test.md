# Plugin Productivity Test Notes

## Current Gates

- `pnpm --filter @repo/plugin-productivity check-types`
- `pnpm --filter @repo/plugin-productivity test`
- `pnpm --filter @repo/core check-types`

## Manual Coverage

- Create a todo from quick add and confirm quadrant assignment.
- Drag a todo between Eisenhower quadrants.
- Select a todo and start Pomodoro.
- Complete a focus cycle and confirm the selected todo increments `pomodoroCount`.
- Create a habit and check in for today.
- Confirm `HabitCalendarMini` reflects history counts.

---

## Phase: productivity:* typed events emit (2026-05-23)

### Strategy

- **No Mock for runtime dependencies.** `@repo/core/events` is Stable; the three productivity stores live inside this slice.
- **Mock `@repo/core/events`'s `emitEvent` in unit tests** so emit calls can be asserted shape-by-shape without going through Tauri's IPC bridge (vitest runs without one).
- **No new gates required on top of the existing check-types + test scripts** — the three new test files run inside the existing `pnpm --filter @repo/plugin-productivity test` invocation.

### Test files (co-located, additive)

| File | Scope |
|---|---|
| `packages/plugin-productivity/src/hooks/usePomodoroStore.test.tsx` | Emit on `focus`, `short-break`, `long-break` completion; dedup on re-render; payload schema. |
| `packages/plugin-productivity/src/hooks/useTodoStore.test.tsx` | Emit when due boundary crossed at mount; emit on `setTimeout` boundary trigger; dedup per `(todoId, dueDate)`; no emit when status flips to `done`. |
| `packages/plugin-productivity/src/hooks/useHabitStore.test.tsx` | Emit on `checkIn` success; dedup per `(habitId, date)`; payload includes post-checkIn streak. |

### Mock pattern (shared across the three files)

```ts
import { vi } from "vitest";

vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));

import { emitEvent } from "@repo/core/events";
const emitEventMock = vi.mocked(emitEvent);
```

The vitest config alias for `@repo/core/events` makes the mock target resolve
deterministically. Tests assert via `expect(emitEventMock).toHaveBeenCalledWith("productivity:...", { ... })`.

### Required scenarios (per store)

#### usePomodoroStore

- **AC-P1**: `focus` session completion emits `productivity:pomodoro-completed`
  exactly once with `mode: "focus"`, `cyclesCompleted: 1`, `linkedTodoId: <selected>`,
  `durationMs: 25 * 60_000`, valid ISO `completedAt`.
- **AC-P2**: `short-break` completion emits with `mode: "short-break"`,
  `linkedTodoId: null`, `durationMs: 5 * 60_000`.
- **AC-P3**: `long-break` (post 4th focus) completion emits with
  `mode: "long-break"`, `durationMs: 15 * 60_000`.
- **AC-P4**: Forcing a Strict-Mode-like double effect run with the same
  `lastCompletedAt` does NOT emit twice.
- **AC-P5**: Calling `reset()` does NOT emit.
- **AC-P6**: Calling `skip()` (which sets `status: "idle"`, not `"completed"`)
  does NOT emit.

#### useTodoStore

- **AC-T1**: Mount with a seed todo whose `dueDate` is yesterday and status is
  `open` emits `productivity:todo-due` exactly once at mount-time scan.
- **AC-T2**: With `vi.useFakeTimers()` + `vi.setSystemTime(...)` advanced past a
  future-dated todo's end-of-day boundary, the scheduled emit fires.
- **AC-T3**: Re-rendering the provider (e.g. unrelated state change in parent)
  does NOT re-emit for the same `(todoId, dueDate)`.
- **AC-T4**: Updating an already-emitted todo's `status` to `done` does NOT emit
  again; subsequent reopen + same dueDate does NOT re-emit either (dedup key
  unchanged).
- **AC-T5**: Updating a todo's `dueDate` from past to a later future date and
  then advancing fake time past the new boundary emits again under the new
  `(todoId, newDueDate)` key.
- **AC-T6**: Todo without `dueDate` never emits.
- **AC-T7**: Payload contains exactly `{ todoId, title, dueDate, quadrant, dueBoundaryAt }`.

#### useHabitStore

- **AC-H1**: `checkIn(habitId)` resolves → exactly one emit with
  `{ habitId, name, frequency, date, streak, completedAt }`.
- **AC-H2**: Calling `checkIn(habitId)` twice on the same UTC day (which
  increments `history[date].count` past 1) emits only once.
- **AC-H3**: Calling `checkIn(habitId, "2026-05-24")` followed by
  `checkIn(habitId, "2026-05-25")` emits twice (different `date` keys).
- **AC-H4**: `updateHabit` / `deleteHabit` / `createHabit` do NOT emit.
- **AC-H5**: `streak` in payload reflects the post-persist value (not the
  pre-checkIn value).

### Negative-runtime / compile-smoke

The api.md "EventMap additions" block becomes real code in
`packages/core/src/types/events.ts`. The plugin-side emit call sites import
`emitEvent` from `@repo/core/events` and so check-types acts as a contract
test: a payload-shape divergence between the plugin and the EventMap
declaration is a TypeScript error.

### What we are NOT testing

- Listener-side behavior. Consumer rows own their own tests.
- Tauri's real IPC delivery. That belongs in a future cross-window integration
  test row; the brief's §1.10 says "events are intra-app local IPC" and
  feature-verify is `Verify Cross-vendor: no` for this row.
- Persistence schema or migrations. None changed.

### Real-hardware verification

**Not required for this row** (per brief §4 Planner Handoff). No multi-window
navigation, no macOS native API, no Tauri command signature change. Downstream
consumers that subscribe to these events will themselves trigger real-hardware
verification when they ship.
