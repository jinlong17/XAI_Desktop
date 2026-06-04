# XAI Web 项目模块审查与补充 PRD

| Field | Value |
|---|---|
| Date | 2026-06-03 |
| Scope | Web Console 的“项目/看板”功能模块 |
| Current Web route | `/app/board` |
| Current Web packages | `@repo/plugin-web-board-core`, `@repo/plugin-web-board-views`, `@repo/plugin-web-board-workspaces` |
| Related desktop package | `@repo/plugin-project` |
| Status | Supplemental PRD + audit complete; P0/P1 follow-up implementation in progress |

## 1. Executive Verdict

Web 版本的“项目”功能已经不是空壳。当前 `/app/board` 已经可进入，并且具备多看板、看板列、卡片、拖拽、表格/日历/统计/时间轴/地图视图、Inbox/Planner 面板、过滤和 mock 分享等能力。

但它还不能被视为正式项目管理模块，原因是：

1. PRD 与当前实现命名、路由和数据模型不一致：旧 PRD 写的是 `/app/projects`、拆分实体 schema 和卡片详情；当前实现是 `/app/board` + `usePref("xai_boards_v2")` 单 blob。
2. 当前卡片能力仍偏展示：可新增标题、改 due/label/member、拖拽流转，但缺少正式 card detail、描述、评论、附件、真实 checklist 编辑、归档、列表重排、成员/权限。
3. 数据未接入正式同步：Web 当前是本地偏好存储，不是 Web 子 PRD 要求的 encrypted blob / sync push-pull / cross-device sync。
4. 协作和集成是 stub 或未接：Share 是 mock URL；Power-Up / integrations / automation 没有正式能力；Filter 是 render-only 不持久化。
5. `packages/plugin-project` 拥有更接近桌面项目插件的数据模型和 CardDetail，但 manifest 仅 `windows.control` 且 `enabled:false`，没有接入 Web 当前运行面。

## 2. Current Function Audit

### 2.1 Web 入口与路由

| Area | Evidence | Verdict |
|---|---|---|
| Web shell 注册 | `apps/web/src/routes/modules/shellRegistrations.tsx` imports `boardWorkspacesWebModuleRegistration` and wraps it with `withDisabledFallback(..., "board")`. | 已接入 Web rail。 |
| 模块路径 | `boardWorkspacesWebModuleRegistration.moduleId = "board"` and router resolves `/app/:moduleId/*`. | 实际路径是 `/app/board`，不是旧 PRD 的 `/app/projects`。 |
| Feature toggle | `xai_pref_features_board` in storage registry controls deep-link disabled fallback. | 可开关，但不代表数据删除。 |
| Host route model | `apps/web/src/routes/router.tsx` uses catch-all `:moduleId/*`. | 没有 `/app/projects/:boardId/cards/:cardId` 这样的专门 URL。 |

### 2.2 当前可用功能

| Capability | Current implementation | Usability |
|---|---|---|
| Board/List/Card seed | `makeDefaultBoards()` seeds Personal / Team boards and PM template data. | 可用，适合 demo/first-run。 |
| Kanban board | `BoardView` renders lists and cards. | 可用。 |
| Add card | `addCardToList()` creates a title-only card with mirrored EN/ZH title and empty labels. | 可用但字段不完整。 |
| Add list | `addNewList()` creates a custom list. | 可用但不能 rename/delete/reorder existing lists. |
| Card drag between lists | Native HTML5 DnD writes through `moveCardToList()`. | 可用，跨列移动可持久化。 |
| List color | List actions popover can set/remove 10 colors. | 可用。 |
| Board switcher | `BoardSwitcher` supports search, workspace scope, grouped board grid, delete affordance. | 可用。 |
| Board creator | `BoardCreator` supports Basic Kanban / PM / Blank templates. | 可用。 |
| PM status overview | `StatusOverviewBanner` ring chart uses live list/card distribution. | 可用但统计浅。 |
| Multi-panel mode | Inbox / Planner / Board / Switch Boards bottom controls. | 可用。 |
| Table view | Inline labels, mock members, due picker, progress column. | 部分可用。 |
| Calendar view | Month grid; due-card display; drag card to day rewrites due. | 部分可用。 |
| Timeline view | 30-day bars; pointer drag rewrites start/due. | 部分可用。 |
| Dashboard view | KPI and per-list/per-label charts. | 可用但只基于本地 board data。 |
| Map view | Leaflet + OSM pins for cards with `location`. | 可用但 location 只能来自 seed/schema, 无 UI 编辑。 |
| Filter | Labels / members / due range filter across board views. | 可用但 render-only, board switch resets, not persisted. |
| Share | Modal creates deterministic mock share URL, copyable, emits event. | Stub, no backend/share envelope。 |

### 2.3 静态或未打通部分

| Gap | Current state | Impact |
|---|---|---|
| Card detail | `BoardView` supports optional `onOpenCard`, but `BoardWorkspacesModule` does not wire it. | 点击卡片不能打开正式详情页/弹窗。 |
| Description/checklist real edit | Web board schema only has aggregate checklist count; Table shows progress but不能编辑 checklist items. | Trello card 的核心任务页能力缺失。 |
| Attachments/comments/activity | No UI/data path. | 无法做完整项目协作和过程记录。 |
| Members | Table uses local `MOCK_MEMBERS` u1/u2/u3. | 不是账号/协作者数据。 |
| Labels | Web Board uses `PM_LABELS`; desktop/global `plugin-labels` still In-Dev authority. | 全局 Label 未统一。 |
| Due/start date | Stored as display strings like `5/26`, `Today`, `今天`. | 不能支撑可靠排序、时区、同步和 overdue 计算。 |
| Calendar integration | Board Calendar is internal view; does not feed `@repo/plugin-web-calendar` events. | “项目截止日进入全局日历”未实现。 |
| Todo linkage | No card ↔ task conversion/link. | 项目和任务割裂。 |
| Archive/delete semantics | Board delete exists; card/list archive/delete absent in Web board. | Done 列会堆积，无法整理。 |
| Sync | `xai_boards_v2` local pref only. | 跨设备/账号不一致。 |
| Share/invite permissions | mock URL only; no `/share/:token`, no permission model. | 不能分享真实项目。 |
| Automation | No rules/buttons/scheduled/due-date automation. | 不能自动 move/label/remind。 |
| Integrations | Settings integration flags exist elsewhere as stubs; Board has no integration surface. | GitHub/Calendar/Drive/Slack 等未接。 |

## 3. PRD Check

### 3.1 Existing PRD Documents

| Document | Relevant content | Fit with current code |
|---|---|---|
| `docs/planning/2026-05-12-PRD-v1.md` §5.14 | Defines Trello-style project management: boards, lists, cards, drag, card detail, labels, multi-view, todo/calendar/widget linkage, archive. | Still directionally useful, but outdated for Web current implementation and route/data model. |
| `docs/planning/2026-05-12-PRD-v1.md` §8 | Defines `boards`, `board_lists`, `board_cards`, `board_card_checklist` logical tables. | Not what Web current code uses. |
| `docs/planning/sub-prds/web/PRD.md` §3.1 | Defines `/app/projects`, `/app/projects/:boardId`, `/app/projects/:boardId/cards/:cardId`. | Does not match current `/app/board` module route. |
| `docs/planning/sub-prds/web/PRD.md` §8.1 | Says business tables are logical client models and server stores encrypted blobs. | Correct future direction; not wired into board package yet. |
| `docs/reviews/project-board-scaffold/feature-brief.md` | Old G5-E2 scaffold brief for `plugin-project`. | Desktop/control scaffold, not Web current surface. |
| `docs/reviews/xai-web-board-*` | Roadmap seeds/discovery for board-core/views/workspaces/filter-share-map. | Implementation-level specs exist, but not a user-facing PRD for the formal Project module. |

### 3.2 PRD Verdict

There is no single current PRD that describes the Web “项目” module as it exists today and as it should evolve. The existing PRD is partly superseded by `xai-web-console` rows and partly ahead of implementation.

This document is the supplemental PRD for the formal Web Project module.

## 4. Reference App / Trello Benchmark

This PRD uses Trello as the reference app because the user-provided benchmark describes Trello's project-management core.

Source anchors:

- Trello board/list/card basics: Atlassian support says a board contains multiple lists and lists contain cards.
- Card detail: Atlassian support documents that cards can be opened to edit descriptions, comments, labels, attachments, dates, and related features.
- Calendar/workspace views: Trello Workspace Calendar can show start/due dates from cards across boards and supports filtering by board/keywords/members/due dates/lists/labels.
- Automation: Trello Automation supports rules, card buttons, board buttons, scheduled automation, and due-date automation.
- Power-Ups: Trello Power-Ups add features, connect services, and customize boards.

### 4.1 Capabilities Worth Migrating to XAI Web

| Trello capability | XAI Web fit | Priority |
|---|---|---|
| Board/List/Card as core model | Must keep. It is already the mental model. | P0 |
| Card detail as task page | Must add. This is the biggest current missing piece. | P0 |
| Checklist / due / label / member / attachment metadata | Must add incrementally; metadata should be real fields, not display strings. | P0/P1 |
| Board switcher + templates | Already partly shipped; strengthen with project-type templates. | P0 |
| Multi-view: Board/Table/Calendar/Timeline/Dashboard/Map | Already shipped; should be kept but normalized on typed date/member/label/location fields. | P0/P1 |
| Inbox capture / Planner | Already partly shipped and fits personal command-center workflow. | P1 |
| Automation | Useful, but should start with small rule presets, not a full Butler clone. | P2 |
| Power-Ups / integrations | Useful for Google Calendar, GitHub/Linear, Drive links, Slack; should stay adapter-based. | P2 |
| Workspace/team permissions | XAI v1 is mostly personal/single-user; model should allow future collaboration but not block P0. | P1/P2 |

## 5. Product Positioning

The Web Project module should be:

> A lightweight personal project operating system: use boards to separate projects, lists to model workflow stages, cards to capture actionable work, and views to plan by status, time, table metadata, progress, and location.

It should not be:

- A full Jira replacement with complex dependency graphs, sprint planning, resource allocation, and enterprise permissions in v1.
- A duplicate Todo module. Todo remains lightweight personal execution; Project is for multi-step work that needs status flow and card context.
- A purely visual demo. It must store real card metadata and sync across the user's devices.

## 6. Supplemental PRD

### 6.1 Users

| User | Need |
|---|---|
| Solo builder | Track product, research, immigration/legal, content, and weekly execution boards. |
| Future team collaborator | View shared boards, assigned cards, comments, and deadlines. |
| XAI operator/developer | Use project boards to plan Web module work and release gaps. |

### 6.2 Core Objects

| Object | Required fields |
|---|---|
| Workspace | `id`, `name`, `color`, `ownerAccountId`, `visibility`, `createdAt`, `updatedAt` |
| Board / Project | `id`, `workspaceId`, `name`, `description`, `template`, `cover`, `archived`, `createdAt`, `updatedAt` |
| List | `id`, `boardId`, `name`, `color`, `sortIndex`, `archived` |
| Card | `id`, `boardId`, `listId`, `title`, `description`, `labels`, `members`, `startAt`, `dueAt`, `dueStatus`, `sortIndex`, `cover`, `location`, `linkedTaskIds`, `archived`, `createdAt`, `updatedAt` |
| Checklist item | `id`, `cardId`, `text`, `done`, `sortIndex`, `assigneeId?`, `dueAt?` |
| Attachment/link | `id`, `cardId`, `kind`, `url`, `title`, `createdAt` |
| Comment/activity | `id`, `cardId`, `authorId`, `body`, `eventType`, `createdAt` |

For Web sync, these can remain logical entities packed into encrypted blobs. The UI must stop relying on opaque display strings for dates.

### 6.3 P0 Functional Requirements

| ID | Requirement | Acceptance |
|---|---|---|
| PJ-WEB-01 | Keep `/app/board` as current module route; add route aliases/deep links if `/app/projects` remains PRD canonical. | `/app/board` works; `/app/projects` either redirects or PRD is updated to say current canonical route is `/app/board`. |
| PJ-WEB-02 | Board switcher and board creator remain first-class. | User can create board from template, switch board, and delete/archive board safely. |
| PJ-WEB-03 | Kanban list/card CRUD. | User can add, rename, delete/archive, and reorder lists; add, edit, archive/delete, and reorder cards within and across lists. |
| PJ-WEB-04 | Card detail modal/page. | Clicking any card opens detail with title, description, checklist, due/start date, labels, members, attachments/links, activity notes. |
| PJ-WEB-05 | Typed due/start date. | Dates stored as ISO timestamps; Calendar/Timeline/Dashboard use parsed dates; overdue is derived, not hand-seeded. |
| PJ-WEB-06 | Real checklist editing. | Add/edit/delete/check checklist items; progress shown on card and table. |
| PJ-WEB-07 | Label normalization. | Board card labels use global label model or a clear board-local model with migration path. |
| PJ-WEB-08 | Cross-view consistency. | Edits in Table/Calendar/Timeline/CardDetail write the same card entity and refresh Kanban without reload. |
| PJ-WEB-09 | Local persistence hardening. | Existing `xai_boards_v2` data migrates or is narrowed safely; malformed data never crashes module. |
| PJ-WEB-10 | Sync-readiness contract. | Define logical entity types for board/list/card/checklist/attachment/comment compatible with encrypted blob sync. |

### 6.4 P1 Functional Requirements

| ID | Requirement | Acceptance |
|---|---|---|
| PJ-WEB-11 | Card ↔ Task linking. | A card can create/link to a Task; linked task status appears on card detail. |
| PJ-WEB-12 | Calendar integration. | Project cards with due/start dates can appear in global Calendar module. |
| PJ-WEB-13 | Planner integration. | Planner panel uses real scheduled cards and supports opening card detail. |
| PJ-WEB-14 | Saved filters. | User can persist board filters and clear them. |
| PJ-WEB-15 | Real share envelope planning. | Share modal clearly labels mock mode until backend exists; future share token has permission and expiry model. |
| PJ-WEB-16 | Import/export. | Board export includes boards/lists/cards/checklists/attachments/comments logical entities. |
| PJ-WEB-17 | Responsive/mobile pass. | Board/table/calendar/detail remain usable at mobile widths. |

### 6.5 P2 Functional Requirements

| ID | Requirement | Acceptance |
|---|---|---|
| PJ-WEB-18 | Automation presets. | Simple rules: moving to Done marks complete; due soon adds urgent label; daily sort by due date. |
| PJ-WEB-19 | Integration adapters. | Google Calendar, GitHub/Linear, Drive/link attachment adapters are defined behind settings/integration state. |
| PJ-WEB-20 | Collaboration comments and mentions. | Comments/activity log exists; mention notification can integrate with future collaboration settings. |
| PJ-WEB-21 | Workspace permissions. | Board visibility/private/shared states are explicit. |

### 6.6 Non-goals

- No full Jira/Linear issue tracker in P0.
- No real multi-user permissions until account/device/sync backend is ready.
- No full Trello Butler clone in P0/P1.
- No third-party file upload storage in P0; links only.
- No direct dependency on desktop `@repo/plugin-project` until its In-Dev status and Web runtime boundary are resolved.

## 7. Data and Sync Plan

### 7.1 Current Data

Current Web board uses:

- `xai_boards_v2`: full board array blob.
- `xai_active_board`: active board id.
- `xai_board_panels`: panel state.
- `xai_board_inbox`: inbox cards.
- `xai_board_view_by_id`: per-board selected view.

This is good enough for local demo and first-run state. It is not enough for durable Web product behavior.

### 7.2 Required Future Data Work

1. Define a board entity contract that maps to encrypted blobs:
   - `board.project`
   - `board.list`
   - `board.card`
   - `board.checklist_item`
   - `board.attachment`
   - `board.comment`
2. Add migration from `xai_boards_v2` blob to entity-shaped logical records or wrap the blob with `schemaVersion: 2`.
3. Replace display-date strings with ISO date fields.
4. Add local repository adapter for Web IndexedDB encrypted cache.
5. Add sync outbox mutations for create/update/move/archive.
6. Add conflict rules:
   - Card field edits: last-writer-wins per field.
   - List/card ordering: fractional `sortIndex`; server reconciliation preserves relative order.
   - Checklist/comment append: merge by id.

## 8. Development Task List

### P0: Make Project Usable

| Task | Owner surface | Notes |
|---|---|---|
| `xai-web-project-prd-sync` | docs | Update Web PRD route/data sections to match `/app/board` or add redirect plan. |
| `xai-web-board-card-detail` | `plugin-web-board-workspaces` + `plugin-web-board-core` | Wire `onOpenCard`; add modal/page with title/description/checklist/dates/labels/members/links. |
| `xai-web-board-date-model` | `plugin-web-board-core` + views | Replace due display strings with typed ISO fields and derived labels. |
| `xai-web-board-list-crud` | `plugin-web-board-core` | Rename/delete/archive/reorder lists. |
| `xai-web-board-card-crud` | `plugin-web-board-core` | Rename/archive/delete cards; preserve ordering. |
| `xai-web-board-checklist-editor` | Card detail | Real checklist item CRUD and progress. |
| `xai-web-board-storage-contract` | `plugin-web-storage` / future data driver | Define schema version and migration path for `xai_boards_v2`. |

### P1: Integrate With XAI Web

| Task | Owner surface | Notes |
|---|---|---|
| `xai-web-board-task-link` | board + tasks | SHIPPED: one-way create/link task from board card, with persisted linked status in card detail. |
| `xai-web-board-calendar-feed` | board + calendar | SHIPPED: active dated Board cards appear in Calendar Month/Week/Day as a read-only derived feed. |
| `xai-web-board-saved-filters` | board-workspaces | Persist filters per board. |
| `xai-web-board-share-contract` | board + sync/share | Replace mock URL with explicit share-envelope plan or label it as stub. |
| `xai-web-board-responsive-smoke` | Web shell + board packages | Browser/manual smoke for board views and detail. |
| `xai-web-board-export-import` | export/delete/privacy | Add board entities to export and delete flows. |

### P2: Advanced Trello-Like Extensions

| Task | Owner surface | Notes |
|---|---|---|
| `xai-web-board-automation-lite` | board | Preset rules only; no arbitrary rule builder initially. |
| `xai-web-board-integrations` | settings + board | Calendar/GitHub/Linear/Drive link adapters. |
| `xai-web-board-comments-activity` | board detail | Activity log and comments. |
| `xai-web-board-permissions` | account/sync/share | Private/shared board model. |

## 9. Personal Development Board Updates

Add these cards to the personal development board:

| List | Card |
|---|---|
| Backlog | Web Project PRD drift: `/app/projects` vs `/app/board` decision |
| Backlog | Board typed date model migration |
| This Week | Card detail modal/page for Web Board |
| This Week | List/card CRUD completeness |
| This Week | Checklist editor |
| Waiting | Sync blob driver / IndexedDB encrypted cache dependency |
| Waiting | Global Label authority for board labels |
| Later | Saved filters |
| Later | Calendar feed integration |
| Later | Task/card linking |
| Later | Automation-lite presets |
| Later | Real share envelope |

Do not update generated dashboard snapshots directly. If a dashboard generator consumes roadmap or release-log sources, update the source manifest/release log and regenerate.

## 10. Product Structure / Docs / Skill / Agent Impact

| Surface | Needs update? | Why |
|---|---|---|
| Document library | Yes | This supplemental PRD should be linked from future board feature briefs. |
| `docs/planning/sub-prds/web/PRD.md` | Yes | Route table and project module requirements are stale. |
| `docs/planning/2026-05-12-PRD-v1.md` | Optional | Main PRD remains useful but should add a supersession note for Web-specific implementation. |
| `docs/workflow/roadmap/xai-web-console.md` | Yes, future roadmap row | Current rows are SHIPPED; new gap-closure rows are needed for card detail, date model, sync readiness. |
| `docs/PLUGIN_MAP.md` | Optional | Current package states are correct; add note only if formal Project module status changes. |
| Product structure diagram | Yes | Show Project as `Board core + Views + Workspaces + Card detail + Data/sync adapter`, not only board-core/views/workspaces. |
| Personal dev dashboard | Yes | Add task cards via source manifest/release log, not generated state. |
| Skill / Agent pages | No immediate change | Existing feature brief / roadmap loop skills are enough. Add a dedicated Project module skill only after repeated project-board feature work appears. |

### 10.1 Follow-up Updates Applied 2026-06-03

| Surface | Update applied |
|---|---|
| Web PRD | `docs/planning/sub-prds/web/PRD.md` now documents `/app/board` as current route truth and `/app/projects*` as planned alias/deep-link work. |
| Product module map | `docs/PLUGIN_MAP.md` now clarifies that the current Web Project surface is the `plugin-web-board-*` family, while `@repo/plugin-project` remains desktop/control reference. |
| Product structure diagram | `docs/SYSTEM_ARCHITECTURE.md` now includes the Web Project/Board module ownership diagram and future card-detail/sync boundary. |
| Personal development board | `docs/workflow/roadmap/xai-web-project-module.md` now records the P0/P1/P2 task queue and list mapping for follow-up execution. |
| Workflow docs | `docs/workflow/project/usage-guide.md` now allows targeted follow-up manifests when they cite a concrete audit/PRD source. |
| Skill / Agent pages | No change applied; current `xai-feature-full-loop` / `xai-roadmap-loop` skills remain sufficient. |
| Task link implementation | `xai-web-board-task-link` shipped one-way Board-card to Tasks linkage and moved the next personal-board focus to `xai-web-board-calendar-feed`. |
| Calendar feed implementation | `xai-web-board-calendar-feed` shipped read-only Calendar projection from Board `xai_boards_v2` storage through board-core public helpers; the next personal-board focus is `xai-web-board-saved-filters`. |

## 11. Acceptance Criteria for the Next Implementation Wave

- [ ] Card click opens a real card detail modal/page.
- [ ] Card title, description, due/start date, labels, members, and checklist edits persist and show consistently across Board/Table/Calendar/Timeline/Dashboard.
- [ ] List rename/delete/archive/reorder works.
- [ ] Card archive/delete and within-list reorder works.
- [ ] Dates are typed ISO fields; `Today`, overdue, week, and calendar grouping are derived.
- [ ] Current local data migrates without losing existing boards.
- [ ] `/app/projects` vs `/app/board` route decision is documented and tested.
- [ ] Share remains clearly marked mock unless real share backend is implemented.
- [ ] Targeted tests pass for board-core, board-views, board-workspaces, and app router integration.

## 12. Sources

- Trello create-board/list/card structure: https://support.atlassian.com/trello/docs/creating-a-new-board/
- Trello add/edit card behavior: https://support.atlassian.com/trello/docs/adding-cards/
- Trello workspace calendar/filter behavior: https://support.atlassian.com/trello/docs/workspace-calendar-view/
- Trello automation types: https://support.atlassian.com/trello/docs/automation-overview/
- Trello automation overview page: https://trello.com/butler-automation
- Trello Power-Ups: https://support.atlassian.com/trello/docs/enabling-power-ups/
