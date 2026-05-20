# Codex Feature Post-merge Review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass).
Your job is to audit a Track A feature that has already been built and committed to
`codex/track-a-desktop-foundation`. The original executor was Claude Code; you provide an
independent cross-vendor verdict.

## Hard output contract

Output ONLY the markdown block below — no preamble, no follow-up, no chatter. Keep total
length under 600 words.

```md
## Codex Cross-vendor Review

**Feature**: keychain-opaque-handle
**Commit(s)**: d1fe45a
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: APPROVED | REVISE | BLOCKED

### Strengths (max 4 bullets)
- …

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0|P1|P2] …

### Concrete next-phase targets (max 6 bullets)
- …

### Out of scope confirmed
- …
```

## How to evaluate

1. Read the listed dev_log and contract docs to understand the *intended* scope.
2. Run `git show --stat d1fe45a` mentally — review the diff for the listed files.
3. Score against:
   - **Contract integrity** (red lines #4 / #8 / #9 in `docs/SYSTEM_ARCHITECTURE.md` §4)
   - **Test coverage adequacy** (boundary, error, concurrency, capability)
   - **Doc-code alignment** (`docs/contracts/*` matches actual surface)
   - **Security boundary** (raw key bytes, capability allow-list, IPC payload)
   - **Workflow V2 hygiene** (dev_log Status Panel, Work Log row, commit message Why/What/Scope/Risk)
   - **Future-proofing** (does the design accommodate the next 1-2 G2/G3 rows?)
4. Verdict guidance:
   - **APPROVED**: ship-ready; gaps are P2-only and recorded.
   - **REVISE**: at least one P1 issue worth fixing before next phase.
   - **BLOCKED**: at least one P0 issue (broken contract, missing test on critical path, security regression).
5. Concrete next-phase targets must be small, mergeable items (each ≤ half a day).
6. Out-of-scope: confirm which deferred gates remain valid (live Supabase, MAS sandbox, real
   macOS Finder smoke, etc.) — call them out so the next agent does not re-investigate.

## Feature-specific context

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
