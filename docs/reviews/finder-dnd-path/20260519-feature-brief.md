# Feature Brief — finder-dnd-path

| Field | Value |
|---|---|
| Feature | finder-dnd-path |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.4 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Validate that Finder drops into a Grid can provide real paths for files, folders, App bundles, and aliases, with the drop target `gridId` recorded.

## Scope

- Prepare the evidence template under `docs/reviews/window-ground-truth/finder-dnd-path/`.
- Document exact manual Tauri/Finder validation steps.
- Do not change drop handling or sandbox/security-scoped bookmark behavior without real runtime evidence.

## Non-goals

- No production DnD rewrite in unattended mode.
- No security-scoped bookmark decision.
- No MAS sandbox conclusion.

## Acceptance

Blocked in unattended mode. G0.4 acceptance requires real Finder drag/drop observations that cannot be produced by this serial Codex run.

## Tests

- Safe prep check: evidence template exists.
- Deferred: `pnpm --filter desktop tauri dev` plus Finder file/folder/App/alias drops.

## Contract Impact

None for safe prep. Future path payload or native receiver changes must update the relevant contract/ADR.

