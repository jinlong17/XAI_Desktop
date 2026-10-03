# XAI_Desktop 312 审查当前控制面

更新时间：2026-10-03

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`20235269749dad514833d76c27b958f694d0e4e9`

模块归属：`web`

本轮模式：接收独立 Sol B1/B2 证据（原提交 `c3ab20d`，精确 cherry-pick 为 `c0c9ec5`）后，启动新的独立不同 vendor 最终验收；当前 Claude 总控窗口不实施产品或 verifier 修复、不创建 Luna task、不启动 Sticky、不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 本轮写入前工作树 clean；`git fetch --all --prune` 后 `HEAD...origin/codex/web/full-product-audit-20260908` 为 `0 0`，HEAD 为 `c0c9ec5`。
- 当前产品基线仍为 `2023526`（2026-09-15）：`git diff --name-only 2023526 HEAD -- apps packages package.json pnpm-lock.yaml` 为空。之后的 `3b93b74`（控制面）与 `c0c9ec5`（B1/B2 证据）均为 docs/evidence-only，不关闭审查编号。
- More 生产文件从 `7b216a3` 到当前 HEAD 无差异；`7b216a3..HEAD` 的 `apps` / `packages` 变化仅为无关 Calendar/Meditation 测试 setup 三个文件。
- Sol 证据原提交 `c3ab20d`（父 `5ac1244`，与 `3b93b74` 为兄弟提交）仅存在于 Codex detached worktree。cherry-pick 后 `pnpm git:sync-check -- --fetch` 因该唯一本地提交（local ref + reflog）报 2 FAIL；按 `docs/workflow/project/multi-machine-development.md` §5/§6，经 grep 密钥扫描（无命中；本机未安装 gitleaks）后推送为仅归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d`，复跑 sync-check 为 failures=0、warnings=1（未请求 deep 扫描）。该归档分支不代表验证或发布，不得合并。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。

## 台账与 Git 的差异

- 三份旧台账最后写入提交为 `c9fb908`（2026-09-11 06:01 -0700），早于 More 实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3`、Sol 独立验证 `8e12334`、Astra `BLOCKED` `5ac1244` 与 B1/B2 证据 `c3ab20d` / `c0c9ec5`。
- `EXECUTION.json` 仍记录 13 `completed`、3 `verification_pending`、3 `in_progress`、293 `pending`，合计 299 未关闭；本轮不改变这些正式数字。
- 旧台账将 More 描述为“Terra 实施与 Sol 矩阵进行中”。Git 事实是：More caller 已实现，Sol 有界矩阵、父级 host/native、最终回归与 B1/B2 补充证据均已通过，但尚无独立最终 acceptance。
- 新状态词的保守迁移视图：旧 13 `completed` 视为 `accepted`；REL-02/03/04 保持 `verification_pending`；REL-05/06、AI-02 在完成逐项账实复核前视为 `diagnosis_needed`；其余 293 项保持 `not_started`。这只是控制面映射，不改写或关闭旧台账项目。

## 已接受的调用方

- Date & Time：`accepted`，最终接受提交 `d0d934d`，固定产品 `d9d9fdd`。仅接受完整五字段 mounted-session caller，不关闭广义 Settings、D2、REL、AI 或 312 目标。
- Notifications：`accepted`，固定产品 `afbfb24`，Astra 接受提交 `ad223a2`；Sol 41/41、父级 host/native 与回归证据按原 acceptance 文件归属。仅接受完整八字段 caller，不等于通知投递能力、SET-07、REL/D2 或发布完成。

## 当前进行中的调用方

### CP-MORE-01 · Settings More 15 字段与 Reset Default

| 字段 | 当前值 |
| --- | --- |
| 状态 | `verification_pending` |
| 312 清单编号 | `SET-09` 的支撑 caller；关联 `REL-03`、`REL-05`、`QA-01`、`QA-03`、`QA-04`、`QA-09`，本任务不得关闭这些编号 |
| feature / 产品模块 | Settings More recovery caller / `web` |
| 当前产品 SHA | `20235269749dad514833d76c27b958f694d0e4e9`；More 生产源与 `7b216a3` 相同 |
| 已有实现与证据 SHA | 合同 `fc56d5e`；正确失败基线 `f73b85f` / 产品 `afbfb24`；实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3`；Sol 证据 `8e12334` / 79/79；产品 More suite 15/15；父级 unchanged actual-host 基线 11/11；native N1/N2/N3/N4 PASS；最终回归 Settings-rest 43 files/300 tests、Web 27/146、Notifications 41/24/15/12、DateTime7、全部 type/lint gates PASS（`web-more-recovery-final/review-final-regressions-7b216a3.md`）；Astra `BLOCKED` `5ac1244`；B1/B2 Sol 证据 `c3ab20d` → 控制分支 `c0c9ec5`（`web-more-recovery-evidence/completion-7b216a3.md`） |
| B1/B2 证据结论 | 回执声明 B1/B2 PASS、未复现产品缺陷，两条命令 exit 0。B1：真实 Chrome 磁盘 `more-draft.json` 覆盖 sparse reset、mixed set+reset（同时 mixed owner）与 locked device-only reset。B2：production `ComposedSettings` sidebar 可信点击、Back/Forward 恢复原 location key、同字段 predecessor 完成而 latest pending/failed 时不释放、latest 匹配 Retry 后恰好一次 router commit / 一次 `pushState` / 零 `replaceState` / 零 `popstate` |
| 总控可信度核对 | PASS（仅证据层）：父提交 `5ac1244`；7 个新增文件全部位于 `docs/reviews/web-more-recovery-evidence/`；无 `apps/**`、`packages/**`、正式台账或控制面修改；verifier `48c9c868…`、archive lockfile `df05f2dd…`、fixture `native.tsx` `966cfc81…`、B1 日志 `3ef902db…`、B2 日志 `4717bbae…` 与三份 JSON 的 SHA-256 全部与回执一致；cherry-pick 后证据目录 tree `cac7ae2` 与原提交相同；verifier 的 middle lock 名与产品 `prefMutationLockName` 一致 |
| 当前真实问题 | 无已复现产品缺陷；尚无独立最终 acceptance。B1/B2 PASS 是证据层结论，不等于 caller `accepted`。现有 recovery caller 仍没有实现 SET-09 的 host 能力说明、Tasks 默认值消费或模板业务能力 |
| 风险等级 | `high`：混合 device/account owner、异步队列、reset 删除、离页保护、账户代际与 native/browser 证据 |
| 允许修改文件 | 总控：仅本控制面。最终 reviewer：仅新建 `docs/reviews/web-more-recovery-acceptance/acceptance-7b216a3.md` 或 `docs/reviews/web-more-recovery-acceptance/blocked-7b216a3.md` 之一；若发现真实产品缺陷，先冻结失败，再在独立新窗口修复 |
| 禁止修改文件 | 产品源与产品测试；已提交的全部 review/evidence 文件（不得重写历史证据）；Sticky caller；共享 storage hook/engine/registry/ownership；Settings host/coordinator/auth；已接受的 Notifications/DateTime/Header/Smart/Collaborate/Pomodoro；三份正式旧台账在最终接受前；所有部署、同步、发布、长期分支文件 |
| 原始失败复现 | `afbfb24` 上 `host-reset-before-afbfb24.log`：10 个正确 FAIL、1 个 clean PASS；覆盖 device/private 最新选择丢失、路由/退出逃逸、remove 失败但 UI 显示默认值 |
| 验收命令 | 既有 frozen host 11/11、native N1–N4 与最终回归命令见各回执；B1/B2：`XAI_DEPS_ROOT=<匹配 lockfile 的 checkout> node docs/reviews/web-more-recovery-evidence/verify-gaps.mjs 7b216a3d5a4947d0f66da042fb275302737fb762 <b1-native-export|b2-host-ordering> <suffix>` |
| 必须满足的业务断言 | 合同六行 gate 全部满足：15 字段、15 项物理 reset、set/reset 归因、owner/export、实际 host/native、最终回归；原失败在基准正确失败且在固定 SHA 通过；可信键盘操作、实际磁盘 JSON、held lock/uncertainty、跨 document conflict、EN/ZH 五宽度与焦点/44px 均有证据 |
| 是否允许 Luna 执行 | 否；命中 persistence、account lifecycle、async race、reset/delete、native/browser 与最终验收禁区 |
| 当前唯一负责人 | Claude 总控窗口（调度、核对、接收，不修复）；最终独立 acceptance 由新的不同 vendor reviewer 在隔离 worktree 只读执行，不与 Sol 证据作者或前次 Astra 审查共享上下文 |
| 下一步 | 启动新的独立最终 reviewer，逐行复审六行合同；只允许提交一份 acceptance 或 blocked 报告 |
| 不应被本任务关闭 | `SET-09`、`REL-03`、`REL-05`、完整 D2/REL/AI、其余 312 项、部署与发布门禁 |

#### 待最终 reviewer 独立判断的总控精度备注

以下是总控可信度核对中的观察，不是产品失败，也不构成与合同的矛盾；由最终 reviewer 独立确认或推翻：

1. B1 的 `storageUnchanged`：fixture 的 `reads` 记录全部读取尝试，而 `writes` / `removes` 只记录成功的变更；在 `denyAll` 下写/删计数相等是必然结果。fixture 暴露的 `verify.attempts()` / `verify.removeAttempts()` 未被 `verify-gaps.mjs` 断言。因此 B1 强证明导出期间零存储读取，但并未直接证明零写/删尝试。
2. 回执中“export retained the departure warning”：verifier 只在前两次导出与 lock 之后、locked 导出之前断言一次 beforeunload，并未在每次导出后断言，日志也未记录该值。
3. 合同第 88 行的原生磁盘导出清单含 “all15”。N3 只有 all15 set-only 导出；B1 补充 sparse reset、mixed set/reset 与 locked device-only reset。是否还需要 all15 pending-reset 原生磁盘导出，由 reviewer 依据合同判断（前次 Astra B1 只点名 sparse-reset 与 mixed-operation）。

## More 核对结论

More 在“完整 recovery caller”层面没有已复现的待实现产品缺口：当前实现、Sol 有界矩阵、冻结的 11 条 actual-host 基线、native N1–N4、最终回归，以及补齐 Astra B1/B2 的 Chrome 磁盘导出与 production host 顺序证据均通过，且 More 生产源到当前 HEAD 未变化。但在新的独立最终 reviewer 逐行复审合同之前，不得描述为 `accepted` 或“只差签字”。

即使 caller 被接受，recovery 合同也明确排除了原生 launch/tray/window、Tasks 默认值消费、真实 tag/list/template CRUD，所以 `SET-09` 仍不能自动核销。

## 本轮唯一任务

核对 `c3ab20d` 证据边界与可信度；精确 cherry-pick 为 `c0c9ec5` 并推送；归档原提交以恢复 sync-check；本控制面单独提交；之后启动新的独立不同 vendor 最终 reviewer。当前窗口只做调用、检查、状态同步，不修改产品或 verifier。

## Luna 任务卡

`独立 Luna task 未创建`。原因：More 当前风险为 `high` 且涉及 Luna 明确禁止的 persistence、账户生命周期、异步竞态、reset/delete 与最终验收。没有把隐藏 sub-agent 或未启动计划称作 Luna task。

## 最终独立验收条件

1. 已固定 `afbfb24` 的正确失败与 `7b216a3` 的修复结果，并保留唯一 authoritative baseline/fixed run；固定 host 结果为 11/11 PASS。
2. N2 已将 actual Settings/Shell composition 扩展到合同规定的 first-intent、history/relative、partial/latest release、Stay/Escape、epoch/unmount；N3 已覆盖 dialog export 的磁盘结果；B2 补充 production sidebar、location key、同字段新旧操作与 exactly-once 释放。
3. N1 已用真实 Chrome 可信交互覆盖 15 字段保存、新 document reload 与完整物理 reset；N2/N3 已覆盖 held lock、uncertainty、second-document conflict、A→B→locked、device continuity 与磁盘 draft；B1 补充 sparse reset、mixed set/reset 与 locked device-only reset 磁盘 JSON；N4 已覆盖双语五宽度、真实 hit、44px targets、焦点陷阱与人工截图审查。
4. 合同指定的 Settings/Web/storage type/lint/test 与 Notifications/DateTime fresh 回归已在固定 archive 全部 PASS；不得把这些结果扩大为 acceptance 或业务完成。
5. Astra 已在固定 SHA 上签发 `BLOCKED`（`5ac1244`）；B1/B2 证据已由 `c3ab20d` / `c0c9ec5` 补齐；新的独立 reviewer 复审前状态保持 `verification_pending`。
6. caller 接受后仍只更新 caller 状态；任何 312 编号关闭必须另有对应业务合同与证据。

## 本轮提交

- `c0c9ec5`：`git cherry-pick -x c3ab20d`，仅 7 个 B1/B2 证据文件，已推送。
- 归档 ref `codex/archive/audit-more-b1b2-evidence-c3ab20d` → `c3ab20d`，仅为远端保全原证据提交。
- 本控制面状态校正另作一个 docs-only 精确提交。未授权产品代码、旧台账或其他文档不得混入。

## 台账变化

- 三份旧台账与正式 13/312、299 未关闭统计保持不变。
- More 保持 `verification_pending`；新增 B1/B2 证据与总控可信度核对，不提前写回正式执行台账。
- Sticky 保持 `not_started`；没有新编号进入 `accepted`。

## 成本检查

- 本会话批次 1：只读核对 7 文件、hash 与 verifier 语义；一次 cherry-pick、一次归档 push、本控制面一次提交；未重跑任何测试矩阵或 verifier。
- 重复工作：无产品修复；最终 reviewer 默认只读复审，不重复 79/79、N1–N4 或最终回归全矩阵。
- 待修复缺口：当前无已复现产品缺陷；待验证缺口为新的独立最终 acceptance。
- 下一批建议：启动最终 reviewer；若 ACCEPT，先精确接收报告并只把 More caller 改为 `accepted`，再单独核对正式台账；若出现真实产品失败，冻结证据并另开修复窗口。

## 下一步

启动新的独立不同 vendor 最终 reviewer，在基于本提交的隔离 worktree 中对 `next-more-contract.md` 六行 gate 做只读复审，只允许提交一份 `docs/reviews/web-more-recovery-acceptance/acceptance-7b216a3.md` 或 `blocked-7b216a3.md`。reviewer 不得修复；若发现真实产品失败，只冻结复现、影响范围和正确 oracle，由总控另开修复窗口。ACCEPT 后只更新 More caller 状态，不自动关闭 SET-09、REL-03、REL-05、D2/REL/AI 或任何 312 编号；下一 caller（预计 Sticky）须先由合同、库存与最新控制面确认后才可启动。
