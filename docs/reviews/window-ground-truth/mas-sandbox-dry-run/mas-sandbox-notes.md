# G0.6 MAS Sandbox Dry-Run Notes

## Status

BLOCKED_EXTERNAL / COMPILE_FALLBACK_READY — the private-API-disabled compile comparison now has a compile-only fallback via `mas-sandbox`; signed/sandbox runtime evidence is deferred until Apple Developer/signing or equivalent sandbox environment exists.

## Current Known Repo Facts

- `apps/desktop/src-tauri/tauri.conf.json` currently sets `"macOSPrivateApi": true`, and `apps/desktop/src-tauri/Cargo.toml` currently enables `macos-private-api`.
- Grid windows are created by `create_grid_window(gridId, rect)`.
- Existing G0.2 prototype uses no new Tauri command.
- G0.3 default-runtime click-through behavior is verified; the original private-API-disabled build failed because `.transparent(true)` is unavailable without private API.
- `mas-sandbox` now omits Rust-side Grid/control `.transparent(true)` calls for compile-only non-private dry-runs.
- G0.4 Finder path behavior is READY_TO_SHIP for file, folder, `.app`, and alias path-form evidence.

## Entitlements Draft

This is a starting point only. It must be reviewed against actual Tauri signing/package output.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.app-sandbox</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-only</key>
  <true/>
  <key>com.apple.security.files.bookmarks.app-scope</key>
  <true/>
</dict>
</plist>
```

## Risk Matrix

| Area | Current status | Evidence required | Result |
|---|---|---|---|
| Private-API-disabled Grid creation | compile fallback exists | `cargo check --no-default-features --features mas-sandbox` passes after temporarily setting `macOSPrivateApi=false` and disabling Tauri dependency `macos-private-api` | PASS_COMPILE_ONLY |
| Private-API-disabled Control creation | compile fallback exists | same run passes because Rust-side `.transparent(true)` is omitted under `mas-sandbox` | PASS_COMPILE_ONLY |
| Transparent click-through | DMG/private path verified; non-private runtime still unverified | G0.3 matrix with private API true/false plus fallback compile check | DMG_PASS_MAS_RUNTIME_BLOCKED |
| Finder real paths | verified for G0.4 default runtime | G0.4 file/folder/App/alias matrix | PASS_DEFAULT_RUNTIME |
| Security-scoped bookmarks | pending | Sandbox drop/path behavior and persistence requirements | BLOCKED |
| Global shortcuts | pending | Determine if v1 requires MAS-compatible shortcut scope | BLOCKED |
| Clipboard access | pending | Later Clipboard gate; MAS prompt/permission behavior | DEFERRED |
| Login item | pending | Later release gate; helper/login-item review | DEFERRED |
| Tray/menu bar | pending | Signed/sandbox runtime behavior | BLOCKED |

## Preliminary Conclusion

Current transparent desktop shape remains DMG/private-API for the default product path. The `mas-sandbox` feature proves a non-private compile fallback can avoid Rust-side transparent constructors, but MAS path remains `待验证` until signed/sandbox runtime validation proves Grid creation, acceptable fallback UX, file access, security-scoped bookmarks, tray/menu bar behavior, and any shortcut/clipboard capabilities.

G0/G1 sequencing note: this MAS runtime validation is an external release gate and is decoupled from G1 native foundation for the DMG/private path.
