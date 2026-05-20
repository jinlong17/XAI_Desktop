# Proposed Contract Changes: Sequential Paste Queue

## Need

Sequential paste requires a desktop command that can place content on the system clipboard and trigger paste into the focused app.

## Proposed Tauri Commands

- `clipboard_write_content(payload: { content: string; type: ClipboardEntryType }): void`
- `clipboard_paste_into_focused_app(): void`

## Proposed Events

- `clipboard:paste-queue-started`
- `clipboard:paste-queue-advanced`
- `clipboard:paste-queue-completed`

## Notes

Track B currently models the queue and paste state only. The UI calls a mock paste callback.
