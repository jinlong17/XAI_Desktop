# XAI 多 Harness 后台执行基座：动机、架构评估与实施提案

> 状态：DRAFT / Claude Code 独立审查已完成（2026-09-09），技术方案已按审查修订，**仍未批准**。用户目标已确认。
> 创建日期：2026-09-09（America/Los_Angeles）。作者：Codex。修订：Claude Code（2026-09-09，见 §19 修订记录与 [CLAUDE_REVIEW.md](CLAUDE_REVIEW.md)）。
> 阅读约定：标有【Claude 修订 2026-09-09】的段落是审查后的调整；未标记的段落保持 Codex 原方案。二者冲突时以修订为准，但修订不改变 §2 的 USER-CONFIRMED 目标。
> 本轮交付：设计文档及审查 prompt；不部署服务、不安装 Harness、不修改产品运行时代码。
> 主模块归属：`web`，从现有 Web AI 能力进入共享基础设施规划；影响 `app`、`plugin`、`admin`，持久化变化另做 `syncScope` 分类。
> 这里的“后台”指自主管理的服务端执行环境，不是 Admin Dashboard 页面，也不是本机开发助手的后台会话。

## 1. 阅读方法与事实边界

本文件是把用户出发点、前置审查、最新澄清及修订方案放在一起的设计记录，不是已经实现的架构说明。

| 标签 | 含义 |
| --- | --- |
| USER-CONFIRMED | 用户明确提出的方向；优化方案不得悄悄缩减这些目标 |
| OBSERVED | 在指定提交上读取源码或配置得到的事实 |
| HISTORICAL | 上一轮证据；不能当作当前提交的验证结果 |
| PROPOSED | 本文件建议；允许审查者提出替代方案 |
| OPEN | 尚需决策、验证或补充环境资料 |

证据基线：

- 原始审查：`9257be40c03216b1006691bfa289bd29d6dfe839`，2026-09-08 的 Web 主线快照。
- 本次源码复核：`c604951acda9adb48c51e00dba6255757b1f2afc`，来自 `codex/web/full-product-audit-20260908` 的已提交快照。
- 文档分支：`codex/web/agent-harness-foundation-design-20260909`，从本次复核提交创建。该分支继承审查分支历史，不代表这些历史变化已经合入 `web`。单独整合设计时应只取本次文档提交。
- 独立 worktree 隔离了共享工作目录中其他任务的未提交修改；那些文件未纳入本次交付。
- 上游资料在上一轮于 2026-09-08 读取；本轮以该资料为研究基线。实现前须重新核对官方文档、发行版本、源码 revision、协议 schema 和许可证。没有锁定上游版本，也没有四套 Harness 的真实运行结果。
- 原始测试证据：AI Chat 253 项、任务 AI 订阅 15 项、日历 AI 订阅 11 项通过，AI Chat 类型检查通过；有 React `act(...)` 警告。这 279 项结果仅属于原始审查，不是 `c604951` 的复跑结果。
- 本次为文档改动，仅做文档一致性、链接、Git 范围检查；不把 package 内历史日志的 PASS 自动升级为独立验证或生产可用。
- 【Claude 修订 2026-09-09】Claude 审查 HEAD：`43798a69e1ac9fcc4f042c3f62581311b21fc557`（与 `c604951` 的差异仅为本目录两份文档，源码一致）。审查 worktree 内执行 `pnpm install --frozen-lockfile --offline` 后运行 `pnpm --filter @repo/plugin-web-ai-chat test`：32 files / 280 tests 通过（10.54s）。这是本轮唯一的测试运行，范围仅 AI Chat 包；未运行任务/日历订阅测试、类型检查、e2e，也未复跑 REL-03。上游资料于 2026-09-09 重新读取并确认版本（见 §11）。

审查入口：[Claude Code 审查 prompt](CLAUDE_REVIEW_PROMPT.md)。审查结果：[CLAUDE_REVIEW.md](CLAUDE_REVIEW.md)。

## 2. 用户出发点、目的和动机

### 2.1 原始需求的核心表达

用户希望后续接入几套开源 Agent Harness System，先在后台统一集成，并可在不同系统之间切换，前端用户基本无感。四个重点方向是：

1. Codex：研究成熟 coding agent 的核心实现方式。
2. DeepSeek Harness：研究 plugin-first Harness 架构。
3. OpenCode：研究 multi-provider agent 的实现方式。
4. Pi：研究 minimal、可嵌入、可扩展的 agent runtime。

用户要求先审查当前 Agent、模型调用、工具调用、任务执行和状态管理架构，判断统一接口的必要性、可复用部分、调整范围及实施顺序。原始范围是架构审查和方案设计，不直接大规模修改代码。

### 2.2 2026-09-09 的关键澄清（USER-CONFIRMED）

用户进一步明确：“希望这几个架构都能够部署在我的这个后台上面”，“相当于我的一切平台的基座”，“必须先让它们在上面跑，能够独立跑通”，“后续可能还有新的架构可以加进来”。

由此冻结以下目标：

- 四套系统均是实际后台部署与独立验证的目标，不只是阅读源码后任选一个。
- 后台要能在不依赖 XAI 聊天页面、浏览器标签页和桌面 UI 的情况下驱动各 Harness。
- 它们服务于 XAI 各个平台及后续 Agent 驱动的功能开发，不能把方案限制为当前聊天组件的模型开关。
- 需要时能够选择、切换执行引擎；切换尽可能不影响前端交互和上层业务契约。
- 后续第五、第六套 Harness 应能通过明确扩展边界加入，不要求重写所有平台功能。
- 实施顺序必须体现：先独立跑通后台运行时，再统一接入、切换和业务集成。
- 本次要求形成非常详细的文档并 commit，同时给 Claude Code 一份用于审查、分析和优化的 prompt。

“一切平台的基座”在本提案中的解释是：共用 Agent 执行能力与治理边界。普通 CRUD、日历计算、鉴权、支付等确定性业务服务仍由业务层负责；没有理由让每次业务操作都先经过 LLM。

“支持后续功能开发”同时覆盖两个可能场景：产品内部智能功能、受控工程任务（编码/分析/产物生成）。二者共享运行契约，但权限和工作空间隔离，具体首批场景仍为 OPEN。

### 2.3 动机与预期收益

| 动机 | 对架构的要求 | 成功表现 |
| --- | --- | --- |
| 避免被一个 Harness 锁定 | 平台掌握外部契约、业务工具、逻辑会话与路由 | 更换引擎不要求重写 UI 和业务模块 |
| 利用不同系统的优势 | 每个原生 runtime 保留自己的内部实现 | 不强迫所有系统退化成相同提示词和同一循环 |
| 统一服务多平台 | 后台 API 与运行生命周期不依赖某个客户端 | Web、桌面和未来获准的平台可消费同一契约 |
| 先验证可运行性 | 每套系统有部署清单和独立 smoke 证据 | 脱离 XAI UI 也能完成实际任务 |
| 持续扩展 | 注册、能力协商、版本隔离及兼容测试 | 新引擎通过 Adapter 加入，旧引擎继续可用 |
| 控制重构成本 | 包装现有能力，按场景逐步迁移 | 已交付功能继续工作，可单独回退 |

### 2.4 尚未确认的目标解释

这些不能由架构文档代替用户决定：生产服务器所在地/供应商/OS/CPU 架构；首批用户与租户模式；是否首先开放 shell；任务时长和并发；预算；BYOK 与平台付费凭据策略；本地文件是否可上传到远端；哪些平台先接入。

可以先采用可替换的开发环境假设推进设计，但不能把假设写成用户承诺或部署事实。

## 3. 术语与必须分离的层次

| 术语 | 本提案中的定义 |
| --- | --- |
| Model Provider | 提供模型推理 API 的服务；例如选择 DeepSeek 模型不等于使用 DeepSeek Harness |
| Harness | 驱动模型、上下文、工具和执行循环的 Agent 系统 |
| Harness Deployment | 后台某个可运行实例，绑定 runtime、版本、镜像/二进制、配置和环境 |
| Harness Adapter | XAI 契约与原生 SDK/协议之间的转换器 |
| Agent Service | XAI 拥有的会话、运行准入、路由、事件与状态服务 |
| Execution Host / Runner | 实际启动、监督、取消和隔离 runtime/进程的执行宿主 |
| ToolBroker | 统一业务工具入口，负责输入、权限、审批、幂等及结果 |
| XAI Session | 面向用户与平台的稳定逻辑会话，不等同于某家原生会话 |
| Run | 一次执行请求及其生命周期；不与任务列表里的业务 Task 混用 |
| Step | XAI 定义的运行内阶段；各家原生 turn/step 语义必须显式映射 |
| Artifact | 可引用、可授权访问的产物，如文件、diff、报告；不是任意本地绝对路径 |
| Product Plugin | XAI 的 UI/业务插件、widget、原生平台能力 |
| Harness Plugin | 某引擎自己的扩展模块；与 Product Plugin 不存在天然一一对应 |

`.agents/`、`.codex/agents/`、Workflow V2 等是开发本项目的协作机制，不是产品提供给终端用户的运行平台。本提案不修改它们的协议。

## 4. 当前仓库架构评估

### 4.1 原始主链路与可复用资产

```text
AiChatModule
  → 浏览器内队列 / 确认流程
  → streamCompleteChat
  → resolveProvider + 密钥读取 + Context 构造
  → Anthropic / OpenAI-compatible HTTP API
  → SSE 解析 → 文本 / 单个 toolUse
  → 任务 / 日历业务事件 → 所属模块 reducer → 本地数据
```

| 层 | 现有资产 | 复用判断 | 尚不能等同于 |
| --- | --- | --- | --- |
| 模型适配 | provider preset、请求序列化、SSE、错误分类、AbortSignal | 可以保留在 Builtin 路径，逐步改为注入配置 | 可部署的通用 Harness |
| 工具定义 | 六个任务/日历创建、更新、删除工具及确认描述 | 保留领域意义，改进统一定义 | 任意后端 plugin 体系 |
| 领域执行 | 任务与日历内部 reducer、数据验证 | 保持业务模块所有权 | 后台已可直接调用的业务 API |
| UI | 会话列表、消息流、确认卡片、错误提示 | 尽量保留，用投影适配统一事件 | 后台运行状态事实源 |
| Context | 今日任务、日历、专注、习惯快照 | 抽离数据源并增加预算和来源 | 全面的 context/session manager |
| 存储 | 偏好存储、账号边界；core-data 的 Repository 契约 | 分层评估，不全量迁移 | 持久运行队列或分布式事务 |
| 产品插件 | core Registry、UI slot、类型化事件 | 保留组合方式 | 安全装载任意 Harness 插件 |
| 桌面 | Tauri 宿主、数据/Keychain 边界、共享 Web 方向 | 后续作为客户端/执行宿主扩展参考 | 本轮授权新增的本地 daemon |
| 控制面 | Admin provider、quota、audit 等规划 | 未来配置面遵循既有 roadmap | 已上线的多租户 Agent 控制面 |

### 4.2 原始发现与本次状态修订

**不能原样复制上一轮结论。** `9257be4` 到 `c604951` 之间已经出现实际修复。

| 原始发现（HISTORICAL） | 本次复核（OBSERVED） | 对新方案的影响 |
| --- | --- | --- |
| 确认后发事件就报告成功 | `handleConfirm` 已 await `requestToolWrite`；失败保留错误状态，成功后才继续模型回复 | 不再提出“从零增加业务回执”；应复用并扩展当前语义 |
| subscriber 的去重只有内存 seen-set | 【Claude 修订 2026-09-09】**机制已实现，生产关闭。** 任务与日历的 create/update/delete 订阅都调用 `commitCanonicalCommand`；envelope 同记录写 data + receipts，同签名返回 `replay:true`，异签名返回 `request-conflict`，Web Locks + 账号代际检查、容量上限均在。**但** `commandActivation` 模块级为 `false`，唯一 setter 是 `setCanonicalCommandActivationForTests`，`apps/`/`packages/` 无生产调用者（源码注释"Production activation remains closed until D"）。生产路径下订阅返回 `activation-disabled`，经 `executeToolWrite` 收窄为 `storage`。浏览器端到端行为未实测；包内 `dev_log.md` 为 `FIX_READY_FOR_VERIFY`（REL-03） | 不能把"持久幂等已可复用"当作 P4 前提；后台幂等必须在服务端另建（§8.1），P4 前置 REL-03 verify 与生产 activation 决策 |
| BYOK 密钥以 provider 行存储 | `secretStore` 已有账号/代际相关隔离与迁移处理，聊天也增加 owner 检查。【Claude 修订 2026-09-09】行键与 AAD 为 `[kind, accountId, generation, provider]`，不含 epoch（epoch 仅靠 scope 引用相等校验）；密钥自设备 UUID 经 PBKDF2-600k 派生，不是用户口令 | 新服务端密钥方案要保留账号边界，不能退回全局共享 key |
| 会话存储恢复简单 | 新增 `useConversationRecovery`、`useChatPreference`，涉及保存失败与恢复 | 复用既有恢复行为；不要改成断线就丢草稿 |
| 普通请求没有完整历史 | `processQueue` 仍只传本次 text；adapter 默认单条用户消息。【Claude 修订 2026-09-09】并且：两条 provider 路径都**没有 system 字段**（today-context 拼进 user 消息）；确认/取消 follow-up 的合成三轮历史用**助手 preamble 文本充当 user turn** 且不带 today-context；附件只有 `{name,size}` 元数据，**从未发送给模型** | 仍需中立 transcript 与模型历史构造；P4 的 Builtin Adapter 只能复用 `llmProvider` 的 wire 序列化/allowlist/错误分类，transcript/system prompt/context 预算由 Agent Service 构造，不包装 `processQueue` |
| 循环、审批依附 React | 队列、待确认、控制器仍由组件持有 | 独立后台执行仍未实现 |
| 单工具、有限往返 | 输出仍是单个 `toolUse`，后续确认回复有界 | 必须和一般 Agent Run 的生命周期区分 |

当前新增代码有 activation、账号 generation/epoch、浏览器锁和本地存储条件。源码存在不表示所有运行环境均已启用、完成独立验证或生产发布。尤其本次没有重跑 REL-03 联合验证，不对其整体发布状态作新结论。

### 4.3 源码导航与证据

以下链接相对仓库，可随文档跨电脑迁移。Claude 审查时须记录当时 HEAD，并以符号检索为主，避免把旧行号当成当前定位。

| 证据 | 需要检查的符号/行为 |
| --- | --- |
| [AiChatModule](../../../packages/plugin-web-ai-chat/src/AiChatModule.tsx) | `processQueue`、`handleConfirm`、`pendingConfirmation`、owner 校验、卸载取消 |
| [stream adapter](../../../packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts) | `StreamRequest`、`StreamChunk`、`priorMessages`、单工具选择、配置注入耦合 |
| [model provider](../../../packages/plugin-web-ai-chat/src/internal/llmProvider.ts) | `resolveProvider`、`buildBody`、Anthropic 内容块到 OpenAI 的转换、endpoint allowlist |
| [tool registry](../../../packages/plugin-web-ai-chat/src/internal/toolRegistry.ts) | `AiToolDef`、`toConfirmation`、`toWriteEvent`、校验与六个工具 |
| [tool request receipt](../../../packages/plugin-web-ai-chat/src/internal/requestToolWrite.ts) | `attemptId`、request/channel/owner 匹配、1500ms 本地等待超时 |
| [canonical command](../../../packages/plugin-web-storage/src/internal/canonicalCommandState.ts) | `commitCanonicalCommand`、activation、签名、同记录 data/receipt、容量、锁、replay |
| [task subscriber](../../../packages/xai-web-tasks/src/internal/aiCreateSubscriber.ts) | 所属模块内调用 reducer、`targetId` 与错误返回 |
| [calendar subscriber](../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.ts) | 同类业务操作的真实验证边界 |
| [context provider](../../../packages/plugin-web-ai-chat/src/internal/contextProvider.ts) | `buildTodayContext`、top 20、日历/标题未形成硬 token 上限 |
| [message types](../../../packages/plugin-web-ai-chat/src/types.ts) | UI 消息与附件元数据尚不能代表完整执行日志 |
| [secret store](../../../packages/plugin-web-ai-chat/src/internal/secretStore.ts) | 浏览器凭据隔离、AAD、迁移；不是后端 secrets manager |
| [conversation recovery](../../../packages/plugin-web-ai-chat/src/internal/useConversationRecovery.ts) | 保存失败、恢复、账号切换行为 |
| [event bus](../../../packages/xai-web-event-bus/src/emitter.ts) | 页内 EventTarget；不能用作网络持久消息总线 |
| [core-data types](../../../packages/core-data/src/types.ts) | Repo/transaction/schemaVersion/syncScope 契约 |
| [AI Cube](../../../packages/plugin-ai-cube/src/hooks/useAiConversation.ts) | mockResponse、mock action；不误判为独立成熟 runtime |
| [部署配置](../../../apps/web/wrangler.toml) | 当前 Pages 静态构建产物，未提供长驻 Harness 进程部署 |
| [全局模块状态](../../PLUGIN_MAP.md) | 依赖稳定性；core-data/AI Cube 在本基线仍不可当作全部成熟 |

### 4.4 核心判断

当前存在“模型 API 适配 + UI 内有限工具流程”，并不存在满足用户目标的“后台多 Harness 执行平台”。统一边界现在有必要，但不必大规模改写现有业务。

仅把 `streamCompleteChat` 重命名为 `AgentAdapter.run` 无法解决：独立部署、进程故障、租户隔离、持久 Run、原生 session 映射、artifact、后台工具执行和版本升级。

仅部署四个 CLI 也不足以构成平台：它们还需要一致的准入、会话和事件契约、权限控制、运行证据与可用性声明。

## 5. 目标架构：统一入口、独立运行时、共享能力

### 5.0 现状：仓库里没有自主管理的长驻后台（【Claude 修订 2026-09-09】OBSERVED）

- Web 是 Cloudflare Pages 静态产物（`apps/web/wrangler.toml` 仅 `pages_build_output_dir`），无 Functions/Worker。
- 现有服务端只有 **Supabase**：Auth（`account_id = auth.users.id`，Web 用 `@supabase/supabase-js`）、Postgres + RLS、Deno Edge Functions（`apps/release-site/supabase/functions/{sync-push,sync-pull,recovery-proof,onboarding-backfill}`）。其安全前提是**零知识**：服务端永不见 KEK/DEK/业务明文（`docs/TECHNICAL_REQUIREMENTS.md`）。
- 仓库中没有 Dockerfile、compose、fly/render 等任何长驻进程部署清单。
- 因此本提案的 Agent Service / Runner / Store 全部是**新增执行域**，O1 的真实含义是"从零选一个能跑容器的宿主"，不是在既有后台上加服务。
- 该执行域是**非零知识数据面**：Harness 在服务端运行时必然看到发给模型的上下文、工具参数与产物明文。它与 D4 加密 blob 永不互通，只接收用户/策略显式授权出站的数据（§10.3、§15 O13）。调用方身份直接复用 Supabase JWT，不另建账号体系。

### 5.1 逻辑架构（PROPOSED）

```mermaid
flowchart TD
  Web[Web 客户端] --> API[XAI Agent API / Client Contract]
  App[Desktop 客户端] --> API
  Other[未来获准的客户端 / 业务服务] --> API
  API --> Service[Agent Service: 鉴权、Session、Run、路由]
  Service --> Catalog[Harness Catalog: 能力、版本、部署、健康]
  Service --> Store[Session / Run / Event / Artifact Store]
  Service --> Host[Runner Supervisor / 执行宿主]
  Host --> C[Codex Adapter + 独立 Runtime]
  Host --> D[DeepSeek Adapter + 独立 Runtime]
  Host --> O[OpenCode Adapter + 独立 Runtime]
  Host --> P[Pi Adapter + 独立 Runtime]
  Host --> N[新增 Harness Adapter + Runtime]
  C <--> Tools[XAI ToolBroker]
  D <--> Tools
  O <--> Tools
  P <--> Tools
  N <--> Tools
  Tools --> Domain[业务能力 API / 受控客户端桥接]
  Tools --> Environment[文件、命令、网络执行环境]
```

这是逻辑边界，不等于必须部署这么多微服务。首版允许一个 Agent API 服务、一个存储实例、一个 Runner Supervisor，再按 Harness 启动隔离子进程或容器。进程内 SDK 也应运行在后台受限 worker 中，而不是直接在 Web bundle 或高权限 API 主进程里执行任意插件。

### 5.2 控制面与执行面

- 控制面掌握：身份、租户、会话 ID、路由策略、已安装版本、可用能力、并发/预算准入、状态与审计。
- 执行面掌握：原生 Agent loop、模型调用、工作空间、原生状态、进程/容器生命周期。
- XAI 不接管每家的内部循环；Adapter 把原生执行映射成一致的外部语义。
- Admin Dashboard 是未来控制面的管理入口，不是执行服务本身。部署验证可以先用受保护 API/CLI，无需等待 Admin UI 全部完成。
- 每个 Run 绑定不可变执行配置快照，运行中切换默认 provider 或升级配置不得静默改变该 Run。

### 5.3 部署方式选择

| 候选 | 优点 | 约束 | 建议 |
| --- | --- | --- | --- |
| 每个 Harness 一个受控子进程 | 初始部署简单，可使用 stdio/SDK | 不是 OS 安全隔离，共享宿主风险仍在 | 仅受信任开发 smoke 可用；权限范围必须清楚 |
| 独立容器/worker | 版本和依赖隔离，可限制挂载及资源 | 要管理镜像、状态卷、退出和清理 | 优先评估为后台四套系统的部署基础 |
| VM/更强沙箱 | 适合不受信任代码及跨租户工作空间 | 成本和运维较高 | shell/第三方插件风险需要时引入 |
| 单进程加载所有框架 | 表面调用简单 | 故障、依赖、全局状态、插件权限容易相互污染 | 不作为默认架构 |
| 将 CLI 塞进现有静态站部署 | 可复用站点名字 | 现有部署并没有这些进程的运行边界 | 不能视为已经解决托管问题 |

暂不指定 Kubernetes、某个云厂商或数据库产品。先根据真实 OS、架构、持久磁盘、进程/容器能力和出网要求验证可行性。后台在 Linux 上运行和桌面 macOS 能力是两个执行域，不假设远程 Linux 可以操作用户本机文件。

【Claude 修订 2026-09-09】**容器（或 microVM）是唯一被依赖的安全边界；各家原生沙箱只是纵深防御。** 依据上游资料：Codex 与 DeepSeek Harness 的 Linux 沙箱都是 bubblewrap（Codex 另有 Landlock legacy 回退），在容器内需要非特权 user namespace，否则只能 `danger-full-access` 或 Codex app-server 的 `externalSandbox` 声明；DeepSeek SAFETY.md 明言沙箱"do not guarantee isolation"；OpenCode 与 Pi **没有**内置沙箱。宿主内核是否允许非特权 userns 进入 O1 环境清单。

物理形态按阶段收缩：P1–P2 **不建 Agent Service**，只用"smoke-kit 进程 + 每套一个容器 + 一个 XAI MCP 工具服务 + evidence 记录"完成四套独立跑通；P3 才引入单进程 Agent Service（API + Store adapter + Supervisor 同进程）；多服务拆分在没有负载证据前不做（对比见 CLAUDE_REVIEW §4.2）。

## 6. 独立部署与独立跑通的定义

### 6.1 每套 Harness 都要具备的交付物

1. 来源 URL、锁定 release/tag/commit、许可证与依赖说明。
2. 可重建的部署清单、依赖版本、启动命令/镜像及回退方式。
3. 服务端配置 schema、names-only secret 模板、凭据获取边界。
4. 独立健康检查，区分进程存在、协议就绪、模型认证有效、实际任务可执行。
5. 不依赖 XAI UI 的启动、提交、观察、取消与清理脚本。
6. 隔离 workspace、原生状态目录和日志；不同实例不共享个人 HOME/登录态。
7. 实际模型任务 smoke；mock 仅证明协议和测试设施可工作。
8. 失败/超时/进程退出记录，确认不会把失败伪装成成功。
9. 产物与日志位置，原始凭据不写入回执或产物。
10. 按原生能力记录恢复支持；不支持的能力明确标为 unsupported。
11. 【Claude 修订 2026-09-09】锁定的具体上游版本：release tag + registry 版本 + 读取日期（本轮确认值见 §11 各节）；高频发布的 Codex/OpenCode 必须固定 tag 并关闭自动更新。
12. 【Claude 修订 2026-09-09】凭据类型声明：`api-key | enterprise-token | oauth-personal-forbidden`；个人订阅 OAuth 一律不进入共享后台（§11 各节"凭据资格"）。
13. 【Claude 修订 2026-09-09】出网清单：允许的目标域名 + 显式关闭的默认外联（Codex `web_search=disabled`；DeepSeek `DSH_TELEMETRY_MODE=DISABLED`；OpenCode `autoupdate:false`、`share:"disabled"`、锁定 Bun/npm 插件安装出网；Pi `PI_OFFLINE=1`、`PI_TELEMETRY=0`）。
14. 【Claude 修订 2026-09-09】实例隔离变量与目录：Codex `CODEX_HOME`（或 `--ephemeral`）；DeepSeek `DSH_HOME`；OpenCode 独立 `HOME`（XDG 变量支持未在官方文档确认）；Pi `PI_CODING_AGENT_DIR` / `PI_CODING_AGENT_SESSION_DIR` / `PI_PACKAGE_DIR`。不同租户/实例不共享这些目录。

“独立”表示可单独安装、启动、验证、停止或升级。并不要求四套永久同时占用资源，也不表示每套都得做独立的 UI 或重复建设认证平台。

### 6.2 第一批端到端场景

| 场景 | 证明什么 | 执行要求 |
| --- | --- | --- |
| 纯文本任务 | 原生运行时、认证、模型请求真实可用 | 保存输入、实际 engine/model、结果和退出状态 |
| 只读 fixture 分析 | Workspace 与 Context 输入成立 | 使用非敏感样例文件，确认目标环境 |
| 受控工具调用 | 工具请求/结果和审批边界成立 | 工具宿主独立于浏览器；不得靠 mock 文本冒充调用 |
| 生成小型产物 | 输出路径、内容和 artifact 引用成立 | 验证产物真实存在、内容可读、归属正确 |
| 主动取消与超时 | Run 与子进程生命周期可控 | 检查实际活动工具和遗留子进程，不只看 UI 状态 |
| 错误输入/坏配置 | 明确故障与恢复行为 | 记录错误类别，不输出 secret |
| 重启后查询/续接 | 持久状态和原生恢复能力 | 能查询终态是基础；原生续接单独能力测试 |

后台基础 smoke 可以由一个很小的受控工具宿主和临时业务 fixture 完成，不必先迁移任务/日历数据库，也无需先改聊天 React 组件。

### 6.3 初始验证矩阵

| Harness | 独立部署 | 真实任务 | 受控工具 | 取消/失败 | Artifact | 统一 Adapter | 生产资格 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Codex | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_IMPLEMENTED | NOT_ASSESSED |
| DeepSeek Harness | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_IMPLEMENTED | NOT_ASSESSED |
| OpenCode | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_IMPLEMENTED | NOT_ASSESSED |
| Pi | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_IMPLEMENTED | NOT_ASSESSED |

本轮不能把文档描述的能力填成 PASS。独立跑通、统一接入、业务可用、生产资格是四个独立维度。实验性的 Harness 可以部署在隔离验证环境中，而暂不进入生产默认路由；这不取消它的部署目标。

## 7. 统一接口范围与最小契约

### 7.1 三个接口边界

1. `AgentClient/API`：面向客户端和业务服务，使用 XAI ID 与事件，不依赖某个厂商。
2. `HarnessAdapter`：面向内部执行面，负责原生会话映射、事件归一、取消、审批桥接与错误映射。
3. `ToolBroker/ExecutionEnvironment`：面向具体能力执行，确保领域约束、权限和真实结果。

Model Provider Adapter 是第四个独立概念。只有支持注入的 Harness 才使用统一模型调用实现；其他通过受控配置绑定原生 provider。统一模型选择与用量口径，不强制重写各家的 API 栈。

【Claude 修订 2026-09-09】**ToolBroker 的传输载体 = 一个 XAI MCP server（stdio 与 streamable-HTTP 两种暴露）+ Pi 进程内 shim。** 理由：Codex、OpenCode、DeepSeek Harness 都有 MCP client；而 host 直接注册工具的路径各不相同且多为实验/进程内（Codex `dynamicTools` experimental 且仅 app-server；DeepSeek 仅进程内 Cordis plugin；OpenCode 为 `.opencode/tools/*.ts` 文件工具，可同名覆盖内建；Pi 为 `customTools`）。业务六工具与只读 fixture 工具都实现在 broker 内；四套通过各自 MCP 配置挂载，并在各自权限配置中把 broker 工具设为需审批（如支持）。第五套 Harness 只要有 MCP client 即零改动接入。Pi 的 MCP client 在官方文档未见（UNVERIFIED），故保留进程内 shim。

【Claude 修订 2026-09-09】**Approval 与 Cancel 契约必须携带 `nativeBridge: native | host-shim | unsupported`。** 四套的审批回程与中途取消只在特定接口可用（§11 各节），统一契约不得假设每套都能原生桥接；`cancel` 定义为尽力而为 + 进程树 kill 兜底 + `outcome_unknown`。

### 7.2 需要表达的能力

| 契约 | 基础内容 | 按能力扩展 |
| --- | --- | --- |
| HarnessDescriptor | engineId、adapterVersion、runtimeVersion、deploymentId、协议版本、健康状态 | region、成本等级、环境类型 |
| ModelSelection | providerId、modelId、credentialRef、实际解析结果 | reasoning、结构化输出、多模态、原生认证模式 |
| Session | XAI sessionId、owner、历史、原生绑定引用、schemaVersion | fork、原生 checkpoint、可移植摘要 |
| Run | runId、sessionId、输入、配置快照、权限、预算、幂等键 | 优先级、批量、调度、多 Agent |
| Event | eventId、runId、顺序号、时间、类型、版本 | tool progress、可公开的推理摘要、原生扩展 |
| Tool | 名称/版本、输入输出 schema、副作用类别、执行域、授权要求 | streaming、MCP、异步外部工具 |
| Approval | requestId、runId、toolCallId、操作摘要/哈希、owner、有效期 | session 范围授权需明确政策 |
| Context | 历史、业务事实快照、资源引用、来源、权限和预算 | 检索、压缩、缓存、记忆 |
| State | Run 状态、待处理请求、版本、终态原因 | 原生状态 opaque ref、恢复边界 |
| Artifact | artifactId、owner、runId、类型、大小、校验值、版本、访问策略 | diff、媒体、报告、多文件集合 |
| Sandbox | 执行域、workspaceRef、文件/进程/网络授权、资源限制 | VM、远端执行域、可信本地 bridge |
| Usage/Error | 实际模型、token/cost 来源、错误码、是否可重试、副作用是否已知 | 缓存用量、账单校准、供应商细节 |

所有 Capability 都需要经过特定版本、部署环境、权限与模型组合验证；不能只给整个项目打一个永久 `supportsTools: true`。

### 7.3 客户端接口示意（不是最终 SDK）

```ts
interface AgentClient {
  listCapabilities(): Promise<CapabilitySnapshot>;
  createSession(input: SessionInput): Promise<Session>;
  startRun(input: RunInput): Promise<RunAccepted>;
  getRun(runId: string): Promise<RunSnapshot>;
  events(runId: string, after?: string): AsyncIterable<AgentEvent>;
  respond(requestId: string, response: UserResponse): Promise<ResponseReceipt>;
  cancel(runId: string): Promise<CancelReceipt>;
}

interface HarnessAdapter {
  describe(deployment: DeploymentRef): Promise<VerifiedCapabilities>;
  start(input: NativeRunInput, host: HostPorts): Promise<NativeRunHandle>;
  // NativeRunHandle 负责接收事件、取消、响应原生请求和有条件恢复。
  // 不向 UI 暴露原生 session 对象或假定所有 Harness 都有相同方法。
}
```

上述类型是 schema 设计清单，尚未定义完整字段或生成代码。`startRun` 返回准入回执不表示任务完成；`cancel` 返回收到请求也不表示进程已经退出。客户端断开 `events` 订阅默认不取消 Run。

### 7.4 事件契约

建议最小事件集合：`run.accepted`、`run.started`、`message.delta`、`message.completed`、`tool.requested`、`approval.required`、`tool.completed`、`tool.failed`、`artifact.created`、`run.completed`、`run.failed`、`run.cancelled`。

【Claude 修订 2026-09-09】补齐与 §8.2 状态机对应的事件：`approval.resolved`、`run.awaiting_client`、`run.interrupted`、`run.outcome_unknown`。持久化策略直接采用上游一致做法（Pi `message_update` delta-only + `message_end` 权威；DeepSeek append-only 事件日志为唯一事实源）：**`message.delta` 只广播不持久化；恢复只保证 `message.completed` 之后的快照 + 每 Run 单调 `seq` 游标；不承诺 token 级重放。**

- 保留稳定 `eventId` 和每个 Run 的单调 `seq`，客户端按 ID 去重，不能假定网络只投递一次。
- 终态和工具结果必须持久化。高频 token 是否逐条持久化可延后决定；若只保存聚合消息，恢复接口必须提供 snapshot 并明确游标缺口，不能宣称无损重放所有 token。
- UI 的 accumulated 文本可以由 delta 投影生成；不能以局部文本出现作为成功证据。
- 原生事件可保存在受控扩展字段/原始日志中，避免让厂商字段成为通用 UI 的必需条件。
- 不要求导出私有思维链或不可见内部状态。只使用上游明确公开且允许保存的事件和摘要。

## 8. Session、Run、State 与切换策略

### 8.1 状态所有权

| 状态 | 权威所有者 | 客户端持有 |
| --- | --- | --- |
| XAI 会话与可见 transcript | XAI Session Store | 缓存与界面投影 |
| Run 准入、配置、状态与终态 | XAI Run Store | 最近状态和事件游标 |
| 业务实体与写操作回执 | 业务能力所属服务/存储 | 本地方案下保留既有 canonical authority |
| 原生 Harness session/checkpoint | 对应 runtime 的版本化存储 | 不直接持有原生对象 |
| 审批记录 | XAI 服务端授权记录；必要时桥接原生审批 | 仅展示与提交决策 |
| 密钥 | 对应后台凭据服务/隔离执行环境 | ref 和状态，不给平台级原始凭据 |
| Artifact | 后台产物存储/明确本地执行域 | 授权引用 |
| 【Claude 修订 2026-09-09】服务端工具幂等 | 后台 `tool_receipt` 唯一键 `(tenantId, accountId, toolName, logicalOperationId)`；同 ID 异参数拒绝 | 与浏览器 `commitCanonicalCommand` 的 localStorage receipts **不共用**（那条路径生产关闭，见 §4.2） |
| 【Claude 修订 2026-09-09】出站上下文授权 | 后台 `context_grant`（资源级、时效、来源） | 非零知识执行域的唯一入口（§5.0、§10.3） |

【Claude 修订 2026-09-09】默认落点（OPEN，可推进的假设而非定案）：Run/Session/Event（终态与工具结果）/Approval/Artifact 元数据放 Postgres（Supabase 已有 RLS 与 `account_id` 模型；新建 `agent.*` schema，与零知识 `encrypted_blobs` 物理分开）；产物字节放对象存储 + 签名引用；原生 Harness 状态留在 worker 卷，Run 只记 `nativeBinding {engineId, nativeSessionId, stateRef, lastSeq}`。P1 期允许用 SQLite 文件替代 Postgres，schema 保持一致。

同时保留平台 transcript 和原生日志并不意味着两个事实源竞争：前者负责产品语义，后者负责原生恢复；映射绑定要写明来源、版本和最后处理位置。

### 8.2 状态机草案

```text
accepted → queued → running ↔ awaiting_approval
                         ↔ awaiting_client
                         → cancelling → cancelled
                         → succeeded / failed

异常退出且副作用无法确认 → interrupted / outcome_unknown
```

客户端离线时，后台纯计算可继续；需要本机业务桥接的工具进入 `awaiting_client` 或按策略失败。`outcome_unknown` 不可自动当作可安全重试，也不可归为成功。

首版每个 session 同时只允许一个活动 Run；并发放在不同 session。需要分支会话时显式 fork，避免两个引擎同时修改同一原生历史。

### 8.3 三种切换

| 切换层级 | 目标 | 初期策略 |
| --- | --- | --- |
| 新 Session / 新 Run 选择 | 按配置/能力选择引擎 | 首版必须支持 |
| 同一逻辑 Session 的轮次边界切换 | 用户会话保持，后续 Run 换 Harness | 第二阶段能力；创建新原生绑定，导入允许的历史/摘要/事实 |
| 正在执行中的热切换 | 迁移工具进程、pending call、checkpoint | 不作为初期承诺；需要单独可行性验证 |

【Claude 修订 2026-09-09】三级切换落到每套的具体机制（四套原生都支持 resume/fork，因此 L1 可实现）：

| 级别 | Codex | DeepSeek Harness | OpenCode | Pi | 首版 |
| --- | --- | --- | --- | --- | --- |
| L0 新 Session / 新 Run 选引擎 | `thread/start` | ACP `session/new` | `POST /session` | `new_session` | 必须 |
| L1 同一 XAI Session 轮次边界切换（新原生绑定 + `importTranscript(PortableTranscript)`） | `thread/start` 首条消息注入可移植摘要 | `session/new` + seed | `POST /session` + `noReply` 注入 | SDK import / 首条 prompt 注入 | 第二阶段 |
| L2 执行中热切换 | 不承诺 | 不承诺 | 不承诺 | 不承诺 | 不做 |

L1 前置：当前 Run 已终态；不处于 `awaiting_approval`/`awaiting_client`；`outcome_unknown` 时禁止自动切换。Adapter 不支持 `importTranscript` 时抛 UNSUPPORTED，由路由拒绝切换而不是静默降级。

每个 Run 固定 engine/runtime/adapter/policy/tool/config 版本。升级默认版本只影响新 Run。已有 Run 继续原版本或明确中断，不静默改引擎。

跨引擎续接保存：已完成的可见消息、工具调用及真实结果、关键业务事实、用户约束、已生成产物引用、待办摘要。不可盲目复制原生权限票据、私有推理、缓存、开放 PTY、未完成工具状态。

切换的“无感”指界面和业务交互稳定，不保证回答措辞、能力、延迟或成本完全一致。对于能力缺失，应由路由选择合适引擎或明确失败；不静默降级权限、上传更多数据或伪造产物。

### 8.4 重试与故障转移

- 在没有副作用、输入仍有效且符合用户授权的情况下，才考虑安全重试或切换候选引擎。
- 工具请求使用平台生成的逻辑操作 ID，不能只依赖各家可能重复的 toolCallId。
- 幂等范围至少包含 owner/tenant、业务操作、版本和逻辑操作 ID；相同 ID 不同参数必须拒绝。
- 网络超时与工具执行失败分开。1500ms 本地 receipt 超时不能直接搬成后台执行超时。
- 外部系统无法同事务写入平台回执时，采用外部幂等键、结果查询或人工核实；不承诺全局 exactly-once。
- 重试和切换前核对已提交的业务结果，避免重复建任务、重复发消息、重复付款或重复发布。

## 9. Tool、Plugin 与 Sandbox

### 9.1 领域工具的执行流程

```text
Harness tool request
 → 原生参数映射到 XAI ToolCall
 → schema / owner / capability / resource version 校验
 → 如需审批，生成绑定具体操作的 ApprovalRequest
 → 审批有效性及当前权限复核
 → 幂等查询 / 所属业务模块执行
 → 记录真实结果与 targetId / artifact
 → 归一化结果返回 Harness 和前端
```

现有六个业务工具先保持独立名称与 reducer 路径。XAI Core/运行时基础设施不能反向导入任务、日历内部实现；由组合入口注入模块公开的能力端口。

审批应覆盖实际将执行的操作。若插件在审批后改写参数，必须重新校验并在变化影响授权时重新审批。UI 里显示确认卡不等于后端权限已经落实。

### 9.2 原生工具的特殊处理

不能假定每套 Harness 的 shell、文件或 MCP 工具都自动经过 XAI ToolBroker。每个 Adapter 要声明原生执行覆盖范围：

- 哪些工具可替换成 XAI wrapper；
- 哪些使用原生审批回调；
- 哪些只能由外部沙箱强制约束；
- 哪些首版必须禁用。

若无法证明原生工具受控，就不能声明完整的 XAI 安全能力。插件生命周期 hook 是扩展点，不是隔离边界；子进程也不是沙箱。

### 9.3 产品插件与 Harness 插件

XAI widget/plugin 负责产品能力与 UI；Harness plugin 负责某 runtime 的扩展。建议通过中立 ToolManifest 或明确注册接口桥接，而不迁移现有 PluginRegistry 到 Cordis 或直接装载四家的全部扩展。

MCP 可用于工具连接，ACP 可作为支持它的引擎的协议接入候选。二者都要经过 XAI 的 session/run/权限/数据边界评估，不能仅因存在某协议就宣称四套统一完成。

【Claude 修订 2026-09-09】ACP 覆盖面（UPSTREAM 2026-09-09）：DeepSeek Harness（`acp` profile）与 OpenCode（`opencode acp`，`@agentclientprotocol/sdk 0.21.0`）原生支持；Codex 官方 issue #9085 关闭为 not planned（仅社区桥 `@agentclientprotocol/codex-acp`）；Pi 文档未见。因此 **ACP 是 DeepSeek 与 OpenCode 两个 Adapter 的实现捷径（一个 ACP client 库服务两套），不是 HarnessAdapter 契约本身**；Codex 走 app-server，Pi 走 RPC/SDK。

### 9.4 执行环境

文件访问、shell、网络必须位于同一个明确 execution world：workspace 路径、进程 cwd、artifact 根目录和网络策略要一致。不能让文件工具读容器而 shell 却落到高权限宿主。

纯文本/受控业务工具型 Run 可以没有 shell。编码型 Run 才配置文件与进程能力，并限制 workspace、出网、CPU/内存/时长/磁盘；取消要覆盖子进程树，退出要回收临时资源。

## 10. Context、数据、凭据与多平台边界

### 10.1 Context 构造

将数据读取、上下文选择、模型 wire 序列化分开。输入包括中立 transcript、业务快照、资源引用、工具结果与明确授权的外部材料。

ContextSource 应带来源、owner、采集时间、权限分类和版本；不要将不可信文件文本或工具输出当作系统指令。预算至少限制总大小、单项大小、数量和输出预算，不能只靠“预计 600 token”。原生压缩策略可以保留，但需记录可见摘要及语义边界。

### 10.2 浏览器数据不是后台数据库

方案允许三类能力并存：

| 执行方式 | 适用场景 | 限制 |
| --- | --- | --- |
| 服务端权威业务 API | 真正后台无人值守修改业务 | 需先有明确业务数据所有权和权限契约 |
| 在线客户端桥接 | 保留现有浏览器 local-first 数据 | 客户端关闭时无法完成这些操作 |
| 独立后台 fixture/workspace | 四套 Harness 独立部署验收 | 只证明运行平台，不代表真实业务已接入 |

不要为了验证 Harness 就先全量迁移业务存储。也不要将 fixture smoke 包装成真实用户数据功能上线。

### 10.3 syncScope 与服务端运行记录

ADR-0013 D4 的账号同步、浏览器/桌面数据持久化、向模型发送一次性上下文、服务端原生 Run 记录是不同决策。

- 客户端既有 `device-local` 实体不得因后台接入自动改成 account-sync 或上传。
- 需要发送到远端的上下文另做出站数据授权和最小化设计，不以“不是同步”绕过本地数据限制。
- 新增客户端持久化实体逐项填写 syncScope。
- 服务端原生 Run/Event/Artifact 明确 tenant/account ownership、retention、删除规则及读取授权；不能机械标为 `device-local` 却永久放在后台。
- 会话/账号删除需覆盖 XAI 存储、原生 Harness 状态卷、缓存和产物，并说明日志保留政策。
- 【Claude 修订 2026-09-09】**非零知识执行域条款（需用户确认，§15 O13）：** Agent 执行域与 D4 账号云同步是两个数据面。D4 保持零知识；Agent 执行域只接收用户/策略经 `context_grant` 显式授权出站的上下文、工具参数与产物，这些数据在服务端以明文形式被 Harness 与模型处理，其 Run/Event/Artifact 记录属服务端所有、按 tenant/account 隔离并有 retention 与删除规则。任何把 D4 加密 blob 解密后送入执行域的行为都必须经过独立授权，不得由"这不是同步"推导出来。P1–P3 只使用非敏感 fixture，真实用户数据接入前（P4）再签资源级授权设计。

### 10.4 凭据与租户隔离

当前浏览器 BYOK 隔离是可复用的语义基础，不是可以复制到后台共享目录的凭据库。平台凭据只向受控 worker 注入；API、UI、日志和 artifact 中使用 credentialRef/状态。

原生 HOME、session 目录、插件配置、OAuth cache、workspace 不跨租户共享。控制面认证和模型供应商认证分开设计。模型订阅、第三方 SDK 和商业托管使用边界在选型时依据上游条款确认，本文件不承诺任何特定账户可用于多人服务。

本地 connector 若未来接入，使用经过认证且限定资源范围的通道；后台服务不能凭用户会话 ID 就访问其整台电脑。

## 11. 四套系统的研究价值、接入方式和限制

以下是 PROPOSED 选型方向，依赖 2026-09-08 读取的一手资料。实际版本与 API 必须在部署 spike 中确认，不复制不确定的 SDK 调用作为生产实现。

### 11.1 Codex

- 重点研究：Thread/Turn/Item 分层、执行事件、交互审批、会话恢复、权限与沙箱配置。
- 接入候选：编码后台任务评估 SDK；需要深度审批与客户端事件的场景评估 App Server 协议。两者不在 XAI 通用 API 中暴露原生类型。
- 复用方式：优先协议/SDK 边界，不 fork 整个客户端或把 Rust 核心复制进业务模块。
- 限制：所读官方文档对 App Server/远程连接及动态工具有实验性说明；产品成熟度与某个嵌入接口的生产保障不是同一件事。
- 独立部署验证：无 UI 启动、真实任务、版本匹配、事件、取消、原生恢复、工具权限覆盖。
- 不适合原样引入：现成 UI、个人账户体验、默认权限、原生会话文件作为 XAI 唯一会话格式。

依据：[Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)、[App Server](https://learn.chatgpt.com/docs/app-server)。

【Claude 修订 2026-09-09，UPSTREAM 2026-09-09 读取】
- 确认版本：`rust-v0.154.0`（2026-09-09，非预发布）；`@openai/codex-sdk 0.154.0`（Node ≥18）；Python `openai-codex 0.147.0`；Apache-2.0。约每周一个稳定 minor。`developers.openai.com/codex/*` 已 308 重定向到 `learn.chatgpt.com/docs/*`。
- 部署：单 Rust 二进制（`codex-*-unknown-linux-musl`，另有 `codex-app-server-*`、`bwrap-*` 资产）；状态目录 `$CODEX_HOME`（`config.toml`、`auth.json`、`sessions/` rollout JSONL）；`--ephemeral` 不落盘。
- **接入接口更正：受控运行用 `codex app-server`（JSON-RPC 2.0，stdio 默认 / `unix://`），不用 TS SDK。** 原因：审批（`item/commandExecution/requestApproval`、`item/fileChange/requestApproval` → `accept/acceptForSession/decline/cancel`）、`turn/interrupt`、`thread/fork`、`dynamicTools` 只在 app-server；`exec`/SDK "never prompts"，SDK 的 `signal` 只是 kill 子进程。`ws://` 传输为实验性且不建议生产。`codex exec --json` 稳定，可作为最先的纯文本 smoke。ACP 官方 not planned。
- 自定义工具：优先 MCP client `[mcp_servers.*]`（`enabled_tools/disabled_tools`）；`dynamicTools` 为 experimental，不作首版依赖。结构化输出：`--output-schema` / `turn/start.outputSchema`。
- 绕过 broker 的原生工具：shell（PTY `unified_exec`）、`apply_patch`、`web_search`（默认 `cached`，需 `disabled`）、MCP servers。限制：`--sandbox read-only|workspace-write|danger-full-access`、`externalSandbox`、`approval_policy`、`shell_environment_policy`、`--ignore-user-config`。Linux 沙箱 bubblewrap（需非特权 userns），Landlock legacy。
- 凭据资格：OpenAI API key（`CODEX_API_KEY`）或 Business/Enterprise access token / service account / workload identity。**ChatGPT 个人套餐 OAuth 不适用于共享后台**（OpenAI Terms 禁止共享账号凭据；帮助中心页面本次 403，原文 UNVERIFIED）。
- 首个 smoke：`CODEX_HOME=/srv/codex CODEX_API_KEY=… codex exec --json --sandbox read-only --skip-git-repo-check -C /srv/fixture -c web_search=disabled --output-last-message out.md "<任务>"`；随后 app-server stdio `initialize → thread/start → turn/start` 验证审批与 interrupt。缺失：API key、宿主 bwrap/userns、fixture 仓库。
- 资格：隔离部署验证 **可以**；生产默认 **未评估**（前提 API key、容器内、不用 ws://、不用 dynamicTools）。

### 11.2 DeepSeek Harness

- 重点研究：Cordis 的插件组合、服务注册、卸载清理、工具执行拦截和持久事实/实时事件分离。
- 接入候选：通过官方 SDK/profile 启动，再由 XAI Adapter 连接；工具通过受控插件或原生工具桥接。
- 复用方式：吸收可替换能力与可清理生命周期，不把整个 XAI 改成 Cordis 应用。
- 限制：developer preview，官方安全说明不把它视为生产安全保障；所读 sdk-minimal 默认权限宽且省略多个服务，不是产品安全默认模板。
- 独立部署验证：锁定 profile/插件树、最小工具集、协议输出完整性、取消、实例隔离；隔离实验环境可先部署，不直接加入生产默认路由。
- 不适合原样引入：所有默认插件、动态任意安装、全局可变配置、未经校验的模型生成代码执行。

依据：[架构](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)、[工具流水线](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-execution-pipeline.md)、[安全说明](https://github.com/deepseek-ai/deepseek-harness/blob/master/SAFETY.md)、[SDK minimal](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/bundle/sdk-minimal/README.md)。

【Claude 修订 2026-09-09，UPSTREAM 2026-09-09 读取】
- 确认版本：`dsh-v0.1.5-rc.1`（2026-09-10 UTC，**prerelease；仓库没有任何非预发布 Latest**）；`@deepseek-ai/dsh 0.1.5-rc.1`；Python `deepseek-harness-sdk 0.1.5rc1`；MIT；仓库 2026-08-13 创建，默认分支 `master`（`main` 链接 404）。README："developer preview…THERE WILL BE COMPATIBILITY-BREAKING CHANGES"。
- 部署：Node `^22.19.0 || >=24`，无独立二进制（Python SDK 附带 `deepseek-harness-runtime-bin` wheel）；状态 `$DSH_HOME`（profiles、`settings.yaml`、`.credentials.yaml`、session JSONL v3，不向下兼容）。Provider：DeepSeek API key，或经 `llm-pi-ai` 接 OpenAI/Anthropic/OpenAI-compatible。
- **接入接口更正：受控运行用 `--profile acp`（ACP stdio：`session/new|prompt|cancel`、`request_permission`、可声明 MCP servers），不用 `sdk`/`sdk-minimal`。** 原因：SDK 协议（`dsh-sdk-protocol`，`serverInfo.version "0.0.1"`，无兼容承诺）只有 `initialize/session/prompt/shutdown` + 通知，"server-to-client requests remain unimplemented"——**没有审批回程，没有中途取消**（官方："abandon a turn by closing the runtime process"）；`sdk-minimal` 固定 `danger-full-access` 且无 approval service。`--profile headless` 只输出纯文本（无 JSON 事件），可作最先的纯文本 smoke。
- 自定义工具：仅进程内 Cordis plugin（`ctx.tools`）或 `--patch` 覆盖；SDK 线上不可注册；用 MCP client 接 broker（MCP client 存在，包位置 UNVERIFIED）。无 output-schema 结构化输出（UNVERIFIED/缺失）。
- 绕过 broker 的原生工具：shell（PTY）、fs `read/write/edit`、`glob/grep`、`web_search/web_fetch`、skills、jobs、subagents（含 codex/claude-code 子代理）、**`tool-cordis`（允许模型运行时定义并加载新插件，受控部署必须移除）**。限制靠组合：不挂载/patch 掉对应 bundle 行；`fs-local` 换 `fs-sandbox`；presets `read-only|workspace-write(默认 ask)|danger-full-access`；`DSH_PERMISSION_MODE`。Linux 沙箱 bwrap + Landlock，官方要求一次性 VM/容器。默认遥测 `FEEDBACK_ONLY`，需 `DISABLED`。
- 凭据资格：API key only（`DEEPSEEK_API_KEY` 或兼容 key）。
- 首个 smoke：`DSH_HOME=/srv/dsh DEEPSEEK_API_KEY=… DSH_TELEMETRY_MODE=DISABLED npx @deepseek-ai/dsh@0.1.5-rc.1 --profile headless "<任务>"`；随后 `--profile acp` 经 XAI ACP client 验证 `request_permission` 与 `session/cancel`。缺失：API key、Node 22.19+、bwrap、一次性容器。
- 资格：隔离部署验证 **可以**；生产默认 **不可**（SAFETY.md 明言非生产、未经安全审计）。

### 11.3 OpenCode

- 重点研究：provider/model 能力目录、headless server、SDK 与客户端分离、结构化 session/message/tool 事件。
- 接入候选：XAI Adapter 通过 Server/SDK；ACP 可作为需要时的替代协议。
- 复用方式：模型能力解析与事件边界的设计，不用硬编码枚举假装任意模型都兼容全部工具。
- 限制：原生服务认证、目录作用域、插件和文件权限必须按 XAI 多租户要求重新界定；不能把原生 HTTP 服务直接作为公有平台 API。
- 独立部署验证：实例健康、认证、SSE、断线查询、取消、至少一个真实 provider、工具和 workspace 隔离。
- 不适合原样引入：整套 TUI/Web UI、个人 auth.json、默认项目目录模型成为所有产品的领域模型。

依据：[Server](https://opencode.ai/docs/server/)、[SDK](https://opencode.ai/docs/sdk/)、[Providers](https://opencode.ai/docs/providers/)、[Plugins](https://opencode.ai/docs/plugins/)、[ACP](https://opencode.ai/docs/acp/)。

【Claude 修订 2026-09-09，UPSTREAM 2026-09-09 读取】
- 确认版本：`v1.18.30`（2026-09-09）；`opencode-ai 1.18.30`；仓库现为 `anomalyco/opencode`（`sst/opencode` 重定向）；MIT；1–3 天一 patch。
- 部署：单编译二进制（`opencode-linux-x64/arm64(-musl)`），不需 Node；状态 `~/.local/share/opencode/`（`auth.json`、`project/` 会话、`log/`）、`~/.config/opencode/`、`~/.cache/opencode/`（启动时 Bun 安装插件/provider 包）；配置多层**合并**（含 `.well-known/opencode` 远端托管配置）。按独立 `HOME` 隔离实例（XDG 变量支持 UNVERIFIED）。
- 接入接口确认：`opencode serve --hostname --port`（HTTP + SSE `GET /event`；OpenAPI 3.1 `GET /doc`；`@opencode-ai/sdk` 自 OpenAPI 生成）；`opencode run --format json`；`opencode acp`（stdio）；MCP client。**认证仅可选 HTTP basic（`OPENCODE_SERVER_PASSWORD`），无 token/mTLS**，必须置于私网 + 反向代理。`/experimental/*`、`lsp` 标 experimental。
- 审批与取消：`permission` 配置 `allow|ask|deny`（glob、按 agent 覆盖）→ `permission.updated` 事件 → `POST /session/:id/permissions/:id {once|always|reject}`；`POST /session/:id/abort`。默认多数为 `allow`（`doom_loop`/`external_directory` 为 ask，`.env*` 读 deny）——受控部署必须 deny-by-default。`run --auto` 全放行，禁用。
- 自定义工具：`.opencode/tools/*.ts`（`@opencode-ai/plugin` `tool()`，**同名可覆盖内建 `bash/read`**）、plugins hooks、MCP（`"<server>_*": "ask"`）。结构化输出 `format:{type:"json_schema"}` 带重试；`snapshot` + `GET /session/:id/diff` 采集产物。
- 绕过 broker 的原生工具：`bash, edit, write, read, grep, glob, apply_patch, webfetch, websearch, skill, task(子代理), lsp` + 全部 MCP 工具。**无内置沙箱。** 默认外联：autoupdate、`/share` 上传（`share:"disabled"`）、Bun 安装出网。
- 作用域：单实例多目录在官方 server 文档中不完整（`x-opencode-directory` 仅见 issue #7376，UNVERIFIED-in-docs）→ **部署单位 = 每租户 workspace（或每 Run）一个 server 进程**。
- 凭据资格：任意 provider API key / 内部网关 baseURL；Anthropic Pro/Max OAuth 被明令禁止，其他订阅 OAuth 不进入共享后台。
- 首个 smoke：独立 `HOME` + `opencode.json`（`share:"disabled"`、`autoupdate:false`、权限 deny-by-default 只留 `read`）→ `OPENCODE_SERVER_PASSWORD=… opencode serve --hostname 127.0.0.1` → `GET /doc`、`GET /event`、`POST /session`、`POST /session/:id/message`（含 `format.json_schema`）→ 触发 `bash` 观察 `permission.updated` 并 `reject` → 中途 `abort`。缺失：provider key、Bun/npm 出网决策、TLS/认证前置代理、目录作用域验证。
- 资格：隔离部署验证 **可以**；生产默认 **不可**（认证、插件安装出网、目录隔离待加固/验证）。

### 11.4 Pi

- 重点研究：模型 API、agent-core 与 coding-agent 的分层；context 转换、工具钩子、流式事件、嵌入式 SDK。
- 接入候选：后台 worker 使用 agent-core 或明确裁剪的 coding-agent SDK；需要进程隔离时可评估 RPC。
- 复用方式：以现有 XAI 领域工具作为明确工具集，快速验证最小统一契约。
- 限制：所读官方说明没有内置限制文件/进程/网络/凭据访问的权限系统；宿主必须提供实际隔离。旧包名与当前上游名称可能变化，安装前核对。
- 独立部署验证：受控工具集、context 输入、真实请求、取消、状态持久化方案、禁止意外装载个人扩展。
- 不适合原样引入：默认完整 coding 工具、所有自动发现的插件、无限循环或将所有权限委托给 hook。

依据：[Agent Core](https://github.com/earendil-works/pi/tree/main/packages/agent)、[SDK](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md)、[权限与容器说明](https://github.com/earendil-works/pi#permissions--containerization)。

【Claude 修订 2026-09-09，UPSTREAM 2026-09-09 读取】
- 确认版本：`v0.85.1`（2026-09-05）；`@earendil-works/pi-coding-agent 0.85.1`（Node ≥22.19.0）；MIT；约每周一发。2026-05-07 自 `badlogic/pi-mono` 迁移到 `earendil-works/pi`，npm scope 自 0.74.0 起为 `@earendil-works/*`（旧 `@mariozechner/*` 已 deprecated）。
- 分层：`pi-ai` → `pi-agent-core` → `pi-coding-agent`（CLI+SDK）；`pi-tui`、`chord`；**experimental**：`pi-protocol`（CBOR，无兼容承诺）、`pi-server`（Unix socket）、`pi-client`。`web-ui/mom/pods` 不在当前树（UNVERIFIED）。**没有 HTTP server。** ACP 与 MCP client 文档未见（UNVERIFIED/缺失）。
- 部署：纯 JS（`npm i -g --ignore-scripts @earendil-works/pi-coding-agent`）；状态 `~/.pi/agent/`（`PI_CODING_AGENT_DIR`）：`settings.json`、`auth.json`、`trust.json`、`sessions/<encoded-cwd>/*.jsonl`（v3 DAG，fork 为新文件 `parentSession`）、`extensions/`、`skills/`、`prompts/`；项目 `.pi/` 受 trust gate。默认外联：版本检查、遥测（`PI_OFFLINE=1`、`PI_TELEMETRY=0`）。
- 接入接口确认：`pi -p`（print）、`pi --mode json`（JSONL 事件）、`pi --mode rpc`（JSONL stdin/stdout：`prompt/steer/follow_up/abort/get_state/fork/compact/...`；事件 `agent_start/end`、`turn_start/end`、`message_start/update(delta)/end(权威)`、`tool_execution_*`、`extension_ui_request`）、SDK `createAgentSession({tools, customTools, resourceLoader, sessionManager})`。首版选 RPC（进程隔离）或进程内 SDK 二者之一。
- 审批与取消：**无内置权限系统**（README 原文）。审批只能自建：扩展 `tool_call` hook `{block:true, reason}`；RPC 下 UI 类审批走 `extension_ui_request`（有 timeout 自动默认，不可作为安全门）；SDK `beforeToolCall`。取消 `abort`/`abort_bash`。无 JSON-schema 结构化输出（UNVERIFIED/缺失）。
- 自定义工具：`defineTool` + `customTools` + `tools` allowlist（工具收到 `AbortSignal`）——broker 以进程内 shim 注入。
- 绕过 broker 的原生工具：默认 `read, write, edit, bash`（`grep/find/ls` 可选）；关闭：`--tools`、`--no-builtin-tools`、`--no-extensions`、`--no-skills`、`--no-prompt-templates`、`--no-context-files`、`--system-prompt`。**无沙箱**；官方建议 Docker / Gondolin microVM / OpenShell；勿把宿主 `~/.pi/agent` 挂进容器、勿在容器内 `/login`。
- 凭据资格：任意 provider API key（环境变量、`--api-key`、SDK `setRuntimeApiKey`）；个人 `/login` OAuth 不进入共享后台。
- 首个 smoke：容器内 `PI_CODING_AGENT_DIR=/state PI_OFFLINE=1 <PROVIDER>_API_KEY=… pi --mode rpc --no-extensions --no-skills --no-prompt-templates --no-context-files --tools read --session-dir /state/sessions`，stdin 发 `{"type":"prompt",…}`，断言 `agent_start…message_end…agent_end`；中途 `abort`；再挂 `tool_call` block 扩展验证拒绝。缺失：provider key、容器、`--mode json` 是否读 stdin（未文档化）。
- 资格：隔离部署验证 **可以**；生产默认 **不可**（无权限层；server/protocol experimental）。

### 11.5 选型结论

这不是“四选一”决策。四套分别完成后台独立部署验证是共同目标；是否进入生产、用于哪个任务类别、使用哪个版本由能力与风险证据决定。

研究优先看 Codex 的执行契约、DeepSeek 的插件边界、OpenCode 的多模型与 server-client 解耦、Pi 的嵌入式分层。部署试点可先 Pi，再 Codex、OpenCode、DeepSeek；该顺序只是减少初始集成成本，不改变四套都要独立验证的范围。

【Claude 修订 2026-09-09】部署顺序改为**按凭据可得性决定**，不固定"先 Pi"：有 OpenAI API key → Codex 先（`exec --json` 单二进制、稳定 JSONL，再 app-server）；只有 DeepSeek/Anthropic/其他 key → OpenCode 先（单二进制 + HTTP 审批 API，provider 无关）；两者都不便 → Pi（RPC，但需 Node 22.19+ 且无审批）。DeepSeek Harness 不作为第一套（prerelease、Node 依赖、只有 ACP 才有审批）。四套仍全部在 P2 范围内，缺 key 的那套标 BLOCKED_EXTERNAL 而不是出列。横向能力矩阵见 CLAUDE_REVIEW §3.5。

## 12. 分阶段实施计划（修订后）

上一轮建议较偏向先抽离现有聊天代码，再接外部 runtime。根据用户最新澄清，修改为以下两条轨道：

- 基础轨道：后台运行环境 → 四套独立跑通 → 统一适配与切换。
- 产品轨道：保留现有功能 → 基础轨道验证后逐步接入业务与 UI。

不能让全面前端重构、全量数据迁移、Admin UI 完工成为四套独立后台验证的先决条件。

| 阶段 | 范围与交付 | 验收门槛 | 本轮状态 |
| --- | --- | --- | --- |
| P0 设计审查 | 本提案、Claude findings、修订方案、OPEN 决策表、最小契约 | 目标不遗漏；实现与推测区分；评审后再决定正式 ADR | DRAFT |
| P1 后台实验宿主 | 真实环境清单、隔离 workspace、secret 注入、运行回执模板、进程监督 | 无 UI 可驱动一个最小 runtime；失败可见、可停止、日志无 secret | NOT_STARTED |
| P2 四套独立跑通 | 每套自己的部署清单、启动/任务/工具/取消/产物脚本及证据。【Claude 修订 2026-09-11】每套增加：fork 仓库 + `vendor/harness/<engine>` 钉引用 + vendor card + `upstream-pinned`/`fork` 两个构建变体（§13.4） | §6 矩阵按"引擎 × 变体"逐项填证据；四套基础独立任务在两个变体上全部通过或逐项明确外部阻塞 | NOT_STARTED |
| P3 统一 Adapter 与切换 | Agent API、Harness Catalog、Run/Event Store、四套适配、契约测试 | 同一调用方可在四套间选择；新 Run 切换不改 UI/业务调用代码；不支持能力明确拒绝 | NOT_STARTED |
| P4 首个真实业务闭环 | Builtin 兼容 Adapter、现有六工具与账号回执复用、一个窄业务入口。【Claude 修订 2026-09-09】前置条件：REL-03 bug-verify 通过并确定生产 activation 策略（§4.2）；O13 非零知识执行域条款获用户确认；Builtin Adapter 只复用 `llmProvider` wire 层，transcript/system prompt 由 Agent Service 构造；服务端幂等键落地（§8.1） | 保留确认/恢复/账号行为；业务结果真实；后台与客户端桥接区别可观察；重复请求与异参数冲突有回执 | NOT_STARTED |
| P5 多平台与生产资格 | Web/App 客户端、用量、隔离、故障恢复、控制面、产物策略 | 按场景和引擎批准生产范围；App 经过 D3，Admin 遵循 roadmap | NOT_STARTED |
| P6 新 Harness 扩展演练 | 新 Adapter 样例、模板和兼容检查 | 新增一个 runtime 不修改已有业务/UI，已有回归通过 | NOT_STARTED |

P1 可以用 Pi 验证宿主骨架，P2 逐套完成。P3 的契约草图在 P0/P1 即可存在并随实际接入校正，但“统一完成”不能先于真实运行证据。P4 不要求每个业务必须用四套跑到完全相同效果，而要求为各能力明确路由支持范围。

### 12.1 最小首个切片

首个实现切片建议是：独立后台 Runner + 一个受控示例 workspace + 一个真实模型任务 + 一个自定义只读工具 + 结构化结果/取消/日志。它不修改现有聊天 UI，不接真实用户数据库，不新增大规模调度系统。

这一切片只证明宿主和第一种 runtime 可运行，不得当作用户“四套后台基座”目标已经完成。

【Claude 修订 2026-09-09】切片 S1 的精确范围（本轮不实施；完整版见 CLAUDE_REVIEW §6）：

```text
deploy/agent-harnesses/README.md                 # 清单格式、evidence 格式、出网/隔离规则
deploy/agent-harnesses/_kit/{Dockerfile.base, run-smoke.sh, evidence.schema.json}
deploy/agent-harnesses/<first>/{Dockerfile, config/*, smoke-text.sh, smoke-tool.sh, smoke-cancel.sh, EVIDENCE/*.yaml}
packages/agent-toolbroker-mcp/                   # 最小 MCP server：xai.fixture.read（只读）；无 React/Tauri/业务导入
packages/agent-contract/src/{evidence,events}.ts # 仅类型/schema
```

【Claude 修订 2026-09-11】按 §13.4，S1 增加：`<first>` 的 fork 仓库建立并推送 `xai/main`（外部账号动作，先经用户确认）、`vendor/harness/<first>` submodule 钉住、`deploy/agent-harnesses/<first>/build.env` 与 `patches/`、`docs/vendor-cards/harness-<first>.md`；三个 smoke 场景对 `upstream-pinned` 与 `fork` 两个变体各跑一遍，evidence 记录 `buildVariant` 与 `sourceSha`。

依赖：一台可跑容器的 Linux 宿主（O1）、一把与 `<first>` 匹配的 API key、`@modelcontextprotocol/sdk`、fork 托管 org（O15）。不依赖 apps/web、Supabase、Admin、任务/日历数据。`<first>` 按 §11.5 的凭据规则选择。验证：三个场景各一份 evidence；取消后无遗留子进程；容器出网只命中白名单；evidence 中无 secret。回退：删除新增目录与两个 package，无现有模块引用。治理：归 `web` 规划下的共享基础设施；进入 Workflow V2 前先过 `xai-feature-brief`；不触发 D3/D4。S1 明确不做：Agent HTTP API、Postgres schema、四套全部、业务六工具接入、任何前端或 Admin 改动。

### 12.2 回退方式

- 产品接入前，现有 Builtin 流程保持原状。
- 产品接入后按 feature flag/场景配置回退；回退仅影响新 Run，已发生写入不能通过重发 Builtin 请求回滚。
- 每个 Harness 的版本、部署和流量可单独停用；停用时先处理活动 Run 与待审批请求。
- schema 升级向后兼容或显式迁移；保留旧原生状态版本及有界恢复方案。

## 13. 扩展性、包边界与版本治理

### 13.1 新 Harness 的接入清单

1. 添加 descriptor 和锁定版本的部署配置。
2. 实现 Adapter 映射，不改通用 UI。
3. 声明并验证模型/工具/审批/状态/产物/取消能力。
4. 证明原生工具的权限覆盖，声明无法支持的部分。
5. 完成独立 smoke、共同 contract suite、错误与隔离测试。
6. 在 Catalog 注册，经路由策略启用；旧 Run 保持旧版本。
7. 提供升级、退役、状态保留与数据清理方案。

### 13.2 包/目录示意（尚未创建）

```text
packages/agent-contract/          # 无 React / Tauri / 厂商 SDK 的 schema
apps/agent-service/               # API 与组合入口；实际归属待架构审查确认
  harnesses/{codex,deepseek,opencode,pi}/
  runners/                       # 环境启动/监督；初期可同一服务
  tools/                         # broker 与注入端口，不复制业务 reducer
  storage/                       # Run/Event/Session/Artifact adapters
deploy/agent-harnesses/           # 声明式部署与 smoke 配置
```

这是候选布局，不修改当前六模块路由、不自行新增第七条长期产品线。基础设施不依赖具体业务内部模块，客户端只依赖契约。等出现真实复用再拆更多 package，不先建设几十个空目录。

### 13.3 版本快照与能力协商

Run 至少记录：contractVersion、engineId、runtimeVersion、adapterVersion、deploymentId、provider/model、toolsetVersion、policyVersion、context/输入引用和执行域。

路由时检查 `requestedCapabilities ⊆ verifiedEffectiveCapabilities`。权限不足与运行时不支持使用不同错误；不能靠提示词告诉模型“不要调用”来替代能力关闭。

升级先在测试部署跑兼容 suite，再开放新 Run；老实例 drain。原生状态格式不兼容时创建新绑定，通过平台 transcript/摘要续接，或标记无法恢复，不能强制解释旧文件。

### 13.4 源码采用层级：L3.5 与 L4 并行，四套全部 fork（USER-CONFIRMED 2026-09-11）

【Claude 修订 2026-09-11】用户于 2026-09-11 明确：**L3.5 与 L4 都是必要的，一开始就都要做。** 四套 Harness 全部 fork 并安装好，每套都能独立运行、独立跑通；后续由多人**并行、独立**地对各套做深度优化定制。本节记录该决策及其对布局、开关与多人协作的要求。它**否定**了 A2K 姊妹项目分析中"默认不 fork、L3 + L3.5、fork 按引擎经 ADR 单独决定"的默认值（该结论位于 `Any2Knowledge_Agent_System` 的 `docs/reviews/data-agent-harness/…foundation-design.md` §8.5，commit `be61e726`，本仓库未改动它，需在该仓库另行同步）。

层级定义（沿用姊妹项目术语）：

| 层级 | 含义 | 本仓库地位 |
| --- | --- | --- |
| L1/L2 协议 / 服务 | 通过 app-server / ACP / HTTP 驱动官方产物 | 每套的运行接口（§11、§3.5 矩阵） |
| L3 库 / 插件 | 宿主程序 import 上游库或组合上游插件 | Pi、DeepSeek 的接入方式 |
| **L3.5 钉源码自建 + 补丁集** | 以 pinned SHA 的上游源码在 worker Dockerfile 内构建，本地小修改以 `patches/*.patch` 叠加 | **必做**：所有 upstream-pinned 构建变体的制品策略 |
| **L4 fork** | 拥有每套的 fork 仓库，在 fork 内做深度定制，从 fork 构建 | **必做**：四套一开始就 fork，作为深度定制主线 |

规则：

1. **两个构建变体并存，同一契约验收。** 每套维护 `upstream-pinned`（L3.5：上游 SHA + 补丁）与 `fork`（L4：fork 分支 SHA）两个变体；两者都必须通过同一份 contract suite 与 §6.2 smoke。`upstream-pinned` 是回归基线与上游追踪线，`fork` 是定制线。§6.3 验证矩阵按"引擎 × 变体"填写。
2. **fork 仓库独立托管，monorepo 只钉引用。** 四套 fork 各自是独立 Git 仓库（候选：`<org>/codex`、`<org>/deepseek-harness`、`<org>/opencode`、`<org>/pi`，org 待用户确认，见 §15 O15）。本仓库通过 `vendor/harness/<engine>` 的 git submodule（或仅 SHA 文件）钉住 fork 的提交，**不**把四套源码 subtree 进 monorepo（Codex 为 Rust 且日均数十提交，OpenCode 体量大，subtree 会撑爆仓库并让多人并行改动互相干扰）。每套一张 vendor card：`docs/vendor-cards/harness-<engine>.md`，沿用现有 R-1/R-2/R-3 格式（声称对应 / 引入方式与许可证 / sync 记录）。
3. **每套一个独立开发文件夹，构建与部署互不依赖。** `deploy/agent-harnesses/<engine>/` 只含该引擎的 Dockerfile、`build.env`、config、patches、smoke 脚本与 EVIDENCE；任何一套的 fork 构建失败不影响其余三套。
4. **开关。** 每套 `build.env`：`HARNESS_SOURCE=upstream-pinned|fork`、`HARNESS_REF=<sha>`、`HARNESS_PATCHES=on|off`。Catalog descriptor 增加 `buildVariant` 与 `sourceSha`；每个 Run 记录二者（§13.3 快照字段扩展）。路由可按引擎选择变体；默认变体由 operator 配置，不静默切换。
5. **多人并行定制的分工与分支。** 每套 fork 有一位 owner；fork 内 `xai/main` 为集成分支，`xai/<person>/<topic>` 为短分支；`upstream/main` 为追踪 remote。上游同步节奏按引擎单独决定（Codex/OpenCode 高频，建议每周；DeepSeek prerelease，按 rc；Pi 按 release）。合并到 `xai/main` 的门槛是：contract suite 绿、该引擎 §6.2 smoke 绿、evidence 已提交。跨引擎的共享改动（契约、broker、evidence 格式）只在本仓库改，不在 fork 内复制。
6. **补丁与 fork 的分工。** 能以补丁表达的小改动放 `patches/`（同时叠加到两个变体，保持 rebase 成本可见）；触及 agent loop、wire API、沙箱实现、存储模型的深度改动放 fork。补丁数与 fork 偏离量作为每套的可度量健康信号写入 vendor card R-3。
7. **fork 不改变接入接口。** §11 每套的推荐接口（Codex app-server、DeepSeek ACP、OpenCode serve、Pi RPC/SDK）在两个变体上一致；fork 内新增能力通过 Adapter 的 `describe()` 以 verified capability 暴露，不改通用 UI 或业务调用代码（§13.1）。
8. **许可证义务。** Codex Apache-2.0（保留 NOTICE、标注修改），其余 MIT（保留版权与许可声明）。每套 vendor card R-2 记录义务与 fork 首个提交。

对阶段计划的影响：P2 的每套交付物增加"fork 仓库建立 + submodule 钉住 + `fork` 变体 smoke"；S1（§12.1）的 `<first>` 一并建立 fork 与两个变体。fork 仓库的创建、org 选择与推送属**外部账号动作**，需用户确认后执行（§15 O15）。

## 14. 验证策略与证据格式

### 14.1 分层验证

- Adapter contract：ID 映射、顺序、终态、未知事件、坏 payload、错误与能力缺失。
- 原生集成：每套真实 runtime 的启动、认证、工具、产物、取消、重启。
- 业务闭环：当前账号写入成功/失败、重复请求、不同参数冲突、账号切换、删除/恢复、权限变化。
- 生命周期：网络断开不等于取消，进程退出不等于成功，活动工具的取消与清理。
- 切换：新 Run、轮次边界、能力不兼容、已有副作用、旧版本活跃时升级。
- 数据隔离：不同租户 session/workspace/artifact/credential 不可互读；客户端本地数据无隐式上传。
- 产品兼容：现有确认 UI、保存失败恢复、原有任务/日历 reducer 行为不倒退。

只读场景可对多引擎做比较；有副作用的操作不可同时 shadow 执行到真实业务存储。

### 14.2 单次验证回执模板

```yaml
evidenceVersion: 1
repositoryCommit: <exact-commit>
engineId: <codex|deepseek-harness|opencode|pi>
runtimeVersion: <pinned-version>
adapterVersion: <version-or-native-smoke>
deploymentId: <isolated-instance>
environment: <os-arch-and-execution-kind>
model: <actual-provider-and-model>
scenario: <scenario-id>
status: <PASS|FAIL|BLOCKED_EXTERNAL|NOT_SUPPORTED>
inputFixture: <non-secret-reference>
runId: <id>
resultRef: <result-reference>
artifactRef: <optional-reference>
cleanupVerified: <true|false>
limitations: <specific-limitations>
```

真实模型耗时与费用由环境决定，本文件不编造统一 benchmark、预算或四套性能排名。总预算策略要同时覆盖队列准入、运行时间和工具资源；缺失供应商 usage 时标为 unknown/estimated，并给出来源。

## 15. 关键风险与未决事项

| 编号 | 问题 | 推荐默认值/处理方式 | 决策时点 |
| --- | --- | --- | --- |
| O1 | 后台实际 OS/架构、持久盘、网络、部署权限。【Claude 修订 2026-09-09】仓库目前**没有**自主管理后台（§5.0），这是从零选宿主；清单须含：容器运行时、非特权 user namespace 是否可用、持久卷、出网白名单、对象存储 | 先做环境清单；默认假设 Linux x86_64 单机 + Docker/Podman + 持久卷；userns 不可用则各家原生沙箱降为 `externalSandbox`/等价声明 | P1 前 |
| O2 | 单用户内部使用还是公网多租户 | 开发验证可单租户，但 ID/存储边界预留 tenant | 对外部署前 |
| O3 | 四套凭据是否可用于目标托管方式。【Claude 修订 2026-09-09】已核对：Codex 只能 API key 或 Business/Enterprise token（个人 ChatGPT 套餐不可用于共享后台）；DeepSeek API key；OpenCode 任意 provider key（Anthropic Pro/Max OAuth 明令禁止）；Pi 任意 provider key（勿容器内 `/login`） | 使用独立 secret refs；缺 key 的那套标 BLOCKED_EXTERNAL，不阻塞其他三套 | 每套真实 smoke 前 |
| O4 | 首批业务是助理操作还是 coding | 先非敏感 fixture + 只读工具；生产场景单独确定 | P2/P4 |
| O5 | 哪些数据可上后台/模型 | 明确资源级授权与 retention，禁止隐式同步 | 真实数据接入前 |
| O6 | 浏览器离线后是否仍可改本地业务 | 客户端桥接如实标记 awaiting_client；后台写另建业务 API | P4 |
| O7 | Codex/DeepSeek 等接口稳定性 | 固定版本、能力测试、独立实验资格 | P2/P5 |
| O8 | 原生工具绕过统一 broker | 禁用、包装或 OS 隔离；无法证明则不开放 | 工具启用前 |
| O9 | 超时后的副作用未知 | outcome_unknown + 查询/核实，不盲目重试 | P3 |
| O10 | 对“无感切换”的期望 | 首版新 Run，后续轮次边界；不承诺执行中无损迁移 | P0 |
| O11 | Run/Event/Artifact 数据库选择 | 按事务、索引、恢复与部署条件选，避免借现有云服务名直接定案 | P1/P3 |
| O12 | 新后台服务在六模块中的长期治理 | 本次归 web 规划；正式实现前确认基础设施 ownership 与模块联动。【Claude 修订 2026-09-09】不新增第七模块。默认假设：继续挂 `web`，分支 `codex/web/agent-harness-*`，首个代码落地时在 `PRODUCT_MODULE_MAP.md` 记一条"共享基础设施例外"；备选是重释 `sync` 的 server 面（但 sync 目前 paused）；不归 `admin`（那是控制面 UI） | P0 / P1 代码前 |
| 【Claude 修订 2026-09-09】O13 | **非零知识执行域**：是否接受服务端 Agent 执行域会看到经显式授权出站的业务上下文、工具参数与产物明文，并与 D4 加密 blob 分离（§5.0、§10.3） | 接受为设计前提，但 P1–P3 只用非敏感 fixture；P4 前签资源级授权设计 | P1 前确认原则；P4 前确认细则 |
| 【Claude 修订 2026-09-09】O14 | 浏览器侧 `commitCanonicalCommand` 生产 activation 与 REL-03 verify 状态（§4.2） | 不作为后台幂等依赖；P4 前完成 bug-verify 并决定 activation 策略 | P4 前 |
| 【Claude 修订 2026-09-11】O15 | 四套 fork 的托管 org/账号、可见性（私有/公开）、每套 owner、上游同步节奏；submodule 还是 SHA 文件钉引用（§13.4） | 默认：用户 GitHub 账号下四个私有 fork；submodule 钉引用；owner 按人分配一套；创建与推送 fork 属外部账号动作，先经用户确认 | S1 前 |

## 16. 范围控制与治理

本次仅交付文档。后续实施需要按项目当前 Workflow V2 选择具体切片；本文件不会把 DRAFT 自动转成 APPROVED，也不授权生产部署、跨线合并或开放高权限工具。

遵循 [CLAUDE.md](../../../CLAUDE.md)、[AGENTS.md](../../../AGENTS.md)、[模块地图](../../PRODUCT_MODULE_MAP.md)、[模块边界](../../MODULE_BOUNDARIES.md)。Web→App 经过 [ADR-0013](../../adr/0013-branch-sync-governance.md) D3；Admin 遵循 [既有 roadmap](../../workflow/roadmap/xai-admin-dashboard-system-integration.md)。

暂不做：全面前端重构、全量业务存储迁移、通用插件市场、强制统一所有 Agent 内部循环、任意执行中状态迁移、多 Agent 分布式编排、没有需求支撑的微服务拆分。

可以做：先用少量后台模块运行四套原生系统，保留可替换协议边界和真实证据；再以现有稳定业务能力逐个接入。

跨机交接遵循 [multi-machine-development](../../workflow/project/multi-machine-development.md)。本次文档提交与推送不代表其他并行工作已同步或仓库全局 gate 已通过。

## 17. Claude Code 评审应输出什么

1. 目标理解与不得缩减的 USER-CONFIRMED 清单。
2. 当前 HEAD 对本提案证据的逐项复核，特别是回执、持久幂等、账号隔离和恢复进展。
3. 按严重程度列出 findings，给出证据、影响、具体修改方案。
4. 至少比较最小单服务+隔离 worker 与更复杂服务拆分，说明选择理由。
5. 对四套分别给出可部署路径、外部阻塞、版本策略、权限/协议限制。
6. 修订后的总体架构、接口、状态所有权、切换策略、阶段计划与验收矩阵。
7. 哪些问题可以用合理默认值推进，哪些必须由用户提供环境或业务决策。
8. 最小第一切片的文件范围、依赖、验证、回退；不直接大规模写实现。

评审者可以改进本提案的技术建议，但必须保留“后台共同基座、四套独立跑通、未来新增、切换对平台稳定”的目标。发现不可行之处应记录阻塞与替代路径，不能用只运行 Pi 或只接模型 API 来替代原始需求。

## 18. 本轮完成记录

- [x] 保存用户原始动机和 2026-09-09 后台基座澄清。
- [x] 复核 `c604951` 相关源码，区分旧发现与已增加的代码。
- [x] 写入后台优先、四套独立验证、多平台复用和可扩展方案。
- [x] 提供独立 Claude Code 审查 prompt。
- [x] Claude Code 独立审查与优化（2026-09-09，[CLAUDE_REVIEW.md](CLAUDE_REVIEW.md)；审查 HEAD `43798a6`）。
- [ ] 用户确认尚未决的部署/数据/业务边界（阻塞项：O1、O3、O12、O13，见 CLAUDE_REVIEW §8.1）。
- [ ] 正式选定版本并开始首个实施切片（S1，§12.1）。

提交 SHA 由 Git 历史记录，避免文档自引用提交号。文档状态始终为 DRAFT，直到评审和决策完成。

## 19. 修订记录

| 日期 | 修订者 | 范围 | 依据 |
| --- | --- | --- | --- |
| 2026-09-09 | Codex | 初稿：动机、现状评估、目标架构、契约、阶段计划、审查 prompt | 源码复核 `c604951`；上游资料 2026-09-08 |
| 2026-09-11 | Claude Code（按用户 2026-09-11 决策） | 新增 §13.4 源码采用层级：L3.5 与 L4 并行、四套全部 fork、独立开发文件夹、构建变体开关、多人并行定制分支规则、许可证义务；§12.1 S1 增加 fork/变体交付；§15 新增 O15；新增 [GPT_KICKOFF_PROMPT.md](GPT_KICKOFF_PROMPT.md)（Astra 先统筹与全面分析，含默认模型协作分工） | 用户 USER-CONFIRMED：“L3.5 和 L4 都做…一开始这些都要做…考虑后面多人分别做深度优化定制”。否定 A2K 姊妹项目 `be61e726` §8.5 的“默认不 fork”默认值（该仓库未改动） |
| 2026-09-09 | Claude Code | 全文审查后修订（标记【Claude 修订 2026-09-09】）：§1 审查 HEAD 与测试记录；§4.2 持久幂等生产关闭、无 system prompt/附件不发/preamble 当 user、secret AAD 不含 epoch；新增 §5.0 Supabase 零知识现状与非零知识执行域；§5.3 容器为安全边界、物理形态按阶段收缩；§6.1 交付物 11–14；§7.1 ToolBroker = MCP server + Pi shim、`nativeBridge` 字段；§7.4 补四个事件与 delta 不持久化；§8.1 服务端幂等与出站授权行、存储默认落点；§8.3 L0/L1/L2 每套机制；§9.3 ACP 覆盖面；§10.3 非零知识条款；§11.1–11.4 每套确认版本/接口更正/审批取消工具事实/凭据资格/首个 smoke/资格；§11.5 顺序按凭据；§12 P4 前置与 S1 精确范围；§15 O1/O3/O12 具体化 + O13/O14；§18 勾选审查完成 | 源码 OBSERVED at `43798a6`（= `c604951`）；`@repo/plugin-web-ai-chat` 32/280 通过；上游资料 2026-09-09 读取（版本与链接见 §11 与 CLAUDE_REVIEW §3）。**未改动**：§2 用户动机与 USER-CONFIRMED 目标、HISTORICAL 证据、§13 扩展清单、§14 验证格式、§16 治理；状态保持 DRAFT |
