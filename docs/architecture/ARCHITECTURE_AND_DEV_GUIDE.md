# AI Smart Desktop – Architecture & Development Guide

## Overview (Micro‑Kernel + Plugins)
- **Host (apps/desktop)**: Tauri (Rust) + React shell. Owns windowing, tray, shortcuts, global settings, and plugin mounting. No business logic.
- **Plugins (packages/plugin-*)**: Feature modules shipped as React packages (e.g., `plugin-organizer`, sticky notes). Rendered inside the host’s transparent overlay. Communicate via shared context/SDK.
- **UI Library (packages/ui)**: Shared components and styles.

## Visual Shell (Canvas)
- Transparent, fullscreen Tauri window with optional blur/vibrancy.
- Root container uses `pointer-events: none`; interactive elements set `pointer-events: auto`.
- Background controls (opacity/blur) are driven by `SettingsContext` and the Settings Panel (AI Cube).

## AI Assistant (Floating Cube)
- Draggable, dockable cube that toggles the Settings Panel.
- Customizable via settings: color, text color, opacity, size, font size.
- Browser fallback: logs actions; mock wallpaper shows glass effects when not in Tauri.

## Organizer Plugin (Smart Containers)
- `GridSystemProvider` manages grids + items with localStorage persistence (`xai-desktop-layout`).
- `SmartContainer`: draggable/resizable glass box; title bar with hover-revealed icons (menu, lock, fold, view toggle); lock disables drag/resize; smart fold with hover peek.
- DnD between containers via `@dnd-kit/core`: draggable `GridItem`, droppable containers, drag overlay, `moveItem` updates itemIds across grids.
- Global style controls: grid opacity + blur pulled from `SettingsContext`.

## State & Settings (apps/desktop/src/context/SettingsContext.tsx)
- Canvas: `canvasOpacity`, `isBlurEnabled`.
- AI Cube: `cubeColor`, `cubeTextColor`, `cubeOpacity`, `cubeSize`, `cubeFontSize`.
- Grids: `gridOpacity`, `gridBlur`.

## Key Files
- Host shell: `apps/desktop/src/App.tsx`, `App.css`.
- Settings: `apps/desktop/src/components/Settings/SettingsPanel.tsx`.
- AI Cube: `apps/desktop/src/components/AiAssistant/AiCube.tsx`.
- Organizer plugin:
  - State: `packages/plugin-organizer/src/useGridSystem.tsx`.
  - Types: `packages/plugin-organizer/src/types.ts`.
  - Mock data: `packages/plugin-organizer/src/mockData.ts`.
  - UI: `packages/plugin-organizer/src/SmartContainer.tsx`, `GridItem.tsx`.
- Global DnD wrapper: `apps/desktop/src/components/DndProvider.tsx`.

## How to Run
```bash
# Install deps (root)
pnpm install

# Run web preview (host)
cd apps/desktop && pnpm dev

# Run Tauri dev (desktop window)
cd apps/desktop && pnpm tauri dev
```
If `pnpm`/`node` is missing, install Node 18+ and pnpm (`npm i -g pnpm`).

## Testing / Checks
- Type check organizer plugin: `pnpm --filter @repo/plugin-organizer check-types`
- Type check host: `cd apps/desktop && pnpm build` (runs tsc + Vite build)
- No automated UI tests yet; validate manually:
  - Drag/resize SmartContainer; lock to disable movement.
  - Fold/hover peek/expand behavior.
  - Drag items between containers (dnd-kit overlay appears).
  - Settings Panel sliders/toggles update background, AI cube, and grid visuals in real time.

## Usage Tips
- To add a new grid: Settings Panel → “+ New Grid” (AI Icon Settings) or call `createGrid`.
- To add plugin UI: render inside the host’s interactive layer with `pointer-events: auto` wrappers.
- To extend settings: add to `SettingsContext`, surface in `SettingsPanel`, consume in your component.
- To persist new grid fields: extend `GridBox` in `types.ts`, ensure `useGridSystem` read/writes them and they serialize through localStorage.
