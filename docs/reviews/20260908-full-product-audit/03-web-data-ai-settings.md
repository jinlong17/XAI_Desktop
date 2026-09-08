# Web 数据、AI、工作台与设置逐项审查

审查基线：`web` / `9257be40c03216b1006691bfa289bd29d6dfe839`，2026-09-08。主模块归属 `web`；涉及 `sync` 的建议仅列为后续规划，不启动当前暂停的账号云同步工作。

本文覆盖 Web shell、设计 tokens、命令搜索、Dashboard 容器及每一种 widget、AI、记账、指标、桌宠，以及全部设置面板和它们的本地数据/账户边界。Tasks / Time Tracker / Pomodoro / Habits / Meditation / Countdown / Calendar / Matrix / Statistics 的主体及全部 Board 功能由其他并行审查报告覆盖；本文只检查其 Dashboard 展示与设置接线。

证据约定：**源码确认**指已追到当前 host 注册和调用链；**合成复现**指使用仓库源码和隔离的内存测试环境运行，不接触用户数据；**视觉复核**来自父审查会话的截图；**风险/建议**不等于已经复现。未调用真实 LLM、未进行真实付款、OAuth、账户删除或生产数据库写入。本文没有将 package/manifest 的“Stable/Production”自动视作功能完整。

参考依据：`web design/DESIGN.md` 的 Apple Calendar / Apple Reminders / iOS Timer / Linear、安静/清楚/低噪声设计约束；`packages/plugin-web-bookkeeping/docs/design.md` 的 Cloud Design 记账来源；`packages/plugin-web-metric-tracker/docs/design.md` 的 Product Design option 3。已读取 `redesign-existing-projects`、`Frontend Responsive Design Standards` 和 `supabase` skill；只采用与产品约束一致的审查方法，不采用装饰性营销页风格建议。未把“参考产品”描述为本次已登录实际操作的产品。

## 1. 影响多个 feature 的优先问题

| 优先级 | 结论与触发条件 | 证据 | 建议 |
|---|---|---|---|
| P1 | **全新浏览器的 Auth 与 device IndexedDB object store 冲突。** 两者共用 `xai-web-auth` 数据库，但各自通过 `idb-keyval.createStore` 建 `session` / `device`；第一次创建数据库只产生一个 store，另一 store 随后访问会抛 `NotFoundError`。 | `packages/web-auth-device-session/src/storage.ts:15-24`、`device-store.ts:26-28`；本次源码合成复现输出 `AUTH_THEN_DEVICE NotFoundError No objectStore named device in this database`，objectStores 为 `[session]`。 | 用单个版本化 DB 初始化同时创建所有 store，或分库并提供迁移；增加真实 IDB adapter 的 session→device、device→session、并发首启测试。现有 memory adapter 测试不能捕获此问题。 |
| P1 | **本地业务数据和 BYOK 密钥按浏览器 origin / provider 存储，未按登录账户隔离。** 普通退出仅清 auth session；同一浏览器更换账号时，读取路径仍落到同一业务 key。 | `apps/web/src/App.tsx:187-198`；`packages/plugin-web-storage/src/internal/storage.ts:108-130`；`packages/plugin-web-ai-chat/src/internal/secretStore.ts:175-185,209-236`；记账/指标各 storage adapter。 | 建立 `accountId + entity + schemaVersion` 的本地命名空间；设备偏好可以共享，个人内容/API key 应隔离。首次迁移应询问未归属本地数据的归属，不能静默绑定给最后一个登录用户。这与是否实现云同步是两件事。 |
| P1 | **账户删除本地清理漏掉新增业务存储。** 删除流程只遍历 `PREF_REGISTRY`，而 `xai_bk_state_v2`、四个记账布局 key、`xai_metric_tracker_state_v1` 不在 registry；成功删除账户后这些数据仍可能保留。 | `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts:92-106`；`packages/plugin-web-bookkeeping/src/internal/defaults.ts:14-18`；`packages/plugin-web-metric-tracker/src/internal/seed.ts:3`；registry 全文检索。 | 统一登记数据所有权、清理、导出、迁移能力；删除流程按所有权运行 wipe receipt，并验证无残留。实际生产账户删除未执行。 |
| P1 | **很多设置“可以切换并保存”，但没有业务消费者。** 通知/勿扰、智能列表、协作、便签默认项、More 任务默认项等目前主要是持久化 UI。 | 对完整 key 和 suffix 在 `apps/web/src`、`packages` 的 TS/TSX 全局搜索，命中仅 registry / 对应面板；各项详见 §6。 | 以“写入设置→功能行为改变→刷新恢复”的集成用例验收；未接通项标记“尚未支持”并禁用，避免给用户已生效的预期。 |
| P1 | **AI 聊天展示历史但普通发送不把对话历史送给模型。** “继续上面的回答”等正常多轮体验不能依赖前一轮上下文。 | `AiChatModule.tsx:311-318` 只传 text/lang/model/tools；`claudeStreamAdapter.ts:123-126` 在没有 priorMessages 时只构造一条 user 消息。 | 发送有预算的历史消息、明确截断策略；工具往返保留原始用户 turn。增加第二轮基于第一轮信息作答的 mocked request-body 断言。 |
| P1 | **记账 CSV 不是可恢复备份，转账目标账户等字段丢失。** 导出无 `toAccount`、id、预算/账户/规则数据；导入按逗号直接拆行并分配新 id。 | `packages/plugin-web-bookkeeping/src/BookkeepingModule.tsx:1508-1540`。 | CSV 定位为报表交换；另做版本化完整备份。转账应完整保留双方账户；标准 CSV parser/escaping、预检、重复检测和明确导入错误。 |
| P2 | **共享 Toggle 真实视觉回归：46×26 轨道被 `min-height:44px` 撑成近圆。** | `packages/plugin-web-settings-shell/src/styles.css:228-246`；父会话 `20-notifications-desktop.png` 观察到月牙样圆开关。 | 44px 点击区域放外壳，内部轨道保持 46×26，旋钮垂直居中；对所有 Toggle 面板做同一视觉回归。 |
| P2 | **“字体大小”仅改 html font-size，但大多数字号 token 是 px，不随根字号改变。** | `packages/plugin-web-tokens/src/apply.ts:64-71`；`tokens.css:98-106`、`tokens.css:228`。 | 转换字号到 rem 或显式乘 `--font-scale`；测试小/默认/大在任务文字、表格、图表、对话中的实际 computed font-size。 |

## 2. 基础交互和工作台逐项检查

### 2.1 Tokens / i18n / 设计系统

**现状：** Web 有统一语义色、字号、圆角、阴影、中英文本和全局 focus-visible；数字用 tabular-nums。实际字体为 Manrope / Noto Sans SC / 系统 fallback，具备统一视觉基础。证据：`packages/plugin-web-tokens/src/tokens.css:89-106,228-250`。

**问题：** 字号缩放连接不完整，见 §1。AI 仍有 10px / 11px 文本（`plugin-web-ai-chat/src/styles.css:103-107`），低于设计契约 `--fs-xs`；Dashboard 仍保留大量 blur/glass 与 viewport 字号（`xai-web-dashboard-grid/src/styles.css:127,353-354,1083-1087`），和设计契约“quiet grid, not glass cards / 不用 vw typography”不一致。这里属于设计资料与实现分歧，是否保留玻璃个性化应由产品统一决策，不能机械删除用户选择。

**优化：** 把默认外观收敛到安静、可读的产品基线，玻璃/动画作为可选皮肤；颜色 gate 同时检查 TSX inline style/SVG literal（现有 gate 文档只扫描 CSS）；统一字体缩放和最小可读字号。对齐 Linear 式信息层级的依据是项目现有契约，不是复制其皮肤。

### 2.2 Shell / Rail / Topbar / 头像菜单

**现状：** 当前 host 注册 15 个 shell modules（含隐藏于 rail 的 Settings），附加 `/app/todos` 兼容路由；真实注册位于 `apps/web/src/routes/modules/shellRegistrations.tsx:67-95`。搜索入口、外观菜单、设置、统计、头像菜单退出已接线，主题/语言/密度能在重新打开时从本地恢复。

**问题：** 头像仍固定显示 Aki Chen / `aki.chen@xai.app`（`packages/xai-web-shell/src/AvatarMenu.tsx:92-95`）；无法确认当前数据属于哪个真实账户。普通退出虽接通，但本地数据隔离缺失。语言/主题/密度/fontScale 是 root useState + raw localStorage，不监听跨 tab storage（`apps/web/src/App.tsx:123-155`），多 tab 外观可能不一致；`readLocalPref` 对合法 JSON 不做值域校验，异常 fontScale 能传入抛错的 `applyFontScale`。

**优化：** 从 auth session 显示真实身份和本地数据所属账户；为离线/未保存状态在 shell 提供低噪声状态位；把所有外观偏好统一接入同一个校验/跨 tab store。Topbar 弹出层需通过键盘焦点回收、Escape、屏幕阅读器检查；参考 Reminders/Linear 的稳定导航和内容优先原则。

### 2.3 Cmd+K / 全局搜索

**现状：** 有可达的 Cmd/Ctrl+K、搜索索引适配器、50 条上限、模块跳转及若干实体搜索。索引在打开时读取快照；异常 adapter 不拖垮整个搜索。证据：`packages/xai-web-cmdk/src/internal/buildIndex.ts:30-63`、`readModuleStates.ts:26-63`。

**问题：** Calendar、Metrics 仅模块名搜索；AI / Time Tracker 没有 adapter；Bookkeeping 没有搜索入口适配器。`readModuleStates` 给 calendar/metrics/timetrack 空对象，adapter barrel 也缺记账/time/AI（`adapters/index.ts:25-36`；`adapters/calendar.ts:34-50`；`adapters/metrics.ts:40-50`）。打开 palette 后更新业务数据不会刷新索引，这是当前明文 v1 取舍，不能宣传为完整全局实时搜索。

**优化：** 先统一显示“模块”“记录”分类和搜索覆盖范围；补齐日历事件、会话标题、账单备注、时间记录、指标记录 adapter；可选订阅修改版本来重建小索引。检查被关闭的 feature 是否仍出现在结果中，以及结果导航是否定位到实体本身。

### 2.4 Dashboard Grid / 添加、移除、拖动、尺寸、皮肤

**现状：** 11 种 widget 已注册，顺序/尺寸/皮肤本地持久化；原来的添加按钮空接线已修为真实 picker。移除后重新打开仍会按存储顺序显示。每秒 `new Date()` 驱动时钟，不依靠递减秒数保持时刻（`DashboardModule.tsx:31-38`）。

**问题：** 空态条件检查 catalog `widgets.length`，不是当前用户选中的 order；移除最后一个 widget 后变成空 grid，不显示“添加组件”空态（`DashboardModule.tsx:142-154`、`DashboardGrid.tsx:118-145`）。拖拽重排/resize 主要依赖 pointer，无键盘移动/尺寸替代（`useGridDrag.ts:81-125`、`DashboardGrid.tsx:85-103`）。拖拽及 resize 中频繁同步写本地存储，可能产生布局抖动、主线程开销；这里是需性能测量的风险，未声称已测出掉帧。

**优化：** 空态用最终 visible order；提供“向前/向后移动”和尺寸预设；拖动用内存 preview，pointerup 提交持久化。把时钟 tick 限制到需秒级刷新的 widget，静态统计不必整盘每秒重算。保留顶部 Add 作为恢复路径，增加 Undo remove。

### 2.5 每一个 Dashboard widget

各 widget 的注册证据统一位于 `packages/xai-web-dashboard-widgets/src/registrations.tsx:51-117`。下表逐项审查，不把“widgets 包已存在”视为每个 widget 完整。

| Widget | 当前真实功能和重开行为 | 问题/局限 | 前端与实现优化 |
|---|---|---|---|
| 主时钟 `clock` | 真实当前时间，4 种样式与时区偏好；关页后无需后台计数，重开按当前 Date 重算。 | 无需将其“持续运行”包装为后台服务；用户时区与系统时区区别需清楚。 | 显示选择的时区；无效时区提供恢复；跨 DST 与半小时时区测试。证据 `widgets/ClockWidget.tsx:55-71`。 |
| 世界时钟 `timezones` | 本地保存城市列表；添加/删除和多种展示；至少保留一个城市。 | 默认城市由空列表 fallback，刻意不允许删最后一个，缺少显式解释。 | 允许用户清空并显示“添加城市”，或明确最后一个不可删除；用所在地日差标签。证据 `widgets/WorldClocks.tsx:42-64`。 |
| 已完成任务 `stat-tasks` | 读取真实 `xai_task_cols`，完成/总数和 donut，空态诚实。 | 统计是当前存储总量，不是明确的“今天”；清单保留/删除策略会改变分母。 | 写清统计范围；点击直接进入相同过滤条件。证据 `widgets/StatTasks.tsx:29-45`。 |
| 习惯连胜 `stat-streak` | 读真实习惯 store，求 max streak；无习惯显示空态。 | 展示的是最长某一习惯，不是所有习惯共同达成；单一火焰值可能歧义。 | 展示所属习惯/统计定义，点击跳该习惯；跨日补测。证据 `widgets/StatStreak.tsx:33-53`。 |
| 番茄数 `stat-pomos` | 读真实会话，统计今天 focus；无记录为 0。 | 图示总数固定 8（`PomoDots count total={8}`），与用户目标没有接线。 | 目标可设或注明 8 为显示刻度；明确超目标状态。证据 `widgets/StatPomos.tsx:33-45`。 |
| 时间追踪 `timetrack` | 使用时间追踪包提供的数据与当前时间，能导航主体模块。 | 是显示/入口，后台运行保证应依赖 Time Tracker store，不是 widget 存活。 | running 的状态/项目/暂停入口统一；全部 widget 移除后计时恢复由主报告验证。证据 `registrations.tsx:76-80`。 |
| 天气 `weather` | Open-Meteo 城市查找/天气缓存，也允许手动值；有 source、loading、失败和空态。 | freshness effect 仅依赖地点/fetchedAt，缓存过期时没有 interval、online 或 visibility 事件触发；一直开着的页面可长期陈旧，失败后也不自动重试（`widgets/WeatherWidget.tsx:64-86`）。 | 显示更新时间/缓存陈旧；可见时按 TTL 重取、online 重试、手动刷新；用 AbortController；手动天气标记保持可见。 |
| 迷你日历 `mini-cal` | 从真实日历数据画点并导航；时间来自 Dashboard 当前 Date。 | 它不是独立日历同步/提醒引擎。 | 点击某日定位主日历同一天；统一 week-start/day boundary，避免主/迷你两种口径。证据 `registrations.tsx:88-92`、`internal/dataReads/calMonthDots.ts`。 |
| 便签 `stickies` | 有创建、编辑、删除、拖动、resize 和本地持久化；已不是 fixture 便签。 | 设置页便签 color/font/pin/spacing/restore 五个 key 无运行消费者；普通草稿仅组件状态，关弹窗/刷新会丢。 | 默认值真正传入 composer/store；编辑中保存状态/草稿；删除提供 Undo；拖动和 resize 需键盘替代。证据 `widgets/StickiesWidget.tsx:121-155`、`internal/stickiesStore/useStickies.ts`。 |
| 通知摘要 `mail` | 已由旧示例邮件改为真实任务逾期/当天日历聚合；最多 6 条，无数据显示“暂无通知”。 | 只导航模块，不定位 sig 对应实体（`widgets/MailWidget.tsx:60-75`）；没有已读/消除/历史；不属于系统 push，更不会关页发通知。 | 名称持续用“通知摘要”，按来源/时间/已读区分；给 entity deep link；若要真实提醒必须另接调度/推送服务。 |
| 近期事件 `upcoming` | 读真实日历，未来窗口内最多 4 条；无数据诚实空态。 | 日期/重复事件计算在 Dashboard 内复制一份，可能与主日历演进分歧；模块跳转不一定定位事件。 | 共享公共查询 API，显示事件日期与来源，点击定位；跨 DST、重复事件例外规则加跨包契约。证据 `widgets/UpcomingWidget.tsx:40-68`、`internal/dataReads/calUpcoming.ts:139`。 |

## 3. AI 每个功能切片

### 3.1 对话、历史、继续问答与关页恢复

**现状：** 是真实直连 LLM 功能：SSE、非流 fallback、provider、错误 banner、会话创建/选择/删除、消息持久化、重开恢复最近 active 会话均存在。`xai_ai_convos` 保存会话消息，`AiChatModule.tsx:206-231` 在挂载恢复并随消息变化写回。不能再按旧 `package.json` 的“demo adapter”描述认定 live 模块只是 mock；旧 `claudeAdapter` 无 key demo 路径不等于当前 `streamCompleteChat` 路径，后者无 key 明确报 BadKey（`claudeStreamAdapter.ts:87-95`）。

**问题：** 普通多轮不送历史，见 §1。pending FIFO、thinking、工具确认、输入框草稿都仅在组件内存。离开 AI 路由会 abort 当前流（`AiChatModule.tsx:171-177`）；浏览器关页更不会保留后台任务。消息每次更新（含 chunk）全量持久化会话集合，长历史会放大同步 JSON/localStorage 的阻塞和 quota 风险。中途离开时已经写出的 partial 文本可能被恢复为普通 assistant 消息，没有“中断/未完成”标记。

**优化：** 消息模型引入 `queued/running/completed/interrupted/failed`、requestId 和 provider/model；刷新重开明确显示“上次回答中断，继续/重试”。若需求是离页仍完成，必须将任务交给服务器持久队列并用 cursor 重新订阅；当前纯浏览器 direct API 不具备这一保证。没有该产品需求时，也要诚实说明“离开此页会中断生成”。使用 IndexedDB 分条记录及节流 checkpoint，而不是每 chunk 重写全部对话。

### 3.2 附件、语音、输入框、洞察

**现状：** 有附件 picker/chip、语音开关、starter 与洞察显示开关。

**源码确认的缺口：** `AiChatModule.tsx:495-502` 仅保存附件 name/size；发送只带文本，文件内容不读取、不上传、不嵌入请求。voice 只切换 `xai_ai_voice`（`:515-517`），未发现录音/STT/TTS 消费者。`AiComposer.tsx:107-114` 是 `<input type="text">`，但 `:136-137` 提示 Shift+Enter 换行，原生 input 无多行。Enter 发送也未检查 `isComposing`，中文输入法确认候选可能误触发送。

**优化：** 未实现的语音/文件能力明确禁用/标注；实现附件时给 mime/size 限制、解析中/失败/取消、移除、token 预算。输入改 textarea 并处理 IME、Shift+Enter、paste、多行高度。洞察区应说明数据来源和时间范围，避免用户误以为开关控制服务器推理能力。

### 3.3 AI 工具：任务/日历创建、编辑、删除

**现状：** 六种 CRUD 工具已定义，工具调用先显示确认卡，确认才发写事件；Shell 始终挂载 subscribers，因此用户在 AI 路由也能改变 Tasks/Calendar（`apps/web/src/App.tsx:115-119`）。Anthropic / OpenAI-compatible 的 tool protocol 有大量 mocked coverage。

**问题：** `handleConfirm` 发事件后直接构造 `executed successfully` tool_result（`AiChatModule.tsx:624-726`），没有等待业务端持久化成功回执；遇到 quota、非法实体 ID、subscriber 不可用时，“已执行”可能与数据不同。确认卡本身未持久化，刷新会丢待确认动作；这是安全可接受的默认，但用户需知道动作并未执行。

**优化：** 请求/回执使用同一 requestId，业务端返回 persisted/no-op/invalid/not-found，只有收到成功回执才向模型报 success；关键写入幂等记录持久化。确认卡显示改前→改后差异、实体标题和来源，删除有撤销；工具 result 回传原始用户请求而非 assistant preamble。本次未执行真实 LLM 写操作。

### 3.4 Provider、API Key、模型与连通性设置

**现状：** 多 provider 预设，API key 以 AES-GCM + PBKDF2 存 IndexedDB，OpenAI-compatible URL allowlist 与 CSP 对齐（`llmProvider.ts:165-198`），支持模型和流式开关；Markdown 通过 React 文本节点输出，不执行 raw HTML（`MarkdownMessage.tsx:1-6,140-168`）。

**问题：** 加密口令来自同一 origin 下的 device UUID（`secretStore.ts:110-111,185-201`）；它提供本地静态存储混淆/加密，不防同源脚本或 XSS 读取，不能称为账号级密钥隔离或安全硬件托管。上述 IDB schema 冲突会同时影响 key load/save。设置的 key load/save 没有完整 catch 和 loading/cancel 隔离（`aiPane.tsx:74-85,100-110`）；IDB 失败可能成为 unhandled rejection。快速切 provider 时旧 load 结果也可能覆盖新 provider 的 saved 状态。

**优化：** 明确 BYOK 保存在当前浏览器；按账号与 provider 隔离；save/loading/error 状态和请求 generation 保护；清晰解释支持的兼容 endpoint。统一 LlmError config 类，避免普通 Error 被强转为 LlmError 后出现空错误文案。若未来提供平台 Key/计费服务，应由服务端代理控制权限和预算，不能把平台 secret 下发浏览器。

## 4. 记账与指标逐功能审查

### 4.1 记账公共基础

**现状：** `/app/bookkeeping` 正式注册，8 个 tabs、CRUD 弹窗、计算器和本地 adapter 均为真实实现，不只是截图。已明确 `device-local`，没有 backend account-sync（`internal/storage.ts:109-128`、`docs/design.md`）。

**共同问题：** 初次/损坏数据读取直接返回完整示例账本、交易、持仓、预算 5000（`internal/defaults.ts:192-207`），缺少干净空账户与 demo 区隔。Storage 写失败被吞掉，但 UI 仍更新为成功数据（`internal/storage.ts:36-42,157-161`）；刷新后会丢失用户以为保存成功的账目。边界校验只检查几个字段及“数组”，不校验每条交易/账户，损坏 JSON 可通过浅校验后在渲染/分析中崩溃（`:65-80`）。整个模型写入同一 key，没有跨 tab 原子更新保证。

**建议：** 首次空态提供“创建账本/导入/查看示例”；样例数据不能默默进入净资产与支出统计。写入返回结果并显示保存失败、重试/导出；版本化 schema 校验、原始坏数据隔离备份、账户级命名空间。需要大数据量时用 IndexedDB 事务，不要对账户余额和交易列表分别作无事务推断。

| 记账子 feature | 现状 | 问题与触发条件 | 优化建议与证据 |
|---|---|---|---|
| 总看板/快速记账 | 现金流、近期账单、预算、资产与快捷输入，布局可持久化。 | 样例数据默认混入；同一入口含多个统计口径，局部 empty/loading/save error 缺少统一处理。 | 用统一账本/月份范围与来源标签；高密度保留 3 个关键指标，其余次级展开。`BookkeepingModule.tsx:50-65`、`internal/defaults.ts:192-207`。 |
| 账单 CRUD / 计算器 | 收入、支出、转账、预付；新增/编辑会反向撤销旧余额再应用新余额。 | 删除多为立即执行，缺 Undo；金额以 JS number 累加，显示舍入不等于账务精度；计算器与输入保存边界需覆盖负数、极大值、多币种。 | 用最小货币单位整数或 decimal；集中验证 finite/positive/currency/account；撤销删除。`internal/state.ts:58-113`、`internal/money.ts:15-24`。 |
| 自然语言“AI 识别” | 真实本地关键词/正则解析，不调用 LLM。 | UI 标“AI 识别”，实际取每段第一个数字；“9月8日午饭38元”可读成 9 元；固定关键词账户 id 在自定义账户后可能不存在。 | 名称改“文本识别（规则）”，显示逐条可编辑预览与低置信字段；若接 LLM 仍必须保留用户确认和 schema 验证。`internal/analytics.ts:140-167`、`BookkeepingModule.tsx:1350-1351`。 |
| 日历/月年视图 | 按交易日期聚合收入/支出，转账不计入收支。 | 跨月范围与时区依赖本地 date key；大量交易每次 filter/group 缺专门性能基准。 | 与列表共享范围选择；按日索引并缓存；日期点击用同一 filter 展示账单。`internal/analytics.ts:65-75`。 |
| 明细/列表/分类过滤 | 支持文本与 type 过滤、按日分组。 | 过滤通过内部分类 id/account id 搜索，未总是搜索显示名称；备注/商家含逗号换行的导出会损坏。 | 建搜索 normalizer 包含展示名；无结果时提供清除筛选；大列表分页/虚拟化。`internal/analytics.ts:78-90`。 |
| 统计/趋势/分类钻取 | 从账单计算各分类和收入支出统计。 | 使用静态汇率，未按交易日快照；更改汇率模型将使历史结果漂移；图表口径和空态需要明确。 | 标“估算汇率/更新时间”，每交易锁定 exchangeRate；图表可键盘定位并提供数据表。`internal/analytics.ts:17-24,41-62`、`internal/defaults.ts:28-38`。 |
| 预算 | 有预算总额和分类预算 UI。 | 默认 5000 是样例；预算是整个 state 上字段，需核对多账本/月预算隔离是否符合产品意图。 | 预算实体按 ledger + period，支持结转与超支说明；保存失败必须可见。`internal/defaults.ts:205`、`BookkeepingModule.tsx` BudgetView。 |
| 资产/账户管理 | 账户余额汇总、账户增改删与默认账户。 | 删除账户把历史交易 account/toAccount 改成 fallback，却没有相应余额迁移；删除账本移除交易却不撤销余额，和单笔删除的处理口径不同。 | 优先归档账户而非改写历史；删除账本明确保留/撤销账户影响，事务执行并加 invariant 测试。这里是源码确认的不一致，期望口径需产品决定。`internal/state.ts:110-160`。 |
| 投资/持仓/净资产 | 手动持仓 shares/price 并计算价值。 | `netWorth` 假定投资人民币，非 CNY 一律 `/7.15`，EUR/JPY 等也按 USD 汇率算，金额错误。 | 持仓记录报价币种，统一 convertCurrency；显示手动估值日期，缺行情不能暗示实时。`internal/analytics.ts:94-102`。 |
| 周期记账 | 保存周期规则、开关、编辑、删除和手动记一次。 | 未找到自动调度器；按钮每点生成新 id，当天可重复入账；没有关页后的补跑/去重。 | 明确“模板/手动记账”；若目标自动入账，记录 occurrence key + lastProcessedAt，恢复时预览补记并幂等执行；真正关页执行需服务端计划任务。`BookkeepingModule.tsx:1195-1217`。 |
| 导入/导出 | 当前账本 CSV 导出和简易列导入，有前 4 条预览。 | 无标准 quote/newline escaping；无转账对方账户；导入每行分配新 id 可重复；不保存私密/报销/location/recurring；“支持微信支付宝”文案超出固定列 parser 实际能力；没有全数据恢复格式。 | 加格式识别、列映射、错误报告、去重、转账验证；独立 versioned JSON backup + dry-run restore。`BookkeepingModule.tsx:1508-1545`。 |

### 4.2 指标追踪（Metrics）

**现状：** `/app/metrics` 可达。当前只实现体重，睡眠/饮水/运动是 disabled planned tabs，这是明确的 V1 范围，不应标为故障。目标进度左、时间记录中、分享右、图表下的布局来自已选设计 option 3。

| 指标子 feature | 现状 | 问题 | 建议/证据 |
|---|---|---|---|
| 体重记录 CRUD | kg/斤原值保留，统一 kg 分析；编辑/soft delete；本地重开恢复。 | fresh state 注入 2026-05-07～25 的 9 条他人体重样例和身高 178/目标70，当前日期已很旧；localStorage 读写无异常保护。 | 首次健康数据为空，引导填写身高/目标；示例模式单独入口；保存失败明确反馈。`internal/seed.ts:6-9,59-81`、`internal/storage.ts:62-70`。 |
| 目标/个人参数/BMI | 可保存身高、目标、单位，实时派生 BMI 和进度。 | saveProfile 只用 Number(...) \|\| old，负数仍可保存；读边界仅检查 number，不检查 positive/finite；profileDraft 对跨 tab 变更没有重新同步。 | 对身高/目标做合理值域/finite 校验和明确错误，单位变更不改变原始值；避免把单一健康指标/下降趋势恒定渲染成“good”。`MetricTrackerModule.tsx:123-127,193-199`、`internal/storage.ts:18-23`。 |
| 记录范围、趋势和图表 | 列表与分享/统计有独立时间范围，图表点可 hover/focus。 | `now` useMemo([]) 固定为初挂载时刻；跨午夜长期不关闭的页面范围不会自然前移。 | 可见时/跨日刷新 day key；在两个独立范围标题都显示具体日期，避免用户误比；为无数据给真实空态。`MetricTrackerModule.tsx:129-139`。 |
| 导出/分享 | 图片下载使用 canvas data URL；可用 Web Share 时分享文字，否则下载图片。 | “分享给好友”实际 share({title,text}) 无图片文件；图片不是结构化备份；无数据导入恢复。 | 分开“分享文字/分享图片/导出数据”，可用 canShare(files) 后分享真实图；增加 JSON/CSV export/import。`MetricTrackerModule.tsx:202-225,354-388`。 |
| 弹窗/删除 UX | Quick log 有 role=dialog、autoFocus、点击遮罩关闭。 | 没有 Escape/Tab focus trap/inert 背景；删除直接 soft-delete 但 UI 无 Undo/回收站。 | 用共享原生 dialog 或成熟 modal；保存草稿；撤销入口。`MetricTrackerModule.tsx:343-344,393-440`。 |

本模块 `storage.test` / CRUD 测试已通过，不能由此推断 browser quota、跨午夜和账号切换已验证。

## 5. 账户、会话、本地存储和持续运行

### 5.1 登录/会话/设备

**现状：** Supabase PKCE，session 保存 IndexedDB、verifier 保存 sessionStorage；`persistSession=true` / `autoRefreshToken=true`（`client.ts:19-27`）。关闭并重开浏览器后，可尝试从本地 session 恢复，而不是每次必然退出；真实 token 是否有效取决于服务端状态和网络。device heartbeat 每 5 分钟以及 visibility 回到 visible 时触发（`heartbeat.ts:13-39`），不是保证浏览器关闭后仍发心跳的服务。

**确定问题：** §1 的 IDB object store 冲突。本次 Auth 42 tests 都通过，但 `device-store.test.ts:7-8` 显式注入 memory adapter、`storage.test` 也只测替身，不覆盖同一 DB 创建两个 store。

**其他风险：** 初始化 `void refreshSession()`、`identityStore.get().then(...)` 没有失败 UI/catch，IDB/网络异常可能导致 loading 长留（`session.tsx:73-85,105-113`）；device 首次注册的非 device-revoked 异常被 catch 后吞掉，缺自动退避重试（`DeviceSessionBridge.tsx:73-93`）。auth guard 的默认 fallback=null，需在 host 验证是否有明确加载/离线/重试提示。

**优化：** 先修 schema 初始化；会话 bootstrap 分离“本地加载失败/离线/会话过期/设备撤销”，避免一个空白加载吞掉所有情况；注册失败重试有退避、online 触发和可见错误；用真实 browser IDB 的 fresh profile 与 existing profile 回归。

### 5.2 普通退出与删除账户

**普通退出：** 头像菜单走 host `handleSignOut`，服务端 best effort + local auth clear + hard redirect。业务内容、AI key 未清除/隔离见 §1。Settings Account 面板的 Sign Out 是另一个无 handler 按钮，不能用头像菜单已修复来宣布全站退出按钮都已修复。

**删除账户：** native dialog 两步确认、输入 DELETE、后端成功后再本地 wipe，顺序合理。实际删除端到端未运行。`wipeRegisteredIDB` 把 `onblocked`/`onerror` 当成功完成（`wipe.ts:62-69`），其他 tab/open connection 可阻止即时删库；本地 key registry 漏项是确定实现缺口。建议 wipe 显示完成回执、关闭本应用连接并通知其他 tab，失败可重试，不能在未清干净时宣称全部本地资料已删除。

### 5.3 Persistence Contract

**现状：** 有 typed registry、same-tab pubsub、跨 tab storage 订阅、codec、compare-before-write 和 quota 失败 boolean（`storage.ts:137-197`；`usePref.ts:143-179`）。大部分已持久化实体关页后仍在同一浏览器 origin 中；无需为了静态数据保存而后台开页面。

**问题：** hook 的 `readCurrent` 和 `isDefault` 直接再次读 localStorage，没有 guard（`usePref.ts:99-114`），storage 被禁用时会绕过 getPref 的 fallback；setValue 丢失 boolean 返回值，消费者无法给保存失败反馈。多 tab 是整对象最后写入覆盖，没有锁/事务/合并；“跨 tab 会刷新”不能等同于“并发编辑安全”。`migrate` 仍是 v1 stub（public index:82-84）。记账/指标又另建 adapter，清理/备份/迁移合同碎片化。

**优化：** 元数据返回 `status/error/lastSavedAt`；read/write/result 统一；异常数据隔离不静默覆为样例；业务数据迁移到统一带版本 repository，跨 tab 用 Web Locks/事务或操作日志。先解决本地可靠性，再由 sync lane 决定是否上云。

**公共 API 潜在风险、非当前 UI 已复现缺陷：** `resetAllPrefs()` 会删除 registry 下所有 `xai_` key，包括任务/会话等业务数据（`plugin-web-settings-shell/src/internal/resetAllPrefs.ts:29-44`）。但是当前可达 Appearance 与 Features 都显式传入专属 `onReset`，分别位于 `AppearancePane.tsx:419-422`、`FeaturesPane.tsx:41-44`；没有证据说明用户现在点击这些“恢复默认”就会清全部业务数据。应在公共默认实现按 category 过滤，并加“不删业务数据”契约测试，避免未来新面板误用。

### 5.4 关闭网页、断网、返回的准确边界

| 能力 | 网页关闭/浏览器结束 | 重新打开 | 本次结论 |
|---|---|---|---|
| 已保存的会话、账目、健康记录、便签、布局 | localStorage/IDB 保留，不需要浏览器继续执行 JS。 | 同一 origin/浏览器配置通常恢复；清理站点数据/无痕/换域名/换电脑不保证。 | 源码确认本地持久；生产备份和跨设备恢复未实现于这些模块。 |
| 尚未保存的输入/弹窗草稿/AI发送队列 | 组件内存消失。 | 不自动恢复。 | 源码确认。 |
| AI 回答生成 | 当前 fetch/stream 与页面生命周期绑定；切换离开 AI 路由已主动 abort。 | 恢复已保存消息，不自动续跑/续传。 | 源码确认；无真实 provider 关页计费测试。 |
| AI待确认工具 | 确认卡随页面消失；没有确认就不应执行写操作。 | 不自动恢复确认卡。 | 源码确认；安全默认，但 UX 应说明。 |
| 世界/主时钟 | JS 不执行也无须累计秒。 | 由当前 Date 重新计算。 | 源码确认正确思路。 |
| 天气抓取 | 无后台抓取任务。 | 挂载时检查缓存并可刷新；长驻页面可能过期不更新。 | 源码确认。 |
| 通知摘要 | 不会执行 push/系统提醒。 | 根据目前任务/日历状态重算摘要。 | 源码确认；不能等同推送服务。 |
| 记账周期规则 | 没有自动执行调度，关闭后不自动记账。 | 规则恢复，用户手动执行。 | 源码确认。 |
| auth device heartbeat | 停止，后台 tab 也受浏览器调度限制。 | 可见时触发 heartbeat，先要修 IDB store 问题。 | 源码+合成复现；未检查生产会话状态。 |

## 6. 设置：每一面板单独结论

当前可达 Settings 使用 **host 的 `ComposedSettingsModule`**，而不是 package 中单独的 `SettingsModule`；host 遍历全部 composed panes，包含 AI（`apps/web/src/routes/modules/composedSettingsRegistration.tsx:87-115`）。package 旧 sidebar GROUP_BOUNDARIES 未列 AI 是潜在复用漂移，不能据此误报 live 设置入口缺失。

| 面板/feature | 当前现状 | 问题 | 优化建议与证据 |
|---|---|---|---|
| 设置 shell | 14 panes 真实替换完成，URL 双向同步，支持 back/forward、键盘 Enter/Space 选项。 | host 复制一份 shell/sidebar 实现，package 分组与 host 单组不同；注释仍称13。共享 Toggle 形状回归。 | 收敛 composition 注入点，单一 sidebar 渲染；语义 nav + aria-current；修 Toggle 后截图覆盖所有面板。`composedSettingsRegistration.tsx:49-118`。 |
| Appearance 外观 | 主题/语言/密度/颜色/rail/fontScale live apply，当前 Reset 有专属安全覆盖。 | 按修改立即生效又保留 Save，用户不清楚是否需要保存；fontScale 对 px token 不生效；跨 tab root 状态不跟随。 | 单一“自动保存”反馈或真实编辑/取消语义；字号按比例覆盖所有正文；统一 store。`AppearancePane.tsx:77-164`。 |
| Features 功能开关 | 8 个 feature 隐藏 rail 且 deep-link fallback，恢复只重置八项。 | 后加 Time Tracker/Bookkeeping/Metrics 没有开关，整个开关目录不覆盖实际产品；AI/countdown/statistics 有意不可关闭。 | 产品明确“可选功能”而非“全部功能”；注册元数据驱动开关与搜索一致，不硬编码多个清单。`useFeaturePrefs.ts:17-29`、`shellRegistrations.tsx:67-93`。 |
| Account 账号 | mock 个人资料 + 真删除流程，头像菜单有真退出。 | Settings 自己的头像编辑、升级、Sign Out 没有 handler；名字/email不来自 session。 | 真实 profile，删除与退出分区，未实现编辑禁用；同一退出 action 不复制两个版本。`accountPane.tsx:61-82`。 |
| Premium 高级版 | 明确非可关闭的“UX preview”banner，local free/pending/premium_stub；Payment Link URL 未配时禁用。 | 回调只要非空 session_id 就 premium_stub；取消仅改本地 tier，30天是客户端时间；不是可信计费/权益系统。 | 保留预览标签；生产订阅前接 webhook 验签、服务端 entitlement、幂等 checkout 和真正取消接口；不要把 stub 升级视为开通权限。`CheckoutSuccessPage.tsx:53-78`、`premiumCancelButton.tsx:46-58`。 |
| Smart Lists 智能列表 | 面板可设置可见性，值持久化到 `xai_pref_smart_lists`。 | 全局源码检索未发现 Tasks/rail 的消费者；设置可能不改变实际列表。 | 用当前任务模块的真实 smart-list registry生成选项并接通筛选；增加切换后真实列表变化测试。`panes/smartListsPane.tsx:82-126`。 |
| Notifications 通知 | 总开关、task/pomo/habit、声音、DND时间均可保存。 | 没有 key 消费者；没有权限状态/系统推送接线；用户会以为关页也提醒。 | 先拆“应用内提示”“浏览器通知”“离页推送”；显示 unsupported/denied/granted；通过真实调度器消费这些偏好并测试跨夜勿扰。`notificationsPane.tsx:21-51,53-145`。 |
| Date & Time 日期时间 | 五个 key：week start/lunar/week numbers/holiday/timezone。 | 完整 key 和 suffix 搜索均只命中 registry 与面板，未见 Calendar/Clock 消费；时区是 boolean，不是 IANA zone。 | 接到主日历/迷你日历/记录日期统一契约；区分“显示时区”与“选择时区”，说明哪些地区节假日受支持。`dateTimePane.tsx:21-39`。 |
| More 更多 | window type、launch/minimize、识别、任务默认值、模板预览。 | Web 页面显示 native launch/tray 开关，保存不代表实现；任务默认日期/提醒/优先级/标签等无消费者；“Language follow system”只一个 option/no-op。部分伪 checkbox 仅 label 点击，无原生 input键盘语义。 | 按 Web host capability 隐藏或说明桌面专属；默认值接 Tasks创建入口；模板变为可应用或明确只读示例。`morePane.tsx:203-269,273-378,394-409`。 |
| Integrations 外部集成 | 三个 OAuth stub 有 state+PKCE及回调清理URL；另有14未接线卡；banner明确 stub。 | 三 provider clientId为空；回调仅翻本地 connected，没有 token exchange/data sync；connect失败吞掉。不是 Notion/GCal/Linear 真连接；其他卡 prod no-op。 | 未配置禁用 Connect并解释；真实集成由server保管token、刷新/撤销、同步状态和失败重试；没有数据同步不要显示普通“已连接”。`integrationProviders.ts:45-78`、`CallbackPage.tsx:160-177`、`integrationConnectButton.tsx:37-47`。 |
| Collaborate 协作设置 | avatars/defaultShare/mentionNotify 三项存储。 | 未找到业务消费者；不代表真正角色/权限或 mention通知生效。 | 将默认 share 权限绑定 Board share contract，单独测试权限 enforcement；纯外观 avatar与安全权限选项分开。`collaboratePane.tsx:22-32`。 |
| Sticky 便签设置 | color/font/pin/restoreSize/grid spacing 预览控件和持久化。 | 与 Dashboard Stickies 运行默认值未接通；pin/restore在Web里含义不清。 | 定义“新便签默认”“现有便签批量应用”差别，接通创建/渲染，桌面window特性由host capability说明。`stickyPane.tsx:39-57`、Dashboard Stickies 源码检索。 |
| Hotkeys 快捷键 | 只读10行说明表。 | 除 Cmd/Ctrl+K 与局部 matrix外未找到对应组合处理；列出 Cmd+C/T/P等浏览器原生组合，会误导为打开日历/Today/Pomodoro。 | 由实际 command registry导出帮助；按 OS显示；标示当前焦点作用域，避开浏览器保留快捷键。`hotkeysPane.tsx:29-39`。 |
| About 关于 | 关于文本和若干链接位。 | FAQ/支持/隐私等是 aria-disabled span/Coming soon；不能当作已提供正式帮助与政策入口。 | 接真实版本/build hash、反馈、更新说明与可达政策URL；中文/英文保持一致。`aboutPane.tsx:36-45`。 |
| AI 设置 | provider/key/model/stream四类真实设置，可deep-link进入。 | key存储错误与切provider异步竞态，见 §3.4；test connection会实际访问provider，不能当作无副作用纯本地检查。 | 保存/测试/失败/取消状态清楚，并显示当前provider可用能力；本次未点击真实测试连接。`aiPane.tsx:74-125`。 |

## 7. 桌宠与成就

**桌宠现状：** 8 个角色、拖动、换宠、定时 tip、位置clamp，id/pos持久化；网页关闭时动画停止并无数据任务，重开按保存位置恢复（`packages/xai-web-pet/src/DesktopPet.tsx:80-95,111-172`）。

**问题：** 显隐在 App 是 `useState(true)`，每次重开又显示（`apps/web/src/App.tsx:130`）；拖动每个 pointermove 写pos本地存储；pet body只是 div pointer handler，没有键盘交互；tip是轮播文案，不是基于真实任务/成就的AI响应。定时happy timeout未统一清理是低优先维护问题。

**建议：** 保存“隐藏桌宠”的偏好；尊重 reduced motion与专注模式；默认不覆盖核心按钮；位置在drag结束提交；提供键盘选择与移动；真正接任务完成时用明确事件与去重，不把静态励志文案作为智能洞察。

**独立成就 feature：** 当前 Web 注册和包源码未发现独立成就模块/持久成就账本；可见的 habit milestone badge由习惯模块计算，pet描述中的“为每个成就闪烁”只是文案（`xai-web-pet/src/internal/petDefs.ts:57`）。应在功能清单区分“习惯里程碑 UI”与“统一成就系统”；若未来实现统一成就，要持久事件ID、跨功能规则、撤销/重算语义和历史可追溯，不能仅靠瞬时 event bus。

## 8. 本次验证、缺口与建议验收序列

实际执行的已有测试（均 `--maxWorkers=1`，避免与其他并行审查抢占全量资源）：

| 包 | 完整执行命令（仓库根目录） | 文件/用例 | 结果 |
|---|---|---:|---|
| `@repo/plugin-web-ai-chat` | `pnpm --filter @repo/plugin-web-ai-chat test -- --maxWorkers=1` | 29 files / 253 tests | PASS，38.08s；AiChatModule存在 React act warning，需要修测试异步收尾，不能把 warning当功能故障。 |
| `@repo/plugin-web-bookkeeping` | `pnpm --filter @repo/plugin-web-bookkeeping test -- --maxWorkers=1` | 4 / 7 | PASS，6.96s；覆盖密度明显低于8tabs+多弹窗实际功能体量。 |
| `@repo/plugin-web-metric-tracker` | `pnpm --filter @repo/plugin-web-metric-tracker test -- --maxWorkers=1` | 4 / 13 | PASS，7.99s。 |
| `@repo/web-auth-device-session` | `pnpm --filter @repo/web-auth-device-session test -- --maxWorkers=1` | 11 / 42 | PASS，13.99s；使用 memory mocks未捕获真实IDB schema问题。 |
| **合计** | 四个包各运行一次现有完整测试套件 | **48 files / 315 tests** | 上述现有测试全部通过，不等于发现的问题不存在。 |

具体套件文件（名称省略共同 `.test.ts` / `.test.tsx` 后缀，前三包位于各包 `src/__tests__/`）：

- AI 29 个：`AiAurora`、`AiChatModule`、`AiComposer`、`AiSidebar`、`AiThread`、`BreathingOrb`、`ConfirmationCard`、`ErrorBanner`、`MarkdownMessage`、`backCompat`、`claudeAdapter`、`claudeStreamAdapter`、`contextProvider`、`index-barrel`、`isAiConvoRecord`、`llmErrors`、`llmProvider`、`makeConvoFromUserText`、`no-plaintext-key`、`openAiAntiDrift`、`openAiRoundTrip`、`openAiToolFormat`、`openAiToolProtocol`、`registration`、`secretStore`、`sseParser`、`starInstances`、`toolRegistry`、`toolUseProtocol`。
- 记账 4 个：`BookkeepingModule`、`registration`、`state-analytics`、`storage`。
- 指标 4 个：`MetricTrackerModule`、`metrics`、`registration`、`storage`。
- Auth 11 个（`src/`）：`auth-actions`、`callback`、`device-fetch`、`device-session`、`device-store`、`device-transport`、`guards`、`heartbeat`、`redirects`、`storage`、`components/WebAuthPage`。

额外只读合成验证：已保存可重复运行的 [auth-idb-audit.mjs](auth-idb-audit.mjs) 和实际 [auth-idb-audit.log](auth-idb-audit.log)。运行 `node docs/reviews/20260908-full-product-audit/auth-idb-audit.mjs`。脚本用仓库安装的 `esbuild@0.28.1` 把原始 `storage.ts`、`device-store.ts` 与 `fake-indexeddb@6.2.5` 打包为内存模块，每个场景新建隔离 `IDBFactory`。先 session 后 device 稳定得到 `NotFoundError: No objectStore named device`、store仅 `[session]`；反向先 device 后 session 也得到 `NotFoundError: No objectStore named session`、store仅 `[device]`。退出码 0 表示两个预期缺陷均复现；如修复后行为变化，脚本返回 1 提醒复审，不应把它当作要求缺陷永远存在的产品回归测试。没有操作真实浏览器IDB、网络或任何账户，产品源码未修改。

优先验收按用户后果排序：

1. fresh profile 与 existing profile：登录→设备注册→保存AI key→刷新→新tab→退出→换账号；验证没有IDB错误、串号数据或旧key复用。
2. 保存失败：模拟 quota/security error，Tasks/AI/记账/指标/便签必须显示失败并保留可恢复草稿；重开不能只留下一个“保存成功”的假象。
3. AI mocked slow stream：发送两轮验证历史；切路由/关tab/重开验证中断标记；pending工具不误执行；tool write失败不报success。
4. 记账往返：包含转账、两种币种、逗号/换行备注、私密/报销标记，完整export/import后数据和账户余额一致；重复导入不重复记账。
5. Settings真实行为：对每个设置改变目标feature并重开验证，不能只断言localStorage有值；原生专属项不应在Web伪装可用。
6. UI/accessibility：Toggle三状态、键盘/IME、modal focus/Escape、fontScale、375/768/1440宽、dark/reduced-motion；从记录到实际详情的deep-link一致。

本报告给出修改建议，不直接更改产品实现。视觉截图与部署/计时主结论请和其余并行报告一起阅读。
