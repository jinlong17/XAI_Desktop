# Dev Log - xai-web-board-card-crud

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-card-crud |
| Title | Web Project module P0 card CRUD slice - add card rename, archive/delete, and same-list reorder on `/app/board` while preserving shipped card detail, typed dates, and list CRUD |
| Current Phase | FEATURE_BUILD |
| Status | BUILDING |
| Suggested Next | P2 board card action UI |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5 parent inline |
| Updated | 2026-06-03 21:18 PDT |
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

Parent inline review approved the narrow row #5 scope for build: additive
`BoardCard.archived?: boolean`, board-core pure helpers, shared card action UI,
workspace archived-card manager, and active-card filtering. Explicitly rejected
scope drift into checklist item CRUD, storage contract, route aliases, backend
sync, or exact cross-list insertion.

## Build Notes

P1 core contract landed:

- additive `BoardCard.archived?: boolean`
- `ArchivedBoardCardRecord`
- guard acceptance/rejection for card archived shape
- active/archived card selectors
- card rename, same-list visible-order move, archive, restore, and
  archived-only permanent delete helpers
- barrel exports
- focused unit coverage

Verification:

- `pnpm --filter @repo/plugin-web-board-core lint` PASS
- `pnpm --filter @repo/plugin-web-board-core typecheck` PASS
- `pnpm --filter @repo/plugin-web-board-core test -- --run` PASS (`146/146`)

## Verify Notes

Pending verify.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-06-03 21:15 PDT | gpt-5 parent inline | feature-plan - reviewed shipped row #2/#3/#4 docs, current `plugin-web-board-{core,views,workspaces}` runtime seams, and source PRD PJ-WEB-03; produced discovery/design/api/test/dev_log docs for a narrow card CRUD slice with additive card archive state, board-surface rename, same-list command reorder, and workspace archived-card manager. | pending | feature-review |
| 2026-06-03 21:18 PDT | gpt-5 parent inline | Inline build P1 - added board-core card lifecycle contract: `archived?: boolean`, archived-card record type, card archived guard acceptance/rejection, active/archived card selectors, rename, same-list visible-order move, archive, restore, archived-only permanent delete helpers, barrel exports, and unit coverage. Verification: board-core lint PASS, typecheck PASS, test PASS (`146/146`, pre-existing React `act(...)` stderr warnings remain). | pending | P2 board card action UI |
