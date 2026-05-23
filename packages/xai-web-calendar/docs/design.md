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
