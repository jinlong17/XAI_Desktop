# desktop-phase2-integrated-rc-gate — Test Plan

## Validation Goals

- Confirm the six Phase 2 slices still compose into one normal-window desktop app without reopening Phase 1 or Phase 3 scope.
- Confirm repo-side readiness is backed by current automated evidence, not only inherited row status.
- Confirm real-macOS smoke can classify each slice and the key cross-slice interactions honestly.
- Keep external-release readiness for row `#1` separate from repo-side build/test readiness.

## Contract Checks

- `packages/desktop-native-notifications-reminders/docs/*`
  - notifications permission/delivery contract and manual-smoke matrix remain the owning truth
- `packages/desktop-statusbar-quick-actions/docs/*`
  - tray/status menu contract remains the owning truth
- `packages/desktop-global-hotkey-quick-open/docs/*`
  - quick-open registration/persistence/recovery contract remains the owning truth
- `packages/desktop-full-macos-menu-polish/docs/*`
  - full native menu contract remains the owning truth
- `packages/desktop-auto-update-release-channel/docs/*`
  - updater `check/status-only` and explicit install-unavailable contract remain the owning truth
- `packages/desktop-last-data-cache-polish/docs/*`
  - desktop-offline cache truthfulness contract remains the owning truth
- `packages/desktop-real-macos-release-smoke/docs/dev_log.md`
  - current external-release prerequisite status must be mirrored honestly in the final integrated verdict

## Automated Baseline

Recommended integrated reruns before or alongside manual smoke:

- `pnpm --filter @repo/desktop-native-notifications-reminders test`
- `pnpm --filter @repo/desktop-statusbar-quick-actions test`
- `pnpm --filter @repo/desktop-global-hotkey-quick-open test`
- `pnpm --filter @repo/desktop-auto-update-release-channel test`
- `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/notificationsPane.test.tsx src/__tests__/hotkeysPane.test.tsx src/__tests__/aboutPane.test.tsx`
- `pnpm --filter @repo/plugin-web-pomodoro test`
- `pnpm --filter @repo/plugin-web-tasks test`
- `pnpm --filter @repo/plugin-web-board-workspaces test`
- `pnpm --filter @repo/plugin-web-habits test`
- `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx src/config/sourcemapPolicy.test.ts src/routes/router.integration.test.tsx`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web run build:secure`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop tauri build --debug --bundles app`

If no repo-side changes are required, feature-build may cite still-fresh upstream verify evidence for some slice-local commands, but the integrated row should still rerun the canonical web/rust/desktop baseline before claiming current repo-side readiness.

## Browser-safety / Bundle Checks

- built `apps/web/dist` must contain no public sourcemaps in the shipped artifact set
- no `@tauri-apps/*` or `__TAURI__` leakage in browser-rendered source or built desktop-facing web assets
- browser-safe bridge packages remain host-injected adapters rather than direct web imports of native APIs

## Manual macOS Integrated Matrix

### Notifications

- verify granted / denied / disabled / unsupported states
- verify task reminder delivery
- verify pomodoro completion delivery
- verify calendar reminder delivery

### Status bar

- verify status bar icon visibility and stability
- verify left click/menu focus behavior
- verify `Start Pomodoro` and `Today's Tasks`
- verify degraded/disabled states when features or bridges are unavailable

### Global hotkey

- verify default registration
- verify background focus/open behavior
- verify disable and preset persistence across relaunch
- verify conflict state plus Help-menu recovery actions

### Full menu

- verify top-level native sections and standard window/app actions
- verify support/diagnostic item enablement
- verify coexistence with status bar and hotkey affordances

### Updater

- verify About-pane version/channel/state rendering
- verify explicit disabled reasons when config is missing/placeholder
- verify check result can distinguish:
  - no update
  - update available
  - network/signature-style failure
- verify update-available state still explains install is unavailable in this row

### Cache

- verify offline relaunch with readable cache
- verify offline relaunch with tracked keys absent
- verify offline relaunch with malformed tasks/boards/habits cache
- verify `/app` remains reachable and truthful with no overlay/control/grid startup

## Cross-slice Interaction Checks

- status bar quick actions and hotkey focus the normal `main` window only
- Help-menu recovery items remain sensible after hotkey state changes
- updater status and cache-status shell UI can coexist without misleading startup copy
- notifications disabled/denied/unsupported states do not break status bar, menu, or hotkey surfaces

## Regression Policy

- If no repo-side defect reproduces, do not make code changes.
- If a repo-side defect reproduces, fix only the minimal owning surface and rerun:
  - the affected slice tests
  - the integrated web/rust/desktop baseline
  - the affected manual macOS smoke item

## Mock Strategy

- reuse each dependency row's existing browser-safe adapter seams and focused mocks
- prefer real build artifacts and real macOS interaction over simulated UI proof for this row
- do not add new cross-slice mock infrastructure unless a blocker repair needs narrow regression coverage

## Acceptance Rules

- each of the six Phase 2 slices is classified in the final integrated report
- repo-side readiness is explicit and evidence-backed
- row `#1` status is called out separately as an external-release prerequisite
- no unclassified integrated slice remains at the end of build/verify
