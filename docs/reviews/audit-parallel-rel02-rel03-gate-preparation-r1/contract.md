# REL02+03 / GATE-PREPARE r1 — proposal, not acceptance

Module: **web**, local browser persistence/account isolation; workflow C preparation under sole A-Codex root, supporting the scope-map primary-workflow D REL02/REL03 nodes without changing their attribution. Fixed preparation parent `5bcc15d937ee8bd9880ccf6ad5dba205178f793c`; fixed card input `1cc4caedcb3398e72eb5f017409820877b57b681`; task card is exactly `parallel-control-r1/tasks-P5.json` REL02+03/GATE-PREPARE. Product P0 is `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Original goal, authority overlay and r2 scheduler are frozen inputs; the scheduler's historical UNACCEPTED wording is not authority for this worker to adopt it. Root controls actual active pointer and exclusive receipt lease.

**Disposition: preparation delivered; fresh contract review required. REL-02 can proceed to actual other-vendor source/evidence verification after review. REL-03 requires current integration evidence reconciliation and, if the bounded gap below remains, one qualified delta-only native supplement before final acceptance. Neither item is accepted here.** No current product defect is declared merely from source drift. Historic functional PASS remains valid at its own SHA; a current whole-graph PASS has not been established by this preparation.

## 1. Complete original obligations and unchanged state

Original ALL-TODO-CURRENT entries, verbatim:

- [ ] **REL-02 · 待完成验收；功能验证已通过，跨工具工作流验收待完成 · P1 · 修复**：修复Auth与device共用IndexedDB但分别初始化object store的冲突。验收：全新profile中session→device、device→session和并发初始化均成功，老库迁移保留数据。
- [ ] **REL-03 · 待完成验收；功能验证已通过，跨工具工作流验收待完成 · P1 · 修复**：对业务内容和BYOK密钥按账户隔离，区分设备级偏好。验收：A退出后B不读到A内容/key；未归属旧数据迁移有明确选择和回退。

Complete EXECUTION.json records, unchanged (not a selected evidence subset):

```json
[
  {
    "id": "REL-02",
    "status": "verification_pending",
    "evidence": [
      "../web-auth-device-session/20260909-rel02-verification.md",
      "../web-auth-device-session/verify-browser-idb.mjs",
      "commit:0141ecb",
      "commit:f578ae8",
      "commit:f15aceb",
      "../web-auth-device-session/rel02-queue-review.test.ts",
      "commit:5803e86",
      "../web-auth-store-independent/20260909-review.md"
    ],
    "functional_status": "passed",
    "workflow_status": "cross_tool_verification_pending"
  },
  {
    "id": "REL-03",
    "status": "verification_pending",
    "evidence": [
      "commit:44fa05c",
      "../web-account-data-isolation/20260909-rel03-diagnosis.md",
      "commit:ebb91c2",
      "commit:85451f6",
      "commit:e1cbe5c",
      "commit:575cfd9",
      "commit:fae9398",
      "commit:5ae7b7a",
      "commit:23b83e4",
      "commit:96d1914",
      "../web-account-data-isolation/20260909-host-integration.md",
      "commit:992f688",
      "commit:9638dbe",
      "../web-account-data-isolation/20260909-joint-independent-review.md",
      "commit:f02ca28",
      "../web-account-scope-current-independent/20260909-review.md"
    ],
    "functional_status": "passed",
    "workflow_status": "cross_tool_verification_pending"
  }
]
```

Full EXECUTION.md, EXECUTION.json and ALL-TODO-CURRENT bytes are in the index. Keep `functional_status=passed`, `workflow_status=cross_tool_verification_pending`, composite `verification_pending`. Formal counts remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending = 312; 299 unclosed**. Neither another caller's acceptance nor this contract changes any count. Parent alone may append accepted evidence after final acceptance and must compare every ID/status before/after. No automatic completed conversion.

## 2. Freeze format and independently checked source identity

`inputs.sha256` uses `SHA256  git:<full-commit>:<repo-path>` for immutable Git blobs and `SHA256  file:<absolute-path>` for the original objective. Recheck each record by reading `git show <commit>:<path>` bytes (binary safe), not by hashing its label. Every referenced blob was read and its Git blob SHA-1 recomputed before its SHA-256 was recorded. The index itself is output, not a recursive self-input.

Source envelope intentionally includes **all package/app-Web source and package/build/test configs** at P0 and both historical acceptance snapshots, plus lockfile/workspace/root package metadata. This conservative superset prevents accidental exclusion of side-effect owner registrations or indirect @repo consumers; it is a read lock, not permission to execute or modify all packages. Tests are frozen as source only. Runtime dependencies are not attested by package filenames: a future execution must verify actual resolution and lockfile identity. All source-closure equality claims below are path-specific; the entire graph is not declared equal.

{
  "records": 5616,
  "evidence_paths": 309,
  "p0_envelope": 1673,
  "sha256": "c81e60b6a21f9ec4cecc631dab6a299c169e83e6c2d32f877b0aedb24e611b31",
  "historical_provenance_extra_records": 439
}

Checks made in this static pass:

- REL02 full `packages/web-auth-device-session` Git tree equals `a73faa6ef0b3811488657326f0e6582618564d43` at 8e50d8f and P0. No package source/docs/config drift; root package.json, pnpm-workspace.yaml and pnpm-lock.yaml are also unchanged over that interval. `storage.ts` runtime imports idb-keyval; Supabase SupportedStorage is a type import. The source/config snapshots and lockfiles are frozen separately, so downstream auth or provider behavior is not inferred from this package equality.
- REL03 `AccountDataGate.tsx`, `AccountDataGate.css`, `accountOwnership.ts`, AI `secretStore.ts`, host `AccountStorageGate` and auth provider are unchanged from 5803e86 to P0; **the complete closure is not**: accountScope, migration, migration validation, lifecycle, hooks, consumer registrations, AI UI and actual App sign-out integration changed. Appendix B lists every changed file in the three directly inspected roots including tests.
- `accountScope.ts`, `accountMigration.ts`, `accountMigrationValidation.ts`, `accountCoordination.ts` and `secretStore.ts` equal c201a1d at P0. Migration now uses generation-independent account-exclusive locks, verifies copied source key sets/raw bytes after awaited secret work, and understands canonical command envelopes. The native lock adapter preserves its receiver and explicit mode. Original c201a1d migration7/native3+reopen1 evidence is relevant, not to be discarded or relabeled as P0 whole-graph proof.
- Storage `accountDataLifecycle.ts`, `accountDeletionReceipt.ts` and Settings `accountDeletionRecovery.ts` equal accepted a1f73c9 at P0. Reuse the complete bounded acceptance chain (`5a97d53`); do not reopen repaired tombstone/raw-token cases merely because REL03's old eight-check runner predates them.
- Parent versus P0 has exactly four package documentation differences: Time Tracker `docs/{api,design,dev_log,test}.md`. They are deliberately frozen at parent, while runtime uses P0. They are neither runtime drift nor authority to substitute TT acceptance for REL02/03. No runtime/apps/lockfile change was found in this comparison.

## 3. Historical evidence and failures retained

The index includes all files in REL02 auth-device/auth-store and REL03 account-data/account-scope review directories, their owner package docs, auth lifecycle/deletion evidence, migration-race/coordination/deletion native families, relevant D2 foundation/Settings reviews, fixtures and raw logs. Source-specific reports must be read with their raw artifacts and executable assertions. Report prose is not a new execution receipt.

| Chain | Frozen results and limitations |
|---|---|
| REL02 initial schema repair | 0141ecb/f578ae8; 52 package tests, initial five native scenarios. dump-dom/virtual-time first probe timed out RUNNING: retained as reported failure, no standalone raw log located in the named initial directory. Claude process exited 401 before review; report is the available record, never vendor PASS. |
| REL02 warm connection race | Original 52 missed alpha write concurrent beta extension; `InvalidStateError` reproduced; f15aceb queues complete operations. 53 package tests/six native groups; separate three queue tests cover synchronous failure, abort, warm read/extension. Original report retains all this; absence of separate early raw files is disclosed, not recreated. |
| REL02 latest independent | 5803e86 report at full 8e50d8f product; native.ts plus native.log contain nine groups, native IndexedDB isolated profile. No hosted auth or full UI multi-window claim. |
| REL03 initial leaks/host | 44fa05c diagnosis's two characterization PASS tests prove pre-fix leaks. Same-account announcement and auth guard routing failures repaired; host independent 6 tests. Initial host gate probe's viewport/wait adjustment is disclosed. AI author excluded own AI implementation from independent host acceptance. |
| REL03 production registration failure | Original joined before log FAILs with unavailable owner validators due to sideEffects tree-shaking. 96d1914 repair; final 9638dbe joined eight checks, owner38, Settings41, host6 plus deletion reload. Preserve original before and after logs and annotation warnings. |
| REL03 latest independent | f02ca28 at full 5803e86: current native joined eight and actual Gate nine listed business checks. Initial fixture importing a conflicting category correctly refused; corrected rollback fixture uses a distinct private key. This is a fixture correction, not silent product acceptance. Gate props are synthetic identity, not hosted Supabase login. |
| Later shared source | Migration 2dc5333: 1 control/2 correct FAIL; 946ded3: 2 controls/3 correct FAIL; c201a1d:7 PASS. Native e9ff409 lock adapter 3 FAIL; e9fb5e7 then c201a1d 3+reopen1 PASS. Foundation c201a1d still had deletion admission2 FAIL; subsequent strict durable receipt slice reaches a1f73c9 accepted at5a97d53. Preserve intermediate blocked reviews and all raw failure/repair logs. |
| Current P0 bounded evidence | AppRail acceptance at f9eb4b1 retains actual App sign-out/departure/captured-owner source guards. Its storage-unchanged suite is **imperative+registry 31**, not migration/secret/Gate verification. It cannot replace REL03 original migration and key acceptance. |

No historical result is rerun in this task. Old failure logs never become PASS because a later caller passed. Broad runtime coverage labels remain limited to their exact fixtures, identity seams and tested source.

## 4. REL02 complete acceptance matrix

All rows map to `web-auth-store-independent/native.ts` and its native.log at8e50d8f (nine groups); the initial six and independent queue fixtures supply historical corroboration. Latest raw log is aggregate count9; exact row expectations live in frozen native.ts. The actual vendor must reconcile both, not invent row-level raw logs.

| ID | Original behavior / business oracle | Reuse / residual |
|---|---|---|
| R2-01 | Fresh DB session then device, both values readable; schema v2, exactly two stores | Historical native group1, complete package equality; source/evidence verification only |
| R2-02 | Fresh DB device then session, same two persisted values/schema | group2; same |
| R2-03 | Fresh DB simultaneous initial writes, both success and values | group3; same |
| R2-04 | v1 session-only legacy value unchanged, device becomes writable | group4; same |
| R2-05 | v1 device-only legacy value unchanged, session becomes writable | group5; same |
| R2-06 | Warm custom alpha write concurrent beta schema extension preserves alpha old/new and beta new | group6 + warm-read independent queue test; same |
| R2-07 | Blocked native upgrade rejects, late request abort/close, blocker closes, retry succeeds, originals retained | group7; same |
| R2-08 | Real transaction abort rejects/no failed value committed; later schema extension succeeds, old value remains | group8 + independent queue test; same |
| R2-09 | Native synchronous DataError rejects; queue releases and next valid write commits | group9 + independent queue test; same |

A genuine actual-vendor read-only verification may execute binary-safe hash/source/diff/raw-assertion checks as its verification procedure under workflow §8; it need not repeat these valid native batches. If reviewer finds environment/dependency drift relevant to any row, it must name that exact dependency and row first, retain pending, and request a separately reviewed bounded supplement. Credentials or model label never satisfy any row.

## 5. REL03 complete original acceptance and delta matrix

J1–J8 are exactly the eight check labels in `web-account-scope-current-independent/20260909-native.log`; G1–G9 are exactly the nine in `20260909-native-gate.log`, with runner source giving their precise assertions.

| ID | Obligation and exact historic check | Current source / evidence decision |
|---|---|---|
| R3-01 | A sign-out then B: no A content or key; actual unauthenticated gate hides children/key; B opens empty; stale A setter rejects | G7/G8, J5; auth/gate/secret files equal but surrounding App/storage closure changed. P0 AppRail sign-out corroborates host behavior only. Integrated N1 below remains to reconcile. |
| R3-02 | A re-login restores prior private data/key; pending A encryption cannot publish to B | J5 and J7 reopen-A, G6 A key retained. Secret implementation equal; compare imported storage/locks and synthetic boundary explicitly. N1 checks this combination only if no exact P0 prior artifact proves it. |
| R3-03 | Device preferences remain separate; device theme and unowned raw bytes unchanged after switch/deletion | J7/J8/G9; ownership manifest unchanged. Preserve all declared device/account keys and open-ended private keys; no prefix-based new ownership decision. |
| R3-04 | Explicit unowned choices: default unchecked, Decide later stays locked, empty/Continue opens empty, originals untouched | G1/G2/G3; unchanged Gate plus changed migration graph means historic UI PASS is retained, N1 integrates current graph. |
| R3-05 | Selected content import, separate secret consent, raw/ciphertext archive byte equality; existing A key/private content retained | J1/J2, G4; native host validators must survive production annotations. New canonical envelope validation is covered by later source tests, not inferred from original Tasks fixture. N1 preserves raw/ciphertext and current owner registration check. |
| R3-06 | Failed final generation marker never publishes partial content/key; previous generation visible and originals preserved | J3; source guard now stronger, unchanged since c201a1d. Reuse source mutation7 and native lock3 with explicit limits; no broad rerun. |
| R3-07 | Actual Undo import restores prior generation/data/key; stale generation handles revoked; Continue does not publish early | J4/G5/G6, G4 before-Continue assertion. N1 verifies actual current Gate + native locks/BYOK combination. |
| R3-08 | Demo distinct from live account and cannot claim unowned production legacy | J6; unchanged gate/secret+source rules. Source/evidence proof; no additional native batch without identified delta. |
| R3-09 | Captured A export/delete while B active preserves B content/key, device and quarantine; JSON receipt + IDB fault safely retries | J7/J8; reuse later a1f73c9 bounded deletion accepted chain and native4+reopen4 with equal core source. Original old sync helper runner is not sufficient current coordinated-caller proof. Full REL04/REL06 remain open. |

The original diagnosis's **nine required regression groups** are preserved, not silently reduced to the two numbered TODO sentences: (1) A→signout→B/directA→B/all feature repositories/search/widgets/statistics/AI and A relogin; (2) same-user refresh, loading/unconfigured/unauthenticated/demo; (3) pending autosave/KDF/key-test/stream/tool/timers/stale auth completion; (4) device preference vs account list/category state; (5) all migration choices, invalid/empty/populated/duplicate/decrypt/repeat/rollback; (6) LS/IDB/quota/close/crash/commit/rollback/competing/legacy mutation faults; (7) same/different-account tabs and scoped notifications; (8) captured export/reset/delete/cache ownership; (9) package/types/browser two synthetic identities, hosted auth separately. Freeze the diagnosis and all test bodies. Historical acceptance was explicitly bounded and did not replay every entity lifecycle or all nine groups end to end. Vendor must label each sub-obligation **direct proof / bounded corroboration / residual**, cite precise tests/raw records, and not expand REL03 completion into universal D2/REL04/REL06/server acceptance. Any genuine unresolved requirement inside original REL03 A/B/content/key/migration-choice/rollback scope blocks that item; general unconverted-writer rollout outside it remains separately open, never silently waived.

## 6. Minimum new evidence, only after independent scope review

First other-vendor static verification must build a complete row-to-source-to-evidence table from this frozen corpus. New cases are authorized only if this identifies the current-combination gap; there is no automatic rerun of the old nine/eight/nine batches.

**N1 — current native local integration, one bounded suite (proposed, not executable/approved here):** use immutable P0 archive and actual production host registration graph, actual AccountDataGate and secret migration participant, native localStorage/IDB/WebCrypto/Web Locks, disposable localhost profile and synthetic A/B identities. One explicit journey: initial all unchecked → Decide later (no private hydration) → empty/Continue → A private non-conflicting content plus actual encrypted BYOK → management selected Tasks import with original noncanonical raw plus separately selected synthetic legacy secret → validate all currently declared owner validators and canonical-envelope acceptance/refusal using frozen accepted source contracts → no children before Continue → actual Undo restores A prior content/key/generation → sign-out state → B empty/content+key exclusion/stale A write refusal → A reopen. Assert original legacy raw/ciphertext/device bytes at every publication/rollback/switch, committed-marker identity, lock name/mode, zero unintended data removal, and no late A crypto publication. A separate unowned unknown/corrupt record stays untouched. Existing populated selected-category conflict remains refusal; never change product policy to make fixture pass.

This is the missing **combination** of later source/native-lock/canonical changes with the actual Gate and secret participant. Its original J/G expectations are read locks, not diluted replacements. Before launching, fresh reviewer may remove an N1 step only by citing an existing fixed-source equivalent complete closure+raw oracle. If no gap survives, no native supplement should run. Do not demand runtime solely to earn a vendor label.

**No blanket new before:** valid historical original leaks/tree-shaking/migration/lock failures are already frozen. Only a newly demonstrated product failure needs fresh fixed-P0 before with correct oracle, impact and independent diagnosis; stop the current verifier, preserve that failure, and open a separate bounded author task. No repair in this task or vendor verification. A runner transport/fixture issue requires its own qualified author/reviewer and consumes disclosed execution cost; do not weaken assertions.

## 7. Concrete stage DAG, exact proposed output allowlists and locks

All paths below are proposals requiring root registration with full parent/product/input SHAs before dispatch; they are **not writes authorized by this preparation**. Prefix `docs/reviews/` applies to every path listed. Every stage is a fresh actor, none the same caller's earlier author, and no children. Actual execution vendor is Claude Code/Anthropic when available; fresh Codex/Sol/Astra name alone is not cross-vendor.

| Stage | Depends on / readiness | Exact ADD-only outputs |
|---|---|---|
| CR: fresh Astra full contract review | Preparation receipt; ready for scheduling; review all original rows, all index hashes, failure chains, delta proof and N1 necessity | `audit-parallel-rel02-rel03-contract-review-r1/review.md`, `audit-parallel-rel02-rel03-contract-review-r1/inputs.sha256` |
| V1: actual other-vendor read-only source/evidence verification | CR APPROVED, fixed source registered, vendor process actually available and fresh actor. Can independently judge REL02; REL03 requires no unproven combination. Static hash/diff/raw checks are real verification, not auth check | `audit-parallel-rel02-rel03-cross-vendor-r1/review.md`, `audit-parallel-rel02-rel03-cross-vendor-r1/inputs.sha256`, `audit-parallel-rel02-rel03-cross-vendor-r1/stdout.jsonl`, `audit-parallel-rel02-rel03-cross-vendor-r1/stderr.log`, `audit-parallel-rel02-rel03-cross-vendor-r1/receipt.json`, `audit-parallel-rel02-rel03-cross-vendor-r1/matrix.json` (no glob writes) |
| Q: new N1 evidence-runner author + separate qualification review, only if V1/CR confirms missing current integration | Explicit root task, frozen reviewed N1 oracle, native transport/archive rules; no product changes | author: `audit-parallel-rel03-current-integration-r1/verify.mjs`, `audit-parallel-rel03-current-integration-r1/fixture.tsx`, `audit-parallel-rel03-current-integration-r1/contract.md`, `audit-parallel-rel03-current-integration-r1/inputs.sha256`; separate reviewer: `audit-parallel-rel03-current-integration-review-r1/review.md`, `audit-parallel-rel03-current-integration-review-r1/inputs.sha256` |
| V2: fresh actual other-vendor N1 verifier if necessary | Q fresh APPROVED; fixed runner/fixture/input hashes; qualified own runtime | `audit-parallel-rel03-current-integration-r1/result.json`, `audit-parallel-rel03-current-integration-r1/stdout.log`, `audit-parallel-rel03-current-integration-r1/stderr.log`, `audit-parallel-rel03-current-integration-r1/receipt.json`, `audit-parallel-rel03-current-integration-r1/review.md` |
| A: fresh Astra full acceptance, no repair | V1 complete, V2 when required; all R2/R3/diagnosis rows reconciled, actual vendor execution substantive and source chain complete | `audit-parallel-rel02-rel03-acceptance-r1/acceptance.md`, `audit-parallel-rel02-rel03-acceptance-r1/inputs.sha256` |
| Root receipt/reconcile | Only root under exclusive recurring receipt lease; receives exact outputs and independent verdict, archives/integrates/pushes/sync-checks per authority | No worker allowlist; global control/ledgers remain root-only. Append evidence only; 312 IDs/status counts unchanged. |

Read locks: every `git:` record of this index, original objective, fixed CR/V1/Q outputs and their hashes when adopted; especially account scope/ownership/codec/registry/migration/secret, host providers/routes/App, every owner registration/package sideEffects, auth storage/dependencies. Logical lock is REL02/REL03 contract/evidence family plus native resource lease if N1 later runs; writing shared storage/host/AI/Settings at another SHA invalidates presumed integration and requires new fixed-source review. Clock/CSS qualification blocker does **not** block this static account scope. No Clock runtime/geometry/runner reuse or TT document write. Shared locks and file equality do not grant sole-controller rights. Current fixed-parent Clock retention validation is exhausted3/3 with source REVISE R1–R6 and separate metadata gap; no fourth run or automatic exception. Its MGB/foundation descendants stay gated independently.

Temporary runtime outputs if Q/V2 are adopted must be newly allocated beneath that worker's own designated temporary directory; immutable archive, server/profile/downloads and output handles must refuse overwrite. Record full source requested/resolved SHA, dependency root names (no secret values), lockfile hash, imported @repo paths/guard proof, exact command/cwd, start/end/exit/timeout, browser transport/version, synthetic identity boundary, source+runner+fixture/output hashes, all row outcomes and PRECONDITION count; clean up only own PIDs/files. Use streamed archive and CDP pipe; old 100MiB execFileSync + TCP-port scripts are historical only. No nativeVirtualKeyCode, no runtime hidden in CR/V1. N1 uses DOM programmatic controls as the original Gate proof unless native-input behavior is claimed; any native claim requires trusted input receipt.

## 8. Caps, stop conditions, vendor truth and missing conditions

This preparation: **one static pass, zero runtime/browser/native/package/probe/historical replays**, exactly two ADD files, no push/merge/rebase/global writes. Hashing and reading Git blobs are static checks, not product tests. Family budgets are permanent: future contract review/verification each maximum3 formal attempts per caller/unit; failure/refusal/precondition remains consumed across new actors/filenames/worktrees. Existing historic counts/results are retained, not reset to a fictional new baseline. Before next launch root must reconcile its persistent budget ledger; absent prior counts means blocked-to-launch, not assumed0. No broad implementation authorization from remaining budget.

Proposed V1 cap: one static evidence pass, zero browser/native/package/probe, max900s and USD12 if an external metered CLI is used, bounded own-process shutdown2s+2s; save exit and full raw stream even on401/timeout. V2 if admitted: one N1 suite per formal attempt, max3 attempts family total, max900s/USD12 each with own shutdown2s+2s; no exploratory runtime probes without separate root cost registration. The fixed cap is the smaller of these proposals and remaining permanent unit budget. CR/Q review/A each one bounded static pass per dispatched iteration (family≤3), zero runtime. Historical valid batches are not replayed. PRECONDITION/nonzero/missing required oracle cannot become PASS.

STOP/freeze the affected node on hash or scope conflict, unknown dirty ownership, unavailable required blob/artifact, missing admissible runner, new product rule/owner decision, current product failure, irreproducible receipt, exhausted budget, cross-module/cloud/security/schema demand or credential access. Reviewer never repairs. Actual vendor availability is an external **precondition**: only executed source/evidence work plus row verdict and preserved raw receipt satisfy the gate. Provider/model self-report is attributed metadata, not independently attested engine identity; never fabricate attestation or turn successful authentication into verification. No need to read credentials or run a sign-in/auth-availability probe here.

Minimum genuinely missing conditions: fresh CR verdict; actual separate-vendor executor for V1; explicit current integration verdict and Q/V2 only if N1 remains necessary; fresh final Astra. No new product-owner choice identified from this static pass. Existing empty/import/postpone/separate-BYOK/rollback semantics are already written. Hosted Supabase two-account E2E, real provider traffic, full D2 writer conversion/admission, REL04 inventory/REL06 server deletion, cloud sync, release and deployment remain unclaimed. If a future reviewer identifies an original-scope owner ambiguity, ask only that exact question; never invent policy or broadly reopen confirmed decisions.

## Appendix A. Exact historical commit references from both full EXECUTION records

| Abbreviation | Full SHA |
|---|---|
| `0141ecb` | `0141ecb6203b70ac84a657a902063d2959686789` |
| `23b83e4` | `23b83e469796ec811fc0a73464fd744fdface96c` |
| `44fa05c` | `44fa05c726e36cde618d82568daf0bbee06c3cb8` |
| `575cfd9` | `575cfd9f739ac330818a0d511911cc0c9dbae6ce` |
| `5803e86` | `5803e86bc6dcde4906cee8eb27777407d59b1d13` |
| `5ae7b7a` | `5ae7b7a4fb5d88bb5f11d741d4b826c0e13bb3d6` |
| `85451f6` | `85451f622e5f7209b21a32518bb63ed4a2484050` |
| `9638dbe` | `9638dbef50f5a8496b2e05612d4442d6eab63a0e` |
| `96d1914` | `96d19149eed3e90808ccd64fa7177ab081e08e6c` |
| `992f688` | `992f688c09fa161bf68f0cc32dd8755b03a14f2b` |
| `e1cbe5c` | `e1cbe5cbff8c6cfa6cca0291d3904fdc80981b29` |
| `ebb91c2` | `ebb91c28aa1a71d28a6d5e33a5304d89ea30a306` |
| `f02ca28` | `f02ca28da63dabedde998aeda9bb98e4c0e32a56` |
| `f15aceb` | `f15aceb29559b0796e059100eb92feb053c1ebce` |
| `f578ae8` | `f578ae8ae03c14cf7e48958f76441fc47898f95c` |
| `fae9398` | `fae9398a11d7973153531d970a0de642cb865fbd` |

The evidence index additionally freezes every added/modified file and existing pre-change bytes at all commits listed in both EXECUTION records, as well as e041c2b original control/ledgers and 1cc4cae impact artifacts. The evidence index binds file contents at parent and source at its stated immutable SHA. A historic commit reference is retained even when its evidence file was amended later; review the commit provenance as well as parent-version failure chronology. No early absent raw artifact was manufactured.

## Appendix B. Complete directly affected source-root delta, 5803e86 → P0

```text
M	apps/web/src/App.tsx
A	apps/web/src/__tests__/App.appearance.test.tsx
A	apps/web/src/__tests__/App.railorder.test.tsx
A	apps/web/src/routes/modules/__tests__/departureCoordinator.blocker.test.tsx
M	apps/web/src/routes/modules/composedSettingsRegistration.tsx
A	apps/web/src/routes/modules/dashboardRegistration.tsx
A	apps/web/src/routes/modules/departureCoordinator.tsx
A	apps/web/src/routes/modules/pomodoroRegistration.tsx
A	apps/web/src/routes/modules/settingsDeparture.ts
M	apps/web/src/routes/modules/shellRegistrations.tsx
M	packages/plugin-web-ai-chat/src/AiChatModule.tsx
M	packages/plugin-web-ai-chat/src/__tests__/AiChatModule.test.tsx
A	packages/plugin-web-ai-chat/src/__tests__/saveRecovery.test.tsx
M	packages/plugin-web-ai-chat/src/__tests__/toolRegistry.test.ts
A	packages/plugin-web-ai-chat/src/internal/requestToolWrite.ts
M	packages/plugin-web-ai-chat/src/internal/toolRegistry.ts
A	packages/plugin-web-ai-chat/src/internal/useChatPreference.ts
A	packages/plugin-web-ai-chat/src/internal/useConversationRecovery.ts
M	packages/plugin-web-ai-chat/src/styles.css
M	packages/plugin-web-storage/src/__tests__/AccountDataGate.test.tsx
A	packages/plugin-web-storage/src/__tests__/accountCoordination.test.ts
M	packages/plugin-web-storage/src/__tests__/accountDataLifecycle.test.ts
A	packages/plugin-web-storage/src/__tests__/canonicalCommandCommit.test.ts
A	packages/plugin-web-storage/src/__tests__/canonicalCommandState.test.tsx
A	packages/plugin-web-storage/src/__tests__/canonicalDatasetMutation.test.ts
A	packages/plugin-web-storage/src/__tests__/prefMutation.test.ts
A	packages/plugin-web-storage/src/__tests__/usePrefAsync.contract.test.tsx
M	packages/plugin-web-storage/src/__tests__/usePrefAutosave.test.tsx
M	packages/plugin-web-storage/src/index.ts
A	packages/plugin-web-storage/src/internal/accountCoordination.ts
M	packages/plugin-web-storage/src/internal/accountDataLifecycle.ts
A	packages/plugin-web-storage/src/internal/accountDeletionReceipt.ts
M	packages/plugin-web-storage/src/internal/accountMigration.ts
M	packages/plugin-web-storage/src/internal/accountMigrationValidation.ts
M	packages/plugin-web-storage/src/internal/accountScope.ts
A	packages/plugin-web-storage/src/internal/canonicalCommandState.ts
M	packages/plugin-web-storage/src/internal/lifecycleDeclaration.ts
A	packages/plugin-web-storage/src/internal/prefMutation.ts
A	packages/plugin-web-storage/src/internal/sameTabBus.ts
M	packages/plugin-web-storage/src/internal/storage.ts
M	packages/plugin-web-storage/src/internal/usePref.ts
A	packages/plugin-web-storage/src/internal/usePrefAsync.ts
M	packages/plugin-web-storage/src/internal/usePrefAutosave.ts
A	packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts

```

## Receipt

Author owns only this contract and inputs.sha256 in the isolated prep worktree. Current outcome is PROPOSAL / NEEDS_FRESH_REVIEW. No runtime result, cross-vendor PASS, READY_TO_SHIP, final acceptance or ledger closure is claimed. Parent verifies exact parent/2ADD/hash index/clean commit and preserves source remotely. Cost: static preparation1; runtime0, browser0, native0, package0, probes0, historical reruns0, children0.
