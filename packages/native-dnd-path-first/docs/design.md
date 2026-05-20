# native-dnd-path-first — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; production DnD path-first blocked |
| Review Doc Path | docs/reviews/native-dnd-path-first/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1 DnD planning |

## Current Shape

- HTML5 drop hook emits names, not full filesystem paths.
- GridWindow G0 telemetry may receive Tauri paths but needs real Finder proof.
- Organizer stores current dropped strings as `DesktopItem.filepath`.
- Alias and security-scoped bookmark behavior is unknown.

## Target Shape

- Drop data enters Organizer as `DroppedFile[]`.
- Each item has `path`, `name`, `kind`, optional `size`, optional alias metadata, and `securityScope`.
- MAS-specific bookmark handling is explicit instead of inferred.

## Frozen Assumptions

- Do not choose Webview vs Rust native receiver until G0.4 evidence exists.
- Do not add security-scoped bookmark fields to persisted data until MAS sandbox evidence is available.
- Contract docs and core types must be updated with production implementation.
