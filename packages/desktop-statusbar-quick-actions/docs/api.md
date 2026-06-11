# desktop-statusbar-quick-actions — API / Contract Notes

## Contract Summary

This feature is a native-shell bridge contract, not an HTTP/API feature.

Primary surfaces:

- Rust-owned tray/status-bar install and native menu handling
- feature-owned browser-safe desktop bridge entrypoint
- feature-owned desktop adapter global contract
- additive owning-module quick-action contracts for pomodoro and tasks
- native status snapshot publish/update contract

## Upstream Interfaces

### Native tray/menu contract

Expected transport:

- Tauri `tray-icon` feature stays enabled in `apps/desktop/src-tauri/Cargo.toml`
- tray/menu install remains Rust-owned in `apps/desktop/src-tauri/src/`
- menu items can be enabled/disabled and have text updated at runtime

Required scope discipline:

- `main` window only
- no overlay/control/grid startup or focus behavior
- no direct task/pomodoro business-state derivation inside Rust

### Browser-safe bridge contract

Expected public entrypoint:

- `@repo/desktop-statusbar-quick-actions/web`

Expected responsibility:

- mount from `apps/web/src/providers/AppProviders.tsx`
- read `resolveWebRuntimeProfile(...)`
- consume only a host-injected feature-owned desktop adapter
- publish action availability/status back to the host
- translate native action requests into route/query navigation for the owning modules

Frozen browser-safety rule:

- `apps/web` must not import `@tauri-apps/*`
- `apps/web` must not reference `window.__TAURI__`
- only the host-injected adapter implementation may touch Tauri globals
- shipped `apps/web/dist` artifacts must enforce no-public-sourcemap policy by default
  - regular `pnpm --filter @repo/web build` => `sourcemap: false`
  - secure release flow may opt into hidden sourcemaps for Sentry upload, but must clean maps before final artifact checks

## Downstream Interfaces

### Feature-owned desktop adapter contract

Recommended shape:

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

### Native Rust command boundary

Recommended host-owned command:

- `statusbar_set_snapshot(snapshot: DesktopStatusbarSnapshot) -> Result<(), String>`

Required semantics:

- `main`-window scoped only
- updates cached native status-bar state
- enables/disables and relabels native quick-action menu items
- idempotent for repeated identical snapshots

The reverse direction (native menu click → web action request) should stay host-owned and should not require a web import of Tauri APIs.

### Quick-action route contracts

#### Pomodoro

Expected additive public contract on `@repo/plugin-web-pomodoro`:

- route/query input: `/app/pomodoro?desktopAction=start-focus`

Required semantics:

- if timer is idle: start a focus session
- if timer is paused: resume the current session
- if timer is already running: no duplicate session; focus the module only
- action token is consumed/cleared after handling

#### Tasks

Expected additive public contract on `@repo/plugin-web-tasks`:

- route/query input: `/app/tasks?smart=today`

Required semantics:

- the module selects the existing "today" smart-list view
- the contract is additive only; it does not move task filtering logic into the host
- if the contract is absent or the feature is disabled, the status bar must advertise the action as unavailable

### Basic status v1

`basic app status` in this row means:

- overall app readiness for native quick actions:
  - `loading`
  - `ready`
  - `degraded`
- per-action availability for:
  - start pomodoro
  - today's tasks
- optional notification status mirror only if already available from the notifications bridge

It does not mean sync state, background daemon state, or Phase 3 local-first storage health.

## Error Semantics

- Rust tray/menu install failure is a startup failure and should fail fast.
- Missing desktop adapter outside desktop runtime is non-fatal and should resolve to `unsupported_runtime`.
- Publishing a snapshot from the web bridge must never crash the web app; failure should degrade the native status surface only.
- If a quick action is requested while its target is unavailable:
  - the main window may still be focused/opened
  - the business action itself must no-op
  - the next snapshot must advertise the unavailable reason clearly

## Permission Notes

- Keep capability scope on `main` only.
- Do not widen legacy `control`, `console`, or `grid_*` scopes.
- No new browser-side Tauri permission usage is allowed in `apps/web`; the bridge must remain feature-owned and browser-safe.

## Idempotency Notes

- Repeated `Open X Desktop` actions are safe and should just show/focus the existing `main` window.
- Repeated identical status snapshots are safe.
- Repeated `start pomodoro` requests while a focus session is already running must not create duplicate sessions.
- Repeated `today's tasks` requests are safe and should simply keep the tasks module focused on the same smart-list state.
