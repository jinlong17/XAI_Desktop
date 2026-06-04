# Design - xai-web-board-permissions

## Selected Model

Board visibility is an additive local field:

```text
Board.visibility?: "private" | "shared"
```

Absent visibility resolves to `private` for backward compatibility.

## User Behavior

1. User opens `/app/board`.
2. Header shows the active board visibility state.
3. User toggles Private / Shared.
4. The state persists in `xai_boards_v2`.
5. Share modal shows the same visibility marker while still labeling the link as
   mock/planning-only.

## Non-Goals

- no users/roles table
- no invite flow
- no backend share grants
- no route-level public access
- no workspace team model
