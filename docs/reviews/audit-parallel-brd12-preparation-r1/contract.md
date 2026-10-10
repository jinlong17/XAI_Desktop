# BRD-12 / PREPARE r1 — full legacy-count and Done-checklist contract proposal

**UNADOPTED / NEEDS FRESH INDEPENDENT CONTRACT REVIEW.** Workflow C; module **web**, sole A-Codex controller. Fresh independent worker assigned Astra preparation role; task-card model is configuration, not provider attestation. This document neither accepts BRD-12 nor authorizes implementation, runtime execution, migration, caller closure or shipping. Exactly two ADD files are authorized: this contract and `inputs.sha256`.

## 1. Fixed identity, authority and complete obligation

- Dispatch parent: `52a80bcbf0293b0bb0446e6360d379edc1f26387`; detached HEAD is intentional supplied checkout state, not a new branch or a repin.
- Sole writable checkout: `/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-prepare-20261010/XAI_Desktop`.
- Task card: `parallel-control-r1/task-brd12-prepare-r1.json`, fixed preparation input `1955d250a7b33cde0f51c09c5836822f92bd0807`; scope-map original input `e041c2bc293b70db367444c62c4300231976dbf7`; runtime product P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Subsequent root commits do not replace any input.
- Original goal read first: `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md`, SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`. Full AGENTS/CLAUDE/shared workflow/multi-machine rules plus authority overlay apply. Overlay replaces only the explicitly superseded global serial/ff restrictions. No other worktree was accessed.
- Full original action: **Checklist旧计数迁移与Done自动勾选规则明确化**. Full original acceptance: **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2 / 决策 / web / 当前范围; source `02-tasks-time-boards.md;05-visual-ux-audit.md`; workflow C; formal pending; original evidence `[]`.
- All 312 ordered original rows, action/acceptance/module/gate/status/source fields and 933 ordered original evidence entries remain bound by the full input files. At dispatch there are **939** entries: the original 933 plus the exact **six TT-08** documentary references retained below. TT-06 has no evidence and remains pending; “TT6” is not a new item or replacement identifier. Full source-map fields and the BRD-12 record are reproduced in §10.
- Formal totals remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**. None of 118 gated rows is unlocked. BRD-12 has no item predecessor but retains `existing-owner-rule-or-minimal-decision:BRD-12`; preparation is not implementation readiness.
- Product comparison P0→parent: only four `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md` differ under apps/packages/package.json/lockfile. Board, storage, host and CSS runtime sources remain P0. Historical source references below use this fixed source, not current root HEAD.

## 2. Existing rules first: what is settled and what is not

The P0 checklist-editor design/API/test/dev_log and its 20260603 discovery are the owning feature documents. They explicitly retain `{id,text,done}`, canonical `checklistItems`, derived legacy `checklist`, empty-array removal of the chip, a single detail editor, compact progress consumers and no backend/storage-key migration. The card-detail API explicitly accepts count-only legacy cards. Historical checklist AC4 permits generated editing rows; **BRD-12's newer explicit no-fabrication obligation requires a reviewed correction to that behavior and its tests**, not denial of its historical acceptance.

The Automation Lite design already specifies fixed presets (not a configurable rule builder): semantic Done is `key=done` or Done/Complete/Completed/完成/已完成, active cards receive `completedAt`, rows and counts complete, opening runs once per board/day per mounted browser session, manual toolbar reruns, and moves into Done run immediately without due sorting. Therefore do not ask again whether the feature currently auto-checks or silently disable it. The audit's suggestion to make completion configurable is not an adopted owner decision. Preserve urgent-label and daily-sort semantics outside the bounded delta.

Existing append recovery architecture (`web-board-workspace-astra-review/20260909-detail-repair-architecture.md`) and accepted `web-board-detail-astra-final/review.md` establish captured owner/physical bytes/target/proposal identity, latest draft, exact-source conflict refusal, read-back, stable retries, memory recovery surviving target disappearance, explicit export/discard, and no unrelated overwrite. These are retained constraints, not optional UX polish. W-1/C-1/F-2/R-1 apply to their existing callers; none supplies missing checklist titles or an undo lifetime.

No inspected owning rule supplies lost item titles/identities from a count, provenance of previously materialized `legacy-*`/`Item N` rows, or the lifetime of undo after a completed auto-check. The smallest genuinely unresolved product decisions are §5; only their dependent implementation/oracle rows remain frozen. This does not block static contract review or unrelated workflows.

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
| B01 legacy count | Real bc1-like aggregate-only source; modal open/close, toggle/edit/remove, append and two failed append attempts; exact source and written payload | Never fabricate or persist plausible row titles/real identities. Show truthful missing-title/count state; migration follows QL selection. Preserve original counts/bytes/provenance until explicit user action. No substitute real item titles. |
| B02 real rows | Real arbitrary IDs, mixed flags, duplicate-looking titles, literal user “Item 1”, empty text where guard admits; stale aggregate; absent vs empty array | Preserve actual text/IDs/order/flags; only chosen edit changes; derive count from canonical array; explicit last deletion clears chip. Never classify “Item N” or `legacy-*` solely by regex as disposable. |
| B03 already materialized legacy | Real stored synthetic-looking rows alongside legitimate matching names and imported rows; no provenance field | Unknown provenance stays unknown, source export retained. No bulk rename, deletion, collapsing or claim recovered titles. User-confirmed repair is attributable and does not rewrite untouched rows. |
| B04 malformed | Absent storage, invalid JSON, invalid shape/envelope/version, empty boards, negative/fractional/overlarge counts, done>total, duplicate IDs | Preserve raw bytes exactly; distinguish unsupported/invalid from empty. No default-data write or destructive migration. Bound allocations/controls safely; unsupported records have truthful refusal and recovery. Domain validation proposal reviewed before test expectations are changed. |
| B05 migration / roundtrip | Both legacy array and v1 envelope; `migrateBoardStorageRawToEnvelope`, export/import and account validator; counts/structured/mixed source | Idempotent explicit conversion, no lost unrelated keys/envelope metadata; same-account reload/export/import preserve chosen data and provenance. No silent schemaVersion/storage-key change. Any required schema change returns for exact review. |
| B06 actual Done triggers | Semantic key/name variants, renamed custom list, archived cards/lists; opening/day/manual; same-list no-op, cross-list to/from Done, another Done card affected | Existing rule identified before execution, affected cards/items/counts visible. Preserve current trigger/semantic rules unless a separately accepted amendment exists. Auto-check has exact attributable preimage and reversible delta; urgent and sort fields are not accidentally undone. |
| B07 inverse | Mixed manually completed rows, auto-checked rows, prior completedAt; repeat operation, move out/back, later edit/delete/add, concurrent card/source changes | Undo restores only the applicable operation's changes under QU; does not uncheck originally true rows, delete new rows, resurrect removed target, overwrite later edits, remove preexisting completedAt, or rewrite unrelated order/labels. Conflicting source conservatively refuses with retained recovery. No snapshot rollback over newer whole-board data. |
| B08 error / recovery | Per-physical-key read denial, quota/write refusal, write-success/read-back denial; repeat retry, double click, rapid actions, original proposal collision | Latest user intent and original operation identity retained, no false saved/undone state, one durable mutation after verified commit. Retry checks owner/source/target again. Explicit discard drops pending intent only; export is not save/undo success. Keep original append collision and acknowledgement controls. |
| B09 account/lifetime | A→B, locked, return A with epoch/generation changed, migration during pending operation, deleted/archived/moved target, route/board/modal departure and reload | No A draft/preimage leaking or writing to B; current data untouched; owner fencing not bypassed by returning account name. Pending error retained in appropriate parent; navigation cannot silently throw away proposed migration/undo. QU governs successful undo history lifetime, not failed-write draft protection. |
| B10 consumers / host | Actual registered App route and real storage hooks with board/table/detail/export and Calendar/Timeline/Planner callbacks | Same committed counts and exact real titles everywhere; no inconsistent counts after retry/undo/reload. Real account host plus native new document; synthetic fixture result clearly labeled and insufficient alone. |
| B11 visual / keyboard | EN/ZH 375/414/768/1024/1440 widths, actual editor and recovery/legacy/undo states; themes, long titles; before screenshots | All new controls readable, contained, usable and ≥44×44 applicable targets; clear automatic vs manual/unknown state, visible error and undo availability; trusted keyboard/add/toggle/cancel/undo once; per-stop visible focus; real screenshots manually judged. No generic screenshot metric replaces UI inspection. |
| B12 immutability / regression | Fixed product tree, package tests and accepted caller sources, old failures and oracle contradictions frozen | Exact reviewed allowlist, no shared source drift; full accepted regressions and judging copies in §8; original business failures kept. Old tests requiring fabricated rows get versioned reviewed oracle corrections, not silently weakened assertions. |

Native evidence uses owned isolated server, streamed immutable `git archive`, requested/resolved SHA, archive byte count, lockfile and @repo resolution guards, output refusal on collision, preserved exit codes and preconditions. Pipe CDP and trusted events only; no `nativeVirtualKeyCode`, passive key audit retained. Original pixelFocusWalk identity remains hash-bound; new measurement methods need prior full qualification and independent adoption. Export evidence must verify downloaded bytes/filename from disk including raw-source recovery, not merely Blob creation. No service/provider/real-account claim based only on synthetic HTTP or seeded account objects.

## 5. Minimal unresolved product choices; no invented default

**QL — How may a count-only legacy checklist become editable without original row titles/IDs?** Existing documents contain the lossy generated-row path, not a provenance-preserving replacement. Choose one: (a) keep the old count as a clearly separate read-only legacy summary and let the user explicitly create real titled items, retaining the old summary as historical data; (b) explicitly guide reconciliation of the old count into clearly marked unknown-title slots, assigning new identities only with disclosed provenance and user confirmation, never treating inferred per-slot completion as historical truth. Exact coexistence/retirement and counts must be specified in the chosen amendment. Neither automatically invents titles. Rows B01/B03/B05 and their dependent migration/consumer tests stay frozen until selected. Real user titles and original bytes are protected under either choice.

**QU — Must the automatic-check undo remain available after reload/route departure?** Choose (a) durable operation receipt surviving reload, with explicit retention/expiry rule; or (b) clearly explained session-scoped undo whose loss on departure requires an explicit product decision and visible boundary. The existing completedAt/items representation cannot reconstruct the prior flag vector after persistence; docs promise no lifetime. Both require exact-operation inverse, no overwriting later edits, visible rules and preservation of manual checks. Do not silently select (b) to avoid a schema design. B07/B09 successful-history lifetime and persistence layout stay frozen; error recovery and existing forward trigger rules are already settled.

These are two constrained questions for controller consolidation, not worker approval requests or permission to amend schemas. A fresh reviewer may resolve either from additional explicit owner evidence, recording its exact source. It must not invent defaults or substitute implementation habit for authority. No question about known Done matching/three triggers is necessary.

## 6. Exact candidate implementation allowlist and protected semantic locks

**Current write allowlist remains the two preparation documents only.** The following is a proposed maximum list for a later root-registered implementation card after §5 and fresh review. Paths not selected by that concrete card remain protected; new schema/provenance files beyond this list require another review. Each ADD named here is a proposal, not an existing file claim.

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
| Detail rejected-append original 3 assertions; `web-board-detail-save-diagnosis/verify-fixed.mjs` + `detail-contract.test.tsx` | Six retained logs: before.log, independent.log, independent-parent-c201a1d.log, independent-parent-after-5c6ed8e.log, independent-parent-final-99c36b0.log plus Sol original-three logs in separate directory. Some may report same execution; do not sum duplicates as unique attempts. At least three distinct product-era executions are explicit; exact formal/probe attribution is unresolved. No fresh 0/3 allowance. |
| Independent detail eight-business-oracle unit; `web-board-detail-astra-final/verify-fixed.mjs` | oracle-calibration-99c36b0.log, view-fixture-calibration-99c36b0.log, independent-99c36b0.log: three named retained attempts, first two fixture/oracle failures. Do not erase calibration or assume exempt probes; treat automated rerun as blocked until authoritative cost classification. Author-tests-rerun is a separate invocation mode, not a new BRD unit. |
| Detail native download/retry/reload unit; `web-board-detail-sol-fix/verify-native.mjs` | native-5c6ed8e.log, native-99c36b0.log, native-99c36b0-parent-independent.log, native-99c36b0-parent-visual.log: ≥4 named executions; exact original unit subdivision/probe status unknown. Source identity known; no actor-based reset. Visual output reuse does not silently grant another download run. |
| Board full-package regression unit; `web-board-detail-sol-fix/verify-package.mjs` | before-8105cc9.log, after-5c6ed8e.log, final-99c36b0.log; Task-link fixture-fix before/after-package and parent-tasklink-fixed logs extend lineage. Nine original fixture failures retained; later 336 PASS fixture repair is bounded historical evidence. Unit-level formal total requires deduplication, never “fresh package 0”. |
| Task-link original D1 and native regression units | `web-board-workspace-astra-review/verify-d1-board.mjs` named parent-baseline/boundaries/repair modes; `web-board-tasklink-native/verify-native.mjs` initial/before-fixture/admitted logs; preserve their mode-specific budgets and accepted fixture copies. No independent Board broad-budget reset. |
| Clock/accepted caller G1 units | Canonical r2 §14 E1–E25 and each named runner/mode retained with all source and refusal logs. Current Clock focus/geometry/retention qualification history belongs to its original units; no new BRD allowance, no Clock execution here. Before any later invocation, root supplies its exact cumulative registered count/refusal ledger. |
| BRD-12 static preparation | This registered task: 1/3 preparation, one static pass; runtime/tests/native/browser/vendor/qualification/probes 0; no children. Fresh contract review is a distinct documentary role with its own registered count, not authority to reset any existing runtime unit. |

**Source-grounded proposed new purposes (not automatic runtime admission):** N-L legacy information-loss oracle inspects aggregate-only pre-mount bytes against both synthesis functions and proves absence of invented row identity/title across explicit reconciliation; unlike old append tests, it rejects the old invented-row expectation. N-U operation inverse oracle inspects the exact pre/post flag vector and later edits across the real three automation entrypoints; no inverse exists in historical automation tests. N-P provenance ambiguity oracle distinguishes genuine `Item 1` and imported/materialized rows without trusted provenance. These are substantive new assertions, not renamed old general UI/download/package units. Reviewer must map overlapping host/append/account components back to existing units, register exact driver/cases and source-delta purpose before granting a count; “not located in searched evidence” is not proof of zero historical execution. No runtime card exists now.

## 8. Complete evidence gates, affected callers and canonical G1

Fresh contract review first; reviewed before oracles and raw evidence before implementation; separate implementer; independent fixed verifier; actual cross-vendor verification remains **yes**; fresh Astra full-scope acceptance; root-only reconcile; independent inventory. Same-caller stage authors must be fresh and not any earlier author; reviewer never fixes. Missing provider/real-host/budget/decision gates stay explicitly blocked.

| Evidence ID | Required producing artifact / acceptance gate |
| --- | --- |
| R01 | Fixed-source/input hash ledger, actual unit-history reconciliation, QL/QU adopted references, full B01–B12 oracle consistency matrix; positive/negative controls and correct source assertions frozen before runtime. |
| R02 | Before source/raw JSON, operation/input provenance, per-case logs, zero unexpected PRECONDITION, exact expected failures and passing controls; real append vs field vs three automatic entrypoints distinguished. |
| R03 | Real registered App before, account source shape/ownership, mutation counters and native trusted interaction; before screenshots and raw downloads. Synthetic host supplement clearly labeled. |
| R04 | Exact implementation commit, reviewed path/delta receipt, retained old expectations plus qualified versioned corrections; author checks with exact archives and disclosed costs. |
| R05 | Independent unchanged B01–B12 fixed assertions, source and inverse raw-data comparisons, error/recovery/account/migration and export roundtrips; all branches of selected QL/QU, all three automatic entrypoints. |
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

One preparation pass consumed. Commands were read-only `cat`, `sed`, `rg`, Git inspection, Python JSON/hash comparison, and the final exact-path document commit. Some exploratory path lookups returned no match/missing path; these were corrected within static discovery, not runtime attempts. No tests, browser, native, server, qualification, vendor, probes or children. No user data inspection, screenshot execution, product reproduction or observed-user migration claim. No push/sync-check/remote fetch/global mutation; local checkpoint goes to root for its authorized preservation/receive/push flow. No memory evidence used (quick registry search had no relevant result).

Stop on input/hash/dirty drift, write-scope crossing, runtime need or unresolved decision being silently implemented. Preserve unrelated work and all historical failures. Root independently reviews parent/exact two ADD paths/clean/hash coverage/cost and may schedule fresh contract review; §§5/7 remain explicit downstream gates. This proposal alone is not adopted, READY_TO_SHIP, SHIPPED, business acceptance, release readiness, Web→Desktop sync or 312-item closure.

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

Manifest binds **5083 entries** (5072 fixed-parent files, six historical blobs, four raw Git tree objects, original goal attachment). Ordinary lines are standard SHA-256 and path; `git:REF:PATH` hashes `git show REF:PATH` bytes; `tree:REF:PATH` hashes raw `git cat-file tree REF:PATH` bytes. Relative paths resolve at this fixed checkout. Every selected current file was compared to its fixed-parent Git blob before indexing. Output hashes belong in the external commit/handoff receipt to avoid circular self-hashing. Full packages, all Board history and accepted-caller/Clock evidence families are hash-bound, including failures and prior qualifications; manifest inclusion does not claim execution or semantic inspection of every entry.

Read-only static reconciliation verified the original 312 IDs/order/states, each original evidence prefix and total 933, the six TT-08 additions only and current total 939. The full original scope-map remains byte-bound and BRD-12 is copied without field reduction. This pass grants no runtime budget.

### Proposed exact next-stage document/evidence paths

For later separate registration only: contract review `docs/reviews/audit-parallel-brd12-contract-review-r1/review.md` and `inputs.sha256`; a reviewed new-purpose before packet `docs/reviews/audit-parallel-brd12-oracles-r1/{legacy-provenance.test.tsx,automation-inverse.test.tsx,host.tsx,verify-fixed.mjs,verify-native.mjs,oracle.md,inputs.sha256}`. The braces enumerate seven exact proposed files; they are not currently writable. Before log/screenshot/download paths must be enumerated by that runtime card after QL/QU and case/driver/budget review; none may be invented and executed under this preparation card. Existing append/package/native drivers are historical reused units with inherited counts, not new files granted 0/3 by this list.

Historical Board runners inspected above use buffered `git archive` (100 MiB) and overwrite-capable output writes. They must not be invoked at the current archive unchanged merely to discover the known capacity problem. Any future corrected driver requires a hash-bound delta, qualified stream/output refusal/source guards and independent review; changing the transport or filename cannot reset its actual running-unit count.
