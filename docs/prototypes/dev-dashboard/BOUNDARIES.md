# Dev-Dashboard — 页面与卡片边界规范 (Page & Card Boundary Spec)

> **定位**：本文件是个人开发看板「每个页面、每个卡片」的**边界契约**。
> 它回答三件事：(1) 这个页面/卡片**负责什么**；(2) 它**应该展示什么、不应该展示什么**；
> (3) **新内容该归到哪里**。它是 `TEMPLATE.md`（通用可复用模板）在本项目的**具体实例**。
>
> 配套文件：`TEMPLATE.md`（跨项目通用模板）· `DESIGN.md`（设计动机）·
> `docs/workflow/project/dev-dashboard.md`（机器契约）。
> 维护：内容/卡片变更后，由 `xai-dev-dashboard-sync` 一并核对本文件与 `TEMPLATE.md`。

---

## 0. 核心模型：Owner / Mirror / Shared-Widget（一切边界的根）

看板里 90% 的「重复 / 边界模糊」都来自一个问题：**同一份数据被两个页面各自重新实现了一遍**。
本规范用一个三态模型彻底约束它：

| 角色 | 定义 | 规则 |
|---|---|---|
| **Owner（归属页）** | 每个数据域**有且只有一个**页面渲染它的**完整明细** | 明细渲染函数只能存在一份；新明细只能加在 Owner 页 |
| **Mirror（镜像/再展示）** | 其它页面对某数据域的**再展示**——可薄如摘要，也可**富如完整卡片/图**（总览尤其鼓励富展示） | 必须①**复用 Owner 的渲染器/数据/状态词汇**（reuse，不 fork 第二套实现）；②带跳转回 Owner；③Owner 仍是 canonical 渲染器与数据形状的唯一定义处。**展示多少由该页定位决定；唯一禁止的是 fork 第二套实现（drift 之源）** |
| **Shared-Widget（共享挂件）** | 一个被多页嵌入的**小型只读状态徽标**（如测试状态 badge） | 必须是**单一共享函数**（如 `renderTestingBadge(key)`），由其数据 Owner 维护；嵌入处只作状态指示，不得展开成第二张明细卡 |

**判定口诀**：要展示别的页面已有的内容时，问自己——
「我是在 **fork 第二套渲染器/状态词汇**（❌ 违规，会 drift），还是在**复用 Owner 的渲染器/数据再展示**（✅ Mirror，富/薄皆可），还是**嵌一个共享状态徽标**（✅ Shared-Widget）？」

> **在屏幕上多次出现 ≠ 重复**。重复指**实现层 fork**（两套代码/词汇），不是**展示层再现**。富展示是总览的价值，不是债。

数据域 → Owner 映射（本项目）：

| 数据域 | Owner 页 | 允许的 Mirror 位置 | 共享挂件 |
|---|---|---|---|
| 产品模块（注册表）/ 结构 / 模块明细 | **产品结构图** | 总览（模块状态镜像） | feature-status badge |
| 未来平台规划（planning-only `future_surfaces`） | **产品结构图** | 总览可显示规划摘要（不得当成模块状态） | — |
| 任务（dev_log 聚合） | **任务进度** | 总览（next action 行，可选） | — |
| Git 活动 / 趋势 | **开发数据** | 总览（KPI 信号：今日 commit 等） | — |
| 分支策略 / 闸门 | **分支管理** | 总览（KPI：web↔dev 分叉） | — |
| 部署状态 / 记录 | **部署** | 总览（部署镜像） | — |
| 测试结果 / 记录 | **测试结果** | 总览（测试镜像）· 部署 · 发布（嵌徽标） | **test-status badge** |
| 发布历史 | **发布记录** | 总览（最近发布行） | — |
| 文档 | **文档库** | 各页 related-docs 按钮（跳转，不内嵌） | — |
| Skill / Agent 注册表 | **Skill 和 Agent** | 总览（常用 Skill 镜像条） | — |
| 操作命令 / 进程控制 | **使用和操作** | 部署页（构建/部署命令交叉链接） | — |
| 看板自身同步状态 | **总览**（原生） | — | — |
| 跨模块同步编排 / ADR-0014 actions | **产品结构图** | — | — |

> 总览是**富聚合驾驶舱**（定位 = **多展示**，不是薄索引）：它可以富展示任意 Owner 的内容
> （flow 图、模块卡、drawer 都可以）。它的约束**不是少展示**，而是**实现层复用**——
> 复用 Owner 的渲染器/数据/状态词汇，而非 fork 第二套。**总览的富展示是有意为之，不算重复**
> （operator 决策 2026-06-03）。

---

## 1. 状态与颜色词汇表（单一来源）

> 颜色不是装饰，是**语义**。全看板共用一套状态色，禁止每个页面各定义一套。
> 当前实现已把 feature / deployment / testing 的状态 map 收敛到 `js/status-meta.js`，
> 各页面只消费共享 helper。色值见 `styles.css` `:root` token。

### 1.1 状态 badge 色（7 色，语义唯一）

| class | token | 浅色 hex | 语义（跨页统一） |
|---|---|---|---|
| `b-green` | `--green` | `#34a853` | 成功 / 已部署 / 通过 / 已交付(shipped) / fresh / 符合预期 |
| `b-cyan` | `--cyan` | `#12b5cb` | 进行中 / 部署中 / 开发中(in-dev) / active / 运行中(未托管) |
| `b-blue` | `--blue`(=accent) | `#1a73e8` | ready / 规划(planned) / 新增 / info / policy·release·branch 标记 / 默认兜底 |
| `b-yellow` | `--module-yellow` | `#b56f00` | 待处理 / 暂停(paused) / 部分(partial) / 偏旧 / warning / 未生成 |
| `b-red` | `--red` | `#ea4335` | 失败 / 错误 / 风险 / 方向待定(contested) / 缺失 |
| `b-purple` | `--purple` | `#7c4dff` | 需回滚(rollback) / 陈旧测试记录(stale) |
| `b-gray` | `--faint` | `#647288` | 中性 / 未知 / 未部署 / 提案(proposed) / 空态 |

### 1.2 三套领域状态枚举（都映射到上面 7 色，禁止新增第 8 色）

- **部署** `not_deployed→gray, ready→blue, deploying→cyan, deployed→green, failed→red, rollback→purple, pending→yellow`
- **测试** `pass→green, fail→red, partial→yellow, stale→purple, unknown/not_run→gray`
- **Feature 生命周期**（唯一来源应为共享 `FEATURE_STATUS`）`shipped→green, in-dev→cyan, planned→blue, proposed→gray, paused→yellow, contested→red`

### 1.3 产品模块色（每模块一色，跨页固定，`styles.css:673-681` `[data-product]`）

| 模块 key | token | 浅色 hex |
|---|---|---|
| `web` | `--module-blue` | `#1a73e8` |
| `app` | `--module-green` | `#34a853` |
| `plugin` | `--module-purple` | `#7c4dff` |
| `sync` | `--module-cyan` | `#12b5cb` |
| `site` | `--module-yellow` | `#b56f00` |
| `admin` | `--module-red` | `#ea4335` |

> **颜色边界铁律**：①模块色只用于「产品模块」语义（卡片顶边、节点、进度条），
> **不得**用于导航项配色（避免「页面=模块」的错觉）；②状态色只表达状态，不表达模块；
> ③文档重要性 / family 用各自独立的 `data-importance` / family token，不复用模块色硬编码 hex。

### 1.4 文档重要性 / family 色（文档库专用）

- 重要性：`必读→red · 必要→blue · 系统级→teal #07849a · 参考→gray`
- family：`rules→red · skill→purple · workflow→amber · system→blue · reference→gray`

---

## 2. 导航栏规则（布局 / 颜色 / 排序 / 拖拽 / 分组）

| 维度 | 规则 |
|---|---|
| **唯一来源** | 导航项**只**由 `nav.js` 的 `DEFAULT_NAV_ITEMS` 定义。`index.html` 内的静态 `<a>` 是运行期被 `renderPrimaryNav()` 覆盖的死标记——**应删除**，避免双源漂移 |
| **布局** | 左侧固定 248px 竖向 `.rail`（sticky，glass 背景）；`≤860px` 折叠为顶部横向可滚动 nav（不是消失） |
| **分组** | 11 项**必须分 5 组**（见 §3），组间用分隔标签；同组内相关页相邻 |
| **颜色** | 导航项**中性**为基；**激活态**用 accent（`--theme-primary`）；可选用组级左边框微色调。**禁止**给导航项套用模块色板 |
| **排序** | 默认顺序 = `DEFAULT_NAV_ITEMS` 序；用户可拖拽改序并持久化到 `localStorage: xai-dev-dashboard.navOrder.v1`；提供 ↺ 重置 |
| **拖拽** | 指针拖拽（4px 阈值）+ 键盘（↑↓/←→）重排；`sanitizeNavOrder` 去重并把缺失页补到末尾 |
| **路由** | hash 路由：`data-page` === `data-page-section` === `location.hash`；未知 hash 静默回退 `overview`（建议加一次 console 提示） |
| **新增页注册** | 改 `DEFAULT_NAV_ITEMS` + 加 `<section data-page-section>` + 在 `main.js` 注册渲染函数 + 归入某一组 |

---

## 3. 页面登记表（11 页 / 5 组）

| 组 | 页面 (id) | Owner 数据域 | 渲染模块 | 推荐卡片数 |
|---|---|---|---|---|
| **总览组** | 总览 `overview` | 看板同步（原生）+ 全员镜像 | `overview.js` | 7（富展示，保留现状） |
| **进度组** | 任务进度 `tasks` | dev_log 任务 | `tasks.js` | 3 |
| | 开发数据 `dev-data` | Git 活动/趋势 | `dev-data.js` | 3 |
| **产品组** | 产品结构图 `product-flow` | 模块注册表/结构/明细 | `product-flow.js` | 4 |
| | 分支管理 `branches` | 分支策略/闸门 | `branches.js` | 2 |
| **交付质量组** | 部署 `deployment` | 部署状态/记录 | `deployment.js` | 5 |
| | 测试结果 `testing` | 测试结果/记录 | `testing.js` | 4 |
| | 发布记录 `release-log` | 发布历史 | `release-log.js` | 3 |
| **知识操作组** | 文档库 `docs` | 文档浏览 | `docs-library.js` | 5 |
| | Skill 和 Agent `skill-agent` | Skill/Agent 注册表 | `skill-agent.js` | 3 |
| | 使用和操作 `usage-ops` | 命令/进程控制 | `usage-ops.js`+静态 HTML | 4 |

> `ops-panels.js` 杂物箱已拆除；当前 11 个页面均有独立渲染模块或明确的静态 HTML owner。

> **没有独立的 Workflow Tab（刻意）**：本项目用「分布式」方式承接 workflow 管理——
> 每模块的 workflow 步骤 + 常用 prompt 在**产品结构图**的明细面板；workflow 类 skill/agent 在
> **Skill 和 Agent**（管理分组「开发/系统/同步」）；命令在**使用和操作**。`TEMPLATE.md §15`
> 把「Workflow 管理」定义为**结构**（可独立成 Tab，也可分布），本项目选分布式，不新增 Tab。
> 若将来 workflow 入口增多到这三页承接不下，再考虑新增独立 Workflow Tab。

---

## 4. 逐页边界定义

> 每张卡片用统一格式：**职责 / 展示 / 不展示 / 数据源 / 色彩 / 交互**。
> 「不展示」是边界的关键——它告诉你哪些内容**该去别处**。

### 4.1 总览 `overview`（富聚合页 · ~7 卡，保留现状）

**定位**：每日**富聚合**驾驶舱——一屏回答「现在做什么 / 在哪条线 / 用哪个入口 / 做到什么状态」，
**定位是多展示，不是薄索引**。
**原则**：总览可富展示任意 Owner 内容（flow + 模块卡 + drawer 都保留）；唯一约束是**实现层复用**
Owner 的渲染器/数据/状态词汇，不 fork 第二套。**富展示不算重复**（operator 决策 2026-06-03）。

| 卡片 | 职责 / 展示 / 不展示 / 数据源 / 色彩 / 交互 |
|---|---|
| **A. 快照头 + 新鲜度**（原生） | 职责：交代数据时效。展示：`generated_at`、branch、新鲜度 badge、未提交数。不展示：任何业务明细。数据源：`dashboardState.generated_at/git`。色彩：新鲜度→green/blue/yellow。交互：无 |
| **B. 当前主线/焦点**（原生） | 职责：当前优先级线。展示：编号 focus 行（label+value）。不展示：模块卡、任务列表。数据源：`status_rows`/`overviewRows`。交互：无 |
| **C. KPI 信号格**（原生镜像聚合） | 职责：头部数字。展示：web↔dev 分叉、roadmap 行数、skill 数、快照状态（各 ≤1 tile）。不展示：趋势图（去开发数据）、分支明细（去分支管理）。数据源：`signals`/`kpis`，引用 `git.divergence`/`roadmap_manifests`/`skills.length`。交互：无（可选点 tile 跳 Owner） |
| **D. 看板同步状态**（原生 · Owner=总览） | 职责：暴露 `xai-dev-dashboard-sync` 固化的同步态。展示：上次更新、快照 commit、未提交分桶、同步 skill 状态、最近发布、来源 chips。数据源：`sync_status`。色彩：skill 状态→green/yellow/red。交互：无 |
| **E. 模块富展示**（Mirror→产品结构图） | 职责：模块全景（总览富展示，**保留 flow board + 模块 grid**）。展示：迷你 flow 图 + 模块卡（进度/状态/feature 计数）。数据源：**复用** `overview_modules`/`product_lines`（不 fork 数据）。色彩：模块色。交互：点节点/卡→打开总览紧凑 drawer，drawer「定位结构图」→产品结构图并 `setProduct` 定位 |
| **F. 常用 Skill 条**（Mirror→Skill 和 Agent） | 职责：高频入口快捷。展示：curated 高频 skill 卡（名+中文 label）。不展示：完整注册表、字段网格。数据源：curated 列表 ∩ `skills`。交互：点卡→Skill 页；「复制」拷名 |

> 实现要点（**不删展示**）：总览的 flow board + module grid + drawer + 部署/测试镜像**全部保留**
> （这是总览富展示的价值）。实现层约束：①总览 drawer 是紧凑 Mirror，必须只读 `product_lines`
> / `overview_modules` 和共享状态词汇，不得成为第二个 Owner 明细；②状态词汇由 `status-meta.js`
> 单源；③部署/测试镜像复用 `deploymentSummary()`/`testingSummary()`。**展示不动，只去重复实现**。

### 4.2 任务进度 `tasks`（3 卡）

**定位**：所有 `packages/*/docs/dev_log.md` Status Panel 的只读聚合提醒。

| 卡片 | 边界 |
|---|---|
| **A. 任务计数** | 展示：各状态 chip + `source_count dev_log`。不展示：git 数据、发布。数据源：`task_progress.counts`。交互：无 |
| **B. 进行中任务列表** | 展示：状态 badge + feature + package + updated + 「打开 dev_log→」。不展示：已归档（折叠到 C）。数据源：`task_progress.items`。交互：行→`openDocInLibrary`（跳文档库） |
| **C. 已发布/已归档** | 展示：shipped/archived 折叠列表。数据源：`task_progress.shipped`。交互：展开 |

### 4.3 开发数据 `dev-data`（3 卡）

**定位**：纯 git 读数 + 趋势。**不**含任务/分支策略（各有 Owner）。

| 卡片 | 边界 |
|---|---|
| **A. 活动计数卡** | 展示：今日/7日 commit、今日增删行、未提交文件、文档:代码比、skill 变更（每卡附其 git 命令）。数据源：`development_data`。交互：无 |
| **B. 时间维度趋势** | 展示：今日/7天/周/月 tab + 2 个柱状图（commit 对比 / 活跃日）。不展示：单纯数字卡冒充趋势。数据源：`development_data.*_trend/*_stats`。交互：tab 切换并持久化 `localStorage: …devDataView.v1` |
| **C. 分支最近提交** | 展示：每分支 name/subject/commit·date。数据源：`development_data.branch_recent_commits`。交互：无 |

### 4.4 分支管理 `branches`（2 卡 + 原则 aside）

**定位**：分支拓扑与闸门（D3/merge/release）。核心立场：**branch ≠ 产品线，分叉正常**。

| 卡片 | 边界 |
|---|---|
| **A. 闸门 + 分叉状态** | 展示：当前 gate 状态、gate 时间线、web/dev ahead、共享 base、最近 release tag、drift 判定。数据源：`branch_policy`。交互：无 |
| **B. 长期分支表** | 展示：每条长期分支 目标/允许/禁止/上游/下游/drift。数据源：主源为 `branch_policy.long_lived_branches`；`state.js` 仅保留 stale/generated-missing 的 last-resort fallback。交互：无 |

### 4.5 产品结构图 `product-flow`（5 卡 · 模块 Owner）

**定位**：**模块导航的唯一 Owner**——结构、模块卡、模块明细的源头。

| 卡片 | 边界 |
|---|---|
| **A. 结构大图** | 职责：全模块 SVG 节点图 + 连边。展示：节点（order/title/subtitle）+ 边（main/soft/control 色调）。数据源：`products`+`product_links`。交互：点节点→`setProduct` |
| **B. 分支流程** | 展示：编号 branch 工作流步骤（title/branch/desc）。数据源：`branch_workflow`。交互：选步→写明细 |
| **C. 跨模块同步编排** | 职责：ADR-0014 sync workflow 的只读编排 Owner。展示：trigger phrase、actions（复用/新建、并行/串行、skill、depends_on）、执行波次、相关文档。数据源：`sync_orchestration`（由 `docs/workflow/project/sync-registry.json` 生成）。色彩：workflow tag token；必须由 `styles.css` 管理，不得 JS 内联样式。交互：相关文档→文档库 |
| **D. 模块轨道（6 模块卡，3 区）** | 职责：模块卡 Owner。展示：3 区（主产品链/项目系统区/Control Plane），每模块卡 order/badge/title/状态/branch/依赖/next。数据源：`products` 按 `region` 分组。色彩：模块色顶边。交互：点卡→`setProduct` |
| **E. 产品明细面板** | 职责：模块深挖 Owner。展示：目标/Feature 列表(按 6 状态)/状态网格/部署块/测试块/任务归属信号/推荐 skill/常用 prompt/workflow/transitions/impacts/相关文档。数据源：选中 `products[key]` 全字段。交互：开 target、开 doc、复制 prompt、折叠 navBlock、跨模块 data-to/data-module |
| **F. 未来平台规划层**（planning-only） | 职责：展示 iPhone/iPad/Apple Watch/Android/浏览器扩展的长期 surface 摘要。展示：role、phase、priority、not-for。数据源：`future_surfaces`。不展示：active branch、feature-build 状态、测试/发布状态。交互：跳 `docs/planning/LONG_TERM_PRODUCT_ROADMAP.md` |

> Desktop Plugin 状态卡属于 D 的 `plugin` 模块卡，数据只从 Product Module Registry
> (`docs/workflow/project/dashboard-state.json.product_lines[key=plugin]`) 读取。它必须明确标出
> `Paused until G1`、`入口设计已决`、`实现未开工`，并说明 Plugin Center 入口模型是文档 / contract
> 决策，不代表插件功能已解冻。禁止在总览或 HTML 中另写一张静态 Desktop Plugin 卡。

> 总览的模块 drawer 是紧凑 Mirror。它可以与 D 有不同密度，但不得拥有第二套数据源、状态词汇或
> Owner-only 字段解释；真正定位 / 完整明细仍回到 D。

### 4.6 部署 `deployment`（5 卡 · 部署 Owner）

**定位**：「在哪运行、版本多少、记录如何」。与「怎么部署（命令）」分离——后者在使用和操作。

| 卡片 | 边界 |
|---|---|
| **A. 部署总览格** | 展示：整体进度、最近部署时间、线上版本、模块状态(deployed/total)、异常数。数据源：`deploymentSummary()`。交互：无 |
| **B. 流程看板** | 展示：targets/steps/涉及文件/上线前 Gate。数据源：`deployment.flow`。交互：静态 |
| **C. 模块部署卡** | 展示：状态/进度条/环境/最近部署/版本/平台/next/branch + **测试徽标(Shared-Widget)** + ≤2 mini-issue。数据源：`deployment.modules[]`。交互：「产品详情」→产品结构图 |
| **D. 部署记录** | 展示：日期/模块/摘要/env·platform·version + 测试徽标 + commit + 状态。数据源：`deployment.records`。交互：无 |
| **E. 环境与问题** | 展示：环境列表 + 问题列表（合为一卡，消除与 C fact-grid 的自重复）。数据源：`summary.modules`。交互：无 |

### 4.7 测试结果 `testing`（4 卡 · 测试 Owner + test-badge 挂件 Owner）

**定位**：「有什么证据」。`renderTestingBadge` 等是**它对外的唯一共享挂件**，部署/发布只能嵌徽标，不得自建测试卡。

| 卡片 | 边界 |
|---|---|
| **A. 测试总览格** | 展示：健康度(pass/total)、最近测试、通过模块、失败项、Pipeline 状态(configured/local，**不冒充 CI 绿**)。数据源：`testingSummary()`。交互：无 |
| **B. 模块测试卡** | 展示：结论/状态/最近测试/失败/Pipeline/耗时/category pills/report_path。数据源：`testing.modules[]`。交互：「模块详情」→产品结构图 |
| **C. 测试记录** | 展示：日期/标题/结论/来源/相关模块/失败/report。数据源：`testing.records`。交互：无 |
| **D. Pipeline + 报告入口** | 展示：pipeline(name/path/status) + 报告(label/path/exists)（合一 aside）。数据源：`summary.pipelines/reports`。交互：无 |

### 4.8 使用和操作 `usage-ops`（4 区 · 命令/进程 Owner）

**定位**：操作手册 + 唯一的「活」进程控制。大部分是静态命令卡，仅 Card 01 是 live。

| 卡片/区 | 边界 |
|---|---|
| **A. 快速入口 hero** | 展示：4 个快捷 tile（Web 启动/Web 地址/看板/状态检查）。数据源：静态。交互：无 |
| **B. Web 运行控制（live）** | 职责：唯一 live 卡。展示：状态 badge/端口/PID/来源/入口/最近日志 + 命令面板。数据源：`/api/ops/status|logs`（serve）。交互：start/open/stop/refresh/copy-log |
| **C. 命令卡组** | 展示：打开页面/更新代码/构建与部署/日志状态/停止+FAQ（分子标题归组）。数据源：静态 HTML。交互：复制。**「构建与部署」需与「部署」页交叉链接**（命令↔状态） |
| **D. 快捷命令** | 展示：8 个短命令 tile + 复制全部。交互：复制 |

> 命令卡不得硬编码机器绝对路径；当前静态命令使用 `cd "$(git rev-parse --show-toplevel)"`
> 或固定 localhost URL。生成态中的 `repo_root` 允许是机器绝对路径，因为 `state.generated.js`
> 是 git-ignored 本地快照。

### 4.9 文档库 `docs`（5 面板 · 文档 Owner）

**定位**：类文件管理器的本地文档浏览。serve 模式解锁全部能力，`file://`/static 降级提示。

| 面板 | 边界 |
|---|---|
| **A. 头部工具条** | mode pill + 搜索 + 刷新。serve-only 搜索。 |
| **B. 推荐文档分组** | `docHub.groups`：title/summary/重要性/category + ≤4 入口（带复制）。交互：开 doc / 复制路径 |
| **C. 文件夹 3 栏** | roots 列表 + 一级目录树 + 当前文件夹浏览（图标/分类/重要性/kind，可搜索过滤）。数据源：`/api/tree`+`docHub`。交互：导航/上级 |
| **D. Inspector** | 元信息网格（类型/重要性/分类/路径/绝对路径/更新/大小/标签/说明）+ outline。交互：全屏/复制路径/Finder/刷新 |
| **E. 预览 + 全屏** | 内联 markdown 渲染（static）+ 全屏阅读 overlay（serve）。 |

> 文档分类是**计算出的**（family×重要性两轴），不是真实文件夹。曾存在的
> `renderDocCollections`/`renderBranchDocs`/`renderRegistry` 孤儿渲染器已删除。

### 4.10 Skill 和 Agent `skill-agent`（3 卡 · 注册表 Owner）

**定位**：可执行知识库，非名字列表。

| 卡片 | 边界 |
|---|---|
| **A. 注册表计数** | 展示：Skill(project/codex/portable)、Agent(families)、完整条目、源文件完整度、待处理缺口、已自动补齐、新增/修改。数据源：`skill_agent_registry.summary`。交互：无 |
| **B. 分类索引** | 展示：每分类「N items·M complete」跳转按钮。交互：滚动到该分类 |
| **C. 目录板（分类区 × 条目卡）** | 展示：分类区（title/summary/workflow/状态）；条目卡（name/描述/类型 badge/完整 badge/复制名/缺口行/10 字段网格/分类建议/doc 按钮）。数据源：`skill_agent_registry.entries`。交互：复制名、doc→文档库 |

> **Skill 分组规范（回应「常用/系统/同步/开发」）**：目录板应同时支持两轴——
> ①**管理分组（主，回应用户心智）**：`常用`（curated 高频入口，与总览常用条同源）·`系统`（治理/基建：ship、release-log、dashboard-sync）·`同步`（D3/D4/fanout：web-to-desktop-sync、account-sync-scope、sync-fanout）·`开发`（feature/bugfix/build/plan）；
> ②**功能分类（次）**：governance/automation/quality/authoring/feature/bugfix/reference。
> 「常用」curated 列表与总览镜像条**必须同源**（一处定义），避免漂移。

### 4.11 发布记录 `release-log`（3 卡 · 发布 Owner）

**定位**：时间序发布历史。测试只以 Shared-Widget 徽标出现。

| 卡片 | 边界 |
|---|---|
| **A. 整体发布卡** | 展示：title/date/version + 摘要 + 新增/优化/修复/影响 4 列 + 模块 badge。数据源：`overall_releases`。交互：无 |
| **B. 模块发布卡** | 展示：每模块 latest/count + 最近条目 + **测试 strip(挂件)** + 3 条近期。数据源：`release_modules`。交互：无 |
| **C. 详细发布行** | 展示：date/title/摘要 + version + 测试徽标 + 影响 + 验证/后续。数据源：`release_rows/entries`。交互：serve 模式 `release-log open` 链接 raw 文件 |

---

## 5. 新增内容归类规则（决策表）

> 来了一条新内容，先查这张表确定归属页/卡，再动手。**禁止「随手放总览」**。

| 新内容类型 | 归属 | 卡片 | 备注 |
|---|---|---|---|
| 新的「现在做什么」头部数字 | 总览 | C KPI 信号 | 仅头部级；明细去对应 Owner |
| 新任务 / dev_log 状态 | 任务进度 | B 列表 | 自动来自 `task_progress` |
| 新 git/活动/趋势指标 | 开发数据 | A/B | 自动来自 `development_data` |
| 新分支规则 / 闸门 | 分支管理 | A/B | 来自 `branch_policy`（勿硬编码） |
| **新产品模块属性**（目标/依赖/feature/skill/prompt…） | 产品结构图 | D 明细 | **写进 Product Module Registry**，所有模块面读它 |
| 新模块（第 7 个产品线） | 产品结构图 | C 轨道 | 注册表加 key + 配色 token；勿建第二张模块表 |
| 新部署事实 / 记录 | 部署 | C/D | 来自 `deployment` |
| 新测试事实 / 记录 / pipeline | 测试结果 | B/C/D | 来自 `testing`；别处只能嵌徽标 |
| 新发布条目 | 发布记录 | A/B/C | 经 `xai-release-log` 写 `release-log.md` |
| 新文档 | 文档库 | 自动(tree) | 重要文档可加进 `docHub.groups` 推荐 |
| 新 skill / agent | Skill 和 Agent | C 目录板 | 自动来自注册表扫描；高频再加进「常用」curated |
| 新命令 / how-to / FAQ | 使用和操作 | C 命令组 | 与状态类内容分离 |
| **想在总览看到别页的汇总** | 总览 | Mirror 卡 | **摘要+跳转**，复用 Owner summary，禁止复刻明细 |
| 看板自身的同步/新鲜度 | 总览 | D 同步状态 | 总览原生 |

---

## 6. 防重复 / 防边界模糊的硬规则

1. **Owner 唯一**：每个数据域只有一个页面渲染明细；明细渲染函数只存在一份。
2. **Mirror 三件套**：摘要卡必须 ①复用 Owner 的 summary 函数 ②带跳转 ③不复刻明细。
3. **共享挂件单源**：跨页状态徽标是单一共享函数（test-badge 由测试页 Owner）。
4. **一个注册表治一域**：模块用 Product Module Registry，测试用 Testing Registry；新面读注册表，**禁止第二张硬编码模块表**（机器契约 `dev-dashboard.md:62-67`）。
5. **状态词汇唯一**：全看板共用一套 `statusMeta` 与 7 色，禁止每文件重定义 `FEATURE_STATUS`/状态 map。
6. **颜色语义不串**：模块色只表模块，状态色只表状态，导航不用模块色。
7. **总览可富展示 Mirror，但不新增第二套 Owner 明细实现**。
8. **命令与状态分离**：「怎么做」（usage-ops）与「做到哪」（deployment/testing/release）分页，靠交叉链接连接，不互相内嵌明细。
9. **一页一文件**：渲染模块与页面一一对应（拆散 `ops-panels.js`）。
10. **删孤儿**：无 DOM/无 consumer 的渲染器与 state key 一经发现即删（见 §7）。

---

## 7. 当前已知的边界违规 / 清理清单（落地时修）

> 摸底发现的问题分两类。**✅ 已修复**部分由 P1–P4（branch `codex/web/dashboard-boundaries`）
> 与 T4 cleanup（branch `codex/web/dashboard-cleanup`）落地，本地提交，未 push/merge；P1–P4 运行期已
> serve+390px+暗色验证通过，T4 经 node `--check`、generator 重跑、headless jsdom concat-eval 渲染验证
> （`setProduct` / `openModuleDrawer` × 6 模块 + 11 页全渲染、0 error）。**⏳ 仍待办**为延后或未列入本轮的项。

**✅ 已修复（P1–P4）**
- `FEATURE_STATUS` 两份 → 共享 `js/status-meta.js`（P1 `54e8523`）。
- 「常用 Skill」单源 + 目录板加 `常用/系统/同步/开发` 管理分组（P2.3 `da1cb50`，`js/skill-groups.js`）。
- 导航双源：删 `index.html` 死锚 + `DEFAULT_NAV_ITEMS` 加 group 元数据 + 5 组分隔标签 + 未知 hash `console.warn`（P2.1 `19b511f`）。
- `ops-panels.js` 杂物箱 → 拆 `tasks/dev-data/branches/release-log.js`，一页一文件（P2.2 `87f5c2c`）。
- 分支管理页数据驱动：`branch_policy.long_lived_branches` 为主源，硬编码兜底标注 last-resort（P3.3 `b94baab`）。
- 孤儿渲染器（`renderDocCollections/renderBranchDocs/renderRegistry/branchDocSeeds`）删除；孤儿 state key 标注 machine-only（P3.2 `7ea6087`）。
- usage-ops 硬编码机器绝对路径 → `cd "$(git rev-parse --show-toplevel)"`（P3.1 `98b18bf`）。
- `--radius` token 启用（123 处 `8px`→`var(--radius)`）+ `background:#fff`→`var(--surface)`（30 处，修暗色 chrome bug）（P3.4 `0c5d586`）。
- `verify-static.mjs` script-order 闸门与新布局对齐（P4 `9cefd1b`）。

**✅ 已修复（T4 cleanup · `codex/web/dashboard-cleanup`）**
- 孤儿 const `docCollections` / `currentDocCollection`（P3.2 删 `renderDocCollections` 后无消费者）删除（T4.1 `dbc974d`）。
- `SKILL_AGENT_CATEGORIES` 双份单源化：generator (`skillAgentCategories`) 定为真源（emit `skill_agent_registry.categories`，client 始终优先），`state.js` 那份标注为 stale-fallback 冻结镜像，双向 sync 注释（T4.2 `2715cfe`）。
- roadmap 白名单硬编码 → `readdirSync(*.md)` + `parseRoadmapManifest` 表头过滤（漏算修复：15→16，新捕获 `account-cloud-sync-foundation.md`，非 manifest 文档自动跳过）（T4.3 `e7b1d5b`）。
- 部署 env 侧栏自重复 → §4.6-E：侧栏只展示非 nominal（非 `deployed`）或有 issue/异常的模块（复用 `deploymentSummary()`，模块 fact-grid 仍为 env Owner）（T4.4 `f999bdf`）。
- `theme-bootstrap.js` ↔ `theme.js` FOUC 守卫 key/校验刻意重复：双向加 sync-invariant 注释（不抽共享）（T4.6 `4dfd0e3`）。
- doc 重要性/family 7 处字面 hex 折进既有 token（`--module-*-bg`/`--surface-code-ink`，逐一证明 light 值 byte-equal，dark 本就用 token 不变）（deferred-items 轮 `5c446c9`；已 serve+inspect 验证 必读 pill = `rgb(255,239,237)`=`#ffefed`）。

**⏳ 仍待办（延后 / 未列入本轮）**
- **P1b 仍延后**：总览 drawer (`openModuleDrawer`) 与 product-flow detail (`setProduct`) 是**刻意不同的两个视图**（Owner 完整明细 vs 紧凑 Mirror），非同一 body 两挂载点——数据形状（registry vs overview-module）、CSS（`detail-*` vs `drawer-*`）、helper 集均不重叠；唯一共享项（`FEATURE_STATUS` 词汇）已在 P1 收敛。强行单一 renderer 要么回归紧凑 drawer，要么变成包两个 body 的 `variant` 假合并并需重写 `setProduct` 硬编码 `#productDetail` 监听（监听器重连风险，无浏览器不可验）。两侧已加交叉引用注释固化此判定（T4.5 `021e9af`）；真正合并需带浏览器交互验证。
- **box-shadow 归一**：11 处 `rgba(49,87,149,α)` 阴影**无一**与 `--shadow`(.12)/`--shadow-soft`(.10) 完全相等（alpha 含 .05/.07/.08/.1/.13/.14）；折叠=改外观，需带眼睛归一——**未做**。
- **`[data-tone]` 合并**：5+ 块是**作用域选择器**（`.xxx-card[data-tone=]`，特异性 0,2,0），非通用 `[data-tone=]`(0,1,0)；分析证明降为通用块渲染等价（无元素同时带 data-product+data-tone），但改特异性——**留待 eyes-on 决定**。
- 总览 5 section→单容器：需先给 `.overview-module-grid` 裸规则加 `display:grid`（否则脱离 `page-section.is-active` 后模块网格塌成 block）；约定级价值——**未做**。
- 无懒渲染：`setProduct` 被 5+ 跨页站点调用（deployment/testing/overview 跳转）依赖 product-flow 已 eager 渲染；改懒渲染需重排全部跨页跳转，回归风险高、价值低（eager 已验证）——**未做**。
- 测试状态跨 3 页：**保留为 Shared-Widget 徽标**（本就正确，非待办）；仅禁止扩成第二张测试明细卡。

---

_本规范随看板演进更新；任何卡片/页面增删须同步本文件与 `TEMPLATE.md`（`xai-dev-dashboard-sync` 核对）。_
