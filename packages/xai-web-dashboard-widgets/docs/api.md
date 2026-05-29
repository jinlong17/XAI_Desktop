# API Contract — xai-web-dashboard-widgets (@repo/plugin-web-dashboard-widgets)

> ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
> Design: design.md §2 + §4
> Stability promise: see §S2

## §S1. Public surface

The package's only public import path is `@repo/plugin-web-dashboard-widgets`
(maps to `src/index.ts`). Internal modules MUST NOT be imported directly.

`src/index.ts` exports:

```ts
export { dashboardWidgetRegistrations } from "./registrations.js";
```

That is the entire surface. No types are re-exported because all type names
come from `@repo/plugin-web-dashboard-grid` (`WidgetRegistration`,
`WidgetSpanClass`, `WidgetRenderContext`).

## §S2. Stability promise

`dashboardWidgetRegistrations` is consumed by `@repo/plugin-web-dashboard-grid`'s
`DashboardSlotHost` (row #10 row #11 wire-up edit in P3). Future consumers
(settings-features-panel row #23, statistics row #20) may inspect the array
length or `id` values to gate UI.

Stability rules:
- `dashboardWidgetRegistrations.length` is always 10 in v1.
- The 10 `id` values are stable: `clock`, `stat-tasks`, `stat-streak`, `stat-pomos`, `weather`, `mini-cal`, `timezones`, `stickies`, `mail`, `upcoming`. Adding/removing/renaming any requires an ADR amendment.
- The order of entries in the array matches the seed-default for `xai_dash_order` (registry default in `@repo/plugin-web-storage`). Reordering requires updating both this row's registrations.tsx AND row #3's PREF_REGISTRY default — a coupled change that must be co-committed.

## §S3. WidgetRegistration entry shape

Each of the 10 entries follows the contract row #10 froze:

```ts
{
  id: "clock" | "stat-tasks" | ... ,
  span: "w-clock" | "w-stat" | ... ,
  render: (ctx: WidgetRenderContext) => ReactNode,
  ariaLabel?: { en: string; zh: string },
}
```

Per-id specification:

| id | span | aria EN | aria ZH | Notes |
|---|---|---|---|---|
| `clock` | `w-clock` | `Clock widget` | `时钟组件` | usePref ×2 (style, tz); 4 styles; 12-tz picker; analog 60+12+12 |
| `stat-tasks` | `w-stat` | `Tasks-done stat` | `完成任务统计` | Mock value 14/22 + donut |
| `stat-streak` | `w-stat` | `Habit-streak stat` | `习惯连胜统计` | Mock value 27d + flame icon |
| `stat-pomos` | `w-stat` | `Pomodoros stat` | `番茄数统计` | Mock value 6 + 8-dot grid |
| `weather` | `w-weather` | `Weather widget` | `天气组件` | Fixture-driven current + 5-day |
| `mini-cal` | `w-mini-cal` | `Mini calendar` | `迷你日历` | ctx.goTo("calendar") on body click |
| `timezones` | `w-timezones` | `World clocks` | `世界时钟` | usePref ×1 (zones); 3 views; add/remove |
| `stickies` | `w-stickies` | `Sticky notes` | `便签` | 3-note rotated stack |
| `mail` | `w-mail` | `Inbox` | `收件箱` | Unread red dot + count badge |
| `upcoming` | `w-upcoming` | `Upcoming events` | `近期事件` | 4-event mock list |

## §S4. Drag-exclude discipline

Per row #10 api.md §S4, ANY interactive child outside `<button>` / `<input>` /
`<textarea>` MUST carry `data-no-drag`. This row's widgets apply the marker to:

- `ClockWidget`: `.clock-toolbar` (which wraps the timezone button + style toggle + popover) carries `data-no-drag`.
- `WorldClocks`: `.tz-view-toggle` carries `data-no-drag`; `.tz-picker` carries `data-no-drag`; each `.tz-remove` button is a native `<button>` (auto-excluded).
- `MiniCalWidget`: `.mc-head` (wrapping prev/next nav buttons) carries `data-no-drag`; `.mc-foot` (wrapping "Open Calendar" button) carries `data-no-drag`. The `.mc-cell` day cells are NOT excluded — they form the body click area whose click handler calls `ctx.goTo`.
- `MailWidget`, `UpcomingWidget`, `StickiesWidget`, `StatTasks`, `StatStreak`, `StatPomos`: no interactive children → no markers.

## §S5. Persistence semantics

Three keys read+written via `usePref()` from `@repo/plugin-web-storage`:

### `xai_clock_style`

- Type: `"classic" | "split" | "minimal" | "analog"`
- Default: `"classic"`
- Owner: `xai-web-dashboard-widgets` (row #11)
- Codec: `string`
- Set on every style-toggle click; never cleared.

### `xai_clock_tz`

- Type: `"local" | <city-id from cityLibrary>` (string)
- Default: `"local"`
- Owner: `xai-web-dashboard-widgets`
- Codec: `string`
- Set on every popover-item click; never cleared.

### `xai_zones`

- Type: `string[]` — array of city ids from the 12-city library
- Default: `["shanghai", "london", "new_york", "tokyo"]`
- Owner: `xai-web-dashboard-widgets`
- Codec: `json`
- Mutated by add/remove operations; never empty (UI prevents removing the last item — see test AC-WORLDCLOCKS-7); writes are idempotent.

### `xai_dash_order` (consumed indirectly via row #10, never imported here)

- This row never imports or writes this key. Row #10's `useDashOrder` consumes it via `usePref()` and reconciles via `sanitizeOrder()`.
- **Default mismatch is intentional**: row #3 seeded a placeholder default of 8 ids that don't match row #11's 10 widget ids. Row #10's `sanitizeOrder()` is designed for exactly this case — it drops unknown persisted ids and appends missing registered ids in registration order. Net first-mount behavior: 10 widgets render in registrations.tsx order; the sanitized 10-id order is written back to storage. No registry edit required; this is documented in design.md §5 as the intended reconciliation pathway.

## §S6. i18n delta

New keys are added to the existing `dashboard:` block of
`packages/plugin-web-tokens/src/i18n.ts`, under a `widgets:` sub-object. The
existing `dashboard.tasks_done` / `streak` / `pomos` / `weather` / `timezones` /
`sticky_notes` / `mail` / `upcoming` / `good_morning` / `good_afternoon` /
`good_evening` keys are REUSED (no collision).

P1 keys (clock + stats):

```
dashboard.widgets.clock.classic           Classic | 经典
dashboard.widgets.clock.split             Split | 分段
dashboard.widgets.clock.minimal           Minimal | 极简
dashboard.widgets.clock.analog            Analog | 模拟
dashboard.widgets.clock.local_time        Local time | 本地时间
dashboard.widgets.clock.timezone          Timezone | 时区
```

P2 keys (mini-cal + world-clocks + weather + stickies):

```
dashboard.widgets.mini_cal.open           Open Calendar | 打开日历
dashboard.widgets.world_clocks.add_city   Add city | 添加城市
dashboard.widgets.world_clocks.all_added  All cities added | 已添加全部城市
dashboard.widgets.world_clocks.list       List | 列表
dashboard.widgets.world_clocks.analog     Analog | 模拟
dashboard.widgets.world_clocks.grid       Grid | 网格
dashboard.widgets.world_clocks.today      Today | 今天
dashboard.widgets.world_clocks.tomorrow   Tomorrow | 明天
dashboard.widgets.world_clocks.yesterday  Yesterday | 昨天
dashboard.widgets.world_clocks.remove     Remove | 移除
dashboard.widgets.weather.city            Shanghai | 上海   (fixture value)
```

P3 keys (mail + upcoming):

(No new keys needed — `dashboard.mail` + `dashboard.upcoming` already shipped; mail uses fixture `from` strings; upcoming uses fixture `title`/`month` bilingual objects.)

Total i18n delta: 11 new keys × 2 langs in P1+P2 phases.

## §S7. Events

This row emits NO new typed events. Two interaction paths:

1. **MiniCalWidget body click** → calls `ctx.goTo("calendar")`, which row #10's `DashboardSlotHost` translates into `emitWebEvent("web:shell:module-change", { moduleId: "calendar", source: "mini-cal" })`. We rely on row #10's existing emission; we never call `emitWebEvent` directly.
2. **No other emissions.** ClockWidget style/tz changes go to `usePref`, not events. WorldClocks add/remove goes to `usePref`. Stat widgets read mock data.

## §S8. Imports

Allowed imports from each layer:

| From | To | Allowed |
|---|---|---|
| `src/index.ts` | `./registrations.js` | yes |
| `src/registrations.tsx` | `./widgets/*` + `@repo/plugin-web-dashboard-grid` (types) | yes |
| `src/widgets/*` | `./internal/*`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/plugin-web-dashboard-grid` (types) | yes |
| `src/widgets/*` | `@repo/xai-web-event-bus`, `@repo/core/events` | NO (we use ctx.goTo, not direct emission) |
| `src/internal/*` | `@repo/plugin-web-tokens` (Lang type) | yes |
| `src/internal/*` | any other src/widgets/* | NO (one-way: widgets depend on internals) |

ESLint config inherits row #10's react-internal preset + `no-explicit-any: error`.

## §S9. CSS contract

`src/styles.css` is `sideEffects`-imported by index.ts. It defines ONLY
widget-body classes (`.clock-*`, `.cs-*`, `.cm-*`, `.ws-*`, `.donut`,
`.pomo-dots`, `.ww-*`, `.wwf-*`, `.sticky-*`, `.mail-*`, `.upc-*`, `.mc-*`,
`.tz-*`, `.tz-clock`, `.popover-*` ONLY if not in row #2 layout.css). It does
NOT redefine `.widget`, `.widget-shell`, `.widget-content`, or `.dash-grid`
(those live in `layout.css` shipped by row #2/#10).

Verify before commit: `grep -E "\.widget-?(shell|content)?\s*\{" packages/xai-web-dashboard-widgets/src/styles.css` returns 0 matches.

## §S10. Error semantics

- **Unknown clock style in storage**: `usePref` returns the default `"classic"` if the saved value is not in the 4-style union (validated by per-widget guard).
- **Unknown tz in storage**: `usePref` returns `"local"` if the saved value is neither `"local"` nor in the 12-city library.
- **Unknown zone id in `xai_zones`**: `WorldClocks` filters out unknown ids on mount via `.map(id => CITY_LIBRARY.find(c => c.id === id)).filter(Boolean)`.
- **Empty `xai_zones`**: UI prevents removing the last zone; storage saves are skipped if length would become 0.
- **MiniCal goTo with unsupported moduleId**: row #10's `DashboardSlotHost` filters via `KNOWN_MODULE_IDS`; calling with `"calendar"` always succeeds.

## §S11. Test ACs

See `test.md` §2.

---

## §E — Extension API: Stickies create + delete (xai-web-dashboard-stickies-create, 2026-05-28)

> **APPEND extension — SHIPPED §S1-§S11 contract above is unchanged.** Public surface (§S1) stays `dashboardWidgetRegistrations`-only; everything below is INTERNAL to the package (not re-exported).
> Authority: ADR-0010 §D4 carve-out `baaf3e1`. Design: design.md §E.

### §E.1 Public surface — UNCHANGED

`src/index.ts` still exports ONLY `dashboardWidgetRegistrations` (§S1). `StickyComposer`, `useStickies`, `UserSticky`, `StickyColor`, `NewStickyDraft`, `STICKY_COLORS`, and the store helpers are all INTERNAL — consumed only inside `StickiesWidget`. `index-barrel.test.ts` (AC-PKG-4) MUST continue to pass with the single export. (Reviewer override OQ5: if a future consumer needs `UserSticky`, that is an additive barrel + barrel-test change — not in this v1.)

### §E.2 Sticky model types (`internal/stickiesStore/types.ts`)

```ts
export type StickyColor = "sun" | "mint" | "peach" | "sky" | "lilac";

export interface UserSticky {
  id: string;          // createStickyId() — UUID or sticky-<base36ts>-<rnd>
  text: string;        // single string (NOT bilingual) — exactly what the user typed
  color: StickyColor;  // preset token (NOT raw hex)
  createdAt: string;   // ISO 8601
}

export interface NewStickyDraft {
  text: string;
  color: StickyColor;
}

// token → hex resolved at render (dark-mode friendly); default token "sun"
export const STICKY_COLORS: Record<StickyColor, string>;
```

### §E.3 Pure store CRUD (`internal/stickiesStore/stickiesStore.ts`)

All functions are PURE — never mutate `store`; return a new snapshot. Mirrors calendar `eventStore.ts` (eventStore.ts:26-100).

```ts
// Create: generate id + createdAt; return new store + the created entity.
createSticky(
  store: Record<string, UserSticky>,
  draft: NewStickyDraft,
): { next: Record<string, UserSticky>; created: UserSticky };

// Delete: remove id. No-op (SAME reference back) when id missing.
deleteSticky(
  store: Record<string, UserSticky>,
  id: string,
): Record<string, UserSticky>;

// List: array view sorted by createdAt ASC, then id ASC (stable for tests).
listStickies(
  store: Record<string, UserSticky>,
): UserSticky[];
```

Error/edge semantics:
- `createSticky` always succeeds (text validation is the composer's job, not the store's).
- `deleteSticky` of a missing id returns the same store reference (idempotent; `useStickies.remove` skips the `setPref` when ref unchanged).
- `listStickies` on `{}` returns `[]`.

### §E.4 `useStickies()` hook (`internal/stickiesStore/useStickies.ts`)

```ts
export interface UseStickiesApi {
  stickies: Record<string, UserSticky>;   // live snapshot, reactive via usePref
  list: UserSticky[];                      // listStickies(stickies) memoized
  create: (draft: NewStickyDraft) => UserSticky;   // create + persist; returns new entity
  remove: (id: string) => void;            // delete + persist; no-op when id missing
}

export function useStickies(): UseStickiesApi;
```

- Wraps `usePref("xai_dashboard_stickies")`; casts the registry default `Record<string, unknown>` to `Record<string, UserSticky>` at the single point of truth (same pattern as `useUserCalEvents`, useUserCalEvents.ts:61-62).
- `create`/`remove` produce a new snapshot via the pure helpers and persist via the `usePref` setter; stable identities via `useCallback`. Cross-tab fan-out is transitive via `usePref`'s storage listener (no extra wiring) — same as calendar.

### §E.5 `StickyComposer` props (`src/StickyComposer.tsx`)

```ts
export interface StickyComposerProps {
  open: boolean;                              // true → showModal(), false → close()
  lang: Lang;                                 // STR_STICKY_COMPOSER + error labels
  onSave: (draft: NewStickyDraft) => void;    // called after validation passes
  onClose: () => void;                        // ESC / backdrop / Cancel (discarded)
}
```

Behaviour (mirrors `EventComposer`/`TaskComposer`):
- On open: reset form (text `""`, color `"sun"`), `showModal()`, autofocus the `<textarea>` via `setTimeout(0)`.
- Save runs validation: empty/whitespace-only text → inline error shown + composer stays open. Valid → `onSave({ text: text.trim(), color })`.
- ESC fires native `cancel` → `onClose`; backdrop click (`e.target === dialogRef.current`) → `onClose`; Cancel button → `onClose`.
- a11y: `aria-modal="true"`, `aria-labelledby="sticky-composer-title"`; color picker `role="radiogroup"` with per-chip `role="radio"` + `aria-checked`; textarea `aria-required` + `aria-describedby` when error present.
- v1 is CREATE-only composer (no `mode`/`edit`); delete is a per-sticky `×` in `StickiesWidget`, not in the composer.

### §E.6 StickiesWidget wire delta (`src/widgets/StickiesWidget.tsx`)

- Header `+` button: gains `onClick={() => setComposerOpen(true)}`; keeps `data-no-drag`; `aria-label` switches from the reused title key to local STR `add_sticky` (more accurate). This wires the no-op at `StickiesWidget.tsx:24-27`.
- Body render branch:
  - `list.length === 0` → 3 fixture samples from `internal/fixtures.STICKIES` rendered read-only with `data-sample="true"` (no delete button) + an empty-create hint.
  - `list.length > 0` → user stickies: `background: STICKY_COLORS[s.color]`, text `s.text` (string, NOT `[lang]`), each with a per-sticky `<button className="sticky-del" data-no-drag aria-label="Delete note: <text>">×</button>` → `remove(s.id)`.
- `<StickyComposer open={composerOpen} lang={lang} onSave={(d) => { create(d); setComposerOpen(false); }} onClose={() => setComposerOpen(false)} />`.

### §E.7 New persistence key contract (`@repo/plugin-web-storage`)

```ts
xai_dashboard_stickies: {
  key: "xai_dashboard_stickies",
  codec: "json",
  default: {} as Record<string, unknown>,
  schemaVersion: 1,
  owner: "xai-web-dashboard-widgets",
  category: "module",
} satisfies PrefEntry<Record<string, unknown>>
```

- Additive (authorized by carve-out §2). Byte-parallel to `xai_calendar_events` (registry.ts:943-950).
- MUST be added to BOTH parity arrays (`registry.test.ts:230` `OWNER_ROW_ADDITIONS` + `parity-design-md.test.ts:165` exclusion list). `AC-REG-8` count assertion auto-derives (`20 + OWNER_ROW_ADDITIONS.length`).
- NOT added to `web design/DESIGN.md §9.2` — owner-row addition handled via the exclusion list, following the `xai_calendar_events` precedent (RS2; reviewer confirm OQ3).
- Value shape `Record<string, UserSticky>` documented at the registry entry comment; `UserSticky` type lives in `@repo/plugin-web-dashboard-widgets` (registry stays plugin-dep-free; consumer cast at `useStickies`).

### §E.8 Events — NONE

This extension emits NO typed events (honors carve-out constraint). State changes go to `usePref` only; no new `web:*` channel; `packages/core/src/types/events.ts` untouched.

### §E.9 i18n — local STR only

`internal/strings.ts` `STR_STICKY_COMPOSER` (bilingual `{ en; zh }` record, mirroring `xai-web-calendar` strings.ts) covers: composer title, text field label, color field label, 5 color names, Save / Cancel, empty-text error, empty-state hint, add-sticky aria, delete aria. **0 new `plugin-web-tokens` keys.** Existing `dashboard.sticky_notes` REUSED for the widget header title via the existing `useI18n` import.

---

## §F — Extension API: Real-data wiring for 5 widgets (xai-web-dashboard-real-data, 2026-05-28)

> **APPEND extension — SHIPPED §S1-§S11 contract and §E stickies contract above are unchanged.** Public surface (§S1) stays `dashboardWidgetRegistrations`-only; everything below is INTERNAL to the package (not re-exported). **Read-only: NO new registry key, NO new event, NO write to any store.**
> Authority: ADR-0010 §D4 carve-out `217170c`. Design: design.md §F. Discovery: `docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md`.

### §F.1 Public surface — UNCHANGED

`src/index.ts` still exports ONLY `dashboardWidgetRegistrations` (§S1). The new `internal/dataReads/*` selectors + predicates + the extended `internal/strings.ts` are all INTERNAL — consumed only inside the 5 rewired widgets. `index-barrel.test.ts` (AC-PKG-4) MUST continue to pass with the single export. (RD11.)

### §F.2 WidgetRegistration entries — shapes UNCHANGED

The 10-entry array (§S3) is byte-stable: ids, spans, ariaLabels, and the `render: (ctx) => <Widget .../>` wiring are all unchanged. Only the BODY of 5 widget components changes (hardcoded → real read). `registrations.tsx` is NOT edited. The render-context contract (§4 design, `ctx = { lang, now, goTo }`) is honored as-is — `now`/`goTo` are already passed to Upcoming/MiniCal.

### §F.3 Read-selector contracts (`src/internal/dataReads/*`)

All selectors are PURE (no I/O, no `Date.now()` — `now`/`todayKey` injected) and DEFENSIVE (narrow `unknown` → minimal shape; drop non-conforming entries silently; never throw). Names indicative; build may merge a predicate+selector into one file per store.

```ts
// --- tasks (xai_task_cols) ---
// Minimal local shape the predicate narrows toward (NOT the registry's opaque Record<string,boolean>):
interface TaskColMin { tasks: TaskCardMin[]; completed?: TaskCardMin[]; }
interface TaskCardMin { id: string; done?: boolean; }
function isTaskColsRecord(v: unknown): v is Record<string, TaskColMin>;
function countDone(store: unknown): { done: number; total: number };
//   done  = count of cards with done === true across every bucket's tasks (+ completed?)
//   total = count of all cards across every bucket's tasks (+ completed?)
//   on {} or malformed → { done: 0, total: 0 }

// --- pomodoro (xai_pomodoro_sessions) ---
interface PomodoroSessionMin { mode: "focus"|"short-break"|"long-break"; finishedAt: string; completed: boolean; }
function isPomodoroSession(v: unknown): v is PomodoroSessionMin;   // mirrors Statistics' predicate
function countTodaysFocus(sessions: unknown, todayLocalKey: string): number;
//   counts s.mode==="focus" && s.completed && localDateKey(new Date(s.finishedAt)) === todayLocalKey
//   USES finishedAt (canonical) — NOT completedAt (Cmd-K's stale field). On [] → 0.

// --- habits (xai_habits_state) ---
interface HabitMin { id: string; }
interface HabitsStateMin { habits: HabitMin[]; checkIns: Record<string, Record<string, true>>; }
function isHabitsState(v: unknown): v is HabitsStateMin;            // mirrors Statistics' isHabitsStateRecord
function maxStreak(state: unknown, todayUtc: Date): number;
//   per-habit strict-consecutive (C1): from today's UTC dateKey walk back while checked; 0 if today unchecked.
//   returns max over all habits. On no habits / malformed → 0.

// --- calendar (xai_calendar_events) ---
interface UserCalEventMin {
  id: string; title: string;
  startISO: string;          // "YYYY-MM-DDTHH:MM" local-clock
  endISO: string;
  colorPreset: "mint"|"amber"|"blue"|"violet"|"rose";
  recurrence: { kind: "daily"|"weekly" } | null;
}
function isUserCalEventMap(v: unknown): v is Record<string, UserCalEventMin>;

interface UpcomingItem { id: string; startISO: string; title: string; colorPreset: UserCalEventMin["colorPreset"]; }
function upcomingEvents(map: unknown, now: Date, windowDays: number, max: number): UpcomingItem[];
//   expand recurrence over [now, now+windowDays]; keep instances with startISO >= now; sort ascending; take `max` (4).
//   NON-recurring + daily + weekly handled (minimal local expansion). On {} → [].

type MiniCalDotColor = "mint"|"amber"|"blue"|"violet"|"rose";
function monthDots(map: unknown, viewYear: number, viewMonth0: number): Record<number, MiniCalDotColor[]>;
//   expand recurrence over the viewed month; bucket by day-of-month (1..lastDay); each event → its colorPreset.
//   MiniCalWidget slices to first 3 dots per day (existing render cap). On {} → {}.
```

### §F.4 Widget body deltas (props UNCHANGED)

| Widget | Props (unchanged) | Body delta |
|---|---|---|
| `StatTasks` | `{ lang }` | `const [cols] = usePref("xai_task_cols"); const { done, total } = countDone(cols);` → render donut `value=done/total`; when `total === 0` render local-STR empty label instead of donut. Drop `STAT_TASKS_DONE`/`STAT_TASKS_TOTAL` consts. |
| `StatStreak` | `{ lang }` | `const [hs] = usePref("xai_habits_state"); const streak = maxStreak(hs, new Date());` → render number + flame; when no habits render local-STR empty label; streak 0 with habits present renders `0` (honest). Drop `STAT_STREAK_DAYS`. |
| `StatPomos` | `{ lang }` | `const [sessions] = usePref("xai_pomodoro_sessions"); const n = countTodaysFocus(sessions, localDateKey(new Date()));` → render `n` + 8-dot grid (`PomoDots count={n} total={8}`). Drop `STAT_POMOS_DONE`/`STAT_POMOS_TOTAL`. `0` is an honest empty (no special copy). |
| `UpcomingWidget` | `{ lang, now }` *(now already in ctx; add to props if not present)* | `const [evMap] = usePref("xai_calendar_events"); const items = upcomingEvents(evMap, now ?? new Date(), 60, 4);` → render list from `items` (date/month/time derived from `startISO`); when `items.length === 0` render local-STR "no upcoming events". Stop importing `UPCOMING` on the live path. |
| `MiniCalWidget` | `{ lang, now, goTo }` (unchanged) | `const [evMap] = usePref("xai_calendar_events"); const dots = monthDots(evMap, view.getFullYear(), view.getMonth());` → render `dots[d]?.slice(0,3)` per cell (replaces `CAL_EVENTS[d]`). Empty month = no dots (honest). `goTo`/nav/`data-no-drag` UNCHANGED. Stop importing `CAL_EVENTS` on the live path. |

> **Note on `UpcomingWidget` `now`:** the SHIPPED `UpcomingWidgetProps` is `{ lang }` only (it never used `now`). To read "upcoming relative to now," the registration entry passes `now` (already in `ctx`). Build adds `now` to `UpcomingWidgetProps` and threads it in `registrations.tsx`'s `render` for the `upcoming` entry — a 1-prop additive change, NOT a render-context (`WidgetRenderContext`) change (that type is row #10's and stays frozen). Covered by an AC.

### §F.5 Persistence semantics — READ-ONLY (NO new key, NO setter)

4 pre-existing keys read via `usePref(<key>)` for reactivity; the `setValue` tuple member is NEVER called:

| Key | Codec | Default | Read by | Written here |
|---|---|---|---|---|
| `xai_task_cols` | json | `{}` | StatTasks | NO |
| `xai_pomodoro_sessions` | json | `[]` | StatPomos | NO |
| `xai_habits_state` | json | `{schemaVersion:1,habits:[],checkIns:{},diaries:{}}` | StatStreak | NO |
| `xai_calendar_events` | json | `{}` | Upcoming + MiniCal | NO |

**NO registry edit. NO parity-array edit.** (Contrast §E.7 which added a key.) Reactivity: owning-module writes fan out via `usePref`'s `storage` event (cross-tab) + same-tab bus → our widgets re-render. SSR/pre-hydrate read returns the registry default → honest empty state (RD10).

### §F.6 Events — NONE

This extension emits NO typed events and adds NO event channel. `packages/core/src/types/events.ts` untouched. MiniCal's existing `ctx.goTo("calendar")` path (§S7) is unchanged.

### §F.7 i18n — local STR only (extend existing `internal/strings.ts`)

New empty-state keys are added to the EXISTING local `internal/strings.ts` (created by §E), e.g. `stat_tasks_empty`, `stat_streak_empty`, `upcoming_empty` (bilingual `{ en; zh }`). **0 new `plugin-web-tokens` keys.** Existing labels `dashboard.tasks_done` / `dashboard.streak` / `dashboard.pomos` / `dashboard.upcoming` stay sourced from `useI18n` (already imported in each widget). (Q-i18n; reviewer OQ5.)

### §F.8 CSS contract delta

Additive only, namespaced, no `.widget*` redefinition (§S9 guard still holds — `grep -E "\.widget-?(shell|content)?\s*\{"` returns 0):
- `.mc-dot-rose` — 5th MiniCal dot color, IF `colorPreset:"rose"` events exist and the class is absent (RD4). Additive to the existing `.mc-dot-mint/amber/blue/violet`.
- empty-state hint classes (e.g. `.ws-empty`, `.upc-empty`) — small additive text styles for the honest empty labels.

### §F.9 Error / edge semantics

- Malformed / missing store value → predicate returns `false` → selector returns its empty value (`{done:0,total:0}` / `0` / `[]` / `{}`) → widget renders its honest empty state. NEVER throws (defensive, like Statistics + Cmd-K).
- Date-basis correctness is the selector's responsibility (pomo=local, habits=UTC, calendar=local-clock; §F.3 + RD3). Each selector takes an injected clock for deterministic tests.
- Recurrence: unknown `recurrence.kind` → treated as non-recurring (returns the single anchor instance if in window) or dropped — matches calendar's defensive `expandRecurrence`; documented in `calUpcoming`/`calMonthDots`.

### §F.10 Test ACs

See `test.md` §F.
