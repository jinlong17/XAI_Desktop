# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-04

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`5cd63ff652f02a2c726187fe12cbc796218d31c0`（Features caller 实施；相对 `f359be6` 只改 `xai-web-settings-features-panel` 的 11 个合同 §11 文件）

模块归属：`web`

本轮模式：Appearance 的 Sol before oracle（E1–E2）已在 `5cd63ff` 冻结（`bd09456`）：8 个模式，所有假设都成立，没有 precondition 失败。本批登记批次 38：由独立父级 host 验证者冻结 E3。当前 Claude 总控窗口不实施产品或 verifier 修复，也不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `bd09456` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。本会话创建的所有隔离 worktree 与临时本地分支均已在快进接收后清理。
- 产品基线依次前进：`2023526` → `210abdf`（合同 §11 的 8 个 Sticky 文件）→ `f359be6`（`departureCoordinator.tsx` 与新测试 `departureCoordinator.blocker.test.tsx`）→ `5cd63ff`（Features 合同 §11 的 11 个文件，全部位于 `xai-web-settings-features-panel`）。共享 storage、shell、widgets、其他宿主文件、其他 caller 与 lockfile 均无变化。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` 保全 Sol 原证据提交 `c3ab20d`，不得合并。
- 每次 push 后运行 `pnpm git:sync-check -- --fetch`，最近一次为 failures=0、warnings=1（未请求 deep 扫描）。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。产品改动进入 Desktop 前仍须走 ADR-0013 D3 gate。

## 台账与 Git 的差异

- 正式台账已在 `d91b5e5`（More 与 Notifications 接受链）、`a0df253`（F1）、`4da6e71`（Sticky 接受链，REL-05 证据追加 25 条）与 `6ec0bec`（Features 接受链：REL-05 追加 27 条，含 F-B002 证据；UX-03 与 SHELL-05 各追加 4 条宠物遮挡缺陷证据，不是完成证据）核对，均未改条目状态。
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

### CP-APPEARANCE-01 · Settings Appearance 完整 caller（含 App 根偏好 writer 与 Topbar 快速切换）

| 字段 | 当前值 |
| --- | --- |
| 状态 | `diagnosis_needed`：合同 r3 已确认；before 基线 E1–E2 已冻结（`bd09456`），E3–E5 未冻结；未授权实施 |
| 用户决定（2026-10-04） | **B-2：保留按钮，改为全部重试。** 用户在三个选项中选了 (ii)：<ul><li>(i) 自动保存并去掉按钮，未选；</li><li>(ii) 保留按钮并改为全部重试，**选中**；</li><li>(iii) 编辑后保存，未选。</li></ul>含义：继续自动保存，每次改动立即生效并保存；底部按钮保留，从无条件显示 "Saved" 的空操作，改为真实的"重试全部失败项"。这是产品负责人对 SET-02 开放选择的决定，记入控制面；台账在 Appearance 接受时一并对账 |
| 选择与合同 | `e9fbdb7`，作者为独立 Claude Opus 5.5（Astra 角色映射）。<ul><li>选择备忘录 `docs/reviews/web-next-caller-selection/selection-5cd63ff.md`：比较 7 个候选，推荐 B（Appearance）。</li><li>合同 `docs/reviews/web-appearance-recovery-contract/contract.md`：r1 有 884 行，含假设 A1–A9、H1–H14、九个 gate、E1–E26；r2 见下方一行。</li></ul> |
| 合同 r2（批次 35） | `b2e5eb2`（独立 Astra；只原地修订 `contract.md`，1159 行，SHA-256 `e4210cff…`）。<ul><li>A2 改为记录产品负责人的决定：继续自动保存；"Save & apply" 与无条件的 "Saved" 闪现去掉；改为 pane 本地底部区域中的真实"全部重试"。</li><li>重试范围：所有已结算的失败草稿，每项只试一次，按精确草稿归属。</li><li>EN/ZH 文案：`Retry all`/`全部重试`。</li><li>位置：底部区域不吸底、左对齐，全部重试在最左。它只对全部重试设硬 gate：5 个宽度上与宠物盒至少相隔 8px，中心加四个内缩点均无遮挡。</li><li>`SettingsFooter`、`confirmAction`、`resetAllPrefs` 不变。</li><li>计数：H1–H16，gate 1–10，证据 E1–E27 连续（Sol 增加 `retry-all` 模式，新增 E26 native 全部重试，最终回归回执改为 E27）。</li><li>**总控核对：** 只改合同一个文件，worktree clean；A1、A3–A9 与 r1 逐字相同；E1–E27 连续；修订记录位于合同开头。</li></ul> |
| 用户决定二（2026-10-04） | **全部重试按钮始终显示，没有失败时禁用。** 用户在"仅在有失败时显示"（r2 的写法）与"始终显示，无失败时禁用"之间选了后者。两种方式下，底部区域都不吸底、左对齐 |
| 总控裁定（r2 开放问题 2–6，2026-10-04） | <ol><li>**文案：** 接受 `Retry all`/`全部重试` 与 r2 的状态行文案，沿用现有 pane 的文案风格；用户可另行修改。</li><li>**不吸底：** 接受底部区域改为不吸底。理由是避开默认位置的宠物；失败状态另有 Topbar 提示，滚动时也可见。</li><li>**左对齐：** 接受整个底部区域左对齐（全部重试 → 导出 → 放弃全部，Reset 单独一行）。除全部重试外，其他控件仍按 A9 只要求中心不被遮挡。</li><li>**计数：** 控制面按 E1–E27、gate 1–10、H1–H16 更新（本提交）。批次 37 的 before 基线须包含 Sol `retry-all` 模式、host 的全部重试用例，以及 native 的 H14(b)/H15。</li><li>**继承行为：** 接受 r2 照实记录的继承行为，即 Reset 接受时仍在写入的 set 随后失败，经 Retry 或全部重试先重写被取代的值，再删除，最终字节为 reset 结果。但要求 r3 在 §12 写明，由 Sol oracle 覆盖这一顺序：断言瞬时写入序列与最终字节。这同时补上 Features acceptance 后续第 2 项指出的 oracle 缺口。</li></ol> |
| 合同 r3（批次 36） | `706c9a3`（独立 Astra；只原地修订 `contract.md`，1240 行，SHA-256 `ef1b573c…`）。<ul><li>全部重试始终渲染。没有可重试的失败时，用 `aria-disabled="true"` 禁用，从不用原生 `disabled`：按钮仍可聚焦、仍在 Tab 顺序中，激活时不执行任何操作。</li><li>名称在任何状态下都不变；禁用且不在重试中时，不挂 `aria-describedby`。</li><li>禁用样式只改颜色、透明度与光标，盒子尺寸不变（≥44×44）；文字对比度 ≥3:1；不随强调色变化；`pointer-events` 保持开启。</li><li>一次重试全部成功后，按钮变为禁用，焦点留在按钮上。</li><li>§12 写入总控裁定 5 的继承顺序 oracle：`queues` 模式的 `fu2-retry-theme`、`fu2-retry-railPos`，`retry-all` 模式的 `fu2-retry-all-theme`、`fu2-retry-all-railPos`；在 `5cd63ff` 上须在第 1 步正确 FAIL。</li><li>新增 H17：今天的 "Save & apply" 在 clean 状态下可用，会执行 4 次根键 `setItem`，把默认值写进缺失的键，并闪现 "Saved"。新增 host 行 s。</li><li>计数：H1–H17，gate 1–10，E1–E27 连续，host 行 a–s。</li><li>**总控核对：** 只改合同一个文件，worktree clean；A1、A3–A9 与 r2 逐字相同；E1–E27 连续；H17 与 r3 修订记录均已写入。引用的先例属实：`CountdownEditDialog.tsx:337` 只用 `aria-disabled`，`ErrorBanner.tsx:133–134` 两者都用。</li></ul> |
| 总控确认与裁定（r3，2026-10-04） | <ul><li>**确认 A1、A3–A9**（合同 §1 第 2 步）。A2 是产品负责人的两个决定。</li><li>**计数：** 按 H1–H17 执行。批次 37–39 须覆盖 H17：Sol `retry-all`、父级 host 的 clean 状态用例、native before（E4，EN/ZH）。</li><li>**A2.4 规则 2：** 接受导出失败行只在存在草稿时显示。文案不变，与总控裁定 1 一致；clean 状态不会在禁用按钮旁出现失败提示。</li><li>**设计细节：** 接受以下三项。<ul><li>成功后焦点留在禁用按钮上：保持用户位置；重复按 Enter 不会误打开 Reset 确认。</li><li>禁用且不在重试中时不挂描述。</li><li>禁用样式阈值作为 Terra 的 CSS 约束：≥3:1 对比度、不随强调色变化、只用中性 token。</li></ul></li><li>**裁定 5 的细节：** 接受种子值；"Defaults restored." 只在全部重试的 case 中要求出现。</li></ul> |
| E1–E2 Sol before oracle | `bd09456`（独立 Sol；`web-appearance-recovery-sol/` 下 36 个新增文件）。<ul><li>**运行环境：** 不可变的 `5cd63ff` archive；lockfile gate 在四处一致；`@repo` 以 75 个精确 alias 固定到 archive，并带守卫，未 alias 的导入为 0；拒绝覆盖与非零退出码均已验证。</li><li>**权威日志：** 各模式的 before3；`original` 为 before2，只跑一次。各模式用满 3/3 诊断迭代，各轮结果逐 case 一致，只有新增的 case 不同。</li><li>**逐模式结果：** bytes 65/0、fields 1/88、reset 4/30、queues 1/55、continuity-export 4/22、host 6/27、retry-all 2/46、original 97/0。351 个 Sol case 与 97 个 original case 中，`PRECONDITION:` 为 0；失败全部是业务 AssertionError。</li><li>**假设：** H1–H10、H12、H13、H15–H17 全部成立，无一被推翻（H11 属 E3，H14 属 E4）。H6 另有两项发现：`"EN"` 也会让 `/app` 崩溃；另一个 document 写入的 `Infinity` 强调色会让运行中的 App 崩溃。</li><li>**裁定 5：** 四个 case 都在第 1 步失败于业务断言。例如持锁期间字节已从 `"system"` 变为 `"dark"`，对应 H8：当前产品写入时不持锁。</li><li>**正向对照与 F-B002：** 正向对照全部 PASS，包括今天可操作的 "Save & apply"；七个 oracle 文件的 F-B002 自检全部 PASS，嵌套重入为 0。</li><li>**迭代 2 修正了两个 harness 假失败：** 登出 helper 重复切换了头像菜单；Topbar 状态位置检查不允许包裹节点。这两处修正符合合同 §11 "紧跟 premiumBadge 渲染" 的要求，最终 acceptance 复核。</li><li>**总控核对：** 36 个文件均为新增，且在允许目录内；worktree clean；README hash `575514d5…`，其余文件的 hash 都写在 README 中；7 个 Sol 模式的计数与 precondition 行由总控逐一复核；裁定 5 的失败行已抽查。</li></ul> |
| 范围 | 7 个 device 键：语言、主题、密度、字号、强调色、背景、rail 位置。<ul><li>三个写入面：Settings pane、`App.tsx` 根偏好 writer、Topbar 快速切换。</li><li>Terra 可改的文件见合同 §11：Appearance 包；shell 的 `Topbar.tsx`、`Shell.tsx`、`types.ts` 与 Topbar 测试；`apps/web` 的 `App.tsx` 与新的 App 测试；运行记录目录 `web-appearance-recovery-terra/`。</li><li>全部在 `web` 模块内，不改 D2 共享层。</li></ul> |
| 312 清单编号 | 关联 SET-02、SHELL-04、REL-05、REL-07、REL-09 等；本任务不关闭任何编号 |
| 风险等级 | `high`：改动宿主 `App.tsx` 与 shell，影响所有 `/app` 路由。<ul><li>H6：一个畸形根值会让整个 `/app` 落入错误页。</li><li>是开放式 async 路径的第一个 device 生产使用方：在这里发现的缺陷按共享缺陷处理。</li></ul> |
| 总控核对 | <ul><li>提交只新增 2 个文件，worktree clean。</li><li>总控在 `5cd63ff` 上逐条核实关键源码事实：<ul><li>`plugin-web-tokens/src/i18n.ts:727–733` 遇不支持的语言抛 `TypeError`；</li><li>`apply.ts:64–69、83–88` 遇非法字号或色相抛 `RangeError`；</li><li>`router.tsx:41–43` 的 `/app` 挂 `RouteErrorBoundary`；</li><li>`App.tsx:98–105` 与 `Topbar.tsx:26–39` 吞掉写入失败；</li><li>`SettingsFooter.tsx:75` 无条件 `setSaved(true)`；</li><li>7 个键在 `accountOwnership.ts` 中均为 device。</li></ul></li><li>Terra 文件清单逐个列出；E1–E26 连续，无缺号。</li></ul> |
| 前置决定 | <ul><li>**B-2 / A2（用户已决定为 (ii)，见上）：** SET-02 原文为"Appearance统一自动保存或编辑后保存语义"，两种方式都写在条目里，属产品负责人的选择。<ul><li>合同按选项 (i) 写成：保留自动保存，去掉 "Save & apply"（Features D3 先例）。</li><li>选 (ii) 或 (iii) 时，须由 Astra 修订合同。</li></ul></li><li>**A1、A3–A9（总控可定）：** 宿主与 shell 范围、App 级单一 controller、开放式 async 路径、保护模型（不加 Settings 路由 guard；Topbar 状态位；App 级 `beforeunload`；登出前确认）、严格值域且只拒绝不修复、Reset 删除 6 个键并保留语言、测试处置、R-PET 判定口径。总控倾向确认，待 B-2 结果后一并确认。</li><li>**其他候选的用户决定（暂不提问，排到对应候选时再提）：** C-1（SET-10）、D-2、E-1（DASH-03）、E-2（SHELL-05）、E-3（SET-03）、F-2（SET-08）。</li></ul> |
| 后续顺序 | ~~用户决定 B-2~~（(ii)）→ ~~批次 35 Astra 修订合同 r2~~（`b2e5eb2`）→ ~~用户决定二~~（始终显示）→ ~~批次 36 r3 修订~~（`706c9a3`）→ ~~总控确认 A1、A3–A9~~ → ~~批次 37 Sol（E1–E2）~~（`bd09456`）→ 批次 38 父级 host（E3）→ 批次 39 native before 与 Appearance F1（E4–E5）→ E1–E5 全部冻结后才授权 Terra → fixed 重跑与 native → 最终回归 E27 → 独立最终 acceptance |

CP-FEATURES-01 已于 `ec55f9e` 接受（见上）。它在进行中阶段的完整记录（总控决定、逐批证据行、R-PET、F-B002 与批次 31 的核对）保留在本文件的 `78e8de2` 版本：
`git show 78e8de2:docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`。

**最新库存：** `refresh-5cd63ff.md` / `bindings-5cd63ff.json`（CP-LUNA-02，`a83d53a`）。相对 `f359be6` 只移除 `FeaturesPane.tsx:69` 一行（`prefKey`，动态，setter `setOn`）；余下 51 行逐字段不变。
- **剩余规模：** 24 个文件、51 个直接绑定、30 个字面量键、1 个动态位点、31 个 setter 绑定（28 个直接、3 个仅下游）、20 个只读绑定。
- **按包分布：**
  - dashboard-widgets 11、settings-rest 10、board-workspaces 8、statistics 4；
  - board-views、calendar、settings-appearance 各 3；
  - board-core、pet 各 2；
  - features-panel、pomodoro、dashboard-grid、shell、tasks 各 1。
- **扫描边界：** 只扫描 `packages/**/*.tsx`（不含 `__tests__`）中直接以 `usePref` 为标识符的调用。`.ts` 文件（如 `useFeaturePrefs.ts`）、`apps/` 与 CmdK 的 `getPref` 读取都不可见。
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
| 本提交 | 记录 E1–E2，登记批次 38（父级 host E3） |

## 台账变化

- 无编号状态变化；13/312 完成、299 未关闭保持不变。
- Sticky 接受链已在 `4da6e71` 写入：只追加 REL-05 证据与检查点文字，SET-12 保持待处理，并保留"caller accepted ≠ 业务/发布完成"。
- Features 接受链已在 `6ec0bec` 写入：
  - REL-05 追加 27 条证据，含 More 的 F-B002 证据；
  - UX-03 与 SHELL-05 各追加 4 条宠物遮挡缺陷证据，不是完成证据；
  - 补充检查点文字；
  - SET-03、REL-05、UX-03、SHELL-05 保持未关闭。

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

批次 38：独立父级 host 验证者在 jsdom 中，用生产 `App` composition 冻结 Appearance 的 host before 基线，对应合同 r3 §14 的 E3，覆盖 H11 以及 H16、H17 的 host 层。

- **固定点：**
  - before `5cd63ff`：不可变 archive；lockfile gate；`@repo` 固定到 archive 并带守卫；记录 requested 与 resolved SHA；拒绝覆盖；保留非零退出码；
  - 合同 r3（`706c9a3`）；
  - 控制分支基点为本提交。
- **用例**（合同 §12 "Parent host baseline"）：
  - 每个字段失败编辑后的 sidebar 路由结果与登出结果；
  - 每个 Topbar 字段失败选择后的 AppRail 结果，以及从 `/app/tasks` 登出的结果；
  - 失败的 reset 及其路由结果；
  - Topbar 主题失败加 pane 强调色失败之后，预期的全部重试，以及 Topbar 状态、`beforeunload` 与登出结果（H16）。在 `5cd63ff` 上这个控件不存在，属正确 FAIL。
  - clean 状态：预期的全部重试应已渲染且禁用：`aria-disabled="true"`，没有 `disabled` 属性，是 Tab 停靠点；点击、Enter、Space 都不产生存储尝试（H17）。在 `5cd63ff` 上这个控件不存在，属正确 FAIL。
  - 一个 clean 正向对照。
  - **H11：** 存在失败的 Appearance 工作时，pane 外没有任何指示；从任意路由登出都 resolve `true`；`beforeunload` 不警告。
- **F-B002 规则同样适用：** spy 内不得重入 storage，须附自检。
- **惯例：** 沿用 `web-features-recovery-independent/` 的 runner 与 `host.test.tsx`。
- **输出：** 只新增 `docs/reviews/web-appearance-recovery-independent/**`，内容为：
  - host fixture、oracle、runner；
  - before 日志；
  - README：SHA-256、逐用例结果、H11/H16/H17 的 host 层逐项 confirmed 或 refuted 并附日志行、正向对照 PASS 的证明。
- **禁止：** 修改产品、合同、已有证据、台账或控制面；修复；push；派生子 agent。
- **成本上限：** 诊断迭代不超过 3 轮，用新后缀并保留旧日志。
- **停止条件：** harness 有效性 3 轮内无法建立、合同与源码矛盾，或需要越权文件时，提交 blocked 回执并停止。

## 下一步

1. 等待批次 38 回执，总控核对：
   - 只新增 `web-appearance-recovery-independent/**`；
   - archive、gate 与守卫；
   - 正向对照 PASS；
   - 失败均为业务断言；
   - H11/H16/H17 结论有日志行支撑；
   - hash 与回执吻合。
2. 通过后登记批次 39（E4–E5）：native before 与 Appearance F1 形态 before。E1–E5 全部冻结后，才授权 Terra。
