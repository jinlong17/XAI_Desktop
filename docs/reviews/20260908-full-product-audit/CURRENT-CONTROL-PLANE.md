# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-03

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`210abdf77562660372c47086db02bd21e870deb5`（Sticky fixed 候选；相对 `2023526` 只改动合同 §11 的 8 个 Sticky 文件）

模块归属：`web`

本轮模式：fixed 候选 `210abdf` 的冻结 oracle 重跑（`7ee8de6`）与 Chrome native controls/磁盘导出（`bc92561`）均已 PASS。本批登记批次 9：由独立窗口在真实 Chrome 中验证合同 §9 的 host 矩阵 a–l。当前 Claude 总控窗口不实施产品或 verifier 修复、不创建 Luna task、不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `bc92561` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。此前各批次的隔离 worktree 和临时本地分支均已在快进接收后清理。
- 产品基线由 `2023526` 前进到 `210abdf`。`git diff --name-only 2023526 210abdf -- apps packages package.json pnpm-lock.yaml` 恰为合同 §11 的 8 个文件：`stickyPane.tsx`、`StickyColorPalette.tsx`、`localI18n.ts`、`styles.css`、`stickyPane.test.tsx`、新增的 `stickyPaneRecovery.test.tsx`、`docs/api.md`、`docs/test.md`。共享层、shell、widgets、`apps`、lockfile 无变化。
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

## 当前进行中的调用方

### CP-STICKY-01 · Settings Sticky 5 字段

| 字段 | 当前值 |
| --- | --- |
| 状态 | `verification_pending`：Terra `210abdf` 已通过总控 diff 核对；独立 fixed 重跑（`7ee8de6`）与 Chrome native controls/导出（`bc92561`）均 PASS。待 Chrome host 矩阵、EN/ZH 视觉/键盘、最终回归与最终 acceptance |
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
| 允许修改文件 | 批次 9（Chrome host 矩阵）：只能在 `docs/reviews/web-sticky-recovery-native/` 中新增文件，例如 `verify-host.mjs`、按需的新 fixture、host 日志与 `review-host-210abdf.md`。不得修改该目录已有文件或其他证据 |
| 禁止修改文件 | 全部产品源与测试；合同文件（如需修订，必须另开 Astra 角色修订）；已有 review/evidence；三份正式台账；本控制面；已接受的 DateTime/Notifications/More/Header/Smart/Collaborate/Pomodoro；共享 storage hook/engine/registry/ownership；Settings host/coordinator/auth；部署、同步、发布、长期分支文件 |
| 原始失败复现 | **Sol `4e21e6d`**（`docs/reviews/web-sticky-recovery-sol/`，requested `2023526` → resolved `20235269…`，lockfile `df05f2dd…`，诊断迭代 1/3）：bytes 13/13 PASS；fields 0/47；queues 0/27；continuity-export 3/22；original ST1–ST10 10/10。109 个 Sol case 中 16 PASS、93 正确 FAIL；`PRECONDITION:` 为 0，无未处理错误。<br>**host `07784c4`**（`docs/reviews/web-sticky-recovery-independent/`，实际 Shell + ComposedSettings + DepartureCoordinator，生产 `createBrowserRouter`，真实 `requestSettingsDeparture`，诊断迭代 1/3）：28 个 case 中 5 PASS（2 个 fixture 自检 + PC1–PC3 正向对照）、23 正确 FAIL。<ul><li>五个字段各自的最新选择丢失、sidebar 离开、登出直接 `true`：全部确认。</li><li>`color` 上的 sidebar、AppRail、编程导航、Back、Forward、`navigate(-1)`、`navigate(1)`、带 state 的相对导航与登出：全部确认；beforeunload 未被阻止。</li><li>`PRECONDITION:` 为 0；产品 quota 警告恰好 23 次，证明故障逐例触发。</li></ul> |
| 验收命令与业务断言 | 合同 §5–§13：All5 字段、同字段队列归因、device 连续性与导出、production host/native、下游格式不漂移、最终回归，共六行 gate |
| 是否允许 Luna 执行 | 否；属于持久化恢复、异步与最终验收禁区 |
| 当前唯一负责人 | Claude 总控负责调度、核对、接收。批次 9 执行者为新的独立 Claude Opus 5.5（父级 host 验证角色），不是 Terra |
| 后续顺序 | ~~Sol 冻结 jsdom oracle~~（`4e21e6d`）→ ~~父级角色 host 基线~~（`07784c4`）→ ~~Terra 实施~~（`210abdf`）→ ~~fixed 原样重跑~~（`7ee8de6`）→ ~~Chrome native controls 与导出~~（`bc92561`）→ Chrome host 矩阵（批次 9）→ Chrome EN/ZH 五宽度视觉、键盘与截图（批次 10）→ 最终回归（批次 11）→ 独立最终 acceptance（批次 12） |
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

批次 9：独立窗口在真实 Chrome 中验证合同 §9 的 host 矩阵。

- **固定点：** fixed 候选 `210abdf`；控制分支基点为本提交。
- **框架：**
  - 可复用 `bc92561` 的 `native.tsx` / `verify-native.mjs` 模式，但不得修改这两个文件；需要变更时新增文件（例如 `verify-host.mjs`、`native-host.tsx`）；
  - 不可变 archive、lockfile gate、可信 CDP 输入与 hit-test、拒绝覆盖、runtime error 0 的要求与批次 8 相同。
- **host 模式（合同 §9 a–l，实际 composition + 完整 Shell）：**
  - a：hit-test 后的可信 sidebar 行激活；
  - b：AppRail 或编程导航；
  - c：Back 与 guarded Forward，在 Stay、discard-and-leave、最新完成释放三种情况下对 `{pathname,key,state}` 做 deepEqual，history 栈保持完整；
  - d：相对导航原样回放 state 与 options；
  - e：Stay 时登出返回 `false`；
  - f：同一 turn 内的首个意图胜出，含路由对路由、路由对登出；
  - g：Stay、Escape、导出保持 URL/history/pane/对话框，Stay 后的新意图再次提示；
  - h：两个失败字段中修复一个仍保持阻止，新的编辑或隐藏/屏外恢复也保持阻止；
  - i：同字段顺序——前驱完成时最新操作被真实锁持有，断言 location、对话框与零 history 变更；最新操作经 `setItem` 故障失败后 Retry，恰好释放一次：一次 router commit，无多余 push/replace，POP 释放无 push/replace，对话框关闭；
  - j：Discard all and leave 以零写入释放一次；
  - k：epoch 变化取消旧意图，新的 device 保护仍在；
  - l：unmount 移除 guard 与 unload 监听。
- **beforeunload：** 仅在存在 draft 时警告，且 handler 内零存储尝试；干净、source-only、仅输入错误三种状态不警告。
- **允许范围：** 只在 `docs/reviews/web-sticky-recovery-native/` 中新增文件，包括 host 日志与 `review-host-210abdf.md` 回执。
- **禁止：** 修改产品、合同、已有证据、台账、控制面；不修复；不 push；不跑五宽度视觉或其他 caller 的矩阵。
- **成本上限：** 诊断迭代不超过 3 轮（新后缀，保留旧日志）。
- **停止条件：**
  - 出现真实产品失败：冻结复现、影响范围与正确 oracle，提交证据后停止；修复由总控另开 Terra 窗口。
  - 框架 3 轮内无法有效：提交 blocked 回执。

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
- 本提交：记录批次 8 核对结论，登记批次 9。

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
- 批次 5 已完成：一个独立 host 验证子任务，诊断迭代 1/3，未跑 Chrome 或全包矩阵。
- 批次 6 已完成：一个 Terra 子任务、单提交；Terra 自跑包测试一次，每个预检模式各一次。
- **周期 2 成本检查（批次 4–6，非阻断）：**
  - 三个子任务各一次完成，无返工、无重复全矩阵；
  - 临时 worktree（含 Terra 离线安装的 `node_modules`）全部清理；
  - 每次 push 后 sync-check 均为 failures=0；
  - 无已复现的共享缺陷。
- 周期 3（批次 7–9）：fixed 重跑、Chrome native controls 与导出、Chrome host 矩阵。
  - 批次 7：一个子任务，每模式各跑一次，无环境重跑。
  - 批次 8：一个子任务，每模式各跑一次（n1），用过两个已删除的探针，无返工。
  - 批次 9 完成后做本周期的非阻断成本检查。

## 下一步

1. 等待批次 9 回执，总控核对：
   - 只新增文件，未改 `bc92561` 已有文件；
   - a–l 每行与 beforeunload 都有日志行支撑，含 guarded Forward 的 key deepEqual 与同字段 exactly-once 的 history 计数；
   - runtime error 0，各 hash 与回执吻合。
2. 若通过：接收、推送，再登记批次 10，做 Chrome EN/ZH 五宽度的每控件 hit-test、44px、截图人工审查与键盘/焦点检查。
3. 若出现真实产品失败：冻结后另开 Terra 修复窗口，修复后需重跑受影响的 oracle 与 native 模式。
