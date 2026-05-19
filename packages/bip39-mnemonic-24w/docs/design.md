# bip39-mnemonic-24w — Design

## Scope

This row implements the Phase 0.3 DEK backup mnemonic primitive for Sync.

- Input: active 256-bit DEK only.
- Output: English BIP-39 24-word phrase.
- Out of scope: retired-key recovery, mnemonic UI, full account recovery flow.

## Code Boundaries

| Layer | File | Responsibility |
|---|---|---|
| Tauri Rust | `apps/desktop/src-tauri/src/crypto/mnemonic.rs` | Encode/decode 32-byte DEK to English BIP-39 mnemonic behind the `crypto` feature. |
| Account plugin | `packages/plugin-account/src/mnemonic.ts` | Browser-side helper using `@scure/bip39` with the same English wordlist. |

## Invariants

- Only 32-byte entropy is accepted for DEK backup.
- Decoding rejects any phrase that is not exactly 24 words before checksum parsing.
- Decoding verifies the BIP-39 checksum and returns exactly 32 bytes.
- Language is fixed to English.
- No retired-key caveat is modeled in this primitive; downstream recovery/re-key features own that state.

## Dependency Notes

- Rust uses exact-pinned optional `bip39 = "=2.2.2"` under the off-by-default `crypto` feature.
- TypeScript uses `@scure/bip39@2.2.0` in `@repo/plugin-account`.
- Local smoke confirmed both implementations encode `000102...1f` to the same 24-word phrase and decode it back to the original bytes.

