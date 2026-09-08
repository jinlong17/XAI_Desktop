# 任务、时间、日历与全部 Board 子功能审查

审查基线：`web@9257be40c03216b1006691bfa289bd29d6dfe839`，2026-09-08。产品归属为 `web`。本报告只审查、保存审查证据，没有修改产品代码。运行态判断来自当前源码与合成数据测试；真实浏览器番茄钟刷新证据由父审查提供。测试不访问用户的真实 localStorage。

## 结论

当前不是统一的“离开页面也会持续执行”的生产力后台。Time Tracker 可以凭已保存的开放时间段恢复累计时长；番茄钟的运行状态未持久化；冥想使用逐次回调计数，后台节流会延迟结束；习惯和日历的提醒只保存选项；Board 自动化只在看板页面的 effect 或手动点击中运行。日历、任务、习惯、Board 数据能留在同一浏览器的本地存储中，但这不代表服务端任务、跨设备同步、访问控制或关闭浏览器后提醒已实现。

发现的优先问题是数据与时间语义，而不仅是视觉：番茄钟刷新丢失本次记录；统计把提前终止的 1 分钟番茄钟记成 25 分钟；跨午夜 Time Tracker 把整条记录归到起始日；Task 的“今天/明天”是固定桶近似；Board→Task 链接会在移动任务后丢失，且完成状态读错。只做 UI 美化会掩盖这些问题。

## 验证结果与边界

运行命令使用 `pnpm --workspace-concurrency=2 --filter … test -- --maxWorkers=2`。以下均为本轮实际执行结果，完整日志见 `timer-test-existing.log`：

| 运行包 / 功能 | 测试文件 | 通过测试 |
|---|---:|---:|
| plugin-web-time-tracker | 3 | 28 |
| plugin-web-pomodoro | 16 | 129 |
| xai-web-meditation | 13 | 112 |
| plugin-web-countdown | 13 | 118 |
| xai-web-tasks | 15 | 155 |
| xai-web-habits | 20 | 125 |
| xai-web-calendar | 44 | 335 |
| xai-web-matrix | 16 | 82 |
| plugin-web-statistics | 20 | 150 |
| plugin-web-board-core | 20 | 206 |
| plugin-web-board-views | 14 | 141 |
| plugin-web-board-workspaces | 21 | 281 |
| 合计 | **215** | **1862** |

另外执行 `timer-test-audit.test.ts` 的 10 条隔离审查测试，全部复现预期的当前行为；其中 8 条描述缺陷，1 条证明 Time Tracker 恢复能力，1 条验证 UTC 与当地日期差异。这些测试通过表示**问题已复现，尚未修复**。命令：`packages/plugin-web-time-tracker/node_modules/.bin/vitest run --config docs/reviews/20260908-full-product-audit/timer-test-audit.config.mjs`。输出见 `timer-test-audit.log`。

这说明现有绿色测试没有覆盖若干跨功能与生命周期边界。没有执行全部真实浏览器后台冻结、系统睡眠、双浏览器并发、真实账号切换、真实通知投递；这些结论分别标为静态可复现路径或待专项实测，不能当作生产环境保证。测试日志仍有既有 act / 非法存储样本警告，但本轮没有测试失败。

## 关闭页面、后台、断网与恢复矩阵

| 功能 | 切到后台但页面未卸载 | 关页 / 刷新 / 路由卸载 | 离开后到期执行 | 重开恢复 | 主要限制 |
|---|---|---|---|---|---|
| Time Tracker 开放计时 | 下次 tick 以 Date.now 补算，非逐秒累加 | `segments.start/end:null` 已同步写 localStorage | 无需后台逐秒工作；没有独立作业 | 同浏览器同 origin 可补算离开时长 | 跨日/跨周归属错；时钟修改影响时长；跨标签写冲突；账号不隔离 |
| Time Tracker 暂停记录 | 已封闭 segment 不增长 | 暂停状态保留 | 无 | 可继续追加 segment | 与运行计时共用本地存储；没有服务端单运行者锁 |
| 番茄钟 | rAF 恢复时按绝对时间补算；到期动作可能延后 | 当前 running / paused 状态丢失 | 只由页面 rAF 回调记录完成和通知 | 只恢复已完成/已停止历史及外观偏好；本次归零 | 切走模块也会丢；晚恢复的 finishedAt 是回来时刻 |
| 冥想 | 每回调 elapsed+1；节流后少算真实流逝 | elapsed / paused / active 均丢失；音频停止 | 没有完成作业；界面到 00:00 也不自动结束音频/interval | 偏好恢复，当前会话不能恢复 | 缺绝对时间、完成记录、恢复说明 |
| 倒计日 | 每分钟 wall-clock 刷新，visible 时立即校正 | 保存目标日期时间 | 没有到期通知/后台动作 | 重新按目标日期计算 | 是日期差展示，不是提醒服务；目标时区隐含当地 |
| 任务 | 保存编辑/完成结果 | 已提交内容保留，未提交表单不保留 | 无到期转移、无提醒后台 | 原桶与状态恢复 | “今天/明天”不随日期变化，不能保证恢复后语义正确 |
| 习惯 | 点击打卡即保存；页面“今天”无自动换日订阅 | 打卡保留；日记未 blur 的草稿有丢失路径 | reminder 选项没有执行消费者 | 数据恢复；UTC 日期可能与当地日不一致 | 周期选项未进入打卡应完成日与连续天数逻辑 |
| 日历 | 事件 CRUD 保存；todayKey 捕获于 mount | 已提交事件/重复规则保留 | reminder 仅字段；重复事件按渲染窗口展开 | 重新渲染可展开重复事项，不是后台生成 | 当前页跨午夜 Today 仍旧；日期默认 UTC |
| Board 自动化 | 打开/切换看板或手动触发 | JS 与 effect 停止 | **不会在无人打开页面时执行** | 打开后只处理活动看板；可能补打到期标签 | 一天内完成首次自动化后，新变更不会自动再次执行；无跨午夜唤醒 |
| Board / 清单 / 卡片 | 每次操作保存本地 blob | 已提交内容保留 | 无云端协作或服务端自动任务 | 同 origin 恢复 | 多标签无事务；分享/权限是本地合同或 mock |

离线需再区分“已打开的页面还能操作”与“离线重新启动 SPA”：前者大部分本地功能可用；后者依赖资源缓存与鉴权。`apps/web/public/sw.js:1-8,35-37` 只预缓存 `/`、`/index.html`，非导航资源命中不到缓存时直接 fetch，未把获取成功的 JS/CSS 缓存进去。因此不能据有 Service Worker 就宣称完全离线重开可用。SW 没有本组提醒/计时的 push、sync、periodicSync handler。

登录退出语义：`apps/web/src/App.tsx:188-197` 退出后清 auth 并硬跳转；`packages/web-auth-device-session/src/session.tsx:93-103` 只删除 auth storageKey / code-verifier，不清本组业务数据。本组固定 `xai_*` key 不含 userId。同浏览器切账号会读到同一份本地数据；Time Tracker 还会把退出期间继续计入开放 segment。是否继续计时可以是产品选项，但必须由账号隔离、恢复提示和明确规则支撑。

## 已确认的关键问题与建议

### T01 · P1 番茄钟运行态在刷新/切模块后丢失

证据：`packages/plugin-web-pomodoro/src/internal/useTimerTick.ts:124-129,262-281` 的 running/paused 数据仅存 React state；`PomodoroModule.tsx:194,310-317,452-459` 只持久化已结束 sessions。审查测试 `POMO-1` 启动→unmount→mount 得到 idle；父浏览器实测 24:59→reload→25:00 Ready，sessions=0。

优化：把 `{sessionId, mode, durationMs, startedAt, remainingAtStartMs, accumulatedMs, phase, revision}` 保存到 durable session store；由 app 级 session controller 持有，路由只订阅。重开提供继续/结束/修正离开时段；完成用 sessionId 幂等结算，先写持久记录再显示成功，不能依赖 unload 最后一刻保存。若需求只要补算，本地 durable session 足够；若要求关页准时推送，要另做服务器调度及推送。

### T02 · P1 番茄钟提前结束被统计成完整配置时长

`PomodoroModule.tsx:441-449` 正确分别写 `durationMs` 和 `elapsedMs`，但 `plugin-web-statistics/src/internal/aggregators.ts:53-55,115-124` 读配置 durationMs 且不区分 completed。`STAT-1` 证明设置25分钟、实做1分钟、提前结束会统计25分钟。统计自身的读取类型也删去了 elapsedMs / completed（`internal/isPomodoroSession.ts:14-18`）。

优化：统一专注记录 DTO；新记录只用 elapsedMs 统计实际时长，旧 schema 才采用明确兼容规则。给提前结束、暂停、恢复后到期、跨小时分配写跨包合同测试。UI 同时呈现实际时长及是否完成，避免“专注25分钟”和记录列表“1分钟”互相矛盾。

### T03 · P1 Time Tracker 跨日漏算 / 未来记录污染今日

`internal/storage.ts:191-202` 以 entry 首段起点筛今日/本周，再加整条 duration；`TimeTrackerModule.tsx:562,570-577` 同样按首段起始日归属。`TT-2`：昨日23:50开始，今日00:10仍运行，总20分钟，今日为0（应10分钟）；`TT-3`：明天已结束1小时记录也计入今日 snapshot，因为只判断 `>= todayStart` 没有结束边界。

优化：按 segment 与查询窗口求交集 `[max(start,windowStart), min(end??now,windowEnd)]`，按当地自然日/小时切片；主体统计和 dashboard 共用同一查询。应测试跨午夜、跨周、暂停跨日、未来手动记录、24小时以上记录。

### T04 · P1 Task 智能日期并非真实日期模型

`filterCardsByList.ts:97-108` 明确 today=overdue、tomorrow=next7；`_now` 根本不用。`internal/dateForCol.ts:35-56` 移动到桶会改写今天-3/+2/+30天的无年字符串。`TASK-3` 证明一年后“明天”仍选出原 next7 卡。`internal/seed/tasksMock.ts:15-62` 内有固定旧节日、Next Mon/Next Wed 文字；空或损坏数据还会在 `TasksModule.tsx:76-91` 自动写入这些样例。

优化：将 dueDate / dueAt / timeZone 与 status、listId 分开存储；智能清单只读真实日期投影，不存互斥“日期桶”；拖拽先显示目标日期或打开日历确认。统一“收件箱”依据：当前 sidebar count 把 listId=inbox 算入（`TasksModule:617`），筛选只看 inbox===true（`filterCardsByList:70`），也会出现数字与列表不一致。空用户默认空列表，演示样例通过显式入口加入。

### T05 · P1 Board↔Task 链接和完成状态互相不兼容

`tasksReducer.ts:51-84` 移动任务时白名单重建对象，未保留 source；`taskLink.ts:105-110` 链接查找依赖 source。`TASK-1` 证明拖到另一桶后链接消失。`toggleComplete:127` 是 done=true，但 `taskLink.ts:124-127` 假定 tasks 数组里的项永远未完成；`TASK-2` 证明已完成任务仍被 Board 识别为未完成。另外 sourceMatches 包含 listId，Board 卡跨列移动也可能失联；应以稳定 boardId/cardId（或 taskId）定位，而不是当前位置。

优化：移动以 spread 原实体后修改必要字段，保留 source 与未来字段；明确唯一完成语义，减少 tasks[] / completed[] 双表示；Board/Task 更新采用事务或可重试关联命令，`BoardWorkspacesModule:852-860` 目前是两个 key 的顺序写，不具事务。做“创建链接→移动卡片→移动任务→完成/撤销→刷新→删除/恢复”完整测试。

### T06 · P1 习惯/日历提醒可配置但没有执行系统

习惯 `HabitsModule.tsx:123-125` 保存 startDate/reminder/frequency，`HabitDetail.tsx:418-419` 只显示；日历 `EventComposer.tsx:83-89,458-470` 提供提前5分钟等选项，`CalendarModule:170,182` 只持久化，`mergeEventsForViewport:77` 只携带标签。对当前宿主及包源码检索未找到读取这些字段并投递提醒的消费者。

优化：短期明确标为尚未启用并避免默认开启误导；正式实现 reminder jobs、IANA timezone、dueAt、notification delivery status、幂等键和重试。账户同步暂停时，不应绕过 sync module gate 称已具跨设备提醒。前端需显示通知权限、提醒是否已安排、时区、上次失败，并提供测试提醒。

### T07 · P1 冥想既不能准确补算也没有结束状态

`MeditationPlayer.tsx:73-75,101-105` 用 elapsed+1；`145-149` 只把显示夹为00:00，未让 interval 或音频在 total 达到后停止；`192-197` 仅用户退出时 pause。这是源码可直接确认的路径，未声称完成真实后台冻结测试。

优化：复用计时 session controller；到期进入 completed，明确声音停止/继续环境音策略，产生一条完成记录，再呈现复盘。短期先修到期不停止和后台漂移，再做视觉。

### T08 · P2 UTC 与本地日、DST 的定义不统一

习惯 `dateKeys.ts / computeStreak.ts:29-40` 使用UTC；日历 `CalendarModule:82` 使用UTC日期；Time Tracker 用本地日；统计 `aggregators.ts:63-73,190` 又用UTC日/小时。`HABIT-1` 证明洛杉矶9月8日18:00打卡归到9月9日。用户切模块会看到不同的“今天”。

Time Tracker `TimeTrackerModule.tsx:378-387,2807,3279-3283` 用当地午夜+固定86400000毫秒定义次日，DST切换当天不等于下一自然日。春季多算到次日1点、秋季少算最后1小时，热图有重复/遗漏日风险（静态分析）。

优化：制定统一用户时区、自然日、全天事项与绝对时间合同。自然日边界由日历运算构造 next local midnight，不用固定DAY_MS；历史时间保留原时区或明确按当前时区重分桶。UTC仅作为存储 instant，界面按用户时区解释。

### T09 · P2 多标签监听不等于多标签写安全

`plugin-web-time-tracker/internal/storage.ts:210-237` 从 valueRef 当前快照计算并整数组 setItem；Board `BoardWorkspacesModule:262-282` 从渲染闭包的整个 boards 计算，Tasks `TasksModule:170-172` 同理，Calendar `useUserCalEvents.ts:66-89` 从闭包的 events 创建新快照。storage事件迟于另一个标签的写入到达时，两个标签各加一条有最后写覆盖的窗口。监听能传播最终结果，不能阻止丢更新；本轮没有双进程真实浏览器竞态实测，风险是明确代码路径推断。

优化：本地先转 IndexedDB事务/实体级写，辅以 revision 和冲突提示；单活动计时增加跨标签leader或锁。同步引入后使用服务端版本校验和冲突策略。不要把setState函数式更新等同于跨页面原子事务。

### T10 · P2 数据层异常与空数据被当样例修复

Time Tracker `storage.ts:99-106,123-138` localStorage访问无try/catch；配额或禁止访问能抛出，页面保存未给反馈。`isSegment:51-56` 只检查number，未检有序、非负、多个open segment等不变量。Matrix `usePersistedMatrix.ts:53-60`、习惯 `usePersistedHabits.ts:43-44` 把合法空数据也重新灌样例；`MATRIX-1` 已证明。日历 `useUserCalEvents.ts:61-64` 对unknown直接cast也没有完整边界校验。

优化：统一存储错误返回值和“未保存”提示；区分未初始化、合法空、损坏、未知schema；保留损坏原始副本供导出恢复，不能用样例静默覆盖。Time Tracker 的专用key还未加入通用pref注册/清理合同，应纳入数据清理与导出审查。

## 每个用户功能的现状、问题与改进

下表的测试数字引用上面的本轮包级完整执行；不会把“包测试绿”冒充这一行所有用户链路均通过。

| Feature | 实现 / 持久化 / 验证 | 当前问题 | UI / 交互建议 | 逻辑、稳定性建议 |
|---|---|---|---|---|
| Tasks 基础CRUD与完成 | 新增、编辑、单/批量完成删除、拖动；xai_task_cols；155测试 | T04/T05；完成状态两套表示；删除无历史恢复；旧样例默认写入 | 新用户空态、单步撤销、明确已保存状态；任务详情保留来源链接 | 规范due/status/source；已完成事件时间戳；实体事务 |
| Tasks 清单与标签管理 | 自定义清单/标签/颜色/排序；xai_pref_task_lists/tags | 元数据用useState初始化、没有storage事件订阅（TasksModule:69-74）；最后标签删空后重开fallback默认；校验未查name（572-588） | `TasksSidebar:136` 把inbox/book/home原始token当文字，改真实图标；色彩作为辅助而非唯一识别 | 元数据统一usePref可订阅模型；保存空数组有效；列表名称完整校验；删除同步处理已完成项 |
| Tasks 智能清单 | all/today/tomorrow/next7/inbox/summary | T04；今天=逾期，明天=未来7天；inbox数量与列表谓词不一致 | 在真实日期模型落地前名称必须符合实际语义；收件箱显示未归类原因 | 一个selector作为列表和计数共同来源；跨午夜自动更新 |
| Tasks 侧栏日历/已完成/不做/垃圾桶 | `TasksSidebar:191-214` 有可见占位控件 | Local Calendars固定8；后三项role=button但没有行为 | 隐藏或标明未提供；实现后键盘Enter/Space及选中反馈 | 真实订阅源、归档与恢复模型后再开放入口 |
| Time Tracker 计时/暂停/手动记录 | xai_tt_entries_v2存segments；即时保存；28测试 | T03/T08/T09/T10；module已不消费single/multi mode但文档还声明（startCategory:585-588总append） | 恢复时给“离开期间计入多久”与修正入口；运行中始终可见状态条；超长会话提醒 | 统一session状态机，guard重复resume/open segment；模式合同按真实功能校正；分段裁剪 |
| Time Tracker 分类、目标及子类 | 分类/子类增改排序，goalMin，分类删除连记录软删（709-712） | 删除跨两个key；读取丢弃deleted后下次写可能消灭墓碑，不能当作可靠恢复；专用存储异常 | 删除前展示受影响时长/条数并提供撤销；目标空态清楚 | 分类与条目事务；历史分类快照；明确墓碑保留和清理策略 |
| Time Tracker Insights/CSV/自定义图表 | 周/月/年/自定义范围、趋势分布、CSV、范围删除 | 范围按首段start筛选（2808-2812）；小时分布把整segment塞进开始小时（3327-3329）；图表每秒扫描大量历史 | 日期范围与过滤器固定可见；CSV明确时区及部分相交记录规则；指标可点开明细 | 统一窗口相交查询；按日/小时索引缓存；只刷新活动段，历史聚合按变更更新 |
| Time Tracker Dashboard widget | `TimeTrackerWidget:11-28` 调getTimeTrackerSnapshot | 继承T03；组件依赖外部now刷新，read不是订阅hook | 区分“今日累计”和“当前会话总计”；提供暂停/结束快捷操作 | 与主模块复用聚合和订阅，不复制统计规则 |
| Pomodoro 计时与记录 | 多显示样式/主题/声音/预设、暂停、结束、sessions历史；129测试 | T01/T02；reset不保存当前会话（PomodoroModule:480-486）；实际到期finishedAt延后 | 页面离开提示用持久控制条替代阻断；结束/重置说明是否保存；恢复弹层 | durable timer、幂等complete、实际deadline和recordedAt分离、单活动者 |
| Habits 打卡/日历/统计 | habits/checkIns/diaries单blob；周条、月历、排名；125测试 | T08/T10；频率/startDate未限制应打卡日期；未来日期可点，monthlyRate可超过100（computeStats:30-33） | 显示应完成日、未来日禁用或标为计划；允许修正历史但注明；空态不混入样例 | 按频率计算分母/连续周期；区分今日尚未到期与断签；统一当地日 |
| Habits 提醒 | 有默认开启和时间字段 | T06，配置后不会提醒 | 启用状态与“实际已安排”分开；未实现时不显示成功语义 | 提醒job与权限探测；关页/离线投递策略 |
| Habits 日记 | localValue编辑、onBlur持久化（DiaryCard:30-54） | 正在输入时直接关闭/崩溃没有blur保证；切习惯/外部更新可能覆盖草稿 | 编辑状态、保存状态与冲突恢复；按日/按月语义明确 | onChange debounce到durable draft，并在切对象前flush；不要只依赖blur/unload |
| Meditation 场景/音频/计时 | 场景/时钟/自定义偏好、环境音、全屏player；112测试 | T07；PLUGIN_MAP仍写No audio playback deferred，实际已接useAmbientAudio | 到期完成态、音频加载/不可播放原因、恢复入口；减少场景设置抢占主CTA | wall-clock会话、音频生命周期与完成联动；记录真实冥想时长 |
| Countdown 全部视图 | cards/list/timeline/calendar/history；创建编辑复制隐藏置顶排序；xai_countdowns；118测试 | 主模块已用60s wall-clock/visible校准，不能误用旧useDaysUntil结论；目标日期/时间无显式timezone；无提醒 | 对“距某自然日”和“剩余绝对小时”分开文案；到期/历史/隐藏区别清晰 | 保留date-only与zoned deadline两个类型；到期动作若需要走job系统 |
| Calendar CRUD与日/周/月/年 | xai_calendar_events与calendar_view；创建编辑删除、重复daily/weekly；335测试 | T06/T08/T10；todayKey mount固定（82）；样例按day-of-month反复渲染；重复事项点击编辑的是整个源事件（144-149） | 样例明确可关闭；重复编辑弹出“本次/此后/全部”；Today真正跳到当前当地日 | recurrence例外、时区、跨日持续时间合同；数据验证；日期tick统一 |
| Calendar Board feed | 只读投影xai_boards_v2，跳过归档（boardCalendarFeed:54-71） | 月格用了board feed，但日详情overviewEvents仅合并样例与用户事件（CalendarModule:206-215）；出现格上有卡、详情没有 | 所有视图同一来源标识、点击可回Board；对跨日范围采用条带展示 | 合并层统一产出同一CalEvent union；按dateKey索引而不是重复算法 |
| Matrix 四象限 | 新增、拖动、Cmd/Ctrl+方向键移动、持久化；82测试 | T10；Card:71 是装饰checkbox；MatrixModule:77 更多无行为；没有编辑/删除/完成闭环 | 换成可执行的真实checkbox/详情菜单；提供触屏“移动到”；保留键盘支持 | 若定位任务优先级视图，应引用统一Task实体；当前是独立数据副本，不应假设与Tasks已联动 |
| Statistics | 读番茄/习惯/任务，周月全部、KPI/热图/小时分布；150测试 | T02/T08；now固定mount（93-98）；taskBuckets把全部已完成塞最后一个日期（aggregators:133-138）；非真实任务时间序列 | 任务无完成时间前用当前总数卡，不画日期柱；时间范围、口径、数据来源清晰；UTC小时明确改当地 | elapsed统一、completedAt事件历史、日小时切片、午夜刷新；Time Tracker数据尚未合并不应混称总工时 |

## Board 逐子 Feature 审查

Board core / views / workspaces 的本轮测试分别206/141/281。`xai-web-board-*` 很多目录只有四件套文档，真实实现合并在这三个运行包；下面按产品子功能拆开，避免把文档包当独立已上线服务。

| Board Feature | 真实现状与测试落点 | 问题 / 边界 | UI / 交互建议 | 后端 / 稳定性建议 |
|---|---|---|---|---|
| Board core / Kanban | Board/List/Card schema、跨列移动、添加列/卡、颜色；core206 | 整个boards单blob写；T09；默认有样例 | 初次选择空看板/模板；拖拽有明确落点与撤销；长看板保留列头 | 实体id+revision；维护移动原子性并支持并发冲突 |
| 多看板创建/切换/设置 | `BoardWorkspacesModule:555-607`，模板、图标、描述、workspace选择；workspaces281 | `BoardSwitcher:272` 是否显示删除依赖搜索后totalFiltered；仅搜到一个时不能删，虽然全局仍有多个 | 删除条件按全局安全约束，搜索不影响操作；明确活动看板 | 生成uuid；删除清理active/view/filter/sidebar引用的一致性 |
| Workspace CRUD | workspace独立目录、创建改名换色、空空间删除；BoardSwitcher:196-263 | 当前只是本地分组，不是团队/租户边界；跨key无事务 | 以“本地空间”说明范围；避免Team workspace暗示协作已开通 | workspace所有权与成员模型待独立实现；移板/删空间事务 |
| Board list CRUD | rename/reorder/archive/restore/delete，PM语义列受canManageBoardList约束；boardOps:183-333 | 语义状态借列表key/名称承载；重命名Done对automation有行为意义；删除列表连卡影响较大 | 受保护列解释原因；归档优先于删除；移动排序键盘可达 | 把column displayName与status语义分离，批量迁移卡片事务 |
| Board card CRUD | add/rename/reorder/archive/restore/permanent-delete；boardOps:334-480 | T09；永久删除与关联Task没有统一关系维护 | 卡片菜单提供完成/移动/归档/撤销；明确永久删除影响 | 软删/墓碑、关联清理、可审计patch命令 |
| Board card detail | 描述、日期、标签、成员、优先级、Checklist、附件、activity集中surface；BoardCardDetailModal:114起 | 描述onChange每字符直接写全部boards（254-258）；大blob同步写卡顿风险；非法附件URL直接return（204）无反馈 | 将详情分成清楚层次；保存/失败状态；字段错误就地解释，少用深层modal | 实体局部更新、draft debounce；限长、输入校验、持久失败传播 |
| Label catalog | board-scoped标签增删改，删除会strip卡片引用；BWM:285-328 | automation默认写urgent id，而自定义catalog可能无该id | 标签管理可搜索；删除显示影响卡数；系统urgent与自定义标签区分 | 系统标签保留或规则自选标签，确保引用存在；不让自动化产生孤儿标签 |
| Member directory | board-scoped本地姓名/头像色目录与分配；BWM:330起 | 本地联系人标记，不是账号成员、邀请、权限或在线状态 | 显示“标记负责人”；真实邀请与本地人员不同入口 | 将assigneeRef与账号membership分离；实际协作要求服务端检查 |
| Priority | 卡片priority、详情选择、过滤/统计；views Dashboard:77-81 | priority与urgent标签并存，无明确同步语义 | 固定四级文案/颜色；组合条件显示当前启用筛选 | 一个priority枚举与版本化迁移；自动化用同一语义 |
| Typed date model | YYYY-MM-DD、legacy解析、range标记、统一view显示；dateModel:207-255 | legacy Today 会按当前日解释；老无年M/D在跨年有推断；无用户确认的迁移有不确定性 | 不确定日期显示需要确认，而非看似精确；当天/逾期时间实时 | 一次性带原始值migration；typed date为单真源；时区及日期范围校验 |
| Storage contract | legacy array + v1 envelope + logical project.board/list/card投影；storageContract:132-205 | 投影syncScope=account-sync只是数据合同，不是接上云同步；不接受空board集合会回seed | 展示本地保存状态；损坏数据可导出恢复 | 分schema版本做迁移；无效与空数据区分；cloud adapter前不能宣称同步 |
| Card checklist editor | 增删改勾选、summary从items派生；Detail:175-195,559-623 | legacy仅有done/total时生成Item1/2文字（104-111）；Done automation会自动勾完全部items（automationLite:83-90） | legacy显示待补标题；自动勾选前明确规则，可撤销；键盘新增/排序 | checklist item id/revision；语义完成是否自动勾子项做配置，不默默改 |
| Comments & activity | 本地纯文本comment，authorId=local-user；Detail:215-225；activityEntries helper有validation | 无协作身份、权限、投递；并非所有卡片操作都有审计事件 | 评论/系统动态分栏或图标标识；不要暗示@通知已实现 | append-only事件、真实actor、编辑删除策略；分页；服务器授权 |
| Attachments / Integrations | 5种provider metadata的HTTP(S)外链，URL协议校验；integrationAdapters:61-108 | 不是OAuth或同步、文件上传、webhook（design.md:40-46明确）；provider标签不验证域名 | 名称用“附加外部链接”；错误URL反馈；展示真实hostname | 若以后拉取数据，做服务端connector及状态队列；当前不需要伪装后端 |
| Permissions / visibility | `private/shared`本地字段；boardVisibility:15-27 | **只有可见性元数据，没有users/roles/invite/access grant**；design.md:22-28明确非目标 | Header Shared改为清楚的草案状态，避免用户误以为已共享 | 真权限必须服务端行级授权、成员校验；不能仅靠UI toggle |
| Share contract | mock envelope、SHA URL、copy、share-requested事件；ShareModal:33-36,67-78 | 已明确mock，链接不授予访问；关闭dialog也发share-requested；clipboard失败静默；`mock/unimplemented/view`暴露内部实现给用户 | 未开通时提供简洁说明和导出替代；复制失败给可操作提示；只在实际意图动作记分享事件 | 实际share token、过期、撤销、审计、访问检查另做；保留明确capability字段 |
| Automation Lite | 完成列补completedAt/勾Checklist、临期加urgent、按due排序；automationLite:179-233 | effect仅活动板每日一次（BWM:531-542）；关页不执行，跨午夜无定时；同日移入Done后不会立刻触发；规则隐式改变人工顺序 | 显示规则、作用范围、最近执行、影响卡片和撤销；区分手动/打开时运行 | 先明确事件触发或每日调度；需要关页运行时才引入durable queue/cron、幂等键、失败重试 |
| Task link | 从卡创建Task、保存taskLink、读状态；BWM:835-887；tasks/taskLink | T05：移动source丢失、done识别错误、两个key不事务；移动Board列也涉及listId | 双向跳转与缺失链接修复；用户看到来源及当前真实完成态 | stable source identity；统一完成字段；事务/重试；跨功能生命周期回归 |
| Saved filters | per-board labels/members/due/priority持久化；savedFilters + FilterPopover；有集成测试 | 日期过滤随render算，跨午夜没有统一tick；删除catalog项后的filter引用需验证 | 常驻过滤chip/清除、0结果解释、保存/覆盖明确；不同视图保留过滤范围 | filter normalize对照当前catalog；版本迁移和时间依赖selector |
| Table view | inline Due/Labels/Members/Progress，同一updateCard持久化；141包测试 | 能编辑不代表批量/键盘网格齐全；大数组无虚拟化 | 键盘单元格、批量编辑、列宽/隐藏/排序、低密度与紧凑切换 | virtualization与字段patch；性能数据设门槛 |
| Board calendar view | typed due month grid，可拖动改日期，同一writeLists | 拖动语义可能忽略start/due范围；触屏HTML5 DnD能力需实机 | 明确改的是due，范围显示；触屏点选“移到日期”替代路径 | range校验与统一dates；月边界/DST/year tests |
| Board dashboard view | 卡片、临期、逾期、列数及标签/priority分布 | `BoardDashboardView:55-60` 所有卡的dateMeta统计，不排除completedAt，已完成卡仍可能计逾期；非实时换日 | 指标可钻取；口径为未完成/全部可切换；图表列出计数含义 | 单一isOpen谓词；完成状态/日期统一；聚合与筛选共享 |
| Timeline view | 30日横轴、拖移/左右resize、原子start/due patch；141包测试 | 只在当前窗口展示易丢远期卡；触屏和键盘拖动需补验证 | “跳到今天/显示未排期”、缩放、溢出指示；键盘日期编辑 | 原子range更新、有效区间约束、窗口查询；日期运算避免固定毫秒 |
| Map view | 真Leaflet+OSM、location校验、textContent防注入、lazy load；MapView:92-168 | pin标题固定选en（65）；只处理JS加载失败，没有tileerror/离线反馈；loadError无retry | 中文标题随lang；加载/断网/无位置分别展示；位置列表可替代地图 | 资源加载重试/取消，tile失败状态；避免每次全部重建map，保留视角 |
| Inbox panel | 独立xai_board_inbox，本地添加与拖入Board；BWM:503-507 | 两个key之间移动不能保证崩溃原子性；并发用闭包快照 | 拖放成功/撤销与目标看板确认；空态描述收件箱用途 | 转移命令/transaction保证不丢不重复；统一id |
| Planner panel | 今日到期卡投影；无卡回3个样例（PlannerPanel:62-90） | **把卡片按序排9/11/13…点，非真实起止时间；最多6张；样例未标且按钮无行为** | 先改“今日到期清单”，真正时间规划则让用户排时段；样例明确可关闭 | 增加scheduledStart/duration后才能显示日程；完整列出未排期卡，不静默截断 |
| Calendar feed | Board due/start→Calendar只读全天点，不复制存储；boardCalendarFeed:30-71 | 起止范围只取due，否则start；Calendar日详情遗漏；见主表 | 来源badge、跳回卡、范围条带；每个日历视图一致 | 共享投影、dateKey全量索引；source stable id；无双向写时明确只读 |
| Export / import | versioned payload + logical entities校验，helper存在 | **合同层，没有用户导入导出入口**（xai-web-board-export-import/docs/design.md:5-19）；也非现成加密备份 | 发布面注明能力层级；提供可下载备份与导入预览、冲突/替换说明 | schema与referential integrity、大小限制；merge/replace策略；导入事务和回滚 |
| Responsive smoke | CSS有900/760断点，responsiveStyles结构测试；workspaces281含3条CSS测试 | 结构断点测试不是触屏/读屏/真实窄屏完成证明 | 覆盖375/768/1440、200%缩放、软键盘、键盘DnD、层叠modal焦点；表格/时间轴保留合理横滚 | screenshot+交互验收单独记录；不要因无hex或存在media就认定UI通过 |

## UI / UX 设计依据与跨模块建议

本组加载 `.codex/skills/redesign-skill/SKILL.md` 与 `.codex/skills/soft-skill/SKILL.md`，用于状态完整性、层级、留白、焦点、响应式、动画性能审查。未机械套用“所有按钮胶囊”“禁止某字体”“巨大营销留白”等风格规则；生产力工具需要保持项目自己的密度和设计token。当前视觉基准是仓库内已跟踪的 `web design/DESIGN.md:3-5`（active Web console design contract），参考 Apple Calendar、Apple Reminders、iOS Timer、Linear；其 Product Feel、Theme Model 要求安静、清晰、实用密度、轻量动效及语义token。仓库父目录的 `../web design/DESIGN.md` 是另一份历史原型资料，其中 TickTick/Trello/Jira/Notion 的产品参考仅用于理解早期构想，不取代当前合同。官方产品最新能力和主视觉截图由总审查单独核实；本报告不把历史原型描述冒充竞品当前事实。

1. 先统一“真实数据 / 样例 / 未开通”的视觉语义。Tasks旧节日、Matrix样例、Planner自动排时、Shared/permission mock、Calendar样例目前混在工作流里，误导程度高于单纯色彩问题。样例可在演示模式保留，个人工作空间应默认为真实空态。
2. 全局固定轻量运行条：显示当前Time Tracker/番茄/冥想、保存状态、暂停/结束、回到来源。只更换路由不应中断活动；功能间有一致的恢复说明。时钟显示风格可以个性化，底层时长口径必须一致。
3. 统一日期选择与due显示：全部模块区分自然日、具体时间、时区、逾期和已完成；任务“明天”与Board due明天、日历今天、习惯今天不能是四种定义。当前错账修复应比添加更多卡片皮肤优先。
4. 详情使用可持续编辑面板与明确保存反馈。Board每字符写blob、Habit日记只blur保存分别处在两个极端；统一draft autosave、有失败可重试、有版本冲突提示，表单关闭时不无声丢输入。
5. 删掉没有行为的装饰按钮/checkbox或实现闭环。Tasks footer、Matrix checkbox/More、Planner样例按钮是已定位案例。键盘可聚焦却无行为尤其破坏信任。
6. 对统计保持口径诚实：时间轴上的某日柱必须代表那日；“当前完成总数”不能塞进最后日期伪装时间序列；跨日段按交集、小时图按小时切片；图表附可访问的数据明细。

## 建议修复顺序与验收门槛

| 优先级 | 修复批次 | 最低验收 |
|---|---|---|
| P1 | durable timer与真实时长统计（T01/T02/T07） | 开始/暂停→路由切换→reload→关闭浏览器→重开；提前结束1分钟统计1分钟；到期只结算一次；恢复时间与真实deadline分开 |
| P1 | 时间与任务日期统一（T03/T04/T08） | 跨午夜/跨周/DST前后、不同IANA时区、时钟跳变；智能清单按真实due筛；所有模块“今天”一致 |
| P1 | Board↔Task实体合同（T05） | 建链接后移动两端、完成撤销、归档删除恢复、刷新，链接与状态不丢 |
| P1/P2 | 提醒/自动化承诺校准（T06） | 未实现入口明确未开通；若正式上线，服务端job在客户端关闭后仍执行，有idempotency、投递状态与重试证据 |
| P2 | 存储一致性与账号隔离（T09/T10） | 配额不足/禁止访问/损坏schema/合法空数据/两个标签交错写/账号A→B；无无声丢数据或串号 |
| P2 | 完整交互与样例隔离 | 无死按钮；合法空数据不自动灌样例；未保存日记/表单恢复；用户可区分真实协作与本地合同 |
| P2/P3 | 图表、响应式和微交互 | 真实375/768/1440屏宽、200%缩放、键盘与触屏；至少1万历史时间段的交互性能基准；visual regression与业务校验分开 |

## 文档与看板状态偏差

- `docs/PLUGIN_MAP.md:128` 将Time Tracker标Stable，但其 `docs/dev_log.md:3` 仍是READY_TO_SHIP；本轮运行行为已验证，发布状态应由总报告对照部署commit，不应从任一个标签单独推导。
- `docs/PLUGIN_MAP.md:132` 仍称Meditation无音频，当前代码有useAmbientAudio；`PLUGIN_MAP:141` 仍描述统计任务指标用番茄代理，实际Statistics已读done count（只是时序图仍有问题）。这是管理面落后于实现。
- Board权限、集成、导入导出的dev_log写SHIPPED时，其设计明确分别只交付本地字段、外链adapter和数据合同。不能把“该合同已交付”汇总成“团队权限/三方集成/用户备份产品已完成”。建议看板增加implementationScope、userVisible、backendConnected、runtimeVerified字段。
- `xai-web-habits` 与 `xai-web-matrix` 文档注释说“key absent时seed”，实现却也对合法空状态seed。测试目前接受旧行为，需先修产品合同再补针对性回归。

本报告的下一步是按上述缺陷批次立项和修复，不是重复跑同一批绿色测试后把审查判为通过。
