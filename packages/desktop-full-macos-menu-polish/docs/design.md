# desktop-full-macos-menu-polish — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option B — Rust-owned full menu polish with explicit custom-item state for support and quick-open integrations |
| Review Doc Path | docs/reviews/desktop-full-macos-menu-polish/20260528-discovery-review.md |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 2 desktop host-shell refinement |

## Frozen Assumptions

- `desktop-basic-macos-menu-config-store` remains the authoritative baseline for native menu install and host-owned config storage.
- The active desktop surface remains the normal `main` window; this feature must not reactivate overlay/control/grid startup.
- Native menu wiring stays in the Rust/Tauri shell, not in `apps/desktop/src/`.
- Existing quick-open menu helpers are acceptable only as tiny integration points; this feature must not expand hotkey product scope.
- Existing status bar code may coexist at runtime, but this feature must not redesign or broaden tray/statusbar behavior.
- Predefined native menu items should be preferred over custom handlers whenever Tauri already provides the correct macOS action.

## Dependency Overview

- Upstream authority:
  - `docs/reviews/desktop-full-macos-menu-polish/20260528-roadmap-seed.md`
  - `docs/reviews/desktop-full-macos-menu-polish/20260528-feature-brief.md`
  - `packages/desktop-basic-macos-menu-config-store/docs/design.md`
  - `packages/desktop-basic-macos-menu-config-store/docs/dev_log.md`
- Native implementation surfaces:
  - `apps/desktop/src-tauri/src/app_menu.rs`
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `apps/desktop/src-tauri/src/commands/global_hotkey.rs`
  - `apps/desktop/src-tauri/src/commands/statusbar.rs`
- Deferred/inactive surfaces that must remain untouched except tiny integration checks:
  - `apps/desktop/src-tauri/src/legacy_overlay.rs`
  - `apps/desktop/src-tauri/src/platform/macos/legacy_overlay/*`

## Selected Menu Direction

- Keep the app submenu first and purely native/predefined.
- Keep `Edit` mostly predefined.
- Polish `File`, `View`, and `Window` into fuller native sections without inventing new desktop capabilities.
- Treat custom menu items as support/recovery integrations with explicit IDs and explicit enabled/disabled rules.
- Limit dynamic state updates to custom items only.

## Expected Phase Boundaries

### Phase 1 — Full Menu Section Contract

- Define the final section layout and stable custom item IDs.
- Prefer predefined items for standard app/edit/view/window actions.
- Do not change ownership of config storage or startup window selection.

### Phase 2 — Custom Item State and Wiring

- Add a small menu-state helper for custom enabled/disabled behavior.
- Source state only from narrow host facts:
  - main-window presence
  - config-dir/config reset availability
  - existing quick-open runtime/preference state
- Keep custom action handlers inside the Rust shell.

### Phase 3 — Support/Diagnostics Finalization and Verification

- Finalize placement of support/recovery items across `Window` and `Help`.
- Add automated coverage for section contract and state rules.
- Record manual macOS residual checks for native behavior.
