# CP-CLOCK-01 · 70-R1 independent impact and contract-oracle review

Date: 2026-10-09. Module: **web**. Verdict: **impact review complete; E4 remains BLOCKED; no implementation authorization**. E5 remains a harness-valid BEFORE result. This is a docs-only review, not Workflow V2 implementation or caller acceptance.

## 1. Reviewer, authority and immutable inputs

This new reviewer instance `/root/clock_impact_r1_astra` did not author the Clock contract, batches 68/69/70, or any AppRail batch. It spawned no children and used no stopped half-work. The controller reports the accepted launch configuration as `agent_type=worker`, `model=gpt-6-astra`, `reasoning_effort=high`, `fork_turns=none`. The spawn response identifies this task but supplies no provider model attestation: **configured/requested model is gpt-6-astra; launch accepted; underlying runtime model independently unverified**. “Astra” here states the assigned review responsibility, not stronger runtime proof.

- Sole writable worktree: `/Users/lijinlong/.codex/worktrees/audit-clock-impact-r1-20261009/XAI_Desktop`, detached, initially clean, parent `b5a1285c00e66c4819b7f0284679433ae18bd01c`.
- Fixed product: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`, full tree `05887cf113639116b228a25041a37b3d5c69a322`.
- B70 evidence: `01bd51684488596e2ecd8b7f6d3e71bbc235f258`.
- Contract r2: `8bf6139`, `docs/reviews/web-dashboard-clock-recovery-contract/contract.md`, SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`.
- Frozen focus source: `bacdbbc:docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs`; file `5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4`; block `e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43`; function `1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620`.
- Lockfile `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`; frozen F1 prelude `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670`.

Read the governing AGENTS, CLAUDE, shared workflow, multi-machine policy, current control plane, whole r2 contract and attached goal objective. The current dispatch resumes only the registered impact-review candidate after STOP. The generic goal's eventual Clock implementation sequence does not grant a protected CSS or oracle exception. The controller checkout and other sessions were not written or run. No fetch, browser, server, preview, fixed run, reference implementation, product/test/oracle edit, control-plane update or push occurred.

Recomputed checks, using Python hashlib and Git object reads, not receipt labels:

1. The contract bytes equal `8bf6139`; all **50** contract source-table hashes match actual `f9eb4b1` blobs.
2. `git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml` is empty. Thus cited working product lines are fixed-product lines.
3. Re-extracted the pixel block/function using the source boundaries at native runner lines 100–105. Both hashes match the committed `bacdbbc` source and all four B70 native runners, including the unlaunched supplemental runner.
4. **727 native + 4 F1** receipt-table artifact hashes match retained bytes. This establishes identity, not completeness or behavioral acceptance.
5. Checked every formal log's embedded `fileSha256` against retained source. Four old native before1 logs differ in **both** the main runner and focus-helper hashes; their missing old snapshots cannot be reconstructed by calling the final source equivalent. All other formal native and F1 log source hashes match.
6. Recounted raw `check` and `verdict` records and `result.checks`, including formal refusals; parsed geometry hit chains and modal verdicts. Checks alone omit verdict records and would undercount cost.

The names-and-hashes index [inputs-r1.sha256](inputs-r1.sha256) records **796** inputs (including receipt tables' artifacts and the external goal attachment), SHA-256 `808836d75ca884fc00030f68bfaa5437d0f52f6c5aa9ad96c08d843cce59d925`. External goal bytes may be unavailable on another machine; the committed review states the applied authority without making that attachment a product dependency. All paths below are repository-relative; line numbers refer to this fixed review parent.

## 2. R1-F1: H9 refusal is a measurement-method limitation

**Finding: established incompatibility of the frozen all-stop alignment precondition with existing shared focus geometry. H9 itself remains unresolved. No Clock focus defect is established by this refusal.**

Raw evidence:

- `web-dashboard-clock-recovery-native/native-f9eb4b1-before2-focus-en.log:1352` and `...focus-zh.log:1354`: the first `light:1440:style:split` full-cycle precondition fails; `closed=true`, `rows=28`, `inside=28`. Each final result records 892 checks, harness-invalid.
- Each refusal has precisely one misaligned descriptor: `other:button.widget-shell__resize`. Focused rect `(716.320007,293.570007,751.679993,328.929993)`, clip `(706,283,56,56)`; moved-on rect `(717,294.25,751,328.25)`, clip `(707,284,54,55)`. Scroll is `(0,0)`, hover stays `aside.app-rail`, and `stillFocused=false`. The focused capture is stable; **no aligned moved-on image is captured** (`movedOn=null`), so do not describe this as a successful two-image comparison. EN/ZH values are identical.

Owning source explains the exact change:

- `packages/xai-web-dashboard-grid/src/styles.css:715–747`: resize is absolutely positioned; transition includes transform; `:focus-visible` applies `scale(1.04)`. Lines 1012–1016 give it 34 px minimum dimensions, explaining `34 × 1.04 = 35.36` and a 0.68 px edge change about its centre.
- At 781–1024, lines 1109–1115 override transform to none; at ≤780, lines 1185–1192 do likewise. Hence the 375/768 observations do not contradict the desktop failure.
- `WidgetShell.tsx:320–334` renders the sibling resize button outside `.w-clock-body`. It is a Web Dashboard shell control, not a Desktop Plugin control.
- Grid stylesheet hash: `d9e330e70a375b0579fcf3b98e3d9ea2c633fc4b498b4b3a66fda3df8db9fdc6`; WidgetShell hash: `7d1b74b80076983eb5cc34921d06d58b5365cbcf91efb63128a6c7938b1bd708`.

Method source:

- `verify-native-before.mjs:1482–1488` requires identical clips, hover, and every rectangle edge within 0.01 px before taking the second capture. Lines 1518–1523 require the complete cycle and zero misaligned stops **globally**, before returning any Clock-specific verdict.
- `native-clock-focus-probes.js:140–146` enumerates the document's tabbables. `PANE` does not restrict the full-cycle gate to Clock. The wrapper at `verify-native-before.mjs:1203–1210` scopes only the later visible-focus business verdict to Clock, recording outside stops separately; it does not waive the global precondition.
- Primary focus setup deliberately uses the production App with `order:["clock"]` (`:1134–1136`); geometry uses the default eleven-widget order. These are distinct fixtures. Neither count may be presented as evidence for the other's composition.

Waiting longer cannot remove a stable focus-state transform. Changing correct shared focus styling merely to make this oracle pass would be an unjustified product change. Do not suppress the resize stop, set tabindex/inert, hide or restyle it, turn off CSS, weaken rectangle tolerance, bypass `pre`, filter its failure after the fact, or treat a partial walk as E4. The existing block/function hashes and global preconditions stay frozen.

Both logs contain 34 completed diagnostic walks (17 each at light/375 and light/768), but each entire run is harness-invalid. They establish neither full H9 PASS nor full H9 FAIL; no dark matrix, complete 1440 matrix or formal states 3–4 coverage exists. The third per-language run was never launched. Supplemental `verify-native-focus-states.mjs` and its developmental probes are preparation only.

**Recommended future method correction, subject to separate authorization and qualification:** retain the original source and refusal logs; create a separately named judging copy, with its own hash and explicit diff. Preserve the full DOM-order Tab-cycle census for all stops and exact stable aligned own-region measurement for every Clock stop. Measure outside stops with a qualified method capable of focus-induced transforms, such as a fixed viewport union clip covering both actual state boxes and ring regions, after each state settles, with scroll/hover identity and exclusion of the next stop's changes. The new method must distinguish focus-caused geometry from page drift, asynchronous changes, clipping and occlusion. It must not replace geometric alignment with an arbitrary tolerance, rescale screenshots, or count a next control's ring as the current control's signal. This is a qualification proposal, not a proven algorithm or permission to implement it.

Qualification must include positive and negative controls: stable non-transformed rings, selected/unselected and active/inactive controls, a transformed focus target, a target with no focus change, an outline masked by selection, a fully obscured target, next-stop-only change, scroll/hover drift, unstable animation, duplicate/missing stops and missing body-cycle closure. Validate equivalence with retained Appearance/AppRail accepted and failing focus examples (F-APP-1/2); replay the original immutable failing products where needed. No Clock fixed implementation may be invented for qualification. A new judging method requires independent review before E4 uses it. Known H9 business failures, if a valid run finds any, then require their own frozen before → separate Clock-local repair → unchanged fixed rerun chain.

## 3. R1-G1: real pet-hidden responsive obstruction

**Finding: a genuine pre-existing product geometry failure under §9, independent of H9, target size and R-PET.**

`native-f9eb4b1-before2-geometry.log:12` fixes EN/ZH × 375/414/768/1024/1440 × six closed states, default order of eleven widgets. The runner (`verify-native-geometry.mjs:1107–1180`) scrolls each control into view, measures `elementFromPoint` at its centre, retains ancestor chains, asserts viewport/product composition, hides the pet by a trusted product click at 768, resizes without reload and asserts the pet absent. It does not inject geometry or mask the overlap.

Recount from raw records, with zero failed preconditions and 1858 checks:

| Requirement | Correct outcome |
| --- | --- |
| Pet-hidden centre hit at 375, 414, 768, 1024 | 48/48 cases FAIL (12 per width) |
| Pet-hidden centre hit at 1440 | 12/12 PASS |
| No horizontal document or Dashboard overflow | 60/60 PASS |
| Missing failed-field controls (H1/H2) | 30 expected BEFORE FAIL |
| Missing source-only Reload (H4) | 20 expected BEFORE FAIL |

The 48 failing cases contain **exactly one covered control each: Analog/模拟**, whose hit chain reaches `button.widget-shell__appearance`; 24 EN + 24 ZH. For clean EN, measured centres are `(319,323.25)` at 375 (`log:47`), `(358,323.25)` at 414 (`:271`), `(712,323.25)` at 768 (`:495`), `(964,269.25)` at 1024 (`:719`). Clean 1440 passes (`:943`). The receipt's earlier visual/probe observations also mention Minimal/remove overlap; those are different hover/focus/setup states, not the 48-case geometry failure census. Do not flatten them into “48 minimal and analog failures.”

**Mechanism and owner:**

- Widget children render first, then appearance/remove/resize as siblings (`WidgetShell.tsx:164–179`, `:291–334`). There is no reserved content area for those absolute action buttons.
- `.w-clock-body` is positioned; its `.clock-toolbar` is absolute at top/left/right 8 px, with style toggle at the right (`widgets/src/styles.css:13–32`; Clock markup `ClockWidget.tsx:248–272`).
- Appearance is absolute, z-index 12 and pointer-enabled (`grid/src/styles.css:483–514`). Responsive rules move it **inside** the shell at top/right 8 px, permanently visible at opacity .82: 44 px at 781–1024 (`:1109–1145`) and 46 px at ≤780 (`:1180–1230`). Remove sits nearby and becomes pointer-enabled on hover/focus; resize occupies the bottom-right.
- Clock style controls reach 44 px via widgets CSS at ≤760 (`widgets/src/styles.css:1898–1918`) and grid's 641–1024 rules (`grid/src/styles.css:1234–1257`). At 1440 they are 30 px from the widgets refresh (`:1862–1873`), while shell actions retain the outside-edge placement. The interaction of **positioning, stacking and independently enlarged targets** explains the evidence. This is not pet coverage, horizontal scrolling or an H10 size failure.
- The content wrapper has overflow hidden (`grid/src/styles.css:349–365`), so simply pushing content outside or raising a child z-index is not a sufficient remedy. Raising Clock controls over shell actions would trade one inaccessible action for another. Hiding the shared actions would also lose functionality.

I manually inspected these retained screenshots: `native-f9eb4b1-before2-geometry-en-{375,1024,1440}-clean-pet-hidden.png` and `native-f9eb4b1-before3-modal-zh-375-Header-plus-failed-Clock-modal.png`. The first two visibly put the appearance button over the Analog end of the toolbar; 1440 is separated. This is a sample review of these four frames, not a claim to have manually accepted all B70 screenshots or future fixed surfaces. Their hashes are in the index.

**Impact:** every default widget uses `WidgetShell` via `DashboardGrid.tsx:135–160`, so changing shared action placement can affect all eleven widgets, removal, resize, drag hit regions, appearance panel reachability, overflow and keyboard order. Weather's top edit button (`WeatherWidget.tsx:99`), World Clocks view controls (`WorldClocks.tsx:73`) and Mini Calendar nav (`MiniCalWidget.tsx:82,97`) are concrete adjacent consumers to check. Only Clock obstruction is established here; other widgets are affected-surface risks, not proven failures. Dashboard Header lies outside WidgetShell but shares Dashboard layout, scrolling and accepted departure behavior. Sticky recovery acceptance concerns the settings caller; the Stickies widget is a separate surface, and neither is automatically reaccepted by a shell-layout fix.

**Smallest semantically complete proposed product repair:** a separate Web Dashboard geometry window with a Clock-scoped rule in the owning `packages/xai-web-dashboard-grid/src/styles.css`, explicitly reserving non-overlapping room for **both** shell actions and Clock content across responsive widths and all four faces, plus any necessary additive `packages/xai-web-dashboard-widgets/src/styles.css` Clock layout rule. Those are the proposed maximum product-file scope; no WidgetShell markup/handler or persistence edit is preauthorized. Preserve target sizes, all actions, focus, drag, resize and appearance behavior; test hover/focus-within as well as parked-pointer states. At 375 px, a mere right gutter can crowd the timezone/style row; allow wrapping or a reserved action row and associated height adjustment, with manual visual review. Do not prescribe arbitrary pixel offsets as already verified.

A shared all-widget action-row redesign is an alternative with much broader visual impact, not required by the current evidence. If the two-file Clock-scoped layout cannot preserve all behaviors, stop and propose a wider scope before editing `WidgetShell.tsx` or other widgets. Even the narrow option is outside r2's allowed CSS and its clean-state invariance; it needs explicit revised ownership and a qualified geometry oracle first. It must not be smuggled into Terra's ordinary recovery work.

## 4. R1-O2: forward-use Chinese Reload oracle error

`verify-native-geometry.mjs:1179` tests `/Reload|重新加载/`. The normative label is **`重新读取 <Label>`** (contract `:419`), with source wording also using `重新读取` (`:421`). A compliant future Chinese Reload button would not match the runner's expression.

This does **not** invalidate the current 20 correct source-state BEFORE failures: the raw snapshots show zero recovery blocks and no Reload control, so `hidden.recoveryBlocks===1` is already false. Nor does it invalidate the 48 centre-hit failures or 60 overflow passes, which are separate assertions. It does prohibit treating this frozen runner as a correct unchanged ZH fixed oracle without an erratum.

Recommend a disclosed correction copy judged against the exact field-local EN/ZH contract label and absence of forbidden actions, not a broad synonym regex. Preserve original bytes and failures. Independently qualify the copy with correct EN/ZH labels, wrong/missing labels, wrong field, unexpected Retry/Discard/Export in source-only state, and the original before archive. These may be oracle-only controls; they must not be a Clock reference implementation. Record original and corrected results side by side. The contract copy itself needs no wording change: the runner is wrong. Any eventual fixed execution belongs after separate implementation and authorization.

## 5. Preserved valid coverage, limits and cost

The modal raw log's relevant triplets are lines 61–64, 109–112, 157–160 and 205–208; result at 218. Four EN/ZH × 375/1440 cases have the expected BEFORE Header-only label failure. Dialog viewport containment, button centre hits and trusted Tab trapping pass four cases each. These establish the existing Header dialog's sampled behavior, not future combined Clock participation, all key operations, or E4 completion. The visible pet in the sampled modal screenshot does not disprove centre-hit results; those measure button centres, not every pixel of the dialog.

Authoritative native retained-source logs: fields before2 (572), source before2 (378), departure before1 (352), visual before1 (262), geometry before2 (1858), modal before3 (190). All have formal precondition failures zero and matching final source bytes. Fields' mount/ticks/popover, exact seventeen values, idle second-document updates, lock independence and ghost zero SET/REMOVE controls remain valid only in their stated cases. Ghost reads are not zero-storage-attempt proof: the controller ruling means zero writes/removes. Header-only discard/retry evidence remains valid; fixed native host row l still must run.

Diagnostic-only retained history: fields before1 (572), source before1 (378), focus EN before1 (55), focus ZH before1 (31). Their old main runner **and focus helper** snapshots are unavailable. Before2 focus EN/ZH (892 each) has matching source but formal precondition failure one each. No relabeling of those formal runs as developmental probes, no fourth visual run, no budget reset.

| Cost | B70 retained/disclosed use | This review |
| --- | --- | --- |
| Native formal | 12 runs / 6432 checks | 0 new |
| Native development | 40 probes / 4884 checks; external, not substituted for evidence | 0 new |
| F1 formal | selfcheck 30 + clock 150 = 2 runs / 180 checks | 0 new |
| F1 development | 3 probes (30, 122, 150 checks), separately disclosed | 0 new |
| Focus formal limit | EN 2, ZH 2; third per language unlaunched | unchanged |
| Responsive visual formal limit | visual1 + geometry2 + modal3; 3/3 used | unchanged |
| Review | one source/evidence review; no reproduction needed | completed |

E5's raw final records (`f1-...selfcheck-before1.log:33`, `f1-...clock-before1.log:159`) are harness-valid. c1/c2/c4 are before-not-held, c3 before-header-only, c5 before-rail-only; its positive halves and release/runtime observations do not establish Clock fixed behavior or re-close F1 globally. Development probe counts above are disclosed from the committed receipts; their external `/tmp` logs were not independently re-read in this review.

Headless Chrome, synthetic authentication, development composition, synthetic beforeunload and reused dependencies remain limitations. This review checks retained evidence and source identity; it does not reproduce pixels on a newly launched browser, prove production login/logout, or establish deployment readiness.

## 6. Required ownership and acceptance sequence — recommendations only

The governing boundaries are r2 §9 (`:597–700`), §10 invariance (`:711–737`), §11 protected files/shared-defect procedure (`:790–815`), §13/14 gates, §16 exclusions and §18 stop. No current exception allows the reviewer or recovery implementer to change grid CSS, frozen pixel code or its preconditions. Impact-review approval alone does not revise ownership.

1. **Ratify a concrete r3/addendum before any correction or product edit.** It must identify R1-F1 measurement qualification, R1-O2 exact-copy erratum, R1-G1 genuine layout repair, respective independent authors/verifiers and named output paths. Preserve H9 own-region and complete-cycle requirements, H10 observational status, §9 pet-hidden gates, unchanged-control pet-on exception, and the already decided nonblocking open-popover probe. Do not turn pet-hidden obstruction into that exception. Specify the prospective two-file layout scope and stop if it expands.
2. **Independent oracle correction/qualification window, then independent review.** Add versioned judging copies/qualification fixtures under a new explicitly registered evidence directory; originals remain immutable. Preserve failure logs and original hashes. Complete a valid before focus matrix on immutable `f9eb4b1` using the qualified correction: EN/ZH × light/dark × 375/768/1440, selected/unselected styles and active/inactive timezone items, and all §9 states. Missing recovery controls remain correct BEFORE failures; no surrogate controls or product implementation may be added to make before green. Freeze geometry/Reload correction and its valid before failures before product repair. The exhausted visual budget stays exhausted; any new corrected-evidence unit needs explicit scope/cap registration, not a renamed fourth B70 run.
3. **Independent product geometry repair window.** Only after frozen correct before evidence, this impact review and explicit ownership revision. Start from a fixed, named product revision; allowed product files only the two stylesheets above with Clock-specific layout selectors. Save before/fixed geometry, all four Clock faces, EN/ZH five widths (plus 760/780/1024 breakpoint edges), default eleven widgets, pet-hidden and pet-on, hover/focus/remove/appearance/resize states. New tests/evidence paths must be enumerated in that task card. Do not remove resize focus scaling to resolve R1-F1. No storage, coordinator, App, shell, tokens or pet changes.
4. **Fresh independent layout verification and impact acceptance.** Re-run all affected widget surfaces and Header native visual/keyboard evidence because the proposed layout exception defeats the original no-rerun justification. At minimum retain Header E17 before/fixed suites and record sequences, Dashboard grid/widgets tests/typecheck/lint and relevant shell action behavior. Check AppRail/Appearance chrome and native visual/keyboard impact, including Dashboard interactions. E12 outerHTML equality alone cannot prove CSS geometry invariance; compare actual geometry/computed styles/screenshots as well. If only Clock-scoped selectors match and shell/App/tokens remain unchanged, unaffected settings behavior suites may remain bounded by the original delta rationale, but original E24 is still required later. If any shared selector/DOM expands, explicitly run those callers' affected native modes, including Features/AppRail native where E12/E19 bounds no longer hold; do not claim inherited visual acceptance.
5. **Re-pin transparently before Clock recovery implementation.** If the geometry repair is accepted first, r3 must name the new geometry-only prerequisite SHA while preserving `f9eb4b1` as the original failing product. Reconcile E1–E5 to the new base by explicit deltas/reruns: CSS does not silently replace the original functional before facts. Whole-Dashboard identity against `f9eb4b1` cannot be claimed for a changed layout; separate the independently accepted geometry delta from subsequent clean-state recovery invariance against the new base. Update E6/E19 allowed-diff predicates and all contract/product hash gates through disclosed copies; otherwise the old frozen F1 runner correctly refuses a new CSS delta. An empty product-vs-docs diff or a looser hash gate is not enough.
6. **Only then resume separately authorized batch 71.** Require complete E1–E5 frozen under the amended interpretation. Run unchanged/corrected-as-approved fixed business, host, native, E13/E14 and F1 evidence; Header E17, E24 with C-FB002/OE/C-RD1 judging copies and C-FD1 observations, and full E25 enumeration. A fresh uninvolved final acceptance reviewer reconciles source → correct before failure → independent fixed result → actual surface. Controller alone receives, pushes and updates control/ledger evidence. No 312 item closes from this review or the prerequisite layout acceptance.

**Decision still required:** the controller must explicitly ratify the measurement-method amendment and register correction budgets, and explicitly authorize the protected geometry ownership exception after reviewing its concrete scope. If its delegated authority is insufficient for the visible responsive layout change, the operator must approve that exception. Recommended choice is qualified measurement correction plus the narrow Clock-scoped layout reservation; a global shell redesign has wider cost and needs a new impact scope. There is no reason to ask again about A1–A9, removal, pet persistence or the already confirmed popover default; those decisions are preserved. This report does not infer any grant from the generic audit goal, nor equate a docs decision with product-write authority.

## 7. Next single bounded task

**70-R2: independent docs-only Clock r3 proposal and oracle-qualification/geometry task contract.** A new author, not this reviewer or previous Clock/AppRail authors, prepares one reviewable amendment on the unchanged product `f9eb4b1`, grounded in r2, `01bd516` and this committed report. Proposed write scope is only the Clock contract and a new qualification/repair-plan document; the controller must explicitly register those paths before dispatch. Deliver exact judging-copy boundaries, negative/positive controls, the two-file protected layout proposal, baseline/invariance/rerun handling and preserved B70 budgets. Cost: one docs pass, zero native runs, zero product/oracle implementation. Stop on unresolved scope or method contradiction. The controller reviews and records the concrete scope decision; this task itself grants no implementation permission. Subsequent correction and repair windows run serially as §6, never in parallel.

The review's own changes are only `impact-r1.md` and `inputs-r1.sha256`. Product, contract, evidence, ledgers and control plane remain byte-unchanged; detached commit/no push is intentional under this dispatch. Controller receipt is still needed for recoverable remote handoff. CP-CLOCK-01 remains blocked_by_gate, E4 incomplete, batch 71 not started, and 13/312 completed / 299 unclosed unchanged.
