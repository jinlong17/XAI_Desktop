# REL-01 — Web 本地自然日与时钟合同诊断

- Module: web
- Baseline: `b7623a130827ed16485bdb1f8719dcf33dea7436`
- Date: 2026-09-09
- Severity: P1
- Target: web-local-time-contract
- Source: `docs/reviews/20260908-full-product-audit/TODO.json` REL-01、`02-tasks-time-boards.md`、`03-web-data-ai-settings.md`
- Scope: Tasks / Habits / Calendar / Statistics / Metrics / Time Tracker，共享 owner 为现有 `@repo/plugin-web-tokens`。
- 本文是当前源码核对与修复策略；没有修改产品实现，没有声称通过验收。

## 症状与当前证据

同一浏览器同一时刻，各功能的“今天”可能不同。页面长期开着跨午夜，一部分视图不刷新；固定 24 小时会误算 DST 自然日。Tasks 的今天根本不是日期筛选。

| 功能 | 当前代码与根因 | 既有验证局限 |
|---|---|---|
| Tasks | `packages/xai-web-tasks/src/internal/filterCardsByList.ts:97` 将 today/tomorrow 映射 overdue/next7，`_now` 未使用；types.ts 仅 yearless date/dateZh；dateForCol.ts 自动生成 -3/+2/+30 天展示字符串 | 现有26条筛选与5条日期测试通过，但断言旧分桶行为，不能证明真实日期正确 |
| Habits | `internal/dateKeys.ts` 的 utcDateKey/monthKey/weekDates 使用 UTC；`computeStreak.ts` 使用UTC today；HabitList/HabitDetail自行 new Date，模块不调度午夜刷新 | 多数fixture处于UTC中午，无法暴露洛杉矶夜间/上海凌晨差异；日历纯日期 Date 载体与真实瞬间混用 |
| Calendar | `CalendarModule.tsx:82` mount 时计算UTC todayKey并永久memo；`internal/timeGridMath.ts:39` 硬编码2026 Pacific DST表 | 本次2个文件7测试通过；只锁定2026给定日期和初次页面，不证明其他时区/年份/午夜 |
| Statistics | `StatisticsModule.tsx:94` now永久memo；rangeWindow.ts UTC窗口+86400000日增量；aggregators.ts:64-66 UTC日键、190 UTC小时 | 既有rangeWindow/heatmap/aggregators测试主要验证旧UTC口径，需改为明确TZ矩阵 |
| Metrics | `MetricTrackerModule.tsx:129` now永久memo；`internal/date.ts` 本地startOfDay正确但 todayEnd固定+DAY_MS-1 | 尚无独立date边界测试；不能以指标数值测试证明日期正确 |
| Time Tracker | `internal/time.ts` 已使用本地 dayKey；Module.tsx:379 todayRemaining仍startOfDay+DAY_MS；3279热图起始按固定日长回退 | time.test.ts仅普通5月本地day/week；跨日segment分摊为TT-01等独立问题，不能据此宣称本项修完全部计时统计 |

## 可稳定复现

环境：Node，`TZ=America/Los_Angeles`。这是对源码日期表达式的独立最小复现，非浏览器全流程验收。

1. 输入 `2026-09-09T06:30:00Z`。当前 Habits/Calendar UTC日键为 `2026-09-09`；TT本地日键为 `2026-09-08`。预期六包均为 `2026-09-08`。
2. 输入本地 `2026-03-08T00:00:00`。下一自然日相差23小时；固定+24h-1得到3月9日00:59:59，预期3月8日23:59:59。
3. 输入本地 `2026-11-01T00:00:00`。下一自然日相差25小时；固定+24h-1得到11月1日22:59:59，预期23:59:59。
4. Calendar/Statistics/Metrics于23:59挂载，仅推进时钟越过午夜而不改数据，memo的today/now不重新计算（源码明确）；修复测试须挂载真实组件证明更新。
5. UTC或Asia/Shanghai下Calendar查询2026-03-08仍返回23小时，实际应24；这是硬编码表直接行为，修复须覆盖多时区及2027。

已运行：Calendar `CalendarModule.dst-recurrence.test.tsx` + `CalendarModule.activedate.test.tsx` 共7通过；Tasks `filterCardsByList.test.ts` + `dateForCol.test.ts` 共31通过。绿灯说明旧合同被测试固化，不代表REL-01已解决。

## 统一合同与明确owner

现有 `@repo/plugin-web-tokens` 已是六包直接依赖，包含Web共同展示/i18n/DOM helper且依赖React。新增 `src/localDate.ts` 与 `src/useLocalDayClock.ts`，只从public index导出；不创建业务到core，不从其他feature internal导入。

1. 当前用户时区定义为浏览器/设备本地时区。当前 `xai_pref_dt_timezone` 是boolean显示开关，不是IANA zone，不得重解释其持久化值。没有已实现的手动zone选择；将来增加时区选择需独立扩展合同。
2. `YYYY-MM-DD` 是自然日身份，不是UTC瞬间。全天事件、习惯check-in和任务dueDate保持日期字符串，不能经 `new Date(key).toISOString()` 迁移；既有日键保持不变，历史没有原始时区时不能猜测并平移一天。
3. 真实瞬间用epoch ms或带Z/offset ISO，例如TT segment、metric.measuredAt、session.finishedAt；按当前本地日边界聚合。日期网格内部UTC载体可保留，但命名/注释必须明确其只是Gregorian calendar arithmetic，而不是当前真实时间。
4. 窗口使用 `[start,nextStart)`；若现有API需要inclusive end，仅在边界适配为nextStart-1。自然日递增使用日历算术，不能用固定86400000。
5. 建议API：`localDateKey(Date|number): string`；`parseLocalDateKey(string): Date|null`（严格校验日历日期）；`addLocalDays(Date,n): Date`；`startOfLocalDay(Date|number): Date`；`nextLocalDayStart(Date|number): Date`；`useLocalDayClock(): { now: Date; dayKey: string }`。API名可实现期统一，但owner/语义不能变。
6. hook按下一本地午夜定时，visibilitychange（visible）、focus、pageshow恢复时重新采样并重设定时器；提供低频校准应对系统时区/时间改变；卸载清理。需要实时秒显示的TT沿用其自身tick，纯日期UI用同一日合同。不声称浏览器关闭后JS仍执行；重开基于墙钟恢复。

## 顺序修复策略（完成全部阶段才核销REL-01）

### S1 共享合同与边界测试

- tokens新增公共helper/hook及文档，断言日期非法值、闰日、年末、DST23/25小时；UTC/Pacific/Shanghai与Australia/Lord_Howe半小时DST覆盖。
- hook断言午夜刷新、后台恢复、时区变化校准、timer/listener清理。可选的clock seam必须保持真实运行路径。

### S2 六包日期与午夜刷新接线

- Habits：从父组件提供同一clock给HabitList/Detail；真实now转本地day/month，week/streak/recentDays围绕自然日key运算。保留历史checkIns/diary键，已有UTC纯日期grid载体不能盲换getters；更新旧“UTC消除DST”误导性注释。
- Calendar：todayKey从共享hook取得；activeDate由用户选择，午夜不能强制把正在查看历史的页面跳回今天。补当前时区动态日长/小时布局，去除2026 Pacific假设。优先按本地真实小时区间生成布局，不能仅把硬编码2个日期换成另一个23/25数组；非整小时转换不能被错误归为24。
- Statistics：now hook +本地window/day/hour聚合；Calendar Date carrier与instant区分；热图按自然日key，与Habits同一日。实际focus duration属于STAT/POMO后续项，本阶段不要混为已修。
- Metrics：now hook、day end=nextLocalDayStart-1、今天/昨天快捷值随时间恢复重算；保持measuredAt绝对时刻语义和历史数据。
- TT：本地helper统一；todayRemaining、热图日期迭代、涉及日窗口端点改为自然日；日选中状态不得被午夜错误重置。segment跨日拆分仍需TT-01专门验证。

### S3 Tasks真实日期最小闭环

单加clock不能满足“Tasks今天一致”。新增可选 `dueDate: YYYY-MM-DD`，创建/详情编辑能够写入真实日；筛选today（含明确过期项，按产品今天+逾期语义）、tomorrow（精确下一天）、next7（未来自然日窗口）使用dueDate与当前clock。移动桶的日期变更须是明确用户行为且一致更新dueDate；纯列表/排序移动不应伪造日期。保留未提供dueDate的旧yearless展示记录，不猜年份、不在精确日期视图冒充今天；仍在All/原始列表可见，可手动补日期。同步narrowing/持久化/Board映射以免字段丢失，测试原始数据不被selector改写。此范围与TASK-01重叠，应记录覆盖证据，不双算完成。

### S4 合同文档、回归与独立verify

- 修改各包design/api/test与dev_log对UTC/固定日长的过期声明；跨包bug记录维护实际阶段。
- 运行六包+tokens受影响测试、Web types/build；在TZ=UTC、America/Los_Angeles、Asia/Shanghai运行日期合同及代表性集成测试。年度/闰年、Pacific2027、Lord_Howe覆盖可由边界suite完成。
- 浏览器六功能同一时刻一致，挂载跨午夜、后台后返回/重开、日期picker保持用户选择；保留历史记录键和瞬间的fixture roundtrip验证。
- 既有测试若把错误行为当预期必须依据本合同改写，同时保留场景强度；不能删除难测断言得到绿灯。

## 风险、边界与验收表

| 验收要求 | 必须提供的证据 |
|---|---|
| 六包同一瞬间今天一致 | 至少UTC、Pacific午夜前、Shanghai午夜后的六包调用/视图证据 |
| DST按下一自然日 | 23h、25h、24h、23.5h/24.5h实际边界测试；Calendar显示不能伪造 |
| 午夜与恢复正确 | 真实组件fake clock跨日、focus/visibility/pageshow；浏览器返回检查 |
| 全天天然日不漂移 | 日期键跨TZ保持身份，历史fixture不重写 |
| 绝对时刻保持 | metric/TT/session ISO/epoch roundtrip不改，聚合local day正确 |
| Tasks日期可信 | create→edit→move→persist→today/tomorrow/next7闭环及无dueDate旧数据可见 |
| 无架构漂移 | 六包仅import tokens public API，无core/host业务迁入，无循环依赖 |

本项仅device-local计算与展示，不引入账号云同步；Web→Desktop后续传播仍走D3。不得把离页提醒、TT跨日分摊、Pomodoro持久恢复、账户隔离等后续TODO标为REL-01完成。
