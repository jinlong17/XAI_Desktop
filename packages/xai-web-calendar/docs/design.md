# Design Snapshot — xai-web-calendar

> Plugin: `@repo/plugin-web-calendar` · Directory: `packages/xai-web-calendar/`
> Roadmap row #12 (Wave W2 · Module · Calendar)
> Seed brief: docs/reviews/xai-web-calendar/20260523-roadmap-seed.md
> Discovery review: docs/reviews/xai-web-calendar/20260523-discovery-review.md
> ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map)
> Source PRD: web design/DESIGN.md §4.5 (Calendar)
> Source prototype: `web design/module-calendar.jsx`

## 1. Decision snapshot

### 1.1 Frozen assumptions (14)

Carried verbatim from `discovery-review.md` §4.

1. Directory = `packages/xai-web-calendar/`; package = `@repo/plugin-web-calendar`.
2. v1 ships **read-only** Month view + Week/Day "coming soon" placeholder.
3. Sample event data inlined as `SAMPLE_EVENTS` (no storage); banner
   keeps the "Sample data — switch to real account" copy.
4. Event color classes are exactly `ev-mint`, `ev-amber`, `ev-blue`,
   `ev-violet`. The 4 oklch values come byte-for-byte from
   `web design/layout.css:849-852` (mint=165, amber=70, blue=245, violet=295).
5. Deep-link in via `web:shell:module-change` channel,
   `moduleId === "calendar"` filter, `focusDate?: string` payload.
6. Week-start via `usePref("xai_pref_week_start", 0)` — new registry
   entry, owner = `xai-web-calendar`, default 0 (Sunday).
7. `displayedMonth` state initializes to `{year: 2026, month: 5}`;
   `today` button resets to that anchor; `<` / `>` step ±1 month.
8. Today-marker derived once via `useMemo(() => utcDateKey(new Date()),
   [])` — out-of-month days never get the today-pill.
9. ISO week numbers via a pure `isoWeekNumber(date): number` helper.
10. Holidays = `cal.holiday_mayday` + `cal.holiday_mothers_day` i18n
    keys (additive); table-driven detection per (year, month, day).
11. Slot registration via `WebModuleSlotRegistration` from
    `@repo/xai-web-shell` — replaces `shellRegistrations.tsx:55`.
12. i18n deltas additive to `@repo/plugin-web-tokens`: `cal.coming_soon`,
    `cal.holiday_mayday`, `cal.holiday_mothers_day`.
13. v1 does NOT register a new event channel. Listen-only consumer.
14. Sibling concurrent writes confined to: `shellRegistrations.tsx`
    line 55 + `apps/web/package.json` (single dep line) + i18n
    bundle additive keys. No `packages/core/` edits.

### 1.2 Out of scope (v1)

- Create / edit / delete events.
- Recurring events, RSVPs, attendees, external sync (Google / iCloud).
- Day view + Week view functional surface (placeholder only).
- Cross-tab broadcast on deep-link.
- Time-zone display preferences.

## 2. Dependency overview

```
@repo/plugin-web-calendar (this package)
├── @repo/core (workspace:*)
│   └── types: WebModuleId, EventMap (web:shell:module-change channel)
├── @repo/plugin-web-tokens (workspace:*)
│   ├── useI18n(lang): { t, s }
│   ├── type Lang
│   └── i18n bundle keys: cal.month/week/day/today/sample_banner/
│       coming_soon/holiday_mayday/holiday_mothers_day, nav.calendar,
│       common.upgrade, weekdays_short
├── @repo/plugin-web-storage (workspace:*)
│   ├── usePref<K>(key, defaultOverride?): [v, setV, meta]
│   └── PREF_REGISTRY entry: xai_pref_week_start
├── @repo/xai-web-event-bus (workspace:*)
│   └── useWebEventListener("web:shell:module-change", handler)
└── @repo/xai-web-shell (workspace:*)
    ├── type WebModuleSlotRegistration
    └── useWebShell(): { lang, ... }
```

No reverse imports. No `@repo/core` edits this row. All other
dependencies are Stable per `docs/PLUGIN_MAP.md`.

## 3. Component composition

```
CalendarModule (props: lang)
├── CalendarToolbar (props: lang, view, onViewChange, displayedMonth,
│                    onPrevMonth, onNextMonth, onResetToday)
│   ├── icon-btn (list)
│   ├── h1.module-title (formatMonthTitle(year, month, lang))
│   ├── icon-btn (plus, no-op v1)
│   ├── .seg [day/week/month] — view state
│   ├── icon-btn (arrowL) → onPrevMonth
│   ├── btn.ghost.btn-today → onResetToday
│   ├── icon-btn (arrowR) → onNextMonth
│   └── icon-btn (dots, no-op v1)
├── MonthGrid (props: year, month, weekStart, lang, today, focusedDate,
│              events) — visible when view === "month"
│   ├── WeekdayHeader (weekStart, lang)
│   │   └── .cal-weekday × 7
│   └── .cal-rows
│       └── MonthRow (cells, ri, lang) × {5|6}
│           └── MonthCell (cell, lang, today, focusedDate) × 7
│               ├── .cal-day-head
│               │   ├── .cal-week-num (cells[0] only)
│               │   ├── .cal-day-num (today wraps in .today-pill)
│               │   └── .cal-holiday (when cell.holidayKey set)
│               └── .cal-events
│                   ├── .cal-event.ev-{c} × min(events.length, 5)
│                   └── .cal-more (when events.length > 5)
├── ComingSoonPanel (lang) — visible when view !== "month"
└── CalendarBanner (lang)
    ├── Icon (star)
    ├── span (cal.sample_banner)
    └── button.banner-upgrade (common.upgrade)
```

## 4. Data model

### 4.1 Event chip

```ts
// internal/sampleEvents.ts
export type CalEventColor = "mint" | "amber" | "blue" | "violet";

export interface CalEvent {
  /** Color band class. */
  c: CalEventColor;
  /** Bilingual title. */
  t: { en: string; zh: string };
  /** Optional HH:MM clock string. */
  time?: string;
}

/** Day-of-month → events. Day 14 + 31 are empty arrays per source. */
export type CalEventsByDay = Record<number, CalEvent[]>;
```

`SAMPLE_EVENTS` is a typed constant transcribed byte-for-byte from
`web design/i18n.js:509-541`. The transcription preserves order, color
codes, and bilingual strings exactly. Reviewer-verifiable diff lives in
`api.md` §1.2.

### 4.2 Grid cell

```ts
// internal/monthGridCells.ts
export interface MonthCellData {
  /** Day-of-month integer (1-31). */
  d: number;
  /** True iff the cell belongs to the displayed month (vs leading/trailing pad). */
  inMonth: boolean;
  /** ISO date string YYYY-MM-DD (UTC). */
  dateKey: string;
  /** ISO week number — populated only on the week-start column (ci === 0). */
  weekNum?: number;
  /** Optional i18n key for the holiday label, e.g. "cal.holiday_mayday". */
  holidayKey?: string;
}

/** Returns a flat array of cells, length = 35 or 42 (rounded up to ×7). */
export function monthGridCells(
  year: number,
  month: number,        // 1..12
  weekStart: 0 | 1,     // 0=Sun, 1=Mon
): MonthCellData[];
```

### 4.3 View state (in `CalendarModule`)

```ts
type CalendarView = "month" | "week" | "day";

interface CalendarModuleState {
  view: CalendarView;                          // local useState
  displayedMonth: { year: number; month: number };
  focusedDate: string | null;                  // from deep-link
}
```

`view` defaults to `"month"`. `displayedMonth` defaults to
`{ year: 2026, month: 5 }`. `focusedDate` defaults to `null` and is set
when the deep-link handler fires.

## 5. State + persistence

### 5.1 Week-start preference

```ts
// usage in registration host
const [weekStart] = usePref("xai_pref_week_start", 0);
// 0 = Sun, 1 = Mon
```

The registry entry added in `plugin-web-storage/src/internal/registry.ts`:

```ts
xai_pref_week_start: {
  key: "xai_pref_week_start",
  codec: "number",
  default: 0,                     // Sunday
  schemaVersion: 1,
  owner: "xai-web-calendar",      // first consumer claims ownership; Settings W4 may transfer later
  category: "pref",
  // proposed: false — canonical name approved by worker brief #12 + ADR-0007 §S8 xai_pref_* family
} satisfies PrefEntry<0 | 1>,
```

Values are typed as the union `0 | 1` so consumers get exhaustiveness
checks. (The registry `default: 0` literal narrows correctly when
inferred.) Future expansion to other ISO weekday integers is a
schema-version-bump.

### 5.2 No event storage

v1 keeps events as a typed constant `SAMPLE_EVENTS`. No `usePref` /
storage edits beyond `xai_pref_week_start`.

## 6. Pure helpers (under `src/internal/`)

### 6.1 Date keys

```ts
// internal/dateKeys.ts
export function pad2(n: number): string;
export function utcDateKey(d: Date): string;          // "YYYY-MM-DD"
export function isLeapYear(year: number): boolean;
export function daysInMonth(year: number, month: number): number;
```

`utcDateKey` always uses `getUTCFullYear/Month/Date` so DST is irrelevant.

### 6.2 ISO week number

```ts
// internal/isoWeekNumber.ts
/**
 * Returns the ISO 8601 week number (1..53) for the given date.
 * Algorithm: shift to Thursday of the current week, then 1 + floor((thursday - jan4) / 7 days).
 */
export function isoWeekNumber(date: Date): number;
```

Per `discovery-review.md` §2.4. Verified by inspection that ISO 8601
yields W18-W22 for May 2026 (Mon-first), W17-W21 for May 2026 Sunday-
first — both match the prototype labels.

### 6.3 Month grid

```ts
// internal/monthGridCells.ts
export function monthGridCells(
  year: number,
  month: number,
  weekStart: 0 | 1,
): MonthCellData[];
```

Algorithm:

1. Compute `firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()`
   (0 = Sun).
2. Compute `leadingPad = (firstDow - weekStart + 7) % 7`.
3. Compute `numDays = daysInMonth(year, month)`.
4. Compute `totalCells = ceil((leadingPad + numDays) / 7) * 7`. Always
   35 or 42.
5. Emit cells in order: leading pad days from previous month
   (`inMonth: false`), then 1..numDays (`inMonth: true`), then trailing
   pad days from next month (`inMonth: false`).
6. Attach `weekNum` only on cells where the cell index modulo 7 is
   `0` (week-start column). Computed via `isoWeekNumber` of that cell's
   date.
7. Attach `holidayKey` via the lookup table in §6.4.

### 6.4 Holiday table

```ts
// internal/holidays.ts
export type HolidayEntry = {
  year: number;
  month: number; // 1..12
  day: number;
  i18nKey: string; // "cal.holiday_mayday" | "cal.holiday_mothers_day"
};

export const HOLIDAYS: ReadonlyArray<HolidayEntry> = [
  { year: 2026, month: 5, day: 1, i18nKey: "cal.holiday_mayday" },
  { year: 2026, month: 5, day: 9, i18nKey: "cal.holiday_mothers_day" },
];

export function findHolidayKey(year: number, month: number, day: number): string | undefined;
```

Table-driven so future months / years add rows without touching grid
logic.

### 6.5 Weekday header labels

```ts
// internal/weekdays.ts
/** Returns a 7-element array of short weekday labels, starting at weekStart. */
export function weekdayLabels(
  weekdaysShort: readonly string[], // length 7, Sun..Sat
  weekStart: 0 | 1,
): readonly [string, string, string, string, string, string, string];
```

Source bundle (`@repo/plugin-web-tokens`) exposes `weekdays_short` as
`["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]` per i18n.ts:32. We
rotate the array by `weekStart`.

### 6.6 Month title formatter

```ts
// internal/formatMonth.ts
/**
 * EN: "May 2026"; ZH: "2026 年 5 月".
 * Uses common.{jan..dec} bundles for EN month names.
 */
export function formatMonthTitle(year: number, month: number, lang: Lang, t: I18NBundle): string;
```

## 7. Event emit / listen surface

### 7.1 Listen-only

```ts
// CalendarModule.tsx (inside the component body)
useWebEventListener("web:shell:module-change", (payload) => {
  if (payload.moduleId !== "calendar") return;
  if (!payload.focusDate) return;
  const [y, m] = payload.focusDate.split("-").map(Number);
  if (y !== displayedMonth.year || m !== displayedMonth.month) {
    setDisplayedMonth({ year: y, month: m });
  }
  setFocusedDate(payload.focusDate);
}, [displayedMonth.year, displayedMonth.month]);
```

`focusedDate` is reset to `null` whenever the user clicks `<` / `>` /
`today` (so the highlight pill follows the deep-link only until the
user explicitly navigates). Verified by AC-DEEPLINK-3.

### 7.2 No emit

`emitWebEvent` is NOT called from this module. AC-EVENT-7 asserts at
test time that no `web:*` event is emitted from the calendar.

## 8. Slot registration

```ts
// registration.tsx
import { useWebShell, type WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { CalendarModule } from "./CalendarModule.js";

function CalendarSlotHost() {
  const { lang } = useWebShell();
  return <CalendarModule lang={lang} />;
}

export const calendarSlotRegistration: WebModuleSlotRegistration = {
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
};
```

## 9. Styles (tokens-only)

`styles.css` extends the existing `cal-*` class system from
`web design/layout.css` lines 800-880, with these additions:

- `.cal-day[data-focused="true"]` — adds an `outline: 2px solid
  var(--accent)` for the deep-link target cell.
- `.cal-coming-soon` — centered "coming soon" panel matching the
  `.cal-grid.panel` outer container (same border-radius, padding) but
  empty grid body.

All colors use existing tokens (`--mint*`, `--amber*`, `--blue*`,
`--violet*` — none of these are renamed). Event chip colors come
byte-for-byte from `web design/layout.css:849-852`:

```css
.cal-event.ev-mint   { background: oklch(94% 0.04 165); color: oklch(38% 0.10 165); border-left-color: oklch(58% 0.10 165); }
.cal-event.ev-amber  { background: oklch(94% 0.04 70);  color: oklch(40% 0.10 60);  border-left-color: oklch(65% 0.13 70); }
.cal-event.ev-blue   { background: oklch(94% 0.04 245); color: oklch(40% 0.10 245); border-left-color: oklch(60% 0.12 245); }
.cal-event.ev-violet { background: oklch(94% 0.04 295); color: oklch(40% 0.10 295); border-left-color: oklch(60% 0.12 295); }
```

Dark-theme overrides match `web design/layout.css:853-856`.

## 10. Public surface

```ts
// src/index.ts
export { CalendarModule } from "./CalendarModule.js";
export { calendarSlotRegistration } from "./registration.js";
export type { CalendarModuleProps } from "./types.js";
export type { CalEvent, CalEventColor, CalEventsByDay } from "./internal/sampleEvents.js";
export type { MonthCellData } from "./internal/monthGridCells.js";
import "./styles.css";
```

The `import "./styles.css"` is a side-effect import; declared in
`package.json` `"sideEffects": ["./src/styles.css", "./src/index.ts"]`.

## 11. Acceptance traceability

| Seed brief signal | Mechanism | AC IDs |
|---|---|---|
| Month view renders for May 2026 | `MonthGrid` + `monthGridCells` | AC-RENDER-1..6, AC-GRID-1..7 |
| Events display in 4 colors | `SAMPLE_EVENTS` + `ev-{c}` class + tokens.css | AC-EVENT-1..6, AC-TOKENS-1..2 |
| Deep-link from MiniCal lands on the correct day | `useWebEventListener` + `focusedDate` state + `data-focused` attribute | AC-DEEPLINK-1..5 |
| View switcher renders all 3 tabs | `CalendarToolbar` + `.seg` + ARIA | AC-VIEW-1..3 |
| Week/Day "Coming soon" placeholder | `ComingSoonPanel` | AC-VIEW-4..5 |
| EN/中文 parity | `useI18n(lang)` + bilingual title objects | AC-I18N-1..7 |
| Respects week-start preference | `usePref` + `monthGridCells(weekStart)` | AC-WEEKSTART-1..3 |
| All 4 oklch values come from tokens.css | `styles.css` byte-parity test | AC-TOKENS-1..2 |

## 12. Sequence — deep-link flow

```
User clicks May 23 in Dashboard MiniCal
└── plugin-web-dashboard emits web:shell:module-change
    { moduleId: "calendar", focusDate: "2026-05-23",
      source: "mini-cal" }

xai-web-shell route layer sees moduleId="calendar"
└── navigates to /app/calendar

CalendarModule mounts (or re-renders if already mounted)
└── useWebEventListener captures payload
    └── displayedMonth = (2026, 5) → no change
    └── setFocusedDate("2026-05-23")
    └── MonthGrid re-renders with cell[Mday=23] data-focused="true"
    └── .cal-day[data-focused] outline visible

User clicks > (next month)
└── setDisplayedMonth({2026, 6})
└── setFocusedDate(null)
└── outline disappears
```

## 13. Touched files (build estimate)

**New** (24 files):

- `packages/xai-web-calendar/package.json`
- `packages/xai-web-calendar/tsconfig.json`
- `packages/xai-web-calendar/manifest.json`
- `packages/xai-web-calendar/vitest.config.ts`
- `packages/xai-web-calendar/eslint.config.js`
- `packages/xai-web-calendar/src/index.ts`
- `packages/xai-web-calendar/src/types.ts`
- `packages/xai-web-calendar/src/styles.css`
- `packages/xai-web-calendar/src/CalendarModule.tsx`
- `packages/xai-web-calendar/src/CalendarToolbar.tsx`
- `packages/xai-web-calendar/src/MonthGrid.tsx`
- `packages/xai-web-calendar/src/WeekdayHeader.tsx`
- `packages/xai-web-calendar/src/MonthRow.tsx`
- `packages/xai-web-calendar/src/MonthCell.tsx`
- `packages/xai-web-calendar/src/ComingSoonPanel.tsx`
- `packages/xai-web-calendar/src/CalendarBanner.tsx`
- `packages/xai-web-calendar/src/registration.tsx`
- `packages/xai-web-calendar/src/internal/dateKeys.ts`
- `packages/xai-web-calendar/src/internal/isoWeekNumber.ts`
- `packages/xai-web-calendar/src/internal/monthGridCells.ts`
- `packages/xai-web-calendar/src/internal/sampleEvents.ts`
- `packages/xai-web-calendar/src/internal/holidays.ts`
- `packages/xai-web-calendar/src/internal/weekdays.ts`
- `packages/xai-web-calendar/src/internal/formatMonth.ts`
- `packages/xai-web-calendar/src/internal/icons.tsx`

**Modified** (3 files — additive only):

- `apps/web/src/routes/modules/shellRegistrations.tsx` — replace line 55
  placeholder with `calendarSlotRegistration` import + reference. Plus
  add the import line (line ~26 region).
- `apps/web/package.json` — add `"@repo/plugin-web-calendar":
  "workspace:*"` to dependencies. Single line.
- `packages/plugin-web-storage/src/internal/registry.ts` — append
  `xai_pref_week_start` entry at file-tail.
- `packages/plugin-web-tokens/src/i18n.ts` — additive keys
  `cal.coming_soon`, `cal.holiday_mayday`, `cal.holiday_mothers_day`
  in both `en` + `zh` bundles. 6 lines.

**Test files** (in `src/__tests__/`):

- See `test.md` §3 for the full list. ~14 test files.

## 14. Architectural risk: none

- No `packages/core/` edit (deep-link channel pre-declared at events.ts:175).
- No new event channel; listen-only.
- No `manifest.json` routing changes (slot pattern).
- No cross-feature contract drift (MiniCal emit-side is owned by future
  dashboard row #11; this row only specifies the listen-side contract,
  which is already approved by `xai-web-event-bus/docs/api.md:197-198`).

---

## 2026-05-25 Extension: Week + Day Views (gap-closure row #4)

> APPEND-ONLY. §1..§14 above describe the SHIPPED v1 (Month-only +
> ComingSoonPanel) state and are NOT mutated by this extension. This
> §15 records the design delta introduced by the
> `xai-web-console-gap-closure` manifest row #4 (Gap 3 — real Week +
> Day view bodies).
>
> Pattern reference: `packages/xai-web-ai-chat/docs/design.md` §2026-05-25
> Extension (gap-closure row #2, also extension-of-SHIPPED).

### 15.1 Decision header

| Field | Value |
|---|---|
| Selected Option | **A1 + B1 + C1 + D + E1** per discovery review §2 |
| Discovery review | `docs/reviews/xai-web-calendar-week-day-views/20260525-discovery-review.md` |
| Review date | 2026-05-25 |
| Roadmap row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #4 (W1) |
| Source brief | `docs/reviews/xai-web-calendar-week-day-views/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure) |
| ADR amendment | None (no CSP impact, no new package) |
| Target packages | `packages/xai-web-calendar/src/` (new components + state refactor + fixture endTime additions) + `packages/plugin-web-storage/src/internal/registry.ts` (+1 entry `xai_calendar_view`) |
| Last updated | 2026-05-25 |

### 15.2 Frozen assumptions (this extension; lock at plan acceptance)

Carried from `discovery-review.md` §4 (decisions A1..E1) + planner
recommendations Q1..Q10:

1. **`CalEvent.endTime?: "HH:MM"`** — OPTIONAL ADDITIVE field. Missing
   `endTime` → default block height = 1 hour starting at `time`. Used
   only by Week/Day views; Month view ignores `endTime` (chip layout
   unchanged).
2. **Hour rows in local clock time.** Grid is 24 rows by default,
   labeled `"00"`..`"23"` per the browser's `getHours()`. DST days have
   23 (spring-forward) or 25 (fall-back) rows with an explicit "(DST)"
   label between the affected rows. The 2 known 2026 transitions
   (US Pacific): Mar 8 spring-forward (23 rows; skip 02:00 → 03:00),
   Nov 1 fall-back (25 rows; 01:00 appears twice).
3. **`activeDate: string` single source of truth.** Refactored
   `CalendarModule` state: `(view, activeDate, focusedFromDeepLink)`
   replaces `(view, displayedMonth, focusedDate)`. `displayedMonth` is
   DERIVED via `parseDateKey(activeDate)`. `focusedFromDeepLink` is the
   renamed `focusedDate` — still set ONLY by deep-link payload, still
   rendered ONLY as the Month view's `.cal-day[data-focused]` outline.
4. **External behavior preserved.** Toolbar title, weekday header,
   today-pill, deep-link receive, week-start preference all stay
   byte-identical. All 90 existing tests stay green. Refactor verified
   green at every commit boundary in P1.
5. **New persistence key `xai_calendar_view`** — codec `"string"`,
   default `"month"`, category `"module"`, owner `"xai-web-calendar"`,
   schemaVersion 1. Values: `"month" | "week" | "day"`. Registered as
   the typed `CalendarViewId` alias re-exported from
   `@repo/plugin-web-storage`. **NOT** in the `xai_pref_*` family
   (Settings W4 chassis-resetAllPrefs does NOT touch it).
6. **Shared `<TimeGrid />` component.** Single component used by Week
   (`columns={7}`) and Day (`columns={1}`). Owns:
   - 24-row scaffold (with DST overrides)
   - Local-tz hour labels
   - All-day strip (sticky above scrollable area)
   - Now-line at current hour (only on today's column)
   - Event-block positioning via `placeEventBlocks` pure helper
7. **Pure `placeEventBlocks(events, dayKey, dst)` helper.** Returns
   positioned `EventBlock[]` with `{ event, startRow, rowSpan, col,
   colSpan }`. Side-by-side packing for overlapping events:
   greedy first-fit into N columns; AC-PLACE-1..4 covers 1-3 overlapping
   events + all-day separation.
8. **Center-date preservation across views.** `activeDate` is preserved
   verbatim across view toggles. The "centered" UX:
   - Month: activeDate's month is the displayed month; activeDate's day
     gets the today-pill IF activeDate is the real local-tz today (else
     no special pill).
   - Week: 7-day window contains activeDate; activeDate's column gets
     `data-active="true"` outline.
   - Day: trivially activeDate.
9. **Deep-link forces Month view.** When `web:shell:module-change`
   arrives with `focusDate`, set `view = "month"` (in addition to
   updating `activeDate` and `focusedFromDeepLink`). User mental
   model: "click date in mini-cal → see month context." Existing v1
   behavior is preserved (Month was the only view, so this is implicit;
   the extension makes it explicit).
10. **Toggle-switch perf budget 50 ms.** PB-EXT-1 test asserts p95 of
    100 view-toggle iterations on the 68-event May 2026 fixture
    (+ 5 events with `endTime` for multi-hour rendering) < 50 ms. If
    flaky on slow CI, retry once (precedent: cmdk PB1).
11. **No new event channel.** Calendar stays listen-only. AC-EVENT-7
    grep test extended to confirm the new `WeekView`, `DayView`,
    `TimeGrid` files also have zero `emitWebEvent` imports.
12. **No new ADR.** No CSP impact, no new external dep, no new event
    channel. Extension fits inside ADR-0007 §S4 (port-map) +
    ADR-0007 §S8 (persistence prefix family) + ADR-0009 §D2-G3
    (P0 gap-closure).

### 15.3 Out of scope (extension v1)

- Drag-to-resize event blocks (Week/Day) — Future row.
- Click-to-create event in empty hour slot — Future row.
- Inline event editing — Future row (no editing UI at all in v1, per HC8).
- Multi-day events (events spanning > 24 hours) — Future row.
- Recurring event preview rendering — Future row.
- Time-zone DISPLAY preference (user picks a tz different from browser local) — Future row.
- Mini-cal-style Week navigation arrows separate from Month navigation
  (Week uses the SAME `<` `>` arrows as Month — stepping ±7 days when
  view === "week", ±1 day when view === "day", ±1 month when view ===
  "month"). AC-NAV-EXT-1..3 cover.
- Lazy-virtualization of the 24-row grid — 24 rows × 7 cols = 168 DOM
  nodes max; well below virtualization threshold.

### 15.4 Component composition (extension)

```
CalendarModule (extended)
├── CalendarToolbar (unchanged — wires onPrev/onNext/onToday differently per view)
├── view === "month"
│   └── MonthGrid (UNCHANGED)
├── view === "week"
│   └── WeekView                                    NEW
│       └── TimeGrid columns=7                      NEW (shared)
│           ├── TimeGridAllDayStrip (sticky)        NEW
│           ├── TimeGridHourLabels                  NEW
│           ├── TimeGridDayColumn × N               NEW
│           │   ├── TimeGridHourRow × {23|24|25}    NEW
│           │   └── EventBlock × M (positioned)     NEW
│           └── TimeGridNowLine (today's col only)  NEW
├── view === "day"
│   └── DayView                                     NEW
│       └── TimeGrid columns=1                      NEW (shared)
└── CalendarBanner (UNCHANGED)
```

`MonthGrid`, `CalendarToolbar`, `CalendarBanner`, `MonthCell`,
`MonthRow`, `WeekdayHeader`, all `internal/*` helpers EXCEPT
`monthGridCells.ts` stay byte-identical. `monthGridCells.ts` is unchanged
(consumed only by MonthGrid).

### 15.5 New file plan (delta over SHIPPED)

```
packages/xai-web-calendar/
├── src/
│   ├── CalendarModule.tsx                    — MODIFY: state refactor (activeDate + focusedFromDeepLink); add xai_calendar_view usePref; pick WeekView/DayView when view !== "month"; remove ComingSoonPanel import
│   ├── CalendarToolbar.tsx                   — MODIFY: onPrev/onNext step amount depends on view (±1 month | ±7 day | ±1 day); "today" resets activeDate to MAY_2026_ANCHOR_TODAY
│   ├── ComingSoonPanel.tsx                   — DELETE (replaced by real WeekView/DayView)
│   ├── WeekView.tsx                          — NEW: wraps TimeGrid columns=7 with 7-day window from activeDate + weekStart
│   ├── DayView.tsx                           — NEW: wraps TimeGrid columns=1 with single day from activeDate
│   ├── TimeGrid.tsx                          — NEW: shared 24-row scaffold + positioned event blocks
│   ├── TimeGridAllDayStrip.tsx               — NEW (internal-to-TimeGrid)
│   ├── TimeGridHourRow.tsx                   — NEW (internal-to-TimeGrid)
│   ├── TimeGridDayColumn.tsx                 — NEW (internal-to-TimeGrid)
│   ├── EventBlock.tsx                        — NEW: renders one positioned event block
│   ├── types.ts                              — MODIFY: + CalendarView already has "week" | "day"; no change. + DayBucket type for TimeGrid
│   ├── styles.css                            — MODIFY (additive): .cal-time-grid, .cal-week-day, .cal-day-column, .cal-hour-row, .cal-hour-label, .cal-event-block, .cal-now-line, .cal-allday-strip, .cal-dst-label
│   ├── internal/
│   │   ├── sampleEvents.ts                   — MODIFY: + endTime field on ~5 demo events (day 7 yoga 19:00→20:00; day 8 content marketing 14:15→15:30; day 10 wiping windows 14:15→16:15; day 22 data analysis 11:00→13:00; day 23 0-1 product 14:00→16:30). Annotated as local additions (NOT byte-parity with i18n.js for endTime field).
│   │   ├── timeGridMath.ts                   — NEW: HOUR_HEIGHT_PX, parseHHMM, hourToRow, rowsForBlock, dstHoursForDay
│   │   ├── placeEventBlocks.ts               — NEW: pure greedy first-fit packing → EventBlock[]
│   │   ├── weekWindow.ts                     — NEW: weekWindowFor(activeDate, weekStart) → 7 date keys
│   │   └── parseDateKey.ts                   — NEW: "YYYY-MM-DD" → { year, month, day } strict parse
│   └── __tests__/
│       ├── timeGridMath.test.ts              — NEW: 12 cases (parseHHMM, hourToRow, DST hour-count for Mar 8/Nov 1 2026, midnight boundary)
│       ├── placeEventBlocks.test.ts          — NEW: 10 cases (1-event, 2-stack overlap, 3-stack overlap, all-day separation, missing endTime → 1hr, spans midnight handling)
│       ├── weekWindow.test.ts                — NEW: 8 cases (Sun-first week containing 2026-05-22; Mon-first week; month-rollover Apr 29 + May 1; year-rollover Dec 31)
│       ├── parseDateKey.test.ts              — NEW: 6 cases (valid, malformed, out-of-range month, out-of-range day, leap-year Feb 29, year edge)
│       ├── WeekView.test.tsx                 — NEW: 14 cases (renders 7 columns + 24 rows + all-day strip + multi-hour block (9-11) is single rectangle + DST Mar 8 spring-forward 23 rows + DST Nov 1 fall-back 25 rows + week-start Sun + week-start Mon + today's column has now-line + activeDate column has data-active + event titles in EN+ZH)
│       ├── DayView.test.tsx                  — NEW: 10 cases (renders 1 column + 24 rows + all-day strip + multi-hour blocks + scroll-to-current-hour on mount when activeDate=today + scroll-to-8am otherwise + EN+ZH titles + DST + now-line)
│       ├── TimeGrid.test.tsx                 — NEW: 8 cases (shared scaffolding tests; reused by Week + Day)
│       ├── CalendarModule.viewtoggle.test.tsx — NEW: 12 cases (toggle Month → Week → Day → Month preserves activeDate; pill switches aria-selected; ComingSoonPanel REMOVED from DOM; persistence round-trip via xai_calendar_view; deep-link sets view=month; reload restores last view)
│       ├── perfBudget.test.ts                — NEW: 1 case (PB-EXT-1: 100 iterations of toggle Month→Week with 68+5-event fixture, p95 < 50 ms)
│       ├── CalendarModule.activedate.test.tsx — NEW: 8 cases (state-refactor regression: activeDate single-source-of-truth; displayedMonth derived; today reset behavior; nav arrows step ±1 month / ±7 day / ±1 day per view)
│       ├── sampleEvents.test.ts              — MODIFY: + AC-FIXTURE-EXT-1 (assert 5 events have endTime; assert endTime > time string-compare; assert endTime missing on all other events)
│       └── events.test.ts                    — MODIFY: extend grep to ALSO scan WeekView.tsx, DayView.tsx, TimeGrid.tsx, EventBlock.tsx — AC-EVENT-7 invariant preserved across new files

packages/plugin-web-storage/
└── src/internal/registry.ts                  — MODIFY: + 1 new entry xai_calendar_view (CalendarViewId = "month"|"week"|"day"); + export CalendarViewId type alias near line ~80 (with other type aliases)
```

### 15.6 State machine update

```
                       ┌────── view toggle ──────────────┐
                       │                                 ▼
                  [ activeDate stays ]              setView(next) → setPref(xai_calendar_view, next)
                                                          │
                                                          ▼
                                                    re-render:
                                                      view === "month" → <MonthGrid …/>
                                                      view === "week"  → <WeekView activeDate={…} weekStart={…} events={…} />
                                                      view === "day"   → <DayView activeDate={…} events={…} />

   Deep-link arrives ──► parseFocusDate(focusDate) ──► setView("month") + setActiveDate(focusDate) + setFocusedFromDeepLink(focusDate)

   Nav arrows: onPrev/onNext step ±1 month (view=month) | ±7 day (view=week) | ±1 day (view=day)
   "Today" button: setActiveDate(MAY_2026_ANCHOR_TODAY) — view UNCHANGED
```

### 15.7 Pure helper signatures (new)

```ts
// internal/parseDateKey.ts
export function parseDateKey(key: string): { year: number; month: number; day: number };
export function formatDateKey(year: number, month: number, day: number): string;
export function stepDateKey(key: string, deltaDays: number): string;
export function dateKeyMonth(key: string): { year: number; month: number };

// internal/weekWindow.ts
/** Returns 7 date keys starting at the week-start day containing `activeDate`. */
export function weekWindowFor(activeDateKey: string, weekStart: 0 | 1): string[];

// internal/timeGridMath.ts
export const HOUR_HEIGHT_PX = 48;
/** Parse "HH:MM" → { hours, minutes }. Returns null on malformed input. */
export function parseHHMM(s: string): { hours: number; minutes: number } | null;
/** Returns row index 0..(N-1) where N = hours-for-day. */
export function hourToRow(hours: number, minutes: number, dst?: DstShift): number;
/** Returns row span (≥ 1) for an event with start+endTime. */
export function rowsForBlock(startHHMM: string, endHHMM: string | undefined, dst?: DstShift): number;
/** Returns 23 | 24 | 25 for the given local date key (uses 2026 US Pacific table for v1; future row may consult Intl.DateTimeFormat). */
export function dstHoursForDay(dateKey: string): { hours: 23 | 24 | 25; shift?: DstShift };
export interface DstShift { kind: "spring-forward" | "fall-back"; atRow: number; }

// internal/placeEventBlocks.ts
export interface EventBlock {
  event: CalEvent;
  /** Row 0..(N-1) where the block starts. */
  startRow: number;
  /** Row count, ≥ 1. */
  rowSpan: number;
  /** Column 0..(cols-1) for side-by-side packing. */
  col: number;
  /** Total cols used at this row (for CSS grid spanning). */
  colSpan: number;
  /** True if this is an all-day event (no `time` field) — render in strip. */
  allDay: boolean;
}
export function placeEventBlocks(
  events: CalEvent[],
  dateKey: string,
): EventBlock[];
```

### 15.8 Styles delta (additive — tokens-only)

```css
/* ---------- Time grid (Week + Day) ---------- */
.cal-time-grid { display: grid; grid-template-rows: auto auto 1fr; flex: 1; overflow: hidden; }
.cal-allday-strip { display: grid; padding: 6px; gap: 4px; border-bottom: 1px solid var(--border-1); max-height: 80px; overflow-y: auto; }
.cal-time-scroll { overflow-y: auto; min-height: 0; }
.cal-time-grid-body { display: grid; grid-template-columns: 48px 1fr; }
.cal-hour-labels { display: flex; flex-direction: column; }
.cal-hour-label { height: 48px; font-size: var(--fs-2xs); color: var(--text-3); font-family: var(--font-mono); padding: 2px 6px 0 0; text-align: right; }
.cal-day-columns { display: grid; }
.cal-day-column { position: relative; border-left: 1px solid var(--border-1); min-height: calc(24 * 48px); }
.cal-week-day[data-active="true"] { background: var(--bg-selected); }
.cal-hour-row { height: 48px; border-bottom: 1px solid var(--border-1); }
.cal-event-block { position: absolute; left: 4px; right: 4px; border-radius: var(--r-xs); padding: 2px 6px; font-size: var(--fs-2xs); overflow: hidden; border-left: 2px solid transparent; }
.cal-event-block .ev-title { font-weight: 500; }
.cal-event-block .ev-time { font-family: var(--font-mono); opacity: 0.7; }
.cal-now-line { position: absolute; left: 0; right: 0; height: 2px; background: var(--accent); pointer-events: none; }
.cal-now-line::before { content: ""; position: absolute; left: -4px; top: -3px; width: 8px; height: 8px; border-radius: 999px; background: var(--accent); }
.cal-dst-label { font-size: var(--fs-2xs); color: var(--text-3); font-style: italic; padding: 2px 6px; }
.cal-week-day-header { display: grid; padding: 8px 0; border-bottom: 1px solid var(--border-1); }
.cal-week-day-header > div { text-align: center; font-size: var(--fs-xs); color: var(--text-2); }

/* Event-block colors reuse the 4 existing oklch classes from layout.css:849-852 */
.cal-event-block.ev-mint   { background: oklch(94% 0.04 165); color: oklch(38% 0.10 165); border-left-color: oklch(58% 0.10 165); }
.cal-event-block.ev-amber  { background: oklch(94% 0.04 70);  color: oklch(40% 0.10 60);  border-left-color: oklch(65% 0.13 70); }
.cal-event-block.ev-blue   { background: oklch(94% 0.04 245); color: oklch(40% 0.10 245); border-left-color: oklch(60% 0.12 245); }
.cal-event-block.ev-violet { background: oklch(94% 0.04 295); color: oklch(40% 0.10 295); border-left-color: oklch(60% 0.12 295); }
[data-theme="dark"] .cal-event-block.ev-mint   { background: oklch(28% 0.05 165); color: oklch(85% 0.08 165); }
[data-theme="dark"] .cal-event-block.ev-amber  { background: oklch(28% 0.05 60);  color: oklch(85% 0.08 60); }
[data-theme="dark"] .cal-event-block.ev-blue   { background: oklch(28% 0.05 245); color: oklch(85% 0.08 245); }
[data-theme="dark"] .cal-event-block.ev-violet { background: oklch(28% 0.05 295); color: oklch(85% 0.08 295); }
```

The `.cal-coming-soon` rule is DELETED. The 4 event-color rules in
§9 above remain (used by Month view chips); the new `.cal-event-block.ev-*`
selectors duplicate the oklch values for the block variant (different
positioning context). Both selectors point at the exact same oklch
tokens from `web design/layout.css:849-852` and `:853-856` — AC-TOKENS-EXT-1
asserts byte-parity.

### 15.9 Acceptance traceability (extension)

| Seed brief signal | Mechanism | AC IDs (extension) |
|---|---|---|
| Week view = 7×24 grid | `<WeekView />` → `<TimeGrid columns=7 />` + `weekWindowFor` | AC-WEEK-1..6 |
| Day view = 1×24 grid | `<DayView />` → `<TimeGrid columns=1 />` | AC-DAY-1..4 |
| Events spanning 9-11 = continuous 2-row block | `placeEventBlocks` returns `{startRow:9, rowSpan:2}` for the 5 endTime events | AC-PLACE-1..4 |
| Toggle Month→Week→Day→Month preserves date | `activeDate` single source of truth | AC-TOGGLE-1..3 |
| New persistence key `xai_calendar_view` | `usePref("xai_calendar_view", "month")` | AC-PERSIST-EXT-1..3 |
| Active-date preservation | `activeDate` carried verbatim across views | AC-ACTIVEDATE-1..4 |
| 50ms perf budget | PB-EXT-1 perf test (100 iter p95 < 50 ms) | PB-EXT-1 |
| Timezone consistency (no off-by-one at midnight) | Local-clock hour labels + `placeEventBlocks` never crosses day boundary | AC-TZ-1..4 |
| DST handling | `dstHoursForDay` returns 23/24/25; explicit (DST) label | AC-DST-1..2 |
| All 90 existing tests stay green | State refactor preserves external behavior | Verified by `pnpm --filter @repo/plugin-web-calendar test` at every commit |
| Listen-only (no emit) | Extended AC-EVENT-7 grep to new files | AC-EVENT-7 extended |
| Cross-vendor | XVENDOR-EXT-1..6 checklist | XVENDOR-EXT-1..6 |

### 15.10 Architectural risk: none

- No `packages/core/` edit (no new event channel; reuses `web:shell:module-change`).
- No `manifest.json` routing change (still slot-pattern).
- No new package dependency (TimeGrid is local to xai-web-calendar).
- No CSP impact (no external HTTPS).
- One additive entry in `@repo/plugin-web-storage` (matches the
  `xai_pref_week_start` precedent from this very package).
- ComingSoonPanel deletion is a private-component removal; nothing
  external imports it (verified — `index.ts` re-export contains only
  `CalendarModule` + `calendarSlotRegistration` + types).

