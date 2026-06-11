# Discovery Review — desktop-statusbar-quick-actions

## Problem Framing

Phase 2 needs a native macOS status bar affordance for the shipped normal-window desktop app without reopening the old overlay architecture and without pushing business logic down into the Tauri host.

The accepted requirement is narrower than "make the app a background tray app":

- add a macOS status bar icon and quick-action menu for the normal desktop app
- focus or open the main app window from the status bar
- trigger "start pomodoro" and "today's tasks" through the owning active web/plugin surfaces
- expose basic status and degrade clearly when a quick action is unavailable
- keep Phase 2 scoped away from global hotkeys, app-menu polish, updater, and Phase 3 local-first storage work

Current repo reality:

- the active desktop runtime is the ADR-0011 normal-window Tauri app around `apps/web`
- `apps/web/src/**/*` is still browser-safety constrained; it must not import `@tauri-apps/*` or touch `window.__TAURI__`
- `apps/desktop/src-tauri/src/app_menu.rs` already owns the native app menu and proves the current Phase 1 shell is Rust-owned for native affordances
- `apps/desktop/src-tauri/src/commands/menubar.rs` exists, but it is a sync-status-specific tray surface with sync-only semantics and no active startup install on the Phase 1/P2 path
- `@repo/plugin-web-pomodoro` is a Stable active web module, but its start/pause/resume behavior is internal to `PomodoroModule`
- `@repo/plugin-web-tasks` is a Stable active web module, but its "today" smart list is internal component state in `TasksSidebar`, not an external route/query contract
- `@repo/plugin-web-settings-features-panel` can disable `tasks` and `pomodoro`, so the status bar needs a real unavailable-state contract instead of blindly assuming both modules are always actionable

That leaves three planning questions:

1. Where does the native status bar surface live without leaking Tauri APIs into `apps/web`?
2. How are quick actions routed so the host stays a bridge and the owning web modules keep their business logic?
3. How does the native menu know whether a target is ready, disabled, or unsupported?

## Naming Rationale

Keep the roadmap slug `desktop-statusbar-quick-actions`.

Why it fits:

- `desktop` keeps the scope on the Tauri/macOS host on `dev`
- `statusbar` points at the native menu-bar/tray affordance
- `quick-actions` communicates a compact action launcher/status surface, not a full alternate host mode

## External Research

This feature depends on current Tauri tray/menu behavior, so the discovery pass checked primary sources.

### Search Queries

- `site:tauri.app learn system tray tauri 2`
- `site:tauri.app learn window menu tauri 2`
- `site:docs.rs tauri CheckMenuItem set_enabled set_text`

### Source Evidence

- Tauri System Tray docs: <https://v2.tauri.app/learn/system-tray/>
  - Tauri 2 supports tray/status-bar icons behind the `tray-icon` feature.
  - Tray icons can attach native menus, opt out of showing the menu on left click, and handle menu/tray events in Rust.
- Tauri Window Menu docs: <https://v2.tauri.app/learn/window-menu/>
  - Native menus can be attached to windows or system trays.
  - On macOS, menus are expected to be structured under submenus.
- `tauri::menu::CheckMenuItem` docs: <https://docs.rs/tauri/latest/tauri/menu/struct.CheckMenuItem.html>
  - Menu items support runtime `set_text(...)`, `set_enabled(...)`, and checked-state updates.
- `tauri::menu::Menu` docs: <https://docs.rs/tauri/latest/tauri/menu/struct.Menu.html>
  - `Menu` is desktop-only and on macOS global menus may contain only submenus, reinforcing the current app-menu baseline while the tray menu remains its own native menu surface.

## Candidate Options

### Option A — New Rust-owned status bar module plus a feature-owned browser-safe desktop bridge

Build a new native status bar/tray module for this feature and pair it with a feature-owned browser-safe bridge package, following the same general desktop/web split used by `desktop-native-notifications-reminders`.

Recommended split:

- Native host:
  - add a new `statusbar` command/state module under `apps/desktop/src-tauri/src/commands/`
  - install a tray/status-bar icon during startup
  - build the native menu in Rust
  - focus/show the main window on app-open actions
  - emit quick-action requests into the main webview through a feature-owned desktop adapter seam
  - accept status snapshots from the main webview so native menu items can be enabled/disabled and status text can update
- Browser-safe feature package:
  - add `@repo/desktop-statusbar-quick-actions/web`
  - mount it from `apps/web/src/providers/AppProviders.tsx`
  - keep it browser-safe: no `@tauri-apps/*`, no `window.__TAURI__`
  - consume only a host-injected feature-owned global adapter
- Owning web modules:
  - `@repo/plugin-web-pomodoro` adds a public quick-action contract for `start-focus`
  - `@repo/plugin-web-tasks` adds a public quick-action contract for `smart=today`

Pros:

- matches the active P1/P2 desktop architecture
- keeps native shell behavior in Rust and business actions in the owning web/plugin surfaces
- preserves the browser-safety contract already established for desktop bridges
- allows explicit enabled/disabled/degraded menu states driven by the real runtime
- keeps the older sync tray implementation as prior art instead of mutating it into a new semantic owner

Cons:

- requires a new two-way bridge contract instead of a one-file Rust-only change
- needs additive public contracts in both tasks and pomodoro modules before the quick actions are actually valid
- adds coordination across host, bridge, and owning-module tests

### Option B — Reopen the legacy sync menubar module and extend it into the app quick-action owner

Reuse `apps/desktop/src-tauri/src/commands/menubar.rs` and evolve it from the old sync-status tray into the new desktop quick-actions surface.

Pros:

- reuses existing tray/icon code and prior tests
- keeps everything in Rust

Cons:

- semantically wrong owner: the file and state model are about sync status, not app quick actions
- encourages mixing the old sync-specific tray semantics with new Phase 2 desktop behavior
- still does not solve the web-side business-action ownership problem on its own
- makes review harder because it mutates an older feature instead of giving this row a clean, explicit boundary

### Option C — Build the status bar in `apps/web` with Tauri JS APIs

Create the tray/status-bar surface directly from the web runtime using Tauri JavaScript APIs.

Pros:

- fewer Rust-side files
- direct route/action access from the web runtime

Cons:

- breaks the browser-safety contract for `apps/web`
- pushes native shell ownership into the web bundle
- violates the accepted architecture pattern used by current desktop bridge features

## Recommendation

Choose Option A.

This row should own a clean new native status-bar boundary instead of mutating the older sync tray surface or leaking Tauri JS into `apps/web`.

The core rule is:

> Rust owns the native status bar; the web runtime owns quick-action meaning; a browser-safe bridge coordinates the two.

## Recommended Architecture

### 1. Native host boundary

Recommended Rust ownership:

- `apps/desktop/src-tauri/src/commands/statusbar.rs`
- `apps/desktop/src-tauri/src/lib.rs`

Recommended responsibilities:

- install a tray/status-bar icon for the Phase 2 desktop app
- build a native menu with stable IDs
- show/focus the `main` window when requested
- route quick-action clicks into the main webview through the feature bridge
- accept status snapshots from the `main` webview and update menu item text/enabled state

Recommended menu v1 shape:

- `Open X Desktop`
- separator
- `Start Pomodoro`
- `Today's Tasks`
- separator
- disabled status row(s), e.g.:
  - `Status: Ready`
  - `Pomodoro: Disabled in Settings`
  - `Tasks: Today view unavailable`

Recommended left-click rule:

- left click focuses/opens the app window
- right click (or the tray menu gesture) opens the menu

That keeps the menu bar affordance fast while preserving the richer menu on demand.

### 2. Desktop bridge boundary

Recommended owning slice:

- `packages/desktop-statusbar-quick-actions/`

Recommended public entrypoint:

- `@repo/desktop-statusbar-quick-actions/web`

Recommended feature-owned global:

```ts
type DesktopStatusbarQuickAction =
  | "open-app"
  | "start-pomodoro"
  | "view-today-tasks";

type DesktopStatusbarAvailabilityReason =
  | "ready"
  | "feature_disabled"
  | "route_contract_missing"
  | "bridge_not_ready"
  | "unsupported_runtime";

interface DesktopStatusbarSnapshot {
  appStatus: "loading" | "ready" | "degraded";
  summaryLabel: string;
  quickActions: {
    startPomodoro: {
      enabled: boolean;
      reason: DesktopStatusbarAvailabilityReason;
      label: string;
    };
    viewTodayTasks: {
      enabled: boolean;
      reason: DesktopStatusbarAvailabilityReason;
      label: string;
    };
  };
  notificationsStatus?: "ready" | "disabled" | "denied" | "unsupported";
}

interface DesktopStatusbarRuntimeAdapter {
  publishSnapshot(snapshot: DesktopStatusbarSnapshot): Promise<void>;
  subscribe(handler: (action: DesktopStatusbarQuickAction) => void): () => void;
}

declare global {
  interface Window {
    __XAI_DESKTOP_STATUSBAR__?: DesktopStatusbarRuntimeAdapter;
  }
}
```

The adapter implementation remains desktop-host-owned and may use `window.__TAURI__` internally, but the browser-safe bridge must not.

### 3. Quick-action routing contract

The host must not hardcode pomodoro/task business logic.

Recommended v1 dispatch flow:

1. Native menu click
2. Rust focuses/shows the `main` window
3. Rust dispatches a feature-owned quick-action request through the desktop adapter
4. The browser-safe bridge in `apps/web` translates that into route navigation plus additive owning-module contracts

Recommended owning-module contracts:

- `@repo/plugin-web-pomodoro`
  - additive route/query contract: `/app/pomodoro?desktopAction=start-focus`
  - module owns semantics:
    - idle → start focus session
    - paused → resume current session
    - already running → focus module only, no duplicate session
  - module clears or consumes the action token after handling
- `@repo/plugin-web-tasks`
  - additive route/query contract: `/app/tasks?smart=today`
  - module owns the meaning of `today` and updates its internal smart-list selection from that contract

This keeps business behavior inside the owning packages while making the native action deterministic and testable.

### 4. Availability and degraded-state contract

The bridge should publish native status based on the real runtime, not assumptions.

Recommended availability inputs:

- runtime must be `desktop-phase1-offline`
- bridge must be mounted in `AppProviders`
- feature prefs for `tasks` / `pomodoro` must be enabled
- owning-module contracts must exist

Recommended degraded behavior:

- unavailable action → native menu item disabled and status row explains why
- stale click after availability drift → focus app, no-op action, and republish degraded snapshot
- missing adapter outside desktop runtime → bridge reports `unsupported_runtime`, never throws

### 5. Notification relationship

Keep notification integration optional in this row.

- Do not make `desktop-native-notifications-reminders` a hard runtime dependency.
- If the notifications bridge is already present, the status bar may surface an optional `notificationsStatus` string in the snapshot.
- If not present, omit that field and keep the feature fully valid.

## Risks and Open Questions

1. `@repo/plugin-web-tasks` does not currently expose a public "today" selection contract.
   - Mitigation: make that explicit build scope for this row instead of hiding it under host-side hacks.
2. `@repo/plugin-web-pomodoro` does not currently expose an external start/resume contract.
   - Mitigation: keep the contract additive and route-owned inside the module.
3. Feature prefs can disable tasks or pomodoro.
   - Mitigation: native menu state must reflect `feature_disabled` explicitly.
4. The older sync tray module could cause implementation drift if reused casually.
   - Mitigation: treat it as prior art only; build a new explicit statusbar owner for this row.
5. Real macOS tray click behavior and focus transitions still require human verification on hardware.
   - Mitigation: keep real-macOS smoke as a required verify/ship residual gate.
