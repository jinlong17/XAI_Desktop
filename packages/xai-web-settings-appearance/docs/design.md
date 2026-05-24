# Design — xai-web-settings-appearance

> Decision snapshot for roadmap row #22 (W4b · Settings split).
> Source PRD: `web design/DESIGN.md` §4.12, §5, §7, §9.2
> Source code: `web design/module-settings.jsx` lines 494-653

---

## 0. Decision snapshot

- **Selected Option**: Option B — `usePref` direct for 3 persisted dims + `web:settings:preference-changed` event for the 4 useState-backed dims. No chassis `PaneRenderProps` extension. Pane substitution via sibling-extensible branch in `apps/web/src/routes/modules/settingsPaneComposition.ts`. App.tsx subscribes to the event for the useState dims.
- **Review doc**: `docs/reviews/xai-web-settings-appearance/20260523-discovery-review.md`
- **Review date**: 2026-05-23

## 1. What this package is

The Settings → Appearance pane for XAI Web Console. Replaces the placeholder `appearance` entry in `paneRegistry` exported by `@repo/plugin-web-settings-shell`. Owns the seven user-visible appearance dimensions (language / theme / density / accent hue / background tone / rail position / font scale) and binds them live to the global `apply*` DOM helpers shipped by `@repo/plugin-web-tokens`.

Ships:

- `<AppearancePane lang>` component (8 SettingRow sections + Reset button via shell `<SettingsFooter>`).
- `appearancePane: Pane` — substitute into the chassis pane registry.
- Pure helpers: `appearanceDefaults`, `BG_TONES`, `HUE_PRESETS`, `RAIL_POSITIONS` (consts), `webPreferenceChangeFromAccent(...)` factories.

This row introduces NO new storage keys — `xai_accent_hue` / `xai_rail_pos` / `xai_bg_tone` already exist in `PREF_REGISTRY` with `owner: "xai-web-settings-appearance"` (planted by row #21 setup for #22).

## 2. Frozen assumptions

1. 7 dimensions in scope: lang / theme / density / accentHue / bgTone / railPos / fontScale. Pet on/off is NOT here (owned by `xai-web-shell`).
2. Chassis `PaneRenderProps = { lang }` stays frozen — pane reads/writes via `usePref`, `emitWebEvent`, and `applyX` directly. No SemVer bump on row #21.
3. The 3 persisted keys (`xai_accent_hue`/`xai_rail_pos`/`xai_bg_tone`) are already in registry with the right owner — no new storage keys in this row.
4. `BgTone` canonical = tokens-side 6 ids (`default`/`cream`/`mist`/`lavender`/`peach`/`graphite`). The storage-side extra `"sage"` literal is treated as never-set v1 over-spec (App.tsx already casts).
5. The first BG_TONE option's `id` is "default" and displays as "Sage / 鼠尾草" — verbatim from source line 498.
6. Clicking a bg-tone card ALSO rewrites accentHue to the tone's `.hue` value (verbatim source line 584).
7. Hue swatch active-state: `Math.abs(accentHue - p.hue) < 3`.
8. Reset (per-pane button, NOT chassis-wide) reverts 6 dims to defaults — `lang` is intentionally NOT reset (matches source lines 636-639).
9. Save broadcasts ALL 7 dims via `web:settings:preference-changed` and shows the chassis "Saved" 1800ms flash.
10. Pane substitution composes via `composeSettingsPaneRegistry()` in `settingsPaneComposition.ts` (file created by row #23; this row appends ONE extra branch).
11. App.tsx subscribes to `web:settings:preference-changed` and routes the 4 useState dims (`lang`/`theme`/`density`/`fontScale`) to their respective setters. The 3 persisted dims auto-propagate via `usePref` (already in place at App.tsx lines 55-57).

## 3. Dependency overview

```
@repo/plugin-web-settings-appearance
├─ @repo/core (types only — EventMap)
├─ @repo/plugin-web-tokens (useI18n, Lang, Theme, Density, BgTone, RailPos, applyTheme, applyDensity, applyFontScale, applyAccentHue, applyBgTone, applyRailPos)
├─ @repo/plugin-web-storage (usePref, removePref, setPref, PREF_REGISTRY — read defaults)
├─ @repo/plugin-web-settings-shell (Toggle*, SettingRow, SectionBlock, SettingsFooter, paneRegistry, Pane, PaneRenderProps)
├─ @repo/xai-web-event-bus (emitWebEvent — to publish web:settings:preference-changed)
└─ @repo/xai-web-shell (WebShellIconName — for pane icon type only)
```

*Toggle is NOT used by this pane (no boolean fields); SettingRow + SectionBlock + SettingsFooter are.

No new top-level packages introduced. Honors ADR-0007 §S4 rule 9.

## 4. Public surface (target)

`packages/xai-web-settings-appearance/src/index.ts` (the only allowed entry):

- `AppearancePane({ lang })` — pane component (exported for tests; pane object wraps it).
- `appearancePane: Pane` — `{ id: "appearance", icon: "sun", i18nKey: "settings.appearance", render: ({ lang }) => <AppearancePane lang={lang} /> }`. (Icon `"sun"` is a valid `WebShellIconName` and matches the chassis placeholder in `packages/plugin-web-settings-shell/src/internal/paneRegistry.tsx:55`. The previously planned `"type"` literal is NOT a member of the union — see api.md §4 + test.md AC-REG-3.)
- `appearanceDefaults` — frozen constants object matching chassis `defaults.ts` (used by per-pane Reset; parity-tested).
- `BG_TONES`, `HUE_PRESETS`, `RAIL_POSITIONS` — frozen constant arrays sourced from `module-settings.jsx` lines 497-512, 599-604.
- Types: `AppearancePaneProps`, `BgToneOption`, `HuePreset`, `RailPosOption`.

## 5. Component map

```
AppearancePane (root)
├── SettingRow label="Language" desc="Interface language"
│   └── seg [English | 简体中文]               → setLang(...) + emit lang event + applyTheme? no (lang has no DOM apply)
├── SettingRow label="Theme" desc="Light / Dark / System"
│   └── theme-cards × 3 (light/dark/system)    → applyTheme(...) sync + emit theme event
├── SettingRow label="Density" desc="Row height & card density"
│   └── seg [Comfortable | Compact]            → applyDensity(...) sync + emit density event
├── SettingRow label="Accent color" desc="Drives primary actions, links, active states"
│   └── accent-pickers
│       ├── HUE_PRESETS × 6 swatches            → setAccentHue(p.hue) (usePref → applies via App.tsx useEffect)
│       └── accent-slider-row [preview | range 0..360 step 1 | "<deg>°"] → setAccentHue(...)
├── SettingRow label="Background palette" desc="Changes global background and panel tones"
│   └── BG_TONES × 6 cards (preview + label)    → setBgTone(t.id) + setAccentHue(t.hue) (verbatim source line 584)
├── SettingRow label="Sidebar position" desc="Where the navigation rail appears"
│   └── rail-pos-cards × 4 (preview mini-shell) → setRailPos(...)
├── SettingRow label="Font scale" desc="Global type scale"
│   └── slider-row [A | range 0.85..1.15 step 0.05 | A | "<pct>%"] → applyFontScale(...) sync + emit fontScale event
└── SettingsFooter
    ├── onSave: emit 7 web:settings:preference-changed (one per dim, current values)
    └── onReset: per-pane reset (6 dims; NOT lang) — see §7 Reset semantics
```

CSS port targets `web design/layout.css` rules: `.appearance-pane`, `.theme-cards`, `.theme-card`, `.theme-preview`, `.tp-*`, `.accent-pickers`, `.accent-swatches`, `.accent-sw`, `.accent-slider-row`, `.hue-slider`, `.bg-tones`, `.bg-tone-card`, `.bgt-*`, `.rail-pos-grid`, `.rail-pos-card`, `.rp-*`, `.slider-row`, `.seg`.

Imported once globally via `src/index.ts` side-effect (`import "./styles.css"`).

## 6. State model

| Dim | Read | Write | DOM apply (live) | Persist? | Reset target |
|-----|------|-------|------------------|----------|--------------|
| lang | prop from chassis | `emitWebEvent("web:settings:preference-changed", { key: "lang", value, changedAt })` | none (re-render only) | App.tsx useState (NOT persisted) | NOT reset by pane |
| theme | `useState` local mirror seeded from `data-theme` attribute | apply + emit | `applyTheme(value)` | App.tsx useState (NOT persisted) | "light" |
| density | `useState` local mirror seeded from `data-density` attribute | apply + emit | `applyDensity(value)` | App.tsx useState (NOT persisted) | "comfortable" |
| fontScale | `useState` local mirror seeded from `getComputedStyle(document.documentElement).fontSize / 16` | apply + emit | `applyFontScale(value)` | App.tsx useState (NOT persisted) | 1 |
| accentHue | `usePref("xai_accent_hue")` | `setPref(...)` (auto-applies via App.tsx useEffect, no manual apply needed) | App.tsx useEffect | persisted | 165 (registry default) |
| railPos | `usePref("xai_rail_pos")` | `setPref(...)` (auto-applies via App.tsx useEffect) | App.tsx useEffect | persisted | "left" (registry default) |
| bgTone | `usePref("xai_bg_tone")` | `setPref(...)` (auto-applies via App.tsx useEffect) | App.tsx useEffect | persisted | "default" (registry default) |

**Why `useState` for theme/density/fontScale instead of `usePref`?** App.tsx is the source of truth — it owns the 4 useState pieces. The pane CANNOT directly mutate App.tsx state. The pane therefore:
1. Maintains a LOCAL `useState` mirror seeded from the DOM (theme/density via attribute read, fontScale via computed style).
2. On change: calls `applyX(...)` synchronously (paint), updates the local mirror, emits `web:settings:preference-changed`.
3. App.tsx subscribes to that event and calls its own `setTheme/setDensity/setFontScale/setLang`. When App.tsx re-renders, its useEffect calls `applyX` again (idempotent — no flicker because the value is identical).

This is the same dual-write pattern documented in chassis api.md §5.1 NB.

## 7. Reset semantics (per-pane)

The pane's `SettingsFooter onReset` override (does NOT default to `resetAllPrefs()` — that's the chassis-wide reset; this is appearance-only):

1. `removePref("xai_accent_hue")`, `removePref("xai_rail_pos")`, `removePref("xai_bg_tone")` — registry defaults take over (165 / "left" / "default"). App.tsx auto-applies via existing useEffects.
2. Apply + emit defaults for the 3 useState dims that ARE reset:
   - `applyTheme("light")` + emit `{ key: "theme", value: "light", changedAt }`
   - `applyDensity("comfortable")` + emit `{ key: "density", value: "comfortable", changedAt }`
   - `applyFontScale(1)` + emit `{ key: "fontScale", value: 1, changedAt }`
3. Lang is NOT reset (verbatim source behavior — language is a Topbar-level dim).

**M1 — confirm is owned by chassis**: `SettingsFooter.handleReset` (packages/plugin-web-settings-shell/src/SettingsFooter.tsx:85-96) already calls `confirmAction(message)` BEFORE invoking `onReset`. The pane therefore passes `onReset={handleResetAppearance}` with NO nested `confirmAction` — mirrors row #23 precedent (`FeaturesPane.tsx:41-45` — `onReset={resetAllFeaturePrefs}`). The chassis prompt text ("Reset every preference … clears saved theme, layout, and module toggles") is slightly misleading for a per-pane reset; documented as a known UX gap. Optional follow-up: extend `SettingsFooterProps` with `confirmMessage?: { en; zh }` override (out of scope — see §15 TBD).

Consequence: `internal/confirmAction.ts` is REMOVED from the P1 file list. The pane no longer ships its own confirm helper. See dev_log.md Phase Plan.

## 8. Events

### 8.1 Emits

- `web:settings:preference-changed` — emitted on every `onChange` for each of the 7 dims, AND once-per-dim on Save (broadcast) AND on Reset (defaults). Payload uses the existing `WebPreferenceChange` union from `@repo/core/types/events.ts`.

### 8.2 Subscribes

- None within the pane. App.tsx subscribes (this row's only App.tsx edit).

## 9. App.tsx edit (single anchor)

> **B2 (setter disposition)**: App.tsx lines 62-66 currently suppress FOUR setters via `void setX` (`setAccentHue`, `setRailPos`, `setBgTone`, `setFontScale`). The new subscription references only the 4 useState setters (`setTheme/setDensity/setFontScale/setLang`); the 3 persisted setters (`setAccentHue/setRailPos/setBgTone`) become unused → would fail `@typescript-eslint/no-unused-vars`.
>
> **Resolution (chose Option 1 — drop from useState destructure)**: at App.tsx lines 55-57, change `const [accentHue, setAccentHue] = usePref(...)` to `const [accentHue] = usePref(...)` for all 3 persisted keys. App.tsx never writes them — only reads them for the `applyX` useEffects at lines 72-74. The pane writes via `setPref` directly through `usePref`'s shared registry. This matches the row #23 pattern of trimming the `usePref` destructure when the setter is not locally consumed.

**Replace lines 55-66 of App.tsx (contiguous 12-line block) with:**

```ts
// ---- usePref state pieces (persisted) ------------------------------------
const [accentHue]      = usePref("xai_accent_hue");   // setter dropped — pane writes via setPref
const [railPos]        = usePref("xai_rail_pos");     // setter dropped — pane writes via setPref
const [bgToneRaw]      = usePref("xai_bg_tone");      // setter dropped — pane writes via setPref
const bgTone: BgTone = bgToneRaw as BgTone;

// xai-web-settings-appearance row #22 — subscribe to live binding bus.
useEffect(() => {
  const off = onWebEvent("web:settings:preference-changed", (e) => {
    const d = e.detail;
    switch (d.key) {
      case "theme":     setTheme(d.value); break;
      case "density":   setDensity(d.value); break;
      case "fontScale": setFontScale(d.value); break;
      case "lang":      setLang(d.value); break;
      // accentHue / railPos / bgTone propagate via usePref auto-rerender — no setter needed.
    }
  });
  return () => off();
}, []);
```

Plus one import:

```ts
import { onWebEvent } from "@repo/xai-web-event-bus";
```

This is line-disjoint with row #23's edit (App.tsx lines 88-92 — `modules` filter) and is the ONLY App.tsx edit by row #22. Lint result: zero unused-vars warnings.

## 10. JSX → TSX port rules (ADR-0007 §S5)

| Rule | Action |
|------|--------|
| R1 strict typing | All dim values typed via existing exported unions (`Lang`, `Theme`, `Density`, `BgTone`, `RailPos`) |
| R2 no `any` | `@typescript-eslint/no-explicit-any: error` |
| R3 explicit return types | `AppearancePane(): React.ReactElement` |
| R4 props typed | `AppearancePaneProps` in `src/types.ts` |
| R5 hooks typed | All `useState`/`usePref` instantiations carry concrete generics |
| R6 strict tsconfig | extends `@repo/typescript-config/react-library.json` |
| R7 prefer const | source `let` removed |
| R8 no DOM globals leak | n/a for this pane — Reset confirm is owned by chassis `SettingsFooter.handleReset` (M1). The pane has no `confirmAction` helper; tests stub the chassis confirm path. |
| R9 events typed | Range `onChange` typed `React.ChangeEvent<HTMLInputElement>` |
| R10 i18n pure-fn | All bilingual strings via `useI18n(lang).s(path)` — no `lang === "zh" ? ... : ...` ternaries leak into JSX. Where keys are missing in tokens i18n, append in P1. |

## 11. Phase plan summary (full detail in `dev_log.md`)

2 phases. Each phase commits independently; lint clean per commit.

| Phase | Scope | Acceptance |
|-------|-------|------------|
| P1 | Package scaffolding (`package.json`, `tsconfig.json`, `manifest.json`, `eslint.config.js`, `vitest.config.ts`, `vitest.setup.ts`) + `types.ts` + constants (`BG_TONES`/`HUE_PRESETS`/`RAIL_POSITIONS`/`appearanceDefaults`) + `<AppearancePane>` + CSS port + `appearancePane` registry object + unit tests (24+ ACs); append `i18n.ts` keys missing from tokens for the 6 BG_TONES + 6 HUE_PRESETS labels + a few extra ("accent" / "background_palette" / "sidebar_position" / "reset_defaults" / "save_apply") | `pnpm --filter @repo/plugin-web-settings-appearance lint test typecheck` exits 0 |
| P2 | Host wiring — extend `apps/web/src/routes/modules/settingsPaneComposition.ts` (one branch), App.tsx subscription edit (replace `void setX` block), `apps/web/package.json` dep add, `docs/PLUGIN_MAP.md` row append, integration test (App.tsx + pane round-trip), `manifest.json` if needed | `pnpm --filter @repo/web build` passes; clicking each control live-updates DOM; Save broadcasts 7 events; Reset reverts 6 dims |

P3 contingency: if SettingsFooter chassis cannot pipe `onReset` override at v1 (TBD — chassis api.md §2.3 says `onReset?` exists), we split out a P3 to add the override. Initial reading of api.md §2.3 confirms `onReset?` exists → 2 phases is the planned outcome.

## 12. Risk overview

(Mirrors discovery-review §8 — re-stated for breakpoint continuity.)

- R1 — Live-binding double path (apply sync + emit): mitigated by calling `applyX` synchronously then emitting; idempotent re-apply on App.tsx re-render.
- R2 — App.tsx single anchor edit at lines 62-66 — line-disjoint with siblings.
- R3 — bg-tone click rewrites accentHue (verbatim source).
- R4 — Reset of lang excluded (verbatim source).
- R5 — No new `xai_pref_appearance_*` keys (seed brief reference resolved to existing 3 keys).
- R6 — Co-emitter with chassis on same event channel (synchronous, identical shape, no race).
- R7 — Reset defaults parity with chassis defaults.ts (unit-tested in P1).

## 14. Revise pass changes (2026-05-23)

Applied in response to feature-review REVISE verdict (dev_log.md Review Notes block):

- **B1 — icon literal**: `appearancePane.icon` flipped from invalid `"type"` to valid `"sun"` (chassis placeholder). Mirrors §4 of api.md and AC-REG-3 of test.md.
- **B2 — App.tsx setter disposition**: dropped `setAccentHue`/`setRailPos`/`setBgTone` from `usePref` destructure (Option 1 — clean, no lingering `void setX` lines). Kept all 4 useState setters used by the subscription. See §9 above.
- **M1 — chassis owns Reset confirm**: removed pane-level `confirmAction`; `internal/confirmAction.ts` dropped from P1 file list. Mirrors row #23 pattern.
- **M2 — defaults parity test**: rewritten as a snapshot of chassis `resetAllPrefs()` emit set; no direct internal import. See test.md §A1 + §E.
- **M3 — bgTone 7-vs-6 union note**: documented in api.md §7 + §8.

## 15. TBD / optional follow-ups

- Extend `SettingsFooterProps` with a `confirmMessage?: { en; zh }` override so per-pane Reset can supply its own prompt instead of the chassis-wide one. NOT a blocker for row #22 (the chassis text is suboptimal but technically accurate that everything in this pane is reset). Out of scope for W4b row #22; track for a future chassis SemVer minor.
- Cross-vendor verify (Codex / Cursor real-browser pass) deferred to ship-time per W4b Parallel-Agent manifest header — same-vendor (Claude Opus) verify gates `READY_FOR_VERIFY`.

## 16. References

- Source: `web design/module-settings.jsx` lines 494-653
- Spec: `web design/DESIGN.md` §4.12, §5, §7, §9.2
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S7 / §S8
- Chassis: `packages/xai-web-settings-shell/docs/{design,api,test}.md`
- Sibling row #23 (precedent): `packages/xai-web-settings-features-panel/docs/{design,api,test}.md`
- Event channel declaration (this row's primary emit target): `packages/core/src/types/events.ts` lines 192-196
- DOM apply helpers: `packages/plugin-web-tokens/src/apply.ts`
- Storage registry (3 appearance keys already owned by this row): `packages/plugin-web-storage/src/internal/registry.ts` lines 140-165
- Host wiring entry points: `apps/web/src/App.tsx` + `apps/web/src/routes/modules/settingsPaneComposition.ts` (created by row #23)
