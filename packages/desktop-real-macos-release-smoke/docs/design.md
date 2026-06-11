# desktop-real-macos-release-smoke — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — dedicated real-macOS residual smoke gate with minimal-fix escape hatch |
| Review Doc Path | docs/reviews/desktop-real-macos-release-smoke/20260528-discovery-review.md |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Release-Gate manual residual closure |

## Frozen Assumptions

- `desktop-phase1-rc-release-gate` remains SHIPPED and is the repo-side baseline; this feature does not reopen its broader integrated RC implementation by default.
- The four target checks are the only carried manual residuals for this row:
  - network-disabled bundled `/app` launch
  - drag-install launch from `/Applications`
  - native menu interactions
  - relaunch behavior across monitor topology changes
- The active desktop product remains ADR-0011 Phase 1: normal-window Tauri host wrapping bundled `apps/web`, with offline `/app` entry and explicit degradation for online-only surfaces.
- Legacy overlay/control/grid code remains quarantined and inactive on the default startup path.
- Branch scope is `dev` only.
- `ship` is human-triggered only and is outside this feature-plan run.
- Environment limitations must be documented separately from repo blockers.

## Dependency Overview

- Authority and roadmap:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Upstream shipped feature dependencies:
  - `packages/desktop-phase1-rc-release-gate/docs/dev_log.md`
  - `packages/desktop-basic-macos-menu-config-store/docs/dev_log.md`
  - `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
  - `packages/desktop-phase1-build-packaging-pipeline/docs/dev_log.md`
  - `packages/desktop-web-auth-offline-mode/docs/dev_log.md`
  - `packages/web-external-runtime-offline-gates/docs/dev_log.md`
- Existing evidence inputs:
  - `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase2-app-installer-offline-gate.md`
  - `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase3-menu-config-persistence-gate.md`
  - `docs/reviews/desktop-phase1-rc-release-gate/20260528-phase4-offline-degradation-rc-verdict.md`
- Active host surfaces that may be observed or narrowly fixed only if a defect reproduces:
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/app_menu.rs`
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `apps/desktop/src-tauri/tauri.conf.json`

## Smoke Gate Shape

- One feature owns closure of the remaining real-macOS residuals from the shipped Phase 1 RC gate.
- Phase ordering follows the four residual checks directly.
- Each residual must end in one classification:
  - `PASS`
  - `BLOCKED_REPO`
  - `BLOCKED_ENVIRONMENT`
  - `DEFERRED_OUT_OF_SCOPE`
- Repo blockers and environment limitations must be recorded as separate statements even when they happen in the same session.

## Evidence Shape

Preferred outputs under `docs/reviews/desktop-real-macos-release-smoke/` during build/verify:

- network-disabled bundled-launch smoke note
- drag-install `/Applications` launch note
- native menu interaction note
- monitor-topology relaunch note
- final residual matrix / verdict note

The final feature verdict should reference those feature-local artifacts rather than editing prior shipped RC notes.

## Implementation Phases

### Phase 1 — Network-disabled Bundled `/app` Launch

- Use the canonical built desktop artifact.
- Disable network and launch the bundled app.
- Confirm `/app` entry, no `/auth/login` redirect, and no overlay/control/grid startup.

### Phase 2 — Drag-install Launch from `/Applications`

- Use the canonical DMG/install path when available.
- Drag-install to `/Applications` and launch the installed copy.
- Confirm the same startup contract as the bundled app.

### Phase 3 — Native Menu Interactions

- Verify top-level native menu presence and standard app behavior.
- Exercise `Reveal Config Folder` and `Reset Main Window State`.
- Keep scope limited to the current Phase 1 app shell.

### Phase 4 — Relaunch Across Monitor Topology Changes and Final Matrix

- Change monitor topology or use a valid equivalent real-hardware restore scenario.
- Verify safe relaunch behavior or default fallback behavior.
- Publish one consolidated residual matrix and verdict.
