# Discovery Review — xai-web-settings-appearance (W4b · roadmap row #22)

> Authored by: feature-plan (Claude Opus 4.7 · 1M)
> Date: 2026-05-23
> Seed: `docs/reviews/xai-web-settings-appearance/20260523-roadmap-seed.md`
> Source PRD: `web design/DESIGN.md` §4.12 (Appearance pane), §5 (Tokens), §7 (Personalization), §9.2 (storage keys)
> Source code: `web design/module-settings.jsx` lines 494-653 (`AppearancePane`)
> Authority anchor: ADR-0007 §S4 (port map), §S5 (TSX rules), §S7 (event channels), §S8 (storage)
> Sibling concurrent rows in W4b: #23 features-panel (READY_TO_SHIP), #24 settings-rest (planning in parallel)

---

## 1. Problem framing

`@repo/plugin-web-settings-shell` (row #21, in-dev) ships the 13-pane chassis but every pane is still a placeholder. Row #22 must REPLACE the `appearance` placeholder with the real Appearance pane — the single most user-visible Settings surface in DESIGN.md — and provide the **live binding loop** between user interaction and the global `apply*` DOM helpers.

The Appearance pane must surface seven dimensions, all live-bound:

| Dim | UI control | Source state owner | DOM channel |
|-----|-----------|--------------------|-------------|
| Language | `<seg>` 2-button (EN / 简体中文) | `App.tsx::useState<Lang>` | re-render via `lang` prop |
| Theme | 3 preview-card buttons (Light / Dark / System) | `App.tsx::useState<Theme>` | `applyTheme()` → `data-theme` on `<html>` |
| Density | `<seg>` 2-button | `App.tsx::useState<Density>` | `applyDensity()` → `data-density` |
| Accent color | 6 swatch preset + 0..360 hue slider | `App.tsx::usePref("xai_accent_hue")` | `applyAccentHue()` → inline `--accent-hue` |
| Background tone | 6 preview-card buttons (default/cream/mist/lavender/peach/graphite) | `App.tsx::usePref("xai_bg_tone")` | `applyBgTone()` → `data-bg-tone` (removes when `default`) |
| Rail position | 4 preview-card buttons (left/right/top/bottom) | `App.tsx::usePref("xai_rail_pos")` | `applyRailPos()` → `data-rail-pos` |
| Font scale | 85..115% slider | `App.tsx::useState<number>` (`fontScale`) | `applyFontScale()` → inline `font-size` |

The seed brief's hard constraints:

1. Every control is **live-bound** (moves the DOM on input, not on Save).
2. Save persists to `xai_accent_hue` / `xai_rail_pos` / `xai_bg_tone` / `xai_pref_*` per DESIGN.md §9.2 — **all three primary keys already exist in `PREF_REGISTRY` with `owner: "xai-web-settings-appearance"`** (registry.ts lines 140-165, planted by row #21 setup for #22).
3. The Rail-position picker must render 4 mini-layout previews.
4. Reset reverts every Appearance pref to defaults declared in DESIGN.md §5/§7.
5. Bilingual via `useI18n`.
6. Cross-module updates via `@repo/xai-web-event-bus` (`web:settings:preference-changed`).
7. 2-3 phases.

Authority anchor (per seed): the user override 2026-05-23 SUPERSEDES prior PRDs where they conflict. DESIGN.md §4.12/§5/§7 + module-settings.jsx are the new source of truth.

## 2. No external research required

This is purely an internal port from the in-repo source PRD + JSX onto packages already shipped in W0/W1 (`@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/plugin-web-settings-shell`, `@repo/xai-web-event-bus`). No new libraries, no upstream selection decisions, no external research warranted.

## 3. Candidate options

### Option A — Reuse shell atoms + read App.tsx state directly via PaneRenderProps subset, write back via setters threaded through shell

- `<AppearancePane>` receives all 7 (lang/theme/density/fontScale/accentHue/railPos/bgTone) values + their setters as props.
- Requires extending `PaneRenderProps` from `{ lang }` to `{ lang, setLang, theme, setTheme, density, setDensity, fontScale, setFontScale, accentHue, setAccentHue, railPos, setRailPos, bgTone, setBgTone }`.
- Chassis must thread those 14 fields through.
- **Pros**: Mirrors `module-settings.jsx` lines 78-86 prop signature exactly.
- **Cons**: BREAKS chassis api.md §1.3 explicit freeze: "Frozen at v1 to `{ lang }` only. Sibling rows MUST read additional state … via `usePref` directly. Adding fields = SemVer bump + ADR." Rejected per chassis contract.

### Option B — Read `usePref` directly inside pane for persisted dims; subscribe to App.tsx state for `useState` dims via event bus

- For the **3 persisted dims** (`accentHue`/`railPos`/`bgTone`), pane calls `usePref` directly (registry keys already owned by `xai-web-settings-appearance`). Setting via `setPref` re-renders App.tsx through the same-tab storage bus → `applyAccentHue/applyBgTone/applyRailPos` fire automatically (no event-bus emit needed for the live binding).
- For the **4 useState-backed dims** (`lang`/`theme`/`density`/`fontScale`), App.tsx subscribes to `web:settings:preference-changed`; the pane EMITS that event with the new value and ALSO calls `apply*` directly to keep the UI in sync for the same render cycle (mirrors the chassis api.md §5.1 reset contract).
- Save = emit one event per changed dim + flash "Saved" 1800ms. Reset = `setPref` defaults for the 3 keys + emit defaults for the 4 useState dims.
- **Pros**: Honors the chassis frozen `{ lang }`-only `PaneRenderProps`. Same event-bus channel for cross-module live updates. Uses already-shipped `applyAccentHue/applyBgTone/applyRailPos`. Minimal App.tsx edit (just a subscription). The 4 `void setX` lines in App.tsx (lines 62-66 today) become legitimate listeners.
- **Cons**: App.tsx needs a subscription block (one anchor edit by row #22).

### Option C — Write the pane against a new "appearance state ref" module-level singleton

- Hoist all 7 dims into a singleton store (Zustand/Jotai or hand-rolled).
- **Pros**: Cleanest decoupling.
- **Cons**: Introduces a new infra layer rejected by ADR-0007 §S4 rule 9 (no new top-level packages). Out of scope.

## 4. Recommendation — Option B

Rationale:

- Honors chassis `PaneRenderProps = { lang }` freeze (no SemVer bump on shell row).
- The 3 persisted dims (`xai_accent_hue` / `xai_rail_pos` / `xai_bg_tone`) already have `owner: "xai-web-settings-appearance"` in `PREF_REGISTRY` — fits naturally.
- Live-binding is satisfied via two paths:
  1. **Persisted dims** — `usePref` re-render in App.tsx → `applyAccentHue/applyBgTone/applyRailPos` already in App.tsx useEffects.
  2. **useState dims** — pane calls `apply*` synchronously in `onChange` (paints the DOM immediately) AND emits the typed event (App.tsx subscribes to `web:settings:preference-changed` and calls `setTheme/setDensity/setFontScale/setLang` on receipt).
- The Save UX is preserved: clicking Save broadcasts the 4 useState-backed dims through the event bus (the 3 persisted dims already are saved). Save is therefore semantic "broadcast my current local state to subscribers + flash 'Saved'" — perfect alignment with chassis `SettingsFooter` (api.md §2.3).
- Reset reverts all 7 dims to defaults via two paths:
  - `removePref("xai_accent_hue" | "xai_rail_pos" | "xai_bg_tone")` (registry-derived defaults: 165 / "left" / "default").
  - Emit `web:settings:preference-changed` for each of lang/theme/density/fontScale at the defaults declared in chassis api.md §5.1 (en / light / comfortable / 1).
- One small App.tsx edit: replace the existing 4 `void setX` lines with a `web:settings:preference-changed` subscription that calls the appropriate setter.
- Line-disjoint with siblings #23 (features-panel — owns the `xai_pref_features_*` keys, App.tsx `modules` filter, `settingsPaneComposition.ts` first-mover) and #24 (settings-rest — owns the 10 remaining placeholder panes).

## 5. Frozen assumptions (v1)

1. **Pane scope = 7 dimensions**: lang / theme / density / fontScale / accentHue / railPos / bgTone. Pet on/off is NOT in this pane (owned by `xai-web-shell` row #5 via `web:shell:pet-toggle`).
2. **No `PaneRenderProps` extension** — pane reads/writes via `usePref` + `emitWebEvent` + `applyX` helpers; chassis stays at `{ lang }`-only contract.
3. **Storage keys already in registry** (planted by row #21): `xai_accent_hue` (number, default 165), `xai_rail_pos` (RailPos, default "left"), `xai_bg_tone` (BgTone, default "default"). NO new keys introduced by this row.
4. **`BgTone` canonical = tokens-side 6 ids** (`default` | `cream` | `mist` | `lavender` | `peach` | `graphite`). The storage-side `"sage"` extra literal is treated as a never-set v1 over-spec (App.tsx already casts `BgToneRaw as BgTone`). We continue that pattern; pane only emits and writes the 6 canonical ids.
5. **Source code BG_TONES table** (lines 497-504): the `id` "default" displays as "Sage / 鼠尾草" — this is the default tone presented as the first option. We preserve verbatim.
6. **`HUE_PRESETS` table** (source lines 505-512): 6 preset chips (Sage 165 / Ocean 230 / Sunset 35 / Rose 355 / Violet 295 / Amber 75) wrapped around the 0..360 hue slider.
7. **BgTone-card click side-effect** (source line 584): `setBgTone(t.id); setAccentHue(t.hue);` — clicking a bg-tone card ALSO rewrites accent hue to match. We preserve this verbatim.
8. **fontScale step = 0.05**, range 0.85..1.15 per source line 627. Display `Math.round(fontScale*100) + "%"` per source line 631.
9. **Hue slider step = 1**, range 0..360 per source line 570. Display `Math.round(accentHue) + "°"` per source line 574.
10. **Active-state matching for hue swatches** uses `Math.abs(accentHue - p.hue) < 3` per source line 560.
11. **Reset defaults** (source lines 636-639): theme=light / density=comfortable / fontScale=1 / accentHue=165 / railPos="left" / bgTone="default". (Lang is NOT in source's reset block — language is treated as a higher-level Topbar dim; we follow source and exclude `lang` from Reset.)
12. **Save behavior** (source lines 642-649): no actual mutation — UI flash 1800ms. We extend to also broadcast `web:settings:preference-changed` for all 7 dims, with `changedAt` ISO timestamp (matches chassis api.md §2.3).
13. **`web:settings:preference-changed`** owner is THIS row (declared on `packages/core/src/types/events.ts` line 192 "owner: xai-web-settings-appearance row #22"). The chassis is a co-emitter via `SettingsFooter`; this row is the primary emitter for live changes.
14. **Pane substitution seam**: `apps/web/src/routes/modules/settingsPaneComposition.ts` already exists (row #23 first-mover). This row adds ONE extra branch: `if (p.id === "appearance") return appearancePane;`. Line-disjoint with row #24.
15. **Composition order**: features-panel branch (already there) → this row appends `appearance` branch → settings-rest will append further. The `composeSettingsPaneRegistry` reduce/map ordering is commutative (each `if` checks a different `p.id`).

## 6. Decision snapshot

- **Selected Option**: Option B — `usePref` direct for 3 persisted dims + `web:settings:preference-changed` for the 4 useState-backed dims. No chassis `PaneRenderProps` extension. Sibling-extension branch in `settingsPaneComposition.ts`. App.tsx subscribes to the event for the useState dims; the 3 `void setX` lines become a real handler.

## 7. Phase plan summary (full table in dev_log.md)

2 phases for this row — smaller surface than the features-panel sibling because the storage layer + chassis are already in place and atom components are reused.

| Phase | Title | Acceptance |
|-------|-------|------------|
| P1 | Scaffolding + pane component + all live controls + atom tests | `pnpm --filter @repo/plugin-web-settings-appearance lint test typecheck` exits 0; 7 dims render + live-bind + emit |
| P2 | Host wiring (composition seam branch + App.tsx subscription) + integration test | `pnpm --filter @repo/web build` passes; clicking Save broadcasts 7 events; Reset reverts 7 dims; multi-window subscriber prototype echoes change |

If P2 exposes a third-stop (e.g. SettingsFooter Reset needs an `onReset` override to also reset `lang`/`theme`/`density`/`fontScale` via App.tsx), we split into P3 — but the seed brief says 2-3 phases, so we plan for 2 with P3 as a contingency.

## 8. Risks + open questions

- **R1 — Live binding for useState dims via event bus is round-trip**: pane emits → App.tsx subscriber calls `setTheme(...)` → React re-renders → `applyTheme` runs in useEffect. This is one tick longer than calling `applyTheme` directly. **Mitigation**: pane calls `applyTheme/applyDensity/applyFontScale` synchronously in `onChange` for instant DOM paint, then emits the event for App.tsx + cross-module subscribers. Same pattern for lang (App.tsx subscriber updates `useState<Lang>`, useI18n re-renders downstream).
- **R2 — App.tsx subscription is a single anchor edit**: row #22 owns this. Line-disjoint with row #23 (modules filter at lines 88-92) and row #24 (no App.tsx edit planned). Conflict surface is zero.
- **R3 — `bgTone` click rewrites `accentHue`** (source line 584): when a user clicks a bg-tone card, the accent hue jumps to the tone's hue. This is verbatim source behavior; we preserve it. Documented in api.md §4.
- **R4 — Reset of `lang` not in source**: source `Reset to defaults` does NOT touch `lang`. We follow source. **Open question for review**: should the row #21 `resetAllPrefs()` (which DOES emit a `lang` default at "en") propagate `lang` through the same event bus? Per chassis api.md §5.1 it does. The Appearance pane's per-pane "Reset" button (NOT the chassis-wide reset) only resets 6 dims (theme/density/fontScale/accentHue/railPos/bgTone). Documented in api.md §3.
- **R5 — `xai_pref_*` writes by Save**: the seed brief mentions "Save persists to … `xai_pref_*` (all in @repo/plugin-web-storage registry)". Per current registry there are no `xai_pref_appearance_*` keys planted; `xai_pref_*` family in registry today is: `xai_pref_week_start` + 8x `xai_pref_features_*`. **Interpretation**: the seed's "`xai_pref_*`" reference is to the 3 already-existing appearance keys (`xai_accent_hue`/`xai_rail_pos`/`xai_bg_tone` — these are the §9.2 appearance keys; they don't carry the `xai_pref_` prefix because they predate that family). No new `xai_pref_appearance_*` keys are required for v1. Documented as Frozen Assumption 3.
- **R6 — Co-emitter ambiguity on `web:settings:preference-changed`**: chassis api.md §3.1 says co-ownership between rows #21 + #22. In v1 row #22 emits live changes; chassis (via `SettingsFooter`) emits on Save+Reset. The emit shapes are identical (same `WebPreferenceKey`-discriminated union + `changedAt`). Subscribers see one logical channel. No race risk — emit is synchronous; React state updates are batched.
- **R7 — Default reset value mismatch**: chassis api.md §5.1 hardcodes `theme="light"` / `density="comfortable"` / `fontScale=1` / `lang="en"` defaults. The pane's local Reset MUST use the same defaults — we duplicate the constants (in `internal/appearanceDefaults.ts`) and add a unit test asserting parity with chassis `defaults.ts`. Documented in test.md.

## 9. References

- Source PRD: `web design/DESIGN.md` §4.12 / §5 / §7 / §9.2
- Source code: `web design/module-settings.jsx` lines 494-653 (AppearancePane), lines 1039-1059 (atoms)
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S7 / §S8
- Chassis row #21: `packages/xai-web-settings-shell/docs/{design,api,test}.md`
- Sibling row #23 (precedent — features-panel): `packages/xai-web-settings-features-panel/docs/{design,api,test}.md`
- Event channel declaration: `packages/core/src/types/events.ts` lines 192-196
- DOM apply helpers: `packages/plugin-web-tokens/src/apply.ts`
- Storage registry (appearance keys): `packages/plugin-web-storage/src/internal/registry.ts` lines 140-165
- Host wiring: `apps/web/src/App.tsx` lines 46-116; composition seam at `apps/web/src/routes/modules/settingsPaneComposition.ts` (row #23 created)
