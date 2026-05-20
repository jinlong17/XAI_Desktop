# G0.5 Spaces / Fullscreen / Multi-Monitor Matrix

## Status

BLOCKED / STATIC_EVIDENCE_UPDATED. Current display facts and source-level Spaces behavior are recorded, but this matrix still requires real macOS Mission Control, fullscreen, and multi-display runtime evidence.

## Manual Setup

```bash
pnpm --filter desktop tauri dev
```

Use the current display setup:

- LG Ultra HD, 3840 x 2160, UI looks like 1920 x 1080 @ 60 Hz, Main Display: Yes
- DELL P2720DC, 2560 x 1440, UI looks like 2560 x 1440 @ 60 Hz

Source command:

```bash
system_profiler SPDisplaysDataType
```

## Static Window Behavior Findings

| Area | Source | Static finding | Runtime confidence |
|---|---|---|---|
| Shared Spaces behavior | `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` | All XAI Desktop windows apply `CanJoinAllSpaces`, `Stationary`, and `IgnoresCycle` collection behavior. | Needs Mission Control / Space switch validation |
| Main overlay level | `window_ext.rs` | Main window is desktop icon level + 1 and click-through. | Needs runtime layering validation |
| Grid level | `window_ext.rs` | Grid window is desktop icon level + 3 and interactive. | Needs runtime layering validation |
| Control level | `window_ext.rs` | Control window is desktop icon level + 4 and interactive, above Grid. | Needs runtime layering validation |
| Rect persistence path | `apps/desktop/src-tauri/src/commands/window.rs` | `create_grid_window` uses logical `position(rect.x, rect.y)` and `inner_size(rect.width, rect.height)`. | Needs cross-display placement validation |

## Matrix

| Scenario | Expected | Observed | Recovery path | Evidence path | Result |
|---|---|---|---|---|---|
| Single display Grid open/move/close | Grid remains visible and closable | pending | pending | pending screenshot/log | BLOCKED |
| Dual display Grid open on built-in display | Rect and display placement are stable | pending | pending | pending screenshot/log | BLOCKED |
| Dual display Grid open on external display | Rect and display placement are stable | pending | pending | pending screenshot/log | BLOCKED |
| Mission Control enter/exit | Grid does not randomly disappear or can be recovered | pending | pending | pending screenshot/log | BLOCKED |
| Switch Space with Grid open | Behavior is recorded; recoverable if not persistent | pending | pending | pending screenshot/log | BLOCKED |
| Fullscreen app adjacent Space | Behavior is recorded; recoverable if hidden | pending | pending | pending screenshot/log | BLOCKED |

## Decision Fields

- Join-all-Spaces acceptable: code currently uses it; runtime acceptability pending
- Per-Space summonable fallback needed: pending
- Multi-display rect offset issue observed: pending
- Fullscreen fallback needed: pending
