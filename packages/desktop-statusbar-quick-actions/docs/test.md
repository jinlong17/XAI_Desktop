# desktop-statusbar-quick-actions — Test Plan

## Validation Goals

- Confirm the native macOS status bar icon/menu works for the normal desktop app, not a background overlay host.
- Confirm quick actions route through the owning active web modules rather than host-side business logic.
- Confirm unavailable targets are surfaced clearly in the native menu.
- Confirm the desktop/web bridge remains browser-safe.

## Contract Checks

- `apps/desktop/src-tauri/src/`
  - installs the status bar/tray during startup
  - owns native menu structure and click handling
  - focuses/shows the `main` window only
  - does not reactivate overlay/control/grid behavior
- browser-safe bridge package
  - mounts from `apps/web/src/providers/AppProviders.tsx`
  - never imports `@tauri-apps/*`
  - consumes only the feature-owned desktop adapter global
  - publishes action availability/status snapshots
- `@repo/plugin-web-pomodoro`
  - exposes and tests the additive desktop-action route/query contract
- `@repo/plugin-web-tasks`
  - exposes and tests the additive today-smart-list route/query contract

## Automated Checks

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Rust Test Coverage

### Status bar/menu helper coverage

- tray/status-bar install helper builds the expected menu item IDs/order
- left-click open/focus rule remains stable
- quick-action menu items can be enabled/disabled and relabeled from snapshot input
- `main`-window-only scope enforcement for any snapshot/update command

### Focus/open behavior coverage

- focus/show helper targets only `main`
- existing `main` window is reused; no extra windows are created
- missing `main` window path reports a typed/native error instead of silently reviving legacy windows

## Web / bridge coverage

### Browser-safe bridge tests

- mocked `window.__XAI_DESKTOP_STATUSBAR__` adapter receives published snapshots
- non-desktop runtime degrades to `unsupported_runtime`
- quick-action subscription dispatches:
  - `open-app`
  - `start-pomodoro`
  - `view-today-tasks`
- no `@tauri-apps/*` or `window.__TAURI__` leak into the browser-safe package

### Owning-module contract tests

- `@repo/plugin-web-pomodoro`
  - desktop action starts focus when idle
  - desktop action resumes when paused
  - desktop action does not create a duplicate session when already running
- `@repo/plugin-web-tasks`
  - `smart=today` selects the today smart list
  - absence of the contract leaves default module state unchanged

### Feature-pref availability tests

- when `tasks` feature is disabled, the bridge snapshot marks `viewTodayTasks` unavailable with `feature_disabled`
- when `pomodoro` feature is disabled, the bridge snapshot marks `startPomodoro` unavailable with `feature_disabled`

## Manual macOS Smoke

- launch the desktop app on real macOS hardware
- verify the status bar icon is visible and stable
- verify left click opens/focuses the app as designed
- verify the menu shows:
  - open/focus app
  - start pomodoro
  - today's tasks
  - status rows
- verify `Start Pomodoro` focuses the app and triggers the pomodoro module contract
- verify `Today's Tasks` focuses the app and lands on the today smart-list state
- verify disabled/degraded states are visible when:
  - tasks feature is turned off
  - pomodoro feature is turned off
  - the bridge is unavailable
- verify no overlay/control/grid windows are created

## Mock Strategy

- mock the feature-owned desktop adapter global in browser-safe tests
- use React Router memory routing to test query-param contracts
- do not import `@tauri-apps/*` in web/unit tests
- keep notifications status optional in tests; do not require the notifications row to be present

## Residual Risks

- real macOS tray/menu click behavior and focus transitions still require on-device verification
- the quick-action contracts are additive to active web modules and may need careful one-shot handling to avoid duplicate triggers under Strict Mode
- optional notifications-status mirroring must stay non-blocking if the sibling bridge is absent
