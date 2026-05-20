# spaces-multimonitor-matrix — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; real Spaces/multi-display validation deferred |
| Review Doc Path | docs/reviews/spaces-multimonitor-matrix/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Manual/native validation gate |

## Frozen Assumptions

- Mission Control, Spaces, fullscreen-app, and multi-display behavior must be verified by a human on macOS.
- 2026-05-19 user confirmation says Grid follows across Spaces/multi-display on the current LG + DELL setup; optional independent screenshot replay can still be done before ship.
- No window collection behavior or level constants should change without captured evidence.
- This task was reached by explicit user override while G0.3/G0.4 were blocked; both are now READY_TO_SHIP.
- Current source applies `CanJoinAllSpaces`, `Stationary`, and `IgnoresCycle` to XAI Desktop windows, but runtime behavior across Mission Control/fullscreen/multi-display remains unproven.
