# Roadmap Seed — rekey-two-phase

> sync-v1 roadmap · feature #32 · wave W3 · Phase 4.8
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-B1
> Status hint: PENDING

## Requirement
Implement the full FR-SY-13 two-phase Re-key flow (user-triggered + device-revocation-triggered): keyring staging insert, emergency quarantine of the old key_id, donor generates DEK_v_n+1 + new 24-word mnemonic + new recovery_signing_keypair, blocking mnemonic backfill UI, Ed25519 recovery-proof PATCH, HPKE-seal new DEK to all active device pubs, batch re-encrypt to staging_blobs, atomic server swap; with `kill -9` at 4 critical points.

## Hard constraints
- v0.6 H-7 emergency quarantine: revoking a device → immediately set `accounts.key_quarantine_at = now()` → old key_id rejects new writes (`/sync/push` → E3033 key_quarantined); un-revoked devices keep local offline read + export; quarantine clears only after blocking new-mnemonic backfill completes (FR-SY-13).
- Atomic two-phase: (a) keyring INSERT new key_id status='staging'; (b) set quarantine; (c) donor generates DEK_v_n+1 + new mnemonic + new recovery keypair; (d) UI-blocking 6-word backfill; (e) Ed25519 recovery-proof PATCH recovery_signing_pub_v_n+1; (f) HPKE_seal DEK to all active device pubs; (g) batch re-encrypt → staging_blobs; (h) server atomic swap current_dek_key_id + old key_id status='retired' + clear quarantine; incomplete c-h → quarantine persists (FR-SY-13).
- staging_blobs preserves original entity revision (only swaps key + `rekey_session_order`); `kill -9` at init / staging 30% / staging 70% / before-swap / after-swap → consistent (unswapped → rollback+retry; swapped → continue, keyring dual-read) (FR-SY-13 H-5, R-10.6).
- Re-key MUST sign new recovery_signing_pub_v_n+1 with old recovery_signing_priv else swap forbidden + E3028; un-confirmed mnemonic → E3028 (FR-SY-69 v0.5 C-D, R-10.25).
- Code boundary: Re-key orchestration in `packages/plugin-account/`; crypto via Rust `crypto_*` commands; swap SQL in Edge Function service_role (codebase-orientation §6, CLAUDE.md §Code Boundaries).

## Threat model binding
- T11 (FR-SY-13 C-D + H-7 device revocation Re-key); R-10.6 (rekey interrupt corruption 🔴), R-10.11 (revoked device decrypts new data), R-10.25 (Re-key invalidates old mnemonic).
- STRIDE Tampering — Re-key operation chain (stride-cve.md §2.4 T11; AUD note Re-key chain).

## Acceptance signal
Re-key end-to-end (user + revocation triggered) with staging_blobs dual-write; `kill -9` at all 4 (+init) points → data consistent on restart (unswapped rolled back, swapped continued); old mnemonic fails / new mnemonic succeeds post-Re-key (dev-plan T-B1, §5.5 rehearsal ③④).

## Dependencies (advisory — manifest is authoritative)
Depends On: hpke-per-device-wrap, ed25519-recovery-signing, single-table-todos-e2e (all shipped).
