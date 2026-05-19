# protocol-integrity-integration-tests — Test Report

## 2026-05-19 Local Autorun

Passed:

- `pnpm --filter @repo/plugin-account test -- tests/integration/protocol-integrity.test.ts`
- `pnpm --filter web test:protocol`
- `pnpm --filter web check-types`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto commands::crypto::tests::rejects_non_allowlisted_window`

Cargo emitted existing dead-code warnings during the focused allowlist test; the
targeted allowlist test passed.

## Deferred Verification

- Human review and cross-vendor verify.
- Live Supabase deployed integration.
- Real malicious plugin/window runtime denial.
- Release-mode recovery/KDF performance budget.
