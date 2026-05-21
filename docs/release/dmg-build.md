# DMG Release Candidate Build

Status: local build path documented; signing and notarization are deferred.

## Commands

```bash
pnpm --filter desktop build
cargo build --manifest-path apps/desktop/src-tauri/Cargo.toml --release
pnpm --filter desktop tauri build -- --bundles dmg
```

If the updater artifact gate is enabled later, export the generated private key before Tauri build:

```bash
export TAURI_SIGNING_PRIVATE_KEY="/path/to/xai-desktop.key"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""
```

## Expected Outputs

- `apps/desktop/src-tauri/target/release/bundle/dmg/*.dmg`
- `apps/desktop/src-tauri/target/release/bundle/macos/*.app`
- updater archive and `.sig` only after `bundle.createUpdaterArtifacts` is enabled in signed CI.

## Manual Smoke

1. Mount the DMG.
2. Drag the app to `/Applications`.
3. Launch once online and once offline.
4. Verify main transparent window, control window, account UI, export/import UI, and device revoke mock path.
5. Uninstall and reinstall the same RC.

## Deferred Gates

- Apple Developer ID certificate.
- `xcrun notarytool submit` and stapling.
- Signed app identity verification for Keychain ACL behavior.
- Real DMG install/upgrade smoke on clean macOS hardware.
