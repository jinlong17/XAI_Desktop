# Dev Log - xai-web-board-task-link

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-task-link |
| Title | Web Project module P1 task link - create Tasks item from Board card and show linked status |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | `xai-web-board-calendar-feed` |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5 parent inline |
| Updated | 2026-06-03 22:05 PDT |
| Blockers | None currently. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #8 |
| Source PRD / Audit | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Write Scope | `docs/reviews/xai-web-board-task-link/` + `packages/xai-web-board-task-link/docs/` during planning. Runtime build scope is expected to stay inside `packages/xai-web-tasks`, `packages/plugin-web-board-core`, and `packages/plugin-web-board-workspaces`. |

## Artifacts

- Discovery review: `docs/reviews/xai-web-board-task-link/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-task-link/docs/design.md`
- API contract: `packages/xai-web-board-task-link/docs/api.md`
- Test strategy: `packages/xai-web-board-task-link/docs/test.md`

## Review Notes

Parent inline discovery selected a one-way Board-card to Task creation/link
workflow. Existing-task picker, reverse Tasks UI, persisted task-completion
state, event-bus changes, and backend sync are out of scope.

## Build Notes

- Added Tasks public board-link helpers in `@repo/plugin-web-tasks`.
- Added `BoardCard.taskLink` schema, public type export, and runtime guard coverage in board core.
- Added Task section to the board card detail modal.
- Wired `/app/board` Workspaces to create deterministic linked Tasks from active board cards, derive linked status from persisted `xai_task_cols`, and unlink by clearing only Board-side `taskLink`.

## Verify Notes

- PASS `pnpm --filter @repo/plugin-web-tasks lint`
- PASS `pnpm --filter @repo/plugin-web-tasks typecheck`
- PASS `pnpm --filter @repo/plugin-web-tasks test` (48 tests)
- PASS `pnpm --filter @repo/plugin-web-board-core lint`
- PASS `pnpm --filter @repo/plugin-web-board-core typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-core test` (161 tests)
- PASS `pnpm --filter @repo/plugin-web-board-workspaces lint`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces test` (201 tests)
- PASS `pnpm --filter @repo/web check-types`
- PASS `pnpm --filter @repo/web test -- --run` (116 tests)
- PASS `pnpm --filter @repo/web build`
- PASS `pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts` (2 tests)
- PASS `git diff --check`
- PASS live smoke on `http://localhost:3001/app/board`: opened first card,
  created linked task, verified Board `taskLink`, Tasks `source`, visible
  status `No Date`, and captured `/tmp/xai-board-task-link-smoke.png`.
- Inherited warnings observed: board-core React `act(...)` warnings, BoardSwitcher nested `<button>` warning, and share-url SubtleCrypto fallback warning.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-06-03 21:52 PDT | gpt-5 parent inline | feature-plan - audited Tasks public surface, `xai_task_cols` persistence, Board card detail modal, and Board writer path; created row #8 discovery/design/api/test/dev_log docs. | `f5f7e0c` | feature-build |
| 2026-06-03 22:01 PDT | gpt-5 parent inline | feature-build - implemented Tasks helper surface, Board `taskLink` contract, card-detail Task section, create/unlink handlers, and regression coverage. | `79a8bf3` | feature-verify |
| 2026-06-03 22:05 PDT | gpt-5 parent inline | ship-docs - marked row #8 shipped in roadmap, PRD, PLUGIN_MAP, product structure diagram, and personal development board mapping. | pending | `xai-web-board-calendar-feed` |
