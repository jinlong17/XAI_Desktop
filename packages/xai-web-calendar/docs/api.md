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
require ZH bundle parity at the bundle-object level.

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

---

## 11. 2026-05-27 Extension — Event CRUD (HC8 lift)

> APPEND-ONLY. §1..§10 above describe the SHIPPED v1 + v1.1 public
> surface and stay byte-identical. §11 records the additive API delta
> introduced by the `xai-web-calendar-event-create` feature (P0 carve-out
> per ADR-0010 §D4, see carve-out doc
> `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md`).

### 11.1 Public exports (additive)

The barrel `src/index.ts` adds:

```ts
// NEW data-layer types
export type {
  UserCalEvent,
  RecurrenceRule,
  RecurrenceKind,
  EventColorPreset,
} from "./internal/eventStore/types.js";

// NEW hook
export { useUserCalEvents } from "./internal/eventStore/useUserCalEvents.js";
export type { UserCalEventsApi } from "./internal/eventStore/useUserCalEvents.js";

// NEW component (callers may mount independently; CalendarModule mounts it by default)
export { EventComposer } from "./EventComposer.js";
export type { EventComposerProps } from "./EventComposer.js";

// NEW pure helpers (exposed for testability + future-row composition)
export { expandRecurrence } from "./internal/eventStore/expandRecurrence.js";
export {
  mergeEventsForMonth,
  mergeEventsForWindow,
} from "./internal/eventStore/mergeEventsForViewport.js";
export {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  listEvents,
} from "./internal/eventStore/eventStore.js";
```

`CalendarModule` props + `calendarSlotRegistration` shape are
UNCHANGED. `CalEvent` interface is UNCHANGED (it was the FIXTURE shape;
user events use the new `UserCalEvent` interface, which is structurally
different — see §11.2).

### 11.2 Type contracts

```ts
// internal/eventStore/types.ts

export type RecurrenceKind = "daily" | "weekly";

export interface RecurrenceRule {
  kind: RecurrenceKind;
}

export type EventColorPreset =
  | "mint"
  | "amber"
  | "blue"
  | "violet"
  | "rose";              // NEW preset; 1 additive CSS family in styles.css

export interface UserCalEvent {
  /** Opaque ID — crypto.randomUUID() in modern browsers; fallback string in jsdom. */
  id: string;
  /** Plain-text title; trimmed before persist; max ~200 chars (UI-enforced, not store-enforced). */
  title: string;
  /** "YYYY-MM-DDTHH:MM" local-clock. NO TZ suffix. */
  startISO: string;
  /** "YYYY-MM-DDTHH:MM" local-clock. >= startISO + 5 minutes. SAME DAY as startISO (multi-day out of scope). */
  endISO: string;
  /** UI color band. Default "mint" on create. */
  colorPreset: EventColorPreset;
  /** Recurrence rule (daily/weekly) or null for non-recurring. */
  recurrence: RecurrenceRule | null;
  /** ISO millisecond timestamp at create. */
  createdAt: string;
  /** ISO millisecond timestamp; bumped on every successful update. */
  updatedAt: string;
}
```

**Backwards-compatibility contract:**

- The existing `CalEvent` interface (fixture shape — `{ c, t, time?, endTime? }`) is UNCHANGED.
- `UserCalEvent` is a NEW, distinct type. It is NOT a structural subset/superset of `CalEvent`.
- The merge layer (`mergeEventsForMonth` / `mergeEventsForWindow`) projects `UserCalEvent` instances down to the legacy `CalEvent` shape that `MonthCell` / `EventBlock` already render. This way, view components do not need a schema change.
- `CalEventColor` union adds `"rose"` to the existing `mint | amber | blue | violet`. Consumers that pattern-match the union must add a default case (TypeScript will warn).

### 11.3 EventStore API (pure)

```ts
// internal/eventStore/eventStore.ts

/**
 * Pure: creates a new event in the given store with auto-generated id +
 * createdAt + updatedAt. Does NOT mutate `store`. Returns the next store
 * snapshot and the materialized event.
 *
 * @throws never — caller-provided partial is assumed pre-validated.
 *   Use validateUserCalEvent for upstream validation.
 */
export function createEvent(
  store: Record<string, UserCalEvent>,
  partial: Omit<UserCalEvent, "id" | "createdAt" | "updatedAt">,
): { next: Record<string, UserCalEvent>; created: UserCalEvent };

/**
 * Pure: applies patch on top of existing event. Bumps updatedAt.
 * Returns { next, updated:null } if id missing.
 */
export function updateEvent(
  store: Record<string, UserCalEvent>,
  id: string,
  patch: Partial<Omit<UserCalEvent, "id" | "createdAt">>,
): { next: Record<string, UserCalEvent>; updated: UserCalEvent | null };

/**
 * Pure: removes the event by id (no-op if missing). Returns next store snapshot.
 */
export function deleteEvent(
  store: Record<string, UserCalEvent>,
  id: string,
): Record<string, UserCalEvent>;

/** Pure: returns event by id or null. */
export function getEvent(
  store: Record<string, UserCalEvent>,
  id: string,
): UserCalEvent | null;

/** Pure: returns all events as an array (order = createdAt ASC, then id ASC for tie-break). */
export function listEvents(
  store: Record<string, UserCalEvent>,
): UserCalEvent[];
```

### 11.4 React hook API (consumer-facing)

```ts
// internal/eventStore/useUserCalEvents.ts

export interface UserCalEventsApi {
  /** Live snapshot of the store, reactive via usePref. */
  events: Record<string, UserCalEvent>;
  /** Array view, sorted createdAt ASC then id ASC. */
  list: UserCalEvent[];
  /** Create event, returns the new entity. Mutates underlying localStorage via setPref. */
  create: (partial: Omit<UserCalEvent, "id" | "createdAt" | "updatedAt">) => UserCalEvent;
  /** Update event, returns the updated entity or null if id missing. */
  update: (id: string, patch: Partial<Omit<UserCalEvent, "id" | "createdAt">>) => UserCalEvent | null;
  /** Remove event (no-op if missing). */
  remove: (id: string) => void;
  /** Get one event by id. */
  getById: (id: string) => UserCalEvent | null;
}

export function useUserCalEvents(): UserCalEventsApi;
```

Behaviour:

- Hook calls `usePref("xai_calendar_events", {} as Record<string, UserCalEvent>)`.
- CRUD ops invoke pure helpers above + `setPref` to persist.
- Cross-tab sync: free via `usePref`'s built-in `storage`-event listener.
- Stable identity: each render returns the same function references when `events` is unchanged (memoized via `useCallback`).

### 11.5 EventComposer component API

```ts
// EventComposer.tsx

export interface EventComposerProps {
  /** Controls visibility. */
  open: boolean;
  /** "create" = blank form (with sensible defaults); "edit" = pre-filled from `event`. */
  mode: "create" | "edit";
  /** Required when mode === "edit"; ignored otherwise. */
  event: UserCalEvent | null;
  /** Active language for STR_EVENT_COMPOSER. */
  lang: Lang;
  /** Default date for new events when mode === "create". "YYYY-MM-DD". */
  defaultDateKey?: string;
  /** Called when user clicks Save (after validation passes). */
  onSave: (event: UserCalEvent) => void;
  /** Called when user clicks Delete (mode === "edit" only). */
  onDelete?: (id: string) => void;
  /** Called when user dismisses (ESC, backdrop, Cancel). */
  onClose: () => void;
}

export function EventComposer(props: EventComposerProps): ReactElement | null;
```

Behaviour:

- Uses native `<dialog>` + `dialog.showModal()` / `dialog.close()` per `CardDetailDialog.tsx` precedent.
- Form state local to the component (not React Context).
- On open with `mode==="create"`: form fields default to:
  - title: ""
  - date: `defaultDateKey ?? today`
  - startTime: "09:00"
  - endTime: "10:00"
  - colorPreset: "mint"
  - recurrence: null
- On open with `mode==="edit"`: form pre-filled from `event` props.
- Validation runs on Save click; invalid fields display inline error messages from `STR_EVENT_COMPOSER` (bilingual).
- ESC + backdrop click + Cancel button: call `onClose` (discards changes).
- Delete button visible only in edit mode; calls `onDelete(event.id)` then `onClose`.
- A11y: `aria-modal="true"`, `aria-labelledby="event-composer-title"`, focus moves to first input on open (native `<dialog>` behavior).

### 11.6 Cross-package contracts

#### 11.6.1 New `WebPrefRegistry` entry — `xai_calendar_events`

Added to `packages/plugin-web-storage/src/internal/registry.ts` at file-tail:

```ts
// ---- Calendar events (§S8 — extension 2026-05-27 by xai-web-calendar-event-create) -----
// User-created calendar events. Indexed by event.id (UUID).
// Owner xai-web-calendar (extension to row #12 SHIPPED + gap-closure row #4 SHIPPED).
// Category "module" — NOT in the xai_pref_* chassis-reset family
// (same category as xai_calendar_view / xai_clock_style / xai_active_board per ADR-0007 §S8).
// proposed: false — canonical xai_calendar_* family per ADR-0007 §S8.
xai_calendar_events: {
  key: "xai_calendar_events",
  codec: "json",
  default: {} as Record<string, UserCalEvent>,
  schemaVersion: 1,
  owner: "xai-web-calendar",
  category: "module",
} satisfies PrefEntry<Record<string, UserCalEvent>>,
```

The `UserCalEvent` typed alias is declared in `@repo/plugin-web-calendar` and imported into `plugin-web-storage` ONLY as a type (`import type`). This is the same pattern the registry already uses for `CalendarViewId` (line 943-945).

#### 11.6.2 i18n delta — NONE

No `plugin-web-tokens` edit. All new strings live in
`packages/xai-web-calendar/src/internal/strings.ts`:

```ts
// internal/strings.ts (NEW)
export const STR_EVENT_COMPOSER = {
  title_create:    { en: "New event",        zh: "新建事件" },
  title_edit:      { en: "Edit event",       zh: "编辑事件" },
  field_title:     { en: "Title",            zh: "标题" },
  field_date:      { en: "Date",             zh: "日期" },
  field_start:     { en: "Start",            zh: "开始" },
  field_end:       { en: "End",              zh: "结束" },
  field_color:     { en: "Color",            zh: "颜色" },
  field_recurrence: { en: "Recurrence",      zh: "重复" },
  recur_none:      { en: "None",             zh: "不重复" },
  recur_daily:     { en: "Daily",            zh: "每天" },
  recur_weekly:    { en: "Weekly",           zh: "每周" },
  btn_save:        { en: "Save",             zh: "保存" },
  btn_cancel:      { en: "Cancel",           zh: "取消" },
  btn_delete:      { en: "Delete",           zh: "删除" },
  err_title_required:    { en: "Title is required",                zh: "标题不能为空" },
  err_end_before_start:  { en: "End time must be after start",     zh: "结束时间必须晚于开始" },
  err_min_duration:      { en: "Event must be at least 5 minutes", zh: "事件时长至少 5 分钟" },
  err_multi_day:         { en: "Event cannot span multiple days",  zh: "事件不能跨日" },
} as const;

export const EMPTY_STATE_HINT = {
  hint:  { en: "Click + to create your first event", zh: "点击 + 创建第一个事件" },
} as const;

export const SAMPLE_BADGE = {
  label: { en: "Sample", zh: "示例" },
} as const;
```

The `Record<string, { en: string; zh: string }>` shape ensures each declared
string key carries both EN + ZH values; AC-I18N-CREATE-3 validates runtime key
coverage.

#### 11.6.3 No event channel changes

NO new `web:*` event channel. NO new emit. Listen-only contract preserved across all new files. AC-EVENT-7 grep test extended to scan:

- `EventComposer.tsx`
- `EmptyStateHint.tsx`
- `internal/eventStore/*.ts`
- `internal/strings.ts`

None of these import `emitWebEvent`.

### 11.7 Idempotency + error semantics (extension)

- **Idempotent create with same partial**: each call produces a NEW id; if caller wants dedup they must check `getById` first. v1 allows duplicate-title events (no uniqueness constraint).
- **Idempotent update with same patch**: `Object.is`-equal patch updates updatedAt anyway (semantic: "user explicitly saved again"). Not a perf concern at v1 scale.
- **Idempotent delete missing id**: no-op; returns same store reference (callers can compare references to detect work).
- **Storage corruption**: if `xai_calendar_events` contains malformed JSON, `usePref` returns the default `{}` (registry codec validation already handles this).
- **Storage entry with unknown extra fields**: round-trip preserves them (TypeScript narrows on read but persistence is shape-preserving).
- **Composer validation errors**: surfaced inline; Save button stays enabled but does NOT call `onSave`. Composer remains open.
- **Recurrence expansion errors**: `expandRecurrence` defensively returns an empty array for malformed rules (NEVER throws into render).

### 11.8 Performance contract (extension)

| Operation | Budget | Mechanism |
|---|---|---|
| Composer open → first paint | ≤ 16 ms | Native `<dialog>` + form fields; no async |
| Save click → store update + re-render | ≤ 32 ms (incl. localStorage write) | `setPref` is synchronous; React diff scoped to changed cells |
| `expandRecurrence(daily, 30-day window)` | ≤ 1 ms | Pure date arithmetic; max 31 instances |
| `expandRecurrence(weekly, 30-day window)` | ≤ 1 ms | Max ~5 instances |
| `expandRecurrence(daily, 365-day window — future row)` | ≤ 5 ms | Bounded by maxInstances=366 |
| `mergeEventsForMonth` with 100 user events | ≤ 4 ms | Single pass over events + fixture |
| `mergeEventsForWindow` (7-day Week) with 100 events | ≤ 4 ms | Same pass |
| Viewport recompute on event create with 100 existing events | ≤ 16 ms | Memo + merge + view re-render | (PB-CREATE-1) |
| Recurrence × DST (spring-forward 09:30 daily) | render-stable | Local-clock semantics; HH:MM string stable |

### 11.9 Accessibility contract (extension)

| Element | a11y attribute |
|---|---|
| `<dialog class="event-composer">` | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="event-composer-title"` |
| `<h2 id="event-composer-title">` | accessible name = create/edit label |
| `<input>` fields | `<label htmlFor>` association; required fields marked `aria-required="true"`; error message linked via `aria-describedby` |
| Color picker chips | `role="radiogroup"` + per-chip `aria-checked` |
| Recurrence picker | `role="radiogroup"` + per-option `aria-checked` |
| Delete button | `aria-label` includes event title |
| `.cal-sample-badge` | `aria-label="Sample event — not editable"` / "示例事件 — 不可编辑" |
| Empty-state hint | `role="status"` (so screen readers announce when it appears) |

Focus management: native `<dialog>` handles focus trap. On close, focus returns to the element that opened the dialog (toolbar `+` button or the user-event chip).

### 11.10 Stability rules (extension)

- Add a new `RecurrenceKind` → extend the union → consumer recompile. `expandRecurrence` must handle the new kind or fall through to no-expansion.
- Add a new `EventColorPreset` → extend the union + add a CSS rule. Storage round-trip is unchanged (string).
- Change `UserCalEvent` shape (e.g., add `description`) → schemaVersion bump + migration entry in registry. v1 → v2 migration TBD by future row.
- Remove a field from `UserCalEvent` → BREAKING. Requires deprecation in api.md + 1-cycle warning + migration.
- Change persistence key name → BREAKING. Requires migration. (Not foreseen.)
- Change EventComposer prop shape → BREAKING for external consumers; minor for internal callers.

### 11.11 Side-effect surface (extension delta)

- `usePref("xai_calendar_events", {})` → one read per consumer; one write per CRUD op. localStorage churn proportional to user activity (negligible at v1 scale).
- `crypto.randomUUID()` → only in `createEventId`. Falls back if undefined.
- Native `<dialog>.showModal()` / `.close()` → DOM-only.
- `useEffect` in `EventComposer` for open/close imperative wiring (mirrors `CardDetailDialog`).
- Zero new network calls.
- Zero new global mutations.
- Zero new event channels.

### 11.12 Build artifacts

- TypeScript-only (no transpile step beyond Vite/Vitest).
- ESM imports throughout (`.js` extension on internal imports).
- `package.json` `"sideEffects"` unchanged (still `["./src/styles.css", "./src/index.ts"]`).
- Bundled by Vite when consumed in `apps/web`.

### 11.13 Versioning

- Package bumps to `0.2.0` (minor — additive types + components).
- `manifest.json` status STAYS `Production` (this extension does not regress; if reviewer prefers, status may be flipped to `In-Dev` during the build window and back to `Production` at ship — TBD by feature-review).
