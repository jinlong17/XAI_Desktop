# desktop-tauri-web-dist-normal-window — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — repoint Tauri directly to `apps/web` and demote the legacy desktop React shell to fallback-only |
| Review Doc Path | docs/reviews/desktop-tauri-web-dist-normal-window/20260527-discovery-review.md |
| Review Date/Version | 2026-05-27 |
| Feature Type | P1 Phase 1 desktop host rewrite |

## Frozen Assumptions

- ADR-0011 is the authority: Phase 1 is a normal Mac window wrapping `apps/web`, not the transparent overlay product.
- `apps/web` is already the canonical UI source for Phase 1; this feature must not modify web source.
- Offline `/app` entry policy is handled by the next feature `desktop-web-auth-offline-mode`; this feature only establishes the host/dist handoff needed for that work.
- Legacy overlay/grid/control/runtime code is P3 Future and must not remain on the active startup path after this feature lands.
- Legacy overlay/grid/control implementation must be preserved when it is reusable. Phase 1 may remove it from default launch and active capabilities, but should quarantine reusable overlay behavior under an explicit future/legacy boundary instead of deleting it.

## Dependency Overview

- Upstream authority: `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`, `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`, `docs/audit/2026-05-26-patch-roadmap-source.md`
- Build input: `apps/web` Vite dev server and dist output
- Host surfaces touched: desktop Tauri config, Rust setup, macOS window adapter, capability allowlist, desktop package scripts
- Deferred follow-ons:
  - `desktop-web-auth-offline-mode`
  - `desktop-phase1-build-packaging-pipeline`
  - `web-external-runtime-offline-gates`

## Host Shape After This Feature

- Tauri main window is a standard visible app window:
  - decorated
  - resizable
  - taskbar/Dock-visible
  - non-transparent
  - no Overlay title bar style
- Tauri dev/build loads `apps/web` instead of the legacy `apps/desktop` Vite frontend.
- Startup creates only the main window; no `control`, `grid_*`, or overlay click-through behavior is configured.
- Phase 3 window lifecycle commands and capabilities are removed from the active Phase 1 surface.
- Reusable legacy overlay behavior is namespaced under inactive future boundaries (`legacy_overlay` Rust module and `platform::macos::legacy_overlay`) for P3+ reuse.

## Implementation Phases

### Phase 1 — Dist Handoff

- Repoint `tauri.conf.json` dev/build to `apps/web`.
- Align `apps/desktop/package.json` scripts with the new Tauri host contract.
- Reduce `apps/desktop/src/App.tsx` to a minimal non-overlay fallback so the legacy organizer shell cannot silently re-enter the active path.

### Phase 2 — Normal Window Startup

- Remove overlay-specific startup logic from the active `lib.rs` launch path.
- Stop default control window creation and any full-monitor overlay sizing assumptions.
- Preserve reusable control-window bootstrap and macOS overlay-level helpers under an inactive `legacy_overlay` boundary.
- Keep `window_ext.rs` as the normal-window macOS seam for Phase 1 while namespacing old overlay behavior for future revival.

### Phase 3 — Surface Narrowing

- Remove or unregister legacy grid/control/console window lifecycle commands from the active Phase 1 path.
- Narrow Tauri capability scope to the minimum required for the Phase 1 main window.
- Verify the app launches as a normal window and does not start any legacy overlay surface.
