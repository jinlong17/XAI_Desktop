# Dev-Dashboard — 个人开发看板

本地、单人开发者的**项目驾驶舱**（cockpit）。一屏回答：现在做什么 / 在哪条线 / 用哪个入口 / 做到什么状态。
它**只读取与提醒**，不自动决定优先级、不合分支、不标发布就绪、不改 roadmap 状态。

> 复制本目录到新项目即可重建一套看板——把 `TEMPLATE.md` 给 AI，按其 25 节结构生成；
> 本项目的具体边界见 `BOUNDARIES.md`。

## 如何打开 / 运行

| 方式 | 命令 | 能力 |
|---|---|---|
| **静态（file://）** | 直接在浏览器打开 `index.html` | 只读快照；无目录树/搜索/刷新（降级提示） |
| **本地服务（推荐）** | `pnpm dashboard:serve` → 访问 `http://127.0.0.1:4177/` | 解锁文档库目录树、搜索、刷新、原始文件读取、进程控制 |
| **刷新数据快照** | `pnpm dashboard` | 重新从 git / dev_log / release-log / roadmap / skill 文件生成 `state.generated.js` |

- `state.generated.js` 是**每机器本地构建产物**，已 gitignore；换机器克隆后先跑 `pnpm dashboard`。
- serve 仅绑定 `127.0.0.1`（无依赖、纯 Node stdlib）。

## 页面地图（11 页 / 5 组）

- **总览组**：总览（聚合 cockpit）
- **进度组**：任务进度 · 开发数据
- **产品组**：产品结构图（模块与跨模块同步编排 Owner）· 分支管理
- **交付质量组**：部署 · 测试结果 · 发布记录
- **知识操作组**：文档库 · Skill 和 Agent · 使用和操作

## 边界模型（一句话）

每个数据域只有一个 **Owner** 页渲染明细；别页只能放 **Mirror**（可薄可富，但复用 Owner 的
数据 / 渲染器 / 状态词汇）或 **Shared-Widget**（单函数状态徽标，如测试 badge）。总览可以富展示，
但禁止 fork 第二套明细实现。新内容如何归类见 `BOUNDARIES.md §5` 决策表。

## 权威文档

| 文件 | 角色 |
|---|---|
| `BOUNDARIES.md` | 本项目「每页每卡」边界契约（逐卡职责/展示/不展示/数据源/色彩/交互 + 新增归类规则） |
| `TEMPLATE.md` | 跨项目可复用模板（25 节，覆盖结构/视觉/布局/色彩/管理逻辑） |
| `DESIGN.md` | 设计动机与升级计划（why） |
| `docs/workflow/project/dev-dashboard.md` | 机器契约（AI 代理的可改/不可改边界、刷新规则） |

## 维护

任何卡片/页面增删须同步 `BOUNDARIES.md` 与 `TEMPLATE.md`；由 `xai-dev-dashboard-sync` 一并核对
机器契约、模板、边界规范、Overview 新鲜度、测试状态与 skill/agent 注册表。
