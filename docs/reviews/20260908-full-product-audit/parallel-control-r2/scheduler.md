# r2 recurring controller resource — UNACCEPTED

Module: web (project-system). This is the narrow D-R1-01 resource correction, awaiting fresh independent review 2/3. r1 remains the active pointer until sole root receives the exact corrected commit and independent verdict and explicitly adopts r2 under the resource. Creating this directory, a static PASS, or a worker's report cannot adopt it. Original r1 review 1/3 remains REVISE, with its original source/hash/failure. No runtime scheduler is implemented by these documents.

The eleven original scheduling rules below remain binding, byte-for-byte. The appended resource contract supplies the machine-readable meaning of their existing single-writer requirement; it does not alter registration, product/readiness gates, task budgets or scope.

# 唯一总控调度规则

1. root管理完整goal；A/B/C/D是工作流责任分区，worker只有一个固定任务，无全局写权。总控仅读、排程、核对、接收提交、同步状态、启动任务；不直接修产品、runner或测试。
2. 当前runtime总槽4，root占1，最多3worker。公平轮转，Clock前置与已ready实现优先；保留C准备和D独立验收机会，局部blocked不全局停止。每次fill空槽扫描四流ready队列和外部条件；禁止把拆分完成当目标完成。
3. 派发前：fresh status/refs/actor清单，提交task card；pin registration/parent/product/evidence SHA+hash、允许具体路径、read/write+逻辑锁、acceptance、单位迭代预算和stop。必要worktree独立创建，永不移用其他会话树。后继不静默改父输入。每same caller各阶段使用fresh actor，reviewer不修复。
4. 所有任务节点仅是全范围排程义务；空allowed_files不是广泛授权。implementation_ready必须有被独立审查的exact contract、有效before、全部模块/产品行为gate、读写冲突核对和有限成本；未知scope留prepare。
5. 每任务最多3 formal iterations按永久caller/unit记录含refusal；probe另记。受审查后自动派独立corrector与fresh verifier，计数跨actor/filename/worktree继承。触顶/无路径freeze原证据并blocked该节点，继续其他ready队列。未知dirty只隔离相关树，疑似全局共享状态污染则暂停相关资源并审查。
6. 收到结果root串行核验parent、exact paths、clean、hash全部覆盖、raw/预条件/成本、影响矩阵与抽查截图。先保全原提交到codex/archive远端ref并核对祖先。能够ff则git cherry-pick --ff；并行兄弟导致非ff时，仅对已核验且无逻辑冲突的精确提交普通git cherry-pick，记录sourceSHA→integrationSHA与相同patch/hash，禁止merge/rebase。这是新并行授权的必要接收技术修订，不扩大产品范围。冲突不由root修，保全源commit，abort并另派独立integration作者。
7. 即使兄弟提交只是docs也重新校验对固定输入的证明，不把新控制HEAD当输入；产品更改的proof只适用冻结product SHA，受影响组合必须另固定integrated SHA独立回归/acceptance，不能凭单树绿整合通过。
8. 控制面每实际接收批次一次合并更新；三台账仅caller acceptance后证据append，正式counts/states不变。不自动suggest→completed。日志、预算、失败、证据与model配置/非attestation分列。
9. 精确stage，Why/What/Scope/Risk/Docs/Tests提交；control push、remote ancestry及normal sync-check。cleanup前deep保留既有五unreachable和23stash，normal绿≠deep绿。只archive本聊天新建own worktree，不能删除恢复状态求绿。
10. 不merge/rebase/dev/main/web/promote/deploy/release/D3；site/sync/具体paused插件、新长期分支仍gate。没有规则的产品行为集中最小问题；已确认MGB/W1/C1/F2/R1不重复问。外部凭据/硬件/vendor/发布缺口明确保留，不声称自动全部可完成。
11. 每三accepted batch做成本周期；每次交接/简洁进度给四流状态、accepted SHA、blocked+下一ready、formal312counts、实际worker/slot数及formal/probe返工成本。持续推进完整goal，保存下一任务，不因单Clock阻塞终止全局工作。

## Typed references and admission

`dependencies.json.reference_schema` types legacy `depends_on` strings as completion references exclusively to declared task IDs or external gate IDs. `requires_resources` contains explicit `{type: resource, id: controller-receipt-lock, mode: exclusive}` references to `resources`. These namespaces are disjoint. Unknown targets fail closed; a resource is never resolved as a completed task/gate or ignored. Completion DAG readiness and resource admission are separate checks. Keep all completion prerequisites and business gates before attempting an acquisition.

The 299 generic reconcile nodes each require the resource and root receipt/control/ledger operations. `CLOCK/ADOPT-M`, `CLOCK/B1` and `CLOCK/LEDGER` each have explicit resource and operation links. CLOCK/B1 retains its worker-authored versioned addendum; its controller-operation phase is root's adoption of reviewed hashes. Workers cannot acquire the resource to author an addendum or mutate global pointers. `workflow: A/D` retains responsibility and is never controller identity or an authority grant.

For any selected controller operation, compute required resources as the union of node `requires_resources`, the declared operation's `requires_resources` and `root_global_mutation_default.requires_resources`. The default is mandatory for every global mutation, including operations outside the DAG or lacking a resource list: receipt, source ref preservation, integration/cherry-pick, control/registry/state/budget, three ledgers, method/baseline/map adoption. This covers other workflows' results as well as Clock. It grants no new authorization for product, Git external actions or worker writes. Semantic read/write conflicts and module gates remain separate prerequisites; worktree isolation does not waive them.

## Recurring exclusive acquisition and release

Only the fixed sole root session can enqueue/acquire. Root queues eligible finite operations FIFO, after dependencies, unchanged acceptance/authorization and immutable input/ownership checks; prerequisites blocked on a worker/review/gate remain outside the lease queue. Requests identify operation and attempt; only one outstanding request per attempt. Atomic free-to-held acquisition grants one root operation a unique fencing token and finite deadline. Every mutation checks the live token. Deny workers, second concurrent requests, reentrancy and stale tokens. Capacity is one; do not delegate the held token or root authority to a worker.

Acquire only when all other required resources are immediately available. Never wait on another resource, worker, review or retry while holding this lease. Each bounded transaction includes all its global side effects/provenance; release in finally after success, exception or cancellation, durably retaining the outcome, original failure and any partial-state facts. Success advances completion according to unchanged acceptance; failure freezes the attempt and cannot mark a task/gate complete. Wake the oldest eligible request. A repaired retry uses remaining original budget and joins the tail; it cannot monopolize the head through synchronous retries. A completed receipt does not retain the resource for the next receipt.

On uncertain partial state, release the active token and quarantine affected operations for independent recovery review. Proven independent operations can continue; never invent successful rollback. On root crash/deadline, fence the old token and preserve the journal. Expiry alone cannot grant another writer: root recovery must prove the previous writer stopped and reconcile partial state before returning to free. Quarantine is an explicit external blocker, not an active permanently-held token or a permanently completed lock. Availability/liveness is conditional on finite transactions and recoverable external state; no document claims automatic recovery from an unresolvable failure.

## Two ready receipts and error fairness

With two eligible receipts R-A and R-B, enqueue A then B. Root acquires token T-A; B remains queued and every worker/second acquisition is denied. After A succeeds, finally releases T-A, and B acquires fresh T-B. If A throws, preserve its failure, freeze A, finally release T-A, then permit independent B. If A is later independently repaired and has budget, requeue A after B. Expired/released T-A cannot mutate or release B's lease. No completion prerequisite is awaited under the lease, so these two finite ready requests cannot block each other or obtain simultaneous writers. The bounded standard-library conceptual assertions in checks.json/correction.md prove this contract; they do not attest to an implemented scheduler.

## Review and adoption

The one bounded correction pass has zero browser/native/runtime/package/probe invocations. Existing formal Clock Q1 focus 1/3, six others 0/3, development 2/83, B70 and exhausted visual 3/3 remain unchanged. PARALLEL/MAP review iteration 1 is consumed; next fresh independent reviewer is 2/3, regardless of actor/worktree/r2 naming. Root alone preserves source remotely, receives the exact five ADD files, checks fixed parent/hash/provenance, obtains the fresh verdict and adopts active pointers in a separate controller receipt under a fresh resource lease. This author neither self-accepts nor updates registry/control/ledgers.
