# desktop-phase1-rc-release-gate — API / Contract Notes

## Contract Summary

This feature does not define new business-module APIs. It defines the integrated Phase 1 release-candidate verification contract, blocker-classification rules, and evidence outputs for the desktop app.

Primary contracts:

- packaging and installer verification contract
- offline launch and startup-shape contract
- native menu/config persistence verification contract
- online-only degradation verification contract
- RC blocker-classification and evidence contract

## Upstream Interfaces

### Desktop packaging contract

Current package-owner commands:

- `pnpm --filter desktop dev`
- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`

Current Tauri host inputs:

- `VITE_WEB_AUTH_MODE=mock-authenticated`
- `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- `frontendDist = ../../web/dist`

This feature consumes that contract and verifies it under integrated RC conditions. It should not replace it with ad hoc entrypoints unless a concrete blocker requires a narrow fix.

### Native host contract

Current active host surfaces:

- `apps/desktop/src-tauri/src/lib.rs`
- `apps/desktop/src-tauri/src/app_menu.rs`
- `apps/desktop/src-tauri/src/app_config.rs`

This feature verifies:

- standard main-window startup
- native menu action behavior
- host config persistence/recovery behavior

It must not widen back into overlay/control/grid startup or add unrelated native surfaces.

### Offline runtime contract

Current owning-package offline behavior comes from the shipped runtime-profile work:

- AI live behavior
- map tile behavior
- OAuth and Stripe route/button behavior
- account-delete local-only behavior

This feature verifies that those shipped contracts hold in the integrated desktop app. If they do not, fixes stay in the owning packages.

## Downstream Outputs

### Evidence outputs

Preferred tracked artifacts under `docs/reviews/desktop-phase1-rc-release-gate/`:

- DMG reproduction note
- offline launch note
- menu/config persistence note
- RC verification matrix
- RC risk register / verdict note

Exact filenames may be refined during build, but the feature must leave a single feature-local evidence set.

### RC verdict contract

Each gate item should be classified explicitly:

- `PASS`
- `BLOCKED_REPO`
- `BLOCKED_ENVIRONMENT`
- `DEFERRED_OUT_OF_SCOPE`

Rules:

- `DEFERRED_OUT_OF_SCOPE` is allowed only for true Phase 2/3 items or signing/notarization work outside this feature.
- Phase 1-required gates such as `.app` build, offline `/app` launch, normal-window startup, and offline degradation must not be silently deferred.
- If DMG still stalls after `bundle_dmg.sh` / `osascript`, it must be recorded as the first blocker item, not downgraded to an untracked note.

## Error Semantics

- Failure to produce `X Desktop.app` is a hard Phase 1 RC blocker.
- Failure to launch offline into `/app` from the built desktop artifact is a hard Phase 1 RC blocker.
- Any return of overlay/control/grid startup on the default path is a hard regression.
- Failure of native menu/config persistence behavior is a hard blocker if it breaks the current Phase 1 shell expectations.
- DMG failure semantics:
  - repo/config/build-contract issue -> `BLOCKED_REPO`
  - reproducible handoff stall after `bundle_dmg.sh` / `osascript` with `.app` already produced -> classify explicitly, likely `BLOCKED_ENVIRONMENT` unless repo evidence shows otherwise
- Online-only surface failures:
  - endless loading, hidden mutation, or live-network side effects in offline mode -> `BLOCKED_REPO`
  - clear disabled/offline state with no mutation -> pass

## Permission Notes

- No new Tauri capability widening should be introduced unless a proven RC blocker requires the minimum host fix.
- No new plugin manifests or cross-plugin direct imports belong here.
- No Phase 2 notifications/status-bar/hotkey/updater work belongs here.
- No Phase 3 SQLite/sync/local-first expansion belongs here.

## Idempotency Notes

- Re-running the RC packaging commands should reproduce the same `.app` success path and the same DMG failure stage or success state until code or environment changes.
- Re-running offline degradation checks should not mutate integration or premium state under the desktop offline profile.
- Re-running reset/persistence checks should deterministically restore the main-window defaults and config file shape.
