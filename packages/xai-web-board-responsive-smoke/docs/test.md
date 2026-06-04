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

## Failure Policy

- If only dense content requires horizontal scrolling, record as expected.
- If the app shell is blank, has a framework overlay, hides the view picker, or
  prevents opening/closing detail, fix before shipping.
- If console warnings are inherited and already documented, record them as
  residual non-blocking warnings instead of blocking the row.
