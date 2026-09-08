# hpke-per-device-wrap — Dev Log (Workflow State Machine)

## 2026-05-20 14:55 PDT

- Implemented per-device DEK wrap using X25519 shared secret plus AES-256-GCM local HPKE-style envelope.
- Enforced distinct `info` and `aad`.
- Verification: `pnpm --filter @repo/hpke-per-device-wrap test`; package `check-types`.

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | hpke-per-device-wrap |
| Title | HPKE per-device DEK wrap |
| Roadmap | sync-v1 · feature #13 · wave W1 · Phase 0.3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | ed25519-recovery-signing (#14) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 02:58 PDT |

## Phase Plan

### Phase 1 — HPKE wrap primitive [DONE]

- Added fixed-suite HPKE Base-mode seal for resident DEK handles.
- Added recipient public-key validation and `info != aad` enforcement.

### Phase 2 — HPKE open into KeyVault [DONE]

- Added unwrap with resident device-private handle.
- Inserted recovered DEK into KeyVault and returned an opaque handle.

### Phase 3 — Tests and docs [DONE]

- Added round-trip, info/aad, AAD mismatch, and low-order public-key tests.
- Added design/api/test/dev_log docs.

## Deferred Gates

- Human review and cross-vendor verification are deferred. See `docs/workflow/roadmap/sync-v1.deferred-gates.md`.
- RFC 9180 official vector CI gate is deferred to #35.
- Supabase `device_dek_wraps` write-path integration is deferred.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 02:58 PDT | Codex serial autorun | Implemented #13 HPKE per-device DEK wrap/open, KeyVault integration, docs, and tests. | local commit `feat(hpke-per-device-wrap): add HPKE DEK wrapping` | ed25519-recovery-signing (#14) |

## 2026-05-20 P0 Fix - HKDF-SHA256 KDF

- Prompt reference: "Track E P0-1 修复 — packages/hpke-per-device-wrap/ 的 deriveAesKey 不是真 HKDF。"
- Replaced the ad-hoc `SHA256("xai.hpke.wrap.v1" || sharedSecret || info)` KDF with RFC 5869 HKDF-SHA256 using fixed salt `xai.hpke.wrap.v1.salt`, caller-provided `info`, and 32-byte output for AES-256-GCM.
- Kept suite name `X25519-HKDF-SHA256-AES256GCM`; implementation now matches the advertised suite.
- Added deterministic X25519/HKDF/AES-GCM vector coverage for fixed keys, IV, DEK, info, and AAD.
