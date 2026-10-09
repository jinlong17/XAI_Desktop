# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-09

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`419e56de9f23e4467fea806fbd4a990e1f429941`（Appearance caller，含 F-APP-1 与 F-APP-2 修复；相对 `24073b5` 只多出 `styles.css` 的两段追加与两个守卫测试；相对 `5cd63ff` 共 26 个文件，全部在合同 r3 §11 内）

模块归属：`web`

本轮模式：**已暂停并交接给 Codex（2026-10-09）。** CP-CLOCK-01 的 E1–E3 已冻结（`cb7e49b`、`521fd9a`）；批次 70（E4–E5）已登记，但 Claude 启动的执行窗口在完成前被停止，没有提交，须由 Codex 重新执行。当前总控角色由 Codex 接任；总控窗口不实施产品或 verifier 修复，也不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `0ee7ab9` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。本会话创建的所有隔离 worktree 与临时本地分支均已在快进接收后清理。
- 产品基线依次前进：`2023526` → `210abdf`（合同 §11 的 8 个 Sticky 文件）→ `f359be6`（`departureCoordinator.tsx` 与新测试 `departureCoordinator.blocker.test.tsx`）→ `5cd63ff`（Features 合同 §11 的 11 个文件，全部位于 `xai-web-settings-features-panel`）→ `24073b5`（Appearance 合同 r3 §11 的 24 个文件：Appearance 包、shell 的 Topbar/Shell/types 与 Topbar 测试、`App.tsx` 与新 App 测试）→ `5bbf473`（F-APP-1：Appearance `styles.css` 追加 9 行，并新增一个焦点环守卫测试）→ `419e56d`（F-APP-2：`styles.css` 再追加 13 行，并新增一个选中焦点守卫测试）。共享 storage、shell、widgets、其他宿主文件、其他 caller 与 lockfile 均无变化。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` 保全 Sol 原证据提交 `c3ab20d`，不得合并。
- 每次 push 后运行 `pnpm git:sync-check -- --fetch`，最近一次为 failures=0、warnings=1（未请求 deep 扫描）。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。产品改动进入 Desktop 前仍须走 ADR-0013 D3 gate。

## 台账与 Git 的差异

- 正式台账已在 `d91b5e5`（More 与 Notifications 接受链）、`a0df253`（F1）、`4da6e71`（Sticky 接受链，REL-05 证据追加 25 条）、`6ec0bec`（Features 接受链：REL-05 追加 27 条，含 F-B002 证据；UX-03 与 SHELL-05 各追加 4 条宠物遮挡缺陷证据，不是完成证据）、`0a46577`（Appearance 接受链：REL-05 追加 41 条；SET-02 记录用户决定与接受；SHELL-04 记录崩溃前后证据；UX-05 记录焦点缺陷证据）与 `9a3e3aa`（AppRail 接受链：REL-05 追加 26 条；SET-03 记录用户 R-1 决定与接受；SHELL-04 记录 H-RAIL 崩溃前后证据；UX-05 记录 F-E14-1 与搜索框换行的缺陷证据，不是完成证据）核对，均未改条目状态。
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
- **AppRail 顺序（CP-APPRAIL-01）：** `accepted`，固定产品 `f9eb4b1`（before `419e56d`）。
  - **最终接受：** 独立最终 acceptance `efe05ea`（`web-apprail-order-recovery-acceptance/acceptance-f9eb4b1.md`）。
    - 合同 r1 的九个 gate 逐行对账四类事实，全部 PASS；
    - E1–E25 齐全，E25 hash 日志的 456 个 hash 全部重算一致；核对脚本 183/183；对已发布合并逻辑做了 470 个 case 的性质检查，零违例；
    - 15 项裁定全部确认，其中 D1 与 F-E14-1 附限定说明。
  - **范围：** device 键 `xai_rail_order` 一个字段；写入面为 AppRail 拖动，新增 Topbar rail 状态与面板（Retry、Discard、Export、Reload）、关页提醒与登出确认。相对 `419e56d` 共改 19 个合同 r1 §11 文件（`xai-web-shell` 与 `apps/web/src/App.tsx`）。
  - **产品负责人决定（R-1，SET-03）：** 用 Features 关闭模块后拖动 rail，被关闭模块保留存储位置，重新开启后回到原位。
  - **用户可见的修复：**
    - 修复前，存储的 rail 顺序只要不是数组（如 `{}` 或 `1`），所有 `/app` 路由都显示 "Route Error (app): prefOrder is not iterable"，且无法从 UI 修复（H-RAIL）；修复后不崩溃，显示默认顺序与只带 Reload 的 source 状态，字节不被改写。
    - 拖动失败不再静默；`dragover` 期间不写入，每次 drop 只写一次，取消的拖动恢复原顺序；写入经锁保护；重复模块不再渲染两次；有草稿时显示状态、关页提醒，登出时 rail 确认排在 Appearance 之前。
  - **证据链：**
    - 选择与时钟合同 `2c35fee`；用户决定 `eabd47f`；合同 `f7726d7`；
    - before：Sol `d6ea500`、host `6e9ec9c`、native 与 rail F1 `04ee6a2`；
    - Terra `f9eb4b1` 与 `0d440ca`；fixed 重跑 `94b12ba`；native E9–E11 `ae7b69e`；E12–E13 `55cf1e9`；键盘 E14 `5c6bcd2`；
    - 最终回归 `ee60b48`；acceptance `efe05ea`；台账 `9a3e3aa`。
  - **附带裁定（均经 acceptance 确认）：**
    - release-once 读法；
    - D1：dragenter 只接受、紧随的 dragover 移动预览（限定：今后只发单个 `dragEnter` 并期望预览变化的 oracle 属 oracle 错误）；
    - D2–D6；行 r 放到文本输入框按取消判定；
    - C-RD1 为 Features `downstream` 的判定副本，与 C-FB002、C-FD1、OE 一样今后回归须并跑；
    - host 套件缓冲副本（archive 增长导致 `ENOBUFS`）；
    - clean 状态 chrome 不变，其他 caller 视觉与键盘证据不需重跑。
  - **接受范围：** 以下编号均不因此关闭：SET-03（Time Tracker/Bookkeeping/Metrics 的处置与 search/deep-link 一致性仍未核销）、SHELL-04、SHELL-05、UX-03、UX-05、REL-05、REL-07、REL-09，以及其他编号。
  - **非阻断后续：**
    - **UX-05：** F-E14-1（375px 下打开的 rail 面板几乎遮住后续获得焦点的侧栏行；可选方案为焦点移出状态根时关闭面板）；375px 两个状态并列时搜索框占位文字换行。在依赖本 caller 前修复须修订合同。
    - **REL-07 / REL-09（保留限制）：** 畸形字节不能从 UI 覆盖保存；scope 变化会丢失未保存的 rail 草稿。
    - **证据工具：** 今后的 runner 须流式读取 `git archive`，或按其大小设置缓冲。
    - **库存：** 下一次刷新应移除唯一的 AppRail `usePref` 行（批次 66）。
    - **既有观察（不归本 caller）：** 768 顶部 rail 横向溢出、414 底栏按钮裁剪、Tasks 页挂载时的保存失败横幅。

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

### CP-CLOCK-01 · Dashboard 时钟小组件（`xai_clock_style`、`xai_clock_tz`）完整 caller

| 字段 | 当前值 |
| --- | --- |
| 状态 | `diagnosis_needed`：合同 r2 已确认；E1–E3 已冻结（`cb7e49b`、`521fd9a`）；批次 70 登记 native before 与 Clock F1 形态（E4–E5） |
| E3 父级 host 基线 | `521fd9a`（独立父级 host 验证者；`web-dashboard-clock-recovery-independent/` 下 5 个新增文件）。<ul><li>生产 `App` composition（jsdom），只有 auth session 为合成；archive 流式读取（148,408,320 字节）；lockfile 四处一致，50 个文件 hash 与合同表一致；每次运行校验合同 hash；`@repo` 越界导入为 0；harness 检查 6/6；保留退出码 1。</li><li>**结果：** 46 个结果全部符合合同 §14 E3 的预期，PRECONDITION 为 0。正确的 FAIL 33 个：b（失败的选择不保留在屏幕上）、c 持锁时仍写入、d/e/f 离开 Dashboard 不被持有、g 两个分支都没有协调器对话框（零确认部分先通过）、h 没有关页提醒、i 草稿一半不成为冲突、j 14 个值没有 source 提示、k1/k2 标签为 "Dashboard header" 而非 "Dashboard"、m/n 不存在失败草稿、q 的 OK 一半在两个分支都没有协调器对话框。PASS 13 个：三个 fixture 检查、clean 对照、a、l（2）、o、p、i 的空闲一半、c 的锁无关运行、q 的 Cancel 一半（两个分支）。</li><li>**Topbar 普查与确认记录器：** Appearance 状态在所有 case 都不出现；rail 状态只在行 q 失败的 drop 之后出现且为关闭状态。除行 q 外每行零确认；q 的 Cancel 一半恰好一次 rail 确认，OK 一半两次（Cancel 后 OK）；任何地方都没有 Appearance 或其他确认；没有 `Invalid blocker state transition`。</li><li>**跨 caller 种子扫描（F-FD1）：** 扫描 633 个审查代码文件与 `f9eb4b1` 产品树，播种或断言两个时钟 key 的只有：Sol 自己的 oracle（值域内种子，畸形值只在 source-truth case）、本套件（同一规则）、合同测试处置已覆盖的产品测试、以及只持有内存状态的 CmdK fixture。没有已接受 oracle 依赖值域外的时钟值，不需要纠正副本。</li><li>**覆盖缺口（记录）：** 已接受的 Header 套件播种的 Dashboard 顺序不含 Clock，因此计划中的 Header 重跑（E17）从不挂载 Clock；"Clock 已注册时 Header 阻断"只由 Sol D1 与 host 行 l 覆盖。</li><li>**迭代与披露：** 一次正式运行（`before1`）；两次开发探测日志已删除、hash 记入 README：probe1 因 jsdom 没有 `PointerEvent`，按 dashboard-grid 自身测试的做法加 polyfill；probe2 前按裁定 3 让 FX3 接受两种标签，并加入 22 个动作后普查，结果与 `before1` 相同。没有写任何参考或 scratch 实现。套件以只读方式从 React 内部树读取协调器的注册计数与 guard，用于判定"无参与者注册"与"未触及 Clock"；只用英文（语言 key 属 Appearance，须缺失）；jsdom 中 Back/Forward 经 `router.navigate(±1)`，真实浏览器的 Back 留给 native；行 o 以身份通道驱动 A→B→A。</li><li>**总控裁定：**<ol><li>**一致性矩阵第 4 行的措辞过宽：** 该行说派发 `StorageEvent` 的 case"从不期望冲突"，而 host 行 i、§3 第 14 项、§5 第 6 项与 §10 第 5 项要求：另一个 document 提交时，已有草稿的字段成为保留的冲突，这一变化总是以 `StorageEvent` 到达。按具体条款优先读：第 4 行只适用于该 key 没有待定或已结算草稿的 case（空闲与普通失败修复）；有草稿时收到 `StorageEvent` 必须成为保留的冲突，与引擎（`usePrefAsync.ts:149–151`）及 AppRail 已接受的 host 行 m 一致。总控核对了 Sol README 第 4 行引用的 case：带 `StorageEvent` 且期望无冲突的只有修复类 case，冻结 oracle 之间不矛盾。不修订合同，作为披露项，Terra 须满足行 i，最终 acceptance 复核。</li><li>**Header 覆盖缺口：** fixed 验证阶段的 native 批次须在真实 Chrome 中覆盖 host 行 l（Clock 已注册且空闲时 Header 单独阻断，标签与导出只属于 Header），并在 E17 的 Header 重跑回执中注明它不挂载 Clock；不另设新 ID。</li><li>**读取 React 内部树：** 只读、仅用于观察注册数与 guard，接受；oracle 不得依赖它改变产品状态。</li></ol></li><li>**总控核对：** 父提交 `bbd8971`；5 个文件全部新增且都在 independent 目录；4 个文件的 hash 都出现在 README 中，由总控逐个复算；日志 PRECONDITION 为 0、"33 failed | 13 passed (46)" 与回执一致。</li></ul> |
| E1–E2 Sol before oracle | `cb7e49b`（独立 Sol；`web-dashboard-clock-recovery-sol/` 下 16 个新增文件）。<ul><li>**runner：** `git archive` 流式读入 `tar`（148,408,320 字节，每份日志都记录）；四处 lockfile hash 一致；运行前校验合同 r2 的 hash；`@repo` 固定到 archive，越界导入为 0；50 个 archive 文件 hash 与合同 r2 的表一致；拒绝覆盖，保留非零退出码。</li><li>**权威日志（PRECONDITION 均为 0）：** bytes 45/45、fields 1/38、queues 1/24、departure 7/25（before2 为权威，before1 保留）、continuity-export 4/23、original 579/579（widgets 351、grid 228）。97 个失败全部是带 H/D/A/§ 标签的业务断言，没有 suite 错误与未处理错误；静态 typecheck 无 oracle 诊断。</li><li>**H1–H6 全部成立：** H1/H2 各种写入失败下 style、城市与本地时间的选择都被静默丢弃且没有恢复控件；H3 持锁期间字节仍被改写；H4 12 个畸形值与两种按 key 抛错的读取；H5 AppRail、程序化导航、`goTo`、Back/Forward、登出、`beforeunload` 与导出都不受保护（rail 草稿子句须在 App 中，留给 host 行 q 与 F1 c5）；H6 两种草稿并存时对话框显示 "Dashboard header has unsaved changes."。</li><li>**正向对照全部 PASS：** H7 跨 document 实时更新；H8 挂载、tick、弹层与拖动 ghost 零写入；D1 Header 单独时的等价性（三个 case）；D10 tick；D5 零确认记录器（分别计数 rail、Appearance 与其他确认）。</li><li>**迭代：** 六个模式均为 before1；只有 `departure` 跑了 before2，为一致性矩阵第 3 行（source-only 从不持有）补一个正向 case；没有第三轮。</li><li>**披露：** `probe1` 开发探测的日志已删除，不作证据。执行者在 scratchpad 中写了一个临时的 Clock controller 与聚合器，用来检验 oracle 自身，未提交，不作证据；它发现并修正了 D12 复用仍处于激活状态的 quota 故障的 oracle 缺陷，修正后 155 个 case 全过。</li><li>**总控裁定（合同与 oracle 的张力）：**<ol><li>**拖动 ghost 的"零存储尝试"：** 本审计中"存储尝试"一贯指 set/remove 写入尝试（如 Appearance、AppRail 的用法）；合同同句要求 ghost 显示已提交字节，必须读取。因此绑定读法为零写入与零删除，读取只记录（`f9eb4b1` 上 6 次）。host 行 n 与 native 证据按此判定。</li><li>**已在途的写入被对话框 Discard 截断：** 可能提交任一值；只对卸载后被持有的工作断言零写入。与已接受 caller 中"迟到的完成被忽略"的处理一致，接受。</li><li>**无参与者阻断时对话框标签取先注册者（Header 或 Clock）：** 合同未规定顺序，D7 接受任一，接受。</li><li>**两种排序读法**（Retry 先重写失败的前驱再执行排队的最新选择；外部恢复后的新选择正常结算）直接取自合同文本，接受。</li></ol>以上由最终 acceptance 复核。总控认可 scratch 临时实现只作冻结前的 oracle 自检，同 AppRail 批次 56 的裁定；Terra 仍须独立实现。</li><li>**总控核对：** 父提交 `40f07b2`；16 个文件全部新增且都在 Sol 目录；README 列全另外 15 个文件的 hash，总控逐个复算一致；8 份日志的 PRECONDITION 计数均为 0，各模式计数与回执一致。</li></ul> |
| 合同 | r2：`docs/reviews/web-dashboard-clock-recovery-contract/contract.md`（`8bf6139`，1187 行，SHA-256 `214dc758…`），作者为独立 Astra（不是 r1 作者）；r1 为 `2c35fee`（890 行，`21624ff5…`）。<ul><li>**r1→r2 的依据（总控在 `f9eb4b1` 上核对）：** r1 固定在 `419e56d`；`f9eb4b1` 改了它依赖的登出序列（rail 步骤先于 Appearance 步骤）、Topbar（新增 rail 状态槽）与已接受 caller 集合（AppRail），hash 表中的 `App.tsx` 也已过时。</li><li>**r2 主要改动：** 全部源码引用、行号与 hash 在 `f9eb4b1` 上重新核实，所有 before 基线在 `f9eb4b1` 上取得；登出按 rail → Appearance → 协调器重写，确认记录器要求两个步骤在无草稿时零调用，并按确认文本区分；新增 host 行 q 与 F1 case c5（rail 草稿加 Clock 草稿：rail 确认先出现，Cancel 不触及 Clock 与协调器）；未播种时 rail 状态与 Appearance 状态都不得出现（q、c5 除外）；AppRail 离页只用按无障碍名称选中的单次点击，不用拖动；回归加入 AppRail（Sol 八个模式、父级 host、rail F1 形态、C-RD1），E15 的 F1 清单加入 rail F1；撤回 r1 中 "C-FD1 15/15"（在 `f9eb4b1` 上按设计为 14/15，C-RD1 为 case 014 的唯一判定）；新 runner 流式读取 archive 或按大小设缓冲，Header 的四个 100 MiB runner 预先登记缓冲副本；焦点按冻结 `pixelFocusWalk` 判定，并断言其身份 hash。</li><li>E1–E25 连续；Terra 记录目录 `web-dashboard-clock-recovery-terra/`；风险等级 medium（产品风险低，但改动已接受的 Dashboard Header 离页路径）。</li></ul> |
| 总控核对 | <ul><li>`8bf6139` 只修改该合同文件，父提交 `61469c4`。</li><li>总控在 `f9eb4b1` 上抽查：`App.tsx:176–178` 与 `:187–189` 两个分支均为 rail → Appearance → `requestSettingsDeparture`；`Topbar.tsx:117` 为 Appearance 槽、`:124` 为 rail 槽；Clock 写入点 `ClockWidget.tsx:265、286、309` 与 `DashboardModule.tsx:158`（Header 的离页 guard）不变。</li><li>`git diff 419e56d f9eb4b1` 在 dashboard-widgets、dashboard-grid 与 storage 包上为空，与 r2 的声明一致。</li></ul> |
| 总控确认（2026-10-09） | <ol><li>**A1–A9：** 确认。A2–A8 沿用 r1 原文；A1 只把 AppRail 文件与 `App.tsx` 加入受保护清单、把 AppRail 加入重跑；A9 只加入 rail 状态与隐藏宠物的步骤。A7（移除小组件时丢弃其草稿、零写入）维持批次 54 的裁定：REL-05 针对存储失败时保留草稿，不涉及主动移除，属总控可定，须披露，最终 acceptance 复核。</li><li>**时区弹层 Tab 移出时的遮挡：** 采用默认方案，与 F-E14-1 一致记入 UX-05，只作探测记录；恢复控件的 gate 在弹层关闭时判定。不改为焦点离开时关闭（那需要 r3）。</li><li>**预先登记的容量副本：** 确认。Header runner 的缓冲副本，以及 200 MiB F1 runner 若拒绝运行时的条件副本，按 AppRail host 套件的已接受程序执行：先提交拒绝日志，副本只改缓冲与路径层级并提交 diff，测试文件逐字节相同；不另设裁定批次。</li><li>**重跑范围：** 确认。纳入 Smart Lists、Collaborate、Pomodoro 的 host 套件（经已接受的副本）；Features native 与 AppRail native 套件不重跑，以 E12 与 E19 为界；若这两项任何一项不成立，再补跑。</li><li>**登出时的部分丢弃：** 确认"rail 确认 OK、协调器对话框选 Stay"会丢弃 rail 草稿，作为披露项而非阻止项。这与 AppRail 已接受的"OK 后 Cancel"同类；阻止它需要改受保护的 `App.tsx`，属合同停止条件。</li></ol>产品负责人决定：无。 |
| 风险等级 | `medium`：产品风险低；改动已接受的 Dashboard Header 离页路径（单一 guard 改为组合 guard），登出前有三步，App 内有三个 async device controller |
| 后续顺序 | ~~批次 68 Sol（E1–E2）~~（`cb7e49b`）→ ~~批次 69 父级 host 基线（E3）~~（`521fd9a`）→ 批次 70 native before 与 Clock F1 形态（E4–E5）→ Terra → fixed 重跑与 native → 视觉键盘 → Header 与 AppRail 受影响 caller 重跑与最终回归 → 独立最终 acceptance |

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

- CP-APPRAIL-01 已于 `efe05ea` 接受（见上）。进行中阶段的完整记录保留在本文件的 `82d5057` 版本：`git show 82d5057:docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`。
- CP-APPEARANCE-01 已于 `a560863` 接受（见上）。进行中阶段的完整记录保留在本文件的 `8c88dd2` 版本：`git show 8c88dd2:docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`。
- CP-FEATURES-01 已于 `ec55f9e` 接受。进行中记录见本文件的 `78e8de2` 版本。

**最新库存：** `refresh-f9eb4b1.md` / `bindings-f9eb4b1.json`（CP-LUNA-04，`32a265c`）。相对 `419e56d` 只移除 `packages/xai-web-shell/src/AppRail.tsx:37`（`xai_rail_order`，setter `setPrefOrder`）；余下 47 行逐字段、同序不变。上一份为 `refresh-419e56d.md`（CP-LUNA-03，`832f6ab`）。相对 `5cd63ff` 只移除 `AppearancePane.tsx` 第 52、53、55 行（`xai_accent_hue`、`xai_rail_pos`、`xai_bg_tone`，只读）；余下 48 行逐字段不变。
- **剩余规模：** 22 个文件、47 个直接绑定、26 个字面量键、1 个动态位点、30 个 setter 绑定（27 个直接、3 个仅下游）、17 个只读绑定。
- **按包分布：**
  - dashboard-widgets 11、settings-rest 10、board-workspaces 8、statistics 4；
  - board-views、calendar 各 3；
  - board-core、pet 各 2；
  - pomodoro、dashboard-grid、features-panel、tasks 各 1（shell 已无直接绑定）。
- **扫描边界：**
  - 只扫描 `packages/**/*.tsx`（不含 `__tests__`）中直接以 `usePref` 为标识符的调用；
  - `.ts` 文件（如 `useFeaturePrefs.ts`）、`apps/`、CmdK 的 `getPref` 读取，以及 `usePrefAutosaveAsync` 都不可见；
  - 例如 `App.tsx` 在 `5cd63ff` 有三处 `usePref`，在 `419e56d` 已没有，但库存都看不到；同样，`usePrefAutosaveAsync` 绑定（Appearance 与 AppRail controller）不计入。
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

### CP-LUNA-04 · 直接 usePref 库存刷新（批次 66）

| 字段 | 当前值 |
| --- | --- |
| 状态 | `accepted`（总控核对通过，作为库存证据，不涉及产品范围）：`32a265c`。<ul><li>新增 `bindings-f9eb4b1.json`（`5ef90bd3…`）与 `refresh-f9eb4b1.md`（`8b9e613c…`）；扫描器一次运行，退出 0，无诊断轮次。</li><li>按整行对账：移除 1 行（`AppRail.tsx:37`），新增 0 行，变化 0 行；8 项计数与总控预测完全一致。总控另行比对两份 JSON，结果相同。</li><li>新增的 shell `internal/railOrderController.tsx` 经 `usePrefAutosaveAsync` 绑定，`RailOrderStatus.tsx`、`Shell.tsx`、`Topbar.tsx` 不含 `usePref`；`App.tsx` 在扫描边界外。</li></ul> |
| 执行者 | 新的独立 Claude Sonnet 5.5（Luna 角色映射），隔离 worktree |
| 风险 | 低：只读 git 中的固定修订，并运行既有扫描器 |
| 固定点 | 产品 `f9eb4b1`；对照 `419e56d` 的 `bindings-419e56d.json` 与 `refresh-419e56d.md` |
| 命令 | `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs f9eb4b1`。`typescript` 可从主检出只读解析（CP-LUNA-02、03 先例）；不得写入主检出 |
| 允许新增文件 | `bindings-f9eb4b1.json` 与 `refresh-f9eb4b1.md` |
| 验收条件 | <ul><li>逐行 delta 精确对账。预期只移除 `packages/xai-web-shell/src/AppRail.tsx:37`（`xai_rail_order`，setter `setPrefOrder`，直接调用 1 次）这一行。</li><li>总控预测的计数：files 22、bindings 47、literalKeys 26、dynamicSites 1、setterBindings 30、directlyInvokedSetters 27、downstreamOnly 3、readOnlyBindings 17。这是待验证的预测，不是目标。</li><li>新增的 shell `.tsx`（`internal/railOrderController.tsx`、`internal/RailOrderStatus.tsx`）与 `App.tsx` 的改动若产生新行，须逐行解释（controller 经 `usePrefAutosaveAsync` 绑定，预期不计入）。</li><li>沿用边界声明：只扫描 `packages/**/*.tsx`（不含 `__tests__`），不是完整 writer 数，也不是缺陷数。</li><li>不作排程、风险或缺陷判断。</li></ul> |
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
| AppRail 关闭 | `82d5057` 登记批次 65 · `efe05ea` AppRail acceptance · `9a3e3aa` 台账 |
| 下一项选择（续 8） | `37dd138` CP-APPRAIL-01 改为 `accepted`，登记批次 66 · `32a265c` 库存刷新（CP-LUNA-04） |
| 时钟 | `61469c4` 登记批次 67 · `8bf6139` 时钟合同 r2 |
| 时钟（续） | `40f07b2` 登记 CP-CLOCK-01 与批次 68 · `cb7e49b` Sol before oracle |
| 时钟（续 2） | `bbd8971` 登记批次 69 · `521fd9a` 父级 host 基线 |
| 时钟（续 3） | `0ee7ab9` 记录 E3 与裁定，登记批次 70 |
| 本提交 | 暂停：批次 70 执行窗口被停止、无提交；总控交接给 Codex |

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
- AppRail 接受链已在 `9a3e3aa` 写入：
  - REL-05 追加 26 条证据；
  - SET-03 记录用户的 R-1 决定与接受（SET-03 其余验收仍未满足）；
  - SHELL-04 记录 H-RAIL 修复前崩溃与修复后崩溃安全的证据；
  - UX-05 记录 F-E14-1 与 375px 搜索框换行的缺陷证据，不是完成证据；
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

## 交接记录（2026-10-09，Claude → Codex）

- **原因：** 用户要求暂停 Claude 总控窗口，后续全部交给 Codex。
- **批次 70 状态：** 已登记（见下方"本轮唯一任务"，卡片不变）。Claude 启动的父级 native 执行窗口在两个焦点模式运行前被总控停止，**没有任何提交**，结果未经核对，**不是证据**。
- **残留的未提交文件：** 位于本机的 `.claude/worktrees/agent-a5f481d9b8ded5030/`（detached 于 `0ee7ab9`，未跟踪目录 `docs/reviews/web-dashboard-clock-recovery-native/` 与 `docs/reviews/web-dashboard-clock-recovery-f1/`，包括 F1 runner、host fixture、`clock`/`selfcheck` before1 日志、native 的 departure/fields/source 日志与若干截图；焦点模式未运行）。没有遗留的 Chrome 或 runner 进程。处理规则：
  - 不得快进接收、cherry-pick 或复制为证据；
  - 批次 70 须在新的独立窗口/worktree 中从 `0ee7ab9` 之后的控制 HEAD 重新执行；新执行者可只读参考残留文件，但须在回执中披露参考了哪些文件；
  - 新批次确认完成后，由总控在检查其内容后清理该 worktree 与其本地分支 `worktree-agent-a5f481d9b8ded5030`；在其他机器上不存在该残留，不影响执行。
- **其他 worktree：** `~/.claude/worktrees/agent-harness-review-20260909` 与 `~/.codex/worktrees/*` 属于其他会话，与本审计无关，不得触碰。
- **不变项：** 正式 13/312 完成、299 未关闭；CP-CLOCK-01 状态 `diagnosis_needed`；所有裁定与经验见上文。

## 本轮唯一任务

批次 70：独立父级 native 验证者在 `f9eb4b1` 上产出 CP-CLOCK-01 的 native before（E4）与 Clock F1 形态 before（E5）。

- **执行者：** 新的独立 Claude Opus 5.5（父级 native 验证者）。它不是合同作者，不是批次 68、69 的执行者，也不是 AppRail 任何一批的执行者。
- **固定点：**
  - 产品 `f9eb4b1`，生产 `App` composition，真实 headless Chrome 经 CDP pipe transport；只有 auth session 为合成；
  - 不可变 archive（流式读取，记录字节数）；lockfile gate；`@repo` 全部来自 archive 并带守卫；记录 requested 与 resolved SHA；拒绝覆盖；保留非零退出码；
  - 合同 r2（`8bf6139`）§12 的 "Native before" 与 "Clock F1-shape before"，以及 §14 E4–E5；控制分支基点为本提交。
- **E4（native before）：**
  - H1–H5 在 EN 与 ZH 下；
  - H9：用冻结的 `pixelFocusWalk`（与 `web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs`，`bacdbbc` 逐字节相同，每次运行断言块与函数的身份 hash）做逐停靠点焦点测量；
  - H10 目标尺寸（只记录）；
  - 每个宽度（含 768×1024）下的小组件框与默认宠物框；
  - 来源证明、pipe transport 与 K-1 按键审计；
  - 合同 §12 "Validity and positive controls" 列出的正向对照在 `f9eb4b1` 上 PASS，包括 host 行 l 与 D1（Header 阻断而 Clock 已注册）。
- **E5（Clock F1 形态 before）：**
  - 新 runner `web-dashboard-clock-recovery-f1/verify-f1-clock.mjs` 与其 host fixture，只读复用冻结的 `../web-sticky-recovery-f1/f1-prelude.js` 并校验 hash（`67bbfaa7…`），以已接受的 `verify-f1-railorder.mjs` 为模式；
  - 断言 docs-head 产品树前置条件与合同 r2 的 hash；流式读取 archive；
  - `selfcheck` 须 harness-valid；`clock` 模式记录 c1–c5 的 before 状态（c1、c2、c4 为 `before-not-held`，c3 为 `before-header-only`，c5 为 `before-rail-only`），c4、c5 的零确认与 Cancel 部分须在 `f9eb4b1` 上通过；
  - c5 的 rail 草稿由可信 CDP 拖动建立，失败由只针对 `xai_rail_order` 的 quota 故障造成。
- **规则：**
  - 不带 `nativeVirtualKeyCode`，每次运行保留按键审计；拖动只用可信 CDP 输入并记录 `isTrusted`；
  - 宠物隐藏须在 768px 或更宽时经产品自身的 rail 宠物按钮由可信点击完成，再不重载地缩放；
  - AppRail 离页只用按无障碍名称选中的单次点击；
  - Topbar 普查：未播种时 rail 与 Appearance 状态都不得出现（c5 与行 q 除外），出现即前置条件失败；
  - "零存储尝试"读作零写入与零删除；
  - 每个 case 先断言前置条件再断言业务；before 失败必须是业务断言；
  - 只能用 worktree 内自己启动的 server 或 bundle；禁止在主检出启动 dev server、使用 preview 工具或写入主检出。
- **惯例：** 沿用 `web-apprail-order-recovery-native/`（`verify-native-before.mjs`、`native-before-app.tsx`、`native-before-prelude.js`）与 `web-apprail-order-recovery-f1/` 的结构；不得写参考实现作为产品实现。
- **输出：** 只新增 `docs/reviews/web-dashboard-clock-recovery-native/` 与 `docs/reviews/web-dashboard-clock-recovery-f1/` 下的文件：runner、fixture、日志、截图与两份回执（`before-f9eb4b1.md`，各列全 hash）。提交一次，不 push。
- **禁止：** 修改任何已有文件、产品、合同、oracle、台账或控制面；修复；push；派生子 agent。
- **成本上限：** 每个模式的诊断迭代不超过 3 轮，用新后缀并保留旧日志；开发探测须披露。
- **停止条件：** oracle 与合同矛盾时写明并停止；harness 不可复现时 BLOCKED；需要越出合同 §11 或跨模块时停止并报告。

## 下一步

1. 等待批次 70 回执，总控核对：
   - 只新增文件，且在两个允许目录内；
   - 两份回执列全 hash；
   - H1–H5 的 EN/ZH 结果、H9 的逐停靠点数值、H10 与宽度几何；
   - F1 selfcheck 有效，c1–c5 的 before 状态正确；
   - 正向对照（含 host 行 l、D1）通过，按键审计零失配；
   - 抽看截图。
2. 通过后 E1–E5 全部冻结，登记批次 71：Terra 实施 CP-CLOCK-01（限合同 r2 §11 的文件）。
