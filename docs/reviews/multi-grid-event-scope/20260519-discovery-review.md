# Discovery Review — multi-grid-event-scope

## Summary

G1.4 requires all Grid events to use the `organizer:grid:*` namespace and include `gridId`. The current implementation already carries `gridId` on most Grid window payloads, but event names are split across legacy unnamespaced events, compatibility aliases, and target docs. Runtime payload validation is also not present; TypeScript types do not protect Tauri event payloads at runtime.

## Current Event Inventory

| Current event | Direction | Payload | Status |
|---|---|---|---|
| `grid-window-ready` | Grid window -> main organizer | `{ gridId }` | Legacy implementation event |
| `grid-window-update` | Grid window -> main organizer | `{ gridId, patch }` | Legacy implementation event |
| `grid-window-close` | Grid window -> main organizer | `{ gridId }` | Legacy implementation event |
| `grid-window-file-drop` | Grid window -> main organizer | `{ gridId, paths }` | Legacy implementation event |
| `grid-update` | main organizer -> Grid windows | `{ gridId, grid, items }` | Legacy implementation event |
| `grid-delete` | main organizer -> Grid windows | `{ gridId }` | Legacy implementation event |
| `organizer:create-grid-request` | control -> main organizer | `{ gridId?, rect }` | Compatibility alias documented in `events-v0.md` |
| `create-grid-request` | control -> main organizer | `{ x?, y? }` | Legacy alias still listened to |
| `g0-grid-prototype:scoped-ping` | Grid window self-test | `{ gridId, windowLabel, rect, count, sentAt }` | G0-only evidence event |

## Contract Gap

`docs/contracts/events-v0.md` targets colon-style names:

- `organizer:grid:ready`
- `organizer:grid:update`
- `organizer:grid:close`
- `organizer:grid:create-request`
- `organizer:file:drop`

`packages/core/src/types/events.ts` currently uses older hyphen-style names:

- `organizer:grid-update`
- `organizer:grid-close`
- `organizer:file-drop`
- `organizer:grid-window-ready`
- `organizer:create-grid-request`

Production code still uses unnamespaced `grid-window-*`, `grid-update`, and `grid-delete` events.

## Recommendation

Do safe prep only. Later production migration should:

1. Add one typed event adapter/constant surface for Organizer events.
2. Introduce `organizer:grid:*` listeners and emitters while preserving legacy aliases temporarily.
3. Validate runtime payloads and reject/ignore events without `gridId`.
4. Update `packages/core/src/types/events.ts` and `docs/contracts/events-v0.md` in the same commit.
5. Add tests for missing `gridId`, two-window isolation, and listener cleanup.

## Blocker

G1.4 production implementation should wait for G0 Go/Conditional Go and G1.1, because event names and payloads depend on stable window command contracts and final DnD payload shape.
