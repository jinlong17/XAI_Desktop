# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-04

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`5cd63ff652f02a2c726187fe12cbc796218d31c0`（Features caller 实施；相对 `f359be6` 只改 `xai-web-settings-features-panel` 的 11 个合同 §11 文件）

模块归属：`web`

本轮模式：批次 31（`05b21f4`）用纠正后的 More `boundaries` oracle 证明了两点：`afbfb24` 上 case 002 失败于业务断言；三个 fixed SHA 上整文件每次都是 10/10。More 的条件 C-FB002 已满足。本批登记批次 32：CP-FEATURES-01 的独立最终 acceptance。当前 Claude 总控窗口不实施产品或 verifier 修复，也不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `05b21f4` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。本会话创建的所有隔离 worktree 与临时本地分支均已在快进接收后清理。
- 产品基线依次前进：`2023526` → `210abdf`（合同 §11 的 8 个 Sticky 文件）→ `f359be6`（`departureCoordinator.tsx` 与新测试 `departureCoordinator.blocker.test.tsx`）→ `5cd63ff`（Features 合同 §11 的 11 个文件，全部位于 `xai-web-settings-features-panel`）。共享 storage、shell、widgets、其他宿主文件、其他 caller 与 lockfile 均无变化。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` 保全 Sol 原证据提交 `c3ab20d`，不得合并。
- 每次 push 后运行 `pnpm git:sync-check -- --fetch`，最近一次为 failures=0、warnings=1（未请求 deep 扫描）。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。产品改动进入 Desktop 前仍须走 ADR-0013 D3 gate。

## 台账与 Git 的差异

- 正式台账已在 `d91b5e5`（More 与 Notifications 接受链）、`a0df253`（F1）与 `4da6e71`（Sticky 接受链，REL-05 证据追加 25 条）核对，均未改条目状态。
- 正式统计保持 13 `completed`、3 `verification_pending`、3 `in_progress`、293 `pending`，合计 299 未关闭。caller 接受不改变这些数字。
- 新状态词的保守迁移视图：旧 13 `completed` 视为 `accepted`；REL-02/03/04 保持 `verification_pending`；REL-05/06、AI-02 在完成逐项账实复核前视为 `diagnosis_needed`；其余 293 项保持 `not_started`。这只是控制面映射，不改写或关闭旧台账项目。

## 已接受的调用方

所有接受均只覆盖对应的 recovery caller，不关闭任何 312 编号，也不代表业务、部署或发布完成。

- **Date & Time：** `accepted`，接受提交 `d0d934d`，固定产品 `d9d9fdd`。完整五字段 mounted-session caller。
- **Notifications：** `accepted`，Astra 接受提交 `ad223a2`，固定产品 `afbfb24`。完整八字段 caller；不等于通知投递能力或 SET-07。
- **More（CP-MORE-01）：** `accepted`，最终独立 acceptance `27adb10`（`web-more-recovery-acceptance/acceptance-7b216a3.md`），固定产品 `7b216a3`。
  - 完整 15 字段 + Reset Default recovery caller，不关闭 SET-09。
  - 证据链：合同 `fc56d5e`；基线 `f73b85f`；实现到 `7b216a3`；Sol `8e12334`；native N1–N4；最终回归 `7b9ef87`；Astra BLOCKED `5ac1244` 由 B1/B2 证据 `c0c9ec5` 补齐。
  - **条件 C-FB002（2026-10-04，已满足）：**
    - **起因：** 权威 before 日志中，case 002 的失败是 oracle 递归造成的 `RangeError`。
    - **批次 31 的证据**（`05b21f4`，`web-more-recovery-fb002/review-fb002.md`，纠正 oracle 只改 L18–19）：
      - `afbfb24` 上，case 002 在 13/13 次运行中都失败于业务断言 `expected null to be 'invalid-bool'`，其余 9 个 case 与 before4 逐行一致；
      - `7b216a3`、`f359be6`、`5cd63ff` 上，整文件每次都是 10/10。
    - **结论：** More 接受引用的计数不变（boundaries before 0/10、fixed 10/10；Sol before 5/74、fixed 79/79）。变化的只是 case 002 的 before 失败原因：从 oracle 假象改为业务断言。
    - **今后：** 冻结 oracle 在 fixed 上仍不确定，今后的 More boundaries 回归须同时运行纠正 oracle。
- **Sticky（CP-STICKY-01）：** `accepted`，固定产品 `f359be6`。
  - **最终接受：** 窄范围独立复审 `699f6e6`（`web-sticky-recovery-acceptance/acceptance-f359be6.md`），六行 gate 全部 PASS。首次独立最终复审 `47bbd58` 仅因证据缺口 G1（合同 §10 第 4 点）判为 BLOCKED，G1 由 `3debd91` 补齐（dashboard-widgets 五个测试在 `f359be6` 与 `2023526` 上均为 53/53）。
  - **证据链：**
    - 合同 `70ff46a`（`web-sticky-recovery-contract/contract.md`）；
    - before oracle：Sol `4e21e6d`（109 个 case 中 93 个正确 FAIL，H1–H8 全部确认）、host `07784c4`（23 个正确 FAIL）；
    - 实现：Terra `210abdf`，只改 §11 的 8 个文件；
    - fixed 重跑 `7ee8de6`；Chrome native controls/导出 `bc92561`；host 矩阵 `019f451`（冻结 F1）；
    - F1 修复后的全部重跑 `3ea0310`；EN/ZH 五宽度视觉与键盘 `98125c5`；最终回归 `d7358b9`；G1 `3debd91`。
  - **裁定：**
    - 离页对话框是固定在视口上的宿主浮层，其包含性按对话框盒子与视口判定；
    - ST6/ST8 测试文件引入的既有锁 fixture 属合同 §11 允许范围；
    - Reload/Discard 清除该字段输入错误可接受。
  - **接受范围：** 完整五字段 recovery caller。`SET-12`（新便签默认值、颜色词表对齐、批量应用、排列/恢复尺寸）、native pin/窗口能力、`REL-05`、`QA-01/03/04/09`、D2/REL/AI 均不因此关闭。
  - **非阻断后续：**
    - 键盘 Discard 或 Discard all 后焦点落到 `<body>`（a11y）；
    - 既有视觉问题，修复前即存在：圆形开关且 knob 在上方、白色色块近乎不可见、恢复按钮像纯文本、对话框无遮罩；
    - `docs/api.md` §4.9 关于 guard 注册时机的措辞；
    - `ids.test.ts` AC-IDS-3 检查的是手写的回退 id 格式副本；widgets 包的 typecheck/lint 未在 G1 中运行。

## 共享离页协调器缺陷 F1（已闭环）

- **缺陷：** 持有中的浏览器 Back/Forward（POP）离页经成功 Retry（部分 caller 亦经完成或 discard）释放后，`DepartureCoordinator` 在过时的 blocked 快照上第二次调用 `blocker.proceed()`（原 `departureCoordinator.tsx:170`）。React Router 抛出 `Invalid blocker state transition`，错误边界重建协调器子树。导航与保存本身正确。
- **过程：**
  - 冻结 `019f451`；
  - 独立 Astra 角色影响评审 `0ba68d7`，判为类别 A 共享缺陷，按合同 §11 明确修订受保护面；
  - 其余暴露方的修复前复现 `e3db4e0`；
  - 修复 `f359be6`：只对 router 当前 live blocked blocker 操作，且每个 blocker 最多 proceed 或 reset 一次，公共契约不变；
  - 独立重跑 `3ea0310`（F1 全部复现转绿，竞态检查通过）与 `f3a3c82`（受影响已接受 caller 的 69 次 runner 与 6 个包级门禁全部通过）；
  - 新鲜接受由 `47bbd58` 授予，`699f6e6` 同意。
- **受影响的已接受 caller：** 接受记录全部继续有效。
  - More：Chrome 中证实暴露；
  - Notifications、Date & Time、Smart Lists（含 discard 窗口）、Dashboard Header（offset 路径）、Pomodoro（多 draft）：Chrome 中证实暴露；
  - Collaborate：单字段 Retry 已排除，作为回归对照重跑。
- **保留条件：**
  - 这些 caller 的视觉与清单外模式未重跑，前提是协调器改动保持纯逻辑；若将来协调器有 DOM/CSS 变化，必须重跑；
  - Smart Lists 的 F1 覆盖来自 `verify-f1-callers`；
  - F1 runner 与新协调器测试保留为回归 oracle，任何 react-router 升级都须重跑；
  - Dashboard Header 的 note（account）路径属潜在，未证安全。
- **正式台账：** 已写入（`a0df253`）。

## 当前进行中的调用方

### CP-FEATURES-01 · Settings Features 8 个模块开关与 Reset to defaults

| 字段 | 当前值 |
| --- | --- |
| 状态 | `verification_pending`：E7、E8、E16、E17（`eb37a59`）、E9–E11（`58a93ef`）、E12–E13（`312b27c`）、E14–E15（`5905e37`）与 E18–E25（`0056299`，含冻结发现 F-B002）PASS；F-B002 的纠正 oracle 证据（`05b21f4`）PASS；待批次 32 最终 acceptance |
| 选择与合同 | 选择备忘录 `docs/reviews/web-next-caller-selection/selection-f359be6.md` 与合同 `docs/reviews/web-features-recovery-contract/contract.md`，提交 `6ded3dc`，作者为独立 Claude Opus 5.5（Astra 角色映射）。比较了 7 个候选：Features 被推荐；Appearance、Integrations、AI、Dashboard、Calendar、Board 均有前置决策或依赖 |
| 312 清单编号 | 支撑 `REL-05`；关联 `REL-07`、`REL-10`、`UX-04`、`UX-05`、`QA-01`、`QA-03`、`QA-04`、`QA-09`。`SET-03`（目录决策）被明确排除。本任务不关闭任何编号 |
| feature / 产品模块 | Settings Features recovery caller / `web`（单一包 `xai-web-settings-features-panel`） |
| 固定产品 SHA | `f359be6d838393e0f9e93efd80b88b5b09f6144e` |
| 归属 | 8 个 `xai_pref_features_*` 键均为 device（`accountOwnership.ts:54–61`），无账户机制 |
| 总控核对 | <ul><li>`FeaturesPane.tsx` 的 Reset 先吞掉 raw remove 错误，再派发 `key: null` 的合成 `StorageEvent`。</li><li>features 包内没有 `registerDepartureGuard`。</li><li>`SettingsFooter` 的 Save 固定闪现 1800ms "Saved"。</li><li>8 个键均为 device。</li><li>合同 §11 的 Terra 文件边界清楚：只限 features 包内 pane、一个 props 字段、两个本地 helper、scoped CSS、测试与文档；所有读者、storage、shell、host 与已接受 caller 受保护。</li><li>§14 列出 E1–E25 统一证据清单，吸取了 G1 的教训。</li></ul> |
| 风险等级 | `high`：Reset 的 `key: null` 合成事件会让所有挂载中的 legacy `usePref` 显示默认值（H6，待证），涉及跨模块读者（rail、CmdK、pet、App 外观），以及异步队列、离页与 native 证据 |
| 总控决定（2026-10-04） | <ol><li>登记 CP-FEATURES-01，首批冻结 E1–E5。</li><li>**确认 D3：** Features 停止渲染共享 `SettingsFooter`，"Save & apply" 消失，"Reset to defaults" 改为 Features 本地控件，配真实的 confirm 文案与逐字段结果；Appearance 保留 footer，共享组件不改。理由：pane 本是自动保存，footer 的 "Saved" 无条件显示，属虚假成功提示，与 More/Sticky 已接受的无 Save footer 模式一致。这是可见 UI 变化，用户可在批次 25（Terra 实施）前否决。</li><li>**确认 harness：** native downstream 证据挂载生产 `App`，只替换 auth session。</li><li>**确认：** 键盘 Discard、Reload、Discard all 之后的焦点落点作为 gate（E15）。</li><li>**后续分组的前置决策**须由 operator 或总控另行决定，本项不处理：Appearance 的 host 范围、Dashboard 的多 guard 设计、AI 的 D2 secret、Integrations 的 SET-10、Calendar 的离页接缝与 SET-08。</li></ol> |
| 开放问题的处置 | 保留 `window.confirm`；Reset 不再清除畸形字节，记为有意的限制，与 More 先例一致，并关联 REL-07；H10（375px 溢出）由 E4 判定；扫描器看不到 `useFeaturePrefs.ts` 与 CmdK 的 `getPref` 读取，库存不代表读者覆盖 |
| E1–E2 Sol before oracle | `11e0afb`（独立 Sol；`web-features-recovery-sol/` 下 24 个新增文件；不可变 `f359be6` archive；lockfile gate；`@repo` 以 75 个精确 alias 固定到 archive，并带守卫）。<ul><li>以 `before2` 为准（诊断迭代 2/3；`before1` 保留并标注为已取代）。</li><li>结果：bytes 17/17 PASS；fields 0/49；reset 2/31；queues 0/40；continuity-export 3/26；downstream 9/15；original（AC-PANE-1–6）6/6；另跑 §10 第 10 点的读者测试：features 17/17、web 18/18。</li><li>`PRECONDITION:` 为 0；失败全部是业务 AssertionError，无 TypeError；所有日志 hash 均写入 README。</li><li>**假设结论：** H1、H2、H3、H4、H5（pane 与读者层）、H7、H9 均确认；H6 在 hook 层确认（六个 legacy 读者重绘为默认值）；H6 在生产 `App` 中被推翻（PASS，但要求仍约束 fixed 产品），因为 Reset 使整个 App 重挂、读者重新读取存储值。这次重挂本身是 §10.5 "during" 的正确 FAIL。H8 属 E3；H10 与 H5/H6 的 native 部分属 E4。</li><li>正向对照在 `f359be6` PASS：零写挂载、缺省默认值、16 个精确值、拒绝 confirm 零尝试、接受后 8 键全部删除、生命周期分类、rail 过滤、干净导航、AC-PANE-1–6、35 个读者测试。</li></ul> |
| 合同 §3 遗漏的源码事实（已核实） | `packages/plugin-web-storage/src/AccountDataGate.tsx` 收到 `event.key === null` 的 storage 事件时执行 `accountScope.lock(accountId)` 并递增 retry，使账户门屏出现、rail、pet 与 Features pane 全部重挂。当前 Reset 的合成 `key:null` 事件因此会重锁账户并重挂整个 App。合同 D2 已要求移除该事件，因此无需修改合同；Terra 与后续 reviewer 须知晓。`AccountDataGate` 属受保护的共享 storage，不得修改 |
| E3 父级 jsdom host 基线 | `b732c27`（独立父级 host 验证者；`web-features-recovery-independent/` 下 4 个新增文件；诊断迭代 1/3）。<ul><li>40 个 case：7 个 PASS（3 个 fixture 检查加 4 个正向对照），33 个业务 FAIL（24 个逐字段、8 种导航形式、1 个 reset）；`PRECONDITION:` 与 TypeError 均为 0；hash 吻合。</li><li>8 个字段在 setItem 被拒后都回弹旧值（H1，host 层）；sidebar 离开未被持有；登出立即为 `true`。</li><li>以 Boards 为代表，H8 的各种导航形式全部直接离开且无对话框，beforeunload 未被阻止（handler 内零存储尝试）。</li><li>失败的 Reset：Calendar 的 removeItem 被拒，其余 7 键已删除，之后离开未被持有。</li><li>每次被接受的 reset 恰好派发一个 `key:null` 事件。随后 `AccountDataGate` 重锁账户 A、显示账户门屏、重新激活 g1，并重挂整个 host（Features、sidebar、AppRail 全部替换），因此 H5 的"开关显示 on 而字节为 off"在该 host 中被重挂掩盖。重挂还会替换离页协调器，此时被持有的离页会被取消（源码阅读结论，未实际触发）。</li><li>正向对照全部 PASS：干净挂载零写入；8 个精确字节；干净导航；干净 reset 删除 8 键。</li></ul> |
| E4 native 跨模块 before 与 E5 Features F1 before | `4c5323f`（独立父级 native 验证者；`web-features-recovery-native/` 与 `web-features-recovery-f1/` 下共 23 个新增文件；Chrome 154；生产 `App` composition 中只有 auth session 为合成；冻结的 Sticky F1 文件未改，prelude `67bbfaa7…` 只读复用且 hash 一致；各诊断迭代 1/3）。<ul><li>**H5：** a 确认，故障下 `key:null` 事件仍派发；b、c 被推翻，重挂后 pane 与 rail 均未显示 Calendar 为 on；d 确认，无反馈也无 Retry。</li><li>**`AccountDataGate` 原生实证：** 账户重锁（epoch 3）后重新激活 g1（epoch 4），rail、pet、pane、sidebar 与 `.app` 全部替换；用户可见的影响是焦点落到 `<body>`、Settings 滚动位置由 527 跳到 0。</li><li>**H6：** 显示值、字节、渲染帧与拖拽后的自定义顺序均未被破坏（假设被推翻，要求 PASS）；重挂本身是 §10.5 "during" 的正确 FAIL。</li><li>**H10：** 375px 下 `.settings-detail` 本身不溢出（字面陈述被推翻），但 280px 网格最小宽度使 pane 溢出 4px（确认），EN 与 ZH 一致；1440px 对照无溢出。</li><li>**provenance：** 外来输入为 0，守卫违规为 0，34 个读者模块均来自 archive，网络尝试为 0。</li><li>**E5：** `selfcheck` 105 项有效，Sticky 对照 sr、sd、s2 均被持有，且各恰好一次 live `proceed()`；`features` 的 before 结论为未持有（r1、d1、r2、rb），无 F1 特征。fixed 阶段须报告 `fixed-pass`。</li><li>所有文件 hash 均写入两份回执。</li></ul> |
| Terra 实施（E6） | `5cd63ff` `fix(settings): recover Features toggles and resets`（父 `8d53038`，单提交，11 个文件 +1590/−72，全部位于 features 包）。<ul><li>**总控核对：**<ul><li>文件全部在合同 §11 范围内：pane、只做转发的 `featuresPane.tsx`、只新增 `registerDepartureGuard` 的 `types.ts`、恰好两个 internal helper（`featuresRecovery.ts`、`featuresRecoveryCopy.ts`）、`styles.css`（删除 0 行，选择器全部以 `.features-pane` 开头）、`src/__tests__/` 下的测试与锁 fixture、`api.md` 与 `test.md`。</li><li>受保护路径 diff 为空，包括 features 包内的受保护文件、storage、settings-shell 与 `apps`。</li><li>产品源码中无 `StorageEvent`、`dispatchEvent(`、`localStorage` 或 `SettingsFooter`。</li><li>AC-PANE-3 与 AC-PANE-6 只加 `async`、安装 fixture 并等待，业务断言未变。</li></ul></li><li>**作者自查（非独立证据）：** features 包 45/45、typecheck 与 lint 通过；`@repo/web` 156/156、check-types 与 lint 通过。预检中 Sol 全部模式转绿（bytes 17、fields 49、reset 31、queues 40、continuity-export 26、downstream 15、original 6、读者 17+18），host 40/40，F1 `features` 为 `fixed-pass`。临时日志已删除。</li><li>**作者披露：**<ul><li>重复 Reset 与接管未解决 batch 的处理比 More 先例更进一步（FR13b 覆盖）；</li><li>AC-PANE-6 的测试标题仍写 `SettingsFooter`，未改，以保持 diff 最小；</li><li>开放问题：Reset 已受理后，若一个待处理的 set 失败，Retry 先推进被取代的 set（More 先例），最终字节仍由 reset 决定。</li></ul></li></ul> |
| E7、E8、E16、E17 独立重跑 | `eb37a59`（独立 Sol；25 个新增文件；19 个 runner、fixture、prelude 与 oracle 文件及 22 个基线日志的 hash 全部吻合；四个证据目录的既有文件均未改动）。<ul><li>**E7 Sol：** before2 → fixed1，共 147 个 FAIL→PASS，72 个对照保持 PASS，0 个 PASS→FAIL，`PRECONDITION:` 为 0。fixed 结果：bytes 17、fields 49、reset 31、queues 40、continuity-export 26、downstream 15、original 6、读者 17+18，全部 PASS。</li><li>**E8 host：** 40/40；33 个 before FAIL 转为 PASS。Reset 派发的 `key:null` 事件由 1 变为 0，不再重锁账户、显示账户门屏或重挂；beforeunload 被阻止。</li><li>**E16：** 10 个冻结的 F1 调用全部 PASS，check id 序列与 `f359be6` 上的 post1 逐一相同。只有 bundle hash 变化：archive 输入由 559 增至 561，即两个新 Features helper，属预期的实现 delta。</li><li>**E17：** `fixed-pass`，102 项；r1、d1、r2、rb 各被持有后恰好一次 live `proceed()`，0 次非 live 调用，0 次 `reset()`；rb 中 Retry Calendar 仍保持持有，Retry Habits 后才释放一次。</li><li>总控复核：所有新日志中 F1 特征、`PRECONDITION:` 与 `pass:false` 均为 0，日志 hash 均写入回执。</li></ul> |
| E9–E11 native controls、reset 与导出 | `58a93ef`（独立父级 native 验证者；native 目录 18 个新增文件；Chrome 154；`5cd63ff` archive，`@repo` 全部来自 archive，0 个 checkout 模块；features 包以外的 bundle 模块与 `f359be6` 逐字节相同；各模式迭代 1/3）。<ul><li>**E9：** 524 项，其中产品检查 285 项，全部 PASS。16 个值经可信点击写入，同 profile 重启后复核精确字节，每次一写，且取得真实 per-key 锁；重载零写入；锁被持有时 pending、释放后一写；uncertainty 恰好一次写入；第二 document 的字节被保留；source-only 状态只提供 Reload。6 条 console 警告为坏字节场景下预期的 decode 警告。</li><li>**E10：** 219 项，其中产品检查 99 项，全部 PASS。拒绝 confirm 时零尝试；接受后 7 键删除、缺省键按 no-op 处理、从不写入；单键与双键故障经定向 Retry 恢复；uncertainty 一次 remove；冲突被保留；"Defaults restored." 只在全部成功时出现；无关键 ×6 不变。6 个场景中 `key:null`、重锁、scope 转换、门屏与重挂均为 0。</li><li>**E11：** 442 项，其中产品检查 217 项，全部 PASS。9 种磁盘形状都在全拒绝下完成：零尝试、同一 URL 创建并回收、anchor 移除、envelope deepEqual，之后 warning 与 guard 仍生效。anchor click 抛错与 `createObjectURL` 抛错均显示本地化错误，之后恢复导出成功。</li><li>所有文件 hash 均写入回执 `review-controls-reset-export-5cd63ff.md`。</li><li>**须由最终 reviewer 确认：** E11 在 Settings host composition 中进行，而非生产 `App`。原因是生产 `App` 的 `AccountDataGate` 会在 scope 变化时卸载 pane，形状 7、8（fresh locked 与 fresh B）在其中不可能出现。这与合同"挂载期间连续"的范围一致；强制认证下的持久性属合同排除的 REL-09。</li></ul> |
| E12–E13 native host 矩阵与 downstream | `312b27c`（独立父级 native 验证者；native 目录 9 个新增文件；Chrome 154；`@repo` 全部来自 archive，0 个 checkout 模块；固定 delta 以外的打包模块与 `f359be6` 逐字节相同；各模式迭代 1/3）。<ul><li>**E12**（Settings host composition，含完整 Shell 与 App rail 过滤）：750 项，产品检查 341 项，46 个逐行 runtime gate，a–n 全部 PASS，0 失败，0 runtime error。<ul><li>history 计数（push/replace/popstate/commit）：行 c 中被阻止的 traversal 为 0/0/2/0；锁完成与 Retry 释放各为 0/0/1/1。行 i 的 Retry 释放为 0/0/1/1（Back）或 1/0/0/1（sidebar）。行 m 第一次 Retry 后仍保持持有，第二次释放。</li><li>行 n 恰好一次释放到 `/app/board`，随后显示 `DisabledFeatureFallback`。</li><li>beforeunload 只在有 draft 时警告，handler 内零存储尝试，unmount 后移除监听。</li></ul></li><li>**E13**（生产 `App`，只有 auth session 为合成）：343 项，产品检查 140 项，全部 PASS。§10 第 2–7 点逐项通过：在 12 次操作与 499 个采样帧中，`key:null`、重锁、门屏与节点替换均为 0；外观、AppRail 顺序、pet 位置与字节不变；reset 后拖拽 AppRail 正确持久化；无关键不变；第二 document 跟随 toggle 与 reset，其失败 draft 成为被保留的冲突。</li><li>日志、runner、harness、fixture 与 prelude 的 hash 均写入回执 `review-host-downstream-5cd63ff.md`。</li><li>**须由最终 reviewer 确认：** E12 在 Settings host 中进行，因为行 k 的 epoch 变化在生产 `App` 中会被 `AccountDataGate` 重挂掉；因此模块路由使用真实 `withDisabledFallback` 后的占位内容，pet 关闭。</li></ul> |
| E14–E15 视觉与键盘 | `5905e37`（独立父级视觉与键盘验证者；native 目录 55 个新增文件：runner、fixture、4 个日志、48 张截图与回执 `review-visual-keyboard-5cd63ff.md`；Chrome 154；`@repo` 全部来自 archive；诊断迭代 2/3）。<ul><li>**E14：** EN 1040 项、ZH 1039 项，产品检查各 669 项，0 失败，0 runtime error。5 个宽度上逐控件做中心 hit-test、44×44、水平包含、无横向滚动；375px 溢出已修复（pane 289/289、grid 280/280），几何不小于 `f359be6`；选择器审计新增 84 行、删除 0 行，选择器全部以 `.features-pane` 开头，唯一 at-rule 为 `@media (max-width: 640px)`，因此不触发受影响 caller 的视觉重跑；执行者逐张人工审查了 24 张 v2 截图。</li><li>**E15：** 可信 Tab 顺序与可见焦点正确；Space 与 Enter 各只触发一次；reset confirm 的键盘路径、对话框焦点陷阱、Escape 等同 Stay、焦点归还均 PASS；Retry、Discard、Reload 后焦点落在该字段的开关上，Discard all 后落在 Reset 上（总控决定第 4 项）。EN 在 1024、ZH 在 375 各跑一个宽度。</li><li>**v1 已取代：** 拉高视口会去掉 `.module-settings` 的 10px 经典滚动条，截图内容因此比实际宽 10px，768 与 1024 越过两列阈值。v2 只增加截图期间的 gutter 固定与 3 个保真前置条件；v1 的日志与截图保留并标注为非证据。</li><li>**总控核对：** 只新增 55 个文件，均在 native 目录；worktree clean；两份 v2 日志 `pass`、`harnessValid` 为真；runner、fixture、4 个日志与 24 张 v1 截图的全 hash 均与回执一致；48/48 张截图的 hash 与日志中的 screenshot 记录一致。总控亲自查看了 ZH 768 宠物开启（#24）与 EN 768 全部未解决（#5）两张截图，与回执描述一致。</li><li>**回执笔误（非阻断）：** §8 #19 ZH 1440 all8 的截断 hash 写作 `8dc88e96…e72e`，实际为 `8dc88e96…1d72e`；以 ZH v2 日志 screenshot 记录中的全 hash 为准，E25 须引用全 hash。总控不改执行者的回执。</li><li>**留给最终 acceptance 的非门控观察（回执 §12）：** Toggle 形状、缩略图裁切、冥想图稿与离页对话框无 backdrop，均为既有问题；ZH 开关可访问名称中含英文 on/off（UX-05，合同保留）；键盘 Discard all 后状态行显示 "Features settings saved."，执行者认为符合 §5 第 7 项（同一 mount 内有真实的最新成功，且当前无草稿），由 acceptance 复核。</li></ul> |
| 总控裁定 R-PET（2026-10-04） | **非阻断 CP-FEATURES-01；最终 acceptance 须明确确认或推翻。**<ul><li>**事实（回执 §10）：** 生产 `App` 每次加载都显示 DesktopPet（`App.tsx` 中 `useState(true)`），默认位置为视口右下角内缩 24px；768×1024 时宠物盒为 660–732 × 916–988。pane 滚到底时，最后一个控件落在这条带内。<ul><li>`f359be6`：被盖住的是惰性的 "Save & apply"/"保存生效"，中心在宠物上；Reset 不受影响。</li><li>`5cd63ff`：已确认的 D3 去掉 footer 并把 Reset 右对齐。EN "Reset to defaults" 右侧 2/5 个点被盖，中心仍可点；ZH "恢复默认" 的中心被盖（3/5 个点）。</li><li>375、414、1024、1440 两种语言均无遮挡。</li></ul></li><li>**裁定：** 合同 §9 的 "It is not covered" 按 caller 自身的组合判定，包括 caller 所属的宿主覆盖层（如离页对话框），但不包括 App 级、可由用户开关的全局浮层 DesktopPet。E14 PASS 维持。依据：<ol><li>合同 §11 "Protected" 把 pet 和挂载它的 `App.tsx` 列为受保护面，§10 第 8 项也要求 `xai-web-pet` 与 `apps` 的 diff 为空，本 caller 不得修改；</li><li>已接受的 Sticky E14 与 Features E12 先例同样在宠物关闭时判定；</li><li>全局浮层避让由台账 UX-03（"宠物避让…不被浮层盖住"）与 SHELL-05（"位置不越安全区"）负责。在单个 pane 里躲避，不能满足这一 oracle。</li></ol></li><li>**不淡化：** 这是真实的用户可见缺陷，而且 D3 布局让一个有功能的控件进入了遮挡带：ZH 在中心点击会落在宠物上。替代路径如下：<ul><li>键盘可达（E15）；</li><li>768 宽时 rail 上的宠物开关可见，宠物也可以拖动；</li><li>EN 中心可点；</li><li>按回执坐标，ZH 按钮左侧约 27px 不在宠物盒内。</li></ul></li><li>**冻结复现：** 回执 §10；截图 #11、#12、#23、#24；EN 日志 L29–L98 与 L142–L309，ZH 日志 L29–L97 与 L141–L308。</li><li>**影响范围：** 已证实的只有 768×1024 两种语言。其他 pane、其他宽高与宠物的其他位置均未调查，归 UX-03 做影响调查。</li><li>**建议 oracle（供 UX-03 合同使用）：** 默认位置的 DesktopPet 不得覆盖任何可交互控件的中心点，或页面滚动范围须为宠物留出安全区。</li><li>**后续：** 不在 CP-FEATURES-01 内修复。该复现在 Features 台账对账时作为 UX-03 与 SHELL-05 的证据一并追加，不改状态。修复在 UX-03 排程时另开独立窗口。若最终 acceptance 推翻本裁定，总控另开 Features 本地修复窗口（限合同 §11 文件），之后重跑 768 宠物开启的复现与受影响的 E 项。</li></ul> |
| E18–E25 最终回归 | `0056299`（独立 Sol 最终回归验证者；97 个新增文件，均来自不可变 archive，lockfile gate，`@repo` 固定并带守卫）。<ul><li>**新增文件分布：**<ul><li>`web-features-recovery-final/` 下：3 个新 runner、对照与 hash 脚本、日志、`diagnostics/` 和回执 `review-final-regressions-5cd63ff.md`；</li><li>既有 runner 目录下：7 个带 `features-final-v1` 后缀的日志。</li></ul></li><li>**E18：** 10 个模式，9 个变化行全部落在 §11 文件。Features 产品源中 `new StorageEvent`、`dispatchEvent(` 为 0；pane 与两个 helper 中 `usePref(`、`setPref(`、`removePref(`、`localStorage` 为 0。</li><li>**E19：** 13 个受保护路径 diff 为空；`--name-only` 恰好是 11 个 §11 文件（+1590/−72）。</li><li>**E20：** storage check-types 通过；Sol `bytes` 以新后缀重跑 17/17，生命周期断言（case 004）PASS。</li><li>**E21：** features 包 7 个文件、45 项（含 5 个读者测试），typecheck 与 lint 通过；读者测试在两个 SHA 上均为 17/17。</li><li>**E22：** Web 包 28 个文件、156 项，逐文件计数与已接受回执一致；check-types 与 lint 通过。</li><li>**E23：** settings-shell 11 个文件、54 项。没有已接受的独立回执可对照。</li><li>**E24：**<ul><li>settings-rest 44/314；</li><li>More：fields 22、reset 20、queues 14、owner-export 13、original 15、host 11；boundaries 见 F-B002；</li><li>Sticky：Sol 109、original 10、host 28；</li><li>Notifications：41/24/15/12；</li><li>Date & Time：7。</li><li>对照日志 62 MATCH、2 DIFF，两个 DIFF 都是 F-B002。</li></ul></li><li>**E25：** 24 个 ID 全部列出，每项的产出提交都经执行者核实。执行者重算了全部 216 条 hash（213 个文件）和 26 个已取代的 E14 v1 文件，来源失败为 0。E6 照实标注为提交信息记录；E14 #19 引用全 hash；R-PET 只引用。</li><li>**总控核对：**<ul><li>97 个文件全部为新增，且在允许路径内；worktree clean，只有 git 忽略的 `state.generated.js`；</li><li>回执 hash `eab9c343…` 一致；</li><li>总控自行抽算 E3、E5、E12、E16、E20（E7 日志）、E22 共 6 个 hash，全部一致；</li><li>Web 测试日志 exit 0、28/156。</li></ul></li><li>**未验证：**<ul><li>native、Chrome、视觉项（E4、E9–E15）与 F1 套件（E16、E17）只引用，不重跑；</li><li>除 boundaries 外，各 gate 只跑一次；</li><li>替换后的 runner 不是旧环境的逐字节复现。</li></ul></li></ul> |
| 冻结发现 F-B002 与总控裁定（2026-10-04） | <ul><li>**机制：** More Sol `boundaries.test.tsx` case 002（L17–24）的 `getItem` spy 每次调用都会求值 `physical(unavailable)`。`unavailable` 是账户键，而 `accountScope.physicalKey()`（`accountScope.ts:66–71`）对账户键会经 `localStorage.getItem` 读取 `<prefix>deleted`，于是 spy 递归调用自身，结果取决于栈深度。<ul><li>单独运行时，case 002 每次都失败。</li><li>整文件运行时，会有一个随机字段在挂载读取时收到 `RangeError`；产品把它正确标为 unavailable 并拒绝 reset，oracle 因此失败。</li><li>总控已在源码层面核实这条路径。</li></ul></li><li>**批次 30 的复现：**<ul><li>官方运行：`5cd63ff` 先 10/10、后 9/10；`f359be6` 先 9/10、后 10/10。</li><li>未修改的 runner 重复 10 次：`f359be6` 失败 8 次，`5cd63ff` 失败 7 次。</li><li>More、settings-rest 与 storage 在两个 SHA 上逐字节相同（E19），所以与 Features 无关。</li><li>候选纠正 oracle（在安装 spy 前先计算 key）整文件 16/16、单独运行 4/4，全部 PASS。</li></ul></li><li>**总控追加发现：**<ul><li>More 接受时采用的权威 before 日志是 `web-more-recovery-sol/boundaries-before4-afbfb24.log`（README 列为权威，0/10）。其中 case 002 的失败原因正是 `RangeError: Maximum call stack size exceeded`，即 oracle 假象。</li><li>被取代的 before2、before3 中，case 002 失败于业务断言 `expected null to be 'invalid-bool'`，即 before 产品清除了无效的原始字节。</li><li>结论：before 产品很可能确有这个缺陷，但权威证据记录的不是业务失败。</li><li>其他 boundaries 日志都没有 RangeError：`7b216a3` 的 final1、`982ab68` 的 fixed3 和 Sticky 最终回归均为 10/10；`982ab68` 早期的 fixed1、fixed2 有失败，属于当时的实现迭代。</li></ul></li><li>**裁定：**<ul><li>F-B002 是既有的 oracle 缺陷，不是产品失败，也不归属 Features。</li><li>冻结的原 oracle 不改；纠正须在独立窗口里以新文件完成（批次 31）。</li><li>批次 30 对 E24 More 的结论暂记为"已解释的不确定性"，以批次 31 的纠正 oracle 证据为准。</li><li>More 保持 `accepted`，附条件 C-FB002。</li></ul></li><li>**批次 30 的 runner 替换（总控认可，最终 acceptance 复核）：**<ul><li>旧的 More、Notifications、Date & Time runner 和 `verify-final.mjs` 从检出目录链接 `node_modules`，没有 lockfile gate，也没有守卫。</li><li>批次 30 改用新 runner `verify-callers.mjs`，以相同的 Vitest 语义承载这些 oracle；在 `f359be6` 上，计数与 console 块数都和已接受日志一致。</li><li>总控核实：这些 oracle、fixture 和 runner 自 `d7358b9` 以来未改动。</li></ul></li></ul> |
| F-B002 纠正 oracle 证据（批次 31） | `05b21f4`（独立 Sol；`web-more-recovery-fb002/` 下 84 个新增文件；4 个 SHA 的 lockfile 均为 `df05f2dd…`；每次运行都记录了冻结 fixture 的 hash）。<ul><li>**纠正 oracle：** 只改 L18–19，即先计算 `unavailableKey`，spy 内只与它比较。总控用程序核实其余 68 行逐字相同。它与批次 30 的候选逐字节相同，属于独立产出。</li><li>**矩阵：**<ul><li>纠正 oracle 整文件：`7b216a3`、`f359be6`、`5cd63ff` 上各 10/10 次全部通过；`afbfb24` 上 0/10。</li><li>case 002 单独运行：fixed 上各 3/3；`afbfb24` 上 0/3。</li><li>纠正 oracle 下 RangeError 为 0。</li><li>原 oracle：`afbfb24` 上 10 次都出现 RangeError；`7b216a3` 上 9/10，失败符合 F-B002 特征。</li></ul></li><li>**before 有效性：** `afbfb24` 上 case 002 在 13/13 次运行中都失败于业务断言 `expected null to be 'invalid-bool'`。原因是 before 的 reset 删除了全部 15 个键，连同无效的原始字节。其余 9 个 case 与权威 before4 在错误行和行列号上完全一致。</li><li>**影响扫描：** 177 个文件里共 579 个 storage spy 或 mock。<ul><li>会无界自重入的只有 More Sol `boundaries.test.tsx:19`，以及它在批次 30 diagnostics 中的两个副本。</li><li>其余为有界或不触及 storage 的情形：只用 device 键、每次调用只读一次 `<prefix>deleted`，或完全不碰 storage。</li><li>非阻断观察：`owner-export.test.tsx:38` 的 spy 在账户切换后让所有 `setItem` 抛 `AccountScopeError`。这不是重入，执行者未进一步分析；它属于 More 已接受的 oracle。</li></ul></li><li>**总控核对：**<ul><li>84 个文件均为新增，且在允许目录内；worktree clean。</li><li>回执 hash `d1fa0e42…` 一致，所有新文件的 hash 都写在回执里。</li><li>抽查 `afbfb24` 与 `7b216a3` 日志各一份，结论与回执一致。</li></ul></li><li>**未验证：**<ul><li>只在 jsdom、单台机器上运行；</li><li>原 oracle 的失败率取决于负载；</li><li>递归有时能正常展开，确切原因未查明；</li><li>before2、before3 时期的草稿无法重建。</li></ul></li></ul> |
| 允许修改文件 | 批次 32（独立最终 acceptance）：只新增 `docs/reviews/web-features-recovery-acceptance/` 下的文件；不得修改或删除任何已有文件 |
| 允许修改文件（已执行） | 批次 25（Terra）：只限合同 §11 列出的文件，均位于 `packages/xai-web-settings-features-panel/` 下：<ul><li>`src/FeaturesPane.tsx`</li><li>`src/internal/featuresPane.tsx`（仅转发 render props）</li><li>`src/types.ts`（仅新增可选的 `registerDepartureGuard`）</li><li>最多两个 Features 本地 helper</li><li>scoped CSS</li><li>Features 测试（含本地 Web Lock fixture）</li><li>`docs/api.md` 与 `docs/test.md` 的 Features 段落</li></ul>所有读者、storage、shell（含 `SettingsFooter`）、host（含 `AccountDataGate`）、已接受 caller 与全部证据都受保护 |
| 禁止修改文件 | 全部产品源与测试；合同与选择备忘录；已有证据；台账；本控制面 |
| 后续顺序 | ~~批次 22 Sol（E1–E2）~~（`11e0afb`）→ ~~批次 23 父级 jsdom host（E3）~~（`b732c27`）→ ~~批次 24 native before 与 Features F1（E4–E5）~~（`4c5323f`）→ ~~批次 25 Terra~~（`5cd63ff`）→ ~~批次 26 重跑（E7、E8、E16、E17）~~（`eb37a59`）→ ~~批次 27 native E9–E11~~（`58a93ef`）→ ~~批次 28 native E12–E13~~（`312b27c`）→ ~~批次 29 视觉/键盘 E14–E15~~（`5905e37`）→ ~~批次 30 最终回归 E18–E25~~（`0056299`）→ ~~批次 31 F-B002 纠正 oracle 证据~~（`05b21f4`）→ 批次 32 独立最终 acceptance → 之后按合同 §14 的 E6–E25 |

**最新库存：** `refresh-f359be6.md` / `bindings-f359be6.json`（CP-LUNA-01，`2c69957`）。相对 `afbfb24` 只移除 More 15 行与 Sticky 5 行，余下 52 行逐字段不变。
- 剩余规模：25 个文件、52 个直接绑定、30 个字面量键、2 个动态位点、32 个 setter 绑定（29 个直接、3 个仅下游）、20 个只读绑定。
- 按包分布：dashboard-widgets 11、settings-rest 10、board-workspaces 8、statistics 4，board-views、calendar、settings-appearance 各 3，board-core、pet、features-panel 各 2，pomodoro、dashboard-grid、shell、tasks 各 1。
- 这些是排程输入，不是完整 writer 数，也不是缺陷数。

按 [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md)，Sticky5 是排程中最后一个"剩余普通 Settings 控件"caller。后续 caller 属于该文件"Follow-on caller grouping"中尚待分别规定的组，依次为：

1. Appearance 与 feature toggles；
2. AI settings 与 integrations；
3. Dashboard widgets 与 shell preferences；
4. Board 变体与 workspace；
5. Calendar 与 Tasks 附属项；
6. 业务存储 wrapper；
7. 计时器与控制器结算；
8. 生命周期、secret 与公共 API。

文件要求：父级在当前接受后，按产品风险、已接受证据与实际源码选择下一个完整 caller。

## 执行者映射

本机 Codex CLI 可用，但本会话无法可靠确认当前 Astra/Terra/Luna 模型名，且 CLI sandbox 在关联 worktree 中提交存在风险。因此 Claude 总控按职责映射 Claude agent：

| 角色 | 默认执行者 |
| --- | --- |
| Astra 设计 / 最终决策 | Claude Opus 5.5 |
| Sol 高风险验证 | 另一个独立的 Claude Opus 5.5 |
| Terra 实现 | Opus（高风险）或 Sonnet |
| Luna 低风险检索 | Sonnet 或 Haiku |

作者与验收者始终是不同的新实例；Spark 不分配。用户可随时改派为指定 Codex 模型。

## Luna 任务卡

### CP-LUNA-01 · 直接 usePref 库存刷新（批次 20）

| 字段 | 当前值 |
| --- | --- |
| 状态 | `accepted`（总控核对通过，作为库存证据，不涉及产品范围）：`2c69957`。新增 `bindings-f359be6.json` 与 `refresh-f359be6.md`；按 file+key+setter 对账，移除 20 行、新增 0 行；边界声明沿用；无越界判断 |
| 执行者 | 新的独立 Claude Sonnet 5.5（Luna 角色映射），隔离 worktree |
| 风险 | 低：只读 git 中的固定修订并运行既有扫描器；不触及产品、持久化、宿主或验收 |
| 固定点 | 产品 `f359be6`；对照 `afbfb24` 的 `bindings-afbfb24.json` / `refresh-afbfb24.md` |
| 命令 | `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs f359be6`（扫描器从 git 读源码，需要可解析 `typescript`；worktree 内可先执行 `pnpm install --frozen-lockfile --offline`） |
| 允许新增文件 | `docs/reviews/web-d2-pref-binding-inventory/bindings-f359be6.json`（扫描器输出）与 `refresh-f359be6.md` |
| 验收条件 | <ul><li>计数与相对 `afbfb24` 的逐行 delta 精确对账。预期只移除 More（`morePane.tsx`）与 Sticky（`stickyPane.tsx`）的直接绑定行，任何其他增减都须逐行列出并说明来源提交。</li><li>沿用 `refresh-afbfb24.md` 的边界声明：只统计直接 legacy `usePref` 绑定，不是完整 writer 数，也不是缺陷数。</li><li>不作排程、风险或缺陷判断。</li></ul> |
| 禁止 | 修改任何已有文件、产品、台账、控制面；push、merge、建分支；派生子 agent |
| 停止条件 | 扫描器无法运行或 delta 无法解释时，提交说明后停止 |

## 本会话提交

| 阶段 | 提交 |
| --- | --- |
| More 收尾 | `c0c9ec5` B1/B2 证据 · `0c0ff15` · `27adb10` More acceptance · `bdc4a8d` · `d91b5e5` 台账 |
| Sticky 合同与基线 | `1ddae30` · `70ff46a` 合同 · `39152bb` · `4e21e6d` Sol oracle · `a6781f0` · `07784c4` host 基线 · `37a4d33` |
| Sticky 实施与验证 | `210abdf` Terra · `8db7d30` · `7ee8de6` · `c18db81` · `bc92561` · `0772569` · `019f451`（F1 冻结） |
| F1 | `d113c6a` · `0ba68d7` 评审 · `41774ab` · `e3db4e0` · `c3b9883` · `f359be6` 修复 · `518fa42` · `3ea0310` · `2bdb020` · `f3a3c82` · `1c58841` · `a0df253` 台账 |
| Sticky 收尾 | `98125c5` 视觉 · `463c2ab` · `d7358b9` 最终回归 · `b2a21d0` · `47bbd58` BLOCKED(G1) · `89d4302` · `3debd91` G1 · `57f396c` · `699f6e6` Sticky acceptance |
| Sticky 关闭 | `b63aad6` CP-STICKY-01 改为 `accepted` · `4da6e71` 台账 |
| 下一项选择 | `40f7004` 登记 CP-LUNA-01 · `2c69957` 库存刷新 |
| 下一项选择（续） | `51d65aa` 登记批次 21 · `6ded3dc` 选择与 Features 合同 |
| Features | `4a54f76` 登记 CP-FEATURES-01 · `11e0afb` Sol before oracle（E1–E2） |
| Features（续） | `c49dd50` 登记批次 23 · `b732c27` 父级 host 基线（E3） |
| Features（续 2） | `0d61d61` 登记批次 24 · `4c5323f` E4–E5 |
| Features（续 3） | `8d53038` 授权批次 25 · `5cd63ff` Terra 实施 |
| Features（续 4） | `c516fce` 登记批次 26 · `eb37a59` E7、E8、E16、E17 |
| Features（续 5） | `9d64192` 登记批次 27 · `58a93ef` E9–E11 |
| Features（续 6） | `557ea3b` 登记批次 28 · `312b27c` E12–E13 |
| Features（续 7） | `4c4e901` 登记批次 29 · `5905e37` E14–E15 |
| Features（续 8） | `cde9138` 登记批次 30 · `0056299` E18–E25 |
| Features（续 9） | `7520775` 登记批次 31 · `05b21f4` F-B002 纠正 oracle 证据 |
| 本提交 | 记录批次 31 与 C-FB002 满足，登记批次 32 |

## 台账变化

- 无编号状态变化；13/312 完成、299 未关闭保持不变。
- Sticky 接受链已在 `4da6e71` 写入：只追加 REL-05 证据与检查点文字，SET-12 保持待处理，并保留"caller accepted ≠ 业务/发布完成"。

## 成本检查（非阻断）

| 周期 | 批次 | 情况 |
| --- | --- | --- |
| 1 | 1–3 | More 证据接收与最终验收、台账、Sticky 选择与合同 |
| 2 | 4–6 | Sol oracle、host 基线、Terra 实施；各一次完成 |
| 3 | 7–9 | fixed 重跑、native controls/导出、host 矩阵（发现 F1） |
| 4 | 10–14 | F1 评审、before 复现、协调器修复、两轮重跑；均一次通过 |
| 5 | 15–19 | 视觉/键盘、最终回归、最终复审（G1 排程遗漏）、G1 补证、窄范围复审 |
| 6 | 20–23 | 库存刷新、下一项选择与 Features 合同、Sol before oracle、父级 host 基线；各一次完成 |
| 7 | 24–26 | native before 与 Features F1、Terra 实施、fixed 重跑；各一次完成 |
| 8 | 27–29 | native controls 与导出、host 矩阵与 downstream、视觉与键盘；前两批一次完成，批次 29 因截图保真用了 2/3 轮诊断迭代 |

- **主要额外成本：**
  - F1：必要的共享缺陷修复，以及受影响 caller 的重跑；
  - G1：总控排程遗漏，导致一次补证与复审；
  - F-B002：已接受的 More oracle 不确定，增加一个证据批次（批次 31）。
- **改进：** 登记最终回归时须核对合同中全部 Required evidence 条目，不只 Final regression 行。

## 本轮唯一任务

批次 32：由独立最终 acceptance（Astra 角色，新 reviewer）对 CP-FEATURES-01 作出 ACCEPTED、BLOCKED 或 FAIL 的结论。

- **固定点：**
  - fixed `5cd63ff`，before `f359be6`；
  - 合同 `web-features-recovery-contract/contract.md`（`6ded3dc`）；
  - 控制分支基点为本提交。
- **必须做到**（合同 §13 Acceptance condition 与 §14 Rules）：
  - 8 个 gate 逐行对账四类事实：源码、正确的 before 失败、fixed 的独立行为、实际用户界面；
  - E1–E25 每项引用路径与 SHA-256，并自行重算每项至少一个 hash；任何 ID 缺失即 BLOCKED；
  - 阅读 fixed 产品源码（§11 的 11 个文件），独立判断实现是否满足 §5–§9，不只依赖日志。
- **须明确确认或推翻的事项：**
  1. R-PET（宠物遮挡不阻断）；
  2. 批次 30 的 runner 替换（由 `verify-callers.mjs` 承载旧 oracle）；
  3. F-B002 下 E24 More 的处理：冻结 oracle 在 fixed 上不确定，纠正 oracle 稳定 10/10（`05b21f4`）；
  4. 总控决定第 2 项 D3（停用共享 footer，Reset 改为 Features 本地控件）与第 4 项（焦点落点）；
  5. E6 的 Terra 包测试只记录在提交信息中，是否满足 E6；
  6. E14 回执 §12 第 3 项：键盘 Discard all 后状态行显示 "Features settings saved."，是否符合 §5 第 7 项。
- **输出：** 只新增 `docs/reviews/web-features-recovery-acceptance/` 下的文件：
  - ACCEPTED 写 `acceptance-5cd63ff.md`，BLOCKED 写 `blocked-5cd63ff.md`；
  - 可附 hash 与核对脚本及其日志。
- **结论范围：**
  - caller 接受只覆盖 Features 8 个开关与 Reset to defaults 的 recovery caller；
  - 不关闭 SET-03、REL-05、REL-07、REL-09、REL-10、UX-03、UX-04、UX-05、SHELL-02、SHELL-03、SHELL-05、QA-01/03/04/09、D2/REL/AI 或任何其他 312 编号；
  - 不授权部署、发布、分支提升或 Web→Desktop 同步。
- **禁止：**
  - 修改产品、合同、已有证据、台账或控制面；
  - 修复；
  - push；
  - 派生子 agent。
- **成本上限：** 不重跑完整矩阵；只在核对确有需要时做针对性的只读复核或单次重跑，输出写入 acceptance 目录。
- **停止条件：** 发现真实产品失败时，冻结复现、影响范围与正确 oracle，写 BLOCKED 或 FAIL 回执后停止；修复由总控另开窗口。

## 下一步

1. 等待批次 32 回执，总控核对：
   - 只新增文件；
   - 逐 gate 的四类事实对账；
   - E1–E25 的 hash 抽查；
   - 对 6 个待确认事项的明确结论。
2. 若 ACCEPTED：
   - CP-FEATURES-01 改为 `accepted`；
   - 台账对账另起一批：追加 REL-05 证据；在 UX-03 与 SHELL-05 下追加 R-PET 复现；追加 More 的 F-B002/C-FB002 证据；不改状态；
   - 记录成本检查周期 9（批次 30–32）；
   - 然后选择下一项。
3. 若 BLOCKED：按回执列出的缺口，登记补证或修复窗口。
