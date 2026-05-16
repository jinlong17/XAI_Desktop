# SYSTEM_ARCHITECTURE.md — 系统宪法

> 本文档定义 XAI_Desktop 的架构约束与编码红线。
> 所有开发(人类和 AI)必须遵守此文档中的规则。
>
> 配套文档:
> - `TECHNICAL_REQUIREMENTS.md` — 技术实施标准(测试/性能/安全/构建/依赖/抽象)
> - `CORE_INFRA.md` — 基础设施 API 参考
> - `PLUGIN_MAP.md` — 所有 plugin 状态机
> - `planning/2026-05-12-PRD-v1.md` — 产品规格(source of truth)
>
> 最后更新: 2026-05-14 · 对齐 PRD v1.6-draft

---

## 1. 架构流派

- **前端:** 微内核 (Microkernel) — Host 壳 + Plugin 业务层
- **Rust:** 模块化命令 + macOS 平台适配层(预留 Win/Linux trait 接口)
- **通信:** Plugin 间通过 Tauri 事件系统或 `@repo/core/events`,禁止直接 import 内部模块
- **产品形态:** 三个面共享同一数据层 ——
  1. 桌面 overlay 模式(Main + Control + Grid + Widget 浮窗 + 桌宠)
  2. 控制台模式(独立三栏窗口:sidebar + list + detail)
  3. 网页版(控制台的浏览器构建,Phase 4.5)

## 2. 技术栈版本锁定

| 技术 | 版本 | 备注 |
|------|------|------|
| Tauri | 2.x | **`macOSPrivateApi: false`**(MAS 双轨要求,改用基础透明,不用 Tauri 私有 API 路径) |
| React | 19.x | 函数式组件 + Hooks |
| TypeScript | 5.x | strict mode |
| Vite | 7.x | 前端构建 |
| Rust | 1.80+ | Tauri 后端 |
| pnpm | 9.x | 包管理 |
| Turborepo | 2.6+ | Monorepo 编排 |
| SQLite(via `tauri-plugin-sql`) | 最新 | 本地数据层(Phase 0 取代 localStorage) |
| Supabase JS SDK | 最新 | 后端 Auth + Postgres + Realtime |

## 3. 三层边界规则

```
apps/desktop/src/     → Host 壳 (路由 + Provider + PluginHost 渲染,不含业务)
apps/web/             → Web 入口 (Phase 4.5,复用 plugin-console + plugin-* 业务模块)
packages/core-*/      → 基础设施 (类型 + 事件 + Store + Registry + Repo + FS abstraction,不含业务)
packages/plugin-*/    → 业务插件 (所有业务逻辑的唯一归宿)
packages/ui/          → 共享 UI (无业务逻辑的纯 UI 组件)
```

- **Host** (`apps/desktop/src/`、`apps/web/`):窗口/页面壳 + 路由 + 全局 Provider。禁止放业务逻辑
- **Plugin** (`packages/plugin-*/`):业务功能自治单元。禁止跨 Plugin 直接 import 内部模块
- **Core** (`packages/core-*/`):基础设施 + 共享类型。所有 Plugin 可依赖 Core
- **UI** (`packages/ui/`):共享 UI 组件库。无业务逻辑
- 依赖方向严格单向:`Host → Plugin → Core / UI`,禁止反向

## 4. 编码红线

1. 禁止在 Host 写业务逻辑 → 业务代码必须在 plugin 包内
2. 禁止跨 Plugin 直接 import 对方 `src/` 内部模块
3. Plugin 间通信必须通过 `@repo/core/events` 的类型安全事件
4. 禁止在 Plugin 内直接调用 `@tauri-apps/api` → 通过 `@repo/core/hooks` 封装(Web 复用必需)
5. 所有 Tauri 事件 payload 必须在 `@repo/core/types` 中定义类型
6. 每个 Plugin 的 `manifest.json` 是注册的唯一入口
7. 禁止使用 `console.log` / `println!` 做生产日志 → 用 `core-data/logger` 或 Rust `tracing`
8. 依赖方向严格单向:`Host → Plugin → Core / UI`,禁止反向
9. `index.ts` 是每个 Plugin 的唯一出口 → 外部只能从 `packages/plugin-*/src/index.ts` 导入
10. Plugin 内部目录结构自由组织 → `components/` `hooks/` `store/` `types/` 按需存在
11. UI 组件归属:通用组件 → `packages/ui/`;业务组件 → plugin 内部
12. 禁止运行时动态插件加载 → 桌面应用编译时确定插件集,静态 import 注册;插件市场走"读 GitHub 静态目录 + 用户手动下载 zip 解压"路径
13. **禁止在 Plugin 直接调用原生 API** → 走 `core-fs` / `core-window` / `core-shortcuts` 等 Core 抽象(双 target + Web 复用要求)
14. **禁止启用 `macOSPrivateApi`** → MAS 沙箱版会被拒;基础透明已够用

## 5. 多窗口架构

### 5.1 窗口分类

| 类型 | Label 模式 | 用途 | 交互模式 |
|------|-----------|------|---------|
| `main` | `main` | 全屏透明 overlay | 默认点击穿透 (`ignoresMouseEvents: YES`) |
| `control` | `control` | AI Cube 控制托盘(360×360) | 始终可交互 |
| `grid_<id>` | `grid_xxx` | 独立 Grid 窗口 | 始终可交互 |
| `widget_<id>` | `widget_xxx` | Widget 浮窗(时钟/天气/进度条/桌宠) | 始终可交互 |
| **`console`** | `console` | 整体控制台(三栏窗口,Phase 2.5) | 始终可交互,标准 macOS 窗口 |
| `clipboard` | `clipboard` | 剪贴板面板(Phase 2,快捷键唤起) | 始终可交互,临时窗口 |
| `settings` | `settings` | 偏好设置 | 始终可交互 |

> 网页版(Phase 4.5)= 控制台的浏览器构建,**不是新窗口**,而是 plugin-console 的 web target。

### 5.2 macOS 窗口层级

所有窗口使用 `CGWindowLevelForKey(DesktopIconWindow)` 作为基准:

- **main 窗口:** `desktop_icon_level + 1`,始终 click-through
- **control / widget 窗口:** `desktop_icon_level + 2`,可交互
- **grid 窗口:** `desktop_icon_level + 3`,可交互,置于 icon 之上
- **console 窗口:** 标准应用窗口层级,不参与 overlay 分层
- **clipboard / settings:** 标准浮动 panel 层级

所有 overlay 类窗口加入 `NSWindowCollectionBehavior`: `canJoinAllSpaces + stationary + ignoresCycle`。
console / settings 等标准窗口使用默认 collection behavior。

> ⚠️ **窗口分层悖论是 R-00 风险**:R-00 spike(Phase 0 子阶段 0.1)必须先验证点击穿透 + 文件拖入在真机上有干净解,再投入后续 Phase。

### 5.3 Pointer-Events 策略

- 根容器 `pointer-events: none` 实现桌面点击穿透
- 交互元素 (SmartContainer, AiCube, SettingsPanel, Pet) 显式设置 `pointer-events: auto`
- 每个 Grid / Widget 独立原生窗口,不受主窗口 pointer-events 限制
- Console / Web 是普通窗口/浏览器,不涉及 pointer-events 穿透

## 6. 跨窗口通信规则

- 所有事件通过 `@repo/core/events` 发送,payload 必须可序列化
- 事件命名:`<plugin>:<action>`,禁止使用 `window.postMessage`,禁止直接操作其他窗口的 DOM
- 事件按相关实体 scope(如 grid_id / list_id / board_id),避免广播污染

### 6.1 事件前缀约定

| 前缀 | 归属 | 示例 |
|------|------|------|
| `app:` | 全局/Host | `app:interactive-mode-changed` |
| `organizer:` | plugin-organizer | `organizer:grid-update` |
| `productivity:` | plugin-productivity(todo + 番茄 + 习惯) | `productivity:todo-completed` / `productivity:pomodoro-started` |
| `clipboard:` | plugin-clipboard | `clipboard:item-copied` |
| `widgets:` | plugin-widgets(时钟/天气/便签/进度条/冥想) | `widgets:clock-tick` / `widgets:progress-updated` |
| `calendar:` | plugin-calendar(桌面日历) | `calendar:aggregated-refresh` |
| `console:` | plugin-console(整体控制台) | `console:navigate-module` |
| `project:` | plugin-project(项目管理) | `project:card-moved` |
| `labels:` | plugin-labels(全局 Label) | `labels:assigned` / `labels:unassigned` |
| `account:` | plugin-account(账号+同步) | `account:sync-status-changed` / `account:login` |
| `ai:` | plugin-ai(AI Cube + 桌宠 AI) | `ai:query-response` / `ai:pet-hatched` |
| `pet:` | plugin-widgets(桌宠子模块,事件单独前缀) | `pet:state-changed` |
| `web:` | apps/web | `web:sync-pull-completed` |

## 7. 状态持久化

- **本地数据层:SQLite**(`tauri-plugin-sql`),Phase 0 取代 localStorage
- 完整 Schema 见 PRD §8(约 25 张表:grids / grid_items / todos / labels / label_assignments / boards / board_lists / board_cards / progress_trackers / pets / clipboard_items / habits / habit_logs / pomodoro_sessions / accounts / sync_state / settings / plugins 等)
- 数据访问层 `core-data` 提供双 driver:**SQLite driver**(桌面)+ **REST driver**(Web,直连后端 API)
- 同步元数据走 `sync_state` 表 + Supabase Realtime
- 敏感字段加密见 `TECHNICAL_REQUIREMENTS.md §2`

> localStorage 迁移完成后**禁止**再新增 localStorage 用法(除浏览器 UI 偏好如 sidebar 折叠状态)

## 8. DnD 系统

- 使用 `@dnd-kit/core`
- `GridItem` / `Board Card` / `Clipboard Item` 等为 draggable,各自容器为 droppable
- 跨容器拖拽通过 `core-events` 通知相关 plugin,避免直接修改对方状态
- 全局 DnD Provider 在 Host 层提供(Web 与桌面共用同一 Provider)

## 9. Rust 后端模块结构

```
apps/desktop/src-tauri/src/
├── main.rs                 # Tauri entry point
├── lib.rs                  # Builder 配置 — 注册 command 模块 + setup (<100 行)
├── commands/
│   ├── mod.rs              # 模块声明
│   ├── window.rs           # create/update/close 窗口
│   ├── fs.rs               # 文件系统命令(走 platform::FileSystemOps)
│   ├── clipboard.rs        # 剪贴板命令
│   ├── shortcut.rs         # 全局快捷键
│   └── notification.rs     # 系统通知
└── platform/
    ├── mod.rs              # pub use traits + platform re-exports
    ├── traits.rs           # WindowOps / ClipboardOps / FileSystemOps / NotificationOps / ShortcutOps
    ├── macos/
    │   ├── mod.rs
    │   ├── window.rs       # NSWindow / CGWindowLevel / ignoresMouseEvents 实现
    │   ├── clipboard.rs    # NSPasteboard 实现
    │   ├── fs.rs           # NSWorkspace 图标 + security-scoped bookmark
    │   ├── shortcut.rs     # Carbon HotKey 注册
    │   └── notification.rs # UserNotifications framework
    ├── windows/            # Phase 5+ 占位,trait `unimplemented!()`
    └── linux/              # Phase 5+ 占位
```

- `lib.rs` 只做 builder 配置和模块注册,禁止放业务逻辑(< 100 行硬约束)
- 按领域拆分 commands(window / fs / clipboard / shortcut / notification)
- macOS 平台代码集中在 `platform/macos/`,用 `#[cfg(target_os = "macos")]` 隔离
- **所有 commands 通过 platform trait 调用原生** —— 不允许 commands 直接 import `cocoa` / `objc`
- **Cargo features:** `full`(DMG 版,无沙箱) / `sandbox`(MAS 版,文件访问走 bookmark)

详细 trait 契约见 `TECHNICAL_REQUIREMENTS.md §4`。

## 10. 新建 Plugin 标准路径

```
1. 创建 packages/plugin-xxx/ (含 package.json, tsconfig.json, manifest.json)
2. 实现 src/index.ts + 业务组件/hooks
3. 创建 docs/ 四件套 (design.md, api.md, test.md, dev_log.md)
4. 在 apps/desktop/src/main.tsx 添加 import 注册
5. 若 plugin 在 Web 也复用(如 plugin-productivity / plugin-console),同步在 apps/web/ 注册
6. 更新 docs/PLUGIN_MAP.md 状态列
```

## 11. 明确排除项 (不做什么)

以下明确不在 v1 项目范围内:

- **不做运行时动态插件加载** — 编译时确定插件集
- **不做完整插件市场后端** — v1 只做"机制 + GitHub 静态目录"(读官方 repo 的 plugin-registry.json)
- **不做 apps/docs/ 清理** — 保留为 scaffold
- **不做 Windows / Linux 适配** — v1 仅 macOS + 网页版;Rust 侧 trait 预留 Phase 5+ 接口
- **不做团队协作 / 多人共享 / @提及** — v1 单人
- **不做 Trello 风格的 Power-Ups / Butler 自动化** — 项目管理只做核心看板
- **不做 Mac App Store 私有 API 路径** — macOSPrivateApi 必须 false,DMG 版也是
- **不做第三方分析 SDK 集成** — Firebase / Mixpanel / Google Analytics 等一律不引入
- **不做桌面宠物的养成系统 / 商店 / 多宠物同屏** — v1 桌宠定位为陪伴 + 状态指示器

> v1 范围拍板(2026-05-12 已定):**v1 = PRD 全部 16 个模块**,不做 v1/v1.5/v2 三档切分。详见 `planning/2026-05-12-product-development-plan-v1.md §7`。

## 12. 技术规范文档导航

| 关心什么 | 看哪里 |
|---|---|
| 架构红线 / 不变规则 | 本文档 |
| **Plugin 接口契约表(manifest / EventMap / PluginRegistry API / SDK)** | **`PLUGIN_SDK.md`** ★ |
| 测试 / 性能 / 安全 / 构建 / 依赖 / 抽象 traits 具体实施标准 | `TECHNICAL_REQUIREMENTS.md` |
| 关键 API 与文件路径 | `CORE_INFRA.md` |
| 各 plugin 当前状态 | `PLUGIN_MAP.md` |
| 关键架构决策的依据 | `adr/NNNN-*.md`(0001 静态插件注册 / 0002 双轨发布 / 0003 三个面 / 0004 Label 多态) |
| Phase 0 子阶段 0.2/0.3 执行手册 | `planning/REFACTORING_PLAN.md`(详细重构步骤) |
| 产品规格(FR / Schema / 路线图) | `planning/2026-05-12-PRD-v1.md`(主 PRD,产品总览) |
| 整体控制台深度规格 | `planning/sub-prds/console/{PRD,dev-plan}.md` |
| 网页版深度规格 | `planning/sub-prds/web/{PRD,dev-plan}.md` |
| 同步通道协议级规格 | `planning/sub-prds/sync/{PRD,dev-plan}.md` |
| 战略概览 + 决策快照 | `planning/2026-05-12-product-development-plan-v1.md` |
| Workflow V2 流程 | `workflow/SUBAGENT_WORKFLOW_V2.md` |
| Commit 格式 | `conventions/COMMIT_CONVENTION.md` |
