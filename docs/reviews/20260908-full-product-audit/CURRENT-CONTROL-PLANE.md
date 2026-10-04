# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-04

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`f359be6d838393e0f9e93efd80b88b5b09f6144e`（Sticky caller 实施 + 共享离页协调器 F1 修复）

模块归属：`web`

本轮模式：批次 21 的选择备忘录与合同（`6ded3dc`）已通过总控核对，下一个完整 caller 选定为 Settings → Features（CP-FEATURES-01）。本批登记该 CP 项与总控决定，并启动批次 22：由 Sol 冻结 E1–E2。E1–E5 全部冻结前不得实施。当前 Claude 总控窗口不实施产品或 verifier 修复，也不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `6ded3dc` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。本会话创建的所有隔离 worktree 与临时本地分支均已在快进接收后清理。
- 产品基线依次前进：`2023526` → `210abdf`（合同 §11 的 8 个 Sticky 文件）→ `f359be6`（`departureCoordinator.tsx` 与新测试 `departureCoordinator.blocker.test.tsx`）。共享 storage、shell、widgets、其他宿主文件、其他 caller 与 lockfile 均无变化。
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
| 状态 | `diagnosis_needed`：合同已通过总控核对；before 基线 E1–E5 未冻结；未授权实施 |
| 选择与合同 | 选择备忘录 `docs/reviews/web-next-caller-selection/selection-f359be6.md` 与合同 `docs/reviews/web-features-recovery-contract/contract.md`，提交 `6ded3dc`，作者为独立 Claude Opus 5.5（Astra 角色映射）。比较了 7 个候选：Features 被推荐；Appearance、Integrations、AI、Dashboard、Calendar、Board 均有前置决策或依赖 |
| 312 清单编号 | 支撑 `REL-05`；关联 `REL-07`、`REL-10`、`UX-04`、`UX-05`、`QA-01`、`QA-03`、`QA-04`、`QA-09`。`SET-03`（目录决策）被明确排除。本任务不关闭任何编号 |
| feature / 产品模块 | Settings Features recovery caller / `web`（单一包 `xai-web-settings-features-panel`） |
| 固定产品 SHA | `f359be6d838393e0f9e93efd80b88b5b09f6144e` |
| 归属 | 8 个 `xai_pref_features_*` 键均为 device（`accountOwnership.ts:54–61`），无账户机制 |
| 总控核对 | <ul><li>`FeaturesPane.tsx` 的 Reset 先吞掉 raw remove 错误，再派发 `key: null` 的合成 `StorageEvent`。</li><li>features 包内没有 `registerDepartureGuard`。</li><li>`SettingsFooter` 的 Save 固定闪现 1800ms "Saved"。</li><li>8 个键均为 device。</li><li>合同 §11 的 Terra 文件边界清楚：只限 features 包内 pane、一个 props 字段、两个本地 helper、scoped CSS、测试与文档；所有读者、storage、shell、host 与已接受 caller 受保护。</li><li>§14 列出 E1–E25 统一证据清单，吸取了 G1 的教训。</li></ul> |
| 风险等级 | `high`：Reset 的 `key: null` 合成事件会让所有挂载中的 legacy `usePref` 显示默认值（H6，待证），涉及跨模块读者（rail、CmdK、pet、App 外观），以及异步队列、离页与 native 证据 |
| 总控决定（2026-10-04） | <ol><li>登记 CP-FEATURES-01，首批冻结 E1–E5。</li><li>**确认 D3：** Features 停止渲染共享 `SettingsFooter`，"Save & apply" 消失，"Reset to defaults" 改为 Features 本地控件，配真实的 confirm 文案与逐字段结果；Appearance 保留 footer，共享组件不改。理由：pane 本是自动保存，footer 的 "Saved" 无条件显示，属虚假成功提示，与 More/Sticky 已接受的无 Save footer 模式一致。这是可见 UI 变化，用户可在批次 25（Terra 实施）前否决。</li><li>**确认 harness：** native downstream 证据挂载生产 `App`，只替换 auth session。</li><li>**确认：** 键盘 Discard、Reload、Discard all 之后的焦点落点作为 gate（E15）。</li><li>**后续分组的前置决策**须由 operator 或总控另行决定，本项不处理：Appearance 的 host 范围、Dashboard 的多 guard 设计、AI 的 D2 secret、Integrations 的 SET-10、Calendar 的离页接缝与 SET-08。</li></ol> |
| 开放问题的处置 | 保留 `window.confirm`；Reset 不再清除畸形字节，记为有意的限制，与 More 先例一致，并关联 REL-07；H10（375px 溢出）由 E4 判定；扫描器看不到 `useFeaturePrefs.ts` 与 CmdK 的 `getPref` 读取，库存不代表读者覆盖 |
| 允许修改文件 | 批次 22：仅新目录 `docs/reviews/web-features-recovery-sol/**` |
| 禁止修改文件 | 全部产品源与测试；合同与选择备忘录；已有证据；台账；本控制面 |
| 后续顺序 | 批次 22 Sol（E1–E2）→ 批次 23 父级 jsdom host（E3）→ 批次 24 native before 与 Features F1（E4–E5）→ 批次 25 Terra → 之后按合同 §14 的 E6–E25 |

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
| 本提交 | 登记 CP-FEATURES-01、总控决定与批次 22 |

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

- **主要额外成本：** F1（必要的共享缺陷修复与受影响 caller 重跑）；G1（总控排程遗漏导致的一次补证与复审）。
- **改进：** 登记最终回归时须核对合同中全部 Required evidence 条目，不只 Final regression 行。

## 本轮唯一任务

批次 22：独立 Sol 窗口在不可变 `git archive f359be6` 上冻结 Features 合同 §12 的 jsdom oracle，对应 §14 的 E1 与 E2。

- **固定点：** 产品 `f359be6`；控制分支基点为本提交。
- **范围：** 七个模式 `bytes`、`fields`、`reset`、`queues`、`continuity-export`、`downstream`、`original`。
  - `downstream` 在生产 `App` 挂载中运行，只替换 auth session hook，不接网络；event bus、storage、shell、pet、CmdK 与 features 模块均为真实实现。
  - 使用独占语义的 Web Lock fixture、记录每次尝试且可证明已触发的 Storage 注入器、`window.confirm` 记录器，以及真实的 `accountScope` 转换。
  - 只用稳定选择器：`[data-feature-id] [role="switch"]`；Reset 按钮按 role 与 name 定位；恢复 UI 按合同 §5 的 role 与 name 定位。
- **输出：** 只新增 `docs/reviews/web-features-recovery-sol/**`，内容为：
  - fixture、oracle、runner，带 lockfile gate、requested/resolved SHA 与拒绝覆盖；
  - 七个模式的 before 日志；
  - README：SHA-256、逐模式计数、H1–H7 与 H9 逐项 confirmed/refuted 并附日志行（H5、H6 的 native 部分、H8、H10 分别属 E4、E3、E4），以及正向对照在 `f359be6` 上 PASS 的证明。
- **禁止：** 修改产品、合同、已有证据、台账、控制面；不修复；不 push。
- **成本上限：** 诊断迭代不超过 3 轮（新后缀，保留旧日志）；`original` 只跑一次；不跑全包。
- **停止条件：** fixture 有效性 3 轮内无法建立、合同与源码矛盾、或需要越权文件时，提交 blocked 回执并停止。

## 下一步

1. 等待批次 22 回执，总控核对：
   - 只新增 `web-features-recovery-sol/**`；
   - runner 的 archive、gate 与拒绝覆盖；
   - 正向对照 PASS；
   - 假设结论有日志行支撑，无 fixture 冒充产品失败；
   - hash 与回执吻合。
2. 依次登记批次 23（E3）与批次 24（E4–E5），E1–E5 全部冻结后才授权批次 25 Terra。
