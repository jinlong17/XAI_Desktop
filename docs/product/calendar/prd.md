# PRD — 日历 / Calendar

> Canonical 产品需求文档。由 `xai-feature-dossier-sync` Mode: apply 反向建立（2026-06-01），
> 基于已审草稿 `docs/reviews/xai-web-calendar/20260601-prd.draft.md`。
> 规则：每条需求保留 `Source:`；后续迭代仅在 §7 追加；未定项诚实标注 `待确认`，不臆造。
> ⚠️ 本 PRD 带一个**未收口的 traceability 异常**（§9 待确认 #1），apply 时按规则诚实保留，不阻塞建立。

| 元信息 | 值 |
|---|---|
| Feature | 日历 / Calendar |
| 产品模块 | web（`@repo/plugin-web-calendar`，目录 `packages/xai-web-calendar/`，未分裂） |
| 当前状态 | 月视图 SHIPPED → 周/日视图 SHIPPED → 事件 CRUD SHIPPED（+ 1 个 `待确认` bugfix） |
| 持久化键 | `xai_calendar_view` / `xai_pref_week_start` / 事件 localStorage |
| 路由 | `/app/calendar` |

## 1. Overview — why / problem solved

Web Console 用户需要一个完整日历：从月视图浏览，到周/日时间网格，再到真正能创建/编辑/删除事件。
本功能把原型 `module-calendar.jsx` 移植为 typed 包，并分三轮把"只读样本日历"演进为"可用日历"。

- Source: `dev_log` block1 Title（"port module-calendar.jsx"）+ `docs/reviews/xai-web-calendar/20260523-discovery-review.md`

## 2. Target users & core scenarios

XAI Web Console 使用者。核心场景：
1. 月/周/日三视图切换浏览日程。
2. 月导航 + deep-link + 节假日渲染 + 周起始设置。
3. 在周/日时间网格看多小时事件块。
4. 创建 / 编辑 / 删除事件，支持简单重复（日/周）。

- Source: `dev_log` block1/block2/block4 Title

## 3. In Scope

### 3.1 月视图（原始移植）
月网格（7 weekday + 35/42 cell）+ 3 视图切换器（Day/Week/Month）+ 样本事件 chips（4 色 mint/amber/blue/violet）
+ today-pill + sample-data banner + shell wiring。

- Source: `dev_log` block1「Web Console — Calendar module (port module-calendar.jsx)」(SHIPPED) + `test.md` AC-RENDER/AC-EVENT/AC-FIXTURE/AC-VIEW

### 3.2 周 / 日视图
用真 Week + Day 视图替换 ComingSoonPanel：7×24 / 1×24 小时行网格、多小时事件块（additive `endTime?`）、
共享 `TimeGrid` 组件、`xai_calendar_view` 持久化、`activeDate` single-source-of-truth 重构、DST + 时区处理。

- Source: `dev_log` block2「Replace ComingSoonPanel with real Week + Day views」(SHIPPED) + `docs/reviews/xai-web-calendar-week-day-views/20260525-discovery-review.md`

### 3.3 事件 CRUD
真创建 / 编辑 / 删除 + 简单重复（daily/weekly）+ localStorage 持久化；
解除 design.md §15.2 HC8（"no event-creation/editing UI"），依 ADR-0010 §D4 P0 carve-out。

- Source: `dev_log` block4「Calendar Event CRUD」(SHIPPED) + `docs/reviews/xai-web-calendar-event-create/20260527-{feature-brief,discovery-review}.md`

## 4. Non-Goals（明示不做）

- v1 月视图不发任何 `web:*` 事件（AC-EVENT-7 grep 守约）。Source: `test.md` AC-EVENT-7
- 其余 Non-Goals 见 `design.md` Hard Constraints（本轮未读全，详 §9）。

## 5. Acceptance Criteria（映射 test ID）

> 完整 AC 见 `packages/xai-web-calendar/docs/test.md`。产品级锚点：

| AC 组 | 内容 | 映射 test 文件 | Source |
|---|---|---|---|
| AC-RENDER-1..6 | 月网格渲染 / 默认 May 2026 / today-pill / banner | `CalendarModule.render` / `MonthGrid` / `CalendarBanner` | `test.md` §2.1 |
| AC-EVENT-1..7 | 事件 chips 数量/颜色/时间 + 不发事件 | `MonthGrid` / `sampleEvents` / `events` | `test.md` §2.2 |
| AC-FIXTURE-1..6 | `SAMPLE_EVENTS` 与 i18n.js byte parity（31 天 / 总 65 / 双语） | `sampleEvents` | `test.md` §2.3 |
| AC-VIEW-1..2 | 3 tab 渲染 + Month 默认 aria-selected | `CalendarToolbar` | `test.md` §2.4 |
| 周/日 + CRUD AC | `待确认`（本轮未读 test.md 全文 >1020 行） | — | `test.md` |

## 6. Owning modules / packages

| 包 | 角色 |
|---|---|
| `@repo/plugin-web-calendar`（`packages/xai-web-calendar/`） | 唯一实现包；单包功能，无 doc-split |
| 依赖 | `@repo/plugin-web-storage` · `@repo/plugin-web-tokens` · `@repo/xai-web-shell` |

## 7. Revision History

| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账，首次建立 canonical PRD | `docs/reviews/xai-web-calendar/20260601-prd.draft.md` | — |
| 2026-05-23 | 月视图 | 月网格 + 视图切换 + 样本事件 | dev_log block1 / discovery calendar | SHIPPED |
| 2026-05-25 | 周/日视图 | 真 Week+Day 时间网格 + endTime + 持久化 | dev_log block2 / discovery week-day-views | SHIPPED |
| 2026-05-27 | 事件 CRUD | 创建/编辑/删除 + 简单重复 | dev_log block4 / brief+discovery event-create | SHIPPED |

## 8. Traceability Matrix

| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 月视图网格 + 样本事件 | dev_log block1 / discovery | `CalendarModule` + `MonthGrid` + `sampleEvents` | AC-RENDER/EVENT/FIXTURE/VIEW |
| 周/日时间网格 | dev_log block2 / discovery week-day | `TimeGrid` + Week/Day views | `待确认`（test.md 周日 AC 段未读全） |
| 事件 CRUD + 重复 | dev_log block4 / brief event-create | event composer + reducer + localStorage | `待确认`（CRUD AC 段未读全） |

## 9. Open Items（诚实标注，非阻塞）

- **🔴 待确认 #1（traceability 异常 — 重要）**：`dev_log` block3 是 BUGFIX「Calendar 工具栏 "+" 按钮无 onClick
  — 用户无法创建任何 event」(Audit Top-10 #2 / C-02)，其 Status 停在 **`FIX_READY`（未 SHIPPED）**；
  但其后 block4 event-create 已 SHIPPED 且实现了创建。
  - **疑问**：block3 的 "+按钮 bugfix" 是否被 block4 event-create **取代/吸收**？
    若是 → block3 应标 `superseded-by event-create`；若否 → 存在一个未收口的 FIX_READY bugfix。
  - **需操作者/原执行者确认 block3 终态**后回写 `dev_log` 与本 PRD §7。
- **待确认 #2**：周/日视图与事件 CRUD 的具体 AC ID（`test.md` >1020 行未读全）→ 补齐 §5/§8 映射。
- **Ship-not-logged**：`release-log.md` 缺日历全部条目（月/周日/CRUD 三次 SHIPPED）→ 建议 `xai-release-log` 补登。
