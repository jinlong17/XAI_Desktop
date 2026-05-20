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

## Production Build Revision — 2026-05-19 23:18 PDT

G0 is now Conditional Go for the DMG/private path and G1.1 `window-command-contract` is READY_TO_SHIP. This feature may proceed from safe prep into the production shell/content split.

Revised scope:

- Move Grid window content/state/event/drop behavior out of `apps/desktop/src/windows/GridWindow.tsx`.
- Expose `OrganizerGridContent` from `packages/plugin-organizer/src/index.ts`.
- Keep Host native shell responsibilities in `GridWindow.tsx`: providers, settings handoff, and AppKit drag handoff.
- Add a public Organizer API contract under `docs/contracts/`.

Revised acceptance:

- `GridWindow.tsx` imports Organizer content only from `@repo/plugin-organizer`.
- `GridWindow.tsx` no longer imports `SmartContainer`, `GridBox`, `DesktopItem`, `useFileDrop`, or Organizer internal paths.
- `packages/plugin-organizer/src/index.ts` exports `OrganizerGridContent`.
- Focused TypeScript/build checks pass.

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

Production revision adds `docs/contracts/plugin-organizer-public-api-v0.md` and updates `docs/contracts/README.md`.
