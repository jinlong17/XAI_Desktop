# TT-08 contract review r1

## Verdict and authority

**APPROVED — proposed documentation contract only.** No blocking finding in D1–D7. This approval permits root to register a fresh `TT-08/before` actor; it does not make implementation ready, accept TT-08, publish READY_TO_SHIP, close GOV-04/GOV-05, attest runtime correctness at P0, or authorize shipment. Reviewer made no repair, including to the proposed contract.

- Module: **web** (audit coordination is project-system, not the Admin product). Workflow D under the sole root A-Codex controller.
- Reviewer: `/root/parallel_d_tt08_contract_review`, fresh and independent of the TT08 contract author and every prior TT08 stage actor. Requested configuration: `gpt-6-astra`; configuration is not independent provider attestation or cross-vendor evidence. No child agents.
- Owned worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-tt08-review-20261010/XAI_Desktop`.
- Fixed review parent/registration: `fb95dd39117ca98a9b5a038a29b40d015936fe85`; initial status clean.
- Exact task: `parallel-control-r1/tasks-P2.json`, task `TT-08/contract-review`. Only this report and `inputs.sha256` may be added.
- Proposed source: `c6ab3c967074595ab59b7e0bf7dc86d66b229e97`; integration: `832013f001a21aba6bbde319ba752f190b0976d8`.
- Preparation input parent: `7bb8df1631b94295bb7c3f928fcd9924b1337873`; product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Contract hash: `163d0c0c225050e18a087a7e77e60328d53021fc2da1880f53ad997a983a058a`.
- Preparation index hash: `87248155fecb450b0a8815537abb21b0cc289e16cfb4f6731fae67476f1cc7a0`.

AGENTS.md, CLAUDE.md, module map, shared workflow, multi-machine rules, immutable original goal, authority overlay, goal-D, scheduler and exact task card were read. Task-specific no-push/no-package/no-runtime bounds apply; root owns preservation, integration, remote ancestry and sync-check. No moving control branch or another session's worktree was used.

## Frozen identity and original obligation

Both proposed output hashes match the source commit, integration commit, review parent and worktree bytes. All **131** preparation-index inputs match the frozen preparation parent (absolute attachment checked directly). All **34** indexed package/host files also match P0. Only the control-plane document among those 131 paths differs between preparation parent and review parent; its historical input was read explicitly with `git show 7bb8df1…:path`. That expected later control update is not substituted for the contract's input and is not a hash conflict.

This review's **137-input** index retains every one of those 131 identities and adds the proposed contract/index, current frozen task card/execution state, and P0 ownership-map/export-test files. `git:<full-SHA>:<repository-path>` rows identify immutable blob bytes; the sole absolute path identifies the original goal attachment. Hash identity does not assert substantive visual review of indexed screenshots or reexecution of indexed scripts. Outputs are excluded from their own input index.

Original TT-08 wording is retained exactly from scope-map and ALL-TODO-CURRENT:

> action: 核对single/multi mode实际语义并同步PRD、日志和页面
>
> acceptance: 文档不再声明未消费的模式；独立verify后更新READY_TO_SHIP状态

The original audit's unused-mode finding remains historical evidence. Its accepted TT02 successor and P0 actual consumers now require accurate current documentation. Removing modes, omitting the page obligation, treating the canonical PRD as optional, or setting a package-wide readiness label from static checks would not satisfy this contract.

Formal inventory independently counted from EXECUTION.json: **13 completed / 3 verification_pending / 3 in_progress / 293 pending = 312; 299 unclosed**. TT01, TT02, TT03 and REL01 retain completed states; TT08, GOV04 and GOV05 retain pending states. No ledger/control/inventory bytes were edited.

## Independent D1–D7 assessment

| Row | Result and source-grounded assessment | Effect on future acceptance |
|---|---|---|
| D1 consumer truth | PASS. P0 `TimeTrackerModule.tsx:520,606–622,789–791` consumes mode in the EN/ZH selector and Start path. `internal/storage.ts:124–141,272–297,330–334` implements default/read/write/hook and locked enforcement. `sessionController.test.ts:9` and `TimeTrackerModule.test.tsx:397–419` encode distinct multi-session behavior; these tests were read, not run. Widget `TimeTrackerWidget.tsx:11–36` reads snapshot totals/counts and navigates, with no mode selector or timer command. Public `index.ts` exports mode type/key but not internal mode hooks/controller. | Each current doc claim must identify these actual consumers. No present-tense unused-mode assertion, fictional widget controls or new public command surface. Storage ownership/export references to the key are bookkeeping, not extra mode-dependent timer behavior. |
| D2 original decisions | PASS. Accepted TT02 report and existing design/API establish default single, explicit End and start, native Web Lock/source conflict refusal, distinct multi sessions, terminal replay safety and per-session intervals. P0 Start rechecks captured running-source JSON, closes running rows and appends at one timestamp. Resume calls the controller directly; it does not promise Start's confirmation dialog. `time.ts:128–138` separates unfinished/paused from running. | Preserve accepted rules without owner re-decision. Explain running versus paused and Start versus Resume. Mode-write failure/recovery is not covered by the entry controller's guarantee. Conversion details below remain observations. |
| D3 PRD/page trace | PASS. Fixed tracked-tree inventory has no `docs/product/time-tracker/prd.md`; the broader Web PRD supplies no mode contract. Exact new PRD is justified as the missing TT08 slice, with accepted capabilities, requirement→source→evidence trace and remaining unconfirmed scope. Page's EN/ZH selector, switch confirmation and error surface already exist at P0. | “同步页面” remains assessed by exact source correspondence and unchanged source hash, with zero page edit needed for this documentary correction. No screenshot, native interaction, accessibility or new visual claim. Any genuinely required page/product change stops this scope and needs a separately reviewed product path. GOV05's complete PRD obligation stays open. |
| D4 chronology/status | PASS. Old dev_log top status and commands date to 2026-06-01. Contract §§4,6–8 requires a current pending documentation iteration, full workflow fields, independent exact-candidate verify receipt, then separately registered status publication. | Historical status must remain explicitly historical. A current **TT08 documentation-only** READY_TO_SHIP entry can be published only after actual independent PASS and applicable gates; it cannot become blanket package/business/deployment readiness. Fresh Astra reviews the complete chain including status delta. No current status publication is authorized here. |
| D5 TT01/02/03/REL01 | PASS. Read original independent reports, diagnosis, source/tests and lineage diff. TT02→P0 changes only the module's local-day refresh/selected-day behavior plus dayRollover tests in this package; mode/controller source remains unchanged. Reports' actual SHA, native/unit distinction, failures and limits are preserved (details below). | Static docs evidence can reuse accurately labelled accepted history without rerunning it. It cannot relabel historical results as a fresh P0 runtime verdict or claim the entire historical TT02 package is byte-identical to P0. |
| D6 adjacent callers | PASS. Contract prohibits widget command invention, category transactions, performance/recovery/cloud promises, shared helper changes and expansion into remaining callers. P0 ownership map marks mode as device and entries/categories as account; this corroborates the bounded key statement, not overall account-isolation acceptance. | DASH07/TT04–07/REL04/GOV04–05 and actual external gates remain separate. No source/CSS/config/test/Clock write is needed for this contract. A source discrepancy triggers stop and separate impact/before/implementation/verify work. |
| D7 integration/global | PASS for TT08 contract. Exact five candidate docs and TT08/GOV04/GOV05 semantic locks are explicit. Fresh before, author, verifier, status publisher, full Astra acceptance, root reconciliation and inventory remain separate; root registers actual stage paths/SHAs before dispatch. Protected hashes, original failures, C-FB002/OE/C-RD1/predicted C-FD1 and contract Required evidence remain mandatory in their applicable runtime/final-regression tasks. | This is not global DAG approval or resolution of its independently tracked recurring controller-lock correction. Root must retain serialized receipt/integration/control/ledger ownership and apply its independently reviewed scheduler repair. Nothing here bypasses receipt, affected integrated-source regression, inventory, vendor or release gates. |

No blocking causal finding or contract correction is required. Approval rests on requirement/source/evidence correspondence and preserved gate sequencing, not merely on hashes or green static commands.

## Mode conversion and page boundary

P0 `writeTimeTrackerMode` only writes `xai_tt_mode` and dispatches the event. It does not stop, choose or migrate running sessions. The locked entry check rejects a newly running ID when the resulting running set exceeds one; unchanged pre-existing running IDs do not trigger that branch. Therefore selecting Single after Multi may leave several existing running sessions. A later single-mode Start confirmation closes the then-running set; Resume of another paused session is rejected if it would create conflicting running work.

This is an **implementation observation/limitation**, not an accepted product migration policy and not proof that every persisted single state has at most one running row. Contract §3 explicitly labels it that way. The bounded PRD can honestly describe the observation alongside accepted Start policy without inventing immediate reconciliation. A future proposal to choose/stop sessions on mode selection requires a separate owner decision and product change path; it is not silently included in TT08. No mandatory unresolved owner question blocks the proposed documentation description.

The existing page must be cited accurately in both languages. No UI/source change is necessary to make mode consumption real. The original page obligation is thus retained rather than discarded; later discovery that alignment actually requires product behavior or UI-copy changes invalidates the five-doc scope and stops implementation.

## Historical evidence preserved with its limits

- **TT01:** independent report at `8d951e93ea2935f2b7a06dcc9b25851ea1b6b783` remains byte-identical. It reviews `c5b08a723a47cf8cec59a585a714195efa98b1ba`, retains original 11 assertions, native 20 Insights, five downloaded CSVs, two zones/four DST boundaries, source identity and completed-row-count UX residual. It does not prove multi-segment editing, transactions, quota, performance or release.
- **TT02:** independent report at `082766b1a6413a6a746641c93541954c717dfcfc` remains byte-identical. Source is `64caa5a678ce9943a0e7aa03609095153c5131e2`, including `ba2065859782ab787989e147f22ca84358c6f5b1`. Reported 5 invariant / 11 window / 78 package / 11 native assertions overlap and must not be summed. Native evidence covers single starts/locks/source export/replay; multi behavior also has unit evidence. No native multi→single transition acceptance is asserted. Multi-segment time controls disabled, note/category editing supported, malformed bytes exportable but no in-app import/repair, 1440px limitation and no cross-vendor claim remain.
- **TT03:** independent report uses fixed `cd3146b8c241a6ac5434a10e555ae813b2cc2961`, exact 29,875ms/40,875ms hour remainders, explicit range/timezone/source metadata, 20 Insights, five CSVs, DST and 82 package tests. Replay plus later added assertions is disclosed; empty terminal stdout was not its PASS oracle. No TT04/TT07 or universal timezone/release inference.
- **REL01:** retain the initial genuine idle TimeTracker midnight failure and its later `91497787b9ca7deabf88a3683d5a344699c39bf6` correction. Independent report distinguishes six actual consumer midnight checks from four-zone calculation-plus-Calendar evidence, and original Metrics native evidence from two targeted current component assertions. This lineage explains the only TT package delta after accepted TT02; no shared clock changes are requested here.

Those are readings of frozen historical evidence, not executions in this review. No historical report, raw log, test, runner, screenshot, source or acceptance record is replaced.

## Exact future scope and protected locks

After this approval and a separately registered fresh before pass, root may consider one fresh doc author for exactly:

1. ADD `docs/product/time-tracker/prd.md` — bounded accepted mode/session requirements and evidence-linked capability slice; not fictional future product behavior or whole GOV05 closure.
2. MODIFY `packages/plugin-web-time-tracker/docs/design.md` — specified mode/paused/Start/Resume/conversion and accounting traceability paragraphs.
3. MODIFY `packages/plugin-web-time-tracker/docs/api.md` — mode key ownership, internal/public/controller boundaries and accepted accounting traceability.
4. MODIFY `packages/plugin-web-time-tracker/docs/test.md` — exact existing test/historical evidence map and stale TT01 future-work correction, without invented new test runs.
5. MODIFY `packages/plugin-web-time-tracker/docs/dev_log.md` — dated pending docs iteration and historical evidence/status context; independent verification before separately authorized current status publication.

Root must lock TT08 modes/documentation, GOV05 Time Tracker canonical PRD and GOV04 Time Tracker status, check active overlapping writers and preserve fixed read identities. No blanket path grant. All package source/tests/configs/CSS, widget/host sources, persistence/account/date/token helpers, shared Clock source/contracts/methods, original evidence, control plane/three ledgers, inventory/PLUGIN_MAP, release logs, other dossiers/worktrees and long-lived branches remain protected. No D3, syncScope, product schema or module change.

## Stage and vendor gates

Required order: root receipt of this review → fresh independent static before → fresh doc author with exact five-file card → fresh uninvolved Sol independent verification against exact candidate → separately authorized current documentation-status publication, if warranted → fresh Astra full-scope acceptance of the complete chain and status delta → root evidence-only reconciliation → inventory and remote/sync receipts. No same-caller prior actor fills a later stage; reviewer never repairs.

`Verify Cross-vendor: yes` is not waived by this Codex review. Project workflow permits same-tool low-risk doc planning review, which does not make any actual cross-tool verification happen. Required cross-vendor verification must be reported distinctly and remain pending absent real evidence or an explicit applicable opt-out; root cannot translate fresh Codex/Astra/Sol labels into vendor PASS. Historical TT reports explicitly claim no cross-vendor PASS. REL02 and REL03 still have `workflow_status: cross_tool_verification_pending` despite functional passes. This approval does not close those gates or offline/online/real-device/RLS/dual-device/credential/signing/payment/release gaps elsewhere in the 312-item scope.

## Cost, checks and next card

This task consumed **one static contract-review iteration, 1/3**. Zero package/test/typecheck/lint/build invocations, browser/native runs, runtime formal attempts, development probes, historical reruns and child agents. Python/Git/hash checks were static integrity operations only. TT08 preparation's one prior static discovery pass remains separate. All previous budgets survive across actors, filenames and worktrees; unknown historic totals are not assigned zero. TT02's initial runner resolution failure and TT03's replay/additional-assertion history remain. Clock B70 visual 3/3 exhausted, focus EN/ZH 2 each/no third; Q1 focus 1/3 and other six 0/3; earlier development calibration 2/83 remain unchanged.

Static checks performed: clean initial worktree and exact parent; all proposed output SHA identities; all 131 original input hashes; 34 P0 package/host identities; 137 review-index blobs; mode-symbol search across apps/packages; targeted source/test/doc/report reads; TT02→P0 exact package diff; canonical PRD tracked-tree absence; original action/acceptance and 312 counts; exact two ADD paths; whitespace and staged-scope checks before the final commit. No unsupported live product or current release claim.

**Narrow next card: `TT-08/before` (root must register before dispatch).** Fresh uninvolved actor; fixed this review's final full commit and proposed contract `c6ab3c9…`, preparation input `7bb8df1…`, product P0 `f9eb4b1…`; allowed ADD receipt/index paths must be explicit in the committed card. One bounded static before pass, zero runtime. Freeze all five documentary before states (including absent PRD), D1–D7 source/evidence/page correspondence, exact semantic locks, historical status and pending vendor/external gates. No docs implementation or READY_TO_SHIP publication during before. Stop for hash/authority/ownership conflict, unsupported product semantics, necessary source/UI/shared-Clock changes, inconsistent historical claim or exhausted inherited budget. No correction task is requested by this review.

Commit scope is only this review and its input index, with per-command hooks disabled to avoid unrequested child dispatch. No amend, push, merge, rebase, deployment, release, promotion or D3. Root must preserve the source commit and independently check its parent/patch/hash/clean receipt before integration; this local checkpoint is not cross-machine completion.
