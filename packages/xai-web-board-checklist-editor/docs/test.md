# Test Strategy - xai-web-board-checklist-editor

## Unit / Integration Coverage

### `plugin-web-board-core`

- `mergeBoardCardPatch(...)` derives `{ done, total }` from checklist items.
- `mergeBoardCardPatch(...)` clears `checklist` when checklist items become empty.
- board guard continues accepting valid `checklistItems`.

### `plugin-web-board-workspaces`

- card detail add item persists `checklistItems`.
- toggling a row updates `done`.
- editing row text updates `text`.
- removing a row deletes that item.
- progress chip/summary updates after each mutation.
- removing all rows clears legacy `checklist`.

## Manual Smoke

- Open `/app/board`.
- Open first card detail.
- Add a checklist item.
- Toggle it, edit its text, remove it.
- Confirm the card chip and detail summary update without closing the modal.

## Acceptance Criteria

| ID | Acceptance |
|---|---|
| AC1 | Card detail supports checklist add/toggle/edit/remove. |
| AC2 | Checklist progress is derived from `checklistItems` and persists. |
| AC3 | Removing the last item clears stale `card.checklist`. |
| AC4 | Existing legacy checklist cards remain editable through generated detail rows. |
| AC5 | No route/storage/backend/card lifecycle scope is introduced. |
