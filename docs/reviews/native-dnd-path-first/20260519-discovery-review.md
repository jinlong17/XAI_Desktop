# Discovery Review — native-dnd-path-first

## Summary

G1.3 cannot start production implementation until MAS/security-scope behavior is known. G0.4 has now recorded real Finder payloads through `GridWindow.tsx` `tauri://drag-drop`: file, folder, `.app`, and alias drops all produce path-backed entries. Current Organizer production handling still reduces drops to `paths: string[]`, and the existing HTML5 hook uses file names rather than full paths.

## Current State

| Area | Current behavior | Evidence |
|---|---|---|
| HTML5 drop hook | Emits file names because browsers do not expose full paths | `packages/plugin-organizer/src/hooks/useFileDrop.ts` |
| GridWindow Tauri telemetry | Listens for `tauri://drag-drop`, records paths/kinds/position/gridId | `apps/desktop/src/windows/GridWindow.tsx` |
| Grid window drop event | Emits `grid-window-file-drop` with `{ gridId, paths }` | `GridWindow.tsx`, `useMultiWindowGrids.ts` |
| Organizer item creation | Converts each string path/name to `DesktopItem` with `filepath` | `packages/plugin-organizer/src/OrganizerLayer.tsx` |
| Alias policy | Preserve Finder/Tauri raw alias file path; do not silently resolve target | `docs/adr/0005-window-foundation.md` |
| Target contract | `DroppedFile[]` with path/name/kind/size/alias/securityScope fields | `docs/contracts/events-v0.md` |

## Open Decisions

- Whether Webview `tauri://drag-drop` is sufficient under MAS sandbox or Rust native drop receiver is required.
- Whether MAS sandbox requires security-scoped bookmarks for dropped paths.
- Where to resolve file size/kind reliably.
- How to preserve current recovered Grid runtime while migrating from `paths: string[]` to `DroppedFile[]`.

## Recommendation

Keep G1.3 BLOCKED until MAS/security-scope evidence exists. G0.4 evidence now favors this production path:

1. Webview path-first: promote Tauri `tauri://drag-drop` handling into Organizer-owned public code.
2. Rust native receiver: add a Rust path receiver only if MAS/security-scope evidence requires it.

Both paths require contract and type updates in the same implementation slice.

## Blocker

MAS sandbox behavior is unresolved. Production DnD work now would be speculative only for security-scoped access and persistence shape, not for basic Finder path-first payload viability.
