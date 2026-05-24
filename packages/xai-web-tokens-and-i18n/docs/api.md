# API Contract — xai-web-tokens-and-i18n

> Owner package: `@repo/plugin-web-tokens` (per ADR-0007 §S4)
> Status: PLAN_DRAFT
> Updated: 2026-05-23
> Frozen assumptions: see `design.md`

This is the public surface that downstream consumers (`apps/web/`, `xai-web-shell`, `xai-web-settings-appearance`, every W2 module) commit to.

---

## Module entry point

```ts
// import * from "@repo/plugin-web-tokens"
//
// ⚠ side-effect imports — the act of importing the package applies
//   tokens.css + layout.css to the document.
```

The `package.json` declares `"sideEffects": ["./src/tokens.css", "./src/layout.css"]` so Vite + Rollup do NOT tree-shake the CSS.

## Type re-exports

```ts
export type Lang = "en" | "zh";

export type Theme = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type BgTone =
  | "default"
  | "cream"
  | "mist"
  | "lavender"
  | "peach"
  | "graphite";
export type RailPos = "left" | "right" | "top" | "bottom";

// Derived from `typeof I18N["en"]` — full structural type of the EN bundle.
// ZH must match this shape (compile-time check).
export type I18NBundle = typeof I18N["en"];
```

## i18n bundle export

```ts
export declare const I18N: {
  readonly en: { /* full as-const typed bundle */ };
  readonly zh: { /* full as-const typed bundle */ };
};
```

Both EN and ZH bundles share the shape defined in `i18n.ts`:

| Top-level key | Type | Notes |
|---|---|---|
| `app_name` | `string` | `"XAI Console"` / `"XAI 工作台"` |
| `nav` | `{ tasks, habits, pomodoro, calendar, matrix, countdown, search, settings, board, dashboard, meditation, statistics, pet, ai: string }` | 14 module nav labels |
| `common` | `Record<string, string>` (~50 entries) | today/tomorrow/months/actions (weekdays are NOT here — see top-level `weekdays_short`) |
| `weekdays_short` | `readonly [string, string, string, string, string, string, string]` | Top-level key, Sun..Sat / 周日..周六. Verbatim source `web design/i18n.js` places this OUTSIDE `common`. |
| `tasks` | `{ all, next_mon, next_wed: string }` | + downstream additions |
| `habits` | `{ title, monthly_checkins, total_checkins, monthly_rate, streak, habit_log, empty_log: string }` |  |
| `pomo` | `{ title, focus, paused, running, start, pause, continue, end, overview, todays_pomos, todays_focus, total_pomos, total_focus, focus_record: string }` |  |
| `cal` | `{ month, week, day, today, sample_banner: string }` |  |
| `matrix` | `{ title, urgent_important, not_urgent_important, urgent_unimportant, not_urgent_unimportant: string }` |  |
| `countdown` | `{ title, days_until, days_since: string }` |  |
| `settings` | `{ title, account, premium, features, smart_lists, notifications, date_time, appearance, more, integrations, collaborate, sticky, hotkeys, about, language, theme, density, font_scale, light, dark, system, comfortable, compact, using_free, upgrade_now: string }` |  |
| `tag` | `{ study, work, personal, todo, other: string }` |  |
| `avatar` | `{ settings, statistics, sign_out, premium: string }` |  |
| `board` | `{ title, my_board, add_list, add_card, add_card_compact, lists: {backlog, today, week, later, done}, create_card_title, view_board, view_planner, view_inbox, labels, checklist, due, filter, share, total, views: {board, table, calendar, dashboard, timeline, map}, views_header, list_actions, change_color, remove_color, copy_list, move_list, watch, archive, automation, table_card, table_list, table_labels, table_members, table_due, table_checklist, no_cards, empty_calendar: string }` |  |
| `dashboard` | `{ title, hello, good_morning, good_afternoon, good_evening, today_focus, tasks_done, streak, pomos, weather, timezones, sticky_notes, mail, upcoming, schedule, add_widget, quote_daily, quote_custom, quote_edit, quote_placeholder, quote_show, hide, add_quote, add_countdown, add_sticky, visible, hidden, countdowns, countdown_title, countdown_date, countdown_add, days_left: string }` |  |
| `quotes` | `readonly { readonly author: string; readonly text: string }[]` (length 7 per language) |  |
| `meditation` | `{ title, enter, exit, pick_scene, pick_clock, pick_sound, scenes: {forest, ocean, night, rain, void}, clocks: {digital, split, analog, minimal}, sounds: {none, water, rain, waves, forest}, duration, mins, breathe, start: string }` |  |
| `statistics` | `{ title, this_week, this_month, all_time, tasks_completed, focus_time, habits_kept, daily_avg: string }` |  |
| `pet` | `{ hello, working, idle, tip1, tip2, tip3, tip4: string }` |  |

All strings are byte-for-byte ports from `web design/i18n.js`.

## `useI18n(lang)` — primary hook

```ts
/**
 * Returns the typed bundle for the active language and a dotted-path
 * string accessor.
 *
 * `t` — structurally typed bundle for the active language. Use this when the
 *   key path is known at compile time:
 *     const { t } = useI18n(lang);
 *     <h1>{t.habits.title}</h1>
 *     <span>{t.common.today}</span>
 *
 * `s(path)` — dotted-string accessor. Use this when the key is computed at
 *   runtime, or when porting a module from the prototype that already uses
 *   `s("habits.title")` (DESIGN.md §8 verbatim shape):
 *     const { s } = useI18n(lang);
 *     <h1>{s("habits.title")}</h1>
 *     {modules.map(m => <li>{s(`nav.${m}`)}</li>)}
 *
 * Missing-key behaviour:
 *   - `t.foo.bar` → TypeScript compile error.
 *   - `s("foo.bar")` → returns the path string itself ("foo.bar") AND
 *     calls `console.warn("[useI18n] missing key", "foo.bar", "in", lang)`
 *     in `import.meta.env.DEV` mode. Production warn is suppressed to avoid
 *     log spam.
 *
 * The hook is referentially stable across renders when `lang` is stable.
 * It does NOT subscribe to any context; the caller passes `lang` directly.
 */
export function useI18n(lang: Lang): {
  t: I18NBundle;
  s: (path: string) => string;
};
```

### Error / edge semantics

| Input | Output |
|---|---|
| `useI18n("en")`, `s("app_name")` | `"XAI Console"` |
| `useI18n("zh")`, `s("habits.title")` | `"习惯"` |
| `useI18n("en")`, `s("nav.tasks")` | `"Tasks"` |
| `useI18n("en")`, `s("nope.missing")` | returns `"nope.missing"`; warns in dev |
| `useI18n("en")`, `s("")` | returns `""`; warns in dev |
| `useI18n("en")`, `s("weekdays_short.0")` | returns `"Sun"` (top-level array index resolution; `weekdays_short` is NOT under `common`, matching verbatim source) |
| `useI18n("en")`, `t.habits.title` | `"Habits"` (typed) |
| `useI18n("zh")`, `t.tag.study` | `"学习"` (typed) |
| `useI18n("en" as unknown as Lang)` with bad lang | throws `TypeError` at runtime with explicit message; type system forbids at compile time |

### Permission / idempotency notes

- Hook is **pure** and **idempotent**: calling it twice with the same `lang` returns equivalent `{t, s}` (structurally `t` is the same const reference; `s` is a stable function reference when the underlying bundle hasn't changed).
- Hook has **no side effects**. It does NOT mutate the DOM, read localStorage, or emit events. Cross-window language propagation is the host shell's responsibility (row #5).
- No permission/role gate; this is a foundational UI primitive.

## `apply*` DOM helpers

These small typed helpers wrap the `document.documentElement` attribute or inline-style mutations that `web design/app.jsx` performs in `useEffect`. They are the canonical write paths; callers (row #5, row #22) MUST use these rather than calling `document.documentElement.setAttribute` directly.

### `applyTheme(theme: Theme): void`

```ts
/**
 * Sets `data-theme` on <html>:
 *   - "light"  → <html data-theme="light">
 *   - "dark"   → <html data-theme="dark">
 *   - "system" → resolves via window.matchMedia("(prefers-color-scheme: dark)")
 *                and applies "light" or "dark" accordingly.
 *
 * SAFE in SSR: when `document` is undefined (no-op).
 * Does NOT subscribe to system theme change events; caller wires a
 * media-query listener if needed.
 */
export function applyTheme(theme: Theme): void;
```

### `applyDensity(density: Density): void`

```ts
/**
 * Sets `data-density` on <html>:
 *   - "comfortable" → <html data-density="comfortable">  (default)
 *   - "compact"     → <html data-density="compact">
 */
export function applyDensity(density: Density): void;
```

### `applyFontScale(scale: number): void`

```ts
/**
 * Sets `font-size` on <html> to `${scale * 16}px`.
 * Caller is responsible for clamping; this function validates that
 * scale is finite and > 0. Recommended range 0.85..1.15.
 * Throws RangeError for non-finite or non-positive values.
 */
export function applyFontScale(scale: number): void;
```

### `applyAccentHue(hue: number): void`

```ts
/**
 * Sets `--accent-hue` inline-style on <html>. Pass any number 0..360.
 * Out-of-range values are passed through unchanged (CSS handles them).
 * Throws RangeError if not finite.
 */
export function applyAccentHue(hue: number): void;
```

### `applyBgTone(tone: BgTone): void`

```ts
/**
 * Sets `data-bg-tone` on <html>:
 *   - "default"   → REMOVES the attribute (`:root` defaults apply).
 *   - "cream"|"mist"|"lavender"|"peach"|"graphite" → <html data-bg-tone="X">
 */
export function applyBgTone(tone: BgTone): void;
```

### `applyRailPos(pos: RailPos): void`

```ts
/**
 * Sets `data-rail-pos` on <html>:
 *   - "left"|"right"|"top"|"bottom" → <html data-rail-pos="X">
 *
 * Note: `web design/app.jsx` applies this on `.app` not `<html>`. We hoist
 * to `<html>` so utility classes in `layout.css` can target it without
 * requiring the `.app` wrapper to be present at all times. layout.css
 * selectors are ported to match (`.app[data-rail-pos="…"]` → `:root[data-rail-pos="…"] .app`).
 *
 * If row #5 needs to keep `.app[data-rail-pos]` selectors verbatim, this
 * function can be re-targeted in P3 with no API change. The selector form
 * is locked by the rendered output of the `.app` wrapper in row #5.
 */
export function applyRailPos(pos: RailPos): void;
```

> **Builder note** — when row #5 lands, if it elects to set `data-rail-pos` on `.app` directly (one less DOM mutation step), `applyRailPos` becomes optional. The function is preserved for parity with `app.jsx`'s pattern and to give the settings pane (row #22) a single canonical write path.

## Side-effect contract

```ts
// In any consumer, this single line is enough to apply tokens + layout:
import "@repo/plugin-web-tokens";

// Or, if also importing types/values:
import { useI18n, applyTheme, type Lang } from "@repo/plugin-web-tokens";
// → CSS still applied via package sideEffects manifest.
```

The CSS is applied EXACTLY ONCE per session even if multiple modules import the package (Vite dedupes via module ID).

## Cross-window / cross-vendor contract

- **Cross-window**: none. CSS variables live on `document.documentElement` per window; each window imports `@repo/plugin-web-tokens` independently. Cross-window language sync is the host shell's responsibility.
- **Cross-vendor**: all source files (`tokens.css`, `layout.css`, `i18n.ts`, `index.ts`, `apply.ts`) MUST be byte-equal between Claude / Codex / Cursor outputs for the verify gate to pass.

## Versioning

This is v1 of `@repo/plugin-web-tokens`. Breaking changes require a new ADR or a `feature-plan revise` cycle. Additive changes (new token, new i18n key, new `apply*` helper) follow the standard build-form: feature-plan → review → build.

## Inputs from upstream (advisory)

This row has **no upstream code deps**. It DOES read:

- `web design/tokens.css` — port source (byte-for-byte).
- `web design/layout.css` — port source (byte-for-byte).
- `web design/i18n.js` — port source for `I18N` (the `MOCK` block at lines 397–636 is NOT this row's responsibility).
- `web design/DESIGN.md` §5 + §8 + §7 — semantic source of truth.
- `web design/app.jsx` — reference for `apply*` helper semantics.
- `apps/web/index.html` — write target (Google Fonts `<link>` additions).

## Outputs to downstream (advisory)

- `apps/web/src/main.tsx` (row #5) — adds `import "@repo/plugin-web-tokens";`
- `apps/web/src/App.tsx` (row #5) — calls `useI18n(lang)` for nav labels.
- `xai-web-shell` (row #5) — wires `applyTheme/Density/FontScale/AccentHue/BgTone/RailPos` to React state effects.
- `xai-web-settings-appearance` (row #22) — calls `apply*` from settings pane handlers.
- Every W2 module (rows #6..#19) — calls `useI18n(lang)` for module-internal strings.
