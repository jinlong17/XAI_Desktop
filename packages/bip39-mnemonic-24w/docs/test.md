# bip39-mnemonic-24w — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| 32-byte DEK encodes to 24 English words | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::mnemonic::tests` |
| 24-word phrase decodes back to the original DEK | Same Rust unit test target. |
| Non-24-word phrases are rejected before recovery use | Same Rust unit test target. |
| Account plugin TypeScript compiles against `@scure/bip39` | `pnpm --filter @repo/plugin-account check-types` |
| Rust and JS agree on canonical fixture | `pnpm --filter @repo/plugin-account exec node --input-type=module -e "<@scure/bip39 smoke>"` |
| Default and crypto builds compile locked | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |

## Local Result

Canonical fixture:

- DEK hex: `000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f`
- Phrase: `abandon amount liar amount expire adjust cage candy arch gather drum bullet absurd math era live bid rhythm alien crouch range attend journey unaware`

## Deferred

- Formal independent review / admission-gate sign-off remains deferred under the 24h autorun contract.

