# BRD-12 full technical amendment review r2

**Verdict: REVISE of the whole technical amendment at 3a7d5f1b8a448ac44ac6d5090af63a6a81097546.** Two blocking technical findings prevent adoption of its exact deletion and account-restoration contracts. This is an independent complete review of the proposal and retained basis, not acceptance of a prior review's memory draft. T1/T2 and most T4 design provisions are coherent subject to their stated external and evidence gates; that partial assessment does not approve the whole amendment. No product, API, schema, key, path, runner, qualification, runtime, implementation, release or formal closure grant follows.

## 1. Identity and complete review basis

Module web; workflow D under the sole A-Codex controller. Reviewer /root/parallel_d_brd12_technical_full_review_r2; reviewer never repairs. Sole owned checkout /Users/lijinlong/.codex/worktrees/audit-parallel-brd12-technical-review2-20261010/XAI_Desktop. Clean dispatch parent af48d69854e9d6157bc51969fd19e09911fe81c0; fixed input b21a2450e6d2607487ba3f5ae7663bdf7ad7c301; P0 f9eb4b1f207bc4b46f547b90afc250424b3c8695. Configured Astra review role is not provider attestation or cross-vendor evidence.

Review card task-brd12-technical-contract-amendment-review-r2.json, dynamic execution-state.tasks LIST and prior-review failure receipt are bound at actual dispatch parent af48, where the card exists. They are not read from b21 or an author parent. Source author2 proposal 3a7 has parent bd4dce4aa7a5b96d533b7a570b5bfb97843f392b and integration 84f0048a74c34bfef2b463e3b525b514e67586d2. Complete source outputs and manifests are independently bound at original, integration, fixed input and dispatch-parent identities BEFORE the sole concluding checker accesses them.

Full immutable basis: preparation2 5fa4cccb106d10e16562e0a8d6f3b103495607b1 (integration aec56c13dbd01a95899f62dec8b8755f09897f7f), full review2 cdb8820b434aa7f2adb9cc5ad5f14118eb24230c (197e6de47d598df601d99ba978eeaa7a095b335c), lifecycle impact 11d6527709a5a735200151768296a312a3a30314 (8695c64d04a509f16959a683fcba0e64e33c9e20), impact review 68d0f14b243a1becb70811ca01a503cdcd244022 (5b5214868aca9e99f8fd738a88287bfa384b0116). Entire 36229/30933/25632/20349/15257 source corpora are retained and rehashed, including raw Git tree objects and the external original goal; actual resulting counts and hashes follow in the static receipt.

Read AGENTS, CLAUDE, project workflow, multi-machine policy, original goal, authority overlay, goal-D, scheduler, actual parent control/state/card, complete unique contract/review/impact sections and canonical G1. Full corpus byte validation establishes preservation, not a claim every transitive file received semantic review or was executed. Truncated terminal views were not treated as validation evidence. Additional direct source inspection covered actual Board writers, account migration/deletion, secret migration participant, account gates, reset, AppProviders, sign-out, departure coordination and task-link locks. A memory registry search found no relevant BRD evidence; no memory file supplies a finding.

## 2. Blocking findings

### R2-01 (P1): the surviving deletion receipt retains the content being deleted

Proposal coordinates: technical-contract-amendment-r2/contract.md at 3a7, lines 201-203 define RecoveryTarget.raw and complete all-generation targets; line 215 puts that complete RecoveryTarget[] into LossPlan.targets; line 223 puts manifest:LossPlan into both durable intent v2 and receipt v3, explicitly retaining the complete manifest rather than only its digest. Lines 221-225 transfer the immutable loss proof into the deleted receipt and retain confirmed/legacy continuation. This is not merely a label or hash-only inventory: raw is the full Board record and may contain all card text, activity, attachments and recovery history.

Actual fixed P0/af48 source: packages/plugin-web-storage/src/internal/accountDataLifecycle.ts:48-52 excludes the deleted receipt key from the account-prefix eraser; :75-80 spreads the same receipt into local-data-cleared; :98-102 spreads it into complete. packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts:20-24 expressly describes the tombstone as the durable receipt that the eraser preserves, and :89-111 carries that receipt through local data, secret and auth cleanup. accountDeletionReceipt.ts:9-10 names the surviving account-prefix deleted key. The present v1/v2 receipt is metadata only; the proposal adds raw user content to that permanent exception.

Concrete contract counterexample, not an executed runtime: A's Board raw contains card text S. A explicitly chooses destructive discard, the new intent and v3 receipt embed LossPlan.targets[...].raw containing S, confirmed cleanup erases the Board generation keys but preserves deleted, and completion retains boardLoss. S is still recoverable from deleted after a claimed complete local deletion. Verified-export choice has the same local retention problem. Masking A in B, making imported tokens non-executable, retaining a write fence, or recording a cryptographic digest does not remove S. No clause defines phase-specific removal/redaction of raw-bearing proof or permits a metadata-only terminal variant; v3 decoding instead requires the complete boardLoss shape.

Required correction (author-owned, no reviewer edit): separate the exact auditable destructive authorization inventory from raw recovery payload and specify which content may exist in intent, pending receipt, partial-cleanup receipt and final tombstone. Preserve owner/operation/decision/target identities, digests, fencing, rejection/unknown outcomes and captured-A resume, while defining an atomic/readback-safe transition that actually removes raw Board content from all surviving local proof when deletion completes. Do not weaken verified-export evidence or pretend a hash alone is a complete manifest. Specify version/backward decoding and interrupted-redaction recovery. Future before/fixed oracles must inspect all owned physical keys, the tombstone/intent and final phase after discard and export, including partial failures, reload and A-to-B. Legacy confirmed cleanup must remain resumable. This is a contract privacy/data-loss correctness blocker, not a new product preference.

### R2-02 (P1): account-wide forward restoration has no complete account-generation contract

Proposal coordinates: lines 189-195 extend migration and replace rollback with a fresh generation; :195 defines selected-prior/current Board history union, fresh entities, retirement and marker-last commit. Lines 166-168 expose only a Board MigrationCandidateResult.raw/retainedSourceIds participant. The selected source paths include accountMigration.ts and AccountDataGate.tsx, but the amendment does not freeze the complete restored account dataset, secret source, journal/return shape or previousRaw=null behavior. General phrases about candidate readback and source checks cannot identify which non-Board records and secrets the new marker will expose.

Actual source proves the scope: accountMigration.ts:22-33 enumerates every account-owned logical key in a generation; :102-128 copies and verifies the whole candidate, calls SecretMigrationParticipant.stage/verify, rereads all sources and commits one account-wide marker. accountScope.ts:19-22 and :71-78 route all account keys using that generation. Existing rollbackAccount at accountMigration.ts:136-156 restores the previous whole marker, or removes it when journal.previousRaw is null. It takes no secrets argument. AccountDataGate.tsx:94-103 calls it without secrets, although :82 supplies secrets to migrateAccount. apps/web/src/providers/AccountStorageGate.tsx:60 already provides aiSecretMigrationParticipant to the gate. The actual participant in packages/plugin-web-ai-chat/src/internal/secretStore.ts:295-377 binds encrypted rows to account+generation, decrypts selected previous-generation rows, re-encrypts under the candidate owner, and verifies staged bytes; ciphertext is not a generation-independent value.

Concrete completeness counterexample, not a runtime claim: previous generation G1 has Board/tasks/preferences and usable generation-bound AI key rows; G2 contains later Board U. A fresh G3 holding only the specified restored Board+history is enough to satisfy the stated Board candidate, but the global marker moves all account readers to G3, leaving other datasets/keys absent. Copying G2's non-Board data instead is another possible implementation with different semantics from existing whole-account rollback; the proposal selects neither. Even if ordinary records are copied from G1, existing rollback has no secret participant plumbing, so G3 secret rows are not automatically usable. For initial import with previousRaw=null there is no prior generation to project: the current UI returns to the uninitialized choice state; the proposal's universal fresh-generation rule does not specify a compatible result or how history remains archived without implicitly activating a new empty workspace.

Required correction: freeze whole-account restoration semantics and exact inventory, non-Board byte/source selection, generation/journal/collision/readback/return behavior, terminal Board-history reconciliation, and previousRaw=null/no-marker handling. Explicitly wire and validate the existing secret stage/verify participant (or prove another reviewed compatible mechanism) with a precise source generation, no accidental legacy adoption, post-await scope/source/marker checks, failure retention and no fallible work after visibility commit. Distinguish selective Board restore from the existing Undo this import account action; do not silently change the latter into a Board-only operation. Freeze corresponding test/owning-doc scope and exact protected exceptions through the author/root review process. Do not assume this finding grants edits to AI secret storage, AccountStorageGate, tests or any new path. Required future oracles cover prior populated account with multiple datasets and keys, first import with null previousRaw, empty/current-no-marker, secret-stage/verify failure, partial candidates, source change and retired-U non-revival.

The prior-review failure receipt's two memory observations were hypotheses only. Both findings above were independently reconstructed from full protocol definitions, complete lifecycle implementations and the actual secret/gate callers. No executable product defect was reproduced in this review; these are blocking contradictions/omissions in the proposed technical contract.

## 3. Whole protocol and business assessment

T1: account L shared before sorted physical dataset K, generation excluded from L, exclusive L for migration/restoration/reset/erasure, deletion-workflow lock only before L on its existing path, synchronous final read/transform/write/readback and checks after every await constitute a coherent proposed ordering. Generic setPref/removePref/mutatePref and all scoped setters must reject Board before no-op fast paths. Eager deterministic participant registration, lexical raw capability and refusal on missing/conflicting participant preserve storage-to-domain dependency direction. None is implemented or proved by this document.

Task-link must remain three separate phases: Board pending under L+K; Tasks command under one L and sorted Tasks+Board locks with a synchronous Board read-participant validation; then a newly locked Board-only acknowledgement of the original intent/card incarnation after await. Actual taskLinkCommand reads Board in the Tasks callback and writes before/after it. Wrapping the whole saga in a Board lock would not supply the reviewed ordering. Task activation and schemas remain unchanged, and partial Tasks success must be reconciled without duplicates. Creation similarly retains save-then-selection recovery and workspace membership proof, not a cross-key transaction claim.

T2: optional collision-refusing checklistRecovery in the existing Board[]/v1 envelope; strict protocol fields/kinds/presence tags; exact immutable body strings/digests; linear chain and resolved tokens; separate terminal U projection; historical owner versus live AccountScope; whole-dataset validation; lossless unknown ordinary metadata and strict unknown protocol rejection are coherent as a design. Digest is consistency evidence, not authentication or continuity after external ABA. Duplicate addressing and unsupported/malformed source refuse mutation while retaining raw recovery. Candidate callback opacity and runtime revalidation are necessary; TypeScript shapes alone cannot establish authority.

Forward attribution preserves Praw versus Pmount, actual incidental normalization, multi-card completion, marker-only X and P0 completion/urgent/sort counters. CompleteCard's temporary normalization need not persist when transformedCards are not selected; sibling completion can make it persist. No-op automation mints no receipt. A relevant same-value manual done intent changes ownership, while an unrelated no-op does not. The strict codec/serializer and synchronous digest implementation remain source-review obligations; no new dependency or arbitrary size/history expiry policy is granted.

Whole U requires every X-owned completion field on continuously tracked, live/unarchived incarnations with X ownership and current postvalue. One conflict refuses every target. Original manual true and T0 remain; later text/date/priority/labels/order/move and distinct new rows survive; unrelated original-true row deletion is not resurrected. X-owned delete/re-add or representation conversion blocks inverse. Archive restoration needs continuous lineage. U appends a terminal record without rewriting X; repeated U has no second inverse. Same-mount scheduling stays consumed; later genuine mount/day/manual/move Y remains normal and has its own preimage. No persistent suppression or midnight scheduler is introduced.

Truthful legacy display, both synthesis-site corrections, real-array precedence including empty, no regex provenance, explicit newly authored conversion preview and original/immediate aggregate retention satisfy the original information requirement at proposal level. Historical AC4 generated-row expectations remain frozen and require independently reviewed versioned oracle corrections. Quota/serialization failure must refuse the whole projection+receipt; no eviction or success-without-history. All B01-B12 remain required, reproduced below, with R2-01 affecting B08/B09/B12 and R2-02 affecting B05/B09/B10/B12 in addition to the technical gates.

T3: same-account forward continuity differs from foreign/unassigned/file replacement; historical imported X/U cannot become live by owner-name equality. Export storageValue/top-level boards/logical payloads must be coherently equal with unknown metadata and exact raw companion. Pure constructors are not a fictional live importer. Current-generation account export is correctly not advertised as all-generation history. Required retirement/forward-copy semantics remain, but R2-01/R2-02 prevent adoption of the deletion/restoration closure.

T4: AppProviders sibling host above account-remounted/routed children in both branches, without Router dependency; synchronous first-intent capture and registry-backed cleanup; immediate auth mask/fence; explicit A-prime validation; pre-manage lock/unmount guard; pre-server durable deletion fence; reset preflight before first removal/default event; actual sign-out coordinator and fallback ordering are correctly identified. Optional async departure changes still need full affected-caller proof, live-blocker release-once and post-await original-intent checks. Source reset currently ignores false removes; the proposed completed/refused/partial result is necessary. Browser beforeunload is only a warning and forced termination cannot preserve never-persisted drafts.

External old-client quiescence remains UNPROVEN and blocks relevant admission. Every old/cached same-origin Board writer must actually be quiescent or upgraded before first capsule write and native acceptance. Source grep, two cooperative tabs, a local lock, matching hash or closing the current view cannot prove universal quiescence or detect arbitrary byte-identical ABA. No service-worker scope or local-fiction exception is approved.

## 4. Exact future scope assessment

The original 24, 40 added source candidates, nine test candidates and seven owner-doc candidates form the exact future 80-path proposal, all UNGRANTED. I independently classify each frozen row below against its source responsibility. The original 24 cover truthful conversion, forward/inverse core+workspaces, existing tests and the eight owning docs. All 40 selected source boundaries are justified by actual W01-W21/lifecycle reachability; exported alternate writers cannot be dropped merely because the main route uses Workspaces. Nine test files have distinct codec/writer/host/storage/reset/deletion purposes and do not replace inherited regression/native gates. Seven docs describe altered public contracts; storage's proposed new document is not mislabeled an existing api/design pair.

This is a necessary candidate surface, not a finding that it is sufficient for the corrected R2-02 account semantics. Every row remains protected pending corrected exact contracts, fresh full review and explicit root adoption. The final two findings require revisiting precise scope and acceptance; they do not automatically add files. No CSS/tokens, settingsDeparture, usePref, router topology, Task schema/activation/store, Calendar consumer, auth backend, service worker, Desktop adapter, registry key, config/lockfile, cloud-sync or other implicit exception is granted. Single semantic ownership excludes overlapping BRD-18, BRD-28, ordinary-field/list lifecycle and shared account/storage/host work. No automatic repin/rebase.

## 5. Full evidence chain and preservation

Complete B01-B12, R01-R12, W01-W21 and canonical Clock r2 section14 E1-E25/E24/Rules are retained below from immutable source bytes. Canonical full document hash 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae is independently checked. The 16 F1 invocations, all Header/native/host controls, AppRail/Appearance/Features/More/Sticky/Notifications/Date-Time/Smart Lists/Collaborate/Pomodoro/settings/widgets/grid suites and judging copies remain. C-FB002/OE/C-RD1 judge alongside frozen failures; C-FD1 is diagnostic. Capacity/product-delta copies require the original refusal and narrow reviewed diff, not changed business assertions. App/storage/coordinator changes void affected invariance exemptions. Missing Clock evidence is not completed by BRD review.

Sequence remains corrected full technical contract -> fresh independent full review -> root adoption of exact schema/API/path/semantic locks -> source-qualified full original B/R/W oracles and permanent-unit budget admission -> valid full P0 before -> separately granted implementation -> independent fixed AND integrated/native/visual/affected full verification -> actual cross-vendor full-scope report -> fresh Astra full original acceptance -> root evidence-only reconciliation -> independent accepted-integrated inventory and remote/sync receipt. No local blocked dependency reduces any criterion.

Source qualification requires requested/resolved SHA, full sources/fixtures/lockfile/@repo guards, streamed immutable archive with byte count, collision refusal and preserved actual exit. Native requires the actual registered App/providers/account generation, true second browser document, owned isolated server, pipe CDP, trusted drag/keys, passive K-1 audit with no nativeVirtualKeyCode, original pixelFocusWalk identity or separately qualified/adopted replacement, actual disk downloads and manually assessed screenshots. EN/ZH, themes and 375/414/768/1024/1440 widths, per-stop visible focus and applicable 44px targets remain mandatory. Synthetic source/host checks are not real provider or native acceptance.

Full original312 ordered task records/nine fields,39 literal original_module labels (30 web project-system and nine cross-module-index),normalized modules,complete retained execution records,933 ordered original evidence references plus exact TT08 six=939,13 completed/3 verification_pending/3 in_progress/293 pending and299 unclosed are independently compared. Dynamic tasks is a LIST; TODO uses sections[].tasks, EXECUTION uses top-level items.150 nonempty gate_obligations and118 original gated rows measure different policies. Four TT08 owning docs are the only P0 apps/packages/package/lockfile differences; runtime parity is checked separately from those permitted documents. No whole apps/packages equality assertion. Ledger/control/state are read-only.

## 6. Permanent costs, failed/unrun truth and action

This is technical amendment review2/3, one concluding semantic static allowance only; failure stops without retry. Review1 remains FAILED_STATIC_NO_REVIEW_ARTIFACT: session83092 chunks44bb23/fa5230/f83f09 exit1, fully drained, failed missing explicitly bound parent51398 own-contract identity after initial hash loop; no valid verdict, complete buffers, writes or commit. The current checker binds every later-accessed complete output at every named SHA before its loop; source-equal bytes under a different identity do not silently satisfy an omitted parent identity.

Technical author2/3's actual static PASS and author1's actual parser failure stay distinct. Author1 chunk02082d exit1 at stdin170 ran no body/hashes/buffers/writes; syntax-only3ba858 PASS did not prove shell transport. Impact author1's sections[].items failure remains FAILED with later comparisons UNRUN; fresh impact review's PASS and its pretool JavaScript construction SyntaxError remain separate. Prior preparation2/3 and full review2/3 are retained. No fourth iteration or renamed actor/worktree/path budget reset.

Historical unit distinctions stay unchanged: seven original rejected-append artifacts, six archive roots plus main-checkout before; detail calibration/view/final roots vR4Xvt/QNw9Ce/H1Ap2r with5/8/8 cases; separate author0NW1Ae mode; native PIDs14575/15385/17812/18500; package roots lpCkP7/zYQAbA/qnu7yE/BmWgbG and nine original fixture failures; task-link PID23393, one-byte blank before-fixture and PID23613. Purpose/mode/command/process matter, not filename/assertion counts. Unknown formal/probe subdivisions remain unknown, not0/3. N-L/N-U/N-P are new assertions, not new broad Board/native/host budgets.

Clock Q1 focus1/3 and six other units0/3; development2/83; retention3/3 exhausted,145 assertions/41 of42 executions,last14/14 not qualification; B70/refusals/R1-R6/impact2 retained. REL vendor histories unknown; TT08 actual vendor3 does not grant BRD vendor execution. Formal cap<=3 includes refusal/precondition/launch attempts; probes remain separately disclosed. Actual billed USD unavailable.

This review runs runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children0 each. Read-only source/schema inspection and the sole raw-byte/JSON/document checker do not import or execute product code. Commands are cat/sed/rg/wc and read-only Git metadata/blob inspection, Python standard-library source inspection/checking, then exact two-file staging/commit with command-local hooks disabled. One memory search returned no matches (exit1), so a following &&-chained path listing did not execute and was separately issued; no semantic checker or product runtime was consumed by that search result. No source-location or syntax error is hidden as a PASS.

All immutable inputs are validated and BOTH complete UTF-8 output buffers built before either output write. The checker owns its Git cat-file process, closes stdin and drains stdout/stderr to EOF, joins the stderr thread and waits for the actual child exit even on failure. This report's final section gives its PID and exact integrity results; actual tool session/chunks/terminal exit and final commit hashes are reported in Handoff rather than predicted here.

Next bounded action: root may receive this REVISE report and preserve the original commit remotely, then register a fresh full technical amendment author3/3 addressing R2-01/R2-02 across the entire original contract and finite T1-T4 basis. Fresh full review3/3 remains required; no author4/reviewer4 or runtime reset. Reviewer does not repair. No owner QL/QU question is established. No push/fetch/sync-check/global writes/other-worktree mutation/merge/rebase/promotion/deployment/release/D3 occurs here. Local checkpoint, runtime qualification, caller acceptance, formal closure and release remain distinct.

## 7. Source-output identity receipt

| Original source | Direct source parent | Integration | Complete MD SHA-256 | Complete manifest SHA-256 |
| --- | --- | --- | --- | --- |
| 5fa4cccb106d10e16562e0a8d6f3b103495607b1 | 41295a0f57728d93bb764f3679f5e2f3dafb86d4 | aec56c13dbd01a95899f62dec8b8755f09897f7f | 666d493bbd924c64267a822d5fd9ec97f94bb55ab37340f43aa6588f5b209000 | 1fb39fa30057dedf964b716e80f026818c96d71bada6156e745eaa6b93cd24da |
| cdb8820b434aa7f2adb9cc5ad5f14118eb24230c | 9262f5f31128bc6bbf5de54e9c24238c58227d0e | 197e6de47d598df601d99ba978eeaa7a095b335c | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 | 48e8d4bbc84d99e8bbe5f9336d56c6a8652f653ba8a60349e2ee0d6279c8dec2 |
| 11d6527709a5a735200151768296a312a3a30314 | 53a961aaa4ae87e1453f27d91af3c8edd6ddaeeb | 8695c64d04a509f16959a683fcba0e64e33c9e20 | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 | 63bbf0af40529bc0765910fad3329713380a5d4292229abc8d3ad076a75d43db |
| 68d0f14b243a1becb70811ca01a503cdcd244022 | b9ed5f63256620b1135ba9e782f08992923bd3c4 | 5b5214868aca9e99f8fd738a88287bfa384b0116 | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf | 89b21d0a905ce4a62e5969a3c0cf5a44399f383c3f1d7295643e5c1fe0171f2d |
| 3a7d5f1b8a448ac44ac6d5090af63a6a81097546 | bd4dce4aa7a5b96d533b7a570b5bfb97843f392b | 84f0048a74c34bfef2b463e3b525b514e67586d2 | 6d29bcaad40daaea334b4c8094e1ca386a9c74da6451255e4701badba0a0cca9 | f7d1af5519781bb72ab7b6694349687fee8d50200fc163a48608d0c6dcaecb2d |

## 8. Exact per-path independent assessment

| # | Exact candidate | Disposition now | Independent necessity / reserved boundary |
| --- | --- | --- | --- |
| 1 | packages/plugin-web-board-core/src/types.ts | existing candidate; UNGRANTED | Core representation/normalization/automation/guard/envelope; B01-B07/T2. Exact schema still withheld. |
| 2 | packages/plugin-web-board-core/src/internal/boardOps.ts | existing candidate; UNGRANTED | Core representation/normalization/automation/guard/envelope; B01-B07/T2. Exact schema still withheld. |
| 3 | packages/plugin-web-board-core/src/internal/automationLite.ts | existing candidate; UNGRANTED | Core representation/normalization/automation/guard/envelope; B01-B07/T2. Exact schema still withheld. |
| 4 | packages/plugin-web-board-core/src/internal/isBoardArray.ts | existing candidate; UNGRANTED | Core representation/normalization/automation/guard/envelope; B01-B07/T2. Exact schema still withheld. |
| 5 | packages/plugin-web-board-core/src/internal/storageContract.ts | existing candidate; UNGRANTED | Core representation/normalization/automation/guard/envelope; B01-B07/T2. Exact schema still withheld. |
| 6 | packages/plugin-web-board-core/src/__tests__/boardOps.test.ts | existing candidate; UNGRANTED | Original core regression source; full tests and reviewed oracle conflicts remain. |
| 7 | packages/plugin-web-board-core/src/__tests__/automationLite.test.ts | existing candidate; UNGRANTED | Original core regression source; full tests and reviewed oracle conflicts remain. |
| 8 | packages/plugin-web-board-core/src/__tests__/isBoardArray.test.ts | existing candidate; UNGRANTED | Original core regression source; full tests and reviewed oracle conflicts remain. |
| 9 | packages/plugin-web-board-core/src/__tests__/storageContract.test.ts | existing candidate; UNGRANTED | Original core regression source; full tests and reviewed oracle conflicts remain. |
| 10 | packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx | existing candidate; UNGRANTED | Actual modal/module/append/new-operation path and regressions; W01-W08/B01-B09. |
| 11 | packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx | existing candidate; UNGRANTED | Actual modal/module/append/new-operation path and regressions; W01-W08/B01-B09. |
| 12 | packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery.ts | existing candidate; UNGRANTED | Actual modal/module/append/new-operation path and regressions; W01-W08/B01-B09. |
| 13 | packages/plugin-web-board-workspaces/src/internal/useBoardChecklistOperation.ts | proposed ADD; UNGRANTED | Actual modal/module/append/new-operation path and regressions; W01-W08/B01-B09. |
| 14 | packages/plugin-web-board-workspaces/src/__tests__/BoardChecklistOperation.test.tsx | proposed ADD; UNGRANTED | Actual modal/module/append/new-operation path and regressions; W01-W08/B01-B09. |
| 15 | packages/plugin-web-board-workspaces/src/__tests__/BoardWorkspacesModule.test.tsx | existing candidate; UNGRANTED | Actual modal/module/append/new-operation path and regressions; W01-W08/B01-B09. |
| 16 | packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx | existing candidate; UNGRANTED | Actual modal/module/append/new-operation path and regressions; W01-W08/B01-B09. |
| 17 | packages/xai-web-board-checklist-editor/docs/design.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 18 | packages/xai-web-board-checklist-editor/docs/api.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 19 | packages/xai-web-board-checklist-editor/docs/test.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 20 | packages/xai-web-board-checklist-editor/docs/dev_log.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 21 | packages/xai-web-board-automation-lite/docs/design.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 22 | packages/xai-web-board-automation-lite/docs/api.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 23 | packages/xai-web-board-automation-lite/docs/test.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 24 | packages/xai-web-board-automation-lite/docs/dev_log.md | existing candidate; UNGRANTED | Eight original owning checklist/automation documents; correct historical generated-row oracle explicitly. |
| 25 | packages/plugin-web-board-core/src/internal/checklistRecovery.ts | proposed ADD; UNGRANTED | Pure exact capsule codec/validation/delta/field-token/inverse/import/restoration logic. W/T responsibility retained; no current edit grant. |
| 26 | packages/plugin-web-board-core/src/internal/boardMutation.ts | proposed ADD; UNGRANTED | Board command adapter to protected dataset API; metadata-preserving W/X/C/U, independent of React. W/T responsibility retained; no current edit grant. |
| 27 | packages/plugin-web-board-core/src/index.ts | existing candidate; UNGRANTED | Public export of the two owned APIs; deterministic participant registration. W/T responsibility retained; no current edit grant. |
| 28 | packages/plugin-web-board-core/src/internal/accountMigration.ts | existing candidate; UNGRANTED | Replace array-only validator with whole-storage participant, explicitly including copied generations. W/T responsibility retained; no current edit grant. |
| 29 | packages/plugin-web-board-core/src/internal/exportImport.ts | existing candidate; UNGRANTED | Coherent full payload/capsule validation and historical import classification. W/T responsibility retained; no current edit grant. |
| 30 | packages/plugin-web-board-core/src/BoardModule.tsx | existing candidate; UNGRANTED | W10 async writer/seed adoption and result-aware recovery. W/T responsibility retained; no current edit grant. |
| 31 | packages/plugin-web-board-views/src/BoardModule.tsx | existing candidate; UNGRANTED | W11 async writer/seed adoption and result-aware recovery. W/T responsibility retained; no current edit grant. |
| 32 | packages/plugin-web-board-workspaces/src/internal/useBoardCreateRecovery.ts | existing candidate; UNGRANTED | W07 async two-step recovery and workspace dependency locking. W/T responsibility retained; no current edit grant. |
| 33 | packages/plugin-web-board-workspaces/src/internal/useBoardComposerRecovery.ts | existing candidate; UNGRANTED | W06 async stable intent/latest draft acknowledgement. W/T responsibility retained; no current edit grant. |
| 34 | packages/plugin-web-board-workspaces/src/internal/useWorkspaceSaveRecovery.ts | existing candidate; UNGRANTED | W09 Board membership/selection dependency and async outcomes. W/T responsibility retained; no current edit grant. |
| 35 | packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.ts | existing candidate; UNGRANTED | Three-phase shared-order participant and post-await incarnation checks. W/T responsibility retained; no current edit grant. |
| 36 | packages/plugin-web-board-workspaces/src/internal/boardRecoveryRegistry.ts | proposed ADD; UNGRANTED | Captured-owner memory intents survive route/account subtree unmount; masks and revalidation. W/T responsibility retained; no current edit grant. |
| 37 | packages/plugin-web-board-workspaces/src/BoardRecoveryHost.tsx | proposed ADD; UNGRANTED | Bounded recovery/export/reselected-file verification UI, no storage authority from UI. W/T responsibility retained; no current edit grant. |
| 38 | packages/plugin-web-board-workspaces/src/index.ts | existing candidate; UNGRANTED | Public host/guard/registry adapter exports; no host internal import. W/T responsibility retained; no current edit grant. |
| 39 | packages/plugin-web-board-workspaces/src/BoardCreator.tsx | existing candidate; UNGRANTED | Pending/cancel/export state uses completed result, not Promise truthiness. W/T responsibility retained; no current edit grant. |
| 40 | packages/plugin-web-board-workspaces/src/BoardSwitcher.tsx | existing candidate; UNGRANTED | Await workspace create/rename/retry; guard selection/close with first intent. W/T responsibility retained; no current edit grant. |
| 41 | packages/plugin-web-board-workspaces/src/BoardDeleteConfirmDialog.tsx | existing candidate; UNGRANTED | Exact successful-history loss disclosure and async result-aware confirm. W/T responsibility retained; no current edit grant. |
| 42 | packages/plugin-web-board-workspaces/src/BoardSettingsModal.tsx | existing candidate; UNGRANTED | Preserve latest field draft and pending/error through async Board metadata save/close. W/T responsibility retained; no current edit grant. |
| 43 | packages/plugin-web-storage/src/internal/protectedDataset.ts | proposed ADD; UNGRANTED | Narrow participant registry, L→sorted K command IO, loss-plan capability, marker/readback gates. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 44 | packages/plugin-web-storage/src/internal/storage.ts | existing candidate; UNGRANTED | Fail closed generic Board set/remove before equality fast path. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 45 | packages/plugin-web-storage/src/internal/prefMutation.ts | existing candidate; UNGRANTED | Deny generic Board replace/reset; exported generic async path cannot strip capsule. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 46 | packages/plugin-web-storage/src/internal/accountScope.ts | existing candidate; UNGRANTED | Refuse all raw scoped Board setters/removers; retain normal scope semantics. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 47 | packages/plugin-web-storage/src/internal/canonicalCommandState.ts | existing candidate; UNGRANTED | Optional same-scope read participant locks for Board→Tasks saga; no Task schema/activation change. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 48 | packages/plugin-web-storage/src/internal/accountMigration.ts | existing candidate; UNGRANTED | Whole-source Board participant, post-await validation, fresh-generation restoration avoiding retired-U revival. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 49 | packages/plugin-web-storage/src/internal/accountMigrationValidation.ts | existing candidate; UNGRANTED | Explicit validator/transform registry boundary; no missing-validator fallback. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 50 | packages/plugin-web-storage/src/internal/accountDataLifecycle.ts | existing candidate; UNGRANTED | Typed guarded erasure boundary; current/all-generation loss snapshot, preserve legacy confirmed deletion. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 51 | packages/plugin-web-storage/src/internal/accountDeletionReceipt.ts | existing candidate; UNGRANTED | Independently reviewed versioned loss-proof/fence fields and decoder, old receipt handling explicit. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 52 | packages/plugin-web-storage/src/AccountDataGate.tsx | existing candidate; UNGRANTED | Preflight before manage lock/unmount and before import/rollback intent. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 53 | packages/plugin-web-storage/src/index.ts | existing candidate; UNGRANTED | Narrow public dataset/lifecycle preflight APIs used by owning packages and host. R2-01/R2-02 block lifecycle adoption; no broad storage refactor. |
| 54 | packages/plugin-web-settings-shell/src/internal/resetAllPrefs.ts | existing candidate; UNGRANTED | Await preflight before first removal; explicit partial/refused outcomes. R2-01 deletion proof must be corrected before adoption. |
| 55 | packages/plugin-web-settings-shell/src/SettingsFooter.tsx | existing candidate; UNGRANTED | Correct data-loss disclosure, awaited reset/result UI and disabled repeat action. R2-01 deletion proof must be corrected before adoption. |
| 56 | packages/plugin-web-settings-shell/src/types.ts | existing candidate; UNGRANTED | Precisely typed async reset result boundary; legacy override behavior reviewed. R2-01 deletion proof must be corrected before adoption. |
| 57 | packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts | existing candidate; UNGRANTED | Guard/fence before server request; preserve captured-A continuation and B masking. R2-01 deletion proof must be corrected before adoption. |
| 58 | packages/plugin-web-settings-rest/src/internal/accountDeletionIntent.ts | existing candidate; UNGRANTED | Durable exact loss-plan authorization and pending Board-write fence; backward reading. R2-01 deletion proof must be corrected before adoption. |
| 59 | packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts | existing candidate; UNGRANTED | Transfer proof into start/confirmed receipt and preserve resume semantics. R2-01 deletion proof must be corrected before adoption. |
| 60 | apps/web/src/providers/AppProviders.tsx | existing candidate; UNGRANTED | Mount BoardRecoveryHost above account/routed subtree; no auth/security behavior rewrite. Above-account and actual route/first-intent proof mandatory. |
| 61 | apps/web/src/App.tsx | existing candidate; UNGRANTED | Compose Board sign-out preflight with accepted rail/Appearance/settings ordering. Above-account and actual route/first-intent proof mandatory. |
| 62 | apps/web/src/routes/modules/boardRegistration.tsx | proposed ADD; UNGRANTED | Host-owned Board route adapter using existing structural coordinator. Above-account and actual route/first-intent proof mandatory. |
| 63 | apps/web/src/routes/modules/shellRegistrations.tsx | existing candidate; UNGRANTED | Replace exactly the Board registration with the host adapter. Above-account and actual route/first-intent proof mandatory. |
| 64 | apps/web/src/routes/modules/departureCoordinator.tsx | existing candidate; UNGRANTED | Opt-in async resolution/reconciliation; preserve existing first-intent/release-once interfaces. Above-account and actual route/first-intent proof mandatory. |
| 65 | packages/plugin-web-board-core/src/__tests__/checklistRecoveryAdmission.test.ts | proposed ADD; UNGRANTED | Distinct proposed future test source: checklistRecoveryAdmission.test.ts. Full B/R/W and R2 findings still required; no execution grant. |
| 66 | packages/plugin-web-board-core/src/__tests__/boardWriterLifecycle.test.ts | proposed ADD; UNGRANTED | Distinct proposed future test source: boardWriterLifecycle.test.ts. Full B/R/W and R2 findings still required; no execution grant. |
| 67 | packages/plugin-web-board-views/src/__tests__/BoardWriterLifecycle.test.tsx | proposed ADD; UNGRANTED | Distinct proposed future test source: BoardWriterLifecycle.test.tsx. Full B/R/W and R2 findings still required; no execution grant. |
| 68 | packages/plugin-web-board-workspaces/src/__tests__/BoardAllWriterRecovery.test.tsx | proposed ADD; UNGRANTED | Distinct proposed future test source: BoardAllWriterRecovery.test.tsx. Full B/R/W and R2 findings still required; no execution grant. |
| 69 | packages/plugin-web-storage/src/__tests__/boardProtectedDataset.test.ts | proposed ADD; UNGRANTED | Distinct proposed future test source: boardProtectedDataset.test.ts. Full B/R/W and R2 findings still required; no execution grant. |
| 70 | packages/plugin-web-storage/src/__tests__/boardMigrationDeletionFence.test.ts | proposed ADD; UNGRANTED | Distinct proposed future test source: boardMigrationDeletionFence.test.ts. Full B/R/W and R2 findings still required; no execution grant. |
| 71 | packages/plugin-web-settings-shell/src/__tests__/BoardResetLossGuard.test.tsx | proposed ADD; UNGRANTED | Distinct proposed future test source: BoardResetLossGuard.test.tsx. Full B/R/W and R2 findings still required; no execution grant. |
| 72 | packages/plugin-web-settings-rest/src/__tests__/BoardAccountDeletionLossGuard.test.tsx | proposed ADD; UNGRANTED | Distinct proposed future test source: BoardAccountDeletionLossGuard.test.tsx. Full B/R/W and R2 findings still required; no execution grant. |
| 73 | apps/web/src/__tests__/BoardDepartureLifecycle.test.tsx | proposed ADD; UNGRANTED | Distinct proposed future test source: BoardDepartureLifecycle.test.tsx. Full B/R/W and R2 findings still required; no execution grant. |
| 74 | packages/plugin-web-settings-rest/docs/api.md | existing candidate; UNGRANTED | Public owning contract documentation; exact final APIs/lifecycle/errors/backward behavior and R2 fixes must be reviewed. |
| 75 | packages/plugin-web-settings-rest/docs/design.md | existing candidate; UNGRANTED | Public owning contract documentation; exact final APIs/lifecycle/errors/backward behavior and R2 fixes must be reviewed. |
| 76 | packages/plugin-web-settings-shell/docs/api.md | existing candidate; UNGRANTED | Public owning contract documentation; exact final APIs/lifecycle/errors/backward behavior and R2 fixes must be reviewed. |
| 77 | packages/plugin-web-settings-shell/docs/design.md | existing candidate; UNGRANTED | Public owning contract documentation; exact final APIs/lifecycle/errors/backward behavior and R2 fixes must be reviewed. |
| 78 | packages/plugin-web-board-workspaces/docs/api.md | existing candidate; UNGRANTED | Public owning contract documentation; exact final APIs/lifecycle/errors/backward behavior and R2 fixes must be reviewed. |
| 79 | packages/plugin-web-board-workspaces/docs/design.md | existing candidate; UNGRANTED | Public owning contract documentation; exact final APIs/lifecycle/errors/backward behavior and R2 fixes must be reviewed. |
| 80 | packages/plugin-web-storage/docs/board-writer-lifecycle.md | proposed ADD; UNGRANTED | Public owning contract documentation; exact final APIs/lifecycle/errors/backward behavior and R2 fixes must be reviewed. |

## 9. Complete retained business obligations (immutable source text)

## 4. Full proposed business and data oracles

These are reviewable acceptance obligations, not observed runtime results. A source finding is not a frozen before run. Original raw data must be captured before route mount because existing mount automation can mutate it; preserve that pre-mount raw and the post-mount baseline separately.

| ID | Before evidence to freeze independently | Fixed business oracle / preservation |
| --- | --- | --- |
| B01 legacy count | Real bc1-like aggregate-only source; modal open/close, toggle/edit/remove, append and two failed append attempts; exact source and written payload | Never fabricate or persist plausible row titles/real identities. Show truthful missing-title/count state under §5.1. Preserve immutable pre-mount raw evidence and operation preimages; canonical counts may change only by the recorded authorized automatic delta or explicit genuine conversion. Missing historical titles/IDs/flags stay unknown through automation. No substitute real item titles. |
| B02 real rows | Real arbitrary IDs, mixed flags, duplicate-looking titles, literal user “Item 1”, empty text where guard admits; stale aggregate; absent vs empty array | Preserve actual text/IDs/order; manual edits change only selected fields and automatic completion changes only its recorded false flags/marker plus derived count (§5.2); inverse is field-owned (§5.4). Derive count from canonical array; explicit last deletion clears chip. Never classify “Item N” or `legacy-*` solely by regex as disposable. |
| B03 already materialized legacy | Real stored synthetic-looking rows alongside legitimate matching names and imported rows; no provenance field | Unknown provenance stays unknown, source export retained. No bulk rename, deletion, collapsing or claim recovered titles. User-confirmed repair is attributable and does not rewrite untouched rows. |
| B04 malformed | Absent storage, invalid JSON, invalid shape/envelope/version, empty boards, negative/fractional/overlarge counts, done>total, duplicate IDs | Preserve raw bytes exactly; distinguish unsupported/invalid from empty. No default-data write or destructive migration. Bound allocations/controls safely; unsupported records have truthful refusal and recovery. Domain validation proposal reviewed before test expectations are changed. |
| B05 migration / roundtrip | Both legacy array and v1 envelope; `migrateBoardStorageRawToEnvelope`, export/import and account validator; counts/structured/mixed source | Idempotent explicit conversion, no lost unrelated keys/envelope metadata; same-account reload/export/import preserve chosen data and provenance under §5; no import may turn a foreign historical owner token into live write authority. No silent schemaVersion/storage-key change. Any required schema change returns for exact review. |
| B06 actual Done triggers | Semantic key/name variants, renamed custom list, archived cards/lists; opening/day/manual; same-list no-op, cross-list to/from Done, another Done card affected | Existing rule identified before execution, affected cards/items/counts visible. Preserve current trigger/semantic rules unless a separately accepted amendment exists. Auto-check has exact attributable preimage and reversible delta; urgent and sort fields are not accidentally undone. |
| B07 inverse | Mixed manually completed rows, auto-checked rows, prior completedAt; repeat operation, move out/back, later edit/delete/add, concurrent card/source changes | Undo restores only the applicable operation's owned changes under §5.4; does not uncheck originally true rows, delete new rows, resurrect removed target, overwrite later edits, remove preexisting completedAt, or rewrite unrelated order/labels. Conflicting source conservatively refuses with retained recovery. No snapshot rollback over newer whole-board data. |
| B08 error / recovery | Per-physical-key read denial, quota/write refusal, write-success/read-back denial; repeat retry, double click, rapid actions, original proposal collision | Latest user intent and original operation identity retained, no false saved/undone state, one durable mutation after verified commit. Retry checks owner/source/target again. The pending-recovery Discard drops pending intent only; explicit destructive history removal is a separate §5.5 action; export is not save/undo success. Keep original append collision and acknowledgement controls. |
| B09 account/lifetime | A→B, locked, return A with epoch/generation changed, migration during pending operation, deleted/archived/moved target, route/board/modal departure and reload | No A draft/preimage leaking or writing to B; current data untouched; owner fencing not bypassed by returning account name. Pending error retained in appropriate parent; navigation cannot silently throw away proposed migration/undo. Successful receipts are co-committed and rediscovered after reload; unresolved memory intent is held/exported explicitly under §5.5. No session expiry or permanent-history promise is inferred. |
| B10 consumers / host | Actual registered App route and real storage hooks with board/table/detail/export and Calendar/Timeline/Planner callbacks | Same committed counts and exact real titles everywhere; no inconsistent counts after retry/undo/reload. Real account host plus native new document; synthetic fixture result clearly labeled and insufficient alone. |
| B11 visual / keyboard | EN/ZH 375/414/768/1024/1440 widths, actual editor and recovery/legacy/undo states; themes, long titles; before screenshots | All new controls readable, contained, usable and ≥44×44 applicable targets; clear automatic vs manual/unknown state, visible error and undo availability; trusted keyboard/add/toggle/cancel/undo once; per-stop visible focus; real screenshots manually judged. No generic screenshot metric replaces UI inspection. |
| B12 immutability / regression | Fixed product tree, package tests and accepted caller sources, old failures and oracle contradictions frozen | Exact reviewed allowlist, no shared source drift; full accepted regressions and judging copies in §8; original business failures kept. Old tests requiring fabricated rows get versioned reviewed oracle corrections, not silently weakened assertions. |

Native evidence uses owned isolated server, streamed immutable `git archive`, requested/resolved SHA, archive byte count, lockfile and @repo resolution guards, output refusal on collision, preserved exit codes and preconditions. Pipe CDP and trusted events only; no `nativeVirtualKeyCode`, passive key audit retained. Original pixelFocusWalk identity remains hash-bound; new measurement methods need prior full qualification and independent adoption. Export evidence must verify downloaded bytes/filename from disk including raw-source recovery, not merely Blob creation. No service/provider/real-account claim based only on synthetic HTTP or seeded account objects.



## 10. Complete retained evidence obligations (immutable source text)

## 8. Complete evidence gates, affected callers and canonical G1

Fresh contract review first; reviewed before oracles and raw evidence before implementation; separate implementer; independent fixed verifier; actual cross-vendor verification remains **yes**; fresh Astra full-scope acceptance; root-only reconcile; independent inventory. Same-caller stage authors must be fresh and not any earlier author; reviewer never fixes. Missing provider/real-host/budget/decision gates stay explicitly blocked.

| Evidence ID | Required producing artifact / acceptance gate |
| --- | --- |
| R01 | Fixed-source/input hash ledger, actual unit-history reconciliation, reviewed §5 representation/operation/lifecycle references and closed technical admission findings, full B01–B12 oracle consistency matrix; positive/negative controls and correct source assertions frozen before runtime. |
| R02 | Before source/raw JSON, operation/input provenance, per-case logs, zero unexpected PRECONDITION, exact expected failures and passing controls; real append vs field vs three automatic entrypoints distinguished. |
| R03 | Real registered App before, account source shape/ownership, mutation counters and native trusted interaction; before screenshots and raw downloads. Synthetic host supplement clearly labeled. |
| R04 | Exact implementation commit, reviewed path/delta receipt, retained old expectations plus qualified versioned corrections; author checks with exact archives and disclosed costs. |
| R05 | Independent unchanged B01–B12 fixed assertions, source and inverse raw-data comparisons, error/recovery/account/migration and export roundtrips; every §5 conversion/inverse/lifecycle branch, all three automatic entrypoints. |
| R06 | Real App/native fixed: new-document reload, true browser second document/conflict, account epoch transitions, trusted drag and keyboard, actual disk recovery downloads; no provider claim without actual provider evidence. |
| R07 | EN/ZH five-width/theme visual+keyboard manual review, focus measurement identity, target sizing/containment and protected CSS invariance; source before/fixed screenshots. |
| R08 | Board core/workspaces/views focused+full tests/typecheck/lint and Web host tests/check-types/lint; storage check-types; immutable P0 controls; consumers Card/Table/dialog/export/Calendar/Timeline/Planner plus task-link/append/creator/composer/workspace recovery. Historical expected failures retained with reviewed oracle adjudication, not summarized as full PASS. |
| R09 | Accepted callers and canonical Clock r2 **all Required evidence E1–E25**, enumerated below. Each item has producer commit/path/full SHA-256/verdict and before/fixed source applicability. Historical valid evidence reused only under reviewed hash/source invariance; genuinely affected units rerun only after inherited-budget admission. No broad exemption. |
| R10 | Actual cross-vendor full-scope report (independent Codex does not qualify); fresh Astra acceptance reconciles original action and all B/R rows, rederives hashes, examines native screenshots/downloads and preserves every unresolved residual. |
| R11 | Root serialized receive/source preservation/integration receipt, full 312/933+6 equality and unchanged formal states, caller evidence append only after acceptance, remote ancestor and normal sync-check. Worker never mutates global ledger. |
| R12 | Fresh independent inventory from accepted integrated SHA, preserved original evidence/failed attempts/budgets and remaining gaps; no caller acceptance→automatic item completion or release inference. |

**Canonical Clock r2 matrix retained, not replaced by a shorter BRD matrix:** E1 frozen oracle/runner/lock/@repo/seed/spy/consistency; E2 six-mode before with controls; E3 actual App host before a–q and census; E4 native before/focus/geometry/K-1; E5 Clock F1 before c1–c5; E6 exact implementation+author gates; E7 six Sol fixed modes; E8 App host a–q; E9 native 17-value controls, reload, read errors/lock/uncertainty/conflict/retry/discard; E10 seven native export shapes and setup failure; E11 native host a–q, both auth branches; E12 downstream/event/other-key/chrome invariance; E13 EN/ZH five-width/pet/44px/selector screenshots; E14 keyboard/per-stop focus all states/themes; E15 all **16** frozen F1 invocations (12 base + two Appearance K-1 + two rail); E16 Clock F1 c1–c5 fixed; E17 Header host/native/Astra/Sol including registered buffer copies; E18 source-search counts; E19 protected diff; E20 storage types/lifecycle; E21 widgets full gates and before control; E22 grid full gates and before; E23 Web/rail/CmdK gates; E24 all accepted-caller suites; E25 item-by-item hash/verdict/refusal/capacity receipt. This does not assert that incomplete Clock gates are passed by BRD work or ask this worker to execute them. Root must reconcile current adopted Clock evidence at later integration, preserving r2 and versioned method/baseline amendments.

E24 full judging obligations: AppRail eight modes bytes26/domain31/merge21/drag18/field24/continuity-export22/host33/original123, parent31; Appearance bytes65/fields89/reset34/queues56/host33/retry-all48/original187, host33/package137, frozen continuity-export24/26 plus **OE26/26**; Features bytes17/fields49/reset31/queues40/continuity-export26/original6, host40/package45/readers17, frozen downstream13/15 + **C-FD1 diagnostic14/15** + **C-RD1 judging15/15** (case014 only C-RD1); More fields22/reset20/queues14/owner-export13/original15/host11, frozen boundaries recorded plus **C-FB00210/10** judging; Sticky109/original10/host28; Notifications41/boundaries24/Astra host15/parent12; Date & Time7; Smart Lists/Collaborate/Pomodoro accepted host copies per AppRail final §6; settings-shell54/settings-rest314. Counts are historical predictions, not this turn's results. Full canonical files and all original/corrected runner/evidence families are manifest-bound. Any changed shared source/selector removes a prior invariance-based exemption and requires fresh affected engine/hook/caller/native review.

Capacity or product-delta refusal logs count and stay immutable. Only independently reviewed copies with exact stricter source preconditions/capacity changes may be admitted; business assertions/fixtures stay byte-identical except a separately reviewed oracle correction for B01/B07. No probe, qualification, command launch, external vendor call or native attempt is authorized by this proposal.



## 11. Complete retained writer inventory (immutable source text)

## 2. Exhaustive Board writer census and required participant disposition (T1)

Coordinates below are at fixed parent/P0, not moving root HEAD. W denotes a proposed ordinary mutation receipt/token update; X forward completion; U terminal inverse; C explicit genuine conversion. **All current Board mutation paths lack the proposed token/capsule checks.** Existing accountScope physicalKey checks local handle identity and deletion tombstone, but does not prove the committed-generation marker still matches in another document. No current sync Board setter has a cross-document dataset lock. All proposed participants must use §3, or be explicitly refused by the protected boundary.

| ID | Actual entrypoint, owner/key and current ordering | Required disposition and post-await proof |
| --- | --- | --- |
| W01 | workspaces/BoardWorkspacesModule.tsx:339–441; usePref xai_boards_v2, mount stable-absence seed:393, writeActiveBoard:421 and writeLists:431. Captured render arrays plus sync setter. | Adopt one async Board command boundary. Authoritative source after locks; stable absence + current complete marker before seed; never seed unreadable/invalid. Render data is a draft, never a fresh-write base. Seed gets fresh incarnations, no invented checklist rows. |
| W02 | Same module:448–551 and 684–688; label create/edit/delete+strip, member create/edit/delete+strip, board name/icon/description/cover and visibility. These rewrite the whole Board value even when checklist fields do not change. | W preserves unknown Board/card/list/envelope fields and all receipts. Recompute narrow requested delta from fresh source; unrelated fields do not seize done ownership. Expose pending/error to parent recovery; do not clear inputs based on enqueue. |
| W03 | Same module:775–931, detail patch/updateCard/patchActiveCard; list color, card rename/order/archive/restore/delete; list rename/order/archive/restore/delete; calendar/table/planner date/priority callbacks share updateCard. | W updates affected incarnations/existence/representation/done tokens. Deletion retains target descriptors and receipts at surviving Board level; archive status blocks U while archived. Move preserves same live incarnation; deletion/re-add is new even with same visible ID. |
| W04 | Same module:632–680 mount/day/manual; :780–790 genuine cross-list move executes preset on all moved-board lists with sortDueDates:false, including move out of Done. | X/C/U use same boundary as W. Decompose move/completion/actual normalization/urgent/sort, preserve semantic Done and archive exclusions. Co-commit projection plus receipt. Consume live trigger only after verified durable state, before publishing rerender. No-op does not mint history. |
| W05 | internal/useBoardDetailSaveRecovery.ts:156–230 and modal append; checklist, attachment, activity stable append IDs, source comparison, scope/readback; ordinary checklist toggle/text/remove is W03, not this hook. | Async adaptation retains original latest-draft/collision/exact-source controls. Current target and incarnation rechecked after acquisition; exact raw/receipt readback then owner recheck. Both modal getChecklistItems and hook checklistItemsFor must stop synthetic Item rows together. |
| W06 | internal/useBoardComposerRecovery.ts:submit, card/list creation; baseline captured, ID stable, save callback then clears pending. | Adopt §3, capture draft in host-owned registry before first await, revalidate destination and latest draft revision. Assign new card/list/row incarnations; preserve pending on quota/readback failure, never queue a Promise as successful boolean. |
| W07 | internal/useBoardCreateRecovery.ts:create: ordered Board save then active-board selection; stable proposed board ID and partial-success flag; BoardCreator calls parent void callback. | Board save participates; then release lock and separately select only after post-await owner/source/created-board proof. Retain partial success so retry opens same board. Workspace must still exist; lock xai_board_workspaces with Board for creation/membership check. No cross-key atomic claim. |
| W08 | BoardWorkspacesModule:707–757 deleteBoard selects remaining board first, deletes from array, last Board recreates defaults, ignores save result and closes confirm. | Proposed order: loss guard first; one protected destructive Board command with exact target/history digest; verified Board commit then captured-owner selection. Failed commit does not close dialog or change selection. Last-board replacement is explicit destructive scope, fresh incarnations, never unnoticed history loss. No separate resetBoard function exists here; last-delete reseed and mount seed are the reset-like paths. |
| W09 | internal/useWorkspaceSaveRecovery.ts:run; writes xai_board_workspaces or xai_active_board only; reads Board for pick and nonempty-workspace deletion. No actual Board workspaceId move function found in current Workspaces source. | Dependency participant, not miscounted as raw Board writer. For creation/empty-workspace deletion use same L and sorted workspace/Board key locks; pick/departure calls recovery guard before selection. Revalidate Board membership after await. Existing UI callback booleans need awaited outcome. Do not invent an absent Board-move implementation. Future move would require registration. |
| W10 | board-core/src/BoardModule.tsx:53–105 and writeLists, exported registration; ordinary add/list/card/color/move/archive/delete, seed queued microtask. | Not current /app/board registration, but an exported actual writer, not globally unreachable. Adapt to protected Board boundary including queued seed owner/source checks, or refuse its invocation before controls claim success. This proposal selects adaptation. |
| W11 | board-views/src/BoardModule.tsx:83–129, seed effect:102, ordinary handlers to :256 and detail/view callbacks. | Same as W10; all ordinary saves/seed token-aware. Neither an unused route nor spread syntax proves writer isolation. Current route reachability and public export reachability are distinct. |
| W12 | workspaces/internal/taskLinkCommand.ts:saveLink first persists pending Board taskLink, awaits mutateCanonicalDataset(xai_task_cols), then rereads link and writes acknowledgement. Task mutation callback also rereads Board. Parent await at BoardWorkspacesModule:1051. | Three-phase saga in §3.3. Both Board writes are W, preserve capsule and incarnations; canonical task phase adds Board read lock at the same account acquisition, without nesting/reacquiring L. Revalidate owner/marker/board+card incarnation/pending intent before task commit and after await before Board acknowledgement. Old A task completion cannot publish UI into B or acknowledge a replacement card. |
| W13 | storage/internal/storage.ts:setPref/removePref and usePref setter/reset. Sync raw writes; setPrefAccount/removePrefAccount route through mutatePref. Registry Board type is unknown JSON; generic JSON validation allows capsule loss. | Board key explicitly protected at all four public paths. Legacy sync calls refuse Board before equality fast path; general async mutatePref refuses Board replacement/removal. Dedicated protected dataset API alone may write Board after owner-provided validation. usePref reads stay supported; this is not automatic activation of Task canonical format. |
| W14 | storage/internal/accountScope.ts:createScopedStorage sync setItem/removeItem and coordinated async variants. Async only L, canonical Task/Calendar denied but Board allowed. | Deny Board through every raw scoped setter/remover, including injected-storage variants. Board core uses dedicated API; no exported boolean bypass or token forgeable through a JSON option. Raw native Storage in arbitrary old code cannot be patched by this API. |
| W15 | storage/internal/accountMigration.ts:migrateAccount. Exclusive account lifecycle lock, reads unassigned and previous-generation raw records, writes archive/journal/candidate, awaits secrets stage+verify, asserts handle and rereads exact sources/marker before marker commit. Board validator presently isBoardArray only. | Retain exclusive L and last-marker commit. Exact registered Board validator/transform participant must cover selected imports AND previous-generation Board copies, after every await/source reread. Board history remains raw-preserved in archive; candidate transformed only by reviewed §5 rule. Missing participant refuses migration involving Board, even when selected list omits it but copiedSource contains it. |
| W16 | same file rollbackAccount: exclusive L, journal validates previousRaw then directly changes/removes committed-generation marker. No Board data write needed to reactivate old Board tokens. | Treat as a writer of reachability. Before marker change reconcile current/previous Board histories and retired U set; never re-expose an old executable journal head. Proposed fresh-generation forward restoration in §5; no silent in-place overwrite of archived generation. |
| W17 | storage/internal/accountDataLifecycle.ts:deleteAccountLocalData sync prefix eraser; deleteAccountLocalDataAccount exclusive L wraps it; resume/complete deletion exclusive L erases all generations after durable tombstone. Settings accountDeletionRecovery adds deletion-workflow lock around phases. | Sync public eraser must refuse standalone invocation; internal eraser only under typed validated deletion receipt and exclusive L. Preserve resume of already-confirmed deletion and captured A authority, not mutable B. New requests require §6 grant before server call. Account exclusive excludes Board L-shared writers; no Board K is acquired backwards. |
| W18 | settings-shell/internal/resetAllPrefs.ts:29–44 loops all registry xai_ keys including Board using removePref; ignores boolean failure; SettingsFooter:83–96 warning mentions preferences, not Boards. | Global controlled reset is a real Board-loss path. Freeze/guard before the first removal/default event. Result-aware async reset, exact loss grant, no partial reset before Board admission; see §6. A denied Board remove must not produce a blanket success/default event claim. |
| W19 | core/internal/storageContract.ts:migrateBoardStorageRawToEnvelope, preserveBoardStorageFormat, projectBoardStorageEntities; exportImport.ts:create/read payload and boardImportStorageValueFromPayload. Pure constructors, no physical writes; no production caller of Board import helper found outside its barrel. | Read/constructor participation §5, not fictional live importer. Preserve full metadata/capsule in storageValue, boards and logical Board payload. Any future persistence of import must use explicit replacement command; raw setter cannot activate imported tokens. |
| W20 | accountDataLifecycle.ts:exportAccountLocalData; settings-rest/accountPane.tsx downloads current-generation raw records; DeviceRecoveryExport reads unassigned/archive data. | Read/export surfaces do not write Board, but determine loss-grant validity. Current account export omits prior/candidate generations; it is insufficient for account-wide deletion proof. Download request is not verified export. Raw recovery bundle and reselected-file digest verification §6 are required. |
| W21 | scoped physical key source census across apps/packages, including setup/test fixtures and separate Desktop project adapters. | No production raw localStorage.clear writer was found in the Web app source examined. Test/setup clears and documentation/native drivers remain immutable evidence, never participating product clients. Task/Calendar/Metric/Pomodoro/Time Tracker own other keys; Desktop plugin-project owns xai.plugin-project.cards/RepoAdapter and is not this dataset. No account-sync/cloud or Desktop grant. |

The census is based on raw Board-key/constant references, every setRawBoards/writeActiveBoard/writeLists call, generic registered/scoped writers and account prefix erasers/marker writers, plus public import/export and host call sites. Pure boardOps/automation helpers are transformations consumed by these writers, not independent storage writers. There is no claim that arbitrary external JavaScript, DevTools or an old loaded build cooperates. Dataset semantic ownership excludes simultaneous BRD-18/task-link, BRD-28/import/export, ordinary-field/list-lifecycle work; shared storage/account/host reservations extend to affected caller work even in another worktree.



## 12. Canonical Clock r2 section14 (verbatim)

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- **Judging copies.** The frozen More `boundaries`, Features `downstream` (cases 012 and 014) and Appearance `continuity-export` (cases 006 and 007) failures are judged by their copies: C-FB002, C-RD1 and OE. C-FD1 runs beside them with its predicted outcome and judges nothing. A judging copy that fails is a regression.
- **K-1 and transport.** Every native runner written for this caller uses pipe transport, sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged, with their frozen transport (AppRail acceptance §6 item 10).
- **Drags.** Native drags use trusted CDP input only (§12 rule 14).
- **Product-delta preconditions.** A reused frozen runner may refuse at a precondition bound to an earlier caller's product delta. The verifier then commits that refusal log, and runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance and AppRail E24/E25 precedents, and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.
- **Capacity copies (pre-registered; AppRail acceptance §6 item 10).**
  - **When.** A reused frozen runner aborts with `ENOBUFS` (or any buffer-capacity error) while reading `git archive`, before any test runs.
  - **What the verifier does.** It commits the refusal transcript. It then runs a copy that differs from the frozen runner only in the archive buffer (sized from the measured archive, at least twice its size, or replaced by streaming) and, if the copy lives in a deeper directory, in its `root` depth, plus a header comment.
  - **Requirements.** The copy's diff against the frozen runner is committed. Staged test and fixture files must be byte-identical to the frozen ones. Counts must equal the accepted receipts and the `f9eb4b1` control.
  - **Pre-registered for:** the four Dashboard Header runners (E17), whose 100 MiB buffer is below the `f9eb4b1` archive.
  - **Applies on refusal to:** the three 200 MiB F1 runners `verify-f1.mjs`, `verify-f1-callers.mjs` and `verify-f1-race.mjs` (E15). Their buffer, 209,715,200 bytes, exceeds the 173,905,920-byte archive at the r2 docs head, but later evidence may outgrow it.
  - **Status.** The copy procedure is not a contract revision and needs no separate ruling batch; acceptance reviews each copy.
- **Not rerun.** The Features native host and downstream suites (Features E12/E13) and the AppRail native E9–E14 are not rerun. Their subjects (Features rail departures and drags, and AppRail's own surfaces) are outside the Dashboard packages, and the empty shell, `App.tsx` and tokens diff (E19) plus the `.app-rail`/`.topbar` invariance (E12) bound them. If either bound fails, they must be rerun.



## 13. Sole static integrity receipt

The following PASS is byte/schema/document preservation only; the whole technical verdict remains REVISE. No runtime was performed.

{
  "status": "STATIC_INTEGRITY_PASS_DOCUMENT_VERDICT_REVISE",
  "review_iteration": 2,
  "review_cap": 3,
  "static_invocations": 1,
  "checker_pid": 45055,
  "owned_git_catfile_pid": 45141,
  "owned_git_catfile_exit": 0,
  "owned_git_catfile_eof_drained": true,
  "source_manifest_identities": [
    15257,
    20349,
    25632,
    30933,
    36229
  ],
  "source_manifest_logical_bytes": [
    599507673,
    809019467,
    1021880677,
    1242635023,
    1470790515
  ],
  "total_manifest_identities": 41547,
  "categories": {
    "external": 1,
    "git": 41530,
    "tree": 16
  },
  "unique_git_objects": 4254,
  "raw_git_bytes": 210767078,
  "logical_bytes": 1761268603,
  "hash_mismatches": 0,
  "original_ordered_rows": 312,
  "original_fields": 2808,
  "literal_module_labels": {
    "web（project-system）": 30,
    "web（跨模块验证索引）": 9
  },
  "normalized_modules": {
    "web": 213,
    "app": 22,
    "plugin": 16,
    "sync": 41,
    "admin": 16,
    "site": 4
  },
  "nonempty_gate_obligations": 150,
  "original_gated_policy": 118,
  "formal_counts": {
    "completed": 13,
    "verification_pending": 3,
    "in_progress": 3,
    "pending": 293
  },
  "unclosed": 299,
  "original_evidence": 933,
  "retained_evidence": 939,
  "four_TT08_docs": [
    "packages/plugin-web-time-tracker/docs/api.md",
    "packages/plugin-web-time-tracker/docs/design.md",
    "packages/plugin-web-time-tracker/docs/dev_log.md",
    "packages/plugin-web-time-tracker/docs/test.md"
  ],
  "runtime_diff": [],
  "candidate_groups": [
    24,
    40,
    9,
    7
  ],
  "candidate_all_ungranted": 80,
  "runtime_categories": {
    "runtime": 0,
    "tests": 0,
    "build": 0,
    "lint": 0,
    "browser": 0,
    "native": 0,
    "server": 0,
    "qualification": 0,
    "probes": 0,
    "vendor": 0,
    "children": 0
  },
  "failure_receipt_sha256": "491368935b58e8fa32c6b5e80bae72419ac06ecef1e747d53acbac46bbf9ce50",
  "card_sha256": "ba423c32dc1b15df74f8f68dcac96f35e31b0e658e90d6cc8b180ec3433a65a8",
  "prior_author_failure": "RETAINED_FAILED",
  "prior_review1": "RETAINED_FAILED_NO_ARTIFACT",
  "actual_billed_usd": null,
  "source_receipts": [
    {
      "source": "5fa4cccb106d10e16562e0a8d6f3b103495607b1",
      "parent": "41295a0f57728d93bb764f3679f5e2f3dafb86d4",
      "integration": "aec56c13dbd01a95899f62dec8b8755f09897f7f",
      "document": "docs/reviews/audit-parallel-brd12-preparation-r2/contract.md",
      "document_sha256": "666d493bbd924c64267a822d5fd9ec97f94bb55ab37340f43aa6588f5b209000",
      "manifest": "docs/reviews/audit-parallel-brd12-preparation-r2/inputs.sha256",
      "manifest_sha256": "1fb39fa30057dedf964b716e80f026818c96d71bada6156e745eaa6b93cd24da",
      "identities": 15257
    },
    {
      "source": "cdb8820b434aa7f2adb9cc5ad5f14118eb24230c",
      "parent": "9262f5f31128bc6bbf5de54e9c24238c58227d0e",
      "integration": "197e6de47d598df601d99ba978eeaa7a095b335c",
      "document": "docs/reviews/audit-parallel-brd12-contract-review-r2/review.md",
      "document_sha256": "9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810",
      "manifest": "docs/reviews/audit-parallel-brd12-contract-review-r2/inputs.sha256",
      "manifest_sha256": "48e8d4bbc84d99e8bbe5f9336d56c6a8652f653ba8a60349e2ee0d6279c8dec2",
      "identities": 20349
    },
    {
      "source": "11d6527709a5a735200151768296a312a3a30314",
      "parent": "53a961aaa4ae87e1453f27d91af3c8edd6ddaeeb",
      "integration": "8695c64d04a509f16959a683fcba0e64e33c9e20",
      "document": "docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md",
      "document_sha256": "5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53",
      "manifest": "docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/inputs.sha256",
      "manifest_sha256": "63bbf0af40529bc0765910fad3329713380a5d4292229abc8d3ad076a75d43db",
      "identities": 25632
    },
    {
      "source": "68d0f14b243a1becb70811ca01a503cdcd244022",
      "parent": "b9ed5f63256620b1135ba9e782f08992923bd3c4",
      "integration": "5b5214868aca9e99f8fd738a88287bfa384b0116",
      "document": "docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md",
      "document_sha256": "e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf",
      "manifest": "docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/inputs.sha256",
      "manifest_sha256": "89b21d0a905ce4a62e5969a3c0cf5a44399f383c3f1d7295643e5c1fe0171f2d",
      "identities": 30933
    },
    {
      "source": "3a7d5f1b8a448ac44ac6d5090af63a6a81097546",
      "parent": "bd4dce4aa7a5b96d533b7a570b5bfb97843f392b",
      "integration": "84f0048a74c34bfef2b463e3b525b514e67586d2",
      "document": "docs/reviews/audit-parallel-brd12-technical-contract-amendment-r2/contract.md",
      "document_sha256": "6d29bcaad40daaea334b4c8094e1ca386a9c74da6451255e4701badba0a0cca9",
      "manifest": "docs/reviews/audit-parallel-brd12-technical-contract-amendment-r2/inputs.sha256",
      "manifest_sha256": "f7d1af5519781bb72ab7b6694349687fee8d50200fc163a48608d0c6dcaecb2d",
      "identities": 36229
    }
  ]
}

Input-manifest SHA-256: ca2d9d91b035339589d2e72d8a032f2e4ecac6a53068f53593cbe80d52af7b10. Both full buffers were constructed after all input assertions and before either write. Actual tool drain/exit and source commit/output hashes are supplied in the final Handoff.
