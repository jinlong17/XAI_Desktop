# G0.3 Click-Through Matrix

## Status

READY_TO_SHIP — default private-API runtime hit-testing passes, and the private-API-disabled comparison now has a compile-fail result for the current transparent-window implementation.

## Static Findings (from source, no runtime needed)

| Field | Value | Source |
|---|---|---|
| `macOSPrivateApi` | `true` (hardcoded) | `apps/desktop/src-tauri/tauri.conf.json` |
| Cargo private API feature | enabled by default | `apps/desktop/src-tauri/Cargo.toml` |
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
| 26.4 | built-in + DELL | false | main | transparent area | Transparency may break; click-through logic unchanged | With private API disabled, `pnpm --filter desktop tauri dev` fails at compile time: `WebviewWindowBuilder` has no `.transparent(true)` method in `src/lib.rs:94` | FAIL_BUILD_PRIVATE_API_REQUIRED |
| 26.4 | built-in + DELL | false | grid | Grid item area | React pointer event fires (unchanged by macOSPrivateApi) | With private API disabled, `pnpm --filter desktop tauri dev` fails at compile time: `WebviewWindowBuilder` has no `.transparent(true)` method in `src/commands/window.rs:36` | FAIL_BUILD_PRIVATE_API_REQUIRED |

## Human Runtime Notes

- 2026-05-19 21:07 PDT: User reported G0.3 click-through manual test result: clicking transparent areas all produced the expected reaction and appeared normal.
- 2026-05-19 21:21 PDT: Grid item click → icon flashes = PASS_POINTER_ONLY (pointer delivered to React/dnd-kit; no click action bound in current code, not a bug). Resize handle drag → PASS_MANUAL.
- 2026-05-19 22:25 PDT: Codex temporarily disabled the private API path (`apps/desktop/src-tauri/tauri.conf.json` `"macOSPrivateApi": false` plus the Rust `macos-private-api` Cargo feature) and ran `pnpm --filter desktop tauri dev`. The build failed before runtime because `.transparent(true)` is unavailable on `WebviewWindowBuilder` without the private API feature. The config and Cargo feature were restored to the default private-API-enabled state.
- G0.3 evidence conclusion: click-through is viable for the current DMG/private-API path. MAS/non-private path requires a non-transparent or conditionally compiled fallback before it can be runtime-tested.

## Runtime Verification Steps (human required)

```bash
# With macOSPrivateApi=true (current default):
pnpm --filter desktop tauri dev
# 1. Click on blank transparent area between grid items → should reach Finder
# 2. Click on a grid item → should fire React pointer event
# 3. Click on resize handle of grid window → should fire React pointer event

# To test macOSPrivateApi=false:
# Edit apps/desktop/src-tauri/tauri.conf.json: "macOSPrivateApi": false
# Remove the Rust `macos-private-api` feature from apps/desktop/src-tauri/Cargo.toml
pnpm --filter desktop tauri dev
# Observe whether transparent rendering breaks and whether click-through changes
# Restore both files before returning to the default dev path.
```

## Decision Fields

- Native hit-test forwarding needed: **YES** — `setIgnoresMouseEvents_` is already in place
- DMG-only private API path needed: **YES** — current transparent-window implementation requires private API compile path
- MAS fallback needed: **YES** — current transparent Grid/control windows cannot compile with the private API path disabled
- Product fallback if unstable: **non-transparent File Zones style window + hide/show shortcut** remains the MAS fallback candidate
