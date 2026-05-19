# window-command-contract — API / Contract Notes

## Current Commands

- `create_grid_window(gridId, rect) -> void`
- `update_grid_window(gridId, rect) -> void`
- `close_grid_window(gridId) -> void`

## Target Commands

| Command | Input | Output | Status |
|---|---|---|---|
| `create_grid_window` | `CreateGridWindowInput` | `GridWindowSnapshot` or `void` final decision pending | blocked by G0 |
| `update_grid_window` | `UpdateGridWindowInput` | `GridWindowSnapshot` or `void` final decision pending | blocked by G0 |
| `close_grid_window` | `{ gridId: string }` | `void` | blocked by G0 |
| `list_grid_windows` | `void` | `GridWindowSnapshot[]` | blocked by G0 |
| `focus_grid_window` | `{ gridId: string }` | `void` | blocked by G0 |

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

Rust implementation details remain blocked by G0.

