# Organizer — Design Document

## 1. 业务目标

智能桌面文件整理插件。将桌面文件、文件夹和应用组织到浮动 Smart Container (Grid) 中，
支持拖拽、调整大小、折叠、锁定和文件拖放。

## 2. 核心流程

1. 用户在桌面创建 Grid → 出现浮动容器
2. 拖拽文件/文件夹到 Grid → 文件被组织到容器中
3. Grid 支持调整大小、折叠、锁定
4. 多窗口架构: 每个 Grid 可以弹出为独立原生窗口
5. 所有 Grid 布局持久化到 localStorage

## 3. 数据模型

- `GridBox`: 容器元数据 (位置、大小、锁定/折叠状态、内容 ID 列表)
- `DesktopItem`: 文件/文件夹项 (名称、路径、类型、图标)
- `PersistedLayout`: 持久化结构 `{ grids: GridBox[], items: DesktopItem[] }`
- 存储: localStorage key `xai-desktop-layout`

## 4. 窗口需求

| 窗口类型 | 用途 | 尺寸 | 交互模式 |
|---------|------|------|---------|
| main overlay | Grid 编排层 | 全屏 | pointer-events: none (容器区域 auto) |
| grid_\<id\> | 独立 Grid 窗口 | 用户自定义 | 始终可交互 |
| control | 控制面板中显示 Grid 列表 | 360x360 (共享) | 始终可交互 |

## 5. 事件协议

| 事件名 | 方向 | Payload 类型 | 说明 |
|--------|------|-------------|------|
| organizer:grid-update | Grid→All | `{ gridId, changes }` | Grid 状态变更广播 |
| organizer:grid-close | Grid→Main | `{ gridId }` | Grid 窗口关闭 |
| organizer:file-drop | Main→Grid | `{ gridId, files }` | 文件拖入 Grid |
| organizer:grid-window-ready | Grid→Main | `{ gridId }` | Grid 窗口初始化完成 |
| organizer:create-grid-request | Main→Rust | `{ rect }` | 请求创建新 Grid 窗口 |

## 6. 依赖关系

- Core: @repo/core (events, types)
- UI: @repo/ui (ResizeHandles — 未来迁移)
- DnD: @dnd-kit/core, @dnd-kit/utilities
