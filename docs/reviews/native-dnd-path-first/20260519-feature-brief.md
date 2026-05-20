# Feature Brief — native-dnd-path-first

| Field | Value |
|---|---|
| Feature | native-dnd-path-first |
| Gate | G1 — native foundation |
| Source | docs/planning/execution/G1-native-foundation.md §G1.3 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Prepare the G1.3 native DnD path-first feature so Finder drops can later produce path-backed `DroppedFile[]` data for files, folders, app bundles, and aliases.

## Scope

- Map current drop handling in GridWindow and `plugin-organizer`.
- Identify the target `DroppedFile` payload fields from `docs/contracts/events-v0.md`.
- Record blockers from G0.4 Finder DnD evidence and MAS sandbox decisions.
- Do not implement production DnD while MAS/security-scope evidence is unresolved.

## Non-goals

- No Rust native drop receiver.
- No path/alias/security-scoped bookmark implementation.
- No event contract changes.
- No persistence or repository changes.

## Acceptance

- Current path/name behavior is documented.
- Target path-first payload and unresolved fields are documented.
- Status remains BLOCKED by MAS sandbox evidence and overall G0 gate status.
- No production source files change.

## Tests

- `rg -n "DroppedFile|securityScope|alias|FileDrop|DragDrop|tauri://drag-drop|grid-window-file-drop|useFileDrop" apps/desktop/src packages/plugin-organizer/src packages/core/src docs/contracts docs/reviews/window-ground-truth/finder-dnd-path -g '*.{ts,tsx,md}'`
- `test -f docs/reviews/native-dnd-path-first/20260519-feature-brief.md`
- `test -f packages/native-dnd-path-first/docs/dev_log.md`

## Contract Impact

Planning only. Later implementation must update `docs/contracts/events-v0.md`, `packages/core/src/types/events.ts`, and Organizer item/data types if `DroppedFile` shape changes.
