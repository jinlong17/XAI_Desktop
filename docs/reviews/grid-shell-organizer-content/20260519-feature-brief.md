# Feature Brief — grid-shell-organizer-content

| Field | Value |
|---|---|
| Feature | grid-shell-organizer-content |
| Gate | G1 — native foundation |
| Source | docs/planning/execution/G1-native-foundation.md §G1.2 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Prepare the G1.2 Grid shell / Organizer content split so the desktop Host can later render a thin native Grid shell while `plugin-organizer` owns Grid business UI and state wiring.

## Scope

- Map the current boundary between `apps/desktop/src/windows/GridWindow.tsx` and `packages/plugin-organizer`.
- Define the target public surface for a later `OrganizerGridContent` export.
- Record blockers from G0 and G1.1.
- Do not move production code while G0 remains BLOCKED and `window-command-contract` is not implemented.

## Non-goals

- No production Host/Organizer refactor in this slice.
- No new package public API in code.
- No DnD, persistence, or command lifecycle implementation.
- No claim that G1.2 acceptance is satisfied.

## Acceptance

- Feature docs identify current Host business logic in `GridWindow.tsx`.
- Target shell/content split is described.
- Status remains BLOCKED_BY_G0/G1.1.
- No production source files change.

## Tests

- `rg -n "SmartContainer|useFileDrop|GridSystem|OrganizerLayer|useMultiWindowGrids" apps/desktop/src packages/plugin-organizer/src -g '*.{ts,tsx}'`
- `test -f docs/reviews/grid-shell-organizer-content/20260519-feature-brief.md`
- `test -f packages/grid-shell-organizer-content/docs/dev_log.md`

## Contract Impact

Planning only. Later implementation may change plugin public exports, EventMap names, or command call sites; this slice does not change contracts.
