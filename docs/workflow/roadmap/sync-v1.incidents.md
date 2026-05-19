# sync-v1 Incidents — 2026-05-19

This file records build failures, test failures, dependency conflicts, context pressure,
permission issues, and feature-level blockers from the 24h serial autorun.

| Timestamp | Feature | Incident | Impact | Action |
|---|---|---|---|---|
| 2026-05-19 02:17 PDT | startup | Dirty worktree existed before autorun start. | Requires scoped commits and care not to revert unrelated user/automation changes. | Treat pre-existing changes as external; commit only this run's intentional changes. |
| 2026-05-19 02:17 PDT | kdf-primitives (#3) | `cargo test --features crypto` emitted pre-existing `unexpected cfg` warnings for `keychain-it` in `platform/macos/keychain.rs`. | Tests passed; warnings are unrelated to #3 but add noise to crypto-feature test runs. | Leave for keychain follow-up; do not block #3. |
| 2026-05-19 02:17 PDT | kdf-primitives (#3) | First combined Cargo test invocation used two test filters and exited with Cargo usage error. | No code/test failure; corrected immediately with single filter `crypto::`. | Recorded for audit trail; final crypto tests passed. |
| 2026-05-19 02:17 PDT | aes-gcm-aead-core (#4) | `cargo test --features crypto` emitted the same pre-existing `keychain-it` warning. | Tests passed; warning is unrelated to #4. | Keep recorded as non-blocking. |
