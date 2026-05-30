# Feature Brief — desktop-real-macos-release-smoke

| Field | Value |
|---|---|
| Feature | desktop-real-macos-release-smoke |
| Title | Real macOS Release Smoke Gate |
| Date | 2026-05-28 |
| Source | Roadmap row `#1` in `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` plus seed `docs/reviews/desktop-real-macos-release-smoke/20260528-roadmap-seed.md` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Close the remaining manual real-macOS release-smoke residuals carried forward from `desktop-phase1-rc-release-gate`: network-disabled bundled `/app` launch, drag-install launch from `/Applications`, native menu interactions, and relaunch behavior across monitor topology changes.

## Naming Rationale

The provided slug already matches the job:

- `desktop` — the scope is the Tauri/macOS host on the `dev` branch
- `real-macos` — the unresolved checks require physical macOS GUI interaction rather than another non-interactive repo-only pass
- `release-smoke` — this is a release gate that classifies residual evidence, not a new product capability

## Scope

- Create one feature-local real-macOS smoke plan and evidence contract for the four carried residuals:
  - network-disabled bundled `/app` launch
  - drag-install launch from `/Applications`
  - native menu interactions
  - relaunch behavior across monitor topology changes
- Reuse shipped Phase 1 RC evidence as the baseline and classify each residual as:
  - `PASS`
  - `BLOCKED_REPO`
  - `BLOCKED_ENVIRONMENT`
  - `DEFERRED_OUT_OF_SCOPE`
- Allow only minimal owning-surface fixes if a manual residual reproduces a repo-side defect against the shipped public contract
- Keep final evidence localized under `docs/reviews/desktop-real-macos-release-smoke/`

## Non-goals

- No reopening of broad Phase 1 implementation or prior RC-gate phases unless a concrete repo-side regression is reproduced
- No Phase 2 work such as notifications, status bar, global hotkeys, auto-update, or expanded menu polish
- No Phase 3 local-first, sync, SQLite, overlay revival, or organizer/control/grid reactivation
- No new branch creation outside `dev`
- No ship execution; `ship` remains human-triggered only

## Acceptance

- Planning artifacts exist for this feature: feature brief, discovery review, design, api, test, and dev_log
- The plan leaves one explicit evidence path for all four residual checks
- Each residual ends with one allowed classification:
  - `PASS`
  - `BLOCKED_REPO`
  - `BLOCKED_ENVIRONMENT`
  - `DEFERRED_OUT_OF_SCOPE`
- No carried Phase 1 manual RC residual remains unclassified after this feature is built and verified
- Repo blockers and environment limitations are documented separately
- The plan preserves the normal-window app host and the quarantined overlay/control/grid boundary

## Current Baseline

- `desktop-phase1-rc-release-gate` is SHIPPED and already closed the repo-side automated RC matrix
- Previous evidence already proves:
  - desktop `.app` bundling passes
  - desktop `.dmg` bundling and mount/payload inspection pass
  - the startup path remains the normal-window shell
  - native menu/config code contracts pass automated Rust verification
  - offline degradation for online-only surfaces passes automated coverage
- The previous gate explicitly deferred the remaining GUI checks to a real-macOS pass:
  - `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase2-app-installer-offline-gate.md`
  - `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase3-menu-config-persistence-gate.md`
  - `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase4-offline-degradation-rc-verdict.md`
- `desktop-basic-macos-menu-config-store` already fixed the repo-side geometry/config contract and left only real-hardware interaction risk around menu behavior and relaunch across monitor topologies

## Deferred Validation

- manual macOS launch of the bundled app with network disabled
- manual DMG drag-install and first launch from `/Applications`
- manual native menu interaction checks on the running app
- manual relaunch checks after monitor topology changes
- targeted build/test reruns only if a repo-side defect is reproduced during the smoke pass
