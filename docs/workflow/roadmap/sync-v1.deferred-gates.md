# sync-v1 Deferred Gates — 2026-05-19

This file records gates intentionally deferred during the 24h serial autorun.
Deferred means "not verified here"; it does not mean passed.

| Timestamp | Feature | Gate | Reason | Follow-up |
|---|---|---|---|---|
| 2026-05-19 02:17 PDT | supabase-project-provisioning (#9) | Supabase staging/prod project, billing, region, deploy verification | External account/human provisioning gate; manifest remains `BLOCKED_EXTERNAL`. | Provision Supabase staging+prod, then resume dependent deploy verification. |
| 2026-05-19 02:17 PDT | apple-developer-account (#10) | Apple Developer signed-build Keychain ACL / MAS sandbox verification | External account/human provisioning gate; manifest remains `BLOCKED_EXTERNAL`. | Provision Apple Developer account and signed-build path, then rerun Keychain/MAS gates. |
| 2026-05-19 02:17 PDT | kdf-primitives (#3) | Human review and cross-vendor verify | 24h autorun contract says not to stop at normal review gates; manifest requires `Verify Cross-vendor: yes`, but this serial Codex session cannot provide independent vendor verification. | Run independent feature-verify later before relying on #3 for higher-risk downstream crypto. |
| 2026-05-19 02:17 PDT | aes-gcm-aead-core (#4) | Human review, cross-vendor verify, FR-SY-12 release benchmark | 24h autorun skips normal review gates; manifest requires `Verify Cross-vendor: yes`; debug unit tests are not valid evidence for `<0.5ms encrypt 1KB P95`. | Run independent feature-verify and release-mode benchmark before relying on #4 for downstream envelope/KeyVault rows. |
| 2026-05-19 02:17 PDT | deterministic-cbor-aad (#5) | JS/Python cross-implementation vector verification and blob-swap integration | Local autorun implemented Rust fixtures only; `cbor-x`/`cbor2` CI path and envelope/sync-engine integration do not exist yet. | Run Rust+JS+Python vector equality in CI and blob-swap decrypt-failure test once downstream rows exist. |
| 2026-05-19 02:17 PDT | cipher-envelope-codec (#7) | Full cargo-fuzz / 24h fuzz coverage | This row added malformed input unit tests only; full fuzz harness is independently scoped to #47. | Run #47 `fuzz-harness-24h` before GA. |
| 2026-05-19 02:44 PDT | bip39-mnemonic-24w (#6) | Formal independent review / admission-gate sign-off | Local Rust and JS smoke agree on the canonical fixture, but the 24h autorun contract skips human review and normal gate sign-off. | Run independent review before treating #6 as hardening-gate evidence for #37. |
| 2026-05-19 02:49 PDT | rust-keyvault-opaque-handle (#11) | Human review, cross-vendor verify, and Tauri capability allowlist enforcement | Manifest requires `A-Claude` + `Verify Cross-vendor: yes`; this serial Codex run cannot provide independent vendor verification. Capability enforcement belongs to downstream `crypto_*` command/gate rows. | Run independent security review; enforce and test plugin-account/core-data-only `crypto_*` capability allowlist in #19/#31/#37. |
