# Dev Log — xai-web-calendar

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-calendar |
| Title | Web Console — Calendar module (port `module-calendar.jsx`) |
| Current Phase | FEATURE_PLAN |
| Status | NEEDS_REVIEW |
| Suggested Next | feature-review |
| Verify Cross-vendor | yes (Safari 17+ / Chrome / Firefox — month-grid render + chip colors + view switcher + deep-link receive + month-nav + lang switch + week-start flip — see test.md §6) |
| Automation Mode | A-Claude (xai-roadmap-loop W2c parallel-Agent mode; siblings: #16 xai-web-meditation + #18 xai-web-ai-chat) |
| Executor | claude-opus-4-7 — feature-plan |
| Updated | 2026-05-23 |
| Dispatched By | xai-roadmap-loop (W2c parallel dispatch, manifest row #12) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #12 (W2 Module — Calendar) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map row `module-calendar.jsx` → `packages/plugin-web-calendar/src/`) + §S5 (TSX rules) + §S7 (event bus listen-only) + §S8 (persistence registry `xai_pref_*` family) |
| Concurrent Siblings | #16 xai-web-meditation · #18 xai-web-ai-chat — file writes scoped to `packages/xai-web-calendar/` + `docs/reviews/xai-web-calendar/` only; sibling-edge files (`shellRegistrations.tsx` + `apps/web/package.json` + storage `registry.ts` + tokens `i18n.ts`) get one append each — see Risks §R3 |
| Write Scope (plan) | `packages/xai-web-calendar/docs/` + `docs/reviews/xai-web-calendar/` |
| Write Scope (build) | will extend to: `packages/xai-web-calendar/src/**` (new), `packages/plugin-web-storage/src/internal/registry.ts` (1 append, P2), `packages/plugin-web-tokens/src/i18n.ts` (3 keys × 2 langs additive, P2), `apps/web/src/routes/modules/shellRegistrations.tsx` (1 line swap + 1 import, P1), `apps/web/package.json` (1 dep line, P1) — all per `docs/reviews/xai-web-calendar/20260523-discovery-review.md` §6 R3 |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-calendar/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-calendar/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-calendar/docs/design.md`
- API contract: `packages/xai-web-calendar/docs/api.md`
- Test strategy: `packages/xai-web-calendar/docs/test.md`

## Decision Headline

Selected **Option A1 — package at `packages/xai-web-calendar/` named
`@repo/plugin-web-calendar`** (sibling W2 convention), with:

- **B1 sample-event constant** inlined as `SAMPLE_EVENTS` from
  `i18n.js:509-541` — no storage of events in v1 (banner already
  declares "Sample data — switch to your account…").
- **C1 `usePref("xai_pref_week_start", 0)`** — new registry entry,
  owner = `xai-web-calendar`, schemaVersion 1, default 0 (Sunday).
- **D1 listen-only on `web:shell:module-change`** — existing channel
  declared at `packages/core/src/types/events.ts:175`. No core edit.
- **E1 holiday i18n inlining** — `cal.holiday_mayday` +
  `cal.holiday_mothers_day` added to both EN + ZH bundles. Table-
  driven detection via `findHolidayKey(year, month, day)`.
- **F1 view switcher "Coming soon"** — Week + Day tabs functional in
  state, but the grid is replaced by a `<ComingSoonPanel>` showing
  `cal.coming_soon` bilingually. Month is the only working view.
- **G1 month-nav live** — `<` / `>` step `displayedMonth` ±1 month;
  `today` resets to `{2026, 5}` (design anchor) in v1.
- **H1 ISO 8601 week numbers** — pure `isoWeekNumber(date): number`
  helper used by `monthGridCells` on column-0 cells only.
- **I1 mount-only today-detection** — `useMemo(() => utcDateKey(new
  Date()), [])` once per mount. Out-of-month pad cells never get the
  today-pill (R6 mitigated).
- **J1 no cross-tab broadcast** — same-tab fan-out via `emitWebEvent`
  is sufficient per the acceptance signal.
- **Slot registration** via `WebModuleSlotRegistration` from
  `@repo/xai-web-shell` — replaces `shellRegistrations.tsx:55`
  (`moduleId: "calendar"`, `icon: "calendar"`, `railOrder: 5`).

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Package skeleton + Month grid render + view switcher + today detection + sample event chips + shell wiring | PENDING | — |
| P2 — Month-nav (`<` / `>` / `today`) + deep-link receive + i18n delta (3 keys × 2 langs) + holiday rendering + `xai_pref_week_start` registry entry + week-start consumption | PENDING | — |
| P3 — ComingSoonPanel for Week/Day + dark-theme token verification + cross-vendor smoke + edge-case tests (6-row month, leap-year Feb, year rollover) + docs sync | PENDING | — |

## Phase Plan (3 phases)

> Each phase is a single `feature-build` run. After each phase,
> `feature-build` stops for human confirmation per CLAUDE.md
> "feature-build does ONE phase per run". Phases are ordered to keep
> diff small and reviewable.

### Phase P1 — Package skeleton + Month grid + view switcher + sample event chips + shell wiring

**Goal**: visible in rail at `/app/calendar`; Month grid renders May
2026 with all 65 sample event chips in 4 colors; today-pill on the
real UTC today (within May 2026); view switcher renders all 3 tabs but
only Month is functional in P1 (Week/Day tabs flip `aria-selected` but
the grid stays — the ComingSoonPanel arrives in P3); shell wiring
swapped (no more placeholder row at line 55).

**Scope** (write set):

1. **Package scaffolding** at `packages/xai-web-calendar/`:
   - `package.json` — `name "@repo/plugin-web-calendar"`, version `0.0.0`,
     private, `type: "module"`, `"sideEffects": ["./src/styles.css",
     "./src/index.ts"]`, workspace deps on `@repo/core`,
     `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`,
     `@repo/xai-web-event-bus`, `@repo/xai-web-shell`; peerDeps on
     `react@^19` + `react-dom@^19`; devDeps mirror
     `xai-web-habits/package.json`.
   - `tsconfig.json` — extends `@repo/typescript-config/react-library.json`.
   - `manifest.json` — `name: "@repo/plugin-web-calendar"`, `slug:
     "xai-web-calendar"`, `status: "In-Dev"`, `type: "ui"`,
     `owner: "xai-web-calendar"`, `roadmap_row: 12`, `wave: "W2"`,
     `entry: "./src/index.ts"`, dependencies array.
   - `vitest.config.ts` — jsdom + setup file (clears `localStorage`
     per test); mirrors `xai-web-habits/vitest.config.ts`.
   - `eslint.config.js` — extends `@repo/eslint-config`.

2. **Module source files** under `packages/xai-web-calendar/src/`:
   - `types.ts` — `CalendarModuleProps`, `CalendarView`, view-state
     types per `api.md` §1.1.
   - `internal/dateKeys.ts` — `pad2`, `utcDateKey`, `isLeapYear`,
     `daysInMonth` per `design.md` §6.1.
   - `internal/isoWeekNumber.ts` — pure ISO 8601 algorithm per `design.md` §6.2.
   - `internal/sampleEvents.ts` — typed `SAMPLE_EVENTS` constant byte-
     for-byte from `i18n.js:509-541`. + `CalEvent`, `CalEventColor`,
     `CalEventsByDay` types.
   - `internal/holidays.ts` — `HOLIDAYS` table + `findHolidayKey` per
     `design.md` §6.4.
   - `internal/weekdays.ts` — `weekdayLabels(weekdaysShort, weekStart)`
     per `design.md` §6.5.
   - `internal/formatMonth.ts` — `formatMonthTitle(y, m, lang, t)`
     per `design.md` §6.6.
   - `internal/monthGridCells.ts` — `monthGridCells(year, month, weekStart)`
     per `design.md` §6.3.
   - `internal/icons.tsx` — inline SVG glyphs (`list`, `plus`,
     `arrowL`, `arrowR`, `dots`, `star`, `chevR`) — paths copied
     byte-for-byte from `web design/icons.jsx`.
   - `CalendarToolbar.tsx` — left/title/view-seg/nav-buttons row.
   - `WeekdayHeader.tsx` — 7-col header.
   - `MonthCell.tsx` — single grid cell (day-head + events).
   - `MonthRow.tsx` — 7 cells in a row.
   - `MonthGrid.tsx` — header + 5/6 rows.
   - `CalendarBanner.tsx` — sample-data banner.
   - `CalendarModule.tsx` — top-level component; view-state default
     `"month"`; displayedMonth default `{2026, 5}`; today via
     `useMemo`. In P1 the Week/Day tab clicks update local state but
     the grid still renders — ComingSoonPanel arrives in P3.
   - `registration.tsx` — `calendarSlotRegistration` +
     `CalendarSlotHost` wrapper per `design.md` §8.
   - `index.ts` — public surface barrel per `api.md` §1.
   - `styles.css` — module styles (cal-toolbar / cal-grid / cal-day /
     cal-event color rules + dark overrides). Tokens-only.

3. **Host wiring** (P1, line-disjoint from siblings):
   - `apps/web/src/routes/modules/shellRegistrations.tsx` — replace
     `placeholder("calendar", "Calendar", "calendar", 5)` at line 55
     with `calendarSlotRegistration` (imported at the top of the file
     among the other module imports).
   - `apps/web/package.json` — append `"@repo/plugin-web-calendar":
     "workspace:*"` to `dependencies` (single line, additive).

4. **Tests** (P1):
   - `__tests__/CalendarModule.render.test.tsx` — AC-RENDER-1..6.
   - `__tests__/CalendarToolbar.test.tsx` — AC-RENDER-2, AC-VIEW-1..2, AC-I18N-3.
   - `__tests__/MonthGrid.test.tsx` — AC-RENDER-3, AC-EVENT-1..4.
   - `__tests__/MonthCell.test.tsx` — AC-EVENT-6, AC-TODAY-2.
   - `__tests__/CalendarBanner.test.tsx` — AC-RENDER-5, AC-I18N-7.
   - `__tests__/CalendarModule.i18n.test.tsx` — AC-I18N-1..2.
   - `__tests__/CalendarModule.events.test.tsx` (named `events`
     because it asserts NO `emitWebEvent`) — AC-EVENT-7.
   - `__tests__/dateKeys.test.ts` — AC-DATE-1..6.
   - `__tests__/isoWeekNumber.test.ts` — AC-ISO-1..4.
   - `__tests__/monthGridCells.test.ts` — AC-GRID-1..6 (AC-GRID-7
     holidays deferred to P2 when holidays.ts is wired in).
   - `__tests__/sampleEvents.test.ts` — AC-FIXTURE-1..6, AC-EVENT-5.
   - `__tests__/registration.test.tsx` — AC-SHELL-1..2.
   - `__tests__/styles.css.tokens.test.ts` — AC-TOKENS-1.
   - `__tests__/index-barrel.test.ts` — AC-BARREL-1.
   - `__tests__/types.test-d.ts` — AC-TYPE-1..4.
   - `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts`
     (extend) — AC-SHELL-3.

5. **Quality gates** (P1 exit):
   - `pnpm --filter @repo/plugin-web-calendar test` — green.
   - `pnpm --filter @repo/plugin-web-calendar check-types` — 0.
   - `pnpm --filter @repo/plugin-web-calendar lint` — 0 warnings.
   - `pnpm --filter @repo/web check-types` — 0.
   - `pnpm --filter @repo/web test` — green.
   - Manual: `pnpm dev` in `apps/web/`; visit `/app/calendar`; see May
     2026 + 65 chips + today-pill + all 3 view tabs (Month
     functional, Week/Day tab-flips show no UI change in P1).

**Out of P1**: holidays.ts integration into the grid, holiday i18n
keys, `<` / `>` / `today` month-nav, deep-link, week-start
registration, ComingSoonPanel. All deferred to P2/P3.

---

### Phase P2 — Month-nav + deep-link + i18n delta + holiday rendering + week-start

**Goal**: navigation works; deep-link from MiniCal (or DevTools-emitted
test event) lands on the focused date; i18n delta keys present in both
bundles; May 1 + May 9 cells show holiday labels (EN + ZH); week-start
preference flips weekday header order live.

**Scope** (write set):

1. **New cross-package writes** (line-disjoint additive):
   - `packages/plugin-web-storage/src/internal/registry.ts` — append
     `xai_pref_week_start` entry at file tail. + add `RailPos` already
     done; this is purely additive (`PrefEntry<0 | 1>`).
   - `packages/plugin-web-tokens/src/i18n.ts` — additive keys in both
     `en.cal` + `zh.cal` blocks:
     - `coming_soon: "Week and Day views are coming soon."` /
       `"周视图与日视图即将推出。"`
     - `holiday_mayday: "Labor Day"` / `"劳动节"`
     - `holiday_mothers_day: "Mother's Day"` / `"母亲节"`

2. **Component changes** in `packages/xai-web-calendar/src/`:
   - `CalendarModule.tsx` — wire `onPrevMonth` / `onNextMonth` /
     `onResetToday` handlers; read `weekStart` from
     `usePref("xai_pref_week_start", 0)` and pass to `MonthGrid`; add
     `useWebEventListener("web:shell:module-change", handler)` per
     `design.md` §7.1.
   - `CalendarToolbar.tsx` — wire `<` / `>` icon-btn onClicks and
     `today` button onClick to the handlers.
   - `MonthCell.tsx` — render holiday label when `cell.holidayKey` is
     set (uses `t.cal[key suffix]` via `s("cal.holiday_mayday")` etc.)
     + add `data-focused="true"` attribute on cell matching `focusedDate`.
   - `MonthGrid.tsx` — accept `weekStart`, `focusedDate`.
   - `internal/monthGridCells.ts` — wire `findHolidayKey` into cell
     emission.

3. **Tests** (P2):
   - `__tests__/CalendarModule.nav.test.tsx` — AC-NAV-1..6.
   - `__tests__/CalendarModule.deeplink.test.tsx` — AC-DEEPLINK-1..6.
   - `__tests__/CalendarModule.weekstart.test.tsx` — AC-WEEKSTART-1..3.
   - `__tests__/MonthCell.test.tsx` — extend with AC-I18N-4, AC-I18N-5.
   - `__tests__/monthGridCells.test.ts` — extend with AC-GRID-7
     (holiday key attach).
   - `__tests__/holidays.test.ts` — `findHolidayKey` table-lookup correctness.
   - `__tests__/weekdays.test.ts` — `weekdayLabels` rotation correctness.
   - `__tests__/formatMonth.test.ts` — title formatting for EN / ZH /
     all 12 months.
   - `packages/plugin-web-storage/src/__tests__/registry.test.ts`
     (extend) — AC-REGISTRY-1..2.
   - `packages/plugin-web-tokens/src/__tests__/i18n.test.ts` (extend
     if exists, else create skeleton) — assert ZH-EN parity for the 3
     new keys.

4. **Quality gates** (P2 exit):
   - All P1 gates still green.
   - All AC-NAV-*, AC-DEEPLINK-*, AC-WEEKSTART-*, AC-I18N-4..5, AC-GRID-7,
     AC-REGISTRY-1..2 pass.
   - `pnpm --filter @repo/plugin-web-storage check-types` — 0.
   - `pnpm --filter @repo/plugin-web-tokens check-types` — 0.

**Out of P2**: ComingSoonPanel, dark-theme assertion, cross-vendor smoke.

---

### Phase P3 — ComingSoonPanel + dark-theme verification + cross-vendor smoke + edge cases + docs sync

**Goal**: Week/Day view-tab clicks swap the grid for ComingSoonPanel
(bilingual); dark-theme oklch values verified byte-parity with
`layout.css:853-856`; cross-vendor smoke recorded; edge-case tests for
6-row month + leap-year Feb + year rollover; docs synced.

**Scope** (write set):

1. **New component files** under `packages/xai-web-calendar/src/`:
   - `ComingSoonPanel.tsx` — centered panel with `cal.coming_soon`
     bilingual string.

2. **Component changes**:
   - `CalendarModule.tsx` — replace inline `MonthGrid` render with a
     conditional: `view === "month" ? <MonthGrid …/> : <ComingSoonPanel
     lang={lang} />`.

3. **Styles**:
   - `styles.css` — add `.cal-coming-soon` rule (centered text inside
     `.cal-grid.panel` outer container).
   - Confirm dark-theme overrides match `layout.css:853-856`.

4. **Edge-case test additions** in `src/__tests__/`:
   - `monthGridCells.test.ts` — extend with AC-GRID-3 (6-row Aug 2026),
     AC-GRID-4 (leap-year Feb 2024 — actually 29-day Feb 2024
     Sunday-first gives 5 rows; the test asserts 35 cells).
   - `CalendarModule.nav.test.tsx` — extend with AC-NAV-3 (year
     rollover Dec → Jan).
   - `CalendarModule.render.test.tsx` — extend with AC-TODAY-3 (DST
     boundary).
   - `ComingSoonPanel.test.tsx` — AC-VIEW-4.
   - `CalendarModule.render.test.tsx` — extend with AC-VIEW-3, AC-VIEW-5.
   - `styles.css.tokens.test.ts` — extend with AC-TOKENS-2 (dark
     overrides).

5. **Cross-vendor manual smoke** (`test.md` §6):
   - Run `apps/web` in Safari 17+ / Chrome / Firefox on macOS.
   - Execute all 9 AC-XVENDOR-* checklist items.
   - Record results in `dev_log.md` `Verify Notes` block (created when
     `feature-verify` runs).

6. **Coverage check**:
   - `pnpm --filter @repo/plugin-web-calendar test:coverage` meets
     `test.md` §4 targets (≥ 90 % stmts / ≥ 85 % branches / ≥ 95 % fns
     / ≥ 90 % lines).

7. **Docs sync**:
   - Update `design.md` / `api.md` / `test.md` with any concrete-vs-
     planned deltas discovered during P1/P2 builds.
   - Confirm `manifest.json` status is correctly `In-Dev` (flip to
     `Production` happens in `ship`).

8. **Quality gates** (P3 exit → ready for `feature-verify`):
   - All AC-* automated tests pass (~ 60 distinct AC IDs covered).
   - All AC-XVENDOR-* manual checks recorded (or formally DEFERRED to
     ship-time human per matrix / habits precedent).
   - `pnpm --filter @repo/plugin-web-calendar test:coverage` meets targets.
   - `pnpm -w lint` green across all touched workspaces.
   - `pnpm -w check-types` green across all touched workspaces.

**Hand-off after P3**: `dev_log.md` flips to `Status: READY_FOR_VERIFY`,
`Suggested Next: feature-verify`. The `feature-verify` agent flips to
`READY_TO_SHIP` once gates §7 of `test.md` are confirmed.

---

## Risks (carried from `discovery-review.md` §6.1)

| ID | Risk | Severity | Status |
|---|---|---|---|
| R1 | Month-grid leading/trailing pad math breaks on 6-row months | Medium | Mitigated: `monthGridCells` is pure + tested across 4 representative months (May 2026 / Aug 2026 / Feb 2024 / Dec 2026). |
| R2 | ISO week-number computation differs from prototype labels | Low | Mitigated: ISO 8601 yields W18-W22 for May 2026 (Mon-first), W17-W21 (Sun-first); matches prototype. AC-ISO-1..4. |
| R3 | Parallel siblings (#16 meditation + #18 ai-chat) touch the same `shellRegistrations.tsx` + `apps/web/package.json` + `i18n.ts` | Medium | All three rows add line-disjoint edits. `shellRegistrations.tsx`: calendar swaps line 55, meditation swaps line 59, ai-chat swaps line 51 — line-disjoint. `apps/web/package.json`: each adds a single dep line. `i18n.ts`: calendar adds `cal.*` keys, meditation adds `med.*` keys, ai-chat adds `ai.*` keys — namespace-disjoint. All edits use Edit (not Write); retry git index lock 8-20s × 5 on conflict per user prompt. |
| R4 | New `xai_pref_week_start` registry entry conflicts with Settings W4 | Low | Documented: calendar claims first-consumer ownership; Settings W4 will read-only or transfer ownership via one-line edit. §6.2 follow-up. |
| R5 | `web:shell:module-change` listener loops | Low | Calendar is listen-only; AC-EVENT-7 asserts no `emitWebEvent` import. |
| R6 | Out-of-month days get today-pill | Low | Mitigated: `MonthCell` gates pill on `cell.inMonth === true`. AC-TODAY-2. |
| R7 | DST shifts perceived today UTC | Low | Mitigated: all date keys UTC. AC-TODAY-3. |
| R8 | Holiday i18n only EN + ZH | Low | v1 console scope is EN + ZH only. Future row. |
| R9 | Event chip overflow `+N` crowds small cells | Low | Mitigated: `.cal-events` overflow:hidden + `max-height`. Visual check in cross-vendor smoke. |
| R10 | i18n delta merge conflict with siblings | Low | Namespace-disjoint (`cal.*` vs `med.*` vs `ai.*`). No overlap. |
| R11 | `displayedMonth` initializer to `{2026, 5}` is brittle past May 2026 | Medium | Documented as §6.2 follow-up #2; design anchor matches sample data. |
| R12 | Concurrent sibling commits race on `apps/web/package.json` | Medium | Mitigated: Edit on top-of-dependencies anchor with retry; `pnpm install` runs once at phase end. |

## Open Questions for feature-review

- **Q1** — Directory naming: `packages/xai-web-calendar/` (sibling
  convention) vs `packages/plugin-web-calendar/` (ADR §S4 port-map
  literal).
  - **Planner recommendation**: `packages/xai-web-calendar/` (directory) +
    `@repo/plugin-web-calendar` (package name). Matches matrix Q1
    resolution + W2 sibling convention.
- **Q2** — Event data source in v1: B1 sample inline vs B2 storage
  blob.
  - **Planner recommendation**: B1. Matches prototype semantics; seed
    brief explicitly defers create/edit to future rows.
- **Q3** — Week-start strategy: C1 `usePref("xai_pref_week_start", 0)`
  vs C2 prop-only.
  - **Planner recommendation**: C1. Seed brief explicitly requests
    `usePref` with default 0. Adds one ADR-0007 §S8 owner-row
    registration.
- **Q4** — ISO week-number algorithm (H1 compute) vs hard-code (H2).
  - **Planner recommendation**: H1. 12-line pure function with full
    test coverage adds correctness for all months.
- **Q5** — Month-nav buttons live (G1) vs no-op (G2) vs real-current
  (G3).
  - **Planner recommendation**: G1. Buttons are clearly affordances;
    no-op reads as broken. May 2026 anchor matches design source.
- **Q6** — Holiday i18n: E1 lift to bundle vs E2 keep prototype
  semantics vs E3 drop.
  - **Planner recommendation**: E1. Bilingual is hard constraint;
    empty EN strings violate parity.
- **Q7** — Deep-link channel: D1 reuse existing `web:shell:module-change`
  vs D2 new `web:calendar:navigate`.
  - **Planner recommendation**: D1. Already declared at
    `events.ts:175`; constraint forbids new core/events.ts edit. The
    `xai-web-event-bus/docs/api.md:197-198` already declares calendar-
    as-listener via D1.
- **Q8** — Today re-detect: I1 mount-only vs I2 interval vs I3
  visibilitychange.
  - **Planner recommendation**: I1. Gold-plating for v1.
- **Q9** — Week/Day stub: F1 "Coming soon" panel vs F2 hide buttons.
  - **Planner recommendation**: F1. Honors acceptance signal "view
    switcher renders all 3 tabs".
- **Q10** — Cross-tab focusDate replay: J1 no broadcast vs J2
  BroadcastChannel.
  - **Planner recommendation**: J1. Same-tab fan-out via `emitWebEvent`
    is sufficient.

## Review Notes

_Will be filled by `feature-review`._

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M — feature-plan | Wrote `discovery-review.md`, `design.md`, `api.md`, `test.md`, and this `dev_log.md`. Frozen 14 assumptions in `design.md` §1.1. Identified 10 open questions for review (Q1..Q10). Risks R1..R12 carried from discovery. Verified upstream state: `events.ts:175-184` already declares `web:shell:module-change` with `focusDate?` (no EventMap edit); `plugin-web-tokens/i18n.ts:62-66 + 247-251` already has `cal.month/week/day/today/sample_banner` (additive keys only); `WebShellIconName` already has `"calendar"` at types.ts:22; `shellRegistrations.tsx:55` placeholder swap target confirmed; `xai-web-event-bus/docs/api.md:197-198` declares calendar-as-listener on `web:shell:module-change` for `moduleId === "calendar"` with `focusDate`. Sibling-coordination contract: line-disjoint Edit on `shellRegistrations.tsx` (lines 51/55/59 for ai-chat/calendar/meditation) + `apps/web/package.json` (3 separate dep lines) + storage `registry.ts` (file-tail append) + tokens `i18n.ts` (namespace-disjoint `ai.*` / `cal.*` / `med.*`). | — | `feature-review` — examine all four docs + the discovery, answer Q1..Q10, then either APPROVE (Suggested Next → `feature-auto-build`) or REVISE (Suggested Next → `feature-plan`). |
