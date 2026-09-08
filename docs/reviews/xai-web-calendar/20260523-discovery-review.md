# Discovery Review — xai-web-calendar

> Roadmap row: docs/workflow/roadmap/xai-web-console.md row #12 (W2 Module — Calendar)
> Seed brief: docs/reviews/xai-web-calendar/20260523-roadmap-seed.md
> ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map row `module-calendar.jsx` → `packages/plugin-web-calendar/src/`) + §S5 (JSX→TSX rules) + §S7 (event bus) + §S8 (persistence registry)
> Source prototype: `web design/module-calendar.jsx` (90 LOC, ~3.4 KB)
> Source PRD: `web design/DESIGN.md` §4.5 (Calendar)
> Authored by: feature-plan (xai-roadmap-loop W2c parallel-Agent mode; siblings: #16 xai-web-meditation + #18 xai-web-ai-chat)

---

## 1. Problem framing

### 1.1 What is being ported

Port the Calendar productivity module from `web design/module-calendar.jsx`
into a typed Vite + React 19 workspace package `@repo/plugin-web-calendar`
(directory `packages/xai-web-calendar/`, per the W1-established sibling
convention — see Q1).

The prototype renders a single calendar surface:

**Toolbar (`<header class="cal-toolbar">`)**

- Leading `list` icon button (no-op, future agenda toggle).
- Title `{lang === "zh" ? "2026 年 5 月" : "May 2026"}` — currently a hard-
  coded string in the prototype (no month navigation feeds it).
- Trailing icon buttons: `+` (no-op add), Day/Week/Month segmented switcher
  with `aria-selected={view === ...}` semantics, `<` / `>` month-step
  buttons (no-op in prototype), `today` ghost button (no-op), `…` overflow.

**Month grid (`<div class="cal-grid panel">`)**

- Weekday header row (`<div class="cal-weekheader">`) showing 7 day names.
  Prototype hard-codes Mon-first ordering — `["周一","周二", ...]` /
  `["Mon","Tue", ...]`.
- 5 row × 7 cell grid (35 cells total) rendered from a hand-crafted
  `rows` array. Each cell has:
  - `cal-day-head` — optional week number tag (rendered when `ci === 0`),
    day number, optional `today-pill` wrapper, optional holiday label
    (`"劳动节"` / `"母亲节"` in ZH, empty string in EN — see §3.5).
  - `cal-events` — up to 5 event chips from `MOCK.calEvents[cell.d]`,
    each with a color class (`ev-mint` / `ev-amber` / `ev-blue` /
    `ev-violet`), optional time stamp, and overflow `+N` chip.

**Banner (`<div class="cal-banner">`)**

- Star icon + sample-data text + upgrade CTA. Trivial, copies straight over.

### 1.2 What the seed brief adds beyond the prototype

The prototype is **read-only / hard-coded**:

- The `rows` array is hand-built for May 2026 only (5 rows, starts on
  Apr 27 because May 2026 begins on a Friday). No month navigation.
- Day names are hard-coded Mon-first — week-start preference is ignored.
- Holidays are hard-coded with two ZH-only strings inlined into the array.
- Events are read from `window.MOCK.calEvents[1..31]` (a const indexed by
  day-of-month with bilingual title objects). The prototype never
  hydrates from storage — the module is a stateless visual fixture.
- The view switcher only updates local `view` state but the Day/Week
  branches do not exist — clicking them changes the `aria-selected`
  attribute and nothing else.
- Today is hard-coded as the cell with `today: true` (= May 22 in the
  fixture data).

The seed brief upgrades to:

- **2026-05 month view rendered from a computed date grid**, not from a
  hand-rolled fixture — the grid must respect the user's week-start
  preference (Sunday default in v1 — see §3.3 Q3).
- **4-color event bands** keyed to the exact 4 oklch tokens (mint = 165 /
  amber = 70 / blue = 245 / violet = 295) from `tokens.css`. No hex
  fallbacks. The token reference table is at §6.1.
- **View switcher renders all 3 tabs** with Month being acceptance-
  blocking; Week and Day are stubbed as a "Coming soon" placeholder
  panel inside the same module (per DESIGN.md §13 Future).
- **Deep-link from Dashboard MiniCal** via the **already-declared**
  `web:shell:module-change` channel (`packages/core/src/types/events.ts`
  line 175–184, verified) — when the shell dispatches the channel with
  `moduleId === "calendar"` and a `focusDate` payload, the calendar
  module re-centers its month view on that date and applies a
  `data-focused="true"` highlight to the matching cell. No new channel
  is created; the receive-side filter is the only new code.
- **Bilingual via `useI18n`** — the existing `cal.month/week/day/today/
  sample_banner` keys are already declared in
  `@repo/plugin-web-tokens/src/i18n.ts` lines 62–66 + 247–251 (verified
  EN + ZH parity). New holiday + "coming-soon" keys are added under
  `cal.*` in this row's i18n delta (see §3.5).
- **Real "today" detection** via `new Date()` UTC date keys — the
  `today-pill` no longer hard-coded to May 22.

### 1.3 Hard architectural inputs (frozen by ADR-0007 + worker brief)

1. **Directory + package name** — `packages/xai-web-calendar/` (directory)
   + `@repo/plugin-web-calendar` (package name). Mirrors sibling W2
   convention (matrix Q1 resolution). See Q1.
2. **JSX → TSX** — every component is a `.tsx` file with explicit `Props`
   types; no `any`; pure functional components; ADR §S5.
3. **Public surface** — `index.ts` is the only export point. No deep
   imports from `src/internal/`.
4. **Event channel pre-declared** —
   `packages/core/src/types/events.ts:175` declares
   `web:shell:module-change` with `focusDate?: string`. The calendar
   row only **listens** on this channel filtered to
   `moduleId === "calendar"`; no event-types edit. Confirmed by
   `xai-web-event-bus/docs/api.md:197-198`:
   > xai-web-dashboard-widgets (#11) MiniCal → emits → calendar
   > xai-web-calendar (#12) listens, filters moduleId, scrolls to focusDate
5. **Persistence registry pattern** — week-start preference uses a new
   registry entry `xai_pref_week_start` declared in this row (per
   ADR-0007 §S8 — `xai_pref_*` prefix is the standardized preference
   namespace). See §3.3 axis D.
6. **Shell wiring** — `apps/web/src/routes/modules/shellRegistrations.tsx`
   line 55 currently has
   `placeholder("calendar", "Calendar", "calendar", 5)`. This row
   replaces that line with `calendarSlotRegistration` imported from
   `@repo/plugin-web-calendar`.
7. **Concurrent siblings** — #16 xai-web-meditation (line 59) + #18
   xai-web-ai-chat (line 51) target line-disjoint slot rows. The
   `apps/web/package.json` dep block + `shellRegistrations.tsx`
   imports converge but on different lines. See §6 R3.

### 1.4 Existing upstream that must NOT regress

- `packages/core/src/types/events.ts` — `WebModuleId` union already
  includes `'calendar'` at line 7. No edit.
- `packages/xai-web-shell/src/types.ts` — `WebShellIconName` already
  includes `"calendar"` at line 22. No edit.
- `packages/plugin-web-tokens/src/i18n.ts` — `cal.*` and `nav.calendar`
  keys are already in both bundles. We **add** `cal.coming_soon` (EN +
  ZH) and `cal.holiday_*` (mayday + mothers-day) under the same
  `cal:` namespace — additive only, no key renames.
- `packages/plugin-web-storage/src/internal/registry.ts` — has 4
  `xai_pref_*` keys already in the registry; we add
  `xai_pref_week_start` (one additional entry, append-at-end).

---

## 2. Source-prototype audit

### 2.1 Component composition (from `module-calendar.jsx`)

```
CalendarModule
├── header.cal-toolbar
│   ├── icon-btn (list)
│   ├── h1.module-title (string)
│   ├── span.grow
│   ├── icon-btn (plus)
│   ├── .seg [day | week | month]
│   ├── icon-btn (arrowL)
│   ├── btn.ghost.btn-today
│   ├── icon-btn (arrowR)
│   └── icon-btn (dots)
├── .cal-grid.panel
│   ├── .cal-weekheader
│   │   └── .cal-weekday × 7
│   └── .cal-rows
│       └── .cal-row × 5
│           └── .cal-day × 7
│               ├── .cal-day-head
│               │   ├── .cal-week-num (cell 0 only)
│               │   ├── .cal-day-num (today wraps in .today-pill)
│               │   └── .cal-holiday (when set)
│               └── .cal-events
│                   ├── .cal-event.ev-{c} × min(events.length, 5)
│                   │   ├── .ev-dot
│                   │   ├── .ev-title
│                   │   └── .ev-time.mono (when set)
│                   └── .cal-more (when events.length > 5)
└── .cal-banner
    ├── Icon (star)
    ├── span (sample text)
    └── button.banner-upgrade
```

35 cells = 5 weeks × 7 days. The prototype renders 5 rows because May
2026 with Mon-first starts on Apr 27 (W18) and ends May 31 — fits in 5.
**With Sunday-first**, May 2026 (May 1 = Friday) starts on Sunday Apr 26
(W17) and ends May 30 — also fits in 5 rows = 35 cells. For other
months we may need 6 rows = 42 cells (handled by computing the row
count from `daysInMonth(year, month) + leadingPad` and rounding up to
multiples of 7). See §6 helper `monthGridCells`.

### 2.2 Event data shape (from `i18n.js:509-541`)

```ts
type CalEvent = {
  c: "mint" | "amber" | "blue" | "violet";  // color band
  t: { en: string; zh: string };            // bilingual title
  time?: string;                            // optional "HH:MM" timestamp
};

type CalEventsByDay = Record<number /*1..31*/, CalEvent[]>;
```

Day 14 = empty array. Day 31 = empty array. Days 1-30 carry 1-4 events
each. Total 65 events. Mix per day already maps to all 4 colors (with
mint dominant) — verified at i18n.js:510 (`amber/blue/mint/mint`) and
i18n.js:525 (`violet/mint`). All 4 colors are represented in May 2026
sample data.

### 2.3 Today-marker discrepancy

Prototype hard-codes `today: true` on the cell containing May 22 (line
17 in `module-calendar.jsx`). The seed brief requires real "today"
detection — the today-pill must wrap the day number matching
`new Date()` (today UTC). Out-of-month days never get the pill (per
prototype semantics: `cell.today` is gated to the May 22 cell only).
For visual continuity with the sibling fixture (which renders May 2026),
v1 also renders May 2026 by default — `displayedMonth` initializes to
**`{ year: 2026, month: 5 }`** (the prototype anchor), not to the actual
calendar month at app-launch. See Q5.

### 2.4 Week number convention

`{w:"W18"}` etc. are ISO-week labels (W18 = Apr 27 = first Mon of week
18 in 2026 ISO calendar). v1 computes ISO-week numbers via the standard
ISO 8601 algorithm (Thursday-of-week rule). The label appears on cell 0
of every row only. See Q4.

### 2.5 Holiday label

Prototype hard-codes ZH-only `"劳动节"` (May 1) and `"母亲节"` (May 9).
EN passes an empty string, so nothing renders. v1 lifts these into the
i18n bundle as `cal.holiday_mayday` + `cal.holiday_mothers_day` so EN
gets `"Labor Day"` + `"Mother's Day"` (per Q6 decision). Additional
holidays for other months are deferred to a future row — v1 only ships
the two May 2026 holidays as i18n entries.

### 2.6 What's missing entirely from the prototype

- **Add-event modal** — the `+` icon is a no-op. Per Q2, v1 keeps it as
  a no-op (display-only acceptance signal in seed brief, no "user can
  create event" requirement). The future create-event row is deferred.
- **Event-detail popover** — clicking a `.cal-event` chip is a no-op.
  v1 ships chips as decorative; clicking does nothing. Future.
- **Recurring events / RSVPs / external sync** — DESIGN.md §13 Future.
- **Day view & Week view** — stubbed as a single "Coming soon" panel
  with the same toolbar visible (per seed brief acceptance signal).

---

## 3. Decision axes

> Each axis enumerates the options we considered. The **bold** option is the
> planner's recommendation; alternatives are recorded for `feature-review`.

### 3.1 Axis A — Directory + package name (Q1)

- **A1** `packages/xai-web-calendar/` + `@repo/plugin-web-calendar`
  (sibling W2 convention; matches matrix/habits/pet/countdown/pomodoro).
- A2 `packages/plugin-web-calendar/` (matches the ADR-0007 §S4 port-map
  literal verbatim).

**Recommendation: A1**, identical to matrix Q1 resolution.

### 3.2 Axis B — Event data source for v1

- **B1** Inline the `MOCK.calEvents` array as a typed `SAMPLE_EVENTS`
  constant in `src/internal/sampleEvents.ts`. Acceptance signal in the
  seed brief says "events display in 4 colors" — does not require real
  user-created events. The banner already says "Sample data — switch to
  your account to see real events."
- B2 Persist events in a new `xai_calendar_events` `usePref` blob with
  a starter seed. Adds: registry edit, hydration, storage tests, and a
  whole CRUD surface that v1 has no UI for.
- B3 Read events from a future event-store package. Doesn't exist.

**Recommendation: B1.** Match prototype semantics; the seed brief
explicitly defers create/edit to future rows. Sample data is the
acceptance signal.

### 3.3 Axis C — Week-start strategy (Q3)

- **C1** Read `usePref("xai_pref_week_start", 0)` — register the new
  key in `packages/plugin-web-storage` with default `0` (Sunday).
  Values: `0` = Sunday, `1` = Monday. Settings W4 row #24 will later
  wire the UI for it; until then v1 hard-defaults to Sunday but the
  registry key is live so other modules can read it consistently. The
  seed brief explicitly requests `usePref('xai_pref_week_start', 0)`.
- C2 Hard-code Sunday-first via a `weekStart` prop with no `usePref`.
  Simpler, but inconsistent with the seed brief and with sibling
  modules that share the preference (habits month-cal also wants it
  later).
- C3 Read Monday-first to match the prototype. Conflicts with the
  seed brief's `usePref('xai_pref_week_start', 0)` default = Sunday.

**Recommendation: C1.** The seed brief makes this binding. Adding one
registry entry per ADR-0007 §S8 is the standard owner-row registration
path (siblings #13/#15/#17/#19 all use this pattern).

### 3.4 Axis D — Deep-link reception channel (Q7)

- **D1** Listen on the **existing** `web:shell:module-change` channel
  filtered to `moduleId === "calendar"`, read `focusDate`, dispatch a
  module-local `setDisplayedMonth(year, month)` + `setFocusedDate(date)`
  effect. Zero core/events.ts edits.
- D2 Add a new `web:calendar:navigate` channel scoped to calendar-only
  navigation. Requires a `packages/core/src/types/events.ts` edit
  (against constraint #5 in user prompt — "Do NOT touch packages/core/
  unless ADR-0007 specifies a new event channel for this row").

**Recommendation: D1.** The seed brief explicitly says "pick one in
plan". The `xai-web-event-bus` docs already declare calendar-as-
listener at api.md:198 ("listens `web:shell:module-change` filtered to
`moduleId === 'calendar'` to scroll to `focusDate`"). D1 is the
already-blessed contract; D2 would re-litigate it.

### 3.5 Axis E — Holiday inlining strategy

- **E1** Lift the 2 ZH-only strings into `cal.holiday_mayday` +
  `cal.holiday_mothers_day` so EN also gets "Labor Day" + "Mother's
  Day".
- E2 Keep the prototype semantics (empty EN; ZH-only label).
- E3 Drop holiday rendering entirely.

**Recommendation: E1.** Bilingual is a hard constraint. Empty EN
strings violate "EN/中文 parity" in the seed brief's acceptance signal.

### 3.6 Axis F — View switcher Week/Day stubs (Q9)

- **F1** Render the 3-tab switcher with the same `<.seg>` markup as the
  prototype. When `view !== "month"`, replace the grid with a
  `<div class="cal-coming-soon">` panel showing the
  `cal.coming_soon` i18n string ("Week and Day views are coming soon."
  / "周视图与日视图即将推出。"). The Month tab is still selectable and
  flips back.
- F2 Hide the Week/Day buttons entirely until they ship. Simpler, but
  the seed brief explicitly says "view switcher renders all 3 tabs".

**Recommendation: F1.** Honors the acceptance signal verbatim.

### 3.7 Axis G — Month navigation buttons (Q5)

- **G1** Wire the `<` / `>` icon buttons to step the displayed month
  ±1. Wire the `today` button to reset to `{2026, 5}` (the prototype
  anchor) **for v1**. After Settings W4 lands, `today` will reset to
  the real current month.
- G2 Leave all three as no-ops to match prototype.
- G3 Wire `<` / `>` and `today` to real `new Date()` semantics — the
  default month is `currentMonth()` rather than May 2026.

**Recommendation: G1.** The buttons are clearly affordances the user
will try; no-ops will read as broken. Anchoring to May 2026 keeps
visual parity with the design source and the sample data.

### 3.8 Axis H — ISO week-number label (Q4)

- **H1** Compute via the standard ISO 8601 algorithm (Thursday-of-
  current-week rule) in a pure helper `isoWeekNumber(date): number`.
  Render `W${n}` on `cell.ci === 0` (= week-start column) only.
- H2 Hard-code the same 5 labels (W17/W18/W19/W20/W21 for Sunday-first
  or W18-W22 for Mon-first) per the prototype.
- H3 Drop week-number rendering entirely.

**Recommendation: H1.** A 12-line pure function with full test
coverage adds correctness for all months that we navigate to (not just
May 2026).

### 3.9 Axis I — Today re-detect cadence (Q8)

- **I1** Detect once on mount via `useMemo(() => utcDateKey(new Date()),
  [])`. Acceptable for v1 — users don't keep the SPA open across midnight
  typically. If they do, the today-pill won't shift until a re-mount.
- I2 Set a `setInterval` ticking every minute to re-derive today.
- I3 Listen for `visibilitychange` and re-derive when the tab is
  focused.

**Recommendation: I1.** The countdown row (#17) ships an interval
strategy for its own use case — adopting that for the calendar today-
marker is gold-plating for v1.

### 3.10 Axis J — Cross-tab focusDate replay (Q10)

- **J1** When the deep-link event arrives via `useWebEventListener`,
  call `setDisplayedMonth({year, month})` if the focus date is outside
  the currently displayed month; also set `focusedDate` state. No
  cross-tab amplification.
- J2 Re-emit the event into a `BroadcastChannel` so other tabs follow.
  Out of scope.

**Recommendation: J1.** The shell event already handles same-tab fan-
out via `emitWebEvent`. Cross-tab navigation is not in the acceptance
signal.

---

## 4. Frozen assumptions for `design.md`

The following 14 assumptions are frozen by the planner and recorded in
`design.md` §1.1. Any later change goes through `feature-review` →
`feature-plan` revision.

1. Directory = `packages/xai-web-calendar/`; package = `@repo/plugin-web-calendar`.
2. v1 ships **read-only** Month view + Week/Day "coming soon" placeholder.
3. Sample event data inlined as `SAMPLE_EVENTS` (no storage); banner
   keeps the "Sample data — switch to real account" copy.
4. Event color classes are exactly `ev-mint`, `ev-amber`, `ev-blue`,
   `ev-violet`. The 4 oklch values come byte-for-byte from
   `web design/layout.css:849-852` — pre-existing 4-color contract.
5. Deep-link in via `web:shell:module-change` channel,
   `moduleId === "calendar"` filter, `focusDate?: string` payload. No
   new event channel.
6. Week-start via `usePref("xai_pref_week_start", 0)` — new registry
   entry, owner = `xai-web-calendar`, default 0 (Sunday), schemaVersion 1.
7. `displayedMonth` state initializes to `{year: 2026, month: 5}` to
   match the design-source anchor; `today` button resets to that anchor;
   `<` / `>` buttons step ±1 month.
8. Today-marker derived once via `useMemo(() => utcDateKey(new Date()),
   [])` — out-of-month days never get the today-pill.
9. ISO week numbers computed via a pure `isoWeekNumber(date)` helper
   (Thursday-of-week ISO 8601 algorithm).
10. Holidays = `cal.holiday_mayday` + `cal.holiday_mothers_day` i18n
    keys (additive). Holiday detection is `(year, month, day) === (2026,
    5, 1)` or `(2026, 5, 9)` — table-driven, deferred-extensible.
11. Slot registration via `WebModuleSlotRegistration` from
    `@repo/xai-web-shell` — replaces `shellRegistrations.tsx:55`
    placeholder.
12. `i18n` deltas additive to `@repo/plugin-web-tokens`: new keys
    `cal.coming_soon`, `cal.holiday_mayday`, `cal.holiday_mothers_day`.
    No renames.
13. v1 does NOT register a new event channel. The calendar is a
    listen-only consumer of `web:shell:module-change`.
14. Sibling concurrent writes confined to: `shellRegistrations.tsx`
    line 55 (calendar swap, line-disjoint from siblings at lines 51, 59)
    + `apps/web/package.json` (single dep line, additive) + i18n bundle
    (3 additive keys × 2 langs = 6 lines). No `packages/core/` edits.

---

## 5. Phased build plan preview

Three phases, scoped per CLAUDE.md "one phase per build run":

- **P1** — Package skeleton + Month grid render + view switcher + today
  detection + sample event chips + shell wiring.
- **P2** — Month navigation (< / > / today) + deep-link receive +
  i18n delta (3 new keys × 2 langs) + holiday rendering +
  `xai_pref_week_start` registry entry + week-start consumption.
- **P3** — Week/Day "coming soon" placeholder + cross-vendor smoke +
  edge cases (6-row month, leap-year Feb, year rollover) + docs sync.

Full per-phase scopes appear in `dev_log.md` Phase Plan.

---

## 6. Risks

### 6.1 Risk register

| ID | Risk | Severity | Status |
|---|---|---|---|
| R1 | Month-grid leading/trailing pad math breaks on 6-row months (e.g., Aug 2026 = May-clone 6 rows) | Medium | Mitigated: `monthGridCells(year, month, weekStart)` is a pure helper, AC-GRID-1..7 covers 4 representative months. |
| R2 | ISO week-number computation differs from prototype's hand-rolled labels | Low | Mitigated: prototype labels W18..W22 (Mon-first) match ISO 8601 output for May 2026 by inspection; AC-ISO-1..4 verifies algorithm. |
| R3 | Parallel siblings (#16 xai-web-meditation + #18 xai-web-ai-chat) touch the same `shellRegistrations.tsx` + `apps/web/package.json` in the same window | Medium | All three rows add line-disjoint edits. `shellRegistrations.tsx`: calendar swaps line 55 (current placeholder), meditation swaps line 59, ai-chat swaps line 51 — all line-disjoint. `apps/web/package.json`: each adds a single dep line. Plan + design + dev_log all use Edit (not Write); retry git index lock 8-20s × 5 on conflict per user prompt. |
| R4 | New `xai_pref_week_start` registry entry conflicts with a future Settings W4 row that also wants to declare it | Low | Mitigated: we register `proposed: false` because we ARE the owner now (calendar consumes it first); Settings W4 will read-only. The W4 plan can mark `owner: "xai-web-settings-rest"` if W4 wants to take ownership — at that point this row's `owner` flips on the same entry (one-line edit). Documented as a §6.2 follow-up. |
| R5 | `web:shell:module-change` listener loops if the calendar also emits the channel | Low | Mitigated: calendar is listen-only. The seed brief explicitly says receive-side only. AC-EVENT-7 asserts emitWebEvent is NOT called from this module. |
| R6 | Out-of-month days (`m: "prev"` / `m: "next"`) get a today-pill when the real today happens to match the displayed-month leading/trailing pad day | Low | Mitigated: `MonthCell.tsx` gates the today-pill on `cell.inMonth === true`. AC-TODAY-2 covers this. |
| R7 | DST transition (US spring-forward Mar 8 2026 + Nov 1 2026) shifts the perceived "today" UTC date by ±1 day | Low | Mitigated: all date keys are UTC (`utcDateKey`). AC-TODAY-3 simulates a US DST boundary and asserts today-pill stays on the UTC day. |
| R8 | `cal.holiday_mayday` / `cal.holiday_mothers_day` are EN/ZH only; users in non-CN/EN locales see EN | Low | v1 ships only EN + ZH per the entire console scope (i18n bundle has exactly these two languages). Adding more locales is a future row. |
| R9 | Event chips overflow the 5-cap; `+N` chip can crowd small cells in 6-row months | Low | Mitigated: `.cal-events` has `overflow: hidden` + `max-height` in styles.css; the `+N` chip is sized to fit. Visual check in cross-vendor smoke. |
| R10 | i18n delta merge conflict with siblings — meditation may also touch `nav.meditation` (read-only) but we touch `cal.*` (write) | Low | `cal.*` namespace is calendar-exclusive; meditation owns `med.*`; ai-chat owns `ai.*`. No key namespace overlap. |
| R11 | `displayedMonth` initializer to `{2026, 5}` is brittle — when the SPA ages past May 2026, the calendar will always open on May 2026 rather than the real current month | Medium | Documented as a §6.2 follow-up. v1 ships with May 2026 as the design anchor; the `today` button still resets to May 2026 in v1 (per Q5 G1). A future row will flip `displayedMonth` initializer to `currentMonth()` once Settings W4 lands. |
| R12 | Concurrent sibling commits race on `apps/web/package.json` — JSON syntax errors if two `pnpm install` runs interleave | Medium | Mitigated: planner uses Edit on the exact dep-block anchor (top of `dependencies`) with unique anchor text. Retry git index lock 8-20s × 5 per user prompt §"Concurrency rules". `pnpm install` runs only at end of build phase. |

### 6.2 Follow-up rows / promotions

1. **Settings W4 integration** — when `xai-web-settings-rest` row #24
   ships the DateTime settings, week-start consumption already works via
   `usePref` (this row registers the key). Settings only needs to wire
   the UI — one prop binding.
2. **Today-resets-to-real-month** — flip `displayedMonth` initializer
   from `{2026, 5}` to `currentMonth()` once the design source is
   refreshed past May 2026 or a Settings option allows the user to pin
   a default month.
3. **Create event / edit event** — future row; modal pattern would
   mirror `CountdownEditDialog`.
4. **Recurring events** — DESIGN.md §13 Future.
5. **Day view / Week view** — DESIGN.md §13 Future; v1 ships placeholder.

---

## 7. Open questions for `feature-review`

The 10 questions in §3 are recapped here for the reviewer:

- **Q1** — Directory naming (A1 vs A2)? → Planner: A1.
- **Q2** — Event data source (B1 sample inline vs B2 storage)? → B1.
- **Q3** — Week-start strategy (C1 usePref vs C2 prop only)? → C1.
- **Q4** — ISO week-number algorithm or hard-code? → H1 (compute).
- **Q5** — Month-nav buttons live or no-op? → G1 (live + May 2026 anchor).
- **Q6** — Holiday i18n inlining? → E1 (lift to bundle).
- **Q7** — Deep-link channel (D1 existing vs D2 new)? → D1.
- **Q8** — Today-marker re-detect cadence? → I1 (mount-only memo).
- **Q9** — Week/Day stub strategy? → F1 ("coming soon" panel).
- **Q10** — Cross-tab focusDate broadcast? → J1 (no broadcast).

---

## 8. Cross-vendor matrix (preview)

| ID | Browser | Check | When |
|---|---|---|---|
| XVENDOR-1 | Safari 17+ | Month grid renders all 35 cells (5×7) with correct weekday header | feature-verify |
| XVENDOR-2 | Chrome 120+ | Event chips show 4 distinct oklch colors (visual inspection) | feature-verify |
| XVENDOR-3 | Firefox 120+ | View switcher seg control flips `aria-selected` correctly | feature-verify |
| XVENDOR-4 | Safari 17+ | Deep-link from Dashboard MiniCal lands on the focused date (highlight pill) | feature-verify |
| XVENDOR-5 | Chrome 120+ | `<` / `>` month nav, `today` button reset, no console errors | feature-verify |
| XVENDOR-6 | Firefox 120+ | Lang switch EN ↔ ZH: weekday header, month title, holiday labels all update | feature-verify |
| XVENDOR-7 | Safari 17+ | Week/Day "coming soon" placeholder renders bilingually | feature-verify |
| XVENDOR-8 | Chrome 120+ | `xai_pref_week_start` change re-renders the grid with new weekday order | feature-verify |
| XVENDOR-9 | Firefox 120+ | No console warnings or errors on full module-mount + month-nav cycle | feature-verify |

All XVENDOR-* may be DEFERRED to ship-time human per the matrix/habits/
countdown precedent if cross-vendor automation isn't run in CI.

---

## 9. Cleared for feature-plan

This discovery review has 14 frozen assumptions (§4), 10 open
questions resolved in-plan (§3/§7), and 12 risks tracked (§6.1). The
planner proceeds to write `design.md`, `api.md`, `test.md`, and
`dev_log.md` with these inputs.
