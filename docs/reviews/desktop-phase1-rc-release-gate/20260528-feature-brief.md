# Feature Brief — desktop-phase1-rc-release-gate

| Field | Value |
|---|---|
| Feature | desktop-phase1-rc-release-gate |
| Title | Phase 1 Desktop RC Release Gate |
| Date | 2026-05-28 |
| Source | Operator follow-on after all P1 Phase 1 first-wave implementation features shipped on `dev` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Create a Phase 1 release-candidate gate for the integrated Tauri Mac app so the repo can verify the current product as an installable, offline-launchable desktop build and either resolve or explicitly classify the remaining release risks before any Phase 2 work starts.

## Naming Rationale

The provided slug already matches the job:

- `desktop` — the scope is the Tauri/macOS host on `dev`
- `phase1` — this is still ADR-0011 Phase 1, not Phase 2 polish or Phase 3 local-first data work
- `rc-release-gate` — the feature is an integrated release-candidate verification and hardening gate, not another isolated implementation slice

## Scope

- Integrated verification and hardening plan across the already-shipped Phase 1 slices:
  - `.app` bundle generation
  - `.dmg` generation and installability
  - offline launch into `/app`
  - single normal native window startup
  - native menu and config-store persistence behavior
  - offline degradation of online-only panels
- First-blocker routing for DMG packaging if the previously recorded stall still reproduces
- Feature-local RC evidence and risk-classification outputs under `docs/reviews/desktop-phase1-rc-release-gate/`
- Limited code changes only where a discovered RC blocker requires them

## Non-goals

- No Phase 2 notifications, status bar, global hotkeys, auto-update, or expanded native-shell polish
- No Phase 3 SQLite, local-first repository, sync, or account-architecture work
- No broad refactor of `apps/web` business modules unless a concrete RC blocker requires it
- No deletion or reactivation of quarantined overlay/control/grid code
- No release-engineering expansion into signing, notarization, CI release automation, or updater rollout beyond classifying the current Phase 1 local-installer risk

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The selected plan starts with DMG reproduction/classification as the first blocker/fix item if the stall still occurs
- The plan defines one integrated RC verification path covering:
  - `.app` packaging
  - `.dmg` packaging or exact blocker evidence
  - offline `/app` launch
  - normal main-window behavior
  - native menu/config persistence
  - offline degradation of online-only panels
- The plan distinguishes repo-fixable blockers from environment/manual-only residual risks
- The plan preserves ADR-0011 Phase 1 scope and keeps overlay/control/grid code quarantined

## Current Baseline

- `desktop-tauri-web-dist-normal-window` is SHIPPED and already repointed the active desktop runtime to a single normal window loading bundled `apps/web`
- `desktop-web-auth-offline-mode` is SHIPPED and already injects `VITE_WEB_AUTH_MODE=mock-authenticated` for desktop dev/build
- `desktop-phase1-build-packaging-pipeline` is SHIPPED and already made `apps/desktop` the canonical Tauri-host entrypoint for `dev`, `build`, and `build:dmg`
- `web-external-runtime-offline-gates` is SHIPPED and already injects `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` plus owning-package offline degradation gates
- `desktop-basic-macos-menu-config-store` is SHIPPED and already installs the native app menu plus host-owned `app-config.json` persistence
- Existing evidence already proves `.app` generation and bounded host startup, but the packaging pipeline docs still record a local DMG stall after `Running bundle_dmg.sh` with no final artifact under `target/debug/bundle/dmg/`
- Existing shipped docs still leave these integrated RC risks open:
  - real macOS offline GUI launch into `/app`
  - clean install path through `.dmg` if available
  - one consolidated menu/config persistence pass
  - one consolidated offline degradation pass across AI, map, integrations, premium, and account-delete surfaces

## Deferred Validation

- `pnpm --filter @repo/web build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop dev`
- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`
- manual macOS `.app` launch with network disabled
- manual macOS `.dmg` mount, drag-install, and launch if DMG creation succeeds
- manual menu/config persistence checks across relaunch
- manual offline degradation checks for online-only panels
