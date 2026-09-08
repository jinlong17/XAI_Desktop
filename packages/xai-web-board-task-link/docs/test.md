# Test Strategy - xai-web-board-task-link

## Tasks Package

- helper creates deterministic task id from board/card ids
- due date maps to Overdue / Next 7 / Later / No Date
- `loadTaskColsOrSeed(...)` returns seed on invalid raw and raw on valid cols
- upsert inserts into target bucket and increments count
- upsert updates existing linked task instead of duplicating
- find detects active and completed linked tasks
- guard accepts optional source ref

## Board Core

- guard accepts `BoardCard.taskLink`
- guard rejects malformed `taskLink`
- barrel exports task-link type

## Board Workspaces

- unlinked card detail shows Create task
- clicking Create task writes `xai_task_cols`
- clicking Create task patches `BoardCard.taskLink`
- linked card detail shows task status
- unlink clears `taskLink` without deleting the task

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-tasks lint
pnpm --filter @repo/plugin-web-tasks typecheck
pnpm --filter @repo/plugin-web-tasks test -- --run
pnpm --filter @repo/plugin-web-board-core lint
pnpm --filter @repo/plugin-web-board-core typecheck
pnpm --filter @repo/plugin-web-board-core test -- --run
pnpm --filter @repo/plugin-web-board-workspaces lint
pnpm --filter @repo/plugin-web-board-workspaces typecheck
pnpm --filter @repo/plugin-web-board-workspaces test -- --run
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts
git diff --check
```

## Manual Smoke

Run mock-auth Web and capture `/app/board`.

Expected:

- board renders
- card detail has Task section
- create/unlink task flow works in one browser session
