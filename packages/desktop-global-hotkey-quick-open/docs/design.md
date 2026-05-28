# desktop-global-hotkey-quick-open — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — official Tauri global-shortcut plugin plus Rust-owned registration, host-config persistence, and a browser-safe settings bridge |
| Review Doc Path | `docs/reviews/desktop-global-hotkey-quick-open/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 2 desktop-native shell affordance on top of the shipped normal-window Tauri host |

## Frozen Assumptions

- The active desktop product remains the ADR-0011 normal-window Tauri wrapper around `apps/web`; overlay/control/grid surfaces stay quarantined.
- Shortcut registration is owned by Rust via the official Tauri global-shortcut plugin. `apps/web` stays browser-safe and must not import `@tauri-apps/*` or touch `window.__TAURI__`.
- The browser-safe bridge for this row mounts from `apps/web/src/providers/AppProviders.tsx`. `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx` remains a consumer of feature state and does not own native adapter lifecycle.
- The existing host config file remains the only persistence authority for this feature. This row extends that file; it does not introduce SQLite, Phase 3 storage architecture, or any sync-backed config.
- Persisted data is limited to the desired quick-open preference:
  - preset id
  - resolved accelerator string
  - enabled boolean
- Runtime conflict or registration-failure state is derived in memory on startup or after user changes. It is visible to the user, but it is not separately persisted.
- Recovery must remain possible without a working shortcut:
  - native Help-menu actions
  - desktop settings UI
- `desktop-statusbar-quick-actions` is a sibling row, not a dependency. Shared helpers may be deduplicated later, but this feature must implement its own safe `main`-window show/focus path if needed.
- The only capability file in scope is `apps/desktop/src-tauri/capabilities/default.json`, and it stays bound to `windows: ["main"]`.
- Because the bridge uses host-injected commands/events instead of guest plugin APIs, this row should not add `global-shortcut:*` guest permissions to `default.json`.

## Dependency Overview

- Upstream authority:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row #4
  - `docs/reviews/desktop-global-hotkey-quick-open/20260528-feature-brief.md`
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
- Desktop/native prerequisites:
  - `desktop-tauri-web-dist-normal-window` SHIPPED
  - `desktop-basic-macos-menu-config-store` SHIPPED
- Stable active surfaces:
  - `@repo/plugin-web-settings-rest`
  - `@repo/plugin-web-settings-shell`
  - `@repo/plugin-web-storage`
  - `@repo/core` runtime-profile helpers
- Native implementation surfaces:
  - `apps/desktop/src-tauri/Cargo.toml`
  - `apps/desktop/src-tauri/capabilities/default.json`
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/commands/mod.rs`
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `apps/desktop/src-tauri/src/app_menu.rs`
  - `apps/desktop/src-tauri/src/commands/global_hotkey.rs`

## Native Shape After This Feature

- The desktop host registers one global quick-open shortcut for the running app process.
- The shortcut only shows/focuses the normal `main` window.
- If the app process is alive but the `main` window no longer exists, the host may recreate the normal `main` window using the Phase 1 host contract and persisted frame restore path.
- No overlay/grid/control surface is shown, focused, toggled, or revived by the shortcut.
- Conflict or native registration failure becomes an explicit runtime state rather than a silent failure.

## Capability Boundary

- Capability file: `apps/desktop/src-tauri/capabilities/default.json`
- Window scope: keep `windows: ["main"]`
- Existing attached permissions remain:
  - `core:default`
  - `core:event:default`
  - `opener:default`
  - `notification:default`
- This row does not add guest-side global-shortcut permissions because the selected bridge never calls the plugin from `apps/web`. Explicitly excluded permission IDs:
  - `global-shortcut:allow-is-registered`
  - `global-shortcut:allow-register`
  - `global-shortcut:allow-register-all`
  - `global-shortcut:allow-unregister`
  - `global-shortcut:allow-unregister-all`
- Rust handlers must still enforce a `main`-only allowlist for quick-open snapshot/config commands so the window scope is preserved even if a future capability file widens unexpectedly.

## Persistence Shape

Recommended `app-config.json` evolution:

```json
{
  "schemaVersion": 2,
  "updatedAt": "unix-seconds:...",
  "window": {
    "main": {
      "width": 1280,
      "height": 720,
      "x": null,
      "y": null,
      "maximized": false,
      "fullscreen": false
    }
  },
  "quickOpen": {
    "presetId": "default",
    "accelerator": "CommandOrControl+Shift+Space",
    "enabled": true
  }
}
```

Explicit exclusions:

- no web preference keys
- no auth/session data
- no status-bar state
- no last-error history persistence
- no Phase 3 local-first entities

## User-facing Shape

### Desktop settings UI

- Extend the existing Settings hotkeys pane with a desktop quick-open section.
- Keep the existing web-only hotkeys list beneath it.
- Mount the feature bridge once from `apps/web/src/providers/AppProviders.tsx`; let `hotkeysPane.tsx` render from feature state instead of reading the native adapter directly.
- The desktop section shows:
  - current shortcut label
  - runtime status badge
  - curated preset selector
  - disable/reset controls
  - conflict or failure helper text

### Native recovery affordances

- Add only minimal Help-menu recovery actions:
  - `Disable Quick Open Shortcut`
  - `Reset Quick Open Shortcut to Default`

This row does not own a broader menu redesign.

## Bridge Lifecycle

- `apps/web/src/providers/AppProviders.tsx` is the only web mount point for the quick-open bridge.
- The bridge owns:
  - initial `getSnapshot()` hydration
  - one long-lived `subscribe(...)` registration for host-originated updates
  - feature-state publication for pane consumers
- `packages/plugin-web-settings-rest/src/panes/hotkeysPane.tsx` owns only rendering plus user-triggered `setPreference(...)` calls.
- Native Help-menu disable/reset actions and settings writes both flow through the same Rust apply path and must publish the same snapshot update event back through the mounted bridge.

## Planned Runtime Split

### Phase 1 — Native Shortcut Foundation

- Add the official Tauri global-shortcut plugin dependency and startup init.
- Audit and preserve `apps/desktop/src-tauri/capabilities/default.json` as the only capability file for this row; keep `windows: ["main"]` and do not add guest `global-shortcut:*` permissions.
- Add a dedicated Rust module for registration, unregistration, trigger handling, snapshot publication, and runtime-state classification.
- Implement a safe `main`-window show/focus helper that never touches overlay/grid/control windows.

### Phase 2 — Host Config Migration and Persistence

- Extend `app_config.rs` from schema v1 to v2 with `quickOpen`.
- Migrate existing v1 files forward without losing `window.main`.
- Reapply the desired shortcut on startup and keep runtime conflict state in memory only.

### Phase 3 — Browser-safe Settings Bridge and Menu Recovery

- Add `packages/desktop-global-hotkey-quick-open/` with a browser-safe `/web` entrypoint and host-injected adapter contract.
- Mount the feature bridge from `apps/web/src/providers/AppProviders.tsx`.
- Extend `plugin-web-settings-rest` hotkeys pane with a desktop quick-open section that consumes feature state.
- Add minimal Help-menu disable/reset items wired to the same host apply path.

### Phase 4 — Verification Surface

- Add Rust tests for migration, registration-state mapping, and menu-item IDs.
- Add browser-safe settings tests for snapshot display, preset changes, disabled state, and conflict rendering.
- Run cargo/web/desktop build gates and record real macOS manual smoke expectations.
