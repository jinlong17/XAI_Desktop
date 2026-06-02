# PRD — 仪表盘 / Dashboard

> Canonical 产品需求文档。由 `xai-feature-dossier-sync` Mode: apply 反向建立（2026-06-01），
> 基于已审草稿 `docs/reviews/dashboard/20260601-prd.draft.md`。
> **多包合 1**：仪表盘是一个用户感知功能，由 2 个 npm 包组成（skill 粒度规则）。
> 规则：每条需求保留 `Source:`；后续迭代仅在 §7 追加；未定项标 `待确认`，不臆造。

| 元信息 | 值 |
|---|---|
| Feature | 仪表盘 / Dashboard |
| 产品模块 | web |
| Owning packages | `@repo/plugin-web-dashboard-grid`（目录 `packages/xai-web-dashboard-grid/`）+ `@repo/plugin-web-dashboard-widgets`（目录 `packages/xai-web-dashboard-widgets/`） |
| 当前状态 | SHIPPED（基线 2 包 + 6 轮扩展/bugfix，全部 SHIPPED） |
| 持久化键 | `xai_dash_order` · `xai_clock_style` · `xai_clock_tz` · `xai_zones` · `xai_dashboard_stickies` · `xai_dashboard_weather`（+ 只读消费 4 键） |
| 跨模块事件 | `web:dashboard:add-widget-clicked` · `web:dashboard:widget-added` |
| 路由 | `/app/dashboard` |

## 1. Overview — why / problem solved

把原型 `module-dashboard.jsx` 拆为「栅格壳 + 组件包」两层，提供一个**可拖拽重排、可增删组件、组件可接真实本地数据**的仪表盘：用户在一个页面聚合时钟、统计、日历、世界钟、天气、便签、邮件摘要、Upcoming 等小组件。

- Source: grid dev_log Decision Headline；widgets dev_log Decision Headline；ADR-0007 §S4（predeux split）

## 2. Target users & core scenarios

XAI Web Console 使用者（信息聚合/概览场景）。核心场景：
1. 拖拽重排组件（FLIP 指针拖拽，顺序持久化）。
2. 点"+"从目录添加组件；点组件移除按钮删除并回到目录。
3. 组件展示真实本地数据（统计/Upcoming/迷你历）或诚实空态。
4. 自建便签、手动录入天气；邮件组件显示逾期任务 + 今日日程只读摘要。

- Source: grid discovery §1；widgets discovery §1；real-data/stickies/weather-mail discovery

## 3. In Scope

### 3.1 grid — 栅格壳（基线 row #10）
仪表盘模块壳 `DashboardModule` + `.dash-grid`、双语空态、FLIP 指针拖拽重排（**非** HTML5 DnD / `@dnd-kit`）、`WidgetRegistration[]` 槽位 API、`xai_dash_order` 持久化（`sanitizeOrder` + `useDashOrder`）、shell 注册、`web:dashboard:add-widget-clicked`。**不实现 widget 业务 UI**。

- Source: grid dev_log Phase Progress + ship `2d9655f`/`7691f97`/`7daa255`/`78e1b43`；grid discovery §1/§2

### 3.2 widgets — 组件包（基线 row #11）
导出 `dashboardWidgetRegistrations`（10 个 frozen id/span）：时钟（4 样式/12 时区/analog）、三统计、迷你历、世界钟、天气（fixture）、便签（fixture）、邮件（fixture）、Upcoming。通过一行改 grid `registration.tsx` 注入。

- Source: widgets dev_log Title + ship `9a78d17`/`b4bcf22`/`95bbdc8`/`e9891de`；widgets discovery §1/§3

### 3.3 add-widget-picker（gap-closure row #5）
原生 `<dialog>` 组件目录，从目录添加组件 → 写 `xai_dash_order` → 发 `web:dashboard:widget-added`。无新 storage key、无分类筛选 v1。

- Source: grid dev_log「gap-closure row #5」Lineage + ship `4379897`/`be9b652`/`57d93ad`；add-widget-picker discovery

### 3.4 组件移除（Audit Top-10 #9 / D-06）
WidgetShell 移除按钮：从栅格 + `xai_dash_order` 去除组件，并使其回到 AddWidgetPicker 可选目录。

- Source: grid dev_log 顶栏 Status Panel + BUGFIX Lineage ship `48acd92`/`60aabb3`/`e6b483a`/`69d0979`
- 注：验收 AC-RM-1..7 仅在 dev_log，未进 `test.md`（见 §9）。

### 3.5 便签自建（stickies-create §E）
便签库 `xai_dashboard_stickies` CRUD + `<dialog>` 创作/删除；空库显示 fixture 样例。无 edit/reorder/pin。

- Source: widgets dev_log §E + ship `baaf3e1`/`5b1a8e9`/`a1f8ce9`/`4f2bf24`；stickies-create discovery §2/§3

### 3.6 真实数据接入（real-data §F）
5 个组件只读接真实本地库（三统计读 `xai_task_cols`/`xai_pomodoro_sessions`/`xai_habits_state`；Upcoming + MiniCal 读 `xai_calendar_events`）+ 诚实空态。零 registry 编辑、零写入。

- Source: widgets dev_log §F + ship `aaa08c6`/`34e2fab`/`f076ac7`；real-data discovery §2/§3

### 3.7 天气手录 + 邮件摘要（weather-mail §G）
天气组件手动录入 → `xai_dashboard_weather`（singleton）；邮件组件保留 id、正文改为「逾期任务 + 今日日程」只读通知摘要（读 `xai_task_cols` + `xai_calendar_events`）。

- Source: widgets dev_log §G + ship `f0ffdaa`/`0e68b61`；weather-mail brief + discovery

## 4. Non-Goals（明示不做）

- grid 不交付 widget 本体；不改 storage registry（`xai_dash_order` 只消费）。Source: grid discovery §1/§2/§5.6
- 不用 HTML5 DnD / `@dnd-kit`（强制 FLIP 指针）。Source: grid discovery Axis B
- add-widget：无新 key、无分类筛选 v1、无"恢复默认"、Remove 与 picker 解耦。Source: add-widget-picker discovery §7/§10
- real-data：无新 key/无写/无外部 API；不统一各源"今日"时区基准。Source: real-data discovery §2/§3
- weather-mail：无真实天气 API / 真实邮箱 / 推送 / 跨设备同步；Mail 不写 foreign keys、不重命名 widget id；countdowns DEFER。Source: weather-mail brief §Out of scope + discovery §3.4
- widgets v1：features-panel 组件开关 Out of scope（always-on）。Source: widgets discovery Q6

## 5. Acceptance Criteria（映射 test ID）

> 完整 AC 见 `packages/xai-web-dashboard-grid/docs/test.md` + `packages/xai-web-dashboard-widgets/docs/test.md`。锚点：

| 包/层 | AC/test 组 | Source |
|---|---|---|
| grid 基线 | AC-RENDER/LANG/SLOT/PERSIST/DRAG/EVENT/REG/TYPES/BARREL/HOST | grid test.md §2.1–2.10 |
| grid add-widget | AC-AWP / AC-AWO / AC-DMP / AC-EVT-EXT | grid test.md §9.3 |
| grid remove | AC-RM-1..7 **（仅 dev_log，未进 test.md — 见 §9）** | grid dev_log BUGFIX Lineage |
| widgets 基线 | AC-PKG/REG/CLOCK/ANALOG/STATS/MINICAL/WORLDCLOCKS/WEATHER/STICKIES/MAIL/UPCOMING/HOST/FIXTURES/CITYLIB | widgets test.md §2 |
| widgets §E | AC-STORE/IDS/COMPOSER/HOOK/STICKIES-CREATE/REGISTRY-STICKIES | widgets test.md §E |
| widgets §F | AC-RD-*/STATS-REAL-*/UPCOMING-REAL/MINICAL-REAL | widgets test.md §F |
| widgets §G | AC-WSTORE/WEDITOR/WHOOK/WEATHER-REAL/REGISTRY-WEATHER/RD-OVERDUE/TODAY/COMBINE/MAIL-REAL/EMPTY/READONLY | widgets test.md §G |
| 跨厂商 | 手测矩阵 **DEFERRED** 至 pre-cloudflare-ship | 各 Status Panel「Cross-Vendor Manual Smoke: DEFERRED」 |

## 6. Owning modules / packages（多包合 1）

| 包 | 目录 | 角色 | 用户可见? |
|---|---|---|---|
| `@repo/plugin-web-dashboard-grid` | `packages/xai-web-dashboard-grid/` | 栅格壳 + 拖拽 + `xai_dash_order` + Picker + Remove + 事件 | 是（栅格/拖拽/增删） |
| `@repo/plugin-web-dashboard-widgets` | `packages/xai-web-dashboard-widgets/` | 10 组件 + stickies/weather store + dataReads（只读消费） | 是（各组件） |

> 注：包名为 `plugin-web-dashboard-*` 但源码/文档目录仍为 `xai-web-dashboard-*`（命名与目录不一致，但 doc 与 src 同目录，无 doc-split 残留）。

## 7. Revision History

| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账，首次建立 canonical PRD | `docs/reviews/dashboard/20260601-prd.draft.md` | — |
| 2026-05-23 | grid 基线 #10 | 栅格壳 + FLIP 拖拽 + `xai_dash_order` | grid dev_log；`2d9655f`等 | SHIPPED |
| 2026-05-23 | widgets 基线 #11 | 10 组件接入 | widgets dev_log；`9a78d17`等 | SHIPPED |
| 2026-05-24 | grid 契约修补 | design/api 同步 + 跨厂商脚手架（曾 FIX_READY） | grid dev_log Work Log | SHIPPED |
| 2026-05-25 | add-widget-picker | `<dialog>` 添加组件 + `widget-added` | grid dev_log gap-closure #5；`4379897`等 | SHIPPED |
| 2026-05-28 | stickies-create §E | 便签自建库 CRUD | widgets dev_log §E；`baaf3e1`等 | SHIPPED |
| 2026-05-28 | real-data §F | 5 组件接真实本地库只读 | widgets dev_log §F；`aaa08c6`等（曾 BLOCKED） | SHIPPED |
| 2026-05-28 | 组件移除 D-06 | WidgetShell 移除按钮 | grid dev_log BUGFIX；`48acd92`等 | SHIPPED |
| 2026-05-29 | weather-mail §G | 天气手录 + 邮件摘要 | widgets dev_log §G；`f0ffdaa`等 | SHIPPED |

## 8. Traceability Matrix

| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 栅格壳 + 拖拽 + 持久化 | grid dev_log / discovery | `DashboardModule` + `useDashOrder` + `sanitizeOrder` | AC-RENDER/DRAG/PERSIST |
| 10 组件注册 | widgets dev_log / discovery | `dashboardWidgetRegistrations` | AC-REG/CLOCK/… |
| 添加组件 | grid gap-closure #5 | `AddWidgetPicker` | AC-AWP/EVT-EXT |
| 移除组件 | grid BUGFIX D-06 | `WidgetShell` remove | AC-RM-1..7（仅 dev_log） |
| 便签自建 | widgets §E | `stickiesStore` + `StickyComposer` | AC-STICKIES-CREATE |
| 真实数据接入 | widgets §F | `dataReads/` 只读 | AC-RD-* |
| 天气手录 + 邮件摘要 | widgets §G | `weatherStore` + `WeatherEditor` | AC-WEATHER-REAL/MAIL-REAL |

## 9. Open Items（诚实标注，非阻塞）

- **Ship-not-logged**：`release-log.md` 缺 dashboard 全系列 SHIPPED → 本轮 `xai-release-log` 补登。
- **AC-RM 未进 test.md**：组件移除 AC-RM-1..7 仅在 grid dev_log BUGFIX Lineage，`test.md` 无 AC-RM 节 → 建议走 bugfix/feature 流程回写（非本技能范围）。
- **Cross-vendor manual smoke = DEFERRED**：全系列手测矩阵延期至 pre-cloudflare-ship（与 `xai-web-deploy-cloudflare` READY_TO_SHIP 前置存在未闭合项）。
- **🟡 待确认 #1**：Clock / WorldClocks 在 §F/§G 之后是否仍为"纯 fixture + 三键 prefs"——文档未声明后续 real-data 迭代；若主张"全仪表盘无 mock"，需查 roadmap/carve-out。
- **🟡 待确认 #2**：grid `useDashOrder.removeWidget` 元组 API 与 `DashboardModule.removeWidgetFromOrder` 双路径是否为对外长期契约（dev_log 注记为 intentional hybrid，api.md remove 章节本轮未核对）。
