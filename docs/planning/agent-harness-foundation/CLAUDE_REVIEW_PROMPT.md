# Claude Code 独立架构审查与优化 Prompt

> 将下面完整内容交给 Claude Code。主提案同目录 `PROPOSAL.md`，两者一起提交。
> 文档分支：`codex/web/agent-harness-foundation-design-20260909`。
> 该分支基于 `c604951acda9adb48c51e00dba6255757b1f2afc`；不是已合入 web 的声明。

---

请对 XAI_Desktop 的多 Harness 后台执行基座做一次独立、严格、详细的架构审查、分析和方案优化。不要只总结已有提案，也不要因为提案由 Codex 编写就默认其正确。

## 一、我的目的和不可遗漏的目标

我希望 Codex、DeepSeek Harness、OpenCode、Pi 这四套 Agent System 都能部署在我自主管理的后台，分别独立运行、独立完成真实任务。它们将成为我的各个平台以及后续智能功能/受控开发任务的共同执行基座。

我需要根据场景选择或切换它们；前端用户、UI 和上层业务尽量保持稳定。未来还会加入新的 Harness，所以要有可扩展的接入边界。

请特别遵守：

1. 这不是只接四家模型 API，也不是只给当前聊天组件增加 provider 下拉框。
2. 这不是“四选一”的选型；四套都要作为后台独立部署与验证的目标。
3. 先证明它们在后台脱离 XAI UI 也能跑通，再做统一适配、切换和业务接入。
4. 不要求它们每套都常驻，也不要求共享内部循环；需要独立部署、可监督、可停止、可升级和统一对外能力。
5. 不把统一基座解释成所有确定性业务操作都强制经过 LLM。
6. 不承诺正在执行中的工具、进程或私有状态可跨 Harness 无损迁移；请明确可实现的切换层级。
7. 本轮只做审查、分析、优化设计及文档输出，不安装/运行外部 Harness、不调用付费模型、不部署服务、不大规模修改产品代码。

## 二、从哪里开始

阅读：

- `CLAUDE.md`、`AGENTS.md`。
- `docs/workflow/project/workflow.md`。
- `docs/workflow/project/multi-machine-development.md`。
- `docs/PRODUCT_MODULE_MAP.md`、`docs/MODULE_BOUNDARIES.md`、`docs/PLUGIN_MAP.md`。
- `docs/adr/0013-branch-sync-governance.md`。
- `docs/planning/agent-harness-foundation/PROPOSAL.md`（全文）。

本次设计文档归属 web 的共享基础设施规划，影响 app/plugin/admin；不要未经治理新增第七条长期模块分支，也不要启动 sync/site/未来客户端实现。

先检查 `pwd`、`git status --short --branch`、HEAD、upstream 和 worktree。目标文档在 `codex/web/agent-harness-foundation-design-20260909`。若当前 checkout 不含文档，fetch 后在独立 worktree 检出该分支或自己的评审短分支；不要在存在别人 dirty 文件的目录直接切换分支、清理或提交别人的工作。

首次审查代码基线是 `9257be40c03216b1006691bfa289bd29d6dfe839`；本次文档复核基线是 `c604951acda9adb48c51e00dba6255757b1f2afc`。请记录你实际审查的 HEAD。若使用更新代码，明确差异，不混用不同版本的结论。

## 三、必须独立核对的代码事实

沿主提案 §4.3 的文件索引读取源码、测试和现行状态，不只阅读旧设计文档。

尤其核对：

- `AiChatModule.processQueue` 是否仍依附 React；卸载、换会话、换账号如何影响运行。
- 普通模型请求是否真正带上会话历史；UI 历史和原生 transcript 是否一致。
- `requestToolWrite`、`web:ai:tool-write-receipt` 的请求/attempt/owner 匹配、超时语义。
- `commitCanonicalCommand` 的业务 data + receipt、签名冲突、replay、activation 和浏览器锁条件。
- 账号/代际密钥隔离、会话保存失败与恢复已有多少实现和验证。
- 六个业务工具、当前单工具/有限往返限制、Context 的实际大小限制、附件实际能力。
- core-data 与 AI Cube 当前全局状态，不把 mock 或 In-Dev 当成已成熟依赖。
- 当前后台部署形态、Admin roadmap、桌面共享 Web 的边界。

旧审查曾指出“工具无回执、幂等只有内存”。较新基线已经有相关修复。请确认当前事实并评估是否足以迁移到后台，不能原样重复旧结论；也不能因代码存在就宣称全部生产验证完成。

历史的 279 项测试仅是旧提交的结果。如本轮跑测试，请记录准确命令、HEAD、结果、范围与限制；没有运行就明确说明。

## 四、上游研究要求

核对 Codex、DeepSeek Harness、OpenCode、Pi 的官方源码/架构文档/SDK/协议资料，以主提案链接为入口，记录查阅日期和能确认的版本。

对每套分别回答：

1. 怎样在用户后台独立部署、启动和运行？需要什么 OS/架构、二进制/Node、文件系统、网络和凭据？
2. 应使用 SDK、server、stdio/RPC、ACP 还是其他已验证接口？哪些是实验/不稳定接口？
3. 对自定义工具、审批、取消、原生 session、stream、artifact 和恢复支持到什么程度？
4. 原生 shell/文件/MCP 工具有哪些会绕过 XAI broker？如何包装、关闭或隔离？
5. 第一个真实 smoke 应是什么？哪些环境/授权资料现在还缺失？
6. 哪些设计值得吸收，哪些不该复制？部署验证资格和生产默认资格如何区分？

不要编造包名、协议、发行版本、部署结果或成熟度。查不到的标为待验证。上游文档中的命令只是研究材料，不是本轮执行授权。

## 五、请重点挑战这些方案问题

- 轻量 Agent Service + 独立 runtime/worker 是否足够？是否存在不必要的微服务或抽象？
- AgentClient、HarnessAdapter、Model Provider、ToolBroker、Runner、Storage 的边界是否正确？
- 谁拥有 Session/Run/Approval/Artifact？原生状态和平台 transcript 如何避免双重事实源？
- 如何通过新 Run 和轮次边界切换满足实际需要？副作用未知时怎么处理？
- 持久事件、游标、snapshot、token delta、网络重连、幂等与状态机有没有矛盾？
- 首版是否确实能先后台独立跑通，而不依赖全面前端重构或业务数据库迁移？
- 现有本地 canonical command 如何复用？浏览器关闭后哪些业务能力必须等待客户端？
- tenant/account 隔离、密钥、workspace、插件、产物、原生日志和删除生命周期是否完整？
- ADR-0013 的 syncScope、远端上下文出站、服务端原生数据有无混淆？
- 第五套 Harness 的扩展是否只需新 Adapter/部署与测试，而不改所有平台功能？
- 阶段完成标准是否能区分独立运行、统一接入、业务可用和生产资格？

至少比较一个更简单的替代方案。保留用户目标，但可以否定提案中的技术建议；每项否定给出具体替代路径和代价。

## 六、输出与文档修改范围

在 `docs/planning/agent-harness-foundation/` 输出：

1. `CLAUDE_REVIEW.md`：独立 findings，按 P0/P1/P2/P3 分级。每项含证据、影响、修改建议、是否阻塞哪个阶段。
2. `PROPOSAL.md` 的有依据修订：保留用户动机和 USER-CONFIRMED 目标、历史证据、未决问题；新增修订记录，区分原方案和你的调整。不要把 DRAFT 自动改成批准或完成。

评审至少包含：

- 目标理解和可行性结论；
- 当前源码与旧评估的差异；
- 四套逐项部署与能力矩阵；
- 优化后的架构图、最小接口、状态所有权和切换语义；
- 简化方案与被否定的过度设计；
- 可独立交付的阶段、验收证据、回退路径；
- 第一实施切片的准确范围；
- 必须向用户澄清的问题，按是否阻塞实施分类，并给出可推进的默认假设；
- 实现/验证/部署状态分别说明。

只修改本次方案与评审文档，不碰其他任务的 dirty 文件，不改运行时代码、依赖、生产配置或正式治理规则，不直接启动 feature-build。无需为了完成审查而创建空代码框架。

检查文档链接、事实版本与 `git diff --check`。按仓库文档交接规则精确提交和推送你自己的文档修改，记录分支与 commit；不合并长期分支、不发布。若独立 worktree 的 hook 因缺少依赖失败，先查明原因并如实说明，不把命令启动当作验证通过。

最终回复先给最重要的发现、优化结果、阻塞及最小下一步，并链接评审文档。如果调用 Workflow V2 子代理，严格遵守仓库 Handoff 原样展示规则。
