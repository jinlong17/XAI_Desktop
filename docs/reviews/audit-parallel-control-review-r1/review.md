# Independent review D — parallel control r1

Verdict: **REVISE**. One P2 machine-readable dependency/lock finding blocks approval of this exact scheduling artifact. No missing audit item, reduced acceptance, product authorization expansion, or product change was found. Existing explicitly registered, bounded static A/C work may continue under the sole controller; this review does not activate implementation or any gated module.

Date: 2026-10-10. Module: **web (project-system)**. Reviewer: fresh independent `/root/parallel_d_scope_acceptance_r1`, no children, no product/harness/document repair authorship. The requested Astra responsibility is a review role; no actual provider-model attestation is claimed. One static review; **0 browser/native/runtime/package invocations, 0 diagnostic probes, 0 product edits**.

## Fixed scope and provenance

- Sole writable worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-map-review-20261010/XAI_Desktop`.
- Registration and review parent: `7bb8df1631b94295bb7c3f928fcd9924b1337873`.
- Frozen source checkpoint: `e041c2bc293b70db367444c62c4300231976dbf7`.
- Product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`.
- Original goal attachment: `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md`, SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`.
- Only additions: this report and `inputs.sha256`. Other worktrees, control files, three ledgers, canonical r2, proposal originals, and evidence remain untouched. No push, cleanup, merge, rebase, long-lived branch update, deployment, release or D3 action.
- All compared file bytes and historical reference blobs are listed in the 42-row input index, SHA-256 `38799697eef5f2d7495a04e01c8bf46d9df46140eb95d325167b1ed7aedf28be`. Git refs in that index are full immutable commits. The memory registry was used only to orient to caller-versus-item acceptance; all verdict facts below were checked against fixed repository inputs.
- Later control commits or task status reports are not this review's inputs. The old source checkpoint is deliberately distinct from the registration parent; the map does not silently repin to an advancing controller HEAD.

## Finding D-R1-01 — declare the controller receipt lock as a recurring resource

**P2; correction required.** `parallel-control-r1/dependencies.json:209` defines `REL-02/reconcile`, with `controller-receipt-lock` in its `depends_on` at line 214. The same unresolved reference occurs **299 times**, once in every unclosed item's reconcile node. It is neither a node in `nodes` nor an entry in `external_gate_nodes` (lines 76875–76912). The six `semantic_lock_groups` beginning at line 76816 do not declare it either.

The strict check is `dependency target ∉ node IDs ∪ external_gate_nodes`; its exact result is `{"controller-receipt-lock": 299}`. All other dependency references resolve. The graph's internal edges are acyclic, but an acyclic graph is not automatically a reference-complete graph. A traversal that silently treats all unknown targets as terminal nodes would conceal this defect.

**Impact:** a strict dependency-driven scheduler cannot resolve 299 reconcile steps, preventing their inventory successors from becoming ready. Silently dropping the unknown dependency removes the declared protection from the graph. Treating this lock as a permanently completed one-time gate would also fail to encode mutual exclusion on later receipts. `scheduler.md` item 6 and the graph's last rule correctly require a sole controller; that prose preserves current manual authority but does not resolve the machine-readable reference. `CLOCK/LEDGER` at lines 76784–76796 additionally has only `CLOCK/ACCEPT` as a dependency, so the corrected resource representation must cover special Clock/controller writes as well as generic reconciliation.

**Narrow correction scope:** a fresh independent documentation/schema author should define an explicit recurring controller resource (owner, exclusive acquisition/release semantics, relevant receipt/integration/global-state/ledger operations) and make all graph references typed and resolvable. Separating resource locks from completion dependencies is appropriate; alternatively, an explicit external-resource declaration must clearly distinguish a lease from a completed gate. Keep the 312 obligations, acceptance, source identities, module gates and single-controller authority unchanged. Preserve r1 and its failure finding. Update only the registered versioned dependency/scheduler artifacts and explanatory reference material needed for this correction; no product, oracle, canonical r2, historical evidence or formal ledger changes.

**Reverification acceptance:** strict unknown-reference count is zero; all 2,420 current task identities and edges remain accounted for unless an explicitly explained typed-resource transformation is made; the task graph remains acyclic; every global mutation is controller-owned and serialized, including Clock adoption/ledger and sibling integration; a conceptual two-ready-receipts scenario cannot grant two writers or permanently block both. No runtime/product execution is needed for this bounded document correction. Use a fresh reviewer; retain the original review iteration and caller/unit budgets rather than resetting them with a new suffix or actor.

## Exhaustive scope and ledger comparison

The comparison parsed every current checklist row, every original TODO record, every mapped record, all execution records and all DAG nodes; it did not rely on sampled rows or the older TODO alone.

| Check | Observed result |
| --- | --- |
| Current `ALL-TODO-CURRENT.md` rows | 312 parsed, 312 unique IDs |
| TODO, current checklist, EXECUTION, map ID sets | Exact equality; no omission or duplicate |
| Current priority/kind/action/acceptance | 312/312 exact equality to map |
| Current section original-module/gate/source references | 312/312 exact equality |
| Current checkbox/status vs map formal state | 312/312 equal; REL-02/03 functional-pass/cross-tool-pending detail retained in complete execution records |
| Complete `retained_execution_record` vs EXECUTION | Deep equality for all 312 records, including fields beyond status/evidence |
| Existing evidence arrays | 933 entries preserved, in original order, in retained records and `acceptance_evidence.existing` |
| Formal states | 13 completed; 3 verification_pending; 3 in_progress; 293 pending; 299 unclosed |
| Scope | 194 current-scope; 118 gated, including 9 cross-module QA items |
| Unique primary responsibility | A 29; B 117; C 126; D 40; total 312 |
| Human-readable scope index | 312 rows and 312 unique IDs; same primary/formal/action/acceptance view |
| Original TODO scalar fields | Preserved except 39 intentional normalized `module` values; every original module remains in `original_module` |

The 39 normalizations are GOV-01–16 and SK-01–14 from `web（project-system）`, plus QA-01–09 from `web（跨模块验证索引）`, to the router key `web`. This preserves module meaning rather than moving project-system work to Admin. `status` is the retained historical TODO field; `formal_state` and the complete execution record carry the current state. Their distinction is documented by the scope-map introduction and does not revert current acceptance.

Primary workflow is unique ownership of the item, while prepare/review/before/verify/accept/reconcile/inventory are supporting stages. Multiple workflows on those stages and the Clock chain's `items` references do not create additional primary owners or authorize duplicate implementations. The generic node retains the entire item obligation even when an existing caller is accepted; Clock acceptance cannot close REL-05, DASH-02, UX-05 or any other audit ID.

No current ALL-TODO action/acceptance/gate discrepancy was found. The existing DASH-03 “allow empty or explain” audit wording is narrowed by already accepted W-1 (allow empty), not reopened for choice. `existing-owner-rule-or-minimal-decision:DASH-03` must resolve from CP lines 199–210. Likewise C-1 controls SET-10, F-2 controls SET-08/CAL-01, and R-1 controls SET-03. The prompts explicitly preserve those rules and forbid repeated questions; P-1/D-2 remain candidate-time questions. None of these is a new authorization gap.

## Dependency, conflict and readiness checks

- **2,420 unique task nodes:** 13 retained terminals + 299 × 8 stages + 15 Clock stages. The node list contains no duplicate ID. There are 2,565 dependency references. Internal-node DFS visits all 2,420 with zero cycle. Of the references outside the task-node set, 36 named external gate IDs are explicitly declared; the sole undeclared target is D-R1-01.
- States: 13 retained, 299 eligible_static_preparation, 2,107 waiting_dependencies and one registered_ready Clock impact node. These are scheduling states, not changes to the 312 formal states.
- Every one of 2,392 generic unclosed-stage nodes has `allowed_files: []` plus an explicit statement that an empty list forbids writes until a committed task card is assigned. All 2,405 item-linked nodes (including retained terminals) preserve their mapped item acceptance. No implementation is ready simply because a file differs or an item is listed.
- The external module and owner gates are carried into the relevant implement dependencies. APP/G1/Admin preparation is not blanket implementation approval; Site, account-sync and paused concrete plugin packages remain gated. QA's cross-module verification scope and external live prerequisites remain visible. REL-02/03 retain their real cross-tool requirement; a fresh Codex actor is not cross-vendor proof.
- Six semantic groups conservatively index shared persistence, account lifecycle, date/calendar, dashboard grid, dashboard parser and module authority. These are not a complete read/write lock manifest. `dependencies.md` and scheduler items 3–4 require consumer/impact discovery, explicit task-card read/write and logical locks, exact contracts, before evidence, gate resolution and cost limits before implementation. Isolated worktrees alone do not prove semantic independence.
- Static first-wave A and D review and C TT-08 preparation read fixed Git inputs and write disjoint exact docs paths. They can coexist under this contract. TT-08's registered card allows only its new contract and input index; its unapproved candidate implementation has an empty allowlist and is waiting on contract review/before. No product write or arbitrary READY_TO_SHIP update is authorized.
- The same-caller fresh-actor rule applies at every subsequent phase; reviewers never repair. Each formal unit retains a cap of three across actor/worktree/filename changes, includes refusals, and discloses probes separately. Local failure freezes that task and dependent resources while independent ready queues continue. Suspected shared-state contamination pauses the affected resource for review rather than asserting unaffected parallelism.

## Original goal and complete Clock obligations

| Original obligation | Retained binding location / assessment |
| --- | --- |
| Sole controller; bounded independent tasks | All four goal prompts and scheduler 1–4; workers have one task, no children or global write authority |
| Replace global single-batch restriction only | Authority overlay preserves the attachment; parallelism does not waive per-task scope, evidence, independence or product behavior decisions |
| Fixed evidence provenance | All prompts require immutable streamed archive, lockfile/@repo guards, requested/resolved SHA, non-overwrite and nonzero-exit preservation; source hashes match all 11 declared source entries |
| Native input and focus rules | Pipe CDP, trusted input/drag and passive K-1 audit retained; original pixelFocusWalk remains immutable; only separately named/hash-bound M copies may qualify |
| M → G → B → recovery order | All 15 Clock nodes form the required linear prerequisite chain; complete seven-unit qualification and independent Q2 precede adoption, full valid P0 Q3 precedes two-CSS G1, G2/G3 precede B1, E1–E5 B2 precedes TERRA71 |
| Canonical r2 / ownership | Unchanged canonical r2 plus the exact approved two-document proposal; no broader shared CSS, behavior changes or unapproved product tests |
| Fixed and native recovery breadth | Goal A, Clock FIXED/ACCEPT and approved plan §8 retain every E1–E25 and all nine gates, full host a–q including l/q and both auth branches, native controls/export, visual/keyboard and affected callers |
| F1 and final regression | 12 frozen F1 invocations + Appearance K-1 selfcheck/appearance + rail selfcheck/railorder = 16 E15 invocations; Clock E16 separately; E17 Header fixed/P0 including registered capacity-copy refusal preservation |
| Correcting oracles and predictions | C-FB002 10/10, OE 26/26, C-RD1 15/15 judge alongside originals; C-FD1 14/15 recorded, frozen Features 13/15, frozen Appearance 24/26, frozen More as it falls; unexpected deviations freeze acceptance |
| Final completeness | E25 enumerates each producing commit/path/hash/verdict; actual geometry/computed styles/native frames supplement outerHTML after G; composed changes need frozen integrated-SHA independent regression/acceptance |
| Ledger/inventory | Controller-only, evidence append after caller acceptance, unchanged formal counts; fresh inventory and next candidate after receipt; valid historical batches not gratuitously rerun |
| Cost | Q1 focus 1/3, six other units 0/3 and dev 2/83 remain recorded; B70 history and exhausted visual 3/3 preserved; every three accepted batches cost cycle retained |
| External boundaries | No automatic merge/rebase/dev/main/web promotion/deploy/release/D3; real hardware, credentials, signing, payments, RLS/two-device/cross-vendor gaps cannot be labeled passed |

These are preservation checks, not fresh execution or acceptance of the product or measurement algorithm. The expanded approved geometry plan retains Clock's original business failures, forbids rebuilding missing Q1 raw outcomes, and changes only named M/G/B technical boundaries. Broader technical revisions still require independent impact review and cannot weaken acceptance or change owner decisions.

## R2 preservation and integration policy

`213aafd92e4ea3a43d943fb766efa73fb4cbbe96` is an ancestor of registration; its parent is `97158929238654f4cce882c5383fdfdb52f3dab9`. Git shows exactly two ADD files and 403 inserted lines. Both current bytes equal their original commit blobs:

- `contract-r3-proposal.md`: `441bad33ef9e10a7cde77c5c812dc76f4259eeb0d907680c127f81712e6dafa0`.
- `qualification-geometry-plan-r1.md`: `7c605716fa42fdcc9ef44036bf993ce94b9ce0c4a6d36cee85fca2fd7012b27e`.

The proposal's historical PENDING language remains untouched; CP's explicit operator receipt supplies subsequent conditional authority. Document receipt is not method qualification, geometry acceptance, baseline adoption or caller acceptance. Canonical r2 hash remains `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`. Product-path diffs from P0 to both source and registration are empty. Three ledgers and canonical r2 are byte-identical between source and registration.

Ordinary scoped cherry-pick is a necessary technical adaptation for verified parallel siblings whose common fixed parent cannot all fast-forward. Shared multi-machine policy §3 explicitly permits sibling branches and cherry-pick. Scheduler 6–7 preserves source commits on archive refs before receipt, source→integration SHA plus same patch/content hashes, exact paths and frozen inputs; conflicts are aborted and assigned to a fresh integration author rather than repaired by root. An independent regression/acceptance of the frozen integrated product composition is required wherever affected. This does not authorize merge/rebase, a broad archive merge, changing worker evidence inputs, or long-lived branch promotion.

Preservation receipts distinguish normal sync-check from deep's existing five unreachable objects, retain 23 stash history and the Q1 profile residue, and restrict cleanup to this chat's owned worktrees. These are historical fixed-checkpoint receipts; no live fetch, sync-check, deep scan, profile deletion or other-worktree inspection was performed by this reviewer. Controller remains responsible for actual source-ref preservation, push/ancestry, receipt and its authorized cleanup checks.

The authority overlay and CP openly report the Goal API as blocked with the old objective and explain the public tool's inability to edit/resume it. They do not claim a tool-active or completed goal. The reviewed repository schedule expresses direct user authorization to continue manually, while 299 items remain unclosed. This review did not mutate or query root's Goal API metadata.

## Reproducible static checks and closeout

Python standard-library JSON/Markdown comparisons checked all 312 row fields and whole record/evidence equality; source blobs were retrieved with `git show <full-ref>:<path>` and SHA-256 recomputed. The essential strict graph check is:

```python
from collections import Counter
node_ids = {node['id'] for node in graph['nodes']}
external_ids = set(graph['external_gate_nodes'])
unknown = Counter(dep for node in graph['nodes']
                  for dep in node['depends_on']
                  if dep not in node_ids | external_ids)
assert len(node_ids) == len(graph['nodes']) == 2420
# observed: Counter({'controller-receipt-lock': 299})
```

A separate DFS over declared internal nodes checked cycles without confusing the unresolved-reference result with a pass. `git merge-base --is-ancestor` verified R2 ancestry; `git diff --name-only` checked product/protected identity; `git diff --check` and exact staged-path checks validate only these two additions. The configured post-commit hook delegates to the cowork dispatcher. This static/no-children task uses a per-command `core.hooksPath=/dev/null` for its sole commit to avoid starting unauthorized hook work; no Git configuration file is modified.

**Next correction:** root preserves/receives this exact failed review, registers a fresh bounded author for D-R1-01, then a fresh independent re-review of the corrected fixed snapshot. This reviewer makes no repairs and does not approve a hypothetical correction. Continue safe independent ready tasks; keep implementation and external gates in force. Review iteration 1 is retained; all prior runtime/formal/probe counters are unchanged.
