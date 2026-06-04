# Dev Log - xai-web-board-saved-filters

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-saved-filters |
| Title | Web Project module P1 saved filters - persist per-board filter state |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_SHIP |
| Suggested Next | ship docs |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5 parent inline |
| Updated | 2026-06-03 22:26 PDT |
| Blockers | None currently. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #10 |
| Source PRD / Audit | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Write Scope | `packages/plugin-web-board-workspaces`, `packages/plugin-web-storage`, `packages/xai-web-board-saved-filters/docs`, `docs/reviews/xai-web-board-saved-filters`, plus shipped status docs after verify. |

## Artifacts

- Discovery review: `docs/reviews/xai-web-board-saved-filters/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-saved-filters/docs/design.md`
- API contract: `packages/xai-web-board-saved-filters/docs/api.md`
- Test strategy: `packages/xai-web-board-saved-filters/docs/test.md`

## Review Notes

Selected a per-board persisted preference map under `xai_board_filter_by_id`.
The filter remains a Board workspace UI preference and must not mutate
`xai_boards_v2`.

## Build Notes

- Added `xai_board_filter_by_id` to `@repo/plugin-web-storage` with owner
  `xai-web-board-saved-filters`.
- Added Board workspace saved-filter helpers for unknown narrowing, JSON
  serialization, and Set-based `FilterState` reconstruction.
- Wired `BoardWorkspacesModule` to persist filter changes immediately and
  restore the active board's saved filter on board switch/remount.
- Updated the old render-only filter test to assert persisted per-board
  behavior and added helper tests for malformed storage and serialization.

## Verify Notes

- PASS `pnpm --filter @repo/plugin-web-board-workspaces lint`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces test` (209 tests)
- PASS `pnpm --filter @repo/plugin-web-storage check-types`
- PASS `pnpm --filter @repo/plugin-web-storage test -- --run src/__tests__/registry.test.ts` (15 tests)
- PASS `pnpm --filter @repo/web check-types`
- PASS `pnpm --filter @repo/web test -- --run` (116 tests)
- PASS `pnpm --filter @repo/web build`
- PASS `pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts` (2 tests)
- PASS `git diff --check`
- PASS live smoke on `http://localhost:3001/app/board`: selected label/member/
  due filters, verified `xai_board_filter_by_id`, switched to another board
  with no filter, switched back, and verified the saved filter restored.
  Screenshot: `/tmp/xai-board-saved-filters-smoke.png`.
- NOTE `src/__tests__/parity-design-md.test.ts` still references historical
  `web design/DESIGN.md`, which is not tracked in this worktree; registry
  contract coverage passed for the new owner-row key.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-06-03 22:18 PDT | gpt-5 parent inline | feature-plan - audited existing render-only filter state, selected per-board storage map, and defined API/test contract. | `dab4470` | feature-build |
| 2026-06-03 22:26 PDT | gpt-5 parent inline | feature-build/verify - implemented persisted per-board filters, storage registry contract, helper/module tests, app verification, and browser smoke. | pending | ship docs |
