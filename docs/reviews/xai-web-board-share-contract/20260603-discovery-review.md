# Discovery Review - xai-web-board-share-contract

| Field | Value |
|---|---|
| Feature | `xai-web-board-share-contract` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #11 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- `ShareModal` generates a deterministic `https://xai-web.example/share/<8hex>`
  URL from the board id.
- The modal exposes Copy/Close and emits `web:board:share-requested` before
  close.
- The helper and comments identify this as mock-only, but the rendered UI does
  not clearly warn users that the link does not grant access.
- There is no share token storage, no `/share/:token` route, no permission
  model, and no backend sync/share envelope.

## Problem

The Project PRD requires either a real share envelope or an explicit mock/stub
label. Today the user can copy a convincing URL without seeing that it is not a
real access grant.

## Options Considered

### Option A - Implement real share backend

Rejected for this row. It requires account permissions, share-token storage,
route handling, and backend/sync decisions that are explicitly future work.

### Option B - Keep the mock URL but make the contract explicit

Add an internal mock share-envelope type, expose visible stub copy in the modal,
and extend the emitted event with explicit mock contract fields.

Pros:

- honest UX
- no backend pretense
- narrow implementation
- keeps existing copy URL behavior stable
- gives future backend work a contract to replace

Cons:

- still not a real share/invite flow
- copied URL remains non-functional outside demo mode

## Selected Direction

Use Option B.

The row makes the current share behavior formally explicit. It does not attempt
to solve permissions or backend token issuance.

## Acceptance

- Share modal visibly labels the link as mock/stub in EN and ZH.
- A generated share envelope records `schemaVersion`, `mode: "mock"`,
  `permission: "view"`, `expiresAt: null`, and `backend: "unimplemented"`.
- Existing deterministic URL generation remains stable.
- `web:board:share-requested` payload includes explicit share contract fields.
- Tests cover visible stub copy and event payload.

## Out of Scope

- real share-token API
- `/share/:token` route
- invite emails
- workspace/team permissions
- expiry editing
- persisted share records
