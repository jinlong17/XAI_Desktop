# PLUGIN_MAP.md — 全局状态机

> AI 开发 / 调用任何 Plugin 前，必须先查阅此表。
> 只有状态为 Stable 或 Production 的 Plugin 才能被作为稳定依赖。
> 状态为 In-Dev / Testing 的 Plugin 必须使用 Mock 数据解耦。
>
> 最后更新: 2026-05-13

---

## Core Packages

| Package | 目录 | 状态 | 说明 | 最后更新 |
|---------|------|------|------|---------|
| @repo/core | packages/core/ | Stable | 基础设施 + 类型 + 事件 + Registry | 2026-05-14 |
| @repo/ui | packages/ui/ | In-Dev | 共享 UI 组件库 (3 stub 组件) | 2026-05-13 |

## Plugins

| Plugin | 目录 | 状态 | PRD 章节 | 对外依赖 | 最后更新 |
|--------|------|------|---------|---------|---------|
| organizer | packages/plugin-organizer/ | Stable | §5.1 | @repo/core, @repo/ui | 2026-05-14 |
| todo | packages/plugin-todo/ | Planned | §5.2 | @repo/core | — |
| pomodoro | packages/plugin-pomodoro/ | Planned | §5.3 | @repo/core | — |
| habits | packages/plugin-habits/ | Planned | §5.4 | @repo/core | — |
| clipboard | packages/plugin-clipboard/ | Planned | §5.5 | @repo/core | — |
| widgets | packages/plugin-widgets/ | Planned | §5.6 | @repo/core | — |
| meditation | packages/plugin-meditation/ | Planned | §5.7 | @repo/core | — |
| ai-cube | packages/plugin-ai-cube/ | Planned | §5.8 | @repo/core | — |
| settings | packages/plugin-settings/ | Planned | — | @repo/core, @repo/ui | — |

## 已完成功能 (organizer)

- 透明 Host 窗口 (全屏 overlay + 点击穿透)
- Grid 系统 (拖拽、调整大小、折叠、锁定、持久化)
- OrganizerLayer 多窗口编排
- AiCube + SettingsPanel (待迁移为独立 Plugin)
- useFileDrop hook (HTML5 拖放 + 文件路径)
- 文件拖入创建新 Grid 或追加到已有 Grid

## 已知阻塞项

- macOS 窗口层级冲突已通过多窗口架构解决 (main click-through + per-grid 交互窗口)
- 部分旧文档引用已删除的 efficiency 模块 (番茄钟/便签)，已归档

## 状态定义

| 状态 | 含义 | 外部可调用? |
|------|------|-----------|
| **Planned** | 已规划，尚未动工 | 禁止 |
| **Migrating** | 从旧结构迁移中 | 仅兼容层 |
| **In-Dev** | 开发中，接口可能变动 | 用 Mock |
| **Testing** | 功能完成，正在测试 | 用 Mock |
| **Stable** | 已验证，接口稳定 | 可依赖 |
| **Production** | 生产环境运行中 | 可依赖 |
| **Deprecated** | 已废弃 | 绝对禁止 |
