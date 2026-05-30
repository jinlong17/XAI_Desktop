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
- Manual update (2026-05-29): human operator completed the remaining relaunch/reset checks and reported all functional smoke checks normal.

## Phase 4 Result

- Classification: `PASS`
- Reason: the previously missing real macOS relaunch observation was completed by the human operator.

## Final Four-Residual Matrix

| Residual | Evidence File | Classification | Notes |
|---|---|---|---|
| Network-disabled bundled `/app` launch | `20260528-phase1-network-disabled-bundled-app-launch.md` | `PASS` | Human operator reported offline launch normal and main app UI reachable. |
| Drag-install launch from `/Applications` | `20260528-phase2-drag-install-applications-launch.md` | `PASS` | `/Applications/X Desktop.app` launched as foreground app `com.jinlong.desktop`; human operator observed normal startup. |
| Native menu interactions | `20260528-phase3-native-menu-interactions.md` | `PASS` | Native menus opened; reset/relaunch behavior reported normal. |
| Relaunch across monitor topology changes | `20260528-phase4-monitor-topology-relaunch-and-final-matrix.md` | `PASS` | Human operator reported remaining relaunch/topology smoke normal. |

## Consolidated Blockers

- None for this row after the 2026-05-29 manual smoke pass.

## Repo-side Defect Check

- No `BLOCKED_REPO` residual reproduced in this run.
- No product code changes were made.
