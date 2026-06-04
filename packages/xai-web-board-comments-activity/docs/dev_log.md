# Dev Log - xai-web-board-comments-activity

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-comments-activity |
| Title | Web Project module P2 Board comments and activity timeline |
| Current Phase | FEATURE_VERIFY |
| Status | READY_TO_SHIP |
| Suggested Next | ship docs |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5 parent inline |
| Updated | 2026-06-03 23:43 PDT |
| Blockers | None currently. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #16 |
| Source PRD / Audit | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Discovery Review | `docs/reviews/xai-web-board-comments-activity/20260603-discovery-review.md` |
| Write Scope | `packages/plugin-web-board-core`, `packages/plugin-web-board-workspaces`, `packages/xai-web-board-comments-activity/docs`, `docs/reviews/xai-web-board-comments-activity`, and shipped status docs. |

## Artifacts

- Discovery review: `docs/reviews/xai-web-board-comments-activity/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-comments-activity/docs/design.md`
- API contract: `packages/xai-web-board-comments-activity/docs/api.md`
- Test strategy: `packages/xai-web-board-comments-activity/docs/test.md`

## Review Notes

Selected a formal card-level comment/activity contract that extends the existing
`BoardCard.activity[]` field. Mentions and notifications remain future
collaboration work.

## Build Notes

- Added `BoardCardActivityKind = "note" | "comment"`.
- Added optional `authorName` to `BoardCardActivityEntry`.
- Added pure `createBoardCardComment()` and
  `createBoardCardActivityNote()` helpers in board-core.
- Widened Board runtime guard to accept comment entries and reject malformed
  activity metadata.
- Board card detail now creates `comment` timeline rows with local author
  metadata.
- Existing `note` entries remain valid and render as Note timeline rows.
- Browser smoke screenshot: `/tmp/xai-board-comments-activity.png`.

## Verification

- PASS `pnpm --filter @repo/plugin-web-board-core typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-core lint`
- PASS `pnpm --filter @repo/plugin-web-board-core test -- --run src/__tests__/activityEntries.test.ts src/__tests__/isBoardArray.test.ts src/__tests__/index-barrel.test.ts` (28 tests)
- PASS `pnpm --filter @repo/plugin-web-board-core test` (183 tests)
- PASS `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces lint`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces test -- --run src/__tests__/BoardWorkspacesModule.test.tsx` (55 tests)
- PASS `pnpm --filter @repo/plugin-web-board-workspaces test` (220 tests)
- PASS `pnpm --filter @repo/web check-types`
- PASS `pnpm --filter @repo/web test -- --run` (116 tests)
- PASS `pnpm --filter @repo/web build`
- PASS local Chrome smoke at `http://localhost:3001/app/board`

Known inherited warnings remain:

- board-core `BoardModule` React `act(...)` warnings
- board-workspaces nested `<button>` warning in `BoardSwitcher`
- web shell `xai_rail_order contains unknown id "settings"` warning
- Vite dynamic import / chunk-size warning

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-06-03 23:38 PDT | gpt-5 parent inline | feature-plan - audited existing activity notes and selected a backward-compatible comment/activity union plus card-detail timeline polish. | pending | feature-build |
| 2026-06-03 23:43 PDT | gpt-5 parent inline | feature-build/verify - implemented comment/activity union, pure helper surface, card-detail timeline UI, tests, package/web verification, and Chrome smoke. | pending | ship docs |
