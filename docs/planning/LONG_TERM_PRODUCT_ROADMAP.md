# LONG_TERM_PRODUCT_ROADMAP.md — 长期产品平台路线图（1–3 年）

> **定位**：本文是 XAI 产品**长期平台演进**的单一规划来源（planning-only）。它回答"未来的 iPhone / iPad / Apple Watch / Android / 浏览器扩展等平台**何时**进入路线图、**以什么顺序**进入、**承载什么**、**如何与现有面协同**"。
>
> **形式**：planning 文档（不是 ADR）。约束力低于 ADR，便于迭代；稳定后可升格为 ADR-0016。
>
> **权威关系**：
> - 当前三面（Web / Mac 壳 / 桌面插件）的**功能边界**以 `docs/MODULE_BOUNDARIES.md` 为准；本文不重定义当前边界，只在其上扩展"未来面"层。
> - 当前 active-focus 顺序以 `docs/adr/0010-p1-desktop-resume-plan.md`（amended）为准。
> - 分支拓扑 / D3 / D4 以 `docs/adr/0013-branch-sync-governance.md` 为准。
> - 机器可读镜像见 `docs/workflow/project/module-classification.json` 的 `future_surfaces` 块（标 planning-only，**永不**作为 active 分类目标）。
>
> **硬边界**：本文中的"未来面"全部是 **planning-only**——除非 operator 显式确认，**不得开工、不得开分支、不得进 feature-build**。当前开发仍只以 Web / Mac 壳 / 桌面插件三面 + 共享核心为主。
>
> **团队前提（2026-06-04 更新）**：本项目后续为**多人开发**。因此"是否规划多平台"**不再受独立开发者带宽约束**——**多平台长期规划是必要且可行的**。它以 **future surfaces** 形式进入文档与看板（本文 + `module-classification.json` 的 `future_surfaces` + dev-dashboard 产品结构图的"未来面"层），但**不进入当前开发队列**——这是**排期与聚焦**的选择，不是产能限制。promotion 到当前模块/开发队列仍需 operator 显式确认。
>
> 最后更新：2026-06-04

---

## 1. 核心原则：一个产品，多个面（One Product, Many Surfaces）

XAI 不是"多个产品",而是 **一个产品 + 多个交付面（surface）**。面之间的差异是**形态因子与原生能力**,不是**产品本身**。

让未来平台"自然接入、不推翻"的**唯一架构前提**：

> **现在就投资一个"与面无关"的共享核心 = 数据模型 + 账号 + 同步 + 业务逻辑包 + 可移植 UI。每个未来面都是这个核心的一层薄投影(projection),不是一次重写。**

这意味着 sync / account / core-data 地基**不是浪费**,而是未来 iPhone/iPad/Watch/Android 即插即用的**长期使能器**。多人开发下,共享核心更要保持**清晰边界 + 合理范围**(按需扩展加密 / 同步深度,而不是一次堆满),让每个新面都能以薄投影接入,也让多人并行时各面互不踩踏。

**接入契约(让未来面即插即用的硬约束)：**

1. **数据模型与面无关**：实体定义(`packages/core-data/src/entities.ts`)与 `syncScope` 是所有面共享的单一来源;新面只读写实体,不发明数据契约。
2. **账号 + 同步是唯一的跨面汇合点**：Web 与 App 不互相同步,都同步到同一账号云(ADR-0013 §D4);未来每个面都接同一账号云,只搬 `account-sync` 实体,`device-local` 永不上云。
3. **UI 尽量可移植**：业务逻辑进 `packages/plugin-*`(平台无关),UI 组件尽量复用;新面优先**包壳复用 Web**(PWA / Capacitor / Tauri Mobile),原生重写仅在收益明确时。
4. **能力按面降级(capability detection)**：完整面承载完整编辑,轻面只承载捕获/速览,环境面只承载微交互;同一份核心按面投影不同子集,而不是每面 fork 一份功能。

---

## 2. 面角色分类法（先定角色，平台自动归位）

未来平台不按"硬件"规划,按**角色**规划——先定三类角色,平台自动对号入座。这是防止"每加一个平台就重新决策一次"的关键模型。

| 面角色 | 承载什么 | 屏幕/交互 | 属于它的平台 |
|---|---|---|---|
| **完整面 · Organize & Plan** | 全部功能、完整编辑、规划编排 | 大屏、键鼠/触控 | **Web** · **Mac 壳** · iPad |
| **轻捕获面 · Capture & Glance** | 快进快出:速记、速览、提醒 | 中小屏、单手 | iPhone · Android · **浏览器扩展** |
| **环境/微交互面 · Ambient & Micro** | 一瞥即走、单击操作、贴在环境里 | 极小屏/桌面贴附 | **Apple Watch** · **桌面插件/挂件** |

> 💡 **关键洞察**：**桌面插件 = macOS 上的"环境面",和 Apple Watch 在手腕上是同一个角色。** organizer / 便签 / 挂件 就是桌面版的"表盘 complication"。XAI 的"环境层"因此是**跨硬件统一**的——未来 Watch 与桌面插件可以共享同一套"微交互 / 快速入口"设计语言和数据切片。

---

## 3. 当前面（active，本阶段开发主体）

当前阶段只开发这三面 + 共享核心。三面边界详见 `docs/MODULE_BOUNDARIES.md`,此处只给长期定位摘要。

| 当前面 | 角色 | 长期定位 | 一句话身份 |
|---|---|---|---|
| **Web 版本** | 完整面 | 产品的"大脑",所有面的功能与 UI 源头 | 完整产品功能层 |
| **Mac 桌面壳** | 完整面 | **Web 的原生容器**,提供原生便利(离线/菜单栏/通知/账号) | 把 Web 装进原生窗 + 原生 chrome,**不是桌面整理器** |
| **桌面插件** | 环境面 | macOS 桌面原生超能力层(多窗口/挂件/快速入口) | 插件平台运行时 + 具体插件 |

### 3.1 关键澄清：物理位置 ≠ 产品归属

> **多窗口 / 原生窗口的 Tauri 命令,物理上必须实现在 host 进程 `apps/desktop/src-tauri`(只有 host 能调 Tauri)。但"多窗口 / overlay 运行时"的【产品归属】是【桌面插件平台】,不是 Mac 壳的身份。**

- **Mac 壳的身份** = Web 容器 + 原生 chrome(单主窗口承载 SPA、菜单栏、托盘、离线缓存、账号/Keychain、自动更新、系统通知、深链、开机启动)。
- **桌面插件平台运行时** = 多窗口引擎、点击穿透、Spaces/多显示器矩阵、grid 持久化、Plugin Host/SDK——物理代码落在 host(app 通道执行),但**产品归属是 plugin**。
- 这保留了"造窗口是 host 层代码的活、插件只消费命令"的红线(`MODULE_BOUNDARIES.md §4`),同时落实"Mac = Web 壳、多窗口/挂件 = 插件产品"的产品框架。

---

## 4. 未来面（planning-only，仅规划不开发）

下表是本文的核心。每个未来面给出:定位 / 进入时机 / 承载(适合) / 不承载 / 与现有面协同 / 实现策略。

| 平台 | 角色 | 长期定位 | 进入路线图时机 | 承载（适合） | 不承载 | 与现有面协同 | 实现策略（复用优先） |
|---|---|---|---|---|---|---|---|
| **iPhone** | 轻捕获面 | 第一移动面,捕获+速览+提醒 | **Y1 H2 起 PWA;Y2 上原生薄壳** | 速记任务/记账/笔记、今日视图、习惯打卡、番茄/计时、日历速览、推送提醒、分享面板 | 看板复杂编排、项目管理、文档长编辑、桌面整理 | 共享账号+同步;捕获面"喂"给 Web/Mac 的编排面 | PWA → Capacitor / Tauri-Mobile **薄壳复用 Web UI** + 原生(push/widget/share/biometric);SwiftUI 重写仅在必要时 |
| **iPad** | 完整面 | "轻 Mac",介于 iPhone 与 Mac 之间 | **Y1 随 PWA 自然覆盖;专用 app 仅 Y2–3 且有 pencil/分屏需求** | 规划画布、日历、看板、阅读/复盘、较完整编辑 | (作为独立代码库——默认不做) | 同账号同步;大屏≈接近完整套件 | **永不先开独立代码库**:响应式 Web/PWA → Mac Catalyst →(仅 pencil/Stage Manager 需求验证后)才专用 |
| **Apple Watch** | 环境面 | iPhone 的伴侣,微交互面 | **Y2–3,iPhone 原生之后** | 习惯打卡、计时/番茄起停、今日下一项、快速记账金额、冥想开始、表盘 complications(连胜/下一任务) | 项目管理、文档、Dashboard、复杂编辑 | **依附 iPhone app 取数**;complications 上表盘 | 原生 watchOS **伴侣** app,小范围;留存/惊喜面 |
| **Android** | 轻捕获面 | 移动捕获面(非 Apple 生态) | **Y2 起 PWA 兜底;原生 Y2–3 且付费需求验证后** | 同 iPhone(捕获/速览/提醒) | 同 iPhone | 同账号同步 | PWA 先覆盖;Capacitor 复用 Web 或 Kotlin 原生仅在出现付费 Android 群体后;**优先级最低** |
| **浏览器扩展** | 轻捕获面 | 最便宜的捕获面 | **Y1–2 机会主义(可能早于移动原生)** | 网页剪藏、快速加任务/书签、新标签页今日视图、omnibox 速加 | 完整编辑 | 同账号;捕获面 | 复用 Web 组件 + 薄扩展壳 |

**两条铁律(写进长期架构,防止以后推翻)：**

- ⚠️ **iPad 永不是独立产品线**——是响应式 Web 的平板形态(必要时 Mac Catalyst)。
- ⚠️ **Apple Watch 永不是独立产品线**——是 iPhone 产品的一个伴侣功能。

---

## 5. 1 / 2 / 3 年相位路线图

### Year 1 — 夯实"一核三面"（= 当前阶段）

- **Web（P0）**：核心功能 + 统一数据结构稳定。
- **共享核心**：数据模型 + 账号 + 同步(合理范围) + 业务逻辑包 + **可移植 UI**——未来所有面的接入地基。
- **Mac 壳**：按本文重新收窄为 Web 容器(菜单栏/托盘/离线/账号/更新/通知),**砍掉 overlay-organizer 身份**。
- **桌面插件**：平台 SDK + 多窗口运行时**定契约**;organizer 维持 Stable;其余 Paused until G1。
- **Web 响应式 + 可安装 PWA**：移动端的种子,几乎零新成本(同时覆盖 iPhone/iPad/Android 的捕获场景)。
- **文档治理**：边界 framing 对齐 + 本路线图文档 + 看板/结构图"未来面"层。
- （可选）**浏览器扩展**捕获面。

### Year 2 — 移动捕获面 + 桌面插件兑现

- **iPhone**：PWA → 原生薄壳(捕获/今日/打卡/计时 + push)。第一个真移动面。
- **桌面插件线 resume**（G1 后）：widgets、clipboard、便签、快速入口、快速记账/时间追踪小窗。
- **浏览器扩展**成熟。
- **iPad**：响应式 PWA 验证;决定要不要 Catalyst。
- **Android**：PWA 可用;原生按需。

### Year 3 — 环境面 + 生态补全

- **Apple Watch** 伴侣(骑 Y2 的 iOS app)。
- **iPad 专用 / Catalyst**（pencil/分屏需求验证后）。
- **Android 原生**（付费群体验证后）。
- **生态**：Admin / site 成熟、插件市场/SDK 开放(若插件产品已验证)、Siri/Shortcuts/系统日历集成。

---

## 6. 全部面 · 长期优先级排序

**Web（已成）→ Mac 壳（重新收窄）→ Web PWA/响应式 → 桌面插件平台 → 浏览器扩展 → iPhone 原生薄壳 → Apple Watch → iPad 专用/Catalyst → Android 原生**

---

## 7. 当前开发 vs 仅规划（planning-only gate）

| 现在就开发（active） | 仅进路线图（planning-only，不开工） |
|---|---|
| Web(P0)、Mac 壳(重新收窄)、桌面插件平台地基+SDK 契约+organizer、共享核心(数据/账号/同步)、开发看板、**Web 响应式 PWA** | **iPhone 原生**、**iPad 专用**、**Apple Watch**、**Android 原生** |
| 机会主义可选(低成本)：浏览器扩展 | 只写进 PRD/结构图/看板的"未来面"层,**不开分支、不进 feature-build**,直到 operator 显式解冻 |

---

## 8. 文档关系与维护

| 关注点 | 权威文档 |
|---|---|
| 当前三面**功能边界** | `docs/MODULE_BOUNDARIES.md` |
| **未来平台**长期规划（本文） | `docs/planning/LONG_TERM_PRODUCT_ROADMAP.md` |
| 六模块任务路由 | `docs/PRODUCT_MODULE_MAP.md` |
| active-focus 顺序 | `docs/adr/0010-p1-desktop-resume-plan.md` |
| 分支 / D3 / D4 | `docs/adr/0013-branch-sync-governance.md` |
| 机器可读镜像（`future_surfaces`） | `docs/workflow/project/module-classification.json` |
| 看板 / 产品结构图 | `docs/workflow/project/dashboard-state.json`（`future_surfaces`）→ dev-dashboard |

**维护规则：**

- 本文是 planning-only。未来面进入 active 开发,需 operator 显式确认,并同步更新 `MODULE_BOUNDARIES.md`(把该面从"未来面"升为"当前面")+ `module-classification.json` + 看板。
- 新平台讨论先更新本文,再决定是否升格为 ADR-0016。
- 任何"未来面"的描述若与 `MODULE_BOUNDARIES.md` 当前边界冲突,以本文的"角色分类 + 接入契约"为长期意图,以 `MODULE_BOUNDARIES.md` 为当前事实。
