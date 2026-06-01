# Web 功能追溯审计 — Traceability Audit

> Skill: `xai-feature-dossier-sync` · Mode: `audit`（只读，未写任何 `prd.md`/源码）
> Date: 2026-06-01 · Scope: `web` · Branch: `web`
> 证据来源：`git status` / `git log` / `packages/*/docs/dev_log.md` / `docs/reviews/*` /
> `docs/workflow/project/release-log.md` / `docs/workflow/roadmap/*`

## 0. 结论摘要

| 维度 | 状态 | 证据 |
|---|---|---|
| 每轮修改是否回写文档（设计层面） | 有机制 | `dev_log.md` 是状态真相源；feature-plan `Increment` 模式追加 Iteration |
| 当前 checkout 是否已回写 | 否 | 审计时 46 → 复核 44（39 modified + 5 untracked），0 个 `dev_log/docs/reviews` 在内 |
| 功能级 PRD 是否存在 | **缺失** | 功能级 `docs/product/<feature>/prd.md` = 0；规划层 `docs/planning/sub-prds/{web,sync,console}/PRD.md` 已存在 3 个 |
| 源码↔文档目录一致性 | **结构性断裂** | 9+ 功能源码在 `plugin-web-*`，dev_log 遗留在 `xai-web-*` |
| 发布级记录 | 缺历史功能 | `release-log.md` 无 tasks/calendar/pomodoro 等任何条目 |

## 1. 头号发现：源码/文档目录分裂（追溯断链根因）

存在一次**未完成的 `xai-web-*` → `plugin-web-*` 迁移**：源码迁到了 `plugin-web-*`，
四件套文档大多遗留在 `xai-web-*`。按单一包名无法完成"源码→文档"追溯。

| 功能 | 源码位置 | `plugin-web-*/dev_log` | `xai-web-*/dev_log` | 风险 |
|---|---|---|---|---|
| ai-chat | `plugin-web-ai-chat/src` | 无（连 docs 目录都没有） | 有 | 文档与源码完全分家 |
| board-core | `plugin-web-board-core/src` | 无 | 有 | 分家 |
| board-views | `plugin-web-board-views/src` | 无 | 有 | 分家（本轮 dirty） |
| board-workspaces | `plugin-web-board-workspaces/src` | 无 | 有 | 分家 |
| countdown | `plugin-web-countdown/src` | 无 | 有 | 分家（本轮 dirty） |
| pomodoro | `plugin-web-pomodoro/src` | **有** | 有 | **dev_log 分叉成两份** |
| settings-rest | `plugin-web-settings-rest/src` | **有** | 有 | **dev_log 分叉两份**（本轮 dirty） |
| settings-shell | `plugin-web-settings-shell/src` | 无 | 有 | 分家 |
| statistics | `plugin-web-statistics/src` | 无 | 有 | 分家 |
| storage | `plugin-web-storage/src` | 无 | 无 | 基础设施，无需 PRD，但 dev_log 全缺 |
| tokens | `plugin-web-tokens/src` | 无 | 无 | 基础设施，无需 PRD |

未分裂（源码+文档同在 `xai-web-*`，状态健康）：`tasks` `calendar` `matrix`
`meditation` `habits` `pet` `cmdk` `dashboard-grid` `dashboard-widgets`。

**处置建议**：分裂功能在补 PRD 前，先确定 canonical 包名（建议统一到 `plugin-web-*`，
即源码所在地），把 `xai-web-*/docs` 的历史合并过去；`pomodoro`/`settings-rest` 两份
dev_log 必须人工裁决哪份为真相，禁止机器自动合并。

## 2. 当前 dirty：代码已动、文档零同步（审计时 46 / 复核 44）

> 数字校准：审计执行时刻为 46；codex 复核与本次复算为 44（39 modified + 5 untracked，
> 5 个 untracked 即本次新增治理产物）。差异来自审计与复核的时间点不同。

`git status` 复核 44 个 dirty，其中 0 个是 `dev_log.md` / `docs/reviews/*`。
按功能归组（治理类文件 AGENTS/CLAUDE/workflow/githooks 已剔除）：

| 功能/模块 | dirty 源码（节选） | 应回写 dev_log |
|---|---|---|
| calendar | `CalendarModule.tsx` + 2× AI subscriber | `xai-web-calendar/docs/dev_log.md` |
| tasks | `TasksModule.tsx` | `xai-web-tasks/docs/dev_log.md` |
| dashboard-grid | `DashboardModule.tsx` + sanitizeOrder + useDashOrder + 3 测试 | `xai-web-dashboard-grid/docs/dev_log.md` |
| dashboard-widgets | `isTaskColsRecord.ts` `notifications.ts` | `xai-web-dashboard-widgets/docs/dev_log.md` |
| matrix | `usePersistedMatrix.ts` | `xai-web-matrix/docs/dev_log.md` |
| meditation | `MeditationPlayer.tsx` `styles.css` | `xai-web-meditation/docs/dev_log.md` |
| cmdk | `CommandPalette.tsx` `navigateToHit.ts` | `xai-web-cmdk/docs/dev_log.md` |
| ai-chat | `claudeStreamAdapter` `llmProvider` `secretStore` + 2 测试 | **断链**，先定 canonical 包 |
| board-views | `MapView.tsx` `TableView.tsx` `index.ts` | **断链** |
| countdown | `computeDaysUntil.ts` | **断链** |
| settings-rest | `CallbackPage.tsx` `aiPane.tsx` | **断链（双份 dev_log）** |

> 注：这些可能是并行 agent 的中途态；但在回写前不能视为已被文档追踪。

## 3. PRD 层缺口

- 功能级 canonical PRD（`docs/product/<feature>/prd.md`）= 0，`docs/product/` 目录尚未建立。
- 规划层 PRD 已存在 3 个：`docs/planning/sub-prds/{web,sync,console}/PRD.md`（顶层/子产品规划，
  非功能级；不替代单个用户可感知功能的 PRD）。
- `feature-plan` 模板 `Required Output`（246–254 行）不含 `prd.md`——功能级 PRD 从来不在产物链里。
- 需要 PRD 的用户可感知功能（约 11 个）：清单 tasks、日历 calendar、番茄钟 pomodoro、
  倒数日 countdown、习惯 habits、四象限 matrix、冥想 meditation、桌宠 pet、
  仪表盘 dashboard(grid+widgets)、AI 对话 ai-chat、统计 statistics。
- 不需要 PRD 的基础设施：event-bus、persistence-contract、tokens(-and-i18n)、shell、
  cmdk、storage、board-core、build-form-adr。

## 4. 发布级记录缺口（Ship-not-logged）

`release-log.md` 现有条目全部是 `project-system / dev-dashboard / admin`；最早条目即
"发布日志 skill"（2026-05-30，机制诞生日）。**tasks/calendar/pomodoro 等历史功能
ship 时机制尚未存在，从未补登**。以后这些功能的可见增量 ship 应补 release-log。

## 5. 追溯矩阵示范（feature: tasks — 文档最健康的正面样板）

| Requirement | Source | Implementation | Tests | Doc status |
|---|---|---|---|---|
| 4 桶 DnD 看板 + 日期改写 + 持久化 | dev_log P1–P3（SHIPPED） | `TasksModule` + `tasksReducer` + `dateForCol` | T-SEED/T-DC/T-RD/T-PER | 缺 PRD 条目 |
| 任务卡片创建 | roadmap `xai-web-tasks-card-create.md`（+ dev_log Iter，apply 时逐行核对） | `TaskComposer`（待核对） | T-CR-*（待核对） | 缺 PRD 条目 |
| 智能列表过滤 | roadmap `xai-web-tasks-smartlist-filter.md` | 待核对 | 待核对 | 缺 PRD 条目 |
| 本轮 dirty 改动（`TasksModule.tsx`） | **待确认**（无 dev_log/commit 记录本轮要求） | `TasksModule.tsx` | — | gap：无需求来源、无验收 |

> 铁律提醒：标 `待确认` 的行不得凭源码反推需求；apply 阶段需人工补来源或确认丢弃。

## 6. 缺口汇总（按 skill gap 分类）

- `Doc-split`：9+ 功能源码/文档分处 `plugin-web-*` 与 `xai-web-*`（§1）—— **最高优先**
- `Missing-PRD`：11 个用户可感知功能全缺 `prd.md`（§3）
- `Requirement-not-in-PRD`：所有功能的迭代需求只在 dev_log/roadmap，未进 PRD
- `Acceptance-without-test`：本轮 dirty 改动无验收、无对应测试登记（§2）
- `Ship-not-logged`：历史功能无 release-log 条目（§4）

## 7. Backfill Plan（按用户影响 + 阻塞关系排序）

1. **先解分裂（阻塞项）**：裁决 9+ 分裂功能的 canonical 包名；合并/裁决
   pomodoro、settings-rest 的双份 dev_log。不解决则 PRD 归属无法稳定。
2. **建 `docs/product/` + 补核心 PRD**：tasks → calendar → pomodoro（三个最核心、
   文档最全，draft→人审→apply）。
3. **回写本轮 dirty**：每个功能 dev_log 追加本轮 Iteration/Bugfix，登记需求来源与验收；
   `待确认` 项请操作者补来源。
4. **补 release-log**：对已 ship 的可见功能补登发布条目。
5. **固化流程**：把 PRD 写进 `feature-plan` Required Output + `xai-feature-brief`；
   加 pre-commit 软门禁 + ship 硬门禁。

## 8. 待确认（需操作者回答，不可由 AI 代答）

1. 分裂功能 canonical 包名统一到 `plugin-web-*`（源码所在）还是 `xai-web-*`？
2. pomodoro / settings-rest 双份 dev_log，哪一份为历史真相？
3. 本轮 46 个 dirty：是并行 agent 中途态（稍后各自收尾回写），还是需要现在集中补账？
