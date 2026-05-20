# G0.3 Click-Through Matrix

## Status

PARTIAL_HUMAN_EVIDENCE / BLOCKED — transparent-area click-through, Grid item pointer delivery, and resize-handle drag all PASS; only `macOSPrivateApi=false` comparison remains.

## Static Findings (from source, no runtime needed)

| Field | Value | Source |
|---|---|---|
| `macOSPrivateApi` | `true` (hardcoded) | `apps/desktop/src-tauri/tauri.conf.json` |
| Main window click-through | `setIgnoresMouseEvents_(YES)` — **always on**, not runtime-togglable | `platform/macos/window_ext.rs:configure_main_window` |
| Grid window interactive | `setIgnoresMouseEvents_(NO)` — **always interactive** | `platform/macos/window_ext.rs:configure_grid_window` |
| Control window interactive | `setIgnoresMouseEvents_(NO)` | `platform/macos/window_ext.rs:configure_control_window` |
| Grid window level | `desktop_icon_level + 3` (above icon layer) | `window_ext.rs` |
| Main window level | `desktop_icon_level + 1` | `window_ext.rs` |
| Implementation path | `NSWindow.setIgnoresMouseEvents_` (standard AppKit, not private API dependent) | `window_ext.rs` |

**Key insight**: Click-through is implemented via standard AppKit `setIgnoresMouseEvents_`, NOT via `macOSPrivateApi`. Changing `macOSPrivateApi` to `false` affects transparent rendering, NOT click-through routing. The two are independent.

## Matrix

| macOS | Display | macOSPrivateApi | Window | Region | Expected (from code) | Observed | Result |
|---|---|---|---|---|---|---|---|
| 26.4 | built-in + DELL | true | main | transparent blank area | Click reaches Finder/Desktop (`setIgnoresMouseEvents_=YES`) | 2026-05-19 user report: transparent-area clicks all behaved normally / underlying target reacted | PASS_PARTIAL |
| 26.4 | built-in + DELL | true | main | any transparent region | All clicks pass through | 2026-05-19 user report: transparent areas behaved normally | PASS_PARTIAL |
| 26.4 | built-in + DELL | true | grid | Grid item area | React pointer event fires (`setIgnoresMouseEvents_=NO`) | Icon flashes on click — React/dnd-kit received pointer; no click action bound (expected, not a miss) | PASS_POINTER_ONLY |
| 26.4 | built-in + DELL | true | grid | resize handle | Pointer event fires | Handle draggable — pointer delivered correctly | PASS_MANUAL |
| 26.4 | built-in + DELL | false | main | transparent area | Transparency may break; click-through logic unchanged | **needs runtime** | NEEDS_VERIFY |
| 26.4 | built-in + DELL | false | grid | Grid item area | React pointer event fires (unchanged by macOSPrivateApi) | **needs runtime** | NEEDS_VERIFY |

## Human Runtime Notes

- 2026-05-19 21:07 PDT: User reported G0.3 click-through manual test result: clicking transparent areas all produced the expected reaction and appeared normal.
- 2026-05-19 21:21 PDT: Grid item click → icon flashes = PASS_POINTER_ONLY (pointer delivered to React/dnd-kit; no click action bound in current code, not a bug). Resize handle drag → PASS_MANUAL.
- Remaining evidence needed: `macOSPrivateApi=false` comparison only. All `macOSPrivateApi=true` rows complete.

## Runtime Verification Steps (human required)

```bash
# With macOSPrivateApi=true (current default):
pnpm --filter desktop tauri dev
# 1. Click on blank transparent area between grid items → should reach Finder
# 2. Click on a grid item → should fire React pointer event
# 3. Click on resize handle of grid window → should fire React pointer event

# To test macOSPrivateApi=false:
# Edit apps/desktop/src-tauri/tauri.conf.json: "macOSPrivateApi": false
pnpm --filter desktop tauri dev
# Observe whether transparent rendering breaks and whether click-through changes
```

## Decision Fields

- Native hit-test forwarding needed: **YES** — `setIgnoresMouseEvents_` is already in place
- DMG-only private API path needed: **TBD** — `macOSPrivateApi=true` needed for transparency, DMG path currently assumed
- MAS fallback needed: **TBD** — depends on whether `macOSPrivateApi=false` is acceptable for MAS
- Product fallback if unstable: **TBD** — pending runtime observation
