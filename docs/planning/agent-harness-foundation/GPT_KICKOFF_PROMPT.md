# GPT 开工 Prompt：多 Harness 后台执行基座（Astra 先统筹与全面分析）

> 用途：把下面全文交给 GPT 会话。本轮 GPT 的任务是**统筹与全面分析**，不是实施。
> 文档位置：`docs/planning/agent-harness-foundation/`，分支 `claude/web/agent-harness-foundation-review-20260909`（自 `codex/web/agent-harness-foundation-design-20260909` 的 `43798a6` 分出）。
> 创建：2026-09-11，Claude Code 按用户要求整理。

---

# 默认模型协作分工

除非项目规则或用户明确指定，否则按以下方式组织复杂任务：

- Astra：负责需求澄清、架构审查、风险分析、实施方案、验收标准、独立复核与最终结论。
- Terra：负责按已确认方案实施功能、修复缺陷、补充测试、运行验证，并提交可审查的变更。
- Sol：负责复杂实现、调试、故障定位和独立验证。
- Luna：负责快速搜索、代码定位、轻量测试、日志整理和文档维护。

执行规则：

1. 实施前先由 Astra 明确目标、范围、验收条件和不应触碰的边界。
2. Terra 或 Sol 的实现完成后，必须由未参与实现的一方独立复核。
3. 不把“测试通过”直接等同于“需求完成”；需要核对测试覆盖的真实业务条件。
4. 每个可验证批次使用精确文件提交，避免混入其他任务的工作区改动。
5. 有项目级 AGENTS.md、CLAUDE.md 或发布门禁时，以项目规则为准。
6. 涉及生产部署、外部账号、真实数据删除、密钥或付款时，先完成可审查准备，再由用户决定最终外部动作。

---

## 一、本轮只由 Astra 执行：统筹与全面分析

本轮**只有 Astra 工作**。不启动 Terra / Sol 实施，不创建 fork，不安装或运行任何 Harness，不调用付费模型，不部署服务，不修改运行时代码。Luna 可按需做搜索与文档整理，但产出仍由 Astra 汇总并署名。

Astra 的目标：把已有三份文档与用户最新决策合成为**一份可执行的统筹方案**，找出矛盾、缺口与风险，给出实施组织方式，然后停下等待用户确认。

## 二、先读（按顺序）

1. `CLAUDE.md`、`AGENTS.md`、`docs/workflow/project/workflow.md`、`docs/workflow/project/multi-machine-development.md`。
2. `docs/PRODUCT_MODULE_MAP.md`、`docs/MODULE_BOUNDARIES.md`、`docs/adr/0013-branch-sync-governance.md`。
3. `docs/planning/agent-harness-foundation/PROPOSAL.md`（全文；Codex 原方案 + 标有【Claude 修订】的调整，§19 有修订记录）。
4. `docs/planning/agent-harness-foundation/CLAUDE_REVIEW.md`（19 项 findings + F-20 决策记录、四套能力矩阵、简化架构、S1 切片、待澄清问题）。
5. `docs/planning/agent-harness-foundation/CLAUDE_REVIEW_PROMPT.md`（Claude 审查任务书，了解审查边界）。
6. `docs/vendor-cards/codebase-explorer.md`（本仓库 vendor card 的 R-1/R-2/R-3 格式）。

先执行 `pwd`、`git status --short --branch`、`git log --oneline -5`、`git worktree list`。若当前目录有他人 dirty 文件，不要切分支、不要清理、不要提交别人的工作；在独立 worktree 检出评审分支或自己的短分支。

## 三、用户已确认、不得缩减的目标（USER-CONFIRMED）

1. Codex、DeepSeek Harness、OpenCode、Pi 四套都在用户自主管理的后台独立部署、独立跑通真实任务，作为多平台共同基座。
2. 不是四选一，不是模型 API 切换，不是聊天组件的 provider 下拉框。
3. 先脱离 XAI UI 跑通，再统一适配、切换、业务接入。
4. 不要求常驻、不要求共享内部循环；要求独立部署、可监督、可停止、可升级、统一对外能力。
5. 不把统一基座解释成所有确定性业务都过 LLM。
6. 不承诺执行中状态跨 Harness 无损迁移；切换分 L0/L1/L2（PROPOSAL §8.3）。
7. 第五、第六套 Harness 通过明确扩展边界加入。
8. **（2026-09-11 新增）L3.5 与 L4 都做，一开始就做：四套全部 fork 并安装好、各自独立运行跑通；后续多人并行、独立地做深度优化定制，因此需要每套独立的开发文件夹与构建/路由开关。** 详见 PROPOSAL §13.4。姊妹项目 A2K（`Any2Knowledge_Agent_System`，commit `be61e726` §8.5）中“默认不 fork”的默认值已被用户否定；本仓库文档已按新决策改写，A2K 侧需另行同步。

## 四、Astra 必须产出的内容

在 `docs/planning/agent-harness-foundation/ASTRA_COORDINATION.md` 输出（新文件，不改写 PROPOSAL/CLAUDE_REVIEW 的原文；需要修订处以“【Astra 修订 <日期>】”追加）：

1. **目标复述与一致性核对**：三份文档与第三节八条目标之间的矛盾清单；每条给出裁决与依据。
2. **架构与阶段的最终统筹**：以 CLAUDE_REVIEW §4（MCP ToolBroker、容器为安全边界、单进程 Agent Service 在 P3 才出现）与 PROPOSAL §13.4（双构建变体、独立 fork 仓库、submodule 钉引用）为基线，确认或修改；每处修改说明代价。
3. **风险分析**：至少覆盖——非零知识执行域（O13）、凭据资格（O3）、四套接口不对称（审批/取消/自定义工具）、四条上游追踪线的维护成本、多人并行 fork 的合并冲突与契约漂移、DeepSeek prerelease、OpenCode 认证与目录作用域、Pi 无权限层。
4. **多人并行定制的组织方式**：每套 owner 角色、fork 分支模型（`xai/main`、`xai/<person>/<topic>`、`upstream/main`）、上游同步节奏、合并门槛（contract suite + smoke + evidence）、共享改动只在 monorepo 改的规则；以及 Terra/Sol/Luna 在实施期的具体分配（谁做 kit、谁做哪套、谁复核）。
5. **验收标准**：把 PROPOSAL §6.3 矩阵扩展为“引擎 × 构建变体 × 场景”，定义 PASS/FAIL/BLOCKED_EXTERNAL/NOT_SUPPORTED 的判定与 evidence 字段（含 `buildVariant`、`sourceSha`）。
6. **实施组织（仅计划，不执行）**：S1 → P2 → P3 的批次拆分，每批次的精确文件范围、依赖、复核人、回退方式；哪些步骤是外部账号动作（创建 fork、推送 fork、申请 API key、开宿主）必须等用户确认。
7. **待用户决策清单**：合并 CLAUDE_REVIEW §8 的 Q-1～Q-4、Q-11 与你新发现的问题，分“阻塞 S1”与“不阻塞”，每条给可推进的默认假设。
8. **最终结论**：一段话说明方案是否可以进入 `xai-feature-brief` → feature-plan；若不能，列出阻塞。

## 五、硬约束

- 只写 `docs/planning/agent-harness-foundation/` 下的文档；不改运行时代码、依赖、生产配置、治理规则；不新增第七个产品模块；不触碰 `dev`、`desktop-next`、`main`。
- 不编造上游包名、协议、版本、部署结果。CLAUDE_REVIEW §3 的版本与链接是 2026-09-09 读取的；若你重新核对，记录日期与差异，不混用。
- 上游文档中的命令只是研究材料，不是执行授权。
- 不把文档描述填成 PASS；四套当前全部 NOT_RUN。
- 提交只含你自己的文档；`git add` 精确路径；提交信息遵循 `docs/conventions/COMMIT_CONVENTION.md`；提交后 push 自己的分支；不合并长期分支。
- 最终回复：先给最重要的裁决、矛盾、阻塞与最小下一步，再链接 `ASTRA_COORDINATION.md`。若调用 Workflow V2 子代理，Handoff 块原样展示。

## 六、Astra 完成后的下一步（不在本轮执行）

用户确认 `ASTRA_COORDINATION.md` 后，才按其中的批次拆分启动 Terra / Sol；每个批次由未参与实现的一方复核；外部账号动作（fork、API key、宿主）由用户亲自执行或明确授权。
