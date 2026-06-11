# desktop-statusbar-quick-actions — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — new Rust-owned native status bar module plus a feature-owned browser-safe desktop bridge and additive owning-module quick-action contracts |
| Review Doc Path | `docs/reviews/desktop-statusbar-quick-actions/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 2 desktop-native shell affordance on top of the shipped normal-window Tauri host |

## Frozen Assumptions

- The active desktop product remains the ADR-0011 normal-window Tauri wrapper around `apps/web`; overlay/control/grid surfaces stay quarantined.
- The Tauri host owns native status-bar/tray behavior only. It must not absorb pomodoro/task business logic or read web-module internals directly.
- `apps/web/src/**/*` and browser-shared packages remain browser-safe:
  - no `@tauri-apps/*`
  - no `window.__TAURI__`
- `@repo/plugin-web-pomodoro` and `@repo/plugin-web-tasks` are the active owning surfaces for the requested quick actions, but they need additive public desktop-action contracts in this row.
- `@repo/plugin-web-settings-features-panel` can disable `tasks` and `pomodoro`; the native menu must surface that as explicit unavailable state.
- Notification integration is optional only. This row must work without `desktop-native-notifications-reminders` being present at runtime.
- Existing `commands/menubar.rs` sync-status code is prior art, not the ownership boundary for this row.

## Dependency Overview

- Upstream authority:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row #3
  - `docs/reviews/desktop-statusbar-quick-actions/20260528-feature-brief.md`
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
- Desktop/native prerequisites:
  - `desktop-tauri-web-dist-normal-window` SHIPPED
  - `desktop-basic-macos-menu-config-store` SHIPPED
- Stable active web/runtime dependencies:
  - `@repo/plugin-web-pomodoro`
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-settings-features-panel`
  - `@repo/plugin-web-storage`
  - `@repo/core` runtime-profile helpers
- Optional sibling signal source:
  - `@repo/desktop-native-notifications-reminders/web` (status only; not required)

## Native Shape After This Feature

- The desktop app installs a native macOS status bar icon/menu during startup.
- The status bar owns:
  - app open/focus
  - quick-action click dispatch
  - native enabled/disabled/status rows
- The app remains a normal Dock-visible main window; the status bar is an affordance, not a replacement host mode.
- The web runtime mounts a browser-safe bridge that publishes status snapshots and handles incoming quick-action requests.

## Ownership Shape

Recommended owning slice:

- `packages/desktop-statusbar-quick-actions/`

Recommended responsibilities:

- browser-safe `/web` entrypoint
- feature-owned desktop adapter type contract
- quick-action availability snapshot
- native menu status projection
- bridge mount for route/action dispatch into owning web modules

Recommended thin host responsibilities:

- Rust tray/status-bar install
- main-window focus/show helper
- feature-owned init-script / adapter injection
- native menu item updates based on published snapshots

## Planned Runtime Split

### Phase 1 — Native Status Bar Foundation

- Add a dedicated Rust-owned statusbar module/state.
- Install the tray/status-bar icon during `lib.rs` setup.
- Build the native menu with stable item IDs.
- Implement a main-window focus/show helper for `main` only.

### Phase 2 — Browser-safe Desktop Bridge

- Add `@repo/desktop-statusbar-quick-actions/web`.
- Mount the bridge from `apps/web/src/providers/AppProviders.tsx`.
- Inject a feature-owned desktop adapter global from the Tauri host.
- Publish native status snapshots from the web runtime back to the host.

### Phase 3 — Owning Quick-action Contracts

- `@repo/plugin-web-pomodoro`:
  - additive contract for `desktopAction=start-focus`
- `@repo/plugin-web-tasks`:
  - additive contract for `smart=today`
- bridge translates native quick-action requests into route/query navigation only; the modules own the actual behavior

### Phase 4 — Status Polish and Verification

- reflect feature-disabled / unsupported / loading states in the native menu
- optional notifications-status mirroring only if already available
- add Rust/menu tests, browser-safe bridge tests, and real-macOS smoke expectations
