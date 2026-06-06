# Test Strategy - xai-web-board-integrations

## Board-Core Tests

- provider catalog includes GCal, GitHub, Linear, Drive, and generic link
- attachment helper normalizes valid HTTP(S) URLs
- attachment helper rejects invalid URLs and unknown providers
- storage guard accepts optional integration source metadata
- storage guard rejects malformed source metadata
- public barrel exports integration helpers and types

## Workspace Tests

- card detail renders provider choices
- adding a provider link persists an attachment with provider metadata
- provider metadata renders as a labeled link in the attachment list
- invalid integration URLs do not mutate the card

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-board-core typecheck
pnpm --filter @repo/plugin-web-board-core lint
pnpm --filter @repo/plugin-web-board-core test -- --run src/__tests__/integrationAdapters.test.ts src/__tests__/isBoardArray.test.ts src/__tests__/index-barrel.test.ts
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

Because this row adds a visible card-detail control, final ship should include a
live `/app/board` browser smoke that opens a card detail modal and adds a typed
integration link.
