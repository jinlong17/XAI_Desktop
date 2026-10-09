# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-09

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`419e56de9f23e4467fea806fbd4a990e1f429941`（Appearance caller，含 F-APP-1 与 F-APP-2 修复；相对 `24073b5` 只多出 `styles.css` 的两段追加与两个守卫测试；相对 `5cd63ff` 共 26 个文件，全部在合同 r3 §11 内）

模块归属：`web`

本轮模式：AppRail 最终回归 E18–E25 在 `f9eb4b1` 上 PASS（`ee60b48`），§15 的 E1–E25 全部齐全。本批登记批次 65：CP-APPRAIL-01 的独立最终 acceptance。当前 Claude 总控窗口不实施产品或 verifier 修复，也不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `ee60b48` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。本会话创建的所有隔离 worktree 与临时本地分支均已在快进接收后清理。
- 产品基线依次前进：`2023526` → `210abdf`（合同 §11 的 8 个 Sticky 文件）→ `f359be6`（`departureCoordinator.tsx` 与新测试 `departureCoordinator.blocker.test.tsx`）→ `5cd63ff`（Features 合同 §11 的 11 个文件，全部位于 `xai-web-settings-features-panel`）→ `24073b5`（Appearance 合同 r3 §11 的 24 个文件：Appearance 包、shell 的 Topbar/Shell/types 与 Topbar 测试、`App.tsx` 与新 App 测试）→ `5bbf473`（F-APP-1：Appearance `styles.css` 追加 9 行，并新增一个焦点环守卫测试）→ `419e56d`（F-APP-2：`styles.css` 再追加 13 行，并新增一个选中焦点守卫测试）。共享 storage、shell、widgets、其他宿主文件、其他 caller 与 lockfile 均无变化。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` 保全 Sol 原证据提交 `c3ab20d`，不得合并。
- 每次 push 后运行 `pnpm git:sync-check -- --fetch`，最近一次为 failures=0、warnings=1（未请求 deep 扫描）。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。产品改动进入 Desktop 前仍须走 ADR-0013 D3 gate。

## 台账与 Git 的差异

- 正式台账已在 `d91b5e5`（More 与 Notifications 接受链）、`a0df253`（F1）、`4da6e71`（Sticky 接受链，REL-05 证据追加 25 条）、`6ec0bec`（Features 接受链：REL-05 追加 27 条，含 F-B002 证据；UX-03 与 SHELL-05 各追加 4 条宠物遮挡缺陷证据，不是完成证据）与 `0a46577`（Appearance 接受链：REL-05 追加 41 条；SET-02 记录用户决定与接受；SHELL-04 记录崩溃前后证据；UX-05 记录焦点缺陷证据）核对，均未改条目状态。
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
- **Features（CP-FEATURES-01）：** `accepted`，固定产品 `5cd63ff`（before `f359be6`）。
  - **最终接受：** 独立最终 acceptance `ec55f9e`（`web-features-recovery-acceptance/acceptance-5cd63ff.md`，Astra 角色）。
    - 合同 §13 的八个 gate 逐行对账四类事实，全部 PASS；
    - E1–E25 齐全，242 个工件 hash 全部重算一致；
    - 六项裁定全部确认。
  - **证据链：**
    - 选择与合同 `6ded3dc`（`web-features-recovery-contract/contract.md`）；
    - before oracle：Sol `11e0afb`、父级 host `b732c27`、native 与 Features F1 `4c5323f`；
    - 实现：Terra `5cd63ff`，只改 §11 的 11 个文件；
    - fixed 重跑 `eb37a59`；Chrome native controls/reset/导出 `58a93ef`；host 矩阵与 downstream `312b27c`；EN/ZH 五宽度视觉与键盘 `5905e37`；
    - 最终回归 `0056299`（冻结 F-B002）；F-B002 纠正 oracle 证据 `05b21f4`。
  - **裁定（均经 acceptance 确认）：**
    - R-PET：768×1024 下默认位置的 DesktopPet 遮挡 Reset，判为非阻断；复现记入 UX-03 与 SHELL-05；
    - 批次 30 的 runner 替换；
    - F-B002 下 E24 More 以纠正 oracle 为准；
    - D3 与焦点落点；
    - E6 只记录在提交信息中；
    - 键盘 Discard all 后显示 "Features settings saved."，符合 §5 第 7 项。
  - **接受范围：** 8 个模块开关与 Reset to defaults 的 recovery caller。以下编号均不因此关闭：`SET-03`、`REL-05`、`REL-07`、`REL-09`、`REL-10`、`UX-03`、`UX-04`、`UX-05`、`SHELL-02`、`SHELL-03`、`SHELL-05`、`QA-01/03/04/09`、D2/REL/AI。
  - **非阻断后续：**
    - 宠物遮挡复现归 UX-03 与 SHELL-05；
    - Reset 被接受时仍在写入中的 set 若随后失败，Retry 会先重写被取代的值，再执行删除；最终字节是 reset 的结果，符合 §5 第 5 项与 More 先例，但还没有冻结 oracle 覆盖；
    - Discard all 后出现的 Saved 文案，可能被读成在确认 discard（UX-04）；
    - 实施批次应为执行者预留测试运行的记录位置；
    - AC-PANE-6 的测试标题仍提到 `SettingsFooter`；
    - demo 账户下的 Reset 未单独验证（更严格的 locked 情形已覆盖）；
    - 既有视觉问题，以及 ZH 开关可访问名称中的英文 on/off（UX-05）。
- **Appearance（CP-APPEARANCE-01）：** `accepted`，固定产品 `419e56d`（before `5cd63ff`）。
  - **最终接受：** 独立最终 acceptance `a560863`（`web-appearance-recovery-acceptance/acceptance-419e56d.md`）。
    - 合同 r3 的十个 gate 逐行对账四类事实，全部 PASS；
    - E1–E27 齐全，697 个 hash 全部重算一致；
    - 15 项裁定全部确认，其中 F-APP-3 与 44×44 两项附限定说明。
  - **范围：** 7 个 device 键，即语言、主题、密度、字号、强调色、背景与 rail 位置。三个写入面：Settings pane、`App.tsx` 根偏好 writer、Topbar 快速切换。相对 `5cd63ff` 共改 26 个合同 r3 §11 文件。
  - **产品负责人决定（SET-02）：** 继续自动保存；底部按钮保留并改为真实的"全部重试"；按钮始终显示，没有可重试项时以 `aria-disabled` 禁用。
  - **用户可见的修复：**
    - 修复前，任一畸形根值都会让整个 `/app` 崩溃，例如语言写成 `"fr"` 或 `"EN"`、强调色写成 `Infinity`；修复后均不崩溃。
    - 写入失败不再被吞掉，也不再虚假显示 "Saved"；失败可逐字段重试，也可全部重试。
  - **证据链：**
    - 选择与合同 `e9fbdb7`，r2 `b2e5eb2`，r3 `706c9a3`；
    - before：Sol `bd09456`、host `b997235`、native 与 F1 `72538d1`；
    - Terra `24073b5` 与 `4874170`；OE 判定 `26cfce8`；fixed 重跑 `31d6335`；native `3419542`、`32e6753`；K-1 `6b9f0ee`；
    - E14–E15：`5307b6f` FAIL，发现 F-APP-1，由 `5bbf473` 修复；`bacdbbc` FAIL，发现 F-APP-2，由 `419e56d` 修复；`2696855` PASS；
    - 最终回归 `c6d1ed4`；台账 `0a46577`。
  - **附带裁定（均经 acceptance 确认）：**
    - OE-1/OE-2 以纠正副本为准；
    - K-1 没有改变任何结论；
    - E9–E13 与 E26 由 delta 审计沿用；
    - F-FD1：Features 附条件 C-FD1；
    - C-FB002；
    - R-PET；
    - Topbar 断点勘误；
    - 44×44 只适用于本 caller 新增或改动的目标。
  - **接受范围：** 以下编号均不因此关闭：SET-02（正文仍不随字号缩放）、SHELL-04、SHELL-05、SHELL-06、UX-03、UX-04、UX-05、REL-05、REL-07、REL-09、REL-10、QA 各项，以及其他编号。
  - **非阻断后续：**
    - **UX-05（优先）：**
      - F-APP-3：Topbar 弹层选项没有可见焦点；
      - tokens 中 F-APP-1/2 的根因，以及 `styles.css:116–119` 的重复规则；两个守卫测试须同步更新；
      - Topbar 原有控件在 1024px 以上高 36px；
      - 全局焦点环偏淡；
      - AppRail "任务" 的焦点环在 375px 被裁剪；
      - 登出后 AvatarMenu 仍保持打开。
    - **REL-07：** source-only 字段在另一个 document 中被修复后，仍需 Reload。
    - **文档：** `docs/test.md` 须列入两个守卫测试。
    - **条件：** 今后的回归须运行纠正副本（C-FD1、C-FB002、OE）；native runner 遵循 K-1 规则。
    - **共享引擎：** 本 caller 是开放式 async 路径的第一个 device 生产使用方，该路径今后出现的缺陷按共享缺陷处理。

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

### CP-APPRAIL-01 · AppRail 顺序（`xai_rail_order`）完整 caller

| 字段 | 当前值 |
| --- | --- |
| 状态 | `implementation_ready_for_review`：合同 r1 已确认；E1–E5 全部冻结（`d6ea500`、`6e9ec9c`、`04ee6a2`）；E6 Terra 实施 `f9eb4b1` 与运行记录 `0d440ca` 已接收；E7、E8、E15、E16、E17 PASS（`94b12ba`）；native E9–E11 PASS（`ae7b69e`）；E12–E13 PASS（`55cf1e9`）；E14 PASS（`5c6bcd2`）；最终回归 E18–E25 PASS（`ee60b48`）；批次 65 登记独立最终 acceptance |
| E18–E25 最终回归 | `ee60b48`（独立 Sol 最终回归验证者；143 个新增文件：`web-apprail-order-recovery-final/` 下 87 个，含回执 `review-final-regressions-f9eb4b1.md`、`hashes-apprail-final-v1.log`、`compare-accepted-apprail-final-v1.log`；另 56 份 `apprail-final-v1` 日志由既有 runner 写在各自目录）。<ul><li>**E18：** 140/140 断言，51 个计数变化全部落在 §11 文件；shell 源码与 `AppRail.tsx` 不用任何存储 API；`readLocalPref` 逐字节相同。**E19：** 14 个受保护路径不变，diff 恰好是 19 个 §11 文件（+2960/−76）。**E20：** storage check-types 退出 0；Sol 生命周期 case PASS。</li><li>**E21：** shell 12 文件 205 项，逐文件与 Terra 相同；未改动测试 91 项与原有 24 个 Topbar case 在两个 SHA 上结果相同。**E22：** web 30 文件 196 项，`419e56d` 对照 29/178，只差 `App.railorder`（18）；§10 第 10 项的 web 测试 118 项与 storage 测试 31 项两个 SHA 相同。</li><li>**E23：** 85 项 MATCH、0 项 DIFF。Appearance Sol bytes 65、fields 89、reset 34、queues 56、host 33、retry-all 48，`continuity-export` 冻结 24/26、OE 副本 26/26，`original` 187（已接受的 185 加两个 TP-RAIL），父级 host 33，包 137；Features Sol 17/49/31/40/26/6，host 40，包 45，reader 17；More 22/20/14/13/15，host 11，`boundaries` 冻结 10/10（按实际记录），C-FB002 10/10；Notifications 41/24/15/12；Date & Time 7；Sticky 109/10/28；Smart Lists 8/10/3/5/5/39/4；Collaborate 37、8；Pomodoro 9、8；Dashboard Header 5、5、2；settings-shell 11/54，settings-rest 44/314。</li><li>**§13 预测全部吻合：** Features `downstream` 冻结原件 `419e56d` 14/15（012，F-FD1）、fixed 13/15（012 F-FD1，014 A7）；C-FD1 15/15 → 14/15（014 A7）；**C-RD1（判定副本）15/15 → 15/15**，满足总控确认第 7 项的条件；全部判定副本通过。</li><li>**E24：** Features native host 341/341、downstream 140/140 产品检查，经一个只改产品 delta 前置条件的副本运行（相对冻结原件与已接受的 Appearance 副本的 diff 均已提交；冻结原件的拒绝日志已提交），runtime error 为 0，K-1 按键审计一致。**E25：** G1 完整，每项重算 hash，缺失 ID 为 0，来源失败为 0。</li><li>**总控裁定：**<ol><li>**host 套件副本（Smart Lists、Collaborate、Pomodoro、Dashboard Header）：** 冻结 runner 把 `git archive` 读入 100 MiB 缓冲；archive 从这些 runner 接受时的约 74MB（`f359be6`）增长到 `419e56d` 的约 126MB 与 `f9eb4b1` 的约 148MB，增长来自累积的审查证据而非产品代码，31 次调用都在任何测试运行前以 `ENOBUFS` 退出，`419e56d` 上同样如此。总控查看了四个副本的 diff：恰好两处改动（缓冲改为 1 GiB；副本深两层，`root` 相应上移），测试文件与冻结原件逐字节相同（总控抽查 Collaborate 与 Smart Lists 的 7 个测试文件 hash 一致）。这属于与旧 SHA 前置条件同类的环境容量前置条件，不是"其他拒绝"，接受副本结果；拒绝记录已提交。今后的 runner 须使用足够大的缓冲或流式读取 archive（新经验）。</li><li>**E24 副本与保留 WebSocket 传输：** 沿用 Appearance 先例，接受。</li><li>**§10 第 9 项中 `App.tsx` 不含 `localStorage` 的表述：** 与同项要求 `readLocalPref` 逐字节不变自相矛盾；按"没有新增 `localStorage` 行（4 = 4），另两行是注释"核对，接受，由最终 acceptance 复核。</li></ol></li><li>**总控核对：** 父提交 `9aeec39`；143 个文件全部新增，`web-apprail-order-recovery-final/` 之外的文件都是带 `apprail-final-v1` 后缀的日志；142 个文件的 hash 都出现在回执或 hash 日志中；host 套件副本 diff 与测试文件 hash 由总控直接核对。</li></ul> |
| E14 native 键盘 | `5c6bcd2`（独立父级 native 验证者；`web-apprail-order-recovery-native/` 下 34 个新增文件：runner `verify-native-keyboard-f9eb4b1.mjs`、2 份日志、30 张截图、回执 `review-keyboard-f9eb4b1.md`）。<ul><li>EN 1024×768 与 ZH 375×812 各一次权威运行（`fixed1`），harness-valid，产品检查 167/167 与 167/167，前置条件零失败，产品 runtime error 为 0；按键审计 928 与 906 次按键，零失配，不带 `nativeVirtualKeyCode`；archive 守卫零违规，lockfile gate 六处一致；对话框只有离开含草稿 document 时预期的 `beforeunload`。</li><li>**Tab 顺序：** 徽章（非 Tab 停靠点）→ Appearance 状态 → rail 状态 →（Enter 打开面板后）Retry、Discard、Export → appearance 触发器；source 问题时为状态 → Reload → 触发器；完整循环符合 DOM 顺序，Shift+Tab 严格逆序。</li><li>**Enter/Space：** 各自恰好切换面板一次、激活每个操作一次，零存储写入；Space 从不滚动页面（对照：在非控件文字上 Space 滚动 449/652px）。**Escape** 关闭面板并把焦点还给状态按钮。**焦点目标：** Retry 失败留在 Retry；Export 留在 Export 且下载内容正确；Discard、Retry 成功、修复 source 的 Reload（Enter 与 Space）后状态卸载，焦点落在 `.topbar-pref-trigger`，逐帧采样中焦点在 `<body>` 的帧为 0。</li><li>**像素焦点 walk：** 冻结块（298 行）从 `verify-visual-keyboard-5bbf473.mjs` 逐字节复制，该文件与 `git show bacdbbc:` 相同（`54508918…`，总控复算一致）；每次运行复核块 hash `e024c90e…` 与 `pixelFocusWalk` 函数 hash `1cdb0c13…`。停靠点数：`419e56d` clean 对照 EN 59 / ZH 57；fixed clean 59/57，失败草稿面板关闭 60/58、打开 63/61，source 面板打开 61/59（light 与 dark）。1188 次停靠点截图零失败；28 次新增停靠点截图都可见（自身区域变化 393–972 像素）；既有停靠点与 `419e56d` 对照一致。</li><li>**弱停靠点（可见，但焦点环变化低于 15%）：** EN 无。ZH：已知的 UX-05 底栏第一个 rail 项（81–82/2209 像素，与 `419e56d` 相同）；新发现 **F-E14-1**：375 宽度下打开的 source 面板（fixed 于 Topbar 下方）遮住约 98% 获得焦点的 settings 侧栏"账户""会员"两行，变化像素从 `419e56d` 的 720/835 降到 309/311（环带比 0.149、0.128）；失败草稿面板打开时约遮住一半（0.171、0.166）。冻结 oracle 仍判这些停靠点通过。</li><li>**未判定观察：** 375 宽度、显示 premium 徽章且两个状态并列时，Topbar 搜索框缩到约 100px、占位文字换行（E13 未带徽章）。</li><li>**总控裁定：**<ol><li>**F-E14-1 不阻断 E14：** 合同 §7 规定面板只在 Escape 与状态根外的 `mousedown` 时关闭，焦点离开面板不关闭；Terra D6 的窄宽度 fixed 定位与已接受的 Appearance 弹层一致；合同 §9 要求新增停靠点全部通过、既有停靠点按冻结 oracle 与 `419e56d` 一致并报告弱停靠点数值，这些都成立；焦点控件没有被完全遮住（WCAG 2.4.11 最低要求的边界）。因此实现符合合同，记为非阻断的 UX 后续项，归入 UX-05（与 F-APP-3 同类：Topbar 非模态浮层在窄屏遮挡后续焦点；可选方案如焦点移出状态根时关闭面板），由最终 acceptance 复核本裁定。若产品负责人要求在接受前修复，须先修订合同再开 Terra 窗口。</li><li>**搜索框观察：** 归入 UX 后续项，不属本 caller 判定范围（徽章与搜索框均为受保护的既有 chrome）。</li><li>**偏差：** walk 都在 `/app/settings/appearance` 上进行（冻结 oracle 自检需要色相滑块，且 `419e56d` 先例走此路由）；面板打开的 walk 从面板文字开始，避免起始点击关闭面板；以 account-scoped 的 premium tier 存根 key 显示徽章；ZH 草稿在 1440 宽度建立后再缩放到 375；弱停靠点诊断只记录、其按键已审计。均接受。开发探测 dev1–dev7 只写 scratchpad，已披露（dev6 为截图重名，已在权威运行前修正）。</li></ol></li><li>**总控核对：** 父提交 `641ca45`；34 个文件全部新增且都在 native 目录；33 个文件的 hash 都出现在回执中；两份日志的 result 行由总控查看；冻结文件 hash 由总控对 `bacdbbc` 复算；总控亲自查看了 ZH light 下 F-E14-1 的截图（面板遮住侧栏顶部，获得焦点的行几乎不可见）。</li></ul> |
| E12–E13 native downstream 与视觉 | `55cf1e9`（独立父级 native 验证者；`web-apprail-order-recovery-native/` 下 49 个新增文件：runner、3 份日志、42 张截图、回执 `review-downstream-visual-f9eb4b1.md`）。<ul><li>三个模式各一次权威运行（`fixed1`），全部 harness-valid、零失败：downstream（E12）产品检查 1081/1081、visual-en（E13）538/538、visual-zh 529/529；fixed 产品 runtime error 为 0（排除项只有 prelude 自检阳性对照，以及 visual 日志中 `419e56d` 路由错误 before 截图的 4 条，后者不判定）；按键审计 51、27、27 次，零失配；非本地网络为 0；archive 守卫零违规。</li><li>**E12：** 精确字节与兼容（含 P1–P7 与真实 Settings→Account 下载，EN/ZH）；`419e56d` 写下的字节由 fixed 以相同方式显示与读取；显示真实性（逐帧采样，rail 与状态同帧变化）；崩溃安全：加载时 288 项、由第二个 document 写入时 198 项；host 行 m 两个真实 App document；跨模块隔离 10 种操作，零 StorageEvent、零 `preference-changed`，其他 key 不变，登出 OK 改动的 key 与 `419e56d` 参照完全相同。</li><li>**clean 状态 chrome 不变（§10 第 6 项）：** 24 种配置（EN/ZH；1440 左侧、1440 顶部、375；全部模块或隐藏 Boards；默认或自定义顺序），两个 SHA 用相同种子字节，逐项比较 rail 与 Topbar 的 `outerHTML`（弹层关闭与打开）、`.app` 与 `<html>` 属性、逐元素几何，以及 rail 与 Topbar 区域的解码像素；312 项比较全部相同，唯一遮罩是 375 rail 区域中扩大 24px 的宠物。7 对整屏截图中 4 对逐字节相同，3 对只差宠物动画帧。按合同 §13，其他 caller 的视觉与键盘证据不需重跑。</li><li>**E13：** EN/ZH 在 375×812、414×896、768×1024、1024×768、1440×900 下全部 PASS：新控件中心与四个内缩点命中、不被遮挡、至少 44×44、在 Topbar 与视口内、文案符合合同；768 起显示文字、以下只显示图标；面板在视口内；两个状态同时显示时 Topbar 全部控件包含且可命中；新控件所在状态无水平滚动；1440 拖动预览与 R-1 序列通过。R-PET 阻断项通过：新控件从不被遮挡，打开的面板不与宠物重叠。selector 审计：唯一 CSS 改动是 `railOrderStatus.css` 的 18 个 selector，都以 `.rail-order-status` 开头，一个 `@media (max-width: 767px)`，其余打包样式与 `419e56d` 逐字节相同；Retry、Discard、Export、Reload 与状态按钮都有 2px solid、offset 2px 的 `:focus-visible` outline。</li><li>**既有观察（不归本 caller）：** 768 宽度的顶部 rail 横向溢出（873/768px），以及 414 下一个底栏按钮被 rail 滚动容器裁剪，两者在 `419e56d` 完全相同。</li><li>**总控裁定：** 375 与 414 宽度下宠物的 rail 按钮被隐藏，宠物开启时的失败草稿拖动只能在宠物可见时进行（源与目标仍未遮挡）；clean 状态布局以 `419e56d` 为基准而非绝对无滚动（因上述既有溢出）；隔离拖动保持宠物可见（宠物位置本身是检查项）；像素比较的宠物遮罩；点击宠物按钮后重置滚动。均接受，最终 acceptance 复核。开发探测 downstream dev1–dev6、visual-en dev1–dev4 只写 scratchpad，已披露。</li><li>**总控核对：** 父提交 `6fad75d`；49 个文件全部新增且都在 native 目录；48 个文件的 hash 都出现在回执中；三份日志的 result 行由总控查看；总控亲自查看了 ZH 375 两个状态并列的截图（两个状态图标都在 Topbar 内）与 EN 375 失败面板截图（Retry、Discard、Export 在视口内）。截图中 Tasks 页的保存失败横幅是既有的无关观察（同批次 39 裁定 5）。</li></ul> |
| E9–E11 native controls、保护与导出 | `ae7b69e`（独立父级 native 验证者；`web-apprail-order-recovery-native/` 下 57 个新增文件：runner `verify-native-fixed.mjs`、fixture、3 份日志、9 个导出 JSON、42 张截图、回执 `review-controls-protection-export-f9eb4b1.md`）。<ul><li>每个模式一次权威运行（`fixed1`），全部 harness-valid、零失败：controls（E9）产品检查 1024/1024、protection（E10）134/134、export（E11）68/68；产品 runtime error 为 0（每份日志唯一一条是 prelude 自检的阳性对照，按精确文本排除）；无 console 警告、无非本地网络、无意外对话框；按键审计只有 runner 自己的按键（1、20、1），不带 `nativeVirtualKeyCode`；每次运行都校验冻结 before runner、fixture 与 prelude 的 hash。</li><li>**E9：** host 行 b、c、e、f、o、p、r 加 uncertainty 与 D1 探针全部 PASS；行 o 覆盖 18 个值（§5 第 2 项的 17 个畸形值加读取抛错），EN/ZH、三个路由，并各做一次在其上的拖动。</li><li>**E10：** 行 a、d、g–l、n、q 全部 PASS；h 与 k 与 `419e56d` 打包的参照运行比较。两个 auth 分支的登出确认列表精确：无草稿或只有 Appearance 为 [] 或 [Appearance]，只有 rail 为 [rail]，两者都有为 [rail, Appearance]；行 k 中 rail OK 之后的 Settings 离页对话框与 `419e56d` 相同，outerHTML 一致。</li><li>**E11：** §8 的五种磁盘形态在完全拒绝下导出：零存储尝试，创建并撤销同一个 object URL，移除 anchor，文件与完整期望信封一致；两种 setup 失败（EN click 抛错后恢复导出，ZH `createObjectURL` 抛错）均 PASS。</li><li>**D1 观察：** 78 次可信拖动的全部拖动事件 `isTrusted`；预览从不在 `dragenter` 后变化；79 次预览变化都发生在拖到非被拖按钮的 `dragover` 之后；`dragend` 后的 3 次变化是行 r 三次取消的恢复。专门探针在 `dragEnter` 与 `dragOver` 之间停 450ms，dragenter 后仍是起始顺序，dragover 后才成为放下的顺序。</li><li>**总控裁定：**<ol><li>**行 r 的"放到文本输入框"：** 产品的 `effectAllowed = "move"` 使 Chrome 不向输入框派发 `drop`，手势以 `dragleave`、`dragend` 结束。按合同 §6 第 4 项，这属于"未在 rail 内 drop 的 dragend"即取消；合同对该行要求的零写入与预览恢复成立。§6 第 9 项的输入框插入 id 是既有浏览器行为，合同本就只以零写入断言覆盖，未观察到不影响结论。使用 Metrics 页的 Height 字段（Tasks 没有常驻文本框），接受。</li><li>**协调器分支用合成 coordinator：** 沿用 Appearance 先例，接受。</li><li>**行 d 的历史计数器只记录不判定；宠物在挂载后经产品自身的 rail 按钮隐藏（行 a 与 `419e56d` 参照除外）；产品意外出现或缺失的对话框按产品失败计：** 均接受。</li><li>开发探测 controls dev1–dev9、protection dev1–dev6、export dev1–dev2 只写 scratchpad、未提交，已在回执 §8 披露，不计入迭代上限。</li></ol></li><li>**总控核对：** 父提交 `2b8f877`；57 个文件全部新增且都在 native 目录；56 个文件的 hash 都出现在回执中；三份日志的最终 result 行由总控查看（harnessValid、pass、failures 为空、按行计数）；导出 JSON 抽查信封正确；总控亲自查看了三张截图：重新开启 Boards 后它回到 rail 第 3 位（下标 2）；ZH 畸形值下 Topbar 显示"顺序不可用"，面板只有"重新读取"；深色 ZH 下 Appearance"未保存"与 rail"顺序未保存"两个状态并列。截图中 Tasks 页左上的保存失败横幅是既有的无关观察（同批次 39 裁定 5）。</li></ul> |
| E7、E8、E15、E16、E17 fixed 重跑 | `94b12ba`（独立 Sol；26 个新增文件：25 份日志与回执 `web-apprail-order-recovery-sol/fixed-f9eb4b1.md`）。<ul><li>**E7：** Sol 八个模式全部 PASS，PRECONDITION 为 0：bytes 26/26、domain 31/31、merge 21/21、drag 18/18、field 24/24、continuity-export 22/22、host 33/33、original 123/123（新增的两个为 TP-RAIL-1、TP-RAIL-2，原 121 项同名全过）。七个业务模式 129 项 FAIL→PASS、46 项 PASS→PASS，没有 PASS→FAIL；20 个冻结文件的 hash 运行前复算一致。</li><li>**E8：** 父级 host 31/31；24 项 FAIL→PASS、7 项 PASS→PASS。</li><li>**E15：** 12 个冻结 F1 运行全部 PASS，runner hash 不变，检查序列与 `419e56d` 的 `appearance-final-v1` 基线逐项相同；没有 `Invalid blocker state transition`。日志中的 `"verdict":"refuted"` 指 F1 假设被否定，即通过，与基线写法相同（总控已核对）。</li><li>**E16：** rail F1 selfcheck harness-valid（165），railorder 的 f1–f3 为 fixed-pass（104 项，与 before 日志同序，恰好 4 个产品检查由 false 变 true）。f1：rail 确认 OK，More 协调器持有，一次 Retry 释放一次，无 router 提交；f2：Cancel 零历史变化；f3：一次 `navigate` 重放、一次 PUSH；selfcheck 中 Back 恰好一次 live `proceed()`；非 live 调用与 runtime error 均为 0。</li><li>**E17：** K-1 副本 selfcheck harness-valid（135），appearance 的 a1–a4 为 fixed-pass（123），F1 签名为 0。</li><li>**披露：** 每个单元一次运行，没有诊断迭代与开发探测；Chrome 155（E15/E17 基线为 154，检查序列仍相同）；E16 用 pipe，E15/E17 保留冻结时的 WebSocket，以免改变 runner hash；没有冻结 runner 拒绝运行，未使用副本；按键审计零失配；可信拖动的 drop 落在被拖按钮自身，合同 §6 第 3 项允许，与 D1 裁定一致。</li><li>**总控核对：** 父提交 `dac8cd3`；26 个文件全部新增，分布在 6 个证据目录；25 份日志的 hash 都出现在回执中；各日志的计数、verdict 与 PRECONDITION 由总控抽查。worktree 被本会话进程的锁标记，确认 clean 后解锁删除。</li></ul> |
| E6 Terra 实施 | `f9eb4b1`（产品，父提交 `145b073`）与 `0d440ca`（运行记录，只新增 `web-apprail-order-recovery-terra/` 下 7 个文件）。<ul><li>**产品 diff：** 相对 `419e56d`（排除 `docs/reviews`）恰好 19 个 §11 文件，+2960/−76；`package.json`、`pnpm-lock.yaml` 不变；受保护路径 diff 为空。`Topbar.test.tsx` 删除行为 0（只增加两个 TP-RAIL case）；`App.tsx` 的 −15 行仅为 `&lt;Shell&gt;` 块缩进进 provider，忽略空白的 diff 只有导入、controller 创建、两处登出步骤、依赖数组、provider 与 `railOrderStatus`。</li><li>**结构：** 4 个 internal 模块（纯模型、controller、EN/ZH 文案、状态组件）；App 级唯一 controller 在 `AppInner`；AppRail 有 provider 时用共享 controller，否则自建；预览只在内存，`.rail-items` 内 drop 时写一次，无 drop 的 dragend 取消并恢复；登出两个分支中 rail 步骤都在 Appearance 之前。</li><li>**自检（E6）：** shell 12 文件 205 项、`@repo/web` 30 文件 196 项（原 29/178，新增 `App.railorder` 18 项），typecheck 与 lint 无问题；6 份日志 hash 与 `implementation.md` 一致（总控复算）。</li><li>**预检（不计证据，日志已删除并披露）：** Sol 八个模式全部通过（`original` 123 = 121 + 两个新增 TP-RAIL case），C-RD1 15/15，父级 host 31/31，rail F1 selfcheck harness-valid、railorder fixed-pass，PRECONDITION 均为 0；临时提交 `4417e84` 在 dragenter 时就重排预览，导致 rail F1 selfcheck harness-invalid，已改正并在最终提交上全部重跑。</li><li>**总控裁定：**<ol><li>**D1（§6 第 2 项）：** 采纳"dragenter 只接受（`preventDefault`），紧随的 dragover 移动预览"的读法。§6 第 2 项把 `dragenter`/`dragover` 作为一对：两者都 `preventDefault`，指针在 Y 上时预览为 P，零存储尝试，这些都成立；而在 dragenter 时就重排，会使拖动按钮先占住目标位置，让冻结的可信拖动前置条件（`verify-f1-railorder.mjs:632–634`、`verify-native-before.mjs:697`）不可满足，即形成 OE 式矛盾。这是合同与冻结 oracle 都能成立的唯一读法，不修订合同；由 E7 drag、E9 native 与最终 acceptance 复核。</li><li>**D2：** `__tests__/railOrderFixture.tsx` 属于 §11 第 8 项允许的 `src/__tests__/` 新文件（仿照锁 fixture 模式），接受。</li><li>**D3–D6：** 移除未知 id 的 DEV 警告（§2 允许）；Retry 等待中用 `aria-disabled` 保持可聚焦（同 Appearance 先例）；Discard 回到 source 异常时焦点移到状态按钮；767px 及以下面板 fixed 于 Topbar 下方。均接受，由 E13–E14 与最终 acceptance 复核。</li><li>Terra 只做了静态 CSS 探测，没有产生 E9–E14；这些由后续独立批次产生。</li></ol></li><li>**总控核对：** 父提交与 worktree clean；`git diff` 文件清单、受保护路径、Topbar 测试删除行数、`App.tsx` 忽略空白 diff 与 AppRail 拖动代码均由总控直接查看；日志 hash 复算一致。worktree 分支删除时指向其创建基点 `9a61669`（已是 HEAD 的祖先），执行者在 detached HEAD 上提交，无内容丢失。</li></ul> |
| E4–E5 native before 与 rail F1 before | `04ee6a2`（独立父级 native 验证者；66 个新增文件，含 51 张截图）。<ul><li>Chrome 155.0.8059.39 headless（pipe transport；此前批次为 154，版本变化已记录）；archive 与 lockfile gate 四处一致；625 个 archive 模块，守卫违规为 0；只有 auth session 为合成；每个模式一次 before1 运行。</li><li>**E4：** H1 7 个值 × EN/ZH 共 14 次全部成立，`/app/tasks`、Appearance、dashboard、calendar 都显示 "Route Error (app): prefOrder is not iterable"，页面没有任何可操作控件，字节不被改写；H2 4/4 静默失败；H3 dragover 期间写两次、drop 不写；H4 取消与拖出都被持久化；H5 经真实 Features pane 端到端成立，重新开启的 Boards 排到最后；H6 持锁期间仍写入，产品从不请求锁；H8 重复模块渲染两次；H9 没有状态、没有 `beforeunload`、登出零确认；H11 与 P6 正向对照通过。按键审计零失配，不带 `nativeVirtualKeyCode`。</li><li>**E5：** selfcheck harness-valid（165/165）；railorder 为 before-correct（f1 `before-no-rail-step`、f2 `before-unprotected`、f3 `before-pass-control`）；F1 签名为 0；冻结 prelude 只读复用并校验 hash。</li><li>**开发探测（已披露）：** 补一次静止指针 dragOver 让 drop 到达 rail；修脚本顺序错误；修正登出时 scope 转换次数的 oracle 误判。没有削弱断言。</li><li>**总控裁定：** 合同 §12 "一次 live `proceed()` … 一次 router 提交" 按 Appearance 裁定 4 的读法执行：离页恰好释放一次，POP 时为 live `proceed()`，程序化导航时为一次 `navigate` 重放，登出不产生 router 提交；非 live 调用为 0。E16/E17 验证者同样适用。`/app/tasks` 挂载时的 Tasks 保存失败横幅是既有的无关观察（同批次 39 裁定 5）。</li><li>**总控核对：** 66 个文件均为新增，且在两个允许目录内；两份回执列全了 hash；8 份日志都是 harnessValid，selfcheck 通过，railorder 为 before-correct；总控亲自查看了重新开启 Boards 后的截图（Boards 图标排在 rail 最后）与 ZH H1 截图（整页只剩路由错误），均与日志一致。</li></ul> |
| E3 父级 host before 基线 | `6e9ec9c`（独立父级 host 验证者；`web-apprail-order-recovery-independent/` 下 5 个新增文件）。<ul><li>生产 `App` composition，只替换 auth session；archive、lockfile gate 与 13 个源文件 hash 一致；40 个必需模块全部来自 archive；一次运行，无开发探测，也无参考实现。</li><li>结果：31 个 case，7 PASS（3 个 fixture 检查、clean 正向对照等），24 FAIL，PRECONDITION 为 0，失败全部是业务断言。</li><li>H2：写入被拒后 rail 回到存储顺序，没有状态。H9：路由不被持有（正确），但没有 rail 状态；只有 rail 草稿时 `beforeunload` 不警告；没有 Appearance 草稿时登出不提示直接完成，有时只出现 Appearance 的提示。H1：`{}` 与 `1` 在两个路由与重载后都显示 "Route Error (app): prefOrder is not iterable"，没有 Topbar 与 rail。</li><li>**总控核对：** 5 个文件均为新增，README 列全了 hash；日志 24 失败 / 7 通过，PRECONDITION 为 0，lockfile 与 resolved SHA 已复核。</li></ul> |
| E1–E2 Sol before oracle | `d6ea500`（独立 Sol；`web-apprail-order-recovery-sol/` 下 32 个新增文件）。<ul><li>权威日志：bytes 21/26、domain 1/31、merge 4/21、drag 8/18、field 1/24、continuity-export 4/22、host 7/33、original 121/121（76+45）；PRECONDITION 为 0，失败全部是业务断言；F-B002 自检通过。</li><li>H1–H10 全部成立；H11 是正向对照并通过。H1：`{}` 或 `1` 让 `/app` 显示 "Route Error (app): prefOrder is not iterable"，另一 document 写入也会让运行中的 App 崩溃；H3：dragover 期间写两次、drop 时不写；H4：取消的预览被持久化；H5：重新开启 Boards 后排到最后；H9：登出没有 rail 提示。</li><li>C-RD1：Features `downstream` 在 `419e56d` 上冻结原件 14/15（F-FD1）、C-FD1 15/15、C-RD1 15/15；C-RD1 相对 C-FD1 只加一行 `fireEvent.drop`，相对冻结原件三行；staging runner 副本只改被 stage 的文件、hash 与日志路径。</li><li>迭代：before2 只为 5 个模式加观察行，结果与 before1 逐 case 相同。</li><li>**披露与裁定：** 执行者在 scratch 中写了一个按合同实现的临时参考实现，用来检验 oracle 自身（7 个模式全过），又用注入 6 个缺陷的版本证明 oracle 能抓住缺陷；均未提交。由此修正了一个会在 dragenter 与 dragover 双触发时振荡的驱动缺陷。总控认可：这是冻结前的 oracle 自检，不构成产品实现，也不作为 fixed 产品的证据；Terra 仍须独立实现。</li><li>**总控核对：** 32 个文件均为新增，且在允许目录内；README 列全了 hash；8 份权威日志的计数与 PRECONDITION 由总控复核；H1 的错误文本与 C-RD1 的 diff 已抽查。</li></ul> |
| 合同 | `f7726d7`：`docs/reviews/web-apprail-order-recovery-contract/contract.md` r1（921 行，SHA-256 `b9e407b3…`），作者为独立 Astra。<ul><li>结构沿用 Appearance r3；R-1 记为产品负责人决定。</li><li>假设 A1–A11：下标槽合并、App 级 rail controller、注册 async 绑定、严格值域只拒绝不修复、Topbar 并列状态槽与登出步骤、每次 drop 只写一次、反馈与导出面、测试处置、R-PET、预先登记的纠正副本 C-RD1。</li><li>H1–H11；9 个 gate；E1–E25 连续；Terra 记录目录 `web-apprail-order-recovery-terra/`。</li><li>跨 caller 影响：没有已接受 oracle 断言剪除被关闭模块，故 R-1 不需纠正副本；A7 使 Features `downstream` case 014 的拖动缺少 drop，须以 C-RD1 判定。</li></ul> |
| 过程披露 | 起草窗口在提交后、交回前卡住（看门狗）；总控只读核实提交与 worktree clean 后直接接收。接收步骤曾被权限分类器拒绝一次，用户确认并授权后执行 |
| 总控确认（2026-10-09，用户已确认） | <ol><li>R-1 读作存储顺序中的下标。</li><li>未知与非 rail id 同样保留，不剪除。</li><li>source 异常显示 Topbar 状态（rail 无 pane）。</li><li>取消拖动恢复原顺序，是"每次 drop 只写一次"的结果，须披露。</li><li>登出时两个提示依次出现，rail 在前；不改已接受的 Appearance controller。</li><li>controller 由 App 创建。</li><li>C-RD1 预先登记，条件：最终回归须独立证明冻结原件只在预测签名上失败，纠正副本在 before 与 fixed 都通过。</li><li>Smart Lists、Collaborate、Pomodoro、Dashboard Header 的 host 套件纳入回归。</li></ol> |
| 风险等级 | `high`：H-RAIL 可能让所有 `/app` 路由崩溃；改动 shell 与 `App.tsx`（Appearance 刚改过的表面），须做受影响 caller 重跑 |
| 后续顺序 | ~~批次 56 Sol（E1–E2，含 C-RD1）~~（`d6ea500`）→ ~~批次 57 父级 host（E3）~~（`6e9ec9c`）→ ~~批次 58 native before 与 rail F1（E4–E5）~~（`04ee6a2`）→ ~~批次 59 Terra~~（`f9eb4b1`、`0d440ca`）→ ~~批次 60 fixed 重跑（E7、E8、E15、E16、E17）~~（`94b12ba`）→ ~~批次 61 native（E9–E11）~~（`ae7b69e`）→ ~~批次 62 native E12 与视觉 E13~~（`55cf1e9`）→ ~~批次 63 键盘 E14~~（`5c6bcd2`）→ ~~批次 64 最终回归 E18–E25~~（`ee60b48`）→ 批次 65 独立最终 acceptance → 视觉键盘 → 最终回归 → 独立最终 acceptance |


### 产品负责人决定登记（2026-10-06）

依据批次 54 的选择备忘录 `selection-419e56d.md` §7，用户在四项决定中都选了推荐选项。这些决定在对应 caller 被接受时写入台账。

| 编号 | 台账条目 | 问题 | 用户决定 | 影响的候选 |
| --- | --- | --- | --- | --- |
| R-1 | SET-03（决策类） | 用 Features 关闭模块后再拖动 rail，被关闭模块的存储位置是否保留 | **保留**：拖动只调整可见模块的顺序，被关闭模块保留原位置，重新开启后回到原位 | AppRail 顺序 |
| W-1 | DASH-03 | 世界时钟列表能否清空 | **允许清空**，并显示空状态与添加入口 | World Clocks |
| C-1 | SET-10 | 没有 client ID 时如何处理"连接" | **禁用并标为预览**：已开启的保留"断开"，不声称同步数据，与台账原文一致 | Integrations |
| F-2 | SET-08、CAL-01 | 周起始日的两个设置如何统一 | **由 Date & Time 统一驱动**：日历与统计跟随，日历的控件改为它的一个视图 | Calendar |

另有两项待到对应候选时再问：P-1（SHELL-05，宠物的隐藏状态与位置持久化）与 D-2（SET-15，AI 的 Test Connection），后者另有 D2 共享层前置。

### 批次 54 回执与排程

| 字段 | 当前值 |
| --- | --- |
| 选择备忘录与时钟合同 | `2c35fee`（独立 Astra）。<ul><li>`selection-419e56d.md`（326 行，`2b6a95c2…`）比较了 8 个候选，推荐 E1 时钟小组件，因为它是唯一不需要用户决定、也不改 D2 的候选。</li><li>`web-dashboard-clock-recovery-contract/contract.md` r1（890 行，`21624ff5…`）：E1–E25、H1–H10、host 行 a–p，并写入了全部经验。</li></ul> |
| 总控核对 | <ul><li>只新增 2 个文件。</li><li>关键源码事实已在 `419e56d` 抽查属实：`ClockWidget.tsx:265、286、309` 是写入点；`DashboardModule.tsx:158` 把唯一的离页 guard 交给 Header；`AppRail.tsx:46` 对 `prefOrder` 做 `for…of`，非数组的存储值可能抛错（H-RAIL，静态假设）。</li><li>REL-05 原文针对存储失败时保留草稿，不涉及主动移除小组件。因此 E1-7（移除小组件时丢弃其草稿、零写入）判为总控可定，合同中须披露，最终 acceptance 可复核。</li></ul> |
| 排程裁定 | 按产品风险优先。<ul><li>AppRail 顺序（E-R）：H-RAIL 若属实，一个畸形字节就会让所有 `/app` 路由不可用，且无法从 UI 修复；另有拖动失败时静默无效、每次 `dragover` 都写入的问题。R-1 已决定，故 E-R 先做。</li><li>CP-CLOCK-01 的合同 r1 保留待用，在 AppRail 之后由总控确认与登记；它不依赖 AppRail。</li></ul> |

- CP-APPEARANCE-01 已于 `a560863` 接受（见上）。进行中阶段的完整记录保留在本文件的 `8c88dd2` 版本：`git show 8c88dd2:docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`。
- CP-FEATURES-01 已于 `ec55f9e` 接受。进行中记录见本文件的 `78e8de2` 版本。

**最新库存：** `refresh-419e56d.md` / `bindings-419e56d.json`（CP-LUNA-03，`832f6ab`）。相对 `5cd63ff` 只移除 `AppearancePane.tsx` 第 52、53、55 行（`xai_accent_hue`、`xai_rail_pos`、`xai_bg_tone`，只读）；余下 48 行逐字段不变。
- **剩余规模：** 23 个文件、48 个直接绑定、27 个字面量键、1 个动态位点、31 个 setter 绑定（28 个直接、3 个仅下游）、17 个只读绑定。
- **按包分布：**
  - dashboard-widgets 11、settings-rest 10、board-workspaces 8、statistics 4；
  - board-views、calendar 各 3；
  - board-core、pet 各 2；
  - pomodoro、dashboard-grid、features-panel、shell、tasks 各 1。
- **扫描边界：**
  - 只扫描 `packages/**/*.tsx`（不含 `__tests__`）中直接以 `usePref` 为标识符的调用；
  - `.ts` 文件（如 `useFeaturePrefs.ts`）、`apps/`、CmdK 的 `getPref` 读取，以及 `usePrefAutosaveAsync` 都不可见；
  - 例如 `App.tsx` 在 `5cd63ff` 有三处 `usePref`，在 `419e56d` 已没有，但两份库存都看不到。
- 这些是排程输入，不是完整 writer 数，也不是缺陷数。

按 [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md)，Sticky5 是排程中最后一个"剩余普通 Settings 控件"caller。后续 caller 属于该文件"Follow-on caller grouping"中尚待分别规定的组，依次为：

第 1 组中的 feature toggles 已由 CP-FEATURES-01 完成（`ec55f9e`）；Appearance 仍待选择。

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

### CP-LUNA-02 · 直接 usePref 库存刷新（批次 33）

| 字段 | 当前值 |
| --- | --- |
| 状态 | `accepted`（总控核对通过，作为库存证据，不涉及产品范围）：`a83d53a`。<ul><li>新增 `bindings-5cd63ff.json`（`694a9396…`）与 `refresh-5cd63ff.md`（`896c2143…`）。</li><li>按 file+key+setter 对账：移除 1 行、新增 0 行、变化 0 行；8 项计数与总控预测完全一致。</li><li>总控另行比对两份 JSON，结果相同。</li><li>`typescript` 经祖先目录从主检出的 `node_modules` 只读解析，版本 5.9.2 与 lockfile 一致；主检出未写入。总控认可这种只读依赖使用。</li></ul> |
| 执行者 | 新的独立 Claude Sonnet 5.5（Luna 角色映射），隔离 worktree |
| 风险 | 低：只读 git 中的固定修订并运行既有扫描器；不触及产品、持久化、宿主或验收 |
| 固定点 | 产品 `5cd63ff`；对照 `f359be6` 的 `bindings-f359be6.json` 与 `refresh-f359be6.md` |
| 命令 | `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs 5cd63ff`。扫描器从 git 读源码，需要能解析 `typescript`；可沿用 CP-LUNA-01 先例，在 worktree 内执行 `pnpm install --frozen-lockfile --offline`，但不得写入主检出 |
| 允许新增文件 | `docs/reviews/web-d2-pref-binding-inventory/bindings-5cd63ff.json`（扫描器输出）与 `refresh-5cd63ff.md` |
| 验收条件 | <ul><li>计数与相对 `f359be6` 的逐行 delta 精确对账。产品 delta 只在 features 包内，预期只移除 `FeaturesPane.tsx:69` 一行（`prefKey`，动态，setter `setOn`）；受保护读者 `withDisabledFallback.tsx:43` 保留。任何其他增减都须逐行列出，并说明来源提交。</li><li>总控预测的计数：files 24、bindings 51、literalKeys 30、dynamicSites 1、setterBindings 31、directlyInvokedSetters 28、downstreamOnly 3、readOnlyBindings 20。这只是待验证的预测，不是目标；不一致须逐项解释。</li><li>沿用既有边界声明：只统计直接 legacy `usePref` 绑定，不是完整 writer 数，也不是缺陷数。</li><li>不作排程、风险或缺陷判断。</li></ul> |
| 禁止 | 修改任何已有文件、产品、台账或控制面；push、merge、建分支；派生子 agent |
| 停止条件 | 扫描器无法运行或 delta 无法解释时，提交说明后停止 |

### CP-LUNA-03 · 直接 usePref 库存刷新（批次 53）

| 字段 | 当前值 |
| --- | --- |
| 状态 | `accepted`（总控核对通过，作为库存证据，不涉及产品范围）：`832f6ab`。<ul><li>新增 `bindings-419e56d.json`（`cd5c3490…`）与 `refresh-419e56d.md`（`c97ccbfd…`）。</li><li>按 file+key+setter 对账：移除 3 行，新增 0 行，变化 0 行；8 项计数与总控预测完全一致。总控另行比对两份 JSON，结果相同。</li><li>新增的 3 个 Appearance internal `.tsx` 与 shell 的改动没有产生新行；controller 经 `usePrefAutosaveAsync` 绑定，扫描器不计入。</li><li>任务卡中"4 个新增 internal `.tsx`"有误：第 4 个是 `appearanceRecoveryCopy.ts`，不在扫描范围内。执行者已在回执中如实记录。</li></ul> |
| 执行者 | 新的独立 Claude Sonnet 5.5（Luna 角色映射），隔离 worktree |
| 风险 | 低：只读 git 中的固定修订，并运行既有扫描器 |
| 固定点 | 产品 `419e56d`；对照 `5cd63ff` 的 `bindings-5cd63ff.json` 与 `refresh-5cd63ff.md` |
| 命令 | `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs 419e56d`。`typescript` 可从主检出只读解析（CP-LUNA-02 先例）；不得写入主检出 |
| 允许新增文件 | `bindings-419e56d.json` 与 `refresh-419e56d.md` |
| 验收条件 | <ul><li>逐行 delta 精确对账。预期只移除 `AppearancePane.tsx` 第 52、53、55 行，即 `xai_accent_hue`、`xai_rail_pos`、`xai_bg_tone` 三个只读绑定。</li><li>总控预测的计数：files 23、bindings 48、literalKeys 27、dynamicSites 1、setterBindings 31、directlyInvokedSetters 28、downstreamOnly 3、readOnlyBindings 17。这是待验证的预测，不是目标。</li><li>新增的 4 个 Appearance internal `.tsx` 与 shell 的改动若产生新行，须逐行解释。</li><li>沿用边界声明：只扫描 `packages/**/*.tsx`，不是完整 writer 数，也不是缺陷数。</li><li>不作排程、风险或缺陷判断。</li></ul> |
| 禁止 | 修改任何已有文件、产品、台账或控制面；push、merge、建分支；派生子 agent |
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
| Features（续 10） | `78e8de2` 登记批次 32 · `ec55f9e` Features acceptance |
| Features 关闭 | `6ec0bec` 台账 |
| Features 关闭（续） | `e348b79` CP-FEATURES-01 改为 `accepted`，登记批次 33 · `a83d53a` 库存刷新（CP-LUNA-02） |
| 下一项选择（续 2） | `ead985d` 登记批次 34 · `e9fbdb7` 选择备忘录与 Appearance 合同 |
| 下一项选择（续 3） | `a4aff57` 登记 CP-APPEARANCE-01（等待用户决定 B-2） |
| 下一项选择（续 4） | `2f728f1` 记录 B-2 决定，登记批次 35 · `b2e5eb2` 合同 r2 |
| 下一项选择（续 5） | `51db323` 登记批次 36 · `706c9a3` 合同 r3 |
| Appearance | `2b9f81d` 确认 r3，登记批次 37 · `bd09456` Sol before oracle（E1–E2） |
| Appearance（续） | `95d6234` 登记批次 38 · `b997235` 父级 host before 基线（E3） |
| Appearance（续 2） | `963036b` 登记批次 39 · `72538d1` native 与 F1 before（E4–E5） |
| Appearance（续 3） | `94f8cf8` 授权批次 40 · `24073b5` Terra 实施 · `4874170` Terra 运行记录 |
| Appearance（续 4） | `3552631` 登记批次 41 · `26cfce8` OE-1/OE-2 判定与纠正副本 |
| Appearance（续 5） | `662de52` 登记批次 42 · `31d6335` E7、E8、E16、E17 |
| Appearance（续 6） | `f8cbcbb` 登记批次 43 · `3419542` native E9–E11 |
| Appearance（续 7） | `bc1f5f4` 登记批次 44 · `6b9f0ee` K-1 评估 |
| Appearance（续 8） | `ce9b68b` 登记批次 45 · `32e6753` native E12、E13、E26 |
| Appearance（续 9） | `9b3b520` 登记批次 46 · `5307b6f` E15 FAIL（F-APP-1 冻结） |
| Appearance（续 10） | `9b76076` 登记批次 47 · `5bbf473` F-APP-1 修复 · `0d34bf2` 运行记录 |
| Appearance（续 11） | `aa326b4` 登记批次 48 · `bacdbbc` E15 FAIL（F-APP-2 冻结） |
| Appearance（续 12） | `6fedfd1` 登记批次 49 · `419e56d` F-APP-2 修复 · `5766c1e` 运行记录与审计 |
| Appearance（续 13） | `2302b47` 登记批次 50 · `2696855` E14–E15 PASS |
| Appearance（续 14） | `68686c5` 登记批次 51 · `c6d1ed4` 最终回归 |
| Appearance 关闭 | `8c88dd2` 登记批次 52 · `a560863` Appearance acceptance · `0a46577` 台账 |
| 下一项选择（续 6） | `0daab01` CP-APPEARANCE-01 改为 `accepted`，登记批次 53 · `832f6ab` 库存刷新（CP-LUNA-03） |
| 下一项选择（续 7） | `b4e190e` 登记批次 54 · `2c35fee` 选择备忘录与时钟合同 r1 |
| AppRail | `eabd47f` 登记批次 55 · `f7726d7` AppRail 合同 r1 |
| AppRail（续） | `1094d96` 登记批次 56 · `d6ea500` Sol before oracle |
| AppRail（续 2） | `995060c` 登记批次 57 · `6e9ec9c` 父级 host 基线 |
| AppRail（续 3） | `d961694` 登记批次 58 · `04ee6a2` native 与 F1 before |
| AppRail（续 4） | `145b073` 授权批次 59 · `f9eb4b1` Terra 实施 · `0d440ca` 运行记录 |
| AppRail（续 5） | `dac8cd3` 接收 Terra，登记批次 60 · `94b12ba` fixed 重跑 E7、E8、E15、E16、E17 |
| AppRail（续 6） | `2b8f877` 登记批次 61 · `ae7b69e` native E9–E11 |
| AppRail（续 7） | `6fad75d` 登记批次 62 · `55cf1e9` native E12–E13 |
| AppRail（续 8） | `641ca45` 登记批次 63 · `5c6bcd2` 键盘 E14 |
| AppRail（续 9） | `9aeec39` 登记批次 64 · `ee60b48` 最终回归 E18–E25 |
| 本提交 | 记录最终回归与副本裁定，记录成本周期 20，登记批次 65（独立最终 acceptance） |

## 台账变化

- 无编号状态变化；13/312 完成、299 未关闭保持不变。
- Sticky 接受链已在 `4da6e71` 写入：只追加 REL-05 证据与检查点文字，SET-12 保持待处理，并保留"caller accepted ≠ 业务/发布完成"。
- Features 接受链已在 `6ec0bec` 写入：
  - REL-05 追加 27 条证据，含 More 的 F-B002 证据；
  - UX-03 与 SHELL-05 各追加 4 条宠物遮挡缺陷证据，不是完成证据；
  - 补充检查点文字；
  - SET-03、REL-05、UX-03、SHELL-05 保持未关闭。
- Appearance 接受链已在 `0a46577` 写入：
  - REL-05 追加 41 条证据；
  - SET-02 记录用户的两个决定与接受；
  - SHELL-04 记录修复前崩溃与修复后崩溃安全的证据；
  - UX-05 记录焦点缺陷证据，不是完成证据；
  - 补充检查点文字；
  - 各条目保持未关闭。

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
| 9 | 30–32 | 最终回归（冻结 F-B002）、F-B002 纠正 oracle 证据、独立最终 acceptance；各一次完成 |
| 10 | 33–35 | 库存刷新、下一项选择与 Appearance 合同、合同 r2；各一次完成。用户的两个产品决定各带来一次合同修订（r2、r3，r3 为批次 36） |
| 11 | 36–38 | 合同 r3、Sol before oracle、父级 host 基线。后两批各用满 3/3 诊断迭代：Sol 是逐轮补用例与修 harness 假失败；host 前两轮 App 渲染为空树 |
| 12 | 39–41 | native 与 F1 before、Terra 实施、OE-1/OE-2 判定；各一次完成。OE 是 oracle 缺陷，不是产品失败 |
| 13 | 42–44 | fixed 重跑 E7/E8/E16/E17、native E9–E11、K-1 评估；各一次完成。K-1 是证据完整性评估，没有结论改变 |
| 14 | 45–47 | native E12/E13/E26；E14–E15 FAIL，发现 F-APP-1；Terra 修复 F-APP-1 |
| 15 | 48–50 | E14–E15 FAIL，发现 F-APP-2；Terra 修复 F-APP-2 并做同类审计，期间卡住一次，经 SendMessage 恢复；E14–E15 PASS。同类问题连续两次后改为先做全面审计 |
| 16 | 51–52 | 最终回归（含 F-FD1 裁定）与独立最终 acceptance；各一次完成 |
| 17 | 53–55 | 库存刷新、选择备忘录与时钟合同、AppRail 合同；各一次完成。四项用户决定一次问完；AppRail 合同窗口提交后卡住，总控核实后直接接收；接收步骤被权限分类器拒绝一次，经用户授权后执行 |
| 18 | 56–58 | Sol before oracle（before2 只为 5 个模式加观察行；scratch 参考实现作 oracle 自检，未提交）、父级 host 基线、native 与 rail F1 before；各一次完成 |
| 19 | 59–61 | Terra 实施（一次临时提交因 dragenter 重排导致 rail F1 自检无效，执行者自行改正并在最终提交上全部重跑）、fixed 重跑、native E9–E11；各一次正式运行完成，native 有已披露的开发探测 |
| 20 | 62–64 | native E12–E13、键盘 E14、最终回归；各一次正式运行完成。新发现 F-E14-1 裁定为非阻断；host 套件 runner 因 archive 增长出现 `ENOBUFS`，经只改缓冲的副本完成（2/3 诊断迭代） |

- **主要额外成本：**
  - F1：必要的共享缺陷修复，以及受影响 caller 的重跑；
  - G1：总控排程遗漏，导致一次补证与复审；
  - F-B002：已接受的 More oracle 不确定，增加一个证据批次（批次 31）。
- **改进：**
  - 登记最终回归时，须核对合同中全部 Required evidence 条目，不只 Final regression 行；
  - 实施批次须给执行者预留测试运行的记录位置；
  - 含 More 的回归须同时运行纠正 oracle（C-FB002）；
  - 总控脚本须先完成全部读取与校验，再写文件。本批出过一次事故：脚本先以写模式截断了 `ALL-TODO-CURRENT.md`，随后报错；已从 HEAD 恢复，未进入任何提交。

## 本轮唯一任务

批次 65：独立最终 acceptance（Astra 角色，新 reviewer）对 CP-APPRAIL-01 作出 ACCEPTED、BLOCKED 或 FAIL 的结论。

- **执行者：** 新的独立 Claude Opus 5.5。它不是合同作者，不是 Terra，也不是本 caller 任何一批的执行者。
- **固定点：**
  - fixed `f9eb4b1`，before `419e56d`；
  - 合同 r1（`f7726d7`，SHA-256 `b9e407b3…`）；
  - 控制分支基点为本提交。
- **必须做到（合同 §14 Acceptance condition 与 §15 Rules）：**
  - 9 个 gate 逐行对账四类事实：源码、正确的 before 失败、fixed 的独立行为、实际用户界面；
  - E1–E25 每项引用路径与 SHA-256，并自行重算每项至少一个 hash；任何 ID 缺失即 BLOCKED；
  - 阅读 fixed 产品源码（19 个 §11 文件），独立判断是否满足 §5–§10 与 A1–A11；
  - 核实产品负责人决定 R-1（保留被关闭模块的存储位置）的实现与端到端证据；
  - 核对 §14 列出的"不得以此关闭"各项都不成立。
- **须明确确认或推翻的事项：**
  1. 合同 r1 与总控确认的 8 项（经用户确认）；
  2. release-once 读法（E4/E5/E16/E17）：POP 时一次 live `proceed()`，程序化导航时一次 `navigate` 重放，登出不产生 router 提交；
  3. Sol 冻结前的 scratch 参考实现只作 oracle 自检，不构成产品实现或 fixed 证据；
  4. D1：dragenter 只接受、紧随的 dragover 移动预览，以及 native D1 观察（78 次可信拖动）；
  5. D2–D6（测试辅助文件、移除 DEV 警告、Retry 的 `aria-disabled`、Discard 回到 source 时的焦点、窄宽度面板 fixed 定位）；
  6. 行 r"放到文本输入框"按未在 rail 内 drop 的 dragend（取消）判定；协调器分支用合成 coordinator；
  7. E13 的偏差：窄宽度宠物、以 `419e56d` 为 clean 布局基准、像素比较的宠物遮罩；
  8. F-E14-1（375 下打开的面板几乎遮住后续获得焦点的侧栏行）为符合合同的非阻断 UX-05 后续项；搜索框观察；
  9. E14 的偏差：walk 路由、面板打开 walk 的起点、premium 徽章存根、ZH 草稿先在 1440 建立；
  10. E23 host 套件的缓冲副本、E24 副本、保留 WebSocket 传输；
  11. §10 第 9 项 `App.tsx` 与 `localStorage` 的读法；
  12. 判定副本 C-RD1（含总控确认第 7 项的条件）、C-FB002、OE，以及 C-FD1 的预测结果；
  13. clean 状态 chrome 不变成立，因此其他 caller 的视觉与键盘证据不需重跑；
  14. 开发探测不计入迭代上限，以及 Chrome 154→155 的版本变化；
  15. 既有且不归本 caller 的观察：768 顶部 rail 溢出、414 底栏按钮裁剪、Tasks 页保存失败横幅。
- **输出：** 只新增 `docs/reviews/web-apprail-order-recovery-acceptance/` 下的文件：ACCEPTED 写 `acceptance-f9eb4b1.md`，BLOCKED 写 `blocked-f9eb4b1.md`；可附 hash 与核对脚本及其日志。提交一次，不 push。
- **结论范围：**
  - caller 接受只覆盖 AppRail 顺序 recovery caller；
  - 不关闭 SET-03、SHELL-04、SHELL-05、UX-03、UX-05、REL-05、REL-07、REL-09 或任何其他 312 编号；
  - 不代表业务或发布完成；
  - 不授权部署、发布、分支提升或 Web→Desktop 同步。
- **禁止：** 修改产品、合同、已有证据、台账或控制面；修复；push；派生子 agent；在主检出启动 dev server 或写入主检出。
- **成本上限：** 不重跑完整矩阵；只在核对确有需要时做针对性的只读复核或单次重跑，输出写入 acceptance 目录。
- **停止条件：** 发现真实产品失败时，冻结复现、影响范围与正确 oracle，写 BLOCKED 或 FAIL 回执后停止。

## 下一步

1. 等待批次 65 回执，总控核对：
   - 只新增文件；
   - 逐 gate 的四类事实对账；
   - E1–E25 的 hash 抽查；
   - 对 15 个事项的明确结论。
2. 若 ACCEPTED：
   - CP-APPRAIL-01 改为 `accepted`；
   - 另起一批做台账对账：REL-05 追加证据；SET-03 记录 R-1 决定与接受；SHELL-04 记录 H-RAIL 崩溃前后证据；UX-05 追加 F-E14-1 与搜索框观察；不改状态；
   - 然后刷新库存，确认并登记 CP-CLOCK-01。
3. 若 BLOCKED：按回执列出的缺口另开补证或修复窗口。
