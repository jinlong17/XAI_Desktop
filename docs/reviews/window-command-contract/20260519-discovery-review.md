# Discovery Review — window-command-contract

## Summary

G1.1 is the first native-foundation implementation task, but its production work depends on G0 proving or selecting the viable window model. The current repo already has `create_grid_window`, `update_grid_window`, and `close_grid_window`, while `docs/contracts/tauri-commands-v0.md` already lists target `list_grid_windows`, `focus_grid_window`, `GridWindowSnapshot`, and `CommandError`.

## Recommendation

Do planning/contract prep only. Do not modify Rust command signatures, capability files, or TS adapters until G0 reaches Go/Conditional Go.

## Target Implementation Notes

- Rust remains the sole `grid_{gridId}` label authority.
- TS passes `gridId`, never a hand-built label.
- Add `GridWindowSnapshot` output for list command.
- Add `focus_grid_window` after focus/Spaces behavior is known.
- Map command errors to code/message/recoverable shape.

## Blocker

G0 remains blocked by click-through, Finder path, Spaces, and MAS evidence. G1 production implementation would violate the gate order until those are resolved or explicitly re-scoped by a human product/architecture decision.

