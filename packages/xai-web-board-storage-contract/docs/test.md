# Test Strategy - xai-web-board-storage-contract

## Scope

This row is contract-heavy. Tests must prove compatibility and no data loss more
than UI rendering.

## Unit Tests

`packages/plugin-web-board-core/src/__tests__/storageContract.test.ts`

- legacy `Board[]` reads as `source: "legacy-array"`
- v1 envelope reads as `source: "v1-envelope"`
- invalid envelope fails closed
- `loadBoardsOrDefault(...)` accepts v1 envelope
- migration helper converts legacy array to envelope
- migration helper treats current envelope as already current
- write preservation keeps envelope form when previous raw value was envelope
- write preservation keeps legacy array form otherwise
- logical entity projection emits board/list/card records in deterministic order
- logical entity projection preserves full card payload fields
- all projected records are `syncScope: "account-sync"` and `schemaVersion: 1`

## Runtime Regression Tests

Existing board-core, board-views, and board-workspaces tests should keep passing.
If envelope support touches writer paths, add focused tests where useful:

- board-core `BoardModule` can mount from an envelope.
- board-workspaces can mount from an envelope and a basic mutation preserves
  envelope shape.
- board-views can mount from an envelope and date mutation preserves envelope
  shape.

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-board-core lint
pnpm --filter @repo/plugin-web-board-core typecheck
pnpm --filter @repo/plugin-web-board-core test -- --run
pnpm --filter @repo/plugin-web-board-views lint
pnpm --filter @repo/plugin-web-board-views typecheck
pnpm --filter @repo/plugin-web-board-views test -- --run
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

- Board renders from existing legacy storage.
- If a test fixture or manual console injects a v1 envelope, the board still
  renders.
- No visible route or UI copy changes are introduced by this row.
