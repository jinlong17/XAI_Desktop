# sqlcipher-local-db — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::sqlcipher;
```

## Types

| Type | Contract |
|---|---|
| `SqlCipherDb` | Owns a keyed `rusqlite::Connection`. |
| `SqlCipherError` | E3020 initialization errors, KeyVault errors, or KDF errors. |

## Functions

| Function | Contract |
|---|---|
| `SqlCipherDb::open_with_kek(vault, kek_handle, path)` | Derives db key from resident KEK, opens/creates SQLCipher DB, applies raw key, validates connection. |
| `SqlCipherDb::connection()` | Returns the keyed rusqlite connection for downstream repository code. |
| `SqlCipherDb::close()` | Explicitly closes the connection and returns any close error. |
| `apply_sqlcipher_key(conn, db_key)` | Applies raw key PRAGMA, sets cipher compatibility 4, validates schema access. |
| `raw_key_pragma(db_key)` | Produces the raw-key PRAGMA only for exactly 32 input bytes. |

