# protocol-integrity-integration-tests — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Feature | protocol-integrity-integration-tests |
| Status | SHIPPED |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 04:36 PDT |

## Work Log

| Timestamp | Action | Verification | Next |
|---|---|---|---|
| 2026-05-19 04:36 PDT | Added local protocol regression tests for blob-swap AAD binding, revision rollback `E3015`, no-proof recovery `401/E3014`, mutation idempotency 10x, and existing Tauri crypto allowlist denial. | `pnpm --filter @repo/plugin-account test -- tests/integration/protocol-integrity.test.ts`; `pnpm --filter web test:protocol`; `pnpm --filter web check-types`; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto commands::crypto::tests::rejects_non_allowlisted_window` | Run independent review/cross-vendor verify and hosted malicious-client integration after external gates are available. |
| 2026-05-20 14:55 PDT | Added real scaffold package with deterministic CBOR serialization/deserialization, protocol AAD construction, stable vectors, and round-trip tests. | `pnpm --filter @repo/protocol-integrity-integration-tests test`; package `check-types` | Supabase remains mocked/local only. |
