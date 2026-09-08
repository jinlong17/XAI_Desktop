# Design — xai-web-settings-features-panel

> Decision snapshot for roadmap row #23 (W4b). Authoritative dependency map below.

## 0. Decision snapshot

- **Selected Option**: Option A — 8 boolean `xai_pref_features_*` registry entries; per-module Toggle UI; pane substitution via `settingsPaneComposition.ts`; rail filter helper in App.tsx.
- **Review Doc**: `docs/reviews/xai-web-settings-features-panel/20260523-discovery-review.md`
- **Review Date**: 2026-05-23

## 1. Frozen assumptions

- The 8 toggleable modules are: `tasks · board · dashboard · calendar · matrix · pomodoro · habits · meditation`.
- All 8 modules are READY_TO_SHIP and their slot registrations are stable surfaces consumed via package barrels.
- Pet is NOT in scope (governed by `web:shell:pet-toggle`).
- `countdown / ai / statistics / settings` are intentionally never user-toggleable.
- Default state: all 8 prefs default to `true` (every module enabled).
- Persistence: localStorage via `@repo/plugin-web-storage` `usePref` + `PREF_REGISTRY`.
- Cross-window live update: `web:settings:preference-changed` already covers the canonical 7 WebPreferenceKey; the 8 features prefs do NOT extend that union — local same-tree React update from `usePref` is sufficient for v1 acceptance.

## 2. Dependency overview

| Layer | Package | Why |
|-------|---------|-----|
| Atoms | @repo/plugin-web-settings-shell | Toggle, SettingRow, SectionBlock, SettingsFooter, paneRegistry, Pane type |
| Storage | @repo/plugin-web-storage | usePref, PREF_REGISTRY edits |
| i18n | @repo/plugin-web-tokens | useI18n + 3 new keys |
| Event bus | @repo/xai-web-event-bus | (optional v1) listen to preference-changed for cross-row updates |
| Host wire-up | apps/web | composeSettingsPaneRegistry + App.tsx filter |
| Slot types | @repo/xai-web-shell | WebModuleSlotRegistration |

## 3. Public surface (target)

`index.ts` (the only allowed entry):

- `featuresPane: Pane` — replaces the placeholder `features` entry in `paneRegistry`.
- `FeaturesPane({ lang })` — pane component (exported for tests; pane wraps it).
- `useFeaturePrefs(): Record<FeatureId, boolean>` — reads all 8 prefs.
- `filterModulesByFeaturePrefs<T>(modules: readonly T[], prefs: Record<FeatureId, boolean>): T[]` — pure helper, easy to test.
- `DisabledFeatureFallback({ moduleId, lang })` — empty state shown when a route is reached while its pref is off.
- `withDisabledFallback(reg: WebModuleSlotRegistration, moduleId: FeatureId): WebModuleSlotRegistration` — adapter that wraps the module's child renders so disabled modules show the fallback instead of the real render.
- `featureIdOrder: readonly FeatureId[]` — stable display order for the pane.
- Types: `FeatureId`, `FeaturesPaneProps`, `FeaturePrefs`, `DisabledFeatureFallbackProps`.

## 4. Component map

```
FeaturesPane
└── SectionBlock                (atom from settings-shell)
    └── SettingRow × 8          (atom from settings-shell, one per module)
        ├── label = useI18n("nav.<id>")
        ├── desc  = useI18n("settings.features_desc_<id>") with fallback
        ├── Toggle on={prefs[id]} onChange={() => setPref(`xai_pref_features_${id}`, !prefs[id])}
        └── FeatureThumb kind="<id>"  (rendered below SettingRow in feat-card class)
└── SettingsFooter onSave={…}    (atom from settings-shell — broadcasts noop save flash; resets restore all 8 to true)
```

`DisabledFeatureFallback` — full-bleed centered empty state with module name, body copy, and a CTA-style hint "Re-enable in Settings → Features".

## 5. State model

- 8 booleans, source of truth = `PREF_REGISTRY` entries with codec `boolean`, default `true`, category `pref`, owner `xai-web-settings-features-panel`.
- `useFeaturePrefs()` returns a stable object reference per render (built from `usePref` values).
- `filterModulesByFeaturePrefs(modules, prefs)` returns a new array excluding any `WebModuleSlotRegistration` whose `moduleId` matches a `FeatureId` with `prefs[id] === false`.
- `featuresPane.render({ lang })` reads `usePref` for each of the 8 keys + delegates to `<FeaturesPane>`.

## 6. Events

- Consumes: none required for v1.
- Emits: none required for v1 (`SettingsFooter` already broadcasts an empty-save flash; we do NOT extend the WebPreferenceChange union for features prefs).

## 7. Open dimensions deferred

- Cross-tab feature sync.
- Per-module description overrides via PREF_REGISTRY metadata (not needed yet).
- Pet on/off in this pane (rejected — owned by xai-web-shell row #5).

## 8. References

- Source: `web design/module-settings.jsx` lines 156-301
- Spec: `web design/DESIGN.md` §4.12
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S7 + §S8
- Chassis api.md §8 — sibling row pattern
