# Test Strategy — xai-web-statistics

## §1 Strategy at a glance

| Layer | Tool | Scope | Files |
|---|---|---|---|
| **Unit (pure)** | vitest (jsdom not needed but enabled package-wide) | predicates, trend, rangeWindow, aggregators, heatmapCells, insightCopy | `src/__tests__/*.test.ts` |
| **Component** | vitest + jsdom + @testing-library/react | KpiCard, LineChart, BarChart, HourBar, RingChart, HabitRank, Heatmap, InsightCallout, StatisticsModule, registration | `src/__tests__/*.test.tsx` |
| **Barrel** | vitest | every public export resolves to the expected runtime value | `src/__tests__/index-barrel.test.ts` |
| **Cross-vendor smoke** | manual (queued for ship-time on Codex/Cursor per W3 manifest header) | render in Chrome 120 / Safari 17 / Firefox 121 and confirm heatmap + ring chart parity | `docs/reviews/xai-web-statistics/<date>-cross-vendor-smoke.md` |

Coverage target: 90%+ statement coverage on `src/internal/*` (the pure layer), 80%+ on `src/*.tsx` (components). Branch coverage explicitly verified for every edge case in §3.

Lint MUST pass with `--max-warnings 0`. `@typescript-eslint/no-explicit-any` is `error`. No `as any` anywhere.

## §2 Mock strategy

### §2.1 Persisted state — `usePref`

`StatisticsModule.test.tsx` exercises the component WITHOUT mocking `usePref`. Instead it seeds `localStorage` directly with the canonical JSON shapes for `xai_pomodoro_sessions`, `xai_habits_state`, and `xai_pref_week_start`, then renders. `usePref` reads from real `localStorage` and works in jsdom. Storage-event-driven re-renders are exercised via `act(() => { setPref(...) })`.

Rationale: sibling W2 packages (ai-chat, meditation, calendar) all use the same direct-seed pattern. No need for a stub.

### §2.2 Clock

All aggregator functions take a `now: Date` parameter. Tests pass an explicit `new Date("2026-05-23T10:30:00Z")` so windows are deterministic. The component reads `useMemo(() => new Date(), [])` at first render. Component tests wrap render in `vi.setSystemTime(...)` + use `vi.useFakeTimers({ shouldAdvanceTime: false })` for date determinism. Cleanup via `vi.useRealTimers()` in `afterEach`.

### §2.3 Random / non-determinism

There is none. Heatmap is fully derived; no `Math.random`. The lint rule `no-restricted-syntax` for `Math.random` would catch a regression — recommended but optional.

### §2.4 SSR / window-less

Aggregators are pure and have no `window` access. Components only run on the client (jsdom is sufficient). No SSR target in this row.

### §2.5 Shell context

`registration.test.tsx` wraps `StatisticsModuleRoute` in a minimal `WebShellProvider` stub from `@repo/xai-web-shell/__fixtures__` (sibling W2 standard).

## §3 Test inventory by file

### Pure layer (`src/internal/*.test.ts`)

#### `isPomodoroSession.test.ts` — V1..V6

- V1: valid `{ mode: 'focus', durationMs: 1500000, finishedAt: '2026-05-23T10:00:00Z' }` returns `true`.
- V2: missing `mode` returns `false`.
- V3: `mode: 'unknown'` returns `false`.
- V4: `durationMs` as string returns `false`.
- V5: `finishedAt` missing returns `false`.
- V6: `null`/`undefined`/`42` all return `false`.

#### `isHabitsStateRecord.test.ts` — V7..V12

- V7: full canonical shape returns `true`.
- V8: missing `habits` returns `false`.
- V9: `habits` not an array returns `false`.
- V10: `checkIns` not an object returns `false`.
- V11: extra unknown fields tolerated (still `true`).
- V12: `null` returns `false`.

#### `trendPercent.test.ts` — T1..T8

- T1: `(100, 80)` → `"+25%"`.
- T2: `(80, 100)` → `"-20%"`.
- T3: `(0, 0)` → `"—"`.
- T4: `(50, 0)` → `"—"` (avoid `+Infinity%`).
- T5: `(0, 50)` → `"-100%"`.
- T6: rounding: `(101, 100)` → `"+1%"`, `(101, 200)` → `"-50%"`.
- T7: negative round: `(99, 100)` → `"-1%"`.
- T8: large: `(1000, 100)` → `"+900%"`.

#### `rangeWindow.test.ts` — W1..W12

- W1: week, weekStart=0, now=2026-05-23 (Saturday) → window starts Sun 2026-05-17 00:00:00 UTC, ends Sat 2026-05-23 23:59:59.999. priorStart Sun 2026-05-10, priorEnd Sat 2026-05-16. Labels en `["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]`.
- W2: week, weekStart=1, now=2026-05-23 → window starts Mon 2026-05-18. Labels en `["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]`.
- W3: week, lang=zh → labels `["日","一","二","三","四","五","六"]` for weekStart=0, `["一","二","三","四","五","六","日"]` for weekStart=1.
- W4: month, now=2026-05-23 → 4 buckets W1..W4 covering May. priorStart 2026-04-01, priorEnd 2026-04-30.
- W5: month, partial 5th week: now=2026-05-31 → labels still 4 buckets (last bucket absorbs extra days).
- W6: all, now=2026-05-23 → 5 buckets, labels en `["Jan","Feb","Mar","Apr","May"]`, zh `["1 月","2 月","3 月","4 月","5 月"]`. priorStart 2025-08-01, priorEnd 2025-12-31.
- W7: all, lang=zh → labels in CN month form.
- W8: all near year boundary: now=2026-02-15 → labels en `["Oct","Nov","Dec","Jan","Feb"]`, prior window in 2024–25.
- W9: bucketBoundaries length matches labels length.
- W10: start ≤ end strictly.
- W11: priorStart ≤ priorEnd strictly.
- W12: end - start equals priorEnd - priorStart (same-length windows).

#### `aggregators.test.ts` — A1..A20

- A1: empty sessions + empty habits → all zeros, peak=null, all KPI strings "—", labels still 7/4/5.
- A2: one focus session in current week, none prior → trend "—" (avoid lying), focusBuckets has 1 non-zero entry, KPI focus shows the minutes.
- A3: 3 focus sessions across week, 2 prior week → trend "+50%".
- A4: 24h hour distribution: 2 sessions at 09:00 + 1 session at 14:00 → `hourDistribution[9] === sum1+sum2`, `hourDistribution[14] === sum3`, `peakHour === 9`.
- A5: break sessions are ignored (mode='short-break' / 'long-break').
- A6: tagDistribution: 3 habits with emojis ☕/💧/🏃 + 0/2/4 in-range check-ins → top 3 groups percent sums to 100%, color rotation `--accent`/`--blue`/`--amber`.
- A7: tagDistribution empty when no check-ins.
- A8: habitRanking sorts desc by percent.
- A9: habitRanking caps at top 5.
- A10: habitRanking falls back to streak=0 when missing.
- A11: month range: 4 weekly buckets, last bucket includes day 29..31 when month has 31 days.
- A12: all range: 5 monthly buckets, labels are short month names.
- A13: aggregateWeek + aggregateMonth + aggregateAll all return the SAME `RangeAggregate` shape (verified by structural check).
- A14: `tasksTotal === focusBuckets.length sessions count`, NOT minutes (1 session = 1 unit).
- A15: `focusMinutesTotal === sum(focusBuckets)`.
- A16: `dailyAvgMinutes === Math.round(focusMinutesTotal / labels.length)`.
- A17: habitsKept fraction: 2 habits with ≥1 check-in in range out of 5 total → `"2/5"`.
- A18: 0 habits → `"0/0"`.
- A19: trend strings: `tasksTrend`/`focusTrend`/`avgTrend` follow `trendPercent`; `habitsKeptTrend === "100%"` when kept===total>0, else the kept-string itself.
- A20: pure: calling twice with same inputs returns deep-equal output.

#### `heatmapCells.test.ts` — H1..H8

- H1: returns exactly 182 cells.
- H2: cell ordering: `cells[0].week===0 && cells[0].day===0`, `cells[181].week===25 && cells[181].day===6`.
- H3: every `date` is a valid YYYY-MM-DD.
- H4: oldest cell date is 25 weeks before `now`'s week start.
- H5: most recent cell date is `now`'s date if `now` is the week's last day, else the current week's last day.
- H6: minutes summation: 1 focus session of 25 minutes on 2026-05-20 → that cell's minutes === 25.
- H7: level threshold: 0 → 0; 1..15 → 1; 16..45 → 2; 46..90 → 3; 91+ → 4.
- H8: weekStart=1 → cells[0].day=0 is the Monday position; weekStart=0 → cells[0].day=0 is the Sunday position.

#### `insightCopy.test.ts` — I1..I8

- I1: null peakHourLabel, lang='en' → empty-state EN string.
- I2: null peakHourLabel, lang='zh' → empty-state ZH string.
- I3: range='week', lang='en', peak='09:00', trend='+8%' → contains "09:00", "+8%", "morning rhythm".
- I4: range='month', lang='zh', peak='14:00', trend='+12%' → contains "14:00", "+12%", "节奏稳定".
- I5: range='all', lang='en', peak='10:00', trend='—' → contains "10:00", "—", "Long-game".
- I6: NO `+` string concatenation: spy `String.prototype.concat` (or read source AST in a snapshot) — practically verified by visual inspection + structural test that the returned string contains the exact template values without extra spaces.
- I7: trend can be `"—"`, output still grammatical (no broken whitespace).
- I8: pure: same vars → same output.

### Component layer (`src/__tests__/*.test.tsx`)

#### `KpiCard.test.tsx` — K1..K4

- K1: renders label, value, unit, trend.
- K2: icon background uses `color-mix` token (snapshot test of inline style).
- K3: value '—' renders as em-dash without unit duplication.
- K4: aria-label includes `cellId` for screen readers.

#### `LineChart.test.tsx` — L1..L4

- L1: renders SVG with `<path>` for line + `<path>` for shaded area.
- L2: data length 7 produces 7 `<circle>` markers.
- L3: empty data renders an empty-state placeholder (no NaN in path).
- L4: max equals min: produces a flat line at h/2, no `NaN`.

#### `BarChart.test.tsx` — B1..B4

- B1: 7 bars from 7-element data.
- B2: tallest bar has 100% height.
- B3: zero data renders 0% height bars, no NaN.
- B4: labels rendered below bars.

#### `HourBar.test.tsx` — HB1..HB5

- HB1: 24 columns rendered.
- HB2: peak=9 → column 9 has `.peak` class + glow.
- HB3: peak=null → no `.peak` class anywhere.
- HB4: every 3rd hour label rendered (00, 03, 06, ...).
- HB5: 24 zeros + peak=null renders without error.

#### `RingChart.test.tsx` — R1..R3

- R1: 5 segments produce 5 `<circle>` strokes + 1 background circle.
- R2: empty segments renders ONLY the background circle.
- R3: percent sum can be ≤100% (the chart does not normalize).

#### `HabitRank.test.tsx` — HR1..HR4

- HR1: renders 5 rows max.
- HR2: each row shows index, emoji, title, percent bar, streak.
- HR3: empty ranking renders an empty-state row.
- HR4: lang='zh' renders zh titles.

#### `Heatmap.test.tsx` — HM1..HM3

- HM1: renders exactly 182 `.heat-cell` divs.
- HM2: classes `heat-0` .. `heat-4` applied per level.
- HM3: empty cells (all level 0) still renders 182 cells.

#### `InsightCallout.test.tsx` — IC1..IC2

- IC1: renders `<h4>` + `<p>` with the supplied copy.
- IC2: empty copy still renders the panel structure (no panel collapse).

#### `StatisticsModule.test.tsx` — S1..S10

- S1: renders with no seeded data → all panels present, KPIs show `—`, peak hidden, ring chart empty, habit list empty-state, heatmap 182 cells level 0, insight empty-state.
- S2: seed 3 focus sessions in current week → KPI tasksTotal=3, focusMinutesTotal=sum, range still week.
- S3: click "本月" → re-renders with month aggregate, no unmount of children.
- S4: click "全部" → re-renders with all aggregate.
- S5: lang='zh' → tab buttons show "本周/本月/全部", KPI labels in ZH.
- S6: weekStart=1 → labels reflect Mon..Sun.
- S7: storage event via `setPref('xai_pomodoro_sessions', [...new])` triggers re-render with updated KPIs (uses `act` + `setPref`).
- S8: aria-selected on the active tab button.
- S9: tab buttons have stable `data-testid` for E2E.
- S10: NO `console.error` during render (catches React key warnings, etc.).

#### `registration.test.tsx` — RE1..RE3

- RE1: `statisticsWebModuleRegistration.moduleId === 'statistics'`.
- RE2: `children[0].render` resolves to a function that, mounted under `WebShellProvider`, renders `StatisticsModule`.
- RE3: `icon === 'chart'`, `railOrder === 11`, `i18nKey === 'nav.statistics'`, `showInRail === true`.

#### `index-barrel.test.ts` — IB1..IB4

- IB1: all expected exports are present.
- IB2: no unexpected exports.
- IB3: `StatisticsModule` is a function.
- IB4: `statisticsWebModuleRegistration` is an object with `moduleId === 'statistics'`.

## §4 Acceptance criteria → test mapping

| Acceptance | Test refs |
|---|---|
| Range tabs recalc all 7 visualizations | S3, S4 |
| Peak bar highlights correctly | HB2, A4, HM* (heatmap unrelated to peak) |
| Insight reads naturally in both languages | I3..I5 |
| Heatmap covers half a year | H1, HM1 |
| Real data from Tasks/Pomodoro/Habits | S2, A2..A20 |
| KPI trend % with empty prior | T3, T4, A2 |
| Charts deterministic from same source | A20, H1, I8 |
| No random sampling | grep for `Math.random` returns 0 hits |
| Module registers via shell slot | RE1..RE3, S* (via shell anchor edit in P3) |
| Lint clean | `pnpm --filter @repo/plugin-web-statistics lint --max-warnings 0` exits 0 |

## §5 Test fixtures

`src/__tests__/__fixtures__/sessions.ts`:

```ts
export const SESSIONS_EMPTY: unknown[] = [];

export function makeFocusSession(finishedAt: string, minutes = 25): unknown {
  return {
    mode: "focus",
    durationMs: minutes * 60 * 1000,
    finishedAt,
  };
}

export function makeBreakSession(finishedAt: string, minutes = 5): unknown {
  return {
    mode: "short-break",
    durationMs: minutes * 60 * 1000,
    finishedAt,
  };
}
```

`src/__tests__/__fixtures__/habits.ts`:

```ts
export const HABITS_EMPTY = {
  schemaVersion: 1,
  habits: [],
  checkIns: {},
  diaries: {},
};

export function makeHabit(id: string, emoji: string, titleEn: string, titleZh: string, streak = 0) {
  return { id, emoji, title: { en: titleEn, zh: titleZh }, streak };
}
```

Reuse across all tests; do not seed `localStorage` with raw JSON literals in any test file — go through `setPref` to keep the storage layer real.

## §6 Lint + typecheck gates

```bash
pnpm --filter @repo/plugin-web-statistics lint     # --max-warnings 0
pnpm --filter @repo/plugin-web-statistics typecheck
pnpm --filter @repo/plugin-web-statistics test     # full vitest run
```

All three MUST exit 0 in every phase's acceptance gate. Each phase commits ONE green commit.

## §7 Cross-vendor smoke (queued for ship)

The W3 manifest header schedules a cross-vendor smoke run on Chrome 120 / Safari 17 / Firefox 121 for visual parity of:

- ring chart `stroke-dasharray` precision
- heatmap CSS grid + `color-mix` levels
- `var(--accent)` resolution under `prefers-color-scheme: dark`
- `prefers-reduced-motion: reduce` disables hover transitions on bars

Output: `docs/reviews/xai-web-statistics/<YYYYMMDD>-cross-vendor-smoke.md` (template mirrors ai-chat's). Executed by the ship-time vendor; NOT a build-phase gate.

---
