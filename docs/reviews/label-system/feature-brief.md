# G4-E1 Global Label System Feature Brief

## Goal

Create a global label plugin that can be reused by productivity, clipboard, console, and project workflows without depending on the unfinished repository layer.

## Scope

- Label entity: `{ id, name, color, icon?, createdAt }`
- Mock-first local persistence through `DataAdapter<Label>`
- React Context injection for adapter replacement
- `LabelPicker` with keyboard support, multi-select, recent labels, and inline create
- `LabelBadge` for compact rendering

## Out of Scope

- Repository adapter implementation
- Cross-device sync
- Canonical core type changes

## Validation

- `pnpm --filter @repo/plugin-labels check-types`
