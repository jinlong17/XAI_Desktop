# desktop-real-macos-release-smoke — API / Contract Notes

## Contract Summary

This feature does not define new business APIs. It defines the real-macOS residual smoke contract, classification rules, and evidence outputs that close the remaining manual Phase 1 RC checks.

Primary contracts:

- bundled app offline-launch verification contract
- drag-install `/Applications` launch verification contract
- native menu interaction verification contract
- monitor-topology relaunch verification contract
- residual classification and evidence contract

## Upstream Interfaces

### Desktop artifact contract

Canonical desktop entrypoints remain:

- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`

Canonical desktop runtime inputs remain:

- `VITE_WEB_AUTH_MODE=mock-authenticated`
- `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- bundled `apps/web` dist via the active Tauri config

This feature consumes those artifacts. It must not invent alternate launch paths unless a reproduced blocker requires a narrow fix.

### Startup route contract

Current active Phase 1 startup expectations:

- bundled desktop launch reaches `/app`
- no redirect to `/auth/login` in the intended offline desktop path
- default startup remains one normal main window
- overlay/control/grid windows remain inactive on the default path

### Native host contract

Current active host surfaces:

- `apps/desktop/src-tauri/src/lib.rs`
- `apps/desktop/src-tauri/src/app_menu.rs`
- `apps/desktop/src-tauri/src/app_config.rs`

This feature verifies:

- native menu interaction behavior
- host config persistence/recovery behavior
- safe relaunch when monitor topology differs from the saved state

### Environment contract

This feature assumes access to real macOS hardware with:

- ability to disable network
- ability to mount/install the built DMG
- ability to interact with the system menu bar
- ability to vary or at least accurately document monitor topology for relaunch testing

If those conditions are unavailable, the limitation must be classified as environment-side rather than silently attributed to the repo.

## Downstream Outputs

### Evidence outputs

Preferred tracked artifacts under `docs/reviews/desktop-real-macos-release-smoke/`:

- bundled offline-launch note
- drag-install launch note
- native menu interaction note
- monitor-topology relaunch note
- final residual matrix and verdict note

### Classification contract

Each of the four residual checks must end in one explicit state:

- `PASS`
- `BLOCKED_REPO`
- `BLOCKED_ENVIRONMENT`
- `DEFERRED_OUT_OF_SCOPE`

Rules:

- `BLOCKED_REPO` means the residual reproduced a defect in the shipped public contract and requires a minimal fix in the owning surface.
- `BLOCKED_ENVIRONMENT` means the check could not be completed or trusted because of missing hardware conditions, permissions, install context, or comparable environment limitations.
- `DEFERRED_OUT_OF_SCOPE` is allowed only when the unmet condition is genuinely outside this feature's charter, such as a true Phase 2/3 requirement. It must not be used to skip one of the four named residuals by convenience.
- `PASS` requires direct evidence for the specific residual, not inference from a prior automated run.

## Error Semantics

- Failure of bundled offline `/app` launch is a hard Phase 1 release-smoke blocker.
- Failure of drag-installed `/Applications` launch is a hard installer-path blocker for this feature.
- Reappearance of overlay/control/grid startup on the default path is a hard regression.
- Failure of `Reveal Config Folder`, `Reset Main Window State`, or normal native menu behavior is a blocker if it violates the current Phase 1 shell contract.
- Relaunch after monitor-topology change is a blocker if the app violates the shipped persistence contract rather than falling back safely.

## Permission Notes

- No new Tauri capability widening should be introduced unless a reproduced blocker requires the minimum host fix.
- No new plugin manifests, plugin-to-plugin imports, or Phase 2/3 architecture work belong here.
- No expansion back into overlay/control/grid startup belongs here.

## Idempotency Notes

- Re-running a passed manual smoke step on the same artifact and environment should yield the same classification until code or environment changes.
- If a repo-side fix is applied, the affected manual smoke and the smallest necessary automated regressions must be rerun before the classification is updated.
- Final residual reporting should remain additive and explicit; do not overwrite prior blocker notes without replacing them with newer evidence.
