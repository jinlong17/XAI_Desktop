# XAI_Desktop 312 审查当前控制面

更新时间：2026-09-17

控制分支：`codex/web/full-product-audit-20260908`

当前产品 SHA：`20235269749dad514833d76c27b958f694d0e4e9`

模块归属：`web`

本轮模式：账实核对与控制面重建；不实施产品修复、不创建 Luna task、不启动 Sticky、不关闭任何 312 编号。

本文件是后续执行的唯一当前入口。`ALL-TODO-CURRENT.md`、`EXECUTION.json`、`EXECUTION.md` 和各 review 目录保留历史明细与证据，不再把长历史流水复制到这里。任务状态只允许：`not_started`、`diagnosis_needed`、`ready_for_luna`、`assigned_to_luna`、`implementation_ready_for_review`、`verification_pending`、`accepted`、`blocked_by_gate`。

## 当前仓库状态

- 工作树在本轮写入前为 clean；当前路径与历史路径是同一 checkout。
- `git fetch --all --prune` 已执行；写入前 `HEAD...origin/codex/web/full-product-audit-20260908` 为 `0 0`。
- 当前 HEAD 为 `2023526`（2026-09-15）。2026-09-11 台账检查点之后新增 `039f48c`、`2023526`，均只修复 Calendar/Meditation 的测试锁 shim；提交说明明确不关闭审查编号。
- More 生产文件从 `7b216a3` 到当前 HEAD 无差异：`morePane.tsx`、`morePane.test.tsx`、`styles.css` 的限定 diff exit 0。
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
| 已有实现与证据 SHA | 合同 `fc56d5e`；正确失败基线 `f73b85f` / 产品 `afbfb24`；实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3`；Sol 证据 `8e12334` / 79/79；产品 More suite 15/15；父级 unchanged actual-host 基线在 `7b216a3` 为 11/11 PASS；native N1 trusted controls/new-document reload/full15 physical reset PASS，见 `web-more-recovery-native/review-controls-reset-7b216a3.md` |
| 当前真实问题 | 冻结的 11 条实际 Settings/Shell host 基线和 native N1 已通过；仍缺合同完整 host 扩展、native N3 failure/owner/conflict/export、N4 双语视觉/focus/hit、最终回归及 Astra 合同接受。现有 recovery caller 也没有实现 SET-09 的 host 能力说明、Tasks 默认值消费或模板业务能力 |
| 风险等级 | `high`：混合 device/account owner、异步队列、reset 删除、离页保护、账户代际与 native/browser 证据 |
| 允许修改文件 | `docs/reviews/web-more-recovery-independent/**`、新建且仅用于验证的 `docs/reviews/web-more-recovery-native/**`、本控制面；若验证发现真实产品缺陷，先冻结失败并修订合同，未经新边界不得修改产品源 |
| 禁止修改文件 | Sticky caller；共享 storage hook/engine/registry/ownership；Settings host/coordinator/auth；已接受的 Notifications/DateTime/Header/Smart/Collaborate/Pomodoro；三份正式旧台账在最终接受前；所有部署、同步、发布、长期分支文件 |
| 原始失败复现 | `afbfb24` 上 `host-reset-before-afbfb24.log`：10 个正确 FAIL、1 个 clean PASS；覆盖 device/private 最新选择丢失、路由/退出逃逸、remove 失败但 UI 显示默认值 |
| 验收命令 | frozen host 11/11 与 native N1 已 PASS。N1：`node docs/reviews/web-more-recovery-native/verify-native.mjs 7b216a3 controls-reset control-plane-20260917-fixed1`。下一批执行 N2 `host`；随后 N3/N4、Settings-rest More suite/typecheck/lint、Web check-types/test/lint、storage check-types，以及合同指定的 Notifications/DateTime 回归 |
| 必须满足的业务断言 | 合同六行 gate 全部满足：15 字段、15 项物理 reset、set/reset 归因、owner/export、实际 host/native、最终回归；原失败在基准正确失败且在固定 SHA 通过；可信键盘操作、实际磁盘 JSON、held lock/uncertainty、跨 document conflict、EN/ZH 五宽度与焦点/44px 均有证据 |
| 是否允许 Luna 执行 | 否；命中 persistence、account lifecycle、async race、reset/delete、native/browser 与最终验收禁区 |
| 当前唯一负责人 | GPT-5.6 Sol 总控；Astra 仅承担最终独立 acceptance，不与 Sol 同时写验证文件 |
| 下一步 | Sol 实现并执行 N2 `host`，覆盖实际 route/rail/history/relative/signout/beforeunload、first-intent、Stay/Escape/focus、discard/partial/latest release、epoch/unmount；之后才进入 N3/N4 |
| 不应被本任务关闭 | `SET-09`、`REL-03`、`REL-05`、完整 D2/REL/AI、其余 312 项、部署与发布门禁 |

## More 核对结论

More 在“完整 recovery caller”层面没有已知待实现产品缺口：当前实现已存在，Sol 有界矩阵、冻结的 11 条 actual-host 基线以及 native N1 均通过，且 More 生产源到当前 HEAD 未变化。它当前主要缺 N2 完整 host、N3 recovery/owner、N4 双语视觉、最终回归，以及 Astra 最终接受。

但这不能简化成“只差两份签字”：host/native gate 本身必须覆盖生产 composition、导航/退出/beforeunload、可信控件、物理 reload/磁盘导出、冲突/锁/uncertainty、双语五宽度/焦点/命中区域和受保护回归。并且 recovery 合同明确排除了原生 launch/tray/window、Tasks 默认值消费、真实 tag/list/template CRUD，所以即使 caller 被接受，`SET-09` 仍不能自动核销。

## 本轮唯一任务

完成 More native N1：15 个可信控件、保存后新 document reload、完整 15 物理 key Reset Default，并归档唯一 authoritative fixed run。范围仅为 verifier 与证据/控制面：不修改产品、不更新三份正式旧台账、不启动后续 caller。

## Luna 任务卡

`独立 Luna task 未创建`。原因：首轮控制面重建前禁止创建；More 当前风险为 `high` 且涉及 Luna 明确禁止的 persistence、账户生命周期、异步竞态、reset/delete 与最终验收。没有把隐藏 sub-agent 或未启动计划称作 Luna task。

## Sol 独立验收条件

1. 已固定 `afbfb24` 的正确失败与 `7b216a3` 的修复结果，并保留唯一 authoritative baseline/fixed run；固定 host 结果为 11/11 PASS。
2. 将 actual Settings/Shell composition 扩展到合同规定的完整 first-intent、history/relative、partial/latest release、Stay/Escape/export、epoch/unmount。
3. N1 已用真实 Chrome 可信交互覆盖 15 字段保存、新 document reload 与完整物理 reset；仍须覆盖跨 document conflict、held lock、uncertainty、owner change、磁盘 draft、双语五宽度、焦点与命中区域。
4. 运行合同指定的 Settings/Web/storage type/lint/test 与 Notifications/DateTime 受影响回归；不得把历史通过冒充本轮新执行。
5. Astra 在固定 SHA 上逐行对齐合同并签发 acceptance；此前状态保持 `verification_pending`。
6. caller 接受后仍只更新 caller 状态；任何 312 编号关闭必须另有对应业务合同与证据。

## 本轮提交

计划精确提交本控制面与 `web-more-recovery-native/**` 的 N1 合同、runner、fixture、review 和唯一 fixed log。提交 SHA 由本轮外部报告记录，避免自引用 hash。未授权产品代码、旧台账或其他文档不得混入。

## 台账变化

- 新增唯一当前入口；三份旧台账与正式 13/312、299 未关闭统计保持不变。
- More 保持 `verification_pending`；新增 native N1 PASS 证据，但不提前写回正式执行台账。
- Sticky 保持 `not_started`；没有新编号进入 `accepted`。

## 成本检查

- 新增提交：本轮预计 1 个 evidence/docs-only 精确提交；累计控制面批次预计 3 个提交。
- 验证执行：3 次 runner invocation；前两次为未提交 harness diagnostics，最终 authoritative N1 首次按修正输入通过。没有重跑 79/79、15/15。
- 重复工作：两份 diagnostic 日志已删除；仅保留一个 authoritative fixed log、一个 review 和可复现 runner/fixture。
- 待修复缺口：当前无已冻结的新产品缺陷；待验证缺口为 N2 host、N3 recovery/owner、N4 visual、最终回归、Astra acceptance。
- 下一批建议：只实现并执行 N2 `host`，不创建 Luna task，不启动 Sticky。

## 下一步

在干净工作树上，以 `7b216a3` 为固定 More 产品 SHA，实现并执行 N2 `host`。若任一正确业务断言失败，先冻结失败与影响边界，再决定是否形成 Sol 高风险修复合同。N2 通过后才进入 N3/N4；全部通过后补最终回归并交 Astra 最终接受，最后再单独、精确更新三份正式台账。
