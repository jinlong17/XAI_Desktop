# sync-v1 — Day-Level Task Plan (planning-with-files)

> Complementary to `docs/workflow/roadmap/sync-v1.md` (the wave/feature manifest, source of state).
> This file is the **day-level progress view** that survives context resets. Manifest = WHAT/eligibility;
> this = WHEN/sequence/notes. Update the checkbox here when a manifest row reaches SHIPPED.
> Source: PRD v0.6-DRAFT §10 + dev-plan v0.6 §3. Generated 2026-05-14.

## Status legend
`[ ]` not started · `[~]` in progress · `[x]` SHIPPED · `[!]` BLOCKED · `[E]` BLOCKED_EXTERNAL

---

## Phase 0 子阶段 0.3 — Sync MVP skeleton (dev-plan §1.1, est. 18–24 work-days)
> Exit: two Macs same account+secret_key see each other's new todo within 5s; server dump cannot decrypt any todo.

### Day 0 — kickoff & external provisioning
- [x] #1 roadmap-kickoff — scaffold plugin-account + core-data + EventMap account:* + useTauriInvoke + AppError E3xxx + PLUGIN_MAP rows
- [E] #9 supabase-project-provisioning — **human action**: register Supabase staging+prod + billing (PRD §12.1) — unblocks #15/#28/#29 deploy
- [E] #10 apple-developer-account — **human action**: Apple Developer account — unblocks signed-build Keychain/MAS verify of #8/#17

### Day 1–5 — pure crypto primitives + schema (parallel after #1)
- [x] #2 crypto-deps-lockdown (dev-plan §3.1 / GAP-T3') — pin + cargo audit/deny CI gate FIRST
- [x] #3 kdf-primitives (T-06 argon2.rs/kdf.rs)
- [x] #4 aes-gcm-aead-core (T-06 aes_gcm.rs)
- [x] #5 deterministic-cbor-aad (T-06 aad.rs)
- [x] #6 bip39-mnemonic-24w (T-06 mnemonic.rs)
- [x] #7 cipher-envelope-codec (T-06 envelope.rs)
- [x] #8 keychain-bridge-macos (T-10)
- [x] #15 supabase-schema-migrations (T-02) — authoring; deploy waits on #9
- [x] #21 realtime-private-channel-config (T-04) — config only

### Day 3–9 — key hierarchy + account + KeyVault + SQLCipher
- [x] #11 rust-keyvault-opaque-handle (T-08)
- [x] #12 x25519-device-keypair (§4.2 C-A)
- [x] #13 hpke-per-device-wrap (§4.2 C-D / RFC 9180)
- [x] #14 ed25519-recovery-signing (§4.2 C-A)
- [x] #16 sqlcipher-local-db (T-11)
- [x] #17 account-signup-login (T-09)
- [ ] #18 onboarding-backfill-ui (FR-AC-09)
- [x] #19 crypto-tauri-commands (T-08 / §4.2 capability allowlist)
- [x] #20 core-data-sqlite-driver (dev-plan §2)
- [ ] #22 menubar-sync-status-icon (T-16)

### Day 6–12 — sync engine + edge functions + single-table E2E
- [x] #23 commit-seq-authority (H-4/H-A)
- [ ] #24 nonce-lease-server (C-B/C-C)
- [ ] #25 rls-policies-and-tests (T-03)
- [ ] #26 sync-engine-push (T-12)
- [ ] #27 sync-engine-pull (T-12)
- [ ] #28 push-edge-function (T-14)
- [ ] #29 recovery-proof-edge-function (T-13)
- [ ] #30 **single-table-todos-e2e (T-15/17/18/19) — Phase 0.3 EXIT GATE** (PRD §10.1 + ZK PoC + SQLite-dump PoC)

---

## Phase 4.8 — Protocol-hardening milestone (dev-plan §1.2, est. 3–4 weeks)
> ⚠ TLA+ / property tests precede implementation. **Mandatory gate before any Phase-5 entity wiring.**

### Week A — AAD / revision / recovery proof / idempotency / capability
- [ ] #31 protocol-integrity-integration-tests (T-A1/A2/A3/A4/B4/B5)
- [ ] #35 rfc-test-vectors-gate (GAP-T3' / RFC 9106/8032/9180/8949)

### Week B — Re-key full chain + TLA+ + RLS fuzz + audit integrity
- [ ] #32 rekey-two-phase (T-B1, kill-9 ×4)
- [ ] #33 tla-protocol-model (T-B2, ≥6 scenarios)
- [ ] #34 rls-fuzz-property (T-B3, 1000u×100d)
- [ ] #36 audit-log-integrity (GAP-T1 / NEW R-10.26)

### Gate
- [ ] #37 **hardening-admission-gate (T-B7) — PRD §10.x 10-item, BLOCKS ALL PHASE 5**

---

## Phase 5 — Sync polish (dev-plan §1.3, est. 6–7 weeks)
> Every row gated by #37 hardening-admission-gate.

### Week 1 — Realtime + all entities
- [ ] #38 realtime-subscription (T-21/22/25)
- [ ] #39 all-entity-types-wiring (T-23/24)

### Week 2 — Offline + multi-device
- [ ] #40 offline-outbox-resilience (T-30~34/56)
- [ ] #41 device-list-remote-revoke (T-35)
- [ ] #50 device-pairing-anti-abuse (GAP-T2 / NEW R-10.27)

### Week 3 — Recovery + Re-key + quota
- [ ] #42 mnemonic-full-recovery (T-41)
- [ ] #43 quota-rate-limit (T-43/44/45)
- [ ] #45 oauth-passkey (FR-AC-06 / H-12)

### Week 4 — Export / deletion / hardening / fuzz / drills
- [ ] #44 data-export-encrypted (T-50)
- [ ] #46 supply-chain-hardening (T-82 / R-18)
- [ ] #47 fuzz-harness-24h (T-52, INDEPENDENT 24h)
- [ ] #48 credential-rotation-sop (T-57)
- [ ] #49 sync-audit-conflict-ui (T-34)
- [ ] #51 account-deletion-gdpr (T-51)
- [ ] #52 recovery-rehearsal-1-server-wipe (T-53, §10.2 ①)
- [ ] #53 recovery-rehearsal-2-local-wipe (T-54, §10.2 ②)
- [ ] #54 recovery-rehearsal-3-rekey-kill9 (T-55, §10.2 ③)
- [ ] #55 recovery-rehearsal-4-device-revoke-rekey (T-55b, §10.2 ④)

### GA gate
- [ ] #56 **ga-acceptance-suite — PRD §10.2 13-item + §10.3 M6** (2-Mac+1-browser, property 100k, kill-9 ×100, toxiproxy, all PoCs, R-10.1~R-10.27 closure)

---

## Completion gates (PRD dev-plan §7 / §2.5 roadmap-prompts)
- [ ] manifest sync-v1.md → `ALL_SHIPPED`
- [ ] fuzz harness 24h, 0 crash + 0 panic (#47)
- [ ] 4 recovery rehearsals all pass per rehearsal script (#52–#55)
- [ ] RLS audit checklist fully ticked (dev-plan §5.6)
- [ ] REVIEW-2026-05-15.md Critical + High all closed; R-10.1~R-10.27 each has test/drill record
