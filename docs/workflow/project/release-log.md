# XAI Release Log

> Chinese-first release and project-system change log for solo development.
> Keep newest entries first. Use `.teams/skills/xai-release-log/SKILL.md` when
> appending entries.

## 2026-05-30

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
