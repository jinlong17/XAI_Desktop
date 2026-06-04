# Design - xai-web-board-comments-activity

## Selected Model

Comments and lightweight activity share the existing card-level timeline:

```text
BoardCardDetailSurface
  -> createBoardCardComment()
  -> BoardCard.activity[]
  -> xai_boards_v2
```

The row formalizes the existing `activity` field instead of introducing a new
storage key or separate comments collection.

## Entry Kinds

| Kind | Purpose |
|---|---|
| `comment` | User-authored discussion entry in card detail. |
| `note` | Backward-compatible lightweight activity note. |

Future system events can extend the union later, but this row keeps the runtime
surface to comments and existing notes.

## User Behavior

1. User opens a Board card detail modal.
2. User writes a comment in the activity section.
3. The comment is prepended to the timeline with author and date metadata.
4. Existing note entries continue to render.

## Non-Goals

- no mentions
- no notifications
- no live multiplayer comments
- no comment editing/deleting
- no separate backend table
