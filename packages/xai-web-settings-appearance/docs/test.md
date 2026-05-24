# Test Strategy — xai-web-settings-appearance

Acceptance signal (from seed brief):
> "User flips every Appearance control, sees the live UI update, reloads, sees the choice persisted, and Reset returns the UI to defaults — all bilingual."

All tests run under Vitest + jsdom. No real browser required for the unit + integration tiers; cross-vendor manual smoke is queued for ship-time per W4b Parallel-Agent manifest header.

---

## A. Unit tests (Vitest + RTL)

### A1. `appearanceDefaults.test.ts` — defaults parity (M2 strategy)

> **M2 (parity strategy)**: Chassis `defaults.ts` lives at `packages/plugin-web-settings-shell/src/internal/defaults.ts` — internal, not re-exported via the package barrel. Direct cross-package `internal/` imports are forbidden by the architecture (CLAUDE.md "index.ts is a Plugin's only public surface"). Furthermore, chassis ships `RESET_DEFAULTS: readonly WebPreferenceChange[]` (a discriminated-union ARRAY, 7 entries — including `lang`), not a flat object. Direct deep-equal would fail shape.
>
> **Strategy**: snapshot the chassis PUBLIC `resetAllPrefs()` emit set. Steps per test:
>
> 1. Subscribe a test-side listener via `onWebEvent("web:settings:preference-changed", ...)` to capture all emits into a `Map<WebPreferenceKey, unknown>`.
> 2. Call the chassis public `resetAllPrefs()` from `@repo/plugin-web-settings-shell`.
> 3. The captured map should contain 7 entries (the chassis-wide reset emits every dim including `lang` and `bgTone`).
> 4. Build an "appearance subset" object from the capture: `{ theme, density, fontScale, accentHue, railPos, bgTone }` (dropping `lang` and any non-appearance keys — none exist for chassis).
> 5. Assert `appearanceSubset` deep-equals `appearanceDefaults` (the local frozen constant).
>
> This proves the pane's local `appearanceDefaults` is the same value-set the chassis would emit, without importing chassis internals.

- **AC-DEF-1**: Snapshot chassis `resetAllPrefs()` emits → captured `theme === "light"`; pane's `appearanceDefaults.theme === "light"` matches.
- **AC-DEF-2**: Captured `density === "comfortable"`; `appearanceDefaults.density === "comfortable"` matches.
- **AC-DEF-3**: Captured `fontScale === 1`; `appearanceDefaults.fontScale === 1` matches.
- **AC-DEF-4**: Captured `accentHue === 165`; `appearanceDefaults.accentHue === PREF_REGISTRY.xai_accent_hue.default` (currently 165).
- **AC-DEF-5**: Captured `railPos === "left"`; `appearanceDefaults.railPos === PREF_REGISTRY.xai_rail_pos.default` (currently `"left"`).
- **AC-DEF-6**: Captured `bgTone === "default"`; `appearanceDefaults.bgTone === PREF_REGISTRY.xai_bg_tone.default` (currently `"default"`).
- **AC-DEF-7**: `appearanceDefaults` does NOT contain a `lang` field (per source — lang excluded from per-pane Reset). The chassis-wide reset DOES emit `lang`; the pane's local defaults intentionally drop it.
- **AC-DEF-8**: `Object.isFrozen(appearanceDefaults) === true`.
- **AC-DEF-9**: Subset equality — the 6 fields of `appearanceDefaults` form a strict subset of the 7 keys captured from `resetAllPrefs()`. Asserted via `Object.keys(appearanceDefaults).every(k => captured.has(k as WebPreferenceKey))`.

### A2. `constants.test.ts` — option tables

- **AC-CONST-1**: `BG_TONES.length === 6` and `.map(o => o.id)` deep-equals `["default","cream","mist","lavender","peach","graphite"]`.
- **AC-CONST-2**: `HUE_PRESETS.length === 6` and `.map(o => o.id)` deep-equals `["sage","ocean","sunset","rose","violet","amber"]`.
- **AC-CONST-3**: `HUE_PRESETS.map(o => o.hue)` deep-equals `[165, 230, 35, 355, 295, 75]`.
- **AC-CONST-4**: `BG_TONES.map(o => o.hue)` deep-equals `[165, 55, 230, 295, 35, 220]` (matches source line 498-503).
- **AC-CONST-5**: `RAIL_POSITIONS.length === 4` and `.map(o => o.id)` deep-equals `["left","right","top","bottom"]`.
- **AC-CONST-6**: Every entry's `.name`/`.label` carries non-empty `en` AND `zh`.
- **AC-CONST-7**: `Object.isFrozen(BG_TONES) === true` and `BG_TONES[0]` is also frozen (deep-freeze test for one entry).

### A3. `AppearancePane.live-binding.test.tsx` — live DOM apply

Mounted via `<AppearancePane lang="en" />` with a `ShellFixture`-style wrapper. Spy on `emitWebEvent` and on `document.documentElement.setAttribute`. Use real `localStorage` (jsdom).

- **AC-LIVE-1**: Clicking the `Dark` theme card → `data-theme="dark"` set on `<html>` BEFORE the next macrotask + one `emitWebEvent("web:settings:preference-changed", { key:"theme", value:"dark", changedAt:<iso> })` call.
- **AC-LIVE-2**: Clicking `Compact` density button → `data-density="compact"` + emit `{ key:"density", value:"compact" }`.
- **AC-LIVE-3**: Dragging hue slider to value `220` → `localStorage.xai_accent_hue === "220"` + emit `{ key:"accentHue", value:220 }`. (DOM `--accent-hue` applied via App.tsx useEffect — tested in integration A8.)
- **AC-LIVE-4**: Clicking the `Ocean` swatch → `xai_accent_hue === "230"` + emit.
- **AC-LIVE-5**: Clicking the `Lavender` bg-tone card → `xai_bg_tone === "lavender"` AND `xai_accent_hue === "295"` (verbatim source line 584) AND TWO emits (bgTone first then accentHue).
- **AC-LIVE-6**: Clicking `Right` rail-position card → `xai_rail_pos === "right"` + emit `{ key:"railPos", value:"right" }`.
- **AC-LIVE-7**: Setting font slider to `0.85` → `html.style.fontSize === "13.6px"` + emit `{ key:"fontScale", value:0.85 }`.
- **AC-LIVE-8**: Clicking `简体中文` segment → no DOM apply (lang has no DOM channel) + emit `{ key:"lang", value:"zh" }`.

### A4. `AppearancePane.rendering.test.tsx` — DOM contract

- **AC-RENDER-1**: Renders 7 `SettingRow` elements (one per dim) in DESIGN.md order.
- **AC-RENDER-2**: 3 theme cards + 6 hue swatches + 6 bg-tone cards + 4 rail-pos cards visible.
- **AC-RENDER-3**: Theme card matching current `data-theme` has `.active` class.
- **AC-RENDER-4**: Hue swatch with `Math.abs(accentHue - p.hue) < 3` has `.active` class; others do not.
- **AC-RENDER-5**: Bg-tone card matching current `xai_bg_tone` has `.active` class.
- **AC-RENDER-6**: Rail-pos card matching current `xai_rail_pos` has `.active` class.
- **AC-RENDER-7**: Hue slider value attribute reflects current `accentHue`; `<span class="slider-val">` shows `<rounded>°`.
- **AC-RENDER-8**: Font slider value reflects fontScale; companion `<span class="slider-val">` shows `<rounded>%`.

### A5. `AppearancePane.bilingual.test.tsx` — i18n parity

- **AC-I18N-1**: With `lang="zh"`, the language seg shows "简体中文" / "English"; theme cards show 浅色/深色/跟随系统; density shows 舒适/紧凑.
- **AC-I18N-2**: Accent / Background palette / Sidebar position labels render the new ZH keys appended in P1.
- **AC-I18N-3**: All BG_TONES options render their `zh` names; switching `lang="en"` re-renders to `en` names with no remount required (prop change only).
- **AC-I18N-4** (revised per M1): Reset confirm prompt is owned by the chassis `SettingsFooter` — bilingual prompt verification is the chassis's responsibility (chassis test.md). For this row, assert that `<SettingsFooter lang={lang}>` is rendered with the correct `lang` prop so the chassis emits the right bilingual prompt. Direct prompt-string assertion is OUT OF SCOPE for the pane (would duplicate chassis tests).

### A6. `AppearancePane.save-reset.test.tsx` — chassis SettingsFooter integration

- **AC-SAVE-1**: Clicking Save → 7 `emitWebEvent` calls (one per dim) within the same tick + chassis "Saved" flash appears (testing via `.is-saved` class on the button).
- **AC-SAVE-2**: After 1800ms (use `vi.useFakeTimers`), `.is-saved` is removed.
- **AC-RESET-1**: jsdom `window.confirm` stubbed to return `true` (chassis `SettingsFooter.handleReset` calls `confirmAction` → falls through to `window.confirm`). Click Reset → `removePref` called for `xai_accent_hue`, `xai_rail_pos`, `xai_bg_tone` + `applyTheme("light")` + `applyDensity("comfortable")` + `applyFontScale(1)`.
- **AC-RESET-2**: Click Reset → 6 emits with default values (`theme=light`, `density=comfortable`, `fontScale=1`, `accentHue=165`, `railPos="left"`, `bgTone="default"`). NO `lang` emit.
- **AC-RESET-3** (M1 — chassis owns confirm): jsdom `window.confirm` stubbed to return `false`. Click Reset → chassis `handleReset` aborts before calling `onReset` → NO `removePref`, NO `applyX`, NO `emitWebEvent`. State unchanged. (Test stubs the CHASSIS confirm path, not a pane-level helper — the pane no longer has its own `confirmAction`.)
- **AC-RESET-4**: Reset re-paints DOM: `data-theme="light"`, `data-density="comfortable"`, `data-bg-tone` removed (since default = `"default"` → `applyBgTone` removes attr).
- **AC-RESET-5**: Idempotent — calling Reset twice yields the same end state.
- **AC-RESET-6** (M1 — no double-prompt): mount pane, stub `window.confirm` with a `vi.fn()` returning `true`, click Reset. Assert `confirm` was called EXACTLY ONCE (NOT twice — would indicate a residual pane-level `confirmAction`).

### A7. `appearancePane.registry.test.ts` — pane object surface

- **AC-REG-1**: `appearancePane.id === "appearance"`.
- **AC-REG-2**: `appearancePane.i18nKey === "settings.appearance"`.
- **AC-REG-3**: `appearancePane.icon === "sun"` (valid `WebShellIconName` matching chassis `paneRegistry` placeholder at `packages/plugin-web-settings-shell/src/internal/paneRegistry.tsx:55`). The earlier planned literal `"type"` is NOT a member of the `WebShellIconName` union (packages/xai-web-shell/src/types.ts:21-43) — fixed in revise pass (B1).
- **AC-REG-4**: `appearancePane.render({ lang: "en" })` returns a `<AppearancePane lang="en" />` React element.

## B. Integration tests

### B1. `paneComposition.integration.test.tsx`

- **AC-COMP-1**: `composeSettingsPaneRegistry()` length is 13 (same as `paneRegistry`).
- **AC-COMP-2**: Entry where `id==="appearance"` is `appearancePane` (NOT the placeholder).
- **AC-COMP-3**: Entry where `id==="features"` is still `featuresPane` (row #23 not broken).
- **AC-COMP-4**: All 11 other entries are reference-equal to their `paneRegistry` source.

### B2. App.tsx-level integration

- **AC-APP-1**: Mount full `<App>` with `MemoryRouter`. Navigate to `/app/settings`. Click `Appearance` sidebar entry. The pane renders.
- **AC-APP-2**: From the rendered pane, click `Dark` theme card → `document.documentElement.getAttribute("data-theme") === "dark"` AND `<App>`'s `theme` useState became `"dark"` (verified via subsequent render of a probe consumer of the Topbar theme seg).
- **AC-APP-3**: Drag hue slider to `100` → `localStorage.xai_accent_hue === "100"` AND `document.documentElement.style.getPropertyValue("--accent-hue") === "100"` (proves App.tsx useEffect re-fires via usePref auto-bus).
- **AC-APP-4**: Click `bottom` rail position card → `document.documentElement.getAttribute("data-rail-pos") === "bottom"`.
- **AC-APP-5**: Click `Mist` bg-tone card → `data-bg-tone="mist"` AND `--accent-hue` updated to 230 (verbatim source side-effect).
- **AC-APP-6**: Click Save → seven events observed by a test-side `onWebEvent` listener within one tick.

### B3. Persistence round-trip

- **AC-PERSIST-1**: Set accentHue=200 via slider → unmount `<App>` → remount → `accentHue` reads back as 200 from localStorage and slider renders at 200.
- **AC-PERSIST-2**: Same flow for `xai_rail_pos`, `xai_bg_tone`.
- **AC-PERSIST-3**: theme/density/fontScale are NOT persisted — remount restores them to App.tsx useState defaults (light/comfortable/1). Verified by reading localStorage and confirming the 3 keys are NOT present.

### B4. Reset round-trip

- **AC-RESET-INT-1**: Set all 6 dims to non-defaults (theme=dark, density=compact, fontScale=1.15, accentHue=300, railPos="top", bgTone="peach"). Click Reset (stubbed confirm=true). All 6 dims return to defaults; DOM attributes match.
- **AC-RESET-INT-2**: After Reset, `lang` is unchanged from whatever it was before Reset (verbatim source).

### B5. Event channel listener (cross-module subscriber prototype)

- **AC-EVT-1**: Mount the pane plus a test-side subscriber that captures every `web:settings:preference-changed` event. Drive every control once. Capture must contain exactly 7 distinct `key` values across the run.
- **AC-EVT-2**: All payloads carry a valid ISO 8601 `changedAt` string.

## C. Type tests

- **AC-TS-1**: `appearancePane satisfies Pane` — compile passes.
- **AC-TS-2**: `appearanceDefaults satisfies AppearanceDefaults` — compile passes.
- **AC-TS-3**: `<AppearancePane lang={"en"} />` accepted; `<AppearancePane lang={"fr" as never} />` rejected (negative type test under `@ts-expect-error`).

## D. Lint + typecheck

- `pnpm --filter @repo/plugin-web-settings-appearance lint --max-warnings 0` must pass.
- `pnpm --filter @repo/plugin-web-settings-appearance typecheck` must pass.
- Existing packages whose registry/host files this row edits must continue passing their lint:
  - `@repo/plugin-web-tokens` (i18n.ts append).
  - host `web` Vite app (App.tsx subscription edit + settingsPaneComposition.ts branch).

## E. Mock strategy

- Use real `usePref` / `setPref` / `removePref` against `localStorage` (jsdom). Clear `localStorage` in `beforeEach`.
- Use real `emitWebEvent` / `onWebEvent` — no mocks; instead spy on `emitWebEvent` via `vi.spyOn` when assertion needed.
- `applyX` helpers are imported from `@repo/plugin-web-tokens` and tested against real `document.documentElement` mutations.
- **Reset confirm** (M1): stub `window.confirm` directly (jsdom global) via `vi.spyOn(window, "confirm").mockReturnValue(true | false)`. The chassis `SettingsFooter.handleReset` is the sole caller — the pane no longer ships its own `confirmAction` seam. AC-RESET-3 verifies the abort path; AC-RESET-6 verifies single-call (no double-prompt).
- **Defaults parity** (M2): import the PUBLIC `resetAllPrefs` from `@repo/plugin-web-settings-shell`. Subscribe a test-side listener via `onWebEvent("web:settings:preference-changed", ...)` BEFORE calling `resetAllPrefs()`. Capture the emit set into a `Map<WebPreferenceKey, unknown>`. Build the appearance-subset object (drop `lang`) and deep-equal against `appearanceDefaults`. Do NOT import chassis `defaults.ts` directly (it's `@internal`).
- `vi.useFakeTimers` for the 1800ms Saved flash assertion.

## F. Acceptance criteria (from seed brief — mapped to tests)

| Seed AC | Covered by |
|---------|-----------|
| Flip every Appearance control | A3 (live-bind) + A4 (rendering) + B2 (App-level) |
| See live UI update | A3 (AC-LIVE-1..8) + B2 (AC-APP-2..5) |
| Reload preserves persisted dims | B3 (AC-PERSIST-1/2/3) |
| Reset returns to defaults | A6 (AC-RESET-1..5) + B4 (AC-RESET-INT-1/2) |
| Bilingual | A5 (AC-I18N-1..4) |
| Live hue slider mutates `--accent-hue` | A3 AC-LIVE-3 + B2 AC-APP-3 |
| Save persists to xai_accent_hue / xai_rail_pos / xai_bg_tone / xai_pref_* | A3 + B3 (note: no new xai_pref_appearance_* keys per Frozen Assumption 5) |
| Rail-position preview cards | A4 AC-RENDER-2 + visual snapshot in styles.css verification |
| Reset to defaults per DESIGN.md §5/§7 | A1 parity tests + A6 + B4 |
| Bilingual via useI18n | A5 |
| Cross-module updates via @repo/xai-web-event-bus | A3 emit assertions + B5 cross-module subscriber |
| 2-3 phases | dev_log.md Phase Plan = 2 phases |
| Verify Cross-vendor: yes | queued for ship-time per W4b Parallel-Agent manifest header |

## G. Coverage target

≥ 90% lines for the new package (matches statistics + features-panel peer rows).

## H. Cross-vendor verify gate

W4b parallel-agent compromise: row-level verify is same-vendor (Claude Opus). Cross-vendor manual smoke (Codex / Cursor real-browser pass) queued for ship-time, documented in `docs/PLUGIN_MAP.md` row append and `dev_log.md`. Not a blocker for `READY_FOR_VERIFY` per W4b manifest header.
