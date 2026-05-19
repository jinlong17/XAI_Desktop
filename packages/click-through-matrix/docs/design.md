# click-through-matrix — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; real hit-test validation deferred |
| Review Doc Path | docs/reviews/click-through-matrix/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Manual/native validation gate |

## Frozen Assumptions

- Click-through cannot be proven without a real Tauri runtime session.
- No NSWindow level, `setIgnoresMouseEvents`, or Tauri config changes should be made without live evidence.
- A BLOCKED status is more accurate than fabricating a pass from static inspection.

