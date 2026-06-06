# Design - xai-web-board-integrations

## Selected Model

Board integrations are modeled as typed external links on card attachments:

```text
BoardCardDetailSurface
  -> createBoardIntegrationAttachment(provider, url, title)
  -> BoardCard.attachments[]
  -> xai_boards_v2
```

The integration catalog is owned by `@repo/plugin-web-board-core` so every
consumer uses one provider vocabulary.

## Providers

| Provider | Purpose |
|---|---|
| `gcal` | Link to a Google Calendar event or planning calendar item. |
| `github` | Link to a GitHub issue, PR, commit, or project item. |
| `linear` | Link to a Linear issue or project item. |
| `drive` | Link to a Google Drive document, folder, PDF, or image. |
| `link` | Generic external URL when no specific adapter applies. |

`gcal` and `linear` align with Settings OAuth stub prefs. `github` and `drive`
are Board-level adapter placeholders only until Settings exposes corresponding
connection state.

## User Behavior

1. User opens a Board card detail modal.
2. User chooses an integration provider.
3. User enters an HTTP(S) URL and optional title.
4. The attachment is saved with provider metadata and renders as a provider
   labeled link.
5. Existing manual link attachments continue to work.

## Non-Goals

- no live third-party data sync
- no OAuth token reads from Board
- no backend API
- no file upload
- no webhook/import worker
