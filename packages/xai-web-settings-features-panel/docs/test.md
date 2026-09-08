# Test Strategy — xai-web-settings-features-panel

## A. Unit tests (Vitest + RTL)

### A1. `filterModulesByFeaturePrefs.test.ts`
- AC-FILTER-1: All prefs true → returns input array unchanged (by value).
- AC-FILTER-2: One pref false → returns input minus that module.
- AC-FILTER-3: Module with moduleId NOT in FeatureId is always retained (e.g. countdown, ai, statistics, settings).
- AC-FILTER-4: Pure function — same inputs produce structurally equal output across calls.

### A2. `useFeaturePrefs.test.tsx`
- AC-PREFS-1: First read returns `{ tasks:true, board:true, ..., meditation:true }`.
- AC-PREFS-2: After `setPref("xai_pref_features_board", false)`, subscribers receive `prefs.board === false` on next render.
- AC-PREFS-3: `localStorage` round-trip — after manual `localStorage.setItem('xai_pref_features_tasks', 'false')` and hook remount, returns `prefs.tasks === false`.

### A3. `FeaturesPane.test.tsx`
- AC-PANE-1: Renders 8 SettingRow elements in `featureIdOrder` order.
- AC-PANE-2: Each row shows the module name from `useI18n("nav.<id>")`.
- AC-PANE-3: Clicking a Toggle flips the underlying pref (verified via reading `usePref` in a sibling).
- AC-PANE-4: Renders 8 distinct `FeatureThumb` SVG kinds (no external img/network).
- AC-PANE-5: Bilingual — `lang="zh"` swaps to Chinese strings.
- AC-PANE-6: `<SettingsFooter>` Reset restores all 8 prefs to true.

### A4. `DisabledFeatureFallback.test.tsx`
- AC-FB-1: Renders the module name + body copy + CTA hint.
- AC-FB-2: Bilingual — EN/ZH variants.
- AC-FB-3: Unknown moduleId path renders a safe generic copy + DEV warn.

### A5. `withDisabledFallback.test.tsx`
- AC-WRAP-1: When pref is true, the original render is invoked verbatim (DOM tree identical to baseline).
- AC-WRAP-2: When pref is false, every child path renders `<DisabledFeatureFallback>` regardless of route.
- AC-WRAP-3: `moduleId/label/icon/railOrder/i18nKey/showInRail` are preserved 1:1.
- AC-WRAP-4: Wrapping is idempotent — wrapping twice yields the same behavior (the inner wrapper short-circuits when pref is false).

### A6. `featuresPane.test.ts` (registry surface)
- AC-REG-1: `featuresPane.id === "features"` (matches `SettingsPaneId`).
- AC-REG-2: `featuresPane.i18nKey === "settings.features"`.
- AC-REG-3: `featuresPane.render({ lang: "en" })` returns a `<FeaturesPane lang="en" />` React element.

## B. Integration tests

### B1. `paneComposition.integration.test.tsx`
- AC-COMP-1: `composeSettingsPaneRegistry()` returns 13 panes (same length as `paneRegistry`).
- AC-COMP-2: The `features` entry is `featuresPane` (not the placeholder).
- AC-COMP-3: The other 12 entries are byte-identical to `paneRegistry`.

### B2. `App.tsx`-level integration (RTL)
- AC-APP-1: With default prefs, all 12 rail registrations render (counted via `shellRegistrations` count - settings/showInRail false).
- AC-APP-2: After flipping `xai_pref_features_board` to false, rail no longer contains the Board entry.
- AC-APP-3: Reload (remount) restores the disabled state from localStorage.

### B3. Deep-link fallback
- AC-LINK-1: Mounting `<BoardSlot>` (wrapped via `withDisabledFallback`) while pref is off renders `<DisabledFeatureFallback>`.
- AC-LINK-2: Same mount while pref is on renders the original `<BoardWorkspacesModule>` shape.

## C. Lint + typecheck

- `pnpm --filter @repo/plugin-web-settings-features-panel lint --max-warnings 0` must pass.
- `pnpm --filter @repo/plugin-web-settings-features-panel typecheck` must pass.
- Existing packages whose registry/host files this row edits must continue passing their lint:
  - `@repo/plugin-web-storage` (registry.ts append).
  - `@repo/plugin-web-tokens` (i18n.ts append).
  - host `web` Vite app (App.tsx + settingsPaneComposition.ts + shellRegistrations.tsx).

## D. Mock strategy

- Use real `usePref` against `localStorage` (jsdom). No mocks for storage layer.
- Mock `WebShellProvider` in component tests where pane components are mounted standalone, via the existing `ShellFixture` pattern from `@repo/xai-web-shell/__fixtures__/ShellFixture`.
- For integration App-level tests, mount the real `App` with `MemoryRouter` if needed.

## E. Acceptance criteria (from seed brief)

1. User toggles 4 modules off → rail re-renders without them. (B2 covers via spot-check.)
2. Deep-link to a disabled module shows the empty state. (B3 covers.)
3. Reload preserves the choice. (A2 + B2 cover.)
4. Reset restores all 8 on. (A3 covers.)
5. SVG thumbnails inline; bilingual; lint clean; one commit per phase.
