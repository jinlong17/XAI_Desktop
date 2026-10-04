# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-03

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`f359be6d838393e0f9e93efd80b88b5b09f6144e`（Sticky fixed 候选 + F1 协调器修复；相对 `2023526` 只改动合同 §11 的 8 个 Sticky 文件、`departureCoordinator.tsx` 与一个新测试）

模块归属：`web`

本轮模式：Sticky 的全部验证证据已齐备，最终回归 PASS（`d7358b9`）。本批登记批次 17：由新的独立最终 reviewer（Astra 角色映射）对合同 §13 六行 gate 做只读最终复审，并就共享协调器改动 `f359be6` 给出新鲜接受结论。当前 Claude 总控窗口不实施产品或 verifier 修复、不创建 Luna task、不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `d7358b9` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。此前各批次的隔离 worktree 和临时本地分支均已在快进接收后清理。
- 产品基线已从 `2023526` 前进到 `210abdf`，再到 `f359be6`：
  - `2023526..210abdf` 恰为合同 §11 的 8 个 Sticky 文件；
  - `210abdf..f359be6` 只有 `apps/web/src/routes/modules/departureCoordinator.tsx` 与新增的 `__tests__/departureCoordinator.blocker.test.tsx`；
  - 共享 storage、shell、widgets、其他宿主文件、所有 caller 与 lockfile 均无变化。
- More 生产文件从 `7b216a3` 到 `210abdf` 无差异。
- 最终 reviewer 的隔离 worktree 和临时本地分支已在快进接收 `27adb10` 后清理。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` 保全原证据提交，不得合并。
- 每次 push 后运行 `pnpm git:sync-check -- --fetch`，最近一次为 failures=0、warnings=1（未请求 deep 扫描）。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。

## 台账与 Git 的差异

- 正式台账已在 `d91b5e5` 核对：
  - `ALL-TODO-CURRENT.md` 与 `EXECUTION.md` 新增 2026-10-03 检查点，`EXECUTION.md` 另追加日期小节。
  - `EXECUTION.json` 的 REL-05 证据追加 35 条：此前漏记的 Notifications 接受链（`f130cb0`、`7ce03a5`、`a41cd1d`、`ad223a2`、`acceptance-afbfb24.md`）与 More 完整证据链。
  - 未改任何条目状态。
- 正式统计保持 13 `completed`、3 `verification_pending`、3 `in_progress`、293 `pending`，合计 299 未关闭。
- 新状态词的保守迁移视图：旧 13 `completed` 视为 `accepted`；REL-02/03/04 保持 `verification_pending`；REL-05/06、AI-02 在完成逐项账实复核前视为 `diagnosis_needed`；其余 293 项保持 `not_started`。这只是控制面映射，不改写或关闭旧台账项目。

## 已接受的调用方

- Date & Time：`accepted`，最终接受提交 `d0d934d`，固定产品 `d9d9fdd`。仅接受完整五字段 mounted-session caller，不关闭广义 Settings、D2、REL、AI 或 312 目标。
- Notifications：`accepted`，固定产品 `afbfb24`，Astra 接受提交 `ad223a2`；Sol 41/41、父级 host/native 与回归证据按原 acceptance 文件归属。仅接受完整八字段 caller，不等于通知投递能力、SET-07、REL/D2 或发布完成。
- More（CP-MORE-01）：`accepted`，固定产品 `7b216a3`，最终独立 acceptance 提交 `27adb10`（`docs/reviews/web-more-recovery-acceptance/acceptance-7b216a3.md`）。
  - **reviewer 与结论：** Claude Opus 5.5 跨 vendor 独立 reviewer，在隔离 worktree 只读复审。六行 gate 全部 PASS；Astra `5ac1244` 的 B1/B2 由 `c3ab20d` / `c0c9ec5` 补齐并确认关闭；未发现产品失败。
  - **证据链：** 合同 `fc56d5e`；基线 `f73b85f`；实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3`；Sol `8e12334`；host/native `fe08254`、`443be31`、`8c07b57`、`a6c7b57`、`a9921b9`；最终回归 `7b9ef87`。
  - **保留限制（非阻断）：** B1 只证明零读取，零写/删尝试由源码与 Sol attempt 级 spy 证明；locked 导出后无原生 warning 断言；all15 pending-reset 导出仅在 jsdom 中精确断言；合成账号 + headless Chrome，非 Tauri；guarded Forward 未覆盖；15 个控件的五宽度可达性依据零溢出与截图。
  - **接受范围：** 仅接受完整 15 字段 + Reset Default recovery caller。`SET-09`、`REL-03`、`REL-05`、QA 项、完整 D2/REL/AI、部署与发布均不因此关闭。
  - **F1 注记（2026-10-03，接受后发现，已闭环）：**
    - **暴露：** 共享协调器缺陷 F1 曾在 More 上于 Chrome 中证实暴露（`web-sticky-recovery-f1/f1-210abdf-more-m1.log`）。由 Retry 释放的 POP 离页会抛出 runtime error，并由错误边界重建协调器子树。
    - **修复与重跑：** 协调器在 `f359be6` 修复。在 `f359be6` 上，More 的 f1（`3ea0310`），以及 B2 host-ordering、B1 native-export 与 native host 模式（`f3a3c82`）独立重跑全部 PASS。与 `7b216a3` 的接受日志记录一致，B1 导出文件逐字节相同。
    - **现状：** 接受记录 `27adb10` 继续有效。现行产品为 `f359be6`，More 生产源不变，协调器已修复。
- **其他已接受 caller 的 F1 注记**（批次 11 `e3db4e0`，Chrome 中均在 `210abdf` 上复现；业务检查——单次 POP commit、history 不变、最新值写一次、对话框关闭——全部通过，失败的只有 F1 三个 gate：过时 blocker 上的第二次 `proceed()`、runtime error、协调器子树被错误边界重建）：
  - **Notifications 与 Date & Time：** Retry 释放的 Back/Forward 证实暴露，discard 对照通过。
  - **Smart Lists：** Retry 释放、锁完成释放与 Forward 均证实暴露；**discard 对照同样触发 F1**（`proceeding -> proceeding` 变体，POP 提交前一度渲染 React Router 默认错误页），即评审提到的潜在 discard 窗口。
  - **Dashboard Header：** offset（device）路径证实暴露；note（account）路径 0/4 未复现，属潜在而非已证安全。
  - **Pomodoro：** 多 draft Retry-all 证实暴露，discard 对照通过。
  - **Collaborate：** 单字段 Retry 已排除（c1 3/3 PASS），修复后作为回归对照重跑。
  - **闭环（`f359be6` 修复后）：**
    - F1 冻结复现全部转为 PASS（`3ea0310`）：11 个必转 case 加 sticky/more，对照保持 PASS。
    - 各 caller 的既有套件独立重跑全部 PASS（`f3a3c82`），共 69 次 runner 调用与 6 个包级门禁，全部 exit 0，与历史接受计数一致，F1 特征为 0。具体结果：
      - Collaborate 37/8/5；
      - Notifications：Astra host 15、parent host 12、18 个 native 模式；
      - Date & Time：16 个 native 模式与 original 8、advanced 12；
      - Smart Lists：6 个 host-native 模式与 export 8、host 10、entry 3、wrapper 5、App 5、original 39、original-parent 4；
      - Pomodoro：departure 9、advanced 8，draft 18、export 7、Dv2 24、completion 2；
      - Dashboard Header：departure 5、advanced 5、followon 2 与 18 个非视觉 native 模式；
      - 包级：`@repo/web` 28/156 及 check-types/lint，settings-rest 44/314，pomodoro 18/148，dashboard-grid 25/228。
    - 以上 caller 的 F1 门禁解除，接受记录继续有效。
    - **保留（非阻断）：**
      - 协调器修复只改逻辑、不改 DOM/CSS，因此未重跑各 caller 的视觉/布局模式；
      - 未重跑清单外的模式：More 的 controls-reset 与 recovery-owner，Date & Time 的另 3 个模式，Smart Lists 其余 host-native 模式，以及各 draft native runner；
      - F1 依赖时序，单次通过不能绝对排除；
      - Smart Lists 的 host-native runner 不捕获 runtime error，其 F1 由 `verify-f1-callers` 覆盖。

## 当前进行中的调用方

### CP-STICKY-01 · Settings Sticky 5 字段

| 字段 | 当前值 |
| --- | --- |
| 状态 | `verification_pending`：以下证据均 PASS，待独立最终 acceptance（批次 17）。<ul><li>F1 已由共享协调器修复 `f359be6` 解决；</li><li>修复后 Sticky 全部既有证据独立重跑（`3ea0310`）；</li><li>EN/ZH 五宽度视觉/键盘（`98125c5`）；</li><li>最终回归（`d7358b9`）。</li></ul> |
| 实施 | Terra 提交 `210abdf`（父 `37a4d33`，单提交，8 文件 +955/−48）。执行者为独立 Claude Opus 5.5（Terra 角色映射），不兼任后续验证或验收。Terra 自检与预检为作者自查，不作为独立证据 |
| 合同 | `docs/reviews/web-sticky-recovery-contract/contract.md`，提交 `70ff46a`（父 `1ddae30`，单文件，快进接收）。作者为独立 Claude Opus 5.5（Astra 设计角色映射）|
| 312 清单编号 | `SET-12` 的支撑 caller；关联 `REL-05`、`QA-01`、`QA-03`、`QA-04`、`QA-09` 与 D2 writer 库存。本任务不得关闭这些编号 |
| feature / 产品模块 | Settings Sticky recovery caller / `web` |
| 固定产品 SHA | before：`20235269749dad514833d76c27b958f694d0e4e9`（Sticky 文件自 `afbfb24` 起无变化）。fixed 候选：`210abdf77562660372c47086db02bd21e870deb5` |
| 排程依据 | `next-more-contract.md` 第 35 行：Notifications → More15 → Sticky5。`remaining-writers.md` 第 15 行：Sticky all5 作为完整 pane caller，含隐藏/条件输入、恢复、导出、来源真实性与实际 host 覆盖 |
| 已有库存 | `refresh-afbfb24.md` / `bindings-afbfb24.json`：`stickyPane.tsx` 第 39–57 行有 5 个直接 `usePref` 绑定。库存中 `StickyComposer.tsx` 的"相关"绑定实为 `usePref("xai_task_cols")`（account Tasks 键，无 setter），不是 Sticky 五键的 reader 或 writer（合同 D1）。`accountOwnership.ts` 第 99–103 行：五键均为 device。registry `registry.ts` 第 863–906 行：默认值 `sun` / `large` / `true` / `false` / `normal` |
| 当前真实问题 | 在 `2023526` 上，H1–H8 已全部确认为正确 FAIL：Sol `4e21e6d` 覆盖 pane 层，host `07784c4` 覆盖 host 层的最新选择、导航、登出与 beforeunload。这些正是本 caller 要由 Terra 修复的范围，不另开修复窗口 |
| 风险等级 | `high`（合同确认）：同字段异步队列、uncertainty/conflict、最新选择丢失、离页仲裁、全拒绝下的内存导出与 native 证据。device-only 移除了 More 的账户键与私有处置面，但仍需证明 A→B→locked→A 与 epoch 下的 device 连续性 |
| 独立 fixed 重跑 | `7ee8de6`（新的独立 Sol 角色实例，8 个新增文件）。<ul><li>冻结文件 14 个 SHA-256 全部吻合。</li><li>diff 边界恰为 §11 的 8 个文件；D1 搜索无新读写方。</li><li>fixed1 结果：bytes 13/13、fields 47/47、queues 27/27、continuity-export 22/22、original 10/10、host 28/28。</li><li>116 个 before FAIL（Sol 93、host 23）全部转为 PASS；31 个 fixture/正向对照/不变量保持 PASS；无新失败。</li><li>`PRECONDITION:` 为 0；每个日志 hash 都写入回执。</li></ul> |
| Chrome native controls 与导出 | `bc92561`（独立父级 native 验证者；`docs/reviews/web-sticky-recovery-native/` 下 12 个新增文件；Chrome 154 headless；不可变 `210abdf` archive；lockfile gate 通过；runtime error 与 console warning 均为 0）。<ul><li>**controls：** 482 项全部 PASS。25 个值的可信输入与磁盘字节；同 profile 重启后复核；重载零写入；真实锁 pending 后一次写入；uncertainty Retry 恰好一次写入；第二 document 的 `coral` 被保留，再次 Retry 零写入，Discard 零写入。</li><li>**export：** 295 项全部 PASS。x1–x6 六种形状均在全部 Storage 拒绝下进行：attempt 级零读写删、同一 URL 创建并回收、anchor 移除、磁盘 JSON deepEqual，之后 warning 与 guard 仍生效；x3 对话框保持打开、location key 不变；x7 click 抛错后显示本地化错误，恢复后导出成功；另加 x8 `createObjectURL` 抛错。</li><li>7 个 JSON 产物与 fixture、runner、日志的 hash 均与回执吻合；all-five 产物与合同 §8 envelope 逐字相同。</li><li>**保留：** 仅 EN、单一 1280×813 视口；beforeunload 为合成事件；font select 由脚本聚焦后再发真实按键。</li></ul> |
| Chrome host 矩阵与 F1 | `019f451`（独立父级 host 验证者；`web-sticky-recovery-native/` 下 4 个新增文件；Chrome 154；批次 8 文件未改）。<ul><li>a–l 与 beforeunload 的全部行为检查通过：前置条件 335/335，host 检查 257/257。其中 c 行的 key deepEqual、history 栈完整与 CDP/Navigation API entry id 一致；i 行的 PUSH 释放恰好 1 次 commit、1 次 `pushState`、0 次 `replaceState`。</li><li>**F1（真实产品失败，已冻结）：** 由成功的 Retry 释放 POP 离页的 4 个场景（c9 Back、c10 Forward、c11 脚本 `history.back()`、i-pop），在正确的单次 POP commit 之后，`departureCoordinator.tsx:170` 再次 `blocker.proceed()`，React Router 抛出 `Invalid blocker state transition: unblocked -> proceeding`，错误边界重建 `<DepartureCoordinator>` 组件树。日志 `native-210abdf-h1-host.log` 第 214–215、236–237、256–257、294–295 行；runtime error 8 次；4 个延迟 gate 失败导致总 gate 失败。</li><li>**未受影响：** 由锁完成、discard、Stay 释放的场景，以及由 Retry 释放的 PUSH 场景。</li><li>**疑似机制（未定论）：** Sticky 在 Retry 路径上两次重新注册 guard（`stickyPane.tsx:156`、`:192`），导致 `guardVersion` 变化，叠加 React Router 在 transition 中应用的 router 状态，使协调器第一个 effect 读到过时的 blocker 快照。</li><li>hash 与回执吻合。</li></ul> |
| F1 影响评审 | `0ba68d7`（独立 Astra 角色；`docs/reviews/web-sticky-recovery-f1/` 下 7 个新增文件）。<ul><li>**根因（类别 A，共享缺陷）：** 协调器从 React state 读取 `useBlocker` 的 blocker（`departureCoordinator.tsx:86–91`），React Router 7.15.1 在 transition 中更新它。每次 guard 注册都会递增 `guardVersion`（`:64–73`），blocker effect（`:152–174`）随之重跑，却从不核对手中的 blocker 是否仍是 router 的 live blocker。Retry 产生两次注册（Sticky `:192` 与 `settle()` 中的 `:156`）：第一次让 `finishIntent` 正确释放（`:102`），第二次在旧的 blocked 快照仍被渲染时到来，于是在 `:170` 再次 `proceed()`。</li><li>**为何不是 caller 缺陷：** 重注册是协调器得知 draft 已结算的唯一途径，且 More、Notifications、Date & Time、Dashboard Header 都使用同样的两次注册模式。</li><li>**before 复现（已冻结）：** `verify-f1.mjs 210abdf sticky\|more\|collaborate <suffix>`。在 `210abdf` 上 sticky 7 FAIL、more 7 FAIL（各有 10 次 blocker 错误），collaborate 62/62 PASS。</li><li>**正确 oracle：** 由 Retry 或完成释放的 POP 恰好一次 commit 到原 entry，key/state deepEqual；无 `pushState`/`replaceState`，history 栈不变；最新值只写一次；对话框关闭；只在 live blocked blocker 上 `proceed()` 一次，且无 `reset()`；无 `console.error`、异常、错误边界或子树重建；§9 a–l 原有行为不变，h1 的 40 个 runtime gate 全绿。</li></ul> |
| F1 修复归属（受保护面修订，总控明确授权） | 仅为 F1 修复，并且仅在批次 11 完成后，将合同 §11 与本控制面"禁止修改"中的 `apps/web` 协调器一项修订为：批次 12 修复窗口可修改 `apps/web/src/routes/modules/departureCoordinator.tsx`，并新增一个测试文件于 `apps/web/src/routes/modules/__tests__/`。<ul><li>修复须遵守的规则：只在该 blocker 对象正是 router 当前 live blocked blocker 时才对其操作，且每个 blocker 最多 proceed 或 reset 一次。</li><li>`composedSettingsRegistration`、`settingsDeparture`、auth、所有 caller 文件与共享 storage 仍受保护；方案 B（只改 Sticky）不采纳。</li></ul> |
| 其余 caller 的 f1 before 复现 | `e3db4e0`（独立 Sol 角色；f1 目录下 14 个新增文件；冻结的 f1 文件未改）。<ul><li>runner `verify-f1-callers.mjs`、fixture `f1-callers-host.tsx`，复用冻结的 prelude。</li><li>最终日志：selfcheck-sc2 0 失败；notifications-n2 与 date-time-t2 各 9 项失败；smart-lists-l2 17 项；header-h2 5 项；pomodoro-p1 9 项。所有 F1 抛错的调用帧均映射到 `departureCoordinator.tsx:170`。</li><li>**修复后必须转为 PASS 的 11 个 case：** Notifications r1/f1、Date & Time r1/f1、Smart Lists r1/d1/l1/f1、Header o1、Pomodoro r1/f1。其余 discard 对照、Header r1/f1 与 selfcheck 必须保持 PASS。重跑时只允许 `departureCoordinator.tsx` 的 hash 变化（回执 §10）。</li></ul> |
| F1 协调器修复 | `f359be6` `fix(web): settle each departure blocker once`（父 `c3b9883`；独立 Terra 角色修复作者，不兼任后续重跑或验收）。<ul><li>**改动范围：** `departureCoordinator.tsx` +48/−9，新增测试 `departureCoordinator.blocker.test.tsx` 583 行。</li><li>**总控核对：** diff 只含授权的两个文件；导出的 4 个公共符号前后一致。</li><li>**修复要点：** 新增 `isLiveBlocked(router, blocker)`，按对象身份核对 `router.state.blockers` 中状态为 `blocked` 的 live blocker；用 `WeakSet` 记录已结算的 blocker；effect 遇到过时或已结算的快照直接返回；intent 持有执行时再次核对 live 状态的 proceed/reset 闭包；新的 POP 替换旧 blocker 时重新绑定。`dataRouterContext` 为原有代码。</li><li>**作者自查（非独立证据）：** `@repo/web` 28 files / 156 tests、check-types、lint 通过；新测试在修复前 7 项按预期失败、修复后 10/10 通过。冻结 runner 预检全部通过：f1 三模式各 62/62，callers 的 11 个必转 case 全绿且对照保持绿，h1 629 条记录与 40/40 runtime gate 全绿，Sticky host 28/28。临时日志已删除。</li><li>**作者声明的有意行为变化（均为规则所需，交批次 13 复核）：** Stay 之后的 guard 重注册不再重开对话框（用户的新意图仍会提示）；epoch 变化只 reset 一次；第二次 Back 重新绑定到 live blocker；unmount 不再 reset 已被 router 删除的 blocker。</li><li>**作者指出的窄竞态：** 第二次 Back 之后、新 blocker 渲染之前点击 Stay/Discard，不会结算任何 blocker，新 blocker 渲染后重新评估。</li></ul> |
| 修复后独立重跑 | `3ea0310`（独立 Sol 角色；32 个新增文件；54 个冻结 SHA-256 全部吻合；所有 Chrome 日志中相对 `210abdf` 只有 `departureCoordinator.tsx` 的 hash 变化）。<ul><li>**F1：** sticky、more 由 FAIL 转 PASS，collaborate 保持 PASS（各 62/62）。callers 五模式由 confirmed 转 refuted，11 个必转 case 全部 PASS，对照保持 PASS，selfcheck 31/31；无 PASS→FAIL。</li><li>**Sticky：** h1 的 40/40 runtime gate 与两个总 gate 全绿（runtime error 由 8 降到 0）；native controls 482、export 295 通过，7 个导出文件与 `210abdf` 逐字节相同；Sol 109/109 与 ST1–ST10 10/10；jsdom host 28/28。</li><li>**竞态检查**（新增 `verify-f1-race.mjs`）：183 项 PASS；Stay/Discard 在第二个 blocker 渲染前后各测一次，均无双重结算、无 blocker 异常、无错误边界，离页决定不丢失，history 栈完整。</li><li>**作者声明的行为变化与合同 §9 的核对：** g（Stay 后用户的新意图仍提示）、k（epoch 只取消一次且保护仍在）、l（unmount 零 blocker 调用且清理完整）均确认。</li><li>**保留限制：** "渲染前"点击为脚本点击；F1 依赖时序，单次通过不能绝对排除。</li></ul> |
| 受影响已接受 caller 重跑 | `f3a3c82`（独立父级回归验证者；99 个新增文件，全部位于 `docs/reviews/`）。<ul><li>69 次 runner 调用与 6 个包级门禁全部 exit 0；38 个 runner/fixture 运行前后逐字节不变。</li><li>所有新日志中 F1 特征为 0，`pass:false` 为 0；每个日志 hash 均写入回执 `affected-callers-f359be6.md`。</li><li>逐 caller 结果见上方"已接受的调用方"中的 F1 闭环注记。</li></ul> |
| EN/ZH 视觉与键盘 | `98125c5`（独立父级视觉/键盘验证者；native 目录 23 个新增文件，含 18 张截图；Chrome 154）。<ul><li>EN 与 ZH 各 577 项检查全部 PASS，0 runtime error。</li><li>五宽度 × 四种状态（clean 20 个控件、五字段全部未解决 32 个、对话框 3 个、source-only Reload 21 个）逐控件做中心加四内点 hit-test，水平包含，page、`.settings-detail`、pane 与 `.module-settings` 均无横向滚动。</li><li>全部恢复与对话框目标 ≥44×44，最小恰为 44。</li><li>与 `2023526` 的几何对照：色块 30×30，卡片、开关轨道、knob 与行对齐一致；375 clean 截图两种语言与 `2023526` 逐字节相同；样式只新增 14 个 `.sticky-recovery-*` 选择器、删除 0 行。</li><li>18 张截图均有逐张人工审查记录，无重叠、裁切、截断或错位。总控亲自抽看了 ZH 375 五字段未解决截图与 EN 375 对话框截图，结论一致；对话框标题为 "Sticky Note has unsaved changes."，未回退为 Smart Lists。</li><li>键盘（EN 1024、ZH 375，各 105 项）：Tab 按 DOM 顺序到达每个控件并有 2px 焦点框；Space/Enter 只激活一次且 Space 不滚动；select 每次选择只变更一次；`aria-pressed`/`aria-checked` 跟随 draft；对话框焦点循环、Escape 等同 Stay 且焦点归还。</li></ul> |
| 视觉批次的解释与后续（非阻断） | <ul><li>**待最终 reviewer 确认的解释：** 离页对话框由受保护的宿主协调器固定在视口，不在 `.settings-detail` 内。其按钮的包含性按对话框盒子与视口判定，与已接受 More 的审查方式一致。按字面在 768 及以上宽度部分按钮位于 `.settings-detail` 之外。</li><li>**可访问性后续：** 用键盘按下 Discard 或 Discard all 后按钮消失，焦点落到 body。合同 §9 未规定此行为，记为 a11y 后续，不作为本 caller 的失败。</li><li>**非本 caller 引入的既有视觉问题**（`2023526` 与 More 截图相同），归入后续视觉/QA：开关渲染为 46×44 圆形且 knob 在上方；白色色块在白色面板上几乎不可见；恢复按钮看起来像纯文本；对话框无遮罩。</li></ul> |
| 最终回归 | `d7358b9`（独立父级最终回归验证者；25 个新增文件：24 个 runner 日志加回执 `web-sticky-recovery-final/review-final-regressions-f359be6.md`）。14 次 runner 调用全部首跑 exit 0，所有日志 hash 均写入回执，F1 特征为 0。<ul><li>**包级：** Settings-rest 44 files / 314 tests（相对 `7b216a3` 新增 `stickyPaneRecovery` 14 项）；Settings typecheck/lint；Web 28 / 156（新增协调器测试 10 项）；Web check-types/lint；Storage check-types。</li><li>**More：** Sol 79（22+20+14+10+13）、original 15、冻结 host 11。</li><li>**Notifications：** Sol 41、Astra boundaries 24、Astra host 15、parent host 12。</li><li>**Date & Time：** 7。</li><li>**一致性：** 其余逐文件计数与 `7b216a3` 相同；runner 与 oracle 自历史证据提交以来未变；已接受 caller 的生产源、storage、shell、manifest 与 lockfile 自 `7b216a3` 以来未变。</li><li>**未触发 §13 附加要求：** 样式只新增 `.sticky-recovery-*`，协调器改动为纯逻辑，因此不需要其他 caller 的视觉重跑。</li></ul> |
| 允许修改文件 | 批次 17（最终 acceptance）：仅新建 `docs/reviews/web-sticky-recovery-acceptance/acceptance-f359be6.md` 或 `blocked-f359be6.md` 之一。不得修改任何已有文件或产品 |
| 禁止修改文件 | 全部产品源与测试；合同文件（如需修订，必须另开 Astra 角色修订）；已有 review/evidence；三份正式台账；本控制面；已接受的 DateTime/Notifications/More/Header/Smart/Collaborate/Pomodoro；共享 storage hook/engine/registry/ownership；Settings host/coordinator/auth；部署、同步、发布、长期分支文件 |
| 原始失败复现 | **Sol `4e21e6d`**（`docs/reviews/web-sticky-recovery-sol/`，requested `2023526` → resolved `20235269…`，lockfile `df05f2dd…`，诊断迭代 1/3）：bytes 13/13 PASS；fields 0/47；queues 0/27；continuity-export 3/22；original ST1–ST10 10/10。109 个 Sol case 中 16 PASS、93 正确 FAIL；`PRECONDITION:` 为 0，无未处理错误。<br>**host `07784c4`**（`docs/reviews/web-sticky-recovery-independent/`，实际 Shell + ComposedSettings + DepartureCoordinator，生产 `createBrowserRouter`，真实 `requestSettingsDeparture`，诊断迭代 1/3）：28 个 case 中 5 PASS（2 个 fixture 自检 + PC1–PC3 正向对照）、23 正确 FAIL。<ul><li>五个字段各自的最新选择丢失、sidebar 离开、登出直接 `true`：全部确认。</li><li>`color` 上的 sidebar、AppRail、编程导航、Back、Forward、`navigate(-1)`、`navigate(1)`、带 state 的相对导航与登出：全部确认；beforeunload 未被阻止。</li><li>`PRECONDITION:` 为 0；产品 quota 警告恰好 23 次，证明故障逐例触发。</li></ul> |
| 验收命令与业务断言 | 合同 §5–§13：All5 字段、同字段队列归因、device 连续性与导出、production host/native、下游格式不漂移、最终回归，共六行 gate |
| 是否允许 Luna 执行 | 否；属于持久化恢复、异步与最终验收禁区 |
| 当前唯一负责人 | Claude 总控负责调度、核对、接收。批次 17 执行者为新的独立 Claude Opus 5.5（Astra 角色映射的最终 reviewer），与合同作者、Terra、修复作者、F1 评审者及所有验证者都不同 |
| 后续顺序 | ~~Sol 冻结 jsdom oracle~~（`4e21e6d`）→ ~~父级角色 host 基线~~（`07784c4`）→ ~~Terra 实施~~（`210abdf`）→ ~~fixed 原样重跑~~（`7ee8de6`）→ ~~Chrome native controls 与导出~~（`bc92561`）→ ~~Chrome host 矩阵~~（`019f451`，F1）→ ~~F1 影响评审~~（`0ba68d7`）→ ~~其余 caller 的 f1 before 复现~~（`e3db4e0`）→ ~~协调器修复~~（`f359be6`）→ ~~F1 与 Sticky 证据重跑~~（`3ea0310`）→ ~~受影响已接受 caller 与包级门禁重跑~~（`f3a3c82`）→ ~~Sticky 的 EN/ZH 五宽度视觉/键盘~~（`98125c5`）→ ~~最终回归~~（`d7358b9`）→ 独立最终 acceptance（批次 17） |
| 不应被本任务关闭 | `SET-12`、`REL-05`、QA 项、完整 D2/REL/AI、其余 312 项、部署与发布门禁 |

#### 总控合同核对（`70ff46a`）

结论：PASS，可作为后续批次的验收标准。

- **事实抽查（均在 `2023526` 上）：**
  - 色板 13 个 id（含 `random`）与 registry 默认值一致；
  - `StickyComposer.tsx:246` 只读 `xai_task_cols`，并硬编码 `sun`；
  - 五键的生产读写只在 `stickyPane.tsx`；
  - `resetAllPrefs()` 的两处 `SettingsFooter` 生产挂载（Appearance、Features）都传入了 `onReset` override；
  - 合同 §5 的规范 EN/ZH 文案与已接受 More（`7b216a3`）的 saving / not saved / unavailable-Reload / invalid / Export failed / Discard all 模式相同。
- **对合同作者开放问题的处理：**
  1. StickyComposer 的措辞已在上表更正。
  2. 色块以原始 id 命名、调色板分组名为英文：按合同不设 gate，作为 i18n/a11y 残留归入 SET-12 或后续 QA，本 caller 不处理。
  3. 面板描述中的桌面置顶承诺：留给 SET-12 与 host，文案不改。
  4. 规范 EN/ZH 文案：确认采用，以便 Sol 在实施前冻结 oracle。
- **角色解释：** 合同 §1 中"Parent / controller"的工作，凡涉及 verifier 实现或执行（host 基线、native/browser 验证、最终回归回执），依总控规则一律由独立窗口执行。总控只做调度、核对、接收与状态同步。这是控制面解释，不修改合同。

#### 总控批次 4 核对（Sol `4e21e6d`）

结论：PASS，oracle 冻结有效。

- **边界：** 12 个新增文件全部位于 `docs/reviews/web-sticky-recovery-sol/`，父提交 `39152bb`，worktree clean。快进接收后原 SHA 保留。
- **hash：** README 列出的 11 个 oracle/runner/日志 SHA-256 与文件逐一吻合。
- **计数：** 各日志的 Vitest 汇总与回执一致。fields 有 47 个 FAIL 头，对应 36 个错误块，另 11 个是 Vitest 合并的同文失败；continuity-export 为 19 = 12 + 7。
- **失败性质：** 全部失败都是带 H 编号的业务 AssertionError（另有 1 条 ZH source alert）。没有 TypeError、testing-library 定位错误或 `PRECONDITION:`。日志中的 "decode failed" 是 H2 故意写入坏 boolean 后存储层输出的预期 console 警告。
- **runner：** 不可变 `git archive`、`XAI_DEPS_ROOT` lockfile SHA-256 gate、拒绝覆盖、记录 requested/resolved、保留非零退出码；不从依赖 checkout 链接 `@repo` 工作区代码。
- **后续风险备注（非阻断）：**
  1. 部分 oracle 编码了共享 hook 的精确尝试序列，例如合并后的写入必须正好是 `["coral","navy"]`。这与合同 §3 第 8 点的已接受 hook 语义一致；若某个合同合规的实现只在这类序列上分歧，由最终 reviewer 裁决，不得静默削弱。
  2. 导出类和更深层断言在 `2023526` 上先于 H1/H8 失败，将在 fixed 产品上首次执行。届时若发现 oracle 自身缺陷，只能使用新诊断后缀，两个 archive 都重跑。
  3. 合同文案表没有冲突消息，因此冲突 case 只断言恢复控件与保留的字节。

#### 总控批次 5 核对（host `07784c4`）

结论：PASS，host 基线冻结有效。

- **边界：** 4 个新增文件全部位于 `docs/reviews/web-sticky-recovery-independent/`，父提交 `a6781f0`，worktree clean。快进接收后原 SHA 保留。
- **hash：** `host.test.tsx`、`verify-fixed.mjs`、`host-before1-2023526.log` 的 SHA-256 与 `before-2023526.md` 吻合。
- **日志：** Vitest 汇总为 23 failed / 5 passed (28)。23 个 AssertionError 全部带 H1(host)/H7(host) 标记；TypeError、testing-library 定位错误、未处理错误与 `PRECONDITION:` 均为 0；requested/resolved SHA 与两侧 lockfile SHA-256 已记录。
- **runner：** 拒绝覆盖（运行前与运行中两次检查）、lockfile 相等断言、不可变 `git archive`、不从依赖 checkout 链接 `@repo`。
- **保留（非阻断）：**
  - jsdom host，不是 Chrome 或 Tauri；
  - 没有 `BeforeUnloadEvent`，只能以事件被取消判定 warning；
  - fixed 产品才会首次执行的断言：对话框、Stay 保留路由与选择、unload handler 零存储尝试；
  - 可信输入、location key、guarded Forward 身份、同字段 exactly-once、磁盘导出与 EN/ZH 五宽度，仍属实现后的 host/native 批次。

#### 总控批次 6 核对（Terra `210abdf`）

结论：PASS（diff 与边界层面），可进入独立 fixed 重跑；不构成验证或验收。

- **边界：**
  - `git diff --name-only 37a4d33 210abdf` 只有合同 §11 的 8 个文件；
  - storage、settings-shell、dashboard-widgets、cmdk、`apps`、`package.json`、`pnpm-lock.yaml`、`docs/reviews` 以及 Settings-rest `types.ts`/`index.ts` 的 diff 均为空；
  - worktree clean，临时预检日志为 0。
- **范围细节：**
  - CSS 只新增 `.sticky-recovery-*` 选择器（含一个 `@media (min-width: 768px)`）；
  - `localI18n.ts` 只新增 11 个 `sticky.*` 键，删除 0 行；
  - `StickyColorPalette.tsx` 只给 13 色 id 列表加了 `export`，用作颜色域。
- **实现结构抽查：**
  - 五个字段均为 `usePrefAutosaveAsync(key, { validate })`；
  - 完成判定使用 `draftsRef.current[field] !== draft` 精确对象身份；
  - Discard 先摘除 draft，再 `meta.reload()`；有 draft 时 Reload 直接返回；
  - 导出只读内存 draft，文件名 `sticky-draft.json`，回收 object URL；
  - guard 通过 `registerDepartureGuard` 注册；beforeunload 仅在存在 draft 时生效；
  - 无 `localStorage`、`setPref`、`removePref`、`meta.reset` 调用。
- **Terra 自查（非独立证据）：**
  - Settings-rest 44 files / 314 tests、typecheck、lint 通过；
  - `apps/web` 两个 composition 测试与 check-types 通过；
  - 冻结 runner 预检全部通过：Sol 13/47/27/22/10，host 28/28。
- **Terra 开放问题的处置：**
  1. `stickyPane.test.tsx` 的 ST6/ST8 只加了 `async` 与 `await waitFor`，期望值不变。文件级 `beforeEach` 注入了已有、未修改的 `smartListsLockFixture`，以补 jsdom 缺失的 `navigator.locks`。总控判为测试环境支撑而非业务断言改动，交最终 reviewer 确认。
  2. Reload 与 Discard 同时清除该字段的输入错误：与已接受 More 一致，合同未禁止，交最终 reviewer 确认。
  3. 有 draft 时隐藏 Reload 且点击时也拒绝；pending 时 Retry 可见但无操作：符合合同 §5 第 5、8 点。
  4. 输入错误与 draft 同时存在时分两行显示：可接受。
  5. 未新增 toggle CSS，"保持对齐"按"不变"理解：可接受。
  6. guard token 在 effect 中读取（兼容 StrictMode），rerender 前的拒绝来自 live scope 检查：由批次 7 的 continuity oracle 独立复核。

## 执行者映射

本机 Codex CLI 0.154 可用，但本会话无法可靠确认当前 Astra/Terra/Luna 模型名：全局默认为 `gpt-6.1-sol`，与审查约定的 `gpt-6-astra` / `gpt-5.6-*` 不一致。此外，CLI sandbox 在关联 worktree 中提交存在风险。因此 Claude 总控默认按职责映射 Claude agent：

| 角色 | 默认执行者 |
| --- | --- |
| Astra 设计 / 最终决策 | Claude Opus 5.5 |
| Sol 高风险验证 | 另一个独立的 Claude Opus 5.5 |
| Terra 普通实现 | 按风险选 Opus 或 Sonnet |
| Luna 低风险检索 | Sonnet 或 Haiku |

作者与验收者必须是不同的新实例；Spark 不分配。用户可随时改派为指定 Codex 模型。

## 本轮唯一任务

批次 17：新的独立最终 reviewer 只读复审 Sticky caller，并给出共享改动的新鲜接受结论。

- **固定点：** 产品 `f359be6`；控制分支基点为本提交。
- **必须完成：**
  1. 逐行对齐合同 §13 的六行 gate，每行都要串起：源码 → 正确的 before 失败 → fixed 后的独立行为 → 实际用户界面。证据来自上表各行，以及 `web-sticky-recovery-{contract,sol,independent,native,f1,final}/`。
  2. 确认视觉批次对离页对话框包含性的解释（按对话框盒子与视口判定）是否可接受。
  3. 就 Terra 开放问题做出裁定：ST6/ST8 测试文件新增的锁 fixture 是否属于"仅等待真实异步完成"的允许范围；Reload/Discard 清除输入错误是否可接受。
  4. 就共享协调器改动 `f359be6` 给出新鲜接受结论（合同 §13："Any shared delta needs … fresh acceptance"）：结合 `0ba68d7`、`e3db4e0`、`3ea0310`、`f3a3c82`、`d7358b9`，判断受影响已接受 caller 的接受记录是否继续有效。
  5. 说明保留限制与非阻断后续：键盘 Discard 后的焦点落点、既有视觉问题、未重跑的视觉与清单外模式、F1 的时序性。
- **可选复现：** 最多两个冻结 runner 的单次复现，输出视为临时文件，提交前删除，hash 写入报告。
- **输出：** 仅一份 `docs/reviews/web-sticky-recovery-acceptance/acceptance-f359be6.md` 或 `blocked-f359be6.md`。报告必须写明：接受不关闭 SET-12、REL-05、QA 项、D2/REL/AI 或任何 312 编号。
- **禁止：** 修改产品、任何已有文件、合同、台账、控制面；不修复；不 push；不派生子 agent。
- **停止条件：** 若发现真实产品失败，只冻结复现、影响范围与正确 oracle，提交 blocked 报告后停止。

## Luna 任务卡

`独立 Luna task 未创建`。原因：Sticky 合同设计与后续恢复实现属于持久化、异步与验收禁区；没有把隐藏 sub-agent 或未启动计划称作 Luna task。

## 本会话提交

- `c0c9ec5`：B1/B2 证据 cherry-pick；归档 ref 保全 `c3ab20d`。
- `0c0ff15`：控制面记录 B1/B2 证据，More 待最终验收。
- `27adb10`：独立 reviewer 的 More acceptance，快进接收。
- `bdc4a8d`：控制面把 More caller 改为 `accepted`。
- `d91b5e5`：正式台账核对。
- `1ddae30`：登记 CP-STICKY-01 与执行者映射。
- `70ff46a`：Sticky5 完整 caller 合同（独立合同作者，快进接收）。
- `39152bb`：记录合同核对结论，登记批次 4。
- `4e21e6d`：Sol jsdom before oracle 冻结（独立 Sol，快进接收）。
- `a6781f0`：记录批次 4 核对结论，登记批次 5。
- `07784c4`：父级角色 host before 基线冻结（独立 host 验证者，快进接收）。
- `37a4d33`：记录批次 5 核对结论，授权批次 6（Terra）。
- `210abdf`：Terra 产品实施 `fix(settings): recover Sticky edits and departures`（快进接收）。
- `8db7d30`：记录批次 6 核对结论，产品 SHA 前进到 `210abdf`，登记批次 7。
- `7ee8de6`：冻结 Sol 与 host oracle 的独立 fixed 重跑（快进接收）。
- `c18db81`：记录批次 7 核对结论，CP-STICKY-01 进入 `verification_pending`，登记批次 8。
- `bc92561`：Chrome native controls 与磁盘导出验证（快进接收）。
- `0772569`：记录批次 8 核对结论，登记批次 9。
- `019f451`：Chrome host 矩阵验证，冻结 F1（快进接收）。
- `d113c6a`：记录 F1 与核对结论，CP-STICKY-01 回到 `diagnosis_needed`，登记批次 10。
- `0ba68d7`：F1 影响评审，判定类别 A，推荐方案 A（快进接收）。
- `41774ab`：采纳方案 A，明确修订受保护面归属，为已接受 caller 加 F1 注记，登记批次 11。
- `e3db4e0`：其余暴露方的 f1 before 复现（快进接收）。
- `c3b9883`：记录批次 11 结果与更新后的 F1 注记，登记批次 12。
- `f359be6`：共享协调器 F1 修复 `fix(web): settle each departure blocker once`（快进接收）。
- `518fa42`：记录修复核对结论，产品 SHA 前进到 `f359be6`，登记批次 13。
- `3ea0310`：F1 与 Sticky 证据在修复后的独立重跑，含竞态检查（快进接收）。
- `2bdb020`：记录批次 13 结果，登记批次 14。
- `f3a3c82`：受影响已接受 caller 的既有套件与包级门禁重跑（快进接收）。
- `1c58841`：F1 闭环，解除已接受 caller 的 F1 门禁，CP-STICKY-01 回到 `verification_pending`，登记批次 15。
- `a0df253`：正式台账 F1 核对。
- `98125c5`：Sticky EN/ZH 五宽度视觉与键盘验证（快进接收）。
- `463c2ab`：记录批次 15 结果与非阻断后续，登记批次 16。
- `d7358b9`：合同 §13 最终回归（快进接收）。
- 本提交：记录最终回归结果，登记批次 17（独立最终 acceptance）。

## 台账变化

- 无编号状态变化；13/312 完成、299 未关闭保持不变。
- 正式台账已在 `a0df253` 写入 F1（共享协调器缺陷、暴露范围、修复 `f359be6`、两轮独立重跑）：REL-05 证据追加 11 条，未改任何条目状态，并保留"caller accepted ≠ 业务/发布完成"。
- Sticky 在控制面为 `verification_pending`，正式台账中的 SET-12 仍为待处理。

## 成本检查（非阻断）

| 周期 | 批次 | 情况 |
| --- | --- | --- |
| 1 | 1–3 | More 证据接收与最终验收、台账核对、Sticky 选择与合同；无全矩阵重跑 |
| 2 | 4–6 | Sol oracle、host 基线、Terra 实施；各一次完成，无返工 |
| 3 | 7–9 | fixed 重跑、native controls/导出、host 矩阵；批次 9 发现 F1 |
| 4 | 10–14 | F1 评审、before 复现、协调器修复、两轮独立重跑（含 69 次已接受 caller runner 与 6 个包级门禁）；均一次通过、无环境重跑。F1 的修复与重跑属必要成本 |

所有临时 worktree 均已清理，每次 push 后 sync-check 均为 failures=0。

## 下一步

1. 等待批次 17 报告，总控核对：
   - 只新增一个文件；
   - 引用的证据与行号真实；
   - 结论与证据一致。
2. 若 ACCEPT：
   - 精确接收报告；
   - 只把 CP-STICKY-01 改为 `accepted`，并按 reviewer 结论更新受影响 caller 的状态；
   - 单独核对正式台账：追加 Sticky 证据链，保留"caller accepted ≠ 业务/发布完成"，不关闭 SET-12 或任何 312 编号；
   - 完成 commit、push、sync-check 后，再按合同/库存选择下一项。
3. 若 BLOCKED：冻结证据，另开修复窗口；总控不修。
