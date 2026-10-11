# POMO-01 / POMO-02 — durable local session diagnosis

- Module: web；Owner: plugin-web-pomodoro；State: FIX_READY (diagnosis only)。
- Baseline HEAD observed: 81d7b9dce7eecac56dba6fc67841f42f9bcc8715。无产品源码修改。
- TODO验收：POMO-01 启动→切路由→刷新→关tab重开仍能继续或正确结算；POMO-02 deadline/actual elapsed/recordedAt 分离，晚回来不改到期时刻，sessionId幂等。
- 依据：CLAUDE.md web模块/ADR-0013 D4，AGENTS.md精确提交及owner边界；既有Pomodoro docs/design.md §4–7仅声明本组件状态机，需显式更新为应用级持久会话。账号命名空间内的本机持久化不意味着启用暂停中的account cloud sync。

## Evidence

```sh
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-pomodoro-durable-session/reproduction.config.mjs
node docs/reviews/web-pomodoro-durable-session/verify-native.mjs
```

第一项真实React hook/module/repository，固定时钟，8正确预期用例：**7 FAIL / 1 control PASS**。第二项独立临时Chrome profile+localhost、真实reload和第二浏览器窗口：**3个行为预期全部失败**。native runner退出0表示诊断数据收集成功，结果中的expectationFailures=3才是业务结论，不是验收PASS。无真实账号/网络服务，无跨厂商验证。

| 场景 | 正确预期 | 实测 |
|---|---|---|
| running路由卸载重挂 | 保留running与sessionId | idle |
| paused卸载重挂，离开1小时 | paused、remaining=24min | idle、25min |
| 两个同账号hook观察者 | 同一active session | 第二个idle |
| hook观察者身份切A→B | 立即隔离A | 仍running；这是controller层隔离缺口，真实host Gate通常会卸载，不能称已证实host泄露 |
| 10:00启动25min，10:30回来触发帧 | finishedAt=10:25、recordedAt约10:30 | finishedAt=10:30:00.030；schema无recordedAt |
| 两次append同sessionId | 一条 | 两条 |
| End写session key抛QuotaExceededError | 不报已保存，保留可重试结束状态 | 磁盘无记录，仍显示“Timer stopped and saved.” |
| 对照：同mount pause/resume | 暂停不计elapsed | PASS |
| 真Chrome running reload | running | idle |
| 真Chrome paused reload | paused | idle |
| 真Chrome第二窗口同账号 | 观察active session | idle |

实际关tab重开与断电未单独自动化：源代码无active存储，reload已经证实缺少恢复，但不以reload冒称全部关闭场景已跑。跨tab“双结算”尚无共享session可直接恢复：当前各tab本就独立；纯append重复测试暴露未来加入恢复后必现的幂等缺口，不能把它报告为已跑真实双tab竞态。

## Root cause / caller map

| 位置 | 当前行为及影响 |
|---|---|
| registration.tsx:16–19，apps/web/src/routes/modules/shellRegistrations.tsx:27 | 路由render创建PomodoroModule；无应用级会话宿主 |
| internal/useTimerTick.ts:41–72,130–163 | running/paused完整状态仅useState，id去重仅组件useRef Set；无accountScope、持久读写 |
| useTimerTick.ts:186–224 | rAF只在mounted running时检测到期；去重Set先加入再调用回调；回调失败也无法重新结算 |
| useTimerTick.ts:230–281 | visibility/pageshow只刷新remaining，不独立完成结算；unmount取消rAF并清listeners |
| useTimerTick.ts:285–390 | start/pause/resume/end/reset均仅内存；deadline隐含startedAt+remainingAtStartMs；end在setState updater内计算返回值另有异步时序风险 |
| PomodoroModule.tsx:194–206 | completed history通过usePref持久化；过滤无效行后再写会丢坏行原始证据 |
| PomodoroModule.tsx:291–357 | 自动完成finishedAt=new Date；setRawSessions结果boolean未检查；无论失败仍emit/通知/advance/reset |
| PomodoroModule.tsx:415–486 | End先end()清内存再保存；失败仍emit及“saved”；恢复材料丢失 |
| internal/sessionsReducer.ts:26–31 | append不检查id。read-modify-write来自每个hook的旧内存；跨tab无锁/权威重读 |
| internal/validate.ts | 仅typeof；允许NaN/不合法ISO/负duration等。扩展字段前需兼容旧记录并严格验证新状态，不把旧坏数据静默抹除 |
| types.ts:16–49 | id/startedAt/finishedAt/durationMs/elapsedMs/completed；无deadline、recordedAt，且旧注释storage schema1 |
| internal/derivedCounters.ts:15–30,computeStreak | 以finishedAt归属今日与streak；晚回来会污染日期，因此时间语义影响overview/records/statistics消费者 |
| core/src/types/events.ts:213 | finished事件仅mode/durationMs/finishedAt；无sessionId，消费者无法幂等；durationMs目前实际elapsed保持兼容 |
| storage/usePref.ts:129–147 | setter现在返回boolean，只成功才更新内存，Pomodoro仍忽略false；try/catch不足以判断保存成功 |
| storage registry/accountOwnership + Pomodoro accountMigration.ts | 仅history登记，无active/journal生命周期key；新增必须登记owner/迁移/导出删除，不允许隐藏裸key |

## Proposed shared durable-timer contract (implementation needs parent coordination)

本合同供Pomodoro与其他倒计时控制器共用；产品mode/duration/下一模式仍由各owner提供。共享应是最小状态/命令/结算协议，不抽象UI或强迫TimeTracker开放式计时使用倒计时模式。

### State

- `version:1, sessionId:crypto.randomUUID(), featureId, owner:{kind,accountId,generation}, revision, mode, durationMs, sessionStartedAt`。
- `phase:'running'|'paused'|'settlement-pending'`；idle为无active记录，不保存每秒remaining。
- running：`runStartedAt, accumulatedElapsedMs, deadline=runStartedAt+(durationMs-accumulatedElapsedMs)`。
- paused：`accumulatedElapsedMs, pausedAt, remainingMs=durationMs-accumulatedElapsedMs`，无活动deadline；原始sessionStartedAt不改。
- settlement-pending：冻结`completed, finishedAt, elapsedMs, reason`，仍同一sessionId。自动到期finishedAt=deadline、elapsedMs=durationMs；提前End finishedAt=commandTime，elapsedMs=clamp(accumulated+max(0,now-runStartedAt),0,duration)，暂停End不加暂停时间。
- 最终history保留既有字段，加可选`deadline, recordedAt, schemaVersion`，旧记录无这些字段不伪造。`recordedAt`记录成功写history的观察时刻；已有同id记录重放不改它。`finishedAt`是业务结束，不是恢复时刻。
- 时间倒退不产生负elapsed、不放大remaining；时间大幅跳变策略明确采用wallclock deadline恢复，不能承诺跨系统时钟修改精确。暂停/恢复用数字epoch，展示才用localDateKey；DST不改实际elapsed。

### Durable ordering / same-origin concurrency

推荐保留旧`xai_pomodoro_sessions`数组与现有读者兼容；新增**已登记的账号私有active/journal key**，不把history改成不兼容envelope。两key不是原子事务，采用可恢复的write-ahead过程：

1. 所有start/pause/resume/end/reconcile都经同一account+generation+feature的Web Lock排队。每次拿锁后重新读取权威storage，校验captured scope/epoch/generation/tombstone，再决定命令。revision避免旧tab命令撤销新状态。没有Web Locks时明确不可写提示；不能降级为假localStorage CAS并承诺跨tab安全。若需跨浏览器兼容，可改用IDB事务，但必须同一份全局决定，不各计时器自行发明锁。
2. start/pause/resume状态**先写成功才发布UI成功**；start失败不开始；pause失败仍running并可见失败；resume失败仍paused。正常运行不依赖卸载时最后写入，不做beforeunload救火。
3. 到期/End：先持久化settlement-pending，再锁内重新读history，按sessionId插入一次；已有同id一致记录直接认定已提交，不重复append。不一致同id需冲突提示，不覆盖。
4. history写失败：保留pending及冻结deadline/elapsed，UI明确“已到期/未保存”，retry/export可用，不advance、不通知已保存、不启动下一轮。pending写失败：原running/paused记录仍能恢复并再次算到期；End意图只在内存时需保留草稿及错误，不声称已接受。
5. history已成功而active清理失败：保持可恢复pending；重放读到同id后只清理，不二写history、不同步更改recordedAt。新start须先处理已有pending，不覆盖。
6. 应用级controller在Gate后挂载，hook只订阅/useSyncExternalStore+绘制。storage/BroadcastChannel发刷新提示，权威仍锁内读。每个scope只有一项active；第二tab只观察/对同一id发命令。
7. accountScope.subscribe在lock/切账号立即断开旧UI、事件和通知；每个异步命令持有不可变scope，拿锁后和每次写前验证。A会话留在A命名空间，B无权恢复/清理；返回A可reconcile。禁止为了清理而动态拿“当前B”的key。
8. 本地事件不是事实存储：只在history成功后发送携sessionId/finishedAt/elapsedMs/recordedAt的事件，旧durationMs字段继续代表elapsed。storage恢复驱动其他视图刷新。精确once通知不能跨“提交后、emit前”崩溃保证；应明确durable history exactly-once、event at-least-once或best-effort，消费端按sessionId去重，不把两个承诺混淆。

### Closed browser semantics

网页关闭后JavaScript/rAF不执行，也不保证铃声/系统通知。持久化deadline让时间逻辑继续；再次打开由controller结算真实deadline。路由离开但SPA仍活着时应用级controller可以结算。不得补发多轮auto-next，因为当前自动完成只切换下一模式并不自动开始。

### Failure / legacy UX

active与history解码失败保留原字节并提供恢复导出，禁止过滤坏行后覆盖whole history。device的preset/theme/sound偏好继续保留，不能作为active真值。账户删除、rollback、迁移、export须登记active/pending；导入来自旧generation的活动记录必须显式决定“恢复原deadline”或“作为历史待处理”，不能静默带着另一账户session运行。基于旧数组加字段兼容升级，首个active key不存在即idle，不捏造过去活动。

## Implementation split / verification gates

1. Parent确认共享协议owner与key/锁方案；storage生命周期登记及core事件扩展可以独立小提交，现阶段不擅改。
2. Pomodoro owner：纯状态机/严格validator/repository durable transition+reconciliation；保留旧history读取；应用级controller与公开挂载/订阅API。
3. host只挂载controller；PomodoroModule/useTimerTick改订阅+命令，保存失败/retry/export反馈，旧回调及本地Set不再当持久幂等。
4. 测试先保留本轮8正确预期，新增真实route→reload→close/reopen、暂停跨离开、late跨午夜/DST、double-end/zero同时、两tab同session到期、lock缺失、注入pending/history/clear每步故障与各崩溃重开、A/B/A+await中切账号、旧数据坏行、generation rollback/delete。
5. 独立browser验证不能用内存hook tests冒充跨tab原子性；检查最终history只有一条、原deadline不变、recordedAt首次提交时间、UI无假saved/event。检查downstream overview/stats不因晚回来改归属。
