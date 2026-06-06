# XAI Release Log

> Chinese-first release and project-system change log for solo development.
> Keep newest entries first. Use `.teams/skills/xai-release-log/SKILL.md` when
> appending entries.

## 2026-06-05

### 个人开发看板启动 Web 服务自动化

- Product line: project-system / dev-dashboard
- Branch / commit: `dev` / local working tree
- User-visible change: 打开个人开发看板时会自动请求启动 Web mock 服务；看板内「使用和操作」页可直接打开 Web 首页和 Web App(`/app/dashboard`)，不再需要先手动进终端启动 Web 再手动输入网址。
- Developer/system delta: `open.mjs` 默认调用 dashboard ops API 启动 `web:start-mock`，保留 `DASHBOARD_START_WEB=0` / `--no-start-web` 关闭开关；`serve.mjs` 会补齐 nvm/Homebrew/local PATH 并解析 `pnpm` / `corepack pnpm`，`/api/ops/open` 支持 route；`usage-ops.js` 支持按 route 打开目标；Overview Web 入口从旧 `5173` 改到 ops 目标端口 `3000/app/dashboard`。
- Verification: `node --check scripts/dashboard/open.mjs` passed；`node --check scripts/dashboard/serve.mjs` passed；`node --check scripts/dashboard/generate-state.mjs` passed；`node --check docs/prototypes/dev-dashboard/js/usage-ops.js` passed；`node --check docs/prototypes/dev-dashboard/js/overview.js` passed；`zsh -n docs/prototypes/dev-dashboard/open-dashboard.command` passed；`git diff --check` passed；`node scripts/dashboard/open.mjs` no-browser smoke passed and detected the existing Web service as `already-running`；`docs/prototypes/dev-dashboard/open-dashboard.command` no-browser smoke passed；narrow-PATH `.command` smoke passed；generated state confirmed Web App target `http://localhost:3000/app/dashboard`。
- Risk / follow-up: Web 服务启动依赖本机存在 `pnpm` 或 `corepack pnpm`；如果 3000 已由外部服务占用，看板会跳过重复启动并把该服务标记为 external。

### 个人开发看板一键启动脚本

- Product line: project-system / dev-dashboard
- Branch / commit: `codex/web/dev-dashboard-one-click-launcher` / local working tree
- User-visible change: 新增可双击的 `docs/prototypes/dev-dashboard/open-dashboard.command` 和 `node scripts/dashboard/open.mjs`，自动刷新看板、启动本地服务并打开浏览器；默认 4177 被占用时沿用 server 的自动顺延端口并打开实际 URL。
- Developer/system delta: 新增 `scripts/dashboard/open.mjs` 作为启动器，复用 `scripts/dashboard/serve.mjs` 的生成与端口 fallback；新增 `pnpm dashboard:open` 别名并更新 Usage 页面说明。
- Verification: `node --check scripts/dashboard/open.mjs` passed；`node scripts/dashboard/open.mjs --no-browser --exit-after-open` passed；4177 occupied smoke passed and selected `http://127.0.0.1:4178/#overview`；`DASHBOARD_NO_BROWSER=1 DASHBOARD_EXIT_AFTER_OPEN=1 docs/prototypes/dev-dashboard/open-dashboard.command` passed；`node --check scripts/dashboard/generate-state.mjs` passed。
- Risk / follow-up: 双击 `.command` 会打开 Terminal 窗口承载本地 server；关闭该窗口即停止看板服务。

## 2026-05-31

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
