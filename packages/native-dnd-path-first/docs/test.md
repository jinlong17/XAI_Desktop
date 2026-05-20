# native-dnd-path-first — Test Plan

## Automated Checks

- `test -f docs/reviews/native-dnd-path-first/20260519-feature-brief.md`
- `test -f packages/native-dnd-path-first/docs/dev_log.md`
- `rg -n "DroppedFile|securityScope|alias|FileDrop|DragDrop|tauri://drag-drop|grid-window-file-drop|useFileDrop" apps/desktop/src packages/plugin-organizer/src packages/core/src docs/contracts docs/reviews/window-ground-truth/finder-dnd-path -g '*.{ts,tsx,md}'`

## Deferred Implementation Checks

- Unit test: file/folder/app kind classification.
- Unit test: alias raw/resolved policy once G0.4 evidence exists.
- Unit test: `DroppedFile[]` event conversion preserves `gridId`.
- Integration test: Organizer item stores path-backed data.

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Drop Finder file, folder, `.app`, and alias into a Grid.
- Capture `[G0 Finder DnD] path-first drop` logs.
- Decide Webview vs Rust native receiver.
