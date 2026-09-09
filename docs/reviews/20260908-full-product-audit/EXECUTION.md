# 全清单执行台账

最新检查点（2026-09-09）：正式完成 **12/312**。REL-05 Countdown和POMO偏好子项独立通过；Habits独立发现窄屏重叠，CSS已补待复验。Board创建及Dashboard备注继续处理。以下保留历次检查记录。

REL-05 Countdown父独立91f544e：固定179e6d5全workspace，before正确create/delete FAIL、after原7组加独立native preset故障恢复8组PASS；实际下载最新稿/原bytes、唯一重试、Pin、baseline和A→B均通过。原包128测试复跑通过，包源码与固定提交无差异。仍是子项，不声称跨tab事务/全功能触控/跨reload稿恢复。

REL-05 POMO偏好独立dc86983及88108ed固定394efad：6项quota、最新值重试、计时active/history原bytes保留、仅失败key重试通过。补真实Chrome临时目录下载，落盘JSON最新6值和唯一文件通过；URL准备错误可见，恢复后成功。浏览器/OS在anchor启动后拒绝无应用ack，不声称该类反馈。全REL-05仍开放。

Habits45a2a06独立功能断言通过但正确样式顺序下390px发现保存错误布局重叠（list.bottom418.8、detail.top224）；父0b16605在实际单列范围<=1024px改auto内容行，保留桌面两行。独立几何/截图复验进行中，该子项未提前核销。

REL-03 独立f02ca28固定5803e86：当前完整workspace图原生8项联合断言通过，补实际Gate选择import→Undo→恢复A私有内容/BYOK→退出→B空白和旧setter拒绝。功能PASS与工作流pending分列，整体复合verification_pending不冒充跨工具或READY_TO_SHIP。REL-04跟进adf7485补auth-attempt和generation PKCE verifier暂存族的排除/捕获代清理声明，旧114键proposal表明确标为历史；完整生命周期仍未核销。

REL-05 Habits作者45a2a06：新增/打卡/日记失败结果、latestdraft、baseline及账户保护，132测试/types/lint与作者native通过，已交独立。Countdown作者179e6d5处理dialog先close问题、全部card mutation及自动preset失败，128测试/types/lint通过，作者native尚在完成。

REL-05 父394efad：共享autosave返回saved/retry，修同值换key跳过写入；POMO六个偏好接入失败提示、latestretry/export。原2个正确hook断言beforeFAIL→PASS；Storage130全、POMO144全+新UI1、两包类型/POMO lint/Web类型通过。非作者native验收进行中；不联动其他仍忽略结果的消费者，不重置已验收timer合同。正式完成仍12/312。

REL-02 独立5803e86固定8e50d8f：9组原生初始化/迁移/故障恢复通过，包含两种顺序、并发、两种旧库、热连接扩表、blocked后重试、事务abort和同步DataError恢复。`functional_status=passed`；保留现有复合状态verification_pending和`workflow_status=cross_tool_verification_pending`。workflow.md §8跨工具验证仍未通过，不把同厂商独立验证冒充跨工具或READY_TO_SHIP；此前凭证401不是当前功能缺陷。全清单的功能完成数字也不构成发布门禁通过。

REL-05 Calendar子项独立3cd8870固定a452d40通过：before正确FAIL、after原生8组及343原测试PASS。实际下载验证最新title/tag，创建唯一、edit原id更新、delete失败保留后重试、外部StorageEvent更新后的旧editing entity拒绝、A→B拒绝写入与下载。纠正描述精度：旧创建失败后隐藏表单仍有文字，缺陷是关闭editor且无可见错误，并非所有内部form均被清空。REL-05整体仍in_progress。

REL-01 核销证据 c02a09a：固定9149778，原真实TT idle午夜失败断言修后通过；六实际消费者同一时刻午夜更新，Tasks Tomorrow→Today、TT跟随今天且历史选择在focus/pageshow后保留。当前整快照四时区矩阵通过，原生预定UTC边界23/25/23.5/24.5小时通过；Metrics绝对时刻证据复核并补当前组件精确断言。该编号本地时间合同已满足，不包含生产/后台服务/闭浏览器通知或跨厂商门禁。

REL-05 Matrix子项独立8e50d8f固定9ebc48c通过：原版正确FAIL、修后native6组及86原测试PASS，真实下载验证最新标题/标签/目标和原始恢复字节，移动失败0事件/成功1，baseline冲突与A→B不写不下载。整体REL-05未关闭。

REL-05 Calendar父a452d40修复创建/编辑/删除失败后关闭editor，新增明确失败、最新草稿retry/export、账户与raw/编辑entity冲突保护。原正确2FAIL→PASS，完整46文件343测试/types/lint通过；导出单测是Blob截获，不冒充真实下载。已交独立原生验收，设备视图偏好与AI订阅写入、跨重载草稿/跨tab事务不计入该子项。

MED-01/02 核销证据 797b4b4：固定6887879，独立复跑134原测试，8组原生浏览器验证通过。默认autoplay策略下真实可信鼠标点击恢复AudioContext；整Chrome进程关闭重开保持绝对deadline与会话id；paused缺席不计时、到期唯一终态/声音停止、quota重试、A锁未释放B可启动、双页面旧命令与并发结束通过。没有物理锁屏/硬件声音测量；不承诺闭浏览器持续播放、历史列表或生产PWA。对应原编号绝对时间恢复及到期停止合同已满足，两个编号分别完成。

REL-01 独立58e2757固定旧快照发现TT无活动时午夜/focus/pageshow仍留昨日，其他同页消费者已刷新。父9149778接统一日时钟，保留活动秒级更新及历史日期选择；作者正确预期before3FAIL/1controlPASS→after4PASS，全包82/typecheck/lint通过。REL-01完整编号保持verification_pending，已交独立原探针复验。

TASK-02 核销证据 58f4076：固定 f3a75f1，真实 Chrome 实际 Task/Board 移动、完成撤销、卡片与列归档恢复、reload 保留关联状态；新增 intent/task/ack 三阶段写入故障、ack 后用户修改原字节保留、幂等重试及操作中 A→B 隔离通过。原始正确断言5/5与新增独立语义3/3分别通过。390px恢复目标至少44px。该编号完整范围已满足；BRD-18、硬删除恢复、通用跨tab事务不联动关闭。完成项为 TT-01/02、POMO-01/02/03、TASK-01/02、STAT-01/02。

REL-04 跟进 f6b1d00：新增两种持久活动状态已在运行时登记，当前116键（40账户/76设备）；原114键表标注为历史快照。新增生命周期测试验证当前代原始导出、A历代删除、B和未归属原始数据保留、A删除后禁止再写；6项focused通过。无运行时遗漏，补证据与文档，完整REL-04仍待验收。

REL-06 认证回执子项通过独立 2274185：固定 ab8c35a，实际 Chrome/IndexedDB/Supabase SDK/Provider/RecoveryNotice 验证撤销事务失败后回执保持 pending、reload 后重试、B 登录后重试 A 保留 B 的 SDK 与业务原始字节、最终回执 quota 后重试且不重复服务器删除。实际宿主 bridge 函数已纳入，但不是完整 AppProviders/router；完整清理参与者、数据库 blocked 和未知服务器结果仍未关闭。因此 REL-06 保持 in_progress。

TASK-02 作者提交 f3a75f1 补身份冲突保护、今日桶和 44px 恢复按钮，3c8e24f 固定最终作者证据。完整编号已交另一位 Agent 独立验收，保持 verification_pending。

MED-01/02 作者 6887879 实现持久绝对会话、暂停/重开、结束状态与音频清理。父审查发现的跨账户 busy 锁遗留和时钟回拨结束时间问题已补；作者测试 Meditation134/Storage126 及 native 通过。两项改为 verification_pending，由非作者 Agent 检查完整合同，含真实点击音频权限路径。作者 autoplay fixture 不作为默认浏览器权限验收。

父会话在 6887879、clean 产品工作树上执行 Web 整合检查：pnpm --filter @repo/web check-types、test（27文件146测试）、build 均 exit 0；Vite 转换1004模块完成。仅是本地整合验证，没有部署或生产服务验收。

目标：按顺序执行、检查并 commit 全部 312 项。原始 [TODO.md](TODO.md) 保留审查基线；[EXECUTION.json](EXECUTION.json) 记录逐项状态和关闭证据。

当前 REL-01（统一时间）已完成实现、父会话包测试与独立四时区/真实浏览器验证，Metrics 编辑绝对时间问题已补修；仍保留完整关闭验证状态。REL-02 已修复并完成本地独立及真实浏览器检查，跨厂商验证待补。REL-03 已提交账户存储、显式迁移、BYOK、身份/路由接线；12个消费者包回归通过，生产打包丢失迁移校验注册已修复并通过独立真实浏览器复验。Settings 删除恢复已提交；独立联合验收8组真实Chrome检查通过（9638dbe）。REL-03本地bug-verify通过，完整关闭仍保留跨厂商/真实环境边界。当前TT-01已按该项范围完成验收，其余项保留逐项状态；不代表其他功能未实现。QA-01 持续核对各项实施前的当前基线，不视为全范围完成。

沿用 TODO 中的 0–5 批次，同批次独立工作可并行。每项关闭需当前实现、验收范围匹配的验证和提交证据。部署、真实服务和跨平台不能用本地单元测试代替。前置门槛属于依赖，未满足时继续其他可执行项，不从总目标移除。

REL-04已提交生命周期声明、账户manifest及独立设备/历史导出UI/API（55d826e、60a1b6e），等待独立真实下载验收。REL-05独立jsdom及Chrome均复现正确业务预期FAIL（aff8175）：Tasks丢草稿、Bookkeeping假保存；Tasks子修复进行中。REL-06已修通用404误判（a1ed33a）；父补4条真实动作与orchestrator集成拒绝清理检查通过，完整删除参与者/首次回执失败仍未关闭。

REL-04独立导出验收d01b671：隔离62f7bfc快照，真实Chrome下载6份文件并核对数据、排除与390px中英文界面通过；此证据仅支持导出范围，不自动关闭全局迁移/删除合同。REL-06父提交762778c/35d7b11：先持久化请求意图、保留未知结果、禁止覆盖此前未确认请求；Settings42文件277测试及类型/lint通过，后续保护focused7测试通过。真实浏览器独立复核进行中；后端结果查询、并发协调及完整清理参与者仍待处理。

REL-05 Tasks/usePref dd744f5与Bookkeeping9222519已提交并推送；父整合Web27文件143测试、类型检查、Vite构建通过，独立保存恢复验收仍在进行。REL-06 intent独立23bd23c证明四个native场景通过；legacy wipe65e87b7修复错误/blocked假成功，auth75测试及native第二页面连接阻塞/释放/重试通过，接口标记deprecated且未接回账户删除。临时混合暂存提交0645a0c已拆成65e87b7/dd744f5，并仅保留远端恢复分支codex/archive/audit-split-0645a0c和同名archive tag，非发布分支。

## 2026-09-09 检查点：保存恢复与计时窗口

REL-05：Tasks/Bookkeeping 的独立验收已完成（7102f22）：原始2例、新增13例及隔离Chrome三次实际JSON下载通过。Bookkeeping恢复按钮已补足44px（45d0665），独立复验9c974e7通过。Metrics初版15be421经独立复现发现旧值重试及待保存操作被覆盖；a61f92d修复后，8c88842独立6例、四条原生失败路径和三次实际JSON下载通过。此范围仅覆盖挂载页面内草稿保留、明确失败、重试和导出；关闭编辑弹窗不等于关闭浏览器，跨重载草稿与跨标签页原子事务仍未完成。REL-05保持in_progress。

TT-01：6cd137e复现跨日/周/月归属、未来污染、DST与暂停段问题；c5b08a7统一窗口交集统计，保留原记录用于编辑/删除，并接入全部Insights和widget。作者原始11例及包内63例通过；已交独立Agent核验真实浏览器、CSV与源记录边界，保持verification_pending。TT-03小时/CSV关联实现已接入但未独立关闭。编号以TODO为准：TT-04为分类删除事务，统计性能为TT-07。

REL-06：c0af11b使用实际Supabase SDK与原生浏览器持久化复现旧清理删除新账户、吞错后恢复旧账户、旧signOut完成后删除新会话三条竞态。原子generation存储基础正在实施，尚未接入SDK、宿主与全部清理参与者；不能把基础设施完成视为整体修复通过。生产认证、真实跨标签页及浏览器重启仍需对应验收。

REL-06原子存储基础已提交2cec3c5：候选/发布/撤销、schema错误保留、legacy防重放，作者31个generation+storage检查与6个原生双context检查通过。SDK接入审查发现同一已发布generation仍可能被另一账户登录写入，正在补原子session owner声明及SDK适配；基础提交不代表原始三项竞态已完整修复。

POMO-01/02诊断b6cf0ee已复现：8个正确预期中7FAIL/1对照PASS，原生running/paused刷新与第二窗口观察3项失败。失败日志是缺陷证据，runner退出0仅表示采集成功。已启动持久会话、Web Lock下权威重读、pending→幂等history→清理和应用级controller实施；刷新、真实关tab重开与双tab结算仍须修后独立验证。

TT-01正式核销：c5b08a7实现与8d951e9独立固定快照验收满足窗口相交、跨日/周/月归属及未来记录排除的完整编号范围；原11断言、全部20 Insights、module/widget、5次真实CSV下载、源记录编辑/删除及LA/Lord Howe四组DST边界通过。独立审查明确无阻止TT-01关闭的额外条件，EXECUTION.json标记completed；当前完成1/312。TT-02/03、分类删除事务、性能、跨tab与后台运行均不随之关闭。主日计数文案歧义作为后续UX问题保留。

REL-06 SDK适配faecd79及原子owner补丁498ceb9已提交。父完整auth16文件109测试、check-types通过，并直接复跑原生SDK探针PASS；3d39533保留before owner错配与after正确拒绝证据。旧退出、刷新及广播不破坏B，A代不能写入B身份；coordinator及页面/host尚未接入，因此REL-06仍in_progress。原生probe验证本机临时profile和synthetic HTTP，不等同生产认证验收。

REL-05消费者核销6fa451f：已逐功能列出剩余写调用与证据边界，STAT仅只读，不应误列为缺少保存恢复的写消费者。MED独立复现首次新场景保存失败后重试写空数组/悬空id。父修复da35b3b：仅成功后推进编辑id/删除reset，保留pending与最新editor，增加重试/手动恢复JSON导出/discard、账户边界与较新数据冲突保护。14文件117测试、check-types、lint通过；增强Blob内容检查后5focused测试通过。独立真实下载及交互验收正在进行，REL-05保持in_progress，MED计时恢复/初始坏schema并未随本次修复完成。


## 2026-09-09 检查点：TT-02 核销与认证宿主接线

TT-02 正式核销：ba20658/64caa5a 实现与 082766b 独立固定快照验收覆盖该编号全部要求。原始状态断言5/5、TT-01原断言11/11、完整包78/78、真实Chrome双tab11/11通过；反复resume/end保持有限时长，锁内检查单任务策略与原始revision，保存失败保留编辑器，损坏数据实际下载逐字节一致。多段时间控件禁用、恢复仅导出边界明确；不关闭TT-03/04/07。当前完成2/312。

REL-06：d895b0b coordinator及23c3423作者native证据已固定。父cfc2d6d接入真实配置provider、登录/注册/OAuth/reset页面、路由恢复错误、捕获代退出和DeviceSessionBridge过期请求隔离。父auth18文件137测试、Web27文件146测试、两包types、Web lint/build及独立DeviceBridge原5断言复跑通过。真实页面整条认证流程已交Agent独立验收；临时profile/synthetic HTTP不代表生产认证通过。REL-06完整删除合同仍在进行。

POMO-01/02：ce4b767持久会话与pending→history→clear结算已提交。父直接复跑verify-close-reopen-native.mjs：关闭整个Chrome进程、跨绝对deadline后同profile重开，恢复同一id并仅结算一次；verify-crash-native.mjs五项故障恢复通过。独立审查新发现旧revision冲突会留下永久retryAction，导致合法Resume被拒；作者正在修复，两个编号均未关闭。

REL-05 MED：28fe049独立真实页面验证保存失败、最新草稿重试、删除失败保留编辑器、较新原始数据冲突与账户切换，以及实际JSON下载和390px恢复按钮通过。只覆盖挂载页面内恢复，不关闭MED计时持续/跨重载草稿或整个REL-05。


## 2026-09-09 检查点：POMO-01/02 核销与 Statistics 实际时长

POMO-01 与 POMO-02 分别正式核销。独立53eda1b固定4868d0a（含ce4b767），复验真实Continue按钮冲突恢复、双tab唯一结算、pending/history/clear故障、实际Host路由切换、paused刷新、queued A→B、整个Chrome进程关闭及两次重开，running/paused分别通过。两项既定合同已满足；不把闭浏览器实时通知、未落盘End意图或云同步计入本次完成。当前完成4/312。

STAT-01/02 原始复现ed7009f四断言全部FAIL。2b1759b仅修STAT-01：KPI/趋势/hour/heatmap统一elapsedMs，保留子分钟，未知旧时长不按配置值估算，显示双语排除提示且原数据不改。三条STAT-01原断言通过，STAT-02仍未修；包22文件161测试、types/lint通过。STAT-01和POMO-03生产者到消费者链路已交独立真实浏览器验收。TASK-01已存在REL-01日期实现，正在独立核验当前Module与sidebar，避免重复实施旧报告已修问题。

REL-06 独立3637866：固定cfc2d6d基础60测试、native双页面11场景通过；原c0af11b三竞态原封复现。当前只证明代隔离、清理失败不假成功与显式重试；首次持久化写入完全失败后不能承诺跨重启退出意图保留，服务端global撤销与账号删除合同仍未闭。独立实际host流程继续进行。

本次git:sync-check -- --fetch已检查：所有长期分支与远端对齐、无local-only refs/reflog commits，23个stash均有远端可恢复ref，Agent/Skill/Workflow无untracked。唯一失败为并行Agent正在生成的未提交验收文件；不能描述工作树为clean。未执行深度unreachable扫描（本次非迁移/清理）。


## 2026-09-09 检查点：7 项正式核销

TASK-01通过0a3a944独立固定快照验收：真实Tasks日期与sidebar/chip/list计数一致、跨年及三组DST、午夜不刷新更新、hidden→visible恢复、旧无年标签不猜日期，包162测试通过。该项已有REL-01实现，本次按证据核销，未重复重写。

STAT-01/POMO-03独立666171d先发现提前结束列表隐藏及POMO时长漏计；父ab94f84补完整消费者后，e747076固定快照实际Chrome复验通过：25分钟配置，25秒工作+5分钟暂停+35秒工作，elapsed60000且completedfalse，列表1:00/双语未完成，概览时长1m而完成轮数0，Statistics实际路由与刷新1min。unknown/zero/多短会话、原始字节不改和390px截图亦通过。两编号分别核销；现已完成TT-01、TT-02、POMO-01、POMO-02、POMO-03、TASK-01、STAT-01，共7/312。

REL-06宿主d8501f3独立验收：真实路由曾吞掉退出专用提示，父10a90ce将错误标记提升至provider后，原完整native断言通过。实际登录/失败隔离/整Chrome进程重开/OAuth StrictMode单次exchange/reset/双页旧A迟到不覆盖B通过；synthetic HTTP、不含生产服务、CSS/SW，不关闭整个REL-06。

STAT-02消费者580bbde已提交：真实completedAt日期分桶、无时间只显示当前总数、旧completed[]缺失done兼容、invalid/future不造历史；原四诊断断言通过，Statistics23文件166测试、types/lint通过。Task/Board生产者TASK-02正并行实施，完整链路需待其固定提交后独立验收。MED-01/02进入绝对时间持久会话与音频停止修复，尚无完成结论。


## 2026-09-09 检查点：STAT-02 核销及认证删除回执

STAT-02正式核销：905abb7固定1b7c0e0（含dafaf9e严格日期）实际Tasks checkbox完成→真实Statistics→reload→undo→次日recomplete→reload通过。分别落入真实UTC completedAt对应自然日；无时间只当前总数，非法/未来/未完成不造日期柱，旧completed[]语义与双语390px图表通过。当前完成8/312，不联动STAT-03/04或Board关联事务。

TASK-02作者1b7c0e0实现完成时间/稳定来源与legacy真实撤销，d7d1733实现Board持久pending链接意图及重试；完整编号仍待独立Board移动/归档/恢复及失败路径验收。MED-01/02持久绝对时间与音频清理实施中，尚未核销。

REL-06父ab8c35a：发现旧回执在auth清理前complete，已改live version2记录原authGeneration并将其清理纳入complete前；旧v1读者拒绝v2，避免只清旧参与者就成功。RecoveryNotice通过宿主coordinator只清捕获原代，不重发服务器删除、不影响新B登录。原三条receipt contract断言before3FAIL→after3PASS；Settings全42文件280通过后补两条现代导航测试，最终receipt/orchestrator/HTTP focused32通过；Settingstypes/lint与Web146/types/lint通过。真实SDK/IDB重开联合独立验收已派发，REL-06仍开放。
