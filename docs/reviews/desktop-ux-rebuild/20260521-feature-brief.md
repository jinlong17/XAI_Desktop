# Feature Brief — desktop-ux-rebuild

| 字段 | 值 |
|---|---|
| Brief 日期 | 2026-05-21 |
| Topic Slug | desktop-ux-rebuild(program 级,非单一 plugin slug) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_FEATURE_PLAN` |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| 输入 | `docs/reviews/desktop-ux-rebuild-audit-2026-05-21.md` |
| 单 session | 是 |

> 本 brief 是 **program 级 Step 0**。用户在 Round 1 已决定拆为 **3 个 feature**;本文件定义 program 范围、3-feature 分解与依赖序,并为每个子 feature 给出独立 Planner Handoff。canonical slug / phase 分解由各 `feature-plan` 最终确定。

---

## Structured Brief

### Problem / Motivation

桌面端两大交互面长期处于"未完工"状态:

1. **AI Cube 简陋**——Host 跑的是占位实现 `apps/desktop/src/components/AiAssistant/AiCube.tsx`(仅文字 "AI"),正式业务 UI `packages/plugin-ai-cube/`(`AiCubePanel`/`MessageBubble`/`InputBar` 等)**从未接入桌面**。设置面板 `SettingsPanel.tsx` 几乎全内联样式、单卡混装 5 类功能、底部还渲染 mock 调试块。
2. **Grid 简陋且混乱**——核心卡片 `SmartContainer` 根节点写死 `border border-red-500 opacity-50`(`SmartContainer.tsx:285` + `App.css:166-176`),生产环境每个 Grid 渲染为红色描边 + 50% 半透明;Grid 窗口还残留 spike 阶段的 "G0 Grid Prototype" 回退面板、Finder telemetry 面板、"Multi-Window Mode" 调试横幅、grid 计数徽标。
3. **按键混乱**——Grid 头部 4 个同款按钮无主次语义,"···"菜单只有 1 项 Close,关闭 Grid 无直接入口,PRD §5.1.2 完整右键菜单未实现。
4. **拖拽不流畅**——react-draggable 与 @dnd-kit 双 DnD 库并存,拖动每帧跨窗口 emit,折叠态靠 hover 抖动,无统一动效曲线。
5. **无设计系统**——颜色裸 hex/rgba 散落,图标混用 emoji 与 CSS 点阵,各组件各写圆角/阴影/间距。

详见审计报告 6 大维度评分(视觉 2/5、信息架构 2/5、交互 3/5、多窗口 3/5、PRD §5.1 2.5/5、§5.8 1/5)。

### Target User / Actor

XAI_Desktop 桌面端最终用户(macOS overlay 模式日常使用者)。无 admin / API consumer 角色。

### Desired Outcome

桌面端 AI Cube 与 Grid 达到"可对外展示的美观度":统一设计系统、清晰的信息架构与按键层级、流畅的拖拽与动效、零调试残留;`plugin-ai-cube` 正式 UI 接入桌面;PRD §5.1 缩略图与边缘吸附补齐。

### Scope

按用户 Round 1 决策,program 拆为 **3 个 feature**,依赖序如下:

```
F1 desktop-design-system  (wave 0,根依赖)
        │
        ├──────────────┐
        ▼              ▼
F2 plugin-ai-cube   F3 plugin-organizer   (F1 完成后可并行)
```

**F1 — desktop-design-system(设计系统底座)**
- 建立 design token:颜色 / 间距 / 圆角 / 阴影 / 动效曲线(时长+缓动) / 字体梯度。
- token 落点(`@repo/ui` vs plugin 内自管)为 ADR-lite,见下。
- 供 F2 / F3 复用,消除裸 hex 与各自为政的样式常量。
- 统一图标体系基线(替换 emoji 🔒🔓⌄⌃🪟🧹📂 与 CSS 点阵)。

**F2 — plugin-ai-cube(AI Cube 重构 + 接入)**
- 把 `plugin-ai-cube` 正式 UI 接入 control 窗口;Host 的 `AiCube.tsx` / `SettingsPanel.tsx` 业务 UI 迁入插件,Host 仅留窗口壳 + provider(红线 #1 / #8)。
- 接入深度:**托盘 + 对话面板视觉**——PRD §5.8 Phase 0–3 快捷入口托盘(新建格子 / 剪贴板 / 番茄 / 设置 / 全局搜索)+ 已有对话面板 UI 以视觉形态接入(mock 会话数据,不接真实 LLM)。
- SettingsPanel 信息架构重构:画布操作(新建 Grid / 清空)与外观设置分离;外观按 Cube / Grid 分区加层级;移除 `MOCK_DATA` 调试块。
- AI Cube 视觉重构(logo / 状态态射,取代纯文字 "AI")。

**F3 — plugin-organizer(Grid 重构)**
- 移除 `border-red-500 opacity-50` 及 `App.css` 残留调试类。
- 清理 spike 残留:G0 prototype 回退面板、Finder telemetry 面板、"Multi-Window Mode" 横幅、grid 计数徽标、孤儿文件 `resize-handles.css`、生产 `console.*`(52 处)。
- SmartContainer 头部按键重构:建立主次/语义色;补 PRD §5.1.2 完整右键菜单(Grid:重命名/删除/锁定/设置;Item:Finder 显示/打开/移除);Grid 直接关闭入口。
- GridItem 视觉与头部按键风格统一。
- 交互流畅度:Grid 拖动 `onDrag` 节流 / 改拖动结束才 emit;折叠态去抖;resize handle 视觉收敛为 macOS 习惯;统一动效曲线(用 F1 token)。
- **PRD §5.1 缺口补齐(用户决定纳入本范围)**:FR-DT-11 内容缩略图(图片/PDF/视频)、FR-DT-10 Grid 边缘吸附隐藏。

### Non-goals

- 不动 web / console / sync 子系统。
- 不重写 typed events / window command contract **协议层**:仅优化 `ORGANIZER_GRID_UPDATE_EVENT` 等的**调用频率**(节流/收尾 emit),不改 payload schema、不改 Tauri command 签名。
- 不做数据库迁移、不动 localStorage 持久化结构(`SYSTEM_ARCHITECTURE.md §11`);若 token / 缩略图引入新字段须保证序列化兼容。
- 不接真实 LLM(PRD §5.8 Phase 4),对话面板仅 mock 视觉接入。
- 不修改任何 `dev_log.md`,不触发 ship。
- 不解决 Spaces / 多显示器真机门(归 verify 阶段,不在重构代码范围内强行 close)。

### Feature Classification

| 维度 | F1 design-system | F2 plugin-ai-cube | F3 plugin-organizer |
|---|---|---|---|
| Architecture Kind | 共享 UI 基础设施 | plugin slice + host 壳 | plugin slice |
| User Surface | 无直接 surface(底座) | control 窗口 | grid 窗口 + main overlay |
| Change Type | new feature(token 体系) | refactor + extension(接入) | refactor + extension(缺口补齐) |
| Risk Level | Medium | High(多窗口 + 业务 UI 迁移 + 红线整改) | High(多窗口 + 缩略图原生能力 + 拖拽) |
| Target Feature State | `@repo/ui` = In-Dev | `plugin-ai-cube` = Planned | `plugin-organizer` = Stable(G3 在途) |

### Impacted Layers

| Layer | F1 | F2 | F3 |
|---|---|---|---|
| Frontend `apps/desktop/src/`(host) | No | Yes(壳 + 路由,业务 UI 迁出) | No(目标:OrganizerLayer 仍待迁出,本次不强制) |
| Rust backend `apps/desktop/src-tauri/` | No | No | 可能 Yes(FR-DT-11 缩略图需原生取图,待 feature-plan 评估) |
| `packages/core/` | No | No | No |
| `packages/plugin-*` | No | Yes(`plugin-ai-cube`) | Yes(`plugin-organizer`) |
| `packages/ui/` | Yes(token 落点待定) | 复用 | 复用 |
| Registration / Loading 边界 | No | Yes(`plugin-ai-cube` 注册进 main.tsx + PLUGIN_MAP) | No |

### Candidate Modules / Dependencies(已对照 PLUGIN_MAP.md)

- `plugin-ai-cube` — `PLUGIN_MAP.md:79` 状态 **Planned**。已实现对话 UI 组件但未注册。F2 接入即把它推向 In-Dev/Testing,须同步四件套与 PLUGIN_MAP 状态列。
- `plugin-organizer` — `PLUGIN_MAP.md:71` 状态 **Stable**,但 `dev_log.md` 处 G3 `FEATURE_DEV` 进行中,有 P1 carry-forward(`inferKindFromPath` 等)。F3 须与 G3 残留协调,避免 dev_log 冲突。
- `@repo/ui` — `PLUGIN_MAP.md:64` 状态 **In-Dev**(仅 3 stub 组件)。F1 token 若落于此,等于推进 `@repo/ui` 成熟度。
- `@repo/core` — Stable,可直接依赖(events / hooks)。
- grid-* anchor 包(`grid-window-prototype` / `native-dnd-path-first` / `multi-grid-event-scope` 等)——仅 `docs/`,无 `src/`,是文档锚点;F3 须把原型结论转为 `plugin-organizer` 内实现,不能直接依赖。

### Constraints

- 遵守 `SYSTEM_ARCHITECTURE.md §4` 编码红线 12 条,重点:#1 业务逻辑必须在 plugin 内、#3 plugin 间通信走 `@repo/core/events`、#8 依赖单向 Host→Plugin→Core/UI、#11 通用 UI 归 `packages/ui` / 业务组件归 plugin。
- F2 必须修正既有红线 #1 违规(Host 持有 `AiCube.tsx` / `SettingsPanel.tsx` 业务 UI)。
- 不改 typed events payload schema 与 Tauri command 签名。
- localStorage 持久化结构 `PersistedLayout` 序列化兼容。
- 真机 macOS 13+ 验证多窗口行为(见验收 AC)。

### Data / Security / Cost / Release Notes

- **Data**:无数据库变更。token / 缩略图若引入 `GridBox` / `DesktopItem` 新字段,须序列化向后兼容。
- **Permission / Security**:F3 缩略图(FR-DT-11)若读取文件内容生成预览,可能触及 macOS 磁盘访问权限与既有 `BookmarkRegistry` 路径授权链路——须在 feature-plan 评估是否复用现有 bookmark 授权,不得绕过 `E3004` 路径授权门。无新增 ScreenCapture / Accessibility 权限。
- **Cost**:对话面板 mock 接入不调用 LLM,无 model API 成本。
- **Release**:三个 feature 均为 UI 改动,无需编译期 flag;F2 接入 `plugin-ai-cube` 走静态 import 注册(红线 #12)。dual-track(`adr/0002`)不适用——非账号/同步功能。

### Acceptance Criteria(二元可判定)

**F1 desktop-design-system**
1. design token 集合存在且被 F2/F3 至少各 1 个组件实际引用(grep 可证)。
2. 仓库内 `App.css` 的 `.border-red-500` / `.opacity-50` / `.border` 调试类被移除或不再被任何组件引用。
3. token 覆盖:颜色、间距、圆角、阴影、动效时长+缓动、字体梯度 6 类齐全。

**F2 plugin-ai-cube**
4. `apps/desktop/src` 不再包含 `AiCube` / `SettingsPanel` 业务 UI 实现;control 窗口渲染来自 `@repo/plugin-ai-cube` 的导出组件。
5. `plugin-ai-cube` 在 `PLUGIN_MAP.md` 状态从 Planned 更新为 In-Dev 或更高,且四件套同步。
6. AI Cube 单击展开的面板包含 PRD §5.8 Phase 0–3 托盘动作集(新建格子 / 剪贴板 / 番茄 / 设置 / 搜索)。
7. SettingsPanel 不再渲染 `MOCK_DATA` 调试块;画布操作与外观设置分区呈现。
8. control 窗口 / Cube 在真机 macOS 上单击与拖拽行为正确,拖拽不触发误点击。

**F3 plugin-organizer**
9. Grid 卡片不再出现红色 debug 边框与 `opacity-50` 半透明。
10. Grid 窗口不再渲染 G0 prototype 回退面板、Finder telemetry 面板;main 窗口不再渲染 "Multi-Window Mode" 横幅与 grid 计数徽标。
11. 孤儿文件 `resize-handles.css` 被删除或被正式引用;生产源码非测试 `console.*` 清零或改为受控开发日志。
12. Grid 右键菜单实现 PRD §5.1.2 全集(Grid:重命名/删除/锁定/设置;Item:Finder 显示/打开/移除);Grid 有直接关闭入口。
13. Grid 拖动期间跨窗口 `ORGANIZER_GRID_UPDATE_EVENT` 调用次数显著下降(节流或收尾 emit,feature-plan 定量阈值)。
14. FR-DT-11:图片/PDF/视频在 Grid 内显示真实缩略图而非首字母色块。
15. FR-DT-10:Grid 拖到屏幕边缘部分隐藏、悬停弹出。
16. 真机 macOS 上多 Grid 窗口拖拽 / resize / 折叠流畅,无明显抖动或位置漂移。

### Success Signals

- 用户主观反馈"不再简陋 / 按键清晰 / 拖拽顺手"。
- 审计 6 维度评分复审整体提升(目标各项 ≥4/5)。

---

## Open Questions / Unknowns

1. **[待确认]** design token 落点:`@repo/ui`(符合红线 #11,但推进 In-Dev 包成熟度)vs plugin 内自管(落地快、耦合低,但视觉一致性难保证)。用户已决定交给 feature-plan,触发 ADR-lite。
2. **[待确认]** FR-DT-11 缩略图实现路径:纯前端(`<img>` / canvas)能否满足 PDF 首页与视频封面帧,还是需要新增 Rust command 取原生缩略图(`QLThumbnailGenerator`)。若需 Rust,F3 触及 `src-tauri/`,风险与权限链路上升。
3. **[待确认]** 双 DnD 库是否统一:react-draggable(Grid/Cube 窗口移动)+ @dnd-kit(Item 拖拽)。统一前需评估对 `native-dnd-path-first` 路径优先策略与 `tauri://drag-drop` 的影响。可能仅 F3 局部,也可能上升为 program 级。
4. **[待确认]** 对话面板 mock 视觉接入与 PRD §5.8 "Phase 0–3 不假装能聊天" 的张力:接入对话面板 UI(即便 mock)是否违背 PRD phase 门控,需 ADR-lite 记录决策依据。
5. **[待确认]** F3 与 `plugin-organizer` G3 在途工作(P1 carry-forward)的协调方式:是否等 G3 收口、还是并行 + dev_log 分区。
6. **[待确认]** 3 个 feature 的 canonical slug:F1 是否就叫 `desktop-design-system`、token 若落 `@repo/ui` 是否反而不该是独立 plugin-slug feature 而是 `@repo/ui` 的扩展。由 feature-plan 定 slug。
7. **[待确认]** F2 中 `OrganizerLayer` / `useMultiWindowGrids` 是否顺带迁出 Host(organizer dev_log 既有 TODO),还是严格限定不动——本 brief 暂列为 Non-goal,feature-plan 可复议。

---

## ADR-lite Trigger

- **Needed: Yes**(命中规则:新增技术选型、改动 registration 边界、共享 UI 基础设施、phase 门控张力)

### 决策点 1 — design token 落点与所有权

- **Decision Topic**:design token 体系归 `@repo/ui` 还是各 plugin 内自管。
- **Why Decision Is Needed**:`@repo/ui` 当前 In-Dev(仅 3 stub);token 落此处推进其成熟度并符合红线 #11,但增加 F2/F3 对一个未成熟包的依赖。落 plugin 内则违背"通用 UI 归 ui 库"的精神且难保证 Cube/Grid 一致性。
- **Options To Evaluate**:(a) token 落 `@repo/ui`,同步推进其至 Stable;(b) token 落 `@repo/ui` 但仅作为纯常量导出、不升级组件库;(c) plugin 内自管 + 后续收口。
- **Risks If Deferred**:F2/F3 各自硬编码样式,重构后仍无单一真相源,"无设计系统"问题复发。

### 决策点 2 — 对话面板接入 vs PRD §5.8 phase 门控

- **Decision Topic**:Phase 0–3 阶段把 `plugin-ai-cube` 对话面板 UI(mock 数据)接入桌面,是否与 PRD "Phase 0–3 不假装能聊天" 冲突。
- **Why Decision Is Needed**:用户已决定"托盘 + 对话面板视觉接入";需记录这是有意的视觉前置(UI 先行、LLM 留 Phase 4),而非违规跳 phase。
- **Options To Evaluate**:(a) 对话面板可见但标注 "预览/未启用";(b) 对话面板仅在 feature flag 后可见;(c) 仅托盘,对话面板延后。
- **Risks If Deferred**:用户误以为 AI 已可对话,产生功能预期偏差。

### 决策点 3 —(条件触发)缩略图原生能力

- **Decision Topic**:FR-DT-11 是否引入 Rust 缩略图 command。
- **Why Decision Is Needed**:决定 F3 是否触及 `src-tauri/` 与磁盘权限链路,直接影响风险等级与真机验证范围。
- **Options To Evaluate**:(a) 纯前端预览;(b) 新增 Rust `generate_thumbnail` command 复用 `BookmarkRegistry` 授权;(c) 缩略图降级为类型占位图、真实缩略图延后。
- **Risks If Deferred**:F3 phase 估算失真,可能在 build 阶段才发现需要后端改动。

---

## Three-faces 边界检查(per adr/0003)

- **F1**:仅 `packages/ui/`(共享 UI 层)与可能的 token 常量。无业务逻辑进入 host / core。✅
- **F2**:业务 UI **从 host 迁入 `plugin-ai-cube`**——本身就是修正既有红线 #1 违规。host 仅保留 `ControlWindow` 窗口壳 + provider。✅(迁移方向正确)
- **F3**:全部业务改动落 `packages/plugin-organizer/`。若引入 Rust 缩略图 command,属 `src-tauri/` 平台层,不违反三面边界。✅
- 无业务逻辑被夹带进 `apps/desktop/src/` 或 `packages/core/`。

---

## Planner Handoff

> program 拆 3 feature,依赖序 F1 → (F2 ∥ F3)。建议先对 **F1** 跑 `feature-plan` 并落地 token,再并行规划 F2/F3。以下为 3 个独立 handoff。

### Handoff 1 — F1 desktop-design-system(wave 0,先做)

```
Start the feature-plan agent.
Motivation: 桌面端无设计系统,颜色裸 hex/rgba 散落、图标混用 emoji 与点阵、各组件各写圆角阴影间距,导致 AI Cube 与 Grid 视觉割裂、无法主题化。
Goal: 建立可被 plugin-ai-cube 与 plugin-organizer 复用的 design token 体系(颜色/间距/圆角/阴影/动效时长+缓动/字体梯度)与统一图标基线。
Scope: design token 定义 + 导出;统一图标体系基线;移除 App.css 的 .border-red-500/.opacity-50/.border 调试类。
Non-goals: 不动具体业务组件渲染(留给 F2/F3 消费 token);不接 LLM;不改协议层。
Constraints: 遵守 SYSTEM_ARCHITECTURE §4 红线(尤其 #11 通用 UI 归 packages/ui);不改 dev_log;不触发 ship。
Dependencies: @repo/ui(In-Dev,仅 3 stub);@repo/core(Stable)。
Acceptance Criteria:
- design token 6 类(颜色/间距/圆角/阴影/动效/字体)齐全且可被外部 import。
- App.css 调试类被移除或不再被引用。
- token 被至少一个真实组件引用以证明可用。
Open Questions:
- ADR-lite 决策点 1:token 落 @repo/ui 还是 plugin 内自管,以及是否顺带升级 @repo/ui 至 Stable。
- canonical slug 待定:若 token 落 @repo/ui,本 feature 可能是 @repo/ui 扩展而非独立 plugin-slug。
```

### Handoff 2 — F2 plugin-ai-cube(F1 完成后)

```
Start the feature-plan agent.
Motivation: 正式业务 UI plugin-ai-cube 从未接入桌面,Host 跑占位实现(AiCube.tsx 仅文字 "AI"、SettingsPanel 全内联样式 + mock 调试块);且 Host 持有业务 UI 违反红线 #1。
Goal: 把 plugin-ai-cube 正式 UI 接入 control 窗口(托盘 + 对话面板视觉,mock 会话不接 LLM),业务 UI 迁出 Host,SettingsPanel 信息架构重构。
Scope: 接入 AiCubePanel 等导出组件;Host AiCube.tsx/SettingsPanel.tsx 业务逻辑迁入 plugin;实现 PRD §5.8 Phase 0–3 托盘动作集;SettingsPanel 画布操作与外观设置分区;AI Cube 视觉重构;消费 F1 token。
Non-goals: 不接真实 LLM(Phase 4);不动 OrganizerLayer/useMultiWindowGrids 迁移(暂列 Non-goal);不改协议层。
Constraints: 遵守红线 #1/#8/#12;plugin-ai-cube 注册走静态 import;不改 dev_log;不触发 ship。
Dependencies: F1 design token;plugin-ai-cube(Planned→接入后须升状态 + 同步四件套 + PLUGIN_MAP);@repo/core/events。
Acceptance Criteria:
- apps/desktop/src 不再含 AiCube/SettingsPanel 业务 UI;control 窗口渲染 @repo/plugin-ai-cube 导出组件。
- plugin-ai-cube PLUGIN_MAP 状态从 Planned 更新,四件套同步。
- 面板含 PRD §5.8 Phase 0–3 托盘动作集;SettingsPanel 无 MOCK_DATA 调试块、分区呈现。
- 真机 macOS:Cube 单击/拖拽行为正确,拖拽不误触发点击。
Open Questions:
- ADR-lite 决策点 2:对话面板 mock 接入与 PRD "Phase 0–3 不假装能聊天" 的张力,需标注"预览/未启用"或 feature flag。
- OrganizerLayer/useMultiWindowGrids 是否顺带迁出 Host(organizer dev_log 既有 TODO)。
```

### Handoff 3 — F3 plugin-organizer(F1 完成后,可与 F2 并行)

```
Start the feature-plan agent.
Motivation: Grid 残留 spike 调试外壳(红色 debug 边框 + opacity-50、G0 prototype 回退面板、telemetry 面板、调试横幅),按键混乱(头部 4 同款按钮、"···"菜单只有 Close、无直接关闭),拖拽不流畅(双 DnD 库、拖动每帧跨窗口 emit、折叠 hover 抖动)。
Goal: Grid 视觉/信息架构/交互流畅度全面重构,清理调试残留,补齐 PRD §5.1 缩略图与边缘吸附。
Scope: 移除 border-red-500/opacity-50 及残留调试 UI;清理孤儿 resize-handles.css 与生产 console.*;SmartContainer 头部按键重构 + PRD §5.1.2 完整右键菜单 + 直接关闭入口;GridItem 风格统一;Grid 拖动 emit 节流;折叠态去抖;resize handle 视觉收敛;FR-DT-11 内容缩略图;FR-DT-10 边缘吸附隐藏;消费 F1 token。
Non-goals: 不改 typed events payload schema/Tauri command 签名(仅优化调用频率);不动 web/console/sync;不强行 close Spaces/多显示器真机门。
Constraints: 遵守红线 #1/#3;localStorage PersistedLayout 序列化兼容;与 plugin-organizer G3 在途工作协调,不改 dev_log;不触发 ship。
Dependencies: F1 design token;plugin-organizer(Stable,G3 FEATURE_DEV 在途有 P1 carry-forward);@repo/core/events/hooks;grid-* anchor 仅文档需转为 plugin 内实现。
Acceptance Criteria:
- Grid 无红色 debug 边框/opacity-50;无 G0 prototype 面板/telemetry 面板/Multi-Window 横幅/计数徽标。
- resize-handles.css 删除或正式引用;非测试 console.* 清零或受控。
- Grid 右键菜单实现 PRD §5.1.2 全集;Grid 有直接关闭入口。
- 拖动期间 ORGANIZER_GRID_UPDATE_EVENT 调用次数显著下降。
- FR-DT-11 真实缩略图;FR-DT-10 边缘吸附隐藏;真机多 Grid 拖拽/resize/折叠流畅。
Open Questions:
- ADR-lite 决策点 3:FR-DT-11 缩略图是否需新增 Rust command(触及 src-tauri/ 与磁盘权限链路)。
- 双 DnD 库(react-draggable + @dnd-kit)是否在本 feature 统一。
- 与 G3 carry-forward 的协调方式(等收口 vs 并行 + dev_log 分区)。
```

---

## Saved brief path

`docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md`
