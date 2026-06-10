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
| P1 | 看板元数据编辑（名/色/图标/描述）| ⬜ W2 |
| P1 | Table/Calendar/Dashboard 显示标签+优先级 chip；Dashboard 加优先级维度 | ⬜ W2 |
| P2 | status.category 语义、分数索引 rank、文件上传、Workspace CRUD | ⬜ Later |
| P2 | 账号云同步接线（sync 线解冻后）| ⬜ Later |

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

> 备注：本次会话的 preview 浏览器因历史 service worker + bfcache 钉住了初始 chunk，看板视图截图仍显示旧 chip——该陷阱已由 dev 守卫根治，全新 `pnpm dev` / 干净浏览器即正常。Kanban 行为由上述确定性单测覆盖。
