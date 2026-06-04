# Test Strategy - xai-web-board-automation-lite

## Board-Core Tests

- Done list completion sets `completedAt`.
- Done completion marks checklist rows and aggregate checklist progress done.
- Due-soon cards get the `urgent` label once.
- Overdue cards are not treated as due-soon by this preset.
- Due-date sorting orders valid due dates first and preserves no-due order.
- Archived cards and archived lists are ignored.
- The public barrel exports automation helper constants and types.
- Runtime guards accept additive `completedAt` and reject malformed shapes.

## Workspace Tests

- Daily mount automation persists urgent labels and due-date sort through
  `xai_boards_v2`.
- Manual toolbar preset run applies automation to the active board.

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-board-core typecheck
pnpm --filter @repo/plugin-web-board-core test -- --run src/__tests__/automationLite.test.ts src/__tests__/index-barrel.test.ts src/__tests__/isBoardArray.test.ts
pnpm --filter @repo/plugin-web-board-core test
pnpm --filter @repo/plugin-web-board-workspaces typecheck
pnpm --filter @repo/plugin-web-board-workspaces test -- --run src/__tests__/BoardWorkspacesModule.test.tsx src/__tests__/index-barrel.test.ts
pnpm --filter @repo/plugin-web-board-workspaces test
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
git diff --check
```

## Manual Smoke

Because this row adds an active toolbar control and mount-time behavior, final
ship should include a live `/app/board` browser smoke after automated tests pass.
