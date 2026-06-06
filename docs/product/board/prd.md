# PRD — 看板 / Board (Kanban)

> Canonical 产品需求文档。由 `xai-feature-dossier-sync` Mode: apply 反向建立（2026-06-01），
> 基于已审草稿 `docs/reviews/board/20260601-prd.draft.md`。
> **多包合 1**：看板是一个用户感知功能，由 3 个 npm 包组成，合成本单一 PRD（粒度决议 §6 已签字）。
> 规则：每条需求保留 `Source:`；后续迭代仅在 §7 追加；未定项诚实标注 `待确认`，不臆造。

| 元信息 | 值 |
|---|---|
| Feature | 看板 / Board (Kanban) |
| 产品模块 | web |
| Owning packages | `@repo/plugin-web-board-core` + `@repo/plugin-web-board-views` + `@repo/plugin-web-board-workspaces` |
| 当前状态 | SHIPPED（基础 + 6 视图 + 工作区，含多轮 bugfix） |
| 持久化键 | `xai_boards_v2` / `xai_active_board` / `xai_board_panels` / `xai_board_inbox` / `xai_board_view_by_id` |
| 路由 | `/app/board` |

## 1. Overview — why / problem solved

Web Console 用户需要一个完整的看板（Kanban）系统来跨多块板、多视图地组织任务卡：
不仅是单一 Kanban 列，还要能切换 6 种视图（Board/Table/Calendar/Dashboard/Timeline/Map）、
在多个工作区与多块板之间切换、按模板新建板、过滤/分享、以及地图视图。

- Source: `board-core` dev_log block1 Title（"FOUNDATION layer for downstream board-views + board-workspaces"）+ `board-views`/`board-workspaces` dev_log block1 Title

## 2. Target users & core scenarios

XAI Web Console 使用者（项目/任务管理场景）。核心场景：
1. 在 Kanban 视图拖拽卡片跨列（atomic-move，刷新不产生孤儿卡）。
2. 切换 6 种视图查看同一批数据。
3. 在工作区（Personal / Team）与多块板之间切换；按 3 模板新建板。
4. 过滤（标签/成员/到期范围）、分享（生成链接）、地图视图查看带位置的卡。
5. 点击卡片打开详情；删除板/卡时有确认对话框。

- Source: 三包 dev_log Title + bugfix blocks（见 §3）

## 3. In Scope（按 3 包分层）

### 3.1 board-core — 基础层（schema + Kanban 视图 + 持久化）
canonical Board/Card/List schema（DESIGN.md §9.3 byte-for-byte）、Kanban 视图、
10 色列调色板（取自 `tokens.css` 语义变量，无硬编码 hex）、行内 add-card / add-list composer、
原生 HTML5 跨列 DnD（atomic-move，刷新无孤儿）、双语 `{en,zh}`、
持久化 `xai_boards_v2`(BoardsState) + `xai_active_board`(string)。

- Source: `board-core` dev_log block1「Web Console Board (Kanban) module — canonical schema + Board view + 10-color palette + composer + DnD + persistence」(SHIPPED)

### 3.2 board-views — 视图层（6 视图 + Filter/Share/Map）
- **6-view picker**：Board / Table / Calendar / Dashboard / Timeline / Map 切换器 + 5 个移植视图组件。
  - Source: `board-views` dev_log HISTORICAL panel「row #8 — 6-view picker」(SHIPPED)
- **Filter / Share / Map 扩展**（gap-closure row #6）：Filter 按 label/member/due range 内存渲染态收窄；
  Share 原生 `<dialog>` + 确定性 SHA-256 mock URL + `web:board:share-requested` 声明型事件（无真后端）；
  Map 用真 Leaflet（懒加载 ~42KB）+ OSM 瓦片替换 SVG 占位，新增可选 `BoardCard.location` 字段，
  就地修订 ADR-0008 §S3 D3 扩展 `connect-src` + `img-src` 到 OSM tile origin。
  - Source: `board-views` dev_log gap-closure row #6 block (SHIPPED)
- **修复：6-view picker 在运行 host 不可达**（死代码注册，host 只挂 board-workspaces 的 Kanban）。
  - Source: `board-views` dev_log bugfix「6-view picker unreachable」(SHIPPED)
- **修复：Timeline fixture 日期漂移 time-bomb**（RED-2）。
  - Source: `board-views` dev_log RED-2 panel (SHIPPED)

### 3.3 board-workspaces — 工作区 / 多板层
彩色 Workspace chips（Personal / Team）、Board Switcher modal、Board Creator modal（3 模板）、
PM 模板（Status Overview SVG 环图 + 5 阶段）、4-button 多面板切换器（Inbox/Planner/Board/Switch，至少一开不变式）、
持久化 `xai_board_panels` + `xai_board_inbox`。

- Source: `board-workspaces` dev_log block1 Title (SHIPPED)
- **修复：卡片点击在 5 个 view 全部无反应**（Audit Top-10 #5 / B-23+B-29+B-32+B-34+B-36）。
  - Source: `board-workspaces` dev_log bugfix Top-10 #5 (SHIPPED)
- **修复：删除板 / Inbox 卡缺确认对话框**（B-12+B-28 alertdialog）。
  - Source: `board-workspaces` dev_log bugfix B-12+B-28 (SHIPPED)

## 4. Non-Goals（明示不做）

- 真实后端分享 —— Share 仅生成 SHA-256 mock URL + 声明型事件，无服务端。Source: `board-views` gap-closure #6 Title
- 其余 Non-Goals 见各包 `design.md` Hard Constraints（本轮未逐包读，详 §9 Open Items）。

## 5. Acceptance Criteria（映射各包 test.md / Verify Report）

> 三包各有独立 test.md + feature-verify Verify Report。本节为产品级锚点，详 AC ID 见各包 test.md。

| 层 | 验收锚点 | 证据（HEAD/gate） | Source |
|---|---|---|---|
| board-core | schema byte-parity + DnD atomic-move + 10色palette + 持久化往返 | Verify Report HEAD `cc52060`（A7..A14 audit） | `board-core` dev_log Verify Report |
| board-views | 6 视图渲染 + ViewPicker + Filter/Share/Map + 视图可达性 | Verify Report + Cross-vendor (Codex) | `board-views` dev_log Verify Report |
| board-workspaces | 多面板不变式 + 切换/创建器 + 卡片点击 + 删除确认 | Verify Report HEAD `fdd1521`（A1..A11 audit） | `board-workspaces` dev_log Verify Report |

## 6. Owning modules / packages（多包合 1）

| 包 | 层 | 角色 | 用户可见? |
|---|---|---|---|
| `@repo/plugin-web-board-core` | foundation | schema + 基础 Kanban 视图 + 持久化 | 是（Kanban 视图）—— 并入看板 PRD，不单独建 PRD |
| `@repo/plugin-web-board-views` | 视图 | 6 视图切换 + Filter/Share/Map | 是 |
| `@repo/plugin-web-board-workspaces` | 工作区 | 多板/工作区/切换器/创建器/多面板 | 是 |

> 粒度决策（决议 §6 已签字）：用户只感知"一个看板"，3 包合 1 个 PRD；`board-core` 虽为 foundation，
> 但其 Kanban 视图用户可见，列为 Owning package（非独立 PRD）。

## 7. Revision History

| Date | 层/包 | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | — | dossier-sync 反向补账，首次建立 canonical PRD | `docs/reviews/board/20260601-prd.draft.md` | — |
| 2026-05-23 | board-core | 基础 Kanban + schema + DnD + 持久化 | dev_log block1 | SHIPPED |
| 2026-05-23 | board-views | 6-view picker | dev_log HISTORICAL panel | SHIPPED |
| 2026-05-23 | board-workspaces | 工作区/多板/切换器/创建器/多面板 | dev_log block1 | SHIPPED |
| 2026-05-24 | board-views | 修复 Timeline 日期漂移（RED-2） | dev_log RED-2 | SHIPPED |
| 2026-05-24 | board-views | 修复 6-view picker host 不可达 | dev_log bugfix | SHIPPED |
| 2026-05-25 | board-views | Filter + Share + Map（gap-closure #6，amends ADR-0008） | dev_log gap-closure #6 | SHIPPED |
| 2026-05-27 | board-workspaces | 修复卡片点击 5 视图无反应（Top-10 #5） | dev_log bugfix Top-10 #5 | SHIPPED |
| 2026-05-28 | board-workspaces | 删除确认对话框（B-12+B-28） | dev_log bugfix B-12+B-28 | SHIPPED |

## 8. Traceability Matrix

| Requirement | Source | Implementation (包) | Tests |
|---|---|---|---|
| Kanban schema + 视图 + DnD + 持久化 | board-core dev_log block1 | board-core | board-core test.md（A7..A14） |
| 6 视图切换 | board-views HISTORICAL panel | board-views (ViewPicker + 5 views) | board-views test.md |
| Filter/Share/Map | board-views gap-closure #6 | board-views (+ board-core `location`) | board-views test.md |
| 视图可达性修复 | board-views bugfix | board-views registration | 集成测试 |
| 工作区/多板/创建器/多面板 | board-workspaces dev_log block1 | board-workspaces | board-workspaces test.md |
| 卡片点击修复 | board-workspaces Top-10 #5 | board-workspaces | bugfix tests |
| 删除确认 | board-workspaces B-12+B-28 | board-workspaces | bugfix tests |

## 9. Open Items（诚实标注，非阻塞）

- **待确认 #1**：三包 `test.md` 的 AC ID 未逐一读取 → apply 后补齐 §5/§8 的具体 test ID 映射。
- **待确认 #2**：三包 `design.md` 的 Non-Goals/Hard Constraints 未读 → §4 待补全。
- **Ship-not-logged**：`release-log.md` 缺看板全部条目（基础+6视图+工作区+4 bugfix）→ 建议 `xai-release-log` 补登。
- **观察**：`board-core` doc-split 已归位，但其 manifest `id` 可能仍为旧 `xai-web-board-core`（属决议 §8 引用统一 follow-up，非本 PRD 范围）。
