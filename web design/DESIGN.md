# XAI Console — 设计说明文档

> 一款双语（中 / 英）个人生产力工作台。融合任务、项目板、习惯、专注、日历、四象限、统计、AI 对话、桌面宠物与冥想等模块，强调流畅交互、视觉一致性与高度个性化。

---

## 目录

1. [项目概览](#1-项目概览)
2. [设计原则](#2-设计原则)
3. [信息架构](#3-信息架构)
4. [核心模块详解](#4-核心模块详解)
5. [设计系统（Tokens）](#5-设计系统tokens)
6. [组件目录](#6-组件目录)
7. [个性化与主题](#7-个性化与主题)
8. [双语支持](#8-双语支持)
9. [数据模型与持久化](#9-数据模型与持久化)
10. [文件结构与技术架构](#10-文件结构与技术架构)
11. [响应式与无障碍](#11-响应式与无障碍)
12. [实现验收清单](#12-实现验收清单)
13. [后续可扩展方向](#13-后续可扩展方向)

---

## 1. 项目概览

**产品名称**：XAI Console（XAI 工作台）
**形态**：单页面 Web 应用，桌面端优先，自适应小屏
**目标用户**：需要中英文混用、追求极简但功能完备的个人或团队
**核心价值**：把分散的生产力工具（任务 / 看板 / 日历 / 番茄 / 习惯 / 倒计时 / 冥想 / AI 助手）整合为一处，所有偏好（颜色、布局、密度、字号）实时生效并持久化

**设计灵感来源**
- **TickTick / 滴答清单** — 信息密度、清单 / 任务 / 日历 的层级
- **macOS Big Sur / Sonoma** — 圆角、毛玻璃、Dock 形态
- **Trello / Jira** — 看板、Table / Timeline / Map 多视图、List Color
- **Linear / Notion** — 干净的命令面板、Cmd-K 风格
- **Google Gemini** — AI 中心化的对话呼吸氛围
- **iPhone Clock / 苹果时钟** — 大字时间、刻度、世界时

---

## 2. 设计原则

| 原则 | 说明 |
|---|---|
| **克制** | 不滥用渐变、emoji、装饰图标。颜色饱和度通常 < 0.18 oklch |
| **密集而呼吸** | 信息密度高，但通过 8px / 12px 间距节奏与白面板隔出气口 |
| **一致的运动语言** | 所有过渡用 `cubic-bezier(.22, 1, .36, 1)`，时长 140 / 220 / 360ms 三档 |
| **双语对等** | 中英所有文案、字体（Manrope + Noto Sans SC + JetBrains Mono）排版均匀 |
| **可个性化** | 主题 / 密度 / 字号 / 主色调 / 背景调子 / 侧栏方向 / 桌宠样式 全部可设 |
| **本地优先** | 用 localStorage 持久化所有偏好，零网络依赖 |

---

## 3. 信息架构

```
┌─────────────────────────────────────────────────────────┐
│ Topbar  [Search] [EN/中文] [Light/Dark/System] [Density]│
├──────┬──────────────────────────────────────────────────┤
│ Rail │ Main Module Area                                 │
│ (左/ │   - AI Chat                                      │
│ 右/  │   - Tasks                                        │
│ 顶/  │   - Project Boards (Workspace / Board)           │
│ Dock)│   - Dashboard                                    │
│      │   - Calendar                                     │
│      │   - Eisenhower Matrix                            │
│      │   - Pomodoro                                     │
│      │   - Habits                                       │
│      │   - Meditation                                   │
│      │   - Countdown                                    │
│      │   - Search                                       │
│      │   - Statistics                                   │
│      │   - Settings                                     │
└──────┴──────────────────────────────────────────────────┘
                            (Desktop Pet 可浮动在任意位置)
```

**导航逻辑**
- 左侧（或顶 / 底 Dock / 右侧）App Rail 是模块入口，图标拖拽换序
- 顶部头像点击 → Settings / Statistics / Sign Out 三向菜单
- 顶 bar 集中放高频偏好（语言 / 主题 / 密度 / Settings 入口）

---

## 4. 核心模块详解

### 4.1 AI Chat（XAI 智谈）

| 元素 | 说明 |
|---|---|
| 左侧 sidebar | 对话历史列表（可隐藏，248px 宽，开收 360ms 滑入） |
| 中央背景 | 5 层 aurora blob（90px blur + screen 混合）+ 3 层 conic gradient 色流（40 / 55 / 70s 旋转）+ 60 颗星点（3–8s 闪烁）+ SVG 颗粒噪点。同时 `.ai-aurora` 自带 4 层环境径向渐变兜底，确保全屏被 accent 色铺满 |
| 中央 orb | 三层径向渐变球，呼吸 9 / 11 / 13s；思考时加速到 3.5 / 4.2 / 5s |
| Composer | 胶囊状输入框，附件 `+`、模型选择（Haiku / Sonnet / Opus）、麦克风（可关）、回车发送 |
| Insights | 默认隐藏的 Starter Prompts，右上 pill 切换显示 |
| 真实 LLM 接入 | `window.claude.complete(text)`，出错落回演示文案 |

### 4.2 Tasks（任务）

- 二级 sidebar：智能清单 / 自定义清单 / 筛选器 / 标签 / 订阅日历 / 已完成 / 不做了 / 回收站
- 四列时间桶视图：Overdue / Next 7 Days / Later / No Date
- 卡片含 checkbox、标签 pill、日期、来源 inbox 标识
- **跨列拖拽**：拖到目标列即可，自动重写卡片日期为对应桶（Overdue=3 天前 / Next 7=2 天后 / Later=30 天后 / No Date=清空）
- 目标列高亮 accent + 顶栏提示条

### 4.3 Project Boards（项目板）

#### 工作区 + 多看板
- 顶栏左：彩色工作区 chip（Personal / Team Workspace）+ 当前看板名 ▾
- 切换器模态：搜索 + 分组（All / Personal / Team Workspace）+ 看板卡片网格 + 「New board」入口
- 创建器：3 个模板（Basic Kanban / Project Management for Teams / Blank）+ 命名 + 选择工作区

#### Project Management for Teams 模板
- 5 个彩色阶段列：To Do（灰）/ In Progress（蓝）/ In Review（黄）/ Blocked（红）/ Done（绿）
- 卡片专用标签集：Forms / Accounts / Feedback / Billing / Research
- 顶部可切换的 **Status Overview 横幅**：左侧标题+说明，中间环形图（按列分布），右侧带百分比的图例

#### 6 视图切换
| 视图 | 描述 |
|---|---|
| **Board** | 经典 Kanban，列可定制 10 色 + 行内 add card |
| **Table** | 每行一卡片，列：Card / List / Labels / Members / Due / Progress。点 Due → 日期选择器（含 Today/Tomorrow/Next Mon 快捷）；点 Labels / Members → 多选下拉 |
| **Calendar** | 月历，卡片落到对应日期格，**可拖拽改截止** |
| **Dashboard** | 4 张 KPI + 按列 / 按标签的水平条形图（颜色跟随列 / 标签） |
| **Timeline** | 30 天甘特视图。每条 bar 有 **左 / 中 / 右 三个把手**：左右拖拽改 start / due；中间拖拽整体平移 |
| **Map** | 抽象地图占位（需给卡片加地点字段后渲染） |

#### 底部 4 按钮（多面板模式）
- Inbox / Planner / Board 可叠加切换
- 只选 1 个 → **全屏铺满**
- 选 2 或 3 → 并排（Inbox 260px、Planner 320px、Board 自适应）
- Switch boards → 打开看板切换器
- 至少一个面板必须保持开启

### 4.4 Dashboard（工作台）

- 12 列响应式 widget 网格
- **拖拽换位（macOS Stage Manager 风格）**：每张 widget 可拖动到任意位置，使用 FLIP 动画使其他卡片平滑让位 380ms
- Widget 类型：
  - **Clock**：4 种样式（Classic / Split / Minimal / Analog）+ 12 个时区可选；模拟时钟带完整 60 分钟细刻度 + 12 小时粗刻度 + 12 个数字
  - **Mini Calendar**：mac 风格月历，每日待办下方显示彩色点；点击跳转到 Calendar 模块
  - **World Clocks**：3 种视图（List / Analog / Grid）+ 12 城市可添 / 可删
  - **Weather**：当前温度 + 5 日预报
  - **Stickies**：便签堆叠（轻微旋转）
  - **Mail**：未读红点 + badge
  - **Upcoming**：近期事件列表
  - **3 张迷你统计**：完成任务 + donut / 习惯连胜 + 火焰 / 番茄 + 点阵

### 4.5 Calendar（日历）

- 2026 年 5 月 月视图
- 4 色事件条带（mint / amber / blue / violet）
- 顶栏视图切换（Month / Week / Day）

### 4.6 Eisenhower Matrix（四象限）

- 2×2 网格，每象限带顶部色条
- 紧急 · 重要 / 不紧急 · 重要 / 紧急 · 不重要 / 不紧急 · 不重要

### 4.7 Pomodoro（番茄钟）

- 环形计时器（实时秒针）+ 启动 / 暂停 / 继续 / 结束
- 右侧 4 张总览卡 + 专注记录列表

### 4.8 Habits（习惯）

- 周打卡列表 + 详情区
- 详情：4 张统计卡（本月打卡 / 累计 / 本月率 / 连续）+ 6/365 进度 + 月历 + 习惯日记

### 4.9 Meditation（冥想）

- 大型预览卡 + 4 选择器：场景 / 时钟样式 / 环境音 / 时长
- 5 个场景渐变（Forest / Ocean / Night / Rain / Void）
- 4 种时钟样式（Digital / Split / Analog / Minimal — 都是实时实现）
- 全屏 player：粒子上升动画 + 呼吸圆环（8s 缩放循环）+ 进度条 + 倒计时 + 右上退出按钮

### 4.10 Countdown（倒计时）

- 倒计时卡片网格（含图片底 / 浅底两种风格）
- 新建占位卡

### 4.11 Statistics（统计）

- Range tabs：本周 / 本月 / 全部
- 4 张 KPI（任务 / 专注 / 习惯 / 日均），含 trend %
- 趋势线图（专注时长折线 + 阴影填充）
- 24 小时高产时段柱状图（峰值自动高亮 + 发光）
- 按标签分布 ring chart
- 习惯排行榜（Top 5 + streak 火苗）
- 半年专注热力图 + 图例
- 本周洞察（动态文案）

### 4.12 Settings（设置）

8 个完整面板：
- **Account**：头像 + 名称 + 邮箱 + 升级 / 登出 / 注销
- **Premium**：升级 CTA
- **Features**：8 个模块开关 + 原创 SVG 缩略图预览
- **Smart Lists**：按区分组 + Show / Show if not empty / Hide 三态
- **Notifications**：开关 + 4 种完成音效 + 勿扰时段
- **Date & Time**：周起始 / 农历 / 周数 / 节假日 / 时区
- **Appearance**：语言 / 主题 / 密度 / **背景调子（6 色）** / **主题色（6 预设 + 全色谱滑杆）** / **侧栏位置（4 方向预览卡）** / 字号 + **Save & apply / Reset to defaults** 按钮
- **More**：Smart Recognition + Task Default + Task Template
- **Integrations**：Featured / Calendar / Integrate 三组应用卡（10+ 集成）
- **Collaborate**：协作设置
- **Sticky Note**：13 色色板（含「随机」）+ 字号 + 默认置顶 + 网格间距 4 档
- **Hotkeys**：10 项快捷键表
- **About**：XAI logo + 版本 + 链接

### 4.13 Desktop Pet（桌宠）

- 8 个原创角色：Mochi（薄荷球）/ Pip（小鸟）/ Sprout（小苗）/ Lumi（灯泡）/ Drip（水滴）/ Pebble（小石）/ Star（小星）/ Ember（火苗）
- 每个有独立动画（bob / hop / sway / glow / still / twinkle / flicker）
- 全屏可拖拽，位置 localStorage 持久化
- 点击 → happy 态 + 随机贴士气泡
- 气泡底有「换一只」链接 → 弹出 Pet Picker 选择器（带每只动态预览）
- Rail 底部 🐾 切换开关

### 4.14 Avatar Menu（头像菜单）

- 头像点击 → 弹出菜单：Settings / Statistics / Sign Out（带头像、皇冠会员标、姓名、邮箱）
- 头像位置随 Rail 方向调整：左 = 顶右展开 / 右 = 顶左展开 / 顶 = 左下展开 / 底 = 左上展开

---

## 5. 设计系统（Tokens）

定义在 `tokens.css`，所有数值通过 CSS 变量。

### 5.1 颜色

#### 表面色（Light）
```css
--bg-app:          oklch(96.5% 0.018 158)   /* 主背景（随 bg-tone 变） */
--bg-rail:         oklch(63% 0.08 165)      /* 侧栏 */
--bg-panel:        #ffffff                   /* 白面板 */
--bg-panel-2:      oklch(98% 0.01 170)      /* 次面板 */
--bg-hover:        oklch(96% 0.012 170)
--bg-selected:     oklch(94% 0.025 165)
```

#### 文字
```css
--text-1: oklch(22% 0.012 220)   /* 主 */
--text-2: oklch(40% 0.008 220)   /* 次 */
--text-3: oklch(58% 0.006 220)   /* 三级 / caption */
--text-4: oklch(72% 0.004 220)   /* placeholder */
```

#### 主色（驱动整个 UI）
```css
--accent-hue: 165;                       /* 可配置 hue (0–360) */
--accent-chroma: 0.10;
--accent:        oklch(60% var(--accent-chroma) var(--accent-hue));
--accent-hover:  oklch(55% ...);
--accent-soft:   oklch(94% 0.04 var(--accent-hue));
--accent-ink:    oklch(38% ...);
```

#### 语义色
- red / amber / blue / violet / pink — 浅底 + 深字组合，对应错误 / 警告 / 信息 / 强调

#### 标签调色（任务标签）
- study / work / personal / todo / other —— 都是低饱和度的不同色相

#### 列调色（看板列颜色）
10 色：green / yellow / orange / red / purple / blue / teal / lime / pink / gray

### 5.2 字体

```css
--font-sans: 'Manrope', 'Noto Sans SC', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

字号比例（密度 = comfortable）：
| Token | Px | 用途 |
|---|---|---|
| --fs-2xs | 10.5 | 微注释 |
| --fs-xs  | 11.5 | 标签 / KBD |
| --fs-sm  | 12.5 | 按钮 / 表格 |
| --fs-md  | 13.5 | 正文（默认） |
| --fs-lg  | 15   | 子标题 |
| --fs-xl  | 18   | 模块标题 |
| --fs-2xl | 22   | 区块标题 |
| --fs-3xl | 28   | 页面标题 |
| --fs-display | 64 | Hero / 大数字 |

### 5.3 间距（4 px scale）
`s-1` 4 / `s-2` 8 / `s-3` 12 / `s-4` 16 / `s-5` 20 / `s-6` 24 / `s-7` 32 / `s-8` 40

### 5.4 圆角
| Token | Px | 用途 |
|---|---|---|
| --r-xs | 4 | 微 chip |
| --r-sm | 6 | tag / pill |
| --r-md | 8 | 卡片、按钮 |
| --r-lg | 12 | 大面板 |
| --r-xl | 16 | 模态、模块壳 |
| --r-pill | 999 | 完全圆 |

### 5.5 阴影（极柔）
- `--shadow-1`：1 px outline + 1 px ambient
- `--shadow-2`：浮起 4–14 px
- `--shadow-3`：模态 14–40 px

### 5.6 密度
通过 `[data-density="compact"]` 覆盖：
- 行高 36 → 30 px
- 卡片 padding 10/12 → 7/10 px
- 字号 -1 px

### 5.7 动效
```css
--ease-out: cubic-bezier(.22, 1, .36, 1);
--ease-in-out: cubic-bezier(.65, 0, .35, 1);
--dur-fast: 140ms;
--dur-med:  220ms;
--dur-slow: 360ms;
```

---

## 6. 组件目录

| 组件 | 文件 | 描述 |
|---|---|---|
| `<AppRail>` | shell.jsx | 侧栏图标条，4 方向，可拖拽换序 |
| `<Topbar>` | shell.jsx | 顶部工具栏 |
| `<AvatarMenu>` | shell.jsx | 头像下拉菜单 |
| `<TaskCardV2>` | module-tasks.jsx | 任务卡 |
| `<TaskSidebar>` | module-tasks.jsx | 二级清单导航 |
| `<BoardModule>` + 6 视图 | module-board.jsx | 项目板 |
| `<BoardSwitcher>` `<BoardCreator>` `<StatusOverviewBanner>` `<InboxPanel>` `<PlannerPanel>` | module-board.jsx | 看板切换 / 创建 / 状态总览 / 收件箱 / 计划面板 |
| `<ClockWidget>` `<MiniCalWidget>` `<WorldClocks>` `<WeatherWidget>` `<StickiesWidget>` `<MailWidget>` `<UpcomingWidget>` `<StatTasks>` etc. | module-dashboard.jsx | 工作台 widget |
| `<MeditationPlayer>` `<ClockDisplay>` | module-meditation.jsx | 冥想全屏播放器 |
| `<DesktopPet>` `<PetPicker>` | pet.jsx | 桌宠 + 选择器 |
| `<AIModule>` `<BreathingOrb>` | module-ai.jsx | AI 对话 + 呼吸背景 |
| `<KPICard>` `<BarChart>` `<LineChart>` `<RingChart>` `<HourBar>` `<Heatmap>` | module-statistics.jsx | 统计图表 |
| `<SettingsModule>` + 13 个 pane | module-settings.jsx | 全套设置 |
| `<Toggle>` `<SettingRow>` `<SectionBlock>` | module-settings.jsx | 设置原子组件 |

---

## 7. 个性化与主题

| 维度 | 选项 | 实现 |
|---|---|---|
| **语言** | EN / 简体中文 | `lang` state → `useI18n` hook |
| **主题** | Light / Dark / System | `data-theme` 属性 |
| **背景调子** | Sage / Cream / Mist / Lavender / Peach / Graphite | `data-bg-tone` 属性 → 覆盖 `--bg-app` 等 |
| **主题色** | 6 预设 + 全色谱 hue 滑杆 | `--accent-hue` 变量 |
| **密度** | Comfortable / Compact | `data-density` 属性 |
| **字号** | 85%–115% | `font-size` on root |
| **侧栏位置** | Left / Right / Top / Bottom Dock | `data-rail-pos` 属性，每方向有独立视觉变体（Dock 是 macOS 浮动胶囊） |
| **桌宠** | 8 个角色 + 开关 | `petId` + `petOn` |
| **Rail 顺序** | 拖拽换序 | `xai_rail_order` |
| **看板 / 卡片 / 列颜色 / 时区 / 时钟样式 / 番茄记录 / 习惯打卡** | 全部 | localStorage 多键持久化 |

---

## 8. 双语支持

- `i18n.js` 中所有文案集中维护，结构 `I18N.en.module.key`、`I18N.zh.module.key`
- 在组件中 `const { s } = useI18n(lang); s("habits.title")` 即可读取
- 字体堆栈中 Manrope 处理拉丁 + Noto Sans SC 处理中文，自动 fallback
- 数字使用 JetBrains Mono（`.mono` 类）保持对齐
- 顶栏 EN / 中文 segment 切换即时换文案（不刷新）

---

## 9. 数据模型与持久化

### 9.1 主要 state（App 顶层）

```js
{
  module, lang, theme, density, fontScale,
  accentHue, railPos, bgTone, petOn
}
```

### 9.2 持久化键（localStorage）

| 键 | 内容 |
|---|---|
| `xai_accent_hue` | 主题色 hue |
| `xai_rail_pos` | 侧栏方向 |
| `xai_bg_tone` | 背景调子 |
| `xai_rail_order` | Rail 图标顺序 |
| `xai_pet_pos` / `xai_pet_id` | 桌宠位置 / 角色 |
| `xai_task_cols` | 任务列状态 |
| `xai_boards_v2` / `xai_active_board` | 看板数据 / 当前看板 |
| `xai_board_panels` / `xai_board_inbox` | 底部多面板状态 / 收件箱卡片 |
| `xai_dash_order` | Dashboard widget 顺序 |
| `xai_clock_style` / `xai_clock_tz` | 时钟样式 / 时区 |
| `xai_zones` | 世界时区列表 |
| `xai_ai_convos` / `xai_ai_insights` / `xai_ai_voice` | AI 对话 / 提示开关 / 语音开关 |
| `xai_pref_*` | 所有 Settings 偏好（`usePref` hook 自动写） |

### 9.3 主要数据结构

```js
// Board
{
  id, workspaceId, name: { en, zh }, cover,
  template: "kanban" | "pm" | "blank",
  lists: [{ id, key|customName, color, cards: [] }]
}

// Card
{
  id, title: { en, zh }, labels: [labelId],
  members: [userId], checklist: { done, total },
  due, start, dueLate, attach, cover
}
```

---

## 10. 文件结构与技术架构

### 10.1 文件列表

```
index.html          # 入口 + script 引入顺序
tokens.css          # 设计 tokens (CSS variables)
layout.css          # 所有布局与组件样式
i18n.js             # 中英文案 + MOCK 数据
board-data.js       # 工作区 / 看板 / PM 模板数据
icons.jsx           # SVG 图标组件
shell.jsx           # AppRail + Topbar + AvatarMenu
app.jsx             # 根组件 App
module-tasks.jsx
module-board.jsx
module-dashboard.jsx
module-calendar.jsx
module-matrix.jsx
module-pomodoro.jsx
module-habits.jsx
module-countdown.jsx
module-meditation.jsx
module-statistics.jsx
module-search.jsx        (集成在 app.jsx)
module-ai.jsx
module-settings.jsx
pet.jsx                  # 8 桌宠 + Picker
```

### 10.2 技术栈

- **React 18.3.1** + **ReactDOM 18.3.1**（CDN）
- **Babel Standalone 7.29.0** 转译 type="text/babel" 脚本
- 字体：Manrope / Noto Sans SC / JetBrains Mono（Google Fonts）
- 颜色全部 `oklch()` 表达
- 零打包工具，纯 HTML + JSX

### 10.3 组件 / 模块通信

- App 层管理全局 state（lang / theme / accent / etc.），通过 props 注入各 Module
- 各 Module 独立 state（任务、看板等），自带 localStorage 持久化
- 跨模块跳转：App 暴露 `goTo(moduleId)` 给需要的子组件（如 Dashboard 的 mini calendar 跳转 Calendar）

---

## 11. 响应式与无障碍

| 断点 | 行为 |
|---|---|
| ≥ 1400px | 默认 12 列 dashboard / 6 列 settings |
| 1100–1400 | Tasks 4→2 列、Habits 单列、Statistics 折叠 KPI |
| 760–1100 | Settings 单栏、Matrix 4 行单列 |
| < 760 | 隐藏二级 sidebar、Topbar 紧凑 |

**无障碍**
- 所有按钮带 `aria-label` / `title`
- `aria-selected` 用于 segmented control
- 颜色对比度 WCAG AA（文字 4.5+）
- Cmd/Ctrl-K 占位（实际接搜索可扩展）
- 键盘操作：Tab / Enter / Esc 都能驱动模态

---

## 12. 实现验收清单

- [x] 中英文实时切换全 UI 文案 / 字体 / 排版
- [x] Light / Dark / System 主题切换
- [x] Comfortable / Compact 密度切换
- [x] 字号 85–115% 滑杆
- [x] 主题色 hue 滑杆 + 6 预设
- [x] 6 种背景调子
- [x] 侧栏 4 方向（含 macOS Dock 形态）
- [x] 全部偏好持久化到 localStorage
- [x] 任务跨列拖拽 + 日期自动重写
- [x] 看板卡片跨列拖拽
- [x] 看板 6 种视图
- [x] 看板列颜色（10 色） + 列动作菜单
- [x] 看板工作区 + 切换器 + 创建器 + 3 模板
- [x] Project Management 模板含 Status Overview
- [x] 底部 3 按钮多面板切换（单选全屏 / 多选并排）
- [x] Dashboard widget 拖拽换位（FLIP 动画）
- [x] 时钟 4 样式 + 12 时区
- [x] 模拟时钟完整刻度
- [x] Mini 月历跳转 Calendar
- [x] 8 桌宠 + 选择器 + 全屏拖拽
- [x] AI Chat + 流动宇宙背景 + 模型切换 + 麦克风可关 + 附件
- [x] AI Insights 可隐藏
- [x] Statistics 多图表 + 范围切换
- [x] 13 个 Settings pane 全填充
- [x] Sticky Note 13 色色板
- [x] Hotkeys 表
- [x] Save & apply / Reset to defaults
- [x] Rail 图标拖拽换序

---

## 13. 后续可扩展方向

| 功能 | 说明 |
|---|---|
| **搜索面板** | Cmd-K 全局命令面板，搜任务 / 习惯 / 笔记 / 跳模块 |
| **真实日历视图增强** | Week / Day 视图，支持创建事件 |
| **倒计时多模板** | 用户自上传背景图 + 多预设字体 |
| **桌宠互动加深** | 拖到任务卡上 → 触发完成动画 |
| **冥想接真实音效** | 流水 / 雨 / 海浪音频源 |
| **AI 综合洞察** | 把你的真实数据（专注 / 完成率 / 标签分布）打包送 LLM 给个性化建议 |
| **拖拽更高级** | dnd-kit 替代 HTML5 DnD 实现真正的位移动画 |
| **协作** | 把 Workspace 拆出成员 + 实时同步（接 Yjs / WebSocket） |
| **导出** | PDF / iCal / CSV |
| **PWA** | 离线缓存 + 桌面安装 |

---

## 附录：组件库快速索引

```
# Card 风格
.panel               白面板 + 边框 + 浅阴影
.task-card           任务卡
.board-card          看板卡
.cd-card             倒计时卡（含图片底变体）
.bs-card             看板切换器卡

# 按钮
.btn.primary         主按钮（accent 实色）
.btn.ghost           次按钮（panel + border）
.icon-btn            纯图标按钮
.board-icon-btn      看板顶栏按钮（含 active 反色态）
.bv-btn              底部多面板切换按钮

# 输入
.search-box          顶栏搜索
.ai-input            AI 输入框
.ai-composer         整条胶囊 composer（含 backdrop blur）

# 控制
.seg                 分段控制（segmented control）
.toggle              开关（Settings 用）
.cbx                 圆形 checkbox

# 列表
.list-row            sidebar 列表行（hover / active 态）
.popover-item        popover 中的菜单项

# Tag / Pill / Chip
.tag.study/work/...  任务标签
.bc-label            看板标签
.pill                通用 pill

# 浮层
.modal-scrim         模态遮罩（带 backdrop blur）
.card-modal          卡片详情模态
.popover             下拉浮层
.avatar-menu         头像菜单
```

---

> 文档版本 v1.0 · 2026.05.23
> 维护者：XAI Design Team
