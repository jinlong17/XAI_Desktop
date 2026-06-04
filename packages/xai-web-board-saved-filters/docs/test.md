# Test Strategy - xai-web-board-saved-filters

## Unit Helpers

- malformed saved-filter storage narrows to an empty map
- persisted arrays convert to `FilterState` Sets
- `FilterState` serializes to sorted unique arrays
- invalid `dueRange` falls back to `"all"`

## BoardWorkspacesModule

- changing a filter writes `xai_board_filter_by_id` for the active board
- remount restores saved filters
- switching boards restores each board's own saved filter
- Clear resets the active board filter and persists the reset
- filter changes do not mutate `xai_boards_v2`

## Storage Registry

- `xai_board_filter_by_id` is registered with codec `json`, owner
  `xai-web-board-saved-filters`, category `module`, and schema version 1.

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-storage test -- --run src/__tests__/registry.test.ts src/__tests__/parity-design-md.test.ts
pnpm --filter @repo/plugin-web-board-workspaces lint
pnpm --filter @repo/plugin-web-board-workspaces check-types
pnpm --filter @repo/plugin-web-board-workspaces test
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts
git diff --check
```

## Manual Smoke

Run mock-auth Web, open `/app/board`, choose a filter, reload or switch boards,
and verify the active board restores its saved filter while another board keeps
its own filter state.
