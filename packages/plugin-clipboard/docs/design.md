# Plugin Clipboard Design

## Scope

`@repo/plugin-clipboard` owns local clipboard history UI, privacy controls, sequential paste queue state, and OCR preview contract.

## Decisions

- Clipboard history is mock-first. Users can add manual entries while real system listeners are deferred.
- Persistence uses package-local `DataAdapter<ClipboardEntry>` with `LocalStorageAdapter` default.
- Privacy rules are local settings with regex redaction and optional auto-clear for unpinned entries.
- Sequential paste is modeled as ordered state and mock paste callbacks. Real paste execution requires future desktop commands.
- OCR is a UI/data-flow contract only. The engine field allows future `macos-vision` or `ai` adapters.
