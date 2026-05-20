# window-command-contract — API / Contract Notes

## Current Commands

- `create_grid_window(gridId, rect) -> GridWindowSnapshot`
- `update_grid_window(gridId, rect) -> GridWindowSnapshot`
- `close_grid_window(gridId) -> void`
- `list_grid_windows() -> GridWindowSnapshot[]`
- `focus_grid_window(gridId) -> GridWindowSnapshot`

## Target Commands

| Command | Input | Output | Status |
|---|---|---|---|
| `create_grid_window` | `CreateGridWindowInput` | `GridWindowSnapshot` | implemented |
| `update_grid_window` | `UpdateGridWindowInput` | `GridWindowSnapshot` | implemented |
| `close_grid_window` | `{ gridId: string }` | `void` | implemented |
| `list_grid_windows` | `void` | `GridWindowSnapshot[]` | implemented |
| `focus_grid_window` | `{ gridId: string }` | `GridWindowSnapshot` | implemented |

## Contract Source

`docs/contracts/tauri-commands-v0.md` is already the cross-module contract source for target G1 window commands. This safe-prep pass does not modify it.

## Error Shape

Target command errors should expose:

```ts
interface CommandError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}
```

Rust implementation is now unblocked by G0 Conditional Go for the DMG/private path.

## Implementation Sources

- Rust command types: `apps/desktop/src-tauri/src/lib.rs`
- Rust command handlers: `apps/desktop/src-tauri/src/commands/window.rs`
- TS contract types: `packages/core/src/types/window.ts`
- Organizer hook adapter: `packages/plugin-organizer/src/hooks/useGridWindow.ts`
- Cross-module contract: `docs/contracts/tauri-commands-v0.md`
