Feature ID: G2.4 / keychain-opaque-handle
Branch: codex/track-a-desktop-foundation
Commit under review: d1fe45a (feat(keychain-opaque-handle): Keychain ↔ KeyVault bridge with byte zeroization)

Files added or changed:
- apps/desktop/src-tauri/src/crypto/keychain_handle.rs (new)
- apps/desktop/src-tauri/src/crypto/mod.rs — register module behind crypto feature
- docs/contracts/tauri-commands-v0.md — adds §6.0.1 Keychain ↔ KeyVault opaque-handle boundary
- packages/keychain-opaque-handle/docs/dev_log.md (new)
- docs/workflow/roadmap/xai-g2-data-security-foundation.md row #5 → READY_TO_SHIP

Intended scope:
- Single authorised crossing between macOS Keychain bytes and the KeyVault opaque
  handle store.
- `load_kek_into_vault(key, vault) -> KeyHandleId` — secret_get + KeyVault::insert_kek
  + byte zeroization.
- `insert_kek_from_bytes(bytes, vault) -> KeyHandleId` — same for callers that hold
  bytes.
- Rust-internal `KeychainHandleError` — does NOT cross IPC.
- Documents the rule that `secret_get` MUST NOT surface KEK/DEK/device-private bytes
  to JS; allowed only for non-key material (refresh token, recovery transcript).

Cross-vendor checklist:
1. Zeroize semantics: in `insert_kek_from_bytes` the buffer is copied to a local
   `[u8; 32]`, then `bytes.zeroize()`. But the local `owned` array is moved into
   `vault.insert_kek(owned)`. Is it ALSO zeroized on the stack after vault takes
   ownership? Or does KeyVault::insert_kek itself zeroize on drop?
2. Concurrency: KeyVault is not behind a Mutex inside this helper — caller must
   own the synchronisation. Is the contract documented in api.md / dev_log?
3. Error mapping: doc says callers MUST map to JS-visible E11xx/E13xx. Is there a
   single helper `to_app_error()` we should add to make the boundary harder to
   forget?
4. Test coverage: 3 cargo (length reject / insert+zeroize / handle resolves back).
   Missing: integration test with the actual macOS Keychain (deferred OK), but a
   stub test for AppError pass-through (KeychainLocked → KeychainHandleError::Keychain)
   would catch future drift.
5. Doc/code alignment: §6.0.1 lists the rule but no automated grep gate enforces
   that `secret_get` is unused for key material. Worth a unit-test or
   `rg`-based CI rule?
6. Future-proofing: when SQLCipher PRAGMA path lands (G2.6 / G2.4 follow-up),
   does the helper signature suffice (just KEK), or does it need DEK / device-priv
   variants too? Currently `insert_dek_from_bytes` and `insert_device_private_from_bytes`
   are missing.
