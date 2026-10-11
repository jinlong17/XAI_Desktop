# TT-08 preparation r1 — proposed fixed-source documentation contract

## 1. Verdict, ownership and fixed identities

**PREPARATION COMPLETE; PROPOSED CONTRACT, NOT ACCEPTED; NOT IMPLEMENTATION_READY.** The next eligible task is independent `TT-08/contract-review`, followed by the registered before/implementation/verify/accept chain. No TT-08 acceptance, READY_TO_SHIP update, formal-state change or release readiness is asserted. There is a bounded documentation path using already accepted TT-02 rules; no product-mode redesign is needed to prepare that path.

- Primary module: **web**. Workflow C preparation under the single root A-Codex controller. Scope-map TT-08 primary workflow remains B (eventual implementation); dependencies explicitly assign prepare=C and contract-review/before/verify/accept=D. This is not an admin task.
- Actor: fresh independent contract author `/root/parallel_c_tt08_contract_r1`; configuration requested `gpt-6-astra`, not independent actual-provider attestation. No children. Codex independence is not cross-vendor evidence; existing `Verify Cross-vendor: yes` remains unwaived.
- Owned worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-tt08-prepare-20261010/XAI_Desktop`; detached HEAD initially clean.
- Fixed parent and resolved registration commit: `7bb8df1631b94295bb7c3f928fcd9924b1337873`. Its parent is `e041c2bc293b70db367444c62c4300231976dbf7`, the older map/DAG input, not a replacement product snapshot.
- Fixed product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- All indexed package/host inputs were read from this worktree, checked against fixed-parent blobs, and verified byte-identical to P0. No other-session worktree was accessed. No moving HEAD is an input.
- Current authority: original goal attachment (hash indexed), `parallel-control-r1/authority-overlay.md`, `goal-C.md`, scheduler and registered TT-08/prepare card at fixed parent. Worker no-push/no-runtime bounds govern this checkpoint; root owns remote preservation, integration and sync-check. Local commit is not cross-machine completion.

Original TT-08 text is preserved exactly:

> action: 核对single/multi mode实际语义并同步PRD、日志和页面
>
> acceptance: 文档不再声明未消费的模式；独立verify后更新READY_TO_SHIP状态

Its fixed record is P2 / 文档 / web / 当前范围 / `formal_state: pending`, no existing TT-08 execution evidence. TT-01, TT-02 and TT-03 remain completed. Total states remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending = 312; 299 unclosed**. Preparation is not an item closure.

## 2. Input freeze and static before

`inputs.sha256` uses standard `SHA256  path` rows. All relative rows identify bytes from the fixed registration commit above; the absolute row is the immutable original goal attachment. The index has 131 inputs (34 package/host inputs verified P0-identical). The index covers the entire Time Tracker package (source, tests, docs and configuration), widget consumer/test, shell registration, original audit text/screenshots, TT01/02/03 diagnosis/implementation/independent evidence directories, REL01 consumer evidence, control/DAG rules and existing canonical PRD inventory. Hashing evidence preserves identity; it does not claim a new execution or revalidation of every old assertion. Output files are deliberately excluded from their own input index.

Key P0-identical source/document hashes:

| Input | SHA-256 |
|---|---|
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | `d24a6c053d07e7a804d10c50cb7a8586493269f251b18e490b87e20ada4733ea` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | `9c204aca71c5b34817e8f99198892bfa39f31754894006e88c07bc74235bf66e` |
| `packages/plugin-web-time-tracker/src/internal/time.ts` | `f1eef4f90a71cf6d7a1183fbe1bae983ba9c137b171b8713f17838441e58dd5a` |
| `packages/plugin-web-time-tracker/src/types.ts` | `797355b86c2e4b5d9ba3a7e6117de0cdf7677028126bc9fce27c7659e650e568` |
| `packages/plugin-web-time-tracker/src/index.ts` | `6bc73a71807bfabe2605e397a27157d6b71c8f2435c03e039cbfb49f3e761b88` |
| `packages/xai-web-dashboard-widgets/src/widgets/TimeTrackerWidget.tsx` | `1abe3f1a80c80df9e64f49a20b930c7210b5ca879e23f606cdf0fd5e99ab6b3c` |
| `packages/plugin-web-time-tracker/docs/design.md` | `b784eee415e4ebaf840612659853adbe95a5910bf3f29ed0ada7d607f200c7fa` |
| `packages/plugin-web-time-tracker/docs/api.md` | `f7ee9d8c62043e0b119c361b8f7966fa50cbcffbdf453cbcca1646af500b526e` |
| `packages/plugin-web-time-tracker/docs/test.md` | `76bc68071c00513553547aae853ad9a96cae73f55d4298d66c7df5e3f54014dd` |
| `packages/plugin-web-time-tracker/docs/dev_log.md` | `d7be8982a0643b99961bc66435e06d2f7f94cd8127b3da05ba6feb281f8a80a2` |

Negative before evidence: fixed-parent tracked tree has **no `docs/product/time-tracker/prd.md`**, and the PRD inventory/search found no Time Tracker canonical feature PRD. The broader Web PRD is present but has no Time Tracker single/multi contract. GOV-05 explicitly retains the missing Time Tracker canonical PRD obligation. Do not fabricate a historical PRD or treat prototype absolute paths as currently verified input. The old design provenance is retained as historical attribution only.

The static before consists of the immutable blobs and exact drift rows below. It is suitable for documentation correction. Historical runtime evidence remains at its own recorded SHA and is not relabeled as new P0 execution.

## 3. Current single/multi semantics and actual consumers

| Surface / exact fixed-source locator | Observed semantics | Authority / qualification |
|---|---|---|
| `src/types.ts:5`; `internal/storage.ts:15-16,124-141` | `TimeTrackerMode = single | multi`; absent/non-multi raw key reads single. `xai_tt_mode` is an unscoped browser-origin device preference. Category/entry JSON uses account/generation physical keys. Mode write changes the preference and dispatches the package event. | Existing TT02 design/API and accepted diagnosis distinguish device mode from account-scoped session storage. No cloud/account synchronization claim. |
| `TimeTrackerModule.tsx:520,789-792` | Actual EN/ZH selector reads `useTimeTrackerMode` and writes via `setMode`. The hook (`storage.ts:330-334`, shared hook 208-247) listens for storage/package events with captured-owner readiness guard. | The original audit's mode-is-unused statement is no longer current. |
| `TimeTrackerModule.tsx:606-622` | Start is available only for selected today. In single mode with running sessions, show explicit End and start confirmation; capture running-source JSON; recheck inside update and finish running rows before appending a new row at one timestamp. Multi appends distinct sessions without this switch dialog. | Already established TT02 policy; do not remove the selector or modes to satisfy the old wording. |
| `internal/time.ts:128-138`; `storage.ts:272-297` | Active includes paused, running requires an open last segment. Locked controller rereads canonical account data, checks expected source, validates intervals, and in single mode rejects a newly running session if more than one would run. Paused sessions are not themselves competing running sessions. | Single does not mean at most one unfinished record. No duplicate open intervals within a session in either mode. |
| `TimeTrackerModule.tsx:627-643`; `storage.ts:165-184,272-297` | Pause/resume/end use the same entry controller. Resume does not open the Start confirmation dialog; resuming a second running task in single mode is rejected with the controller error. Replay/terminal safety remains intact. | Document the Start/Resume distinction; do not promise confirmation on every command. |
| `storage.ts:137-141,292-294`; selector 789-792 | Selecting multi→single changes only the mode key; it does not itself stop/choose a running session. The controller permits unchanged pre-existing running IDs while blocking a newly running ID that leaves >1 running. A later single-mode Start confirmation finishes the then-running set. | **Implementation observation/limit**, not a new owner-approved migration policy or guarantee that every persisted single-mode state has ≤1 running row. No source changes in TT08. |
| `internal/storage.ts:186-207` → `TimeTrackerWidget.tsx:11-36` | Snapshot reads entries/categories; returns aggregate duration and runningCount. Widget displays running count and opens `timetrack`; no direct mode read or start/pause/end handler. | Indirect consequence of persisted sessions only. DASH-07 remains open; no widget controls invented. |
| `src/index.ts:5-34`, `registration.tsx`, host `shellRegistrations.tsx` | Public surface exports mode type/key, module and snapshot; mode read/write/hook/controller functions remain internal. Shell registers the module. Insights/CSV consume entry/window helpers, not a separate mode branch. | No new public API, host mode controller or accounting rule. Searches across tracked apps/packages found no additional mode consumer. |

**Remaining owner-decision boundary:** no unanswered owner decision blocks the bounded docs description of existing accepted Start/single/multi policy. Mode-conversion behavior above is only an observation. If later work wants immediate reconciliation when selecting single while several sessions run, the grouped question is: “Should selecting Single keep existing running sessions with future-start enforcement, or require an explicit selection/confirmation to end some sessions?” That is a separately registered product decision; do not ask again about already accepted TT02 Start behavior, W1/C1/F2/R1, and do not make this optional redesign a prerequisite to honest docs. Likewise mode-storage error recovery is not established by the entry-controller guarantee.

## 4. Document/page drift and permitted resolution

| Current input / before location | Finding | Already clear rule / proposed exact action |
|---|---|---|
| Original `02-tasks-time-boards.md:128` | Historical audit says module does not consume single/multi. True of its old snapshot, contradicted by TT02 fix and P0. | Preserve original audit bytes; new docs identify the superseding TT02 source/evidence. Do not rewrite the frozen failure as if it never happened. |
| Missing `docs/product/time-tracker/prd.md` | No canonical feature PRD to align; GOV-05 also owns this gap. | Propose this **one exact new path**, limited to accepted Time Tracker mode/session requirements and evidence-linked existing capabilities. Mark observed limits/unconfirmed product scope separately. This is a TT08 slice of GOV-05, not closure of GOV-05 or all tracker requirements. Root must lock the shared document before dispatch. |
| `packages/plugin-web-time-tracker/docs/design.md:8,38` | Mode claim is now consumed; TT02 amendment states the accepted policy. Generic “active session” can be read as including paused rows. REL01 paragraph still calls TT01 follow-up. | Retain accepted modes and TT02 decision. Clarify running vs paused and Start vs Resume; annotate observed conversion limit without inventing behavior. Supersede only stale TT01-follow-up text with historical accepted references. |
| `.../docs/api.md:15-22,33-39` | Key list does not itself explain device mode vs account session scope; accepted entry lock boundary exists. TT01 future-work line is stale. | Clarify mode key and internal/public boundary, precise new-running check, no global transaction claim for preference write. Link TT01/03 accepted projection semantics and limits. |
| `.../docs/test.md:3-16,31` | Test plan omits named TT02 controller/editor/mode and TT01/03 accounting evidence. TT01 is still called future work. | Add traceability to existing tests and fixed historical reports; explicitly distinguish unit shims, native historical evidence and current static verification. No new test suite or runtime results. |
| `.../docs/dev_log.md:3-5,14-30` | READY_TO_SHIP/merge suggestion dates to 2026-06-01; no TT02 or TT03 independent acceptance linkage. Historical command list includes old widget/grid package names. | Add dated TT08 docs iteration with Workflow/Executor/Updated/Suggested Next/Work Log and evidence lineage. Preserve old status/commands as historical evidence; do not promote, rewrite an old run command into a claimed run, or infer release from PLUGIN_MAP Stable. Current iteration stays pending independent verification. |
| Actual page selector/start/alert, `TimeTrackerModule.tsx:606-643,776-792` | Selector and confirmation exist in both languages; page does not currently need modification to make modes consumed. | Document and statically verify page correspondence; “同步页面” is assessed, with **zero page/source changes required** for this scope. No browser/visual/accessibility claim. |
| `docs/PLUGIN_MAP.md:128`; GOV-04 | Stable inventory and old dev_log READY_TO_SHIP are not deployment proof. | Read-only here. GOV-04 and controller inventory/release evidence reconciliation retain ownership; do not relabel either status from this proposal. |

## 5. Protected accepted evidence and source lineage

- TT01: diagnosis `6cd137e867bf0fba0c935ca5a7e97f09f003aef5`; fix `c5b08a723a47cf8cec59a585a714195efa98b1ba`; independent `8d951e93ea2935f2b7a06dcc9b25851ea1b6b783` / `web-time-window-independent/20260909-verification.md`: original 11 assertions, exact window totals, native 20 Insights, five CSV downloads, two DST zones/four boundaries. Preserve documented completed-row-count UX residual and limits.
- TT02: `ba2065859782ab787989e147f22ca84358c6f5b1` plus `64caa5a678ce9943a0e7aa03609095153c5131e2`; independent `082766b1a6413a6a746641c93541954c717dfcfc` / `web-time-tracker-session-independent/20260909-report.md`: 5 invariant assertions, 11 original window assertions, 78 package tests, 11 native assertions. These overlap and must not be summed into a coverage percentage. Real native single-start/lock/export evidence and unit multi-mode coverage are distinct; do not claim native multi→single transition acceptance.
- TT03: `web-time-hour-independent/20260909-review.md` fixed source `cd3146b8c241a6ac5434a10e555ae813b2cc2961`: exact hour remainders, source/range/timezone metadata, all 20 Insights, DST, five CSV files, 82 package tests. No performance or category-transaction verdict.
- Static diff TT02→P0 changes only `TimeTrackerModule.tsx` and adds `dayRollover.test.tsx` inside this package: `91497787b9ca7deabf88a3683d5a344699c39bf6` adds local-day clock/selected-day rollover, not mode logic. Independent REL01 after evidence is retained in `web-local-time-consumers-independent/20260909-review.md`. P0 is not byte-identical to the complete historical TT02 package and must never be described that way.
- Original audit screenshots/DOM, failure logs, harnesses and accepted reports remain immutable. None were rerun. The old 1440px/browser limitations, no cross-vendor claim, no repair/import and multi-segment time-editor limit survive.

## 6. Candidate future write scope and locks (proposal only)

After independent contract approval, before validation and root registration, one fresh documentation author may own exactly:

1. `docs/product/time-tracker/prd.md` — ADD, bounded canonical mode/session slice described above.
2. `packages/plugin-web-time-tracker/docs/design.md` — MODIFY only described mode/accounting traceability paragraphs.
3. `packages/plugin-web-time-tracker/docs/api.md` — MODIFY described key/consumer/contract traceability.
4. `packages/plugin-web-time-tracker/docs/test.md` — MODIFY evidence map and stale TT01 follow-up.
5. `packages/plugin-web-time-tracker/docs/dev_log.md` — ADD dated pending-verification iteration; preserve historical assertions/status as history. Independent verification precedes any current READY_TO_SHIP statement.

These paths are **not authorized for this preparation**. No glob is a write grant. No existing dossier or package doc was changed. Required semantic write locks: TT08 modes/documentation, GOV-05 Time Tracker PRD, GOV-04 Time Tracker status; root checks for active overlapping writers and serializes status publication. Read locks pin all indexed source/evidence regardless of other branches advancing.

All runtime/source/test/config paths are prohibited: entire `packages/plugin-web-time-tracker/src/`, package JSON/configs, widget/host sources, all storage/token/date/persistence implementation, all CSS, shared Dashboard/Clock source/styles/contracts/measurement methods, and original evidence. Control plane, three ledgers, TODO/maps/registry, inventory/PLUGIN_MAP, release logs, other product dossiers, another session's worktree, main/dev/web and any non-listed file are protected. No account-sync scope change, schema change, source repair, UI copy change, deployment, merge/rebase, push, release, promotion or D3.

## 7. Acceptance and affected-regression matrix

| ID / obligation | Required independent documentation evidence | Runtime obligation for this docs-only delta |
|---|---|---|
| D1 consumer truth | Every mode claim links to exact P0 selector, Start confirmation, lock check and test/report; no present-tense unused-mode claim or fictional widget consumer. | Static source/docs comparison; zero runtime. |
| D2 original decisions | Keep single default, explicit Start confirmation, multi distinct sessions, per-session invariant, stale/no-lock refusal; label conversion and storage-error limits as observations. | No re-deciding TT02 or new owner rule. |
| D3 PRD/page trace | Exact new canonical PRD cites accepted rules, points to actual EN/ZH page controls and missing-scope limits; source/page hash unchanged. | No page screenshot/interaction assertion. |
| D4 chronology/status | Historical READY_TO_SHIP and recorded commands remain historical; pending docs iteration has complete fields. Fresh independent verify receipt must precede a separate authorized current-status publication. | No runtime/release readiness inferred. |
| D5 TT01/02/03/REL01 | Hash identity of original evidence and product source unchanged; accounting, CSV/timezone, paused intervals/replay, account ownership, midnight obligations referenced accurately. | Retain accepted evidence; do not rerun historical runtime simply because prose changed. |
| D6 adjacent callers | No widget controls, category transaction, performance, recovery, settings disposal or cloud sync claims beyond evidence. DASH-07/TT04-07/REL04/GOV04-05 remain open as applicable. | If any source/shared helper is needed, stop and register new impact/before/implementation/verify scope. |
| D7 integration/global obligations | Root verifies fixed SHA, exact 5-path patch, unchanged protected bytes and semantic locks; independent full-scope acceptance before reconcile/inventory. | Clock chain unchanged. Existing C-FB002, OE, C-RD1 and predicted C-FD1 plus all contract Required evidence remain mandatory for their affected runtime/final-regression tasks; this docs-only task neither runs them nor waives them. |

Meaningful bounded checks for eventual docs edits: one exact-path `git diff --check`; compare changed-path allowlist; recompute input/source/evidence hashes against fixed blobs; independently read requirement→source→historical evidence rows and status chronology; validate referenced files/anchors and absence of invented mode semantics. No new mirror tests, package test/typecheck/build/lint, browser/native runs or rerun of old runtime suites is justified by this prose-only delta. A concrete unresolved source discrepancy triggers stop/re-scope rather than silently adding tests or product edits.

READY_TO_SHIP sequencing: the docs author records pending verification only. Fresh verifier emits immutable receipt against the exact candidate commit. A separately registered authorized status writer can then append a **TT08 documentation-only** READY_TO_SHIP entry referencing that PASS, retaining historical state and excluding whole-product release readiness. Fresh Astra acceptance reviews the complete required chain and exact status delta. Root alone reconciles/inventories, keeping formal audit states unchanged under the original goal. A green static check alone is not caller acceptance. If actual cross-vendor evidence is required and unavailable, keep that gate explicit; no Codex actor label substitutes for it.

## 8. Exact next task card and stage separation

**Proposed next card: `TT-08/contract-review` (workflow D, not yet registered/authorized).**

- Fixed inputs: this preparation's eventual full commit SHA plus its parent/P0 above and output hashes from handoff. Root registers that exact SHA before dispatch; no moving-HEAD substitution.
- Fresh uninvolved Astra reviewer; cannot be this contract author or a prior TT08 stage actor; no repairs/no children/no source writes.
- Proposed allowed ADD paths only: `docs/reviews/audit-parallel-tt08-contract-review-r1/review.md` and `docs/reviews/audit-parallel-tt08-contract-review-r1/inputs.sha256`.
- Acceptance: independently approve/reject D1-D7, exact five future docs, PRD/GOV semantic lock, status sequencing, original TT08 wording and TT01/02/03 evidence preservation; identify all gaps without lowering scope. No automatic implementation-ready on proposal receipt.
- Budget: one static review pass; zero package/browser/native/probes. Stop on identity/authority conflict, missing product decision needed by proposed text, protected-write requirement, unsupported evidence claim or exhausted caller/unit budget. Report blocked row and next independent correction scope; do not stop other workflows.

After that, preserve the registered DAG: fresh independent before actor establishes immutable static before against reviewed contract; fresh docs author performs exact approved delta; fresh uninvolved Sol verifier checks candidate; separate authorized status publication if warranted; fresh Astra full-scope acceptance; root reconciliation then inventory. Root must register exact per-stage receipt/output paths and commits before each dispatch. The five docs above are a candidate scope, not authorization to write them during review. Implementation and acceptance actors are fresh root-scheduled actors; reviewer never fixes.

## 9. Cost, stops and receipt

This execution: **one static discovery/contract pass (registration iteration 1); zero product edits; zero package invocations/tests; zero browser/native/probe runs; zero historical runtime reruns; zero children**. Git/blob/hash/path/diff checks are static checks, not business tests. No formal runtime iteration consumed. Preparation does not reset caller budgets: every later registered unit totals ≤3 formal attempts, including refusals, across actors/suffixes/worktrees; controller must inherit history before dispatch. Unknown historical totals are not zero.

Historical budgets preserved: TT02 report records initial TT01 runner resolution failure then corrected collection; TT03 reports initial replay then added assertions. Neither gives a complete permanent unit counter, so no numeric remaining runtime budget is invented. Clock B70 responsive visual is exhausted 3/3; focus 2 each language, no third launch; Q1 focus-controls 1/3, remaining six units 0/3; prior development calibration 2/83 checks unchanged. TT08 adds zero to those. All failures/logs retained.

Stop on input/hash mismatch, unexpected dirty ownership, unapproved behavior, need for source/UI/shared-Clock change, contradictory accepted rule or broader testing. Freeze findings and return to root for separately reviewed correction. Current bounded scope has no unresolved mandatory owner question. Main source/status uncertainty is explicitly limited above; optional conversion redesign is excluded.

Receipt checks performed: initial/final parent identity, clean initial status, fixed-source equality, exact input hashes, static consumer search, historical lineage diff, original TT08/state inventory, ADD-only two-file scope, `git diff --check`, and final exact-path commit/status checks. Push/remote ancestry/sync-check are not run by this worker; root receives and preserves the source commit under its authority. No adoption/status/acceptance is implied by this contract's commit.
