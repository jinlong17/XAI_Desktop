# Feature Brief — click-through-matrix

| Field | Value |
|---|---|
| Feature | click-through-matrix |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.3 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Validate transparent Grid hit-testing with `macOSPrivateApi=true` and `macOSPrivateApi=false`, covering transparent area, Grid item area, and resize-handle area.

## Scope

- Prepare a matrix evidence template under `docs/reviews/window-ground-truth/click-through-matrix/`.
- Document exact manual environment and commands needed for real validation.
- Do not change NSWindow constants or Tauri config without a human runtime validation session.

## Non-goals

- No production code changes in unattended mode.
- No fallback product decision without human evidence.
- No MAS/sandbox conclusion.

## Acceptance

Blocked in unattended mode. G0.3 acceptance requires real macOS hit-test evidence that cannot be produced by this serial Codex run.

## Tests

- Safe prep check: matrix template exists.
- Deferred: `pnpm --filter desktop tauri dev` on real macOS with Finder/Desktop click-through checks.

## Contract Impact

None for safe prep. Any future command/capability/Tauri config change must update `docs/contracts/*` or ADR as required.

