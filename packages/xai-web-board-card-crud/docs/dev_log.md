# Dev Log - xai-web-board-card-crud

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-card-crud |
| Title | Web Project module P0 card CRUD slice - add card rename, archive/delete, and same-list reorder on `/app/board` while preserving shipped card detail, typed dates, and list CRUD |
| Current Phase | FEATURE_PLAN |
| Status | NEEDS_REVIEW |
| Suggested Next | feature-review |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5 parent inline |
| Updated | 2026-06-03 21:15 PDT |
| Blockers | None currently. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #5 |
| Source PRD / Audit | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Write Scope | `docs/reviews/xai-web-board-card-crud/` + `packages/xai-web-board-card-crud/docs/` during planning. Runtime build scope is expected to stay inside `packages/plugin-web-board-{core,workspaces}` plus parity-only `plugin-web-board-views` if shared `BoardView` props change. |

## Artifacts

- Discovery review: `docs/reviews/xai-web-board-card-crud/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-card-crud/docs/design.md`
- API contract: `packages/xai-web-board-card-crud/docs/api.md`
- Test strategy: `packages/xai-web-board-card-crud/docs/test.md`

## Step 0 - Feature Brief Normalization

### Raw Request

Continue the formal Web Project module roadmap after shipped list CRUD. Row #5:
`xai-web-board-card-crud` - add card rename, archive/delete, and within-list
reorder; preserve stable ordering.

### Normalized Feature Brief

The current `/app/board` Project module supports detailed card editing, typed
date fields, and list lifecycle management, but cards themselves still lack a
board-surface lifecycle. This feature adds lightweight Trello-style task card
management: rename active cards, move cards up/down in a list, archive active
cards, restore or permanently delete archived cards, and keep archived cards
hidden from active Board/Table/Calendar/Timeline/Dashboard/Map/Planner/filter/
overview surfaces.

This row stays intentionally narrow. It does not implement checklist item CRUD,
storage migrations, backend sync, route aliases, comments, automations,
integrations, or templates.

## Feature Name Check

- **Canonical Name**: `xai-web-board-card-crud`
- **Why this name fits**: it matches roadmap row #5 exactly and separates card
  lifecycle/order work from row #6 checklist editing and row #7 storage
  contract work.

## Review Notes

Pending feature-review.

## Build Notes

Pending build.

## Verify Notes

Pending verify.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-06-03 21:15 PDT | gpt-5 parent inline | feature-plan - reviewed shipped row #2/#3/#4 docs, current `plugin-web-board-{core,views,workspaces}` runtime seams, and source PRD PJ-WEB-03; produced discovery/design/api/test/dev_log docs for a narrow card CRUD slice with additive card archive state, board-surface rename, same-list command reorder, and workspace archived-card manager. | pending | feature-review |
