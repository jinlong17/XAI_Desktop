# Phase 2 — Drag-install Launch from `/Applications` (2026-05-28)

## Residual Under Test

- Feature: `desktop-real-macos-release-smoke`
- Residual: drag-install launch from `/Applications`

## Artifact Provenance

- Branch: `dev`
- Commit under test (phase start): `6432a8af581ec51235f5a4e3d0b861f6db7e5e23`
- DMG artifact:
  - Path: `apps/desktop/src-tauri/target/debug/bundle/dmg/X Desktop_1.0.0-rc.1_aarch64.dmg`
  - mtime: `2026-05-28 01:18:49 PDT`
  - SHA-256: `cbfb621c99d409fda809af3611c0eb52360c605e32106f35d700c8b51a78fc99`

## Observed Non-GUI Installer Evidence

- `hdiutil attach ... -nobrowse -readonly` succeeded.
- Mounted payload at `/Volumes/X Desktop` contained:
  - `X Desktop.app`
  - `Applications -> /Applications` symlink
- `hdiutil detach` succeeded.

## Environment Conditions

- This run had no direct operator GUI interaction for a true Finder drag-install action.
- A shell-only launch attempt from a copied app bundle was not trustworthy as `/Applications` launch evidence because LaunchServices can resolve to an existing app registration path under the same bundle identity.
- No direct, operator-observed launch from `/Applications/X Desktop.app` was captured in this session.
- Manual update (2026-05-29): `/Applications/X Desktop.app` was present and launched successfully as foreground app `com.jinlong.desktop`; human operator observed the installed app opening normally.

## Result

- Classification: `PASS`
- Reason: the previously missing `/Applications` launch observation was completed successfully on real macOS.

## Repo-side Defect Check

- No repo-side defect reproduced from installer artifact structure.
- No product code changes were made.
