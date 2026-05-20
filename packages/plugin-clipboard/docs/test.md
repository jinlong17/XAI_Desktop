# Plugin Clipboard Test Notes

## Current Gate

- `pnpm --filter @repo/plugin-clipboard check-types`

## Manual Coverage

- Add mock clipboard entries.
- Filter by type and search by content/source.
- Toggle pin and clear unpinned entries.
- Add/remove redaction regex patterns.
- Select entries for paste queue and step through paste order.
- Run mock OCR for image entries and inspect recognized blocks.
