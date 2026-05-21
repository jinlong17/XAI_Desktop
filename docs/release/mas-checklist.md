# Mac App Store Candidate Checklist

Status: sandbox compile fallback remains the local admission check; actual MAS submission is deferred.

## Capability Review

Audited files:

- `apps/desktop/src-tauri/capabilities/default.json`
- `apps/desktop/src-tauri/capabilities/plugin-account-crypto.json`
- `apps/desktop/src-tauri/capabilities/plugin-account-keychain.json`
- `apps/desktop/src-tauri/capabilities/plugin-data-database.json`
- `apps/desktop/src-tauri/capabilities/AUDIT.md`

No capability file grants a DMG-only private API permission directly. The known MAS risk is the desktop config and Rust window path using `macos-private-api` for transparent windows in default DMG builds. The existing `mas-sandbox` compile fallback is the MAS guard.

## Required Entitlements

Apple requires App Sandbox for Mac App Store submission. Candidate entitlements:

```xml
<key>com.apple.security.app-sandbox</key>
<true/>
<key>com.apple.security.network.client</key>
<true/>
<key>com.apple.security.files.user-selected.read-write</key>
<true/>
<key>com.apple.security.application-groups</key>
<array>
  <string>TEAMID.com.jinlong.desktop</string>
</array>
```

Use only the file entitlement needed for user-selected import/export and organizer file access. Do not request full disk access for MAS.

Apple reference: https://developer.apple.com/documentation/security/app_sandbox

## Local Checks

```bash
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --no-default-features --features mas-sandbox
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --no-default-features
```

## Deferred Gates

- Apple Team ID and final bundle identifier.
- MAS provisioning profile.
- Entitlements plist creation in the signing pipeline.
- App Review metadata validation and sandbox runtime smoke.
