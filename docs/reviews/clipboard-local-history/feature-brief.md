# G4-E5 Clipboard Local History Feature Brief

## Goal

Create a local clipboard history plugin with mock input, type filtering, search, and privacy controls.

## Scope

- Clipboard entry entity: `{ id, content, type, source?, pinned, createdAt }`
- `useClipboardStore` with package-local `DataAdapter<ClipboardEntry>`
- `ClipboardList` with search and type filters
- `ClipboardPrivacy` with redaction patterns and auto-clear settings

## Out of Scope

- Real system clipboard listener
- Tauri command implementation
- Repository adapter

## Validation

- `pnpm --filter @repo/plugin-clipboard check-types`
