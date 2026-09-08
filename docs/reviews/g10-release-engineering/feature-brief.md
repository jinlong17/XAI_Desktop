# G10-E1 Release Engineering Brief

## Goal

Prepare the desktop release-candidate configuration and release engineering notes for GA.

## Scope

- Set Tauri app version to `1.0.0-rc.1`.
- Add Tauri updater endpoint/public-key placeholders.
- Add crash reporting placeholder.
- Document versioning, updater, crash symbol, and notarization gates.

## Deferred Gates

- Apple Developer signing identity.
- Tauri updater signing keys.
- Production Sentry DSN and symbol upload.
