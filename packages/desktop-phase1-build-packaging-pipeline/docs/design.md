# desktop-phase1-build-packaging-pipeline — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — canonicalize `apps/desktop` package scripts around Tauri and treat `.app` bundle verification as the minimum local artifact, with explicit `.dmg` attempt and blocker recording |
| Review Doc Path | docs/reviews/desktop-phase1-build-packaging-pipeline/20260527-discovery-review.md |
| Review Date/Version | 2026-05-27 |
| Feature Type | P1 Phase 1 desktop packaging/build workflow |

## Frozen Assumptions

- ADR-0011 Phase 1 requires a shippable Mac desktop artifact built from bundled `apps/web` static assets, with offline `/app` launch and clear online-only degradation.
- `desktop-tauri-web-dist-normal-window` is SHIPPED and already converted the active desktop runtime to a single normal window loading `apps/web`.
- `desktop-web-auth-offline-mode` is READY_TO_SHIP and already makes the desktop Tauri path inject `VITE_WEB_AUTH_MODE=mock-authenticated`.
- `apps/desktop/src-tauri/tauri.conf.json` fields `beforeDevCommand`, `beforeBuildCommand`, and `frontendDist = ../../web/dist` are the canonical dist/build contract and should not be replaced by ad hoc path duplication.
- Legacy overlay/control/grid implementation must remain quarantined for P3+ reuse and must not be deleted or reactivated by this feature.
- Local DMG creation may be environment-sensitive because Tauri's DMG bundling currently reaches `bundle_dmg.sh` and Finder/AppleScript tooling before stalling in this session.

## Dependency Overview

- Upstream authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`
  - `docs/audit/2026-05-26-patch-roadmap-source.md`
- Upstream feature dependencies:
  - `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
  - `packages/desktop-web-auth-offline-mode/docs/dev_log.md`
- Active config surfaces:
  - `apps/desktop/package.json`
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `docs/release/dmg-build.md`
- Verification surfaces:
  - `apps/desktop/src-tauri/target/debug/bundle/macos/*.app`
  - `apps/desktop/src-tauri/target/debug/bundle/dmg/*.dmg`

## Target Packaging Shape

- `apps/desktop` becomes the canonical operator entrypoint for Phase 1 desktop runtime and packaging commands
- Tauri remains the owner of:
  - web dev server boot
  - `apps/web` production build invocation
  - bundled asset handoff into the desktop app
- Desktop packaging must expose a deterministic local success path:
  - build `.app`
  - launch `.app` offline
  - confirm single normal window startup
- Desktop packaging must also expose an explicit DMG attempt path:
  - produce and verify `.dmg` when local tooling works
  - otherwise record exact blocker stage and fall back to `.app` evidence

## Implementation Phases

### Phase 1 — Canonical Desktop Entry Points

- Rework `apps/desktop/package.json` so desktop-facing scripts reflect Tauri-host behavior rather than raw web-only commands
- Preserve `tauri.conf.json` as the source-of-truth for `apps/web` dist ownership and desktop mock-auth build hooks
- Update packaging docs to reflect the new commands and Phase 1 normal-window expectations

### Phase 2 — Offline App-Bundle Smoke Path

- Add or document a repeatable local smoke path for the built `.app`
- Verify:
  - offline `/app` launch
  - no overlay/control/grid startup
  - single normal window behavior
- Record evidence under the feature review directory

### Phase 3 — DMG Attempt and Blocker Recording

- Add an explicit DMG packaging command through the desktop package contract
- If DMG succeeds locally, verify mount/install/launch at least once
- If DMG stalls or fails in macOS image tooling, record:
  - exact command
  - last emitted stage
  - expected output path
  - best local substitute (`.app` bundle verification)
  - residual clean-machine installer risk
