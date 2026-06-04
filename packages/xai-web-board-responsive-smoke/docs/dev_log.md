# Dev Log - xai-web-board-responsive-smoke

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-responsive-smoke |
| Title | Web Project module P1 responsive browser smoke |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_SHIP |
| Suggested Next | ship docs |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5 parent inline |
| Updated | 2026-06-03 22:53 PDT |
| Blockers | None currently. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #12 |
| Source PRD / Audit | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Write Scope | `packages/xai-web-board-responsive-smoke/docs`, `docs/reviews/xai-web-board-responsive-smoke`, and only targeted board CSS/tests/docs if smoke exposes a blocker. |

## Artifacts

- Discovery review: `docs/reviews/xai-web-board-responsive-smoke/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-responsive-smoke/docs/design.md`
- API contract: `packages/xai-web-board-responsive-smoke/docs/api.md`
- Test strategy: `packages/xai-web-board-responsive-smoke/docs/test.md`

## Plan Notes

This is a verification row. It does not add storage, events, or a new runtime
package. The success criterion is real-browser evidence for Board/Table/
Calendar/Timeline/Detail on desktop and mobile widths.

## Browser Smoke Notes

- Browser plugin path attempted first per Build Web Apps frontend testing
  guidance. It loaded `/app/board`, but `Page.captureScreenshot` timed out and
  the DOM snapshot did not provide reliable Board-root evidence. Fallback:
  local Playwright via `/Users/lijinlong/anaconda3/bin/python`.
- First Playwright run found a real mobile defect: card detail modal overflowed
  the 390px viewport and the close button was clipped/unreliable.
- Second Playwright pass found a shell-level defect: Board toolbar overflow
  caused page-level horizontal scroll and shifted the Board root during mobile
  view-picker clicks.
- Fixes applied:
  - `packages/plugin-web-tokens/src/layout.css`: `app-main`, `topbar`, and
    search input can shrink inside the shell grid/flex layout.
  - `packages/plugin-web-board-workspaces/src/styles.css`: Board toolbar
    overflow is contained inside the module on narrow widths; card detail
    width, mobile padding, and close hit target are viewport-safe.
- Final Playwright smoke PASS at `1440x900` and `390x844`.
- Screenshots:
  - `/tmp/xai-board-responsive-desktop-board.png`
  - `/tmp/xai-board-responsive-desktop-detail.png`
  - `/tmp/xai-board-responsive-desktop-table.png`
  - `/tmp/xai-board-responsive-desktop-calendar.png`
  - `/tmp/xai-board-responsive-desktop-timeline.png`
  - `/tmp/xai-board-responsive-mobile-board.png`
  - `/tmp/xai-board-responsive-mobile-detail.png`
  - `/tmp/xai-board-responsive-mobile-table.png`
  - `/tmp/xai-board-responsive-mobile-calendar.png`
  - `/tmp/xai-board-responsive-mobile-timeline.png`

## Verify Notes

- PASS `pnpm --filter @repo/plugin-web-board-workspaces lint`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces test` (215 tests)
- PASS `pnpm --filter @repo/plugin-web-board-views typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-views test` (131 tests)
- PASS `pnpm --filter @repo/plugin-web-tokens check-types`
- PASS `pnpm --filter @repo/plugin-web-tokens test` (52 tests)
- PASS `pnpm --filter @repo/web check-types`
- PASS `pnpm --filter @repo/web test -- --run` (116 tests)
- PASS `pnpm --filter @repo/web build`
- PASS `pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts` (2 tests)
- PASS `git diff --check`
- Known inherited warnings remain:
  - BoardSwitcher nested `<button>` warning
  - MapView / BoardCalendarView React `act(...)` warnings
  - `xai_rail_order contains unknown id "settings"` warning
  - Vite dynamic import / chunk-size warning

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-06-03 22:45 PDT | gpt-5 parent inline | feature-plan - scoped row #12 to desktop/mobile browser smoke of Board, Table, Calendar, Timeline, and Detail. | `287375d` | browser smoke matrix |
| 2026-06-03 22:53 PDT | gpt-5 parent inline | feature-build/verify - fixed mobile shell/detail overflow, added CSS contract tests, ran automated gates, and captured desktop/mobile Playwright screenshots. | pending | ship docs |
