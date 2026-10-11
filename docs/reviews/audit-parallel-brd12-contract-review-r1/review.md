# BRD-12 contract review r1 — REVISE

Verdict: **REVISE**, documentary contract only. The complete original obligation and evidence boundaries are preserved, but two contract defects must be corrected before adopting the proposal. No product acceptance, runtime qualification, implementation permission, release readiness or formal closure is granted. **QL and QU are not established owner questions.** Do not forward them as mandatory choices from this review.

## 1. Identity, authority and scope

- Module: **web**; workflow D under the sole root **A-Codex** controller. Reviewer `/root/parallel_d_brd12_contract_review_r1` is a fresh independent actor, not the preparation author. Task-card model configuration is `gpt-6-astra`; no independent provider attestation is claimed.
- Sole writable worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-brd12-review-20261010/XAI_Desktop`.
- Fixed direct parent: `008bc70e10c0898a8ad227a92bb73a5ccb62d02b` (clean detached HEAD at entry). No moving root HEAD was followed.
- Source author: `5d1f28a0f81ae01155a213fac93133730f7bad51`; preparation parent: `52a80bcbf0293b0bb0446e6360d379edc1f26387`; integrated input: `83508ec199a6d759c4eba07460131ea91e417b82`.
- Product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`; original mapping baseline: `e041c2bc293b70db367444c62c4300231976dbf7`.
- Exact card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd12-contract-review-r1.json`. Only this report and sibling `inputs.sha256` may be added. No reviewer repairs.
- Read original goal first, then AGENTS, CLAUDE, shared workflow/multi-machine rules, current control-plane authority, parallel overlay, goal-D, and adopted r2 scheduler. The r2 scheduler's preserved historical UNACCEPTED header is superseded by the explicit adoption receipt at CURRENT-CONTROL-PLANE.md:579; no new adoption occurs here. Root serializes all receipt, integration, global state and external Git operations.
- Original goal SHA-256: `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`. Worker no-push/no-fetch/no-sync restrictions are the specific dispatch rule; root performs durable remote preservation and handoff checks.

## 2. Full source integrity and original scope

Independently decoded and rehashed **all 5083 preparation inputs**, with **zero mismatches**: 5072 fixed-preparation-parent files, six historical blobs, four **raw tree-object byte streams**, and the original external goal. Git batch object reads used the exact object length and binary bytes; tree digests were not computed from pretty `git show` output. Source and integrated proposal blobs are independently bound. All review-parent reads are fixed to the direct parent in the new manifest.

`inputs.sha256` contains **10166 entries**: the original 5083 explicit source identities, 5079 fixed-review-parent file identities, and four source/integration proposal-blob identities. SHA-256: `e397986128822bad1b82ce6f5c0bed3579c9500b95ccb5cdbdc5b89d67dc4f62`. Broad package/evidence preservation is not a claim that every file was semantically reviewed or executed. Output hashes are reported in the final handoff, avoiding circular self-hashes.

The original BRD-12 action is **Checklist旧计数迁移与Done自动勾选规则明确化**; acceptance is **不生成看似真实的Item1标题；自动勾选可解释并可撤销**. P2, 决策, web, 当前范围, source `02-tasks-time-boards.md;05-visual-ux-audit.md`; original evidence empty; formal pending. No reduced substitute obligation was used.

JSON comparison checked every original field of all **312 ordered TODO rows**, every retained execution record, every existing evidence value and ordering. Exactly **39 reversible module normalizations** remain: 30 `web（project-system）` and nine `web（跨模块验证索引）` become `web`, while `original_module` retains the exact original value. No normalization is a gate waiver. All **933 ordered original evidence references** remain; the only additions are TT-08's exact six references:

1. `commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef`
2. `../audit-parallel-tt08-final-acceptance-r1/acceptance.md`
3. `sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca`
4. `commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056`
5. `../audit-parallel-tt08-vendor-verification-r3/receipt.md`
6. `commit:b4c33120bde198214bbe3bf76ead543b5f139c3a`

Current total **939**; states **13 completed / 3 verification_pending / 3 in_progress / 293 pending**, **299 unclosed**. All three ledgers are unchanged between preparation parent and this review parent. TT-08 documentary acceptance does not close TT-08 or TT-06. P0→review parent apps/packages/root package+lock diff contains only the four Time Tracker package documents; Web Board, storage, App host, Desktop and CSS runtime sources remain P0.

## 3. Blocking findings and precise corrections

### BRD12-R1-01 — Reconcile legacy-byte preservation with retained automatic completion (P1)

**Coordinates:** preparation `contract.md:54` B01 versus `:59` B06, `:20`, `:37` and `:50`; B02 at `:55` also needs operation-relative wording for ordinary edits versus automatic completion. These are source-proposal coordinates, unchanged at author and integration commits.

B01 says to preserve original counts/bytes/provenance “until explicit user action.” B06 preserves the existing opening/day automation, and `automationLite.ts:completeCard` intentionally sets aggregate-only Done cards to `done=total`. `BoardWorkspacesModule.tsx:632–680` runs that transformation on mount and writes it; a cross-list move at `:780–790` runs completion over all eligible Done cards in the moved lists, including other cards. A legacy Done card with `{done:1,total:3}` therefore cannot simultaneously retain canonical pre-mount bytes and satisfy the retained automatic completion rule. The proposal's pre/post-mount note recognizes the source mutation but does not resolve the normative B01 contradiction. One future oracle could demand no write while another correctly demands an attributable 3/3 operation.

**Required versioned correction:** distinguish (a) immutable captured source/preimage and missing historical row information, (b) canonical state after an authorized, explained automatic operation, and (c) explicit user reconciliation into genuine titled rows. Specify allowed field deltas for legacy and structured cards, with exact before/after counts, true prior flags, completedAt presence/value, and unaffected urgent/sort/other-card fields. Preserve the original pre-mount raw evidence and operation attribution without claiming canonical bytes must never change. Freeze both pre-mount and post-mount controls and map B01/B02/B05/B06/B07/R01/R02/R05 consistently. Do not suppress the known triggers to make the conflicting oracle pass and do not treat automation as invented per-row legacy provenance.

### BRD12-R1-02 — QL/QU escalate unproven choices and leave the actual technical contract unspecified (P1)

**Coordinates:** preparation `contract.md:24`, `:71–75`; dependency freezes at B01/B03/B05/B07/B09 and R01/R05 (`:134`, `:138`); allowlist prerequisite at `:79`.

The statement that no source can recover lost titles is correct, but it does not establish an owner decision about how to fabricate or replace them. Existing card-detail API §3.1 expressly accepts an aggregate when the array is absent; checklist design §Frozen Assumptions makes real arrays canonical when present; the original audit row at `02-tasks-time-boards.md:160` calls for truthful missing-title presentation, and BRD-12 expressly rejects invented Item1 titles. Together these authorize the bounded facts: retain unknown aggregate information as unknown, render it truthfully, never manufacture historic item IDs/title/flag attribution, retain real literal “Item 1” rows, and let explicit user input supply genuine new information. QL's separate historical-summary storage and unknown-slot model are alternative implementation proposals, neither an established owner requirement nor an already-approved schema. The author has not shown that every bounded technical reconciliation path requires a new product preference.

Likewise, BRD-12 already requires an explainable and reversible automatic operation. Source proves a preimage is necessary: `completedAt` and all-true flags erase the prior vector. It does not prove a retention duration, session expiry, reload expiry or durable-history product requirement. QU presents expiry-versus-durable-history as a prerequisite before authoring a minimum inverse. The accepted append contract applies to unresolved failed appends and explicitly does not accept ordinary-field or successful-operation history; it cannot supply a successful undo expiry rule. Neither can “browser session” in the automation trigger design: that describes scheduling, not undo retention.

**Required versioned correction:** replace QL/QU as automatic owner gates with a concrete, bounded technical proposal under the existing no-fabrication, data-preservation and reversible-operation rules. Specify truthful aggregate/real-item presentation and progress precedence, exact explicit conversion and information preservation, then an operation identity/preimage/delta/commit/acknowledgement/inverse contract for all three known entrypoints. Cover real versus ambiguous already-materialized rows without regex provenance inference. Give deterministic examples for manual-true plus auto-false rows, aggregate-only counts, existing completedAt, multiple affected Done cards, later edit/add/delete, conflict refusal, retry/read-back uncertainty, account generation changes and departure/reload. Also distinguish undo of operation X from a subsequent legitimate trigger Y; the proposed oracle must neither immediately undo the undo nor silently disable Y.

The author must state what its concrete mechanism preserves at every lifecycle boundary before choosing storage layout. No invented retention interval, number of undo entries, session-only expiry, permanent-history promise, schema field or storage key is approved by this review. The existing obligation permits technical design work without asking whether reversibility itself is wanted. If a concrete design cannot satisfy that obligation within the protected boundary, identify the exact irreducible product tradeoff, conflicting authoritative clauses, affected cases and why conservative preservation cannot resolve it. Only that proven residual may become a minimal root-consolidated owner question. Do not reask Done semantics or opening/day/manual/move triggers. This review neither approves option QL(a)/(b) nor QU(a)/(b), and it does not waive lifetime, account, recovery or persistence proof.

## 4. Independent owning-rule and source assessment

Read the complete checklist-editor and Automation Lite design/API/test contracts and their discovery records, the card-detail owning rules, original audit, Project PRD/roadmap, accepted append architecture/final review, actual writers, normalization/guards/storage/migration/export and Desktop store. The Project PRD's broad future entity/schema suggestions are not an adopted BRD-12 schema. W-1/C-1/F-2/R-1 belong to other callers and cannot select checklist defaults.

| Source / path responsibility | Independent conclusion |
| --- | --- |
| Modal `getChecklistItems` and recovery `checklistItemsFor` | Both synthesize `legacy-${card.id}-${index+1}`/`Item ${index+1}` and infer first-N done flags. Fixing only visible text leaves append persistence lossy. |
| Modal replaceChecklistItems → patchActiveCard/updateCard → writeLists | Ordinary toggle/edit/remove remains distinct from result-aware append. Recovery for one is not evidence for another or for inverse. |
| Automation Lite + BoardWorkspacesModule | Existing semantic Done matching, archived exclusions, opening/day, manual and cross-list execution are settled. Whole-board affected set, sort suppression and urgent effects must be attributed accurately. No exact inverse exists now. |
| normalizeBoardCardDetail/mergeBoardCardPatch | Array present derives aggregate; empty array deletes chip. A separate history/coexistence model cannot be inferred from these helpers. Unrelated unknown fields and envelope metadata must survive. |
| isBoardArray/readBoardStorage/persistence | Count guard accepts numeric shapes without finite/nonnegative/integer/ordering proof; duplicate item IDs are not rejected. Missing/invalid/empty data rendering seeds are not write authority. No silent validation cleanup is approved. |
| storageContract/exportImport/accountMigration | Legacy arrays and v1 envelopes are distinct. Envelope wrapping cannot recover lost titles. Logical projection derives items-first progress. Account migration registers isBoardArray, so envelope compatibility must be examined rather than assumed green. |
| accountScope/registry/migration + real Web App registration | Captured scope is an identity, not merely account-name equality; epoch/generation/physical keys matter. Production board registration is real `/app/board`; standalone fixtures and seeded account objects do not replace host/provider evidence. |
| plugin-project types/store/adapters | Separate Desktop plugin path: actual checklist arrays, version/schemaVersion, account-sync RepoRecord, local `xai.plugin-project.cards` or Tauri repositories. Move changes lists/order and emits events; no Web Done automation. Protected, not a repair target. |
| Card/Table/detail/export/Calendar/Timeline/Planner | Progress projection and shared update callbacks remain affected read dependencies. Exact whole-data comparisons must permit only reviewed operation deltas, without losing original source. |

Historical conflict is concrete: `web-board-detail-astra-final/detail-contract.test.tsx:34` expects synthetic legacy rows; `:39` expects legacy total increment. Its accepted review explicitly notes synthesis and post-mount baseline calibration. A future new oracle must explain and independently review that semantic correction in a **versioned copy**, keeping the old test, hashes, calibration failures and acceptance scope. Simply changing the old assertion or calling a new green test equivalent is prohibited.

## 5. Complete business matrix disposition

The proposal has all B01–B12; none is dropped. These are contract obligations and prospective proof, not runtime PASS results.

| Row | Review disposition / retained condition |
| --- | --- |
| B01 | REVISE R1-01/R1-02: raw source versus authorized canonical delta; truthful unknown counts; both synthesis paths; failed append retained. |
| B02 | Preserve real IDs/text/order/flags and literal Item1 names, absent versus empty array, derived counts; make operation-relative attribution consistent with R1-01. |
| B03 | Preserve ambiguous legacy/imported provenance, no destructive regex cleanup; deterministic user-supplied reconciliation required by R1-02. |
| B04 | Full invalid/malformed/huge/fractional/count/ID cases remain; no clamping, default writes or silent domain change. |
| B05 | Legacy/envelope migration, idempotence, metadata and export/import/account compatibility remain; concrete conversion and schema review needed. |
| B06 | All semantic variants and three triggers, archived/same-list controls, other Done cards, urgent/sort preservation; R1-01 fixes contradictory canonical expectations. |
| B07 | Exact inverse and prior completedAt/flags; no snapshot overwrite, deletion/resurrection or later-edit loss. R1-02 must supply operation and successor-trigger examples. |
| B08 | Physical-key read/write/read-back failure, latest draft, stable identity, retry/double-click/collision, explicit export/discard; no false saved/undone state. |
| B09 | A→B→locked→A with changed epoch/generation, target removal/move/archive, route/modal/board/reload; lifetime is untested, not waived. |
| B10 | Actual App + account/storage hooks and every progress/date/priority consumer; new-document native and same-account source proof required. |
| B11 | EN/ZH 375/414/768/1024/1440, themes/long content, new states, trusted keyboard and visible focus, 44px applicable controls, manual screenshots. No CSS grant. |
| B12 | Exact future scope, preserved old failure/oracle history, all affected suites and canonical G1; versioned corrections reviewed before execution. |

## 6. Complete producing-evidence gates

| Row | Retained gate / no substitution |
| --- | --- |
| R01 | Full hashes, unit-history reconciliation and B01–B12 consistency; replace unjustified QL/QU selection gate with reviewed concrete design or a proven residual decision. |
| R02 | Source + raw pre/post mount, exact operation/input identity, expected failures and controls, zero unexpected PRECONDITION; source inference is not frozen before evidence. |
| R03 | Actual registered App before/account/native trusted inputs and real downloaded bytes; synthetic host labeled. |
| R04 | Exact product commit/path delta, versioned oracle correction, author immutable-source logs and full costs. |
| R05 | Fresh independent fixed full B matrix including concrete migration/inverse lifecycle; no branch narrowed away by owner-question labels. |
| R06 | Native new document, second-document conflict, account transitions, trusted drag/keys, disk download inspection; no provider proof invented. |
| R07 | Full visual/keyboard states with qualified focus identity, sizes/containment/CSS invariance and manual image review. |
| R08 | Board focused/full tests/typecheck/lint, Web gates, storage types, all named consumer/task-link/append/composer/creator/workspace recovery regressions; retain known failure classifications. |
| R09 | Canonical Clock r2 all E1–E25 and accepted judging copies; applicability review for valid history and inherited-budget admission for genuinely affected reruns. |
| R10 | Actual cross-vendor evidence and fresh full Astra acceptance; this Codex review is not cross-vendor. |
| R11 | Root receipt/source preservation/integration/global ledger append only after acceptance, unchanged 312 states and remote/sync proof. |
| R12 | Fresh integrated inventory and remaining gaps; caller acceptance never automatically closes an audit item or release. |

Canonical r2 §14 SHA-256 is manifest-bound. Independently compared all **E1–E25** against preparation §8: E1 oracle/lock/source/spy/seed/consistency; E2 six before modes; E3 actual host a–q; E4 native before/focus/geometry/K-1; E5 Clock F1 before; E6 exact implementation/author logs; E7 six fixed modes; E8 fixed host; E9 17-value/reload/read/lock/uncertainty/conflict/retry/discard; E10 seven disk exports plus setup failure; E11 native a–q/auth branches; E12 downstream/event/other-key/chrome invariance; E13 bilingual five-width/pet/44px/selector/manual visual; E14 per-stop focus/states/themes/Tab-out; E15 **16** F1 invocations (12+2 Appearance K-1+2 rail); E16 Clock c1–c5/release-once; E17 Header host/native/Astra/Sol and capacity copies; E18 source census; E19 protected diff; E20 storage lifecycle/types; E21 widgets gates+before; E22 grid gates+before; E23 Web/rail/CmdK; E24 all accepted callers; E25 full producer/hash/verdict/refusal receipt. No missing E-row was found in the proposal; this is documentary coverage only, not Clock completion.

E24 original/judging distinction remains: More frozen boundaries **and C-FB002** 10/10 judging; Appearance frozen 24/26 **and OE** 26/26 judging; Features frozen 13/15, **C-FD1** diagnostic 14/15 and **C-RD1** judging 15/15. AppRail eight modes/parent, all Appearance/Features/More modes, Sticky, Notifications, Date & Time, Smart Lists/Collaborate/Pomodoro accepted copies, settings-shell/rest remain. Existing hash/source-invariant evidence is reused only after applicability review; do not rerun history gratuitously or assert that every unrelated suite must execute anew. Canonical native exclusions remain conditional on their actual invariance bounds; a relevant shared delta removes the exemption.

New native machinery must retain pipe transport, trusted input/passive key trace, no nativeVirtualKeyCode, streamed immutable archive, fixed lock and @repo source guards, requested/resolved SHA, no overwrite, nonzero exits, actual files on disk. Original pixelFocusWalk is immutable; new measurement methods require full qualification, independent review and root adoption. Existing Clock M+G+B sequence remains local prerequisite; this review cannot use blocked/unqualified measurement as accepted native evidence.

## 7. Permanent execution lineage and budgets

This is contract review **1/3**, one static pass. Preparation **1/3** remains consumed. All runtime/test/build/lint/browser/native/vendor/qualification/probe/new-child counts are **0**. Hashing and JSON comparisons are static document integrity checks, not product tests.

The preparation correctly refuses to mint fresh runtime budgets merely from BRD-12 naming. Additional independent raw-log inspection distinguishes artifacts, assertions and actual processes:

| Existing unit | Direct source evidence / remaining admission |
| --- | --- |
| Original three rejected-appends | Five diagnosis-directory log artifacts plus **two** Sol original-three logs = seven retained artifacts (the preparation's “Six retained logs” wording is imprecise). Six archived rerun logs have distinct temporary roots WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM; before.log is a separately retained main-checkout run. This substantiates multiple actual executions; three assertions per process are not three unit attempts. Exact policy-era formal/probe totals remain unreconciled, never 0/3. |
| Independent detail business unit | Calibration, view-fixture calibration and final logs have distinct archive roots vR4Xvt/QNw9Ce/H1Ap2r and 5/8/8 case sets. Keep all three executions and their failures. `author-tests-rerun` is a distinct mode with inherited source lineage, not a new broad Board allowance. |
| Native detail retry/download/reload | Four log artifacts have distinct Chrome PIDs 14575/15385/17812/18500 and distinct proposal IDs, with parent-verification explicitly identifying its execution. Thus four sessions are source-supported, not inferred just from filenames. Their formal/probe subdivision still requires reconciliation. Output pictures/assertion counts do not create new unit identities. |
| Full Board package | before/after/final logs have distinct roots lpCkP7/zYQAbA/qnu7yE; parent task-link fixed adds BmWgbG. Preserve original nine fixture failures and later repair lineage; do not reset as “BRD package.” |
| D1/Task-link/native | Mode-specific lineage remains. Native initial baseline PID23393, blank before-fixture log and admitted PID23613 do not let a filename census infer one successful invocation per file. Refusal/launch history needs its original receipt; blank log is not zero cost. |
| Proposed N-L/N-P/N-U | Genuinely new **assertion purposes** are source-grounded: old legacy assertion expected fabricated rows; provenance ambiguity was not distinguished; forward-only automation has no inverse. They may justify a separately reviewed purpose, but do not reset any reused driver/host/append/package/native execution unit. Exact new cases/driver/source lineage need registration before any count is granted. |

Current fixed control preserves Clock original Q1 focus **1/3**, six other units **0/3**, development **2 invocations / 83 checks**, B70 and exhausted visual histories. Retention validation is **3/3 exhausted**, 145 assertions, 41/42 case executions; final 14/14 does not qualify the method. Clock correction review R1–R6 and impact2 remain BLOCKED, no fourth attempt/filename/probe reset. REL vendor-history uncertainty and TT08's three actual vendor runs are unrelated inherited counters, not BRD credits. This worker allocates none of them.

Before any runtime card, root must distinguish genuinely new permanent execution-purpose units from reused unknown/exhausted units using command/product/fixture/driver/process evidence. Unknown historical totals remain unknown and freeze only the affected reused unit; they do not make all BRD-specific assertions unknown by association. A reviewed technical copy preserves its unit history. Source logs were read only; no historical command was replayed.

## 8. Protected boundary and exact next correction

The 24-path preparation implementation list is a **maximum conditional proposal, not an active grant**: nine board-core source/test paths; seven workspaces source/test paths including two proposed ADD files; eight checklist/automation owning docs. No CSS, shared storage/account lifecycle source, shell/router/App, Clock/Header/AppRail, Desktop, config/lockfile, historical oracle/evidence or global state edits are allowed. Semantic xai_boards_v2/checklist/forward-inverse ownership remains exclusive; task-link/import/export/lifecycle changes require collision review even in other worktrees. No runtime predecessor is bypassed by this documentary review.

Root should register a fresh independent **author iteration 2/3**, exact ADD-only correction:

- `docs/reviews/audit-parallel-brd12-preparation-r2/contract.md`
- `docs/reviews/audit-parallel-brd12-preparation-r2/inputs.sha256`

The r2 contract must be a complete replacement **proposal** retaining original action/acceptance, all 312/933+6 identity obligations, B01–B12/R01–R12, full canonical G1/affected copies, source boundaries, inherited budgets and historical failures. Include a coordinate-by-coordinate R1-01/R1-02 resolution table and correct the seven-artifact wording. Produce concrete representation/progress/migration and operation/inverse state examples without inventing historical titles, lifetime policy or an approved schema. Mark any proposed additive layout as unapproved until fresh review. If an irreducible owner choice survives, isolate only the genuinely dependent cases and cite why existing rules cannot settle it; no default QL/QU forwarding.

No source/test/runner repair, runtime, qualification or vendor call belongs to this correction. Original preparation r1 and this review r1 remain immutable. Fresh independent **review 2/3** then examines the exact new proposal, from its own registered fixed parent, with proposed outputs `docs/reviews/audit-parallel-brd12-contract-review-r2/review.md` and `inputs.sha256`; those are not writable under this task. Implementation still requires an adopted exact contract, reviewed oracle sources, valid before evidence, budget admission, locks and a separate exact product card.

## 9. Commands, costs and handoff limits

Read-only operations: cat/sed/nl/rg; Git status/rev-parse/show/diff/ls-tree/cat-file; standard-library Python for binary hashing, JSON field/evidence comparison and raw-log inspection. One early exploratory glob named a nonexistent discovery directory and zsh refused it; discovery paths were subsequently read from `docs/reviews/`. No execution permission or product runtime was involved. Memory registry quick search had no relevant result and no memory evidence was used.

Writes: exactly this report and `inputs.sha256`. Exact-path staging and one structured Why/What/Scope/Risk/Docs/Tests commit with hooks disabled **for that commit only**. Final SHA/direct-parent/exact ADD scope/worktree cleanliness and both output hashes are reported after commit. No push, fetch, sync-check, child, external vendor, merge/rebase, promotion, deployment, release or D3; no other worktree touched. Root retains source preservation/receipt/adoption/global writes. Formal counts remain unchanged for the stated reason: independent review of a proposal is not caller acceptance or item closure.
