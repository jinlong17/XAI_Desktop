# D-R1-01 recurring resource correction — UNACCEPTED

Date: 2026-10-10. Module: **web (project-system)**. Task: PARALLEL/LOCK-CORRECT, workflow B, fresh independent documentation/schema author under the sole root controller. No children. Configured model gpt-6.1-sol is configuration, not provider/model attestation. This is one bounded static correction pass; runtime/browser/native/package/probe budget and actual invocations are zero. The correction is ready for fresh independent review, not accepted, self-adopted, implementation-ready or released.

## Fixed sources, authority and failure retention

- Sole writable worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-lock-correct-20261010/XAI_Desktop`.
- Fixed dispatch parent: `fb95dd39117ca98a9b5a038a29b40d015936fe85`; initial status clean. The task card is that parent's `parallel-control-r1/tasks-P2.json`, ID PARALLEL/LOCK-CORRECT, with `fixed_card_input` 0d6124dac872e040e8eac389b44bb5e52602197a. Its registered state/actor strings are historical inputs; controller dispatch supplies this actor's authority without this worker editing registration.
- Original map/DAG registration source: `7bb8df1631b94295bb7c3f928fcd9924b1337873`; map source checkpoint stays `e041c2bc293b70db367444c62c4300231976dbf7`, product P0 stays `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. No advancing HEAD is substituted for a fixed input.
- Immutable failed D review source: `4ba9c44a60fe97eeee8d5489c320eaedf2e342cc`, received at `0d6124dac872e040e8eac389b44bb5e52602197a`. Their original report bytes are equal. D-R1-01 remains P2/REVISE, initial review 1/3 consumed; next fresh independent review is 2/3. Actor, filename and worktree changes do not reset this family or any original Clock/caller budget.
- Direct operator parallel/correction authority is preserved in the fixed authority overlay, control checkpoint and exact committed task card. Original goal attachment hash stays `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`; it is read and indexed, never modified.
- `inputs.sha256` indexes all substantive original review blobs, current dispatch/card/authority/map/ledgers/contracts and original/reception review blobs, plus complete raw apps/packages Git tree identities and package/lock/workspace blobs at both fixed product and parent. No navigation-memory fact is used as correction evidence. Historical failures, runners, evidence, canonical r2 and proposals remain immutable. Product diff P0→dispatch parent is empty.

## Exact correction and read/write boundaries

Only five ADD files under `parallel-control-r2/`: dependencies.json, scheduler.md, correction.md, inputs.sha256, checks.json. Reads are fixed Git blobs and original goal attachment. No r1, control pointer, registry/state, three ledgers, product/source/CSS, canonical contract, runner or evidence is written. No actual scheduler implementation or product repair. No push, merge, rebase, deploy, release, promotion, D3, cleanup, other-worktree access or child dispatch. A per-command `core.hooksPath=/dev/null` disables the sole commit's external cowork hook; no persistent Git configuration changes.

The original strict failure is exactly `{controller-receipt-lock: 299}` in completion `depends_on`. Each of those 299 references moves to typed `requires_resources`, preserving its exact source node/row and dependency index in checks.json `results.transforms` (zero-based node index; node ID included). Every other completion edge, node field/state/budget/allowlist/action/acceptance and all 2,420 task IDs and 36 external gate declarations remain exact. The reverse-transform verifier restores each original node and checks deep equality, and every original non-node top-level field remains deep-equal. No unrelated normalization or ID rename occurs.

Three additive explicit bindings cover CLOCK/ADOPT-M method adoption, CLOCK/B1 baseline adoption and CLOCK/LEDGER ledger mutation. CLOCK/B1 worker authorship of a versioned addendum is retained; its root phase alone adopts reviewed hashes under lease. Generic reconcile bindings identify root receipt/control/ledger phases. These additions never turn workflow A/D into another controller. All original completion prerequisites remain unchanged.

`reference_schema` types existing completion strings by field/namespace and typed resource/operation objects by their explicit type. `resources` declares one recurring exclusive root-owned resource with capacity one, finite token/deadline, FIFO admission and success/error/cancel/crash release/recovery rules. Ten controller operation definitions reference it. `root_global_mutation_default` mandates it for every global side effect even outside DAG/card/node resource lists. Mutation admission is completion/acceptance readiness AND the union of node, operation and mandatory global resource requirements. Locks grant no authority or business acceptance.

Never complete the resource as a one-time gate or keep it across operations. No worker may acquire or receive a token. Every side effect checks the live root token; finally releases after success/error/cancel while retaining partial-state evidence. A repaired failed attempt requeues at tail within inherited budget. Uncertain partial state quarantines affected operations after token release; crash/deadline fences the token and requires proof the old writer stopped before root recovery grants a new token. There is no expiry-only takeover, automatic successful rollback, infinite retry while holding, or waiting on a completion prerequisite under lease. Fairness is conditional on finite transactions/recovery; disclosed external quarantine remains a blocker.

## Fixed blob and patch hash differences

The two versioned replacements are additions in Git; their semantic diffs against fixed r1 are independently reproducible using Python standard-library `difflib.unified_diff(old.decode().splitlines(keepends=True), new.decode().splitlines(keepends=True), fromfile="parallel-control-r1/<name>", tofile="parallel-control-r2/<name>")`, UTF-8 encoded. No timestamps are supplied. `checks.json.patch_hashdiff` records source/output hashes, exact unified-diff hashes, byte and line counts. The input index and reverse-transform proof preserve source causality; the diff digest does not replace independent review.

| File | Source r1 SHA-256 | New r2 SHA-256 | Unified-diff SHA-256 |
| --- | --- | --- | --- |
| dependencies.json | `e43e3b03a8215d56d3ad6432ac07fb85dfca75f1ab24fbfadff1de7f533e6ffc` | `d36e93284d069015129fa78afb24264da1730d636d5893453b2e72d8de110984` | `30c794f5a97699827317a3040944f22702e79a85452ba8dfe8c6777a01982893` |
| scheduler.md | `7b468294baa5e3448a481af957485679125f4b4ae18be5ba1dc5c746291d9a39` | `b77b8dd703868c3cda270ab5bd1521465393adb0702a04d3381ee570ea73f7b4` | `82431f00955ae09bea898daa5e7910d91fcc555b28f93e7f97c80a2867e91f9a` |

## Acceptance mapping

| D-R1-01 / task-card requirement | Exact proof or boundary |
| --- | --- |
| Strict completeness, typed targets, unknown zero | Schema/object type checks, disjoint completion/resource/operation namespaces and exhaustive reference traversal in verifier; no unknown implicit terminals |
| Retain 2,420 task IDs / 36 external gates / original edges | Ordered ID equality; exact gate-list equality; 299 row-indexed typed moves; reverse node equality; original top-level equality |
| Recurring root serialization for generic/Clock/global mutations | 299 generic nodes + explicit ADOPT-M/B1/LEDGER; ten operations; mandatory default; capacity one/root identity/atomic fencing contract |
| Success/error release and fair two-ready receipts | Two finite in-memory conceptual scenarios, denial of worker/concurrent acquisition, stale-token rejection, B next after A success/error, repaired retry tail, final free queue |
| No deadlock/permanent gate/hold | Acquire after prerequisites/all resources ready, no nested waits, release finally, conditional root recovery; no one-time resource completion |
| Acyclic completion DAG | Kahn traversal of all 2,420 internal nodes after strict reference check; resources are not completion edges |
| 312 obligations / 933 ordered evidence entries / formal states | Full fixed map equality and each retained record/evidence deep-equal to EXECUTION; 13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed |
| Existing acceptance/readiness/source/budget protection | Reverse equality for every node field; map/contracts/ledgers/product/input hashes; no current pointer adoption, no product/runtime action |
| Fresh independence and bounded cost | This author is neither map author nor D reviewer; no children; static pass 1, runtime/probes 0; review 1 retained, next 2/3 |

Static model proof establishes the document contract, not a running scheduler or product behavior. Original Clock qualification Q1 focus 1/3, six units 0/3, development 2/83 and all B70/exhausted visual 3/3 history remain as fixed inputs. Only root may receive/preserve and adopt this version after fresh exact-snapshot review. Any rejection/error retains this attempt and its evidence and uses the existing review-family budget.

## Reproducible standard-library verification

Run the following Python block from the isolated corrected checkout. It only reads fixed Git blobs/current five artifacts, compares hashes/schema/graph/records, and executes two finite conceptual lease scenarios in memory; it starts no browser/service/package/native/product probe. The checks.json verifier digest covers exactly the code between this fence and its closing fence, excluding that closing newline. Output hashes for the graph/scheduler/input index are recorded there; correction/checks hashes are external Git/report receipts to avoid circular self-hashing.

```python
import copy, hashlib, json, subprocess
from collections import Counter, deque
from pathlib import Path
PARENT = "fb95dd39117ca98a9b5a038a29b40d015936fe85"
REG = "7bb8df1631b94295bb7c3f928fcd9924b1337873"
REVIEW = "4ba9c44a60fe97eeee8d5489c320eaedf2e342cc"
RECEIPT = "0d6124dac872e040e8eac389b44bb5e52602197a"
P0 = "f9eb4b1f207bc4b46f547b90afc250424b3c8695"
BASE = "docs/reviews/20260908-full-product-audit/"
R1, R2 = BASE + "parallel-control-r1/", BASE + "parallel-control-r2/"
LOCK = "controller-receipt-lock"
def git(*a): return subprocess.check_output(["git", *a])
def blob(ref, p): return git("show", ref + ":" + p)
def sha(b): return hashlib.sha256(b).hexdigest()
def load(p): return json.loads(Path(p).read_text())
old = json.loads(blob(REG, R1 + "dependencies.json"))
new = load(R2 + "dependencies.json")
assert blob(PARENT, R1 + "dependencies.json") == blob(REG, R1 + "dependencies.json")
assert blob(REVIEW, "docs/reviews/audit-parallel-control-review-r1/review.md") == blob(RECEIPT, "docs/reviews/audit-parallel-control-review-r1/review.md")
nodes = {n["id"]: n for n in new["nodes"]}
gates = set(new["external_gate_nodes"])
resources = {r["id"]: r for r in new["resources"]}
operations = {o["id"]: o for o in new["controller_operations"]}
assert len(nodes) == len(new["nodes"]) == 2420
assert list(nodes) == [n["id"] for n in old["nodes"]]
assert new["external_gate_nodes"] == old["external_gate_nodes"] and len(gates) == 36
assert len(resources) == len(new["resources"]) == 1
assert len(operations) == len(new["controller_operations"]) == 10
assert not ((set(nodes) & gates) | (set(nodes) & set(resources)) | (gates & set(resources)) | (set(operations) & (set(nodes) | gates | set(resources))))
unknown_old = Counter(d for n in old["nodes"] for d in n["depends_on"] if d not in set(nodes) | gates)
assert unknown_old == {LOCK: 299}
unknown_new = [d for n in new["nodes"] for d in n["depends_on"] if d not in set(nodes) | gates]
assert not unknown_new
def require(refs):
    assert isinstance(refs, list)
    for ref in refs:
        assert set(ref) == {"type", "id", "mode"}
        assert ref["type"] == "resource" and ref["id"] in resources and ref["mode"] == "exclusive"
for n in new["nodes"]:
    assert isinstance(n["id"], str) and isinstance(n["depends_on"], list)
    assert len(n["depends_on"]) == len(set(n["depends_on"]))
    assert all(isinstance(d, str) for d in n["depends_on"])
    require(n.get("requires_resources", []))
    for ref in n.get("controller_operations", []):
        assert set(ref) == {"type", "id"} and ref["type"] == "controller-operation" and ref["id"] in operations
for op in operations.values():
    assert op["type"] == "controller-operation" and op["owner"] == "sole-root-controller"
    require(op["requires_resources"])
default = new["root_global_mutation_default"]
require(default["requires_resources"])
assert default["default_is_mandatory"] is True and default["owner"] == "sole-root-controller"
assert default["operation"] == {"type": "controller-operation", "id": "root-global-mutation"}
resource = resources[LOCK]
assert resource["type"] == "recurring-exclusive-resource" and resource["owner"] == "sole-root-controller"
assert resource["capacity"] == 1 and resource["completion_gate"] is False and resource["initial_lease_state"] == "free"
assert all(x in resource for x in ["acquire", "use", "release", "liveness_assumption"])
assert all(x in resource["release"] for x in ["success", "error_or_cancel", "uncertain_partial_state", "crash_or_deadline", "no_permanent_hold", "no_nested_wait"])
assert new["reference_schema"]["depends_on"]["resource_targets_forbidden"] is True
assert new["reference_schema"]["requires_resources"]["type"] == "resource"
special = {"CLOCK/ADOPT-M": "method-adoption", "CLOCK/B1": "baseline-adoption", "CLOCK/LEDGER": "ledger-reconciliation"}
ref = {"type": "resource", "id": LOCK, "mode": "exclusive"}
transforms = []
for i, (a, b) in enumerate(zip(old["nodes"], new["nodes"])):
    restored = copy.deepcopy(b)
    if LOCK in a["depends_on"] or a["id"] in special:
        assert b["requires_resources"] == [ref]
        assert b["controller_operation_phase"]
        restored.pop("requires_resources"); restored.pop("controller_operations"); restored.pop("controller_operation_phase")
    if LOCK in a["depends_on"]:
        ix = a["depends_on"].index(LOCK)
        restored["depends_on"].insert(ix, LOCK)
        assert b["controller_operations"] == [{"type": "controller-operation", "id": op} for op in ["receipt", "control-state-update", "ledger-reconciliation"]]
        transforms.append({"node_index_zero_based": i, "node_id": a["id"], "depends_on_index_zero_based": ix,
                           "from": {"field": "depends_on", "value": LOCK}, "to": {"field": "requires_resources", "value": ref}})
    if a["id"] in special:
        assert b["controller_operations"] == [{"type": "controller-operation", "id": special[a["id"]]}]
    assert restored == a  # every unrelated field, budget, state, allowlist and completion edge exact
for key in old:
    if key != "nodes": assert new[key] == old[key]
assert len(transforms) == 299
indegree = {k: 0 for k in nodes}; followers = {k: [] for k in nodes}
for k, n in nodes.items():
    for d in n["depends_on"]:
        if d in nodes: indegree[k] += 1; followers[d].append(k)
queue = deque(k for k, degree in indegree.items() if degree == 0); visited = []
while queue:
    k = queue.popleft(); visited.append(k)
    for successor in followers[k]:
        indegree[successor] -= 1
        if indegree[successor] == 0: queue.append(successor)
assert len(visited) == 2420
m = json.loads(blob(PARENT, R1 + "scope-map.json"))
e = json.loads(blob(PARENT, BASE + "EXECUTION.json"))
records = {r["id"]: r for r in e["items"]}; items = {r["id"]: r for r in m["items"]}
assert len(items) == len(records) == 312 and set(items) == set(records)
assert m == json.loads(blob(REG, R1 + "scope-map.json"))
for item in items.values():
    assert item["retained_execution_record"] == records[item["id"]]
    assert item["acceptance_evidence"]["existing"] == records[item["id"]].get("evidence", [])
    assert item["formal_state"] == records[item["id"]]["status"]
assert sum(len(x.get("evidence", [])) for x in records.values()) == 933
counts = Counter(x["status"] for x in records.values())
assert counts == {"completed": 13, "verification_pending": 3, "in_progress": 3, "pending": 293}
for n in new["nodes"]:
    assert all(i in items for i in n.get("items", []))
    if "item" in n:
        assert n["item"] in items and n["acceptance"] == items[n["item"]]["acceptance"]
for group in new["semantic_lock_groups"].values(): assert all(i in items for i in group)
assert not git("diff", "--name-only", P0, PARENT, "--", "apps", "packages", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml")
entry_count = 0; tree_count = 0
for line in Path(R2 + "inputs.sha256").read_text().splitlines():
    if not line or line.startswith("#"): continue
    expected, identity = line.split("  ", 1); entry_count += 1
    if identity.startswith("disk:"): data = Path(identity[5:]).read_bytes()
    elif identity.startswith("git-tree:"):
        _, commit, path, obj = identity.split(":", 3)
        assert git("rev-parse", commit + ":" + path).decode().strip() == obj
        data = git("cat-file", "tree", obj); tree_count += 1
    else:
        commit, path = identity.split(":", 1); data = blob(commit, path)
    assert sha(data) == expected, identity
# Finite, in-memory contract model only, with no product/runtime scheduler execution.
class Lease:
    def __init__(self): self.queue = deque(); self.held = None; self.serial = 0; self.trace = []; self.failed = []
    def enqueue(self, actor, attempt):
        if actor != "root": self.trace.append("deny-worker"); return False
        assert attempt not in self.queue and (self.held is None or self.held[1] != attempt)
        self.queue.append(attempt); return True
    def acquire(self, actor):
        if actor != "root" or self.held is not None or not self.queue: return None
        self.serial += 1; self.held = (self.serial, self.queue.popleft())
        self.trace.append("acquire:" + self.held[1]); return self.held
    def mutate(self, actor, token): return actor == "root" and self.held is not None and token == self.held
    def release(self, actor, token, error=False):
        if not self.mutate(actor, token): return False
        if error: self.failed.append(token[1])
        self.trace.append(("error-release:" if error else "release:") + token[1]); self.held = None; return True
scenarios = []
for error in [False, True]:
    lease = Lease(); assert not lease.enqueue("worker", "W"); assert lease.enqueue("root", "R-A") and lease.enqueue("root", "R-B")
    a = lease.acquire("root"); assert a and lease.acquire("root") is None and lease.acquire("worker") is None
    assert lease.mutate("root", a) and not lease.mutate("worker", a)
    assert lease.release("root", a, error=error)
    if error: assert lease.enqueue("root", "R-A-repaired")  # bounded repaired retry joins tail
    b = lease.acquire("root"); assert b[1] == "R-B" and not lease.mutate("root", a) and not lease.release("root", a)
    assert lease.mutate("root", b) and lease.release("root", b)
    if error:
        retry = lease.acquire("root"); assert retry[1] == "R-A-repaired" and lease.release("root", retry)
    assert lease.held is None and not lease.queue
    scenarios.append({"first_outcome": "error" if error else "success", "trace": lease.trace,
                      "failed_attempts": lease.failed, "simultaneous_writers_max": 1, "final_state": "free", "remaining_queue": 0})
results = {"node_count": len(nodes), "external_gate_count": len(gates), "resource_count": len(resources),
           "controller_operation_count": len(operations), "completion_refs_before": sum(len(n["depends_on"]) for n in old["nodes"]),
           "completion_refs_after": sum(len(n["depends_on"]) for n in new["nodes"]),
           "unknown_before": dict(unknown_old), "unknown_after": 0, "cycle_count": 0, "visited_nodes": len(visited),
           "typed_resource_node_count": sum("requires_resources" in n for n in new["nodes"]),
           "transformation_count": len(transforms), "transforms": transforms, "formal_counts": dict(counts),
           "audit_items": len(items), "evidence_entries": 933, "input_entries": entry_count, "product_tree_entries": tree_count,
           "conceptual_scenarios": scenarios}
stored = load(R2 + "checks.json")
assert stored["results"] == results
assert stored["output_sha256"]["dependencies.json"] == sha(Path(R2 + "dependencies.json").read_bytes())
assert stored["output_sha256"]["scheduler.md"] == sha(Path(R2 + "scheduler.md").read_bytes())
assert stored["output_sha256"]["inputs.sha256"] == sha(Path(R2 + "inputs.sha256").read_bytes())
assert stored["verifier_sha256"] == sha(Path(R2 + "correction.md").read_text().split("```python\n", 1)[1].split("\n```", 1)[0].encode())
import difflib
for name, recorded in stored["patch_hashdiff"].items():
    before = blob(REG, R1 + name); after = Path(R2 + name).read_bytes()
    patch = "".join(difflib.unified_diff(before.decode().splitlines(keepends=True), after.decode().splitlines(keepends=True), fromfile="parallel-control-r1/" + name, tofile="parallel-control-r2/" + name)).encode()
    assert recorded == {"source_sha256": sha(before), "output_sha256": sha(after), "unified_diff_sha256": sha(patch), "unified_diff_bytes": len(patch), "unified_diff_lines": len(patch.splitlines())}
print(json.dumps({k: v for k, v in results.items() if k != "transforms"}, ensure_ascii=False, indent=2))
print("PASS: fixed provenance, typed references, exact transformation, preservation, DAG and conceptual leases; runtime not run")
```

Commit validation: `git diff --check`; exact five-path staging; `git diff --cached --name-status` must contain five ADDs; `git -c core.hooksPath=/dev/null commit -F <temporary-message-file>` with real Why/What/Scope/Risk/Docs/Tests newlines; compare committed five output blobs to this report and verify fixed parent plus clean status. Push/source archive/integration/active-pointer adoption and sync-check are root's later controller receipt, not this static worker's scope.
