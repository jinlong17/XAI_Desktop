# Discovery Review — finder-dnd-path

## Summary

The repository already has `packages/plugin-organizer/src/hooks/useFileDrop.ts` and Grid window file-drop events, but G0.4 acceptance is about real Finder payloads in a Tauri runtime. Static inspection cannot prove whether files, folders, App bundles, and aliases produce real absolute paths.

## Recommendation

Prepare the evidence matrix and block the feature until a human can run Finder drag/drop validation. Avoid changing `useFileDrop.ts` or native drop receivers without the observed failure mode.

## Required Human Evidence

- File drop payload includes absolute path and `gridId`.
- Folder drop payload includes absolute path and `gridId`.
- `.app` bundle drop produces an App path or documented fallback.
- Alias behavior is recorded as either resolved target path or alias path.
- If Webview drop fails, record whether native drop receiver is needed.

