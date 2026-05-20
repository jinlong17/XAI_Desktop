# Proposed Contract Changes: Clipboard Local History

## Need

Real clipboard capture requires desktop-side integration that is outside Track B ownership.

## Proposed Tauri Commands

- `clipboard_read_current(): ClipboardEntryPayload | null`
- `clipboard_start_listener(config: ClipboardListenerConfig): void`
- `clipboard_stop_listener(): void`

## Proposed Events

- `clipboard:changed` with `{ content, type, source?, createdAt }`
- `clipboard:listener-error` with `{ code, message }`

## Notes

The current implementation uses manual mock input and package-local types until Track A exposes canonical events/contracts.
