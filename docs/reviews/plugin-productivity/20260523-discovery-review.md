# plugin-productivity — Discovery Review: productivity:* typed events emit

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Phase | feature-plan (discovery) |
| Date | 2026-05-23 |
| Author | feature-plan (Claude) |
| Feature slug | `plugin-productivity` |
| Brief | `docs/reviews/plugin-productivity/20260523-feature-brief.md` |
| Predecessor dev_log state | `Status: READY_FOR_VERIFY` (2026-05-20 Track B Codex) — reset to `NEEDS_REVIEW` for this phase |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| ADR-lite needed | no |
| External research | None required (no third-party library or vendor selection — entirely internal contract additions over an already-Stable typed-event surface). |

---

## 1. Problem Framing

`plugin-productivity` owns three store hooks (`usePomodoroStore`,
`useTodoStore`, `useHabitStore`) whose state transitions are not yet observable
by other windows / tabs. `@repo/core/events` (typed event bus over Tauri's
`emit`/`listen`) is Stable and already used by `plugin-account` and
`plugin-console`. The brief converts the deferred "Known Gaps" entry into the
next phase: declare three additive `EventMap` entries, wire `emitEvent(...)`
inside the three stores at the correct mutation outlets, and cover each emit
with a vitest unit test that mocks `@repo/core/events`.

This row is additive and intra-app local IPC. No persistence schema change,
no permission prompt, no Tauri command signature change, no UI change.

## 2. Code Inspection Findings

Resolved from reading actual source (not the brief's assumptions):

### 2.1 `usePomodoroStore.tsx`

- Already has a clean transition site: the `setInterval` tick in
  `useEffect` (lines 102–134) writes `status: "completed"` and
  `lastCompletedAt: new Date().toISOString()` at the moment a session ends,
  for **both** `focus` and `short-break` / `long-break` branches.
- `lastCompletedTodoId` is captured at the moment of focus completion (line
  119) and explicitly cleared (set to `null`) at break completion (line 128).
- `mode` after the transition refers to the **next** mode (e.g. `mode` is
  `short-break` after a `focus` finish); to emit "the mode that just
  finished" we must capture the value **before** the state writer mutates,
  using the local `current` closure variable.
- `state.settings` is in scope inside the writer; we can compute
  `durationMs` from `settings` × the just-finished mode.
- `cyclesCompleted` is incremented inside the focus branch (line 111) — the
  value we emit on focus completion should be the **incremented** value
  (post-transition).
- The tick writer runs inside `setState((current) => ...)`; emitting
  synchronously from inside that updater would violate React's "no side
  effects inside reducers" guidance. Plan: derive the emit metadata inside
  the writer, write `lastCompletedAt`, and then emit from a separate
  `useEffect` watching `state.lastCompletedAt` + `state.status === "completed"`
  (with a `useRef<string | null>` tracking the last-emitted timestamp for
  dedup).

### 2.2 `useTodoStore.tsx`

- `Todo.dueDate` is an optional `YYYY-MM-DD` string (no time-of-day; see
  `packages/plugin-productivity/src/types.ts:24`). Existing
  `isTodayOrPast(dateText?)` (lines 58–63 of `useTodoStore.tsx`) anchors due
  to local-time end-of-day (`T23:59:59`). For event semantics we will adopt
  the same boundary so "becoming due" and "is overdue" agree across the
  plugin.
- No existing reminder / polling loop. We will add a single `useEffect` per
  provider that, after `todos` mutates, finds the soonest future
  `dueBoundaryAt` among `status === "open" | "in-progress"` todos and
  schedules a `window.setTimeout` to fire exactly at that boundary; the
  callback re-scans, emits for all newly-crossed todos, then re-schedules
  for the next boundary. Mount-time scan covers the case where due
  boundaries are already past (initial hydration from `LocalStorageAdapter`).
- Dedup key: `${todoId}:${dueDate}` (mounting twice or refreshing the same
  list must not double-emit). Held in a per-provider
  `useRef<Set<string>>()`.
- Source-of-truth events that should NOT trigger emit:
  - status moves to `done` or `archived` (clear the dedup key so a later
    reopen + re-cross can re-emit).
  - `dueDate` changes to a future value (clear the dedup key).
  - `dueDate` is undefined (never emit).

### 2.3 `useHabitStore.tsx`

- The current `Habit` entity does **NOT** carry any reminder-time field
  (no `reminderAt` / `notifyAt` / `alarm` / `reminder` substring exists
  under `packages/plugin-productivity/`). The brief's Open Q2 asked
  whether the entity already carries a reminder time — it does not.
- Adding a reminder-time field would push us into a persistence schema
  change, which the brief's §1.4 explicitly excludes ("No persistence
  schema changes").
- Decision: re-interpret the event name's semantics within the brief's
  bounds. `productivity:habit-reminder` will fire on a successful
  `checkIn(habitId)` — i.e. it signals "habit just transitioned to
  completed-for-today" so downstream surfaces (Console, future menu-bar
  reminder, statistics overlay) can refresh.
- Dedup key: `${habitId}:${date}` where `date` is the UTC day key already
  used by `todayUtcKey()` (line 42 of `useHabitStore.tsx`). Per-provider
  `useRef<Set<string>>()` cleared at midnight UTC (next check-in on a new
  day key produces a different set entry naturally; no explicit timer
  needed).
- A future row may introduce a true scheduled reminder (`reminderAt` on
  the Habit entity + a `useEffect` scheduler analogous to Todo). That row
  would be additive on top of the contract this row ships and may rename
  the existing wire event or add a sibling `productivity:habit-due`.
  Documented as a follow-up note in `dev_log.md`.

### 2.4 `emitEvent` runtime behavior

- `packages/core/src/events/emitter.ts` is a thin wrapper:
  ```ts
  export async function emitEvent<K extends keyof EventMap>(event, payload) {
    await emit(event, payload);
  }
  ```
- It returns a Promise that **rejects** on non-Tauri runtimes (Tauri's
  `@tauri-apps/api/event#emit` throws when the IPC bridge is absent — vitest
  does not provide one). The brief's §1.11 assumed `emitEvent` "already
  returns a no-op-shaped Promise" — that is **not** accurate.
- Decision: emit-site adopts `void emitEvent(...).catch(() => undefined)` so
  unhandled rejections do not leak into vitest output or non-Tauri shells
  (Web). This is the minimum-surface fix and keeps the wrapper itself
  unchanged (the brief locks `packages/core/src/events/{emitter,listener,index}.ts`
  as out-of-scope).
- Tests mock `@repo/core/events` via `vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()) }))` so the network path never
  runs and assertions read `emitEvent.mock.calls`.

### 2.5 Vitest environment

- `packages/plugin-productivity/vitest.config.ts` defaults to
  `environment: "node"`. The three new tests will render Provider hooks
  with `react-dom/client`'s `createRoot` (same pattern as
  `TodoWebModuleRoute.test.tsx`) so they need `// @vitest-environment jsdom`
  at the top of each file.
- The vitest config already aliases `@repo/core/events` to the source file,
  so `vi.mock("@repo/core/events", ...)` resolves correctly.

## 3. Candidate Options Considered

### 3.1 Todo due-event source (Brief Open Q1)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. Periodic polling (e.g. every 60s) | Simple; fires regardless of mutations | Wastes wakeups; never aligns with the exact boundary; sandbox-unfriendly | Reject |
| B. State-transition on mutation only | No timers; deterministic | Misses the "passive crossing" case where no user mutation occurs — a todo silently goes overdue at midnight and nothing fires | Reject alone |
| **C. `setTimeout` scheduled to next boundary + mount-time scan + on-mutation re-eval (chosen)** | Exactly-once fire; no continuous polling; deterministic in tests via `vi.useFakeTimers()` | Slightly more code than B | **Adopt** |

### 3.2 Habit reminder source (Brief Open Q2)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. Add `reminderAt` field to Habit + scheduler | Honors the literal event name | Persistence schema change; brief excludes this | Reject (defer to future row) |
| **B. Emit on `checkIn` success — "habit just transitioned to completed-for-today" (chosen)** | No schema change; deterministic; matches what the existing UI flow can drive today | Renames the semantic of `habit-reminder` away from "scheduled reminder"; document explicitly | **Adopt** |
| C. Skip the habit emit until a future row adds a real reminder field | Honest | Closes only 2 of the 3 brief items; leaves D-3 drift open | Reject |

### 3.3 Dedup mechanism (Brief Open Q3)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. No dedup (rely on the natural single-write site) | Simplest | Re-render or hydration may re-observe a "completed" state and re-emit | Reject |
| **B. Per-provider `useRef<Set<string>>` of already-emitted keys (chosen)** | Idempotent; survives re-render; resets on provider unmount which matches session lifetime | Slightly more code per store | **Adopt** |
| C. Move dedup into `emitEvent` itself | Centralized | Out of scope (`events/emitter.ts` is locked); also wrong layer — dedup is a domain concern | Reject |

### 3.4 Payload schema (Brief Open Q4)

Adopted payloads (see `packages/plugin-productivity/docs/api.md` for
TypeScript form):

- `productivity:pomodoro-completed`:
  - `mode: PomodoroMode` — the mode that just **finished** (not the next one)
  - `cyclesCompleted: number` — value after increment (only changes on focus end)
  - `linkedTodoId: string | null` — the `lastCompletedTodoId` captured at transition
  - `completedAt: string` — ISO timestamp; same value written to `state.lastCompletedAt`
  - `durationMs: number` — `settings.focusMinutes/shortBreakMinutes/longBreakMinutes × 60_000`
- `productivity:todo-due`:
  - `todoId: string`
  - `title: string`
  - `dueDate: string` — the `YYYY-MM-DD` source value
  - `quadrant: TodoQuadrant`
  - `dueBoundaryAt: string` — ISO timestamp of the local-end-of-day boundary that was crossed
- `productivity:habit-reminder`:
  - `habitId: string`
  - `name: string`
  - `frequency: HabitFrequency`
  - `date: string` — UTC day key (`YYYY-MM-DD`)
  - `streak: number` — post-checkIn streak
  - `completedAt: string` — ISO timestamp of the check-in

All fields are productivity-domain identifiers, mode tags, or millisecond /
ISO timestamps. No account-bound PII, no labels join, no description /
notes text. Compatible with §1.9 of the brief.

### 3.5 Non-Tauri runtime guard (Brief Open Q5)

Adopted: emit-site `.catch(() => undefined)` (see §2.4). Tests mock
`@repo/core/events` so no actual Tauri call runs in vitest.

## 4. Recommendation

Implement the brief as-written for `pomodoro-completed` and `todo-due`,
and adopt the **Option B** re-interpretation for `habit-reminder` (emit on
`checkIn` success). Schedule a follow-up note for a future row that
introduces a true `reminderAt` field on `Habit` if menu-bar reminders are
prioritized.

## 5. Risks and Open Questions

| Risk | Severity | Mitigation |
|---|---|---|
| `lastCompletedAt` only updates when `setState` runs; emitting from a `useEffect` keyed on it could double-fire on Strict Mode double-invoke in tests | low | Dedup `useRef<string \| null>` holds last-emitted ISO; equality check before emit. |
| Todo dueDate boundary scheduling could schedule a `setTimeout` with a delay >24.8 days (signed 32-bit ms max); irrelevant in practice | very low | Cap at 24h; the effect re-schedules after each emit anyway. |
| Habit semantic re-interpretation may surprise downstream consumers expecting a true scheduled reminder | low–medium | Document in `dev_log.md` Known Gaps / Follow-ups; the consumer rows are not on the wire yet. |
| Test-mode timers leaking real Date | low | Tests use `vi.useFakeTimers()` + `vi.setSystemTime(...)` for boundary scenarios. |
| Emit-site `.catch()` swallows real Tauri errors in production | low | Acceptable — emits are advisory; a failed cross-window signal must not break the store mutation. Parity with `plugin-account` `void emitEvent(...)`. |

Open questions deferred to feature-review:

- Q-R1: Confirm the habit semantic re-interpretation (§3.2 Option B) is
  acceptable, or require a follow-up ADR-lite to formalize the rename.

## 6. Frozen Assumptions (carried into design.md)

- A1. Event wire names are exactly the three names in the brief.
- A2. `EventMap` change is declaration-only; no business logic moves into
  `packages/core/`.
- A3. `packages/core/src/events/{emitter,listener,index}.ts` are not edited.
- A4. No UI / Console / Web / Tauri / Rust changes.
- A5. `Habit` entity is **not** extended with a reminder-time field in this
  row; `habit-reminder` fires on `checkIn` success.
- A6. Emit-site failure is swallowed via `.catch(() => undefined)` to keep
  non-Tauri runtimes (vitest, web shell) clean. The underlying
  `emitEvent` wrapper is unchanged.
- A7. Dedup is per-provider via `useRef`; not persisted across reloads.
