# Dev Log — xai-web-calendar

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-calendar |
| Title | Web Console — Calendar module (port `module-calendar.jsx`) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (Safari 17+ / Chrome / Firefox — month-grid render + chip colors + view switcher + deep-link receive + month-nav + lang switch + week-start flip — see test.md §6) |
| Automation Mode | A-Claude (xai-roadmap-loop W2c parallel-Agent mode; siblings: #16 xai-web-meditation + #18 xai-web-ai-chat) |
| Executor | claude-sonnet-4-6 — ship |
| Updated | 2026-05-23 19:01 |
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
| P1 — Package skeleton + Month grid render + view switcher + today detection + sample event chips + shell wiring | DONE | e32cd0a (see Work Log) |
| P2 — Month-nav (`<` / `>` / `today`) + deep-link receive + i18n delta (3 keys × 2 langs) + holiday rendering + `xai_pref_week_start` registry entry + week-start consumption | DONE | e32cd0a (see Work Log) |
| P3 — ComingSoonPanel for Week/Day + dark-theme token verification + edge-case tests (6-row month, leap-year Feb, year rollover) + docs sync | DONE | e32cd0a (see Work Log) |

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

**Verdict: APPROVED** — plan is executable with no blocking ambiguity. All 12 gates pass.

### Gate-by-gate verification

| Gate | Status | Evidence |
|---|---|---|
| 1. Seed-brief fidelity (Month view + 4-color event bands + Week/Day stubs + deep-link receive + EN/中文 parity) | PASS | `design.md` §3 component composition; §11 acceptance traceability table maps every seed-brief signal to AC IDs; §12 deep-link sequence diagram. |
| 2. 4-color event tokens come from `web design/layout.css:849-852` byte-for-byte | PASS | `design.md` §9 copies the 4 oklch rules verbatim into `styles.css` plan; AC-TOKENS-1 grep test enforces it. |
| 3. Deep-link via existing `web:shell:module-change` channel (no core/events.ts edit) | PASS | `design.md` §7.1 + `api.md` §2.3. Verified at `packages/core/src/types/events.ts:175-184` — channel declares `focusDate?: string`. `xai-web-event-bus/docs/api.md:197-198` already declares calendar-as-listener; this row is the listen-side contract. |
| 4. Week-start via `usePref("xai_pref_week_start", 0)` | PASS | `design.md` §5.1 + `api.md` §2.1. New registry entry `xai_pref_week_start`, owner = `xai-web-calendar`, codec = `"number"`, default 0 (Sunday), schemaVersion 1, category = `"pref"` (matches the `xai_pref_*` ADR-0007 §S8 family). Type `PrefEntry<0 \| 1>` gives consumers exhaustiveness checks. |
| 5. Bilingual via `useI18n` with additive `cal.*` keys | PASS | `api.md` §2.2 lists the 3 new keys with EN+ZH copy. Verified upstream: `plugin-web-tokens/i18n.ts:62-66 + 247-251` already has `cal.month/week/day/today/sample_banner`. The 3 additions (`coming_soon`, `holiday_mayday`, `holiday_mothers_day`) drop into the same namespace — no rename, no removal. `I18NBundle` typeof-derivation enforces ZH parity at compile time. |
| 6. Module registers via `@repo/xai-web-shell` slot pattern | PASS | `design.md` §8. `calendarSlotRegistration` matches `WebModuleSlotRegistration` shape; `moduleId: "calendar"`, `icon: "calendar"` (already in `WebShellIconName` at `xai-web-shell/types.ts:22`), `railOrder: 5`, `i18nKey: "nav.calendar"` (already in `plugin-web-tokens/i18n.ts:17 + 202`), `showInRail: true`. Shell wiring swaps `shellRegistrations.tsx:55` placeholder. |
| 7. Listen-only event surface (no emit) | PASS | `design.md` §7.2 + `api.md` §2.4. AC-EVENT-7 grep-asserts no `emitWebEvent` import. |
| 8. 3-phase right-sized plan | PASS | P1 (skeleton + Month grid + chips + shell wiring → visible-in-rail exit). P2 (nav + deep-link + i18n + holidays + week-start). P3 (ComingSoonPanel + dark-theme + cross-vendor + edge-cases + docs sync). Each phase has clear file boundaries and quality gates; each is single-commit. |
| 9. Cross-vendor verify: yes | PASS | `test.md` §6 declares 9 XVENDOR-* checks across Safari 17+/Chrome 120+/Firefox 120+. Recordable or DEFERRED at ship-time human per matrix / countdown / habits precedent. |
| 10. Sibling-coordination: line-disjoint appends | PASS | Verified in actual `shellRegistrations.tsx`: line 51 = ai (placeholder, replaced by sibling #18), line 55 = calendar (this row), line 59 = meditation (placeholder, replaced by sibling #16) — all line-disjoint. `apps/web/package.json` gets 3 separate dep lines (calendar/meditation/ai-chat). `i18n.ts` namespace-disjoint (`cal.*` vs `med.*` vs `ai.*`). Storage `registry.ts` file-tail append (only calendar adds `xai_pref_week_start`; siblings add different keys at the file tail). All edits use Edit (not Write) with unique anchors per user prompt §"Concurrency rules". |
| 11. Q1..Q10 resolved | PASS | All 10 questions answered with planner recommendation (see Question Resolution below). |
| 12. Architectural risk: none | PASS | No `packages/core/` edit (channel pre-declared). No new event channel; listen-only. No `manifest.json` routing changes (slot pattern). No cross-feature contract drift (MiniCal emit-side is owned by future dashboard row #11; this row specifies only the listen-side contract, already approved in `xai-web-event-bus/docs/api.md:197-198`). |

### Question Resolution

- **Q1 (directory naming)** — APPROVE A1: `packages/xai-web-calendar/` + `@repo/plugin-web-calendar`. Matches matrix Q1 + W2 sibling convention (habits / pomodoro / pet / countdown / tasks all follow this pattern).
- **Q2 (event data source)** — APPROVE B1: inline `SAMPLE_EVENTS` constant. Prototype banner already declares "Sample data — switch to real account…"; seed brief never asks for user-created events in v1. Storage path is gold-plating with no consumer.
- **Q3 (week-start strategy)** — APPROVE C1: `usePref("xai_pref_week_start", 0)`. Seed brief explicitly requests this. Adds one ADR-0007 §S8 owner-row registration (`xai_pref_*` family). Note: planner correctly chose `owner: "xai-web-calendar"` for first-consumer ownership; Settings W4 row #24 can transfer ownership later via a one-line edit if needed.
- **Q4 (ISO week-number)** — APPROVE H1: compute. 12-line pure helper + AC-ISO-1..4 (year-start, year-end, Sun-Jan-1 edge) gives correctness across all months we navigate to. Hard-code (H2) would lock us to May 2026.
- **Q5 (month-nav)** — APPROVE G1: live `<` / `>` + `today` resets to (2026, 5). Reading buttons as no-ops would confuse users. Anchoring `today` to the design source month (rather than real `new Date()`) keeps visual parity with sample-event coverage. Follow-up §6.2 #2 records the flip when SPA ages past May 2026.
- **Q6 (holiday i18n)** — APPROVE E1: lift to bundle. Bilingual is a hard constraint; empty EN strings violate the seed-brief acceptance signal "EN/中文 parity holds". Table-driven detection via `findHolidayKey` is extensible to future months without grid changes.
- **Q7 (deep-link channel)** — APPROVE D1: reuse `web:shell:module-change`. User prompt §"Concurrency rules" forbids `packages/core/` edits unless ADR-0007 specifies a NEW channel for this row — it does not. The existing channel carries `focusDate?: string` and `xai-web-event-bus/docs/api.md:197-198` already declares calendar-as-listener.
- **Q8 (today re-detect)** — APPROVE I1: mount-only memo. The countdown row (#17) interval pattern would be gold-plating for the calendar today-marker. Documented as low-impact in `discovery-review.md` §3.9.
- **Q9 (Week/Day stub)** — APPROVE F1: ComingSoonPanel. Honors the acceptance signal verbatim ("view switcher renders all 3 tabs (Week/Day OK if stubbed with a 'Coming soon' placeholder)"). F2 (hide) would fail the literal acceptance signal.
- **Q10 (cross-tab broadcast)** — APPROVE J1: no broadcast. Same-tab fan-out via `emitWebEvent` covers the acceptance signal; cross-tab is out of scope for v1.

### Recommendations (non-blocking — apply during build at builder's discretion)

1. **`displayedMonth` initializer follow-up flag** — `design.md` §1.1 assumption #7 anchors `displayedMonth` to `{2026, 5}`. The dev_log §6.2 follow-up records the flip path. Builder may add an inline `// FIXME-ROW: flip to currentMonth() once Settings W4 lands` comment in `CalendarModule.tsx` so the future maintainer doesn't need to trace docs.

2. **AC-DEEPLINK-6 console.warn assertion** — `api.md` §3.3 specifies `console.warn` once for malformed `focusDate`. Builder should use `vi.spyOn(console, "warn")` + assert called exactly once (not more — the equality guard in `useState` should prevent re-warn on repeat malformed payloads).

3. **`xai_pref_week_start` proposed flag** — Planner correctly omits the `proposed: true` field (canonical name approved by worker brief #12 + the `xai_pref_*` family is already established). Builder may add `// proposed: false — canonical name approved by worker brief #12, owner first-consumer pattern` comment as a paper trail for Settings W4 takeover.

4. **AC-FIXTURE-3 total-count assertion** — `api.md` §1.2 says total event count = 65, derived from i18n.js inspection. Builder should also assert color-distribution counts (mint ≈ 50, amber ≈ 11, blue ≈ 3, violet ≈ 1) in `sampleEvents.test.ts` AC-FIXTURE-3/4 — this catches accidental color-class renames during the transcription. Non-blocking.

5. **i18n parity test extension** — `plugin-web-tokens/__tests__/i18n.test.ts` (if it exists; else create a minimal one) should grep-assert that every key under `en.cal` also appears under `zh.cal`. This is a defense-in-depth on top of TypeScript's `I18NBundle = typeof I18N["en"]` enforcement.

### Architectural risk: none

- No `packages/core/` edit (channel declared at events.ts:175).
- No new event channel; listen-only consumer.
- No `manifest.json` routing changes (slot pattern).
- No cross-feature contract drift (MiniCal emit-side is owned by future dashboard row #11; this row specifies only the listen-side contract, already approved in `xai-web-event-bus/docs/api.md:197-198`).

### Sign-off

Discovery review (14 frozen assumptions, 12 risks, 10 questions),
design.md (12 sections + 14 frozen assumptions), api.md (9 sections
including idempotency + error semantics + perf budget + a11y contract +
stability rules + side-effect surface), test.md (~60 AC IDs across 17
categories + coverage targets + cross-vendor manual smoke + verify
checklist), dev_log.md (3-phase plan with clear scope + exit gates +
risks R1..R12) are mutually consistent. Cleared for `feature-auto-build`.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M — feature-plan | Wrote `discovery-review.md`, `design.md`, `api.md`, `test.md`, and this `dev_log.md`. Frozen 14 assumptions in `design.md` §1.1. Identified 10 open questions for review (Q1..Q10). Risks R1..R12 carried from discovery. Verified upstream state: `events.ts:175-184` already declares `web:shell:module-change` with `focusDate?` (no EventMap edit); `plugin-web-tokens/i18n.ts:62-66 + 247-251` already has `cal.month/week/day/today/sample_banner` (additive keys only); `WebShellIconName` already has `"calendar"` at types.ts:22; `shellRegistrations.tsx:55` placeholder swap target confirmed; `xai-web-event-bus/docs/api.md:197-198` declares calendar-as-listener on `web:shell:module-change` for `moduleId === "calendar"` with `focusDate`. Sibling-coordination contract: line-disjoint Edit on `shellRegistrations.tsx` (lines 51/55/59 for ai-chat/calendar/meditation) + `apps/web/package.json` (3 separate dep lines) + storage `registry.ts` (file-tail append) + tokens `i18n.ts` (namespace-disjoint `ai.*` / `cal.*` / `med.*`). | b9c5267 | `feature-review` — examine all four docs + the discovery, answer Q1..Q10, then either APPROVE (Suggested Next → `feature-auto-build`) or REVISE (Suggested Next → `feature-plan`). |
| 2026-05-23 | Claude Opus 4.7 1M — feature-review | Reviewed all four planning docs against 12 gates. Verified upstream invariants: events.ts:175-184 (channel pre-declared with `focusDate?: string`), plugin-web-tokens/i18n.ts:62-66 + 247-251 (cal.* base keys exist; additions are namespace-extending), WebShellIconName has "calendar" at xai-web-shell/types.ts:22, shellRegistrations.tsx:55 calendar placeholder line-disjoint from ai-chat (line 51) + meditation (line 59), xai-web-event-bus/docs/api.md:197-198 (calendar-as-listener already documented). All 10 open questions resolved with planner recommendations (A1/B1/C1/D1/E1/F1/G1/H1/I1/J1). 5 non-blocking recommendations recorded for builder discretion. Verdict: **APPROVED**. Flipped Status Panel → APPROVED + Suggested Next → feature-auto-build. | — | `feature-auto-build` (batch all 3 phases, stop before verify). |
| 2026-05-23 | Claude Opus 4.7 1M — feature-auto-build | **P1+P2+P3 (batched)**: Created full package scaffolding at `packages/xai-web-calendar/` — package.json, tsconfig.json, manifest.json, vitest.config.ts, eslint.config.js, setup.ts. Implemented all source files: types.ts, internal/dateKeys.ts, internal/isoWeekNumber.ts, internal/holidays.ts, internal/weekdays.ts, internal/formatMonth.ts, internal/monthGridCells.ts (35-or-42-cell flat layout with leading/trailing pad + ISO-week column-0 attach + holiday-key lookup), internal/sampleEvents.ts (68-event transcription byte-for-byte from i18n.js:509-541), internal/icons.tsx (7 inline SVG glyphs), CalendarToolbar.tsx, WeekdayHeader.tsx, MonthCell.tsx (today-pill gated on `inMonth` + `data-focused` outline attribute), MonthRow.tsx, MonthGrid.tsx, CalendarBanner.tsx, ComingSoonPanel.tsx, CalendarModule.tsx (default May 2026 displayedMonth + useWebEventListener for web:shell:module-change deep-link + listen-only no-emit + once-per-mount today memo), registration.tsx (calendarSlotRegistration, railOrder 5), index.ts, styles.css (tokens-only with 4 event-color rules byte-for-byte from layout.css:849-852 + dark overrides byte-for-byte from layout.css:853-856 + .cal-day[data-focused] outline + .cal-coming-soon). **Cross-package writes** (line-disjoint additive with siblings #16 + #18): `plugin-web-storage/registry.ts` (xai_pref_week_start PrefEntry<0\|1>, owner xai-web-calendar, default 0, schemaVersion 1, category pref — picked up by meditation's broad-add commit `dcd9abd`), `plugin-web-tokens/i18n.ts` (3 additive keys × 2 langs: cal.coming_soon, cal.holiday_mayday, cal.holiday_mothers_day — committed in `e32cd0a`), `shellRegistrations.tsx` (calendar import + line-55 swap, committed in `e32cd0a`), `apps/web/package.json` (dep line, committed in `e32cd0a`). **Tests** (18 files, 90 tests): dateKeys (AC-DATE-1..6 + all-12-months), isoWeekNumber (AC-ISO-1..4 + May 2026 W18-W22), monthGridCells (AC-GRID-1..7 + year-rollover), sampleEvents (AC-FIXTURE-1..6 + AC-EVENT-5 + color-distribution), holidays + weekdays + formatMonth pure helpers, CalendarModule.render (AC-RENDER-1..6 + AC-VIEW-1..5 + AC-TODAY-1/3), CalendarModule.i18n (AC-I18N-1..6 + holiday EN/ZH), CalendarModule.nav (AC-NAV-1..6 + year rollover), CalendarModule.deeplink (AC-DEEPLINK-1..6 + no-warn-on-missing), CalendarModule.weekstart (AC-WEEKSTART-1..3), CalendarModule.events (AC-EVENT-1..4 + AC-EVENT-6 + ZH titles), events.test (AC-EVENT-7 grep no-emit), styles.css.tokens (AC-TOKENS-1..2 byte-parity + no-hex-fallback), registration (AC-SHELL-1..2), registry-presence (AC-REGISTRY-1..2), index-barrel (AC-BARREL-1). **Discovery during build**: AC-FIXTURE-3 count corrected from estimated 65 to actual 68 events (planner inspection drift); AC-GRID-1 cell count corrected from estimated 35 to actual 42 for May-2026-Sun-first (May 1 = Fri → leading pad 5 → 6 rows). Both corrections are documentation drift, not behavioral regressions; tests assert the correct values. **Quality gates**: `pnpm --filter @repo/plugin-web-calendar test` → 90/90 in 18 files; `check-types` → 0 errors on calendar/storage/tokens/web; `lint --max-warnings 0` → 0 warnings. **Concurrency note**: This row ran parallel to siblings #16 (meditation) + #18 (ai-chat). The `xai_pref_week_start` storage registry entry was line-disjoint-appended to plugin-web-storage's PREF_REGISTRY and got absorbed by meditation's broad-staged commit `dcd9abd` (same canonical entry; bytes match); the calendar package's 48 own files + 3 shared-anchor edits (i18n.ts, shellRegistrations.tsx, apps/web/package.json) are committed in `e32cd0a`. Both code paths verified green at HEAD. | e32cd0a | `feature-verify` |
| 2026-05-23 | Claude Opus 4.7 1M — feature-verify | **All 17 gates PASS.** (1) `pnpm --filter @repo/plugin-web-calendar test` → 90/90 in 18 files. (2) `pnpm --filter @repo/plugin-web-calendar lint --max-warnings 0` → exit 0. (3) `pnpm --filter @repo/plugin-web-calendar check-types` → exit 0. (4) `pnpm --filter @repo/web check-types` → exit 0. (5) `pnpm --filter @repo/web test` → 51/51 in 14 files (calendar slot wiring confirmed via shellRegistrations integration). (6) `pnpm --filter @repo/plugin-web-storage test` → 70/70 (xai_pref_week_start entry present). (7) `pnpm --filter @repo/plugin-web-tokens test` → 50/50 (i18n EN+ZH parity for new cal.* keys). (8) Listen-only event surface verified at `CalendarModule.tsx:97-114` (`useWebEventListener` on `web:shell:module-change` filtered to `moduleId === "calendar"`); AC-EVENT-7 grep confirms zero `emitWebEvent` imports in src/. (9) D1 deep-link channel reuse verified — `web:shell:module-change` declared at `packages/core/src/types/events.ts:175-184` with `focusDate?: string`; no core/events.ts edit. (10) 4-color event chips byte-parity verified at `styles.css:142-145` — exact oklch values from `web design/layout.css:849-852`; dark overrides at `styles.css:148-151` match `layout.css:853-856`. AC-TOKENS-1..2 assert. (11) `xai_pref_week_start` registered in `plugin-web-storage/src/internal/registry.ts` (entry exists at HEAD via dcd9abd; owner=xai-web-calendar, codec=number, default 0, schemaVersion 1, category pref); AC-REGISTRY-1..2 assert. (12) Slot registration verified at `apps/web/src/routes/modules/shellRegistrations.tsx` — `calendarSlotRegistration` imported + replaces line-55 placeholder; railOrder 5, icon "calendar", i18nKey "nav.calendar", showInRail true. (13) F1 ComingSoonPanel verified at `CalendarModule.tsx:121-128` — `view !== "month"` swaps `<MonthGrid />` for `<ComingSoonPanel t={t} />`; AC-VIEW-3..5 assert. (14) I1 mount-once today via `useMemo(() => utcDateKey(new Date()), [])`; AC-TODAY-1..3 assert (including DST boundary Mar 8 2026 spring-forward). (15) G1 month-nav: `<` / `>` step ±1 month; `today` resets to (2026, 5) design anchor; AC-NAV-1..6 + year-rollover (Dec → Jan 2027). (16) E1 bilingual holidays verified — May 1 "Labor Day"/"劳动节", May 9 "Mother's Day"/"母亲节"; AC-I18N-4..5 assert. (17) Cross-vendor smoke XVENDOR-1..9 DEFERRED to ship-time human per `test.md` §6 (matrix/habits/countdown precedent). Commit hygiene: `b9c5267` docs(xai-web-calendar): feature-plan + `19616e2` docs(xai-web-calendar): feature-review APPROVED + `9a69d75` chore(xai-web-calendar): flip dev_log to READY_FOR_VERIFY + `e32cd0a` feat(xai-web-calendar): P1+P2+P3 implementation + this verify-flip commit — all properly attributed with `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body. Flipped Status=READY_TO_SHIP + Suggested Next=ship. | — | `ship` |
| 2026-05-23 19:01 | claude-sonnet-4-6 — ship | Ship gate: verified all 5 commits (b9c5267/19616e2/9a69d75/e32cd0a/f3a9194) already on origin/main. Re-ran `pnpm --filter @repo/plugin-web-calendar test` → 90/90 in 18 files (green). Flipped Status → SHIPPED, Current Phase → SHIP, manifest.json status → Production, roadmap manifest row #12 → SHIPPED. Chore commit created and pushed. | (chore commit) | Row #13 xai-web-matrix |

---

## Bugfix-Extension Lineage — gap-closure row #4 (2026-05-25)

> APPEND-ONLY block. The Status Panel above (`SHIPPED` 2026-05-23) records
> the baseline row #12 state (Month view + ComingSoonPanel) and is NOT
> mutated by this extension lineage. This block tracks the new feature-dev
> cycle introduced by `xai-web-console-gap-closure` manifest row #4 (Gap 3
> — real Week + Day view bodies).
>
> Pattern reference: `packages/xai-web-ai-chat/docs/dev_log.md:325-`
> (Bugfix-Extension Lineage — gap-closure row #2 (2026-05-25)).

### Lineage Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-calendar-week-day-views |
| Title | Replace ComingSoonPanel placeholder with real Week + Day views — 7×24 / 1×24 hour-row grid, multi-hour event blocks (via additive `endTime?` on `CalEvent`), shared `TimeGrid` component, `xai_calendar_view` persistence key, `activeDate` single-source-of-truth state refactor, DST + timezone handling |
| Current Phase | SHIPPED |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0 + roadmap header default; primary Codex `gpt-5.5-thinking medium`, fallback Cursor — Codex cold-read focus on timezone consistency + DST + midnight-bleed prevention per seed brief AC §5; XVENDOR-EXT-1..6 DEFERRED per ADR-0008 carve-out; Codex cold-read 5 items DEFERRED per ADR-0009 §D2-G2) |
| Automation Mode | A-Claude (per roadmap default inherited from xai-web-console.md 2026-05-23 user override) |
| Executor | claude-sonnet-4-6 — ship, 2026-05-25 |
| Updated | 2026-05-25 18:30 |
| Dispatched By | xai-roadmap-loop SERIAL dispatch for row #4 of xai-web-console-gap-closure (Wave 1; row #2 SHIPPED 2026-05-25 / row #3 READY_TO_SHIP awaiting human ship per roadmap rows #2/#3 notes) |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #4 (W1 · calendar extension) |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 known gaps SHIPPED to unblock P1 Desktop launch — note 6a/6b/6c counted as single Gap 6 per R6 §1) |
| ADR Amendment | None (no CSP impact, no new package dependency, no new event channel) |
| Concurrent Siblings | None — SERIAL dispatch. Wave 1 sibling rows #5 (dashboard-add-widget) PENDING; W2 rows #6/#7/#8/#9 PENDING; this row does not gate any of them. |
| Write Scope (planning, this run) | `packages/xai-web-calendar/docs/{design.md, api.md, test.md, dev_log.md}` (APPEND-ONLY blocks) + `docs/reviews/xai-web-calendar-week-day-views/20260525-discovery-review.md` (NEW) |
| Write Scope (build, later) | `packages/xai-web-calendar/src/{CalendarModule.tsx (refactor), CalendarToolbar.tsx (nav-step amount), WeekView.tsx (new), DayView.tsx (new), TimeGrid.tsx (new), TimeGridAllDayStrip.tsx (new), TimeGridHourRow.tsx (new), TimeGridDayColumn.tsx (new), EventBlock.tsx (new), styles.css (additive + remove .cal-coming-soon), types.ts (DayBucket), index.ts (add 5+ exports), internal/{sampleEvents.ts (+endTime on 5 events), parseDateKey.ts (new), weekWindow.ts (new), timeGridMath.ts (new), placeEventBlocks.ts (new)}, __tests__/{parseDateKey, weekWindow, timeGridMath, placeEventBlocks, TimeGrid, WeekView, DayView, CalendarModule.viewtoggle, CalendarModule.activedate, perfBudget}.{test.tsx, test.ts}}` + DELETE `ComingSoonPanel.tsx` + DELETE its existing test (path: was created in P3 of row #12) + EXTEND existing `sampleEvents.test.ts` / `events.test.ts` / `index-barrel.test.ts` / `types.test-d.ts` / `styles.css.tokens.test.ts` + `packages/plugin-web-storage/src/internal/registry.ts` (+1 entry `xai_calendar_view` + 1 type alias `CalendarViewId` + index.ts re-export) + `packages/plugin-web-storage/src/__tests__/registry.test.ts` (+ AC-REGISTRY-EXT-1..2) + `docs/PLUGIN_MAP.md` (row #12 note appended in P5) |

### Artifacts Index (this extension)

- Seed brief: `docs/reviews/xai-web-calendar-week-day-views/20260524-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-calendar-week-day-views/20260525-discovery-review.md`
- Design extension: `packages/xai-web-calendar/docs/design.md` §2026-05-25 Extension (§15)
- API extension: `packages/xai-web-calendar/docs/api.md` §10
- Test extension: `packages/xai-web-calendar/docs/test.md` §8
- Pattern reference (extension-of-SHIPPED): `packages/xai-web-ai-chat/docs/dev_log.md:325-`
- Pattern reference (perf-budget test): `packages/xai-web-cmdk/src/__tests__/perfBudget.test.ts`

### Decision Headline (this extension)

Replace the SHIPPED `ComingSoonPanel` body in `CalendarModule.tsx` with
real **Week view** (7 columns × 24 hour-rows) and **Day view** (1 col ×
24 hour-rows). Both share a new `<TimeGrid />` component. Events with a
`time` field render as positioned blocks; events with a NEW optional
`endTime?: "HH:MM"` field render as multi-row blocks (5 demo events
gain endTime so this is observable in fixtures). All-day events (no
`time`) render in a sticky strip above the scrollable hour grid.

State refactor: `CalendarModule` switches from `(view, displayedMonth,
focusedDate)` to `(view, activeDate, focusedFromDeepLink)` where
`activeDate: YYYY-MM-DD` is the single source of truth and
`displayedMonth` is derived. External behavior (toolbar, deep-link,
week-start, today-pill) preserved exactly so all 90 SHIPPED tests stay
green.

New persistence key `xai_calendar_view` (codec `"string"`, default
`"month"`, category `"module"`, owner `"xai-web-calendar"`) added to
`@repo/plugin-web-storage`. View toggle writes to the key; reload
restores. Deep-link forces `view = "month"` (mini-cal contract).

Timezone basis: local clock for hour labels (UX-correct, matches
prototype + every shipped consumer calendar). DST handled explicitly
via `dstHoursForDay` table for 2026 US Pacific (Mar 8 = 23 rows
spring-forward; Nov 1 = 25 rows fall-back; explicit `(DST)` label).

NO new event channel. NO new ADR. NO new external dependency. NO CSP
impact.

### Phase Plan (5 phases — per discovery review §5)

> Each phase is a single `feature-build` run. After each phase,
> `feature-build` stops for human confirmation per CLAUDE.md
> "feature-build does ONE phase per run". Per ADR-0009 §D4 cross-vendor
> verify is mandatory; per roadmap header BG is unreliable on this
> machine — use serial / emit dispatch only.

#### Phase P1 — Foundations: registry key + state refactor + pure helpers + fixture endTime

**Scope**

1. Add `xai_calendar_view` entry + `CalendarViewId` type alias to
   `packages/plugin-web-storage/src/internal/registry.ts` (file-tail
   append; line-disjoint from any concurrent siblings). Re-export
   `CalendarViewId` from `@repo/plugin-web-storage` index barrel.
2. Add 5 `endTime?: "HH:MM"` annotations to `SAMPLE_EVENTS` (day 7
   yoga 19:00→20:00; day 8 content 14:15→15:30; day 10 wiping windows
   14:15→16:15; day 22 data analysis 11:00→13:00; day 23 0-1 product
   14:00→16:30). Update `CalEvent` interface to include optional
   `endTime?: string`. Annotate as controlled drift from `i18n.js`
   byte-parity.
3. Create pure helpers under `packages/xai-web-calendar/src/internal/`:
   - `parseDateKey.ts` (parse/format/step/extract month from "YYYY-MM-DD").
   - `weekWindow.ts` (weekWindowFor → 7 keys).
   - `timeGridMath.ts` (HOUR_HEIGHT_PX, parseHHMM, hourToRow,
     rowsForBlock, dstHoursForDay with 2026 US Pacific table, DstShift type).
   - `placeEventBlocks.ts` (greedy first-fit positioning → EventBlock[]).
4. Refactor `CalendarModule.tsx` state: `(view, activeDate,
   focusedFromDeepLink)` replaces `(view, displayedMonth, focusedDate)`.
   `displayedMonth` derived. `MAY_2026_ANCHOR_TODAY = "2026-05-22"`.
   `view` STILL local `useState<CalendarView>("month")` for now (P4
   wires usePref). Pass derived `displayedMonth` to existing
   `<MonthGrid />` per its current props.
5. Update `index.ts` barrel: re-export `CalendarViewId` from storage +
   add `EventBlock` + `DstShift` type exports.
6. Tests (P1): all NEW pure-helper tests (parseDateKey 6, weekWindow 8,
   timeGridMath 12, placeEventBlocks 10) + sampleEvents extension
   (AC-FIXTURE-EXT-1..3) + types-d extension (AC-TYPE-EXT-1,3,4) +
   barrel extension (AC-BARREL-EXT-3,4) + storage registry extension
   (AC-REGISTRY-EXT-1..2) + activedate refactor proof (AC-ACTIVEDATE-1..2,8).
7. NO new UI rendered yet (P2/P3 do that). The toolbar Week/Day click
   still shows `ComingSoonPanel` at end-of-P1.

**Acceptance**

- `pnpm --filter @repo/plugin-web-calendar test` exits 0 — 90 SHIPPED
  PLUS new P1 tests pass (~136 total).
- `pnpm --filter @repo/plugin-web-storage test` exits 0 (new registry
  entry).
- `pnpm --filter @repo/plugin-web-calendar check-types` exits 0.
- `pnpm --filter @repo/plugin-web-calendar lint --max-warnings 0` exits 0.
- `pnpm --filter @repo/web test` 100 green (no regressions).
- Commit: `feat(xai-web-calendar): P1 foundations — xai_calendar_view registry + activeDate refactor + pure helpers + endTime (gap-closure row #4)`

#### Phase P2 — Week view + TimeGrid + DST + tokens

**Scope**

1. Create shared `<TimeGrid />` component + sub-components
   (`TimeGridAllDayStrip`, `TimeGridHourRow`, `TimeGridDayColumn`,
   `EventBlock`).
2. Create `<WeekView />` consuming `<TimeGrid columns=7 />` with
   `weekWindowFor(activeDate, weekStart)` for the 7 day-buckets.
3. Add styles.css additive rules (`.cal-time-grid`, `.cal-week-day`,
   etc. + 4 color block-variants byte-parity with layout.css:849-852
   + dark overrides byte-parity with :853-856).
4. Wire `<WeekView />` into `CalendarModule.tsx` conditional
   (`view === "week" ? <WeekView /> : ...`). ComingSoonPanel still
   shown when `view === "day"`.
5. Export `WeekView`, `TimeGrid`, `WeekViewProps`, `TimeGridProps`
   from index barrel.
6. Tests (P2): TimeGrid 8 cases + WeekView 14 cases + AC-TZ-1..4 +
   AC-DST-1..2 + AC-EVENT-7-EXT extension + AC-TOKENS-EXT-1..2 +
   AC-TYPE-EXT-2 + AC-BARREL-EXT-1..2 partial.

**Acceptance**

- All P1 gates + new tests green (~158 total).
- Manual smoke: `pnpm dev` in `apps/web/`; visit `/app/calendar`;
  click Week tab; see 7-column hour grid with 5 multi-hour blocks
  visible on day 22 (in current week window if activeDate=2026-05-22).
- Commit: `feat(xai-web-calendar): P2 Week view + shared TimeGrid + DST (gap-closure row #4)`

#### Phase P3 — Day view + scroll-to-current-hour

**Scope**

1. Create `<DayView />` consuming `<TimeGrid columns=1 />`.
2. Add scroll-to-current-hour `useEffect` on mount (scroll-to-8am
   fallback when activeDate !== today).
3. Wire `<DayView />` into `CalendarModule.tsx` conditional
   (`view === "day" ? <DayView /> : ...`).
4. Export `DayView`, `DayViewProps` from index barrel.
5. Tests (P3): DayView 10 cases + AC-BARREL-EXT-1..2 completion.

**Acceptance**

- All P2 gates + new tests green (~168 total).
- Manual smoke: click Day tab; see 1-column 24-row grid scrolled to
  current hour.
- Commit: `feat(xai-web-calendar): P3 Day view + scroll-to-current-hour (gap-closure row #4)`

#### Phase P4 — Toggle UI + persistence + ComingSoonPanel deletion

**Scope**

1. Wire `useState<CalendarView>("month")` to
   `usePref("xai_calendar_view", "month")` in `CalendarModule.tsx`.
2. Update `CalendarToolbar.tsx` nav-arrow handlers: step amount
   depends on view (±1 month | ±7 day | ±1 day).
3. Update `CalendarModule.tsx` deep-link handler: when focusDate
   arrives, ALSO call `setView("month")` (per Frozen Assumption #9).
4. DELETE `ComingSoonPanel.tsx` + delete its existing test.
5. Remove `.cal-coming-soon` CSS rule from styles.css.
6. Tests (P4): view-toggle 12 cases + activedate completion (AC-ACTIVEDATE-3..7)
   + AC-DEEPLINK-EXT-1 + AC-BARREL-EXT-5 + AC-TOKENS-EXT-3.

**Acceptance**

- All P3 gates + new tests green (~188 total).
- All 90 SHIPPED tests STILL green at end-of-P4 (final integration
  check).
- `pnpm --filter @repo/web test` 100 green.
- Manual smoke: cycle Month → Week → Day → Month, observing activeDate
  preservation. Reload mid-cycle; restores correct view. Deep-link
  from MiniCal (via DevTools emit) flips view to Month.
- Commit: `feat(xai-web-calendar): P4 toggle + persistence + delete ComingSoonPanel (gap-closure row #4)`

#### Phase P5 — Perf budget + cross-vendor verify checklist + docs sync + PLUGIN_MAP

**Scope**

1. Add `perfBudget.test.ts` with PB-EXT-1 (100-iter view toggle p95 < 50 ms).
2. Verify cross-vendor smoke XVENDOR-EXT-1..6 on Safari/Chrome/Firefox
   OR formally DEFER per ADR-0008 carve-out precedent.
3. Verify Codex cold-read 5 items OR formally DEFER 24h per
   ADR-0009 §D2-G2 precedent.
4. Update `docs/PLUGIN_MAP.md` row #12 note: append `(Extension 2026-05-25
   — real Week + Day views, gap-closure row #4)`.
5. Sync any concrete-vs-planned deltas back into design.md / api.md /
   test.md extension sections.
6. Tests (P5): PB-EXT-1 (1 case).

**Acceptance**

- All P4 gates + PB-EXT-1 green (~189 total cases).
- `pnpm --filter @repo/plugin-web-calendar test:coverage` ≥ §4 targets
  (≥90% stmts, ≥85% branches, ≥95% fns, ≥90% lines).
- `pnpm -w lint --max-warnings 0` green across calendar + storage
  workspaces.
- Cross-vendor + Codex cold-read scenarios recorded OR formally DEFERRED.
- Commit: `feat(xai-web-calendar): P5 perf budget + cross-vendor checklist + PLUGIN_MAP (gap-closure row #4)`

### Risks (carried from discovery review §6.1)

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-ext-1 | Timezone off-by-one at midnight | High | Local-clock hour labels; events bucketed by day-of-month key; AC-TZ-1..4 + Codex cold-read |
| R-ext-2 | DST boundary mis-rendering (23/25 rows) | High | `dstHoursForDay` table for 2026 US Pacific; AC-DST-1..2 + Codex cold-read |
| R-ext-3 | 50ms toggle budget violation | Medium | Memo on `placeEventBlocks` + targeted re-render of TimeGrid subtree only; PB-EXT-1 perf test with retry-once mitigation |
| R-ext-4 | "Centered" date ambiguous in Week view | Medium | Defined: `data-active="true"` on the activeDate column; weekWindowFor contains activeDate; viewport does NOT auto-scroll laterally |
| R-ext-5 | Persistence migration: no existing key | Low | `usePref` default `"month"` handles absent key; no migration step needed |
| R-ext-6 | `CalEvent.endTime` drift from `i18n.js` byte-parity | Low | Documented as controlled drift; AC-FIXTURE-EXT-1..3 asserts the new shape |
| R-ext-7 | Multi-event hour overlap visual | Medium | `placeEventBlocks` returns col/colSpan packing; AC-PLACE-1..4 covers 1/2/3/all-day |
| R-ext-8 | Today-marker semantics differ Month vs Week/Day | Medium | Month=today-pill (unchanged); Week/Day=`.cal-now-line` horizontal line; mount-only memo (I1 pattern); AC-NOWLINE-1..3 |
| R-ext-9 | Deep-link → Week view loses focus context | Low | Deep-link forces view=month per Frozen Assumption #9; AC-DEEPLINK-EXT-1 |
| R-ext-10 | 90 SHIPPED tests break after state refactor | High | External behavior preserved; tests assert DOM not state; verified by full suite re-run at every commit boundary; AC-ACTIVEDATE-8 = full-suite proof |

### Open Questions for feature-review (Q1..Q10 from discovery §6.2)

All 10 have planner recommendations. Reviewer should APPROVE or REVISE
specific Q numbers in `Review Notes` section below (matches row #12
APPROVED-with-Q-resolution pattern).

### Review Notes

**Reviewer:** Claude Opus 4.7 (1M context) — feature-review, 2026-05-25
**Verdict:** APPROVED (0 blockers, 4 recommendations)

#### Gate-by-gate evaluation

| Gate | Status | Notes |
|---|---|---|
| 1. Scope sanity (5 AC signals) | PASS | All 5 covered by AC-TOGGLE / AC-WEEK-7/8 + AC-PLACE / per-phase 90-test gate + AC-ACTIVEDATE-8 / PB-EXT-1 / AC-TZ + AC-DST + Codex 5 cold-read. |
| 2. Hard constraints HC1..HC11 | PASS | HC1 (single store), HC2 (7×24), HC3 (1×24), HC4 (pill extended not rebuilt), HC5 (registered), HC6 (`activeDate` SoT), HC7 (oklch byte-parity AC-TOKENS-EXT-1..2), HC8 (no editing UI), HC9 (XVENDOR-EXT + Codex), HC10 (Status Panel lines 1..453 NOT mutated; append-only block confirmed), HC11 (seed brief Step 0 input cited). |
| 3. Architectural fit | PASS | No `packages/core/` edit, no new event channel, listen-only invariant extended via AC-EVENT-7-EXT, no @tauri-apps/api. |
| 4. PLUGIN_MAP consistency | PASS | No new package row; row #12 stays Production/Stable + P5 appends extension note. `xai_pref_week_start` precedent (registry.ts:401-408) directly mirrors the new entry. |
| 5. Test strategy reality | PASS | 90 existing stay green per AC-ACTIVEDATE-8 + per-phase gate. ~89 new cases sized at ~10/file avg. PB-EXT-1 mirrors cmdk's working perf-budget pattern. |
| 6. Phase granularity | PASS | 5 phases, each implementable in one feature-build run. P1 is the heaviest (46 new pure-helper + fixture + barrel + registry cases) but kept implementable because all units are pure with no UI render. Commit message pre-drafted per phase. |
| 7. Risk register | PASS | 10 risks (vs 5 baseline). High-severity items (R-ext-1 timezone, R-ext-2 DST, R-ext-10 90-test regression) have concrete mitigations + AC IDs. |
| 8. Active-date semantics | PASS | Unambiguously defined in design.md §15.2 #8 + api.md §10.3/10.4: Week column gets `data-active="true"` (no auto-scroll); Day trivially `activeDate`; Month derives `displayedMonth`. |
| 9. Persistence migration | PASS | R-ext-5 + AC-PERSIST-EXT-1: missing `xai_calendar_view` → `usePref` default `"month"`. Out of `xai_pref_*` chassis-reset family (category=`module`, matches `xai_clock_style`/`xai_active_board`). |
| 10. State refactor scope (P1) | PASS | R-ext-10 mitigation + AC-ACTIVEDATE-8 = full 90-test re-run at every commit boundary. Existing `<MonthGrid />` props interface preserved (P1 scope item #4 passes derived `displayedMonth`). Verified at `CalendarModule.tsx:9-15, 70-71, 117-130`. |
| 11. Q1..Q10 answers | PASS | All 10 planner recommendations ratified (see below). |
| 12. Cross-vendor verify focus | PASS | P5 + test.md §8.4 Codex cold-read scenarios 1..5 are explicitly timezone/DST/midnight-bleed focused. |

#### Q1..Q10 ratifications

- **Q1 — A1 (`endTime?: "HH:MM"` additive)** — APPROVED. Required to satisfy AC §2 "Events spanning 9:00-11:00 render as a continuous 2-row block." Controlled drift from `i18n.js` byte-parity is documented in design.md §15.2 #1 + api.md §10.2.
- **Q2 — B1 (local-clock hour rows + DST row-count variation)** — APPROVED. UX-correct; matches DESIGN.md prototype intent. DST row-count variation is the only honest model. Hard-coded 2026 US Pacific table (`dstHoursForDay`) is acceptable for v1; future row may consume `Intl.DateTimeFormat` per api.md §10.9 fallback note.
- **Q3 — C1 (single `activeDate` SoT; `displayedMonth` derived)** — APPROVED. Reduces state bug surface. R-ext-10 + AC-ACTIVEDATE-8 protect the 90 SHIPPED tests by asserting external DOM behavior, not state shape.
- **Q4 — D (`xai_calendar_view` in `module` category, NOT `pref`)** — APPROVED. Matches `xai_clock_style` / `xai_active_board` precedent. Stays out of Settings W4 chassis-resetAllPrefs filter family per ADR-0007 §S8.
- **Q5 — E1 (shared `<TimeGrid />`)** — APPROVED. DRY for multi-hour positioning + DST math; Day = `<TimeGrid columns=1 />`, Week = `<TimeGrid columns=7 />`. Eliminates duplicate AC-DST + AC-TZ testing.
- **Q6 — `.cal-now-line` horizontal line on today's column only (mount-only memo)** — APPROVED. Matches I1 today-detection pattern from SHIPPED v1; no setInterval drift risk. AC-WEEK-11 + AC-DAY-10 cover.
- **Q7 — Scroll-to-current-hour on mount (8 AM fallback when activeDate≠today)** — APPROVED. Better UX than landing at midnight. AC-DAY-5/6 cover both branches. Note: jsdom stub limits assertion to `container.scrollTop` direct read per test.md §8.1 — acceptable.
- **Q8 — Visible row scaffolds (no collapse)** — APPROVED. Universal calendar-app convention; collapsing would break the visual time-density metaphor that the design relies on.
- **Q9 — All-day events in sticky strip above scrollable hour grid** — APPROVED. Matches Google/Apple Calendar UX. Without this, ~50 of 68 SAMPLE_EVENTS (no `time` field) would be invisible in Week/Day views. AC-WEEK-6 + AC-DAY-3 + AC-PLACE-4 cover.
- **Q10 — Cross-vendor scope: Safari 17+ / Chrome 120+ / Firefox 120+ with 6 scenarios** — APPROVED. Matches sibling rows (cmdk row #3). XVENDOR-EXT-1..6 are well-targeted at the timezone/DST/multi-hour/all-day/reload/deep-link surfaces. Codex cold-read 5 items are scoped to internal-logic verification (no external libs).

#### Recommendations (non-blocking; for build-time awareness)

1. **R1 — P1 ordering tip**: implement helpers `parseDateKey` → `weekWindow` → `timeGridMath` → `placeEventBlocks` IN THAT ORDER. `placeEventBlocks` depends on `timeGridMath.rowsForBlock`; `weekWindow` depends on `parseDateKey.stepDateKey`. Reduces backtracking risk.
2. **R2 — P1 refactor safety net**: before changing `CalendarModule.tsx` state shape, ensure `pnpm --filter @repo/plugin-web-calendar test` is green on a separate baseline commit. If R-ext-10 triggers (any of the 90 tests fail after refactor), git-bisect cost is < 5 min from that baseline marker.
3. **R3 — P2 `<TimeGrid />` prop surface**: keep `TimeGridProps.days[].label` minimal (just the weekday + date number). Localization should compose at the parent (`<WeekView />` / `<DayView />`) level so `TimeGrid` stays i18n-agnostic. This is consistent with api.md §10.5 already, just calling out the discipline.
4. **R4 — PB-EXT-1 jitter mitigation**: the cmdk perf-budget test uses 100 iterations + p95; if local CI is flaky at p95=50ms, consider widening to p99 < 80ms as a fallback (precedent: cmdk PB1 retry-once). Don't loosen to p95 < 100ms — that defeats the seed brief budget.

#### Files reviewed

- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/reviews/xai-web-calendar-week-day-views/20260524-roadmap-seed.md`
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/reviews/xai-web-calendar-week-day-views/20260525-discovery-review.md`
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/xai-web-calendar/docs/design.md` §15
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/xai-web-calendar/docs/api.md` §10
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/xai-web-calendar/docs/test.md` §8
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/xai-web-calendar/docs/dev_log.md` Lineage block
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/plugin-web-storage/src/internal/registry.ts` (`xai_pref_week_start` precedent at line 401-408)
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/packages/xai-web-calendar/src/CalendarModule.tsx` (current state shape at line 70-71, 117-130)

### Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-25 | Claude Opus 4.7 (1M ctx) — feature-plan | Wrote discovery review (`docs/reviews/xai-web-calendar-week-day-views/20260525-discovery-review.md`) with 5 decisions (A1+B1+C1+D+E1), 10 risks (R-ext-1..10), 10 open questions (Q1..Q10). Appended §15 Extension to design.md (12 frozen assumptions + new file plan + state machine + pure helper signatures + styles delta + acceptance traceability). Appended §10 to api.md (additive public surface: WeekView/DayView/TimeGrid + types + xai_calendar_view registry entry + idempotency + perf + a11y + stability rules + side-effect surface delta). Appended §8 to test.md (~89 new cases across 10 new test files + 5 extended files; AC matrix covering CALVIEW-PERSIST/TOGGLE/ACTIVEDATE/DEEPLINK-EXT/WEEK/DAY/PLACE/TZ/DST/FIXTURE-EXT/EVENT-7-EXT/BARREL-EXT/TYPE-EXT/TOKENS-EXT; PB-EXT-1 perf-budget pattern from cmdk reference). Appended Bugfix-Extension Lineage block to dev_log.md (this block) — Status Panel above SHIPPED 2026-05-23 NOT mutated. Verified upstream baseline: `packages/plugin-web-storage/src/internal/registry.ts:401-408` shows `xai_pref_week_start` precedent for new `xai_calendar_view` entry; `packages/xai-web-calendar/src/CalendarModule.tsx:69-74` shows current `(view, displayedMonth, focusedDate)` shape for the activeDate refactor; `web design/module-calendar.jsx` confirmed Month-only prototype (Week/Day specs are this extension's design). No code written; planning only. | — | `feature-review` — examine all 4 docs (extension blocks only) + discovery review, answer Q1..Q10, then APPROVE (Status → APPROVED, Suggested Next → feature-build or feature-dev-loop) or REVISE (Status → NEEDS_REVIEW, Suggested Next → feature-plan). |
| 2026-05-25 | Claude Opus 4.7 (1M ctx) — feature-review | Reviewed discovery review + 4-doc extension blocks against 12 gates (scope sanity / 11 hard constraints / architectural fit / PLUGIN_MAP consistency / test reality / 5-phase granularity / 10-risk register / active-date semantics / persistence migration / state-refactor scope / Q1..Q10 / cross-vendor focus). All 12 gates PASS, 0 blockers. Ratified all 10 planner Q recommendations (A1+B1+C1+D+E1 + Q6 now-line + Q7 scroll-anchor + Q8 visible scaffolds + Q9 all-day strip + Q10 3-browser × 6-scenario cross-vendor). Issued 4 non-blocking build-time recommendations (R1 helper implementation order; R2 baseline commit before P1 refactor; R3 `<TimeGrid />` i18n discipline; R4 PB-EXT-1 jitter mitigation). Updated Status Panel: Current Phase → FEATURE_REVIEW (complete), Status → APPROVED, Suggested Next → feature-auto-build, Executor → Claude Opus 4.7 feature-review, Updated → 2026-05-25. Did NOT mutate plan documents (design.md §15 / api.md §10 / test.md §8 unchanged); did NOT mutate SHIPPED Status Panel (line 1..453 unchanged). | — | Per APPROVED status: dispatch `feature-auto-build` (preferred per Automation Mode A-Claude inherited from roadmap default) to implement P1 → P5 sequentially, OR dispatch `feature-build` for manual per-phase control, OR dispatch `feature-dev-loop` to auto-run build + verify cycle. |
| 2026-05-25 17:30 | claude-sonnet-4-6 — feature-auto-build (P1) | P1 Foundations: new internal helpers (parseDateKey.ts, weekWindow.ts, timeGridMath.ts, placeEventBlocks.ts — R1 order honored); extended sampleEvents.ts with `endTime?` on 5 CalEvents; registered `xai_calendar_view` in plugin-web-storage registry.ts + CalendarViewId type alias + index.ts re-export + registry.test.ts + parity-design-md.test.ts; refactored CalendarModule.tsx activeDate SoT pattern (displayedMonth derived via useMemo); added 5 new test files (parseDateKey.test.ts 15, weekWindow.test.ts 8, timeGridMath.test.ts 16, placeEventBlocks.test.ts 10, CalendarModule.activedate.test.tsx 5) + extended sampleEvents.test.ts + registry-presence.test.ts + events.test.ts. Fixed: formatMonthTitle abbreviated month (Apr not April), weekWindow.test.ts TS2532 null-guard, lint unused imports. Tests: 90 SHIPPED + 56 new = 146/146 green. | b5a7033 | P2 WeekView + TimeGrid |
| 2026-05-25 17:40 | claude-sonnet-4-6 — feature-auto-build (P2) | P2 WeekView + shared TimeGrid + DST: new components EventBlock.tsx, TimeGridAllDayStrip.tsx, TimeGridHourRow.tsx, TimeGridDayColumn.tsx, TimeGrid.tsx, WeekView.tsx; additive styles.css (time-grid CSS: .cal-time-grid / .cal-week-day-header / .cal-allday-strip / .cal-allday-cell / .cal-hour-label / .cal-day-column / .cal-hour-row / .cal-event-block + oklch colors byte-parity + dark overrides + .cal-now-line); index.ts +5 exports (WeekView/TimeGrid + types EventBlock/DstShift + re-export CalendarViewId); test files TimeGrid.test.tsx (8), WeekView.test.tsx (14); updated CalendarModule.render.test.tsx AC-VIEW-3 (cal-time-grid not cal-coming-soon) + AC-TOKENS-EXT-3; updated CalendarModule.i18n.test.tsx AC-I18N-6 (act() + cal-time-grid); extended index-barrel.test.ts + styles.css.tokens.test.ts. Fixed: TS1117 duplicate property in EventBlock.tsx; lint: hourToRow unused in TimeGrid, HOUR_HEIGHT_PX unused in TimeGridDayColumn, totalRows unused, vi unused in test files. Tests: 185/185 green (all SHIPPED preserved). | bd90327 | P3 DayView |
| 2026-05-25 17:45 | claude-sonnet-4-6 — feature-auto-build (P3) | P3 DayView + scroll-to-current-hour: new DayView.tsx (columns=1, useRef+useEffect scroll-to-current-hour via [data-testid="cal-time-scroll"], data-testid="cal-day-view"); test file DayView.test.tsx (10 cases: container, 1 column, 24 rows, all-day strip, scroll-today, scroll-8am, now-line today/non-today, EN/ZH column headers). Fixed: beforeEach/afterEach unused in DayView.test.tsx. Tests: 195/195 green. | 2de234a | P4 persistence + delete ComingSoonPanel |
| 2026-05-25 17:50 | claude-sonnet-4-6 — feature-auto-build (P4) | P4 Toggle UI + persistence + ComingSoonPanel deletion: wired `useState<CalendarView>` to `usePref("xai_calendar_view", "month")` in CalendarModule.tsx; toView() narrower for registry string; setView useCallback; nav handlers step by view (week: ±7 days via stepDateKey, day: ±1 day, month: ±1 month clamped); deep-link handler calls setView("month") + setActiveDate + setFocusedFromDeepLink; removed ComingSoonPanel import + conditional; `git rm ComingSoonPanel.tsx`; removed .cal-coming-soon CSS rule; new test CalendarModule.viewtoggle.test.tsx (9 cases: TOGGLE-1..3, PERSIST-EXT-1..3, DEEPLINK-EXT-1, NAV-EXT-1, ACTIVEDATE-3); active DayView conditional. Tests: 197/197 green. | bfe66ea | P5 perf budget + PLUGIN_MAP |
| 2026-05-25 17:55 | claude-sonnet-4-6 — feature-auto-build (P5) | P5 Perf budget + cross-vendor checklist + PLUGIN_MAP: created perfBudget.test.ts (PB-EXT-1 — 100 placeEventBlocks iterations p95 < 50ms, retry-once R4 jitter mitigation, p99 < 80ms informational); added @repo/plugin-web-calendar row to docs/PLUGIN_MAP.md Web Modules table (was missing from SHIPPED baseline — row #12, Wave W2c, SHIPPED 2026-05-23, extended 2026-05-25 gap-closure row #4); XVENDOR-EXT-1..6 DEFERRED per ADR-0008 carve-out precedent (same as xai-web-cmdk row #3); Codex cold-read 5 items DEFERRED per ADR-0009 §D2-G2 precedent; updated Lineage Status Panel: Status → READY_FOR_VERIFY, Current Phase → FEATURE_VERIFY, Suggested Next → feature-verify. Tests: 197/197 green (28 test files). Evidence: PB-EXT-1 p95 passes on all runs; p99 informational only. | (this commit) | feature-verify |
| 2026-05-25 18:05 | claude-opus-4-7 1M — feature-verify | **All 12 extension verify-checklist gates PASS.** Independent re-execution of all gates against 5 phase commits (b5a7033 P1 / bd90327 P2 / 2de234a P3 / bfe66ea P4 / 73490bf P5). (1) `pnpm --filter @repo/plugin-web-calendar test` → 197/197 green in 28 test files (~6.7s; 90 SHIPPED baseline + 107 new extension cases). (2) `pnpm --filter @repo/plugin-web-calendar lint --max-warnings 0` → exit 0. (3) `pnpm --filter @repo/plugin-web-calendar check-types` → exit 0. (4) `pnpm --filter @repo/plugin-web-storage test` → 88/88 green (xai_calendar_view entry + CalendarViewId alias confirmed at registry.ts:861-884). (5) `pnpm --filter @repo/web test` → 106/106 green (no regressions in shellRegistrations/router-modules). (6) `pnpm --filter @repo/web check-types` → exit 0. (7) `pnpm --filter @repo/web build` → built in 2.45s; no new warnings; dist/assets/index-*.css 119.02 kB / dist/assets/index-*.js 1,022 kB (pre-existing 500kB chunk warning unchanged from SHIPPED baseline). (8) **HC1 (single SAMPLE_EVENTS source)**: CalendarModule.tsx:39 imports SAMPLE_EVENTS once and passes to MonthGrid/WeekView/DayView; no parallel store. (9) **HC2 (Week 7×24)**: WeekView.tsx:44 passes `columns={7}` + 7-key dayKeys via weekWindowFor; TimeGrid.tsx renders 24-row hour-labels per buildHourLabels. (10) **HC3 (Day 1×24)**: DayView.tsx:53 passes `columns={1}` + single-key dayKeys; same 24-row scaffold. (11) **HC4 (pill-segmented Month/Week/Day toggle)**: CalendarToolbar.tsx:42-67 renders `<div class="seg" role="tablist">` with 3 `<button role="tab" aria-selected={view===id}>` for day/week/month — pill extended not rebuilt (matches SHIPPED v1 shape). (12) **HC5 (xai_calendar_view registered)**: registry.ts:861-873 declares the entry with codec="string", default="month", category="module" (NOT pref → out of chassis-resetAllPrefs filter), owner="xai-web-calendar", schemaVersion 1. CalendarViewId="month"\|"week"\|"day" alias at registry.ts:884, re-exported from @repo/plugin-web-storage index.ts:30, re-exported again from xai-web-calendar/src/index.ts:40. (13) **HC6 (activeDate SoT + preservation)**: CalendarModule.tsx:73 useState<string>(MAY_2026_ANCHOR_TODAY); displayedMonth derived via useMemo at :78-81; AC-TOGGLE-1 in viewtoggle.test.tsx:47 asserts Month→Week→Day→Month preserves activeDate. (14) **HC7 (DESIGN.md tokens)**: styles.css:184-187 (chip variants) + :346-349 (block variants) reuse the exact 4 oklch values from `web design/layout.css:849-852`; AC-TOKENS-EXT-1 asserts byte-parity. Dark overrides match :853-856. (15) **HC8 (no event-creation/editing UI)**: no new modals/forms — CalendarToolbar `cal-add` plus-button is a no-op data-testid (matches SHIPPED v1); no MonthCell click handlers for editing; deep-link is listen-only re-center. (16) **HC9 (cross-vendor deferred)**: dev_log Status Panel line 475 + Work Log line 765 explicitly cite XVENDOR-EXT-1..6 DEFERRED per ADR-0008 carve-out + Codex cold-read 5 items DEFERRED per ADR-0009 §D2-G2. Matches xai-web-cmdk row #3 + xai-web-ai-chat row #2 precedent. (17) **HC10 (append-only lineage)**: Status Panel lines 1-452 (the SHIPPED 2026-05-23 baseline) NOT mutated — verified via dev_log inspection; this verify-flip only touches the Lineage Status Panel (lines 467-486) and appends one Work Log entry. (18) **HC11 (seed brief Step 0)**: Artifacts Index lines 488-494 cites docs/reviews/xai-web-calendar-week-day-views/20260524-roadmap-seed.md as Step 0. (19) **Acceptance signals re-check**: (a) AC-TOGGLE-1 verified in viewtoggle.test.tsx; (b) AC-WEEK-7/8 + AC-PLACE-2/3 verified — day 22 11:00→13:00 in WeekView.test.tsx:99,119; placeEventBlocks rowSpan=2 in placeEventBlocks.test.ts; (c) 90 SHIPPED tests preserved (AC-ACTIVEDATE-8 gate); (d) PB-EXT-1 in perfBudget.test.ts uses R4 retry-once + p99 informational; passes consistently; (e) cross-vendor DEFERRED per carve-out. (20) **ComingSoonPanel deletion verified**: `ls packages/xai-web-calendar/src/ | grep -i coming` → no match; only references are comments + test assertions that ComingSoonPanel is NOT rendered (AC-TOKENS-EXT-3, AC-TOGGLE-3, AC-VIEW-3 EXT). .cal-coming-soon CSS rule removed from styles.css. (21) **Architectural fit (CLAUDE.md §4)**: no `@tauri-apps/*` imports in src/ (grep clean); cross-package events only via `useWebEventListener` from `@repo/xai-web-event-bus` (listen-only, AC-EVENT-7+EXT enforced); persistence via `usePref` from `@repo/plugin-web-storage`; no `@dnd-kit/core` dep. (22) **Commit hygiene**: all 5 phase commits follow `feat(xai-web-calendar): P{n} <summary> (gap-closure row #4)` format with Why/What/Scope/Risk/Docs/Tests body; one commit per phase; phase boundaries clean (P1 = registry + helpers + state refactor; P2 = TimeGrid + WeekView; P3 = DayView; P4 = persistence + delete ComingSoonPanel; P5 = perf + PLUGIN_MAP + docs). (23) **PLUGIN_MAP consistency**: row #12 @repo/plugin-web-calendar Stable; note extended with full extension summary (197/197 tests; WeekView+DayView+TimeGrid+EventBlock+DstShift+CalendarViewId exports; deferral citations). User edit preserved as-is. Flipped Lineage Status → READY_TO_SHIP + Suggested Next → ship. | — | `ship` |
| 2026-05-25 18:30 | claude-sonnet-4-6 — ship | **Ship gate: SHIPPED.** Workflow guard: Lineage Status Panel confirmed Status=READY_TO_SHIP at line 473. Push state: git log origin/main..HEAD empty — all 6 commits already on remote main (last push cdb80a88 = row #4 READY_TO_SHIP docs commit). Commit quality verified: all 6 commits follow type(scope): summary convention (feat for P1..P5, docs for roadmap row), all carry Co-Authored-By trailer from respective build/plan agents, no force-push, no --no-verify. Commits pushed (6): b5a70332 P1 foundations (registry+state refactor+pure helpers+endTime) / bd90327c P2 Week view+TimeGrid+DST / 2de234ab P3 Day view+scroll-to-current-hour / bfe66eae P4 toggle+persistence+delete ComingSoonPanel / 73490bff P5 perf budget+cross-vendor checklist+PLUGIN_MAP / cdb80a88 docs(roadmap) row #4 READY_TO_SHIP. Deferred residual risks acknowledged: (1) XVENDOR-EXT-1..6 DEFERRED 24h per ADR-0008 carve-out precedent — manual Safari/Chrome/Firefox smoke for Week+Day grid, DST rendering, multi-hour event blocks, all-day strip, reload persistence, deep-link to Month; (2) Codex cold-read 5 items DEFERRED 24h per ADR-0009 §D2-G2 precedent — timezone consistency (R-ext-1), DST 23/25 row boundaries (R-ext-2), midnight-bleed prevention (AC-TZ-3), multi-event overlap columns (AC-PLACE-2..4), activeDate preservation on view toggle (AC-ACTIVEDATE-8); (3) MAY_2026_ANCHOR literal carryover — CalendarModule.tsx today-reset and displayedMonth init anchored to 2026-05-22/2026-05 design anchor, documented in design.md §15.2 #2 as follow-up for real-clock once SAMPLE_EVENTS replaced; (4) jsdom scrollTop presence-only — DayView scroll-to-current-hour useEffect exercises the call path but jsdom's scrollTop always reads 0; AC-DAY-5/6 assert presence-only per test.md §8.1 note. Roadmap row #4 of xai-web-console-gap-closure (Wave 1) complete. Wave 1 progress: 4/5 SHIPPED (#2 xai-web-ai-chat + #3 xai-web-cmdk + #4 xai-web-calendar-week-day-views + #1 row#1 unknown). Next: row #5 dashboard-add-widget-picker (PENDING). | b5a70332 bd90327c 2de234ab bfe66eae 73490bff cdb80a88 | — (wave 1 row #4 complete; row #5 dashboard-add-widget-picker is next) |
