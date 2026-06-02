# PRD — 清单 / Tasks

> Canonical 产品需求文档。由 `xai-feature-dossier-sync` Mode: apply 反向建立（2026-06-01），
> 基于已审草稿 `docs/reviews/xai-web-tasks/20260601-prd.draft.md`。
> 规则：每条需求保留 `Source:` 追溯；后续迭代仅在 §7 Revision History **追加**，
> 不重写既有正文；未定项诚实标注 `待确认`，不臆造。

| 元信息 | 值 |
|---|---|
| Feature | 清单 / Tasks |
| 产品模块 | web（`apps/web/` + `@repo/plugin-web-tasks`） |
| Owning package | `@repo/plugin-web-tasks`（目录 `packages/xai-web-tasks/`，未分裂） |
| 当前状态 | SHIPPED（4 迭代：v1 → card-create → completion-persist → smartlist-filter） |
| 持久化键 | `xai_task_cols`（`@repo/plugin-web-storage usePref`） |
| 路由 | `/app/tasks` |

## 1. Overview — why / problem solved

Web Console 用户需要把任务按"时间紧迫度"分桶管理，并能直接拖拽改期，而不是手填日期。
本功能把原型 `web design/module-tasks.jsx` 移植为生产级 typed 包：4 列时间桶看板
（逾期 / 未来 7 天 / 更晚 / 无日期）+ 跨列拖拽落下即改截止日 + 浏览器持久化。

- Source: `docs/reviews/xai-web-tasks/20260523-discovery-review.md` §1 Problem framing

## 2. Target users & core scenarios

XAI Web Console 使用者（个人效率场景）。核心场景：
1. 浏览 4 列时间桶任务，每列显示计数与任务卡。
2. 跨列拖拽一张卡 → 落到目标列时自动改写截止日（桶相对，非绝对）。
3. 点击列 `+` 创建任务（标题 / 标签 / 目标桶）。
4. 勾选完成框标记完成，刷新后保持。
5. 点击侧栏智能列表（All / Today / Tomorrow / Next 7 / Inbox / Summary）过滤看板。

- Source: discovery-review §1（行为 1–4）+ `docs/reviews/xai-web-tasks-smartlist-filter/20260528-discovery-review.md`

## 3. In Scope

### 3.1 v1 — 4 桶 DnD 看板（原始移植）
二级侧栏 7 段（v1 中除 Smart Lists 外为装饰）；4 列时间桶
（`overdue` / `next7` / `later` / `nodate`）每列计数 + 任务卡 + 空列拖放提示；
任务卡含 grip / 完成框 / 标题(+sub) / 标签 pill / 日期 pill / inbox 图标；
跨列 HTML5 DnD：目标列 `.drop-target` 高亮 + topbar 拖拽提示 + 落下改期
（overdue=today−3d / next7=+2d / later=+30d / nodate=清空）+ 持久化 `xai_task_cols`。

- Source: `dev_log` block1「Port web Tasks module — 4-bucket DnD board with date-rewrite + persistence」(SHIPPED) + discovery-review §1

### 3.2 card-create — 列 `+` 创建任务
列 `+`（action=add）→ `TaskComposer` 原生 `<dialog>` → 创建卡片（标题必填 / 可选标签 /
目标桶 / 可选带日期）→ prepend 到目标列首 + 持久化。

- Source: `dev_log` block2「Wire column + → TaskComposer → reducer create → persist」(SHIPPED)
  + `docs/reviews/xai-web-tasks-card-create/20260528-{feature-brief,discovery-review}.md`
  + commit `7ea4b32`(EP1) / `9c3d481`(EP2) / `5a1e606`(EP3)

### 3.3 completion-persist — 完成态持久化（bugfix）
勾选完成 → 以 per-card `done?: boolean` 写入 `xai_task_cols`（不新增 registry key）→ 刷新保持。

- Source: `dev_log` block3 BUGFIX「Tasks completion state not persisted (toggle done → refresh → lost)」Audit T-10 (SHIPPED)

### 3.4 smartlist-filter — 智能列表真过滤
侧栏智能列表（All / Today / Tomorrow / Next 7 / Inbox / Summary）真正过滤看板，
纯 view selector（`filterCardsByList`），**不写存储**；无匹配显示诚实空态。

- Source: `dev_log` block4「Make sidebar smart-lists really filter the board」(SHIPPED)
  + `docs/reviews/xai-web-tasks-smartlist-filter/20260528-discovery-review.md`

## 4. Non-Goals（明示不做）

- 触摸 / 指针 DnD（HTML5 仅鼠标，桌面优先）— Source: `test.md` §5
- 自定义列表 / 标签成员过滤（Q1 deferred，行非选中，仅断言 inert）— Source: `test.md` F.4
- 真 Summary 仪表盘（Q2 treat-as-all，仅 identity 行为）— Source: `test.md` F.4
- 任务编辑 / 删除（card-create 范围外）— Source: `test.md` E.4
- 自由格式日期录入（仅桶派生）/ 事件发射（v1 无 channel）— Source: `test.md` §5 / E.4

## 5. Acceptance Criteria（二元可测，映射 test ID）

> 完整 AC 清单见 `packages/xai-web-tasks/docs/test.md`。本节为产品级验收锚点。

| AC 组 | 内容 | 映射 test ID | Source |
|---|---|---|---|
| AC-1..7（v1） | lint/typecheck/test 全绿 + 真机 DnD 改期+持久化往返 + 双语 + 跨列高亮/hint + 跨厂商 | T-DC-1..5 / T-RD-1..7 / T-MOD-1..6 / T-PER-1..3 / T-SEED / T-VAL | `test.md` §4 |
| AC-E1..7（create） | 列+开 composer、空标题拦截、创建落库、空列可建、刷新保持、双语、a11y | T-IDS / T-ADD-1..8 / T-TC-1..7 / T-COL-1 / T-CR-1..3 / T-A11Y-1 | `test.md` §E.3 |
| AC-F1..8（filter） | 各智能列表按谓词过滤、无匹配空态、All 还原、**过滤不写存储**（T-FILT-COUNT 字节一致）、回归不破坏 DnD/create/complete | T-FILT-1..8 / T-FILT-NOMUT / T-FILT-COUNT / T-LIFT-1..4 / T-EMPTY-1..2 / T-REG-NOMUT | `test.md` §F.3 |

> 命脉验收：`T-FILT-NOMUT` + `T-FILT-COUNT` 证明过滤纯只读、绝不改 `xai_task_cols`。

## 6. Owning modules / packages

| 包 | 角色 |
|---|---|
| `@repo/plugin-web-tasks`（`packages/xai-web-tasks/`） | 唯一实现包（组件 + reducer + 纯助手 + seed + 验证） |
| 依赖（不拥有） | `@repo/plugin-web-storage`(usePref) · `@repo/plugin-web-tokens`(i18n) · `@repo/xai-web-shell`(slot) |

> tasks 为单包功能，无 doc-split。

## 7. Revision History

| Date | Iteration | User-visible change | Source | Acceptance delta |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账，首次建立 canonical PRD | `docs/reviews/xai-web-tasks/20260601-prd.draft.md` | — |
| 2026-05-23 | v1 | 4 桶 DnD 看板 + 落下改期 + 持久化 | dev_log block1 / discovery xai-web-tasks | AC-1..7 |
| 2026-05-28 | card-create | 列 `+` 创建任务 + 持久化 | dev_log block2 / commit 5a1e606 / brief+discovery card-create | AC-E1..7 |
| `待确认`（日期/SHA） | completion-persist | 勾选完成态刷新保持 | dev_log block3 BUGFIX Audit T-10 | per-card `done?` 持久化 |
| 2026-05-28 | smartlist-filter | 智能列表真过滤（只读） | dev_log block4 / discovery smartlist-filter | AC-F1..8 |

## 8. Traceability Matrix

| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 4 列时间桶渲染 + 计数 + 双语 | dev_log block1 / discovery §1 | `TasksModule` + `seed/tasksMock` | T-MOD-1..2 / T-SEED-1..4 |
| 跨列 DnD 落下改写截止日 | dev_log block1 / discovery §1.4 | `tasksReducer.moveCard` + `dateForCol` | T-RD-3..6 / T-DC-1..5 / T-MOD-4..5 |
| DnD 结果持久化 `xai_task_cols` | dev_log block1 / discovery §Axis A | `usePref` + `isTaskColsArray` | T-PER-1..3 |
| 列 `+` 创建任务 | dev_log block2 / commit 5a1e606 | `TaskComposer` + `addCard` | T-TC-1..7 / T-ADD-1..8 / T-CR-1..3 |
| 完成态持久化 | dev_log block3 BUGFIX T-10 | per-card `done?` in `xai_task_cols` | T-MOD-3（+持久化回归） |
| 智能列表过滤（只读） | dev_log block4 / discovery smartlist | `filterCardsByList` + activeList lift | T-FILT-* / T-LIFT-* / T-EMPTY-* |

## 9. Open Items（诚实标注，非阻塞）

- **待确认 #1**：completion-persist（block3）的确切 SHIPPED 日期与 commit SHA 未在反向补账证据中定位 →
  查 `dev_log` Work Log / `git log -- packages/xai-web-tasks` 补齐 §7。
- **Ship-not-logged**：`docs/workflow/project/release-log.md` 缺 tasks 全部 4 次 SHIPPED 条目 →
  建议用 `xai-release-log` 补登（独立动作，不在本 PRD 范围）。
