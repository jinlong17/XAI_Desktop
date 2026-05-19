# Organizer — API Contract

## Tauri Commands

### create_grid_window
**Params:** `{ grid_id: string, x: f64, y: f64, width: f64, height: f64 }`
**Returns:** `void`
**Errors:** Window creation failure

### update_grid_window
**Params:** `{ grid_id: string, x: f64, y: f64, width: f64, height: f64 }`
**Returns:** `void`
**Errors:** Window not found

### close_grid_window
**Params:** `{ grid_id: string }`
**Returns:** `void`
**Errors:** Window not found

## Events (emit)

### organizer:grid-update
**Payload:** `{ gridId: string; changes: Partial<GridBox> }`
**From:** Any grid window or main window
**To:** All windows

### organizer:grid-close
**Payload:** `{ gridId: string }`
**From:** Grid window
**To:** Main window

### organizer:file-drop
**Payload:** `{ gridId: string; files: string[] }`
**From:** Main window (HTML5 drop handler)
**To:** Target grid window

### organizer:grid-window-ready
**Payload:** `{ gridId: string }`
**From:** Grid window (on mount)
**To:** Main window

### organizer:create-grid-request
**Payload:** `{ gridId?: string; rect: Rect }`
**From:** Control window
**To:** Main window OrganizerLayer; the main window creates grid state with the provided `gridId` when present, then invokes Rust window commands during grid sync. The control window may also invoke `create_grid_window` directly with the same `gridId` as a no-duplicate fallback.

## Events (listen)

### organizer:grid-update
**Handler:** Update local grid state to reflect changes from other windows

### organizer:grid-window-ready
**Handler:** Send initial grid data to newly created grid window

## Public Exports (from index.ts)

- `SmartContainer` — Main grid container component
- `GridItem` — Individual item renderer
- `useGridSystem` — Grid state management hook
- `useContainerManager` — Container lifecycle management
- Types: `GridBox`, `DesktopItem`, `PersistedLayout`
