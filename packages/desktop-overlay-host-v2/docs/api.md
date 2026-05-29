# desktop-overlay-host-v2 - API / Contract Notes

## Contract Summary

This row does not define a new business API yet. It defines the host-mode, capability, command, and persistence contracts that overlay-v2 must obey.

Primary contracts:

- host-owned mode selection contract
- dormant-command revival contract
- overlay-disabled command contract
- overlay-specific capability contract
- host-versus-plugin data ownership contract

## Upstream Interfaces

### Host startup and config

- `apps/desktop/src-tauri/src/lib.rs`
  - current default startup authority
- `apps/desktop/src-tauri/src/app_config.rs`
  - host-owned config seam under `app_config_dir()/app-config.json`
- `apps/desktop/src-tauri/src/commands/mod.rs`
  - compiles `commands::window`, but does not expose it by itself
- `apps/desktop/src-tauri/capabilities/default.json`
  - default runtime capability scope

### Overlay bootstrap and macOS behavior

- `apps/desktop/src-tauri/src/legacy_overlay.rs`
- `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` `legacy_overlay`

### Overlay window lifecycle

- `apps/desktop/src-tauri/src/commands/window.rs`
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/windows/{ControlWindow,GridWindow,ConsoleWindow}.tsx`
- `packages/plugin-organizer/src/hooks/useGridWindow.ts`

### Organizer cross-window state

- `packages/core/src/types/events.ts`
- `packages/core/src/events/*`
- `packages/plugin-organizer/src/gridEvents.ts`
- `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts`
- `packages/plugin-organizer/src/OrganizerGridContent.tsx`
- `packages/plugin-organizer/src/OrganizerLayer.tsx`

## Current Source Truth

### Dormant window commands

- `apps/desktop/src-tauri/src/commands/window.rs`
  - defines `create_grid_window`, `update_grid_window`, `close_grid_window`, `list_grid_windows`, `focus_grid_window`, and console-window lifecycle/frame handlers
- `apps/desktop/src-tauri/src/lib.rs`
  - does not register any `commands::window::*` handler in `invoke_handler`
  - does not `manage(GridWindowsState::default())`
  - does not `manage(ConsoleWindowFrameState::default())`

Current effect:

- grid/console lifecycle commands are dormant source code rather than a callable runtime API
- `ControlWindow.tsx` and `useGridWindow.ts` describe the future overlay path, not an active normal-host contract

### OrganizerLayer boundary

- `packages/plugin-organizer/src/OrganizerLayer.tsx` is organizer-owned business/orchestration code
- it currently bundles:
  - main-window file-drop forwarding
  - grid-window lifecycle hookup through `useMultiWindowGrids`
  - control-window grid-create listeners
- row `#19` does not treat that full surface as a host API; at most it may extract a thinner orchestration seam from it

## Recommended New Host Contract

### Host mode

Recommended host-owned mode union:

```ts
type DesktopHostMode = "normal" | "overlay_v2";
```

Recommended behavior:

- default on first launch: `"normal"`
- persisted in host config only
- normal mode keeps current startup behavior
- overlay mode is opt-in and may be exposed only through an explicit advanced toggle/menu action

### Window command activation model

Recommended build contract:

- feature-build re-registers `commands::window::*` inside `lib.rs` `invoke_handler`
- the same change restores `GridWindowsState` and `ConsoleWindowFrameState` management in the Tauri builder
- despite registration, commands fail closed with `OVERLAY_MODE_DISABLED` unless the persisted `hostMode` is `"overlay_v2"`
- normal mode remains the default boot path and does not silently create overlay/control/grid/console windows

### Overlay-specific window command semantics

Overlay lifecycle commands should fail closed unless overlay mode is active.

Recommended error shape extension:

```ts
type OverlayDisabledError = {
  code: "OVERLAY_MODE_DISABLED";
  message: string;
  recoverable: true;
  details?: { requestedMode: "overlay_v2"; activeMode: DesktopHostMode };
};
```

Apply to at least:

- `create_grid_window`
- `update_grid_window`
- `close_grid_window`
- `list_grid_windows`
- `focus_grid_window`
- `open_console_window`
- `close_console_window`
- `focus_console_window`
- `get_console_window_frame`
- `set_console_window_frame`

### Capability contract

- `default.json` remains `main`-only for normal mode
- overlay-v2 should use explicit capability widening only for overlay-active windows
- command allowlists in Rust remain defense in depth and must align with the active mode

## Downstream Interfaces

### Host-owned persistence

Host config may own:

- `hostMode`
- main-window state
- possibly host-only overlay shell toggles or host chrome preferences

Host config must not own:

- organizer grids/items/layout payloads
- local-first entity records
- account/session secrets
- sync or backup data

### Event contract

- overlay/control/grid coordination should prefer typed `@repo/core/events` wrappers over ad-hoc direct event wiring where practical
- if a preserved event stays string-based during transition, its payload still needs to match `EventMap`
- overlay-v2 must not introduce plugin-to-plugin direct imports as the long-term communication path
- if row `#19` extracts orchestration from `OrganizerLayer.tsx`, the extracted seam stays host-facing while organizer UI/data semantics remain plugin-owned and deferred beyond this row

### File and data access contract

- file/path access remains user initiated through existing drag-drop/bookmark flows
- overlay-v2 must not grant blanket filesystem traversal to the overlay shell
- overlay host code should not read local-first entity data directly; organizer/business packages remain the owner

## Error Semantics

- overlay-inactive requests should return explicit recoverable disabled-mode errors, not silent no-ops
- invalid grid/window identifiers remain recoverable validation errors
- host-mode config parse/migration failure should fall back safely to `normal`
- monitor/layout restoration problems should degrade to safe on-screen placement, not invisible windows

## Permission Notes

- no default runtime capability widening
- no new privilege for unrelated plugins
- any overlay-only capability additions must be scoped to overlay-active windows only
- desktop-level/window-level behavior remains macOS-specific and must be treated as manual-risk territory
- command re-registration without mode checks is not acceptable for this row

## Idempotency Notes

- re-saving host mode with the same value should be a no-op from the user perspective
- re-entering normal mode must leave overlay-specific windows inactive
- re-entering overlay mode should not create duplicate control/grid/console windows if they are already active
