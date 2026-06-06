# Discovery Review - xai-web-board-permissions

| Field | Value |
|---|---|
| Feature | `xai-web-board-permissions` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #17 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- `ShareModal` is explicitly mock-only and emits a view-only share envelope.
- There is no Board-level visibility field.
- There is no workspace/team membership list, ACL table, invite flow,
  `/share/:token` route, or backend share-token authority.
- Board writes already preserve the existing `xai_boards_v2` storage format, so
  additive board metadata can be persisted without migration.

## Problem

The Project PRD asks for private/shared board states and future workspace
permissions. Without a visible board-level visibility field, the UI cannot
distinguish a private board from a board intentionally prepared for sharing,
and future backend work has no stable local contract to replace.

## Selected Direction

Add a minimal Board visibility contract:

- `Board.visibility?: "private" | "shared"` in board-core
- default interpretation is `private` when the field is absent
- pure helpers for resolving and setting visibility
- active Board header toggle between Private and Shared
- Share modal and share event include the board visibility marker

This makes the current state explicit without pretending to implement team ACLs.

## Acceptance

- Existing boards without `visibility` remain valid and resolve as private.
- Board-core helper can set visibility immutably.
- Runtime guard accepts valid visibility and rejects malformed values.
- Active `/app/board` can toggle the current board between Private and Shared.
- Share modal visibly displays the current visibility state and emits it in the
  mock share event.
- Tests cover helper, guard, barrel export, UI persistence, and modal payload.

## Out of Scope

- real ACL or role model
- invite emails
- team membership management
- share token backend
- `/share/:token` route
- permission-aware automation or notifications
