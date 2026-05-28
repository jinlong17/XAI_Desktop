# desktop-basic-macos-menu-config-store — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — Rust-owned native app menu plus versioned JSON config file under Tauri `app_config_dir` |
| Review Doc Path | docs/reviews/desktop-basic-macos-menu-config-store/20260527-discovery-review.md |
| Review Date/Version | 2026-05-27 |
| Feature Type | P1 Phase 1 desktop host-native shell addition |

## Frozen Assumptions

- ADR-0011 Phase 1 is still a normal-window Tauri wrapper around `apps/web`; this feature must not redesign Web modules.
- The existing `commands/menubar.rs` surface is tray/status work, not the required Phase 1 app menu.
- Legacy overlay/control/grid code remains quarantined for P3+ reuse and must not be reactivated.
- Host-owned config is limited to native desktop settings needed before or outside the web UI, starting with main-window frame/state.
- Web-owned preferences remain in existing web storage; this feature must not migrate them into the native host.
- No SQLite, sync, notifications, status bar, global hotkeys, or updater work belongs here.

## Dependency Overview

- Upstream authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`
  - `docs/audit/2026-05-26-patch-roadmap-source.md`
- Existing host baseline:
  - `desktop-tauri-web-dist-normal-window` SHIPPED
  - `desktop-web-auth-offline-mode` READY_TO_SHIP
  - `desktop-phase1-build-packaging-pipeline` READY_TO_SHIP
  - `web-external-runtime-offline-gates` READY_TO_SHIP
- Native implementation surfaces:
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/commands/menubar.rs`
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs`
  - new host config module under `apps/desktop/src-tauri/src/`

## Native Shape After This Feature

- Phase 1 startup installs a real native app menu, not just a tray/status icon.
- The active runtime no longer depends on tray/status bootstrap for baseline shell affordances.
- The main window can load and persist a small native config snapshot from disk.
- The config file lives under the app-specific config directory and is versioned for forward migration.
- Overlay/control/grid defaults remain inactive.

## Config Store Shape

Recommended file:

- directory: `app.path().app_config_dir()?`
- filename: `app-config.json`

Recommended V1 schema:

```json
{
  "schemaVersion": 1,
  "updatedAt": "ISO-8601",
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

Explicit exclusions:

- no web preference keys
- no account/session secrets
- no sync data
- no Phase 3 local-first entities

## Implementation Phases

### Phase 1 — Native App Menu Foundation

- Build the app menu in Rust with macOS-correct submenu structure.
- Install menu handling in `lib.rs`.
- Stop default tray/status bootstrap from being the active shell surface.

### Phase 2 — Host Config Store and Main-Window Persistence

- Add the typed config module with load/default/save/migration helpers.
- Load/apply saved main-window state during startup.
- Persist validated main-window state on native window lifecycle events.

### Phase 3 — Practical Menu/Config Integration and Verification

- Add only minimal practical custom items if they help Phase 1 operations, such as config reveal/reset.
- Add tests for menu/config helpers and record real macOS verification notes.
- Keep all deferred Phase 2 native work documented but unimplemented.

Implemented practical custom items:

- `Help -> Reveal Config Folder`
- `Help -> Reset Main Window State`
