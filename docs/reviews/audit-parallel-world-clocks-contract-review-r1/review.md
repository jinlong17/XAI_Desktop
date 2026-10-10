# DASH-03 / contract-review — independent full WorldClocks review

2026-10-10 · Module **web** · Workflow **D** · **Verdict: REVISE**.

The proposal retains the whole caller and W-1, but R1–R3 below block contract approval and before-oracle freeze. No implementation, runner, product, CSS, original evidence or contract repair was performed. Foundation readiness remains independently **BLOCKED** by the actual Clock source verdict and exhausted retention budget; fixing this document cannot make WorldClocks implementation ready.

## 1. Authority, scope and provenance

Fresh actor `/root/parallel_d_world_clocks_contract_review_r1`, independent of the proposal author and all prior same-caller authors; no children. Requested role/model is fresh Astra / `gpt-6-astra`; that is dispatch metadata, not independently attested provider model or actual cross-vendor evidence. Sole writable detached worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-world-clocks-review-20261010/XAI_Desktop`. Initial HEAD and required parent **5bcc15d937ee8bd9880ccf6ad5dba205178f793c**, initial status clean. No other worktree inspected or changed.

Read the original goal attachment first, SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`, followed by AGENTS/CLAUDE/shared workflow/multi-machine policy, parallel authority overlay, r2 scheduler and exact parent `parallel-control-r1/tasks-P5.json` card `DASH-03/contract-review`. Root's execution-state records r2 adoption; its original UNACCEPTED heading alone neither adopts nor revokes that record. The card authorizes exactly this report and `inputs.sha256`, one bounded static review **1/3**, runtime zero. Root alone owns global receipt/control/ledgers/budget/adoption/remote preservation/push/sync.

| Input | Frozen identity |
| --- | --- |
| Proposal | `fd52c3746ba322e3cb0048748263b8cc29f2c932` |
| Proposal contract | `docs/reviews/audit-parallel-world-clocks-preparation-r1/contract.md`, SHA-256 `6ee301250c0128f95f0fe296f0d910cc998a26e26d5094d3b91a11ec0466fb6b` |
| Proposal index | SHA-256 `6e53130586222e37fa6275a662139a00fb421463b7b4e2bab324796dfedde1f0` |
| Actual Clock REVISE | `cbf18b491ef10941d396bc9655d10c8beed4a68b`, review SHA-256 `f7ccab282bdee0b876e497e49720ad63db7305f468e1050fa65c46a6ea68724b` |
| Actual hard-budget impact | `44d04c8edc9cfc793317059a503152f8b27f6171`, impact SHA-256 `3d65973b160b20b8b2aad104e1cd1b080cbc838882ecdc1e72e9bdf26c3ccb3f` |
| Product P0 | `f9eb4b1f207bc4b46f547b90afc250424b3c8695` |

Verified all **79 proposal input identities with zero mismatches**, then all six exact proposal/Clock-review/Clock-impact output blobs against their fixed commits and this checkout. This review index contains **100 unique identities**: inherited79 + current authority/card/state13 + exact proposal/review/impact outputs6 + two additional P0 recovery-surface sources. Hash verification proves bytes, not runtime truth. Clock's transitive qualification artifacts were not re-executed or independently requalified here.

P0→review parent has exactly four `apps`/`packages`/manifest/lock-path differences, all Time Tracker documentation: `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md`. The proposal's empty-product-diff statement is scoped to its own earlier c7df572 parent and remains historical. All indexed WorldClocks/shared runtime inputs equal P0; no current-head substitution or integrated TT acceptance is claimed. Root must pin any future combined product separately.

Original DASH-03 action remains **World Clocks允许清空或解释最后城市不可删**; complete acceptance **添加/删除/重开状态一致，日期差标签清楚**. Current fixed control plane line206 confirms W-1 **允许清空，并显示空状态与添加入口**. No new W-1 question is needed. Scope-map retains DASH-03 pending with empty prior evidence. Formal totals remain **13 completed /3 verification_pending /3 in_progress /293 pending =312;299 unclosed**.

## 2. Blocking findings

Coordinates `contract:` refer to the exact proposal above; source paths below refer to P0, not a mutable controller HEAD.

### R1 — P2: legacy-domain disposition overclaims a recovery path

**Contract:** lines48–49, 144, 162, 168, 221. **Sources:** `packages/xai-web-dashboard-widgets/src/widgets/WorldClocks.tsx:49–64`; its `src/__tests__/WorldClocks.test.tsx:99–105`; widgets `docs/api.md:183`; `packages/plugin-web-storage/src/internal/accountMigrationValidation.ts:15,22,32`; `packages/plugin-web-settings-rest/src/panes/accountPane.tsx:118–125`; `packages/plugin-web-storage/src/AccountDataGate.tsx:88–125`; `packages/plugin-web-storage/src/internal/accountDataLifecycle.ts:18–32`.

The proposal makes every mixed unknown-id array and duplicate array source-invalid, substitutes four defaults, refuses edits, and justifies this by saying the retained bytes are recoverable through the existing account-data surface. The documented and tested P0 mixed seed `["shanghai","atlantis","london"]` instead shows the two known cities; migration expressly admits any string array, including duplicates and mixed unknown ids. Thus this is a compatibility transition for an admitted stored shape, not merely rejecting invalid JSON. W-1 changes last deletion/empty handling; it does not itself decide that existing usable selections should become fallback-only and uneditable.

The actual account surface can export the raw current-generation string, which preserves bytes, but explicitly says **direct import and restore are not currently supported** (`accountPane.tsx:120`). The management gate offers generation import/rollback, not a city-field repair. Export preservation is therefore established; a field recovery path that resolves the new refusal is not. A cross-caller fixture scan alone can prove test compatibility, not absence of existing user records or legitimacy of changing this behavior. This review does not prescribe silent filtering on write, deduplication, a schema change, or a new reset button.

**Required next-author correction:** give a source-grounded compatibility table separating absent, valid empty, valid known ordered arrays, supported legacy projections, malformed values and unsupported variants. State exact display, allowed operation, preservation and available recovery behavior for each. Preserve known legacy selection visibility where justified without silently overwriting unknown bytes; if a stricter product decision remains necessary, root must isolate that actual decision instead of treating it as already covered by W-1. Withdraw the unsupported restore claim and disclose the real export-only limitation. Include explicit semantic-JSON cases: surrounding JSON whitespace/escaped equivalent ids remain valid; raw formatting survives read/view/reopen; an external byte replacement, even semantically equal, does not bypass exact expectedRaw or uncertain-token checks. Spell out duplicate/oversized/all-unknown/mixed-id treatment and bind the pre-before seed scan. Registry, migration and account UI remain protected. No compatibility policy or owner answer is invented by this reviewer.

### R2 — P2: picker blur restoration conflicts with nonmodal focus exit

**Contract:** lines121–123 (also WC04/WC12). **Source:** `WorldClocks.tsx:87–96,198–223`, showing a nonmodal picker and separate trigger; no modal focus owner exists here.

Line121 requires Tab into and out of the nonmodal picker, but also says that whenever focus leaves it the picker closes **with focus return to Add**. Literal forward Tab from the last picker row to the next Dashboard target, backward Tab to a preceding target, or a pointer focus move outside is redirected to Add. That contradicts the specified native cycle's intended outside stop and can steal focus from another control or the coordinator dialog. Line123 likewise unconditionally returns focus on recovery disappearance; an async Retry may complete after focus has moved elsewhere.

**Required next-author correction:** define entry and exit by cause. Escape and successful selection may return to the invoking Add control; natural Tab/Shift+Tab or pointer departure must close without overriding the already chosen outside target. Specify header versus empty CTA entry and all-added/no-focusable-row behavior. Recovery disappearance may restore focus only when the disappearing recovery subtree still owns it; preserve a newer external/dialog focus and fence restoration on account change/unmount. Freeze these concrete positive/negative transitions, full forward/reverse native census and pixel checks across all three views and empty/source/recovery states. This is a bounded local focus-contract correction, not authority to alter the protected coordinator or native oracle.

### R3 — P2: archive buffering alternative contradicts the original streaming requirement

**Contract:** line160. **Authority:** original goal attachment lines50–53, especially51; parallel authority overlay lines3–5.

The goal explicitly requires immutable `git archive` to be read as a stream. The proposal's parenthetical “or measure and allocate at least twice its exact size” grants a buffered alternative without a reviewed exception. The parallel overlay changes scheduling and bounded reception, not archive transport. Sizing an in-memory buffer does not fulfill the retained streaming requirement. This is a concrete future-runner permission mismatch, not a newly observed runtime failure.

**Required next-author correction:** retain mandatory streaming and its byte count, archive source/root/lock guards, refusal-safe partial evidence and original exit preservation. Do not grant a generic capacity exception. Existing historical runners needing a separately named reviewed copy remain governed by their exact authorized receipt; those exceptions cannot become a blanket choice for new WorldClocks runners.

## 3. Complete WC01–WC20 and original acceptance reconciliation

The table assesses specification coverage, not execution or PASS evidence. Every original action and required future row remains mandatory after correction.

| ID | Independent review disposition |
| --- | --- |
| WC01 | Complete caller/input/exact-delta scope present. This review1/3 returns REVISE for R1–R3; no self-approval. |
| WC02 | Real engine bytes, invalid/unavailable source, queues, two deletes to empty, failed empty, predecessor/latest-operation identity, uncertainty and account/export included. R1 needs explicit legitimate legacy and semantic-JSON/raw cases. |
| WC03 | Actual production host, locks/markers, navigation/confirm/overlay before matrix included; it cannot be replaced by a standalone component. |
| WC04 | Native full controls, persistent whole-browser reopen, dates, geometry and keyboard included. R2 affects the frozen focus oracle; R3 affects all new archive runners. |
| WC05 | Before F1 POP/Retry/Discard/pending/combined/sign-out present; missing P0 guard must remain a real before failure, never injected markup. Clock combinations on P0 cannot be misreported as an already accepted Clock base. |
| WC06 | Explicit accepted multi-participant host, geometry, method and versioned baseline reconciliation gate. Currently BLOCKED; separate shared-plumbing preparation would need its own reviewed exact scope. |
| WC07 | Fresh exact-path implementation and author logs only after accepted WC01–06. No implementation is authorized by this report. |
| WC08 | Complete WC02 candidate comparison/account identity races required, including corrected R1 dispositions and unchanged byte guards. |
| WC09 | Full host matrix: WorldClocks alone; Header-only and Clock-only while it is registered idle; each pair; all three; proper labels and remaining participant holds. |
| WC10 | Add/delete/last-delete/re-add/Retry/source/conflict/locks, independent documents and real browser-process reopen with exact `[]` required. |
| WC11 | Memory draft export and actual disk envelopes for add/delete/empty/pending/drag/multiple participants; setup failures and scope/unmount liveness retained. |
| WC12 | All views × languages/themes/widths/states, pet/obstruction/containment, complete trusted keyboard and own-pixel focus/manual frames retained; R2 must precede freeze. |
| WC13 | Twelve named frozen F1 invocations, Appearance K-1 and rail pairs, new caller cases, Clock pair only on its accepted base retained. |
| WC14 | Header full affected controls and actual registered-idle proof, Clock full affected contract, all eleven widget surfaces retained. Existing Header suites alone cannot substitute. |
| WC15 | Protected diff/source/writer/key scan, domain fixture scan, selectors/events/unrelated keys/lifecycle and actual CmdK committed-reader behavior retained. CmdK city search is correctly not claimed. |
| WC16 | Both Dashboard packages tests/type/lint at before/fixed plus Web/coordinator/router/App/Appearance/rail, CmdK and storage-account suites retained. Exact future commands/output paths still require card registration. |
| WC17 | Accepted callers and original/corrected C-FB002, OE, C-RD1 plus C-FD1 observation retained; no smoke replacement or source-equality-only geometry waiver. |
| WC18 | Exhaustive artifact/hash/verdict/before-to-fixed reconciliation and remaining limitations required. Missing evidence cannot be hidden behind a green row. |
| WC19 | Fresh uninvolved full-caller Astra acceptance, no repairs, and actual vendor gate retained. A fresh Codex actor is not cross-vendor proof. |
| WC20 | Sole-root source preservation/integration/remote ancestry/sync and evidence-only ledger reconciliation/inventory retained; worker has no global authority. |

Original acceptance mapping: **add** → WC02/04/08/10 (all12, duplicate-add inert, add-from-empty/order); **delete including last** → those rows plus failure/retry/discard/uncertainty and exact set `[]`, never remove/reset; **reopen consistency** → same-mount/route/reload/whole-process WC04/10 and current account/generation; **clear date-difference labels** → WC02/04/08/10/12, independent civil-date oracle, same instant versus browser-local calendar, all views, midnight/month/year/leap-day/fractional-host/DST boundaries. Fixed city offsets/no city DST stay disclosed and do not close DASH-02. No observed date failure is invented.

## 4. Source/API, liveness and protected-boundary assessment

- The absence-versus-valid-empty rule is compatible with async `meta.source` (`usePrefAsync.ts:61–72`); registry default `[]` need not change. Legacy caller's length fallback and last-removal guard directly explain the W-1 defect. View state remains local (`WorldClocks.tsx:43`): list on reopen; same-mount edits/ticks/reorder preserve selected list/analog/grid; no Clock key or new view preference.
- Registered JSON composes caller validation (`usePrefAutosaveAsync.ts:37–58`); codec parses JSON (`codec.ts:57–62`). Exact raw baselines and uncertain grants are enforced by `prefMutation.ts:158–198,223–239`. Retry retains the failed token (`usePrefAsync.ts:262–276`); using array equality or `edit()` as Retry would violate the proposal. Queued operation identity and late completions still require actual future proof. No shared engine edit is authorized.
- Source-only error is distinct from actual attempted draft; no source-only unload/export/departure hold. Field Reload must refuse to erase current work; Discard detaches it before existing reload disposal (`usePrefAsync.ts:291–300`). The proposal correctly distinguishes held/queued cancellation from an already-started synchronous commit. R1 governs which stored shapes enter this error path.
- Account key/generation and live captured scope match `accountScope.ts:14–23,47–73`; physicalKey reads the tombstone, so memory-only export cannot call it after denial setup. Lifecycle shared then key exclusive, marker/tombstone admission and captured scope are explicit (`prefMutation.ts:110–115,150–155,243–246`). A→B, A→locked, locked→A, same-account epoch/generation and demo/account cases, including export setup boundaries, are present. Forced identity changes do not wait for voluntary departure protection. REL-09 forced-remount limitation stays visible.
- Export envelope is sparse current-account in-memory draft with operation set and `value:[]` retained. No scope/key/id/timestamp/view leakage; Blob/URL/append/click cleanup and fresh liveness checks are required. Inline failure-only versus coordinator pending-only export are distinguished. Raw account-data export is a separate existing surface and does not restore city data (R1).
- P0 host only forwards Header registration; departureCoordinator has one guard slot (`departureCoordinator.tsx:83–92`). The proposal correctly requires an accepted shared aggregator before passing an optional capability through timezones registration. Header/Clock/WorldClocks combined labels, one remaining draft continuing the hold, unregister identity, stale scope, both auth branches and exact rail→Appearance→dashboard order are required. No extra direct coordinator slot or App modification is allowed.
- Ghost reads may be recorded, but ghost writes/removes/participant/unload/mutation locks are zero. Reorder/resize/appearance keep real controller identity. Successful widget removal intentionally disposes its memory draft under existing removal semantics; failed order write preserves it. This is not browser crash durability or a new clear-cities operation.
- Exact proposed implementation allowlist is **14 paths** at contract135–150: caller, five new model/controller/copy/recovery/CSS files, timezones registration, current test plus two new test/fixture files, and four widgets docs. It grants no present write permission. Grid/types/aggregator/Header/Clock/shared CSS/tokens/storage/App/router/coordinator/shell/pet/CmdK/library/manifests remain protected. Local CSS still has semantic geometry impact and shared registration/host locks; isolated worktrees do not waive these dependencies.
- Synthetic business StorageEvent/event-bus dispatch must remain zero; browser delivery of a real cross-document storage change and the unchanged shared same-tab publisher are needed for the required projection cases. The future manifest must name which channel is counted so contract162 cannot be used to suppress genuine browser events or shared engine publication.

## 5. Current dependency and budget disposition

The proposal's line201 explicitly deferred pinning a newer Clock source verdict. That missing identity is now supplied by this card and verified here: **cbf18b4 REVISE** review3, findings R1–R6 at37–80, separate protected-helper diagnostic gap82–86; **44d04c8 impact5,120–130** confirms hard-budget BLOCKED, retention **3/3**, no valid fourth validation or method adoption under existing authority. These are actual frozen reports, not verbal status. Their source/impact author conclusions are retained; this worker does not repair or rerun them.

Preserve canonical Clock r2 hash `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`; original MGB/Q1 seven complete matrices → independent Q2 → root method adoption → valid P0 before → strictly two-CSS geometry/acceptance → versioned baseline and E1–E5 reconciliation → full recovery/fixed/affected/final acceptance. WorldClocks cannot adopt an unqualified replacement, consume another caller's allowance, write shared CSS through its local name, or use approval of its future corrected contract as implementation readiness.

Historical budgets unchanged: Q1 focus1/3, six others0/3, development2/83; retention3/3 with145 assertions and41/42 case executions; B70 native formal12/6432, development40/4884, visual3/3 exhausted, focus EN2/ZH2; F1 formal2/180, development3/302. This task consumes **one static contract review1/3**, zero runtime/browser/native/package/probe/synthetic validations or historical reruns. Next fresh contract review is **2/3** in the same family after a separately registered correction; filenames/actors/worktrees do not reset counts.

## 6. Closeout and next bounded action

This report and input index are the only two ADD paths. Git/blob reads, static source inspection, standard-library hashing and documentation diff/scope checks are the entire validation. No screenshot/native result, successful implementation, caller acceptance, global adoption or formal item closure is claimed. No push/merge/rebase/deploy/release/promotion/D3; root performs remote preservation and normal sync-check at receipt.

Root may register a different, bounded documentation corrector for R1–R3, with exact new paths and original family history; that actor must preserve full WC01–WC20 and cannot repair product/runner/CSS under this verdict. Fresh review2/3 follows. Root alone centralizes any concrete unresolved compatibility decision and the separate Clock budget condition. This review neither asks the owner again about W-1 nor grants extra Clock attempts. Other independent ready work may continue. Output hashes/full commit/parent/clean status are returned externally to avoid a self-hash cycle.
