# Test Strategy - xai-web-board-responsive-smoke

## Automated Gates

```bash
pnpm --filter @repo/plugin-web-board-workspaces lint
pnpm --filter @repo/plugin-web-board-workspaces typecheck
pnpm --filter @repo/plugin-web-board-workspaces test
pnpm --filter @repo/plugin-web-board-views typecheck
pnpm --filter @repo/plugin-web-board-views test
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts
git diff --check
```

## Browser Smoke Matrix

Run Web with mock auth:

```bash
pnpm --filter @repo/web dev:mock-auth -- --host 127.0.0.1 --port 3001
```

Validate `http://127.0.0.1:3001/app/board`.

| ID | Viewport | Flow | Required evidence |
|---|---|---|---|
| RS-D-1 | 1440x900 | Board view loads | `board-lists` visible, screenshot |
| RS-D-2 | 1440x900 | Board card opens detail | `card-detail-modal` visible, screenshot |
| RS-D-3 | 1440x900 | Table view loads | `board-table-wrap` visible |
| RS-D-4 | 1440x900 | Calendar view loads | `board-cal` visible |
| RS-D-5 | 1440x900 | Timeline view loads | `board-timeline` visible |
| RS-M-1 | 390x844 | Board view loads | `board-lists` visible/reachable, screenshot |
| RS-M-2 | 390x844 | Board card opens detail | one-column detail visible, screenshot |
| RS-M-3 | 390x844 | Table view loads | table wrapper visible/reachable |
| RS-M-4 | 390x844 | Calendar view loads | calendar visible/reachable |
| RS-M-5 | 390x844 | Timeline view loads | timeline visible/reachable |

## Browser Smoke Result - 2026-06-03

Browser plugin path was attempted first. It could open
`http://localhost:3001/app/board`, but screenshot capture timed out and the DOM
snapshot did not provide reliable Board-root evidence, so verification fell
back to local Playwright.

Local Playwright result:

| ID | Result | Evidence |
|---|---|---|
| RS-D-1 | PASS | `/tmp/xai-board-responsive-desktop-board.png` |
| RS-D-2 | PASS | `/tmp/xai-board-responsive-desktop-detail.png` |
| RS-D-3 | PASS | `/tmp/xai-board-responsive-desktop-table.png` |
| RS-D-4 | PASS | `/tmp/xai-board-responsive-desktop-calendar.png` |
| RS-D-5 | PASS | `/tmp/xai-board-responsive-desktop-timeline.png` |
| RS-M-1 | PASS | `/tmp/xai-board-responsive-mobile-board.png` |
| RS-M-2 | PASS | `/tmp/xai-board-responsive-mobile-detail.png` |
| RS-M-3 | PASS | `/tmp/xai-board-responsive-mobile-table.png` |
| RS-M-4 | PASS | `/tmp/xai-board-responsive-mobile-calendar.png` |
| RS-M-5 | PASS | `/tmp/xai-board-responsive-mobile-timeline.png` |

Validated properties:

- route identity: `http://localhost:3001/app/board`
- title: `XAI Web`
- root count: `board-workspaces-module` = 1
- framework overlay: false
- card count from seed board: 14
- desktop `scrollX`: 0
- mobile `scrollX`: 0 across Board/Table/Calendar/Timeline after toolbar
  internal scrolling
- detail close button click: PASS on desktop and mobile
- inherited console warning: `xai_rail_order contains unknown id "settings"`

## Failure Policy

- If only dense content requires horizontal scrolling, record as expected.
- If the app shell is blank, has a framework overlay, hides the view picker, or
  prevents opening/closing detail, fix before shipping.
- If console warnings are inherited and already documented, record them as
  residual non-blocking warnings instead of blocking the row.
