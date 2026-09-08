# G4-E6 Cmd+K Local Search Feature Brief

## Goal

Provide a command palette that opens with Cmd+K and searches local mock entities across Label, Todo, Habit, Clipboard, and Project.

## Scope

- `useCommandPalette` hook.
- `CommandPalette` component.
- `SearchResult` component with open/reveal/copy/create actions.
- In-memory scoring and filtering.

## Out of Scope

- Repository query adapter.
- Cross-window command execution.
- Plugin-provided async search registration in production.

## Validation

- `pnpm --filter @repo/plugin-console check-types`
