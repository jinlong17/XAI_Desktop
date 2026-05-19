# bip39-mnemonic-24w — Dev Log (Workflow State Machine)

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | bip39-mnemonic-24w |
| Title | 24-word BIP-39 active DEK backup mnemonic |
| Roadmap | sync-v1 · feature #6 · wave W0 · Phase 0.3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | rust-keyvault-opaque-handle (#11) |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 02:44 PDT |

## Phase Plan

### Phase 1 — Rust mnemonic primitive [DONE]

- Added `crypto::mnemonic` behind the `crypto` feature.
- Added strict 32-byte DEK and 24-word phrase validation.
- Added BIP-39 checksum-backed decode path.

### Phase 2 — Account plugin helper [DONE]

- Added `packages/plugin-account/src/mnemonic.ts`.
- Exported `encodeDekMnemonic` and `decodeDekMnemonic` from the account plugin package.
- Added `@scure/bip39@2.2.0` to the account plugin dependencies.

### Phase 3 — Tests and docs [DONE]

- Added Rust unit tests for encode/decode/reject paths.
- Ran a local JS `@scure/bip39` smoke on the same canonical fixture.
- Added design/api/test/dev_log docs.

## Deferred Gates

- Formal independent review / admission-gate sign-off is deferred. See `docs/workflow/roadmap/sync-v1.deferred-gates.md`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 02:44 PDT | Codex serial autorun | Implemented #6 Rust and TypeScript mnemonic helpers, docs, and tests; fixed initial fixture/import issues; prepared local commit. | local commit `feat(bip39-mnemonic-24w): add DEK mnemonic codec` | rust-keyvault-opaque-handle (#11) |
