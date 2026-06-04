# Design - xai-web-board-share-contract

## Selected Model

Share remains a mock local contract until backend sharing is accepted:

```text
boardId
  -> deterministic mock token
  -> mock share envelope
  -> ShareModal visible stub label
  -> web:board:share-requested event payload
```

## User Behavior

1. User opens Share from `/app/board`.
2. Modal shows the generated link.
3. Modal also shows a visible warning that the link is mock-only and does not
   grant access yet.
4. Copy still copies the generated URL.
5. Closing emits an event with explicit mock contract metadata.

## UI Rules

- Keep native `<dialog>`.
- Keep Copy and Close.
- Add visible stub status copy near the URL.
- Do not add invite fields or permission editors yet.

## Ownership

- `plugin-web-board-workspaces` owns the Share modal and mock share envelope.
- `@repo/core` owns the typed event payload extension.
- No storage key is added for this row.

## Future Work

- Replace mock envelope with server-issued token.
- Add `/share/:token` route.
- Add private/shared board state and permission controls.
