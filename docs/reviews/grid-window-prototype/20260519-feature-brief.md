# Feature Brief — grid-window-prototype

| Field | Value |
|---|---|
| Feature | grid-window-prototype |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.2 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Create a minimal Grid window prototype that lets G0 verify two native Grid windows, `alpha` and `beta`, can exist at the same time and emit scoped events without cross-window contamination.

## Scope

- Reuse the existing `create_grid_window(gridId, rect)` Tauri command without changing its signature.
- Add a G0 fallback surface in `apps/desktop/src/windows/GridWindow.tsx` for Grid windows that have no organizer data yet.
- Display `gridId`, window label, and current window rect/size.
- Add one button that emits a targeted spike event for the current Grid window only.
- Add evidence instructions under `docs/reviews/window-ground-truth/grid-window-prototype/`.
- Maintain `packages/grid-window-prototype/docs/` Workflow V2 docs.

## Non-goals

- No full Organizer UI rewrite.
- No persistence or item model changes.
- No Finder DnD path validation.
- No click-through, Spaces, fullscreen, MAS, or sandbox validation.
- No new Tauri command, EventMap entry, Repository contract, or capability.
- No ship or push.

## Acceptance

- `create_grid_window("alpha", rect)` and `create_grid_window("beta", rect)` can open two Grid windows.
- Each fallback page displays its own `gridId`, current window label, and current rect/size.
- A scoped-event button emits payloads that include `gridId` and window label.
- The event is targeted to the current Grid window label so `alpha` events are not delivered to `beta`.
- Closing one Grid window remains independent from the other existing `close_grid_window(gridId)` behavior.

## Tests

- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter desktop build`
- Manual/devtools evidence deferred:
  - `pnpm --filter desktop tauri dev`
  - Invoke existing `create_grid_window` for `alpha` and `beta`
  - Click each window's scoped-event button and inspect console logs

## Docs Impact

- `docs/reviews/grid-window-prototype/20260519-feature-brief.md`
- `docs/reviews/grid-window-prototype/20260519-discovery-review.md`
- `docs/reviews/window-ground-truth/grid-window-prototype/README.md`
- `packages/grid-window-prototype/docs/design.md`
- `packages/grid-window-prototype/docs/api.md`
- `packages/grid-window-prototype/docs/test.md`
- `packages/grid-window-prototype/docs/dev_log.md`
- `docs/workflow/roadmap/xai-g0-window-spike.md`
- `docs/workflow/roadmap/xai-v1.autorun-20260519.md`
- `docs/workflow/roadmap/xai-v1.deferred-gates.md`

## Contract Impact

None. The existing Tauri command is reused unchanged. The spike event is local to the GridWindow prototype and does not alter `@repo/core` EventMap or `docs/contracts/*`.

