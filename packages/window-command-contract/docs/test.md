# window-command-contract — Test Plan

## Safe-Prep Checks

- `test -f packages/window-command-contract/docs/design.md`
- `test -f packages/window-command-contract/docs/api.md`
- `test -f packages/window-command-contract/docs/test.md`
- `test -f packages/window-command-contract/docs/dev_log.md`

## Deferred Implementation Checks

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/core test`
- `pnpm --filter desktop build`
- command rejects invalid `gridId`
- command errors preserve `code/message/recoverable`
- TS adapter never constructs `grid_{gridId}` labels outside approved helpers

