# Desktop AI Cube + Grid 视觉与交互重构审计

| 字段 | 值 |
|---|---|
| 审计日期 | 2026-05-21 |
| 范围 | plugin-ai-cube · plugin-organizer · grid-* anchors · apps/desktop host shell |
| 模式 | READ-ONLY 审计 + Step 0 输入 |
| Feature Slug 建议 | `desktop-ux-rebuild` |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |

---

## 0. 一句话核心结论

桌面端 AI Cube 与 Grid 的"简陋 / 按键混乱"不是表层 CSS 问题:**真正的业务 UI(`plugin-ai-cube`)从未接入,Host 跑的是一个临时占位实现,而 Grid 仍带着 spike 阶段的调试外壳(红色 debug 边框、`opacity-50`、telemetry 面板、mock 数据)**——所以这是一次"接入正式插件 + 清理调试残留 + 建立设计系统"的中度重构,而非纯组件 polish。

---

## 1. 现状摘要

### 1.1 窗口与渲染拓扑

`apps/desktop/src/main.tsx:15-34` 用 hash router 分三类窗口:`/`(main 透明 overlay)、`#/control`(AI Cube)、`#/grid?id=xxx`(每个 Grid 一个原生窗口)。架构本身符合 `SYSTEM_ARCHITECTURE.md §5`。

### 1.2 AI Cube 现状

- Host 自带 `apps/desktop/src/components/AiAssistant/AiCube.tsx` —— 一个 64×64 圆角方块,内容仅是文字 `AI`(`AiCube.tsx:240`)。
- 设置走 Host 自带 `apps/desktop/src/components/Settings/SettingsPanel.tsx`,几乎全部内联样式。
- **`packages/plugin-ai-cube/` 已实现完整对话 UI**(`AiCubePanel` / `MessageBubble` / `InputBar` / `ActionSuggestion` / `CostGuard` / `PrivacyGateDialog` / `OfflineFallback`,见 `plugin-ai-cube/src/index.ts:12-18`),但 `apps/desktop/src` 对 `plugin-ai-cube` **零引用**(grep 确认),该插件在 `PLUGIN_MAP.md:79` 状态为 `Planned`。
- 结论:用户看到的"简陋小方块 + 简陋设置面板"是 Host 占位件,正式插件 UI 根本没上桌面。

### 1.3 Grid 现状

- `plugin-organizer` 在 `PLUGIN_MAP.md:71` 为 `Stable`,但 dev_log 仍处 `FEATURE_DEV / G3` 进行中,且 TODO 明确列出 `OrganizerLayer` / `useMultiWindowGrids` 尚待迁出 Host(`plugin-organizer/docs/dev_log.md`)。
- Grid 内容由 `OrganizerGridContent` 渲染,但当 Organizer state 未到达时回退到 **"G0 Grid Prototype"调试面板**(`OrganizerGridContent.tsx:389-463`),正常态下方还固定悬浮一个 **Finder DnD telemetry 面板**(`OrganizerGridContent.tsx:487-498`)。
- `SmartContainer` 是核心卡片组件,但根节点 className 写死 `"smart-container border border-red-500 opacity-50"`(`SmartContainer.tsx:285`),配合 `App.css:166-176` 的 `.border-red-500` / `.opacity-50`,**每个 Grid 实际渲染为红色描边 + 50% 半透明**——典型 spike 调试残留泄漏到生产。

### 1.4 设计系统现状

无 design token 体系。颜色以裸 hex / rgba 散落在内联样式与 `App.css`(`#111827`、`#0b1220`、`rgba(15,23,42,*)`、`#38bdf8` 等),`AiCube` / `SettingsPanel` / `SmartContainer` / `GridItem` 各写各的圆角、阴影、间距。图标混用 emoji(🔒🔓⌄⌃🪟🧹📂)与 CSS 点阵 `div`。

---

## 2. 按维度评分(0–5,越高越好)

| 维度 | 评分 | 摘要 |
|---|---|---|
| 视觉 / 美观 | **2 / 5** | 玻璃拟态基调尚可,但红色 debug 边框 + `opacity-50` bug、emoji 图标、mock 调试块、无 token、内联样式割裂 |
| 信息架构 | **2 / 5** | AI Cube 无主界面(只 toggle);SettingsPanel 把 5 类功能塞进一张卡;Grid 头部 4 个同款按钮语义不清,"···"菜单只有 Close |
| 交互流畅度 | **3 / 5** | 原生窗口 startDragging 拖拽手感扎实;但 react-draggable 与 dnd-kit 并存、拖动每帧跨窗口 emit、折叠靠 hover 抖动、零动效曲线规范 |
| 多窗口一致性 | **3 / 5** | per-grid 原生窗口架构正确、层级/collectionBehavior 合理;但 prototype 回退面板 / telemetry / "Multi-Window Mode" 横幅 / grid 计数徽标四套调试 UI 破坏一致性 |
| 与 PRD §5.1 差距 | **2.5 / 5** | 拖入 / 多窗口 / resize / 折叠 / 右键已具雏形;缺缩略图、边缘吸附隐藏、完整右键菜单、自动分类入口收口 |
| 与 PRD §5.8 差距 | **1 / 5** | Phase 0–3 要求 Cube 是"快捷入口托盘";现状只能 toggle 一个设置面板,无托盘动作集;plugin-ai-cube 对话 UI 未接入 |

---

## 3. 问题清单(带 file:line)

### 3.1 视觉 / 美观

| # | 问题 | 位置 |
|---|---|---|
| V1 | 生产环境每个 Grid 渲染红色 debug 边框 + 50% 透明 | `SmartContainer.tsx:285` + `App.css:166-176` |
| V2 | `App.css` 残留 `.border` / `.border-red-500` / `.opacity-50` 调试类 | `App.css:166-176` |
| V3 | SettingsPanel 底部渲染 `MOCK_DATA` 调试说明块 `.debug-note` | `SettingsPanel.tsx:5-9,241-247` · `App.css:160-164` |
| V4 | Grid 未就绪时整窗回退为 "G0 Grid Prototype" 调试面板 | `OrganizerGridContent.tsx:389-463` |
| V5 | 正常 Grid 下方固定悬浮 Finder DnD telemetry 面板 | `OrganizerGridContent.tsx:100-134,487-498` |
| V6 | main 窗口顶部常驻 "Multi-Window Mode" 调试横幅 | `App.tsx:24-41` |
| V7 | 图标混用 emoji 与 CSS 点阵,无统一图标体系 | `SmartContainer.tsx:394,402,410-423` · `OrganizerLayer.tsx:308` |
| V8 | 颜色裸 hex/rgba 散落,无 design token(`HEADER_COLOR` 等局部常量各自为政) | `SmartContainer.tsx:20-21` · `GridItem.tsx:17-31` · `App.css` 全文 |
| V9 | AiCube 内容仅文字 "AI",无 logo / 状态态射 | `AiCube.tsx:240` |
| V10 | SettingsPanel 几乎全内联样式,无法主题化 | `SettingsPanel.tsx:64-148` |
| V11 | `resize-handles.css` 为孤儿文件,无任何 import 引用(dead CSS) | `plugin-organizer/src/resize-handles.css`(grep 无引用) |
| V12 | GridItem 缩略图为文件名首两字母色块,非 PRD 要求的真实图标/缩略图 | `GridItem.tsx:74-89` |

### 3.2 信息架构

| # | 问题 | 位置 |
|---|---|---|
| IA1 | AI Cube 无主界面,单击仅 toggle 设置面板,不承载 PRD §5.8 "快捷入口托盘" | `AiCube.tsx:212-214` · `ControlWindow.tsx:153-165` |
| IA2 | SettingsPanel 单卡混装 5 类功能:新建 Grid / 清空全部 / Cube 外观 / Grid 外观 / mock 插件槽,无分组 | `SettingsPanel.tsx:55-248` |
| IA3 | "+ New Grid"、"Clear All Grids" 属画布操作,却被埋进"设置面板",入口违反直觉 | `SettingsPanel.tsx:85-121` |
| IA4 | Grid 头部 4 个按钮(···/锁/折叠/视图)用同一 `viewToggleStyle`,无主次、无语义色 | `SmartContainer.tsx:372-425` |
| IA5 | "···"按钮命名 "More options",点开的菜单实际只有 1 项 "Close" | `SmartContainer.tsx:373-387,446-480` |
| IA6 | 关闭 Grid 唯一入口藏在"···"菜单里,无直接关闭按钮 | `SmartContainer.tsx:462-478` |
| IA7 | PRD §5.1.2 的右键菜单(重命名/删除/锁定/设置;Item:Finder显示/打开/移除)未实现,`handleContextMenu` 复用同一只含 Close 的菜单 | `SmartContainer.tsx:95-102,446-480` |
| IA8 | GridItem 操作按钮(Task / Tags)为纯文字小按钮,与 Grid 头部按钮风格不统一 | `GridItem.tsx:96-103,114-122` |
| IA9 | Cube 文本/主题色等设置无预览、无重置、无分区标题层级 | `SettingsPanel.tsx:123-203` |

### 3.3 交互流畅度

| # | 问题 | 位置 |
|---|---|---|
| IX1 | 拖动 Grid 时 `onDrag` 每帧 `onUpdate` → 跨窗口 `emit(ORGANIZER_GRID_UPDATE_EVENT)`,IPC 风暴风险 | `SmartContainer.tsx:120-123` · `OrganizerGridContent.tsx:246-272` |
| IX2 | 折叠态靠 `isHovering` 临时展开,鼠标移入移出 → 高度跳变,易抖动 | `SmartContainer.tsx:138-140,428` |
| IX3 | react-draggable(Grid/Cube 移动)与 @dnd-kit(Item 拖拽)两套 DnD 并存,手感与事件模型不统一 | `SmartContainer.tsx:10,270` · `GridItem.tsx:2,34` |
| IX4 | 无统一动效曲线规范,各组件 transition 时长/缓动各写(120/150/160/200ms 混用) | `AiCube.tsx:131` · `SmartContainer.tsx:159,202,317` |
| IX5 | resize handle 为 20px 白底圆 + 3px 边 + hover 变绿放大 1.3x,视觉抢眼且非 macOS 习惯 | `SmartContainer.tsx:303-330` · `useCustomResize.tsx:125-134` |
| IX6 | 自定义 resize 通过全局 `document` mousemove 监听 + 直接改 `document.body.style`,无节流 | `useCustomResize.tsx:64-117` |
| IX7 | `OrganizerGridContent` 每 1000ms 轮询 `outerPosition/innerSize` 刷新窗口元数据,持续开销 | `OrganizerGridContent.tsx:172-206` |
| IX8 | 52 处非测试 `console.*` 调用散落生产源码(红线 #7:仅开发环境可用) | grep `packages/plugin-organizer/src` `apps/desktop/src` `plugin-ai-cube/src` |
| IX9 | Cube 单击 vs 拖拽靠 4px 阈值 + `startDragging` 交接;`startDragging` 失败时不复位 `dragHandedOff`,可致点击吞掉 | `AiCube.tsx:177-215` |

### 3.4 多窗口

| # | 问题 | 位置 |
|---|---|---|
| MW1 | Grid 窗口在 prototype 回退态与正常态视觉完全不同(深色调试面板 vs 浅色玻璃卡) | `OrganizerGridContent.tsx:389-464,466-500` |
| MW2 | control 窗口透明区仍捕获点击,靠开/关面板时 setSize 切换(96→360)规避,本质 hack | `ControlWindow.tsx:14-18,44-61` |
| MW3 | 面板"点击外部关闭"靠 `onFocusChanged`,非真正 hit-test;焦点行为在多显示器/Spaces 下不稳 | `ControlWindow.tsx:67-84` |
| MW4 | telemetry / prototype / "Multi-Window Mode" 横幅 / grid 计数徽标在不同窗口各自出现,跨窗口视觉不一致 | `App.tsx:24-41` · `OrganizerLayer.tsx:294-310` · `OrganizerGridContent.tsx:443,487-498` |
| MW5 | native-dnd-path-first / multi-grid-event-scope / grid-* 包仅为 doc anchor,无代码,落地策略停留在文档 | `packages/grid-*/`(仅 `docs/`,无 `src/`) |
| MW6 | Spaces / 多显示器一致性证据缺失(`spaces-multimonitor-matrix` 在 `PLUGIN_MAP.md:22` 为 `Blocked`,待真机) | `PLUGIN_MAP.md:20-23` |

### 3.5 与 PRD §5.1 / §5.8 差距

| # | PRD 条目 | 现状 | 位置 |
|---|---|---|---|
| P1 | FR-DT-10 边缘吸附隐藏(Grid) | 未实现(仅 AI Cube 有 dock 逻辑) | `AiCube.tsx:72-97` |
| P2 | FR-DT-11 内容缩略图(图片/PDF/视频) | 未实现,GridItem 用首字母色块 | `GridItem.tsx:74-89` |
| P3 | FR-DT-12 Grid/Item 完整右键菜单 | 仅 Grid 菜单含 Close,Item 无右键菜单 | `SmartContainer.tsx:446-480` |
| P4 | FR-DT-01 命名 / 快捷键 Cmd+Shift+N | 仅双击标题改名,无全局快捷键 | `SmartContainer.tsx:366` |
| P5 | §5.8 Phase 0–3 Cube 作"快捷入口托盘"(新建格子/剪贴板/番茄/设置/搜索) | 仅 toggle 设置面板,无托盘动作集 | `AiCube.tsx` 全文 |
| P6 | §5.8 对话面板(Phase 4) | `plugin-ai-cube` 已写但未接入桌面 | `plugin-ai-cube/src/index.ts` |

---

## 4. 改造范围建议

定位:**中度重构(component rebuild + 插件接入 + 设计系统),非纯 polish,非协议层重写。**

### 范围内(建议本 feature 覆盖)

1. **建立设计系统底座**:在 `packages/ui/` 引入 design token(颜色 / 间距 / 圆角 / 阴影 / 动效曲线 / 字体梯度),供 Cube 与 Grid 复用(红线 #11:通用 UI 归 `packages/ui/`)。
2. **AI Cube 接入正式插件**:把 `plugin-ai-cube` 的 `AiCubePanel` 等接入 control 窗口;Host 仅保留窗口壳与 provider,业务 UI 移入 `plugin-ai-cube`(红线 #1 / #8)。Phase 0–3 先实现 PRD §5.8 "快捷入口托盘"动作集。
3. **SettingsPanel 信息架构重构**:画布操作(新建 Grid / 清空)与外观设置分离;外观设置按 Cube / Grid 分区并加层级;移除 `MOCK_DATA` 调试块。
4. **SmartContainer 视觉与按键重构**:移除 `border-red-500 opacity-50`;头部按钮建立主次与语义;补 PRD §5.1.2 完整右键菜单;直接关闭入口;统一 GridItem 与头部按钮风格。
5. **清理 spike 调试残留**:G0 prototype 回退面板、Finder telemetry 面板、"Multi-Window Mode" 横幅、grid 计数徽标、`resize-handles.css` 孤儿文件、生产 `console.*`。
6. **交互流畅度**:Grid 拖动 `onDrag` 节流 / 改为拖动结束才 emit;折叠态去抖;统一动效曲线;resize handle 视觉收敛为 macOS 习惯。
7. **缩略图**(FR-DT-11)与**边缘吸附隐藏**(FR-DT-10):视复杂度可拆为后续 phase 或独立 feature。

### 范围外(明确不做)

- 不动 web / console / sync 子系统。
- 不重写 typed events / window command contract 协议层(仅做调用频率优化,不改 payload schema)。
- 不做数据库迁移、不动 localStorage 持久化结构(`SYSTEM_ARCHITECTURE.md §11`)。
- 不触发 ship,不改任何 `dev_log.md`。
- 真机 macOS 验证项(Spaces / 多显示器 / hit-test)归后续 verify,不在重构代码范围内强行解决。

---

## 5. 风险与依赖

| 项 | 说明 |
|---|---|
| R1 边界合规 | Host 当前持有 `AiCube.tsx` / `SettingsPanel.tsx` 业务 UI,属红线 #1 既有违规;接入 `plugin-ai-cube` 时须把业务逻辑迁入插件,Host 只留壳。 |
| R2 插件状态 | `plugin-ai-cube` 在 `PLUGIN_MAP.md:79` 为 `Planned` — 接入即等于把它推向 In-Dev/Stable,需同步四件套与 PLUGIN_MAP。 |
| R3 organizer 在途 | `plugin-organizer` dev_log 处 G3 `FEATURE_DEV` 进行中且有 P1 carry-forward;UX 重构须与 G3 残留协调,避免 dev_log 冲突。 |
| R4 双 DnD 库 | react-draggable + @dnd-kit 并存;统一前需评估对 `native-dnd-path-first` 路径优先策略与 `tauri://drag-drop` 的影响。 |
| R5 跨窗口事件 | 拖动节流改动触及 `ORGANIZER_GRID_UPDATE_EVENT` 调用频率;须确认 `multi-grid-event-scope` 作用域约定不被破坏。 |
| R6 真机验证 | 多窗口 / 透明 hit-test / Spaces / 多显示器无法仅靠单测;`spaces-multimonitor-matrix`、`click-through-matrix` 在 `PLUGIN_MAP` 仍 `Blocked`,verify 需真机 macOS 13+。 |
| R7 token 落点 | design token 放 `packages/ui/`(`In-Dev`,仅 3 个 stub 组件);需先确认 `@repo/ui` 作为依赖的稳定性或同步推进。 |
| D1 | 依赖 `packages/ui/`(`In-Dev`)、`@repo/core/events`、`@repo/core/hooks`。 |
| D2 | grid-* anchor 包(`grid-window-prototype` 等)仅文档,落地需将原型结论转为 `plugin-organizer` 内实现。 |

---

## 6. 下一步

执行 `/xai-feature-brief`,以本报告为输入对 `desktop-ux-rebuild` 做 Step 0 需求规范化;brief 通过后进入 `feature-plan`。
