# protocol-integrity-integration-tests — API

This row does not introduce public runtime API. It adds regression entry points
for existing Sync protocol surfaces.

## Test Commands

- `pnpm --filter @repo/plugin-account test -- tests/integration/protocol-integrity.test.ts`
- `pnpm --filter web test:protocol`
- `pnpm --filter web check-types`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto commands::crypto::tests::rejects_non_allowlisted_window`

## Edge Behavior Tightening

`handleRecoveryProof()` now maps `E3014` recovery-proof failures on
`PATCH /auth/me` to HTTP 401 JSON responses:

```json
{ "error": "E3014" }
```

Other unexpected errors continue to propagate to the caller.
