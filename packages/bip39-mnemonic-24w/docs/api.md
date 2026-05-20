# bip39-mnemonic-24w — API Contract

## Rust

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::mnemonic;
```

| Item | Contract |
|---|---|
| `DEK_BYTES` | Constant `32`. |
| `MNEMONIC_WORDS` | Constant `24`. |
| `MnemonicError` | `InvalidDekLength`, `InvalidWordCount`, or wrapped BIP-39 parse/checksum error. |
| `encode_dek_mnemonic(&[u8; 32])` | Produces an English 24-word BIP-39 phrase. |
| `decode_dek_mnemonic(&str)` | Requires exactly 24 words, validates checksum, and returns `[u8; 32]`. |

## TypeScript

Exported from `@repo/plugin-account`:

```ts
encodeDekMnemonic(dek: Uint8Array): string
decodeDekMnemonic(phrase: string): Uint8Array
```

| Function | Contract |
|---|---|
| `encodeDekMnemonic` | Throws `E3010` unless `dek.byteLength === 32`; returns English BIP-39 phrase. |
| `decodeDekMnemonic` | Throws `E3011` unless phrase has exactly 24 words; throws `E3012` on checksum/wordlist failure. |

