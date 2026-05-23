# Test Strategy — xai-web-habits

> Companion to `design.md` + `api.md`. All acceptance criteria (AC-*) are bound back to the seed brief's "Acceptance signal" line + the hard constraints in the parallel-Agent worker brief.

---

## 1. Test pyramid

| Layer | Tooling | Scope |
|---|---|---|
| Unit — pure functions | Vitest | `computeStreak`, `computeMonthlyCount`, `computeMonthlyRate`, `compute365`, `toggleCheckIn`, `utcDateKey`, `monthKey`, `weekDates`, `daysInMonth`, `isLeapYear`, `validateHabitsState`, `isHabit`, `createId`. |
| Unit — React components | Vitest + `@testing-library/react` + jsdom | `HabitsModule`, `HabitList`, `HabitRow`, `HabitDetail`, `StatCard`, `MonthCalendar`, `DiaryCard`, `AddHabitDialog`. |
| Type tests | `tsc --noEmit` + `*.test-d.ts` | `Habit` / `HabitId` / `HabitsState` / `DateKey` / `MonthKey` / `WeekStart` shape; `HABITS_STORAGE_KEY extends WebPrefKey`; `"web:habits:checkin-recorded" extends keyof EventMap`. |
| CSS lint | inline assertion in a vitest case (mirrors `plugin-web-tokens` `tokens-smoke.test.ts`) | Confirm `styles.css` contains zero hex literals and only references `var(--…)` tokens. |
| Manual smoke | Human + 3 browsers | Cross-vendor verify gate (P3). |

Test files live at `packages/xai-web-habits/src/__tests__/*.test.{ts,tsx}` —
same convention as `plugin-web-tokens`, `plugin-web-storage`,
`xai-web-matrix`, `plugin-web-countdown`. The `vitest.config.ts` mirrors
`xai-web-matrix/vitest.config.ts` (jsdom environment + setup file that clears
`localStorage` before each test).

---

## 2. Acceptance criteria → test mapping

Each row ties a seed-brief or design-doc requirement to a concrete named
test. All AC-* live in `__tests__/`.

### 2.1 Render correctness

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-RENDER-1** | Renders left-pane (habits list) + right-pane (detail). | `HabitsModule.render.test.tsx` | Both `<section class="habits-list">` and `<section class="habits-detail">` are present. |
| **AC-RENDER-2** | Week strip shows exactly 7 weekday cells in order, last cell carries `today` class. | same | 7 `.weekday` elements; the 7th has class `today`. |
| **AC-RENDER-3** | Each seeded habit appears as a `.habit-row` with emoji + title + stats + 7-cell strip. | same | For each seeded habit: 1 emoji, 1 title, 1 stats line with bolt + fire icons, 7 `.hcell` buttons. |
| **AC-RENDER-4** | The 4 stat cards render with bilingual labels + computed values. | same | 4 `.stat-card` elements with labels matching `t.habits.monthly_checkins` / `t.habits.total_checkins` / `t.habits.monthly_rate` / `t.habits.streak`. |
| **AC-RENDER-5** | Progress card shows `<numerator>/<denominator>` mono numeric + sub-label `<remaining> days`. | same | `.progress-num` matches `/\d+\/(?:365|366)/`; `.progress-sub` matches `/\d+ \w+/`. |
| **AC-RENDER-6** | Month calendar shows 7 weekday headers + 35 day cells; `.cal-cell.today` is present on today's date. | same | 7 `.cal-h` headers; 35 `.cal-cell` cells; exactly 1 `.cal-cell.today`. |
| **AC-RENDER-7** | Diary card renders heading + empty-state hint when no diary text exists. | same | `.log-title` text = `t.habits.habit_log`; when empty, `.log-empty` text = `t.habits.empty_log`. |

### 2.2 Internationalization

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-I18N-1** | All habits-module strings render bilingually. | `HabitsModule.i18n.test.tsx` | Mount with `lang="en"` → titles = `"Habits"`, stat labels = `["Monthly check-ins","Total check-ins","Monthly rate","Streak"]`, log title = `"Habit Log"`. Re-mount with `lang="zh"` → `"习惯"`, `["本月打卡","累计打卡","本月打卡率","连续打卡"]`, `"习惯日记"`. |
| **AC-I18N-2** | Habit titles render in active language. | same | A seeded habit with `title.en = "Morning Run"`, `title.zh = "晨跑"` shows the EN title in en mode, ZH in zh mode. |
| **AC-I18N-3** | Weekday short labels follow the active language. | same | Mount EN → row of weekday short labels starting with `"Sun"`; ZH → `"周日"`. |
| **AC-I18N-4** | Common units (`day`, `days`) come from `t.common.day` / `t.common.days`. | same | Stat-card units = `"Day"` / `"Days"` EN; `"天"` ZH. |
| **AC-I18N-5** | Empty diary placeholder uses `habits.empty_log`. | same | When `diaries[habitId][monthKey] === undefined`, `.log-empty` text equals `"No check-ins shared this month yet."` (EN) / `"本月还没有打卡心得。"` (ZH). |

### 2.3 Check-toggle + persistence

All toggle tests use `userEvent.click` on `.hcell` buttons; `localStorage` is
cleared between tests via the setup file.

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-TOGGLE-1** | Clicking an unchecked hcell toggles it ON visually + persists. | `HabitsModule.toggle.test.tsx` | Before: `.hcell` has no `.on`. After click: has `.on` + contains a check icon. `JSON.parse(localStorage.xai_habits_state).checkIns[habitId][dateKey] === true`. |
| **AC-TOGGLE-2** | Clicking a checked hcell toggles it OFF + removes the dateKey from `checkIns`. | same | After two clicks on same cell: `.hcell` has no `.on`. Stored `checkIns[habitId]` does NOT contain the dateKey. |
| **AC-TOGGLE-3** | Toggling a hcell does NOT bubble click to the parent `.habit-row` (no row re-selection). | same | Click an hcell on a non-selected habit; selected habit id is unchanged. |
| **AC-TOGGLE-4** | A toggle for a habit that no longer exists (concurrent delete) is a no-op. | same | Pre-state: habit removed from `state.habits`; trigger a synthetic click on a stale hcell ref; no state change, no exception. |
| **AC-TOGGLE-5** | Toggling the same hcell rapidly N times leaves it in the expected end-state. | same | Click N times; if N is even, ends OFF; if odd, ends ON; stored map matches. |
| **AC-PERSIST-1** | A check-toggle writes the resulting state to `localStorage["xai_habits_state"]`. | `HabitsModule.persist.test.tsx` | After AC-TOGGLE-1, `JSON.parse(localStorage.getItem("xai_habits_state"))` matches the post-toggle state. |
| **AC-PERSIST-2** | Unmount + remount restores the persisted state (reload simulation). | same | Toggle a hcell, unmount, mount fresh `<HabitsModule lang="en"/>` → the same hcell is `.on`; stat cards reflect the count. |
| **AC-PERSIST-3** | First mount with no stored value seeds from `internal/seed.ts`. | same | Clear localStorage; mount; assert `state.habits.length === INITIAL_HABITS.length`. |
| **AC-PERSIST-4** | A corrupted JSON in localStorage falls back to default. | same | `localStorage.setItem("xai_habits_state", "not-json")`; mount; expect default empty state + seed hydration; no exception. |
| **AC-PERSIST-5** | `schemaVersion` mismatch falls back to default. | same | `localStorage.setItem("xai_habits_state", JSON.stringify({ schemaVersion: 99, habits: [], checkIns: {}, diaries: {} }))`; mount; expect default. |
| **AC-PERSIST-6** | Cross-tab `storage` event updates state. | same | Dispatch a synthetic `StorageEvent` for `xai_habits_state` with a new value; assert UI re-renders with the new habits. |

### 2.4 Streak computation

`computeStreak(habitCheckIns, today): number` — pure function tests.

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-STREAK-1** | Empty check-ins → streak 0. | `computeStreak.test.ts` | `computeStreak({}, today) === 0`. |
| **AC-STREAK-2** | Today not checked → streak 0 (even if yesterday + earlier are checked). | same | `computeStreak({"2026-05-22": true, "2026-05-21": true}, new Date("2026-05-23")) === 0`. |
| **AC-STREAK-3** | Today checked, no prior → streak 1. | same | `computeStreak({"2026-05-23": true}, new Date("2026-05-23")) === 1`. |
| **AC-STREAK-4** | Today + 5 prior consecutive → streak 6. | same | streak === 6. |
| **AC-STREAK-5** | Today + 3 prior + skip 1 + 4 prior → streak 4 (zero-out on skip). | same | After today (+3 prior consecutive), the 5th day back is missing — streak counts back through the unbroken run only. Expected: 4. |
| **AC-STREAK-6** | DST spring-forward boundary (UTC dates eliminate the issue). | same | Set system time to a DST spring-forward day; check-in spans across it; streak still correct. |
| **AC-STREAK-7** | Future dates in `checkIns` (data corruption) — ignored. | same | `computeStreak({"2099-01-01": true, "2026-05-23": true}, new Date("2026-05-23")) === 1`. |

### 2.5 Monthly count / rate / 365 progress

`computeMonthlyCount`, `computeMonthlyRate`, `compute365` — pure function tests.

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-STAT-1** | `computeMonthlyCount` counts only current-month dates. | `computeStats.test.ts` | `computeMonthlyCount({"2026-05-01": true, "2026-04-30": true, "2026-05-15": true}, new Date("2026-05-23")) === 2`. |
| **AC-STAT-2** | `computeMonthlyCount` returns 0 for empty map. | same | `=== 0`. |
| **AC-STAT-3** | `computeMonthlyRate` uses `today.getUTCDate()` as denominator. | same | 5 checks in first 10 days of month, `today` is day 10 → rate = 50%. |
| **AC-STAT-4** | `computeMonthlyRate` returns 100% when every elapsed day is checked. | same | 23 checks of first 23 days, `today` is day 23 → rate = 100%. |
| **AC-STAT-5** | `compute365` filters by year prefix; denominator = 365 in non-leap years. | same | year 2026 has denominator 365; numerator = count of dates with `"2026-"` prefix. |
| **AC-STAT-6** | `compute365` uses 366 in leap years. | same | year 2024 (leap) → denominator 366. |
| **AC-STAT-7** | Stat cards in `<HabitsModule>` re-render live on toggle. | `HabitsModule.toggle.test.tsx` | Pre-toggle: monthly_checkins shows 0. Post-toggle of today: monthly_checkins shows 1; streak shows 1. |

### 2.6 Toggle reducer (pure)

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-REDUCE-1** | `toggleCheckIn` flips an absent date to `true`. | `toggle.test.ts` | `next.checkIns[habitId][date] === true`. |
| **AC-REDUCE-2** | `toggleCheckIn` removes the date when previously `true`. | same | `date in next.checkIns[habitId]` is false. |
| **AC-REDUCE-3** | `toggleCheckIn` does not mutate input state. | same | Reference equality + deep equality of `state` before vs after the call. |
| **AC-REDUCE-4** | `postStreak` reflects the post-toggle streak. | same | After adding today's check (with no prior), `postStreak === 1`. After removing today's check, `postStreak === 0`. |
| **AC-REDUCE-5** | `toggleCheckIn` returns identical-shape state for an unknown habit id (no-op via empty map path). | same | `next` is structurally a valid `HabitsState` even when `habitId` was not previously a key in `checkIns`. |

### 2.7 Diary

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-DIARY-1** | Typing in the textarea updates the visible value (controlled). | `DiaryCard.test.tsx` | After `userEvent.type("hello")`, textarea value === `"hello"`. |
| **AC-DIARY-2** | Blur persists the text to `state.diaries[habitId][monthKey]`. | same + `HabitsModule.persist.test.tsx` | After type + blur, `JSON.parse(localStorage.xai_habits_state).diaries[habitId][monthKey] === "hello"`. |
| **AC-DIARY-3** | Persisted diary round-trips through unmount + remount. | `HabitsModule.persist.test.tsx` | Type "hello" + blur; unmount + remount; textarea value === `"hello"`. |
| **AC-DIARY-4** | Blur with unchanged value does not write to localStorage. | `DiaryCard.test.tsx` | Spy on `setPref`; after focus + blur with no edit, `setPref` not called. |
| **AC-DIARY-5** | Switching habits while editing diary preserves the in-progress text for the previous habit via persisted state. | `HabitsModule.persist.test.tsx` | Type "a" + blur in habit H1; click habit H2; click habit H1 → textarea shows "a". |
| **AC-DIARY-6** | Switching displayed month preserves text for the previous month. | same | Type "may diary" + blur in May; click `<` month-nav → textarea shows April's diary (empty in seed); click `>` → textarea shows "may diary". |

### 2.8 Event bus

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-EVENT-1** | A check-toggle (ADD) emits exactly one `web:habits:checkin-recorded`. | `HabitsModule.events.test.tsx` | Subscribe via `onWebEvent` spy; click an unchecked hcell; assert listener received one event with `{ habitId, date, streak, recordedAt }`. |
| **AC-EVENT-2** | A check-toggle (REMOVE) also emits one event with post-toggle streak. | same | Click a checked hcell; listener fires once; `streak` reflects the broken run (0 if today was just unchecked). |
| **AC-EVENT-3** | No event on cross-tab hydration (storage event). | same | Dispatch synthetic `StorageEvent` with new state; listener count = 0. |
| **AC-EVENT-4** | `recordedAt` is a parseable ISO timestamp at the moment of commit. | same | `Date.parse(payload.recordedAt)` is a finite number and within 1s of `Date.now()`. |
| **AC-EVENT-5** | `date` payload field uses UTC `YYYY-MM-DD` format. | same | `/^\d{4}-\d{2}-\d{2}$/.test(payload.date)` is true. |
| **AC-EVENT-6** | `habitId` payload field matches the toggled habit. | same | `payload.habitId === habits[0].id` for a click on the first habit's hcell. |
| **AC-EVENT-7** | `streak` payload field equals `computeStreak` post-toggle. | same | After toggling today's check (no prior), `streak === 1`. |

### 2.9 Date helpers (pure)

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-DATE-1** | `utcDateKey` returns `YYYY-MM-DD`. | `dateKeys.test.ts` | `utcDateKey(new Date(Date.UTC(2026, 4, 23))) === "2026-05-23"`. |
| **AC-DATE-2** | `monthKey` returns `YYYY-MM`. | same | `monthKey(new Date(Date.UTC(2026, 4, 23))) === "2026-05"`. |
| **AC-DATE-3** | `weekDates(now, "sun")` returns 7 dates, [0] = Sunday of the current week. | same | First date's `getUTCDay() === 0`. |
| **AC-DATE-4** | `weekDates(now, "mon")` returns 7 dates, [0] = Monday of the current week. | same | First date's `getUTCDay() === 1`. |
| **AC-DATE-5** | `weekDates(now, "sun")` rolls correctly across month boundaries. | same | For `now = 2026-05-01` (Fri), the week-strip starts at `2026-04-26` (Sun); 7 dates span across April → May. |
| **AC-DATE-6** | `daysInMonth(year, month0)` returns 28/29/30/31 correctly. | same | Spot-check Feb 2024 = 29, Feb 2025 = 28, Apr 2026 = 30, May 2026 = 31. |
| **AC-DATE-7** | `isLeapYear` correctly identifies leap years. | same | 2024 = true, 2100 = false, 2400 = true, 2026 = false. |

### 2.10 Add-Habit modal (P3)

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-ADD-1** | Clicking the header `+` opens the dialog. | `HabitsModule.add.test.tsx` | Before click: no `<dialog>` open. After click: `<dialog>` open. |
| **AC-ADD-2** | Saving with valid emoji + EN + ZH appends a new habit and closes the dialog. | same | After save: `state.habits.length === seed + 1`; the new habit's `title.en` / `title.zh` match the inputs; dialog is closed. |
| **AC-ADD-3** | Save button is disabled when EN or ZH is empty. | `AddHabitDialog.test.tsx` | Empty EN → button is `disabled`. |
| **AC-ADD-4** | Cancel closes the dialog without mutating state. | same | After cancel: `state.habits.length === seed`. |
| **AC-ADD-5** | Empty emoji input falls back to a default glyph. | same | Submit with emoji blank → habit saved with `emoji === "🌱"`. |
| **AC-ADD-6** | `createId()` generates unique ids for back-to-back adds. | same | Open + save twice; the two new habits have distinct ids. |

### 2.11 Month calendar

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-CAL-1** | Calendar shows 35 cells; in-month cells have `.in` class. | `MonthCalendar.test.tsx` | Count of `.cal-cell.in` matches `daysInMonth(year, month0)`; out-of-month cells lack `.in`. |
| **AC-CAL-2** | Today's cell has `.today` class. | same | Exactly 1 `.cal-cell.today`. |
| **AC-CAL-3** | Cells whose dateKey appears in `checkIns[habitId]` show a check ring (distinct CSS class). | same | Provide a habit with `checkIns[habitId] = {"2026-05-10": true}`; the cell for May 10 has the check-ring marker. |
| **AC-CAL-4** | Clicking `<` decrements the displayed month; clicking `>` increments. | same | After `<` click on May → header shows "Apr"; after `>` click twice → "Jun". |
| **AC-CAL-5** | Year rollover: navigating `<` from January goes to December of previous year. | same | From Jan 2026 → Dec 2025. |
| **AC-CAL-6** | Weekday header labels respect `weekStart` prop. | same | `weekStart="sun"` → headers start with "Sun" (en) / "日" (zh). `weekStart="mon"` → "Mon" / "一". |
| **AC-CAL-7** | Clicking a cal-cell toggles the check for that date. | same | Click a `.cal-cell.in`; `state.checkIns[habitId][dateKey]` toggles. (Out-of-month cells are not clickable.) |

### 2.12 Shell registration

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-SHELL-1** | `habitsSlotRegistration` conforms to `WebModuleSlotRegistration`. | `registration.test.tsx` | Compile-time: `const _check: WebModuleSlotRegistration = habitsSlotRegistration`. Runtime: assert each field equals the design-doc table values. |
| **AC-SHELL-2** | `habitsSlotRegistration.children[0].render` returns a non-empty React element. | same | Render with mocked `useWebShell` context; assert the rendered tree has children. |
| **AC-SHELL-3** | When wired into `webShellModuleRegistrations`, the rail still has 12 entries with `moduleId === "habits"` at the expected index (railOrder 8). | `apps/web/.../shellRegistrations.integration.test.tsx` (extended) | Length === 12 and `find(r => r.moduleId === "habits")` returns the new registration (not a placeholder). |

### 2.13 Token-only styling

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-TOKENS-1** | `styles.css` references **only** semantic tokens (`var(--…)`) and contains zero `#hex` literals. | `styles.css.tokens.test.ts` | Read the file as text; assert `/#[0-9a-fA-F]{3,6}\b/.test(css)` is false. Assert that `var(--accent)`, `var(--blue)`, `var(--amber)`, `var(--red)`, `var(--bg-panel)`, `var(--text-1)` substrings each appear at least once. |
| **AC-TOKENS-2** | StatCard's icon background uses `color-mix(in oklch, var(--accent|--blue|--amber|--red) 14%, transparent)` — token only, no hex. | `StatCard.test.tsx` | Inline style attribute for `.stat-ico` matches `/color-mix\(in oklch, var\(--\w+\) 14%, transparent\)/`. |

### 2.14 Type tests (`*.test-d.ts`)

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-TYPE-1** | `HABITS_STORAGE_KEY` is assignable to `WebPrefKey`. | `types.test-d.ts` | `expectType<WebPrefKey>(HABITS_STORAGE_KEY)`. |
| **AC-TYPE-2** | `"web:habits:checkin-recorded" extends keyof EventMap`. | same | `expectType<EventMap["web:habits:checkin-recorded"]>({ habitId: "", date: "", streak: 0, recordedAt: "" })`. |
| **AC-TYPE-3** | `HabitsState` is assignable to `WebPrefValue<"xai_habits_state">`. | same | `expectType<WebPrefValue<"xai_habits_state">>(state)` (after a typed cast through `validateHabitsState`). |
| **AC-TYPE-4** | `habitsSlotRegistration` is `WebModuleSlotRegistration`. | same | direct type assignment. |
| **AC-TYPE-5** | `Habit.title` requires both `en` and `zh`. | same | `// @ts-expect-error` on `const _: Habit = { id, emoji, title: { en: "X" }, createdAt }` (zh missing). |
| **AC-TYPE-6** | `WeekStart` is a strict literal union. | same | `// @ts-expect-error` on `const _: WeekStart = "tuesday"`. |

### 2.15 Validation

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-VAL-1** | `isHabit({...minimal valid object})` returns true. | `validate.test.ts` | true for `{ id: "h_x", emoji: "🌱", title: { en: "A", zh: "甲" }, createdAt: "2026-01-01T00:00:00.000Z" }`. |
| **AC-VAL-2** | `isHabit` rejects missing `title.zh`. | same | false. |
| **AC-VAL-3** | `isHabit` rejects non-string `id`. | same | false for `{ id: 0, ... }`. |
| **AC-VAL-4** | `validateHabitsState` accepts a clean blob. | same | Returns equal value. |
| **AC-VAL-5** | `validateHabitsState` returns default for malformed `checkIns` shape. | same | When `checkIns` is an array (not an object), returns default. |
| **AC-VAL-6** | `validateHabitsState` returns default for `schemaVersion !== 1`. | same | Default returned. |

### 2.16 Public-surface barrel

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-BARREL-1** | All public names re-exported from `index.ts`. | `index-barrel.test.ts` | `expect(Object.keys(barrel).sort()).toEqual(["HABITS_STORAGE_KEY","HabitsModule","default","habitsSlotRegistration"])` (plus types — types are tree-shaken at runtime). |

### 2.17 Registry presence (cross-package smoke)

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-REGISTRY-1** | `PREF_REGISTRY["xai_habits_state"]` exists with `owner: "xai-web-habits"`, `category: "module"`, `codec: "json"`, `schemaVersion: 1`. | `registry-presence.test.ts` | `expect(PREF_REGISTRY.xai_habits_state).toMatchObject({ owner: "xai-web-habits", category: "module", codec: "json", schemaVersion: 1 })`. |
| **AC-REGISTRY-2** | The default value is a `HabitsState`-shaped object. | same | Default has `schemaVersion: 1`, `habits: []`, `checkIns: {}`, `diaries: {}`. |

---

## 3. Mock strategy

- **`localStorage`**: provided by jsdom. The vitest setup file (`__tests__/setup.ts`) calls `localStorage.clear()` before each test.
- **`Date`**: tests that depend on "today" use `vi.useFakeTimers()` + `vi.setSystemTime(new Date("2026-05-23T12:00:00Z"))` for determinism. Helpers like `computeStreak` accept `today: Date` as a parameter — most tests pass an explicit date and don't need fake timers.
- **`crypto.randomUUID`**: jsdom provides it. For deterministic id tests, stub `globalThis.crypto.randomUUID` with a counter.
- **`useWebShell` context**: `registration.test.tsx` wraps `HabitsSlotHost` in a minimal `<WebShellProvider lang="en" railPos="left" petOn={false} setPetOn={() => {}} modules={[]}>...</WebShellProvider>`.
- **`emitWebEvent`**: `HabitsModule.events.test.tsx` uses `onWebEvent` from `@repo/xai-web-event-bus` (the actual runtime, not a mock — it's a single in-process EventTarget). This matches the matrix events-test pattern.
- **`setPref` spy**: tests that need to assert no-write (AC-DIARY-4) wrap `setPref` via `vi.spyOn(storageModule, "setPref")`; jsdom's storage stays the source of truth.
- **Network**: no network — module is offline-only by ADR-0007 §S8.

---

## 4. Test helpers

### 4.1 `__tests__/setup.ts`

```ts
import { afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
```

### 4.2 `__tests__/_helpers/render.tsx`

```ts
import { render } from "@testing-library/react";
import { WebShellProvider } from "@repo/xai-web-shell";
import type { Lang } from "@repo/plugin-web-tokens";
import { HabitsModule } from "../../HabitsModule.js";

export function renderHabits(lang: Lang = "en", weekStart: "sun" | "mon" = "sun") {
  return render(
    <WebShellProvider modules={[]} lang={lang} railPos="left" petOn={false} setPetOn={() => {}}>
      <HabitsModule lang={lang} weekStart={weekStart} />
    </WebShellProvider>
  );
}
```

### 4.3 `__tests__/_helpers/state.ts`

Helpers to construct sample `HabitsState` blobs:

```ts
export const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: "h_test",
  emoji: "🌱",
  title: { en: "Test habit", zh: "测试习惯" },
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

export const makeState = (
  habits: Habit[],
  checkIns: Record<HabitId, Record<DateKey, true>> = {},
  diaries: Record<HabitId, Record<MonthKey, string>> = {},
): HabitsState => ({ schemaVersion: 1, habits, checkIns, diaries });
```

---

## 5. Coverage targets

| Metric | Target |
|---|---|
| Statements | ≥ 90% |
| Branches | ≥ 85% |
| Functions | ≥ 95% |
| Lines | ≥ 90% |

Untested-by-design lines (with `/* c8 ignore next */` markers if needed):

- The `crypto.randomUUID()` fallback branch inside `createId()` (impossible to
  trigger in jsdom — covered by code-review).
- The `console.warn` paths inside `usePref` / `emitWebEvent` (already covered
  by upstream packages).

Run: `pnpm --filter @repo/plugin-web-habits test:coverage`.

---

## 6. Cross-vendor manual smoke (P3)

`Verify Cross-vendor: yes` per the worker brief. Run `pnpm dev` in `apps/web/`
on real macOS hardware, then for each row:

| # | Vendor | Check | Status |
|---|---|---|---|
| XVENDOR-1 | Safari 17+ | Toggle a hcell; reload page; check persists. | [ ] |
| XVENDOR-2 | Chrome / Firefox | Same as XVENDOR-1. | [ ] |
| XVENDOR-3 | Safari/Chrome/Firefox | Switch language EN ↔ ZH via Topbar; all habits-module strings switch. | [ ] |
| XVENDOR-4 | Safari/Chrome/Firefox | Open module in two tabs; toggle in tab A; tab B updates within ~1s (storage event). | [ ] |
| XVENDOR-5 | Safari/Chrome/Firefox | Type into diary textarea + blur; reload; text persists. | [ ] |
| XVENDOR-6 | Safari/Chrome/Firefox | Open Add-Habit modal; create a habit with custom emoji + bilingual title; new habit appears. | [ ] |
| XVENDOR-7 | Safari/Chrome/Firefox | Click month-nav `<` and `>`; calendar updates; navigates across Jan/Dec year boundary. | [ ] |
| XVENDOR-8 | Safari/Chrome/Firefox | No console errors or warnings in any vendor. | [ ] |
| XVENDOR-9 | Safari/Chrome/Firefox | Visual: stat-card icon backgrounds render distinctly per token color (accent/blue/amber/red) under default bgTone + at least one alternate (e.g. sage). | [ ] |

The `feature-verify` agent will execute these or defer to ship-time human
per the matrix W2 precedent (`packages/xai-web-matrix/docs/dev_log.md`
Cross-vendor Deferred Checklist pattern).

---

## 7. Verify gates (`feature-verify` exit conditions)

| # | Gate | Tool |
|---|---|---|
| 1 | `pnpm --filter @repo/plugin-web-habits test` → green | Vitest |
| 2 | `pnpm --filter @repo/plugin-web-habits check-types` → 0 | tsc |
| 3 | `pnpm --filter @repo/plugin-web-habits lint` → 0 | ESLint |
| 4 | `pnpm --filter @repo/plugin-web-storage check-types` → 0 (registry edit) | tsc |
| 5 | `pnpm --filter @repo/plugin-web-storage test` → green (registry parity tests still pass) | Vitest |
| 6 | `pnpm --filter @repo/core check-types` → 0 (no edit, but consumer compile of `web:habits:*` payload type) | tsc |
| 7 | `pnpm --filter @repo/web check-types` → 0 | tsc |
| 8 | `pnpm --filter @repo/web build` → green (Vite production build) | Vite |
| 9 | AC categories exercised (count of distinct AC IDs ≥ 50) | grep over `__tests__/` |
| 10 | All zero-hex assertions pass | `styles.css.tokens.test.ts` |
| 11 | Registry-presence runtime assertion | `registry-presence.test.ts` |
| 12 | Slot registration in `apps/web/src/routes/modules/shellRegistrations.tsx` at index 7 (railOrder 8) | `shellRegistrations.integration.test.tsx` |
| 13 | Cold-read implementation ↔ seed brief acceptance signal | Manual code review by feature-verify |
| 14 | AC-XVENDOR-1..9 — Safari/Chrome/Firefox manual smoke | Deferred to ship-time human OR executed by feature-verify per `test.md` §6. |
| 15 | Commit hygiene + dev_log Status Panel | Manual review |

Verdict thresholds (per matrix precedent):

- **All 1–13 + 15 green** + **14 either green or DEFERRED-to-ship** → `READY_TO_SHIP`.
- Any 1–13 + 15 red → `BLOCKED` → return to `feature-build`.
