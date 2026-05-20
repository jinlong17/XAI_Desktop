# native-dnd-path-first — Test Plan

## Automated Checks

- `test -f docs/reviews/native-dnd-path-first/20260519-feature-brief.md`
- `test -f packages/native-dnd-path-first/docs/dev_log.md`
- `rg -n "DroppedFile|securityScope|alias|FileDrop|DragDrop|tauri://drag-drop|grid-window-file-drop|useFileDrop" apps/desktop/src packages/plugin-organizer/src packages/core/src docs/contracts docs/reviews/window-ground-truth/finder-dnd-path -g '*.{ts,tsx,md}'`

## Deferred Implementation Checks

- Unit test: file/folder/app kind classification.
- Unit test: alias policy preserves raw alias path by default.
- Unit test: `DroppedFile[]` event conversion preserves `gridId`.
- Integration test: Organizer item stores path-backed data.

## Remaining Manual Checks

- MAS sandbox dry run for dropped paths and any required security-scoped bookmark flow.
- `macOSPrivateApi=false` comparison before choosing the final production receiver.
- Decide whether the verified Webview/Tauri receiver is sufficient for MAS or whether a Rust/native bridge is required.
