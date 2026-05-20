# Discovery Review — grid-shell-organizer-content

## Summary

G1.2 asks for `GridWindow.tsx` to become a Host shell that parses `gridId`, loads host providers, and renders Organizer content from a public plugin API. The current code is not yet at that boundary: `GridWindow.tsx` imports public Organizer symbols, but it still owns Grid item rendering, window update/close/toggle callbacks, G0 fallback UI, G0 Finder DnD telemetry, and direct `grid-window-*` event emission.

## Current Boundary

| Area | Current owner | Evidence |
|---|---|---|
| Native Grid root | Host | `apps/desktop/src/windows/GridWindow.tsx` |
| Grid rendering | Host via public Organizer `SmartContainer` | `GridWindow.tsx` imports `SmartContainer` from `@repo/plugin-organizer` |
| DnD hook | Host via public Organizer hook plus G0 Tauri telemetry | `useFileDrop`, `tauri://drag-drop` listener |
| Multi-window state sync | Organizer | `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts` |
| Main overlay | Organizer | `packages/plugin-organizer/src/OrganizerLayer.tsx` |
| Public package surface | Organizer | `packages/plugin-organizer/src/index.ts` |

## Target Boundary

- Host `GridWindow.tsx` should only parse the route/window `gridId`, load Host-level providers, and render one public Organizer component.
- `plugin-organizer` should expose an `OrganizerGridContent` component or equivalent hook from `packages/plugin-organizer/src/index.ts`.
- Grid update/close/toggle/drop behavior should live behind the plugin public surface.
- G0 telemetry should either be removed after G0 closes or wrapped as debug-only evidence UI.

## Recommendation

Do safe prep only. Production refactor should wait for:

- G0 Go/Conditional Go.
- G1.1 Window Command Contract implementation.
- G0.4 Finder DnD conclusion, because the content boundary must not hide a drop model that may still change.

## Blocker

G1 production implementation remains blocked. Moving the shell/content boundary now could freeze the wrong DnD/event/command shape before G0 and G1.1 have closed.

## Production Revision — 2026-05-19 23:18 PDT

G0 has Conditional Go for the DMG/private path and G1.1 is READY_TO_SHIP, so the safe-prep blocker is resolved for this production split.

Approved bounded build:

- Preserve current Grid behavior; do not rename events or change DnD payloads in G1.2.
- Move the existing Grid window content implementation into `packages/plugin-organizer/src/OrganizerGridContent.tsx`.
- Export `OrganizerGridContent` through `packages/plugin-organizer/src/index.ts`.
- Keep only native shell/provider/drag responsibilities in `apps/desktop/src/windows/GridWindow.tsx`.
- Document the Host/Organizer public API in `docs/contracts/plugin-organizer-public-api-v0.md`.
