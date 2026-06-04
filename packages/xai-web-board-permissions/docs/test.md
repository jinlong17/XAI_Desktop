# Test Strategy - xai-web-board-permissions

## Board-Core Tests

- missing visibility resolves to private
- helper sets shared/private immutably
- helper returns same reference on no-op
- guard accepts private/shared and rejects malformed visibility
- public barrel exports visibility helpers and types

## Workspace Tests

- header renders Private by default for legacy boards
- clicking the visibility control persists Shared to `xai_boards_v2`
- clicking again persists Private
- Share modal receives and displays the active visibility
- share event includes visibility

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-board-core typecheck
pnpm --filter @repo/plugin-web-board-core lint
pnpm --filter @repo/plugin-web-board-core test -- --run src/__tests__/boardVisibility.test.ts src/__tests__/isBoardArray.test.ts src/__tests__/index-barrel.test.ts
pnpm --filter @repo/plugin-web-board-core test
pnpm --filter @repo/plugin-web-board-workspaces typecheck
pnpm --filter @repo/plugin-web-board-workspaces lint
pnpm --filter @repo/plugin-web-board-workspaces test -- --run src/__tests__/BoardWorkspacesModule.test.tsx src/__tests__/ShareModal.test.tsx
pnpm --filter @repo/plugin-web-board-workspaces test
pnpm --filter @repo/core check-types
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
git diff --check
```

## Manual Smoke

Because this row changes a visible header control and Share modal copy, final
ship should include a live `/app/board` browser smoke that toggles visibility
and opens Share.
