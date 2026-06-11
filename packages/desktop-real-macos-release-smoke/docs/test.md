# desktop-real-macos-release-smoke — Test Plan

## Validation Goals

- Close the remaining real-macOS Phase 1 RC residuals with explicit evidence.
- Prove or classify the bundled offline `/app` launch path on actual macOS hardware.
- Prove or classify the drag-install launch path from `/Applications`.
- Prove or classify native menu interactions and relaunch behavior across monitor topology changes.
- Keep repo blockers separate from environment limitations.

## Contract Checks

- `apps/desktop/package.json`
  - `build` and `build:dmg` remain the canonical artifact entrypoints
- `apps/desktop/src-tauri/tauri.conf.json`
  - still owns the bundled web-dist desktop build contract
- `apps/desktop/src-tauri/src/lib.rs`
  - still boots the normal-window Phase 1 shell
- `apps/desktop/src-tauri/src/app_menu.rs`
  - still owns the native menu contract for the active startup path
- `apps/desktop/src-tauri/src/app_config.rs`
  - still owns host config persistence and safe restore behavior

## Automated Prerequisites

Run or confirm the minimum needed artifact/build baseline before manual smoke:

- `pnpm --filter @repo/web build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`

If the repo tree is unchanged and a fresh shipped artifact is already trusted, the build phase may record artifact provenance instead of rebuilding. If any repo-side fix is applied, rebuild and rerun the affected regressions.

## Phase-by-Phase Test Boundaries

### Phase 1 — Network-disabled Bundled `/app` Launch

Checks:

- launch the bundled app with network disabled
- verify the app reaches `/app`
- verify there is no redirect to `/auth/login`
- verify exactly one normal app window launches
- verify no overlay shell, control window, or grid window auto-start occurs

Exit rule:

- classify this residual directly; do not infer pass from prior automated route tests alone

### Phase 2 — Drag-install Launch from `/Applications`

Checks:

- mount the generated DMG when available
- drag-install to `/Applications`
- launch the installed app copy once
- verify the installed copy preserves the same `/app` and normal-window startup contract

Exit rule:

- if installation or launch cannot be executed because the environment lacks the needed GUI context, classify `BLOCKED_ENVIRONMENT` with exact limitation

### Phase 3 — Native Menu Interactions

Checks:

- verify expected top-level menus are present in the macOS menu bar
- exercise practical actions:
  - `Reveal Config Folder`
  - `Reset Main Window State`
  - standard minimize/fullscreen/quit behavior as applicable
- verify reset affects host-owned window state only

Exit rule:

- menu interaction outcomes must be tied to direct user-visible behavior, not only Rust test coverage

### Phase 4 — Relaunch Across Monitor Topology Changes and Final Verdict

Checks:

- change monitor topology or run an equivalent valid restore scenario on real hardware
- relaunch the app and verify:
  - saved bounds restore safely when valid
  - fallback/default behavior occurs when prior geometry is no longer usable
- publish one final matrix that includes all four residual checks and their classifications

Exit rule:

- the feature is not complete until the final matrix shows no unclassified carried residual

## Manual macOS Checks

- disable network before launching the bundled app
- inspect the actual route and visible window count
- mount the DMG, drag-install, and launch from `/Applications`
- use the macOS menu bar directly
- perform at least one relaunch after a real monitor-topology change or documented equivalent hardware scenario

## Regression Policy

- If no repo-side defect reproduces, do not make code changes.
- If a repo-side defect reproduces, fix only the minimal owning surface and rerun:
  - the affected manual smoke check
  - the smallest relevant automated regression set
  - canonical desktop build commands if the fix touches build/startup/install surfaces

## Mock Strategy

- Reuse the shipped desktop runtime inputs:
  - `VITE_WEB_AUTH_MODE=mock-authenticated`
  - `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- Do not add new mock surfaces unless a narrow blocker fix requires focused regression coverage.
- Prefer real hardware evidence over simulated UI proofs for this feature.

## Acceptance Rules

- Each residual must be classified as `PASS`, `BLOCKED_REPO`, `BLOCKED_ENVIRONMENT`, or `DEFERRED_OUT_OF_SCOPE`.
- Repo blockers must include the reproduced symptom and owning surface.
- Environment blockers must include the missing condition or limitation.
- `DEFERRED_OUT_OF_SCOPE` must name the out-of-scope dependency explicitly.
- The final verdict artifact must show that no manual RC residual remains unclassified.
