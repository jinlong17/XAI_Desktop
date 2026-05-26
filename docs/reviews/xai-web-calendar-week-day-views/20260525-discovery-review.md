# Discovery Review — xai-web-calendar-week-day-views

> Extension of SHIPPED `xai-web-calendar` (#12, 2026-05-23).
> Gap-closure roadmap row #4 (W1), parent ADR-0009 §D2-G3.
> Seed brief: `docs/reviews/xai-web-calendar-week-day-views/20260524-roadmap-seed.md`
> Pattern reference: `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-discovery-review.md` (row #2 extension-of-SHIPPED).

## 1. Problem framing

### 1.1 What ships today (SHIPPED 2026-05-23 baseline)

`@repo/plugin-web-calendar` at `packages/xai-web-calendar/` renders:

- A 7-column × N-row **Month** grid for the May 2026 design anchor (35 or 42
  cells via `monthGridCells`).
- 4-color event chips (mint/amber/blue/violet) from the inlined
  `SAMPLE_EVENTS` fixture (68 events; days 14 + 31 empty).
- Toolbar with a 3-tab segmented switcher: Day / Week / Month — but Day +
  Week clicks swap the grid for a `ComingSoonPanel` ("Week and Day views
  are coming soon." bilingual). Only Month is functional.
- Deep-link receive on `web:shell:module-change` (listen-only; no emit).
- ISO 8601 week numbers, holiday labels, weekday header, today-pill.
- 90 unit tests across 18 files (`pnpm --filter @repo/plugin-web-calendar
  test` → 90/90).

### 1.2 The gap (user-audited 2026-05-24)

`docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md`
§Gap 3 calls out that the Week + Day view tabs are functional-in-state but
**stub-only in body**. Users clicking Week/Day see a placeholder text. The
DESIGN.md §4.5 contract (Month / Week / Day view switcher) is honored in
toolbar shape only, not in the rendered surface.

This row replaces the `ComingSoonPanel` body with **real Week + Day views**:

- **Week view** — 7 columns × 24 hour-rows, events that have a `time` field
  rendered as continuous blocks spanning the relevant rows.
- **Day view** — 1 column × 24 hour-rows, dense single-day inspection of
  that same data shape.

### 1.3 Acceptance signal (from seed brief — copied verbatim)

- Toggle Month → Week → Day → Month preserves the centered date.
- Events spanning 9:00-11:00 render as a continuous 2-row block in Week +
  Day, not two 1-row stubs.
- All 90 existing calendar plugin tests still PASS; new tests cover
  24-hour rendering + multi-hour event spans + view toggle + persistence.
- Performance: switching views completes in **< 50 ms** on a month with
  50 events.
- Verify Cross-vendor: Codex cold-read confirms timezone handling is
  consistent across Month/Week/Day (no off-by-one at midnight or DST
  boundaries).

### 1.4 Hard constraints (10 from seed + 2 from dispatch)

1. Reuse existing event source from Month view; do NOT introduce a
   parallel event store.
2. Week view: 7 cols × 24 hour-rows × event overlay (events that span
   multiple hours render as multi-row blocks).
3. Day view: 1 col × 24 hour-rows × event overlay; intended for dense
   single-day inspection.
4. Toggle UI: pill-segmented control in calendar header (already present
   as `.seg` — extend wiring, do not rebuild).
5. New persistence key `xai_calendar_view` (= `month` | `week` | `day`)
   — register in `@repo/plugin-web-storage`.
6. Active-date preservation: switching views keeps the user's "focused
   date" stable (centered in viewport).
7. DESIGN.md §calendar fidelity: visual style must match prototype's
   Month view (typography, color tokens).
8. DO NOT add event-creation/editing UI overhaul — reuse existing Month
   modal flow (none exists yet; v1 is read-only, so this is a no-op
   constraint).
9. Per ADR-0009 §D4: P0 work; cross-vendor verify mandatory.
10. Append-only `dev_log.md` lineage block (do NOT erase existing
    SHIPPED Status Panel from feature #12 Month view); follow row #2
    pattern at `packages/xai-web-ai-chat/docs/dev_log.md:325-`.
11. Do NOT skip Step 0. Seed brief is Step 0 input.
12. Do NOT add Cmd+K integration (row #3's territory; already SHIPPED
    pending human ship).

## 2. Candidate options

This is an extension of a SHIPPED package, so the option space is narrow
(don't re-invent existing wheels). The interesting decisions are:

### 2.1 Decision A — How to model the event "time → hour" mapping

Today's `CalEvent` has an optional `time?: "HH:MM"` (start only, no
end). Multi-hour blocks require a duration concept. Three options:

| Option | Approach | Pros | Cons |
|---|---|---|---|
| **A1** | Add OPTIONAL `endTime?: "HH:MM"` field to `CalEvent`. Backwards-compatible: missing endTime → defaults to start + 1 hour (single hour-row). | Minimal type change; reuses fixture file; honors HC1 (no parallel store); single-source-of-truth | Need to update `SAMPLE_EVENTS` to add `endTime` for ~5 demo events to actually show multi-hour blocks. Drift of fixture from `i18n.js` (which has no end times). |
| A2 | Add NEW `duration?: number` (minutes) field to `CalEvent`. | Same compat story | Less ergonomic — UI thinks in start/end, not durations |
| A3 | Keep CalEvent as-is; in Week/Day render every timed event as a 1-hour block. | Zero CalEvent change; zero fixture change | Fails acceptance signal "Events spanning 9:00-11:00 render as a continuous 2-row block" — cannot demonstrate the feature |

**Recommendation: A1.** It satisfies the acceptance signal, is additive
(no breaking change to the SHIPPED interface — `endTime` is optional),
and the docstring on `CalEvent` already calls `time` "Optional HH:MM
clock string" so adding a sibling optional is idiomatic. Fixture
adjustment is ~5 lines; we annotate in `sampleEvents.ts` that the
`endTime` values are local additions, not transcribed from
`i18n.js:509-541`. The `i18n.js` byte-parity is no longer a frozen
assumption for the `time`/`endTime` field family after this row — we
note this as a controlled drift in `design.md` §1.1 extension.

### 2.2 Decision B — Timezone handling for the hour-row grid

Today's Month view uses **UTC date keys** exclusively (`utcDateKey` +
`getUTCDay`). Hour-rows raise a new question: are "9:00" and "11:00"
LOCAL clock hours or UTC hours?

| Option | Approach | Pros | Cons |
|---|---|---|---|
| B1 | Render hour rows in **local clock time** (`new Date().getHours()`); event `time` field is parsed as a local clock string. | Matches user mental model ("my 9 AM standup" = wall-clock 9 AM); matches prototype's implicit semantics; matches all major calendar apps (Google / Apple / Outlook). | Cross-vendor verifier (Codex) must confirm no UTC drift at midnight: an event at `time: "00:30"` belongs to the day it's listed under, not yesterday/tomorrow. The grid label "00" is local clock midnight, NOT UTC midnight. DST shifts compress/expand the hour-row count for the affected day (a Sunday in March = 23 rows; a Sunday in November = 25 rows). |
| **B2** | Render hour rows in **UTC** (`getUTCHours`); event `time` field is parsed as a UTC string. | Consistency with Month view's UTC date keys; deterministic 24-row grid every day; no DST surprises. | Confusing UX — a user in PST sees their 9 AM standup at row "17:00" if the event was stored as UTC. Violates principle of least surprise. |
| B3 | Render hour rows in local time, but date keys stay UTC. | Internal consistency at the grid level | Two different time bases in one component is a maintenance burden |

**Recommendation: B1 + a documented note that DST days have variable row
counts.** This matches DESIGN.md fidelity (prototype clearly intends
wall-clock hours for the user's "9 AM standup"), matches every shipped
consumer calendar product, and aligns with the seed brief's
"timezone handling is consistent across Month/Week/Day" — consistency
here means "the same conceptual day-key everywhere," not "UTC
everywhere." Month view's date key is UTC because the day-bucket is
unambiguous; hour rendering is necessarily wall-clock or the grid
becomes unusable.

**For v1, we render the grid in the browser's local timezone — derived
from `new Date().getTimezoneOffset()` at mount.** Future row (out of
scope) may add a "timezone display preference" per design.md §1.2 list.

DST handling: a 24-row constant is used for non-DST days; the spring-
forward day skips one row (rendered with a small "(DST)" label between
the affected rows), the fall-back day duplicates one row (rendered with
the same label). AC-DST-1..2 in `test.md` cover both transitions in
2026: March 8 (spring) + November 1 (fall) — both US Pacific. The seed
brief mandates "no off-by-one at midnight or DST boundaries" — this is
verified by AC-DST + AC-TZ.

### 2.3 Decision C — "Active date" semantics across views

Switching views must preserve a "focused date." Today's Month view has
both `displayedMonth: { year, month }` and `focusedDate: string | null`
(set only by deep-link). The "centered date" definition differs per view:

| View | "Centered date" definition |
|---|---|
| Month | The displayed month's "anchor" = the day-pill (today if today is in `displayedMonth`, else the 1st of the month). Toggle Month → Week: which day becomes Week's center? |
| Week | The week containing `activeDate`. The viewport scroll-anchors so this column is visible. |
| Day | Trivially `activeDate`. |

**Option C1 — Add a single `activeDate: string` (always YYYY-MM-DD)
that is the source of truth across all three views.** Month derives
`displayedMonth = { year: activeDate.year, month: activeDate.month }`;
Week derives the 7-day window containing `activeDate`; Day renders
`activeDate`. Toggle Month → Week: `activeDate` stays = "first day of
displayed month if focusedDate is null, else focusedDate." Toggle Week
→ Day: `activeDate` becomes the user's "selected day in the week"
(default = today if today is in week, else the week's first day).
Toggle Day → Month: `displayedMonth` re-derives from `activeDate`.

**Option C2 — Keep `displayedMonth` and `focusedDate`; compute
Week/Day from `focusedDate ?? displayedMonth.day-1`.**

**Recommendation: C1.** Single source of truth = single bug surface.
The existing `displayedMonth` becomes a derived value (memoized from
`activeDate.year` + `activeDate.month`). `focusedDate` (deep-link only)
also becomes derived. The state machine is one cell, not two.

Migration plan: refactor `CalendarModule.tsx` state from `(view,
displayedMonth, focusedDate)` to `(view, activeDate, focusedFromDeepLink)`
where:

- `activeDate: string` — always YYYY-MM-DD (UTC date key)
- `focusedFromDeepLink: string | null` — preserved for the `.cal-day[data-focused]`
  outline behavior in Month view (deep-link-only)
- `displayedMonth` derived = `{ year, month } = parseDateKey(activeDate)`

Initial state: `activeDate = "2026-05-22"` (the design-anchor today =
`MAY_2026_ANCHOR_TODAY` constant) so that toggling Month → Day on a
fresh mount lands on the cell that has the existing today-pill.

### 2.4 Decision D — Where to register the new `xai_calendar_view` key

The seed brief mandates a new persistence key `xai_calendar_view` (=
`"month" | "week" | "day"`). This goes in `@repo/plugin-web-storage`
(a.k.a. `xai-web-persistence-contract` — confirmed via package.json
description: "Typed localStorage key registry + usePref hook for the
XAI Web Console (row #3, xai-web-persistence-contract).").

The package has a single registry file
`packages/plugin-web-storage/src/internal/registry.ts` with a
`PREF_REGISTRY` const. Per the existing pattern (compare
`xai_pref_week_start` at line 401-408, `xai_ai_provider` at line
307-314), the new entry slots in additively at the file tail:

```ts
// ---- Calendar view preference (§S8 — xai-web-calendar-week-day-views row #4) ---
// Persist user's last-selected calendar view across reloads. Default "month".
// Owner xai-web-calendar (first-consumer pattern).
// Canonical xai_calendar_* family per ADR-0007 §S8.
xai_calendar_view: {
  key: "xai_calendar_view",
  codec: "string",
  default: "month" as CalendarViewId,
  schemaVersion: 1,
  owner: "xai-web-calendar",
  category: "module",
} satisfies PrefEntry<CalendarViewId>,
```

New type alias:

```ts
export type CalendarViewId = "month" | "week" | "day";
```

`category` is `"module"` (NOT `"pref"`) because this is a module-state
value (which view to restore), not a user preference like
`xai_pref_week_start`. This matches the existing pattern: `xai_ai_provider`
(module pref, category "module") vs `xai_pref_features_calendar`
(category "pref"). The `xai_pref_*` prefix family is for the Features
panel toggles family; `xai_calendar_view` is a per-module state key.

**Naming alternative considered + rejected: `xai_pref_calendar_view`**
(would land in `pref` category). Rejected because:
- It's not a user-tweakable Settings pref; it's a UI state restored on
  reload.
- The `xai_pref_*` family is owned by `xai-web-settings-*` rows per
  ADR-0007 §S8 chassis-resetAllPrefs() filter.
- Existing precedent: `xai_clock_style`, `xai_clock_tz` (module state in
  `module` category), `xai_active_board` (module state), `xai_ai_provider`
  (module state). All are in `module` category.

### 2.5 Decision E — Shared time-grid component vs duplicate

Week (7×24) and Day (1×24) share most rendering logic: hour-row scaffold,
time labels, event-block positioning. Two options:

| Option | Approach | Pros | Cons |
|---|---|---|---|
| **E1** | Extract a `TimeGrid` component that accepts `columns: 1 \| 7` + a `days: DayBucket[]` prop. Week passes 7 days; Day passes 1. | DRY; single-source-of-truth for hour-row math + event-block positioning algorithm; one place to test the multi-hour span logic | Slightly more abstract; component prop surface needs careful design |
| E2 | Build `WeekView` and `DayView` independently; copy the hour-row scaffolding. | Simpler local reasoning per file | 2× the bug surface; multi-hour algorithm written twice; AC-DST + AC-TZ tested twice |

**Recommendation: E1.** The 24-row scaffold + the multi-hour event-block
positioning algorithm + the timezone label rendering are the same in
both views. Day view is literally Week view with `days.length === 1`.
The pure algorithm `placeEventBlocks(events, dayKey)` returns the
positioning data and is shared.

## 3. Web research

**HC9 (P0, cross-vendor verify) does NOT require external library research
for this row.** All work is internal: extending a SHIPPED React/TS
package with two new view components, a new pure positioning helper,
and a single new storage registry entry. No external HTTP, no new
runtime dependency, no new CSP directive, no new third-party widget.

**No external research required for this row.**

(The seed brief acceptance signal §5 cross-vendor verify focuses on
timezone consistency, which is internal logic verified by Codex
cold-read against the local code + test fixtures, not against any
external library reference.)

## 4. Tradeoffs summary

| Axis | Picked | Why |
|---|---|---|
| Event duration model | A1 (optional `endTime`) | Additive type change; fixture impact ~5 lines; honors HC1 reuse-event-source |
| Timezone basis for hour rows | B1 (local clock) | UX-correct; matches DESIGN.md prototype intent; DST handled with explicit row-count variation |
| Active-date state shape | C1 (single `activeDate`) | One source of truth; eliminates the "which is canonical, displayedMonth or focusedDate?" question |
| Persistence key location | `xai_calendar_view` in `plugin-web-storage` registry, category `module` | Matches `xai_clock_style`/`xai_active_board` precedent (module state, not pref toggle) |
| Code reuse | E1 (shared `TimeGrid`) | DRY for the multi-hour algorithm + DST math; Day = `<TimeGrid columns=1 />`, Week = `<TimeGrid columns=7 />` |

## 5. Recommendation (consolidated)

Land the extension as a **5-phase build** on the SHIPPED
`@repo/plugin-web-calendar` package + 1 surgical edit to
`@repo/plugin-web-storage`:

- **P1** — Foundations: new `xai_calendar_view` registry entry +
  `CalendarViewId` type + state refactor (`activeDate` single source +
  derived `displayedMonth`) + `endTime?` field on `CalEvent` + 5 fixture
  lines updated + shared `TimeGrid` component skeleton + pure
  `placeEventBlocks` helper. NO Week/Day UI render yet.
- **P2** — Week view: `<WeekView />` consumes `<TimeGrid columns=7 />`
  + 7-day window math + event-block render + multi-hour spans + DST
  edge-case.
- **P3** — Day view: `<DayView />` consumes `<TimeGrid columns=1 />`
  + single-day data shape + scroll-to-current-hour on mount + DST.
- **P4** — Toggle UI + active-date preservation: wire `usePref(
  "xai_calendar_view", "month")` to view state + center-date
  preservation logic on view-change + replace `ComingSoonPanel` swap
  with real conditional render + integration into existing
  `CalendarModule`.
- **P5** — Perf budget + cross-vendor verify: 50 ms toggle-switch test
  with 50-event fixture + Codex cold-read checklist (timezone +
  DST + view-toggle determinism) + docs sync + edge-case tests.

Existing 90 tests stay green throughout (each phase asserts via
`pnpm --filter @repo/plugin-web-calendar test`).

## 6. Risks + open questions

### 6.1 Risk register (carried into design.md §extension)

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-ext-1 | Timezone off-by-one at midnight (event at `time: "00:15"` appears in wrong day's column) | **High** | Render uses local clock hours; the event's owner-day is the day it's bucketed under in `SAMPLE_EVENTS` keys (the day-of-month integer). `placeEventBlocks` only positions events WITHIN a day; it never reassigns them across days. AC-TZ-1..4 cover the boundary. Cross-vendor verifier focus area. |
| R-ext-2 | DST boundary mis-rendering (spring-forward day = 23 hour rows, fall-back = 25) | **High** | Per-day row count derived from `dstHoursForDay(localDate, tz)` pure helper. Default `24`, overridden for the 2 known 2026 transitions (Mar 8 PST→PDT, Nov 1 PDT→PST). AC-DST-1..2 cover both. The "(DST)" label between affected rows is explicit. |
| R-ext-3 | 50 ms toggle-switch budget violation with 50 events | **Medium** | `placeEventBlocks` memoized on `(activeDate, viewKind, events)`; the toggle path only re-renders the `<TimeGrid />` subtree (not the full `<CalendarModule />`). PB1 perf test on 50-event May 2026 fixture asserts p95 < 50 ms across 100 iterations. |
| R-ext-4 | Active-date "centered" ambiguous in Week view (Sat-first week vs Sun-first vs day-in-middle) | Medium | "Centered" = the column containing `activeDate` is rendered with an `aria-selected="true"` + visual outline (`.cal-week-day[data-active="true"]`). The viewport does NOT auto-scroll laterally; the 7-day window contains `activeDate` per `weekWindowFor(activeDate, weekStart)`. Day-of-week alignment derives from `xai_pref_week_start` (already SHIPPED). |
| R-ext-5 | Persistence migration: existing users have no `xai_calendar_view` key | Low | `usePref("xai_calendar_view", "month")` returns `"month"` as default when key is absent. No migration needed (Settings W4 chassis-resetAllPrefs() doesn't touch this key — `xai_calendar_*` is NOT in the `xai_pref_*` filter family per §D4). |
| R-ext-6 | `CalEvent.endTime` field drift from `i18n.js` byte-parity | Low | Documented as a controlled drift in design.md §extension §1.1 (i18n.js does NOT have endTime; this is a local extension). AC-FIXTURE-EXT-1 asserts only the new `endTime` field annotations; the rest of SAMPLE_EVENTS byte-parity is unchanged. |
| R-ext-7 | Multi-hour block visual overlap when 2+ events at the same hour | Medium | `placeEventBlocks` returns positioning with `col: number` (0..N within the hour) and `colSpan: number`; the renderer uses CSS `grid-column` for side-by-side packing. AC-PLACE-1..4 covers 1-event, 2-overlap, 3-overlap, all-day edge. |
| R-ext-8 | Today-marker semantics in Week + Day differ from Month (Month has today-pill; Week + Day need a "now-line") | Medium | Week + Day render a horizontal `.cal-now-line` at the y-position corresponding to `new Date().getHours() + getMinutes()/60`. Mount-only (no `setInterval`) per existing I1 today-detection decision. AC-NOWLINE-1..3 cover position + per-day visibility (only on today's column in Week view). |
| R-ext-9 | View toggle clears focusedDate (deep-link state) and a deep-link → toggle to Week loses the focus | Low | `focusedFromDeepLink` is preserved across view changes (it's distinct from `activeDate`); however, the focus highlight is only rendered in Month view's `.cal-day[data-focused]` per existing v1 contract. Deep-link to Calendar always lands on Month view per the agreed mini-cal contract (verified at `xai-web-event-bus/docs/api.md:197-198` — deep-link does NOT specify view). To honor the deep-link landing intent, set `view = "month"` when `focusDate` arrives (consistent with user's mental model of "click date → see month context"). AC-DEEPLINK-EXT-1 covers this. |
| R-ext-10 | Existing 90 tests reference `displayedMonth` state shape — refactor to `activeDate` breaks them | **High** | The state refactor in P1 keeps the EXTERNAL behavior identical (toolbar shows same title; nav buttons step the same way; deep-link sets focusedDate). Tests assert via DOM (e.g., `screen.getByText("May 2026")`) or via `data-testid` — none reach into internal state. Verified by tracing all 90 tests in P1 dev_log line item. If any test uses `vi.useFakeTimers().runAllTimers()` against a state assertion, refactor it to DOM assertion in P1. |

### 6.2 Open questions for feature-review

- **Q1** — Decision A confirmation: add OPTIONAL `endTime?: "HH:MM"` to
  `CalEvent` (additive type change, ~5 fixture lines updated)?
  - **Planner recommendation:** **A1 yes.** Required to satisfy
    acceptance signal "Events spanning 9:00-11:00 render as a
    continuous 2-row block." Alternatives can't demonstrate the feature.
- **Q2** — Decision B confirmation: hour-rows in local clock time (B1)
  with DST row-count variation?
  - **Planner recommendation:** **B1 yes.** UX-correct + matches every
    shipped consumer calendar. DST handled explicitly with AC-DST tests.
- **Q3** — Decision C confirmation: state refactor from `(displayedMonth,
  focusedDate)` to `(activeDate, focusedFromDeepLink)`?
  - **Planner recommendation:** **C1 yes.** Single source of truth.
    External behavior unchanged per R-ext-10 mitigation.
- **Q4** — Decision D confirmation: `xai_calendar_view` in `module`
  category (not `pref`)?
  - **Planner recommendation:** **D yes (module).** Matches
    `xai_clock_style` / `xai_active_board` precedent.
- **Q5** — Decision E confirmation: shared `TimeGrid` component (E1)?
  - **Planner recommendation:** **E1 yes.** DRY for the multi-hour
    positioning + DST math.
- **Q6** — Week view: what's the "today" indicator?
  - **Planner recommendation:** `.cal-now-line` horizontal line at
    current hour, rendered only on today's column in Week view + the
    full Day grid when Day = today. Mount-only memo (I1 pattern).
- **Q7** — Day view: scroll-to-current-hour on mount?
  - **Planner recommendation:** Yes. `useEffect(() => { container.scrollTop
    = nowHour * HOUR_HEIGHT - container.clientHeight / 2; }, [])`.
    Re-anchors the viewport so the user lands at "what's happening
    now" rather than at midnight. Skip if active date is not today (in
    that case, scroll to 8 AM = workday start). AC-SCROLL-1..2 cover.
- **Q8** — Empty hour-rows: render visible row scaffolds or collapse?
  - **Planner recommendation:** Render visible row scaffolds (a thin
    horizontal border at every hour). Calendar apps universally render
    the full 24-row grid; collapsing breaks the visual time-density
    metaphor. CSS `min-height: 48px` per row keeps the grid scrollable
    but not cramped.
- **Q9** — All-day events (events with no `time` field): where in
  Week/Day view?
  - **Planner recommendation:** Render in a sticky "all-day" strip
    above the 24-row scrollable area. The existing SAMPLE_EVENTS
    fixture has ~50 events without `time` — they all go here. AC-ALLDAY-1
    asserts the strip exists; AC-ALLDAY-2 asserts the events without
    `time` appear in the strip, not in the hour grid.
- **Q10** — Cross-vendor verify scope: which browsers + which scenarios?
  - **Planner recommendation:** Safari 17+ / Chrome 120+ / Firefox 120+
    (matches sibling rows). Scenarios: (1) view toggle preserves
    activeDate; (2) DST day renders correctly in browser's local tz;
    (3) midnight events don't bleed across day boundaries; (4)
    multi-hour blocks render as continuous rectangles; (5) all-day
    strip works; (6) reload restores last view via `xai_calendar_view`
    key. XVENDOR-EXT-1..6.

## 7. Source links

- Roadmap manifest row #4: `docs/workflow/roadmap/xai-web-console-gap-closure.md:26`
- Parent ADR: `docs/adr/0009-web-desktop-pivot-plan.md` §D2-G3
- Seed brief: `docs/reviews/xai-web-calendar-week-day-views/20260524-roadmap-seed.md`
- DESIGN.md spec: `web design/DESIGN.md` §4.5 Calendar
- Prototype: `web design/module-calendar.jsx` (Month-only)
- SHIPPED baseline: `packages/xai-web-calendar/docs/{design.md, api.md, test.md, dev_log.md}`
- SHIPPED storage registry: `packages/plugin-web-storage/src/internal/registry.ts`
- SHIPPED event channel: `packages/core/src/types/events.ts:175-184`
  (`web:shell:module-change` with `focusDate?: string`)
- Pattern reference (extension-of-SHIPPED): `packages/xai-web-ai-chat/docs/dev_log.md:325-` (Bugfix-Extension Lineage block)
- Pattern reference (perf-budget test): `packages/xai-web-cmdk/src/__tests__/perfBudget.test.ts`

## 8. Decision summary (one-paragraph)

Extend the SHIPPED `@repo/plugin-web-calendar` with real Week + Day
views by (1) adding `endTime?: "HH:MM"` to `CalEvent` (additive), (2)
extracting a shared `TimeGrid` 24-row component used by both Week (7
columns) and Day (1 column), (3) refactoring `CalendarModule` state to a
single `activeDate: YYYY-MM-DD` source of truth, (4) wiring view
selection to a new `xai_calendar_view` persistence key in
`@repo/plugin-web-storage` (category `module`, default `"month"`), and
(5) adding a 50ms perf-budget test + cross-vendor verify checklist
focused on timezone + DST edge cases. The hour-rows render in the
browser's local clock; DST days have variable row counts (23 or 25)
with an explicit "(DST)" label. All 90 existing tests stay green.
