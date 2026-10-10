# TASK-06 — four sidebar destinations, source-grounded preparation r1

Status: **PREPARATION ONLY / NEEDS INDEPENDENT CONTRACT REVIEW**. Module `web`; workflow responsibility `C`; lead mode A-Codex; Verify Cross-vendor: yes. This document grants no implementation, runtime, caller acceptance, shipping or audit closure permission.

## 1. Identity, authority and immutable scope

- Fresh author: `/root/parallel_c_task06_prepare_r1`, no children, no earlier TASK-06 authorship in this session. Requested task-card role/model: Astra / `gpt-6-astra`; serving-model attestation is unavailable. A configured model label is not cross-vendor verification. Memory lookup was navigation-only; current conclusions and identities were re-grounded in frozen Git inputs.
- Sole worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-task06-prep-20261010/XAI_Desktop`; initially clean detached HEAD, fixed dispatch parent `8a994c4405affcfb3439d931f9d344eae6f3b904` (P).
- Product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. All product references below are this exact tree; checked relevant Tasks/storage/calendar/host/design paths against P with no differences. Control HEAD advancement cannot change the evidence baseline.
- Exact card: `P:docs/reviews/20260908-full-product-audit/parallel-control-r1/task-task06-prepare-r1.json`, ID `TASK-06/PREPARE`; its `fixed_input` is `bfbe3ed0b3967038375e41e5b10f738574ea0d54`. Dispatch parent and inventory baseline are different identities, not substitutions.
- Sources: scope map `7bb8df1631b94295bb7c3f928fcd9924b1337873`; readiness inventory `acd21f9b15a735e2202ca9553aff54b3e3b46e17`. Inventory ranks TASK-06 as eligible **discovery**, not implementation-ready.
- Read original goal first: `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md` (SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`), then AGENTS/CLAUDE, project workflow/multi-machine rules, authority overlay, adopted r2 scheduling contract and exact card.
- r2 scheduler/dependencies source `11b8d721f9d423fcabb19857e96c927375b9323a` retains its historical UNACCEPTED heading; independent `parallel-control-review-r2/review.md` and P's CURRENT-CONTROL-PLANE adoption record establish the active pointer. Scheduler SHA-256 `b77b8dd703868c3cda270ab5bd1521465393adb0702a04d3381ee570ea73f7b4`; dependencies `d36e93284d069015129fa78afb24264da1730d636d5893453b2e72d8de110984`. No scheduler runtime is claimed.
- This pass owns exactly two ADD files: this contract and sibling `inputs.sha256`. No original report/contract/log/source/runner, global control/registry/ledger/inventory/status, other worktree or product edit is authorized. No push/merge/rebase/promotion/deployment/release/D3. Root alone handles remote preservation/integration/sync.

## 2. Original obligation — complete and unchanged

| Field | Frozen original value |
| --- | --- |
| ID / priority / kind | TASK-06 / P2 / 决策 |
| Action | 处置Local Calendars/已完成/不做/垃圾桶无动作入口 |
| Acceptance | 已实现则接真实数据与恢复路径；未实现则禁用/隐藏并说明，计数不写死 |
| Module / gate | web / 当前范围 |
| Source | 02-tasks-time-boards.md;05-visual-ux-audit.md |
| Formal execution record | pending; evidence `[]` |

Exact mapping: original `TODO.md:127`, `TODO.json:433–441`; `ALL-TODO-CURRENT.md:148`; scope-map.json:2998–3044, including original_module, original action/acceptance, retained execution record and eight future task nodes; `EXECUTION.json:917–919`. These records are read-only and unchanged.

Original source paragraph `02-tasks-time-boards.md:127`:

> Tasks 侧栏日历/已完成/不做/垃圾桶 | `TasksSidebar:191-214` 有可见占位控件 | Local Calendars固定8；后三项role=button但没有行为 | 隐藏或标明未提供；实现后键盘Enter/Space及选中反馈 | 真实订阅源、归档与恢复模型后再开放入口

Companion `05-visual-ux-audit.md:55` points to TasksSidebar icon output and the no-action state entries after line 196. Its Tasks row at line 29 concerns real dates, duplicated filters, icon tokens and column navigation; those neighboring TASK-01/05/07 obligations are retained, not absorbed or declared complete here. Original reports predate P0: their numerical tests and older account/date statements are historical, not fresh P0 runtime evidence.

## 3. Actual source and behavior map at P0

| Entry / concern | Actual source and data chain | Capability conclusion |
| --- | --- | --- |
| Local Calendars / 本地日历 | `TasksSidebar.tsx:191–198`: plain list-row, no handler, count literal `8`. Sidebar props:24–44 have only smart/list/tag callbacks and counts. `TasksModule.tsx:444–465` supplies no calendar provider/callback. | Sidebar subscription destination **unimplemented**. Eight is presentation data, not a real calendar count. |
| 已完成 / Completed destination | `TasksSidebar.tsx:201–204`: role=button/tabIndex=0, no onClick/onKeyDown. `types.ts:133–138` declares only six smart IDs and smart/list/tag views. `TasksModule.tsx:198–209,668–689` selects/filters those views, with no completed-only destination. | Dedicated footer destination **unimplemented**, distinct from already-implemented task completion. No existing route or supported callback can simply be wired here. |
| 已完成 task data / undo | `types.ts:90–116`: done/completedAt and legacy completed[]. `TasksModule.tsx:136–144,212–214,618–629` derives real completion, normalizes missing legacy done to true, respects explicit false and invokes toggleComplete on the full model. `TaskColumn.tsx:101–126` → CompletedGroup → existing checkbox. `tasksReducer.ts:90–136` undoes completion, clears completedAt and materializes legacy rows; stable source metadata remains. | **Implemented** completion and undo remain operational. Never say task completion is unavailable. Do not hide or disable these existing checkboxes, convert completion into deletion/archive, or fabricate timestamps. |
| 不做 / Won't Do | `TasksSidebar.tsx:205–208` has no action. `TaskCard` and `TaskCardPatch` contain done but no won't-do/cancelled status; filter/view types have no corresponding ID. Bounded task source search finds only footer copy for wont_do. | No supported state, provider or destination. Never equate won't-do with done=false, deletion or Board archive. |
| 垃圾桶 / Trash | `TasksSidebar.tsx:209–212` has no action. `tasksReducer.ts:187–205` deletes by filtering tasks after materializing targeted legacy rows; no tombstone, retention or restore API. `TasksModule.tsx:420–429` waits for successful deletion; failed writes can retry/export. | No task-trash destination or deleted-item restore. Failed-save draft recovery is **not** deleted-item recovery. Do not invent a trash count, retention window, undo deletion or purge behavior. |
| Existing calendar feature | `xai-web-calendar/src/CalendarModule.tsx:75–110` consumes calendar preferences, user events and Board feed; `internal/eventStore/useUserCalEvents.ts:62–123` wraps real event CRUD under xai_calendar_events. Separate calendar registration is not a Tasks calendar-subscription source. | A calendar module exists, but does not establish a collection of subscribed calendars for this sidebar. No event-count-as-calendar-count or redirect to a different feature. |
| Host routes | Tasks `registration.tsx:33–45` registers default and wildcard paths, both rendering the same TasksModule. `apps/web/src/routes/modules/shellRegistrations.tsx` applies `withDisabledFallback(...,"tasks")`; buildModuleRoutes builds these slot routes. | Wildcard route is not proof of distinct completed/trash/calendar routes. Tasks feature must be enabled for host evidence; its disabled-feature fallback remains protected. |
| Store / account / recovery | `TasksModule.tsx:76–134` captures account owner, reads xai_task_cols, hydrates/regroups and may persist normalization on mount. persistCols uses mutateCanonicalDataset plus expected baseline. `plugin-web-storage/src/internal/canonicalCommandState.ts:229–308` checks activation/owner/generation/locks, rereads, validates, preserves receipts, rejects conflict/corruption and publishes only after write. `TaskSaveFailure.tsx:6–30` scopes export; host `providers/AccountStorageGate.tsx:29–60` delegates identity gating to AccountDataGate; TasksModule:436–442 retains explicit retry. | Sidebar disposition adds no persistence. Whole-host assertions must distinguish existing mount/regroup writes from new entry-triggered writes; blanket zero writes since mount would be a false oracle. Scope revocation denies old-account retry/export. |

Checked supporting docs: Tasks design §1/§2, §F and current REL-01 addendum; API REL-05 and TASK-02 completion/source addenda; current tests `completionContract.test.tsx`, `saveRecovery.test.tsx`, `TasksSidebar.test.tsx`. Older design/api text describes former seed/bucket/in-memory states; current source and explicit superseding addenda control. `web design/DESIGN.md` is the tracked design authority. Historical module-tasks.jsx/i18n.js prototype references are not present in the tracked P0 tree and were not recovered from another worktree.

## 4. Bounded disposition and product authority

Use the original acceptance's **未实现则禁用/隐藏并说明** branch for the four unimplemented **sidebar destinations**. Choose explicit visible disabled rows, retaining discoverability and adding bilingual inline explanation; remove every numeric badge from these four rows, especially `8`. No fake zero, empty-result claim, estimate or loading count. Existing smart/list/tag counts stay derived from their existing props and keep responding to prop changes.

The implemented branch is preserved through the real board completion/undo data and existing save recovery. A completed-only aggregate destination would require adding view semantics and module callbacks; this contract does not relabel that new feature as an already-existing route. Independent review must explicitly validate this distinction. If evidence identifies an existing supported destination, reject this disposition for that row and produce a separately scoped source-grounded revision; never silently disable a working feature merely to minimize code.

| Retained label | Exact proposed inline explanation (EN / ZH) |
| --- | --- |
| Local Calendars / 本地日历 | Calendar subscriptions are not available here. / 此处暂未提供日历订阅。 |
| Completed / 已完成 | This sidebar view is not available. View completed tasks and undo completion in the task list. / 此侧栏视图暂未提供。可在任务列表中查看已完成任务并取消完成。 |
| Won't Do / 不做 | The Won't Do status is not available. / 暂未提供“不做”状态。 |
| Trash / 垃圾桶 | Trash and recovery of deleted tasks are not available. / 暂未提供垃圾桶和已删除任务恢复。 |

Use native `button type="button" disabled` semantics for retained destinations, no action, no draggable/drop listener, no tabIndex=0 override, no selection state, no link masquerading as a button. Explanations are visible adjacent text, associated via accessible description; never tooltip-only or disabled-color-only. Keep each label as its accessible name so descriptions do not erase the familiar name. No new unavailable toast, success feedback, modal, network request or account prompt. Current board completion uses the existing checkbox, independently of disabled footer view.

Use the local bilingual STR-table pattern already approved in Tasks design §F.1.9 / API §E.7; do not alter shared tokens. Reuse existing module structure/tokens without stylesheet changes, focus manipulation, font overrides or DOM/CSS injection. If the protected layout cannot render the explanation readably, record a concrete failure and request a separately reviewed narrow scope revision; do not drop explanation to make the screenshot fit.

Owner-rule resolution: original audit paragraph and exact TASK-06 acceptance already authorize unavailable-control handling. W-1 (World Clocks), C-1 (Integrations preview), F-2 (week-start), R1/MGB (Clock method) are not permission to implement subscriptions or recovery. P-1 and D-2 remain unrelated pending owner decisions. **No user product question is required for this bounded unavailable-destination disposition.** Only if new source evidence contradicts it is the smallest unresolved choice: whether to add a dedicated completed-only destination beyond the existing board completion/undo UI; present the exact evidence and scope before asking, leaving the other three entries independently preparable.

## 5. Proposed future exact write set (not granted by this document)

Only after independent approval, separate before evidence, root semantic-conflict check and a committed implementation card:

1. `packages/xai-web-tasks/src/TasksSidebar.tsx` — four destination blocks and small local render helper only; no general row/navigation refactor.
2. `packages/xai-web-tasks/src/internal/strings.ts` — additive local bilingual unavailable explanations only.
3. `packages/xai-web-tasks/src/__tests__/TasksSidebar.test.tsx` — four-entry behavioral/a11y and changing-prop count coverage; retain existing smart/list/tag/drag assertions.
4. `packages/xai-web-tasks/docs/design.md` — additive TASK-06 unavailable-destination decision, no historical rewrite.
5. `packages/xai-web-tasks/docs/api.md` — additive visible behavior/no new callback or storage contract.
6. `packages/xai-web-tasks/docs/test.md` — TASK-06 oracle and evidence links.
7. `packages/xai-web-tasks/docs/dev_log.md` — narrowly registered TASK-06 work log; writer records awaiting independent verification, never self-accepts or edits unrelated status/history.

All seven are existing paths; exact patch anchors in source are the calendar and footer blocks. No other product/test/config path is implicitly writable. Future verification evidence has a **separate** root card listing every individual report, runner, fixture, log, screenshot and manifest path before it runs; no recursive directory glob or implied permission in this contract. Preparation writes only its two ADDs. Scope expansion requires a versioned revision and fresh impact review, not a renamed iteration.

Protected: TasksModule/TaskColumn/CompletedGroup/TaskCard/types/reducers/validators/taskLink/migration/subscribers, all task and shared storage/account stores, cloud/sync/event bus, calendar modules/providers, app/shell/routes, pet, Dashboard/Clock, **all CSS including task-local styles**, tokens, lockfiles/config, original evidence/runners/contracts, control/registry/three ledgers/inventory, other actors' files/worktrees and long-lived branches. Read-only inputs are permitted; shared writes are not.

## 6. Semantic conflicts and dependency disposition

| Resource | Conflict / admission rule |
| --- | --- |
| Four TasksSidebar blocks and local strings/tests/docs | Exclusive writer. TASK-05 (icons/navigation), TASK-07 (navigation/multiselect), TASK-03/04 metadata changes can conflict even on sibling worktrees. Root checks actual patches and frozen source before dispatch/integration. |
| xai_task_cols completion/source/recovery/account generation | Read-only logical dependency on TASK-02, REL-01/02/03/05 and Board/AI consumers; no store ownership. Concurrent writer/schema/caller changes invalidate affected proof and need new integrated-SHA verification. Do not unlock by declaring component isolation. |
| Local calendar subscription model | No implementation dependency on Calendar/CAL-01/SET-08/SET-10 for disabled rows; no calendar read/write or event-count coupling added. Any enablement would reopen these locks and owner rules. |
| Clock geometry / global focus / host | Static discovery, sidebar source repair and qualified component evidence can proceed independently of Clock CSS geometry. Actual whole-host keyboard/visual/affected-caller evidence can depend on the adopted focus method and integrated Clock geometry/baseline. Use a frozen qualified lane or mark only the dependent unit BLOCKED. No standalone TasksSidebar mount proves complete app/native acceptance. |
| Global controller resource | Root alone acquires recurring `controller-receipt-lock` for every preservation/integration/control/ledger/adoption transaction under r2. Worker cannot acquire it or mutate globals. Dependencies must resolve before acquiring; never wait for this author/reviewer under a held lease. |

No Clock product fix, geometry method qualification, account final acceptance or calendar completion is inferred here. No global stop merely because those independent chains are blocked.

## 7. Separate before and required positive/negative oracles

Fresh independent before author, different from this author and later builder, freezes P0 and the approved contract hash; completes all rows below before implementation admission. A source trace now is not that independent before receipt. P0 before expects the known no-description/focusable-no-op/literal-count failures; successful unchanged board/recovery controls must also be retained. Each case records requested/resolved SHA, expected behavior, actual result, artifacts and PRECONDITION; fixture or harness errors are not product failures.

| ID | Required before/fixed evidence and oracle |
| --- | --- |
| T06-1 four destinations | EN and ZH, all four labels, zero fake badges; fixed native-disabled state plus visible and accessible reason. P0 captures literal8 and missing disabled/reason state. Do not omit Completed because the checkbox elsewhere works. |
| T06-2 inertness negative | Real pointer activation, Enter and Space cannot select a destination, navigate, mutate tasks/metadata/calendars, dispatch business events, open dialog, issue fetch or show success. Disabled entries are skipped in Tab/Shift+Tab; explanation remains available in reading order. Inspect exact accessible names/descriptions, not text-only snapshots. |
| T06-3 positive neighboring controls | Smart selections and their selected feedback, lists/tags create/edit/select/reorder/drop remain functional; real prop changes change their counts (including zero and nonzero). Do not globally disable the sidebar or all .list-row elements. Existing Smart Enter behavior is preserved; unrelated keyboard gaps are separately frozen, not hidden or repaired outside scope. |
| T06-4 actual completion/undo | Real TasksModule and actual account-scoped store: normal done task, legacy completed[] with missing done, explicit false legacy row, valid completedAt and undated legacy completion. Existing completion/undo survives reload, retains source/list/tag/date/notes, clears timestamp on undo, never invents an old completion date. The disabled footer does not hide those rows or interfere with their checkbox. This proves the explanation's real path rather than accepting copy alone. |
| T06-5 empty/source identity | Valid empty canonical dataset, populated envelope retaining receipts, legacy array, stale date/unknown date, corrupt/unsupported record and read failure. Four unavailable rows never render an invented count or claim empty account data. Snapshot physical raw bytes before/after entry activation and preserve malformed source. Baseline mount/hydration writes must be separately accounted for; do not excuse new action writes as mount behavior. |
| T06-6 recovery and negative writes | Existing completion/undo under quota/throwing write, missing/rejected lock, held lock, changed canonical baseline; reject false saved state, retain draft and old source, expose existing explicit Retry/Export. Successful retry commits the intended operation once. Preserve receipt envelope/revision and newer source; no automatic retry, deletion recovery, count increase or different-account write introduced by a disabled row. Exact current limitations/failures freeze independently; this contract does not fix the store. |
| T06-7 account/lifecycle | Actual host account A→B, logout, owner-generation revocation and late queued completion: no A task/draft/counter exported or written into B; stale retry/export rejected. Component-only account mocks cannot prove host remount/isolation. Record actual host preconditions/identity; use synthetic test accounts, never production data. No claim that disabled destination proves REL-02/03 accepted. |
| T06-8 routes/native/visual | Real `/app/tasks` within enabled Tasks shell; default/wildcard behavior and feature-disabled fallback retained. Trusted pointer/keyboard traversal including surrounding rail/topbar, adjacent filters, footer, dialogs; host screenshots at CSS viewports 1440×900, 1024×768, 768×1024 and 390×844, EN/ZH, light/dark, default/compact, 100%/200% zoom; record effective viewport after zoom and preserve distinct rows rather than silently substituting dimensions. Existing mobile sidebar hiding must be disclosed; hidden destinations are not claimed accessible on mobile. No dead actionable mobile surrogate. Explanations must not clip, obscure task actions or create horizontal document overflow. Contrast/focus/touch targets use design authority, with measured viewport/scaling recorded. |
| T06-9 affected consumers | Existing Tasks package suite, typecheck/lint; source/completion, date/filter, list/tag, canonical migration/subscriber, save-recovery tests; host routing/feature-gate and affected Board-link/Statistics completion projections; actual existing checks retained. New local strings cannot leak into unrelated locales or shared tokens. Protected source/hash audit at candidate and integrated SHA. |
| T06-10 full acceptance | Independent actual cross-vendor review/verification plus fresh Astra final acceptance reconciles all four original entries, every row above, before failures, fixed evidence, residuals, permanent budgets and protected hashes. A green package suite, successful vendor launch or fresh Codex instance is not this gate. |

Source-only statements in T06-5/6/7 are limits to be tested later, not current runtime PASS claims. If P0 has an unrelated real source/account/recovery failure, freeze it, bind it to its owner and register separate repair; do not change fixtures, remove assertions, or claim full TASK-06 acceptance while its user-facing completion explanation lacks an admissible path.

## 8. Evidence mechanics, regression and instrumentation gates

Runtime is **forbidden in this preparation**. Later evidence uses only its executor's worktree server and streamed immutable `git archive`; main checkout is at most read-only XAI_DEPS_ROOT. Freeze lockfile hash and all @repo archive-resolved module identities, log requested/resolved SHA, reject output overwrite, retain nonzero exit codes and PRECONDITION counts. A runner copied or created for TASK-06 needs separate exact-path registration, positive/negative controls, independent qualification and root adoption before business evidence uses it. Do not overwrite canonical/historical runners or use app code injected by a fixture as proof.

Native follows CDP pipe transport, trusted input and passive keyboard audit; no nativeVirtualKeyCode. Preserve the frozen pixelFocusWalk identity from `bacdbbc` as identified by the original goal; any new measurement copy follows approved M qualification/review/adoption with exact hash, no local tolerance/visibility/focus-stop relaxation. Clock outside-focus failures remain their own permanent units; they cannot be converted into TASK-06 passes or silently charged as new budgets.

Final affected/full audit regressions retain **all** C-FB002 (More boundaries), OE (Appearance continuity-export), C-RD1 (Features downstream case014), plus **predicted C-FD1** (P0 expected 14/15 with C-RD1 the case014 decision copy; not invented 15/15). Root's frozen G1/Required-evidence manifest must enumerate each required contract item and existing historical artifact identity, including Clock E1–E25/frozen F1/rail/Appearance/host/Header items when that integrated product baseline is claimed. Original valid historical evidence is reused with its exact SHA/qualifications, not rerun for this static preparation; genuinely affected candidate/integrated-SHA runs are separately registered. A new Tasks proof cannot certify Clock, suppress whole-host descendants or waive the original complete audit regression chain.

Package/host tests proposed for later cards: `pnpm --filter @repo/plugin-web-tasks test`, `typecheck`, `lint` and the exact affected host/consumer commands derived from their frozen package scripts. No command has been executed here. Root must register the complete finite run manifest and outputs before launch; an unbounded 'test everything until green' loop is not authorized.

## 9. Full gate chain and remaining admission obligations

1. Root receives this exact two-ADD preparation commit after parent/scope/hash/clean/cost audit. It preserves source remotely and records source→integration identity under its exclusive resource. Document receipt is not approval.
2. Fresh independent TASK-06/contract-review (future family cap 3) reads every source and explicitly decides the supported-completion versus unsupported-footer distinction; reviewer never repairs. REVISE returns a new bounded author, retaining attempt count/history.
3. Separate frozen TASK-06/before as §7, with independently qualified instrumentation and exact artifact card. Preserve P0 failures, positive controls and any external preconditions.
4. Root resolves `existing-owner-rule-or-minimal-decision:TASK-06` from §4 evidence and approves the exact future allowlist only after before and semantic locks. No newly inferred product decision, broad write grant or status shortcut.
5. Fresh builder implements only the registered set, with finite tests and source/output hashes. New actual product failure outside scope is frozen and sent to another authorized repair actor; no scope creep.
6. Fresh independent verification on candidate and, when affected, integrated fixed SHA; actual cross-vendor tooling and raw verdict required. Vendor unavailable stays an explicit gate; credentials or model configuration are not a pass.
7. Fresh independent Astra full-scope acceptance checks all original acceptance clauses, source/account/visual/native/affected regressions and residuals. No same-caller author self-acceptance. Formal runtime readiness and docs review remain distinct.
8. Root alone reconciles accepted evidence into ALL-TODO-CURRENT.md / EXECUTION.md / EXECUTION.json, **append-only evidence and unchanged formal states/counts**, then dispatches inventory refresh and closes remote ancestry/sync receipt. Inventory is not written before caller acceptance. Formal totals remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**. TASK-06 remains pending; this two-file document does not close an item.

Local preparation has no ship or cross-machine handoff claim. Source push, archive-ref preservation, integration, remote ancestry and normal sync-check are root's later operations; no worker push. Do not archive another actor's worktree or remove stash/unreachable state to make sync green.

## 10. Cost, limitations and stop conditions

Used: **one bounded static preparation pass (1/1)**. Product implementation 0; runtime 0; browser 0; native 0; package/build/typecheck/lint/test runs 0; diagnostic probes 0; historical reruns 0; children 0. Standard-library blob hashing, source comparison, doc-scope/whitespace and commit-shape checks are document verification only, not runtime qualification. Failed lookup of absent CalendarSidebar.tsx and nonexistent xai-web-stores directory was corrected by actual source paths; neither was a product test or source claim.

All permanent histories remain: Clock Q1 focus 1/3 and six other units 0/3 at recorded scheduling checkpoint, development 2/83, B70 before/refusals and exhausted visual 3/3; original MAP review1 REVISE/review2 APPROVED; other callers' current counters are read-only. These are inherited historical snapshots, not reset/current dispatch authorization. Root must reread permanent unit ledger before every subsequent task, retaining later increments and any unknown process counts. No r1/r2 filename, new actor or worktree resets a unit. Future formal units cap at 3 including refusals; probes separately disclosed and bounded by the later card.

Stop/freeze affected work on parent/hash/input drift, unknown dirty ownership, missing source, protected-path demand, unsupported product choice, unqualified instrumentation, runtime requirement during this pass, irreproducible evidence or exhausted cap. Partial readiness never becomes implementation permission. Clock's blocked native geometry/method may block specific full-host evidence but not this static preparation.

Remaining: independent contract review, separate before/runner qualification, explicit implementation admission, implementation, runtime/native/visual/source/account/affected regressions, real cross-vendor verification, fresh final acceptance, root reconciliation/inventory/remote receipt. No smallest unresolved owner question presently needs asking. Preparation author has not verified any of these future gates.

## 11. Input integrity and local document checks

`inputs.sha256` binds full commit SHA:path bytes, not moving branch names, with one explicit attachment-path record for the original goal. It includes exact dispatch/governance/adoption inputs, original obligation/source reports and mapping, immutable inventory, and the task/calendar/storage/host/design source corpus used above. Relevant P0 product paths are byte-identical at P. Only these two additions are staged; original three ledgers, canonical Clock contract, all product and configuration inputs remain unchanged. The manifest contains **195 input identities**; **169 P0 product/source identities** match P byte-for-byte. Local checks validate required four-entry/action/acceptance coverage, the seven-path future allowlist, unchanged formal record/counts, manifest identities and whitespace. Those checks do not constitute independent review.
