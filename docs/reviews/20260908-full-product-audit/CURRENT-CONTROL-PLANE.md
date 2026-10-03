# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-03

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`20235269749dad514833d76c27b958f694d0e4e9`

模块归属：`web`

本轮模式：已接收 More 独立最终 acceptance（`27adb10`），只把 More recovery caller 状态改为 `accepted`；正式台账核对另作单独提交；下一 caller 尚未选择或启动。当前 Claude 总控窗口不实施产品或 verifier 修复、不创建 Luna task、不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本提交前工作树 clean；HEAD `27adb10` 与 `origin/codex/web/full-product-audit-20260908` 为 `0 0`。
- 当前产品基线仍为 `2023526`（2026-09-15）：`git diff --name-only 2023526 HEAD -- apps packages package.json pnpm-lock.yaml` 为空；之后的 `3b93b74`、`c0c9ec5`、`0c0ff15`、`27adb10` 均为 docs/evidence-only。
- More 生产文件从 `7b216a3` 到当前 HEAD 无差异。
- reviewer 提交 `27adb10` 以 `git cherry-pick --ff` 快进接收，保留原 SHA。之后移除其隔离 worktree，并删除指向 `9a61669`、无 upstream 的临时本地分支；删除前确认 worktree clean，且两个提交都可从远端到达。`pnpm git:sync-check -- --fetch` 为 failures=0、warnings=1（未请求 deep 扫描）。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` 继续保全 Sol 原证据提交 `c3ab20d`，不得合并。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。

## 台账与 Git 的差异

- 两份 md 正式台账最后写入为 `c9fb908`（2026-09-11 06:01），`EXECUTION.json` 最后写入为 `da69784`（2026-09-11 05:23）。三者都未记录 More acceptance。
- `EXECUTION.json` 还缺 Notifications 接受链（`f130cb0`、`7ce03a5`、`a41cd1d`、`ad223a2`、`acceptance-afbfb24.md`），而两份 md 台账已记录这条链。
- 下一提交单独核对正式台账：只追加证据与检查点文字，不改任何编号状态或统计。
- 正式统计保持 13 `completed`、3 `verification_pending`、3 `in_progress`、293 `pending`，合计 299 未关闭；caller 接受不改变这些数字。
- 新状态词的保守迁移视图：旧 13 `completed` 视为 `accepted`；REL-02/03/04 保持 `verification_pending`；REL-05/06、AI-02 在完成逐项账实复核前视为 `diagnosis_needed`；其余 293 项保持 `not_started`。这只是控制面映射，不改写或关闭旧台账项目。

## 已接受的调用方

- Date & Time：`accepted`，最终接受提交 `d0d934d`，固定产品 `d9d9fdd`。仅接受完整五字段 mounted-session caller，不关闭广义 Settings、D2、REL、AI 或 312 目标。
- Notifications：`accepted`，固定产品 `afbfb24`，Astra 接受提交 `ad223a2`；Sol 41/41、父级 host/native 与回归证据按原 acceptance 文件归属。仅接受完整八字段 caller，不等于通知投递能力、SET-07、REL/D2 或发布完成。
- More（CP-MORE-01）：`accepted`，固定产品 `7b216a3`，最终独立 acceptance 提交 `27adb10`，报告 `docs/reviews/web-more-recovery-acceptance/acceptance-7b216a3.md`。
  - **reviewer：** Claude Opus 5.5，跨 vendor 独立最终 reviewer；隔离 worktree，只读复审，未与证据作者或前次 Astra 共享上下文。
  - **证据链：** 合同 `fc56d5e`；正确失败基线 `f73b85f` / `afbfb24`；实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3`；Sol `8e12334`（79/79）；host 与 native N1–N4（`fe08254`、`443be31`、`8c07b57`、`a6c7b57`、`a9921b9`）；最终回归 `7b9ef87`；Astra `BLOCKED` `5ac1244`；B1/B2 证据 `c3ab20d` → `c0c9ec5`；acceptance `27adb10`。
  - **结论：** 六行 gate 全部 PASS，B1/B2 判定已真实关闭，未发现产品失败。reviewer 用 Chrome 154 各重跑 B1/B2 一次，均 exit 0，三份 JSON 与已提交文件逐字节相同；临时输出已删除。总控对报告关键引用（`morePane.tsx:78`、`:115–124`，`verify-native.mjs:334/403–404`，Sol owner/export attempt 级 spy，`usePrefAsync.ts` 单字段串行）的抽查全部吻合。
  - **三条精度备注的处置（均为非阻断限制）：**
    - B1 只证明导出期间零读取；零写/删尝试由源码与 Sol jsdom attempt 级 spy 证明。
    - locked 导出之后没有原生 warning 断言。
    - all15 pending-reset 导出只在 jsdom 中精确断言，未见原生磁盘文件。
  - **其他保留限制：** 合成账号与 headless Chrome，非 Tauri、非生产认证；Forward 只走了无 guard 返回；15 个控件的五宽度可达性依据零横向溢出与截图；locked 全量 reset 拒绝复用 "Account changed" 文案；未重跑全矩阵。
  - **接受范围：** 仅接受完整 15 字段 + Reset Default recovery caller。`SET-09` 仍未核销：Web launch/tray host 能力说明、Tasks 默认值接通、模板应用或只读标示均未完成；两个原 span 伪 checkbox 已改为合同允许的 `<button aria-pressed>`，但这只是部分支撑。`REL-03`、`REL-05`、`QA-01`、`QA-03`、`QA-04`、`QA-09`、完整 D2/REL/AI、其余 312 项、部署与发布均不因此关闭。

## 当前进行中的调用方

无。下一 caller 候选为 Sticky5（`not_started`）。排程依据为 [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md) 与 [3705558 inventory refresh](../web-d2-pref-binding-inventory/refresh-afbfb24.md) 的 "after Notifications, More15 then Sticky5"。启动前必须先读取对应合同与库存，并在控制面登记以下内容，否则不得启动：

- 固定产品 SHA、Sticky 合同是否已存在、风险等级、允许和禁止修改的文件；
- 正确失败基线计划；
- 独立执行窗口与验收人。

## 本轮唯一任务

接收 `27adb10` 并把 More caller 改为 `accepted`（本提交）。随后单独核对并更新三份正式台账：只追加证据与检查点，保留 "caller accepted ≠ business/release complete"，不改任何编号状态或统计。

## Luna 任务卡

`独立 Luna task 未创建`。原因：本轮只有证据接收、独立最终验收与状态同步；More 涉及 persistence、账户生命周期、异步竞态、reset/delete 与最终验收，属于 Luna 禁区。没有把隐藏 sub-agent 或未启动计划称作 Luna task。

## 本轮提交

- `c0c9ec5`：`git cherry-pick -x c3ab20d`，仅 7 个 B1/B2 证据文件。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` → `c3ab20d`。
- `0c0ff15`：控制面记录 B1/B2 证据 PASS、More 保持 `verification_pending`。
- `27adb10`：独立 reviewer 单文件 acceptance 报告，快进接收。
- 本提交：控制面把 More caller 改为 `accepted`。正式台账核对另作 docs-only 精确提交。

## 台账变化

- 控制面：More caller `verification_pending` → `accepted`。
- 正式台账：待下一提交单独核对；13/312 完成、299 未关闭保持不变。
- Sticky 保持 `not_started`；没有新编号进入 `accepted`。

## 成本检查

- 本会话批次 1 已完成：证据核对与接收、两次控制面提交、一个独立 reviewer 子任务。reviewer 只各重跑一次 B1/B2，未重跑 79/79、N1–N4 或最终回归全矩阵。
- 批次 2：正式台账核对。批次 3：下一项选择与登记。三批后做一次非阻断成本检查。
- 待修复缺口：无已复现产品缺陷。

## 下一步

1. 单独核对并更新三份正式台账（docs-only 精确提交，push 后运行 sync-check）。
2. 之后选择下一项：读取 Sticky5 合同、库存和排程依据，在控制面登记固定 SHA、风险、文件边界与验收人后，再启动独立窗口；不得提前启动。
