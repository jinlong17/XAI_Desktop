# Independent MAP-REVIEW2 — D-R1-01

Verdict: **APPROVED** for the exact five-file static correction at `11b8d721f9d423fcabb19857e96c927375b9323a`. D-R1-01's undefined resource-reference defect is resolved in that version. No new blocking finding was found. The immutable r1 review remains REVISE against r1. This verdict permits the sole controller to consider a separate adoption receipt; it neither adopts pointers nor accepts any product caller or audit item.

Date: 2026-10-10. Module: **web (project-system)**. Task: PARALLEL/MAP-REVIEW2, workflow D. Fresh independent reviewer `/root/parallel_d_map_review2`; not an earlier map author, corrector or reviewer. No children or repair. Requested role/model in the committed card is Astra/gpt-6-astra; this report does not independently attest the serving provider/model or claim cross-vendor evidence.

## Immutable scope and authority

- Review parent: `3eb262b3e45a0ae4658ed86a523473fdef75858a`; detached HEAD, initially clean.
- Only owned worktree: `/Users/lijinlong/.codex/worktrees/audit-parallel-map-review2-20261010/XAI_Desktop`.
- Authority: that parent's `parallel-control-r1/tasks-P3.json`, exact ID PARALLEL/MAP-REVIEW2; original goal attachment and authority overlay read first. Parent's controller dispatch supplies the actor/worktree without rewriting the registered card.
- Corrected source: `11b8d721f9d423fcabb19857e96c927375b9323a`; verified sole parent `fb95dd39117ca98a9b5a038a29b40d015936fe85`.
- Original review: `4ba9c44a60fe97eeee8d5489c320eaedf2e342cc`; original map: `7bb8df1631b94295bb7c3f928fcd9924b1337873`; original map input: `e041c2bc293b70db367444c62c4300231976dbf7`.
- Product P0: `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Product apps/packages and package/lock/workspace files are unchanged through the fixed review parent.
- Exactly two permitted additions: this report and `inputs.sha256`. No control/registry/ledger/canonical/r1/source/runner changes; no push, merge, rebase, release, deployment, package/browser/native/product runtime, diagnostic probe, cleanup or other-worktree access.
- Review cost: **iteration 2/3 consumed**, one bounded static review pass; next review, if needed, is **3/3**, not a reset. Runtime and probe counts: **0**. Original Clock/caller budgets remain unchanged.
- Input index: **95/95 identities verified**, SHA-256 `058065c8f3bb35878b44676cd18bc7da779600340e86026ffac1f983be6c3135`. This includes all 84 correction inputs, the exact five corrected outputs and six fixed-parent authority/card/rule blobs. All eleven original source-manifest identities were independently recomputed too. Memory navigation supplied no verdict evidence.

## Exact source and patch identity

The source commit contains exactly five ADDs under `parallel-control-r2/`; every resulting blob equals the corresponding blob at the fixed review parent and its initial worktree bytes. No original artifact is overwritten.

| Source output | Verified SHA-256 |
| --- | --- |
| checks.json | daa355ede3fa0fc022c0dd79896d443a9e2bcf25389b142046a376fccb0e3c00 |
| correction.md | 8fa7f3a1266bed0ca50f1e5d173038ea83cf6038e66be839cdc6fa332dd04f0d |
| dependencies.json | d36e93284d069015129fa78afb24264da1730d636d5893453b2e72d8de110984 |
| inputs.sha256 | 16e656ec832b1a86aa69f10ef7b0d7717f906e0e47ae2893034eba5688e7b3b2 |
| scheduler.md | b77b8dd703868c3cda270ab5bd1521465393adb0702a04d3381ee570ea73f7b4 |

Raw source commit-object SHA-256: `3ea9d4c8a6498eddf7e3527d0d47182c0e7a24b8005998d8266e3696d21cdd39`. Complete `git diff 11b8d72^ 11b8d72 --binary --full-index` SHA-256: `1c4e0dae4cf60ed3830eb88dfadaf7c44250cf23d5825ff26f32807bb2ffc56e` (use full refs above for reproduction). These supplement immutable Git identity.

The independently reconstructed, timestamp-free r1→r2 unified patches match checks.json, including byte/line counts: dependencies `30c794f5a97699827317a3040944f22702e79a85452ba8dfe8c6777a01982893`; scheduler `82431f00955ae09bea898daa5e7910d91fcc555b28f93e7f97c80a2867e91f9a`. The embedded author verifier digest also matches `9ee5a478507aae3c5a1fb325b7cad384a0fbf862713c04efbdc3958ed0375f6e`. The independent comparison below was used instead of executing or trusting that embedded verifier.

## D-R1-01 acceptance, with exact source lines

All line citations in this section refer to corrected source `11b8d721f9d423fcabb19857e96c927375b9323a`, under `docs/reviews/20260908-full-product-audit/parallel-control-r2/`. The original finding and acceptance are preserved at original review `review.md:19–29`.

| Requirement | Review result and source evidence |
| --- | --- |
| Typed, complete references | **PASS.** dependencies.json:83242–83278 defines completion, resource, operation and item namespaces. Completion strings target only tasks/gates; objects have exact resource/operation keys. All references were traversed; unknown count **0**; namespaces disjoint. |
| Preserve all nodes and original edges | **PASS.** Ordered 2,420 IDs equal r1. All 299 original lock entries are restored at their original dependency indexes after removing only the declared additive fields; every resulting node deep-equals r1. Every pre-existing non-node top-level field also deep-equals r1. Completion refs **2,565→2,266**, exactly 299 typed moves. |
| Recurring exclusive resource | **PASS.** dependencies.json:83280–83314 declares capacity one, fixed root identity, finite deadline/token, FIFO and non-completion semantics. 302 nodes explicitly require it: 299 reconcile nodes plus three special Clock nodes. Resource never becomes a permanently satisfied gate. |
| Clock root operations | **PASS.** ADOPT-M resource/operation/phase at dependencies.json:82917–82930; B1 at 82997–83024; LEDGER at 83091–83118. scheduler.md:25 preserves worker addendum authorship while reserving reviewed-hash adoption to root. A/D responsibility labels do not create another controller. |
| Every global mutation, including outside DAG | **PASS.** Ten root-owned operation declarations at dependencies.json:83317–83438; mandatory default at 83439–83454. scheduler.md:27 requires the union of node, operation and default resource requirements, covering receipt, source-ref preservation, sibling integration, state/registry/budget, ledger, method/baseline/map adoption and unspecified global mutations. No node omission bypasses the default. |
| Success/error/cancel release | **PASS.** dependencies.json:83305–83312 and scheduler.md:33 require whole-operation serialization, matching live-token checks, durable outcome/failure facts and finally release. Failed attempts cannot mark completion and repaired retries join the tail within inherited budget. |
| Crash fencing and uncertain partial state | **PASS as a contract.** dependencies.json:83309–83310; scheduler.md:35: release then quarantine uncertain affected state; prove independence before unrelated continuation. Deadline fences stale tokens; no timeout-only takeover. Recovery must prove old writer stopped and reconcile journal before granting again. No claim of successful rollback or automatic recovery. |
| Two-ready fairness and no self-deadlock | **PASS as a finite conceptual argument.** scheduler.md:31–39; dependencies.json:83290–83297,83311–83314. Other resources and prerequisites are ready before acquisition; no held-lease dependency/reviewer/retry waits. FIFO plus finite transactions and tail retries yields B after A's success/error. Explicit external quarantine remains conditional, not a false global liveness guarantee. |
| Completion DAG | **PASS.** Independent strict validation precedes Kahn traversal; all **2,420** nodes visited, no cycle. Resources never enter the completion graph. All **36** external gates remain ordered and unchanged. |
| Obligations, modules, evidence and budgets | **PASS.** Full comparisons below, reverse node equality and byte-identical original scheduler body. scheduler.md:9–19 preserves original rules; lines 3,43 preserve original failure and review/caller counters, independent review and sole-root adoption. |
| No runtime or self-adoption claim | **PASS.** scheduler.md:3,35,39,43; correction.md:3,25–29,49–53. Review approval is for this static source only. No implementation, operational lock service, product acceptance or current-pointer mutation is inferred. |

The default is a **policy requirement**, not an implemented enforcement hook. The review does not demonstrate actual concurrent-process exclusion, durable journaling, crash recovery or live scheduling. Those would require their own scoped implementation and runtime verification if an automated scheduler is introduced.

## Full 312 obligations and evidence preservation

The review compared every item, not samples. TODO, current checklist, scope map and EXECUTION have the same **312 unique IDs**. All current checklist priority/kind/action/acceptance fields match the mapped obligations, including the textual functional-pass/cross-tool-pending state distinction. All original TODO scalar fields are preserved except the **39 already-existing module-key normalizations**; each original module remains exact in original_module. Every full retained execution record and ordered evidence array matches EXECUTION.

| Exhaustive check | Result |
| --- | --- |
| Current checklist rows/action/acceptance/status | 312/312 exact |
| Original TODO task fields including gate/source | 312/312 preserved, except documented existing module-key normalization |
| Complete retained execution records | 312/312 deep-equal |
| Ordered existing evidence | 933/933 preserved |
| Formal states | 13 completed; 3 verification_pending; 3 in_progress; 293 pending; 299 unclosed |
| Primary responsibility | A 29; B 117; C 126; D 40 |
| Map generic task references | 2,405/2,405 exact identity equality with item-linked DAG nodes |
| Special Clock chain | All 15 nodes/unchanged completion prerequisites retained |
| Scope maps and all three formal ledgers | Byte-identical at original map, corrected source and review parent |
| All 2,420 node fields | Reverse-transform deep equality; no readiness/budget/allowlist/action/acceptance weakening |
| Original scheduler rules | Entire original scheduler text remains an exact contiguous body in r2 |

Thus the M→G→B/recovery chain, Clock caller requirements, existing owner decisions, semantic conflict discovery, gate-dependent future work, external credentials/hardware/vendor limitations and original unit budgets retain their original bindings. This review does not repeat historical product verification or mark a caller/item completed. No source, canonical contract, proposal, runner or failure history was changed by this correction.

## Independent finite scenario analysis

These are transitions derived from the explicit contract, not product execution or a test of an implemented mutex. The author model was inspected: its two traces model success/error release and stale-token rejection, but omit actual deadlines, crashes, journals and quarantine. Approval of those latter requirements rests on the explicit source contract above, not on overstating that model's coverage.

| Starting condition / event | Required transition and consequence |
| --- | --- |
| Ready A then ready B | Queue [A,B]. Root atomically obtains T-A; worker, second-holder and reentrant acquisition denied. B remains queued; no simultaneous writer. |
| A succeeds | Record result/provenance; finally release T-A. Wake B; grant distinct T-B. Completed A has no continuing resource ownership. |
| A errors or is cancelled | Freeze failed A, retain failure/partial facts, finally release. Independent B is next. A cannot complete its task from this outcome. |
| A repaired after error | With remaining original budget, A rejoins tail after B. No synchronous retry retains T-A or bypasses B. |
| Released/expired T-A acts after B grant | Matching-live-token requirement rejects both mutation and release of T-B. |
| A leaves uncertain partial state | Release token and quarantine affected operations. B proceeds only if proven independent; if affected, B's explicit external blocker is retained. No fabricated rollback. |
| Root crashes/deadline expires | Fence T-A; no expiry-only takeover. Recovery proves old writer stopped and reconciles journal before a new grant. Unrecoverable state remains disclosed blocked. |
| A prerequisite/other resource is unavailable | A is outside eligible lease queue; no waiting under root lease. Ready B is not held behind an acquired A lease. |

Conditional liveness is precise: with finite predecessor operations and recoverable external state, FIFO serves persistently eligible B. No contract can promise progress past an unresolved external quarantine; the source explicitly avoids that promise.

## Reproducible independent static comparison

The following is the actual successful independent comparison body. Run it as Python standard-library code in a clean isolated checkout of the fixed review parent `3eb262b3e45a0ae4658ed86a523473fdef75858a`, where the original attachment remains readable. It intentionally rejects a different HEAD or a dirty checkout. It reads Git blobs and does not start the product, package tools, browser, native runner or any child. Additional read-only checks verified 2,405 map-task refs, all eleven source-manifest entries and this report's complete 95-entry input index.

An early schema-inspection command assumed TODO had a top-level items field and returned KeyError; inspection established sections[].tasks before this comparison was run. This was a reader construction error, not a product failure or a separate formal diagnostic iteration. The comparison below completed once with exit 0; no failed product evidence was overwritten.

```python
import subprocess as sp,json,hashlib,re,copy,difflib
from pathlib import Path
from collections import Counter,deque
R='7bb8df1631b94295bb7c3f928fcd9924b1337873'; S='11b8d721f9d423fcabb19857e96c927375b9323a'; P='3eb262b3e45a0ae4658ed86a523473fdef75858a'
B='docs/reviews/20260908-full-product-audit/'; A=B+'parallel-control-r1/'; C=B+'parallel-control-r2/'
def git(*a):return sp.check_output(['git',*a])
def blob(r,p):return git('show',r+':'+p)
def h(v):return hashlib.sha256(v).hexdigest()
def js(r,p):return json.loads(blob(r,p))
assert git('rev-parse','HEAD').decode().strip()==P
assert not git('status','--porcelain')
assert git('rev-parse',S+'^').decode().strip()=='fb95dd39117ca98a9b5a038a29b40d015936fe85'
paths=['checks.json','correction.md','dependencies.json','inputs.sha256','scheduler.md']
expected=sorted('A\t'+C+p for p in paths)
assert sorted(git('diff-tree','--no-commit-id','--name-status','-r',S).decode().splitlines())==expected
for p in paths:assert blob(S,C+p)==blob(P,C+p)==Path(C+p).read_bytes()
inputs=[]
for l in blob(S,C+'inputs.sha256').decode().splitlines():
 if not l or l.startswith('#'):continue
 digest,key=l.split('  ',1)
 if key.startswith('disk:'):raw=Path(key[5:]).read_bytes()
 elif key.startswith('git-tree:'):
  _,ref,path,oid=key.split(':',3);assert git('rev-parse',ref+':'+path).decode().strip()==oid;raw=git('cat-file','tree',oid)
 else:ref,path=key.split(':',1);raw=blob(ref,path)
 assert h(raw)==digest,key
 inputs.append(key)
assert len(inputs)==len(set(inputs))==84
old=js(R,A+'dependencies.json');new=js(S,C+'dependencies.json');checks=js(S,C+'checks.json')
N={n['id']:n for n in new['nodes']}; gates=new['external_gate_nodes'];res=new['resources'];ops=new['controller_operations']
assert len(N)==len(new['nodes'])==2420
assert [n['id'] for n in old['nodes']]==list(N)
assert len(gates)==len(set(gates))==36 and gates==old['external_gate_nodes']
spaces=[set(N),set(gates),{r['id'] for r in res},{o['id'] for o in ops}]
assert all(not spaces[i]&spaces[j] for i in range(4) for j in range(i))
assert len(res)==len(spaces[2])==1 and len(ops)==len(spaces[3])==10
lock='controller-receipt-lock';rr=[dict(type='resource',id=lock,mode='exclusive')]
special={'CLOCK/ADOPT-M':'method-adoption','CLOCK/B1':'baseline-adoption','CLOCK/LEDGER':'ledger-reconciliation'}
transforms=[]
for i,(o,n) in enumerate(zip(old['nodes'],new['nodes'])):
 restored=copy.deepcopy(n)
 assert isinstance(n['depends_on'],list) and all(type(d)==str and d in spaces[0]|spaces[1] for d in n['depends_on'])
 assert len(n['depends_on'])==len(set(n['depends_on']))
 affected=lock in o['depends_on'] or o['id'] in special
 if affected:
  assert n['requires_resources']==rr and type(n['controller_operation_phase'])==str
  expectedops=['receipt','control-state-update','ledger-reconciliation'] if lock in o['depends_on'] else [special[o['id']]]
  assert n['controller_operations']==[dict(type='controller-operation',id=x) for x in expectedops]
  for k in ['requires_resources','controller_operations','controller_operation_phase']:restored.pop(k)
 if lock in o['depends_on']:
  idx=o['depends_on'].index(lock);restored['depends_on'].insert(idx,lock)
  transforms.append(dict(node_index_zero_based=i,node_id=o['id'],depends_on_index_zero_based=idx,**{'from':dict(field='depends_on',value=lock),'to':dict(field='requires_resources',value=rr[0])}))
 assert restored==o,o['id']
for k in old:
 if k!='nodes':assert old[k]==new[k],k
assert checks['results']['transforms']==transforms and len(transforms)==299
assert sum('requires_resources' in n for n in new['nodes'])==302
for o in ops:assert o['type']=='controller-operation' and o['owner']=='sole-root-controller' and o['requires_resources']==rr
default=new['root_global_mutation_default'];assert default['requires_resources']==rr and default['default_is_mandatory'] is True
assert default['operation']==dict(type='controller-operation',id='root-global-mutation') and default['owner']=='sole-root-controller'
assert res[0]['capacity']==1 and res[0]['completion_gate'] is False and res[0]['owner']=='sole-root-controller'
indegree={k:0 for k in N};followers={k:[] for k in N}
for k,n in N.items():
 for d in n['depends_on']:
  if d in N:indegree[k]+=1;followers[d].append(k)
q=deque(k for k,v in indegree.items() if not v);visited=[]
while q:
 k=q.popleft();visited.append(k)
 for f in followers[k]:
  indegree[f]-=1
  if not indegree[f]:q.append(f)
assert len(visited)==2420
m=js(R,A+'scope-map.json');ex=js(R,B+'EXECUTION.json');todo=js(R,B+'TODO.json')
M={x['id']:x for x in m['items']};E={x['id']:x for x in ex['items']};T={t['id']:t for s in todo['sections'] for t in s['tasks']}
assert len(M)==len(m['items'])==len(E)==len(ex['items'])==len(T)==312 and set(M)==set(E)==set(T)
for r in [S,P]:
 for p in [A+'scope-map.json',A+'scope-map.md',B+'ALL-TODO-CURRENT.md',B+'EXECUTION.json',B+'EXECUTION.md',B+'TODO.json']:
  assert blob(r,p)==blob(R,p),p
normal=0
for k,x in M.items():
 assert x['retained_execution_record']==E[k]
 assert x['acceptance_evidence']['existing']==E[k].get('evidence',[])
 assert x['formal_state']==E[k]['status']
 assert x['acceptance_evidence']['business_acceptance']==x['acceptance']
 for field,value in T[k].items():
  if field=='module':
   assert x['original_module']==value
   normal+=int(x['module']!=value)
  else:assert x[field]==value,(k,field)
rows=re.findall(r'^- \[([ x])\] \*\*([A-Z]+-\d+) · (.+?) · (P\d) · (.+?)\*\*：(.*?)。验收：(.*?)。$',blob(R,B+'ALL-TODO-CURRENT.md').decode(),re.M)
assert len(rows)==len({r[1] for r in rows})==312
for check,k,state,priority,kind,action,acceptance in rows:
 x=M[k];assert [x[f] for f in ['priority','kind','action','acceptance']]==[priority,kind,action,acceptance],k
 assert (check=='x')==(x['formal_state']=='completed')
 prefixes={'completed':'已完成','verification_pending':'待完成验收','in_progress':'进行中','pending':'待处理／尚未核销'}
 assert state.startswith(prefixes[x['formal_state']])
for n in N.values():
 for item in n.get('items',[]):assert item in M
 if 'item' in n:assert n['item'] in M and n['acceptance']==M[n['item']]['acceptance']
for group in new['semantic_lock_groups'].values():assert all(k in M for k in group)
assert Counter(v['status'] for v in E.values())==dict(completed=13,verification_pending=3,in_progress=3,pending=293)
assert sum(len(v.get('evidence',[])) for v in E.values())==933
for name,record in checks['patch_hashdiff'].items():
 before=blob(R,A+name);after=blob(S,C+name)
 patch=''.join(difflib.unified_diff(before.decode().splitlines(True),after.decode().splitlines(True),fromfile='parallel-control-r1/'+name,tofile='parallel-control-r2/'+name)).encode()
 assert record==dict(source_sha256=h(before),output_sha256=h(after),unified_diff_sha256=h(patch),unified_diff_bytes=len(patch),unified_diff_lines=len(patch.splitlines()))
for name,digest in checks['output_sha256'].items():assert h(blob(S,C+name))==digest
code=blob(S,C+'correction.md').decode().split('```python\n',1)[1].split('\n```',1)[0];assert h(code.encode())==checks['verifier_sha256']
s1=blob(R,A+'scheduler.md').decode();s2=blob(S,C+'scheduler.md').decode();assert s1.strip() in s2
assert not git('diff','--name-only','f9eb4b1f207bc4b46f547b90afc250424b3c8695',P,'--','apps','packages','package.json','pnpm-lock.yaml','pnpm-workspace.yaml')
print(json.dumps(dict(verdict='ALL_STATIC_IDENTITY_ASSERTIONS_PASS',source_parent=git('rev-parse',S+'^').decode().strip(),input_hashes=84,output_adds=5,node_count=2420,gate_count=36,completion_before=sum(len(n['depends_on']) for n in old['nodes']),completion_after=sum(len(n['depends_on']) for n in N.values()),moves=len(transforms),resource_nodes=302,resources=1,operations=10,unknown_references=0,acyclic_visited=len(visited),audit_rows=len(rows),evidence=933,module_normalizations=normal,formal_counts=dict(Counter(v['status'] for v in E.values())),primary_workflows=dict(Counter(v['primary_workflow'] for v in M.values())),output_hashes={name:h(blob(S,C+name)) for name in paths}),indent=2))
```

Observed: **ALL_STATIC_IDENTITY_ASSERTIONS_PASS**, 84 inputs, five source ADDs, 2,420 nodes, 36 gates, 299 typed moves, 302 resource-bound nodes, one recurring resource, ten operations, zero unknown refs, 2,420 acyclic visits, 312 rows and 933 evidence entries.

## Closeout and next authority

This reviewer adds and commits only the two registered output paths. Whitespace/scope and clean post-commit checks are required in the immutable Git receipt; the final commit SHA and output hashes are supplied to root outside this self-referential report. The sole commit uses per-command `core.hooksPath=/dev/null` to avoid unauthorized hook dispatch, without persistent configuration changes.

**Next:** sole root verifies this source/report parent, exact output paths and hashes, preserves/receives the source and review, then may explicitly adopt the exact approved map/scheduler version in a separate serialized controller receipt. Root owns remote push/ancestry/sync-check and any state publication. This report performs none of those actions. Review family is now 2/3; if a further review is necessary, next is 3/3. Formal 13/312 completed and 299 unclosed remain unchanged.
