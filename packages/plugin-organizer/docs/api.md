# Organizer — API Contract

## Upstream Interfaces

| Surface | Current contract | F3 assumption |
|---|---|---|
| Host main overlay / organizer owner | imports organizer public exports only | keep organizer business logic inside `packages/plugin-organizer/` |
| `apps/desktop/src/windows/GridWindow.tsx` | renders `OrganizerGridContent` and injects `finderClient` | host stays a shell/provider bridge only |
| `apps/desktop/src/windows/ControlWindow.tsx` | emits create-grid request and directly invokes `create_grid_window({ gridId, rect })` | no contract widening beyond organizer UX work |

## Downstream Interfaces

### Existing window lifecycle commands

| Command | Params from TS callers | Runtime owner | Return | F3 rule |
|---|---|---|---|---|
| `create_grid_window` | `{ gridId, rect }` | `apps/desktop/src-tauri/src/commands/window.rs` | typed `Result<GridWindowSnapshot, CommandError>` over Tauri IPC | keep payload shape unchanged |
| `update_grid_window` | `{ gridId, rect }` | `apps/desktop/src-tauri/src/commands/window.rs` | typed `Result<GridWindowSnapshot, CommandError>` | keep payload shape unchanged |
| `close_grid_window` | `{ gridId }` | `apps/desktop/src-tauri/src/commands/window.rs` | typed `Result<(), CommandError>` | keep payload shape unchanged |
| `list_grid_windows` | none | `apps/desktop/src-tauri/src/commands/window.rs` | typed `Result<GridWindowSnapshot[], CommandError>` | out of scope for F3 |
| `focus_grid_window` | `{ gridId }` | `apps/desktop/src-tauri/src/commands/window.rs` | typed `Result<GridWindowSnapshot, CommandError>` | out of scope for F3 |

Evidence:

- `packages/plugin-organizer/src/hooks/useGridWindow.ts`
- `apps/desktop/src/windows/ControlWindow.tsx`
- `apps/desktop/src-tauri/src/commands/window.rs`

### Existing Finder and bookmark commands

| Command | Params from TS callers | Runtime owner | Return | F3 rule |
|---|---|---|---|---|
| `reveal_in_finder` | `{ input: { path } }` | `apps/desktop/src-tauri/src/commands/finder.rs` | typed `Result<(), AppError>` | preserve bookmark-gated semantics |
| `open_path` | `{ input: { path } }` | `apps/desktop/src-tauri/src/commands/finder.rs` | typed `Result<(), AppError>` | preserve bookmark-gated semantics |
| `register_path_bookmark` | `{ input: { path } }` | `apps/desktop/src-tauri/src/commands/bookmarks.rs` | typed `Result<(), AppError>` | unchanged; still required for honest provenance |
| `clear_path_bookmark` | `{ input: { path } }` | `apps/desktop/src-tauri/src/commands/bookmarks.rs` | typed `Result<(), AppError>` | unchanged; idempotent cleanup only |

Operational semantics:

- TS callers go through `packages/plugin-organizer/src/finderClient.ts`.
- Rust applies two gates before Finder/open actions succeed:
  - lexical path validation
  - `BookmarkRegistry` authorization
- F3 must not document or implement weaker “absolute path is enough” semantics.

### Proposed additive thumbnail seam (gated)

| Candidate | Purpose | Contract notes |
|---|---|---|
| `generate_file_thumbnail` | native thumbnail generation for image/PDF/video paths | additive only; must not alter existing window/finder/bookmark command signatures |

Planning assumptions for the additive seam:

- request shape can be new, but must remain isolated from existing commands
- UI must render placeholder/icon fallback first
- failures must be recoverable without breaking grid rendering
- authorization must remain consistent with the existing user-authorized path model

## Event Contracts

| Event | Payload | F3 handling assumption |
|---|---|---|
| `organizer:grid:update` | `{ gridId, changes }` | payload schema unchanged; emission cadence may change |
| `organizer:grid:close` | `{ gridId }` | unchanged; direct close UI becomes a new caller |
| `organizer:grid:file-drop` | `{ gridId, files }` | unchanged; bookmark registration still happens before forwarding |
| `organizer:grid:state` | existing grid snapshot payload | unchanged |
| `organizer:grid:ready` | `{ gridId }` | unchanged |
| `organizer:create-grid-request` | `{ gridId?, rect }` | unchanged |

## Error Semantics

- Window lifecycle commands keep existing runtime enforcement and error classes, including invalid grid id, capability denial, native window errors, and window-not-found.
- Grid windows are not allowed to invoke window lifecycle commands directly; `window.rs` still enforces the `main` / `control` caller allow-list.
- Finder/open-path authorization failures stay bookmark-gated and must continue to reject unregistered paths.
- Drag/event-smoothing work must remain lossless for the final committed grid rect.
- Thumbnail generation failures must degrade to a visible fallback, not a broken item tile.

## Permission And Idempotency Notes

- F3 does not widen organizer authority beyond existing grid/finder surfaces.
- `register_path_bookmark` / `clear_path_bookmark` remain idempotent.
- If a thumbnail command is added, it must honor the same user-authorized path model already enforced for Finder/open actions.
- Context-menu actions that toggle lock/fold/view mode remain idempotent under repeated invocation.

## Public Surface Assumptions

The plugin public surface remains `index.ts` only. F3 may extend exported organizer UI/helpers, but external callers must not import internal modules directly.
