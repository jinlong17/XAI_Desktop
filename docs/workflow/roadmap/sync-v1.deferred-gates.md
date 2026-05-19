# sync-v1 Deferred Gates — 2026-05-19

This file records gates intentionally deferred during the 24h serial autorun.
Deferred means "not verified here"; it does not mean passed.

| Timestamp | Feature | Gate | Reason | Follow-up |
|---|---|---|---|---|
| 2026-05-19 02:17 PDT | supabase-project-provisioning (#9) | Supabase staging/prod project, billing, region, deploy verification | External account/human provisioning gate; manifest remains `BLOCKED_EXTERNAL`. | Provision Supabase staging+prod, then resume dependent deploy verification. |
| 2026-05-19 02:17 PDT | apple-developer-account (#10) | Apple Developer signed-build Keychain ACL / MAS sandbox verification | External account/human provisioning gate; manifest remains `BLOCKED_EXTERNAL`. | Provision Apple Developer account and signed-build path, then rerun Keychain/MAS gates. |
| 2026-05-19 02:17 PDT | kdf-primitives (#3) | Human review and cross-vendor verify | 24h autorun contract says not to stop at normal review gates; manifest requires `Verify Cross-vendor: yes`, but this serial Codex session cannot provide independent vendor verification. | Run independent feature-verify later before relying on #3 for higher-risk downstream crypto. |
