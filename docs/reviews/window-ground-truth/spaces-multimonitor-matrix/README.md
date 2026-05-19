# G0.5 Spaces / Fullscreen / Multi-Monitor Matrix

## Status

BLOCKED in unattended Codex run. This matrix requires real macOS window behavior evidence.

## Manual Setup

```bash
pnpm --filter desktop tauri dev
```

Use the current display setup:

- Built-in Color LCD, 3024 x 1964 Retina
- DELL P2720DC, 1440 x 2560 @ 60 Hz, rotation 90

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

- Join-all-Spaces acceptable: pending
- Per-Space summonable fallback needed: pending
- Multi-display rect offset issue observed: pending
- Fullscreen fallback needed: pending

