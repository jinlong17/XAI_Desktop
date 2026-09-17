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
| 已有实现与证据 SHA | 合同 `fc56d5e`；正确失败基线 `f73b85f` / 产品 `afbfb24`；实现 `27efbf2`、`f4c3c62`、`982ab68`、`7b216a3`；Sol 证据 `8e12334` / 79/79；产品 More suite 15/15 |
| 当前真实问题 | 缺固定实现上的实际 Settings/Shell host 复跑、真实浏览器/native 可信控件与磁盘导出/冲突/锁/视觉证据、最终回归及 Astra 合同接受。现有 recovery caller 也没有实现 SET-09 的 host 能力说明、Tasks 默认值消费或模板业务能力 |
| 风险等级 | `high`：混合 device/account owner、异步队列、reset 删除、离页保护、账户代际与 native/browser 证据 |
| 允许修改文件 | `docs/reviews/web-more-recovery-independent/**`、新建且仅用于验证的 `docs/reviews/web-more-recovery-native/**`、本控制面；若验证发现真实产品缺陷，先冻结失败并修订合同，未经新边界不得修改产品源 |
| 禁止修改文件 | Sticky caller；共享 storage hook/engine/registry/ownership；Settings host/coordinator/auth；已接受的 Notifications/DateTime/Header/Smart/Collaborate/Pomodoro；三份正式旧台账在最终接受前；所有部署、同步、发布、长期分支文件 |
| 原始失败复现 | `afbfb24` 上 `host-reset-before-afbfb24.log`：10 个正确 FAIL、1 个 clean PASS；覆盖 device/private 最新选择丢失、路由/退出逃逸、remove 失败但 UI 显示默认值 |
| 验收命令 | `node docs/reviews/web-more-recovery-independent/verify-fixed.mjs 7b216a3 host control-plane-20260917`；随后运行 Settings-rest More suite/typecheck/lint、Web check-types/test/lint、storage check-types，以及合同指定的 Notifications/DateTime 回归。native verifier 尚不存在，必须先在允许目录冻结可复现命令和输出格式，不能用 jsdom 代替 |
| 必须满足的业务断言 | 合同六行 gate 全部满足：15 字段、15 项物理 reset、set/reset 归因、owner/export、实际 host/native、最终回归；原失败在基准正确失败且在固定 SHA 通过；可信键盘操作、实际磁盘 JSON、held lock/uncertainty、跨 document conflict、EN/ZH 五宽度与焦点/44px 均有证据 |
| 是否允许 Luna 执行 | 否；命中 persistence、account lifecycle、async race、reset/delete、native/browser 与最终验收禁区 |
| 当前唯一负责人 | GPT-5.6 Sol 总控；Astra 仅承担最终独立 acceptance，不与 Sol 同时写验证文件 |
| 下一步 | Sol 先完成固定 SHA 的 parent host 复跑与 native 证据合同/执行，再补最终回归；全部通过后才交 Astra 最终接受 |
| 不应被本任务关闭 | `SET-09`、`REL-03`、`REL-05`、完整 D2/REL/AI、其余 312 项、部署与发布门禁 |

## More 核对结论

More 在“完整 recovery caller”层面没有已知待实现产品缺口：当前实现已存在，Sol 有界矩阵通过，且 More 生产源到当前 HEAD 未变化。它当前主要缺父级实际 host/native + 最终回归，以及 Astra 最终接受。

但这不能简化成“只差两份签字”：host/native gate 本身必须覆盖生产 composition、导航/退出/beforeunload、可信控件、物理 reload/磁盘导出、冲突/锁/uncertainty、双语五宽度/焦点/命中区域和受保护回归。并且 recovery 合同明确排除了原生 launch/tray/window、Tasks 默认值消费、真实 tag/list/template CRUD，所以即使 caller 被接受，`SET-09` 仍不能自动核销。

## 本轮唯一任务

创建当前控制面并完成 More 的账实核对。范围仅为文档治理：不运行验收矩阵、不修改产品、不更新三份正式旧台账、不启动后续 caller。

## Luna 任务卡

`独立 Luna task 未创建`。原因：首轮控制面重建前禁止创建；More 当前风险为 `high` 且涉及 Luna 明确禁止的 persistence、账户生命周期、异步竞态、reset/delete 与最终验收。没有把隐藏 sub-agent 或未启动计划称作 Luna task。

## Sol 独立验收条件

1. 固定 `afbfb24` 的正确失败与 `7b216a3` 的修复结果，保留唯一 authoritative baseline/fixed run。
2. 用 actual Settings/Shell composition 复跑冻结的 11 条 host 基线，并扩展到合同规定的完整 first-intent、history/relative、partial/latest release、Stay/Escape/export、epoch/unmount。
3. 使用真实 Chrome/native 可信交互与磁盘输出覆盖 15 字段/reset、跨 document conflict、held lock、uncertainty、owner change、物理 reload、双语五宽度、焦点与命中区域。
4. 运行合同指定的 Settings/Web/storage type/lint/test 与 Notifications/DateTime 受影响回归；不得把历史通过冒充本轮新执行。
5. Astra 在固定 SHA 上逐行对齐合同并签发 acceptance；此前状态保持 `verification_pending`。
6. caller 接受后仍只更新 caller 状态；任何 312 编号关闭必须另有对应业务合同与证据。

## 本轮提交

计划仅提交本文件，精确文件范围为 `docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`。提交 SHA 由本轮外部报告记录，避免在提交内容中创建自引用 hash。未授权产品代码、旧台账或其他文档不得混入。

## 台账变化

- 新增唯一当前入口；三份旧台账与正式 13/312、299 未关闭统计保持不变。
- More 从旧文字“实施与 Sol 验证进行中”纠正为 `verification_pending`，但只在本控制面中反映，不提前写回正式执行台账。
- Sticky 保持 `not_started`；没有新编号进入 `accepted`。

## 成本检查

- 新增提交：预计 1 个 docs-only 精确提交。
- 验证重跑：0；本轮只读核对既有 Git/证据，没有重复执行 79/79、15/15 或 native/browser 矩阵。
- 重复工作：未复制原始日志；只保留 SHA、结论、缺口和下一条命令。
- 待修复缺口：当前无已冻结的新产品缺陷；待验证缺口为 host/native、最终回归、Astra acceptance。
- 下一批建议：只推进 CP-MORE-01 验证，不创建 Luna task，不启动 Sticky。

## 下一步

在干净工作树上，以 `7b216a3` 为固定 More 产品 SHA，先运行 unchanged parent host verifier并归档唯一 fixed run；随后定义并执行 native/browser verifier。若任一正确业务断言失败，先冻结失败与影响边界，再决定是否形成 Sol 高风险修复合同。全部通过后交 Astra 最终接受，最后再单独、精确更新三份正式台账。
