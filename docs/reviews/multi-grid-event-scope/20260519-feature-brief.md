# Feature Brief — multi-grid-event-scope

| Field | Value |
|---|---|
| Feature | multi-grid-event-scope |
| Gate | G1 — native foundation |
| Source | docs/planning/execution/G1-native-foundation.md §G1.4 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Prepare the G1.4 multi-Grid event-scope migration so all Grid events use `organizer:grid:*` names and reject or ignore payloads without `gridId`.

## Scope

- Audit current Grid event names and payload scope.
- Compare implementation with `docs/contracts/events-v0.md` and `packages/core/src/types/events.ts`.
- Define a later production migration plan.
- Do not change event names or listener behavior in production while G0/G1 remain blocked.

## Non-goals

- No production event migration in this slice.
- No `EventMap` code changes.
- No `docs/contracts/events-v0.md` edits.
- No runtime behavior changes.

## Acceptance

- Current event aliases and target event names are documented.
- Missing `gridId` risks are captured.
- Status remains BLOCKED_BY_G0/G1.1.
- No production source files change.

## Tests

- `rg -n "grid-window-|organizer:grid|grid-update|grid-delete|grid-window-ready|grid-window-file-drop|organizer:create-grid-request|create-grid-request" apps/desktop/src packages/plugin-organizer/src packages/core/src docs/contracts -g '*.{ts,tsx,md}'`
- `test -f docs/reviews/multi-grid-event-scope/20260519-feature-brief.md`
- `test -f packages/multi-grid-event-scope/docs/dev_log.md`

## Contract Impact

Planning only. Later implementation must update `docs/contracts/events-v0.md` and `packages/core/src/types/events.ts` together if event names or payloads change.
