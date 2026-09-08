# Discovery Review — xai-web-dashboard-real-data

- **Date:** 2026-05-28
- **Author:** claude-opus-4-8 — feature-plan
- **Feature:** `xai-web-dashboard-real-data` — wire 5 dashboard widgets (StatTasks / StatStreak / StatPomos / UpcomingWidget / MiniCalWidget) to real local stores (Realistic v1).
- **Authority:** ADR-0010 Accepted 2026-05-26 §D4 — P0 carve-out `docs/reviews/_p0-carve-outs/20260528-dashboard-real-data.md` (commit `217170c`).
- **Triggering evidence:** `docs/reviews/_web-noop-audit/20260528-usability-recheck.md` — "7 of 11 dashboard widgets render mock fixtures isolated from the real data graph".
- **Branch:** `web` (NOT `dev`).
- **Owning package (EXTENSION):** `@repo/plugin-web-dashboard-widgets` (SHIPPED row #11, manifest `status: Stable`). This is the 2nd item in the item-3 local cluster (1st = `xai-web-dashboard-stickies-create`, SHIPPED 2026-05-28; T-10 SHIPPED → `xai_task_cols` now carries `done`).

---

## §0. Problem framing

The Dashboard renders fiction. The usability recheck flagged that the Stat/Upcoming/MiniCal widgets show hardcoded constants and bilingual fixtures disconnected from the real localStorage stores that already exist:

| Widget | Current source (recon 2026-05-28) | File |
|---|---|---|
| StatTasks | inline `STAT_TASKS_DONE = 14` / `STAT_TASKS_TOTAL = 22` | `src/widgets/StatTasks.tsx:16-17` |
| StatStreak | inline `STAT_STREAK_DAYS = 27` | `src/widgets/StatStreak.tsx:15` |
| StatPomos | inline `STAT_POMOS_DONE = 6` / `STAT_POMOS_TOTAL = 8` | `src/widgets/StatPomos.tsx:15-16` |
| UpcomingWidget | `UPCOMING` fixture (4 hardcoded events) | `src/internal/fixtures.ts:135-164` |
| MiniCalWidget | `CAL_EVENTS` fixture (day-of-month → dots) | `src/internal/fixtures.ts:178-190` |

All four real source keys already exist in `@repo/plugin-web-storage` PREF_REGISTRY (registry.ts):

- `xai_task_cols` (tasks; now carries `done` after T-10 SHIPPED 2026-05-28) — owner `xai-web-tasks`.
- `xai_pomodoro_sessions` (pomodoro) — owner `xai-web-pomodoro`.
- `xai_habits_state` (habits) — owner `xai-web-habits`.
- `xai_calendar_events` (calendar; from `xai-web-calendar-event-create` SHIPPED 2026-05-27) — owner `xai-web-calendar`.

**Goal:** with real user data present, these 5 widgets reflect that data; with none, they show honest empty states ("nothing yet", not fiction); after the user adds data + reloads, they update. **Pure local read-only wiring** — no new registry key, no new dependency, no external API, no CSP change, no write to any store.

This is NOT a technology-selection feature. **No external/web research required** — there is no library choice, no external API, no open-source candidate to evaluate. Every primitive (`usePref`, the registry keys, the owner-module type shapes) already exists in-repo. This discovery is a *read-shape + boundary + planner's-call* analysis, not a solution scan.

---

## §1. Feature classification (SOP_NEW_FEATURE §1.5)

- **Type:** business-orchestration (read-only projection of existing stores into existing UI). NOT a standard-component feature, NOT a project-core capability.
- **Web research needed:** **No.** Confirmed: zero new deps, zero external API, zero library evaluation. The only "research" is reading the 4 source keys' real shapes from their owner modules (done below, §3).
- **Three-faces decision (ADR-0003 / web analog):** stays entirely in the Web business slice `@repo/plugin-web-dashboard-widgets`. No `apps/web` host edit, no `packages/core` edit. (Web analog of "host/core/plugin" — the dashboard-widgets package IS the business plugin; the host is `apps/web`; core is `@repo/core`.)
- **Target package status (PLUGIN_MAP):** `@repo/plugin-web-dashboard-widgets` = **Stable** (SHIPPED row #11 + SHIPPED §E stickies extension). This is an EXTENSION; ship appends a feature note to the row's description, NOT a status change.

---

## §2. The cross-module read pattern — boundary confirmation (carve-out's key question)

The carve-out asks discovery to confirm the cross-module read law and whether a reusable read helper exists. **Confirmed against source:**

### §2.1 The established read pattern is `usePref(key)` + a local narrowing predicate — NOT cross-plugin import

Two SHIPPED precedents read OTHER modules' `xai_*` keys WITHOUT importing the owner plugin package:

1. **`@repo/plugin-web-statistics`** (SHIPPED, Stable) reads `xai_pomodoro_sessions` + `xai_habits_state` + `xai_pref_week_start` via `usePref` and narrows the opaque `unknown`/blob into a usable shape with its OWN local predicates:
   - `internal/isPomodoroSession.ts` — `PomodoroSessionRecord = { mode; durationMs; finishedAt }` + `isPomodoroSession(v): v is PomodoroSessionRecord`.
   - `internal/isHabitsStateRecord.ts` — `HabitsStateRecord = { habits; checkIns; diaries }` + `isHabitsStateRecord(v)` + `EMPTY_HABITS_STATE`.
   - Statistics' own api.md §0 calls this out: *"usePref only — NO direct imports of plugin-web-{tasks,pomodoro,habits} internals."*
2. **`@repo/xai-web-cmdk`** (In-Dev) registers per-module adapters under `adapters/` that read state shapes defensively: `adapters/tasks.ts` (reads `xai_task_cols` as `Record<string, unknown[]>`), `adapters/pomodoro.ts`, `adapters/habits.ts` — each with a local minimal predicate, none importing the owner plugin.

**Verdict:** reading another module's `xai_*` key via `usePref` + a LOCAL narrowing predicate does NOT violate the no-direct-plugin-import red line — no plugin package is imported, only the shared storage layer (`@repo/plugin-web-storage`, already a dependency) + the key string. This is the SAME law Statistics + Cmd-K already operate under. **Frozen.**

### §2.2 Is there a reusable read helper? — NO importable one; we add in-package selectors

The owner modules DO have read helpers, but they all live behind `src/internal/` (the package's private surface) and are NOT exported from the barrel:

| Helper | Location | Exported from barrel? | Reusable here? |
|---|---|---|---|
| `countTodaysPomos` / `countTotalPomos` / `computeStreak` (pomodoro) | `plugin-web-pomodoro/src/internal/derivedCounters.ts` | **No** (barrel exports only `PomodoroSession`/`PomodoroMode`/`DEFAULT_DURATIONS_MS`/`PomodoroModule`) | **No** — importing `internal/` is a red-line violation |
| `computeStreak` (habits, per-habit strict-consecutive) | `xai-web-habits/src/internal/computeStreak.ts` | **No** (barrel exports types + `HabitsModule` + `HABITS_STORAGE_KEY`) | **No** |
| `useUserCalEvents` / `expandRecurrence` / `mergeEventsForViewport` (calendar) | `xai-web-calendar/src/internal/eventStore/*` | **No** (all internal) | **No** |
| `isPomodoroSession` / `isHabitsStateRecord` (statistics narrowers) | `plugin-web-statistics/src/internal/*` | **No** (statistics barrel exports the module + aggregate types) | **No** |

**Conclusion (planner's-call Q4 below):** there is NO importable read helper. We add **in-package read selectors** under `src/internal/dataReads/` — small pure functions + local narrowing predicates, mirroring how Statistics built its own `isPomodoroSession`/`isHabitsStateRecord` rather than importing pomodoro/habits internals. The owner-module canonical TYPES (read below, §3) are the contract we narrow toward; we re-declare the minimal read shape locally (same discipline as Statistics).

### §2.3 The in-package precedent: StickiesWidget already reads `usePref` inside a widget

The SHIPPED §E stickies extension (in THIS package) wired `StickiesWidget` to `usePref("xai_dashboard_stickies")` via `useStickies()` and proved a widget can:
- hold a `usePref`-backed hook and stay a stable React component across the grid's 1Hz `render(ctx)` tick (RS5, verified);
- type-discriminate an empty-store branch (fixture sample) vs a non-empty branch (real data);
- render fixtures only as the empty-state fallback.

Our 5 widgets follow the SAME shape but **read-only** (no create/delete, no setter, no new key). The empty/non-empty branch discipline is directly transferable.

---

## §3. Per-store read shape (the load-bearing recon — carve-out planner's-call Q2)

Read directly from each owner module's canonical type + the SHIPPED Statistics narrowers. **These are the shapes the in-package selectors will narrow toward.**

### §3.1 `xai_task_cols` — tasks (registry default `{}`, codec json)

- **Registry type is misleading.** `registry.ts:84` declares `TaskColsState = Record<string, boolean>` — that is an OPAQUE placeholder, NOT the real shape. The real owner shape (from `xai-web-tasks/src/types.ts`) is:
  ```ts
  Record<BucketId, TaskCol>   // BucketId = "overdue" | "next7" | "later" | "nodate"
  TaskCol = { id; key; count; action?; tasks: TaskCard[]; completed?: TaskCard[] }
  TaskCard = { id; title:{en;zh}; sub?; tag?; date?; dateZh?; dateLabel?; inbox?; done?: boolean }
  ```
- **`done` (T-10):** `TaskCard.done?: boolean` — *"Persisted inside xai_task_cols so completion survives page refresh (T-10 fix). Absent/undefined is treated as false by all consumers."* (`types.ts:55-60`).
- **Read shape for StatTasks:** iterate all buckets, flatten `tasks` (and `completed` if present), count `done === true` and total. The Cmd-K tasks adapter (`adapters/tasks.ts`) confirms the iteration pattern: `Object.values(cols)` → for each `col`, `col.tasks` is the card array. **Caveat:** Cmd-K reads `state as Record<string, unknown[]>` (treating the value as the card array directly) — that is a LOOSER read than the real `Record<BucketId, TaskCol>` where cards are at `col.tasks`. Our selector MUST narrow to the real `{ tasks: TaskCard[]; completed?: TaskCard[] }` shape, not Cmd-K's flattened guess. (Flagged for build — do not copy Cmd-K's tasks read verbatim.)

### §3.2 `xai_pomodoro_sessions` — pomodoro (registry default `[]`, codec json, `proposed: true`)

- **Canonical type** (`plugin-web-pomodoro/src/types.ts`):
  ```ts
  PomodoroSession = {
    id; mode: "focus"|"short-break"|"long-break";
    startedAt: ISO; finishedAt: ISO;
    durationMs; elapsedMs; completed: boolean;
  }
  ```
- **FIELD-NAME CONFLICT (must resolve — flagged):** two SHIPPED readers disagree on the timestamp field:
  - Statistics' `isPomodoroSession` narrows `{ mode; durationMs; finishedAt }` and filters `s.mode === "focus"` (it does NOT check `completed`).
  - Cmd-K's pomodoro adapter reads `completedAt` (`session.completedAt`) — which does **NOT exist** on the canonical type. Cmd-K's read is **wrong/stale** (it would always render `date: ""`).
  - **The canonical field is `finishedAt` + `completed: boolean`** (owner type + owner's own `derivedCounters.countTodaysPomos`: `s.mode === "focus" && s.completed && localDateKey(new Date(s.finishedAt)) === todayLocal`).
- **Read shape for StatPomos:** mirror the OWNER's `countTodaysPomos` semantics (focus + completed + finishedAt's local day === today). **Do NOT copy Cmd-K's `completedAt`.** (Q1 below picks today-vs-week.)

### §3.3 `xai_habits_state` — habits (registry default `{schemaVersion:1, habits:[], checkIns:{}, diaries:{}}`, codec json)

- **Canonical type** (`xai-web-habits/src/types.ts`):
  ```ts
  HabitsState = {
    schemaVersion: 1;
    habits: Habit[];                                              // Habit = { id; emoji; title:{en;zh}; createdAt }
    checkIns: Record<HabitId, Record<DateKey, true>>;            // DateKey = "YYYY-MM-DD" UTC day; sparse, absence = not checked
    diaries: Record<HabitId, Record<MonthKey, string>>;
  }
  ```
- **Streak semantics** (`xai-web-habits/src/internal/computeStreak.ts`, C1 strict-consecutive): per-habit; "if today's UTC dateKey is not checked → 0; else walk back day-by-day while checked." This is PER-HABIT. StatStreak shows ONE number → we need a "best streak across all habits" = `max(computeStreak(checkIns[h.id], today) for h in habits)` (Q3 below).
- **Read shape for StatStreak:** narrow via a local `isHabitsStateRecord`-style predicate (mirror Statistics' `internal/isHabitsStateRecord.ts` + `EMPTY_HABITS_STATE`), then re-implement the per-habit strict-consecutive streak locally (cannot import habits' internal `computeStreak`), take the max. **Date-key basis = UTC `YYYY-MM-DD`** (habits store uses UTC day keys — `computeStreak` uses `utcDateKey`). Honor that to match how check-ins were written.

### §3.4 `xai_calendar_events` — calendar (registry default `{}`, codec json)

- **Canonical type** (`xai-web-calendar/src/internal/eventStore/types.ts`):
  ```ts
  UserCalEvent = {
    id; title: string;
    startISO: "YYYY-MM-DDTHH:MM";   // LOCAL CLOCK, no TZ suffix
    endISO:   "YYYY-MM-DDTHH:MM";   // >= startISO + 5min, SAME calendar day
    colorPreset: "mint"|"amber"|"blue"|"violet"|"rose";
    recurrence: { kind: "daily"|"weekly" } | null;
    createdAt; updatedAt;
  }
  ```
  Stored as `Record<string, UserCalEvent>` (id-keyed). `useUserCalEvents` casts the registry `Record<string, unknown>` to this at a single point (useUserCalEvents.ts:61-62).
- **Recurrence:** `expandRecurrence(event, windowStartKey, windowEndKey)` materializes daily/weekly instances inside a `[startKey, endKey]` window (internal; we re-implement a minimal local version OR a simpler non-recurring-first read — see Q5).
- **Read shape for Upcoming + MiniCal:**
  - **MiniCalWidget** needs event dots keyed by day-of-month for the *currently-viewed month* (the widget has a `view = new Date(now.year, now.month + offset, 1)` with its own prev/next offset). Real read: for events whose `startISO` date falls in the viewed month (after recurrence expansion within the month window), produce a `Record<dayOfMonth, dotColor[]>`. `colorPreset` maps onto the existing `mc-dot-<color>` CSS classes (the fixture already used `mint|amber|blue|violet`; `rose` is the new 5th — needs a CSS dot class check at build).
  - **UpcomingWidget** needs the next N events sorted by start datetime `>= now`. Real read: expand recurrence over a forward window (e.g. now → now+Ndays), filter `startISO >= now`, sort ascending, take first 4. Render date/month/title/time from `startISO` + `title`.

### §3.5 Read-shape summary table

| Widget | Key | Narrow toward | Metric | Date basis |
|---|---|---|---|---|
| StatTasks | `xai_task_cols` | `Record<BucketId,{tasks:TaskCard[];completed?:TaskCard[]}>` | done count / total (Q1) | n/a (count) |
| StatStreak | `xai_habits_state` | `{habits:[];checkIns:Record<id,Record<dateKey,true>>}` | max per-habit strict-consecutive streak | **UTC** YYYY-MM-DD |
| StatPomos | `xai_pomodoro_sessions` | `{mode;completed;finishedAt;...}[]` | today's completed focus count (Q1) | **local** day (owner uses `localDateKey`) |
| UpcomingWidget | `xai_calendar_events` | `Record<id,UserCalEvent>` | next ≤4 events `startISO>=now`, sorted | **local clock** ISO |
| MiniCalWidget | `xai_calendar_events` | `Record<id,UserCalEvent>` | viewed-month dots by day-of-month | **local clock** ISO |

> **Date-basis hazard (flagged for build + verify):** pomodoro uses LOCAL day keys; habits use UTC day keys; calendar uses LOCAL-clock ISO strings (no TZ). Each selector MUST use the basis its source was WRITTEN with, or "today"/"this month" boundaries will be off by the UTC offset. Do NOT unify to one basis.

---

## §4. Planner's calls (carve-out §"Planner's call" — 4 items, resolved with rationale)

### Q1 — Precise stat metric per widget

| Widget | DECISION | Rationale | Alternatives rejected |
|---|---|---|---|
| **StatTasks** | **today's-relevant `done` count / total across all buckets** → render `done/total` (matches the SHIPPED `14/22` donut shape: `value = done/total`). "Done" = `TaskCard.done === true` summed over every bucket's `tasks` (+ `completed[]` if the bucket carries one). | The SHIPPED widget is a donut of `done/total`; keeping that shape means zero CSS/Donut change — only the numbers become real. T-10 made `done` real, so a literal done/total is now meaningful. | "today's completed" rejected: tasks have no completion-timestamp, only a boolean `done` + a display `date` string — cannot reliably bucket completion by day. So done/total (all-time-ish, matching the board's current state) is the only honest metric. |
| **StatPomos** | **today's completed focus sessions** (count) → render the single number (SHIPPED shape: one number + 8-dot grid where `count` dots are "on", capped at 8). | Mirrors the owner's `countTodaysPomos` exactly (focus + completed + finishedAt local-day === today). "Today" is the most actionable dashboard glance. The 8-dot grid caps visually at 8 (existing `PomoDots count total=8`), count can exceed 8 (dots saturate; number shows true count). | "this week" rejected as the primary: the SHIPPED widget shows a single small number with an 8-dot grid clearly modeled on a daily goal (8 pomos/day). Weekly would need a different visual. (Weekly total is available in Statistics already.) |
| **StatStreak** | **max per-habit strict-consecutive streak (days), across all habits** → render the number + flame (SHIPPED shape). | StatStreak shows ONE flame number; the most motivating single number is the user's best current streak. Uses the habits module's own C1 strict-consecutive semantics (today-anchored, UTC day keys). | "sum of all streaks" rejected (meaningless); "streak of a single designated habit" rejected (no designation UI in v1, would need a picker — out of scope). |

**Empty states (Q1 corollary, carve-out In-scope):**
- StatTasks: no tasks at all → render `0/0`? No — render an honest "—" / "no tasks yet" (a `0/0` donut is a divide-by-zero + reads as a real zero-progress). DECISION: when total === 0, show a localized "no tasks yet" empty label instead of the donut. When total > 0 and done === 0, show `0/total` (that IS honest real data).
- StatPomos: 0 today → show `0` with all dots off + a subtle "none today" affordance is acceptable (0 is honest). DECISION: render `0` + empty dots (no special empty copy needed — `0` is truthful and the dots already convey emptiness). Keep it minimal.
- StatStreak: no habits OR no current streak → `0` + flame, OR a "no streak" label. DECISION: when no habits exist → localized "no habits yet"; when habits exist but streak === 0 → render `0` (honest). (Distinguishes "nothing to track" from "tracked but broke the streak".)
- These empty-state strings do NOT exist in `plugin-web-tokens` for this purpose; per Q-i18n (below) use a LOCAL STR table (mirrors the §E stickies decision Q3 — zero `plugin-web-tokens` edit).

### Q2 — Store read shape / parse (resolved in §3)

Resolved fully in §3 above. **Decisions frozen:** narrow toward the owner canonical types via LOCAL predicates (Statistics pattern); pomodoro field = `finishedAt` + `completed` (NOT Cmd-K's `completedAt`); tasks cards live at `col.tasks` (NOT Cmd-K's flattened read); habits = UTC day keys; calendar = local-clock ISO. Date-basis hazard flagged.

### Q3 — Fixture disposition: delete vs keep-as-empty-fallback

**DECISION: KEEP fixtures as the empty-state sample/fallback for MiniCal + Upcoming; for the 3 Stat widgets, REMOVE the inline hardcoded constants (they were never fixtures, just magic numbers) and replace with real reads + local empty labels.**

| Concern | Decision |
|---|---|
| `UPCOMING` fixture (`fixtures.ts:135-164`) | **KEEP the export** (other code / tests may reference it; `fixtures.test.ts` asserts its shape). UpcomingWidget STOPS importing it for the live path; MAY render it as a read-only "sample" when the calendar store is empty (mirrors the SHIPPED stickies G1 "sample-until-first-user" disposition) — OR show a plain "no upcoming events" empty state. **Planner picks: plain empty state** (NOT sample) — see rationale below. The `UPCOMING` export stays for back-compat + its test. |
| `CAL_EVENTS` fixture (`fixtures.ts:178-190`) | **KEEP the export + its test.** MiniCalWidget STOPS importing it for dots; renders real dots from `xai_calendar_events`. Empty month → simply no dots (the grid itself is the honest empty state — a calendar with no events IS a valid honest view). |
| `STAT_TASKS_DONE` / `STAT_STREAK_DAYS` / `STAT_POMOS_DONE/TOTAL` consts | **REMOVE** the hardcoded values from the widget files; the widgets compute real values. (These are exported consts used ONLY by their own tests — tests get rewritten to drive `usePref` injection, so the consts can go. Confirm no external importer at build via grep.) |

**Rationale for "plain empty state" over "fixture-as-sample" on Upcoming/MiniCal:**
The stickies feature chose fixture-as-sample because a sticky board with zero notes looks broken/empty and the samples teach the feature. A calendar/upcoming list is different: an empty Upcoming list with "no upcoming events" + an empty MiniCal month are both *honest, non-broken* views — the user understands "I have no events." Showing fake sample events would re-introduce exactly the fiction this carve-out exists to remove. **So: real data when present, honest empty state when absent, NO fake samples for the calendar-backed widgets.** (This is a deliberate DIVERGENCE from stickies Q4, justified by the domain: stickies-empty looks broken; calendar-empty looks correct.)

> Reviewer override hook (OQ3): if review prefers fixture-as-sample parity with stickies for Upcoming, the plan supports it (render `UPCOMING` read-only with a sample badge when the store is empty) — but the planner's pick is plain empty state for honesty.

### Q4 — In-package read selector abstraction vs inline read

**DECISION: a thin in-package `src/internal/dataReads/` module (NOT inline per-widget reads).**

| Option | Verdict |
|---|---|
| **A — `src/internal/dataReads/` with pure selectors + local predicates** (CHOSEN) | Mirrors how Statistics isolates `aggregators.ts` + `isPomodoroSession.ts` + `isHabitsStateRecord.ts`. Pure functions are unit-testable WITHOUT rendering (inject a raw store object → assert the number). Keeps widgets thin (widget = `usePref` + call selector + render). Date-basis hazards (§3) live in ONE audited place, not smeared across 5 widgets. |
| B — inline reads inside each widget | Rejected: untestable without RTL render + jsdom localStorage gymnastics; duplicates the UTC-vs-local hazard 5×; harder to review. |
| C — one mega-selector for all 5 | Rejected: couples unrelated stores; a tasks-shape change would touch the calendar path. |

**Proposed `dataReads/` layout (build-time, names indicative):**
```
src/internal/dataReads/
├── isTaskColsRecord.ts      # local predicate → { [BucketId]: { tasks: TaskCard[]; completed?: TaskCard[] } }
├── taskStats.ts             # countDone(store) → { done; total }
├── isPomodoroSession.ts     # local predicate (finishedAt + completed + mode) — mirrors Statistics
├── pomoStats.ts             # countTodaysFocus(sessions, todayLocalKey) → number
├── isHabitsState.ts         # local predicate (+ EMPTY) — mirrors Statistics' isHabitsStateRecord
├── habitStreak.ts           # maxStreak(state, todayUtc) → number  (local strict-consecutive)
├── isUserCalEventMap.ts     # local predicate → Record<string, UserCalEvent-min>
├── calUpcoming.ts           # upcomingEvents(map, now, days, max) → UpcomingItem[]
└── calMonthDots.ts          # monthDots(map, viewYear, viewMonth) → Record<day, dotColor[]>
```
Each selector is PURE (store-in / value-out), takes an injected `now`/`todayKey` for testability (same discipline as pomodoro's `derivedCounters` + Statistics' `aggregateRange(now)`). Recurrence: `calUpcoming`/`calMonthDots` implement a MINIMAL local recurrence expansion (non-recurring + daily + weekly within their window) — re-implemented locally because calendar's `expandRecurrence` is `internal/` (cannot import). (Q5.)

### Q5 (planner-added) — UpcomingWidget: merge task due dates too?

**DECISION: calendar events ONLY for v1; do NOT merge task due dates.**

- Carve-out §2 explicitly leaves this to the planner ("planner decides whether to also merge task due dates").
- Rationale: task "due dates" in `xai_task_cols` are stored as DISPLAY STRINGS (`date?: "7/31"`, `dateZh?`, `dateLabel?: {en;zh}`) NOT parseable datetimes — there is no ISO due field on `TaskCard`. Merging would require fragile string-date parsing + a bucket→date heuristic. That is scope creep + a fragility risk for a "Realistic v1." **Calendar events have clean `startISO` datetimes; use those alone.** Task-due merge is a clean future increment if wanted.

### Q-i18n (planner-added) — empty-state strings: `plugin-web-tokens` edit vs local STR

**DECISION: LOCAL STR (extend the existing `src/internal/strings.ts` already created by the §E stickies extension) — ZERO `plugin-web-tokens` edit.**

- The §E stickies extension already established `src/internal/strings.ts` with a local bilingual `str(key, lang)` table and chose "no `plugin-web-tokens` edit" (Q3 there). We extend that SAME local table with the new empty-state keys (e.g. `stat_tasks_empty`, `stat_streak_empty`, `upcoming_empty`).
- The existing widget LABELS (`dashboard.tasks_done` / `streak` / `pomos` / `upcoming`) stay sourced from `plugin-web-tokens` via the existing `useI18n` import (already present in every widget) — only the NEW empty-state copy goes in local STR.
- Lower churn than a tokens edit; consistent with the in-package precedent; avoids the sibling-concurrency anchor risk on `i18n.ts`. **Frozen.**

---

## §5. Tradeoffs & key decisions (consolidated)

1. **Read-only via `usePref` + local predicates** (not cross-plugin import, not new key) — the only boundary-legal path; matches Statistics + Cmd-K + the in-package stickies precedent.
2. **In-package `dataReads/` selectors** (not inline) — testable, hazard-localized.
3. **Pomodoro field = `finishedAt`+`completed`** (the canonical owner truth) — NOT Cmd-K's stale `completedAt`. This is the single highest-risk recon correction.
4. **Tasks cards at `col.tasks`** (real owner shape) — NOT Cmd-K's flattened `Record<string,unknown[]>` guess.
5. **Date basis per source** (pomo=local, habits=UTC, calendar=local-clock) — do NOT unify.
6. **Calendar-backed widgets get honest empty states, NOT fake samples** (divergence from stickies, justified by domain).
7. **Calendar events only for Upcoming** (no task-due merge) — task dates aren't parseable ISO.
8. **Local STR for empty copy** (no `plugin-web-tokens` edit) — consistent with §E.
9. **Minimal local recurrence expansion** for calendar reads (can't import calendar's `expandRecurrence`).
10. **SHIPPED widgets untouched** — ClockWidget / WorldClocks / WeatherWidget / StickiesWidget / MailWidget stay as-is; only the 5 in-scope widgets change. Public barrel UNCHANGED (`dashboardWidgetRegistrations` only).

---

## §6. Recommendation

Proceed with `xai-web-dashboard-real-data` as an EXTENSION of `@repo/plugin-web-dashboard-widgets` (new §F lineage in the four-pack):

- Add `src/internal/dataReads/` pure selectors + local predicates (Statistics pattern).
- Rewire 5 widgets to `usePref(key)` → selector → render, with honest empty states.
- Extend the existing local `src/internal/strings.ts` with empty-state copy (zero tokens edit).
- Keep fixtures' exports + their tests for back-compat; stop importing them on the live path (MiniCal/Upcoming) or remove the inline consts (Stats).
- Phase by widget group (see dev_log §F Phase Plan): **F1** = 3 Stat widgets + their selectors; **F2** = Upcoming + MiniCal + calendar selectors; **F3** = empty-state polish + docs + barrel-unchanged confirm + verify.
- Public surface UNCHANGED; NO new registry key; NO new dep; NO `packages/core` edit; NO event channel; NO `plugin-web-tokens` edit; NO host edit; NO `dev` branch.

---

## §7. Risks & open questions

### §7.1 Risks (for dev_log §F Risks Snapshot)

| ID | Risk | Mitigation | Phase |
|---|---|---|---|
| RD1 | Pomodoro field confusion — copying Cmd-K's stale `completedAt` → always-empty count | Selector narrows to canonical `finishedAt`+`completed`+`mode==="focus"`; unit test injects sessions with `finishedAt` + asserts today-count; explicit code comment "NOT completedAt" | F1 |
| RD2 | Tasks shape — Cmd-K flattened read vs real `col.tasks` | `isTaskColsRecord` narrows to `{ tasks: TaskCard[]; completed? }`; selector reads `col.tasks` (+`col.completed`); unit test on a real `Record<BucketId,TaskCol>` fixture | F1 |
| RD3 | Date-basis mismatch (pomo local / habits UTC / cal local-clock) | Each selector documents + uses its source's basis; `todayKey`/`now` injected; tests pin a fixed clock and assert boundary behavior (e.g. a session at 23:30 local vs UTC midnight) | F1/F2 |
| RD4 | MiniCal `rose` colorPreset has no `mc-dot-rose` CSS class | Build checks `styles.css` for `.mc-dot-*`; if `rose` missing, add `.mc-dot-rose` (5th dot color) — additive CSS only; covered by a dot-render test | F2 |
| RD5 | Recurrence re-implementation drift vs calendar's `expandRecurrence` | Local expansion handles non-recurring + daily + weekly within a bounded window (mirror calendar semantics: HH:MM preserved, date advances); unit test daily+weekly inside a month window; documented as a deliberate local copy | F2 |
| RD6 | Widget loses hook state / mis-renders on grid 1Hz `render(ctx)` tick | Widgets stay stable React components (proven by ClockWidget + §E StickiesWidget RS5); `usePref` is reactive; test rerenders with a new `now` and asserts no crash/no reset | F1/F2 |
| RD7 | Removing inline `STAT_*` consts breaks an external importer | grep for importers before removal; tests rewritten to inject via `usePref` (localStorage seed) not the const; if any external importer exists, keep the const as a deprecated re-export | F1 |
| RD8 | Empty-state regression — SHIPPED Stat tests assert `14/22`/`27`/`6` | Those tests get rewritten to seed real data + assert real output; an explicit no-data test asserts the empty label; no assertion may keep expecting the old magic numbers | F1 |
| RD9 | Fixture test (`fixtures.test.ts`) breaks if exports removed | KEEP `UPCOMING`/`CAL_EVENTS` exports; only stop importing them on the live path; `fixtures.test.ts` stays green | F2/F3 |
| RD10 | `usePref` SSR/jsdom read returns default before hydrate → flash of empty | Acceptable (empty state IS the honest default); documented; matches §E stickies hydrate behavior; no extra wiring | F1/F2 |
| RD11 | Barrel surface accidentally widened (e.g. exporting a selector) | `index-barrel.test.ts` (AC-PKG-4) must keep asserting single `dashboardWidgetRegistrations` export; selectors stay `internal/` | F3 |
| RD12 | Reading another module's key couples to that module's schema | Local predicates are DEFENSIVE (drop non-conforming entries silently, like Statistics + Cmd-K); a schema drift degrades to empty state, never crashes | All |

### §7.2 Open questions for `feature-review`

- **OQ1 (Q1 metrics):** Confirm StatTasks = all-bucket `done/total`; StatPomos = today's completed focus; StatStreak = max per-habit strict-consecutive. (Reviewer may prefer StatTasks = "today's done" if a completion-timestamp source is found, or StatPomos = "this week".)
- **OQ2 (Q5 task-due merge):** Confirm Upcoming = calendar events ONLY (no task-due merge), given task dates are display strings not ISO. (Reviewer may still want a best-effort string-date merge.)
- **OQ3 (Q3 empty disposition):** Confirm calendar-backed widgets get a PLAIN honest empty state, NOT a stickies-style fixture-sample. (Reviewer may want sample-parity with stickies.)
- **OQ4 (Q4 abstraction):** Confirm `src/internal/dataReads/` selector module (vs inline). (Reviewer may want fewer files.)
- **OQ5 (Q-i18n):** Confirm empty-state copy goes in the EXISTING local `internal/strings.ts` (zero `plugin-web-tokens` edit). (Reviewer may prefer tokens for global consistency.)
- **OQ6 (recurrence):** Confirm a MINIMAL local recurrence expansion (non-recurring + daily + weekly) is acceptable vs deferring recurrence entirely (show only non-recurring events in v1). The plan includes daily+weekly; reviewer may narrow to non-recurring-only for v1 simplicity.
- **OQ7 (phase split):** Confirm 3 phases (F1 stats / F2 upcoming+minical / F3 polish+docs) vs the carve-out's suggested grouping. (F3 MAY fold into F2 if the barrel stays single-export and empty states land inline.)

---

## §8. Evidence index (source files read end-to-end)

- Carve-out: `docs/reviews/_p0-carve-outs/20260528-dashboard-real-data.md`
- Registry (4 source keys + opaque-type caveats): `packages/plugin-web-storage/src/internal/registry.ts` (`xai_task_cols`:197, `xai_pomodoro_sessions`:348, `xai_habits_state`:383, `xai_calendar_events`:943)
- `usePref` reactivity + SSR: `packages/plugin-web-storage/src/internal/usePref.ts`
- Tasks canonical type + `done`: `packages/xai-web-tasks/src/types.ts`
- Pomodoro canonical type + owner counters: `packages/plugin-web-pomodoro/src/types.ts` + `src/internal/derivedCounters.ts` + `src/internal/formatRecordDate.ts` (`localDateKey`)
- Habits canonical type + streak: `packages/xai-web-habits/src/types.ts` + `src/internal/computeStreak.ts`
- Calendar canonical type + recurrence + read hook: `packages/xai-web-calendar/src/internal/eventStore/{types.ts, useUserCalEvents.ts, expandRecurrence.ts, mergeEventsForViewport.ts}`
- Cross-module read precedents: `packages/plugin-web-statistics/src/internal/{aggregators.ts, isPomodoroSession.ts, isHabitsStateRecord.ts}` (api.md §0 "usePref only") + `packages/xai-web-cmdk/src/adapters/{tasks.ts, pomodoro.ts, habits.ts, calendar.ts}`
- In-package real-data precedent: `packages/xai-web-dashboard-widgets/src/widgets/StickiesWidget.tsx` + `src/internal/stickiesStore/useStickies.ts` + `src/internal/strings.ts` (§E SHIPPED)
- Widgets in scope: `packages/xai-web-dashboard-widgets/src/widgets/{StatTasks,StatStreak,StatPomos,UpcomingWidget,MiniCalWidget}.tsx`
- Fixtures: `packages/xai-web-dashboard-widgets/src/internal/fixtures.ts`
- i18n existing keys: `packages/plugin-web-tokens/src/i18n.ts` (`tasks_done`:185, `streak`:186, `pomos`:187, `upcoming`:192)
- SHIPPED docs being extended: `packages/xai-web-dashboard-widgets/docs/{design,api,test,dev_log}.md`
