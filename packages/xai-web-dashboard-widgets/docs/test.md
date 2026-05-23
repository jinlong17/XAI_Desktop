# Test Strategy — xai-web-dashboard-widgets

> Companion: design.md §6 (phase plan), api.md §S5 (persistence), §S6 (i18n).
> Test runner: Vitest 3.2.1 / jsdom 26 — same as row #10.

## 1. Strategy summary

- **Unit + component tests** with `@testing-library/react`.
- **No E2E** in this row (deferred to cross-vendor manual smoke per §6).
- **No new mocking infra**: re-use `setup.ts` from row #10 if needed.
- **Mock fixtures co-located** at `src/internal/fixtures.ts` — fixtures themselves get tested for shape correctness (`fixtures.test.ts`).
- **Persistence tests**: assert `usePref` round-trip via the actual storage API (in-memory backend driven by jsdom localStorage).
- **Drag-exclude assertions**: assert `data-no-drag` markers are present where required (per api.md §S4).

## 2. Acceptance criteria matrix

10 AC families covering all 10 widgets + scaffolding + i18n + slot integration.

### AC-PKG (package skeleton — P1)

- AC-PKG-1: `package.json` declares name `@repo/plugin-web-dashboard-widgets`, ESM, sideEffects=`./src/styles.css`, exports `.` → `./src/index.ts`.
- AC-PKG-2: `tsconfig.json` extends `@repo/typescript-config/react-library.json`.
- AC-PKG-3: `manifest.json` has `slug: "xai-web-dashboard-widgets"`, `roadmap_row: 11`, `wave: "W2"`, `status: "In-Dev"`.
- AC-PKG-4: `index.ts` exports `dashboardWidgetRegistrations` only (asserted via `index-barrel.test.ts`).
- AC-PKG-5: `eslint.config.js` mirrors row #10 (react-internal + no-explicit-any error).

### AC-REG (registrations — P1+P2+P3)

- AC-REG-1: `dashboardWidgetRegistrations.length === 10`.
- AC-REG-2: ids are exactly the 10 strings in §S3 order.
- AC-REG-3: spans map per §S3.
- AC-REG-4: each entry has a function `render` of arity 1.
- AC-REG-5: each entry has an `ariaLabel` with `en` + `zh`.

### AC-CLOCK (ClockWidget — P1)

- AC-CLOCK-1: Default render is `classic` style; HH:MM:SS displayed with leading zeros.
- AC-CLOCK-2: Clicking each of 4 style buttons swaps the rendered content (assert distinct text/element trees per style).
- AC-CLOCK-3: Style choice persists to `xai_clock_style` (assert `usePref` calls and re-render reflects saved value).
- AC-CLOCK-4: Timezone popover opens on toolbar button click; popover lists `Local time` + 12 cities; selecting one closes popover + updates `xai_clock_tz` + recomputes displayed time.
- AC-CLOCK-5: When `xai_clock_tz === "shanghai"`, displayed time = UTC + 8 (mock fixed `now`).
- AC-CLOCK-6: `.clock-toolbar` carries `data-no-drag`.
- AC-CLOCK-7: Bilingual `lang === "zh"` shows zh labels for style buttons / popover items.
- AC-CLOCK-8: Switching to `analog` style mounts `<svg className="clock-analog">`.

### AC-ANALOG (analog clock alignment — P1)

- AC-ANALOG-1: SVG renders 60 minor `<line>` ticks minus 12 that are skipped at multiples of 5 → expect 48 minor lines.
- AC-ANALOG-2: SVG renders 12 major `<line>` ticks (hour markers).
- AC-ANALOG-3: SVG renders 12 `<text>` numerals with content [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].
- AC-ANALOG-4: At `now = 03:00:00`, hour hand transform is `rotate(90 50 50)`; minute hand `rotate(0 50 50)`; second hand `rotate(0 50 50)`.
- AC-ANALOG-5: SVG viewBox = `0 0 100 100`.

### AC-STATS (3 mini stats — P1)

- AC-STATS-1: StatTasks renders `14/22` + a `<svg className="donut">` with `strokeDashoffset` reflecting `1 - 14/22`.
- AC-STATS-2: StatStreak renders `27` + a flame icon (`<svg>` rendered by Icon name="flame").
- AC-STATS-3: StatPomos renders `6` + 8 dot elements, of which 6 carry the `on` class.
- AC-STATS-4: Bilingual labels: en `Tasks done` / `Habit streak` / `Pomodoros`; zh `完成任务` / `习惯连胜` / `番茄数` (existing `dashboard.tasks_done`/`streak`/`pomos`).

### AC-MINICAL (MiniCalWidget — P2)

- AC-MINICAL-1: Renders month label `May 2026` (en) / `2026 年 5 月` (zh) when `now = May 22 2026`.
- AC-MINICAL-2: Renders 7 weekday header cells `M T W T F S S` (en) / `一 二 三 四 五 六 日` (zh).
- AC-MINICAL-3: Day cell for `now.getDate()` carries `today` class.
- AC-MINICAL-4: Days with fixtures.CAL_EVENTS render up to 3 `.mc-dot.mc-dot-<color>` spans.
- AC-MINICAL-5: Clicking prev/next nav button decrements/increments month offset.
- AC-MINICAL-6: Clicking inside `.mc-grid` (non-data-no-drag area) calls `ctx.goTo("calendar")`.
- AC-MINICAL-7: Clicking "Open Calendar" footer button also calls `ctx.goTo("calendar")`.
- AC-MINICAL-8: Prev/Next nav buttons clicked do NOT call `ctx.goTo` (because their parent has data-no-drag and they `e.stopPropagation()`).
- AC-MINICAL-9: `.mc-head` + `.mc-foot` carry `data-no-drag`.

### AC-WORLDCLOCKS (WorldClocks — P2)

- AC-WORLDCLOCKS-1: Default list shows 4 zones (Shanghai/London/New York/Tokyo) in `list` view.
- AC-WORLDCLOCKS-2: View toggle (`list`/`analog`/`grid`) switches rendered shape.
- AC-WORLDCLOCKS-3: Add-city button opens picker; picker shows the 8 unselected cities.
- AC-WORLDCLOCKS-4: Selecting an unselected city adds it to `xai_zones` and closes picker.
- AC-WORLDCLOCKS-5: Per-row remove button removes the city from `xai_zones`.
- AC-WORLDCLOCKS-6: `.tz-view-toggle` + `.tz-picker` carry `data-no-drag`.
- AC-WORLDCLOCKS-7: Removing the second-to-last zone still works; removing the last zone is prevented (UI keeps at least 1 zone).
- AC-WORLDCLOCKS-8: Day delta label (`Today`/`Tomorrow`/`Yesterday`/`+1d`/`-1d`) computed correctly for known UTC offsets vs mock now.
- AC-WORLDCLOCKS-9: Persistence round-trip (set zones → reload component → same zones via `usePref` default-from-storage).

### AC-WEATHER (WeatherWidget — P2)

- AC-WEATHER-1: Renders fixture current temp `22°` + city `Shanghai` (en) / `上海` (zh) + condition `Partly Cloudy` / `多云`.
- AC-WEATHER-2: Renders 5 forecast days with day labels, icons, and hi/lo temps.
- AC-WEATHER-3: Bilingual day labels (`Mon` ↔ `一`, etc).

### AC-STICKIES (StickiesWidget — P2)

- AC-STICKIES-1: Renders 3 sticky notes from fixture.
- AC-STICKIES-2: Each note has its color from fixture (inline `background`).
- AC-STICKIES-3: Bilingual text per note.

### AC-MAIL (MailWidget — P3)

- AC-MAIL-1: Renders 4 mail rows from fixture.
- AC-MAIL-2: Rows with `unread: true` carry the `.unread` class + `.mail-dot` element; total unread count appears in `.mail-badge`.
- AC-MAIL-3: Bilingual `subj` per row.

### AC-UPCOMING (UpcomingWidget — P3)

- AC-UPCOMING-1: Renders 4 upcoming-event rows from fixture.
- AC-UPCOMING-2: Each row shows date number, bilingual month, bilingual title, time.

### AC-HOST (host wiring — P3)

- AC-HOST-1: `slotIntegration.test.tsx` imports `DashboardSlotHost` from `@repo/plugin-web-dashboard-grid` and renders it with `WebShellProvider` (or equivalent fixture); the rendered tree contains 10 `[data-widget-id]` shells.
- AC-HOST-2: `packages/xai-web-dashboard-grid/src/__tests__/registration.test.tsx` (Edit if needed) verifies `DashboardSlotHost` now passes `dashboardWidgetRegistrations` (not `EMPTY_WIDGETS`).
- AC-HOST-3: `apps/web/src/routes/modules/__tests__/shellRegistrations.integration.test.tsx` continues to pass.

### AC-FIXTURES (fixtures shape — P2)

- AC-FIXTURES-1: WEATHER object has `city.{en,zh}`, `temp`, `hi`, `lo`, `condition.{en,zh}`, `icon`, `forecast` array of length 5.
- AC-FIXTURES-2: STICKIES has 3 entries each with `id`, `color`, `text.{en,zh}`.
- AC-FIXTURES-3: MAILS has 4 entries each with `id`, `from`, `subj.{en,zh}`, `time`, `unread`.
- AC-FIXTURES-4: UPCOMING has 4 entries with `id`, `date`, `month.{en,zh}`, `title.{en,zh}`, `time`.
- AC-FIXTURES-5: CAL_EVENTS is keyed by day number; each value is `[{ c: <color> }, ...]`.

### AC-CITYLIB (city library — P1)

- AC-CITYLIB-1: 12 entries; ids match §1.1 frozen-assumption 8.
- AC-CITYLIB-2: Each entry has `city.{en,zh}` + `tz: number`.

## 3. Test files vs ACs

| File | ACs covered |
|---|---|
| `__tests__/index-barrel.test.ts` | AC-PKG-4 |
| `__tests__/registrations.test.tsx` | AC-REG-1..5 |
| `__tests__/ClockWidget.test.tsx` | AC-CLOCK-1..8 |
| `__tests__/analogClockTicks.test.tsx` | AC-ANALOG-1..5 |
| `__tests__/StatTasks.test.tsx` | AC-STATS-1, AC-STATS-4 |
| `__tests__/StatStreak.test.tsx` | AC-STATS-2, AC-STATS-4 |
| `__tests__/StatPomos.test.tsx` | AC-STATS-3, AC-STATS-4 |
| `__tests__/Donut.test.tsx` | AC-STATS-1 (shape) |
| `__tests__/PomoDots.test.tsx` | AC-STATS-3 (shape) |
| `__tests__/cityLibrary.test.ts` | AC-CITYLIB-1, AC-CITYLIB-2 |
| `__tests__/MiniCalWidget.test.tsx` | AC-MINICAL-1..9 |
| `__tests__/WorldClocks.test.tsx` | AC-WORLDCLOCKS-1..9 |
| `__tests__/TzClock.test.tsx` | (analog shape — covered as AC-WORLDCLOCKS-2 sub) |
| `__tests__/WeatherWidget.test.tsx` | AC-WEATHER-1..3 |
| `__tests__/StickiesWidget.test.tsx` | AC-STICKIES-1..3 |
| `__tests__/fixtures.test.ts` | AC-FIXTURES-1..5 |
| `__tests__/MailWidget.test.tsx` | AC-MAIL-1..3 |
| `__tests__/UpcomingWidget.test.tsx` | AC-UPCOMING-1..2 |
| `__tests__/slotIntegration.test.tsx` | AC-HOST-1 |
| `packages/xai-web-dashboard-grid/src/__tests__/registration.test.tsx` (Edit) | AC-HOST-2 |
| `apps/web/src/routes/modules/__tests__/shellRegistrations.integration.test.tsx` (no edit; should keep passing) | AC-HOST-3 |

## 4. Tooling

- Vitest 3.2 + jsdom 26 + `@testing-library/react@^16` (same as row #10).
- Setup: `./src/__tests__/setup.ts` — minimal (TBD on whether PointerEvent polyfill needed; row #10 has it but row #11 has no drag handling of its own).
- Coverage: targeted at 90% lines for widgets/ + 100% lines for internal/ (helpers).
- Bilingual: every widget tested twice (en/zh) for at least one assertion.

## 5. Mock strategy

- `usePref` from `@repo/plugin-web-storage` is **not mocked** — we use the real storage backend (jsdom localStorage) and rely on it to round-trip values.
- `ctx.goTo` in MiniCal tests is provided as a `vi.fn()`; we assert calls without involving the real event bus.
- `ctx.now` is provided as a `new Date(2026, 4, 22, 10, 30, 0)` fixed Date for deterministic rendering.
- `ctx.lang` flips between `"en"` and `"zh"` per test.
- Fixtures (`WEATHER`, `STICKIES`, `MAILS`, `UPCOMING`, `CAL_EVENTS`) are exercised as-imported; their shape is asserted in `fixtures.test.ts`.

## 6. Cross-vendor manual verify gate (queued)

Per manifest header (`Verify Cross-vendor: yes`, Codex primary / Cursor fallback):

1. **`pnpm --filter @repo/web dev`** in Chrome / Safari 17+ / Firefox.
2. Navigate to `/app/dashboard` → all 10 widgets render.
3. ClockWidget — cycle all 4 styles; analog clock displays 60+12+12 cleanly; switch to Shanghai/London/NYC timezone; reload → style + tz persist.
4. MiniCal — click a day cell → URL goes to `/app/calendar`; click prev/next month buttons → month changes without navigating.
5. WorldClocks — toggle list/analog/grid; add a city; remove a city; reload → zones persist.
6. Stat widgets — assertion: donut percentage matches `14/22`; flame visible; 6/8 dots filled.
7. Drag-to-reorder — drag ClockWidget over WorldClocks; FLIP animation runs; persistence updates `xai_dash_order`; reload → order persists.
8. Theme — light/dark CSS vars apply to widget bodies.
9. Storage — DevTools Application tab shows `xai_clock_style`, `xai_clock_tz`, `xai_zones` keys.

## 7. Risk-to-test mapping

| Risk | Test |
|---|---|
| R1 (analog alignment) | AC-ANALOG-1..5 + visual smoke in §6.3 |
| R2 (no-DST math) | AC-CLOCK-5 + AC-WORLDCLOCKS-8 with hand-checked offsets |
| R3 (mini-cal click-vs-drag) | AC-MINICAL-6/7/8/9 + visual §6.4 |
| R4 (world-clocks picker drag leak) | AC-WORLDCLOCKS-6 + visual §6.5 |
| R6 (xai_dash_order default ids match) | AC-REG-2 (asserts the 10 ids in order) + slotIntegration |
| R8 (sibling concurrency) | git status clean post-Edit + uniqueness check |
| R11 (cross-package commit) | AC-HOST-1 + AC-HOST-2 |
