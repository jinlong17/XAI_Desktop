# desktop-phase1-build-packaging-pipeline — API / Contract Notes

## Contract Summary

This feature does not add business-module APIs. It defines the build, packaging, and verification contract for the Phase 1 desktop host.

Primary contracts:

- desktop package script contract
- Tauri build ownership contract
- artifact output contract
- offline smoke and DMG blocker-reporting contract

## Upstream Interfaces

### Tauri build ownership contract

`apps/desktop/src-tauri/tauri.conf.json` is the canonical desktop/web integration seam:

- `beforeDevCommand = VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web dev`
- `beforeBuildCommand = VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build`
- `frontendDist = ../../web/dist`

Implications:

- desktop scripts should invoke Tauri, not duplicate the underlying `@repo/web` dist path logic
- the packaging feature must preserve the existing desktop mock-auth contract from `desktop-web-auth-offline-mode`

### Upstream runtime dependency contract

- `desktop-tauri-web-dist-normal-window` owns normal-window startup and web-dist loading
- `desktop-web-auth-offline-mode` owns offline `/app` entry policy

This feature must consume those results, not re-implement them.

## Downstream Interfaces

### Desktop package script contract

Target operator behavior after implementation:

- `pnpm --filter desktop dev`
  - launches the Tauri desktop app for Phase 1 development
- `pnpm --filter desktop build`
  - produces the local Phase 1 `.app` artifact
- `pnpm --filter desktop build:dmg`
  - attempts the local DMG packaging path explicitly
- optional helper such as `pnpm --filter desktop build:web` or `smoke:offline`
  - may exist, but must stay secondary to the desktop host contract

The exact names may be refined during build, but the contract must make desktop packaging discoverable from `apps/desktop/package.json`.

### Artifact output contract

Expected local outputs:

- app bundle:
  - `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- dmg bundle:
  - `apps/desktop/src-tauri/target/debug/bundle/dmg/*.dmg`

If release-mode scripts are introduced later, they must preserve the same output families under `target/release/bundle/`.

### Smoke evidence contract

The feature must define where packaging evidence lives and what it records:

- command executed
- artifact path
- offline launch result
- whether only one normal window started
- whether any overlay/control/grid windows started
- DMG success or exact blocker stage

Preferred location: a tracked feature review artifact under `docs/reviews/desktop-phase1-build-packaging-pipeline/`.

## Error Semantics

- Failure to produce `X Desktop.app` is a hard Phase 1 packaging regression.
- Failure to reach `/app` offline from the built `.app` is a hard regression, even if the web dist compiles.
- Failure to produce a `.dmg` should be classified precisely:
  - if a code/config issue inside the repo causes it, treat as a feature blocker
  - if local macOS image tooling stalls after Tauri hands off to DMG creation, record the exact blocker and use `.app` bundle verification as the best local substitute for this environment
- Any packaging change that reactivates overlay/control/grid startup is a regression against ADR-0011 Phase 1 scope.

## Permission Notes

- No new Tauri capabilities, native commands, or plugin manifests should be introduced just to close the packaging workflow.
- No signing, notarization, updater, or Phase 2 native affordances are required for this feature to complete planning.

## Idempotency Notes

- Re-running the desktop build command should deterministically regenerate the same app-bundle family from the current `apps/web` dist.
- Re-running the DMG attempt command should either produce the installer or fail at a reproducible recorded stage.
- Smoke evidence must distinguish deterministic repo regressions from environment-specific packaging stalls.
