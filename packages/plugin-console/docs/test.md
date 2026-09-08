# plugin-console — Test Plan

## Automated Checks

```bash
pnpm --filter @repo/core check-types
pnpm --filter @repo/plugin-console check-types
pnpm --filter @repo/plugin-console test
pnpm --filter desktop build
pnpm --filter @repo/plugin-productivity check-types
pnpm --filter @repo/plugin-labels check-types
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Unit Coverage

- `@repo/core`
  - `ConsoleView` type/registry helpers
  - manifest validation for `windows.console` and required ConsoleView exports
  - typed event payload helpers
- `plugin-console`
  - shell state reducers/selectors for nav, pane widths, theme/density/font scale, and persisted restore
  - command palette timeout/partial-result behavior
  - placeholder/error-state rendering for missing modules
- `plugin-productivity`
  - ConsoleView adapters for Todo/Pomodoro/Habit/Matrix keyboard flows
  - revision-aware event handling where Console-specific bridging is added
- `plugin-labels`
  - ConsoleView adapter and label search/selection behavior

## Contract Coverage

- Registry contract: console-enabled plugins without required ConsoleView export fail validation.
- Manifest contract: `windows.console` and `ui.consoleSidebar` schema changes remain type-safe and CI-enforced.
- Tauri command contract: open/focus/close/frame operations serialize and restore the same `ConsoleWindowFrame` shape.
- Event contract: `console:*` payloads, `productivity:*` listeners, and ack/reconcile flows are exercised with mocked emit/listen adapters.
- Host routing contract: `pnpm --filter desktop build` must pass once the Console route and host bridge wiring are added in Phase 2.

## E2E / Regression Focus

- Open Console window, close it, reopen it, and restore frame + nav state.
- Resize/collapse sidebar/list/detail panes and verify persistence restore.
- Navigate all five in-scope modules by keyboard only.
- Run Cmd+K against mixed Todo/Label/module results and verify 200ms cutoff behavior.
- Edit data in Console and verify overlay listeners refresh on newer revisions only.
- Toggle theme/density/font scale and verify no shell flash.

## Mock Strategy

- Phase 2 uses Contract Mock providers for `plugin-productivity`, `plugin-labels`, and account sync state so shell work can proceed before those plugins are Stable.
- Because `plugin-productivity` and `plugin-labels` are not yet registered in `docs/PLUGIN_MAP.md`, Phase 3/4 real-module tests are not schedulable until that authority gap is closed by the owning tracks.
- Calendar/widgets remain disabled placeholder entries only; they are not runtime dependencies this round.
- Mocks are removed incrementally:
  - Phase 3 replaces productivity mocks with real ConsoleViews only after `docs/PLUGIN_MAP.md` contains a canonical `plugin-productivity` row
  - Phase 4 replaces label mocks with real ConsoleViews only after `docs/PLUGIN_MAP.md` contains a canonical `plugin-labels` row
- `entity_change_log` / ack / reconcile behavior is validated with mocked repository/event listeners in automation; real multi-window macOS behavior is deferred to manual gates.

## Manual / Deferred Gates

- `pnpm --filter desktop tauri dev` on real macOS for window lifecycle, menu bar, multi-Space, and Stage Manager behavior
- Visual verification that toolbar/header/search/notification/settings shells match the planned three-pane structure
- Keyboard accessibility pass for Sidebar/List/Detail focus loops and escape hatches

## Acceptance Focus

- Reviewer can map each build phase to one or more measurable acceptance criteria.
- Contract Mock is clearly temporary and does not hide the required end-to-end integrations.
- Real-macOS gates are documented as deferred verification items, not silently ignored.
