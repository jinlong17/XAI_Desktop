# Discovery Review — mas-sandbox-dry-run

## Summary

G0.6 is a release/security validation task. The repository currently depends on Tauri `macos-private-api` in Cargo features, and real MAS suitability cannot be proven without toggling private API behavior, sandbox entitlements, and signed-package/runtime checks.

## Recommendation

Prepare the MAS risk notes and entitlement draft, but keep the feature BLOCKED until a human can run sandbox/private-API validation. Do not modify Tauri config or Cargo features speculatively.

## Required Human Evidence

- `macOSPrivateApi=false` runtime behavior for Grid windows.
- Sandbox file-path/drop behavior.
- Security-scoped bookmark requirement decision.
- Global shortcut, clipboard, login item, and Finder path-access risk status.
- Apple Developer/signed build path if keychain or sandbox entitlements are involved.

