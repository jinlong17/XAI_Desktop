# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-05

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`419e56de9f23e4467fea806fbd4a990e1f429941`（Appearance caller，含 F-APP-1 与 F-APP-2 修复；相对 `24073b5` 只多出 `styles.css` 的两段追加与两个守卫测试；相对 `5cd63ff` 共 26 个文件，全部在合同 r3 §11 内）

模块归属：`web`

本轮模式：最终回归 E18–E25 与回执 E27 在 fixed `419e56d` 上 PASS（`c6d1ed4`）；delta 审计证明 E9–E13 与 E26 可以沿用。冻结发现 F-FD1 已裁定：已接受的 Features oracle 用了一个现已不在值域内的种子值，不是产品失败。本批登记批次 52：CP-APPEARANCE-01 的独立最终 acceptance。当前 Claude 总控窗口不实施产品或 verifier 修复，也不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `c6d1ed4` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。本会话创建的所有隔离 worktree 与临时本地分支均已在快进接收后清理。
- 产品基线依次前进：`2023526` → `210abdf`（合同 §11 的 8 个 Sticky 文件）→ `f359be6`（`departureCoordinator.tsx` 与新测试 `departureCoordinator.blocker.test.tsx`）→ `5cd63ff`（Features 合同 §11 的 11 个文件，全部位于 `xai-web-settings-features-panel`）→ `24073b5`（Appearance 合同 r3 §11 的 24 个文件：Appearance 包、shell 的 Topbar/Shell/types 与 Topbar 测试、`App.tsx` 与新 App 测试）→ `5bbf473`（F-APP-1：Appearance `styles.css` 追加 9 行，并新增一个焦点环守卫测试）→ `419e56d`（F-APP-2：`styles.css` 再追加 13 行，并新增一个选中焦点守卫测试）。共享 storage、shell、widgets、其他宿主文件、其他 caller 与 lockfile 均无变化。
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
| 状态 | `verification_pending`：E7、E8、E16、E17 PASS（`31d6335`）；E9–E11 PASS（`3419542`）；K-1 已关闭，没有结论改变（`6b9f0ee`）；E12、E13、E26 PASS（`32e6753`）；F-APP-1 已由 `5bbf473` 修复，并经批次 48 确认；批次 48 发现同类失败 F-APP-2（`bacdbbc`），已由 `419e56d` 修复；E14–E15 在 `419e56d` 上 PASS（`2696855`）；最终回归 E18–E25 与 E27 PASS（`c6d1ed4`，F-FD1 已裁定）；待最终回归 E18–E25 与回执 E27，以及独立最终 acceptance |
| 用户决定（2026-10-04） | **B-2：保留按钮，改为全部重试。** 用户在三个选项中选了 (ii)：<ul><li>(i) 自动保存并去掉按钮，未选；</li><li>(ii) 保留按钮并改为全部重试，**选中**；</li><li>(iii) 编辑后保存，未选。</li></ul>含义：继续自动保存，每次改动立即生效并保存；底部按钮保留，从无条件显示 "Saved" 的空操作，改为真实的"重试全部失败项"。这是产品负责人对 SET-02 开放选择的决定，记入控制面；台账在 Appearance 接受时一并对账 |
| 选择与合同 | `e9fbdb7`，作者为独立 Claude Opus 5.5（Astra 角色映射）。<ul><li>选择备忘录 `docs/reviews/web-next-caller-selection/selection-5cd63ff.md`：比较 7 个候选，推荐 B（Appearance）。</li><li>合同 `docs/reviews/web-appearance-recovery-contract/contract.md`：r1 有 884 行，含假设 A1–A9、H1–H14、九个 gate、E1–E26；r2 见下方一行。</li></ul> |
| 合同 r2（批次 35） | `b2e5eb2`（独立 Astra；只原地修订 `contract.md`，1159 行，SHA-256 `e4210cff…`）。<ul><li>A2 改为记录产品负责人的决定：继续自动保存；"Save & apply" 与无条件的 "Saved" 闪现去掉；改为 pane 本地底部区域中的真实"全部重试"。</li><li>重试范围：所有已结算的失败草稿，每项只试一次，按精确草稿归属。</li><li>EN/ZH 文案：`Retry all`/`全部重试`。</li><li>位置：底部区域不吸底、左对齐，全部重试在最左。它只对全部重试设硬 gate：5 个宽度上与宠物盒至少相隔 8px，中心加四个内缩点均无遮挡。</li><li>`SettingsFooter`、`confirmAction`、`resetAllPrefs` 不变。</li><li>计数：H1–H16，gate 1–10，证据 E1–E27 连续（Sol 增加 `retry-all` 模式，新增 E26 native 全部重试，最终回归回执改为 E27）。</li><li>**总控核对：** 只改合同一个文件，worktree clean；A1、A3–A9 与 r1 逐字相同；E1–E27 连续；修订记录位于合同开头。</li></ul> |
| 用户决定二（2026-10-04） | **全部重试按钮始终显示，没有失败时禁用。** 用户在"仅在有失败时显示"（r2 的写法）与"始终显示，无失败时禁用"之间选了后者。两种方式下，底部区域都不吸底、左对齐 |
| 总控裁定（r2 开放问题 2–6，2026-10-04） | <ol><li>**文案：** 接受 `Retry all`/`全部重试` 与 r2 的状态行文案，沿用现有 pane 的文案风格；用户可另行修改。</li><li>**不吸底：** 接受底部区域改为不吸底。理由是避开默认位置的宠物；失败状态另有 Topbar 提示，滚动时也可见。</li><li>**左对齐：** 接受整个底部区域左对齐（全部重试 → 导出 → 放弃全部，Reset 单独一行）。除全部重试外，其他控件仍按 A9 只要求中心不被遮挡。</li><li>**计数：** 控制面按 E1–E27、gate 1–10、H1–H16 更新（本提交）。批次 37 的 before 基线须包含 Sol `retry-all` 模式、host 的全部重试用例，以及 native 的 H14(b)/H15。</li><li>**继承行为：** 接受 r2 照实记录的继承行为，即 Reset 接受时仍在写入的 set 随后失败，经 Retry 或全部重试先重写被取代的值，再删除，最终字节为 reset 结果。但要求 r3 在 §12 写明，由 Sol oracle 覆盖这一顺序：断言瞬时写入序列与最终字节。这同时补上 Features acceptance 后续第 2 项指出的 oracle 缺口。</li></ol> |
| 合同 r3（批次 36） | `706c9a3`（独立 Astra；只原地修订 `contract.md`，1240 行，SHA-256 `ef1b573c…`）。<ul><li>全部重试始终渲染。没有可重试的失败时，用 `aria-disabled="true"` 禁用，从不用原生 `disabled`：按钮仍可聚焦、仍在 Tab 顺序中，激活时不执行任何操作。</li><li>名称在任何状态下都不变；禁用且不在重试中时，不挂 `aria-describedby`。</li><li>禁用样式只改颜色、透明度与光标，盒子尺寸不变（≥44×44）；文字对比度 ≥3:1；不随强调色变化；`pointer-events` 保持开启。</li><li>一次重试全部成功后，按钮变为禁用，焦点留在按钮上。</li><li>§12 写入总控裁定 5 的继承顺序 oracle：`queues` 模式的 `fu2-retry-theme`、`fu2-retry-railPos`，`retry-all` 模式的 `fu2-retry-all-theme`、`fu2-retry-all-railPos`；在 `5cd63ff` 上须在第 1 步正确 FAIL。</li><li>新增 H17：今天的 "Save & apply" 在 clean 状态下可用，会执行 4 次根键 `setItem`，把默认值写进缺失的键，并闪现 "Saved"。新增 host 行 s。</li><li>计数：H1–H17，gate 1–10，E1–E27 连续，host 行 a–s。</li><li>**总控核对：** 只改合同一个文件，worktree clean；A1、A3–A9 与 r2 逐字相同；E1–E27 连续；H17 与 r3 修订记录均已写入。引用的先例属实：`CountdownEditDialog.tsx:337` 只用 `aria-disabled`，`ErrorBanner.tsx:133–134` 两者都用。</li></ul> |
| 总控确认与裁定（r3，2026-10-04） | <ul><li>**确认 A1、A3–A9**（合同 §1 第 2 步）。A2 是产品负责人的两个决定。</li><li>**计数：** 按 H1–H17 执行。批次 37–39 须覆盖 H17：Sol `retry-all`、父级 host 的 clean 状态用例、native before（E4，EN/ZH）。</li><li>**A2.4 规则 2：** 接受导出失败行只在存在草稿时显示。文案不变，与总控裁定 1 一致；clean 状态不会在禁用按钮旁出现失败提示。</li><li>**设计细节：** 接受以下三项。<ul><li>成功后焦点留在禁用按钮上：保持用户位置；重复按 Enter 不会误打开 Reset 确认。</li><li>禁用且不在重试中时不挂描述。</li><li>禁用样式阈值作为 Terra 的 CSS 约束：≥3:1 对比度、不随强调色变化、只用中性 token。</li></ul></li><li>**裁定 5 的细节：** 接受种子值；"Defaults restored." 只在全部重试的 case 中要求出现。</li></ul> |
| E1–E2 Sol before oracle | `bd09456`（独立 Sol；`web-appearance-recovery-sol/` 下 36 个新增文件）。<ul><li>**运行环境：** 不可变的 `5cd63ff` archive；lockfile gate 在四处一致；`@repo` 以 75 个精确 alias 固定到 archive，并带守卫，未 alias 的导入为 0；拒绝覆盖与非零退出码均已验证。</li><li>**权威日志：** 各模式的 before3；`original` 为 before2，只跑一次。各模式用满 3/3 诊断迭代，各轮结果逐 case 一致，只有新增的 case 不同。</li><li>**逐模式结果：** bytes 65/0、fields 1/88、reset 4/30、queues 1/55、continuity-export 4/22、host 6/27、retry-all 2/46、original 97/0。351 个 Sol case 与 97 个 original case 中，`PRECONDITION:` 为 0；失败全部是业务 AssertionError。</li><li>**假设：** H1–H10、H12、H13、H15–H17 全部成立，无一被推翻（H11 属 E3，H14 属 E4）。H6 另有两项发现：`"EN"` 也会让 `/app` 崩溃；另一个 document 写入的 `Infinity` 强调色会让运行中的 App 崩溃。</li><li>**裁定 5：** 四个 case 都在第 1 步失败于业务断言。例如持锁期间字节已从 `"system"` 变为 `"dark"`，对应 H8：当前产品写入时不持锁。</li><li>**正向对照与 F-B002：** 正向对照全部 PASS，包括今天可操作的 "Save & apply"；七个 oracle 文件的 F-B002 自检全部 PASS，嵌套重入为 0。</li><li>**迭代 2 修正了两个 harness 假失败：** 登出 helper 重复切换了头像菜单；Topbar 状态位置检查不允许包裹节点。这两处修正符合合同 §11 "紧跟 premiumBadge 渲染" 的要求，最终 acceptance 复核。</li><li>**总控核对：** 36 个文件均为新增，且在允许目录内；worktree clean；README hash `575514d5…`，其余文件的 hash 都写在 README 中；7 个 Sol 模式的计数与 precondition 行由总控逐一复核；裁定 5 的失败行已抽查。</li></ul> |
| E3 父级 host before 基线 | `b997235`（独立父级 host 验证者；`web-appearance-recovery-independent/` 下 7 个新增文件）。<ul><li>**运行环境：** 生产 `App` composition，只替换 auth session hook；不可变的 `5cd63ff` archive；lockfile gate 在四处一致；`@repo` 以 75 个精确 alias 固定并带守卫，未 alias 的导入为 0；合同所列 19 个源文件 hash 一致；拒绝覆盖已验证；主检出 mtime 扫描为 0 变化。</li><li>**结果：** 权威日志 `host-before3-5cd63ff.log` 共 33 个 case，4 PASS（F-B002 自检、锁 fixture、composition、clean 正向对照）、29 FAIL；`PRECONDITION:` 为 0；失败全部是业务断言。</li><li>**H11 成立：** pane 外没有 Topbar 状态；从 Appearance pane、`/app/tasks` 或 About 登出都直接完成，没有确认；`beforeunload` 不警告。</li><li>**H16 成立：** 失败后没有全部重试，底部只有 Reset 与 "Save & apply"。</li><li>**H17 成立：** clean 状态下没有全部重试；"Save & apply" 既无 `aria-disabled` 也无 `disabled`。</li><li>**迭代：** 用满 3/3。before1、before2 的 App 挂载渲染为空树（31 个 precondition），已标注为已取代。before3 只把 `RouterProvider` 的导入从 `react-router/dom` 改为 `react-router`，harness 即有效。</li><li>**总控裁定（harness 偏差）：** 接受内存 data router（与冻结的 Sol harness 相同），也接受从 `react-router` 导入 `RouterProvider`。runner 把 `react-router` 固定为单一实例；`react-router/dom` 子路径会解析到另一份副本，而该包装层只多一个 `flushSync`。真实浏览器里的组合由 native 证据覆盖。fixed 重跑（E8）须使用同一冻结 harness，最终 acceptance 复核。</li><li>**总控核对：** 7 个文件均为新增，且在允许目录内；worktree clean；README hash `61d3b101…`，其余文件的 hash 都写在 README 中；计数、precondition 行、lockfile 与 resolved SHA 由总控复核。</li></ul> |
| E4–E5 native before 与 Appearance F1 before | `72538d1`（独立父级 native 验证者；63 个新增文件：`web-appearance-recovery-native/` 58 个，含 47 张截图；`web-appearance-recovery-f1/` 5 个）。<ul><li>**运行环境：**<ul><li>Chrome 154.0.8037.97（headless）；只有 auth session 为合成；页面网络请求为 0。</li><li>不可变的 `5cd63ff` archive；lockfile gate 与合同 r3 hash 每次运行都一致；19 个源文件一致。</li><li>native bundle 的 1013 个输入中，621 个来自 archive，外来输入为 0；320 处 `@repo` 解析都固定到 archive，守卫违规为 0。</li><li>冻结的 F1 prelude `67bbfaa7…` 只读复用，并校验了 hash。</li><li>九个运行在 before1 一次有效。</li></ul></li><li>**E4（EN 与 ZH）：**<ul><li>H3、H5 成立。</li><li>H6：恰好 10 个值会让 `/app` 进入 "Route Error (app)"：合同列出的 9 个值，加上 `"EN"`。另一个 document 向运行中的 App 写入 `Infinity` 也会崩溃。</li><li>H10 成立。</li><li>H14(a)：EN 成立（Graphite 卡片越界，pane 溢出 91px），ZH 被推翻（所有控件都放得下）。</li><li>H14(b) 成立：768×1024 下，宠物在滚动范围的顶部与末尾都盖住 "Save & apply"/"保存生效" 的中心。</li><li>H15 成立：对失败的强调色 0 次尝试；语言、主题、密度被重写，其中密度是在持锁期间写入的；被拒的字号写入被吞掉；闪现 1817ms。按 K-1，这个时长是在伪造按键流中测得的，干净重跑为 1783ms/108 帧，结论不变。</li><li>H17 成立：clean 状态下 27 次可信 Tab 后激活，恰好 4 次根键 `setItem`，注册键为 0，并闪现。</li><li>执行者逐张人工审查了 47 张截图。</li></ul></li><li>**E5：**<ul><li>`selfcheck` harness-valid：134 项检查，pc1–pc4 均通过。</li><li>`appearance` 为 before-correct：a1 `before-absent`、a2 `before-no-indicator`、a3 `before-no-appearance-step`、a4 `before-unprotected`。</li><li>F1 签名（重复 `proceed()`、非 live 调用、非法转换、runtime error）均为 0。</li></ul></li><li>**总控核对：**<ul><li>63 个文件均为新增，且在两个允许目录内；worktree clean。</li><li>两份回执（`1040306d…`、`ddd1f492…`）列全了其余文件的 hash。</li><li>总控亲自查看了 ZH 768 滚动到底的截图（宠物盖住"保存生效"右半，"恢复默认"未被盖）与 H6 `Infinity` 截图（整个 App 显示 "Route Error (app)"），均与日志一致。</li></ul></li><li>**执行者交回前改写过一次提交：** 改写前的对象 `17672dd` 从未 push；worktree 删除后不再被任何 reflog 引用。</li></ul> |
| 总控裁定（批次 39，2026-10-04） | <ol><li>**开发探测：** 正式运行前的探测属于 harness 开发，不计入"诊断迭代不超过 3 轮"。该上限针对冻结的证据运行，与 Features E4/E5 先例一致。前提是探测必须在回执中如实披露，本批已披露；探测日志未提交，可以接受。</li><li>**H14(a)：** 按语言分别记录，EN 成立、ZH 被推翻。</li><li>**pane 镜像观察：** native 新加载后 pane 镜像显示默认值，`<html>` 却应用了已存储的值，与 Sol jsdom 的观察 7 相反。这加强了 H5/H17：clean 状态的 "Save & apply" 会把已存储的 dark/compact/1.1 改回默认。fixed 产品须在 jsdom 与 native 两层都显示已存储的真实值。Terra 与最终 acceptance 须知晓。</li><li>**host 行 m 的解读：** 接受 a1 oracle 的读法。"一次 live `proceed()`" 理解为恰好一次释放：POP 时为一次 live `proceed()`，程序化导航时为一次 `router.navigate` 重放（`departureCoordinator.tsx:131–156`），且非 live 调用为 0、提交恰好一次。这与 F1 关注的重复释放一致，最终 acceptance 复核。</li><li>**非阻断观察：** 两项都不属本 caller 的修复范围，后续另行诊断。<ul><li>登出确认后 AvatarMenu 仍打开，其 scrim 拦截指针输入。这是既有问题，AvatarMenu 受保护。</li><li>native composition 中 `/app/tasks` 显示一个与本 caller 无关的 Tasks 保存失败横幅，因此 H3 改在 `/app/calendar` 上运行。</li></ul></li></ol> |
| Terra 实施（E6） | `24073b5` `fix(settings): recover Appearance preferences with Retry all`（父 `94f8cf8`）+ `4874170` 运行记录（`web-appearance-recovery-terra/` 下 10 个新增文件：`implementation.md` 与 9 份自检原始日志）。<ul><li>**diff：** 相对 `5cd63ff` 恰好 24 个产品文件，全部在合同 r3 §11 内（+3589/−666）：<ul><li>Appearance 包：pane、增量的 types 与 index、4 个新 internal 模块、只做追加的 styles.css、测试、文档；</li><li>shell：Topbar、Shell、types、Topbar 测试、api.md；</li><li>`App.tsx`，以及新的 `App.appearance.test.tsx`。</li></ul>无 `package.json` 或 lockfile 变化。</li><li>**自检：** 三个包的测试、typecheck、lint 全部 exit 0：Appearance 126/126，shell 115/115，web 178/178。</li><li>**冻结 runner 预检（日志未提交，已披露）：**<ul><li>Sol 的 bytes、fields、reset、queues、host、retry-all、original 全部 PASS；</li><li>continuity-export 为 24/26：case 006、007 失败，即争议 OE-1、OE-2；</li><li>父级 host 33/33；</li><li>F1 selfcheck 有效；F1 appearance 为 fixed-pass，a1–a4 的 F1 签名为 0。</li></ul></li><li>**总控核对：**<ul><li>产品提交只改 `apps`、`packages`；记录提交只在 terra 目录新增文件；</li><li>受保护路径 diff 为空（storage、settings-shell、tokens、pet、CmdK、core、routes、`main.tsx`、`apps/desktop`、AvatarMenu、AppRail、`package.json`、lockfile）；</li><li>worktree clean。</li></ul></li><li>**过程违规（已披露，影响已评估）：** 执行者早期用 `preview_start` 在**主检出**里启动了 dev server，Vite 改写了主检出中被 git 忽略的 `apps/web/node_modules/.vite` 缓存（修改时间 2026-10-05 00:23）。<ul><li>主检出的跟踪文件没有变化。</li><li>证据 runner 从 archive 运行，不使用该 dev-server 缓存。</li><li>总控不删除这个缓存。</li><li>今后的实施批次须明确：禁止在主检出启动 dev server，只能用 worktree 内的 server。</li></ul></li><li>**总控裁定（Topbar 状态断点）：** 合同第 606 行的规则是"在 Topbar 摘要可见处显示文字"。括号里的"above 760 px"漏了 `layout.css:2061–2063`：摘要在 641–767px 也隐藏。实现按摘要实际可见性，从 768px 起显示文字，与规则一致，接受。括号中的数字记为合同勘误，E14 视觉须按实际断点检查 761–767px。</li></ul> |
| 冻结 oracle 争议 OE-1、OE-2（2026-10-05） | Terra 按停止条件上报：不改 oracle，也不迁就实现。<ul><li>**OE-1：** `continuity-export.test.tsx` case 006，即 L180–193 的 INV"无关的账户锁不拖延 device 编辑或 reset"。<ul><li>oracle 在挂载**之后**用原生 setter 写入 rail=`top`、bg=`peach`，没有 StorageEvent，然后期望 Reset 删除它们。</li><li>fixed 版本把这两个未被观察到的外部字节当作冲突保留，合同 §6 写明"A conflict preserves the external bytes"。</li><li>该 INV 在 before 上 PASS：before 版本的 reset 不检测冲突。</li><li>总控初步判断：oracle 的准备步骤无意中制造了冲突，属 oracle 缺陷。</li></ul></li><li>**OE-2：** case 007，即 L195–221。<ul><li>先提交强调色 295，再选 Mist 且只有 bg 写入失败；oracle 期望强调色仍为 `"295"`。</li><li>合同 §2（`:110–117`）与 §5 第 4 项规定，背景选择会同步建立 `bgTone` 与 `accentHue`（该色调的色相）两个意图，它们各自结算，所以强调色合法地变为 `"230"`。</li><li>before 版本在更早的业务断言（§7.3 beforeunload）上正确失败，从未执行到这条期望。</li><li>总控初步判断：最后的期望与合同矛盾，属 oracle 缺陷。</li></ul></li><li>**处理：** 按 F-B002 先例，交独立 Sol 复核并取证（批次 41），可以推翻总控的初步判断；冻结的原 oracle 不改。</li></ul> |
| OE-1、OE-2 判定（批次 41） | `26cfce8`（独立 Sol；`web-appearance-recovery-oracle-erratum/` 下 15 个新增文件，回执 `review-oe.md` `63e7eed0…`）。<ul><li>**OE-1 为 oracle 缺陷。** 挂载后的原生写入没有被绑定观察到，按合同必须作为冲突保留。依据：<ul><li>合同：§5 第 6 项（`:536–537`）；§5 接口规则，即精确 baseline、无 storage 预检、不强制 rebase（`:481`、`:483–484`）；§6（`:661`）；A2.3（`:334`）。</li><li>源码：引擎在两个版本上逐字节相同。reset 以最后观察到的字节为 baseline（`usePrefAsync.ts:177`）；当前字节不同时，`prefMutation.ts:199–202` 以冲突拒绝。</li><li>before 能 PASS，只是因为旧的 `removePref` 无条件删除（`storage.ts:257–258`）。</li></ul></li><li>**OE-2 为 oracle 缺陷。** 背景选择会同时写入色调的色相，Mist 的色相为 230（`constants.ts:25`）。两个版本都提交了 `xai_accent_hue=230`，"295" 在任一版本上都从未出现。</li><li>**冻结套件内部本就矛盾：** `reset.test.tsx:330–346` 断言外部替换是被保留的冲突；`fields.test.tsx:415–425` 对同一序列断言 `"230"`。</li><li>**纠正副本：**<ul><li>case 006：两行 `seedValue` 原样移到挂载之前，账户锁仍全程持有；</li><li>case 007：期望值由 `"295"` 改为 `"230"`，消息不变。</li><li>其余逐字相同。</li></ul></li><li>**运行：**<ul><li>纠正副本在 `5cd63ff` 上 4/22：case 006 PASS；case 007 仍失败于原来的 §7.3 beforeunload 行。</li><li>纠正副本在 `24073b5` 上 26/26。</li><li>冻结原件在 `24073b5` 上 24/26，复现了 Terra 的预检。</li><li>其余 24 个 case 在两份文件、两个版本上结果一致，并经脚本机械比对；precondition 为 0。</li></ul></li><li>**扫描：** 7 个 Sol oracle、Sol fixture 与父级 host oracle 中，同类问题只有这两处。</li><li>**总控核对：**<ul><li>15 个文件均为新增，且在允许目录内；回执列全了 hash。</li><li>总控自行对比了 diff，确认恰好只有上述三处变化。</li><li>总控复核了三份权威日志的计数与 precondition，并确认上面引用的两处冻结断言确实存在。</li></ul></li><li>**总控裁定（E7 的用法，与 C-FB002 先例一致）：**<ul><li>E7 的 `continuity-export` 以冻结原件为主。冻结原件在 fixed 上的失败只能是 OE-1、OE-2 两个签名。</li><li>这两个 case 以纠正副本 `continuity-export.corrected.test.tsx` 为准，须 26/26。</li><li>其余 7 个模式按冻结原件全部 PASS，oracle hash 不变。</li><li>冻结 oracle 不改；今后凡含这个模式的回归，都须同时运行纠正副本。最终 acceptance 复核。</li></ul></li></ul> |
| E7、E8、E16、E17 fixed 重跑 | `31d6335`（独立 Sol；25 个新增文件：24 份 `fixed1` 日志写在各冻结 runner 的目录中，回执 `web-appearance-recovery-sol/fixed-24073b5.md` 为 `59b8b56f…`）。各运行单元一次完成，没有诊断迭代，也没有开发探测。<ul><li>**hash：** 运行前复算了全部 runner、fixture、oracle、纠正副本与合同的 hash，均与冻结回执一致；archive、lockfile gate 与 pin 记录齐全。</li><li>**E7：**<ul><li>结果：bytes 65/65、fields 89/89、reset 34/34、queues 56/56、host 33/33、retry-all 48/48、original 174/174（三次 vitest 调用：126 + 24 + 24）。</li><li>`continuity-export` 冻结原件为 24/26，只失败 OE-1、OE-2，首个失败行与批次 41 逐字节相同；纠正副本 26/26。</li><li>按 E7 裁定：268 个 FAIL→PASS，83 个 PASS→PASS，0 个 PASS→FAIL。四个裁定 5 的 case 都 PASS；E2 所引的 H1–H17 case 在 fixed 上全部 PASS。</li></ul></li><li>**E8：** 父级 host 33/33。29 个 FAIL→PASS，4 个 PASS→PASS，0 个 PASS→FAIL。其中 clean 状态的禁用全部重试 PASS：`aria-disabled`，没有 `disabled`，一个 Tab 停靠点，零存储尝试，焦点保留。</li><li>**E16：** 12 个冻结 F1 运行全部 PASS，runner hash 不变；与 `5cd63ff` 的 fixed1 基线逐项相同，没有 `Invalid blocker state transition`。</li><li>**E17：** Appearance F1 的 selfcheck 有效（134/134）；`appearance` 为 fixed-pass（122/122）。a1 一次 `navigate` 重放释放（裁定 4 的读法）；a2 不被持有且草稿保留；a3 OK 后由协调器持有，Stay 为 `false`；a4 Cancel 为 `false` 且身份不变。F1 签名为 0。</li><li>**总控核对：**<ul><li>25 个文件均为新增，且只有日志与回执；回执列全了 hash。</li><li>Sol、纠正副本与父级 host 的计数，以及 precondition 为 0，由总控逐份复核；`original` 由三次调用合计 174。</li><li>14 份 F1 日志都没有非法转换；sticky、more、collaborate 的 result 都是 `pass:true`，62 项检查。</li></ul></li></ul> |
| E9–E11 native controls、reset 与导出 | `3419542`（独立父级 native 验证者；`web-appearance-recovery-native/` 下 16 个新增文件，回执 `review-controls-reset-export-24073b5.md` 为 `287477b8…`）。<ul><li>**运行环境：** Chrome 154 headless，走 pipe transport；bundle 共 1017 个输入，625 个来自 archive，外来输入为 0；320 处 `@repo` 都固定到 archive；48 个必需模块全部来自 archive；主检出 mtime 扫描为 0 变化。三种模式都在 fixed1 一次通过。</li><li>**E9：** 1345 项检查，产品检查 703 项。<ul><li>40 个值由可信输入写入，字节精确，每值一次写入；背景选择写两次。</li><li>新加载零写入，pane、Topbar 与 `<html>` 一致（总控裁定 3）：重载、浏览器重启、EN/ZH 新 document 都已验证。</li><li>7 个键的 invalid 与 unreadable source-only 状态下，App 始终渲染，包括修复前会崩溃的 `"fr"`、`Infinity`、`"1"`；只提供 Reload，字节从不被重写。</li><li>持锁时 pending，释放后一次写入；uncertainty 恰好一次写入。</li><li>第二 document 冲突的三种形式下，外部字节都被保留。</li><li>pane 与 Topbar 共 14 步，不一致快照为 0。</li></ul></li><li>**E10：** 288 项检查。<ul><li>拒绝确认时零尝试；接受后 6 次删除、0 次写入，语言字节不变，也不读语言键。</li><li>单键与双键故障都给出逐字段结果，并能定向 Retry；uncertainty 恰好一次删除；冲突时外部 `peach` 被保留。</li><li>"Defaults restored." 只在真实全部成功时出现（逐帧检查）。</li><li>无关键快照 ×7 不变；广播、重锁、重挂均为 0。</li></ul></li><li>**E11：** 389 项检查。<ul><li>完全拒绝下，8 种 §8 形态都写到真实磁盘：零存储尝试，object URL 恰好一次创建并撤销，anchor 点击一次后移除，草稿、状态行、Topbar 状态与 unload 警告都正确。</li><li>两种 setup 失败都有本地化错误，失败后的恢复导出正确。</li><li>9 份 JSON 均与期望一致，经 runner 与独立重新解析双重核对。</li></ul></li><li>**开发探测（已披露，未提交）：** reset、controls、export 分别跑了 3、6、3 轮。正式运行前修复了四个 harness 问题，没有削弱断言：<ul><li>Node 到 Chrome 的 WebSocket 掉线，改用 pipe transport，并为每次页面调用设上限；</li><li>Windows 键码作 `nativeVirtualKeyCode` 时 Chrome 持续产生可信 keydown（约 3500 次/秒），改为去掉该字段，并审计只有 runner 自己的按键到达；</li><li>网络审计把自检探针计入了，改为单独计数；</li><li>对话框或布局变化后增加一次 hit-test 重测。</li></ul></li><li>**总控核对：** 16 个文件均为新增，且在允许目录内；回执列全了 hash；三份日志的 result 记录均为 `pass`、`harnessValid`，runtime error 与 console 警告均为 0。</li></ul> |
| 证据完整性问题 K-1（2026-10-05） | **问题：** 批次 43 发现，在 macOS 上把 Windows 键码作为 CDP `Input.dispatchKeyEvent` 的 `nativeVirtualKeyCode` 发送时，Chrome 会持续产生可信 keydown 事件（`Unidentified`/`Minus`）。<ul><li>**涉及的已提交 runner**（总控检索确认）：<ul><li>`web-appearance-recovery-native/verify-native-before.mjs`，即 Appearance E4 before；</li><li>`web-appearance-recovery-f1/verify-f1-appearance.mjs`，即 Appearance E5 与 E17；</li><li>`web-date-time-recovery-native/verify-native.mjs`，属已接受的 Date & Time。</li></ul></li><li>**不受影响：** Features 的 native runner 没有这种写法，已接受的 Features 键盘证据（E15）不在其列。</li><li>**现状：** 这些证据的现有结论看起来合理，但"夹杂了伪造按键事件"并未被排除。证据完整性不能靠推测，因此冻结为 K-1，交批次 44 独立评估。</li><li>**今后：** 所有 native 批次须去掉 `nativeVirtualKeyCode`，并审计只有 runner 自己的按键到达。</li></ul> |
| K-1 评估结果（批次 44） | `6b9f0ee`（独立 Sol；`web-native-keyinput-k1/` 下 82 个新增文件，回执 `review-k1.md` 为 `18a98325…`）。结论：**NO-CONCLUSION-CHANGE**。<ul><li>**复现：** 在同一台 macOS、同一 Chrome 154 构建上，问题属实，触发条件是页面未消费的 keyDown 带有该字段。<ul><li>Escape 27（macOS 上即 `kVK_ANSI_Minus`）与 ArrowRight 39，在 11 种焦点环境中有 9 种产生持续的伪造 keydown，约 2200–3300 次/秒，直到 document 被替换，并会跟随前台标签页；</li><li>Tab 9 从不产生；</li><li>伪造事件从未改变任何文本输入、滑块、select、按钮或模态对话框。</li></ul></li><li>**受影响的运行：** 真实 App 中复现出的伪造事件数量：<ul><li>E4 h3：只在 Escape 与重载之间出现，判定都在其外；</li><li>h5、h15：判定是在按键流期间做出的；</li><li>h10：按键流跟随前台标签页进入 document A；</li><li>h17：为 0；</li><li>F1 的 a1、a3、a4：在按键流期间运行；</li><li>已提交的 h15 日志本身留有痕迹：序号比干净重跑高出约 1470。</li></ul></li><li>**逐项比较：** 用去掉该字段、并加按键审计的 runner 副本，在同一 SHA 上重跑，与已提交日志逐项比较，共 18 组。precondition 序列、结论与用例结果全部一致。唯一差异在 h15 的 4 条证据记录：序号，以及 "Saved" 闪现的帧数（110/1817ms 对 108/1783ms），H15 的结论不变。</li><li>**分类：**<ul><li>E4 h3、h5、h10、h15，E5 与 E17：受影响但结论不变；</li><li>E4 h6、h14、h17：不受影响；</li><li>已接受的 Date & Time 全部 109 份日志：不受影响。它的 typeahead 只发送到已聚焦的 select，自身 trace 中伪造事件为 0。</li></ul></li><li>**总控核对：** 82 个文件均为新增，且在允许目录内；回执列全了 hash；冻结的 runner 与日志都未改动。比较日志 18 组中，标为不一致的字段为 0；总控查看了 h15 的差异记录，确实只有序号与帧数。</li><li>**总控裁定：**<ul><li>冻结日志仍是权威证据，K-1 的修正重跑作为补充证据；</li><li>最终回归回执（E27）与最终 acceptance 须引用 `review-k1.md`；</li><li>今后所有 native runner 都去掉 `nativeVirtualKeyCode`（不要改用 macOS 正确的键码，那样会重放真实按键），并做按键审计；</li><li>Date & Time 的接受不受影响，无需复审。</li></ul></li></ul> |
| E12、E13、E26 native host、downstream 与全部重试 | `32e6753`（独立父级 native 验证者；`web-appearance-recovery-native/` 下 29 个新增文件，回执 `review-host-downstream-retryall-24073b5.md` 为 `ea10ba23…`）。<ul><li>**运行环境：** Chrome 154 走 pipe transport；fixed bundle 共 1017 个输入，外来输入为 0，53 个必需模块全部来自 archive；主检出 mtime 扫描为 0 变化。<ul><li>行 h 的 coordinator 分支，在 auth session context 内用了一个合成的 generation coordinator（已披露，对应 E3 中的 `vi.mock`）。</li><li>三种模式都在 fixed1 一次通过，runtime error 与 console 警告均为 0。</li><li>按键审计：host、downstream、retryall 三种模式中，到达的按键事件与预期一致，失配为空，没有事件带 `nativeVirtualKeyCode`。</li></ul></li><li>**E12：** 1956 项检查。行 a–s 全部 PASS，并记录了 history 计数。其中：<ul><li>行 m 由一次 `router.navigate` 重放恰好释放一次，非 live 调用为 0，提交一次（裁定 4）；</li><li>行 l 中，33 个畸形值与 7 种抛错读取都不会导致导航或错误；</li><li>行 r：pass 打开时登出，Cancel 不改变状态，OK 走 auth replace；</li><li>行 s：禁用的全部重试在 5 种状态下都正确。</li></ul></li><li>**E13：** 1768 项检查。<ul><li>新写入的字节可被 `readLocalPref` 等旧读者读回；5cd63ff 写入的字节在 fixed 上零写入即可读出。</li><li>33 个畸形值在加载时都能渲染：10 个 E4 崩溃值在 `/app/tasks` 与 Appearance pane 上都检查过，其中 6 个另在 ZH 下复查；另一 document 向运行中的 App 写入 9 个畸形值（含 `Infinity`），都没有到达路由错误页。</li><li>7 个字段跨 document 实时传播。</li><li>clean 状态 chrome 与 `5cd63ff` 的 42 项比较全部相同。</li><li>隔离：12 项操作中 `StorageEvent`、`preference-changed` 与 `key:null` 均为 0；无关键、Features 的 rail/路由/搜索与宠物位置均不变。</li></ul></li><li>**E26：** 521 项检查，EN 与 ZH。<ul><li>六种失败来源都覆盖到，每个成员恰好一次尝试，非成员为 0；</li><li>逐帧检查：成员 pending 或失败时，从未出现成功行；</li><li>全部成功后，按钮仍渲染并变为 `aria-disabled`，不挂描述，焦点留在按钮上，没有 Topbar 状态，`beforeunload` 已移除；</li><li>部分结果时显示计数行，焦点保留，Topbar 状态出现；</li><li>持锁时第二次激活无效，可被 Topbar 选择取代，Discard 后迟到的完成被忽略；</li><li>没有 "Save & apply" 与 "Saved"/"已保存"。</li></ul></li><li>**非阻断观察：** 每次 App 挂载都会写两个七键之外的键：auth provider 的身份变更键，以及 supabase-js 的 `lswt-` 探针。两者来自两个版本中逐字节相同的代码，属既有行为，不在本 caller 范围内。</li><li>**总控核对：**<ul><li>29 个文件均为新增，且在允许目录内；回执列全了 hash。</li><li>三份日志的 result 记录均为 `pass`、`harnessValid`，runtime error 与 console 警告均为 0；按键审计 precondition 均通过。</li><li>总控亲自查看了 ZH 部分结果截图：字段恢复块、Topbar "未保存"、计数行、左对齐的全部重试、导出、放弃全部，Reset 单独一行；底部区域远离右下角的宠物。均与日志一致。</li></ul></li></ul> |
| 真实产品失败 F-APP-1（批次 46，2026-10-05） | `5307b6f`（独立视觉与键盘验证者；native 目录 29 个新增文件，回执 `review-visual-keyboard-24073b5.md` 为 `f0d6e7af…`）。判定为 **FAIL**，按停止规则冻结后停下。<ul><li>**复现：**<ul><li>字体大小（字体大小/Font scale）滑块可以通过 Tab 获得焦点，也匹配 `:focus-visible`，但计算出的 `outline-style` 为 `none`。</li><li>聚焦时的截图与焦点移走后的截图逐字节相同：EN `3a90a477…`，ZH `a1343047…`。</li><li>正向对照：色相滑块的焦点环会改变像素。</li><li>四次 Tab 遍历都只在这一个停靠点失败，例如 EN clean 为 58/59。</li></ul></li><li>**根因（总控在源码中核实）：** `plugin-web-tokens/src/layout.css:1353–1360` 的 `.slider-row input[type="range"] { …; outline: none }`，优先级 (0,2,1)，覆盖了 `tokens.css:246–253` 的 `input:focus-visible`，优先级 (0,1,1)。<ul><li>`.slider-row` 在全产品中只出现在 `AppearancePane.tsx:361`（字体大小）；色相滑块用的是 `.accent-slider-row`，所以不受影响。</li><li>tokens 包在 `5cd63ff` 与 `24073b5` 之间没有变化，属修复前就有的缺陷。</li></ul></li><li>**违反的条款：** 合同 §9 Keyboard 要求可信 Tab 到达的每个控件都有可见焦点（E15、gate 8）。</li><li>**其他结果：** E15 的其余检查全部 PASS，按键审计无失配，runtime error 与 console 警告均为 0。E14 只做了开发探测，不作证据。</li><li>**总控核对：** 29 个文件均为新增，且在允许目录内；回执列全了 hash；根因由总控在 `24073b5` 源码中逐行核实。</li><li>**总控裁定：**<ol><li>**归属：** F-APP-1 是本 caller 界面上的真实产品缺陷，合同 §9 要求修复，归 CP-APPEARANCE-01。</li><li>**修复位置：** `packages/xai-web-settings-appearance/src/styles.css`，只追加一条限定在 `.appearance-pane` 下的规则，例如 `.appearance-pane .slider-row input[type="range"]:focus-visible`，恢复与 `tokens.css:246–253` 相同的焦点环。这一位置在合同 §11 与 §9 的 scope 内。受保护的 tokens `layout.css` 不改；其中 `outline: none` 这一根因记为 tokens 与 a11y 的后续项，目前没有其他使用方。</li><li>**正确 oracle：** E15 的 Tab 遍历中，每个停靠点都有可见焦点：计算出的 outline 不为 none，且聚焦与未聚焦的截图像素不同。字体大小滑块的焦点环须与全局焦点环一致。</li><li>**修复后的证据：**<ul><li>E14–E15 在新的 fixed SHA 上全量运行，用新后缀。</li><li>已在 `24073b5` 产出的 E7–E13、E16、E17、E26 是否仍然适用，由最终回归的 delta 审计证明：新 SHA 相对 `24073b5` 必须只多出 `styles.css` 中的这条追加规则，JS bundle 逐字节相同（outline 不占布局，不影响 hit-test）；同时以较低成本在新 SHA 上重跑 E7、E8、E16、E17。最终 acceptance 复核这项沿用。</li></ul></li></ol></li><li>**对执行者其他问题的裁定：**<ol><li>Appearance 样式表在打包 CSS 中位置提前，有 18 个样式表改到其后。重跑 E14 时须做层叠顺序审计，确认这 18 个样式表都没有覆盖 Appearance 规则。E13 的 clean chrome 42 项比较已全部相同。</li><li>44×44 只适用于本 caller 新增或改动的目标：全部重试、恢复控件、Reset、导出、放弃全部与 Topbar 状态。Topbar 原有的搜索框与触发器在 1440px 下高 36px，属既有尺寸，按与 `5cd63ff` 相比无退化判定。</li><li>1024×768 时页面本身可以滚动（926px 高），A2.8 末端探测在页面顶部与末端各做一次，接受。</li><li>Space 检查容许滚动锚定与小于半个滚动视口的钳位：这一放宽在证据运行前做出、已披露，且有正向对照证明真实滚动能被捕获，接受，最终 acceptance 复核。</li></ol></li></ul> |
| F-APP-1 修复（批次 47） | `5bbf473` `fix(settings): show focus ring on Appearance font scale slider`（父 `9b76076`）+ `0d34bf2` 运行记录（terra 目录新增 7 个文件：`implementation-r2.md` 与 6 份 `r2-` 日志）。<ul><li>**修复：** 在 `styles.css` 末尾追加 `.appearance-pane .slider-row input[type="range"]:focus-visible`，优先级 (0,4,1)，不在任何 at-rule 内，声明与 `tokens.css:251–252` 逐字节相同。</li><li>**守卫测试：** 新增 `AppearancePane.focus-ring.test.tsx`，共 4 项：规则存在；焦点环与全局规则一致；优先级高于 `layout.css` 中设置 outline 的规则；选择器恰好匹配字体大小滑块。对修复前的样式表运行时，第 1 项失败。</li><li>**自检：** Appearance 包 130/130（原 126 加新增 4）、typecheck、lint（0 warning）；web 178/178；全部 exit 0。</li><li>**native 预检（日志未提交，已披露）：** 在 EN 1024 与 ZH 375 下，聚焦时 outline 为 `solid 2px`，与色相滑块的全局焦点环一致，聚焦与未聚焦的截图不同。负向对照复现了批次 46 冻结的 hash。runtime error 为 0。</li><li>**总控核对：**<ul><li>产品 diff 相对 `24073b5` 只有 `styles.css`（+9/−0）与新测试（+169）；</li><li>按 `24073b5` 的长度截取新 `styles.css` 的前缀，其 hash 等于旧文件 hash，确认原有规则逐字节未变；</li><li>记录提交只在 terra 目录新增文件；worktree 与主检出均 clean。</li></ul></li><li>**总控裁定：**<ol><li>守卫测试第 3 项会在 tokens 后续项移除 `outline: none` 时有意失败，目的是提醒届时重新审视这条 pane 规则。接受；该后续项须连同这项测试一起处理。</li><li>`docs/test.md` 未列入新测试，是因为批次 47 的范围禁止改动其他文件。记为非阻断的文档后续项，最终 acceptance 判断。</li><li>冻结 runner 硬编码了 `24073b5` 与 24 个文件的期望 delta。批次 48 须在新文件中写 runner 副本，期望 delta 相对 `5cd63ff` 为 25 个文件；冻结 runner 不改。</li></ol></li></ul> |
| 真实产品失败 F-APP-2（批次 48，2026-10-05） | `bacdbbc`（独立视觉与键盘验证者；native 目录 77 个新增文件，回执 `review-visual-keyboard-5bbf473.md` 为 `7095689b…`）。判定为 **FAIL**，按停止规则冻结后停下。<ul><li>**F-APP-1 已确认修复：** 字体大小滑块聚焦时为 `solid 2px`，与色相滑块的焦点环相同；EN 与 ZH 下聚焦与失焦的截图都不同；在 `5cd63ff` 上仍复现冻结的相同 hash。</li><li>**复现：** 当前选中的强调色色块带 `.active` 类。<ul><li>聚焦时它匹配 `:focus-visible`，但 outline 仍是选中环 `solid 2px var(--text-1)`，不随焦点变化。</li><li>聚焦截图与焦点移出色块行后的截图逐字节相同：默认 Sage 下 EN `a9a8821f…`、ZH `300ff1da…`；选中 230 Ocean 时 EN `e9af9a97…`、ZH `5bdf828d…`。</li><li>正向对照：未选中色块的焦点环会改变 537–587 个像素。</li><li>EN 与 ZH 各 5 项产品检查失败：2 项色块复现，加上 3 次 Tab 遍历各在这一站失败。其余 E15 全部 PASS。</li></ul></li><li>**根因（总控在源码中核实）：** `.accent-sw.active { outline: 2px solid var(--text-1); outline-offset: 2px }`，优先级 (0,2,0)，覆盖了 `tokens.css:246–253` 的 `button:focus-visible`，优先级 (0,1,1)。这条规则有两份，都自 `5cd63ff` 起就存在：<ul><li>受保护的 `plugin-web-tokens/src/layout.css:1437–1440`；</li><li>Appearance 的 `styles.css:116–119`。</li></ul></li><li>**违反的条款：** 合同 §9 Keyboard（E15，gate 8）。</li><li>**批次 46 为何没发现：** 它的"outline ≥2px"检查与整块截图比较都会把这种情况判为通过。批次 48 改为按每个停靠点自身的环或盒做像素比较，才查出来。</li><li>**其他观察（非本 caller 范围）：** shell 的 AppRail 停靠点"任务"，其焦点环大部分被 rail 滚动容器裁掉，自身盒子变化 81px；开发截图中可见焦点环。AppRail 受保护，记为后续人工复核项。</li><li>**E14：** 只作为开发探测运行，不作证据；探测中各宽度都未失败，EN 375 溢出已消失，层叠顺序审计中 60775 个计算值变化为 0。</li><li>**总控核对：** 77 个文件均为新增，且在允许目录内；回执列全了 hash；两份日志都是 `harnessValid`，runtime error 为 0；总控逐条列出了失败检查的 ID，确认全部源于选中色块；根因由总控在 `5bbf473` 源码中核实。</li><li>**总控裁定：**<ol><li>**归属：** F-APP-2 与 F-APP-1 同类，归本 caller，在 Appearance `styles.css` 中只追加、限定在 `.appearance-pane` 下修复；受保护的 tokens 不改。</li><li>**修复要求（总控可定的 a11y 细节）：**<ul><li>聚焦且选中的色块，其自身的环或盒在像素上须不同于未聚焦而选中时；</li><li>聚焦时仍能看出选中状态；</li><li>焦点指示使用全局焦点环的颜色与粗细；</li><li>只用 outline 或 box-shadow，不改变布局。</li></ul></li><li>**同类审计：** 连续两次出现同类问题，因此批次 49 须先做全面静态审计。对象是 Appearance pane 内每个可聚焦控件以及 Topbar 状态，在包括 `.active`、`aria-checked` 等选中态在内的每种状态下。须找出所有会遮盖或抵消全局 `:focus-visible` 焦点环的规则，来源包括 tokens 的 `layout.css` 与 `tokens.css`、Appearance 的 `styles.css`、shell CSS。凡属 pane 内的，在同一批中一并修复。</li><li>**修复后的 E15：** 须在每组选项（主题、密度、背景、rail 位置、强调色）的非默认选中状态下，也做逐停靠点的像素焦点遍历。</li></ol></li></ul> |
| F-APP-2 修复与同类审计（批次 49） | `419e56d` `fix(settings): show focus on selected Appearance options`（父 `6fedfd1`）+ `5766c1e` 运行记录（terra 目录新增 7 个文件：`implementation-r3.md` 与 6 份 `r3-` 日志，其中含静态焦点审计）。<ul><li>**修复：** 在 `styles.css` 末尾追加 `.appearance-pane .accent-sw.active:focus-visible`，优先级 (0,4,0)，不需要 `!important`。<ul><li>焦点环使用全局颜色与 2px 粗细，`outline-offset: 4px`；</li><li>选中状态改用紧贴色块的 2px `box-shadow`（`var(--text-1)`）保留，两者之间留 2px 间隙；</li><li>不改变布局；没有其他样式给色块设 box-shadow，因此不会覆盖任何已有效果。</li></ul></li><li>**守卫测试：** 新增 `AppearancePane.selected-focus.test.tsx`。对修复前的样式表运行时 4 项失败，恰好标出两份 `.accent-sw.active`。</li><li>**同类审计：** 三层方法：<ul><li>静态扫描：29 个样式表中 137 条 outline 或 focus 规则；</li><li>浏览器匹配：4 种配置共 484 条记录；</li><li>Chrome CSSOM。</li></ul>结论：pane 内只有两处遮盖，选中色块即 F-APP-2（本批修复），字体大小滑块即 F-APP-1（已修复）。其余控件都没有遮盖：语言与密度分段只加 box-shadow 与背景；主题、背景、rail 卡片只改 border-color；未选中色块与色相滑块的规则优先级低于全局焦点环；各按钮与 Topbar 状态只匹配全局焦点环；没有祖先元素裁剪焦点环。</li><li>**自检：** Appearance 包 137/137（原 130 加新增 7）、typecheck、lint；web 178/178；全部 exit 0。</li><li>**native 预检（日志未提交，已披露）：** 覆盖 EN/ZH × 浅色/深色 4 种配置，每组选项的每个选项都以键盘选中，非默认选项优先。<ul><li>负向对照（`5bbf473` 样式表）恰好 24 处失败，全部是选中色块；</li><li>修复后为 0 失败。</li></ul></li><li>**过程披露：** 执行者第一次运行时卡住，看门狗未能恢复。总控只读核实了它的半成品 worktree（仅 `styles.css` 一处未提交追加），然后通过 SendMessage 恢复同一窗口完成。执行者另外披露：产品提交信息中"29 个 Web 样式表"实为 28 个 Web 样式表加 1 个 desktop 专用文件，为保持 SHA 未修改。</li><li>**总控核对：**<ul><li>产品 diff 相对 `5bbf473` 只有 `styles.css`（+13）与新测试（+331）；</li><li>新 `styles.css` 的前缀与 `5bbf473` 版本逐字节相同；</li><li>记录提交只在 terra 目录新增文件；</li><li>相对 `5cd63ff` 共 26 个文件。</li></ul></li><li>**总控裁定：**<ol><li>**F-APP-3（Topbar 弹层选项焦点）：** 快速切换弹层中已勾选的 `menuitemradio` 选项，聚焦时像素变化为 0；未勾选的只有很淡的底色。原因是 `layout.css:453–457` 的 `:focus-visible { outline: none }`，加上 `:459–463` 的 `[aria-checked="true"]` 覆盖了底色；修复前后相同，属既有缺陷。合同把弹层列为保持不变的 chrome：第 193 行列出其角色与选项；第 858 行写明键盘行为不变；第 888 行把弹层打开时的 Topbar `outerHTML` 纳入不变性比较；第 1214 行把弹层内容改动列为排除项。因此 F-APP-3 不在本 caller 的修复范围内，不阻断 CP-APPEARANCE-01，记为 UX-05（键盘、焦点、对比度验收）的后续项。批次 50 须把它作为观察冻结成已提交的证据，不设 gate；最终 acceptance 确认或推翻。</li><li>**tokens 后续项（并入 UX-05）：** 已经由 pane 内规则覆盖、但根因仍在 tokens 的三处：<ul><li>`layout.css` 中的 `.accent-sw.active` 与 `.slider-row input[type="range"] { outline: none }`；</li><li>`styles.css:116–119` 的重复规则；</li><li>弹层的 `outline: none`。</li></ul>两个守卫测试都有意与这些规则耦合，处理后续项时须一并更新。</li><li>**文档后续项：** `docs/test.md` 尚未列入这两个守卫测试，为非阻断的文档后续项。</li></ol></li></ul> |
| E14–E15（`419e56d`，批次 50） | `2696855`（独立视觉与键盘验证者；native 目录 161 个新增文件：runner 副本与 diff、4 份日志、154 张截图、回执 `review-visual-keyboard-419e56d.md` 为 `89ee14cd…`）。<ul><li>**runner：** 相对批次 48 只改了 9 行，都与 SHA 有关；新增 502 行，用于新增的证据要求；没有删除或削弱任何检查。四种模式都在 fixed1 一次通过，runtime error 与 console 警告均为 0，按键审计无失配。</li><li>**E14（EN/ZH 各 3437 项检查）：**<ul><li>宠物隐藏时，5 个宽度上没有失败；EN 375 溢出已消失（pane 289/289，`5cd63ff` 为 380/289）。</li><li>全部重试 gate：每种语言 402 项，与宠物盒相距 145.81–729.81px。</li><li>宠物显示时，没有任何 caller 控件被遮挡。</li><li>Topbar 断点：761 与 767px 只显示图标，768px 起显示文字。</li><li>选择器审计：17 个新增选择器全部在 scope 内。层叠顺序审计：60775 个计算值变化为 0。</li><li>禁用态对比度：浅色 3.795–4.084，深色 4.54–5.078。</li></ul></li><li>**E15（EN 1398、ZH 1468 项）：**<ul><li>合同 §9 的键盘要求与全部重试的各项要求全部 PASS。</li><li>逐停靠点的像素焦点遍历共 1000 个停靠点，失败为 0，覆盖：每组选项的非默认选中状态；两个滑块的非默认值；clean、写入失败与 source 异常三种状态；浅色与深色。</li><li>选中且聚焦的色块与选中而未聚焦时，自身区域相差 830–862 个像素，选中环仍 100% 可见。在 `5cd63ff` 上，两张截图仍逐字节相同。</li></ul></li><li>**F-APP-3 观察（不设 gate）：** 弹层中 12 个已勾选选项聚焦时像素变化为 0；16 个未勾选选项只有对比度 1.163–1.213 的淡色；outline 恒为 none。截图 #85–#96、#143–#154 作为 UX-05 的证据。</li><li>**总控核对：**<ul><li>161 个文件均为新增，且在允许目录内；回执列全了 hash。</li><li>四份日志的 result 记录均为 `pass`、`harnessValid`，runtime error 与 console 警告均为 0。</li><li>总控亲自查看了两张截图：深色主题下聚焦的选中色块（白色选中环在内，强调色焦点环在外，两者都可见）；EN 768 宠物开启、7 项未保存、滚动到底（计数行，左对齐的全部重试、导出、放弃全部，Reset 单独一行，远离宠物；Topbar 显示 "Not saved" 文字）。均与日志一致。</li></ul></li></ul> |
| Required evidence 覆盖核对（G1，2026-10-05） | 合同 r3 §14 共 E1–E27：<ul><li>**已冻结的 before 证据：** E1–E2 `bd09456`；E3 `b997235`；E4–E5 `72538d1`，另有 K-1 补充证据 `6b9f0ee`。</li><li>**E6 Terra：** r1 `24073b5` 与 `4874170`；r2 `5bbf473` 与 `0d34bf2`；r3 `419e56d` 与 `5766c1e`。最终 fixed 为 `419e56d`，相对 `5cd63ff` 共 26 个文件，全部在 §11 内。</li><li>**在 `24073b5` 产出、须在最终回归时重跑或沿用的：**<ul><li>E7、E8、E16、E17（`31d6335`，含 OE 纠正副本 `26cfce8`）：在 `419e56d` 上低成本重跑。</li><li>E9–E11（`3419542`）与 E12、E13、E26（`32e6753`）：由 delta 审计证明可以沿用。`24073b5` 到 `419e56d` 只多出 `styles.css` 的两段追加与两个测试；须证明生产 JS bundle 逐字节相同；CSS 只涉及 `:focus-visible` 的 outline 与 box-shadow，不占布局。</li></ul></li><li>**E14–E15：** `2696855` 在 `419e56d` 上 PASS。此前两次 FAIL（`5307b6f`、`bacdbbc`）作为历史保留。</li><li>**E18–E25 与 E27：** 由批次 51 产出。</li><li>**没有缺失的 ID。**</li></ul> |
| 最终回归 E18–E25 与 E27（批次 51） | `c6d1ed4`（独立 Sol 最终回归验证者；109 个新增文件：`web-appearance-recovery-final/` 下的 runner、对照与 hash 脚本、日志、diagnostics，以及回执 `review-final-regressions-419e56d.md` 为 `094112c3…`；另有带 `appearance-final-v1` 后缀的日志写在各 runner 目录中）。<ul><li>**E18：** 30 个检索模式，102 个变化行全部落在 §11 文件中；禁用拼写为 0；`readLocalPref` 逐字节相同。</li><li>**E19：** 13 个受保护路径全部相同；diff 恰好是 26 个 §11 文件。</li><li>**E20：** storage check-types 无诊断；Sol 生命周期 case PASS。</li><li>**E21：** Appearance 包 11 个文件、137 项，typecheck 与 lint 无问题；合同 §11 列为"Unchanged"的测试在两个 SHA 上结果相同。</li><li>**E22：** shell 包 9 个文件、115 项，check-types 与 lint 无问题。</li><li>**E23：** web 包 29 个文件、178 项，比 `5cd63ff` 的 28/156 只多出 `App.appearance`（22 项）。</li><li>**E24：** 与已接受回执对照，54 项 MATCH、1 项 DIFF（即 F-FD1）。<ul><li>More 的 `boundaries`：冻结 oracle 本次 10/10，纠正 oracle 10/10（C-FB002）；</li><li>Sticky、Notifications、Date & Time、settings-shell 54、settings-rest 44/314，全部一致。</li></ul></li><li>**E25：** Features 的 native downstream 通过副本运行，PASS（140/140 项产品检查，runtime error 为 0）。冻结 runner 在只适用于 `5cd63ff` 的 "fixed delta 只在 features 包" 前置条件上拒绝运行，拒绝日志已提交。</li><li>**delta 审计（21/21）：**<ul><li>`24073b5..419e56d` 恰好是 `styles.css` 的两段追加与两个守卫测试；</li><li>生产 `vite build` 的 12 个 JS 文件逐字节相同；</li><li>重建 E9–E11 与 E12/E13/E26 的 bundle 时，复现了 `24073b5` 记录的 hash；</li><li>CSS 只影响键盘聚焦时字体大小滑块或选中色块的像素，那些 runner 从不读取这些像素。</li></ul>结论：E9–E13 与 E26 可以沿用到 `419e56d`。</li><li>**在 `419e56d` 上重跑并与 `24073b5` 比较：** 26 项 MATCH、0 项 DIFF。<ul><li>E7 逐 case 一致：`continuity-export` 只有 OE 两个签名，纠正副本 26/26；`original` 为 185，即 174 加两个守卫测试的 11 项。</li><li>E8：33/33。</li><li>E16：12 个 F1 运行全部 PASS。bundle hash 的差异来自临时目录深度不同；在相同深度下，JS 完全相同。</li><li>E17：fixed-pass。</li></ul></li><li>**E27：** 逐项列出 E1–E26，执行者重算了全部 590 条已提交工件与 107 个新文件的 hash，来源失败为 0。回执写明 E6 的三轮、E14–E15 的历史，并引用了 K-1、OE、C-FB002、F-APP-1/2/3 与 R-PET。</li><li>**总控核对：**<ul><li>109 个文件都是新增，且在允许路径内；worktree clean。</li><li>总控查看了 F-FD1 纠正副本的 diff：恰好两处，`"sage"`→`"mist"`。纠正副本在两个 SHA 上都是 15/15，冻结原件 14/15。</li><li>总控核实对照汇总为 54 MATCH、1 DIFF。</li><li>总控自行抽算了 E3 host、E12 host、E7/E20 bytes 三个 hash，均出现在回执或 hash 日志中。</li></ul></li><li>**总控裁定：**<ol><li>**F-FD1：** 已接受的 Features Sol `downstream` 的 case 012 写入 `xai_bg_tone="sage"`，并期望 App 显示它。按 Appearance 合同 r3 §5 第 2 项与 A6（总控已确认的严格值域；UI 从未写出过 `sage`），这是畸形值，App 显示默认值是正确行为，即 H7 的修复。因此这不是产品失败。E24 中这个 case 以纠正副本为准。冻结的 Features oracle 不改，Features 的接受保持不变，并附条件 C-FD1：今后的 Features downstream 回归同时运行纠正副本。最终 acceptance 复核。</li><li>**E25 用副本运行：** 接受。冻结 runner 只因一条只适用于 `5cd63ff` 的基线前置条件拒绝运行；副本只把这一条推广为"Features delta 加上 26 个 Appearance §11 文件"，并加了被动的 K-1 按键审计。</li><li>**E17 用 K-1 修正副本：** 接受，与 K-1 裁定一致。</li><li>**冻结 native runner 保留 WebSocket 传输：** 接受，这样 E16 的 runner hash 才能保持不变，且运行中没有掉线。</li></ol></li></ul> |
| 范围 | 7 个 device 键：语言、主题、密度、字号、强调色、背景、rail 位置。<ul><li>三个写入面：Settings pane、`App.tsx` 根偏好 writer、Topbar 快速切换。</li><li>Terra 可改的文件见合同 §11：Appearance 包；shell 的 `Topbar.tsx`、`Shell.tsx`、`types.ts` 与 Topbar 测试；`apps/web` 的 `App.tsx` 与新的 App 测试；运行记录目录 `web-appearance-recovery-terra/`。</li><li>全部在 `web` 模块内，不改 D2 共享层。</li></ul> |
| 312 清单编号 | 关联 SET-02、SHELL-04、REL-05、REL-07、REL-09 等；本任务不关闭任何编号 |
| 风险等级 | `high`：改动宿主 `App.tsx` 与 shell，影响所有 `/app` 路由。<ul><li>H6：一个畸形根值会让整个 `/app` 落入错误页。</li><li>是开放式 async 路径的第一个 device 生产使用方：在这里发现的缺陷按共享缺陷处理。</li></ul> |
| 总控核对 | <ul><li>提交只新增 2 个文件，worktree clean。</li><li>总控在 `5cd63ff` 上逐条核实关键源码事实：<ul><li>`plugin-web-tokens/src/i18n.ts:727–733` 遇不支持的语言抛 `TypeError`；</li><li>`apply.ts:64–69、83–88` 遇非法字号或色相抛 `RangeError`；</li><li>`router.tsx:41–43` 的 `/app` 挂 `RouteErrorBoundary`；</li><li>`App.tsx:98–105` 与 `Topbar.tsx:26–39` 吞掉写入失败；</li><li>`SettingsFooter.tsx:75` 无条件 `setSaved(true)`；</li><li>7 个键在 `accountOwnership.ts` 中均为 device。</li></ul></li><li>Terra 文件清单逐个列出；E1–E26 连续，无缺号。</li></ul> |
| 前置决定 | <ul><li>**B-2 / A2（用户已决定为 (ii)，见上）：** SET-02 原文为"Appearance统一自动保存或编辑后保存语义"，两种方式都写在条目里，属产品负责人的选择。<ul><li>合同按选项 (i) 写成：保留自动保存，去掉 "Save & apply"（Features D3 先例）。</li><li>选 (ii) 或 (iii) 时，须由 Astra 修订合同。</li></ul></li><li>**A1、A3–A9（总控可定）：** 宿主与 shell 范围、App 级单一 controller、开放式 async 路径、保护模型（不加 Settings 路由 guard；Topbar 状态位；App 级 `beforeunload`；登出前确认）、严格值域且只拒绝不修复、Reset 删除 6 个键并保留语言、测试处置、R-PET 判定口径。总控倾向确认，待 B-2 结果后一并确认。</li><li>**其他候选的用户决定（暂不提问，排到对应候选时再提）：** C-1（SET-10）、D-2、E-1（DASH-03）、E-2（SHELL-05）、E-3（SET-03）、F-2（SET-08）。</li></ul> |
| 后续顺序 | ~~用户决定 B-2~~（(ii)）→ ~~批次 35 Astra 修订合同 r2~~（`b2e5eb2`）→ ~~用户决定二~~（始终显示）→ ~~批次 36 r3 修订~~（`706c9a3`）→ ~~总控确认 A1、A3–A9~~ → ~~批次 37 Sol（E1–E2）~~（`bd09456`）→ ~~批次 38 父级 host（E3）~~（`b997235`）→ ~~批次 39 native before 与 Appearance F1（E4–E5）~~（`72538d1`）→ ~~批次 40 Terra~~（`24073b5`、`4874170`）→ ~~批次 41 OE-1/OE-2 复核~~（`26cfce8`）→ ~~批次 42 重跑 E7、E8、E16、E17~~（`31d6335`）→ ~~批次 43 native E9–E11~~（`3419542`）→ ~~批次 44 K-1 评估~~（`6b9f0ee`）→ ~~批次 45 native E12–E13 与 E26~~（`32e6753`）→ ~~批次 46 E14–E15~~（`5307b6f`，FAIL：F-APP-1）→ ~~批次 47 Terra 修复~~（`5bbf473`、`0d34bf2`）→ ~~批次 48 在 `5bbf473` 上的 E14–E15~~（`bacdbbc`，FAIL：F-APP-2）→ ~~批次 49 Terra 修复 F-APP-2 与同类审计~~（`419e56d`、`5766c1e`）→ ~~批次 50 在 `419e56d` 上的 E14–E15~~（`2696855`）→ ~~批次 51 最终回归 E18–E25 与 E27~~（`c6d1ed4`）→ 批次 52 独立最终 acceptance → 批次 46 视觉与键盘 E14–E15 → E1–E5 全部冻结后才授权 Terra → fixed 重跑与 native → 最终回归 E27 → 独立最终 acceptance |

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
| 本提交 | 记录最终回归与 F-FD1 裁定，登记批次 52（独立最终 acceptance） |

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
| 11 | 36–38 | 合同 r3、Sol before oracle、父级 host 基线。后两批各用满 3/3 诊断迭代：Sol 是逐轮补用例与修 harness 假失败；host 前两轮 App 渲染为空树 |
| 12 | 39–41 | native 与 F1 before、Terra 实施、OE-1/OE-2 判定；各一次完成。OE 是 oracle 缺陷，不是产品失败 |
| 13 | 42–44 | fixed 重跑 E7/E8/E16/E17、native E9–E11、K-1 评估；各一次完成。K-1 是证据完整性评估，没有结论改变 |
| 14 | 45–47 | native E12/E13/E26；E14–E15 FAIL，发现 F-APP-1；Terra 修复 F-APP-1 |
| 15 | 48–50 | E14–E15 FAIL，发现 F-APP-2；Terra 修复 F-APP-2 并做同类审计，期间卡住一次，经 SendMessage 恢复；E14–E15 PASS。同类问题连续两次后改为先做全面审计 |

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

批次 52：独立最终 acceptance（Astra 角色，新 reviewer）对 CP-APPEARANCE-01 作出 ACCEPTED、BLOCKED 或 FAIL 的结论。

- **执行者：** 新的独立 Claude Opus 5.5。它不是合同作者，不是 Terra，也不是本 caller 任何一批的验证者。
- **固定点：**
  - fixed `419e56d`，before `5cd63ff`；
  - 合同 r3（`706c9a3`，SHA-256 `ef1b573c…`）；
  - 控制分支基点为本提交。
- **必须做到（合同 §13 Acceptance condition 与 §14 Rules）：**
  - 10 个 gate 逐行对账四类事实：源码、正确的 before 失败、fixed 的独立行为、实际用户界面；
  - E1–E27 每项引用路径与 SHA-256，并自行重算每项至少一个 hash；任何 ID 缺失即 BLOCKED；
  - 阅读 fixed 产品源码（26 个 §11 文件），独立判断是否满足 §5–§10 与 A1–A9；
  - 核实两个产品负责人决定的实现：保留按钮并改为全部重试；按钮始终显示，没有可重试项时 `aria-disabled` 禁用。
- **须明确确认或推翻的事项：**
  1. 合同修订记录 r1→r2→r3，以及总控对 r2、r3 开放问题的裁定；
  2. OE-1 与 OE-2：E7 的 `continuity-export` 以纠正副本为准；
  3. K-1：没有结论改变；E17 与 E25 改用修正副本运行；
  4. E9–E13 与 E26 由 delta 审计沿用到 `419e56d`；
  5. F-APP-1 与 F-APP-2 的修复，以及同类审计；
  6. F-APP-3（Topbar 弹层焦点）不在本 caller 范围内，记为 UX-05；
  7. F-FD1：Features 的 downstream case 012 以纠正副本为准，附条件 C-FD1；
  8. C-FB002：More 的 `boundaries` 以纠正 oracle 为准；
  9. R-PET 规则：只有全部重试受严格 gate；
  10. Topbar 断点勘误：从 768px 起显示文字；
  11. 44×44 只适用于本 caller 新增或改动的目标；
  12. Space 容差，以及 1024 宽度下页面滚动时的探测方式；
  13. 各 harness 偏差：E3 的 router 导入、开发探测不计入迭代、E25 与 E17 的副本、保留 WebSocket 传输；
  14. Topbar 状态与 Terra 实施中的偏差，即合同第 606 行的括号勘误；
  15. `docs/test.md` 未列入两个守卫测试，是否只作为非阻断的文档后续项。
- **输出：** 只新增 `docs/reviews/web-appearance-recovery-acceptance/` 下的文件：ACCEPTED 写 `acceptance-419e56d.md`，BLOCKED 写 `blocked-419e56d.md`；可附 hash 与核对脚本及其日志。
- **结论范围：**
  - caller 接受只覆盖 Appearance recovery caller；
  - 不关闭 SET-02、SHELL-04、SHELL-05、UX-03、UX-04、UX-05、REL-05、REL-07、REL-09 或任何其他 312 编号；
  - 不代表业务或发布完成；
  - 不授权部署、发布、分支提升或 Web→Desktop 同步。
- **禁止：** 修改产品、合同、已有证据、台账或控制面；修复；push；派生子 agent；在主检出启动 dev server 或写入主检出。
- **成本上限：** 不重跑完整矩阵；只在核对确有需要时做针对性的只读复核或单次重跑，输出写入 acceptance 目录。
- **停止条件：** 发现真实产品失败时，冻结复现、影响范围与正确 oracle，写 BLOCKED 或 FAIL 回执后停止。

## 下一步

1. 等待批次 52 回执，总控核对：
   - 只新增文件；
   - 逐 gate 的四类事实对账；
   - E1–E27 的 hash 抽查；
   - 对 15 个事项的明确结论。
2. 若 ACCEPTED：
   - CP-APPEARANCE-01 改为 `accepted`；
   - 另起一批做台账对账：REL-05 追加证据；SET-02 与 SHELL-04 记录 caller 证据，以及用户对 SET-02 的决定；UX-05 追加 F-APP-3 与 tokens 后续项；Features 附加条件 C-FD1；不改状态；
   - 然后刷新库存，选择下一项。
3. 若 BLOCKED：按回执列出的缺口另开补证或修复窗口。
