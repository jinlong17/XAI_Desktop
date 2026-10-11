# Design Snapshot — xai-web-habits

> Companion to: `docs/reviews/xai-web-habits/20260523-discovery-review.md`
> Governing ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map row `module-habits.jsx`) + §S5 (JSX→TSX rules) + §S7 (event bus) + §S8 (persistence)
> Roadmap row: `docs/workflow/roadmap/xai-web-console.md` row #15 (W2 Module — Habits)

---

## 1. Decision snapshot

| Field | Value |
|---|---|
| Selected Option | **C** — Vite + TS package at `packages/xai-web-habits/` (per ADR-0007 §S4) with **single-blob persistence** in `xai_habits_state` (axis A1), **synchronous setPref on every check-toggle** (axis B1), **strict-consecutive streak with today included** (axis C1), **D3 weekStart prop default Sunday** (axis D3), **E1 year-scoped 6/365 progress** (axis E1), **F2 per-habit per-month diary** (axis F2), and **emit-only on the pre-declared `web:habits:checkin-recorded` channel** (no new EventMap entry needed). |
| Review Doc | `docs/reviews/xai-web-habits/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Frozen Assumptions | See `discovery-review.md` §8 (17 items). Anchored verbatim by reference; restated in §1.1 below. |
| Package directory | `packages/xai-web-habits/` |
| Package name | `@repo/plugin-web-habits` |
| Module id (rail) | `"habits"` — already a `WebModuleId` literal (verified in `packages/core/src/types/events.ts`). |
| Rail order | 8 (already placeholder-mounted in `apps/web/src/routes/modules/shellRegistrations.tsx:53`). |
| Rail icon | `"pin"` (already in `WebShellIconName` enum at `packages/xai-web-shell/src/types.ts:29`). |
| Status (dev_log) | PLAN_DRAFT → NEEDS_REVIEW |

### 1.1 Frozen assumptions (verbatim from discovery §8)

1. **Package layout** — `packages/xai-web-habits/` (directory) + `@repo/plugin-web-habits` (package name).
2. **Public surface** — `HabitsModule` (default + named export), `habitsSlotRegistration`, `HABITS_STORAGE_KEY = "xai_habits_state"`, types `Habit`, `HabitId`, `HabitsState`, `DateKey`, `MonthKey`, `WeekStart`, `HabitsModuleProps`.
3. **Persistence** — one key `xai_habits_state`, JSON codec, schemaVersion 1, owner `xai-web-habits`, category `module`, `proposed: false`.
4. **Date keys** — UTC `YYYY-MM-DD` for `checkIns`, UTC `YYYY-MM` for `diaries`. Matches the event payload's existing `date: string` UTC convention at `events.ts:212`.
5. **Streak** — C1 strict-consecutive including today; zero-out on any skip.
6. **6/365** — E1 year-scoped: numerator = check-ins this calendar year; denominator = 365 (366 on leap years).
7. **Monthly rate** — denominator = `today.getDate()` (days elapsed in current month, inclusive).
8. **Diary** — F2 per-habit per-month, persists on textarea blur; controlled `useState` mirror during typing.
9. **Event emit** — `web:habits:checkin-recorded` (already declared in `@repo/core`). Emit on every successful toggle (add AND remove). Payload `streak` is the post-toggle value.
10. **Week-start** — `weekStart?: "sun" | "mon"` prop default `"sun"`. Host wrapper hard-codes `"sun"` in v1; Settings W4 will edit one line.
11. **Add-Habit modal** — included in v1 (P3). Bilingual title × 2 fields + emoji string input.
12. **Icons** — inline 10 SVG glyphs in `internal/icons.tsx`. No upstream-shell coordination.
13. **Empty-state copy** — reuse `habits.empty_log`. No new i18n keys.
14. **Slot wiring** — replace placeholder at `shellRegistrations.tsx:53`.
15. **No new external deps** in `package.json` beyond workspace `@repo/*` deps.
16. **CSS** — `styles.css`, tokens-only; prototype class names preserved.
17. **Verify Cross-vendor: yes** (Safari 17+ / Chrome / Firefox).

---

## 2. Dependency overview

### 2.1 Workspace dependencies (`package.json`)

```jsonc
"dependencies": {
  "@repo/core":                 "workspace:*",   // EventMap, WebModuleId
  "@repo/plugin-web-tokens":    "workspace:*",   // useI18n + tokens.css + Lang
  "@repo/plugin-web-storage":   "workspace:*",   // usePref + WebPrefKey
  "@repo/xai-web-event-bus":    "workspace:*",   // emitWebEvent
  "@repo/xai-web-shell":        "workspace:*"    // WebModuleSlotRegistration + useWebShell
},
"peerDependencies": {
  "react":     "^19",
  "react-dom": "^19"
}
```

No `react-router` direct dep — `HabitsModule` does not navigate; the shell
drives routing via the slot system.

### 2.2 Cross-package dependency graph

```
@repo/plugin-web-habits (this row)
  ├─ depends on → @repo/core                  [EventMap web:habits:checkin-recorded]
  ├─ depends on → @repo/plugin-web-tokens     [useI18n, tokens.css, Lang]
  ├─ depends on → @repo/plugin-web-storage    [usePref, WebPrefKey, PREF_REGISTRY]
  ├─ depends on → @repo/xai-web-event-bus     [emitWebEvent]
  └─ depends on → @repo/xai-web-shell         [WebModuleSlotRegistration, useWebShell]

apps/web (host)
  └─ depends on → @repo/plugin-web-habits     [HabitsModule + habitsSlotRegistration]
                                              wired in shellRegistrations.tsx:53

xai-web-statistics row #20 (PENDING)
  └─ subscribes to web:habits:checkin-recorded via @repo/xai-web-event-bus
     (no direct import on this package)
```

No reverse edges. No imports from other `xai-web-*` plugins. Conforms to
ADR-0003 (plugin platform-neutrality) and CLAUDE.md "Code Boundaries".

### 2.3 Files touched outside `packages/xai-web-habits/`

Three files outside the package directory will be edited. Each is a single
additive write — no behavior changes for existing code.

| File | Change | Phase | Risk |
|---|---|---|---|
| `apps/web/src/routes/modules/shellRegistrations.tsx` | Replace `placeholder("habits", "Habits", "pin", 8)` (line 53) with `habitsSlotRegistration` from `@repo/plugin-web-habits` | P1 | Low — same row in array, same `moduleId` / `railOrder` / `icon` / `i18nKey`. |
| `apps/web/package.json` | Append `"@repo/plugin-web-habits": "workspace:*"` to `dependencies` | P1 | Low — one line, additive. |
| `packages/plugin-web-storage/src/internal/registry.ts` | Append `xai_habits_state` entry to `PREF_REGISTRY` after the existing entries | P1 | Low — additive (W1 §S8 reservation precedent). |

`packages/core/src/types/events.ts` is **NOT** edited — the
`web:habits:checkin-recorded` channel is already declared at lines 209–218.

### 2.4 PLUGIN_MAP impact

After ship, add a new row to `docs/PLUGIN_MAP.md`:

| Plugin | Status | Owner | Notes |
|---|---|---|---|
| `@repo/plugin-web-habits` | In-Dev → Production (post-ship) | xai-web-habits row #15 | Habits module — list + check-toggle + 4-up stats + 6/365 + month calendar + diary; consumes `xai-web-shell` / `plugin-web-tokens` / `plugin-web-storage` / `xai-web-event-bus`; emits `web:habits:checkin-recorded`. |

(PLUGIN_MAP update belongs to the `ship` step, not this plan.)

---

## 3. Component composition

```
<HabitsModule lang={lang} weekStart="sun">           // module shell
  └─ <div class="module module-habits">
       ├─ <HabitList                                 // LEFT pane
       │     habits={state.habits}
       │     checkIns={state.checkIns}
       │     selectedId={selectedId}
       │     weekStart={weekStart}
       │     onSelect={setSelectedId}
       │     onToggle={toggleCheckIn}
       │     onAddHabit={openAddDialog}>
       │
       │   <section class="habits-list panel">
       │     ├─ <header class="module-head module-head-inline">
       │     │     ├─ <h1 class="module-title">{t.habits.title}</h1>
       │     │     ├─ <span class="grow"/>
       │     │     ├─ <div class="seg">              // view toggle (list-only in v1)
       │     │     ├─ <button class="icon-btn" onClick={onAddHabit}><Icon name="plus"/></button>
       │     │     └─ <button class="icon-btn"><Icon name="dots"/></button>     // no-op v1
       │     ├─ <div class="week-header">
       │     │     {weekDates(now, weekStart).map(d => <div class="weekday">…</div>)}
       │     └─ <div class="habit-rows">
       │           {habits.map(h => <HabitRow … />)}
       │
       └─ <HabitDetail                              // RIGHT pane
              habit={habits.find(h => h.id === selectedId)}
              checkIns={state.checkIns[selectedId] ?? {}}
              diary={state.diaries[selectedId] ?? {}}
              setDiary={setDiaryForHabit}
              displayedMonth={displayedMonth}
              onPrevMonth={…} onNextMonth={…}>

            <section class="habits-detail">
              ├─ <header class="detail-head">
              │     ├─ <span class="habit-emoji-lg">{habit.emoji}</span>
              │     ├─ <h2 class="detail-title">{habit.title[lang]}</h2>
              │     ├─ <span class="grow"/>
              │     └─ <button class="icon-btn"><Icon name="dots"/></button>   // no-op v1
              ├─ <div class="stat-grid">
              │     <StatCard icon="check"  color="var(--accent)" label={t.habits.monthly_checkins} value={monthlyCount}      unit={t.common.day}/>
              │     <StatCard icon="bolt"   color="var(--blue)"   label={t.habits.total_checkins}   value={totalCount}        unit={t.common.days}/>
              │     <StatCard icon="target" color="var(--amber)"  label={t.habits.monthly_rate}     value={monthlyRatePct}    unit="%"/>
              │     <StatCard icon="fire"   color="var(--red)"    label={t.habits.streak}           value={streak}            unit={t.common.day}/>
              ├─ <div class="progress-card panel">
              │     ├─ <div class="progress-head">
              │     │     ├─ <div class="progress-num mono">{numerator}/{denominator}</div>
              │     │     ├─ <div class="progress-sub">{denominator - numerator} {t.common.days}</div>
              │     │     ├─ <span class="grow"/>
              │     │     └─ <GoalMedal/>
              │     └─ <MonthCalendar
              │           habit={habit}
              │           checkIns={checkIns}
              │           displayedMonth={displayedMonth}
              │           weekStart={weekStart}
              │           today={now}/>
              └─ <DiaryCard
                    habitId={selectedId}
                    monthKey={monthKey(displayedMonth)}
                    value={diary[monthKey(displayedMonth)] ?? ""}
                    setValue={(v) => setDiaryForHabit(selectedId, monthKey(displayedMonth), v)}
                    emptyHint={t.habits.empty_log}/>

<HabitRow … onClick={onSelect}>
  ├─ <div class="habit-emoji">{habit.emoji}</div>
  ├─ <div class="habit-row-body">
  │     ├─ <div class="habit-title">{habit.title[lang]}</div>
  │     └─ <div class="habit-stats">
  │           <Icon name="bolt"/> <span>{totalCount} {t.common.days}</span>
  │           <Icon name="fire"/> <span>{streak} {t.common.day}</span>
  └─ <div class="habit-week">
        {weekDates.map((d, i) =>
          <button class={"hcell" + (checked ? " on" : "") + (i === todayIdx ? " today" : "")}
                  onClick={(e) => { e.stopPropagation(); onToggle(habit.id, dateKey(d)); }}>
            {checked && <Icon name="check"/>}
          </button>
        )}
```

### 3.1 Module-internal state

Root state in `HabitsModule`:

```ts
const [state, setState] = usePref("xai_habits_state");   // typed via PREF_REGISTRY
const [selectedId, setSelectedId] = useState<HabitId>(() => state.habits[0]?.id ?? "");
const [displayedMonth, setDisplayedMonth] = useState<{ year: number; month0: number }>(
  () => ({ year: new Date().getUTCFullYear(), month0: new Date().getUTCMonth() })
);
const [addDialogOpen, setAddDialogOpen] = useState(false);
```

`displayedMonth` is what the month calendar shows; prev / next month buttons
update it. It resets to "now" when the user switches habits (so they always
land on the current month for a freshly-selected habit).

### 3.2 No React Context

`lang` and `weekStart` flow in as props. No new context provider — mirrors
the matrix design (`packages/xai-web-matrix/docs/design.md` §3.2).

---

## 4. CSS strategy

A single side-effect-imported `styles.css` declares the prototype's class
names. All colors via `tokens.css` variables (CSS lint test enforces zero hex
literals — AC-TOKENS-1 in `test.md`).

Class names preserved verbatim from prototype `module-habits.jsx` for visual
parity:

```
.module-habits, .habits-list, .habits-detail,
.module-head, .module-head-inline, .module-title, .grow,
.seg, .icon-btn,
.week-header, .weekday, .wd-name, .wd-num, .today,
.habit-rows, .habit-row, .habit-row.active,
.habit-emoji, .habit-emoji-lg, .habit-row-body, .habit-title, .habit-stats,
.habit-week, .hcell, .hcell.on, .hcell.today,
.detail-head, .detail-title,
.stat-grid, .stat-card, .stat-head, .stat-ico, .stat-label, .stat-value, .stat-unit, .mono,
.progress-card, .progress-head, .progress-num, .progress-sub,
.goal-medal,
.month-cal, .cal-grid, .cal-h, .cal-cell, .cal-cell.in, .cal-cell.today,
.cal-num, .cal-ring,
.log-card, .log-title, .log-empty
```

Stat-card icon background uses the prototype's `color-mix(in oklch, ${color}
14%, transparent)` pattern (inline style, since the color varies per card and
is parameterized by token).

`styles.css` is imported as a side-effect from `index.ts` (so each consumer
gets the CSS at import time without needing to remember to import the CSS
file). The package's `package.json` declares `"sideEffects": ["./src/styles.css",
"./src/index.ts"]` so tree-shaking does not strip it (mirrors
`@repo/plugin-web-countdown`'s shipped pattern).

---

## 5. Persistence design

### 5.1 Registry entry (additive write in P1)

To be appended to `packages/plugin-web-storage/src/internal/registry.ts` AFTER
the existing entries (after `xai_matrix_state` at line 333). Mirrors the
shipped `xai_countdowns` / `xai_matrix_state` pattern:

```ts
// ---- Habits (§S8 — declared by xai-web-habits #15) ------------------------
// Opaque storage type; canonical declarations live in @repo/plugin-web-habits.
export type HabitsStateBlob = unknown;

xai_habits_state: {
  key: "xai_habits_state",
  codec: "json",
  default: {
    schemaVersion: 1,
    habits: [],
    checkIns: {},
    diaries: {},
  } as HabitsStateBlob,
  schemaVersion: 1,
  owner: "xai-web-habits",
  category: "module",
} satisfies PrefEntry<HabitsStateBlob>,
```

- Same `unknown`-alias pattern as `BoardsState = unknown` (registry.ts:85),
  `MatrixStateBlob = unknown` (registry.ts:92). Consumers cast through this
  row's typed surface.
- `WebPrefKey` derives `xai_habits_state` automatically.
- `proposed: false` — `xai_habits_state` is the canonical name approved by
  the worker brief; the §S8 "proposed" reservation flag is only for
  pomodoro / countdown / matrix per the existing convention.
- No edit to `@repo/plugin-web-storage`'s `index.ts` — `HabitsStateBlob` is
  an internal helper used only by the registry entry.

### 5.2 Typed state shape (canonical declaration in this package)

```ts
// packages/xai-web-habits/src/types.ts

import type { Lang } from "@repo/plugin-web-tokens";

/** Stable opaque habit id. */
export type HabitId = string;

/** UTC day key, format `YYYY-MM-DD`. Matches the event payload's `date` field. */
export type DateKey = string;

/** UTC month key, format `YYYY-MM`. */
export type MonthKey = string;

/** Week-start preference. Default "sun"; Settings W4 may flip to "mon". */
export type WeekStart = "sun" | "mon";

/** A single habit definition (no check-in state — that's separate). */
export interface Habit {
  readonly id: HabitId;
  /** Emoji glyph string (1–4 chars typical). */
  readonly emoji: string;
  /** Bilingual title — both langs MUST be present. */
  readonly title: { en: string; zh: string };
  /** ISO timestamp the habit was created; the "since" date for total counts. */
  readonly createdAt: string;
}

/** Top-level persisted state — JSON-encoded in localStorage. */
export interface HabitsState {
  readonly schemaVersion: 1;
  readonly habits: ReadonlyArray<Habit>;
  /** Sparse: only checked (habit, day) pairs appear. */
  readonly checkIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  /** Per-habit per-month diary text. */
  readonly diaries: Readonly<Record<HabitId, Readonly<Record<MonthKey, string>>>>;
}

/** Props for `<HabitsModule/>`. */
export interface HabitsModuleProps {
  /** Active UI language — drives `useI18n(lang)`. */
  lang: Lang;
  /** Week-start preference (default "sun"; Settings W4 may flip to "mon"). */
  weekStart?: WeekStart;
}
```

### 5.3 Read / write path

- **Read**: `usePref("xai_habits_state")` returns `[state, setState, meta]`.
  Module casts through `HabitsState` boundary via `validateHabitsState(raw)`
  (similar to `isCountdownCard` shipped in countdown).
- **Write on check-toggle**: synchronous `setState(next)` where `next` is the
  updated blob (single function call). The `usePref` internals call
  `setPref(key, nextValue)` which writes synchronously and dispatches the
  same-tab pub/sub event.
- **Write on diary**: synchronous `setState(next)` on textarea `onBlur`. The
  textarea holds its own `useState<string>` mirror during typing for
  responsiveness.
- **Cross-tab**: `usePref` already wires the `storage` event listener (per
  row #3 shipped tests). Two-tab toggle stays consistent within ~50 ms.
- **Default**: `{ schemaVersion: 1, habits: [], checkIns: {}, diaries: {} }`.
  On first mount with default state, `HabitsModule` seeds from
  `internal/seed.ts` (a small typed `INITIAL_HABITS` array, ~5 habits with
  emoji + bilingual titles + empty check-ins) — same opt-in seed pattern
  matrix uses (see `packages/xai-web-matrix/docs/design.md` §5.2).

### 5.4 Migration discipline

`schemaVersion: 1`. If v2 introduces (a) goal frequencies, (b) per-day diaries
(F1 collapse), (c) habit archival flag, or (d) tasks-store join, then:

1. Bump `schemaVersion` to 2 in registry entry.
2. Register a migration via `packages/plugin-web-storage/src/internal/migrate.ts`.
3. Document in `design.md` and bump dev_log iteration.

The schema is purposefully a top-level object so adding fields is trivially
additive.

---

## 6. Check-toggle reducer

```ts
// internal/toggle.ts

export function toggleCheckIn(
  state: HabitsState,
  habitId: HabitId,
  dateKey: DateKey,
): { next: HabitsState; postStreak: number } {
  const habitCheckIns = state.checkIns[habitId] ?? {};
  const wasChecked = habitCheckIns[dateKey] === true;

  // Build new per-habit map: either remove the key or add `true`.
  const nextHabitCheckIns: Record<DateKey, true> = { ...habitCheckIns };
  if (wasChecked) {
    delete nextHabitCheckIns[dateKey];
  } else {
    nextHabitCheckIns[dateKey] = true;
  }

  const nextCheckIns: HabitsState["checkIns"] = {
    ...state.checkIns,
    [habitId]: nextHabitCheckIns,
  };

  const next: HabitsState = { ...state, checkIns: nextCheckIns };
  const postStreak = computeStreak(nextHabitCheckIns, new Date());

  return { next, postStreak };
}
```

Properties:

- **Idempotent at the value layer**: toggling the same `(habitId, dateKey)`
  twice returns the original state via the same code path.
- **Pure**: no I/O, no Date.now() side effect beyond the `new Date()` for
  streak compute.
- **Streak passed back**: caller uses `postStreak` for the event emit, so the
  emit's payload reflects the **post-toggle** streak (per frozen assumption §9).

### 6.1 `computeStreak`

```ts
// internal/computeStreak.ts

export function computeStreak(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  today: Date,
): number {
  // C1: strict-consecutive including today.
  // If today is not checked, return 0.
  const todayKey = utcDateKey(today);
  if (habitCheckIns[todayKey] !== true) return 0;

  let streak = 1;
  let cursor = new Date(today);
  cursor.setUTCDate(cursor.getUTCDate() - 1);

  while (habitCheckIns[utcDateKey(cursor)] === true) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (streak > 100_000) break;   // safety guard against pathological state
  }

  return streak;
}
```

Edge cases covered by tests (`test.md` §2.4):

| Case | Expected |
|---|---|
| Empty check-ins | 0 |
| Today not checked, yesterday + earlier checked | 0 |
| Today checked, yesterday not | 1 |
| Today and 5 prior days checked consecutively | 6 |
| Today + 3 prior + skip 1 + 4 prior all checked | 4 (skip breaks the run before the 4) |
| Date in the future is checked (data corruption) | streak still anchored at today; future dates ignored. |
| DST spring-forward boundary | UTC keys eliminate the issue — handled. |

### 6.2 `computeMonthlyCount` / `computeMonthlyRate` / `compute365`

```ts
// internal/computeStats.ts

export function computeMonthlyCount(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  ref: Date,                          // typically `new Date()`
): number {
  const prefix = `${ref.getUTCFullYear()}-${pad2(ref.getUTCMonth() + 1)}-`;
  return Object.keys(habitCheckIns).filter(k => k.startsWith(prefix)).length;
}

export function computeMonthlyRate(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  ref: Date,
): number {
  const checks = computeMonthlyCount(habitCheckIns, ref);
  const daysSoFar = ref.getUTCDate();      // 1..31
  if (daysSoFar === 0) return 0;
  return Math.round((checks / daysSoFar) * 100);
}

export function compute365(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  ref: Date,
): { numerator: number; denominator: 365 | 366 } {
  const year = ref.getUTCFullYear();
  const prefix = `${year}-`;
  const numerator = Object.keys(habitCheckIns).filter(k => k.startsWith(prefix)).length;
  const denominator = isLeapYear(year) ? 366 : 365;
  return { numerator, denominator };
}
```

All three are pure — easily testable. Tests cover empty / single-month /
cross-year boundaries / leap year / February 29th.

---

## 7. Event emit

```ts
// internal/emit.ts

import { emitWebEvent } from "@repo/xai-web-event-bus";

export function emitCheckInRecorded(args: {
  habitId: HabitId;
  date: DateKey;
  streak: number;
}): void {
  emitWebEvent("web:habits:checkin-recorded", {
    habitId: args.habitId,
    date: args.date,
    streak: args.streak,
    recordedAt: new Date().toISOString(),
  });
}
```

The channel `web:habits:checkin-recorded` is **already declared** in
`packages/core/src/types/events.ts` lines 209–218 (verified). The
`WebEventMap` from `@repo/xai-web-event-bus` projects it automatically — no
edit to `events.ts` or `xai-web-event-bus` needed.

Statistics row #20 will subscribe via `useWebEventListener("web:habits:checkin-recorded",
handler)` on its own row.

### 7.1 Emit-on-remove rationale (Q7)

Per frozen assumption §9: emit on every successful toggle (both add and
remove). The channel name `checkin-recorded` is symmetric; downstream
consumers (statistics) can filter on `streak > previousStreak` if they need
add-only.

Counterargument considered + rejected: the literal reading "recorded" might
imply add-only. But (a) the payload's `streak` field naturally handles the
remove case (it reports the post-toggle streak, which may be 0 if the user
broke the run); (b) statistics will want to update on un-check too (the
day's check disappearing affects the rolling rate).

---

## 8. Module slot registration

```ts
// registration.tsx

import React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { HabitsModule } from "./HabitsModule.js";

function HabitsSlotHost() {
  const { lang } = useWebShell();
  // v1: hard-coded weekStart="sun" — Settings W4 (row #24) edits this line
  // to read from a future xai_pref_week_start registry entry.
  return <HabitsModule lang={lang} weekStart="sun" />;
}

export const habitsSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "habits",
  label: "Habits",
  defaultChildPath: "",
  children: [
    { path: "", render: HabitsSlotHost },
    { path: "*", render: HabitsSlotHost },
  ],
  icon: "pin",
  railOrder: 8,
  i18nKey: "nav.habits",
  showInRail: true,
};
```

Mirrors the shipped countdown / matrix slot registration patterns
(`packages/plugin-web-countdown/src/registration.tsx`,
`packages/xai-web-matrix/src/registration.tsx` referenced in matrix
design.md §1.4).

---

## 9. Add-Habit modal (P3)

Minimal modal mirroring `CountdownEditDialog` (shipped W2 row #17):

```ts
// AddHabitDialog.tsx (P3)

interface AddHabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (habit: { emoji: string; title: { en: string; zh: string } }) => void;
}
```

Fields:

- `emoji: string` — single-line text input (placeholder "🌱" for inspiration).
  Validation: 1–8 chars, must not be whitespace-only.
- `titleEn: string` — `Title (English)` — non-empty.
- `titleZh: string` — `标题 (中文)` — non-empty.

Save → `onSave({ emoji, title: { en: titleEn, zh: titleZh } })` → parent
appends `{ id: createId(), emoji, title, createdAt: new Date().toISOString() }`
to `state.habits` via `setState`.

Id generation: a small `createId()` helper that returns
`"h_" + crypto.randomUUID().slice(0, 8)`. (No new dep; `crypto.randomUUID`
exists in all target browsers.)

---

## 10. Error semantics

`HabitsModule` is a leaf UI component — no `Result<T, E>` style returns.
Error surfaces:

| Failure mode | Behavior |
|---|---|
| `localStorage.getItem("xai_habits_state")` returns `null` | `usePref` returns default `{ schemaVersion: 1, habits: [], checkIns: {}, diaries: {} }`; module seeds from `internal/seed.ts`. |
| Stored value `JSON.parse` fails | `usePref` falls back to default. Logged via storage layer's DEV warning. |
| Stored `schemaVersion !== 1` | `validateHabitsState` returns the default. Future v2 will register a migration. |
| Toggle clicked while `state.habits[habitId]` is missing (concurrent delete in another tab) | `toggleCheckIn` early-returns; no state change, no event emit. |
| `emitWebEvent` throws | Caller swallows + DEV-warns (matches `@repo/xai-web-event-bus` emitter semantics). State change still persists. |
| `crypto.randomUUID()` unavailable (very old browser) | `createId()` falls back to `"h_" + Date.now().toString(36) + Math.random().toString(36).slice(2,8)`. |
| Diary textarea blur with unchanged value | Cheap equality guard skips `setPref` if `value === state.diaries[habitId][monthKey]`. |

No exceptions thrown out of `HabitsModule` for any user-driven interaction.

---

## 11. Performance budget

| Metric | Budget | Rationale |
|---|---|---|
| First render | < 12 ms (jsdom) | List + detail panes; ~5 habits seeded; 4 stat cards. |
| Check-toggle (state-update + persist + emit) | < 5 ms p99 | One shallow object merge + one JSON.stringify of ≤ ~2 KB blob. |
| Re-render on `usePref` setState | < 8 ms (jsdom) | Single state tree; memoized stat computations. |
| Stat-card recompute on check-toggle | < 1 ms | Pure functions over ≤ 365 keys. |
| Bundle size (production gzip, this package only) | < 14 KB | 158 LOC prototype + bilingual seed + 10 inline SVGs + ~120 lines CSS. |

Documented; no perf-budget CI in v1 (matches matrix precedent).

---

## 12. Public-surface stability

Per W2 convention, the public surface is "Production" once `ship` flips
dev_log to SHIPPED. Until then, "In-Dev" and may change between phases.

Backward-compat rules after ship:

- Adding new optional fields to `Habit` (e.g. `archivedAt`) is non-breaking.
- Adding new top-level fields to `HabitsState` (with safe defaults) is
  non-breaking but requires schemaVersion bump + migration.
- Renaming `xai_habits_state` is breaking — requires migration entry.
- Changing the event payload shape is breaking — requires EventMap edit +
  consumer-row coordination.
- Removing any exported name is breaking — requires deprecation row.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.
