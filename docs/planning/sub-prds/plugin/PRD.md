# Plugin 子 PRD — XAI 桌面整理插件 / Widget

> **PAUSED until G1 SHIPPED (ADR-0010 §D2).** 桌面插件属 P2，整条线在 P1 App 原生地基（G1）SHIPPED 前保持 Paused。粗略需求先用 `xai-feature-brief` 规范化入队，**不开 feature-build**。解冻条件见 §6。
> **权威基线**：ADR-0010（amended 2026-05-30）、ADR-0013（D2 分支 / D3 闸门 / D4 同步）、ADR-0015（organizer P 级 + pet 归属，Proposed）。边界以 `docs/MODULE_BOUNDARIES.md` 为准。

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`（主 PRD §5.1 / §5.5 / §5.6 / §5.7 / §5.16）|
| 范围 | 桌面整理插件 / Widget 的开发范围、归属、MVP 顺序、解冻条件（**不**重复主 PRD 的 FR）|
| 模块 key | `plugin`（PRODUCT_MODULE_MAP 模块 #3）|
| Surface | `apps/desktop/` 插件槽位 + `packages/plugin-{organizer,clipboard,widgets,pet}` |
| 主 / 短分支 | `desktop-plugin-next`（已定义未创建）/ `codex/plugin/<feature>` |
| 文档作者 | Claude（subagent）|
| 创建日期 | 2026-06-02 |
| 状态 | v0.1-DRAFT（范围 + MVP 拍板版；解冻后再细化各插件 FR）|

---

## 0. 文档定位与父 PRD 关系

本文档**只**展开桌面插件这一面的"**开发什么、归谁、按什么顺序、何时解冻**"。各插件的功能需求（FR）**一律不重复**，只引用主 PRD：

| 不重复的内容 | 看哪里 |
|---|---|
| Smart Container（organizer）FR-DT-01~14 | 主 PRD §5.1 |
| 剪贴板（clipboard）FR-CB-01~15 | 主 PRD §5.5 |
| 桌面 Widgets（时钟/天气/便签/时间进度条）FR-PG-01~09 | 主 PRD §5.6 |
| 冥想 / 专注 | 主 PRD §5.7 |
| AI 桌宠（pet）FR-PET-01~11 | 主 PRD §5.16 |
| 数据 Schema（grids/grid_items/notes/progress_trackers/pets 等）| 主 PRD §8 |
| 三面边界 / 同名陷阱 / 数据 syncScope 规则 | `docs/MODULE_BOUNDARIES.md` |
| 插件 SDK / Widget Host / manifest 槽位 | `docs/PLUGIN_SDK.md` |

> **桌面插件不是新功能集合**，而是骑在 App 原生底座（多窗口 / 点击穿透 / grid 窗口 / Tauri 命令）之上的**轻量挂件 / 小窗能力**。底座本身归 P1 App，不在本 PRD 范围（见 MODULE_BOUNDARIES §1 A 层）。

---

## 1. 范围红线（MUST）

1. **只做"用底座做挂件"，不做"造底座"。** 新建原生窗口、点击穿透、文件路径、缩略图、剪贴板/OCR 等**原生命令**由 P1 App 层提供（`src-tauri/commands/*`）；插件**只消费**。若某插件需要新原生命令 → 经 ADR-0013 D3 判定为 W3 native-bridge，交 App 线实现，插件侧只调用。
2. **不重做 Web 已覆盖的完整模块。** 任务/看板/日历/番茄/习惯/统计/四象限/倒数日/AI 聊天/设置已是 Web 最完整面；桌面侧通过共享业务包（`plugin-productivity`/`project`/`labels`）复用，不在插件里再造网页形态。
3. **数据默认 `device-local`，永不上云。** 每个插件实体先在 `packages/core-data/src/entities.ts` 定 `syncScope`；仅显式 `account-sync`（如 grids/grid_items/pets）才交 sync 线按 D4 九项清单补齐。本 PRD 不自行实现同步。
4. **插件间只走 `@repo/core/events`**，业务逻辑全在 `packages/plugin-*`，`index.ts` 为唯一公共出口；依赖前查 PLUGIN_MAP，只有 Stable（organizer）可直依，其余须 mock。

---

## 2. 现状盘点（2026-06-02，来自代码审查）

| 插件 | 代码现状 | 是否接入 App | 缺口 |
|---|---|---|---|
| **organizer** | **已实现最完整**：Smart Container / 多窗 grid / Finder reveal+open / 缩略图 / 自动分类 / 布局持久化 / 25+ 测试 | ✅ 已接线（App.tsx / GridWindow / ControlWindow）| `read/write_finder_tags` 已写未注册；无真置顶 pin（仅 fold=最小化）|
| **clipboard** | 骨架真、能力假：UI/store/持久化齐全，剪贴板读写=mock、OCR=`mockRecognize()` | ❌ `main.tsx` 未 import | 需 App 加 `clipboard_read_current`/`clipboard_subscribe_changes`/`vision_ocr` 命令 |
| **widgets** | 骨架真、数据假：5 个内置挂件能渲染，习惯数据=`mockHabitHistory()` | ❌ 未加载 | Widget Host 注册/装载未跑通；缺真实数据源接线 |
| **pet** | 骨架偏空壳：21 行状态机，AI 反应写死、订阅=no-op | ❌ 未加载 | 归属未决（见 ADR-0015）；AI 部分依赖 ai-cube Phase 4 |
| **meditation** | **未建包**（仅 `xai-web-meditation`）| — | 需新建 `packages/plugin-meditation` |

> 详细证据见 PLUGIN_MAP.md 对应行 + `apps/desktop/src/main.tsx`（插件注册）+ `src-tauri/src/commands/`。

---

## 3. MVP 范围与优先级（解冻后执行）

> 排序依据：原始优先级（主 PRD / dev-plan Phase）× 当前完成度 × 原生依赖深度。

| 阶段 | 内容 | 为什么排这里 | 原生依赖 |
|---|---|---|---|
| **MVP-0** | **organizer 收尾**：注册 `read/write_finder_tags`；补 always-on-top「真置顶 pin」（FR-DT-12 锁定语义）| 已 Stable，只差缺口；偏 App-lane 收尾 | 低（命令已存在/小改）|
| **MVP-1** | **Widget Host + 2 个零原生挂件**：跑通 `plugin-widgets` 注册/装载机制；接 **时钟** + **时间进度条/倒计时**（后者原始 P0「三端通用」，可复用 Web countdown 逻辑）| 验证"小窗承载不同模块"模式，原生依赖最低 | 低 |
| **MVP-2** | **clipboard MVP**：本地剪贴板历史 + 搜索 + 隐私过滤 + 顺序粘贴 | 原始决策 C 定为 P0、独立价值最高 | 中（需先在 App 加 `clipboard_*`/`vision_ocr`）|
| **MVP-3** | **pet 基础桌宠**（FR-PET-01~08：浮动 + 状态指示 + 气泡），AI 对话/孵化随 ai-cube Phase 4 | 原始 Phase 3/4，最后做 | 中（overlay 窗 + ai-cube 依赖）|

> **一句话 MVP**：organizer 收尾 → Widget Host + 时钟/进度条 → clipboard → pet。

---

## 4. 验收基线（每个 MVP 通用）

- 走标准管线：`feature-plan → feature-review → feature-build`（每次一阶段后停）`→ feature-verify → ship`。
- 实体先定 `syncScope`（默认 `device-local`），过 `xai-account-sync-scope-check` D4 receipt。
- 真机验证（多窗口 / 点击穿透 / 多 Space 行为）在 macOS 硬件上。
- 每个可见增量 ship 后用 `xai-release-log` 登记。

---

## 5. 待决问题（移交 ADR-0015）

1. **organizer 的 P 级**：web 线说 P2，dev 线 ADR-0011 降为 P3 Future——两线未 reconcile。建议：organizer 已 Stable/shipped，应视为"已交付的旗舰插件/底座的一部分"，既非 P2 greenfield 也非 P3 future。
2. **pet 归属**：独立包 `plugin-pet`（代码已存在） vs PLUGIN_SDK 里的 widgets 子模块（desktop-pet contentType）。建议：保留独立包（pet 有独立状态机 + AI persona 生命周期），并更新 PLUGIN_SDK 与之一致。

---

## 6. 解冻条件（gate）

- **触发**：G1（App 原生地基）SHIPPED（ADR-0010 §D2）。
- **解冻动作**：operator 确认创建 `desktop-plugin-next` 分支（独立确认步骤）；用 `xai-feature-dossier-sync` 给 clipboard/widgets/pet **反向补 PRD 与现状差距**作为开工基线；按 §3 MVP 顺序逐个走标准管线。
- **在 Paused 期间允许的事**：用 `xai-feature-brief` 规范化需求入队、本文档与 MODULE_BOUNDARIES / ADR-0015 的对齐——**不**写插件功能代码。

---

## 7. 相关文档

- 三面边界（权威）：`docs/MODULE_BOUNDARIES.md`
- 任务路由：`docs/PRODUCT_MODULE_MAP.md`（模块 #3）
- 插件状态机：`docs/PLUGIN_MAP.md`
- 插件 SDK：`docs/PLUGIN_SDK.md`
- 决策记录：`docs/adr/0015-desktop-plugin-scope-and-organizer-level.md`
- 分类注册表：`docs/workflow/project/module-classification.json`
