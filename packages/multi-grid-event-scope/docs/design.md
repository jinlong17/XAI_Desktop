# multi-grid-event-scope — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; production event migration blocked |
| Review Doc Path | docs/reviews/multi-grid-event-scope/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1 event contract planning |

## Current Shape

- Grid windows emit `grid-window-*` events with `gridId`.
- The main organizer emits `grid-update` and `grid-delete`.
- Control uses `organizer:create-grid-request`, with `create-grid-request` still listened to as a legacy alias.
- Contract docs target `organizer:grid:*`, while `EventMap` still has hyphen-style organizer event names.

## Target Shape

- Public event names use `organizer:grid:*`.
- All cross-Grid payloads include `gridId`.
- Runtime listeners validate payload shape before applying state.
- Legacy aliases are temporary and documented during migration.

## Frozen Assumptions

- G1.4 should not lock final DnD payload shape before G0.4 completes.
- Event contract docs and `packages/core/src/types/events.ts` must change together during production migration.
- Missing or invalid `gridId` should be ignored or rejected with a log, not applied globally.
