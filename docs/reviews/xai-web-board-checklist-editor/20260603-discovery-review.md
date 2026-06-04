# Discovery Review - xai-web-board-checklist-editor

| Field | Value |
|---|---|
| Feature | `xai-web-board-checklist-editor` |
| Roadmap | `docs/workflow/roadmap/xai-web-project-module.md` row #6 |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` PJ-WEB-03 |
| Date | 2026-06-03 PDT |
| Status | NEEDS_REVIEW |

## Problem

The Project module PRD expects card checklists to behave like real task
subitems, not just static progress chips. Row #2 already introduced checklist
editing inside `BoardCardDetailModal`, but row #6 has not been formalized or
verified as its own roadmap feature.

Current implementation facts:

- card detail can add checklist items
- each checklist row can toggle done state
- checklist row text is editable
- checklist rows can be removed
- `mergeBoardCardPatch(...)` derives legacy `card.checklist = { done, total }`
  whenever `checklistItems` changes
- board cards render the derived `done/total` chip

Gap:

- the row has no formal discovery/design/api/test/dev_log package
- tests cover add/progress indirectly but do not explicitly lock edit, toggle,
  remove, and empty-progress behavior
- row #6 is still `PENDING` in the Project module roadmap despite the runtime
  foundation already existing

## Recommended Scope

Formalize and verify the existing checklist editor rather than replacing it.

1. Add row #6 planning docs.
2. Add stable row-level test ids for checklist text and remove controls.
3. Add focused integration tests for:
   - add item
   - toggle done
   - edit item text
   - remove item
   - derived progress chip updates
   - empty checklist clears legacy `checklist`
4. Update roadmap/PLUGIN_MAP/dev_log after verification.

## Non-Goals

- no nested checklist groups
- no checklist drag reorder
- no checklist due dates, assignees, comments, or automation
- no new storage key, schemaVersion, migration, backend sync, or route change
- no card CRUD changes beyond consuming the shipped card-detail mutation path

## Risk Notes

| Risk | Mitigation |
|---|---|
| Legacy `checklist` chip drifts from `checklistItems`. | Keep normalization in board-core and add explicit regression coverage. |
| Removing the last item leaves stale `checklist`. | Test that empty `checklistItems` clears the derived chip. |
| Row #6 scope expands into task management. | Keep checklist item fields limited to `{ id, text, done }`. |
