# 全部 To-do：312 项逐项状态清单

最新检查点（2026-10-04，Features）：Settings Features 8个模块开关与Reset to defaults调用方已接受（ec55f9e，web-features-recovery-acceptance/acceptance-5cd63ff.md）。固定产品5cd63ff，before为f359be6；Features实施只改合同§11的11个文件，均在xai-web-settings-features-panel。独立最终acceptance（Astra角色）结论如下：合同§13八个gate逐行对账全部PASS；E1–E25齐全，242个工件hash全部重算一致；六项裁定全部确认；未发现产品缺陷。链路：合同6ded3dc；Sol before oracle 11e0afb；父级host基线b732c27；native before与Features F1 before 4c5323f；Terra实施5cd63ff；fixed重跑eb37a59；Chrome native controls/reset/导出58a93ef；host矩阵与downstream 312b27c；EN/ZH五宽度视觉与键盘5905e37；最终回归0056299（冻结F-B002）；F-B002纠正oracle证据05b21f4；acceptance ec55f9e。裁定一R-PET：768×1024下默认位置的DesktopPet遮挡Reset（ZH中心被盖），判为非阻断；该复现作为UX-03与SHELL-05的缺陷证据记录，不是完成证据。裁定二F-B002：More已接受oracle（boundaries case 002）的getItem spy经physicalKey递归自身，权威before4日志中的失败为RangeError假象。05b21f4证明afbfb24上为业务失败（13/13），三个fixed SHA上整文件每次10/10；More接受条件C-FB002满足，计数不变。caller接受不关闭SET-03、REL-05、REL-07、REL-09、REL-10、UX-03、UX-04、UX-05、SHELL-02、SHELL-03、SHELL-05、QA-01/03/04/09或其他编号；正式13/312完成、299未关闭不变。

最新检查点（2026-10-04）：Sticky Note完整5设置调用方已接受（699f6e6，web-sticky-recovery-acceptance/acceptance-f359be6.md）：固定产品f359be6（Sticky实施210abdf只改合同§11的8个文件；另含共享协调器F1修复）。链路：合同70ff46a；Sol before oracle 4e21e6d（109个case中93个正确FAIL，H1–H8全部确认）与host基线07784c4（23个正确FAIL）；Terra实施210abdf；fixed重跑7ee8de6；Chrome native controls/导出bc92561；host矩阵019f451（冻结共享缺陷F1，已由f359be6修复并经3ea0310与f3a3c82重跑）；EN/ZH五宽度视觉与键盘98125c5；最终回归d7358b9；首次独立最终复审47bbd58因证据缺口G1判BLOCKED（合同§10第4点dashboard-widgets五个测试从未执行，属总控排程遗漏），3debd91补齐（f359be6与2023526均53/53），窄范围独立复审699f6e6接受，六行gate全部PASS。caller接受≠业务/发布完成：SET-12仍待处理（新便签默认值、颜色词表对齐、批量应用、排列/恢复尺寸与native pin能力均未实施），REL-05、QA-01/03/04/09、完整D2/REL/AI、部署与发布均不因此关闭。非阻断后续：键盘Discard后焦点落到body、既有视觉问题、docs/api.md §4.9措辞。正式13/312完成、299未关闭不变；下一caller尚未选择。

最新检查点（2026-10-03，F1）：Sticky caller验证中，独立Chrome host矩阵（019f451）冻结共享离页协调器缺陷F1：持有中的浏览器Back/Forward（POP）离页经成功Retry（部分caller亦经完成或discard）释放后，DepartureCoordinator在过时的blocked快照上第二次调用blocker.proceed()（departureCoordinator.tsx:170），React Router抛出Invalid blocker state transition，错误边界重建协调器子树；导航与保存本身正确。独立Astra角色影响评审0ba68d7判定为共享缺陷（类别A），已接受的More（产品源与7b216a3相同）在Chrome中证实暴露；e3db4e0在修复前另证实Notifications、Date & Time、Smart Lists（含discard窗口）、Dashboard Header（offset路径）与Pomodoro多draft暴露，Collaborate单字段Retry排除。按共享缺陷规则明确修订受保护面后，修复f359be6只改departureCoordinator.tsx并新增一个测试：只对router当前live blocked blocker操作，且每个blocker最多proceed或reset一次，公共契约不变。独立重跑：3ea0310（F1全部冻结复现转PASS；Sticky h1 40/40 runtime gate；Sticky Sol、host、native证据不变；竞态检查PASS）；f3a3c82（受影响已接受caller既有套件69次runner与6个包级门禁全部exit 0，计数与历史接受一致，F1特征为0）。已接受caller的接受记录保留并继续有效；未重跑各caller视觉/布局模式与清单外模式为保留限制。本次不新增编号关闭，正式13/312完成、299未关闭不变；Sticky caller仍为verification_pending。

最新检查点（2026-10-03）：More完整15设置与Reset Default调用方已接受（27adb10，web-more-recovery-acceptance/acceptance-7b216a3.md）：固定产品7b216a3，独立跨vendor最终reviewer（Claude Opus 5.5，隔离worktree只读）逐行确认合同六行gate全部PASS，未复现产品缺陷。证据链：合同fc56d5e；父actual host基线f73b85f在afbfb24为10正确FAIL/1cleanPASS，fe08254在7b216a3为11/11；实现27efbf2/f4c3c62/982ab68/7b216a3；Sol 8e12334独立79/79；native N1–N4（443be31/8c07b57/a6c7b57/a9921b9）；最终回归7b9ef87（Settings-rest 43/300、Web 27/146、Notifications 41/24/15/12、DateTime7及type/lint全部PASS）；Astra 5ac1244曾以B1原生reset/混合操作磁盘导出与B2 sidebar/location key/同字段新旧操作/exactly-once释放证据缺口判BLOCKED，Sol c3ab20d（控制分支c0c9ec5；原提交归档于codex/archive/audit-more-b1b2-evidence-c3ab20d）补齐，27adb10复审确认关闭。保留限制：合成账号与headless Chrome非Tauri或生产认证；all15 pending-reset导出仅jsdom精确断言；详见acceptance报告。caller接受≠业务/发布完成：SET-09仍待处理（Web launch/tray能力说明、任务默认值接通、模板应用或只读标示未完成；两个伪checkbox改为aria-pressed按钮仅为部分支撑），REL-03、REL-05、QA-01/03/04/09、完整D2/REL/AI、部署与发布均不因此关闭。EXECUTION.json本次补记此前漏记的Notifications接受链（f130cb0/7ce03a5/a41cd1d/ad223a2）与More链至REL-05证据，未改任何条目状态。正式13/312完成、299未关闭不变；下一caller候选Sticky5尚未确认或启动。

最新检查点（2026-09-11）：Date & Time完整调用方已接受（d0d934d）。Notifications产品固定afbfb24，Sol完整41/41通过（f130cb0），Astra当前真实host15/恢复边界24/Settings297/DateTime7通过（7ce03a5），父当前native20和types/lint5通过（a41cd1d），已由Astra ad223a2逐项接受完整八字段调用方合同（web-notifications-recovery-astra/acceptance-afbfb24.md）；下一项More全部15设置与Reset Default合同已固定fc56d5e；父actual Settings/Shell基线f73b85f为10正确FAIL/1cleanPASS，覆盖设备与两个账号字段丢失、路由/退出逃逸及显示默认值但remove失败的离页保护；Terra实施与Sol完整独立矩阵并行进行，尚未接受More。旧8字段丢失、隐藏时间离开、格式错误串扰和开关轨道反例均有固定修复证据；旧usePref库存已更新为27files/72bindings/52setters（3705558），仅排程子集。正式13/312完成、299未关闭。Spark启动器2184dfa已实测两个named roles且无嵌套派生，未测试额度耗尽回退。

核对日期：2026-09-09；最新审查检查点：`0143952`；各批次固定产品版本与证据见下文及执行台账。本文件保留每项具体工作、优先级与验收要求，并合并执行台账状态。

**正式完成 13 项；待完成验收 3 项；进行中 3 项；待处理／尚未核销 293 项。合计未关闭 299 项。** 当前 Web／项目流程范围 194 项，跨模块、新能力及门禁约束项 118 项。待处理不代表完全没有实现，完成状态只按现有关闭证据统计。

已完成：REL-01、TT-01/02/03、POMO-01/02/03、MED-01/02、TASK-01/02、STAT-01/02。

待完成验收：REL-02/03/04。其中 REL-02/03 功能验收通过，跨工具工作流尚未完成。

进行中：REL-05/06、AI-02。TT-03 当前独立复验通过，证据见 web-time-hour-independent/20260909-review.md。REL-05 的多个 consumer 已独立验收，不自动关闭整个公共合同。

当前执行检查点：正式完成 13/312，未关闭 299 项。Tasks 3241529 的原8条与原生浏览器初次/整进程重开3+3通过，但 Astra 0143952 完整审查新增18条中6条失败：详情原始编辑基线、目标消失后的可见草稿恢复、批量删除会话隔离、completed列表/标签级联；Sol已按该报告提交170c526，作者原8/18及包176通过，父a4f6369独立原18与两套native初次/整进程重开各3+3通过；Astra f3a519c 确认原四组已修复，但新增Complete后继续编辑会撤销完成状态的1条FAIL，Sol窄修0c4b6b4已提交，作者aa747d4在170c526加两文件的隔离快照31/178通过；D2原生adapter已由e9fb5e7修复，父40e4adb固定整合两套Tasks原生各3+重开3通过，Astra dbc2e69 已有界接受Tasks D1：原8/18/5、新pending编辑1及包178通过；产品固定e9fb5e7，测试overlay已明确。Board 728822d 修复与 Calendar 2fed984 清理已获 Astra 0b3a043 有界接受；父固定回归证据 ab3a150、7f19aec 保留。Astra 同时明确 D2 实施合同，Terra 已提交D2基础e9ff409；原生锁故障45b83b6与基础7条失败080f86b分别经e9fb5e7/c201a1d修复；父96aa7b1固定原14、迁移7以及native3+重开1均通过，Astra0203c56确认原14/C37/shared8通过，但新增删除授权例外2FAIL，基础仍待严格receipt修复；完整调用方转换仍待后续批次。父 bf2935b 在真实 Chrome 复现 Tasks 修复前3条详情失败，修复后固定170c526三条原native断言与重开检查通过，完整范围仍待Astra复核。Calendar测试适配1660df9与六subscriber修复6efba71此前已取得有界接受。D2账户生命周期共同锁、旧客户端激活门禁、Board详情三项丢稿及完整AI-02/REL-05仍开放；不新增编号关闭。

当前并行接续：Dashboard Header完整当前会话恢复合同已获Astra106f1d8接受，固定73b4eb9：Astra boundaries5/recovery12/blur4/copy6共27、Sol原42、父actualHost5/5/2及nativeDv1五/已保存重开四、Sol受影响native六全部通过。正常uncertainty Retry实际单次写入且正确清除guard/unload；f64旧39/42失败和所有历史正确反例保留。作者3595cbd全包228/shell11及lint/type通过，父4600368的f64八native/中英五宽度、Solccf72e3的交互及e119 source-copy、c9共享门禁1bdc844按无变源码明确归属复用。接受文档web-dashboard-header-departure-astra/acceptance-73b4eb9.md逐层对齐，不宣称未保存崩溃恢复。Pomodoro051212a、Collaborate6254cb4、共享协调器ba7f0da接受保持有效。后续按完整writer合同继续；库存2ea710f固定c9为29files/85bindings/65setters，仅直接旧hook排程输入不是全部writer覆盖率。正式完成13/312，未关闭299；REL-05/09/D2不因此核销。 当前接续为完整Date & Time五控件合同3638e21：父fixed73 actualSettings+FullShell原8已在8c05c85确认7正确FAIL/1cleanPASS，五个quota选择丢失、普通路由/退出无拦截；Sol冻结完整字段/recovery before，Terra按合同实施，父继续host/native，Astra最终接受。

任务说明来自[原始完整清单](TODO.md)，状态来自[执行台账](EXECUTION.json)。原始审查基线与当前代码不同；执行前仍应复核。跨模块发布、同步及路线图门禁继续有效。


## 推荐先做的批次

| 顺序 | 任务 | 关闭标准 |
|---|---|---|
| 0 | QA-01：刷新基线、核销已完成工作 | 确定仍需修改的真实清单 |
| 1 | REL-01/02/03/04/05/06；POMO-01/02；TT-01/02；TASK-01/02；STAT-01/02；MED-01/02 | 不丢活动、不计错时、不串账号，存储结果真实 |
| 2 | DEP-01至06/08至12；GOV-01至04 | 预览/生产版本可查，离线重开可用，任务看板不漏项 |
| 3 | AI-01至04；BK-01/02/03/06/08/10；BRD-17/22/26 | 核心行为与数据正确，能力承诺真实 |
| 4 | SET、UX、各功能P2及其余GOV/SK | 高频体验、文档与流程事实对齐 |
| 5 | JOB/APP/PLAT/PLUG/SYN/CRY/ADM/SITE | 仅在所属门禁满足后实施，不为Web修复强行解冻全部平台 |

## 分组索引

| 编号 | 功能/范围 | 项数 | 前提 |
|---|---|---:|---|
| REL | [跨功能时间、账户与存储可靠性](#rel) | 12 | 当前范围 |
| TT | [Time Tracker](#tt) | 8 | 当前范围 |
| POMO | [Pomodoro](#pomo) | 5 | 当前范围 |
| MED | [Meditation](#med) | 4 | 当前范围 |
| TASK | [Tasks](#task) | 7 | 当前范围 |
| HAB | [Habits](#hab) | 5 | 当前范围 |
| CAL | [Calendar](#cal) | 5 | 当前范围 |
| MAT | [Matrix](#mat) | 3 | 当前范围 |
| CD | [Countdown](#cd) | 3 | 当前范围 |
| STAT | [Statistics](#stat) | 4 | 当前范围 |
| BRD | [Boards：每项子能力](#brd) | 29 | 当前范围 |
| DASH | [Dashboard 与全部 widgets](#dash) | 12 | 当前范围 |
| AI | [AI Chat 与工具](#ai) | 9 | 当前范围 |
| BK | [Bookkeeping](#bk) | 12 | 当前范围 |
| MET | [Metrics](#met) | 5 | 当前范围 |
| SET | [Settings：shell 与14个面板](#set) | 15 | 当前范围 |
| SHELL | [Shell、搜索与网页桌宠](#shell) | 7 | 当前范围 |
| UX | [全局UI/UX与可访问性](#ux) | 7 | 当前范围 |
| DEP | [Web部署、离线启动与观测](#dep) | 12 | 当前范围 |
| JOB | [需产品范围确认的后台及服务能力](#job) | 10 | 新增能力须先明确承诺和对应路线图 |
| GOV | [流程、文档与开发看板](#gov) | 16 | 当前范围 |
| SK | [14个项目Skill逐项改进](#sk) | 14 | 当前范围 |
| APP | [Mac App与本地持久化](#app) | 22 | 按App路线；新desktop-next、晋级dev及release需明确确认 |
| PLAT | [Plugin平台与Organizer](#plat) | 10 | G1平台门内推进；不得凭本清单解冻后续业务插件 |
| PLUG | [尚未解冻的业务插件](#plug) | 6 | 具体业务插件等待G1及对应路线图门禁 |
| SYN | [账号云同步与服务端](#syn) | 19 | 账号云同步保持paused；仅解冻后实施且只同步account-sync实体 |
| CRY | [密码学、恢复与原生密钥延期gate](#cry) | 22 | 同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞 |
| ADM | [Admin：6切片与10页面](#adm) | 16 | Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成 |
| SITE | [官网与下载发布入口](#site) | 4 | PROPOSED；未获得operator确认前不开site工作分支 |
| QA | [实施前复核与最终验收](#qa) | 9 | 各验证随对应模块与外部环境门禁执行 |

<a id="rel"></a>

## REL · 跨功能时间、账户与存储可靠性

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[03-web-data-ai-settings.md](03-web-data-ai-settings.md)。

- [x] **REL-01 · 已完成 · P1 · 修复**：统一用户时区、自然日、全天事项、绝对时间与午夜刷新合同。验收：Tasks/Habits/Calendar/Statistics/Metrics/Time Tracker同一时刻的今天一致；DST按下一自然日计算。
- [ ] **REL-02 · 待完成验收；功能验证已通过，跨工具工作流验收待完成 · P1 · 修复**：修复Auth与device共用IndexedDB但分别初始化object store的冲突。验收：全新profile中session→device、device→session和并发初始化均成功，老库迁移保留数据。
- [ ] **REL-03 · 待完成验收；功能验证已通过，跨工具工作流验收待完成 · P1 · 修复**：对业务内容和BYOK密钥按账户隔离，区分设备级偏好。验收：A退出后B不读到A内容/key；未归属旧数据迁移有明确选择和回退。
- [ ] **REL-04 · 待完成验收 · P1 · 修复**：补全Time Tracker、记账及布局、Metrics等数据的清理/导出/迁移登记。验收：实体到存储key的所有权清单完整；账号删除和导出覆盖所有声明数据。
- [ ] **REL-05 · 进行中 · P1 · 修复**：统一存储读写结果，禁止持久化失败后界面仍显示保存成功。验收：quota/禁止访问/数据库不可用时保留草稿并显示未保存、重试和导出。
- [ ] **REL-06 · 进行中 · P1 · 修复**：把账号删除的IDB blocked/error作为真实失败处理。验收：关闭相关连接、通知其他tab、可重试；只有完成清理才显示成功回执。
- [ ] **REL-07 · 待处理／尚未核销 · P2 · 修复**：区分未初始化、合法空数据、损坏数据和未知schema。验收：删除所有内容后重开仍为空；坏数据保留可导出副本且不自动覆盖为样例。
- [ ] **REL-08 · 待处理／尚未核销 · P2 · 核验**：复现并消除跨tab整对象最后写覆盖风险。验收：两tab交错新增/修改不丢记录；实体事务/revision/冲突策略有真实浏览器证据。
- [ ] **REL-09 · 待处理／尚未核销 · P2 · 修复**：统一可恢复草稿与提交边界。验收：日记、AI输入、便签、账单等未提交内容能恢复；不只依赖blur或beforeunload。
- [ ] **REL-10 · 待处理／尚未核销 · P2 · 修复**：限制resetAllPrefs公共默认实现只重置偏好。验收：现有Appearance/Features安全行为保留；新面板默认重置不会清业务实体。
- [ ] **REL-11 · 待处理／尚未核销 · P2 · 优化**：为本地repository补版本迁移、输入边界校验和容量策略。验收：旧版本数据可升级并回退；非法字段、超限数据有稳定错误而非白屏。
- [ ] **REL-12 · 待处理／尚未核销 · P2 · 决策**：明确关闭网页、退出账号、切换账号期间各活动会话是否继续计入。验收：形成每类会话的恢复/修正规则；本地计时不以账号云同步为前提。

<a id="tt"></a>

## TT · Time Tracker

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [x] **TT-01 · 已完成 · P1 · 修复**：按查询窗口相交部分拆分时段，修复跨日/周/月漏算和未来记录污染。验收：23:50至00:10总20分钟，两天各10分钟；未来1小时不计今日。
- [x] **TT-02 · 已完成 · P1 · 修复**：统一开放、暂停、继续、结束状态不变量和幂等操作。验收：每个会话无重复开放segment；反复resume/end不多计；跨tab活动策略明确。
- [x] **TT-03 · 已完成 · P2 · 修复**：按小时拆分时段，统一Insights、CSV、图表与widget的聚合口径。验收：跨小时/跨DST/部分相交记录各处总数一致，范围和时区可追溯。
- [ ] **TT-04 · 待处理／尚未核销 · P2 · 修复**：分类删除与记录变更事务化，保留历史名称和墓碑。验收：删除前显示影响记录/时长，可撤销；失败不出现分类已删而记录未处理。
- [ ] **TT-05 · 待处理／尚未核销 · P2 · 优化**：将活动会话、分类和主操作前置，折叠日期进度辅助卡。验收：390px首屏可识别正在计时内容；短记录显示秒，完整分类名称可读。
- [ ] **TT-06 · 待处理／尚未核销 · P2 · 优化**：增加重开恢复说明、离开时长修正和超长会话提示。验收：用户可继续或修正离开时间；说明与实际记录相符。
- [ ] **TT-07 · 待处理／尚未核销 · P2 · 优化**：降低历史记录每秒全量聚合开销。验收：一万时段测量基线；历史聚合按数据变更更新，仅活动段秒级刷新。
- [ ] **TT-08 · 待处理／尚未核销 · P2 · 文档**：核对single/multi mode实际语义并同步PRD、日志和页面。验收：文档不再声明未消费的模式；独立verify后更新READY_TO_SHIP状态。

<a id="pomo"></a>

## POMO · Pomodoro

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [x] **POMO-01 · 已完成 · P1 · 修复**：持久化活动会话、暂停信息和deadline，使用应用级会话控制。验收：启动→切路由→刷新→关tab重开仍能继续或正确结算。
- [x] **POMO-02 · 已完成 · P1 · 修复**：区分deadline、实际elapsed和recordedAt，完成结算按sessionId去重。验收：晚回来不把真实到期时间改为回来时间；多次恢复只写一条。
- [x] **POMO-03 · 已完成 · P1 · 修复**：统一提前结束与Statistics的数据合同。验收：25分钟配置实做1分钟时记录及统计均为1分钟，并标记未完成。
- [ ] **POMO-04 · 待处理／尚未核销 · P2 · 决策**：明确Stop、Reset及中途离开的保存规则。验收：每个按钮的保存/放弃含义清楚；Reset不静默丢失用户以为已保存的记录。
- [ ] **POMO-05 · 待处理／尚未核销 · P2 · 优化**：收起样式/配色/预设，突出模式、时间、开始与恢复动作。验收：主要操作无需穿过大量设置；全局运行状态可达；声音能力说明真实。

<a id="med"></a>

## MED · Meditation

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [x] **MED-01 · 已完成 · P1 · 修复**：用绝对时间替代每次interval加一并持久活动会话。验收：后台节流/锁屏后显示真实经过时长；重开有明确恢复状态。
- [x] **MED-02 · 已完成 · P1 · 修复**：补到期结束状态并停止音频和timer。验收：到00:00后仅完成一次，不继续播放或空转；播放错误可见。
- [ ] **MED-03 · 待处理／尚未核销 · P2 · 决策**：定义冥想历史记录、离开修正和重新播放规则。验收：是否计入离开时长、是否续播和实际记录字段有可测试合同。
- [ ] **MED-04 · 待处理／尚未核销 · P2 · 优化**：首屏围绕场景、时长和开始，外观设置移入抽屉。验收：开始流程简短，静音/结束可达；文档更新为当前真实音频能力。

<a id="task"></a>

## TASK · Tasks

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [x] **TASK-01 · 已完成 · P1 · 修复**：用真实dueDate驱动Today/Tomorrow/Next7，计数与列表共用selector。验收：跨午夜自动更新；今天包含定义内的今日/逾期，明天不等于未来7天。
- [x] **TASK-02 · 已完成 · P1 · 修复**：统一完成状态、completedAt和Board来源身份。验收：移动任务/Board列、完成撤销、归档恢复后链接与状态不丢；不以listId作为永久身份。
- [ ] **TASK-03 · 待处理／尚未核销 · P2 · 修复**：清单/标签元数据订阅跨tab更新并允许合法空集合。验收：删除最后标签后重开不回种默认；名称验证完整，删除影响已完成项有规则。
- [ ] **TASK-04 · 待处理／尚未核销 · P2 · 修复**：补基础CRUD撤销、来源跳转和保存状态。验收：批量完成/删除显示范围；失败不丢内容；来源Task/Board可互相定位。
- [ ] **TASK-05 · 待处理／尚未核销 · P2 · 优化**：修复图标代码直接输出并收敛重复筛选导航。验收：inbox/book/home显示真实图标；移动端列表和筛选可达。
- [ ] **TASK-06 · 待处理／尚未核销 · P2 · 决策**：处置Local Calendars/已完成/不做/垃圾桶无动作入口。验收：已实现则接真实数据与恢复路径；未实现则禁用/隐藏并说明，计数不写死。
- [ ] **TASK-07 · 待处理／尚未核销 · P2 · 优化**：改进横向列导航、列表/看板切换和多选控件。验收：长清单有清晰滚动/列选择；键盘、触屏及空态流程可用。

<a id="hab"></a>

## HAB · Habits

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **HAB-01 · 待处理／尚未核销 · P1 · 修复**：打卡、连续天、月完成率统一当地日期和应完成周期。验收：频率/startDate生效；未来打卡不抬高结果；完成率不超过100%。
- [ ] **HAB-02 · 待处理／尚未核销 · P2 · 修复**：午夜/可见性恢复后更新今日状态并保留合法空习惯库。验收：长开页面今天自动变化；清空后重开不注入样例。
- [ ] **HAB-03 · 待处理／尚未核销 · P2 · 修复**：日记按变化保存durable draft并处理切习惯/外部更新冲突。验收：直接关闭不丢输入；其他tab更新不静默覆盖草稿。
- [ ] **HAB-04 · 待处理／尚未核销 · P2 · 优化**：突出今天打卡、应完成日和休息日，整理周标题与徽章。验收：圆点不挤压文字；命中区44px；未来/历史补记含义清楚。
- [ ] **HAB-05 · 待处理／尚未核销 · P1 · 文档**：校准可保存但不执行的提醒入口。验收：显示实际支持/权限/已安排状态；关页提醒建设关联JOB组。

<a id="cal"></a>

## CAL · Calendar

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **CAL-01 · 待处理／尚未核销 · P1 · 修复**：统一当地日期、默认日期和长驻页面Today更新。验收：主日历、mini日历及记录日期一致；跨午夜后Today指向当天。
- [ ] **CAL-02 · 待处理／尚未核销 · P2 · 修复**：统一用户事件和Board feed在月格、日详情及各视图的投影。验收：月格可见的卡片在详情中也可见，且可回到来源。
- [ ] **CAL-03 · 待处理／尚未核销 · P2 · 决策**：补重复事件本次/此后/全部编辑语义、例外与跨日范围。验收：重复编辑前给范围选择；daily/weekly及时区边界不误改其他发生项。
- [ ] **CAL-04 · 待处理／尚未核销 · P2 · 优化**：明确空日历与演示模式，修复底部周行裁切和事件溢出。验收：桌面全部周可达；已有+N可见可打开；移动优先议程/周视图。
- [ ] **CAL-05 · 待处理／尚未核销 · P1 · 文档**：提醒字段与真实通知能力分开显示。验收：保存事件不等于已安排系统提醒；实现调度前明确限制。

<a id="mat"></a>

## MAT · Matrix

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **MAT-01 · 待处理／尚未核销 · P2 · 修复**：补真实编辑、删除、完成动作和合法空态。验收：装饰checkbox/更多按钮有真实语义或禁用；清空后不恢复8条样例。
- [ ] **MAT-02 · 待处理／尚未核销 · P2 · 决策**：确定Matrix是独立任务库还是Tasks优先级视图。验收：PRD明确数据关系；若整合则共享taskId，不创建持续漂移副本。
- [ ] **MAT-03 · 待处理／尚未核销 · P2 · 优化**：保留Cmd/Ctrl+箭头移动，补触屏移动与未分类引导。验收：键盘及触屏都有移动路径；四象限空态能引导设置重要/紧急。

<a id="cd"></a>

## CD · Countdown

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **CD-01 · 待处理／尚未核销 · P2 · 修复**：区分date-only倒计日与带时区deadline。验收：重开、跨时区、DST和跨年显示符合定义；保存时保留日期类型。
- [ ] **CD-02 · 待处理／尚未核销 · P2 · 优化**：去重节日预设、清理实现术语并整理卡片操作。验收：重复New Year入口去重；隐藏/历史/到期/置顶含义清楚。
- [ ] **CD-03 · 待处理／尚未核销 · P2 · 决策**：定义重复/到期动作及是否提供提醒。验收：无后台动作时明确只是日期差展示；新增提醒接JOB统一机制。

<a id="stat"></a>

## STAT · Statistics

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [x] **STAT-01 · 已完成 · P1 · 修复**：以elapsedMs统计专注，给旧schema明确兼容规则。验收：提前结束、暂停、恢复的列表与KPI一致，不用配置时长代替实际时长。
- [x] **STAT-02 · 已完成 · P1 · 修复**：用真实completedAt生成任务时间序列。验收：不把历史全部完成数塞到最后一天；无历史时间时只显示当前总数。
- [ ] **STAT-03 · 待处理／尚未核销 · P2 · 修复**：统一当地日/小时切片与跨午夜刷新。验收：热图、小时分布、周月总计可从源记录复算。
- [ ] **STAT-04 · 待处理／尚未核销 · P2 · 优化**：明确来源、范围、分母和空态，区分专注与Time Tracker工时。验收：各KPI可查看定义/明细；无数据不呈现误导性趋势或总工时承诺。

<a id="brd"></a>

## BRD · Boards：每项子能力

归属：web。前提：当前范围。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **BRD-01 · 待处理／尚未核销 · P2 · 修复**：Kanban使用实体revision及原子移动，区分空板与模板。验收：跨列移动不丢卡；同页/跨tab冲突可见；长板列头和落点清楚。
- [ ] **BRD-02 · 待处理／尚未核销 · P2 · 修复**：多看板搜索不改变删除资格，删除时清理活动板及视图引用。验收：全局有多板但搜索只剩一板时仍按全局规则判断。
- [ ] **BRD-03 · 待处理／尚未核销 · P2 · 修复**：Workspace移动/删除事务化，并明确当前只是本地分组。验收：移板失败可回退；Team文案不暗示已存在成员或租户授权。
- [ ] **BRD-04 · 待处理／尚未核销 · P2 · 修复**：List显示名称与语义状态分离，规范归档/恢复/删除。验收：改名Done不意外改变规则；删列表前可见卡片影响及恢复路径。
- [ ] **BRD-05 · 待处理／尚未核销 · P2 · 修复**：Card归档/恢复/永久删除同步维护关联实体。验收：不会遗留无法定位的Task链接；永久删除有影响说明。
- [ ] **BRD-06 · 待处理／尚未核销 · P2 · 修复**：卡片详情改局部patch和可恢复草稿，补字段错误反馈。验收：不逐字符重写全部boards；非法URL/保存失败显示就地原因。
- [ ] **BRD-07 · 待处理／尚未核销 · P2 · 修复**：Label目录与自动化引用保持完整。验收：urgent等系统标签可识别；删标签同步处理筛选/规则/卡片引用。
- [ ] **BRD-08 · 待处理／尚未核销 · P2 · 文档**：Member目录明确为本地负责人标记。验收：普通分配不显示账号邀请、在线或权限已生效；真实成员功能另走JOB。
- [ ] **BRD-09 · 待处理／尚未核销 · P2 · 修复**：统一Priority枚举、标签和筛选的组合语义。验收：四级优先级一致；urgent标签与priority关系有明确规则。
- [ ] **BRD-10 · 待处理／尚未核销 · P2 · 修复**：对legacy日期做一次性可追溯迁移。验收：保留原始Today/M-D值；不确定年份需确认；范围与时区校验完整。
- [ ] **BRD-11 · 待处理／尚未核销 · P2 · 修复**：Storage schema迁移允许合法空板并保留损坏副本。验收：同步scope字段不被当作已接云；schema升级可复现。
- [ ] **BRD-12 · 待处理／尚未核销 · P2 · 决策**：Checklist旧计数迁移与Done自动勾选规则明确化。验收：不生成看似真实的Item1标题；自动勾选可解释并可撤销。
- [ ] **BRD-13 · 待处理／尚未核销 · P2 · 优化**：Comments与activity区分人工评论和系统动态。验收：标本地actor、不暗示@投递；分页/编辑/删除策略明确。
- [ ] **BRD-14 · 待处理／尚未核销 · P2 · 优化**：Attachments明确是外链并展示hostname及错误。验收：不把provider标签当OAuth连接；错误链接可修正，协议限制保留。
- [ ] **BRD-15 · 待处理／尚未核销 · P1 · 文档**：Permissions/visibility明确只有本地元数据。验收：Shared状态不被理解为真正授予访问；真实服务端ACL转JOB。
- [ ] **BRD-16 · 待处理／尚未核销 · P2 · 修复**：Share只在真实分享意图时发事件并处理剪贴板失败。验收：关闭弹窗不记分享；mock链接边界清楚，有导出替代。
- [ ] **BRD-17 · 待处理／尚未核销 · P1 · 修复**：Automation Lite明确触发范围，修同日变更/午夜遗漏。验收：显示规则、最近执行和影响；不隐式覆盖人工排序；关页调度转JOB。
- [ ] **BRD-18 · 待处理／尚未核销 · P1 · 修复**：完成Task link双向状态与生命周期合同。验收：依赖TASK-02；移动、完成、撤销、删恢复、刷新全链不丢链接。
- [ ] **BRD-19 · 待处理／尚未核销 · P2 · 修复**：Saved filters清理失效引用并跟随日期变化。验收：删除标签/成员后不保留坏筛选；多视图范围一致，零结果可清除。
- [ ] **BRD-20 · 待处理／尚未核销 · P2 · 优化**：Table补键盘网格、列控制与大数据性能。验收：编辑持久化正确；排序/隐藏/列宽可用；达到测量阈值后虚拟化。
- [ ] **BRD-21 · 待处理／尚未核销 · P2 · 修复**：Board Calendar明确拖动修改due还是整个区间。验收：日期范围合法；触屏可点选移动日期；跨月/DST回归通过。
- [ ] **BRD-22 · 待处理／尚未核销 · P1 · 修复**：Board Dashboard逾期统计排除已完成卡或明确范围。验收：isOpen与列表过滤共用；KPI可钻取相同记录。
- [ ] **BRD-23 · 待处理／尚未核销 · P2 · 优化**：Timeline增加未排期/远期定位和键盘日期编辑。验收：区间移动resize原子；远期卡不因30日窗口而失去访问路径。
- [ ] **BRD-24 · 待处理／尚未核销 · P2 · 修复**：Map支持当前语言、tile失败、离线和重试。验收：地图不可用时有位置列表；保留视角且可取消加载。
- [ ] **BRD-25 · 待处理／尚未核销 · P2 · 修复**：Inbox转移到Board使用事务或可恢复命令。验收：崩溃/重试不丢不重复，目标明确并可撤销。
- [ ] **BRD-26 · 待处理／尚未核销 · P1 · 修复**：Planner移除伪造9/11/13点安排和未标记样例。验收：真实时间未建模前显示今日到期清单；超过6卡仍完整可达。
- [ ] **BRD-27 · 待处理／尚未核销 · P2 · 修复**：Board Calendar feed统一范围投影和来源跳转。验收：依赖CAL-02；日详情不漏卡、起止范围完整；只读投影不暗示双向同步。
- [ ] **BRD-28 · 待处理／尚未核销 · P2 · 决策**：将Board导入导出合同接成可用备份入口或明确尚无UI。验收：导出预览、schema/引用校验、试恢复和错误回滚可验证。
- [ ] **BRD-29 · 待处理／尚未核销 · P2 · 核验**：对Board所有视图补真实响应式及辅助技术验收。验收：375/768/1440、200%缩放、软键盘、触屏、键盘DnD与多层弹窗焦点。

<a id="dash"></a>

## DASH · Dashboard 与全部 widgets

归属：web。前提：当前范围。来源：[03-web-data-ai-settings.md](03-web-data-ai-settings.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **DASH-01 · 待处理／尚未核销 · P2 · 修复**：Grid空态按visible order判定，补键盘重排/尺寸和Undo。验收：删除最后组件后能添加；拖动仅提交时落盘；静态组件不随秒tick全量重算。
- [ ] **DASH-02 · 待处理／尚未核销 · P2 · 核验**：Clock明确选择时区、无效时区恢复及DST。验收：系统时区与自选时区区分，半小时时区和跨日正确。
- [ ] **DASH-03 · 待处理／尚未核销 · P2 · 决策**：World Clocks允许清空或解释最后城市不可删。验收：添加/删除/重开状态一致，日期差标签清楚。
- [ ] **DASH-04 · 待处理／尚未核销 · P2 · 优化**：Stat Tasks说明当前总量或今日范围并精确跳转。验收：图中分母可解释；点击落到相同过滤条件。
- [ ] **DASH-05 · 待处理／尚未核销 · P2 · 优化**：Stat Streak显示所属习惯及连胜定义。验收：最大单习惯连胜不被误读成全部习惯共同达成。
- [ ] **DASH-06 · 待处理／尚未核销 · P2 · 决策**：Stat Pomos的8点展示与真实目标接线或标为刻度。验收：超目标/未设目标可理解，统计使用当地日。
- [ ] **DASH-07 · 待处理／尚未核销 · P2 · 修复**：Time Tracker widget与主体共用订阅和聚合。验收：今日累计与当前总计分开；暂停/结束可达且遵守TT合同。
- [ ] **DASH-08 · 待处理／尚未核销 · P2 · 修复**：Weather增加可见时TTL检查、online重试和手动刷新。验收：缓存陈旧/手动值/来源/更新时间始终可辨，失败可恢复。
- [ ] **DASH-09 · 待处理／尚未核销 · P2 · 修复**：Mini Calendar使用统一事件查询并定位所选日期。验收：与主日历日期、周起始和事件点一致。
- [ ] **DASH-10 · 待处理／尚未核销 · P2 · 修复**：Stickies默认设置接线并恢复编辑草稿。验收：颜色/字体等影响新便签；删除可撤销，拖动/resize有键盘替代。
- [ ] **DASH-11 · 待处理／尚未核销 · P2 · 优化**：Mail摘要明确非Push并加入来源定位/已读策略。验收：点击定位实体；无数据为空态，不冒充邮件或系统通知。
- [ ] **DASH-12 · 待处理／尚未核销 · P2 · 修复**：Upcoming复用主日历重复事件查询和deep link。验收：最多展示条数有说明；DST/例外规则一致，点击定位事件。

<a id="ai"></a>

## AI · AI Chat 与工具

归属：web。前提：当前范围。来源：[03-web-data-ai-settings.md](03-web-data-ai-settings.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **AI-01 · 待处理／尚未核销 · P1 · 修复**：普通多轮发送携带有预算的历史消息。验收：第二轮请求包含第一轮信息；截断与工具往返保留原始用户意图。
- [ ] **AI-02 · 进行中 · P1 · 修复**：工具动作等待业务持久回执再向模型报告成功。验收：quota/非法ID/不存在/无subscriber不报success；requestId幂等。
- [ ] **AI-03 · 待处理／尚未核销 · P1 · 修复**：为生成过程增加queued/running/completed/interrupted/failed状态。验收：切路由/断网/重开保留已生成内容并标中断；不把partial当完整回答。
- [ ] **AI-04 · 待处理／尚未核销 · P2 · 修复**：输入改多行并处理中文IME、Shift+Enter、粘贴和高度。验收：选候选不误发送；提示与真实快捷键一致。
- [ ] **AI-05 · 待处理／尚未核销 · P2 · 文档**：附件和语音未闭环时禁用或标明未支持。验收：文件chip不暗示内容已发送；真实实现转JOB，不把metadata当附件处理。
- [ ] **AI-06 · 待处理／尚未核销 · P2 · 修复**：Provider切换和key读写增加错误/加载/取消与generation保护。验收：旧provider响应不覆盖新状态；无未处理IDB异常，配置错误文案明确。
- [ ] **AI-07 · 待处理／尚未核销 · P2 · 优化**：消息分条存储、节流checkpoint并设容量策略。验收：长会话不每chunk重写全部历史；保存失败可恢复且不泄露key。
- [ ] **AI-08 · 待处理／尚未核销 · P2 · 优化**：工具确认展示改前改后、来源、删除影响与撤销。验收：刷新后未确认动作不自动执行；重试不能重复创建或删除。
- [ ] **AI-09 · 待处理／尚未核销 · P2 · 优化**：减弱装饰背景并让starter/洞察只指向真实能力。验收：来源、范围、provider/model和浏览器本地BYOK边界清楚。

<a id="bk"></a>

## BK · Bookkeeping

归属：web。前提：当前范围。来源：[03-web-data-ai-settings.md](03-web-data-ai-settings.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **BK-01 · 待处理／尚未核销 · P1 · 修复**：完善账本schema验证和保存失败反馈，分离空账本/演示数据。验收：损坏数据不覆为样例；新用户净资产不混示例；遵守REL账户/存储合同。
- [ ] **BK-02 · 待处理／尚未核销 · P1 · 修复**：金额采用最小货币单位或decimal并集中校验。验收：金额finite/正负语义/极大值/币种/账户校验一致，编辑撤销旧余额后准确重算。
- [ ] **BK-03 · 待处理／尚未核销 · P1 · 修复**：规则文本识别先预览，避免日期数字被当金额。验收：9月8日午饭38元解析为38或要求确认；自定义账户引用有效，标明规则识别。
- [ ] **BK-04 · 待处理／尚未核销 · P2 · 优化**：看板、日历、明细共享账本和月份范围。验收：来源/范围可见；点击某日展示同批交易；保存/错误/空态一致。
- [ ] **BK-05 · 待处理／尚未核销 · P2 · 修复**：搜索包含显示名称，优化大列表与过滤恢复。验收：账户/分类中文名可搜索；无结果可清筛选，性能有测量基线。
- [ ] **BK-06 · 待处理／尚未核销 · P1 · 修复**：汇率和投资币种建模，修复非CNY一律按USD折算。验收：EUR/JPY等用正确报价币种；历史汇率快照和手动估值日期明确。
- [ ] **BK-07 · 待处理／尚未核销 · P2 · 决策**：预算按账本与期间建实体并确定结转规则。验收：不同账本/月份预算不串用；默认5000只存在明确示例模式。
- [ ] **BK-08 · 待处理／尚未核销 · P1 · 决策**：确定删除账户/账本对历史与余额的规则并事务执行。验收：优先归档；不无声改写历史账户或遗留余额；有invariant回归。
- [ ] **BK-09 · 待处理／尚未核销 · P2 · 修复**：周期记账增加发生项去重，明确当前为手动模板。验收：同一occurrence重试不重复入账；补记可预览；关页执行转JOB。
- [ ] **BK-10 · 待处理／尚未核销 · P1 · 修复**：CSV使用标准解析/转义、列映射、转账双边与重复检测。验收：含逗号/换行、转账和多币种往返正确；微信/支付宝仅对实际支持格式声明。
- [ ] **BK-11 · 待处理／尚未核销 · P2 · 补全**：增加版本化完整备份及dry-run恢复。验收：账户/交易/预算/规则/私密报销等声明字段完整，错误回滚、重复导入幂等。
- [ ] **BK-12 · 待处理／尚未核销 · P2 · 优化**：完善账单删除撤销、图表数据表和录入焦点。验收：主录入入口集中；键盘可达，图表可钻取相同记录。

<a id="met"></a>

## MET · Metrics

归属：web。前提：当前范围。来源：[03-web-data-ai-settings.md](03-web-data-ai-settings.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **MET-01 · 待处理／尚未核销 · P2 · 修复**：个人参数和体重初始为空，校验正数/finite并正确换算单位。验收：示例独立；178/70不假装用户已设置；kg/斤切换保留原值，跨tab草稿不覆盖。
- [ ] **MET-02 · 待处理／尚未核销 · P2 · 修复**：统一趋势范围、午夜刷新与无数据状态。验收：列表/图表/分享范围分别标具体日期；长期打开不会停在旧日。
- [ ] **MET-03 · 待处理／尚未核销 · P2 · 补全**：区分文字分享、图片分享与结构化数据备份。验收：图片真正作为file分享或下载；JSON/CSV可恢复，空数据导出有说明。
- [ ] **MET-04 · 待处理／尚未核销 · P2 · 优化**：共享可访问弹窗并补删除Undo和恢复草稿。验收：Escape、焦点循环、背景inert可用；删除可撤销，不把指标趋势简单标为健康结论。
- [ ] **MET-05 · 待处理／尚未核销 · P3 · 决策**：保留睡眠/饮水/运动Planned边界，另行确定扩展需求。验收：未实现指标不改成可用入口，也不算本次bug必须补齐。

<a id="set"></a>

## SET · Settings：shell 与14个面板

归属：web。前提：当前范围。来源：[03-web-data-ai-settings.md](03-web-data-ai-settings.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **SET-01 · 待处理／尚未核销 · P2 · 修复**：设置shell收敛host/package重复渲染并修共享Toggle。验收：统一composition、nav及aria-current；44px点击外壳内轨道保持46×26；14面板回归。
- [ ] **SET-02 · 待处理／尚未核销 · P2 · 修复**：Appearance统一自动保存或编辑后保存语义，完成fontScale接线。验收：实际正文随字号缩放；主题/语言/密度跨tab一致，非法值有fallback。
- [ ] **SET-03 · 待处理／尚未核销 · P2 · 决策**：Features目录由模块注册驱动并明确哪些可关闭。验收：新增Time Tracker/Bookkeeping/Metrics处置明确；关闭后的rail/search/deep-link一致。
- [ ] **SET-04 · 待处理／尚未核销 · P2 · 修复**：Account使用真实session资料并统一退出action。验收：设置与头像菜单退出均有效；头像编辑/升级无能力时禁用；删除范围明确。
- [ ] **SET-05 · 待处理／尚未核销 · P1 · 文档**：Premium持续保留UX preview边界。验收：session_id回调不当真实权益；支付未配置时禁用；生产计费转JOB。
- [ ] **SET-06 · 待处理／尚未核销 · P2 · 修复**：Smart Lists偏好接入真实任务selector和可见性。验收：切换设置后任务列表和计数真实变化，重开保留。
- [ ] **SET-07 · 待处理／尚未核销 · P1 · 修复**：Notifications拆分应用内/浏览器/离页推送并显示能力状态。验收：权限unsupported/denied/granted可见；勿扰跨夜正确；未安排不报成功。
- [ ] **SET-08 · 待处理／尚未核销 · P2 · 修复**：Date & Time接入日历/时钟统一合同。验收：周起始/周数/节日等按支持范围生效；显示时区与IANA时区选择分开。
- [ ] **SET-09 · 待处理／尚未核销 · P2 · 修复**：More按host能力处理原生开关并接通任务默认值。验收：Web不假装launch/tray可用；模板可应用或标示只读；伪checkbox改原生语义。
- [ ] **SET-10 · 待处理／尚未核销 · P1 · 文档**：Integrations对未配置clientId禁用连接并准确显示stub。验收：不因本地connected布尔值宣称数据同步；失败可见；真实OAuth转JOB。
- [ ] **SET-11 · 待处理／尚未核销 · P2 · 文档**：Collaborate区分头像外观与成员/权限/mention通知。验收：安全类偏好不假装已生效；真实权限接后端后验收。
- [ ] **SET-12 · 待处理／尚未核销 · P2 · 修复**：Sticky默认颜色/字体/间距/尺寸设置接入创建和渲染。验收：新便签默认与已有便签批量应用分开；native pin能力按host说明。
- [ ] **SET-13 · 待处理／尚未核销 · P2 · 修复**：Hotkeys帮助从实际command registry生成。验收：不宣传未实现的Cmd+C/T/P；按OS和焦点范围显示，避免浏览器保留键。
- [ ] **SET-14 · 待处理／尚未核销 · P2 · 补全**：About接真实build版本、帮助、反馈及政策入口。验收：链接可达且中英一致，Coming soon不被当已上线服务。
- [ ] **SET-15 · 待处理／尚未核销 · P2 · 修复**：AI设置完善保存/测试/失败/取消状态。验收：依赖AI-06和REL-02；快速切provider无竞态，测试连接的真实请求行为明确。

<a id="shell"></a>

## SHELL · Shell、搜索与网页桌宠

归属：web。前提：当前范围。来源：[03-web-data-ai-settings.md](03-web-data-ai-settings.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **SHELL-01 · 待处理／尚未核销 · P2 · 优化**：主导航提供清晰模块名称和常用/更多入口。验收：移动端账户/设置可达；图标不完全依赖hover记忆。
- [ ] **SHELL-02 · 待处理／尚未核销 · P2 · 修复**：CmdK补日历事件、AI会话、时间记录、账单及指标实体索引。验收：统一模块/记录分组，禁用功能不泄漏入口，结果定位实体。
- [ ] **SHELL-03 · 待处理／尚未核销 · P2 · 优化**：CmdK定义索引更新和无结果策略。验收：修改后重新打开结果最新；若需开着实时更新则订阅数据版本；键盘焦点回收正常。
- [ ] **SHELL-04 · 待处理／尚未核销 · P2 · 修复**：统一root偏好值域校验与跨tab订阅。验收：主题/语言/fontScale异常不抛出导致白屏；切tab后表现一致。
- [ ] **SHELL-05 · 待处理／尚未核销 · P2 · 修复**：Web Pet保存隐藏偏好并在拖动结束后持久化位置。验收：重开不强制显示；位置不越安全区，不每pointermove同步写盘。
- [ ] **SHELL-06 · 待处理／尚未核销 · P2 · 优化**：桌宠避让核心操作、支持键盘/关闭和reduced-motion。验收：专注/录入不被遮挡；超时任务有清理，无障碍对话框可用。
- [ ] **SHELL-07 · 待处理／尚未核销 · P3 · 决策**：区分静态鼓励文案、习惯徽章与统一成就系统。验收：不宣传未实现的AI或成就账本；统一成就若立项需事件ID、重算与撤销规则。

<a id="ux"></a>

## UX · 全局UI/UX与可访问性

归属：web。前提：当前范围。来源：[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **UX-01 · 待处理／尚未核销 · P2 · 优化**：建立统一页面标题、toolbar、表单、dialog和状态反馈规范。验收：参考当前DESIGN与tokens；跨模块加载/空/错误/未保存/恢复状态一致。
- [ ] **UX-02 · 待处理／尚未核销 · P2 · 优化**：重排看板标题和工具栏，收起归档/自动化/分享等次要动作。验收：标题不挤成三行；主视图和过滤清楚；Archived两个入口含义区分。
- [ ] **UX-03 · 待处理／尚未核销 · P2 · 优化**：加入全局活动会话入口并处理移动底栏/面板/宠物避让。验收：开始、暂停、结束和回来源可达；不被浮层/软键盘盖住。
- [ ] **UX-04 · 待处理／尚未核销 · P2 · 修复**：统一真实数据、样例、手动值、未实现与只读能力的标识。验收：个人工作空间默认空态；未接线控件无成功假象，不泄漏开发术语。
- [ ] **UX-05 · 待处理／尚未核销 · P2 · 核验**：完成键盘、焦点、触屏、大字号、暗色和对比度验收。验收：375/390/768/1440、200%缩放、中英长文、读屏/键盘有实际证据。
- [ ] **UX-06 · 待处理／尚未核销 · P3 · 优化**：逐步减少808项历史颜色字面量并收敛过度blur/嵌套卡片。验收：语义token覆盖实际元素；保持数据密度，不机械套营销页风格。
- [ ] **UX-07 · 待处理／尚未核销 · P2 · 核验**：建立真实设备截图与交互回归基线。验收：修复移动采集缩放条件；截图像素不误作CSS像素；关键交互不只做CSS断言。

<a id="dep"></a>

## DEP · Web部署、离线启动与观测

归属：web。前提：当前范围。来源：[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **DEP-01 · 待处理／尚未核销 · P1 · 修复**：恢复Cloudflare token/账号/Pages权限并验证preview发布。验收：实际credential检查与部署成功；不只因build通过就宣称发布正常。
- [ ] **DEP-02 · 待处理／尚未核销 · P1 · 核验**：确认真实生产部署ID、时间、source SHA和artifact hash。验收：通过平台部署记录/版本端点核对，线上与待发差异可见。
- [ ] **DEP-03 · 待处理／尚未核销 · P1 · 修复**：统一GitHub构建环境变量来源并校验必需配置。验收：direct upload前注入公开VITE配置；Pages后台变量不再被误认为可修改已构建JS。
- [ ] **DEP-04 · 待处理／尚未核销 · P1 · 文档**：明确production/preview分支及公开Demo auth边界。验收：Web代码合入、main、preview和production状态分列；真实账号开放另走门槛。
- [ ] **DEP-05 · 待处理／尚未核销 · P1 · 修复**：Service Worker预缓存完整版本化HTML/JS/CSS等启动资源。验收：真实浏览器断网冷启动各核心入口可用；缓存失败有恢复路径。
- [ ] **DEP-06 · 待处理／尚未核销 · P1 · 修复**：建立SW更新、旧HTML与chunk一致性及安全重载机制。验收：新旧版本切换不白屏；草稿不丢；坏部署能回退可用壳。
- [ ] **DEP-07 · 待处理／尚未核销 · P2 · 决策**：明确公开sourcemap策略并接私有错误映射。验收：若私有化则发布目录不含map；若保留公开则有明确决策和secret扫描。
- [ ] **DEP-08 · 待处理／尚未核销 · P1 · 修复**：校验生产CSP/headers与AI/Auth/地图等真实依赖域。验收：构建预期与HTTP响应一致；允许/拒绝场景实测，启用auth不因域阻断。
- [ ] **DEP-09 · 待处理／尚未核销 · P1 · 补全**：部署gate串联类型检查、关键生命周期测试和build浏览器smoke。验收：失败阻止发布；有并发发布控制、部署回执与回滚路径。
- [ ] **DEP-10 · 待处理／尚未核销 · P1 · 补全**：接通RUM/Sentry实际ingest、flush和release SHA。验收：定时/pagehide批量发送有上限；真实错误在接收端可查，失败不悄悄丢弃。
- [ ] **DEP-11 · 待处理／尚未核销 · P1 · 核验**：修正Supabase runbook与可部署入口的差异。验收：空staging可按文档完成迁移、functions与验证；501/无入口不能列为可用服务。
- [ ] **DEP-12 · 待处理／尚未核销 · P2 · 补全**：发布后按线上版本验证关键功能并回填开发看板。验收：线上/验证/源码SHA一致可查；部署失败与待发功能明确显示。

<a id="job"></a>

## JOB · 需产品范围确认的后台及服务能力

归属：web。前提：新增能力须先明确承诺和对应路线图。来源：[02-tasks-time-boards.md](02-tasks-time-boards.md)、[03-web-data-ai-settings.md](03-web-data-ai-settings.md)、[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **JOB-01 · 待处理／尚未核销 · P1 · 决策**：为每类功能确定仅重开补算还是关页后准时执行。验收：任务、习惯、番茄、日历、看板、记账、AI分别写合同；列支持浏览器/离线/退出情况。
- [ ] **JOB-02 · 待处理／尚未核销 · P1 · 建设**：建立持久jobs/outbox、状态查询、幂等、重试与死信。验收：关闭客户端后任务仍可追踪；重复提交/执行不重复副作用，失败可恢复。
- [ ] **JOB-03 · 待处理／尚未核销 · P1 · 建设**：实现提醒调度与Web Push投递，消费权限及勿扰设置。验收：关页真实投递、过期/取消/跨时区/跨夜勿扰可验证；不以SW常驻为假设。
- [ ] **JOB-04 · 待处理／尚未核销 · P1 · 建设**：把需要无人值守的Board自动化与周期记账接持久计划。验收：每occurrence有执行记录；补跑/取消/重试不重复，影响记录可审计。
- [ ] **JOB-05 · 待处理／尚未核销 · P1 · 建设**：如需AI离页完成，任务先持久化再执行并支持重新订阅。验收：重开按jobId/cursor获取结果；取消/重试/计费幂等明确。
- [ ] **JOB-06 · 待处理／尚未核销 · P2 · 建设**：如需真实附件与语音，完成读取/解析/上传和录音STT/TTS。验收：mime/大小/权限/解析中/失败/取消、token预算和用户确认齐全。
- [ ] **JOB-07 · 待处理／尚未核销 · P1 · 建设**：如需真实协作，建设成员、ACL、分享token与撤销。验收：权限在服务端强制；过期/跨账号/撤销/mention投递有正负例。
- [ ] **JOB-08 · 待处理／尚未核销 · P1 · 建设**：如需真实Notion/GCal/Linear集成，完成后端OAuth与数据同步。验收：token交换/保存/刷新/撤销、provider错误、增量拉取和重试真实有效。
- [ ] **JOB-09 · 待处理／尚未核销 · P1 · 建设**：如需真实Premium，接服务端权益和支付webhook。验收：签名验证、重放幂等、真实取消/对账可用；客户端session_id不能授予权益。
- [ ] **JOB-10 · 待处理／尚未核销 · P1 · 建设**：如需账号删除服务，建立持久删除任务及进度/完成回执。验收：离页继续、失败重试、最终清理可查；本地与云删除范围独立确认。

<a id="gov"></a>

## GOV · 流程、文档与开发看板

归属：web（project-system）。前提：当前范围。来源：[01-inventory-governance.md](01-inventory-governance.md)、[05-visual-ux-audit.md](05-visual-ux-audit.md)。

- [ ] **GOV-01 · 待处理／尚未核销 · P1 · 修复**：修dev_log解析器遗漏19项并保留不可解析记录。验收：表格/bullet/纯文本/Status标题和多迭代fixture通过；discovered/parsed/unparsed逐文件对账。
- [ ] **GOV-02 · 待处理／尚未核销 · P2 · 修复**：修roadmap解析器漏3份AI文档，表头#可选。验收：全部167个slug可解析；Slug/Status/Source/Depends On结构校验可见。
- [ ] **GOV-03 · 待处理／尚未核销 · P2 · 修复**：按Target及iteration定位状态并对账11项陈旧manifest。验收：不再只取首个Status；对应SHIPPED证据、最新更新时间和历史迭代可追溯。
- [ ] **GOV-04 · 待处理／尚未核销 · P2 · 文档**：校准CmdK、Time Tracker、Bookkeeping、Metrics等状态和日志字段。验收：实现/独立验证/发布分别记录；不因已合入倒推验证通过。
- [ ] **GOV-05 · 待处理／尚未核销 · P2 · 文档**：补AI、Countdown、Habits、Matrix、Meditation、Metrics、Pet、Statistics、Time Tracker九份canonical PRD。验收：按用户能力而非npm包建档；需求→实现→测试→发布有链，未确认需求不臆造。
- [ ] **GOV-06 · 待处理／尚未核销 · P2 · 文档**：统一六模块、分支存在性、G1与Organizer冻结例外的authority镜像。验收：CLAUDE/AGENTS/Cursor/模块图一致；独立web/dev正常分叉不当错误合并。
- [ ] **GOV-07 · 待处理／尚未核销 · P2 · 文档**：清理PLUGIN_MAP的旧Next.js、无音频、统计代理与陈旧状态描述。验收：历史与当前分区；Stable和最新迭代状态分列；真实运行包和文档anchor区分。
- [ ] **GOV-08 · 待处理／尚未核销 · P2 · 修复**：区分package/roadmap/route/rail/panel并自动生成计数。验收：24切片不称24模块；14设置面板及新增功能从registry得到。
- [ ] **GOV-09 · 待处理／尚未核销 · P2 · 修复**：Overview显示解析覆盖、冲突、验证SHA、线上SHA与近期失败。验收：快照fresh仅代表采集时间；首屏阻塞优先，帮助说明折叠。
- [ ] **GOV-10 · 待处理／尚未核销 · P2 · 修复**：Testing按feature+workflow+ref组织当前和历史结果。验收：pass/fail/partial/unknown含义明确；0失败不暗示验证完成，旧配置/运行记录去重。
- [ ] **GOV-11 · 待处理／尚未核销 · P2 · 治理**：登记全部延期gate的owner、截止日、环境和验证证据。验收：24h carve-out不无限延期；到期显示overdue，未填checklist不算smoke。
- [ ] **GOV-12 · 待处理／尚未核销 · P2 · 优化**：Skill/Agent界面区分源维护完整度与生成补齐。验收：66/66可展示与1/66源完整不混淆；65项补齐不是65个坏技能。
- [ ] **GOV-13 · 待处理／尚未核销 · P3 · 文档**：更新开发看板TEMPLATE/DESIGN及设计目录归档说明。验收：历史提案不当现状；tracked active DESIGN与父目录历史原型分开。
- [ ] **GOV-14 · 待处理／尚未核销 · P2 · 核验**：测量dashboard生成约90秒线索并改善启动/错误反馈。验收：profile确认瓶颈后优化；可显示生成中，失败不空白；不无证据声称普遍慢。
- [ ] **GOV-15 · 待处理／尚未核销 · P2 · 治理**：统一Feature/Bug/Roadmap/Fanout收口与superseded关系。验收：各阶段receipt绑定feature/iteration/commit；同步消费者done/N-A/pending可重入。
- [ ] **GOV-16 · 待处理／尚未核销 · P2 · 治理**：保留跨机器可恢复检查点与安全环境恢复说明。验收：精确stage、commit/push、sync-check通过；secret值不入Git，D3/D4不绕过。

<a id="sk"></a>

## SK · 14个项目Skill逐项改进

归属：web（project-system）。前提：当前范围。来源：[01-inventory-governance.md](01-inventory-governance.md)。

- [ ] **SK-01 · 待处理／尚未核销 · P2 · 优化**：xai-feature-brief固定feature_id、范围及失败/恢复验收。验收：后续dossier和迭代能追溯原brief。
- [ ] **SK-02 · 待处理／尚未核销 · P2 · 优化**：xai-feature-full-loop逐阶段输出Target/commit/验证receipt。验收：收口检查registry解析和dossier增量，不只更新包状态。
- [ ] **SK-03 · 待处理／尚未核销 · P2 · 优化**：xai-roadmap-loop以统一manifest schema驱动并核对对应Target。验收：emit/serial后不显示旧迭代状态。
- [ ] **SK-04 · 待处理／尚未核销 · P2 · 优化**：xai-release-log分change_kind、source/deployed commit、环境与artifact。验收：纯文档更新不改变产品验证健康，SHIPPED不等deploy。
- [ ] **SK-05 · 待处理／尚未核销 · P2 · 优化**：xai-dev-dashboard-sync加源集合与生成集合覆盖断言。验收：漏项/冲突/当前commit验证范围可见，关联GOV-01至03。
- [ ] **SK-06 · 待处理／尚未核销 · P2 · 优化**：xai-consistency-audit串联稳定ID与PRD/package/test/deploy双向映射。验收：代码问题与记录漂移分别给证据。
- [ ] **SK-07 · 待处理／尚未核销 · P2 · 优化**：xai-module-classify结构化核对全部authority镜像。验收：按产品职责分类，明确host物理位置与产品归属差异。
- [ ] **SK-08 · 待处理／尚未核销 · P2 · 优化**：xai-feature-dossier-sync按用户能力维护九份缺失档案。验收：一个feature可映射多包/迭代，不从实现臆造已批准需求。
- [ ] **SK-09 · 待处理／尚未核销 · P2 · 优化**：xai-account-sync-scope-check提供实体级D4 scope和可执行负例。验收：device-local永不入outbox；导出/App映射与双设备证据独立。
- [ ] **SK-10 · 待处理／尚未核销 · P2 · 优化**：xai-web-to-desktop-sync回执绑定两端SHA和runtime profile。验收：D3包含跨页恢复及parity，合并/build不能代替运行验收。
- [ ] **SK-11 · 待处理／尚未核销 · P2 · 优化**：xai-sync-fanout-dispatch逐消费者记录结果与证据。验收：失败可重入，pending进入任务页，避免口头宣布全部同步。
- [ ] **SK-12 · 待处理／尚未核销 · P2 · 优化**：xai-admin-control-plane-sync明确backend owner/RBAC/audit/secret边界。验收：用户AI设置变化不被当成控制面已接通。
- [ ] **SK-13 · 待处理／尚未核销 · P2 · 优化**：xai-web-deploy-preflight核验线上版本与过期gate。验收：预检pass与实际deploy分列，关联DEP收口证据。
- [ ] **SK-14 · 待处理／尚未核销 · P2 · 优化**：xai-desktop-release-gate绑定架构、artifact和真机证据。验收：签名/公证/更新/回退/睡眠缺证据保持partial。

<a id="app"></a>

## APP · Mac App与本地持久化

归属：app。前提：按App路线；新desktop-next、晋级dev及release需明确确认。来源：[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **APP-01 · 待处理／尚未核销 · P2 · 核验**：当前SHA的Web容器离线冷启动、老数据升级与路由恢复。验收：真实打包App可离线启动；404/损坏包可恢复，保留产物及机器证据。
- [ ] **APP-02 · 待处理／尚未核销 · P2 · 修复**：normal/overlay profile及native能力、权限失败统一反馈。验收：Web不调用原生专属能力；不同窗口身份负例通过。
- [ ] **APP-03 · 待处理／尚未核销 · P1 · 核验**：用当前HEAD生成可复现的签名app/DMG及artifact manifest。验收：架构、hash、源码SHA可追溯；旧打包记录不代替当前成功。
- [ ] **APP-04 · 待处理／尚未核销 · P2 · 优化**：窗口Move/Resize配置写入合并、flush并保留旧配置。验收：高频拖动不每事件刷盘；关闭/崩溃恢复位置可验证。
- [ ] **APP-05 · 待处理／尚未核销 · P1 · 决策**：分清mock离线入口与真实离线会话缓存。验收：Demo不被当登录成功；真实账号模式拒绝mock bypass。
- [ ] **APP-06 · 待处理／尚未核销 · P2 · 核验**：更新5月Mac smoke为当前版本定向验收。验收：Applications启动、菜单、重启、离线、新增plugin/存储有实际记录。
- [ ] **APP-07 · 待处理／尚未核销 · P1 · 补全**：原生提醒改用真实事件源、持久occurrence及OS调度。验收：发送成功后ack；关窗/睡眠/重启不重复或无声遗漏，权限失败可见。
- [ ] **APP-08 · 待处理／尚未核销 · P1 · 修复**：托盘动作支持主窗销毁后create-or-focus并显示状态新鲜度。验收：StartPomodoro/TodayTasks仍可用，不把静态托盘状态当后台执行。
- [ ] **APP-09 · 待处理／尚未核销 · P2 · 核验**：全局快捷键支持冲突反馈、重绑和多布局。验收：其他App抢占、主窗已销毁等场景有明确结果。
- [ ] **APP-10 · 待处理／尚未核销 · P2 · 优化**：菜单命令保持中英、disabled理由及多窗口target一致。验收：新插件菜单可用且不作用于错误窗口。
- [ ] **APP-11 · 待处理／尚未核销 · P1 · 补全**：配置真实签名updater feed、公钥、下载安装和回滚。验收：placeholder明确未配置；真实双版本升级及失败回退通过。
- [ ] **APP-12 · 待处理／尚未核销 · P2 · 修复**：缓存可读性按schema校验，显示更新时间与损坏原因。验收：存在key不等readable；支持修复/导出，不假报离线数据可用。
- [ ] **APP-13 · 待处理／尚未核销 · P1 · 治理**：Phase2/Phase3 RC分别列本地与云端及硬件gate。验收：组合单测通过不自动关闭真实通知/更新/同步门槛。
- [ ] **APP-14 · 待处理／尚未核销 · P2 · 文档**：明确SQLite事实源、localStorage兼容层和实体owner。验收：每实体syncScope、持久层、迁移/备份边界可查。
- [ ] **APP-15 · 待处理／尚未核销 · P2 · 核验**：SQLite/SQLCipher处理Keychain锁定、迁移中断、磁盘满和容量。验收：区分无密钥/无权限/损坏；大namespace有分页或明确上限。
- [ ] **APP-16 · 待处理／尚未核销 · P1 · 修复**：repository bridge等待SQLite提交，串行化写入并报告pending/committed。验收：退出重开不以旧SQLite覆盖新local值；乱序/写失败可恢复。
- [ ] **APP-17 · 待处理／尚未核销 · P2 · 核验**：Web数据迁移提供预览、幂等、断点续传与原数据保留。验收：真实旧数据演练；Notes等不支持实体明确列出而非悄悄跳过。
- [ ] **APP-18 · 待处理／尚未核销 · P1 · 修复**：离线outbox仅记录实际变更并有合并、容量和坏记录隔离。验收：整family重复写不无限膨胀；长期离线后可恢复处理。
- [ ] **APP-19 · 待处理／尚未核销 · P2 · 优化**：AI离线保留草稿并要求用户明确继续有费用的请求。验收：恢复网络不自动重复收费；离线不可用原因清楚。
- [ ] **APP-20 · 待处理／尚未核销 · P1 · 文档**：日历连接状态、缓存和真实同步区别显示。验收：lastSuccess/需刷新/错误可见；真实OAuth和数据同步关联SYN/JOB。
- [ ] **APP-21 · 待处理／尚未核销 · P1 · 补全**：备份显示所有覆盖/排除实体及待同步数量，并演练恢复。验收：不将只支持9类record称整应用备份；pending数据有处理方案。
- [ ] **APP-22 · 待处理／尚未核销 · P2 · 决策**：将开机启动和系统Deep Link列独立新切片。验收：确定权限/失败/协议安全语义后实现，不将现有目标文案当已交付。

<a id="plat"></a>

## PLAT · Plugin平台与Organizer

归属：plugin。前提：G1平台门内推进；不得凭本清单解冻后续业务插件。来源：[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **PLAT-01 · 待处理／尚未核销 · P2 · 核验**：typed manifest/PluginInstance升级及旧实例迁移。验收：中心显示available/planned/权限缺失的真实原因，默认配置可升级。
- [ ] **PLAT-02 · 待处理／尚未核销 · P1 · 修复**：实例store采用提交成功后更新或失败rollback。验收：磁盘失败不留内存成功假象；跨窗口revision一致。
- [ ] **PLAT-03 · 待处理／尚未核销 · P1 · 修复**：add-to-desktop处理存储创建成功但窗口创建失败。验收：实例有pending/created/failed状态，可重试、补偿或删除。
- [ ] **PLAT-04 · 待处理／尚未核销 · P1 · 修复**：由host启动协调实例恢复，逐实例失败隔离。验收：不开Plugin Center也能按合同恢复；一个失败不阻断其他实例。
- [ ] **PLAT-05 · 待处理／尚未核销 · P1 · 核验**：placement/resize/opacity/pin/click-through/Spaces真机验证。验收：requested/applied/unsupported明确；穿透有逃生方式，多屏/全屏不失控。
- [ ] **PLAT-06 · 待处理／尚未核销 · P2 · 修复**：Plugin Center窗口状态由可靠原生事件持久化。验收：不只依赖beforeunload异步保存；逻辑/物理坐标、多屏恢复正确。
- [ ] **PLAT-07 · 待处理／尚未核销 · P1 · 核验**：完成sample-widget的Phase2全生命周期smoke。验收：实际创建、重启、禁用、删除、resize、权限拒绝均有证据，PARTIAL才能收口。
- [ ] **PLAT-08 · 待处理／尚未核销 · P2 · 核验**：Organizer验证真实文件引用、移动、权限、断链和撤销。验收：旧mock读取与真实Finder流分开；批量结果及失败可见。
- [ ] **PLAT-09 · 待处理／尚未核销 · P1 · 核验**：逐插件登记恢复矩阵，禁止由Organizer推广所有插件。验收：每种实例成功/失败可查，新增sample-widget证据独立。
- [ ] **PLAT-10 · 待处理／尚未核销 · P2 · 决策**：Organizer closeout明确Finder tags和真实pin的后续范围。验收：分别定义系统行为、权限和恢复验收，不只补按钮文案。

<a id="plug"></a>

## PLUG · 尚未解冻的业务插件

归属：plugin。前提：具体业务插件等待G1及对应路线图门禁。来源：[04-deployment-platform.md](04-deployment-platform.md)、[01-inventory-governance.md](01-inventory-governance.md)。

- [ ] **PLUG-01 · 待处理／尚未核销 · P2 · 建设**：Widget Host与内置widgets接真实provider并限制独立timer。验收：来源、刷新频率、实例配置和恢复明确，不继续用mock habit历史。
- [ ] **PLUG-02 · 待处理／尚未核销 · P1 · 建设**：Clipboard接真实系统监听与隐私边界。验收：敏感应用排除、allow/deny、TTL、容量、权限和实体契约统一。
- [ ] **PLUG-03 · 待处理／尚未核销 · P1 · 建设**：OCR接真实识别并完善取消/失败/预览。验收：mock按钮不当可用能力；隐私和权限在识别前清楚。
- [ ] **PLUG-04 · 待处理／尚未核销 · P2 · 建设**：Calendar Glance先完成provider与离线缓存一致性。验收：样例不当个人事件，缓存时间和重连状态可见。
- [ ] **PLUG-05 · 待处理／尚未核销 · P2 · 建设**：Native Pet明确轻量窗口/节能/穿透逃生后再接AI。验收：位置和生命周期可恢复；AI订阅真实接线后才宣传智能响应。
- [ ] **PLUG-06 · 待处理／尚未核销 · P2 · 决策**：Native Meditation先定义与Web的差异和共享模型。验收：Web已实现不等native挂件完成；独立设计/验收后再建包。

<a id="syn"></a>

## SYN · 账号云同步与服务端

归属：sync。前提：账号云同步保持paused；仅解冻后实施且只同步account-sync实体。来源：[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **SYN-01 · 待处理／尚未核销 · P1 · 修复**：服务端请求context验证签名/issuer/audience/expiry及设备状态。验收：拒绝无Bearer和伪造header账号；撤销设备不能读写；不依赖未证明的gateway配置。
- [ ] **SYN-02 · 待处理／尚未核销 · P1 · 核验**：空staging完整执行schema迁移并归档版本/角色授权指纹。验收：11份迁移、RLS和grants可复现，不能只看源码存在。
- [ ] **SYN-03 · 待处理／尚未核销 · P1 · 核验**：将双账号、撤销设备、普通/特权连接RLS测试接真实数据库CI。验收：本次跳过的integration实际运行；负例不能越权读写。
- [ ] **SYN-04 · 待处理／尚未核销 · P1 · 修复**：sync-push把锁或原子CAS放到revision比较前并限制批量。验收：两个同base并发请求仅一个成功；冲突结果和mutation重试幂等。
- [ ] **SYN-05 · 待处理／尚未核销 · P1 · 补全**：push引擎接真实持久outbox/transport/重试。验收：401/429/网络中断/kill后结果可恢复；本地成功与云ack分开。
- [ ] **SYN-06 · 待处理／尚未核销 · P1 · 修复**：sync-pull校验active device并保证稳定分页/cursor边界。验收：并发写入和重连补拉不丢不重复，跨账号cursor无效。
- [ ] **SYN-07 · 待处理／尚未核销 · P2 · 核验**：commit-seq authority实测真实隔离级别与并发语义。验收：文档REPEATABLE READ与事务配置一致，seq单调且授权正确。
- [ ] **SYN-08 · 待处理／尚未核销 · P1 · 核验**：nonce租约、shadow/冲突路径及重启防重用。验收：真实SQL事务证明消费；过期/时钟跳变/撤销设备负例通过。
- [ ] **SYN-09 · 待处理／尚未核销 · P1 · 修复**：明确used_nonces访问边界并检查实际grants。验收：采用private schema或显式RLS/revoke；anon/authenticated无未授权读写。
- [ ] **SYN-10 · 待处理／尚未核销 · P1 · 补全**：recovery-proof绑定数据库和签名adapter替代501入口。验收：过期、重放、错误账号、一次挑战消费与恢复链实测。
- [ ] **SYN-11 · 待处理／尚未核销 · P1 · 补全**：backfill补可部署入口及nonce/ack/DB接线。验收：可实际部署，失败续进度和重复确认幂等。
- [ ] **SYN-12 · 待处理／尚未核销 · P1 · 核验**：rekey两阶段真实DB/设备中断恢复。验收：部分batch、旧设备撤销、备份兼容、强杀重启不丢数据或密钥。
- [ ] **SYN-13 · 待处理／尚未核销 · P2 · 补全**：审计链接持久sink、查询、保留和权限。验收：恢复可校验digest；仅内存hash合同不称生产审计。
- [ ] **SYN-14 · 待处理／尚未核销 · P1 · 补全**：Web/App sync blob driver及reconnect adapter真实接线。验收：补transport缺口；timeout/lease/inflight锁、批次错误隔离；两端确实交换数据。
- [ ] **SYN-15 · 待处理／尚未核销 · P2 · 核验**：加密IDB缓存升级、quota、密钥不可用与老envelope恢复。验收：不会因异常覆写原数据；加密不当作XSS或账户隔离替代。
- [ ] **SYN-16 · 待处理／尚未核销 · P1 · 修复**：验证Realtime当前平台迁移兼容并以cursor补拉恢复。验收：staging核实schema约束；断连/漏推不丢数据，不依赖Realtime作持久队列。
- [ ] **SYN-17 · 待处理／尚未核销 · P1 · 核验**：完成真实两设备Tasks闭环及device-local负例。验收：离线新增/编辑冲突/删除/重启/撤销通过；非同步实体不上传。
- [ ] **SYN-18 · 待处理／尚未核销 · P1 · 文档**：独立server工作区、deploy owner和runbook事实对齐。验收：archive UI与仍使用的后端实现分离；每function有可部署入口和回执。
- [ ] **SYN-19 · 待处理／尚未核销 · P1 · 建设**：账号删除/延期清理服务与恢复机制闭环。验收：关联JOB-10；无实际后台任务前不承诺关页继续删除。

<a id="cry"></a>

## CRY · 密码学、恢复与原生密钥延期gate

归属：sync。前提：同步/安全基础的解冻、生产或MAS前门槛；不等于已证实线上漏洞。来源：[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **CRY-01 · 待处理／尚未核销 · P1 · 核验**：aes-gcm-aead-core目标硬件benchmark和独立审查。验收：nonce失败/corrupt tag及release性能有证据。
- [ ] **CRY-02 · 待处理／尚未核销 · P1 · 核验**：bip39-mnemonic-24w生成/输入/退出后恢复全流程。验收：助记词有效性、离线备份确认与避免意外剪贴板暴露。
- [ ] **CRY-03 · 待处理／尚未核销 · P1 · 核验**：cipher-envelope-codec长时fuzz及恶意输入边界。验收：截断/过大/版本/字节序拒绝稳定，补延期fuzz证据。
- [ ] **CRY-04 · 待处理／尚未核销 · P2 · 治理**：crypto-deps-lockdown受控刷新与feature组合CI。验收：锁文件、版本风险和实际构建组合可追溯。
- [ ] **CRY-05 · 待处理／尚未核销 · P1 · 核验**：crypto-tauri-commands真实window身份和capability负例。验收：错误窗口/未就绪keyvault无法调用，runtime gate实际闭合。
- [ ] **CRY-06 · 待处理／尚未核销 · P1 · 核验**：deterministic-cbor-aad Rust与真实浏览器双向字节对照。验收：后续向量回填旧gate，互换blob通过。
- [ ] **CRY-07 · 待处理／尚未核销 · P1 · 核验**：ed25519-recovery-signing服务端挑战和独立审查。验收：过期/一次性消费/replay/错误account/撤销全部拒绝。
- [ ] **CRY-08 · 待处理／尚未核销 · P1 · 核验**：hpke-per-device-wrap绑定RFC向量与新设备上传链。验收：本地wrap成功之外有browser/native互操作和server ack。
- [ ] **CRY-09 · 待处理／尚未核销 · P1 · 核验**：kdf-primitives参数迁移、低内存和取消边界。验收：不半写密钥；release耗时分布与独立review可查。
- [ ] **CRY-10 · 待处理／尚未核销 · P2 · 核验**：keychain-bridge-macos真实签名安装和权限变更。验收：锁定/拒绝/重装/签名变更错误区分清楚。
- [ ] **CRY-11 · 待处理／尚未核销 · P1 · 核验**：keychain-opaque-handle目标sandbox/entitlement ACL。验收：跨窗口禁止取值，handle失效可恢复，MAS前证据独立。
- [ ] **CRY-12 · 待处理／尚未核销 · P1 · 核验**：rust-keyvault-opaque-handle重启rehydrate与生命周期。验收：过期/卸载后引用/无权限窗口拒绝，状态不泄漏。
- [ ] **CRY-13 · 待处理／尚未核销 · P1 · 核验**：x25519-device-keypair真实注册/撤销/轮换与上传。验收：两设备完成，设备页展示真实ack和失败。
- [ ] **CRY-14 · 待处理／尚未核销 · P1 · 核验**：sqlcipher-local-db真实dump/restore/密钥损坏/重启。验收：结合当前App数据库关闭重复旧gate，迁移前演练可恢复。
- [ ] **CRY-15 · 待处理／尚未核销 · P1 · 核验**：realtime-private-channel-config跨账号订阅与部署。验收：关联SYN-16；普通用户不能订阅他人频道，cursor恢复完整。
- [ ] **CRY-16 · 待处理／尚未核销 · P2 · 治理**：rfc-test-vectors-gate固定向量版本及Rust/Web CI结果。验收：向量通过与密钥生命周期验收分列。
- [ ] **CRY-17 · 待处理／尚未核销 · P2 · 核验**：tla-protocol-model在协议变更后重跑bounded TLC。验收：保存配置/状态上限，不将有限模型当全部生产并发证明。
- [ ] **CRY-18 · 待处理／尚未核销 · P1 · 核验**：protocol-integrity-integration-tests接真实DB与恶意客户端。验收：同账号多设备、隔离/事务/失败重试证据实际执行。
- [ ] **CRY-19 · 待处理／尚未核销 · P1 · 核验**：single-table-todos-e2e补live Supabase与两Mac smoke。验收：关联SYN-17，关闭/离线冲突/重启链完整。
- [ ] **CRY-20 · 待处理／尚未核销 · P1 · 核验**：recovery-rehearsal-3-rekey-kill9四个中断点真机演练。验收：当前BLOCKED必须用打包App实际kill/restart及数据校验收口。
- [ ] **CRY-21 · 待处理／尚未核销 · P1 · 核验**：web-browser-e2e-crypto-runtime补Safari/refresh/key恢复。验收：跨Rust互操作、IDB quota和老envelope升级通过。
- [ ] **CRY-22 · 待处理／尚未核销 · P2 · 治理**：web-sync-crypto-contract-preflight合同版本与接线证据回填。验收：mock-only与live gate独立，序列化schema一致。

<a id="adm"></a>

## ADM · Admin：6切片与10页面

归属：admin。前提：Admin已激活但必须按roadmap逐门推进；生产集成及发布未完成。来源：[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **ADM-01 · 待处理／尚未核销 · P1 · 补全**：Shell在真实环境验证管理员身份，生产拒绝mock claim。验收：服务端权限生效；Demo标识持续可见，路由绕过无权限也不能访问API。
- [ ] **ADM-02 · 待处理／尚未核销 · P1 · 补全**：Data contracts/RBAC接服务端授权及稳定错误码。验收：每API校验role/scope/租户，浏览器guard不作为唯一防线。
- [ ] **ADM-03 · 待处理／尚未核销 · P1 · 补全**：Users/orgs/billing command替换模拟写入并返回真实回执。验收：禁用/转移/套餐变更实际落库；模拟模式不能toast假成功。
- [ ] **ADM-04 · 待处理／尚未核销 · P1 · 补全**：Feature/AI provider control接版本化配置和真实路由。验收：草稿/发布分明；有dry-run、回滚与审计，不向浏览器下发平台secret。
- [ ] **ADM-05 · 待处理／尚未核销 · P1 · 补全**：Audit/ops queue接持久服务端事件与事务outbox。验收：刷新关页不丢审计；FNV mock不称防篡改审计；有retention。
- [ ] **ADM-06 · 待处理／尚未核销 · P1 · 核验**：Admin独立部署、auth、telemetry和全部页面smoke。验收：域名/产物隔离，release SHA/告警可查，手工checklist实际执行。
- [ ] **ADM-07 · 待处理／尚未核销 · P2 · 优化**：总览/运营队列明确KPI口径、采样时间和数据新鲜度。验收：优先可执行队列；空/失败/部分失败与mock数据区分。
- [ ] **ADM-08 · 待处理／尚未核销 · P2 · 补全**：用户管理保留筛选分页并提供批量逐项结果。验收：服务端分页/租户scope/幂等command ID可验证，不全量前端过滤。
- [ ] **ADM-09 · 待处理／尚未核销 · P1 · 补全**：组织/空间转移保证最后owner不变量和事务回滚。验收：新旧owner与影响明确；乐观锁、审计和失败回退有效。
- [ ] **ADM-10 · 待处理／尚未核销 · P1 · 补全**：功能灰度管理增加影响预览、revision与safe fallback。验收：配置校验、冲突、发布回执和撤销齐全。
- [ ] **ADM-11 · 待处理／尚未核销 · P1 · 补全**：AI用量/配额使用权威账本与并发扣减。验收：周期/时区/币种/估算结算明确，请求幂等和延迟费用校正。
- [ ] **ADM-12 · 待处理／尚未核销 · P1 · 补全**：Provider/模型路由接secret store、轮换、健康及熔断。验收：密钥不回显，allowlisted egress和真实probe有效。
- [ ] **ADM-13 · 待处理／尚未核销 · P1 · 补全**：角色权限支持最小权限、差异预览与撤销即时生效。验收：服务端permission authority、token更新及防管理员自锁验证。
- [ ] **ADM-14 · 待处理／尚未核销 · P1 · 补全**：订阅计费接真实webhook、账期指标和对账补偿。验收：验签/重放幂等成立，MRR/ARPPU口径可解释。
- [ ] **ADM-15 · 待处理／尚未核销 · P1 · 补全**：审计日志可查actor/target/result并支持可验证导出。验收：持久append、可信IP、访问/删除限制和关联operation可查。
- [ ] **ADM-16 · 待处理／尚未核销 · P1 · 补全**：系统设置的2FA/SSO/IP/Webhook由后端强制执行。验收：敏感变更重新认证，Webhook防SSRF，secret不回显。

<a id="site"></a>

## SITE · 官网与下载发布入口

归属：site。前提：PROPOSED；未获得operator确认前不开site工作分支。来源：[04-deployment-platform.md](04-deployment-platform.md)。

- [ ] **SITE-01 · 待处理／尚未核销 · P2 · 决策**：激活官网范围并区分旧release-site archive与新官网。验收：品牌、平台、版本、Demo/下载入口清楚，不把旧mock页当生产站。
- [ ] **SITE-02 · 待处理／尚未核销 · P1 · 建设**：签名/公证完成后建立DMG/MAS下载闭环。验收：架构/版本/hash/安装说明/回退包真实可用，链接与artifact一致。
- [ ] **SITE-03 · 待处理／尚未核销 · P1 · 建设**：同一release源生成更新feed、下载页和用户变更说明。验收：timestamp/channel/signature一致，官网与updater不指向不同版本。
- [ ] **SITE-04 · 待处理／尚未核销 · P2 · 建设**：正式账号/隐私/导入导出入口复用Web真实能力。验收：历史mock参考页不作为用户中心；深链/重定向/访问保护有效。

<a id="qa"></a>

## QA · 实施前复核与最终验收

归属：web（跨模块验证索引）。前提：各验证随对应模块与外部环境门禁执行。来源：[VERIFICATION.md](VERIFICATION.md)、[README.md](README.md)。

- [ ] **QA-01 · 待处理／尚未核销 · P1 · 核验**：实施每条前刷新所属分支并核对其他任务是否已修复。验收：记录当前SHA、仍复现/已修待验/已关闭；不得把9月8日基线直接当今天线上状态。
- [ ] **QA-02 · 待处理／尚未核销 · P1 · 核验**：把10条审查行为复现转为正确预期的回归测试。验收：修复后不继续断言缺陷应存在；时间、关联、空状态用业务预期验收。
- [ ] **QA-03 · 待处理／尚未核销 · P1 · 核验**：真实浏览器完成开始/暂停/换路由/刷新/关tab/重开矩阵。验收：每类会话分别验证；后台冻结、系统睡眠、时钟跳变/DST有记录。
- [ ] **QA-04 · 待处理／尚未核销 · P1 · 核验**：完成新/旧profile、IDB初始化、quota、禁用存储及双tab测试。验收：不丢数据、不假报保存成功、不串账号；恢复路径可用。
- [ ] **QA-05 · 待处理／尚未核销 · P1 · 核验**：真实离线冷启动、SW升级和线上发布后冒烟。验收：缓存完整、版本一致、回退可用；用生产SHA绑定结果。
- [ ] **QA-06 · 待处理／尚未核销 · P1 · 核验**：AI真实provider和工具失败/中断做受控端到端验收。验收：两轮上下文、slow stream、取消、工具失败不报成功；计费/确认边界明确。
- [ ] **QA-07 · 待处理／尚未核销 · P1 · 核验**：记账和指标真实导出导入往返及旧数据升级。验收：转账、币种、逗号换行、重复导入和所有声明字段不丢，坏数据可回滚。
- [ ] **QA-08 · 待处理／尚未核销 · P1 · 核验**：按门禁完成Mac真机、真实RLS、两设备、恢复及支付验收。验收：每个跳过/未知有owner和原因；mock绿不算live通过。
- [ ] **QA-09 · 待处理／尚未核销 · P2 · 治理**：逐任务保存实现/验证/发布证据并完成跨机器交接。验收：提交SHA、命令、环境、artifact和缺口齐全；精准commit/push及sync-check。

## 如何核销

每条更新为进行中、已修待验、已验证、已发布或不适用时，附上负责人、当前提交、实现/测试/部署证据；说明不适用原因。实现与上线分别登记。需要决策的条目在决策后拆成被批准的实现工作，不默认启动。

如果一条共同修复同时覆盖多个功能，在各关联ID登记同一证据并注明复用，避免重复开发。只有清单中的复现脚本通过仍不足以关闭缺陷，必须先将其改为正确业务预期。
