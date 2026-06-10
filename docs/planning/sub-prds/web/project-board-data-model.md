# Web 项目看板 — 数据模型与 MVP 边界 (Project / Board Data Model)

| 字段 | 值 |
|---|---|
| 归属模块 | `web` (P0) — `apps/web/` + `packages/plugin-web-board-{core,views,workspaces}` |
| 路由真相 | `/app/board`（`/app/projects` 仅为规划别名，非当前代码真相） |
| 父文档 | `docs/planning/sub-prds/web/PRD.md` · 路线图 `docs/workflow/roadmap/xai-web-project-module.md` |
| 关联审查 | `docs/reviews/xai-web-project-module/20260609-board-usability-audit.md` |
| 作者 / 日期 | Claude (frontend-design 审查) / 2026-06-09 |
| 状态 | DRAFT v0.1 — 现状对账 + 目标模型 + 分波 MVP |
| Sync 归属 | board/list/card 实体 `syncScope: account-sync`（ADR-0013 §D4，sync 线暂停，本档不解冻） |

---

## 0. 一句话定位

Web 看板**已经是一个真实可用、localStorage 持久化的 Trello 级应用**（不是静态 Demo）：多看板共享一个集合、六视图共享同一份任务数据、卡片 CRUD / 拖拽 / 清单 / 附件 / 评论 / 日期全部真实写盘并跨刷新存活。它"看起来像 Demo"的真正原因是一组**具体、可修复的缺口**：卡片标签/成员 chip 渲染原始 id（`l1`/`u1`，看板模板的 `l1..l5` 甚至没有目录定义）、成员/标签不能新建编辑、缺优先级、看板元数据不能改名/换色。本档给出**当前 schema 对账**、对标成熟工具的**目标数据模型**、以及把它从"像 Demo"做成"真能用"的**分波 MVP**。

---

## 1. 层级关系（对标 Trello / Linear / Notion / Asana / ClickUp）

成熟工具的共识层级（去掉 ClickUp 的 Space/Folder 冗余层）：

```
Workspace  → Project(=Board)  → Status(列)  → Task(=Card)  → Subtask/Checklist
                                   ↑                ↑
                              单一真相         labels/members/priority/dates
```

| 层级 | Trello | Linear | Asana | Notion | 本项目现状 | 本项目目标 |
|---|---|---|---|---|---|---|
| 组织 | Workspace | Workspace | Workspace | Workspace | `BoardWorkspace` ✅ W3 可建/改名/换色/删空 | Workspace（已达成）|
| 看板/项目 | Board | Project | Project | Database | `Board`（真实集合，可建/删，**不可改名/换色**）| Project≡Board（可建/删/改名/换色/图标/描述）|
| 列/状态 | List(容器) | Workflow state(类型化) | Section | View 分组属性 | `BoardList`（容器，列即状态）| 保留 List-as-status；为 List 增加 `category` 语义 |
| 任务/卡片 | Card | Issue | Task | Page | `BoardCard`（字段丰富）| 同 + `priority` |
| 子项 | Checklist | Sub-issue | Subtask | child page | `checklistItems`（扁平清单）| 同（嵌套子任务为 Later）|

**关键架构决策**：成熟工具里"看板的列 = 某个 status 值的投影"（Linear/Notion/Asana），而非各自独立的数据。**本项目当前用 Trello 式容器模型**（卡片物理存放在 `list.cards[]`），这对"列只是同一批任务的状态展示"这一需求**已经成立**——一个 Board 内所有卡片就是同一份数据，分布在各列里；六个视图全部读 `activeBoard.lists`。因此用户担心的"视图各自独立 / 看板互相割裂"在架构上**已解决**，差的是"感觉"（见 §4 缺口）。

> 迁移到 Linear 式 "status 作为卡片属性 + 列是投影" 是更干净的长期模型（利于 Table 显示 Status 列、跨看板报表），但属于**架构演进（Later）**，不在本 MVP；当前容器模型已满足多视图共享。

---

## 2. 推荐数据结构（TypeScript）

> 现状权威类型在 `packages/plugin-web-board-core/src/types.ts`。下面是**目标模型**——大部分已存在，标注 ✅ 已实现 / 🟡 本次新增 / ⬜ 后续。

```ts
// ---- 组织层 ----
interface Workspace {            // 现 BoardWorkspace ✅（CRUD ⬜）
  id: string;
  name: BilingualText;
  color: string;
}

// ---- 项目/看板 ----
interface Board {                // ✅ 存在；🟡 W1 加 labels/members；✅ W2 加 icon/description
  id: string;
  workspaceId: string;
  name: BilingualText;           // ✅ W2 设置弹窗可改名
  cover: string;                 // ✅ W2 预设封面可换
  icon?: string;                 // ✅ W2
  description?: string;          // ✅ W2
  template: 'kanban' | 'pm' | 'blank';
  visibility?: 'private' | 'shared';   // ✅（本地态，非后端 ACL）
  labels?: BoardLabel[];         // 🟡 本次新增：看板级标签目录（缺省回退 DEFAULT_BOARD_LABELS）
  members?: BoardMemberOption[]; // 🟡 本次新增：看板级成员目录（缺省回退 DEFAULT_BOARD_MEMBERS）
  lists: BoardList[];            // ✅
}

// ---- 列 / 状态 ----
interface BoardList {            // ✅ 列即状态（容器模型）
  id: string;
  key: string | null;           // i18n 目录键（backlog/today/...）或 null
  customName?: BilingualText;
  color?: BoardListColorId | null;
  category?: StatusCategory;     // ⬜ Later：backlog|unstarted|started|completed|canceled（驱动完成度/统计）
  archived?: boolean;
  cards: BoardCard[];
}

// ---- 任务 / 卡片 ----
interface BoardCard {            // ✅ 字段最丰富
  id: string;
  title: BilingualText;          // ✅
  description?: string;          // ✅
  labels?: string[];            // ✅ 标签 id（→ 解析为 BoardLabel）🟡 本次起 chip 解析名称+颜色
  members?: string[];           // ✅ 成员 id（→ 解析为头像）🟡 本次起 chip 解析首字母+颜色
  priority?: BoardCardPriority; // 🟡 本次新增 'urgent'|'high'|'medium'|'low'
  startDate?: string;            // ✅ ISO YYYY-MM-DD
  dueDate?: string;              // ✅ ISO
  checklistItems?: BoardChecklistItem[]; // ✅ 子任务/清单 {id,text,done}
  attachments?: BoardCardAttachmentLink[]; // ✅ 链接型附件（文件上传 ⬜）
  activity?: BoardCardActivityEntry[];     // ✅ 评论/备注时间线（kind: note|comment）
  taskLink?: BoardCardTaskLink;  // ✅ 单向关联 Tasks 模块
  location?: CardLocation;       // ✅ Map 视图
  // rank?: string;              // ⬜ Later：分数索引排序（取代数组顺序，利于并发/同步）
  completedAt?: string;          // ✅ Automation Lite 写入
}

// ---- 目录实体 ----
interface BoardLabel {           // 🟡 本次提升为 types.ts 规范类型
  id: string;
  name: BilingualText;
  color: string;                 // OKLCH
}
interface BoardMemberOption { id: string; name: string; color: string; } // ✅

// ---- 评论 ----
interface BoardCardActivityEntry {  // ✅ 评论是 activity 的子类，不是独立 Comment 表
  id: string; kind: 'note' | 'comment'; body: string;
  createdAt: string; authorId?: string; authorName?: string;
}

// ---- 视图 ----（⬜ 目标：视图配置实体化；当前用 per-board view id + filter）
type ViewConfig =
  | { type: 'board';    groupBy: 'statusId'|'priority'|'assigneeId'; filter: Filter[]; sort: Sort[] }
  | { type: 'table';    columns: (keyof BoardCard)[];               filter: Filter[]; sort: Sort[] }
  | { type: 'calendar'; dateField: 'dueDate'|'startDate';           filter: Filter[] };

type BoardCardPriority = 'urgent' | 'high' | 'medium' | 'low';  // 🟡
type StatusCategory = 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled'; // ⬜
```

### 优先级编码

`'urgent' | 'high' | 'medium' | 'low'`（与 Tasks 模块 `TaskPriority` 的 `low|normal|high|urgent` 对应，`medium ↔ normal`，跨模块联动时归一）。元数据集中在 `BOARD_PRIORITIES`（颜色 + 双语名 + rank）。

---

## 3. 多视图共享同一套数据（已实现，需保持）

成熟工具的范式：**一份规范化任务集合 + 仅做 filter/sort/groupBy/layout 的视图配置**，视图绝不持有自己的数据副本。本项目**已符合**：`BoardWorkspacesModule` 从 `activeBoard.lists` 派生一次 `filteredLists`，喂给全部六视图（Board/Table/Calendar/Dashboard/Timeline/Map），Table/Calendar/Timeline 还共用同一个 `updateCard` 回写。

| 视图 | 读取字段 | 投影规则 | 现状 |
|---|---|---|---|
| 看板 Board | list 分组 + 顺序 | 按列分组 | ✅ |
| 表格 Table | 全字段 | 平铺行 | ✅（W2：标签/成员/优先级 chip + 行内编辑）|
| 日历 Calendar | dueDate/startDate | 落日期格 | ✅ |
| 仪表盘 Dashboard | 聚合 | 按列/标签/优先级统计 | ✅（W2 加优先级维度）|

**红线**：任何新视图都不得拷贝任务数据；只能产出 `{filter, sort, groupBy, layout}` 投影。

---

## 4. 当前缺口（"像 Demo"的真正原因）

| # | 缺口 | 现状证据 | 影响 | 波次 |
|---|---|---|---|---|
| 1 | 卡片 chip 渲染原始 id | `BoardCard.tsx` 直接渲染 `{labelId}`/`{memberId}`；看板种子用 `l1..l5` 但目录里**根本没有定义**（`PM_LABELS` 是 `pm-*`）| 看板首屏标签显示成灰色透明 `l1`/`l3`、成员显示 `u1`——最像"坏掉的 Demo" | **W1 ✅ 已修** |
| 2 | 无优先级 | 全代码 0 处 `priority` | 缺最常用 PM 字段 | **W1 ✅ 已加** |
| 3 | 标签不能新建/编辑/删除 | `PM_LABELS` 冻结常量 | 撞墙，无法真用 | **W1 ✅ 已加**（详情弹窗管理器）|
| 4 | 成员不能新建/编辑 | `BOARD_MEMBER_OPTIONS` 冻结 | 撞墙 | **W1 ✅ 已加** |
| 5 | 看板不能改名/换色/图标/描述 | 仅创建时设名；无编辑 UI | 像预制 Demo 板 | **W2 ✅ 已修** |
| 6 | Table/Dashboard 未显示标签/优先级 chip | board-views 各视图 | 一致性差 | **W2 ✅ 已修**（含按优先级过滤） |
| 7 | 附件仅链接，无文件上传；分享是前端 stub | `BoardCardDetailModal` / `ShareModal` | 能力受限 | Later |
| 8 | 无云同步（仅 localStorage 单设备）| `usePref` → localStorage；`storageContract` 的 `syncScope:account-sync` 投影**已写好但未接** `/sync/push` | 不跨设备 | sync 线（暂停）|

---

## 5. MVP 边界（MUST / SHOULD / LATER）

**"真能用而非 Demo" 的及格线**：能建项目、建带真实字段的任务、拖动列且顺序刷新后还在、标签/成员/优先级可建可改可分配、同一批任务在看板+表格+日历可见。

### MUST（其中 W1 本次已交付）
1. 项目/看板 建/删 ✅；**改名/换色/图标/描述** ✅ W2
2. 任务 CRUD + 核心字段（标题/描述/状态/成员/标签/优先级/起止日期/清单）✅（priority 本次补全）
3. 拖拽换列 + 列内排序，持久化 ✅
4. **标签可建/改/删**（看板级目录）✅ W1
5. **成员可建/改/分配**（看板级目录）✅ W1
6. **优先级**可设 ✅ W1
7. 看板/表格/日历三视图共享同一份任务 ✅
8. 本地持久化（刷新存活）✅
9. **卡片 chip 正确解析名称+颜色** ✅ W1

### SHOULD（W2 — 2026-06-09 已交付，除标注外）
- 看板元数据编辑（名/色/图标/描述）✅
- Table/Dashboard 标签 + 优先级 chip；Dashboard 优先级维度 ✅
- 按优先级 过滤 ✅（排序/`groupBy` 泛化 → Later）
- 起止日期 range + 逾期派生样式（已有）

### W3（2026-06-09 已交付）
- Table 列排序（标题/优先级/截止日，缺值末位，三态循环）✅
- Workspace CRUD（建/改名/换色/删空；`xai_board_workspaces` 持久化）✅

### LATER
- `status.category` 语义 + 完成度统计；列即状态 → status 作为属性的架构演进
- 分数索引 `rank`（取代数组顺序，利并发/同步）；看板 `groupBy` 泛化（按优先级/成员分组）
- 嵌套子任务（`parentId`）、任务依赖/关系、自定义字段
- 文件上传附件（需 IndexedDB 基建决策）、真实分享后端
- 多用户/邀请/权限
- **账号云同步**（接 `storageContract` 投影 → `/sync/push`，ADR-0013 §D4，sync 线解冻后）

---

## 6. 持久化与同步预留

- **当前**：`usePref("xai_boards_v2")` → `localStorage`，原始 `Board[]`（legacy-array 格式），跨刷新存活，单设备。`Board.labels`/`.members`/`card.priority` 均为普通 JSON 字段，经 `preserveBoardStorageFormat`/`mergeBoardCardPatch`（`clearUndefinedKeys` 保字段）正常写盘。
- **同步预留（已存在，未接）**：`plugin-web-board-core/src/internal/storageContract.ts` 已实现版本化信封 + 逻辑实体投影（`entityType: project.board|project.list|project.card`，`syncScope: 'account-sync'`），形状对齐账号云同步 blob 格式——但仅被 export/import 与日历 feed 调用，**实时写路径未走信封**，Web 侧无 `/sync/push`。属 ADR-0013 §D4 暂停的 sync 线，本档不解冻。
- **新增字段的 D4 归属**：`Board.labels/members`、`BoardCard.priority` 落在 `account-sync` 实体上 → 任何接同步前需走 `xai-account-sync-scope-check`（D4 9 项门 + outbox 排除证明）。当前 device-local，**purely additive，不破坏现有 localStorage 数据**（缺省回退默认目录）。
