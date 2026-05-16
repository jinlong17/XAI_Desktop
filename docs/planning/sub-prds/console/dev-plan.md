# Console 子开发方案

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §5.13 / §10.6)|
| 子 PRD | `docs/planning/sub-prds/console/PRD.md`(v0.2-rev1-DRAFT,2026-05-16) |
| 归属 Phase | Phase 2.5(M2 → M3 之间) |
| 时间窗 | 4-6 周(主 PRD §10.6 给的 Phase 2.5 总预算 = 4-6 周,与 plugin-project 并行 / 共用三栏外壳;本文档按 5 周排) |
| 进入条件 | Phase 2 验收通过(productivity / labels / clipboard 全部 Stable)+ M2 真机验收过 |
| 出口条件 | Console PRD §9.1 ~ §9.5 四层验收(Shell + Module + Project + 灰显占位 + Cross-Window)全过 + dev_log 状态 = READY_FOR_VERIFY |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 最后更新 | 2026-05-16(rev1) |
| 状态 | v0.2-rev1-DRAFT(对齐 Console PRD v0.2-rev1) |

---

## 1. Phase 2.5 目标

主 PRD §10.6 给 Phase 2.5(整体控制台 + 项目管理)总预算 4-6 周。本文档**只**覆盖 Console 部分,与 plugin-project 并行开发:

- Console:5 周(本文档)
- 项目管理(plugin-project):3-4 周(另文档),与 Console 并行第 2-4 周
- 收尾整合:第 5 周末两者一起 M2.5 验收

Phase 2.5 的 Console 目标(对齐 PRD v0.2 §0.2 优先级体系):

1. **plugin-console 包从 Planned → Stable(P0-Shell)**:三栏外壳 + sidebar 渲染 + 模块切换 + 设置容器壳 + Cmd+K 搜索壳 + 通知中心壳 + SearchProvider/SettingsSection/NotificationTab/labelEntityResolver 四个 slot 协议落地
2. **所有 Phase 2 已 Stable 的业务 plugin 接通 ConsoleView slot(P0-View)**:productivity(任务 / 四象限 / 番茄 / 习惯)/ labels / progress
3. **与 plugin-project 联调(P0-Project)** ConsoleView slot(看板 / 表格)
4. **桌面日历 / 习惯热力图模块灰显(P0-Shell 占位侧)**:sidebar 显示但灰显;tooltip "Phase 3 上线";点击不切 activeModule;stub plugin-calendar 不报错
5. **Console ↔ overlay 数据实时一致(P0-Shell)**:走 core-events + entity_change_log + ack + reconcile(对齐 PRD §5.10),M2.5 末必须真机验收通过 §9.5 X-01 ~ X-06
6. **PLUGIN_SDK 更新(W1 D1 硬阻塞)**:按 PRD §7.2.1 完整 ConsoleViewProps / ConsoleHostCapabilities / ConsoleSlotApi / FocusApi / SelectionApi / TelemetryApi 落地
7. **架构债清结**:core-data 双 driver 接口落地(SQLite 已就位,REST 占位 trait 加上)+ entity_change_log 表 schema(与 sync 子 PRD 协调)

非 Phase 2.5 目标(留 Phase 3+,对齐 PRD v0.2 P1-Phase3):

- 桌面日历 ConsoleView 完整(Phase 3 由 plugin-calendar 提供)
- 习惯增强(年度热力图)(Phase 3)
- 5 步 Onboarding tour(Phase 3)
- 长按 Cmd cheat sheet(P0 已改为 `?` 键弹浮层)
- 设置搜索 / 设置回滚(Phase 3)
- Label 层级(Phase 3)
- 命令面板 Cmd+Shift+K 系统全局形态(Phase 3 评估)
- Phase 4 AI 输出 tab(plugin-ai 动态注册)
- 网页版宿主壳(Phase 4.5)

---

## 2. 前置依赖

### 2.1 依赖图

```
              ┌─────────────────┐
              │  Phase 0 完成   │
              │  core-* 4 个包  │
              │  地基稳定       │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  Phase 1 完成   │
              │  organizer      │
              │  Stable         │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  Phase 2 完成   │
              │  productivity   │
              │  labels         │
              │  clipboard      │
              │  全部 Stable    │
              └────────┬────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   Phase 2.5      │
              │                  │
              │  plugin-console  │
              │     ＋           │
              │  plugin-project  │  (并行)
              │                  │
              └──────────────────┘
```

### 2.2 硬前置(进入 Phase 2.5 前必须 Stable)

| 依赖 | 状态要求 | 用途 | 阻塞动作(若未达标)|
|---|---|---|---|
| `@repo/core-data`(SQLite driver) | Stable | 所有模块数据访问 | 延后 Phase 2.5 |
| `@repo/core-events` + EventMap 全集 | Stable | 跨窗口通信 | 延后 Phase 2.5 |
| `@repo/core-shortcuts` | Stable | 注册 Console 内快捷键 | 延后 Phase 2.5 |
| `@repo/ui` | Stable | List / Card / Dialog / Toast / Input 等基础组件 | M2.5 第 1 周补齐缺口 |
| `plugin-organizer` | Stable | overlay ↔ Console 数据互通验证 | 验收时降级为只验单边 |
| `plugin-productivity` | Stable | Console 任务/番茄/习惯模块的 ConsoleView 来源 | **硬阻塞**,延后 Phase 2.5 |
| `plugin-labels` | Stable | 标签管理模块 | **硬阻塞** |
| Rust 侧 `WindowOps`(console window) | 实现 | 创建/关闭 console 窗口 | M2.5 第 1 周补 |

### 2.3 软前置(可并行 / Phase 2.5 内交付)

- `plugin-project`(项目模块的 ConsoleView):与 Console 并行做,M2.5 末联调
- `plugin-calendar`:Phase 3 才补,Phase 2.5 sidebar 显示但灰显
- `plugin-widgets`(时间进度条):Phase 3 才完整;Phase 2.5 内 progress-tracker 子模块若已就位则接入,否则灰显

---

## 3. 任务分解(5 周拆解)

> 按 day-level 排;每天 4-6 工作小时;每周末 1 天作 buffer / 真机测试。

### 第 1 周 · 骨架 + 接口契约(D1-D5)

**目标**:plugin-console 包骨架 + 三栏布局 + sidebar 渲染 + 模块切换 framework 跑通(用 stub ConsoleView 验证)+ **PLUGIN_SDK 按 PRD §7.2.1 完整契约更新(硬阻塞,W1 D1 完成)**。

| 日 | 任务 | 交付 |
|---|---|---|
| **D1(硬阻塞)** | **PLUGIN_SDK §3.1 / §3.3 按 PRD §7.2.1 更新**:加 `ConsoleViewProps` / `ConsoleHostCapabilities` / `ConsoleSlotApi` / `FocusApi` / `SelectionApi` / `TelemetryApi` + `SearchProvider` + `SettingsSection` + `NotificationTab` + `LabelEntityResolver` 协议接口。manifest schema 加 `windows.console` + `ui.consoleSidebar` 校验。**所有后续 plugin 实装 ConsoleView 都必须按此契约**。同步创建 `packages/plugin-console/` scaffold + Rust window commands | PLUGIN_SDK PR + scaffold |
| D2 | `<ConsoleHost />` 主组件:三栏布局 CSS + 拖动分隔条 + 键盘 `Cmd+Option+←/→/0` 等价 + 标题栏 NSToolbar accessory(Rust 侧 native command 注入 search icon / bell / avatar) | ConsoleHost 渲染纯壳;键盘 + 鼠标双路径 |
| D3 | Sidebar 组件:从 `pluginRegistry.getConsoleSidebarEntries()` 渲染;**支持 disabled / 灰显占位**;模块切换 state(本地 Zustand)+ `Cmd+1-9` 跳前 9 个非灰显模块 + 路由 v0.1 旧 state 自动降级 | Sidebar 切换 stub ConsoleView + 灰显逻辑 |
| D4 | nav-state 持久化:写 `settings.console.*` key + sync_scope 列(对齐 sync 子 PRD);窗口 frame 持久化;首关非阻塞 toast | 重启 Console 状态恢复 |
| D5(周末)| 真机:macOS Sonoma + Sequoia 双系统测 §5.8.2 S-01 ~ S-04(基础多 Space + 多屏) + Cmd+W/M/Q | 第 1 周末 demo + S-01 ~ S-04 通过 |

**第 1 周末验收**:Console 窗口能开 / 关(隐藏)/ 最小化 / 全屏;**PLUGIN_SDK 完整契约已合并主分支**;sidebar 显示所有声明了 `ui.consoleSidebar` 的 plugin(目前为 stub,calendar 是灰显占位);Cmd+1-9 切换 stub view;关闭再开恢复状态;PRD §5.8.2 S-01 ~ S-04 通过。

### 第 2 周 · 业务模块接入(D6-D10)

**目标**:plugin-productivity 提供 ConsoleView,Console 内的任务/番茄/习惯/四象限模块跑通。**习惯热力图改 Phase 3 不做**。

| 日 | 任务 | 交付 |
|---|---|---|
| D6 | `plugin-productivity` 实现 ConsoleView(任务模块):中栏列表(virtualized) + 右栏详情表单;描述区**纯文本 + 链接,不支持图片粘贴**;简化重复 picker(5 选项) | 任务 CRUD 在 Console 内可用;无附件无图片粘贴(对齐 PRD §5.4.1 收敛) |
| D7 | 任务模块完善:子任务(拖 + Cmd+Option+↑/↓ 键盘等价) / Markdown 描述 / 提醒 / 简化重复 picker;list 全键盘可达(j/k, Space, Enter, N, D, P, L, M)+ **多选严格收敛:仅 Delete/Backspace 批删除**(批 Label / 批移清单已降 P2-Later,对齐父 PRD §5.2 line 189) | FR-CON-40~48 全过(v0.2 收敛后)|
| D8 | 番茄模块 ConsoleView:当前会话面板 + 历史柱状图;启动番茄绑定任务(`Cmd+Shift+P`) | FR-CON-59~62 |
| D9 | 习惯模块 ConsoleView:列表 7 圆点 + streak + 详情**只有"日历" tab**(热力图删除,Phase 3 才补);Space 打卡 + A 归档 | FR-CON-63~67 基础部分;FR-CON-65 留空 |
| D10(周末)| 四象限 ConsoleView(拖 + 键盘 1/2/3/4 + Cmd+Option+方向键)+ Empty/Error states;真机验收任务/番茄/习惯/四象限四模块 + §5.8.2 S-05 ~ S-07(外接屏拔出 / Stage Manager / 睡眠唤醒)| 第 2 周末 demo + dev_log |

**第 2 周末验收**:任务 + 番茄 + 习惯 + 四象限四个模块在 Console 内完整可用;Console 改 → overlay Grid 实时刷新(走 productivity:* 事件 + revision + ack);全键盘可走通"新建 Todo → 加 Label → 设截止日 → 启动番茄";PRD §5.8.2 S-05 ~ S-07 通过。

### 第 3 周 · 标签 / 进度条 / 设置 / 通知中心 / Cmd+K(D11-D15)

**目标**:标签管理(含 resolver 协议)、时间进度条、设置容器壳(各业务 plugin 提供子页)、通知中心(2 tab + AI tab 动态)、Cmd+K 全局搜索(P0 provider 集)。

| 日 | 任务 | 交付 |
|---|---|---|
| D11 | `plugin-labels` 提供 ConsoleView:Label 列表 + 详情(走 `labelEntityResolver` 协议聚合);plugin-productivity / plugin-project 实装各自的 resolver;缺席 plugin 显示降级占位 | FR-CON-76~80 + Major-9 |
| D12 | `plugin-widgets` 的进度条子模块提供 ConsoleView:列表 + 详情 + 一键预置 | FR-CON-81~83 |
| D13 | **设置容器壳**(plugin-console 自己提供 appearance / shortcuts / about 三个 SettingsSection);**各业务 plugin 各自提供 account / data / privacy / plugins(只读列表)/ sync 子页**(对接 plugin-account / sync 子 PRD);**Console 不实装这些子页内部内容** | FR-CON-84~95 收敛版 |
| D14 | 通知中心:NotificationTab slot + 铃铛 + 抽屉;**默认 2 tab**(同步状态 / 任务到期);AI tab 通过 `plugin-ai` 是否注册动态决定显示(Phase 4 才有,M2.5 期间不显示)| FR-CON-116~123 |
| D15(周末)| Cmd+K 全局搜索:模态 UI + **应用内作用域**(不抢全局);SearchProvider 协议 + P0 provider 集(Todo / Label / Project / Settings / Module jump);200ms 超时 abort + 部分结果呈现;命令面板 `>` 模式 | FR-CON-96~105 + Critical-8 |

**第 3 周末验收**:Console PRD §5.4.9 收敛后的设置容器 + 容器内业务子页正常渲染(具体内部细节归对应业务 PRD);通知中心 2 tab 正确,AI tab 不出现;Cmd+K P0 provider 集搜索 Todo / Project card / Label / Settings / Module jump 均命中并跳转;中量数据(10K Todo + 1K Project card)P95 ≤ 300ms;隐私模式下剪贴板 provider 不出现。

### 第 4 周 · 项目模块联调 + 主题 / 密度 / i18n / 无障碍(D16-D20)

**目标**:与 plugin-project 联调;视觉/可用性收尾。

| 日 | 任务 | 交付 |
|---|---|---|
| D16 | plugin-project 的 ConsoleView 联调:看板视图 / 表格视图 / 卡片详情;sidebar 二级 "最近 3 个看板" | FR-CON-68~75 |
| D17 | 跨模块互转(对齐 PRD §5.4.6 FR-CON-74 修正版):**来源是看板/表格内的卡片,不是 sidebar**;键盘 `Cmd+Option+T`(卡片 → Todo)/ `Cmd+Option+B`(Todo → 看板)| FR-CON-74 + FR-CON-137 + Major-2 |
| D18 | 主题 / 密度 / 字体 / Accent 切换:CSS variable 链路打通;`<html data-theme data-accent data-density>` 注入;0 闪烁;**`NSAppearance` 监听由 core-window host adapter 注入,plugin-console 不直接读 Tauri API** | FR-CON-129~133 |
| D19 | i18n:三语言文案 token 化(**简中 100% / 繁中 + 英文 ≥ 80% 缺失键自动回退简中**;Phase 3 才补到 100%);日期数字格式跟随区域 | FR-CON-151~154 + Major-8 |
| D20(周末)| 无障碍:**按 PRD §5.12.2 各组件类型走查**(tree / listbox / grid / calendar 占位 / dialog / toolbar / drawer / 虚拟列表);高对比度 + 减少动画 + 焦点环;a11y 单测 | FR-CON-155~158 + Major-6 |

**第 4 周末验收**:plugin-project 2 个视图(Kanban / Table,总览 Phase 3)+ 卡片 ↔ Todo 互通(键盘 + 拖);主题 / 密度 / 字体即时生效 0 闪烁;VoiceOver 走通 sidebar → list → detail 焦点 + Kanban 看板键盘移动卡片;高对比度 / 减少动画生效;PRD §5.8.2 S-08 ~ S-09(Console 全屏)通过。

### 第 5 周 · Empty/Error / 模块矩阵 / 跨窗口脚本 / 性能 / M2.5 验收(D21-D25)

**目标**:Empty/Error states、§5.11 模块状态矩阵 + §5.11.4 模块缺席矩阵、跨窗口一致性脚本 §9.5、菜单栏 §9.1.12、性能调优、M2.5 四层验收清单全过。**5 步 Onboarding tour 移到 Phase 3**。

| 日 | 任务 | 交付 |
|---|---|---|
| D21 | **空状态 + `?` cheat sheet 浮层**(P0;5 步 tour 不做);每个模块 empty state 插画 + CTA;`docs/manual-tests/console-cross-window-consistency.md` 起稿 | FR-CON-141 简化版 + 空状态 + cheat sheet 入口 |
| D22 | Error states:7 状态矩阵(loading / empty / partial / failed / permission / accountExpired / conflict)+ 模块缺席矩阵(未安装 / 未启用 / 加载失败 / 灰显占位 / ConsoleView 崩溃)+ 设置保存失败 banner + 迁移失败启动拦截 | FR-CON-145~150 + Major-5 + 增补 A2 |
| D23 | 性能调优:list 虚拟化(react-virtuoso)/ 模块切换淡入淡出(120ms)/ 主题切换 0ms / Cmd+K 200ms 截断 / entity_change_log + ack + 30s reconcile;**M2 + Intel + Release 模式双设备实测** | 性能指标全过 PRD §6.1 三档(M1/M2/Intel) |
| D24 | **macOS 菜单栏完整实装**(File/Edit/View/Window/Help)+ 跨窗口一致性脚本 X-01 ~ X-06 完整走一遍 + S-10 ~ S-11(Console / overlay 单边关闭场景) + 真机验收 PRD §9.1 ~ §9.4 一次性走完;漏项补 | 真机验收报告 + 跨窗口脚本 |
| D25(周末)| M2.5 真机验收复盘 + dev_log 写完 + ship 准备 | dev_log 状态 = READY_FOR_VERIFY |

**第 5 周末验收**:Console PRD §9.1 Shell + §9.2 Module + §9.3 Project + §9.4 灰显占位 + §9.5 跨窗口脚本 5 层全部通过;dev_log 状态 = READY_FOR_VERIFY;feature-verify agent 跑过 → ship。

### 时间预算 buffer

- 5 周 = 25 工作日,其中每周末 1 天为 buffer/真机日,共 5 天 buffer
- 若 R-CON-01(性能)或 R-CON-03(数据漂移)触发,buffer 优先用于这两项
- 超过 5 周仍未达 P0 全过,触发 feature-build 的 BLOCKED 状态,回到 plan 调整

---

## 4. 接口契约

### 4.1 plugin-console 从其他 plugin 拿什么

| 来源 plugin | slot / API | Console 怎么用 |
|---|---|---|
| 所有业务 plugin | `manifest.ui.consoleSidebar = { icon, order }` | sidebar 模块入口的渲染顺序 |
| 所有业务 plugin | `PluginComponents.ConsoleView` | 中栏 + 右栏的内容渲染 |
| 所有业务 plugin | `PluginComponents.SettingsSection` | 设置壳的子页内容 |
| 所有业务 plugin | search adapter(新 API,需在 PLUGIN_SDK 加) | Cmd+K 搜索调用各 plugin 的搜索方法 |
| plugin-productivity | 任务 / 番茄 / 习惯 / 四象限 ConsoleView | 4 个 sidebar 模块 |
| plugin-calendar(Phase 3 才补)| 桌面日历 ConsoleView | sidebar 月/周/日/Agenda |
| plugin-labels | Label 列表 + 详情 ConsoleView | 标签管理模块 |
| plugin-project | 看板/表格/总览 ConsoleView | 项目管理模块 |
| plugin-widgets / 进度条子模块 | 进度条列表 + 详情 ConsoleView | 进度条模块 |
| plugin-account | 设置 > 账号 + 通知中心 sync tab 数据 | 子页 + 抽屉 tab |
| plugin-ai(Phase 4 才补)| 通知中心 AI tab | 暂灰显 |

### 4.2 plugin-console emit 的事件(EventMap)

| 事件 | payload | 用途 |
|---|---|---|
| `console:navigate-module` | `{ module: string }` | sidebar 切模块,其他端可监听做联动 |
| `console:sidebar-toggled` | `{ collapsed: boolean }` | sidebar 折叠/展开 |
| `console:search-opened` | `{}` | Cmd+K 打开 |
| `console:search-result-selected` | `{ resultType: string; entityId: string }` | 搜索选中,目标 plugin 可监听(可选)|

### 4.3 plugin-console listen 的事件

| 事件 | 来源 | 处理 |
|---|---|---|
| `account:sync-started` / `account:sync-completed` / `account:sync-failed` | plugin-account | 更新通知中心 sync tab + 标题栏图标 |
| `productivity:todo-*` / `productivity:pomodoro-*` / `productivity:habit-*` | plugin-productivity | 任务到期 tab 刷新;搜索索引刷新 |
| `project:card-*` | plugin-project | 搜索索引刷新 |
| `labels:*` | plugin-labels | 搜索索引刷新 |
| `ai:query-response` / `ai:query-sent` | plugin-ai(Phase 4)| AI tab 显示 |

### 4.4 新增 Tauri Commands(走 Rust 后端)

| Command | 输入 | 输出 | 错误 | 归属 |
|---|---|---|---|---|
| `open_console_window` | `{}` | `{ok: true}` | `WindowError` | window |
| `close_console_window` | `{}` | `{ok: true}` | `WindowError` | window |
| `focus_console_window` | `{}` | `{ok: true}` | `WindowNotFound` | window |
| `set_console_window_frame` | `{x, y, w, h, screenId?}` | `{ok: true}` | `WindowNotFound` | window |
| `get_console_window_frame` | `{}` | `{x, y, w, h, screenId}` | `WindowNotFound` | window |

(实现挂在 `src-tauri/src/commands/window.rs`;经 `platform::WindowOps` trait 调用。)

### 4.5 PLUGIN_SDK 待补 API(W1 D1 硬阻塞,对齐 PRD §7.2)

W1 D1 必须把 PRD §7.2.1 完整契约写进 PLUGIN_SDK §3,并对外打 BREAKING release。包括:

- `pluginRegistry.getConsoleSidebarEntries()`(支持 disabled / 灰显占位 flag)
- `pluginRegistry.getSettingsSections()`(给设置壳)
- `pluginRegistry.getSearchProviders()`(Cmd+K)
- `pluginRegistry.getLabelEntityResolvers()`(Label 详情聚合)
- `pluginRegistry.getNotificationTabs()`(通知中心)
- `host.openModule(module: string, route?: object)` / `host.openSearch(opts?)` / `host.showDialog(...)` / `host.showToast(...)` / `host.notify(...)`
- `ConsoleViewProps` / `ConsoleHostCapabilities` / `ConsoleSlotApi` / `FocusApi` / `SelectionApi` / `TelemetryApi` 接口
- `SearchProvider` / `SearchHit` / `SearchOptions` 接口(含 timeout + signal)
- `SettingsSection` / `SettingsSectionProps` 接口
- `NotificationTab` 接口(含 enabledWhen 动态注册)
- `LabelEntityResolver` 接口(含降级语义)

manifest schema 加 `windows.console=true` 强制 plugin 必须导出 ConsoleView 的 CI 校验。

---

## 5. 测试策略

### 5.1 单测

| 包 | 重点测试对象 | 工具 | 覆盖率底线 |
|---|---|---|---|
| `plugin-console` | ConsoleHost 三栏布局 hook / nav-state hook / Cmd+K 搜索聚合 / 设置壳 / 通知中心聚合 | Vitest + @testing-library/react | ≥ 60%(对齐 TECHNICAL §1.1.1)|
| Rust commands(window) | open/close/focus/frame | cargo test + Mock WindowOps trait | ≥ 70% |

### 5.2 集成

| 测试 | 范围 |
|---|---|
| Console emit `console:navigate-module` → plugin-productivity listen 触发数据加载 | 事件流 |
| Console 改 Todo → emit `productivity:todo-updated` → mock overlay 端 listener 收到 | 跨窗口模拟 |
| Cmd+K 搜索:并行调用 mock search providers,200ms 截断未返回项 | 搜索聚合 |
| 设置改主题 → CSS variable 更新 → 不重渲染整树 | 视觉性能 |

### 5.3 契约测试

- 每个业务 plugin 的 ConsoleView 必须实现 `PluginComponents.ConsoleView` 接口;CI 静态检查 manifest 中 `windows.console=true` 的 plugin 必须导出 ConsoleView
- emit/listen 事件必须在 EventMap 中定义(CI 自动校验,已在 PLUGIN_SDK §2.3)
- search adapter 协议:返回值 schema 用 Zod 运行时校验

### 5.4 E2E(Playwright + Tauri WebDriver)

| 流程 | Phase 2.5 末必跑 |
|---|---|
| 唤起 Console → 新建 Todo → 加 Label → 设截止日 → 启动番茄 | ✅ |
| Cmd+K → 搜索"PRD" → 跳转项目卡片 | ✅ |
| 切到日历 → 拖 Todo 改期 → 切回任务确认 due_at 更新 | ✅ |
| 设置改主题暗色 → 0 闪烁切换 | ✅ |
| Console + overlay 双开 → 一处改 → 另一处刷新 | ✅ |
| 关闭 Console → 重开 → 状态恢复(模块/子项/三栏宽度)| ✅ |

### 5.5 真机验收(每周末)

每周末按 PRD §9 M2.5 验收清单选当周完成的子集走一次;最后一周(D24)走完整清单。

| 周末 | 真机检查重点 |
|---|---|
| W1 | 窗口生命周期 / 多 Space / 多屏 / sidebar 切换 |
| W2 | 任务+番茄+习惯+四象限模块 / Console ↔ overlay 同步 |
| W3 | 标签+进度条+设置+通知中心+Cmd+K |
| W4 | 项目模块联调 / 主题密度字体 / VoiceOver |
| W5 | 完整 P0 清单 / 长跑稳定性 |

---

## 6. 风险登记

主 PRD §12 已记基线风险;Console 特有的从 PRD §10 中再次整理,挂上 Phase 2.5 执行期的监控点:

| ID | 风险 | 等级 | 监控时点 | 缓解 |
|---|---|---|---|---|
| R-CON-01 | 三栏拖动 + 列表虚拟化性能不达 60fps | 🟡 中 | W2 D8 + W5 D23 | W2 末做性能 spike;不达标则降级非虚拟 + 限 5K 条 |
| R-CON-02 | 模块切换闪烁 | 🟡 中 | W2 D10 真机 | 120ms 淡入淡出 + 预加载相邻 ConsoleView |
| R-CON-03 | Console ↔ overlay 数据漂移(事件丢失) | 🔴 高 | W2 末 + W5 末 | core-events 加 ack + Console 启动全量 pull 校准 |
| R-CON-04 | plugin ConsoleView 边界不清 | 🟡 中 | W1 D1 manifest schema 校验 | CI 红线 + PR review |
| R-CON-05 | Cmd+K 搜索响应慢 | 🟡 中 | W3 D15 + W5 末 | 并行 + 200ms 截断 + FTS5 |
| R-CON-06 | plugin 偷调 Tauri API 破坏平台无关 | 🟡 中 | 每次 PR | CI lint:`@tauri-apps/api` 在 plugin 包内禁用 |
| R-CON-07 | settings 表跨窗口写竞争 | 🟡 中 | W1 D4 | settings 写走单写者 Rust command |
| R-CON-08 | 设置同步语义不一致 | 🟡 中 | W3 D13 | settings 加 `sync_scope` 列 |
| R-CON-09 | macOS Sequoia 行为差异 | 🟢 低 | 每周末双系统真机 | 留自绘 titlebar fallback |
| R-CON-10 | 全键盘可达漏覆盖 | 🟡 中 | 每周末键盘走查 | a11y 单测 + 验收清单逐条键盘走 |
| R-CON-11 | plugin-productivity 进 Phase 2.5 时仍非 Stable | 🔴 高 | 进入 Phase 2.5 第 1 天 | 硬阻塞 Phase 2.5;若 Phase 2 末 productivity 状态不到 Stable,推迟 Phase 2.5 |
| R-CON-12 | plugin-project 并行做导致 ConsoleView 接口反复变 | 🟡 中 | W1 D1 + W4 D16 | W1 D1 锁 ConsoleView 接口契约;后续变更走 BREAKING commit |
| R-CON-13 | Cmd+Shift+Space 与系统 Spotlight 冲突 | 🟢 低 | W1 D5 真机 | 提供备选默认快捷键(如 `Cmd+Shift+J`);用户可自定义 |

---

## 7. 验收门(进入 Phase 3 前必过)

Phase 2.5 出口 = Phase 3 入口。Console 必须达到以下标准才能签收:

### 7.1 功能门(对齐 PRD §9 v0.2 四层验收)

- [ ] **§9.1 Shell 必过**:窗口生命周期 / IA / 三栏 / 设置容器 / Cmd+K / 通知中心 / 多 Space / 主题 / a11y / Empty/Error / 性能 / ConsoleView 契约 / 菜单栏 共 12 组全过
- [ ] **§9.2 Module 必过**:任务 / 四象限 / 番茄 / 习惯(无热力图)/ 标签 / 进度条 6 个模块 ConsoleView 全过
- [ ] **§9.3 Project 必过**:Kanban + Table + 卡片 ↔ Todo 互转(键盘 + 拖)+ 归档
- [ ] **§9.4 灰显占位必过**:桌面日历 sidebar 灰显;AI tab 不出现
- [ ] **§9.5 跨窗口一致性脚本 X-01 ~ X-06 必过**
- [ ] Console ↔ overlay 实时同步 P95 ≤ 400ms(中量),7 天长跑无漂移
- [ ] 全键盘可走通 PRD §5.6.4 拖拽对偶清单的所有 P0 流程

### 7.2 工程门

- [ ] plugin-console 单测覆盖率 ≥ 60%;Rust window commands 覆盖率 ≥ 70%
- [ ] 所有新增事件已在 EventMap 中定义,manifest schema 校验通过(含 `windows.console` + `ui.consoleSidebar` + ConsoleView 必导出)
- [ ] CI lint 通过(无 `@tauri-apps/api` 在 plugin 包内的 import;无 console.log;无 .ts 文件 import `.css` 之外的内部路径)
- [ ] E2E 6 个核心流程全过(对应 §5.4 测试策略)
- [ ] 性能基线在 M2 + Intel + Release 模式下分别达 PRD §6.1 全部 P95

### 7.3 文档门

- [ ] `packages/plugin-console/docs/` 四件套(design / api / test / dev_log)状态 = Stable
- [ ] `docs/PLUGIN_MAP.md` 中 plugin-console 状态从 Planned → Stable
- [ ] 主 PRD §5.13.3 中"控制台 ≠ 新功能集合"的设计说明在 plugin-console design.md 复述
- [ ] 本 dev-plan 的 dev_log.md 状态 = READY_TO_SHIP

### 7.4 验收人

- 产品 Owner(InnoPeak)在两台真机(Sonoma + Sequoia)上独立走完 PRD §9 M2.5 清单
- 若任一条 P0 失败,回到 feature-build agent,不允许 ship

---

## 8. 文档变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-05-14 | v0.1-draft | 首版,基于 Console PRD v0.1 拆 5 周计划;接口契约 + 测试策略 + 风险登记 + 验收门 | Claude(subagent) |
| 2026-05-16 | v0.2-draft | 对齐 Console PRD v0.2:W1 D1 加 PLUGIN_SDK 完整契约硬阻塞;W2 删除习惯热力图;W3 设置子页范围收敛 + Cmd+K 改应用内 + provider 协议;W4 跨模块互转改卡片源 + i18n 简中100%/繁中+英文≥80%;W5 删除 5 步 tour 改 `?` cheat sheet + 加模块缺席矩阵 + 跨窗口脚本 + 菜单栏 + S-08~S-11 真机场景;§4.5 PLUGIN_SDK API 列表对齐 PRD §7.2.1;§7 验收门改四层(Shell/Module/Project/灰显/跨窗口) | Claude(subagent) |
| 2026-05-16(rev1)| v0.2-rev1-draft | 对齐 PRD v0.2-rev1:§1 PLUGIN_SDK 接口名改全名;W2 D7 多选严格收敛仅批删除,撤回批 Label / 批移清单 | Claude(subagent) |

— END of Console dev-plan v0.2-draft —
