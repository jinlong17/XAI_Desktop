# BRD-28 complete source machinery impact r2

**CONDITIONALLY FEASIBLE SOURCE PROPOSAL / UNADOPTED.** Module web, workflow A; fresh impact author2/3. The existing Option C helper-only/no-UI branch is resolved. This proposal does not reopen that choice or authorize production backup UI. Full export preview, schema/reference validation, actual isolated trial restore and error rollback remain mandatory. No source implementation, product/schema/key/API change, method qualification, caller acceptance or formal closure is granted.

## 1. Fixed authority and task boundary

Actual clean dispatch parent: 28ba1cf444f2545fb93dd0340204530e07f8f6f6. Fixed task input remains aed09103a71c7e939ffc71d23c7b9b802ac47b51. Product P0 remains f9eb4b1f207bc4b46f547b90afc250424b3c8695. Original full proposal ce9eef6cb50b592e05593dc800ed3439615f7458 and full independent review2 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe are root-adopted documentary inputs only. Exact reviewed BRD-12 T1-T4 basis is 68d0f14b243a1becb70811ca01a503cdcd244022; its underlying impact 11d6527709a5a735200151768296a312a3a30314 and conditional contract review cdb8820b434aa7f2adb9cc5ad5f14118eb24230c retain their own distinct histories.

The exact task card is docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd28-source-machinery-impact-r2.json at actual dispatch parent 28ba1cf, where it exists. It is not bound to fixed aed or an earlier author parent. Dynamic registration is execution-state.tasks (a LIST), not initial task-registry. All complete source-output documents used here are explicitly indexed at their actual source and each applicable fixed/integration/dispatch identity, in addition to the inherited input manifests, which normally omit their own output MD. An absent file at an earlier revision is recorded as absent rather than fabricated into an identity.

Own checkout is /Users/lijinlong/.codex/worktrees/audit-parallel-brd28-machinery-impact2-20261010/XAI_Desktop. Exactly two ADD paths are writable: this impact.md and inputs.sha256. AGENTS/CLAUDE, shared workflow/multi-machine rules, full original goal and authority-overlay, goal-A, scheduler and exact card apply. Root owns remote preservation, integration, controls, ledger writes and sync. No push/fetch/sync-check, other-worktree reads/writes, child delegation, global-control mutation, product/test/config/CSS/runner edits, merge/rebase/promotion/deployment/release/D3 are authorized. Configured Astra is not independent-provider or cross-vendor attestation.

Original action: 将Board导入导出合同接成可用备份入口或明确尚无UI.
Original acceptance: 导出预览、schema/引用校验、试恢复和错误回滚可验证.
BRD-28 remains P2 / 决策 / web / 当前范围 / pending with empty item evidence. The complete original record, B01-B13, R01-R12, T1-T4, canonical Clock section14 and historical artifacts are retained in full source appendices below. Empty item evidence is not zero historical cost.

## 2. Source-grounded public and storage boundaries

| Actual P0 source/export | Observed contract | Machinery consequence |
| --- | --- | --- |
| packages/plugin-web-board-core/src/internal/exportImport.ts: createBoardExportPayload(raw: unknown, options?: { exportedAt?: string }): BoardExportPayloadResult | Pure readBoardStorage plus export construction; legacy array becomes envelope, existing envelope retained. Empty/invalid source refuses. | Snapshot raw storage before mounting/seed/automation. Fixed exportedAt is declared fixture input; current timestamps are not silently ignored. |
| Same: readBoardExportPayload(raw: unknown): BoardExportPayloadReadResult | Checks payload kind/version/key/source, separately valid boards/storageValue, logical shapes and sorted joined IDs. It reconstructs the returned top-level payload. | Full equal-ID but changed payload/parent/type/order probes remain required. Returned projections and unknown metadata must be compared under a documented representation rule; ID equality cannot close graph or roundtrip. |
| Same: boardImportStorageValueFromPayload(raw: unknown): BoardImportStorageValueResult | Returns validated storageValue and its boards; no physical commit or rollback. | This is the real conversion entry for isolated trial. Calling it is not a restore test. An actual disposable adapter must receive and reload its returned value under an explicit trial protocol. |
| Same exported types and src/index.ts public barrel | valid/invalid discriminated results; invalid reason string, null payload or storageValue/boards. | Preserve public compatibility until a separately adopted exact amendment. No test-only hidden parser or monkey-patched production writer may stand in for public evidence. |
| core internal/storageContract.ts, isBoardArray.ts and src/types.ts | Array/v1 envelope and items-first logical projection; no full reference validator. | Lossless raw/decoded/projected correspondence and scope-qualified identity maps are additional validation requirements. Both representation absence/presence and ordering are meaningful. |
| core internal/accountMigration.ts | Registers isBoardArray for xai_boards_v2. | Explicitly differs from readBoardStorage's envelope support. Both selected legacy input and copiedSource need reviewed participation. |
| storage internal/accountDataLifecycle.ts: exportAccountLocalData(scope, storage=localStorage) | Captured owner current-generation raw records plus manifest, credential exclusions; intentionally permits captured-owner export after auth change. | Public exporter is not UI authorization. Visible account UI must recheck current capability and mask A outside A. Export excludes prior/candidate/unassigned/archive data, so it cannot acknowledge all-target deletion loss. |
| storage internal/accountMigration.ts: migrateAccount(input): Promise<GenerationMarker>; rollbackAccount(input): Promise<GenerationMarker|null> | Exclusive account lifecycle lock; migration archive/journal/candidate/marker-last. rollback re-exposes previous marker after journal checks. | Migration is not arbitrary backup restore. Rollback can revive old capsule state unless independently amended to fresh-generation restoration with retained terminal history. |
| settings-shell internal/resetAllPrefs.ts: resetAllPrefs(): void | Iterates registered xai keys, calls removePref without checking false, then emits seven defaults. | A Board-only refusal is insufficient. Preflight before first removal/broadcast, result-aware partial outcomes and retained recovery are required before any reset claim. |
| storage internal/accountScope.ts, storage.ts, prefMutation.ts, accountCoordination.ts | Scope/physical key and raw scoped IO; generic preference commands; lifecycle L names exclude generation. | Correct actual implementation is accountScope.ts, not the nonexistent internal/scopedStorage.ts named in older prose. Preserve older documents unchanged; use actual path in any future exact card. |
| settings-rest panes/accountPane.tsx | Local-account download and requestAccountDataManagement; copy explicitly denies cloud backup/direct restore. | Actual Blob/URL/anchor and independently observed disk file are required for a download claim. No production Board file action is introduced here. |
| storage AccountDataGate.tsx | manage locks before inspect; storage generation events revoke scope synchronously; keyed account subtree may disappear. | Pending intent must already be retained before first await/unmount. A local component cleanup cannot supply lifecycle protection after the fact. |

Current public API signatures above remain current facts; every proposed signature below is unadopted. The source copies and corpus are hashed; reading or hashing source is not runtime proof.

## 3. Finite data graph, representation and error contract to amend

The backup scope remains the existing Board payload. Evidence must inspect the larger graph without silently adding fields or keys to the production export schema. Exact logical keys: xai_boards_v2; xai_board_workspaces; xai_active_board; xai_board_panels; xai_board_inbox; xai_board_view_by_id; xai_board_filter_by_id; xai_task_cols. Bind each observed raw value to the captured physical owner/kind/account/generation/epoch and registry ownership, never a current-account lookup after an await. A sidecar fixture/evidence graph is not an adopted product bundle.

Validate board/list/card IDs and owner domains separately, typed collection membership, order and parent coordinates, Board catalog label/member references, workspace directory, Task reciprocal/source identity and pending link, active/panel/view/filter/inbox links, checklist real row IDs/counts, attachment/activity/date and archived/deleted targets. Compare storageValue.boards, payload.boards and full logical records/payloads. Build maps by structured owner+entity coordinates; newline-joined IDs and raw IDs alone are insufficient. A legal repeated ID in a different documented domain is not silently merged. Empty/duplicate/ambiguous coordinates refuse according to reviewed shape rules, without inventing a narrower existing identifier grammar.

JSON input has finite bytes, nesting and node/record sizes, but this author chooses no arbitrary numeric product limit. The next exact contract must derive supported bounds from existing owning schema plus measured admitted serialization/resource configuration and review them before runtime. Source methods must refuse a configuration with missing bounds before opening evidence actions; no truncation or minimum document-length proxy proves completeness. Property absence, null, false, zero and empty arrays remain distinct. JSON cannot represent undefined; unrepresentable in-memory claims cannot become fictitious disk guarantees. Preserve original byte strings plus semantic projections rather than relying on stringify equality as raw preservation.

Unknown ordinary envelope/Board/list/card/payload metadata remains recoverable losslessly. Unsupported protocol version/capsule/collision refuses execution while preserving readable owner-authorized raw export. External HTTP attachments remain URLs; no media/provider fetch or authorization is implied. Unresolved workspace/Task references are explicitly reported. Live reconciliation remains blocked without a separately adopted policy; no automatic creation, unlink, merge, replacement, orphan cleanup or deletion is proposed.

Proposed finite Board-owned pure interfaces for a later contract amendment:
- inspectBoardBackup({rawText, exportedAt, externalSnapshot}) -> valid {payload, canonicalBoards, graphReport, rawDigest, scopeManifest} or invalid {reason, retainedRaw}. externalSnapshot is explicitly a read-only evidence input, not an executable account token.
- prepareBoardBackupTrial({inspection, destinationSnapshot, mode:"isolated-trial"}) -> a content-bound plan or refusal. A plan records exact source/destination digests, representation, graph report, affected physical test-store keys and deterministic proposal; it has no live commit authority.
- executeBoardBackupTrial({plan, isolatedStore, faultSchedule}) -> verified-trial / verified-rollback / refused / uncertain / recovery-required with step trace and retained originals/candidates. This is an oracle adapter, not a public production restore API.
These are source-feasibility responsibilities, not an API adoption. Existing export/import public names remain available; an amendment must decide exact compatible return additions and documented error mapping before editing the barrel.

Required finite error classes: malformed/unsupported kind-version-key-source; representation-mismatch; duplicate/ambiguous identity; invalid graph; unresolved external reference; unsupported metadata/capsule; source/destination changed; wrong account/generation/epoch; deleting/deleted; lock unavailable; read/write/remove denial; quota/serialization capacity; readback uncertain; rollback conflict; rollback failed/recovery-required; acquisition/source/config missing; terminal capture incomplete. Preserve original native errors as diagnostic cause without leaking another account. Refusal is zero commit writes; uncertain is not falsely recast as refusal or success.

## 4. Trial, rollback, history and all-writer coordination

The pure parse/preview/dry-run phase records every storage set/remove, marker/journal/capsule write and event and requires zero across all keys. It does not mount Board or call default factories. Raw pre-mount and mounted post-automation snapshots are separate evidence. Preview comes from the same admitted canonical plan used by trial, not a convenient duplicate projection.

Trial executes the actual public converter, then actual store writes in a fresh disposable adapter, then actual readers/consumers and fresh reload. Snapshot all isolated keys including absence before execution. Inject causal failure before and after each write/remove/readback and into rollback itself; preserve exact attempted/visible/verified/uncertain/rolled-back/recovery-required distinctions. The adapter must have no reference to the user's live storage and independently demonstrate no live-key/event effect. An expected fault must reach its intended step and rejection code; arbitrary nonzero or teardown failure is not a valid negative. Native App evidence separately proves route/account/download behavior; trial evidence never becomes a delivered live UI.

A future live adapter, if separately authorized, needs exact operation identity, original/proposal raw, captured lineage and source/destination digest; L shared then sorted existing physical K, authoritative read after grant, validation after every actual await and immediately before publication. Human/file interaction holds no lock. No K-to-L order or public reentrant lock acquisition. Success requires exact readback and still-current capability. Missing lock support refuses.

Uncertain retry reads first with stable identity. Exact proposal plus valid receipt/successor chain acknowledges zero writes; exact unchanged original may retry the same proposal; divergent or unprovable lineage refuses. Rollback restores only this operation's still-owned unchanged target. Newer edit/automation/task ack, delete+recreate, same-ID replacement, changed generation, tombstone or unprovable ABA blocks inverse. Failed rollback retains source/candidate/error and reports recovery-required. No old whole-array snapshot overwrites newer data, and sequential multi-key changes are not atomic.

The complete W01-W21 table and T1-T4 basis are retained verbatim in the appendices. Each future evidence row must resolve these exact participants:
W01 Workspaces ordinary/seed/writeLists; W02 metadata/catalog; W03 detail/list/card/archive/delete/consumer callbacks; W04 automation/move; W05 detail recovery; W06 composer; W07 Board create+selection; W08 Board/last-Board deletion; W09 workspace membership/selection; W10 exported core BoardModule; W11 exported views BoardModule; W12 Task-link's two Board writes plus awaited Task mutation; W13 generic preference set/remove/mutate; W14 raw scoped setters/removers; W15 selected AND copied-generation migration; W16 marker rollback; W17 account-prefix erasure/resume; W18 reset and default broadcasts; W19 pure helper import/export; W20 current/all-target recovery export; W21 shared/raw/alternate runtime census.

Ordinary async result adaptation must retain latest drafts; a Promise or truthy callback cannot clear pending state. Task-link remains a three-phase saga: L+Board K pending write/readback; L with sorted Tasks/Board read-participant locks for actual Tasks mutation; release then fresh L+Board K for current-incarnation ack. Preserve partial result/retry identity; no cross-key transaction claim or synthetic Task resurrection. Generic setters refuse protected Board before equality fast paths and do not become escape hatches.

BRD-12 immutable X and separate terminal U plus current Y ownership remain conditional on its exact independently adopted codec. Foreign/unassigned/file tokens are historical; newly captured local capabilities/incarnations never come from serialized IDs. Same-account forward generation copy needs proven continuous lineage and retained exact history. Rollback/restoration requires fresh generation with lossless validated current/prior terminal union; same-ID different history or missing raw evidence refuses. A digest is consistency, not authenticated authorship. No Item1 synthesis, projection-only success, silent retirement, quota eviction, expiry, unlimited retention or irreversible migration is permitted.

Known old/cached same-origin writers must actually be quiescent/reloaded to the admitted build before first capsule write/native acceptance. Two cooperative tabs, code scan, Web Locks or worktree separation do not prove that external condition. Uncooperative byte-for-byte ABA remains a disclosed limit.

## 5. Account scope, global loss and actual host lifetime

Real startup executes registerServiceWorker() and bootstrapObservability() in apps/web/src/main.tsx before createRoot, then StrictMode -> AppProviders -> RouterProvider, with real /app registration through shellRegistrations and BoardWorkspaces registration under AccountStorageGate/AccountDataGate. A standalone BoardModule panel is not the registered host. Both transport and no-transport AppProviders branches, public WebAuthSessionProvider, AccountDeletionRecoveryBridge, DeviceSessionBridge and TodoWebRuntimeBridge remain part of the source domain. Non-null managed configuration and real SDK HTTP request/response/auth/session implementation must be source-bound before host qualification; synthetic currentAccount objects cannot masquerade as provider evidence.

Conditional BRD-12 recovery host must live above routed/account-remounted children, register pending intent synchronously before first await, retain immutable captured-A data through controlled unmount and mask it immediately outside A. A' reentry requires new capability and source validation; same name does not restore old authority. A host at that placement cannot assume Router context; route adapter owns blocker integration. Sign-out must reach preflight before identity invalidation, preserve rail/Appearance/settings ordering, first-intent and release-once, and handle both coordinator/fallback branches. Remote auth revocation and generation storage events fence/mask synchronously; a dialog cannot postpone revocation.

AccountDataGate management, migration/import/rollback, reset, Board deletion and account deletion must reach the same exact loss preflight BEFORE their first effect. Complete target manifest includes current/prior/candidate generation Board raw data and reachable history/markers/archives under the actual destructive prefix. Source bytes and manifest must remain available for recovery, not only hashes inside a soon-erased prefix. Privacy deletion's old confirmed receipt retains its established authority and explicit missing-history-proof limitation; no fabricated retrospective export acknowledgement. New deletion requests require the separately reviewed durable fence before server dispatch; confirmed A cleanup may continue after A->B only under its exact durable receipt and must not wipe B.

Export click truth remains "download requested." Destructive authorization needs an independently verifiable file acknowledgement bound to the entire exact loss plan, or separately reviewed explicit discard of named retained history. A production reselection/export UI from the BRD-12 proposal is a conditional lifecycle dependency, not a new BRD-28 UI grant. Native evidence verifies actual disk filename/bytes, cancellation, denied Blob/URL/anchor/read, wrong/truncated file and post-export source change. Unreadable source cannot be promised backed up. No human-held locks; reacquire and compare exact target/marker before destructive effects.

Global reset must plan before its first key removal, await results, report partial/refused state, preserve unremoved keys and suppress false defaults. Browser Back/Forward, controlled reload, modal/switcher close and rapid competing departure are actual reachability cases. beforeunload warns for pending memory; crash/forced termination with denied storage cannot guarantee unsaved memory preservation. Same-account ordinary reload of durable history is not import or automatic inverse activation.

BRD-12 technical amendment currently present at dispatch parent is unadopted context, with failed technical-review1 preserved. It is not substituted for reviewed T1-T4 or root grant. None of these lifecycle requirements transfers original ownership to BRD-28 or authorizes protected edits.

## 6. Native machinery, loaded closure and original evidence emitters

Shared final five-row source f667a0b6996b4039d2c4e5ca28657953703e830b and independent review bdc06bd5b57f026caf6d7838563bfdae6f8684c9 remain conditional technical basis. P-HOST actual AppProviders/main/SDK/aux HTTP, P-ACT qualification-only seam with production hold, P-LEDGER synchronous immutable acquisition, P-FOCUS qualified native successor and P-OUTER enclosing streams/lifetime all apply together where used. This BRD report cannot approve a subset as an independent method.

Require exact consumed ReactDOM forwarding/untrack and SDK/runtime/config/browser-support source bytes, not version labels or declared package roots. Match loader resolution, Vite transform/import conditions and optimizer/cache outputs to actual served/loaded closure; unknown source/realm/preload/cache edge refuses. First executable main-world acquisition precedes React/SDK/startup; actual native setter/DOM-boundary and window-capture default-action records distinguish same-node wrong-then-corrected values, detached histories, checkbox/radio/select/reset and trusted input from later final DOM. Preserve native receiver/return/throw and transparent forwarding; no monkey-patching React internals or altered product success.

Complete synchronous-acquisition-v1 and all A01-A14 causal pairs remain inherited, plus all original TASK/MET controls where that qualified machinery is a dependency. MutationObserver/Profiler/rAF cross-checks and a quiet interval cannot replace captured intermediate states. StrictMode duplicate attempts, initial unknown identity, auth/generation transitions, new non-null document+loader reload, detached nodes and last writer/teardown interval must remain visible. No current source3 or native qualification is claimed.

Outer machinery must already enclose parsing/import/bootstrap/archive/server/browser, own actual child OS stdout/stderr pipes separately, preserve real exits/signals and late tails, and join descendants, stream EOF, pending writes and terminal close under one finite deadline with reserved teardown. Root tool output summaries, intercepted JS stream.write and serialized result JSON are not this evidence. Immutable seal occurs only after no writer remains; otherwise quarantine/UNKNOWN, never previous PASS. Original terminal cannot hash itself; enclosing receipt binds it after closure.

The complete outer-capture impact at dispatch parent is proposed/unadopted, not a grant to create infrastructure. Its legal separation, nine prospective paths and sixteen actual qualification groups need fresh full review/root admission. Shared author3/3 is exhausted; no author4, relabelled caller work or budget reset. At dispatch parent, source-byte collection actual3/3 and its failed concluding static/preservation remain unverified. Byte presence/mechanical preservation does not satisfy consumed-source/loaded-source or root-capture prerequisites. Keep current fixed aed input unchanged and identify later parent-only context separately.

Native evidence admission requires immutable streamed archive, requested/resolved full SHA, archive byte count, fixed lockfile and @repo guards, isolated owned origin/server/profile/port, no-clobber outputs, CDP pipe, trusted input/drag, passive key audit and no nativeVirtualKeyCode. Original pixelFocusWalk is protected; any successor must pass complete actual calibration/qualification and independent adoption without weaker thresholds, sampled stops, missing reverse/outside census or fabricated image placeholders. Clock retention3/3 and visual3/3, M8 unknown lower bound2, REL unknown vendor histories and production activation holds remain local blockers. No runtime/probe workaround is authorized.

Every later method must contain a closed source-emitter relation: original B/R/E obligation -> fixed source/public export -> case and original assertion purpose -> exact fixture and causal control -> applicable host/trial/native lane -> finite output path -> finalizer -> enclosing terminal digest. No declared output without an implemented producer; no fake blank PNG, derived stdout or posthoc expected result. Commands, variants, expected-before-failure IDs, frozen originals and their judging copies remain distinct. Missing precondition/source/emitter rejects source admission before runtime; failure of qualification is not a valid business before.

## 7. Finite prospective file scope, explicitly not permission

The only present writes are the two task outputs. Complete original BRD-28 conditional paths and all original BRD-12 24 paths plus exact 40 proposed extensions/test/doc paths remain preserved in full appendices. Dependencies are independently owned: this list grants no BRD-12 adoption and does not trespass into its module.

BRD-28-specific future contract review may select these existing exact files only for the stated pure helper boundary:
- packages/plugin-web-board-core/src/internal/exportImport.ts — coherent representations/graph result and lossless compatibility.
- packages/plugin-web-board-core/src/internal/storageContract.ts — explicit projection/representation rules if required.
- packages/plugin-web-board-core/src/internal/isBoardArray.ts and src/types.ts — only separately reviewed shape definitions; no automatic narrowing/migration.
- packages/plugin-web-board-core/src/index.ts and docs/api.md — separately adopted public signatures.
- packages/plugin-web-board-core/src/__tests__/exportImport.test.ts and src/__tests__/index-barrel.test.ts — focused compatibility/graph cases; historical logs unchanged.
- packages/xai-web-board-export-import/docs/design.md, api.md, test.md, dev_log.md — truthful no-UI scope and complete verifiable helper/trial contract.
- packages/plugin-web-settings-rest/src/panes/accountPane.tsx — actual export claim boundary only if a later exact card separately grants it; no new restore action.

Conditional proposed ADDs, requiring source review/root path grant first:
- packages/plugin-web-board-core/src/internal/boardBackupValidation.ts — pure whole-graph/equality/metadata inspector only.
- packages/plugin-web-board-core/src/__tests__/boardBackupGraph.test.ts — finite graph and representation cases.
- packages/plugin-web-board-core/src/__tests__/boardBackupTrial.test.ts — actual public converter with disposable adapter/faults; never live storage.
No production backup-bundle version, key, route, file-import UI, schema migration or account policy is adopted.

A future exact oracle-source card could select only this finite documentary source set under docs/reviews/audit-parallel-brd28-oracles-r1/: contract.test.ts; host.test.tsx; trial-adapter.ts; verify-fixed.mjs; verify-native.mjs; qualification.mjs; execution-manifest.json; oracle.md; inputs.sha256; source.patch. Names are proposal only, all source writing/execution ungranted. contract.test uses public pure APIs; trial-adapter applies their real output and injects per-step causal faults; host.test mounts archived real App; fixed/native drivers consume prequalified shared/outer machinery and exact emitter manifests; qualification authors all promised positive/negative controls; source.patch contains complete source set excluding itself. Exact case cardinality, output paths, purposes and numeric resource bounds must be frozen by subsequent full contract/source review, not invented here.

If actual closure requires another path, unsupported API, missing dependency or product decision, stop this conditional plan for fresh bounded review. Do not create "all necessary files" exceptions, edit shared CSS/config/lockfile or replace protected original runners.

## 8. Complete business mapping and admission sequence

| Original row | Required actual source lane and machinery outcome |
| --- | --- |
| B01 | Real registered Workspaces/account/CmdK/deep-link/disabled/locked host; public helpers and truthful absence of Board backup UI. |
| B02 | Pure preview from exact canonical bytes plus actual Account/recovery download source, native saved file and honest scope/claim boundary; existing account file is not full graph backup. |
| B03 | Full format/version/key/source/shape/property/encoding/finite-bound controls; invalid input retains raw, writes zero. |
| B04 | Three complete representations and all internal/external key references with scoped identity; no ID-only shortcut. |
| B05 | Zero set/remove/event/journal/seed/capsule effects on every key during preview/dry-run; pre-mount versus mounted state retained. |
| B06 | Actual converter -> disposable physical store -> actual reader/consumers -> new reload; full roundtrip and unknown metadata/capsule behavior. |
| B07 | Every write/readback/rollback fault, uncertainty and interrupted visibility; causal controls and exact retained source/candidate; no stale inverse. |
| B08 | Actual App/account/provider and second document A/B/locked/A', locks/markers/epochs/tombstones and queued task ack/writers; no synthetic provider claim. |
| B09 | Newer writes/delete/recreate/reset/account-delete/import; exact loss authorization and terminal retirement retention. |
| B10 | Array/envelope migration and copiedSource, property/metadata/backward codec and foreign history; no schema adoption by test. |
| B11 | Registered Workspaces/public core, detail/Card/Table/Calendar/Timeline/Planner/CmdK/Task-link and their actual snapshot producers. |
| B12 | Actual new/second document, EN/ZH all five widths/themes/state matrix, manual screenshots, qualified per-stop focus/keyboard/trusted drag and applicable targets. |
| B13 | Complete fixed and integrated affected suites, full canonical Clock G1 and judging copies, genuine cross-vendor, fresh full-scope acceptance and root inventory/reconciliation. |

None is PASS from this source-only report. B02 may not label a draft file a complete backup; B06 trial may not claim deployed live restore; B08 cannot rely on a test activation seam for production mutation. If an original row cannot be satisfied under truthful existing boundaries, technical admission remains held. It is not permission to drop the row or ask again about the already-resolved no-UI choice.

Required sequence: this full impact -> fresh independent full impact review -> exact versioned source/API/codec/lifecycle contract amendment as needed -> fresh complete contract review -> root explicit exact path/semantic-lock grant and dependency admission -> complete oracle source/source review -> actual qualified machinery and independent review/root adoption with permanent-purpose cost reconciliation -> complete valid original P0 before -> separate product implementation grant -> independent full fixed plus fixed integrated SHA evidence -> native/visual/affected/G1 -> actual different-vendor raw verification -> fresh independent Astra full original-scope acceptance -> root append-only evidence reconciliation -> fresh integrated inventory, remote ancestry/sync. No later artifact substitutes for missing before, a failed judging copy or unqualified method.

R01-R12 are retained whole below, as are full Clock r2 section14 E1-E25, every E24 row and Rules. C-FB002/OE/C-RD1 judge; C-FD1 is diagnostic. Header/F1 capacity refusal originals and exact reviewed copies remain; shared App/storage/coordinator changes revoke applicable native/invariance exemptions. No blanket reuse or blanket rerun: each exact purpose needs a source-applicability and cost decision.

## 9. Preservation, permanent costs and static-only limits

Whole TODO.sections[].tasks, EXECUTION.items and scope-map.items retain all 312 ordered original nine fields, reversible original_module versus normalized module (39 labels: 30 project-system and nine cross-module index), exact source and existing evidence. Nonempty gate_obligations rows number150; the historical policy gated118 is a different classification and is not used as a nonempty-obligation assertion. Formal counts stay13 completed/3 verification_pending/3 in_progress/293 pending;299 unclosed. Original933 evidence plus exact six TT08 references=939. Four TT08 owning docs differ from P0, while runtime product paths remain unchanged; no whole apps/packages equality claim.

Four full manifest corpora are retained:46284 review2 +25729 original backup +30933 BRD12 writer/lifecycle review +20349 BRD12 full contract review =123295 raw records. Normalize aliases only when their hashes agree, preserve original full manifests as blobs, hash complete raw blobs and raw tree bytes rather than pretty tree output. Full-byte preservation is not semantic execution of every transitive file. The generated receipt gives actual normalized identities, raw/object byte counts and checks; no unsupported minimum file-length/prefix/cardinality guard substitutes for source membership.

Previous impactauthor1/static1 remains FAILED: PID94493/session40532/chunks56e406,e019c8,dfe350/exit1/drained; checker source e90e7a71372850ce5b108a24bfabc3ab3882ead684b3710084d071548934b8b3. Line107 tested full-source membership plus unsupported size; no outputs/commit. Reported53462 identities/6089 objects/245064408bytes hashes PASS remains reported, not a repaired result. Later B/R/T/canonical checks, appendix/buffers/writes/stage/commit were UNRUN. Root immutable failure receipt dceaa58f44752a2bb13f9b95fff12ef0797d580591712d58222d1d32b8155ce5 is bound at28ba. This is author2/3, static1 only; any concluding checker failure STOPs with no retry.

All original append/calibration/package/Task-link/native PIDs, duplicate byte aliases, startup refusals, commands/modes/roots, mixed formal/probe classifications and unknown costs remain in full appendices. Seven rejected append artifacts are not seven new BRD units; three assertions are not three processes. N-G/N-T/N-C remain candidate assertion purposes, not automatic0/3. Per-permanent-unit cap3 survives actor/vendor/path/worktree changes. Clock retention3/3 and visual3/3, shared source3 final holds, M8/REL unknown and actual TT08 vendor3 remain unchanged. Billed cost/tokens unavailable, never asserted zero.

This actor uses runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children=0 each. Static read-only lookups include a no-hit memory search and an absent historical scopedStorage.ts path; neither is a semantic checker or runtime run. Long terminal source displays were truncated; complete bytes are independently read by the concluding pass and preserved in appendices/index, never inferred from those truncated displays. Both complete output buffers are constructed and validated before any file write. Only then exact two ADD files are written; exact stage and one hooks-disabled commit with real-newline Why/What/Scope/Risk/Docs/Tests follows. No amend/push.

## 10. Full immutable source appendices

The following are whole source documents, not extracted summaries. Their historical titles, preliminary Q-B28 text, path/iteration statements, adoption labels and runtime counts describe their own source phase. Sections1-9 above and this exact task card govern current scope; review2's resolved Option C supersedes the earlier question. Parent-only later context is explicitly unadopted. No historical appendix grants present execution or changes immutable original outcomes.


## Concluding static integrity receipt

    {
      "status": "PASS_STATIC_INTEGRITY_AND_PRESERVATION_ONLY",
      "author_iteration": 2,
      "author_cap": 3,
      "concluding_static_invocations": 1,
      "checker_pid": 44251,
      "parent": "28ba1cf444f2545fb93dd0340204530e07f8f6f6",
      "fixed_input": "aed09103a71c7e939ffc71d23c7b9b802ac47b51",
      "product": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
      "task_card_identity": "git:28ba1cf444f2545fb93dd0340204530e07f8f6f6:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd28-source-machinery-impact-r2.json",
      "task_card_sha256": "1612948c6652fb40fee7c6e16e5210f927ff1701d574c9a47d721b10478a4858",
      "failure_receipt_sha256": "dceaa58f44752a2bb13f9b95fff12ef0797d580591712d58222d1d32b8155ce5",
      "primary_raw_records": 123295,
      "primary_corpora": {
        "docs/reviews/audit-parallel-brd28-contract-review-r2/review.md": 46284,
        "docs/reviews/audit-parallel-brd28-preparation-r1/contract.md": 25729,
        "docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md": 30933,
        "docs/reviews/audit-parallel-brd12-contract-review-r2/review.md": 20349
      },
      "supplemental_raw_records": 70469,
      "normalized_identities": 70445,
      "unique_git_objects": 8138,
      "unique_git_bytes": 330313982,
      "all_identity_bytes": 3172008744,
      "identity_categories": {
        "git": 70428,
        "file": 1,
        "tree": 16
      },
      "actual_source_revisions": 78,
      "explicit_source_output_md_memberships": 141,
      "complete_output_documents": 9,
      "parent_tracked_files_checked": 9315,
      "original_rows": 312,
      "original_fields": 2808,
      "reversible_labels": {
        "web\uff08project-system\uff09": 30,
        "web\uff08\u8de8\u6a21\u5757\u9a8c\u8bc1\u7d22\u5f15\uff09": 9
      },
      "nonempty_gate_obligations": 150,
      "policy_gated_count_is_different": 118,
      "evidence_original": 933,
      "evidence_current": 939,
      "formal_counts": {
        "completed": 13,
        "verification_pending": 3,
        "in_progress": 3,
        "pending": 293
      },
      "unclosed": 299,
      "P0_diff_exactly_four_TT08_docs": [
        "packages/plugin-web-time-tracker/docs/api.md",
        "packages/plugin-web-time-tracker/docs/design.md",
        "packages/plugin-web-time-tracker/docs/dev_log.md",
        "packages/plugin-web-time-tracker/docs/test.md"
      ],
      "canonical_clock_sha256": "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae",
      "canonical_section14_sha256": "2337e7e5778891f01e9fcf4cf9e06b86405fc98f64a879350e68a2c32480ea65",
      "inputs_sha256": "7e94ad4f379bbdcedb20e4176b8fd12a06493e0b6ef028950231f99bda327e4f",
      "cat_file_pid": 44370,
      "cat_file_exit": 0,
      "cat_file_eof_and_stderr_drained": true,
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
      "children": 0,
      "billed_cost_and_tokens": "unavailable",
      "previous_author1": "FAILED_STATIC1_NO_OUTPUTS_UNCHANGED"
    }

## Full source appendix 1 - BRD-28 full approved conditional review2

Source 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe:docs/reviews/audit-parallel-brd28-contract-review-r2/review.md; SHA-256 1a6a0ab1b559eb12e65f6a878e4a4ceb6b95943442209f602ff816b34cf6e640. Entire source begins below.

# BRD-28 complete independent contract review r2

**Verdict: APPROVED for the complete conditional proposal at ce9eef6cb50b592e05593dc800ed3439615f7458.** Existing owner authority resolves Q-B28 to the explicitly allowed no-UI/helper contract branch. No new owner question is needed. All export-preview, schema/reference validation, actual trial restore, error rollback, host/account/native/visual/regression and full acceptance obligations remain mandatory and unrun. This verdict grants no implementation, API/schema/key, production backup UI, qualified method, caller acceptance or formal closure.

## 1. Identity, scope and independent review

Module web, workflow D under the sole A-Codex controller; fresh reviewer /root/parallel_d_brd28_full_review_r2, independent of preparation and failed reviewer1. Fixed input b52b5da64f1c7ff355b41e49d7972b6c8e8703d1; direct dispatch parent 214dc41c8c9677ef32e391c89c8b4ad3c1d0d6f4; P0 f9eb4b1f207bc4b46f547b90afc250424b3c8695. Source preparation ce9eef6cb50b592e05593dc800ed3439615f7458, inherited full review cdb8820b434aa7f2adb9cc5ad5f14118eb24230c, reviewed writer/lifecycle basis 68d0f14b243a1becb70811ca01a503cdcd244022 and final shared proposal f667a0b6996b4039d2c4e5ca28657953703e830b are immutable inputs.

The exact task-brd28-contract-review-r2.json and dynamic execution-state.tasks LIST register this task. task-registry.json is the initial wave registry; absence of a later dynamic ID there is not registration failure. Reviewer1 remains static1 FAILED, session21390 exit1, Python line180 false initial-registry assumption, no outputs/commit and later P0 parity/canonical/both-buffer checks UNRUN. Root failure receipt SHA-256 90b4a14be7bd1f574ee431474b78ee16ae727d3db2569b71d04b4ec4dd8b28b0 is independently bound. This actor performs fresh review2/3/static1, never repairs or reruns that verifier and never promotes its provisional reasoning.

AGENTS, CLAUDE, shared workflow/multi-machine rules, original goal and authority overlay, goal-C, scheduler, current control and exact card apply. Sole writable checkout is /Users/lijinlong/.codex/worktrees/audit-parallel-brd28-full-review2-20261010/XAI_Desktop. Exactly this review.md and inputs.sha256 are ADD outputs. No other worktree, root control, product, tests, runners, CSS, storage, host, config or historical artifact is writable. Root owns receive/remote preservation/push/sync; this worker does not perform them. Requested role/model configuration does not attest an independent provider or cross-vendor execution.

## 2. Original obligation and Q-B28 disposition

Original action: **将Board导入导出合同接成可用备份入口或明确尚无UI**.
Original acceptance: **导出预览、schema/引用校验、试恢复和错误回滚可验证**.
P2 / 决策 / web / 当前范围; sources 02-tasks-time-boards.md;05-visual-ux-audit.md; primary workflow C; formal pending and original evidence [].

The owning packages/xai-web-board-export-import/docs/design.md and api.md, row13 discovery review docs/reviews/xai-web-board-export-import/20260603-discovery-review.md and roadmap select Option C: public Board-core helpers. They explicitly reject active UI for that row and defer placement, encrypted bundle, backend material and destructive merge/replace UX. BRD-28 itself expressly allows a truthful no-UI result. These authorities are compatible; inventing a new UI decision or asking the owner to reconfirm it would be redundant.

The full conditional proposal is therefore judged on the no-UI branch: accurately disclose that no production Board backup-file flow exists, independently make preview and complete validation verifiable, perform actual isolated trial restoration using real helpers/consumers, and inject errors to verify rollback and isolation. A dry-run or returned storageValue is insufficient. The source explicitly distinguishes isolated trial evidence from a delivered live flow and retains a live-host restore variant if such a flow is separately authorized. This distinction resolves the existing product branch without waiving the acceptance words.

B01-B13 remain whole. Account switching, actual registered host, real second document, newer writes/deletion, metadata, native disk claims, visual/keyboard and affected regressions are not removed because UI is absent. A future exact oracle contract must identify which actual surface or isolated adapter produces each observation, and its limitation. A helper result cannot stand in for a native download; a trial fixture cannot stand in for actual App/account behavior; unsupported live restore cannot be labeled delivered. If the technical admission cannot produce the full evidence with these truthful boundaries, return a precise technical REVISE/hold, not partial acceptance or a speculative new UI question. A genuine later change to expose production restore still needs an exact separately authorized behavior and scope.

No placement, merge/replace mode, automatic orphan cleanup, loss/removal policy, key/schema migration, encryption or cloud operation is adopted here. Conservative preserve/refuse is a technical safety requirement, not an invented product policy.

## 3. Independent source findings

### Helper and storage boundary

packages/plugin-web-board-core/src/internal/exportImport.ts and the public index.ts:195-202 export the three helpers. createBoardExportPayload reads raw storage, rejects empty/malformed input, wraps a legacy array and retains an existing envelope object. readBoardExportPayload separately checks kind/version/key/source, Board shape, storageValue validity and logical-record shape. logicalEntitiesMatchBoards compares sorted joined IDs against the payload.boards projection. It does not compare storageValue.boards to payload.boards, full logical payload/content/parent/type-specific references/positions, collection-specific entity types or unique nonambiguous identity domains. boardImportStorageValueFromPayload rereads storageValue and returns its boards without writing. Different valid storageValue and top-level boards can thus pass the current separate validations; a source-derived finding is not a newly executed failure.

storageContract.ts and isBoardArray.ts do not close whole-graph integrity. Array versus envelope support, empty-array refusal, items-first checklist projection, ordinary metadata and undefined/property-presence representation must be explicit. Export preserves an existing storage envelope; the reader reconstructs top-level payload fields, so unknown top-level metadata can be lost even while envelope bytes survive. No complete roundtrip may be inferred from one preserved object.

Preview must derive from the same admitted canonical source that is restored. Freeze raw pre-mount bytes separately from mounted data/automation/seed fallback. Compare all three representations under a reviewed finite representation rule, not ID equality or stringify assumptions. Unresolved external workspace/Task references are reported rather than synthesized, deleted or imported as live capabilities.

### Actual routes and consumers

packages/plugin-web-board-workspaces/src/registration.tsx registers BoardWorkspacesModule; shellRegistrations supplies the active Board slot, and AccountStorageGate/AccountDataGate guard and key the subtree by kind/account/generation/epoch. Core/views exported BoardModule writers are not the active route but remain relevant writer boundaries. Feature-disabled/deep-link/locked states remain required. No invented import route, release-site mock or standalone test panel proves production reachability.

Workspaces writeActiveBoard/writeLists, metadata/catalog mutations, create/detail/composer/workspace recovery, reset/delete and automation share the dataset and related keys. taskLinkCommand has a Board write, awaited Task command and later Board acknowledgement. A single local Board lock neither coordinates every ordinary writer nor makes this saga atomic. CmdK consumes its actual snapshot producer; an array-only adapter is not automatically envelope-compatible. Card/detail/Table/Calendar/Timeline/Planner and Task-link remain real affected consumers.

The dataset payload is not a backup of xai_board_workspaces, xai_active_board, xai_board_panels, xai_board_inbox, xai_board_view_by_id, xai_board_filter_by_id or xai_task_cols. Those keys remain the full relationship census, without implicitly expanding the export schema or promising a cross-key transaction. Recovery downloads for Board creation, composer, detail and workspaces retain drafts and source intent; they do not invoke a complete backup-file restore.

### Account export and migration

accountPane.tsx calls exportAccountLocalData and truthfully says “Download requested. Check your browser downloads; this is not a cloud backup.” It also says device layout, unassigned data and migration archives are excluded, and direct import/restore is unsupported. Blob/anchor setup does not prove a saved disk file. Captured-owner export and UI capability rechecks must remain separate.

The “Manage local data import and rollback” button dispatches requestAccountDataManagement. AccountDataGate locks before inspection and can unmount the Board subtree; it inspects unowned local keys and calls migrateAccount, not a backup-file decoder. Migration takes lifecycle lock, archives selected legacy data, copies the previous generation, stages a journal/candidate and publishes the marker last after rechecks. rollbackAccount switches the generation marker after journal validation. This is not proof of safe arbitrary newer-write rollback or restoration from an account download.

board-core accountMigration registers isBoardArray for xai_boards_v2, while readBoardStorage accepts envelopes. That mismatch requires reviewed compatibility. Current lifecycle source explicitly acknowledges uncoordinated synchronous callers. Actual lifecycle preflight, first-intent ownership and all-writer participation are prerequisites, not capabilities granted by this report.

## 4. Whole conditional contract judgment

Preview and dry-run are zero physical write/remove/event operations, including hidden seeds/journals/normalization. Trial restoration is a distinct real execution against an isolated supplied storage adapter, with actual converters and consumers, per-step storage/readback faults, exact recovery and reload checks. Immutable raw/candidate/proposal digests and retained failure evidence must distinguish attempted, visible, verified, uncertain, rolled back and recovery-required outcomes.

Before any admitted commit, acquire reviewed lifecycle/dataset locks before authoritative reads; bind operation/account/kind/physical key/generation/epoch, source/destination and proposal; reassert after awaits. Human interaction holds no lock. All writer, migration, deletion and delayed Task acknowledgement participants must be proven coordinated or fenced. Missing locks refuse. Exact readback plus current capability precedes success; a Boolean setter, ID, toast or equality to stale bytes does not establish a transaction.

Uncertain retry reads first and uses the same operation identity. Proposal already present is acknowledged without duplication; unchanged original may permit retry; newer or unprovable state refuses. Rollback only restores this operation's unchanged owned state under matching lineage; it cannot overwrite newer edits, undo deletion/recreation, cross account generations or reactivate retired inverses. Byte-equal ABA remains unprovable without lineage evidence. Failed rollback preserves evidence and exposes recovery-required; forced termination cannot guarantee preservation of unsaved memory.

Full graph checks cover Board/list/card identities, positions and parents; same-Board catalog references; workspace and Task relationships; active/panel/view/filter/inbox links; checklist identities/counts; attachments/activity/dates; archived/deleted targets; and separately adopted capsule graphs. External HTTP links are not downloaded content or provider evidence. Unknown ordinary data stays lossless in retained raw backup; unknown protocol versions/collisions refuse execution. No arbitrary limits, silent truncation or semantic normalization is authorized.

All original B01-B13, complete conditional path/protection list, permanent history and R01-R12 are retained verbatim below. No row is runtime PASS. B02 requires the real artifact/claim boundary; B06 actual trial; B07 every failure and rollback; B08 actual owner/generation/second-document controls; B09 newer edits and destruction; B10 exact migration/metadata; B11 real consumers; B12 full applicable native/manual visual/keyboard; B13 complete affected/G1/vendor/acceptance chain.

## 5. Reviewed BRD-12 basis and exact remaining technical admission

68d0f14b243a1becb70811ca01a503cdcd244022 approves the finite T1-T4 writer/lifecycle technical basis only. It is the exact reviewed basis; an ongoing amendment/impact draft is excluded. BRD-28 cannot adopt its API, capsule, version, key or protected path by citing it.

T1 inventories W01-W21 including exported modules, generic raw set/remove/mutate, migration copiedSource, marker rollback, sync prefix erasure, reset and all-target loss/export paths. Existing lifecycle L then sorted physical K, no K-to-L/reentrant public acquisition, same-scope three-phase Task saga, and result-aware caller adaptation are credible proposed constraints. Old/cached clients must actually be quiescent/reloaded before first capsule write; source scans and two cooperative tabs do not establish that external condition.

T2 requires exact reviewed capsule grammar/collisions, immutable X bodies, separate U terminal records/indexes, incarnations/writer tokens, whole-dataset validation and unknown-field policy. Hashes show consistency, not authenticated authorship. Finite capacity refuses the whole mutation; no eviction/expiry or unlimited-retention claim. No schema is adopted by BRD-28 review.

T3 distinguishes same-account forward copy, foreign/unassigned/file replacement and fresh-generation rollback/restoration with retained union of current/prior terminal history. Imported tokens remain historical. Same ID with different history or missing reconciliation refuses; direct marker re-exposure cannot prove safe terminal-U preservation. Full payload equality and lossless history/metadata matter to BRD-28. Current-generation account export is not recovery of every generation a prefix wipe removes.

T4 needs actual App/account/global-loss reachability before remount/unmount: pending intent registered before first await, source-bound retained recovery, A data masked outside A, new A' capability after revalidation, public preflight before management lock, truthful sign-out/reset/delete/import result and preserved existing first-intent/release-once callers. A local hook cannot supply these global guarantees.

The next bounded source-impact must bind all these to BRD-28's no-UI/full-evidence branch, concrete preview/validation/trial adapter and rollback protocol, exact failure classes and finite graph/size/identity rules, consumers, histories and protected scope. It must reconcile each required row with actual registered host or isolated artifact evidence without relabeling either. Exact versioned contract amendment, fresh independent full review and root adoption precede any implementation/oracle grant. Source-qualified method and valid complete before then precede product changes. There is no current implementation-ready state.

## 6. Shared method status and downstream gates

At fixed input and dispatch parent, f667a0b6996b4039d2c4e5ca28657953703e830b is the final shared impact3 proposal, UNADOPTED. Its complete five-row source/host/activation/synchronous-acquisition/focus/outer-supervisor design is preserved as a dependency. Final source3 explicitly requires actual consumed ReactDOM/SDK forwarding/configuration bytes and root's existing capture machinery; package version strings and generic stubs do not satisfy it.

Additional immutable context only: b7324936f5880c2050e6eecc8c22567fade05444 CURRENT-CONTROL-PLANE.md adopts the conditional shared technical basis, still holds both source3 callers for actual ReactDOM/SDK and root-capture prerequisites. It is separately hash-bound here, not a repin of BRD-28 input or evidence of method qualification. No source3, production canonical activation, browser/native or runner authority follows. Local blocked dependencies hold their own evidence, without lowering any other acceptance standard.

The required chain remains exact source/contract and independent review/root adoption -> complete actual qualification and independent review/root method adoption -> complete valid original before -> separate implementation grant -> fresh fixed and integrated full B evidence -> full native/visual/affected regression/G1 -> actual different-vendor raw verification -> fresh independent full-scope Astra acceptance -> root-only evidence reconciliation and fresh inventory/remote ancestry/sync. No step substitutes for a missing earlier step. Independent Codex is not cross-vendor. No caller acceptance or release decision is made.

Canonical Clock r2 section14, all E1-E25, E24 judging copies and Rules are retained verbatim below. C-FB002/OE/C-RD1 remain judging, C-FD1 diagnostic, all original failures remain. Header/F1/capacity refusal copies and exact conditional native exclusions remain source-bound; a shared change revokes affected invariance exemptions. M+G+B sequencing and qualified focus/pipe/trusted-input/key-audit/archive/lock/@repo requirements stay unchanged.

## 7. Integrity, permanent costs and limitations

The single fresh semantic static pass validates the complete four manifest corpora: 25729 + 20349 + 30933 + 2842 = 79853 raw records before normalization. Complete raw blobs and raw Git tree objects are hashed, duplicate identity hashes must agree, and inherited parent files are checked against the checkout. All 312 ordered original rows/2808 fields, original_module and 39 literal reversible labels (30 web（project-system）, nine web（跨模块验证索引）), workflow A29/B117/C126/D40, original933 plus exact six TT08 references =939, all retained execution records and 13/3/3/293 formal totals/299 unclosed remain intact. P0 runtime parity is separate from exactly four TT08 owning-doc differences; no whole apps/packages equality claim is made.

Preparation1/3 and failed review1/3 remain consumed. This is review2/3/static1 only. Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children are each zero. Actual billed currency/tokens are unavailable, not zero. Hashing static documents does not execute product source or prove behavioral acceptance.

Source section7 and raw section12 below preserve commands, purposes, process roots, modes, duplicate logs, failures/refusals and unknown formal/probe splits. Seven original append artifacts are not seven new BRD runs or three processes per assertion. Detail native four Chrome PIDs remain four sessions; the byte-identical task-link before-package copy adds no process. Blank startup-refusal output is not zero launch cost. Clock retention3/3 and visual3/3, shared TASK/MET consumed source iterations, M8 unknown with lower bound2, REL unknown vendor histories and TT08 actual vendor3 do not create BRD budgets. Formal cap3 applies to each permanent actual unit across actor/path/worktree/vendor; N-G/N-T/N-C candidate purposes do not allocate automatic 0/3.

Read-only exploration had truncated terminal displays and one ambiguous short b732 revision (exit128); the exact full b7324936f5880c2050e6eecc8c22567fade05444 was then resolved from Git's identified candidate. This was a read lookup, not an integrity pass, product test or semantic retry. Syntax is checked before the sole semantic launch. Any parser/semantic failure would stop with no retry and honest unrun remainder.

A lightweight historical memory registry was consulted only for control-plane orientation; current fixed-source data independently establishes every status claim. No memory-derived current status is used.

Both complete output buffers are assembled after all validation and before any output write. Exact two-path stage, command-local disabled hooks and a Why/What/Scope/Risk/Docs/Tests commit follow. Root receives full SHA/direct parent/output hashes/count/clean receipt; remote preservation remains root work.

## 8. Next bounded action

Root may adopt this whole conditional documentary verdict and register a fresh exact BRD-28 source-impact/technical contract admission task using the existing no-UI branch, full B01-B13 and R01-R12, reviewed T1-T4 basis, immutable current source and permanent budgets. No owner question is currently needed. Keep every production/method/runtime/acceptance gate closed until its own complete evidence exists. BRD-28 remains pending, global formal states unchanged and the goal incomplete.

## 9. Structured static receipt

~~~json
{
  "static_iteration": 1,
  "static_allowance": 1,
  "review_iteration": 2,
  "review_cap": 3,
  "raw_manifest_records": [
    25729,
    20349,
    30933,
    2842
  ],
  "raw_total": 79853,
  "manifest_identities": 46284,
  "unique_git_objects": 6030,
  "unique_git_bytes": 233931895,
  "fixed_parent_bound_paths": 7121,
  "original_ordered_rows": 312,
  "original_fields": 2808,
  "raw_labels": {
    "web（project-system）": 30,
    "web（跨模块验证索引）": 9
  },
  "workflow_counts": {
    "A": 29,
    "B": 117,
    "C": 126,
    "D": 40
  },
  "original_evidence": 933,
  "current_evidence": 939,
  "formal_counts": {
    "completed": 13,
    "verification_pending": 3,
    "in_progress": 3,
    "pending": 293
  },
  "unclosed": 299,
  "P0_documentary_exceptions": [
    "packages/plugin-web-time-tracker/docs/api.md",
    "packages/plugin-web-time-tracker/docs/design.md",
    "packages/plugin-web-time-tracker/docs/dev_log.md",
    "packages/plugin-web-time-tracker/docs/test.md"
  ],
  "dynamic_registration": "exact card plus execution-state.tasks list",
  "canonical_clock_sha256": "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae",
  "prior_review1": "FAILED; session21390; no outputs; downstream parity/canonical/buffers UNRUN permanent",
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
  "children": 0,
  "actual_billed_usd": null,
  "verdict": "APPROVED - complete conditional documentary proposal only"
}
~~~

## Appendix A - complete original business contract, verbatim

Historical author path/iteration statements inside verbatim copies are reference only; this review task card governs current writes and costs.

## 4. Complete proposed contract and acceptance matrix

All cells below are **future oracles, unrun**. An absent UI is a truthful finding, never a substitute for an actual safety assertion. The staged technical proposal has read-only parsing/preview/dry-run, isolated trial restoration with injected errors and verified rollback, then—only if separately authorized—a production commit adapter using the reviewed ownership/lifecycle contract. Do not expose hidden tooling to users or claim an isolated adapter is a shipped flow.

### 4.1 Preview, shape and graph admission

Read input without invoking mount/automation/default factories. Freeze raw bytes, file size/hash, explicit payload kind/version and current destination raw digest/generation. Preview counts and identities from the **same validated canonical source** that would be restored, not the independently supplied payload.boards projection. Show backup scope, dates, active/archived counts, excluded keys, unresolved references, invalid rows and proposed effects. No data normalization, migration, task creation, automatic unlink, destructive repair or persistence occurs during parse/preview/dry-run.

Validation must independently compare storageValue.boards, payload.boards and complete logicalEntities records, preserving payload order where meaningful and validating records collection consistency. Detect duplicate/empty/delimiter-bearing identifiers and ambiguous identity domains without conflating IDs reused legally in distinct owner scopes. Exact finite identifier/size/depth bounds require reviewed owning contracts; no arbitrary author-picked limit or silent truncation. Unknown ordinary metadata must be retained losslessly in raw backup and roundtrip; unsupported control/version/capsule fields must refuse execution with recoverable source. Do not stringify away undefined/property-presence claims that JSON cannot represent; raw JSON/properties must be compared under an explicit representation rule.

Whole graph: board.workspaceId → workspace directory; board listIds/actual lists, list.parent/position/cardIds/actual cards; card project/list references and IDs; label/member references to the same Board catalogs; taskLink references/pending intents to actual account Task records and reciprocal source identity; activeBoard/panel/sidebar/view/filter/inbox references across owned keys; checklist row IDs and current derived counts; attachment/activity identity and dates; archived/deleted targets; and any independently adopted recovery capsule's immutable receipt/index/incarnation graph. External HTTP attachments are links, not downloaded content or provider authorization. Missing workspace/task/catalog metadata cannot be silently synthesized or removed. Board-only payload must disclose unresolved external references; live restore blocks until exact reviewed reconciliation policy exists.

### 4.2 Trial restore, commit uncertainty and rollback

A dry-run is **zero physical writes/removes/events**, including hidden journal/seed/automatic-normalization writes. It produces a stable content-addressed proposal with scope/hash/validation result and a diff, without allocating an executable foreign token. A trial restore is separately executed against an isolated supplied storage adapter using the actual import converter and consumers; it verifies resulting data, reload and graph, injects each write/read/verification failure and proves exact rollback/isolation. It is labeled “trial”; it cannot prove a live-host restore is delivered.

If live restore is separately approved, freeze one exact operation ID, captured account/kind/physical key/generation/epoch, source/destination digests and accepted proposal. Acquire the reviewed lifecycle/dataset locks **before authoritative reads**, reassert scope and source after every await, refuse competing writes or stale proposal, and never hold locks while awaiting a person. All Board ordinary writers, detail/create/composer, automation, task-link's delayed acknowledgement, migrations and deletion paths must participate or be proven fenced. Missing locks refuse; no unfenced fallback. Existing setItem/read-back is not compare-and-swap.

No merge/replace mode is assumed. The proposal must show its exact mode, affected keys and conflict outcomes only after owner/source authority resolves them. New production multi-key backup needs a separately reviewed transaction protocol; do not call sequential writes atomic or repurpose global account migration as a convenient transaction. Keep old data/receipts untouched until candidate validation succeeds, retain the failed candidate/journal as appropriate, and disclose whether canonical visibility changed. Success needs exact read-back plus current capability, not a toast, allocated ID or Boolean setter return.

For one-key writes, on an uncertain acknowledgement read first: exact proposal already present → acknowledge without a duplicate write; exact original present → eligible retry of same ID; changed/newer bytes or uncertain lineage → conflict, no overwrite. Rollback may restore only an operation-owned state whose source/target versions and generation still match the reviewed precondition. Newer edits, queued acknowledgements, delete/recreate, account switch, generation change or ABA uncertainty must block destructive inverse. It must never restore an old whole-board snapshot over newer data. Failure to roll back is a visible **recovery-required** state with retained original/candidate evidence, not success. Forced termination after denied persistence cannot guarantee preservation of memory-only input.

### 4.3 Business matrix

| ID | Full before + fixed oracle and source-grounded purpose |
| --- | --- |
| B01 capability/reachability | Actual /app/board, settings/account, CmdK/deep links and feature-disabled/locked states; each visible export/manage command traced to exact public implementation. Preserve honest no-UI disclosure and test absence of misleading restore/backup claims. No release-site mock or recovery draft counted as full backup. |
| B02 export preview and download | Arrays/envelopes, active/archived/multiple boards, empty/invalid raw source, unknown metadata; preview bytes match exported content and declared scope. Native disk filename/hash/content verified, denied read/Blob/URL/anchor and cancel failures visible, no “backup saved” from click. Draft remains pending; no persistence success implied. |
| B03 schema/version/adversarial file | Wrong kind/version/key/source, malformed JSON/object/arrays, empty boards, inconsistent/duplicate IDs, invalid counts/date/shape, size/depth/encoding boundary, missing vs null vs absent values. Preserve source; no seed/clamp/truncation writes. All finite limits need exact reviewed basis before runtime. |
| B04 full graph/three representations | Change same-ID payload fields/parent/type/positions/records; mismatch payload.boards against storageValue; dangling workspace/list/card/label/member/task references; active/views/filters/inbox; duplicate identities, archived/deleted targets, external links. Reject or classify unresolved according to reviewed policy; no silent orphan deletion or task resurrection. |
| B05 dry-run | Parse/preview/proposal perform zero writes/removes/events across all keys, markers/journals/capsules; repeat is deterministic, cancel leaves bytes and UI data unchanged. Compare source pre-mount versus post-mount to identify automation, not erase it. |
| B06 trial restore + roundtrip | Actual helpers and consumers against isolated storage, legacy array/v1 envelope, manual checklist items/legacy aggregate, annotations and unknown metadata, all entities and external-reference reports; read→export→parse→trial→reload consistency. Unknown capsule/format refuses; imported ownership tokens never authorize writes. |
| B07 commit and error rollback | Every storage step fails independently (quota/security/read denial/read-back denial/partial or uncertain commit), rollback step also fails, duplicate click/retry, interruption before/after visibility. Source/candidate retained and exact uncertainty exposed. Verified rollback restores only its own unchanged state; latest edits never overwritten. Live-host variant required if live backup restore is authorized. |
| B08 account/generation/queued writers | A→B→locked→A' and real second document; actual marker/physical scope/epoch after awaits; new generation, deletion tombstone, task-link late ack, ordinary-field/automation concurrency. No cross-owner read/display/write leak; foreign tokens historical; same account name is not same capability. |
| B09 newer writes and deletion | Preview-to-commit race, edit after restore before rollback, board/list/card deletion/archive/recreate/same-ID, reset/account-delete/import manager; no resurrection or stale snapshot overwrite, no recovery capsule reactivation. Controlled loss has explicit export acknowledgement or reviewed destructive discard; failed download never enables destruction. |
| B10 source/migration/metadata compatibility | isBoardArray migration versus v1-envelope reader, preserved unknown envelope/Board/payload metadata and field presence; inspect/import categories/rollback preserve originals and all other account/device data. No automatic key/schema/encryption/merge policy. |
| B11 real consumers | Registered Workspaces, core public helpers, detail/Card/Table/Calendar/Timeline/Planner/CmdK and Task-link agree on current state after dry-run/restore/reload; no consumer can silently strip capsule/history or resolve foreign IDs by guessed account. Actual source producers included. |
| B12 native/visual/trusted keyboard | New document, actual second document, real account generation states; EN/ZH 375/414/768/1024/1440, themes, long/error/conflict/no-data/loading/read-only states, applicable 44×44, containment, focused controls, Tab order and Enter/Space once; manually reviewed screenshots, qualified per-stop focus, trusted drag where applicable. |
| B13 full regression/protection | Frozen original failure logs, exact reviewed patch, package/host/storage/accepted callers and all judging copies, actual cross-vendor evidence, fresh complete acceptance and root reconciliation/inventory. No runtime claim from this preparation. |

“Read-only” availability must remain useful: inspect/export retained original bytes where captured capability allows; unavailable source cannot be fabricated. When account ownership changes, mask old content and fence late callbacks. UI disability does not prove callbacks are fenced.


## Appendix B - complete original dependency and finite scope obligations, verbatim

Historical author path/iteration statements inside verbatim copies are reference only; this review task card governs current writes and costs.

## 5. BRD-12, REL dependencies and protected lifecycle

Exact BRD-12 basis: proposal `5fa4cccb106d10e16562e0a8d6f3b103495607b1` and conditional full review `cdb8820b434aa7f2adb9cc5ad5f14118eb24230c`. They are **documentary conditional approval**, not schema/key adoption. In particular review T1–T4 require complete writers/locks, exact capsule/schema, migration/import/export and actual host/global-loss reachability. This document does not consume or adopt the ongoing writer-lifecycle impact draft, even if its filename exists at parent. Future use requires the exact independently reviewed impact source and root adoption receipt, plus source-delta applicability against this contract. A future implementation card must pin those SHAs and concrete fields; names such as checklistRecovery remain conceptual here.

Preserve immutable X receipts, separate terminal U index/link and current Y writer ownership if that schema is eventually adopted. Export/import must not strip history, copy foreign live capabilities, reuse incarnations by ID, resurrect retired inverses, or turn X→U→Y into executable stale U. Restore must retain current historical terminal state or refuse unprovable reconciliation; it cannot silently replace newer history with an older backup. Capsule retirement, quota eviction, lifetime, new key or schema migration is not authorized. Unsupported/colliding capsules are losslessly recoverable but non-executable. Explicit dataset/Board/account destruction requires the separately reviewed protection reachable at the actual global action, not merely a local hook.

REL-04 remains verification_pending: complete entity→key ownership inventory and account export/delete coverage is distinct from Board-only payload. REL-05 remains in_progress: no false persistence success; preserve drafts on quota/access/database failure with Retry/export. Account lifecycle locks, deletion receipts, migration archives and generation ownership remain shared protected dependencies. All synchronous, asynchronous and raw writers must be source-inventoried before a proposed lock can claim exclusion. Worktree separation does not remove semantic conflicts with BRD-12, BRD-18/task-link, ordinary Board recovery, list lifecycle, REL-03/04/05/06 and shared storage.

## 6. Exact finite conditional paths and next grants

**Only writable now:**
- `docs/reviews/audit-parallel-brd28-preparation-r1/contract.md`
- `docs/reviews/audit-parallel-brd28-preparation-r1/inputs.sha256`

Candidate *documentary disclosure and API safety* paths for a later card, selected individually after full review, not current permission:
- `packages/xai-web-board-export-import/docs/design.md`
- `packages/xai-web-board-export-import/docs/api.md`
- `packages/xai-web-board-export-import/docs/test.md`
- `packages/xai-web-board-export-import/docs/dev_log.md`
- `packages/plugin-web-board-core/src/internal/exportImport.ts`
- `packages/plugin-web-board-core/src/__tests__/exportImport.test.ts`
- `packages/plugin-web-board-core/src/__tests__/index-barrel.test.ts`

A new public preview API would additionally require separately selected `packages/plugin-web-board-core/src/index.ts` and `packages/plugin-web-board-core/docs/api.md`. This finite list does **not** cover live restore/rollback, whole-graph cross-key protocol, UI or BRD-12 adoption. Those are unresolved technical impact scopes, not an invitation to edit adjacent modules. Source proven candidate impact files, currently read-only: `packages/plugin-web-board-core/src/internal/storageContract.ts`, `internal/isBoardArray.ts`, `internal/accountMigration.ts`, `src/types.ts`; `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`, `internal/taskLinkCommand.ts`; `packages/plugin-web-storage/src/AccountDataGate.tsx`, `internal/accountMigration.ts`, `internal/accountDataLifecycle.ts`, `internal/scopedStorage.ts`, `internal/accountCoordination.ts`; `packages/plugin-web-settings-rest/src/panes/accountPane.tsx`; `apps/web/src/providers/AccountStorageGate.tsx`. No production candidate is implicitly authorized through this list.

Proposed fresh review outputs: `docs/reviews/audit-parallel-brd28-contract-review-r1/review.md` and `inputs.sha256`. Proposed subsequent technical admission outputs: `docs/reviews/audit-parallel-brd28-source-impact-r1/impact.md` and `inputs.sha256`. Proposed oracle-source files only after admission: `docs/reviews/audit-parallel-brd28-oracles-r1/contract.test.ts`, `host.test.tsx`, `verify-fixed.mjs`, `verify-native.mjs`, `oracle.md`, `inputs.sha256`. Runtime artifact paths must be enumerated by a separate exact card after permanent-unit budget reconciliation; none are invented or executed now.

Protected: every other path, all product/tests/runners/CSS/tokens/config/lockfiles, original sources/failures/evidence, storage registry and global lifecycle, App/router/shell, Header/Clock/AppRail, Desktop/plugin/adapters, global control/ledgers/inventory and all other worktrees. No commit hook that triggers tests/review, no child, push/fetch/merge/rebase/promote/deploy/release/D3. Stop on input/dirty drift, unsupported decision, needed protected change or runtime need. Technical gaps are reported for independent review; this author does not self-adopt.


## Appendix C - complete original permanent history, verbatim

Historical author path/iteration statements inside verbatim copies are reference only; this review task card governs current writes and costs.

## 7. Permanent actual execution histories and costs

Actual units are identified by runner, assertion purpose, source/fixture lineage and mode, not BRD-28 label, file path, actor, vendor or worktree. Formal cap remains **3 per actual unit**, with refusal/precondition/launch attempts preserved, separate development/probe history. Unknown classification is **unknown**, never 0/3. A valid exact evidence packet is reused after source/applicability review; never repeat it to manufacture a new timestamp.

- Original row13 `128f4be` verification in owning dev_log records board-core focused10/full169/typecheck/lint, settings-rest focused11/full240, Web tests116/typecheck/build. Settings-rest typecheck retained inherited failures (Supabase/import.meta.env/NodeNext and old strictness), not PASS. Exact invocations are reproduced in owning test.md and dev_log; no complete process-level receipt was located there, so cumulative unit/formal/probe count is unknown. Historical SHIPPED does not allocate BRD-28 runtime.
- Original rejected append unit: seven retained artifacts, five diagnosis and two Sol original-three. Main-checkout before plus six archive-root processes WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM. Three assertions per process do not mean three processes. Source command shape `node docs/reviews/web-board-detail-save-diagnosis/verify-fixed.mjs <revision> independent <label>`; preserves d7f1987/c201a1d failures and 5c6ed8e/99c36b0 fixed receipts.
- Independent detail unit: `node docs/reviews/web-board-detail-astra-final/verify-fixed.mjs 99c36b0 [independent|author-tests-rerun] [label]`; calibration vR4Xvt 4/5, QNw9Ce 5/8, fixed H1Ap2r 8/8, separate author-tests 0NW1Ae 20/20. Original failures remain; legacy-synthesis expectations require reviewed versioned correction for BRD-12, not deletion.
- Native detail download/retry/reload: `node docs/reviews/web-board-detail-sol-fix/verify-native.mjs <revision> <label>`, source PID14575/15385/17812/18500 for four Chrome sessions, proposal IDs and disk payloads. Source transport is historical, not automatically qualified for new native work. Four sessions do not become a fresh BRD backup budget.
- Board package unit: `node docs/reviews/web-board-detail-sol-fix/verify-package.mjs <revision> <label>`; before8105cc9 309 PASS/9 FAIL, after5c6ed8e and final99c36b0 326 PASS/9 FAIL; lpCkP7/zYQAbA/qnu7yE and later BmWgbG. The Task-link fixture directory's before-package99c36b0 is a byte-identical copy of final99c36b0 and must not double-count a process. Fixture correction8ab38ed focused15/90skipped, full336; parent package336 is distinct. Exact tool/mode receipts below retain failures and launch identity; classification remains unknown.
- Task-link D1 source runner `web-board-workspace-astra-review/verify-d1-board.mjs` preserves parent-baseline/boundaries/repair mode histories and fixture copies. Native source command `node docs/reviews/web-board-tasklink-native/verify-native.mjs 49a55e5 parent-admitted-fixture`; initial PID23393 omitted test-only canonical admission, earlier before-fixture one-byte log corresponds documented Chrome startup refusal, admitted PID23613 supplies3 checks. Blank output is not zero launch cost. These are synthetic-account/test-admitted controls, not production rollout.
- Shared lifecycle/account migration/export and D2 histories are retained in the complete fixed evidence corpus and REL-02/03 reviewed documents. No end-to-end new backup restore history is asserted absent solely because no BRD-28 item evidence exists. Reuse of any shared unit requires mode-level permanent cost reconciliation first.
- Clock Q1 focus1/3, six other units0/3, development2 invocations/83 checks; retention validation3/3 exhausted,145 assertions/41 of42 executions, final14/14 not qualification. Source-review R1–R6 and impact2 remain blocked. B70/refusal/calibration histories remain immutable. M+G+B is only its adopted conditional sequence; methods blocked affect their dependent units, not unrelated static preparation. REL unknown vendor histories and TT-08 three actual vendor runs confer no BRD allowance.

Source-grounded **candidate new assertion purposes**, never automatic 0/3: N-G compares all three Board payload representations and complete reference graph (old EI checks IDs/shape only); N-T asserts true zero-write preview then actual isolated trial restoration and rollback faults; N-C asserts foreign-capability/retired-capsule fencing and newer-write-safe inverse after approved schema/restore protocol. Native download, account-host, package, migration and accepted-caller portions remain reused units. Before runtime a fresh reviewer must bind exact drivers/cases/source deltas, separate overlaps and register formal/probe totals; unknown or exhausted units stay frozen.

This worker ran **preparation1/3/static1 only**, no runtime/test/build/lint/browser/native/server/qualification/probe/vendor/child. Read-only inspection commands may exit nonzero for absent guessed directory/revision/optional grep; these are retained as search failures, not semantic PASS or runtime attempts. One ambiguous short revision 5fa was replaced by log-discovered full immutable identities before the integrity pass. No failed semantic checker is rerun.


## Appendix D - complete original downstream evidence, verbatim

Historical author path/iteration statements inside verbatim copies are reference only; this review task card governs current writes and costs.

## 8. Complete evidence chain and full canonical G1

| ID | Mandatory next evidence; none produced as runtime here |
| --- | --- |
| R01 | Fresh independent full contract review: original action and every acceptance clause, existing authority, Q-B28 disposition, exact schema/graph/metadata/restore boundaries, BRD12 dependency, permanent costs and finite scope. |
| R02 | Independently reviewed source-qualified oracle/driver; immutable raw pre-mount/source/destination, real host registration, helpers/public barrel and all B01–B13 cases; positive/negative controls; zero unexpected PRECONDITION. Exact before failures committed before implementation. |
| R03 | Valid real App/native before, account host and trusted controls; no fake import route, test fixture or no-UI text substituted for actual capability evidence. |
| R04 | Separate implementation grant after technical admission/owner boundary and valid before; exact paths/SHA/author logs; unchanged old artifacts and versioned reviewed oracle corrections. |
| R05 | Fresh independent fixed full B01–B13 evidence, all shapes/whole graph/trial/rollback/storage faults/identity generations/newer writers/unknown metadata/capsule retirement; no sampled replacement. |
| R06 | Actual host/native new document and second document, downloaded bytes and visible truthful acknowledgement, account and guarded-departure paths; actual provider evidence wherever claimed. |
| R07 | Manual bilingual five-width/theme screenshots, per-stop qualified focus, trusted keyboard and applicable targets; source selector and CSS invariance. |
| R08 | Focused and full Board-core/workspaces/views tests/typecheck/lint; Web host tests/check-types/lint and CmdK; storage types/lifecycle/migration/deletion/export; actual dependent Card/detail/Table/Calendar/Timeline/Planner/task-link/creator/composer/automation; immutable P0 controls. Historical known failures adjudicated, never all-green labels. |
| R09 | Full canonical Clock r2 §14 E1–E25, complete E24 judging copies and required F1/affected/native controls. Each item has source applicability, producing commit, artifact path, full hash and verdict. Below retains the full canonical matrix rather than a BRD summary substitute. |
| R10 | Actual different-vendor verification, then fresh independent Astra full original-scope acceptance; independent Codex is not cross-vendor. Re-derive hashes and inspect actual images/downloads; missing evidence blocks. |
| R11 | Root-only serialized receive/preservation/append-only reconciliation against all312 ordered source fields, all939 current evidence and unchanged formal states; remote ancestry and sync receipt. |
| R12 | Fresh independent integrated inventory, residuals and permanent cost refresh; caller acceptance does not close formal item/REL/deployment/release automatically. |

No blanket reuse or blanket rerun: exact valid historical evidence can be reused only with fixed source and assertion applicability; affected changes revoke invariance-based exemptions. Full canonical source remains immutable. Budget/measurement inability blocks dependent evidence instead of lowering standards. Later evidence cannot replace missing before or a failed judging copy. Native runners require own isolated server, streamed immutable archive/requested-resolved SHA/archive bytes/lockfile/@repo guards, output-collision refusal, preserved exit codes, CDP pipe/trusted input/passive key audit/no nativeVirtualKeyCode, and frozen pixelFocusWalk or fully qualified independently adopted replacement. Global control/current accepted contracts and original failures remain protected.


## Appendix E - canonical Clock r2 section14, verbatim

Historical author path/iteration statements inside verbatim copies are reference only; this review task card governs current writes and costs.

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


## Appendix F - full original record, labels and raw history receipt, verbatim

Historical author path/iteration statements inside verbatim copies are reference only; this review task card governs current writes and costs.

## 11. Full original BRD-28 record and current TT-08 additions

```json
{
  "id": "BRD-28",
  "priority": "P2",
  "kind": "决策",
  "action": "将Board导入导出合同接成可用备份入口或明确尚无UI",
  "acceptance": "导出预览、schema/引用校验、试恢复和错误回滚可验证",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-28",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-28"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "导出预览、schema/引用校验、试恢复和错误回滚可验证",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-28/prepare",
    "BRD-28/contract-review",
    "BRD-28/before",
    "BRD-28/implement",
    "BRD-28/verify",
    "BRD-28/accept",
    "BRD-28/reconcile",
    "BRD-28/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```

### All 39 reversible original module labels

| ID | original_module |
| --- | --- |
| GOV-01 | web（project-system） |
| GOV-02 | web（project-system） |
| GOV-03 | web（project-system） |
| GOV-04 | web（project-system） |
| GOV-05 | web（project-system） |
| GOV-06 | web（project-system） |
| GOV-07 | web（project-system） |
| GOV-08 | web（project-system） |
| GOV-09 | web（project-system） |
| GOV-10 | web（project-system） |
| GOV-11 | web（project-system） |
| GOV-12 | web（project-system） |
| GOV-13 | web（project-system） |
| GOV-14 | web（project-system） |
| GOV-15 | web（project-system） |
| GOV-16 | web（project-system） |
| SK-01 | web（project-system） |
| SK-02 | web（project-system） |
| SK-03 | web（project-system） |
| SK-04 | web（project-system） |
| SK-05 | web（project-system） |
| SK-06 | web（project-system） |
| SK-07 | web（project-system） |
| SK-08 | web（project-system） |
| SK-09 | web（project-system） |
| SK-10 | web（project-system） |
| SK-11 | web（project-system） |
| SK-12 | web（project-system） |
| SK-13 | web（project-system） |
| SK-14 | web（project-system） |
| QA-01 | web（跨模块验证索引） |
| QA-02 | web（跨模块验证索引） |
| QA-03 | web（跨模块验证索引） |
| QA-04 | web（跨模块验证索引） |
| QA-05 | web（跨模块验证索引） |
| QA-06 | web（跨模块验证索引） |
| QA-07 | web（跨模块验证索引） |
| QA-08 | web（跨模块验证索引） |
| QA-09 | web（跨模块验证索引） |

## 12. Raw historical artifact receipt

The full raw bytes and original runners are manifest-bound. Recorded results are historical and not new executions. Artifact rows are not process counts; byte-identical duplicates below are one preserved content identity, and launch/refusal details may require the linked review even where a log is blank.

| Artifact | Bytes | SHA-256 | Recorded process/case hints |
| --- | ---: | --- | --- |
| `docs/reviews/web-board-detail-astra-final/author-tests-rerun-99c36b0.log` | 2042 | `de51fa52e4193e76185749a51f22702a034304d8ec5185d9b88c29da6f9fd5d6` | revision=99c36b0; exit=0; xai-detail-review-0NW1Ae; Tests  20 passed (20) |
| `docs/reviews/web-board-detail-astra-final/independent-99c36b0.log` | 608 | `5e6eaf70675778d9ca342c19f158db5ab45c4f7ca1fe50afc287ebc4ba997b20` | revision=99c36b0; exit=0; xai-detail-review-H1Ap2r; Tests  8 passed (8) |
| `docs/reviews/web-board-detail-astra-final/oracle-calibration-99c36b0.log` | 2373 | `e9869e5ffee8ed4918d37a3b9948ae80dcc8f4541f0a6f7c0bc19dfb8783f638` | revision=99c36b0; exit=1; xai-detail-review-vR4Xvt; Tests  1 failed / 4 passed (5); Tests 1 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-astra-final/view-fixture-calibration-99c36b0.log` | 5643 | `f755355170f7cad3c04c4176e644fc0ba03e2e6c8350f4b1c4ee13ec5333beab` | revision=99c36b0; exit=1; xai-detail-review-QNw9Ce; Tests  3 failed / 5 passed (8); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-save-diagnosis/before.log` | 4553 | `e4e1ae1f1e9002e707e91c3b4e654c26ee8732edea99d2001bb0281420e10df7` | Tests 3 ⎯⎯⎯⎯⎯⎯⎯; Tests  3 failed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-after-5c6ed8e.log` | 1045 | `9b7a64571a8509890046a2fbf5fdd00c8cd95e11c73c213cb353fd8ea74a4065` | revision=5c6ed8e; exit=0; xai-detail-review-GTCwVQ; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-c201a1d.log` | 3236 | `29b94a53b218939e5b4c6d60e5c6bcc263de0f562d34f114a678598bf2cd3d2d` | revision=c201a1d; exit=1; xai-detail-review-W5CtBq; Tests  3 failed (3); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-final-99c36b0.log` | 1045 | `a74583569ca3778f2530c45354410cabbc2e078b698d14ed892e1f5a0e312939` | revision=99c36b0; exit=0; xai-detail-review-eM1BXW; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent.log` | 3236 | `8747e908956204a02259ddd6b93974d2583fadc7b9289d350e562b46f43ab615` | revision=d7f1987; exit=1; xai-detail-review-WglhJo; Tests  3 failed (3); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/after-5c6ed8e.log` | 42724 | `011619b9a3263ff874745e826132e157d457486103b995194f2bdbc66ce19b81` | revision=5c6ed8e; exit=1; mode='board' 15ms; mode='card' 15ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/before-8105cc9.log` | 41348 | `88ed98c2082fd5baff0fd20a325e6494d63c3cc30359be28ad8625b1bb9f19cd` | revision=8105cc9; exit=1; mode='board' 15ms; mode='card' 32ms; Tests  9 failed / 309 passed (318); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/final-99c36b0.log` | 42848 | `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2` | revision=99c36b0; exit=1; mode='board' 51ms; mode='card' 31ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/focused-final-99c36b0.log` | 2159 | `03148555c870176dcd44f236a8613cec864b58724ef33e744f05355968c692dc` | revision=99c36b0; Tests  20 passed (20) |
| `docs/reviews/web-board-detail-sol-fix/native-5c6ed8e.log` | 872 | `2ab891bf7ffa1d459798c4613c2c609a893f9ed8d2d245009ae8b0fd94fdaad5` | 14575 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0-parent-independent.log` | 871 | `21ed2d0dc55e626a524487bc6915c6753cdb861fb1fd87975b33cb055be77c78` | 17812 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0-parent-visual.log` | 871 | `dc27417de8003d898575a8d1248f6a98fe837cbbb51f7220d0a4db19bc3f6dd3` | 18500 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0.log` | 871 | `901e7c6edfda6ad5928a6794e2d2749ba654ad2687361de76d0967fe2faaea4e` | 15385 |
| `docs/reviews/web-board-detail-sol-fix/original-three-after-5c6ed8e.log` | 1045 | `b5294b21ac2f8cc86c8744e44b92d76a1e99507258daf6f149baa8edad05111f` | revision=5c6ed8e; exit=0; xai-detail-review-lL8iHn; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-sol-fix/original-three-final-99c36b0.log` | 1045 | `6fe43e39714cf90267963f3f16813b9836bcb45844254d0fce29d791d1b25678` | revision=99c36b0; exit=0; xai-detail-review-IepdNM; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-sol-fix/parent-tasklink-fixed-8ab38ed.log` | 12054 | `c895a34325475b440110700737ad91e2efcd2f879bb47f1f4abfb25836e8c929` | revision=8ab38ed; exit=0; Tests  336 passed (336) |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-admitted-fixture.log` | 456 | `a9c7f5654c6bf6ac2e50c5b221c42609af187c0e288ef30de7c21e6111dec7f4` | 23613 |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-before-fixture-repair.log` | 1 | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` | No process verdict in artifact; source review required, never zero cost |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-initial.log` | 59 | `9970ac33ccf0da85343be4010152f33e6097a541cd4006613ff577b2e2e9663a` | 23393 |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/after-focused-8ab38ed.log` | 18099 | `89d466756d4f958e485822195860e7dd09244f13b23342be1e7a91ba8cd0ac38` | mode='board'; mode='card'; Tests  15 passed / 90 skipped (105) |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/after-package-8ab38ed.log` | 10969 | `dc8431b976d92c39a0ff9a91db2126c675bb3aab03fcc19056b243d93ff40c3c` | Tests  336 passed (336) |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/before-package-99c36b0.log` | 42848 | `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2` | revision=99c36b0; exit=1; mode='board' 51ms; mode='card' 31ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/lint-8ab38ed.log` | 193 | `28642457417e442ab2cbf1b7879e9b0b1c9a41cfb54df78a7b1756fda4056e22` | No process verdict in artifact; source review required, never zero cost |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/typecheck-8ab38ed.log` | 185 | `372dbabd7bcc2aed60b945d0e1ddff9aeda70c3f4b8f52a832c2fbd9f015cacc` | No process verdict in artifact; source review required, never zero cost |

Byte-identical historical duplicate groups:
- `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2`: `docs/reviews/web-board-detail-sol-fix/final-99c36b0.log`, `docs/reviews/web-board-tasklink-sol-fixture-fix/before-package-99c36b0.log`. No extra process inferred.


## Full source appendix 2 - BRD-28 full original preparation

Source ce9eef6cb50b592e05593dc800ed3439615f7458:docs/reviews/audit-parallel-brd28-preparation-r1/contract.md; SHA-256 d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f. Entire source begins below.

# BRD-28 preparation r1 — full Board backup, validation, trial-restore and rollback proposal

**UNADOPTED / NEEDS FRESH INDEPENDENT FULL CONTRACT REVIEW.** Workflow C, module **web**. This is preparation **1/3**, one static integrity pass; every runtime/test/build/lint/browser/native/server/qualification/probe/vendor invocation is **0**. Two documentary ADD paths only. No implementation, product choice, schema/key grant, caller acceptance or formal closure is made.

## 1. Fixed identity and complete original obligation

- Direct parent: `7b890e0f027c5a1d258954bfc002731b23950c15`; supplied isolated worktree `/Users/lijinlong/.codex/worktrees/audit-parallel-brd28-preparation-20261010/XAI_Desktop`, clean at entry.
- Registration: `9d8245d929518907b73674b0ab9b5e0ec221e23a`, exact `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd28-preparation-r1.json`.
- Fixed preparation input `ead710ffa47c45f6d5e0ce3bad3c7fcdb4ff9473`; additional task-card source `acd21f9b15a735e2202ca9553aff54b3e3b46e17`; original mapping/ledger source `e041c2bc293b70db367444c62c4300231976dbf7`; runtime P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. No source follows later root HEAD.
- Original action: **将Board导入导出合同接成可用备份入口或明确尚无UI**
- Original acceptance: **导出预览、schema/引用校验、试恢复和错误回滚可验证**
- P2 / 决策 / web / 当前范围; sources `02-tasks-time-boards.md;05-visual-ux-audit.md`; primary workflow C; formal pending; item evidence `[]`. Empty item evidence does not imply zero historical runs.
- Original goal SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`; AGENTS, CLAUDE, shared workflow/multi-machine policy, authority-overlay and goal-C apply. The overlay replaces only the stated global serial/ff restrictions. Worker does not push/fetch/sync-check; root owns preservation and receive.
- Full 312 ordered original task fields, unique attribution, all 39 reversible raw module labels (30 `web（project-system）`, nine `web（跨模块验证索引）`) and exact original_module are preserved. Formal totals remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending, 299 unclosed**. All 933 original evidence entries plus exactly six TT-08 additions = **939** at parent. All 118 gated rows remain gated. The ranked inventory is static discovery, never an implementation grant.
- P0→parent under apps/packages/package.json/pnpm-lock.yaml differs only in four TT-08 owning docs, `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md`. Runtime Board/storage/host/CSS parity is asserted separately; there is no blanket whole-product-tree equality claim.

The “明确尚无UI” alternative is a truthful capability statement, **not a deletion of any acceptance clause**. This proposal keeps export preview, complete schema/reference verification, actual trial restore and failure rollback as separate mandatory evidence rows. No no-UI disclosure alone can be accepted as the full BRD-28 result.

## 2. Existing source authority and minimal unresolved choice

Owning row #13 design/API/test/dev_log, `docs/reviews/xai-web-board-export-import/20260603-discovery-review.md`, roadmap `docs/workflow/roadmap/xai-web-project-module.md` and source PRD `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` establish:
1. Board-core owns the data contract and public helpers.
2. That delivered row deliberately selected **Option C, helpers**, rejected active UI **for that row**, and left UI placement, encrypted envelope, merge/replace confirmation and backend key material to later work.
3. “SHIPPED” refers to that data contract, not a user backup product.
4. Current BRD-28 explicitly requires the broader acceptance above; the older row cannot waive it.

Settled current disclosure: the active Board surface has recovery-draft downloads but no Board backup-file preview/upload/trial-restore/commit/rollback flow through the three Board export/import helpers. The account surface has a different local export and an unowned-local-data migration manager. Neither is a Board backup importer. No encrypted/cloud backup claim is supported.

**Review-only unresolved product boundary Q-B28:** the original item permits either a new usable backup entry or an explicit no-UI capability branch, while the existing owner decision defers entry placement and destructive merge/replace policy. This author does not choose a new placement, merge policy, automatic removal policy, payload migration or encryption requirement. Fresh independent review must first determine whether the complete API/trial evidence proposal below satisfies the no-UI alternative while truthfully retaining unsupported live restore, or whether the full acceptance requires a separately owner-authorized user-facing restore flow. Only the latter established conflict may become the smallest root-consolidated owner choice about exposing that flow. There is **no draft user question**, no request to reconfirm already-settled behavior, and no automatic product grant. Until that is resolved, BRD-28 remains pending, with all acceptance rows open.

Technical defects (graph inconsistency, missing locks, account fencing, unknown metadata or unsupported schema) are not product preferences. Conservative preserve/refuse behavior can be proposed and reviewed without inventing a user policy.

## 3. Actual producer/writer/reader/consumer and reachable route closure

All paths relative to repo. Manifest coverage is preservation; it is not a claim of semantic review or execution of every corpus file.

| Surface and exact source | Fixed-source finding and consequence |
| --- | --- |
| `packages/plugin-web-board-core/src/internal/exportImport.ts`; public `src/index.ts` exports at 195–202; `src/__tests__/exportImport.test.ts` EI1–EI8 and index-barrel tests | createBoardExportPayload reads one raw dataset, rejects malformed/empty data, wraps legacy array in v1 envelope, preserves an existing envelope object and produces normalized Board and logical projections. readBoardExportPayload checks kind/version/storageKey/source tag, separately valid boards/storageValue and logical-record shapes. It compares sorted IDs only. boardImportStorageValueFromPayload re-reads storageValue and returns its boards, with no storage write. Public availability does not establish a user operation. |
| Same exportImport functions | No check equates payload.boards with storageValue.boards. ID equality does not compare logical payload/content/position/parent/type-specific references; record collection validates any of three entityType values in every collection. String-joined ID comparison is not proof of unique identities or safe delimiter handling. This is a source-grounded gap, not a newly executed failing test. |
| `core/src/internal/storageContract.ts`, `isBoardArray.ts`, `types.ts` | Nonempty arrays/v1 envelopes are accepted. readBoardStorage is not a whole-graph validator. Guard checks field shapes, many IDs merely strings, legacy count fields merely numbers; it does not prove uniqueness, referential integrity or capsule semantics. projectBoardStorageEntities creates project.board/list/card records, listIds/cardIds/positions and payloads; checklistItems wins over legacy counts including empty array. Logical syncScope=account-sync is metadata, not active cloud sync. |
| `core/src/internal/persistence.ts`; BoardModule and Workspaces | Missing/corrupt/empty data may render seed fallback. Never export fallback as if saved user data, and never use a mounted fallback or mount automation as the original backup preimage. Preserve pre-mount raw bytes and post-mount state separately. preserveBoardStorageFormat spreads envelope metadata, but export reader reconstructs the top-level payload fields and can discard unknown top-level payload metadata. Arrays and envelopes have different preservation rules. |
| `packages/plugin-web-board-workspaces/src/registration.tsx`; `apps/web/src/routes/modules/shellRegistrations.tsx`, router/RouteGateElements, `App.tsx`, `providers/AccountStorageGate.tsx` | Actual `/app/board` registers Workspaces through withDisabledFallback; account gate wraps the business subtree and keys it by account/generation/epoch. A standalone BoardModule or a test-only panel does not prove the registered app is reachable. Disabled feature/deep link and account locked states remain in coverage. |
| `BoardWorkspacesModule.tsx` lines341–355, writeActiveBoard/writeLists, deleteBoard, reset, move/updateCard; core `BoardModule.tsx` | Dataset, active ID, workspace directory, panels, inbox, per-board view/filter and task data are distinct keys. Many ordinary operations write via synchronous setters. Workspace/delete/reset can mutate several related keys. Backup of xai_boards_v2 alone does not preserve those directories or cross-key relationships. |
| `internal/useBoardDetailSaveRecovery.ts`, create/composer/workspace recovery hooks; `BoardCardDetailModal.tsx`, `CardDetailDialog.tsx` | Captured owner/physical key/source/target/proposal, stable retry/read-back and draft-only export are already meaningful accepted contracts. The detail modal calls onExportAppend; parent supplies recovery snapshot and returns Boolean separately from save. Four recovery exports (board create, composer, detail, workspace) do not call the Board backup payload helpers and do not support file restore. Preserve full original source/intent, latest draft, collision and deleted-target handling. |
| `internal/taskLinkCommand.ts`; Tasks store | saveLink writes Board intent before awaited task mutation and Board acknowledgement afterwards. This is ordered recovery, explicitly not a cross-key transaction. Any restore/delete/rollback must fence queued acknowledgements and not create/delete Tasks merely from imported taskLink IDs. BRD-18 and task-link ownership remain separate. |
| `packages/xai-web-cmdk/src/adapters/board.ts`, buildIndex, provider; shell/search snapshot and host routes | Adapter consumes an array snapshot and returns module/card search hits; it does not call a backup/import helper. An envelope reaching this array-only adapter must be tested through its actual snapshot producer, not assumed compatible. Fixed tracked source search for `import-data` / `Import data` across apps and packages found no active file-import action spelling; no nonexistent command is promoted into a route. Search/navigation behavior, registry and deep-link fallback are future real-host evidence requirements. |
| `packages/plugin-web-settings-rest/src/panes/accountPane.tsx` | Actual button “Export this account's local data” captures scope, calls exportAccountLocalData and downloads account-records JSON. Exact current wording: **“Download requested. Check your browser downloads; this is not a cloud backup.”** Omission variant reports excluded credential data. Exact scope warning: **“Device layout, unassigned old data and migration archives are excluded. The file includes a scope manifest; direct import and restore are not currently supported.”** click()/Blob setup is not saved-file acknowledgement. |
| Account pane → requestAccountDataManagement → `packages/plugin-web-storage/src/AccountDataGate.tsx` | “Manage local data import and rollback” dispatches the management event; the gate locks the account and inspects unowned local keys, displays categories, calls migrateAccount('empty'/'import') and offers Undo this import. No backup-file reader or Board payload parser is reached. This flow may unmount pending Board UI before it can protect memory drafts; reachability needs technical review. |
| `storage/src/internal/accountMigration.ts` | Under exclusive lifecycle lock: validate selected registered legacy keys, refuse populated-category conflicts, archive originals, write prepared journal/candidate generation, reassert scope/source/marker after awaits, publish generation marker last. rollbackAccount restores previous generation marker after journal checks; it retains candidate records. It does not prove safe rollback after arbitrary newer writes or a Board backup-file transaction. |
| `core/src/internal/accountMigration.ts` | Validator for xai_boards_v2 is isBoardArray, not readBoardStorage. Accepted envelope helper format therefore does not automatically pass account migration. Do not silently migrate array/envelope or replace validator without separate scope. |
| `storage/src/internal/accountDataLifecycle.ts`, accountScope/scopedStorage/accountCoordination/canonical mutation; Settings delete orchestrator | Account export copies captured generation-owned raw strings, excluding credentials/device/other accounts/archives; generic exporter intentionally can export captured owner even if auth changes, so UI must maintain capability checks. Deletion has durable receipts and lifecycle locks, but source explicitly retains uncoordinated synchronous callers. A local Board lock does not coordinate all writers/removal/migrations. |
| Card/Table/detail/BoardCalendar/Timeline/Planner, `xai-web-calendar/src/internal/boardCalendarFeed.ts`; `plugin-project` Desktop adapters | All must see the same post-restore Board projection without lost dates/counts/links. Desktop plugin-project has separate entities, keys and adapters; it is a protected comparison, never an alternate Web importer. Release-site export/import mock routes are separate inactive product surfaces. |

Exact related key census to preserve, not automatically enlarge the backup format: xai_boards_v2, xai_board_workspaces, xai_active_board, xai_board_panels, xai_board_inbox, xai_board_view_by_id, xai_board_filter_by_id, and linked xai_task_cols. Catalog IDs belong to their Board; Workspace IDs and Tasks are external to the single-dataset payload. A preview must say what is included, unresolved and excluded.

## 4. Complete proposed contract and acceptance matrix

All cells below are **future oracles, unrun**. An absent UI is a truthful finding, never a substitute for an actual safety assertion. The staged technical proposal has read-only parsing/preview/dry-run, isolated trial restoration with injected errors and verified rollback, then—only if separately authorized—a production commit adapter using the reviewed ownership/lifecycle contract. Do not expose hidden tooling to users or claim an isolated adapter is a shipped flow.

### 4.1 Preview, shape and graph admission

Read input without invoking mount/automation/default factories. Freeze raw bytes, file size/hash, explicit payload kind/version and current destination raw digest/generation. Preview counts and identities from the **same validated canonical source** that would be restored, not the independently supplied payload.boards projection. Show backup scope, dates, active/archived counts, excluded keys, unresolved references, invalid rows and proposed effects. No data normalization, migration, task creation, automatic unlink, destructive repair or persistence occurs during parse/preview/dry-run.

Validation must independently compare storageValue.boards, payload.boards and complete logicalEntities records, preserving payload order where meaningful and validating records collection consistency. Detect duplicate/empty/delimiter-bearing identifiers and ambiguous identity domains without conflating IDs reused legally in distinct owner scopes. Exact finite identifier/size/depth bounds require reviewed owning contracts; no arbitrary author-picked limit or silent truncation. Unknown ordinary metadata must be retained losslessly in raw backup and roundtrip; unsupported control/version/capsule fields must refuse execution with recoverable source. Do not stringify away undefined/property-presence claims that JSON cannot represent; raw JSON/properties must be compared under an explicit representation rule.

Whole graph: board.workspaceId → workspace directory; board listIds/actual lists, list.parent/position/cardIds/actual cards; card project/list references and IDs; label/member references to the same Board catalogs; taskLink references/pending intents to actual account Task records and reciprocal source identity; activeBoard/panel/sidebar/view/filter/inbox references across owned keys; checklist row IDs and current derived counts; attachment/activity identity and dates; archived/deleted targets; and any independently adopted recovery capsule's immutable receipt/index/incarnation graph. External HTTP attachments are links, not downloaded content or provider authorization. Missing workspace/task/catalog metadata cannot be silently synthesized or removed. Board-only payload must disclose unresolved external references; live restore blocks until exact reviewed reconciliation policy exists.

### 4.2 Trial restore, commit uncertainty and rollback

A dry-run is **zero physical writes/removes/events**, including hidden journal/seed/automatic-normalization writes. It produces a stable content-addressed proposal with scope/hash/validation result and a diff, without allocating an executable foreign token. A trial restore is separately executed against an isolated supplied storage adapter using the actual import converter and consumers; it verifies resulting data, reload and graph, injects each write/read/verification failure and proves exact rollback/isolation. It is labeled “trial”; it cannot prove a live-host restore is delivered.

If live restore is separately approved, freeze one exact operation ID, captured account/kind/physical key/generation/epoch, source/destination digests and accepted proposal. Acquire the reviewed lifecycle/dataset locks **before authoritative reads**, reassert scope and source after every await, refuse competing writes or stale proposal, and never hold locks while awaiting a person. All Board ordinary writers, detail/create/composer, automation, task-link's delayed acknowledgement, migrations and deletion paths must participate or be proven fenced. Missing locks refuse; no unfenced fallback. Existing setItem/read-back is not compare-and-swap.

No merge/replace mode is assumed. The proposal must show its exact mode, affected keys and conflict outcomes only after owner/source authority resolves them. New production multi-key backup needs a separately reviewed transaction protocol; do not call sequential writes atomic or repurpose global account migration as a convenient transaction. Keep old data/receipts untouched until candidate validation succeeds, retain the failed candidate/journal as appropriate, and disclose whether canonical visibility changed. Success needs exact read-back plus current capability, not a toast, allocated ID or Boolean setter return.

For one-key writes, on an uncertain acknowledgement read first: exact proposal already present → acknowledge without a duplicate write; exact original present → eligible retry of same ID; changed/newer bytes or uncertain lineage → conflict, no overwrite. Rollback may restore only an operation-owned state whose source/target versions and generation still match the reviewed precondition. Newer edits, queued acknowledgements, delete/recreate, account switch, generation change or ABA uncertainty must block destructive inverse. It must never restore an old whole-board snapshot over newer data. Failure to roll back is a visible **recovery-required** state with retained original/candidate evidence, not success. Forced termination after denied persistence cannot guarantee preservation of memory-only input.

### 4.3 Business matrix

| ID | Full before + fixed oracle and source-grounded purpose |
| --- | --- |
| B01 capability/reachability | Actual /app/board, settings/account, CmdK/deep links and feature-disabled/locked states; each visible export/manage command traced to exact public implementation. Preserve honest no-UI disclosure and test absence of misleading restore/backup claims. No release-site mock or recovery draft counted as full backup. |
| B02 export preview and download | Arrays/envelopes, active/archived/multiple boards, empty/invalid raw source, unknown metadata; preview bytes match exported content and declared scope. Native disk filename/hash/content verified, denied read/Blob/URL/anchor and cancel failures visible, no “backup saved” from click. Draft remains pending; no persistence success implied. |
| B03 schema/version/adversarial file | Wrong kind/version/key/source, malformed JSON/object/arrays, empty boards, inconsistent/duplicate IDs, invalid counts/date/shape, size/depth/encoding boundary, missing vs null vs absent values. Preserve source; no seed/clamp/truncation writes. All finite limits need exact reviewed basis before runtime. |
| B04 full graph/three representations | Change same-ID payload fields/parent/type/positions/records; mismatch payload.boards against storageValue; dangling workspace/list/card/label/member/task references; active/views/filters/inbox; duplicate identities, archived/deleted targets, external links. Reject or classify unresolved according to reviewed policy; no silent orphan deletion or task resurrection. |
| B05 dry-run | Parse/preview/proposal perform zero writes/removes/events across all keys, markers/journals/capsules; repeat is deterministic, cancel leaves bytes and UI data unchanged. Compare source pre-mount versus post-mount to identify automation, not erase it. |
| B06 trial restore + roundtrip | Actual helpers and consumers against isolated storage, legacy array/v1 envelope, manual checklist items/legacy aggregate, annotations and unknown metadata, all entities and external-reference reports; read→export→parse→trial→reload consistency. Unknown capsule/format refuses; imported ownership tokens never authorize writes. |
| B07 commit and error rollback | Every storage step fails independently (quota/security/read denial/read-back denial/partial or uncertain commit), rollback step also fails, duplicate click/retry, interruption before/after visibility. Source/candidate retained and exact uncertainty exposed. Verified rollback restores only its own unchanged state; latest edits never overwritten. Live-host variant required if live backup restore is authorized. |
| B08 account/generation/queued writers | A→B→locked→A' and real second document; actual marker/physical scope/epoch after awaits; new generation, deletion tombstone, task-link late ack, ordinary-field/automation concurrency. No cross-owner read/display/write leak; foreign tokens historical; same account name is not same capability. |
| B09 newer writes and deletion | Preview-to-commit race, edit after restore before rollback, board/list/card deletion/archive/recreate/same-ID, reset/account-delete/import manager; no resurrection or stale snapshot overwrite, no recovery capsule reactivation. Controlled loss has explicit export acknowledgement or reviewed destructive discard; failed download never enables destruction. |
| B10 source/migration/metadata compatibility | isBoardArray migration versus v1-envelope reader, preserved unknown envelope/Board/payload metadata and field presence; inspect/import categories/rollback preserve originals and all other account/device data. No automatic key/schema/encryption/merge policy. |
| B11 real consumers | Registered Workspaces, core public helpers, detail/Card/Table/Calendar/Timeline/Planner/CmdK and Task-link agree on current state after dry-run/restore/reload; no consumer can silently strip capsule/history or resolve foreign IDs by guessed account. Actual source producers included. |
| B12 native/visual/trusted keyboard | New document, actual second document, real account generation states; EN/ZH 375/414/768/1024/1440, themes, long/error/conflict/no-data/loading/read-only states, applicable 44×44, containment, focused controls, Tab order and Enter/Space once; manually reviewed screenshots, qualified per-stop focus, trusted drag where applicable. |
| B13 full regression/protection | Frozen original failure logs, exact reviewed patch, package/host/storage/accepted callers and all judging copies, actual cross-vendor evidence, fresh complete acceptance and root reconciliation/inventory. No runtime claim from this preparation. |

“Read-only” availability must remain useful: inspect/export retained original bytes where captured capability allows; unavailable source cannot be fabricated. When account ownership changes, mask old content and fence late callbacks. UI disability does not prove callbacks are fenced.

## 5. BRD-12, REL dependencies and protected lifecycle

Exact BRD-12 basis: proposal `5fa4cccb106d10e16562e0a8d6f3b103495607b1` and conditional full review `cdb8820b434aa7f2adb9cc5ad5f14118eb24230c`. They are **documentary conditional approval**, not schema/key adoption. In particular review T1–T4 require complete writers/locks, exact capsule/schema, migration/import/export and actual host/global-loss reachability. This document does not consume or adopt the ongoing writer-lifecycle impact draft, even if its filename exists at parent. Future use requires the exact independently reviewed impact source and root adoption receipt, plus source-delta applicability against this contract. A future implementation card must pin those SHAs and concrete fields; names such as checklistRecovery remain conceptual here.

Preserve immutable X receipts, separate terminal U index/link and current Y writer ownership if that schema is eventually adopted. Export/import must not strip history, copy foreign live capabilities, reuse incarnations by ID, resurrect retired inverses, or turn X→U→Y into executable stale U. Restore must retain current historical terminal state or refuse unprovable reconciliation; it cannot silently replace newer history with an older backup. Capsule retirement, quota eviction, lifetime, new key or schema migration is not authorized. Unsupported/colliding capsules are losslessly recoverable but non-executable. Explicit dataset/Board/account destruction requires the separately reviewed protection reachable at the actual global action, not merely a local hook.

REL-04 remains verification_pending: complete entity→key ownership inventory and account export/delete coverage is distinct from Board-only payload. REL-05 remains in_progress: no false persistence success; preserve drafts on quota/access/database failure with Retry/export. Account lifecycle locks, deletion receipts, migration archives and generation ownership remain shared protected dependencies. All synchronous, asynchronous and raw writers must be source-inventoried before a proposed lock can claim exclusion. Worktree separation does not remove semantic conflicts with BRD-12, BRD-18/task-link, ordinary Board recovery, list lifecycle, REL-03/04/05/06 and shared storage.

## 6. Exact finite conditional paths and next grants

**Only writable now:**
- `docs/reviews/audit-parallel-brd28-preparation-r1/contract.md`
- `docs/reviews/audit-parallel-brd28-preparation-r1/inputs.sha256`

Candidate *documentary disclosure and API safety* paths for a later card, selected individually after full review, not current permission:
- `packages/xai-web-board-export-import/docs/design.md`
- `packages/xai-web-board-export-import/docs/api.md`
- `packages/xai-web-board-export-import/docs/test.md`
- `packages/xai-web-board-export-import/docs/dev_log.md`
- `packages/plugin-web-board-core/src/internal/exportImport.ts`
- `packages/plugin-web-board-core/src/__tests__/exportImport.test.ts`
- `packages/plugin-web-board-core/src/__tests__/index-barrel.test.ts`

A new public preview API would additionally require separately selected `packages/plugin-web-board-core/src/index.ts` and `packages/plugin-web-board-core/docs/api.md`. This finite list does **not** cover live restore/rollback, whole-graph cross-key protocol, UI or BRD-12 adoption. Those are unresolved technical impact scopes, not an invitation to edit adjacent modules. Source proven candidate impact files, currently read-only: `packages/plugin-web-board-core/src/internal/storageContract.ts`, `internal/isBoardArray.ts`, `internal/accountMigration.ts`, `src/types.ts`; `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`, `internal/taskLinkCommand.ts`; `packages/plugin-web-storage/src/AccountDataGate.tsx`, `internal/accountMigration.ts`, `internal/accountDataLifecycle.ts`, `internal/scopedStorage.ts`, `internal/accountCoordination.ts`; `packages/plugin-web-settings-rest/src/panes/accountPane.tsx`; `apps/web/src/providers/AccountStorageGate.tsx`. No production candidate is implicitly authorized through this list.

Proposed fresh review outputs: `docs/reviews/audit-parallel-brd28-contract-review-r1/review.md` and `inputs.sha256`. Proposed subsequent technical admission outputs: `docs/reviews/audit-parallel-brd28-source-impact-r1/impact.md` and `inputs.sha256`. Proposed oracle-source files only after admission: `docs/reviews/audit-parallel-brd28-oracles-r1/contract.test.ts`, `host.test.tsx`, `verify-fixed.mjs`, `verify-native.mjs`, `oracle.md`, `inputs.sha256`. Runtime artifact paths must be enumerated by a separate exact card after permanent-unit budget reconciliation; none are invented or executed now.

Protected: every other path, all product/tests/runners/CSS/tokens/config/lockfiles, original sources/failures/evidence, storage registry and global lifecycle, App/router/shell, Header/Clock/AppRail, Desktop/plugin/adapters, global control/ledgers/inventory and all other worktrees. No commit hook that triggers tests/review, no child, push/fetch/merge/rebase/promote/deploy/release/D3. Stop on input/dirty drift, unsupported decision, needed protected change or runtime need. Technical gaps are reported for independent review; this author does not self-adopt.

## 7. Permanent actual execution histories and costs

Actual units are identified by runner, assertion purpose, source/fixture lineage and mode, not BRD-28 label, file path, actor, vendor or worktree. Formal cap remains **3 per actual unit**, with refusal/precondition/launch attempts preserved, separate development/probe history. Unknown classification is **unknown**, never 0/3. A valid exact evidence packet is reused after source/applicability review; never repeat it to manufacture a new timestamp.

- Original row13 `128f4be` verification in owning dev_log records board-core focused10/full169/typecheck/lint, settings-rest focused11/full240, Web tests116/typecheck/build. Settings-rest typecheck retained inherited failures (Supabase/import.meta.env/NodeNext and old strictness), not PASS. Exact invocations are reproduced in owning test.md and dev_log; no complete process-level receipt was located there, so cumulative unit/formal/probe count is unknown. Historical SHIPPED does not allocate BRD-28 runtime.
- Original rejected append unit: seven retained artifacts, five diagnosis and two Sol original-three. Main-checkout before plus six archive-root processes WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM. Three assertions per process do not mean three processes. Source command shape `node docs/reviews/web-board-detail-save-diagnosis/verify-fixed.mjs <revision> independent <label>`; preserves d7f1987/c201a1d failures and 5c6ed8e/99c36b0 fixed receipts.
- Independent detail unit: `node docs/reviews/web-board-detail-astra-final/verify-fixed.mjs 99c36b0 [independent|author-tests-rerun] [label]`; calibration vR4Xvt 4/5, QNw9Ce 5/8, fixed H1Ap2r 8/8, separate author-tests 0NW1Ae 20/20. Original failures remain; legacy-synthesis expectations require reviewed versioned correction for BRD-12, not deletion.
- Native detail download/retry/reload: `node docs/reviews/web-board-detail-sol-fix/verify-native.mjs <revision> <label>`, source PID14575/15385/17812/18500 for four Chrome sessions, proposal IDs and disk payloads. Source transport is historical, not automatically qualified for new native work. Four sessions do not become a fresh BRD backup budget.
- Board package unit: `node docs/reviews/web-board-detail-sol-fix/verify-package.mjs <revision> <label>`; before8105cc9 309 PASS/9 FAIL, after5c6ed8e and final99c36b0 326 PASS/9 FAIL; lpCkP7/zYQAbA/qnu7yE and later BmWgbG. The Task-link fixture directory's before-package99c36b0 is a byte-identical copy of final99c36b0 and must not double-count a process. Fixture correction8ab38ed focused15/90skipped, full336; parent package336 is distinct. Exact tool/mode receipts below retain failures and launch identity; classification remains unknown.
- Task-link D1 source runner `web-board-workspace-astra-review/verify-d1-board.mjs` preserves parent-baseline/boundaries/repair mode histories and fixture copies. Native source command `node docs/reviews/web-board-tasklink-native/verify-native.mjs 49a55e5 parent-admitted-fixture`; initial PID23393 omitted test-only canonical admission, earlier before-fixture one-byte log corresponds documented Chrome startup refusal, admitted PID23613 supplies3 checks. Blank output is not zero launch cost. These are synthetic-account/test-admitted controls, not production rollout.
- Shared lifecycle/account migration/export and D2 histories are retained in the complete fixed evidence corpus and REL-02/03 reviewed documents. No end-to-end new backup restore history is asserted absent solely because no BRD-28 item evidence exists. Reuse of any shared unit requires mode-level permanent cost reconciliation first.
- Clock Q1 focus1/3, six other units0/3, development2 invocations/83 checks; retention validation3/3 exhausted,145 assertions/41 of42 executions, final14/14 not qualification. Source-review R1–R6 and impact2 remain blocked. B70/refusal/calibration histories remain immutable. M+G+B is only its adopted conditional sequence; methods blocked affect their dependent units, not unrelated static preparation. REL unknown vendor histories and TT-08 three actual vendor runs confer no BRD allowance.

Source-grounded **candidate new assertion purposes**, never automatic 0/3: N-G compares all three Board payload representations and complete reference graph (old EI checks IDs/shape only); N-T asserts true zero-write preview then actual isolated trial restoration and rollback faults; N-C asserts foreign-capability/retired-capsule fencing and newer-write-safe inverse after approved schema/restore protocol. Native download, account-host, package, migration and accepted-caller portions remain reused units. Before runtime a fresh reviewer must bind exact drivers/cases/source deltas, separate overlaps and register formal/probe totals; unknown or exhausted units stay frozen.

This worker ran **preparation1/3/static1 only**, no runtime/test/build/lint/browser/native/server/qualification/probe/vendor/child. Read-only inspection commands may exit nonzero for absent guessed directory/revision/optional grep; these are retained as search failures, not semantic PASS or runtime attempts. One ambiguous short revision 5fa was replaced by log-discovered full immutable identities before the integrity pass. No failed semantic checker is rerun.

## 8. Complete evidence chain and full canonical G1

| ID | Mandatory next evidence; none produced as runtime here |
| --- | --- |
| R01 | Fresh independent full contract review: original action and every acceptance clause, existing authority, Q-B28 disposition, exact schema/graph/metadata/restore boundaries, BRD12 dependency, permanent costs and finite scope. |
| R02 | Independently reviewed source-qualified oracle/driver; immutable raw pre-mount/source/destination, real host registration, helpers/public barrel and all B01–B13 cases; positive/negative controls; zero unexpected PRECONDITION. Exact before failures committed before implementation. |
| R03 | Valid real App/native before, account host and trusted controls; no fake import route, test fixture or no-UI text substituted for actual capability evidence. |
| R04 | Separate implementation grant after technical admission/owner boundary and valid before; exact paths/SHA/author logs; unchanged old artifacts and versioned reviewed oracle corrections. |
| R05 | Fresh independent fixed full B01–B13 evidence, all shapes/whole graph/trial/rollback/storage faults/identity generations/newer writers/unknown metadata/capsule retirement; no sampled replacement. |
| R06 | Actual host/native new document and second document, downloaded bytes and visible truthful acknowledgement, account and guarded-departure paths; actual provider evidence wherever claimed. |
| R07 | Manual bilingual five-width/theme screenshots, per-stop qualified focus, trusted keyboard and applicable targets; source selector and CSS invariance. |
| R08 | Focused and full Board-core/workspaces/views tests/typecheck/lint; Web host tests/check-types/lint and CmdK; storage types/lifecycle/migration/deletion/export; actual dependent Card/detail/Table/Calendar/Timeline/Planner/task-link/creator/composer/automation; immutable P0 controls. Historical known failures adjudicated, never all-green labels. |
| R09 | Full canonical Clock r2 §14 E1–E25, complete E24 judging copies and required F1/affected/native controls. Each item has source applicability, producing commit, artifact path, full hash and verdict. Below retains the full canonical matrix rather than a BRD summary substitute. |
| R10 | Actual different-vendor verification, then fresh independent Astra full original-scope acceptance; independent Codex is not cross-vendor. Re-derive hashes and inspect actual images/downloads; missing evidence blocks. |
| R11 | Root-only serialized receive/preservation/append-only reconciliation against all312 ordered source fields, all939 current evidence and unchanged formal states; remote ancestry and sync receipt. |
| R12 | Fresh independent integrated inventory, residuals and permanent cost refresh; caller acceptance does not close formal item/REL/deployment/release automatically. |

No blanket reuse or blanket rerun: exact valid historical evidence can be reused only with fixed source and assertion applicability; affected changes revoke invariance-based exemptions. Full canonical source remains immutable. Budget/measurement inability blocks dependent evidence instead of lowering standards. Later evidence cannot replace missing before or a failed judging copy. Native runners require own isolated server, streamed immutable archive/requested-resolved SHA/archive bytes/lockfile/@repo guards, output-collision refusal, preserved exit codes, CDP pipe/trusted input/passive key audit/no nativeVirtualKeyCode, and frozen pixelFocusWalk or fully qualified independently adopted replacement. Global control/current accepted contracts and original failures remain protected.

## 9. Static preparation receipt

All input identities and full original/mapped/execution preservation are validated before either output write. Both complete output buffers are constructed first. Manifest binds full raw Git blobs/trees and the original external goal. Broad corpus preservation does not claim all-file semantic review. Outputs have no circular self-hash; final handoff carries count/hash/direct parent/exact paths/clean receipt.

No semantic checker failure occurred before the single integrity pass; any failure in that pass stops without retry or writing outputs. Checks not completed are UNRUN, never inferred PASS. No product or runtime grants were exercised. Scope unchanged; root alone may receive and independently review this proposal. Next bounded step is fresh full BRD-28 contract review, not automatic adoption, implementation or a user question.

## 10. Exact canonical Clock r2 section 14 retained verbatim

Source path `docs/reviews/web-dashboard-clock-recovery-contract/contract.md`, hash `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`. Historical instructions/counts below are reference obligations, not permission for this worker to execute them.

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


## 11. Full original BRD-28 record and current TT-08 additions

```json
{
  "id": "BRD-28",
  "priority": "P2",
  "kind": "决策",
  "action": "将Board导入导出合同接成可用备份入口或明确尚无UI",
  "acceptance": "导出预览、schema/引用校验、试恢复和错误回滚可验证",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-28",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-28"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "导出预览、schema/引用校验、试恢复和错误回滚可验证",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-28/prepare",
    "BRD-28/contract-review",
    "BRD-28/before",
    "BRD-28/implement",
    "BRD-28/verify",
    "BRD-28/accept",
    "BRD-28/reconcile",
    "BRD-28/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```

### All 39 reversible original module labels

| ID | original_module |
| --- | --- |
| GOV-01 | web（project-system） |
| GOV-02 | web（project-system） |
| GOV-03 | web（project-system） |
| GOV-04 | web（project-system） |
| GOV-05 | web（project-system） |
| GOV-06 | web（project-system） |
| GOV-07 | web（project-system） |
| GOV-08 | web（project-system） |
| GOV-09 | web（project-system） |
| GOV-10 | web（project-system） |
| GOV-11 | web（project-system） |
| GOV-12 | web（project-system） |
| GOV-13 | web（project-system） |
| GOV-14 | web（project-system） |
| GOV-15 | web（project-system） |
| GOV-16 | web（project-system） |
| SK-01 | web（project-system） |
| SK-02 | web（project-system） |
| SK-03 | web（project-system） |
| SK-04 | web（project-system） |
| SK-05 | web（project-system） |
| SK-06 | web（project-system） |
| SK-07 | web（project-system） |
| SK-08 | web（project-system） |
| SK-09 | web（project-system） |
| SK-10 | web（project-system） |
| SK-11 | web（project-system） |
| SK-12 | web（project-system） |
| SK-13 | web（project-system） |
| SK-14 | web（project-system） |
| QA-01 | web（跨模块验证索引） |
| QA-02 | web（跨模块验证索引） |
| QA-03 | web（跨模块验证索引） |
| QA-04 | web（跨模块验证索引） |
| QA-05 | web（跨模块验证索引） |
| QA-06 | web（跨模块验证索引） |
| QA-07 | web（跨模块验证索引） |
| QA-08 | web（跨模块验证索引） |
| QA-09 | web（跨模块验证索引） |

## 12. Raw historical artifact receipt

The full raw bytes and original runners are manifest-bound. Recorded results are historical and not new executions. Artifact rows are not process counts; byte-identical duplicates below are one preserved content identity, and launch/refusal details may require the linked review even where a log is blank.

| Artifact | Bytes | SHA-256 | Recorded process/case hints |
| --- | ---: | --- | --- |
| `docs/reviews/web-board-detail-astra-final/author-tests-rerun-99c36b0.log` | 2042 | `de51fa52e4193e76185749a51f22702a034304d8ec5185d9b88c29da6f9fd5d6` | revision=99c36b0; exit=0; xai-detail-review-0NW1Ae; Tests  20 passed (20) |
| `docs/reviews/web-board-detail-astra-final/independent-99c36b0.log` | 608 | `5e6eaf70675778d9ca342c19f158db5ab45c4f7ca1fe50afc287ebc4ba997b20` | revision=99c36b0; exit=0; xai-detail-review-H1Ap2r; Tests  8 passed (8) |
| `docs/reviews/web-board-detail-astra-final/oracle-calibration-99c36b0.log` | 2373 | `e9869e5ffee8ed4918d37a3b9948ae80dcc8f4541f0a6f7c0bc19dfb8783f638` | revision=99c36b0; exit=1; xai-detail-review-vR4Xvt; Tests  1 failed / 4 passed (5); Tests 1 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-astra-final/view-fixture-calibration-99c36b0.log` | 5643 | `f755355170f7cad3c04c4176e644fc0ba03e2e6c8350f4b1c4ee13ec5333beab` | revision=99c36b0; exit=1; xai-detail-review-QNw9Ce; Tests  3 failed / 5 passed (8); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-save-diagnosis/before.log` | 4553 | `e4e1ae1f1e9002e707e91c3b4e654c26ee8732edea99d2001bb0281420e10df7` | Tests 3 ⎯⎯⎯⎯⎯⎯⎯; Tests  3 failed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-after-5c6ed8e.log` | 1045 | `9b7a64571a8509890046a2fbf5fdd00c8cd95e11c73c213cb353fd8ea74a4065` | revision=5c6ed8e; exit=0; xai-detail-review-GTCwVQ; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-c201a1d.log` | 3236 | `29b94a53b218939e5b4c6d60e5c6bcc263de0f562d34f114a678598bf2cd3d2d` | revision=c201a1d; exit=1; xai-detail-review-W5CtBq; Tests  3 failed (3); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-final-99c36b0.log` | 1045 | `a74583569ca3778f2530c45354410cabbc2e078b698d14ed892e1f5a0e312939` | revision=99c36b0; exit=0; xai-detail-review-eM1BXW; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent.log` | 3236 | `8747e908956204a02259ddd6b93974d2583fadc7b9289d350e562b46f43ab615` | revision=d7f1987; exit=1; xai-detail-review-WglhJo; Tests  3 failed (3); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/after-5c6ed8e.log` | 42724 | `011619b9a3263ff874745e826132e157d457486103b995194f2bdbc66ce19b81` | revision=5c6ed8e; exit=1; mode='board' 15ms; mode='card' 15ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/before-8105cc9.log` | 41348 | `88ed98c2082fd5baff0fd20a325e6494d63c3cc30359be28ad8625b1bb9f19cd` | revision=8105cc9; exit=1; mode='board' 15ms; mode='card' 32ms; Tests  9 failed / 309 passed (318); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/final-99c36b0.log` | 42848 | `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2` | revision=99c36b0; exit=1; mode='board' 51ms; mode='card' 31ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/focused-final-99c36b0.log` | 2159 | `03148555c870176dcd44f236a8613cec864b58724ef33e744f05355968c692dc` | revision=99c36b0; Tests  20 passed (20) |
| `docs/reviews/web-board-detail-sol-fix/native-5c6ed8e.log` | 872 | `2ab891bf7ffa1d459798c4613c2c609a893f9ed8d2d245009ae8b0fd94fdaad5` | 14575 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0-parent-independent.log` | 871 | `21ed2d0dc55e626a524487bc6915c6753cdb861fb1fd87975b33cb055be77c78` | 17812 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0-parent-visual.log` | 871 | `dc27417de8003d898575a8d1248f6a98fe837cbbb51f7220d0a4db19bc3f6dd3` | 18500 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0.log` | 871 | `901e7c6edfda6ad5928a6794e2d2749ba654ad2687361de76d0967fe2faaea4e` | 15385 |
| `docs/reviews/web-board-detail-sol-fix/original-three-after-5c6ed8e.log` | 1045 | `b5294b21ac2f8cc86c8744e44b92d76a1e99507258daf6f149baa8edad05111f` | revision=5c6ed8e; exit=0; xai-detail-review-lL8iHn; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-sol-fix/original-three-final-99c36b0.log` | 1045 | `6fe43e39714cf90267963f3f16813b9836bcb45844254d0fce29d791d1b25678` | revision=99c36b0; exit=0; xai-detail-review-IepdNM; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-sol-fix/parent-tasklink-fixed-8ab38ed.log` | 12054 | `c895a34325475b440110700737ad91e2efcd2f879bb47f1f4abfb25836e8c929` | revision=8ab38ed; exit=0; Tests  336 passed (336) |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-admitted-fixture.log` | 456 | `a9c7f5654c6bf6ac2e50c5b221c42609af187c0e288ef30de7c21e6111dec7f4` | 23613 |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-before-fixture-repair.log` | 1 | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` | No process verdict in artifact; source review required, never zero cost |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-initial.log` | 59 | `9970ac33ccf0da85343be4010152f33e6097a541cd4006613ff577b2e2e9663a` | 23393 |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/after-focused-8ab38ed.log` | 18099 | `89d466756d4f958e485822195860e7dd09244f13b23342be1e7a91ba8cd0ac38` | mode='board'; mode='card'; Tests  15 passed / 90 skipped (105) |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/after-package-8ab38ed.log` | 10969 | `dc8431b976d92c39a0ff9a91db2126c675bb3aab03fcc19056b243d93ff40c3c` | Tests  336 passed (336) |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/before-package-99c36b0.log` | 42848 | `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2` | revision=99c36b0; exit=1; mode='board' 51ms; mode='card' 31ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/lint-8ab38ed.log` | 193 | `28642457417e442ab2cbf1b7879e9b0b1c9a41cfb54df78a7b1756fda4056e22` | No process verdict in artifact; source review required, never zero cost |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/typecheck-8ab38ed.log` | 185 | `372dbabd7bcc2aed60b945d0e1ddff9aeda70c3f4b8f52a832c2fbd9f015cacc` | No process verdict in artifact; source review required, never zero cost |

Byte-identical historical duplicate groups:
- `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2`: `docs/reviews/web-board-detail-sol-fix/final-99c36b0.log`, `docs/reviews/web-board-tasklink-sol-fixture-fix/before-package-99c36b0.log`. No extra process inferred.

## 13. Single-pass integrity result and exact output preparation

Static integrity checks completed once: 312 ordered task rows from original sections.tasks; all original fields and original_module; unique workflow attribution A29/B117/C126/D40; 39 exact reversible labels; full retained original execution records; original933/current939 evidence; TT-08-only six additions; formal13/3/3/293 and299unclosed; exact registration and parent; four-TT08-doc-only P0 delta; unchanged checkout inputs; canonical Clock hash. Rehashed all **20349 inherited identities**, with zero mismatch, and added fixed-parent/current required inputs for **25729 manifest entries** over **4320 unique Git objects**.

Both complete buffers were constructed before either file write. Output hashes are in the handoff to avoid circular self-hashing. Static PASS refers only to these explicit integrity assertions, not contract approval, product behavior or any runtime check. All runtime/test/build/lint/browser/native/server/qualification/probe/vendor checks remain UNRUN (0 each). No semantic failure was retried. Failed exploratory reads (missing guessed paths/abbreviated revision and unmatched optional globs) remain disclosed; no evidence runner was launched.

## Full source appendix 3 - BRD-12 full reviewed T1-T4 basis

Source 68d0f14b243a1becb70811ca01a503cdcd244022:docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md; SHA-256 e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf. Entire source begins below.

# BRD-12 writer/lifecycle impact review r1

**Verdict: APPROVED for the finite T1–T4 technical design basis only.** The proposal at `11d6527709a5a735200151768296a312a3a30314` supplies a source-grounded, bounded route to address the complete writer and lifecycle admission problem. No blocking contradiction was found in that proposed basis. This does **not** adopt the capsule/schema, API, storage key, migration, protected paths or product changes; T1–T4 runtime admission is still unproven. The next step is an exact versioned contract amendment and fresh independent full review, followed by explicit root adoption. BRD-12 remains pending.

## 1. Fixed identity and independent role

Module **web**, workflow D under the sole A-Codex controller. Fresh independent reviewer `/root/parallel_d_brd12_lifecycle_impact_review_r1`; never repair, no children. Task card specifies gpt-6-astra; a configured model is not independent provider attestation or cross-vendor evidence.

- Sole writable checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-lifecycle-impact-review1-20261010/XAI_Desktop`.
- Clean direct dispatch parent: `b9ed5f63256620b1135ba9e782f08992923bd3c4`.
- Fixed input: `711cfd8d7a587468d4ff133eb6d5911ad4dd79ef`; immutable product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd12-writer-lifecycle-impact-review-r1.json`.
- Full sources: impact `11d6527709a5a735200151768296a312a3a30314`; full conditional review `cdb8820b434aa7f2adb9cc5ad5f14118eb24230c`; full proposal `5fa4cccb106d10e16562e0a8d6f3b103495607b1`. Each source adds exactly its two documentary artifacts; source copies are checked against immutable Git blobs.
- AGENTS, CLAUDE, shared workflow and multi-machine rules, original goal, authority overlay, goal-D, scheduler, registry, current control, exact card and complete source documents were read. Root's explicit no-push/no-global-write worker bounds govern this checkpoint.
- Only this `review.md` and sibling `inputs.sha256` are ADD outputs. No source correction, product/test/config/CSS/schema/host/ledger edit is authorized.

## 2. Independent integrity and preserved original scope

One independent static pass read and rehashed **all 25632 source-manifest identities**, including the complete **20349** prior-review identities: **25621 raw blobs, 10 raw tree objects, one external original goal; zero mismatches**. Raw trees were read as length-delimited Git object bytes, not pretty tree text. Source-manifest SHA-256: 63bbf0af40529bc0765910fad3329713380a5d4292229abc8d3ad076a75d43db. This review manifest has **30933 identities**, adding fixed-parent/source/registration references. Full-byte hashing proves preservation, not semantic review or execution of every transitive file.

Independent JSON comparison used the actual **sections[].tasks** schema: all **312 ordered rows / 2808 original task fields**, each source-map counterpart, each complete retained execution record and ordered evidence were checked. Exact original_module/source and the **39 reversible raw-label normalizations (30 web（project-system）; nine web（跨模块验证索引）)** are retained. All **933** original references remain in order; only the exact six TT-08 references are added, giving **939**. Formal totals remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**. All three ledgers equal the author dispatch parent; TT-08 acceptance does not close TT-08 or TT-06.

P0 to review-parent apps/packages/package/lockfile comparison contains exactly the four already-received Time Tracker **api/design/dev_log/test.md** documents. Board/storage/host/CSS runtime is still P0; documentary differences are not runtime parity failures. Canonical Clock r2 full SHA-256 remains 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. B01-B12, all 24 original conditional paths, full R01-R12 and canonical section14 were independently compared to their complete source blocks.

The original action is **Checklist旧计数迁移与Done自动勾选规则明确化**; full acceptance is **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围, source `02-tasks-time-boards.md;05-visual-ux-audit.md`, original evidence empty, formal pending. Neither a truthful count alone nor a documented automation rule closes reversible Done.

The reviewer independently evaluates the preservation assertions left unrun by the author. This is a new review pass, **not a repaired/rerun author pass**. Impact author static1 remains **FAILED**: supplementary helper assumed `sections[].items` instead of actual `sections[].tasks` and failed before field/evidence comparisons. Its non-UTF-8 construction SyntaxError occurred before execution/writes and remains in history. Original failed and unrun statuses cannot be retroactively relabeled PASS.

## 3. T1 — complete writer inventory and serialization basis

The actual source census supports W01–W21. It includes reachable writers, exported alternate modules, generic primitives, marker writers and destructive erasers, rather than counting only the currently rendered hook. Relevant current source coordinates are fixed-parent/P0; all proposed changes below remain unadopted.

| Row | Independent source assessment and required preserved admission |
| --- | --- |
| W01 | Workspaces usePref, stable-absence mount seed and writeActiveBoard/writeLists are whole-array sync writers. Replace captured-render overwrite with a typed intent derived from authoritative locked source. Unreadable/invalid must never become seed. |
| W02 | Label/member strip and Board metadata/visibility changes rewrite the Board value. Lossless unrelated metadata/capsule preservation is mandatory; awaiting actual result must precede draft clearing. |
| W03 | Detail/field/list/card/archive/delete and Calendar/Table/Planner callbacks share writeLists/updateCard. Declared relevant-field intent, incarnation, existence and done tokens must update even for a same-valued manual done command; unrelated field changes retain ownership. |
| W04 | Mount/day/manual and genuine cross-list move automation use the same raw writer. Cross-list moves can affect other Done cards, including when moving out of Done. Actual completion/normalization/urgent/sort/move effects must be attributed separately. |
| W05 | Detail recovery performs exact source/readback checks but invokes a synchronous boolean save. Adapt without losing latest draft, stable append ID and collision logic. Both checklist synthesis sites must stop inventing rows. |
| W06 | Composer creates cards/lists and clears its pending state on save callback truthiness. Register intent before awaiting and await the typed outcome; new entities require new incarnations. |
| W07 | Board creation is Board-save then separate active selection with partial-success handling. Keep that ordered recovery, jointly lock workspace membership/Board dependency, then recheck owner and created Board before selection. No cross-key transaction claim. |
| W08 | deleteBoard currently selects first, writes without checking result, closes confirmation and can recreate defaults for last deletion. Guard before the first effect; commit/readback before selection/dialog closure. Exact last-Board loss and fresh replacement identity must be explicit. |
| W09 | Workspace recovery writes workspace/selection, reads Board membership and denies nonempty deletion. It is a dependency participant, not an invented Board writer. Shared L plus sorted workspace/Board K must encompass membership proof; no absent workspace-move feature is claimed. |
| W10 | Core BoardModule is an exported real writer with queued seed. Not the active route does not mean unreachable. The explicit adaptation path is necessary; raw refusal alone cannot make existing controls claim success. |
| W11 | Views BoardModule is also exported with ordinary mutations and seed. Same participant/result-aware adaptation requirement, rather than a route-only exclusion. |
| W12 | taskLinkCommand.saveLink performs a pending Board write, awaits canonical Tasks mutation whose callback rereads Board, then a Board acknowledgement. A single lock around the outer function would be inadequate or reentrant. The proposed three-phase saga and optional same-scope read-lock participant close the design gap without claiming Tasks/Board atomicity. |
| W13 | storage setPref/removePref and async mutatePref can replace/remove an unknown-JSON Board value. Refuse Board at every generic path, before equality fast paths; preserve usePref reads. Dedicated participant owns the new write boundary. |
| W14 | createScopedStorage exposes sync raw setters/removers and L-only coordinated variants. All must refuse Board, including injected stores. A JSON option or serialized token must not become a bypass capability. |
| W15 | migrateAccount holds exclusive L, copies prior generation in addition to selected legacy keys, stages/awaits secrets, rechecks raw source and commits marker last. Complete Board participation must apply to copiedSource even with Board absent from selectedKeys. |
| W16 | rollbackAccount changes/removes the marker without rewriting Board bytes. It is a reachability writer capable of reviving pre-U history. Fresh-generation restoration with retained current/prior terminal history is a necessary proposed replacement. |
| W17 | deleteAccountLocalData is an exported sync prefix eraser; wrappers/resume use L. Refuse standalone erasure, require the exact durable deletion authority, preserve already-confirmed captured-A continuation and never target mutable B. |
| W18 | resetAllPrefs loops registered xai keys, ignores false removals and broadcasts defaults. Board refusal alone is insufficient. The proposed pre-first-removal plan, exclusive L, result-aware reset and partial-result reporting are necessary. |
| W19 | storageContract/exportImport are pure transforms/constructors. No live production file-import caller was found. Keep public boundary preservation/refusal; do not invent a runtime importer or treat a returned payload as adopted live tokens. |
| W20 | Account export covers the captured current generation; separate recovery surfaces cover other raw sources. It cannot prove export of all histories removed by an account-prefix wipe. New all-target Board recovery bundle plus verified acknowledgement is required. |
| W21 | Shared/scoped raw census includes tests/setup/native/other datasets. No production Web localStorage.clear writer was found in the searched source. Task/Calendar own other keys and Desktop plugin-project owns different persistence; neither a Desktop nor cloud-sync grant follows. |

The proposed common order is finite and sound as a design: existing **account lifecycle L**, generation excluded, shared for normal commands; then all needed existing physical-dataset K locks in lexical order. Migration/reset/erasure/restoration take L exclusive. No K→L acquisition and no public API that reacquires L inside an already-held L/K callback. Existing deletion-workflow lock may precede L only on its recovery path. Task-link phase 2 must acquire L once and then canonical Tasks/Board locks in common order; it may not call the public Board writer inside that callback. Current canonical activation remains unchanged.

The scope/marker/tombstone/deleting barrier, same physical key, incarnation and intent checks are required after acquisition, every actual await and before publishing. Storage's read/validate/transform/serialize/write/readback segment is synchronous. Exact readback plus scope recheck precedes acknowledgement. Uncertain results keep stable identity/source/proposal; retry reconciles immutable receipt and successor chain before writing. Missing lock support refuses; existing hook-local serialization is not cross-document safety.

**External admission condition:** all same-origin Board-writing old clients, including cached clients, must actually be quiescent or reloaded to the admitted build before first capsule write and native acceptance. Two cooperative tabs and source search do not prove that condition. Neither L/K nor a capsule digest detects uncooperative byte-for-byte ABA; undetectable external restore remains a disclosed limit. There is no service-worker edit grant or claim that this review established quiescence.

## 4. T2 — exact capsule proposal, immutable operation and inverse

The proposed Board property/tag/version is concrete enough to review technically: optional `checklistRecovery`, kind `xai.web.board.checklist-recovery`, schemaVersion1, inside the existing Board[]/v1 storage envelope and existing key. Collision, null, wrong shape or unknown version must refuse mutation while retaining readable raw export; absence alone permits first tracking. The exact codec and its wire grammar still require the next versioned contract review and root adoption.

The journal/head, stable lineage/entity incarnations, explicit writer tokens and separate terminal X→U links establish a finite representation. Immutable body strings plus their SHA-256 preserve exact X bytes; U is a separate immutable entry. These hashes demonstrate consistency, **not signatures or authenticated authorship**. Live authority remains the newly captured account handle, admitted source chain and locks, never a historical owner string or imported token.

Validation must cover the entire dataset/envelope and each Board capsule, not only the selected card. All real unknown Board/list/card/row/envelope fields are losslessly retained; unknown fields inside the new protocol refuse mutation. Duplicate IDs and unsafe legacy numeric domains remain recoverable invalid/unsupported states, not normalization opportunities. Completion X freezes real pre-flags or the known aggregate pair, property presence (including falsy marker values), ordered targets, actual deltas/counters and immutable source/projection identities. No allocation proportional to an unknown legacy total.

Real arrays, including empty, take precedence. Literal user Item 1 or legacy-looking IDs remain real rows. Already-materialized provenance stays unknown. Genuine conversion records newly authored information and both original/immediate aggregate pairs; it cannot reconstruct historical titles. X must co-commit projection plus receipt. No-op automation mints no receipt, while explicit relevant same-valued manual intent may retire ownership.

Whole-operation U restores only still-X-owned fields on the same eligible incarnation, with current values matching X postvalues. Manual true/T0, later text/date/order/labels/moves, and distinct new rows are preserved. Derived counts use current arrays. Deletion/re-add, representation replacement, relevant manual rewrite or one conflicting X-owned target blocks all of U with zero inverse writes; unrelated original-true deletion is not resurrected. Retain terminal U and exact X. Same-mount trigger consumption prevents immediate replay; legitimate later manual/move/day/new-mount Y remains normal automation. X→U→Y and undo-Y have separate preimages.

Finite capacity means validate/size one full proposal and refuse the entire mutation on quota/serialization/capacity failure. No silent receipt eviction, pruning, successful projection without history, expiry, or unlimited-retention guarantee. Pending-discard never grants successful-history destruction.

## 5. T3 — migration, import, export and retirement

The source mismatch is confirmed: board-core accountMigration registers isBoardArray, while readBoardStorage supports arrays and v1 envelopes. Fixing only a UI decoder leaves both selected-import validation and previous-generation copy outside the intended semantics.

The three proposed modes have distinct, adequate technical purposes:

1. Same-account forward generation copy preserves exact immutable history/terminal links and continuously proven entity lineage; new generation authorization is newly captured. Validate all copied Boards, recheck source/marker after secrets awaits, verify candidate bytes, then marker-last visibility.
2. Foreign/unassigned/file replacement preserves original bytes and historical X/U but allocates fresh local incarnations/writers. Imported tokens are historical/non-executable even when account IDs match. Existing retired links stay retained; replacement of local information needs the exact loss plan.
3. Rollback/restoration creates a fresh generation with selected projection, validated union of current/prior history and U retirement, new replacement ownership and retained sources. Same ID/different bytes or missing history refuses. Directly re-exposing a previous marker cannot satisfy terminal U.

Ordinary reload is not import. Export helpers currently keep whole Board values/storageValue but only check duplicate logical IDs; the proposed full semantic equality across storageValue, top-level boards and logical payloads closes a real validation gap. Unknown envelope metadata stays in storageValue; logical-only output cannot claim a complete reversible dataset. Opaque malformed raw data remains available only under captured owner authority.

All actual destructive targets, including prior/candidate generations and lineage references, must be bound by the Board recovery bundle. Current-generation account export alone is insufficient. The reviewed idea neither changes credential exclusions nor claims server/cloud export, and still needs exact schema/error/backward-read contract text.

## 6. T4 — actual host, first intent, deletion and forced loss

Actual /app/board uses the Workspaces registration below App, AccountStorageGate/AccountDataGate and their keyed account subtree. The Board route presently has no DepartureCoordinator. Existing coordinator provides first-intent route/sign-out arbitration, but export/discard are synchronous void and its state dies on unmount. settingsDeparture has one mounted delegate. These facts support the finite host extension instead of claiming a local hook already owns global lifecycle.

AppProviders surrounds the routed children and has both transport/no-transport branches under WebAuthSessionProvider. A Board recovery host mounted as a sibling above those routed/account-remounted children can retain account-bound memory through controlled unmount. It must not require Router context at that placement; the route adapter owns router coordination. Register pending intent synchronously before first await, preserve latest draft/source/proposal/uncertainty, and mask A immediately outside A. Reentry under A' uses explicit new validation, never stale capability.

AccountDataGate.manage currently locks before inspect/unmount. A public lifecycle preflight must run before that lock; import/restore must consume the exact guarded plan before their first intent. Unsolicited auth/storage revocation still masks/fences synchronously and cannot be delayed by a dialog. App.handleSignOut must reach Board recovery before identity invalidation in both coordinator and fallback branches, preserve rail→Appearance→settings ordering, and recheck owner/first intent after awaits. Opt-in async departure resolution must preserve all existing caller behavior and release-once/first-intent semantics; source change invalidates affected prior exemptions.

Global reset needs admission before any key removal/default broadcast. Board/last-Board deletion and import/restore need the same exact-source loss authorization. Human/file interaction holds no storage lock; on reacquisition compare plan digests, targets and marker again. Changed source invalidates the old grant. Result-aware UI must distinguish partial reset and refusal.

For account deletion, the current orchestrator writes an intent and awaits server deletion before local cleanup. Therefore the Board loss plan and **durable pending deletion fence must precede the server request**, not merely local erasure. Proposed intent v2/receipt v3 retains complete manifest bytes and exact decision, not an unauditable hash alone. Every Board-changing/reachability participant—including migration, restoration and reset—must respect the pending fence while the server call awaits. Unknown server outcome retains it; only the matching explicit authorization rejection can release it. Captured-A confirmed continuation remains resumable after A→B. Legacy already-confirmed receipts continue under their original authority with absent historical acknowledgement disclosed; new requests may not take that exemption.

Reselecting a downloaded file and comparing exact expected bundle bytes/manifest supplies a feasible verification interaction; anchor.click is only a request. Wrong/cancelled/truncated/unreadable file or later source change grants no destruction. Actual native evidence must independently inspect the real downloaded file/name/bytes. Explicit discard separately names successful-history loss and affected generations. No new QL/QU product choice is needed.

beforeunload is a warning. Crash, forced termination or storage denial plus forced close cannot guarantee never-persisted memory recovery. The design correctly separates those physical limits from controlled departure obligations and existing committed bytes; it makes no dead-process-history guarantee.

## 7. Scope, full acceptance and retained canonical G1

The original **24 conditional paths** remain exactly conditional; the complete list and protections are reproduced in the retained appendix. The impact's explicit additional paths map to actual missing boundaries: pure Board codec/adapter and alternate writers, recovery host/registry and async UI, shared protected dataset/storage/scope/canonical read locks/migration/deletion, reset and account-deletion orchestrator, and AppProviders/App/Board registration/DepartureCoordinator. Narrow participant registration keeps storage independent of Board domain code. BoardRecoveryHost/route integration uses public barrels.

The additional test sources and owner API documentation paths are proposals only. No router.tsx, auth backend, service worker, Task activation/schema, shared CSS, token, config/lockfile, Desktop or cloud-sync scope is granted. Exact selected file subset, signatures, backward decoding and errors must be frozen in the contract amendment. Generic phrases such as “all writers participate” cannot replace the later row-by-row W proof. Worktrees do not remove semantic conflict with BRD-18/task-link, BRD-28/import/export, ordinary-field or list-lifecycle/shared-account work.

B01–B12 and R01–R12 remain complete future obligations, reproduced below without narrowing. B01/B02 distinguish immutable raw evidence from authorized X projection; B03 no inferred provenance; B04 all malformed/absence classes; B05 full conversion/migration/roundtrip; B06 all actual triggers; B07 complete inverse; B08 error/uncertain/latest-intent; B09 every account/lifetime/destructive path; B10 actual host and all consumers; B11 bilingual five widths/themes/44px/keys/manual visuals; B12 exact delta and preserved failure adjudication. None is runtime PASS.

Canonical Clock r2 §14 is retained verbatim in the appendix and compared to its immutable source, including **E1–E25**, **16 F1 invocations**, all accepted callers and capacity/refusal rules. E24 keeps C-FB002, OE and C-RD1 judging copies beside frozen failures; C-FD1 remains diagnostic only. Each final row requires producer commit/path/full hash/verdict and before/fixed applicability. Changed App/storage/coordinator source invalidates affected invariance-based exemptions; no blanket inherited PASS or blanket rerun. Missing/unqualified Clock evidence remains missing. Qualified measurement methods, original pixelFocusWalk, streamed immutable archive, lock/@repo guards, trusted pipe CDP, no nativeVirtualKeyCode, actual downloads and existing M+G+B sequencing remain mandatory.

The root's full chain remains: exact contract amendment → fresh full review → explicit schema/API/path/semantic-lock adoption → source-qualified full B/R/W oracles and permanent-unit budget admission → valid complete original-product before → separately authorized implementation → independent fixed + integrated/native/visual/affected regressions → actual cross-vendor → fresh full original-scope Astra acceptance → root append-only reconciliation → independent integrated inventory. This review skips none of them.

## 8. Permanent costs and failed/unrun history

Review **1/3**, one static pass. Impact author **1/3 static FAILED** stays consumed; prior preparation **2/3** and full contract review **2/3** stay consumed. No corrected author helper, source repair or second reviewer semantic pass. Runtime/tests/build/lint/browser/native/server/qualification/probe/vendor/children: **0 each**. Static Git/JSON/raw-byte inspection is not a product execution.

Full transitive originals preserve seven rejected-append artifacts (five diagnosis + two Sol original-three), six archive roots WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM plus main-checkout before; three assertions are not three invocations. Detail calibration/view/final vR4Xvt/QNw9Ce/H1Ap2r retain 5/8/8 cases and failures; 0NW1Ae author rerun is separate mode. Native detail PIDs14575/15385/17812/18500 are four sessions. Package roots lpCkP7/zYQAbA/qnu7yE/BmWgbG retain nine fixture failures and bounded task-link correction; initial native PID23393, one-byte blank before-fixture and admitted PID23613 remain separate histories. Blank output is not zero launch cost.

Policy-era formal/probe subdivisions remain unknown where unreconciled. A renamed driver, actor, vendor, worktree or BRD label cannot reset a permanent unit. N-L/N-U/N-P are new assertion purposes, not automatic new broad Board/host/native budgets. Unknown/exhausted reused units require exact root reconciliation before runtime.

Clock Q1 focus1/3, six other units0/3, development2/83; retention3/3 exhausted with145 assertions/41 of42 case executions; final14/14 is not qualification. Clock R1–R6/impact2 and B70/refusal/calibration history persist. REL unknown vendor history and TT08 actual vendor3/3 confer no BRD allowance. No fourth or disguised probe run.

## 9. Receipt and next bounded action

Read-only inspection used Git status/rev-parse/show/diff/diff-tree/ls-tree/cat-file, cat/sed/rg and standard-library Python hashing/JSON comparison. Some terminal displays truncated long source excerpts; no validation result is inferred from truncated text. The final structured receipt reports complete reads and exact comparison results. One functions-level JavaScript construction call raised SyntaxError before any nested tool execution; no Python integrity pass or filesystem write ran. Correcting that dispatch text did not rerun a semantic pass. A memory-registry quick search found no BRD-specific evidence; none was used.

All input validation completes and both UTF-8 output buffers are constructed before either ADD file is written. Exact-file staging and command-local disabled hooks are required for the one Why/What/Scope/Risk/Docs/Tests commit. Final direct parent, source SHA, count, output hashes and clean worktree are returned to root. No push/fetch/sync-check, other-worktree changes, global writes, merge/rebase/promotion/deployment/release/D3.

**Next bounded action:** root may receive this finite-basis APPROVED review and dispatch a fresh independent exact technical contract-amendment author, retaining the entire conditional proposal plus this T1–T4 basis and all outstanding external/evidence gates. Do not start implementation or runtime, declare old-client quiescence, adopt a schema/API/key, reopen QL/QU, or close BRD-12 from this document.

## Retained full obligations

The following source appendices preserve the complete business/evidence/path/G1 and original-record obligations. They remain future obligations or explicitly historical receipts; they are not this review's runtime results.

## Structured static receipt

```json
{
  "source_entries": 25632,
  "source_categories": {
    "external": 1,
    "blobs": 25621,
    "trees": 10
  },
  "source_bytes_read": 1021880677,
  "prior_entries": 20349,
  "total_entries": 30933,
  "fixed_parent_inherited_paths": 5278,
  "original_task_fields": 2808,
  "rows": 312,
  "normalized_labels": {
    "web（project-system）": 30,
    "web（跨模块验证索引）": 9
  },
  "evidence_original": 933,
  "evidence_current": 939,
  "formal_counts": {
    "completed": 13,
    "verification_pending": 3,
    "in_progress": 3,
    "pending": 293
  },
  "conditional_paths": 24,
  "additional_product_path_proposals": 40,
  "source_manifest_sha256": "63bbf0af40529bc0765910fad3329713380a5d4292229abc8d3ad076a75d43db",
  "review_manifest_sha256": "89b21d0a905ce4a62e5969a3c0cf5a44399f383c3f1d7295643e5c1fe0171f2d",
  "canonical_clock_sha256": "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae",
  "static_result": "PASS - independent integrity and preservation only; author remains FAILED"
}
```

## Appendix A - complete conditional B01-B12, retained verbatim

The following is source proposal section 4, a complete future obligation, not an observed result.

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


## Appendix B - all 24 original conditional paths and protections, retained verbatim

## 6. Exact candidate implementation allowlist and protected semantic locks

**Current write allowlist remains the two preparation documents only.** The following is a proposed maximum list for a later root-registered implementation card after fresh independent review of §5, valid before evidence and source/lifecycle admission. Paths not selected by that concrete card remain protected; new schema/provenance files beyond this list require another review. Each ADD named here is a proposal, not an existing file claim.

```text
packages/plugin-web-board-core/src/types.ts
packages/plugin-web-board-core/src/internal/boardOps.ts
packages/plugin-web-board-core/src/internal/automationLite.ts
packages/plugin-web-board-core/src/internal/isBoardArray.ts
packages/plugin-web-board-core/src/internal/storageContract.ts
packages/plugin-web-board-core/src/__tests__/boardOps.test.ts
packages/plugin-web-board-core/src/__tests__/automationLite.test.ts
packages/plugin-web-board-core/src/__tests__/isBoardArray.test.ts
packages/plugin-web-board-core/src/__tests__/storageContract.test.ts
packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx
packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx
packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery.ts
packages/plugin-web-board-workspaces/src/internal/useBoardChecklistOperation.ts [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardChecklistOperation.test.tsx [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardWorkspacesModule.test.tsx
packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx
packages/xai-web-board-checklist-editor/docs/design.md
packages/xai-web-board-checklist-editor/docs/api.md
packages/xai-web-board-checklist-editor/docs/test.md
packages/xai-web-board-checklist-editor/docs/dev_log.md
packages/xai-web-board-automation-lite/docs/design.md
packages/xai-web-board-automation-lite/docs/api.md
packages/xai-web-board-automation-lite/docs/test.md
packages/xai-web-board-automation-lite/docs/dev_log.md
```

No CSS edits are proposed. Reuse current scoped board/recovery controls; if B11 cannot pass, freeze and register exact local selectors/files for independent impact review first. Protect **all shared CSS/tokens**, board/core/workspaces/views styles, shell/App/router, Dashboard/Clock/Header/AppRail, storage engines/hooks/account lifecycle/registry, task-link protocol and task store, Desktop plugin-project and adapters, schema/keys outside reviewed Board additions, all configs/lockfiles, original contracts/runners/failures and global states. No wildcard test directory permission. Read-only affected packages may gain separately registered tests if the reviewed impact matrix demands them, never ad hoc product edits.

Semantic locks: single writer for xai_boards_v2 checklist representation + Done forward/inverse + BoardWorkspacesModule/detail-recovery; exclude simultaneous BRD-18/task-link, BRD-28/import/export, ordinary-field recovery or list lifecycle changes sharing these paths. Shared-persistence and account-lifecycle **read dependencies** require source parity and integrated regression; touching their writers expands scope and stops this task. Calendar/date consumers are protected. Controller-receipt-lock is root-owned, never held by this worker; physical worktree isolation does not establish semantic independence. A later product SHA must account for any intervening relevant source delta via fresh review, never automatic rebase/merge.


## Appendix C - complete R01-R12 and accepted-caller obligations, retained verbatim

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


## Appendix D - canonical Clock r2 full section 14, retained verbatim

Historical roles and not-rerun bounds apply exactly as written; changed App/shared source removes corresponding exemptions. No runtime authorized.

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


## Appendix E - original BRD-12 record and TT08 evidence additions, retained verbatim

## 10. Exact retained source records

### BRD-12 full scope-map record (verbatim JSON values)

```json
{
  "id": "BRD-12",
  "priority": "P2",
  "kind": "决策",
  "action": "Checklist旧计数迁移与Done自动勾选规则明确化",
  "acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-12",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-12"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-12/prepare",
    "BRD-12/contract-review",
    "BRD-12/before",
    "BRD-12/implement",
    "BRD-12/verify",
    "BRD-12/accept",
    "BRD-12/reconcile",
    "BRD-12/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

### Dispatch TT-08 record: six new references preserved, not TT-06 completion

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```


## Full source appendix 4 - BRD-12 full original conditional review2

Source cdb8820b434aa7f2adb9cc5ad5f14118eb24230c:docs/reviews/audit-parallel-brd12-contract-review-r2/review.md; SHA-256 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810. Entire source begins below.

# BRD-12 full contract review r2 — conditional APPROVED

**Verdict: conditional APPROVED of the complete documentary proposal at `5fa4cccb106d10e16562e0a8d6f3b103495607b1`.** R1-01 and R1-02 are resolved at proposal level. This is not adoption of a storage schema, implementation permission, a runtime PASS, caller acceptance, formal item closure or release readiness. The implementation-admission prerequisites in §5 below remain blocking. No QL/QU owner question is established or forwarded.

## 1. Fixed identity and authority

- Module: **web**. Workflow D under the sole A-Codex controller; fresh independent reviewer `/root/parallel_d_brd12_contract_review_r2`, never repair. Task-card model is configured `gpt-6-astra`; configuration is not independent provider attestation.
- Sole writable checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-review2-20261010/XAI_Desktop`.
- Direct fixed parent: `9262f5f31128bc6bbf5de54e9c24238c58227d0e`, clean detached HEAD at entry.
- Registration: `9e437064fee350795005554d5a80e9d80bf719dc`; card `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd12-contract-review-r2.json`; fixed input `5ebbdd57f1b02e5cab36751bbefe6129ee97d2ae`.
- Full source under review: `5fa4cccb106d10e16562e0a8d6f3b103495607b1`, direct parent `41295a0f57728d93bb764f3679f5e2f3dafb86d4`; independently confirmed exact two ADD files, preparation-r2/contract.md and inputs.sha256. Both source blobs equal the supplied checkout blobs.
- Prior full review `bb08478d692091e6362926e2b75c1d0c34fc0ca2`; prior author `5d1f28a0f81ae01155a213fac93133730f7bad51`. Neither is altered. Product P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`; original scope baseline `e041c2bc293b70db367444c62c4300231976dbf7`.
- Original goal, AGENTS, CLAUDE, shared workflow/multi-machine rules, current control plane, authority overlay, goal-D, scheduler, task card and full source/r1 review inspected. CURRENT-CONTROL-PLANE's explicit r2 scheduling adoption remains authority; preserved historical unaccepted headers do not reverse that adoption.
- Only this report and sibling inputs.sha256 may be added. The worker's specific no-push/no-fetch/no-sync/no-global-write dispatch governs this local checkpoint; root owns preservation, receive, external Git and global state.

## 2. Independent integrity and full original obligation

Rehashed **all 15257 source-manifest identities**, including the complete **10166** prior-review corpus: **15248 raw blobs, eight raw tree objects, one external original goal; zero mismatches**. Raw trees were read through length-delimited Git cat-file bytes, not pretty tree text. Source manifest SHA-256: `1fb39fa30057dedf964b716e80f026818c96d71bada6156e745eaa6b93cd24da`. Original goal SHA-256: `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`.

This review's manifest preserves those exact transitive identities and adds fixed-review-parent versions of their file paths plus source/integration outputs and the exact task registration. Broad corpus hashing establishes preservation, not semantic examination or runtime execution of every file. This manifest contains **20349 entries**. Its hash and both final output hashes are reported in the handoff.

The full BRD-12 action remains **Checklist旧计数迁移与Done自动勾选规则明确化**, acceptance **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围; source `02-tasks-time-boards.md;05-visual-ux-audit.md`; original evidence empty; formal pending. No reduced “rename placeholder” or “document automation” substitute is approved.

Independent JSON comparisons checked all **312 ordered original rows**, every original task field and mapped counterpart, exact original_module for **39 reversible normalizations** (30 web（project-system）, nine web（跨模块验证索引）), every retained execution field, status and ordered evidence. Original **933** evidence references remain; only TT-08 has the six exact additional references recorded in source §10, giving **939**. States remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending**, **299 unclosed**. The three ledgers equal the preparation parent. TT-08 documentary acceptance does not close TT-08 or TT-06.

P0→review-parent product-path comparison contains only the four already received Time Tracker docs `api/design/dev_log/test.md`. Board product code, tests, storage, Web host, Desktop and CSS remain P0. This review changes no product or global ledger.

## 3. Existing authority and disposition of r1 findings

| Finding | Independent disposition |
| --- | --- |
| R1-01 raw preservation versus automatic completion | **Resolved conditionally**, source §4 B01/B02/B05–B07 and §5.1–5.2. Praw is immutable evidence, while an authorized X can change canonical flags/counts/marker. Pmount is separately frozen. Normalization, move, completion, urgency and sort have separate attribution. Inverse derives current real counts instead of restoring a stale chip. |
| R1-02 unjustified QL | **Resolved conditionally**, §2 and §5.1. Truthful aggregate display, no generated history, real-array precedence, explicit genuine conversion and preserved source summaries supply a concrete proposal. Its capsule remains an unadopted technical representation. |
| R1-02 unjustified QU / unspecified inverse | **Resolved conditionally**, §5.3–5.5. Stable X/preimages, co-commit/read-back, field tokens/incarnations, terminal U and legitimate later Y are specified, with retained failures, account fencing, departures, capacity refusal and explicit destructive loss handling. No session expiry or unlimited-history promise is inferred. |
| Seven-artifact correction and unit accounting | **Resolved as a factual correction**, §7. Seven original append artifacts are distinguished from actual execution roots and still-unknown formal/probe classifications. No budget is reset. |

**QL/QU authority challenge:** card-detail API §3.1 explicitly accepts the old aggregate when the array is absent. Checklist design Frozen Assumptions 1–4 gives real arrays precedence and clears an empty chip. The original audit `02-tasks-time-boards.md:160` asks for truthful missing-title presentation and explainable reversible auto-check; the exact BRD-12 acceptance rejects plausible invented Item1 titles. These settle information truthfulness without asking the owner to choose fabricated historical rows. The older checklist API and test AC4 deliberately accepted generated rows; the newer BRD-12 obligation requires a versioned reviewed oracle correction, not deletion of that historical contract.

Automation Lite design Preset Rules/User Behavior and actual `automationLite.ts` plus `BoardWorkspacesModule.tsx:632–680,780–790` settle semantic Done, opening/day, toolbar manual and genuine cross-list triggers. The audit suggestion of a configurable rule is not an adopted choice. The accepted append recovery architecture governs unresolved append preservation, not successful completion history duration. “Browser session” in scheduling does not authorize successful-undo expiry. Thus the r2 decision to emit no owner question is supported. A future missing hook, lock participant or schema validator is a technical prerequisite; only a source-proven contradiction between authoritative requirements that conservative preservation/refusal cannot resolve may become a minimal root-consolidated owner question.

## 4. Concrete representation, forward operation and inverse assessment

The proposal is coherent as a bounded design, subject to the exact implementation proof below.

### 4.1 Truthful representation and conversion

Absent array + valid aggregate knows only the pair; the UI must not allocate total synthetic rows or infer first-N flags. Missing, empty, malformed and unsupported states remain distinct. A stored real array is authoritative even if names look like Item 1 or IDs like legacy-*. Regex resemblance supplies no historical provenance. Duplicate identities refuse targeted mutation/inverse until resolved, while inspect/export remains available.

Explicit Start a real checklist/aggregate append preview records newly supplied rows as new information. It preserves original and immediate aggregate preimages, retains an earlier 1/3→3/3 automatic receipt if present, and keeps that historical summary out of current progress. Empty conversion needs explicit preview; cancel or failed save cannot mutate canonical data. Both synthesis sites must change together: modal getChecklistItems and recovery checklistItemsFor. Existing append identity/collision/latest-intent controls remain.

Guard tightening to safe integers is a proposed caller admission rule. P0's numeric-only guard does not already prove finite/nonnegative/integer/ordered counts or unique IDs. Before oracles must distinguish that source fact and preserve malformed raw data without clamping or seed writes.

### 4.2 Forward attribution and normalization

For real [true,false,false], X owns only the two false→true transitions and an absent/falsy→T marker, with completedCards=1. For legacy 1/3, X owns the aggregate 1/3→3/3, never “two historical rows.” T0 remains unchanged. Marker-only completion counts one card. An already complete card with a marker does not gain an artificial completion receipt.

Source nuance must survive the future oracle: completeCard can compute normalized detail, but applyBoardAutomationLite keeps original list.cards when neither card-change nor sorting selects transformedCards. A stale real aggregate is therefore not universally normalized by every no-op trigger. When a sibling completion makes that list's transformedCards effective, incidental stale-count/attachment normalization may persist without increasing completedCards for the already-complete sibling. Source §5.2's **actual** normalization attribution must be frozen against this source path; it is not permission to add an unconditional cleanup write. Purely unrelated list/board state and archived targets remain preserved.

All active semantic Done cards in the moved board's lists are candidates, including other cards. Genuine cross-list moves out of Done still call the preset; same-list/invalid-source moves do not. Urgency remains for eligible active non-Done cards; sortDueDates=false for moves. The multi-card example correctly preserves manual true, T0, archived cards, urgency and move/sort effects when undoing completion only. No background midnight scheduler is introduced.

### 4.3 Identity, persistence and acknowledgement

The same-existing-Board-value version-tagged checklistRecovery capsule is a plausible **proposal**, not an adopted storage contract. It avoids a second-key transaction claim. Exact version, collision handling, validation and export/import semantics still require technical adoption; preserving the outer array/v1 envelope does not itself prove backward compatibility.

X is immutable: stable ID, trigger/rule/time, raw digest, captured historical owner/physical key/generation, board/card/row incarnations, prior journal head, property-presence-tagged pre/post values, ordered affected set, field writer tokens, separate deltas/counters and resulting projection. Mutable terminal indexes and U links must be separate from immutable X bytes; the phrase “inverse status/link” in the receipt inventory is read under §5.3's explicit separate-index rule, not permission to rewrite X.

Cards + receipt commit together. Lock acquisition precedes authoritative reading; source/target/scope are reasserted after awaits; exact read-back and scope reassertion precede success or scheduling acknowledgement. A true no-op makes no write merely for history. Uncertain retry reads first: exact saved proposal acknowledges with zero new writes; absent X with exact original source retries the same ID/time/delta; collisions or unexplained source change retain conflict. Later compatible receipts require validation of the unchanged X and successor chain, not equality to an obsolete postimage. Reconfirmation is never allowed to report a never-persisted conversion as saved merely because an ID was allocated.

### 4.4 Field-owned U and normal later Y

U restores only X-owned unchanged completion fields on the same validated incarnations. It preserves manual true, prior T0, later text/title/date/priority/order/labels, and new distinct rows. Derived counts use the current array; it never restores a whole snapshot or resurrects deleted rows.

The proposal deliberately makes a relevant conflict **whole-operation zero-write**: any deleted/archived/ambiguous X target, representation conversion, manual done-field rewrite or later completion ownership blocks the entire U across all cards. Matching final booleans or reused IDs are insufficient. Deleting an unrelated original-true row does not resurrect it; it need not block remaining owned flags. Moving a uniquely identified live card preserves the move, subject to any intervening trigger Y's ownership.

U is terminal and co-committed, so repeated U acknowledges already-undone without a second inverse. Same-mount undo keeps the existing board/day scheduling marker; its rerender cannot replay X. Later manual clicks, qualifying cross-list events, day eligibility at an existing invocation and new mount/reload are legitimate Y and run normally. X→U→Y remains explainable with both histories; undo Y uses Y's own preimage. A no-op Y does not seize X's fields, while a Y that changes a relevant field blocks stale U. Durable receipts cannot become a lifespan-wide automation suppression flag.

### 4.5 Lifecycle and irreversible loss boundaries

Co-committed history survives ordinary modal/board/route departure and reload. Pending memory intent must remain in a reachable parent surface through controlled departures, reconcile uncertainty first, and require stay/retry/export or explicit pending-discard. A failed write plus forced termination cannot guarantee recovery of never-persisted intent; beforeunload is only a warning.

A→B→locked→A' must mask A information outside its context and fence old live scope handles, even if account names match. Reading validated historical A records from A' permits only a newly captured A' inverse intent; it does not reactivate stale A capability. Arbitrary external replacement/ABA cannot be claimed detectable from byte equality alone.

Card/list deletion keeps history at Board level but disables unsafe inverse. Whole Board/dataset deletion, reset or replacement must expose the loss and require verified export acknowledgement or explicit destructive discard; failed export cannot unlock deletion. The account/global action must actually reach that protection. Finite storage preserves existing receipts and refuses the entire new mutation on quota rather than evicting history, writing without a receipt or claiming infinite retention. Pending-discard and successful-history destruction are distinct actions.

## 5. Blocking implementation-admission prerequisites

These conditions were already retained by r2; conditional approval does not close them. They are technical work, not renewed QL/QU product questions.

| Gate | Source evidence and required next proof |
| --- | --- |
| T1 — every Board writer and migration | BoardWorkspacesModule writeActiveBoard/writeLists, reset, delete, move; composer/create/detail hooks; taskLinkCommand.saveLink; BoardModule writes/reset; shared setPref/removePref/raw scoped storage; accountMigration and global data lifecycle must be inventoried. taskLinkCommand writes Board before and after awaited task mutation. createScopedStorage still exposes synchronous unfenced setters, and accountDataLifecycle explicitly retains uncoordinated synchronous deletion callers. A Board-local lock wrapper does not automatically fence any of these. Prove all actual writers participate or are unreachable/quiescent, with account-lifecycle/dataset lock ordering and marker checks; register protected extensions if required. |
| T2 — exact capsule/schema compatibility | Adopt exact version/tag/collision refusal, validation, immutable X/U index encoding, mutation tokens and incarnations for every relevant ordinary writer. isBoardArray currently ignores extra Board fields and does not validate capsule semantics. Reject unknown/colliding versions rather than overwrite. No field name/schema/key is granted by this review. |
| T3 — migration/import/export | Account migration registers isBoardArray for xai_boards_v2 while readBoardStorage supports envelopes; compatibility must be demonstrated. Raw/whole export and logical Board payload must retain history, with items-first current projection. Imported owner/field tokens are historical, not executable capabilities. Restore/re-import must not revive retired U or reuse incarnations by ID alone. All unknown envelope/Board metadata remains lossless. |
| T4 — actual host, account and global loss paths | Actual /app/board registration, AccountStorageGate, route/logout/reload/deletion/reset/import entrypoints and public departure APIs need source reachability review before a product card. A local hook cannot promise a guard when the host can unmount it first. Test real account generation/second document, not a fake standalone fixture. If current public APIs cannot satisfy B09, seek exact independently reviewed technical scope; protected App/router/storage cannot be edited ad hoc. |
| T5 — exact oracles and costs | Freeze raw pre-mount and actual post-mount controls, all business cases, real source and all known failure histories. Correct generated-row historical expectations only in independently reviewed versioned copies. Reconcile permanent actual execution units and formal/probe subdivisions before runtime; unknown/exhausted reused units have no automatic allowance. |
| T6 — separate grants and downstream evidence | Exact impact/review/write card, semantic locks, valid before, implementation, independent fixed/native/visual/regression evidence, actual cross-vendor, full Astra acceptance, root reconciliation and fresh inventory remain required. No accepted-caller evidence is inherited solely by filename, actor, new worktree or BRD label. |

The proposal's exact **24 candidate paths** remain a maximum conditional list, not a current grant: nine board-core paths, seven workspaces paths including two proposed ADDs, eight checklist/automation owning docs. All 24 were retained exactly from source §6. No shared CSS/tokens, Board styles, shell/router/App, Clock/Header/AppRail, shared storage/account engine/hooks/registry, task-link/task store, Desktop/adapters, config/lockfile, historical evidence or global state edit is authorized. Several actual writer paths above sit outside this list; this is why T1–T4 must resolve before implementation, not grounds to pretend the list already covers the complete runtime.

Semantic ownership of xai_boards_v2 checklist/forward/inverse and its writer coordination remains exclusive against BRD-18/task-link, BRD-28/import/export, ordinary-field recovery and list lifecycle work. Worktree separation does not prove independence. No automatic source repin/rebase or grant arises from later controller commits.

## 6. Full business matrix disposition

Every row is retained as a future acceptance obligation; none is reported runtime PASS.

| Row | Conditional contract disposition |
| --- | --- |
| B01 | Truthful aggregate-only representation; both synthesis paths; failed appends; immutable Praw/preimages versus attributable canonical X. |
| B02 | Preserve literal real names/IDs/order/manual flags; array/empty precedence; operation-relative deltas and current derived counts. |
| B03 | Materialized/imported ambiguity remains unknown; no regex provenance inference or destructive cleanup. |
| B04 | Missing/empty/invalid/version/count/identity classes; no seeds, clamp or large synthetic allocation; preserve source and refuse unsupported mutation. |
| B05 | Lossless explicit conversion, array/envelope/metadata/idempotence, migration/export/import and foreign-token fencing; T2/T3 outstanding. |
| B06 | All known Done variants, archived controls, mount/day/manual/cross-list, other cards, source-accurate normalization and urgent/sort counters. |
| B07 | Exact manual-true/T0/new-row/later-edit preservation, field-owned U, whole-operation conflict, stable U and normal future Y. |
| B08 | Physical-key read/write/quota/read-back faults, latest pending intent, double-click/retry/collision, uncertain commits, explicit export/discard with no false success. |
| B09 | Owner/physical key/generation/epoch, A-B-locked-A', removal/archive/move, route/modal/board/reload/forced loss; T1/T4 outstanding. |
| B10 | Real App host/storage plus Card/Table/detail/export/Calendar/Timeline/Planner consistency; native new document and real second-document conflict required. |
| B11 | EN/ZH 375/414/768/1024/1440, themes, long content, truthful recovery and undo controls, 44px applicable targets, trusted keys and visible focus/manual screenshots. No CSS grant. |
| B12 | Exact delta, frozen original failures/oracles, reviewed new copies, full affected callers and canonical G1. |

## 7. Full evidence matrix and canonical G1

| Row | Retained producing evidence |
| --- | --- |
| R01 | Complete hashes/actual-unit history and concrete representation/lifecycle adoption, closed technical admission, frozen full B consistency. |
| R02 | Exact before raw/source/operation identities; expected failures and positive controls; no unexpected PRECONDITION; all actual trigger/append/ordinary paths. |
| R03 | Real App/account host before, counters, trusted native interaction, screenshots and downloaded bytes; synthetic supplements labeled. |
| R04 | Exact product delta, author immutable-source logs and costs, reviewed versioned semantic oracle correction. |
| R05 | Fresh independent full B01–B12 fixed evidence, all §5 branches including conversion/inverse and migration/account/error roundtrips. |
| R06 | New document, genuine second document, account epochs, trusted drag/keys and disk export inspection; actual provider evidence where claimed. |
| R07 | Five-width bilingual/theme manual visual and qualified per-stop focus with CSS invariance. |
| R08 | Board core/workspaces/views focused/full tests/typecheck/lint, Web host gates, storage types, all named consumers and task-link/append/creator/composer/workspace recovery; preserved failure adjudication. |
| R09 | Complete canonical Clock r2 E1–E25 and all accepted judging copies, each with applicability, producer/path/hash/verdict; affected reruns only after permanent-budget admission. |
| R10 | Actual cross-vendor verification and fresh full Astra caller acceptance; this review is neither. |
| R11 | Root serialized receive/preservation/integration, full ledger equality and append only after acceptance, remote ancestry and sync check. |
| R12 | Independent integrated inventory and residuals; no automatic formal or release closure. |

Independently compared source §8 against **canonical Clock r2 §14**, SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`. Full E1–E25 retained:

E1 frozen source/lock/@repo/seed/spy/consistency; E2 six before modes and controls; E3 real host a–q/census; E4 native before/focus/geometry/K-1; E5 Clock F1 c1–c5 before; E6 exact implementation/author logs; E7 six fixed modes; E8 real host fixed; E9 all 17 values, reload/read/lock/uncertainty/second-document/retry/discard; E10 seven disk exports and setup failure; E11 native a–q/both auth branches; E12 downstream/events/other-key/chrome invariance; E13 bilingual five widths/pet/44px/selectors/manual screenshots; E14 per-stop all-state/theme focus/Tab-out; E15 **16** F1 invocations (12+2 Appearance K-1+2 rail); E16 Clock fixed release-once; E17 Header host/native/Astra/Sol/capacity copies; E18 source census; E19 protected diff; E20 storage types/lifecycle; E21 widgets gates+before; E22 grid gates+before; E23 Web/rail/CmdK; E24 all accepted callers; E25 producer/hash/verdict/refusal/capacity receipt.

E24 keeps AppRail eight modes 26/31/21/18/24/22/33/123 and parent31; Appearance 65/89/34/56/33/48/187, host33/package137, frozen continuity24/26 plus **OE26/26 judging**; Features 17/49/31/40/26/6, host40/package45/readers17, frozen downstream13/15, **C-FD1 diagnostic14/15**, **C-RD1 judging15/15**; More 22/20/14/13/15/11 and frozen boundaries plus **C-FB00210/10 judging**; Sticky109/original10/host28; Notifications41/boundaries24/Astra-host15/parent12; Date&Time7; Smart Lists/Collaborate/Pomodoro accepted host copies; settings-shell54/rest314. These are historical contractual counts, not new results.

No blanket inheritance or blanket rerun is approved. Valid immutable evidence requires source/applicability review; changed shared source/selectors void affected invariance exemptions. All required judging copies remain beside original failures. Canonical native exemptions are conditional on their exact source/chrome bounds. Missing Clock evidence remains missing; BRD documentation cannot finish Clock. Streamed immutable archives, requested/resolved SHA, lock/@repo checks, collision refusal, nonzero exits, trusted pipe CDP, passive key audit, no nativeVirtualKeyCode, actual disk downloads and frozen pixelFocusWalk remain. New measurement methods require full qualification, independent review and root adoption; Clock M+G+B sequencing is unchanged.

## 8. Permanent histories and actual cost

This is contract review **2/3**, **one static pass**. Preparation **2/3** remains consumed; review1 and original authors remain in the lineage. Runtime/test/build/lint/browser/native/server/qualification/probe/vendor/child invocations: **0 each**. Static hashing/JSON/source/log inspection is not a product test. No unknown old unit is reported 0/3.

Raw history inspection confirmed seven original rejected-append artifacts: five diagnosis plus two Sol original-three; six archive roots WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM and separate main-checkout before. Three assertions per process are not three iterations. Independent detail calibration/view-calibration/final roots vR4Xvt/QNw9Ce/H1Ap2r preserve 5/8/8 case sets and failures; author-tests-rerun has its own 0NW1Ae root/mode, not a fresh general Board budget. Native detail logs directly record Chrome PIDs14575/15385/17812/18500: four sessions, not a filename count. Board package roots lpCkP7/zYQAbA/qnu7yE and later BmWgbG retain the nine historical fixture failures and bounded task-link correction. Native task-link PID23393, the one-byte blank before-fixture artifact and admitted PID23613 remain distinct evidence; a blank artifact is not proof of zero launch cost.

Policy-era formal/probe subdivision remains **unknown where not reconciled**. Renaming drivers, correcting transport, changing actor/vendor/worktree or changing caller label never resets a reused unit. N-L/N-U/N-P are source-grounded new assertion purposes (reject synthetic history, inverse, ambiguous provenance), but exact driver/case/host overlap and admission must be reviewed before any count is allocated. Unknown reused-unit totals freeze those units, not every unrelated BRD assertion by association.

Clock Q1 focus1/3, six other units0/3; development2 invocations/83 checks; retention validation3/3 exhausted,145 assertions/41 of42 case executions, last14/14 not qualification; source review R1–R6 and impact2 remain blocked. All B70/refusal/calibration histories stay immutable. REL unknown vendor histories and TT08 three actual vendor runs confer no BRD budget. No fourth run, probe reset or source-evidence overwrite is authorized.

## 9. Scope receipt and next bounded step

Commands: read-only cat/sed/rg; Git status/rev-parse/show/diff/diff-tree/cat-file; Python standard-library raw hashing, JSON field comparison and historical log inspection. One early read attempted a nonexistent source-directory spelling; Git name-only supplied the actual preparation-r2 path, then the exact source was read. No product command or evidence runner was launched. Memory registry quick search found no relevant BRD evidence and none was used.

All inputs were read and validated and both output buffers built before either output was written. Only the two registered ADD paths are staged; one structured Why/What/Scope/Risk/Docs/Tests commit uses command-local disabled hooks. No source repair, history rewrite, push/fetch/sync-check, children, global writes, other worktree access, merge/rebase/promotion/deployment/release/D3. Final SHA, direct parent, exact ADD scope, cleanliness, manifest count and output hashes are handed to root after commit.

**Next single bounded step:** root may receive this conditional full-proposal approval and register a fresh independent **technical impact/admission** document task for T1–T4: complete actual Board writer inventory/lock fencing, exact capsule/migration/export/import representation, account/global deletion and protected departure reachability, with precise proposed extra paths only if source proves them necessary. It must be independently reviewed before any implementation grant. Then prepare/review versioned full B/R oracles and permanent unit-budget admission, collect valid before, and only then separately authorize product work. No author3 correction is requested by this review; if a subsequent source-proven contradiction requires one, retain cumulative author2/3 and review2/3 rather than restarting. Caller acceptance, 312 formal states and release remain unchanged.

## Full source appendix 5 - BRD-12 complete writer and lifecycle impact

Source 11d6527709a5a735200151768296a312a3a30314:docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md; SHA-256 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53. Entire source begins below.

# BRD-12 writer and lifecycle technical impact r1

**UNADOPTED TECHNICAL PROPOSAL — NEEDS FRESH INDEPENDENT IMPACT REVIEW. Author static pass: FAILED (supplementary ledger helper; no rerun).** The full r2 documentary proposal is conditionally approved; this impact does not adopt a capsule, schema, key, public API, migration, protected path, implementation or runtime permission. T1–T4 have a finite proposed resolution below, with explicit client-quiescence and evidence prerequisites. No QL/QU owner question is established. BRD-12 remains pending.

## 1. Fixed identity, authority and full obligation

Module **web**; workflow A; fresh independent technical-impact author, not implementer or reviewer. Configured task model gpt-6-astra is not independent provider attestation. Sole writable checkout: /Users/lijinlong/.codex/worktrees/audit-parallel-brd12-writer-lifecycle-impact-20261010/XAI_Desktop. Entry was clean at exact direct dispatch parent **53a961aaa4ae87e1453f27d91af3c8edd6ddaeeb**. Registration **cc012a5976919fb6cca8e0f19d0d6a628b033bc4**, fixed input **d39d8a9a32bf9e66310535c8622355daefb6b280**, immutable product **f9eb4b1f207bc4b46f547b90afc250424b3c8695**. Exact card: docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd12-writer-lifecycle-impact-r1.json.

Source full review **cdb8820b434aa7f2adb9cc5ad5f14118eb24230c** and conditional proposal **5fa4cccb106d10e16562e0a8d6f3b103495607b1** each introduce exactly two ADD artifacts. Source blobs equal this checkout's copies. Original author/review r1, correction r2, all failures, prior oracles and canonical Clock r2 remain immutable. Current control's documentary adoption does not confer technical admission. Read AGENTS, CLAUDE, workflow, multi-machine policy, original goal, authority overlay, A/D prompts, scheduler, task registry, full scope map and source proposal/reviews. Explicit worker no-push/no-global-write bounds govern this checkpoint.

Full action: **Checklist旧计数迁移与Done自动勾选规则明确化**. Full acceptance: **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围; sources 02-tasks-time-boards.md and 05-visual-ux-audit.md; original evidence empty. Truthful aggregate display alone does not satisfy reversible Done. Successful forward and inverse attribution, failed intent, account/lifecycle and every B01–B12/R01–R12 remain in scope.

The single static integrity pass read and rehashed all **20349** review-manifest identities: **20340 raw blobs, eight raw tree objects, one external original goal; zero mismatches**. Original goal SHA-256 is 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. Source review manifest SHA-256 is 48e8d4bbc84d99e8bbe5f9336d56c6a8652f653ba8a60349e2ee0d6279c8dec2. Added fixed-parent identities for every inherited path, exact source outputs/registration and complete named source directories: **25632 total entries**, including 5278 fixed-parent blobs and two parent raw trees. Corpus byte verification is preservation, not a claim that every transitive file was semantically reviewed or executed. Product diff P0→parent contains only the four already-received Time Tracker api/design/dev_log/test documents. Board, host, storage, CSS and account runtime sources remain P0.

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

## 3. Finite coordination design, pending intents and compatibility fence

### 3.1 One ordering, no lock-local proof

Propose reuse of existing **L = accountLifecycleLockName(accountId,demo)** (generation deliberately excluded) and **K = prefMutationLockName(full physical xai_boards_v2 key)**. No second Board-only lock name. Normal Board operations acquire L shared, then all required dataset locks exclusive in lexicographic lock-name order; Board-only takes K. Workspace create/delete dependency reads use the existing preference lock name for xai_board_workspaces and Board K in the same sorted acquisition. No acquisition order may start at K then request L. Migration/rollback/reset/account erasure take L exclusive, with no nested L acquisition. Existing deletion-workflow lock may precede L only for that existing recovery path; ordinary dataset writers never acquire it.

Add a narrow storage-owned protected-dataset API/participant registry. Storage owns locks/physical IO and rejects generic Board writes; Board core owns decode/validation/commands and never becomes a dependency of storage. AccountCoordination exports already exist; no generic policy engine or different account protocol is necessary. Participant absence/duplicate registration disagreement is a refusal, not permissive fallback. Eager Board barrel import in shellRegistrations currently loads core accountMigration registration before App render; the replacement participant must be eagerly and deterministically registered by the reviewed host bridge too, including account-recovery entry before Board route mount.

A normal command captures owner handle, physical key, originating auth/epoch generation, entity identities and intent revision before queueing; pending registry receives the intent synchronously. At L grant, after every K grant, after any approved async boundary and before publication: assert same live handle, complete matching committed-generation marker, no deletion tombstone or pending destructive barrier, same physical key, admitted client version, target incarnation and unchanged intended operation identity. Under final K, read raw exact bytes and validate the whole stored value before deriving a finite proposal. The read/validate/transform/serialize/setItem/readback segment is synchronous; do not await hashing or UI while holding it. Precompute immutable intent material before acquisition or use a synchronous canonical serializer/digest helper whose source must be reviewed. An unexpected await requires revalidation, not reliance on lock ownership alone.

Success requires exact serialized readback AND owner/marker revalidation, then same-tab publish of committed data. Write success/read denial is uncertain, retaining stable X/C/U/W identity and raw source/proposal. Retry reads first; matching immutable receipt plus valid successor chain acknowledges zero writes. Absent receipt with original exact source may retry same proposal. Divergent receipt, unexplained chain, unsupported capsule, missing marker or target replacement refuses; new current-source attempt is explicitly reconstructed, never a stale full-array overwrite. Lock unsupported refuses; no close-other-tabs promise substitutes for a working lock.

The command API validates the **declared touched fields** as well as projection difference. A user done-field command that writes the same final boolean still retires prior ownership; comparison-only diff cannot detect manual false→true→true intent. Pure unrelated no-op commands must not steal ownership. W metadata may change for an explicit relevant ownership event even where visible projection stays equal; true no-op automation still writes nothing. UI latest draft revision cannot be cleared by an earlier settled write.

### 3.2 First-upgrade and external ABA boundary

New gate code cannot prevent an already-running old bundle from calling native localStorage.setItem/removeItem. Web Locks coordinate only participants. Marker/token checks cannot detect a complete external byte-for-byte ABA restoration. **Technical admission requires verified quiescence/reload of every same-origin Board-writing document to the admitted build, including service-worker cached clients, before first capsule write or native acceptance.** Source search and two new cooperative tabs are insufficient. Missing quiescence evidence leaves cross-client write safety blocked; it is not a product preference or an excuse to waive B09. Unexpected external writes thereafter enter conflict; known external restore/import must go through §5. Arbitrary invisible external ABA remains a disclosed limit, never asserted solved. No service-worker change is granted here.

### 3.3 taskLinkCommand's actual await

Keep the existing recoverable ordered saga, not a Board/Tasks multi-key transaction:

1. L shared + Board K: validate source/card incarnation and Tasks availability snapshot, persist pending taskLink with W receipt, verified readback, release both.
2. mutateCanonicalDataset acquires L shared once, then **sorted canonical Tasks lock and Board K** via an exact optional read-participant extension to its existing implementation. Validate Board live incarnation and the same pending link inside its synchronous mutation callback immediately before Tasks write. It must not call the public Board mutation API while holding these locks or reacquire L. The extension accepts validated same-scope physical read keys, not arbitrary caller-supplied account lock names. Task store/schema/activation flag remains unchanged.
3. After await: reassert captured owner and auth handle. L shared + Board K anew, reread current Board, validate same incarnation + pending link/Tasks result; write only acknowledgement with W. If A→B or card deleted/re-added, preserve recorded pending/partial result and refuse acknowledgement; no B UI success. User retry reconciles already-created task without duplicate creation.

Without step 2's common lock ordering, wrapping ensureBoardTaskLink in a Board lock either leaves its task callback racy or can deadlock behind queued account-exclusive migration. This is the precise reason canonicalCommandState.ts is a proposed protected extension. Awaited server deletion has a different durable continuation contract (§6); it must not be cancelled just because the current account became B.


### 3.4 Proposed exact API boundaries for contract amendment

These signatures describe finite responsibilities; names remain unadopted. Storage's new protectedDataset module would expose registerProtectedDatasetParticipant("xai_boards_v2", participant), mutateProtectedDataset({key:"xai_boards_v2", scope, intent, expectedRaw}), prepareProtectedDatasetLoss({scope,cause,targetIds}), and commitProtectedDatasetLoss({scope,plan,decision}). The participant has synchronous validateWholeRaw, applyIntent, verifyReceipt and prepareMigrationCandidate functions. Intent is a validated discriminated union (ordinary/conversion/completion/inverse/create/delete/seed), not a generic untrusted next-value setter. expectedRaw fences reconstruction; participant receives current immutable decoded data only inside the lock. The public registry's missing/conflicting participant is fail-closed; package-specific schema stays in board-core.

Mutation result is a discriminated result: verified {operationId,physicalKey,raw,changed}; or refused/uncertain {reason,operationId,rawSource,proposalRaw?,receiptState}. Reasons distinguish account-changed, marker-changed, deleted/deleting, lock-unavailable, unsupported, invalid, conflict, quota, storage-unavailable and readback-uncertain. No operation sets a React success state from Promise existence. The capability used by internal raw commit is lexical, single-operation and never serialized/exported.

Lifecycle preflight is registerDatasetLifecycleParticipant(participant) plus requestDatasetLifecycleDeparture({scope,reason}) with reason manage/import/restore/reset/delete-account/sign-out/controlled-reload. It reserves a first intent synchronously, returns a typed Promise of stay or an exact operation-bound decision, and never looks up a new account after awaiting. The host recovery registry provides that participant; storage absence can permit only demonstrably no Board data/pending/history loss, otherwise refuses. It does not delay unsolicited auth revocation.

For new account-deletion requests propose AccountDeletionIntent version **2** and AccountDeletionReceipt version **3**, each with boardLoss:{version:1,planId,sourceManifestSha256,decision:"verified-export"|"explicit-discard",bundleSha256:string|null}. Complete loss manifest bytes are retained in the existing intent before server dispatch and transferred/retained for recovery; proof is not just an unauditable hash. Version 3 otherwise preserves owner/kind/generation/phase/updatedAt/authGeneration semantics. The exact new intent is the pending writer fence. Legacy versions remain readable under §6's explicit continuation rule. These version tags and fields require fresh independent schema review/root adoption, not this report's authority.


## 4. Exact proposed capsule and field-owned inverse (T2)

The following is a **specific proposal for review**, not an adopted type or name. Store optional Board property **checklistRecovery**, tag **kind:"xai.web.board.checklist-recovery", schemaVersion:1**. Keep the outer Board[] or kind:"xai.web.board.storage"/schemaVersion:1 envelope and existing xai_boards_v2 key. Do not silently enroll Board in the Task/Calendar canonical envelope. Existing item shape remains id/text/done.

Finite proposed capsule fields:

| Field | Proposed encoding and invariant |
| --- | --- |
| kind, schemaVersion | Exact tag/version above. Presence with any other shape/version, null, wrong type or colliding data refuses all Board mutation, preserves raw export. Absence alone permits first tracking. No rename/overwrite of collision. |
| lineageId, boardIncarnation | Nonempty generated UUID strings, collision-checked under K. New Board/replacement/import creates fresh identity; ordinary edits retain. Visible Board/card/row ID is never an incarnation. |
| head | null or the last journal entry ID. Every entry has unique id, previousId and digest; one linear ordered chain, no dangling/duplicate IDs or cycles. |
| journal | Array of immutable entries {id, previousId, kind, body, sha256}; kind is one of baseline, ordinary, conversion, completion, inverse, import, restoration. body is an exact JSON string, sha256 lowercase 64-hex digest of its UTF-8 bytes. Entries are append-only; no reserialization of older body strings. Parser rejects duplicate object keys in protocol bodies and validates all known structure. |
| entities | Ordered list/card/row identity records with visible ID, parent incarnation, immutable incarnation, live/deleted state, and field-writer token references. Distinct IDs are required in their actual addressing domains, including card uniqueness within Board; duplicate ambiguous targets refuse mutation rather than select first. Deleted records persist as descriptors; replacements allocate new records. |
| writers | Current tokens for completion-relevant field coordinates: representation/card incarnation, row done+row incarnation, aggregate done/total, completedAt property, and lifecycle/existence. Token names an immutable journal entry plus field index; value/presence must match validated replay at the current projection. Text-only/order/date/priority/labels changes preserve done token. |
| terminal | Separate append-only {completionId,inverseId} links derived from immutable inverse entries; exactly one terminal U per X. X body is unchanged when U appears. Repeated U reads/acknowledges terminal status without another inverse or resurrected capability. |
| retainedSources | Nonrecursive conversion/import summaries and exact original protocol blobs necessary to explain historical legacy pairs, retired or foreign history. Never use this section as live token authority. Large source data remains finite; no recursive nesting of the full receipt-bearing dataset. |

Completion X body freezes stable operation/trigger/rule ID, historical owner kind/account/generation/physical key/epoch, local day/live mount or click/move identity, timestamp, prior head, raw source digest, Board/list/card/row incarnations, ordered affected target set, full relevant pre-flag vector or legacy pair, property-presence pre/post tags, completion/move/actual normalization/urgent/sort deltas and P0 counters, and projection digest excluding capsule. A presence tag is exactly {present:false} or {present:true,value:<validated JSON value>}; absent is not null/empty. Include exact falsy completedAt prevalue when admitted. Store only actual finite source rows, never allocate total aggregate-count slots. Receipt body ownership is historical evidence; live capability is a new captured scope plus validator/lock checks.

Conversion C freezes original legacy pair and immediate pre-conversion pair (which can differ after X), plus genuine user-authored new rows/IDs and explicit preview acceptance. Count-only 1/3 remains unknown titles/vector; automatic 3/3 does not create historical rows. Real arrays, including empty, take precedence; real user names Item 1 and legacy-looking IDs are preserved literally. Ambiguous already-materialized rows remain real stored rows with unknown provenance, never bulk-cleaned by regex. Every actual unknown Board/list/card/item/envelope metadata field is carried forward by lossless clone-and-patch. JSON serialization may change formatting/key order only; immutable raw pre-mount evidence and receipt body strings remain exact. If a value cannot be faithfully represented, refuse rather than normalize it into a seed.

Validation is two-layer: preserve old raw readability/diagnosis, then strict whole-value mutation admission. Require nonempty valid Board[] or valid nonempty v1 envelope; unknown outer metadata is retained, unknown schema/tag is refused. Validate every capsule, journal edge/digest/terminal link/token, current target mapping and finite safe counts 0≤done≤total without silently tightening historical data into loss. Unknown fields **inside this new protocol** are an unsupported extension and refuse mutation while preserving bytes, not dropped. Real array versus stale aggregate is classified, not treated as absence. No fallback seed on read denial, duplicate identities, malformed JSON, unsupported capsule, invalid domain or empty dataset. Projection/receipt changes to one Board preserve all other Board values and envelope metadata.

U is whole-operation conditional inversion: same incarnations, live unarchived targets, X owns every field it proposes to restore, current values equal X postvalues, no representation or relevant-field replacement, all X targets eligible. Otherwise zero inverse writes with per-target reasons and retained X. Restore only X's false→true flags or known legacy count pair and X-created/falsy→T marker. Preserve manual true, T0, later text/date/priority/order/moves/labels and new distinct rows; derive real counts from **current** remaining array. Deletion of an unrelated original-true row does not resurrect it or necessarily block U; deletion/re-add of an X-owned row does. Multi-card one-target conflict blocks all of U. Archived target can become eligible again only with continuous validated incarnation and no relevant intervening write; a deletion/restoration boundary changes ownership and refuses stale U.

W must record declared checklist representation/replacement/toggle/removal effects even when rendered values coincide; delete/re-add cannot reuse old incarnation. Account-generation change alone never resurrects a W/X handle. In A' a new U intent may read validated same-account historical X and current lineage; it captures A' authorization anew. Imported/retired tokens are not live merely because owner IDs match.

No-op normalization nuance remains source-exact: completeCard may compute a normalized card, but applyBoardAutomationLite drops transformedCards when no card changed; a sibling completion can make incidental normalization persist. Freeze actual normalization separately; do not invent unconditional cleanup. X→U in same live mount retains consumed board/day trigger; later manual/cross-list/new-mount/day-eligible invocation Y remains normal automation. Y no-op does not steal X fields. X→U→Y has three distinguishable immutable records; undo Y restores Y preimage. No configurable rules, new midnight scheduler or durable suppression flag is proposed.

Finite capacity: validate and size the finite full proposal, then one setItem with receipt. On quota/serialization/capacity refusal, old projection/history remains and pending intent is retained/exportable. No history-count/time eviction, background pruning, successful write without receipt, or infinite retention claim. Explicit loss-authorized deletion is distinct from pending-discard. Old terminal U entries survive ordinary operations and roundtrip.

## 5. Migration, imports and exports (T3)

Source defect is concrete: Board core accountMigration.ts registers **isBoardArray**, whereas readBoardStorage accepts array **and** v1 envelope. Core index imports that registration; Workspaces index adds only panel/inbox/filter validators. Fixing capsule validation only in UI leaves migration rejection and raw-copy adoption untouched.

Proposed owner participant validates complete Board storage and provides three separate modes:

- **Same-account forward generation copy:** under exclusive L, raw previous generation plus marker and Board lineage are frozen; validate all capsules and preserve immutable journals/terminal links/incarnations, record generation transition as historical mapping in a new candidate receipt. Physical owner fields in old X remain historical, never rewritten. Current-field tokens stay usable only with continuity proof from the archived previous raw and migration journal. Reassert source/marker after secrets awaits; candidate readback precedes marker-last visibility. Missing or invalid Board data refuses migration, leaving originals and candidate recovery intact.
- **Unassigned/foreign/file replacement:** archive original bytes and capsule verbatim, validate coherence, allocate new local Board/card/row incarnations and local writers tagged import. Retain old X/U as historical/non-executable in retainedSources; do not import executable field tokens, account handles or an old un-undone head. UI says historical receipt preserved but automatic inverse unavailable across replacement. Existing local retirement links remain retained in same-account replacement archive/receipt. If replacing a nonempty dataset, §6 loss guard precedes write. No current production file importer is claimed; public helper outputs must label this requirement rather than silently return an adopted live capsule.
- **Rollback/restoration:** current rollback merely exposes previous marker, so it can revive X after U was recorded in a successor generation. Proposed replacement is a fresh forward generation containing selected prior projection, lossless union of reachable current/prior histories and terminal U links (same ID/different bytes refuses), fresh restoration ownership tokens/incarnations for replaced entities, and retained source references; marker written last. Never rewrite an archived generation. Old U cannot become pending again. If required history is missing/unreadable, refuse and keep both generations available; no guessing from equal visible IDs/bytes.

These are exact technical amendments for review; they do not authorize a migration rewrite here. Same-account ordinary reload is not import and keeps valid U eligibility. Genuine restoration invalidates conflicting inverse ownership while retaining preimages, consistent with existing whole-inverse conflict rule; it is not a retention expiry. Account physical-key change with a valid forward-copy chain allows new A' inverse capture; account-name equality alone does not.

Whole/raw exports preserve raw stored Board bytes and the entire capsule. createBoardExportPayload currently includes full boards, storageValue and logical Board.payload (good preservation structure); readBoardExportPayload checks logical IDs but does **not** compare all duplicate projections/payload contents. Proposed validation requires exact lossless semantic equality among storageValue boards, top-level boards, logical Board payload and projected list/card payload+counts, allowing only documented export timestamps. Contradictory duplicate representations refuse, never prefer the convenient one. Unknown envelope metadata remains in storageValue. Logical-only output cannot claim a reversible full-dataset roundtrip without envelope/raw companions. Current items-first derived counts remain canonical.

Account local export currently exports only captured current generation; prior/candidate generations and unassigned archives are separate. Account-wide erasure needs a Board recovery bundle covering every Board record in the actual destructive prefix, generation-marker/lineage references and retained deletion/restoration evidence, with exact physical names and bytes. Never label a current-generation export a complete backup of all erased histories. Credential exclusions remain; foreign account content is never displayed in B. Storage refusal/malformed bytes remain exportable as opaque raw only when owner authority permits reading.

## 6. Actual departure and destructive reachability (T4)

Actual route: router.tsx /app → ProtectedAppRouteElement → App → AccountStorageGate/AccountDataGate keyed fragment → AppInner/Shell/Outlet → shellRegistrations.tsx with boardWorkspacesWebModuleRegistration → package registration's BoardWorkspacesModuleRoute → BoardWorkspacesModule. The Board wrapper currently does not mount DepartureCoordinator. Existing host coordinator is public structural capability for route/sign-out, supports first-intent arbitration/live-blocker release-once, but exportDraft/discardDraft are synchronous void and its state dies on unmount. settingsDeparture owns only one mounted delegate. Reusing it alone cannot guard management events, reset, account deletion or forced auth gating.

Proposed finite integration:

1. Add a Board-owned recovery registry/service (memory, per captured account) mounted through an **AppProviders sibling host above RouterProvider's routed/account-remounted subtree**. Register current pending intent synchronously before any async write, not in a cleanup effect. Store exact latest draft/source/proposal/uncertainty separately from successful durable history. Account scope invalidation immediately masks A; no A content in B, locked or unauthenticated view. Service survives subtree unmount, not browser termination; reentering A' requires new explicit revalidation, never automatic stale commit. Controlled route departure keeps only a masked generic pending indicator outside owner context.
2. Add App-owned Board route adapter like existing pomodoroRegistration: one DepartureCoordinator, structural Board guard, first-intent reservation. Extend coordinator only through an opt-in async resolve capability for this caller: reconcile uncertain commit first, then stay/retry/export+verify or explicit pending-discard; existing synchronous callers retain their exact ordering/behavior. Cancel or failed export never proceeds. Guard lifetime is registry-backed; cleanup unregisters UI capability without deleting intent.
3. App.handleSignOut consults the Board recovery bridge before invalidateAccountIdentity and before SDK/sign-out/clearSessionStorage. Preserve existing rail then Appearance ordering and current Settings delegate; no double Board prompt. After each awaited decision recheck account/auth handle and first-intent identity, execute a single navigation/invalidation. Remote auth revocation cannot be delayed by a save dialog: mask immediately, fence operations and retain owner-scoped memory. Never modify Supabase/auth security semantics to preserve a draft.
4. AccountDataGate's manage handler currently locks **before** inspection; call a registered asynchronous lifecycle preflight before that lock and before children disappear. Recheck captured account after await. Import/rollback buttons use an exclusive-L destructive plan only after preflight. Remote generation marker/clear events still revoke synchronously, with pending data already in registry, not an attempted async block in a storage event.
5. Board/modal/switcher close use registry first-intent logic for unresolved operation: close may transfer recovery surface to parent, never clear the only pending intent. Changing Board selection, deleting target or last-board reset uses captured target and retained history. Already verified history survives ordinary route/modal/Board selection and same-account reload without a prompt. No guard merely because old X exists.
6. Browser refresh/tab-close registers beforeunload when pending. Browser Back/Forward uses real blocker; controlled in-app reload uses preflight. Forced termination, browser crash, storage denial plus forced close, and external account eviction cannot be guaranteed to preserve never-persisted memory. Warn truthfully; no autosave-to-another-account or promise of disk persistence. Existing committed receipt remains recoverable only while its physical bytes survive.

### 6.1 Verified export acknowledgement and destructive plan

For Board deletion/last-board replacement, global reset, import replacement, account-generation restoration and account deletion, compute a finite **loss plan**: operation ID, captured owner/physical target set, exact source digests+marker raw, complete affected successful history and pending intent, cause and requested scope. Show separate actions: stay/retry, export and verify, or explicit destructive discard of the named retained information. Pending-discard drops only unsaved intent and never authorizes successful-history deletion.

A Blob + anchor.click succeeds only as “download requested.” A standards-based verification path is available without claiming browser disk privileges: request the user to reselect the downloaded recovery file, read its bytes, compare the exact expected bundle digest and complete target manifest, then obtain explicit acknowledgement bound to that plan. File cancellation, wrong/missing/truncated file, failed read, different digest or changed source grants nothing. This is an implementation interaction under the existing verified-export requirement, not a new QL/QU product decision. Native proof must inspect actual disk file/name/bytes independently; selecting an unrelated equal fixture cannot serve as runner evidence of a real download.

Human/file work holds no storage lock. Reacquire L/K in the right mode, reread all target bytes/marker, compare exact plan, then commit destruction; source change invalidates old grant and requires new plan. Export alone never acknowledges X saved/U undone. Explicit destructive discard can grant the exact operation without export; it must name loss of already-saved history and all affected generations, not reuse the current generic preference-reset text. Controls may use existing local styles only; no CSS extension is silently granted.

Global reset obtains preflight before **any** key removal or default broadcast, then L exclusive for account keys and existing per-key coordination for device prefs. This is ordered multi-key work, not atomic. Preserve refusal/partial-result recovery and do not emit defaults for unremoved keys. No broad change to preference meaning or other caller success contracts. If another accepted caller cannot tolerate the extension, independently review that precise conflict before adoption.

Account deletion is especially early: useAccountDeleteOrchestrator currently persists deletion intent and calls server **before** local receipt/wipe. The loss plan must be validated and a **durable Board-loss authorization fence** established under L exclusive before server request. Proposed additive metadata in the existing deletion-intent/receipt protocol records plan ID, owner/generation, Board target manifest/digests and choice (verified-export acknowledgement or explicit destruction). Board writer admission checks a pending deletion-intent fence in addition to existing deleted tombstone, so no new Board history appears while the server call awaits. No new storage key is proposed. Unknown server outcome retains the fence and receipt; explicit server authorization rejection may release only the matching intent, following existing recovery rules. A server-confirmed A deletion may still finish A after A→B, using durable exact request/receipt authority; never require current B permission or wipe B.

Existing legacy deletion intents/receipts predate this Board fence. Do not invent retrospective export proof or block an already-confirmed privacy deletion forever. They remain historical destructive authority with a recorded “legacy history-loss acknowledgement absent” limitation; original server-confirmed cleanup proceeds by its exact existing receipt. A *new* request may not use that legacy exemption. New receipt decoder/version amendment, deletion-intent parser, start/confirmed/resume and account-prefix eraser all require independent contract review (§7). No server endpoint/auth coordinator redesign is proposed.

### 6.2 Reachability decision

Current public APIs satisfy basic route/sign-out arbitration and account locking primitives, but **do not** satisfy full BRD lifetime/global-loss requirements. The exact protected host/storage/lifecycle extensions below are necessary; a hook-only 24-path implementation cannot truthfully pass T1/T4. Client quiescence and real browser/account/native evidence remain missing external technical conditions. This report does not substitute a new owner preference, approve weaker standards or claim T1–T4 runtime closed.

## 7. Exact proposed protected extensions and acceptance boundary

Original 24 conditional paths are preserved verbatim in Appendix B. They remain conditional; this report's only writable paths are impact.md and inputs.sha256. The following **additional exact paths** form a finite proposed patch surface, not a grant. Each role is necessary for one source-proven edge. No wildcard “all necessary files” scope; no shared CSS, router topology, auth backend, service worker, config/lockfile or Desktop edits.

| Exact additional path | Proposed narrow responsibility |
| --- | --- |
| packages/plugin-web-board-core/src/internal/checklistRecovery.ts (ADD) | Pure exact capsule codec/validation/delta/field-token/inverse/import/restoration logic. |
| packages/plugin-web-board-core/src/internal/boardMutation.ts (ADD) | Board command adapter to protected dataset API; metadata-preserving W/X/C/U, independent of React. |
| packages/plugin-web-board-core/src/index.ts | Public export of the two owned APIs; deterministic participant registration. |
| packages/plugin-web-board-core/src/internal/accountMigration.ts | Replace array-only validator with whole-storage participant, explicitly including copied generations. |
| packages/plugin-web-board-core/src/internal/exportImport.ts | Coherent full payload/capsule validation and historical import classification. |
| packages/plugin-web-board-core/src/BoardModule.tsx | W10 async writer/seed adoption and result-aware recovery. |
| packages/plugin-web-board-views/src/BoardModule.tsx | W11 async writer/seed adoption and result-aware recovery. |
| packages/plugin-web-board-workspaces/src/internal/useBoardCreateRecovery.ts | W07 async two-step recovery and workspace dependency locking. |
| packages/plugin-web-board-workspaces/src/internal/useBoardComposerRecovery.ts | W06 async stable intent/latest draft acknowledgement. |
| packages/plugin-web-board-workspaces/src/internal/useWorkspaceSaveRecovery.ts | W09 Board membership/selection dependency and async outcomes. |
| packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.ts | Three-phase shared-order participant and post-await incarnation checks. |
| packages/plugin-web-board-workspaces/src/internal/boardRecoveryRegistry.ts (ADD) | Captured-owner memory intents survive route/account subtree unmount; masks and revalidation. |
| packages/plugin-web-board-workspaces/src/BoardRecoveryHost.tsx (ADD) | Bounded recovery/export/reselected-file verification UI, no storage authority from UI. |
| packages/plugin-web-board-workspaces/src/index.ts | Public host/guard/registry adapter exports; no host internal import. |
| packages/plugin-web-board-workspaces/src/BoardCreator.tsx | Pending/cancel/export state uses completed result, not Promise truthiness. |
| packages/plugin-web-board-workspaces/src/BoardSwitcher.tsx | Await workspace create/rename/retry; guard selection/close with first intent. |
| packages/plugin-web-board-workspaces/src/BoardDeleteConfirmDialog.tsx | Exact successful-history loss disclosure and async result-aware confirm. |
| packages/plugin-web-board-workspaces/src/BoardSettingsModal.tsx | Preserve latest field draft and pending/error through async Board metadata save/close. |
| packages/plugin-web-storage/src/internal/protectedDataset.ts (ADD) | Narrow participant registry, L→sorted K command IO, loss-plan capability, marker/readback gates. |
| packages/plugin-web-storage/src/internal/storage.ts | Fail closed generic Board set/remove before equality fast path. |
| packages/plugin-web-storage/src/internal/prefMutation.ts | Deny generic Board replace/reset; exported generic async path cannot strip capsule. |
| packages/plugin-web-storage/src/internal/accountScope.ts | Refuse all raw scoped Board setters/removers; retain normal scope semantics. |
| packages/plugin-web-storage/src/internal/canonicalCommandState.ts | Optional same-scope read participant locks for Board→Tasks saga; no Task schema/activation change. |
| packages/plugin-web-storage/src/internal/accountMigration.ts | Whole-source Board participant, post-await validation, fresh-generation restoration avoiding retired-U revival. |
| packages/plugin-web-storage/src/internal/accountMigrationValidation.ts | Explicit validator/transform registry boundary; no missing-validator fallback. |
| packages/plugin-web-storage/src/internal/accountDataLifecycle.ts | Typed guarded erasure boundary; current/all-generation loss snapshot, preserve legacy confirmed deletion. |
| packages/plugin-web-storage/src/internal/accountDeletionReceipt.ts | Independently reviewed versioned loss-proof/fence fields and decoder, old receipt handling explicit. |
| packages/plugin-web-storage/src/AccountDataGate.tsx | Preflight before manage lock/unmount and before import/rollback intent. |
| packages/plugin-web-storage/src/index.ts | Narrow public dataset/lifecycle preflight APIs used by owning packages and host. |
| packages/plugin-web-settings-shell/src/internal/resetAllPrefs.ts | Await preflight before first removal; explicit partial/refused outcomes. |
| packages/plugin-web-settings-shell/src/SettingsFooter.tsx | Correct data-loss disclosure, awaited reset/result UI and disabled repeat action. |
| packages/plugin-web-settings-shell/src/types.ts | Precisely typed async reset result boundary; legacy override behavior reviewed. |
| packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts | Guard/fence before server request; preserve captured-A continuation and B masking. |
| packages/plugin-web-settings-rest/src/internal/accountDeletionIntent.ts | Durable exact loss-plan authorization and pending Board-write fence; backward reading. |
| packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts | Transfer proof into start/confirmed receipt and preserve resume semantics. |
| apps/web/src/providers/AppProviders.tsx | Mount BoardRecoveryHost above account/routed subtree; no auth/security behavior rewrite. |
| apps/web/src/App.tsx | Compose Board sign-out preflight with accepted rail/Appearance/settings ordering. |
| apps/web/src/routes/modules/boardRegistration.tsx (ADD) | Host-owned Board route adapter using existing structural coordinator. |
| apps/web/src/routes/modules/shellRegistrations.tsx | Replace exactly the Board registration with the host adapter. |
| apps/web/src/routes/modules/departureCoordinator.tsx | Opt-in async resolution/reconciliation; preserve existing first-intent/release-once interfaces. |

No edit is needed to settingsDeparture.ts merely to add a Board wrapper: the existing delegate can still carry sign-out; lifecycle preflight is a separate narrow storage public API. No edit to router.tsx/RouteGateElements/main.tsx is proposed: AppProviders placement follows the verified existing tree. No registry key/ownership change is required. No edit to usePref is proposed because Board callers adopt the new mutation adapter and generic setters explicitly refuse; readers remain intact. No Task store, Calendar consumer, auth-generation coordinator or Desktop adapter edit is proposed. The legacy Board module files are included rather than asserting their exported writers are permanently unreachable.

Finite **additional test-source proposals**, separate from all historical runners and the original four/core plus workspace tests (each is a proposed ADD, never permission to run):
- packages/plugin-web-board-core/src/__tests__/checklistRecoveryAdmission.test.ts
- packages/plugin-web-board-core/src/__tests__/boardWriterLifecycle.test.ts
- packages/plugin-web-board-views/src/__tests__/BoardWriterLifecycle.test.tsx
- packages/plugin-web-board-workspaces/src/__tests__/BoardAllWriterRecovery.test.tsx
- packages/plugin-web-storage/src/__tests__/boardProtectedDataset.test.ts
- packages/plugin-web-storage/src/__tests__/boardMigrationDeletionFence.test.ts
- packages/plugin-web-settings-shell/src/__tests__/BoardResetLossGuard.test.tsx
- packages/plugin-web-settings-rest/src/__tests__/BoardAccountDeletionLossGuard.test.tsx
- apps/web/src/__tests__/BoardDepartureLifecycle.test.tsx

Exact public API/lifecycle documentation amendments would use these verified existing owning paths, separately reviewed before product adoption:
packages/plugin-web-settings-rest/docs/api.md; packages/plugin-web-settings-rest/docs/design.md; packages/plugin-web-settings-shell/docs/api.md; packages/plugin-web-settings-shell/docs/design.md; packages/plugin-web-board-workspaces/docs/api.md; packages/plugin-web-board-workspaces/docs/design.md. Storage has no existing api/design pair at this parent; propose exactly packages/plugin-web-storage/docs/board-writer-lifecycle.md (ADD), beside the existing usePref-write-results.md, for the new public boundary. No absent path is labeled existing.
The eight original checklist/automation owning docs remain in the original 24. Contract amendment and review must spell precise API/error/schema/backward-read behavior, exact selected subset of these paths, before oracles and semantic locks. This list is not a unilateral standards waiver or wholesale account refactor. If any listed existing path or public boundary cannot support the narrowly stated responsibility, stop for a new versioned technical impact/review rather than expand.

## 8. Required before/fixed proof and truthful gates

All original B/R rows are included verbatim in Appendix A/C. New participant proof must cover **each W01–W21 row**, mapping actual source → permitted/refused path → exact physical key → L/K mode/order → held-lock interleaving → post-await handle/marker/incarnation check → result/readback → history preservation. A grep or static lock call count is not runtime proof.

Finite additions to the unchanged business matrix: concurrent ordinary edit versus X/U; manual done no-op ownership; both task-link Board phases and pause inside Tasks lock acquisition; account exclusive queued before/after Board; copied-source migration containing Board when no selected Board import; rollback after terminal U; old-client attempted write versus proved quiescence; array/envelope unknown metadata; collision/unsupported capsule; account-prefix multi-generation history loss; route/POP/rapid route+sign-out first intent; manage-before-unmount; auth revocation masks; export failure/reselected wrong file/digest match with source changed afterward; server unknown outcome barrier; legacy confirmed deletion remains resumable; last-board deletion failure never reseeds/changes selection. These require a reviewed source-qualified runner and actual public host, not monkey-patching away the writer under test.

N-L (truthful legacy information), N-U (field-owned inverse) and N-P (ambiguous provenance) remain genuinely new assertion purposes compared with old synthetic-row/forward-only assertions. New W/lifecycle assertions extend technical admission; they do not create new broad Board/host/account/native units. Exact source/driver/case/process lineage and cost admission must precede any runtime. Real account generation and real browser second document are mandatory, not seeded account objects relabeled provider evidence.

Protected extensions invalidate relevant prior shared-source invariance exemptions. In particular App/departureCoordinator/storage/prefMutation changes touch Header, rail, Appearance, settings, widgets/grid and shared caller behavior. Full canonical Clock r2 **E1–E25**, native exclusions only within their actual unchanged bounds, E24 frozen originals plus C-FB002/OE/C-RD1 judging and C-FD1 diagnostic remain required. Canonical §14 is copied verbatim in Appendix D, including 16 F1 invocations and complete E24 counts. No blanket rerun and no blanket inherited PASS: each required evidence item gets source applicability, producer SHA/path/hash and verdict/refusal. Missing/exhausted/unqualified Clock work remains missing.

Sequence: **fresh independent impact review → exact versioned technical contract amendment → fresh full contract review → root explicit path/schema/API/semantic-lock adoption → source-qualified full B/R/W oracles and budget admission → valid full original-product before → separately authorized implementation → independent fixed/native/visual/affected regression → actual cross-vendor → fresh full Astra acceptance → root reconciliation → independent integrated inventory**. No stage self-adopts the prior one. Same-caller author is not the next reviewer/verifier. No raw-source grant can come from a documentary APPROVED label.

## 9. Permanent history, static cost and failures

Technical-impact iteration **1/3**, **one consumed static pass: FAILED**. Complete input hashing succeeded, but the supplementary ledger-shape helper failed; later field/evidence/state comparisons were unrun. No corrected helper or second semantic acceptance pass was run. Fresh independent review must assess those unrun preservation assertions; deterministic document construction and input/output/parent/scope/hash identity closure do not retroactively convert this author result into PASS. Prior preparation author **2/3** and full contract review **2/3** remain consumed; author/review r1 retained. Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children **zero each**. No script imports product code, launches a runner or reproduces product behavior.

All old append/native/package/account/shared histories remain transitive full-byte inputs. Seven rejected-append artifacts remain: five diagnosis + two Sol original-three; six archive roots WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM plus separately retained main-checkout before. Three assertions are not three executions. Detail calibration/view-fixture/final roots vR4Xvt/QNw9Ce/H1Ap2r have 5/8/8 case sets and failures; author-tests-rerun root 0NW1Ae is separate mode. Native Chrome PIDs14575/15385/17812/18500 prove four sessions, not four filenames. Board full-package roots lpCkP7/zYQAbA/qnu7yE plus BmWgbG retain nine historical fixture failures and repair lineage. D1/Task-link modes, initial PID23393, blank before-fixture artifact and admitted PID23613 retain distinct source/cost classifications. Blank log is not zero launch cost.

Policy-era formal/probe subdivision remains **unknown** where unreconciled. ≤3 formal per actual permanent unit includes refusal/precondition/launch attempts; probes disclosed separately. Changing actor/name/vendor/worktree/driver copy never resets counts. Unknown/exhausted affected reused unit has no automatic allowance; this does not make all independent new assertion purposes unknown. Clock Q1 focus1/3, six other units0/3; development2/83; retention3/3 exhausted,145 assertions,41/42 case executions, last14/14 not qualification. Clock R1–R6/impact2 and old B70/refusal/calibration histories remain. REL vendor histories unknown and TT08 actual vendor3/3 do not confer BRD credit. No fourth/renamed/probe-reset run.

Read-only commands: git status/rev-parse/show/diff/diff-tree/ls-tree/cat-file, rg/cat/sed and standard-library Python JSON/raw hashing. Exploratory path guesses were absent (storage/internal/engine.ts, routes/modules/BoardRoute.tsx, settings-shell/SettingsShell.tsx, and the xai-web-settings-shell/docs directory); command errors were retained, then actual paths were obtained from source. During supplementary ledger inspection a Python helper used sections[].items instead of the actual sections[].tasks and raised KeyError before its field/evidence comparison. That failed diagnostic is retained and was not rerun; no fresh 312-field-comparison PASS is claimed. TODO full-byte equality to the original was checked before the error. Full original/source-map/execution inputs were independently hash-validated, and the prior source review's complete 312/39/933+6 comparison is retained as historical evidence. They were source-location mistakes, not runtime attempts or input hash drift. The full-manifest JSON returned by one static helper exceeded tool output display capacity; complete validation finished with zero mismatches and its trailing count/hash receipt was retained. Manifest is reconstructed deterministically from the validated inputs and asserted against that digest before writing; no validation success is inferred from truncated display. The first deterministic output-construction invocation failed at Python stdin parsing with a non-UTF-8 SyntaxError before any execution/write; bounded ASCII payload transfer was then used. This construction failure is retained and does not trigger another semantic validation pass. No product/test command was launched. Memory registry quick search found no relevant BRD record; no memory evidence was used.

All inputs were read/validated and both output buffers constructed before either file write. Final exact two ADD scope, direct parent, output SHA-256 and clean status are reported in the commit handoff. No source repair, protected edit, global control/ledger/inventory write, push/fetch/sync-check, other-worktree access, merge/rebase/promotion/deployment/release/D3. Parent owns remote preservation/integration. Formal **13 completed / 3 verification_pending / 3 in_progress / 293 pending =312; 299 unclosed**, original **933** evidence plus exact TT08 **six** =939 remain unchanged. Documents and source preservation are not caller acceptance, READY_TO_SHIP, SHIPPED, runtime qualification or item closure.

## 10. Review decision requested

Independent reviewer should accept/revise this finite design against T1–T4, particularly common lock ordering/task phase, first-upgrade quiescence, capsule collision/immutable body/current-token validation, rollback retirement, old confirmed deletion compatibility, and pre-server/pre-unmount loss fence. Any discovered gap remains a technical correction with inherited iteration count, not a default QL/QU question. This author does not adopt its own design. No source-proven irreducible owner conflict has been found.


## Appendix A - complete conditional B01-B12, retained verbatim

The following is source proposal section 4, a complete future obligation, not an observed result.

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


## Appendix B - all 24 original conditional paths and protections, retained verbatim

## 6. Exact candidate implementation allowlist and protected semantic locks

**Current write allowlist remains the two preparation documents only.** The following is a proposed maximum list for a later root-registered implementation card after fresh independent review of §5, valid before evidence and source/lifecycle admission. Paths not selected by that concrete card remain protected; new schema/provenance files beyond this list require another review. Each ADD named here is a proposal, not an existing file claim.

```text
packages/plugin-web-board-core/src/types.ts
packages/plugin-web-board-core/src/internal/boardOps.ts
packages/plugin-web-board-core/src/internal/automationLite.ts
packages/plugin-web-board-core/src/internal/isBoardArray.ts
packages/plugin-web-board-core/src/internal/storageContract.ts
packages/plugin-web-board-core/src/__tests__/boardOps.test.ts
packages/plugin-web-board-core/src/__tests__/automationLite.test.ts
packages/plugin-web-board-core/src/__tests__/isBoardArray.test.ts
packages/plugin-web-board-core/src/__tests__/storageContract.test.ts
packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx
packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx
packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery.ts
packages/plugin-web-board-workspaces/src/internal/useBoardChecklistOperation.ts [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardChecklistOperation.test.tsx [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardWorkspacesModule.test.tsx
packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx
packages/xai-web-board-checklist-editor/docs/design.md
packages/xai-web-board-checklist-editor/docs/api.md
packages/xai-web-board-checklist-editor/docs/test.md
packages/xai-web-board-checklist-editor/docs/dev_log.md
packages/xai-web-board-automation-lite/docs/design.md
packages/xai-web-board-automation-lite/docs/api.md
packages/xai-web-board-automation-lite/docs/test.md
packages/xai-web-board-automation-lite/docs/dev_log.md
```

No CSS edits are proposed. Reuse current scoped board/recovery controls; if B11 cannot pass, freeze and register exact local selectors/files for independent impact review first. Protect **all shared CSS/tokens**, board/core/workspaces/views styles, shell/App/router, Dashboard/Clock/Header/AppRail, storage engines/hooks/account lifecycle/registry, task-link protocol and task store, Desktop plugin-project and adapters, schema/keys outside reviewed Board additions, all configs/lockfiles, original contracts/runners/failures and global states. No wildcard test directory permission. Read-only affected packages may gain separately registered tests if the reviewed impact matrix demands them, never ad hoc product edits.

Semantic locks: single writer for xai_boards_v2 checklist representation + Done forward/inverse + BoardWorkspacesModule/detail-recovery; exclude simultaneous BRD-18/task-link, BRD-28/import/export, ordinary-field recovery or list lifecycle changes sharing these paths. Shared-persistence and account-lifecycle **read dependencies** require source parity and integrated regression; touching their writers expands scope and stops this task. Calendar/date consumers are protected. Controller-receipt-lock is root-owned, never held by this worker; physical worktree isolation does not establish semantic independence. A later product SHA must account for any intervening relevant source delta via fresh review, never automatic rebase/merge.


## Appendix C - complete R01-R12 and accepted-caller obligations, retained verbatim

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


## Appendix D - canonical Clock r2 full section 14, retained verbatim

Historical roles and not-rerun bounds apply exactly as written; changed App/shared source removes corresponding exemptions. No runtime authorized.

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


## Appendix E - original BRD-12 record and TT08 evidence additions, retained verbatim

## 10. Exact retained source records

### BRD-12 full scope-map record (verbatim JSON values)

```json
{
  "id": "BRD-12",
  "priority": "P2",
  "kind": "决策",
  "action": "Checklist旧计数迁移与Done自动勾选规则明确化",
  "acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-12",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-12"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-12/prepare",
    "BRD-12/contract-review",
    "BRD-12/before",
    "BRD-12/implement",
    "BRD-12/verify",
    "BRD-12/accept",
    "BRD-12/reconcile",
    "BRD-12/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

### Dispatch TT-08 record: six new references preserved, not TT-06 completion

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```


## Full source appendix 6 - SHARED final complete impact3

Source f667a0b6996b4039d2c4e5ca28657953703e830b:docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md; SHA-256 ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9. Entire source begins below.

# SHARED / NATIVE-HOST-FOCUS-IMPACT3

Status: **FINAL TECHNICAL IMPACT AUTHOR3/3 — NEEDS FRESH FULL INDEPENDENT IMPACT-REVIEW2; UNADOPTED.** This is the complete combined prerequisite design for TASK-06 and MET-05. It corrects I1 with synchronous native-property and DOM-boundary acquisition, carries all four conditionally approved technical bases and retains all original caller and regression obligations. It is source-only design, not runner implementation, qualification, product acceptance or a new owner decision. No final caller source-author3 may launch until the full independent review and exact root adoption plus the explicit missing-source prerequisites below. No author4 exists.

## 1. Fixed identities, raw records and failure preservation

Module **web (project-system)**; workflow responsibility A under the sole A-Codex controller. Fresh independent actor /root/parallel_a_shared_impact_final3; requested Astra / gpt-6-astra is a dispatch label, not provider attestation. Sole checkout /Users/lijinlong/.codex/worktrees/audit-parallel-shared-impact-final3-20261010/XAI_Desktop; no other worktree was read or written. AGENTS/CLAUDE/shared workflow/multi-machine/original goal/authority-overlay/goal-A and the exact card govern this task; explicit no-push/zero-runtime scope leaves remote preservation to root.

| Identity | Exact immutable value |
| --- | --- |
| Direct dispatch parent R | 43ba9fcfadb1075bc117b4d75f8888573d1ae2f2 |
| Card fixed input F | 936c197dcf732bddf27bac00a6fc694fd010f6d1 |
| Product P0 | f9eb4b1f207bc4b46f547b90afc250424b3c8695 |
| Exact card at R | docs/reviews/20260908-full-product-audit/parallel-control-r1/task-shared-native-host-focus-impact-r3.json |
| Card SHA-256 | 25fd81b588291013f8ee35fe62f30804e01a0e60c41abdd901f073c661449d4c |
| Mandatory root author2 failure receipt | docs/reviews/20260908-full-product-audit/parallel-control-r1/shared-impact-author2-failure-receipt.json |
| Corrected receipt SHA-256 at R | f2fd4c29ff8e1e1778fac3e49ec62279e7bf11ec9cc74b0412588a9a1a515f37 |
| Original metadata receipt commit retained | 2ce65abd48688cb735a4740b47ec8f84f00095eb |
| Full shared impact1 | 516495625056a6123f22ff67df61c9c34dff2484 |
| Full independent impact-review1 | b7e075c51e77fbf9c376ae33e3a9e2fb3b69fd06 |
| TASK source-review2 / MET source-review2 | cd7be1409e6198e5032dceb85bad8cca2182c3ae / 21519e7f55db4fa609e194e5d2a9bd622445107c |
| TASK source2 / parent | f8821c1bb99a51f07a3e6d077bc3391affde7a99 / 1496abed5ea19e8de687a9abf326918e7cb07b1f |
| MET source2 / parent | 624e016359a0b48662828ffc9cc15db453792278 / ee30c5fae3cd5f74e7ee26906f8a84f296a7a61f |
| Original goal attachment | 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615 |

The original root2ce65ab receipt accidentally put descriptive runtime-product text in product_sha. Root corrected only that metadata before this actor launched; exact P0 is bound above, original Git bytes remain an input. Neither iteration nor static allowance changed. Author2 remains FAILED static1/1: its normalized dictionaries were compared against raw477/2663 record totals; full blob validation, complete patch/data comparison, both output buffers and writes were UNRUN. No author2 output or commit is inferred. Its unwritten fourteen-control idea is reference only, not accepted design, and this report is a fresh third iteration, never a rerun/doc-closure of that failure.

Raw records are counted before normalization. TASK review2 **477 raw records /477 unique objects**; MET review2 **2663 raw records /2651 unique objects**. Twelve source aliases in MET resolve to the same immutable objects as explicit Git labels and must have identical hashes. Their union is **2781 unique objects**. Full impact1 **2808 raw/2808 unique** and full review1 **2821 raw/2821 unique** are retained, not sampled. Current adjacent manifest is **2842 unique immutable objects /68,811,558 bytes**, SHA-256 **a0ae1254c46e6bff30713cb3436b80bede46d1248ceaf925373164595de7aaad**. Every input byte and duplicate-alias hash is checked in the one semantic static pass before writes. Complete byte integrity is distinct from runtime/visual/behavioral qualification; none was performed.

Both full source2 output sets remain byte-identical: TASK12 and MET14. Full binary/full-index patch reconstruction preserves TASK 1,735,850 bytes /648436d64cb21e552c8b057e8ecb76fa34cf1e5586e78a7769b8e18944982f4d and MET1,541,142 bytes /d895b2ba053b1b1d9f77d649f22f94ef97f5fadeb368747c6c4ea66d84224b85. Whole original protected Appearance file, full block, function and surrounding probes remain independently bound in §4. Full canonical Clock r2 contract152,183 bytes /214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae remains in inputs and TASK's complete embedded canonical copy; Appendix C preserves Required evidence/E24/Rules verbatim.

The complete original111 TASK cases, kind/variant/oracle/command/before-failure mappings and4440 historical paths remain, with112 active cases/5072 paths/64 visual tuples/59 controls. MET retains original89 rows/2437 obligations/2497 closure entries, all M1–M9 and G1–G9/E1–E9. Appendix A/B give exact case/row/control identities; complete path/command/data objects are normative through the bound original manifests, not narrowed to the printed columns. All declared artifact obligations need exact emitters, including original MET39 legacy controls.

The P0→R apps/packages delta is exactly four accepted TT08 owning docs: packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md. Executable product parity is separate from whole-tree equality; no runtime path differs. Original312 ordered TODO fields are preserved through TODO.sections[].tasks; EXECUTION uses top-level items. Scope projection keeps original_module for39 reversible labels: web（project-system）30 and web（跨模块验证索引）9, alongside original web174/sync41/app22/plugin16/admin16/site4; routed web213 adds no owner. Current EXECUTION retains939 evidence references; scope-map's historical snapshot has933, with later evidence retained in the current ledger rather than overwritten. Formal13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed remains unchanged. TASK-06 and MET-05 are separately owned workflow-C items; the shared prerequisite is not another audit item or shared acceptance.

## 2. Five-row disposition and exact next prerequisites

| Row | Carried reviewed technical basis | Binding scope and current disposition |
| --- | --- | --- |
| P-HOST | APPROVED technical basis only by review1 | Complete public AppProviders/Router, managed non-null config, real main startup/SDK/local HTTP schemas/auxiliary deletion-device-Todo bridges; §3.1 and I1 capture prerequisites. No mock/private context/config=null substitute. Still unqualified. |
| P-ACT | APPROVED qualification-only seam with production hold | Existing public setCanonicalCommandActivationForTests only in disposable qualification; actual lock request retained through transition. Production canonical gate stays closed; no production queued-writer claim. |
| P-LEDGER | Review1 REVISE I1; replacement proposed here | Complete §3.3–3.4 synchronous-acquisition-v1, immutable detached values, forwarding/restoration/native-event/source/config closure, actual14 pairs. Requires fresh full impact-review2; no self-approval. |
| P-FOCUS | APPROVED named successor technical basis only | native-focus-context-v1 with authentic Appearance calibration, target revalidation, unchanged predicates/full environment, native Retina/menu200 and complete captures. Unimplemented/unqualified/unadopted. |
| P-OUTER | APPROVED enclosing supervisor/representation basis only | Root pre-reserved envelope and one supervisor from bootstrap through real-stream/descendant/write quiescence, exact finite emitters/source closure. Root machinery must be named/hash-bound; no local claim creates authority. |

All five rows are reviewed together again. This report does not upgrade review1's four limited approvals to blanket method adoption. Fresh independent full impact-review2 → exact root adoption → amended exact TASK12/MET16 source cards, including normative acquisition source/config gates, precede either final source-author3. A source author must receive immutable consumed ReactDOM/SDK source material sufficient to close the forwarding and API table, and root must identify its existing outer capture machinery. Missing inputs mean hold, not a final intentionally incomplete skeleton or undocumented runtime parameter. Concrete collector implementation hashes are generated by source3, then independently reviewed and qualified before any execution. No protected product/interface/method change is proposed. If no viable path fits the remaining approved scope, freeze all shared-method dependents while other flows continue; no author4, budget reset, owner waiver or weakened acceptance.

Shared impact-author3/3 is final. Impact-review1 remains REVISE; future full review2 is independent. Both caller source-author2/3 and source-review2/3 remain consumed and final3 held; MET author2 failed static remains FAILED1/1. Unlaunched TASK-only impact0 does not confer capacity. M8 lifetime unknown (known lower bound2), Clock retention3/3, Clock visual3/3 and REL02+REL03 V1 unknown remain local holds; no new label/actor/method/source/worktree resets any actual unit.

## 3. Actual host, source identity, transitions and queued effects

### 3.1 Public managed fixture is source-feasible

P0 apps/web/src/providers/AppProviders.tsx resolves VITE_WEB_AUTH_MODE live plus nonempty URL/anonKey, mounts WebAuthSessionProvider with non-null config, AccountDeletionRecoveryBridge, DeviceSessionBridge with real REST transport, and TodoWebRuntimeBridge. P0 packages/web-auth-device-session/src/session.tsx chooses ManagedAuthSessionProvider exactly when config is non-null; its coordinator owns bootstrap/persistence. Use these archived exports unchanged.

Implement fixture prelude before any product module evaluation. Install bounded passive recorders and source-bound disposable seed bytes first, then dynamically import product startup/host modules. Mount StrictMode/AppProviders/real RouterProvider in main.tsx order, with only the disclosed passive observer/React Profiler wrapper added. Call actual registerServiceWorker() then bootstrapObservability() before render. Keep original DEV unregister/cache-delete behavior, observability transport/controller and asynchronous web-vitals import; record their real work and errors. Do not replace startup with ready=true or omit effects because credentials are local. A separate untouched-main startup control proves import/order/effect correspondence; observer controls prove instrumentation does not alter observed storage or routing.

Use createAuthGenerationStore public candidate/session/publish APIs for initial auth lease; preseed separate A/B business-generation markers and valid canonical data using exported key helpers. Auth generation and business storage generation are different identities and both must be recorded, not compared as if they were one field. Device preferences lang/theme/density/features_tasks resolve to unscoped device keys; compute actual physical keys outside spies from the public ownership/scope API and verify UI/config after mount. Never put them under account:g1 by convention. Keep all other account/demo/generation sentinels immutable.

Local HTTP service is a declared remote-system substitute, not a replacement SDK/provider. Its source-bound endpoint table includes method/path/query/body/headers and exact response schema: auth password/refresh/user/logout if actually invoked; device_register/device_heartbeat with Authorization, X-Device-Id, X-Sync-Version and device_id body; optional Todo nonce lease only for a declared crypto fixture, with exact encryption_device_id/lease_start/lease_end types. Undeclared calls fail and are retained. Tokens are disposable local-only values accepted solely by this service; no external production request is possible. Qualify real SDK valid/expired/wrong-owner/malformed-session and actual device success/401 unknown_device/403 device_revoked paths, including stale A response after B. A missing endpoint or swallowed bridge error is not readiness.

Observe AccountDeletionRecoveryBridge's real presence and managed cleanup callback through a separately scoped disposable recovery scenario; do not seed a deletion in every business run. Observe Todo globals/event emissions and cleanup on lock/owner change, and nonce work if declared. This does not grant full deletion/Todo acceptance. StrictMode's real duplicate startup/effect attempts remain in the ledger; do not normalize them away to force exactly-once business counts.

### 3.2 Production activation remains a real external condition

At P0 packages/plugin-web-storage/src/internal/canonicalCommandState.ts:41, commandActivation is false; mutateCanonicalDataset and commitCanonicalCommand return activation-disabled before acquiring locks. The setter and isCanonicalCommandActivationEnabled are public exports in src/index.ts:65–66. Existing Tasks vitest.setup.ts and storage tests use the setter explicitly. There is no production AppProviders/main activation call in the traced source.

Therefore a held canonical lock plus a click is insufficient: a gate-off product run may queue **nothing**. Record real gate state before the action. Do not enable it in an unchanged-P0 production run, reinterpret gate-off as successful recovery, or use a test-seam result to certify shipping completion. P-ACT grants only an independently qualified acquisition control using existing test API. Required production TASK mutation rows remain blocked pending the existing activation dependency, unless an independently reviewed contract explicitly admits that exact qualified test environment with its limitation; this report makes no such substitution.

In an admitted activation-capable fixture, acquire the exact public canonicalDatasetLockName for captured scope A. Before trusted product action, instrument real navigator.locks.request transparently: unique operation ID, lock name/mode, request time, requesting scope/auth identities, callback-entry, promise settlement/rejection; delegate once with original this/options/callback result. Do not alter queue ordering or substitute a lock. Capture navigator.locks.query held/pending data as corroboration. Require actual product-origin request pending behind the held lock, not merely a fixture-owned lock or changed button state. Then transition via the public coordinator, await actual revocation/ready B, release the held lock, and join that exact callback/promise.

Expected outcome is rejection/no inappropriate commit by the captured A operation, with all physical writes/removes, bus updates, draft/count/export/download publications and revision/receipt changes linked to its ID. Check nonempty B target census and exact sentinel bytes. A stale detached coordinate click is not proof of invoking a stale closure; the retained in-flight real operation supplies the causal stale actor. Fault paired controls must show one deliberately invalid stale publication is caught by the acquiring ledger, not a forged result object. Missing pending request is a precondition failure. If native LockManager cannot be transparently observed in the admitted browser, refusal is a measurement prerequisite, never an assumed queue.

### 3.3 I1 correction: synchronous-acquisition-v1 (normative proposed contract)

This section replaces impact1 §3.3 in full. It is independently designed here; author2's unwritten fourteen-control idea is reference only and supplies neither accepted method nor source. Profiler, MutationObserver and rAF alone do not detect a property-only value written and restored before their callbacks. A generic CAPTURE_INCOMPLETE rule cannot detect an event never acquired. The solution is a bounded pre-import native-operation recorder plus native-event capture, backed by a mandatory closed source/configuration contract and actual causal qualification. This is measurement-fixture code in the TASK/MET r3 files, never protected product instrumentation.

**Observable domain and truth categories.** Cover the real document and every same-document portal, connected and detached nodes allocated during the unit, from before the first product/framework import to terminal drain. Record all raw operations, including construction of detached trees; mark connection history so a never-inserted speculative tree is not falsely called displayed. A synchronous property record is a property operation; DOM boundary records are mutations; a public Profiler observation is a React commit boundary; rAF is pre-paint state, and a PNG is capture evidence. No one of these is labelled a painted intermediate frame. An invalid transient connected property/content publication is still an I1 failure even when corrected before paint. Detached invalid content fails the detached-history control with its correct category; a discarded uninserted React tree is not a product-visible failure. All raw history survives either way.

**Finite source-grounded property surface.** P0 Tasks TaskComposer uses controlled title/date, a native checkbox, select/list/priority and option nodes; TasksModule uses uncontrolled defaultValue selects, controlled edit inputs/checkboxes/selects/textarea and color input; TaskCard uses a native selection checkbox. P0 MetricTrackerModule uses controlled profile/value/date/time inputs and note textarea; its metric/range/unit controls are buttons with attributes, not select substitutes. Thus configuration must include HTMLInputElement value/defaultValue/checked/defaultChecked/indeterminate/type/name, HTMLTextAreaElement value/defaultValue, HTMLSelectElement value/selectedIndex/multiple/size/length, HTMLOptionElement selected/defaultSelected/value/text and the option collection operations actually consumed. Record native getter values including valueAsNumber/valueAsDate through immutable number/date-string snapshots when used; their setters, stepUp/stepDown and setRangeText are declared alternative acquisition paths, not assumed equivalent to value setter invocation. Input/textarea selectionStart/selectionEnd/selectionDirection and setSelectionRange/select are included for real editing/keyboard correspondence. Snapshot dependent groups: all same-owner radio controls on checked/type/name changes; all options plus select value/index on any select/option mutation; form fields on reset. Native side effects do not necessarily reenter JS setters. A CSS/attribute or tree change can likewise affect source-visible content without assigning value.

**DOM-boundary surface.** Install forwarding wrappers on native Node appendChild/insertBefore/removeChild/replaceChild and nodeValue/textContent; Element innerHTML/outerHTML, set/remove/toggleAttribute, namespace and Attr variants, insertAdjacentElement/HTML/Text; actual ParentNode append/prepend/replaceChildren and ChildNode before/after/replaceWith/remove implementations on Element, Document, DocumentFragment and CharacterData; CharacterData data/appendData/deleteData/insertData/replaceData and Text splitText; Document createElement/createElementNS/createTextNode/createDocumentFragment/importNode/adoptNode and Node cloneNode. Text/Attr value setters and reflected id/className/hidden/inert/disabled/open/tabIndex are part of the descriptor table. classList methods and CSSStyleDeclaration setProperty/removeProperty/cssText plus the writable native style-property descriptors in the admitted browser census cover actual direct style assignments. DOMTokenList value is included. HTMLFormElement reset, select add/remove and HTMLOptionsCollection add/remove/length are explicit operations. Each actual export/descriptor owner and alias must resolve once in the configuration; unsupported reachable indexed option assignment, Range/editor/document.write/custom-element/reaction or other API path cannot be waved through by a catch-all. Either the complete immutable consumed source proves that path unreachable for the finite configuration or it needs an independently admitted exact method extension before execution. No source-only finding here claims every possible Web API is intercepted.

Use before and after snapshots around each operation, including its arguments' subtrees, prior parent/siblings, destination tree, affected selection/radio/form group and the connected module/gate roots. Before remove/replace/textContent/innerHTML clears children, synchronously serialize their entire covered subtree. After insertion synchronously serialize inserted descendants; DocumentFragment children must be saved before native consumption empties the fragment. New, cloned and parsed descendants are inventoried before returning to product code. Detached nodes remain covered by prototype accessors; keep ID and immutable scalar snapshot history through final drain, not just a removedNodes reference. Removal followed by value assignment and restoration before observer delivery yields distinct removal and detached-property records with stable IDs. Reinsertions keep the same ID and new attachment episode. Old record bytes never dereference current DOM.

**Exact transparent forwarding.** Prelude is first executable main-world script, before React/ReactDOM, SDK, product, route modules, service-worker startup and other page scripts. Resolve descriptors with captured native Reflect.getOwnPropertyDescriptor/Object.getPrototypeOf, recording actual owner, accessor versus data kind, configurability/enumerability/writability and initial getter/setter function identity in the realm. Preserve every flag. The public getter delegates the original getter exactly once with the original receiver and result/throw; it performs no coercion or added product getter call. The setter/method delegates exactly once with original receiver and uncoerced arguments, returns the identical result (including original promise identity) or rethrows the identical exception object. Do not stringify caller objects before delegation; user conversion may execute product code. Pre/post snapshots use only captured native getters on brand-checked native objects, primitive property values, native traversal and copied public state; they never invoke user accessors. Nonprimitive arguments are represented by opaque identity until the native operation supplies observable primitives. Failed native operations have attempt and throw records, not invented successful mutations.

Collector failures set a sticky out-of-band acquisition failure and preserve the native call's original return/throw. They do not replace the product result with a collector error, dispatch events, focus nodes, schedule product work, change CSS, normalize values or repair an illegal sample. An append failure/overflow reserves a terminal failure slot and stops driver actions at the next control boundary while the enclosing supervisor retains the failure. A record-limit overflow is fatal completeness loss; the reserved sequence/fault counter cannot be overwritten. Nested calls caused by native argument conversion retain parent/child sequence IDs and both entry/exit order. Only collector-internal native reads are excluded by a private depth guard; reentrant product setter calls must still record. No broad global 'busy' guard may silently skip nested application mutations.

**Own descriptors, inheritance and restoration.** Prototype wrappers are installed before any framework caches the descriptor. React's own input tracker may read the wrapped prototype get/set and define an own forwarding descriptor; ordinary property writes then pass through that tracker to the preinstalled native wrapper. Do not replace React's tracker, its data or its return semantics. Source qualification must prove the exact consumed ReactDOM implementation's defineProperty/getOwnPropertyDescriptor forwarding and delete/untrack paths. The lockfile identifies React/ReactDOM 19.2.0, but the package bytes are absent in this worktree; their immutable actual source digest and this forwarding proof are mandatory missing-source prerequisites, not inferred from the version. Observe Object.defineProperty/Object.defineProperties/Reflect.defineProperty/Object.setPrototypeOf/Reflect.setPrototypeOf and legacy accessor-defining entrypoints transparently (all other calls delegate unchanged) for covered nodes/prototypes; record before/after own descriptor classification. Allow only the source-identified forwarding tracker; any own data property/nonforwarding accessor or unknown prototype change immediately marks DESCRIPTOR_PATH_UNSUPPORTED. A known tracker deletion exposes the still-wrapped native prototype. No generic claim that JS delete can be intercepted: source closure must rule out any bypass interval, pre-cached unwrapped native setter, foreign-realm setter or eval-created writer that could defeat coverage. Whole consumed code closure plus prelude ordering is the preventive gate, not a late descriptor poll pretending to prove past completeness.

At installation unsupported/nonconfigurable required descriptors cause DESCRIPTOR_ENVIRONMENT_UNSUPPORTED before product imports. During teardown first fence actions, settle/unmount the real host, join all attributable operations and drain the ledger; then restore each descriptor only if the current descriptor is exactly the installed wrapper or admitted forwarding layer state. Keep original flags, owners and absence of own property. Unexpected descriptor ownership means DESCRIPTOR_RESTORE_CONFLICT and quarantined incomplete teardown; never overwrite another layer blindly. Dispose the isolated document/context after restoration receipt. Per-instance framework descriptors disappear through genuine unmount/untrack or document disposal; the collector does not delete arbitrary product properties. Positive and negative controls must independently verify native result/throw/receiver semantics and unchanged final storage/routing/events with instrumented versus untouched-main documents.

**Native edits before React handlers.** Install capture-phase listeners on window before imports for beforeinput/input/change/click/reset/keydown/keyup/compositionstart/compositionupdate/compositionend/focusin/focusout, plus trusted pointer event audit. Window capture runs before root-delegated React handlers. Snapshot native scalar values, checked/selected peers, event target/composed path IDs, isTrusted, inputType/data/selection, original defaultPrevented and active element; do not prevent, stop or redispatch. beforeinput gives pre-edit state, input gives browser-applied edit before React can restore controlled value, change covers committed select edits, click captures checkbox/radio preactivation and reset has native operation pre/post plus event markers. Native input state and React restoration are distinct ordered records even if no value attribute mutation and no observer callback occurs between them. After-default microtask/commit/pre-paint samples supplement but do not replace event capture. Browser default actions that produce no such observable boundary (including unsupported autofill/accessibility edits) require explicit native capability qualification or are refused for that configuration. A native default's internal atomic states without any script-observable event are not labelled observable React commits. Required trusted typing, checkbox, select and reset/default paths are implemented, not blanket-refused.

**Immutable ledger and source identity.** Each append is a plain copied record: protocol/config/source hashes; monotonic seq and operation parent; document nonce, CDP loader and realm; transition/action/phase IDs; connection episode and stable node ID; typed before/after native property values, subtree text/attributes, selection/peers; public auth owner/generation/status and account scope kind/account/generation/epoch; current source key/raw digest and operation cause. Copy Date as a scalar, never mutable objects/DOM/Event/session references. Freeze record and hash-chain serialized bytes before yielding, flush finite chunks to the supervisor with acknowledgements; a bounded unacknowledged tail is retained until joined. source-to-node attribution derives from fixed public product source and nonempty fixture sentinels, not injected owner DOM attributes. A callback sampled late may have a new owner; store the earlier primitive snapshot at acquisition, never recompute it during export. Coordinator/accountScope publishes delimit transitions; unknown initial auth state is recorded as unknown and evaluated against actual gate state, not rewritten as final authenticated state. Subscribe directly when the public coordinator exists and record its initial snapshot plus subscription epoch; before that, raw DOM/property/public-scope acquisition is already active. Any required interval without a causally bound identity blocks that row.

Retain MutationObserver with oldValue/takeRecords as a cross-check, not property acquisition. Correlate child/attribute/text records to synchronous operations and native event/default paths; a mutation outside the closed table produces UNATTRIBUTED_MUTATION. Profiler and pre-paint records remain additional categories. No filtering by final owner/epoch. Validate the entire A→locked→B→A interval, then select its final ready snapshot. Same-node wrong text/property, wrong epoch corrected by remount and locked publication remain failures. Reload waits for non-null new document and new loader plus readiness bound to that exact pair, allowing only expected context destruction; null != old is not ready. All pending fetch/lock/action/promise and declared timer causes must settle or be explicitly bounded recurring device work. A quiet period alone does not prove no effects.

**Mandatory registration and code allocation.** The normative protocol is this exact section and §3.4, hash-bound by the adopted report. Both caller execution-manifest.json files must embed an acquisitionContract with schema synchronous-acquisition-v1, original product SHA, report/review/adoption digests, exact collector export paths and digests, complete property/method/descriptor-owner table, native event table/order, source-path-to-boundary closure, scope/fixture IDs, finite record/node/byte limits, stream/chunk/terminal allocations, supported realm/frame policy and fourteen control IDs. TASK host-fixture.tsx/fixture.tsx own prelude/host composition, driver.mjs owns acquisition serialization/admission; MET fixture.tsx owns prelude/composition, host-adapter.mjs owns transport/capture, driver.mjs owns validation. Qualification/manifest files own control/emitter receipts. No extra shared implementation file, protected product edit, framework monkey patch source edit or original method overwrite.

Before either final source-author3, root's amended card must require the exact protocol/configuration schema and all missing-source gates; every promised collector/control must be authored in its finite allowed set. It must also identify an immutable read-only ReactDOM/SDK/browser-support source closure available for the source author to inspect. No dependencies are installed/read from another worktree here. The concrete future collector hashes necessarily arise from author3, then must be checked by source-review3 and the later qualifier before execution. This is not permission to choose an undocumented runtime knob: omitted table fields, missing consumed code digest/forwarding proof, prelude after an import, unknown realm/API/config, invalid method adoption or unavailable source all refuse with ACQUISITION_SOURCE_MISSING / ACQUISITION_CONFIG_MISMATCH / PRELUDE_ORDER_INVALID before action. Future execution also requires actual descriptor/native-event capability receipts; no declaration can stand in for qualification. If these finite source prerequisites cannot be supplied before the last author slot, hold both method dependents; there is no author4 and no protected interface grant.

### 3.4 Fourteen actual acquisition pairs (finite, normative; all UNRUN)

All fourteen are additions to, not substitutes for, all TASK Q01–Q59, all MET33 and the original bad-expected-hash control. Each side uses the exact collector/browser/host path above in isolated qualification specimens. Each record binds control ID, fault ID, source/config, injected cause and counter, actual invalid value, exact oracle code, raw ordered evidence and independent cleanup/terminal result. Negative success means the intended cause was acquired and rejected; generic nonzero, timeout, mutated report or unrelated teardown failure fails qualification. All product before/fixed fixtures remain free of these induced mutations.

| ID | Positive actual path | Negative actual cause and exact required boundary | Required retained evidence |
| --- | --- | --- | --- |
| A01 | Correct same-node input write/restore, no attribute writes | Wrong-owner value then restored value in one task before any callback; PROPERTY_OWNER_VIOLATION | Both native post-set values and sequence, unchanged node ID/attributes; no observer dependency |
| A02 | Remove correct subtree, mutate permitted detached field, reinsert | Remove subtree, wrong detached value then restore before observer delivery; DETACHED_HISTORY_VIOLATION | Removal pre-snapshot, two immutable detached values, attachment episodes and later observer records |
| A03 | Correct unchanged node and repeated same value | Same node wrong text/attribute then correction; CONTENT_OWNER_VIOLATION | Native text/attribute boundaries, stable node ID, original and corrected bytes |
| A04 | Trusted typing in real React-controlled input/textarea | Browser edit supplies forbidden sentinel then React immediately restores; NATIVE_EDIT_OWNER_VIOLATION | beforeinput/input capture before React restoration, isTrusted, setter ledger and actual final value |
| A05 | Trusted checkbox/radio/select change and form reset | Invalid checked/selected peer state followed by correction; SELECTION_OWNER_VIOLATION | Whole peer group snapshots, default-action event order, option selection, reset result |
| A06 | All initial installed and React-own forwarding descriptors match admitted table | Define own nonforwarding value accessor/data property or altered native owner; DESCRIPTOR_PATH_UNSUPPORTED | Real defineProperty/prototype boundary, before/after descriptor IDs and refusal before further evidence actions |
| A07 | Correct nested native write during real argument conversion | Nested wrong value corrected by outer call; REENTRANT_PROPERTY_VIOLATION | Parent/child sequence, one native delegation per call, unchanged coercion count/return/throw |
| A08 | Within configured finite ledger/node/chunk bounds | Actual append overflow/lost acknowledgement/acquisition exception; CAPTURE_LIMIT or CAPTURE_CHANNEL_LOSS | Reserved sticky fault slot, exact missing interval, supervisor raw tail and incomplete disposition |
| A09 | Gate-correct A→locked→B with correct epoch | Publish wrong epoch subtree then correct remount; EPOCH_PUBLICATION_VIOLATION | All public-scope marks, insertion snapshots and original incorrect epoch; no final-epoch filtering |
| A10 | Locked state contains no protected module | Insert protected module while locked then remove in same task; LOCKED_PUBLICATION_VIOLATION | Actual insertion/removal boundary snapshots with locked identity, without claiming paint |
| A11 | A→B→A with distinct generation/transition IDs | Late A operation publishes A content into B before returning to A; STALE_PUBLICATION_VIOLATION | Actual retained operation and every transition publication, unchanged independent B sentinel census |
| A12 | Real reload with delayed initialization eventually matches new non-null document/loader/ready | Unchanged document or wrong-loader old ready marker; RELOAD_IDENTITY_MISMATCH | CDP navigation/loader, prelude nonce, ready sequence and finite deadline; expected context loss logged |
| A13 | Whole AppProviders + main startup instrumented versus untouched correspondence | Actual import executes before prelude or selected unaccounted frame/source path; PRELUDE_ORDER_INVALID or ACQUISITION_SOURCE_MISSING | Consumed module/transform order, script/realm source inventory, native descriptor receipt and matched product effects |
| A14 | Drain, unmount, restoration and immutable sealed terminal with no live writer | Actual descriptor owner replaced at teardown or delayed writer after deadline; DESCRIPTOR_RESTORE_CONFLICT or QUARANTINED_UNJOINED | Original/current descriptor census, all child/stream/write joins, independent cleanup verdict; no immutable claim on quarantine |

A01/A02 must run independently for value, checked and selected paths wherever the actual source uses them; named subcases are finite expansions of the property table. A04 uses real trusted input/default actions and the unchanged real React control, not dispatchEvent pretending to be a browser. A07 covers wrong receiver/native throw unchanged plus conversion reentrancy. A05 covers programmatic native reset and real default-event path. Unknown/unsupported surfaces fail configuration closure before admitting business evidence; generic posthoc refusal cannot close a silent missed write. Separate untouched-main correspondence controls preserve storage keys, route/event sequences, SDK calls and actual source mount behavior, retaining StrictMode duplicate attempts. Descriptor/script identity inspection is disclosed instrumentation; it does not claim the function identities are invisible to reflection.

## 4. Frozen focus environment, exact successor and native zoom

### 4.1 Preserved originals and chosen method

Protected source at bacdbbc17d395e320cd100234aa5738cdbae3414:
- docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs whole file 5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4;
- complete decoder/helper/selftest/walk block e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43;
- pixelFocusWalk function 1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620;
- native-visual-keyboard-probes.js 4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4.

A bare transfer of pixelSelfTested from an Appearance page is rejected: it neither checks the target coordinate mapping nor fixes noninjective descriptors or native raster scale. A fake hue rectangle, DOM/CSS gradient injection, pixelSelfTested=true assignment, source substitution, tolerated outside failures or modified original function is forbidden.

Choose **native-focus-context-v1**, an explicitly versioned equally strong successor under P-FOCUS, with protected originals embedded/read as reference and separately hashed. At unit raster scale and the original Appearance context, require exact per-stop predicate parity, decoder/crop byte equality and unchanged failure classification with the original. At native Retina/real zoom, use only the explicit coordinate substitution below. This is source-feasible in the existing proposed r3 adapter files but is not qualified or adopted now.

### 4.2 Authentic calibration transfer, limited to what it proves

Create a disposable document of **actual archived Appearance**, with its real hue slider and exact original tokens/styles/probes, on a separately reserved local origin/storage partition. Do not mount Appearance inside Tasks/Metrics, alter their tab order or transfer persisted Appearance preferences. Same owned Chrome build, display, real zoom and renderer configuration; bind calibration document/loader, context, source/CSS/font hashes, viewport/DPR/visualViewport, capture parameters and browser/window/tab identity.

At the calibration document run the original full selftests wherever their unit-raster precondition actually holds. For non-unit mapping run the successor's same substantive assertions: genuine hue region found/in view, >8 distinct RGBA colors; own PNG decode identical to browser decode; clipped page-coordinate capture identical to correctly mapped full-viewport crop; when real window scroll occurs, viewport-coordinate negative must differ. Retain both PNGs, full screenshot, decoded hashes, geometry, scroll, naive negative and all preconditions. Genuine unscrollable state is labelled unexercised exactly as the original conditional rule, never falsely recorded as a scrolled negative. A separately admitted naturally scrollable authentic Appearance configuration supplies a real scrolled-coordinate control; failure to obtain it leaves that qualification coverage blocked.

The certificate transfers only decoder/capture-API and scale-calibration evidence. Target document must independently revalidate full screenshot dimensions, raster mapping, browser decoding and aligned full-vs-clip crops on actual target content, at its actual page/nested scroll offsets and after every reload/resize/menu zoom/display change. A stable target feature region must make a deliberately wrong-coordinate comparison discriminating; if not, choose another genuine visible region from a predeclared finite census or fail calibration. Do not invent a hue control or introduce a selftest exemption in the target. Fonts, finite animation settle, hover and target capture stability remain per target/per stop. Stale certificate/source/build/origin/context/zoom/geometry rejects before the walk.

### 4.3 Raster/CSS mapping with original predicates

CDP scale:1 is not proof of raster scale1. Derive sx = decoded full PNG width / captured CSS viewport width and sy likewise, corroborated with actual DPR, layout/visualViewport metrics, clip PNG dimensions and the full-vs-clip byte test. Record affine origin including pageOffset/visualViewport offset and raster rounding; refuse anisotropic/unexplained/nonstable mapping. Native DPR must be measured, not overridden to1. Retain raw PNGs, no resampling to manufacture parity.

For each raster pixel center in a clip, inverse-map its center into the original clip-relative CSS coordinates: X=(x+0.5)/sx, Y=(y+0.5)/sy, with the calibrated clip origin. Use the **unchanged** signed max-distance classification, original outline offset-2 to offset+width+2 band, next-stop exclusion pad3 when the next outline style is none, otherwise max(0,offset)+width+3, own band-plus-interior union, and exact RGBA difference. Only coordinates change domains. Keep raster counts and optional CSS-area-normalized descriptive counts separately; acceptance remains sameSize, ownPixels>0, outline.style != none and ownDiff>0. bandRatio<0.15 remains the original weak-signal manual-review observation, not a new pass threshold or waiver. At scale1 the coordinate expression is exactly original x+0.5/y+0.5. Any differing scale1 predicate is a method defect.

Original alignment <0.01 CSS px, identical clip/scroll/hover and stable frames remain. Original stable capture is at most6 captures separated120ms until two consecutive byte-identical frames. Original settle awaits fonts then at most120 double-rAF iterations for running finite animations; unknown timing is finite, only true Infinity is excluded. Failure is retained, not cured with longer unbounded delays or looser tolerances. Mapping qualification pairs include actual Retina100, genuine200, scrolled clips, wrong DPR/origin, stale postzoom certificate, adjacent-only focus ring, selection-ring-only, clipped own region and unstable animation. Cause-specific real captures must fail the intended boundary; supplied RGBA objects alone are only unit arithmetic checks.

### 4.4 Full environment and injective descriptors

Retain original whole-document tabbable selector: a[href], area[href], button, input:not([type=hidden]), select, textarea, iframe, summary, [tabindex], [contenteditable=""], [contenteditable=true]; original disabled/inert/tabIndex/visible filtering. Preserve rail/topbar/sidebar/filter/footer/dialog/pet/outside stops. No Metrics-only census. Unsupported reachable iframe/shadow behavior must fail explicit coverage; never silently drop it.

Descriptor schema is versioned per document/census with a bijection to actual nodes: region + semantic source role + stable field/control ID + structural occurrence only when necessary. Metrics profile inputs bind their real enclosing label/field, unit buttons bind field+unit, repeated Log/Close controls bind the real region/dialog generation. Tasks use actual source task/list/tag IDs plus action; shell/rail use accessible name and real region. Record source-selector rationale, AX identity/name/description, DOM path/node ID and multiplicity. Assert injectivity before traversal and after every structure-changing action; unknown/duplicate nodes fail. Do not rely on other:button, tagName alone, text truncated to30 or position alone. Full census is computed independently from traversal, so a repeat descriptor cannot falsely close a cycle.

Nonfocusable anchor is an actual existing heading/plain region with no tabindex or focusable ancestor/target, not the whole module rectangle. Verify actual center elementFromPoint hit and absence of interactive descendants at the click point; trusted pointer click establishes body/non-control focus. No .focus(), injected tabindex/inert/style or forced window focus. Park mouse at a measured nonoverlapping location and verify hover equivalence. If no legitimate anchor exists, retain precondition failure and request exact method scope, not synthetic anchor DOM.

Run full forward and reverse trusted cycles with finite140 bound and exact expected membership/order, at most the original single body crossing. Capture **every** reached stop focused and moved-on, not only failures; flush partial successes/failures even if the walk aborts. Record disabled planned/destination nonmembership and no-effect proofs. Preserve own-region visibility, original clipping/overflow ancestors, 5-point hit tests, all full-shell target geometry and actual AX; text/contrast parsers must be qualified in their emitted browser script form. Deferred failures are sticky and included in final outcome even after later success.

MET retains eight M5 rows, Weight Enter/Space retain selected view, Log Enter and Space each open exactly once, real Close between trials, full keydown/up/isTrusted audit and no nativeVirtualKeyCode. TASK smart Enter, neighboring controls and completion remain actual once-only effects, not merely unchanged final selected state. Action causes/history/bus/modal lifecycle are logged so transient opens/navigations/writes cannot disappear by returning to the starting state. Independent visual judgment still reviews readability/selection and weak-ring captures; no static visual PASS.

### 4.5 Genuine Chrome menu zoom and mobile dialog

TASK preserves factor zoom1/2 in all64 IDs; convert exactly to100/200 at the native-menu boundary. Begin each tuple at measured Actual Size on a real Retina display, establish nominal CSS viewport there using actual browser-window resize, then apply genuine Chrome View-menu200. Record resulting effective CSS viewport rather than forcing it back via emulation. No device emulation, pinch scale, CSS zoom or guessed DPR.

Bind owned browser executable hash/PID/start identity, OS process, window ID/bounds, active native tab URL/title and CDP target/browser-context/session/loader. Bundle ID alone is insufficient. Before and after menu operation require the same foreground owned process/window and tab, with passive document hasFocus/visibility plus CDP identity. Native menu helper is an owned child with real streams/deadline. Refuse ambiguity, lost foreground or unsupported UI access; never operate another user's Chrome or force focus. Confirm actual menu state/zoom factor and DPR ratio/effective viewport; invalidate calibration and rerun per-document mapping after any change. Restore actual size only through the same menu with measured result.

At widths where Tasks sidebar is genuinely hidden, do not claim its rows visible or click New list. P0 TasksModule.tsx:475–478 exposes a visible New task header action; actual TaskComposer uses native dialog. Use this visible route for the required mobile dialog/Tab evidence after hit/AX/visibility precondition, close with its existing product control. Desktop metadata dialog through New list remains separately retained; the mobile compositor does not substitute for a required metadata-row assertion. If New task is clipped/unreachable at an effective zoom, retain the real failure, do not show hidden sidebar or call a handler. Record exact dialog kind and per-width applicable census; no dead mobile destination surrogate. T06-8's general dialog requirement is retained, while source2's hidden-sidebar selector error is removed.

## 5. One enclosing supervisor, typed root authority and complete dependency closure

Use one lifecycle contract across both callers, instantiated per root reservation; no worker acquires global controller receipt or edits permanent history. TASK run-unit.mjs hosts its bootstrap/worker/serve modes; MET root-supervisor.mjs encloses launch.mjs and driver. All bootstrap imports before admission are pinned Node builtins; candidate/source/config dynamic import follows envelope creation and validation.

Root serial transaction resolves immutable registration/card/sourceReview/impactAdoption/qualificationReview/adoption/actor-history/permanent-family/resource records. It consumes or records refusal under the existing scheduler semantics **before dispatch**, producing a once-only reservation tied to exact input/output paths and actor. A local wx claim supplements but never replaces global anti-replay. Exact role graph includes preparation author/reviewer, source authors1/2/3 and reviewers1/2/3, impact author/reviewer, qualifier/qualification reviewer, before author, builder, candidate/integrated verifier, actual vendor and fresh acceptance actor; enforce required separations against complete immutable records, not one matching actor row. APPROVED and ADOPTED must both be consistent and bind exact hashes/task/stage/row/environment; a hash-shaped ledger string or contradictory statuses fails.

Map actual invoked units/suite members to all inherited families; full host/storage/auth commands inherit covered REL history, visual/full-focus work inherits applicable Clock histories. Qualifier/bootstrap purpose is distinct from business purpose but not a budget reset. Current unknown/exhausted families refuse regardless of a synthetic positive admission test. Root alone may publish source-grounded history reconciliation; tests cannot mint live ledger authority.

Root reserves an outer dispatch envelope with exact no-clobber stdout/stderr/emergency-return/artifact paths before parsing the inner task card. It opens actual raw stream capture for the supervisor, so malformed JSON, source syntax/import error, missing cwd or inner wx failure still has a durable parent-owned record. Existing root launch/capture machinery must be named/hash-bound in the later card; absent enclosing capture is a prelaunch refusal. Supervisor creates its own inner capture before importing launch/driver. Bound canonical realpaths, path component/symlink checks, tool paths and every directory/file; refuse '..', aliases, existing files and undeclared outerRoot. No inference from five generic basenames.

The root envelope is the outermost auditable boundary: if its initial storage allocation fails before any process starts, root records refusal in its already-owned permanent receipt and launches nothing. If the filesystem cannot retain any final bytes, report capture failure through root's existing channel and keep outcome UNKNOWN/BLOCKED; no software promise of impossible durable success.

One monotonic total deadline covers preimport, archive, dependency snapshot, config/Vite setup, navigation, calibration, business, artifact write, cancellation and finalization, with explicitly allocated phase slices and reserved teardown time. Do not run a120s archive under a case+90s wrapper accidentally. Preserve original case limits and original approved total budgets; any total-budget change needs explicit later card review. Synchronous copies execute in a supervised worker, so the supervisor can still cancel. Register every child/task/stream/write before starting it. Use one inherited process group wherever possible; every unavoidable detached descendant requires supervisor-owned PID/group/start identity registration and acknowledgement **before allocation/work**. No lost detached Chrome/tar/osascript on driver death.

Children have typed lifetime: archive/build one-shot exit0 is normal after completion; server/browser early exit0 before expected-stop intent is failure. Keep captures until both process exit and every stdout/stderr/CDP descriptor reaches EOF/close or retained-descriptor timeout. Fencing refuses new work; cancel pending operations; TERM then KILL owned groups with finite joins; inspect late descendants; independent cleanup continues after one failure. Do not declare directory immutable while any writer/task/descriptor is unjoined.

Artifact writers are owned operations through actual write/fsync/close, not just checked before await. Preterminal receipt is mutable append-only evidence while work drains. Seal only after work and streams joined, runtime/parser/idle/late errors collected, journals flushed/closed, artifact set reconciled and final writer completed. Supervisor then writes its terminal receipt plus hash index; root captures supervisor exit/streams and adopts only after supervisor itself is quiescent. A worker killed/unjoined leaves QUARANTINED_UNJOINED with raw partial inventory and explicit unresolved handles, never immutable terminal-complete. Late journal/stream/final-write fault cannot be hidden by an earlier PASS snapshot. Keep primary + cleanup + journal + terminal errors together. No retry silently overwrites a failed namespace.

Dependencies: capture each regular file once to a buffer, write those bytes, hash/read destination, record metadata/symlink containment. Derive package versions from actually consumed package.json, not card echo. Workspace package-name/export mapping comes from the immutable archive, all @repo source loads confined there. Third-party snapshot and tools/caches are owned; original installed root remains read-only. Bind canonical Node executable and runtime, pnpm launcher **and its implementation closure**, git/tar/Chrome/osascript identities, controlled PATH/interpreters/env and per-command cwd. No caller-wide PATH fallback.

Vite resolves browser/import conditions through its actual resolver/optimizer pipeline; do not route all bare imports through Node require exports. Log resolved package conditions, original/transformed code/CSS/assets, optimizer inputs/outputs and actual module-serving closure. Keep optimizer/cache/temp/env inside reserved paths. Guard unexpected external workspace paths regardless of symlinks. The command lane runs the exact preserved pnpm/Vitest/tsc/eslint/build commands against the archive and logs tool resolution/cache writes/consumed workspace closure. Hashing node_modules alone is not proof of executable provenance. Qualification must exercise a real Vite React+SDK host success plus actual partial-import/setup failures, actual wrong-root package resolution and cache escape, and actual command launcher fallback; dummy file mutation or generic spawned child is inadequate.

## 6. Artifact-emitter contract and causal qualification

Before author3 writes, construct every case/row/phase path, lane owner, producing routine, applicability predicate, control, failure-finalizer and terminal hash slot in memory; validate the complete relation against frozen manifests. No wildcard emitter or runtime-discovered unrestricted path grant. Preserve original paths as logical obligations with exact versioned active destinations; old evidence stays read-only.

| Original obligation | Sole producer / required disposition |
| --- | --- |
| Archive/tool/server/browser/build stdout/stderr | Supervisor owns actual child pipe bytes, process/exit/signal provenance and EOF. In MET every lane that builds host includes original build.stdout.log/build.stderr.log with genuine build/server-setup process capture, never returned-JSON strings. A lane with no build points to its exact adopted build receipt only if applicability/reuse is explicitly approved. |
| Provenance/closure/dependency versions/admission | Archive/config/tool resolver and typed admission, independently hashed, derived from consumed bytes. Original MET2497 source entries and TASK source gates remain. |
| Per-case source/effects/AX/DOM/geometry/key/fault/first-frame ledgers | Respective acquisition routine streams incrementally; on error, independent best-effort final captures record actual success or failed capture cause. No successful-only branch emission or unavailable-as-empty. |
| Every focus stop pair / forward/reverse/key logs | Successor saves every observed pair before advancing; descriptor↔index mapping is frozen by census. All140 potential slot pairs per row remain in original obligation index. A successfully closed complete cycle of N<140 may mark only indices N..139 UNUSED_RESERVED_SLOT with closure/census proof under P-OUTER; it never writes fake PNGs. Interrupted/unvisited expected stops are MISSING/BLOCKED, never unused. |
| Original MET39 legacy control paths and all TASK59 controls | Explicit exact control-to-emitter rows, including original bad expected source-hash and wrong-root controls. No declaration without a producer. Controls added for new gaps receive finite new paths while all original paths/IDs remain. |
| Outcome/journal/stdout and full caller final index | Supervisor reconciles each lane result with source hashes/artifact hashes and root envelope; aggregate index accounts for every original case/row/obligation as observed PASS/expected original FAIL, accepted exact reuse, or BLOCKED/missing. A partial lane cannot be full caller PASS. |

The original-to-active relation is a bijection at the obligation-ID level, not necessarily one physical duplicate per reused shared artifact. A shared physical file may serve explicitly named obligations only when its producer/content/phase match all of them; record all references and never duplicate a path with ambiguous owner. MET additive source-observations.json duplicate is removed from the active file set while both historical declarations are retained and reconciled. No deletion from original2437. TASK keeps original4440 plus additive5072 obligations explicitly. Any original path lacking legal applicability or emitter blocks source readiness.

Qualification is a later independently registered unit; **none runs now**. Each pair specifies exact faultId, action/phase, injected cause, expected invalid value and causal counter, oracle/refusal code, required raw evidence, positive counterpart and cleanup/durability outcome. A negative passes only when that cause is acquired and the intended boundary rejects it while its positive baseline succeeds. An unrelated error, generic nonzero exit or teardown failure is not detection success.

Complete source3 control matrix must retain TASK Q01–Q59, MET33 current control IDs plus missing original hash control, and expand exact subcases as follows:
1. Root/card/source mismatch, wrong source review/adoption, missing role, stale/replayed reservation across a copied checkout, unknown/exhausted actual historical family, canonical path escape, outer wx collision, malformed/truncated card and preimport failure, through the real envelope entrypoint.
2. Actual delayed startup/import failure and configured Vite partial import; actual archive/tar late failure; canonical executable resolver and cache escape, not a fake child or directory check.
3. Real finite child with late stderr, retained pipe descendant, server premature exit0, TERM-resistant group, driver killed before child registration ack, cancellation followed by late setup, and early cleanup failure while later resources remain live.
4. Actual CDP pipe idle/truncated/unknown-ID/malformed/oversize/page runtime errors, after-last-command errors and both pipe EOF paths; journal partial/zero write/flush/close, late final record and supervisor terminal write failure; delayed filesystem writer remains quarantine.
5. Managed public auth/device/auxiliary startup, complete transition-ledger acquisition faults in §3, actual reload loader barriers, real rail and CmdK route/bus/history action pairs.
6. Native focus/mapping/descriptor/census/anchor/settle/control pairs in §4, real Retina/menu identities, partial capture persistence; restore original meaningful decoder/hue/scroll controls.
7. TASK T06-1..10 acquisition: destination semantic/AX/reason/count failures, no-effect transient and once-only neighbor faults, source statuses not relabelled empty, all five completion seeds, all six real failure/lock/retry/export paths with current revision/receipts, actual queued source operation, full geometry/mobile routes, and strict external vendor/acceptance receipt refusal.
8. MET planned-label removal each, enabled side effect, Log suppression, nonempty record/profile mutation, wrong key/field/normalization write, double activation, transient modal/navigation returning to original, actual save/reload and full keyboard. M4 alone uses empty A; other preservation rows use valid nonempty Weight records and distinct A/B profile sentinels.

Q43–Q52 may not feed committed reports only to checkOracle; those are parser/classifier checks, not acquisition qualification. All actual-path faults are isolated qualification specimens, never product PASS fixtures. Actual-vendor/fresh-acceptance controls qualify admission/refusal mechanics only and cannot synthesize real vendor or business acceptance. Expected preexisting product red is preserved separately from deliberately injected invalid specimen and from harness/precondition red.

## 7. Caller-specific exact final source plans

Only after §2 review/adoption, register **TASK12 ADDs** under docs/reviews/audit-parallel-task06-runner-source-r3/:

| File | Complete responsibility |
| --- | --- |
| driver.mjs | Actual T06 business/host/visual acquisition, emitted-browser parser correction, all source/effect/mount boundaries, routes/mobile dialog, full expected-result mapping and incremental failure captures |
| fixture.tsx | Public source fixtures, original five completion/eight source/six recovery cases, transparent one-delegate instrumentation, phase/all-attempt receipts and qualification-only activation mode |
| host-fixture.tsx | §3 actual AppProviders/main startup/SDK composition, current device keys, synchronous-acquisition-v1 pre-import recorder and true retained queued operation |
| vite.config.mjs | Browser resolver/transformed closure, owned dependency/tools/cache plan and actual-host server/transport setup |
| frozen-focus-adapter.mjs | Protected original verification plus separately named §4 successor/context/certificates/full environment, all per-stop capture and deferred failure |
| browser-zoom-adapter.mjs | Factor-to-percent boundary, owned native process/window/tab menu action and postzoom mapping invalidation |
| run-unit.mjs | Root envelope contract, one enclosing supervisor, role/history/admission/resource/stream/quiescence/terminal protocol |
| qualification-controls.test.mjs | Complete original59 and finite new acquired cause-specific subcases; no import-time execution |
| execution-manifest.json | All original111/4440/64 plus112/5072/59; exact emitter/admission/control/family/expected-result matrices and full canonical r2 G1 |
| qualification.md | Source-only receipt, exact prerequisites, no waived gaps or claimed qualification |
| inputs.sha256 | Full inherited corpus/reviews/this design+review+adoption/product/method input identities |
| source.patch | Exact binary/full-index diff of the other11 files; self-excludes only itself |

TASK expected-result mapping retains every original expectedP0FailureId. For each language, row-0→calendar, row-1→Completed, row-2→Won't Do, row-3→Trash, retaining the original predicate meaning; detailed new disabled/name/reason/count/AX results are children of that original row. Every original :footer-skipped in destination/inert/all eight source cases binds both forward/reverse membership and original no-op footer behavior. Store the original predicate alongside the detailed predicates; an aggregate is not accepted merely because any child failed. Unanticipated new child failure remains a finding; harness/selector/parse/activation failures never satisfy expected product failure. All IDs with empty expected failure arrays remain explicit unchanged positive controls; do not add expected reds ad hoc. Desktop/mobile and New-list/composer distinctions are frozen before execution.

Retain Tasks suite/typecheck/lint, existing source/completion/date/filter/list/tag/canonical subscriber/migration/save-recovery tests, Board/Statistics projections, exact Web/storage/auth/REL commands plus added web-build. Candidate product delta allowlist remains exactly the original seven future TASK paths when later admitted; this source/design task changes none of them.

Register **MET16 ADDs** under docs/reviews/audit-parallel-met05-runner-source-r3/:

| File | Complete responsibility |
| --- | --- |
| driver.mjs | M1–M9 acquisition/oracles, full transition/no-effect/reload/finalizer paths, complete row dispositions |
| fixture.tsx | Real startup/managed host, nonempty preservation fixtures and M4 empty exception, synchronous-acquisition-v1 pre-import recorder |
| vite.config.mjs | Correct browser exports/optimizer and actual consumed/transformed source closure |
| host-adapter.mjs | Local SDK transport, actual build/server ownership, route/CmdK/Weight/account/reload acquisition |
| focus-adapter.mjs | Original hashes + named successor invocation, certificate validation and fatal deferred results |
| focus-context.mjs | Authentic calibration document, exact geometry mapping, complete environment/descriptors/forward+reverse/actions/capture wiring |
| source-gate.mjs | Real source/closure gate, original bad-hash/wrong-root paired controls |
| browser-controls.mjs | Acquired native trust/effect/route/first-frame/focus faults through the same boundary |
| root-supervisor.mjs | Complete enclosing capture, root admission, descendant/resource/deadline and quiescent terminal protocol |
| launch.mjs | Typed inner request validation and supervised lane dispatch, never synthetic stdout/stderr |
| qualification-runner.mjs | Strict cause-pair evaluation + raw artifact/cleanup reconciliation |
| qualification-controls.test.mjs | All original/current controls plus finite actual-path additions; no top-level execution |
| execution-manifest.json | All89 rows/2437 obligations/2497 closure, no duplicate active paths; lane/emitter/history/adoption/role maps |
| qualification.md | Complete source-only receipt and external conditions; no silent M8 admission |
| inputs.sha256 | Full inherited corpus/reviews/this design+review+adoption/product/method identities |
| source.patch | Exact binary/full-index diff of other15 files; self-excludes only itself |

M1 remains source; M2 12 surfaces; M3 48 pointers with nonempty preservation; M4 two actual Weight save/reload paths; M5 all8 full walks/actions; M6 14 real entries including CmdK/direct/wildcard/query; M7 two source/account transitions; M8 one retained blocked original retry unit; M9 original and expanded acquisition qualification. Shared host/focus implementation does not acquire MET-01–04 or REL acceptance. Weight remains implemented, Sleep/Water/Exercise Planned, Custom adjacent unchanged. Product write allowlist stays empty.

The final source author's one static pass must fully reconcile the complete matrices/output payloads **before writing**. No runtime/test/build/lint/browser/native/qualification/probe/vendor/child/push. The same design can be materialized in caller-local files without a third shared implementation directory; hash-bind both copies to this approved contract and independently qualify each actual consumed closure. Shared origin/design does not justify using one caller's qualified result or acceptance for the other without exact declared reuse review.

## 8. Independent next gates and permanent ownership

The shared dependency is measurement/host admission, not a duplicate audit item. TASK-06 and MET-05 retain unique scope-map ownership and their own full original acceptance chains.

1. Fresh independent shared impact reviewer, distinct from this author and prior source authors/reviewers as required by root lineage, reviews full exact report/manifest and P-HOST/P-ACT/P-LEDGER/P-FOCUS/P-OUTER, returning explicit approvals or exact technical revision. Root serially records receipt and exact-hash adoption only after approval.
2. Fresh independent source-author3 then source-review3 separately for TASK and MET; cap3 retains all attempts including MET failed static pass. No fourth author/review or renamed scope reset.
3. Root reconciles actual permanent family histories and external prerequisites, then registers fresh independent acquisition qualification with finite paths/resources/budgets, followed by fresh independent qualification review and exact-hash root adoption. Source APPROVED alone permits no business run.
4. Separate full valid P0 before for each caller; freeze correct failures/pass controls, source/host/environment constraints and all artifacts. TASK activation and exhausted/unknown reused units remain blocked until their true dependencies resolve. MET M8 remains unknown/blocked; new Planned units do not inherit an invented zero or steal its allowance.
5. TASK bounded original product implementation only after admitted before; MET evidence-backed no-change disposition or separately impact-reviewed minimal repair if actual failures require it. Bind candidate and integrated SHAs separately; no protected repair is authorized here.
6. Complete fixed/candidate/integrated native/visual/source/account/affected regressions, full inherited canonical G1 coverage and actual different-vendor raw verdict; fresh full Astra acceptance separately for each caller. Fresh Codex independence is not actual vendor proof.
7. Only root then appends accepted evidence to the three ledgers without changing formal states, obtains fresh inventory and completes source preservation/integration/remote ancestry/push/sync under its recurring exclusive resource.

Full G1 remains the canonical r2 contract with E1–E25, E24 subrows/rules and E25 path/hash index. Preserve original12 F1 plus Appearance K-1 and rail selfcheck/product modes; Header host/native/Astra/Sol and every capacity-copy refusal/diff; full dashboard packages/Web/CmdK/storage commands; AppRail eight Sol modes+host, Appearance all modes/host/package+OE, Features all modes/host/readers/package+original+C-FD1+C-RD1, More all modes/host+original+C-FB002; Sticky, Notifications, Date & Time, Smart Lists, Collaborate, Pomodoro and settings-shell/rest. Existing conditional native-rerun exclusions require their original empty-diff/invariance proofs. Shared changes would require separately scoped full native/F1/engine/hook/caller reruns and fresh acceptance.

C-FB00210/10, OE26/26 and C-RD1 15/15 remain judging expectations; C-FD1 14/15 judges nothing, original Features13/15 and Appearance24/26 remain preserved. No past expected count becomes a fresh PASS. Every inherited row must be exact accepted reuse, new qualified exact-SHA evidence, or explicitly BLOCKED/missing; no short three-copy checklist substitutes for full G1.

## 9. Current cost, validation and protected closeout

This actor: impact-author3/3; one semantic document/source/hash/data/Git static pass1/1, with all inputs and both complete buffers prepared before any allowed write. No second semantic pass after a failure is authorized. Runtime0, tests0, build/typecheck0, lint0, browser0, native0, server0, qualification0, probes0, historical reruns0, vendor0, children0, product/runner/method implementation0, global writes0, push0. Provider token/currency cost is unavailable, never assumed zero. No reviewed source module was imported/executed. Read-only discovery issues: an initial combined output was truncated and was reread in bounded sections; a guessed Tasks package path was absent and ls-tree identified packages/xai-web-tasks; node_modules and apps/web/node_modules are absent. No installation, dependency execution or other-worktree lookup followed. Memory was navigation-only; all conclusions here use the fixed Git inputs.

The two outputs are ADD-only impact.md and inputs.sha256. No protected file, original method/contract/failure/evidence, runner/test/config/lockfile, root registry/ledger/inventory or other worktree changes. Exact-path staging and one structured Why/What/Scope/Risk/Docs/Tests commit use command-local disabled hooks; only mechanical commit/hash/clean receipts follow the one semantic pass. This source-only design remains unadopted and requires fresh full impact-review2. Root owns serialization, original commit preservation, integration mapping, remote push/ancestry and sync-check; this no-push worker does not claim complete cross-machine handoff.

The complete independent chain remains: full impact review/adoption and source prerequisites → separate final source authors/reviews → independently budget-admitted actual qualification → fresh qualification review/root adoption → complete valid P0 before → authorized TASK repair or evidence-backed MET no-change/separate repair → fixed/candidate/integrated/native/visual/source/account/affected/full G1 → actual different-vendor raw verdict → fresh full Astra caller acceptance → root evidence-only reconciliation → fresh inventory/remote preservation. Native/activation/budget blockers cannot weaken any link. Caller acceptance, formal312 status and release state remain distinct. Formal counts and all old failures remain unchanged.

## Appendix A. Complete TASK identity and expected-result preservation

All original case objects and command arrays remain normative at the bound source1/source2 manifests. This list includes all112 active IDs and retains original expected P0 failure names literally. Empty arrays mean unchanged positive controls, never permission to invent expected red. Source2 wrapper command spelling does not replace original suite arguments.

| Case | Lane/kind | Oracle rows | Original expected P0 failures |
| --- | --- | --- | --- |
| destinations-en | module/destinations | T06-1,T06-2 | ["destinations-en:row-0","destinations-en:row-1","destinations-en:row-2","destinations-en:row-3","destinations-en:footer-skipped"] |
| inert-en | module/inert | T06-2 | ["inert-en:footer-skipped"] |
| neighbor-en | module/neighbor | T06-3 | [] |
| destinations-zh | module/destinations | T06-1,T06-2 | ["destinations-zh:row-0","destinations-zh:row-1","destinations-zh:row-2","destinations-zh:row-3","destinations-zh:footer-skipped"] |
| inert-zh | module/inert | T06-2 | ["inert-zh:footer-skipped"] |
| neighbor-zh | module/neighbor | T06-3 | [] |
| completion-normal | module/completion | T06-4 | [] |
| completion-legacy-missing | module/completion | T06-4 | [] |
| completion-legacy-false | module/completion | T06-4 | [] |
| completion-dated | module/completion | T06-4 | [] |
| completion-undated | module/completion | T06-4 | [] |
| source-empty | module/source | T06-1,T06-2,T06-5 | ["source-empty:footer-skipped"] |
| source-envelope | module/source | T06-1,T06-2,T06-5 | ["source-envelope:footer-skipped"] |
| source-legacy | module/source | T06-1,T06-2,T06-5 | ["source-legacy:footer-skipped"] |
| source-stale-date | module/source | T06-1,T06-2,T06-5 | ["source-stale-date:footer-skipped"] |
| source-unknown-date | module/source | T06-1,T06-2,T06-5 | ["source-unknown-date:footer-skipped"] |
| source-corrupt | module/source | T06-1,T06-2,T06-5 | ["source-corrupt:footer-skipped"] |
| source-unsupported | module/source | T06-1,T06-2,T06-5 | ["source-unsupported:footer-skipped"] |
| source-read | module/source | T06-1,T06-2,T06-5 | ["source-read:footer-skipped"] |
| recovery-quota | module/recovery | T06-6 | [] |
| recovery-throw | module/recovery | T06-6 | [] |
| recovery-missing-lock | module/recovery | T06-6 | [] |
| recovery-rejected-lock | module/recovery | T06-6 | [] |
| recovery-held | module/recovery | T06-6 | [] |
| recovery-baseline | module/recovery | T06-6 | [] |
| account-a-to-b | host/account | T06-7 | [] |
| account-logout | host/account | T06-7 | [] |
| account-generation-revocation | host/account | T06-7 | [] |
| account-late-completion | host/account | T06-7 | [] |
| account-stale-retry-export | host/account | T06-7 | [] |
| host-route-default | host/route | T06-8 | [] |
| host-route-wildcard | host/route | T06-8 | [] |
| host-route-disabled | host/route | T06-8 | [] |
| host-focus-cycle | host/focus | T06-2,T06-8 | [] |
| visual-1440x900-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| tasks-test | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| tasks-typecheck | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| tasks-lint | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-host-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-types | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-lint | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| board-link | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| statistics-completion | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| storage-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| auth-provider-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| rel03-host-boundaries | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| actual-vendor | independent-actor/external | T06-10 | [] |
| fresh-final-astra | independent-actor/external | T06-10 | [] |
| web-build | archive-command/command | T06-8,T06-9 | [] |

TASK controls retained exactly: Q01, Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25, Q26, Q27, Q28, Q29, Q30, Q31, Q32, Q33, Q34, Q35, Q36, Q37, Q38, Q39, Q40, Q41, Q42, Q43, Q44, Q45, Q46, Q47, Q48, Q49, Q50, Q51, Q52, Q53, Q54, Q55, Q56, Q57, Q58, Q59. Every original24 plus additive35 still needs an actual cause-paired producer under §6; fourteen acquisition pairs expand this set and do not replace it.

## Appendix B. Complete MET row and control preservation

| Row | Contract | Kind | Permanent unit |
| --- | --- | --- | --- |
| M1-source | M1 | source | MET05/planned-source-qualification |
| M2-en-light-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-light-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-light-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M4-en-weight | M4 | weight-positive | MET05/planned-surface-pointer-positive |
| M4-zh-weight | M4 | weight-positive | MET05/planned-surface-pointer-positive |
| M5-en-light-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-light-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-dark-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-dark-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-light-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-light-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-dark-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-dark-1440 | M5 | keyboard | MET05/planned-keyboard |
| M6-en-direct | M6 | entry | MET05/planned-host-source-account |
| M6-en-rail | M6 | entry | MET05/planned-host-source-account |
| M6-en-cmdk | M6 | entry | MET05/planned-host-source-account |
| M6-en-sleep | M6 | entry | MET05/planned-host-source-account |
| M6-en-water | M6 | entry | MET05/planned-host-source-account |
| M6-en-exercise | M6 | entry | MET05/planned-host-source-account |
| M6-en-query | M6 | entry | MET05/planned-host-source-account |
| M6-zh-direct | M6 | entry | MET05/planned-host-source-account |
| M6-zh-rail | M6 | entry | MET05/planned-host-source-account |
| M6-zh-cmdk | M6 | entry | MET05/planned-host-source-account |
| M6-zh-sleep | M6 | entry | MET05/planned-host-source-account |
| M6-zh-water | M6 | entry | MET05/planned-host-source-account |
| M6-zh-exercise | M6 | entry | MET05/planned-host-source-account |
| M6-zh-query | M6 | entry | MET05/planned-host-source-account |
| M7-identity | M7 | account-source | MET05/planned-host-source-account |
| M7-mixed-source | M7 | account-source | MET05/planned-host-source-account |
| M8-retry | M8 | retry | REL-05/metrics-native-save-retry |
| M9-controls | M9 | qualification | MET05/planned-source-qualification |

All33 current control IDs retained: missing-sleep, missing-water, missing-exercise, enabled-sideeffect, suppressed-log, untrusted-dom, missing-weight, missing-log, selected-after, wrong-key, wrong-first-render, stale-document, noop-route, missing-rendered-record, normalization-write, archive-stream, archive-late-tar, resolver-name, resolver-outside, parser-idle, parser-truncated, page-exception, child-late-exit, child-retained-stream, task-cancel-join, partial-build, outer-wx, final-write, journal-flush, journal-close, artifact-missing, admission-replay, admission-m8. Restore original corrupt expected source-hash cause as a separate mandatory real source-gate pair, plus actual wrong-root control; retain every one of original39 legacy control artifact obligations through explicit lane/emitter mapping. M8 remains unknown/blocked with lower bound2.

## Appendix C. Canonical Clock r2 section14 (verbatim)

The complete canonical contract remains separately bound. The following section14, including its heading, introduction, table header, all E1–E25, E24 subrows and Rules, is retained byte-for-byte. It does not supersede any other canonical section.

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


## Full source appendix 7 - SHARED full independent impact review2

Source bdc06bd5b57f026caf6d7838563bfdae6f8684c9:docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md; SHA-256 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1. Entire source begins below.

# SHARED / NATIVE-HOST-FOCUS-IMPACT-REVIEW2

Verdict: **APPROVED — complete five-row conditional technical basis only. FINAL CALLER SOURCE3 DISPATCH REMAINS BLOCKED pending the explicit consumed-source and root-capture prerequisites.** The exact author3 proposal provides a bounded design for I1's synchronous acquisition and preserves the four previously conditional bases. This approval does not attest a working collector, ReactDOM forwarding, an SDK endpoint implementation, focus calibration, method qualification/adoption, production activation, either caller's source approval or acceptance. It is not a request for author4.

## Fixed identity, independence and scope

Module **web (project-system)**; workflow responsibility D under the sole A-Codex root. Fresh independent reviewer `/root/parallel_d_shared_full_review_r2`, with no earlier authorship in this caller and no children. The card's Astra/gpt-6-astra configuration is not provider or actual cross-vendor attestation. Sole checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-shared-impact-full-review2-20261010/XAI_Desktop`.

- Clean direct parent R: `3ee736788a5d488505cd322a95ae61e2c0d76715`.
- Fixed input F: `4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d`; no input repin.
- Reviewed final source S: `f667a0b6996b4039d2c4e5ca28657953703e830b`, direct parent `43ba9fcfadb1075bc117b4d75f8888573d1ae2f2`.
- Product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Full impact1: `516495625056a6123f22ff67df61c9c34dff2484`; full review1: `b7e075c51e77fbf9c376ae33e3a9e2fb3b69fd06`.
- Task card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-shared-native-host-focus-impact-review-r2.json`.
- TASK source2/review2: `f8821c1bb99a51f07a3e6d077bc3391affde7a99` / `cd7be1409e6198e5032dceb85bad8cca2182c3ae`.
- MET source2/review2: `624e016359a0b48662828ffc9cc15db453792278` / `21519e7f55db4fa609e194e5d2a9bd622445107c`.

AGENTS, CLAUDE, shared workflow/multi-machine rules, original goal, authority overlay, goal-D and the exact card were read. The current task is dynamically registered in execution-state.tasks and its task card; the initial three-node task-registry is not required to duplicate every later task. Only the two exact ADD outputs in this card may be written. All source/product/tests/config/lockfile/CSS/storage/schema/host, protected original methods/contracts/runners/logs/evidence, global controls/ledgers/inventory and other worktrees remain untouched. Root retains integration, preservation/push and sync ownership under the explicit worker no-push scope.

## Complete integrity and obligation review

All **2842/2842 author3 immutable objects / 68,811,558 bytes** were read and SHA-256 verified, zero mismatches. Whole review1 **2821/2821** and impact1 **2808/2808** identities are hash-consistent subsets. TASK review2 **477 raw/477 unique** and MET **2663 raw/2651 unique** retain their twelve consistent aliases; union **2781**. This review manifest binds **2863 immutable objects / 71,675,457 bytes**, SHA-256 **fb357c8de96a333b89fccd879b6babfe6f7a78fc2f3fd91715535e921a0964d4**.

| Exact input | SHA-256 |
| --- | --- |
| Reviewed S impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| Reviewed S inputs.sha256 | a0ae1254c46e6bff30713cb3436b80bede46d1248ceaf925373164595de7aaad |
| Review2 card at R | c7db9dd03ee035b89e91527f67bcdb8f3061bc2b971c9a2827a0ab52835d0504 |
| Author3 card at43ba | 25fd81b588291013f8ee35fe62f30804e01a0e60c41abdd901f073c661449d4c |
| Corrected failure receipt at43ba | f2fd4c29ff8e1e1778fac3e49ec62279e7bf11ec9cc74b0412588a9a1a515f37 |
| Original receipt at2ce65ab | cf9402bab9f27765cb8f0a72847e0377657774dfd7de296a7759e223e452cb05 |
| Whole Appearance frozen file | 5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4 |
| Full Appearance block / 21749 bytes | e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43 |
| pixelFocusWalk / 6395 bytes | 1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620 |
| Original probes | 4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4 |
| Full canonical Clock r2 /152183 bytes | 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae |

All12 TASK and14 MET source2 ADDs equal their immutable source commits and this fixed checkout. Full binary/full-index patch reconstruction equals protected source.patch, including every non-patch output: TASK **1735850 bytes /648436d64cb21e552c8b057e8ecb76fa34cf1e5586e78a7769b8e18944982f4d**; MET **1541142 bytes /d895b2ba053b1b1d9f77d649f22f94ef97f5fadeb368747c6c4ea66d84224b85**. Original TASK case/command/variant/oracle/expected-result/path mappings and entire MET row/artifact/closure arrays were compared, not sampled. MET source2's2706 declarations/2705 unique paths remain historical; review does not silently repair the duplicate.

This is full immutable-byte validation, complete matrix/patch reconciliation and technical review of the full proposal, predecessors, reviews, governing contracts and relevant product paths. It is not behavioral review of every dependency/product byte or visual acceptance of historical images. The entire corpus, not only the I1 paragraphs, is retained.

The four P0→R apps/packages differences are exactly accepted TT08 owning documents `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md`; runtime paths remain unchanged. Whole apps/packages equality would be false and is not asserted. Original TODO.sections[].tasks preserves 312 ordered field records. EXECUTION.items retains 939 evidence references, formal13/3/3/293 and299 unclosed. The older scope-map snapshot retains933 references; that snapshot does not overwrite the six later references. Its39 routed labels remain exactly reversible via original_module (30 project-system and9 cross-module verification-index). TASK-06 and MET-05 remain separate workflow-C owners, pending and unaccepted.

## Five-row disposition and I1 reasoning

| Row | Review2 disposition | Binding condition |
| --- | --- | --- |
| P-HOST | APPROVED conditional technical basis | Real archived AppProviders/Router, non-null managed config, actual main startup, SDK and auxiliary bridges through the admitted local HTTP boundary; complete consumed-source/schema proof and actual correspondence qualification remain mandatory. |
| P-ACT | APPROVED qualification-only seam; production HOLD | Existing public test activation can qualify acquisition in disposable documents only. Actual P0 activation stays closed. A test-seam queue cannot satisfy production mutation/queued-writer acceptance. |
| P-LEDGER | APPROVED bounded synchronous-acquisition-v1 design; I1 design correction sufficient | Approval is conditional on exact pre-import descriptor/event/config/source closure, transparent implementation and all actual causal pairs. ReactDOM forwarding and SDK consumed-source proof are missing, so source3 is held. |
| P-FOCUS | APPROVED named native-focus-context-v1 successor basis only | Protected references/thresholds/context, authentic calibration and target revalidation, native Retina/actual menu200, full outside census/reverse/actions and per-stop capture must qualify independently. |
| P-OUTER | APPROVED enclosing supervision and finite representation basis only | Root pre-reserved, immutable identified machinery before inner parsing/import; actual streams and full descendant/write quiescence, source/command/browser closure and complete original-emitter relation. Missing root machinery is a source3 prerequisite, not a runtime placeholder. |

Review1 correctly rejected observer/Profiler/rAF-only acquisition: a value written and restored in one turn can leave no attribute mutation or later differing sample. S §3.3 now specifies an actual acquisition boundary. It captures native setter/method entry and exit synchronously before product/framework imports; window capture listeners acquire native edits before root-delegated React handlers; DOM remove/replace/insert boundaries freeze subtree values before destructive changes and after insertion. Detached nodes retain stable identity and copied historical scalar values. A same-node wrong value followed by restoration produces two entries; a removed subtree is serialized before removal rather than dereferenced when MutationObserver eventually runs. DocumentFragment contents are captured before native consumption. These mechanisms address the prior counterexamples as a design, subject to their source and native capability predicates.

The following are inseparable conditions of that approval, already required by S, not a new reviewer repair:

- Native getters are captured and invoked only on brand-checked native objects for snapshots. Snapshotting must not consult own/user getters, coercion hooks, live Event/DOM/session references or React tracker internals. Public getters delegate exactly once. Native setters/methods receive the original receiver and uncoerced arguments once and return the identical result/promise or rethrow the same object. Coercion must not happen earlier merely to log an argument.
- Collector faults cannot replace native returns/throws or alter storage/CSS/focus/events. A reserved sticky failure channel survives append/record limits, exceptions and unacknowledged tails. Failed native calls have attempt/throw records; they are not claimed successful mutations.
- Reentrant application writes during native conversion retain parent/child entry/exit order. Only collector-internal captured-native reads may be suppressed; an entire-call busy flag would erase A07 and violate the contract.
- React's instance value/checked tracker must retain its own semantics. The proposed preinstalled prototype wrapper is viable only if the exact consumed ReactDOM own descriptor forwards to it. Defining/deleting/replacing descriptors or prototypes cannot create a silent bypass interval. Captured setters from another realm, unwrapped cached functions, eval writers and unsupported editor/Range/indexed-option paths require complete source/config closure or a refusal before business admission.
- Native checkbox/radio/select/reset side effects need group snapshots and their genuine default-action ordering. Reading the final DOM, or one later input event, is insufficient by itself. Required trusted typing/reset/select/checkbox paths must actually be implemented and qualified; unsupported autofill/accessibility/realm paths cannot be allowed through merely because a later generic CAPTURE_INCOMPLETE might fire.
- Initial unknown auth identity remains unknown. Acquisition starts before coordinator construction; initial public snapshot/subscription epochs and subsequent marks must causally bind the interval. No late lookup may rewrite earlier records with final owner/epoch. Property operation, DOM mutation, React commit, pre-paint state and screenshot remain distinct truth categories. No claim of painted transient or speculative React commit follows merely from an intercepted setter.

The acquisitionContract in each future manifest must freeze the exact report/review/adoption, product/source/configuration, collector exports/digests, descriptor owners and supported operations/events, prelude order, source-path-to-boundary map, realm/frame policy, node/record/byte/chunk limits, terminal channel and fourteen control IDs. Missing consumed code/forwarding proof, unknown API/realm/config or imports before prelude trigger the specified refusal, not an intentionally incomplete last-slot skeleton. MutationObserver oldValue/takeRecords is a corroborating cross-check; quiet time and no observed mismatch cannot prove absence of unacquired activity.

All14 causal pairs are retained. A01 property-only write/restore and A02 detached-history subcases cover value/checked/selected wherever used; A03 text/attribute correction; A04 real browser edit before React restore; A05 peer selection/reset default paths; A06 unsupported own descriptor; A07 conversion reentrancy/receiver/throw; A08 loss/overflow/exception; A09 wrong epoch/remount; A10 locked insertion/removal; A11 stale A publication across A→B→A; A12 genuine reload identity; A13 real prelude/import/closure; A14 restoration conflict/late writer. Every negative needs an actual cause, observed invalid value, exact intended rejection, counter/raw order and separate cleanup result beside its successful positive. A mutated report or unrelated nonzero cannot qualify acquisition. All pairs remain UNRUN; all TASK59/MET33/original39 artifact controls and the missing original bad-source-hash pair remain additional obligations.

## Host, activation and caller completeness

The actual main source calls registerServiceWorker then bootstrapObservability before rendering StrictMode/AppProviders/RouterProvider. The former has real DEV unregister/cache deletion behavior; the latter initializes transport/controller and asynchronous web-vitals work. S preserves those calls and import ordering, source mount effects, genuine StrictMode duplicates, untouched-main correspondence and errors. A ready flag cannot replace this evidence.

AppProviders' live non-null config chooses managed generation persistence and includes AccountDeletionRecoveryBridge, DeviceSessionBridge and TodoWebRuntimeBridge. Source-level composition is feasible through public exports without a private provider or config=null. Auth generation and business storage generation are separate identities. Device language/theme/density/features keys must come from actual public physical-key resolution, not account:g1 convention. Complete initial/read/mount/action/drain phases and every attempted effect remain required.

The real local HTTP boundary must bind SDK method/path/query/body/header/response semantics, password/refresh/user/logout when consumed, real device register/heartbeat with Authorization/X-Device-Id/X-Sync-Version/device_id, and any declared Todo nonce lease types. Keep invalid/expired/wrong-owner/malformed session, device401 unknown_device/403 device_revoked, stale A response after B, separately scoped deletion cleanup, Todo owner/lock cleanup and undeclared calls. SDK package/version labels cannot prove its actual endpoint/token/storage behavior. Disposable transport isolation cannot suppress actual auxiliary startup or masquerade as production backend acceptance.

P0 canonicalCommandState defaults commandActivation=false and both mutation paths refuse before the lock. The exported test setter is a legitimate qualification seam, not a production call. In an admitted activation-capable specimen require an actual product-origin navigator.locks request pending behind the exact A lock, request/callback/promise identities and corroborating held/pending query. Retain that same operation through lock/owner revocation/B readiness/release/settlement, with nonempty B sentinels and all writes/removes/bus/draft/count/export/download/revision/receipt publications. Gate-off click plus held fixture lock and stale screen coordinates prove neither queue nor stale closure.

TASK retains all ten T06 obligations,111 original cases/4440 paths and added112/5072/64 visual/59 controls. Preserve original expected-P0-failure mappings literally: row0 calendar, row1 Completed, row2 Won't Do, row3 Trash, each language, footer-skipped and all empty-array positives. New child predicates cannot let a harness/parse/activation/selector failure satisfy an expected product red. Keep five completion seeds, eight source states, six recovery/lock/retry/export paths, actual source status, once-only smart Enter/neighbor actions, all original command arrays plus web-build and original seven future product paths. The full appendices below enumerate every active case and command.

MET retains all89 rows/2437 original artifact obligations/2497 closure entries. M2 has12 surfaces; M3 has48 pointer preservation cases with nonempty valid records/profile sentinels; M4 alone has2 empty-fixture real Weight save/reload cases; M5 has8 complete walks/actions; M6 has14 real route entries; M7 has2 source/account rows; M8 remains one blocked historical retry unit; M1/M9 source/qualification remain. Keep transient history/bus/modal effects, real rail/CmdK and correct non-null new-document/new-loader readiness. Weight stays implemented, Sleep/Water/Exercise Planned and Custom adjacent. No MET-01–04/REL acceptance is borrowed.

## Focus successor and protected environmental semantics

Whole frozen Appearance file, complete decoder/helper/selftest/walk block, function and surrounding probes were independently bound. The proposed successor retains the protected original; byte equality is identity evidence, not environmental equivalence.

The exact native-focus-context-v1 mapping is a bounded coordinate-domain change with original signed max-distance, offset−2..offset+width+2 band, own interior+band union, next-stop exclusion pad3 for outline none (otherwise max(0,offset)+width+3), and exact RGBA differences. At scale1 it must reproduce original per-stop predicates/failure classification and decoder/crop bytes. Keep sameSize, ownPixels>0, outline!=none, ownDiff>0. bandRatio<0.15 remains manual-review evidence, not a waiver or alternate threshold.

Retain original <0.01 CSS-px alignment, matching clip/scroll/hover, at most6 captures120ms apart until two consecutive byte-identical PNGs, fonts then at most120 double-rAF settlement iterations with only true Infinity excluded. Complete context includes native trusted press/anchor/parkMouse, pageOffset, dimensions, Buffer/inflate, evaluate/CDP, record/pre/observe/checkDeferred/saveShot and partial-failure flushing. Do not replace those functions with a callback or silently extend time/tolerance.

Authentic archived Appearance supplies real hue (>8 colors), browser-decoder equality and correctly mapped full-vs-clip/scrolled-coordinate checks. An unscrollable page cannot claim a scrolled negative. Target Tasks/Metrics independently revalidate actual content and page/nested-scroll mapping at every relevant reload/resize/menu/display change, including a genuine discriminating wrong-coordinate negative. No injected hue, preference transfer, resampling, guessed DPR or pixelSelfTested=true shortcut.

Full whole-document selector/filter and shell/rail/topbar/sidebar/filter/footer/dialog/pet/outside census remain. Descriptor↔node mapping is injective and source/AX bound before and after structural actions, independently of traversal. A repeated other:button cannot close a cycle. Unsupported reachable shadow/iframe scope refuses. Use actual nonfocusable anchor with measured hit, no forced focus/tabindex/inert/style. Full forward/reverse140-bound cycles, original body-crossing bound, every focused/moved-on pair and fatal deferred outcomes remain. Weight and Log Enter/Space each need true once-only behavior with real Close between trials; TASK actions need causal histories. Independent visual judgment remains.

TASK's factors1/2 map to100/200 only at real menu boundary. Use actual owned browser executable/PID/start/window/tab/CDP context identity and passive focus/visibility, not bundle ID alone; native helper is a supervised child. Measure real Retina DPR and effective viewport after genuine menu200 and invalidate calibration. No emulation/pinch/CSS zoom substitutes. The visible New task composer is a legitimate mobile dialog path; it does not satisfy separate desktop New list metadata obligations or make hidden-sidebar rows visible.

## Root supervision, exact emitters and missing-source prerequisites

P-OUTER requires serial root reservation/consumption of immutable task/card/review/adoption/actor lineage/permanent-family/resource paths before dispatch. An inner wx file cannot prove global anti-replay. Existing outer capture machinery must be named, inspectable and hash-bound before final source3, and capture actual supervisor stdout/stderr before inner card parsing/import. Missing machinery is an admission hold. Root cannot silently implement a new runner while recording adoption.

One total deadline includes archive/dependency snapshot/Vite/browser/native helper/action/capture/cancellation/finalization plus reserved teardown, preserving original case/outer bounds. Register every descendant/task/descriptor/write before work and acknowledge any detached ownership transfer. Distinguish successful short child exit0 from premature server/browser exit0. Join process and both stream EOF/close paths, retain late tails/parser/page/CDP/idle errors and retained-descriptor descendants, continue cleanup after individual failure. Track writes through write/fsync/close; seal only after actual quiescence. QUARANTINED_UNJOINED is partial mutable/unresolved evidence, never an immutable complete terminal.

Capture dependency bytes once, write/hash actual destination and derive versions from consumed metadata. Bind Node, pnpm launcher and implementation closure, git/tar/Chrome/osascript, PATH/env/cwd/cache/optimizer/temp. Actual Vite browser/import resolution, transforms/CSS/assets/loaded modules and actual command tool/source closure must be retained. Node require resolution and hashing node_modules alone do not prove browser or command provenance. Qualify actual React+SDK host success and configured partial import, wrong-root/cache/launcher failures, true late streams and terminal writers.

Every original obligation needs explicit original→lane→producer→applicability/disposition→terminal hash mapping. Keep actual build.stdout.log/build.stderr.log where the lane builds; exact approved reused build receipt is the only possible declared reuse. All original MET39 legacy control paths need emitters. Reconcile the duplicate source-observations declaration without deleting either historical obligation. For a successfully closed N-stop cycle, only N..139 may be UNUSED_RESERVED_SLOT with census proof; interrupted/unvisited expected stops are MISSING/BLOCKED. Save every observed pair and raw partial failure. No fake PNG, empty placeholder, wildcard producer or partial-lane caller PASS.

**Hard prerequisite disposition:** actual immutable ReactDOM/React and SDK consumed source bytes are absent from the author's worktree and are not established by this review. This reviewer also has no node_modules in the owned checkout; no dependency installation or other-worktree lookup was performed. The package lock identifies a selection, not the implementation of the forwarding, native write paths or SDK APIs. Actual source/config/forwarding proof, browser support constraints and existing root-capture closure remain unproven. Both final caller source3 slots stay HELD even after root records this conditional design approval.

A separately registered evidence-only source-byte collection can be a viable prerequisite because it can capture existing exact package/entrypoint metadata, dependency bytes and root machinery identities without changing S or product/method semantics. That possibility is not authorization or proof of availability. Root must first identify a permitted read-only source and exact finite output/verification scope; collection must preserve actual bytes and origins and expose absence/mismatch honestly. It cannot install/execute dependencies under this review, invent forwarding proof from versions, add capture design, repair S, widen supported surfaces or become author4 under another name. Actual evidence must then substantiate the already required source-to-boundary/SDK/root predicates before last-slot dispatch. If it reveals a semantic design gap or cannot be supplied within legitimate remaining scope, freeze affected descendants and continue other audit flows; do not consume final author3 on a partial skeleton.

## Finite source plans, immutable histories and complete downstream gates

Future TASK12 paths and MET16 paths remain exactly as S §7, enumerated below. These are proposed later registrations, not this review's write grant. TASK source.patch must serialize other11 paths; MET other15, full-index/binary, self-excluding only itself. Every collector/control and exact finite emitter relation must be complete before a source author writes. Concrete collector hashes arise from source3 and require source-review3 plus later qualification; unavailable external conditions require implemented admission refusals, not missing mandatory code.

Shared author3/3 is exhausted; NO author4 or disguised repair. Author2's FAILED1/1 raw-versus-unique assertion remains failed, with full hashes/patch comparison/both buffers/writes UNRUN. Original bad-metadata receipt at2ce65ab is retained; corrected43ba receipt binds exact P0 only and changes no budget. Review2/3 is consumed here. Both TASK and MET source-author2/3 and source-review2/3 remain consumed and their final3 held. MET's earlier author2 FAILED static also remains. Unlaunched TASK-only impact0 grants no new capacity.

M8 native lifetime remains UNKNOWN with known lower bound2, not exact used2/3. Clock retention3/3 and visual3/3 remain exhausted; REL02+REL03 V1 UNKNOWN remains a local hold. Map actual command/suite membership to actual families; a new name/source/worktree/actor/qualification label never resets a unit. Root alone may reconcile histories from complete immutable evidence.

The chain remains: conditional full impact review and exact root adoption plus all source prerequisites → separate complete final TASK/MET source authors → fresh source-review3 → independently budget-admitted actual acquisition qualification → fresh qualification review/root exact-hash adoption → separate complete valid original P0 before → authorized bounded TASK implementation or evidence-backed MET no-change/separately approved repair → complete fixed/candidate/integrated/native/visual/source/account/affected/full canonical G1 evidence → actual different-vendor raw verdict → fresh full Astra acceptance separately for each caller → root evidence-only reconciliation → fresh inventory and root remote preservation/ancestry/sync. No approval here skips any link.

Full canonical Clock r2 Required evidence §14, including heading/introduction/E1–E25/E24/Rules, is reproduced verbatim below. Keep original12 F1 plus Appearance K-1 and rail modes, Header host/native/Astra/Sol and each refusal/capacity-copy diff; full dashboard packages/Web/CmdK/storage; AppRail8 Sol+host; Appearance all/host/package+OE; Features all/host/readers/package+original+C-FD1+C-RD1; More all/host+original+C-FB002; Sticky, Notifications, Date & Time, Smart Lists, Collaborate, Pomodoro, settings-shell/rest. Conditional native exclusions require their exact empty-diff/invariance proof; affected shared changes need separately registered full native/F1/engine/hook/caller reruns. C-FB00210/10, OE26/26 and C-RD1 15/15 are judging expectations; original Appearance24/26, Features13/15 and diagnostic C-FD1 14/15 remain preserved. Historical expected counts are not fresh PASS. Every row is exact admitted reuse, new exact-SHA evidence or explicit BLOCKED/missing.

## Cost, errors and closeout

One bounded semantic static review pass1/1, review2/3. Runtime/tests/build/typecheck/lint/browser/native/server/qualification/probes/historical reruns/vendor/children/product or runner implementation/global writes/push all0. Provider token/currency billing unavailable, not zero. No reviewed module, test, parser, build or browser was executed.

One discovery command `9ac03f` exited1 because it guessed nonexistent `audit-parallel-shared-native-host-focus-impact-source-r2/report.md`; the preceding git stat succeeded. Actual paths were then discovered from the immutable commit. This was a read-only path lookup, not a semantic checker retry or runtime invocation. One tool-side JavaScript string-construction call raised SyntaxError before any exec command or semantic checker launched; the string quoting was corrected before the sole checker invocation. Several overlong read results were truncated and narrowed into section/schema reads. Memory keyword search returned no relevant task authority and was not used for conclusions. No input/hash/dirty/scope drift or semantic validation retry is claimed.

All inputs, both complete output buffers and their relations were validated before any write. The exact two ADDs are committed with command-local hooks disabled and Why/What/Scope/Risk/Docs/Tests. Only mechanical commit/hash/clean checks follow the one pass. Exact exec completion/session receipt is handed to root; no background completion is assumed. Root owns remote preservation, integration and sync. Formal13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed stays unchanged; overall goal incomplete.

## Appendix A. Exact later source sets and current protected outputs

Future TASK prefix docs/reviews/audit-parallel-task06-runner-source-r3/; exact12: `driver.mjs`, `fixture.tsx`, `host-fixture.tsx`, `vite.config.mjs`, `frozen-focus-adapter.mjs`, `browser-zoom-adapter.mjs`, `run-unit.mjs`, `qualification-controls.test.mjs`, `execution-manifest.json`, `qualification.md`, `inputs.sha256`, `source.patch`.

Future MET prefix docs/reviews/audit-parallel-met05-runner-source-r3/; exact16: `driver.mjs`, `fixture.tsx`, `vite.config.mjs`, `host-adapter.mjs`, `focus-adapter.mjs`, `focus-context.mjs`, `source-gate.mjs`, `browser-controls.mjs`, `root-supervisor.mjs`, `launch.mjs`, `qualification-runner.mjs`, `qualification-controls.test.mjs`, `execution-manifest.json`, `qualification.md`, `inputs.sha256`, `source.patch`.

Current protected source2 hashes:

| Caller | File | SHA-256 |
| --- | --- | --- |
| TASK | browser-zoom-adapter.mjs | 19e346df32cf5bc194971bb27660d921485783e60a0bdbb41892e71669dcbee0 |
| TASK | driver.mjs | 97e922fac08b2c0003b8ec75042db58d9d682ed00909071537edaad3fc5be727 |
| TASK | execution-manifest.json | 119b2034076db203c146ee526948bb7ee178b4018062da054e22970f268632c5 |
| TASK | fixture.tsx | a2321634a4da0eec0f29fce2e403d126df88ff93e87c3bd0a315dd816a81005c |
| TASK | frozen-focus-adapter.mjs | 771529809e16d8a7476ec805743d1926d6c5bb26ff800b077e08476f7ded57df |
| TASK | host-fixture.tsx | 66af650cde86ee551ffbba9d125756b6fa9916fe9aa3bcd466406c2c20876afe |
| TASK | inputs.sha256 | 32f8cc141bae8d3a3de4dd7645904926b5aa05b5807e193ef49ce8d6750a9730 |
| TASK | qualification-controls.test.mjs | c0d65412d5ec0f8ed67538251be5779e91e8875ef22f2e07d6f327aae842ab96 |
| TASK | qualification.md | 03742f66d38ac6581e49ce61d8602dbe0533c6b08f71b0893632310b188734e0 |
| TASK | run-unit.mjs | 03155f963569e1c576fc044eff4340256371e42dfbaa2956d83905bf522c470d |
| TASK | source.patch | 648436d64cb21e552c8b057e8ecb76fa34cf1e5586e78a7769b8e18944982f4d |
| TASK | vite.config.mjs | bae300e7cc3bc17d9b3612c9da48286b1ab356260e308707f94c60d829d027ff |
| MET | browser-controls.mjs | a2f24c0bbbd55252f87f1318a43bc50f324c11218de1be002445c81242df45af |
| MET | driver.mjs | dc966b17227096baf6c70d4b1114901566c13c4626090646599f93e59ac59b98 |
| MET | execution-manifest.json | 5fc9c44c269752fbac9cf7e9573b9c0c2c894ac932d2979d1b39a4220a0cbcd9 |
| MET | fixture.tsx | 20c1d146e90ad0883bf806b5366c52aecdebdcdb2a1616ef13ebf0cf7cc2a294 |
| MET | focus-adapter.mjs | 634c68a007dd9d226cb73be4854542e3c0ccb1c93f475bb49d6968a5075c35a7 |
| MET | host-adapter.mjs | 929a47746ae358ba2eb73f8c07110a4d200083caae0ad71cacf90cc7e22be7b0 |
| MET | inputs.sha256 | 1f0a8ec6f4589b9cdb15b1d9ef3bf71ffd9869482a4838d2c6f1bf05ed9e7ec4 |
| MET | launch.mjs | 154b191fdbda7a833e10df551dfd200cfc2558cc4f03f10a17096cc5c4840117 |
| MET | qualification-controls.test.mjs | c1c8723af480a8791f27b2da0b6534ca3050133c1793761cf3fb75c96fc13663 |
| MET | qualification-runner.mjs | 3379eae01bccc326cf925072e3c6164388ed87a75bf4970a464ea3508368959a |
| MET | qualification.md | 0a2e01854ac2cae5c40f8d39c867bdb33df80794c15df89dd5f9233eb98a4b51 |
| MET | source-gate.mjs | db956638e9d2a8632e873504473c56756e52d5dc1ad851b4c0a24d45d0f55033 |
| MET | source.patch | d895b2ba053b1b1d9f77d649f22f94ef97f5fadeb368747c6c4ea66d84224b85 |
| MET | vite.config.mjs | fb6ef283d36586b15b727d8755dc307ac1f11d90ff6921396a17aaf4c7e987a9 |

## Appendix B. Complete TASK active matrix

Original111 objects and command arrays remain normative; web-build is additive. All4440 historical and5072 active paths are verified in their fully bound manifests, not replaced by this compact table.

| Case | Lane/kind | Oracle rows | Original expected P0 failures |
| --- | --- | --- | --- |
| destinations-en | module/destinations | T06-1,T06-2 | ["destinations-en:row-0","destinations-en:row-1","destinations-en:row-2","destinations-en:row-3","destinations-en:footer-skipped"] |
| inert-en | module/inert | T06-2 | ["inert-en:footer-skipped"] |
| neighbor-en | module/neighbor | T06-3 | [] |
| destinations-zh | module/destinations | T06-1,T06-2 | ["destinations-zh:row-0","destinations-zh:row-1","destinations-zh:row-2","destinations-zh:row-3","destinations-zh:footer-skipped"] |
| inert-zh | module/inert | T06-2 | ["inert-zh:footer-skipped"] |
| neighbor-zh | module/neighbor | T06-3 | [] |
| completion-normal | module/completion | T06-4 | [] |
| completion-legacy-missing | module/completion | T06-4 | [] |
| completion-legacy-false | module/completion | T06-4 | [] |
| completion-dated | module/completion | T06-4 | [] |
| completion-undated | module/completion | T06-4 | [] |
| source-empty | module/source | T06-1,T06-2,T06-5 | ["source-empty:footer-skipped"] |
| source-envelope | module/source | T06-1,T06-2,T06-5 | ["source-envelope:footer-skipped"] |
| source-legacy | module/source | T06-1,T06-2,T06-5 | ["source-legacy:footer-skipped"] |
| source-stale-date | module/source | T06-1,T06-2,T06-5 | ["source-stale-date:footer-skipped"] |
| source-unknown-date | module/source | T06-1,T06-2,T06-5 | ["source-unknown-date:footer-skipped"] |
| source-corrupt | module/source | T06-1,T06-2,T06-5 | ["source-corrupt:footer-skipped"] |
| source-unsupported | module/source | T06-1,T06-2,T06-5 | ["source-unsupported:footer-skipped"] |
| source-read | module/source | T06-1,T06-2,T06-5 | ["source-read:footer-skipped"] |
| recovery-quota | module/recovery | T06-6 | [] |
| recovery-throw | module/recovery | T06-6 | [] |
| recovery-missing-lock | module/recovery | T06-6 | [] |
| recovery-rejected-lock | module/recovery | T06-6 | [] |
| recovery-held | module/recovery | T06-6 | [] |
| recovery-baseline | module/recovery | T06-6 | [] |
| account-a-to-b | host/account | T06-7 | [] |
| account-logout | host/account | T06-7 | [] |
| account-generation-revocation | host/account | T06-7 | [] |
| account-late-completion | host/account | T06-7 | [] |
| account-stale-retry-export | host/account | T06-7 | [] |
| host-route-default | host/route | T06-8 | [] |
| host-route-wildcard | host/route | T06-8 | [] |
| host-route-disabled | host/route | T06-8 | [] |
| host-focus-cycle | host/focus | T06-2,T06-8 | [] |
| visual-1440x900-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1440x900-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-1024x768-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-768x1024-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-light-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-en-dark-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-light-compact-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-default-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-default-200 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-compact-100 | visual/visual | T06-8 | [] |
| visual-390x844-zh-dark-compact-200 | visual/visual | T06-8 | [] |
| tasks-test | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| tasks-typecheck | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| tasks-lint | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-host-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-types | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| web-lint | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| board-link | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| statistics-completion | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| storage-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| auth-provider-tests | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| rel03-host-boundaries | archive-command/command | T06-3,T06-4,T06-5,T06-6,T06-7,T06-9 | [] |
| actual-vendor | independent-actor/external | T06-10 | [] |
| fresh-final-astra | independent-actor/external | T06-10 | [] |
| web-build | archive-command/command | T06-8,T06-9 | [] |

All command arrays retained:

| Case | Exact pnpm arguments |
| --- | --- |
| tasks-test | `["--filter", "@repo/plugin-web-tasks", "test"]` |
| tasks-typecheck | `["--filter", "@repo/plugin-web-tasks", "typecheck"]` |
| tasks-lint | `["--filter", "@repo/plugin-web-tasks", "lint"]` |
| web-host-tests | `["--filter", "@repo/web", "test"]` |
| web-types | `["--filter", "@repo/web", "check-types"]` |
| web-lint | `["--filter", "@repo/web", "lint"]` |
| board-link | `["--filter", "@repo/plugin-web-board-workspaces", "test"]` |
| statistics-completion | `["--filter", "@repo/plugin-web-statistics", "test"]` |
| storage-tests | `["--filter", "@repo/plugin-web-storage", "test"]` |
| auth-provider-tests | `["--filter", "@repo/web-auth-device-session", "test"]` |
| rel03-host-boundaries | `["--dir", "packages/plugin-web-storage", "exec", "vitest", "run", "--config", "../../docs/reviews/web-account-data-isolation/host-review.config.mjs"]` |
| web-build | `["--filter", "@repo/web", "build"]` |

All59 control IDs: Q01, Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25, Q26, Q27, Q28, Q29, Q30, Q31, Q32, Q33, Q34, Q35, Q36, Q37, Q38, Q39, Q40, Q41, Q42, Q43, Q44, Q45, Q46, Q47, Q48, Q49, Q50, Q51, Q52, Q53, Q54, Q55, Q56, Q57, Q58, Q59.

## Appendix C. Complete MET matrix

All2437 original artifact obligations and2497 source closure entries remain normative in the fully verified manifests.

| Row | Contract | Kind | Permanent unit |
| --- | --- | --- | --- |
| M1-source | M1 | source | MET05/planned-source-qualification |
| M2-en-light-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-light-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-light-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-light-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-en-dark-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-en-dark-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-light-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-light-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-375 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-375-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-768 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-768-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M2-zh-dark-1440 | M2 | surface | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-sleep | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-water | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-exercise | M3 | pointer | MET05/planned-surface-pointer-positive |
| M3-zh-dark-1440-weight | M3 | pointer | MET05/planned-surface-pointer-positive |
| M4-en-weight | M4 | weight-positive | MET05/planned-surface-pointer-positive |
| M4-zh-weight | M4 | weight-positive | MET05/planned-surface-pointer-positive |
| M5-en-light-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-light-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-dark-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-en-dark-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-light-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-light-1440 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-dark-375 | M5 | keyboard | MET05/planned-keyboard |
| M5-zh-dark-1440 | M5 | keyboard | MET05/planned-keyboard |
| M6-en-direct | M6 | entry | MET05/planned-host-source-account |
| M6-en-rail | M6 | entry | MET05/planned-host-source-account |
| M6-en-cmdk | M6 | entry | MET05/planned-host-source-account |
| M6-en-sleep | M6 | entry | MET05/planned-host-source-account |
| M6-en-water | M6 | entry | MET05/planned-host-source-account |
| M6-en-exercise | M6 | entry | MET05/planned-host-source-account |
| M6-en-query | M6 | entry | MET05/planned-host-source-account |
| M6-zh-direct | M6 | entry | MET05/planned-host-source-account |
| M6-zh-rail | M6 | entry | MET05/planned-host-source-account |
| M6-zh-cmdk | M6 | entry | MET05/planned-host-source-account |
| M6-zh-sleep | M6 | entry | MET05/planned-host-source-account |
| M6-zh-water | M6 | entry | MET05/planned-host-source-account |
| M6-zh-exercise | M6 | entry | MET05/planned-host-source-account |
| M6-zh-query | M6 | entry | MET05/planned-host-source-account |
| M7-identity | M7 | account-source | MET05/planned-host-source-account |
| M7-mixed-source | M7 | account-source | MET05/planned-host-source-account |
| M8-retry | M8 | retry | REL-05/metrics-native-save-retry |
| M9-controls | M9 | qualification | MET05/planned-source-qualification |

All33 current control IDs: missing-sleep, missing-water, missing-exercise, enabled-sideeffect, suppressed-log, untrusted-dom, missing-weight, missing-log, selected-after, wrong-key, wrong-first-render, stale-document, noop-route, missing-rendered-record, normalization-write, archive-stream, archive-late-tar, resolver-name, resolver-outside, parser-idle, parser-truncated, page-exception, child-late-exit, child-retained-stream, task-cancel-join, partial-build, outer-wx, final-write, journal-flush, journal-close, artifact-missing, admission-replay, admission-m8. Original39 legacy artifact obligations, real corrupt-expected-source-hash and wrong-root pairs remain mandatory additions, not erased by this list.

## Appendix D. Complete canonical Clock r2 section14 (verbatim)

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


## Full source appendix 8 - Parent-only proposed outer capture impact, unadopted

Source 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12:docs/reviews/audit-parallel-shared-outer-capture-admission-impact-r1/impact.md; SHA-256 a75d114b1b3d724a0a2a8606d052849c7d13c1af96bb272d961c13f8353f4f14. Entire source begins below.

# SHARED / OUTER-CAPTURE-ADMISSION-IMPACT1

Verdict: CONDITIONAL FEASIBILITY PROPOSAL ONLY; CURRENT IMPLEMENTATION AND CALLER SOURCE3 ADMISSION BLOCKED. A genuinely separate root dispatch infrastructure phase can realize the already approved P-OUTER boundary only if a fresh FULL independent impact review agrees that the exact separation below does not change f667 design, and root then records the exact technical decision, finite source grant and cumulative-purpose history. This report grants nothing. Existing TASK/MET source cards cannot authorize it. If review finds the proposed boundary is an extra shared measurement implementation, shared-author4, caller-source work moved out to evade its cap, or a substantive P-OUTER change, disposition is BLOCKED at the original authority; there is no fallback exception.

## Fixed authority and independence

Module web (project-system), workflow A. Independent actor /root/parallel_a_outer_capture_admission_impact_r1; configured gpt-6-astra is a dispatch label, not provider or different-vendor attestation. Parent 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7; fixed input b21a2450e6d2607487ba3f5ae7663bdf7ad7c301; P0 f9eb4b1f207bc4b46f547b90afc250424b3c8695. Sole owned worktree /Users/lijinlong/.codex/worktrees/audit-parallel-outer-capture-admission-impact1-20261010/XAI_Desktop. No children, other worktree access, global writes, source edits, code, push, merge, rebase, release, deployment or D3 operation.

Read AGENTS.md, CLAUDE.md, project workflow/multi-machine policy, CURRENT-CONTROL-PLANE, original goal attachment, authority-overlay, goal-A and exact task-shared-outer-capture-admission-impact-r1.json. Authority-overlay permits technical revisions inside existing product authorization only after independent impact review. It does not waive immutable contracts, exhausted histories or author independence. Task registration is the dynamic execution-state.tasks LIST plus exact card, not an invented task-registry entry. Root is the sole scheduling/admission/adoption actor; original goal forbids root implementing or business-verifying a runner itself.

Full immutable corpus validation and precise output/input digests are recorded in the generated integrity receipt below. The full original files, not shortened prose excerpts, are normative. Bound sources include f667a0b6996b4039d2c4e5ca28657953703e830b full final five-row design, bdc06bd5b57f026caf6d7838563bfdae6f8684c9 full independent review, 6c3451eda23a90841db907502b647c53b43fe1a2 full byte review and 05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d original byte collection. Shared author3 is exhausted, not reopened here.

## Existing implementation inventory

| Fixed source | Observed source behavior | Admission consequence |
| --- | --- | --- |
| TASK f8821c1bb99a51f07a3e6d077bc3391affde7a99, run-unit.mjs runUnit | Parses card and manifest, reads executable hashes and root receipt before making outer directory/capture; captures its own JavaScript stream.write calls after that point. ownChild captures actual child pipes and owns groups, but does not enclose the earlier work. | Malformed card, imports and early allocation are outside its claimed capture. Patching stream.write is not a parent OS-pipe capture of all process bytes. Existing source2 is protected and cannot be relabelled outer infrastructure. |
| MET 624e016359a0b48662828ffc9cc15db453792278, launch.mjs | Static driver import precedes launch; git show and JSON.parse(cardBytes) precede directory allocation. Final stdout.log is serialized result JSON; stderr.log serializes collected errors. | These are derived summaries, not actual stdout/stderr. Source2 cannot establish the enclosing boundary or capture import/bootstrap errors. |
| Same MET qualification-runner.mjs | Imports driver before runQualification, writes terminal artifacts after owner.stop and propagates failures to launch. | Guard/owner lifecycle is inner machinery; it needs a parent that remains alive through final writes and real pipe EOF. |
| Root fixed control cards, scheduler, histories and leases | Declare reservations, hashes, actors and resource ownership. | Authority records do not implement process capture, deadline enforcement, descendant joins or durable terminal streams. |
| scripts/cowork/codex_wrapper.sh | Merges stdout/stderr through tee, uses temporary output and removes it; quota signal wrapper. | Not separate immutable streams or complete owned-process lifecycle; do not adopt or modify it. |
| scripts/cowork/dispatch_codex.sh | Fire-and-forget background dispatch, mutable last_run log, optional timeout, returns after dispatch. | Launch success is not real child exit, EOF/drain, quiescence or source admission. |
| scripts/cowork/run_spark.py | subprocess.run/CLI delegation with no P-OUTER immutable envelope/history/emitter protocol. | Generic delegation helper is not the missing implementation. |
| Proposed MET r3 root-supervisor.mjs; TASK r3 run-unit.mjs | Future exact output names in f667 section7. | No current source bytes, no qualified machinery, no existing root capture. |

The inventory is bounded to these fixed Git inputs, controller code surface and full inherited manifests. It is not a global absence claim about proprietary tool internals or every external system. No callable app/exec tool implementation bytes or durable root capture certificate were supplied. Their displayed output/session metadata cannot be invented into an admitted engine hash. No candidate is presently admissible.

## Legal separation and hard stops

f667 section5 expressly separates the pre-reserved outermost root envelope from the supervisor/inner launch. bdc 'Root supervision, exact emitters and missing-source prerequisites' requires existing machinery to be named, inspectable and hash-bound before final source3; it forbids root silently implementing it while recording adoption. 6c 'Required next evidence' admits collection of existing machinery, not new implementation. These are present holds, not an implementation grant.

The proposed distinct deliverable is root-owned dispatch infrastructure that is implemented and independently qualified BEFORE it is supplied as existing immutable machinery to either caller source3. It must contain no DOM/property recorder, SDK fixture, focus helper, business oracle or caller case runner. TASK's complete run-unit implementation and MET's complete root-supervisor/launch remain in their original final source sets. They integrate with an already established outer envelope; this phase does not write a fraction of their last source slot in another directory. One unchanged lifecycle protocol can span outer and inner processes; it must never become two independently reusable budgets or two competing owners of the same child.

f667 section3.3 'No extra shared implementation file' applies to the acquiring collector and its specified caller-local allocation. f667 section7 says caller measurement/host design can be materialized without a third shared implementation directory. The narrow proposed interpretation is that separate outer root dispatch machinery, already expressly required by section5, is infrastructure input, not a third shared collector. Fresh full impact review MUST test that interpretation against the entire five-row design and approve or reject it explicitly. This author cannot decide an ambiguity away or make root adoption retroactively authorize work.

| Question for independent review/root decision | Required answer before source grant | If not established |
| --- | --- | --- |
| Distinct purpose | Delivers generic root reservation execution/streams/lifetimes only; no I1, host, focus or caller source repair. | BLOCKED: shared author3/3 exhausted, f667 sections2/3.3/7; no author4. |
| Source boundary | Exact external root files below are separately granted, read-only dependencies to later caller12/MET16; no caller-local allocation moved out. | BLOCKED: current two-ADD card and f667 exact source sets grant no implementation. |
| Existing machinery prerequisite | Newly delivered exact code has completed full source review and actual independent qualification/review/root adoption before source3 receives it. | BLOCKED: bdc and 6c existing-capture prerequisites. |
| Budgets | Complete original purpose mapping proves this infrastructure phase is not a renamed already-consumed command/method/family. | BLOCKED: unknown/exhausted family; no declaration of zero. |
| Standards | No modified calibration, thresholds, source acquisition domain, activation, pixel function, original r2/G1 or product decisions. | BLOCKED: original goal/overlay and f667 full conditional basis. |

This creates no independent permission to revise cards. Only after this entire proposal receives fresh full independent review may root make an evidence-backed technical decision under the user's existing technical-revision authorization and register a precise later source phase. A request for owner/product policy changes instead blocks the affected descendants. Unrelated workflows continue.

## Finite prospective implementation boundary and public ABI

PROPOSED ONLY: nine exact ADDs under docs/reviews/audit-parallel-root-outer-capture-source-r1/: outer-entry.mjs; supervisor.mjs; ownership-protocol.mjs; qualification-fixtures.mjs; qualification-controls.test.mjs; execution-manifest.json; source.md; inputs.sha256; source.patch. No scripts/cowork, product, config, lock, global control or original runner edits. source.patch includes other eight complete files and self-excludes only itself. These names are a reviewable prospective scope, not paths written or granted by this report. Any required native helper/extra source/package changes invalidate this finite proposal and require the legal-boundary review again, never covert expansion.

| File / public interface | Finite responsibility | Protected boundary |
| --- | --- | --- |
| outer-entry.mjs CLI: exact reservation reference + digest + fixed paths | Node-builtins-only bootstrap; create exclusive outer namespace and real pipe files before child/card/import/compiler/archive work; spawn hash-bound supervisor and observe its actual exit/streams. | No product imports, inherited arbitrary NODE_OPTIONS/preloads/PATH fallback, caller card parsing before capture or root registry mutation. |
| supervisor.mjs supervise(reservation, channel) | Enforce admitted child requests, one total deadline/fence, owned process/group/start identities, resource/write joins and terminal protocol. | No business oracle, auth/DOM collector, focus or independent family consumption. |
| ownership-protocol.mjs | Versioned requestChild, registerResource, beginWrite/endWrite, fence, drain and terminal messages with monotonic operation IDs and root nonce; acknowledge ownership before work. | No wildcard command/file/path grant or unacknowledged detached allocation. |
| qualification-fixtures.mjs and qualification-controls.test.mjs | Finite disposable actual-process/filesystem/IPC causal specimens and exact integration qualifications below; no import-time execution. | Not substitutes for actual React+SDK/Vite/command/native qualification, which remains explicitly gated. |
| execution-manifest.json | Closed allowed argv/cwd/env/tool/source closure, resource and byte caps, output schema, causal controls, purpose-to-budget graph and original-to-emitter binding interface. | No runtime-discovered allowlist, synthetic permanent history or caller business PASS. |
| source.md, inputs.sha256, source.patch | Full source receipt/immutable dependencies/matrix/diff, every promised API and artifact emitter present. | No partial scaffold passed as complete source. |

ABI data binds reservation id and immutable root receipt; task/stage/actor lineage; full source/review/adoption and qualification digest chain; P0; exact caller source set/config/entrypoint digest; permitted command identity/argv/cwd/env; monotonic start and phase/teardown slices; resources (origin/port/profile/cache/archive/temp/output); exact output paths/maximum bytes; complete inherited purpose families; process start identity; source/API version. Local no-clobber claim is supplemental only. Root serial reservation consumes or records refusal under original scheduler semantics before dispatch. Copying a worktree or reservation cannot allocate twice; stale root history or absent authoritative reservation refuses.

Root's existing permanent control receipt/channel is the external trust boundary for allocation or entrypoint launch failure before a process exists. It can record a launch refusal and retain actual tool error/session bytes; it cannot claim stream capture or success it does not possess. If both local capture and root persistence fail, status remains UNKNOWN/BLOCKED. An unobservable launcher failure cannot be repaired by a retrospective success summary. The new outer-entry implementation must itself be hash-bound, source-reviewed and qualified including actual syntax/missing executable/cwd/pipe allocation failures; no infinite promise that a process can catch its own pre-existence failure.

## Enclosing lifecycle that the implementation must realize

1. Root reserves authority/history/resource namespace serially and preserves prelaunch receipt. Outer-entry takes only that small immutable bootstrap reference, validates its own builtin/runtime/input identities, makes canonical no-symlink/no-clobber outer paths and opens actual stdout/stderr/emergency channels. This is before parsing the inner card or loading supervisor/caller/Vite/compiler/archive/browser code. A bootstrap refusal is recorded as such, with launched=false only when no process was launched.
2. Outer-entry launches the exact supervisor as an owned child with OS pipes. Supervisor starts capture/ownership before any dynamic import of inner code. TASK run-unit/MET inner supervisor/launch then execute the approved caller-local code under the same root nonce/deadline. Actual direct fd writes, stderr tails and child exit/signal are retained; intercepting JavaScript write methods or returned JSON cannot replace them. Stream channels remain separate; cross-stream ordering is observed acquisition order, not invented total kernel write order.
3. Register process/group/start identity and parent operation before spawn/allocation. No detached worker gets permission to work until supervisor ownership acknowledgement; driver death during handoff cannot orphan Chrome/tar/osascript/server. Per-role lifetimes distinguish successful archive/build one-shot exit0 from premature server/browser exit0. Reused PIDs alone do not establish ownership; unrelated processes are never killed. Unknown/unjoinable descendants quarantine the namespace.
4. One monotonic deadline covers preimport, card/source parsing, streamed archive, dependency copy, compiler/server setup, browser bootstrap, action, capture, signal cancellation and all terminal writes. Exact phase ceilings and reserved teardown fit the already-approved total, rather than additive case+90s ignoring archive120s. Any larger total requires a separate explicit card decision. Synchronous work runs in an owned worker so supervisor remains able to cancel.
5. Fence new work/allocations first; cancel outstanding operations; TERM then KILL only admitted owned groups using finite grace/join limits. Continue other cleanup when one close fails. Join process exit AND stdout/stderr/CDP EOF/close; a descendant holding a descriptor after leader exit is still live capture work. Record after-last-command page/parser/idle/runtime faults, late stderr, canceled-then-late setup and unresolved handles.
6. Artifact ownership extends through actual short-write loops/fsync/close and their errors. Drain journals and pending writes before seal. Keep primary, cleanup, journal, stream and terminal errors together. Supervisor writes terminal plus complete hash index only after its internal quiescence; outer-entry then observes supervisor exit and every stream EOF, finishes own files and emits root-facing receipt. A terminal file cannot include its own hash: parent/root authenticates the final terminal hash after process/stream closure. A failed terminal write cannot leave an earlier PASS as the authoritative result.
7. Root accepts only after the outer process too has exited, full tool session output has drained and no owned writer/resource remains; compare reported and observed exits/digests. QUARANTINED_UNJOINED retains partial mutable evidence with unresolved handles. No immutable completion claim, overwrite, retry-in-place or reclassification of UNKNOWN is legal.

## Source consumption, loaded closure and original emitters

Before source3, require implementation commit/patch/hash set -> fresh independent full source review -> exact registered qualification input -> actual normal/fault raw evidence -> fresh independent full qualification review -> root exact-hash infrastructure adoption -> immutable read-only dependency supplied in the separately reviewed amended caller source cards. Thereafter each caller still requires its own complete source3, source-review3, actual acquisition qualification, qualification review and root method adoption before business evidence. Infrastructure adoption is not source3 approval, method adoption or caller acceptance.

Consume dependency files once to byte buffers, hash copied destination and retain package metadata/symlink containment and origin. Bind actual Node executable/runtime and builtin support, pnpm launcher AND implementation, git/tar/Chrome/osascript, controlled argv/PATH/env/cwd and interpreter closure. Input descriptor snapshot alone does not prove loaded browser source. Actual Vite browser/import conditions, resolution/optimizer inputs and outputs, transformed JS/CSS/assets and served/loaded modules must be source-grounded and contained in the admitted snapshot. Unknown closure edge or external cache/source escape refuses; no version-only ReactDOM forwarding or SDK endpoint proof.

Byte collection2 is a separate in-progress evidence collection family, not an input to this fixed review. No unprovided fresh bytes, completed capture, source count or collection result is claimed. Original collection1 remains four roots/104 files/7993322 bytes; 6c distinguishes wrong nested dependency lookup from missing installation. Five SDK sibling roots were identified by that historical review but uncaptured there. ReactDOM forwarding/untrack source is partial evidence; actual loaded source/configuration and native acquisition remain unqualified. Preserve original collection family cap3 and cumulative 24 roots/4096 files/32 MiB ceiling; this phase cannot reset or silently extend that collector.

Final caller emitter mapping remains entirely caller-owned: original obligation ID -> original path -> active lane -> source producer/export -> applicability -> finite destination -> control cause -> finalizer -> terminal digest. Preserve TASK original111 cases/4440 historical obligations plus112 active/5072 paths/64 visual tuples/59 controls and each original expectedP0FailureId/command/variant. Preserve MET89 rows/2437 obligations/2497 closure entries, original39 legacy control obligations and all current controls including restored bad expected source-hash and wrong-root. Outer infrastructure exports real stream/process/resource artifacts only and must reconcile every declared caller producer; it cannot fill absent business evidence. Genuine build.stdout.log/build.stderr.log must come from real build/setup pipes or exactly reviewed applicable reuse. N..139 unused focus slots require successfully closed cycle/census proof; interrupted expected stops remain MISSING/BLOCKED, no blank PNGs or fake terminal placeholders.

## Full normal and causal-negative qualification obligation

All rows below are prospective and UNRUN. No runtime grant follows from this report. Every negative uses an actual cause at the stated boundary, positive counterpart, raw invalid value/counter/ordered evidence, exact intended refusal and separate cleanup verdict. A fabricated result, unrelated nonzero or another failure is not detection success. Every specimen is a permanent purpose-counted attempt, including bootstrap refusals. Exact paths/subcases/commands/resources belong in the reviewed source manifest and later qualification card before launch.

| Pair | Positive normal path | Actual negative and required capture |
| --- | --- | --- |
| O01 bootstrap | Valid immutable reservation, writable exclusive root, child starts after pipes open | Missing executable/cwd, outer-entry syntax/import failure, pipe-open failure and outer allocation refusal; parent/root actual failure record, no fabricated stdout. |
| O02 card/import | Valid card and admitted inner import | Malformed/truncated card, missing or syntax-invalid caller source before main; actual enclosing streams and real exit. |
| O03 authority/replay | Correct full actor/review/adoption/history graph | Stale/copied reservation, conflicting role, forged hash-shaped receipt, unknown/exhausted family; authoritative refusal before action, consumed history unchanged. |
| O04 paths | Canonical no-clobber owned files and paths | Existing file, symlink/alias/parent traversal, wrong root/cache/temp path; no outside write and original bytes unchanged. |
| O05 raw streams | Exact binary stdout and stderr including direct fd writes and late tail | Real short write, ENOSPC/capture append failure or dropped channel; sticky capture failure, raw tail/partial inventory. |
| O06 archive/compiler | Real streamed immutable archive and actual build/setup exit0 | Real late tar failure and partial compiler/import/setup failure; true process logs, no synthetic build output. |
| O07 process lifetime | One-shot completes; server/browser lives until expected-stop intent | Server/browser early exit0, nonzero/signal and after-last-command stderr; distinct lifecycle fault, actual exit not launch return. |
| O08 EOF/descendants | All children and pipes close | Retained-pipe grandchild after leader exit, driver death before detached registration acknowledgement, late descendant; join/refusal and quarantined handles. |
| O09 signals/deadline | Work/teardown fits fixed total and controlled TERM closes | TERM-resistant owned group, late setup after cancellation, stuck synchronous worker, independent cleanup failure; finite KILL/join, no unrelated kill. |
| O10 final writers | Journal, outputs, fsync/close and terminal complete in order | Partial/zero write, flush/close/terminal error, delayed write after apparent completion; no authoritative stale PASS, no immutable claim while unresolved. |
| O11 fencing/resources | Exclusive profile/origin/port/cache/archive and acked operations | Concurrent reuse, work after fence, unregistered writer/child and external PATH fallback; precise refusal, other worker resources intact. |
| O12 loaded closure | Actual Vite React+SDK managed host with exact tool/browser/import/transform chain | Wrong-root package, mismatched export condition, optimizer cache escape, actual launcher fallback and SDK partial import; full source-chain refusal. Generic child cannot substitute. |
| O13 acquisition integration | Actual f667 P-HOST/P-LEDGER A01-A14 positive cases via complete admitted caller source | All actual synchronous property/DOM/native-event/epoch/reload/forwarding/restoration negative pairs, with immutable acquired evidence. Remains a separate later caller qualification dependency, not infrastructure-only PASS. |
| O14 native/focus integration | Genuine owned Chrome Retina/menu200 and authentic Appearance/target calibration under supervisor | Wrong window/tab/process, stale calibration, wrong mapping/descriptor, clipping or unstable capture; inherited actual native/focus family must be admissible first, otherwise BLOCKED. |
| O15 emitters/closure | Complete original-to-active artifact matrix with genuine producers and complete finalizer | Missing original control/stop/build artifact, duplicate ambiguous producer, partial lane mislabelled full PASS or late hash/write change; exact completeness refusal. |
| O16 root closeout | Supervisor then outer process/EOF/terminal all joined, root records actual final receipt | Tool session interrupt/lost exit/undrained tail or inability to preserve terminal; UNKNOWN/BLOCKED, never inferred exit0 or auto retry. |

O01-O12/O15-O16 can qualify only infrastructure's actual source-bound supported operations. O12 requires an independently admitted real fixture input; this phase may not author missing caller host/measurement code to make it run. Infrastructure qualification can establish envelope readiness while O13/O14 stay explicitly unqualified caller dependencies, but no report may claim the full P-OUTER integration or full five-row method is qualified until those integrations run under lawful original budgets. If separation creates a circular prerequisite requiring final source3 just to supply the promised pre-source3 root capture proof, reviewer must BLOCK the plan or require an already-existing separately admitted fixture; never consume source3 on a skeleton.

## Permanent budget provenance and independent roles

A new label is not a new allowance. Root must append a complete purpose graph linking original attempts, source/review actors, actual commands/suite members, each affected historical family, status and immutable receipt, including FAILED, REFUSED, UNKNOWN, aborted/no-output and pretool-versus-launched distinctions. Infrastructure source author count cannot be asserted zero without complete bounded history reconciliation and independent review of distinct purpose. If any proposed work is the exhausted shared-method design or TASK/MET source implementation, it inherits that actual cap and is BLOCKED. No carve-out can convert source-author3/3 into author4.

This impact is technical-impact iteration1/3 and one semantic static pass1/1. Separate prospective source author, source reviewer, infrastructure qualifier, qualification reviewer and technical acceptor must all be fresh independent actors with whole actual lineage checked; root schedules/adopts, never fills an implementation/verifier role. Source/fix corrections use min(remaining original purpose cap, 3-total actual attempts) with no retries after a failed static pass and no renamed zero. Qualification business/native/probe invocation counts remain separate and each maps to the full inherited family. Specific wall/phase/byte/process ceilings must be numerical and root-reviewed before any launch; no open-ended 120s-plus-case wrapper or assumed new three-run reserve is authorized by this impact.

Clock retention3/3 and visual3/3 exhausted; native/Clock histories unchanged; MET M8 UNKNOWN with known lower bound2, not exact used2; REL02+REL03 V1 UNKNOWN. TASK/MET source-author2 and source-review2 are consumed; last source3 HELD. Shared source-author3 exhausted, no author4. Prior author2 semantic/raw-unique failure, MET earlier static failure, all parser/non-UTF8/pretool/unknown attempts and overrun history remain immutable. Synthetic positive budget fixtures exercise refusal mechanics only and cannot mint live admission.

## Entire downstream contract remains required

All five rows remain conditional: P-HOST actual public AppProviders/Router/main startup, live non-null config, SDK HTTP/device/deletion/Todo/observability effects; P-ACT existing disposable test seam only, production canonical activation closed; P-LEDGER entire synchronous-acquisition-v1 and A01-A14; P-FOCUS authentic Appearance calibration and unchanged native-focus-context-v1 predicates; P-OUTER exact source/reservation/streams/lifetimes/emitters. None is replaced by envelope-only qualification.

Keep complete canonical Clock r2 contract SHA-256 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae and section14 E1-E25 AND all E24 rows AND Rules. E1-E5 precede implementation, E25 last; later evidence never replaces an earlier item. Preserve original12 F1 plus Appearance K-1/rail, Header host/native/Astra/Sol plus real refusal/capacity-copy diffs, dashboard widgets/grid/Web/CmdK/storage, AppRail eight Sol+host, Appearance full suites/host/package/OE, Features full suites/host/readers/package/frozen+C-FD1+C-RD1, More full suites/host/frozen+C-FB002, Sticky/Notifications/Date-Time/Smart-Lists/Collaborate/Pomodoro/settings-shell/rest. Exact native exclusions depend on original empty-diff/invariance conditions; affected shared changes trigger independently scoped native/F1/engine/hook/caller reruns.

Frozen Appearance whole file 5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4; full block e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43; pixelFocusWalk 1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620; probes 4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4 remain protected. SameSize/ownPixels>0/outline not none/ownDiff>0, <0.01 CSS alignment, original6 captures/120ms,120 double-rAF settling and140-bound full census remain; bandRatio<0.15 remains manual observation, not waiver. Genuine trusted keyboard/drag, no nativeVirtualKeyCode, Retina/menu200 and full independent visual judgment remain.

Preserve every original TASK/MET business/oracle/source/account/native/visual/fixed/candidate/integrated/affected G1 obligation. C-FB00210/10, OE26/26, C-RD1 15/15 remain judging expectations with frozen originals; C-FD1 14/15 judges nothing, original Features13/15 and Appearance24/26 remain historical. Actual different-vendor raw verdict, fresh separate full Astra caller acceptance, root append-only evidence reconciliation and fresh inventory/remote preservation remain after all earlier gates. Codex independence does not prove vendor diversity. No caller or audit item closes here.

## Actual scope, errors and closeout

All runtime/tests/build/lint/typecheck/browser/native/server/qualification/probes/vendor/children counts are 0. No source module, parser, compiler, test or supplied runner was executed. One static report/corpus validator is the only semantic pass. Read-only metadata discovery is not product qualification. Several overly large text reads were truncated; full input buffers are read/hash-validated by the sole checker and targeted source ranges were inspected. One discovery command chunk2062bb exited1 from a guessed nonexistent impact path; actual immutable commit filenames then resolved it. It was not a semantic checker launch or retry. Memory keyword lookup yielded no task authority and was not used for conclusions. Billing unknown, not zero.

Both complete output buffers and all inputs are validated before any allowed write; transport is ASCII with escaped data as needed. A real checker failure freezes the attempt with no retry. Only mechanical Git commit/status/digest checks may follow a successful pass. Exactly impact.md and inputs.sha256 are ADDs; command-local hooks disabled, exact staging, Why/What/Scope/Risk/Docs/Tests commit. No push or sync command under worker scope; root owns preservation/integration/ancestry/sync. Formal312 with13 completed/3 verification_pending/3 in_progress/293 pending,299 unclosed/939 evidence unchanged; normalized module counts differ from39 original_module labels; nonempty gate_obligations150 is not118. P0 executable parity permits exactly four TT docs and does not assert whole apps/packages equality.

Next gate: a fresh FULL independent impact reviewer must judge every section, complete f667/bdc/6c/caller/G1 source corpus and the proposed distinct-purpose/source/API boundary. Root then either records an exact limited technical adoption and registers a complete independently authored infrastructure source phase, or records the exact blocking authority. Until those two acts, no code/card revision or source3 release is authorized. Even after them all actual source/qualification/history prerequisites remain.

## Integrity receipt from the sole static pass

PID 95595; actual command: python3 - <<'PY' (full in-memory corpus/output validator retained in tool transcript). Static pass1/1; impact1/3.

Validated 2903 immutable identities / 93234576 bytes. Index SHA-256 bf4e9057bdde22b8003dbb2331308b1e8b86452ab6c902d0a242a6b63a6533fa. All full corpora: {"author1": {"raw": 2808, "unique": 2808}, "author3": {"raw": 2842, "unique": 2842}, "byte_review": {"raw": 2874, "unique": 2874}, "met": {"raw": 2663, "unique": 2651}, "review1": {"raw": 2821, "unique": 2821}, "review2": {"raw": 2863, "unique": 2863}, "task": {"raw": 477, "unique": 477}}. TASK/MET union2781.

All original111/4440 and active112/5072/64/59 TASK mappings and MET89/2437/2497 source closure checked; complete TASK12/MET14 source patches reconstruct exactly. Canonical full contract and E1-E25/E24/Rules match. Original104 embedded dependency payloads checked; no current provider-byte or collection2 claim. Root formal312/939, normalized/original modules,150 gate-obligation entries and exact four TT doc delta verified.

Inputs include full current control plane and original goal bytes. Report and index both fully buffered and validated before writes. Process final session/chunk/exit receipt is supplied in handoff after drain; no early claim of final process exit.

## Full source appendix 9 - Parent-only BRD-12 technical amendment, unadopted

Source 84f0048a74c34bfef2b463e3b525b514e67586d2:docs/reviews/audit-parallel-brd12-technical-contract-amendment-r2/contract.md; SHA-256 6d29bcaad40daaea334b4c8094e1ca386a9c74da6451255e4701badba0a0cca9. Entire source begins below.

# BRD-12 technical contract amendment r2 — complete conditional proposal

Status: PROPOSED / NEEDS FRESH INDEPENDENT FULL REVIEW. Module web; workflow C under the sole A-Codex controller. This is the complete BRD-12 contract amendment, not a reduced checklist-title correction. Nothing here grants product, test-source, runner, runtime, schema, key, API, migration or protected-path access. BRD-12 remains pending.

## 1. Fixed identity, precedence and authority

Author: /root/parallel_c_brd12_technical_amendment_r2. Sole checkout: /Users/lijinlong/.codex/worktrees/audit-parallel-brd12-technical-amendment2-20261010/XAI_Desktop. Direct parent bd4dce4aa7a5b96d533b7a570b5bfb97843f392b; fixed input b52b5da64f1c7ff355b41e49d7972b6c8e8703d1; immutable runtime P0 f9eb4b1f207bc4b46f547b90afc250424b3c8695. Registration is the exact parent task-brd12-technical-contract-amendment-r2.json and execution-state.tasks entry, not the initial three-item registry. Card model gpt-6-astra is configuration, not provider attestation.

Full immutable sources: preparation2 5fa4cccb106d10e16562e0a8d6f3b103495607b1 (15257 identities), full review2 cdb8820b434aa7f2adb9cc5ad5f14118eb24230c (20349), lifecycle impact1 11d6527709a5a735200151768296a312a3a30314 (25632), and fresh lifecycle review1 68d0f14b243a1becb70811ca01a503cdcd244022 (30933). The exact complete documents are retained below as historical source annexes. Their historical headers, receipt wording and old conditional path protections describe those versions, not this author's status. No earlier failed pass is repaired by this amendment.

AGENTS, CLAUDE, project workflow/multi-machine rules, original goal attachment, authority overlay, goal-C, scheduler, card and current control were inspected. Original goal remains hash 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. Explicit no-push/no-global-write bounds govern this worker; root owns durable remote preservation, receipt and sync. Memory lookup found no relevant BRD authority; no memory draft is an artifact or an adopted input.

Original action: Checklist旧计数迁移与Done自动勾选规则明确化. Acceptance: 不生成看似真实的Item1标题；自动勾选可解释并可撤销. P2 / 决策 / web / 当前范围; sources 02-tasks-time-boards.md;05-visual-ux-audit.md; original evidence empty. The original complete B01–B12/R01–R12 and 24 conditional paths remain obligations. Finite T1–T4 approval is a technical design basis only. QL/QU are not renewed owner gates; no product rule change or new irreducible owner decision is proposed.

This amendment specializes four source gaps: T1 replaces the insufficient hook-only Board lock with account-L then sorted dataset-K participation; T2 makes immutable X and separate terminal U explicit; T3 makes migration/rollback/import and backward decoding explicit; T4 extends pre-first-effect and above-account-unmount protection through exact proposed public boundaries. It preserves all business, evidence, refusal and budget requirements. Any other conflict between this proposal and an authoritative requirement blocks adoption; a reviewer must not silently repair it.

## 2. Exact selected future scope and protected boundaries

Only this contract.md and inputs.sha256 are writable now. The generated selection table below freezes the complete selected future union: all 24 original conditional paths, the impact's 40 narrow additional source candidates, nine additional test candidates and seven owning-document candidates. They are selected because W01–W21 and T1–T4 require the corresponding boundaries, not because prior review granted edits. The exact set and existing-versus-ADD status are checked against fixed source. There are no guessed extra paths and no wildcard grant. A later implementation card may grant only reviewed paths with valid before and semantic-lock admission; partial implementation cannot claim full writer closure.

All candidates stay protected until fresh full review and explicit root adoption of this exact revision. The 40 additional paths retain their source-grounded single responsibilities in the selection table and W01–W21 annex. The nine tests are future source files only; their proposed purpose is stated in section 9. The seven docs define cross-package public behavior; the original eight checklist/automation docs remain selected. No new package, dependency, runtime flag, service worker, router topology, settingsDeparture, usePref, Task store/schema/activation, Calendar consumer, auth backend, Desktop adapter, cloud sync, registry key or shared/local CSS/tokens is selected.

Single semantic writer reservation covers xai_boards_v2 representation, ordinary mutation, completion/inverse, task-link Board phases, import/export and relevant Board lifecycle. It excludes concurrent BRD-18, BRD-28, ordinary-field/list-lifecycle changes and shared storage/account/host changes affecting these contracts. Separate worktrees do not prove semantic independence. Changes outside the exact future set require a new finite impact, independent review and root adoption; no automatic source repin/rebase or completion-based scope expansion.

## 3. Business behavior and current-source attribution

Array presence, including an empty array, takes precedence over aggregate counts. Real stored IDs/text/order are never inferred or removed from their resemblance to Item 1 or legacy-*; materialized provenance without evidence stays unknown. Absent array plus safe aggregate knows only done/total, not titles, row identities or first-N flags. Both modal getChecklistItems and recovery checklistItemsFor stop synthesis together. No allocation proportional to total is permitted. Truthful legacy summary and source recovery remain visible.

Explicit user-authored conversion previews exactly new real rows and resulting current progress, preserves original and immediate pre-conversion aggregate pairs, and records C. Empty conversion requires explicit preview acceptance. Cancel/error changes nothing. Auto-completing legacy 1/3 to 3/3 does not invent rows; later conversion keeps both pairs but cannot execute the old inverse across representation replacement. A count cannot recover missing history.

Preserve semantic Done key/name rules, archive exclusions, mount/day per-live-mount scheduling, genuine later manual click and actual cross-list moves to or from Done. A move applies the preset across the moved Board, including other Done cards, with sortDueDates:false. Same-list or invalid move does not create that trigger. No new midnight scheduler, configurable rule, persistent suppression flag or history expiry. Preserve original urgent and sorting behavior.

Freeze Praw before mount and Pmount separately. Attribute completion, actual incidental normalization, movement, urgency and sorting independently using P0 counters. completeCard's normalized temporary object is not proof the transformation persists: applyBoardAutomationLite may retain original cards when no completion/sort selects transformedCards; sibling completion can make incidental normalization persist. No unconditional normalization cleanup. Real [true,false,false] owns only two false-to-true flags and any absent/falsy marker-to-T; T0/manual true are preserved. Marker-only X is legitimate; actual no-op automation writes nothing and mints no receipt.

Undo is for one named X across all of its actual completion deltas. It never restores raw whole-Board snapshots, stale derived counts, move/sort/urgent/attachment-normalization effects or unrelated edits. Current real arrays determine progress after U. Same-mount U retains consumed board/day scheduling; rerender is not a new trigger. Later genuine mount/day/manual/move Y remains normal automation, with its own preimage. X→U→Y and undo-Y are separately explainable.

## 4. Proposed exact wire protocol and backward decoding (T2)

All following names are proposed for fresh review. Keep BOARD_STORAGE_KEY xai_boards_v2 and existing Board[] or kind xai.web.board.storage / schemaVersion 1 envelope. No second recovery key; no Task/Calendar command envelope. Board.checklistRecovery is optional solely for pre-tracking legacy data. Once present, null, collision, unknown kind/version, unknown protocol property or invalid shape refuses mutation and preserves opaque raw export. Absence alone allows initial enrollment as part of a real admitted mutation; a no-op does not write a baseline capsule.

Wire values are JSON only: finite safe integer counters/indices, nonempty IDs, lowercase 64-hex SHA-256, UTC ISO timestamps and explicit nullable fields. Generated lineage/entity/operation IDs are UUID strings checked for collision under lock. Unknown real envelope/Board/list/card/item properties remain losslessly preserved; protocol objects reject unknown properties. Duplicate JSON keys in new protocol bodies are invalid. Malformed/unsupported stored values are readable as raw recovery, never normalized or seeded.

Exact capsule field set:

    ChecklistRecoveryV1 = { kind: 'xai.web.board.checklist-recovery', schemaVersion: 1,
      lineageId: Id, boardIncarnation: Id, head: Id | null, journal: Entry[],
      entities: Entity[], writers: Writer[], terminal: Terminal[], retainedSources: Source[] }
    Entry = { id: Id, previousId: Id | null, kind: Kind, body: string, sha256: Hash }
    Kind = 'baseline' | 'ordinary' | 'conversion' | 'completion' | 'inverse' | 'import' | 'restoration'
    Entity = { entity: 'board' | 'list' | 'card' | 'row', id: string, incarnation: Id,
      parentIncarnation: Id | null, state: 'live' | 'deleted', writer: Token }
    Token = { entryId: Id, fieldIndex: number }
    Coordinate = { incarnation: Id, field: 'existence' | 'parent' | 'representation' |
      'done' | 'aggregate' | 'completedAt' | 'archived' }
    Writer = { coordinate: Coordinate, token: Token, value: Presence }
    Presence = { present: false } | { present: true, value: Json }
    Terminal = { completionId: Id, inverseId: Id }
    Source = { id: Id, mode: 'legacy' | 'foreign' | 'replacement' | 'restoration',
      owner: HistoricalOwner | null, physicalKey: string | null, raw: string, sha256: Hash,
      executable: false }

Entity incarnation is immutable, while current parent and state are reconstructed from journal deltas. Moving a live card between lists updates parent without replacing incarnation; deleted/re-added entities always allocate a new incarnation even for identical visible IDs. Board IDs are unique in dataset, list/card IDs unique in their Board addressing domain, row IDs unique per card. Duplicate ambiguous addressing refuses the entire mutation. Deleted descriptors remain at surviving Board level. Visible IDs or array positions never establish continuity.

Journal body is an immutable exact JSON string, serialized once and hashed over its UTF-8 bytes. Existing body strings are copied byte-for-byte forever until an explicitly authorized destructive scope removes them. SHA-256 is consistency evidence, not authentication or live authority. Journal is an ordered linear chain, unique IDs, previousId equal immediately prior ID, head equal last entry (null only with empty journal). Every token resolves to an existing entry and actual field coordinate; terminal is the exact projection of inverse records, unique per completionId. U appends an entry and terminal link and never rewrites X. Imports/restorations cannot turn a terminal X back into pending.

Body grammar common to every Kind:

    Body = { version: 1, operationId: Id, owner: HistoricalOwner, recordedAt: Iso,
      priorHead: Id | null, sourceRawSha256: Hash, projectionSha256: Hash,
      entityChanges: EntityChange[], fields: FieldChange[], details: Details }
    HistoricalOwner = { kind: 'account' | 'demo', accountId: string, generation: string,
      physicalKey: string, epoch: number }
    EntityChange = { incarnation: Id, entity: 'board' | 'list' | 'card' | 'row',
      id: string, before: Entity | null, after: Entity }
    FieldChange = { coordinate: Coordinate, before: Presence, after: Presence,
      previousWriter: Token | null, effect: 'completion' | 'manual' | 'derived' | 'lifecycle' }

Entry.id equals Body.operationId; Body.priorHead equals Entry.previousId. EntityChange.before/after cannot recursively contain journal bodies: their Entity.writer tokens refer to earlier/current entry IDs only. FieldIndex is the exact zero-based index of fields, with no duplicate coordinate per entry. Baseline initializes all actual entities and relevant current field values as newly observed, never historical manual/automatic provenance. Ordinary operation fields include every relevant declared touch, even equal-valued manual done, plus any actual lifecycle/representation change. No true unrelated no-op steals a done token.

Details is a strict kind-discriminated object, not a free-form metadata escape:

    baseline: { type: 'baseline', provenance: 'observed-current', sourceFormat: 'legacy-array' | 'v1-envelope' }
    ordinary: { type: 'ordinary', intentId: Id, draftRevision: number, intentKind: string,
      declared: Coordinate[], projectionChanges: ProjectionChange[] }
    conversion: { type: 'conversion', previewId: Id, originalAggregate: Aggregate | null,
      immediateAggregate: Aggregate | null, authoredRows: Row[], acceptedEmpty: boolean }
    completion: { type: 'completion', rule: 'automation-lite-v1', trigger: Trigger,
      targets: CompletionTarget[], projectionChanges: ProjectionChange[],
      counters: { completedCards: number, urgentLabelsAdded: number, sortedLists: number,
        rowsChanged: number, aggregateChanges: number } }
    inverse: { type: 'inverse', completionId: Id, completionSha256: Hash,
      targets: Coordinate[], projectionChanges: ProjectionChange[] }
    import: { type: 'import', sourceIds: Id[], replacedLineageIds: Id[], lossPlanId: Id | null }
    restoration: { type: 'restoration', sourceIds: Id[], retired: Terminal[],
      transition: 'same-account-forward' | 'prior-projection-restore', lossPlanId: Id | null }
    Aggregate = { done: number, total: number }
    Row = { id: string, text: string, done: boolean }
    Trigger = { type: 'mount' | 'manual' | 'cross-list-move', id: Id, boardId: string,
      localDay: string, liveMountId: Id | null, sourceListId: string | null, targetListId: string | null }
    CompletionTarget = { cardIncarnation: Id, listIncarnation: Id, representation: 'rows' | 'aggregate' | 'none',
      beforeRows: { id: string, incarnation: Id, done: boolean }[] | null,
      beforeAggregate: Aggregate | null, beforeCompletedAt: Presence, completionFieldIndices: number[] }
    ProjectionChange = { incarnation: Id, path: string[], before: Presence, after: Presence,
      effect: 'completion' | 'normalization' | 'move' | 'urgent' | 'sort' | 'ordinary' }

intentKind is restricted to the finite command vocabulary in section 5; other strings refuse. Projection paths are literal own-property segments validated against that command's permitted fields, never evaluated expressions or prototype traversal. Full source rows remain elsewhere in the source/projection; beforeRows freezes actual finite identities and flags only, preserving genuine unknown metadata in current data. Completion fields and actual projection deltas must agree. Count values satisfy safe integers 0 <= done <= total; row-derived aggregate uses actual array. Presence distinguishes absent, null, empty string, false and every admitted prior value; completedAt admission follows original shape and preserves falsy prevalues exactly.

Canonical projection digest is UTF-8 JSON of recursively sorted own object keys and ordered arrays after omitting only checklistRecovery from each Board. Body serializer uses the same deterministic JSON grammar; existing raw storage formatting is retained as source evidence. Codec rejects duplicate keys in protocol, non-JSON values, cycles, unsafe numbers and unsupported structures. A source-reviewed synchronous SHA-256/serializer implementation belongs in checklistRecovery.ts; no asynchronous crypto inside final read/transform/write/readback segment and no unreviewed new dependency.

Whole admission validates every Board, envelope, capsule, chain, token, field value, terminal link and imported source hash, not only selected card. Replay validates the tracked ownership projection against current entity mapping/relevant fields; unrelated unknown metadata is carried through. A replaced full source with unexplained ownership mismatch is conflict. Token equals X alone is insufficient without same incarnation, current postvalue and continuous validated chain.

retainedSources stores exact nonrecursive originals needed for legacy/foreign/restoration explanation. If input already contains retained sources, flatten them by stable ID/hash into the destination set and retain its original protocol entry strings, not repeated nesting of the full receipt-bearing dataset. Same ID/different bytes refuses; duplicates with equal bytes are retained once with all required references. No historical source becomes executable. Required missing/unreadable source refuses restoration. This is not a claim arbitrary external ABA can be detected.

Finite capacity has no expiry, count-based eviction or unlimited-retention promise. Allocate only from actual finite input entities/deltas/history, never aggregate total. Validate and serialize the complete proposal before one storage write. Representation/allocation/serialization failure or platform quota refuses the entire new projection, preserving old bytes and pending recovery. No silent truncation, pruning or write-without-receipt. A later numeric implementation safety cap that changes admitted business input requires explicit reviewed amendment; this contract does not import Task MAX_RECEIPTS as a Board rule.

## 5. Proposed public API, errors and all writer admission (T1)

Storage owns account locks, physical IO, the lexical raw-commit capability and a narrow protected participant registry. Board core owns codec and commands. Public imports use package barrels; storage must not import Board business code. Exactly one deterministic Board participant is registered eagerly before any account-management route, via the Board public barrel/host bridge. Duplicate identical registration is idempotent; disagreement or missing participant refuses protected mutation/migration. No serialized capability, boolean bypass or generic next-value setter.

Proposed public signatures (readonly inputs throughout):

    registerProtectedDatasetParticipant(key: 'xai_boards_v2', participant: BoardDatasetParticipant): void
    mutateProtectedDataset(input: { key: 'xai_boards_v2', scope: AccountScope,
      intent: BoardIntent, expectedRaw: string | null }): Promise<BoardMutationResult>
    prepareProtectedDatasetLoss(input: { scope: AccountScope, cause: LossCause,
      targetIds: readonly string[] }): Promise<LossPreparationResult>
    commitProtectedDatasetLoss(input: { scope: AccountScope, plan: LossPlan,
      decision: LossDecision }): Promise<LossCommitResult>
    registerDatasetLifecycleParticipant(participant: DatasetLifecycleParticipant): () => void
    requestDatasetLifecycleDeparture(input: { scope: AccountScope, reason: DepartureReason,
      operationId: Id }): Promise<DepartureDecision>
    mutateBoard(input: { scope: AccountScope, intent: BoardIntent, expectedRaw: string | null }): Promise<BoardMutationResult>
    decodeChecklistRecovery(raw: string | null): BoardDecodeResult
    inspectBoardInverse(input: { decoded: AdmittedBoardValue, completionId: Id }): InverseInspection

AdmittedBoardValue and loss capabilities are opaque in-memory branded objects created only by the validating owner, never trusted merely from structural JSON. Public boundaries revalidate runtime data even when TypeScript is satisfied. All participant functions validateWholeRaw, applyIntent, verifyReceipt and prepareMigrationCandidate are synchronous, side-effect-free over captured inputs; they return typed plans or refusals. Storage performs physical writes only after validating the output and exact scope. Participant callbacks never acquire locks, await, emit events or call public mutation APIs.

BoardIntent is a finite discriminated union with a common operationId, draftRevision, captured target IDs/incarnations and declaredCoordinates. Kinds: seed, ordinary, create-board, create-list, create-card, append-row, append-attachment, append-activity, convert-checklist, complete, inverse, delete-board. ordinary action is one of board-metadata, label-create, label-edit, label-delete-strip, member-create, member-edit, member-delete-strip, list-metadata, list-move, list-archive, list-restore, list-delete, card-fields, card-move, card-archive, card-restore, card-delete, row-text, row-done, row-remove, row-order, task-link-pending, task-link-ack. Each carries only the minimal captured requested values, not a captured full Board replacement. Destructive kinds additionally require exact loss-plan capability where successful history could be lost. Other ordinary deletions preserve the capsule/descriptors. No unregistered generic patch can alter capsule or arbitrary nested paths.

BoardMutationResult is exactly verified {status:'verified', operationId, physicalKey, raw, changed, acknowledgement:'committed'|'already-recorded'|'no-op'} or refused {status:'refused', operationId, reason, rawSource, proposalRaw, receiptState, details} or uncertain with the same recovery fields and status:'uncertain'. rawSource/proposalRaw are string|null; receiptState is absent|present-compatible|present-conflicting|unreadable; details contains safe coordinate/reason strings and is masked outside owner. User-visible success derives only from verified. Refusals never clear latest draft; uncertain retains stable ID/time/source/proposal.

Reason vocabulary: account-changed, marker-changed, deleted, deleting, lock-unavailable, lock-failed, participant-missing, participant-conflict, unsupported, invalid, missing-data, duplicate-identity, conflict, not-found, quota, capacity, serialization, storage-unavailable, readback-uncertain, export-unverified, plan-stale, legacy-authority-required. Decode returns absent|valid-untracked|valid-tracked|invalid|unsupported|unavailable with raw preserved when readable. Presence of invalid bytes is never absent. Set failure is quota/storage refusal unless subsequent read proves uncertain; write succeeded but exact readback/owner check unavailable is uncertain. No raw data or owner A detail is published to B.

Normal commands capture actual immutable AccountScope handle/epoch, physical key, auth origin and intent revision synchronously and register pending recovery before first await. Acquire L = accountLifecycleLockName(accountId,demo) shared, generation excluded; then all required existing physical-dataset K locks exclusive in lexical lock-name order. Board uses prefMutationLockName(full physical key); workspace membership uses its existing key lock in the same ordering. Never K→L; never reacquire L from a held L/K callback. Migration/restoration/reset/erasure takes L exclusive. Only the existing deletion-workflow path may take its existing workflow lock before L.

After L grant, each K grant, every actual await, before write and before publish, check same live handle, full committed-generation marker, same physical key, no deleted or pending-deletion fence, target incarnation, intent revision and admitted build. Final read/validate/derive/serialize/set/readback is synchronous. Release in finally, including refusal. Exact serialized readback and final owner/marker checks precede same-tab publication, trigger consumption and draft acknowledgement. Current-source intent derivation preserves unrelated fields and later changes; expectedRaw is a conflict fence, not compare-and-swap.

Generic setPref/removePref and mutatePref reject Board replacement/removal before equality fast paths; createScopedStorage rejects every Board setter/remover including injected stores and coordinated variants. usePref reads remain. Alternate core/views BoardModule writers are adapted, including queued seed, not assumed unreachable. All UI callbacks await typed completion; Promise truthiness cannot clear creator/composer/settings/dialog inputs. Board creation retains separate save-then-selection recovery, revalidates created Board/workspace/owner after await, and never claims cross-key atomicity.

Task link remains a three-phase saga: (1) L shared + Board K persist pending Board link with W and readback; release. (2) mutateCanonicalDataset acquires L once then sorted canonical Tasks lock and Board K; its new optional readParticipants: readonly {key:'xai_boards_v2', expectedIncarnation:Id, intentId:Id}[] supplies same-scope validated read locks, and an optional validateReadParticipants callback receives immutable snapshots synchronously immediately before Tasks write. No caller-supplied account/lock names; no nested Board API. Default absent option preserves old behavior and canonical activation remains disabled as before. (3) after await recapture no authority: reassert original scope, acquire L+K anew, revalidate live card/pending link/Tasks result and write acknowledgement only. Partial task creation remains recoverable, retry reconciles task identity without duplicates; A→B or re-added card cannot get stale acknowledgement.

Whole-operation U admission examines every X-owned completion field across every target before any write. Every target must be continuously tracked, live/unarchived, same incarnation, current value equal X postvalue and last relevant writer still X. One conflict refuses all U with reasons and no inverse writes. A same-value manual done command retires X ownership. Preserve manual true, T0, later text/date/order/priority/labels/moves and newly added distinct rows; deleting unrelated original-true row is not resurrection or automatic conflict. Deleting/re-adding an X-owned row or changing representation blocks U. Archive can regain eligibility only with proven unchanged continuous entity and relevant ownership; restoration/replacement allocates new ownership.

Uncertain retry first reads: exact receipt plus valid successor chain acknowledges with zero writes even if current projection is later; absent receipt plus exact original source may retry same ID/time/delta. Conflicting receipt, incomplete chain, changed target/marker or unreadable source retains conflict/uncertainty. A new current-source attempt requires explicit reconstruction; no stale full-array retry. Repeat U sees terminal link and returns already-recorded without another inverse. No-op Y cannot seize X fields; genuine later completion Y uses new preimage and writer tokens.

External admission remains UNPROVEN: every same-origin Board-writing old/cached client must actually be quiescent or reloaded to the admitted build before first capsule write and native acceptance. Two cooperative tabs, source search, a local lock or digest cannot prove this, and cannot detect uncooperative byte-identical ABA. No service-worker change is selected. Missing quiescence blocks the affected admission; no local hash assertion pretends to solve it.


### 5.1 Participant result grammar and capability limits

    BoardDatasetParticipant = { key:'xai_boards_v2', protocolVersion:1,
      validateWholeRaw(input:{raw:string|null}): BoardDecodeResult,
      applyIntent(input:{value:AdmittedBoardValue, intent:BoardIntent, owner:HistoricalOwner,
        markerRaw:string}): BoardProposalResult,
      verifyReceipt(input:{value:AdmittedBoardValue, operationId:Id, expectedBodySha256:Hash}): ReceiptCheck,
      prepareMigrationCandidate(input:{mode:'same-account-forward'|'foreign-replacement'|'prior-projection-restore',
        sources:readonly RecoveryTarget[], owner:HistoricalOwner, lossPlanId:Id|null}): MigrationCandidateResult }
    BoardProposalResult = {status:'proposal', raw:string, operationId:Id, bodySha256:Hash|null,
      changed:boolean} | {status:'refused', reason:Reason, details:readonly string[]}
    ReceiptCheck = {status:'absent'} | {status:'compatible', terminalInverseId:Id|null}
      | {status:'conflict', details:readonly string[]}
    MigrationCandidateResult = {status:'candidate', raw:string, retainedSourceIds:readonly Id[]}
      | {status:'refused', reason:Reason, details:readonly string[]}
    LossPreparationResult = {status:'prepared', plan:LossPlan, bundleRaw:string, bundleSha256:Hash}
      | {status:'refused', reason:Reason}
    LossCommitResult = {status:'completed', planId:Id, removedKeys:readonly string[]}
      | {status:'refused', planId:Id, reason:Reason}
      | {status:'partial', planId:Id, removedKeys:readonly string[],
        refusedKeys:readonly string[], unattemptedKeys:readonly string[], reason:Reason}

Reason is the finite vocabulary in section 5. None of these serialized records alone is a raw write capability. Loss commit dispatches only the plan's finite cause to its registered storage-owned action; it never accepts arbitrary callbacks, storage objects, account IDs, next values or lock names as an authorization bypass. The in-memory capability is held in a private WeakMap/closure keyed by the exact returned plan object, bound to captured handle/target digest/decision and consumed once. Parsing an exported plan does not reconstruct it; deliberate legacy/server-confirmed resume validates durable authority through its separate named deletion path.

The canonical read-participant extension freezes the optional callback signature validateReadParticipants?: (snapshots:readonly {key:'xai_boards_v2',physicalKey:string,raw:string|null}[]) => {ok:true}|{ok:false,reason:'invalid'|'not-found'|'conflict'}. Storage validates/locks the declared keys under the original scope before supplying snapshots. Board's callback fully decodes them and checks exact pending intent/incarnation. Existing mutateCanonicalDataset return type remains unchanged; Board participant failures map conservatively to its existing invalid/not-found/conflict/recovery-required reasons, with detailed Board recovery retained separately. Its callback cannot write and must not await; same-scope Board K is acquired before callback execution in the common sorted order.

DatasetLifecycleParticipant is {key:'xai_boards_v2', capture:(input:{scope:AccountScope,reason:DepartureReason,operationId:Id})=>CapturedDeparture, resolve:(captured:CapturedDeparture)=>Promise<DepartureDecision>}. capture reserves first intent synchronously before requestDatasetLifecycleDeparture returns its Promise; CapturedDeparture is opaque and account-bound. Re-registering the host view does not discard registry intents. Unregister affects that view subscription only. Missing lifecycle participant refuses actions with Board data/history/pending intent; only an under-lock complete absence proof permits an empty no-loss action, never a convenient read failure.

## 6. Migration, import, export and irreversible-history retirement (T3)

Board's current migration validator is isBoardArray while its storage reader supports both arrays and v1 envelopes. The replacement participant validates the whole storage shape, all copied Board records and history, including previous-generation copiedSource when selectedKeys contains no Board. Missing participant, unsupported capsule or invalid copied Board refuses before marker visibility. Retain exact source/archive/journal and source reread after secrets stage/verify awaits. Candidate readback and final source/marker checks precede marker-last commit.

Migration mode same-account-forward preserves exact immutable entries/terminal links and continuously proven incarnation/ownership chain, with a new restoration transition record linking source generation/marker. Historical X owner fields are never rewritten. A new A' inverse captures A' live authorization, not stale A handle. Owner-name equality alone does not establish continuity. Ordinary reload is not an import.

Mode foreign/unassigned/file replacement archives original bytes/capsules, allocates fresh local lineage/entities/writers, and stores imported X/U as non-executable history. Matching account strings do not activate imported tokens. Replacing local information requires exact loss-plan decision; local terminal retirement is retained in the archive/new history. Existing pure constructors stay pure: no live file-import caller is invented; any future caller must go through the protected replacement/migration boundary. Current public import helper returns a decoded candidate labeled historical-only, never a write capability.

Rollback is forward restoration into a fresh generation, never direct re-exposure of the previous committed marker. It takes exclusive L, captures current+selected-prior histories and all retirement links, validates a lossless union (same ID/different bytes refuses), and creates fresh incarnations/writers for replaced entities. Preserve all reachable sources; missing/unreadable needed history refuses. Candidate readback/after-await source checks and marker-last visibility apply. Old U stays terminal; no marker rollback revives executable old X. No in-place rewrite of archived generations.

Proposed backward-read table: old raw Board[] and old v1 envelope without capsule remain readable and mutation-admissible only after full current-domain validation; absent key permits only explicit stable-absence seed under locks; empty/invalid/unsupported remains raw recovery and no automatic seed. V1 capsule valid permits mutation under current authority. Unknown/colliding capsule permits diagnosis/opaque export and no mutation. Old logical/Board export v1 without capsule remains readable if fully coherent; v1 with capsule requires complete codec validation. New protocol unknown fields/version refuse mutation without destructive rewrite. No downgrade emits a capsule-free supposedly reversible value.

Existing createBoardExportPayload/readBoardExportPayload/boardImportStorageValueFromPayload signatures retain typed valid/invalid behavior, add explicit candidate historical-only classification for the import result, and do not acquire authority. StorageValue/boards/logical Board payload/list/card/count projections must be losslessly semantically equal, allowing documented export timestamps only. Unknown envelope metadata stays in storageValue; full raw companion preserves exact raw bytes. Reject contradictory duplicate projections even when IDs match. Logical-only output cannot claim full reversible roundtrip.

Proposed BoardRecoveryBundleV1 exact top-level fields: {kind:'xai.web.board.recovery-bundle', version:1, planId, createdAt, owner:HistoricalOwner, cause:LossCause, markerRaw:string|null, targets:RecoveryTarget[], pending:PendingExport[], manifestSha256}. RecoveryTarget is {physicalKey, raw:string|null, sha256:string|null, role:'current'|'prior'|'candidate'|'archive'|'marker'|'retirement'}; null is proven absence, never unreadable. PendingExport is {operationId,draftRevision,sourceRaw,proposalRaw,receiptState,intent} with available raw nullable values and validated finite BoardIntent. Manifest digest uses deterministic JSON of all fields except itself. Whole bundle digest is SHA-256 of final exact UTF-8 download bytes. Read denied targets cannot be falsely declared complete; opaque available bytes remain individually exportable.

Account-prefix deletion bundle enumerates every actual Board record in current/prior/candidate generations and referenced archives/marker/retirement needed for those histories, not merely current-generation export. Target inventory is frozen and rechecked under exclusive L before destruction; new/missing/changed target invalidates plan. Only Board-related raw recovery and allowed metadata are included, with existing credential exclusions, no secret values or other-account export. Current exportAccountLocalData remains a current-generation export and never gains a false complete-account-history label.

## 7. Exact lifecycle preflight and durable deletion fence (T4)

BoardRecoveryHost is mounted in AppProviders as a sibling above the routed/account-remounted children in both transport/no-transport WebAuthSessionProvider branches. Registry is owner-bound memory; host placement requires no Router context. Route adapter uses public Board exports and existing DepartureCoordinator. Register exact latest draft/source/proposal/uncertainty synchronously before first await; cleanup unregisters view capability without deleting intent. Auth/scope loss masks A immediately outside A and fences all pending commits. A' recovery requires explicit fresh validation. Survives controlled subtree unmount, not process termination.

DepartureReason = route | board-selection | modal-close | manage | import | restore | reset | delete-account | sign-out | controlled-reload. LossCause = delete-board | last-board-replacement | import-replacement | generation-restoration | reset | delete-account. DepartureDecision = stay | {kind:'proceed',operationId,ownerEpoch,guardToken}; capability is in-memory first-intent scoped and consumed once. Unsolicited auth/storage revocation is not held for a dialog: synchronous mask/fence, retained owner memory. No Supabase/auth-security redesign.

Proposed opt-in DepartureGuard.resolveDeparture?: (context:{reason:'route'|'sign-out', intentToken:object}) => Promise<'stay'|'proceed'> preserves existing token/label/isBlocking/isCurrent/exportDraft/discardDraft and synchronous caller path. Coordinator reserves first intent before awaiting, reconciles uncertainty through registry, checks guard currentness/live blocker/owner after await, and releases/resets only once. Failed export/cancel/replaced blocker stays. Old callers' ordering and results remain subject to full affected tests, not assumed from optional syntax. No late decision commits a different route/sign-out intent.

App.handleSignOut reaches Board registry in coordinator and fallback branches before identity invalidation, SDK sign-out or session clear, preserving rail→Appearance→settings order and single Board prompt. Controlled manage preflight occurs before AccountDataGate.lock/inspect/unmount; import/restore before their first intent. Global reset preflight precedes any key removal/default event. Board delete/last-board replacement preflight precedes active selection; save/readback precedes dialog close and selection. Partial creation/reset outcomes stay visible. Browser POP uses actual blocker; controlled reload preflight; beforeunload warns only for pending memory intent. Forced crash/termination and unavailable storage cannot guarantee never-persisted drafts.

LossPlan has exact {version:1,id,cause,owner,markerRaw,targets,sourceManifestSha256,pendingOperationIds,createdAt}. targets is the complete RecoveryTarget array captured under appropriate locks; pending includes registry revision identities and must be rechecked. LossDecision is {kind:'explicit-discard',planId,sourceManifestSha256} or {kind:'verified-export',planId,sourceManifestSha256,bundleSha256}. These JSON shapes are records of human choice; runtime authority is a single-operation in-memory capability obtained through the public guard. Caller-supplied matching JSON does not bypass UI/source checks. Pending-discard only drops named unsaved intent and never grants loss of successful history.

Show exact loss scope and histories. Download request is not verification. The user reselects the recovery file; read bytes, compare exact bundle digest and complete target manifest, then acknowledge that plan. Cancel/wrong/truncated/unreadable file or changed source grants nothing. Human/file awaits hold no storage locks. Reacquire L/K, compare complete plan and owner/marker immediately before action; source change invalidates grant. Native evidence separately inspects actual downloaded filename/bytes, not an equal preseeded fixture.

Reset uses account L exclusive for account records and existing device preference coordination in reviewed order. It is ordered multi-key work, not atomic. No removal/default event before Board loss admission; false generic remove cannot become blanket success. Result is completed|refused|partial with exact removed/refused/unattempted keys, no default broadcast for unremoved keys. Existing SettingsFooter callbacks/types become awaited and repeated action disabled; all accepted caller behavior is verified.

New account deletion establishes a durable Board fence under L exclusive BEFORE server request. Freeze target inventory/loss decision, write exact intent, readback, then release L and call server. Every Board writer sees pending intent and refuses while outcome unknown. Intent is evidence of request, never by itself authorization for local erasure. Confirmed server response transfers exact immutable loss proof to deletion receipt. Resume may complete captured A after A→B using the already-confirmed receipt; never wipe B or require B authorization. Unknown outcome keeps fence; only a definitive matching server rejection can remove the matching intent after guarded reread. Legacy unconfirmed intent remains unknown and fenced; no new request manufactures legacy exemption.

Proposed AccountDeletionIntent v2 preserves current v1 accountId/generation/operationId/phase='server-outcome-unknown'/createdAt and adds boardLoss. AccountDeletionReceipt v3 preserves accountId/kind/generation/phase/updatedAt and optional authGeneration constraints, adding boardLoss and operationId. boardLoss is exactly {version:1,planId,sourceManifestSha256,decision:'verified-export'|'explicit-discard',bundleSha256:string|null,manifest:LossPlan}. Store complete manifest, not hash alone. bundleSha256 is required/non-null only for verified-export. New decoder rejects inconsistent owner/operation/manifest/digest/decision/version; storage and settings-rest decode identical grammar without reverse dependency. No new storage key: existing account-prefix deletion-intent and deleted receipt keys only.

Backward decoder: legacy intent v1 and receipt v1/v2 remain readable under existing validations; receipt v2 requires account+authGeneration, v1 forbids authGeneration. New receipt v3 requires valid boardLoss, operationId and account authGeneration when present; demo v3 forbids authGeneration and has local-only deletion flow. Unknown/malformed receipt retains raw/fence and refuses unsafe action. Existing server-confirmed v1/v2 cleanup proceeds by exact historical authority, with explicit legacy history-loss acknowledgement absent limitation; never invent old export proof or prevent privacy cleanup forever. Unconfirmed legacy intent grants no erasure. New requests always use v2 intent/v3 receipt. No downgrade of new proof to old receipt. Ordinary public sync prefix eraser refuses standalone use; internal eraser requires exact validated confirmed or existing legacy authority under exclusive L.

## 8. Full evidence, source qualification and immutable history

All source annex business rows B01–B12, evidence rows R01–R12, W01–W21 and canonical Clock r2 section 14 are retained verbatim. The full E1–E25 table, E24 rows and Rules are copied from canonical bytes separately below; no abbreviated matrix substitutes for it. Four Time Tracker owning docs may differ from P0; apps/runtime, Board/storage/host/CSS/config/lockfile parity is checked separately. Do not assert equality of whole packages.

All 312 ordered original records and nine original fields per row, original literal labels, status/source/acceptance, full retained execution records, ordered original 933 references and exact TT08 six additions are compared. scope-map.items[].module is normalized web213/app22/plugin16/sync41/admin16/site4; original_module retains 30 web（project-system） and nine web（跨模块验证索引）. The 150 nonempty gate_obligations is a different metric from original TODO gated118; neither relaxes gates. Formal 13 completed /3 verification_pending /3 in_progress /293 pending and299 unclosed remain unchanged.

Chain: fresh independent FULL amendment review → explicit root adoption of exact schema/API/path/semantic locks → source-qualified full original B/R/W oracles with frozen correct P0 expectations and permanent-unit budget admission → valid full original-product before → separately granted implementation → independent fixed AND integrated/native/visual/affected-caller verification → actual cross-vendor full scope → fresh independent Astra full original acceptance → root evidence-only ledger reconciliation → independent accepted-integrated inventory and remote/sync receipt. No missing predecessor is replaced by later green evidence or a blocked local dependency. No caller acceptance automatically changes formal state or authorizes release.

Source qualification freezes requested/resolved SHA, complete source/fixture hashes, immutable streamed archive byte count, lockfile/@repo resolution, real source assertions, output collision refusal and exit code. No wrong-source PASS. Native requires real registered App/provider/account-generation and true second browser document, isolated owned server, CDP pipe, trusted drag/keys, passive K-1 audit, no nativeVirtualKeyCode, original pixelFocusWalk identity or fully qualified reviewed replacement. Actual disk files/screenshots manually assessed; five widths 375/414/768/1024/1440, EN/ZH/themes/recovery/legacy/undo states, visible per-stop focus and applicable 44px targets. Synthetic host supplements stay labeled.

Changed App/storage/coordinator sources remove corresponding old source-invariance exemptions: Header/rail/Appearance/settings/widgets/grid/shared caller proof remains full. Frozen original failures and C-FB002/OE/C-RD1 judging copies remain side by side; C-FD1 is diagnostic only. Capacity/product-precondition copies only within canonical Rules, with refusal logs and exact reviewed diffs; B01/B07 contradictory historical expectations need separately reviewed versioned oracle correction. No broad blanket rerun or inherited PASS. Clock M+G+B and missing/unqualified gates remain unchanged.

## 9. Exact future tests and acceptance mapping

Future selected test additions: checklistRecoveryAdmission.test.ts covers full grammar, duplicate keys/IDs, array/envelope/backward/collision/unknown metadata, immutable body/digest/terminal and exact C/X/U/Y; boardWriterLifecycle.test.ts covers W01–W21 pure participant plan/ownership/migration/rollback/forward copy; views BoardWriterLifecycle.test.tsx covers exported W11; BoardAllWriterRecovery.test.tsx covers ordinary/manual same-value, W01–W12, seeds/composer/create/detail/task-link and latest draft. boardProtectedDataset.test.ts covers generic/scoped refusals, L→sorted K, pending-before-await, account/marker, readback/uncertainty; boardMigrationDeletionFence.test.ts covers copiedSource-only Board, retired U restore, all-generation inventory/fence and legacy confirmed continuation. BoardResetLossGuard.test.tsx covers pre-first-removal/refusal/partial/default event; BoardAccountDeletionLossGuard.test.tsx covers pre-server exact fence/unknown/rejected/confirmed-A-to-B; BoardDepartureLifecycle.test.tsx covers actual App branches, first-intent/POP/sign-out/manage-before-unmount/above-account host/masking and real capability lifetime. All nine are source proposals, not written or run now.

Original tests in the 24 paths remain, including reviewed replacement oracle copies when needed. Every W row later gets actual source→participant/refusal→physical key→lock order→held-lock interleaving→post-await handle/marker/incarnation→result/readback→history preservation evidence. Add concurrent ordinary edit vs X/U, three task-link phases with pause inside Tasks acquisition, exclusive migration queued before/after Board, conversion and original/mount pair attribution, full multi-card conflict, new-row/text/order/manual-true/T0 controls, full export duplicate-projection validation, target inventory change after verified file selection and old-client quiescence evidence. Unit tests cannot substitute for real account/native/disk/source qualification.

## 10. Permanent cost, failed/unrun truth and receipt

Technical amendment author2/3 consumes exactly one concluding static allowance. Author1 remains FAILED_PARSER_ALL_SEMANTIC_UNRUN: actual chunk02082d exit1 Non-UTF-8 stdin line170 before body; no hashes/buffers/writes, no outputs and clean6bcb. Its in-memory syntax-only chunk3ba858 exit0 did not validate actual transport or semantics. Earlier functions-JS pretool error/glob read failure remain disclosed. Its 43770-character draft and 56104-character checker in memory are unvalidated, not inputs, accepted artifacts or scope grants.

Impact author1 static FAILED from sections[].items assumption remains failed, later comparisons unrun; fresh impact reviewer1 independently checked actual sections[].tasks and passed one separate static allowance. Reviewer's prior functions-JS construction SyntaxError occurred before checker execution and was not an actual checker retry. Prior preparation2/3 and full review2/3 remain consumed. No actor/path/worktree/vendor/caller-name reset and no fourth iteration.

All seven original append artifacts, six archive-root executions plus main-checkout before, detail calibration/view/final case counts5/8/8, separate author0NW1Ae mode, native PIDs14575/15385/17812/18500, package lpCkP7/zYQAbA/qnu7yE/BmWgbG with nine fixture failures, task-link PID23393/one-byte blank/PID23613 remain in full source annex history. Purpose/command/mode/process distinctions and unknown formal/probe subdivisions remain, not guessed as zero. N-L/N-U/N-P are new assertions, not new broad Board/host/native budgets. Reused unknown/exhausted units are held pending exact root cost admission.

Clock Q1 focus1/3 and six other units0/3; development2/83; retention3/3 exhausted,145 assertions/41 of42 executions, last14/14 not qualification; B70/refusals/R1–R6/impact2 and REL unknown vendor histories retained. TT08 actual vendor3 does not confer BRD vendor allowance. Formal per permanent actual unit <=3 counts failures/refusals/launches; probes disclosed, never disguised reset.

This turn: runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children zero each. Actual billed USD unavailable; no fabricated token/cost attestation. Read-only source inspection is not a product execution. Long terminal excerpts sometimes truncated display; exact complete bytes are independently bound in the concluding checker, and no PASS is inferred from excerpts. No semantic checker was launched during source reading or payload assembly. A functions-level ASCII transport guard rejected an em dash in the checker text before exec_command; actual checker launches and writes were still zero. The literal was escaped before the sole actual checker launch; this pretool assembly interception is retained and is not a semantic retry. Checker source is transported as ASCII Python with escaped Unicode payload, not a JavaScript template containing Markdown backticks. It validates every input and constructs both UTF-8 buffers before ANY output write; failure stops without retry. Structured result below reports exact counts and process identity; final handoff reports tool session/chunks/drain/exit and commit/output hashes.

Only exact two ADD documents are staged and committed with hooks disabled and Why/What/Scope/Risk/Docs/Tests. No push/fetch/sync-check, protected/source/global writes, other worktree, children, merge/rebase/promotion/deploy/release/D3. Local checkpoint remains reviewable proposal. Root must preserve original source commit remotely before integration; source-qualified caller acceptance and inventory remain future.

## 11. Review decision requested

Review the complete original contract plus this exact finite T1–T4 protocol/API/scope proposal, with special attention to whole-writer admission, same-valued manual ownership, task-link common lock order, unknown-byte preservation, immutable X/separate terminal U, rollback retirement, old-client external quiescence, legacy deletion authority and pre-server/pre-unmount fencing. Any technical contradiction is REVISE with fixed source coordinates and inherited iteration counts; reviewer never repairs. No product question or path grant is inferred. Fresh independent full review and root adoption are the next bounded step.

## Exact selected future paths (all UNGRANTED)

| # | Exact path | Fixed-source disposition | Narrow responsibility |
| --- | --- | --- | --- |
| 1 | packages/plugin-web-board-core/src/types.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 2 | packages/plugin-web-board-core/src/internal/boardOps.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 3 | packages/plugin-web-board-core/src/internal/automationLite.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 4 | packages/plugin-web-board-core/src/internal/isBoardArray.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 5 | packages/plugin-web-board-core/src/internal/storageContract.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 6 | packages/plugin-web-board-core/src/__tests__/boardOps.test.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 7 | packages/plugin-web-board-core/src/__tests__/automationLite.test.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 8 | packages/plugin-web-board-core/src/__tests__/isBoardArray.test.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 9 | packages/plugin-web-board-core/src/__tests__/storageContract.test.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 10 | packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 11 | packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 12 | packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery.ts | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 13 | packages/plugin-web-board-workspaces/src/internal/useBoardChecklistOperation.ts | proposed ADD | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 14 | packages/plugin-web-board-workspaces/src/__tests__/BoardChecklistOperation.test.tsx | proposed ADD | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 15 | packages/plugin-web-board-workspaces/src/__tests__/BoardWorkspacesModule.test.tsx | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 16 | packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 17 | packages/xai-web-board-checklist-editor/docs/design.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 18 | packages/xai-web-board-checklist-editor/docs/api.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 19 | packages/xai-web-board-checklist-editor/docs/test.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 20 | packages/xai-web-board-checklist-editor/docs/dev_log.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 21 | packages/xai-web-board-automation-lite/docs/design.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 22 | packages/xai-web-board-automation-lite/docs/api.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 23 | packages/xai-web-board-automation-lite/docs/test.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 24 | packages/xai-web-board-automation-lite/docs/dev_log.md | existing candidate | Original 24 conditional business/core/workspace/owning-doc scope; complete section retained in source annex. |
| 25 | packages/plugin-web-board-core/src/internal/checklistRecovery.ts | proposed ADD | Pure exact capsule codec/validation/delta/field-token/inverse/import/restoration logic. |
| 26 | packages/plugin-web-board-core/src/internal/boardMutation.ts | proposed ADD | Board command adapter to protected dataset API; metadata-preserving W/X/C/U, independent of React. |
| 27 | packages/plugin-web-board-core/src/index.ts | existing candidate | Public export of the two owned APIs; deterministic participant registration. |
| 28 | packages/plugin-web-board-core/src/internal/accountMigration.ts | existing candidate | Replace array-only validator with whole-storage participant, explicitly including copied generations. |
| 29 | packages/plugin-web-board-core/src/internal/exportImport.ts | existing candidate | Coherent full payload/capsule validation and historical import classification. |
| 30 | packages/plugin-web-board-core/src/BoardModule.tsx | existing candidate | W10 async writer/seed adoption and result-aware recovery. |
| 31 | packages/plugin-web-board-views/src/BoardModule.tsx | existing candidate | W11 async writer/seed adoption and result-aware recovery. |
| 32 | packages/plugin-web-board-workspaces/src/internal/useBoardCreateRecovery.ts | existing candidate | W07 async two-step recovery and workspace dependency locking. |
| 33 | packages/plugin-web-board-workspaces/src/internal/useBoardComposerRecovery.ts | existing candidate | W06 async stable intent/latest draft acknowledgement. |
| 34 | packages/plugin-web-board-workspaces/src/internal/useWorkspaceSaveRecovery.ts | existing candidate | W09 Board membership/selection dependency and async outcomes. |
| 35 | packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.ts | existing candidate | Three-phase shared-order participant and post-await incarnation checks. |
| 36 | packages/plugin-web-board-workspaces/src/internal/boardRecoveryRegistry.ts | proposed ADD | Captured-owner memory intents survive route/account subtree unmount; masks and revalidation. |
| 37 | packages/plugin-web-board-workspaces/src/BoardRecoveryHost.tsx | proposed ADD | Bounded recovery/export/reselected-file verification UI, no storage authority from UI. |
| 38 | packages/plugin-web-board-workspaces/src/index.ts | existing candidate | Public host/guard/registry adapter exports; no host internal import. |
| 39 | packages/plugin-web-board-workspaces/src/BoardCreator.tsx | existing candidate | Pending/cancel/export state uses completed result, not Promise truthiness. |
| 40 | packages/plugin-web-board-workspaces/src/BoardSwitcher.tsx | existing candidate | Await workspace create/rename/retry; guard selection/close with first intent. |
| 41 | packages/plugin-web-board-workspaces/src/BoardDeleteConfirmDialog.tsx | existing candidate | Exact successful-history loss disclosure and async result-aware confirm. |
| 42 | packages/plugin-web-board-workspaces/src/BoardSettingsModal.tsx | existing candidate | Preserve latest field draft and pending/error through async Board metadata save/close. |
| 43 | packages/plugin-web-storage/src/internal/protectedDataset.ts | proposed ADD | Narrow participant registry, L→sorted K command IO, loss-plan capability, marker/readback gates. |
| 44 | packages/plugin-web-storage/src/internal/storage.ts | existing candidate | Fail closed generic Board set/remove before equality fast path. |
| 45 | packages/plugin-web-storage/src/internal/prefMutation.ts | existing candidate | Deny generic Board replace/reset; exported generic async path cannot strip capsule. |
| 46 | packages/plugin-web-storage/src/internal/accountScope.ts | existing candidate | Refuse all raw scoped Board setters/removers; retain normal scope semantics. |
| 47 | packages/plugin-web-storage/src/internal/canonicalCommandState.ts | existing candidate | Optional same-scope read participant locks for Board→Tasks saga; no Task schema/activation change. |
| 48 | packages/plugin-web-storage/src/internal/accountMigration.ts | existing candidate | Whole-source Board participant, post-await validation, fresh-generation restoration avoiding retired-U revival. |
| 49 | packages/plugin-web-storage/src/internal/accountMigrationValidation.ts | existing candidate | Explicit validator/transform registry boundary; no missing-validator fallback. |
| 50 | packages/plugin-web-storage/src/internal/accountDataLifecycle.ts | existing candidate | Typed guarded erasure boundary; current/all-generation loss snapshot, preserve legacy confirmed deletion. |
| 51 | packages/plugin-web-storage/src/internal/accountDeletionReceipt.ts | existing candidate | Independently reviewed versioned loss-proof/fence fields and decoder, old receipt handling explicit. |
| 52 | packages/plugin-web-storage/src/AccountDataGate.tsx | existing candidate | Preflight before manage lock/unmount and before import/rollback intent. |
| 53 | packages/plugin-web-storage/src/index.ts | existing candidate | Narrow public dataset/lifecycle preflight APIs used by owning packages and host. |
| 54 | packages/plugin-web-settings-shell/src/internal/resetAllPrefs.ts | existing candidate | Await preflight before first removal; explicit partial/refused outcomes. |
| 55 | packages/plugin-web-settings-shell/src/SettingsFooter.tsx | existing candidate | Correct data-loss disclosure, awaited reset/result UI and disabled repeat action. |
| 56 | packages/plugin-web-settings-shell/src/types.ts | existing candidate | Precisely typed async reset result boundary; legacy override behavior reviewed. |
| 57 | packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts | existing candidate | Guard/fence before server request; preserve captured-A continuation and B masking. |
| 58 | packages/plugin-web-settings-rest/src/internal/accountDeletionIntent.ts | existing candidate | Durable exact loss-plan authorization and pending Board-write fence; backward reading. |
| 59 | packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts | existing candidate | Transfer proof into start/confirmed receipt and preserve resume semantics. |
| 60 | apps/web/src/providers/AppProviders.tsx | existing candidate | Mount BoardRecoveryHost above account/routed subtree; no auth/security behavior rewrite. |
| 61 | apps/web/src/App.tsx | existing candidate | Compose Board sign-out preflight with accepted rail/Appearance/settings ordering. |
| 62 | apps/web/src/routes/modules/boardRegistration.tsx | proposed ADD | Host-owned Board route adapter using existing structural coordinator. |
| 63 | apps/web/src/routes/modules/shellRegistrations.tsx | existing candidate | Replace exactly the Board registration with the host adapter. |
| 64 | apps/web/src/routes/modules/departureCoordinator.tsx | existing candidate | Opt-in async resolution/reconciliation; preserve existing first-intent/release-once interfaces. |
| 65 | packages/plugin-web-board-core/src/__tests__/checklistRecoveryAdmission.test.ts | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 66 | packages/plugin-web-board-core/src/__tests__/boardWriterLifecycle.test.ts | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 67 | packages/plugin-web-board-views/src/__tests__/BoardWriterLifecycle.test.tsx | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 68 | packages/plugin-web-board-workspaces/src/__tests__/BoardAllWriterRecovery.test.tsx | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 69 | packages/plugin-web-storage/src/__tests__/boardProtectedDataset.test.ts | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 70 | packages/plugin-web-storage/src/__tests__/boardMigrationDeletionFence.test.ts | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 71 | packages/plugin-web-settings-shell/src/__tests__/BoardResetLossGuard.test.tsx | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 72 | packages/plugin-web-settings-rest/src/__tests__/BoardAccountDeletionLossGuard.test.tsx | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 73 | apps/web/src/__tests__/BoardDepartureLifecycle.test.tsx | proposed ADD | Future test source only; section 9 exact purposes and complete B/R/W native obligations. |
| 74 | packages/plugin-web-settings-rest/docs/api.md | existing candidate | Owning public API/design contract for precise async result, guard, loss and compatibility semantics. |
| 75 | packages/plugin-web-settings-rest/docs/design.md | existing candidate | Owning public API/design contract for precise async result, guard, loss and compatibility semantics. |
| 76 | packages/plugin-web-settings-shell/docs/api.md | existing candidate | Owning public API/design contract for precise async result, guard, loss and compatibility semantics. |
| 77 | packages/plugin-web-settings-shell/docs/design.md | existing candidate | Owning public API/design contract for precise async result, guard, loss and compatibility semantics. |
| 78 | packages/plugin-web-board-workspaces/docs/api.md | existing candidate | Owning public API/design contract for precise async result, guard, loss and compatibility semantics. |
| 79 | packages/plugin-web-board-workspaces/docs/design.md | existing candidate | Owning public API/design contract for precise async result, guard, loss and compatibility semantics. |
| 80 | packages/plugin-web-storage/docs/board-writer-lifecycle.md | proposed ADD | New narrow storage public participant/locking/migration/deletion/backward/error contract. |

## Structured static integrity receipt

```json
{
  "status": "STATIC_INPUT_AND_DOCUMENT_CHECK_PASS",
  "static_allowance_consumed": 1,
  "author_iteration": 2,
  "author_cap": 3,
  "source_counts": [
    15257,
    20349,
    25632,
    30933
  ],
  "source_categories": {
    "external": 1,
    "blob": 30920,
    "tree": 12
  },
  "source_logical_bytes": 1242635023,
  "total_manifest_identities": 36229,
  "unique_git_objects": 4247,
  "raw_git_bytes_read": 202614763,
  "source_hash_mismatches": 0,
  "original_ordered_rows": 312,
  "original_task_fields": 2808,
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
  "original_evidence": 933,
  "retained_evidence": 939,
  "formal_counts": {
    "completed": 13,
    "verification_pending": 3,
    "in_progress": 3,
    "pending": 293
  },
  "unclosed": 299,
  "runtime_diff": [],
  "four_TT08_doc_differences": [
    "packages/plugin-web-time-tracker/docs/api.md",
    "packages/plugin-web-time-tracker/docs/design.md",
    "packages/plugin-web-time-tracker/docs/dev_log.md",
    "packages/plugin-web-time-tracker/docs/test.md"
  ],
  "selected_future_paths": 80,
  "selected_categories": {
    "original": 24,
    "additional_source": 40,
    "new_test": 9,
    "owning_docs": 7
  },
  "canonical_clock_full_sha256": "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae",
  "canonical_section14_sha256": "5d48a6aac44fa9d9b755d256048e8fe032f93381309b2addaf89091c0b14139f",
  "failure_receipt_sha256": "1398b4d5e7f66c646d4e370952053b2ec02db2c1238ce717ea0d47135e337b7b",
  "manifest_sha256": "f7d1af5519781bb72ab7b6694349687fee8d50200fc163a48608d0c6dcaecb2d",
  "checker_pid": 89800,
  "git_cat_file_pid": 89852,
  "git_cat_file_exit": 0,
  "git_cat_file_stdout_drained": true,
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
  "children": 0,
  "actual_billed_usd": null,
  "failed_author1_static": "FAILED_PARSER_ALL_SEMANTIC_UNRUN",
  "current_semantic_checker_retries": 0,
  "source_qualification": "UNRUN",
  "product_acceptance": "UNRUN",
  "fresh_full_review": "REQUIRED",
  "root_adoption": "REQUIRED",
  "before_any_write": "All immutable inputs, exact source scope, full original records, canonical section, candidate paths and both UTF-8 buffers validated/constructed."
}
```

## Canonical Clock r2 full section 14 — verbatim mandatory obligations

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


## Historical source annex boundary

Every following source is retained in full byte-exact UTF-8 text. Historical first-person results describe that source actor. The current amendment body supplies the finite T1-T4 specialization; no historical heading grants this author permissions or overrides fresh review. Source failed/unrun outcomes remain unchanged.

## Full retained source 5fa4cccb106d10e16562e0a8d6f3b103495607b1 / docs/reviews/audit-parallel-brd12-preparation-r2/contract.md

Source SHA-256: 666d493bbd924c64267a822d5fd9ec97f94bb55ab37340f43aa6588f5b209000; source manifest identities: 15257.

# BRD-12 / PREPARE-CORRECT2 r2 — concrete legacy-count and reversible Done contract proposal

**UNADOPTED / NEEDS FRESH INDEPENDENT CONTRACT REVIEW.** Workflow C; module **web**, sole A-Codex controller. Fresh independent worker assigned Astra preparation role; task-card model is configuration, not provider attestation. This document neither accepts BRD-12 nor authorizes implementation, runtime execution, migration, caller closure or shipping. Exactly two ADD files are authorized: this contract and `inputs.sha256`.

## 1. Fixed identity, authority and complete obligation

- Dispatch parent: `41295a0f57728d93bb764f3679f5e2f3dafb86d4`; detached HEAD is intentional supplied checkout state, not a new branch or a repin.
- Sole writable checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-correct2-20261010/XAI_Desktop`.
- Task card: `parallel-control-r1/task-brd12-preparation-correct2.json`, fixed correction input `42ca98c92e12c10772f496b72da7653f20a61be1`; scope-map original input `e041c2bc293b70db367444c62c4300231976dbf7`; runtime product P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Subsequent root commits do not replace any input.
- Prior author source `5d1f28a0f81ae01155a213fac93133730f7bad51` and fresh review source `bb08478d692091e6362926e2b75c1d0c34fc0ca2` remain immutable; r1 is not edited. Review finding coordinates refer to those exact source blobs. This is author **2/3**, prior review **1/3** consumed; fresh review **2/3** required.
- Original goal read first: `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md`, SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`. Full AGENTS/CLAUDE/shared workflow/multi-machine rules plus authority overlay apply. Overlay replaces only the explicitly superseded global serial/ff restrictions. No other worktree was accessed.
- Full original action: **Checklist旧计数迁移与Done自动勾选规则明确化**. Full original acceptance: **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围; source `02-tasks-time-boards.md;05-visual-ux-audit.md`; workflow C; formal pending; original evidence `[]`.
- All 312 ordered original rows, action/acceptance/module/gate/status/source fields and 933 ordered original evidence entries remain bound by the full input files. At dispatch there are **939** entries: the original 933 plus the exact **six TT-08** documentary references retained below. TT-06 has no evidence and remains pending; “TT6” is not a new item or replacement identifier. Full source-map fields and the BRD-12 record are reproduced in §10.
- Formal totals remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**. None of 118 gated rows is unlocked. BRD-12 has no item predecessor but retains `existing-owner-rule-or-minimal-decision:BRD-12`; preparation is not implementation readiness.
- Product comparison P0→parent: only four `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md` differ under apps/packages/package.json/lockfile. Board, storage, host and CSS runtime sources remain P0. Historical source references below use this fixed source, not current root HEAD.

## 2. Existing rules first: what is settled and what is not

The P0 checklist-editor design/API/test/dev_log and its 20260603 discovery are the owning feature documents. They explicitly retain `{id,text,done}`, canonical `checklistItems`, derived legacy `checklist`, empty-array removal of the chip, a single detail editor, compact progress consumers and no backend/storage-key migration. The card-detail API explicitly accepts count-only legacy cards. Historical checklist AC4 permits generated editing rows; **BRD-12's newer explicit no-fabrication obligation requires a reviewed correction to that behavior and its tests**, not denial of its historical acceptance.

The Automation Lite design already specifies fixed presets (not a configurable rule builder): semantic Done is `key=done` or Done/Complete/Completed/完成/已完成, active cards receive `completedAt`, rows and counts complete, opening runs once per board/day per mounted browser session, manual toolbar reruns, and moves into Done run immediately without due sorting. Therefore do not ask again whether the feature currently auto-checks or silently disable it. The audit's suggestion to make completion configurable is not an adopted owner decision. Preserve urgent-label and daily-sort semantics outside the bounded delta.

Existing append recovery architecture (`web-board-workspace-astra-review/20260909-detail-repair-architecture.md`) and accepted `web-board-detail-astra-final/review.md` establish captured owner/physical bytes/target/proposal identity, latest draft, exact-source conflict refusal, read-back, stable retries, memory recovery surviving target disappearance, explicit export/discard, and no unrelated overwrite. These are retained constraints, not optional UX polish. W-1/C-1/F-2/R-1 apply to their existing callers; none supplies missing checklist titles or an undo lifetime.

A count cannot recover lost titles, identities or a per-row completion vector. Neither generated-looking names nor the trigger scheduling session establish provenance or an undo expiry. Existing no-fabrication, data-preservation and reversibility rules suffice for the concrete technical proposal in §5. **QL/QU are withdrawn as automatic owner gates.** No irreducible owner conflict is established here. The additive representation, writer/lifecycle integration and oracle amendments require fresh technical review and source proof before adoption; no schema or lifetime policy is silently approved.

## 3. Actual source, writer, migration and consumer closure

All paths below are relative to repository root; exact complete bytes are in the manifest. Read claims apply to the named inspected functions/documents; manifest coverage of whole packages and evidence directories is preservation, not a claim every file was semantically reviewed or executed.

| Surface / exact source | Observed fixed-source behavior and required coverage |
| --- | --- |
| `packages/plugin-web-board-workspaces/src/registration.tsx`, Web `routes/modules/shellRegistrations.tsx`, `App.tsx` | Registered actual `/app/board` host. Future host proof must use this registration/router/account setup, not a standalone Desktop component or fake card renderer. |
| `BoardCardDetailModal.tsx:getChecklistItems` (119–127), summary/CRUD (211–226, 621–695) | Absent `checklistItems` plus positive `total` constructs `legacy-${card.id}-${index+1}`, `Item ${index+1}`, first `done` indices checked. This allocates identities and assigns per-row completion without historical evidence. Opening alone synthesizes in memory; toggle/edit/remove writes the synthesized entire array. Existing real titles named “Item 1” must never be globally replaced. |
| `internal/useBoardDetailSaveRecovery.ts:checklistItemsFor` (131–139), commit (156–230) | Independently performs the same synthesis when appending, then `updateCardInList` and `preserveBoardStorageFormat`; it is not sufficient to fix only the visible modal. Stable proposal, exact-byte comparison, collision refusal, source/target validation, account assertion and actual read-back already exist and must survive. |
| `BoardWorkspacesModule.tsx` writeLists (431–441), updateCard/patchActiveCard, submitDetailAppend (990+) | Field toggles/text/remove use the ordinary patch/update/writeLists path; append uses recovery submit. Ordinary-field callback remains a void modal contract even though parent returns status. Recovery for append is not proof of recovery for a toggle or undo. Exact new writer paths need failure evidence before acceptance. |
| `BoardWorkspacesModule.tsx:applyAutomationToActiveBoard` (632–680), moveCardToList (780–790) | Mount/manual runs validate source ownership, current raw storage and writer result. A cross-list move applies automation over the **entire moved board's lists**, so other Done cards may complete, not just the moved card. `sortDueDates:false` suppresses sorting but not other rules. Mount daily key is state, not durable scheduler identity. |
| `packages/plugin-web-board-core/src/internal/automationLite.ts` | `completeCard` checks every real unchecked row, or sets legacy count `done=total`; `completedAt` does not retain old checklist flags. Archived lists/cards excluded. Moving out of Done does not restore flags or clear `completedAt`. No inverse/provenance receipt exists. |
| `core/src/types.ts`, `internal/boardOps.ts:normalizeBoardCardDetail/mergeBoardCardPatch` | Real item fields are id/text/done; aggregate derived whenever array is present (including empty). Preserve title, order, flags, other fields and IDs. No existing per-item revision or automatic/manual provenance. Do not conflate current version-free BoardCard with Desktop RepoRecord. |
| `core/src/internal/isBoardArray.ts` | Legacy count guard checks numeric types only; item guard checks strings/boolean, not uniqueness/nonempty/finite count invariants. Negative/fractional/huge counts, duplicate IDs, conflicts between aggregate/array need explicit before/data-classification coverage; no silent clamping/default repair is authorized. |
| `core/src/internal/storageContract.ts`, `persistence.ts`, `exportImport.ts`, `accountMigration.ts` | `readBoardStorage` accepts nonempty arrays/v1 envelopes; envelope migration only wraps existing boards, does not reconstruct titles. Format preservation keeps envelope metadata. Display fallback creates seed boards for invalid/missing input, which is never authorization to migrate or write. Export typed progress consumes items if present otherwise counts. Account migration validator is registered against `isBoardArray`; envelope/account-migration compatibility must be tested as-is, not assumed. |
| `core/src/internal/seed/board-data.ts` | Real shipped legacy aggregate seeds exist (e.g. bc1); absence of user telemetry does not prove no legacy records. Seed is not provenance for user records and does not recover original row names. |
| `core/src/BoardCard.tsx`, `views/src/TableView.tsx`, `workspaces/src/CardDetailDialog.tsx` | Chip/table/dialog read aggregate; export record projection reads structured rows first. Compare all consumer numbers and real/unknown labels against source, including empty array, legacy, mixed/imported data and remount. Calendar/Timeline/Planner callbacks share updateCard; regress intended date/priority patches and unrelated cards. |
| `packages/plugin-web-storage/src/internal/{registry,accountScope,accountMigration}.ts`, storage hooks, Web account host | `xai_boards_v2` existing account-scoped canonical dataset. Migration/owner/generation changes and current physical bytes must fence both forward and inverse operations. Shared storage source stays protected; no new account-cloud sync work. |
| `packages/plugin-project/src/components/CardDetail.tsx`, `types.ts`, `hooks/useProjectStore.tsx`, `data/{LocalStorageAdapter,RepoAdapter,RepoProvider}` | Separate Desktop/plugin project entity path: `Card.checklist` is already a real array, `schemaVersion:1`, `version`, `syncScope:account-sync`; store uses `xai.plugin-project.cards` or Tauri repo, emits project events and moveCard changes list/order without auto-check. It is **not** the P0 writer. Keep required source/history inspection and boundary tests, but no Desktop edits, migration, aliasing of keys, or copying semantics into Web. |

Historical closure: checklist editor shipped commits `17b3a74`/`aeb4ee2`; detail diagnosis `a8774fd` at d7f1987, architecture `ac0e090`, repair `5c6ed8e`, mobile follow-up `99c36b0`; detail acceptance explicitly tested legacy synthesis, making it a known oracle conflict for BRD-12. The later Task-link fixture repair `8ab38ed` preserves assertions and fixes the prior nine fixture failures; its separate acceptance and parent native evidence do not authorize new checklist behavior or production canonical-command activation.

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

## 5. Concrete technical proposal resolving R1-01 and R1-02

All names below are **proposed conceptual fields**, not approved API/schema/key changes. The mechanism is bounded to this caller's information loss and exact automatic-completion inverse; it adds no rule builder, background scheduler, generic history product or account-cloud feature. Fresh review must approve an exact representation and writer coverage before a product card. No implementation has been attempted.

### 5.1 Truthful representation, precedence and explicit conversion

Three data classes have deterministic handling:

1. **Aggregate-only:** absent `checklistItems` plus valid integer `0 <= done <= total` (safe integers) means only the pair is known. Display “Legacy checklist: 1 of 3 complete; item titles and individual completion are unavailable” (localized), with one aggregate summary, no inferred checkboxes/IDs/row ordering. Do not allocate `total` rows. Missing aggregate means no checklist, not an unknown positive count. Opening/closing the detail performs no conversion; applicable automation still runs separately.
2. **Structured array present, including empty:** these stored rows are the operative checklist. Derive progress exclusively from the array; empty clears the chip. Preserve every actual ID/text/order/boolean, including literal `Item 1` and `legacy-*`. Present suspicious-looking imported/materialized rows as stored information of unknown origin; do not infer that they are genuine historic titles, nor delete/rename them as fake. Duplicate IDs prevent targeted inverse/edit attribution until explicitly resolved; display/export remains available. Stale aggregate never overrides the array, and a changing write records the stale pair in its preimage before canonical derivation.
3. **Malformed/unsupported:** preserve exact source, provide inspect/export and a truthful source error; no seed write, clamping, allocation by malformed count, automatic domain repair or fabricated row. Missing-vs-empty-vs-invalid is retained. Finite integer checking here is a proposed caller admission rule, not a claim P0's numeric-only guard rejects these records. Before/fixed source and oracle corrections must expose the difference.

For an aggregate-only card, **Start a real checklist** opens a user-authored draft with no generated rows. The user supplies actual text and each initial completion flag explicitly (new rows start unchecked and are visibly so). Preview shows both the old/current aggregate and the exact new array/count, explaining that names and flags are newly supplied and cannot be mapped to the lost historical rows. Confirm commits `checklistItems` plus its derived aggregate and a lossless conversion capsule atomically. It never claims that one supplied row corresponds to historical slot 1, nor assumes the first N were done. Cancel/failed save leaves canonical source unchanged. A submission with no real row is explicitly “start an empty checklist”; it must show that the old aggregate remains preserved before committing an empty array. One-item append from aggregate mode uses this same conversion confirmation, including the existing recovery append path; it cannot bypass the preview or reintroduce `checklistItemsFor` synthesis.

The capsule records conversion ID, card/board identity, source hash, original aggregate presence and exact pair, current pre-conversion pair, absent-array fact, user-supplied rows/flags and resulting projection. Newly confirmed rows receive fresh collision-checked identities allocated once for that conversion; none copies an imagined historic slot ID. If automation already changed 1/3→3/3, both values remain distinct through its linked receipt; conversion records 3/3 as its immediate preimage and retains 1/3 through the original receipt. Keep historical summary separate in detail with “not included in current checklist progress”; do not sum old and new counts. All existing compact consumers still read the current real-array-derived aggregate. Capsule storage/export is preservation, not a second active checklist. Reconfirmation/retry with identical conversion ID and payload is read-back only, not another conversion. Collision differs in payload → refuse; a later conversion request after an array exists follows real-array editing, never replays count migration.

An existing real array conflicting with an aggregate is not silently converted or cleaned on detail open. The next authorized ordinary edit or automatic operation may normalize the aggregate; its preimage retains the prior value. Undo of completion restores authoritative real flags and re-derives a truthful aggregate rather than reintroducing a stale lying chip; the stale raw count remains recoverable evidence, not operative progress. Conversion is not undone by Undo Done; the old completion receipt remains inspectable but cannot apply aggregate inversion across a representation change.

### 5.2 Immutable input versus authorized canonical transformations

Capture **Praw** exact physical-key bytes before route mount, then **Pmount** immediately after the retained mount operation. Neither fixture may use Pmount to pretend Praw had all rows true. Praw remains immutable audit evidence even when canonical storage legitimately changes. Runtime receipts hold lossless field preimages and a hash of Praw/Pcurrent, not recursively embedded copies of the whole receipt-bearing dataset. Failed pending intent retains its exact raw baseline in memory/export. A hash alone is not a replacement for the fields needed to invert.

For each actual trigger X, compute separate `moveDelta`, `completionDelta`, `normalizationDelta`, `urgentDelta` and `sortDelta` against the same freshly read dataset. Only the last two follow their existing rules; move triggers set `sortDueDates:false`. Completion scans all active cards in all semantic Done lists of the active board, including cards other than the moved card. Other boards and archived lists/cards are byte-logically unchanged. Done matching remains key/name-based exactly as P0, not inferred from translations outside the known set. A same-list/invalid-source move has no automation trigger because `moveCardOp` returns the original lists. Every genuine cross-list move currently calls the full preset, including moves out of Done; preserve that actual source behavior and its other-card effects.

| State before X | Allowed completion result | Completion count and inverse attribution |
| --- | --- | --- |
| Real rows `[a:true,b:false,c:false]`, no marker | Same IDs/text/order, `[true,true,true]`, count 1/3→3/3, one captured ISO timestamp T | `completedCards += 1`, rowsChanged=2. Undo owns b/c false→true and absent→T only; a stays true. |
| Aggregate-only 1/3, no marker | Still no array, aggregate 3/3, marker T | One completed card; aggregateDelta=1, not “two historical rows checked.” Undo restores known pair 1/3 and absent marker; titles/individual flags remain unknown. |
| Real rows mixed, existing nonempty marker T0 | False flags→true; preserve T0 exactly | One completed card if a flag changed. Undo leaves T0, restores owned flags. |
| All true or aggregate already total; marker absent/falsy | Checklist unchanged except any real-array normalization; set marker T | Marker change counts as one completed card, rowsChanged=0. Exact previous property presence/value (including empty string if admitted) is preserved for inverse. |
| Already complete with nonempty marker | No completion semantic change | No completed-card increment and no artificial completion receipt. A normalization-only stale aggregate delta is separately identified, not a new auto-check. |
| No checklist or explicit empty array | No invented rows; marker follows existing rule; array still empty clears stale chip | Marker-only receipt if needed. No nonexistent flag inverse. |

`completedCards`, `urgentLabelsAdded`, `sortedLists` retain P0 meanings and are compared to an independent expected calculation. New explanatory `rowsChanged`/aggregate-change counts do not redefine those stats. Capture all actual normalization changes (including incidental attachment chip/undefined-property normalization if P0 helper would perform it) separately; no hidden normalization can be called an unchecked-row delta. Reject an unexpected field delta in the oracle. Inverse **does not restore stale derived counters**, move position, urgency, sort order, attachment normalization, card title/date/priority or other-card edits. It reverses completion only, with updated real counts derived from current rows. Canonical serialization need not preserve whitespace/key order; original byte evidence must remain unchanged.

Example multi-card X: Done A `[true,false]` marker absent; Done B legacy 1/3 marker T0; archived Done C `[false]`; non-Done D due tomorrow, labels `[]`; non-Done list order is eligible for due sort. Mount/manual X: A→2/2 with T, B→3/3 preserving T0, C untouched, D gains urgent, non-Done due sort runs. `completedCards=2`, `urgentLabelsAdded=1`, and `sortedLists` equals the number actually reordered. Undo completion X returns A→1/2/absent marker and B→1/3/T0, leaves C, D urgent and sorted order unchanged. Move-trigger X produces the same completion/urgent projection with `sortedLists=0` and keeps the move on Undo Done. Count-only information is never relabeled as a recovered row vector.

### 5.3 Operation identity, proposed storage and forward commit/acknowledgement

**Proposed layout:** an optional version-tagged Board-owned `checklistRecovery` capsule alongside `lists` on the same Board object, within the existing `xai_boards_v2` array or v1 envelope. It holds immutable conversion/completion receipts, separate terminal inverse references/status indexes, per-field last-writer tokens and retained deleted-target descriptors. Receipt X bytes never change when its status index gains an inverse link. Existing real item shape remains `{id,text,done}`; ownership metadata lives outside the items. This layout avoids a second storage key, a multi-key atomicity claim and mandatory envelope migration; legacy-array and envelope format remain preserved. Names/layout/version tag require independent review, validation, import/export/account-migration compatibility and an explicit amended owning contract. They are **not adopted by this author**. A field-name collision or unsupported capsule version is a source conflict, never permission to overwrite. Whole-board/raw exports must retain the capsule; logical exports retain it in Board payload and retain current card projection. A consumer that strips it cannot claim reversible roundtrip.

Receipt X contains: unique stable operation ID allocated once; immutable kind and trigger ID; rule version; board/card incarnation identifiers and ordered affected-card set; owner account namespace and captured physical key; execution scope/generation token; captured timestamp and local-date trigger key; prior journal head and exact raw source digest; property-presence-tagged pre/post field values (including full prior flag vectors/row IDs for explanation, and legacy pair); separate forward deltas and counters; per-field writer tokens; resulting projection fingerprint; and inverse status/link. Imported receipts are historical records requiring explicit ownership/provenance validation, never executable foreign-account capabilities. No “complete” marker alone is proof of ownership.

Operations: `mount(board, local-day, live-mount-id)`, `manual(click-id)`, `cross-list-move(move-id)` identify real trigger events; automatic effect rerenders reuse the same pending trigger ID. Double-click on an in-flight Retry/Undo is inert; a genuinely later manual click after settlement is a new trigger, even if a no-op. Allocate card incarnation for newly tracked cards and row mutation tokens; preserve existing IDs. IDs need not assert provenance before tracking began. Missing/duplicate target identities or an imported untrusted token force refusal, not guessing by index/title.

State progression is `prepared → committing → committed-and-verified` or `pending-failure / commit-uncertain / conflict`. In one proposal, the transformed cards **and receipt X** are serialized into the same physical-key value and sent through the existing storage writer. Before commit reassert captured scope, physical key, current exact source and target/semantic preconditions; guard changes after awaits. Do not write receipt first and checklist second. Compare actual read-back to proposed bytes and reassert owner before publishing success/stats or clearing pending UI. `saveBoards` truthiness alone is not acknowledgement. A no-op trigger performs no data write solely to create an undo entry.

Retry of uncertain X reads first: exact proposal present → acknowledge with **zero additional writes**; absent X and exact original source still present → retry the same ID/T/delta once per admitted user attempt; changed source/collision/partial or unexplained receipt → retain uncertain/conflict, zero writes. If X is present with later compatible operations, validate the unchanged X receipt and its linked successor/ownership chain; report “X recorded; current state changed,” never pretend current bytes equal X's postimage. Unexplained changed X means conflict. This avoids duplicate writes while distinguishing a lost acknowledgement from later legitimate edits.

**Serialization proof is mandatory:** register one caller-owned cross-document exclusive lock for this physical Board key, with the account/generation included in admission; all Board writes that can affect the dataset must participate or be proven fenced/quiescent. Acquire before reading current bytes, release in finally after read-back, never hold while waiting for human input. The proposed hook/module wrapper supplies the Board lock without edits to shared storage code. Missing lock support refuses mutation visibly, preserving retry/export; it never runs an unfenced fallback. A shared persistence writer/migration that does not honor or exclude this lock is an unresolved **technical admission gap**, not evidence of atomic compare-and-swap. `getItem`/`setItem`/read-back alone cannot prevent lost updates across tabs. Before implementation admission, a fresh impact reviewer must inventory every raw Board writer, prove participation/fencing under the exact 24-path list, or register an exact additional technical scope through root. Do not hide this gap behind a green conflict fixture or an owner question. Native two-document and account-migration interleavings must test the actual registered host. Arbitrary external storage mutation can invalidate provenance; never claim undo is safe after undetectable external overwrite/ABA.

### 5.4 Field-owned inverse, successor operations and deterministic conflict rules

Undo selects **one named X** and explains its scope: affected cards, original count→after count, rows auto-checked, prior manual-true rows excluded, timestamp change, and urgency/move/sort excluded. Form inverse request U with stable `undo-of:X` identity, captured current source/owner, eligible target set and exact inverse delta. U is itself persisted with X's terminal status in the same write/read-back discipline; repeat U is read-back/no second change. Never roll the entire Board back to X's raw snapshot.

Before U, compute field ownership from X plus later recorded writers. For every false→true flag, restore false only if the same board/card/row incarnation exists, its last **done-field** writer is still X, and current value matches X's postvalue. Text edits do not change the done-field writer; user retoggle, row replacement, deletion/re-add, conversion or later completion Y does. Timestamp restoration requires the same last-writer/value check; restore exact absence or previous falsy value only if X created/changed it. Existing T0 is not owned by X. Aggregate-only inverse additionally requires absent array, unchanged total and count-field ownership X. Derive real aggregate after inverse from **current** array, including later additions/deletions; never restore the whole previous array or stale aggregate.

Conservative operation rule: U applies atomically to all completion fields in X only when every such target is still eligible. If any owned target was deleted, archived, ambiguously replaced, representation-converted or touched by a later completion/manual flag writer, **refuse the whole U**, show per-field reasons and retain/export the full receipt. No partial “undone” acknowledgement. This deliberate conflict refusal prevents later work loss without requiring a new product choice. Disjoint later text/order/labels/date changes and new distinct rows remain permitted; they are carried forward exactly. UI may show what could be restored, but no partial inverse is executed without a separately reviewed contract. The raw preimage remains available even when automatic inverse is no longer safe.

| Sequence after X | Deterministic U result |
| --- | --- |
| A `[m:true,n:false]`→`[true,true]`; no later changes | `[true,false]`; preserve m, remove X-created marker; count 1/2. |
| Rename n; add new row z:true | Restore n.done=false, retain its renamed text and z; count 2/3; no new-row deletion. |
| Delete X-owned n, re-add same ID, or toggle n false→true manually | Refuse U, preserve latest data and X; matching final boolean is not ownership proof. |
| Delete unrelated original-true row m | Restore still-owned n only, current remaining array determines count; do not resurrect m. |
| Later edit card title/date/priority or move target to another active list | Find same unique card incarnation within Board, restore owned flags/marker at its current location; do not reverse move/edit. Revalidate any new trigger Y first. |
| Archive/delete an X target or remove its list | Refuse U while unavailable, retain receipt at Board level; no unarchive/resurrection. Restored matching object requires validated lineage, not ID equality alone. |
| Multiple Done cards in X, one conflicting | Zero inverse writes to all; show exact blocker and retain/export X. |
| Legacy 1/3→3/3, then explicit genuine conversion to 0/1 | Refuse X inverse across representation change; keep new array and historical 1/3 + 3/3 capsules. |
| Existing timestamp T0, rows change | U restores flags only; T0 remains even if card moves out of Done. |
| Cross-document source changed before U commit | Recompute a **new proposal** from the current verified source only after user retries/reviews; never reuse stale proposed bytes. Proven unrelated changes may be carried forward under lock; relevant conflict remains zero-write. |

X and legitimate successor Y are distinct. In the same live mount, U does **not** clear the once-board/day scheduling marker and its rerender is not a new mount event; thus it cannot immediately reapply X. An unresolved X is reconciled before another trigger can commit, and an acknowledged U does not alter the trigger schedule. On forward mount/manual acknowledgement, consume the applicable live board/day trigger before publishing the resulting state so its effect rerender cannot create a duplicate X; on failure keep the same pending identity rather than minting another operation. This is exactly-once attribution for one trigger, not deletion of future day/mount/manual/move triggers. A later toolbar click, actual qualifying cross-list move, new mount/reload, board/day eligibility at an existing effect invocation is Y and runs normally. There is no new midnight/background wakeup or persistent “disable automation after undo” flag. Display the rule beside Undo so re-completion is explainable.

Example: X checks n; U unchecks n in the same mount; Y manual checks n again with new receipt/field token. Repeating U is already-undone/no write; undo Y restores Y's preimage n=false. If Y follows X before U and changes no X field, X ownership remains and U may still apply. If Y owns a relevant change, U refuses rather than undoing Y. Reload after U is a new mount and may legitimately recheck n; preserve both U and Y records, do not call it lost undo. This is the required distinction between durable inverse evidence and suppressing future automation.

### 5.5 Lifecycle preservation, removal, capacity and limits

The preservation invariant is specific: a successful forward mutation never exists without its co-committed reversible preimage/receipt; a rejected/uncertain proposal is never displayed as saved/undone, and its available recovery data is not silently discarded by controlled navigation. A committed receipt survives ordinary modal/board/route departure and same-account reload because it is in the same dataset, not only a toast or session variable. This is a technical preservation mechanism under BRD-12, **not** an infinite-history/retention service promise.

- **Modal/board change:** unresolved proposal stays in the Board parent recovery surface with original target, owner, draft and receipt even if no card remains selected. Committed history is rediscovered from source; memory state is not the sole source.
- **Controlled route departure/reload/logout:** reconcile uncertain commits first; pending uncommitted intent requires stay/retry, explicit recovery export, or explicit discard of that pending intent. Export includes raw baseline, exact proposal/delta/IDs and read-back uncertainty; downloading is not success acknowledgement. Browser `beforeunload` warning is only a warning, not durable storage. A denied write plus forced process termination cannot be promised to preserve an unpersisted draft. That physical limit and the existing host departure reachability require actual before/fixed proof; no silent session-expiry policy is introduced. If the existing host cannot provide a scoped guard through public APIs, retain a technical protected-host impact gate and ask root for a separate exact technical card; do not implement in App/router or weaken B09.
- **Account A→B→locked→A':** A's pending operation cannot commit with A' generation or B scope even if account names match. Mask A content while B/locked; do not migrate an executable token. In new A' context, committed A history is read from A's current physical dataset, validated, and a new inverse intent captures A' scope. The old pending intent remains fenced; resuming it requires explicit revalidation/reconstruction against its known source under A', not a stale-token retry. A durable receipt records historical owner identity, but does not carry live authorization across generations.
- **Card/list archive or deletion:** keep X at Board level, mark target unavailable when presenting it, retain preimage/export; refuse automatic resurrection. A later independently restored entity needs lineage proof before inverse. Ordinary deletion must carry Board capsule forward even when the last card disappears.
- **Deleting the Board or replacing/removing the whole dataset:** before a controlled destructive action, present that its retained recovery information is also affected. Keep a recovery package outside the soon-to-be-deleted target via explicit user download and acknowledgement, or obtain explicit discard of that information as part of the destructive confirmation. Cancel leaves bytes unchanged. A mere failed export must not unlock the action. Disk-download proof is a verifier obligation; UI cannot infer disk persistence from `click()`. Unexpected external removal/migration fences writes; retain any captured receipt in memory/export, do not reseed, resurrect or claim recovery from bytes no longer available. Existing global deletion/reset/import/account writers remain protected: their compatibility and reachable loss paths must be reviewed and gated, not assumed solved by a Board-local hook.
- **Finite storage/capacity:** no duration/count-based eviction, automatic history truncation or arbitrary session expiry. Store bounded-per-operation affected data (not recursive whole-dataset snapshots or `total` unknown rows); no fabricated infinite durable guarantee. Existing receipts are preserved while admitting a new finite proposal. If the atomic proposal cannot be persisted, refuse the entire new mutation with old data/receipts intact and recoverable intent. An explicitly requested retirement/export/discard needs its own precise action and acknowledgement, never background pruning or quota-driven forced choice. Successful-operation discard is distinct from dropping a pending unsaved draft; undo terminal records remain for idempotence unless an explicit destructive scope includes them.

### 5.6 Source-bound correction map and remaining technical gates

| Review coordinate at source r1 | r2 resolution / evidence obligations |
| --- | --- |
| R1-01 B01 line54 vs B06 line59 and pre/post mount line50 | §5.2 separates Praw/Pmount/canonical delta; B01 no longer demands no automatic write. Exact rows/counts/marker/urgent/sort/other-card attribution frozen in R02, unchanged in R05. |
| R1-01 B02 line55 and B05/B07 | §5.1 precedence, §5.2 field attribution, §5.4 derived-count inverse and §5.5 roundtrip; no original flag/old counter conflation. |
| R1-02 lines24,71–75 and conditional gates lines79,134,138 | QL/QU withdrawn; §5.1 user-authored conversion, §5.3 receipt/state/write/read-back, §5.4 inverse and successor, §5.5 lifecycle replace unspecified choices. R01/R05 reference concrete design instead. |
| Seven-artifact wording in §7 | Seven source artifacts and actual process evidence separately enumerated below; assertions are not processes and unknown formal/probe subdivision remains unknown. |

Remaining work is technical: review additive layout/validation and conversion oracle amendments, prove all writer participation or fence external writers, prove host departure reachability/account-generation and export/import preservation under the 24 conditional paths, register any demonstrated protected-scope extension independently, freeze valid before, reconcile inherited unit budgets, then implement/verify. No missing public hook or concurrency proof is recast as an owner preference. **No owner question is emitted.** Only after a concrete technical attempt and independent impact analysis proves conflicting authoritative clauses that conservative retention/refusal cannot satisfy may root isolate the exact affected cases and the smallest irreducible question; known Done semantics and trigger schedule stay settled.

## 6. Exact candidate implementation allowlist and protected semantic locks

**Current write allowlist remains the two preparation documents only.** The following is a proposed maximum list for a later root-registered implementation card after fresh independent review of §5, valid before evidence and source/lifecycle admission. Paths not selected by that concrete card remain protected; new schema/provenance files beyond this list require another review. Each ADD named here is a proposal, not an existing file claim.

```text
packages/plugin-web-board-core/src/types.ts
packages/plugin-web-board-core/src/internal/boardOps.ts
packages/plugin-web-board-core/src/internal/automationLite.ts
packages/plugin-web-board-core/src/internal/isBoardArray.ts
packages/plugin-web-board-core/src/internal/storageContract.ts
packages/plugin-web-board-core/src/__tests__/boardOps.test.ts
packages/plugin-web-board-core/src/__tests__/automationLite.test.ts
packages/plugin-web-board-core/src/__tests__/isBoardArray.test.ts
packages/plugin-web-board-core/src/__tests__/storageContract.test.ts
packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx
packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx
packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery.ts
packages/plugin-web-board-workspaces/src/internal/useBoardChecklistOperation.ts [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardChecklistOperation.test.tsx [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardWorkspacesModule.test.tsx
packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx
packages/xai-web-board-checklist-editor/docs/design.md
packages/xai-web-board-checklist-editor/docs/api.md
packages/xai-web-board-checklist-editor/docs/test.md
packages/xai-web-board-checklist-editor/docs/dev_log.md
packages/xai-web-board-automation-lite/docs/design.md
packages/xai-web-board-automation-lite/docs/api.md
packages/xai-web-board-automation-lite/docs/test.md
packages/xai-web-board-automation-lite/docs/dev_log.md
```

No CSS edits are proposed. Reuse current scoped board/recovery controls; if B11 cannot pass, freeze and register exact local selectors/files for independent impact review first. Protect **all shared CSS/tokens**, board/core/workspaces/views styles, shell/App/router, Dashboard/Clock/Header/AppRail, storage engines/hooks/account lifecycle/registry, task-link protocol and task store, Desktop plugin-project and adapters, schema/keys outside reviewed Board additions, all configs/lockfiles, original contracts/runners/failures and global states. No wildcard test directory permission. Read-only affected packages may gain separately registered tests if the reviewed impact matrix demands them, never ad hoc product edits.

Semantic locks: single writer for xai_boards_v2 checklist representation + Done forward/inverse + BoardWorkspacesModule/detail-recovery; exclude simultaneous BRD-18/task-link, BRD-28/import/export, ordinary-field recovery or list lifecycle changes sharing these paths. Shared-persistence and account-lifecycle **read dependencies** require source parity and integrated regression; touching their writers expands scope and stops this task. Calendar/date consumers are protected. Controller-receipt-lock is root-owned, never held by this worker; physical worktree isolation does not establish semantic independence. A later product SHA must account for any intervening relevant source delta via fresh review, never automatic rebase/merge.

## 7. Permanent running-unit history and cap accounting

A unit is identified by actual runner/assertion purpose and product/fixture lineage, not BRD-12 spelling. Cap is **≤3 formal diagnosis iterations per actual unit including refused/precondition/launch attempts**; probes recorded separately; actor, filename, worktree, corrected copy or vendor changes never reset it. Historic logs before this policy are retained without retroactively declaring permission. Unknown total is not zero; uncertainty blocks that reused unit's automatic admission pending root reconciliation, not every other independent task.

| Permanent actual unit / concrete evidence family | Observed history lower bound; admission consequence |
| --- | --- |
| Detail rejected-append original 3 assertions; `web-board-detail-save-diagnosis/verify-fixed.mjs` + `detail-contract.test.tsx` | **Seven retained original append artifacts:** five diagnosis logs before.log, independent.log, independent-parent-c201a1d.log, independent-parent-after-5c6ed8e.log, independent-parent-final-99c36b0.log plus two Sol original-three logs. Review r1 source-binds six archive-root executions WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM and the separately retained main-checkout before.log. Three assertions per process are not three attempts. Exact permanent formal/probe classification remains unknown; no fresh 0/3 allowance. |
| Independent detail eight-business-oracle unit; `web-board-detail-astra-final/verify-fixed.mjs` | oracle-calibration-99c36b0.log, view-fixture-calibration-99c36b0.log, independent-99c36b0.log: three distinct archive-root executions vR4Xvt/QNw9Ce/H1Ap2r and 5/8/8 case sets, first two fixture/oracle failures. Do not erase calibration or assume exempt probes; treat automated rerun as blocked until authoritative cost classification. Author-tests-rerun is a separate invocation mode, not a new BRD unit. |
| Detail native download/retry/reload unit; `web-board-detail-sol-fix/verify-native.mjs` | native-5c6ed8e.log, native-99c36b0.log, native-99c36b0-parent-independent.log, native-99c36b0-parent-visual.log: four distinct Chrome sessions PID14575/15385/17812/18500 plus distinct proposal IDs; exact original unit subdivision/formal/probe status unknown. Source identity known; no actor-based reset. Visual output reuse does not silently grant another download run. |
| Board full-package regression unit; `web-board-detail-sol-fix/verify-package.mjs` | before-8105cc9.log, after-5c6ed8e.log, final-99c36b0.log; Task-link fixture-fix before/after-package and parent-tasklink-fixed logs extend lineage. Nine original fixture failures retained; later 336 PASS fixture repair is bounded historical evidence. Distinct original roots lpCkP7/zYQAbA/qnu7yE and parent task-link BmWgbG are source-bound; unit-level formal total requires classification, never “fresh package 0”. |
| Task-link original D1 and native regression units | `web-board-workspace-astra-review/verify-d1-board.mjs` named parent-baseline/boundaries/repair modes; `web-board-tasklink-native/verify-native.mjs` initial/before-fixture/admitted logs; preserve their mode-specific budgets and accepted fixture copies. Native initial PID23393, blank before-fixture artifact and admitted PID23613 remain separately classified; blank log is not zero launch cost. No independent Board broad-budget reset. |
| Clock/accepted caller G1 units | Canonical r2 §14 E1–E25 and each named runner/mode retained with all source and refusal logs. Current Clock focus/geometry/retention qualification history belongs to its original units; no new BRD allowance, no Clock execution here. Before any later invocation, root supplies its exact cumulative registered count/refusal ledger. |
| BRD-12 static preparation | This registered correction: author 2/3; r1 author 1 and review 1 remain consumed; one static pass; runtime/tests/native/browser/vendor/qualification/probes 0; no children. Fresh contract review is a distinct documentary role with its own registered count, not authority to reset any existing runtime unit. |

**Source-grounded proposed new purposes (not automatic runtime admission):** N-L legacy information-loss oracle inspects aggregate-only pre-mount bytes against both synthesis functions and proves absence of invented row identity/title across explicit reconciliation; unlike old append tests, it rejects the old invented-row expectation. N-U operation inverse oracle inspects the exact pre/post flag vector and later edits across the real three automation entrypoints; no inverse exists in historical automation tests. N-P provenance ambiguity oracle distinguishes genuine `Item 1` and imported/materialized rows without trusted provenance. These are substantive new assertions, not renamed old general UI/download/package units. Reviewer must map overlapping host/append/account components back to existing units, register exact driver/cases and source-delta purpose before granting a count; “not located in searched evidence” is not proof of zero historical execution. No runtime card exists now.

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

## 9. Static outcome, limits and controller handoff

One correction static pass consumed; preparation author 2/3. Prior review 1/3 remains consumed, fresh review 2/3 is next. Commands were read-only `cat`, `sed`, `rg`, Git inspection, Python JSON/hash comparison, and the final exact-path document commit. No tests, browser, native, server, qualification, vendor, probes or children. No user data inspection, screenshot execution, product reproduction or observed-user migration claim. No push/sync-check/remote fetch/global mutation; local checkpoint goes to root for its authorized preservation/receive/push flow. A memory registry quick pass located only historical control-plane guidance; all operative state/identity claims were reverified from the fixed Git inputs, not accepted from memory.

Stop on input/hash/dirty drift, write-scope crossing, runtime need or unresolved decision being silently implemented. Preserve unrelated work and all historical failures. Root independently reviews parent/exact two ADD paths/clean/hash coverage/cost and may schedule fresh contract review; §5 technical review/admission and §7 permanent runtime histories remain explicit downstream gates; no QL/QU product gate remains. This proposal alone is not adopted, READY_TO_SHIP, SHIPPED, business acceptance, release readiness, Web→Desktop sync or 312-item closure.

## 10. Exact retained source records

### BRD-12 full scope-map record (verbatim JSON values)

```json
{
  "id": "BRD-12",
  "priority": "P2",
  "kind": "决策",
  "action": "Checklist旧计数迁移与Done自动勾选规则明确化",
  "acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-12",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-12"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-12/prepare",
    "BRD-12/contract-review",
    "BRD-12/before",
    "BRD-12/implement",
    "BRD-12/verify",
    "BRD-12/accept",
    "BRD-12/reconcile",
    "BRD-12/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

### Dispatch TT-08 record: six new references preserved, not TT-06 completion

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```

### Input-manifest format and static preservation receipt

Manifest contains **15257 entries**, including all **10166** original review-r1 transitive identities independently rehashed with zero mismatches, explicit fixed-correction-parent blobs, both original author/review source outputs and the exact task card. `git:FULL_COMMIT:PATH` hashes raw blob bytes at that immutable commit; `tree:FULL_COMMIT:PATH` hashes **raw Git tree-object bytes**, never pretty `git show` text. The absolute goal path is explicitly external; its SHA-256 is 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. Output hashes/counts belong in the final commit/handoff receipt, avoiding circular self-hashing. Prior 5083 preparation and 10166 review identities remain transitively bound; inclusion of a package/evidence directory does not claim semantic review or execution of each file.

The single static integrity pass verified every field of all 312 original ordered rows and their source-map counterparts, including the 39 reversible module normalizations (30 web（project-system）, nine web（跨模块验证索引）) with exact `original_module`; compares all execution records, 933 original evidence entries in order and exactly the six TT-08 additions for 939; all three ledgers and protected source remain unchanged by this worker. Product P0 comparison permits only the four already received Time Tracker owning documents, not Board runtime changes. Current canonical Clock r2 SHA-256 remains `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae` (complete bytes bound in inputs.sha256).

Clock permanent history remains Q1 focus 1/3, six other units 0/3, development 2 invocations / 83 checks; retention validation 3/3 exhausted, 145 assertions, 41/42 case executions. Last 14/14 is not qualification. Clock source-review R1–R6/impact2 remain blocked; no fourth or renamed run. REL unknown vendor histories and TT08 three actual vendor invocations are not BRD runtime credits. This correction runs none.

### Proposed exact next-stage document/evidence paths

For later separate registration only: fresh contract review `docs/reviews/audit-parallel-brd12-contract-review-r2/review.md` and `inputs.sha256`; a reviewed new-purpose before packet `docs/reviews/audit-parallel-brd12-oracles-r1/{legacy-provenance.test.tsx,automation-inverse.test.tsx,host.tsx,verify-fixed.mjs,verify-native.mjs,oracle.md,inputs.sha256}`. The braces enumerate seven exact proposed files; they are not currently writable. Before log/screenshot/download paths must be enumerated by that runtime card after exact §5 adoption and case/driver/budget review; none may be invented and executed under this preparation card. Existing append/package/native drivers are historical reused units with inherited counts, not new files granted 0/3 by this list.

Historical Board runners inspected above use buffered `git archive` (100 MiB) and overwrite-capable output writes. They must not be invoked at the current archive unchanged merely to discover the known capacity problem. Any future corrected driver requires a hash-bound delta, qualified stream/output refusal/source guards and independent review; changing the transport or filename cannot reset its actual running-unit count.


## Full retained source cdb8820b434aa7f2adb9cc5ad5f14118eb24230c / docs/reviews/audit-parallel-brd12-contract-review-r2/review.md

Source SHA-256: 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810; source manifest identities: 20349.

# BRD-12 full contract review r2 — conditional APPROVED

**Verdict: conditional APPROVED of the complete documentary proposal at `5fa4cccb106d10e16562e0a8d6f3b103495607b1`.** R1-01 and R1-02 are resolved at proposal level. This is not adoption of a storage schema, implementation permission, a runtime PASS, caller acceptance, formal item closure or release readiness. The implementation-admission prerequisites in §5 below remain blocking. No QL/QU owner question is established or forwarded.

## 1. Fixed identity and authority

- Module: **web**. Workflow D under the sole A-Codex controller; fresh independent reviewer `/root/parallel_d_brd12_contract_review_r2`, never repair. Task-card model is configured `gpt-6-astra`; configuration is not independent provider attestation.
- Sole writable checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-review2-20261010/XAI_Desktop`.
- Direct fixed parent: `9262f5f31128bc6bbf5de54e9c24238c58227d0e`, clean detached HEAD at entry.
- Registration: `9e437064fee350795005554d5a80e9d80bf719dc`; card `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd12-contract-review-r2.json`; fixed input `5ebbdd57f1b02e5cab36751bbefe6129ee97d2ae`.
- Full source under review: `5fa4cccb106d10e16562e0a8d6f3b103495607b1`, direct parent `41295a0f57728d93bb764f3679f5e2f3dafb86d4`; independently confirmed exact two ADD files, preparation-r2/contract.md and inputs.sha256. Both source blobs equal the supplied checkout blobs.
- Prior full review `bb08478d692091e6362926e2b75c1d0c34fc0ca2`; prior author `5d1f28a0f81ae01155a213fac93133730f7bad51`. Neither is altered. Product P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`; original scope baseline `e041c2bc293b70db367444c62c4300231976dbf7`.
- Original goal, AGENTS, CLAUDE, shared workflow/multi-machine rules, current control plane, authority overlay, goal-D, scheduler, task card and full source/r1 review inspected. CURRENT-CONTROL-PLANE's explicit r2 scheduling adoption remains authority; preserved historical unaccepted headers do not reverse that adoption.
- Only this report and sibling inputs.sha256 may be added. The worker's specific no-push/no-fetch/no-sync/no-global-write dispatch governs this local checkpoint; root owns preservation, receive, external Git and global state.

## 2. Independent integrity and full original obligation

Rehashed **all 15257 source-manifest identities**, including the complete **10166** prior-review corpus: **15248 raw blobs, eight raw tree objects, one external original goal; zero mismatches**. Raw trees were read through length-delimited Git cat-file bytes, not pretty tree text. Source manifest SHA-256: `1fb39fa30057dedf964b716e80f026818c96d71bada6156e745eaa6b93cd24da`. Original goal SHA-256: `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`.

This review's manifest preserves those exact transitive identities and adds fixed-review-parent versions of their file paths plus source/integration outputs and the exact task registration. Broad corpus hashing establishes preservation, not semantic examination or runtime execution of every file. This manifest contains **20349 entries**. Its hash and both final output hashes are reported in the handoff.

The full BRD-12 action remains **Checklist旧计数迁移与Done自动勾选规则明确化**, acceptance **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围; source `02-tasks-time-boards.md;05-visual-ux-audit.md`; original evidence empty; formal pending. No reduced “rename placeholder” or “document automation” substitute is approved.

Independent JSON comparisons checked all **312 ordered original rows**, every original task field and mapped counterpart, exact original_module for **39 reversible normalizations** (30 web（project-system）, nine web（跨模块验证索引）), every retained execution field, status and ordered evidence. Original **933** evidence references remain; only TT-08 has the six exact additional references recorded in source §10, giving **939**. States remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending**, **299 unclosed**. The three ledgers equal the preparation parent. TT-08 documentary acceptance does not close TT-08 or TT-06.

P0→review-parent product-path comparison contains only the four already received Time Tracker docs `api/design/dev_log/test.md`. Board product code, tests, storage, Web host, Desktop and CSS remain P0. This review changes no product or global ledger.

## 3. Existing authority and disposition of r1 findings

| Finding | Independent disposition |
| --- | --- |
| R1-01 raw preservation versus automatic completion | **Resolved conditionally**, source §4 B01/B02/B05–B07 and §5.1–5.2. Praw is immutable evidence, while an authorized X can change canonical flags/counts/marker. Pmount is separately frozen. Normalization, move, completion, urgency and sort have separate attribution. Inverse derives current real counts instead of restoring a stale chip. |
| R1-02 unjustified QL | **Resolved conditionally**, §2 and §5.1. Truthful aggregate display, no generated history, real-array precedence, explicit genuine conversion and preserved source summaries supply a concrete proposal. Its capsule remains an unadopted technical representation. |
| R1-02 unjustified QU / unspecified inverse | **Resolved conditionally**, §5.3–5.5. Stable X/preimages, co-commit/read-back, field tokens/incarnations, terminal U and legitimate later Y are specified, with retained failures, account fencing, departures, capacity refusal and explicit destructive loss handling. No session expiry or unlimited-history promise is inferred. |
| Seven-artifact correction and unit accounting | **Resolved as a factual correction**, §7. Seven original append artifacts are distinguished from actual execution roots and still-unknown formal/probe classifications. No budget is reset. |

**QL/QU authority challenge:** card-detail API §3.1 explicitly accepts the old aggregate when the array is absent. Checklist design Frozen Assumptions 1–4 gives real arrays precedence and clears an empty chip. The original audit `02-tasks-time-boards.md:160` asks for truthful missing-title presentation and explainable reversible auto-check; the exact BRD-12 acceptance rejects plausible invented Item1 titles. These settle information truthfulness without asking the owner to choose fabricated historical rows. The older checklist API and test AC4 deliberately accepted generated rows; the newer BRD-12 obligation requires a versioned reviewed oracle correction, not deletion of that historical contract.

Automation Lite design Preset Rules/User Behavior and actual `automationLite.ts` plus `BoardWorkspacesModule.tsx:632–680,780–790` settle semantic Done, opening/day, toolbar manual and genuine cross-list triggers. The audit suggestion of a configurable rule is not an adopted choice. The accepted append recovery architecture governs unresolved append preservation, not successful completion history duration. “Browser session” in scheduling does not authorize successful-undo expiry. Thus the r2 decision to emit no owner question is supported. A future missing hook, lock participant or schema validator is a technical prerequisite; only a source-proven contradiction between authoritative requirements that conservative preservation/refusal cannot resolve may become a minimal root-consolidated owner question.

## 4. Concrete representation, forward operation and inverse assessment

The proposal is coherent as a bounded design, subject to the exact implementation proof below.

### 4.1 Truthful representation and conversion

Absent array + valid aggregate knows only the pair; the UI must not allocate total synthetic rows or infer first-N flags. Missing, empty, malformed and unsupported states remain distinct. A stored real array is authoritative even if names look like Item 1 or IDs like legacy-*. Regex resemblance supplies no historical provenance. Duplicate identities refuse targeted mutation/inverse until resolved, while inspect/export remains available.

Explicit Start a real checklist/aggregate append preview records newly supplied rows as new information. It preserves original and immediate aggregate preimages, retains an earlier 1/3→3/3 automatic receipt if present, and keeps that historical summary out of current progress. Empty conversion needs explicit preview; cancel or failed save cannot mutate canonical data. Both synthesis sites must change together: modal getChecklistItems and recovery checklistItemsFor. Existing append identity/collision/latest-intent controls remain.

Guard tightening to safe integers is a proposed caller admission rule. P0's numeric-only guard does not already prove finite/nonnegative/integer/ordered counts or unique IDs. Before oracles must distinguish that source fact and preserve malformed raw data without clamping or seed writes.

### 4.2 Forward attribution and normalization

For real [true,false,false], X owns only the two false→true transitions and an absent/falsy→T marker, with completedCards=1. For legacy 1/3, X owns the aggregate 1/3→3/3, never “two historical rows.” T0 remains unchanged. Marker-only completion counts one card. An already complete card with a marker does not gain an artificial completion receipt.

Source nuance must survive the future oracle: completeCard can compute normalized detail, but applyBoardAutomationLite keeps original list.cards when neither card-change nor sorting selects transformedCards. A stale real aggregate is therefore not universally normalized by every no-op trigger. When a sibling completion makes that list's transformedCards effective, incidental stale-count/attachment normalization may persist without increasing completedCards for the already-complete sibling. Source §5.2's **actual** normalization attribution must be frozen against this source path; it is not permission to add an unconditional cleanup write. Purely unrelated list/board state and archived targets remain preserved.

All active semantic Done cards in the moved board's lists are candidates, including other cards. Genuine cross-list moves out of Done still call the preset; same-list/invalid-source moves do not. Urgency remains for eligible active non-Done cards; sortDueDates=false for moves. The multi-card example correctly preserves manual true, T0, archived cards, urgency and move/sort effects when undoing completion only. No background midnight scheduler is introduced.

### 4.3 Identity, persistence and acknowledgement

The same-existing-Board-value version-tagged checklistRecovery capsule is a plausible **proposal**, not an adopted storage contract. It avoids a second-key transaction claim. Exact version, collision handling, validation and export/import semantics still require technical adoption; preserving the outer array/v1 envelope does not itself prove backward compatibility.

X is immutable: stable ID, trigger/rule/time, raw digest, captured historical owner/physical key/generation, board/card/row incarnations, prior journal head, property-presence-tagged pre/post values, ordered affected set, field writer tokens, separate deltas/counters and resulting projection. Mutable terminal indexes and U links must be separate from immutable X bytes; the phrase “inverse status/link” in the receipt inventory is read under §5.3's explicit separate-index rule, not permission to rewrite X.

Cards + receipt commit together. Lock acquisition precedes authoritative reading; source/target/scope are reasserted after awaits; exact read-back and scope reassertion precede success or scheduling acknowledgement. A true no-op makes no write merely for history. Uncertain retry reads first: exact saved proposal acknowledges with zero new writes; absent X with exact original source retries the same ID/time/delta; collisions or unexplained source change retain conflict. Later compatible receipts require validation of the unchanged X and successor chain, not equality to an obsolete postimage. Reconfirmation is never allowed to report a never-persisted conversion as saved merely because an ID was allocated.

### 4.4 Field-owned U and normal later Y

U restores only X-owned unchanged completion fields on the same validated incarnations. It preserves manual true, prior T0, later text/title/date/priority/order/labels, and new distinct rows. Derived counts use the current array; it never restores a whole snapshot or resurrects deleted rows.

The proposal deliberately makes a relevant conflict **whole-operation zero-write**: any deleted/archived/ambiguous X target, representation conversion, manual done-field rewrite or later completion ownership blocks the entire U across all cards. Matching final booleans or reused IDs are insufficient. Deleting an unrelated original-true row does not resurrect it; it need not block remaining owned flags. Moving a uniquely identified live card preserves the move, subject to any intervening trigger Y's ownership.

U is terminal and co-committed, so repeated U acknowledges already-undone without a second inverse. Same-mount undo keeps the existing board/day scheduling marker; its rerender cannot replay X. Later manual clicks, qualifying cross-list events, day eligibility at an existing invocation and new mount/reload are legitimate Y and run normally. X→U→Y remains explainable with both histories; undo Y uses Y's own preimage. A no-op Y does not seize X's fields, while a Y that changes a relevant field blocks stale U. Durable receipts cannot become a lifespan-wide automation suppression flag.

### 4.5 Lifecycle and irreversible loss boundaries

Co-committed history survives ordinary modal/board/route departure and reload. Pending memory intent must remain in a reachable parent surface through controlled departures, reconcile uncertainty first, and require stay/retry/export or explicit pending-discard. A failed write plus forced termination cannot guarantee recovery of never-persisted intent; beforeunload is only a warning.

A→B→locked→A' must mask A information outside its context and fence old live scope handles, even if account names match. Reading validated historical A records from A' permits only a newly captured A' inverse intent; it does not reactivate stale A capability. Arbitrary external replacement/ABA cannot be claimed detectable from byte equality alone.

Card/list deletion keeps history at Board level but disables unsafe inverse. Whole Board/dataset deletion, reset or replacement must expose the loss and require verified export acknowledgement or explicit destructive discard; failed export cannot unlock deletion. The account/global action must actually reach that protection. Finite storage preserves existing receipts and refuses the entire new mutation on quota rather than evicting history, writing without a receipt or claiming infinite retention. Pending-discard and successful-history destruction are distinct actions.

## 5. Blocking implementation-admission prerequisites

These conditions were already retained by r2; conditional approval does not close them. They are technical work, not renewed QL/QU product questions.

| Gate | Source evidence and required next proof |
| --- | --- |
| T1 — every Board writer and migration | BoardWorkspacesModule writeActiveBoard/writeLists, reset, delete, move; composer/create/detail hooks; taskLinkCommand.saveLink; BoardModule writes/reset; shared setPref/removePref/raw scoped storage; accountMigration and global data lifecycle must be inventoried. taskLinkCommand writes Board before and after awaited task mutation. createScopedStorage still exposes synchronous unfenced setters, and accountDataLifecycle explicitly retains uncoordinated synchronous deletion callers. A Board-local lock wrapper does not automatically fence any of these. Prove all actual writers participate or are unreachable/quiescent, with account-lifecycle/dataset lock ordering and marker checks; register protected extensions if required. |
| T2 — exact capsule/schema compatibility | Adopt exact version/tag/collision refusal, validation, immutable X/U index encoding, mutation tokens and incarnations for every relevant ordinary writer. isBoardArray currently ignores extra Board fields and does not validate capsule semantics. Reject unknown/colliding versions rather than overwrite. No field name/schema/key is granted by this review. |
| T3 — migration/import/export | Account migration registers isBoardArray for xai_boards_v2 while readBoardStorage supports envelopes; compatibility must be demonstrated. Raw/whole export and logical Board payload must retain history, with items-first current projection. Imported owner/field tokens are historical, not executable capabilities. Restore/re-import must not revive retired U or reuse incarnations by ID alone. All unknown envelope/Board metadata remains lossless. |
| T4 — actual host, account and global loss paths | Actual /app/board registration, AccountStorageGate, route/logout/reload/deletion/reset/import entrypoints and public departure APIs need source reachability review before a product card. A local hook cannot promise a guard when the host can unmount it first. Test real account generation/second document, not a fake standalone fixture. If current public APIs cannot satisfy B09, seek exact independently reviewed technical scope; protected App/router/storage cannot be edited ad hoc. |
| T5 — exact oracles and costs | Freeze raw pre-mount and actual post-mount controls, all business cases, real source and all known failure histories. Correct generated-row historical expectations only in independently reviewed versioned copies. Reconcile permanent actual execution units and formal/probe subdivisions before runtime; unknown/exhausted reused units have no automatic allowance. |
| T6 — separate grants and downstream evidence | Exact impact/review/write card, semantic locks, valid before, implementation, independent fixed/native/visual/regression evidence, actual cross-vendor, full Astra acceptance, root reconciliation and fresh inventory remain required. No accepted-caller evidence is inherited solely by filename, actor, new worktree or BRD label. |

The proposal's exact **24 candidate paths** remain a maximum conditional list, not a current grant: nine board-core paths, seven workspaces paths including two proposed ADDs, eight checklist/automation owning docs. All 24 were retained exactly from source §6. No shared CSS/tokens, Board styles, shell/router/App, Clock/Header/AppRail, shared storage/account engine/hooks/registry, task-link/task store, Desktop/adapters, config/lockfile, historical evidence or global state edit is authorized. Several actual writer paths above sit outside this list; this is why T1–T4 must resolve before implementation, not grounds to pretend the list already covers the complete runtime.

Semantic ownership of xai_boards_v2 checklist/forward/inverse and its writer coordination remains exclusive against BRD-18/task-link, BRD-28/import/export, ordinary-field recovery and list lifecycle work. Worktree separation does not prove independence. No automatic source repin/rebase or grant arises from later controller commits.

## 6. Full business matrix disposition

Every row is retained as a future acceptance obligation; none is reported runtime PASS.

| Row | Conditional contract disposition |
| --- | --- |
| B01 | Truthful aggregate-only representation; both synthesis paths; failed appends; immutable Praw/preimages versus attributable canonical X. |
| B02 | Preserve literal real names/IDs/order/manual flags; array/empty precedence; operation-relative deltas and current derived counts. |
| B03 | Materialized/imported ambiguity remains unknown; no regex provenance inference or destructive cleanup. |
| B04 | Missing/empty/invalid/version/count/identity classes; no seeds, clamp or large synthetic allocation; preserve source and refuse unsupported mutation. |
| B05 | Lossless explicit conversion, array/envelope/metadata/idempotence, migration/export/import and foreign-token fencing; T2/T3 outstanding. |
| B06 | All known Done variants, archived controls, mount/day/manual/cross-list, other cards, source-accurate normalization and urgent/sort counters. |
| B07 | Exact manual-true/T0/new-row/later-edit preservation, field-owned U, whole-operation conflict, stable U and normal future Y. |
| B08 | Physical-key read/write/quota/read-back faults, latest pending intent, double-click/retry/collision, uncertain commits, explicit export/discard with no false success. |
| B09 | Owner/physical key/generation/epoch, A-B-locked-A', removal/archive/move, route/modal/board/reload/forced loss; T1/T4 outstanding. |
| B10 | Real App host/storage plus Card/Table/detail/export/Calendar/Timeline/Planner consistency; native new document and real second-document conflict required. |
| B11 | EN/ZH 375/414/768/1024/1440, themes, long content, truthful recovery and undo controls, 44px applicable targets, trusted keys and visible focus/manual screenshots. No CSS grant. |
| B12 | Exact delta, frozen original failures/oracles, reviewed new copies, full affected callers and canonical G1. |

## 7. Full evidence matrix and canonical G1

| Row | Retained producing evidence |
| --- | --- |
| R01 | Complete hashes/actual-unit history and concrete representation/lifecycle adoption, closed technical admission, frozen full B consistency. |
| R02 | Exact before raw/source/operation identities; expected failures and positive controls; no unexpected PRECONDITION; all actual trigger/append/ordinary paths. |
| R03 | Real App/account host before, counters, trusted native interaction, screenshots and downloaded bytes; synthetic supplements labeled. |
| R04 | Exact product delta, author immutable-source logs and costs, reviewed versioned semantic oracle correction. |
| R05 | Fresh independent full B01–B12 fixed evidence, all §5 branches including conversion/inverse and migration/account/error roundtrips. |
| R06 | New document, genuine second document, account epochs, trusted drag/keys and disk export inspection; actual provider evidence where claimed. |
| R07 | Five-width bilingual/theme manual visual and qualified per-stop focus with CSS invariance. |
| R08 | Board core/workspaces/views focused/full tests/typecheck/lint, Web host gates, storage types, all named consumers and task-link/append/creator/composer/workspace recovery; preserved failure adjudication. |
| R09 | Complete canonical Clock r2 E1–E25 and all accepted judging copies, each with applicability, producer/path/hash/verdict; affected reruns only after permanent-budget admission. |
| R10 | Actual cross-vendor verification and fresh full Astra caller acceptance; this review is neither. |
| R11 | Root serialized receive/preservation/integration, full ledger equality and append only after acceptance, remote ancestry and sync check. |
| R12 | Independent integrated inventory and residuals; no automatic formal or release closure. |

Independently compared source §8 against **canonical Clock r2 §14**, SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`. Full E1–E25 retained:

E1 frozen source/lock/@repo/seed/spy/consistency; E2 six before modes and controls; E3 real host a–q/census; E4 native before/focus/geometry/K-1; E5 Clock F1 c1–c5 before; E6 exact implementation/author logs; E7 six fixed modes; E8 real host fixed; E9 all 17 values, reload/read/lock/uncertainty/second-document/retry/discard; E10 seven disk exports and setup failure; E11 native a–q/both auth branches; E12 downstream/events/other-key/chrome invariance; E13 bilingual five widths/pet/44px/selectors/manual screenshots; E14 per-stop all-state/theme focus/Tab-out; E15 **16** F1 invocations (12+2 Appearance K-1+2 rail); E16 Clock fixed release-once; E17 Header host/native/Astra/Sol/capacity copies; E18 source census; E19 protected diff; E20 storage types/lifecycle; E21 widgets gates+before; E22 grid gates+before; E23 Web/rail/CmdK; E24 all accepted callers; E25 producer/hash/verdict/refusal/capacity receipt.

E24 keeps AppRail eight modes 26/31/21/18/24/22/33/123 and parent31; Appearance 65/89/34/56/33/48/187, host33/package137, frozen continuity24/26 plus **OE26/26 judging**; Features 17/49/31/40/26/6, host40/package45/readers17, frozen downstream13/15, **C-FD1 diagnostic14/15**, **C-RD1 judging15/15**; More 22/20/14/13/15/11 and frozen boundaries plus **C-FB00210/10 judging**; Sticky109/original10/host28; Notifications41/boundaries24/Astra-host15/parent12; Date&Time7; Smart Lists/Collaborate/Pomodoro accepted host copies; settings-shell54/rest314. These are historical contractual counts, not new results.

No blanket inheritance or blanket rerun is approved. Valid immutable evidence requires source/applicability review; changed shared source/selectors void affected invariance exemptions. All required judging copies remain beside original failures. Canonical native exemptions are conditional on their exact source/chrome bounds. Missing Clock evidence remains missing; BRD documentation cannot finish Clock. Streamed immutable archives, requested/resolved SHA, lock/@repo checks, collision refusal, nonzero exits, trusted pipe CDP, passive key audit, no nativeVirtualKeyCode, actual disk downloads and frozen pixelFocusWalk remain. New measurement methods require full qualification, independent review and root adoption; Clock M+G+B sequencing is unchanged.

## 8. Permanent histories and actual cost

This is contract review **2/3**, **one static pass**. Preparation **2/3** remains consumed; review1 and original authors remain in the lineage. Runtime/test/build/lint/browser/native/server/qualification/probe/vendor/child invocations: **0 each**. Static hashing/JSON/source/log inspection is not a product test. No unknown old unit is reported 0/3.

Raw history inspection confirmed seven original rejected-append artifacts: five diagnosis plus two Sol original-three; six archive roots WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM and separate main-checkout before. Three assertions per process are not three iterations. Independent detail calibration/view-calibration/final roots vR4Xvt/QNw9Ce/H1Ap2r preserve 5/8/8 case sets and failures; author-tests-rerun has its own 0NW1Ae root/mode, not a fresh general Board budget. Native detail logs directly record Chrome PIDs14575/15385/17812/18500: four sessions, not a filename count. Board package roots lpCkP7/zYQAbA/qnu7yE and later BmWgbG retain the nine historical fixture failures and bounded task-link correction. Native task-link PID23393, the one-byte blank before-fixture artifact and admitted PID23613 remain distinct evidence; a blank artifact is not proof of zero launch cost.

Policy-era formal/probe subdivision remains **unknown where not reconciled**. Renaming drivers, correcting transport, changing actor/vendor/worktree or changing caller label never resets a reused unit. N-L/N-U/N-P are source-grounded new assertion purposes (reject synthetic history, inverse, ambiguous provenance), but exact driver/case/host overlap and admission must be reviewed before any count is allocated. Unknown reused-unit totals freeze those units, not every unrelated BRD assertion by association.

Clock Q1 focus1/3, six other units0/3; development2 invocations/83 checks; retention validation3/3 exhausted,145 assertions/41 of42 case executions, last14/14 not qualification; source review R1–R6 and impact2 remain blocked. All B70/refusal/calibration histories stay immutable. REL unknown vendor histories and TT08 three actual vendor runs confer no BRD budget. No fourth run, probe reset or source-evidence overwrite is authorized.

## 9. Scope receipt and next bounded step

Commands: read-only cat/sed/rg; Git status/rev-parse/show/diff/diff-tree/cat-file; Python standard-library raw hashing, JSON field comparison and historical log inspection. One early read attempted a nonexistent source-directory spelling; Git name-only supplied the actual preparation-r2 path, then the exact source was read. No product command or evidence runner was launched. Memory registry quick search found no relevant BRD evidence and none was used.

All inputs were read and validated and both output buffers built before either output was written. Only the two registered ADD paths are staged; one structured Why/What/Scope/Risk/Docs/Tests commit uses command-local disabled hooks. No source repair, history rewrite, push/fetch/sync-check, children, global writes, other worktree access, merge/rebase/promotion/deployment/release/D3. Final SHA, direct parent, exact ADD scope, cleanliness, manifest count and output hashes are handed to root after commit.

**Next single bounded step:** root may receive this conditional full-proposal approval and register a fresh independent **technical impact/admission** document task for T1–T4: complete actual Board writer inventory/lock fencing, exact capsule/migration/export/import representation, account/global deletion and protected departure reachability, with precise proposed extra paths only if source proves them necessary. It must be independently reviewed before any implementation grant. Then prepare/review versioned full B/R oracles and permanent unit-budget admission, collect valid before, and only then separately authorize product work. No author3 correction is requested by this review; if a subsequent source-proven contradiction requires one, retain cumulative author2/3 and review2/3 rather than restarting. Caller acceptance, 312 formal states and release remain unchanged.


## Full retained source 11d6527709a5a735200151768296a312a3a30314 / docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md

Source SHA-256: 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53; source manifest identities: 25632.

# BRD-12 writer and lifecycle technical impact r1

**UNADOPTED TECHNICAL PROPOSAL — NEEDS FRESH INDEPENDENT IMPACT REVIEW. Author static pass: FAILED (supplementary ledger helper; no rerun).** The full r2 documentary proposal is conditionally approved; this impact does not adopt a capsule, schema, key, public API, migration, protected path, implementation or runtime permission. T1–T4 have a finite proposed resolution below, with explicit client-quiescence and evidence prerequisites. No QL/QU owner question is established. BRD-12 remains pending.

## 1. Fixed identity, authority and full obligation

Module **web**; workflow A; fresh independent technical-impact author, not implementer or reviewer. Configured task model gpt-6-astra is not independent provider attestation. Sole writable checkout: /Users/lijinlong/.codex/worktrees/audit-parallel-brd12-writer-lifecycle-impact-20261010/XAI_Desktop. Entry was clean at exact direct dispatch parent **53a961aaa4ae87e1453f27d91af3c8edd6ddaeeb**. Registration **cc012a5976919fb6cca8e0f19d0d6a628b033bc4**, fixed input **d39d8a9a32bf9e66310535c8622355daefb6b280**, immutable product **f9eb4b1f207bc4b46f547b90afc250424b3c8695**. Exact card: docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd12-writer-lifecycle-impact-r1.json.

Source full review **cdb8820b434aa7f2adb9cc5ad5f14118eb24230c** and conditional proposal **5fa4cccb106d10e16562e0a8d6f3b103495607b1** each introduce exactly two ADD artifacts. Source blobs equal this checkout's copies. Original author/review r1, correction r2, all failures, prior oracles and canonical Clock r2 remain immutable. Current control's documentary adoption does not confer technical admission. Read AGENTS, CLAUDE, workflow, multi-machine policy, original goal, authority overlay, A/D prompts, scheduler, task registry, full scope map and source proposal/reviews. Explicit worker no-push/no-global-write bounds govern this checkpoint.

Full action: **Checklist旧计数迁移与Done自动勾选规则明确化**. Full acceptance: **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围; sources 02-tasks-time-boards.md and 05-visual-ux-audit.md; original evidence empty. Truthful aggregate display alone does not satisfy reversible Done. Successful forward and inverse attribution, failed intent, account/lifecycle and every B01–B12/R01–R12 remain in scope.

The single static integrity pass read and rehashed all **20349** review-manifest identities: **20340 raw blobs, eight raw tree objects, one external original goal; zero mismatches**. Original goal SHA-256 is 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. Source review manifest SHA-256 is 48e8d4bbc84d99e8bbe5f9336d56c6a8652f653ba8a60349e2ee0d6279c8dec2. Added fixed-parent identities for every inherited path, exact source outputs/registration and complete named source directories: **25632 total entries**, including 5278 fixed-parent blobs and two parent raw trees. Corpus byte verification is preservation, not a claim that every transitive file was semantically reviewed or executed. Product diff P0→parent contains only the four already-received Time Tracker api/design/dev_log/test documents. Board, host, storage, CSS and account runtime sources remain P0.

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

## 3. Finite coordination design, pending intents and compatibility fence

### 3.1 One ordering, no lock-local proof

Propose reuse of existing **L = accountLifecycleLockName(accountId,demo)** (generation deliberately excluded) and **K = prefMutationLockName(full physical xai_boards_v2 key)**. No second Board-only lock name. Normal Board operations acquire L shared, then all required dataset locks exclusive in lexicographic lock-name order; Board-only takes K. Workspace create/delete dependency reads use the existing preference lock name for xai_board_workspaces and Board K in the same sorted acquisition. No acquisition order may start at K then request L. Migration/rollback/reset/account erasure take L exclusive, with no nested L acquisition. Existing deletion-workflow lock may precede L only for that existing recovery path; ordinary dataset writers never acquire it.

Add a narrow storage-owned protected-dataset API/participant registry. Storage owns locks/physical IO and rejects generic Board writes; Board core owns decode/validation/commands and never becomes a dependency of storage. AccountCoordination exports already exist; no generic policy engine or different account protocol is necessary. Participant absence/duplicate registration disagreement is a refusal, not permissive fallback. Eager Board barrel import in shellRegistrations currently loads core accountMigration registration before App render; the replacement participant must be eagerly and deterministically registered by the reviewed host bridge too, including account-recovery entry before Board route mount.

A normal command captures owner handle, physical key, originating auth/epoch generation, entity identities and intent revision before queueing; pending registry receives the intent synchronously. At L grant, after every K grant, after any approved async boundary and before publication: assert same live handle, complete matching committed-generation marker, no deletion tombstone or pending destructive barrier, same physical key, admitted client version, target incarnation and unchanged intended operation identity. Under final K, read raw exact bytes and validate the whole stored value before deriving a finite proposal. The read/validate/transform/serialize/setItem/readback segment is synchronous; do not await hashing or UI while holding it. Precompute immutable intent material before acquisition or use a synchronous canonical serializer/digest helper whose source must be reviewed. An unexpected await requires revalidation, not reliance on lock ownership alone.

Success requires exact serialized readback AND owner/marker revalidation, then same-tab publish of committed data. Write success/read denial is uncertain, retaining stable X/C/U/W identity and raw source/proposal. Retry reads first; matching immutable receipt plus valid successor chain acknowledges zero writes. Absent receipt with original exact source may retry same proposal. Divergent receipt, unexplained chain, unsupported capsule, missing marker or target replacement refuses; new current-source attempt is explicitly reconstructed, never a stale full-array overwrite. Lock unsupported refuses; no close-other-tabs promise substitutes for a working lock.

The command API validates the **declared touched fields** as well as projection difference. A user done-field command that writes the same final boolean still retires prior ownership; comparison-only diff cannot detect manual false→true→true intent. Pure unrelated no-op commands must not steal ownership. W metadata may change for an explicit relevant ownership event even where visible projection stays equal; true no-op automation still writes nothing. UI latest draft revision cannot be cleared by an earlier settled write.

### 3.2 First-upgrade and external ABA boundary

New gate code cannot prevent an already-running old bundle from calling native localStorage.setItem/removeItem. Web Locks coordinate only participants. Marker/token checks cannot detect a complete external byte-for-byte ABA restoration. **Technical admission requires verified quiescence/reload of every same-origin Board-writing document to the admitted build, including service-worker cached clients, before first capsule write or native acceptance.** Source search and two new cooperative tabs are insufficient. Missing quiescence evidence leaves cross-client write safety blocked; it is not a product preference or an excuse to waive B09. Unexpected external writes thereafter enter conflict; known external restore/import must go through §5. Arbitrary invisible external ABA remains a disclosed limit, never asserted solved. No service-worker change is granted here.

### 3.3 taskLinkCommand's actual await

Keep the existing recoverable ordered saga, not a Board/Tasks multi-key transaction:

1. L shared + Board K: validate source/card incarnation and Tasks availability snapshot, persist pending taskLink with W receipt, verified readback, release both.
2. mutateCanonicalDataset acquires L shared once, then **sorted canonical Tasks lock and Board K** via an exact optional read-participant extension to its existing implementation. Validate Board live incarnation and the same pending link inside its synchronous mutation callback immediately before Tasks write. It must not call the public Board mutation API while holding these locks or reacquire L. The extension accepts validated same-scope physical read keys, not arbitrary caller-supplied account lock names. Task store/schema/activation flag remains unchanged.
3. After await: reassert captured owner and auth handle. L shared + Board K anew, reread current Board, validate same incarnation + pending link/Tasks result; write only acknowledgement with W. If A→B or card deleted/re-added, preserve recorded pending/partial result and refuse acknowledgement; no B UI success. User retry reconciles already-created task without duplicate creation.

Without step 2's common lock ordering, wrapping ensureBoardTaskLink in a Board lock either leaves its task callback racy or can deadlock behind queued account-exclusive migration. This is the precise reason canonicalCommandState.ts is a proposed protected extension. Awaited server deletion has a different durable continuation contract (§6); it must not be cancelled just because the current account became B.


### 3.4 Proposed exact API boundaries for contract amendment

These signatures describe finite responsibilities; names remain unadopted. Storage's new protectedDataset module would expose registerProtectedDatasetParticipant("xai_boards_v2", participant), mutateProtectedDataset({key:"xai_boards_v2", scope, intent, expectedRaw}), prepareProtectedDatasetLoss({scope,cause,targetIds}), and commitProtectedDatasetLoss({scope,plan,decision}). The participant has synchronous validateWholeRaw, applyIntent, verifyReceipt and prepareMigrationCandidate functions. Intent is a validated discriminated union (ordinary/conversion/completion/inverse/create/delete/seed), not a generic untrusted next-value setter. expectedRaw fences reconstruction; participant receives current immutable decoded data only inside the lock. The public registry's missing/conflicting participant is fail-closed; package-specific schema stays in board-core.

Mutation result is a discriminated result: verified {operationId,physicalKey,raw,changed}; or refused/uncertain {reason,operationId,rawSource,proposalRaw?,receiptState}. Reasons distinguish account-changed, marker-changed, deleted/deleting, lock-unavailable, unsupported, invalid, conflict, quota, storage-unavailable and readback-uncertain. No operation sets a React success state from Promise existence. The capability used by internal raw commit is lexical, single-operation and never serialized/exported.

Lifecycle preflight is registerDatasetLifecycleParticipant(participant) plus requestDatasetLifecycleDeparture({scope,reason}) with reason manage/import/restore/reset/delete-account/sign-out/controlled-reload. It reserves a first intent synchronously, returns a typed Promise of stay or an exact operation-bound decision, and never looks up a new account after awaiting. The host recovery registry provides that participant; storage absence can permit only demonstrably no Board data/pending/history loss, otherwise refuses. It does not delay unsolicited auth revocation.

For new account-deletion requests propose AccountDeletionIntent version **2** and AccountDeletionReceipt version **3**, each with boardLoss:{version:1,planId,sourceManifestSha256,decision:"verified-export"|"explicit-discard",bundleSha256:string|null}. Complete loss manifest bytes are retained in the existing intent before server dispatch and transferred/retained for recovery; proof is not just an unauditable hash. Version 3 otherwise preserves owner/kind/generation/phase/updatedAt/authGeneration semantics. The exact new intent is the pending writer fence. Legacy versions remain readable under §6's explicit continuation rule. These version tags and fields require fresh independent schema review/root adoption, not this report's authority.


## 4. Exact proposed capsule and field-owned inverse (T2)

The following is a **specific proposal for review**, not an adopted type or name. Store optional Board property **checklistRecovery**, tag **kind:"xai.web.board.checklist-recovery", schemaVersion:1**. Keep the outer Board[] or kind:"xai.web.board.storage"/schemaVersion:1 envelope and existing xai_boards_v2 key. Do not silently enroll Board in the Task/Calendar canonical envelope. Existing item shape remains id/text/done.

Finite proposed capsule fields:

| Field | Proposed encoding and invariant |
| --- | --- |
| kind, schemaVersion | Exact tag/version above. Presence with any other shape/version, null, wrong type or colliding data refuses all Board mutation, preserves raw export. Absence alone permits first tracking. No rename/overwrite of collision. |
| lineageId, boardIncarnation | Nonempty generated UUID strings, collision-checked under K. New Board/replacement/import creates fresh identity; ordinary edits retain. Visible Board/card/row ID is never an incarnation. |
| head | null or the last journal entry ID. Every entry has unique id, previousId and digest; one linear ordered chain, no dangling/duplicate IDs or cycles. |
| journal | Array of immutable entries {id, previousId, kind, body, sha256}; kind is one of baseline, ordinary, conversion, completion, inverse, import, restoration. body is an exact JSON string, sha256 lowercase 64-hex digest of its UTF-8 bytes. Entries are append-only; no reserialization of older body strings. Parser rejects duplicate object keys in protocol bodies and validates all known structure. |
| entities | Ordered list/card/row identity records with visible ID, parent incarnation, immutable incarnation, live/deleted state, and field-writer token references. Distinct IDs are required in their actual addressing domains, including card uniqueness within Board; duplicate ambiguous targets refuse mutation rather than select first. Deleted records persist as descriptors; replacements allocate new records. |
| writers | Current tokens for completion-relevant field coordinates: representation/card incarnation, row done+row incarnation, aggregate done/total, completedAt property, and lifecycle/existence. Token names an immutable journal entry plus field index; value/presence must match validated replay at the current projection. Text-only/order/date/priority/labels changes preserve done token. |
| terminal | Separate append-only {completionId,inverseId} links derived from immutable inverse entries; exactly one terminal U per X. X body is unchanged when U appears. Repeated U reads/acknowledges terminal status without another inverse or resurrected capability. |
| retainedSources | Nonrecursive conversion/import summaries and exact original protocol blobs necessary to explain historical legacy pairs, retired or foreign history. Never use this section as live token authority. Large source data remains finite; no recursive nesting of the full receipt-bearing dataset. |

Completion X body freezes stable operation/trigger/rule ID, historical owner kind/account/generation/physical key/epoch, local day/live mount or click/move identity, timestamp, prior head, raw source digest, Board/list/card/row incarnations, ordered affected target set, full relevant pre-flag vector or legacy pair, property-presence pre/post tags, completion/move/actual normalization/urgent/sort deltas and P0 counters, and projection digest excluding capsule. A presence tag is exactly {present:false} or {present:true,value:<validated JSON value>}; absent is not null/empty. Include exact falsy completedAt prevalue when admitted. Store only actual finite source rows, never allocate total aggregate-count slots. Receipt body ownership is historical evidence; live capability is a new captured scope plus validator/lock checks.

Conversion C freezes original legacy pair and immediate pre-conversion pair (which can differ after X), plus genuine user-authored new rows/IDs and explicit preview acceptance. Count-only 1/3 remains unknown titles/vector; automatic 3/3 does not create historical rows. Real arrays, including empty, take precedence; real user names Item 1 and legacy-looking IDs are preserved literally. Ambiguous already-materialized rows remain real stored rows with unknown provenance, never bulk-cleaned by regex. Every actual unknown Board/list/card/item/envelope metadata field is carried forward by lossless clone-and-patch. JSON serialization may change formatting/key order only; immutable raw pre-mount evidence and receipt body strings remain exact. If a value cannot be faithfully represented, refuse rather than normalize it into a seed.

Validation is two-layer: preserve old raw readability/diagnosis, then strict whole-value mutation admission. Require nonempty valid Board[] or valid nonempty v1 envelope; unknown outer metadata is retained, unknown schema/tag is refused. Validate every capsule, journal edge/digest/terminal link/token, current target mapping and finite safe counts 0≤done≤total without silently tightening historical data into loss. Unknown fields **inside this new protocol** are an unsupported extension and refuse mutation while preserving bytes, not dropped. Real array versus stale aggregate is classified, not treated as absence. No fallback seed on read denial, duplicate identities, malformed JSON, unsupported capsule, invalid domain or empty dataset. Projection/receipt changes to one Board preserve all other Board values and envelope metadata.

U is whole-operation conditional inversion: same incarnations, live unarchived targets, X owns every field it proposes to restore, current values equal X postvalues, no representation or relevant-field replacement, all X targets eligible. Otherwise zero inverse writes with per-target reasons and retained X. Restore only X's false→true flags or known legacy count pair and X-created/falsy→T marker. Preserve manual true, T0, later text/date/priority/order/moves/labels and new distinct rows; derive real counts from **current** remaining array. Deletion of an unrelated original-true row does not resurrect it or necessarily block U; deletion/re-add of an X-owned row does. Multi-card one-target conflict blocks all of U. Archived target can become eligible again only with continuous validated incarnation and no relevant intervening write; a deletion/restoration boundary changes ownership and refuses stale U.

W must record declared checklist representation/replacement/toggle/removal effects even when rendered values coincide; delete/re-add cannot reuse old incarnation. Account-generation change alone never resurrects a W/X handle. In A' a new U intent may read validated same-account historical X and current lineage; it captures A' authorization anew. Imported/retired tokens are not live merely because owner IDs match.

No-op normalization nuance remains source-exact: completeCard may compute a normalized card, but applyBoardAutomationLite drops transformedCards when no card changed; a sibling completion can make incidental normalization persist. Freeze actual normalization separately; do not invent unconditional cleanup. X→U in same live mount retains consumed board/day trigger; later manual/cross-list/new-mount/day-eligible invocation Y remains normal automation. Y no-op does not steal X fields. X→U→Y has three distinguishable immutable records; undo Y restores Y preimage. No configurable rules, new midnight scheduler or durable suppression flag is proposed.

Finite capacity: validate and size the finite full proposal, then one setItem with receipt. On quota/serialization/capacity refusal, old projection/history remains and pending intent is retained/exportable. No history-count/time eviction, background pruning, successful write without receipt, or infinite retention claim. Explicit loss-authorized deletion is distinct from pending-discard. Old terminal U entries survive ordinary operations and roundtrip.

## 5. Migration, imports and exports (T3)

Source defect is concrete: Board core accountMigration.ts registers **isBoardArray**, whereas readBoardStorage accepts array **and** v1 envelope. Core index imports that registration; Workspaces index adds only panel/inbox/filter validators. Fixing capsule validation only in UI leaves migration rejection and raw-copy adoption untouched.

Proposed owner participant validates complete Board storage and provides three separate modes:

- **Same-account forward generation copy:** under exclusive L, raw previous generation plus marker and Board lineage are frozen; validate all capsules and preserve immutable journals/terminal links/incarnations, record generation transition as historical mapping in a new candidate receipt. Physical owner fields in old X remain historical, never rewritten. Current-field tokens stay usable only with continuity proof from the archived previous raw and migration journal. Reassert source/marker after secrets awaits; candidate readback precedes marker-last visibility. Missing or invalid Board data refuses migration, leaving originals and candidate recovery intact.
- **Unassigned/foreign/file replacement:** archive original bytes and capsule verbatim, validate coherence, allocate new local Board/card/row incarnations and local writers tagged import. Retain old X/U as historical/non-executable in retainedSources; do not import executable field tokens, account handles or an old un-undone head. UI says historical receipt preserved but automatic inverse unavailable across replacement. Existing local retirement links remain retained in same-account replacement archive/receipt. If replacing a nonempty dataset, §6 loss guard precedes write. No current production file importer is claimed; public helper outputs must label this requirement rather than silently return an adopted live capsule.
- **Rollback/restoration:** current rollback merely exposes previous marker, so it can revive X after U was recorded in a successor generation. Proposed replacement is a fresh forward generation containing selected prior projection, lossless union of reachable current/prior histories and terminal U links (same ID/different bytes refuses), fresh restoration ownership tokens/incarnations for replaced entities, and retained source references; marker written last. Never rewrite an archived generation. Old U cannot become pending again. If required history is missing/unreadable, refuse and keep both generations available; no guessing from equal visible IDs/bytes.

These are exact technical amendments for review; they do not authorize a migration rewrite here. Same-account ordinary reload is not import and keeps valid U eligibility. Genuine restoration invalidates conflicting inverse ownership while retaining preimages, consistent with existing whole-inverse conflict rule; it is not a retention expiry. Account physical-key change with a valid forward-copy chain allows new A' inverse capture; account-name equality alone does not.

Whole/raw exports preserve raw stored Board bytes and the entire capsule. createBoardExportPayload currently includes full boards, storageValue and logical Board.payload (good preservation structure); readBoardExportPayload checks logical IDs but does **not** compare all duplicate projections/payload contents. Proposed validation requires exact lossless semantic equality among storageValue boards, top-level boards, logical Board payload and projected list/card payload+counts, allowing only documented export timestamps. Contradictory duplicate representations refuse, never prefer the convenient one. Unknown envelope metadata remains in storageValue. Logical-only output cannot claim a reversible full-dataset roundtrip without envelope/raw companions. Current items-first derived counts remain canonical.

Account local export currently exports only captured current generation; prior/candidate generations and unassigned archives are separate. Account-wide erasure needs a Board recovery bundle covering every Board record in the actual destructive prefix, generation-marker/lineage references and retained deletion/restoration evidence, with exact physical names and bytes. Never label a current-generation export a complete backup of all erased histories. Credential exclusions remain; foreign account content is never displayed in B. Storage refusal/malformed bytes remain exportable as opaque raw only when owner authority permits reading.

## 6. Actual departure and destructive reachability (T4)

Actual route: router.tsx /app → ProtectedAppRouteElement → App → AccountStorageGate/AccountDataGate keyed fragment → AppInner/Shell/Outlet → shellRegistrations.tsx with boardWorkspacesWebModuleRegistration → package registration's BoardWorkspacesModuleRoute → BoardWorkspacesModule. The Board wrapper currently does not mount DepartureCoordinator. Existing host coordinator is public structural capability for route/sign-out, supports first-intent arbitration/live-blocker release-once, but exportDraft/discardDraft are synchronous void and its state dies on unmount. settingsDeparture owns only one mounted delegate. Reusing it alone cannot guard management events, reset, account deletion or forced auth gating.

Proposed finite integration:

1. Add a Board-owned recovery registry/service (memory, per captured account) mounted through an **AppProviders sibling host above RouterProvider's routed/account-remounted subtree**. Register current pending intent synchronously before any async write, not in a cleanup effect. Store exact latest draft/source/proposal/uncertainty separately from successful durable history. Account scope invalidation immediately masks A; no A content in B, locked or unauthenticated view. Service survives subtree unmount, not browser termination; reentering A' requires new explicit revalidation, never automatic stale commit. Controlled route departure keeps only a masked generic pending indicator outside owner context.
2. Add App-owned Board route adapter like existing pomodoroRegistration: one DepartureCoordinator, structural Board guard, first-intent reservation. Extend coordinator only through an opt-in async resolve capability for this caller: reconcile uncertain commit first, then stay/retry/export+verify or explicit pending-discard; existing synchronous callers retain their exact ordering/behavior. Cancel or failed export never proceeds. Guard lifetime is registry-backed; cleanup unregisters UI capability without deleting intent.
3. App.handleSignOut consults the Board recovery bridge before invalidateAccountIdentity and before SDK/sign-out/clearSessionStorage. Preserve existing rail then Appearance ordering and current Settings delegate; no double Board prompt. After each awaited decision recheck account/auth handle and first-intent identity, execute a single navigation/invalidation. Remote auth revocation cannot be delayed by a save dialog: mask immediately, fence operations and retain owner-scoped memory. Never modify Supabase/auth security semantics to preserve a draft.
4. AccountDataGate's manage handler currently locks **before** inspection; call a registered asynchronous lifecycle preflight before that lock and before children disappear. Recheck captured account after await. Import/rollback buttons use an exclusive-L destructive plan only after preflight. Remote generation marker/clear events still revoke synchronously, with pending data already in registry, not an attempted async block in a storage event.
5. Board/modal/switcher close use registry first-intent logic for unresolved operation: close may transfer recovery surface to parent, never clear the only pending intent. Changing Board selection, deleting target or last-board reset uses captured target and retained history. Already verified history survives ordinary route/modal/Board selection and same-account reload without a prompt. No guard merely because old X exists.
6. Browser refresh/tab-close registers beforeunload when pending. Browser Back/Forward uses real blocker; controlled in-app reload uses preflight. Forced termination, browser crash, storage denial plus forced close, and external account eviction cannot be guaranteed to preserve never-persisted memory. Warn truthfully; no autosave-to-another-account or promise of disk persistence. Existing committed receipt remains recoverable only while its physical bytes survive.

### 6.1 Verified export acknowledgement and destructive plan

For Board deletion/last-board replacement, global reset, import replacement, account-generation restoration and account deletion, compute a finite **loss plan**: operation ID, captured owner/physical target set, exact source digests+marker raw, complete affected successful history and pending intent, cause and requested scope. Show separate actions: stay/retry, export and verify, or explicit destructive discard of the named retained information. Pending-discard drops only unsaved intent and never authorizes successful-history deletion.

A Blob + anchor.click succeeds only as “download requested.” A standards-based verification path is available without claiming browser disk privileges: request the user to reselect the downloaded recovery file, read its bytes, compare the exact expected bundle digest and complete target manifest, then obtain explicit acknowledgement bound to that plan. File cancellation, wrong/missing/truncated file, failed read, different digest or changed source grants nothing. This is an implementation interaction under the existing verified-export requirement, not a new QL/QU product decision. Native proof must inspect actual disk file/name/bytes independently; selecting an unrelated equal fixture cannot serve as runner evidence of a real download.

Human/file work holds no storage lock. Reacquire L/K in the right mode, reread all target bytes/marker, compare exact plan, then commit destruction; source change invalidates old grant and requires new plan. Export alone never acknowledges X saved/U undone. Explicit destructive discard can grant the exact operation without export; it must name loss of already-saved history and all affected generations, not reuse the current generic preference-reset text. Controls may use existing local styles only; no CSS extension is silently granted.

Global reset obtains preflight before **any** key removal or default broadcast, then L exclusive for account keys and existing per-key coordination for device prefs. This is ordered multi-key work, not atomic. Preserve refusal/partial-result recovery and do not emit defaults for unremoved keys. No broad change to preference meaning or other caller success contracts. If another accepted caller cannot tolerate the extension, independently review that precise conflict before adoption.

Account deletion is especially early: useAccountDeleteOrchestrator currently persists deletion intent and calls server **before** local receipt/wipe. The loss plan must be validated and a **durable Board-loss authorization fence** established under L exclusive before server request. Proposed additive metadata in the existing deletion-intent/receipt protocol records plan ID, owner/generation, Board target manifest/digests and choice (verified-export acknowledgement or explicit destruction). Board writer admission checks a pending deletion-intent fence in addition to existing deleted tombstone, so no new Board history appears while the server call awaits. No new storage key is proposed. Unknown server outcome retains the fence and receipt; explicit server authorization rejection may release only the matching intent, following existing recovery rules. A server-confirmed A deletion may still finish A after A→B, using durable exact request/receipt authority; never require current B permission or wipe B.

Existing legacy deletion intents/receipts predate this Board fence. Do not invent retrospective export proof or block an already-confirmed privacy deletion forever. They remain historical destructive authority with a recorded “legacy history-loss acknowledgement absent” limitation; original server-confirmed cleanup proceeds by its exact existing receipt. A *new* request may not use that legacy exemption. New receipt decoder/version amendment, deletion-intent parser, start/confirmed/resume and account-prefix eraser all require independent contract review (§7). No server endpoint/auth coordinator redesign is proposed.

### 6.2 Reachability decision

Current public APIs satisfy basic route/sign-out arbitration and account locking primitives, but **do not** satisfy full BRD lifetime/global-loss requirements. The exact protected host/storage/lifecycle extensions below are necessary; a hook-only 24-path implementation cannot truthfully pass T1/T4. Client quiescence and real browser/account/native evidence remain missing external technical conditions. This report does not substitute a new owner preference, approve weaker standards or claim T1–T4 runtime closed.

## 7. Exact proposed protected extensions and acceptance boundary

Original 24 conditional paths are preserved verbatim in Appendix B. They remain conditional; this report's only writable paths are impact.md and inputs.sha256. The following **additional exact paths** form a finite proposed patch surface, not a grant. Each role is necessary for one source-proven edge. No wildcard “all necessary files” scope; no shared CSS, router topology, auth backend, service worker, config/lockfile or Desktop edits.

| Exact additional path | Proposed narrow responsibility |
| --- | --- |
| packages/plugin-web-board-core/src/internal/checklistRecovery.ts (ADD) | Pure exact capsule codec/validation/delta/field-token/inverse/import/restoration logic. |
| packages/plugin-web-board-core/src/internal/boardMutation.ts (ADD) | Board command adapter to protected dataset API; metadata-preserving W/X/C/U, independent of React. |
| packages/plugin-web-board-core/src/index.ts | Public export of the two owned APIs; deterministic participant registration. |
| packages/plugin-web-board-core/src/internal/accountMigration.ts | Replace array-only validator with whole-storage participant, explicitly including copied generations. |
| packages/plugin-web-board-core/src/internal/exportImport.ts | Coherent full payload/capsule validation and historical import classification. |
| packages/plugin-web-board-core/src/BoardModule.tsx | W10 async writer/seed adoption and result-aware recovery. |
| packages/plugin-web-board-views/src/BoardModule.tsx | W11 async writer/seed adoption and result-aware recovery. |
| packages/plugin-web-board-workspaces/src/internal/useBoardCreateRecovery.ts | W07 async two-step recovery and workspace dependency locking. |
| packages/plugin-web-board-workspaces/src/internal/useBoardComposerRecovery.ts | W06 async stable intent/latest draft acknowledgement. |
| packages/plugin-web-board-workspaces/src/internal/useWorkspaceSaveRecovery.ts | W09 Board membership/selection dependency and async outcomes. |
| packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.ts | Three-phase shared-order participant and post-await incarnation checks. |
| packages/plugin-web-board-workspaces/src/internal/boardRecoveryRegistry.ts (ADD) | Captured-owner memory intents survive route/account subtree unmount; masks and revalidation. |
| packages/plugin-web-board-workspaces/src/BoardRecoveryHost.tsx (ADD) | Bounded recovery/export/reselected-file verification UI, no storage authority from UI. |
| packages/plugin-web-board-workspaces/src/index.ts | Public host/guard/registry adapter exports; no host internal import. |
| packages/plugin-web-board-workspaces/src/BoardCreator.tsx | Pending/cancel/export state uses completed result, not Promise truthiness. |
| packages/plugin-web-board-workspaces/src/BoardSwitcher.tsx | Await workspace create/rename/retry; guard selection/close with first intent. |
| packages/plugin-web-board-workspaces/src/BoardDeleteConfirmDialog.tsx | Exact successful-history loss disclosure and async result-aware confirm. |
| packages/plugin-web-board-workspaces/src/BoardSettingsModal.tsx | Preserve latest field draft and pending/error through async Board metadata save/close. |
| packages/plugin-web-storage/src/internal/protectedDataset.ts (ADD) | Narrow participant registry, L→sorted K command IO, loss-plan capability, marker/readback gates. |
| packages/plugin-web-storage/src/internal/storage.ts | Fail closed generic Board set/remove before equality fast path. |
| packages/plugin-web-storage/src/internal/prefMutation.ts | Deny generic Board replace/reset; exported generic async path cannot strip capsule. |
| packages/plugin-web-storage/src/internal/accountScope.ts | Refuse all raw scoped Board setters/removers; retain normal scope semantics. |
| packages/plugin-web-storage/src/internal/canonicalCommandState.ts | Optional same-scope read participant locks for Board→Tasks saga; no Task schema/activation change. |
| packages/plugin-web-storage/src/internal/accountMigration.ts | Whole-source Board participant, post-await validation, fresh-generation restoration avoiding retired-U revival. |
| packages/plugin-web-storage/src/internal/accountMigrationValidation.ts | Explicit validator/transform registry boundary; no missing-validator fallback. |
| packages/plugin-web-storage/src/internal/accountDataLifecycle.ts | Typed guarded erasure boundary; current/all-generation loss snapshot, preserve legacy confirmed deletion. |
| packages/plugin-web-storage/src/internal/accountDeletionReceipt.ts | Independently reviewed versioned loss-proof/fence fields and decoder, old receipt handling explicit. |
| packages/plugin-web-storage/src/AccountDataGate.tsx | Preflight before manage lock/unmount and before import/rollback intent. |
| packages/plugin-web-storage/src/index.ts | Narrow public dataset/lifecycle preflight APIs used by owning packages and host. |
| packages/plugin-web-settings-shell/src/internal/resetAllPrefs.ts | Await preflight before first removal; explicit partial/refused outcomes. |
| packages/plugin-web-settings-shell/src/SettingsFooter.tsx | Correct data-loss disclosure, awaited reset/result UI and disabled repeat action. |
| packages/plugin-web-settings-shell/src/types.ts | Precisely typed async reset result boundary; legacy override behavior reviewed. |
| packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts | Guard/fence before server request; preserve captured-A continuation and B masking. |
| packages/plugin-web-settings-rest/src/internal/accountDeletionIntent.ts | Durable exact loss-plan authorization and pending Board-write fence; backward reading. |
| packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts | Transfer proof into start/confirmed receipt and preserve resume semantics. |
| apps/web/src/providers/AppProviders.tsx | Mount BoardRecoveryHost above account/routed subtree; no auth/security behavior rewrite. |
| apps/web/src/App.tsx | Compose Board sign-out preflight with accepted rail/Appearance/settings ordering. |
| apps/web/src/routes/modules/boardRegistration.tsx (ADD) | Host-owned Board route adapter using existing structural coordinator. |
| apps/web/src/routes/modules/shellRegistrations.tsx | Replace exactly the Board registration with the host adapter. |
| apps/web/src/routes/modules/departureCoordinator.tsx | Opt-in async resolution/reconciliation; preserve existing first-intent/release-once interfaces. |

No edit is needed to settingsDeparture.ts merely to add a Board wrapper: the existing delegate can still carry sign-out; lifecycle preflight is a separate narrow storage public API. No edit to router.tsx/RouteGateElements/main.tsx is proposed: AppProviders placement follows the verified existing tree. No registry key/ownership change is required. No edit to usePref is proposed because Board callers adopt the new mutation adapter and generic setters explicitly refuse; readers remain intact. No Task store, Calendar consumer, auth-generation coordinator or Desktop adapter edit is proposed. The legacy Board module files are included rather than asserting their exported writers are permanently unreachable.

Finite **additional test-source proposals**, separate from all historical runners and the original four/core plus workspace tests (each is a proposed ADD, never permission to run):
- packages/plugin-web-board-core/src/__tests__/checklistRecoveryAdmission.test.ts
- packages/plugin-web-board-core/src/__tests__/boardWriterLifecycle.test.ts
- packages/plugin-web-board-views/src/__tests__/BoardWriterLifecycle.test.tsx
- packages/plugin-web-board-workspaces/src/__tests__/BoardAllWriterRecovery.test.tsx
- packages/plugin-web-storage/src/__tests__/boardProtectedDataset.test.ts
- packages/plugin-web-storage/src/__tests__/boardMigrationDeletionFence.test.ts
- packages/plugin-web-settings-shell/src/__tests__/BoardResetLossGuard.test.tsx
- packages/plugin-web-settings-rest/src/__tests__/BoardAccountDeletionLossGuard.test.tsx
- apps/web/src/__tests__/BoardDepartureLifecycle.test.tsx

Exact public API/lifecycle documentation amendments would use these verified existing owning paths, separately reviewed before product adoption:
packages/plugin-web-settings-rest/docs/api.md; packages/plugin-web-settings-rest/docs/design.md; packages/plugin-web-settings-shell/docs/api.md; packages/plugin-web-settings-shell/docs/design.md; packages/plugin-web-board-workspaces/docs/api.md; packages/plugin-web-board-workspaces/docs/design.md. Storage has no existing api/design pair at this parent; propose exactly packages/plugin-web-storage/docs/board-writer-lifecycle.md (ADD), beside the existing usePref-write-results.md, for the new public boundary. No absent path is labeled existing.
The eight original checklist/automation owning docs remain in the original 24. Contract amendment and review must spell precise API/error/schema/backward-read behavior, exact selected subset of these paths, before oracles and semantic locks. This list is not a unilateral standards waiver or wholesale account refactor. If any listed existing path or public boundary cannot support the narrowly stated responsibility, stop for a new versioned technical impact/review rather than expand.

## 8. Required before/fixed proof and truthful gates

All original B/R rows are included verbatim in Appendix A/C. New participant proof must cover **each W01–W21 row**, mapping actual source → permitted/refused path → exact physical key → L/K mode/order → held-lock interleaving → post-await handle/marker/incarnation check → result/readback → history preservation. A grep or static lock call count is not runtime proof.

Finite additions to the unchanged business matrix: concurrent ordinary edit versus X/U; manual done no-op ownership; both task-link Board phases and pause inside Tasks lock acquisition; account exclusive queued before/after Board; copied-source migration containing Board when no selected Board import; rollback after terminal U; old-client attempted write versus proved quiescence; array/envelope unknown metadata; collision/unsupported capsule; account-prefix multi-generation history loss; route/POP/rapid route+sign-out first intent; manage-before-unmount; auth revocation masks; export failure/reselected wrong file/digest match with source changed afterward; server unknown outcome barrier; legacy confirmed deletion remains resumable; last-board deletion failure never reseeds/changes selection. These require a reviewed source-qualified runner and actual public host, not monkey-patching away the writer under test.

N-L (truthful legacy information), N-U (field-owned inverse) and N-P (ambiguous provenance) remain genuinely new assertion purposes compared with old synthetic-row/forward-only assertions. New W/lifecycle assertions extend technical admission; they do not create new broad Board/host/account/native units. Exact source/driver/case/process lineage and cost admission must precede any runtime. Real account generation and real browser second document are mandatory, not seeded account objects relabeled provider evidence.

Protected extensions invalidate relevant prior shared-source invariance exemptions. In particular App/departureCoordinator/storage/prefMutation changes touch Header, rail, Appearance, settings, widgets/grid and shared caller behavior. Full canonical Clock r2 **E1–E25**, native exclusions only within their actual unchanged bounds, E24 frozen originals plus C-FB002/OE/C-RD1 judging and C-FD1 diagnostic remain required. Canonical §14 is copied verbatim in Appendix D, including 16 F1 invocations and complete E24 counts. No blanket rerun and no blanket inherited PASS: each required evidence item gets source applicability, producer SHA/path/hash and verdict/refusal. Missing/exhausted/unqualified Clock work remains missing.

Sequence: **fresh independent impact review → exact versioned technical contract amendment → fresh full contract review → root explicit path/schema/API/semantic-lock adoption → source-qualified full B/R/W oracles and budget admission → valid full original-product before → separately authorized implementation → independent fixed/native/visual/affected regression → actual cross-vendor → fresh full Astra acceptance → root reconciliation → independent integrated inventory**. No stage self-adopts the prior one. Same-caller author is not the next reviewer/verifier. No raw-source grant can come from a documentary APPROVED label.

## 9. Permanent history, static cost and failures

Technical-impact iteration **1/3**, **one consumed static pass: FAILED**. Complete input hashing succeeded, but the supplementary ledger-shape helper failed; later field/evidence/state comparisons were unrun. No corrected helper or second semantic acceptance pass was run. Fresh independent review must assess those unrun preservation assertions; deterministic document construction and input/output/parent/scope/hash identity closure do not retroactively convert this author result into PASS. Prior preparation author **2/3** and full contract review **2/3** remain consumed; author/review r1 retained. Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/children **zero each**. No script imports product code, launches a runner or reproduces product behavior.

All old append/native/package/account/shared histories remain transitive full-byte inputs. Seven rejected-append artifacts remain: five diagnosis + two Sol original-three; six archive roots WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM plus separately retained main-checkout before. Three assertions are not three executions. Detail calibration/view-fixture/final roots vR4Xvt/QNw9Ce/H1Ap2r have 5/8/8 case sets and failures; author-tests-rerun root 0NW1Ae is separate mode. Native Chrome PIDs14575/15385/17812/18500 prove four sessions, not four filenames. Board full-package roots lpCkP7/zYQAbA/qnu7yE plus BmWgbG retain nine historical fixture failures and repair lineage. D1/Task-link modes, initial PID23393, blank before-fixture artifact and admitted PID23613 retain distinct source/cost classifications. Blank log is not zero launch cost.

Policy-era formal/probe subdivision remains **unknown** where unreconciled. ≤3 formal per actual permanent unit includes refusal/precondition/launch attempts; probes disclosed separately. Changing actor/name/vendor/worktree/driver copy never resets counts. Unknown/exhausted affected reused unit has no automatic allowance; this does not make all independent new assertion purposes unknown. Clock Q1 focus1/3, six other units0/3; development2/83; retention3/3 exhausted,145 assertions,41/42 case executions, last14/14 not qualification. Clock R1–R6/impact2 and old B70/refusal/calibration histories remain. REL vendor histories unknown and TT08 actual vendor3/3 do not confer BRD credit. No fourth/renamed/probe-reset run.

Read-only commands: git status/rev-parse/show/diff/diff-tree/ls-tree/cat-file, rg/cat/sed and standard-library Python JSON/raw hashing. Exploratory path guesses were absent (storage/internal/engine.ts, routes/modules/BoardRoute.tsx, settings-shell/SettingsShell.tsx, and the xai-web-settings-shell/docs directory); command errors were retained, then actual paths were obtained from source. During supplementary ledger inspection a Python helper used sections[].items instead of the actual sections[].tasks and raised KeyError before its field/evidence comparison. That failed diagnostic is retained and was not rerun; no fresh 312-field-comparison PASS is claimed. TODO full-byte equality to the original was checked before the error. Full original/source-map/execution inputs were independently hash-validated, and the prior source review's complete 312/39/933+6 comparison is retained as historical evidence. They were source-location mistakes, not runtime attempts or input hash drift. The full-manifest JSON returned by one static helper exceeded tool output display capacity; complete validation finished with zero mismatches and its trailing count/hash receipt was retained. Manifest is reconstructed deterministically from the validated inputs and asserted against that digest before writing; no validation success is inferred from truncated display. The first deterministic output-construction invocation failed at Python stdin parsing with a non-UTF-8 SyntaxError before any execution/write; bounded ASCII payload transfer was then used. This construction failure is retained and does not trigger another semantic validation pass. No product/test command was launched. Memory registry quick search found no relevant BRD record; no memory evidence was used.

All inputs were read/validated and both output buffers constructed before either file write. Final exact two ADD scope, direct parent, output SHA-256 and clean status are reported in the commit handoff. No source repair, protected edit, global control/ledger/inventory write, push/fetch/sync-check, other-worktree access, merge/rebase/promotion/deployment/release/D3. Parent owns remote preservation/integration. Formal **13 completed / 3 verification_pending / 3 in_progress / 293 pending =312; 299 unclosed**, original **933** evidence plus exact TT08 **six** =939 remain unchanged. Documents and source preservation are not caller acceptance, READY_TO_SHIP, SHIPPED, runtime qualification or item closure.

## 10. Review decision requested

Independent reviewer should accept/revise this finite design against T1–T4, particularly common lock ordering/task phase, first-upgrade quiescence, capsule collision/immutable body/current-token validation, rollback retirement, old confirmed deletion compatibility, and pre-server/pre-unmount loss fence. Any discovered gap remains a technical correction with inherited iteration count, not a default QL/QU question. This author does not adopt its own design. No source-proven irreducible owner conflict has been found.


## Appendix A - complete conditional B01-B12, retained verbatim

The following is source proposal section 4, a complete future obligation, not an observed result.

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


## Appendix B - all 24 original conditional paths and protections, retained verbatim

## 6. Exact candidate implementation allowlist and protected semantic locks

**Current write allowlist remains the two preparation documents only.** The following is a proposed maximum list for a later root-registered implementation card after fresh independent review of §5, valid before evidence and source/lifecycle admission. Paths not selected by that concrete card remain protected; new schema/provenance files beyond this list require another review. Each ADD named here is a proposal, not an existing file claim.

```text
packages/plugin-web-board-core/src/types.ts
packages/plugin-web-board-core/src/internal/boardOps.ts
packages/plugin-web-board-core/src/internal/automationLite.ts
packages/plugin-web-board-core/src/internal/isBoardArray.ts
packages/plugin-web-board-core/src/internal/storageContract.ts
packages/plugin-web-board-core/src/__tests__/boardOps.test.ts
packages/plugin-web-board-core/src/__tests__/automationLite.test.ts
packages/plugin-web-board-core/src/__tests__/isBoardArray.test.ts
packages/plugin-web-board-core/src/__tests__/storageContract.test.ts
packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx
packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx
packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery.ts
packages/plugin-web-board-workspaces/src/internal/useBoardChecklistOperation.ts [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardChecklistOperation.test.tsx [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardWorkspacesModule.test.tsx
packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx
packages/xai-web-board-checklist-editor/docs/design.md
packages/xai-web-board-checklist-editor/docs/api.md
packages/xai-web-board-checklist-editor/docs/test.md
packages/xai-web-board-checklist-editor/docs/dev_log.md
packages/xai-web-board-automation-lite/docs/design.md
packages/xai-web-board-automation-lite/docs/api.md
packages/xai-web-board-automation-lite/docs/test.md
packages/xai-web-board-automation-lite/docs/dev_log.md
```

No CSS edits are proposed. Reuse current scoped board/recovery controls; if B11 cannot pass, freeze and register exact local selectors/files for independent impact review first. Protect **all shared CSS/tokens**, board/core/workspaces/views styles, shell/App/router, Dashboard/Clock/Header/AppRail, storage engines/hooks/account lifecycle/registry, task-link protocol and task store, Desktop plugin-project and adapters, schema/keys outside reviewed Board additions, all configs/lockfiles, original contracts/runners/failures and global states. No wildcard test directory permission. Read-only affected packages may gain separately registered tests if the reviewed impact matrix demands them, never ad hoc product edits.

Semantic locks: single writer for xai_boards_v2 checklist representation + Done forward/inverse + BoardWorkspacesModule/detail-recovery; exclude simultaneous BRD-18/task-link, BRD-28/import/export, ordinary-field recovery or list lifecycle changes sharing these paths. Shared-persistence and account-lifecycle **read dependencies** require source parity and integrated regression; touching their writers expands scope and stops this task. Calendar/date consumers are protected. Controller-receipt-lock is root-owned, never held by this worker; physical worktree isolation does not establish semantic independence. A later product SHA must account for any intervening relevant source delta via fresh review, never automatic rebase/merge.


## Appendix C - complete R01-R12 and accepted-caller obligations, retained verbatim

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


## Appendix D - canonical Clock r2 full section 14, retained verbatim

Historical roles and not-rerun bounds apply exactly as written; changed App/shared source removes corresponding exemptions. No runtime authorized.

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


## Appendix E - original BRD-12 record and TT08 evidence additions, retained verbatim

## 10. Exact retained source records

### BRD-12 full scope-map record (verbatim JSON values)

```json
{
  "id": "BRD-12",
  "priority": "P2",
  "kind": "决策",
  "action": "Checklist旧计数迁移与Done自动勾选规则明确化",
  "acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-12",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-12"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-12/prepare",
    "BRD-12/contract-review",
    "BRD-12/before",
    "BRD-12/implement",
    "BRD-12/verify",
    "BRD-12/accept",
    "BRD-12/reconcile",
    "BRD-12/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

### Dispatch TT-08 record: six new references preserved, not TT-06 completion

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```



## Full retained source 68d0f14b243a1becb70811ca01a503cdcd244022 / docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md

Source SHA-256: e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf; source manifest identities: 30933.

# BRD-12 writer/lifecycle impact review r1

**Verdict: APPROVED for the finite T1–T4 technical design basis only.** The proposal at `11d6527709a5a735200151768296a312a3a30314` supplies a source-grounded, bounded route to address the complete writer and lifecycle admission problem. No blocking contradiction was found in that proposed basis. This does **not** adopt the capsule/schema, API, storage key, migration, protected paths or product changes; T1–T4 runtime admission is still unproven. The next step is an exact versioned contract amendment and fresh independent full review, followed by explicit root adoption. BRD-12 remains pending.

## 1. Fixed identity and independent role

Module **web**, workflow D under the sole A-Codex controller. Fresh independent reviewer `/root/parallel_d_brd12_lifecycle_impact_review_r1`; never repair, no children. Task card specifies gpt-6-astra; a configured model is not independent provider attestation or cross-vendor evidence.

- Sole writable checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-lifecycle-impact-review1-20261010/XAI_Desktop`.
- Clean direct dispatch parent: `b9ed5f63256620b1135ba9e782f08992923bd3c4`.
- Fixed input: `711cfd8d7a587468d4ff133eb6d5911ad4dd79ef`; immutable product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd12-writer-lifecycle-impact-review-r1.json`.
- Full sources: impact `11d6527709a5a735200151768296a312a3a30314`; full conditional review `cdb8820b434aa7f2adb9cc5ad5f14118eb24230c`; full proposal `5fa4cccb106d10e16562e0a8d6f3b103495607b1`. Each source adds exactly its two documentary artifacts; source copies are checked against immutable Git blobs.
- AGENTS, CLAUDE, shared workflow and multi-machine rules, original goal, authority overlay, goal-D, scheduler, registry, current control, exact card and complete source documents were read. Root's explicit no-push/no-global-write worker bounds govern this checkpoint.
- Only this `review.md` and sibling `inputs.sha256` are ADD outputs. No source correction, product/test/config/CSS/schema/host/ledger edit is authorized.

## 2. Independent integrity and preserved original scope

One independent static pass read and rehashed **all 25632 source-manifest identities**, including the complete **20349** prior-review identities: **25621 raw blobs, 10 raw tree objects, one external original goal; zero mismatches**. Raw trees were read as length-delimited Git object bytes, not pretty tree text. Source-manifest SHA-256: 63bbf0af40529bc0765910fad3329713380a5d4292229abc8d3ad076a75d43db. This review manifest has **30933 identities**, adding fixed-parent/source/registration references. Full-byte hashing proves preservation, not semantic review or execution of every transitive file.

Independent JSON comparison used the actual **sections[].tasks** schema: all **312 ordered rows / 2808 original task fields**, each source-map counterpart, each complete retained execution record and ordered evidence were checked. Exact original_module/source and the **39 reversible raw-label normalizations (30 web（project-system）; nine web（跨模块验证索引）)** are retained. All **933** original references remain in order; only the exact six TT-08 references are added, giving **939**. Formal totals remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**. All three ledgers equal the author dispatch parent; TT-08 acceptance does not close TT-08 or TT-06.

P0 to review-parent apps/packages/package/lockfile comparison contains exactly the four already-received Time Tracker **api/design/dev_log/test.md** documents. Board/storage/host/CSS runtime is still P0; documentary differences are not runtime parity failures. Canonical Clock r2 full SHA-256 remains 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. B01-B12, all 24 original conditional paths, full R01-R12 and canonical section14 were independently compared to their complete source blocks.

The original action is **Checklist旧计数迁移与Done自动勾选规则明确化**; full acceptance is **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围, source `02-tasks-time-boards.md;05-visual-ux-audit.md`, original evidence empty, formal pending. Neither a truthful count alone nor a documented automation rule closes reversible Done.

The reviewer independently evaluates the preservation assertions left unrun by the author. This is a new review pass, **not a repaired/rerun author pass**. Impact author static1 remains **FAILED**: supplementary helper assumed `sections[].items` instead of actual `sections[].tasks` and failed before field/evidence comparisons. Its non-UTF-8 construction SyntaxError occurred before execution/writes and remains in history. Original failed and unrun statuses cannot be retroactively relabeled PASS.

## 3. T1 — complete writer inventory and serialization basis

The actual source census supports W01–W21. It includes reachable writers, exported alternate modules, generic primitives, marker writers and destructive erasers, rather than counting only the currently rendered hook. Relevant current source coordinates are fixed-parent/P0; all proposed changes below remain unadopted.

| Row | Independent source assessment and required preserved admission |
| --- | --- |
| W01 | Workspaces usePref, stable-absence mount seed and writeActiveBoard/writeLists are whole-array sync writers. Replace captured-render overwrite with a typed intent derived from authoritative locked source. Unreadable/invalid must never become seed. |
| W02 | Label/member strip and Board metadata/visibility changes rewrite the Board value. Lossless unrelated metadata/capsule preservation is mandatory; awaiting actual result must precede draft clearing. |
| W03 | Detail/field/list/card/archive/delete and Calendar/Table/Planner callbacks share writeLists/updateCard. Declared relevant-field intent, incarnation, existence and done tokens must update even for a same-valued manual done command; unrelated field changes retain ownership. |
| W04 | Mount/day/manual and genuine cross-list move automation use the same raw writer. Cross-list moves can affect other Done cards, including when moving out of Done. Actual completion/normalization/urgent/sort/move effects must be attributed separately. |
| W05 | Detail recovery performs exact source/readback checks but invokes a synchronous boolean save. Adapt without losing latest draft, stable append ID and collision logic. Both checklist synthesis sites must stop inventing rows. |
| W06 | Composer creates cards/lists and clears its pending state on save callback truthiness. Register intent before awaiting and await the typed outcome; new entities require new incarnations. |
| W07 | Board creation is Board-save then separate active selection with partial-success handling. Keep that ordered recovery, jointly lock workspace membership/Board dependency, then recheck owner and created Board before selection. No cross-key transaction claim. |
| W08 | deleteBoard currently selects first, writes without checking result, closes confirmation and can recreate defaults for last deletion. Guard before the first effect; commit/readback before selection/dialog closure. Exact last-Board loss and fresh replacement identity must be explicit. |
| W09 | Workspace recovery writes workspace/selection, reads Board membership and denies nonempty deletion. It is a dependency participant, not an invented Board writer. Shared L plus sorted workspace/Board K must encompass membership proof; no absent workspace-move feature is claimed. |
| W10 | Core BoardModule is an exported real writer with queued seed. Not the active route does not mean unreachable. The explicit adaptation path is necessary; raw refusal alone cannot make existing controls claim success. |
| W11 | Views BoardModule is also exported with ordinary mutations and seed. Same participant/result-aware adaptation requirement, rather than a route-only exclusion. |
| W12 | taskLinkCommand.saveLink performs a pending Board write, awaits canonical Tasks mutation whose callback rereads Board, then a Board acknowledgement. A single lock around the outer function would be inadequate or reentrant. The proposed three-phase saga and optional same-scope read-lock participant close the design gap without claiming Tasks/Board atomicity. |
| W13 | storage setPref/removePref and async mutatePref can replace/remove an unknown-JSON Board value. Refuse Board at every generic path, before equality fast paths; preserve usePref reads. Dedicated participant owns the new write boundary. |
| W14 | createScopedStorage exposes sync raw setters/removers and L-only coordinated variants. All must refuse Board, including injected stores. A JSON option or serialized token must not become a bypass capability. |
| W15 | migrateAccount holds exclusive L, copies prior generation in addition to selected legacy keys, stages/awaits secrets, rechecks raw source and commits marker last. Complete Board participation must apply to copiedSource even with Board absent from selectedKeys. |
| W16 | rollbackAccount changes/removes the marker without rewriting Board bytes. It is a reachability writer capable of reviving pre-U history. Fresh-generation restoration with retained current/prior terminal history is a necessary proposed replacement. |
| W17 | deleteAccountLocalData is an exported sync prefix eraser; wrappers/resume use L. Refuse standalone erasure, require the exact durable deletion authority, preserve already-confirmed captured-A continuation and never target mutable B. |
| W18 | resetAllPrefs loops registered xai keys, ignores false removals and broadcasts defaults. Board refusal alone is insufficient. The proposed pre-first-removal plan, exclusive L, result-aware reset and partial-result reporting are necessary. |
| W19 | storageContract/exportImport are pure transforms/constructors. No live production file-import caller was found. Keep public boundary preservation/refusal; do not invent a runtime importer or treat a returned payload as adopted live tokens. |
| W20 | Account export covers the captured current generation; separate recovery surfaces cover other raw sources. It cannot prove export of all histories removed by an account-prefix wipe. New all-target Board recovery bundle plus verified acknowledgement is required. |
| W21 | Shared/scoped raw census includes tests/setup/native/other datasets. No production Web localStorage.clear writer was found in the searched source. Task/Calendar own other keys and Desktop plugin-project owns different persistence; neither a Desktop nor cloud-sync grant follows. |

The proposed common order is finite and sound as a design: existing **account lifecycle L**, generation excluded, shared for normal commands; then all needed existing physical-dataset K locks in lexical order. Migration/reset/erasure/restoration take L exclusive. No K→L acquisition and no public API that reacquires L inside an already-held L/K callback. Existing deletion-workflow lock may precede L only on its recovery path. Task-link phase 2 must acquire L once and then canonical Tasks/Board locks in common order; it may not call the public Board writer inside that callback. Current canonical activation remains unchanged.

The scope/marker/tombstone/deleting barrier, same physical key, incarnation and intent checks are required after acquisition, every actual await and before publishing. Storage's read/validate/transform/serialize/write/readback segment is synchronous. Exact readback plus scope recheck precedes acknowledgement. Uncertain results keep stable identity/source/proposal; retry reconciles immutable receipt and successor chain before writing. Missing lock support refuses; existing hook-local serialization is not cross-document safety.

**External admission condition:** all same-origin Board-writing old clients, including cached clients, must actually be quiescent or reloaded to the admitted build before first capsule write and native acceptance. Two cooperative tabs and source search do not prove that condition. Neither L/K nor a capsule digest detects uncooperative byte-for-byte ABA; undetectable external restore remains a disclosed limit. There is no service-worker edit grant or claim that this review established quiescence.

## 4. T2 — exact capsule proposal, immutable operation and inverse

The proposed Board property/tag/version is concrete enough to review technically: optional `checklistRecovery`, kind `xai.web.board.checklist-recovery`, schemaVersion1, inside the existing Board[]/v1 storage envelope and existing key. Collision, null, wrong shape or unknown version must refuse mutation while retaining readable raw export; absence alone permits first tracking. The exact codec and its wire grammar still require the next versioned contract review and root adoption.

The journal/head, stable lineage/entity incarnations, explicit writer tokens and separate terminal X→U links establish a finite representation. Immutable body strings plus their SHA-256 preserve exact X bytes; U is a separate immutable entry. These hashes demonstrate consistency, **not signatures or authenticated authorship**. Live authority remains the newly captured account handle, admitted source chain and locks, never a historical owner string or imported token.

Validation must cover the entire dataset/envelope and each Board capsule, not only the selected card. All real unknown Board/list/card/row/envelope fields are losslessly retained; unknown fields inside the new protocol refuse mutation. Duplicate IDs and unsafe legacy numeric domains remain recoverable invalid/unsupported states, not normalization opportunities. Completion X freezes real pre-flags or the known aggregate pair, property presence (including falsy marker values), ordered targets, actual deltas/counters and immutable source/projection identities. No allocation proportional to an unknown legacy total.

Real arrays, including empty, take precedence. Literal user Item 1 or legacy-looking IDs remain real rows. Already-materialized provenance stays unknown. Genuine conversion records newly authored information and both original/immediate aggregate pairs; it cannot reconstruct historical titles. X must co-commit projection plus receipt. No-op automation mints no receipt, while explicit relevant same-valued manual intent may retire ownership.

Whole-operation U restores only still-X-owned fields on the same eligible incarnation, with current values matching X postvalues. Manual true/T0, later text/date/order/labels/moves, and distinct new rows are preserved. Derived counts use current arrays. Deletion/re-add, representation replacement, relevant manual rewrite or one conflicting X-owned target blocks all of U with zero inverse writes; unrelated original-true deletion is not resurrected. Retain terminal U and exact X. Same-mount trigger consumption prevents immediate replay; legitimate later manual/move/day/new-mount Y remains normal automation. X→U→Y and undo-Y have separate preimages.

Finite capacity means validate/size one full proposal and refuse the entire mutation on quota/serialization/capacity failure. No silent receipt eviction, pruning, successful projection without history, expiry, or unlimited-retention guarantee. Pending-discard never grants successful-history destruction.

## 5. T3 — migration, import, export and retirement

The source mismatch is confirmed: board-core accountMigration registers isBoardArray, while readBoardStorage supports arrays and v1 envelopes. Fixing only a UI decoder leaves both selected-import validation and previous-generation copy outside the intended semantics.

The three proposed modes have distinct, adequate technical purposes:

1. Same-account forward generation copy preserves exact immutable history/terminal links and continuously proven entity lineage; new generation authorization is newly captured. Validate all copied Boards, recheck source/marker after secrets awaits, verify candidate bytes, then marker-last visibility.
2. Foreign/unassigned/file replacement preserves original bytes and historical X/U but allocates fresh local incarnations/writers. Imported tokens are historical/non-executable even when account IDs match. Existing retired links stay retained; replacement of local information needs the exact loss plan.
3. Rollback/restoration creates a fresh generation with selected projection, validated union of current/prior history and U retirement, new replacement ownership and retained sources. Same ID/different bytes or missing history refuses. Directly re-exposing a previous marker cannot satisfy terminal U.

Ordinary reload is not import. Export helpers currently keep whole Board values/storageValue but only check duplicate logical IDs; the proposed full semantic equality across storageValue, top-level boards and logical payloads closes a real validation gap. Unknown envelope metadata stays in storageValue; logical-only output cannot claim a complete reversible dataset. Opaque malformed raw data remains available only under captured owner authority.

All actual destructive targets, including prior/candidate generations and lineage references, must be bound by the Board recovery bundle. Current-generation account export alone is insufficient. The reviewed idea neither changes credential exclusions nor claims server/cloud export, and still needs exact schema/error/backward-read contract text.

## 6. T4 — actual host, first intent, deletion and forced loss

Actual /app/board uses the Workspaces registration below App, AccountStorageGate/AccountDataGate and their keyed account subtree. The Board route presently has no DepartureCoordinator. Existing coordinator provides first-intent route/sign-out arbitration, but export/discard are synchronous void and its state dies on unmount. settingsDeparture has one mounted delegate. These facts support the finite host extension instead of claiming a local hook already owns global lifecycle.

AppProviders surrounds the routed children and has both transport/no-transport branches under WebAuthSessionProvider. A Board recovery host mounted as a sibling above those routed/account-remounted children can retain account-bound memory through controlled unmount. It must not require Router context at that placement; the route adapter owns router coordination. Register pending intent synchronously before first await, preserve latest draft/source/proposal/uncertainty, and mask A immediately outside A. Reentry under A' uses explicit new validation, never stale capability.

AccountDataGate.manage currently locks before inspect/unmount. A public lifecycle preflight must run before that lock; import/restore must consume the exact guarded plan before their first intent. Unsolicited auth/storage revocation still masks/fences synchronously and cannot be delayed by a dialog. App.handleSignOut must reach Board recovery before identity invalidation in both coordinator and fallback branches, preserve rail→Appearance→settings ordering, and recheck owner/first intent after awaits. Opt-in async departure resolution must preserve all existing caller behavior and release-once/first-intent semantics; source change invalidates affected prior exemptions.

Global reset needs admission before any key removal/default broadcast. Board/last-Board deletion and import/restore need the same exact-source loss authorization. Human/file interaction holds no storage lock; on reacquisition compare plan digests, targets and marker again. Changed source invalidates the old grant. Result-aware UI must distinguish partial reset and refusal.

For account deletion, the current orchestrator writes an intent and awaits server deletion before local cleanup. Therefore the Board loss plan and **durable pending deletion fence must precede the server request**, not merely local erasure. Proposed intent v2/receipt v3 retains complete manifest bytes and exact decision, not an unauditable hash alone. Every Board-changing/reachability participant—including migration, restoration and reset—must respect the pending fence while the server call awaits. Unknown server outcome retains it; only the matching explicit authorization rejection can release it. Captured-A confirmed continuation remains resumable after A→B. Legacy already-confirmed receipts continue under their original authority with absent historical acknowledgement disclosed; new requests may not take that exemption.

Reselecting a downloaded file and comparing exact expected bundle bytes/manifest supplies a feasible verification interaction; anchor.click is only a request. Wrong/cancelled/truncated/unreadable file or later source change grants no destruction. Actual native evidence must independently inspect the real downloaded file/name/bytes. Explicit discard separately names successful-history loss and affected generations. No new QL/QU product choice is needed.

beforeunload is a warning. Crash, forced termination or storage denial plus forced close cannot guarantee never-persisted memory recovery. The design correctly separates those physical limits from controlled departure obligations and existing committed bytes; it makes no dead-process-history guarantee.

## 7. Scope, full acceptance and retained canonical G1

The original **24 conditional paths** remain exactly conditional; the complete list and protections are reproduced in the retained appendix. The impact's explicit additional paths map to actual missing boundaries: pure Board codec/adapter and alternate writers, recovery host/registry and async UI, shared protected dataset/storage/scope/canonical read locks/migration/deletion, reset and account-deletion orchestrator, and AppProviders/App/Board registration/DepartureCoordinator. Narrow participant registration keeps storage independent of Board domain code. BoardRecoveryHost/route integration uses public barrels.

The additional test sources and owner API documentation paths are proposals only. No router.tsx, auth backend, service worker, Task activation/schema, shared CSS, token, config/lockfile, Desktop or cloud-sync scope is granted. Exact selected file subset, signatures, backward decoding and errors must be frozen in the contract amendment. Generic phrases such as “all writers participate” cannot replace the later row-by-row W proof. Worktrees do not remove semantic conflict with BRD-18/task-link, BRD-28/import/export, ordinary-field or list-lifecycle/shared-account work.

B01–B12 and R01–R12 remain complete future obligations, reproduced below without narrowing. B01/B02 distinguish immutable raw evidence from authorized X projection; B03 no inferred provenance; B04 all malformed/absence classes; B05 full conversion/migration/roundtrip; B06 all actual triggers; B07 complete inverse; B08 error/uncertain/latest-intent; B09 every account/lifetime/destructive path; B10 actual host and all consumers; B11 bilingual five widths/themes/44px/keys/manual visuals; B12 exact delta and preserved failure adjudication. None is runtime PASS.

Canonical Clock r2 §14 is retained verbatim in the appendix and compared to its immutable source, including **E1–E25**, **16 F1 invocations**, all accepted callers and capacity/refusal rules. E24 keeps C-FB002, OE and C-RD1 judging copies beside frozen failures; C-FD1 remains diagnostic only. Each final row requires producer commit/path/full hash/verdict and before/fixed applicability. Changed App/storage/coordinator source invalidates affected invariance-based exemptions; no blanket inherited PASS or blanket rerun. Missing/unqualified Clock evidence remains missing. Qualified measurement methods, original pixelFocusWalk, streamed immutable archive, lock/@repo guards, trusted pipe CDP, no nativeVirtualKeyCode, actual downloads and existing M+G+B sequencing remain mandatory.

The root's full chain remains: exact contract amendment → fresh full review → explicit schema/API/path/semantic-lock adoption → source-qualified full B/R/W oracles and permanent-unit budget admission → valid complete original-product before → separately authorized implementation → independent fixed + integrated/native/visual/affected regressions → actual cross-vendor → fresh full original-scope Astra acceptance → root append-only reconciliation → independent integrated inventory. This review skips none of them.

## 8. Permanent costs and failed/unrun history

Review **1/3**, one static pass. Impact author **1/3 static FAILED** stays consumed; prior preparation **2/3** and full contract review **2/3** stay consumed. No corrected author helper, source repair or second reviewer semantic pass. Runtime/tests/build/lint/browser/native/server/qualification/probe/vendor/children: **0 each**. Static Git/JSON/raw-byte inspection is not a product execution.

Full transitive originals preserve seven rejected-append artifacts (five diagnosis + two Sol original-three), six archive roots WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM plus main-checkout before; three assertions are not three invocations. Detail calibration/view/final vR4Xvt/QNw9Ce/H1Ap2r retain 5/8/8 cases and failures; 0NW1Ae author rerun is separate mode. Native detail PIDs14575/15385/17812/18500 are four sessions. Package roots lpCkP7/zYQAbA/qnu7yE/BmWgbG retain nine fixture failures and bounded task-link correction; initial native PID23393, one-byte blank before-fixture and admitted PID23613 remain separate histories. Blank output is not zero launch cost.

Policy-era formal/probe subdivisions remain unknown where unreconciled. A renamed driver, actor, vendor, worktree or BRD label cannot reset a permanent unit. N-L/N-U/N-P are new assertion purposes, not automatic new broad Board/host/native budgets. Unknown/exhausted reused units require exact root reconciliation before runtime.

Clock Q1 focus1/3, six other units0/3, development2/83; retention3/3 exhausted with145 assertions/41 of42 case executions; final14/14 is not qualification. Clock R1–R6/impact2 and B70/refusal/calibration history persist. REL unknown vendor history and TT08 actual vendor3/3 confer no BRD allowance. No fourth or disguised probe run.

## 9. Receipt and next bounded action

Read-only inspection used Git status/rev-parse/show/diff/diff-tree/ls-tree/cat-file, cat/sed/rg and standard-library Python hashing/JSON comparison. Some terminal displays truncated long source excerpts; no validation result is inferred from truncated text. The final structured receipt reports complete reads and exact comparison results. One functions-level JavaScript construction call raised SyntaxError before any nested tool execution; no Python integrity pass or filesystem write ran. Correcting that dispatch text did not rerun a semantic pass. A memory-registry quick search found no BRD-specific evidence; none was used.

All input validation completes and both UTF-8 output buffers are constructed before either ADD file is written. Exact-file staging and command-local disabled hooks are required for the one Why/What/Scope/Risk/Docs/Tests commit. Final direct parent, source SHA, count, output hashes and clean worktree are returned to root. No push/fetch/sync-check, other-worktree changes, global writes, merge/rebase/promotion/deployment/release/D3.

**Next bounded action:** root may receive this finite-basis APPROVED review and dispatch a fresh independent exact technical contract-amendment author, retaining the entire conditional proposal plus this T1–T4 basis and all outstanding external/evidence gates. Do not start implementation or runtime, declare old-client quiescence, adopt a schema/API/key, reopen QL/QU, or close BRD-12 from this document.

## Retained full obligations

The following source appendices preserve the complete business/evidence/path/G1 and original-record obligations. They remain future obligations or explicitly historical receipts; they are not this review's runtime results.

## Structured static receipt

```json
{
  "source_entries": 25632,
  "source_categories": {
    "external": 1,
    "blobs": 25621,
    "trees": 10
  },
  "source_bytes_read": 1021880677,
  "prior_entries": 20349,
  "total_entries": 30933,
  "fixed_parent_inherited_paths": 5278,
  "original_task_fields": 2808,
  "rows": 312,
  "normalized_labels": {
    "web（project-system）": 30,
    "web（跨模块验证索引）": 9
  },
  "evidence_original": 933,
  "evidence_current": 939,
  "formal_counts": {
    "completed": 13,
    "verification_pending": 3,
    "in_progress": 3,
    "pending": 293
  },
  "conditional_paths": 24,
  "additional_product_path_proposals": 40,
  "source_manifest_sha256": "63bbf0af40529bc0765910fad3329713380a5d4292229abc8d3ad076a75d43db",
  "review_manifest_sha256": "89b21d0a905ce4a62e5969a3c0cf5a44399f383c3f1d7295643e5c1fe0171f2d",
  "canonical_clock_sha256": "214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae",
  "static_result": "PASS - independent integrity and preservation only; author remains FAILED"
}
```

## Appendix A - complete conditional B01-B12, retained verbatim

The following is source proposal section 4, a complete future obligation, not an observed result.

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


## Appendix B - all 24 original conditional paths and protections, retained verbatim

## 6. Exact candidate implementation allowlist and protected semantic locks

**Current write allowlist remains the two preparation documents only.** The following is a proposed maximum list for a later root-registered implementation card after fresh independent review of §5, valid before evidence and source/lifecycle admission. Paths not selected by that concrete card remain protected; new schema/provenance files beyond this list require another review. Each ADD named here is a proposal, not an existing file claim.

```text
packages/plugin-web-board-core/src/types.ts
packages/plugin-web-board-core/src/internal/boardOps.ts
packages/plugin-web-board-core/src/internal/automationLite.ts
packages/plugin-web-board-core/src/internal/isBoardArray.ts
packages/plugin-web-board-core/src/internal/storageContract.ts
packages/plugin-web-board-core/src/__tests__/boardOps.test.ts
packages/plugin-web-board-core/src/__tests__/automationLite.test.ts
packages/plugin-web-board-core/src/__tests__/isBoardArray.test.ts
packages/plugin-web-board-core/src/__tests__/storageContract.test.ts
packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx
packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx
packages/plugin-web-board-workspaces/src/internal/useBoardDetailSaveRecovery.ts
packages/plugin-web-board-workspaces/src/internal/useBoardChecklistOperation.ts [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardChecklistOperation.test.tsx [proposed ADD]
packages/plugin-web-board-workspaces/src/__tests__/BoardWorkspacesModule.test.tsx
packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx
packages/xai-web-board-checklist-editor/docs/design.md
packages/xai-web-board-checklist-editor/docs/api.md
packages/xai-web-board-checklist-editor/docs/test.md
packages/xai-web-board-checklist-editor/docs/dev_log.md
packages/xai-web-board-automation-lite/docs/design.md
packages/xai-web-board-automation-lite/docs/api.md
packages/xai-web-board-automation-lite/docs/test.md
packages/xai-web-board-automation-lite/docs/dev_log.md
```

No CSS edits are proposed. Reuse current scoped board/recovery controls; if B11 cannot pass, freeze and register exact local selectors/files for independent impact review first. Protect **all shared CSS/tokens**, board/core/workspaces/views styles, shell/App/router, Dashboard/Clock/Header/AppRail, storage engines/hooks/account lifecycle/registry, task-link protocol and task store, Desktop plugin-project and adapters, schema/keys outside reviewed Board additions, all configs/lockfiles, original contracts/runners/failures and global states. No wildcard test directory permission. Read-only affected packages may gain separately registered tests if the reviewed impact matrix demands them, never ad hoc product edits.

Semantic locks: single writer for xai_boards_v2 checklist representation + Done forward/inverse + BoardWorkspacesModule/detail-recovery; exclude simultaneous BRD-18/task-link, BRD-28/import/export, ordinary-field recovery or list lifecycle changes sharing these paths. Shared-persistence and account-lifecycle **read dependencies** require source parity and integrated regression; touching their writers expands scope and stops this task. Calendar/date consumers are protected. Controller-receipt-lock is root-owned, never held by this worker; physical worktree isolation does not establish semantic independence. A later product SHA must account for any intervening relevant source delta via fresh review, never automatic rebase/merge.


## Appendix C - complete R01-R12 and accepted-caller obligations, retained verbatim

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


## Appendix D - canonical Clock r2 full section 14, retained verbatim

Historical roles and not-rerun bounds apply exactly as written; changed App/shared source removes corresponding exemptions. No runtime authorized.

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


## Appendix E - original BRD-12 record and TT08 evidence additions, retained verbatim

## 10. Exact retained source records

### BRD-12 full scope-map record (verbatim JSON values)

```json
{
  "id": "BRD-12",
  "priority": "P2",
  "kind": "决策",
  "action": "Checklist旧计数迁移与Done自动勾选规则明确化",
  "acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-12",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-12"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "不生成看似真实的Item1标题；自动勾选可解释并可撤销",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-12/prepare",
    "BRD-12/contract-review",
    "BRD-12/before",
    "BRD-12/implement",
    "BRD-12/verify",
    "BRD-12/accept",
    "BRD-12/reconcile",
    "BRD-12/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

### Dispatch TT-08 record: six new references preserved, not TT-06 completion

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```



## Frozen technical amendment author1 failure receipt — verbatim

```json
{
  "schema_version": 1,
  "id": "BRD-12/TECHNICAL-CONTRACT-AMENDMENT1",
  "actor": "/root/parallel_c_brd12_technical_amendment_r1",
  "fixed_parent": "6bcb03c31d7bcd50ac81bd2549f949276fa4d641",
  "fixed_input": "b52b5da64f1c7ff355b41e49d7972b6c8e8703d1",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "worktree": "/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-technical-amendment1-20261010/XAI_Desktop",
  "source_commit": null,
  "outputs": [],
  "author_iteration": 1,
  "author_cap": 3,
  "static_command_launches": 1,
  "static_result": "FAILED_PARSER_ALL_SEMANTIC_UNRUN",
  "exit_code": 1,
  "chunk_id": "02082d",
  "session_id": null,
  "traceback": "SyntaxError: Non-UTF-8 code starting with '\\xe4' in file <stdin> on line170, but no encoding declared",
  "syntax_only_preflight": {
    "chunk": "3ba858",
    "exit_code": 0,
    "result": "SYNTAX_ONLY_OK ast.parse/compile of in-memorysource; NOTconcludingsemanticchecker oractualshelltransportvalidation"
  },
  "earlier_errors": "functionsJSconstructionSyntaxError beforetool and unmatchedglobreadexit1",
  "unrun": "actualcheckerbody/allcompleteinputhashes/buffers/writes",
  "memory_drafts": "43770-char draft/56104-char checker onlyagentmemory unvalidated notartifacts/notadopted",
  "costs": {
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
    "children": 0,
    "actual_billed_usd": null
  },
  "no_retry": true,
  "worktree_clean": true
}
```

## Canonical Clock section14 exact original, independently retained

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


## Explicit whole-source membership at every applicable immutable revision

| Revision | Complete source document | SHA-256 |
| --- | --- | --- |
| 0121be25e10a8f3f60510c686a1832cbd40a9bcb | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 0121be25e10a8f3f60510c686a1832cbd40a9bcb | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 0121be25e10a8f3f60510c686a1832cbd40a9bcb | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 0121be25e10a8f3f60510c686a1832cbd40a9bcb | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 0121be25e10a8f3f60510c686a1832cbd40a9bcb | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 0121be25e10a8f3f60510c686a1832cbd40a9bcb | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| 05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 05e8514429e9f24bd2e1d6ffa9dd9e9312899e1d | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe | docs/reviews/audit-parallel-brd28-contract-review-r2/review.md | 1a6a0ab1b559eb12e65f6a878e4a4ceb6b95943442209f602ff816b34cf6e640 |
| 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 0a0bd4a2bf006c53f2d098ebab29451c5bd0a0fe | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 11d6527709a5a735200151768296a312a3a30314 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 11d6527709a5a735200151768296a312a3a30314 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 214dc41c8c9677ef32e391c89c8b4ad3c1d0d6f4 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 214dc41c8c9677ef32e391c89c8b4ad3c1d0d6f4 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 214dc41c8c9677ef32e391c89c8b4ad3c1d0d6f4 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 214dc41c8c9677ef32e391c89c8b4ad3c1d0d6f4 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 214dc41c8c9677ef32e391c89c8b4ad3c1d0d6f4 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-brd28-contract-review-r2/review.md | 1a6a0ab1b559eb12e65f6a878e4a4ceb6b95943442209f602ff816b34cf6e640 |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-shared-outer-capture-admission-impact-r1/impact.md | a75d114b1b3d724a0a2a8606d052849c7d13c1af96bb272d961c13f8353f4f14 |
| 28ba1cf444f2545fb93dd0340204530e07f8f6f6 | docs/reviews/audit-parallel-brd12-technical-contract-amendment-r2/contract.md | 6d29bcaad40daaea334b4c8094e1ca386a9c74da6451255e4701badba0a0cca9 |
| 2ce65abd48688cb735a4740b47ec8f84f00095eb | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 2ce65abd48688cb735a4740b47ec8f84f00095eb | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 2ce65abd48688cb735a4740b47ec8f84f00095eb | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 2ce65abd48688cb735a4740b47ec8f84f00095eb | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 3ee736788a5d488505cd322a95ae61e2c0d76715 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 3ee736788a5d488505cd322a95ae61e2c0d76715 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 3ee736788a5d488505cd322a95ae61e2c0d76715 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 3ee736788a5d488505cd322a95ae61e2c0d76715 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 3ee736788a5d488505cd322a95ae61e2c0d76715 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 43ba9fcfadb1075bc117b4d75f8888573d1ae2f2 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 43ba9fcfadb1075bc117b4d75f8888573d1ae2f2 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 43ba9fcfadb1075bc117b4d75f8888573d1ae2f2 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 43ba9fcfadb1075bc117b4d75f8888573d1ae2f2 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-brd28-contract-review-r2/review.md | 1a6a0ab1b559eb12e65f6a878e4a4ceb6b95943442209f602ff816b34cf6e640 |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-shared-outer-capture-admission-impact-r1/impact.md | a75d114b1b3d724a0a2a8606d052849c7d13c1af96bb272d961c13f8353f4f14 |
| 48de11d3f5a8d84c8d0902ade2bf6bfcc8027e12 | docs/reviews/audit-parallel-brd12-technical-contract-amendment-r2/contract.md | 6d29bcaad40daaea334b4c8094e1ca386a9c74da6451255e4701badba0a0cca9 |
| 4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 4c082ca8e40cbf178abb9d63cbed5f18a21b9f8d | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-brd28-contract-review-r2/review.md | 1a6a0ab1b559eb12e65f6a878e4a4ceb6b95943442209f602ff816b34cf6e640 |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| 51398daf98c0d41e2d3ca2074c2f04cc4a673bb7 | docs/reviews/audit-parallel-brd12-technical-contract-amendment-r2/contract.md | 6d29bcaad40daaea334b4c8094e1ca386a9c74da6451255e4701badba0a0cca9 |
| 516495625056a6123f22ff67df61c9c34dff2484 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 53a961aaa4ae87e1453f27d91af3c8edd6ddaeeb | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 68d0f14b243a1becb70811ca01a503cdcd244022 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 68d0f14b243a1becb70811ca01a503cdcd244022 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 68d0f14b243a1becb70811ca01a503cdcd244022 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 6c3451eda23a90841db907502b647c53b43fe1a2 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 6c3451eda23a90841db907502b647c53b43fe1a2 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 6c3451eda23a90841db907502b647c53b43fe1a2 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 6c3451eda23a90841db907502b647c53b43fe1a2 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 6c3451eda23a90841db907502b647c53b43fe1a2 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 6c3451eda23a90841db907502b647c53b43fe1a2 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| 711cfd8d7a587468d4ff133eb6d5911ad4dd79ef | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 711cfd8d7a587468d4ff133eb6d5911ad4dd79ef | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 7b890e0f027c5a1d258954bfc002731b23950c15 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 7b890e0f027c5a1d258954bfc002731b23950c15 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-brd28-contract-review-r2/review.md | 1a6a0ab1b559eb12e65f6a878e4a4ceb6b95943442209f602ff816b34cf6e640 |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| 84f0048a74c34bfef2b463e3b525b514e67586d2 | docs/reviews/audit-parallel-brd12-technical-contract-amendment-r2/contract.md | 6d29bcaad40daaea334b4c8094e1ca386a9c74da6451255e4701badba0a0cca9 |
| 936c197dcf732bddf27bac00a6fc694fd010f6d1 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| 936c197dcf732bddf27bac00a6fc694fd010f6d1 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| 936c197dcf732bddf27bac00a6fc694fd010f6d1 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| 936c197dcf732bddf27bac00a6fc694fd010f6d1 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| 9d8245d929518907b73674b0ab9b5e0ec221e23a | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| aed09103a71c7e939ffc71d23c7b9b802ac47b51 | docs/reviews/audit-parallel-brd28-contract-review-r2/review.md | 1a6a0ab1b559eb12e65f6a878e4a4ceb6b95943442209f602ff816b34cf6e640 |
| aed09103a71c7e939ffc71d23c7b9b802ac47b51 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| aed09103a71c7e939ffc71d23c7b9b802ac47b51 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| aed09103a71c7e939ffc71d23c7b9b802ac47b51 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| aed09103a71c7e939ffc71d23c7b9b802ac47b51 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| aed09103a71c7e939ffc71d23c7b9b802ac47b51 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| aed09103a71c7e939ffc71d23c7b9b802ac47b51 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| b52b5da64f1c7ff355b41e49d7972b6c8e8703d1 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| b52b5da64f1c7ff355b41e49d7972b6c8e8703d1 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| b52b5da64f1c7ff355b41e49d7972b6c8e8703d1 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| b52b5da64f1c7ff355b41e49d7972b6c8e8703d1 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| b7324936f5880c2050e6eecc8c22567fade05444 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| b7324936f5880c2050e6eecc8c22567fade05444 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| b7324936f5880c2050e6eecc8c22567fade05444 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| b7324936f5880c2050e6eecc8c22567fade05444 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| b7324936f5880c2050e6eecc8c22567fade05444 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| b7324936f5880c2050e6eecc8c22567fade05444 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| b7e075c51e77fbf9c376ae33e3a9e2fb3b69fd06 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| b9ed5f63256620b1135ba9e782f08992923bd3c4 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| b9ed5f63256620b1135ba9e782f08992923bd3c4 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| bd4dce4aa7a5b96d533b7a570b5bfb97843f392b | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| bd4dce4aa7a5b96d533b7a570b5bfb97843f392b | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| bd4dce4aa7a5b96d533b7a570b5bfb97843f392b | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| bd4dce4aa7a5b96d533b7a570b5bfb97843f392b | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| bd4dce4aa7a5b96d533b7a570b5bfb97843f392b | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| bd4dce4aa7a5b96d533b7a570b5bfb97843f392b | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| bdc06bd5b57f026caf6d7838563bfdae6f8684c9 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| bdc06bd5b57f026caf6d7838563bfdae6f8684c9 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| bdc06bd5b57f026caf6d7838563bfdae6f8684c9 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| bdc06bd5b57f026caf6d7838563bfdae6f8684c9 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| bdc06bd5b57f026caf6d7838563bfdae6f8684c9 | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |
| bdc06bd5b57f026caf6d7838563bfdae6f8684c9 | docs/reviews/audit-parallel-shared-native-host-focus-impact-review-r2/review.md | 3a8d96e1fd90d75a2b508be7da9e2c7598f01728a99991c0305773c2ba56c9c1 |
| cc012a5976919fb6cca8e0f19d0d6a628b033bc4 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| cdb8820b434aa7f2adb9cc5ad5f14118eb24230c | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| ce9eef6cb50b592e05593dc800ed3439615f7458 | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| ce9eef6cb50b592e05593dc800ed3439615f7458 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| ce9eef6cb50b592e05593dc800ed3439615f7458 | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| d39d8a9a32bf9e66310535c8622355daefb6b280 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| ead710ffa47c45f6d5e0ce3bad3c7fcdb4ff9473 | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| f667a0b6996b4039d2c4e5ca28657953703e830b | docs/reviews/audit-parallel-brd28-preparation-r1/contract.md | d49dfd594fcef7644d42847d8cc1617f3683f8c6e8133d2ef4110ceae0f9972f |
| f667a0b6996b4039d2c4e5ca28657953703e830b | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-review-r1/review.md | e93a2570530d875d746394226fbff8d95ebbb4e015ed0077534b64c48559cfbf |
| f667a0b6996b4039d2c4e5ca28657953703e830b | docs/reviews/audit-parallel-brd12-contract-review-r2/review.md | 9833ca24e94ca3011a90b8d6f299ff873f19c16b3f964f99e144164897449810 |
| f667a0b6996b4039d2c4e5ca28657953703e830b | docs/reviews/audit-parallel-brd12-writer-lifecycle-impact-r1/impact.md | 5c4db5b5fc7a79b995828b8fcf3f6de58af893a0c961d2ed1462f46f943fdb53 |
| f667a0b6996b4039d2c4e5ca28657953703e830b | docs/reviews/audit-parallel-shared-native-host-focus-impact-r3/impact.md | ccf5ff5bbe2da63fa5b06e858156d5b7f9be8e570cc0ac15094db6b3c2f2fea9 |

Earlier revisions where a later ADD document does not yet exist have no fabricated membership. The exact task card and original failure receipt are bound at actual28ba dispatch parent. All present memberships above are raw-byte validated; supplemental parent-only context does not repin fixedaed.
