# Console 子 PRD — XAI_Desktop 整体控制台

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §5.13)|
| 范围 | 整体控制台窗口的完整规格 |
| 平台 | macOS Console window(Tauri 标准窗口);网页版另见 `sub-prds/web/PRD.md` |
| 归属 Phase | Phase 2.5(M2 → M3 之间,4-6 周)|
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 状态 | DRAFT |

---

## 0. 文档定位与父 PRD 关系

本文档是主 PRD §5.13 的展开,只覆盖**整体控制台(Console)**这一个面的 UX / 集成 / 验收细节。主 PRD 已经定义的内容**一律不重复**,只用引用:

| 不重复的内容 | 看哪里 |
|---|---|
| 产品愿景 / 三个面架构 / 决策快照 | 主 PRD §1、ADR-0003 |
| 业务模块本身的 FR(Todo / 番茄 / 习惯 / Label / 日历 / 项目 / 标签 / 搜索 / 设置) | 主 PRD §5.2 / §5.3 / §5.4 / §5.11 / §5.12 / §5.14 |
| 数据 Schema | 主 PRD §8 |
| 性能 / 隐私 / 同步基础要求 | 主 PRD §6、TECHNICAL_REQUIREMENTS §1.2 / §2 |
| 公共快捷键基线 | 主 PRD §6.4 |
| 16 模块路线图 / 工期 | 主 PRD §10 |
| 风险登记基线 | 主 PRD §12 |

本文档**只**展开:窗口生命周期、三栏布局、各业务模块的"Console 视图"、键盘流、全局搜索、通知中心、多窗口/多 Space 行为、主题/密度、Onboarding/Empty/Error、i18n/无障碍、Console 性能 / 验收清单、Phase 2.5 内的依赖与风险。

Console **不是新功能集合**,而是已有业务 plugin 的统一窗口化外壳(`plugin-console`)+ 各业务 plugin 提供的 `ConsoleView` slot。本文档 FR 中提到"任务/习惯/番茄/项目/日历/标签"时,**指的是它们在 Console 中的呈现与集成**,业务规则去主 PRD。

---

## 1. 产品定位

### 1.1 为什么需要 Console

桌面 overlay 模式适合"随手即用"——一眼看到、一手抓取、不打断当前工作。但在以下场景,overlay 的浮动 Grid 形态会被 P3 用户感到吃力:

- 周日晚做下周规划,要同时看月历、未完成 Todo、习惯 streak、项目卡片状态
- 把 30 条散落的剪贴板项手动归类到 5 个 Label 下
- 一次新建 8 条 Todo 并按四象限分配
- 跨模块筛选:看"所有打了'健康'Label 的 Todo + 习惯 + 项目卡片"

这些需要**专注界面 + 大画布 + 多列同屏 + 键盘流**——这正是 TickTick 桌面端、Things、OmniFocus 这类窗口化 App 比浮动 Widget 更胜任的场景。

### 1.2 为什么不让 overlay 承担

overlay 形态的硬约束(从 R-00 spike 与 ADR-0001 推导):

- 主窗口默认点击穿透,大块文字输入与列表多选体验差
- Grid 是离散浮动单元,跨 Grid 的"列表筛选 + 选中 + 详情面板"做不出来
- 多 Space / 全屏行为对深度工作不友好(切 App 时 Grid 跟着或不跟着都麻烦)
- 标准 macOS App 的键盘流(Cmd+W / Cmd+M / 全键盘焦点环)在 overlay 上要全部重做

Console 是**标准 macOS 窗口**(`window type = console`,见 SYSTEM_ARCHITECTURE §5.1),与 overlay 模式各司其职:

| 维度 | Overlay 模式 | Console 模式 |
|---|---|---|
| 主用户 | P1 / P2 / P3 都用,频次最高 | 主要 P3(GTD/自律实践者),P1 偶尔深度整理 |
| 入口频次 | 几十次/天 | 1-3 次/天,每次 5-30 分钟 |
| 核心动作 | 拖一个文件 / 抓一条剪贴板 / 看一眼时钟 | 规划 / 复盘 / 跨模块筛选 / 批处理 |
| 窗口数 | 多浮窗 | 单窗口 + 三栏 |
| 键盘 vs 鼠标 | 鼠标为主 | 键盘为主 |

### 1.3 Console 一句话定位

> 给 XAI 用户一个 "TickTick 风格的深度管理大本营",所有业务模块在这里都有一个完整可键盘操作的视图,数据与 overlay 实时一致。

---

## 2. 目标用户与场景

### 2.1 主用户

参见主 PRD §2.1 三个 persona。Console 的主用户分布:

| Persona | Console 使用频次 | 主要场景 |
|---|---|---|
| **P3 自律实践者** | 高(每天 1-3 次) | 周末规划、晨间复盘、月度习惯回看、四象限整理 |
| **P1 数字游民** | 中(每周 1-2 次) | 月初做项目卡片整理、批量打标签 |
| **P2 开发者** | 低(每周 0-1 次) | 偶尔翻历史番茄统计、批量管理剪贴板模板 |

### 2.2 Console 高频场景(Hero Scenarios)

**场景 C-1 · 周日规划(P3)**
> 周日晚 21:00,小李按 `Cmd+Shift+Space` 唤起 Console。Sidebar 切到"桌面日历",月视图右侧切到 Agenda。看到下周一空着,把"提交季度报告"从"收件箱"列表拖到周一上午。键盘 `4` 切到四象限,把 3 条今天没做完的 Todo 重新分配象限。`5` 切到习惯,看上月 streak 选了一个 73%。整个过程没碰鼠标。

**场景 C-2 · 跨模块筛选(P1)**
> Cmd+K 唤起全局搜索,输入"产品 PRD",看到结果分四组:Todo 3 条 / 项目卡片 2 张 / 剪贴板 4 条 / 文件 1 个。用 j/k 选第二组的第一张卡,Enter 在右栏打开。三栏布局保持稳定,sidebar 还在"全局搜索",中栏是结果。

**场景 C-3 · 项目卡片改 Todo(P3)**
> 项目模块下,有一张"调研竞品定价"卡片。右键"转为 Todo",自动建一条 Todo 并保持卡片链接(`linked_todo_id`)。卡片右上角出现 Todo 图标徽标。切到任务模块的"今日"清单,新建的 Todo 在列表顶部,详情栏右下显示"来自项目:Brand Refresh"。

### 2.3 非目标用户与非目标场景

- 移动端用户(走 Phase 5+ 伴侣 App)
- 团队协作(v1 单人)
- 不用 XAI 的桌面 overlay 模式、仅用 Console:支持,但**不是首发主推**——Console 默认从 overlay 唤起,但也可独立使用

---

## 3. 信息架构

### 3.1 Sidebar 模块树

```
Console
├── Inbox(收件箱)         ← 默认进入项
├── 任务
│   ├── 今日
│   ├── 本周
│   ├── 已完成(归档前 30 天)
│   ├── 用户清单 1
│   ├── 用户清单 2
│   └── …
├── 桌面日历
│   ├── 月视图(默认)
│   ├── 周视图
│   ├── 日视图
│   └── Agenda(议程)
├── 四象限
├── 番茄专注
│   ├── 当前会话(若有)
│   └── 历史统计
├── 习惯打卡
│   ├── 全部习惯(列表 + 周打卡圈)
│   └── 详情(选中后)
├── 项目管理
│   ├── 看板列表
│   └── 看板详情(看板/表格/总览视图)
├── 标签管理
│   └── 单个 Label 详情(显示所有 entity_type 的关联项)
├── 全局搜索(Cmd+K)        ← 模态/侧边切换,非永久 sidebar 项
├── 时间进度条
└── 设置
    ├── 账号
    ├── 外观(主题/密度/字体)
    ├── 快捷键
    ├── 数据(导入/导出/诊断)
    ├── 隐私
    ├── 插件
    ├── 同步
    └── 关于
```

### 3.2 Sidebar 设计原则

- 顺序按"P3 使用频次降序",顶部是 Inbox + 任务 + 日历 + 四象限,底部是低频的标签管理和设置
- 每个模块入口由 `manifest.json` 的 `ui.consoleSidebar.{icon, order}` 声明(PLUGIN_SDK §2.1),Console 启动时调 `pluginRegistry.getConsoleSidebarEntries()` 渲染
- 收件箱(Inbox)是任务模块的默认子项,但在 sidebar 顶层独立显示一份,因为它是大多数用户进入 Console 后的第一落点
- "全局搜索"不在 sidebar 永久占位,但保留视觉锚点(标题栏一个搜索图标)
- 设置永远在最底部

### 3.3 路由 / 状态保留

Console 维护一个 `console:nav-state`(存 `settings` 表 key=`console.nav_state`):

```ts
{
  activeModule: "tasks" | "calendar" | "matrix" | "pomodoro" | "habits" | "project" | "labels" | "progress" | "settings",
  modulePath: {
    tasks: { listId: "smart:today", selectedTodoId: "uuid" | null },
    calendar: { view: "month" | "week" | "day" | "agenda", anchorDate: 1715731200000 },
    habits: { selectedHabitId: "uuid" | null },
    project: { boardId: "uuid" | null, view: "kanban" | "table" | "overview" },
    settings: { section: "appearance" | ... }
    // ...
  },
  sidebarCollapsed: false,
  detailPaneCollapsed: false,
  detailPaneWidth: 360,
  density: "standard"
}
```

切到别的模块再切回来,**必须**恢复到上次的 sub-state(选中项 + view + scroll position)。

---

## 4. 视觉与布局规范

### 4.1 三栏布局

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✕ ⊟ ⊞   XAI Desktop · Console               🔔  ⌕ Cmd+K   👤 me   │ ← 标题栏(48px)
├──────────┬─────────────────────────┬────────────────────────────────┤
│          │                         │                                │
│  Sidebar │   List(中栏)           │   Detail(右栏)               │
│   220px  │   320–520px(可拖)     │   360px+ (可折叠 / 可拖)      │
│   可折叠 │                         │                                │
│   到 64px│                         │                                │
│          │                         │                                │
│  收件箱  │  ⊕ 新建 Todo            │  ▢ 标题输入                    │
│  任务 ▾  │  ☐ 提交季度报告  Mon    │  ──── 描述(Markdown)        │
│  日历    │  ☐ 联系小王      Tue    │                                │
│  四象限  │  ☑ 准备会议  完成      │  📅 截止 2026-05-20            │
│  番茄    │  ☐ 写 ADR-0003          │  🏷️ Labels: 工作 · 重要       │
│  习惯    │  ☐ 整理桌面               │  ✓ 子任务 (2/4)                │
│  项目    │  …                      │  🔔 提醒 2026-05-20 09:00     │
│  标签    │                         │  🍅 已用番茄: 3                │
│  ⚙️ 设置│                         │                                │
└──────────┴─────────────────────────┴────────────────────────────────┘
```

### 4.2 宽度策略

| 栏 | 默认 | 最小 | 最大 | 用户可拖 | 双击栏分隔回默认 |
|---|---|---|---|---|---|
| Sidebar | 220px | 64px(图标条) | 360px | ✅ | ✅ |
| List(中栏) | 380px | 280px | 720px | ✅ | ✅ |
| Detail(右栏) | 自适应 | 320px | — | ✅(拖 List/Detail 分隔条) | ✅ |
| 整窗最小 | 880×600 | — | — | — | — |

- 窗口宽度 < 1080px 时,Detail 自动折叠为侧滑抽屉(从右边沿入,占 60% 宽,Esc 收起)
- 窗口宽度 < 760px 时,Sidebar 折叠为图标条(64px)

### 4.3 密度模式

| 密度 | List 行高 | Sidebar 间距 | 字号 | 适用场景 |
|---|---|---|---|---|
| 紧凑(Compact) | 32px | 4px | 13px | 大量任务,信息密度优先 |
| 标准(Standard,默认) | 40px | 8px | 14px | 日常使用 |
| 宽松(Comfortable) | 52px | 12px | 15px | 14" 以下小屏 / 视觉舒适优先 |

存 `settings.console.density`,跨设备同步(只同步 Console 偏好,不同步窗口位置)。

### 4.4 主题

- 跟随系统(macOS appearance,默认)
- 强制亮色
- 强制暗色
- 高对比度(对应系统的"提高对比度",VoiceOver 用户路径)

Accent Color:8 种预设(蓝/紫/粉/红/橙/黄/绿/灰)+ 跟随系统 accent。

CSS 变量驱动,主题切换 0 闪烁(`<html data-theme="dark" data-accent="blue">`)。

### 4.5 字体

- 中文:PingFang SC(系统)
- 英文:SF Pro(系统)
- 等宽(代码/数字):SF Mono(系统)
- 不自带 web font,纯系统字体,启动 0 加载延迟

### 4.6 间距 / 圆角 / 阴影 token

复用 `packages/ui` 已定义 token。Console 特化:

| Token | 值 |
|---|---|
| `--console-titlebar-h` | 48px |
| `--console-sidebar-w` | 220px |
| `--console-pane-gap` | 1px(分隔线,不留空白) |
| `--console-list-row-h-standard` | 40px |
| `--console-radius` | 8px(panel) / 6px(card) / 4px(button) |
| `--console-shadow-pane` | 0 1px 0 var(--border)(右侧 1px 分隔,而非真阴影) |

### 4.7 动效

| 动作 | 时长 | 缓动 | 备注 |
|---|---|---|---|
| 模块切换(中栏内容替换) | 120ms | ease-out | 仅淡入淡出,无横向滑动 |
| Sidebar 折叠 / 展开 | 180ms | ease-in-out | 宽度动画 + 文字 opacity |
| Detail 折叠 / 展开 | 200ms | ease-in-out | 宽度动画 |
| List 行展开(详情) | 100ms | ease-out | 高度动画 |
| 拖拽 reorder | 0ms(立即响应) | — | drop 后 150ms 排序动画 |
| 主题切换 | 0ms | — | 立即生效,无 transition(避免闪烁) |

用户在"设置 > 外观 > 减少动画"开启后,所有 ≥ 100ms 的动画一律降到 0ms(对齐 macOS Reduce Motion)。

---

## 5. 功能需求

> 主 PRD §5.13 已定义 FR-CON-01~12(基础窗口/sidebar/三栏/各模块入口/搜索/快捷键)。本节继承并展开,从 FR-CON-13 起编号。
> **优先级**:P0 = Phase 2.5 必做,P1 = Phase 3 可补,P2 = 推迟到 v1.x 或 v2。

### 5.1 窗口生命周期(FR-CON-13~20)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-13 | Console 窗口唯一性 | P0 | 同时只允许存在一个 Console 窗口;再次唤起时聚焦已有窗口而非新建 |
| FR-CON-14 | 标题栏样式 | P0 | macOS 原生标题栏(traffic lights + titlebar);窗口标题动态为 `XAI Desktop · <当前模块>` |
| FR-CON-15 | 关闭行为 | P0 | 点关闭(✕)= 隐藏窗口,不退出 App(overlay 仍在);Cmd+Q 真正退出 App;首次关闭时弹一次提示让用户记住该行为 |
| FR-CON-16 | 最小化 | P0 | Cmd+M 与黄灯按钮把窗口最小化到 Dock;App 仍在前台 |
| FR-CON-17 | 最大化 / 全屏 | P0 | 绿灯 = 全屏(macOS 标准 fullscreen);三栏布局自适应 |
| FR-CON-18 | 窗口位置 / 大小持久化 | P0 | 关闭前的 frame 存 `settings.console.window_frame`;重启后恢复;多屏环境下若原屏不存在则居中主屏 |
| FR-CON-19 | 上次状态恢复 | P0 | 重新打开时恢复:活动模块、模块内子状态、sidebar/detail 折叠、宽度;失败时降级到默认(任务·今日) |
| FR-CON-20 | 启动入口 | P0 | 三种入口:① 菜单栏托盘点击 "打开控制台" ② 全局快捷键 `Cmd+Shift+Space`(可在设置改)③ Dock 图标点击(App 已运行时直接打开 Console,而非启动 overlay)|

### 5.2 Sidebar 导航(FR-CON-21~30)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-21 | 模块入口动态注册 | P0 | Console 启动时调用 `pluginRegistry.getConsoleSidebarEntries()`,按 `ui.consoleSidebar.order` 排序渲染;未声明该字段的 plugin 不出现在 sidebar |
| FR-CON-22 | 任务子项展开 | P0 | "任务"模块的智能清单 + 用户清单作为二级 sidebar 项展开/折叠,记忆展开状态 |
| FR-CON-23 | Sidebar 折叠到图标条 | P0 | 64px 宽,只显示图标 + 徽标;hover 显示模块名 tooltip |
| FR-CON-24 | 模块徽标 | P0 | 每个模块可显示数字徽标:任务=今日未完成数;番茄=运行中显示动画点;习惯=今日未打卡数;同步状态=失败时显示红点 |
| FR-CON-25 | 拖动重排 sidebar | P2 | v1.x 评估,P0 不做(顺序由 plugin order 决定)|
| FR-CON-26 | Sidebar 右键菜单 | P1 | 在模块项右键可"隐藏此模块"(对应到 `settings.console.hidden_modules`);可在 设置 > 外观 重新启用 |
| FR-CON-27 | Inbox 顶部置顶 | P0 | Inbox 永远第一项,且无法被隐藏 |
| FR-CON-28 | 当前选中高亮 | P0 | 当前模块在 sidebar 显示高亮(背景色 + accent 左边条 2px);二级子项同理 |
| FR-CON-29 | 模块切换快捷键 | P0 | `Cmd+1`~`Cmd+9` 切前 9 个 sidebar 模块(顺序按渲染顺序);超过的不绑定快捷键 |
| FR-CON-30 | Sidebar 折叠快捷键 | P0 | `Cmd+\` 切换 sidebar 折叠 / 展开 |

### 5.3 三栏布局与拖动(FR-CON-31~38)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-31 | 拖动分隔条改变 sidebar/list/detail 宽度 | P0 | 拖动时实时反馈;松手后存 `settings.console.pane_widths` |
| FR-CON-32 | 双击分隔条恢复默认宽度 | P0 | sidebar/list/detail 三条分隔条都支持 |
| FR-CON-33 | Detail 折叠 | P0 | List 行右键 "隐藏详情" 或快捷键 `Cmd+Shift+]` 折叠 detail;再按或选中新项展开 |
| FR-CON-34 | Detail 在窄屏自动变抽屉 | P0 | 窗口宽 < 1080px 时,detail 不在右侧固定显示,而是从右边滑入覆盖(60% 宽);Esc / 点击外侧收起 |
| FR-CON-35 | List 滚动性能 | P0 | 任意 list 滚动保持 60fps(虚拟列表实现,任务清单 / 习惯日志 / 项目卡片均需虚拟化);1 万条记录初次渲染 < 200ms |
| FR-CON-36 | List 多选 | P0 | 支持 Shift+Click 区间选 + Cmd+Click 单选;选中后右上显示批操作工具栏(完成 / 删除 / 改 Label / 改清单)|
| FR-CON-37 | List → Detail 选中同步 | P0 | 点 list 行,detail 立即切到该项;键盘 j/k 移动焦点也会跟随(若 detail 处于展开)|
| FR-CON-38 | 跨栏 focus 切换 | P0 | `Tab` 在 sidebar / list / detail 之间循环;`Shift+Tab` 反向;每栏内部用方向键 |

### 5.4 各业务模块在 Console 中的视图

> 每个业务模块的功能 FR 在主 PRD,本节只定义其**在 Console 中的视图与集成行为**。

#### 5.4.1 任务(Todo)模块视图(FR-CON-40~48)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-40 | 任务模块默认视图 | P0 | 中栏顶部 tab:列表 / 看板(灰显,跳转项目模块) / 日历(跳转日历模块);默认列表 |
| FR-CON-41 | 列表分组 | P0 | 用户可在中栏顶部选分组维度:无 / 按截止日 / 按优先级 / 按 Label;选项存到 list-state |
| FR-CON-42 | 智能清单"今日"逻辑 | P0 | 包含:① due 在今天及之前未完成;② 今天创建的;③ 拖入"今日"分组的(`is_today=true`)。视图按"过期 / 今天 / 已完成"三段显示 |
| FR-CON-43 | 任务详情(右栏)字段 | P0 | 标题 / 描述(Markdown 编辑) / 截止日(带 picker) / 提醒(多条)/ 重复规则(RRULE 简化 UI) / 优先级 / Labels / 所属清单 / 子任务 / 关联番茄 / 关联项目卡片 |
| FR-CON-44 | 描述区 Markdown 预览 | P0 | 编辑时显示编辑器,失焦时切换为预览;Cmd+E 强制切换;支持图片粘贴(图片存 `~/Library/Application Support/XAI_Desktop/attachments/`)|
| FR-CON-45 | 子任务拖动重排 | P0 | 在右栏拖动子任务上下重排 |
| FR-CON-46 | 一键启动番茄绑定该任务 | P0 | 详情顶部"🍅 开始番茄"按钮 / 快捷键 `Cmd+Shift+P`;启动后右栏底部显示"番茄进行中"胶囊 |
| FR-CON-47 | 完成动画 | P0 | 列表勾选完成,行有 200ms 划线动画,5 秒可撤销提示(toast)|
| FR-CON-48 | 任务模块 empty state | P0 | 清单为空时,显示插画 + "暂无任务,按 N 新建" |

#### 5.4.2 桌面日历模块视图(FR-CON-49~55)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-49 | 视图切换 | P0 | 中栏顶部 tab:月 / 周 / 日 / Agenda;`1/2/3/4` 切换;默认月 |
| FR-CON-50 | 日历主体占据 list+detail 整片 | P0 | 日历模块下,detail 折叠;月/周视图占整片画布;若用户主动展开 detail 则显示选中日的事项 |
| FR-CON-51 | 数据图层开关 | P0 | 右上角浮动 popover:勾选 Todo / 习惯 / 番茄 三个图层;状态存 `settings.console.calendar.layers` |
| FR-CON-52 | 拖拽改期 | P0 | Todo 从一天拖到另一天,修改其 `due_at`;emit `productivity:todo-updated` |
| FR-CON-53 | 点击空白时段快速新建 Todo | P0 | 周/日视图点击某时段,弹出快速输入框,直接录入标题 + 自动填 `due_at` |
| FR-CON-54 | 今日按钮 | P0 | 标题栏"今日"按钮一键跳回当天;`T` 键 |
| FR-CON-55 | 系统 .ics 订阅(只读) | P1 | 主 PRD §5.12 FR-CAL-08 的承接;Phase 3 评估 |

#### 5.4.3 四象限视图(FR-CON-56~58)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-56 | 2×2 网格布局 | P0 | 中栏 + detail 一起作为画布,四宫格平均;每格显示该象限的 Todo 列表 |
| FR-CON-57 | 拖动 Todo 跨象限 | P0 | 修改 `is_important` / `is_urgent`,emit `productivity:todo-updated`;Console 内 ↔ overlay 实时同步 |
| FR-CON-58 | 每象限颜色 + 标题可改 | P1 | 默认四象限色 + 滴答风格命名;用户可在设置改 |

#### 5.4.4 番茄专注模块视图(FR-CON-59~62)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-59 | 当前会话面板 | P0 | 有进行中会话时,中栏顶部固定显示大胶囊(倒计时 + 关联任务 + 中断按钮);无会话时显示快速启动 |
| FR-CON-60 | 历史统计图 | P0 | 中栏下方显示日/周/月柱状图(`recharts` 或 SVG 手绘);每柱可点击查看当日明细 |
| FR-CON-61 | 任务关联跳转 | P0 | 历史明细中点某条记录的关联任务,Console 切到任务模块并定位该 Todo |
| FR-CON-62 | 干扰记录详情 | P1 | 历史明细可展开"干扰次数"附带文字说明 |

#### 5.4.5 习惯打卡模块视图(FR-CON-63~67)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-63 | 习惯列表(中栏) | P0 | 每行:emoji + 名称 + 本周 7 圆点 + 当前 streak + 月达成率;参考主 PRD §5.4 截图 |
| FR-CON-64 | 习惯详情(右栏) | P0 | 本月数 / 总数 / 月达成率 / 当前 streak / 年度进度 / 完整月历网格 / 上下月切换 |
| FR-CON-65 | 年度热力图视图 | P0 | 详情顶部 tab:日历 / 热力图(GitHub 风格)|
| FR-CON-66 | 列表内直接打卡 | P0 | 中栏某行的圆点可点击打卡(今日);emit `productivity:habit-logged` |
| FR-CON-67 | 习惯归档 | P0 | 右栏底部"归档此习惯";归档后列表底部"已归档"折叠区可查 |

#### 5.4.6 项目管理模块视图(FR-CON-68~75)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-68 | 看板选择 | P0 | 中栏顶部下拉看板选择器;sidebar 二级显示最近 3 个看板 |
| FR-CON-69 | 看板视图(Kanban) | P0 | 列水平排列;每列内卡片垂直堆叠;支持横向滚动;列宽固定 280px |
| FR-CON-70 | 表格视图(Table) | P0 | 中栏顶部 tab 切换;每行一张卡片,列:标题/状态(对应 list)/Labels/截止日/checklist 进度 |
| FR-CON-71 | 总览视图 | P1 | 多看板汇总,每看板一个卡片显示卡片数 + 列分布 |
| FR-CON-72 | 卡片详情(右栏) | P0 | 标题 / 描述 / 截止日 / Labels / checklist / 链接附件 / 关联 Todo |
| FR-CON-73 | 拖卡片改状态 | P0 | 看板视图拖卡片跨列;emit `project:card-moved`;overlay 端的项目 Widget 实时刷新 |
| FR-CON-74 | 跨模块拖动:项目卡片 → Todo | P0 | 在任务模块中,从 sidebar 拉项目模块的某卡片到列表(支持 drag from project to task),自动创建关联 Todo;反之亦可 |
| FR-CON-75 | 看板桌面 Widget 入口 | P1 | 看板详情右上角"添加到桌面"按钮,新建一个 Widget Grid 显示此看板精简版 |

#### 5.4.7 标签管理模块视图(FR-CON-76~80)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-76 | Label 列表 | P0 | 中栏每行:色块 + 名称 + emoji + 引用计数(分实体类型显示)|
| FR-CON-77 | Label 详情 | P0 | 右栏分组显示该 Label 下的所有实体:Todo / 习惯 / 便签 / 剪贴板 / Grid Item / 项目卡片;点击实体跳转对应模块并定位 |
| FR-CON-78 | 新建 / 编辑 Label | P0 | 中栏顶部"+ 新建",右栏出现表单(名称 / 颜色 / emoji)|
| FR-CON-79 | 删除 Label 处理 | P0 | 删除时弹确认对话框,提示"将解除 N 个实体的关联";确认后 emit `labels:deleted` + 级联 `labels:unassigned` |
| FR-CON-80 | Label 层级(P1) | P1 | 主 PRD FR-LB-03 的 P1 项;Console 显示树形 |

#### 5.4.8 时间进度条模块视图(FR-CON-81~83)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-81 | 进度条列表 | P0 | 中栏一行一条:名称 + 模式(进度/倒计时)+ 当前百分比或剩余时间 + 颜色色块 |
| FR-CON-82 | 进度条详情 | P0 | 右栏:大号可视化(条/环)+ 编辑表单(起止时间/颜色/样式)|
| FR-CON-83 | 一键创建预置 | P0 | 中栏顶部按钮:今年/本月/本周/今天;一键创建对应预置进度条 |

#### 5.4.9 设置模块视图(FR-CON-84~95)

设置走二级 sidebar:左侧子分类 + 右侧表单/详情。

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-84 | 账号子页 | P0 | 当前账号 / 头像 / 登录登出 / 修改密码 / 双因素 / 账号删除入口 |
| FR-CON-85 | 外观子页 | P0 | 主题(系统/亮/暗/高对比) / Accent / 密度 / 字体大小 / 减少动画 / sidebar 折叠默认 |
| FR-CON-86 | 快捷键子页 | P0 | 表格显示所有快捷键(主 PRD §6.4 + 各 plugin 注册);可点击修改;冲突检测(同一组合警告)|
| FR-CON-87 | 数据子页 | P0 | 导出全部数据(JSON / Markdown) / 导入 / 诊断信息导出(TECHNICAL §1.3.3) / 数据库 vacuum / 清空缓存 |
| FR-CON-88 | 隐私子页 | P0 | 剪贴板录制开关 / App 黑名单 / 屏幕共享行为 / 敏感模式 / 错误上报 opt-in |
| FR-CON-89 | 插件子页 | P0 | 已安装 plugin 列表(从 `pluginRegistry.getAllEnabled()`)/ 静态目录浏览 / 启用禁用 |
| FR-CON-90 | 同步子页 | P0 | 同步状态 / 上次同步时间 / 手动触发 / 错误信息 / 选择性同步开关(剪贴板/番茄不上传是固定项)|
| FR-CON-91 | 关于子页 | P0 | 版本号 / 构建号 / Channel(DMG/MAS)/ 检查更新 / 开源依赖列表 / 反馈邮箱 |
| FR-CON-92 | 设置项变更即时生效 | P0 | 主题、密度、字体、动画开关:0 延迟;快捷键修改:重启 App 或 5 秒内生效;同步设置:下次同步生效 |
| FR-CON-93 | 设置同步范围 | P0 | 跨设备同步的设置:外观偏好 / 快捷键 / 隐私(部分);**不同步**:窗口位置/大小、sidebar 折叠状态、密度(密度因设备屏幕大小而异)|
| FR-CON-94 | 设置搜索 | P1 | 设置页顶部搜索框,模糊匹配设置项跳转 |
| FR-CON-95 | 设置回滚 | P1 | "恢复默认"按钮;子页粒度 |

### 5.5 全局搜索 Cmd+K(FR-CON-96~105)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-96 | 唤起方式 | P0 | `Cmd+K`(在 Console 内 / 在 overlay 模式按下后聚焦 Console 并打开)|
| FR-CON-97 | 搜索 UI 形态 | P0 | 模态对话框,居中 640×480,带阴影遮罩;Esc 关闭 |
| FR-CON-98 | 输入即搜 | P0 | 用户每键入一个字符,200ms debounce 后触发搜索 |
| FR-CON-99 | 结果分组 | P0 | 按实体类型分组:Todo / 项目卡片 / 习惯 / Label / 便签 / 剪贴板 / 文件名 / 设置项 / 模块跳转;每组最多前 5,按 enter 进入"显示更多"全列表 |
| FR-CON-100 | 命令面板模式 | P0 | 以 `>` 开头切换到命令模式:`> 新建 Todo` / `> 切换到日历` / `> 主题:暗色` 等;支持模糊匹配 |
| FR-CON-101 | 键盘流 | P0 | ↑↓ 选项;Enter 打开;Tab 切分组;Cmd+1~9 跳到第 N 个结果 |
| FR-CON-102 | 历史搜索 | P0 | 输入框为空时显示最近 5 次搜索 |
| FR-CON-103 | 结果跳转后 Console 状态 | P0 | 选中"Todo: 提交报告"后,Console 切到任务模块、定位该 Todo、detail 打开、Cmd+K 关闭 |
| FR-CON-104 | 搜索性能 | P0 | 1 万条 Todo + 1 万条剪贴板 + 文件名索引下,P95 ≤ 300ms |
| FR-CON-105 | 搜索范围设置 | P1 | Cmd+K 内部右上角 toggle:勾选哪些数据源参与搜索;默认全开 |

### 5.6 键盘流与快捷键(FR-CON-106~115)

| 类别 | 快捷键 | 动作 | 优先级 |
|---|---|---|---|
| FR-CON-106 全局(Console 内) | `Cmd+1`~`Cmd+9` | 切 sidebar 前 9 个模块 | P0 |
|  | `Cmd+K` | 全局搜索 | P0 |
|  | `Cmd+,` | 跳转设置 | P0 |
|  | `Cmd+\` | sidebar 折叠 | P0 |
|  | `Cmd+Shift+]` | detail 折叠 | P0 |
|  | `Cmd+Shift+R` | 强制刷新当前模块视图 | P0 |
|  | `Cmd+W` | 隐藏 Console 窗口 | P0 |
|  | `Cmd+Q` | 退出整个 App | P0 |
| FR-CON-107 List 通用 | `j` / `↓` | 下一项 | P0 |
|  | `k` / `↑` | 上一项 | P0 |
|  | `g g` | 跳到首项(vim 风格) | P1 |
|  | `G` | 跳到末项 | P1 |
|  | `Enter` | 打开/展开 | P0 |
|  | `Space` | toggle(勾选/打卡)| P0 |
|  | `Cmd+A` | 全选 | P0 |
|  | `Cmd+Click` / `Shift+Click` | 多选 | P0 |
|  | `Delete` / `Backspace` | 删除选中(确认弹窗)| P0 |
|  | `N` | 新建(在任务/项目/Label 模块)| P0 |
|  | `/` | 在当前 list 内搜索/过滤 | P0 |
| FR-CON-108 任务模块 | `D` | 设置截止日(picker)| P0 |
|  | `P` | 设置优先级 | P0 |
|  | `L` | 加 Label | P0 |
|  | `M` | 移动到清单 | P0 |
|  | `Cmd+Shift+P` | 启动番茄绑定当前任务 | P0 |
| FR-CON-109 日历模块 | `T` | 跳到今天 | P0 |
|  | `←` / `→` | 上一段/下一段(月/周/日)| P0 |
|  | `1` / `2` / `3` / `4` | 月/周/日/Agenda 视图 | P0 |
| FR-CON-110 习惯模块 | `Space` | 当日打卡 | P0 |
|  | `←` / `→` | 月历翻页 | P0 |
| FR-CON-111 项目模块 | `←` / `→` | 看板视图卡片在列间移动 | P0 |
|  | `Enter` | 打开卡片详情 | P0 |
|  | `A` | 归档卡片 | P0 |
| FR-CON-112 全键盘可达 | — | 所有 P0 操作必须有快捷键或 Tab 焦点可达,无鼠标也可完成 | P0 |
| FR-CON-113 焦点环 | — | Tab 焦点必须可见(2px accent 描边);macOS 默认 focus ring 行为 | P0 |
| FR-CON-114 快捷键提示 | — | 长按 `Cmd` 200ms 显示当前模块可用快捷键 cheat sheet 浮层 | P1 |
| FR-CON-115 用户自定义 | — | 设置 > 快捷键 可改;FR-CON-106 全局组合不允许重复;模块内可重复 | P0 |

### 5.7 通知中心(FR-CON-116~123)

> 通知中心是 Console 内嵌的右上角铃铛 + 抽屉;**不是** macOS 系统通知中心(系统通知仍由 NotificationOps 走 macOS 原生)。

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-116 | 铃铛入口 | P0 | 标题栏右上,有未读时显示红点 |
| FR-CON-117 | 通知抽屉 | P0 | 点击展开 400×600 抽屉,3 个 tab:同步状态 / 任务到期 / AI 输出 |
| FR-CON-118 | 同步 tab | P0 | 显示:当前状态(idle / syncing / failed)、上次成功时间、最近 5 条同步日志(push/pull/时长/错误)|
| FR-CON-119 | 任务到期 tab | P0 | 显示:已过期 + 今日到期 + 即将到期(3 小时内)的 Todo;点跳转;可一键完成或推迟 |
| FR-CON-120 | AI 输出 tab | P1 | Phase 4 启用;显示 AI 自然语言建任务建议、剪贴板分类建议;每条可接受或忽略 |
| FR-CON-121 | 通知聚合 | P0 | 同类型通知 5 分钟内合并(如连续 3 次同步失败合并为一条带"重试"按钮)|
| FR-CON-122 | 清空 / 标记已读 | P0 | 每 tab 底部"全部标记已读" + "清空" |
| FR-CON-123 | 与 macOS 系统通知关系 | P0 | 关键事件(Todo 到期 / 番茄结束 / 同步失败)同时走 macOS 系统通知;通知中心仅作历史回看 |

### 5.8 多显示器 / 多 Space(FR-CON-124~128)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-124 | Console 是普通窗口 | P0 | 不参与 overlay 的 NSWindowLevel 分层;使用 macOS 标准 collection behavior(`default`,可移动至任一 Space,跟随焦点)|
| FR-CON-125 | 单 Space 显示 | P0 | Console **不**加 `canJoinAllSpaces`;用户切到别的 Space 时 Console 不跟随,留在原 Space |
| FR-CON-126 | Stage Manager 兼容 | P0 | Stage Manager 开启时,Console 作为单独 stage 行为正常;不被 overlay 干扰 |
| FR-CON-127 | 全屏 App 行为 | P0 | 用户全屏其他 App 时,Console 留在原 Space;切回桌面 Space 时仍在 |
| FR-CON-128 | 多屏支持 | P0 | 窗口可拖到任一显示器;关闭前的屏幕 ID + 屏幕内 frame 都存;开机若原屏不在,降级到主屏居中 |

### 5.9 主题 / 密度 / 字体(FR-CON-129~133)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-129 | 跟随系统主题 | P0 | 监听 `NSAppearance` 变化,0 延迟切换;CSS variable 实现,不重渲染整树 |
| FR-CON-130 | 手动主题覆盖 | P0 | 设置 > 外观 强制亮/暗/高对比,跨设备同步 |
| FR-CON-131 | Accent 自定义 | P0 | 8 预设 + 跟随系统 accent;影响选中色、focus ring、按钮 primary 色 |
| FR-CON-132 | 密度切换 | P0 | 紧凑/标准/宽松,影响 list 行高 + sidebar padding;**不**跨设备同步 |
| FR-CON-133 | 字体大小 | P0 | 三档:S(13/14/15) / M(14/15/16,默认) / L(15/16/18);macOS Dynamic Type 暂不接入(P2)|

### 5.10 与 overlay 模式的互通(FR-CON-134~140)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-134 | 数据实时一致 | P0 | Console 改 Todo / 习惯 / 项目卡片 → 走 `productivity:*` / `project:*` 事件 → overlay Grid 立即刷新(P95 ≤ 200ms)|
| FR-CON-135 | overlay 反向通知 Console | P0 | overlay 改数据(Grid 内勾选 Todo)→ 同一事件 → Console 当前可见列表立即刷新 |
| FR-CON-136 | 从 overlay 唤起 Console | P0 | Control 窗 / AI Cube / Widget 上的"打开控制台"按钮 / `Cmd+Shift+Space` |
| FR-CON-137 | 从 Console 创建 overlay Grid | P0 | Console 内任务/项目模块的卡片可拖到桌面,触发 `organizer:create-grid-request`(新 Grid 内容预填该 list/board)|
| FR-CON-138 | Console 与 overlay 同时开 | P0 | 两者可并存;不互相干扰焦点;Cmd+Tab 时 Console 与 overlay 共享同一 App 标识 |
| FR-CON-139 | overlay 关闭时 Console 保留 | P0 | 用户在设置关闭 overlay 模式,Console 仍可用作独立 App;反之亦然 |
| FR-CON-140 | 同步状态共用 | P0 | 一处显示"同步中"图标,另一处也显示;同一 `account:sync-started` 事件 |

### 5.11 Onboarding / Empty / Error 状态(FR-CON-141~150)

#### Onboarding

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-141 | 首次进入引导 | P0 | 第一次打开 Console:① 5 步浮层 tour(sidebar / list / detail / Cmd+K / 快捷键)② 跳过按钮永远可见;状态存 `settings.console.onboarding_done` |
| FR-CON-142 | 模块首次引导 | P1 | 用户首次进入"四象限"/"项目"/"标签管理"时,小型 inline 引导卡片(可关闭)|
| FR-CON-143 | 引导跳过策略 | P0 | 用户跳过后,设置 > 关于 提供"重新查看引导"入口 |

#### Empty States(每模块必须有)

| 模块 | Empty 文案 + 主要 CTA |
|---|---|
| FR-CON-144 任务 | "暂无任务,按 `N` 新建你的第一个 Todo" + 大按钮 |
| 桌面日历 | 月历正常显示,只是没事件:无需特殊 empty state |
| 四象限 | 四宫格灰底 + "把任务拖到任一象限开始整理" |
| 番茄 | "还没启动过番茄,按 `Cmd+Shift+P` 开始 25 分钟专注" |
| 习惯 | "暂无习惯,从习惯库选一个常见习惯,或 `N` 新建" + 习惯库入口 |
| 项目 | "暂无项目,`N` 新建一个看板" |
| 标签 | "暂无 Label,`N` 新建" |
| 进度条 | "暂无进度条,试试一键创建『今年』" |

P0 要求:每个 empty state 都有插画 + CTA + 快捷键提示。

#### Error States

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-145 | 数据库锁错误 | P0 | 列表加载失败时显示错误卡:"加载失败" + "重试"按钮 + "查看诊断信息";后台自动重试 3 次 |
| FR-CON-146 | 同步失败 | P0 | 通知中心同步 tab 显示红色 + 错误描述 + 重试按钮;Console 标题栏出现"⚠️ 同步失败"小标志 |
| FR-CON-147 | 网络断开 | P0 | 离线时所有写操作仍可执行(本地优先);通知中心顶部黄色提示"当前离线,变更将在恢复后同步" |
| FR-CON-148 | 插件加载失败 | P0 | sidebar 对应模块灰显 + tooltip 显示"插件 X 加载失败";点击跳设置 > 插件 显示错误 |
| FR-CON-149 | 写操作冲突 | P1 | 同一 entity 被本机+其他端并发改:last-write-wins(对齐 PRD §5.9.2 FR-SY-03);冲突时通知中心提示"X 项目可能有冲突,点击查看" |
| FR-CON-150 | 严重错误兜底 | P0 | 整个 Console 渲染崩溃时,显示全屏 ErrorBoundary:"出错了,请提交诊断信息" + 重启 Console 按钮 + 导出日志按钮 |

### 5.12 i18n / 无障碍(FR-CON-151~158)

#### i18n

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-151 | 三语言支持 | P0 | 简体中文 / 繁体中文 / 英文;默认跟随系统 |
| FR-CON-152 | 文案 token 化 | P0 | 所有 UI 文案走 `i18n/` JSON,不允许硬编码中文/英文 |
| FR-CON-153 | 日期格式 | P0 | 跟随用户区域设置;可在设置覆盖(YYYY-MM-DD / MM/DD/YYYY / DD.MM.YYYY)|
| FR-CON-154 | 数字格式 | P0 | 跟随区域设置(千位分隔符 / 小数点)|

#### 无障碍

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-155 | VoiceOver | P0 | 所有交互元素有 `aria-label`;list 是 listbox role;sidebar 是 navigation;detail 是 main;焦点顺序合理 |
| FR-CON-156 | 高对比度 | P0 | 设置 > 外观开启后,边框 +1px、文字对比度提升、color-only 信号补充图形/文字 |
| FR-CON-157 | 减少动画 | P0 | 设置开启或系统 Reduce Motion 检测到 → 所有 ≥ 100ms 动画降为 0 |
| FR-CON-158 | 颜色对比 | P0 | 文字与背景对比度 ≥ 4.5:1(WCAG AA);大字 ≥ 3:1;Color-only 状态(如优先级)同时有形状或文字标记 |

---

## 6. 非功能需求(Console 特化)

主 PRD §6 列了全局 NFR,本节补 Console 特有的:

### 6.1 性能预算

| 指标 | 目标 | P95 | 越线动作 |
|---|---|---|---|
| Console 冷启动(从快捷键到三栏渲染完成) | ≤ 2.0s | 3.0s | 阻塞合并;改 lazy import |
| 模块切换(sidebar 点 → 中栏内容首次出现) | ≤ 100ms | 200ms | 改预加载 / 虚拟列表 |
| List 滚动 fps | 60fps | 50fps | 强制虚拟化 |
| Cmd+K 搜索响应 | ≤ 300ms | 500ms | FTS5 索引 / 分片 |
| 数据写入到 overlay 刷新 | ≤ 200ms | 400ms | 检查事件管道 |
| 主题切换 | 0ms | — | CSS variable 不重渲染 |
| 拖拽 reorder 视觉反馈 | 16ms(一帧) | — | dnd-kit drop-down 算法优化 |
| 内存(Console 单独运行) | ≤ 150 MB | 250 MB | 内存泄漏排查 |

### 6.2 可观测性

复用 TECHNICAL_REQUIREMENTS §1.3 全局规则,Console 额外埋点:

- Performance.mark:`console.open` / `console.module-switch` / `console.search-query`
- 错误链:Console 内任何渲染错误带 module + sub-state 上报
- 设置 > 数据 > 诊断信息额外导出:Console nav-state + pane widths + last sync trace

### 6.3 可用性指标

| 指标 | 目标 |
|---|---|
| 全键盘完成"新建 Todo → 加 Label → 设截止日 → 启动番茄"流程 | ≤ 12 次按键 |
| 从 Cmd+Shift+Space 到看到自己昨天的工作记录(到日历) | ≤ 5 秒 |
| 三栏布局学习成本(新用户) | 首次完成 5 步 onboarding 后即可独立用 |

---

## 7. 技术架构

### 7.1 plugin-console 在系统中的位置

```
┌─────────────────────────────────────────────────────────────────┐
│                  apps/desktop(Tauri 宿主)                       │
│                                                                  │
│  Console 窗口(window type = "console")                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           <ConsoleHost />(plugin-console 提供)             │ │
│  │  ┌──────────┬───────────────┬─────────────────┐            │ │
│  │  │ Sidebar  │  List(中栏)  │  Detail(右栏)  │            │ │
│  │  │ (plugin- │  <ConsoleView │  <ConsoleView   │            │ │
│  │  │  console)│   slot> 当前  │   slot> 当前    │            │ │
│  │  │          │   模块提供    │   模块提供      │            │ │
│  │  └──────────┴───────────────┴─────────────────┘            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▲                                   │
│                              │ host inject                       │
└──────────────────────────────┼───────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐      ┌────────────────┐    ┌─────────────────┐
│plugin-       │      │plugin-         │    │plugin-          │
│productivity  │      │calendar        │    │project          │
│ConsoleView   │      │ConsoleView     │    │ConsoleView      │
│(Todo/番茄/   │      │(月/周/日/      │    │(看板/表格)    │
│ 习惯/四象限)│      │ Agenda)        │    │                 │
└──────────────┘      └────────────────┘    └─────────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               ▼
                       ┌───────────────┐
                       │ core-data /   │
                       │ core-events / │
                       │ core-shortcuts│
                       └───────────────┘
```

### 7.2 plugin-console 的职责边界

`plugin-console` **只**提供:

- `<ConsoleHost />`:三栏外壳 + sidebar 渲染逻辑(调 `pluginRegistry.getConsoleSidebarEntries()`)
- 通知中心组件(铃铛 + 抽屉)
- 全局搜索 Cmd+K 模态(搜索结果聚合走 core-events 跨 plugin)
- 设置容器(子页由各 plugin 提供 `SettingsSection`)
- 三栏宽度 / 折叠 / 模块切换的 state 管理(写入 `settings`)
- Onboarding tour
- 主题 / 密度 / Accent 的 CSS variable 注入

`plugin-console` **不做**:

- 任何业务逻辑(Todo CRUD / 习惯打卡 / 项目卡片移动 …)→ 都在对应 plugin 的 `ConsoleView`
- 数据访问 → 通过 `core-data` 注入
- 原生 API → 通过 `core-window` / `core-shortcuts` 注入

### 7.3 数据流

```
用户操作(Console 内)
   │
   ▼
plugin-X 的 ConsoleView 组件
   │
   ├─ 读:core-data driver(SQLite 桌面 / REST 网页)
   │
   └─ 写:core-data driver
            │
            ├─ 写本地 SQLite(桌面端)
            ├─ emit core-events 事件(例如 productivity:todo-updated)
            │
            ▼
        其他窗口监听(overlay Grid、Control widget)
            │
            ▼
        各窗口本地缓存更新 → 重渲染
```

关键点:

- Console 与 overlay **不直接共享 React 状态**(它们是不同 Tauri 窗口、不同 React 树)
- 数据一致性走"两边都监听同一 SQLite + 同一事件流"
- 事件 payload 只带 ID + diff,不带完整数据,接收方去 `core-data` 重读

### 7.4 与网页版(apps/web)的关系

- `plugin-console` 的代码 100% 平台无关(对齐 ADR-0003 + 红线 4/13)
- 桌面端打包进 Tauri Console 窗口;Web 端打包进 `apps/web` SPA
- 网页版同样调用 `<ConsoleHost />`,但传入 REST data driver + 无 native 能力的 host
- 见 `sub-prds/web/PRD.md`(另一 agent 负责)

### 7.5 manifest 关键字段(plugin-console)

参考 PLUGIN_SDK §9.6:

```json
{
  "name": "console",
  "version": "0.1.0",
  "displayName": "Console",
  "description": "整体控制台三栏外壳",
  "enabled": true,
  "dependencies": ["@repo/core", "@repo/ui"],
  "contentTypes": [],
  "windows": { "overlay": false, "control": false, "grid": false, "console": true, "web": true, "dedicated": "console" },
  "events": {
    "emit": ["console:navigate-module", "console:sidebar-toggled"],
    "listen": ["account:sync-*", "productivity:*", "project:*", "labels:*", "ai:query-response"]
  },
  "tauriCommands": ["open_console_window", "close_console_window"],
  "shortcuts": [
    { "id": "open-console", "default": "Cmd+Shift+Space", "description": "打开控制台" },
    { "id": "console-search", "default": "Cmd+K", "description": "全局搜索" },
    { "id": "console-settings", "default": "Cmd+,", "description": "打开设置" }
  ],
  "data": { "tables": [], "endpoints": [] }
}
```

---

## 8. 数据模型

Console 无独立表(对齐主 PRD §5.13.4),只在 `settings` 表中存以下 key:

| key | 类型(value_json) | 同步? | 说明 |
|---|---|---|---|
| `console.nav_state` | NavState JSON(见 §3.3)| 否(每设备独立)| 当前活动模块 + 子状态 |
| `console.window_frame` | `{x, y, w, h, screenId}` | 否 | 关闭前的窗口位置/大小 |
| `console.pane_widths` | `{sidebar, list, detail}` | 否 | 三栏宽度 |
| `console.sidebar_collapsed` | bool | 否 | sidebar 折叠 |
| `console.detail_collapsed` | bool | 否 | detail 折叠 |
| `console.density` | "compact" \| "standard" \| "comfortable" | 否 | 密度(设备相关)|
| `console.theme` | "system" \| "light" \| "dark" \| "high-contrast" | 是 | 主题 |
| `console.accent` | "system" \| "blue" \| "purple" \| ... | 是 | accent |
| `console.font_size` | "S" \| "M" \| "L" | 是 | 字号档 |
| `console.reduce_motion` | bool | 是 | 减少动画 |
| `console.calendar.layers` | `{todo, habit, pomodoro}` bools | 是 | 日历图层开关 |
| `console.hidden_modules` | string[] | 是 | sidebar 隐藏的模块 ID |
| `console.search_history` | string[](最多 20) | 否 | Cmd+K 最近搜索 |
| `console.onboarding_done` | bool | 是 | 首次引导完成 |

---

## 9. 验收清单(M2 → M3 各阶段)

### M2.5(Phase 2.5 末)真机验收

#### 必过(P0)

- [ ] Console 窗口在 macOS Sonoma + Sequoia 双系统启动 + 关闭 + 隐藏 + 最小化 + 全屏全部正常
- [ ] `Cmd+Shift+Space` 唤起 Console;再按聚焦;不新建第二窗口
- [ ] 关闭 (✕) 隐藏窗口;Cmd+Q 退出 App;首启的"记住该行为"提示出现
- [ ] 关闭再开:模块、子状态、三栏宽度、sidebar/detail 折叠全部恢复
- [ ] 9 个 sidebar 模块全部能渲染并切换,无空白;`Cmd+1~9` 切换正常
- [ ] Sidebar 折叠 (`Cmd+\`) / 展开;detail 折叠 (`Cmd+Shift+]`) / 展开;窄屏 detail 变抽屉
- [ ] 三栏分隔条可拖动改宽度;双击恢复;状态持久化
- [ ] 任务模块:CRUD / 子任务 / Labels / 优先级 / 截止日 / 启动番茄链路完整;`N` 新建 + `j/k` 导航 + `Space` 完成全键盘可达
- [ ] 桌面日历:月/周/日/Agenda 切换;拖 Todo 改期;图层开关;`T` 跳今日
- [ ] 四象限:拖 Todo 跨象限改 important/urgent;Console ↔ overlay 实时同步
- [ ] 番茄模块:当前会话面板 + 历史柱状图;关联任务跳转
- [ ] 习惯模块:列表 7 圆点 + streak + 月达成率;详情月历 + 热力图;Space 打卡
- [ ] 项目模块:看板视图 + 表格视图;卡片拖列;卡片 ↔ Todo 互通;归档
- [ ] 标签模块:Label CRUD + 引用计数 + 详情聚合各 entity_type 项
- [ ] 进度条模块:一键创建预置 / 自定义
- [ ] 设置模块:9 个子页(账号/外观/快捷键/数据/隐私/插件/同步/关于)+ 主题/密度/字体即时生效
- [ ] Cmd+K 全局搜索:分组结果 + 跳转;命令面板模式 `>`;搜索响应 P95 ≤ 300ms
- [ ] 通知中心:同步 / 任务到期 / AI(灰显)tab;红点 + 已读 + 清空
- [ ] Console ↔ overlay 数据实时一致:Console 改 Todo,overlay Grid 200ms 内刷新
- [ ] 多 Space 行为:Console 不跟随用户切 Space;Stage Manager 兼容
- [ ] 多屏:窗口可拖到任一显示器;关闭再开恢复;原屏不存在降级到主屏
- [ ] 主题:跟随系统切换 0 闪烁;手动覆盖;Accent 切换;高对比度
- [ ] 密度:紧凑/标准/宽松三档切换;行高真的变化
- [ ] 字体:S/M/L 三档;系统字体不需额外下载
- [ ] Onboarding:首启 5 步 tour;跳过状态持久化
- [ ] Empty states:每个模块都有插画 + CTA + 快捷键提示
- [ ] Error:数据库锁 / 同步失败 / 离线 / 插件加载失败 / 严重崩溃 5 种状态都有清晰呈现
- [ ] i18n:简中 / 繁中 / 英文切换;无硬编码文案
- [ ] 无障碍:VoiceOver 走通 sidebar→list→detail 焦点;减少动画生效;高对比度生效
- [ ] 性能:冷启动 P95 ≤ 3s;模块切换 P95 ≤ 200ms;list 1 万条记录 60fps 滚动

#### 应过(P1,Phase 3 补)

- [ ] 系统 .ics 订阅只读叠加(若 P1 决定做)
- [ ] AI 输出 tab(随 Phase 4 启用)
- [ ] 设置搜索 / 设置回滚
- [ ] 长按 Cmd 显示快捷键 cheat sheet
- [ ] Label 层级

### M3 验收(进入 Phase 3 前必过)

Console 必须在 M2.5 验收全过的基础上,再补:

- [ ] Console 持续运行 7 天无内存泄漏(测试时连续开 7 天 + 周期性操作脚本)
- [ ] Console + overlay 双开 24 小时无崩溃
- [ ] Cmd+K 在数据量 50K Todo + 50K 剪贴板下仍 P95 ≤ 500ms

---

## 10. 风险与缓解(Console 特有)

| ID | 风险 | 等级 | 缓解 |
|---|---|---|---|
| R-CON-01 | 三栏拖动 / 列表虚拟化性能不达标(60fps) | 🟡 中 | M2.5 第 2 周做性能 spike,固定 dnd-kit + react-virtuoso 选型;若卡顿,降级为非虚拟 + 限 5K 条 |
| R-CON-02 | 模块切换闪烁(中栏 + detail 同时切换) | 🟡 中 | 120ms 淡入淡出 + 预加载相邻模块的 ConsoleView;在测试设备实测 |
| R-CON-03 | Console ↔ overlay 数据漂移(事件丢失) | 🔴 高 | core-events 提供 in-memory + Tauri event 两套 driver;关键事件加 ack;Console 启动时全量 pull 一次校准 |
| R-CON-04 | plugin 间 ConsoleView slot 边界不清 | 🟡 中 | manifest 强制声明 + 启动期 schema 校验;PR review 红线 |
| R-CON-05 | Cmd+K 跨 plugin 搜索响应慢 | 🟡 中 | 各 plugin 提供 search adapter,plugin-console 并行调用 + 200ms 截断;FTS5 索引 |
| R-CON-06 | 平台无关约束被破坏(plugin 偷调 Tauri API) | 🟡 中 | CI lint:plugin 包内禁止 import `@tauri-apps/api`;ADR-0003 红线 4/13 |
| R-CON-07 | 多窗口持久化竞争(Console 与 overlay 同时改 settings) | 🟡 中 | settings 表用 SQLite WAL + 单写者(Rust 侧 settings_writer command);Console 写设置必须走该 command |
| R-CON-08 | 设置项跨设备同步语义不一致 | 🟡 中 | settings 表加 `sync_scope` 列;明确 device-local vs global;同步 manifest 校验 |
| R-CON-09 | macOS Sequoia 标题栏变化 / Stage Manager 行为变化 | 🟢 低 | M2.5 末双系统真机验收;若 Sequoia 行为异常,降级到自绘 titlebar 路径(留作 fallback) |
| R-CON-10 | 全键盘可达漏覆盖 | 🟡 中 | 每个 FR 验收都跑一次纯键盘流;a11y 单测覆盖 list 焦点环 |

---

## 11. 待办(交付前需补)

- [ ] **Sidebar 视觉稿**:Figma 或手绘,锁定 sidebar 顶部 logo / 模块 icon / 徽标位置
- [ ] **空状态插画**:每模块 1 张 SVG,需要插画师 / AI 生成
- [ ] **快捷键全表锁定**:FR-CON-106~111 已列基线,需与 plugin-productivity / plugin-project 的 plugin-local 快捷键对齐(避免冲突)
- [ ] **核心 plugin 的 ConsoleView 接口确认**:与 plugin-productivity / plugin-calendar / plugin-project / plugin-labels 各自的 design.md 对齐,确认每个 ConsoleView 入参 / 出 callback
- [ ] **网页版的 host 接口差异**:与 sub-prds/web 协作锁定 host 注入接口(file API stub / notification stub / shortcut stub)
- [ ] **VoiceOver 走查手册**:M2.5 末做一次完整 a11y 走查,录像存档
- [ ] **i18n 文案首版**:简中先全,繁中 + 英文 M3 前补
- [ ] **MAS 沙箱下 Console 的差异**:沙箱版没有部分原生权限,影响仅设置 > 隐私的选项可见性,需在 manifest `platforms.macos = "both"` 时做兼容
- [ ] **dnd-kit + react-virtuoso 性能 spike 报告**(R-CON-01 触发):M2.5 第 2 周交付

---

## 12. 文档变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-05-14 | v0.1-draft | 首版,基于主 PRD §5.13 展开;FR-CON-13~158 共 146 条;5.1~5.12 + §7 架构 + §8 settings + §9 验收 + §10 风险 + §11 待办 | Claude(subagent) |

— END of Console PRD v0.1-draft —
