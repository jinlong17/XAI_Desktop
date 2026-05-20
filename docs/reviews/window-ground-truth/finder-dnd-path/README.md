# G0.4 Finder DnD Path-First Evidence

## Status

PARTIAL_HUMAN_EVIDENCE / BLOCKED — GridWindow has G0 Finder drop telemetry and user reported items can be dragged into Grid; exact per-kind payload observation is still required.

## Static Findings (from source, no runtime needed)

| Field | Value | Source |
|---|---|---|
| Main window DnD | `"dragDropEnabled": false` — **Webview DnD disabled** | `apps/desktop/src-tauri/tauri.conf.json` |
| Grid window DnD | NOT explicitly disabled in `WebviewWindowBuilder` — **default: enabled** | `commands/window.rs:create_grid_window` |
| Custom DnD handler (Rust) | **None found** — no `FileDrop`/`DragDrop` handler in `src/` | `src-tauri/src/**` grep |
| Custom DnD handler (JS) | **Present** — GridWindow listens for `tauri://drag-drop`, logs paths, kinds, position, and gridId, then emits `grid-window-file-drop` | `apps/desktop/src/windows/GridWindow.tsx` |
| Tauri DnD payload type | `DragDrop { paths: Vec<PathBuf>, position: PhysicalPosition }` | Tauri 2.x API |
| Expected path format | Absolute POSIX paths, e.g. `/Users/lijinlong/Desktop/foo.txt` | Tauri + wry on macOS |

**Key insight**: Grid windows CAN receive DnD events (dragDropEnabled not disabled), and now have a G0-only JS telemetry listener. Main window drops remain explicitly blocked. Runtime still needs to prove what Finder sends for files, folders, app bundles, and aliases.

## Matrix

| Item kind | Source example | Expected payload (from code) | Observed payload | gridId present | Result |
|---|---|---|---|---|---|
| Unspecified Finder item | Finder item(s) | `paths: [...]` through `tauri://drag-drop` telemetry | 2026-05-19 user report: "东西能拖动进去" / items can be dragged into Grid | Not confirmed from log | PASS_PARTIAL |
| File | `/Users/.../foo.txt` | `paths: ["/Users/.../foo.txt"]` | **needs runtime** | Expected yes via telemetry | NEEDS_VERIFY |
| Folder | `/Users/.../mydir/` | `paths: ["/Users/.../mydir"]` | **needs runtime** | Expected yes via telemetry | NEEDS_VERIFY |
| App bundle | `/Applications/Safari.app` | `paths: ["/Applications/Safari.app"]` — bundle root, NOT binary inside | **needs runtime** | Expected yes via telemetry | NEEDS_VERIFY |
| Alias | `/Users/.../alias` | resolved target path OR alias path — **behaviour undefined without test** | **needs runtime** | Expected yes via telemetry | NEEDS_VERIFY |
| Drop onto main window | any | **blocked** — `dragDropEnabled: false` | N/A | N/A | CONFIRMED_BLOCKED |

## Human Runtime Notes

- 2026-05-19 21:07 PDT: User reported G0.4 manual test result: items can be dragged into Grid.
- Remaining evidence needed: exact `[G0 Finder DnD] path-first drop` console payload for a file, folder, `.app`, and alias, including `gridId`, `paths`, `kinds`, and `position`.

## Runtime Verification Steps (human required)

```bash
pnpm --filter desktop tauri dev
```

1. Open a Grid window
2. Drag each item type from Finder onto the Grid window
3. Confirm the Grid window's `Finder DnD` telemetry panel increments `drops`
4. Record the exact console line beginning with `[G0 Finder DnD] path-first drop`
5. Confirm each telemetry object includes:
   - `gridId`
   - `source: "tauri://drag-drop"`
   - `paths`
   - `kinds`
   - `position`
6. For aliases: note whether the path is the alias file itself or the resolved target

## Decision Fields

- Webview drop real path works: **TBD** — needs runtime payload observation
- Native drop receiver needed: **TBD** — JS telemetry now exists; decide after runtime path evidence
- Security-scoped bookmark needed for MAS: **TBD** — required if MAS sandbox restricts arbitrary path access
- Alias policy: **TBD** — record raw observed path first, decide resolution strategy in G1
