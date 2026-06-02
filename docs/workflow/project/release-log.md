# XAI Release Log

> Chinese-first release and project-system change log for solo development.
> Keep newest entries first. Use `.teams/skills/xai-release-log/SKILL.md` when
> appending entries.

## 2026-06-02

### 个人开发看板开发数据周/月趋势

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: 开发数据页新增时间维度切换（今日 / 最近 7 天 / 按周 / 按月），并用图表展示周 commit 数对比、月 commit 数对比、周开发活跃度趋势、月开发活跃度趋势；不再只停留在今日和 7 日数字。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 新增 `weekly_stats`（最近 8 周）和 `monthly_stats`（最近 6 个月），每个周期记录 commit 数、活跃天数、活跃率和日期范围；`ops-panels.js` 渲染维度 tabs、摘要卡和柱状图；同步更新 dev-dashboard 模板与设计说明。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check docs/prototypes/dev-dashboard/js/ops-panels.js` passed; `git diff --check` passed; `pnpm dashboard` passed; `pnpm dashboard:serve` served `http://127.0.0.1:4177/#dev-data`; Browser smoke confirmed desktop tabs + weekly/monthly/7-day/today chart switching and 390px weekly/monthly responsive views with no horizontal overflow.
- Risk / follow-up: `state.generated.js` 仍是本机快照；提交后再次运行 `pnpm dashboard` 可把 dirty count 降到提交后的真实状态。

### Web 六大功能反向补建 canonical PRD + 历史 SHIPPED 补登

- Product line: web
- Branch / commit: `web` / `b569461`（tasks/board/calendar PRD 已提交）+ local working tree（pomodoro/dashboard/settings PRD + calendar 收口 + 本条目未提交）
- User-visible change: 无（纯文档治理；用户在产品上看不到变化）。本条为反向补账——下列功能均为**历史已 SHIPPED**，此前缺 canonical PRD 与 release-log 记录。
- Developer/system delta: 用 `xai-feature-dossier-sync` 反向为 6 个已 SHIPPED 的 web 功能建立 `docs/product/<feature>/prd.md`（仓库首批功能级 canonical PRD）：清单 tasks、看板 board（3 包合 1）、日历 calendar、番茄钟 pomodoro、仪表盘 dashboard（grid+widgets 合 1）、设置 settings（主壳 + appearance/features/rest 3 子 PRD）。各功能历史 ship 日期/commit 见对应 PRD §7（tasks/board/calendar/pomodoro 于 2026-05-23~24；dashboard 系列 2026-05-23~29；settings W4 系列 2026-05-23~28）。同时收口 calendar 一处 traceability 异常：工具栏「+」按钮 bugfix（dev_log block3，停在 `FIX_READY`）查证为被 `xai-web-calendar-event-create`（Option B 真实 CRUD，SHIPPED `bc573b1`）取代，已标 `superseded` 并回写 dev_log + PRD。
- Verification: 来源核验（每条需求映射 dev_log SHIPPED block / commit SHA / discovery review，无来源项标 `待确认`）；未跑测试（纯文档变更）；calendar/dashboard/settings 多处 cross-vendor manual smoke 在历史 ship 时即标 DEFERRED（ADR-0008 §S3 24h carve-out），本轮如实保留为未闭合项，未声称已完成。
- Risk / follow-up: release-log 此前缺这 6 个 web 功能的 ship 历史（本条补账）；dashboard 组件移除 AC-RM-1..7 仅存在于 dev_log 未进 test.md；多处 cross-vendor smoke 矩阵未闭合（pre-cloudflare-ship 前需补）；settings baseline ship commit SHA、AI pane 是否在 ai-chat 单独追溯等列为各 PRD §9 `待确认`；pomodoro/dashboard/settings PRD + calendar 收口本条目尚未提交。

### 跨模块同步编排 v1：sync-registry + D4 / 扇出 skill

- Product line: project-system / sync
- Branch / commit: `web` / `7d26e51`
- User-visible change: 完成一个核心模块后,可用一句话「Web 版本功能已完成，执行后续同步 workflow」触发跨模块同步扇出;系统按语义规则判定该同步到哪些模块,并产出每条 lane 的 prompt / 回执,多窗口并行处理。
- Developer/system delta: 新增机读 `docs/workflow/project/sync-registry.json`(语义触发规则 + 4 类可复用动作 + 单写者文件归属 + 波次);新增 skill `xai-account-sync-scope-check`(ADR-0013 D4 范围 / 9 项完备性检查,receipt-only)与 `xai-sync-fanout-dispatch`(语义派发入口),单源置于 `.teams/skills` 并镜像到 `.claude` / `.codex`;把 `xai-release-log` 暴露给 Claude(补 `.claude/skills` symlink);新增 review 回执 `docs/reviews/clipboard-entitytype-drift/`、`docs/reviews/web-sync-2026-06-01/`(D3=W0 record-only / site=none / admin=forward-compat)。
- Verification: `node -e` 校验 sync-registry.json 为合法 JSON;两个新 skill 的 `.claude` / `.codex` symlink 解析到 SKILL.md;skill 列表确认已注册;D4 / 派发 skill 已在真实 delta 上 dry-run 跑通。
- Risk / follow-up: skill 为 receipt / plan-only,不实现同步、不解冻 paused 线、不写 entities.ts / 插件 types.ts;clipboard entityType 漂移(`clipboard.item` vs `clipboard.entry`)已开独立任务跟进。

### 治理基线对齐：ADR-0013 接受 + ADR-0014 同步编排 + ADR-0008 CSP 记账

- Product line: project-system / governance
- Branch / commit: `web` / `09d49e3`, `135183e`
- User-visible change: 分支与同步治理基线现在一致——ADR-0010 / ADR-0013 / ADR-0014 均为 Accepted;开发看板分支板的 `adr_status` 显示 Accepted。
- Developer/system delta: ADR-0013 翻为 Accepted(operator 确认,§S7 #2–#7 保留为 deferred follow-up);新增并接受 ADR-0014(跨模块同步编排:4 类动作 / 语义 registry / 单写者归属 / 冻结线护栏 / Codex 复核固化为标准一步);`branch-policy.json` `adr_status` Proposed→Accepted;`CLAUDE.md` §分支治理标题与 `PRODUCT_MODULE_MAP.md §维护` 同步;ADR-0008 补记 2026-06-01 web 批次的 `connect-src` 新 host(OpenAI / Groq / `*.ingest.sentry.io`),§S6 snippet 校正到与 `_headers` 一致并修正通配声明。
- Verification: `branch-policy.json` 校验为合法 JSON;ADR-0013 自身状态无残留 Proposed;ADR-0008 三个新 host 命中 + 通配声明已校正。
- Risk / follow-up: ADR-0008 文档暂领先代码——实现该 CSP 的 `apps/web/public/_headers` + `csp.test.ts`(CSP6)仍在未提交的 web 批次里,提交那批后代码与文档对齐;创建 desktop-next / 触及 dev 仍为 operator 确认步骤。

### 文档库必读入口和绝对路径复制

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: 文档库的必读文档现在直接显示看板机器说明和看板可复用模板；推荐卡片提供复制按钮，文档详情和全屏阅读器复制的是本机绝对路径。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 输出 `repo_root` 并把两份看板治理文档提升到 must-read；`docs-library.js` 统一将仓库相对路径转换为绝对路径再复制；同步更新看板机器说明和模板文档的文档库规则。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check docs/prototypes/dev-dashboard/js/docs-library.js` passed; `git diff --check` passed; `pnpm dashboard` passed; dashboard API returned both target docs; Chrome headless DOM dump confirmed must-read entries, copy buttons, and absolute path rendering.
- Risk / follow-up: 无。

## 2026-06-01

### 看板同步 Skill 三层对齐

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: `xai-dev-dashboard-sync` 现在明确把 Overview 同步、机器说明文档对齐、可复用模板对齐作为一次运行里的三层检查；Claude Code 和 Codex 都有项目 skill 入口。
- Developer/system delta: 更新 `.teams/skills/xai-dev-dashboard-sync/SKILL.md` 的触发描述、同步范围、drift audit 和 sync receipt；新增 `.claude/skills/xai-dev-dashboard-sync` 镜像 symlink；同步更新 `CLAUDE.md`、`AGENTS.md`、`docs/workflow/project/dev-dashboard.md`、`docs/prototypes/dev-dashboard/TEMPLATE.md`、dashboard state 和 usage-guide。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `git diff --check` passed; Claude/Codex symlink discovery check passed; `pnpm dashboard` passed.
- Risk / follow-up: 无；Skill 仍只自动更新事实性契约/模板内容，不自动决定 roadmap、branch、priority、release gate 或 ship 状态。

## 2026-05-31

### 个人开发看板同步契约

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- Version: dev-dashboard v0.4 → v0.5
- Added: 新增 `xai-dev-dashboard-sync` 项目 Skill、机器可读的 `docs/workflow/project/dev-dashboard.md`、可复用的 `docs/prototypes/dev-dashboard/TEMPLATE.md`。
- Improved: Overview 新增看板同步状态区，展示上次更新时间、当前快照、未提交变更、同步 Skill 状态、最新 release-log entry 和关键来源文件更新时间。
- User-visible change: 打开个人开发看板总览即可判断看板是否刚刷新、当前工作区是否有未提交变更，以及应该用哪个同步入口刷新。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 输出 `sync_status`，文档库收录看板机器说明、模板和同步 Skill；`AGENTS.md`、`CLAUDE.md`、handbook 和 usage-guide 增加看板契约入口。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check` passed for updated dashboard JS files; `pnpm dashboard` passed; `pnpm dashboard:serve` served the dashboard locally; headless Chrome DOM/screenshot smoke at 1440px and 390px confirmed Overview renders Dashboard sync, last update time, dirty count, `xai-dev-dashboard-sync`, and latest release-log entry; staged refresh shows sync skill status as tracked.
- Risk / follow-up: `state.generated.js` 仍是本机生成快照，不作为跨机器事实源；提交后再次刷新会把 dirty count 降到剩余并行 Web 改动范围。

### 发布记录看板升级

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- Version: dev-dashboard v0.3 → v0.4
- Added: 发布记录页拆成「整体发布记录」「模块发布卡片」「详细发布记录」三个层级；模块覆盖 Web 分支、App / Mac 桌面版本、桌面插件、账号云同步、官网、管理者 / 开发者 Dashboard。
- Improved: 整体发布记录改成接近 GitHub Release 的摘要卡片，展示发布日期、版本标记、新增功能、优化内容、修复问题、影响范围和面向用户 / 开发者的说明；详细记录中的长验证信息改为两行摘要块，避免横向撑破页面。
- Fixed: 修复本地 dashboard server 下打开 `release-log.md` 可能落到 `/workflow/project/release-log.md` 并返回 not found 的链接路径问题。
- Impact: 个人开发看板、release-log 解析脚本、本地 dashboard server、`docs/workflow/project/release-log.md` 的结构化字段。
- Audience note: 开发者可以按模块快速判断变更影响；产品使用者可以先看整体版本摘要，不必阅读细节 commit。
- User-visible change: 发布记录从单一时间线升级为模块化发布看板，并保留整体版本更新摘要。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 输出结构化 release entries / modules / overall releases；看板页面按新数据渲染多色模块卡片；server 增加 raw markdown 打开路径。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check scripts/dashboard/serve.mjs` passed; `node scripts/dashboard/generate-state.mjs` passed; local server `GET /api/raw?path=docs/workflow/project/release-log.md` returned 200 `text/markdown`; Playwright screenshot smoke rendered overall release cards, module cards, and detailed release rows at `#release-log`; follow-up screenshots confirmed the release page no longer stretches horizontally and the product-flow right detail panel is compact.
- Risk / follow-up: 旧历史条目未必都有 Version / Added / Fixed 字段，生成器会降级使用 User-visible change 和 Developer/system delta。

### Admin Dashboard 系统接入路线图

- Product line: admin-dashboard / project-system
- Branch / commit: `web` / local working tree
- User-visible change: Admin Dashboard 原型新增系统接入计划，开发者看板的 Admin Control Plane 不再只是 `prototype only`，而是读取 6 行待办 roadmap。
- Developer/system delta: 新增 `docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md` 和 `docs/workflow/roadmap/xai-admin-dashboard-system-integration.md`；`scripts/dashboard/generate-state.mjs` 将 admin roadmap 纳入 allowlist、状态计数和相关文档。
- Verification: `node scripts/dashboard/generate-state.mjs` passed; generated snapshot shows Admin `6 rows · PENDING:6`; `node --check` passed for dashboard scripts; local dashboard API served the integration plan and 6 roadmap rows.
- Risk / follow-up: 仍是规划/接入入口，不是生产 Admin surface；下一步从 `xai-admin-dashboard-shell` 开始走 Workflow V2。

## 2026-05-30

### 看板 Web 产品状态生成修正

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 产品结构图中的 Web 恢复显示为 `P0 · active` / `Web 主线`，不再被 roadmap/dev_log 统计覆盖成 `needs attention`。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 保留产品线权威 `badge/status`，把任务统计只放在 `status_counts/status_summary`；同步修正 `branch-policy.json` 中残留的 P0 carve-out 旧文案。
- Verification: `node scripts/dashboard/generate-state.mjs` passed; Chrome/Playwright smoke confirmed product-flow Web card shows `P0 · active` / `Web 主线`, no longer shows `needs attention`, detail panel matches, and branch policy page no longer exposes P0 carve-out.
- Risk / follow-up: 旧 review/carve-out 历史文档仍可能保留旧规则表述，但不作为当前看板状态源。

### Web 主线规则修正

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 修正项目规则入口，明确 `web` 分支是 Web 产品主线；Web 新功能和 bugfix 走普通 workflow，不再要求 P0 carve-out。
- Developer/system delta: 更新 `CLAUDE.md`、`docs/PLUGIN_MAP.md`、ADR-0010、ADR-0013、developer handbook 和 dashboard snapshot 文案；保留历史 carve-out/review 作为当时政策下的审计记录。
- Verification: Text audit confirmed current authority docs no longer state Web is maintenance-only or require P0 carve-out for new Web work.
- Risk / follow-up: 旧 review/carve-out 文件仍包含历史表述；它们是过去执行证据，不作为当前规则入口。

### 看板产品结构图和 branch 工作流动画

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 产品结构图补回完整产品关系流程图，Web、Mac 桌面版 App、桌面插件 / Widget、账号云同步层、官方网页、Admin Dashboard 以节点和动态连线展示；点击节点会同步右侧详情和模块选中状态。
- Developer/system delta: 新增 `product_links` 和 `branch_workflow` 快照字段；产品页增加 file:// 可用的 SVG 动态连线、节点选中动画，以及从 brief / roadmap 到 release/desktop/* 的 branch 发布工作流。
- Verification: Chrome/Playwright smoke passed: product-flow page active, 6 map nodes, 7 animated edges, 6 branch workflow steps, 6 module cards, map click updates Admin detail and module selection, module click updates map selection, release branch step updates workflow meta, direct `#release-log` hides map nodes, new release row appears, and 390px mobile overflow check passed.
- Risk / follow-up: 仍是静态流程快照；后续可把 branch 工作流节点接到真实 git branch、roadmap manifest 和 release gate 状态。

### 看板操作化和自动跟踪 v0

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 总览页从说明型文案改成个人工作流控制台，补齐 Web、Mac 桌面版 App、桌面插件 / Widget、账号云同步层、官方网页、Admin Dashboard 六个独立模块。
- Developer/system delta: 新增 `docs/workflow/project/dashboard-state.json` 和 `scripts/dashboard/generate-state.mjs`，生成 `docs/prototypes/dev-dashboard/state.generated.js` 供 file:// 静态看板读取；自动事实和人工决策字段分开。
- Verification: Chrome/Playwright smoke passed: forbidden explanatory hero/topbar phrases absent, overview KPI renders, overview card opens product page, 6 module cards render, Admin detail opens, direct `#release-log` hides product cards, release row appears, and 390px mobile overflow check passed.
- Risk / follow-up: 自动跟踪 v0 仍是生成快照，不是后台实时服务；后续可以接入 roadmap manifest、dev_log 和 release gate。

### 看板移除内部说明头部

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 移除看板顶部的文件路径、中文优先说明、Gemini 风格说明和 P1/Web 状态标签，让页面只保留导航和当前分页内容。
- Developer/system delta: 删除 `topbar` / `crumb` / `toolbar` 结构及样式，避免把实现说明暴露在操作界面。
- Verification: Chrome/Playwright smoke passed: topbar removed, internal top text absent, `#release-log` page still works, product page switch still works, and 390px mobile overflow check passed.
- Risk / follow-up: 无。

### 看板分页导航

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 左侧导航从锚点长滚动改为分页切换；点击总览、产品结构图、手册和 skill、分支管理、发布 log 时只显示对应页面。
- Developer/system delta: 新增 `data-page` / `data-page-section` 路由、active nav 状态和 hash 同步，避免所有模块堆在一个超长页面里。
- Verification: Chrome/Playwright page-switch smoke passed: direct `#release-log` load, sidebar page switching, hidden inactive pages, docs reader visibility, product card click, and 390px mobile overflow check.
- Risk / follow-up: 仍是静态 HTML，看板内容刷新后续再接 roadmap / release log 自动数据源。

### 看板产品线模块跟踪

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 产品区从关系节点图调整为 5 条顺序模块 tracking card：Web、Mac 桌面版 App、桌面整理插件 / Widget、账号云同步层、官方网页。
- Developer/system delta: 每个模块独立展示状态、推荐 branch、依赖、下一步和跟踪字段；点击模块后右侧展示详细定位和关系。
- Verification: Chrome/Playwright static smoke passed: 5 module cards, official-site detail branch escaping, 4 detail metrics, desktop module overflow check, branch overflow check, and 390px mobile overflow check.
- Risk / follow-up: 模块状态仍是静态 snapshot；后续需要把 roadmap 或 release log 自动汇入模块状态。

### 个人开发看板 v0

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 新增中文优先的单人开发看板，包含产品结构流程图、文档分页阅读器、skill 说明、branch 管理说明和发布 log 面板。
- Developer/system delta: 看板从暗色工程面板改为蓝白浅色控制台；产品线、branch、Workflow V2、D3 gate、release log 进入同一个导航入口。
- Verification: Chrome/Playwright static smoke passed: product-node click animation, document pagination, release rows, skill rows, branch overflow check, and 390px mobile overflow check.
- Risk / follow-up: 看板仍是静态 prototype；真实 roadmap 状态后续需要自动或半自动刷新。

### 发布日志 skill

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 增加 `xai-release-log`，用于按日期记录功能增量、系统变更、验证结果和后续风险。
- Developer/system delta: 新增 `.teams/skills/xai-release-log/SKILL.md`，并把 `docs/workflow/project/release-log.md` 作为日志权威文件。
- Verification: `rg` docs audit confirmed handbook, dashboard, release log, and skill references.
- Risk / follow-up: 后续 ship 或系统治理变更需要把 release log 纳入收口检查。
