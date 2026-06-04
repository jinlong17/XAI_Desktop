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
