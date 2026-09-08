# Test Strategy - xai-web-board-comments-activity

## Board-Core Tests

- comment helper trims body and author metadata
- note helper preserves backward-compatible note entries
- helpers reject missing ids or empty bodies
- guard accepts comment entries with author metadata
- guard rejects unknown activity kinds and malformed author metadata
- public barrel exports helper surface and types

## Workspace Tests

- card detail adds a comment and persists it in `xai_boards_v2`
- timeline renders comment kind and author display
- existing note entries remain valid and render in the timeline

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-board-core typecheck
pnpm --filter @repo/plugin-web-board-core lint
pnpm --filter @repo/plugin-web-board-core test -- --run src/__tests__/activityEntries.test.ts src/__tests__/isBoardArray.test.ts src/__tests__/index-barrel.test.ts
pnpm --filter @repo/plugin-web-board-core test
pnpm --filter @repo/plugin-web-board-workspaces typecheck
pnpm --filter @repo/plugin-web-board-workspaces lint
pnpm --filter @repo/plugin-web-board-workspaces test -- --run src/__tests__/BoardWorkspacesModule.test.tsx
pnpm --filter @repo/plugin-web-board-workspaces test
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
git diff --check
```

## Manual Smoke

Because this row changes visible card-detail behavior, final ship should include
a live `/app/board` browser smoke that adds a comment and verifies it in the
timeline.
