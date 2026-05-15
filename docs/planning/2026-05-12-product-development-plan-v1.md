# XAI_Desktop · 产品功能开发方案

> 创建时间：2026-05-12 · 最后对齐：2026-05-12(对齐 PRD v1.6-draft)
> 文档性质：**开发方案 / 战略概览** — PRD 的"轻量伴随文档"。FR 级细节、数据模型、详细路线图以 PRD 为准。
> 配套文档：`docs/planning/2026-05-12-PRD-v1.md`(完整规格,source of truth)
> 项目代号：XAI_Desktop / AI Smart Desktop
> 平台优先级：macOS (v1) → 网页版 (v1) → Windows → Linux → 移动端

---

## 0. 文档定位

本文档是 PRD 的**战略概览版**:用一张图说清楚"代码现状 + 对标产品 + 技术架构 + 路线图 + 风险",方便快速对齐方向。**逐条功能需求(FR)、SQLite Schema、详细里程碑日期** 全部以 PRD 为准,本文档不重复。

PRD 当前定位为**完整产品愿景全集**(16 个模块);实际 v1 范围由 PRD §15 顶部的"v1 范围拍板"从全集中切分 —— **该拍板尚未完成,是当前最高优先待办**。

---

## 1. 代码现状盘点

### 1.1 真实代码状态(2026-05-12 实测确认)

> 初版曾把多个模块标为"✅ 可用",这是**错误的** —— 混淆了"代码结构存在"和"功能真的跑通"。经实机确认 + 代码深挖,真实状态如下。

| 模块 | 真实状态(实测) | 证据 |
|---|---|---|
| 透明 overlay 主窗口 | ⚠️ 结构在,渲染层 OK | — |
| 桌面点击穿透 | 🔴 **完全失效** —— 根本点不动桌面图标 | `useGlobalMouse.ts:101-105` 有 `// TEMPORARY` 硬编码关闭 |
| Smart Container 渲染 | ✅ 渲染层可用,但 `SmartContainer.tsx:313` 还挂着红色调试边框 | Grid 窗口能出现且显示内容 |
| 文件拖入 | 🔴 **完全没反应** | HTML5 拖放在透明窗口不可靠 + 拿不到真实路径 |
| 多窗口架构 | 🔴 **多个 Grid 窗口互相干扰** | 跨窗口事件未按 gridId scope |
| 跨窗口事件通信 | ⚠️ 协议定义了,缺错误恢复 / scope | — |
| 布局持久化 | ⚠️ 主窗口 OK,Grid 窗口自身位置/大小不持久 | localStorage |
| AI Cube / Control 窗 | 🔴 **不稳定** | 实测确认 |
| 多 Space / 全屏行为 | 🔴 **行为奇怪** | 实测确认 |
| Subagent Workflow V2 | ✅ **真的可用** | `.agents/templates/` |

**一句话总结**:**渲染层(React/组件)是好的,所有触及 macOS 原生窗口行为的部分都是坏的。**

### 1.2 已有但还不真用

文件元数据(只解析 name/type/extension,未走 Tauri fs)、AI Cube 菜单项(占位)、Plugin 注册(硬编码 import,非动态发现)。

### 1.3 核心技术阻塞

`docs/development/TECHNICAL_STATUS.md` 写得清楚:**透明 overlay 想同时"接收拖放"又"点击穿透到桌面图标"是矛盾的**。曾选多窗口架构方向,但**这个 pivot 只完成了结构、没完成功能** —— 半成品叠在一个未解决的根本问题上。

→ 这就是为什么 **Phase 0 不是"加固"而是"地基重建"**,且必须先做技术 spike 验证窗口分层悖论有没有干净解(go/no-go gate)。详见 §5。

### 1.4 完全未开始

除桌面整理的渲染层外,其余 15 个模块全部未开始。

---

## 2. 对标产品拆解

| 对标 | 我们抄什么 | 不抄什么 | 对应模块 |
|---|---|---|---|
| **腾讯桌面整理(Win)** | 功能模型:格子、自动分类、文件夹映射、一键整理 | Windows 化 UI、桌面壁纸 | 智能桌面整理 |
| **滴答清单** | "桌面级随手可达" + 中度 Todo + 番茄 + 习惯 + 四象限 + 日历 + sidebar 控制台布局 | 看板/甘特(看板单独成项目管理模块)、团队协作 | Todo / 番茄 / 习惯 / 桌面日历 / 整体控制台 / 网页版 |
| **Deck / Maccy / Paste** | 全类型剪贴板历史、搜索、OCR、模板、粘贴队列、屏幕共享自动隐藏、敏感过滤 | 团队共享片段 | 剪贴板 |
| **Trello** | 看板 board/list/card、拖拽流转、颜色标签、多看板并行、checklist、多视图 | 多人协作、Power-Ups/Butler、文件附件上传 | 项目管理 |
| **OpenAI Codex Pet Mode** | 浮动桌宠作为"状态指示器"、像素动画、孵化自定义宠物 | 宠物养成系统/商店/多宠物同屏 | AI 桌面宠物 |

**核心差异**:滴答/Trello 的载体是"App 里的卡片",我们的载体是"桌面上的格子 + overlay";所有功能本质是统一 ContentType 框架下的一种内容。

---

## 3. 产品功能全景(对齐 PRD v1.6 — 16 模块)

### 3.1 产品的"三个面"

- **桌面 overlay 模式** — Main Window + Control Window(AI Cube)+ Grid Windows + Widgets + 桌宠,轻量随手
- **控制台模式** — 独立三栏窗口(sidebar + list + detail),深度管理
- **网页版** — 控制台的浏览器版,多端生态

三者共享同一套数据(SQLite/后端 + 云同步)。

### 3.2 16 个模块(优先级 / 归属 Phase)

| # | 模块 | 优先级 | Phase |
|---|---|---|---|
| 1 | 智能桌面整理(Smart Container) | P0 | 1 |
| 2 | 待办 Todo(中度复刻 + 四象限) | P0 | 2 |
| 3 | 番茄钟 Pomodoro | P0 | 2 |
| 4 | 习惯打卡(含日历/统计视图) | P1 | 3 |
| 5 | 剪贴板 Clipboard | P0 | 2 |
| 6 | 桌面 Widgets(时钟/天气/便签/时间进度条) | P0+P1 | 3 |
| 7 | 冥想 / 专注模式 | P1 | 3 |
| 8 | 全局 Label 系统 | P0 | 2 |
| 9 | 桌面日历(聚合 Todo+习惯+番茄) | P0 | 3 |
| 10 | 整体控制台 | P0 | 2.5 |
| 11 | 项目管理(Trello 式看板) | P0 | 2.5 |
| 12 | 网页版 | P0 | 4.5 |
| 13 | AI 桌面宠物 | P1 基础 / P2 AI | 3 + 4 |
| 14 | AI Cube | P2 | 4 |
| 15 | 账号系统 + 云同步 | P0 | 0 起 + 5 |
| 16 | 插件机制 + 静态目录 | P0 | 0 / 全程 |

> 模块逐条功能需求见 PRD §5.1~5.16。

### 3.3 横向能力(所有模块共享)

数据层(SQLite,取代 localStorage)、全局搜索(`Cmd+K`)、全局 Label 系统、云同步(完整账号,E2E 加密;剪贴板/番茄不上传)、隐私(本地加密、屏幕共享隐藏)、全局快捷键、主题(跟随系统 + Accent Color)。

---

## 4. 技术架构方案

### 4.1 包结构(对齐 PRD §7)

```
apps/desktop/                  ← Tauri 宿主,零业务逻辑
└─ src-tauri/                  ← Rust:窗口、tray、shortcut、SQLite、剪贴板监听、macOS native
└─ src/                        ← React:路由、plugin 挂载、Console/Web 入口

packages/
├─ plugin-organizer/           ← 已有,需重建原生交互层
├─ plugin-productivity/        ← todo + 番茄 + 习惯
├─ plugin-clipboard/           ← 剪贴板
├─ plugin-widgets/             ← 时钟 + 天气 + 便签 + 冥想 + 时间进度条 + 桌宠
├─ plugin-calendar/            ← 桌面日历(聚合视图)
├─ plugin-console/             ← 整体控制台三栏外壳(需平台无关,Web 复用)
├─ plugin-project/             ← 项目管理(Trello 式看板)
├─ plugin-labels/              ← 全局 Label 系统
├─ plugin-ai/                  ← AI Cube + 桌宠 AI 能力(Phase 4)
├─ plugin-account/             ← 账号 + 云同步
├─ core-data/                  ← SQLite repo + 后端 API 双 driver(Web 用)
├─ core-events/                ← 跨窗口事件常量与类型
├─ core-shortcuts/             ← 全局快捷键注册中心
├─ core-fs/                    ← 文件访问 abstraction(双 target:full / sandbox)
└─ ui/                         ← 共用组件
```

**plugin 契约**:导出 `manifest.ts`(id/权限/快捷键/ContentType)+ `register(host)`;通过 `core-events` 通信,不直接 import 其他 plugin。这就是"傻瓜式新增 feature"的形式。

### 4.2 数据层

localStorage → SQLite(`tauri-plugin-sql`),Phase 0 迁移。完整 Schema(grids/todos/labels/boards/progress_trackers/pets 等约 25 张表)见 PRD §8。网页版数据层走后端 API driver,共享同一 schema。

### 4.3 窗口架构

Main(透明 overlay)+ Control(AI Cube 快捷托盘)+ Grid Windows(每格子独立)+ **Console Window(独立三栏)** + Clipboard Window + Settings。网页版 = Console 的浏览器构建。

### 4.4 双轨发布 + 跨平台

- **v1 双轨**:官网 DMG(完整版)+ Mac App Store(沙箱版,功能子集)。要求 Phase 0 就做到 `macOSPrivateApi: false`、`core-fs` abstraction、Cargo features 分 `full`/`sandbox`。详见 PRD §9。
- **网页版**:v1 范围内(Phase 4.5),控制台的浏览器版。
- **Windows / Linux / 移动端**:Phase 5+;Rust 侧把窗口/剪贴板/fs/通知抽象成 trait 预留接口。

---

## 5. 路线图(对齐 PRD §10)

> ⚠️ **Phase 0 是"地基重建"不是"启动收尾"** —— 现有代码的原生交互层全是坏的(见 §1.1)。Phase 0 内含 go/no-go gate。

| Phase | 周期 | 核心交付 | 累计 |
|---|---|---|---|
| **Phase 0** 地基重建 | 7-9 周 | 见 §5.1 三段拆解 | 9 周 |
| **Phase 1** 桌面整理 | 2-3 周 | 自动分类、一键整理、文件夹映射、应用/链接格子 | 12 周 |
| **Phase 2** 效率 + 剪贴板 | 6-7.5 周 | 中度 Todo + 四象限 + 番茄 + 剪贴板全套 P0 + 全局 Label + 全局搜索 | 19 周 |
| **Phase 2.5** 控制台 + 项目管理 | 4-6 周 | 整体控制台三栏外壳 + Trello 式项目管理 | 25 周 |
| **Phase 3** Widgets + 桌面日历 + 习惯增强 + 桌宠 | 6-7 周 | 时钟/天气/便签/时间进度条、桌面日历、习惯日历视图、基础桌宠、冥想、主题 | 32 周 |
| **Phase 4** AI 注入 | 3-4.5 周 | AI Cube 对话 + 自然语言建任务 + 剪贴板智能分类 + 桌宠 AI 能力 | 36 周 |
| **Phase 4.5** 网页版 | 4-6 周 | 控制台浏览器版 + 后端承载完整 Web 应用 + 部署 | 42 周 |
| **Phase 5** 账号 + 同步完善 + 公测 | 3-4 周 | 双因素、E2E 加密同步、闭测 | 46 周 |
| **Phase 6** 上架准备 | 2-3 周 | 公证、网站、隐私协议、MAS 提交 | 48-49 周 |

**全集工期:约 11.5-12 个月全职独开,GA 目标约 2027 年 5 月。**

> 这是 PRD 全集(16 模块)的工期。实际 v1 工期取决于"v1 范围拍板"切掉多少 —— 见 §7。

### 5.1 Phase 0 三段拆解

- **0.1 技术 Spike(1.5-2 周,go/no-go gate)** — 真机验证点击穿透 / 文件拖入 / 多 Space / 多窗口干扰是否有干净解;**不写产品功能**,只做最小验证原型;产出 `docs/adr/0001-window-architecture.md`。
- **0.2 原生层重建(3-4 周)** — 按 spike 结论重写 `lib.rs` 窗口管理、`useGlobalMouse`(移除 TEMPORARY 硬编码)、`useFileDrop`(改 Tauri 原生拖放)、跨窗口事件 scope、Control 窗稳定性、清调试残留、Grid 窗口持久化。
- **0.3 原 Phase 0 范围(2.5-3 周)** — SQLite 迁移、抽 4 个 core 包、菜单栏 + 全局快捷键、自启动 + 自动更新、双 target 打包 + entitlements + `macOSPrivateApi:false`、Supabase 后端骨架。

### 5.2 必须正视的风险

**如果 0.1 spike 结论是"透明桌面 overlay 在 Tauri 上没有干净解"** —— 整个产品形态都要重新考虑(纯多窗口 / Widget Extension / 模式切换折中)。这是 R-00,见 §6。**不要在坏地基上盖 1 年的楼。**

---

## 6. 风险登记(摘录,完整见 PRD §12)

| ID | 风险 | 等级 | 缓解 |
|---|---|---|---|
| **R-00** | 透明桌面 overlay 在 Tauri 上可能没有干净解(点击穿透/文件拖入/多窗口已实测全坏) | 🔴🔴 最高 | Phase 0 子阶段 0.1 spike 设为 go/no-go gate;不通过则产品形态降级 |
| R-02 | 沙箱外应用首次启动需"右键打开"的安装阻力 | 🟡 中 | 通过公证 + 安装引导 |
| R-03 | 剪贴板敏感信息误识别 | 🟡 中 | App 黑名单 + 模式匹配 + 用户可手动剔除 |
| R-04 | 后端选型踩坑(Supabase 限额 / 自建运维) | 🟡 中 | Phase 0 做 PoC + 成本估算;数据层 abstract 可替换 |
| R-05 | 11-12 个月独开节奏 burnout | 🟡 中 | 充分用 auto-loop;每 Phase 留 buffer;地基重建后给自己里程碑奖励 |
| R-10 | E2E 加密同步实现错误导致数据丢失 | 🔴 高 | 加密层独立单测 + 模糊测试;本地备份保留 30 天 |
| R-11 | 现有代码"结构齐全"误导规划(已发生一次) | 🟡 中 | 已修正;后续每 Phase 验收以"真机实测通过"为准,不以"代码写完"为准 |

---

## 7. v1 范围拍板(最高优先待办)

PRD 现在是 16 模块的**完整愿景全集**,全做要 ~11.5-12 个月。**进入开发前必须把 16 个模块切成 v1 / v1.5 / v2 三档。**

降级候选(不阻塞核心、可独立后置):
- **网页版** —— 建议 → v1.5(与"v1 仅 macOS"决策有张力,且依赖账号+同步完全稳定)
- **整体控制台 / 项目管理 / 桌面日历聚合版** —— 可评估是否后置
- **AI 桌面宠物 / 冥想模式 / 习惯打卡** —— 已是 P1,天然可后置

这个拍板未做之前,PRD 不算"可进开发"。

---

## 8. 决策确认(2026-05-12 已拍板)

用户通过 AskUserQuestion 逐项确认:

| 决策 | 最终选择 |
|---|---|
| A 账号系统 | **完整账号 + 云同步** |
| B AI 接入 | **Phase 4 才接入** |
| C 剪贴板优先级 | **P0,Phase 2** |
| D Todo 复刻深度 | **中度复刻**(子任务+标签+优先级+日历视图+四象限,不做看板/甘特/协作;看板单独成项目管理模块) |
| E 跨平台时间表 | **v1 仅 macOS**(+ 网页版);Win 放 Phase 5+ |
| F 插件市场 | **v1 做机制 + GitHub 静态目录**,v2 才上真市场后端 |
| 发布渠道 | **DMG + Mac App Store 双轨并发** |
| 人力 | 全职独开 40+ 小时/周 |

**关键 pushback / 自我修正记录**:
- 原"v1 直接做完整市场"在独开人力下不现实 → 协商降级为"机制+静态目录"。
- 原"深度复刻滴答"组合后导致工期失控 → 协商落到中度复刻。
- 我曾误判"Mac App Store 与桌面 overlay/剪贴板冲突必须放弃 MAS" —— **错误**,Maccy/Desktop Organizer/iBar 等竞品均在 MAS 在售,真正障碍只是 Tauri `macOSPrivateApi:true` 私有路径。用户据此改为双轨并发。
- 我曾把未跑通的代码标为"✅ 可用",导致初版工期低估 → 已修正,Phase 0 改为地基重建。

**PRD 迭代记录**:v1.2 双轨发布 + Phase 0 地基重建 → v1.3 加全局 Label / 桌面日历 / 整体控制台 + Todo 四象限 + 习惯日历视图 → v1.4 加项目管理 + 网页版 → v1.5 加时间进度条 → v1.6 加 AI 桌面宠物。

---

## 9. 下一步

1. **做 v1 范围拍板**(§7)—— 把 16 模块切成 v1 / v1.5 / v2。**这是进开发前的最高优先动作。**
2. 拍板后,启动 **Phase 0 子阶段 0.1 技术 Spike** 的 `feature-plan`(go/no-go gate,验证窗口分层悖论)。
3. 按 Workflow V2 逐 feature 推进:`feature-plan → feature-review → 确认 → feature-dev-loop → feature-verify → ship`。

详细 PRD 见 `docs/planning/2026-05-12-PRD-v1.md`(v1.6-draft,source of truth)。

— END —
