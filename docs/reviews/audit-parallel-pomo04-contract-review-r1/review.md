# POMO-04 full original-contract review r1

**REVISE — one bounded documentary finding R1.** This is full original-obligation contract review, iteration **1/3**, not implementation acceptance. The proposed Stop/save, Reset/current-only discard and ordinary departure rules are grounded in existing accepted behavior; no genuine new product-owner question is established. Before adoption, the author must distinguish UI decision disposal from an already-issued account-owned timer command. Reviewer does not choose or implement a new cancellation policy.

## 1. Fixed identity, role and scope

- Module **web**; workflow **D** under the sole A-Codex root. Fresh independent reviewer `/root/parallel_d_pomo04_contract_review_r1`, never the preparation or product author; no children.
- Dispatch requests Astra / `gpt-6-astra`. That is task-role configuration, not provider attestation or actual cross-vendor evidence.
- Sole worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-pomo04-review-20261010/XAI_Desktop`.
- Exact clean review parent: **11d1d67e67719cf331217786e60fa24ae487e12b**. Fixed task input: **5ebbdd57f1b02e5cab36751bbefe6129ee97d2ae**. Registration reference: **9e437064fee350795005554d5a80e9d80bf719dc**; the immutable task card is independently bound at the full review parent in this review's manifest.
- Reviewed source: **59dae0b524e19e6d0c273174488b84d68fb323f3**, exact source parent **876552e9024cbc816a811ea98cbb0888cf956317**; source changes are exactly two ADDs under `docs/reviews/audit-parallel-pomo04-preparation-r1/`.
- Product source: **f9eb4b1f207bc4b46f547b90afc250424b3c8695**. Original scope baseline: **e041c2bc293b70db367444c62c4300231976dbf7**. Discovery input: **28ced47ca7a324caead3f67ca31a0e048ec1d98c**.
- Source contract SHA-256 **1e1878a4bb7107ce3c9eb8660e4eedec7ac256bacd341dae9b0a2451a0f84d41**; source manifest SHA-256 **d63fee562cfdf309e1824749f6a9592ee0f76f3abb2a930930597ba001b05d93**.
- Current write grant is exactly this `review.md` and `inputs.sha256`, both new. No change to source proposal, product, test, runner, original evidence, shared contract, control, inventory, other worktree or formal status.

The original goal attachment is bound by the inherited manifest at SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`. Its parallel overlay supersedes only the authorized scheduling boundaries. P-1 is SHELL-05 pet visibility/position, not a Pomodoro decision. W1/C1/F2/R1 and unrelated prior owner decisions are not re-opened here. Child no-push/no-sync instructions apply; root owns durable remote preservation.

## 2. Complete immutable-input and original-ledger checks

One standard-library/Git-only static review pass read and independently SHA-256 checked **all 2,900** inherited input identities (2,899 Git blobs plus the goal attachment), not a sample. Hashing the dependency closure is integrity evidence; it is not a claim of semantic review or execution of every indexed package.

The complete 312 TODO records are equal to the original baseline, including their order and all original fields. The current scope map preserves those fields and restores the original module through `original_module`; exactly **39** labels differ reversibly. Full original EXECUTION records and top metadata are preserved; only TT-08 has the six accepted appended evidence entries. Original **933** plus **6** equals current **939**. Non-TT08 records are identical, current execution bytes equal fixed discovery input, and counts remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**.

All 15 P04 oracle rows and 11 exact conditional product paths are present. All **106** Appendix B log identities resolve inside the inherited input binding. Historical byte-applicability assertions were independently compared against P0, including the explicitly DIFFERENT old preference Module. The selected P0 runtime/config/test dependency inputs are unchanged in this review checkout; no equality claim is made for all package documentation after TT-08.

Canonical Clock r2 `8bf613962517ee9b80bf51373e8ad88960c570cc:docs/reviews/web-dashboard-clock-recovery-contract/contract.md` hashes to **214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae**. The proposal's entire copied §14, including E1–E25, every E24 row and all Rules, is byte-identical after stripping only surrounding section whitespace. No r1 shorthand or omitted judging copy substitutes.

## 3. R1 — resolve the lifetime boundary before adopting command requirements

**Priority: blocking contract ambiguity, bounded to lifecycle prose/oracles/conditional scope.**

Source contract §3 lines 41–52 correctly describes account-owned durable commands, frozen End issuedAt, retained host and post-await UI risk. However §4 line 68 says:

> Old queued commands, old confirmation, retries and export callbacks refuse after scope/epoch/generation/disposal

P04-09 also groups queued End/Reset/pause/retry, late result and disposed capabilities into one invariant, ending with old A bytes unchanged. It does not distinguish disposal of a Reset dialog or route hook from invalidation of the captured account scope.

That distinction changes observable saving behavior. At P0:
- `sessionController.ts:134–178` captures account scope and issuedAt, then waits for the account's Web Lock; the write boundary checks scope, owner, id and revision. It has no route-hook/dialog lifetime token.
- The controller's last-observer cleanup removes interval/listeners, without cancelling an already-issued command (`sessionController.ts:123–129`).
- `useTimerTick.ts:86–93` delegates End/reset to that controller; reset's Promise continuation can apply idle UI state after its original decision lifetime. Rejecting a stale UI continuation is distinct from undoing or suppressing a durable command.
- An End submitted before deadline can therefore remain the original early End after same-account route teardown while the host stays alive. Rejecting all such issued commands on UI disposal would change the protected accepted command lifecycle. Conversely, checking disposal only in `.then` cannot satisfy a promise that a queued destructive command is cancelled before it writes.
- The contract's §6 limits the controller path to source status or existing command identity/result exposure while freezing lock/WAL/owner/expiry/issuedAt/order. A new under-lock disposal/cancellation mechanism cannot be silently treated as mere exposure.

This is a **source-grounded contract ambiguity**, not a newly reproduced runtime defect or a claim that either unspecified policy has been accepted. I will not select that policy for the author.

### Exact bounded author correction for candidate 2

Retain every original obligation and all existing evidence; make an additive, source-bound clarification in a newly registered source candidate:

1. Define the Reset decision's capture point and lifetime: captured account scope/epoch, session id/revision, initiating focus target and one-shot decision identity. Distinguish dialog Cancel/Escape, invalidation before dispatch, successful dispatch, command resolution and UI notification. Cancelled/disposed **undispatched** capabilities must be inert; repeat activation cannot recapture a replacement session.
2. State separately what happens when the route/dialog disappears **after** a same-account command was already issued, and what happens when account scope/generation/tombstone changes before lock grant. Apply the established account-owned controller rules first. Do not infer command cancellation from UI teardown or retrofit every End/pause/Retry with dialog lifetime.
3. Specify the post-await UI fence independently: late results cannot change a disposed hook, a replacement decision/session or the new account's idle state. No successful durable write is retroactively represented as cancelled or rolled back.
4. Preserve the exact existing identity rules, including the same-id settlement-pending revision exception and the already-recorded-id no-op, plus pending/expiry settlement before discard. If the desired Reset behavior genuinely needs a new under-lock cancellation contract, identify that technical dependency explicitly and obtain the separate frozen defect/impact/corrective card required by §6; the reviewer grants no such expansion.
5. Split P04-03/09 expectations into finite named cases: cancelled/invalidated before dispatch; same-account UI disposal with a command already queued; account-invalid queued command; replacement id/revision; transition to pending/expiry; settled-old-id; post-await stale UI result; fresh succeeding action. State whose writes are forbidden and compare natural completion/reconciliation against a time-equivalent control. “Old A bytes unchanged” belongs to the old denied intent, not a blanket ban on A's subsequent authorized reconciliation.
6. Reconcile the affected §4, §6 and P04-03/09 wording with that distinction. Preserve the 11-path ceiling and frozen controller semantics; do not add product/tests/runners or weaken accepted End, Retry, route, pending or byte-conservation behavior.

This is one source-author revision candidate **2/3**, followed by a fresh independent review **2/3**. The task does not require asking whether Stop saves, whether clean route departure pauses, or whether Reset should save an early record. If the author locates genuinely contradictory explicit product authority, it must provide both immutable citations to root; this review has not established such a contradiction or issued an owner question.

## 4. Established behavior and all fifteen business obligations

All rows below are documentary review outcomes and retained requirements, **not fresh runtime PASS**. R1 is the only requested contract correction; no other examined row supplies an implementation/runtime waiver.

| Original oracle | Independent review conclusion |
| --- | --- |
| P04-01 | Full EN/ZH Stop/save, Reset/current discard, Pause/Continue, exit-view and preference-discard meanings are retained across normal/fullscreen/keyboard. State wording must distinguish pending, unavailable and saved-but-cleanup-failed. Idle Reset cannot fabricate history. |
| P04-02 | Accepted 4868d0a durable behavior plus POMO03 amendment and ab94f84 independent report justify measured early incomplete records. 25s + paused5min +35s produces 60,000ms, incomplete list1:00 and elapsed Statistics1m, without completed-round increment; zero and paused End controls remain. Old completed-only design prose is superseded explicitly. |
| P04-03 | Current unfinished discard with prior-history retention, explicit consequence, Cancel/Escape zero command side effects/focus return and no implicit pause are appropriate. R1 must bind capture/dispatch/disposal precisely and retain the existing pending/revision/expiry exceptions, not invent another settlement ordering. |
| P04-04 | Source distinguishes End issuedAt from discard lock-grant time. All three modes retain original deadline, stable id/first recordedAt, completed status, committed-only mode transition and no auto-start; early End does not advance the completed cycle. |
| P04-05 | C1 unsaved frozen memory intention, C2 durable settlement-pending and C3 durable history with failed active cleanup are materially different. The proposal preserves truthful labels, exact retry and conflicting-id refusal. Malformed/denied/foreign source must never become an asserted empty history. |
| P04-06 | Account-private durable running deadline and paused accumulated time survive accepted route/process recovery. Actual independent whole-process running/paused variants and two reopen cycles remain required/applicability-bound. No closed-browser JS/audio or C1 unsaved-intent crash guarantee is invented. |
| P04-07 | All six real preferences, latest-operation/uncertainty/conflict handling, same-value successor and completion-next-preset behavior remain. Device recovery cannot settle/reset/export account timer/history. |
| P04-08 | Full production host first-intent, POP/back/forward/programmatic, rail→Appearance preflight, sign-out ordering, stay/export/discard and release-once requirements remain. The optional preference departure participant is not a new timer coordinator. |
| P04-09 | Account/generation/tombstone isolation and old permission refusal remain mandatory; R1 distinguishes those from UI disposal after a valid timer command has already been issued. First-frame isolation, retained device drafts and fresh operation liveness remain. |
| P04-10 | True separate tabs/native lock contention, double End/expiry, competing Start, stale revision/frozen retry, one durable id and first recordedAt remain. Two targets do not replace actual process-close proof. |
| P04-11 | Both actual disk formats/filenames and ownership boundaries remain. Raw timer export is not six-value device memory export. Timer Blob/URL/append/click failure needs its own error, best-effort cleanup and live pre-click scope check; full read denial cannot export fictitious empty raw bytes. Browser/OS acknowledgement limits after click remain explicit. |
| P04-12 | Reader projection proof preserves POMO03 elapsed values and existing consumer limitations. CmdK's configured-duration/optional-completedAt adapter is not elapsed-time proof; DASH06 owns scale. Invalid/unavailable history requires a finite technical availability dependency if existing local guards cannot supply truth; no shared writer/scope grant is inferred. |
| P04-13 | Actual App/full CSS, five widths, EN/ZH, pet-hidden-after-resize and pet-on controls, both Topbar statuses, overlays, containment/hit testing, 44px controls, 200% zoom and visual inspection remain required. Prior preference screenshots cannot prove new Reset/dialog surfaces. |
| P04-14 | Trusted keyboard/focus return and qualified identity-bound pixelFocusWalk remain mandatory. Geometry or outline CSS cannot replace usable method qualification; native input keeps pipe/no nativeVirtualKeyCode/passive key audit. |
| P04-15 | Source/fixture/oracle/dependency/cost binding, full original/affected/G1 evidence, actual cross-vendor and fresh non-author full acceptance remain. Limited preference acceptance, this review and a green unit suite cannot close full POMO04. |

Accepted `4868d0a` controller/protocol/hook/session-host bytes equal P0; `2962b49` Module/preference hook/styles equal P0; POMO03 list/counters at `ab94f84` equal P0. That supports existing-rule reuse at those exact paths only; whole host/storage/CSS/dependency/oracle applicability still needs its own qualification.

## 5. Exact finite scope and protected technical dependencies

All eleven conditional paths were reviewed: Module, hook, controller, scoped stylesheet, three exact existing tests and the four package documents. They are neither eleven mandatory changes nor present write permission. Only later root cards may activate a necessary subset after adopted contract, source machinery and valid before gates.

Module-local confirmation/copy/export feedback, hook decision/result plumbing, and narrow controller status exposure can be evaluated without altering active/history keys, schemas, sessionProtocol, accountMigration, six preference codecs/domains, shared storage, events, auth/device stores, AccountDataGate, App, registration/departure coordinator, shell/AppRail/Topbar, tokens, consumer writers, dependencies or lockfile. New public capabilities/helpers/evidence paths need separate registration. R1 prevents a controller cancellation policy from entering through this limited exposure row.

Unknown source is not empty: the actual Module filters usePref's returned history while the controller validates raw history at settlement. A default [] display cannot prove readability. The proposal correctly freezes a missing availability path as a technical dependency and withholds any shared engine grant. Full POMO04 remains open if truthfulness cannot be delivered inside the eventual reviewed scope; it cannot be renamed REL-only. Recovery export under raw-read denial preserves in-memory material and reports unavailable without silently changing the export schema.

## 6. Full retained execution census and permanent costs

All 106 retained logs were read as bytes and hash-verified. Directory census:

| Retained family | Artifacts |
| --- | ---: |
| Departure Astra draft/export/dv2/completion | 36 |
| Departure author summaries | 2 |
| Departure independent host/advanced/package | 18 |
| Departure native modes/refusals | 27 |
| Durable session before/after/native/package/storage/web | 11 |
| Durable independent main/close variants | 6 |
| Preference native/disk | 3 |
| POMO03/Statistics | 3 |

These are artifact counts, not 106 independent processes or a completeness assertion. The proposal retains actual mode families, before failures, expanded rejections, corrected copies, summaries versus raw logs and the empty unload build-refusal plus its diagnostic. Formal/probe status, missing PID/exit and complete lifetime counts remain **unknown** where not established. The old main/close variants and preference/disk minima do not establish unused capacity. Multiple departure modes visibly have more than three historical artifacts; grouping by parent/child process and permanent purpose remains mandatory before any new launch. Neither this source task nor an empty POMO04 evidence array resets the per-unit cap3.

The proposed pre-action Reset consequence/Cancel/identity-confirm/disclosure assertions are a plausible genuinely new finite semantic purpose after comparison with the existing source/tests and accepted preference scope. That does not make a mixed package/native/host suite new or grant it 0/3. Timer export wording/click-boundary work also does not reset existing raw-export/process machinery. Exact accepted source-bound evidence should be reused without redundant execution. Root must bind every invoked old unit's immutable runner/fixtures/oracles, purpose, command/mode, all actual formal/probe/refusal/calibration history, completeness and remaining capacity before admission.

This review consumes **review1/3; static1** only. Runtime, tests, build, lint, browser, native, qualification, probes, vendor and child-agent invocations are all **0**. Git/standard-library integrity checks, document reads, exact staging and hook-disabled commit are not product runs. No unreported run or measurement occurred.

## 7. Complete canonical and downstream gates remain open

Full canonical Clock r2 E1–E25 and E24 are preserved, including More C-FB002 judging, Appearance OE judging with frozen006/007 failures, Features C-RD1 judging with original/C-FD1 recorded, AppRail eight modes and host, Header control/fixed/native18/Astra/Sol, sixteen F1 invocations including Appearance K-1 and rail plus Clock c1–c5, package/static/host suites and final per-ID hash receipts. Capacity refusal/copy rules retain originals and exact diffs; no absent item becomes N/A. Applicability-based no-rerun clauses retain their host/CSS bounds.

The method dependency is not qualified: retention **3/3 exhausted**, R1–R6 unqualified; original Q1 focus1/3 and others0/3, development2/83; B70 native12/6432, development40/4884, visual3/3 exhausted, focus EN2/ZH2; F1 formal2/180, development3/302 remain historical accounts. No fourth retention attempt, renamed family or borrowed Q1 budget is authorized. P04's pixel-dependent rows require a separately lawful independently qualified/adopted usable method. M+G+B's original conditional sequence and source/copies/before/geometry/versioned baseline/E1–E5 remain intact.

Following R1 correction and fresh review, still required: root adoption; exact source-only machinery review; permanent budget admission and full qualification with causal/negative controls; valid frozen unresolved before; fresh bounded author implementation; independent unchanged-oracle fixed/affected/native/disk/visual/consumer evidence; actual full vendor evidence; fresh complete non-author Astra acceptance; root reconciliation of evidence only; inventory and remote preservation. Process exit, stream drainage, independent finalizers and post-close receipts remain required; Promise.race is not cancellation. A source review cannot discharge these gates.

## 8. Disposition and next single source step

Return **REVISE R1** to a separately registered author candidate **2/3**, limited to the lifecycle clarification above, then fresh reviewer **2/3**. No product repair, source-proposal edit, runtime, qualification, probe, actual vendor execution, adoption or formal closure occurred here. Original POMO04 action and acceptance remain unchanged; all 15 rows, 11 conditional paths, 106 artifacts, full canonical dependencies and original312/939 evidence remain binding.

Both review outputs were fully constructed and all inputs validated before the first write. Exact-path staging and command-local disabled hooks preserve the two-ADD scope. Output hashes, full commit/parent and clean checkout receipt are supplied externally to avoid circular self-hashes. Root alone receives/preserves/reconciles; child push, fetch, sync-check, integration, release and D3 remain unperformed.
