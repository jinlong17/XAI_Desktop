# grid-window-prototype — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — existing command plus GridWindow fallback spike panel |
| Review Doc Path | docs/reviews/grid-window-prototype/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G0 native-window spike |

## Frozen Assumptions

- `create_grid_window(gridId, rect)` already exists and remains the Rust label authority for `grid_{gridId}`.
- G0.2 must not add a new Tauri command or alter command signatures.
- A Grid window with no Organizer state may render a spike fallback panel for manual validation.
- Targeted Tauri `emitTo(windowLabel, event, payload)` is sufficient for this spike's scoped-event proof.
- Manual runtime evidence is deferred in unattended mode.

## Scope Boundary

Allowed implementation surface:
- `apps/desktop/src/windows/GridWindow.tsx`
- docs under `docs/reviews/grid-window-prototype/`
- evidence instructions under `docs/reviews/window-ground-truth/grid-window-prototype/`
- roadmap anchor docs and logs

Out of scope:
- `apps/desktop/src-tauri/src/commands/window.rs` signature changes
- `packages/plugin-organizer/src/useGridSystem.tsx`
- `packages/core/src/events/`
- `docs/contracts/*`

## Behavior

When a Grid window has real Organizer state, it continues rendering `SmartContainer`.

When a Grid window has no grid data, it renders a G0 prototype panel that:
- displays `gridId`;
- displays current window label;
- displays current window position and size;
- emits a `g0-grid-prototype:scoped-ping` payload targeted to the current window label only;
- logs received targeted payloads in the current window console.

