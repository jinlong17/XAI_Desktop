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

### A3. `AppearancePane.live-binding.test.tsx` — live DOM apply (CP-APPEARANCE-01 dispositions)

Mounted via `<AppearancePane lang="en" />` (standalone controller) with the local Web Lock fixture installed (`appearanceLockFixture.ts`); real completion is awaited before byte assertions. The pane emits no `web:settings:preference-changed`, so the old emission assertions are dropped.

- **AC-LIVE-1**: Clicking the `Dark` theme card → `data-theme="dark"` immediately and after completion; `xai_pref_theme` = `"dark"`.
- **AC-LIVE-2**: Clicking `Compact` → `data-density="compact"`; `xai_pref_density` = `"compact"`.
- **AC-LIVE-3**: Hue slider to `220` → after completion `getPref("xai_accent_hue") === 220`.
- **AC-LIVE-4**: `Ocean` swatch → `xai_accent_hue === 230`.
- **AC-LIVE-5**: `Lavender` tone → `xai_bg_tone === "lavender"` and `xai_accent_hue === 295`.
- **AC-LIVE-6**: `Right` rail card → `xai_rail_pos === "right"`.
- **AC-LIVE-7**: Font slider `0.85` → `font-size: 13.6px` immediately and after completion; `xai_pref_font_scale` = `0.85`.
- **AC-LIVE-8** (replaced): choosing `简体中文` persists `"zh"` and marks it selected; still no `data-lang` attribute.

### A4. `AppearancePane.rendering.test.tsx` — DOM contract

- **AC-RENDER-1**: Renders 7 `SettingRow` elements (one per dim) in DESIGN.md order.
- **AC-RENDER-2**: 3 theme cards + 6 hue swatches + 6 bg-tone cards + 4 rail-pos cards visible.
- **AC-RENDER-3**: Theme card matching current `data-theme` has `.active` class. (Disposition: seeds the stored bytes `xai_pref_theme` = `"dark"` instead of DOM state; same assertions.)
- **AC-RENDER-4**: Hue swatch with `Math.abs(accentHue - p.hue) < 3` has `.active` class; others do not.
- **AC-RENDER-5**: Bg-tone card matching current `xai_bg_tone` has `.active` class.
- **AC-RENDER-6**: Rail-pos card matching current `xai_rail_pos` has `.active` class.
- **AC-RENDER-7**: Hue slider value attribute reflects current `accentHue`; `<span class="slider-val">` shows `<rounded>°`.
- **AC-RENDER-8**: Font slider value reflects fontScale; companion `<span class="slider-val">` shows `<rounded>%`. (Disposition: seeds `xai_pref_font_scale` = `1.1` instead of DOM state; same assertions.)

### A5. `AppearancePane.bilingual.test.tsx` — i18n parity

- **AC-I18N-1**: With `lang="zh"`, the language seg shows "简体中文" / "English"; theme cards show 浅色/深色/跟随系统; density shows 舒适/紧凑.
- **AC-I18N-2**: Accent / Background palette / Sidebar position labels render the new ZH keys appended in P1.
- **AC-I18N-3**: All BG_TONES options render their `zh` names; switching `lang="en"` re-renders to `en` names with no remount required (prop change only).
- **AC-I18N-4** (replaced, CP-APPEARANCE-01): the pane-local Reset to defaults shows 恢复默认 in ZH; no shared settings footer is rendered.

### A6. `AppearancePane.save-reset.test.tsx` — pane-local bottom action area (CP-APPEARANCE-01 dispositions)

AC-SAVE-1/2 are retired with the shared footer ("Save & apply" and its unconditional "Saved" flash) and replaced by Retry all tests; AC-RESET-* drive the pane-local Reset to defaults. Attempt-logging Storage spies and the local Web Lock fixture are installed.

- **AC-SAVE-1** (replaced): with no settled unsuccessful draft, Retry all is rendered with `aria-disabled="true"` (no `disabled` attribute, no description); there is no "Save & apply", "Saved" or "已保存"; one activation makes zero storage attempts and the status line stays empty.
- **AC-SAVE-2** (replaced): with a failed accent draft, Retry all is enabled; one activation re-attempts exactly the failed key once (and only it); no "Appearance settings saved." until a genuine latest success, after which the button is disabled again.
- **AC-RESET-1** (adapted): confirm = true → six verified absences, DOM defaults, `xai_pref_lang` bytes unchanged, "Defaults restored.".
- **AC-RESET-2** (replaced): six reset intents (one removal per seeded key), zero `web:settings:preference-changed` emissions, language untouched.
- **AC-RESET-3**: confirm = false → zero get/set/remove attempts (counting injector) and no state change.
- **AC-RESET-4**: Reset re-paints `<html>` to the defaults immediately and after completion.
- **AC-RESET-5**: two Resets yield the same end state.
- **AC-RESET-6**: `window.confirm` is called exactly once, with the truthful text naming the six fields and keeping language.

### A7. `appearancePane.registry.test.ts` — pane object surface

- **AC-REG-1**: `appearancePane.id === "appearance"`.
- **AC-REG-2**: `appearancePane.i18nKey === "settings.appearance"`.
- **AC-REG-3**: `appearancePane.icon === "sun"` (valid `WebShellIconName` matching chassis `paneRegistry` placeholder at `packages/plugin-web-settings-shell/src/internal/paneRegistry.tsx:55`). The earlier planned literal `"type"` is NOT a member of the `WebShellIconName` union (packages/xai-web-shell/src/types.ts:21-43) — fixed in revise pass (B1).
- **AC-REG-4**: `appearancePane.render({ lang: "en" })` returns a `<AppearancePane lang="en" />` React element.

### A8. `AppearanceRetryAll.test.tsx` — Retry all at the hook layer (RA1..RA27)

Standalone pane, real engine, the local exclusive Web Lock fixture and attempt-logging Storage spies (record, then delegate once). jsdom cannot synthesize the browser's Enter/Space → click activation, so keyboard activation is modelled as focus + click; native keyboard evidence is E15/E26.

- **A2.2 render and enabled state** (RA1–RA7): rendered in the clean, pending-only and source-only states with `aria-disabled="true"`, no `disabled`, no `aria-describedby`, a Tab stop between the font slider and Reset; clicks are inert (zero storage attempts, zero lock requests, focus kept, status line unchanged). One failed field enables it, described by the count line; ZH label and count lines; an open pass with E empty is disabled and described by the in-flight line; a newly failed field during a pass enables it and the second activation retries only that field.
- **A2.3 scope and attempts** (RA8–RA16): one write per member in display order and none elsewhere; a background choice as two members (or one); failed Reset items as one removal each and "Defaults restored."; a valid edit over malformed bytes refused again and a conflict never overwritten; an uncertain write reconciled with one total write; a failed predecessor then the queued latest; exclusions of pending, source-only and draft-free fields; no duplicates for a same-turn double activation, an activation while pending, a per-field Retry during a pass and a Retry all during a per-field Retry.
- **Attribution and late completions** (RA17–RA20): a pane edit supersedes a held member; Discard and Discard all during an open pass (focus to Reset); unmount during an open pass — late completions never write or claim success.
- **A2.4 / A2.5** (RA21–RA26): rule 1 wins over a member that failed again, then rule 3; ZH in-flight and saved lines; rule 2 export failure cleared by the next action and never shown once clean; focus kept on the button when a full-success pass disables it, after a partial result, and when a held member fails on release.
- **RA27**: no Retry all activation writes any key outside the seven Appearance keys.

### A9. `AppearanceController.test.tsx` — the App-scoped controller (AC1..AC17 + AC4 ×33)

- **A3**: a fresh mount displays and applies the stored values with zero writes (ruling 3: no DOM mirrors); one controller, two views (a pane edit is visible to another view in the same frame and vice versa); no `StorageEvent` dispatch.
- **A6**: every contract §5 item 2 malformed value at load (33 values) → no throw, the default displayed and applied, a Reload-only source alert, no Retry/Discard/Export, no unload warning, zero writes, bytes kept; a throwing read is source-only and Reload of repaired bytes clears the alert without a saved claim; slider bounds store exact bytes.
- **A5**: the Topbar status renders nothing while clean or only pending, renders the named button for a settled failure, calls `onReview` once without storage access and disappears after a successful Retry (EN and ZH); `beforeunload` warns only while drafts exist, with zero storage attempts; the sign-out step (no drafts → `true`, no prompt, no storage; Cancel → `false`, everything kept; OK → drafts discarded with zero writes) and its ZH prompt.
- **Recovery and export**: targeted Discard rereads only its field and focuses the field's selected control; Reload refuses an actual draft; a successful Retry returns focus from the unmounting block; memory-only export under total storage denial with the set/reset envelope, one URL created and revoked, the anchor removed; Reset never touches `xai_pref_lang` or any other key; a missing Web Lock refuses writes; a success while no pane is mounted makes no claim later.

## B. Integration tests

### B1. `paneComposition.integration.test.tsx`

- **AC-COMP-1**: `composeSettingsPaneRegistry()` length is 13 (same as `paneRegistry`).
- **AC-COMP-2**: Entry where `id==="appearance"` is `appearancePane` (NOT the placeholder).
- **AC-COMP-3**: Entry where `id==="features"` is still `featuresPane` (row #23 not broken).
- **AC-COMP-4**: All 11 other entries are reference-equal to their `paneRegistry` source.

### B2. App-level integration (`apps/web/src/__tests__/App.appearance.test.tsx`, APP-AP1..APP-AP12)

The production route table in a memory router with only the auth session and route gates substituted; an exclusive Web Lock fixture and attempt-logging Storage spies.

- **APP-AP1** (replaces Topbar TP1-Persist … TP3b-Persist): every Topbar choice persists today's exact bytes through the controller (one write each, one per-key lock request per edit) and reads back through the unchanged `readLocalPref`; mounting writes nothing.
- **APP-AP2** (replaces TP-Persist-Quota-Safe): a failing Topbar write keeps the choice checked and applied and shows the Topbar status; `beforeunload` warns. **APP-AP2b**: a held Topbar write shows no status and writes exactly once after release.
- **APP-AP3–AP5**: one controller (pane ↔ Topbar in the same act); the Topbar status Review emits the shortcut event once and navigates once to the pane; the Settings sidebar is never held and the draft survives the round trip.
- **APP-AP6–AP8**: the sign-out step before `requestSettingsDeparture` in the fallback branch (no drafts → no confirm; Cancel/OK) and the coordinator branch (Cancel).
- **APP-AP9–AP12**: the ten crashing values of H6 (including `"EN"`) leave `/app` rendering with defaults and zero writes; an `Infinity` accent from another document is source-only without a throw; a committed root change from another document is reflected live; edits, Retry all and Reset emit no `web:settings:preference-changed`.

The frozen Sol, parent host, native and F1 oracles under `docs/reviews/web-appearance-recovery-*` remain the acceptance matrix; these are the packages' own regression tests.

## C. Type tests

- **AC-TS-1**: `appearancePane satisfies Pane` — compile passes.
- **AC-TS-2**: `appearanceDefaults satisfies AppearanceDefaults` — compile passes.
- **AC-TS-3**: `<AppearancePane lang={"en"} />` accepted; `<AppearancePane lang={"fr" as never} />` rejected (negative type test under `@ts-expect-error`).

## D. Lint + typecheck

- `pnpm --filter @repo/plugin-web-settings-appearance lint --max-warnings 0` must pass.
- `pnpm --filter @repo/plugin-web-settings-appearance typecheck` must pass.
- Existing packages whose registry/host files this row edits must continue passing their lint:
  - `@repo/plugin-web-tokens` (i18n.ts append).
  - host `web` Vite app (App.tsx controller wiring + settingsPaneComposition.ts branch) and `@repo/xai-web-shell` (Topbar slot).

## E. Mock strategy

- **Web Locks** (CP-APPEARANCE-01): jsdom has no `navigator.locks`; `src/__tests__/appearanceLockFixture.ts` installs an exclusive asynchronous FIFO lock manager per test (hold, deny, missing capability, request log) and uninstalls it when the test finishes. A pass-through stub cannot prove a held lock.
- **Storage attempts**: `vi.spyOn(Storage.prototype, ...)` wrappers record each attempt and delegate exactly once to the captured native method; faults throw before delegating.

- Use the real `usePrefAutosaveAsync` engine against `localStorage` (jsdom); `localStorage` is cleared after each test by `vitest.setup.ts`. Tests seed stored bytes directly (or through the legacy `setPref`) before mounting.
- The pane emits nothing on the event bus; where a test proves that, it spies on `emitWebEvent` via `vi.mock(..., importOriginal)`.
- `applyX` helpers are imported from `@repo/plugin-web-tokens` (through the controller) and tested against real `document.documentElement` mutations.
- **Reset confirm**: stub `window.confirm` directly (jsdom global) via `vi.spyOn(window, "confirm").mockReturnValue(true | false)`. The pane-local Reset to defaults is the sole caller; AC-RESET-3 verifies the abort path (zero storage attempts); AC-RESET-6 verifies a single call with the truthful text.
- **Defaults parity** (M2): import the PUBLIC `resetAllPrefs` from `@repo/plugin-web-settings-shell`. Subscribe a test-side listener via `onWebEvent("web:settings:preference-changed", ...)` BEFORE calling `resetAllPrefs()`. Capture the emit set into a `Map<WebPreferenceKey, unknown>`. Build the appearance-subset object (drop `lang`) and deep-equal against `appearanceDefaults`. Do NOT import chassis `defaults.ts` directly (it's `@internal`).

## F. Acceptance criteria (from seed brief — mapped to tests)

| Seed AC | Covered by |
|---------|-----------|
| Flip every Appearance control | A3 (live-bind) + A4 (rendering) + B2 (App-level) |
| See live UI update | A3 (AC-LIVE-1..8) + A9 (AC1, AC2) + B2 (APP-AP3) |
| Reload preserves persisted dims | A4 (AC-RENDER-3/8 seed stored bytes) + A9 AC1 + B2 APP-AP1 |
| Reset returns to defaults | A6 (AC-RESET-1..6) + A8 (RA10) + B2 APP-AP12 |
| Bilingual | A5 (AC-I18N-1..4) + A8 (RA5, RA22) + A9 (AC8, AC11) |
| Live hue slider mutates `--accent-hue` | A3 AC-LIVE-3 + A9 AC6 |
| Every change persists exact bytes (autosave) | A3 + A9 + B2 APP-AP1 (no new keys) |
| Rail-position preview cards | A4 AC-RENDER-2 + visual snapshot in styles.css verification |
| Reset to defaults per DESIGN.md §5/§7 | A1 parity tests + A6 |
| Bilingual via useI18n | A5 |
| Truthful recovery (Retry, Discard, Reload, Retry all, export, Topbar status, unload, sign-out step) | A8 + A9 + B2 (CP-APPEARANCE-01) |
| Verify Cross-vendor: yes | queued for ship-time per W4b Parallel-Agent manifest header |

## G. Coverage target

≥ 90% lines for the new package (matches statistics + features-panel peer rows).

## H. Cross-vendor verify gate

W4b parallel-agent compromise: row-level verify is same-vendor (Claude Opus). Cross-vendor manual smoke (Codex / Cursor real-browser pass) queued for ship-time, documented in `docs/PLUGIN_MAP.md` row append and `dev_log.md`. Not a blocker for `READY_FOR_VERIFY` per W4b manifest header.
