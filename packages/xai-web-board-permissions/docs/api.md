# API Contract - xai-web-board-permissions

## Board-Core Types

```ts
type BoardVisibility = "private" | "shared";

interface Board {
  visibility?: BoardVisibility;
}
```

## Board-Core Helpers

```ts
function getBoardVisibility(board: Board): BoardVisibility;

function setBoardVisibility(
  board: Board,
  visibility: BoardVisibility,
): Board;
```

Rules:

- Missing visibility resolves to `private`.
- `setBoardVisibility` returns the same board reference when no change is
  needed.
- Helpers are pure and never touch storage, events, or network state.

## Share Event Extension

`web:board:share-requested` gains:

```ts
visibility: "private" | "shared";
```

This does not make the share URL functional. It only describes the current local
board visibility state.

## Non-Contracts

- No ACL.
- No share-token API.
- No invite user schema.
- No backend permission table.

## Implemented Surface

- `Board.visibility?: "private" | "shared"` is additive and backward
  compatible; legacy boards without the field resolve to `private`.
- `BOARD_VISIBILITY_VALUES`, `isBoardVisibility`,
  `getBoardVisibility`, and `setBoardVisibility` are exported from
  `@repo/plugin-web-board-core`.
- `BoardWorkspacesModule` renders a header visibility toggle:
  `data-testid="board-visibility-toggle"`.
- `ShareModal` now requires a `visibility` prop and shows
  `data-testid="sm-visibility-note"`.
- `createMockBoardShareEnvelope(boardId, visibility)` includes the supplied
  visibility in the explicit mock share envelope.
- `web:board:share-requested` includes `visibility` alongside the existing
  mock `permission: "view"` contract.
