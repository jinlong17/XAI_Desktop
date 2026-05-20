# Browser Capability Matrix

## Available with web-safe substitute

- `clipboard_read_text`
- `clipboard_write_text`

## Degraded

- `organize_desktop`
- `focus_window`
- `list_windows`
- `fs_pick_file`

These commands return a typed degradation response from `TauriCapabilityStub`.

## Unavailable

Any command not listed above is unavailable in browser runtime until an explicit web adapter exists.
