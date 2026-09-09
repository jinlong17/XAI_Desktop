# 全清单执行台账

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
