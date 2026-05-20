# Discovery Review — grid-window-prototype

| Field | Value |
|---|---|
| Feature | grid-window-prototype |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.2 |
| Date | 2026-05-19 |
| Mode | Fresh plan |

## Problem Framing

G0.2 needs the smallest useful proof that multiple Grid windows can exist independently and carry scoped event payloads. The repository already has `create_grid_window`, `GridWindow.tsx`, and `useMultiWindowGrids`; the missing piece for a direct spike is that manually created `alpha`/`beta` windows render `Loading...` unless the Organizer layer sends real grid state.

## Discovery Scope

No external research is required. This is an internal Tauri/React spike built on existing local primitives.

## Current Code Observations

- `apps/desktop/src-tauri/src/commands/window.rs` already creates windows labeled `grid_{gridId}` and routes them to `/#/grid?id={gridId}`.
- `apps/desktop/src/windows/GridWindow.tsx` reads `gridId`, listens for `grid-update`, and emits `grid-window-*` events with `gridId`.
- `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts` already filters `grid-update` payloads by `gridId`.
- Manually invoked `create_grid_window("alpha", rect)` can open a route, but no Organizer state is available for `alpha` unless main-window state also knows that grid.

## Candidate Options

### Option A — Reuse existing command and add a fallback spike panel

If no grid data is available, `GridWindow.tsx` renders a G0 prototype panel with `gridId`, window label, rect/size, and a scoped-event button. The button uses Tauri's existing `emitTo(windowLabel, ...)` API to target the current window label.

Benefits:
- Does not change `create_grid_window` signature.
- Does not introduce a new Tauri command or capability.
- Keeps G0.2 limited to the allowed `GridWindow.tsx` surface plus docs.
- Gives manual testers a direct DevTools path for alpha/beta.

Risks:
- It is a spike-only UI fallback and should not become product UX.
- Final cross-window proof still requires manual Tauri runtime logs.

### Option B — Add a new Tauri command to launch alpha/beta

Create `create_g0_grid_prototype_windows()` and call the existing command internally.

Benefits:
- Faster manual setup.

Risks:
- Adds command/capability contract surface for a spike.
- Requires `docs/contracts/tauri-commands-v0.md` updates for temporary behavior.
- Increases cleanup burden after G0.

### Option C — Extend Organizer state to create deterministic alpha/beta grids

Change `useGridSystem` to accept caller-provided IDs and route `create-grid-request` through alpha/beta state.

Benefits:
- Uses the normal Organizer data path.

Risks:
- Touches plugin business state for a spike.
- Can blur G0.2 with G1 organizer shell/content work.

## Recommendation

Use Option A. It proves the minimum G0.2 surface while avoiding a new command contract and avoiding broader Organizer state changes.

## Risks And Open Questions

- Real runtime evidence is deferred until a human runs `pnpm --filter desktop tauri dev`.
- The fallback panel should remain visibly marked as G0 prototype behavior.
- `emitTo(windowLabel, ...)` targets the current window label; manual logs should confirm no beta receipt when alpha sends.

