# Test Strategy - xai-web-board-export-import

## Board-Core Contract Tests

- legacy array export creates a v1 Board export payload
- existing v1 envelope export preserves storage source and storage value
- logical entities include board/list/card records
- malformed storage returns invalid without throwing
- payload reader rejects wrong kind, schema version, and malformed storage
- import helper returns a validated storage value

## Delete Flow Regression

- account-delete registry wipe set includes all Board-owned keys:
  `xai_boards_v2`, `xai_active_board`, `xai_board_panels`, `xai_board_inbox`,
  `xai_board_view_by_id`, `xai_board_filter_by_id`
- existing no-`localStorage.clear()` guard remains passing

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-board-core typecheck
pnpm --filter @repo/plugin-web-board-core test -- --run src/__tests__/exportImport.test.ts src/__tests__/index-barrel.test.ts
pnpm --filter @repo/plugin-web-board-core test
pnpm --filter @repo/plugin-web-settings-rest typecheck
pnpm --filter @repo/plugin-web-settings-rest test -- --run src/__tests__/useAccountDeleteOrchestrator.test.tsx src/__tests__/no-localstorage-clear.test.ts
pnpm --filter @repo/plugin-web-settings-rest test
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
git diff --check
```

## Manual Smoke

No UI smoke is required for this row because it adds a data contract and delete
coverage only. Future export/import UI rows must add browser smoke.
