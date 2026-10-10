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
