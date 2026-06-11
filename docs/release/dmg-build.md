# Desktop Phase 1 Packaging (ADR-0011)

Status: Phase 1 local packaging path. Signing, notarization, and updater artifacts remain deferred.

## Canonical Commands

```bash
# Desktop host dev path (Tauri-owned beforeDevCommand + apps/web dev server)
pnpm --filter desktop dev

# Phase 1 app-bundle artifact (.app)
pnpm --filter desktop build

# Explicit DMG attempt
pnpm --filter desktop build:dmg

# Optional secondary passthrough
pnpm --filter desktop build:web
```

`apps/desktop/src-tauri/tauri.conf.json` remains the source of truth for:

- `beforeDevCommand`
- `beforeBuildCommand`
- `frontendDist`

Do not duplicate these values in ad hoc scripts.

## Expected Outputs (Phase 1 Local Debug Bundles)

- `.app`: `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- `.dmg`: `apps/desktop/src-tauri/target/debug/bundle/dmg/*.dmg`

## Offline App-Bundle Smoke

1. Build `.app` via `pnpm --filter desktop build`.
2. Disable network on the test machine.
3. Launch `X Desktop.app` from `target/debug/bundle/macos/`.
4. Confirm app boots to bundled local `/app` content.
5. Confirm default startup is a single normal window.
6. Confirm no overlay/control/grid window auto-start occurs.

If GUI automation is unavailable, record command evidence plus artifact paths and mark GUI checks for `feature-verify` on real hardware.

## DMG Attempt + Blocker Recording

1. Run `pnpm --filter desktop build:dmg`.
2. If `.dmg` is produced, mount and drag-install to `/Applications`, then launch online/offline once.
3. If `.dmg` stalls/fails, record:
   - exact command
   - last emitted stage (for example `Running bundle_dmg.sh` / `osascript`)
   - expected artifact path
   - whether `.app` still built successfully
   - accepted fallback: `.app` offline smoke evidence

## Scope Notes

- This document is Phase 1 only: normal window + offline `/app` smoke.
- Do not reintroduce overlay/control/grid startup in this packaging flow.
- Do not expand scope to Phase 2/3 native runtime redesign.

## Deferred Gates

- Apple Developer ID certificate.
- `xcrun notarytool submit` and stapling.
- Signed app identity verification for Keychain ACL behavior.
- Real clean-machine DMG install/upgrade smoke.
