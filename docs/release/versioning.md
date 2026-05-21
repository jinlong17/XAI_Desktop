# XAI Desktop Versioning Strategy

Status: 1.0.0-rc.1 release-candidate baseline.

## Version Sources

- `apps/desktop/src-tauri/tauri.conf.json`: user-visible desktop app version. Current value: `1.0.0-rc.1`.
- Update manifest: must publish SemVer-compatible versions matching Tauri updater expectations.
- Release notes: one entry per RC and GA build, with known limitations and deferred gates.

## Release Channels

| Channel | Version pattern | Distribution |
|---|---|---|
| RC | `1.0.0-rc.N` | Internal DMG, TestFlight-style MAS candidate review package |
| GA | `1.0.0` | Public notarized DMG and MAS listing |
| Patch | `1.0.X` | Auto-update eligible after staged rollout |

## Auto-Update

`tauri.conf.json` contains the Tauri v2 updater placeholder under `plugins.updater`:

- `endpoints`: `https://updates.example.invalid/xai-desktop/{{target}}/{{arch}}/{{current_version}}/latest.json`
- `pubkey`: `DEFERRED_TAURI_UPDATER_PUBLIC_KEY`

The official Tauri v2 updater docs require updater endpoints and a generated public key in config; creating updater artifacts also requires signing keys in the build environment.

Source: https://v2.tauri.app/plugin/updater/

## Crash Reporting

`tauri.conf.json` contains a Sentry DSN placeholder under `plugins.crashReporting`. Before GA:

- replace placeholder DSN with production project DSN;
- set release to `x-desktop@<version>`;
- upload debug symbols and source maps during CI;
- verify PII redaction for account and device identifiers.

## Deferred Gates

- Apple Developer signing identity and notarization.
- Generated Tauri updater signing key pair and private-key CI storage.
- Production Sentry project DSN and symbol upload.
- Independent release-manager approval for GA version promotion.
