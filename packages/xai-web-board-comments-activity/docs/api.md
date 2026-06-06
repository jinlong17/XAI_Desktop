# API Contract - xai-web-board-comments-activity

## Board-Core Activity Types

```ts
type BoardCardActivityKind = "note" | "comment";

interface BoardCardActivityEntry {
  id: string;
  kind: BoardCardActivityKind;
  body: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
}
```

`kind: "note"` is retained for existing cards. New card-detail comments use
`kind: "comment"`.

## Board-Core Helpers

```ts
function createBoardCardComment(input: BoardCardActivityInput):
  BoardCardActivityResult;

function createBoardCardActivityNote(input: BoardCardActivityInput):
  BoardCardActivityResult;
```

Rules:

- Empty ids are rejected.
- Empty bodies are rejected.
- `createdAt` must be a non-empty ISO-ish string supplied by the caller.
- Optional author fields are trimmed.
- Helpers are pure and never touch storage, events, or the network.

## Non-Contracts

- No mention schema.
- No notification event.
- No comment edit/delete contract.
- No backend API.
