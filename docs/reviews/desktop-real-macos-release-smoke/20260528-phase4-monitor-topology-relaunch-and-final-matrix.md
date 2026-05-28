# Phase 4 — Relaunch Across Monitor Topology Changes + Final Residual Matrix (2026-05-28)

## Residual Under Test

- Feature: `desktop-real-macos-release-smoke`
- Residual: relaunch behavior across monitor topology changes
- Deliverable: consolidated four-residual matrix with no unclassified items

## Artifact Provenance

- Branch: `dev`
- Commit under test (phase start): `ac1df100ce5f1c331ecff8ee11e3106f38cbf881`
- Supporting host contract tests executed in this phase:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml app_config::tests::normalize_drops_position_on_mixed_scale_monitors -- --exact` (PASS)
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml app_config::tests::normalize_falls_back_when_monitor_layout_cannot_fit -- --exact` (PASS)

## Environment Conditions

- No real-time monitor topology change was executed in this non-interactive run.
- No operator-observed relaunch cycle on changed display geometry was captured.

## Phase 4 Result

- Classification: `BLOCKED_ENVIRONMENT`
- Reason: relaunch-on-topology-change is a real-hardware interactive check and was not directly exercised in this session.

## Final Four-Residual Matrix

| Residual | Evidence File | Classification | Notes |
|---|---|---|---|
| Network-disabled bundled `/app` launch | `20260528-phase1-network-disabled-bundled-app-launch.md` | `BLOCKED_ENVIRONMENT` | Fresh artifacts built; no trustworthy network-disabled GUI route observation in this run. |
| Drag-install launch from `/Applications` | `20260528-phase2-drag-install-applications-launch.md` | `BLOCKED_ENVIRONMENT` | DMG payload verified; no direct Finder drag-install + `/Applications` launch observation. |
| Native menu interactions | `20260528-phase3-native-menu-interactions.md` | `BLOCKED_ENVIRONMENT` | Menu/config contract tests passed; no direct menu-bar click-path observation. |
| Relaunch across monitor topology changes | `20260528-phase4-monitor-topology-relaunch-and-final-matrix.md` | `BLOCKED_ENVIRONMENT` | Topology fallback tests passed; no real monitor-change relaunch observation. |

## Consolidated Blockers

- B1: Missing interactive hardware execution for network-disabled GUI launch observation.
- B2: Missing operator-run Finder drag-install + `/Applications` launch observation.
- B3: Missing direct menu-bar interaction observation for `Reveal Config Folder` and `Reset Main Window State`.
- B4: Missing real monitor-topology change relaunch observation.

## Repo-side Defect Check

- No `BLOCKED_REPO` residual reproduced in this run.
- No product code changes were made.
