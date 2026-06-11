# Discovery Review — desktop-basic-macos-menu-config-store

## Problem Framing

The active Phase 1 desktop host is already a normal single-window Tauri wrapper around `apps/web`, but two native-shell gaps remain:

- the runtime still carries an old tray/status bootstrap (`commands::menubar::install_sync_menubar`) that is not the same thing as a standard macOS application menu
- the host still lacks a durable local config store for native desktop settings, so startup-time state such as main-window frame has no Phase 1 on-disk authority

Current repo reality:

- `apps/desktop/src-tauri/src/lib.rs` manages `SyncMenuBarState` and installs `commands::menubar::install_sync_menubar(app.handle())` during setup
- `apps/desktop/src-tauri/src/commands/menubar.rs` is a tray-icon status surface keyed around `sync_set_menubar_status`, not a `File` / `Edit` / `View` / `Window` / `Help` app menu
- `apps/desktop/src-tauri/src/commands/bookmarks.rs` demonstrates the current preferred Rust pattern:
  - typed command inputs
  - runtime allowlists
  - managed state
  - MockRuntime IPC tests
- `apps/desktop/src-tauri/src/commands/window.rs` still keeps console-frame state only in memory, which shows the repo does not yet have a reusable native config file layer
- `apps/desktop/src-tauri/src/legacy_overlay.rs` and `platform::macos::legacy_overlay` are already the quarantine boundary for future overlay reuse and must remain inactive on the Phase 1 startup path

The planning decision is therefore not "whether we need native shell work" but "how minimal, native-side, and Phase-1-scoped we can keep the menu/config solution."

## External Research

This feature requires a small current-API decision, so I checked primary Tauri sources.

### Search Queries

- `site:tauri.app v2 menu docs Tauri application menu macOS`
- `site:docs.rs tauri menu SubmenuBuilder MenuBuilder docs.rs`
- `site:docs.rs tauri app_config_dir path resolver AppHandle path app_config_dir`
- `site:tauri.app v2 plugin store docs Tauri store plugin`
- `site:docs.rs tauri-plugin-store StoreBuilder auto_save docs.rs`

### Source Evidence

- Tauri menu guide: <https://v2.tauri.app/learn/window-menu/>
  - `app.set_menu(...)` and `app.on_menu_event(...)` are the native Rust hooks for menu install and menu-item handling.
  - On macOS, multi-level menus should be grouped under submenus, and top-level items are ignored.
- Tauri `SubmenuBuilder`: <https://docs.rs/tauri/latest/tauri/menu/struct.SubmenuBuilder.html>
  - Built-in helpers exist for native items such as `about`, `services`, `hide`, `hide_others`, `show_all`, `quit`, `undo`, `redo`, `cut`, `copy`, `paste`, `select_all`, `minimize`, `maximize`, and `fullscreen`.
- Tauri `PathResolver::app_config_dir`: <https://docs.rs/tauri/latest/tauri/path/struct.PathResolver.html>
  - Tauri exposes an app-specific config directory via `app.path().app_config_dir()`.
- Official store plugin JS reference: <https://v2.tauri.app/reference/javascript/store/>
  - Guest bindings expose `get`, `set`, `save`, `reset`, and change-listener APIs.
- Official Rust store plugin builder: <https://docs.rs/tauri-plugin-store/latest/tauri_plugin_store/struct.StoreBuilder.html>
  - The official store plugin supports `StoreBuilder::new(app, "store.json")`, `auto_save(...)`, and load-or-create semantics.

## Candidate Options

### Option A — Rust-owned native app menu plus a versioned JSON config file in `app_config_dir`

Use Tauri’s built-in native menu builders in Rust and add a small host-owned config module that reads/writes a typed JSON file such as:

- directory: `app.path().app_config_dir()?`
- file: `app-config.json`
- schema:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-05-27T23:52:00Z",
  "window": {
    "main": {
      "width": 1280,
      "height": 720,
      "x": null,
      "y": null,
      "maximized": false,
      "fullscreen": false
    }
  }
}
```

Recommended persisted scope for V1:

- only host-owned state needed before or outside the web UI:
  - main-window frame and presentation state
- explicitly not persisted here:
  - Web module preferences already owned by web storage
  - account/session secrets
  - Phase 3 local-first data

Pros:

- No new dependency; stays entirely inside the existing Rust host boundary
- Correct ownership: native menu and native window state stay native-side
- Startup can read config before or alongside main-window setup
- Typed schema + manual migration rules are clearer than key-value sprawl for a very small data set
- Fits repo precedent: custom Rust contract, command-safe tests, and narrow capabilities

Cons:

- Requires a little custom file IO and schema code
- Need to define atomic-write and corruption-fallback behavior ourselves
- If a future desktop settings pane wants broader editing, later commands/events may still be needed

### Option B — Rust-owned native app menu plus official `tauri-plugin-store`

Keep the app menu in Rust, but use the official store plugin for persistence.

Pros:

- Official persisted key-value mechanism
- Load-or-create and autosave behavior already exists
- Could expose the same store to guest JS later if a desktop settings UI is added

Cons:

- Adds new Rust and JS dependency surface to a repo that currently does not use the store plugin
- Key-value shape is looser than a typed host-config schema for a tiny Phase 1 payload
- Makes it easier to drift host-owned settings into bundled-web ownership prematurely
- More moving parts than necessary for one file and one active window

### Option C — Use bundled-web storage only and build the menu from JS guest APIs

Let the `apps/web` side own the config and wire the app menu through guest-side APIs.

Pros:

- Fastest path if this were just another web preference
- Fewer custom Rust structs initially

Cons:

- Wrong ownership for native startup-time settings such as window frame
- Couples native menu behavior to the bundled web process after boot instead of the host
- Conflicts with the repo rule that `apps/desktop/src/` is a host shell and should not absorb business logic
- Makes future startup/migration behavior harder because config is unavailable before the web UI is alive

## Recommendation

Choose Option A.

The feature is small, native-side, and Phase 1 specific. A typed JSON file under Tauri’s app config directory is the cleanest match for that shape, while Tauri’s built-in menu builders already cover nearly all practical macOS menu items we need.

Recommended native menu structure:

- first submenu: app/about space for macOS (`About`, `Services`, `Hide`, `Hide Others`, `Show All`, `Quit`)
- `File`: minimal custom/native items such as `Close Window`
- `Edit`: predefined native edit actions (`Undo`, `Redo`, `Cut`, `Copy`, `Paste`, `Select All`)
- `View`: `Enter Full Screen` and only Phase-1-safe items
- `Window`: `Minimize`, `Zoom`/maximize, `Bring All to Front`
- `Help`: custom practical item(s) only if useful now, for example `Reveal Config Folder`

Recommended tray/status handling:

- treat current `commands::menubar.rs` as deferred Phase 2 tray/status work
- remove or gate `install_sync_menubar(...)` from the active Phase 1 startup path
- keep the code available for later reuse rather than deleting it aggressively

Recommended config-store behavior:

- own it in Rust under a new host module such as `apps/desktop/src-tauri/src/app_config.rs`
- load defaults on startup
- apply saved `main` window bounds/state during setup when valid
- persist on move/resize/fullscreen/close using the native window lifecycle
- write atomically and fail closed to defaults if the file is missing or corrupt
- reserve schema migrations via `schemaVersion`

## Selected Execution Notes

- No new typed event is required for the initial menu itself if all practical items are native actions or Rust-handled custom items.
- Do not move web-owned preferences into this store. The config file is for host-owned desktop state only.
- If a debug or future settings-pane seam is needed later, add a small read-only or narrow command surface then; do not invent a broad desktop settings API in Phase 1.
- Keep the `tray-icon` dependency and legacy tray module untouched unless removing them is trivial and clearly isolated. The important requirement is that they are not active Phase 1 startup behavior.

## Risks

- Native menu correctness is hard to prove from unit tests alone; real macOS verification is required
- Persisting window bounds naively can save unusable coordinates if external-monitor topology changes; the build phase should clamp or fall back safely
- If the current tray/status bootstrap is left active, the feature will blur into forbidden Phase 2 scope
- A rushed config schema can become a Phase 3 burden if it starts storing non-host concerns

## Open Questions

- Should this feature expose any JS/Tauri command for config inspection in Phase 1, or keep the store fully internal to Rust? Recommendation: keep it internal unless build-phase debugging shows a real need.
- Should `Help` include `Reveal Config Folder` or stay purely generic? Recommendation: include it only if it materially improves verification and support.
- Should window-state restore include `maximized` and `fullscreen` in V1, or only bounds? Recommendation: include both flags, but validate them conservatively at startup.

## Phased Build Outline

1. Replace the active tray/status bootstrap with a true native app-menu scaffold and wire Rust-side menu event handling.
2. Add the typed host config module, load/apply defaults on startup, and persist main-window state on native window events.
3. Add any minimal practical integration (`Reveal Config Folder`, `Reset Window State`, or equivalent if chosen), plus tests and manual verification evidence.
