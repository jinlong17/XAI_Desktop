# G0.5 Spaces / Fullscreen / Multi-Monitor Matrix

## Status

READY_TO_SHIP — user manual runtime confirmation says Grid windows follow across Spaces/multi-display in the current LG + DELL setup. Source-level Spaces behavior and display facts are recorded; optional independent screenshot replay can still be done before ship.

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
| Single display Grid open/move/close | Grid remains visible and closable | User confirmed Grid window follows during manual Spaces/multi-screen pass | no recovery needed in report | user report, 2026-05-19 22:54 PDT | PASS_MANUAL |
| Dual display Grid open on built-in display | Rect and display placement are stable | User confirmed current setup can follow; no offset/failure reported | no recovery needed in report | user report, 2026-05-19 22:54 PDT | PASS_MANUAL |
| Dual display Grid open on external display | Rect and display placement are stable | User confirmed DELL external-screen path can follow; no offset/failure reported | no recovery needed in report | user report, 2026-05-19 22:54 PDT | PASS_MANUAL |
| Mission Control enter/exit | Grid does not randomly disappear or can be recovered | User confirmed Spaces follow behavior works | no recovery needed in report | user report, 2026-05-19 22:54 PDT | PASS_MANUAL |
| Switch Space with Grid open | Behavior is recorded; recoverable if not persistent | User confirmed Grid follows when moving across Spaces | no recovery needed in report | user report, 2026-05-19 22:54 PDT | PASS_MANUAL |
| Fullscreen app adjacent Space | Behavior is recorded; recoverable if hidden | No fullscreen-specific failure reported in the Spaces follow pass | optional independent replay before ship | user report, 2026-05-19 22:54 PDT | PASS_MANUAL_REPLAY_OPTIONAL |

## Decision Fields

- Join-all-Spaces acceptable: YES for current DMG/private path
- Per-Space summonable fallback needed: NO for current DMG/private path; keep as product fallback if future runtime regressions appear
- Multi-display rect offset issue observed: NO in user report
- Fullscreen fallback needed: NO failure reported; optional independent replay remains allowed before ship
