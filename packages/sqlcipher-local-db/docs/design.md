# sqlcipher-local-db — Design

## Scope

This row implements the Rust SQLCipher open path for the encrypted local Sync DB.

- `db_key = HKDF(KEK, "xai.sqlite.v1") -> 32B`.
- KEK is read from a KeyVault opaque handle.
- SQLCipher raw-key mode is applied with `PRAGMA key = "x'<32-byte hex>'"`.
- `PRAGMA cipher_compatibility = 4` is set after keying.

## Code Boundary

| File | Responsibility |
|---|---|
| `apps/desktop/src-tauri/src/crypto/sqlcipher.rs` | SQLCipher connection open/key/validate/close helpers. |
| `apps/desktop/src-tauri/src/crypto/key_vault.rs` | Adds `Kek` resident key kind plus `insert_kek` / `with_kek`. |
| `apps/desktop/src-tauri/src/crypto/mod.rs` | Exposes `sqlcipher` behind the `crypto` feature. |

## Invariants

- Raw-key PRAGMA is generated only from byte slices after strict 32-byte length validation.
- Hex string is produced internally from bytes; callers cannot inject arbitrary SQL.
- `db_key` staging bytes are zeroized after keying the connection.
- Wrong KEK cannot open an existing encrypted DB.
- Connection close is explicit through `SqlCipherDb::close`; drop also closes via rusqlite if callers do not call it.

## Deferred Runtime Work

- SQLite schema/repository migration is owned by `core-data-sqlite-driver`.
- SQLite dump PoC on copied files / another account is deferred to Phase 5 acceptance rehearsals.
- Full SQLCipher CLI compatibility test is deferred; local rusqlite+SQLCipher open/reopen/wrong-key tests pass.

