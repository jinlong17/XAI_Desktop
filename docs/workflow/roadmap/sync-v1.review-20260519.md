# sync-v1 全量审查报告 — 2026-05-19

- Reviewer: A-Claude (read-only, simulates feature-verify; parallel batch sub-reviewers)
- Scope: 33 SHIPPED + 2 BLOCKED (#33/#54) + 2 BLOCKED_EXTERNAL (#9/#10) + Phase 5 PENDING chain
- Rules: docs/workflow/SOP_BUGFIX.md, docs/workflow/project/usage-guide.md
- Method: per-feature only-necessary-files; verdict PASS / NEEDS_PATCH / NEEDS_INVESTIGATION
- Constraint honored: no fabricated pass; reviewer did NOT edit any dev_log Status Panel / manifest status; read-only

## Executive summary

- **33/33 SHIPPED features PASS** simulated feature-verify. **Zero NEEDS_PATCH, zero NEEDS_INVESTIGATION.**
- **#33 / #54 BLOCKED — still genuinely valid** (artifacts committed; gates not runnable in this env: no JRE for TLC; recovery rehearsal deferred by autorun policy).
- **#9 / #10 BLOCKED_EXTERNAL — still valid** (Supabase project + Apple Developer account: human/external provisioning).
- feature-verify simulation found no code defect; **Phase 5 health check found one P0 build regression** (#18 `replaceAll` breaks `desktop#build`) the autorun missed → diagnosed (SOP_BUGFIX) → Codex `bug-fix` dispatched → A-Claude cross-vendor VERIFIED → resolved (commit `52e82b1`). Other findings are doc drift / cosmetics only (§Findings); no fabricated patches.
- Architecture red lines respected across the SHIPPED set: no plugin-to-plugin internal import; no Sync business logic in `apps/desktop/src/`; `packages/plugin-account/src/index.ts` is the sole public surface; crypto confined to Rust `crypto` feature + capability-allowlisted `crypto_*` commands.

## Phase 1 — Reconcile (manifest status vs dev_log Status Panel)

| Range | manifest vs dev_log | Notes |
|---|---|---|
| #1–#8 | consistent (all SHIPPED) | — |
| #11–#14,#16,#19 | consistent (all SHIPPED) | #16/#19 correctly carry roadmap defaults (cross-vendor=`no`); only #3,#4,#11–14,#24 were hand-promoted to A-Claude+yes per sync-v1.md:115 |
| #15,#21,#23,#24,#25 | status consistent (all SHIPPED) | **#15 manifest Note "TRUNK INTEGRATION DEFERRED" is STALE**: `git merge-base --is-ancestor 0481428 HEAD` = YES; all 6 core migrations are ancestors of active-branch HEAD and #21/#23/#24/#25 build on them. Doc-only drift. |
| #17,#18,#20,#22,#26,#27 | status consistent (all SHIPPED) | #26/#27 dev_log uses a terse table, not the full Status Panel contract (cosmetic doc deviation) |
| #28–#32,#34,#35,#36 | consistent (all SHIPPED) | — |
| #33 | consistent (BLOCKED `[!]`) | blocker valid (no JRE) |
| #54 | consistent (BLOCKED `[!]`) | blocker valid (rehearsal deferred by policy) |

No status mismatch requiring manifest/dev_log status correction. (Reviewer does not edit status per constraint.)

## Phase 2 — Per-feature verify simulation

All verdicts PASS. Evidence captured per batch (file:line in sub-review transcripts). Highlights of security-critical assertions confirmed present in code:

- **#3–#7 crypto primitives**: Argon2id RFC9106 KAT, AES-256-GCM detached-tag + AAD/tamper tests, deterministic CBOR blob/wrap/recovery schemas, BIP-39 checksum decode, envelope serialize/parse + nonce reconstruction + downgrade rejection.
- **#11 KeyVault**: `KeyHandleId(NonZeroU32)`, zeroize-on-drop/evict, wrong-kind guard, Debug redaction.
- **#12 X25519**: CSPRNG keygen, all-zero + low-order pubkey rejection, staging-byte zeroize.
- **#13 HPKE**: Base mode only (no Auth/Psk), `info != aad` enforced on BOTH seal and open.
- **#14 Ed25519**: `verify_strict` only (zero non-strict `.verify(`), E3014 on wrong-DEK/tamper.
- **#16 SQLCipher**: `db_key=HKDF(KEK,…)`, `cipher_compatibility=4`, strict 32-byte raw-key PRAGMA guard. *Advisory:* `PRAGMA cipher_compatibility=4` issued AFTER `PRAGMA key` — self-consistent + round-trip tested; relevant only to the already-deferred "SQLCipher CLI compatibility" gate.
- **#19 crypto-tauri-commands**: window-label allowlist `["account","control"]` enforced first-line in every handler incl. non-crypto-build stubs; non-allowlisted window → E3004; manifest.json declares exactly the 4 `crypto_*` commands.
- **#23 commit-seq**: SECURITY DEFINER + SET search_path + REVOKE FROM PUBLIC + regression guard + advisory-lock signature fix (no `pg_advisory_xact_lock(bigint,bigint)`).
- **#24 nonce-lease**: ownership + active-device FOR UPDATE + monotone non-overlap + `0xFFFFFF00` rekey threshold + append-only `used_nonces` UPDATE/DELETE triggers.
- **#25 RLS**: non-recursive `sync_jwt_device_is_active()` / `sync_jwt_device_id()` helpers avoid `sync_devices`-on-`sync_devices` recursion; 11-table policy set.
- **#28/#29 Edge cores**: mutation_dedup idempotency + conflict-shadow + 207; 32B/5min single-use challenge + canonical CBOR + E3014 paths.
- **#30 e2e**: same-txn todo+outbox, encrypted push/pull, server-dump opacity, stale conflict shadow.
- **#31**: 5 regression cases present (blob-swap AAD, E3015 rollback, no-proof 401/E3014, 10× idempotency=1 revision, allowlist denial via existing cargo test).
- **#32 rekey**: state machine + E3033 quarantine gate + E3028 proof/mnemonic gate + atomic swap migration.
- **#34**: 1000×100 device DB + fast-check cross-tenant/inactive leak = 0 (180 randomized probes over 1000×100 scale; acceptable interpretation).
- **#35**: RFC 9106/8032/9180 vectors + `ed25519-dalek =2.2.0` exact-pin assertion + verify_strict tripwire.
- **#36**: append-only audit triggers + HMAC device_hash + E3025 local-mirror mismatch.

Dependency compliance: grep of `packages/plugin-account/src/` for `@repo/plugin-*` / `plugin-*/src/` / `/internal/` = **zero matches**; cross-window comm via `@repo/core/events`; `apps/desktop/src/` Sync business-logic grep = zero (Host only listens/forwards menubar state).

## Findings (non-blocking; no Codex dispatch)

| ID | Feature | Type | Severity | Detail | Recommendation |
|---|---|---|---|---|---|
| F1 | #15 supabase-schema-migrations | Doc drift | P2 (doc) | Manifest Note `sync-v1.md:30` "TRUNK INTEGRATION DEFERRED — pending merge into active branch" is stale; migrations already ancestors of active-branch HEAD | Conductor (status-write authority) updates the #15 Note; reviewer does not edit manifest per constraint |
| F2 | #26 / #27 sync-engine | Doc contract | P2 (doc) | dev_log uses terse table, missing full Status Panel fields (Workflow/Executor/Suggested Next) | Backfill Status Panel during next touch; status itself correct |
| F3 | #27 sync-engine-pull | Cosmetic code | P3 | `sync-engine.ts:463-472` redundant rollback `if` + trailing unconditional `throw` of same error (dead branch, no correctness impact) | Optional cleanup; not a defect, no downstream block |
| F4 | #16 sqlcipher-local-db | Advisory | P3 | `PRAGMA cipher_compatibility=4` after `PRAGMA key` | Already covered by deferred "SQLCipher CLI compatibility" gate; verify there |

None of F1–F4 is a P0/P1 functional defect. SOP_BUGFIX Phase 3/4 produces no `NEEDS_PATCH` work item that justifies a Codex code dispatch (≤50 LOC, blocks-downstream priority). Fabricating a patch would violate the "不伪造通过 / Claude 不写业务代码" constraint. See `sync-v1.patches-20260519.md`.

## Phase 5 — Health check

| Gate | Initial | After P0-1 patch |
|---|---|---|
| `pnpm lint` | ✅ exit 0 (3/3) | ✅ |
| `pnpm build` | ❌ exit 2 — `desktop#build` TS2550 `replaceAll` in onboarding-backfill.ts:348 (web:build exit 130 = cascade abort) | ✅ exit 0 (3/3, desktop#build green) |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` | ✅ exit 0 (all suites pass, incl. 13-test crypto/menubar) | ✅ |

The build failure was a real **P0 regression** from #18 (autorun verification gap: never ran `desktop#build`). Diagnosed (SOP_BUGFIX Phase 0–4) and patched cross-vendor via Codex `bug-fix` (commit `52e82b1`), A-Claude VERIFIED. Workspace health is now fully green. Details: `sync-v1.patches-20260519.md` P0-1.

## Phase 6 — Console / Web start-gate evaluation

### Console start gate → **CAN_START (init + wave 0)** with one hard external caveat

Gate criteria (roadmap-prompts §1/§5.2 + goal spec):

- ✅ `#30 single-table-todos-e2e` SHIPPED + PASS (Phase 0.3 EXIT gate met).
- ✅ Sync 骨架 deps for Console wave-0 SHIPPED: account-login `#17`, realtime-channel-config `#21`, sqlite schema/driver `#15`/`#20`.
- ✅ No unpatched NEEDS_PATCH anywhere in #1–#36: the only defect (P0-1 #18 build regression) is now **patched + cross-vendor VERIFIED**; `pnpm build`/`lint`/`cargo test` all green.
- ⚠️ `#1–#30 全 SHIPPED` literal check: `#9` and `#10` inside that range are `BLOCKED_EXTERNAL`, **not** SHIPPED.
  - **BLOCKED_EXTERNAL impact analysis:**
    - `#9 supabase-project-provisioning`: by design does NOT block skeleton authoring (modeled as a `blocked-by` Note, not a hard edge — sync-v1.md R8). It DOES block any *hosted/live* Sync↔Console integration verification. All Sync server features (#15/#21/#23/#24/#25/#28/#29/#36) are locally Docker-verified only; live deploy is deferred until #9.
    - `#10 apple-developer-account`: gates signed-build Keychain ACL / MAS sandbox of the desktop app — **not a Console blocker** at all.
- **Verdict:** Console roadmap **init + wave-0 build CAN_START now** (skeleton + the three required SHIPPED deps satisfied, zero NEEDS_PATCH).
  - **Hard caveat:** every Console feature that needs *live* Supabase (hosted account auth, hosted Realtime, deployed Edge Functions) is `WAIT_FOR_GATES` until `#9` is provisioned. Console SQL/UI/skeleton authoring is unblocked; Console↔Sync hosted E2E is not.
  - **Blocking issues:** `#9` (external Supabase provisioning) for live integration only.
  - **Recommendation:** Start `Console init` → human review manifest → run Console wave 0. Mark Console rows that need hosted Supabase with `blocked-by: sync-v1#9`. Provision `#9` in parallel to unblock live verification before Console GA.

### Web start gate → **NOT_READY**

Gate criteria: Console Phase 2.5 complete (三栏外壳+业务模块 Stable) **AND** Sync 完整版本 (Phase 5) ready, incl. `#37 hardening-admission-gate` + §2.5 Sync 完成判定 (ALL_SHIPPED + 24h fuzz + 3 recovery rehearsals + RLS audit checklist).

- ❌ **Sync Phase 5 entirely PENDING.** `#37 hardening-admission-gate` is `PENDING` and depends on `#33 tla-protocol-model` which is still `BLOCKED` (blocker shifted: JRE now installed and TLC found two real model defects → both fixed in worktree but exhaustive verification on this machine hit `/dev/disk3s5` disk-full at 99% capacity — see `sync-v1.patches-20260519.md` P0-2). `#37` is the Phase 4.8→5 mandatory gate blocking **all** of #38–#56.
- ❌ §2.5 Sync 完成判定 unmet: no Phase-5 row shipped; `#47 fuzz-harness-24h` PENDING; recovery rehearsals `#52/#53/#55` PENDING and `#54` BLOCKED; RLS audit checklist not closed.
- ❌ Console roadmap not yet started (Phase 2.5 not begun).
- **Verdict:** **NOT_READY.**
  - **Blocking chain (updated 2026-05-19 after #33 unblock attempt):** JRE installed ✓; TLC found two model defects, both fixed in worktree (`M docs/spec/sync.tla` uncommitted), exhaustive TLC verify needs ≥20 GB disk (currently 7.2 GB free at 99% capacity). Free disk → re-run TLC → commit fix → #33 SHIPPED → `#37 hardening-admission-gate` → Phase 5 (#38–#56) → §2.5 Sync 完成判定 (24h fuzz #47 + rehearsals #52/#53/#54/#55 + RLS audit) → Sync 完整版本 ready. **In parallel:** Console must complete init→wave-N→Phase 2.5 Stable. **Plus:** `#9` provisioning for hosted Sync verification.
  - **Recommendation:** Do not start Web. **New critical path = free disk space** (≥20 GB on `/dev/disk3s5`) OR run TLC on a different machine, to verify the worktree fixes for `#33` → commit → unblock `#37`. Then Phase 5 + recovery rehearsals on real runtime, concurrently drive Console to Phase 2.5.

## Reconcile/patch authority note

Per goal constraint, this reviewer does not modify manifest status, manifest Notes, or dev_log Status Panels, and does not auto-ship. F1 (stale #15 Note) and F2 (sync-engine dev_log Status Panel backfill) are handed to the conductor / status-write-authorized role.
