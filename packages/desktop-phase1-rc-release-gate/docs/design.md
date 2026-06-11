# desktop-phase1-rc-release-gate — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — dedicated integrated RC gate with blocker-first DMG triage, then offline launch, menu/config persistence, and online-only degradation verification |
| Review Doc Path | docs/reviews/desktop-phase1-rc-release-gate/20260528-discovery-review.md |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 1 integrated release-candidate gate |

## Frozen Assumptions

- ADR-0011 Phase 1 remains the active target: normal-window Tauri host wrapping bundled `apps/web` with offline `/app` launch and clear degradation for online-only surfaces.
- The five first-wave implementation slices are already SHIPPED; this feature is a gate over their integrated behavior, not a rewrite of their decisions.
- `pnpm --filter desktop build` already represents the canonical local `.app` path, while `pnpm --filter desktop build:dmg` is the explicit installer attempt path.
- If the previously recorded DMG stall still reproduces after `Running bundle_dmg.sh` / `osascript`, that becomes the first blocker item and must be classified before the RC verdict is considered complete.
- `VITE_WEB_AUTH_MODE=mock-authenticated` and `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` remain the canonical desktop runtime/build inputs unless a concrete RC blocker proves otherwise.
- Legacy overlay/control/grid code remains quarantined for P3+ reuse and must not be deleted or reactivated by this gate.
- `apps/web` business-module edits are allowed only when a verified RC blocker requires them.

## Dependency Overview

- Upstream authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/release/dmg-build.md`
- Upstream shipped feature dependencies:
  - `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
  - `packages/desktop-web-auth-offline-mode/docs/dev_log.md`
  - `packages/desktop-phase1-build-packaging-pipeline/docs/dev_log.md`
  - `packages/web-external-runtime-offline-gates/docs/dev_log.md`
  - `packages/desktop-basic-macos-menu-config-store/docs/dev_log.md`
- Existing evidence inputs:
  - `docs/reviews/desktop-tauri-web-dist-normal-window/20260527-offline-launch-smoke.md`
  - `docs/reviews/desktop-phase1-build-packaging-pipeline/20260527-app-bundle-smoke.md`
  - `docs/reviews/desktop-phase1-build-packaging-pipeline/20260527-dmg-attempt.md`
- Active runtime surfaces:
  - `apps/desktop/package.json`
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/app_menu.rs`
  - `apps/desktop/src-tauri/src/app_config.rs`

## RC Gate Shape

- One feature owns the integrated Phase 1 release-candidate verdict.
- Phase ordering is blocker-first:
  - R1 packaging/DMG
  - R2 offline `/app` + normal window
  - R3 native menu/config persistence
  - R4 online-only degradation
- Each gate item must end in one of:
  - verified pass
  - repo-side blocker requiring fix
  - environment/manual blocker with exact evidence

## Evidence Shape

Preferred outputs under `docs/reviews/desktop-phase1-rc-release-gate/` during build/verify:

- DMG reproduction note
- offline launch / install smoke note
- menu/config persistence note
- RC verification matrix and risk register

The final RC verdict should reference those artifacts rather than scattering conclusions across upstream feature docs.

## Implementation Phases

### Phase 1 — DMG Reproduction and Blocker Classification

- Re-run the explicit installer path via `pnpm --filter desktop build:dmg`.
- Determine whether the failure point is:
  - repo/config/build-contract bug
  - Tauri-to-macOS image-tooling handoff stall
  - no failure, DMG produced
- If repo-side, fix only the minimum packaging issue needed for Phase 1.

### Phase 2 — Integrated App/Installer Offline Launch Gate

- Verify `.app` artifact generation remains good.
- Launch offline into bundled `/app`.
- If a `.dmg` exists, mount, drag-install, and launch once.
- Confirm the active path remains one normal main window with no overlay/control/grid startup.

### Phase 3 — Native Menu and Config Persistence Gate

- Exercise native menu behavior and practical support items.
- Verify host config persistence across relaunch, including reset behavior.
- Keep focus on the current Phase 1 main window only.

### Phase 4 — Online-only Surface Degradation and Final RC Verdict

- Verify offline AI/map/integrations/premium/account-delete behavior in the integrated desktop app.
- Record any repo-side blocker fixes needed to preserve fail-soft or fail-closed behavior.
- Publish one consolidated RC matrix and verdict.
