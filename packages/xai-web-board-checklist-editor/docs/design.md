# Design - xai-web-board-checklist-editor

> Decision snapshot for the Web Project module P0 checklist editor slice.

## Selected Option

**Option A** - formalize the existing card-detail checklist editor:

- keep checklist editing inside `BoardCardDetailModal`
- keep checklist data in `BoardCard.checklistItems`
- keep `BoardCard.checklist` as a derived legacy chip field
- add focused regression coverage and stable test hooks

## Runtime Ownership

```text
plugin-web-board-core
  └── owns BoardChecklistItem type and mergeBoardCardPatch normalization

plugin-web-board-workspaces
  └── owns BoardCardDetailModal checklist editing UI and route-level persistence tests

plugin-web-board-views
  └── read-only consumer of card checklist chips through board-core data
```

## Frozen Assumptions

1. Checklist items stay in `BoardCard.checklistItems`.
2. Each item remains `{ id: string, text: string, done: boolean }`.
3. `BoardCard.checklist` is derived from `checklistItems`; it is not separately
   edited by UI.
4. Empty `checklistItems` clears the derived legacy `checklist` chip.
5. Card detail remains the only checklist editing surface.
6. Board cards continue to show compact `done/total` progress.
7. No route, storage-key, schemaVersion, or backend sync work is introduced.

## Out of Scope

- checklist reorder
- checklist item due dates or assignees
- checklist comments/activity events
- checklist templates
- task conversion/linking
- permissions/share/backend sync
