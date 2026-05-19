# menubar-sync-status-icon — Test

Focused checks run during the autorun:

```bash
pnpm --filter @repo/plugin-account test
pnpm --filter @repo/plugin-account check-types
pnpm --filter desktop build
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml menubar
```

Coverage:

- plugin-account emits the three sync lifecycle events with typed payloads.
- `runObservedSync()` emits success/failure lifecycle events and rethrows errors.
- desktop TypeScript builds with the React event listener hook.
- Rust tray icons are generated for all four states and the error tooltip is
  actionable.

Deferred:

- Real tray animation/click behavior on macOS.
- Real push/pull transitions driven by #30 single-table E2E.
