# Web 项目看板 — 真实可用性审查 (Usability & Functional Audit)

| 字段 | 值 |
|---|---|
| 日期 | 2026-06-09 |
| 范围 | Web `/app/board`（`plugin-web-board-{core,views,workspaces}` + `plugin-web-tasks`）|
| 触发 | frontend-design 审查 —"从功能完整性与真实可用性，而非只看视觉"|
| 对标 | Trello · Linear · Notion Projects · Asana · ClickUp（联网调研）|
| 关联 | 数据模型 `docs/planning/sub-prds/web/project-board-data-model.md` · 路线图 `docs/workflow/roadmap/xai-web-project-module.md` |
| 结论一句话 | **不是静态 Demo，是真实 localStorage 应用**；"像 Demo"源于一组具体可修复缺口，W1 已修核心几项 |

---

## 1. 审查结论（纠正一个重要误解）

用户的直觉**一半对、一半错**：

- ❌ **错**："看板里很多展示元素但不能真正操作 / 表格日历仪表盘只是展示视图 / 切换看板是几套互相独立的假数据"。
  实测：绝大多数交互**真实写盘并跨刷新存活**；六视图读**同一份** `activeBoard.lists`；多看板是**一个共享集合**里的种子板（可建可删可切），不是各自硬编码的独立数据。
- ✅ **对**："新手引导里的成员/标签无法创建编辑关联 / 字段看起来不可操作"。
  实测：成员、标签是**冻结目录**（只能勾选不能新建/编辑/删除）；**无优先级**；卡片标签/成员 chip **渲染原始 id**（`l1`/`u1`），而看板模板用的 `l1..l5` **在任何目录里都没有定义** → 显示成灰色透明的乱码 chip，这是"看起来坏掉/像 Demo"的**头号原因**。

---

## 2. 静态展示 vs 真正可操作（实测矩阵）

渲染路径：`/app/board` → `boardWorkspacesWebModuleRegistration` → `BoardWorkspacesModule`（编排）→ `BoardView`(看板) / `TableView`·`BoardCalendarView`·`BoardDashboardView`·`TimelineView`·`MapView`（board-views）。持久化：`usePref` → `localStorage`（`xai_boards_v2` 等 6 键）。

| 交互 | 判定 | 证据 |
|---|---|---|
| 新建/删除看板 | ✅ 真实 | `BoardWorkspacesModule.tsx:376/399` 写 `xai_boards_v2` |
| 看板**改名/换色/图标/描述** | ❌ 无 | 仅创建时设名；无编辑 UI |
| 新建/编辑卡片（标题/描述）| ✅ 真实 | `BoardCardDetailModal.tsx:174/197` → `patchActiveCard` |
| 拖拽换列 | ✅ 真实 | `BoardView.tsx` HTML5 DnD → `moveCardToList` → 写盘 |
| 起止日期 | ✅ 真实 | 详情弹窗 `<input type=date>` → 写盘 |
| 清单/子任务 | ✅ 真实 | `checklistItems` 增删改 → 写盘 |
| 附件 | ✅ 真实（仅链接）| `createBoardIntegrationAttachment`（无文件上传）|
| 评论/备注 | ✅ 真实 | `activity[]`（kind note/comment）|
| 成员**分配** | ✅ 真实（仅勾选）| 从冻结 `BOARD_MEMBER_OPTIONS` 勾选 |
| 成员**新建/编辑** | ❌ 无 → ✅ **W1 已加** | 冻结常量（Alice/Bob/Carol）|
| 标签**分配** | ✅ 真实（仅勾选）| 从冻结 `PM_LABELS` 勾选 |
| 标签**新建/编辑/删除** | ❌ 无 → ✅ **W1 已加** | 冻结 5 标签 |
| **优先级** | ❌ 不存在 → ✅ **W1 已加** | 全代码 0 处 `priority` |
| 卡片 chip 解析名称+颜色 | ❌ 渲染原始 id → ✅ **W1 已修** | `BoardCard.tsx` 旧版直渲 `{labelId}`/`{memberId}`；看板 `l1..l5` 无目录定义 |
| 切看板 | ✅ 真实 | 共享集合 `setActiveBoardId` |
| 六视图共享数据 | ✅ 真实 | 全部读 `filteredLists`（派生自 `activeBoard.lists`）|
| 数据持久化（刷新存活）| ✅ 真实 | `localStorage`，非内存 |
| 云同步预留 | 🟡 有契约未接 | `storageContract.ts` 信封 + `syncScope:account-sync` 投影已写好，未接 `/sync/push`（sync 线暂停）|

---

## 3. 与成熟工具的关键能力差距

| 能力 | 成熟工具范式 | 本项目 | 差距 |
|---|---|---|---|
| 层级 | Workspace→Project→Status→Task→Subtask | Workspace(无CRUD)→Board→List→Card→Checklist | 缺 Workspace CRUD；List 缺 status 语义 |
| 列 = 状态投影 | Linear/Notion：status 单一真相，列是投影 | Trello 容器模型（卡片存 list.cards）| 多视图共享**已达成**；status-as-property 为长期演进 |
| 卡片字段 | 标题/描述/状态/指派/标签/优先级/起止/清单/附件/评论 | 除**优先级**外全有 | 优先级 → W1 补 |
| 标签/成员操作 | 实体 `{id,name,color}`，可建可改可删可指派 | 冻结目录，仅可指派 | CRUD → W1 补 |
| 优先级 | 固定枚举 0–4 / urgent..low | 无 | → W1 补 |
| 排序持久化 | 分数索引(LexoRank/fractional) | 数组顺序 | 单设备够用；并发/同步前需升级（Later）|
| 多视图共享 | 一份数据 + 视图配置投影 | **已达成**（六视图读同源）| 仅 Table/Dashboard 待补标签/优先级 chip |

---

## 4. 推荐数据结构 / 功能边界 / MVP

完整 TypeScript 模型、层级表、多视图投影、MUST/SHOULD/LATER MVP：见
`docs/planning/sub-prds/web/project-board-data-model.md`。

核心三条红线（保证不返工）：
1. 看板内所有卡片 = 同一份数据；视图只做投影，绝不持有数据副本。
2. 标签/成员是**看板级实体目录**（`Board.labels`/`Board.members`），卡片按 id 引用。
3. 新增持久化字段 `syncScope: account-sync` → 接同步前过 `xai-account-sync-scope-check`（ADR-0013 §D4）。

---

## 5. 优先修复（按"杀掉 Demo 感"排序）

| 优先级 | 修复 | 状态 |
|---|---|---|
| P0 | 卡片 chip 解析（标签名+颜色、成员首字母头像+颜色）+ 修复看板 `l1..l5` 孤儿 id | ✅ W1 |
| P0 | 优先级字段 + 详情选择器 + 卡片 chip | ✅ W1 |
| P0 | 标签 新建/改名/换色/删除（看板级目录）| ✅ W1 |
| P0 | 成员 新建/改名/分配（看板级目录）| ✅ W1 |
| P1 | 看板元数据编辑（名/色/图标/描述）| ✅ W2 |
| P1 | Table/Dashboard 标签+优先级 chip；Dashboard 优先级维度；按优先级过滤 | ✅ W2 |
| P1.5 | Table 列排序（标题/优先级/截止日）+ Workspace CRUD | ✅ W3 |
| P2 | status.category 语义、分数索引 rank、看板 groupBy 泛化 | ⬜ Later |
| P2 | 文件上传（需 IndexedDB 基建决策——localStorage 5MB 配额放不下 blob）| ⬜ Later |
| P2 | 真实分享后端、账号云同步接线（ADR-0013 §D4 门禁，sync 线 paused，不得擅自解冻）| ⬜ 门禁 |

---

## 6. W1 已交付（本次）

`packages/plugin-web-board-core`（types/catalogs/BoardCard/BoardList/BoardView/index/styles）+ `packages/plugin-web-board-workspaces`（BoardWorkspacesModule/BoardCardDetailModal/styles）+ `apps/web`（service-worker dev 守卫）：

- `Board.labels` / `Board.members`：看板级目录，缺省**惰性回退**默认目录（旧 localStorage 看板零迁移、纯增量）。
- `DEFAULT_BOARD_LABELS`：补齐看板 `l1..l5`（Design/Engineering/Research/Marketing/Urgent）+ PM `pm-*`，孤儿 id 不再出现。
- `BoardCard.priority` + `BOARD_PRIORITIES`（urgent/high/medium/low + 色 + rank）。
- `BoardCard` chip 解析：标签→名+色（`.is-resolved`）、成员→首字母头像+色+全名 title、优先级 chip。
- 详情弹窗：优先级选择器 + 标签管理器（建/改名/换色/删，删除联动清理卡片引用）+ 成员管理器（建/改名/删）。
- `apps/web/src/service-worker/register.ts`：SW 仅 PROD 注册（dev 主动反注册）——根治 Vite dev 下 SW 缓存导致的"改了不生效"陷阱。

**验证**：board-core 193/193、board-workspaces 267/267（含 6 条新解析/优先级断言 BC2b–f）；两包 tsc 干净；Vite 实测服务最新源；Table 视图已可视化确认成员解析（Alice/Bob/Carol 彩色头像）。

> 备注：本次会话的 preview 浏览器因历史 service worker + bfcache 钉住了初始 chunk，W1 当时未能截到看板新渲染——该陷阱已由 dev 守卫根治；W2 验证时干净 preview 已确认全部新 UI 实际生效（彩色标签/头像/优先级 chip/设置弹窗均有截图证据）。

---

## 7. W2 已交付（2026-06-09 第二波）

- **看板元数据编辑**：`Board.icon`/`Board.description` 字段 + 守卫；`BoardSettingsModal`（名称/图标/描述/8 预设封面 `BOARD_COVER_PRESETS`）；header ✎ 入口；标题与 BoardSwitcher 显示自定义图标与描述。
- **优先级贯通多视图**：TableView 新增可编辑「优先级」列（chip + popover 设置/清除）；Dashboard 新增「按优先级分布」柱状图（无优先级卡片时隐藏）。
- **按优先级过滤**：`FilterState.priorities` facet（板内 AND 跨 facet、OR facet 内、无优先级卡片不通过非空过滤）+ FilterPopover 优先级区 + 按板持久化（`xai_board_filter_by_id` 序列化含 `priorities`，旧存储宽容缺省）。
- **顺带修复**：FilterPopover 的标签/成员行从渲染原始 id 改为目录解析显示名（未知 id 原样回退）。

**验证**：board-core 204 / board-views 138 / board-workspaces 277 = **619 测试全绿**（新增 FIL-P1..3、TV-P1..2、BD-P1..2、FP-P1/FP-N1、BWM-SET-1..2、BWM-FILTER-P、V10）；3 包 tsc + lint 干净；干净 preview 实测：chip 解析、🚀 图标持久化、封面切换、Urgent 卡面 chip 全部生效。

---

## 8. W3 已交付（2026-06-09 第三波）

- **Table 列排序**：标题/优先级/截止日三列可点击排序（优先级首点 urgent 优先；缺值恒排末位；三击还原自然顺序）。
- **Workspace CRUD**：新持久化键 `xai_board_workspaces`（registry + AC-REG/PARITY 契约登记，懒种子回退 `DEFAULT_WORKSPACES`）；切换器内可新建空间、改名（✎ 行内）、换色（点色点轮换）、删除（仅空且非最后一个）；空空间在可编辑态也渲染分组。最后一个冻结目录由此消除。
- **范围外（记录理由）**：文件上传需 IndexedDB 基建决策；真实分享后端与账号云同步属 ADR-0013 §D4 sync 线（paused），接线前必须过 `xai-account-sync-scope-check` 九项门，不在本审查范围内擅自解冻。
- **既有问题立项**：`plugin-web-storage` 的 AC-PARITY-1/2 因 `web design/DESIGN.md` 缺 §9.2 而失败（在本工作之前即失败，已开独立修复任务）。

**验证**：board-core 206 / board-views 141 / board-workspaces 281 = **628 测试全绿**（新增 WSP-1/2、TV-S1..3、BWM-WS-1..4）；storage 87/89（2 个失败为上述既有 parity 漂移）；4 包 tsc + lint 干净；live 实测：新建空间出现在 scope 栏 + 分组（含 ✎/🗑）、Priority ▼ 排序置顶 Urgent 卡。
