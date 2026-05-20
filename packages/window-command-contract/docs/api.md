# window-command-contract — API / Contract Notes

## Current Commands

- `create_grid_window(gridId, rect) -> void`
- `update_grid_window(gridId, rect) -> void`
- `close_grid_window(gridId) -> void`

## Target Commands

| Command | Input | Output | Status |
|---|---|---|---|
| `create_grid_window` | `CreateGridWindowInput` | `GridWindowSnapshot` | ready for G1.1 build |
| `update_grid_window` | `UpdateGridWindowInput` | `GridWindowSnapshot` | ready for G1.1 build |
| `close_grid_window` | `{ gridId: string }` | `void` | ready for G1.1 build |
| `list_grid_windows` | `void` | `GridWindowSnapshot[]` | ready for G1.1 build |
| `focus_grid_window` | `{ gridId: string }` | `GridWindowSnapshot` | ready for G1.1 build |

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
