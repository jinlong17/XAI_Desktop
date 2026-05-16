# XAI_Desktop 重构方案 v1.0

# 微内核 + 插件双轨 + 文档驱动开发 (Doc-Driven Development)

> **决策锚点:**
> - Host (apps/desktop/) 极简化 — 只做窗口壳 + 路由 + 全局 Provider，零业务逻辑
> - 新建 packages/plugin-* 逐步拆分所有业务功能，每个 plugin 独立包
> - Rust 后端引入 Plugin trait 注册机制，替代硬编码 Tauri commands
> - 前端插件通过 PluginRegistry 统一注册，Host 动态加载
> - 三波次推进（文档+边界 → 前端拆分 → Rust 后端 + 基础设施）
>
> **创建日期:** 2026-05-13 | **维护者:** Jinlong
>
> **参考:** Any2Knowledge_Agent_System/docs/REFACTORING_PLAN.md v2.3
> （微内核 + FSD + Doc-Driven Development 模式的成熟实践）

---

## 目录

- [一、现状诊断](#一现状诊断-as-is)
- [二、目标架构](#二目标架构-to-be)
- [三、全局文档体系](#三全局文档体系)
- [三½、文档重构方案](#三½文档重构方案)
- [四、前端重构方案](#四前端重构方案)
- [五、Rust 后端重构方案](#五rust-后端重构方案)
- [六、插件注册机制](#六插件注册机制)
- [七、跨窗口通信协议](#七跨窗口通信协议)
- [八、状态管理策略](#八状态管理策略)
- [九、执行计划 (3 Wave)](#九执行计划-3-wave)
- [十、风险控制](#十风险控制)
- [十一、成功标准](#十一成功标准)

---

## 一、现状诊断 (As-Is)

### 1.1 当前优势

- Tauri 2 + React 19 + Vite 7 技术栈现代
- 多窗口架构成熟：main (透明点击穿透) + control (AI Cube) + per-grid 原生窗口
- macOS 原生 API 集成完成：NSWindowCollectionBehavior、DesktopIconWindow 层级、ignoresMouseEvents
- Turborepo + pnpm monorepo 基础已搭好
- plugin-organizer 核心功能可用（Grid 拖拽、调整大小、折叠、锁定、文件拖放）
- 跨窗口通信基于 Tauri 事件系统，方向正确

### 1.2 当前痛点

| 编号 | 问题 | 具体表现 |
|------|------|---------|
| P1 | **Host 层业务泄漏** | `apps/desktop/src/` 包含 OrganizerLayer (181行)、useMultiWindowGrids (293行)、useGridWindow、useGlobalMouse 等业务逻辑，违反 Host 只做壳的原则 |
| P2 | **plugin-organizer 过度膨胀** | SmartContainer (477行)、useFileDrop (6.6KB)、useCustomResize (4.4KB)、useContainerManager (3.4KB) 全部塞进一个包 |
| P3 | **packages/ui/ 形同虚设** | 仅 3 个 stub 组件 (button/card/code)，真正的 UI 组件全在 plugin-organizer 内部 |
| P4 | **无插件注册机制** | PRD 规划了 10+ 功能模块 (Todo/Pomodoro/Clipboard/Widgets/AI Cube 等)，但无 PluginRegistry 动态加载框架 |
| P5 | **Rust 后端硬编码** | lib.rs (334行) 所有 Tauri commands (create/update/close_grid_window) 直接写死，无 Plugin trait 抽象 |
| P6 | **跨窗口事件无类型** | Tauri 事件全是字符串 key + 手工 JSON，无 TypeScript 类型安全，易出运行时错误 |
| P7 | **无测试框架** | 全项目无 Vitest/Jest 配置，无 `*.test.ts` 文件，测试完全依赖人工 |
| P8 | **文档碎片化** | docs/ 下 40+ md 无统一结构，reports/ 和 testing/ 大量历史记录混杂，缺乏 Feature Map 和状态追踪 |
| P9 | **状态管理原始** | React Context + localStorage 直写，无 Zustand/Jotai，跨窗口同步依赖事件手工广播 |
| P10 | **CSP 未启用** | tauri.conf.json `csp: null`，生产安全隐患 |
| P11 | **isTauri 硬编码** | OrganizerLayer.tsx 第 27 行 `isTauri = true` 绕过检测，破坏浏览器测试能力 |
| P12 | **apps/web/ 和 apps/docs/ 空壳** | 两个 Next.js scaffold 无任何实际内容，增加 monorepo 噪音 |

### 1.3 前端真实位置

> **关键事实:** 所有前端逻辑在 `apps/desktop/src/` + `packages/plugin-organizer/src/`。
> `apps/web/` 和 `apps/docs/` 是空壳 scaffold，不在重构范围内。

当前 `apps/desktop/src/` 结构概要：

```
apps/desktop/src/
├── App.tsx                    # 根组件 (SettingsProvider + InteractiveProvider)
├── main.tsx                   # Hash-based 多窗口路由
├── components/
│   ├── AiAssistant/AiCube.tsx        # AI Cube UI (5.2 KB)
│   ├── ControlWindow/ControlWindowApp.tsx  # 360x360 控制窗口
│   ├── GridWindow/GridWindowApp.tsx   # Per-grid 窗口渲染器 (5 KB)
│   └── Settings/SettingsPanel.tsx     # 外观设置面板 (6.2 KB)
├── context/
│   ├── InteractiveContext.tsx         # 鼠标交互切换
│   └── SettingsContext.tsx            # 全局外观设置 (5.4 KB)
├── hooks/
│   ├── useGlobalMouse.ts             # macOS 全局鼠标追踪 (4.9 KB) ← 应在 plugin
│   ├── useGridWindow.ts              # Tauri invoke 封装 ← 应在 plugin
│   └── useMultiWindowGrids.ts        # 跨窗口同步引擎 (293行) ← 应在 plugin
└── plugins/
    └── OrganizerLayer.tsx             # Grid 编排 + 文件拖放中继 (181行) ← 应在 plugin
```

当前 `packages/plugin-organizer/src/` 结构概要：

```
packages/plugin-organizer/src/
├── index.ts                   # Barrel export
├── types.ts                   # GridBox, DesktopItem, PersistedLayout
├── SmartContainer.tsx         # 核心 Grid 组件 (477行)
├── GridItem.tsx               # 文件/文件夹项渲染器
├── useGridSystem.tsx          # GridSystemContext + localStorage 持久化
├── useContainerManager.tsx    # 容器生命周期管理
├── mockData.ts                # 默认 Grid 工厂
├── resize-handles.css
└── hooks/
    ├── useFileDrop.ts         # HTML5 拖放 + 文件路径工具 (6.6 KB)
    └── useCustomResize.tsx    # 8 方向调整大小 (4.4 KB)
```

### 1.4 Rust 后端真实盘点

`apps/desktop/src-tauri/src/lib.rs` (334 行) 包含：

| 命令 | 说明 |
|------|------|
| `greet` | 测试 stub |
| `create_grid_window` | 创建原生 grid_<id> 窗口 |
| `update_grid_window` | 调整窗口位置/大小 |
| `close_grid_window` | 销毁窗口 + 移除状态 |

所有 macOS 原生操作（NSWindow 配置、CGWindowLevel 设置、ignoresMouseEvents 切换）
直接内联在函数体中，无模块化。

---

## 二、目标架构 (To-Be)

### 2.1 整体分层图

```
┌──────────────────────────────────────────────────────────────────────────┐
│  /docs (全局态势感知锚点)                                                  │
│  ├── SYSTEM_ARCHITECTURE.md    系统宪法                                    │
│  ├── PLUGIN_MAP.md             全局状态机 ★ 最核心                          │
│  └── CORE_INFRA.md             底座工具清单 (Tauri API + 共享类型)           │
├──────────────────────────────────────────────────────────────────────────┤
│  packages/core/ (微内核 — 共享基础设施，零业务逻辑)                          │
│  ├── /types         全局类型定义 (事件协议、窗口类型、插件 manifest)          │
│  ├── /events        类型安全的 Tauri 事件 emit/listen 封装                  │
│  ├── /store         跨窗口状态管理 (Zustand + Tauri 事件同步)               │
│  ├── /hooks         基础设施 hooks (useTauriInvoke, useWindow)             │
│  ├── /utils         通用工具函数                                           │
│  └── /registry      PluginRegistry — 插件注册 + 动态加载                   │
├──────────────────────────────────────────────────────────────────────────┤
│  packages/ui/ (共享 UI 组件库 — 无业务逻辑)                                 │
│  ├── 基础组件 (Button, Card, Code, Modal, Tooltip, ...)                   │
│  ├── Grid 基础组件 (ResizeHandle, DragHandle, ContainerFrame)             │
│  └── 布局组件 (Overlay, FloatingPanel)                                    │
├──────────────────────────────────────────────────────────────────────────┤
│  packages/plugin-* (插件层 — 所有业务逻辑的归宿) ★                          │
│  ├── plugin-organizer/     智能桌面整理 (Grid + 文件拖放)                   │
│  ├── plugin-todo/          待办清单 (PRD §5.2)                             │
│  ├── plugin-pomodoro/      番茄钟 (PRD §5.3)                              │
│  ├── plugin-habits/        习惯打卡 (PRD §5.4)                             │
│  ├── plugin-clipboard/     剪贴板 (PRD §5.5)                              │
│  ├── plugin-widgets/       桌面 Widgets (PRD §5.6)                        │
│  ├── plugin-meditation/    冥想/专注模式 (PRD §5.7)                        │
│  ├── plugin-ai-cube/       AI Cube (PRD §5.8)                             │
│  └── plugin-settings/      设置面板                                        │
│  每个 Plugin 内部:                                                         │
│  ├── /src           组件 + hooks + 状态                                    │
│  ├── /tests         独立测试                                               │
│  ├── /docs          四件套 (design/api/test/dev_log)                       │
│  └── manifest.json  元信息 (名称、版本、contentTypes、窗口需求)              │
├──────────────────────────────────────────────────────────────────────────┤
│  apps/desktop/ (Host 壳 — 极简，只做窗口 + 路由 + Provider)                │
│  ├── src/            多窗口路由 + 全局 Provider + PluginHost 渲染           │
│  └── src-tauri/      Rust 后端 (窗口管理 + macOS native + Plugin commands) │
├──────────────────────────────────────────────────────────────────────────┤
│  apps/desktop/src-tauri/ (Rust 微内核)                                    │
│  ├── src/commands/   模块化 Tauri 命令 (window.rs, fs.rs, ...)            │
│  ├── src/platform/   macOS 平台适配 (window_ext.rs, mouse.rs)             │
│  └── src/plugins/    Rust 侧 Plugin trait (未来: 每个 plugin 可注册命令)    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 关键架构决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 基础设施包名 | `@repo/core` (新建) | 事件协议、类型、Registry 需要独立于任何 plugin |
| 状态管理 | Zustand + Tauri 事件同步 | Context 无法跨窗口；localStorage 无法响应式通知；Zustand 轻量且支持 persist middleware |
| 插件注册 | PluginRegistry (TS) + manifest.json | 参考 Any2Knowledge FeatureLoader 模式，启动时扫描、注册、挂载 |
| 跨窗口通信 | 类型安全事件层 `@repo/core/events` | 消除字符串事件 key 和手工 JSON 的运行时风险 |
| UI 组件归属 | 通用 → packages/ui/；业务 → plugin 内部 | SmartContainer 是业务组件留 plugin-organizer；ResizeHandle 是通用组件升入 ui/ |
| Rust 模块化 | commands/ + platform/ 拆分 | lib.rs 334 行单文件不可维护；按职责拆分 |
| 测试框架 | Vitest (前端) + cargo test (Rust) | Vitest 与 Vite 天然集成；cargo test 是 Rust 标准 |
| apps/web/ apps/docs/ | 暂保留但标记为 scaffold | 不在重构范围内，未来有需求再激活 |

### 2.3 变化对照表

| 维度 | 现状 (As-Is) | 目标 (To-Be) |
|------|-------------|-------------|
| Host 业务逻辑 | OrganizerLayer + useMultiWindowGrids + 4 个 hooks 在 apps/desktop/src/ | Host 仅有路由 + Provider + PluginHost 渲染壳 |
| 基础设施共享 | 无共享基础设施包 | `@repo/core` — 事件、类型、Store、Registry |
| UI 组件库 | packages/ui/ 仅 3 个 stub | 提升为真正的共享组件库 (15+ 基础组件) |
| 插件架构 | 仅 plugin-organizer，无注册机制 | PluginRegistry + manifest.json，支持 10+ 插件 |
| 状态管理 | React Context + localStorage 直写 | Zustand store + Tauri 事件跨窗口同步 |
| 跨窗口事件 | 字符串 key + 手工 JSON | 类型安全事件协议 (`@repo/core/events`) |
| Rust 后端 | lib.rs 单文件 334 行 | commands/ + platform/ 模块化 |
| 文档体系 | 碎片化 (40+ md 无结构) | 全局三件套 + Plugin 四件套 |
| 测试 | 无 | Vitest + cargo test |
| 类型定义 | plugin-organizer/types.ts 唯一类型源 | `@repo/core/types` 全局 + 各 plugin 局部类型 |

---

## 三、全局文档体系

### 3.1 文档层次总览

```
/docs                                    # 全局态势感知锚点
├── SYSTEM_ARCHITECTURE.md               # 系统宪法 — 架构约束与编码红线
├── PLUGIN_MAP.md                        # 全局状态机 — 所有插件的"白名单" ★
├── CORE_INFRA.md                        # 底座工具清单 — 共享 API 参考
└── /archive                             # 归档区 (旧文档归档)

/packages/plugin-<name>/docs             # 局部闭环四件套
├── design.md                            # 业务流与架构蓝图
├── api.md                               # 接口契约 (Tauri commands + 事件协议)
├── test.md                              # 测试大纲与边界
└── dev_log.md                           # 开发日志 — AI 的"短期记忆" ★
```

### 3.2 SYSTEM_ARCHITECTURE.md 规范

```markdown
# SYSTEM_ARCHITECTURE.md — 系统宪法

## 1. 架构流派
- 前端: 微内核 (Microkernel) — Host 壳 + Plugin 业务层
- Rust: 模块化命令 + macOS 平台适配层
- 通信: Plugin 间通过 Tauri 事件系统或 @repo/core/events，禁止直接 import 内部模块

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
- Host (apps/desktop/src/): 窗口壳 + 路由 + 全局 Provider。禁止放业务逻辑
- Plugin (packages/plugin-*/): 业务功能自治单元。禁止跨 Plugin 直接 import 内部模块
- Core (packages/core/): 基础设施 + 共享类型。所有 Plugin 可依赖 Core

## 4. 编码红线
- 禁止在 Host 写业务逻辑 → 业务代码必须在 plugin 包内
- 禁止跨 Plugin 直接 import 对方 src/ 内部模块
- Plugin 间通信必须通过 @repo/core/events 的类型安全事件
- 禁止在 Plugin 内直接调用 Tauri invoke → 通过 @repo/core/hooks 封装
- 所有 Tauri 事件 payload 必须在 @repo/core/types 中定义类型
- 每个 Plugin 的 manifest.json 是注册的唯一入口
- 禁止使用 console.log 做生产日志 → 开发环境可用

## 5. 窗口分类
| 类型 | Label 模式 | 用途 | 交互模式 |
|------|-----------|------|---------|
| main | `main` | 全屏透明 overlay | 默认点击穿透，热区激活 |
| control | `control` | AI Cube 控制台 | 始终可交互 |
| grid_<id> | `grid_xxx` | 独立 Grid 窗口 | 始终可交互 |
| widget_<id> | `widget_xxx` | Widget 窗口 | 始终可交互 (未来) |

## 6. 跨窗口通信规则
- 所有事件通过 @repo/core/events 发送，payload 必须可序列化
- 事件命名: <plugin>:<action> (如 organizer:grid-update, clipboard:item-copied)
- 禁止使用 window.postMessage
- 禁止直接操作其他窗口的 DOM
```

### 3.3 PLUGIN_MAP.md 规范 (★ 最核心)

```markdown
# PLUGIN_MAP.md — 全局状态机

> AI 开发 / 调用任何 Plugin 前，必须先查阅此表
> 只有状态为 Stable 或 Production 的 Plugin 才能被作为稳定依赖
> 状态为 In-Dev / Testing 的 Plugin 必须使用 Mock 数据解耦

### Core Packages
| Package | 目录 | 状态 | 说明 | 最后更新 |
|---------|------|------|------|---------|
| @repo/core | packages/core | Planned | 基础设施 + 类型 + Registry | 2026-05-13 |
| @repo/ui | packages/ui | In-Dev | 共享 UI 组件库 | 2026-05-13 |

### Plugins
| Plugin | 目录 | 状态 | PRD 章节 | 对外依赖 | 最后更新 |
|--------|------|------|---------|---------|---------|
| organizer | packages/plugin-organizer | Stable | §5.1 | @repo/core, @repo/ui | 2026-05-13 |
| todo | packages/plugin-todo | Planned | §5.2 | @repo/core | — |
| pomodoro | packages/plugin-pomodoro | Planned | §5.3 | @repo/core | — |
| habits | packages/plugin-habits | Planned | §5.4 | @repo/core | — |
| clipboard | packages/plugin-clipboard | Planned | §5.5 | @repo/core | — |
| widgets | packages/plugin-widgets | Planned | §5.6 | @repo/core | — |
| meditation | packages/plugin-meditation | Planned | §5.7 | @repo/core | — |
| ai-cube | packages/plugin-ai-cube | Planned | §5.8 | @repo/core | — |
| settings | packages/plugin-settings | Planned | — | @repo/core, @repo/ui | — |

### 状态定义
| 状态 | 含义 | 外部可调用? |
|------|------|-----------|
| **Planned** | 已规划，尚未动工 | ❌ 禁止 |
| **Migrating** | 从旧结构迁移中 | ⚠️ 仅兼容层 |
| **In-Dev** | 开发中，接口可能变动 | ⚠️ 用 Mock |
| **Testing** | 功能完成，正在测试 | ⚠️ 用 Mock |
| **Stable** | 已验证，接口稳定 | ✅ 可依赖 |
| **Production** | 生产环境运行中 | ✅ 可依赖 |
| **Deprecated** | 已废弃 | ❌ 绝对禁止 |
```

### 3.4 CORE_INFRA.md 规范

```markdown
# CORE_INFRA.md — 底座工具清单

> Plugin 开发时，所有底层资源必须从此处获取，禁止私建

## 1. Tauri 命令调用
文件: @repo/core/hooks/useTauriInvoke.ts

import { useTauriInvoke } from '@repo/core/hooks';
const { invoke } = useTauriInvoke();
await invoke('create_grid_window', { id, rect });

## 2. 跨窗口事件
文件: @repo/core/events/index.ts

import { emitEvent, useEventListener } from '@repo/core/events';
// 发送
await emitEvent('organizer:grid-update', { gridId, changes });
// 监听
useEventListener('organizer:grid-update', (payload) => { ... });

## 3. 全局类型
文件: @repo/core/types/index.ts

import type { GridBox, DesktopItem, PluginManifest, WindowType } from '@repo/core/types';

## 4. 状态管理
文件: @repo/core/store/index.ts

import { useAppStore } from '@repo/core/store';
const { grids, updateGrid } = useAppStore();

## 5. 窗口工具
文件: @repo/core/hooks/useWindow.ts

import { useWindow } from '@repo/core/hooks';
const { windowLabel, windowType, isMainWindow } from useWindow();

## 6. 插件注册
文件: @repo/core/registry/index.ts

import { PluginRegistry } from '@repo/core/registry';
PluginRegistry.register(manifest, { MainView, GridContent, ControlWidget });
```

### 3.5 Plugin 四件套模板

每个 Plugin 的 `/docs` 目录严格只有四个文件：

#### design.md 模板

```markdown
# [Plugin Name] — Design Document

## 1. 业务目标
此 Plugin 解决什么问题，面向哪类用户场景。

## 2. 核心流程
Step 1: ...
Step 2: ...

## 3. 数据模型
持久化结构 (localStorage / SQLite)。

## 4. 窗口需求
| 窗口类型 | 用途 | 尺寸 | 交互模式 |
|---------|------|------|---------|

## 5. 事件协议
| 事件名 | 方向 | Payload 类型 | 说明 |
|--------|------|-------------|------|

## 6. 依赖关系
- Core: @repo/core (events, types, store)
- UI: @repo/ui (可选)
- 其他 Plugin: (仅列出 Stable 状态的)
```

#### api.md 模板

```markdown
# [Plugin Name] — API Contract

## Tauri Commands
### command_name
**Params:** { field: type }
**Returns:** { field: type }
**Errors:** | Error | Description |

## Events (emit)
### plugin:event-name
**Payload:** { field: type }
**From:** 哪个窗口
**To:** 哪些窗口

## Events (listen)
### plugin:event-name
**Payload:** { field: type }
**Handler:** 处理逻辑说明
```

#### test.md 模板

```markdown
# [Plugin Name] — Test Plan

## Unit Tests (Vitest)
- [ ] 核心 hooks 测试
- [ ] 状态逻辑测试

## Component Tests
- [ ] 关键组件渲染
- [ ] 交互行为

## Integration Tests
- [ ] 跨窗口事件同步
- [ ] Tauri command 调用

## Manual Tests
- [ ] macOS 真实硬件验证
- [ ] 多显示器场景
```

#### dev_log.md 模板

```markdown
# [Plugin Name] — Dev Log (AI 短期记忆)

## Current Status
Planned / Migrating / In-Dev / Stable

## TODO
- [ ] 待完成事项

## Known Issues
- 暂无

## 踩坑记录
### YYYY-MM-DD
- 记录
```

---

## 三½、文档重构方案

### 3½.1 现状审计 (2026-05-13)

当前 `docs/` 下共 **35 个 Markdown 文件**，分布在 9 个子目录中。
经逐文件审计，健康度如下：

| 分类 | 文件数 | ACTIVE | STALE | DEAD |
|------|--------|--------|-------|------|
| architecture/ | 2 | 2 | 0 | 0 |
| development/ | 5 | 3 | 2 | 0 |
| reports/ | 6 | 1 | 4 | 1 |
| testing/ | 14 | 0 | 7 | 7 |
| guides/ | 3 | 3 | 0 | 0 |
| conventions/ | 2 | 2 | 0 | 0 |
| reference/ | 1 | 1 | 0 | 0 |
| workflow/ | 1 | 1 | 0 | 0 |
| planning/ | 3 | 3 | 0 | 0 |
| 根 (_INDEX) | 1 | 1 | 0 | 0 |
| **总计** | **38** | **17** | **13** | **8** |

**核心问题：**

1. **testing/ 全部无活跃价值** — 14 个文件全部是 2024 年 12 月窗口层级调试的历史记录，
   包含 3 个从未填写的空白 checklist、多个互相矛盾的调试尝试、1 个明确标记 OUTDATED 的草稿
2. **reports/ 大部分过期** — 6 个中 5 个是一次性实施记录，其中 `EFFICIENCY_SUITE_IMPLEMENTATION.md`
   描述已删除的代码 (效率套件/番茄钟/便签)
3. **development/ 有冗余** — `CURRENT_STATUS.md` 仅为 `PROGRESS_SNAPSHOT.md` 的薄包装；
   `TECHNICAL_STATUS.md` 和 `DEV_PLAN_V2.md` 是 2025-12 的历史快照
4. **无统一锚点** — 缺少 Any2Knowledge 式的 SYSTEM_ARCHITECTURE / FEATURE_MAP / CORE_INFRA 三件套
5. **_INDEX.md 维护负担重** — 为 35 个文件维护索引不现实，且上次更新停在 2026-03-02

### 3½.2 参考模型：Any2Knowledge 文档结构

Any2Knowledge 经过 3 波重构后的文档结构清晰高效：

```
docs/
├── SYSTEM_ARCHITECTURE.md     # 系统宪法 (边界规则 + 编码红线)
├── FEATURE_MAP.md             # 全局状态机 (所有模块的白名单)
├── CORE_INFRA.md              # 底座工具清单 (共享 API 参考)
├── REFACTORING_PLAN.md        # 重构方案 (完成后转为历史参考)
├── adr/                       # 架构决策记录 (轻量，每个决策一文件)
├── workflow/                  # AI 协作工作流 (subagent, SOP, playbook)
├── vendor-cards/              # 第三方依赖审批卡
├── archive/                   # 归档区 (旧文件一键移入，不再维护)
├── governance/                # 治理政策
└── observability/             # 可观测性设计
```

**核心设计原则：**
- **docs/ 根只放"活文档"** — 随代码同步更新的 3-4 个核心锚点
- **archive/ 是安全的垃圾桶** — 任何不确定要不要删的都先移入 archive，降低删除焦虑
- **每个 feature/plugin 的文档随代码走** — 四件套在 `packages/plugin-*/docs/`，不在全局 docs/
- **adr/ 记录架构决策** — 一个决策一个文件，编号递增，创建后不修改

### 3½.3 XAI_Desktop 目标文档结构

```
docs/
├── SYSTEM_ARCHITECTURE.md     # ★ 系统宪法 (新建，见 §3.2)
├── PLUGIN_MAP.md              # ★ 全局状态机 (新建，见 §3.3)
├── CORE_INFRA.md              # ★ 底座工具清单 (新建，见 §3.4)
│
├── guides/                    # 开发者指南 (保留，精简)
│   ├── QUICK_START.md         #   快速上手 (保留)
│   ├── HOW_TO_RUN.md          #   运行指南 (保留)
│   └── BUILD_GUIDE.md         #   构建指南 (保留)
│
├── planning/                  # 产品规划 (保留)
│   ├── 2026-05-12-PRD-v1.md              # PRD (保留)
│   ├── 2026-05-12-product-development-plan-v1.md  # 开发计划 (保留)
│   └── REFACTORING_PLAN.md               # 本文档 (保留)
│
├── conventions/               # 约定 (保留)
│   └── COMMIT_CONVENTION.md   #   提交约定 (保留)
│
├── workflow/                  # AI 协作工作流 (保留)
│   └── SUBAGENT_WORKFLOW_V2.md
│
├── adr/                       # 架构决策记录 (新建)
│   └── 0001-plugin-registry-static-import.md  # 示例: 为什么选择静态 import
│
└── archive/                   # 归档区 (新建 — 所有历史文件移入)
    ├── testing/               #   原 testing/ 整目录搬入
    ├── reports/               #   原 reports/ 整目录搬入
    ├── development/           #   旧 development 快照
    │   ├── TECHNICAL_STATUS.md
    │   ├── DEV_PLAN_V2.md
    │   └── CURRENT_STATUS.md
    ├── architecture/          #   旧架构文档 (被 SYSTEM_ARCHITECTURE 取代)
    │   ├── ARCHITECTURE_AND_DEV_GUIDE.md
    │   └── system_feature.md
    ├── reference/
    │   └── codebase_tree.md   #   旧代码树 (被 PLUGIN_MAP 取代)
    ├── _INDEX.md              #   旧索引 (被新三件套取代)
    ├── PROGRESS_SNAPSHOT.md   #   旧进度快照 (被 PLUGIN_MAP 状态列取代)
    └── STEP_1_CANVAS.md       #   旧开发笔记

packages/plugin-*/docs/        # ★ Plugin 四件套 (随代码走，不在全局 docs/)
├── design.md
├── api.md
├── test.md
└── dev_log.md
```

### 3½.4 逐文件处置映射表

#### 保留 (原地不动)

| 文件 | 理由 |
|------|------|
| `guides/QUICK_START.md` | 开发者入口，内容准确 |
| `guides/HOW_TO_RUN.md` | 运行指南，内容准确 |
| `guides/BUILD_GUIDE.md` | 构建指南，内容准确 |
| `conventions/COMMIT_CONVENTION.md` | 提交约定，正在使用 |
| `workflow/SUBAGENT_WORKFLOW_V2.md` | 工作流定义，正在使用 |
| `planning/2026-05-12-PRD-v1.md` | PRD，核心参考 |
| `planning/2026-05-12-product-development-plan-v1.md` | 开发计划，核心参考 |
| `planning/REFACTORING_PLAN.md` | 本文档 |

#### 删除 (无价值)

| 文件 | 理由 |
|------|------|
| `testing/FINAL_VERIFICATION.md` | 空白 checklist，从未填写 |
| `testing/manual_check_list.md` | 空白 checklist，从未填写 |
| `testing/test_resize_and_empty.md` | 空白 checklist，从未填写 |
| `testing/test_file_drop.md` | 自标 OUTDATED，前提已不成立 |
| `reports/EFFICIENCY_SUITE_IMPLEMENTATION.md` | 描述已删除的代码，完全无效 |
| `conventions/DEV_LOG_TEMPLATE.md` | 模板已在本文档 §3.5 重新定义 |

#### 归档 (移入 docs/archive/)

| 文件 | 归档路径 | 理由 |
|------|---------|------|
| `testing/CLICK_THROUGH_DEBUG.md` | `archive/testing/` | 2024-12 调试记录 |
| `testing/CLICK_THROUGH_FIX.md` | `archive/testing/` | 2024-12 调试记录 |
| `testing/CRITICAL_FIXES_TEST.md` | `archive/testing/` | 2024-12 调试记录 |
| `testing/FINAL_FIXES_TEST.md` | `archive/testing/` | 2024-12 调试记录 |
| `testing/METHOD_3_TEST.md` | `archive/testing/` | 2024-12 调试记录 |
| `testing/RECOVERY_SUMMARY.md` | `archive/testing/` | 2024-12 恢复记录 |
| `testing/TEST_WINDOW_LEVEL.md` | `archive/testing/` | 2024-12 调试记录 |
| `testing/THREE_CRITICAL_FIXES.md` | `archive/testing/` | 2024-12 调试记录 |
| `testing/VERIFY_CLICK_AND_DROP.md` | `archive/testing/` | 2024-12 验证记录 |
| `testing/WINDOW_LEVEL_DEBUG.md` | `archive/testing/` | 2024-12 调试记录 |
| `reports/BATCH_EXECUTION_SUMMARY.md` | `archive/reports/` | 2024-12 执行记录 |
| `reports/CLEANUP_SUMMARY.md` | `archive/reports/` | 清理记录 |
| `reports/CLOSED_LOOP_UPGRADE.md` | `archive/reports/` | 流程升级记录 |
| `reports/COMPLETE_RESET_AND_VERIFY.md` | `archive/reports/` | 重置指南 |
| `reports/QUICK_FIX.md` | `archive/reports/` | Tauri v2 技巧 (仍有参考价值但非活跃) |
| `development/TECHNICAL_STATUS.md` | `archive/development/` | 2025-12 技术快照，被 PLUGIN_MAP 取代 |
| `development/DEV_PLAN_V2.md` | `archive/development/` | 2025-12 开发计划，历史参考 |
| `development/CURRENT_STATUS.md` | `archive/development/` | PROGRESS_SNAPSHOT 的薄包装 |
| `development/PROGRESS_SNAPSHOT.md` | `archive/development/` | 旧进度快照，被 PLUGIN_MAP 取代 |
| `development/STEP_1_CANVAS.md` | `archive/development/` | 旧开发笔记 |
| `architecture/ARCHITECTURE_AND_DEV_GUIDE.md` | `archive/architecture/` | 被新 SYSTEM_ARCHITECTURE 取代 |
| `architecture/system_feature.md` | `archive/architecture/` | 被新 SYSTEM_ARCHITECTURE 取代 |
| `reference/codebase_tree.md` | `archive/reference/` | 代码树快照，被 PLUGIN_MAP 取代 |
| `_INDEX.md` | `archive/` | 旧索引，被新三件套取代 |

#### 吸收合并 (有价值内容合并到新文档后归档)

| 源文件 | 目标 | 吸收内容 |
|--------|------|---------|
| `architecture/ARCHITECTURE_AND_DEV_GUIDE.md` | `SYSTEM_ARCHITECTURE.md` | 多窗口架构描述、pointer-events 策略、SettingsContext 说明 |
| `architecture/system_feature.md` | `SYSTEM_ARCHITECTURE.md` | SmartContainer 行为规格、DnD 系统说明 |
| `development/PROGRESS_SNAPSHOT.md` | `PLUGIN_MAP.md` | 当前完成/阻塞状态 → Plugin 状态列 |
| `reference/codebase_tree.md` | `CORE_INFRA.md` | 关键文件路径参考 |
| `conventions/DEV_LOG_TEMPLATE.md` | 本文档 §3.5 | 模板已重新定义 |

### 3½.5 归档区规则

```markdown
# docs/archive/README.md

## 归档区

此目录存放已被取代但保留追溯价值的历史文档。

### 规则
1. 归档文件**只读** — 不修改，不更新
2. 归档不是删除 — 有追溯价值的文件移入此处而非直接删除
3. 原始路径保留 — 归档时保持原目录结构 (archive/testing/, archive/reports/ 等)
4. 不被 AI 主动加载 — AI 协作时不扫描 archive/，除非明确要求查阅历史

### 归档时间线
- 2026-05-13: 初始归档 — 重构方案 v1.0 文档清理
```

### 3½.6 新建 adr/ (架构决策记录)

参考 Any2Knowledge 的 `docs/adr/` 模式，XAI_Desktop 也建立 ADR 机制：

```
docs/adr/
├── TEMPLATE.md                                   # ADR 模板
├── 0001-plugin-registry-static-import.md          # 为什么选择静态 import 而非运行时动态加载
├── 0002-zustand-over-context-for-cross-window.md  # 为什么选择 Zustand 替代 React Context
└── 0003-typed-events-over-string-keys.md          # 为什么引入类型安全事件层
```

**ADR 模板:**

```markdown
# ADR-NNNN: [决策标题]

| 字段 | 值 |
|------|---|
| 状态 | Proposed / Accepted / Superseded |
| 日期 | YYYY-MM-DD |
| 决策者 | 谁 |

## 背景
为什么需要做这个决策。

## 方案
### 方案 A: ...
优点 / 缺点

### 方案 B: ...
优点 / 缺点

## 决策
选择方案 X，理由...

## 后果
- 正面: ...
- 负面: ...
```

### 3½.7 重构前后对比

| 维度 | 现状 | 目标 |
|------|------|------|
| docs/ 文件总数 | 35 (不含 planning/) | 8 活跃文件 + archive/ |
| 活跃文档入口 | _INDEX.md (手动维护，已过期) | 三件套 (SYSTEM_ARCHITECTURE + PLUGIN_MAP + CORE_INFRA) |
| 状态追踪 | PROGRESS_SNAPSHOT (手动更新) | PLUGIN_MAP.md 状态列 (与 manifest.json 联动) |
| 架构参考 | 分散在 2 个 architecture/ + development/ 文件中 | 单一 SYSTEM_ARCHITECTURE.md |
| 历史文档 | 混在活跃文档目录中 | 统一移入 archive/ |
| Plugin 文档 | 不存在 | 四件套随代码走 (packages/plugin-*/docs/) |
| 架构决策 | 无记录 | adr/ 编号递增 |
| 测试文档 | 14 个历史调试记录占据 testing/ | 全部归档；活跃测试策略在 plugin 四件套 test.md 中 |
| AI 加载效率 | AI 需扫描 35 个文件找上下文 | AI 只需读三件套 + 目标 plugin 的四件套 |

### 3½.8 执行步骤 (纳入 Wave 1)

文档重构是 Wave 1 的一部分，具体步骤：

```
□ D1. 创建 docs/archive/ 目录 + README.md
□ D2. 删除 6 个 DEAD 文件 (空白 checklist + 描述已删代码的文档)
□ D3. 移动 testing/ 全部 10 个文件到 archive/testing/
□ D4. 移动 reports/ 全部 5 个文件到 archive/reports/
□ D5. 移动 development/ 5 个文件到 archive/development/
□ D6. 移动 architecture/ 2 个文件到 archive/architecture/
□ D7. 移动 reference/codebase_tree.md 到 archive/reference/
□ D8. 移动 _INDEX.md 到 archive/
□ D9. 删除空的 testing/, reports/, development/, architecture/, reference/ 目录
□ D10. 新建 docs/SYSTEM_ARCHITECTURE.md (吸收 architecture/ 两文件内容)
□ D11. 新建 docs/PLUGIN_MAP.md (吸收 PROGRESS_SNAPSHOT 状态)
□ D12. 新建 docs/CORE_INFRA.md (吸收 codebase_tree 路径参考)
□ D13. 新建 docs/adr/ + TEMPLATE.md
□ D14. 更新 CLAUDE.md 中的文档路径引用
□ D15. 验证 git diff 只有移动和新建，无意外删除
```

**执行后 docs/ 顶层结构:**

```
docs/
├── SYSTEM_ARCHITECTURE.md     # 新建 — 系统宪法
├── PLUGIN_MAP.md              # 新建 — 全局状态机
├── CORE_INFRA.md              # 新建 — 底座工具清单
├── guides/                    # 保留 (3 文件)
├── planning/                  # 保留 (3 文件)
├── conventions/               # 保留 (1 文件)
├── workflow/                  # 保留 (1 文件)
├── adr/                       # 新建
└── archive/                   # 新建 (归档 24 个历史文件)
```

**从 35 个散乱文件 → 8 个活跃文件 + 整洁的 archive/**

---

## 四、前端重构方案

### 4.1 核心原则：三层职责划分

```
apps/desktop/src/    → Host 壳 (路由 + Provider + PluginHost 渲染，不含业务)
packages/core/       → 基础设施 (类型 + 事件 + Store + Registry，不含业务)
packages/plugin-*/   → 业务插件 (所有业务逻辑的唯一归宿)
packages/ui/         → 共享 UI (无业务逻辑的纯 UI 组件)
```

### 4.2 packages/core/ 目标结构

```
packages/core/
├── package.json              # @repo/core
├── tsconfig.json
├── src/
│   ├── index.ts              # Barrel export
│   ├── types/
│   │   ├── index.ts
│   │   ├── window.ts         # WindowType, WindowLabel, WindowConfig
│   │   ├── grid.ts           # GridBox, DesktopItem, PersistedLayout (从 plugin-organizer 提升)
│   │   ├── events.ts         # 所有事件 payload 类型定义
│   │   └── plugin.ts         # PluginManifest, PluginRegistration, ContentType
│   ├── events/
│   │   ├── index.ts
│   │   ├── emitter.ts        # 类型安全 emit 封装
│   │   ├── listener.ts       # useEventListener hook
│   │   └── protocol.ts       # 事件名枚举 + payload 映射类型
│   ├── store/
│   │   ├── index.ts
│   │   ├── app-store.ts      # Zustand 全局 store
│   │   └── sync.ts           # Tauri 事件 ↔ Zustand 双向同步
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useTauriInvoke.ts # 类型安全 invoke 封装
│   │   └── useWindow.ts      # 当前窗口信息 hook
│   ├── registry/
│   │   ├── index.ts
│   │   ├── plugin-registry.ts # 插件注册表
│   │   └── plugin-host.tsx    # PluginHost 渲染器组件
│   └── utils/
│       └── index.ts
└── tests/
    └── ...
```

### 4.3 packages/ui/ 目标结构

```
packages/ui/
├── package.json              # @repo/ui
├── tsconfig.json
├── src/
│   ├── index.ts              # Barrel export
│   ├── primitives/
│   │   ├── Button.tsx         ← 现有 button.tsx (增强)
│   │   ├── Card.tsx           ← 现有 card.tsx (增强)
│   │   ├── Code.tsx           ← 现有 code.tsx
│   │   ├── Modal.tsx          # 新建
│   │   ├── Tooltip.tsx        # 新建
│   │   ├── Input.tsx          # 新建
│   │   └── Icon.tsx           # 新建
│   ├── layout/
│   │   ├── Overlay.tsx        # 透明 overlay 容器
│   │   ├── FloatingPanel.tsx  # 浮动面板
│   │   └── ContainerFrame.tsx # Grid 容器外框 (从 SmartContainer 抽取)
│   ├── interactive/
│   │   ├── ResizeHandles.tsx  ← plugin-organizer/resize-handles.css + useCustomResize 的 UI 部分
│   │   ├── DragHandle.tsx     # 拖拽手柄
│   │   └── ContextMenu.tsx    # 右键菜单
│   └── theme/
│       ├── tokens.ts          # 设计变量 (色彩、间距、圆角)
│       └── glassmorphism.ts   # 毛玻璃效果配置
└── tests/
```

### 4.4 Host (apps/desktop/src/) 瘦身后的目标结构

```
apps/desktop/src/
├── main.tsx                   # 入口 — hash 路由分发 (保留，瘦身)
├── App.tsx                    # 主窗口根 — Provider + PluginHost (瘦身)
├── windows/
│   ├── MainWindow.tsx         # 主窗口 — 透明 overlay，渲染已注册的 Plugin overlay 层
│   ├── ControlWindow.tsx      # 控制窗口 — 渲染已注册的 Plugin control widget
│   └── GridWindow.tsx         # Grid 窗口 — 根据 Plugin contentType 渲染内容
├── providers/
│   ├── AppProviders.tsx       # 组合所有 Provider (Theme + Store + DnD + Plugin)
│   └── DndProvider.tsx        ← 现有 components/DndProvider.tsx
├── index.css
└── vite-env.d.ts
```

**被移出的文件映射:**

| 现有文件 | 目标位置 | 说明 |
|---------|---------|------|
| components/AiAssistant/AiCube.tsx | packages/plugin-ai-cube/src/ | AI Cube 是独立 plugin |
| components/ControlWindow/ControlWindowApp.tsx | apps/desktop/src/windows/ControlWindow.tsx | 瘦身为纯壳 |
| components/GridWindow/GridWindowApp.tsx | apps/desktop/src/windows/GridWindow.tsx | 瘦身为纯壳 |
| components/Settings/SettingsPanel.tsx | packages/plugin-settings/src/ | 设置是独立 plugin |
| context/SettingsContext.tsx | packages/plugin-settings/src/ 或 @repo/core/store | 看是否全局共享 |
| context/InteractiveContext.tsx | @repo/core/store | 交互状态是全局基础设施 |
| hooks/useGlobalMouse.ts | @repo/core/hooks/ | 全局鼠标追踪是基础设施 |
| hooks/useGridWindow.ts | packages/plugin-organizer/src/hooks/ | Grid 窗口操作是 organizer 业务 |
| hooks/useMultiWindowGrids.ts | packages/plugin-organizer/src/hooks/ | 跨窗口 Grid 同步是 organizer 业务 |
| plugins/OrganizerLayer.tsx | packages/plugin-organizer/src/ | Grid 编排是 organizer 业务 |

### 4.5 Plugin 内部结构 (以 plugin-organizer 为例)

```
packages/plugin-organizer/
├── package.json              # @repo/plugin-organizer
├── tsconfig.json
├── manifest.json             # Plugin 元信息 ★
├── src/
│   ├── index.ts              # 公开面 — Plugin 注册入口
│   ├── register.ts           # PluginRegistry.register() 调用
│   ├── components/
│   │   ├── SmartContainer.tsx    ← 现有 (重构拆分)
│   │   ├── GridItem.tsx          ← 现有
│   │   ├── OrganizerLayer.tsx    ← 从 apps/desktop/ 迁入
│   │   └── GridWindowContent.tsx # Grid 窗口内的内容渲染器
│   ├── hooks/
│   │   ├── useGridSystem.tsx     ← 现有
│   │   ├── useContainerManager.tsx ← 现有
│   │   ├── useFileDrop.ts        ← 现有
│   │   ├── useCustomResize.tsx   ← 现有
│   │   ├── useGridWindow.ts     ← 从 apps/desktop/ 迁入
│   │   └── useMultiWindowGrids.ts ← 从 apps/desktop/ 迁入
│   ├── store/
│   │   └── organizer-store.ts   # Zustand slice (替代 Context + localStorage)
│   └── types.ts                 # Plugin 局部类型 (GridBox 等迁入 @repo/core 后可能只留扩展类型)
├── docs/
│   ├── design.md
│   ├── api.md
│   ├── test.md
│   └── dev_log.md
└── tests/
    ├── useGridSystem.test.ts
    └── SmartContainer.test.tsx
```

### 4.6 Plugin manifest.json 格式

```json
{
  "name": "organizer",
  "version": "1.0.0",
  "displayName": "智能桌面整理",
  "description": "Grid-based desktop file and app organization",
  "author": "Jinlong",
  "enabled": true,
  "contentTypes": ["file-grid", "app-grid", "folder-grid"],
  "windows": {
    "overlay": true,
    "control": true,
    "grid": true
  },
  "events": {
    "emit": ["organizer:grid-update", "organizer:grid-close", "organizer:file-drop"],
    "listen": ["organizer:grid-window-ready", "organizer:create-grid-request"]
  },
  "dependencies": ["@repo/core", "@repo/ui"],
  "tauriCommands": ["create_grid_window", "update_grid_window", "close_grid_window"]
}
```

### 4.7 FSD 铁律 (适配桌面应用)

| 编号 | 规则 | 说明 |
|------|------|------|
| F1 | **Host 只做壳** | apps/desktop/src/ 禁止写业务逻辑，只组合 Plugin 的公开导出 |
| F2 | **Plugin 之间禁止互相 import** | 必须通过 @repo/core/events 事件通信 |
| F3 | **index.ts 是唯一出口** | 外部只能从 packages/plugin-*/src/index.ts 导入 |
| F4 | **依赖方向严格单向** | `Host → Plugin → Core/UI`，禁止反向 |
| F5 | **Core 不含业务逻辑** | 纯基础设施 + 共享类型 + 注册机制 |
| F6 | **每个 Plugin 内部自由组织** | components/ hooks/ store/ types/ 按需存在 |
| F7 | **事件 payload 类型必须在 Core 定义** | Plugin 发送的事件 payload 类型在 @repo/core/types/events.ts 中声明 |

---

## 五、Rust 后端重构方案

### 5.1 核心原则

```
lib.rs          → 极简入口 (Tauri builder 配置 + 模块注册)
src/commands/   → 按领域拆分的 Tauri commands
src/platform/   → macOS 平台适配 (NSWindow, CGWindowLevel 等)
```

### 5.2 目标目录结构

```
apps/desktop/src-tauri/
├── Cargo.toml
├── src/
│   ├── main.rs                # Tauri entry point (不变)
│   ├── lib.rs                 # builder 配置 — 注册所有 command 模块 (瘦身)
│   ├── commands/
│   │   ├── mod.rs             # 模块声明
│   │   ├── window.rs          ← lib.rs 中 create/update/close_grid_window
│   │   ├── fs.rs              # 文件系统操作 (未来: 真实文件读取)
│   │   └── system.rs          # 系统信息查询 (未来)
│   └── platform/
│       ├── mod.rs             # 模块声明
│       ├── macos/
│       │   ├── mod.rs
│       │   ├── window_ext.rs  ← lib.rs 中 NSWindow 配置逻辑
│       │   └── mouse.rs       # 全局鼠标追踪 (未来从 TS 侧移入)
│       └── mod.rs
├── tauri.conf.json
└── capabilities/
    └── default.json
```

### 5.3 lib.rs 瘦身目标

```rust
// lib.rs — 目标结构

mod commands;
mod platform;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        // 注册 command 模块
        .invoke_handler(tauri::generate_handler![
            commands::window::create_grid_window,
            commands::window::update_grid_window,
            commands::window::close_grid_window,
            commands::window::greet,
        ])
        .setup(|app| {
            platform::macos::setup_main_window(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 5.4 commands/window.rs 迁移映射

| 现有函数 (lib.rs) | 目标位置 | 说明 |
|-------------------|---------|------|
| `greet()` | commands/window.rs (暂留) | 测试 stub，后续删除 |
| `create_grid_window()` | commands/window.rs | 提取 NSWindow 配置到 platform/ |
| `update_grid_window()` | commands/window.rs | 纯窗口操作，少量改动 |
| `close_grid_window()` | commands/window.rs | 纯窗口操作，少量改动 |
| NSWindow 配置逻辑 | platform/macos/window_ext.rs | setup_desktop_window() 等 |
| CGWindowLevel 逻辑 | platform/macos/window_ext.rs | set_desktop_level() |
| ignoresMouseEvents 逻辑 | platform/macos/window_ext.rs | set_mouse_ignore() |

---

## 六、插件注册机制

### 6.1 PluginRegistry (TypeScript 侧)

```typescript
// packages/core/src/registry/plugin-registry.ts

import type { PluginManifest, PluginRegistration } from '../types/plugin';

interface PluginComponents {
  /** 渲染在主窗口 overlay 上的层 */
  OverlayLayer?: React.ComponentType;
  /** 渲染在控制窗口中的 widget */
  ControlWidget?: React.ComponentType;
  /** Grid 窗口内的内容渲染器 */
  GridContent?: React.ComponentType<{ gridId: string }>;
  /** 设置面板 */
  SettingsPanel?: React.ComponentType;
}

class PluginRegistryImpl {
  private plugins = new Map<string, PluginRegistration>();

  register(manifest: PluginManifest, components: PluginComponents): void {
    this.plugins.set(manifest.name, { manifest, components });
  }

  getPlugin(name: string): PluginRegistration | undefined {
    return this.plugins.get(name);
  }

  getAllEnabled(): PluginRegistration[] {
    return [...this.plugins.values()]
      .filter(p => p.manifest.enabled);
  }

  getOverlayLayers(): React.ComponentType[] {
    return this.getAllEnabled()
      .map(p => p.components.OverlayLayer)
      .filter(Boolean) as React.ComponentType[];
  }

  getControlWidgets(): React.ComponentType[] {
    return this.getAllEnabled()
      .map(p => p.components.ControlWidget)
      .filter(Boolean) as React.ComponentType[];
  }
}

export const PluginRegistry = new PluginRegistryImpl();
```

### 6.2 PluginHost 渲染器

```typescript
// packages/core/src/registry/plugin-host.tsx

import { PluginRegistry } from './plugin-registry';

export function OverlayHost() {
  const layers = PluginRegistry.getOverlayLayers();
  return (
    <>
      {layers.map((Layer, i) => <Layer key={i} />)}
    </>
  );
}

export function ControlHost() {
  const widgets = PluginRegistry.getControlWidgets();
  return (
    <>
      {widgets.map((Widget, i) => <Widget key={i} />)}
    </>
  );
}
```

### 6.3 Plugin 注册示例 (plugin-organizer)

```typescript
// packages/plugin-organizer/src/register.ts

import { PluginRegistry } from '@repo/core/registry';
import manifest from '../manifest.json';
import { OrganizerLayer } from './components/OrganizerLayer';
import { OrganizerControlWidget } from './components/ControlWidget';
import { GridWindowContent } from './components/GridWindowContent';

PluginRegistry.register(manifest, {
  OverlayLayer: OrganizerLayer,
  ControlWidget: OrganizerControlWidget,
  GridContent: GridWindowContent,
});
```

### 6.4 Host 侧加载

```typescript
// apps/desktop/src/main.tsx

// 静态 import 所有启用的 Plugin 注册模块
// (编译时确定，不做运行时动态加载，因为桌面应用不需要)
import '@repo/plugin-organizer/register';
// import '@repo/plugin-todo/register';       // 未来
// import '@repo/plugin-clipboard/register';  // 未来

// 路由渲染使用 PluginHost
```

---

## 七、跨窗口通信协议

### 7.1 类型安全事件系统

```typescript
// packages/core/src/types/events.ts

/** 所有事件名 → payload 类型映射 */
export interface EventMap {
  // Organizer 事件
  'organizer:grid-update': { gridId: string; changes: Partial<GridBox> };
  'organizer:grid-close': { gridId: string };
  'organizer:file-drop': { gridId: string; files: string[] };
  'organizer:grid-window-ready': { gridId: string };
  'organizer:create-grid-request': { rect: Rect };

  // 全局事件
  'app:interactive-mode-changed': { interactive: boolean };
  'app:settings-changed': { key: string; value: unknown };
  'app:theme-changed': { theme: ThemeConfig };
}

// packages/core/src/events/emitter.ts

import { emit } from '@tauri-apps/api/event';
import type { EventMap } from '../types/events';

export async function emitEvent<K extends keyof EventMap>(
  event: K,
  payload: EventMap[K]
): Promise<void> {
  await emit(event, payload);
}

// packages/core/src/events/listener.ts

import { listen } from '@tauri-apps/api/event';
import type { EventMap } from '../types/events';

export function useEventListener<K extends keyof EventMap>(
  event: K,
  handler: (payload: EventMap[K]) => void
): void {
  useEffect(() => {
    const unlisten = listen<EventMap[K]>(event, (e) => handler(e.payload));
    return () => { unlisten.then(fn => fn()); };
  }, [event, handler]);
}
```

### 7.2 事件命名约定

| 前缀 | 归属 | 示例 |
|------|------|------|
| `app:` | 全局/Host | `app:interactive-mode-changed` |
| `organizer:` | plugin-organizer | `organizer:grid-update` |
| `todo:` | plugin-todo | `todo:item-completed` |
| `clipboard:` | plugin-clipboard | `clipboard:item-copied` |
| `widgets:` | plugin-widgets | `widgets:clock-tick` |
| `ai:` | plugin-ai-cube | `ai:query-response` |

---

## 八、状态管理策略

### 8.1 现状问题

- React Context + localStorage 直写
- 跨窗口无法共享 React 状态
- `useMultiWindowGrids.ts` 手工维护事件同步 (293 行)
- localStorage debounce 1 秒，存在数据丢失风险

### 8.2 目标方案: Zustand + Tauri 事件同步

```typescript
// packages/core/src/store/app-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emitEvent, useEventListener } from '../events';

interface AppState {
  interactive: boolean;
  setInteractive: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      interactive: false,
      setInteractive: (interactive) => {
        set({ interactive });
        // 广播到其他窗口
        emitEvent('app:interactive-mode-changed', { interactive });
      },
    }),
    { name: 'xai-app-state' }
  )
);

// packages/core/src/store/sync.ts

/** 在每个窗口启动时调用，监听其他窗口的状态变更 */
export function initStoreSync() {
  useEventListener('app:interactive-mode-changed', ({ interactive }) => {
    useAppStore.setState({ interactive });
  });
}
```

### 8.3 Plugin 状态

每个 Plugin 维护自己的 Zustand store slice，通过事件同步跨窗口状态：

```typescript
// packages/plugin-organizer/src/store/organizer-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizerState {
  grids: GridBox[];
  items: DesktopItem[];
  // ... actions
}

export const useOrganizerStore = create<OrganizerState>()(
  persist(
    (set, get) => ({
      grids: [],
      items: [],
      // ... actions with event broadcasting
    }),
    { name: 'xai-organizer' }
  )
);
```

---

## 九、执行计划 (3 Wave)

> 三大波次，每波有明确的入口条件和出口标准。
> 核心原则：每波结束后 `pnpm dev` 仍可正常运行，零功能回归。

### Wave 1: 文档体系 + Core 包 + 边界定义

**目标:** 建立文档驱动基础设施，创建 @repo/core，划清 Host / Core / Plugin 三层边界

**任务:**

**Part 1 — 文档重构 (详见 §3½.8):**

| 步骤 | 操作 | 风险 |
|------|------|------|
| 1.D1 | 创建 `docs/archive/` 目录 + `README.md` | 无 |
| 1.D2 | 删除 6 个 DEAD 文件 (空白 checklist + 描述已删代码的文档) | 无 |
| 1.D3 | 移动 `testing/` 全部 10 个存活文件到 `archive/testing/` | 无 |
| 1.D4 | 移动 `reports/` 全部 5 个存活文件到 `archive/reports/` | 无 |
| 1.D5 | 移动 `development/` 5 个文件到 `archive/development/` | 无 |
| 1.D6 | 移动 `architecture/` 2 个文件到 `archive/architecture/` | 无 |
| 1.D7 | 移动 `reference/codebase_tree.md` 到 `archive/reference/` | 无 |
| 1.D8 | 移动 `_INDEX.md` 到 `archive/` | 无 |
| 1.D9 | 删除空的 `testing/`, `reports/`, `development/`, `architecture/`, `reference/` 目录 | 无 |
| 1.D10 | 删除 `conventions/DEV_LOG_TEMPLATE.md` (模板已在本文档 §3.5 重定义) | 无 |
| 1.D11 | 新建 `docs/adr/` + `TEMPLATE.md` | 无 |

**Part 2 — 新建核心文档:**

| 步骤 | 操作 | 风险 |
|------|------|------|
| 1.1 | 新建 `docs/SYSTEM_ARCHITECTURE.md` (吸收 architecture/ 两文件内容) | 无 |
| 1.2 | 新建 `docs/PLUGIN_MAP.md` (吸收 PROGRESS_SNAPSHOT 状态) | 无 |
| 1.3 | 新建 `docs/CORE_INFRA.md` (吸收 codebase_tree 路径参考) | 无 |

**Part 3 — 代码基础设施:**

| 步骤 | 操作 | 风险 |
|------|------|------|
| 1.4 | 创建 `packages/core/` 包骨架 (package.json, tsconfig, src/index.ts) | 低 |
| 1.5 | 在 `@repo/core/types` 中定义全局类型 (从 plugin-organizer/types.ts 提升 GridBox, DesktopItem 等) | 低 |
| 1.6 | 在 `@repo/core/events` 中创建类型安全事件层 (emitter.ts, listener.ts, protocol.ts) | 低 |
| 1.7 | 在 `@repo/core/registry` 中创建 PluginRegistry 骨架 (空实现即可) | 低 |
| 1.8 | plugin-organizer/docs/ 创建四件套 | 无 |
| 1.9 | 添加 Vitest 配置到 monorepo 根 + packages/core | 低 |
| 1.10 | 更新 CLAUDE.md 中的文档路径引用 | 无 |
| 1.11 | 验证 `pnpm build` 和 `pnpm dev` 正常 | 低 |

**Wave 1 出口标准:**
- [ ] docs/ 清理完成: 8 个活跃文件 + archive/ 归档 24 个历史文件
- [ ] 全局三件套文档已就位 (SYSTEM_ARCHITECTURE + PLUGIN_MAP + CORE_INFRA)
- [ ] `@repo/core` 包可正常 build 和 import
- [ ] 类型安全事件系统可编译
- [ ] PluginRegistry 骨架存在
- [ ] plugin-organizer 四件套文档已创建
- [ ] adr/ 目录已创建 (含模板)
- [ ] Vitest 可运行 (至少有 1 个 placeholder test)
- [ ] 现有功能零影响 (`pnpm dev` 正常)
- [ ] `git diff --stat` 确认无意外删除

---

### Wave 2: 前端拆分 (Host 瘦身 + Plugin 独立)

**目标:** Host 层零业务逻辑，所有业务迁入 plugin-organizer，PluginRegistry 接管渲染

**前置条件:** Wave 1 完成

**迁移顺序 (按依赖关系):**

```
批次 A (基础设施迁移 — 不影响功能):
  1. 提升 types: plugin-organizer/types.ts → @repo/core/types (保留 re-export 兼容)
  2. 迁移 InteractiveContext → @repo/core/store (Zustand 化)
  3. 迁移 useGlobalMouse → @repo/core/hooks/

批次 B (业务逻辑回归 Plugin):
  4. 迁移 useGridWindow → plugin-organizer/hooks/
  5. 迁移 useMultiWindowGrids → plugin-organizer/hooks/
  6. 迁移 OrganizerLayer → plugin-organizer/components/
  7. 替换现有 Tauri 事件调用为 @repo/core/events 类型安全版本

批次 C (Host 瘦身):
  8. GridWindowApp → windows/GridWindow.tsx (瘦身为 PluginHost 壳)
  9. ControlWindowApp → windows/ControlWindow.tsx (瘦身为 PluginHost 壳)
  10. AiCube.tsx → packages/plugin-ai-cube/ (骨架 + 注册)
  11. SettingsPanel.tsx → packages/plugin-settings/ (骨架 + 注册)
  12. App.tsx 瘦身为 Provider + PluginHost

批次 D (UI 组件提升):
  13. 从 SmartContainer 抽取通用 resize/drag UI 到 packages/ui/
  14. resize-handles.css → packages/ui/interactive/
  15. DndProvider.tsx → apps/desktop/src/providers/
```

**每个迁移步骤的检查清单:**

```
□ 1. 在目标位置创建文件
□ 2. 复制逻辑并修正 import 路径
□ 3. 在原位留下 re-export 兼容层
□ 4. 更新 plugin-organizer/index.ts 导出
□ 5. 运行 pnpm build 验证
□ 6. 运行 pnpm dev 手动验证功能
□ 7. 确认无运行时错误后删除兼容层
□ 8. 更新 PLUGIN_MAP.md 状态
□ 9. 更新 dev_log.md
```

**Wave 2 出口标准:**
- [ ] apps/desktop/src/ 无业务逻辑文件 (仅路由 + Provider + 窗口壳)
- [ ] Host 依赖链: `apps/desktop → @repo/core + @repo/plugin-* + @repo/ui`
- [ ] 所有 Tauri 事件调用使用 @repo/core/events 类型安全版本
- [ ] PluginRegistry 正确注册并渲染 plugin-organizer
- [ ] plugin-organizer 所有 hooks 和组件在 plugin 包内自包含
- [ ] packages/ui/ 至少包含 ContainerFrame, ResizeHandles, DragHandle
- [ ] `pnpm dev` 功能零回归
- [ ] `pnpm build` 零 TypeScript error

---

### Wave 3: Rust 后端模块化 + 基础设施补全

**目标:** Rust 后端模块化 + 状态管理 Zustand 化 + 测试补全 + 安全加固

**前置条件:** Wave 2 完成

**Rust 后端任务:**

| 步骤 | 操作 | 风险 |
|------|------|------|
| 3.R1 | 创建 `src/commands/mod.rs` + `src/commands/window.rs` | 低 |
| 3.R2 | 迁移 create/update/close_grid_window 到 commands/window.rs | 低 |
| 3.R3 | 创建 `src/platform/macos/mod.rs` + `window_ext.rs` | 低 |
| 3.R4 | 抽取 NSWindow/CGWindowLevel/ignoresMouseEvents 逻辑到 window_ext.rs | 中 |
| 3.R5 | lib.rs 瘦身为纯 builder 配置 | 低 |
| 3.R6 | 启用 `tauri.conf.json` CSP (允许 Tauri IPC) | 中 |
| 3.R7 | 删除 `greet` command | 无 |

**状态管理任务:**

| 步骤 | 操作 | 风险 |
|------|------|------|
| 3.S1 | 添加 Zustand 依赖到 @repo/core | 低 |
| 3.S2 | 创建 app-store.ts (全局状态) | 低 |
| 3.S3 | 创建 organizer-store.ts (替代 useGridSystem Context) | 中 |
| 3.S4 | 实现 Tauri 事件 ↔ Zustand 双向同步 (store/sync.ts) | 中 |
| 3.S5 | 移除 SettingsContext → Zustand store | 低 |
| 3.S6 | 移除 InteractiveContext (已在 Wave 2 迁移) | 低 |

**测试补全任务:**

| 步骤 | 操作 | 风险 |
|------|------|------|
| 3.T1 | 为 @repo/core/events 写单元测试 | 低 |
| 3.T2 | 为 PluginRegistry 写单元测试 | 低 |
| 3.T3 | 为 plugin-organizer 核心 hooks 写测试 (useGridSystem, useContainerManager) | 低 |
| 3.T4 | 为 Rust commands 写 cargo test | 低 |
| 3.T5 | 在 turbo.json 中添加 `test` pipeline | 低 |

**清理任务:**

| 步骤 | 操作 |
|------|------|
| 3.C1 | 删除 `_probe_delete_me` |
| 3.C2 | 修复 isTauri 硬编码 (OrganizerLayer 第 27 行) |
| 3.C3 | 更新 CLAUDE.md 反映新架构 |
| 3.C4 | 更新 README.md |

**Wave 3 出口标准:**
- [ ] lib.rs 瘦身到 <50 行
- [ ] commands/ 和 platform/ 模块化完成
- [ ] CSP 已启用
- [ ] Zustand store 替代所有 React Context 状态管理
- [ ] 跨窗口状态同步通过 store/sync.ts 自动化 (无手工事件广播)
- [ ] Vitest 测试覆盖 @repo/core + plugin-organizer 核心逻辑
- [ ] cargo test 通过
- [ ] `pnpm dev` 功能零回归
- [ ] CLAUDE.md 和 README.md 已更新

---

## 十、风险控制

### 10.1 风险登记表

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 多窗口 Zustand 同步导致状态不一致 | 高 | 先用 localStorage persist 保底；事件同步作为增强层；每步手动验证 |
| plugin-organizer 迁移破坏拖放功能 | 高 | 每批次迁移后必须在真实 macOS 上测试拖放 + 调整大小 + 折叠 |
| PluginRegistry 增加首屏渲染延迟 | 中 | Registry 是同步注册 (import-time)，非异步加载；监控 `pnpm dev` 启动时间 |
| CSP 启用后阻断 Tauri IPC | 中 | 渐进式：先 `default-src 'self'; script-src 'self' 'unsafe-eval' ipc: tauri:` |
| Rust 重构导致编译失败 | 低 | Rust 模块拆分是纯结构重组，每步 `cargo build` 验证 |
| monorepo 循环依赖 | 中 | 严格单向: Host → Plugin → Core/UI；turbo.json `dependsOn: ["^build"]` 验证 |

### 10.2 回滚策略

- 每个 Wave 在独立 Git 分支上执行
- 每个批次完成后打 tag (`wave-1-done`, `wave-2-batch-a-done`, ...)
- 兼容层 re-export 保证渐进式迁移，任何步骤失败可回退到上一步
- Wave 2 是风险最高的阶段，建议每批次结束后 commit + 测试，不要跨批次合并

### 10.3 不做什么

以下明确排除在本次重构范围之外：

- **不做运行时动态插件加载** — 桌面应用编译时确定插件集，不需要运行时 discover
- **不做新功能** — Todo/Pomodoro/Clipboard 等在重构后的新 Plugin 中从零开发，不在此方案内
- **不做 apps/web/ 和 apps/docs/ 清理** — 保留为 scaffold，不影响桌面应用
- **不做数据库迁移** — 当前用 localStorage，SQLite 是未来目标 (PRD §8)，不在此次
- **不做 CI/CD** — 暂无 GitHub Actions，后续单独规划

---

## 十一、成功标准

### 11.1 定量标准

| 指标 | 现状 | 目标 |
|------|------|------|
| docs/ 活跃文件数 | 35 散乱 | 8 活跃 + archive/ |
| docs/ AI 上下文入口 | 无 (需扫描 35 文件) | 三件套 + plugin 四件套 |
| apps/desktop/src/ 业务代码行数 | ~1200 行 | <100 行 (仅路由 + 壳) |
| lib.rs 行数 | 334 行 | <50 行 |
| packages/core/ | 不存在 | 类型 + 事件 + Store + Registry 完整 |
| packages/ui/ 组件数 | 3 | 10+ |
| 测试文件数 | 0 | 10+ |
| TypeScript error | 0 | 0 |
| 功能回归 | — | 0 |

### 11.2 定性标准

- **新 Plugin 开发路径清晰:** 创建 packages/plugin-xxx/ → 写 manifest.json → 注册到 PluginRegistry → Host 自动渲染
- **跨窗口通信有类型保障:** 新增事件只需在 EventMap 中加一行类型定义
- **AI 协作效率提升:** PLUGIN_MAP.md 是 AI 的白名单，四件套文档是 AI 的上下文
- **团队可扩展:** 不同 Plugin 可以并行开发，互不干扰

---

## 附录 A: 参考资料

- [Any2Knowledge REFACTORING_PLAN v2.3](../../../AI_Sheet/Any2Knowledge_Agent_System/docs/REFACTORING_PLAN.md) — 微内核 + FSD + Doc-Driven 模式的成熟实践
- [XAI_Desktop PRD v1.1](2026-05-12-PRD-v1.md) — 产品需求文档
- [XAI_Desktop Product Development Plan v1](2026-05-12-product-development-plan-v1.md) — 产品开发计划
- [CLAUDE.md](../../CLAUDE.md) — 项目指南 (重构后需更新)

## 附录 B: Feature 目录名约定

所有 Plugin 目录统一使用 kebab-case：

```
packages/plugin-organizer/
packages/plugin-todo/
packages/plugin-pomodoro/
packages/plugin-habits/
packages/plugin-clipboard/
packages/plugin-widgets/
packages/plugin-meditation/
packages/plugin-ai-cube/
packages/plugin-settings/
```

npm 包名使用 `@repo/plugin-<name>` 格式。

## 附录 C: 迁移期 Import 兼容策略

采用 re-export 过渡，防止运行时崩溃：

```typescript
// 过渡期: packages/plugin-organizer/src/types.ts
// GridBox 等类型已提升到 @repo/core/types

// 保留兼容 re-export
export type { GridBox, DesktopItem, PersistedLayout } from '@repo/core/types';

// 过渡期: apps/desktop/src/hooks/useGridWindow.ts
// 已迁移到 plugin-organizer

/**
 * @deprecated 已迁移到 @repo/plugin-organizer/hooks
 */
export { useGridWindow } from '@repo/plugin-organizer';
```

每个迁移完成并通过测试后，删除对应的兼容层文件。
