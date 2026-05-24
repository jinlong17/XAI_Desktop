# Dev Log — xai-web-settings-appearance

Workflow: FEATURE_DEV
Target: xai-web-settings-appearance
Title: Settings → Appearance pane (7-dim live-bound + bilingual + Save/Reset)
Roadmap row: #22 · W4b · Settings (split)
Executor: Claude Sonnet 4.6
Updated: 2026-05-23 19:15

---

## Current Status

Status: READY_FOR_VERIFY
Current Phase: FEATURE_VERIFY
Suggested Next: feature-verify

## Mode

Revise — second planning pass for row #22 in response to feature-review REVISE verdict (2026-05-23 18:10). Original Fresh pass remained sound on structure; this pass applies 2 blockers + 3 medium-severity fixes (B1 icon, B2 setter disposition, M1 chassis confirm, M2 parity test, M3 bgTone union note). See "Revise resolution" subsection below.

## Decision snapshot

- **Selected Option**: Option B — `usePref` direct for the 3 persisted dims (`xai_accent_hue`/`xai_rail_pos`/`xai_bg_tone`) + `web:settings:preference-changed` event for the 4 useState-backed dims (`lang`/`theme`/`density`/`fontScale`). No chassis `PaneRenderProps` extension. Pane substitution via a sibling-extensible branch added to `apps/web/src/routes/modules/settingsPaneComposition.ts` (file created by row #23). App.tsx subscribes to the event for the useState dims; the 3 `void setX` lines today become a real handler.
- **Review doc**: `docs/reviews/xai-web-settings-appearance/20260523-discovery-review.md`

## Frozen assumptions (snapshot from design.md §2)

1. 7 dimensions in scope; Pet on/off is NOT here.
2. Chassis `PaneRenderProps = { lang }` stays frozen.
3. Existing 3 persisted keys already in registry with owner `xai-web-settings-appearance` — no new storage keys.
4. `BgTone` canonical = tokens-side 6 ids (no `"sage"`).
5. First BG_TONE id is `"default"` displayed as "Sage / 鼠尾草" verbatim from source.
6. Bg-tone card click ALSO rewrites accentHue to tone.hue.
7. Hue swatch active state: `Math.abs(accentHue - p.hue) < 3`.
8. Reset reverts 6 dims; `lang` is NOT reset (verbatim source).
9. Save broadcasts 7 events + 1800ms "Saved" flash.
10. Pane substitution via `composeSettingsPaneRegistry()` in `settingsPaneComposition.ts` — appends one branch line-disjoint with siblings.
11. App.tsx subscribes to `web:settings:preference-changed` and routes 4 setters (line-disjoint with row #23's `modules` filter edit).

## Phase Plan

| Phase | Title | Files affected | Commit message (planned) |
|-------|-------|----------------|--------------------------|
| P1 | Scaffolding + AppearancePane + atom usage + constants + tests | `packages/xai-web-settings-appearance/{package.json,tsconfig.json,manifest.json,eslint.config.js,vitest.config.ts,vitest.setup.ts,src/{index.ts,types.ts,constants.ts,appearanceDefaults.ts,AppearancePane.tsx,internal/appearancePane.tsx,internal/themeCard.tsx,internal/bgToneCard.tsx,internal/railPosCard.tsx,styles.css,__tests__/*}}` + `packages/plugin-web-tokens/src/i18n.ts` (append §S8 Appearance block — 27 keys) | `feat(plugin-web-settings-appearance): P1 AppearancePane + 7-dim live binding + i18n (W4b row #22)` |
| P2 | Host wiring (composition branch + App.tsx subscription) + integration test | `apps/web/src/routes/modules/settingsPaneComposition.ts` (1 branch added), `apps/web/src/App.tsx` (lines 55-66 — drop 3 persisted setters from useState destructure + replace `void setX` block with onWebEvent subscription, add `onWebEvent` import), `apps/web/package.json` (dep `@repo/plugin-web-settings-appearance: workspace:*`), `docs/PLUGIN_MAP.md` (add Web Modules row), integration tests under `apps/web/src/__tests__/` + `packages/xai-web-settings-appearance/src/__tests__/appComposition.integration.test.tsx` | `feat(plugin-web-settings-appearance): P2 host wiring + App.tsx subscription + integration (W4b row #22)` |

> **P1 file list change (M1)**: `internal/confirmAction.ts` REMOVED — chassis `SettingsFooter.handleReset` owns the confirm prompt; the pane has no production caller for a local helper. Mirrors row #23 (`FeaturesPane.tsx:41-45`).
>
> **P2 App.tsx edit scope change (B2)**: edit now spans lines 55-66 (12 contiguous lines) — drops `setAccentHue`/`setRailPos`/`setBgTone` from the `usePref` destructure (Option 1 — clean), removes all 4 `void setX` lines, adds the subscription useEffect. Plus one new import (`onWebEvent` from `@repo/xai-web-event-bus`). Lint result: zero unused-vars warnings.

Per project convention: one commit per phase. Lint MUST be clean each commit.

P3 contingency: if `SettingsFooter onReset` chassis API does not accept the per-pane override at v1 (chassis api.md §2.3 says it does — `onReset?` is optional with `resetAllPrefs` default), we split out a P3 to add the override. Initial reading confirms 2 phases is the planned outcome.

## Revise resolution (2026-05-23 18:35)

In response to feature-review REVISE verdict logged at 2026-05-23 18:10:

| Item | Severity | Resolution | Files touched in this revise pass |
|------|----------|------------|-----------------------------------|
| **B1** — `appearancePane.icon === "type"` is not a valid `WebShellIconName` | Blocker | Flipped to `"sun"` (chassis placeholder, valid union member). | `api.md` §4, `design.md` §4, `test.md` AC-REG-3 |
| **B2** — App.tsx subscription leaves `setAccentHue`/`setRailPos`/`setBgTone` unused → lint fail | Blocker | Chose Option 1: drop the 3 persisted setters from the `usePref` destructure at App.tsx lines 55-57. Kept all 4 useState setters (`setTheme`/`setDensity`/`setFontScale`/`setLang`) since all are referenced by the new subscription. Removed all 4 `void setX` lines. | `api.md` §6, `design.md` §9, `dev_log.md` Phase Plan P2 row, R2 below |
| **M1** — Reset double-confirm (chassis `handleReset` already confirms) | Medium | Removed pane-level `confirmAction` entirely. Pane passes `onReset={handleResetAppearance}` with NO nested confirm (mirrors row #23 `FeaturesPane.tsx:41-45`). Dropped `internal/confirmAction.ts` from P1 file list. Documented chassis-prompt UX gap as TBD follow-up in design.md §15. | `api.md` §3 + §10 + §11, `design.md` §7 + §10 R8 + §14 + §15, `test.md` AC-RESET-3 + AC-RESET-6 (NEW) + AC-I18N-4 + §E, `dev_log.md` Phase Plan |
| **M2** — Defaults parity test references chassis `@internal` `defaults.ts` | Medium | Rewrote A1 strategy: snapshot the PUBLIC `resetAllPrefs()` emit set via a test-side `onWebEvent` listener, build appearance subset (drop `lang`), deep-equal against `appearanceDefaults`. No cross-package internal imports. | `test.md` §A1 (full rewrite with strategy block) + §E (mock strategy) |
| **M3** — `bgTone` storage/event union allows 7 ids; pane writes 6 | Medium | Added explicit one-line note in api.md §7 (post-payload block) and §8 (storage table). Confirms pane filters writes through `BG_TONES` 6-id constant. | `api.md` §7 + §8 |

All 5 items resolved in-place via `Edit` (no file recreation). Discovery review + design structure + phase split + i18n coverage remained unchanged — fixes were surgical.

## Risks

- **R1** — Live-binding double path (`applyX` sync + emit): mitigated by calling `applyX` synchronously then emitting. App.tsx setter on receipt triggers a no-op re-apply via useEffect (idempotent — no flicker).
- **R2** — App.tsx single anchor edit at lines 62-66 (replace `void setX` block). Line-disjoint with row #23's `modules` filter at lines 88-92 and row #24 (no App.tsx edit planned).
- **R3** — Bg-tone card click rewrites accentHue: verbatim source behavior, preserved + unit-tested (A3 AC-LIVE-5).
- **R4** — Reset of lang excluded: verbatim source, documented + unit-tested (A6 AC-RESET-2, B4 AC-RESET-INT-2).
- **R5** — Seed brief mentions `xai_pref_*` as Save target; resolved as referring to the existing 3 keys (no `xai_pref_appearance_*` family needed in registry) — see review §8 R5.
- **R6** — Co-emitter with chassis on `web:settings:preference-changed` channel: identical payload shape, synchronous, no race.
- **R7** — Reset defaults parity with chassis `defaults.ts`: enforced via unit test A1 AC-DEF-1..6.
- **R8** — `applyAccentHue` / `applyFontScale` `RangeError` on non-finite: pane clamps + rounds before calling.
- **R9** (added in revise) — App.tsx setter disposition (B2): three persisted `usePref` setters are dropped from the destructure at lines 55-57 to keep lint clean post-subscription. App.tsx is no longer the writer for the 3 persisted dims — the pane writes via `setPref` directly. Reads still flow through the shared `usePref` registry, so the existing `applyX` useEffects at lines 72-74 continue to function.
- **R10** (added in revise) — Reset confirm is chassis-owned (M1): pane has no DI seam for confirm; tests stub `window.confirm` directly. Removes the risk of pane-vs-chassis double-prompt and removes one DI seam from the package surface (smaller API).

## Concurrency note (W4b parallel agents)

Sibling concurrent rows:
- Row #23 features-panel (READY_TO_SHIP): already merged; `settingsPaneComposition.ts` exists; this row appends ONE branch.
- Row #24 settings-rest (planning concurrently in another agent invocation): will append further branches to the same `settingsPaneComposition.ts` file. Branch ordering is commutative (each `if (p.id === "<X>")` checks a different id).
- App.tsx edits: row #22 owns the `onWebEvent("web:settings:preference-changed", ...)` subscription block (replaces lines 62-66). Row #23's existing edit at lines 88-92 (modules filter) is line-disjoint. Row #24 has no App.tsx edit per its plan.
- Storage registry: row #22 introduces NO new entries (uses 3 existing ones). Line-disjoint with row #24.
- i18n: row #22 appends a `// ---- Appearance pane ----` block; row #24 will append its own block under its own header. Line-disjoint.

This row writes ONLY to:
- `packages/xai-web-settings-appearance/**` (new package)
- `docs/reviews/xai-web-settings-appearance/**`
- `packages/plugin-web-tokens/src/i18n.ts` (append block)
- `apps/web/src/routes/modules/settingsPaneComposition.ts` (one extra branch)
- `apps/web/src/App.tsx` (subscription block replacing lines 62-66)
- `apps/web/package.json` (one dep line)
- `docs/PLUGIN_MAP.md` (one Web Modules row append)

Does NOT touch:
- `docs/workflow/roadmap/xai-web-console.md` (explicitly excluded per seed)
- `packages/plugin-web-storage/src/internal/registry.ts` (no new keys)
- `packages/xai-web-settings-features-panel/**` (row #23 is shipped)
- Any other `packages/xai-web-*` package source

## Files Written by feature-plan

- `docs/reviews/xai-web-settings-appearance/20260523-discovery-review.md`
- `packages/xai-web-settings-appearance/docs/design.md`
- `packages/xai-web-settings-appearance/docs/api.md`
- `packages/xai-web-settings-appearance/docs/test.md`
- `packages/xai-web-settings-appearance/docs/dev_log.md`

(Seed `20260523-roadmap-seed.md` already exists under `docs/reviews/xai-web-settings-appearance/` — preserved as-is.)

## Review Notes (2026-05-23 feature-review)

Reviewer: Claude Opus 4.7 (1M) · scope-bounded to `packages/xai-web-settings-appearance/` + `docs/reviews/xai-web-settings-appearance/`.

Verdict: **REVISE** — 2 blockers (compile/lint correctness), 3 medium-severity clarifications. Discovery rationale + 7-dim scope + Option B selection + sibling line-disjointness + 2-phase split + i18n coverage + persistence-key handling are all sound. Below items are surgical; structure does NOT need reshape.

### Blockers (must be resolved before APPROVED)

- **B1 — `appearancePane.icon === "type"` is not a valid `WebShellIconName`.**
  - `api.md` §4 declares `icon: "type"`, and `test.md` AC-REG-3 asserts the same.
  - `@repo/xai-web-shell` `WebShellIconName` union (packages/xai-web-shell/src/types.ts:21-43) does NOT contain `"type"`. Valid set: sparkle / check / kanban / layout / calendar / grid4 / timer / pin / leaf / countdown / search / chart / sliders / paw / sync / bell / help / sun / moon / monitor / star / download.
  - Chassis placeholder uses `"sun"` (packages/plugin-web-settings-shell/src/internal/paneRegistry.tsx:55).
  - **Action**: change `api.md` §4 + `design.md` §4 + `test.md` AC-REG-3 to `"sun"` (or another valid icon — extending the union is out of scope for this row). Update i18n table if the description text relied on a "type" glyph.

- **B2 — App.tsx edit leaves persisted setters unused, breaking lint.**
  - `apps/web/src/App.tsx` lines 62-66 currently suppress `setAccentHue`, `setRailPos`, `setBgTone`, **and** `setFontScale` (4 setters, not 3 as design.md §9 implies). The proposed replacement (api.md §6) is a `useEffect` that calls `setLang/setTheme/setDensity/setFontScale`. After the edit, `setAccentHue` / `setRailPos` / `setBgTone` remain unused (they are persisted via `usePref` and the subscription doesn't need them — auto-rerender path).
  - Result: `@typescript-eslint/no-unused-vars` will fail on the 3 persisted setters, blocking `pnpm --filter @repo/web build`.
  - **Action**: in `api.md` §6 + `design.md` §9, specify the disposition of `setAccentHue` / `setRailPos` / `setBgTone`. Two viable options:
    1. Drop the setter from the `usePref` destructure: `const [accentHue] = usePref("xai_accent_hue")` (no setter exposed).
    2. Keep `void setAccentHue; void setRailPos; void setBgTone;` after the new subscription block, with a comment that they are exposed for future rows.
  - Option 1 is cleaner; row #23 used a similar shrink for the `usePref` it didn't write to. Pick one and state it explicitly in the edit hunk so `feature-build` doesn't have to guess.

### Medium-severity recommendations (not blockers, but worth fixing in this revise pass)

- **M1 — Reset double-confirmation risk.**
  - Chassis `SettingsFooter.handleReset` (packages/plugin-web-settings-shell/src/SettingsFooter.tsx:85-96) ALREADY calls `confirmAction(message)` BEFORE invoking `onReset`. If the pane's `onReset` ALSO calls its own `confirmAction` (per `api.md` §3 step 1 + `design.md` §7 + §10 R8), the user sees TWO confirm dialogs.
  - Row #23 precedent (`packages/xai-web-settings-features-panel/src/FeaturesPane.tsx:41-45`) passes `onReset={resetAllFeaturePrefs}` with NO nested confirm — that is the canonical pattern.
  - **Action**: in `api.md` §3 + `design.md` §7, REMOVE the pane-level `confirmAction(prompt)` step. Rely on chassis confirm. Acknowledge that the chassis prompt ("Reset every preference … clears saved theme, layout, and module toggles") is slightly misleading for per-pane reset; document as a known UX gap with optional follow-up to extend `SettingsFooterProps` with a `confirmMessage?: { en; zh }` override (out of scope for this row — leave as TBD note).
  - Cascade: `test.md` AC-RESET-3 needs to clarify that the stubbed `confirmAction` is the CHASSIS one (the chassis internal helper), and the pane no longer has its own. Either spy on the chassis import path or use `confirm` mock on the jsdom window.
  - Cascade: remove `internal/confirmAction.ts` from the P1 file list in `dev_log.md` Phase Plan + `design.md` §10 R8 (or repurpose it as test-only seam, but it then has no production callers).

- **M2 — Defaults parity test (A1) doesn't match the chassis surface shape.**
  - Chassis ships `RESET_DEFAULTS: readonly WebPreferenceChange[]` (a discriminated-union array, 7 entries), not a flat object. The plan's `appearanceDefaults` is `{ theme; density; fontScale; accentHue; railPos; bgTone }`. The "byte-for-byte parity" claim therefore needs a transform (array → object lookup) in the test.
  - The chassis `defaults.ts` is `@internal` and not exported via `index.ts` — A1 cannot directly import it. Discovery review §8 R7 flags this as "duplicate in `internal/appearanceDefaults.ts` and unit-test parity with chassis"; the parity test must either (a) import from the internal path (violates barrel-only rule unless cross-package internal imports are explicitly excluded — they are not), or (b) snapshot-test the public `resetAllPrefs()` emit set and compare.
  - **Action**: in `test.md` §A1 + §E, switch the strategy to option (b): mount a test-side `onWebEvent("web:settings:preference-changed", ...)` subscriber, invoke chassis `resetAllPrefs()` once, capture the 7 emits, then assert `appearanceDefaults` matches the 5 shared dims (theme/density/fontScale/accentHue/railPos/bgTone — but lang and bgTone are emitted by chassis; the pane defaults object omits lang). State this transformation explicitly so `feature-build` writes the right test.

- **M3 — `bgTone` storage union vs. pane writes — restate the silent guarantee.**
  - `WebPreferenceChange['bgTone']` (packages/core/src/types/events.ts:26) is `default | sage | cream | mist | lavender | peach | graphite` (7 ids — includes both `default` AND `sage`). Storage `BgTone` (PREF_REGISTRY) also includes `sage`. Tokens-side `BgTone` is the 6-id strict subset (no `sage`).
  - Frozen assumption 4 (design.md §2) correctly states the pane only ever writes 6 ids. But the emit payload is typed against the 7-id union — so emitting `{ key: "bgTone", value: "default" }` is valid, but if a subscriber pattern-matches on the 7th id it gets a no-op (no harm).
  - **Action**: in `api.md` §7 + §8, add ONE line acknowledging the 7-vs-6 mismatch and confirming the pane filters writes through the 6-id `BG_TONES` constant. Reduces ambiguity for the build step.

### Non-issues verified during review (logged for traceability, no action required)

- BG_TONES hues `[165, 55, 230, 295, 35, 220]` and HUE_PRESETS hues `[165, 230, 35, 355, 295, 75]` match `web design/module-settings.jsx` lines 497-512 verbatim — AC-CONST-3/4 will pass.
- `setPref` / `removePref` ARE public on `@repo/plugin-web-storage` (src/index.ts lines 35-40) — barrel-only rule satisfied.
- Storage registry already owns the 3 keys with `owner: "xai-web-settings-appearance"` (registry.ts:140-165) — no new key writes.
- `web:settings:preference-changed` event declaration owner already names this row (packages/core/src/types/events.ts:192) — payload shape unchanged.
- Sibling line-disjointness verified: settingsPaneComposition.ts has the "Sibling rows extend below" anchor with the exact stub `// if (p.id === "appearance") return appearancePane;` — row #22 just uncomments + imports.
- i18n key list (api.md §9) cross-checked against `plugin-web-tokens/src/i18n.ts`; the listed missing keys are genuinely absent.
- Phase split is 2 phases per the seed brief constraint (2-3), with P3 contingency noted but not currently required.
- Cross-vendor verify gate deferred to ship-time per W4b manifest header (documented in test.md §H) — acceptable.

### Resolution for planner

1. Fix B1 + B2 (compile/lint correctness).
2. Apply M1 (drop pane-level confirm, align with row #23 precedent).
3. Apply M2 (clarify parity strategy in test.md).
4. Apply M3 (one-line note about 7-vs-6 bgTone union).
5. Bump `dev_log.md` Updated + append a Work Log entry for the revise pass.
6. Re-submit for review.

## Review Notes (2026-05-23 18:55 — Re-review pass · APPROVED)

Reviewer: Claude Opus 4.7 (1M) · scope-bounded to `packages/xai-web-settings-appearance/` + `docs/reviews/xai-web-settings-appearance/`.

Verdict: **APPROVED** — all 5 prior items resolved cleanly. Plan is executable; ready for `feature-auto-build`.

### Per-item verification

- **B1 (icon `"sun"`)** — Verified. `api.md` §4 line 95, `design.md` §4 line 62, `test.md` AC-REG-3 line 92 all assert `"sun"`. Confirmed `"sun"` is line 39 of the `WebShellIconName` union in `packages/xai-web-shell/src/types.ts` and matches the chassis placeholder at `packages/plugin-web-settings-shell/src/internal/paneRegistry.tsx:55`. Compile-clean.
- **B2 (setter disposition)** — Verified. Reading `apps/web/src/App.tsx` lines 62-66 confirms 4 setters are currently `void`'d: `setAccentHue`, `setRailPos`, `setBgTone`, `setFontScale` — plan now correctly enumerates all 4 (previous version said 3). Resolution (api.md §6 lines 124-160) drops the 3 persisted setters from the `usePref` destructure (lines 55-57) and keeps `setFontScale` because the new subscription uses it. The 12-line replacement block (lines 55-66) is fully spec'd. Lint claim "zero unused-vars warnings" is correct: subscription consumes `setTheme/setDensity/setFontScale/setLang`; persisted dims auto-rerender via `usePref`.
- **M1 (no double-confirm)** — Verified. `internal/confirmAction.ts` removed from P1 file list (dev_log Phase Plan note line 48). Pane passes `onReset={handleResetAppearance}` with no nested confirm (api.md §3 lines 83-88; design.md §7 lines 126-128) — mirrors row #23 `FeaturesPane.tsx:44` (`onReset={resetAllFeaturePrefs}`, confirmed via source read). Chassis confirm flow at `SettingsFooter.tsx:85-96` is the sole prompter. AC-RESET-3 (line 83) tests abort path via stubbed `window.confirm=false`; AC-RESET-6 (line 86, NEW) asserts confirm called EXACTLY ONCE. Chassis-prompt UX gap acknowledged + tracked at design.md §15 (TBD: extend `SettingsFooterProps.confirmMessage?`).
- **M2 (parity via emit snapshot)** — Verified. `test.md` §A1 lines 13-25 rewritten with explicit strategy block: subscribe `onWebEvent` listener → call public `resetAllPrefs()` → capture emit map → build appearance subset (drop `lang`) → deep-equal `appearanceDefaults`. AC-DEF-1..9 all reference "captured" values, never `defaults.ts` direct import. AC-DEF-9 (NEW) asserts subset equality. `test.md` §E Mock strategy line 149 explicitly forbids `@internal` import. `api.md` §10 line 266 restates the public-API parity contract.
- **M3 (7-vs-6 bgTone union)** — Verified. Source check confirms `packages/core/src/types/events.ts:26` declares 7 ids (including `sage`). `api.md` §7.1 lines 194-195 add the explicit silent-guarantee block; `api.md` §8 line 211 adds the storage-table footer note; `api.md` §8 codec column updated for `xai_bg_tone`.

### Original gates re-verified

- Seed AC mapping (test.md §F): 7-dim flip / live update / persist / reset / bilingual — all rows traced to tests.
- Persistence keys: no new storage keys; reuses 3 existing entries owned by `"xai-web-settings-appearance"` (registry.ts:140-165).
- Live binding: `applyX` sync + emit pattern (design.md §6 NB) — R1 mitigation idempotent.
- Rail-position preview cards: AC-RENDER-2 + AC-LIVE-6 + B2 AC-APP-4.
- Bilingual via `useI18n`: A5 covers ZH/EN parity for new keys; i18n appendix (api.md §9) lists 27 keys appended in P1.
- Atom consumption via barrel: design.md §3 imports only from public `@repo/*` barrels — no `internal/` paths.
- Pane registration via composition seam: api.md §5 appends ONE branch to `settingsPaneComposition.ts` (line-disjoint with sibling row #24).
- Phase split: 2 phases (within 2-3 seed constraint); P3 contingency documented but not active.
- Lint clean: B2 resolution + dev_log Phase Plan acceptance gate (`lint --max-warnings 0`).
- Cross-vendor verify: explicitly deferred to ship-time per W4b Parallel-Agent manifest header (test.md §H).
- Sibling concurrency safety: row #22 writes to scoped files only; settingsPaneComposition branch is commutative with row #24; App.tsx subscription block at lines 62-66 is line-disjoint with row #23's `modules` filter at lines 88-92; row #24 has no App.tsx edit per its plan.

### Findings

0 blockers, 0 medium-severity recommendations. Plan is ready for `feature-auto-build`.

## Work Log

- 2026-05-23 17:30 · Claude Opus 4.7 (1M) · feature-plan Fresh → 4-pack written; Status NEEDS_REVIEW · commits — · next feature-review
- 2026-05-23 18:10 · Claude Opus 4.7 (1M) · feature-review REVISE → 2 blockers (icon literal `"type"` invalid; App.tsx unused-setter lint gap) + 3 medium (double-confirm; defaults parity test shape; bgTone 7-vs-6 union doc) · Status NEEDS_REVIEW · commits — · next feature-plan
- 2026-05-23 18:35 · Claude Opus 4.7 (1M) · feature-plan Revise → applied all 5 fixes (B1 icon → `"sun"`; B2 setter drop from `usePref` destructure; M1 chassis owns confirm + `internal/confirmAction.ts` dropped from P1; M2 parity via public `resetAllPrefs` emit snapshot; M3 bgTone 7-vs-6 note); design.md §14/§15 added; Phase Plan P2 scope clarified; AC-RESET-6 added; AC-DEF-9 added; risks R9/R10 added · Status NEEDS_REVIEW · commits — · next feature-review
- 2026-05-23 18:55 · Claude Opus 4.7 (1M) · feature-review Re-review → APPROVED. All 5 prior items resolved cleanly: B1 icon `"sun"` valid in WebShellIconName union and matches chassis placeholder; B2 setter disposition explicit (Option 1: drop 3 persisted setters from `usePref` destructure at lines 55-57, keep `setFontScale` for subscription, remove all 4 void lines) — verified App.tsx actually voids 4 setters as plan now states; M1 chassis owns confirm (mirrors row #23 `FeaturesPane.tsx:44`), `internal/confirmAction.ts` dropped, AC-RESET-6 added for single-call assertion; M2 parity test uses public `resetAllPrefs()` emit-snapshot with no `@internal` imports; M3 7-vs-6 union note present at api.md §7.1 + §8. Original gates re-confirmed (seed AC mapping, 2-phase split, line-disjoint sibling concurrency, persistence keys reuse, bilingual i18n). 0 blockers, 0 recommendations. · Status APPROVED · commits — · next feature-auto-build
- 2026-05-23 19:15 · Claude Sonnet 4.6 · feature-auto-build P1 → Package scaffold + AppearancePane + 7-dim live binding + CSS port + 27 i18n keys + 50 unit tests. lint/typecheck/test all pass (0 warnings, 0 errors, 50/50). Commit: 61f6177 · next P2
- 2026-05-23 19:15 · Claude Sonnet 4.6 · feature-auto-build P2 → Host wiring: App.tsx subscription (B2 setter disposition applied — drop 3 usePref setters + replace void block with onWebEvent subscription); settingsPaneComposition.ts appearance branch; apps/web/package.json dep; PLUGIN_MAP.md row #22 append; 4 composition integration tests. apps/web tests 67/67 pass. Status READY_FOR_VERIFY · commits (committed below) · next feature-verify
