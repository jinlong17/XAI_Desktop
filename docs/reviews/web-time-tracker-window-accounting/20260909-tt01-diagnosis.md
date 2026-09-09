# TT-01 时间窗口相交与未来记录污染诊断

- Module: web；Owner: plugin-web-time-tracker；Related consumer: xai-web-dashboard-widgets。
- Status: FIX_READY（仅诊断，未修改产品）；Severity: P1；Executor: Codex /root/rel02_auth_fix。
- Baseline: 7102f225282028fc59de901b2b634e201558f726。并行其他 owner 的 dirty files 未参与本诊断。
- TODO: TT-01 按查询窗口相交部分拆分时段；TT-03 按小时拆分并统一 Insights、CSV、图表和 widget。本文明确两者重叠边界，不将 TT-03 全部默认为已完成。

## 可重复证据

在仓库根执行：

```sh
TZ=America/Los_Angeles node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-time-tracker-window-accounting/window-reproduction.config.mjs
```

真实 TimeTrackerModule、真实账号作用域与 localStorage repository、真实 getTimeTrackerSnapshot；jsdom/React 与固定时钟，无业务函数 mock。该命令当前退出 1，**9 failed / 2 passed**，日志 `20260909-before.log`。所有断言保留正确业务预期；不是验收绿灯或浏览器 E2E。本次没有 native Chrome 验证，不冒充跨厂商复核。

| 场景 | 正确预期 | 当前实测 |
|---|---|---|
| 4/30 23:50–5/1 00:10，widget 今日 | 10 分钟 | 0 |
| 同记录，主页面今天/前一天 | 各 10 分钟，各关联一条源记录 | 今天 0m · 0，前一天 20m · 1 |
| 明天 13:00–14:00 已结束记录 | 今日/本周/今日条数全 0 | 1 小时/1 小时/1 条 |
| 今天 11:50–12:10，now=12:00 | 10 分钟已发生时长 | 20 分钟 |
| 周日 23:50–周一 00:10，本周 | 10 分钟 | 0 |
| 上月末开始记录，自定义 month-total 卡片 | 10 分钟 | 0m；卡片确实存在 |
| 春 DST 3/7 23:50–3/9 00:10，中间自然日 | 23 小时 | 0m · 0 |
| 秋 DST 10/31 23:50–11/2 00:10，中间自然日 | 25 小时 | 0m · 0 |
| 跨日暂停：前日 5 分钟 + 今日 5 分钟 | 今日 5 分钟，不含暂停 | 0 |
| 对照：恰在今日 00:00 结束 | 今日 0 | PASS |
| 对照：原生 epoch 差/entryDuration 春秋日 | 23/25 小时；TZ offset 对照 | PASS |

## 根因及双视角

行为链：repository 返回原始多 segment 记录 → module/widget 按第一段起点筛选 → 对整条 entry 求和。跨界开始的记录漏入后窗口，开始日期承担整段跨日时长；跨日暂停后的段也漏算。widget 和 week/month 卡片只有下界，因此未来记录也进入当前窗口。`segmentDuration` 对已结束段使用存储 end 而不限制 now，未来 end 提前计时。

架构链：`internal/time.ts:53–67` 只有 entryStart、完整生命周期 entryDuration，没有窗口统计契约；`storage.ts:187–207` 与 `TimeTrackerModule.tsx` 重复各自筛选/求和。Widget 通过 public snapshot 取值，并非另一个可单独修补的数据来源。REL-01 已修 civil-day 日期边界，epoch 时差本身能得到 23/25 小时，根因是**归属/裁剪错误**，不能回退成固定 24h 算日期。

无路由、manifest 或持久化 schema 变更需求；此处双视角是防止 module 与 widget 漏修，不是新增 cloud sync。所有源记录保持原字节，聚合只产生派生结果。

## 完整消费地图（精确语句见 caller-inventory.md）

| 层/功能 | 基线位置 | TT-01 必须处理 | TT-03 重叠/保留语义 |
|---|---|---|---|
| 共享时间函数 | time.ts:53–67 | 新增逐 segment 半开窗口相交，排除未来 | 提供后续按日/小时切片基础；完整计时 API 保持单独语义 |
| Widget snapshot | storage.ts:187–207 → TimeTrackerWidget.tsx:11 | today/week/top category/entriesToday 同窗口聚合 | runningCount/activeTotal 为完整当前任务，不应裁到今日 |
| 主日视图 | Module:565–580 | selectedEntries/selectedTotal/selectedByCategory/todayEntries/todayTotal/weekTotal/trend | 源记录列表与日贡献区分；同一源 id 可在两个相交日显示，编辑仍原记录 |
| 分类/目标与详情 | 1022、1436、1580、1640、2337–2341 | totalByCategory、categorySummaries、CategoryCard、CategoryDetail/Subcategory 按传入窗口计贡献 | 避免只换筛选后又整条求和 |
| 顶部状态 | 1076–1157 | today 状态使用修正 todayTotal | month/year 自然进度和 custom countdown 卡不是记录统计，不强行改成记录窗口 |
| 主趋势 | buildDayTrend:1528–1535 | 每日贡献与 unique entry count | 日窗口必须 civil next day |
| Insights 范围 | 2799–2818 | week/month/year/custom/all 都按相交；上界≤now；rangeTotal/activeInRange 去未来 | 选中范围必须向下游传递，而非只传一组原 entry 后丢掉边界 |
| today/week/month-total | 2960–2992 | 正确本日/本周/本月交集与条数 | 独立固定窗口卡与 report-selected range 保持明确定义 |
| avg-day/days-tracked | 2994–3001 | 活跃自然日由实际正交集得出，非 start-day Set | 平均分母沿用“有记录日”，不是偷偷改为所有日 |
| donut-today/donut-range/cat-ranking | 3003–3009 | 今日或所选窗口的 categorySummaries | legend/tooltip/count 与图一致 |
| goal-progress/sub-split | 3010–3017；3205 | 今日目标、所选范围子类合计 | 目标分母不改，贡献裁剪 |
| by-weekday | 3019–3027 | 先裁 report 范围 | TT-03：跨日按日分摊后按 weekday 汇总；条数按源 id 去重 |
| trend-7d/trend-30d | 3030–3044 | 固定7/30个自然日分别求交集 | 与主趋势一致，无 DAY_MS 步长回归 |
| by-hour | 3046–3055 | 先裁 report 范围、排除未来 | TT-03：现整段落开始小时，必须逐小时分摊 |
| heatmap | 3060；3279–3290 | 固定105日每格正交集 | 跨 DST 按自然日，不使用24h固定长度 |
| range-summary | 3063；3311–3336 | 总时长、分类、日统计、最长贡献使用相同范围 | TT-03：峰值小时须分摊；明确最长“完整 session”或“窗口贡献”标签 |
| category-mosaic | 3066；3391–3402 | categorySummaries 接窗口贡献 | 同 donut/ranking |
| focus-rhythm | 3069；3428–3448 | 先裁 report 范围 | TT-03：hour/category 矩阵按段跨小时分摊 |
| CSV report | exportEntriesCsv:1498–1525；按钮2850 | 不能导出整条 duration 却声称所选范围合计 | TT-03：范围、timezone、raw start/end、窗口 contribution 明确，秒/毫秒保真，展示舍入不能成为业务真值 |
| 删除范围 | InsightsBoard onDeleteRange | 更换 inRange 后会包含跨界源记录，不能静默删掉窗口之外同一 session | 单独传源 ids、确认删除完整记录；不把派生切片保存或当实体删 |
| recent-sessions | 3072；3480–3512 | 当前明确读取 entries 全集，非 report inRange；阻未来进入“已发生最近”须说明语义 | 作为全局原始会话列表保留完整时长，与范围总量不要求直接等同 |
| 当前计时/编辑 | current:2972；ActiveEntry:1823；FocusMode:1941；EntryRow:2004；EntryEditor:2682；entryDetail:1469 | 不把完整任务计时/编辑起终点裁成一天 | now前实际生命周期可限未来；不要用临时切片修改/覆盖源段、丢暂停信息 |

以上覆盖所有 InsightType 分支及 custom card 配置；表是源码消费审查，不代表每张卡均已运行 UI 回归。未来修复验收须逐卡验证，不以本轮11例替代全部。

## 最小完整修复策略

1. 在 time.ts 建立共享只读 projection：每段 `max(0,min(end ?? now, windowEnd, now)-max(start,windowStart))`，半开 `[start,end)`；非 finite、反向、零长度不给贡献。窗口选择与 membership 都来自正贡献；暂停段分别计算，绝不用 firstStart/lastEnd envelope。保留原 entry id。区分 raw lifetime、elapsed lifetime、window contribution 的用途与命名。
2. 统一 window aggregate/projection 对象（source entry + clipped segments/contribution + window bounds/timezone），使下游 category、count、day bucket 不会再次把全长加回来。所有 caller 用共同原语；避免克隆 TimeTrackerEntry 冒充持久化实体。
3. 先迁移 snapshot 与主日/周/月/category/detail/trend，再全量 Insights 固定卡与范围卡，逐项对照上表。日/周/月/year/custom 使用已有 civil helpers；all 上界也裁 now。计数按窗口内正贡献的源 entry id 去重；天数为正贡献 localDateKey。
4. TT-03 与 TT-01 共用同一裁剪源。by-hour/focus-rhythm/range-summary 最佳同批补按 epoch 边界切片，秋季重复小时可聚合到同一 wall-hour 槽，但导出保留 offset 使其可追溯；春季不存在小时不给虚构时长。若单独排 TT-03，必须明确 remaining，不得宣布所有图表口径一致。
5. CSV 与删除不直接复用变形实体。报告 CSV 应有 range start/end、time zone、source id、raw start/end、窗口贡献（保留 ms 或秒）；原始会话导出可另字段保留全长。删除范围确认解释“删除相交的完整记录”，并保持取消/源 id 流；不默认仅删切片。
6. 验收：11正确预期转绿；每一 InsightType、主卡/category/detail、snapshot/widget 同源数据断言；跨周/月/年、custom 正反日期、open/paused 多段、now前后、DST 23/25h、零/反向段边界、跨小时和 tooltip/CSV毫秒合计。确认编辑/删除仍引用原 entry，完整计时跨午夜不中断。再 native Chrome 复核页面+widget一致。

本轮只诊断，不改 schema、import/export 原始数据，不碰 TT-02 编辑多段任务与 TT-04 性能任务；相关编辑保持原记录是本修复不可破坏的约束。重叠记录之间是否合并属于另一产品语义，本策略按每个 session 累加，与现有可并行计时一致。
