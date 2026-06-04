# MODULE_BOUNDARIES.md — Web / App / 桌面插件 三面边界（权威）

> **定位**：本文件是 XAI 三个产品面（Web 版本 / Mac 桌面 App / 桌面插件）**功能边界与归属**的单一权威来源（single source of truth）。
> 当某个功能"该放哪一面、该归哪个模块"产生分歧时，以本文为准。
>
> **权威基线**：ADR-0010（amended 2026-05-30，active-focus 顺序）、ADR-0013（分支拓扑 + Web→Desktop D3 闸门 + 账号云同步 D4）、ADR-0015（桌面插件范围 + organizer P 级 reconcile，Proposed）。
> **配套文档**：`docs/PRODUCT_MODULE_MAP.md`（六模块任务路由）、`docs/PLUGIN_MAP.md`（插件状态机）、`docs/PLUGIN_SDK.md`（插件 SDK 契约蓝图）、`docs/planning/sub-prds/plugin/PRD.md`（桌面插件开发范围）、`docs/workflow/project/module-classification.json`（机器可读分类注册表）。
>
> 最后更新：2026-06-02

---

## 0. 为什么需要这份文档

历史上项目是**桌面优先**（PRD-v1 §1.3「桌面优先」），后于 2026-05-24 经 ADR-0009 转向 **Web 优先**。在这个转向过程中，"**桌面插件**"这个词被三件不同的东西共用，文档没有把它们切开，导致功能边界混乱：

1. 有人说"桌面插件"指**多窗口/原生底座**（造窗口、点击穿透、grid 窗口）——其实那是 **App 层**的活。
2. 有人说"桌面插件"指 **organizer/clipboard/widgets/pet** 这些**挂件模块**——这才是真正的桌面插件。
3. Web 版里还有 `xai-web-pet` / `dashboard-widgets` / `dashboard-grid`，**同名但是网页内 DOM 组件**，与桌面插件无关。

本文件用 §1 的三层反混淆 + §3 的能力边界矩阵，一次性把它们分清。

---

## 1. 三层反混淆：「桌面插件」到底指什么

| 层 | 实质 | 归属模块 | 谁拥有 | 现状 |
|---|---|---|---|---|
| **A1. Mac 壳（Web 容器）** | 承载 Web SPA 的主窗口 + 原生 chrome：菜单栏、托盘、离线缓存、账号/Keychain、自动更新、系统通知、深链、开机启动、`桌面插件` 入口按钮 | **P1 Mac 桌面壳**（`app`） | App 层（`apps/desktop/` + `src-tauri/` 外壳） | 壳身份 = "把 Web 装进原生窗 + 原生便利"，**不是桌面整理器** |
| **A2. 插件平台运行时（多窗口引擎）** | 新建原生小窗口、点击穿透、贴边吸附、grid 原生窗口、Spaces/多显示器矩阵、读真实文件、Tauri 窗口/文件命令 | **P2 桌面插件平台**（`plugin`，物理代码在 host） | 物理在 `apps/desktop/src-tauri/commands/*`（host 进程，app 通道执行）；**产品归属 = 插件平台** | 命令基本做完；产品归属是插件平台而非壳身份 |
| **B. 桌面整理插件 / 挂件**（= 真·桌面插件） | organizer / clipboard / widgets / pet / meditation：跑在 App 插件槽位的轻量 overlay/grid 挂件；声明可添加内容、实例 schema 和 Plugin Center 目录项 | **P2 桌面插件**（`plugin`） | `packages/plugin-{organizer,clipboard,widgets,pet}` | organizer 已 Stable；其余 Planned/stub，**整条线 Paused until G1**；入口模型已决，功能实现未开工 |
| **C. Web 同名组件** | `xai-web-pet`、`dashboard-widgets`、`dashboard-grid` 等 | **P0 Web**（`web`） | `packages/{xai-web-*,plugin-web-*}` | 已 SHIPPED，是网页内组件，**与桌面插件零代码共享** |

> **一句话**：Mac 壳（A1）只把 Web 装进原生窗 + 原生便利；多窗口运行时（A2）物理在 host、**产品归插件平台**；真正的桌面插件（B）骑在 A2 上，多数还没做且被 Paused；Web 的同名组件（C）只是借用了相同词汇。

> ⚠️ **物理位置 ≠ 产品归属（关键澄清）**：多窗口 / 原生窗口的 Tauri 命令**物理上必须实现在 host 进程**（`apps/desktop/src-tauri`，只有 host 能调 Tauri）。但"多窗口 / overlay 运行时"的**产品归属是【桌面插件平台】，不是 Mac 壳的身份**。Mac 壳的身份就是 Web 容器 + 原生 chrome；所有桌面原生超能力（多窗口、挂件、整理、快速入口）的产品归属都是桌面插件。长期面（iPhone/iPad/Watch/Android/扩展）的规划见 [`docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`](planning/LONG_TERM_PRODUCT_ROADMAP.md)。

---

## 2. 六大产品模块速查（详见 PRODUCT_MODULE_MAP.md）

| # | 模块 | key | Surface | 主分支 | 状态 |
|---|---|---|---|---|---|
| 1 | Web 版本 | `web` | `apps/web/` + `xai-web-*` + `plugin-web-*` | `web` | **P0 active mainline** |
| 2 | Mac 桌面 App | `app` | `apps/desktop/` + `src-tauri/` | `desktop-next`→`dev` | **P1 active App lane** |
| 3 | **桌面整理插件 / Widget** | `plugin` | `apps/desktop/` 插件槽 + `packages/plugin-{organizer,clipboard,widgets,pet}` | `desktop-plugin-next` | **P2 paused（等 G1）** |
| 4 | 账号云同步层 | `sync` | sync-v1 stack + server | (paused) | P2 paused |
| 5 | 官方网页 | `site` | Cloudflare 部署设施 | (proposed) | PROPOSED |
| 6 | Admin Dashboard | `admin` | `docs/prototypes/admin-dashboard/` | (proposed) | PROPOSED |

---

## 3. 能力边界矩阵：Web vs Mac App vs 桌面插件

| 维度 | **Web 版本（P0）** | **Mac 桌面 App（P1）** | **桌面插件（P2）** |
|---|---|---|---|
| 运行形态 | 浏览器内 Vite SPA | Tauri 原生壳承载 Web SPA（Web 容器，单主窗口 + 原生 chrome） | 跑在插件平台运行时上的轻量 overlay / grid 窗（多窗口引擎物理在 host） |
| 本质 | 完整产品页面 | Web 的原生容器（壳）+ 原生 chrome；**不是桌面整理器** | **不是完整页面，也不是完整 App，是挂件/小窗能力** |
| 新建原生窗口 | ❌ 不可能 | ✅ **提供** window Tauri 命令（底座） | ✅ **消费**命令，把模块塞进窗（不实现） |
| 真实文件 / 文件夹整理 | ❌ 浏览器无 fs | ✅ 提供 `finder.rs` / `thumbnail` 命令 | ✅ organizer 整理真实文件 |
| 挂件（时钟/天气/便签/进度条/桌宠） | ✅ 网页内 DOM（同名 ≠ 同物） | — | ✅ 贴桌面的原生 overlay 挂件 |
| 剪贴板历史 / OCR | ❌ 浏览器受限 | 提供 `clipboard_*` / `vision_ocr` 命令 | ✅ clipboard 面板 |
| 插件入口 / 管理中心 | ❌ 不拥有桌面运行态 | ✅ `桌面插件` 入口、Plugin Center 容器、实例窗口和全局设置 | ✅ 插件目录、`PluginInstance` 设置 schema、可添加内容 |
| 任务/看板/日历/番茄/习惯/统计/四象限/倒数日 | ✅ 完整 24 模块 | 共享 `plugin-productivity`/`project`/`labels` 业务逻辑 | ❌ **不重做**（插件不是完整模块） |
| 数据 | IndexedDB ⇄ 账号云 | SQLite ⇄ 账号云 | **默认 `device-local` 永不上云**；仅显式 `account-sync` 才同步 |
| 跨面对齐方式 | 源头 | 经 **D3 gate（W0~W4）** 从 Web 按需同步 + 共享业务包 | 依赖 App 平台；插件间走 `@repo/core/events` |

---

## 4. 硬边界规则（MUST，不可违反）

1. **造窗口的代码在 host，多窗口运行时的产品归属在插件平台。** 新建原生窗口、点击穿透、贴边吸附、Spaces/多显示器矩阵 = `apps/desktop/src-tauri/commands/window.rs` 等 Tauri 命令**物理实现在 host 进程**（app 通道执行）。但这是**代码实现**归属；**多窗口 / overlay 运行时的产品归属是【桌面插件平台】**（见 §1 A2），**不是 Mac 壳的身份**——Mac 壳只是 Web 容器。桌面插件包**只消费这些命令**，不在 `packages/plugin-*/src` 里实现原生窗口命令。
2. **完整功能模块不在插件里重做网页形态。** 任务/看板/日历/番茄/习惯/统计等已被 Web 完整覆盖；App 通过共享业务逻辑包（`plugin-productivity`/`project`/`labels`）复用，Web→App 经 **D3 闸门**（`xai-web-to-desktop-sync`，W0–W4 + parity receipt）。插件**不**另起炉灶做这些完整模块。
3. **插件数据默认 `device-local`，永不上云。** 每个插件实体先在 `packages/core-data/src/entities.ts` 定 `syncScope`。`device-local`（如 `clipboard.item`、本地挂件配置）永不入远端 outbox；只有显式标 `account-sync` 的实体（如 grids/grid_items/pets）才跨设备（ADR-0013 §D4）。**"与 Web/桌面数据保持一致"不等于"全部同步"。**
4. **同名陷阱：Web 的 pet/widgets/grid ≠ 桌面插件的 pet/widgets/grid。**
   - Web `xai-web-pet`：`position:fixed` 浮在 SPA 视口内，**出不了浏览器**，零 Tauri 依赖。
   - 桌面 `plugin-pet`：`windows.overlay` 原生窗，浮于**整个 macOS 桌面**。
   - Web `dashboard-grid`：网页内 12 列 CSS 排版网格（挂件墙）。
   - 桌面 `organizer` grid：整理**真实文件/App** 的原生 Smart Container 窗。
   - 两套**零代码共享**（grep 0 命中），只是词汇相同。
5. **插件入口归 App，插件内容归 plugin。** Mac App 控制面板里的 `桌面插件` 按钮、Plugin Center 窗口容器、实例窗口位置、pin、点击穿透、权限提示和全局偏好归 `app`；插件列表、可添加内容、`PluginInstance` settings schema、AddToDesktop contract 和具体渲染归 `plugin`。一个需求同时触及二者时，先拆分 App entry/window delta 与 plugin contract/package delta，不把入口实现塞进 Web 工作台。

---

## 5. 桌面插件清单与归属

| 插件 | 角色 | 状态（PLUGIN_MAP） | 形态 | 备注 |
|---|---|---|---|---|
| **organizer** | 旗舰 / 参考插件（Smart Container） | **Stable（已 shipped）** | overlay + control + grid 原生窗 | **已交付旗舰(graduated)**,不属 P2-paused 冻结范围;P 级见 ADR-0015(web 侧 Accepted;dev 线 ADR-0011 reconcile 待确认) |
| **clipboard** | 本地剪贴板历史 / OCR / 隐私 | Planned（stub，能力 mock） | `dedicated` 窗 | 需 App 先加 `clipboard_*`/`vision_ocr` 命令 |
| **widgets** | 桌面挂件 host（时钟/天气/便签/时间进度条） | Planned（stub，数据 mock） | overlay 挂件 | 时间进度条原始为 P0「三端通用」 |
| **pet** | 桌面悬浮宠物 | Planned（stub 偏空壳） | overlay 窗 | **独立包 plugin-pet**(ADR-0015 Accepted;非 widgets 子模块) |
| **meditation** | 冥想 / 专注 | Planned（**未建包**） | 全屏覆盖 | Web 形态已 ship 为 `xai-web-meditation` |

> 全部 P2 桌面插件按 ADR-0010 §D2 **Paused until G1 SHIPPED**。开工前用 `xai-feature-brief` 规范化入队，不开 feature-build。MVP 顺序见 `docs/planning/sub-prds/plugin/PRD.md`。

---

## 6. 新功能归属决策流程（routing）

新需求到达时，按以下顺序判定归哪一面 / 哪个模块：

1. **命中"任务归属信号"**（PRODUCT_MODULE_MAP §模块速查）→ 落主模块。
2. **浏览器能否实现？**
   - 能、且是完整功能页面 → **Web（P0）**。
   - 不能（需原生窗口/fs/剪贴板/屏幕）→ 进 3。
3. **是"造底座能力"还是"用底座做挂件"？**
   - 造原生窗口/命令/平台能力 → **App（P1）**。
   - 用现有底座做轻量挂件/整理 → **桌面插件（P2，当前 Paused）**。
4. **是插件入口还是插件内容？**
   - Mac App 控制面板入口 / Plugin Center 容器 / 原生实例窗口 → **App**。
   - 插件目录、AddToDesktop contract、实例设置 schema、具体 plugin 包 → **Plugin**。
5. **要不要跨设备？** 仅当实体显式需要 → 在 `entities.ts` 标 `account-sync`，交 **sync 线**（D4 九项清单）；否则 `device-local`。
6. **改动源自 Web、要流向 App？** 走 **D3 闸门**（W0–W4）。

> 该流程的机器可读版本见 `docs/workflow/project/module-classification.json`；自动判定/漂移扫描见 `xai-module-classify` skill。

---

## 7. 相关文档

- 任务路由：`docs/PRODUCT_MODULE_MAP.md`
- 长期平台路线（planning-only，未来 iPhone/iPad/Apple Watch/Android/浏览器扩展）：`docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`
- 插件状态机：`docs/PLUGIN_MAP.md`
- 插件 SDK 契约蓝图：`docs/PLUGIN_SDK.md`
- 桌面插件开发范围 + MVP：`docs/planning/sub-prds/plugin/PRD.md`
- 机器可读分类注册表：`docs/workflow/project/module-classification.json`
- 决策记录（organizer P 级 + pet 归属）：`docs/adr/0015-desktop-plugin-scope-and-organizer-level.md`
- 分支拓扑 + D3/D4：`docs/adr/0013-branch-sync-governance.md`
- active-focus 顺序：`docs/adr/0010-p1-desktop-resume-plan.md`
