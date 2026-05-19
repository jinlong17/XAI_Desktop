# Feature Brief — spaces-multimonitor-matrix

| Field | Value |
|---|---|
| Feature | spaces-multimonitor-matrix |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.5 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Validate Grid behavior across single display, dual display, Mission Control, multiple Spaces, and fullscreen-app transitions.

## Scope

- Prepare a manual Spaces/fullscreen/multi-monitor evidence matrix.
- Record that this task was reached via user override while G0.3/G0.4 remain blocked.
- Do not change window collection behavior, window level, or rect persistence without real evidence.

## Non-goals

- No production window behavior changes in unattended mode.
- No G0 Go/Conditional Go decision.
- No changes to `window_ext.rs` or Tauri config.

## Acceptance

Blocked in unattended mode. G0.5 acceptance requires real Mission Control, Spaces, fullscreen, and multi-display observations.

## Tests

- Safe prep check: matrix template exists.
- Deferred: `pnpm --filter desktop tauri dev` on real macOS with current display setup and Spaces/fullscreen interactions.

## Contract Impact

None for safe prep. Future window behavior changes must update ADR-0005 or the relevant execution pack/contract if command or capability semantics change.

