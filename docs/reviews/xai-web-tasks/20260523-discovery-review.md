# Discovery Review — xai-web-tasks

> Workflow: FEATURE_DEV
> Target: xai-web-tasks (`@repo/plugin-web-tasks`)
> Wave: W2b (parallel with #14 pomodoro, #15 habits)
> Author: feature-plan (Opus)
> Date: 2026-05-23
> Source brief: [docs/reviews/xai-web-tasks/20260523-roadmap-seed.md](./20260523-roadmap-seed.md)
> Governing ADR: [docs/adr/0007-xai-web-console-build-form.md](../../adr/0007-xai-web-console-build-form.md) §S4 + §S6 + §S7 + §S8

---

## 1. Problem framing

Port `web design/module-tasks.jsx` (286 lines, ≈11.5 KB) into a typed, production-grade workspace package `@repo/plugin-web-tasks` and wire it into the XAI Web Console shell.

The prototype delivers four visible behaviours that this row must reproduce exactly:

1. **Second-level sidebar** with seven sections (Smart Lists / Custom Lists / Filters / Tags / Calendar Subscription / Completed / Won't Do / Trash) — mock-data driven, fully bilingual (`useI18n.s("common.*")`).
2. **4-column time-bucket main view** (`overdue` / `next7` / `later` / `nodate`) — each column renders count, optional `Postpone` / `Add` action, ordered task cards, and an empty drop-zone hint.
3. **Task cards** with grip, completion checkbox, title (+ optional sub), tag pill, date pill, inbox icon, completed state, and dragging state.
4. **Cross-column DnD** that:
   - highlights the target column with accent color while hovering (`.drop-target`),
   - shows a topbar hint while a card is dragging (`Drop on any column to reschedule` / `拖到任意时间列改截止`),
   - on drop, **rewrites the card's due-date string** based on the destination bucket (Overdue = today − 3 d, Next7 = today + 2 d, Later = today + 30 d, NoDate = clear), and
   - persists the resulting column array to `xai_task_cols` via `usePref` from `@repo/plugin-web-storage`.

The hard constraints from the seed brief are non-negotiable: accent-color drop highlight, topbar hint, bilingual parity, real-browser DnD round-trip, and persistence via `xai_task_cols` (already registered per ADR-0007 §S8).

### Why this is non-trivial

The prototype's `xai_task_cols` value is **the entire `taskCols` array** (4 columns × N task objects). The current `PREF_REGISTRY` declares `xai_task_cols` as `TaskColsState = Record<string, boolean>` — a placeholder shape intended for "column collapse state" that does **not** match the prototype's actual usage. This row must resolve that mismatch before persistence can round-trip correctly. The same mismatch precedent exists for `xai_countdowns` (countdown row resolved it by treating the raw `usePref` return as `unknown[]` and filtering via a `validate.ts` guard); we adopt the same pattern here.

The DnD's date-rewrite is **destination-bucket-relative**, not absolute. Re-running the same drop one day later will produce a different date. This is a deliberate UX, not a bug — the prototype uses `new Date()` at drop time. Tests must mock the clock.

The sidebar's "Calendar Subscription / Completed / Won't Do / Trash" rows are **decorative in v1** — no navigation, no filtering. They render i18n labels and a placeholder count only. This row keeps that scope; promoting them to routes belongs to a later iteration.

---

## 2. Candidate options

No external technology selection is required for this row: the toolchain (Vite 7 + React 19 + TS 5.9), the i18n layer (`@repo/plugin-web-tokens`), the persistence hook (`@repo/plugin-web-storage usePref`), the shell slot contract (`@repo/xai-web-shell WebModuleSlotRegistration`), and the event bus (`@repo/xai-web-event-bus`) are already shipped and ADR-anchored. **No external research required**.

The remaining decisions are scoped to internal shape choices. We considered four axes; one option per axis is selected.

### Axis A — Persistence shape for `xai_task_cols`

The registry declares `TaskColsState = Record<string, boolean>` (collapse state). The prototype writes the whole 4-column array of task objects. Two options:

| Option | Behaviour | Pros | Cons |
|---|---|---|---|
| **A1** Persist full `TaskCol[]` array (faithful to prototype) | Save the whole columns array; on load, validate via guards. | Faithful 1:1 port; reload-restores-board behaviour from DESIGN.md §4.2 holds; matches prototype's "drag a card, reload, position is still there" acceptance signal. | Registry's declared `TaskColsState` type is wrong; either we tighten it now or treat the raw value as `unknown` (countdown pattern). |
| **A2** Persist only collapse state, leave tasks as MOCK | Use registry's declared `Record<string, boolean>` for column open/closed only; tasks themselves are not persisted. | Matches current registry type literally. | **Violates the seed brief's acceptance signal** ("reload, confirm date rewrite + position persisted") — DnD persistence would not round-trip. Tasks would snap back to MOCK on reload. |

**Selected: A1** with the countdown row's "treat raw `usePref` as opaque + validate at boundary" pattern. Concretely:
- Read raw value with `usePref("xai_task_cols")` (typed as `TaskColsState = Record<string, boolean>` today).
- Cast through `unknown` and run an `isTaskColsArray()` type guard.
- If guard fails (empty / wrong shape / first load), fall back to the seed `MOCK.taskCols`.
- Write the full array on every reducer change.
- The registry's `TaskColsState` type tightening is **out of scope for this row** (it affects other packages' compile output and would require a coordinated change). Use `unknown` at the boundary instead — same pattern as `xai_countdowns` (countdown row, §S4-S6 RtS).

This is consistent with ADR-0007 §S4 "registry default values are opaque in v1; owner rows provide the real type declaration".

### Axis B — Where the MOCK seed data lives

The prototype reads `window.MOCK.taskCols`, `window.MOCK.tags`, `window.MOCK.lists`, `window.MOCK.customLists` (web design/i18n.js lines 400-475). Two options:

| Option | Where seed lives | Pros | Cons |
|---|---|---|---|
| **B1** Local seed in `src/seed/tasks-mock.ts` | Each module owns its own seed file. | Self-contained; ADR-0007's "no new shared seed package" honoured. | If habits / pomodoro later need the same tags, we duplicate them. |
| **B2** Promote tag list to a shared `@repo/plugin-web-tasks-tags` package | Cross-module reuse from the start. | Reusable. | Creates a 21st package; violates ADR-0007 §S4 frozen assumption 2 ("each module is one package"). |

**Selected: B1**. Tags in the prototype are MOCK; promoting them to a shared package is premature. If a later row needs them, it can copy or extract.

### Axis C — Shape of cross-column DnD

| Option | Behaviour | Pros | Cons |
|---|---|---|---|
| **C1** HTML5 DnD (faithful to prototype) | `draggable={true}` + `onDragStart/Over/Drop` + `dataTransfer.setData("text/plain", JSON.stringify({…}))`. | 1:1 port; no new dep; works in real browsers and jsdom (with caveats). | Touch devices not supported (acceptable v1 — desktop-only). |
| **C2** Pointer-events + custom DnD | Roll our own pointer-down → pointer-move → pointer-up handler. | Touch support; more control. | More code; more bugs; not what the prototype does. |
| **C3** React-DnD / dnd-kit library | Use a 3rd-party library. | Battle-tested. | ADR-0007 JSX→TSX rule 10 forbids new state libraries; adding a DnD lib here is the start of that slippery slope. Out of scope. |

**Selected: C1**. The prototype's HTML5 DnD is exactly what real browsers need; touch support belongs to a future iteration.

### Axis D — Bucket date rewrite — pure helper vs inline

The prototype's `dateForCol(colId)` (lines 18-32) is already a pure function. Two options:

| Option | Where it lives | Pros | Cons |
|---|---|---|---|
| **D1** Extract to `src/internal/dateForCol.ts` as a pure helper | Single-purpose file, easy to unit-test with `vi.useFakeTimers()`. | Testable in isolation; matches countdown's `computeDaysUntil.ts` pattern. | One extra file. |
| **D2** Inline inside the reducer | Less file noise. | Tied to reducer; harder to assert in isolation. |

**Selected: D1** — direct copy of the countdown row's testability discipline.

---

## 3. Recommendation

Implement `@repo/plugin-web-tasks` with:

- **Package**: `packages/xai-web-tasks/` (directory) → `@repo/plugin-web-tasks` (npm name) — matches the existing repo convention where `packages/xai-web-countdown/` ships as `@repo/plugin-web-countdown` and `packages/xai-web-matrix/` ships as `@repo/plugin-web-matrix`.
- **Public surface (`src/index.ts`)**: `TasksModule` component, `tasksWebModuleRegistration` slot, public types (`TaskCol`, `TaskCard`, `BucketId`).
- **Internal modules** (`src/internal/`): `tasksReducer.ts` (pure move/toggle), `dateForCol.ts` (pure helper, mocked clock in tests), `validate.ts` (boundary guards), `seed/tasksMock.ts` (typed translation of `web design/i18n.js` MOCK fragments).
- **Persistence**: `usePref("xai_task_cols")` with `unknown` boundary cast + `isTaskColsArray` guard; first-load seeds from MOCK.
- **i18n**: `useI18n(lang)` from `@repo/plugin-web-tokens` (already has `common.*`, `tasks.all`, `tag.*` etc.).
- **Slot registration**: replace `placeholder("tasks", "Tasks", "check", 2)` in `apps/web/src/routes/modules/shellRegistrations.tsx` with `tasksWebModuleRegistration` (one Edit, unique anchor).
- **3 phases** P1 / P2 / P3 as enumerated in `dev_log.md` Phase Plan.

This is a faithful UI port with three small structural upgrades over the prototype: pure helpers, typed seed, boundary validation. No new dependencies, no new packages.

---

## 4. Tradeoffs

- **A1 (full-array persistence) + unknown-boundary** means we silently fall back to MOCK if the stored shape ever drifts. This is forgiving but masks bugs. We mitigate by logging in DEV (same pattern as countdown).
- **C1 (HTML5 DnD)** has known jsdom limitations: `dataTransfer.setData` and `dataTransfer.getData` work, but `effectAllowed` / `dropEffect` are not fully simulated. The reducer (pure) is the testable surface; the DnD glue gets light integration tests + manual real-browser verification (acceptance signal §1.5).
- **B1 (local seed)** keeps coupling low at the cost of duplication if habits / pomodoro reuses the same tag list. Acceptable v1.
- **D1 (extracted helper)** makes the date rewrite test-friendly at the cost of one extra file. Worth it.

---

## 5. Cross-vendor preparation (P3)

Verify Cross-vendor = yes (per brief). The plan does **not** introduce any package outputs incompatible with Codex/Cursor execution:
- All file writes are scoped to `packages/xai-web-tasks/` and `docs/reviews/xai-web-tasks/`, plus three precise Edits to shared files (`shellRegistrations.tsx`, `App.tsx` if needed for outlet context, `apps/web/package.json` for the workspace dep).
- Edits use unique multi-line anchors (e.g., `placeholder("tasks",      "Tasks",      "check",     2),` — only one occurrence in `shellRegistrations.tsx`).
- No template files, no generated files, no platform-specific paths in package code.
- pnpm workspace install will be needed once after P1 (when the new package first exists); habits and pomodoro siblings each cause their own install but installs are idempotent.

**Git-index lock retry policy** for shared-file Edits (concurrency safety vs siblings #14/#15): retry 5× at 8 / 12 / 16 / 20 / 20 seconds. Each Edit targets a unique anchor so siblings cannot collide on the same edit point.

---

## 6. Risks and open questions

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | `usePref("xai_task_cols")` declared type (`Record<string, boolean>`) doesn't match the persisted shape, so consumers must cast through `unknown`. | Low | Use validate guard + DEV warn; precedent: `xai_countdowns` countdown row. Documented in api.md §4.1. |
| R2 | Cross-column DnD glue is hard to test in jsdom; integration test surface is thin. | Med | Pure reducer is the test target; DnD wiring covered by one happy-path RTL test + manual real-browser verification on acceptance. |
| R3 | The prototype emits no events; this row keeps that. Statistics row #20 may later want `web:tasks:card-completed` or `web:tasks:bucket-changed`. | Low (deferred) | Not in v1 scope; later iteration can add an EventMap entry following ADR-0007 §S7 naming. We note this hook-point in design.md §6 "Future events" but do not declare or emit any events in P1-P3. |
| R4 | `web-todo-first-slice` (SHIPPED) registered `todoWebModuleRegistration` from `@repo/plugin-productivity/web` for the `tasks` module id earlier; the current `shellRegistrations.tsx` already uses `placeholder("tasks", …)` instead. We replace the placeholder, not the legacy registration. | Low | Confirm by reading `shellRegistrations.tsx` (already done — line 47 is the placeholder we replace). No conflict. |
| R5 | Concurrent edits with siblings #14 (pomodoro) and #15 (habits) on `shellRegistrations.tsx` and `App.tsx`. | Med | Each sibling Edit uses a unique anchor (`placeholder("tasks", …)` for tasks; `placeholder("pomodoro", …)` for pomodoro; `placeholder("habits", …)` for habits) — no overlapping anchors. Git index lock retry policy in §5 absorbs serialization delay. |
| R6 | Date-rewrite uses `new Date()` at drop time → non-deterministic in tests. | Low | `vi.useFakeTimers()` + `vi.setSystemTime()` in `dateForCol.test.ts`. |
| R7 | Bilingual coverage of "tasks.all" and the four bucket keys (`overdue` / `next_7_days` / `later` / `no_date`) — all present in `@repo/plugin-web-tokens i18n.ts` (verified line 22-23). | None | No new i18n strings required in P1; if a new string is needed in P2 we extend the tokens package via a follow-up note. |
| R8 | The MOCK seed in `web design/i18n.js` includes 26 tasks across 4 columns + 6 completed in `nodate.completed`. Faithful port = same counts. | Low | Snapshot-style test on seed contents in `seed/tasksMock.test.ts`. |

### Open questions intentionally deferred

- **Q-Def-1**: Should "Completed / Won't Do / Trash" sidebar rows be promoted to real filters? — Out of scope v1 (decorative). Future iteration.
- **Q-Def-2**: Should the row emit `web:tasks:card-completed` for Statistics (#20)? — Deferred to row #20's feature-plan or to a future tasks iteration.
- **Q-Def-3**: Should the registry tighten `TaskColsState` from `Record<string, boolean>` to `TaskCol[]`? — Out of scope (cross-package change). Boundary cast + validate is the v1 contract.

---

## 7. Search evidence

No web research was performed: the row is a closed-system UI port over already-shipped infrastructure (Vite + React 19 + i18n + storage + event bus + shell), all owned by this repo. ADR-0007 §S4 froze the toolchain and the per-module package shape. No external library selection is in scope.

---

## 8. Recommendation summary

Accept Option A1 (full-array persistence) + B1 (local seed) + C1 (HTML5 DnD) + D1 (extracted pure helpers). Build in three phases:

- **P1** Scaffold package + sidebar + 4-column read-only render (no DnD).
- **P2** DnD wiring + `dateForCol` rewrite + `usePref` persistence + host slot replacement.
- **P3** Test sweep, cross-vendor smoke, real-browser DnD verification.

Phase boundaries are reviewable; P2 is the load-bearing phase.
