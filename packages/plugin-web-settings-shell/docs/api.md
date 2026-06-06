# API Contract — @repo/plugin-web-settings-shell

> **Row**: xai-web-settings-shell (#21, W4a · chassis)
> **Date**: 2026-05-23
> **Public surface**: `packages/plugin-web-settings-shell/src/index.ts` is the ONLY allowed import path. Never import from `src/internal/*`.

---

## 0. Surface map

```ts
// Components
export { SettingsModule }      from "./SettingsModule.js";
export { Toggle }              from "./Toggle.js";
export { SettingRow }          from "./SettingRow.js";
export { SectionBlock }        from "./SectionBlock.js";
export { SettingsFooter }      from "./SettingsFooter.js";

// Slot registration
export { settingsShellWebModuleRegistration } from "./registration.js";

// Public utilities
export { resetAllPrefs }       from "./internal/resetAllPrefs.js";
export { paneRegistry }        from "./internal/paneRegistry.js";

// Public types
export type {
  SettingsPaneId,
  Pane,
  PaneRenderProps,
  SettingsModuleProps,
  ToggleProps,
  SettingRowProps,
  SectionBlockProps,
  SettingsFooterProps,
} from "./types.js";
```

Side-effect global CSS: `import "./styles.css"` at the top of `src/index.ts`.

## 1. Types

### 1.1 `SettingsPaneId`

```ts
export type SettingsPaneId =
  | "account"
  | "premium"
  | "features"
  | "smart_lists"
  | "notifications"
  | "date_time"
  | "appearance"
  | "more"
  | "integrations"
  | "collaborate"
  | "sticky"
  | "hotkeys"
  | "about";
```

Order matches source line 27-50 and DESIGN.md §4.12. Add to this union ONLY when DESIGN.md adds a 14th pane (would be a SemVer bump).

### 1.2 `Pane`

```ts
export interface Pane {
  /** Stable id, used as React key + active-state selector. */
  readonly id: SettingsPaneId;
  /** Icon glyph for the sidebar entry. Must exist in @repo/xai-web-shell icons. */
  readonly icon: WebShellIconName;
  /** i18n dotted key for the sidebar label. Format: "settings.<id>" matching i18n.ts bundle. */
  readonly i18nKey: `settings.${string}`;
  /** Renders the right-side detail content for this pane. Sibling rows REPLACE this fn. */
  readonly render: (props: PaneRenderProps) => React.ReactElement;
}
```

### 1.3 `PaneRenderProps`

```ts
export interface PaneRenderProps {
  /** Active language. */
  readonly lang: Lang;
}
```

Frozen at v1 to `{ lang }` only. Sibling rows MUST read additional state (theme, density, etc) via `usePref` directly. Adding fields = SemVer bump + ADR.

### 1.4 `SettingsModuleProps`

```ts
export interface SettingsModuleProps {
  /** Active language — threaded down from `useWebShell().lang` by registration wrapper. */
  lang: Lang;
}
```

### 1.5 Atom props

```ts
export interface ToggleProps {
  /** Current on/off state. */
  on: boolean;
  /** Click handler — fires synchronously, no event arg. */
  onChange: () => void;
  /** Optional aria-label override (defaults to no extra label — the parent SettingRow provides context). */
  ariaLabel?: string;
}

export interface SettingRowProps {
  /** Visible label string (already i18n-resolved). */
  label: string;
  /** Optional description string under the label. */
  desc?: string;
  /** Control element rendered in the right slot. */
  children: React.ReactNode;
  /** Inline style override (passthrough — keeps source parity). */
  style?: React.CSSProperties;
}

export interface SectionBlockProps {
  /** Section children (typically a sequence of `<SettingRow>`). */
  children: React.ReactNode;
  /** Inline style override (passthrough — keeps source parity). */
  style?: React.CSSProperties;
}

export interface SettingsFooterProps {
  /**
   * Save handler. Returns the array of changes to broadcast. Empty array =
   * no event emitted but the "Saved" flash still shows (matches source UX).
   */
  onSave: () => WebPreferenceChange[];
  /**
   * Reset handler. Defaults to `resetAllPrefs()` if omitted. Override for
   * pane-scoped resets in future rows.
   */
  onReset?: () => void;
  /** Active language for bilingual button labels. */
  lang: Lang;
}
```

## 2. Component contracts

### 2.1 `<SettingsModule lang>`

Renders the outer chassis. Owns `useState<SettingsPaneId>("account")`. Renders `<SettingsSidebar>` + `<SettingsDetail>` (both internal — not exported).

- Sidebar entries are sourced from `paneRegistry` order.
- Clicking an entry calls `setActive(pane.id)`.
- Detail container calls `active.render({ lang })`.

### 2.2 `<Toggle>` / `<SettingRow>` / `<SectionBlock>`

Verbatim TSX ports of source lines 1039-1059. Pure stateless components. Toggle uses `role="switch"` + `aria-checked={on}` per source.

### 2.3 `<SettingsFooter>`

Renders the per-pane bottom action bar (Reset to defaults + Save & apply). Click on Save:
1. Calls `props.onSave()` → receives `WebPreferenceChange[]`
2. For each change, emits `emitWebEvent("web:settings:preference-changed", { ...change, changedAt: new Date().toISOString() })`
3. Sets local `saved=true` for 1800ms (then auto-reverts)

Click on Reset:
1. Shows `window.confirm` with bilingual message (EN: "Reset every preference to defaults? This clears saved theme, layout, and module toggles." / ZH: "确定恢复所有设置为默认值？这会清除保存的主题、布局和模块开关。")
2. If confirmed, calls `props.onReset?.() ?? resetAllPrefs()`

## 3. Event contracts

This row **emits** but does not **subscribe** to events.

### 3.1 `web:settings:preference-changed`

Channel declared in `packages/core/src/types/events.ts` line 193 (already in the EventMap). Co-ownership: row #22 (per declaration comment) + row #21 (chassis — this row).

Emit triggers:
- **Save & apply**: one emit per item in `onSave()` return array.
- **Reset to defaults**: 7 emits (one per canonical `WebPreferenceKey`: `theme`/`density`/`fontScale`/`accentHue`/`railPos`/`bgTone`/`lang`) with the registry default value for each.

Payload shape (reuses existing `WebPreferenceChange` union):

```ts
{ key: WebPreferenceKey; value: <key-specific union>; changedAt: string }
```

`changedAt` is ISO 8601 (`new Date().toISOString()`).

## 4. Slot registration

```ts
export const settingsShellWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "settings",
  label: "Settings",
  defaultChildPath: "",
  children: [
    { path: "",  render: SettingsModuleRoute },
    { path: "*", render: SettingsModuleRoute },
  ],
  icon: "sliders",
  railOrder: 99,
  i18nKey: "nav.settings",
  showInRail: false,
};
```

`SettingsModuleRoute` (internal — not exported) calls `useWebShell()` to obtain `lang`, then renders `<SettingsModule lang={lang} />`. Matches the pattern from `packages/plugin-web-statistics/src/registration.tsx`.

## 5. Utilities

### 5.1 `resetAllPrefs(): void`

Public utility. Side effects:

1. Iterate `Object.values(PREF_REGISTRY)`. For each entry:
   - Skip if `entry.proposed === true`.
   - If `entry.key.startsWith("xai_")`, call `removePref(entry.key as WebPrefKey)`.
   - (At v1 this matches the entries `xai_accent_hue`, `xai_rail_pos`, `xai_bg_tone`, `xai_rail_order`, `xai_pet_pos`, `xai_pet_id`, `xai_task_cols`, `xai_boards_v2`, `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, `xai_dash_order`, `xai_clock_style`, `xai_clock_tz`, `xai_zones`, `xai_ai_convos`, `xai_ai_insights`, `xai_ai_voice`, `xai_pomodoro_sessions`, `xai_countdowns`, `xai_matrix_state`, `xai_habits_state`, `xai_pref_week_start`, `xai_board_view_by_id`, `xai_meditation_prefs` — all 25 currently-registered `xai_*` entries, none of which are `proposed: true`.)
2. Emit `web:settings:preference-changed` for each canonical `WebPreferenceKey` at its compile-time default. Defaults are hardcoded in `src/internal/defaults.ts` (a frozen table) — NOT derived from PREF_REGISTRY, because four of the seven canonical preferences (`theme`/`density`/`fontScale`/`lang`) are `useState`-backed in `apps/web/src/App.tsx` (NOT persisted via `usePref`):
   - `theme` → `"light"` (matches App.tsx initial useState)
   - `density` → `"comfortable"`
   - `fontScale` → `1`
   - `accentHue` → `PREF_REGISTRY.xai_accent_hue.default` (typed via registry — currently `165`)
   - `railPos` → `PREF_REGISTRY.xai_rail_pos.default` (`"left"`)
   - `bgTone` → `PREF_REGISTRY.xai_bg_tone.default` (`"default"`)
   - `lang` → `"en"` (matches App.tsx initial useState)
3. Each emit carries `changedAt: new Date().toISOString()`.

Idempotent: calling twice yields the same end state (keys removed, same defaults emitted).

NB: chassis does NOT directly mutate `App.tsx`-owned `useState` values (`theme`/`density`/`fontScale`/`lang` are `useState` in App.tsx, not `usePref`). For those, the live broadcast via the bus is the propagation channel — `apps/web/src/App.tsx` must subscribe to `web:settings:preference-changed` and call its `setTheme`/`setDensity`/`setFontScale`/`setLang` accordingly. **This subscription is NOT in scope for row #21** — it is a small follow-up edit that any sibling row (or row #22 which owns the appearance pane) can land. Chassis remains agnostic; the contract is that emitting at default IS the reset signal for those four useState dimensions.

### 5.2 `paneRegistry: Pane[]`

Exported array, length 13. Each entry has `id` matching `SettingsPaneId`, `icon`, `i18nKey`, and a placeholder `render` (returns a `<div className="pane-placeholder">{lang==="zh"?"此设置面板暂未开放":"This pane is not yet available."}</div>`).

Sibling rows #22/#23/#24 REPLACE entries by importing this array, returning a new array with substituted entries — or by exporting their own `Pane` objects that the host composes. The exact composition seam will be locked when sibling rows plan; for this row we ship the placeholder-only array.

## 6. Error semantics

- `<SettingsModule>` with unknown `lang` falls back to "en" via `useI18n` behavior (which throws `TypeError` per its contract — caller error, not chassis bug).
- `resetAllPrefs()` swallows individual `removePref` failures via try/catch internally to maintain idempotency. Failures are logged in DEV only.
- `emitWebEvent` is synchronous and pure; failures (no subscribers) are no-ops by design of the event bus.
- `<SettingsFooter onSave>` returning a non-array throws a `TypeError` in DEV (`Array.isArray` guard with `import.meta.env.DEV` console.warn fallback in PROD).

## 7. Stability + versioning

This package is `In-Dev` until row #21 ships. After ship:
- Atomic API (`Toggle`/`SettingRow`/`SectionBlock`/`SettingsFooter`) freezes — changes require ADR follow-up.
- `Pane` interface freezes — adding optional fields is backward-compat, removing/renaming requires SemVer major.
- `SettingsPaneId` is closed — adding a 14th pane requires SemVer minor (siblings extend through `paneRegistry`, not by adding ids).
- Event emit semantics frozen — adding ANOTHER emit per Save is backward-compat (consumers tolerate redundant events), removing an emit on Reset breaks downstream consumers.

## 8. Migration guidance for sibling rows

When sibling rows (#22 / #23 / #24) plan their work, they should:

1. Import `Pane` + `PaneRenderProps` + `paneRegistry` from `@repo/plugin-web-settings-shell`.
2. Export their own `Pane` objects (e.g. `appearancePane: Pane`).
3. Compose: edit `paneRegistry` (or a sibling-owned `composedPaneRegistry`) to include the new pane. The recommended pattern is a single composition module owned by `apps/web/src/routes/modules/settingsPaneComposition.ts` that imports from each sibling row, but this row does not lock the location — siblings decide.
4. Use `Toggle`/`SettingRow`/`SectionBlock` for in-pane UI to maintain visual consistency.
5. Use `<SettingsFooter onSave={() => collectChanges()} lang={lang} />` to gain Save/Reset buttons + broadcast.

## 9. Dependencies

- `react ^19.2.0` (peerDep)
- `react-dom ^19.2.0` (peerDep)
- `@repo/core workspace:*` — only for `EventMap` types via `@repo/xai-web-event-bus`
- `@repo/plugin-web-tokens workspace:*` — `useI18n`, `Lang`
- `@repo/plugin-web-storage workspace:*` — `usePref`, `removePref`, `PREF_REGISTRY`, `WebPrefKey`
- `@repo/xai-web-event-bus workspace:*` — `emitWebEvent`
- `@repo/xai-web-shell workspace:*` — `WebModuleSlotRegistration`, `useWebShell`, `WebShellIconName`

DevDeps: `@repo/eslint-config`, `@repo/typescript-config`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `jsdom`.

## 10. References

- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map) + §S7 (event channels) + §S8 (no new storage keys)
- DESIGN.md: §4.12
- Source: `web design/module-settings.jsx` lines 23-100 (SettingsModule), 1039-1059 (atoms), 635-650 (Save/Reset)
- Peer: `packages/plugin-web-statistics/src/index.ts` (surface pattern)
- Event channel: `packages/core/src/types/events.ts` line 193
