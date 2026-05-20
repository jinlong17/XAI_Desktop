# Discovery Review — native-dnd-path-first

## Summary

G1.3 cannot start production implementation until G0.4 records real Finder payloads. The repo now has G0 telemetry in `GridWindow.tsx` for `tauri://drag-drop`, but current Organizer production handling still reduces drops to `paths: string[]`. The existing HTML5 hook uses file names rather than full paths, while the Tauri telemetry path may provide real paths but is not yet manually verified for file, folder, `.app`, or alias drops.

## Current State

| Area | Current behavior | Evidence |
|---|---|---|
| HTML5 drop hook | Emits file names because browsers do not expose full paths | `packages/plugin-organizer/src/hooks/useFileDrop.ts` |
| GridWindow Tauri telemetry | Listens for `tauri://drag-drop`, records paths/kinds/position/gridId | `apps/desktop/src/windows/GridWindow.tsx` |
| Grid window drop event | Emits `grid-window-file-drop` with `{ gridId, paths }` | `GridWindow.tsx`, `useMultiWindowGrids.ts` |
| Organizer item creation | Converts each string path/name to `DesktopItem` with `filepath` | `packages/plugin-organizer/src/OrganizerLayer.tsx` |
| Target contract | `DroppedFile[]` with path/name/kind/size/alias/securityScope fields | `docs/contracts/events-v0.md` |

## Open Decisions

- Whether Webview `tauri://drag-drop` is sufficient or Rust native drop receiver is required.
- Whether alias drops report the alias path or resolved target path.
- Whether MAS sandbox requires security-scoped bookmarks for dropped paths.
- Where to resolve file size/kind reliably.
- How to preserve current recovered Grid runtime while migrating from `paths: string[]` to `DroppedFile[]`.

## Recommendation

Keep G1.3 BLOCKED. Use `7e20ca8` telemetry to capture G0.4 evidence first. After evidence exists, choose one production path:

1. Webview path-first: promote Tauri `tauri://drag-drop` handling into Organizer-owned public code.
2. Rust native receiver: add a Rust path receiver and expose typed `DroppedFile[]` events.

Both paths require contract and type updates in the same implementation slice.

## Blocker

G0.4 Finder evidence is missing, and MAS sandbox behavior is unresolved. Production DnD work now would be speculative.
