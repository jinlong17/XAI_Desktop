# G0.6 MAS Sandbox Dry-Run Notes

## Status

BLOCKED in unattended Codex run. This note is a safe-prep draft, not evidence of MAS feasibility.

## Current Known Repo Facts

- `apps/desktop/src-tauri/Cargo.toml` enables Tauri features `macos-private-api` and `tray-icon`.
- Grid windows are created by `create_grid_window(gridId, rect)`.
- Existing G0.2 prototype uses no new Tauri command.
- G0.3 click-through behavior is still BLOCKED on real hit-test evidence.
- G0.4 Finder path behavior is still BLOCKED on real Finder DnD evidence.

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
| `macOSPrivateApi=false` Grid creation | pending | Build/run with private API disabled and open `alpha`/`beta` windows | BLOCKED |
| Transparent click-through | pending | G0.3 matrix with private API true/false | BLOCKED |
| Finder real paths | pending | G0.4 file/folder/App/alias matrix | BLOCKED |
| Security-scoped bookmarks | pending | Sandbox drop/path behavior and persistence requirements | BLOCKED |
| Global shortcuts | pending | Determine if v1 requires MAS-compatible shortcut scope | BLOCKED |
| Clipboard access | pending | Later Clipboard gate; MAS prompt/permission behavior | DEFERRED |
| Login item | pending | Later release gate; helper/login-item review | DEFERRED |
| Tray/menu bar | pending | Signed/sandbox runtime behavior | BLOCKED |

## Preliminary Conclusion

MAS path remains `待验证`. No Go/No-Go decision can be made until G0.3/G0.4 evidence and a real sandbox/private-API validation run exist.

