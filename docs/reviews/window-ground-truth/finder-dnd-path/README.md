# G0.4 Finder DnD Path-First Evidence

## Status

PARTIAL_HUMAN_EVIDENCE / BLOCKED — GridWindow receives Tauri path-first Finder drops; file/folder and `.app` evidence exists, but alias and post-dedupe regression checks are still required.

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
| File | `/Users/.../foo.txt` | `paths: ["/Users/.../foo.txt"]` | Screenshot shows `source: tauri://drag-drop`, kind `file`, path `/Users/lijinlong/Desktop/Jinlongsign I-140Page8.pdf`; item duplicated before fix `58c926d` | Expected yes via telemetry | PASS_WITH_DUPLICATE_BUG_FIXED |
| Folder | `/Users/.../mydir/` | `paths: ["/Users/.../mydir"]` | Human reported folder can be dragged in; screenshot shows duplicated `AI_Desktop` folder item, exact telemetry path not captured in screenshot | Expected yes via telemetry | PASS_PARTIAL_WITH_DUPLICATE_BUG_FIXED |
| App bundle | `/Applications/Safari.app` | `paths: ["/Applications/Safari.app"]` — bundle root, NOT binary inside | Screenshot shows `source: tauri://drag-drop`, kind `app`, path `/Applications/TencentMeeting.app`; item duplicated before Organizer dedupe fix `18b48da` | Expected yes via telemetry | PASS_WITH_DUPLICATE_BUG_FIXED |
| Alias | `/Users/.../alias` | resolved target path OR alias path — **behaviour undefined without test** | **needs runtime** | Expected yes via telemetry | NEEDS_VERIFY |
| Drop onto main window | any | **blocked** — `dragDropEnabled: false` | N/A | N/A | CONFIRMED_BLOCKED |

## Human Runtime Notes

- 2026-05-19 21:07 PDT: User reported G0.4 manual test result: items can be dragged into Grid.
- 2026-05-19 21:21 PDT: Screenshot evidence showed the telemetry panel with `drops 2`, `source: tauri://drag-drop`, kind `file`, and path `/Users/lijinlong/Desktop/Jinlongsign I-140Page8.pdf`.
- 2026-05-19 21:21 PDT: The same screenshot/user report showed a folder (`AI_Desktop`) and a PDF file both appeared twice before the duplicate fix.
- Duplicate root cause is consistent with GridWindow also running the HTML5 `useFileDrop` fallback while the Tauri path-first listener is active.
- Fix `58c926d` removes the GridWindow HTML5 fallback, uses Tauri `DRAG_ENTER/OVER/LEAVE` for hover state, and ignores identical Tauri drop payloads received within 1 second.
- 2026-05-19 21:56 PDT: User reported file drops are normal after `58c926d`, but `.app` drops still duplicate. Screenshot shows `/Applications/TencentMeeting.app` with kind `app`.
- Fix `18b48da` adds Organizer-side idempotency by `gridId + normalized filepath`, including a short recent-drop guard so repeated `.app` drop events cannot create duplicate items in the same Grid.
- Remaining evidence needed: rerun `.app` drop after `18b48da`, then test alias payloads.

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

- Webview drop real path works: **PARTIAL YES** — file and `.app` paths observed from `tauri://drag-drop`; alias behavior still unknown
- Native drop receiver needed: **TBD** — JS telemetry now receives real file and `.app` paths; decide after alias and MAS evidence
- Security-scoped bookmark needed for MAS: **TBD** — required if MAS sandbox restricts arbitrary path access
- Alias policy: **TBD** — record raw observed path first, decide resolution strategy in G1
