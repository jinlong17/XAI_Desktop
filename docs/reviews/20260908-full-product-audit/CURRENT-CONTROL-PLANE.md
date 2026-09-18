# XAI_Desktop 312 审查当前控制面

更新时间：2026-09-18

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`20235269749dad514833d76c27b958f694d0e4e9`

模块归属：`web`

本轮模式：More Astra 最终审查后的 B1/B2 证据补齐调度；当前窗口不实施产品或 verifier 修复、不创建 Luna task、不启动 Sticky、不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 工作树在本轮写入前为 clean；当前路径与历史路径是同一 checkout。
- `git fetch --all --prune` 已执行；写入前 `HEAD...origin/codex/web/full-product-audit-20260908` 为 `0 0`。
- 当前产品基线为 `2023526`（2026-09-15）。2026-09-11 台账检查点之后的产品提交 `039f48c`、`2023526` 均只修复 Calendar/Meditation 的测试锁 shim；之后的控制面、host baseline 与 N1 提交均为 docs/evidence-only，不关闭审查编号。
- More 生产文件从 `7b216a3` 到当前 HEAD 无差异；后续 `apps` / `packages` 变化仅为无关 Calendar/Meditation 测试 setup。最终回归全部在不可变 `7b216a3` archive 上执行。
- 未执行 merge、rebase、长期分支提升、部署、发布或 Web→Desktop 同步。

## 台账与 Git 的差异

- 三份旧台账最后写入提交为 `c9fb908`（2026-09-11 06:01 -0700），早于 More 实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3` 和 Sol 独立验证 `8e12334`。
- `EXECUTION.json` 仍记录 13 `completed`、3 `verification_pending`、3 `in_progress`、293 `pending`，合计 299 未关闭；本轮不改变这些正式数字。
- 旧台账将 More 描述为“Terra 实施与 Sol 矩阵进行中”。Git 事实是：More caller 已实现，Sol 有界矩阵已通过，但完整 caller 尚未取得父级 host/native 证据与 Astra 最终接受。
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
| 已有实现与证据 SHA | 合同 `fc56d5e`；正确失败基线 `f73b85f` / 产品 `afbfb24`；实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3`；Sol 证据 `8e12334` / 79/79；产品 More suite 15/15；父级 unchanged actual-host 基线在 `7b216a3` 为 11/11 PASS；native N1/N2/N3/N4 PASS；最终回归 Settings-rest 43 files/300 tests、Web 27 files/146 tests、Notifications 41/24/15/12、DateTime7、全部 type/lint gates PASS，见 `web-more-recovery-final/review-final-regressions-7b216a3.md` |
| 当前真实问题 | Astra 独立审查提交 `5ac1244` 判定 `BLOCKED`，未复现产品失败，但发现两项强制证据缺口：B1 缺 sparse-reset 与 mixed set/reset 的真实 Chrome 磁盘 JSON；B2 缺 Settings sidebar、Back/Forward location-key 身份、同字段新旧操作保护与 exactly-once 离开计数。现有 recovery caller 仍没有实现 SET-09 的 host 能力说明、Tasks 默认值消费或模板业务能力 |
| 风险等级 | `high`：混合 device/account owner、异步队列、reset 删除、离页保护、账户代际与 native/browser 证据 |
| 允许修改文件 | `docs/reviews/web-more-recovery-independent/**`、`docs/reviews/web-more-recovery-native/**`、`docs/reviews/web-more-recovery-final/**`、本轮 fresh regression logs 与本控制面；若验证发现真实产品缺陷，先冻结失败并在独立新窗口修复，当前总控窗口不得修改产品源 |
| 禁止修改文件 | Sticky caller；共享 storage hook/engine/registry/ownership；Settings host/coordinator/auth；已接受的 Notifications/DateTime/Header/Smart/Collaborate/Pomodoro；三份正式旧台账在最终接受前；所有部署、同步、发布、长期分支文件 |
| 原始失败复现 | `afbfb24` 上 `host-reset-before-afbfb24.log`：10 个正确 FAIL、1 个 clean PASS；覆盖 device/private 最新选择丢失、路由/退出逃逸、remove 失败但 UI 显示默认值 |
| 验收命令 | frozen host 11/11、native N1/N2/N3/N4 已 PASS。最终回归使用现有 Notifications runners 与 `node docs/reviews/web-more-recovery-final/verify-final.mjs 7b216a3 final-v1`，完整命令、结果和 hash 见 final regression receipt，全部 PASS |
| 必须满足的业务断言 | 合同六行 gate 全部满足：15 字段、15 项物理 reset、set/reset 归因、owner/export、实际 host/native、最终回归；原失败在基准正确失败且在固定 SHA 通过；可信键盘操作、实际磁盘 JSON、held lock/uncertainty、跨 document conflict、EN/ZH 五宽度与焦点/44px 均有证据 |
| 是否允许 Luna 执行 | 否；命中 persistence、account lifecycle、async race、reset/delete、native/browser 与最终验收禁区 |
| 当前唯一负责人 | GPT-5.6 Sol 总控；Astra 仅承担最终独立 acceptance，不与 Sol 同时写验证文件 |
| 下一步 | 已启动独立 Sol 证据任务补 B1/B2，只允许 verifier/log/receipt；若复现产品失败则冻结并停止，修复必须再开窗口。B1/B2 通过后重新启动独立 Astra acceptance |
| 不应被本任务关闭 | `SET-09`、`REL-03`、`REL-05`、完整 D2/REL/AI、其余 312 项、部署与发布门禁 |

## More 核对结论

More 在“完整 recovery caller”层面没有已复现的待实现产品缺口：当前实现、Sol 有界矩阵、冻结的 11 条 actual-host 基线、native N1/N2/N3/N4 及最终 Settings/Web/storage 与受保护 caller 回归均通过，且 More 生产源到当前 HEAD 未变化。但 Astra 拒绝最终接受，因为 B1/B2 的强制实际证据不完整；在补齐前不得描述为“只差签字”。

但这不能简化成“只差两份签字”：host/native gate 本身必须覆盖生产 composition、导航/退出/beforeunload、可信控件、物理 reload/磁盘导出、冲突/锁/uncertainty、双语五宽度/焦点/命中区域和受保护回归。并且 recovery 合同明确排除了原生 launch/tray/window、Tasks 默认值消费、真实 tag/list/template CRUD，所以即使 caller 被接受，`SET-09` 仍不能自动核销。

## 本轮唯一任务

接收并核对 Astra `BLOCKED` 报告 `docs/reviews/web-more-recovery-astra/blocked-7b216a3.md`，将单文件提交 `5ac1244` 精确纳入并推送；启动独立 Sol 证据任务补 B1/B2。当前窗口只做调用、检查、状态同步，不修改产品或 verifier。

## Luna 任务卡

`独立 Luna task 未创建`。原因：首轮控制面重建前禁止创建；More 当前风险为 `high` 且涉及 Luna 明确禁止的 persistence、账户生命周期、异步竞态、reset/delete 与最终验收。没有把隐藏 sub-agent 或未启动计划称作 Luna task。

## Sol 独立验收条件

1. 已固定 `afbfb24` 的正确失败与 `7b216a3` 的修复结果，并保留唯一 authoritative baseline/fixed run；固定 host 结果为 11/11 PASS。
2. N2 已将 actual Settings/Shell composition 扩展到合同规定的 first-intent、history/relative、partial/latest release、Stay/Escape、epoch/unmount；N3 已覆盖 dialog export 的磁盘结果。
3. N1 已用真实 Chrome 可信交互覆盖 15 字段保存、新 document reload 与完整物理 reset；N2/N3 已覆盖 held lock、uncertainty、second-document conflict、A→B→locked、device continuity 与磁盘 draft；N4 已覆盖双语五宽度、真实 hit、44px targets、焦点陷阱与人工截图审查。
4. 合同指定的 Settings/Web/storage type/lint/test 与 Notifications/DateTime fresh 回归已在固定 archive 全部 PASS；不得把这些结果扩大为 Astra acceptance 或业务完成。
5. Astra 已在固定 SHA 上逐行对齐合同并签发 `BLOCKED`；B1/B2 补齐并经 Astra 复审前状态保持 `verification_pending`。
6. caller 接受后仍只更新 caller 状态；任何 312 编号关闭必须另有对应业务合同与证据。

## 本轮提交

计划精确提交本控制面状态校正。Astra 报告已作为独立单文件提交 `5ac1244` 推送；Sol B1/B2 证据将在其隔离任务中另行提交。未授权产品代码、旧台账或其他文档不得混入。

## 台账变化

- 新增唯一当前入口；三份旧台账与正式 13/312、299 未关闭统计保持不变。
- More 保持 `verification_pending`；新增 Astra `BLOCKED` 证据并显式记录 B1/B2，不提前写回正式执行台账。
- Sticky 保持 `not_started`；没有新编号进入 `accepted`。

## 成本检查

- 新增提交：Astra 单报告提交 `5ac1244` 已纳入并推送；本控制面状态校正另作一个 docs-only 精确提交。
- 验证执行：Astra 未重跑全矩阵；核对固定源、23 个 evidence hash 与六行 gate，定位 B1/B2 证据缺口。
- 重复工作：无产品修复；Sol 新任务只补缺失 oracle，不重复完整 79/79、N1-N4 或最终回归。
- 待修复缺口：当前无已复现产品缺陷；待验证缺口为 B1/B2，之后仍需 Astra 复审。
- 下一批建议：等待并核对独立 Sol 证据任务；若 PASS，再新开 Astra acceptance；若出现真实产品失败，再新开修复窗口。

## 下一步

等待隔离 Sol 任务在固定 `7b216a3` archive 上补齐 B1 sparse-reset/mixed-operation 磁盘导出与 B2 actual-host/sidebar/location-key/same-field/exactly-once 证据。当前总控窗口不得修改 verifier 或产品。证据通过后重新启动独立 Astra acceptance；若复现真实产品失败，另启修复窗口。不得自动核销 SET-09 或其他 312 编号。
