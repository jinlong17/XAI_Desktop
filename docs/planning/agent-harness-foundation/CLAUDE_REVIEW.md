# Claude Code 独立审查：XAI 多 Harness 后台执行基座

> 状态：REVIEW COMPLETE / 方案仍为 DRAFT。本文件是对同目录 [PROPOSAL.md](PROPOSAL.md) 的独立审查、挑战与优化记录，不是批准书，也不授权实施或部署。
> 审查日期：2026-09-09（America/Los_Angeles）。审查者：Claude Code（claude-fable-5-1）。
> 审查任务书：[CLAUDE_REVIEW_PROMPT.md](CLAUDE_REVIEW_PROMPT.md)。
> 本轮只做审查与文档修订：未安装/运行任何外部 Harness、未调用付费模型、未部署服务、未修改运行时代码。

## 0. 审查基线与执行记录

| 项 | 值 |
| --- | --- |
| 审查 worktree | `/Users/lijinlong/.claude/worktrees/agent-harness-review-20260909`（独立 worktree，与共享目录的其他任务 dirty 文件隔离） |
| 审查分支 | `claude/web/agent-harness-foundation-review-20260909`，自 `43798a6` 创建（文档分支 `codex/web/agent-harness-foundation-design-20260909` 当时已被另一 Codex worktree 检出，Git 不允许双重检出，因此使用 sibling 评审短分支） |
| 实际审查 HEAD | `43798a69e1ac9fcc4f042c3f62581311b21fc557` |
| 与提案复核基线的关系 | `git diff --stat c604951 43798a6` 只有本目录两份文档（+790 行）。**源码与 `c604951` 完全一致**，因此本文的 OBSERVED 结论同时适用于 `c604951`。 |
| 首次审查基线 `9257be4` | 未重新检出；仅作为提案 §4.2 中 HISTORICAL 列的出处引用。 |
| 测试执行 | `pnpm install --frozen-lockfile --offline`（exit 0，reused 597/599，7.8s）→ `pnpm --filter @repo/plugin-web-ai-chat test` → **32 files / 280 tests passed，10.54s**。范围仅 AI Chat 包；未运行任务/日历订阅测试、类型检查或 e2e。注意包内 `docs/test.md` 与 `dev_log.md` 记录的是 31 files / 267 tests，已落后。 |
| 上游资料 | 全部于 2026-09-09 通过官方仓库、官方文档站、npm/PyPI registry 与 GitHub API 读取（见 §3 各表）。无任何本地安装或运行。 |

标签沿用提案：USER-CONFIRMED / OBSERVED / HISTORICAL / PROPOSED / OPEN，并新增 **UPSTREAM**（上游一手资料，2026-09-09 读取）与 **UNVERIFIED**（查不到或未能确认）。

## 1. 目标理解与可行性结论

### 1.1 不得缩减的 USER-CONFIRMED 目标（复述并确认保留）

1. Codex、DeepSeek Harness、OpenCode、Pi 四套都要在**用户自主管理的后台**独立部署、独立跑通真实任务。
2. 四套是**多平台共同基座**，服务 XAI 各平台与后续智能功能 / 受控开发任务；不是聊天组件的 provider 下拉框，不是四选一。
3. 先证明脱离 XAI UI 可跑通，再做统一适配、切换、业务接入。
4. 不要求常驻、不要求共享内部循环；要求独立部署、可监督、可停止、可升级、统一对外能力。
5. 不把统一基座解释成所有确定性业务都过 LLM。
6. 不承诺执行中状态跨 Harness 无损迁移；要明确可实现的切换层级。
7. 未来第五、第六套 Harness 通过明确扩展边界加入。

本审查对以上七条**全部保留**。下文所有否定与替代只针对提案中的技术手段，不针对目标。

### 1.2 可行性结论（一句话版）

**目标可行，但提案对"当前后台是什么"和"四套能给你什么接口"两件事的描述都偏抽象，导致 P1/P2 的起点被高估、P3 统一契约被低估。** 具体：

- 仓库里**不存在任何自主管理的长驻后台**。现有服务端只有 Supabase（Auth + Postgres/RLS + Deno Edge Functions `sync-push/sync-pull/recovery-proof/onboarding-backfill`），且以**零知识**为前提（服务端永不见业务明文）。Web 是 Cloudflare Pages 静态产物。提案 §5 的 Agent Service / Runner / Store 全部是新建，且必须回答"服务端跑 Agent 时会看到哪些用户明文"这个与现有安全模型直接冲突的问题（见 F-02）。
- 四套 Harness 的**审批、取消、自定义工具**三项能力在各家的不同接口之间差异巨大（见 §3.5 矩阵）：Codex 的审批/动态工具只在 app-server；DeepSeek 的 SDK 协议没有审批回程也没有中途取消；Pi 没有内置权限系统；OpenCode 有 HTTP 审批 API 但工具默认放开。提案 §11 建议的"SDK 优先"对 Codex 与 DeepSeek 都会**拿不到审批与取消**，必须改为 app-server（Codex）与 ACP profile（DeepSeek）。
- 现有 Web AI 链路里，**持久幂等（`commitCanonicalCommand`）在生产是关闭的**（`commandActivation=false`，只有测试 setter），提案 §4.2 把它写成"已用"，会误导 P4 的复用假设（见 F-01）。
- 四套目前**都不具备生产默认资格**，但**都具备隔离部署验证资格**。这与用户目标一致：四套都部署、都验证，进入生产由证据决定。

### 1.3 当前源码与旧评估的差异（逐项复核提案 §4.2）

| 提案 §4.2 的 OBSERVED 声明 | 本次核对结果（43798a6 = c604951） | 修订 |
| --- | --- | --- |
| `handleConfirm` 已 await `requestToolWrite`；失败保留错误状态 | **成立。** `AiChatModule.tsx` `handleConfirm` 等待回执，`!ok` 时设置 `toolWriteError` 并返回、不清卡不推进队列；成功后仅一次有界 follow-up。测试 IT-2/IT-3/IT-5 覆盖。 | 保留 |
| 任务创建已用 `commitCanonicalCommand`；同 envelope 写 data+receipt；签名冲突可拒绝；有 replay 分支 | **代码成立，生产不成立。** envelope `{format:"xai-command-state",version:1,revision,data,receipts}` 只允许 `xai_task_cols`/`xai_calendar_events`；receipt id = `[channel, requestId]`；同签名 → `replay:true`，异签名 → `request-conflict`；Web Locks + 账号代际检查；容量上限 512 receipts / 4,000,000 chars。**但** `commandActivation` 模块级为 `false`，唯一 setter 是 `setCanonicalCommandActivationForTests`，`apps/`、`packages/` 无生产调用者；源码注释"Production activation remains closed until D"。生产路径下任务/日历订阅会返回 `activation-disabled`，经 `executeToolWrite.publicResult` 收窄为 `storage`，聊天显示"未保存"。浏览器端到端行为未实测。日历订阅（create/update/delete）也走同一路径。 | **必须改写**：见 F-01 |
| `secretStore` 已有账号/代际隔离与迁移；聊天增加 owner 检查 | **成立，细节补充。** 行键与 AAD 为 `[kind, accountId, generation, provider]`（**不含 epoch**，epoch 仅靠 scope 引用相等校验）；PBKDF2-600k 自设备 UUID 派生，不是用户口令；每个 await 之间重新 `assertReady`；迁移 participant 有 stage/verify 与 staging receipt。`accountSecrets.test.ts` 10 项 + `no-plaintext-key.test.ts` 覆盖。 | 保留，补 epoch 说明 |
| 新增 `useConversationRecovery`、`useChatPreference`，涉及保存失败与恢复 | **成立。** 基线字节比对、`conflict/unsaved/owner` 三类错误、pending 草稿保存在 ref 不丢、导出 `ai-chat-unsaved.json`。`useChatPreference` 读 `localStorage` 时未走 scope（是否属设备级键未核）。 | 保留 |
| `processQueue` 仍只传本次 text；adapter 默认单条用户消息 | **成立且更严重。** 普通请求没有 `priorMessages`，模型每轮无记忆；**没有 system 字段**，today-context 拼进 user 消息；确认/取消 follow-up 的合成三轮历史用**助手 preamble 文本充当 user turn**，且不带 today-context；附件只有 `{name,size}` 元数据，**从未发送给模型**。 | 保留并加严：见 F-08 |
| 循环、审批依附 React | **成立。** 队列 `useRef`、`AbortController` per item、`pendingConfirmation` `useState`；卸载 abort；账号切换清空并置 `mountedRef=false`；会话切换被 `canLeave()` 阻止（thinking 时不能切）。 | 保留 |
| 单工具、有限往返 | **成立。** Anthropic 路径取最后一个 tool_use，OpenAI 路径取最低 index；确认后一次 follow-up，其中再出现 tool_use 仅显示文本（IT-5 测试锁定）。每个用户 prompt 最多 1 次工具执行、2 次模型调用。 | 保留 |

其他核对：`requestToolWrite` 的 1500ms → `no-confirmation`（resolve 失败、不重试、迟到回执忽略）**无测试覆盖**；事件总线是页内 `EventTarget`，跨标签只靠 `plugin-web-storage` 的 `storage` 事件与 `navigator.locks`；`core-data` 为 In-Dev 契约包；AI Cube 为 mock（`"Mock response: …"`，120ms 延迟）；`plugin-web-storage` 在 PLUGIN_MAP **没有行**；`plugin-web-ai-chat` `dev_log.md` 状态为 `FIX_READY_FOR_VERIFY`（REL-03 AI ownership sub-fix，待 bug-verify）。

## 2. Findings（按 P0 → P3）

每项含：证据 / 影响 / 修改建议 / 阻塞阶段。阶段编号沿用提案 §12（P1 后台实验宿主、P2 四套独立跑通、P3 统一 Adapter、P4 首个业务闭环、P5 生产资格、P6 扩展演练）。

### P0

**F-01 持久幂等在生产是关闭的，提案把它写成已具备。**
- 证据：`packages/plugin-web-storage/src/internal/canonicalCommandState.ts` `let commandActivation = false`；唯一 setter `setCanonicalCommandActivationForTests`；`commitCanonicalCommand` 与 `mutateCanonicalDataset` 在关闭时返回 `activation-disabled`；`xai-web-tasks`/`xai-web-calendar` 的 `aiCreateSubscriber`/`aiMutateSubscriber` 全部依赖它。
- 影响：提案 §4.2"不再称当前完全没有持久幂等"、§12 P4"现有六工具与账号回执复用"都建立在一个生产不可达的路径上。若 P4 直接复用，后台会把每次 AI 写入都收到 `storage` 失败。
- 建议：§4.2 改写为"机制已实现、测试覆盖、**生产 activation 关闭、REL-03 verify 未完成**"；P4 前置条件加入"REL-03 bug-verify 通过并确认生产 activation 策略"。后台 Run Store 的幂等**不能依赖**浏览器 localStorage 的 receipts，必须在服务端另建（见 §4.3）。
- 阻塞：P4（不阻塞 P1–P3）。

**F-02 提案没有写出"当前后台是 Supabase 零知识模型"，Agent Service 与之的关系完全缺失。**
- 证据：`docs/TECHNICAL_REQUIREMENTS.md`（"后端：Supabase（托管 PG + Auth + Storage）"，"服务端零知识：Supabase 后端永远不见 KEK/DEK/…明文"）；`apps/release-site/supabase/functions/{sync-push,sync-pull,recovery-proof,onboarding-backfill}`；`apps/web` 用 `@supabase/supabase-js`（`web-auth-device-session/src/client.ts`）；`apps/web/wrangler.toml` 仅 `pages_build_output_dir`；仓库无 Dockerfile/compose/fly/render 等任何长驻进程部署清单。
- 影响：(a) O1"后台 OS/架构"其实是"**从零选一个能跑容器的宿主**"，不是在现有后台上加服务；(b) 服务端跑 Harness 必然让服务端看到发给模型的业务上下文与工具参数明文，这与账号云同步的零知识承诺**不是同一数据面**，但提案 §10.3 没有把这一点说破；(c) 身份：Agent API 的调用方身份应直接复用 Supabase JWT（`account_id = auth.users.id`），提案未提。
- 建议：§5 增加"现状：Supabase + Pages；Agent Service 是新增执行域"；§10.3 增加**明确条款**："Agent 执行域是**非零知识**数据面：只有用户/策略显式授权出站的上下文、工具参数与产物会进入该域；该域的 Run/Event/Artifact 记录属服务端所有，按 tenant/account 隔离并有 retention；与 D4 加密 blob 永不互通。"这条须由用户确认（见 §8 Q-1）。
- 阻塞：P1（环境定义）、P4/P5（真实数据接入）。

**F-03 凭据资格：至少 Codex 在共享后台不能用 ChatGPT 套餐登录；其他三套也有类似条款。**
- 证据（UPSTREAM 2026-09-09）：Codex 文档把自动化路径指向 API key（`CODEX_API_KEY` / `codex login --with-api-key`）或 Business/Enterprise access token / service account；OpenAI Terms 禁止共享账号凭据（帮助中心"ChatGPT plan 用于 Codex"页面 403，原文 UNVERIFIED）。OpenCode 文档写明 Anthropic "explicitly prohibits" 用 Claude Pro/Max 走插件。Pi 容器化文档警告不要把宿主 `~/.pi/agent`（含 auth.json）挂进沙箱、不要在沙箱内 `/login`。DeepSeek Harness 只用 API key。
- 影响：O3 不是"分别核对"就够；它决定 P2 每套 smoke 是否 BLOCKED_EXTERNAL。多租户后台**只能**用 API key（或企业 token），意味着成本模型是按 API 计费而非订阅。
- 建议：§6.1 交付物加"凭据类型声明（api-key | enterprise-token | oauth-personal-forbidden）"；§15 O3 改为具体清单（见 §3.6）。
- 阻塞：P2（每套的真实任务 smoke）。

### P1

**F-04 审批 / 取消 / 自定义工具在四套之间高度不对称，提案 §11 的接口选型（Codex SDK、DeepSeek SDK/profile）拿不到审批与取消。**
- 证据（UPSTREAM）：
  - Codex：`codex exec`/TS SDK "never prompts"，只能设 `approvalPolicy`；SDK `signal` 直接 kill 子进程；审批（`item/commandExecution/requestApproval`、`item/fileChange/requestApproval`，回复 `accept|acceptForSession|decline|cancel`）、`turn/interrupt`、动态工具（experimental）**只在 `codex app-server`（JSON-RPC 2.0，v2 thread/turn API）**。
  - DeepSeek Harness：SDK 协议（`dsh-sdk-protocol`）只有 `initialize / session/prompt / shutdown` + 通知，"server-to-client requests remain unimplemented"，**无审批回程、无中途取消**（文档："abandon a turn by closing the runtime process"）；`sdk-minimal` 固定 `danger-full-access` 且无 approval service。审批与取消只在 **ACP profile**（`request_permission`、`session/cancel`）与 Web UI。
  - OpenCode：`opencode serve` HTTP + SSE；`permission` 配置 `allow|ask|deny`；`ask` → `permission.updated` 事件 → `POST /session/:id/permissions/:id {once|always|reject}`；`POST /session/:id/abort`。
  - Pi：README 明言"does not include a built-in permission system"；扩展 `tool_call` hook 可 `{block:true}`；RPC 模式审批走 `extension_ui_request`（有 timeout 自动默认）；SDK 有 `beforeToolCall`；`abort` 可用。
- 影响：若按提案 §11 选 SDK，Codex/DeepSeek 两套会出现"XAI Approval 契约无法落地、cancel 只能杀进程"的局面，P3 的统一契约将退化为最小公分母。
- 建议：**逐套锁定接入接口**（见 §3.5）：Codex → `app-server` stdio/unix socket（不用 ws://，实验性）；DeepSeek → `acp` profile（不用 sdk/sdk-minimal 做受控运行）；OpenCode → `serve` HTTP/SSE（每租户/每 run 独立实例，`OPENCODE_SERVER_PASSWORD` + 反向代理）；Pi → `--mode rpc`（外置审批用 `tool_call` block 扩展）或进程内 SDK `beforeToolCall`。契约里把 `cancel` 定义为**尽力而为 + 进程树 kill 兜底 + `outcome_unknown`**，把 Approval 的"原生桥接可用性"作为每套的 verified capability 字段。
- 阻塞：P3。

**F-05 ToolBroker 应以 MCP server 为主形态，进程内适配为辅；提案把它当成一个抽象接口，没有说明四套如何真的接上。**
- 证据（UPSTREAM）：Codex、OpenCode、DeepSeek Harness 都有 MCP client（Codex `[mcp_servers.*]` + `enabled_tools/disabled_tools`；OpenCode `mcp` local/remote + `permission` glob `"mymcp_*": "ask"`；DeepSeek ACP 接受 client 声明的 stdio/HTTP MCP servers，MCP 分页修复见 release notes）。Codex 的 host 动态工具是 experimental 且只在 app-server；DeepSeek 自定义工具只能进程内 Cordis plugin；OpenCode 自定义工具是 `.opencode/tools/*.ts` 文件（可**同名覆盖** `bash/read`）；Pi 用 `customTools` / `pi.registerTool`。Pi 的 MCP client **UNVERIFIED**（文档未见）。
- 影响：没有统一的 host→harness 工具注册路径；提案 §9.1 的流水线成立，但"原生参数映射到 XAI ToolCall"这一步的**传输载体**未定。
- 建议：ToolBroker = **一个 XAI MCP server**（stdio 与 streamable-HTTP 两种暴露）+ **Pi 进程内 shim**（把同一 broker 以 `customTools` 形式注入）。业务六工具与只读 fixture 工具都在 broker 内实现；四套通过各自 MCP 配置挂载，并在各自的权限配置里把 broker 工具标为 `ask`（如支持）。这样第五套 Harness 只要有 MCP client 就零改动接入。
- 阻塞：P2（受控工具场景）、P3。

**F-06 沙箱边界：四套的原生沙箱在容器内多半不可用或不存在，必须把"XAI 容器"定义为唯一安全边界。**
- 证据（UPSTREAM）：Codex Linux 沙箱 = bubblewrap（user/PID/net namespaces + seccomp），Landlock 为 legacy 回退；容器内需允许非特权 user namespace，否则只能 `danger-full-access` 或 app-server `externalSandbox`。DeepSeek Linux 沙箱同为 bwrap + Landlock，SAFETY.md 明言"do not guarantee isolation"，要求一次性 VM/容器。OpenCode、Pi 均**无**内置沙箱。
- 影响：提案 §5.3"独立容器/worker 优先评估"方向正确，但 §9.2/§9.4 仍隐含"原生工具受原生沙箱约束"。
- 建议：明确写：**容器（或 microVM）是安全边界；原生沙箱只是纵深防御，能开则开，不能开则用 `externalSandbox`/等价声明并在 capability 里记录**。宿主内核需求（unprivileged userns）进入 O1 环境清单。
- 阻塞：P1。

**F-07 ACP 不是四套通用协议：DeepSeek、OpenCode 原生支持；Codex 官方"not planned"（仅社区桥）；Pi 未见。**
- 证据（UPSTREAM）：openai/codex issue #9085 closed not planned；`@agentclientprotocol/codex-acp` 为社区包；OpenCode `opencode acp` 依赖 `@agentclientprotocol/sdk@0.21.0`；DeepSeek `acp` bundle 首发即含。
- 影响：提案 §9.3 把 ACP 写成"候选"，但没有说清覆盖面。若把 ACP 当统一适配层会漏掉 Codex 与 Pi。
- 建议：ACP 作为 **DeepSeek 与 OpenCode 两个 Adapter 的实现捷径**（一个 ACP client 库服务两套），不是 HarnessAdapter 契约本身；Codex 走 app-server、Pi 走 RPC。
- 阻塞：P3。

**F-08 现有 Builtin 聊天没有记忆、没有 system prompt、附件不发模型；P4 的"Builtin 兼容 Adapter"不能包装 `processQueue`，必须从 XAI Session Store 重建 transcript。**
- 证据：见 §1.3 第 5 行。
- 影响：提案 §4.1 把"模型适配层可保留在 Builtin 路径"作为复用资产是对的，但 §12 P4 若包装现有组件逻辑，会把"每轮无记忆 + preamble 当 user"这些缺陷带进后台。
- 建议：P4 的 Builtin Adapter 只复用 `llmProvider` 的 wire 序列化/allowlist/错误分类；transcript、system prompt、context 预算由 Agent Service 构造。UI 侧 `xai_ai_convos` 变成 Session Store 的投影缓存。
- 阻塞：P4。

**F-09 Run/Event/Session 存储与幂等的默认落点应写出（虽仍 OPEN），否则 P1 无法起步。**
- 证据：仓库已有 Supabase Postgres + RLS + `account_id` 主键模型（`docs/TECHNICAL_REQUIREMENTS.md`、`supabase-schema-migrations`、`rls-policies-and-tests`）。
- 建议（可推进默认假设，非定案）：Run/Session/Event（终态与工具结果）/Approval/Artifact **元数据**放 Postgres（按 `account_id` RLS，新 schema 如 `agent.*`，与 `encrypted_blobs` 零知识表物理分开）；产物字节放对象存储（Supabase Storage 或 worker 卷）+ 签名引用；原生 Harness 状态（`~/.codex/sessions`、`$DSH_HOME`、`~/.local/share/opencode`、`~/.pi/agent`）留在 worker 卷、只在 Run 上记 opaque ref。服务端幂等键 = `(tenant, account, toolName, logicalOperationId)` 唯一约束。P1 期允许用 SQLite 文件替代 Postgres 起步，schema 一致即可。
- 阻塞：P1（需承认为默认假设）、P3。

### P2

**F-10 版本与发布节奏：提案未锁定任何上游版本，本次已确认可锁的版本见 §3；DeepSeek 只有 pre-release。**
- 证据（UPSTREAM）：Codex `rust-v0.154.0`（2026-09-09）、`@openai/codex-sdk 0.154.0`、Python `openai-codex 0.147.0`；DeepSeek `dsh-v0.1.5-rc.1`（2026-09-10 UTC，prerelease，**无非预发布 Latest**）、`@deepseek-ai/dsh 0.1.5-rc.1`、`deepseek-harness-sdk 0.1.5rc1`；OpenCode `v1.18.30`（2026-09-09，1–3 天一 patch）、`opencode-ai 1.18.30`；Pi `v0.85.1`（2026-09-05）、`@earendil-works/pi-coding-agent 0.85.1`（Node ≥22.19）。
- 建议：§6.1 交付物 1 改为"锁定的具体 tag + registry 版本 + 读取日期"，并在 §11 各小节写入本次确认值；OpenCode/Codex 的高频发布要求部署清单固定 tag 并关闭 autoupdate。
- 阻塞：P2（部署清单）。

**F-11 默认外联与遥测：smoke 配置必须显式关闭，否则"独立部署"证据里会混入外部调用。**
- 证据（UPSTREAM）：Codex `web_search` 默认 `cached`（需 `disabled`）；DeepSeek `DSH_TELEMETRY_MODE` 默认 `FEEDBACK_ONLY`（需 `DISABLED`）；OpenCode 启动时 Bun 安装插件/provider 包、autoupdate、`/share` 上传（需 `autoupdate:false`、`share:"disabled"`）；Pi 启动版本检查/遥测（`PI_OFFLINE=1`、`PI_TELEMETRY=0`）。
- 建议：§6.1 新增交付物"出网清单：允许的目标域名 + 关闭的默认外联"。
- 阻塞：P2。

**F-12 多实例隔离用什么变量，提案没有写具体值。**
- 证据（UPSTREAM）：Codex `CODEX_HOME`（默认 `~/.codex`）、`--ephemeral`；DeepSeek `DSH_HOME`；OpenCode 仅文档化 `~/.local/share/opencode`、`~/.config/opencode`、`~/.cache/opencode`（XDG 变量 UNVERIFIED → 按独立 `HOME` 隔离）；Pi `PI_CODING_AGENT_DIR`、`PI_CODING_AGENT_SESSION_DIR`、`PI_PACKAGE_DIR`。
- 建议：写入 §10.4 与部署清单模板。
- 阻塞：P2。

**F-13 OpenCode 的目录作用域在官方文档中不完整；一个 server 服务多租户目前不可证明。**
- 证据（UPSTREAM）：官方 server 文档只有 `/find/file?directory=` 与 `run --dir`；`x-opencode-directory` 请求头只见于 issue #7376 与第三方客户端（UNVERIFIED-in-docs）；server 认证只有可选 HTTP basic（`OPENCODE_SERVER_PASSWORD`）。
- 建议：OpenCode 部署单位 = **每租户 workspace 一个 server 进程**（或每 Run 一个），置于私网 + 反向代理；把"单实例多目录"列为待验证能力。
- 阻塞：P2（OpenCode 隔离场景）。

**F-14 事件契约缺 `run.interrupted` / `awaiting_client` / `approval.resolved`；token delta 持久化策略应直接采用"delta 不落库、`message.completed` 权威"。**
- 证据：提案 §7.4 最小事件集；§8.2 状态机有 `interrupted/outcome_unknown` 与 `awaiting_client` 但事件集没有对应事件。上游一致做法：Pi `message_update` delta-only + `message_end` 权威；DeepSeek append-only `SessionEvent` 为唯一事实源；OpenCode `message.part.updated` + `session.idle`。
- 建议：事件集补 `run.interrupted`、`run.awaiting_client`、`approval.resolved`、`run.outcome_unknown`；明确"delta 只广播不持久化；恢复只保证 `message.completed` 之后的快照 + seq 游标；不承诺 token 级重放"。
- 阻塞：P3。

**F-15 测试记录不一致；`requestToolWrite` 超时无测试；secret AAD 不含 epoch。**
- 证据：包内 `test.md`/`dev_log.md` 记 31/267，实测 32/280；`no-confirmation`/`1500` 无测试引用；`secretStore` AAD `[2, kind, accountId, generation, provider]`。
- 建议：记录为已知差异，不在本轮修包内文档（属其他任务的 dev_log 所有权）；后台设计里 receipt 超时不得复制 1500ms（提案已说，保留）。
- 阻塞：无。

**F-16 后台服务的模块归属（O12）应在 P1 写代码前由 operator 决定，且不新增第七模块。**
- 证据：`docs/PRODUCT_MODULE_MAP.md` 六模块中没有"共享后端"；`sync` 的 server 面是 Supabase Edge Functions；`admin` 是控制面 UI；`web` 是 Pages 静态 SPA。
- 建议：本轮维持"归 `web` 规划"；P1 开工前 operator 需选择：(a) 继续挂 `web`，分支 `codex/web/agent-harness-*`，在 `PRODUCT_MODULE_MAP.md` 记一条"共享基础设施例外"；或 (b) 归 `sync` 的 server 面（重新解释 sync 为"账号云 + 执行云"，但 sync 目前 paused）。不建议 (c) 归 `admin`（那是 UI）。默认假设 (a)。
- 阻塞：P1（代码落地前）。

### P3

**F-17 术语：各家 turn/step/item 映射表缺失。** 建议在 §3 增加映射表（见 §4.4）。

**F-18 提案 §11.5 部署顺序"先 Pi"** 的理由是集成成本低；从"后台独立跑通"看，Codex `exec --json`（单二进制、稳定 JSONL）与 OpenCode `serve`（单二进制、HTTP+SSE+审批 API）起步更快，Pi 需要 Node 22.19+ 且无审批。建议顺序由**凭据可得性**决定，而不是固定顺序（见 §6.3）。四套仍全部在 P2 范围内。

**F-19 文档超链接**：提案 §11 的 Codex 链接（`learn.chatgpt.com/docs/codex-sdk`、`/docs/app-server`）有效（`developers.openai.com/codex/*` 已 308 重定向到该站）；DeepSeek 链接必须用 `master`（`main` 404）；Pi 仓库 `earendil-works/pi` 正确（2026-05-07 自 `badlogic/pi-mono` 迁移，npm scope 自 0.74.0 起为 `@earendil-works/*`）；OpenCode 仓库现为 `anomalyco/opencode`（`sst/opencode` 重定向）。

## 3. 四套逐项部署与能力矩阵（UPSTREAM，2026-09-09）

### 3.1 Codex（OpenAI）

| 项 | 结论 |
| --- | --- |
| 确认版本 | `rust-v0.154.0`（2026-09-09，非预发布）；`@openai/codex-sdk 0.154.0`（Node ≥18）；`openai-codex` Python 0.147.0；Apache-2.0；约每周一个稳定 minor，每日多个 alpha |
| 后台部署 | 单 Rust 二进制（`codex-x86_64/aarch64-unknown-linux-musl`，另有 `codex-app-server-*`、`bwrap-*` 资产）；或 `npm i -g @openai/codex`；状态目录 `$CODEX_HOME`（`config.toml`、`auth.json`、`sessions/` rollout JSONL）；`--ephemeral` 不落盘 |
| 凭据 | API key（`CODEX_API_KEY`/`--with-api-key`）或 Business/Enterprise access token / service account / workload identity；**ChatGPT 个人套餐 OAuth 不适用于共享服务器**（F-03） |
| 已验证接口 | `codex exec --json`（稳定，SDK 内部即用它）；`codex app-server`（JSON-RPC 2.0，stdio 默认，`unix://`；**ws:// 实验且不建议生产**；部分方法需 `experimentalApi`）；TS/Python SDK；ACP 官方 not planned |
| 自定义工具 | app-server `dynamicTools`（experimental，随 rollout 持久化）；MCP client `[mcp_servers.*]`（推荐给 broker） |
| 审批 | 仅 app-server：`item/commandExecution/requestApproval`、`item/fileChange/requestApproval` → `accept/acceptForSession/decline/cancel` |
| 取消 | app-server `turn/interrupt`（状态 `interrupted`）；exec/SDK 仅 kill 进程 |
| 原生 session | `thread/start|resume|fork|read|list|archive|delete`、`thread/compact/start`；`codex exec resume --last` |
| 事件 | `thread.started/turn.started/item.started|updated|completed/turn.completed{usage}/turn.failed/error`；app-server 增量 `item/agentMessage/delta`、`turn/diff/updated`、`turn/plan/updated` |
| 产物/结构化输出 | `--output-last-message`、`turn/diff/updated`；`--output-schema` / SDK `outputSchema` / `turn/start.outputSchema` |
| 绕过 broker 的原生工具 | shell（PTY `unified_exec`）、`apply_patch`、`web_search`（默认 `cached`）、MCP servers。限制：`--sandbox read-only|workspace-write|danger-full-access`、`externalSandbox`、`approval_policy`、`web_search=disabled`、`shell_environment_policy`、`--ignore-user-config` |
| Linux 沙箱 | bubblewrap（需非特权 userns）；Landlock legacy；容器内可能只能 `externalSandbox` |
| 首个 smoke | `CODEX_HOME=/srv/codex CODEX_API_KEY=… codex exec --json --sandbox read-only --skip-git-repo-check -C /srv/fixture -c web_search=disabled --output-last-message out.md "<任务>"`；随后 app-server stdio `initialize → thread/start → turn/start` 验证审批与 interrupt |
| 缺失 | OpenAI API key（或企业 token）；宿主 bwrap/userns 能力；fixture 仓库 |
| 资格 | 隔离部署验证：**可以**（exec + app-server stdio，API key）。生产默认：**未评估**；前提是 API key、容器内、不用 ws://、不用动态工具 |

### 3.2 DeepSeek Harness（dsh）

| 项 | 结论 |
| --- | --- |
| 确认版本 | `dsh-v0.1.5-rc.1`（2026-09-10 UTC，**prerelease**；仓库无任何非预发布 Latest）；`@deepseek-ai/dsh 0.1.5-rc.1`；`deepseek-harness-sdk 0.1.5rc1`；MIT；仓库 2026-08-13 创建；README "developer preview…THERE WILL BE COMPATIBILITY-BREAKING CHANGES"；SAFETY.md "must not be treated as secure or production-ready" |
| 后台部署 | Node `^22.19.0 || >=24`（无独立二进制；Python SDK 附带 `deepseek-harness-runtime-bin` 平台 wheel）；`npx @deepseek-ai/dsh`；状态 `$DSH_HOME`（profiles、`settings.yaml`、`.credentials.yaml`、session JSONL v3） |
| 凭据 | API key（`DEEPSEEK_API_KEY`），也支持 `llm-pi-ai` 多 provider（OpenAI/Anthropic/OpenAI-compatible） |
| 已验证接口 | `--profile headless`（一次性、纯文本、**无 JSON 事件**）；`--profile sdk|sdk-minimal`（JSON-RPC stdio，`serverInfo.version "0.0.1"`，无兼容承诺，**无 server→client 请求、无中途取消**）；`--profile acp`（ACP stdio：`session/new|prompt|cancel`、`request_permission`、可声明 MCP servers）；`dsh web` 是 UI 服务器 |
| 自定义工具 | 仅进程内 Cordis plugin（`ctx.tools`）或 `--patch` 覆盖；SDK 线上不可注册；MCP client 存在（位置 UNVERIFIED） |
| 审批 | `ctx.approval` fail-closed；只有 Web UI 与 ACP `request_permission` 能回答；SDK 协议不能 |
| 取消 | ACP `session/cancel`；SDK 无（关进程） |
| 原生 session | append-only `SessionEvent` JSONL 为唯一事实源；resume/fork 通过 `sessionId`/`parentSession`；v3 不向下兼容 |
| 事件 | `session.event`（`turn/*`、`step/*`、`assistant/message`、`tool/*`）、`session.status` |
| 产物/结构化输出 | `tool-present` 快照；无 output-schema（UNVERIFIED/缺失） |
| 绕过 broker 的原生工具 | shell（PTY）、fs `read/write/edit`、`glob/grep`、`web_search/web_fetch`、skills、jobs、subagents（含 codex/claude-code 子代理）、**`tool-cordis`（模型运行时定义并加载新插件——受控部署必须移除）** |
| 沙箱 | bwrap + Landlock（Linux）；presets `read-only|workspace-write(默认 ask)|danger-full-access`；官方要求一次性 VM/容器 |
| 首个 smoke | `DSH_HOME=/srv/dsh DEEPSEEK_API_KEY=… DSH_TELEMETRY_MODE=DISABLED npx @deepseek-ai/dsh@0.1.5-rc.1 --profile headless "<任务>"`（先证跑通）；随后 `--profile acp` 走 XAI ACP client 验证审批与 cancel |
| 缺失 | DeepSeek API key（或 OpenAI-compatible key + `llm-pi-ai` patch）；Node 22.19+；bwrap；一次性容器 |
| 资格 | 隔离部署验证：**可以**（容器内 headless/acp）。生产默认：**不可**（官方明言非生产） |

### 3.3 OpenCode

| 项 | 结论 |
| --- | --- |
| 确认版本 | `v1.18.30`（2026-09-09）；`opencode-ai 1.18.30`；仓库 `anomalyco/opencode`（原 `sst/opencode`）；MIT；1–3 天一 patch |
| 后台部署 | 单编译二进制（`opencode-linux-x64/arm64(-musl)`），不需 Node；状态 `~/.local/share/opencode/`（`auth.json`、`project/` 会话、`log/`）、`~/.config/opencode/`、`~/.cache/opencode/`（Bun 安装的插件包）；配置多层合并，含 `.well-known/opencode` 远端托管配置 |
| 凭据 | provider API key 环境变量、`opencode auth login`、`PUT /auth/:id`；OAuth 仅个人订阅场景（Anthropic Pro/Max 被明令禁止） |
| 已验证接口 | `opencode serve --hostname --port`（HTTP + SSE `GET /event`；OpenAPI 3.1 `GET /doc`；认证仅可选 basic `OPENCODE_SERVER_PASSWORD`）；`@opencode-ai/sdk`（自 OpenAPI 生成）；`opencode run --format json`；`opencode acp`（stdio，`@agentclientprotocol/sdk 0.21.0`）；MCP client（`@modelcontextprotocol/sdk 1.29.0`）；`/experimental/*`、`lsp` 标 experimental |
| 自定义工具 | `.opencode/tools/*.ts`（`@opencode-ai/plugin` `tool()`，**同名覆盖内建 `bash/read`**）、plugins hooks、MCP |
| 审批 | `permission` 配置 `allow|ask|deny`（glob、按 agent 覆盖）→ `permission.updated` 事件 → `POST /session/:id/permissions/:id {once|always|reject}`；默认多为 `allow`（`doom_loop`/`external_directory` 为 ask，`.env*` 读 deny） |
| 取消 | `POST /session/:id/abort` |
| 原生 session | `POST /session`、`/fork`、`/revert`、`/summarize`、`/share`（应 `share:"disabled"`）；数据模型 Session / Message{info, parts} / Part(`text,reasoning,file,tool,step-start,step-finish,snapshot,patch,…`) |
| 事件 | `session.*`、`message.updated`、`message.part.updated`、`permission.updated|replied`、`file.edited`、`session.idle`…（`message.part.delta` UNVERIFIED） |
| 产物/结构化输出 | `snapshot` + `GET /session/:id/diff`；`format:{type:"json_schema"}` 带重试 |
| 绕过 broker 的原生工具 | `bash, edit, write, read, grep, glob, apply_patch, webfetch, websearch, skill, task(子代理), lsp` + 全部 MCP 工具；`run --auto` 全放行 |
| 沙箱 | **无内置**；只有权限矩阵 |
| 作用域 | 单实例多目录官方文档不完整（`x-opencode-directory` 仅 issue）；按每租户/每 Run 一实例部署 |
| 首个 smoke | 独立 `HOME`，写 `opencode.json`（`share:"disabled"`、`autoupdate:false`、权限 deny-by-default 只留 `read`）→ `OPENCODE_SERVER_PASSWORD=… opencode serve --hostname 127.0.0.1` → `GET /doc`、`GET /event`、`POST /session`、`POST /session/:id/message`（含 `format.json_schema`）→ 触发 `bash` 观察 `permission.updated` 并 `reject` → 中途 `abort` |
| 缺失 | 任意 provider API key；Bun/npm 出网决策；TLS/认证前置代理；目录作用域验证 |
| 资格 | 隔离部署验证：**可以**（容器 + 私网 + 密码）。生产默认：**不可**，直到认证加固、插件安装出网锁定、目录隔离验证 |

### 3.4 Pi（earendil-works/pi）

| 项 | 结论 |
| --- | --- |
| 确认版本 | `v0.85.1`（2026-09-05）；`@earendil-works/pi-coding-agent 0.85.1`（Node ≥22.19.0）；MIT；约每周一发；2026-05-07 自 `badlogic/pi-mono` 迁移，npm scope 自 0.74.0 起为 `@earendil-works/*` |
| 分层 | `pi-ai`（多 provider LLM API）→ `pi-agent-core`（loop/tools/events/steer/followUp）→ `pi-coding-agent`（CLI+SDK）；`pi-tui`；`chord`；**experimental**：`pi-protocol`（CBOR，"no compatibility guarantees"）、`pi-server`（Unix socket）、`pi-client`；`web-ui/mom/pods` 不在当前树（UNVERIFIED） |
| 后台部署 | 纯 JS（`npm i -g --ignore-scripts @earendil-works/pi-coding-agent`）；状态 `~/.pi/agent/`（`PI_CODING_AGENT_DIR`）：`settings.json`、`auth.json`、`trust.json`、`sessions/<encoded-cwd>/*.jsonl`、`extensions/`、`skills/`、`prompts/`；项目 `.pi/` 受 trust gate |
| 凭据 | provider key 环境变量、`--api-key`、SDK `setRuntimeApiKey`；`/login` OAuth 只限个人；容器文档警告勿挂宿主 `~/.pi/agent` |
| 已验证接口 | `pi -p`（print）、`pi --mode json`（JSONL 事件）、`pi --mode rpc`（JSONL stdin/stdout：`prompt/steer/follow_up/abort/get_state/fork/compact/...`）、SDK `createAgentSession`；**无 HTTP server**；ACP 与 MCP client 文档未见（UNVERIFIED/缺失） |
| 自定义工具 | `defineTool` + `customTools` + `tools` allowlist；扩展 `pi.registerTool`；工具收到 `AbortSignal` |
| 审批 | **无内置**；扩展 `tool_call` hook `{block:true, reason}`；RPC 下 UI 类审批走 `extension_ui_request`（有 timeout 默认）；SDK `beforeToolCall` |
| 取消 | `abort`、`abort_bash` |
| 原生 session | JSONL v3 header + DAG（`id/parentId`），fork 为新文件 `parentSession`；`-c/-r/--session/--fork/--no-session` |
| 事件 | `agent_start/end`、`turn_start/end`、`message_start/update(delta)/end(权威)`、`tool_execution_start/update/end`、`compaction_*`、`extension_ui_request` |
| 产物/结构化输出 | `export_html`、`get_last_assistant_text`；无 JSON-schema 结构化输出（UNVERIFIED/缺失） |
| 绕过 broker 的原生工具 | 默认 `read, write, edit, bash`（`grep/find/ls` 可选）；关闭：`--tools`、`--no-builtin-tools`、`--no-extensions`、`--no-skills`、`--no-prompt-templates`、`--no-context-files`、`--system-prompt`；README："does not include a built-in permission system" |
| 沙箱 | **无**；官方建议 Docker / Gondolin microVM / OpenShell |
| 首个 smoke | 容器内 `PI_CODING_AGENT_DIR=/state PI_OFFLINE=1 <PROVIDER>_API_KEY=… pi --mode rpc --no-extensions --no-skills --no-prompt-templates --no-context-files --tools read --session-dir /state/sessions`，stdin 发 `{"type":"prompt",…}`，断言 `agent_start…message_end…agent_end`；中途 `abort`；再挂 `tool_call` block 扩展验证拒绝 |
| 缺失 | provider key；容器；`--mode json` 是否读 stdin（未文档化） |
| 资格 | 隔离部署验证：**可以**。生产默认：**不可**（无权限层；server/protocol experimental） |

### 3.5 横向能力矩阵（决定 P3 契约的最小公分母）

| 能力 | Codex | DeepSeek Harness | OpenCode | Pi |
| --- | --- | --- | --- | --- |
| 推荐接入接口 | `app-server`（stdio/unix） | `acp` profile（stdio） | `serve` HTTP+SSE | `--mode rpc` 或进程内 SDK |
| 稳定的无 UI 执行 | `exec --json` ✅ | `headless` ✅（纯文本） | `run --format json` ✅ | `-p` / `--mode json` ✅ |
| 服务端审批回程 | ✅（仅 app-server） | ✅（仅 ACP/Web） | ✅（HTTP） | ⚠️ 需自写扩展 |
| 中途取消 | ✅ `turn/interrupt` | ✅（仅 ACP） | ✅ `/abort` | ✅ `abort` |
| Host 注册自定义工具 | ⚠️ experimental dynamicTools | ⚠️ 仅进程内 plugin | ✅ 文件工具 / 同名覆盖 | ✅ `customTools` |
| MCP client（broker 载体） | ✅ | ✅（位置待确认） | ✅ | ❓ UNVERIFIED |
| ACP | ❌ 官方 not planned | ✅ | ✅ | ❌ 未见 |
| 原生 resume / fork | ✅ | ✅ | ✅ | ✅ |
| 结构化输出 | ✅ | ❌ | ✅ | ❌ |
| 内置沙箱 | bwrap（容器内受限） | bwrap+Landlock（不保证） | ❌ | ❌ |
| 默认外联需关闭 | `web_search=cached` | telemetry FEEDBACK_ONLY | autoupdate、share、Bun 安装 | 版本检查、遥测 |
| 隔离变量 | `CODEX_HOME` | `DSH_HOME` | 独立 `HOME` | `PI_CODING_AGENT_DIR` |
| 隔离部署验证资格 | ✅ | ✅ | ✅ | ✅ |
| 生产默认资格 | 未评估（需 API key + 容器） | ❌ 官方非生产 | ❌ 待加固 | ❌ 无权限层 |

**契约结论**：XAI 的 Approval 与 Cancel 契约必须携带 `nativeBridge: native | host-shim | unsupported` 字段；Tool 注册统一走 MCP（Pi 用进程内 shim 兜底）；结构化输出为可选能力；四套的原生 session 都能 resume/fork，因此"轮次边界切换"可以在四套上实现。

### 3.6 凭据资格清单（替代提案 O3 的泛化写法）

| Harness | 后台可用凭据 | 不可用/受限 |
| --- | --- | --- |
| Codex | OpenAI API key；Business/Enterprise access token / service account / federation | ChatGPT 个人套餐 OAuth（共享服务器） |
| DeepSeek Harness | `DEEPSEEK_API_KEY`；经 `llm-pi-ai` 的 OpenAI/Anthropic/兼容 key | — |
| OpenCode | 任意 provider API key；内部网关 baseURL | Anthropic Pro/Max OAuth（明令禁止）；其他订阅 OAuth 按各家条款 |
| Pi | 任意 provider API key | 个人 `/login` OAuth 挂进容器 |

## 4. 优化后的架构

### 4.1 先说结论：保留提案的逻辑边界，压缩物理形态，补上传输载体

提案 §5.1 的逻辑图（API → Service → Catalog/Store/Host → 四个 Adapter+Runtime ↔ ToolBroker → 业务/环境）**边界正确**，本审查不推翻。调整三点：

1. **物理形态**：P1–P2 不建 Agent Service。用"一个 smoke-kit 进程 + 每套一个容器 + 一个 XAI MCP 工具服务 + 一张 evidence 表"就能完成"四套独立跑通"。Agent Service（HTTP API、Session/Run Store、Catalog、Router）在 P3 才出现，且首版是**一个进程**。
2. **传输载体**：ToolBroker 以 **MCP server** 为主形态；Adapter 按 §3.5 每套锁定接口；ACP client 库同时服务 DeepSeek 与 OpenCode。
3. **安全边界**：容器/microVM 是边界；原生沙箱是纵深防御。

```mermaid
flowchart TD
  subgraph Clients[调用方（P3+ 才接）]
    Web[Web SPA]
    App[Desktop 壳]
    Svc[业务服务 / 受控开发任务]
  end
  Clients --> API[Agent API（单进程，P3）\n身份 = Supabase JWT]
  API --> Store[(agent.* schema\nSession / Run / Event(终态+工具结果) / Approval / Artifact meta\n+ 幂等唯一键)]
  API --> Sup[Runner Supervisor（同进程，P3）]
  Sup --> C[容器: Codex\napp-server stdio]
  Sup --> D[容器: DeepSeek Harness\nacp profile]
  Sup --> O[容器: OpenCode\nserve HTTP+SSE]
  Sup --> P[容器: Pi\nmode rpc / SDK]
  Sup --> N[容器: 第 N 套]
  C -- MCP --> MCP[XAI ToolBroker\nMCP server（stdio / streamable-HTTP）]
  D -- MCP --> MCP
  O -- MCP --> MCP
  P -- in-process shim --> MCP
  N -- MCP --> MCP
  MCP --> Fixture[只读 fixture / workspace 工具（P2）]
  MCP --> Domain[业务能力端口（P4：服务端业务 API 或 awaiting_client 桥）]
  Obj[(对象存储\nArtifact 字节)] --- Store
  Vol[(worker 卷\n原生 session/state，opaque ref)] --- Sup
```

### 4.2 三个简化方案对比（回应提案 §17 第 4 条）

| 方案 | 内容 | 优点 | 代价 | 结论 |
| --- | --- | --- | --- | --- |
| **C. 最小验证套件（P1–P2）** | 无 HTTP 服务；`deploy/agent-harnesses/<h>/` 容器清单 + `run-smoke` 脚本 + XAI MCP 工具服务 + evidence 记录（YAML/SQLite） | 最快证明"四套独立跑通"；不依赖前端、业务库、Admin；每套失败互不影响 | 没有多平台 API；不能被 Web/App 调用 | **P1–P2 采用** |
| **A. 单进程 Agent Service + 每套容器（P3）** | 一个 Node/Rust 服务：API + Store adapter + Supervisor；四个 Adapter 在同进程；Harness 在容器 | 一处身份/准入/事件；扩展 = 新 Adapter + 新容器清单 | 单点；Supervisor 与 API 同生命周期 | **P3 采用**，从 C 演进 |
| **B. 多服务拆分** | API、Catalog、Runner、Store 各自服务 | 独立伸缩 | 运维、网络、事务边界、一致性成本；当前无需求 | **否定**：无证据支撑，P5 后按负载再议 |

**被否定的过度设计**（提案中显式或隐含）：独立 Harness Catalog 服务（P3 期用一张表 + 静态 descriptor 文件即可）；token 级持久重放；四套统一进程内 SDK 装载（F-06）；把 ACP 当四套统一协议（F-07）；在 P2 前引入 Admin UI 或前端投影层。

### 4.3 状态所有权（在提案 §8.1 基础上收紧）

| 状态 | 权威所有者 | 说明 |
| --- | --- | --- |
| XAI Session（逻辑会话、可见 transcript） | `agent.session` / `agent.event` 中 `message.completed` 与工具结果 | 浏览器 `xai_ai_convos` 降级为投影缓存（P4 后） |
| Run 准入、配置快照、状态、终态 | `agent.run` | 每 Run 记 contractVersion/engineId/runtimeVersion/adapterVersion/deploymentId/model/toolsetVersion/policyVersion/executionDomain |
| 原生 session / checkpoint | worker 卷（`CODEX_HOME`、`DSH_HOME`、OpenCode `HOME`、`PI_CODING_AGENT_DIR`） | Run 只保存 `nativeBinding {engineId, nativeSessionId, stateRef, lastSeq}`；删除账号时按 ref 清卷 |
| 审批记录 | `agent.approval`（owner、runId、toolCallId、操作哈希、有效期、决定、`nativeBridge`） | 原生审批一律先落 XAI 记录再回复原生 |
| 服务端幂等 | `agent.tool_receipt` 唯一键 `(tenantId, accountId, toolName, logicalOperationId)` | 与浏览器 `commitCanonicalCommand` receipts **不共用**（F-01）；同 ID 异参数拒绝 |
| 密钥 | 后台 secrets（按 tenant/harness/provider 的 ref）；只注入容器 env | API/事件/产物只出现 `credentialRef` |
| Artifact | 对象存储字节 + `agent.artifact` 元数据（owner、runId、sha256、size、accessPolicy） | 原生工作树变更经 diff/snapshot 采集后再登记 |
| 出站上下文授权 | `agent.context_grant`（资源级、时效、来源） | 非零知识数据面的唯一入口（F-02） |

**避免双重事实源**：平台 transcript 只记录"产品语义事件"（用户输入、模型完成消息、工具请求/结果、审批、产物、终态）；原生日志只用于原生 resume。两者通过 `nativeBinding.lastSeq` 对齐；不做双向同步。

### 4.4 各家 turn/step 术语映射（F-17）

| XAI | Codex | DeepSeek Harness | OpenCode | Pi |
| --- | --- | --- | --- | --- |
| Session | Thread | Session（JSONL） | Session | Session file（DAG） |
| Run | Turn | Turn | `POST /message` 一次请求 → `session.idle` | `prompt` → `agent_end` |
| Step | Item（`agentMessage/commandExecution/fileChange/mcpToolCall/…`） | `step/*` 与 `tool/*` | Part（`text/tool/step-start/step-finish/…`） | `message_*` / `tool_execution_*` |
| Approval | `item/*/requestApproval` | ACP `request_permission` | `permission.updated` → `/permissions/:id` | 扩展 `tool_call` block / `extension_ui_request` |
| Cancel | `turn/interrupt` | ACP `session/cancel` | `/abort` | `abort` |
| Fork | `thread/fork` | `parentSession` seed | `/fork` | `fork` / `parentSession` |

### 4.5 最小接口（在提案 §7.3 上只加不改）

```ts
interface HarnessAdapter {
  describe(deployment: DeploymentRef): Promise<VerifiedCapabilities>; // 含 approval/cancel 的 nativeBridge、mcp: boolean、structuredOutput: boolean
  start(input: NativeRunInput, host: HostPorts): Promise<NativeRunHandle>;
  // 新增：轮次边界切换所需的最小导入能力
  importTranscript(summary: PortableTranscript): Promise<NativeBinding>; // 不支持时抛 UNSUPPORTED，由路由拒绝切换
}

interface HostPorts {
  emit(event: AgentEvent): void;          // seq 由 host 分配
  requestApproval(req: ApprovalRequest): Promise<ApprovalDecision>;
  toolBroker: { mcpEndpoint: string; inProcess?: ToolShim }; // Pi 用 inProcess
  secrets: (ref: string) => Promise<string>; // 只在容器启动时解析
}
```

`PortableTranscript` = 已完成可见消息 + 工具调用及真实结果 + 关键业务事实 + 用户约束 + 产物引用 + 待办摘要（与提案 §8.3 一致），**不含**原生权限票据、私有推理、缓存、开放 PTY、未完成工具。

### 4.6 切换语义（三级，落到每套的具体机制）

| 级别 | 定义 | Codex | DeepSeek | OpenCode | Pi | 首版 |
| --- | --- | --- | --- | --- | --- | --- |
| L0 新 Session/新 Run 选引擎 | 路由按能力选 | `thread/start` | `session/new` | `POST /session` | `new_session` | **必须** |
| L1 同一 XAI Session 轮次边界切换 | 新原生绑定 + `importTranscript` | `thread/start` 初始 context 或 `dynamicTools`+首条消息 | `session/new` + seed | `POST /session` + `noReply` 注入 | SDK import / 首条 prompt 注入 | 第二阶段 |
| L2 执行中热切换 | 迁移 pending tool / PTY / checkpoint | 不承诺 | 不承诺 | 不承诺 | 不承诺 | **不做** |

L1 前置：当前 Run 已终态；无 `awaiting_approval`/`awaiting_client`；副作用未知（`outcome_unknown`）时禁止自动切换。

## 5. 可独立交付的阶段、验收证据与回退（修订提案 §12）

| 阶段 | 范围（修订） | 验收证据 | 回退 |
| --- | --- | --- | --- |
| P0 设计审查 | 本文 + PROPOSAL 修订 + OPEN 决策 | 目标七条保留；F-01/02/03 写入提案；用户回答 §8 阻塞问题 | — |
| P1 后台实验宿主 | **环境清单**（宿主 OS/arch、容器运行时、userns 可用性、出网白名单、对象存储、Postgres/SQLite）+ `deploy/agent-harnesses/_kit/`（容器基底、secret 注入、evidence 记录、进程树 kill）+ XAI MCP 工具服务（1 个只读 fixture 工具） | 不用任何 Harness，用一个 echo 容器跑通"启动→提交→观察→取消→清理→evidence" | 删除 kit 目录，无产品影响 |
| P2 四套独立跑通 | 每套 `deploy/agent-harnesses/<h>/`：锁定版本、Dockerfile/清单、配置（关默认外联）、`smoke-*.sh`、evidence；§6.2 七个场景 | §6.3 矩阵逐格 PASS/FAIL/BLOCKED_EXTERNAL/NOT_SUPPORTED，每格一份 evidence；四套都有"纯文本任务"与"受控工具（经 MCP）"结果 | 单套可独立停用 |
| P3 统一 Adapter 与切换 | 单进程 Agent Service：API、`agent.*` schema、Supervisor、四个 Adapter（ACP client 共用）、contract suite、L0 切换 | 同一调用脚本在四套间只改 `engineId`；不支持能力被明确拒绝；L1 至少两套通过 | feature flag 关 API；P2 kit 仍可独立用 |
| P4 首个真实业务闭环 | Builtin Adapter（只复用 `llmProvider` wire 层）；服务端幂等；一个窄业务入口；**前置：REL-03 verify + 生产 activation 决策 + F-02 出站授权条款** | 真实写入成功/失败/重复/异参数冲突/账号切换全部有回执；`awaiting_client` 可观察 | 关 flag 回 Builtin 前端路径；已写入不回滚 |
| P5 多平台与生产资格 | Web/App 客户端（App 经 D3）、用量、隔离、控制面（Admin roadmap）、产物策略 | 按引擎×场景批准生产范围 | 按引擎/场景关闭路由 |
| P6 新 Harness 演练 | 新 Adapter + 容器清单 + contract suite | 不改业务/UI；回归通过 | 移除 descriptor |

## 6. 第一实施切片（精确范围；本轮不实施）

### 6.1 切片 S1："harness-smoke-kit + 一套真实 Harness"

**产出文件（新增，全部不触碰现有运行时）**：

```text
deploy/agent-harnesses/README.md                 # 清单格式、evidence 格式、出网/隔离规则
deploy/agent-harnesses/_kit/Dockerfile.base      # 非 root、无 sudo、只挂 /workspace /state
deploy/agent-harnesses/_kit/run-smoke.sh         # 启动→提交→观察→取消→清理→写 evidence
deploy/agent-harnesses/_kit/evidence.schema.json # 提案 §14.2 模板的 JSON Schema
deploy/agent-harnesses/<first>/Dockerfile        # 锁定 tag/版本
deploy/agent-harnesses/<first>/config/*          # 关闭默认外联、deny-by-default 权限、MCP 指向 broker
deploy/agent-harnesses/<first>/smoke-text.sh     # 场景：纯文本
deploy/agent-harnesses/<first>/smoke-tool.sh     # 场景：受控只读工具（经 MCP）
deploy/agent-harnesses/<first>/smoke-cancel.sh   # 场景：取消/超时 + 子进程树检查
deploy/agent-harnesses/<first>/EVIDENCE/*.yaml   # 每次运行一份
packages/agent-toolbroker-mcp/                   # 最小 MCP server：xai.fixture.read（只读）+ 结构化结果；无 React/Tauri/业务导入
packages/agent-contract/src/{evidence,events}.ts # 仅类型/schema；无运行代码
```

**依赖**：一台可跑容器的 Linux 宿主（O1）；一把与 `<first>` 匹配的 API key（§3.6）；`@modelcontextprotocol/sdk`（broker）。**不依赖**：apps/web、Supabase、Admin、任务/日历数据。

**`<first>` 的选择规则（默认假设）**：有 OpenAI API key → Codex（`exec --json` 先跑通，再 app-server）；只有 DeepSeek/Anthropic/其他 key → OpenCode（单二进制 + HTTP 审批 API）；两者都不方便 → Pi（RPC）。DeepSeek Harness 不作为 `<first>`（prerelease、Node 依赖、ACP 才有审批）。**这只决定顺序，不缩减四套范围。**

**验证**：`run-smoke.sh` 对三个场景各产出一份 evidence；`cancel` 后 `ps` 无遗留子进程；容器出网只命中白名单域名；evidence 中无 secret（grep 检查）。

**回退**：删除 `deploy/agent-harnesses/` 与两个新 package；无任何现有模块引用它们。

**治理**：属 `web` 规划下的共享基础设施；分支 `codex/web/agent-harness-smoke-kit`（或 claude 同名前缀）；进入 Workflow V2 前先过 `xai-feature-brief`；不触发 D3（不改 Web 产物）；不触发 D4（无客户端持久化实体）。

### 6.2 S1 明确不做

Agent HTTP API、Postgres schema、四套全部、业务六工具接入、前端任何改动、Admin 任何改动。

## 7. 实现 / 验证 / 部署状态（分别陈述）

| 维度 | 状态（2026-09-09） |
| --- | --- |
| 实现 | 后台基座：**0%**（无 Agent Service、无 Runner、无 broker、无部署清单）。Web Builtin 链路：模型适配/工具定义/确认 UI/账号隔离/恢复已实现；持久幂等实现但生产关闭；无 transcript、无 system prompt、附件不发。 |
| 验证 | 本轮：`@repo/plugin-web-ai-chat` 32/280 通过（43798a6）。四套 Harness：**全部 NOT_RUN**。REL-03 联合验证：未复跑，包内状态 `FIX_READY_FOR_VERIFY`。 |
| 部署 | Web：Cloudflare Pages 静态。服务端：Supabase Edge Functions（sync/recovery）。自主管理后台：**不存在**。四套 Harness：**未部署**。 |

## 8. 必须向用户澄清的问题

### 8.1 阻塞实施（P1 开工前必须回答）

| # | 问题 | 可推进的默认假设 |
| --- | --- | --- |
| Q-1 | **非零知识执行域**：是否接受"服务端 Agent 执行域会看到用户显式授权出站的业务上下文、工具参数与产物明文"，并与 D4 加密 blob 分离？ | 接受，但 P1–P3 只用非敏感 fixture；真实数据接入（P4）前再签资源级授权条款 |
| Q-2 | **宿主**：后台跑在哪（供应商/OS/arch），能否运行容器、是否允许非特权 user namespace、能否挂持久卷？ | Linux x86_64 单机 + Docker/Podman + 持久卷；userns 视宿主而定，不可用则 `externalSandbox` |
| Q-3 | **凭据**：四套各用哪把 API key？是否接受 Codex 只能 API key/企业 token（不能个人套餐）？ | 接受；缺 key 的那套标 BLOCKED_EXTERNAL，不阻塞其他三套 |
| Q-4 | **模块归属（O12）**：后台服务继续挂 `web` 规划并记例外，还是重释 `sync` 的 server 面？ | 挂 `web`，记例外 |

### 8.2 不阻塞（可先用默认值推进，P3/P4 前决定）

| # | 问题 | 默认假设 |
| --- | --- | --- |
| Q-5 | 单租户内部 vs 公网多租户 | 单租户开发验证，schema 预留 tenantId |
| Q-6 | 首批业务场景：助理操作还是 coding | 先只读 fixture；P4 用任务/日历创建（已有六工具） |
| Q-7 | 浏览器关闭后是否允许后台改本地业务 | 不允许；`awaiting_client`；服务端业务 API 另立需求 |
| Q-8 | Run/Event 数据库 | Postgres（Supabase，新 `agent.*` schema）；P1 可 SQLite |
| Q-9 | 预算/并发/时长上限 | 每 Run 15 分钟、每账号 1 个活动 Run、每日 token 上限由 provider usage 记录 |
| Q-10 | 是否允许 shell 类 coding Run | P2 仅 read-only 工具；shell 进入需单独 capability 批准 |

## 9. 对提案 PROPOSAL.md 的修订清单（已同步写入）

| 提案位置 | 修订 |
| --- | --- |
| 头部 | 增加"Claude 审查记录"链接与修订记录 §19 |
| §1 | 补本次审查 HEAD 与测试记录 |
| §4.2 | `commitCanonicalCommand` 行改写为"实现但生产 activation 关闭"（F-01）；`processQueue` 行补 system prompt/附件事实（F-08）；`secretStore` 行补 epoch 说明 |
| §5 前置 | 新增 §5.0"现状：Supabase 零知识后端 + Pages 静态，后台执行域为新增"（F-02） |
| §5.3 | 增加"容器是安全边界，原生沙箱是纵深防御"（F-06） |
| §6.1 | 交付物增加：锁定版本表、凭据类型声明、出网/遥测关闭清单、隔离变量（F-10/11/12/03） |
| §7.1 | ToolBroker 形态改为 MCP server + Pi shim（F-05） |
| §7.4 | 事件集补四个事件；delta 不持久化（F-14） |
| §8.1 | 服务端幂等与浏览器 receipts 分离（F-01） |
| §8.3 | 三级切换改为 L0/L1/L2 并落每套机制（§4.6） |
| §9.3 | ACP 覆盖面更正（F-07） |
| §10.3 | 新增非零知识执行域条款（F-02） |
| §11.x | 每套补确认版本、推荐接口、审批/取消/工具事实、凭据资格（§3） |
| §11.5 | 部署顺序改为按凭据可得性（F-18） |
| §12 | P4 前置条件加 REL-03/activation/F-02；§12.1 首切片按 §6 重写 |
| §15 | O1/O3/O12 具体化；新增 O13 非零知识执行域、O14 REL-03/activation |
| §18 | 勾选"Claude Code 独立审查与优化" |

未改动：用户动机（§2）、USER-CONFIRMED 目标、HISTORICAL 证据、§13 扩展清单、§14 验证格式、§16 治理。文档状态保持 DRAFT。

## 10. 最小下一步

1. 用户回答 §8.1 Q-1～Q-4（可直接接受默认假设）。
2. 若接受：以 §6 的 S1 范围过 `xai-feature-brief`，再进入 feature-plan；不直接 feature-build。
3. 与本审查无关但被发现的债务（另开任务，不在本分支处理）：REL-03 bug-verify；`plugin-web-ai-chat` 包内测试计数文档更新；`plugin-web-storage` 补 PLUGIN_MAP 行。
