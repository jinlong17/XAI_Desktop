# G0.6 MAS Sandbox Dry-Run Notes

## Status

BLOCKED / PARTIAL_EVIDENCE — the private-API-disabled compile comparison is complete and fails for the current transparent-window implementation; signed/sandbox runtime evidence is still required.

## Current Known Repo Facts

- `apps/desktop/src-tauri/tauri.conf.json` currently sets `"macOSPrivateApi": true`, and `apps/desktop/src-tauri/Cargo.toml` currently enables `macos-private-api`.
- Grid windows are created by `create_grid_window(gridId, rect)`.
- Existing G0.2 prototype uses no new Tauri command.
- G0.3 default-runtime click-through behavior is verified; the private-API-disabled build fails because `.transparent(true)` is unavailable without private API.
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
| Private-API-disabled Grid creation | compile-fails in current implementation | `pnpm --filter desktop tauri dev` with `macOSPrivateApi=false` and the Rust `macos-private-api` feature disabled fails at `src/commands/window.rs:36` on `.transparent(true)` | FAIL_BUILD |
| Private-API-disabled Control creation | compile-fails in current implementation | same run fails at `src/lib.rs:94` on `.transparent(true)` | FAIL_BUILD |
| Transparent click-through | DMG/private path verified; non-private path cannot compile | G0.3 matrix with private API true/false | DMG_ONLY_CURRENTLY |
| Finder real paths | verified for G0.4 default runtime | G0.4 file/folder/App/alias matrix | PASS_DEFAULT_RUNTIME |
| Security-scoped bookmarks | pending | Sandbox drop/path behavior and persistence requirements | BLOCKED |
| Global shortcuts | pending | Determine if v1 requires MAS-compatible shortcut scope | BLOCKED |
| Clipboard access | pending | Later Clipboard gate; MAS prompt/permission behavior | DEFERRED |
| Login item | pending | Later release gate; helper/login-item review | DEFERRED |
| Tray/menu bar | pending | Signed/sandbox runtime behavior | BLOCKED |

## Preliminary Conclusion

Current transparent desktop shape is DMG/private-API only. MAS path remains `待验证`, but it cannot use the current transparent Grid/control window construction unchanged. A MAS candidate must first implement a non-transparent or conditionally compiled fallback, then run signed/sandbox validation for file access, security-scoped bookmarks, tray/menu bar behavior, and any shortcut/clipboard capabilities.
