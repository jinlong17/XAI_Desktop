# TASK-06 independent contract review r1

Verdict: **APPROVED — preparation contract only**. No blocking contract finding. Implementation readiness: **NOT READY**; independent before evidence and qualified instrumentation remain missing. No product, caller, native, cross-vendor, release or audit-closure PASS is implied.

## Frozen identity and authority

- Reviewer: fresh `/root/parallel_d_task06_contract_review_r1`, Workflow D responsibility under the sole A-Codex controller; module `web`. Never a TASK-06 author/builder; no children. Task card requests `gpt-6-astra`; provider/model execution attestation is unavailable, and this Codex review is not cross-vendor evidence.
- Owned worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-task06-review-20261010/XAI_Desktop`, initially clean detached HEAD at fixed parent `acd36a8974b877cd24063cbd1b5bd390e29e0bd6` (R).
- Exact card: R:`docs/reviews/20260908-full-product-audit/parallel-control-r1/task-task06-contract-review-r1.json`; card fixed input `9442530e7194e7b5c62ae69cdcc68bc4c4e8d550` is not the dispatch parent.
- Reviewed proposal source `d6a310f2472356bd69d7a240c81f4b71e35d5ac1`, parent `8a994c4405affcfb3439d931f9d344eae6f3b904`; exactly two ADD files. `contract.md` SHA-256 `380f8fb6b3764bb07cd253c21ec8e216cc54a762ab83e2fae9f97d3cdb1b684b`; source manifest `f62aa5e015bbdc21cc837595d1fb249ea99ca0d633edd1ad98f03daedf15ace9`. Both equal the copies at R.
- Product P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`; inventory `acd21f9b15a735e2202ca9553aff54b3e3b46e17`; original scope map `7bb8df1631b94295bb7c3f928fcd9924b1337873`.
- Read original attachment first, then complete AGENTS/CLAUDE/project workflow/multi-machine rules, authority overlay, adopted r2 scheduler and exact card. The attachment hashes to `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`.
- r2 scheduler retains historical UNACCEPTED wording, but independent review and R's control-plane adoption establish active scheduler `b77b8dd703868c3cda270ab5bd1521465393adb0702a04d3381ee570ea73f7b4` and graph `d36e93284d069015129fa78afb24264da1730d636d5893453b2e72d8de110984`. These define manual scheduling/resource rules, not a running scheduler.
- Sole outputs: this report and `inputs.sha256`. Original contract/reports/failures, product/CSS/tests/runners, global control/ledger/inventory/budgets and other worktrees remain protected. Root alone preserves source remotely, receives/integrates, pushes, reconciles and runs global sync checks.

## Integrity and original obligation

Independently read every manifest identity and recomputed **195/195 SHA-256 records**, including the original attachment; all unique and matching. All **169/169 P0 product/source records** also match the fixed review checkout byte-for-byte. The review manifest contains **210 independently checked identities**: those 195 original inputs plus 15 explicit reviewed proposal and review-dispatch authorities. Hash equality establishes source identity, never runtime correctness.

Original action: **处置Local Calendars/已完成/不做/垃圾桶无动作入口**.

Original acceptance: **已实现则接真实数据与恢复路径；未实现则禁用/隐藏并说明，计数不写死**.

Checked `TODO.json:433–441`, `TODO.md:127`, `ALL-TODO-CURRENT.md:148`, `EXECUTION.json:917–919`, scope-map:2998–3044 and original report `02-tasks-time-boards.md:127`; companion `05-visual-ux-audit.md:55` retains icon/entry context. All four entries, both conditional branches, real counts and recovery obligations survive. Neighboring TASK-01/02/03/04/05/07 and REL obligations are not absorbed or declared closed.

Live frozen census: **312 = 13 completed + 3 verification_pending + 3 in_progress + 293 pending; 299 unclosed**. TASK-06 remains `pending`, evidence `[]`. This report changes none of those records.

## Independent source challenge and disposition

All coordinates below refer to P0, whose relevant bytes also match R.

| Entry | Source challenge and conclusion | Review of proposed disposition |
| --- | --- | --- |
| Local Calendars / 本地日历 | `TasksSidebar.tsx:191–198` is a row with literal `8`; props:24–44 and `TasksModule.tsx:444–465` provide no subscription provider/action. CalendarModule:75–110 and useUserCalEvents:62–123 expose user events and Board projection, not a Tasks calendar-subscription collection. | Contract:52,58,63 is valid: remove the badge, visibly disable and explain unavailable subscriptions here. Do not count events as calendars, redirect to another feature, claim empty data or invent subscriptions. |
| Completed / 已完成 | `types.ts:133–138` and TasksModule:198–209,668–689 support only smart/list/tag selections; sidebar:201–204 has no action. Default/wildcard registration:33–45 both render TasksModule, not a completed-only destination. However task completion is real: TasksModule:136–144,212–214,618–629; TaskColumn:101–126; CompletedGroup:24–78; reducer:90–136. Legacy missing done normalizes true, explicit false remains active; undo clears completedAt and materializes legacy rows, preserving source metadata. | Contract:54,59,106 correctly preserves the implemented capability and its actual data/recovery path, while disabling only the unsupported sidebar view. It does not authorize hiding completed tasks, disabling their checkboxes or implementing an aggregate view. No pre-existing supported destination was found that should instead be wired. |
| Won't Do / 不做 | Sidebar:205–208 has no action; TaskCard/TaskCardPatch and view types have no corresponding state. A false completion flag is an active task, not a won't-do status. | Contract:60,63 is source-grounded temporary unavailability. No cancellation/archive/deletion semantics are added. |
| Trash / 垃圾桶 | Sidebar:209–212 has no action; reducer:187–205 filters deleted tasks without task tombstone/retention/restore API. TasksModule:420–429 and TaskSaveFailure:6–30 recover failed writes/drafts, not already-deleted entities. | Contract:61 accurately separates deleted-task recovery from available failed-save recovery. No fake count, retention/purge behavior or deletion undo is invented. |

Completion evidence was independently traced through the board and legacy group rather than inferred from the word Completed. `completionContract.test.tsx:12–35` already asserts transition timestamps, source preservation and legacy undo; these tests were inspected, not executed. Historical comments describing in-memory completion or nodate-only behavior are superseded by current implementation/addenda, not used as denial of current capability.

Real neighboring counts remain `smartCounts/listCounts/tagCounts` props; TasksModule:153–157,692–726 derives them from actual task data. Removing four unavailable-entry badges does not authorize changing existing count definitions or making static replacements. `usePref.ts:113–121,166–215` traces physical reads plus storage-event and same-tab publication; TasksModule's list/tag state initialization is not proof of cross-tab metadata liveness. Contract T06-3/5/6/9 must retain these distinctions and freeze unrelated existing limitations. No REL acceptance follows from source tracing.

`mutateCanonicalDataset` checks activation, account lifecycle lock, captured owner/generation, physical state, validation and changed baseline before one physical write and publication (`canonicalCommandState.ts:229–308`). TasksModule:129–134 may normalize on mount. The contract correctly rejects a blanket zero-writes-since-mount oracle; entry-triggered deltas must be isolated from that baseline. Quota/conflict/revocation tests are necessary future evidence, not guaranteed successful behavior from these checks.

Host `shellRegistrations.tsx:71`, routing builders and `AccountStorageGate.tsx:29–60` establish real feature-gate/account dependencies. A controlled Sidebar or mocked account instance cannot stand in for the actual host. Synthetic test accounts still need documented identity/preconditions and genuine AccountDataGate remount/revocation behavior.

## Scope, copy and authority review

Contract:52–67 specifies retained bilingual labels and adjacent accessible reasons; native disabled buttons, no forced Tab stop/selection/callback and no tooltip-only explanation. In particular Completed explicitly points to existing task-list viewing/undo. The English and Chinese statements describe current availability, not a permanent policy forbidding a future feature. Original audit/acceptance already supplies authority for this disposition; **no owner question is required**. Adding new destination/status/calendar/deletion behavior would need its own decision and contract.

Contract:73–79 enumerates exactly seven future Tasks-only paths: TasksSidebar.tsx, internal/strings.ts, its existing sidebar test and design/api/test/dev_log docs. The patch is bounded to the four blocks plus local helper/copy/test/addenda. This review does not activate that allowlist. All CSS, shared tokens, TasksModule/types/reducers/stores, calendar, shell/account/routes, Clock and historical evidence stay protected. If explanations cannot fit existing layout, contract:65 requires frozen failure and separately reviewed scope revision, not dropped text or silent CSS writes.

Semantic locks correctly cover adjacent task authors and shared account/task source readers, not only file collisions. Worktree separation does not prove logical independence. Candidate/integrated SHA changes invalidate affected proof. Root-only recurring receipt resource and global-write protection remain intact.

## Ten-oracle completeness review

These are approval of specified requirements, **not executed passes**. Contract:99 requires independent P0 before with positive controls and retained failures; contract:114 prevents out-of-scope source/account failures being silently excused.

| ID / contract coordinate | Required evidence retained and review determination |
| --- | --- |
| T06-1 / 103 | All four EN/ZH labels, literal8 before failure, zero false badges after, native disabled semantics plus visible/accessibly associated reason. Complete. |
| T06-2 / 104 | Trusted pointer/Enter/Space non-action, no navigation/business writes/events/fetch/dialog/success, Tab and reverse Tab skip, reading order and exact accessible names/descriptions. Complete; disabled elements must not be force-focused to manufacture keyboard success. |
| T06-3 / 105 | Neighbor smart/list/tag selection and feedback, create/edit/reorder/drop, changing zero/nonzero counts and retained keyboard behavior. Complete; a globally disabled sidebar cannot pass. |
| T06-4 / 106 | Actual TasksModule/store completion and undo; normal/legacy absent/explicit-false data, dated and undated history, reload, source/list/tag/date/notes retention and timestamp clearing. Complete; copy alone is insufficient. |
| T06-5 / 107 | Valid empty data, receipt envelope and legacy source, unknown/stale dates, corrupt/unsupported/read-error conditions; exact physical before/after bytes with mount writes separately identified. Complete; unavailable UI cannot be used to claim empty account data. |
| T06-6 / 108 | Quota/throwing writes, absent/rejected/held locks, changed canonical baseline, retained draft/source, explicit Retry/Export and exactly-once successful retry with receipts/revision/newer data preserved. Complete; failures remain separate owner-bound repairs and cannot be repaired in sidebar scope. |
| T06-7 / 109 | Real host A→B/logout/generation revocation/late completion; deny stale retry/export and cross-account writes/leaks. Complete; account mocks or source equality cannot certify this. |
| T06-8 / 110 | Enabled `/app/tasks`, default/wildcard and disabled fallback; rail/topbar/filter/footer/dialog traversal and real host visuals. Four CSS viewports × EN/ZH × light/dark × default/compact × 100/200% zoom = 64 specified visual combinations, effective dimensions recorded. Hidden mobile sidebar is disclosed, not counted as an accessible control. Clipping/overflow/occlusion, design-authority contrast/focus/touch measures retained. Complete. |
| T06-9 / 111 | Tasks tests/typecheck/lint, completion/source/date/filter/list/tag/migration/subscriber/recovery, host gate/routes, Board-link/Statistics projections and protected hashes at candidate/integration. Complete. Current package.json confirms the three Tasks scripts; exact consumer commands and finite output manifest must be frozen before dispatch. |
| T06-10 / 112 | Actual independent vendor/tool evidence and fresh final Astra review of original obligation, all above rows, failures/residuals/budgets/protected source. Complete; this same-vendor static contract review fulfills neither gate. |

The source/read-model tests must observe real publication, reload and account scope, alongside physical envelope bytes, not merely a rerendered component with changed props. The contract already requires actual source/store/host evidence and preserves subscriber/recovery tests. Existing saveRecovery tests:69–75 exercise changed/removed source; that inspection supports the relevance of this requirement without asserting those tests currently pass.

## Frozen method, Clock dependencies and gate chain

Contract:118–124 explicitly requires a separately registered, versioned runner with positive/negative controls, independent qualification and root hash adoption **before** business evidence. Runner/report/fixture/log/screenshot/manifest filenames must be exact in its own task card (contract:81); preparation approval is not a runner or runtime grant. The finite command/case/output manifest, qualified method hash, preconditions and every required oracle must be checked at admission. No named runnable TASK-06 artifact is currently qualified by this review.

Stream immutable archive, record requested/resolved product identity, freeze lockfile/@repo resolution, reject overwrite and preserve nonzero exits. Native requires CDP pipe, trusted input/passive audit, no nativeVirtualKeyCode and canonical pixelFocusWalk `bacdbbc17d395e320cd100234aa5738cdbae3414` identity (`5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4`). A versioned measurement change must follow qualification/review/adoption; source equality and standalone Sidebar mounts never qualify host-native proof.

Static/sidebar scope can proceed independently of Clock geometry, while real whole-host visual/focus/affected descendants require an admissible frozen lane or remain BLOCKED. This does not mark Clock M, Q1, geometry, B1 or E1–E25 accepted. No Clock budget reset, hidden fourth retention run or dropped outside-focus row is authorized. Contract:99's all-before admission requirement remains binding even where it delays implementation; independent preparation/qualification can still be scheduled.

Contract:122 preserves C-FB002, OE, C-RD1 and predicted C-FD1 (P0 14/15 prediction, not invented 15/15), plus frozen G1 Required-evidence itemization and Clock/F1/rail/Appearance/host/Header dependencies when the integrated baseline is claimed. Historical valid evidence retains its original product/method qualifications; no historical rerun occurred here and old passes cannot certify changed consumers.

Full chain retained: exact contract receipt → this independent review → separately registered and qualified runner → independent P0 before → root owner-rule/locks/allowlist admission → fresh bounded builder → independent candidate/integrated verification and actual vendor verdict → fresh final Astra full-scope acceptance → root append-only evidence reconciliation with unchanged formal states/counts → inventory/remote ancestry/sync receipt. A failure in a dependent unit blocks that unit/acceptance; it cannot be waived by contract approval.

## Readiness, cost and local closeout

- Contract review: APPROVED; product-choice blocker: none; minimal owner question: none.
- Before/runner qualification/adoption: pending. Implementation permission/readiness: NOT READY. Runtime/native/visual/account/recovery/affected regression/vendor/final acceptance: unverified. TASK-06 formal state remains pending.
- Used **review iteration 1/3**, one bounded static review pass 1/1. Runtime/browser/native/package/build/test/typecheck/lint/probes/historical reruns/product edits/children: **all 0**. Hash/source/doc/commit checks are static verification only. One source lookup used absent `src/hooks/usePref.ts`, then resolved actual `src/internal/usePref.ts`; it was not a test/probe or evidence failure.
- Clock retention validation 3/3 exhaustion, Clock visual 3/3, original Q1/B70/refusal/probe histories and MAP review history remain unchanged. Their historical numeric snapshots are not new authorization; root must read current permanent records before dispatch. New actor/path/filename never resets a family budget.
- Scope checks admit only two ADD outputs, preserve source proposal and every protected tracked file, and recheck the 312 census. Commit uses exact paths and real Why/What/Scope/Risk/Docs/Tests paragraphs; command-local hooks disabled to prevent unauthorized runtime/hook dispatch. No push or global sync check by this reviewer.
- Next eligible work: root receipt of this review, then a fresh exact-path TASK-06 runner qualification/before task under the contract's remaining gates. No repair is requested from this reviewer.
