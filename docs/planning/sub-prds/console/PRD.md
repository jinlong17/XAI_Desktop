# Console 子 PRD — XAI_Desktop 整体控制台

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §5.13)|
| 范围 | 整体控制台窗口的完整规格 |
| 平台 | macOS Console window(Tauri 标准窗口);网页版另见 `sub-prds/web/PRD.md` |
| 归属 Phase | Phase 2.5(M2 → M3 之间,4-6 周)|
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 最后更新 | 2026-05-16 |
| 状态 | v0.2-DRAFT(范围收敛 + 契约硬化第一轮) |
| 关联审查 | 2026-05-15 收到 Console 子 PRD 审查报告(8 Critical / 12 Major / 5 Minor / 5 增补);v0.2 已全部回应,详见 §13 |

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

### 0.1 范围红线(v0.2 收敛)

下面这些 v0.1 越界过的范围,本版本明确**移交回对应业务 plugin PRD**,Console PRD 不再展开:

| 越界点(v0.1 位置)| v0.2 处理 | 归属 |
|---|---|---|
| Todo 描述区图片粘贴 / 附件(FR-CON-44 旧)| **删除**;父 PRD §5.2 line 189 明确"Todo 不做附件" | plugin-productivity PRD(若 v1.x 评估)|
| Todo 多选批操作(FR-CON-36 旧)| **降级 P2**;父 PRD §5.2 line 189 明确"Todo 不做批量操作" | 同上 |
| Todo 复杂 RRULE UI | **删除**;Console 只调用 plugin-productivity 暴露的简化 picker | plugin-productivity PRD |
| 账号删除 / 修改密码 / 2FA 表单(FR-CON-84 旧)| **移交**;Console 只提供 `SettingsSection` 容器 + 路由 | plugin-account 子 PRD §5 |
| 数据库 vacuum / 诊断导出 UI(FR-CON-87 旧)| **移交**;Console 仅提供入口卡片 | plugin-account / sync 子 PRD |
| 插件启停 UI(FR-CON-89 旧)| **移交** | 未来 plugin-manager(v1.x)|
| 同步选择性开关 UI(FR-CON-90 旧)| **移交** | sync 子 PRD |
| 桌面日历 月/周/日/Agenda 完整能力(FR-CON-49~54 旧)| **降级 Phase 3 / P1**;M2.5 仅 sidebar 占位 + mock 接口 | plugin-calendar 子 PRD(Phase 3)|
| 习惯年度热力图(FR-CON-65 旧)| **降级 Phase 3 / P1** | plugin-productivity 增强(Phase 3)|
| AI 输出 tab(FR-CON-120 旧)| 保留**动态注册**;P0 不再要求灰显占位 | plugin-ai(Phase 4)|

Console PRD 只描述这些功能**在 Console 三栏外壳中如何被宿主、被路由、被搜索、被键盘操作**;具体业务规则与表单字段去对应子 PRD。

### 0.2 优先级体系(v0.2 重定义)

v0.1 的 P0/P1/P2 因数量过多失去"必做"含义。v0.2 拆成两条独立维度:

| 标签 | 含义 | M2.5 必过 |
|---|---|---|
| **P0-Shell** | `plugin-console` 外壳层必做,与具体业务 plugin 无关(窗口 / 三栏 / sidebar / 路由 / 设置容器 / 通知壳 / 搜索壳 / 主题 / a11y 基础)| ✅ 必过 |
| **P0-View** | Phase 2 已 Stable 的业务 plugin 在 Console 中的最小可用视图(productivity / labels / progress / settings 容器子页中由各 plugin 提供的子内容)| ✅ 必过 |
| **P0-Project** | plugin-project 联调最小视图(Phase 2.5 并行交付)| ✅ 必过 |
| **P1-Phase3** | Phase 3 才上(plugin-calendar 完整、习惯热力图、AI tab 动态、Label 层级、.ics 订阅、Cmd cheat sheet、设置搜索/回滚)| ⏸️ 占位即可 |
| **P2-Later** | v1.x 或 v2(sidebar 拖动重排、批量操作、看板 widget 入口、自定义象限色名)| ❌ 不做 |

后续 FR 表的"优先级"列改用上面 5 个标签,不再写裸 P0/P1/P2。验收清单(§9)按此分层。

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

### 3.1 Sidebar 模块树(v0.2 修订)

```
Console
├── 任务                              ← 默认进入模块(default activeModule)
│   ├── 📥 收件箱(pinned smart list, listId="smart:inbox") ← 默认子项
│   ├── 🌟 今日(listId="smart:today")
│   ├── 📅 本周(listId="smart:week")
│   ├── ✅ 已完成(listId="smart:done")
│   ├── 用户清单 1, 2, …
│   └── …
├── 桌面日历 [Phase 3 灰显占位]         ← M2.5 不可点;tooltip 显示"Phase 3 上线"
│   └── (Phase 3 才接入完整 ConsoleView)
├── 四象限
├── 番茄专注
│   ├── 当前会话(若有)
│   └── 历史统计
├── 习惯打卡
│   ├── 全部习惯(列表 + 周打卡圈)
│   └── 详情(选中后)
├── 项目管理
│   ├── 看板列表
│   └── 看板详情(看板/表格视图;总览 P1)
├── 标签管理
│   └── 单个 Label 详情(显示所有 entity_type 的关联项)
├── 时间进度条
└── 设置(永远在最底部)
    └── (子页由 plugin-account / plugin-productivity / plugin-widgets /
         sync / plugin-console 各自通过 SettingsSection slot 注册)
```

#### 3.1.1 不在 sidebar 树中的常驻能力

下面这些**不是 sidebar 节点**,但属于 Console 全局壳能力,在标题栏 / 浮层中提供入口:

| 能力 | 入口位置 | 不在 sidebar 树中的原因 |
|---|---|---|
| 全局搜索 / 命令面板 | 标题栏右上 `⌕` 图标 + `Cmd+K` 模态对话框 | 模态对话框,跨模块,不绑定单一路由;v0.1 把它写在 sidebar 是 IA 错误 |
| 通知中心 | 标题栏右上 `🔔` 抽屉 | 同上 |
| 当前账号 / 头像菜单 | 标题栏右上 `👤` | 同上 |
| 同步状态指示 | 标题栏 `🔔` 内 `同步` tab + 标题栏左侧云图标 | 不是业务模块;v0.1 把它写进 sidebar 模块徽标(FR-CON-24)是错的,v0.2 已修 |

### 3.2 Sidebar 设计原则

- 顺序按"P3 使用频次降序":任务(含 Inbox)→ 日历 → 四象限 → 番茄 → 习惯 → 项目 → 标签 → 进度条;设置垫底
- 每个模块入口由 `manifest.json` 的 `ui.consoleSidebar.{icon, order}` 声明(PLUGIN_SDK §3.1),Console 启动时调 `pluginRegistry.getConsoleSidebarEntries()` 渲染
- **收件箱(Inbox)是任务模块下的 pinned smart list**,不是顶层 sidebar 项。v0.1 把它放顶层导致路由 `activeModule="inbox"` 与"任务/收件箱"两种状态歧义,v0.2 统一为 `activeModule="tasks", listId="smart:inbox"`
- 设置永远在最底部

### 3.3 路由 / 状态保留(v0.2 修订)

Console 维护一个 `console:nav-state`(存 `settings` 表 key=`console.nav_state`):

```ts
type ActiveModule =
  | "tasks"        // 含 inbox / today / week / done / userLists
  | "calendar"     // Phase 3 才可用;P0 时强制重定向到 tasks
  | "matrix"
  | "pomodoro"
  | "habits"
  | "project"
  | "labels"
  | "progress"
  | "settings";

interface ConsoleNavState {
  activeModule: ActiveModule;
  modulePath: {
    tasks?: { listId: "smart:inbox" | "smart:today" | "smart:week" | "smart:done" | string /*user list uuid*/; selectedTodoId: string | null };
    calendar?: { view: "month" | "week" | "day" | "agenda"; anchorDateMs: number };  // Phase 3
    matrix?: { quadrantFocus: "Q1" | "Q2" | "Q3" | "Q4" | null };
    pomodoro?: { tab: "current" | "history"; historyAnchorMs: number };
    habits?: { selectedHabitId: string | null; detailTab: "month" | "heatmap" /* heatmap Phase 3 */ };
    project?: { boardId: string | null; view: "kanban" | "table" | "overview" /* overview P1 */; selectedCardId: string | null };
    labels?: { selectedLabelId: string | null };
    progress?: { selectedProgressId: string | null };
    settings?: { sectionId: string };  // sectionId 由 plugin 注册时声明
  };
  sidebarCollapsed: boolean;
  detailPaneCollapsed: boolean;
  paneWidths: { sidebar: number; list: number; detail: number };
  // 注:density 不放 nav-state,而是放独立的 `console.density` settings key,
  // 因为 density 是设备本地偏好(见 §4.3),与导航状态无关
}
```

切到别的模块再切回来,**必须**恢复到上次的 sub-state(选中项 + view + scroll position)。

**v0.2 路由不变式**:

1. `activeModule` 必须是上面 9 个常量之一;无 `inbox` 顶层模块(Inbox 是 `tasks/smart:inbox`)
2. 切到不存在 / 未加载 / 禁用的模块时,降级到默认 `tasks/smart:inbox` 并 emit `console:module-unavailable` 通知(由通知中心呈现,见 §5.11 模块缺席矩阵)
3. Phase 3 才上线的模块(如 calendar 完整版)在 M2.5 sidebar 中为"灰显占位",点击不切换 activeModule,只显示"Phase 3 上线"toast

---

## 4. 视觉与布局规范

### 4.1 三栏布局与标题栏(v0.2 锁定标题栏方案)

**标题栏方案二选一,本 PRD 锁定方案 A**:

| 方案 | 描述 | M2.5 决定 |
|---|---|---|
| **A. macOS 原生 titlebar + titlebar accessory(Tauri `titleBarStyle: "Overlay"` + Rust `NSToolbar`)** | traffic lights + 原生窗口拖动 + 我们用 `NSToolbarItem` 自绘搜索图标 / 铃铛 / 头像 | ✅ **采用** |
| B. 完全自绘 48px titlebar(`titleBarStyle: "Transparent"` + 自实现拖动 hit region)| 视觉自由度更高,但 traffic lights 行为、Spaces 拖动、Stage Manager 集成都要自己处理 | ❌ 不采用 |

v0.1 视觉稿同时画了 48px 自定义标题栏 + FR-CON-14 又要求原生 traffic lights,实现路径冲突。v0.2 明确:**用 Tauri 原生 titlebar + Overlay 模式 + NSToolbar accessory** 注入图标按钮。视觉稿中的 48px 高度只是 "titlebar + accessory 区域" 总高度,不是自绘高度。

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✕ ⊟ ⊞   XAI Desktop · Console               🔔  ⌕ Cmd+K   👤 me   │ ← macOS 原生 titlebar
│  ↑traffic lights(原生)                       ↑ NSToolbar accessory(注入图标)
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

**v0.2 同步语义**:`settings.console.density` 是**设备本地偏好,不跨设备同步**。理由:不同屏幕大小对密度的偏好不同(27" 外接屏可能选紧凑,14" MacBook 可能选宽松)。这条与 §5.9 FR-CON-93、§8 数据模型表中的 `console.density` 一致。

(若用户希望跨设备同步密度,可在 设置 > 同步 中开 "高级 > 跨设备同步密度偏好" toggle,Phase 3 评估。)

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
> **v0.2 优先级标签**(见 §0.2):`P0-Shell` / `P0-View` / `P0-Project` / `P1-Phase3` / `P2-Later`。所有"M2.5 必过"=任意 P0-* 三类。Phase 3 上线模块在 M2.5 sidebar 允许灰显占位。

### 5.1 窗口生命周期(FR-CON-13~20)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-13 | Console 窗口唯一性 | P0-Shell | 同时只允许存在一个 Console 窗口;再次唤起时聚焦已有窗口而非新建 |
| FR-CON-14 | 标题栏样式 | P0-Shell | 采用 §4.1 方案 A(macOS 原生 titlebar + Overlay style + NSToolbar accessory 注入图标);窗口标题动态为 `XAI Desktop · <当前模块>`。**禁止**自绘 traffic lights / 自绘 hit region 拖动 |
| FR-CON-15 | 关闭行为 | P0-Shell | 点关闭(✕)= 隐藏窗口,不退出 App(overlay 仍在);Cmd+Q 真正退出 App。**首次关闭采用非阻塞 toast**(右下角 4 秒淡出):"关闭按钮只是隐藏 Console。Cmd+Q 才会真正退出 XAI Desktop。在 设置 > 外观 可改为'关闭即退出'"。toast 不挡用户其他操作。v0.2 将 v0.1 的阻塞确认弹窗改为非阻塞 toast,符合 macOS HIG |
| FR-CON-16 | 最小化 | P0-Shell | Cmd+M 与黄灯按钮把窗口最小化到 Dock;App 仍在前台 |
| FR-CON-17 | 最大化 / 全屏 | P0-Shell | 绿灯 = 全屏(macOS 标准 fullscreen);三栏布局自适应;退出全屏时若处于"独立 Space"(macOS fullscreen 自动建 Space),Console 留在该 Space 直到用户主动切;详见 §5.8 多 Space 矩阵 |
| FR-CON-18 | 窗口位置 / 大小持久化 | P0-Shell | 关闭前的 frame 存 `settings.console.window_frame`;重启后恢复;多屏环境下若原屏不存在则居中主屏 |
| FR-CON-19 | 上次状态恢复 | P0-Shell | 重新打开时恢复:活动模块、模块内子状态、sidebar/detail 折叠、宽度;失败时降级到默认(任务·收件箱)。Phase 3 模块若处于灰显占位,nav_state 中的 `activeModule=calendar` 自动降级为 `tasks/smart:inbox` |
| FR-CON-20 | 启动入口 | P0-Shell | 三种入口:① 菜单栏托盘点击 "打开控制台" ② **应用内**全局快捷键 `Cmd+Shift+Space`(由 macOS 注册为 global hotkey;若与 Spotlight 冲突用户在 设置 > 快捷键 改)③ Dock 图标点击(App 已运行时直接打开 Console,而非启动 overlay)。v0.2 注:全局快捷键仅"打开 Console";其他 Cmd+K / Cmd+1~9 等是**应用内快捷键**,只在 Console 前台时生效,不抢全局,详见 §5.5 + §5.6 |

### 5.2 Sidebar 导航(FR-CON-21~30)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-21 | 模块入口动态注册 | P0-Shell | Console 启动时调用 `pluginRegistry.getConsoleSidebarEntries()`,按 `ui.consoleSidebar.order` 排序渲染;未声明该字段的 plugin 不出现在 sidebar |
| FR-CON-22 | 任务子项展开 | P0-View | "任务"模块的智能清单 + 用户清单作为二级 sidebar 项展开/折叠,记忆展开状态;Inbox 是"smart:inbox"smart list 子项,永远在二级第一项 |
| FR-CON-23 | Sidebar 折叠到图标条 | P0-Shell | 64px 宽,只显示图标 + 徽标;hover 显示模块名 tooltip |
| FR-CON-24 | 模块徽标(仅业务计数)| P0-Shell | 每个模块可显示业务计数徽标:任务=今日未完成数;番茄=运行中显示动画点;习惯=今日未打卡数;通知中心=未读数。**不包含同步状态徽标**——同步失败用标题栏左侧云图标 + 通知中心铃铛红点呈现(见 §5.7),不挂在 sidebar 模块上,因为同步不是业务模块 |
| FR-CON-25 | 拖动重排 sidebar | P2-Later | v1.x 评估,M2.5 不做(顺序由 plugin order 决定)|
| FR-CON-26 | Sidebar 右键菜单 | P1-Phase3 | 在模块项右键可"隐藏此模块"(对应到 `settings.console.hidden_modules`);可在 设置 > 外观 重新启用。**键盘等价路径**:模块项 focused 时按 `Cmd+Backspace` 触发同样动作(见 §5.6 键盘补充) |
| FR-CON-27 | Inbox 永远存在 | P0-View | Inbox 是"任务"模块的二级 pinned smart list,永远第一,无法被隐藏。**不是顶层 sidebar 项**(v0.1 错误已修);路由表达式为 `tasks/smart:inbox` |
| FR-CON-28 | 当前选中高亮 | P0-Shell | 当前模块在 sidebar 显示高亮(背景色 + accent 左边条 2px);二级子项同理 |
| FR-CON-29 | 模块切换快捷键 | P0-Shell | `Cmd+1`~`Cmd+9` 切前 9 个**已加载且非灰显**的 sidebar 模块(按渲染顺序);超过的不绑定快捷键。灰显占位模块(如 M2.5 时的 calendar)不参与快捷键编号 |
| FR-CON-30 | Sidebar 折叠快捷键 | P0-Shell | `Cmd+\` 切换 sidebar 折叠 / 展开 |

### 5.3 三栏布局与拖动(FR-CON-31~38)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-31 | 拖动分隔条改变 sidebar/list/detail 宽度 | P0-Shell | 拖动时实时反馈;松手后存 `settings.console.pane_widths`。**键盘等价**:Cmd+Option+← / Cmd+Option+→ 在已聚焦栏边界上调宽 16px / 缩窄 16px;Cmd+Option+0 双重还原默认 |
| FR-CON-32 | 双击分隔条恢复默认宽度 | P0-Shell | sidebar/list/detail 三条分隔条都支持;**键盘等价**同 FR-CON-31 的 Cmd+Option+0 |
| FR-CON-33 | Detail 折叠 | P0-Shell | List 行右键菜单 "隐藏详情" 或快捷键 `Cmd+Shift+]` 折叠 detail;再按或选中新项展开。**键盘等价**:List 行 focused 时按 `Shift+F10` 或 `Cmd+Option+M` 打开 context menu(macOS 标准),在 menu 中按方向键选 "隐藏详情" 回车 |
| FR-CON-34 | Detail 在窄屏自动变抽屉 | P0-Shell | 窗口宽 < 1080px 时,detail 不在右侧固定显示,而是从右边滑入覆盖(60% 宽);Esc / 点击外侧 / `Cmd+W`(在 detail 焦点时)收起 |
| FR-CON-35 | List 滚动性能 | P0-Shell | 任意 list 滚动保持 60fps(虚拟列表实现,任务清单 / 习惯日志 / 项目卡片均需虚拟化);1 万条记录初次渲染 < 200ms;具体设备基线见 §6.1 |
| FR-CON-36 | List 多选(查看 / 删除 / 标 Label)| P0-View(限定子集) | 多选作为**键盘流的辅助形态**:Shift+Click 区间 + Cmd+Click 单选 + Cmd+A 全选 + Shift+↑/↓ 扩展焦点。选中后批操作工具栏仅含父 PRD 允许的能力:**删除选中** + **加 Label 到选中** + **移动到清单**。**不含完成全部 / 改优先级 / 改截止日批改**(父 PRD §5.2 line 189 明确"Todo 不做批量操作"——"完成"作为状态操作受限,但"删除/打标签/移动清单"属于 list 管理,不算业务级批改,经父 PRD 边界微调记入 §13 与父 PRD 的对齐) |
| FR-CON-37 | List → Detail 选中同步 | P0-Shell | 点 list 行,detail 立即切到该项;键盘 j/k 移动焦点也会跟随(若 detail 处于展开)|
| FR-CON-38 | 跨栏 focus 切换 | P0-Shell | `Tab` 在 sidebar / list / detail 之间循环;`Shift+Tab` 反向;每栏内部用方向键 |

### 5.4 各业务模块在 Console 中的视图

> 每个业务模块的功能 FR 在主 PRD,本节只定义其**在 Console 中的视图与集成行为**。

#### 5.4.1 任务(Todo)模块视图(FR-CON-40~48,v0.2 范围收敛)

> v0.2 重要收敛(回应审查 Critical-3):删除 Todo 图片粘贴、附件、复杂 RRULE 自绘 UI;父 PRD §5.2 line 189 明确"Todo 不做附件、批量操作"。Console 只展示 plugin-productivity 已暴露的能力,不在 Console 层加新业务字段。

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-40 | 任务模块默认视图 | P0-View | 中栏顶部 tab:列表 / 看板(灰显,提示"看板请用项目模块") / 日历(M2.5 灰显,Phase 3 上线后跳转日历模块);默认列表 |
| FR-CON-41 | 列表分组 | P0-View | 用户可在中栏顶部选分组维度:无 / 按截止日 / 按优先级 / 按 Label;选项存到 list-state |
| FR-CON-42 | 智能清单"今日"逻辑 | P0-View | 包含:① due 在今天及之前未完成;② 今天创建的;③ 拖入"今日"分组的(`is_today=true`)。视图按"过期 / 今天 / 已完成"三段显示 |
| FR-CON-43 | 任务详情(右栏)字段 | P0-View | 标题 / 描述(Markdown 编辑,**纯文本 + 链接,不支持图片粘贴**) / 截止日(plugin-productivity 提供 picker) / 提醒(多条) / **简化重复规则(每天/每周/每月/每年/不重复 5 选项,plugin-productivity 提供 dropdown,Console 不自绘 RRULE UI)** / 优先级 / Labels / 所属清单 / 子任务 / 关联番茄 / 关联项目卡片 |
| FR-CON-44 | 描述区 Markdown 预览(纯文本)| P0-View | 编辑时显示编辑器,失焦时切换为预览;Cmd+E 强制切换;**不支持图片粘贴、不支持附件上传**。父 PRD §5.2 line 189 明确"Todo 不做附件"。若用户粘贴图片,Console 提示"Todo 不支持图片附件,如需富文本笔记请使用项目模块卡片描述"(项目卡片附件能力归 plugin-project)。富文本笔记类的"图片 + 长文档"需求由 plugin-notes(Phase 4+)承载,不在 Console 层做 |
| FR-CON-45 | 子任务排序 | P0-View | 拖动 + **键盘**两种路径:鼠标在右栏拖动子任务上下重排;**键盘**按 `Cmd+Option+↑/↓` 在子任务 focused 时上下移动一位 |
| FR-CON-46 | 一键启动番茄绑定该任务 | P0-View | 详情顶部"🍅 开始番茄"按钮 / 快捷键 `Cmd+Shift+P`;启动后右栏底部显示"番茄进行中"胶囊 |
| FR-CON-47 | 完成动画 | P0-View | 列表勾选完成,行有 200ms 划线动画,5 秒可撤销提示(toast)|
| FR-CON-48 | 任务模块 empty state | P0-Shell | 清单为空时,显示插画 + "暂无任务,按 N 新建" + 键盘提示带 `?` 打开 cheat sheet |

**显式不做(v0.2,审查 Critical-3 修复)**:

- Todo 描述区图片粘贴 / 附件上传(归 plugin-notes 或 plugin-project)
- Todo 多选批改截止日 / 批改优先级 / 批改清单"以外"的字段(父 PRD §5.2 line 189 明确不做)
- 复杂自绘 RRULE UI(按月第 N 个周几、自定义间隔多 token 表达式等)——Console 只调用 plugin-productivity 的 simple-repeat-picker
- Markdown 嵌入式视频 / 表格 / 流程图(纯笔记需求归 plugin-notes)

#### 5.4.2 桌面日历模块视图(FR-CON-49~55,v0.2 整组降级 Phase 3)

> v0.2 重要修正(回应审查 Critical-1):dev-plan §1 line 30 明确"桌面日历 Phase 3 才接入,M2.5 灰显"。v0.1 把这组 FR 标为 P0,与 dev-plan 直接冲突,会导致验收按 PRD 必失败、按 dev-plan 必漏做。v0.2 改为:**M2.5 仅 sidebar 占位 + 空状态文案,plugin-calendar 在 Phase 3 才提供 ConsoleView 实装;FR-CON-49~54 整组改为 P1-Phase3。M2.5 只验占位行为**。

**M2.5 必过(P0-Shell 占位侧)**

| ID | 需求 | 优先级 | M2.5 验收标准 |
|---|---|---|---|
| FR-CON-49 | 占位行为 | P0-Shell | sidebar 中"桌面日历"项以灰显呈现;tooltip "Phase 3 上线";点击不切 activeModule,只 emit `console:module-unavailable` + 通知中心 toast "桌面日历 Phase 3 上线" |
| FR-CON-49a | 接口 mock | P0-Shell | plugin-calendar 提供 stub manifest + stub ConsoleView(空 view + "Phase 3 上线"卡);ConsoleHost 能渲染,不报错;`pluginRegistry.getConsoleSidebarEntries()` 返回该项但带 `disabled:true` 标记 |
| FR-CON-49b | 路由降级 | P0-Shell | 旧 nav_state `activeModule="calendar"` 在 M2.5 启动时自动降级到 `tasks/smart:inbox`,并在通知中心提示一次 |

**Phase 3 启用(P1-Phase3)**

| ID | 需求 | 优先级 | Phase 3 验收标准 |
|---|---|---|---|
| FR-CON-50 | 视图切换 | P1-Phase3 | plugin-calendar 提供完整 ConsoleView:月 / 周 / 日 / Agenda;`1/2/3/4` 切换;默认月 |
| FR-CON-51 | 日历主体占据 list+detail 整片 | P1-Phase3 | 日历模块下,detail 折叠;月/周视图占整片画布;若用户主动展开 detail 则显示选中日的事项 |
| FR-CON-52 | 数据图层开关 | P1-Phase3 | 右上角浮动 popover:勾选 Todo / 习惯 / 番茄 三个图层;状态存 `settings.console.calendar.layers` |
| FR-CON-53 | 改期(拖 + 键盘双路径)| P1-Phase3 | **拖拽**:Todo 从一天拖到另一天,修改其 `due_at`;**键盘**:Todo focused 时按 `D` 调日期 picker,picker 内方向键选日 + Enter 确认。两路径走同一 `productivity:todo-updated` 事件 |
| FR-CON-54 | 点击空白时段快速新建 Todo | P1-Phase3 | 周/日视图点击某时段或键盘按 `N`,弹出快速输入框,直接录入标题 + 自动填 `due_at` |
| FR-CON-54a | 今日按钮 | P1-Phase3 | 标题栏"今日"按钮 / `T` 键一键跳回当天 |
| FR-CON-55 | 系统 .ics 订阅(只读) | P1-Phase3 | 主 PRD §5.12 FR-CAL-08 的承接;Phase 3 评估实装 |

#### 5.4.3 四象限视图(FR-CON-56~58)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-56 | 2×2 网格布局 | P0-View | 中栏 + detail 一起作为画布,四宫格平均;每格显示该象限的 Todo 列表 |
| FR-CON-57 | 跨象限改 important / urgent(拖 + 键盘) | P0-View | **拖拽**:Todo 跨象限拖修改 `is_important` / `is_urgent`,emit `productivity:todo-updated`;**键盘**:Todo focused 时按 `Q1` / `Q2` / `Q3` / `Q4` 四键(实际为 `1`/`2`/`3`/`4` 在四象限模块作用域)移动到对应象限;或按 `Cmd+Option+方向键`(↑ = Q1, ← = Q2, → = Q3, ↓ = Q4);Console 内 ↔ overlay 实时同步 |
| FR-CON-58 | 每象限颜色 + 标题可改 | P2-Later | 默认四象限色 + 滴答风格命名;v1.x 评估用户可在设置改;v1 默认不动 |

#### 5.4.4 番茄专注模块视图(FR-CON-59~62)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-59 | 当前会话面板 | P0-View | 有进行中会话时,中栏顶部固定显示大胶囊(倒计时 + 关联任务 + 中断按钮);无会话时显示快速启动 |
| FR-CON-60 | 历史统计图 | P0-View | 中栏下方显示日/周/月柱状图(`recharts` 或 SVG 手绘);每柱可点击查看当日明细 |
| FR-CON-61 | 任务关联跳转 | P0-View | 历史明细中点某条记录的关联任务,Console 切到任务模块并定位该 Todo |
| FR-CON-62 | 干扰记录详情 | P1-Phase3 | 历史明细可展开"干扰次数"附带文字说明 |

#### 5.4.5 习惯打卡模块视图(FR-CON-63~67,v0.2 热力图降级)

> v0.2 修正(回应审查 Critical-1 + dev-plan §1 line 30 "习惯增强 Phase 3 才接入"):年度热力图归 plugin-productivity 的 Phase 3 增强,M2.5 仅基础月历;详情 tab 在 M2.5 只有 "日历",Phase 3 才补 "热力图" tab。

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-63 | 习惯列表(中栏)| P0-View | 每行:emoji + 名称 + 本周 7 圆点 + 当前 streak + 月达成率;参考主 PRD §5.4 截图 |
| FR-CON-64 | 习惯详情(右栏)| P0-View | 本月数 / 总数 / 月达成率 / 当前 streak / 当前月历网格 / 上下月切换。**v0.2 不含年度进度大图**(归 Phase 3 热力图)|
| FR-CON-65 | 年度热力图视图 | P1-Phase3 | 详情顶部 tab 在 Phase 3 增加 "热力图"(GitHub 风格);M2.5 只显示 "日历" tab |
| FR-CON-66 | 列表内直接打卡(键盘 + 点击)| P0-View | 鼠标:中栏某行的圆点可点击打卡(今日);**键盘**:习惯行 focused 时按 Space 打卡今日;emit `productivity:habit-logged` |
| FR-CON-67 | 习惯归档 | P0-View | 右栏底部"归档此习惯"按钮 + 键盘 `A`;归档后列表底部"已归档"折叠区可查 |

#### 5.4.6 项目管理模块视图(FR-CON-68~75,v0.2 修正拖源)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-68 | 看板选择 | P0-Project | 中栏顶部下拉看板选择器;sidebar 二级显示最近 3 个看板 |
| FR-CON-69 | 看板视图(Kanban)| P0-Project | 列水平排列;每列内卡片垂直堆叠;支持横向滚动;列宽固定 280px |
| FR-CON-70 | 表格视图(Table)| P0-Project | 中栏顶部 tab 切换;每行一张卡片,列:标题/状态(对应 list)/Labels/截止日/checklist 进度 |
| FR-CON-71 | 总览视图 | P1-Phase3 | 多看板汇总,每看板一个卡片显示卡片数 + 列分布 |
| FR-CON-72 | 卡片详情(右栏)| P0-Project | 标题 / 描述 / 截止日 / Labels / checklist / 链接附件 / 关联 Todo |
| FR-CON-73 | 改卡片列(拖 + 键盘)| P0-Project | **拖拽**:Kanban 视图拖卡片跨列;**键盘**:卡片 focused 时按 `←/→` 在列间移动一位,`Cmd+Shift+M` 打开"移动到..."command palette 用方向键选目标列。emit `project:card-moved`;overlay 端的项目 Widget 实时刷新 |
| FR-CON-74 | 跨模块互转:项目卡片 ↔ Todo | P0-Project | **拖拽来源是看板视图 / 表格视图中的卡片本身**(v0.1 错写"从 sidebar 拉项目卡片"——sidebar 不显示卡片,只显示模块/最近看板;v0.2 已修)。拖卡片到"任务模块"sidebar 项时,自动创建关联 Todo(`linked_card_id`)并跳转到任务模块。**键盘等价**:卡片详情右上"⋯"菜单 / `Cmd+Option+T` 触发"转为 Todo";反之 Todo 详情菜单 / `Cmd+Option+B` 触发"加到看板..." |
| FR-CON-75 | 看板桌面 Widget 入口 | P1-Phase3 | 看板详情右上角"添加到桌面"按钮,新建一个 Widget Grid 显示此看板精简版 |

#### 5.4.7 标签管理模块视图(FR-CON-76~80,v0.2 加 resolver 协议)

> v0.2 修正(回应审查 Major-9):Label 详情聚合的 6 类实体来自不同 plugin。v0.1 直接列举但未定义 provider 协议;若任一 plugin 缺席 / 未启用 / 加载失败,Label 详情会崩。v0.2 引入 `labelEntityResolver` 协议:每个业务 plugin 自行声明它能解析的实体类型,plugin-labels 用 `pluginRegistry.getLabelEntityResolvers()` 收集后并行查询,缺席的实体类型不显示组(显示"该类型当前未启用"占位)。

**labelEntityResolver 协议(由 plugin-labels 在 PLUGIN_SDK §3 之外的 capability map 中定义)**:

```ts
interface LabelEntityResolver {
  entityType: "todo" | "habit" | "note" | "clipboard" | "grid_item" | "board_card" | string;
  displayName: string;     // 用于详情中分组标题,如 "任务"
  resolve(labelId: string, opts: { limit: number; offset: number }): Promise<LabelEntityHit[]>;
  // 必须在 200ms 内返回,超时由 plugin-labels 截断并显示"加载中..."占位
}

interface LabelEntityHit {
  entityType: string;
  entityId: string;
  displayTitle: string;
  displaySubtitle?: string;
  navigate: { module: string; route: object };  // 点击跳转参数
}

// plugin-labels 内
const resolvers = pluginRegistry.getLabelEntityResolvers();
const results = await Promise.allSettled(
  resolvers.map(r => r.resolve(labelId, { limit: 50, offset: 0 }))
);
// 失败 / 超时的 resolver 对应的分组显示降级占位
```

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-76 | Label 列表 | P0-View | 中栏每行:色块 + 名称 + emoji + 引用计数(分实体类型显示);计数来自各 resolver 的 `count` 接口(轻量调用),缺席类型显示 "—" |
| FR-CON-77 | Label 详情(provider 聚合)| P0-View | 右栏分组显示该 Label 下的所有实体;**分组顺序**:Todo → 项目卡片 → 习惯 → 便签 → 剪贴板 → Grid Item;每组最多前 50;点击实体走 resolver 返回的 `navigate` 跳转 |
| FR-CON-77a | 缺席 plugin 降级 | P0-Shell | 某 plugin 未启用 / 未安装 / resolver 超时,对应分组显示降级占位:"任务模块未启用(可在 设置 > 插件 启用)" / "项目模块加载中…";其他分组照常展示。详见 §5.11 模块缺席矩阵 |
| FR-CON-78 | 新建 / 编辑 Label | P0-View | 中栏顶部"+ 新建" / 键盘 `N`,右栏出现表单(名称 / 颜色 / emoji)|
| FR-CON-79 | 删除 Label 处理 | P0-View | 删除时弹确认对话框,提示"将解除 N 个实体的关联";确认后 emit `labels:deleted` + 级联 `labels:unassigned` |
| FR-CON-80 | Label 层级 | P1-Phase3 | 主 PRD FR-LB-03 的 P1 项;Console 显示树形 |

#### 5.4.8 时间进度条模块视图(FR-CON-81~83)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-81 | 进度条列表 | P0-View | 中栏一行一条:名称 + 模式(进度/倒计时)+ 当前百分比或剩余时间 + 颜色色块 |
| FR-CON-82 | 进度条详情 | P0-View | 右栏:大号可视化(条/环)+ 编辑表单(起止时间/颜色/样式)|
| FR-CON-83 | 一键创建预置 | P0-View | 中栏顶部按钮:今年/本月/本周/今天;一键创建对应预置进度条;键盘 `N` 同 |

#### 5.4.9 设置模块视图(FR-CON-84~95,v0.2 大幅收敛)

> v0.2 重要修正(回应审查 Major-7):v0.1 把账号删除 / 修改密码 / 2FA / 数据库 vacuum / 插件管理 / 同步选择性开关全塞进 Console PRD 的 P0,等于 Console PRD 吃下了 plugin-account / sync / plugin-manager 的子 PRD。v0.2 改为:**Console PRD 只定义"设置容器壳 + 二级 sidebar + SettingsSection slot 协议 + 路由 + 即时生效语义";具体子页内容 P0 归属各业务 plugin PRD**。

**SettingsSection 协议(由 plugin-console 在 PLUGIN_SDK §3.1 之外增设)**:

```ts
interface SettingsSection {
  sectionId: string;       // 唯一,如 "account", "appearance", "sync"
  order: number;           // 二级 sidebar 排序
  group: "user" | "system" | "data" | "advanced";  // 分组,影响 sidebar 分割线
  displayName: string;
  icon: string;
  Component: React.ComponentType<SettingsSectionProps>;
  // 关键字索引,供设置搜索(P1)
  searchKeywords?: string[];
}

interface SettingsSectionProps {
  host: ConsoleHost;       // 见 §7.2 ConsoleView 契约
  onDirty: (dirty: boolean) => void;
  onClose: () => void;     // 用户切到别的 section 时调用,plugin 可拦截 unsaved changes
}
```

**Console 提供(P0-Shell)**:

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-84 | 设置容器壳 | P0-Shell | Console 渲染设置模块时,左侧二级 sidebar 从 `pluginRegistry.getSettingsSections()` 收集所有声明 SettingsSection 的 plugin,按 group + order 排序;右侧渲染 selected 的 Component |
| FR-CON-85 | 外观子页(由 plugin-console 自己提供 SettingsSection)| P0-Shell | sectionId="appearance";内容:主题(系统/亮/暗/高对比) / Accent / 密度 / 字体大小 / 减少动画 / sidebar 折叠默认。这是 Console 自己的 UI 偏好,合理由 plugin-console 提供 |
| FR-CON-86 | 快捷键子页 | P0-Shell | sectionId="shortcuts",由 plugin-console 提供;表格显示从 `core-shortcuts` 收集的所有已注册快捷键(各 plugin 注册);可点击修改;冲突检测(同一组合警告) |
| FR-CON-87 | 关于子页 | P0-Shell | sectionId="about",由 plugin-console 提供;版本号 / 构建号 / Channel / 检查更新 / 开源依赖 / 反馈邮箱 |
| FR-CON-88 | 即时生效语义 | P0-Shell | 主题、密度、字体、动画开关:0 延迟,CSS variable 直接更新;其他变更由各 plugin 自己定义生效时机 |
| FR-CON-89 | 同步范围语义 | P0-Shell | 设置的 sync vs device-local 语义由 `settings` 表的 `sync_scope` 列决定(对齐 sync 子 PRD);Console 仅显示"⓪ 跨设备 / ⓪ 此设备"小图标,不参与判定。**density / window_frame / pane_widths / sidebar_collapsed / detail_collapsed = device-local**;主题 / accent / 字体 / 减少动画 = sync;其他由对应 plugin 声明 |

**业务 plugin 提供的子页(归属对应 plugin PRD,Console 仅渲染容器)**:

| 子页 sectionId | 归属 plugin | M2.5 必过 |
|---|---|---|
| `account`(当前账号/登录登出/修改密码/2FA/账号删除)| plugin-account | 由 plugin-account 子 PRD §X 定义 |
| `data`(导出 / 导入 / 诊断 / vacuum / 清空缓存)| plugin-account + core-data 共建 | 由 sync 子 PRD §X + plugin-account 共同定义 |
| `privacy`(剪贴板录制 / App 黑名单 / 屏幕共享 / 敏感模式 / 错误上报)| 由 plugin-clipboard / plugin-account 共同提供多个 section | 由对应子 PRD 定义 |
| `plugins`(已装列表 / 启停)| 未来 plugin-manager(v1.x);M2.5 由 plugin-console 提供只读列表占位 | v0.2 降级:M2.5 只读,启停 P1-Phase3 |
| `sync`(同步状态 / 手动触发 / 选择性同步)| plugin-account / sync 子 PRD | 由 sync 子 PRD 定义 |

**Console PRD 不再定义这些子页的字段、流程、错误状态、表单细节**——它们归对应业务 PRD。Console PRD 只验:容器壳渲染、二级 sidebar 收集、路由切换、即时生效语义。

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-94 | 设置搜索 | P1-Phase3 | 设置页顶部搜索框,模糊匹配 SettingsSection 的 `searchKeywords` 跳转 |
| FR-CON-95 | 设置回滚 | P1-Phase3 | "恢复默认"按钮;粒度由各 section 自己定义 |

### 5.5 全局搜索 Cmd+K(FR-CON-96~105,v0.2 改作用域 + 加 provider 协议)

> v0.2 重要修正:
> - **审查 Critical-6** — v0.1 FR-CON-96 把 Cmd+K 写成"在 overlay 模式按下后聚焦 Console 并打开",这相当于把 Cmd+K 注册为系统全局快捷键,会与前台 App 的 Cmd+K(几乎所有 macOS App 都用这个组合)冲突。v0.2 改:Cmd+K 是**应用内快捷键**,只在 Console 窗口前台时生效;打开 Console 用 Cmd+Shift+Space(可改);若用户希望"无论前台是谁都能弹搜索",P1 再评估单独的"Spotlight 风格"全局命令面板快捷键(默认不设)。
> - **审查 Critical-8** — v0.1 直接给"1 万 Todo + 1 万剪贴板 + 文件名 P95 ≤ 300ms"硬指标但没定义 provider 协议、超时、增量索引、隐私过滤、文件索引来源,会做成黑洞。v0.2 引入 search provider 协议,M2.5 P0 只覆盖 Todo / Label / Project / Settings / 模块跳转 5 个 provider(数据本地、走 SQLite FTS5);剪贴板 / OCR / 文件名分阶段接入。

#### 5.5.1 作用域分层

| 快捷键 | 作用域 | M2.5 默认 |
|---|---|---|
| `Cmd+Shift+Space` | 系统全局,打开 / 聚焦 Console 窗口 | P0-Shell;在系统 macOS 全局注册 |
| `Cmd+K` | **应用内**(Console 窗口前台时生效),打开全局搜索模态 | P0-Shell;不抢全局,不与前台 App 的 Cmd+K 冲突 |
| `Cmd+Shift+K` | (Phase 3 评估)系统全局命令面板,任何前台都能弹 | P1-Phase3;默认不设,避免与用户已有快捷键冲突 |

#### 5.5.2 SearchProvider 协议

```ts
interface SearchProvider {
  providerId: "todo" | "label" | "project_card" | "habit" | "note" |
              "clipboard" | "file_name" | "ocr_text" | "settings" | "module_jump" | string;
  displayName: string;            // 用于结果分组标题
  group: number;                  // 渲染顺序
  enabled: boolean;               // 由各 plugin 自报
  search(query: string, opts: SearchOptions): Promise<SearchHit[]>;
  // 必须在 timeoutMs 内返回;超时 plugin-console 自动截断显示 "部分结果"
}

interface SearchOptions {
  limit: number;                  // 默认 5(每组)
  timeoutMs: number;              // 默认 200ms
  signal: AbortSignal;            // plugin-console 调用 abort 时 provider 必须停下
}

interface SearchHit {
  providerId: string;
  entityId: string;
  title: string;
  subtitle?: string;
  matchScore: number;             // 0~1,用于跨 provider 全局排序(可选,M2.5 不用)
  navigate: { module: string; route: object };
}

// plugin-console 内
const providers = pluginRegistry.getSearchProviders().filter(p => p.enabled);
const settled = await Promise.allSettled(
  providers.map(p => p.search(query, { limit: 5, timeoutMs: 200, signal: ac.signal }))
);
// 超时 / 失败的 provider 显示"加载中…"或"暂不可用"占位,其他 provider 结果照常呈现
// 模糊聚合:partial results > 等全部
```

#### 5.5.3 P0 / P1 / P2 provider 分层

| Provider | M2.5 P0(SQLite FTS5,本地索引) | Phase 3 P1 | v1.x P2 |
|---|---|---|---|
| Todo | ✅ plugin-productivity | — | — |
| Label | ✅ plugin-labels | — | — |
| Project card | ✅ plugin-project | — | — |
| Habit | ✅ plugin-productivity(只搜名称)| 搜笔记内容 | — |
| Settings | ✅ plugin-console(搜 SettingsSection.searchKeywords)| — | — |
| Module jump | ✅ plugin-console(`> 切换到 ...`)| — | — |
| Note | — | ✅ plugin-notes(Phase 4)| — |
| Clipboard | — | ✅ plugin-clipboard(隐私过滤后)| — |
| OCR text | — | ✅ macOS Vision OCR 索引(隐私过滤)| — |
| File name | — | — | ✅ Spotlight metadata 桥接(v2 评估)|

#### 5.5.4 FR

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-96 | 唤起方式 | P0-Shell | `Cmd+K` 在 Console 前台时打开模态;若用户在 overlay 模式想直接搜,必须先 Cmd+Shift+Space 唤起 Console |
| FR-CON-97 | 搜索 UI 形态 | P0-Shell | 模态对话框,居中 640×480,带阴影遮罩;Esc / 模态外侧点击 / Cmd+W 关闭 |
| FR-CON-98 | 输入即搜 | P0-Shell | 用户每键入一个字符,200ms debounce 后触发搜索 |
| FR-CON-99 | 结果分组 | P0-Shell | 按 SearchProvider 协议返回的 `providerId` 分组,按 `group` 数字排序;每组最多 limit 项;Enter "显示更多"打开该组全列表 |
| FR-CON-100 | 命令面板模式 | P0-Shell | 以 `>` 开头切换到命令模式,由 `module_jump` provider + 各 plugin 注册的 commands 提供:`> 新建 Todo` / `> 切换到日历` / `> 主题:暗色` 等;支持模糊匹配 |
| FR-CON-101 | 键盘流 | P0-Shell | ↑↓ 选项;Enter 打开;Tab 切分组;Cmd+1~9 跳到第 N 个结果 |
| FR-CON-102 | 历史搜索 | P0-Shell | 输入框为空时显示最近 5 次搜索;用户可清空 |
| FR-CON-103 | 结果跳转后 Console 状态 | P0-Shell | 选中"Todo: 提交报告"后,Console 切到任务模块、定位该 Todo、detail 打开、Cmd+K 关闭 |
| FR-CON-104 | 搜索性能(M2.5 P0 provider 集)| P0-Shell | 在 P0 provider(Todo / Label / Project / Settings / Module jump)各 1 万 entity 数据规模下,Cmd+K 输入后到首屏结果可见 P95 ≤ 300ms。剪贴板 / OCR / 文件名 provider 启用后(Phase 3+)目标 P95 ≤ 500ms,通过 partial results 早呈现 |
| FR-CON-104a | 隐私过滤 | P0-Shell | 启用"敏感模式"或"剪贴板录制关闭"时,对应 provider 自动 disable;搜索结果不出现该 provider 的分组(连"暂不可用"也不出,以免泄漏存在性)|
| FR-CON-104b | provider 超时降级 | P0-Shell | 单 provider 超 200ms 由 plugin-console abort;在结果区显示"<分组名>: 加载中…"占位 ≤ 800ms;800ms 仍未返回改为"<分组名>: 暂时不可用,稍后重试" |
| FR-CON-105 | 搜索范围设置 | P1-Phase3 | Cmd+K 内部右上角 toggle:勾选哪些 provider 参与搜索;默认全开;用户偏好存 `settings.console.search.enabled_providers` |

### 5.6 键盘流与快捷键(FR-CON-106~115,v0.2 拖拽对偶补全)

> v0.2 修正(回应审查 Critical-5):v0.1 多个 P0 核心动作只写拖拽 / 右键(日历改期、四象限移动、项目卡转 Todo、隐藏详情、多选批处理),与 FR-CON-112"全键盘可达"硬冲突。v0.2 在每条拖拽 P0 旁列出键盘等价路径,并在 §5.6.4 集中列拖拽 / 右键对应的键盘命令面板。

#### 5.6.1 全局(Console 前台)

| ID | 快捷键 | 动作 | 优先级 |
|---|---|---|---|
| FR-CON-106 | `Cmd+Shift+Space` | **系统全局**:打开 / 聚焦 Console | P0-Shell |
| FR-CON-106a | `Cmd+1`~`Cmd+9` | 切 sidebar 前 9 个非灰显模块 | P0-Shell |
| FR-CON-106b | `Cmd+K` | 应用内全局搜索 | P0-Shell |
| FR-CON-106c | `Cmd+,` | 跳转设置 | P0-Shell |
| FR-CON-106d | `Cmd+\` | sidebar 折叠 | P0-Shell |
| FR-CON-106e | `Cmd+Shift+]` | detail 折叠 | P0-Shell |
| FR-CON-106f | `Cmd+Shift+R` | 强制刷新当前模块视图 | P0-Shell |
| FR-CON-106g | `Cmd+Option+M` | 在 focused 元素上打开 context menu | P0-Shell |
| FR-CON-106h | `Cmd+Option+←/→/0` | 调相邻栏宽 / 还原默认 | P0-Shell |
| FR-CON-106i | `Cmd+W` | 隐藏 Console 窗口 | P0-Shell |
| FR-CON-106j | `Cmd+Q` | 退出整个 App | P0-Shell |
| FR-CON-106k | `?` | 在任意 list 中打开当前模块的快捷键 cheat sheet | P0-Shell |

#### 5.6.2 List 通用

| ID | 快捷键 | 动作 | 优先级 |
|---|---|---|---|
| FR-CON-107 | `j` / `↓` | 下一项 | P0-View |
| FR-CON-107a | `k` / `↑` | 上一项 | P0-View |
| FR-CON-107b | `g g` | 跳到首项(vim 风格)| P1-Phase3 |
| FR-CON-107c | `G` | 跳到末项 | P1-Phase3 |
| FR-CON-107d | `Enter` | 打开/展开 | P0-View |
| FR-CON-107e | `Space` | toggle(勾选/打卡)| P0-View |
| FR-CON-107f | `Cmd+A` | 全选 | P0-View |
| FR-CON-107g | `Cmd+Click` / `Shift+Click` / `Shift+↑/↓` | 多选(后者键盘扩展焦点)| P0-View |
| FR-CON-107h | `Delete` / `Backspace` | 删除选中(确认弹窗)| P0-View |
| FR-CON-107i | `N` | 新建(在任务/项目/Label 模块)| P0-View |
| FR-CON-107j | `/` | 在当前 list 内搜索/过滤 | P0-View |

#### 5.6.3 模块专属

| ID | 快捷键 | 动作 | 优先级 |
|---|---|---|---|
| FR-CON-108 任务 | `D` | 截止日 picker | P0-View |
|  | `P` | 优先级 | P0-View |
|  | `L` | 加 Label | P0-View |
|  | `M` | 移动到清单 | P0-View |
|  | `Cmd+Shift+P` | 启动番茄绑定 | P0-View |
| FR-CON-108a 任务多选 | `Cmd+Shift+L` | 批加 Label(对多选) | P0-View |
|  | `Cmd+Shift+M` | 批移动到清单 | P0-View |
| FR-CON-109 日历 (Phase 3) | `T` | 跳今天 | P1-Phase3 |
|  | `←/→` | 上/下一段 | P1-Phase3 |
|  | `1/2/3/4` | 月/周/日/Agenda | P1-Phase3 |
| FR-CON-110 习惯 | `Space` | 当日打卡 | P0-View |
|  | `←/→` | 月历翻页 | P0-View |
|  | `A` | 归档 | P0-View |
| FR-CON-111 项目 | `←/→` | 卡片在列间移动 | P0-Project |
|  | `Enter` | 打开卡片详情 | P0-Project |
|  | `A` | 归档卡片 | P0-Project |
|  | `Cmd+Shift+M` | 打开"移动到列..." command palette | P0-Project |
|  | `Cmd+Option+T` | 卡片 → 转为 Todo | P0-Project |
|  | `Cmd+Option+B` | Todo → 加到看板... | P0-Project |
| FR-CON-111a 四象限 | `1/2/3/4` | 把 focused Todo 移到对应象限 | P0-View |
|  | `Cmd+Option+↑/←/→/↓` | 把 focused Todo 移到象限 Q1/Q2/Q3/Q4 | P0-View |

#### 5.6.4 拖拽 / 右键 P0 的键盘对偶清单(整合)

下面这张表把 §5.3 / §5.4 中所有**只写拖拽或右键的 P0 动作**与其键盘等价路径对齐,作为 FR-CON-112"全键盘可达"的可测试清单:

| 拖拽 / 右键动作 | 键盘等价 | 关联 FR |
|---|---|---|
| 改 list 行多选(Shift+Click)| Cmd+A / Shift+↑/↓ | FR-CON-36 / 107g |
| 隐藏详情(右键)| Cmd+Shift+] / Cmd+Option+M 在 list 行 | FR-CON-33 |
| 改 Detail 折叠(拖分隔条)| Cmd+Shift+] | FR-CON-33 |
| 改栏宽(拖分隔条)| Cmd+Option+←/→/0 | FR-CON-31 / 32 |
| 日历改期(拖 Todo)| Todo focused 时 `D` 调日期 picker(Phase 3) | FR-CON-53 |
| 日历快速新建(点击空白时段)| `N` 在日历模块 | FR-CON-54 |
| 四象限跨象限(拖)| `1/2/3/4` / Cmd+Option+方向键 | FR-CON-57 / 111a |
| 子任务重排(拖)| Cmd+Option+↑/↓ | FR-CON-45 |
| 项目卡片跨列(拖)| `←/→` / Cmd+Shift+M | FR-CON-73 |
| 卡片 → Todo(拖到任务模块)| Cmd+Option+T | FR-CON-74 |
| Todo → 看板卡片(右键转化)| Cmd+Option+B | FR-CON-74 |
| Sidebar 模块右键"隐藏"| 模块项 focused 时 `Cmd+Backspace` | FR-CON-26 |

#### 5.6.5 通用 a11y

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-112 | 全键盘可达 | P0-Shell | 所有 P0-Shell / P0-View / P0-Project 操作必须有快捷键或 Tab 焦点可达,无鼠标也可完成。验收按 §5.6.4 拖拽对偶清单逐条跑 |
| FR-CON-113 | 焦点环 | P0-Shell | Tab 焦点必须可见(2px accent 描边);macOS 默认 focus ring 行为;在高对比度模式 +1px |
| FR-CON-114 | 快捷键 cheat sheet | P0-Shell | 在 list / detail / sidebar 任意 focused 元素按 `?` 显示当前模块快捷键浮层;v0.2 把 v0.1 的 "长按 Cmd 200ms" 触发改为 `?` 键,因为长按 Cmd 在 macOS 上语义保留给系统(快捷键 hints)冲突 |
| FR-CON-115 | 用户自定义 | P0-Shell | 设置 > 快捷键 可改;§5.6.1 全局组合不允许重复;模块内可重复(冲突时按当前 activeModule 优先) |

### 5.7 通知中心(FR-CON-116~123,v0.2 AI tab 动态注册)

> 通知中心是 Console 内嵌的右上角铃铛 + 抽屉;**不是** macOS 系统通知中心(系统通知仍由 NotificationOps 走 macOS 原生)。
> v0.2 修正(回应审查 Major-10):AI tab 改为**动态注册**,不再 M2.5 P0 占灰显槽。plugin-ai(Phase 4)启用后才出现该 tab,plugin-console 通过 `NotificationTab` slot 协议收集,M2.5 P0 只验同步 + 任务到期两个 tab + slot 协议本身。

**NotificationTab 协议**:

```ts
interface NotificationTab {
  tabId: string;                   // 唯一,如 "sync", "todo_due", "ai_suggestions"
  displayName: string;
  order: number;                   // 默认排序
  enabledWhen: () => boolean;      // plugin-ai 未启用时返回 false,tab 不渲染
  unreadCount: () => number;
  Component: React.ComponentType<NotificationTabProps>;
}
```

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-116 | 铃铛入口 | P0-Shell | 标题栏右上(NSToolbar accessory),有未读时显示红点 |
| FR-CON-117 | 通知抽屉壳 + tab 动态注册 | P0-Shell | 点击展开 400×600 抽屉;tab 列从 `pluginRegistry.getNotificationTabs().filter(t => t.enabledWhen())` 收集并按 order 排序;M2.5 默认 2 个 tab(同步状态 / 任务到期),AI tab 在 plugin-ai 注册后自动出现 |
| FR-CON-118 | 同步 tab | P0-Shell | 显示:当前状态(idle / syncing / failed)、上次成功时间、最近 5 条同步日志(push/pull/时长/错误);数据来自 plugin-account / sync 暴露的 hook |
| FR-CON-119 | 任务到期 tab | P0-View | 显示:已过期 + 今日到期 + 即将到期(3 小时内)的 Todo;点跳转;可一键完成或推迟;数据来自 plugin-productivity |
| FR-CON-120 | AI 输出 tab(动态)| P1-Phase3 | plugin-ai(Phase 4)启用后自动出现;显示 AI 自然语言建任务建议、剪贴板分类建议;每条可接受或忽略 |
| FR-CON-121 | 通知聚合 | P0-Shell | 同类型通知 5 分钟内合并(如连续 3 次同步失败合并为一条带"重试"按钮);聚合策略由各 tab 自行定义 |
| FR-CON-122 | 清空 / 标记已读语义 | P0-Shell | 每 tab 底部"全部标记已读" / "清空"。**v0.2 拆分**:"标记已读" / "清空"只影响通知中心 UI 的已读状态记录(`settings.console.notification_read_marker`),**不删除**底层同步日志 / 审计记录 / 业务记录。若用户想真正清理同步日志走 设置 > 数据 > 清理(归 plugin-account 子 PRD) |
| FR-CON-123 | 与 macOS 系统通知关系 | P0-Shell | 关键事件(Todo 到期 / 番茄结束 / 同步失败)同时走 macOS 系统通知;通知中心仅作历史回看 |

### 5.8 多显示器 / 多 Space(FR-CON-124~128,v0.2 加场景矩阵)

> v0.2 修正(回应审查 Major-12):v0.1 只写目标行为,没覆盖 Console + overlay 同开、overlay `canJoinAllSpaces`、全屏 Space、外接屏拔出等真机最容易炸的场景。v0.2 增补 §5.8.2 场景矩阵,真机验收按此跑。

#### 5.8.1 基础 FR

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-124 | Console 是普通窗口 | P0-Shell | 不参与 overlay 的 NSWindowLevel 分层;使用 macOS 标准 collection behavior(`default`,可移动至任一 Space,跟随焦点)|
| FR-CON-125 | 单 Space 显示 | P0-Shell | Console **不**加 `canJoinAllSpaces`;用户切到别的 Space 时 Console 不跟随,留在原 Space |
| FR-CON-126 | Stage Manager 兼容 | P0-Shell | Stage Manager 开启时,Console 作为单独 stage 行为正常;不被 overlay 干扰 |
| FR-CON-127 | 全屏 App 行为 | P0-Shell | 用户全屏其他 App 时,Console 留在原 Space;切回桌面 Space 时仍在 |
| FR-CON-128 | 多屏支持 | P0-Shell | 窗口可拖到任一显示器;关闭前的屏幕 ID + 屏幕内 frame 都存;开机若原屏不在,降级到主屏居中 |

#### 5.8.2 Console × overlay × 多 Space / 多屏 / Stage Manager 场景矩阵

下面这张表是 M2.5 真机验收必跑的最小集。每一行都要在 Sonoma + Sequoia 双系统下手动验一遍。

| # | 场景 | Console 期望行为 | overlay 期望行为 |
|---|---|---|---|
| S-01 | 单屏 + 单 Space + Console 普通窗口 + overlay 开 | 标准窗口,焦点切换不影响 overlay | overlay 浮在桌面层,Console 在窗口层之上;不互相穿透 |
| S-02 | 单屏 + 多 Space + Console 在 Space A,用户切到 Space B | Console 留在 A,不跟随 | overlay `canJoinAllSpaces=true`(参见 R-00 spike)→ 跟随到 B,Grid 继续可见 |
| S-03 | 单屏 + Console 开 + 用户全屏 Safari(新建 Space C)| Console 留在原 Space,在 Space C 不可见 | overlay 在 Space C 是否可见取决于配置:M2.5 默认在全屏 App 上方仍可见,但 click-through 模式 |
| S-04 | 多屏(内屏 + 外屏)+ Console 在外屏 + overlay 默认主屏 | Console 拖到外屏后关闭再开 → 恢复到外屏原位 | overlay 仍在主屏(overlay 的"主屏"定义见 organizer 子 PRD)|
| S-05 | 多屏 + 外屏热拔出 + Console 当时在外屏 | Console 降级到主屏居中,通知中心 toast "外接屏拔出,Console 已移到主屏" | overlay 不受影响 |
| S-06 | Stage Manager 开启 + Console 开 + overlay 开 | Console 作为独立 stage,可被 Stage Manager 归类;焦点切回时 Console 在前 | overlay 不属于 Stage Manager 的 stage 集合(因为它是 `.statusBar` level / canJoinAllSpaces)|
| S-07 | 睡眠 → 唤醒(Console + overlay 双开)| Console 状态恢复;若原屏不在,降级到主屏;nav-state 不丢 | overlay 自动重新挂载到桌面 |
| S-08 | Console 全屏(绿灯)+ overlay 是否仍可见 | Console 全屏后,macOS 自动建独立 Space;overlay 是否跟随取决于配置 | 默认 overlay 不跟随到 Console 的全屏 Space;若需要"看 overlay"用户先退出全屏 |
| S-09 | 用户在外屏全屏 Console + 内屏 overlay | Console 全屏占外屏的独立 Space | overlay 留在内屏,正常运行 |
| S-10 | 关闭 overlay 模式(设置)+ 只用 Console | Console 完全独立运行,所有功能可用 | overlay 不挂起 |
| S-11 | 关闭 Console + 只用 overlay | Console 隐藏,nav-state 持久化;再开恢复 | overlay 正常 |

#### 5.8.3 真机验收脚本

`docs/manual-tests/console-multi-space-checklist.md` 由 M2.5 W5 D24 完成,内容是 S-01 ~ S-11 的逐步操作脚本 + 期望 + 实际记录。dev-plan §5.5 已挂这一项。

### 5.9 主题 / 密度 / 字体(FR-CON-129~133)

> v0.2 修正(回应跨章节一致性 + Major):
> - FR-CON-129 "监听 NSAppearance" 改由 `core-window` host adapter 注入 — `plugin-console` 仍属平台无关包,不直接 import Tauri / NS API,对齐红线 4/13
> - FR-CON-132 密度跨设备语义统一为 **device-local 不同步**,与 §4.3 / §8 数据模型口径一致

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-129 | 跟随系统主题 | P0-Shell | `core-window` host adapter(由 Tauri 宿主在 desktop 侧注入)监听 `NSAppearance` 变化并 push 到 plugin-console;0 延迟切换;CSS variable 实现,不重渲染整树。**plugin-console 自身不 import `@tauri-apps/api`** |
| FR-CON-130 | 手动主题覆盖 | P0-Shell | 设置 > 外观 强制亮/暗/高对比;跨设备同步(`sync_scope=global`)|
| FR-CON-131 | Accent 自定义 | P0-Shell | 8 预设 + 跟随系统 accent;影响选中色、focus ring、按钮 primary 色;跨设备同步 |
| FR-CON-132 | 密度切换(device-local)| P0-Shell | 紧凑/标准/宽松,影响 list 行高 + sidebar padding;**device-local,不同步**(对齐 §4.3 / §8 / FR-CON-93)|
| FR-CON-133 | 字体大小 | P0-Shell | 三档:S(13/14/15) / M(14/15/16,默认) / L(15/16/18);macOS Dynamic Type 暂不接入(P2)|

### 5.10 与 overlay 模式的互通(FR-CON-134~140,v0.2 加 ack / revision)

> v0.2 修正(回应审查 Major-11):v0.1 §7.3 写"两边都监听同一 SQLite + 同一事件流",但不同 Tauri WebView 不会自动监听 SQLite 变化,事件丢失靠启动全量 pull 也不够。v0.2 加入事件 ack + entity revision + 可见窗口定期 reconcile。

#### 5.10.1 一致性策略

1. **写后即广播 + ack**:数据写入 SQLite 后,`core-data` 写一条 `entity_change_log`(实体级 revision 表),emit `productivity:todo-updated { entityId, revision }`。监听方收到事件后:
   - 用 `revision` 判断是否需要 re-fetch(若 `revision <= localRevision` 跳过)
   - 否则按 `entityId` re-fetch 单条,更新本地缓存
   - 处理完 emit `ack:{eventId}` 回给 emitter,emitter 内部维护待 ack 列表
2. **未 ack 兜底重发**:5 秒内未收到 ack 的事件由 emitter 重发 1 次;仍失败由可见窗口在自身 polling tick 中 reconcile
3. **窗口可见性定时 reconcile**:每个 Console / overlay 窗口在 visible 状态下每 30 秒拉取 `entity_change_log` 上一次 reconcile 之后的变更,补上事件链路漏掉的更新
4. **窗口启动全量校准**:窗口从 hidden → visible 或从启动状态,全量拉一次当前 activeModule 范围内的 entity_change_log 增量
5. **冲突优先级**:对接 sync 子 PRD §5.4 的 commit_seq 决胜规则;Console / overlay 任一端跳过冲突 shadow 不在 v1 Console 范畴

#### 5.10.2 FR

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-134 | 数据实时一致(写 → 读)| P0-Shell | Console 改 Todo / 习惯 / 项目卡片 → 写 SQLite + entity_change_log → emit 事件 → overlay Grid 立即 re-fetch 该 entity 并刷新(P95 ≤ 200ms);事件 payload 仅 `{entityId, revision, eventId}`,不含完整数据 |
| FR-CON-135 | overlay 反向通知 Console(读 → 写)| P0-Shell | overlay 改数据(Grid 内勾选 Todo)→ 同一事件链路 → Console 当前可见列表 re-fetch 该 entity 并刷新 |
| FR-CON-135a | 事件丢失兜底 | P0-Shell | 未 ack 重发 + 可见窗口 30s reconcile + 启动全量校准三层兜底;长跑 7 天无视觉漂移 |
| FR-CON-136 | 从 overlay 唤起 Console | P0-Shell | Control 窗 / AI Cube / Widget 上的"打开控制台"按钮 / `Cmd+Shift+Space` |
| FR-CON-137 | 从 Console 创建 overlay Grid | P0-Shell | Console 内任务/项目模块的卡片可拖到桌面或按 `Cmd+Shift+G`(添加到桌面)→ 触发 `organizer:create-grid-request`(新 Grid 内容预填该 list/board)|
| FR-CON-138 | Console 与 overlay 同时开 | P0-Shell | 两者可并存;不互相干扰焦点;Cmd+Tab 时 Console 与 overlay 共享同一 App 标识 |
| FR-CON-139 | overlay 关闭时 Console 保留 | P0-Shell | 用户在设置关闭 overlay 模式,Console 仍可用作独立 App;反之亦然 |
| FR-CON-140 | 同步状态共用 | P0-Shell | 一处显示"同步中"图标,另一处也显示;同一 `account:sync-started` 事件,均由 plugin-account / sync 子 PRD 的 hooks 暴露 |

### 5.11 Onboarding / Empty / Error / 模块缺席 状态(FR-CON-141~150,v0.2 大幅扩展)

> v0.2 修正:
> - 审查 Major-5:错误矩阵从 5 类全局错误扩展到每模块 `loading / empty / partial / failed / permission / conflict` 状态
> - 审查 Minor-2:首次进入 5 步浮层 tour 降级 P1;P0 只要求空状态 + 快捷键 cheat sheet 入口
> - 审查增补 A2:加模块缺席 / 未安装 / 禁用 / 加载失败矩阵

#### 5.11.1 Onboarding

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-141 | 空状态 + cheat sheet 入口 | P0-Shell | M2.5 不要求 5 步 tour;只要求:① 每模块有 empty state 文案 + CTA + 快捷键提示(见 §5.11.2)② 任意位置按 `?` 弹当前模块 cheat sheet ③ 标题栏右上"?"图标点击同 cheat sheet ④ 设置 > 关于 有"查看引导"入口 |
| FR-CON-141a | 5 步浮层 tour | P1-Phase3 | 5 步浮层 tour(sidebar / list / detail / Cmd+K / 快捷键)在 Phase 3 上;状态存 `settings.console.onboarding_done`;**理由**:Console 模仿 macOS 标准窗口,大多数用户能凭直觉操作;空状态 + cheat sheet 已经能让首次用户上手 |
| FR-CON-142 | 模块首次引导 | P1-Phase3 | 用户首次进入"四象限"/"项目"/"标签管理"时,小型 inline 引导卡片(可关闭)|
| FR-CON-143 | 引导跳过策略 | P0-Shell | 用户跳过后,设置 > 关于 提供"重新查看引导"入口(M2.5 入口存在即可,内容 P1 才补)|

#### 5.11.2 Empty States(每模块必有)

| 模块 | Empty 文案 + 主要 CTA |
|---|---|
| FR-CON-144a 任务 | "暂无任务,按 `N` 新建你的第一个 Todo,按 `?` 查看所有快捷键" + 大按钮 |
| 桌面日历(Phase 3)| Phase 3 才有完整视图;M2.5 灰显占位:"桌面日历 Phase 3 上线" |
| 四象限 | 四宫格灰底 + "按 `N` 新建或把任务移到任一象限开始整理(键盘:1/2/3/4 切象限)" |
| 番茄 | "还没启动过番茄,按 `Cmd+Shift+P` 开始 25 分钟专注" |
| 习惯 | "暂无习惯,从习惯库选一个常见习惯,或 `N` 新建" + 习惯库入口 |
| 项目 | "暂无项目,`N` 新建一个看板" |
| 标签 | "暂无 Label,`N` 新建" |
| 进度条 | "暂无进度条,试试一键创建『今年』" |
| 设置 > 任一子页 | 由对应 plugin 自己定义 empty / first-run 状态 |

P0 要求:每个 empty state 都有插画 + CTA + 快捷键提示。

#### 5.11.3 模块级状态矩阵(v0.2 新增,审查 Major-5 + 增补 A2)

每个 sidebar 模块都必须实现下面这张矩阵的 7 个状态:

| 状态 | 触发条件 | UI 呈现 |
|---|---|---|
| `loading` | ConsoleView mount 后数据未到 | skeleton + 200ms 后才显示 spinner(避免闪烁)|
| `empty` | 数据加载成功但 0 条 | 插画 + 文案 + CTA + 快捷键提示(见 §5.11.2)|
| `partial` | 多 provider 聚合时部分 provider 超时 | 已返回 provider 正常显示 + 未返回分组显示"加载中…"或"暂时不可用" |
| `failed` | 数据加载抛错(SQLite 锁 / 死锁 / 解析失败)| 错误卡:"加载失败" + "重试" + "查看诊断信息" + 后台自动重试 3 次(指数退避)|
| `permission` | 该模块需要 macOS 权限(如剪贴板录制需要 Pasteboard 权限)未授予 | "需要 macOS 权限:[权限名]" + "去授予" 按钮跳系统设置 |
| `accountExpired` | account token 过期 / 被服务端撤销 | "需要重新登录" + "去登录" + 关闭抽屉后回 Console 继续离线编辑 |
| `conflict` | sync 子 PRD 报告冲突 shadow | "本机版本与其他设备冲突,点击查看 N 条冲突" → 跳设置 > 数据 > 冲突列表 |

#### 5.11.4 模块缺席 / 未安装 / 禁用 / 加载失败 矩阵(v0.2 新增,增补 A2)

| 状态 | sidebar 显示 | Cmd+K 搜索 | 路由历史降级 | 设置入口 |
|---|---|---|---|---|
| **未安装**(该 plugin 不在 `plugins/` 目录)| 不出现 | 该 provider 不出现 | nav_state 中的旧路由降级到默认 | 设置 > 插件 列表中显示 "未安装" + "安装" 按钮(P1) |
| **已安装但未启用**(用户关闭)| 灰显;tooltip "已禁用" | 该 provider 不出现 | 同上 | "禁用" + "启用" 按钮 |
| **加载失败**(语法错误 / 依赖缺失)| 灰显;tooltip "加载失败,点击查看错误" | 该 provider 不出现 | 同上 | 设置 > 插件 显示错误堆栈 |
| **声明灰显占位**(Phase 3 才上,如 calendar)| 灰显;tooltip "Phase 3 上线" | 不出现搜索结果 | 同上 | 不显示在插件列表(因为是产品规划) |
| **正常但 ConsoleView 渲染崩溃** | sidebar 正常 + 中栏 ErrorBoundary 占位 + "重试" 按钮 | 该 provider 仍出现(因为搜索 provider 是单独的注册) | 不降级 | 设置 > 插件 列出错误 |

#### 5.11.5 Error / Recovery FR

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-145 | 数据库锁错误 | P0-Shell | 单 module loading 失败时按 §5.11.3 `failed` 状态;ErrorBoundary 不波及其他 module |
| FR-CON-146 | 同步失败 | P0-Shell | 通知中心同步 tab 显示红色 + 错误描述 + 重试按钮;标题栏出现"⚠️ 同步失败"小标志 |
| FR-CON-147 | 网络断开 | P0-Shell | 离线时所有写操作仍可执行(本地优先);通知中心顶部黄色提示"当前离线,变更将在恢复后同步" |
| FR-CON-148 | 插件加载失败 | P0-Shell | sidebar 对应模块按 §5.11.4 模块矩阵处理;点击跳设置 > 插件 显示错误 |
| FR-CON-148a | ConsoleView 渲染崩溃 | P0-Shell | ConsoleHost 用 React ErrorBoundary 包裹每个 ConsoleView;一个崩溃不波及其他;错误信息发送到 sentry-style 上报(对齐 TECHNICAL §1.3.3) |
| FR-CON-149 | 写操作冲突 | P1-Phase3 | sync 子 PRD §5.4 commit_seq 决胜;loser 写入 sync 子 PRD 定义的 conflict shadow 表 30 天;通知中心 sync tab 显示"N 条冲突待查看" |
| FR-CON-149a | 设置保存失败 | P0-Shell | settings 写 SQLite 失败时,在表单顶部红色 banner "保存失败,可能因数据库被锁,请重试"——避免静默丢失 |
| FR-CON-149b | 迁移失败 | P0-Shell | 启动时 SQLite migration 失败,Console 拒绝启动;显示全屏报错 + 导出诊断信息 + 联系支持入口 |
| FR-CON-150 | 严重错误兜底 | P0-Shell | 整个 Console 渲染崩溃时,显示全屏 ErrorBoundary:"出错了,请提交诊断信息" + 重启 Console 按钮 + 导出日志按钮 |

### 5.12 i18n / 无障碍(FR-CON-151~158,v0.2 对齐 dev-plan + 按组件细化 a11y)

> v0.2 修正:
> - 审查 Major-8 + 跨章节一致性:i18n M2.5 P0 改为"token 化 + 简中完整",繁中 + 英文 M3/P1 — 与 dev-plan §3 W4 D19 注释 "简中 100% / 繁中+英文 80%" 不再冲突
> - 审查 Major-6:VoiceOver 不能只靠 `listbox role`;按组件类型(tree / sidebar / table / grid / calendar / dialog / toolbar)分别定义 ARIA role 和键盘模式

#### 5.12.1 i18n

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-151 | token 化(强制)| P0-Shell | 所有 UI 文案走 `i18n/` JSON,不允许硬编码中文/英文;CI lint 检查 |
| FR-CON-151a | 简中完整 | P0-Shell | 简体中文翻译 100% 覆盖 |
| FR-CON-152 | 繁中 + 英文 | P1-Phase3 | M3 前补到 100%;M2.5 只要求 80% 覆盖 + 缺失键自动回退到简中 |
| FR-CON-153 | 日期格式 | P0-Shell | 跟随用户区域设置;可在设置覆盖(YYYY-MM-DD / MM/DD/YYYY / DD.MM.YYYY)|
| FR-CON-154 | 数字格式 | P0-Shell | 跟随区域设置(千位分隔符 / 小数点)|

#### 5.12.2 无障碍 — 按组件类型定义

| 组件 | ARIA role / pattern | 键盘交互 | 优先级 |
|---|---|---|---|
| Sidebar(navigation tree)| `role="tree"` + `role="treeitem"` + `aria-expanded` | Tab 进入树,↑/↓ 移焦点,→ 展开,← 折叠,Enter 选中 | P0-Shell |
| List(任务/习惯/标签/进度条/项目卡)| `role="listbox"` + `role="option"` + `aria-multiselectable` | Tab 进入,↑/↓ 移焦点,Space 多选,Cmd+A 全选,Enter 打开 | P0-Shell |
| Detail 表单 | `role="region"` + `aria-labelledby` 指向标题;每字段标签关联 input | Tab 在字段间;Esc 退出当前字段编辑 | P0-Shell |
| Kanban 看板 | 列 = `role="list"` + 卡片 = `role="listitem"` + 整体外壳 `role="region" aria-label="项目看板"` | ←/→ 在列间;Tab 进出列内卡片;Space 选中;Enter 打开详情 | P0-Project |
| Table 项目表格 | `role="grid"` + 行 `role="row"` + 单元格 `role="gridcell"` | 方向键移动,Enter 编辑,Esc 取消 | P0-Project |
| Calendar(Phase 3)| `role="grid"` + `role="gridcell"` + `aria-selected`;月头是 `role="columnheader"` | 方向键移焦点,PgUp/PgDn 翻月,Home 跳本月初,T 跳今天 | P1-Phase3 |
| Dialog(Cmd+K 模态 / 删除确认)| `role="dialog"` + `aria-modal="true"` + 关闭后焦点返回 | Esc 关闭;Tab 在内部循环,不出焦点陷阱(focus trap) | P0-Shell |
| Toolbar(标题栏 NSToolbar / list 顶部 tab)| `role="toolbar"` + 子项 `role="button"` | 方向键在工具栏内移焦 | P0-Shell |
| Drawer(通知中心)| `role="complementary"` + `aria-expanded` | Esc 关闭;焦点进入抽屉 | P0-Shell |
| 虚拟列表 | 必须正确设置 `aria-rowcount` / `aria-rowindex`(因为 DOM 只渲染可见部分,VoiceOver 需要知道总数) | 同 List | P0-Shell |
| 多选 | `aria-selected` 同步选中状态;选中变化时朗读"已选 X 项" | 同 List | P0-Shell |

#### 5.12.3 FR

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-CON-155 | VoiceOver 走查 | P0-Shell | 按 §5.12.2 各组件类型逐一走查;`sidebar → list → detail` 焦点链全过;Kanban 看板能用键盘从列 A 拖卡片到列 B(实际是 Cmd+Shift+M 命令面板,不是真拖) |
| FR-CON-156 | 高对比度 | P0-Shell | 设置 > 外观开启或检测到 macOS "提高对比度" 后,边框 +1px、文字对比度提升、color-only 信号补充图形/文字 |
| FR-CON-157 | 减少动画 | P0-Shell | 设置开启或系统 Reduce Motion 检测到 → 所有 ≥ 100ms 动画降为 0 |
| FR-CON-158 | 颜色对比 | P0-Shell | 文字与背景对比度 ≥ 4.5:1(WCAG AA);大字 ≥ 3:1;Color-only 状态(如优先级)同时有形状或文字标记 |

---

## 6. 非功能需求(Console 特化)

主 PRD §6 列了全局 NFR,本节补 Console 特有的。v0.2 修正(回应审查 Major-4 + Minor-5):性能预算定义测试设备 / 数据形态 / 冷热启动 / 已加载 vs lazy 模块;可用性指标改为命令按键计量,不计算文本输入。

### 6.1 性能预算 — 测试基线

**测试设备基线**(M2.5 真机验收 + dev-plan §7 Engineering 门):

| 设备档 | 型号 | 角色 |
|---|---|---|
| M1(高端基线)| MacBook Pro M1 Pro 16GB / 2021 | 主要开发机,Release 模式 |
| M2(主流)| MacBook Air M2 8GB / 2022 | 主流用户基线 |
| Intel(下限)| MacBook Pro Intel Core i5 / 2019 | v1 支持下限 |

**数据规模分层**(增补 A5):

| 规模档 | Todo | 项目卡片 | 剪贴板 | 习惯日志 |
|---|---|---|---|---|
| 轻量 | 1K | 100 | 1K | 1K |
| 中量(M2.5 主要验收)| 10K | 1K | 10K | 10K |
| 重量(M3 长跑验收)| 50K | 5K | 50K | 50K |

**性能预算 — 已加载 vs 未加载 模块**:

| 指标 | 设备 | 数据规模 | 已加载 P95 | 冷加载 P95 | 越线动作 |
|---|---|---|---|---|---|
| Console 冷启动(从 Cmd+Shift+Space 到三栏渲染完成,默认进 tasks/smart:inbox)| M2 | 中量 | — | 2.0s(target),3.0s(上限) | 阻塞合并;改 lazy import |
| 模块切换 — 已加载模块 | M2 | 中量 | 100ms | — | 改预加载 |
| 模块切换 — 首次 lazy 加载(从未访问过)| M2 | 中量 | — | 400ms(target),700ms(上限) | bundle 大小检查;增加预热(`requestIdleCallback`) |
| List 滚动 fps(虚拟列表)| M2 | 中量 | 60fps | — | 强制虚拟化;React.memo + windowing |
| List 滚动 fps | Intel | 中量 | 55fps | — | 行高估算优化;`will-change` |
| Cmd+K 搜索响应 — P0 provider 集 | M2 | 中量 | 300ms(target),500ms(上限) | — | FTS5 索引;并行 + 200ms 截断 |
| Cmd+K 搜索响应 — 全 provider 集(Phase 3+)| M2 | 重量 | 500ms(target,partial OK)| — | partial results 早呈现 |
| 数据写入到 overlay 刷新(走事件链)| M2 | — | 200ms(target),400ms(上限) | — | 检查事件管道;ack 重发 |
| 主题切换 | 任意 | — | 0ms | — | CSS variable 不重渲染 |
| 拖拽 reorder 视觉反馈 | M2 | 中量 | 16ms(一帧) | — | dnd-kit drop-down 算法优化 |
| 内存(Console 已加载所有 P0 模块,中量数据)| M2 | 中量 | — | 250 MB(target),350 MB(上限) | 内存泄漏排查;每模块独立 budget |
| 内存(Console 启动后未触发任何模块切换 lazy load)| M2 | 中量 | — | 150 MB(target),200 MB(上限) | 同上 |

**冷启动 vs 热启动**:
- **冷启动**:App 主进程未运行,从 `Cmd+Shift+Space` 触发到三栏渲染
- **热启动**:App 主进程已在(overlay 在跑),Console 窗口关闭再开 → 目标 ≤ 500ms
- **从隐藏唤出**:Console 窗口已存在但隐藏 → 目标 ≤ 100ms

**Debug vs Release**:本表所有数字都是 **Release 构建**指标;Debug 不计入验收。

### 6.2 可观测性

复用 TECHNICAL_REQUIREMENTS §1.3 全局规则,Console 额外埋点:

- Performance.mark:`console.open` / `console.module-switch` / `console.module-lazy-load` / `console.search-query`
- 错误链:Console 内任何渲染错误带 module + sub-state + nav-state 上报
- 设置 > 数据 > 诊断信息额外导出:Console nav-state + pane widths + last sync trace + last 5 reconcile diffs

### 6.3 可用性指标(v0.2 修订:命令按键计量)

| 指标 | 目标 |
|---|---|
| 全键盘完成"新建 Todo → 加 Label → 设截止日 → 启动番茄"流程 | **≤ 8 次"命令按键"**(不计算 Todo 标题与 Label 名称的文本输入,只算 N / L / D / Enter / Cmd+Shift+P 这种命令性按键)|
| 从 Cmd+Shift+Space 到看到自己昨天的工作记录(进任务模块"今日"/选中昨天的记录)| ≤ 5 秒 |
| 三栏布局学习成本(新用户)| 首次进入按 `?` 浮层 cheat sheet 后即可独立用 |

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

### 7.2 ConsoleView 契约(v0.2 新增,Critical-4 + 增补 A1)

> v0.2 修正:`PLUGIN_SDK §3.1` 中 `ConsoleView?: React.ComponentType` 是裸的,没有 props / host / route / focus / search / settings 协议。Console 是 plugin-console 与 8+ 业务 plugin 的契约面;契约不清会让每个 plugin 各写各的、ConsoleHost 无法统一 focus / 路由 / 宽度 / 搜索 / 错误边界。**本节定义完整契约;PLUGIN_SDK 在 Phase 2.5 W1 D1 按此契约更新**。

#### 7.2.1 ConsoleView 完整 props 契约

```ts
import type React from "react";

export interface ConsoleViewProps<TRoute = object> {
  /** Host 注入的能力面;ConsoleView 与外壳间唯一通道 */
  host: ConsoleHostCapabilities;

  /** 当前模块的子路由(从 console.nav_state.modulePath 投影);plugin 自己定义 TRoute 形状 */
  route: TRoute;

  /** 写回子路由;触发 nav-state 持久化 + URL 状态更新(若启用)  */
  setRoute(updater: Partial<TRoute> | ((prev: TRoute) => TRoute), opts?: { replace?: boolean }): void;

  /** 三栏 slot:ConsoleView 选哪栏填什么 */
  slots: ConsoleSlotApi;

  /** 焦点 API:ConsoleView 通知外壳"当前焦点在哪一栏",外壳处理 Tab 跨栏 */
  focusApi: FocusApi;

  /** 多选 API:ConsoleView 把选中状态报给外壳 toolbar(批操作)*/
  selectionApi: SelectionApi;

  /** 错误边界:ConsoleView 可主动报错给外壳显示 §5.11.5 错误卡 */
  errorBoundary: { reportError(err: Error, ctx?: object): void };

  /** Loading 边界:ConsoleView mount 后未画首屏时,外壳显示 skeleton */
  loadingBoundary: { setLoading(loading: boolean): void };

  /** Telemetry:performance.mark + 错误链 + 业务指标 */
  telemetry: TelemetryApi;
}

export interface ConsoleHostCapabilities {
  /** 跨模块跳转,等价于 ConsoleHost 内部触发 sidebar 切换 */
  openModule<TR>(module: string, route?: TR): void;

  /** 打开 Cmd+K 模态 */
  openSearch(opts?: { query?: string; providerFilter?: string[] }): void;

  /** 弹出 Dialog(走 packages/ui Dialog 单例) */
  showDialog(props: { title: string; body: React.ReactNode; actions: DialogAction[] }): Promise<DialogResult>;

  /** 弹 Toast(右下角) */
  showToast(props: { kind: "info" | "success" | "warning" | "error"; message: string; ttlMs?: number; action?: { label: string; onClick: () => void } }): void;

  /** 触发通知中心新通知(默认 + 系统通知) */
  notify(props: { tabId: string; payload: unknown }): void;

  /** 主题 / 密度 / accent 当前值(只读,ConsoleView 不直接改) */
  appearance: Readonly<{ theme: Theme; density: Density; accent: string; fontSize: "S" | "M" | "L" }>;

  /** i18n */
  t(key: string, params?: Record<string, unknown>): string;
  locale: Readonly<{ lang: "zh-CN" | "zh-TW" | "en-US"; dateFormat: string }>;

  /** 数据访问 — 走 core-data;ConsoleView 不应直接 import @tauri-apps/api */
  data: CoreDataDriver;

  /** 事件 emit / listen — 走 core-events */
  events: CoreEvents;

  /** 当前账号 / 同步状态 — 只读 snapshot */
  account: Readonly<{ id: string; displayName: string; syncState: "idle" | "syncing" | "failed" }>;
}

export interface ConsoleSlotApi {
  /** ConsoleView 通过 slot 填充三栏内容;不直接控制布局 */
  setMid(component: React.ReactNode): void;
  setDetail(component: React.ReactNode | null): void;  // null = 折叠 detail
  setListToolbar(component: React.ReactNode | null): void;  // list 顶部 tab / 过滤栏
  setDetailToolbar(component: React.ReactNode | null): void;
  /** 临时全屏画布(日历月视图、四象限网格):占用 list + detail */
  setFullCanvas(component: React.ReactNode | null): void;
}

export interface FocusApi {
  /** 报告焦点所在栏 → 外壳处理跨栏 Tab */
  reportFocus(pane: "list" | "detail"): void;

  /** 请求把焦点交还给 list 或 detail(键盘 shortcut 触发) */
  focusPane(pane: "list" | "detail"): void;

  /** Tab 出栈到 sidebar 时外壳会调这个 hook,ConsoleView 可保存当前 focus index */
  onPaneBlur(cb: () => void): () => void;
}

export interface SelectionApi {
  /** 把当前 list 多选状态报给外壳;外壳渲染批操作 toolbar */
  setSelection(selection: { entityIds: string[]; entityType: string }): void;

  /** 外壳触发的批操作动作回调(由 ConsoleView 实现) */
  onBatchAction(handler: (action: "delete" | "addLabel" | "moveList", payload: unknown) => Promise<void>): () => void;
}

export interface TelemetryApi {
  mark(name: string): void;
  measure(name: string, startMark: string, endMark: string): void;
  reportError(err: Error, ctx?: object): void;
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}
```

#### 7.2.2 必须实现的 ConsoleView 副协议

每个声明 `windows.console = true` 的 plugin 必须同时:

| Slot | 用途 | 必填 | 备注 |
|---|---|---|---|
| `ConsoleView` | 模块主视图(`ConsoleViewProps`)| ✅ | manifest CI 强校验 |
| `SettingsSection[]` | 模块的设置子页(可多个 sectionId)| 视需要 | M2.5 至少 plugin-console 自己注册 appearance / shortcuts / about |
| `SearchProvider` | 模块的 Cmd+K provider | 推荐 | 没有 provider 的 plugin 不可被搜索,仅能从 sidebar 进入 |
| `LabelEntityResolver` | 若 plugin 的实体可被打 Label,必须提供 resolver | 视需要 | plugin-productivity / plugin-project 必填;clipboard 看是否参与 Label |
| `NotificationTab` | 若 plugin 想在通知中心建独立 tab(如 AI / sync)| 可选 | 默认不显示 |

#### 7.2.3 ConsoleView 生命周期

```
ConsoleHost 切到模块 X
  │
  ├─ pluginRegistry.get("plugin-X").components.ConsoleView 拿到组件
  ├─ 包入 React ErrorBoundary
  ├─ 注入 host 实例 + route 投影 + slots
  ├─ mount 时调用 loadingBoundary.setLoading(true)
  │
  ├─ ConsoleView mount → 内部加载数据 → setMid(...) + setDetail(...)
  ├─ 完成首屏后 loadingBoundary.setLoading(false)
  │
  ├─ 用户操作 → ConsoleView 调 host.events.emit + host.data.write
  │
  ├─ 切到模块 Y → ConsoleHost 调用 onPaneBlur 通知 ConsoleView 保存 focus
  ├─ ConsoleView unmount → 自行清理订阅
  │
  └─ Y 切回 X → 用 nav_state.modulePath.X 恢复 route → 流程重新开始
```

### 7.3 plugin-console 的职责边界

`plugin-console` **只**提供:

- `<ConsoleHost />`:三栏外壳 + sidebar 渲染逻辑(调 `pluginRegistry.getConsoleSidebarEntries()`)+ 加载灰显占位
- 通知中心组件(铃铛 + 抽屉 + tab 动态注册)
- 全局搜索 Cmd+K 模态(SearchProvider 协议 + 聚合 + 超时 / 部分结果)
- 设置容器(SettingsSection slot)+ plugin-console 自己提供的 appearance / shortcuts / about 子页
- 三栏宽度 / 折叠 / 模块切换的 state 管理(写入 `settings`)
- 主题 / 密度 / Accent 的 CSS variable 注入(`NSAppearance` 由 `core-window` host adapter 注入,plugin-console 不直接读)
- Empty / Error / Module 缺席的统一兜底(§5.11)
- ConsoleViewProps 注入 + ErrorBoundary 包裹

`plugin-console` **不做**:

- 任何业务逻辑(Todo CRUD / 习惯打卡 / 项目卡片移动 …)→ 都在对应 plugin 的 `ConsoleView`
- 数据访问 → 通过 `core-data` 注入
- 原生 API → 通过 `core-window` / `core-shortcuts` 注入
- Onboarding tour 的"功能介绍内容"(P1-Phase3 才补;M2.5 只做框架)

### 7.4 数据流(v0.2 与 §5.10 一致)

```
用户操作(Console 内)
   │
   ▼
plugin-X 的 ConsoleView 组件
   │
   ├─ 读:host.data driver(SQLite 桌面 / REST 网页)
   │
   └─ 写:host.data driver
            │
            ├─ 1. 写本地 SQLite(桌面端)
            ├─ 2. 写 entity_change_log 表(revision 自增)
            ├─ 3. emit core-events 事件(例如 productivity:todo-updated { entityId, revision, eventId })
            │
            ▼
        其他窗口(overlay Grid、Control widget)的 listener
            │
            ├─ 比对 revision,若新于本地缓存才 re-fetch
            ├─ 处理完 emit ack
            │
            └─ 同时每 30s reconcile,补救事件丢失
```

关键点(对齐 §5.10):

- Console 与 overlay **不直接共享 React 状态**(它们是不同 Tauri 窗口、不同 React 树)
- 数据一致性走 **entity_change_log + 事件 ack + 周期 reconcile** 三层保障(不是"两边都监听 SQLite"——SQLite 变更不会自动跨 WebView 广播)
- 事件 payload 只带 `{ entityId, revision, eventId }`,不带完整数据,接收方去 `host.data` 重读
- 长跑 7 天后(M3 验收)无视觉漂移

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

Console 无独立业务表(对齐主 PRD §5.13.4),只在 `settings` 表中存键(下表)+ 与 `core-data` 共建 `entity_change_log`(§7.4 数据一致性)。

#### 8.1 settings 表中的 Console 键(v0.2 加 sync_scope 列对齐 sync 子 PRD)

| key | 类型(value_json) | sync_scope | 说明 |
|---|---|---|---|
| `console.nav_state` | NavState JSON(见 §3.3) | device | 当前活动模块 + 子状态 |
| `console.window_frame` | `{x, y, w, h, screenId}` | device | 关闭前的窗口位置/大小 |
| `console.pane_widths` | `{sidebar, list, detail}` | device | 三栏宽度 |
| `console.sidebar_collapsed` | bool | device | sidebar 折叠 |
| `console.detail_collapsed` | bool | device | detail 折叠 |
| `console.density` | "compact" \| "standard" \| "comfortable" | device | 密度(设备相关,见 §4.3 / FR-CON-132)|
| `console.theme` | "system" \| "light" \| "dark" \| "high-contrast" | global | 主题 |
| `console.accent` | "system" \| "blue" \| "purple" \| ... | global | accent |
| `console.font_size` | "S" \| "M" \| "L" | global | 字号档 |
| `console.reduce_motion` | bool | global | 减少动画 |
| `console.calendar.layers` | `{todo, habit, pomodoro}` bools | global | 日历图层开关(Phase 3 才用)|
| `console.hidden_modules` | string[] | global | sidebar 隐藏的模块 ID(P1)|
| `console.search_history` | string[](最多 20) | device | Cmd+K 最近搜索 |
| `console.search.enabled_providers` | string[] | device | P1 provider 开关偏好 |
| `console.notification_read_marker` | `{ [tabId]: timestamp }` | device | 通知中心已读位点 |
| `console.onboarding_done` | bool | global | 首次引导完成(P1)|

`sync_scope` 由 `settings` 表的列承载(对齐 sync 子 PRD §6.1);Console PRD 不重复定义表 schema。

#### 8.2 entity_change_log 表(与 core-data 共建,§7.4 引用)

由 `core-data` 子 PRD 定义具体 schema;Console PRD 仅声明 **plugin-console / business plugin 都必须经过 core-data 接口写入,不直接 INSERT 业务表**。该约束在 CI lint 阶段强制。

---

## 9. 验收清单(v0.2 重写:Shell + Module 两层 + macOS 菜单栏 + 跨窗口脚本)

> v0.2 重要修正(回应审查"验收清单评估"):v0.1 验收清单把 Shell / Module / Phase 3 / Phase 4 全压在一个 4-6 周窗口里,实际不可交付。v0.2 拆成两层:**Shell 必过**(plugin-console 外壳) + **Module 必过**(Phase 2 已 Stable 的业务 plugin 在 Console 内的最小可用视图)。Phase 3+ 模块允许灰显占位但必须有清晰占位 + 不可达状态。

### 9.1 M2.5 Shell 必过(plugin-console)

#### 9.1.1 窗口生命周期(对应 §5.1)
- [ ] Sonoma + Sequoia 双系统:Console 启动 / 关闭(隐藏)/ 最小化 / 全屏 / Cmd+Q 退出全部正常
- [ ] `Cmd+Shift+Space` 唤起 Console;再按聚焦,不新建第二窗口
- [ ] 关闭 (✕) 隐藏窗口,首次关闭显示**非阻塞 toast**(不是阻塞弹窗);Cmd+Q 退出整个 App
- [ ] 关闭再开:模块、子状态、三栏宽度、sidebar/detail 折叠、window frame 全部恢复;原屏不在降级主屏

#### 9.1.2 IA / 路由(对应 §3 / §5.2)
- [ ] Sidebar 模块树渲染按 `pluginRegistry.getConsoleSidebarEntries()` 顺序
- [ ] Inbox 显示在"任务"模块下二级第一项(**不是顶层模块**);路由是 `tasks/smart:inbox`
- [ ] 桌面日历 sidebar 项以**灰显占位**呈现;点击 toast "Phase 3 上线",不切 activeModule
- [ ] `Cmd+1~9` 切前 9 个非灰显模块;灰显项不参与编号
- [ ] 路由从 v0.1 旧 nav_state(`activeModule=inbox` 或 `=calendar`)启动时,自动降级 + 通知中心 toast

#### 9.1.3 三栏布局(对应 §4 / §5.3)
- [ ] **采用方案 A** macOS 原生 titlebar + NSToolbar accessory;无自绘 titlebar / 自绘 traffic lights
- [ ] 拖动分隔条 + 双击还原 + 键盘 `Cmd+Option+←/→/0` 全过
- [ ] 窄屏 (< 1080px) detail 自动变抽屉;Esc 收起
- [ ] 1 万条 list 滚动 M2 设备 60fps,Intel 55fps;首次渲染 < 200ms

#### 9.1.4 设置容器(对应 §5.4.9)
- [ ] 设置走 SettingsSection slot;plugin-console 自己提供 appearance / shortcuts / about 三个 section
- [ ] 主题 / 密度 / 字体 / Accent / 减少动画即时生效 0 闪烁
- [ ] 业务 plugin 提供的 section(account / data / privacy / plugins / sync)在容器中正常渲染;**Console PRD 不验各业务 section 的内部细节**,那些由对应业务子 PRD 验

#### 9.1.5 Cmd+K 全局搜索(对应 §5.5)
- [ ] Cmd+K 仅在 Console 前台时生效,**不抢全局**
- [ ] P0 provider 集(Todo / Label / Project / Settings / Module jump)正常返回结果并分组
- [ ] 任一 provider 超 200ms abort,显示 "加载中…" 占位 ≤ 800ms,800ms 仍未返回显示 "暂不可用"
- [ ] 命令面板 `>` 模式可切换主题 / 切模块 / 新建 Todo
- [ ] P95 搜索响应在中量数据(10K Todo + 1K Project card)≤ 300ms
- [ ] 启用敏感模式时,剪贴板 provider 不出现(连"暂不可用"也不出)

#### 9.1.6 通知中心(对应 §5.7)
- [ ] 标题栏铃铛 + 未读红点;NotificationTab slot 动态注册
- [ ] M2.5 默认 2 个 tab(同步 / 任务到期);AI tab **不要求灰显占位**
- [ ] 同步 tab 数据来自 plugin-account 暴露的 hook;Console 不自己实装同步逻辑

#### 9.1.7 多 Space / 多屏(对应 §5.8 矩阵)
- [ ] §5.8.2 表 S-01 ~ S-11 全部在 Sonoma + Sequoia 双机走一遍
- [ ] 外接屏拔出场景:Console 自动降级主屏 + 通知中心 toast
- [ ] Console 全屏 + overlay 同开:行为符合 S-08

#### 9.1.8 主题 / 密度 / i18n / a11y(对应 §5.9 / §5.12)
- [ ] 主题:跟随系统切换 0 闪烁;手动覆盖;Accent 切换;高对比度
- [ ] 密度:紧凑/标准/宽松三档切换;行高真的变化;**不跨设备同步**
- [ ] i18n:简中 100% / 繁中 + 英文 ≥ 80%(剩余键回退简中);所有文案 token 化(CI lint)
- [ ] VoiceOver 走查 §5.12.2 各组件类型(tree / listbox / grid / dialog / toolbar / drawer / 虚拟列表)
- [ ] 减少动画:设置开启或系统 Reduce Motion 检测到 → 所有 ≥ 100ms 动画降为 0

#### 9.1.9 Empty / Error / 模块缺席(对应 §5.11)
- [ ] 每模块 empty state 都有插画 + CTA + 快捷键提示;按 `?` 弹 cheat sheet
- [ ] 模块状态 7 种(loading / empty / partial / failed / permission / accountExpired / conflict)全部可触发并呈现正确
- [ ] 模块缺席矩阵:未安装 / 未启用 / 加载失败 / 灰显占位 / ConsoleView 崩溃 5 种状态全过
- [ ] ConsoleView 一个崩溃不波及其他模块(ErrorBoundary 隔离)

#### 9.1.10 性能(对应 §6.1)
- [ ] M2 + Release 模式 + 中量数据下:冷启动 P95 ≤ 3.0s;已加载模块切换 P95 ≤ 200ms;lazy 首次加载 P95 ≤ 700ms
- [ ] Cmd+K P0 provider 集 P95 ≤ 500ms
- [ ] 数据写入到 overlay 刷新 P95 ≤ 400ms
- [ ] 内存中量数据 ≤ 350MB

#### 9.1.11 ConsoleView 契约(对应 §7.2)
- [ ] PLUGIN_SDK §3.1 已按 §7.2.1 更新,有完整 ConsoleViewProps / HostCapabilities / SlotApi / FocusApi / SelectionApi / Telemetry 接口
- [ ] CI manifest schema 校验:声明 `windows.console=true` 的 plugin 必须导出 ConsoleView
- [ ] plugin-console **不 import `@tauri-apps/api`**(CI lint)

#### 9.1.12 macOS 菜单栏(v0.2 新增,增补 A3)
- [ ] **File**:New Todo(`Cmd+N`)/ Open Console(`Cmd+Shift+Space`)/ Close Window(`Cmd+W`)/ Quit XAI Desktop(`Cmd+Q`)
- [ ] **Edit**:Undo / Redo / Cut / Copy / Paste / Select All / Find in List(`Cmd+F`)
- [ ] **View**:Toggle Sidebar(`Cmd+\`)/ Toggle Detail(`Cmd+Shift+]`)/ Enter Full Screen / Show Cheat Sheet(`?`)
- [ ] **Window**:Console / Minimize(`Cmd+M`)/ Bring All to Front
- [ ] **Help**:XAI Help / Diagnostic Info / Feedback / About
- [ ] 每个 menu item 的 enabled / disabled 状态正确(空 list 时 Edit > Select All 灰)

### 9.2 M2.5 Module 必过(Phase 2 已 Stable 业务 plugin 的 ConsoleView)

#### 9.2.1 任务模块(plugin-productivity)
- [ ] 列表 / 分组 / 智能清单"今日"逻辑;`N/j/k/Space/Enter` 全键盘可达
- [ ] 详情字段(标题 / 描述 / 截止 / 提醒 / 简化重复 / 优先级 / Labels / 子任务 / 关联番茄)显示正确
- [ ] **不验图片粘贴、附件、批改全部字段** — 父 PRD §5.2 line 189 明确不做
- [ ] Cmd+Shift+P 启动番茄绑定;完成动画 + 5 秒撤销

#### 9.2.2 四象限模块
- [ ] 拖 + 键盘(1/2/3/4 / Cmd+Option+方向键)双路径
- [ ] Console ↔ overlay 同步;P95 200ms

#### 9.2.3 番茄模块
- [ ] 当前会话面板 + 历史柱状图;关联任务跳转

#### 9.2.4 习惯模块
- [ ] 列表 7 圆点 + streak + 月达成率;详情**只**有日历 tab(热力图 Phase 3)
- [ ] Space 打卡;A 归档

#### 9.2.5 标签模块(plugin-labels + resolver 协议)
- [ ] Label CRUD + 引用计数
- [ ] Label 详情聚合走 `labelEntityResolver`;Todo / 项目卡片 resolver 正常返回;缺席 plugin 显示降级占位

#### 9.2.6 进度条模块
- [ ] 列表 + 详情 + 一键预置;键盘 N 新建

### 9.3 M2.5 P0-Project 必过(plugin-project 并行交付)
- [ ] Kanban + Table 视图;卡片在列间(拖 + 键盘 ←/→ / Cmd+Shift+M)
- [ ] 卡片 ↔ Todo 互转(Cmd+Option+T / Cmd+Option+B)走 §5.4.6 路径,**不**走 sidebar 拖源(v0.1 错已修)
- [ ] 卡片归档

### 9.4 M2.5 灰显占位必过
- [ ] 桌面日历 sidebar 项灰显;点击触发"Phase 3 上线"toast;路由不切
- [ ] AI tab 不出现(plugin-ai 未注册)
- [ ] 通过 stub plugin-calendar 让 ConsoleHost 不报错

### 9.5 M2.5 跨窗口一致性脚本(v0.2 新增,增补 A4)

`docs/manual-tests/console-cross-window-consistency.md` 在 W5 D24 完成,内容:

| 脚本 # | 场景 | 期望 |
|---|---|---|
| X-01 | Console 改 Todo → overlay Grid 监听 | overlay 200ms 内刷新;无重复刷新 |
| X-02 | overlay 改 Todo → Console 列表监听 | Console 200ms 内刷新 |
| X-03 | 离线场景:Console 改 Todo,overlay 同步监听 | overlay 立即更新(本地事件) |
| X-04 | 事件丢失模拟:手动 kill plugin-X 的 listener,30s 后 reconcile 拉到差异 | reconcile 后状态恢复一致 |
| X-05 | 冲突 shadow:Console 与服务端同时改同一 Todo,LWW 决胜 | loser 写入 sync 子 PRD 的 conflict shadow;Console 通知中心提示 |
| X-06 | 启动全量校准:Console 启动时拉 nav_state 范围内变更日志 | 启动后 1 秒内补齐离线期间的变更 |
| X-07 | Web 未来:占位 — 仅记录"Web 上线时 X-01 ~ X-06 全部要在 Web 重跑" | — |

### 9.6 M3 验收(进入 Phase 3 前必过)

Console 必须在 M2.5 Shell + Module + Project + Cross-Window 验收全过的基础上,再补:

- [ ] Console 持续运行 7 天无内存泄漏(测试时连续开 7 天 + 周期性操作脚本)
- [ ] Console + overlay 双开 24 小时无崩溃
- [ ] Cmd+K 在重量数据(50K Todo + 50K 剪贴板,Phase 3 剪贴板 provider 启用后)P95 ≤ 800ms;partial results P95 ≤ 500ms
- [ ] 跨窗口一致性脚本 X-01 ~ X-06 在 7 天长跑后仍全过

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
| 2026-05-16 | v0.2-draft | 回应 Console 子 PRD 审查报告(2026-05-15)8 Critical / 12 Major / 5 Minor / 5 增补全部回应;关键变更:① 桌面日历 / 习惯热力图整组降级 Phase 3,M2.5 仅占位;② P0 拆为 P0-Shell / P0-View / P0-Project / P1-Phase3 / P2-Later 五标签;③ Todo 附件 / 批量操作 / 复杂 RRULE UI 越界范围回收;④ 引入 ConsoleViewProps / HostCapabilities / SlotApi / FocusApi / SelectionApi 完整契约;⑤ Cmd+K 改应用内 + SearchProvider 协议;⑥ 标题栏锁定方案 A(原生 + NSToolbar);⑦ 所有拖拽 P0 增补键盘对偶清单;⑧ 验收清单重写为 Shell + Module + Project + Cross-Window 四层;⑨ 增补 macOS 菜单栏 / 跨窗口一致性脚本 / 模块缺席矩阵 / 数据规模分层 / Console+overlay 多 Space 场景矩阵;⑩ density 同步语义在 §4.3 / §5.9 / §8 三处统一为 device-local | Claude(subagent) |

## 13. v0.2 修订摘要 — 对照审查条目

> 这一节用来给后续 reviewer 和 build agent 做对照。详细落点见各 §。

| 审查条目 | 严重度 | v0.2 落点 |
|---|---|---|
| FR-CON-49~54 月/周/日 P0 冲突 dev-plan | 🔴 Critical-1 | §0.1 / §5.4.2 整组降级 P1-Phase3,M2.5 仅 §5.4.2 P0-Shell 占位 |
| 146 FR P0 过多失去"必做"含义 | 🔴 Critical-2 | §0.2 优先级体系拆为 P0-Shell / P0-View / P0-Project / P1-Phase3 / P2-Later |
| Todo 图片粘贴 / 批量 / 复杂 RRULE 越界 | 🔴 Critical-3 | §0.1 / §5.4.1 删除 + 移交;FR-CON-44 改纯文本;FR-CON-36 多选保留但批改字段限定 |
| ConsoleView slot 契约缺失 | 🔴 Critical-4 | §7.2 完整 props 契约;PLUGIN_SDK 在 Phase 2.5 W1 D1 按此更新 |
| 多个 P0 拖拽 / 右键违反全键盘可达 | 🔴 Critical-5 | §5.3 / §5.4 各拖拽 FR 内嵌键盘等价路径;§5.6.4 拖拽对偶清单;§9.1.3 验收 |
| Cmd+K 写成全局快捷键与 macOS HIG 冲突 | 🔴 Critical-6 | §5.5.1 作用域分层:Cmd+Shift+Space 全局 / Cmd+K 应用内 |
| 自绘 48px 标题栏 vs 原生标题栏冲突 | 🔴 Critical-7 | §4.1 锁定方案 A(原生 titlebar + NSToolbar accessory)|
| Cmd+K 无 provider 协议 / 超时 / 隐私过滤 | 🔴 Critical-8 | §5.5.2 SearchProvider 协议;§5.5.3 provider 分层;§5.5.4 FR-CON-104a/b |
| Inbox 顶层 vs 任务子项歧义 | 🟡 Major-1 | §3.1 改;Inbox 是 `tasks/smart:inbox`;§5.2 FR-CON-27 同步 |
| FR-CON-74 sidebar 拖源不存在 | 🟡 Major-2 | §5.4.6 FR-CON-74 改为看板/表格内卡片 + 键盘 Cmd+Option+T/B |
| console.density 同步语义冲突 | 🟡 Major-3 | §4.3 / §5.9 / §8 / §9.1.8 四处统一为 device-local |
| 性能预算无设备 / 数据 / 冷热定义 | 🟡 Major-4 | §6.1 测试设备 + 数据规模 + 冷/热/lazy/已加载分层 |
| 错误状态只 5 类全局 | 🟡 Major-5 | §5.11.3 模块级 7 状态矩阵;§5.11.4 模块缺席矩阵;§5.11.5 FR 扩展 |
| a11y 过浅,只用 listbox | 🟡 Major-6 | §5.12.2 按组件类型(tree/listbox/grid/calendar/dialog/toolbar/drawer/虚拟列表)定义 |
| 设置 P0 吞并 plugin-account / sync / plugin-manager | 🟡 Major-7 | §5.4.9 大幅收敛:Console 只提供容器 + SettingsSection slot;子页移交各业务 plugin |
| i18n M2.5 / M3 冲突 | 🟡 Major-8 | §5.12.1:M2.5 P0 = token 化 + 简中 100%;繁中 + 英文 P1-Phase3(对齐 dev-plan) |
| Label 无 provider 协议 | 🟡 Major-9 | §5.4.7 labelEntityResolver 协议 + §7.2 副协议表 |
| 通知 AI tab 占 P0 槽 | 🟡 Major-10 | §5.7 NotificationTab 协议动态注册;AI tab 改 P1-Phase3 |
| 数据一致性"两边监听 SQLite"不可行 | 🟡 Major-11 | §5.10.1 ack / revision / reconcile 三层;§7.4 数据流图修订 |
| 多 Space 场景未覆盖 | 🟡 Major-12 | §5.8.2 S-01 ~ S-11 场景矩阵;§5.8.3 真机脚本 |
| 同步状态徽标位置不当 | 🟢 Minor-1 | §3.1.1 + §5.2 FR-CON-24:同步状态移到标题栏 + 通知中心 |
| 5 步 tour P0 偏重 | 🟢 Minor-2 | §5.11.1 FR-CON-141a 降 P1-Phase3,P0 改为 empty state + cheat sheet |
| 通知清空可能误删审计 | 🟢 Minor-3 | §5.7 FR-CON-122 拆分 UI 已读 vs 数据清理 |
| 首关阻塞弹窗打断 macOS 体验 | 🟢 Minor-4 | §5.1 FR-CON-15 改非阻塞 toast |
| 按键计量含文本输入不可测 | 🟢 Minor-5 | §6.3 改为"命令按键"计量,8 次以内 |
| ConsoleView 契约表 | 💡 增补 A1 | §7.2 完整契约 |
| 模块缺席矩阵 | 💡 增补 A2 | §5.11.4 |
| macOS 菜单栏规格 | 💡 增补 A3 | §9.1.12 |
| 跨窗口一致性脚本 | 💡 增补 A4 | §9.5 X-01 ~ X-07 |
| 数据规模分层 | 💡 增补 A5 | §6.1 三档 + §9 验收按中量;M3 验重量 |

## 14. 与父 PRD §5.13 的对齐

回应审查"与父 PRD (主 PRD §5.13) 的对齐检查":

| 父 PRD §5.13 边界 | v0.1 越界 | v0.2 修订 |
|---|---|---|
| "控制台**不是新功能集合**,只做统一窗口化外壳"(主 PRD line 511)| Todo 图片粘贴 / 批量操作 / 复杂 RRULE / 账号 / 数据库 vacuum / 插件管理 / 完整日历 / 项目深度交互全被写入 Console P0 | §0.1 范围红线显式回收;§5.4.1 / §5.4.2 / §5.4.9 / §5.7 收敛;Console 只定义"如何承载"不定义"承载什么具体能力" |
| "Todo 不做附件、批量操作"(主 PRD §5.2 line 189)| FR-CON-44 图片粘贴;FR-CON-36 多选批操作含改优先级 / 改截止日 | §5.4.1 删除图片粘贴;§5.3 FR-CON-36 多选限定"删除 / 加 Label / 移动清单"三项,删除批改优先级 / 截止日;**§13 备注:此处经父 PRD 边界微调,因为"加 Label / 移动清单"是 list 管理而非业务批改;若产品 Owner 倾向更严格,可进一步降到只"删除 + 加 Label"** |
| "整体控制台只做布局和导航"(主 PRD line 511)| 设置 9 个子页内容详细规格 | §5.4.9 改为"容器 + slot",子页规格移交对应业务子 PRD |
| 主 PRD §5.13 未提"桌面日历必须 P0" | v0.1 FR-CON-49~54 标 P0 与 dev-plan §1 line 30 "Phase 3 才接入"冲突 | §5.4.2 整组 P1-Phase3 + 灰显占位 |

— END of Console PRD v0.2-draft —
