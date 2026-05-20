# G0.4 Finder DnD Path-First Evidence

## Status

READY_TO_SHIP — GridWindow receives Tauri path-first Finder drops for file, folder, `.app`, and alias inputs. Alias behavior is recorded as preserving the alias file path returned by Finder/Tauri.

## Static Findings (from source, no runtime needed)

| Field | Value | Source |
|---|---|---|
| Main window DnD | `"dragDropEnabled": false` — **Webview DnD disabled** | `apps/desktop/src-tauri/tauri.conf.json` |
| Grid window DnD | NOT explicitly disabled in `WebviewWindowBuilder` — **default: enabled** | `commands/window.rs:create_grid_window` |
| Custom DnD handler (Rust) | **None found** — no `FileDrop`/`DragDrop` handler in `src/` | `src-tauri/src/**` grep |
| Custom DnD handler (JS) | **Present** — GridWindow listens for `tauri://drag-drop`, logs paths, kinds, position, and gridId, then emits `grid-window-file-drop` | `apps/desktop/src/windows/GridWindow.tsx` |
| Tauri DnD payload type | `DragDrop { paths: Vec<PathBuf>, position: PhysicalPosition }` | Tauri 2.x API |
| Expected path format | Absolute POSIX paths, e.g. `/Users/lijinlong/Desktop/foo.txt` | Tauri + wry on macOS |

**Key insight**: Grid windows CAN receive DnD events (dragDropEnabled not disabled), and now have a G0-only JS telemetry listener. Main window drops remain explicitly blocked. Finder/Tauri sends an alias drop as `kind=file` with the alias file path, not the resolved target path.

## Matrix

| Item kind | Source example | Expected payload (from code) | Observed payload | gridId present | Result |
|---|---|---|---|---|---|
| Unspecified Finder item | Finder item(s) | `paths: [...]` through `tauri://drag-drop` telemetry | 2026-05-19 user report: "东西能拖动进去" / items can be dragged into Grid | Not confirmed from log | PASS_PARTIAL |
| File | `/Users/.../foo.txt` | `paths: ["/Users/.../foo.txt"]` | Screenshot shows `source: tauri://drag-drop`, kind `file`, path `/Users/lijinlong/Desktop/Jinlongsign I-140Page8.pdf`; item duplicated before fix `58c926d` | Expected yes via telemetry | PASS_WITH_DUPLICATE_BUG_FIXED |
| Folder | `/Users/.../mydir/` | `paths: ["/Users/.../mydir"]` | Human reported folder can be dragged in; screenshots show `AI_Desktop` folder item with absolute path `/Users/lijinlong/Desktop/AI_Desktop`; duplicate issue fixed by `58c926d`/`18b48da` | Expected yes via telemetry | PASS |
| App bundle | `/Applications/Safari.app` | `paths: ["/Applications/Safari.app"]` — bundle root, NOT binary inside | Screenshot shows `source: tauri://drag-drop`, kind `app`, path `/Applications/TencentMeeting.app`; item duplicated before Organizer dedupe fix `18b48da`. Post-fix screenshot shows `/Applications/QQ.app` with one Grid item and telemetry `drops 2`. | Expected yes via telemetry | PASS |
| Alias | `/Users/.../alias` | resolved target path OR alias path — exact policy must be recorded | Screenshot shows `source: tauri://drag-drop`, kind `file`, path `/Applications/QuickTime Player.app alias`; the Grid item is `QuickTime Player.app alias`, not the resolved app path | Expected yes via telemetry | PASS_ALIAS_FILE_PATH |
| Drop onto main window | any | **blocked** — `dragDropEnabled: false` | N/A | N/A | CONFIRMED_BLOCKED |

## Human Runtime Notes

- 2026-05-19 21:07 PDT: User reported G0.4 manual test result: items can be dragged into Grid.
- 2026-05-19 21:21 PDT: Screenshot evidence showed the telemetry panel with `drops 2`, `source: tauri://drag-drop`, kind `file`, and path `/Users/lijinlong/Desktop/Jinlongsign I-140Page8.pdf`.
- 2026-05-19 21:21 PDT: The same screenshot/user report showed a folder (`AI_Desktop`) and a PDF file both appeared twice before the duplicate fix.
- Duplicate root cause is consistent with GridWindow also running the HTML5 `useFileDrop` fallback while the Tauri path-first listener is active.
- Fix `58c926d` removes the GridWindow HTML5 fallback, uses Tauri `DRAG_ENTER/OVER/LEAVE` for hover state, and ignores identical Tauri drop payloads received within 1 second.
- 2026-05-19 21:56 PDT: User reported file drops are normal after `58c926d`, but `.app` drops still duplicate. Screenshot shows `/Applications/TencentMeeting.app` with kind `app`.
- Fix `18b48da` adds Organizer-side idempotency by `gridId + normalized filepath`, including a short recent-drop guard so repeated `.app` drop events cannot create duplicate items in the same Grid.
- 2026-05-19 22:02 PDT: User screenshot verified the post-dedupe `.app` rerun succeeds: `/Applications/QQ.app` appears once in the Grid while the Finder DnD panel reports `source: tauri://drag-drop`, kind `app`, path `/Applications/QQ.app`, and `drops 2`.
- 2026-05-19 22:06 PDT: User reported alias verification succeeded.
- 2026-05-19 22:09 PDT: User screenshot verified alias path form: Finder/Tauri reports `source: tauri://drag-drop`, kind `file`, path `/Applications/QuickTime Player.app alias`, and `drops 2`.
- Alias policy for G1: preserve the alias file path at ingress; do not silently resolve to the target app path.

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

- Webview drop real path works: **YES** — file, folder, `.app`, and alias file paths observed from `tauri://drag-drop`
- Native drop receiver needed: **NOT FOR G0.4** — JS telemetry receives the required path-first payloads; MAS security-scoped access remains a separate G0.6/G1 risk
- Security-scoped bookmark needed for MAS: **TBD** — required if MAS sandbox restricts arbitrary path access
- Alias policy: **PRESERVE_ALIAS_PATH** — Finder/Tauri reports `/Applications/QuickTime Player.app alias` as `kind=file`; G1 should not silently resolve aliases unless a separate explicit resolution feature is designed
