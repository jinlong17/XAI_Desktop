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
- GridWindow G0 telemetry receives Tauri paths for file, folder, `.app`, and alias drops.
- Organizer stores current dropped strings as `DesktopItem.filepath`.
- Alias behavior is known for G0.4: Finder/Tauri preserves the alias file path, for example `/Applications/QuickTime Player.app alias`, with kind `file`.
- MAS security-scoped bookmark behavior is unknown.

## Target Shape

- Drop data enters Organizer as `DroppedFile[]`.
- Each item has `path`, `name`, `kind`, optional `size`, optional alias metadata, and `securityScope`.
- MAS-specific bookmark handling is explicit instead of inferred.

## Frozen Assumptions

- Prefer the verified Webview/Tauri `tauri://drag-drop` path-first receiver unless MAS sandbox evidence forces a Rust/native security-scope bridge.
- Preserve alias file paths by default; do not silently resolve aliases during DnD ingress.
- Do not add security-scoped bookmark fields to persisted data until MAS sandbox evidence is available.
- Contract docs and core types must be updated with production implementation.
