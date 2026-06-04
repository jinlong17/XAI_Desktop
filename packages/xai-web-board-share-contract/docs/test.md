# Test Strategy - xai-web-board-share-contract

## Unit Helpers

- mock share envelope includes schema version, mode, permission, null expiry,
  backend marker, board id, and URL
- deterministic URL generation remains stable

## ShareModal

- EN modal visibly labels the link as mock-only
- ZH modal visibly labels the link as mock-only
- Copy still writes the URL
- Close event emits original fields plus mock contract fields

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-board-workspaces lint
pnpm --filter @repo/plugin-web-board-workspaces typecheck
pnpm --filter @repo/plugin-web-board-workspaces test
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts
git diff --check
```

## Manual Smoke

Run mock-auth Web, open `/app/board`, click Share, verify the visible mock-only
banner, copy the link, and close the dialog.
