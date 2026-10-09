# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-09

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`419e56de9f23e4467fea806fbd4a990e1f429941`（Appearance caller，含 F-APP-1 与 F-APP-2 修复；相对 `24073b5` 只多出 `styles.css` 的两段追加与两个守卫测试；相对 `5cd63ff` 共 26 个文件，全部在合同 r3 §11 内）

模块归属：`web`

本轮模式：AppRail 的父级 host before 基线（E3）已在 `419e56d` 冻结（`6e9ec9c`），H1、H2、H9 在 host 层全部成立。本批登记批次 58：native before 与 rail F1 形态 before（E4–E5）。当前 Claude 总控窗口不实施产品或 verifier 修复，也不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `6e9ec9c` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。本会话创建的所有隔离 worktree 与临时本地分支均已在快进接收后清理。
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
| 状态 | `diagnosis_needed`：合同 r1 已确认；E1–E3 已冻结（`d6ea500`、`6e9ec9c`），E4–E5 未冻结；未授权实施 |
| E3 父级 host before 基线 | `6e9ec9c`（独立父级 host 验证者；`web-apprail-order-recovery-independent/` 下 5 个新增文件）。<ul><li>生产 `App` composition，只替换 auth session；archive、lockfile gate 与 13 个源文件 hash 一致；40 个必需模块全部来自 archive；一次运行，无开发探测，也无参考实现。</li><li>结果：31 个 case，7 PASS（3 个 fixture 检查、clean 正向对照等），24 FAIL，PRECONDITION 为 0，失败全部是业务断言。</li><li>H2：写入被拒后 rail 回到存储顺序，没有状态。H9：路由不被持有（正确），但没有 rail 状态；只有 rail 草稿时 `beforeunload` 不警告；没有 Appearance 草稿时登出不提示直接完成，有时只出现 Appearance 的提示。H1：`{}` 与 `1` 在两个路由与重载后都显示 "Route Error (app): prefOrder is not iterable"，没有 Topbar 与 rail。</li><li>**总控核对：** 5 个文件均为新增，README 列全了 hash；日志 24 失败 / 7 通过，PRECONDITION 为 0，lockfile 与 resolved SHA 已复核。</li></ul> |
| E1–E2 Sol before oracle | `d6ea500`（独立 Sol；`web-apprail-order-recovery-sol/` 下 32 个新增文件）。<ul><li>权威日志：bytes 21/26、domain 1/31、merge 4/21、drag 8/18、field 1/24、continuity-export 4/22、host 7/33、original 121/121（76+45）；PRECONDITION 为 0，失败全部是业务断言；F-B002 自检通过。</li><li>H1–H10 全部成立；H11 是正向对照并通过。H1：`{}` 或 `1` 让 `/app` 显示 "Route Error (app): prefOrder is not iterable"，另一 document 写入也会让运行中的 App 崩溃；H3：dragover 期间写两次、drop 时不写；H4：取消的预览被持久化；H5：重新开启 Boards 后排到最后；H9：登出没有 rail 提示。</li><li>C-RD1：Features `downstream` 在 `419e56d` 上冻结原件 14/15（F-FD1）、C-FD1 15/15、C-RD1 15/15；C-RD1 相对 C-FD1 只加一行 `fireEvent.drop`，相对冻结原件三行；staging runner 副本只改被 stage 的文件、hash 与日志路径。</li><li>迭代：before2 只为 5 个模式加观察行，结果与 before1 逐 case 相同。</li><li>**披露与裁定：** 执行者在 scratch 中写了一个按合同实现的临时参考实现，用来检验 oracle 自身（7 个模式全过），又用注入 6 个缺陷的版本证明 oracle 能抓住缺陷；均未提交。由此修正了一个会在 dragenter 与 dragover 双触发时振荡的驱动缺陷。总控认可：这是冻结前的 oracle 自检，不构成产品实现，也不作为 fixed 产品的证据；Terra 仍须独立实现。</li><li>**总控核对：** 32 个文件均为新增，且在允许目录内；README 列全了 hash；8 份权威日志的计数与 PRECONDITION 由总控复核；H1 的错误文本与 C-RD1 的 diff 已抽查。</li></ul> |
| 合同 | `f7726d7`：`docs/reviews/web-apprail-order-recovery-contract/contract.md` r1（921 行，SHA-256 `b9e407b3…`），作者为独立 Astra。<ul><li>结构沿用 Appearance r3；R-1 记为产品负责人决定。</li><li>假设 A1–A11：下标槽合并、App 级 rail controller、注册 async 绑定、严格值域只拒绝不修复、Topbar 并列状态槽与登出步骤、每次 drop 只写一次、反馈与导出面、测试处置、R-PET、预先登记的纠正副本 C-RD1。</li><li>H1–H11；9 个 gate；E1–E25 连续；Terra 记录目录 `web-apprail-order-recovery-terra/`。</li><li>跨 caller 影响：没有已接受 oracle 断言剪除被关闭模块，故 R-1 不需纠正副本；A7 使 Features `downstream` case 014 的拖动缺少 drop，须以 C-RD1 判定。</li></ul> |
| 过程披露 | 起草窗口在提交后、交回前卡住（看门狗）；总控只读核实提交与 worktree clean 后直接接收。接收步骤曾被权限分类器拒绝一次，用户确认并授权后执行 |
| 总控确认（2026-10-09，用户已确认） | <ol><li>R-1 读作存储顺序中的下标。</li><li>未知与非 rail id 同样保留，不剪除。</li><li>source 异常显示 Topbar 状态（rail 无 pane）。</li><li>取消拖动恢复原顺序，是"每次 drop 只写一次"的结果，须披露。</li><li>登出时两个提示依次出现，rail 在前；不改已接受的 Appearance controller。</li><li>controller 由 App 创建。</li><li>C-RD1 预先登记，条件：最终回归须独立证明冻结原件只在预测签名上失败，纠正副本在 before 与 fixed 都通过。</li><li>Smart Lists、Collaborate、Pomodoro、Dashboard Header 的 host 套件纳入回归。</li></ol> |
| 风险等级 | `high`：H-RAIL 可能让所有 `/app` 路由崩溃；改动 shell 与 `App.tsx`（Appearance 刚改过的表面），须做受影响 caller 重跑 |
| 后续顺序 | ~~批次 56 Sol（E1–E2，含 C-RD1）~~（`d6ea500`）→ ~~批次 57 父级 host（E3）~~（`6e9ec9c`）→ 批次 58 native before 与 rail F1（E4–E5）→ Terra → fixed 重跑与 native → 视觉键盘 → 最终回归 → 独立最终 acceptance |


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
| 本提交 | 记录 E3，登记批次 58（native E4–E5） |

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

批次 58：独立父级 native 验证者在真实 Chrome 中，用生产 `App` composition 冻结 AppRail 的 native before 证据（E4），并新建 rail F1 形态 runner 与其 before 日志（E5）。

- **固定点：** before `419e56d`（不可变 archive、lockfile gate、`@repo` 全部来自 archive 并带守卫、记录 requested 与 resolved SHA、拒绝覆盖、保留非零退出码）；headless Chrome 走 pipe transport；按键不带 `nativeVirtualKeyCode` 并做按键审计；只有 auth session 为合成；主检出只读、不在主检出启动 dev server；合同 r1（`f7726d7`）；控制分支基点为本提交。
- **E4（合同 §15）：** 只用可信输入。H1：每个崩溃值，在 `/app/tasks` 与 `/app/settings/appearance` 截取路由错误页；H2；H3；H4；H5 端到端；H6；H8；H9；H11 跨两个 document；按键审计；provenance；需要断言文字时 EN 与 ZH 都跑。拖动用可信指针输入；截图由执行者逐张人工审查。
- **E5：** 新 runner `web-apprail-order-recovery-f1/verify-f1-railorder.mjs` 与 host fixture，只读复用冻结的 F1 prelude 并校验 hash；`selfcheck` 须 harness-valid；`railorder` 模式记录 f1–f3 的正确 before 状态（按合同 §12），不得出现 F1 签名。
- **输出：** 只新增 `docs/reviews/web-apprail-order-recovery-native/**` 与 `docs/reviews/web-apprail-order-recovery-f1/**`：runner、fixture、日志、截图、回执与 hash。
- **禁止：** 修改任何已有文件、产品、合同、台账或控制面；修复；push；派生子 agent。
- **成本上限：** 每个模式诊断迭代不超过 3 轮；开发探测须披露；避免长时间无输出的命令。
- **停止条件：** harness 有效性无法建立、合同与源码矛盾或需越权文件时，提交 blocked 回执并停止。

## 下一步

1. 核对批次 58：只新增文件；provenance 与按键审计；各假设的 native 结论与截图（总控至少抽看两张）；F1 selfcheck 有效、f1–f3 状态正确且无 F1 签名；hash。
2. E1–E5 全部冻结后，登记 Terra 实施批次（限合同 r1 §11 的文件，运行记录写入 `web-apprail-order-recovery-terra/`，禁止在主检出启动 dev server）。
