# G5-E2 Project Board Scaffold Feature Brief

## Goal

Create a project board plugin with mock-first persistence and pure React card drag/drop.

## Scope

- Project entity: `{ id, name, lists[], labels[] }`
- Card entity: `{ id, title, listId, order, labels[], dueDate, checklist[] }`
- `useProjectStore` with mock adapters.
- `BoardView` for kanban-style list/card movement.
- `CardDetail` for description, checklist, and labels.

## Out of Scope

- Repository adapter.
- Cross-plugin imports.
- Drag/drop dependency adoption.

## Validation

- `pnpm --filter @repo/plugin-project check-types`
