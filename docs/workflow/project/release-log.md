# XAI Release Log

> Chinese-first release and project-system change log for solo development.
> Keep newest entries first. Use `.teams/skills/xai-release-log/SKILL.md` when
> appending entries.

## 2026-05-30

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
