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

---

## §E — Extension test strategy: Stickies create + delete (xai-web-dashboard-stickies-create, 2026-05-28)

> **APPEND extension — SHIPPED §1-§7 strategy above unchanged.** Same runner (Vitest 3.2 / jsdom 26 / RTL 16). Same mock strategy: `usePref` NOT mocked (real jsdom-localStorage round-trip); `crypto.randomUUID` available in jsdom 26 (id fallback also tested by stubbing).
> Authority: ADR-0010 §D4 carve-out `baaf3e1`. Design: design.md §E. API: api.md §E.

### §E.1 New test files vs phase

| File | Phase | ACs |
|---|---|---|
| `src/internal/stickiesStore/__tests__/stickiesStore.test.ts` (or `__tests__/stickiesStore.test.ts`) | SP1 | AC-STORE-1..7 |
| `src/internal/stickiesStore/__tests__/ids.test.ts` | SP1 | AC-IDS-1..3 |
| `packages/plugin-web-storage/src/__tests__/registry.test.ts` (EXTEND) | SP1 | AC-REGISTRY-STICKIES-1..2 + AC-REG-8 (auto) |
| `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` (EXTEND) | SP1 | parity exclusion-list update |
| `src/__tests__/StickyComposer.test.tsx` | SP2 | AC-COMPOSER-1..9 |
| `src/__tests__/useStickies.test.tsx` | SP3 | AC-HOOK-1..4 |
| `src/__tests__/StickiesWidget.test.tsx` (EXTEND existing) | SP3 | AC-STICKIES-CREATE-1..8 (the SHIPPED AC-STICKIES-1..3 fixture tests move under the empty-store branch — see RS-NOTE) |
| `src/__tests__/index-barrel.test.ts` (EXISTING — must stay green) | SP4 | AC-PKG-4 unchanged (single export) |

**RS-NOTE (SP3 migration of SHIPPED stickies tests):** the SHIPPED `StickiesWidget.test.tsx` asserts 3 fixture notes always render (AC-STICKIES-1..3). Post-extension that is only true when the store is EMPTY. Those 3 assertions get re-homed under an "empty store → fixture samples" describe block (the empty-store branch IS the default in tests since jsdom localStorage starts empty), so they stay green; new user-sticky-branch tests clear/seed the store explicitly. The extension does NOT delete the SHIPPED ACs — it scopes them.

### §E.2 Acceptance criteria — new families

#### AC-STORE (pure CRUD — SP1)

- AC-STORE-1: `createSticky({}, draft)` returns `{ next, created }` with `created.id` truthy, `created.text === draft.text`, `created.color === draft.color`, `created.createdAt` an ISO string; `next` has exactly one key.
- AC-STORE-2: `createSticky` does NOT mutate the input store (input stays `{}`; `next !== input`).
- AC-STORE-3: two sequential `createSticky` calls produce 2 distinct ids / 2 keys.
- AC-STORE-4: `deleteSticky(store, id)` removes the key and returns a new object without it.
- AC-STORE-5: `deleteSticky(store, "missing")` returns the SAME reference (no-op).
- AC-STORE-6: `listStickies(store)` returns entries sorted by `createdAt` ASC, then `id` ASC (seed 3 with controlled createdAt + assert order); `listStickies({})` returns `[]`.
- AC-STORE-7: round-trip create → list → delete → list reflects each mutation.

#### AC-IDS (id generator — SP1)

- AC-IDS-1: `createStickyId()` returns a non-empty string; 100 calls are all unique.
- AC-IDS-2: when `crypto.randomUUID` present → returns a UUID-shaped string.
- AC-IDS-3: when `crypto.randomUUID` stubbed undefined → returns a `sticky-`-prefixed fallback string.

#### AC-REGISTRY-STICKIES (storage registry — SP1, in plugin-web-storage)

- AC-REGISTRY-STICKIES-1: `PREF_REGISTRY.xai_dashboard_stickies` has `key === "xai_dashboard_stickies"`, `codec === "json"`, `default` deep-equals `{}`, `owner === "xai-web-dashboard-widgets"`, `category === "module"`, `schemaVersion === 1`, `proposed` undefined. (Mirror of AC-REGISTRY-CREATE-1, registry.test.ts:250-265.)
- AC-REGISTRY-STICKIES-2: `setPref("xai_dashboard_stickies", fixture)` then `getPref` round-trips a `Record<string, UserSticky>` fixture with no corruption; absent key returns `{}`. (Mirror of AC-REGISTRY-CREATE-2.)
- AC-REG-8 (existing, auto-derives): total count `=== 20 + OWNER_ROW_ADDITIONS.length` stays green after adding `xai_dashboard_stickies` to `OWNER_ROW_ADDITIONS` (registry.test.ts:230) + the parity exclusion list (parity-design-md.test.ts:165).

#### AC-COMPOSER (StickyComposer — SP2)

- AC-COMPOSER-1: `open={true}` calls `showModal()` (dialog `.open`); `open={false}` calls `close()`.
- AC-COMPOSER-2: on open, the `<textarea>` is autofocused (after `setTimeout(0)` flush).
- AC-COMPOSER-3: typing text + clicking a color chip + Save calls `onSave({ text, color })` with the trimmed text + chosen color.
- AC-COMPOSER-4: Save with empty/whitespace-only text does NOT call `onSave`; shows inline error; composer stays open.
- AC-COMPOSER-5: Cancel button calls `onClose`; ESC (native `cancel` event) calls `onClose`; backdrop click (`e.target === dialog`) calls `onClose`; clicking inside content does NOT close.
- AC-COMPOSER-6: color picker is `role="radiogroup"`; exactly one chip `aria-checked="true"` at a time; default checked = `sun`.
- AC-COMPOSER-7: `aria-modal="true"` + `aria-labelledby="sticky-composer-title"` present.
- AC-COMPOSER-8: bilingual — `lang="zh"` renders zh STR for title/labels/buttons/error; `STR_STICKY_COMPOSER` every key has both `en` + `zh` (grep-assert).
- AC-COMPOSER-9: textarea has `aria-required="true"` and gains `aria-describedby` pointing at the error node only when the error is shown.

#### AC-HOOK (useStickies — SP3)

- AC-HOOK-1: `create(draft)` adds a sticky to `list` + persists to `xai_dashboard_stickies` (read back via `usePref`/`getPref`); returns the created entity.
- AC-HOOK-2: `remove(id)` removes from `list` + persists; `remove("missing")` is a no-op (no `setPref` write — list reference stable).
- AC-HOOK-3: `list` is sorted createdAt ASC across multiple creates.
- AC-HOOK-4: a second hook instance reading the same key sees the persisted value (storage round-trip; transitive cross-tab via usePref).

#### AC-STICKIES-CREATE (widget wire + render + delete — SP3)

- AC-STICKIES-CREATE-1: header `+` button has an `onClick`; clicking it opens the composer (dialog `.open`). (Regression vs the SHIPPED no-op `StickiesWidget.tsx:24-27`.)
- AC-STICKIES-CREATE-2: empty store → renders 3 fixture samples (`data-sample="true"`) + the empty-create hint; samples have NO `.sticky-del` button (RS6).
- AC-STICKIES-CREATE-3: after `create` (composer Save), the new user sticky appears in the body and the fixture samples disappear (G1 disposition).
- AC-STICKIES-CREATE-4: a user sticky renders `s.text` (string) as its text and `background = STICKY_COLORS[s.color]`; does NOT crash on a string (no `[lang]` index — RS4).
- AC-STICKIES-CREATE-5: each user sticky has a `.sticky-del` `×` button (`data-no-drag`, `aria-label` "Delete note: …"); clicking it removes that sticky (RS6 inverse).
- AC-STICKIES-CREATE-6: create → unmount/remount widget → the sticky persists (real `usePref` round-trip; integration create→persist→refresh).
- AC-STICKIES-CREATE-7: delete → unmount/remount → the deletion persists (integration delete→persist→refresh).
- AC-STICKIES-CREATE-8: composer stays open across a `ctx.now` re-render (simulate grid tick by re-rendering the parent with a new `now`; assert dialog still `.open` — RS5).

### §E.3 a11y coverage

AC-COMPOSER-6/7/9 cover composer a11y (radiogroup, aria-modal/labelledby, aria-required/describedby). AC-STICKIES-CREATE-5 covers the delete-button accessible name. Bilingual covered by AC-COMPOSER-8 (+ each widget-branch test runs at least one zh assertion).

### §E.4 Mock strategy (extension)

- `usePref` / storage = real jsdom localStorage (NOT mocked) — same as SHIPPED §5; integration tests `localStorage.clear()` in `beforeEach` and seed via `setPref` when the non-empty branch is under test.
- `createStickyId` = real for most tests; AC-IDS-3 stubs `globalThis.crypto.randomUUID` to undefined to exercise the fallback.
- Composer dialog: jsdom supports `<dialog>` `showModal`/`close`/`cancel` (same as the SHIPPED EventComposer/TaskComposer tests rely on); reuse `setup.ts`.
- `StickiesWidget` is rendered standalone with `lang` prop (its render fn signature is `<StickiesWidget lang={ctx.lang} />`); no grid host needed for unit/integration. The "grid tick" in AC-STICKIES-CREATE-8 is simulated by re-rendering with React's `rerender`.

### §E.5 Cross-vendor manual smoke (queued — SP4, may defer per ADR-0008 §S3)

`pnpm --filter @repo/web dev` in Chrome / Safari 17+ / Firefox → `/app/dashboard`:
1. Stickies widget shows 3 sample notes on a fresh profile.
2. Click `+` → composer opens; type a note; pick each of the 5 colors; Save → new sticky appears, samples gone.
3. Empty-text Save → inline error, no create.
4. ESC / backdrop / Cancel close the composer without creating.
5. Delete a sticky via `×` → it disappears.
6. Reload → created stickies + deletions persist (DevTools Application tab shows `xai_dashboard_stickies`).
7. Drag-reorder the dashboard still works (composer is in the top layer, not the drag surface — RS3); the sticky body + `×` carry `data-no-drag`.
8. Light/dark theme — preset colors legible in both.
9. Cross-tab: open two tabs, create in one → other reflects after focus (usePref storage listener).

### §E.6 Test totals (extension estimate)

- New widget-pkg tests: ~35-46 (AC-STORE 7 + AC-IDS 3 + AC-COMPOSER 9 + AC-HOOK 4 + AC-STICKIES-CREATE 8 + barrel unchanged).
- New storage-pkg tests: 2 (AC-REGISTRY-STICKIES-1/2) + 2 parity-array edits (AC-REG-8 auto-derives, AC-PARITY exclusion).
- SHIPPED 93 widget tests stay green (AC-STICKIES-1..3 re-homed under empty-store branch per RS-NOTE). Storage suite + web suite stay green.
