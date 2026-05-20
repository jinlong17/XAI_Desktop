# multi-grid-event-scope — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Production migration to `organizer:grid:*` events |
| Review Doc Path | docs/reviews/multi-grid-event-scope/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1 event contract implementation |

## Previous Shape

- Grid windows emit `grid-window-*` events with `gridId`.
- The main organizer emits `grid-update` and `grid-delete`.
- Control uses `organizer:create-grid-request`, with `create-grid-request` still listened to as a legacy alias.
- Contract docs target `organizer:grid:*`, while `EventMap` still has hyphen-style organizer event names.

## Implemented Shape

- Public event names use `organizer:grid:*`.
- All cross-Grid payloads include `gridId`.
- Runtime listeners validate payload shape before applying state.
- Legacy aliases are temporary and documented during migration.

Implemented runtime events:

| Event | Direction |
|---|---|
| `organizer:grid:ready` | Grid window -> Organizer main |
| `organizer:grid:state` | Organizer main -> Grid window |
| `organizer:grid:update` | Grid window -> Organizer main |
| `organizer:grid:close` | Grid window -> Organizer main and Grid shell |
| `organizer:grid:create-request` | Control -> Organizer main |
| `organizer:file:drop` | Grid window -> Organizer main |

## Frozen Assumptions

- G1.4 keeps file-drop payload path-backed and does not add MAS bookmark/security-scope behavior while G1.3 is external-blocked.
- Event contract docs and `packages/core/src/types/events.ts` changed together.
- Missing or invalid `gridId` should be ignored or rejected with a log, not applied globally.
