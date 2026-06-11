# DMG Attempt Evidence — desktop-phase1-build-packaging-pipeline

- Date: 2026-05-27 (PDT)
- Scope: Phase 1 explicit DMG packaging command and blocker/fallback evidence

## Command

```bash
pnpm --filter desktop build:dmg
```

## Output Progress

Observed stages in order:

1. `tauri build --debug --bundles dmg`
2. `beforeBuildCommand` executed: `VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build`
3. Rust desktop build finished
4. `.app` bundle step completed
5. DMG stage reached:
   - `Bundling X Desktop_1.0.0-rc.1_aarch64.dmg`
   - `Running bundle_dmg.sh`

## Blocker

After `Running bundle_dmg.sh`, no further output was emitted for 60 seconds across two 30-second probes. Command was manually interrupted.

## Artifact Paths

- Expected final DMG path:
  - `apps/desktop/src-tauri/target/debug/bundle/dmg/X Desktop_1.0.0-rc.1_aarch64.dmg`
- Directory content after interruption:
  - `apps/desktop/src-tauri/target/debug/bundle/dmg/bundle_dmg.sh`
  - `apps/desktop/src-tauri/target/debug/bundle/dmg/icon.icns`
  - no final `.dmg` produced under `bundle/dmg/`

## Additional Observation

Temporary `rw.*.dmg` files appeared under `bundle/macos/` during DMG creation, but not the expected final artifact under `bundle/dmg/`.

## Accepted Fallback

For this environment, accepted packaging substitute is the successful `.app` artifact plus app-bundle smoke evidence:

- `.app` path: `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- Supporting evidence doc:
  - `docs/reviews/desktop-phase1-build-packaging-pipeline/20260527-app-bundle-smoke.md`

Residual risk remains for clean-machine DMG mount/drag-install verification and should be finalized in `feature-verify` on real hardware.
