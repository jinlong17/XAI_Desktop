# finder-dnd-path — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | GridWindow G0 drop telemetry plus deferred real Finder validation |
| Review Doc Path | docs/reviews/finder-dnd-path/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Manual/native validation gate |

## Frozen Assumptions

- Finder path payload behavior must be observed in a real Tauri runtime.
- GridWindow may include temporary G0 telemetry because the runtime grid-window path is now fixed and visible.
- No Rust/native drop implementation change is justified without a captured failure mode.
- Alias and MAS security-scoped bookmark policy must be driven by evidence.
