# Codebase Tree (Essential Paths)

Monorepo layout (Turborepo + pnpm). This map highlights where to look for core behaviors and how pieces connect.

```
.
├─ apps/
│  ├─ desktop/                     # Tauri + React host (micro-kernel shell)
│  │  ├─ src/
│  │  │  ├─ App.tsx               # Root shell: click-through canvas, mounts AI Cube, Settings Panel, OrganizerLayer
│  │  │  ├─ App.css               # Core styles: transparency, pointer-events strategy, glass UI
│  │  │  ├─ index.css             # Global transparency reset (html/body/#root)
│  │  │  ├─ main.tsx              # React entry point
│  │  │  ├─ components/
│  │  │  │  ├─ AiAssistant/AiCube.tsx     # Floating AI cube (customizable appearance, drag/dock)
│  │  │  │  ├─ Settings/SettingsPanel.tsx # Global controls: AI cube, grid box settings, new grid spawn
│  │  │  │  └─ DndProvider.tsx            # Global dnd-kit context + drag overlay
│  │  │  ├─ context/SettingsContext.tsx   # Shared settings (cube, grid visual options)
│  │  │  └─ plugins/OrganizerLayer.tsx    # Renders SmartContainers using grid system provider
│  │  ├─ src-tauri/
│  │  │  ├─ tauri.conf.json       # Window config: transparent, non-fullscreen overlay
│  │  │  ├─ src/lib.rs            # macOS window behaviors: clear background, all-spaces, sizing
│  │  │  └─ Cargo.toml            # Tauri deps (macos-private-api), cocoa for macOS tweaks
│  │  └─ scripts/…                # App-level tooling (if any)
│  ├─ web/                        # Next.js example app (not used by desktop host)
│  └─ docs/                       # Next.js docs app (not used by desktop host)
│
├─ packages/
│  ├─ plugin-organizer/           # Smart Containers plugin (feature module)
│  │  ├─ src/
│  │  │  ├─ SmartContainer.tsx    # Draggable/resizable grid box, hover taskbar (menu/lock/fold/view)
│  │  │  ├─ GridItem.tsx          # Draggable item (dnd-kit), grid/list variants
│  │  │  ├─ useGridSystem.tsx     # Grid & item state (create/update/delete/fold/lock/moveItem/persist)
│  │  │  ├─ types.ts              # GridBox & DesktopItem models
│  │  │  └─ mockData.ts           # Seed items / default grid helper
│  │  └─ package.json
│  ├─ ui/                         # Shared UI lib stub (future shared components)
│  ├─ eslint-config/              # Shared lint config
│  └─ typescript-config/          # Shared tsconfig presets
│
├─ scripts/
│  └─ build-mac.sh                # One-click macOS build (pnpm tauri build + artifact copy/rename)
│
├─ docs/                          # Project docs
│  ├─ ARCHITECTURE_AND_DEV_GUIDE.md
│  ├─ BUILD_GUIDE.md
│  └─ STEP_1_CANVAS.md
│
├─ package.json                    # Workspace scripts / metadata
├─ pnpm-workspace.yaml
└─ turbo.json
```

## How the pieces work together
- `apps/desktop/src/App.tsx` wires providers (Settings, GridSystem, DnD), enforces click-through root, and mounts UI layers.
- `SettingsContext` feeds appearance options to AI Cube and Smart Containers (grid opacity/blur).
- `OrganizerLayer` consumes `useGridSystem` from plugin-organizer to render multiple `SmartContainer` instances.
- `SmartContainer` + `GridItem` implement draggable/resizable grids with dnd-kit item moves.
- `src-tauri` config + `lib.rs` ensure a transparent macOS window overlay that sits above wallpaper without creating a new Space.
