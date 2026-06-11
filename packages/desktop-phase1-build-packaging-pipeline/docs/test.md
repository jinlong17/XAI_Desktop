# desktop-phase1-build-packaging-pipeline — Test Plan

## Validation Goals

- Confirm `apps/desktop` is the canonical Phase 1 packaging entrypoint
- Confirm desktop packaging still builds from bundled `apps/web` static assets
- Confirm a local `.app` artifact is produced and can launch offline into `/app`
- Confirm default startup remains a single normal window with no overlay/control/grid activation
- Confirm `.dmg` packaging is either locally verified or blocked with exact recorded evidence and a clear fallback

## Contract Checks

- `apps/desktop/package.json`
  - desktop-facing scripts align to Tauri-host behavior, not raw web-only commands
- `apps/desktop/src-tauri/tauri.conf.json`
  - continues to own `beforeDevCommand`, `beforeBuildCommand`, and `frontendDist = ../../web/dist`
- `docs/release/dmg-build.md`
  - reflects ADR-0011 Phase 1 normal-window behavior and current artifact expectations
- feature review evidence
  - records artifact paths, offline launch result, and DMG success/blocker details

## Automated Checks

- `pnpm --filter @repo/web build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop dev`
  - verify the desktop package script resolves to the Tauri host path
- `pnpm --filter desktop build`
  - verify `.app` bundle generation
- `pnpm --filter desktop build:dmg`
  - verify `.dmg` generation or capture the exact blocker stage

If implementation keeps raw `tauri` commands behind wrapper scripts, verify the wrapper commands rather than only the raw commands.

## Manual Desktop Checks

- Launch the built `.app` with network disabled
- Verify the app reaches `/app` from bundled local assets
- Verify no redirect back to `/auth/login`
- Verify only one normal window launches
- Verify no control window, overlay shell, or grid windows appear by default
- Record any online-only degradation separately from packaging success

## DMG Checks

If local `.dmg` generation succeeds:

- mount the `.dmg`
- drag the app into `/Applications`
- launch once online and once offline
- confirm the same single-window normal app behavior

If local `.dmg` generation stalls or fails:

- capture the exact command
- capture the last emitted stage and any subprocess detail
- confirm whether `.app` bundling still succeeded
- record `.app` verification as the best local substitute

## Regression Checks

- `frontendDist` remains the `apps/web` build output, not a reintroduced desktop Vite bundle
- desktop build hooks still inject `VITE_WEB_AUTH_MODE=mock-authenticated`
- packaging changes do not reactivate overlay/control/grid startup
- no Phase 2 or Phase 3 work is introduced to solve packaging

## Mock Strategy

- Reuse the current desktop mock-auth build mode from `desktop-web-auth-offline-mode`
- Do not add new mock surfaces in web business modules
- Use feature-local smoke evidence rather than new business-level mocks for installer verification

## Residual Risk

- Clean-machine DMG install, quarantine behavior, and reinstall/upgrade flows still require real macOS hardware verification even if local app-bundle launch passes
- Finder/AppleScript-dependent DMG creation may behave differently between interactive and unattended sessions
- `.app` success does not prove notarization, signing, or updater readiness; those remain outside Phase 1 scope
