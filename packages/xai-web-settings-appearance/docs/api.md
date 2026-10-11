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

// ---- CP-APPEARANCE-01 (additive) ----------------------------------------
export type AppearanceFieldId = "lang" | "theme" | "density" | "accentHue" | "bgTone" | "railPos" | "fontScale";
/** Display values: the latest intent while a draft exists, else the strictly validated stored value, else the default. */
export interface AppearanceValues { lang; theme; density; accentHue: number; bgTone; railPos; fontScale: number }
export type AppearanceFieldState = "clean" | "saving" | "resetting" | "not-saved" | "not-reset" | "unavailable";
export type AppearanceStatusLine =
  | { kind: "none" } | { kind: "retrying" } | { kind: "export-failed" }
  | { kind: "not-saved"; count: number } | { kind: "saved" } | { kind: "restored" };
export interface AppearanceController { /* see §15 */ }
export interface AppearanceProviderProps { readonly controller: AppearanceController; readonly children?: ReactNode }
export interface AppearanceStatusProps { readonly onReview: () => void }
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

Behavioral contract (CP-APPEARANCE-01; contract `docs/reviews/web-appearance-recovery-contract/contract.md` r3):

- The pane is a **view of the App-scoped Appearance controller** (§15). Inside `<AppearanceProvider>` it uses the provided controller; a standalone `<AppearancePane lang>` without a provider owns its own controller, so the package stays usable and testable alone. In the production App there is exactly one controller.
- **Display values** come from the controller: the latest intent while a draft exists, otherwise the strictly validated stored bytes, otherwise the default. A fresh load therefore shows the stored theme, density and font scale (no DOM mirrors), consistent with what `<html>` applies.
- **Autosave on every change, applied immediately** on both surfaces (pane and Topbar): the `active` classes, `aria-selected`, slider values, `<html>` attributes and inline style, and for language every string. Controls stay enabled while a write is pending.
  - Theme / Density / Language / Sidebar position: closure-bound values → `controller.setTheme` / `setDensity` / `setLang` / `setRailPos`.
  - Accent (preset or slider): today's clamp and rounding `Math.max(0, Math.min(360, Math.round(v)))`, then `controller.setAccentHue`; a non-finite result is ignored.
  - Font scale slider: today's clamp `Math.max(0.85, Math.min(1.15, v))`, then `controller.setFontScale`; a non-finite result is ignored.
  - Background tone: `controller.chooseBgTone(tone, hue)` — two intents in one handler, the tone then its hue as the accent; they settle independently.
- **Field-local recovery** directly below each row (`[data-appearance-recovery="<fieldId>"]`): pending → "<Label> is saving." / "<Label> is being reset to its default."; settled failure → "<Label> was not saved." / "<Label> was not reset to its default." with **Retry** and **Discard**; invalid or unreadable stored bytes → "Saved <Label> is unavailable. Reload it; this is not a new unsaved change." with **Reload** only. Accessible names: `Retry <Label>`, `Discard <Label>`, `Reload <Label>` (ZH `重试 …`, `放弃 …`, `重新读取 …`).
- **Pane-local bottom action area** (no `SettingsFooter`): the status line (`data-testid="appearance-status-line"`, `role="status"`, always rendered), **Retry all** (`data-testid="appearance-retry-all"`, always rendered, first at the inline start), **Export Appearance draft** and **Discard all changes** (only while drafts exist), then **Reset to defaults** (`data-testid="appearance-reset-defaults"`) on its own line. Normal flow, start-aligned, wrapping; never sticky or fixed.
- **Reset to defaults** asks `window.confirm` with the truthful text ("Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.") before any intent exists; declining touches nothing. Accepting removes exactly six keys by verified removal (§15.4); language is never read, written or removed.
- **Keyboard continuity**: after Discard or Reload focus lands on the field's selected control (or its slider); a recovery block that unmounts while focused returns focus there; after Discard all focus goes to Reset to defaults; Retry all keeps focus in every transition.
- The pane emits no `web:settings:preference-changed`, dispatches no `StorageEvent`, and registers **no Settings route guard** (`appearancePane.render` still forwards only `lang`).

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

## 6. App.tsx wiring (CP-APPEARANCE-01)

`apps/web/src/App.tsx` creates the **one** App-scoped controller and provides it; it owns no Appearance state of its own any more.

- `AppInner` (inside `AccountStorageGate`, so a scope change remounts the controller with the committed bytes — REL-09) calls `useAppearanceController()` once and wraps its tree in `<AppearanceProvider controller={appearance}>`. `App()` itself is unchanged.
- Display values feed `WebShellProvider` (`lang`, `railPos`), `Shell` (`lang`, `theme`, `density`), `PremiumTierBadge` and `DesktopPet` (`lang`).
- The controller's edits are the Topbar's existing setters: `setLang={appearance.setLang}`, `setTheme={appearance.setTheme}`, `setDensity={appearance.setDensity}` (types unchanged).
- `appearanceStatus={<AppearanceStatus onReview={reviewAppearance} />}` goes through the shell's optional slot; `reviewAppearance` emits `web:shell:module-change` `{ moduleId: "settings", source: "shortcut" }` (as Shell does for Settings) and then `navigate("/app/settings/appearance")` once.
- `handleSignOut` awaits `appearance.confirmSignOut()` immediately before each `requestSettingsDeparture("sign-out")` (coordinator branch and fallback branch); the existing re-checks after the awaits are unchanged.
- Retired from App: `writeLocalPref`, the `web:settings:preference-changed` subscriber, the root `useState`s, the three legacy `usePref` reads and the `apply*` / media-query effects (the controller applies the display values). `readLocalPref` stays exported and byte-identical.

## 7. Event contracts

### 7.1 `web:settings:preference-changed` — retired for these fields

The pane emits nothing and App subscribes to nothing. The event type stays declared in `@repo/core` (and `SettingsFooter` / `resetAllPrefs` keep their own emitters, which no production pane mounts or calls). Retry all, Discard, Reload, Reset, Export and the sign-out step broadcast nothing either: zero `StorageEvent` dispatches and zero preference-changed events.

### 7.2 `web:shell:module-change`

Emitted once by App's review callback when the Topbar status is activated (`source: "shortcut"`), immediately before the navigation.

### 7.3 Subscriptions

None in the pane. The controller's engine bindings follow same-tab publications and cross-document `storage` events for the seven keys, so an idle field updates live; a drafted field receiving another document's commit becomes a preserved conflict.

## 8. Storage contract

NO new keys, codecs, registry entries, ownership or lifecycle changes. The seven unscoped **device** keys, bound through `usePrefAutosaveAsync` with strict caller-side validators (the engine refuses invalid sources before both set and reset):

| Field | Key | Binding | Exact bytes | Strict domain | Default |
|-------|-----|---------|-------------|---------------|---------|
| `lang` | `xai_pref_lang` | open-ended suffix `"lang"`, `json` | `"en"`, `"zh"` | `en`, `zh` | `"en"` |
| `theme` | `xai_pref_theme` | suffix `"theme"`, `json` | `"light"`, `"dark"`, `"system"` | those 3 | `"light"` |
| `density` | `xai_pref_density` | suffix `"density"`, `json` | `"comfortable"`, `"compact"` | those 2 | `"comfortable"` |
| `fontScale` | `xai_pref_font_scale` | suffix `"font_scale"`, `json` | `JSON.stringify(v)` | finite, 0.85 ≤ v ≤ 1.15 | `1` |
| `accentHue` | `xai_accent_hue` | registered, `number` | `String(n)` | integer, 0 ≤ n ≤ 360 | `165` |
| `railPos` | `xai_rail_pos` | registered, `string` | raw | `left`, `right`, `top`, `bottom` | `"left"` |
| `bgTone` | `xai_bg_tone` | registered, `string` | raw | `default`, `cream`, `mist`, `lavender`, `peach`, `graphite` (storage's widened `"sage"` is outside the domain) | `"default"` |

- Every write and removal takes the per-key Web Lock `prefMutationLockName(<key>)` with an exact expected baseline and readback; without `navigator.locks` every write is refused and reported, never written unfenced.
- Invalid or unreadable bytes display and apply the default, never throw, show a Reload-only source alert and are never rewritten, purged or normalized; a valid edit over them is a failed draft (REL-07).
- Reset to defaults removes six keys by verified removal (an absent key completes as the engine's verified no-op); `xai_pref_lang` is never touched.
- Readers outside the package (`readLocalPref`, `NotFoundPage`, `AccountStorageGate`) read the same bytes as before.

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

- All 7 dimensions apply on the first change event (no deferral): the controller applies display values to `<html>` (`applyTheme`, `applyDensity`, `applyFontScale`, `applyAccentHue`, `applyBgTone`, `applyRailPos`, plus the `system` media-query listener) in layout effects.
- `Math.abs(currentHue - presetHue) < 3` matches the source's active-state tolerance for the 6 swatches.
- A bg-tone card click also writes `xai_accent_hue` (verbatim source line 584): two intents in one synchronous handler, settling independently.
- Autosave: every change persists immediately; nothing waits for a button. There is no "Save & apply" and no unconditional "Saved" flash; "Appearance settings saved." / "Defaults restored." appear only after a genuine verified completion while the pane is mounted and nothing is pending, failed or source-invalid.
- Reset to defaults: pane-local, truthful `window.confirm`, six verified removals, language kept; declining makes zero storage attempts and no state change.
- `appearanceDefaults` matches chassis `defaults.ts` for the shared dims; parity is verified via the **public** `resetAllPrefs()` emit snapshot (see test.md §A1 + §E) — NOT via direct internal import (chassis `defaults.ts` is `@internal`).

## 11. Error semantics

- Writes never throw to the UI: quota, a throwing `getItem`/`setItem`/`removeItem`, a missing or rejected Web Lock, a conflict or readback uncertainty all keep the latest choice displayed and applied with "was not saved" / "was not reset to its default" feedback, Retry, Discard, the Topbar status and the unload warning. Uncertainty keeps the engine's grant and reconciles with one total write or removal; a conflict is never overwritten.
- Malformed or unreadable stored bytes (for example `xai_pref_lang` `"fr"`, `"EN"`, `null`; `xai_pref_font_scale` `0`, `"1"`; `xai_accent_hue` `Infinity`, `12.5`; `xai_rail_pos` `diagonal`; `xai_bg_tone` `sage`) never reach `useI18n`, `applyFontScale` or `applyAccentHue`: the default is displayed and applied, so no `/app` route crashes, including for a value written by another document while the App runs.
- Range inputs keep today's clamp and rounding; a non-finite result is ignored (no operation, no message).
- Export failures (Blob, object URL, append or click) show "Export failed. Please retry." while a draft exists and keep every draft; the anchor is removed and the URL revoked best-effort.

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
- `@repo/plugin-web-storage workspace:*` — `usePrefAutosaveAsync` (the accepted async engine), `prefMutationLockName` (tests), `PREF_REGISTRY` (read for defaults parity test)
- `@repo/plugin-web-settings-shell workspace:*` — SettingRow, Pane, PaneRenderProps (the pane no longer mounts the shared settings footer)
- `@repo/xai-web-event-bus workspace:*` — tests only (the pane emits nothing)
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

## 15. App-scoped controller, protection and Retry all (CP-APPEARANCE-01)

Contract: `docs/reviews/web-appearance-recovery-contract/contract.md` r3 (A2–A7, §5–§8). Public surface (additive):

```ts
export function useAppearanceController(): AppearanceController;          // call once per owner
export function AppearanceProvider(props: AppearanceProviderProps): React.ReactElement; // provides it
export function AppearanceStatus(props: AppearanceStatusProps): React.ReactElement | null; // Topbar status

export interface AppearanceController {
  readonly values: AppearanceValues;                     // display values (§3)
  readonly fieldStates: Readonly<Record<AppearanceFieldId, AppearanceFieldState>>;
  readonly hasDraft: boolean;                            // pending or unresolved set/reset drafts
  readonly unsavedCount: number;                         // |E|
  readonly retryAllEnabled: boolean;                     // E is non-empty
  readonly passOpen: boolean;
  readonly statusLine: AppearanceStatusLine;
  setLang; setTheme; setDensity; setAccentHue; setRailPos; setFontScale; chooseBgTone(tone, hue);
  retry(field); discard(field); reload(field); discardAll(); retryAll(); exportDraft();
  resetToDefaults(confirmReset: () => boolean);
  confirmSignOut(): Promise<boolean>;
  attachPane(): () => void;
}
```

### 15.1 One controller, two views

- App creates it once inside `AccountStorageGate`; the Settings pane and the Topbar quick switcher are its views, so a pane edit is visible in the Topbar (and vice versa) in the same render. A standalone pane owns its own controller.
- Drafts live as long as the controller: they survive route changes, Settings pane switches, the popover and pane unmount/remount. A scope change remounts App and drops in-memory drafts (REL-09); the remount shows the committed bytes with no saved claim.
- The seven bindings are created in a fixed hook order. Every valid edit becomes the field's **exact draft object**; only that object may settle the field (verified bytes, verified absence or the engine's verified no-op). An older completion never makes a newer intent look saved, and the engine's conflict settlement of superseded queued sets never surfaces as a failure of the latest intent. Late completions after Discard, Discard all, sign-out OK or unmount change nothing.

### 15.2 Protection (no route guard)

- **No Settings route guard**: the pane registers none; sidebar, AppRail, Back/Forward and programmatic navigation are never held by Appearance drafts.
- **Topbar status** (`data-testid="appearance-status"`): rendered through the shell's optional `appearanceStatus` slot immediately after `premiumBadge`; a ≥44×44 button named "Appearance changes not saved. Review them in Settings." (ZH "外观更改未保存，前往设置查看。") with the visible text "Not saved" / "未保存" where the Topbar summary is visible and icon-only below 768 px. It renders nothing unless E is non-empty (a merely pending field never renders it). Activation calls the host's review callback exactly once; it never touches storage and never retries.
- **`beforeunload`**: registered only while a draft exists (pending or unresolved, set or reset); the handler cancels the event with zero storage attempts; removed when the drafts clear and on unmount.
- **Sign-out step** (`confirmSignOut`): no drafts → resolves `true` with zero `window.confirm` and zero storage attempts; drafts → one `window.confirm` ("Some appearance changes are not saved. Sign out and discard them?" / ZH "部分外观更改尚未保存。仍要退出并放弃这些更改吗？"). Cancel resolves `false` and keeps drafts, status and warning; OK discards every draft with zero set/remove attempts and resolves `true`. App awaits it immediately before each `requestSettingsDeparture("sign-out")`.

### 15.3 Retry all (product-owner decision A2)

- **E** = fields whose draft is settled unsuccessful: an actual set or reset draft, nothing for it in flight or runnable, and its queue held by a failed request (quota, a throwing storage call, a missing or rejected Web Lock, conflict, readback uncertainty, an invalid or unavailable source), including a latest intent queued behind a failed predecessor. Pending fields, source-only fields and fields without a draft are never in E.
- **Always rendered** (`data-testid="appearance-retry-all"`, a native `<button type="button">`, label "Retry all" / "全部重试" in every state). **Enabled iff E is non-empty**; otherwise `aria-disabled="true"` — never the native `disabled` attribute — so it stays focusable, a Tab stop, and focus never drops to `<body>` when a pass disables it. Activation while disabled is inert (E is derived live at activation). `aria-describedby` points to the status line only while the button is enabled or a pass is open.
- **One activation = one pass**: each member's per-field Retry runs exactly once, in display order (Language, Theme, Density, Accent color, Background palette, Sidebar position, Font scale), before any settlement — one write (set) or one removal (reset) per member and none elsewhere. A reset draft is only ever retried as its own removal. A member queued behind a failed predecessor re-runs the predecessor once, then its own request proceeds as its own first attempt (the inherited Features follow-up 2 ordering is kept). A second activation, a per-field Retry or a Retry all while members are pending adds zero attempts.
- **Outcomes per member**: succeeded, failed again, superseded (pane edit, Topbar edit, background choice, Reset) or detached (Discard, Discard all, sign-out OK, disposal). Only succeeded and failed count.
- **Status line** (first matching rule): pass open → "Retrying unsaved appearance changes…"; a failed Export while a draft exists → "Export failed. Please retry."; E non-empty → "1 appearance change is not saved." / "<n> appearance changes are not saved." (ZH "<n> 项外观更改未保存。"); otherwise the success rules ("Defaults restored." when every succeeded member of a just-settled pass was a reset of the current batch, "Appearance settings saved." otherwise); otherwise empty. Never a success line while anything is pending, failed or source-invalid, and no success claim for a completion while no pane is mounted.
- **Disabled look**: one neutral rule set (colours and cursor only) under `.appearance-pane`: `--bg-panel-2` background, `--border-1` border, `--text-3` label (≥ 3.79:1 in both themes with every tone), `cursor: not-allowed`; same box as the enabled `.btn.primary` (1px border, ≥ 44×44), accent-independent, `pointer-events` unchanged, the global focus ring untouched.

### 15.4 Reset to defaults and export

- Reset admits six typed reset intents and one batch identity synchronously after the confirmation; each uses the binding's `reset()` (verified removal; an absent key is a verified no-op). No rollback, no all-or-nothing promise, no account gate. A duplicate Reset while a batch is pending enqueues no duplicate removal (failed items re-attempt their own removal once). An invalid or unreadable source refuses the reset and keeps the intent; Reset never purges malformed bytes.
- `exportDraft()` downloads `appearance-draft.json` from memory only (zero storage attempts) with the set/reset envelope `{"version":1,"kind":"appearance-draft","changes":{"device":{"<field>":{"operation":"set","value":…}|{"operation":"reset"}}}}` — each field at most once as its latest unresolved intent; never saved, default or source-only fields. Liveness is rechecked before setup, after Blob creation, after URL creation and after append; an unmount during setup cancels the click.
