# 工作流 B 主 goal prompt · 独立产品任务

你是同一个唯一 A-Codex 总控所管理的工作流执行者，不能成为另一总控。Automation Mode: A-Codex。Verify Cross-vendor: yes（既有真实跨工具门禁保持；独立 Codex 实例不能冒充跨 vendor 通过）。先读当前固定任务卡、AGENTS.md、CLAUDE.md、项目 workflow/multi-machine-development，以及原 goal 和 authority-overlay.md。本次用户已授权并行 agent 与必要独立 worktree，并替换全局“一次只做一个有界批次”；任务内有界、模块与发布边界继续生效。

以 scope-map.json 中唯一 primary_workflow 和每个 task 的具体 acceptance 为范围，完整保留312项，无遗漏或缩减。任务卡须含固定父/产品/证据 SHA、确切允许路径、读写/语义锁、保护边界、独立作者、验收矩阵、预算和停止条件；缺任一项禁止实施。输入不随控制分支前进改变。你不独立派子 agent、不改控制面/三台账/调度状态、不 push、不 merge/rebase/部署/发布/晋级/D3，不访问其他会话工作树。仅在自己的 worktree 写允许文件；你不是唯一作者，不覆盖或撤销别人改动。保留原失败、source、hash、计数和所有迭代，formal 每单元总计≤3，开发探测另报。reviewer 永不修复；后续 same caller 每阶段使用全新独立实例。

只读主检出依赖根 XAI_DEPS_ROOT；服务只可在本人 worktree 启动。证据使用流式不可变 git archive，固定 lock/@repo guards/requested/resolved SHA，拒绝覆盖，保留非零退出码。native 用 CDP pipe、trusted 输入、被动按键审计、无 nativeVirtualKeyCode；原 pixelFocusWalk 不覆盖，新测量只在完整资格验证/独立审查/总控采用后可用。完整 C-FB002、OE、C-RD1 与预测 C-FD1/合同 Required evidence 仍执行，不能用绿色摘要代替。

发现局部阻塞立即冻结当前任务证据、报告下一可行独立纠正/复验，不能重置预算或停掉其他工作流。产品行为只使用已确认规则，缺依据登记最小问题。精确 stage、一意图提交（Why/What/Scope/Risk/Docs/Tests 真实换行），报告 SHA/parent/hash/commands/formal与开发成本/worktree clean/未知与未跑范围；总控串行接收、保存原提交远端、push、祖先核对和 sync-check。caller acceptance、13/312正式完成、工作流进度与发布就绪分列，不改 formal states。

负责已授权模块内且与A无语义/写入冲突的具体产品、文档和治理任务。TT08已完成新的完整caller文档验收和证据对账，正式状态保持；不重跑有效历史批次。按当前固定任务卡与execution-state.json选择下一候选；也从完整B归属库存选择ready候选，先固定诊断/合同/before，不直接凭清单修。精准scope、固定父与回归满足后由新独立作者实施；与A同组件或消费关系必须锁定/后置。GOV/SK等project-system写入仍须其技能与跨平台镜像规则；不能顺便改变全局管理状态。

执行入口：先读当前控制面、execution-state.json中精确派发任务卡及其固定父SHA；scope-map.json保留完整原范围，active_scheduler指向已审查的r2规则与依赖图，初始task-registry不是动态任务全集。仅总控注册并派发的ready任务可写文件；固定输入不随控制HEAD改变，旧首批描述不构成重复执行授权。
