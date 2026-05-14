# SYSTEM_ARCHITECTURE.md — 系统宪法

> 本文档定义 XAI_Desktop 的架构约束与编码红线。
> 所有开发（人类和 AI）必须遵守此文档中的规则。
>
> 最后更新: 2026-05-13

---

## 1. 架构流派

- **前端:** 微内核 (Microkernel) — Host 壳 + Plugin 业务层
- **Rust:** 模块化命令 + macOS 平台适配层
- **通信:** Plugin 间通过 Tauri 事件系统或 `@repo/core/events`，禁止直接 import 内部模块

## 2. 技术栈版本锁定

| 技术 | 版本 | 备注 |
|------|------|------|
| Tauri | 2.x | macOS private API 启用 |
| React | 19.x | 函数式组件 + Hooks |
| TypeScript | 5.x | strict mode |
| Vite | 7.x | 前端构建 |
| Rust | 1.80+ | Tauri 后端 |
| pnpm | 9.x | 包管理 |
| Turborepo | 2.6+ | Monorepo 编排 |

## 3. 三层边界规则

```
apps/desktop/src/     → Host 壳 (路由 + Provider + PluginHost 渲染，不含业务)
packages/core/        → 基础设施 (类型 + 事件 + Store + Registry，不含业务)
packages/plugin-*/    → 业务插件 (所有业务逻辑的唯一归宿)
packages/ui/          → 共享 UI (无业务逻辑的纯 UI 组件)
```

- **Host** (`apps/desktop/src/`): 窗口壳 + 路由 + 全局 Provider。禁止放业务逻辑
- **Plugin** (`packages/plugin-*/`): 业务功能自治单元。禁止跨 Plugin 直接 import 内部模块
- **Core** (`packages/core/`): 基础设施 + 共享类型。所有 Plugin 可依赖 Core
- **UI** (`packages/ui/`): 共享 UI 组件库。无业务逻辑

## 4. 编码红线

1. 禁止在 Host 写业务逻辑 → 业务代码必须在 plugin 包内
2. 禁止跨 Plugin 直接 import 对方 `src/` 内部模块
3. Plugin 间通信必须通过 `@repo/core/events` 的类型安全事件
4. 禁止在 Plugin 内直接调用 `@tauri-apps/api` → 通过 `@repo/core/hooks` 封装
5. 所有 Tauri 事件 payload 必须在 `@repo/core/types` 中定义类型
6. 每个 Plugin 的 `manifest.json` 是注册的唯一入口
7. 禁止使用 `console.log` 做生产日志 → 开发环境可用
8. 依赖方向严格单向: `Host → Plugin → Core/UI`，禁止反向

## 5. 多窗口架构

### 5.1 窗口分类

| 类型 | Label 模式 | 用途 | 交互模式 |
|------|-----------|------|---------|
| main | `main` | 全屏透明 overlay | 默认点击穿透 (`ignoresMouseEvents: YES`) |
| control | `control` | AI Cube 控制台 (360x360) | 始终可交互 |
| grid_\<id\> | `grid_xxx` | 独立 Grid 窗口 | 始终可交互 |
| widget_\<id\> | `widget_xxx` | Widget 窗口 | 始终可交互 (未来) |

### 5.2 macOS 窗口层级

所有窗口使用 `CGWindowLevelForKey(DesktopIconWindow)` 作为基准:

- **main 窗口:** `desktop_icon_level + 1`，始终 click-through
- **control 窗口:** `desktop_icon_level + 1`，可交互
- **grid 窗口:** `desktop_icon_level + 3`，可交互，置于 icon 之上

所有窗口加入 `NSWindowCollectionBehavior`: canJoinAllSpaces + stationary + ignoresCycle。

### 5.3 Pointer-Events 策略

- 根容器 `pointer-events: none` 实现桌面点击穿透
- 交互元素 (SmartContainer, AiCube, SettingsPanel) 显式设置 `pointer-events: auto`
- 每个 Grid 独立原生窗口，不受主窗口 pointer-events 限制

## 6. 跨窗口通信规则

- 所有事件通过 `@repo/core/events` 发送，payload 必须可序列化
- 事件命名: `<plugin>:<action>` (如 `organizer:grid-update`, `clipboard:item-copied`)
- 禁止使用 `window.postMessage`
- 禁止直接操作其他窗口的 DOM

## 7. 状态持久化

- 当前使用 localStorage，key: `xai-desktop-layout`
- 数据结构: `PersistedLayout { grids: GridBox[], items: DesktopItem[] }`
- 目标迁移到 Zustand + persist middleware
- 扩展 `GridBox` 字段时确保序列化兼容

## 8. DnD 系统

- 使用 `@dnd-kit/core`
- `GridItem` 为 draggable，容器为 droppable
- `moveItem` 函数处理跨容器拖拽，更新 `itemIds`
- 全局 DnD Provider 在 Host 层提供
