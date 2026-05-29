# desktop-overlay-host-v2 - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A - single desktop app with explicit `hostMode` gate, default `normal`, optional `overlay_v2`, and audited reuse of quarantined legacy overlay assets |
| Review Doc Path | `docs/reviews/desktop-overlay-host-v2/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P3+ Future optional host-mode restoration row |

## Frozen Assumptions

- The normal app window remains the default and primary host after this row is implemented.
- Overlay-v2 is a host concern first; organizer/business expansion is deferred to later rows.
- Reuse is allowed only for audited assets. Quarantined code is not automatically approved for reactivation.
- `apps/desktop/src-tauri/src/commands/window.rs` exists today as dormant source only; no runtime command surface exists until `lib.rs` re-registers it and restores related state management.
- Host config stays host-owned and must not become a second persistence plane for organizer or local-first entity data.
- Existing desktop-level/window-level constants are treated as preserved reference behavior; any changes require real macOS validation before ship.
- Overlay-specific capabilities and commands must stay disabled in normal mode.
- `@repo/plugin-ai-cube` and other unstable legacy surfaces must be treated conservatively; do not deepen dependencies casually.
- `packages/plugin-organizer/src/OrganizerLayer.tsx` is not a row `#19` product-surface dependency; at most it becomes a source for extracting thinner orchestration seams, while rows `#20` and `#21` keep Smart Container and organizer restoration scope.

## Dependency Overview

- Governing authority:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - `docs/reviews/desktop-overlay-host-v2/20260528-roadmap-seed.md`
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/adr/0012-phase3-local-first-storage.md`
- Prior shipped host/runtime authority:
  - `docs/reviews/desktop-tauri-web-dist-normal-window/20260527-discovery-review.md`
  - `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
  - `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md`
- Host seams:
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `apps/desktop/src-tauri/src/commands/mod.rs`
  - `apps/desktop/src-tauri/src/commands/window.rs`
  - `apps/desktop/src-tauri/capabilities/default.json`
- Legacy overlay assets:
  - `apps/desktop/src-tauri/src/legacy_overlay.rs`
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs`
  - `apps/desktop/src/main.tsx`
  - `apps/desktop/src/windows/{ControlWindow,GridWindow,ConsoleWindow}.tsx`
  - `packages/plugin-organizer/src/*`

## Selected Runtime Shape

- one desktop app
- one host-owned persisted mode selector:
  - `normal`
  - `overlay_v2`
- current source truth:
  - `commands::window::*` is not registered in `lib.rs`
  - `GridWindowsState` / `ConsoleWindowFrameState` are not managed in the active runtime
- startup behavior:
  - `normal` preserves the current wrapped `apps/web` main-window runtime
  - `overlay_v2` opt-in activates overlay bootstrap and overlay-only shells
- command/capability behavior:
  - feature-build re-registers `commands::window::*` and related state in `lib.rs`
  - overlay-only window lifecycle commands must fail closed in `normal`
  - overlay-specific capabilities must not be granted to default runtime windows

## Asset Disposition Summary

### Keep

- `legacy_overlay.rs`
- `platform::macos::legacy_overlay`
- `GridWindow.tsx`
- `ControlWindow.tsx`
- organizer grid content/layout/persistence seams

### Refactor

- `apps/desktop/src/main.tsx`
- `apps/desktop/src/windows/ConsoleWindow.tsx`
- `commands/window.rs`
- `packages/plugin-organizer/src/OrganizerLayer.tsx` (split host/window orchestration seam only if needed; do not restore full organizer surface here)
- organizer window/event hooks
- `plugin-organizer/manifest.json`

### Exclude From V2 Scope

- default overlay startup
- default-host replacement
- row `#20` Smart Container work
- row `#21` organizer-surface restoration
- organizer business-scope expansion
- host-owned persistence of organizer/local-first entities

## Phase Targets

### Phase 1 - Contract normalization

- host-mode schema
- dormant-command source truth
- overlay-disabled command semantics
- keep/refactor/drop implementation inventory
- `OrganizerLayer.tsx` disposition boundary
- direct-import cleanup plan for overlay-only shells

### Phase 2 - Host-mode gate

- persisted host mode
- startup branching
- `lib.rs` command/state re-registration plan
- normal-mode no-regression guarantee

### Phase 3 - Overlay capability and window wiring

- gated command exposure
- overlay bootstrap wiring
- overlay shell route/window activation

### Phase 4 - Safety and verification

- click-through/focus recovery
- multi-monitor handling
- real-macOS validation of overlay-specific behavior
