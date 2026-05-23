# Plugin Productivity Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | plugin-productivity |
| Title | productivity:* typed events emit |
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | ship |
| Executor | feature-verify (Claude) |
| Updated | 2026-05-23 |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Blockers | none |
| Brief | `docs/reviews/plugin-productivity/20260523-feature-brief.md` |
| Discovery Review | `docs/reviews/plugin-productivity/20260523-discovery-review.md` |
| Predecessor state | Track B Codex `READY_FOR_VERIFY` (2026-05-20) — superseded by this phase. Historical Work Log preserved below. |

## Review Notes (2026-05-23 feature-review)

**Verdict: APPROVED. 0 blockers, 3 non-blocking recommendations.**

Both reviewer-flagged decisions accepted:

1. **Habit emit semantic re-interpretation** (discovery review §3.2 Option B) —
   ACCEPTED. Adding `Habit.reminderAt` would violate the brief's own §1.4
   "no persistence schema changes" lock; emitting on `checkIn` success is the
   largest-coverage option inside scope. design.md "Out of scope" and Known
   Gaps both record the follow-up row. No ADR-lite rename required —
   `productivity:habit-reminder` wire name is stable; the precise semantic
   will be documented by consumer rows when they subscribe.

2. **Emit-site `.catch(() => undefined)` swallow** (discovery review §2.4) —
   ACCEPTED. Verified `packages/core/src/events/emitter.ts` is `await emit(...)`
   which rejects on non-Tauri runtimes. Swallowing at the call site honours
   the brief's locked-out-of-scope list for `events/{emitter,listener,index}.ts`
   and keeps "advisory emit must not break store mutation" local.

Gates passed:
- File-boundary: emit logic stays in plugin; `events.ts` change is type-only.
- Cross-window contract: additive only (3 new keys; no existing key edits).
- Mock strategy: No Mock for runtime; `vi.mock("@repo/core/events")` in tests.
- AC coverage: 17 binary AC scenarios (AC-P1..P6, AC-T1..T7, AC-H1..H5).
- Phase plan: 4 BUILD (one store-or-decl slice each) + VERIFY + SHIP; each
  BUILD stops for human confirmation per Workflow V2.
- Risks: Strict-Mode double-invoke, int32 setTimeout overflow, dedup remount,
  jsdom env all covered with concrete mitigations.
- Predecessor state line + historical Work Log preserved.

Non-blocking notes (feature-build can address in passing; not gating):

- N1. api.md says `.catch(() => undefined)` "matches" the
  `plugin-account/register-plugin.ts:62` pattern — that site is bare
  `void emitEvent(...)` without `.catch`. Soften to "extends the `void`
  pattern with `.catch()` for non-Tauri shells".
- N2. AC-T2 / AC-T5 combine `vi.useFakeTimers()` with `react-dom/client`
  rendering. Consider `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })`
  to keep microtask scheduling real and avoid mount-effect ordering bugs.
- N3. The shared mock stubs `useEventListener: vi.fn()`. `useTodoStore`
  internally wires `useOrganizerGridTaskListener` which depends on
  `useEventListener`. Confirm this passthrough is harmless in the Todo test,
  or supply a no-op implementation that returns the same shape.

## Known Gaps / Follow-ups

- Future row may extend `Habit` with a `reminderAt` field and a scheduler so
  `productivity:habit-reminder` can represent a true scheduled reminder
  rather than the current "checkIn success" semantic. Tracked as
  discovery-review §3.2 alternative A.
- D-3 drift closure for `plugin-labels` / `plugin-project` event emissions
  is out of scope for this row.
- PLUGIN_MAP Stable promotion (W0.C) is dependent on this row + verification
  + ship, but not driven by it directly.

## Phase Plan (this iteration)

| Phase | Goal | Files | Gate |
|---|---|---|---|
| **PLAN** (done) | Discovery + design/api/test docs + Status Panel reset | `docs/reviews/plugin-productivity/20260523-discovery-review.md`, `packages/plugin-productivity/docs/{design,api,test,dev_log}.md` | feature-review APPROVED |
| **BUILD-1** (done) | `EventMap` declaration only: add the three additive entries to `packages/core/src/types/events.ts`. No emit-site code yet. | `packages/core/src/types/events.ts` | `pnpm --filter @repo/core check-types` ; `pnpm --filter @repo/plugin-productivity check-types` — both green. Commit: 7ee5d6f |
| **BUILD-2** (done) | Wire `usePomodoroStore` emit + co-located vitest | `packages/plugin-productivity/src/hooks/usePomodoroStore.tsx`, `packages/plugin-productivity/src/hooks/usePomodoroStore.test.tsx` | `pnpm --filter @repo/plugin-productivity test -- usePomodoroStore` — 6/6 passed. Commit: 975063e |
| **BUILD-3** (done) | Wire `useTodoStore` emit + dedup + boundary scheduler + co-located vitest | `packages/plugin-productivity/src/hooks/useTodoStore.tsx`, `packages/plugin-productivity/src/hooks/useTodoStore.test.tsx` | `pnpm --filter @repo/plugin-productivity test -- useTodoStore` — 7/7 passed. Commit: 22395c4 |
| **BUILD-4** (done) | Wire `useHabitStore` emit on `checkIn` success + dedup + co-located vitest | `packages/plugin-productivity/src/hooks/useHabitStore.tsx`, `packages/plugin-productivity/src/hooks/useHabitStore.test.tsx` | `pnpm --filter @repo/plugin-productivity test -- useHabitStore` — 8/8 passed. Full suite: 33/33. Commit: e181917 |
| **VERIFY** (done) | Repo gates + dev_log bookkeeping | n/a | `pnpm --filter @repo/core check-types` green; `pnpm --filter @repo/plugin-productivity check-types` green; `pnpm --filter @repo/plugin-productivity test` 33/33 passed. See Verify Report below. |
| **SHIP** | commit + push under standard message template | dev_log only | READY_TO_SHIP confirmed |

Phasing note: the brief proposed 5 phases; this plan collapses Phase 5 of the
brief (repo gates + bookkeeping) into VERIFY, so feature-build runs four
phases (BUILD-1..4), and feature-verify owns the cross-gate sweep. Each
build phase stops for human confirmation per Workflow V2 rules.

## Risks (open at PLAN handoff)

| Risk | Severity | Mitigation |
|---|---|---|
| Habit semantic re-interpretation (event named `reminder`, fires on `checkIn`) may be rejected at review | low–medium | Discovery review §3.2 documents tradeoff + future-row escape; reviewer can either approve or require ADR-lite rename. |
| Dedup `useRef` resets on remount → mount-time scan re-emits already-past due Todos | low | Documented in api.md "Idempotency" section as expected behavior; consumers must be idempotent. |
| `setTimeout` for far-future boundaries (>24.8 days) overflows int32 | very low | Cap delay at 24h in BUILD-3; re-schedule after each emit. |
| Vitest `node` environment for new tests using `react-dom/client` | low | Each new test file declares `// @vitest-environment jsdom` (same pattern as `TodoWebModuleRoute.test.tsx`). |

## Verify Report (2026-05-23 feature-verify)

**Verdict: PASS — READY_TO_SHIP.**

### Gate results

| Gate | Command | Result |
|---|---|---|
| Core type check | `pnpm --filter @repo/core check-types` | green |
| Plugin type check | `pnpm --filter @repo/plugin-productivity check-types` | green |
| Plugin vitest (full) | `pnpm --filter @repo/plugin-productivity test` | 33/33 passed across 7 test files (usePomodoroStore 6, useHabitStore 8, useTodoStore 7, plus 12 pre-existing tests) |

Note on stderr "act(...) not configured" noise during useTodoStore.test.tsx: the
test file uses `react-dom/client` `createRoot()` with `// @vitest-environment jsdom`
(same pattern as `TodoWebModuleRoute.test.tsx`); this is the documented jsdom-env
tradeoff in the Risks table and does not represent a test failure. All assertions pass.

### Code-vs-contract

- `packages/core/src/types/events.ts` — three new `EventMap` entries (`productivity:pomodoro-completed`, `productivity:todo-due`, `productivity:habit-reminder`) match the payload shapes documented in `api.md` and `discovery-review §4`. String-literal unions inlined (no reverse-dep core→plugin); plugin domain types are not imported into core.
- `usePomodoroStore.tsx` — emits exactly once per session-completion via `useEffect([state.status, state.lastCompletedAt])` gated by `lastEmittedAtRef`. `completionSnapshotRef` correctly captures the **finished** mode + durationMs + post-increment cyclesCompleted + linkedTodoId (set to `null` for break completions). Matches discovery review §2.1 plan.
- `useTodoStore.tsx` — emits on dueAt crossing via mount-time scan + `setTimeout` capped at `MAX_TIMEOUT_MS = 24h`. Dedup keyed `${todoId}:${dueDate}` via `dueEmittedRef`. `done`/`archived` purges the dedup key (enabling re-emit under a new flow). Timers cleaned up in effect teardown.
- `useHabitStore.tsx` — emits inside `checkIn()` after `persist()` resolves, with post-persist `streak` and pre-captured `completedAt`. Dedup keyed `${habitId}:${date}` via `checkInEmittedRef`. Multiple same-day check-ins do not re-emit (AC-H2 covers).
- All three emit sites use `void emitEvent(...).catch(() => undefined)` per discovery-review §2.4 / api.md error semantics.

### File-boundary respect

Confirmed via `git diff d0be43f..b5bcfda` that the feature touches only:
- `packages/core/src/types/events.ts` (declaration only)
- `packages/plugin-productivity/src/hooks/{usePomodoroStore,useTodoStore,useHabitStore}.tsx` + `*.test.tsx`
- `packages/plugin-productivity/docs/{design,api,test,dev_log}.md`
- `docs/reviews/plugin-productivity/{20260523-feature-brief,20260523-discovery-review}.md`

Locked-out scopes (`packages/core/src/events/{emitter,listener,index}.ts`, `plugin-console`, `plugin-account`, `plugin-labels`, `plugin-project`, `plugin-calendar`, `apps/desktop/**`, Tauri commands, Rust) are untouched.

### Commit hygiene

| Commit | Subject | Phase intent | Body convention |
|---|---|---|---|
| 7ee5d6f | `feat(core/events): add three productivity EventMap entries (BUILD-1)` | BUILD-1: declaration only | Why/What/Scope/Risk/Docs/Tests present |
| 975063e | `feat(plugin-productivity): wire usePomodoroStore emit + tests (BUILD-2)` | BUILD-2: Pomodoro emit + 6 tests | Why/What/Scope/Risk/Docs/Tests present |
| 22395c4 | `feat(plugin-productivity): wire useTodoStore emit + dedup + tests (BUILD-3)` | BUILD-3: Todo emit/dedup/timer + 7 tests | Why/What/Scope/Risk/Docs/Tests present |
| e181917 | `feat(plugin-productivity): wire useHabitStore emit + dedup + tests (BUILD-4)` | BUILD-4: Habit emit on checkIn + 8 tests | Why/What/Scope/Risk/Docs/Tests present |
| e090dbc | `chore(plugin-productivity): update dev_log BUILD-1..4 complete, READY_FOR_VERIFY` | dev_log bookkeeping | Why/What/Scope/Risk/Docs/Tests present |
| b5bcfda | `docs(plugin-productivity): feature-plan artifacts for typed events emit row` | plan artifacts catch-up | Why/What/Scope/Risk/Docs/Tests present |

Each commit stays within a single phase boundary. No mixed-intent commits.

### Acceptance criteria (§1.12 of brief)

- [x] `packages/core/src/types/events.ts` has three additive EventMap entries.
- [x] `usePomodoroStore` emits exactly once per completed session per mode (AC-P1..P3 plus dedup AC-P4).
- [x] `useTodoStore` emits on dueAt crossing, deduped per `(todoId, dueDate)` (AC-T1..T7).
- [x] `useHabitStore` emits on successful `checkIn`, deduped per habit per day (AC-H1..H5).
- [x] Three vitest test files cover trigger + payload per store (21 new + 12 pre-existing = 33 total).
- [x] `pnpm --filter @repo/core check-types` passes.
- [x] `pnpm --filter @repo/plugin-productivity check-types` passes.
- [x] `pnpm --filter @repo/plugin-productivity test` passes.
- [x] dev_log reaches `READY_TO_SHIP` (this entry).

### Residual risks (non-blocking, documented)

- Dedup resets on provider remount / page reload — documented limit in `api.md §Idempotency`. Consumers must be idempotent.
- `productivity:habit-reminder` semantic = "checkIn success" rather than "scheduled reminder"; a future row may add `Habit.reminderAt` + scheduler. Tracked under Known Gaps.
- The three non-blocking review notes (N1/N2/N3) were not addressed inline but do not gate ship:
  - N1: `api.md` `.catch(() => undefined)` wording vs the actual `plugin-account/register-plugin.ts:62` bare `void emitEvent(...)` — cosmetic doc rewording only.
  - N2: AC-T2/T5 use full `vi.useFakeTimers()` rather than scoped `{ toFake: ['setTimeout', 'clearTimeout', 'Date'] }`; tests pass in practice, so the suggestion remains a future-pass refinement.
  - N3: shared mock stubs `useEventListener: vi.fn()`; Todo tests pass because `useOrganizerGridTaskListener` is harmless under the no-op stub.

## Work Log

- **2026-05-23 — feature-verify (Claude)** — Read brief, discovery review,
  api.md, dev_log, and the three store implementations. Ran gates:
  `pnpm --filter @repo/core check-types` green;
  `pnpm --filter @repo/plugin-productivity check-types` green;
  `pnpm --filter @repo/plugin-productivity test` 33/33 passed
  (usePomodoroStore 6, useHabitStore 8, useTodoStore 7, plus 12 pre-existing).
  Verified `EventMap` entries match `api.md` payload shapes and that all three
  emit sites use `void emitEvent(...).catch(() => undefined)`. Verified file
  boundaries: locked-out scopes untouched. Verified six feature commits each
  hold a single phase intent with full Why/What/Scope/Risk/Docs/Tests bodies.
  All 17 binary AC scenarios (AC-P1..P6, AC-T1..T7, AC-H1..H5) covered by
  the new test files. Verdict: PASS. Status → READY_TO_SHIP;
  Suggested Next → ship. Commits reviewed: 7ee5d6f, 975063e, 22395c4,
  e181917, e090dbc, b5bcfda. Commits: —. Next: `ship`.

- **2026-05-23 14:26 — feature-auto-build (claude-sonnet-4-6)** — BUILD-4: Wired
  `useHabitStore` emit on `checkIn` success. Added `checkInEmittedRef`
  (`useRef<Set<string>>`) for per-(habitId:date) dedup. Updated `checkIn()` to
  capture `completedAt` before persist, then emit after persist resolves with
  post-persist `streak`. Added `useHabitStore.test.tsx`: 8 scenarios (AC-H1..H5).
  Tests: `pnpm --filter @repo/plugin-productivity test -- useHabitStore` — 8/8
  passed. Full suite: 33/33. Final gate sweep: `pnpm --filter @repo/core
  check-types`, `pnpm --filter @repo/plugin-productivity check-types`, full
  test — all green. Status → READY_FOR_VERIFY.
  Commits: e181917. Next: `feature-verify`.

- **2026-05-23 14:24 — feature-auto-build (claude-sonnet-4-6)** — BUILD-3: Wired
  `useTodoStore` emit + dedup + boundary scheduler. Added `dueBoundaryIso()`,
  `msUntilBoundary()`, `MAX_TIMEOUT_MS` helpers. Added `dueEmittedRef`
  (`useRef<Set<string>>`). Added `useEffect` keyed on `todos` that scans
  past-due open/in-progress todos (emit immediately), schedules `setTimeout`
  (capped at 24h) for future boundaries, purges done/archived entries.
  Added `useTodoStore.test.tsx`: 7 scenarios (AC-T1..T7).
  Tests: `pnpm --filter @repo/plugin-productivity test -- useTodoStore` — 7/7
  passed. Commits: 22395c4. Next: BUILD-4.

- **2026-05-23 14:22 — feature-auto-build (claude-sonnet-4-6)** — BUILD-2: Wired
  `usePomodoroStore` emit. Added `lastEmittedAtRef` (dedup) and
  `completionSnapshotRef` (captures mode/durationMs/cyclesCompleted/linkedTodoId
  from the tick state transition). Added emit `useEffect` keyed on
  [status, lastCompletedAt]. Added `usePomodoroStore.test.tsx`: 6 scenarios
  (AC-P1..P6). Tests used seeded adapter for break-mode scenarios (AC-P2/P3)
  to work around `start()` always resetting to focus — behavior is unchanged.
  Tests: `pnpm --filter @repo/plugin-productivity test -- usePomodoroStore` —
  6/6 passed. Commits: 975063e. Next: BUILD-3.

- **2026-05-23 14:20 — feature-auto-build (claude-sonnet-4-6)** — BUILD-1:
  Appended three additive entries to `packages/core/src/types/events.ts`:
  `productivity:pomodoro-completed`, `productivity:todo-due`,
  `productivity:habit-reminder`. String-literal unions inlined (no
  reverse-dep core→plugin). Zero business logic; declaration only.
  Type checks: `pnpm --filter @repo/core check-types` — green;
  `pnpm --filter @repo/plugin-productivity check-types` — green.
  Commits: 7ee5d6f. Next: BUILD-2.

- **2026-05-23 — feature-review (Claude)** — Reviewed brief + discovery
  review + design / api / test docs against Workflow V2 review gates.
  Verified emit-site source claims (Pomodoro tick lines 102–134, Todo
  `isTodayOrPast` boundary, Habit absence of `reminderAt`, `emitter.ts`
  reject-on-non-Tauri behaviour). Confirmed no current `productivity:*`
  consumer code exists, so additive contract is safe. Accepted both
  reviewer-flagged decisions (habit semantic re-interpretation; emit-site
  `.catch()` swallow). Verdict APPROVED with 3 non-blocking notes (N1–N3).
  Status → APPROVED; Suggested Next → feature-build. Commits: —.
  Next: `feature-build` (BUILD-1: EventMap declaration in
  `packages/core/src/types/events.ts`).
- **2026-05-23 — feature-plan (Claude)** — Reset Status Panel from
  predecessor `READY_FOR_VERIFY` to `NEEDS_REVIEW` for the new phase.
  Authored `docs/reviews/plugin-productivity/20260523-discovery-review.md`.
  Updated `design.md`, `api.md`, `test.md` with Phase-scoped sections.
  Resolved brief Open Q1 (state-transition + scheduled `setTimeout`),
  Open Q2 (Habit emit on `checkIn` success, no schema change), Open Q3
  (per-provider `useRef<Set>` dedup), Open Q4 (payload fields fixed in
  api.md), Open Q5 (emit-site `.catch(() => undefined)` for non-Tauri).
  No code changes. Commits: —. Next: `feature-review`.
- 2026-05-20 Track B Codex — `READY_FOR_VERIFY` checkpoint (historical;
  superseded by this phase, but verification artifacts from this prior pass
  remain valid for the Track-B scope they covered).
- Created productivity package scaffold.
- Added Todo entity, `useTodoStore`, quick add, list, item, and Eisenhower matrix.
- Added Pomodoro store, timer, and lightweight overlay with Todo linkage.
- Added Habit entity, `useHabitStore`, mini calendar heatmap, card, and list.
- Kept label linkage as local string IDs and avoided cross-plugin imports.
- fix(plugin-productivity): stop Todo+Habit adapter default-arg infinite loop
- fix(plugin-productivity): persist Pomodoro session to localStorage
- fix(plugin-productivity): add createdAt/updatedAt to Habit and Todo
- fix(plugin-productivity): pin habit streak calculation to UTC
- perf(plugin-productivity): memoize Eisenhower quadrant bucketing
- chore(plugin-productivity): humanize Pomodoro mode labels, filter task list, document event-emit gap
- 2026-05-20 Track D: migrated Todo/Habit to Repository v0 shape, added `RepoAdapter`/`ProductivityRepoProvider`, kept Pomodoro in memory, wired `organizer:grid:create-task` listener, and passed `pnpm --filter @repo/plugin-productivity check-types`.
