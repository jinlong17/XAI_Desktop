# Feature Brief — host-business-residuals

| Field | Value |
|---|---|
| Feature | host-business-residuals |
| Gate | G1 — native foundation |
| Source | docs/planning/execution/G1-native-foundation.md §G1.6 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Audit remaining business logic in the desktop Host and produce a concrete residual list for later G1 cleanup, without moving production code while G0 is unresolved.

## Scope

- Inspect `apps/desktop/src/`.
- Create `docs/planning/execution/host-residuals.md`.
- Create Workflow V2 docs under `packages/host-business-residuals/docs/`.
- Do not change production Host behavior.

## Non-goals

- No code movement.
- No plugin creation.
- No Host cleanup implementation.
- No G1 pass claim.

## Acceptance

- Residual list exists and names current files, target owners, and recommended actions.
- Host responsibilities that are allowed to remain are explicitly listed.
- No production code changed.

## Tests

- `rg -n "AiCube|SettingsPanel|useSyncMenuBarStatus|OrganizerLayer|create-grid-request|useGridSystem" apps/desktop/src -g '*.{ts,tsx}'`
- `test -f docs/planning/execution/host-residuals.md`

## Contract Impact

None. This feature is an audit and does not modify events, commands, repository interfaces, capabilities, or ADRs.

