# sqlcipher-local-db — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| Raw-key PRAGMA only accepts 32 bytes and hex-encodes internally | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::sqlcipher::tests` |
| Correct KEK opens, writes, closes, reopens, and reads an encrypted DB | Same target, `db_opens_with_correct_kek_and_fails_with_wrong_kek`. |
| Wrong KEK fails to open existing DB | Same target. |
| Default and crypto builds compile locked | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |
| Exact crypto pins remain enforced | `bash scripts/ci/check-exact-pins.sh`. |

## Deferred

- SQLCipher CLI compatibility check.
- SQLite dump PoC on copied file / separate account.
- Core-data repository/schema migration.

