# API Contract — @repo/plugin-web-calendar

> Public surface, types, and side-effect contracts.
> Companion to `design.md` (12 sections) and `test.md` (AC traceability).

## 1. Public exports (from `src/index.ts`)

### 1.1 Components

```ts
/** Top-level module. Renders the toolbar + month grid + banner. */
export function CalendarModule(props: CalendarModuleProps): JSX.Element;
```

#### `CalendarModuleProps`

```ts
export interface CalendarModuleProps {
  /** Active language — drives all bilingual text via useI18n. */
  lang: Lang;
}
```

Behaviour:

- Mounts with `view = "month"`, `displayedMonth = { year: 2026, month: 5 }`,
  `focusedDate = null`.
- Listens on `web:shell:module-change` for `moduleId === "calendar"` and
  re-centers `displayedMonth` + sets `focusedDate` per `design.md` §7.1.
- Re-renders when `lang` changes (parent prop) — no internal state reset.
- Re-renders when `xai_pref_week_start` flips via `usePref` (same-tab
  or cross-tab via the `storage` event).

### 1.2 SAMPLE_EVENTS constant

```ts
import type { CalEvent, CalEventColor, CalEventsByDay } from "@repo/plugin-web-calendar";

/** Day-of-month (1..31) → events. Derived from i18n.js:509-541. */
export const SAMPLE_EVENTS: CalEventsByDay;
```

Frozen content (transcription target — see `design.md` §4.1 +
`test.md` §3 AC-FIXTURE-1):

- 31 entries (days 1..31).
- Day 14 + day 31 are empty arrays.
- Total event count = 65.
- Color distribution (verifiable from i18n.js): mint ≈ 50, amber ≈ 11,
  blue ≈ 3, violet ≈ 1.
- Days with `time` field: 3 (Sat 7 yoga, Fri 8 content marketing, Sun 10
  wiping windows, etc.) — verified via fixture transcription tests.

### 1.3 Slot registration

```ts
/** WebModuleSlotRegistration for the AppRail. */
export const calendarSlotRegistration: WebModuleSlotRegistration;
```

Constants:

```ts
{
  moduleId: "calendar",
  label: "Calendar",
  defaultChildPath: "",
  children: [
    { path: "", render: CalendarSlotHost },
    { path: "*", render: CalendarSlotHost },
  ],
  icon: "calendar",
  railOrder: 5,
  i18nKey: "nav.calendar",
  showInRail: true,
}
```

### 1.4 Types re-exported

```ts
export type { CalendarModuleProps } from "./types.js";
export type { CalEvent, CalEventColor, CalEventsByDay } from "./internal/sampleEvents.js";
export type { MonthCellData } from "./internal/monthGridCells.js";
```

## 2. Cross-package contracts

### 2.1 New `WebPrefRegistry` entry

Added to `packages/plugin-web-storage/src/internal/registry.ts` at
file-tail (append-at-end, line-disjoint from sibling additions):

```ts
xai_pref_week_start: {
  key: "xai_pref_week_start",
  codec: "number",
  default: 0,
  schemaVersion: 1,
  owner: "xai-web-calendar",
  category: "pref",
} satisfies PrefEntry<0 | 1>,
```

Consumers (calendar v1, habits + meditation later) read via
`usePref("xai_pref_week_start", 0)`. Settings W4 row #24 wires the
write-side UI. The `default` value is `0` (Sunday) per the seed brief.

Storage value-type `0 | 1` is the union exposed by the entry's
inferred `default` literal. Consumer code that wants to widen (e.g.
support Tuesday-first) will need a schema-version bump + migration —
follow-up row.

### 2.2 i18n delta to `@repo/plugin-web-tokens`

Additive only. Both `en` + `zh` bundles get the same 3 new keys under
the existing `cal:` namespace:

```ts
// en bundle
cal: {
  month: "Month", week: "Week", day: "Day",
  today: "Today",
  sample_banner: "Sample data — switch to your account to see real events.",
  // NEW v1 (this row):
  coming_soon: "Week and Day views are coming soon.",
  holiday_mayday: "Labor Day",
  holiday_mothers_day: "Mother's Day",
}

// zh bundle
cal: {
  month: "月", week: "周", day: "日",
  today: "今天",
  sample_banner: "示例数据 — 登录后查看真实事件。",
  // NEW v1 (this row):
  coming_soon: "周视图与日视图即将推出。",
  holiday_mayday: "劳动节",
  holiday_mothers_day: "母亲节",
}
```

No key renames; no removals. `I18NBundle = typeof I18N["en"]` derived
type expansion is the only consumer-side effect — TypeScript will
require ZH bundle parity (enforced at compile time).

### 2.3 Event channel listened on

```ts
// from @repo/core/types/events.ts (already declared at line 175-184)
'web:shell:module-change': {
  moduleId: WebModuleId;
  focusDate?: string;      // YYYY-MM-DD UTC date string
  detailId?: string;
  source: 'app-rail' | 'mini-cal' | 'shortcut' | 'restore' | 'programmatic';
};
```

Listen-side semantics:

- Calendar listens unconditionally via `useWebEventListener(...)`.
- Calendar filters payloads where `moduleId !== "calendar"` — early
  return.
- Calendar reads `focusDate` (string, ISO `YYYY-MM-DD`). If absent,
  early return.
- Calendar parses `focusDate` via `[y, m] = focusDate.split("-").
  map(Number)`. If parse yields `NaN` or out-of-range values, early
  return (logs `console.warn` once with the malformed payload).
- Calendar sets `displayedMonth = { year: y, month: m }` only if
  different from current. Then `focusedDate = focusDate`.

### 2.4 No emit

Calendar is listen-only. `emitWebEvent` is NOT imported (lint via
test: AC-EVENT-7 grep-asserts no `emitWebEvent\|emitWebEvent` import in
`packages/xai-web-calendar/src/`).

## 3. Idempotency + error semantics

### 3.1 Idempotent prop changes

`<CalendarModule lang={...} />`:

- Changing `lang` re-renders text but preserves `view`, `displayedMonth`,
  and `focusedDate`. No localStorage churn (week-start key untouched).

### 3.2 Idempotent deep-link

Receiving `{ moduleId:"calendar", focusDate:"2026-05-23" }` twice in a
row:

- First call: `displayedMonth → {2026, 5}` (no change since default
  matches), `focusedDate → "2026-05-23"`.
- Second call: equality guard on `focusDate` skips redundant state set
  (React's useState already bails on `Object.is` equal next).

### 3.3 Malformed payloads

- `focusDate: ""` → early return (treated as "absent").
- `focusDate: "not-a-date"` → early return + single `console.warn`.
- `focusDate: "2026-13-05"` (month out of range) → early return + single
  `console.warn`.
- `focusDate: "2026-05-32"` (day out of range) → still re-centers month
  to `{2026, 5}` but `focusedDate` is set to the literal string (the
  grid will silently render no outline since no cell matches). The
  acceptance signal is "deep-link lands on the correct day"; malformed
  day silently no-ops.

### 3.4 Lang change mid-render

`useI18n(lang)` is a stateless hook (returns memoized `t` + `s` per
`lang`). Switching mid-render is safe.

### 3.5 weekStart change mid-render

The `usePref` hook re-fires the consumer when the value flips (in-
process bus). `monthGridCells` is called within a memo keyed on
`(year, month, weekStart)` so the grid re-derives. No flicker.

## 4. Performance contract

### 4.1 Render budgets

- Initial mount → first paint: ≤ 16 ms on M1 Air baseline (35 cells +
  10 toolbar nodes + 30 i18n string lookups). No async work; no
  network; no storage reads beyond a single `getItem` on mount.
- Month-nav click → re-render: ≤ 4 ms (pure helper recomputes; React
  diff is 35 cells).
- Deep-link arrives: ≤ 4 ms (same path as month-nav).
- weekStart flip: ≤ 4 ms (memo re-derives).

### 4.2 Memoization map

| Computation | Memo key | Cost |
|---|---|---|
| `today` (utcDateKey on mount) | `[]` | once per mount |
| `monthGridCells(year, month, weekStart)` | `[year, month, weekStart]` | per month-nav |
| `weekdayLabels(weekdaysShort, weekStart)` | `[weekdaysShort, weekStart]` | per weekStart flip |
| `formatMonthTitle(year, month, lang, t)` | `[year, month, lang]` | per month-nav / lang flip |

### 4.3 No timers, no observers

- No `setInterval` / `setTimeout`.
- No `IntersectionObserver` / `ResizeObserver`.
- No `requestAnimationFrame`.

## 5. Accessibility contract

| Element | a11y attribute |
|---|---|
| `<button class="seg" aria-selected={view===id}>` × 3 | `aria-selected="true"` on active view; `false` otherwise |
| `<button class="btn-today">` | Accessible name: `t.cal.today` |
| `<.cal-day[data-focused="true"]>` | Visual outline; not announced (decorative) |
| Holiday label `<.cal-holiday>` | Inline text, follows in DOM after day-num — read by screen readers as "May 1 Labor Day" |
| Today pill | `<span class="today-pill">{n}</span>` — the day-num remains the accessible text node; pill is purely visual |
| Icon-only buttons | No accessible name in v1 (matches prototype). Future row may add `aria-label`s. Documented as a known a11y gap; the seed brief does not call out a11y as acceptance-blocking |

No focus management for v1 (no arrow-key navigation on the grid). Add
in a future row.

## 6. Stability rules

- Add new toolbar icons or buttons → additive in `CalendarToolbar`; no
  breaking change to `CalendarModuleProps`.
- Add new event color → extend `CalEventColor` union → consumer
  recompiles. Storage codec is unaffected (no events persisted).
- Change `displayedMonth` initializer (e.g., flip to real current
  month) → no API change; one-line edit in `CalendarModule`; covered
  in `discovery-review.md` §6.2 follow-up #2.
- Add new event channel → would require `packages/core/` edit, which is
  out of scope for this row (constraint #5 in user prompt).
- Bump `xai_pref_week_start` schema → requires schema-version bump +
  migration entry per `@repo/plugin-web-storage` migration rules.

## 7. Versioning

- Initial publish: `0.0.0` (`private: true`).
- No semver gates v1; consumed only via workspace.
- `manifest.json` `status: "In-Dev"`; flipped to `Production` in
  `ship`.

## 8. Side-effect surface

- `import "./styles.css"` (side-effect tag in package.json).
- One `useWebEventListener` subscription that auto-cleans on unmount.
- Zero storage writes from this module (read-only `usePref`).
- Zero network calls.
- Zero global mutations.

## 9. Build artifacts

- TypeScript-only (no transpile step beyond Vite/Vitest).
- ESM imports throughout (`.js` extension on internal imports per
  TypeScript "verbatim module syntax" requirement).
- Bundled by Vite when consumed in `apps/web`.

---

## 10. 2026-05-25 Extension — Week + Day Views (gap-closure row #4)

> APPEND-ONLY. §1..§9 above describe the SHIPPED v1 public surface and
> stay byte-identical. §10 records the additive API delta introduced
> by the `xai-web-console-gap-closure` manifest row #4.

### 10.1 Public exports (additive)

The barrel `src/index.ts` adds:

```ts
// NEW components (extension)
export { WeekView } from "./WeekView.js";
export { DayView } from "./DayView.js";
export { TimeGrid } from "./TimeGrid.js";

// NEW props types
export type { WeekViewProps } from "./WeekView.js";
export type { DayViewProps } from "./DayView.js";
export type { TimeGridProps } from "./TimeGrid.js";

// NEW helper types (consumed by consumers who want to integrate
// custom event sources or test against fixed positioning)
export type { EventBlock } from "./internal/placeEventBlocks.js";
export type { DstShift } from "./internal/timeGridMath.js";

// NEW value re-export (typed view id for usePref consumers)
export type { CalendarViewId } from "@repo/plugin-web-storage";
```

`CalendarModule` props + `calendarSlotRegistration` shape are UNCHANGED.
`CalEvent` adds one optional field; see §10.2.

### 10.2 `CalEvent` extension (additive optional field)

```ts
export interface CalEvent {
  c: CalEventColor;                  // unchanged
  t: { en: string; zh: string };     // unchanged
  time?: string;                     // unchanged: "HH:MM" start
  /** NEW (extension): optional "HH:MM" end time. Missing → 1-hour block default. */
  endTime?: string;
}
```

**Backwards-compatibility contract:**

- All SHIPPED consumers (Month view) ignore `endTime` — Month chip
  rendering is unchanged.
- Missing `endTime` is the default; ~63 of 68 SAMPLE_EVENTS entries
  omit it.
- 5 SAMPLE_EVENTS entries gain `endTime`: day 7 yoga (19:00 → 20:00),
  day 8 content marketing (14:15 → 15:30), day 10 wiping windows
  (14:15 → 16:15), day 22 data analysis (11:00 → 13:00), day 23
  0-1 product (14:00 → 16:30). These 5 demonstrate multi-hour blocks
  in Week + Day views.
- Annotated as a controlled drift: the byte-parity with `i18n.js:509-541`
  no longer holds for the `time/endTime` field family. AC-FIXTURE-EXT-1
  asserts the new shape; AC-FIXTURE-1..6 stay as-is for the other fields.

### 10.3 `<WeekView />` props

```ts
export interface WeekViewProps {
  /** Active date (YYYY-MM-DD, UTC date key). Week is the 7-day window containing this date. */
  activeDate: string;
  /** 0 = Sun-first, 1 = Mon-first. Comes from usePref("xai_pref_week_start", 0). */
  weekStart: 0 | 1;
  lang: Lang;
  t: I18NBundle;
  /** Event source — defaults to SAMPLE_EVENTS internally if omitted. */
  events: CalEventsByDay;
  /** Optional: override "now" for tests (defaults to new Date()). */
  nowOverride?: Date;
}
```

Behaviour:
- Renders a `cal-week-day-header` with 7 weekday labels (Sun-first or
  Mon-first per `weekStart`), each labeled with date number.
- The column containing `activeDate` gets `data-active="true"`.
- The column containing today's local date (if any) gets the now-line
  overlay.
- Hour rows respect DST: spring-forward day shows 23 rows, fall-back
  shows 25 rows, with a `(DST)` label between the affected rows.

### 10.4 `<DayView />` props

```ts
export interface DayViewProps {
  /** Active date (YYYY-MM-DD). Day view always renders this single day. */
  activeDate: string;
  lang: Lang;
  t: I18NBundle;
  events: CalEventsByDay;
  nowOverride?: Date;
}
```

Behaviour:
- 1 column × 24 hour rows (or 23/25 on DST days).
- All-day strip above the scroll area.
- On mount: `useEffect` sets scroll position to current hour - viewport/2
  if activeDate === today; else sets to 8 AM workday start.

### 10.5 `<TimeGrid />` props (shared internal-ish; exported for tests + extensibility)

```ts
export interface TimeGridProps {
  /** Day buckets to render — Week passes 7, Day passes 1. */
  days: Array<{ dateKey: string; label: string; isActive: boolean; isToday: boolean }>;
  /** Event source indexed by day-of-month integer (1..31). */
  events: CalEventsByDay;
  /** "now" Date for now-line + scroll-anchor. */
  now: Date;
  lang: Lang;
}
```

This is the only abstraction-level coupling between Week + Day; both
views compose it and provide their own day arrays.

### 10.6 New `WebPrefRegistry` entry — `xai_calendar_view`

Added to `packages/plugin-web-storage/src/internal/registry.ts` at
file-tail:

```ts
export type CalendarViewId = "month" | "week" | "day";

// ---- Calendar view preference (§S8 — first-consumer xai-web-calendar #4) ---
// Persist user's last-selected calendar view across reloads. Default "month".
// Owner xai-web-calendar (first-consumer pattern; matches xai_pref_week_start
// from the SHIPPED row #12 baseline).
// proposed: false — canonical xai_calendar_* family per ADR-0007 §S8.
xai_calendar_view: {
  key: "xai_calendar_view",
  codec: "string",
  default: "month" as CalendarViewId,
  schemaVersion: 1,
  owner: "xai-web-calendar",
  category: "module",
} satisfies PrefEntry<CalendarViewId>,
```

Re-exported from `@repo/plugin-web-storage` index barrel. Calendar
consumes via `const [view, setView] = usePref("xai_calendar_view",
"month");` directly in `CalendarModule.tsx`. NO new event channel; the
in-process `usePref` bus re-renders consumers on same-tab change, and
the standard `storage` event handles cross-tab.

**Category `"module"` (NOT `"pref"`)**: this is a per-module UI state
restoration key, not a Settings toggle. Matches `xai_clock_style` /
`xai_active_board` precedent. The `xai_pref_*` family (chassis-reset
filter) does NOT capture this key.

### 10.7 Event channels

NO new event channels. NO new emit. Listen-only contract preserved:

- `useWebEventListener("web:shell:module-change", …)` — unchanged.
- AC-EVENT-7 grep test extended to scan the 5 new component files:
  `WeekView.tsx`, `DayView.tsx`, `TimeGrid.tsx`, `EventBlock.tsx`,
  `TimeGridAllDayStrip.tsx`. None import `emitWebEvent`.

### 10.8 Deep-link semantics (extension)

When `web:shell:module-change` arrives with `focusDate`:

1. Parse `focusDate` per existing v1 contract (see §2.3).
2. `setView("month")` — forces Month view (per Frozen Assumption #9).
3. `setActiveDate(focusDate)` — single source of truth for the date.
4. `setFocusedFromDeepLink(focusDate)` — preserved for `.cal-day[data-focused]`
   outline behavior in Month view.
5. Side effect: `usePref("xai_calendar_view", "month")` writes "month"
   (because `view` setter is bound to that storage key).

Why view = "month"? The mini-cal contract at `xai-web-event-bus/docs/api.md:197-198`
specifies "deep-link to a date" with no view hint. Month is the
context-providing view; users clicking a date in mini-cal want to see
where that date sits in the month, not a zoomed-in 24-hour grid. The
extension documents this in api.md §10.8 as the contract.

### 10.9 Idempotency + error semantics (extension)

- **Idempotent view toggle**: clicking the active view tab is a no-op
  (`view === next` short-circuits). No re-render of `<TimeGrid />`.
- **Idempotent `activeDate` set**: same dateKey → no setState (React's
  `Object.is` bail).
- **Malformed `xai_calendar_view` value**: if localStorage contains a
  string other than `"month" | "week" | "day"`, `usePref` returns the
  default `"month"` (registry codec validation). No throw; no warn.
- **`activeDate` parse error**: defensive default to
  `MAY_2026_ANCHOR_TODAY = "2026-05-22"` if `parseDateKey` returns
  null. (Should never happen in practice; activeDate is always set by
  internal code, never read from external input.)
- **DST table miss**: if the `dstHoursForDay` table has no entry for
  a date, default to `{ hours: 24 }`. The 2026 US Pacific transitions
  are hard-coded; future row extends to Intl.DateTimeFormat-driven
  detection. AC-DST-1..2 only cover the 2 known 2026 dates.

### 10.10 Performance contract (extension)

- **View toggle**: ≤ 50 ms p95 for `<MonthGrid /> ↔ <WeekView />`
  swap on the 68+5-event May 2026 fixture. Asserted by PB-EXT-1
  (100 iterations, retry once if flaky).
- **`placeEventBlocks`**: O(N log N) where N = events for that day.
  68 events / 31 days = ~2.2 avg events/day. Worst-case packing is
  O(N²) for full overlap; bounded by 5 events/day visible cap (from
  Month view) and ~3 events/day max overlap in fixture.
- **`weekWindowFor`**: O(1) — 7 string slices.
- **`hourToRow` / `rowsForBlock`**: O(1) — table lookup + arithmetic.
- **TimeGrid mount**: ≤ 50 ms with 24 rows × 7 cols × 5 events = 168
  DOM nodes + event blocks. No virtualization needed.

### 10.11 Accessibility contract (extension)

| Element | a11y attribute |
|---|---|
| `<button class="seg" aria-selected={view===id}>` × 3 | unchanged — Month/Week/Day |
| `.cal-week-day-header > div[role="columnheader"]` | accessible label includes date number |
| `.cal-day-column[data-active="true"]` | `aria-current="date"` |
| `.cal-event-block` | accessible name: `${time} ${endTime ?? ""} ${title}` |
| `.cal-now-line` | `aria-hidden="true"` (decorative) |
| `.cal-dst-label` | inline text, read as part of the row |

No focus management for v1 (no keyboard arrow navigation across hour
rows). Add in a future row.

### 10.12 Stability rules (extension)

- Add a new view type (e.g. "year") → extend `CalendarViewId` union →
  registry inferred type widens automatically → consumers re-compile.
  Storage codec is unchanged (still `"string"`).
- Add a new `endTime` to an event → additive; no consumer changes.
- Change `MAY_2026_ANCHOR_TODAY` constant → no API change; one-line
  edit in `CalendarModule.tsx`. Documented as the "anchor flip"
  follow-up when the SPA ages past May 2026.
- Change `HOUR_HEIGHT_PX` → CSS-token only; no API change.
- Change DST table → no API change; `dstHoursForDay` is internal.

### 10.13 Side-effect surface (extension delta)

- `usePref("xai_calendar_view", "month")` → one read + one write per
  view toggle. localStorage churn negligible.
- `useEffect` in DayView for scroll-anchor on mount — DOM mutation
  only, no storage / network.
- `useMemo` on `placeEventBlocks(events, activeDate)` per view-render.
- Zero new network calls.
- Zero new global mutations.
- ComingSoonPanel side-effects (a CSS rule `.cal-coming-soon`) are
  REMOVED from styles.css.

