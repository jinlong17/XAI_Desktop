# System Features & Behavior Overview

## Host (apps/desktop)
- Transparent overlay window (non-fullscreen, no decorations) sized to the monitor. macOS behaviors: joins all Spaces, stationary, ignores cycle; background cleared via Cocoa; normal window level so it sits over wallpaper without creating a new Space.
- Click-through root: `.app-shell` is `pointer-events: none`; interactive widgets (`AiCube`, `SettingsPanel`, `SmartContainer`) are explicitly `pointer-events: auto`.
- Global settings (`SettingsContext`):
  - AI Cube: color, text color, opacity, size, font size.
  - Grid boxes: opacity, blur (per-box glass effect).
- AI Assistant (AiCube): draggable/dockable, customizable appearance, toggles Settings Panel.
- Settings Panel: AI icon controls, grid box controls, “+ New Grid”; canvas/background controls removed to keep full transparency.
- DnD Provider: wraps app with dnd-kit context and drag overlay for item moves.

## Smart Containers (plugin-organizer)
- Grid system (`useGridSystem`): manages `GridBox` and `DesktopItem`; supports create/update/delete/fold/lock; `moveItem` between grids; localStorage persistence; height cache for folding.
- SmartContainer UI:
  - Title bar hover-revealed actions: menu (context), lock/unlock, fold/peek, view toggle (grid/list).
  - Lock disables drag/resize; fold collapses to title bar with hover peek; drag elevates z-index; droppable highlight on hover.
  - Drag/resize constraints; taskbar icons styled distinct from box background.
- Drag-and-drop: dnd-kit `GridItem` draggable; containers droppable with highlight; drag overlay shows ghost; `moveItem` updates itemIds across grids.

## Build & Operations
- macOS build script: `scripts/build-mac.sh` (pnpm install → pnpm tauri build, artifacts copied to `~/Desktop/XAI_Builds` with timestamped names).
- Docs: `docs/BUILD_GUIDE.md` (prereqs, run, Gatekeeper); `docs/ARCHITECTURE_AND_DEV_GUIDE.md` (architecture + dev notes); `docs/codebse_tree.md`/`system_feature.md` for quick orientation.
- Cargo/Tauri: `tauri` with `macos-private-api`; window transparency/behavior handled in `src-tauri/src/lib.rs` + `tauri.conf.json`.

## Usage & Extension
- Dev run: `cd apps/desktop && pnpm tauri dev` (desktop window) or `pnpm dev` (web preview).
- Add interactive UI: set `pointer-events: auto` on your component container; keep outer shells `pointer-events: none` for click-through behavior.
- Extend settings: add fields to `SettingsContext`, expose in `SettingsPanel`, consume in component. Persist per-grid fields via `useGridSystem` + `GridBox` typing.
