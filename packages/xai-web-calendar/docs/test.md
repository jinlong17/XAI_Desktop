# Test Strategy — @repo/plugin-web-calendar

> Mirrors `design.md` + `api.md`. AC IDs are traceable to the seed
> brief acceptance signal and to `discovery-review.md` §6 risks.

## 1. Test pyramid

| Layer | Tool | Files | Coverage target |
|---|---|---|---|
| Pure helpers | Vitest (jsdom) | `dateKeys.test.ts`, `isoWeekNumber.test.ts`, `monthGridCells.test.ts`, `holidays.test.ts`, `weekdays.test.ts`, `formatMonth.test.ts`, `sampleEvents.test.ts` | 100 % branches |
| Components | Vitest + RTL | `CalendarToolbar.test.tsx`, `MonthGrid.test.tsx`, `MonthCell.test.tsx`, `ComingSoonPanel.test.tsx`, `CalendarBanner.test.tsx`, `CalendarModule.render.test.tsx`, `CalendarModule.i18n.test.tsx`, `CalendarModule.nav.test.tsx`, `CalendarModule.deeplink.test.tsx`, `CalendarModule.weekstart.test.tsx`, `CalendarModule.events.test.tsx` | ≥ 90 % statements / ≥ 85 % branches |
| Type-level | Vitest `expectTypeOf` | `types.test-d.ts` | All public types |
| Style tokens | Vitest grep on `styles.css` | `styles.css.tokens.test.ts` | All 4 event color rules + dark overrides |
| Index barrel | Vitest | `index-barrel.test.ts` | All exports present |
| Slot registration | Vitest | `registration.test.tsx` | Slot shape + label/icon/i18nKey/railOrder |
| Host integration | extend existing | `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts` (extend) | Calendar slot is wired |
| Storage registry | extend existing | `packages/plugin-web-storage/src/__tests__/registry.test.ts` (extend) | `xai_pref_week_start` entry present |

## 2. AC matrix

### 2.1 AC-RENDER — Month grid renders correctly

| ID | Description | Phase | File |
|---|---|---|---|
| AC-RENDER-1 | `<CalendarModule lang="en" />` renders without throwing | P1 | `CalendarModule.render.test.tsx` |
| AC-RENDER-2 | Toolbar has 3 view-tab buttons | P1 | `CalendarToolbar.test.tsx` |
| AC-RENDER-3 | Month grid has 7 weekday headers + 35 or 42 cells (depends on month) | P1 | `MonthGrid.test.tsx` |
| AC-RENDER-4 | Default month is May 2026 — title shows "May 2026" / "2026 年 5 月" | P1 | `CalendarModule.render.test.tsx` |
| AC-RENDER-5 | Sample-data banner is visible (lang-correct) | P1 | `CalendarBanner.test.tsx` |
| AC-RENDER-6 | Today-pill wraps exactly one day (the UTC today) within the displayed month, never in pad cells | P1 | `CalendarModule.render.test.tsx` |

### 2.2 AC-EVENT — Event chips

| ID | Description | Phase | File |
|---|---|---|---|
| AC-EVENT-1 | Day 1 renders 4 chips (amber/blue/mint/mint per fixture) | P1 | `MonthGrid.test.tsx` |
| AC-EVENT-2 | Day 14 renders 0 chips | P1 | `MonthGrid.test.tsx` |
| AC-EVENT-3 | Day 22 renders 3 chips with the correct titles | P1 | `MonthGrid.test.tsx` |
| AC-EVENT-4 | Days that have a `time` field render `<.ev-time.mono>` | P1 | `MonthGrid.test.tsx` |
| AC-EVENT-5 | Chips use only the 4 declared colors (mint/amber/blue/violet) | P1 | `sampleEvents.test.ts` |
| AC-EVENT-6 | Pad-cells (`m: prev` / `next`) never render chips | P1 | `MonthCell.test.tsx` |
| AC-EVENT-7 | The module does NOT emit any `web:*` event (greps `src/` for `emitWebEvent` import) | P1 | `events.test.ts` |

### 2.3 AC-FIXTURE — `SAMPLE_EVENTS` byte parity with i18n.js

| ID | Description | Phase | File |
|---|---|---|---|
| AC-FIXTURE-1 | `SAMPLE_EVENTS` has exactly 31 day-of-month keys (1..31) | P1 | `sampleEvents.test.ts` |
| AC-FIXTURE-2 | Day 14 + day 31 are empty arrays | P1 | `sampleEvents.test.ts` |
| AC-FIXTURE-3 | Total event count = 65 | P1 | `sampleEvents.test.ts` |
| AC-FIXTURE-4 | Every event has `c` in `{mint, amber, blue, violet}` | P1 | `sampleEvents.test.ts` |
| AC-FIXTURE-5 | Every event has bilingual title (`t.en` + `t.zh`) | P1 | `sampleEvents.test.ts` |
| AC-FIXTURE-6 | Day 7 yoga event has `time: "19:00"` | P1 | `sampleEvents.test.ts` |

### 2.4 AC-VIEW — View switcher

| ID | Description | Phase | File |
|---|---|---|---|
| AC-VIEW-1 | All 3 tabs rendered (Day / Week / Month) | P1 | `CalendarToolbar.test.tsx` |
| AC-VIEW-2 | Month is `aria-selected="true"` by default | P1 | `CalendarToolbar.test.tsx` |
| AC-VIEW-3 | Clicking Week flips `aria-selected` to Week + replaces grid with ComingSoonPanel | P3 | `CalendarModule.render.test.tsx` |
| AC-VIEW-4 | ComingSoonPanel shows `cal.coming_soon` bilingually | P3 | `ComingSoonPanel.test.tsx` |
| AC-VIEW-5 | Clicking back to Month restores the grid | P3 | `CalendarModule.render.test.tsx` |

### 2.5 AC-I18N — Bilingual parity

| ID | Description | Phase | File |
|---|---|---|---|
| AC-I18N-1 | EN: title "May 2026", weekdays "Sun..Sat" (or "Mon..Sun" depending on weekStart) | P1 | `CalendarModule.i18n.test.tsx` |
| AC-I18N-2 | ZH: title "2026 年 5 月", weekdays "周一..周日" / "周日..周六" | P1 | `CalendarModule.i18n.test.tsx` |
| AC-I18N-3 | EN: today button text "Today"; ZH: "今天" | P1 | `CalendarToolbar.test.tsx` |
| AC-I18N-4 | EN: holiday May 1 = "Labor Day"; ZH = "劳动节" | P2 | `MonthCell.test.tsx` |
| AC-I18N-5 | EN: holiday May 9 = "Mother's Day"; ZH = "母亲节" | P2 | `MonthCell.test.tsx` |
| AC-I18N-6 | EN: coming-soon "Week and Day views are coming soon."; ZH: "周视图与日视图即将推出。" | P3 | `ComingSoonPanel.test.tsx` |
| AC-I18N-7 | EN: banner copy; ZH: banner copy (both byte-parity with prototype) | P1 | `CalendarBanner.test.tsx` |

### 2.6 AC-NAV — Month navigation

| ID | Description | Phase | File |
|---|---|---|---|
| AC-NAV-1 | Click `>`: displayedMonth (2026, 5) → (2026, 6) | P2 | `CalendarModule.nav.test.tsx` |
| AC-NAV-2 | Click `<`: (2026, 5) → (2026, 4) | P2 | `CalendarModule.nav.test.tsx` |
| AC-NAV-3 | December → January year rollover | P2 | `CalendarModule.nav.test.tsx` |
| AC-NAV-4 | Click `today`: returns to (2026, 5) regardless of current | P2 | `CalendarModule.nav.test.tsx` |
| AC-NAV-5 | Nav clears `focusedDate` (no orphan highlight after navigation) | P2 | `CalendarModule.nav.test.tsx` |
| AC-NAV-6 | Title updates to match new displayedMonth (EN + ZH) | P2 | `CalendarModule.nav.test.tsx` |

### 2.7 AC-DEEPLINK — Deep-link from MiniCal

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DEEPLINK-1 | `emitWebEvent("web:shell:module-change", { moduleId:"calendar", focusDate:"2026-05-23", source:"mini-cal" })` sets `focusedDate` to "2026-05-23" | P2 | `CalendarModule.deeplink.test.tsx` |
| AC-DEEPLINK-2 | The matching cell receives `data-focused="true"` | P2 | `CalendarModule.deeplink.test.tsx` |
| AC-DEEPLINK-3 | Subsequent click on `<` clears `focusedDate` | P2 | `CalendarModule.deeplink.test.tsx` |
| AC-DEEPLINK-4 | `moduleId !== "calendar"` payloads are ignored (no re-render) | P2 | `CalendarModule.deeplink.test.tsx` |
| AC-DEEPLINK-5 | Cross-month deep-link (`focusDate:"2026-06-15"`) navigates `displayedMonth` to (2026, 6) AND sets focusedDate | P2 | `CalendarModule.deeplink.test.tsx` |
| AC-DEEPLINK-6 | Malformed `focusDate:"not-a-date"` logs single `console.warn` and does not crash | P2 | `CalendarModule.deeplink.test.tsx` |

### 2.8 AC-WEEKSTART — Week-start preference

| ID | Description | Phase | File |
|---|---|---|---|
| AC-WEEKSTART-1 | Default render with no stored pref: Sunday-first headers + grid | P2 | `CalendarModule.weekstart.test.tsx` |
| AC-WEEKSTART-2 | `setPref("xai_pref_week_start", 1)` → re-render → Monday-first headers + grid | P2 | `CalendarModule.weekstart.test.tsx` |
| AC-WEEKSTART-3 | Flipping back to 0 restores Sunday-first | P2 | `CalendarModule.weekstart.test.tsx` |

### 2.9 AC-GRID — `monthGridCells` correctness

| ID | Description | Phase | File |
|---|---|---|---|
| AC-GRID-1 | May 2026 Sunday-first: 35 cells, first cell = Apr 26 | P1 | `monthGridCells.test.ts` |
| AC-GRID-2 | May 2026 Monday-first: 35 cells, first cell = Apr 27 | P1 | `monthGridCells.test.ts` |
| AC-GRID-3 | Aug 2026 Sunday-first: 42 cells (6 rows) | P1 | `monthGridCells.test.ts` |
| AC-GRID-4 | Feb 2024 (leap year) Sunday-first: 35 cells | P1 | `monthGridCells.test.ts` |
| AC-GRID-5 | Pad cells flagged `inMonth: false` | P1 | `monthGridCells.test.ts` |
| AC-GRID-6 | `weekNum` populated only on column 0 | P1 | `monthGridCells.test.ts` |
| AC-GRID-7 | Holiday lookup attaches `holidayKey` on May 1 + May 9 | P2 | `monthGridCells.test.ts` |

### 2.10 AC-ISO — ISO 8601 week numbers

| ID | Description | Phase | File |
|---|---|---|---|
| AC-ISO-1 | `isoWeekNumber(new Date(Date.UTC(2026,3,27)))` returns 18 | P1 | `isoWeekNumber.test.ts` |
| AC-ISO-2 | Year-start edge: Jan 1 2026 (Thu) → week 1 | P1 | `isoWeekNumber.test.ts` |
| AC-ISO-3 | Year-end edge: Dec 31 2026 (Thu) → week 53 | P1 | `isoWeekNumber.test.ts` |
| AC-ISO-4 | Jan 1 2023 (Sun) → week 52 (belongs to 2022) | P1 | `isoWeekNumber.test.ts` |

### 2.11 AC-DATE — Date helpers

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DATE-1 | `utcDateKey(new Date(Date.UTC(2026,4,1)))` = "2026-05-01" | P1 | `dateKeys.test.ts` |
| AC-DATE-2 | `daysInMonth(2024, 2)` = 29 (leap) | P1 | `dateKeys.test.ts` |
| AC-DATE-3 | `daysInMonth(2025, 2)` = 28 (non-leap) | P1 | `dateKeys.test.ts` |
| AC-DATE-4 | `isLeapYear(2000)` = true (centennial) | P1 | `dateKeys.test.ts` |
| AC-DATE-5 | `isLeapYear(1900)` = false (centennial non-leap) | P1 | `dateKeys.test.ts` |
| AC-DATE-6 | `pad2(7)` = "07"; `pad2(12)` = "12" | P1 | `dateKeys.test.ts` |

### 2.12 AC-TODAY — Today detection

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TODAY-1 | Today-pill wraps current UTC date (vi.useFakeTimers mock) | P1 | `CalendarModule.render.test.tsx` |
| AC-TODAY-2 | Pad cells never receive the pill, even when the real today matches the day-number | P1 | `MonthCell.test.tsx` |
| AC-TODAY-3 | DST boundary (Mar 8 2026 US spring-forward): pill stays on UTC day | P1 | `CalendarModule.render.test.tsx` |

### 2.13 AC-TOKENS — Style tokens

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TOKENS-1 | `styles.css` has the 4 event-color rules with the exact oklch values from `web design/layout.css:849-852` | P1 | `styles.css.tokens.test.ts` |
| AC-TOKENS-2 | Dark-theme `.ev-{c}` overrides match `layout.css:853-856` | P3 | `styles.css.tokens.test.ts` |

### 2.14 AC-REGISTRY — Storage registry entry

| ID | Description | Phase | File |
|---|---|---|---|
| AC-REGISTRY-1 | `PREF_REGISTRY.xai_pref_week_start` exists | P2 | `packages/plugin-web-storage/src/__tests__/registry.test.ts` (extend) |
| AC-REGISTRY-2 | Entry has `default: 0`, `codec: "number"`, `owner: "xai-web-calendar"`, `schemaVersion: 1` | P2 | `packages/plugin-web-storage/src/__tests__/registry.test.ts` (extend) |

### 2.15 AC-SHELL — Slot + host wiring

| ID | Description | Phase | File |
|---|---|---|---|
| AC-SHELL-1 | `calendarSlotRegistration` shape matches `WebModuleSlotRegistration` | P1 | `registration.test.tsx` |
| AC-SHELL-2 | `CalendarSlotHost` reads `lang` from `useWebShell` and renders `CalendarModule` | P1 | `registration.test.tsx` |
| AC-SHELL-3 | `apps/web/src/routes/modules/shellRegistrations.tsx` has `calendarSlotRegistration` at railOrder 5 (no `placeholder("calendar", …)` row) | P1 | `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts` (extend) |

### 2.16 AC-BARREL — index.ts exports

| ID | Description | Phase | File |
|---|---|---|---|
| AC-BARREL-1 | `index.ts` exports `CalendarModule`, `calendarSlotRegistration`, types | P1 | `index-barrel.test.ts` |

### 2.17 AC-TYPE — Type-level checks

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TYPE-1 | `CalendarModuleProps` matches `{ lang: Lang }` | P1 | `types.test-d.ts` |
| AC-TYPE-2 | `CalEvent.c` is the union `"mint" \| "amber" \| "blue" \| "violet"` | P1 | `types.test-d.ts` |
| AC-TYPE-3 | `MonthCellData.weekNum` is optional `number` | P1 | `types.test-d.ts` |
| AC-TYPE-4 | `calendarSlotRegistration` is assignable to `WebModuleSlotRegistration` | P1 | `types.test-d.ts` |

## 3. Mock strategy

- **Date / time**: `vi.useFakeTimers({ shouldAdvanceTime: false })` +
  `vi.setSystemTime(new Date(Date.UTC(2026, 4, 22)))` in tests where
  today-detection matters (AC-TODAY-1..3, AC-RENDER-6).
- **localStorage**: cleared in `vitest.config.ts` `setupFiles` (mirrors
  habits sibling).
- **Event bus**: `emitWebEvent` from `@repo/xai-web-event-bus` is used
  directly in deep-link tests — the bus is in-process synchronous, no
  mocking needed. Test asserts state changes via RTL queries on the
  rendered DOM.
- **`useWebShell`** in slot tests: a thin test harness `<WebShellTestProvider lang="en">`
  that wraps `<CalendarSlotHost />` per the matrix / habits sibling pattern.
- **`usePref`** for AC-WEEKSTART-2 / 3: write the storage key via
  `setPref("xai_pref_week_start", 1)` from `@repo/plugin-web-storage`
  and rely on the in-process bus for re-render (mirrors habits AC-PERSIST tests).

## 4. Coverage targets

- Statements ≥ 90 %
- Branches ≥ 85 %
- Functions ≥ 95 %
- Lines ≥ 90 %

Pure helpers (`internal/*.ts`) should hit 100 % across all four
dimensions.

## 5. Quality gates (per phase)

### P1 exit

- `pnpm --filter @repo/plugin-web-calendar test` — green.
- `pnpm --filter @repo/plugin-web-calendar check-types` — 0.
- `pnpm --filter @repo/plugin-web-calendar lint` — 0 warnings (eslint
  `--max-warnings 0`).
- `pnpm --filter @repo/web check-types` — 0 (slot wiring).
- `pnpm --filter @repo/web test` — green (extended shell registration test).
- Manual: `pnpm dev` in `apps/web/`; visit `/app/calendar`; see May 2026
  with all 65 events.

### P2 exit

- All P1 gates + month-nav + deep-link + week-start tests green.
- `pnpm --filter @repo/plugin-web-storage check-types` — 0 (new
  registry entry).
- `pnpm --filter @repo/plugin-web-storage test` — green (extended
  registry test).
- `pnpm --filter @repo/plugin-web-tokens check-types` — 0 (i18n delta).
- `pnpm --filter @repo/plugin-web-tokens test` — green (i18n bundle
  parity).
- Manual: visit /app/calendar; click `>` `<` `today` buttons; emit
  test deep-link via DevTools (see Manual Smoke §6 step 4).

### P3 exit

- All P2 gates + view-switcher + ComingSoonPanel + dark-theme tokens
  tests green.
- `pnpm --filter @repo/plugin-web-calendar test:coverage` meets §4
  targets.
- Cross-vendor smoke §6 XVENDOR-1..9 recorded or formally DEFERRED to
  ship-time human (matches matrix / habits precedent).
- All docs synced with any concrete-vs-planned deltas.

## 6. Cross-vendor manual smoke

| ID | Browser | Steps | Expected |
|---|---|---|---|
| XVENDOR-1 | Safari 17+ | Open `/app/calendar` | 35-cell grid + 65 chips visible |
| XVENDOR-2 | Chrome 120+ | Inspect chip colors | 4 distinct oklch shades (mint/amber/blue/violet) |
| XVENDOR-3 | Firefox 120+ | Click Day / Week / Month tabs | aria-selected flips; grid swaps with ComingSoon |
| XVENDOR-4 | Safari 17+ | In DevTools, run `emitWebEvent("web:shell:module-change", {moduleId:"calendar", focusDate:"2026-05-23", source:"mini-cal"})` | Cell May 23 gets outline |
| XVENDOR-5 | Chrome 120+ | Click `<`, `>`, `today` | Title updates; no console errors |
| XVENDOR-6 | Firefox 120+ | Toggle EN ↔ ZH in topbar | Title, weekday headers, holiday labels all update |
| XVENDOR-7 | Safari 17+ | Click Week, then Day | Coming-soon copy bilingually correct |
| XVENDOR-8 | Chrome 120+ | DevTools: `setPref("xai_pref_week_start", 1)` | Grid re-renders Mon-first |
| XVENDOR-9 | Firefox 120+ | Full session: nav + deep-link + lang flip + week-start flip | No console warnings or errors |

XVENDOR-1..9 may be **DEFERRED** to ship-time human (precedent:
matrix / countdown / pet / habits) and recorded as such in `dev_log.md`
during `feature-verify`.

## 7. Verify checklist (used by `feature-verify`)

1. All P1 + P2 + P3 quality gates pass.
2. AC-FIXTURE-1..6 confirms sample data parity with `web design/i18n.js`.
3. AC-EVENT-7 confirms no `emitWebEvent` import in `src/`.
4. AC-TOKENS-1..2 confirms exact oklch values from layout.css.
5. AC-DEEPLINK-1..6 confirms deep-link reception works.
6. AC-WEEKSTART-1..3 + AC-REGISTRY-1..2 confirm week-start preference
   wires correctly.
7. AC-SHELL-1..3 confirm the host shell uses the real registration (no
   placeholder).
8. Lint passes with `--max-warnings 0` across all touched workspaces.
9. Commit hygiene: one commit per phase, `type(scope): summary` format,
   Why/What/Scope/Risk/Docs/Tests body.
10. Cross-vendor XVENDOR-1..9 recorded or formally DEFERRED.

---

## 8. 2026-05-25 Extension — Week + Day Views test strategy (gap-closure row #4)

> APPEND-ONLY. §1..§7 above continue to apply byte-for-byte. **The 90
> SHIPPED test cases MUST stay green.** §8 is purely additive: new
> test files + a small number of modifications to existing test files
> that are explicitly enumerated below.
>
> Pattern reference: `packages/xai-web-ai-chat/docs/test.md` §7
> (gap-closure row #2 extension test strategy).

### 8.0 Test scope summary (extension)

| Category | Files | Cases | Acceptance |
|---|---|---|---|
| Existing 90 cases (status quo) | 18 files in `packages/xai-web-calendar/src/__tests__/` | 90 | All green, NO regressions allowed |
| New unit — date-key parsing | `parseDateKey.test.ts` | 6 | green |
| New unit — week window math | `weekWindow.test.ts` | 8 | green |
| New unit — time-grid math | `timeGridMath.test.ts` | 12 | green |
| New unit — event-block packing | `placeEventBlocks.test.ts` | 10 | green |
| New component — TimeGrid | `TimeGrid.test.tsx` | 8 | green |
| New component — WeekView | `WeekView.test.tsx` | 14 | green |
| New component — DayView | `DayView.test.tsx` | 10 | green |
| New integration — view toggle + persistence | `CalendarModule.viewtoggle.test.tsx` | 12 | green |
| New integration — activeDate refactor | `CalendarModule.activedate.test.tsx` | 8 | green |
| New perf budget | `perfBudget.test.ts` | 1 (PB-EXT-1) | green |
| Modified fixture — endTime field | `sampleEvents.test.ts` (extend) | +3 (AC-FIXTURE-EXT-1..3) | green |
| Modified events scan — extend file list | `events.test.ts` (extend) | unchanged count, broader scope | green |
| Modified barrel | `index-barrel.test.ts` (extend) | +5 (AC-BARREL-EXT-1..5) | green |
| Modified types — extended type checks | `types.test-d.ts` (extend) | +4 (AC-TYPE-EXT-1..4) | green |
| Modified styles tokens — block variant + DST | `styles.css.tokens.test.ts` (extend) | +3 (AC-TOKENS-EXT-1..3) | green |
| New `@repo/plugin-web-storage` registry test | `registry-presence.test.ts` (extend) OR `packages/plugin-web-storage/src/__tests__/registry.test.ts` (extend) | +2 (AC-REGISTRY-EXT-1..2) | green |
| Existing `apps/web` 100 cases | as-is | 100 | All green, NO regressions |

Cumulative new cases: ~89 (78 new in plugin-web-calendar + 11
modifier-additions across calendar + storage tests).

### 8.1 Mock strategy (extension)

- **Date / time**: `vi.useFakeTimers({ shouldAdvanceTime: false })` +
  `vi.setSystemTime(...)` per test for now-line + scroll-on-mount tests.
- **localStorage**: cleared in `setup.ts` per existing test setup (mirrors SHIPPED v1).
- **Timezone**: jsdom inherits the host process tz. Tests that assert
  DST behavior use the static `dstHoursForDay` table for 2026 US Pacific
  (Mar 8 spring + Nov 1 fall); tests do NOT rely on the actual host tz
  matching PT.
- **`usePref("xai_calendar_view", …)`**: NOT mocked. Real
  `@repo/plugin-web-storage` round-trip; new key tested in
  AC-PERSIST-EXT-1..3.
- **`useWebEventListener`**: NOT mocked. Real bus singleton; tests use
  `emitWebEvent(...)` to drive deep-link scenarios.
- **`scrollIntoView` / `container.scrollTop`**: jsdom stubs scroll
  behavior; tests assert via `container.scrollTop` direct read after
  the `useEffect` flush via `act(...)`.

### 8.2 New AC matrix (extension)

#### AC-CALVIEW-PERSIST — `xai_calendar_view` persistence

| ID | Description | Phase | File |
|---|---|---|---|
| AC-PERSIST-EXT-1 | Default render with no stored pref → `view = "month"` | P4 | `CalendarModule.viewtoggle.test.tsx` |
| AC-PERSIST-EXT-2 | Click Week → localStorage["xai_calendar_view"] = "week" | P4 | `CalendarModule.viewtoggle.test.tsx` |
| AC-PERSIST-EXT-3 | Unmount + remount with localStorage["xai_calendar_view"] = "day" → mounts with `view = "day"` | P4 | `CalendarModule.viewtoggle.test.tsx` |
| AC-REGISTRY-EXT-1 | `PREF_REGISTRY.xai_calendar_view` exists with `default: "month"`, `codec: "string"`, `owner: "xai-web-calendar"`, `schemaVersion: 1`, `category: "module"` | P1 | `packages/plugin-web-storage/src/__tests__/registry.test.ts` (extend) |
| AC-REGISTRY-EXT-2 | `CalendarViewId` type alias exported from `@repo/plugin-web-storage` index barrel; assignable to literal `"month" \| "week" \| "day"` | P1 | `types.test-d.ts` (extend, or new types-d test in storage package) |

#### AC-TOGGLE — View toggle preserves activeDate

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TOGGLE-1 | Toggle Month → Week → Day → Month: activeDate stays identical at each step | P4 | `CalendarModule.viewtoggle.test.tsx` |
| AC-TOGGLE-2 | Click Week tab while in Month: ComingSoonPanel NOT in DOM; WeekView IS in DOM | P4 | `CalendarModule.viewtoggle.test.tsx` |
| AC-TOGGLE-3 | Click Month tab while in Day: DayView NOT in DOM; MonthGrid IS in DOM | P4 | `CalendarModule.viewtoggle.test.tsx` |

#### AC-ACTIVEDATE — Single-source-of-truth state refactor

| ID | Description | Phase | File |
|---|---|---|---|
| AC-ACTIVEDATE-1 | `activeDate` initializes to MAY_2026_ANCHOR_TODAY ("2026-05-22") | P1 | `CalendarModule.activedate.test.tsx` |
| AC-ACTIVEDATE-2 | `displayedMonth` derived: equals `{ year: 2026, month: 5 }` for MAY_2026_ANCHOR_TODAY | P1 | `CalendarModule.activedate.test.tsx` |
| AC-ACTIVEDATE-3 | Click ">" in Month view: activeDate steps to first day of next month (or carries day-of-month if valid) | P4 | `CalendarModule.activedate.test.tsx` |
| AC-ACTIVEDATE-4 | Click ">" in Week view: activeDate steps +7 days | P4 | `CalendarModule.activedate.test.tsx` |
| AC-ACTIVEDATE-5 | Click ">" in Day view: activeDate steps +1 day | P4 | `CalendarModule.activedate.test.tsx` |
| AC-ACTIVEDATE-6 | Click "today" button: activeDate resets to MAY_2026_ANCHOR_TODAY regardless of view | P4 | `CalendarModule.activedate.test.tsx` |
| AC-ACTIVEDATE-7 | Year rollover in Month: Dec → Jan flips year | P4 | `CalendarModule.activedate.test.tsx` |
| AC-ACTIVEDATE-8 | All 90 SHIPPED tests still green after refactor (validated via `pnpm --filter @repo/plugin-web-calendar test`) | P1 | (full suite) |

#### AC-DEEPLINK-EXT — Deep-link extension semantics

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DEEPLINK-EXT-1 | Deep-link with `focusDate: "2026-05-23"` while `view: "week"`: view flips to "month"; activeDate = "2026-05-23"; focusedFromDeepLink = "2026-05-23"; xai_calendar_view = "month" written | P4 | `CalendarModule.viewtoggle.test.tsx` |
| AC-DEEPLINK-EXT-2 | Existing AC-DEEPLINK-1..6 still pass after refactor | P1 | `CalendarModule.deeplink.test.tsx` (already exists; verified green) |

#### AC-WEEK — Week view rendering

| ID | Description | Phase | File |
|---|---|---|---|
| AC-WEEK-1 | Renders 7 weekday columns | P2 | `WeekView.test.tsx` |
| AC-WEEK-2 | Renders 24 hour rows (non-DST day) | P2 | `WeekView.test.tsx` |
| AC-WEEK-3 | Sun-first weekStart (0) → columns start Sun | P2 | `WeekView.test.tsx` |
| AC-WEEK-4 | Mon-first weekStart (1) → columns start Mon | P2 | `WeekView.test.tsx` |
| AC-WEEK-5 | activeDate column has `data-active="true"` | P2 | `WeekView.test.tsx` |
| AC-WEEK-6 | All-day events appear in the all-day strip, not in hour grid | P2 | `WeekView.test.tsx` |
| AC-WEEK-7 | Multi-hour event (day 22 data analysis 11:00→13:00) renders as ONE rectangular block spanning 2 rows | P2 | `WeekView.test.tsx` |
| AC-WEEK-8 | Multi-hour event (day 23 0-1 product 14:00→16:30) renders as ONE block spanning ~3 rows (rounds up partial hour) | P2 | `WeekView.test.tsx` |
| AC-WEEK-9 | DST spring-forward (Mar 8 2026 week): the column shows 23 rows with "(DST)" label | P2 | `WeekView.test.tsx` |
| AC-WEEK-10 | DST fall-back (Nov 1 2026 week): the column shows 25 rows with "(DST)" label | P2 | `WeekView.test.tsx` |
| AC-WEEK-11 | Now-line appears only on today's column | P2 | `WeekView.test.tsx` |
| AC-WEEK-12 | Event titles render bilingually (EN + ZH per `lang` prop) | P2 | `WeekView.test.tsx` |
| AC-WEEK-13 | activeDate within week containing 2026-05-22: 7 days = May 17..23 (Sun-first) | P2 | `WeekView.test.tsx` |
| AC-WEEK-14 | Listen-only: no emitWebEvent (covered by AC-EVENT-7 extended grep) | — | `events.test.ts` |

#### AC-DAY — Day view rendering

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DAY-1 | Renders 1 column | P3 | `DayView.test.tsx` |
| AC-DAY-2 | Renders 24 hour rows (non-DST day) | P3 | `DayView.test.tsx` |
| AC-DAY-3 | All-day events appear in the all-day strip | P3 | `DayView.test.tsx` |
| AC-DAY-4 | Multi-hour blocks render as single rectangles | P3 | `DayView.test.tsx` |
| AC-DAY-5 | Scroll-to-current-hour on mount when activeDate === today | P3 | `DayView.test.tsx` |
| AC-DAY-6 | Scroll-to-8am on mount when activeDate !== today | P3 | `DayView.test.tsx` |
| AC-DAY-7 | DST spring-forward day (Mar 8 2026): 23 rows | P3 | `DayView.test.tsx` |
| AC-DAY-8 | DST fall-back day (Nov 1 2026): 25 rows | P3 | `DayView.test.tsx` |
| AC-DAY-9 | EN + ZH titles | P3 | `DayView.test.tsx` |
| AC-DAY-10 | Now-line visible only on today | P3 | `DayView.test.tsx` |

#### AC-PLACE — Event block packing

| ID | Description | Phase | File |
|---|---|---|---|
| AC-PLACE-1 | 1 event (9:00, no endTime) → 1 block, startRow=9, rowSpan=1, col=0, colSpan=1 | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-2 | 2 events overlapping (9:00-11:00 + 10:00-12:00) → 2 blocks side-by-side, each col=0/1, colSpan=2 | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-3 | 3 events overlapping → 3 blocks side-by-side, colSpan=3 | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-4 | All-day events (no time) → strip-only (allDay=true), zero hour-grid blocks | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-5 | Event with endTime < time → treat as 1-hour block (defensive default), warn once | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-6 | Event spanning midnight (endTime "00:30" with time "23:00") → clipped at row 24 (does NOT bleed to next day) | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-7 | Event ending at exact hour boundary (10:00→11:00) → rowSpan=1 | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-8 | Event ending at partial hour (10:00→10:30) → rowSpan=1 (rounded up via ceil) | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-9 | Empty events array → empty blocks array | P1 | `placeEventBlocks.test.ts` |
| AC-PLACE-10 | 5 events all overlapping → 5-column packing, colSpan=5 each | P1 | `placeEventBlocks.test.ts` |

#### AC-TZ — Timezone correctness

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TZ-1 | Hour labels match local clock (jsdom default) | P2 | `TimeGrid.test.tsx` |
| AC-TZ-2 | Event at time:"00:00" (midnight) belongs to the day it's keyed under in SAMPLE_EVENTS, NOT to the prior day | P2 | `placeEventBlocks.test.ts` |
| AC-TZ-3 | Event at time:"23:30" belongs to its keyed day, NOT to the next day | P2 | `placeEventBlocks.test.ts` |
| AC-TZ-4 | Cross-day events (would span midnight) are clipped to the current day's grid (AC-PLACE-6 dup) | P2 | `placeEventBlocks.test.ts` |

#### AC-DST — DST boundary

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DST-1 | Mar 8 2026 (US Pacific spring-forward): `dstHoursForDay("2026-03-08")` → `{ hours: 23, shift: { kind: "spring-forward", atRow: 2 } }`; TimeGrid renders 23 rows + "(DST)" label between rows 1 and 2 | P2 | `timeGridMath.test.ts` + `TimeGrid.test.tsx` |
| AC-DST-2 | Nov 1 2026 (US Pacific fall-back): `dstHoursForDay("2026-11-01")` → `{ hours: 25, shift: { kind: "fall-back", atRow: 1 } }`; TimeGrid renders 25 rows + "(DST)" label between the two "01:00" rows | P2 | `timeGridMath.test.ts` + `TimeGrid.test.tsx` |

#### AC-FIXTURE-EXT — sampleEvents endTime additions

| ID | Description | Phase | File |
|---|---|---|---|
| AC-FIXTURE-EXT-1 | 5 events have endTime field: day 7, day 8, day 10, day 22, day 23 | P1 | `sampleEvents.test.ts` (extend) |
| AC-FIXTURE-EXT-2 | All endTime values are valid "HH:MM" strings; each > the same event's time string-compare | P1 | `sampleEvents.test.ts` (extend) |
| AC-FIXTURE-EXT-3 | No other events have endTime (63 events without endTime; 68 total preserved per existing AC-FIXTURE-3) | P1 | `sampleEvents.test.ts` (extend) |

#### AC-EVENT-7 (extended) — listen-only invariant across new files

| ID | Description | Phase | File |
|---|---|---|---|
| AC-EVENT-7-EXT | grep `emitWebEvent` across NEW files (WeekView.tsx, DayView.tsx, TimeGrid.tsx, EventBlock.tsx, TimeGridAllDayStrip.tsx, TimeGridHourRow.tsx, TimeGridDayColumn.tsx) → zero matches | P2/P3 | `events.test.ts` (extend file list) |

#### AC-BARREL-EXT — index.ts public surface

| ID | Description | Phase | File |
|---|---|---|---|
| AC-BARREL-EXT-1 | `index.ts` exports `WeekView`, `DayView`, `TimeGrid` | P2 | `index-barrel.test.ts` |
| AC-BARREL-EXT-2 | `index.ts` exports type `WeekViewProps`, `DayViewProps`, `TimeGridProps` | P2 | `index-barrel.test.ts` |
| AC-BARREL-EXT-3 | `index.ts` re-exports `CalendarViewId` type from `@repo/plugin-web-storage` | P1 | `index-barrel.test.ts` |
| AC-BARREL-EXT-4 | `index.ts` exports type `EventBlock`, `DstShift` | P1 | `index-barrel.test.ts` |
| AC-BARREL-EXT-5 | `ComingSoonPanel` is NOT re-exported (it never was; this asserts deletion didn't add it accidentally) | P4 | `index-barrel.test.ts` |

#### AC-TYPE-EXT — type-level checks

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TYPE-EXT-1 | `CalEvent.endTime` is optional `string` | P1 | `types.test-d.ts` |
| AC-TYPE-EXT-2 | `WeekViewProps.activeDate` is `string` (not Date) | P2 | `types.test-d.ts` |
| AC-TYPE-EXT-3 | `CalendarViewId` is the literal union `"month" \| "week" \| "day"` | P1 | `types.test-d.ts` |
| AC-TYPE-EXT-4 | `EventBlock.allDay` is `boolean` (not optional) | P1 | `types.test-d.ts` |

#### AC-TOKENS-EXT — Block-variant style tokens

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TOKENS-EXT-1 | `styles.css` `.cal-event-block.ev-*` rules use the exact oklch values from `web design/layout.css:849-852` (byte-parity with existing `.cal-event.ev-*`) | P2 | `styles.css.tokens.test.ts` |
| AC-TOKENS-EXT-2 | Dark-theme `.cal-event-block.ev-*` overrides match `layout.css:853-856` | P2 | `styles.css.tokens.test.ts` |
| AC-TOKENS-EXT-3 | `.cal-coming-soon` rule REMOVED (assertion: regex no-match) | P4 | `styles.css.tokens.test.ts` |

### 8.3 New test file scope (file-by-file)

#### `parseDateKey.test.ts` (6 cases)

- PD1: `parseDateKey("2026-05-22")` → `{ year: 2026, month: 5, day: 22 }`.
- PD2: `parseDateKey("not-a-date")` → null.
- PD3: `parseDateKey("2026-13-01")` → null (month out of range).
- PD4: `parseDateKey("2026-02-30")` → null (day out of range for Feb).
- PD5: `parseDateKey("2024-02-29")` → `{ ..., day: 29 }` (leap year).
- PD6: `stepDateKey("2026-12-31", 1)` → `"2027-01-01"` (year rollover).

#### `weekWindow.test.ts` (8 cases)

- WW1: weekWindowFor("2026-05-22", 0) → 7 keys starting "2026-05-17" (Sun).
- WW2: weekWindowFor("2026-05-22", 1) → 7 keys starting "2026-05-18" (Mon).
- WW3: weekWindowFor("2026-05-01", 0) → starts "2026-04-26" (cross-month leading pad).
- WW4: weekWindowFor("2026-04-29", 0) → starts "2026-04-26".
- WW5: weekWindowFor("2026-12-31", 0) → window crosses year boundary; last key "2027-01-03".
- WW6: weekWindowFor("2026-01-01", 1) → first key "2025-12-29".
- WW7: weekWindowFor("2026-05-17", 0) → first key "2026-05-17" (already Sun).
- WW8: weekWindowFor("2026-05-18", 1) → first key "2026-05-18" (already Mon).

#### `timeGridMath.test.ts` (12 cases)

- TM1: parseHHMM("09:30") → { hours: 9, minutes: 30 }.
- TM2: parseHHMM("9:30") → null (strict 2-digit format).
- TM3: parseHHMM("24:00") → null (out of range).
- TM4: parseHHMM("invalid") → null.
- TM5: hourToRow(0, 0) → 0; hourToRow(23, 59) → 23.
- TM6: hourToRow with DST shift `{kind:"spring-forward", atRow:2}` → row 3 becomes row 2 (skip).
- TM7: rowsForBlock("09:00", "11:00") → 2.
- TM8: rowsForBlock("09:00", "11:30") → 3 (ceil).
- TM9: rowsForBlock("09:00", undefined) → 1 (default).
- TM10: dstHoursForDay("2026-03-08") → { hours: 23, shift: { kind: "spring-forward", atRow: 2 } }.
- TM11: dstHoursForDay("2026-11-01") → { hours: 25, shift: { kind: "fall-back", atRow: 1 } }.
- TM12: dstHoursForDay("2026-05-22") → { hours: 24 } (no shift).

#### `placeEventBlocks.test.ts` (10 cases)

See AC-PLACE-1..10 above.

#### `TimeGrid.test.tsx` (8 cases)

- TG1: Renders `<TimeGridAllDayStrip />` above scroll area.
- TG2: Renders 24 hour labels by default.
- TG3: Renders N day columns per `days.length`.
- TG4: Renders event blocks at correct `top`/`height` per row math.
- TG5: Renders `.cal-now-line` only on the column flagged `isToday: true`.
- TG6: DST spring-forward column shows 23 rows.
- TG7: DST fall-back column shows 25 rows.
- TG8: No-events day renders empty hour-grid (24 rows + no blocks).

#### `WeekView.test.tsx` (14 cases)

See AC-WEEK-1..14 above.

#### `DayView.test.tsx` (10 cases)

See AC-DAY-1..10 above.

#### `CalendarModule.viewtoggle.test.tsx` (12 cases)

- VT1: Default mount → view=month (AC-PERSIST-EXT-1).
- VT2: Click Week tab → view=week + localStorage write (AC-PERSIST-EXT-2).
- VT3: Unmount + remount with storage=day → mount in Day view (AC-PERSIST-EXT-3).
- VT4: Toggle Month → Week → Day → Month preserves activeDate (AC-TOGGLE-1).
- VT5: WeekView in DOM after Week tab click; ComingSoonPanel NOT in DOM (AC-TOGGLE-2).
- VT6: MonthGrid in DOM after Month tab click from Day view (AC-TOGGLE-3).
- VT7: Deep-link with focusDate flips view to month (AC-DEEPLINK-EXT-1).
- VT8: aria-selected flips correctly on each tab.
- VT9: Click active view tab is a no-op (no setState, no localStorage write).
- VT10: localStorage="invalid" → defaults to month.
- VT11: Switching views does NOT clear focusedFromDeepLink (preserved).
- VT12: Cross-tab `storage` event with `xai_calendar_view` change re-renders into the new view.

#### `CalendarModule.activedate.test.tsx` (8 cases)

See AC-ACTIVEDATE-1..8 above.

#### `perfBudget.test.ts` (1 case, PB-EXT-1)

Pattern reference: `packages/xai-web-cmdk/src/__tests__/perfBudget.test.ts`.

```ts
// PB-EXT-1: View toggle Month↔Week p95 < 50 ms (100 iterations on
// 68+5-event May 2026 fixture). Retry once if flaky (R-ext-3 mitigation).
import { it, expect, beforeAll } from "vitest";
import { render, act } from "@testing-library/react";
import { CalendarModule } from "../CalendarModule.js";
import { setPref } from "@repo/plugin-web-storage";

const ITER = 100;
const P95_MAX_MS = 50;

let durations: number[] = [];

beforeAll(async () => {
  const { rerender } = render(<CalendarModule lang="en" />);
  // Warm-up
  for (let i = 0; i < 5; i++) {
    setPref("xai_calendar_view", i % 2 === 0 ? "week" : "month");
    await act(async () => { rerender(<CalendarModule lang="en" />); });
  }
  // Measure
  durations = [];
  for (let i = 0; i < ITER; i++) {
    const start = performance.now();
    setPref("xai_calendar_view", i % 2 === 0 ? "week" : "month");
    await act(async () => { rerender(<CalendarModule lang="en" />); });
    durations.push(performance.now() - start);
  }
});

it(`PB-EXT-1 — view-toggle p95 < ${P95_MAX_MS}ms over ${ITER} iterations`, () => {
  const sorted = [...durations].sort((a, b) => a - b);
  const p95 = sorted[Math.ceil(0.95 * sorted.length) - 1] ?? 0;
  console.info(`[PB-EXT-1] view-toggle p95=${p95.toFixed(3)}ms (budget: ${P95_MAX_MS}ms)`);
  expect(p95).toBeLessThan(P95_MAX_MS);
});
```

### 8.4 Cross-vendor manual smoke (extension — XVENDOR-EXT-*)

| ID | Browser | Steps | Expected |
|---|---|---|---|
| XVENDOR-EXT-1 | Safari 17+ | Open `/app/calendar`. Click Week. | 7-column hour grid renders; 24 hour rows; all-day strip visible |
| XVENDOR-EXT-2 | Chrome 120+ | Click Day from Week. | 1-column grid; scroll position at today's hour (or 8am) |
| XVENDOR-EXT-3 | Firefox 120+ | Toggle Month → Week → Day → Month. | activeDate preserved (e.g., "today" cell highlighted in Month after Week navigation) |
| XVENDOR-EXT-4 | Safari 17+ | Inspect day 22 in Week view. | "Data Analysis 11:00" + "Brainstorming 11:30" + "Meditation" (all-day) all render: 2-row block for data + 1-row for brainstorming + strip entry for meditation |
| XVENDOR-EXT-5 | Chrome 120+ | Reload after picking Day view. | Returns to Day view (xai_calendar_view persistence). |
| XVENDOR-EXT-6 | Firefox 120+ | DevTools: emit `web:shell:module-change` with focusDate="2026-05-23" while in Week view. | View flips to Month; cell May 23 has data-focused outline. |

**Codex cold-read scenarios** (per HC9 + seed AC §5):

1. Confirm `dstHoursForDay` returns 23 / 25 / 24 for Mar 8 2026 / Nov 1
   2026 / May 22 2026.
2. Confirm `placeEventBlocks` never emits a block with `startRow + rowSpan
   > N` where N is the day's hour count.
3. Confirm no event at `time: "23:30"` ever appears in the next day's
   column.
4. Confirm hour labels are derived from local clock, not UTC.
5. Confirm Month/Week/Day all consume the same `SAMPLE_EVENTS` constant
   (no parallel store).

XVENDOR-EXT-1..6 + Codex 5 cold-read items may be **DEFERRED** to
ship-time human per the existing matrix / habits / cmdk / ai-chat
precedent (see SHIPPED `dev_log.md` row #12 entry). Recorded as such
in `dev_log.md` during `feature-verify`.

### 8.5 Quality gates per phase (extension)

#### P1 exit (foundations)

- `pnpm --filter @repo/plugin-web-calendar test` — ALL 90 SHIPPED + new
  P1 tests green (~136 cases).
- `pnpm --filter @repo/plugin-web-storage test` — green (new
  `xai_calendar_view` entry).
- `pnpm --filter @repo/plugin-web-calendar check-types` — 0.
- `pnpm --filter @repo/plugin-web-calendar lint --max-warnings 0` — 0.
- AC-REGISTRY-EXT-1..2 + AC-ACTIVEDATE-1..2,8 + AC-PLACE-1..10 +
  AC-FIXTURE-EXT-1..3 + AC-TYPE-EXT-1,3,4 + AC-BARREL-EXT-3,4 green.

#### P2 exit (Week view)

- All P1 gates + new Week + TimeGrid tests green (~158 cases).
- AC-WEEK-1..14 + AC-TZ-1..4 + AC-DST-1..2 + AC-EVENT-7-EXT + AC-TOKENS-EXT-1..2
  + AC-TYPE-EXT-2 + AC-BARREL-EXT-1,2 (partial) green.

#### P3 exit (Day view)

- All P2 gates + Day tests green (~168 cases).
- AC-DAY-1..10 green.

#### P4 exit (toggle + persistence integration)

- All P3 gates + toggle tests green (~188 cases).
- AC-TOGGLE-1..3 + AC-PERSIST-EXT-1..3 + AC-ACTIVEDATE-3..7 +
  AC-DEEPLINK-EXT-1 + AC-BARREL-EXT-5 + AC-TOKENS-EXT-3 green.
- ComingSoonPanel.tsx deleted; ComingSoonPanel.test.tsx deleted.
- `pnpm --filter @repo/web test` — 100 green (no regressions).
- `pnpm --filter @repo/web check-types` — 0.

#### P5 exit (perf + cross-vendor + docs sync)

- All P4 gates + PB-EXT-1 green.
- XVENDOR-EXT-1..6 recorded OR formally DEFERRED.
- Codex cold-read 5 items recorded OR DEFERRED 24h per precedent.
- `pnpm --filter @repo/plugin-web-calendar test:coverage` meets §4
  targets (≥90% stmts).
- `manifest.json` stays `Production` (no flip needed — extension keeps
  baseline status).
- `docs/PLUGIN_MAP.md` row #12 note appended:
  `(Extension 2026-05-25 — real Week + Day views, gap-closure row #4)`.

### 8.6 Verify checklist (extension — used by `feature-verify`)

1. All 90 SHIPPED tests still green.
2. New ~78 extension tests green.
3. PB-EXT-1 (50ms toggle budget) green; retried once if flaky.
4. AC-EVENT-7-EXT confirms zero `emitWebEvent` in new files.
5. AC-TOKENS-EXT-1..2 byte-parity with `layout.css:849-852` / `:853-856`.
6. AC-DST-1..2 confirms 23 / 25 row counts for Mar 8 / Nov 1 2026.
7. AC-TZ-1..4 confirms no midnight off-by-one.
8. AC-PERSIST-EXT-1..3 + AC-REGISTRY-EXT-1..2 confirm new storage key
   wires correctly.
9. AC-TOGGLE-1..3 + AC-ACTIVEDATE-1..8 confirm view toggle preserves
   activeDate.
10. AC-DEEPLINK-EXT-1 confirms deep-link forces Month view.
11. ComingSoonPanel.tsx + test deleted; AC-BARREL-EXT-5 confirms.
12. Lint passes with `--max-warnings 0` across all touched workspaces
    (calendar + storage).
13. Commit hygiene: one commit per phase, Why/What/Scope/Risk/Docs/Tests.
14. Cross-vendor XVENDOR-EXT-1..6 + Codex 5 cold-read items recorded
    OR formally DEFERRED per ADR-0008 carve-out + ADR-0009 §D2-G2
    precedent.

---

## 9. 2026-05-27 Extension — Event CRUD test strategy (HC8 lift)

> APPEND-ONLY. §1..§8 above continue to apply byte-for-byte. **The 197
> SHIPPED test cases (90 v1 + 107 v1.1 extension) MUST stay green.** §9
> is purely additive: new test files + small modifier additions to
> existing test files explicitly enumerated below.
>
> Pattern reference: `§8` above (gap-closure row #4 extension test
> strategy) — same shape applies to this carve-out extension.

### 9.0 Test scope summary (extension)

| Category | Files | Cases | Acceptance |
|---|---|---|---|
| Existing 197 cases (status quo) | 28 files in `packages/xai-web-calendar/src/__tests__/` | 197 | All green, NO regressions allowed |
| New unit — event store CRUD | `eventStore.test.ts` | 14 | green |
| New unit — recurrence expansion | `expandRecurrence.test.ts` | 12 | green |
| New unit — viewport merge | `mergeEventsForViewport.test.ts` | 10 | green |
| New unit — validators | `validators.test.ts` | 9 | green |
| New unit — id generator | `ids.test.ts` | 4 | green |
| New hook — useUserCalEvents | `useUserCalEvents.test.ts` | 8 | green |
| New component — EventComposer | `EventComposer.test.tsx` | 18 | green |
| New component — EmptyStateHint | `EmptyStateHint.test.tsx` | 4 | green |
| New integration — CalendarModule event CRUD (Month) | `CalendarModule.eventcrud.test.tsx` | 12 | green |
| New integration — recurrence × view | `CalendarModule.recurrence.test.tsx` | 10 | green |
| New integration — DST × recurrence | `CalendarModule.dst-recurrence.test.tsx` | 4 | green |
| New perf budget | `perfBudget.eventcrud.test.ts` | 1 (PB-CREATE-1) | green |
| Modified `events.test.ts` | extend file list | unchanged count, broader scope | green |
| Modified `index-barrel.test.ts` | + AC-BARREL-CREATE-1..6 | +6 | green |
| Modified `types.test-d.ts` | + AC-TYPE-CREATE-1..4 | +4 | green |
| Modified `styles.css.tokens.test.ts` | + AC-TOKENS-CREATE-1..3 (ev-rose + composer styles) | +3 | green |
| Modified `sampleEvents.test.ts` | + AC-FIXTURE-CREATE-1..3 (badge + non-editable) | +3 | green |
| Storage registry test | extend `packages/plugin-web-storage/src/__tests__/registry.test.ts` (+ AC-REGISTRY-CREATE-1..2) | +2 | green |
| `apps/web` 106 cases | as-is | 106 | All green |

Cumulative new test cases: **~110** (98 new files + 18 modifier-additions).
Total after this extension: **307 in `@repo/plugin-web-calendar`** + 90 in storage + 106 in web = **503 calendar/web/storage tests**.

### 9.1 Mock strategy (extension)

- **`usePref("xai_calendar_events", {})`**: NOT mocked. Real `@repo/plugin-web-storage` round-trip; HC4 persistence asserted via unmount + remount cycle.
- **`crypto.randomUUID()`**: mocked in `ids.test.ts` to exercise the fallback path (`globalThis.crypto = undefined`).
- **Date / time**: `vi.useFakeTimers()` + `vi.setSystemTime("2026-05-22T10:00:00")` for recurrence expansion + DST tests.
- **Native `<dialog>`**: jsdom polyfilled in `setup.ts` (already present per gap-closure row #4 setup). `dialog.showModal()` + `dialog.close()` work; backdrop click simulated via `fireEvent.click(dialogEl)` with `target === dialogEl`.
- **Composer form interactions**: React Testing Library `userEvent` for typing, picking, clicking.

### 9.2 New AC matrix (extension)

#### AC-CREATE — Event creation flow

| ID | Description | Phase | File |
|---|---|---|---|
| AC-CREATE-1 | Toolbar `+` click → EventComposer opens with `mode="create"` | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-CREATE-2 | EventComposer defaults: title="" / date=today / start="09:00" / end="10:00" / color="mint" / recurrence=null | P2 | `EventComposer.test.tsx` |
| AC-CREATE-3 | User fills form + clicks Save → composer closes, event appears in MonthCell, persists to localStorage | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-CREATE-4 | Created event renders with the picked color (e.g., "rose") | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-CREATE-5 | Two events on same day → both render in MonthCell, sorted by startISO | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-CREATE-6 | Empty title → Save disabled / shows error; composer stays open | P2 | `EventComposer.test.tsx` |

#### AC-EDIT — Event edit flow

| ID | Description | Phase | File |
|---|---|---|---|
| AC-EDIT-1 | Click on user event chip in Month view → EventComposer opens with `mode="edit"` pre-filled | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-EDIT-2 | Edit title and click Save → chip updates, updatedAt bumped | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-EDIT-3 | Cancel in edit mode → composer closes, no mutation | P2 | `EventComposer.test.tsx` |
| AC-EDIT-4 | Click on event block in Week view → composer pre-filled | P4 | `CalendarModule.eventcrud.test.tsx` |
| AC-EDIT-5 | Click on event block in Day view → composer pre-filled | P4 | `CalendarModule.eventcrud.test.tsx` |

#### AC-DELETE — Event delete flow

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DELETE-1 | Delete button visible only in edit mode | P2 | `EventComposer.test.tsx` |
| AC-DELETE-2 | Delete button click → composer closes, chip disappears, store entry removed | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-DELETE-3 | Last user event deleted → banner reappears (Q10-B) | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-DELETE-4 | Delete non-existent id → no-op, no error | P1 | `eventStore.test.ts` |

#### AC-PERSIST-CREATE — Persistence round-trip

| ID | Description | Phase | File |
|---|---|---|---|
| AC-PERSIST-CREATE-1 | Create + reload → event preserved | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-PERSIST-CREATE-2 | Edit + reload → updated event preserved | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-PERSIST-CREATE-3 | Delete + reload → event NOT present | P3 | `CalendarModule.eventcrud.test.tsx` |

#### AC-RECUR — Recurrence rendering

| ID | Description | Phase | File |
|---|---|---|---|
| AC-RECUR-1 | Daily recurring event over 7-day Week view → 7 blocks rendered | P4 | `CalendarModule.recurrence.test.tsx` |
| AC-RECUR-2 | Weekly recurring event over 7-day Week view → 1 block on the start weekday | P4 | `CalendarModule.recurrence.test.tsx` |
| AC-RECUR-3 | Daily recurring event over 30-day Month view → up to 30 chips across days | P4 | `CalendarModule.recurrence.test.tsx` |
| AC-RECUR-4 | Weekly recurring event over 30-day Month view → ~4-5 chips on the start weekday | P4 | `CalendarModule.recurrence.test.tsx` |
| AC-RECUR-5 | Daily recurring event over Day view → 1 block | P4 | `CalendarModule.recurrence.test.tsx` |
| AC-RECUR-6 | Edit a recurring event → all rendered instances reflect the edit | P4 | `CalendarModule.recurrence.test.tsx` |
| AC-RECUR-7 | Delete a recurring event → all rendered instances disappear | P4 | `CalendarModule.recurrence.test.tsx` |
| AC-RECUR-8 | `expandRecurrence` with `maxInstances: 366` cap — daily over 2-year window returns exactly 366 | P1 | `expandRecurrence.test.ts` |

#### AC-EMPTY — Empty state hint

| ID | Description | Phase | File |
|---|---|---|---|
| AC-EMPTY-1 | When `userEvents.length === 0` AND viewport has no fixture events → EmptyStateHint rendered | P3 | `EmptyStateHint.test.tsx` |
| AC-EMPTY-2 | Hint text bilingual: EN "Click + to create your first event" / ZH "点击 + 创建第一个事件" | P3 | `EmptyStateHint.test.tsx` |
| AC-EMPTY-3 | Once a user event is created, EmptyStateHint disappears | P3 | `CalendarModule.eventcrud.test.tsx` |

#### AC-OVERLAP — Multiple events same time slot

| ID | Description | Phase | File |
|---|---|---|---|
| AC-OVERLAP-1 | Two user events overlapping 09:00-11:00 + 10:00-12:00 in Week view → side-by-side colSpan=2 | P4 | `CalendarModule.eventcrud.test.tsx` |
| AC-OVERLAP-2 | Three user events overlapping → colSpan=3 (uses existing placeEventBlocks) | P4 | `CalendarModule.eventcrud.test.tsx` |
| AC-OVERLAP-3 | User event + fixture event in same time slot → both render side-by-side | P4 | `CalendarModule.eventcrud.test.tsx` |
| AC-OVERLAP-4 | Month view: 6 events on same day → 5 chips + "+1 more" overflow (existing behavior preserved) | P3 | `CalendarModule.eventcrud.test.tsx` |

#### AC-FIXTURE-CREATE — Fixture coexistence

| ID | Description | Phase | File |
|---|---|---|---|
| AC-FIXTURE-CREATE-1 | Fixture chips render with `data-source="fixture"` attribute | P3 | `sampleEvents.test.ts` (extend) |
| AC-FIXTURE-CREATE-2 | `.cal-sample-badge` element present on each fixture chip with bilingual label | P3 | `sampleEvents.test.ts` (extend) |
| AC-FIXTURE-CREATE-3 | User event chips do NOT have `data-source="fixture"` | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-FIXTURE-CREATE-4 | Click on fixture chip does NOT open composer (no-op or tooltip only) | P3 | `CalendarModule.eventcrud.test.tsx` |

#### AC-BANNER-CREATE — Banner conditional render

| ID | Description | Phase | File |
|---|---|---|---|
| AC-BANNER-CREATE-1 | `userEvents.length === 0` → CalendarBanner is in DOM | P3 | `CalendarModule.eventcrud.test.tsx` |
| AC-BANNER-CREATE-2 | After creating 1 user event → CalendarBanner is NOT in DOM | P3 | `CalendarModule.eventcrud.test.tsx` |

#### AC-DST-RECUR — DST × recurrence interaction

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DST-RECUR-1 | Daily recurring 09:30 event on Mar 8 2026 (spring-forward day) renders on Mar 7 + Mar 8 + Mar 9 at 09:30 each | P4 | `CalendarModule.dst-recurrence.test.tsx` |
| AC-DST-RECUR-2 | Weekly recurring 09:30 event whose anchor is Nov 1 2026 (fall-back day) renders on Nov 8 + Nov 15 at 09:30 each | P4 | `CalendarModule.dst-recurrence.test.tsx` |

#### AC-DIALOG — Native dialog behavior

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DIALOG-1 | `open={true}` → dialog.showModal() called | P2 | `EventComposer.test.tsx` |
| AC-DIALOG-2 | ESC key → onClose called (no save) | P2 | `EventComposer.test.tsx` |
| AC-DIALOG-3 | Click on backdrop (dialog element itself) → onClose called | P2 | `EventComposer.test.tsx` |
| AC-DIALOG-4 | Click inside dialog content → does NOT close | P2 | `EventComposer.test.tsx` |
| AC-DIALOG-5 | `aria-modal="true"` + `aria-labelledby` present | P2 | `EventComposer.test.tsx` |
| AC-DIALOG-6 | Focus moves into first input field on open | P2 | `EventComposer.test.tsx` |
| AC-DIALOG-7 | Save button click stops event propagation (no parent onClick fires) | P2 | `EventComposer.test.tsx` |

#### AC-VALIDATE — Form validation

| ID | Description | Phase | File |
|---|---|---|---|
| AC-VALIDATE-1 | Empty title → error "Title is required" | P1 | `validators.test.ts` |
| AC-VALIDATE-2 | endTime < startTime → error "End time must be after start" | P1 | `validators.test.ts` |
| AC-VALIDATE-3 | endTime - startTime < 5 minutes → error "Event must be at least 5 minutes" | P1 | `validators.test.ts` |
| AC-VALIDATE-4 | startTime/endTime malformed → error "INVALID_FORMAT" | P1 | `validators.test.ts` |
| AC-VALIDATE-5 | Date in past → no error (v1 allows backdating) | P1 | `validators.test.ts` |
| AC-VALIDATE-6 | All-day attempt (endTime "23:59" + startTime "00:00") → still single-day, no error | P1 | `validators.test.ts` |
| AC-VALIDATE-7 | Cross-day attempt (programmatic only — composer prevents via single date field) → error "MULTI_DAY" | P1 | `validators.test.ts` |

#### AC-I18N-CREATE — Bilingual STR coverage

| ID | Description | Phase | File |
|---|---|---|---|
| AC-I18N-CREATE-1 | EN composer: title="New event" / fields labels all EN | P2 | `EventComposer.test.tsx` |
| AC-I18N-CREATE-2 | ZH composer: title="新建事件" / fields labels all ZH | P2 | `EventComposer.test.tsx` |
| AC-I18N-CREATE-3 | `STR_EVENT_COMPOSER` has both `en` and `zh` for every key (compile-time guard via assertBilingual helper) | P1 | `EventComposer.test.tsx` |

#### AC-DOCS — Doc lift compliance

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DOCS-1 | `design.md` §15.2 #8 has HC8 lift footnote | P5 | manual doc-grep test (P5 only) |
| AC-DOCS-2 | `design.md` §16 exists and references the carve-out doc | P5 | manual doc-grep |
| AC-DOCS-3 | `dev_log.md` has "Bugfix-Extension Lineage — feature row" or equivalent block referencing HC8 lift | P5 | manual doc-grep |

#### AC-REGISTRY-CREATE — Storage registry

| ID | Description | Phase | File |
|---|---|---|---|
| AC-REGISTRY-CREATE-1 | `PREF_REGISTRY.xai_calendar_events` exists with `default: {}`, `codec: "json"`, `owner: "xai-web-calendar"`, `schemaVersion: 1`, `category: "module"` | P1 | `packages/plugin-web-storage/src/__tests__/registry.test.ts` |
| AC-REGISTRY-CREATE-2 | Default value `{}` round-trips via setItem/getItem with no data corruption | P1 | `packages/plugin-web-storage/src/__tests__/registry.test.ts` |

#### AC-BARREL-CREATE — index.ts public surface

| ID | Description | Phase | File |
|---|---|---|---|
| AC-BARREL-CREATE-1 | `index.ts` exports `EventComposer` | P2 | `index-barrel.test.ts` |
| AC-BARREL-CREATE-2 | `index.ts` exports `useUserCalEvents` + type `UserCalEventsApi` | P1 | `index-barrel.test.ts` |
| AC-BARREL-CREATE-3 | `index.ts` exports types `UserCalEvent`, `RecurrenceRule`, `RecurrenceKind`, `EventColorPreset` | P1 | `index-barrel.test.ts` |
| AC-BARREL-CREATE-4 | `index.ts` exports `expandRecurrence`, `mergeEventsForMonth`, `mergeEventsForWindow` | P1 | `index-barrel.test.ts` |
| AC-BARREL-CREATE-5 | `index.ts` exports `createEvent`, `updateEvent`, `deleteEvent`, `getEvent`, `listEvents` | P1 | `index-barrel.test.ts` |
| AC-BARREL-CREATE-6 | `EventComposerProps` exported as a type | P2 | `index-barrel.test.ts` |

#### AC-TYPE-CREATE — type-level checks

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TYPE-CREATE-1 | `UserCalEvent.id` is `string` (not `number`) | P1 | `types.test-d.ts` |
| AC-TYPE-CREATE-2 | `RecurrenceRule.kind` is exact union `"daily" \| "weekly"` | P1 | `types.test-d.ts` |
| AC-TYPE-CREATE-3 | `EventColorPreset` is exact union `"mint" \| "amber" \| "blue" \| "violet" \| "rose"` | P1 | `types.test-d.ts` |
| AC-TYPE-CREATE-4 | `UserCalEventsApi.create` returns `UserCalEvent` (not `void`) | P1 | `types.test-d.ts` |

#### AC-TOKENS-CREATE — Style tokens

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TOKENS-CREATE-1 | `styles.css` `.cal-event.ev-rose` + `.cal-event-block.ev-rose` rules use `oklch(... 350)` (hue 350) | P2 | `styles.css.tokens.test.ts` |
| AC-TOKENS-CREATE-2 | Dark-theme `[data-theme="dark"] .cal-event.ev-rose` + `.cal-event-block.ev-rose` overrides present | P2 | `styles.css.tokens.test.ts` |
| AC-TOKENS-CREATE-3 | `.event-composer` rule uses only existing CSS vars (no new tokens) — assertion: grep for hex literals returns zero in composer block | P2 | `styles.css.tokens.test.ts` |

#### AC-EVENT-7 (extended again) — listen-only invariant across all new files

| ID | Description | Phase | File |
|---|---|---|---|
| AC-EVENT-7-CREATE | grep `emitWebEvent` across NEW files (`EventComposer.tsx`, `EmptyStateHint.tsx`, all `internal/eventStore/*.ts`, `internal/strings.ts`) → zero matches | P2/P3 | `events.test.ts` (extend file list again) |

### 9.3 Perf budget test — PB-CREATE-1

```ts
// PB-CREATE-1: Viewport recompute ≤ 16ms p95 with 100 user events
// across 5 recurring + 95 single. Retry once if flaky.
import { it, expect, beforeAll } from "vitest";
import { render, act } from "@testing-library/react";
import { CalendarModule } from "../CalendarModule.js";
import { setPref } from "@repo/plugin-web-storage";
import type { UserCalEvent } from "../internal/eventStore/types.js";

const ITER = 100;
const P95_MAX_MS = 16;

let durations: number[] = [];

function makeFixture(): Record<string, UserCalEvent> {
  const store: Record<string, UserCalEvent> = {};
  for (let i = 0; i < 95; i++) {
    const id = `evt-${i}`;
    store[id] = {
      id,
      title: `Event ${i}`,
      startISO: `2026-05-${String((i % 28) + 1).padStart(2, "0")}T09:00`,
      endISO:   `2026-05-${String((i % 28) + 1).padStart(2, "0")}T10:00`,
      colorPreset: "mint",
      recurrence: null,
      createdAt: "2026-05-22T00:00:00.000Z",
      updatedAt: "2026-05-22T00:00:00.000Z",
    };
  }
  // 5 recurring events
  for (let i = 0; i < 5; i++) {
    const id = `evt-rec-${i}`;
    store[id] = {
      id,
      title: `Recurring ${i}`,
      startISO: "2026-05-15T08:00",
      endISO:   "2026-05-15T09:00",
      colorPreset: "blue",
      recurrence: { kind: "weekly" },
      createdAt: "2026-05-15T00:00:00.000Z",
      updatedAt: "2026-05-15T00:00:00.000Z",
    };
  }
  return store;
}

beforeAll(async () => {
  setPref("xai_calendar_events", makeFixture());
  const { rerender } = render(<CalendarModule lang="en" />);
  // Warm-up
  for (let i = 0; i < 5; i++) {
    await act(async () => { rerender(<CalendarModule lang="en" />); });
  }
  durations = [];
  for (let i = 0; i < ITER; i++) {
    const start = performance.now();
    await act(async () => { rerender(<CalendarModule lang="en" />); });
    durations.push(performance.now() - start);
  }
});

it(`PB-CREATE-1 — viewport recompute p95 < ${P95_MAX_MS}ms over ${ITER} iterations with 100 user events`, () => {
  const sorted = [...durations].sort((a, b) => a - b);
  const p95 = sorted[Math.ceil(0.95 * sorted.length) - 1] ?? 0;
  console.info(`[PB-CREATE-1] viewport p95=${p95.toFixed(3)}ms (budget: ${P95_MAX_MS}ms)`);
  expect(p95).toBeLessThan(P95_MAX_MS);
});
```

### 9.4 Cross-vendor manual smoke (extension — XVENDOR-CREATE-*)

| ID | Browser | Steps | Expected |
|---|---|---|---|
| XVENDOR-CREATE-1 | Safari 17+ | Open `/app/calendar`. Click `+`. Fill title + date + times. Save. | Composer closes; event chip visible in Month view at the chosen date. |
| XVENDOR-CREATE-2 | Chrome 120+ | Same as 1. | Same result. |
| XVENDOR-CREATE-3 | Firefox 121+ | Same as 1. | Same result. |
| XVENDOR-CREATE-4 | All 3 | Reload page after saving. | Event preserved across reload (HC4). |
| XVENDOR-CREATE-5 | Chrome 120+ | Create event with `recurrence: "daily"`. Switch to Week + Day views. | Event appears on each day in the visible window. |
| XVENDOR-CREATE-6 | All 3 | Click existing user event → composer opens pre-filled. Change title → Save. | Chip text updates. |

**Codex cold-read scenarios** (5 items):

1. Confirm `expandRecurrence` algorithm correctness: daily/weekly produce the expected count of instances inside the window, never exceed `maxInstances`.
2. Confirm `mergeEventsForViewport` purity (no side-effects; same inputs → same output; never mutates inputs).
3. Confirm persistence round-trip: `usePref<"xai_calendar_events">` correctly preserves `Record<string, UserCalEvent>` shape across reload, including the recurrence rule.
4. Confirm DST × recurrence: a 09:30 daily event displays correctly on spring-forward day Mar 8 2026 (the event renders at 09:30 in the DST-23-row column, NOT shifted to 10:30).
5. Confirm HC8 lift annotation completeness — `design.md` §15.2 #8 footnote + new §16 + `dev_log.md` extension block all present and cross-referenced.

XVENDOR-CREATE-1..6 + Codex 5 cold-read items may be DEFERRED at ship-time per ADR-0008 §S3 24h-evidence carve-out + ADR-0009 §D2-G2 precedent (must be recorded in `dev_log.md` Verify Notes).

### 9.5 Quality gates per phase (extension)

#### P1 exit — data layer + types + EventStore + persistence + tests

- `pnpm --filter @repo/plugin-web-calendar test` — ALL 197 SHIPPED + P1 unit tests green (~244 cases).
- `pnpm --filter @repo/plugin-web-storage test` — green (new `xai_calendar_events` entry).
- `pnpm --filter @repo/plugin-web-calendar check-types` — 0.
- `pnpm --filter @repo/plugin-web-calendar lint --max-warnings 0` — 0.
- AC-RECUR-8 + AC-DELETE-4 + AC-VALIDATE-1..7 + AC-REGISTRY-CREATE-1..2 + AC-TYPE-CREATE-1..4 + AC-BARREL-CREATE-2..5 + (events.test grep extended to internal/eventStore/*.ts) green.
- Commit: `feat(xai-web-calendar): P1 event-create data layer + types + EventStore + persistence + tests (xai-web-calendar-event-create)`

#### P2 exit — EventComposer dialog + STR + tests + styles

- All P1 gates + composer tests green (~262 cases).
- AC-DIALOG-1..7 + AC-CREATE-2 + AC-CREATE-6 + AC-EDIT-3 + AC-DELETE-1 + AC-I18N-CREATE-1..3 + AC-TOKENS-CREATE-1..3 + AC-BARREL-CREATE-1,6 green.
- Same-vendor smoke (Chrome): composer opens / saves / cancels / deletes cleanly.
- Commit: `feat(xai-web-calendar): P2 EventComposer dialog + bilingual STR + styles (xai-web-calendar-event-create)`

#### P3 exit — Toolbar wire + Month integration + tests

- All P2 gates + integration tests green (~282 cases).
- AC-CREATE-1,3,4,5 + AC-EDIT-1,2 + AC-DELETE-2,3 + AC-PERSIST-CREATE-1..3 + AC-EMPTY-1..3 + AC-FIXTURE-CREATE-1..4 + AC-BANNER-CREATE-1..2 + AC-OVERLAP-4 green.
- `pnpm --filter @repo/web test` — 106 green (no regressions).
- HC1 + HC4 + HC6 land at this phase.
- Commit: `feat(xai-web-calendar): P3 toolbar+ wire + Month integration + fixture badge + empty-state (xai-web-calendar-event-create)`

#### P4 exit — Week/Day integration + recurrence + DST × recurrence + perf

- All P3 gates + Week/Day + recurrence + DST tests green (~302 cases).
- AC-EDIT-4..5 + AC-RECUR-1..7 + AC-OVERLAP-1..3 + AC-DST-RECUR-1..2 + PB-CREATE-1 green.
- HC2 + HC3 + HC5 + HC7 land at this phase.
- **Codex cold-read mandatory** — 5 items dispatched.
- Commit: `feat(xai-web-calendar): P4 Week+Day integration + recurrence expansion + DST x recurrence (xai-web-calendar-event-create)`

#### P5 exit — HC8 lift + docs sync + cross-vendor + final polish

- All P4 gates + ~5 polish tests green (~307 cases total).
- AC-DOCS-1..3 manual doc-grep passes.
- design.md §15.2 #8 footnote + §16 present (P5 verifies — they were authored at feature-plan time).
- api.md §11 + test.md §9 + dev_log appendix updated to reflect final delta.
- `docs/PLUGIN_MAP.md` row #12 note appended: `(Extension 2026-05-27 — Event CRUD, HC8 lifted per ADR-0010 §D4 carve-out)`.
- XVENDOR-CREATE-1..6 recorded OR formally DEFERRED.
- Codex 5 cold-read items recorded OR DEFERRED.
- `manifest.json` stays `Production`.
- Commit: `docs(xai-web-calendar): P5 HC8 lift annotation + design/api/test/dev_log sync + PLUGIN_MAP (xai-web-calendar-event-create)` + ship-prep commit per CLAUDE.md.

### 9.6 Verify checklist (extension — used by `feature-verify`)

1. All 197 SHIPPED calendar tests still green.
2. All 88 SHIPPED storage tests still green.
3. All 106 SHIPPED web tests still green.
4. All ~110 new extension tests green.
5. PB-CREATE-1 perf budget green; retried once if flaky.
6. AC-EVENT-7 + AC-EVENT-7-EXT + AC-EVENT-7-CREATE all confirm zero `emitWebEvent` imports across all new files.
7. AC-TOKENS-CREATE-1..3 byte-parity with `tokens.css` family + no hex literals in composer styles.
8. AC-RECUR-1..8 confirms recurrence semantics across daily/weekly × Month/Week/Day.
9. AC-DST-RECUR-1..2 confirms 09:30 events stable across spring-forward / fall-back days.
10. AC-PERSIST-CREATE-1..3 + AC-REGISTRY-CREATE-1..2 confirm storage round-trip.
11. AC-DIALOG-1..7 confirms native `<dialog>` cross-vendor compatible behavior.
12. AC-VALIDATE-1..7 confirms validation surfaces inline errors.
13. AC-FIXTURE-CREATE-1..4 + AC-BANNER-CREATE-1..2 confirm Q9-E + Q10-B disposition.
14. AC-DOCS-1..3 confirms HC8 lift documentation completeness.
15. Lint passes with `--max-warnings 0` across all touched workspaces.
16. Commit hygiene: one commit per phase, Why/What/Scope/Risk/Docs/Tests.
17. Cross-vendor XVENDOR-CREATE-1..6 + Codex 5 cold-read items recorded OR formally DEFERRED per ADR-0008 carve-out + ADR-0009 §D2-G2 precedent.

