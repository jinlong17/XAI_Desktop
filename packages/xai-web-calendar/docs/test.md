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
