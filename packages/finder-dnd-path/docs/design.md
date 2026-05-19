# finder-dnd-path — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; real Finder drop validation deferred |
| Review Doc Path | docs/reviews/finder-dnd-path/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Manual/native validation gate |

## Frozen Assumptions

- Finder path payload behavior must be observed in a real Tauri runtime.
- No Webview/native drop implementation change is justified without a captured failure mode.
- Alias and MAS security-scoped bookmark policy must be driven by evidence.

