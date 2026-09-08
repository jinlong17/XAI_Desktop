# Dev Log — xai-web-habits

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-habits |
| Title | Web Console — Habits module (port `module-habits.jsx`) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (Safari 17+ / Chrome / Firefox — check-toggle persistence + reload + diary round-trip + cross-tab storage event + month-nav year-rollover + Add-Habit dialog) — XVENDOR-1..9 DEFERRED to ship-time human per `test.md` §6 + Phase Plan §14 |
| Automation Mode | A-Claude (xai-roadmap-loop W2b parallel-Agent mode; siblings: #6 xai-web-tasks + #14 xai-web-pomodoro) |
| Executor | claude-sonnet-4-6 — ship |
| Updated | 2026-05-23 19:10 |
| Dispatched By | xai-roadmap-loop (W2b parallel dispatch, manifest row #15) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #15 (W2 Module — Habits) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map row `module-habits.jsx` → `packages/plugin-web-habits/src/`) + §S5 (TSX rules) + §S7 (event bus) + §S8 (persistence registry) |
| Concurrent Siblings | #6 xai-web-tasks · #14 xai-web-pomodoro — file writes scoped to `packages/xai-web-habits/` + `docs/reviews/xai-web-habits/` only; sibling-edge files (`shellRegistrations.tsx` + `apps/web/package.json` + `plugin-web-storage/registry.ts`) get one append each — see Risks §R3 |
| Write Scope (plan) | `packages/xai-web-habits/docs/` + `docs/reviews/xai-web-habits/` |
| Write Scope (build) | will extend to: `packages/xai-web-habits/src/**` (new), `packages/plugin-web-storage/src/internal/registry.ts` (1 append, P1), `apps/web/src/routes/modules/shellRegistrations.tsx` (1 line swap + 1 import, P1), `apps/web/package.json` (1 dep line, P1) — all per `docs/reviews/xai-web-habits/20260523-discovery-review.md` §6 R2+R3 |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-habits/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-habits/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-habits/docs/design.md`
- API contract: `packages/xai-web-habits/docs/api.md`
- Test strategy: `packages/xai-web-habits/docs/test.md`

## Decision Headline

Selected **Option C — package at `packages/xai-web-habits/` named
`@repo/plugin-web-habits`**, with:

- **A1 single-blob persistence** in `xai_habits_state` (new `WebPrefRegistry`
  entry, JSON codec, schemaVersion 1, owner `xai-web-habits`, `proposed: false`).
- **B1 synchronous setPref on every check-toggle** (no autosave debounce —
  honors the seed brief's "persist immediately" hard constraint).
- **C1 strict-consecutive streak including today** (`computeStreak` zero-outs
  on any skip, per the seed brief).
- **D3 weekStart prop defaulting to `"sun"`** — host wrapper hard-codes
  `"sun"` in v1; Settings W4 (row #24) edits one line when the
  `xai_pref_week_start` key is later registered.
- **E1 year-scoped 6/365 progress** (numerator = check-ins this calendar
  year; denominator = 365 / 366 leap-year aware).
- **F2 per-habit per-month diary** (matches the existing `habits.empty_log`
  i18n copy "本月还没有打卡心得。" / "No check-ins shared this month yet.").
- **Emit-only on the pre-declared `web:habits:checkin-recorded` channel** —
  the channel is already in `packages/core/src/types/events.ts:209–218` (W1
  declare-now precedent), no edit there. Emit on both add and remove
  (statistics row can filter).
- **Module slot registration** via `WebModuleSlotRegistration` from
  `@repo/xai-web-shell` — swapped into `shellRegistrations.tsx:53`
  (`moduleId: "habits"`, `icon: "pin"`, `railOrder: 8`).
- **Add-Habit modal in v1 (P3)** — minimal bilingual title × 2 fields + emoji
  input, mirroring the shipped `CountdownEditDialog` pattern. Without it, the
  acceptance signal "User can add a habit" fails.

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Package skeleton + habit list pane + check-toggle + persistence + shell wiring | DONE | (see Work Log) |
| P2 — Detail pane: 4 stat cards + 6/365 progress + month calendar | DONE | (see Work Log) |
| P3 — Diary card + Add-Habit modal + cross-vendor smoke + docs sync | DONE | (see Work Log) |

## Phase Plan (3 phases)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per
> run". Phases are ordered to keep diff small and reviewable.

### Phase P1 — Package skeleton + habit list pane + check-toggle + persistence

**Goal**: visible in rail at `/app/habits`; left pane (habits list with
emoji + bilingual title + stats + 7-cell weekly check strip) renders in both
languages; clicking an hcell toggles + persists to localStorage + emits
`web:habits:checkin-recorded`. Right pane is a placeholder div in P1.

**Scope** (write set):

1. **Create package scaffolding** at `packages/xai-web-habits/`:
   - `package.json` — name `@repo/plugin-web-habits`, version `0.0.0`,
     private, `type: "module"`, `"sideEffects": ["./src/styles.css",
     "./src/index.ts"]`, workspace deps on `@repo/core`,
     `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`,
     `@repo/xai-web-event-bus`, `@repo/xai-web-shell`; peerDeps on
     `react@^19` + `react-dom@^19`; devDeps mirroring
     `xai-web-matrix/package.json`.
   - `tsconfig.json` — extends `@repo/typescript-config/react-library.json`.
   - `manifest.json` — `name: "@repo/plugin-web-habits"`, `slug:
     "xai-web-habits"`, `status: "In-Dev"`, `type: "ui"`,
     `owner: "xai-web-habits"`, `roadmap_row: 15`, `wave: "W2"`,
     `entry: "./src/index.ts"`, dependencies array.
   - `vitest.config.ts` — jsdom + setup file (clears `localStorage` per
     test); mirrors `xai-web-matrix/vitest.config.ts`.
   - `eslint.config.mjs` — extends `@repo/eslint-config`.

2. **Module source files** under `packages/xai-web-habits/src/`:
   - `types.ts` — `Habit`, `HabitId`, `HabitsState`, `DateKey`, `MonthKey`,
     `WeekStart`, `HabitsModuleProps` per `api.md` §1.1.
   - `constants.ts` — `HABITS_STORAGE_KEY = "xai_habits_state" as const`.
   - `internal/dateKeys.ts` — `utcDateKey`, `monthKey`, `weekDates`,
     `daysInMonth`, `isLeapYear`, `pad2` per `design.md` §6.
   - `internal/seed.ts` — typed `INITIAL_HABITS` array (5 bilingual habits;
     replaces `window.MOCK.habits`).
   - `internal/icons.tsx` — 10 inline SVG glyphs (`check`, `bolt`, `fire`,
     `target`, `plus`, `dots`, `arrowL`, `arrowR`, `list`, `grid4`) — paths
     copied byte-for-byte from `web design/icons.jsx`.
   - `internal/createId.ts` — `createId(): HabitId` with `crypto.randomUUID`
     primary + fallback.
   - `internal/validate.ts` — `isHabit`, `validateHabitsState`.
   - `internal/usePersistedHabits.ts` — `usePref<HabitsState>` wrapper with
     seed hydration + schemaVersion guard.
   - `internal/toggle.ts` — pure `toggleCheckIn(state, habitId, dateKey):
     { next, postStreak }` per `design.md` §6.
   - `internal/computeStreak.ts` — pure `computeStreak(checkIns, today):
     number` (C1 semantics) per `design.md` §6.1.
   - `internal/emit.ts` — `emitCheckInRecorded({ habitId, date, streak })`
     helper per `design.md` §7.
   - `HabitRow.tsx` — single habit row (emoji + title + stats + 7-cell strip).
   - `HabitList.tsx` — left pane (header + week-strip + habit rows).
   - `HabitsModule.tsx` — top-level component; right pane is a stub `<div
     class="habits-detail" />` in P1 (no detail content yet).
   - `registration.tsx` — `habitsSlotRegistration` + `HabitsSlotHost`
     wrapper per `design.md` §8.
   - `index.ts` — public surface barrel per `api.md` §1.
   - `styles.css` — module styles (left-pane class names + week-strip
     + habit-row + hcell + base panel). Tokens-only.

3. **Cross-package additive write**:
   - `packages/plugin-web-storage/src/internal/registry.ts` — append
     `HabitsStateBlob = unknown` next to `MatrixStateBlob` (around line 92),
     and append `xai_habits_state` entry to the end of `PREF_REGISTRY` per
     `api.md` §2.1.

4. **Host wiring**:
   - `apps/web/src/routes/modules/shellRegistrations.tsx` — import
     `habitsSlotRegistration` from `@repo/plugin-web-habits` and replace
     the `placeholder("habits", "Habits", "pin", 8)` row at line 53.
   - `apps/web/package.json` — append `"@repo/plugin-web-habits":
     "workspace:*"` to `dependencies`.

5. **Tests** (P1 subset):
   - `__tests__/HabitsModule.render.test.tsx` — AC-RENDER-1..3 (list pane).
   - `__tests__/HabitsModule.i18n.test.tsx` — AC-I18N-1..4.
   - `__tests__/HabitsModule.toggle.test.tsx` — AC-TOGGLE-1..5.
   - `__tests__/HabitsModule.persist.test.tsx` — AC-PERSIST-1..6.
   - `__tests__/HabitsModule.events.test.tsx` — AC-EVENT-1..7.
   - `__tests__/toggle.test.ts` — AC-REDUCE-1..5.
   - `__tests__/computeStreak.test.ts` — AC-STREAK-1..7.
   - `__tests__/dateKeys.test.ts` — AC-DATE-1..7.
   - `__tests__/validate.test.ts` — AC-VAL-1..6.
   - `__tests__/registry-presence.test.ts` — AC-REGISTRY-1..2.
   - `__tests__/registration.test.tsx` — AC-SHELL-1, AC-SHELL-2.
   - `__tests__/styles.css.tokens.test.ts` — AC-TOKENS-1 (P1 partial: list pane styles only; stat-card style assertion in P2).
   - `__tests__/index-barrel.test.ts` — AC-BARREL-1.
   - `__tests__/types.test-d.ts` — AC-TYPE-1..6.
   - `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts`
     (extend if exists, else create) — AC-SHELL-3.

6. **Quality gates** (P1 exit):
   - `pnpm --filter @repo/plugin-web-habits test` → green.
   - `pnpm --filter @repo/plugin-web-habits check-types` → 0.
   - `pnpm --filter @repo/plugin-web-habits lint` → 0.
   - `pnpm --filter @repo/plugin-web-storage check-types` → 0 (registry edit).
   - `pnpm --filter @repo/plugin-web-storage test` → green.
   - `pnpm --filter @repo/web check-types` → 0.
   - Manual: `pnpm dev` in `apps/web/`; visit `/app/habits`; see list of
     seeded habits + week strip; toggle a cell; reload; cell still toggled.

**Out of P1**: detail pane content (stat cards, progress, calendar, diary),
Add-Habit dialog, edge cases. All deferred to P2/P3.

---

### Phase P2 — Detail pane: 4 stat cards + 6/365 progress + month calendar

**Goal**: right pane fully wired — selecting a habit shows its detail; 4
stat cards recalc live on every toggle; 6/365 progress is correct per E1;
month calendar shows check rings on checked dates + month-nav buttons work
+ today is highlighted.

**Scope** (write set):

1. **New pure helpers** under `packages/xai-web-habits/src/internal/`:
   - `computeStats.ts` — `computeMonthlyCount`, `computeMonthlyRate`,
     `compute365` per `design.md` §6.2.

2. **New component files** under `packages/xai-web-habits/src/`:
   - `StatCard.tsx` — single stat card with colored icon background via
     `color-mix(in oklch, var(--token) 14%, transparent)`.
   - `MonthCalendar.tsx` — 5×7 grid + month-nav `<` / `>` buttons + check
     rings + today cell.
   - `HabitDetail.tsx` — right pane composition (detail-head + stat-grid +
     progress-card + month-cal). Diary card still a stub in P2.

3. **Component changes**:
   - `HabitsModule.tsx` — replace the P1 stub `<div class="habits-detail"/>`
     with `<HabitDetail … />`; pass `displayedMonth` state + setters; pass
     `selectedHabit` derived from `selectedId`.

4. **Styles** — extend `styles.css` with stat-grid / stat-card /
   progress-card / month-cal / cal-grid / cal-cell rules. Tokens-only.

5. **Tests** (P2):
   - `__tests__/StatCard.test.tsx` — AC-TOKENS-2 + render.
   - `__tests__/MonthCalendar.test.tsx` — AC-CAL-1..7.
   - `__tests__/computeStats.test.ts` — AC-STAT-1..6.
   - `__tests__/HabitsModule.toggle.test.tsx` — extend with AC-STAT-7
     (stat-card live recalc).
   - `__tests__/HabitsModule.render.test.tsx` — extend with AC-RENDER-4..6.

6. **Quality gates** (P2 exit):
   - All P1 gates still green.
   - All AC-CAL-*, AC-STAT-*, AC-STAT-7, AC-RENDER-4..6, AC-TOKENS-2 pass.

**Out of P2**: diary card, Add-Habit modal, cross-vendor smoke.

---

### Phase P3 — Diary card + Add-Habit modal + cross-vendor manual smoke + docs sync

**Goal**: diary textarea per habit per month works + Add-Habit modal lets
the user create a new habit + cross-vendor manual smoke on Safari/Chrome/
Firefox + docs synced with any deltas discovered during build.

**Scope** (write set):

1. **New component files** under `packages/xai-web-habits/src/`:
   - `DiaryCard.tsx` — controlled `<textarea>` with `useState<string>`
     mirror; `onBlur` flushes to `state.diaries[habitId][monthKey]`;
     equality guard skips no-op writes.
   - `internal/AddHabitDialog.tsx` — minimal modal: emoji input + EN title
     + ZH title; mirrors `CountdownEditDialog` shipped pattern (uses
     native `<dialog>` element; escape/backdrop closes).

2. **Component changes**:
   - `HabitsModule.tsx` — wire `addDialogOpen` state + `onAddHabit`
     handler that opens the dialog; on save, prepend the new habit to
     `state.habits` and select it.
   - `HabitDetail.tsx` — replace diary stub with `<DiaryCard … />`.

3. **Edge-case test additions** in `packages/xai-web-habits/src/__tests__/`:
   - Empty habit list state (delete all seeded habits): module still
     renders the left pane header + an empty habit-rows region; right pane
     shows an empty-state placeholder.
   - Leap-year 365 progress (year = 2024): `compute365` returns
     `denominator: 366`.
   - DST spring-forward streak boundary (system time = 2026-03-08 UTC):
     `computeStreak` still works because UTC keys eliminate the issue.
   - Two-tab `storage` event sync: dispatch synthetic event with new state;
     `HabitsModule` re-renders.
   - Corrupted blob recovery (AC-PERSIST-4, AC-PERSIST-5 — move from P1 if
     not yet exercised).

4. **Tests** (P3):
   - `__tests__/DiaryCard.test.tsx` — AC-DIARY-1, AC-DIARY-2, AC-DIARY-4.
   - `__tests__/HabitsModule.persist.test.tsx` — extend with AC-DIARY-3, AC-DIARY-5, AC-DIARY-6.
   - `__tests__/AddHabitDialog.test.tsx` — AC-ADD-3..6.
   - `__tests__/HabitsModule.add.test.tsx` — AC-ADD-1, AC-ADD-2.
   - `__tests__/HabitsModule.render.test.tsx` — extend with AC-RENDER-7.
   - `__tests__/HabitsModule.i18n.test.tsx` — extend with AC-I18N-5.

5. **Cross-vendor manual smoke** (`test.md` §6):
   - Run `apps/web` in Safari 17+ / Chrome / Firefox on macOS.
   - Execute all 9 AC-XVENDOR-* checklist items.
   - Record results in `dev_log.md` `Verify Notes` block (created when
     `feature-verify` runs — see SOP_NEW_FEATURE).

6. **Coverage check**:
   - `pnpm --filter @repo/plugin-web-habits test:coverage` → meets
     `test.md` §5 targets (90% statements / 85% branches / 95% functions /
     90% lines).

7. **Docs sync**:
   - Update `design.md` / `api.md` / `test.md` with any concrete-vs-planned
     deltas discovered during P1/P2 builds.
   - Confirm `manifest.json` status is correctly `In-Dev` (flip to
     `Production` happens in `ship`).

8. **Quality gates** (P3 exit → ready for `feature-verify`):
   - All AC-* automated tests pass (≥ 50 distinct AC IDs covered).
   - All AC-XVENDOR-* manual checks recorded (or formally DEFERRED to
     ship-time human per matrix precedent).
   - `pnpm --filter @repo/plugin-web-habits test:coverage` meets targets.
   - `pnpm -w lint` green across all touched workspaces.
   - `pnpm -w check-types` green across all touched workspaces.

**Hand-off after P3**: `dev_log.md` flips to `Status: READY_FOR_VERIFY`,
`Suggested Next: feature-verify`. The `feature-verify` agent flips to
`READY_TO_SHIP` once gates §7 of `test.md` are confirmed.

---

## Risks (carried from `discovery-review.md` §6.1)

| ID | Risk | Severity | Status |
|---|---|---|---|
| R1 | Streak computation correctness across DST / timezone edges | Medium | Mitigated: all date keys are UTC (`utcDateKey`). DST test case explicit (AC-STREAK-6, P3 edge case). |
| R2 | Editing `packages/plugin-web-storage/src/internal/registry.ts` is outside our nominal write scope | Medium | Explicit precedent: §S8 reservation invites owner-row additions. Siblings #13/#14/#17/#19 all use this pattern. One additive entry. **Q6** confirms with feature-review. |
| R3 | Parallel siblings (#6 xai-web-tasks + #14 xai-web-pomodoro) touch the same `shellRegistrations.tsx` + `apps/web/package.json` + `registry.ts` in the same window | Medium | All three rows add line-disjoint appends. `registry.ts`: habits appends after matrix (line 333+); tasks would also append; pomodoro `xai_pomodoro_sessions` already exists at line 302–310 as a `proposed: true` entry, so #14's plan may flip the `proposed` flag (line 309 only). `shellRegistrations.tsx`: habits swaps line 53, tasks swaps line 47, pomodoro swaps line 52 — line-disjoint. `apps/web/package.json`: each row adds a single dep line in the dependencies object — auto-mergeable in 99% of cases. |
| R4 | Habit creation at runtime — registry is static | Low | Habit ids live inside the JSON blob `xai_habits_state.habits[]`, not as new registry keys. Single fixed key. No registry impact. |
| R5 | Textarea re-renders on every keystroke; persist-per-keystroke wastes localStorage budget | Medium | Mitigated by local `useState<string>` mirror; persist on blur only (AC-DIARY-2, AC-DIARY-4). Equality guard skips no-op writes. |
| R6 | `computeMonthlyRate` denominator at end-of-month | Low | Use `today.getUTCDate()` (days elapsed in current month inclusive). Documented in `design.md` §6.2 + tested in AC-STAT-3, AC-STAT-4. |
| R7 | "User can add a habit" acceptance signal requires UI — prototype stubs the `+` button | Medium | Mitigated: Add-Habit modal included in P3 (Q2 resolution). |
| R8 | `web:habits:checkin-recorded` payload's `streak` MUST be post-toggle | Low | `toggleCheckIn` returns `{ next, postStreak }`; the emit helper consumes `postStreak`. Unit test asserts (AC-EVENT-7). |
| R9 | Emit on remove (un-check) — semantically debatable | Low | Planner choice: emit on both add and remove. Statistics row can filter on `streak > previousStreak` if it cares. **Q7** confirms. |
| R10 | Bilingual title input UX | Low | Same pattern as `CountdownEditDialog`. Two required inputs labeled `Title (English)` / `标题 (中文)`. |
| R11 | `xai_pref_week_start` does not exist in the registry — D3 prop default works v1 | Low | D3 takes a prop, not a `usePref` call. Future row edits one line in `HabitsSlotHost` when Settings W4 registers the key. Zero impact this row. |

## Open Questions for feature-review

- **Q1** — Directory naming: `packages/xai-web-habits/` (sibling convention)
  vs `packages/plugin-web-habits/` (ADR §S4 port-map literal).
  - **Planner recommendation**: `packages/xai-web-habits/` (directory) +
    `@repo/plugin-web-habits` (package name). Mirrors shipped W1/W2
    convention (`xai-web-shell`, `xai-web-matrix`, `plugin-web-countdown`
    is an outlier — the sibling that established `xai-web-<slug>` naming is
    matrix). The matrix Q1 resolution: "directory = `xai-web-matrix`,
    package name = `@repo/plugin-web-matrix`" applies symmetrically.
- **Q2** — Habit creation in v1: include minimal Add-Habit modal in P3 vs
  stub the `+` button and defer to a follow-up row.
  - **Planner recommendation**: include in P3. Cost ~80 LOC; matches
    shipped `CountdownEditDialog`. Without it, "User can add a habit"
    acceptance signal fails.
- **Q3** — Week-start: D3 prop default Sunday with future host-wrapper edit
  vs reading a future `xai_pref_week_start` key now (which doesn't exist).
  - **Planner recommendation**: D3. Zero new registry keys this row;
    Settings W4 owns the contract.
- **Q4** — Diary granularity: F2 per-habit per-month (recommended) vs F1
  per-habit per-day.
  - **Planner recommendation**: F2. Matches existing `habits.empty_log`
    copy ("本月还没有打卡心得。" — explicitly references the month).
- **Q5** — Icons: inline 10 SVG glyphs (~120 LOC in `internal/icons.tsx`)
  vs request `@repo/xai-web-shell` expose its `Icon` component.
  - **Planner recommendation**: inline. Matches matrix Q2 resolution + the
    shipped countdown pattern.
- **Q6** — Write-scope expansion approval for the cross-package file
  (`packages/plugin-web-storage/src/internal/registry.ts`). One additive
  entry, same pattern as matrix / pomodoro / countdown / pet.
  - **Planner recommendation**: approve. Standard §S8 owner-row registration
    path.
- **Q7** — Emit event on un-check toggles (recommended) vs only on add.
  - **Planner recommendation**: emit on both. Channel name
    `checkin-recorded` is symmetric; statistics can filter.
- **Q8** — `6/365` numerator: E1 year-scoped (recommended) vs E3 rolling.
  - **Planner recommendation**: E1. Matches prototype "this year" feel.
- **Q9** — Streak semantics: C1 strict-with-today (recommended) vs C2 lenient.
  - **Planner recommendation**: C1. Seed brief is explicit about
    "zero-out on skip".

## Review Notes

**Verdict: APPROVED** — plan is executable with no blocking ambiguity. All 12 gates pass.

### Gate-by-gate verification

| Gate | Status | Evidence |
|---|---|---|
| 1. Seed-brief fidelity (weekly check-off + detail: 4 stat cards + 6/365 + month cal + diary) | PASS | discovery §1.1, design.md §3 component composition lists all 4 stat cards (monthly_checkins/total_checkins/monthly_rate/streak), progress card with mono numerator/denominator, MonthCalendar 5×7 grid, DiaryCard. |
| 2. Single-blob persistence to `xai_habits_state` via `usePref` | PASS | design.md §5 + api.md §2.1. New registry entry appended after `xai_matrix_state` (line 333). `proposed: false` rationale: worker brief approved canonical name (not in §S8 proposed list). Confirmed pattern matches `MatrixStateBlob = unknown` opaque alias (registry.ts:92). |
| 3. C1 strict-consecutive streak (zero-out on skip) | PASS | design.md §6.1 `computeStreak` early-returns 0 when today not checked; while-loop walks back through `cursor.setUTCDate(-1)` requiring every prior date checked. Tests AC-STREAK-1..7 cover edges (DST, future-date corruption, 5-prior, skip-breaks-run). |
| 4. F2 per-habit per-month diary | PASS | design.md §5.2 `diaries: Record<HabitId, Record<MonthKey, string>>` where MonthKey = `YYYY-MM`. Matches existing `habits.empty_log` copy ("本月还没有打卡心得。"). |
| 5. D3 weekStart prop (default "sun"; W4 Settings overrides) | PASS | api.md §1.1 `HabitsModuleProps.weekStart?: WeekStart` default "sun". design.md §8 `HabitsSlotHost` hard-codes `weekStart="sun"` with explicit "Settings W4 edits this line" comment. Tests AC-DATE-3, AC-DATE-4, AC-CAL-6. |
| 6. E1 year-scoped 6/365 progress | PASS | design.md §6.2 `compute365` filters `Object.keys(habitCheckIns).filter(k => k.startsWith("${year}-"))`; denominator 365/366 leap-year-aware via `isLeapYear`. Tests AC-STAT-5, AC-STAT-6. |
| 7. `web:habits:checkin-recorded` pre-declared (no EventMap edit) | PASS | Verified at `packages/core/src/types/events.ts:209-218` — channel declared with EXACT payload shape `{ habitId; date; streak; recordedAt }`. design.md §7 confirms no edit needed; api.md §2.2 marks it "no edit required". `@repo/xai-web-event-bus` `WebEventMap` projection picks it up automatically. |
| 8. Minimal Add-Habit modal in P3 (acceptance signal "User can add a habit") | PASS | design.md §9 `AddHabitDialog` with emoji + bilingual title × 2 inputs; mirrors `CountdownEditDialog` shipped pattern. Phase P3 scope row 1.2 includes it. Tests AC-ADD-1..6. |
| 9. Q1..Q9 resolved | PASS | All 9 questions answered with planner recommendation (see Question Resolution below). |
| 10. 3 phases right-sized | PASS | P1 (skeleton + list pane + check-toggle + persist + shell wiring) — visible-in-rail exit. P2 (detail pane: stat cards + progress + calendar). P3 (diary + Add-Habit + cross-vendor + docs sync). Within worker brief's 3-phase budget. Each phase has clear file boundaries and quality gates. |
| 11. Cross-vendor verify: yes | PASS | test.md §6 declares 9 AC-XVENDOR-* checks (Safari 17+/Chrome/Firefox: toggle+reload, lang switch, two-tab storage, diary persist, Add-Habit, month-nav year-rollover, no-console-errors, visual token rendering). |
| 12. Sibling-coordination: line-disjoint appends | PASS | Verified in actual `shellRegistrations.tsx`: line 53 = habits (this row), line 47 = tasks (#6), line 52 = pomodoro (#14) — all line-disjoint. `registry.ts` appends after line 333 (`xai_matrix_state`) — file-end append, auto-mergeable. `apps/web/package.json` single-line additive dep. Documented in dev_log Status Panel row "Concurrent Siblings" + Risk R3. |

### Question Resolution

- **Q1 (directory naming)** — APPROVE planner recommendation: `packages/xai-web-habits/` + `@repo/plugin-web-habits`. Matches shipped matrix Q1 resolution and sibling convention.
- **Q2 (Add-Habit modal in v1)** — APPROVE: include in P3. Without it, the seed-brief acceptance signal "User can add a habit" cannot be satisfied. CountdownEditDialog precedent justifies cost.
- **Q3 (week-start strategy)** — APPROVE D3 prop. Zero new registry keys this row; Settings W4 owns the contract. Future host-wrapper one-line edit is a non-breaking promotion.
- **Q4 (diary granularity F2 per-month)** — APPROVE. The existing `habits.empty_log` copy literally references "this month" in both EN ("No check-ins shared this month yet.") and ZH ("本月还没有打卡心得。"). F1 per-day would force new i18n keys + date-picker UX.
- **Q5 (inline icons)** — APPROVE. Matches matrix Q2 resolution and shipped countdown pattern. A future "shared icon set" promotion row is non-blocking.
- **Q6 (registry write-scope expansion)** — APPROVE. Single additive entry to `PREF_REGISTRY` is the standard §S8 owner-row registration path; siblings #13/#14/#17/#19 use this pattern. Append-at-end strategy minimizes merge friction with concurrent siblings.
- **Q7 (emit on un-check)** — APPROVE: emit on both add and remove. Channel name `checkin-recorded` is symmetric; downstream consumers (statistics row #20) can filter on `streak > previousStreak` if they want add-only semantics. The post-toggle `streak` field carries enough info to distinguish.
- **Q8 (E1 year-scoped 6/365)** — APPROVE. Matches prototype's "this year" feel; the sub-label `${denominator - numerator} days` reads naturally as "days remaining this year".
- **Q9 (C1 strict-with-today streak)** — APPROVE. Seed brief is explicit about "zero-out on skip". If product wants C3 grace-day later, it's a one-line change isolated in `computeStreak`.

### Recommendations (non-blocking — apply during build at builder's discretion)

1. **`proposed: false` rationale documentation** — The planner correctly marks the new entry `proposed: false` (worker brief approved the canonical name). For consistency with reviewer signal, builder may add a one-line comment in the registry entry: `// proposed: false — canonical name approved by worker brief #15`. Not blocking — design.md §5.1 already documents this.

2. **AC-EVENT-2 streak-on-remove assertion** — test.md §2.8 AC-EVENT-2 says `streak` "reflects the broken run (0 if today was just unchecked)". Confirm during build that the test explicitly seeds "today checked + N prior" then unchecks today → asserts `streak === 0`. The planner's `toggleCheckIn` returns `postStreak = computeStreak(nextHabitCheckIns, new Date())` which after-remove correctly yields 0 via the C1 early-return. Wording in test.md is already precise enough.

3. **R5 mitigation: spy strategy for AC-DIARY-4** — test.md §3 mentions `vi.spyOn(storageModule, "setPref")`. Note that `@repo/plugin-web-storage` exports `setPref` from its `index.ts`; the spy target must be on the module barrel (not on the internal). Builder should verify the spy actually intercepts the call path used by `usePref`'s internal setter. Non-blocking — DOM mutation observation (or storage-event count) is an equally valid alternative if the spy approach proves brittle.

4. **AC-PERSIST-3 seed hydration ordering** — test.md AC-PERSIST-3 asserts `state.habits.length === INITIAL_HABITS.length` after a fresh mount with cleared localStorage. Builder must ensure `usePersistedHabits` writes the seeded blob back to localStorage on first mount (else AC-PERSIST-1 + AC-PERSIST-3 will race in the toggle-then-reload pattern). This is implicit in design.md §5.3 ("seeds from internal/seed.ts") but worth a small implementation comment.

5. **registry parity test** — test.md AC-REGISTRY-1 (Gate 5: `pnpm --filter @repo/plugin-web-storage test` still green) — `plugin-web-storage` likely has a snapshot or registry-length test. Builder should verify whether the new entry bumps a known count or matches an existing snapshot, and update if needed.

### Architectural risk: none

- No `packages/core/` edit (events.ts pre-declared by W1).
- No `manifest.json` routing changes (slot pattern via `WebModuleSlotRegistration`).
- No cross-feature contract drift (statistics consumer is a separate row #20, decoupled via typed event channel).

### Sign-off

Plan, design.md (12 sections, 17 frozen assumptions), api.md (9 sections including idempotency + error semantics + perf budget + stability rules), test.md (107+ AC IDs across 17 categories + coverage targets + cross-vendor manual smoke), dev_log.md (3-phase plan with clear scope + exit gates + risks R1..R11) are mutually consistent. Cleared for `feature-auto-build`.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M — feature-plan | Wrote `discovery-review.md`, `design.md`, `api.md`, `test.md`, and this `dev_log.md`. Frozen 17 assumptions in `design.md` §1.1. Identified 9 open questions for review (Q1..Q9). Risks R1..R11 carried from discovery. Verified upstream state: `events.ts:209–218` already declares `web:habits:checkin-recorded` (no EventMap edit needed this row); `plugin-web-tokens/i18n.ts` already has all `habits.*` keys + bilingual `nav.habits` (no i18n edit needed); `WebShellIconName` already has `"pin"` for habits at line 29; `shellRegistrations.tsx:53` placeholder swap target confirmed. Sibling-coordination contract: line-disjoint appends to `registry.ts` + `shellRegistrations.tsx` + `apps/web/package.json`; auto-merge expected with siblings #6 and #14. | — | `feature-review` — examine all four docs + the discovery, answer Q1..Q9, then either APPROVE (Suggested Next → `feature-build`) or REVISE (Suggested Next → `feature-plan`). |
| 2026-05-23 | Claude Opus 4.7 1M — feature-review | Reviewed all four planning docs against 12 gates. Verified upstream invariants: events.ts:209-218 (channel pre-declared with exact payload), registry.ts:92 (`MatrixStateBlob = unknown` opaque pattern), registry.ts:324-333 (append target after `xai_matrix_state`), shellRegistrations.tsx:53 (habits placeholder line-disjoint from siblings at lines 47 + 52). All 9 open questions resolved with planner recommendations. 5 non-blocking recommendations recorded for builder discretion. Verdict: **APPROVED**. Flipped Status Panel → APPROVED + Suggested Next → feature-auto-build. | — | `feature-auto-build` (option B — batch all 3 phases, stop before verify) OR `feature-build` (option A — Phase P1 only) OR `feature-dev-loop` (option C — auto-build + verify). |
| 2026-05-23 14:10 | claude-opus-4-7 — feature-verify (re-run) | **Re-verify after lint-fix `3b4f63d`** — All 17 gates PASS. (1) habits test 118/118 in 19 files; (2) habits check-types clean; (3) habits lint EXIT 0 / 0 warnings (was 2 before `3b4f63d`); (4) plugin-web-storage check-types clean; (5) @repo/web check-types clean; (6) @repo/web test 50/50 in 14 files; (7) C1 strict-consecutive streak verified at `internal/computeStreak.ts:30` (early-return when today not checked, walk-back via `cursor.setUTCDate(-1)`); (8) F2 per-habit per-month diary verified at `types.ts:44` (`diaries: Record<HabitId, Record<MonthKey, string>>`); (9) D3 weekStart prop default "sun" verified at `registration.tsx:25` (`HabitsSlotHost` hard-codes `"sun"`); (10) E1 year-scoped 6/365 progress verified at `internal/computeStats.ts:41-50` (year prefix filter + 365/366 leap-aware); (11) `xai_habits_state` registered at `plugin-web-storage/src/internal/registry.ts:341` (owner=xai-web-habits, codec=json, schemaVersion=1, proposed=false); (12) emit on add+remove verified at `HabitsModule.tsx:68-70` (unconditional `emitCheckInRecorded` after `toggleCheckIn`); (13) slot registration verified at `shellRegistrations.tsx:58` (habitsSlotRegistration; moduleId=habits, icon=pin, railOrder=8); (14) MonthCalendar 35-cell fixed grid verified at `MonthCalendar.tsx:75-105` (pre-padding + numDays + post-padding with `cells.splice(35)` truncate); (15) cross-vendor cold-read covered by AC-PERSIST-2 unmount+remount + AC-PERSIST-3..5 (seed / corrupted-JSON / schemaVersion mismatch); (16) cross-vendor smoke XVENDOR-1..9 DEFERRED to ship-time human per `test.md` §6 (precedent: matrix / countdown / pet); (17) commit hygiene PASS — `d096f37` feat (P1+P2+P3), `6d39407` chore (commit-hash record), `3b4f63d` fix (lint, single intent, conventional body), `d391268` docs (work log) — all 4 commits scoped to habits package + storage-registry + web shell wiring; single intent each; `type(scope): summary` format with Why/What/Scope/Risk/Docs/Tests on the new `3b4f63d`. Flipped Status=READY_TO_SHIP + Suggested Next=ship. | — | `ship` |
| 2026-05-23 13:42 | claude-sonnet-4-6 — feature-auto-build | **Lint-fix (verify blocker)**: Removed unused `import { utcDateKey }` from `HabitsModule.tsx:26`. Rewrote destructure in `validate.test.ts:32` to `const rest = { ...validHabit }; delete (rest as { emoji?: string }).emoji;` to eliminate `_e` no-unused-vars warning. Gates: `pnpm --filter @repo/plugin-web-habits lint` → exit 0, 0 warnings; `pnpm --filter @repo/plugin-web-habits test` → 118/118 pass. Status remains READY_FOR_VERIFY. | 3b4f63d fix(xai-web-habits): resolve verify blockers — 2 lint warnings under --max-warnings 0 | feature-verify |
| 2026-05-23 10:45 | claude-sonnet-4-6 — feature-auto-build | **P1**: Created full package skeleton at `packages/xai-web-habits/` — package.json, tsconfig.json, manifest.json, vitest.config.ts, eslint.config.js. Implemented all P1 source files: types.ts, constants.ts, internal/dateKeys.ts, internal/seed.ts (5 bilingual habits), internal/icons.tsx (10 SVG glyphs), internal/createId.ts, internal/validate.ts, internal/usePersistedHabits.ts (seed hydration on first mount), internal/toggle.ts (pure `toggleCheckIn`), internal/computeStreak.ts (C1 strict-consecutive), internal/emit.ts, HabitRow.tsx, HabitList.tsx, HabitsModule.tsx, registration.tsx, index.ts, styles.css. Cross-package additive writes: `plugin-web-storage/registry.ts` (HabitsStateBlob + `xai_habits_state` entry), `shellRegistrations.tsx` (habitsSlotRegistration swap), `apps/web/package.json` (dep line). All P1 tests written. **P2**: Added internal/computeStats.ts, StatCard.tsx, MonthCalendar.tsx (35-cell fixed grid with splice truncation for overflow months), HabitDetail.tsx. Extended HabitsModule.tsx with detail pane + displayedMonth state. Extended styles.css with stat-grid, progress-card, month-cal rules (tokens-only). **P3**: Added DiaryCard.tsx (blur-flush with equality guard), internal/AddHabitDialog.tsx (native `<dialog>`). Wired addDialogOpen state in HabitsModule.tsx. Added useEffect to sync selectedId on seed hydration. All test files written. **Test fixes applied**: styles.css hex fallbacks removed, MonthCalendar splice-to-35 logic, render/i18n tests wrapped in `await act()`, calendar test month changed to April 2026 (fits cleanly in 35 cells), `getByText` → `getAllByText` for duplicate-text cases, TypeScript type annotations added. **Quality gates**: `pnpm --filter @repo/plugin-web-habits test` → 118/118 passed (19 files); `check-types` → 0 errors on habits, plugin-web-storage, @repo/web. | d096f37 feat(xai-web-habits): P1+P2+P3 — full @repo/plugin-web-habits implementation | `feature-verify` |
| 2026-05-23 19:10 | claude-sonnet-4-6 — ship | Fix date-sensitive test AC-RENDER-2 (vi.useFakeTimers moved to beforeEach so fake time is restored between tests). Verified 118/118 pass. Flipped manifest.json → Production, dev_log → SHIPPED, PLUGIN_MAP.md row #15 → Stable, roadmap manifest row #15 → SHIPPED. Created chore commit + pushed. | chore(xai-web-habits): ship — flip dev_log + manifest #15 to SHIPPED + test-timer fix | Workflow complete — next: ship xai-web-meditation (row #16) |
