# G0.3 Click-Through Matrix

## Status

PARTIAL — static code analysis complete; runtime visual verification still required.

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
| 26.4 | built-in + DELL | true | main | transparent blank area | Click reaches Finder/Desktop (`setIgnoresMouseEvents_=YES`) | **needs runtime** | NEEDS_VERIFY |
| 26.4 | built-in + DELL | true | main | any region | All clicks pass through | **needs runtime** | NEEDS_VERIFY |
| 26.4 | built-in + DELL | true | grid | Grid item area | React pointer event fires (`setIgnoresMouseEvents_=NO`) | **needs runtime** | NEEDS_VERIFY |
| 26.4 | built-in + DELL | true | grid | resize handle | Pointer event fires | **needs runtime** | NEEDS_VERIFY |
| 26.4 | built-in + DELL | false | main | transparent area | Transparency may break; click-through logic unchanged | **needs runtime** | NEEDS_VERIFY |
| 26.4 | built-in + DELL | false | grid | Grid item area | React pointer event fires (unchanged by macOSPrivateApi) | **needs runtime** | NEEDS_VERIFY |

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
