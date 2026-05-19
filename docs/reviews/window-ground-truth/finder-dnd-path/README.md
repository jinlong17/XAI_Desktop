# G0.4 Finder DnD Path-First Evidence

## Status

PARTIAL — static code analysis complete; runtime payload observation still required.

## Static Findings (from source, no runtime needed)

| Field | Value | Source |
|---|---|---|
| Main window DnD | `"dragDropEnabled": false` — **Webview DnD disabled** | `apps/desktop/src-tauri/tauri.conf.json` |
| Grid window DnD | NOT explicitly disabled in `WebviewWindowBuilder` — **default: enabled** | `commands/window.rs:create_grid_window` |
| Custom DnD handler (Rust) | **None found** — no `FileDrop`/`DragDrop` handler in `src/` | `src-tauri/src/**` grep |
| Tauri DnD payload type | `DragDrop { paths: Vec<PathBuf>, position: PhysicalPosition }` | Tauri 2.x API |
| Expected path format | Absolute POSIX paths, e.g. `/Users/lijinlong/Desktop/foo.txt` | Tauri + wry on macOS |

**Key insight**: Grid windows CAN receive DnD events (dragDropEnabled not disabled), but there is currently **no Rust or JS handler** to process them. Drop events will fire in the Webview but silently fail unless a listener is added. Main window drops are explicitly blocked.

## Matrix

| Item kind | Source example | Expected payload (from code) | Observed payload | gridId present | Result |
|---|---|---|---|---|---|
| File | `/Users/.../foo.txt` | `paths: ["/Users/.../foo.txt"]` | **needs runtime** | No (no handler) | NEEDS_VERIFY |
| Folder | `/Users/.../mydir/` | `paths: ["/Users/.../mydir"]` | **needs runtime** | No (no handler) | NEEDS_VERIFY |
| App bundle | `/Applications/Safari.app` | `paths: ["/Applications/Safari.app"]` — bundle root, NOT binary inside | **needs runtime** | No (no handler) | NEEDS_VERIFY |
| Alias | `/Users/.../alias` | resolved target path OR alias path — **behaviour undefined without test** | **needs runtime** | No (no handler) | NEEDS_VERIFY |
| Drop onto main window | any | **blocked** — `dragDropEnabled: false` | N/A | N/A | CONFIRMED_BLOCKED |

## Runtime Verification Steps (human required)

```bash
pnpm --filter desktop tauri dev
```

1. Open a Grid window
2. Add a temporary Tauri event listener in DevTools console:
   ```js
   const { listen } = window.__TAURI__.event;
   await listen('tauri://drag-drop', e => console.log('DnD:', JSON.stringify(e.payload)));
   ```
3. Drag each item type from Finder onto the Grid window
4. Record the exact `payload.paths` value for each type
5. For aliases: note whether the path is the alias file itself or the resolved target

## Decision Fields

- Webview drop real path works: **TBD** — needs runtime payload observation
- Native drop receiver needed: **Likely YES** — no handler exists yet; needed for G1 DnD feature
- Security-scoped bookmark needed for MAS: **TBD** — required if MAS sandbox restricts arbitrary path access
- Alias policy: **TBD** — record raw observed path first, decide resolution strategy in G1
