# API — xai-web-settings-appearance

> Package barrel: `@repo/plugin-web-settings-appearance` (the only allowed import path)
> Source of truth for surface shape. Pane substitution composes with `paneRegistry` from `@repo/plugin-web-settings-shell` via `apps/web/src/routes/modules/settingsPaneComposition.ts`.

## 1. Types

```ts
// All four base unions come from @repo/plugin-web-tokens (re-exported for ergonomics).
export type { Lang, Theme, Density, BgTone, RailPos } from "@repo/plugin-web-tokens";

/** Pane props — frozen at `{ lang }` per chassis PaneRenderProps. */
export interface AppearancePaneProps {
  readonly lang: Lang;
}

/** Display option for the Background palette row. */
export interface BgToneOption {
  readonly id: BgTone;                  // 6 ids: default | cream | mist | lavender | peach | graphite
  readonly name: { readonly en: string; readonly zh: string };
  readonly hue: number;                 // co-applied to accentHue on click (source line 584)
}

/** Display option for the 6 hue-preset accent chips. */
export interface HuePreset {
  readonly id: string;                  // "sage" | "ocean" | "sunset" | "rose" | "violet" | "amber"
  readonly hue: number;                 // 0..360
  readonly name: { readonly en: string; readonly zh: string };
}

/** Display option for the rail-position picker. */
export interface RailPosOption {
  readonly id: RailPos;                 // "left" | "right" | "top" | "bottom"
  readonly label: { readonly en: string; readonly zh: string };
}

/** Frozen reset defaults — parity-tested against chassis defaults.ts. */
export interface AppearanceDefaults {
  readonly theme: Theme;          // "light"
  readonly density: Density;      // "comfortable"
  readonly fontScale: number;     // 1
  readonly accentHue: number;     // 165
  readonly railPos: RailPos;      // "left"
  readonly bgTone: BgTone;        // "default"
  // lang intentionally omitted — per-pane Reset does NOT touch language.
}
```

## 2. Constants

```ts
export const BG_TONES: readonly BgToneOption[];   // 6 entries — source lines 497-504
export const HUE_PRESETS: readonly HuePreset[];   // 6 entries — source lines 505-512
export const RAIL_POSITIONS: readonly RailPosOption[]; // 4 entries — source lines 599-604
export const appearanceDefaults: AppearanceDefaults;   // frozen — parity with chassis
```

All four objects use `Object.freeze` / `as const` to prevent runtime mutation.

## 3. Components

```ts
/** The Appearance pane. Mount under <SettingsModule> via the appearancePane registry entry. */
export function AppearancePane(props: AppearancePaneProps): React.ReactElement;
```

Behavioral contract:

- Subscribes via `usePref` to `xai_accent_hue` / `xai_rail_pos` / `xai_bg_tone`.
- Mirrors `theme` / `density` / `fontScale` from the DOM into local `useState` on mount:
  - `theme` ← `document.documentElement.getAttribute("data-theme") as Theme | null` (falls back to `appearanceDefaults.theme` if null).
  - `density` ← `document.documentElement.getAttribute("data-density") as Density | null` (falls back to `appearanceDefaults.density` if null).
  - `fontScale` ← `parseFloat(getComputedStyle(document.documentElement).fontSize) / 16` (falls back to `1` if NaN).
- Live binding on `onChange`:
  - Theme: `applyTheme(value)` + `emitWebEvent("web:settings:preference-changed", { key:"theme", value, changedAt })` + `setThemeLocal(value)`.
  - Density: `applyDensity(value)` + emit + `setDensityLocal(value)`.
  - FontScale: `applyFontScale(value)` + emit + `setFontScaleLocal(value)`.
  - AccentHue (slider OR preset): `setPref("xai_accent_hue", value)` + emit. App.tsx useEffect applies. NO direct `applyAccentHue` call (avoids double-apply race).
  - RailPos: `setPref("xai_rail_pos", value)` + emit. App.tsx useEffect applies.
  - BgTone: `setPref("xai_bg_tone", value)` + `setPref("xai_accent_hue", tone.hue)` + emit (bgTone) + emit (accentHue).
  - Lang: emit `{ key:"lang", value, changedAt }` only — no DOM apply, App.tsx setLang re-renders all consumers.
- Save: read current state for all 7 dims, emit 7 events with `changedAt: new Date().toISOString()`.
- Reset (`SettingsFooter onReset` override — chassis owns the confirm prompt; see M1 below):
  1. For accentHue/railPos/bgTone: call `removePref(key)`.
  2. For theme/density/fontScale: call `applyX(default)` + `setXLocal(default)` + emit at default.
  3. Lang NOT touched.

> **M1 (chassis owns confirm)**: `SettingsFooter.handleReset` (packages/plugin-web-settings-shell/src/SettingsFooter.tsx:85-96) already calls `confirmAction(message)` BEFORE invoking `onReset`. The pane's `onReset` therefore MUST NOT call its own confirm — doing so would double-prompt. This mirrors the row #23 precedent (`packages/xai-web-settings-features-panel/src/FeaturesPane.tsx:41-45` — `onReset={resetAllFeaturePrefs}` with no nested confirm). The chassis prompt text ("Reset every preference … clears saved theme, layout, and module toggles") is slightly misleading for a per-pane reset — documented as a known UX gap. Optional follow-up: extend `SettingsFooterProps` with a `confirmMessage?: { en; zh }` override (out of scope for this row — leave as TBD note in design.md §15).

## 4. Registry entry

```ts
export const appearancePane: Pane = {
  id: "appearance",
  icon: "sun",                               // valid WebShellIconName — matches chassis placeholder (packages/plugin-web-settings-shell/src/internal/paneRegistry.tsx:55).
                                             // The earlier `"type"` literal is NOT a member of the WebShellIconName union (packages/xai-web-shell/src/types.ts:21-43); using it would fail typecheck.
  i18nKey: "settings.appearance",
  render: ({ lang }) => <AppearancePane lang={lang} />,
};
```

## 5. Composition seam

`apps/web/src/routes/modules/settingsPaneComposition.ts` exists (created by row #23). This row appends ONE branch:

```ts
import { featuresPane } from "@repo/plugin-web-settings-features-panel";
import { appearancePane } from "@repo/plugin-web-settings-appearance";   // NEW
import { paneRegistry, type Pane } from "@repo/plugin-web-settings-shell";

export function composeSettingsPaneRegistry(): readonly Pane[] {
  return paneRegistry.map((p) => {
    if (p.id === "features") return featuresPane;
    if (p.id === "appearance") return appearancePane;   // NEW
    return p;
  });
}
```

Line-disjoint with row #24 (which appends additional branches for the 10 remaining placeholder panes).

## 6. App.tsx wiring (single anchor edit)

> **B2 (setter disposition)**: App.tsx lines 62-66 currently suppress FOUR setters via `void setX`: `setAccentHue`, `setRailPos`, `setBgTone`, **and** `setFontScale`. Naively replacing the block with a `useEffect` subscription that only references the 4 useState setters (`setTheme/setDensity/setFontScale/setLang`) would leave the 3 persisted setters (`setAccentHue/setRailPos/setBgTone`) unused → `@typescript-eslint/no-unused-vars` fails → `pnpm --filter @repo/web build` breaks. Plan must specify disposition.

**Selected disposition** (Option 1 from review — cleanest, matches row #23 precedent of trimming `usePref` destructure when setter is not needed locally):

1. **Drop the 3 persisted setters from the `usePref` destructure** at App.tsx lines 55-57. The pane writes to those keys via `setPref` directly through `usePref`'s shared registry; App.tsx only needs the READ value to feed its `applyX` useEffects (lines 72-74).
2. **Keep all 4 useState setters** (`setTheme`, `setDensity`, `setFontScale`, `setLang`) — all are referenced by the new subscription.
3. **Delete all 4 `void setX` lines** at App.tsx lines 62-66.

Final edit hunk (replace lines 55-66 of App.tsx — a contiguous 12-line block):

```ts
// ---- usePref state pieces (persisted) ------------------------------------
const [accentHue]      = usePref("xai_accent_hue");   // setter dropped — pane writes via setPref directly
const [railPos]        = usePref("xai_rail_pos");     // setter dropped — pane writes via setPref directly
const [bgToneRaw]      = usePref("xai_bg_tone");      // setter dropped — pane writes via setPref directly
// plugin-web-tokens BgTone is a strict subset of plugin-web-storage's BgTone
// (storage adds "sage" which tokens doesn't know yet). Cast to BgTone for apply*.
const bgTone: BgTone = bgToneRaw as BgTone;

// xai-web-settings-appearance row #22 — subscribe to live binding bus.
// AppearancePane emits web:settings:preference-changed on every onChange + on Save + on Reset.
// The 3 persisted dims (accentHue/railPos/bgTone) auto-rerender via usePref;
// the 4 useState dims (theme/density/fontScale/lang) need explicit setters here.
useEffect(() => {
  const off = onWebEvent("web:settings:preference-changed", (e) => {
    const d = e.detail;
    switch (d.key) {
      case "theme":     setTheme(d.value); break;
      case "density":   setDensity(d.value); break;
      case "fontScale": setFontScale(d.value); break;
      case "lang":      setLang(d.value); break;
      // accentHue / railPos / bgTone auto-rerender via usePref — no setter needed.
    }
  });
  return () => off();
}, []);
```

Adds one import at the existing event-bus import group:

```ts
import { onWebEvent } from "@repo/xai-web-event-bus";
```

This is the ONLY App.tsx edit by row #22. Line-disjoint with row #23's `modules` filter at lines 88-92. Touches:
- lines 55-57 (drop 3 setters from destructure)
- lines 62-66 (remove 4 `void setX` lines, replace with subscription useEffect)
- imports (add `onWebEvent` to existing `@repo/xai-web-event-bus` group)

Lint result post-edit: zero unused-vars warnings; build clean.

## 7. Event contracts

### 7.1 `web:settings:preference-changed`

Owner row per `packages/core/src/types/events.ts` line 192. Primary emitter is THIS row; chassis is a co-emitter via `SettingsFooter.onSave` and `resetAllPrefs()`.

Emit triggers (this row):
- **On each control's `onChange`**: one emit per change (live binding side-effect).
- **On Save**: 7 emits (one per dim) using current local + pref values.
- **On per-pane Reset**: 6 emits (theme/density/fontScale/accentHue/railPos/bgTone), `lang` excluded.

Payload (reuses existing `WebPreferenceChange & { changedAt: string }` shape):

```ts
{ key: WebPreferenceKey; value: <key-specific>; changedAt: string }  // ISO 8601
```

No payload field changes from row #21. No new event channels added.

**bgTone union mismatch (silent guarantee — see M3 from feature-review)**:
`WebPreferenceChange['bgTone']` (packages/core/src/types/events.ts:26) declares 7 ids — `default | sage | cream | mist | lavender | peach | graphite`. Storage `BgTone` (PREF_REGISTRY) also includes `"sage"`. The pane only ever writes the 6 canonical tokens-side ids defined in the `BG_TONES` constant (see §2 and storage table in §8) — `"sage"` is never emitted by this row. Subscribers that pattern-match on `"sage"` will receive a no-op branch (no harm). Frozen assumption 4 (design.md §2) is the canonical statement; this restatement is for breakpoint continuity at the API surface.

### 7.2 Subscriptions inside the pane

None. The pane is an emitter only.

## 8. Storage contract

NO new keys. This row claims first-class ownership over the existing 3 entries (already owned by `"xai-web-settings-appearance"` in registry.ts):

| Key | Codec | Default | Type union |
|-----|-------|---------|------------|
| `xai_accent_hue` | number | `165` | `number` (0..360 logical range) |
| `xai_rail_pos` | string | `"left"` | `RailPos` |
| `xai_bg_tone` | string | `"default"` | `BgTone` (storage + event union allow 7 ids incl. `"sage"`; pane only writes the 6 canonical tokens-side ids via `BG_TONES`) |

**bgTone 7-vs-6 union note (M3)**: The storage codec and the `WebPreferenceChange['bgTone']` discriminant both list 7 ids (`default | sage | cream | mist | lavender | peach | graphite`). The pane filters writes through the 6-id `BG_TONES` constant (`default | cream | mist | lavender | peach | graphite`) — `"sage"` is never emitted nor persisted by this row. The widened union is preserved for forward compatibility; the pane treats it as v1 over-spec.

Reset semantics: `removePref(key)` for all 3 → registry default takes over. (No special handling — uses the public `removePref` from `@repo/plugin-web-storage`.)

## 9. i18n keys (additions to `packages/plugin-web-tokens/src/i18n.ts`)

Existing keys already present (no additions needed): `settings.appearance`, `settings.language`, `settings.theme`, `settings.density`, `settings.font_scale`, `settings.light`, `settings.dark`, `settings.system`, `settings.comfortable`, `settings.compact`.

**Append in P1** under `en.settings` + `zh.settings`:

| Key | EN | ZH |
|-----|----|----|
| `accent_color` | "Accent color" | "主题色" |
| `accent_color_desc` | "Drives primary actions, links, active states" | "影响主操作色、链接、选中态" |
| `bg_palette` | "Background palette" | "背景调子" |
| `bg_palette_desc` | "Changes global background and panel tones" | "改变全局背景与面板色调" |
| `sidebar_position` | "Sidebar position" | "侧栏位置" |
| `sidebar_position_desc` | "Where the navigation rail appears" | "选择导航栏出现在哪个方向" |
| `font_scale_desc` | "Global type scale" | "全局缩放" |
| `language_desc` | "Interface language" | "界面语言" |
| `theme_desc` | "Light / Dark / System" | "浅色 / 深色 / 跟随系统" |
| `density_desc` | "Row height & card density" | "列表行高与卡片密度" |
| `reset_defaults` | "Reset to defaults" | "恢复默认" |
| `save_apply` | "Save & apply" | "保存生效" |
| `saved_flash` | "Saved" | "已保存" |
| `rail_left` | "Left" | "左侧" |
| `rail_right` | "Right" | "右侧" |
| `rail_top` | "Top" | "顶部" |
| `rail_bottom` | "Bottom (Dock)" | "底部" |
| `bg_default` | "Sage" | "鼠尾草" |
| `bg_cream` | "Cream" | "奶油" |
| `bg_mist` | "Mist" | "薄雾" |
| `bg_lavender` | "Lavender" | "薰衣草" |
| `bg_peach` | "Peach" | "蜜桃" |
| `bg_graphite` | "Graphite" | "石墨" |
| `hue_sage` | "Sage" | "鼠尾草" |
| `hue_ocean` | "Ocean" | "海洋" |
| `hue_sunset` | "Sunset" | "日落" |
| `hue_rose` | "Rose" | "玫瑰" |
| `hue_violet` | "Violet" | "紫罗兰" |
| `hue_amber` | "Amber" | "琥珀" |
| `reset_confirm` | "Reset Appearance settings to defaults? Language is not affected." | "确定恢复外观设置为默认值？语言不会被影响。" |

Append at the BOTTOM of each `settings` sub-object under a clearly labeled comment block:
`// ---- Appearance pane (§S8 — declared by xai-web-settings-appearance #22) ----`.

Line-disjoint with #23 (which appends `features_*` keys) and #24 (which will append other pane keys).

## 10. Behavioral contract

- All 7 dimensions live-bind on first `onChange` event — pane MUST NOT defer DOM mutation to Save (R1 from review).
- `Math.abs(currentHue - presetHue) < 3` matches the source's active-state tolerance for the 6 swatches.
- Bg-tone card click MUST also write `xai_accent_hue` (verbatim source line 584). Both writes happen in the same synchronous handler; both emits fire.
- Per-pane Reset wraps in `window.confirm` with bilingual prompt. If user cancels, NO state change, NO emit.
- Save button shows the chassis "Saved" flash for 1800ms — provided by `<SettingsFooter>` (chassis api.md §2.3 — `onSave` returns array, chassis emits each item, sets flash).
- `appearanceDefaults` matches chassis `defaults.ts` for the shared dims; parity is verified via the **public** `resetAllPrefs()` emit snapshot (see test.md §A1 + §E) — NOT via direct internal import (chassis `defaults.ts` is `@internal`).
- Per-pane Reset confirm is owned by the chassis `SettingsFooter.handleReset` — the pane does NOT call its own `confirmAction`. See §3 M1 note.

## 11. Error semantics

- `applyFontScale` may throw `RangeError` for non-finite. Pane clamps to `[0.85, 1.15]` BEFORE calling apply (`clampedScale = Math.max(0.85, Math.min(1.15, parseFloat(input.value)))`). NaN input → no-op + DEV `console.warn`.
- `applyAccentHue` may throw `RangeError` for non-finite. Pane clamps to `[0, 360]` and rounds.
- `removePref` failures (storage exception) caught in try/catch with DEV `console.warn`; Reset still proceeds for remaining keys.
- `emitWebEvent` is synchronous and no-op on missing subscribers — failure modes are not surfaced.
- Reset confirm: handled by chassis `SettingsFooter.handleReset` — the pane has no DI seam for `confirmAction`. Tests stub the chassis confirm path (jsdom `window.confirm`, or the chassis internal helper if exported) and verify abort vs. proceed paths.

## 12. Stability + versioning

- `AppearancePaneProps` is closed at `{ lang }` for v1 — adding fields requires SemVer bump + ADR.
- `BG_TONES` / `HUE_PRESETS` / `RAIL_POSITIONS` arrays are sourced from DESIGN.md — adding/removing entries requires DESIGN.md edit + ADR.
- `appearanceDefaults` is the cross-package source of truth for per-pane Reset; chassis `defaults.ts` MUST stay byte-identical for the 5 shared dims (parity test enforces).
- `appearancePane.id === "appearance"` is frozen (matches chassis `SettingsPaneId`).

## 13. Dependencies

- `react ^19.2.0` (peerDep)
- `react-dom ^19.2.0` (peerDep)
- `@repo/core workspace:*` — types only (EventMap)
- `@repo/plugin-web-tokens workspace:*` — useI18n, Lang/Theme/Density/BgTone/RailPos, applyX helpers
- `@repo/plugin-web-storage workspace:*` — usePref, setPref, removePref, PREF_REGISTRY (read for defaults parity test)
- `@repo/plugin-web-settings-shell workspace:*` — Toggle (not used; included for symmetry), SettingRow, SectionBlock, SettingsFooter, paneRegistry, Pane, PaneRenderProps
- `@repo/xai-web-event-bus workspace:*` — emitWebEvent, onWebEvent (the latter consumed by App.tsx edit)
- `@repo/xai-web-shell workspace:*` — WebShellIconName (type only)

DevDeps: `@repo/eslint-config`, `@repo/typescript-config`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `jsdom`.

## 14. References

- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S5 + §S7 + §S8
- Chassis: `packages/xai-web-settings-shell/docs/api.md` §1.3 (frozen PaneRenderProps), §2.3 (SettingsFooter), §5.1 (defaults parity)
- Sibling row #23: `packages/xai-web-settings-features-panel/docs/api.md` §3 (composition seam pattern)
- DESIGN.md §4.12 / §5 / §7 / §9.2
- Source: `web design/module-settings.jsx` lines 494-653 (AppearancePane)
- Event channel declaration: `packages/core/src/types/events.ts` lines 192-196
- Peer (registration pattern): `packages/plugin-web-statistics/src/registration.tsx`
