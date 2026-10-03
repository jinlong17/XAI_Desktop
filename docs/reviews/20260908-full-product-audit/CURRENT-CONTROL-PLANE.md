# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-03

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`20235269749dad514833d76c27b958f694d0e4e9`

模块归属：`web`

本轮模式：Sticky5 合同已通过核对（`70ff46a`），Sol jsdom 正确失败 oracle 已冻结并通过核对（`4e21e6d`）。本批登记并启动批次 5：由独立窗口冻结父级角色的实际 host 基线。两项都冻结、且总控授权后，Terra 才可实施。当前 Claude 总控窗口不实施产品或 verifier 修复、不创建 Luna task、不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `4e21e6d` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。合同作者与 Sol 的隔离 worktree 和临时本地分支均已在快进接收后清理。
- 当前产品基线仍为 `2023526`（2026-09-15）：`git diff --name-only 2023526 HEAD -- apps packages package.json pnpm-lock.yaml` 为空；之后的提交均为 docs/evidence-only。
- More 生产文件从 `7b216a3` 到 HEAD 无差异。Sticky 生产文件（`stickyPane.tsx`、`StickyColorPalette.tsx`）自 `afbfb24` 起无差异。
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

## 当前进行中的调用方

### CP-STICKY-01 · Settings Sticky 5 字段

| 字段 | 当前值 |
| --- | --- |
| 状态 | `diagnosis_needed`：合同与 Sol jsdom oracle 已冻结并通过核对；父级角色 host 基线待冻结；未授权实现 |
| 合同 | `docs/reviews/web-sticky-recovery-contract/contract.md`，提交 `70ff46a`（父 `1ddae30`，单文件，快进接收）。作者为独立 Claude Opus 5.5（Astra 设计角色映射）|
| 312 清单编号 | `SET-12` 的支撑 caller；关联 `REL-05`、`QA-01`、`QA-03`、`QA-04`、`QA-09` 与 D2 writer 库存。本任务不得关闭这些编号 |
| feature / 产品模块 | Settings Sticky recovery caller / `web` |
| 固定产品 SHA | `20235269749dad514833d76c27b958f694d0e4e9`。`stickyPane.tsx`、`StickyColorPalette.tsx` 自 `afbfb24` 起无变化 |
| 排程依据 | `next-more-contract.md` 第 35 行：Notifications → More15 → Sticky5。`remaining-writers.md` 第 15 行：Sticky all5 作为完整 pane caller，含隐藏/条件输入、恢复、导出、来源真实性与实际 host 覆盖 |
| 已有库存 | `refresh-afbfb24.md` / `bindings-afbfb24.json`：`stickyPane.tsx` 第 39–57 行有 5 个直接 `usePref` 绑定。库存中 `StickyComposer.tsx` 的"相关"绑定实为 `usePref("xai_task_cols")`（account Tasks 键，无 setter），不是 Sticky 五键的 reader 或 writer（合同 D1）。`accountOwnership.ts` 第 99–103 行：五键均为 device。registry `registry.ts` 第 863–906 行：默认值 `sun` / `large` / `true` / `false` / `normal` |
| 当前真实问题 | Sol `4e21e6d` 在 `2023526` 上把 H1–H8 全部确认为正确 FAIL（H7 只确认了 pane 层：未注册离页 guard）。这些正是本 caller 要由 Terra 修复的范围，不另开修复窗口；host 层的导航与登出部分由批次 5 冻结 |
| 风险等级 | `high`（合同确认）：同字段异步队列、uncertainty/conflict、最新选择丢失、离页仲裁、全拒绝下的内存导出与 native 证据。device-only 移除了 More 的账户键与私有处置面，但仍需证明 A→B→locked→A 与 epoch 下的 device 连续性 |
| 允许修改文件 | 批次 5（父级角色 host 基线）：仅 `docs/reviews/web-sticky-recovery-independent/**`。`web-sticky-recovery-sol/**` 已冻结，不得改动 |
| 禁止修改文件 | 全部产品源与测试；合同文件（如需修订，必须另开 Astra 角色修订）；已有 review/evidence；三份正式台账；本控制面；已接受的 DateTime/Notifications/More/Header/Smart/Collaborate/Pomodoro；共享 storage hook/engine/registry/ownership；Settings host/coordinator/auth；部署、同步、发布、长期分支文件 |
| 原始失败复现 | **Sol `4e21e6d`**（`docs/reviews/web-sticky-recovery-sol/`，requested `2023526` → resolved `20235269…`，lockfile `df05f2dd…`，诊断迭代 1/3）：bytes 13/13 PASS；fields 0/47；queues 0/27；continuity-export 3/22；original ST1–ST10 10/10。109 个 Sol case 中 16 PASS、93 正确 FAIL；`PRECONDITION:` 为 0，无未处理错误。**批次 5：** 另一个独立窗口按 `web-more-recovery-independent/` 模式，冻结实际 ComposedSettings + 完整 Shell 的父级角色 host 基线 |
| 验收命令与业务断言 | 合同 §5–§13：All5 字段、同字段队列归因、device 连续性与导出、production host/native、下游格式不漂移、最终回归，共六行 gate |
| 是否允许 Luna 执行 | 否；属于持久化恢复、异步与最终验收禁区 |
| 当前唯一负责人 | Claude 总控负责调度、核对、接收。批次 5 执行者为新的独立 Claude Opus 5.5（父级 host 角色，与 Sol 实例不同），在隔离 worktree 中只写 verifier/oracle/日志 |
| 后续顺序 | ~~Sol 冻结 jsdom oracle~~（`4e21e6d`）→ 父级角色 host 基线 → 总控授权 Terra 实施 → Sol 原样重跑 → host/native 验证 → 最终回归 → 独立最终 acceptance |
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

批次 5：独立窗口冻结合同 §12 的父级角色实际 host 基线。

- **固定点：** 产品 `2023526`；控制分支基点为本提交。
- **允许范围：** 仅 `docs/reviews/web-sticky-recovery-independent/**`，内容为 host oracle、runner、before 日志与 `before-2023526.md` 回执。
- **覆盖要求：**
  - 使用实际 ComposedSettings + 完整 Shell + 真实 router（模式：`web-more-recovery-independent/`）；
  - 五个字段各自：写入失败后的最新选择、路由结果、登出结果；
  - 至少一个代表性失败字段上的 H7 各导航形式：sidebar、AppRail/编程导航、Back、Forward、相对导航，以及 beforeunload；
  - 一个干净正向对照，在 `2023526` 上必须 PASS。
- **验收条件：**
  - runner 使用不可变 archive、`XAI_DEPS_ROOT` lockfile hash gate，记录 requested/resolved SHA，拒绝覆盖，保留非零退出码；
  - 先断言前置条件，再断言业务；fixture 或选择器失败不得计为产品失败；
  - 回执逐项给出 confirmed 或 refuted，并附日志行与 SHA-256。
- **禁止：** 产品源与测试、合同、Sol 已冻结文件、其他证据、台账、控制面；不实施、不修复、不 push。
- **成本上限：** 诊断迭代不超过 3 轮；不跑全包矩阵；不跑 Chrome native（native 证据属于实现后的 host/native 验证批次）。
- **停止条件：** fixture 有效性 3 轮内无法建立、合同与源码矛盾、或需要越权文件时，提交 blocked 回执并停止。

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
- 本提交：记录批次 4 核对结论，登记批次 5。

## 台账变化

- 无编号状态变化；13/312 完成、299 未关闭保持不变。
- Sticky 由 `not_started` 进入控制面状态 `diagnosis_needed`，正式台账中的 SET-12 仍为待处理。

## 成本检查（三批次，非阻断）

- 批次 1：证据接收、两次控制面提交、一个独立 reviewer（各重跑一次 B1/B2）。
- 批次 2：三份台账核对，一次提交。
- 批次 3：Sticky 选择与登记、一个合同设计子任务。
- 未重跑任何全矩阵；临时 worktree 均已清理；无重复工作；无已复现产品缺陷。
- 新周期从批次 4 开始计数：Sol 冻结 jsdom oracle、父级角色 host 基线、Terra 实施各为一批，三批后再做一次非阻断成本检查。
- 批次 4 已完成：一个独立 Sol 子任务，诊断迭代 1/3，ST1–ST10 只跑一次，未跑全包矩阵。

## 下一步

1. 等待批次 5 回执。总控核对：边界只在 `web-sticky-recovery-independent/**`；runner 的 archive 与 hash gate 生效；正向对照 PASS；各字段的路由/登出结论与 H7 各导航形式均有日志与 hash 支撑；无 fixture 冒充产品失败。
2. 通过后接收并推送，再由总控登记批次 6：授权 Terra 实施，范围仅限合同 §11 文件，在独立窗口中进行。
3. 若发现合同与源码矛盾，停止并回报，另开 Astra 角色修订，不扩大授权。
