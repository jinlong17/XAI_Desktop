# Discovery Review — xai-web-habits

> Roadmap row: docs/workflow/roadmap/xai-web-console.md row #15 (W2 Module — Habits)
> Seed brief: docs/reviews/xai-web-habits/20260523-roadmap-seed.md
> ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map row `module-habits.jsx` → `packages/plugin-web-habits/src/`) + §S5 (JSX→TSX rules) + §S7 (event bus) + §S8 (persistence registry)
> Source prototype: `web design/module-habits.jsx` (158 LOC, ~6.9 KB)
> Source PRD: `web design/DESIGN.md` §4.8 (Habits)
> Authored by: feature-plan (xai-roadmap-loop W2b parallel-Agent mode; siblings: #6 xai-web-tasks + #14 xai-web-pomodoro)

---

## 1. Problem framing

### 1.1 What is being ported

Port the Habits productivity module from `web design/module-habits.jsx` into a
typed Vite + React 19 workspace package `@repo/plugin-web-habits` (directory
`packages/xai-web-habits/`, per the W1-established sibling convention — see Q1).

The prototype renders a two-pane layout:

**Left pane — Habits list (`<section class="habits-list panel">`)**

- Header: title + list/grid view toggle + `+` (no-op) + `…` (no-op).
- Week strip showing 7 weekdays + dates with the last column marked `today`.
- Vertical rows of habits: emoji avatar · bilingual title · stats line
  (`bolt`-icon total + `fire`-icon streak) · 7-cell weekly check-off strip.
- Each weekly cell `<button class="hcell">` is one-tap-toggle for that
  (habit × day) pair.

**Right pane — Habit detail (`<section class="habits-detail">`)**

- Header: large emoji + bilingual title + `…` (no-op).
- 4 stat cards (`<StatCard>`): monthly check-ins · cumulative · monthly rate
  (%) · streak.
- Progress card with `6/365` mono numerator + sub-label (`359 days`) + medal
  SVG, followed by a 7-column month calendar (5×7 grid) with a `today` cell.
- Habit-diary card (`log-card`): a heading + an "empty" placeholder text. The
  seed brief explicitly upgrades this from prototype's static placeholder to a
  **per-habit-per-date text area whose content persists**.

### 1.2 What the seed brief adds beyond the prototype

The prototype is **read-only / hard-coded**:

- `weekChecks` are seeded from `MOCK.habits[*].weekChecks` and toggleable, but
  **not persisted**.
- The 4 stat cards display literal `"0"` for monthly check-ins and rate
  (`value="0"`), with no derivation from the data.
- `6/365` is a string constant.
- The month calendar has no check-mark rendering — only cells, an empty
  `<div class="cal-ring"></div>` placeholder, and a hard-coded `today === 22`.
- Habit-diary text-area is a single empty `<p class="log-empty">…</p>`.
- Streak / total are read from `MOCK.habits[*].streak` / `.total` — not
  computed.

The seed brief upgrades to:

- **One-tap check-in toggle persists immediately** to localStorage via
  `@repo/plugin-web-storage` `usePref`.
- **Streak calculation is real** and handles missed days correctly (zero-out
  on skip).
- **Per-habit-per-date diary text** persists.
- **All strings bilingual** (already supported via `habits.*` keys in
  `@repo/plugin-web-tokens` — confirmed: `habits.title`, `habits.monthly_checkins`,
  `habits.total_checkins`, `habits.monthly_rate`, `habits.streak`,
  `habits.habit_log`, `habits.empty_log` exist in both EN and ZH).
- **Date headers respect Settings week-start** (Sun/Mon). Per worker brief,
  Settings week-start is gated to W4 (`xai-web-settings-rest` row #24); v1
  defaults to **Sunday-first** and exposes a `usePref` reserved for the future
  Settings panel — see §3.4 axis D.
- **Statistics feeds**: Habits emits `web:habits:checkin-recorded` so
  `xai-web-statistics` row #20 (PENDING) can aggregate. The event channel is
  **already declared** in `packages/core/src/types/events.ts` line 209–218
  (verified) — we only need to **emit**, not declare.
- **Module registers via `@repo/xai-web-shell` slot pattern** — replacing the
  placeholder at `apps/web/src/routes/modules/shellRegistrations.tsx` line 53
  (`placeholder("habits", "Habits", "pin", 8)`).

### 1.3 Hard architectural inputs (frozen by ADR-0007 + worker brief)

- **Package layout** — `packages/xai-web-habits/` (directory) + package name
  `@repo/plugin-web-habits` (per ADR §S4 port-map row). This is the same
  hybrid the shipped W1 + W2 rows adopted (see `packages/xai-web-matrix/` →
  `@repo/plugin-web-matrix`, `packages/plugin-web-countdown/` →
  `@repo/plugin-web-countdown`). See Q1.
- **Persistence registry** — new keys MUST flow through `WebPrefRegistry` at
  `packages/plugin-web-storage/src/internal/registry.ts`. Today's registry has
  no habits-specific key; we will register **one new key** `xai_habits_state`
  through that registry as part of P1 (single JSON blob holding all habits +
  check-ins + diary). See §3.1 axis A.
- **Event channel** — `web:habits:checkin-recorded` is **already declared**
  with payload `{ habitId; date; streak; recordedAt }` at
  `packages/core/src/types/events.ts:209–218`. Emit-side wiring belongs to
  this row.
- **No direct cross-plugin imports** — `xai-web-statistics` row #20 is the
  consumer (not started); we emit, it subscribes on its own row. No reverse
  edge.
- **JSX → TSX rules (ADR §S5, 10 rules)** — no `window.*` business globals;
  no `defaultProps`; typed `useState`; no new state libs; tokens-only CSS;
  side-effect CSS via `import "./styles.css"`.
- **Module slot registration** — `WebModuleSlotRegistration` contract from
  `@repo/xai-web-shell`. Slot already exists with `moduleId: "habits"`,
  `icon: "pin"`, `railOrder: 8`, `i18nKey: "nav.habits"`,
  `showInRail: true`.
- **Module registers via slot pattern** — replace placeholder at
  `shellRegistrations.tsx` line 53 (`placeholder("habits", "Habits", "pin", 8)`).
- **Empty / placeholder copy bilingual** — already supported via existing
  `habits.empty_log` key (EN: `"No check-ins shared this month yet."` / ZH:
  `"本月还没有打卡心得。"`).
- **Verify Cross-vendor: yes** (Safari 17+ / Chrome / Firefox manual smoke for
  check-toggle persistence + reload + diary round-trip).
- **3 phases** per worker brief (P1 list+check+persist · P2 detail+stat+progress+calendar
  · P3 diary+smoke).

### 1.4 What is NOT in scope (parking lot)

| Item | Why deferred |
|---|---|
| Add-habit creation UI (the `+` button) | Prototype only stubs the button (no handler). Seed brief acceptance signal says "User can add a habit" — see Q2 for v1 vs deferral decision. |
| Per-habit `…` menu (delete / archive / rename / edit emoji) | Prototype stubs it. Not in seed acceptance signal. Defer to a post-ship row. |
| List view vs grid view toggle | Prototype has the `<div class="seg">` toggle (line 29–32) but only the `list` view is implemented. The `grid` branch is empty. Defer the grid layout to a post-ship row. |
| Calendar month navigation (`<` / `>` arrows) | Prototype has the buttons but no `useState` for current month. v1 wires a typed `useState<{ year, month0 }>` so prev/next month works for the displayed habit; year-spanning navigation is included but multi-year history is bounded by the schema. |
| Statistics consumer wiring | `xai-web-statistics` (row #20) is the consumer; it subscribes on its own row. We only emit. |
| Drag-reorder habits | Not in seed brief; prototype has no drag. |
| Habit goals / target frequencies (3×/week, etc.) | Prototype model has `total` + `streak` but no goal field. Defer. |
| 6/365 progress is HABIT-level vs APP-level | Prototype shows `6/365` as a literal string regardless of habit. Semantics: it represents "days kept this year toward a 365-day annual goal". v1 derives it from the habit's check-ins this year. See axis E (§3.5). |
| Per-quadrant Settings week-start respect | Settings W4 (`xai-web-settings-rest` row #24) owns the toggle. v1 reads a reserved `usePref<WeekStart>("xai_pref_week_start")` (registered by Settings W4) and falls back to `"sun"` when absent — non-breaking. See Q3. |
| Touch-friendly check tap (mobile) | Out of v1 (desktop-first per prototype). |

---

## 2. Source-prototype analysis

`web design/module-habits.jsx` (158 LOC). Two components:

### 2.1 `HabitsModule({ lang })`

Lines 7–139.

- Pulls `Icon`, `MOCK`, `useI18n` from `window.*` (removed per ADR §S5 rule 4).
- Local state:
  - `selected: string` (current habit id; default `"h2"`).
  - `habits: Habit[]` (initialised from `MOCK.habits` — typed seed in port).
  - `view: "list" | "grid"` (only list rendered in prototype — see parking lot).
- Derived: `habit = habits.find(h => h.id === selected) || habits[0]`.
- Constants: `weekDates = [16,17,18,19,20,21,22]`; weekday labels
  bilingual; **today is index 6** (the last cell). Both are hard-coded.
- `toggleWeek(habitId, dayIdx)`: flips `weekChecks[dayIdx]` for the matching
  habit. **Not persisted in prototype.**
- Renders the two-pane layout described in §1.1.

### 2.2 `StatCard({ icon, color, label, value, unit })`

Lines 141–155. Pure presentational. Color is passed as a CSS variable string
(e.g. `var(--accent)`); the icon background uses `color-mix(in oklch, ${color}
14%, transparent)`. Renders mono numeric value + unit suffix.

### 2.3 What needs to change for v1

| Prototype behavior | v1 behavior |
|---|---|
| Hard-coded `weekDates = [16,17,18,19,20,21,22]` + today=index 6 | Real `weekDates` from `Date.now()`, with today's column highlighted; respects week-start (default Sun, future Settings opt-in for Mon). |
| `weekChecks: boolean[7]` per habit, local-only | Real `checkIns: Record<HabitId, Record<DateKey, true>>` map persisted to `xai_habits_state` (date-keyed sparse — no booleans). The 7-cell week-strip derives its booleans from the map + current week date keys. |
| `MOCK.habits` seed | Typed `INITIAL_HABITS` seed module (`internal/seed.ts`) with bilingual title + emoji + empty check-ins. |
| Stat card `monthly_checkins` literal `"0"` | Computed `count(checkIns[habitId], where date ∈ current month)`. |
| Stat card `total_checkins` from `habit.total` | Computed `Object.keys(checkIns[habitId]).length`. |
| Stat card `monthly_rate` literal `"0"` | Computed `round((monthly_checkins / daysInCurrentMonthSoFar) × 100)`. |
| Stat card `streak` from `habit.streak` | Computed via `computeStreak(checkIns[habitId], today)`. **Zero-out on skip** — see §3.3 axis C. |
| `6/365` literal string | Computed `daysCheckedThisYear / 365` (numerator from `checkIns[habitId]` filtered to current year). |
| Month calendar cells without check marks | Each cell that maps to a date in `checkIns[habitId]` shows a check ring; today gets a distinct ring style. |
| `<p class="log-empty">…</p>` static | A controlled `<textarea>` reading from `diaries[habitId][monthKey]` (one entry per habit per month, see Q4). Persists on blur (debounced). |
| `setHabits(...)` toggleWeek mutates local | `toggleCheckIn(habitId, dateKey)` updates `xai_habits_state.checkIns`; also recomputes streak; emits `web:habits:checkin-recorded` event with the post-checkIn streak value. |

---

## 3. Candidate options

### 3.1 Axis A — Persistence shape

**A1. One key holding all habits + check-ins + diaries (`xai_habits_state`).**
Value shape:

```ts
{
  schemaVersion: 1;
  habits: Array<{
    id: string;
    emoji: string;
    title: { en: string; zh: string };
    createdAt: string;  // ISO; the "since" date for total/365 calculations
  }>;
  checkIns: Record<HabitId, Record<DateKey, true>>;   // sparse; absence = no check-in
  diaries: Record<HabitId, Record<MonthKey, string>>; // per-habit per-month text
}
```

DateKey is `YYYY-MM-DD` (UTC day per ADR convention — matches the event
payload's existing `date: string` UTC day key declaration at events.ts line
212). MonthKey is `YYYY-MM`.

- **Pro**: single source of truth; trivial to serialize; one entry in
  `PREF_REGISTRY`; one migration unit if shape changes; matches the W2 pattern
  already used by `xai-web-matrix` (`xai_matrix_state`) and `xai-web-countdown`
  (`xai_countdowns`).
- **Con**: each check-toggle / diary blur rewrites the entire blob (acceptable
  — bounded by visible habit count × dates checked; ≤ 2 KB typical, ≤ 50 KB
  pathological at 5-year history × 8 habits × 365 days).
- **Atomicity**: a single `setPref` is atomic; multi-tab `storage` event
  delivers the new blob.

**A2. One key per habit (`xai_habit_<id>`) plus a `xai_habit_ids` index.**
N + 1 entries in the registry.

- **Pro**: independent reads; per-habit write atomicity.
- **Con**: registry pollution (1 module → N + 1 keys); habit creation requires
  registering a new key at runtime — the registry is **static** (typed
  literal `as const` per `registry.ts:130`). Cannot support dynamic key
  creation without runtime-extending the type.
- **Verdict**: rejected. Static registry cannot host dynamic keys.

**A3. Diaries in a separate key (`xai_habit_diaries`) from check-ins
(`xai_habits_state`).** Two entries.

- **Pro**: smaller writes when only the diary changes (textarea blur doesn't
  rewrite the check-in map).
- **Con**: cross-key atomicity — deleting a habit must remove its entries
  from two keys. Marginal win for the v1 data sizes.
- **Verdict**: rejected for v1; reconsider if diary size dominates blob size
  in a later iteration.

**Decision**: **A1** — single `xai_habits_state` key. New entry in
`PREF_REGISTRY` declared from this row, modeled byte-for-byte on the
`xai_countdowns` / `xai_matrix_state` shipped pattern. `proposed: false` —
the worker brief explicitly approves the key name `xai_habits_state` (it is
not in the §S8 proposed list, so we register as a non-proposed module key).

### 3.2 Axis B — Check-in toggle reactivity

**B1. Direct `setPref` per toggle**, computing the next blob inside the
toggle handler.

- **Pro**: synchronous; one write per tap; immediately visible to other tabs
  via the `storage` event handler in `usePref` (per row #3 shipped tests).
- **Con**: every toggle rewrites the full blob. At 8 habits × 7 cells ×
  rapid clicking, ~50 writes/sec — well within localStorage budget.

**B2. Local `useState` mirror + debounced flush via `usePrefAutosave`.**

- **Pro**: lower write rate.
- **Con**: violates the seed brief's "persist immediately to localStorage"
  hard constraint (a debounce window introduces a measurable lag where the
  click-feedback ≠ persisted state, which breaks the "one-tap" promise on
  rapid reload).
- **Verdict**: rejected — the seed brief is explicit.

**Decision**: **B1** — synchronous `setPref` on every toggle.

### 3.3 Axis C — Streak calculation semantics

The seed brief states: "Streak calculation handles missed days correctly
(zero-out on skip)."

Reading: a streak is the count of **consecutive prior days** (including
today) on which the habit was checked. If any day in the run is unchecked,
the streak ends there. Three interpretation candidates:

**C1. Strict consecutive (including today).** `streak(habitId, today)` =
length of the maximal trailing run of consecutive checked days ending at
`today`. If `today` is **not** checked, streak = `0`.

- **Pro**: matches the hardest reading of "zero-out on skip" — missing
  today's check means losing the streak.
- **Con**: emotionally severe. Users checking at midnight rollover lose
  their streak between 23:59 and 00:00. The shipped TickTick / Streaks app
  uses a "grace period" model instead.

**C2. Strict consecutive with today excluded.** `streak(habitId, today)` =
maximal trailing run of consecutive checked days from `today - 1` going
backward, plus +1 if `today` is checked.

- **Pro**: more humane than C1.
- **Con**: equivalent to C1 in steady-state — the only difference is
  end-of-day-not-yet-checked semantics. Adds one branch.

**C3. C1 with grace-day rule** — allow ONE skipped day per N days without
zeroing.

- **Pro**: most humane.
- **Con**: out of scope per "zero-out on skip" (explicit in seed brief).

**Decision**: **C1** — the prototype's `streak` field is a positive integer
shown as-is in `habits.streak` stat card; the seed brief is explicit about
"zero-out on skip" semantics. We implement strict consecutive (today
included). The `computeStreak` helper is a pure function — easily testable
(see test.md §2.4). If product wants C3 in v2, it's a one-line change.

### 3.4 Axis D — Date headers / week-start respect

Worker brief: "Date headers respect Settings week-start (defer that gate to
Settings W4 — for now default to Sunday or expose a usePref)."

**D1. Hard-code Sunday-first.**

- **Pro**: trivial; no contract.
- **Con**: when Settings W4 ships, it has to retrofit a contract into our
  code → breaking change risk.

**D2. Default Sunday but read `usePref<WeekStart>("xai_pref_week_start")` if
the key is registered.**

- **Pro**: forward-compat. When Settings W4 registers the key, this module
  automatically respects it without redeploy.
- **Con**: we cannot read a key that doesn't exist in the registry (TypeScript
  rejects `usePref("xai_pref_week_start")`). Either we register the key
  ourselves now (cross-row write into the §S8 prefix `xai_pref_*` family) or
  we hard-code v1 + open a follow-up row.

**D3. Hard-code Sunday-first v1 + add a `weekStart` prop to `HabitsModule`
that the host can override.**

- **Pro**: typed contract for the future; the host (apps/web) is the natural
  decision point.
- **Con**: the host doesn't have a Settings-derived value yet (Settings W4
  not shipped); the prop is permanently `"sun"` in v1.

**Decision**: **D3** — `HabitsModule` accepts `weekStart?: "sun" | "mon"`
prop defaulting to `"sun"`. The host's `HabitsSlotHost` wrapper currently
hard-codes `"sun"`. When Settings W4 ships, it edits one line in the wrapper
to read the user's preference. No `usePref` indirection from inside the
habits package, no registry-edit-now, no contract risk. See Q3.

### 3.5 Axis E — `6/365` numerator semantics

The prototype literally shows `<div class="progress-num mono">6/365</div>`
regardless of which habit is selected. Three readings:

**E1. Days checked **this year** for the selected habit.** Numerator =
`Object.keys(checkIns[habitId]).filter(d => d.startsWith(`${year}-`)).length`;
denominator = `365` (or `366` in a leap year).

- **Pro**: per-habit, year-scoped, intuitive ("how often this year did I do
  X").
- **Con**: a habit created in March can never reach 365.

**E2. Days checked since the habit was created.** Numerator = total check-ins;
denominator = `365`.

- **Con**: meaningless for habits created today (`0/365`) or for old habits
  (`> 365` is possible — looks broken).

**E3. Trailing 365-day window.** Numerator = check-ins within the last 365
days; denominator = `365`.

- **Pro**: rolling, comparable across habits.
- **Con**: less intuitive than E1.

**Decision**: **E1** — year-scoped. Matches the prototype's "this year" feel
(the calendar shows the current month, the streak is recent; the 6/365 reads
as "this year so far"). The progress card also shows a sub-label that we
compute as `${365 - numerator} days` remaining (matching prototype's `359
days` literal). On a leap year we use `366` as denominator so the math stays
honest.

### 3.6 Axis F — Diary granularity

Prototype: one `<p class="log-empty">` placeholder under "Habit Log" — no
indication of date scoping.

**F1. One diary per habit per day.** Storage key path:
`diaries[habitId][YYYY-MM-DD]`.

- **Pro**: granular; matches the calendar day clicks if we ever wire them.
- **Con**: many tiny entries; UX needs date-picker; high cognitive load.

**F2. One diary per habit per month.** Storage key path:
`diaries[habitId][YYYY-MM]`.

- **Pro**: matches the empty-state copy literally: "本月还没有打卡心得。" /
  "No check-ins shared this month yet." — both reference **month**.
- **Pro**: matches the calendar's month-at-a-time view.
- **Pro**: small per-entry size (typical diary text < 500 chars/month).

**F3. One diary per habit (free-form).** No date scoping.

- **Con**: doesn't match the `empty_log` copy.

**Decision**: **F2** — per habit per month. The `empty_log` i18n key already
implies monthly scoping. The textarea displays the entry for the **currently
displayed month** in the calendar header (so navigating to a prior month
shows that month's diary). See Q4.

The seed brief says "Diary text persisted per habit + per date" — we read
"per date" as "per displayed month" (the only date concept visible in the
log card). If review insists on per-day, we can collapse to F1 (one-line
change in the storage type).

---

## 4. External research

**No external research required.** This row is a pure JSX → TSX port plus a
typed event emit (event channel already declared in W1) plus one additive
registry entry. No new libraries selected; testing uses the existing Vitest
+ jsdom + Testing-Library setup; styling uses the existing `tokens.css`.

Per feature-plan template:

> "if the feature is purely internal business logic with no external dependency
> decisions, skip this step and note 'No external research required' in the
> discovery review"

→ This row qualifies. The only new "dependencies" are workspace deps
(`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`,
`@repo/xai-web-event-bus`, `@repo/xai-web-shell`) — all already in the
monorepo.

---

## 5. Recommendation

Ship `xai-web-habits` as a workspace package `@repo/plugin-web-habits` at
`packages/xai-web-habits/src/` with the following shape:

- `index.ts` — public surface: `{ HabitsModule, habitsSlotRegistration, HABITS_STORAGE_KEY }` + types.
- `HabitsModule.tsx` — top-level component (typed props), two-pane layout.
- `HabitList.tsx` — left pane: header + week-strip + habit rows.
- `HabitRow.tsx` — single habit row with emoji + title + stats + 7-cell strip.
- `HabitDetail.tsx` — right pane: detail header + 4 stat cards + progress + calendar + diary.
- `StatCard.tsx` — 4-up stat card (port of prototype `StatCard`).
- `MonthCalendar.tsx` — 5×7 month grid with check-marks + today highlight.
- `DiaryCard.tsx` — controlled textarea bound to `diaries[habitId][monthKey]`.
- `internal/seed.ts` — typed `INITIAL_HABITS` array (replaces `window.MOCK.habits`).
- `internal/dateKeys.ts` — pure helpers: `dateKey(d)`, `monthKey(d)`, `weekDates(now, weekStart)`.
- `internal/computeStreak.ts` — pure `computeStreak(checkIns, today): number` (C1 semantics).
- `internal/computeStats.ts` — pure helpers for monthly count / rate / 365-progress (E1).
- `internal/usePersistedHabits.ts` — `usePref<HabitsState>("xai_habits_state")` wrapper with seed hydration + schemaVersion guard.
- `internal/emit.ts` — `emitCheckInRecorded({ habitId, date, streak })` helper.
- `internal/icons.tsx` — inline SVG glyphs (`check`, `bolt`, `fire`, `target`, `plus`, `dots`, `arrowL`, `arrowR`, `list`, `grid4`) per Q5.
- `registration.tsx` — `habitsSlotRegistration` consumed by the host.
- `styles.css` — module styles, tokens-only.

Persistence: register `xai_habits_state` (JSON codec, owner `xai-web-habits`,
category `module`, schemaVersion 1) by appending **one** entry to
`packages/plugin-web-storage/src/internal/registry.ts`. Same one-line additive
write pattern as the shipped `xai_matrix_state`.

Event: emit `web:habits:checkin-recorded` on every successful toggle (already
declared in `packages/core/src/types/events.ts` lines 209–218; no edit there).

Shell wiring: replace the `placeholder("habits", "Habits", "pin", 8)` row at
`apps/web/src/routes/modules/shellRegistrations.tsx` line 53 with
`habitsSlotRegistration` imported from `@repo/plugin-web-habits`. Append one
dep line to `apps/web/package.json`.

---

## 6. Risks + open questions

### 6.1 Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Streak computation correctness across DST transitions / timezone edges | Medium | Use UTC day keys (`Date.UTC(...).toISOString().slice(0,10)`) consistent with the event payload's existing `date: string` declaration. Test cases include a DST spring-forward date and a UTC-midnight click. |
| R2 | Editing `packages/plugin-web-storage/src/internal/registry.ts` is outside our nominal write scope | Medium | Explicit precedent: W1 designed the registry to accept owner-row additions (`§S8 reservation`). Sibling W2 rows #13 (matrix), #14 (pomodoro), #17 (countdown), #19 (pet) all use this pattern. One additive entry. **Q6** confirms with feature-review. |
| R3 | Parallel siblings (#6 xai-web-tasks + #14 xai-web-pomodoro) touch the same `registry.ts` / `events.ts` / `shellRegistrations.tsx` in the same window — merge conflict risk | Medium | All three rows add their entries to **different lines**. We append `xai_habits_state` AFTER the existing entries in `registry.ts` (`xai_countdowns` was appended at line 319; matrix added `xai_matrix_state` after that at line 324; we follow same pattern). `events.ts` does NOT need editing (channel already declared). `shellRegistrations.tsx` swap is line 53 only (siblings #6 swap line 47, #14 swap line 52 — line-disjoint). Auto-merge expected. |
| R4 | Adding habits at runtime (the `+` button) — registry is static | Low | Habit ids are app-level strings inside the JSON blob; the `xai_habits_state` registry entry is one fixed key. Dynamic habit count adds rows inside the blob, not new registry keys. No registry impact. **Q2** decides if we expose the `+` UI in v1 or stub it. |
| R5 | The textarea controlled component re-renders on every keystroke; persisting per-keystroke wastes localStorage write budget | Medium | Persist on blur + on `Enter` (Cmd-Enter for newline). Internal `useState` mirror keeps each keystroke fast; flush on blur via the existing `usePref` setter (NOT `usePrefAutosave` — we want explicit user intent for diary writes). See test.md §2.7. |
| R6 | `computeMonthlyRate` denominator at end-of-month: "rate so far" vs "rate over all 30/31 days" | Low | Use `daysInCurrentMonthSoFar = today.getDate()` as denominator (so checking 5 of the first 5 days = 100%). Documented in `api.md`. |
| R7 | The seed brief says "User can add a habit" in the acceptance signal, but the prototype's `+` button is a stub. Honest interpretation: minimum v1 must include habit creation | Medium | Implement a minimal "Add Habit" modal (emoji picker = single-line input + suggestions, bilingual title input EN/ZH). Same pattern as `CountdownEditDialog` (shipped W2 row #17). **Q2** confirms v1 scope. |
| R8 | `web:habits:checkin-recorded` event payload requires `streak` — we MUST compute the new streak before emitting | Low | The toggle handler runs `computeStreak` after `setPref` updates the blob. The streak passed to `emitWebEvent` is the post-toggle value (matches the existing `web:matrix:priority-tagged` precedent where `to` is the post-state). Unit test asserts this. |
| R9 | A check-toggle that **un-checks** today should still emit the event (with streak == 0 if today was the last consecutive day) | Low | Event channel name is `checkin-recorded`, not `checkin-added`. Either reading is defensible. Planner choice: emit on both add and remove; statistics row can filter on `streak > previousStreak` if it cares. **Q7** confirms with review. |
| R10 | Bilingual title input UX in the Add-Habit modal: ask user for both EN and ZH at once vs auto-detect | Low | Same as `CountdownEditDialog` shipped pattern — two inputs labeled `Title (English)` / `标题 (中文)`. Both required (typed as `{ en: string; zh: string }` in the schema). |
| R11 | `xai_pref_week_start` does not exist in the registry — D3 prop default works v1, but a future `usePref` consumer here needs Settings W4 to land first | Low | D3 takes a prop, not a `usePref` call — no registry dependency. Future row edits the host wrapper to call `usePref<WeekStart>("xai_pref_week_start")` once Settings W4 registers it. Zero impact this row. |

### 6.2 Open questions for feature-review

- **Q1** — Directory name: `packages/xai-web-habits/` (sibling convention) vs
  `packages/plugin-web-habits/` (ADR §S4 port-map literal).
  **Planner recommendation**: `packages/xai-web-habits/` (directory) +
  `@repo/plugin-web-habits` (package name). Mirrors the shipped pattern
  (`packages/xai-web-matrix/` → `@repo/plugin-web-matrix`).
- **Q2** — Habit creation in v1: minimal Add-Habit modal (emoji + bilingual
  title × 2 fields) vs stub the `+` button and defer to a follow-up row.
  **Planner recommendation**: include a minimal modal in P3. Cost ~ 80 LOC;
  matches the shipped `CountdownEditDialog` pattern. Without it, the
  acceptance signal "User can add a habit" fails. Without it, seeded habits
  are the only habits — that breaks the seed brief promise.
- **Q3** — Week-start: D3 prop default Sunday with future host-wrapper edit,
  vs reading a future `xai_pref_week_start` key now (which doesn't exist).
  **Planner recommendation**: D3. Zero new registry keys this row; Settings
  W4 owns the contract.
- **Q4** — Diary granularity: F2 per-habit per-month (recommended) vs F1
  per-habit per-day. **Planner recommendation**: F2, matches `empty_log` copy.
- **Q5** — Icons: inline 10 SVG glyphs in `internal/icons.tsx` (~120 LOC) vs
  request that `@repo/xai-web-shell` expose its `Icon` component on the
  public surface. **Planner recommendation**: inline. Matches matrix Q2
  resolution and the shipped countdown pattern. Future row can promote a
  shared icon set if multiple rows want them.
- **Q6** — Write-scope expansion approval for the cross-package file
  (`packages/plugin-web-storage/src/internal/registry.ts`). One additive
  entry, same pattern as matrix / pomodoro / countdown / pet.
  **Planner recommendation**: approve. This is the standard §S8 owner-row
  registration path.
- **Q7** — Emit event on un-check toggles (recommendation: yes) vs only on
  add. **Planner recommendation**: emit on both. The channel name
  `checkin-recorded` is symmetric; statistics row can filter on
  `streak > previousStreak` if it needs add-only.
- **Q8** — `6/365` numerator: E1 (year-scoped, recommended) vs E3 (rolling 365).
  **Planner recommendation**: E1. Matches prototype "this year" feel.
- **Q9** — Streak semantics: C1 strict-with-today (recommended) vs C2 lenient.
  **Planner recommendation**: C1. Seed brief says "zero-out on skip".

---

## 7. Acceptance criteria mapping

From the seed brief §Acceptance signal:

> User can add a habit, toggle today/past-week check marks, the 4 stat cards
> recalc live, streak/365 progress is correct, and diary entries round-trip.

| Signal | Mechanism in v1 |
|---|---|
| User can add a habit | `<AddHabitDialog>` modal — emoji input + bilingual title × 2 → push onto `habits[]`, `setPref` immediately. Verified by `HabitsModule.add.test.tsx` AC-ADD-1..3. |
| Toggle today/past-week check marks | `<HabitRow>` 7-cell strip + `<MonthCalendar>` cells — each click calls `toggleCheckIn(habitId, dateKey)`. Verified by AC-TOGGLE-1..5. |
| 4 stat cards recalc live | Each stat card reads from `useMemo`-derived computations on `state.checkIns[habitId]`. Verified by AC-STAT-1..6. |
| Streak/365 progress is correct | `computeStreak` (C1) + `compute365` (E1) — both pure functions with their own unit tests. Verified by AC-STREAK-1..6 + AC-PROGRESS-1..3. |
| Diary entries round-trip | `<DiaryCard>` controlled textarea; blur flushes to `state.diaries[habitId][monthKey]`; unmount + remount restores. Verified by AC-DIARY-1..4. |

Plus seed-brief hard constraints:

| Hard constraint | Mechanism |
|---|---|
| Check-in toggle one-tap, persists immediately to localStorage | Direct `setPref` per toggle (B1). |
| Streak handles missed days (zero-out on skip) | C1 strict-consecutive `computeStreak`. |
| Diary text persisted per habit + per date | F2 per-habit per-month (closest to prototype's `empty_log` copy). |
| Bilingual via `@repo/plugin-web-tokens` `useI18n` | `useI18n(lang).s("habits.*")` + `t.common.day` / `t.common.days`. All keys already exist (verified at `plugin-web-tokens/src/i18n.ts:37–45 + 231–239`). |
| Date headers respect Settings week-start | `weekStart?: "sun" | "mon"` prop, default Sunday (D3). |
| Module registers via `@repo/xai-web-shell` slot pattern | Replace placeholder at `shellRegistrations.tsx:53`. |
| Verify Cross-vendor: yes | Manual Safari 17+ / Chrome / Firefox smoke for toggle + reload + diary round-trip + DST edge. |

---

## 8. Frozen assumptions (output of this discovery)

These become the inputs to `design.md` / `api.md` / `test.md`:

1. **Package layout** — directory `packages/xai-web-habits/`, package name `@repo/plugin-web-habits`. Docs at `packages/xai-web-habits/docs/{design,api,test,dev_log}.md`.
2. **Public surface** — `HabitsModule` (default + named export), `habitsSlotRegistration` (`WebModuleSlotRegistration`), `HABITS_STORAGE_KEY = "xai_habits_state"` constant, types `Habit`, `HabitId`, `HabitsState`, `DateKey`, `MonthKey`, `WeekStart`, `HabitsModuleProps`.
3. **Persistence** — one key `xai_habits_state`, JSON codec, schemaVersion 1, owner `xai-web-habits`, category `module`, `proposed: false`. Value shape per §3.1 A1.
4. **Date keys** — UTC day key `YYYY-MM-DD` for `checkIns`; UTC month key `YYYY-MM` for `diaries`. Matches the event payload's existing `date: string` UTC convention.
5. **Streak semantics** — C1 strict-consecutive including today. Implemented in `internal/computeStreak.ts`.
6. **365-progress** — E1 year-scoped. Numerator = check-ins this calendar year; denominator = 365 (366 on leap years). Sub-label = `${denominator - numerator} days remaining`.
7. **Monthly rate** — Numerator = check-ins in the current month; denominator = `today.getDate()` (days elapsed in current month, inclusive of today). Reported as percentage rounded to integer.
8. **Diary granularity** — F2 per-habit per-month. Persists on `<textarea>` blur; controlled `useState` mirror during typing. No autosave debounce.
9. **Event emit** — `web:habits:checkin-recorded` (already declared at `events.ts:209`). Emitted on every successful toggle (add or remove). Payload's `streak` field carries the post-toggle streak (0 if removed-and-broke-the-run).
10. **Week-start** — `weekStart?: "sun" | "mon"` prop on `HabitsModule`, default `"sun"`. Host wrapper hard-codes `"sun"` in v1; Settings W4 (row #24) will edit one line to read from a future `xai_pref_week_start` registry entry.
11. **Add-Habit modal** — included in v1 (P3). Bilingual title × 2 fields, emoji string input. Same dialog pattern as `CountdownEditDialog` (shipped).
12. **Icons** — inline 10 SVG glyphs in `internal/icons.tsx`. No upstream-shell coordination.
13. **Empty-state copy** — reuse `habits.empty_log` for the diary placeholder. No new i18n keys this row.
14. **Module slot** — replace placeholder at `apps/web/src/routes/modules/shellRegistrations.tsx:53` (`moduleId: "habits"`, `icon: "pin"`, `railOrder: 8`, `i18nKey: "nav.habits"`, `showInRail: true`) with `habitsSlotRegistration`.
15. **No new external deps** in `package.json` beyond workspace `@repo/*` deps.
16. **CSS** — `styles.css`, tokens-only (no hex literals). Side-effect import from `index.ts`. Class names mirror prototype's `module-habits`, `habits-list`, `habits-detail`, `week-header`, `weekday`, `habit-rows`, `habit-row`, `habit-emoji`, `habit-week`, `hcell`, `stat-grid`, `stat-card`, `progress-card`, `month-cal`, `cal-grid`, `cal-cell`, `cal-num`, `cal-ring`, `log-card`, `log-title`, `log-empty`.
17. **Verify Cross-vendor: yes** (Safari 17+ / Chrome / Firefox manual smoke).

---

## 9. Phase plan preview (full plan lands in `dev_log.md`)

**P1 — Package skeleton + habit list pane + check-toggle + persistence.**

- Create `packages/xai-web-habits/` (package.json + tsconfig.json + manifest.json + vitest.config.ts + eslint.config.mjs).
- Implement `internal/dateKeys.ts`, `internal/seed.ts`, `internal/usePersistedHabits.ts`.
- Implement `HabitList.tsx`, `HabitRow.tsx`, `HabitsModule.tsx` (left pane only — right pane is empty placeholder).
- Append `xai_habits_state` entry to `packages/plugin-web-storage/src/internal/registry.ts`.
- Swap placeholder at `shellRegistrations.tsx:53` to `habitsSlotRegistration`.
- Add `@repo/plugin-web-habits` dep to `apps/web/package.json`.
- Tests: render, i18n, check-toggle, persist, registry-presence, barrel, types, tokens-smoke.
- P1 exit: visible in rail; 7-cell weekly strip toggles persist across reload; events emitted.

**P2 — Detail pane: 4 stat cards + 6/365 progress + month calendar.**

- Implement `internal/computeStreak.ts`, `internal/computeStats.ts`.
- Implement `StatCard.tsx`, `MonthCalendar.tsx`, `HabitDetail.tsx`.
- Wire `HabitDetail` into `HabitsModule` right pane.
- Tests: streak (5 cases), monthly counts/rate, 365 progress, calendar render + month-nav, stat-card live recalc.

**P3 — Diary card + Add-Habit modal + cross-vendor smoke + docs sync.**

- Implement `DiaryCard.tsx` (controlled textarea, blur-flush).
- Implement `AddHabitDialog.tsx` modal.
- Add "Add" button wiring + dialog state to `HabitsModule`.
- Edge cases: diary unmount/remount round-trip, leap-year 365 progress, DST streak boundary, empty-habit-list state, two-tab `storage` event sync.
- Cross-vendor manual smoke (Safari 17+ / Chrome / Firefox).
- Coverage check, docs sync.

3 phases — within the parallel-Agent worker brief's 3-phase budget.

---

## 10. Sources

- `docs/reviews/xai-web-habits/20260523-roadmap-seed.md` (seed brief).
- `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map), §S5 (TSX rules), §S7 (event bus), §S8 (persistence registry).
- `docs/PLUGIN_MAP.md` line 33 (row #15 manifest state: `IN_PROGRESS`).
- `web design/module-habits.jsx` (158 LOC prototype, lines 1–158).
- `web design/DESIGN.md` §4.8 (Habits spec, lines 166–169).
- `web design/icons.jsx` lines 4–50 (icon glyph paths for the 10 inlined SVGs).
- `packages/xai-web-shell/src/types.ts` lines 17–66 (`WebShellIconName` enum incl. `"pin"` for habits, `WebModuleSlotRegistration` interface).
- `packages/xai-web-shell/src/index.ts` (W1 public surface — `WebShellProvider`, `useWebShell`).
- `packages/plugin-web-tokens/src/i18n.ts` lines 37–45 (EN habits keys), lines 231–239 (ZH habits keys), lines 22–30 (`common.day` / `common.days` keys), lines 17 + 211 (`nav.habits`).
- `packages/plugin-web-storage/src/index.ts` (W1 public surface — `usePref`, `setPref`, `PREF_REGISTRY`).
- `packages/plugin-web-storage/src/internal/registry.ts` lines 130–333 (existing `PREF_REGISTRY` entries — pattern to follow; `xai_matrix_state` at line 324 is the model).
- `packages/core/src/types/events.ts` lines 209–218 (existing `web:habits:checkin-recorded` declaration — emit-only this row).
- `packages/xai-web-event-bus/src/index.ts` (`emitWebEvent`, `onWebEvent`, `useWebEventListener`).
- `apps/web/src/routes/modules/shellRegistrations.tsx` line 53 (habits placeholder slot).
- `packages/xai-web-matrix/docs/{design,api,test,dev_log}.md` (sibling W2 module — pattern reference).
- `packages/plugin-web-countdown/src/CountdownModule.tsx` + `CountdownEditDialog.tsx` (shipped W2 modal pattern reference for Q2).
