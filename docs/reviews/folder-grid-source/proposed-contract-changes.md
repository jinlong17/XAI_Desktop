# Proposed Contract Changes: Folder Grid Source

## Tauri FS Watch

Add a desktop command or event stream for folder mappings:

- `watch_folder({ path, gridId }) -> watchId`
- `unwatch_folder({ watchId })`
- event `organizer:folder:changed` with `{ watchId, gridId, entries }`

Track D uses a mock watcher until the Tauri FS watch contract is approved.
