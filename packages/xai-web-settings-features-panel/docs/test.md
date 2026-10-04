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
- AC-PANE-6: Reset restores all 8 prefs to true. The test title still names `<SettingsFooter>`; the pane now renders the Features-local "Reset to defaults" control, found by the same role/name locator with the same `window.confirm` stub.
- Writes are asynchronous (per-key Web Lock, verified readback): AC-PANE-3 and AC-PANE-6 only install the local Web Lock fixture (`featuresLockFixture.ts`) and await real async completion before their unchanged business assertions.

### A3b. `FeaturesPaneRecovery.test.tsx` (recovery caller, contract `docs/reviews/web-features-recovery-contract/contract.md`)
Real storage hook, engine, registry and `accountScope`; the local exclusive Web Lock fixture; attempt-logging Storage spies; a `window.confirm` recorder; a StorageEvent counter; a host guard registry mirroring the departure coordinator.
- FR1: Absent and valid mounts and rerenders make zero writes; the guard registers at a clean mount (label Features) and never blocks; no Saved claim; no Save & apply / `settings-footer-save`.
- FR2: Every switch stores exact unscoped bytes in both directions; on is stored as `true`, never a removal; Saved after a genuine success; no StorageEvent.
- FR3: A failed write keeps the latest choice with `<Label> was not saved.`, Retry, Discard, Export, Discard all, guard and a storage-free beforeunload warning; Retry writes the latest bytes once.
- FR4: Unreadable and malformed sources display the default with a Reload-only alert and no guard or warning; Reload rereads only its field, writes nothing, refocuses the switch and never claims Saved.
- FR5: Two same-turn activations invert the latest intent and return to the original through two operations.
- FR6: A held per-key lock shows the choice at once with `<Label> is saving.`; the switch stays enabled; one write after release.
- FR7: A failed predecessor blocks the queued latest; Retry advances it without acknowledging the latest.
- FR8: Readback uncertainty keeps Retry and reconciles with exactly one total write.
- FR9: Reset to defaults has `data-testid="features-reset-defaults"`, asks the normative confirmation once; declining makes zero get/set/remove attempts.
- FR10: An accepted reset reaches verified absence for all 8 keys, never writes, leaves unrelated keys and dispatches no StorageEvent; Defaults restored.
- FR11: An already-absent reset completes through verified no-ops (zero removes).
- FR12: A refused removal keeps a reset draft (on, not reset, guard, `{"operation":"reset"}` export); Retry removes only that key once.
- FR13: A duplicate Reset to defaults while the batch is pending enqueues no duplicate removes.
- FR13b: A repeated Reset to defaults never rebases a failed reset: while the batch is unresolved it re-attempts only that removal, and after an intervening edit the next batch adopts it (one removal, no set) and reports Defaults restored.
- FR14: An invalid source refuses the reset and keeps the intent; Retry never purges; Discard returns to Reload-only and refocuses the switch.
- FR15: set→reset and reset→set orderings: the latest intent governs; the superseded one never surfaces; a newer edit supersedes Defaults restored.
- FR16: Export is memory-only under total storage denial with the set/reset envelope, the anchor removed and the URL revoked; a setup failure shows `Export failed. Please retry.` and keeps drafts and guard.
- FR17: An account epoch change renews the guard token; old guard and inline callbacks refuse before rerender; the fresh guard protects and discards the surviving device draft; no account key or lifecycle lock is touched.
- FR18: Unmount removes the guard and the beforeunload listener and never undoes committed writes.
- FR19: Focus lands on the field's switch after Discard and after a successful Retry, and stays inside `.features-pane` after Discard all.
- FR20: Readers reflect committed bytes only (a refused reset keeps Calendar off in `useFeaturePrefs`); a mounted legacy reader of an unrelated key is never repainted by a reset.
- FR21: ZH wording for the confirmation, recovery actions, export, statuses and the guard label 功能.

The frozen acceptance oracles (Sol jsdom modes, actual-host, native and Features F1 runners under `docs/reviews/web-features-recovery-*`) are run unchanged by independent verifiers and are not part of this package's suite.

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
- FeaturesPane writes go through the async engine under the real per-key Web Lock; jsdom has none, so pane tests install the local exclusive lock fixture (`src/__tests__/featuresLockFixture.ts`), which can also hold, deny or remove a lock.
- Mock `WebShellProvider` in component tests where pane components are mounted standalone, via the existing `ShellFixture` pattern from `@repo/xai-web-shell/__fixtures__/ShellFixture`.
- For integration App-level tests, mount the real `App` with `MemoryRouter` if needed.

## E. Acceptance criteria (from seed brief)

1. User toggles 4 modules off → rail re-renders without them. (B2 covers via spot-check.)
2. Deep-link to a disabled module shows the empty state. (B3 covers.)
3. Reload preserves the choice. (A2 + B2 cover.)
4. Reset restores all 8 on. (A3 and A3b cover.)
5. SVG thumbnails inline; bilingual; lint clean; one commit per phase.
