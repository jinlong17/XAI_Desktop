# Feature Brief — desktop-global-hotkey-quick-open

| Field | Value |
|---|---|
| Feature | desktop-global-hotkey-quick-open |
| Title | Phase 2 Desktop Global Hotkey Quick Open |
| Date | 2026-05-28 |
| Source | Roadmap row #4 seed brief `docs/reviews/desktop-global-hotkey-quick-open/20260528-roadmap-seed.md` on `dev` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Add a global shortcut that shows or focuses the normal desktop app window. Include shortcut conflict handling, a user-visible disabled state, and persisted configuration.

The active product remains the shipped ADR-0011 normal-window Tauri app around `apps/web`. This feature must not revive the transparent overlay, grid windows, or control window.

## Naming Rationale

The provided slug already matches the job:

- `desktop` — scope is the native macOS/Tauri shell on `dev`
- `global-hotkey` — the feature is an app-wide native shortcut, not an in-page keyboard binding
- `quick-open` — the action is to reveal/focus the normal desktop app window, not to toggle legacy overlay surfaces

## Scope

- Native global shortcut registration owned by `apps/desktop/src-tauri/`
- Main-window show/focus behavior for the shipped normal desktop window only
- Host-owned persistence for the desired shortcut preference and enabled/disabled state
- Runtime conflict or registration-failure classification that is visible to the user
- A browser-safe desktop hotkey package for settings UI integration without leaking Tauri imports into `apps/web`
- Recovery affordances through native menu items and desktop settings UI

## Non-goals

- No transparent overlay, grid-window, or control-window toggle behavior
- No dependency on `desktop-statusbar-quick-actions`; shared helpers may be deduplicated later but this feature must stand alone
- No generic multi-feature shortcut registry or plugin-SDK shortcut framework in this row
- No Phase 3 storage architecture, SQLite schema, sync queue, or local-first entity persistence
- No browser-side `@tauri-apps/*` imports or `window.__TAURI__` references in `apps/web/src/**/*`
- No cold-launch-from-not-running guarantee; the shortcut is for the running desktop app process

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The selected plan defines:
  - the native shortcut registration owner
  - the persisted preference shape and migration strategy
  - the runtime conflict/disabled/error state model
  - the user-visible configuration and recovery affordances
  - the main-window show/focus contract with no overlay/grid/control behavior
- The feature keeps the Tauri host as the native owner and does not move shortcut business into `apps/web`
- Verification requirements cover Rust tests, browser-safe settings tests, build gates, and real macOS manual smoke for registration, relaunch persistence, and conflict recovery

## Current Baseline

- `desktop-tauri-web-dist-normal-window` is SHIPPED and the active app is a single normal Tauri window loading `apps/web`
- `desktop-basic-macos-menu-config-store` is SHIPPED and already owns:
  - the native app menu
  - the host-owned `app-config.json`
  - persisted main-window frame/state
- `desktop-statusbar-quick-actions` is a sibling Phase 2 row, not a prerequisite
- `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx` is currently a read-only hotkeys table with no desktop-global-shortcut controls
- `apps/desktop/src-tauri/Cargo.toml` does not currently include a global-shortcut plugin dependency

## Deferred Validation

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/hotkeysPane.test.tsx`
- `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`
- Manual macOS verification for:
  - first-run default registration
  - disabled state persistence across relaunch
  - changed shortcut persistence across relaunch
  - conflict or registration-failure visibility
  - recovery through menu/settings affordances
