# Window Ground Truth Evidence

This directory is the evidence anchor for G0 window-spike validation.

## Test Environment

| Field | Value |
|---|---|
| Test date | 2026-05-19 |
| Branch | `spike/window-ground-truth` |
| Machine | MacBook Pro, MacBookPro18,3 |
| Chip | Apple M1 Pro, 8-core CPU, 14-core GPU |
| Memory | 16 GB |
| macOS | 26.4, build 25E246 |
| Displays | 2 total |
| Built-in display | Color LCD, 3024 x 1964 Retina, main display |
| External display | DELL P2720DC, 1440 x 2560 @ 60 Hz, rotation 90 |

Serial number, hardware UUID, provisioning UDID, and other device identifiers were intentionally omitted from this evidence file.

## Commands Captured

```bash
git branch --show-current
sw_vers
system_profiler SPHardwareDataType
system_profiler SPDisplaysDataType
```

## G0 Evidence Sections

Later G0 features should add evidence here:

- `grid-window-prototype/` — alpha/beta Grid window event-scope logs.
- `click-through-matrix/` — hit-test matrix for transparent, item, and resize-handle regions.
- `finder-dnd-path/` — file/folder/App/alias drop-path logs.
- `spaces-multimonitor-matrix/` — Spaces, fullscreen, and display-coordinate matrix.
- `mas-sandbox-dry-run/` — private API, sandbox, entitlement, and MAS risk notes.

## Current Feature Result

G0.1 only establishes this evidence anchor. It does not validate click-through, Finder DnD, Spaces, fullscreen, or MAS behavior.

