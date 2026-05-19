# kdf-primitives — API Contract

This row exposes Rust module functions behind the `crypto` feature:

```rust
pub mod crypto::argon2;
pub mod crypto::kdf;
```

## `crypto::argon2`

| Item | Contract |
|---|---|
| `KEK_KDF_VERSION` | `1`; matches `accounts.kek_kdf_version SMALLINT DEFAULT 1`. |
| `derive_kek(master_password, kek_salt, secret_key)` | Argon2id v=19, t=3, m=64MiB, p=4, `secret=secret_key`, output `[u8; 32]`. |
| `derive_auth_password(email, master_password, secret_key)` | HKDF-SHA256 dual-factor intermediate, then Argon2id t=1, m=16MiB, p=1, output `[u8; 32]`. |
| `rfc9106_argon2id_v19_vector()` | Test-facing vector helper for the RFC 9106 Argon2id v=19 KAT. |

## `crypto::kdf`

| Item | Contract |
|---|---|
| `auth_hkdf_salt(email)` | `email.as_bytes() || b"xai.auth.v1"`. |
| `hkdf_sha256_16/32(ikm, salt, info)` | Raw HKDF-SHA256 expand helper. |
| `derive_db_key(kek)` | HKDF-SHA256 with info `xai.sqlite.v1`, output `[u8; 32]`. |
| `derive_recovery_seed(dek)` | HKDF-SHA256 with info `xai.recovery.sig.v1`, output `[u8; 32]`. |

## Errors

All functions return `KdfResult<T> = Result<T, KdfError>`.

- `KdfError::Argon2(String)` wraps Argon2 parameter/hash failures.
- `KdfError::HkdfInvalidLength` wraps impossible HKDF output-length misuse.

