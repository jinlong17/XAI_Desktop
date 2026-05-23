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
