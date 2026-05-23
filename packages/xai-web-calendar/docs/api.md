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
