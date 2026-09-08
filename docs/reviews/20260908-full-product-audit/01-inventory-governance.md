# Feature 清单、流程、Skill 与个人开发看板审查

审查基线：`web@9257be40c03216b1006691bfa289bd29d6dfe839`，初始工作区 clean。审查模式为 `xai-consistency-audit report` + `xai-dev-dashboard-sync check`；只生成审查文件。父会话随后创建 `codex/web/full-product-audit-20260908`，该分支和报告引起的快照差异不计为原产品问题。

本报告检查管理记录与实现入口的一致性；产品交互、计时恢复和后端行为的细查见并行报告。本报告中的历史测试/SHIPPED 不表示本次在全部浏览器重新通过，也不表示已部署。目录含 docs-only 工作流锚点，绝不据“无 package.json/manifest”判为无功能。

## 清单规模与判定口径

| 清单层级 | 数量 | 含义 |
|---|---:|---|
| 产品模块 | 6 | web / app / plugin / sync / site / admin |
| 看板产品能力条目 | 46 | Web 17、App 7、Plugin 8、Sync 5、Site 4、Admin 5；它们是管理摘要，不是全部细粒度 feature |
| Web shell 注册 | 15 | 14 个 rail 功能 + Settings；`/app/todos` 兼容注册另计后为 16 条 route 注册 |
| Web 全局非路由能力 | 2 | Pet、Cmd+K；挂在 App 根部，不占 rail 注册 |
| packages 目录 | 129 | 包含业务包、基础设施、测试包、只有文档的 feature 锚点 |
| npm package / manifest | 59 / 35 | 不要求与功能数量相等；metric-tracker 无 manifest 仍由真实注册挂载 |
| dev_log | 120 | 其中任务看板当前仅收录 101 个，遗漏 19 个 |
| roadmap 标准 Slug 行 | 167 | 167 个不同 slug；其中 3 行因表头缺 `#` 被看板 parser 忽略 |
| canonical 产品 PRD | 7 顶层 + 3 设置子 PRD | tasks、board、calendar、pomodoro、dashboard、settings、bookkeeping；其余 9 个主要产品功能尚无该位置的 canonical PRD |
| Skill / Agent registry | 66 | 41 skills + 25 agents；14 个 `.teams` 项目 skill 三端镜像存在且 Claude/Codex 内容一致 |

完整机器清单为同目录 `feature-inventory.json`：包含每个目录、每行 roadmap、每条看板 feature、PLUGIN_MAP 原始行、PRD §5 入口、状态块及测试文件，供后续审查核对覆盖率。`package_candidates` / `owner_candidates_from_log` 是文档引用识别的实现候选，未将其当作精确调用图；实际挂载另存 `web_host_imports` / `desktop_host_imports`。

## 已确认问题

| 编号/优先级 | 当前事实与问题 | 证据 | 修改建议 |
|---|---|---|---|
| G01 / P1 | 任务页静默遗漏 19 个 dev_log。时间追踪 READY_TO_SHIP、记账 READY_TO_REVIEW、指标追踪 READY_FOR_VERIFY、plugin-project SHIPPED 都有状态，却不出现在任务列表；流程跟踪不完整。 | `scripts/dashboard/generate-state.mjs:2136` 仅解析表格；`:2188` 丢弃无 raw_status 项；`packages/plugin-web-time-tracker/docs/dev_log.md:3`、`packages/plugin-web-bookkeeping/docs/dev_log.md:3`、`packages/plugin-web-metric-tracker/docs/dev_log.md:3`、`packages/plugin-project/docs/dev_log.md:10` | 支持规范表格、旧 bullet、纯文本、Status 标题四种既有格式；输出 discovered/parsed/unparsed 三个计数及文件名。格式不识别必须可见，不能静默消失。对这四种格式与多迭代文件做行为测试。 |
| G02 / P2 | 三份 AI 工具层 roadmap 被漏读，且源行 NEEDS_REVIEW 与对应 chat dev_log SHIPPED 不一致。 | `scripts/dashboard/generate-state.mjs:1537` 强制 `#` 表头；`docs/workflow/roadmap/xai-web-ai-tool-layer.md:20`、`xai-web-ai-tool-edit-delete.md:20`、`xai-web-ai-tool-openai-compatible.md:20`；`packages/xai-web-ai-chat/docs/dev_log.md:686`、`:1135`、`:1494` | 以 Slug + Status 识别，`#` 可选；将原 roadmap 状态按对应迭代证据对账；给全部 manifest 提供可解析性 gate，避免新格式绕过计数。 |
| G03 / P2 | “最新快照”不等于“每 feature 最新状态”。快照初始 HEAD/dirty 完全正确且静态检查通过，但 G01/G02 与手写 feature 漂移仍存在。 | `docs/prototypes/dev-dashboard/state.generated.js` 初始 `generated_at=2026-09-08T10:17:30.162Z`；`scripts/dashboard/verify-static.mjs:175` 起 freshness 断言；上述 parser | Overview 分开显示“快照生成时间”“代码/状态对账覆盖率”“未解析/冲突项”“最近实际验证 commit”。检查器必须验证源集合与生成集合的一一覆盖。 |
| G04 / P2 | Cmd+K 标 in-dev，但 dev_log 已 SHIPPED 且实际 App 根挂载；Time Tracker note 仍称分支进行中，其工作已经在本次 web 基线。记账已接入且 release-log 登记，但工作流仍 READY_TO_REVIEW。 | `docs/workflow/project/dashboard-state.json:940`、`:944`；`packages/xai-web-cmdk/docs/dev_log.md:11`；`apps/web/src/App.tsx:234`；`packages/plugin-web-bookkeeping/docs/dev_log.md:3`；`docs/workflow/project/release-log.md:149` | 为 feature 加稳定 ID + canonical dev_log/迭代定位；区分 implemented、workflow-verified、deployed。记账不能凭已合入倒推通过验证，应补独立验证后收口。 |
| G05 / P2 | 计数记录漂移：CLAUDE “24 modules”实际是原始 24 roadmap 切片；Settings 写 13 panels，当前 union/composition 为 14（新增 AI）。 | `CLAUDE.md:80`；`apps/web/src/routes/modules/shellRegistrations.tsx:63`；`docs/workflow/project/dashboard-state.json:932`；`packages/plugin-web-settings-shell/src/types.ts:19` | 分别使用 package / roadmap slice / route / rail / panel 等名词；从 registry 自动生成实际路由、设置面板数；修正类型和 composition 中的陈旧注释。 |
| G06 / P2 | 长期分支存在性与冻结规则在同一文档内矛盾。CLAUDE 顶部称 desktop-plugin-next 尚不存在，后文已存在；PLUGIN_MAP 顶部把 organizer 放 paused，后文却明确 shipped/graduated 不冻结。 | `CLAUDE.md:33` 与 `:73`；`docs/PLUGIN_MAP.md:17` 与 `:101`；`docs/workflow/project/dashboard-state.json:1225` 甚至说 dev 尚未创建 | 保留唯一 authority，并用引用替代重复文案；在治理 lint 加“已存在分支/冻结例外”的结构化一致性断言。实际 web/dev 独立分叉不是 drift，不能通过 merge 消除。 |
| G07 / P2 | PLUGIN_MAP 的 Web Planning Contract 仍说 apps/web 是 Next.js 旧脚手架、browser sync driver 未 shipped，与当前 Vite/已完成基础切片相冲突；多个 Stable 行内嵌旧 READY_FOR_VERIFY 历史文案。 | `docs/PLUGIN_MAP.md:167`、`:169`、`:157`；`apps/web/package.json`；`docs/workflow/roadmap/web-ticktick-parity.md` | 将该表标明确历史归档或改为当前事实；Stable（依赖承诺）与最新迭代状态分列，不能简单将所有 SHIPPED 包提升 Stable。 |
| G08 / P2 | 9 个主要可见功能缺 canonical `docs/product/<feature>/prd.md`：AI chat、Countdown、Habits、Matrix、Meditation、Metric Tracker、Pet、Statistics、Time Tracker。它们有源码/设计/部分 dev_log，缺的是稳定产品级追溯。 | `docs/product/` 全目录；`.teams/skills/xai-feature-dossier-sync/SKILL.md:59`；附录逐功能记录 | 按用户可见功能补 PRD，不按 npm 包重复建文档。逐需求链到实际 dev_log 迭代、源码、测试、ship、deploy；不能从代码臆造需求。 |
| G09 / P2 | 部分新功能状态日志格式简化，丢 Workflow/Executor/Updated/Suggested Next。Metric Tracker 仅状态标题和一次 Work Log；Time Tracker/Bookkeeping 少流程字段。 | `packages/plugin-web-metric-tracker/docs/dev_log.md:1`；`packages/plugin-web-time-tracker/docs/dev_log.md:1`；`packages/plugin-web-bookkeeping/docs/dev_log.md:1`；`CLAUDE.md:135` | 新建日志必须用模板；历史日志追加统一机器可读状态块并保留历史，不应只为 parser 而删除旧记录。SHIPPED 必须有对应 verify/commit 证据。 |
| G10 / P2 | 运行验收延期仍未全闭合；dashboard-grid 跨浏览器证据文件仍明确是未填写 checklist，24h carve-out 不是长期通过许可。 | `docs/reviews/xai-web-dashboard-grid/20260524-cross-vendor-smoke.md:8`；`docs/workflow/project/release-log.md:173`；`docs/workflow/roadmap/xai-web-console.md:17` | 每个延期 gate 单独登记 owner、首次截止日、最近复核、实际浏览器/版本/结果；过期显示 overdue。将关闭页面、断网、重开和多标签纳入计时/持久化真实浏览器矩阵。 |
| G11 / P2 | 测试汇总是按模块和历史 release Verification 聚合，不能据 web=pass 推断每功能在当前 HEAD 全部通过；插件 testing 文案仍说“宿主暂停”，与 G1 active gate 矛盾。 | `docs/workflow/project/dashboard-state.json:434`、`:566`；`scripts/dashboard/generate-state.mjs:1395`；`docs/workflow/project/release-log.md:18` | TestRun 记录绑定 commit、feature IDs、environment、command、result、artifact；分开历史 PASS/当前 PASS/未测/阻塞。更正插件 active runtime 与 paused packages 的边界。 |
| G12 / P3 | TEMPLATE/DESIGN 仍保留已完成问题为“当前”：ops-panels 已拆分但模板仍称现安装使用该反模式；DESIGN 仍称 ADR-0013 Proposed、快照 tracked。 | `docs/prototypes/dev-dashboard/TEMPLATE.md:152`；`docs/prototypes/dev-dashboard/DESIGN.md:6`、`:100`；`scripts/dashboard/verify-static.mjs:38` 当前分离脚本列表 | 将历史设计提案和当前实现状态分区，并标完成时间/证据；供下一项目复制的模板只写已验证结构。 |

### 11 个后续迭代状态明确未对齐

额外确认：以下均有对应 Target 的 SHIPPED 状态块，manifest 却停留在规划/评审/验证阶段。看板只取每文件首个Status Panel（`generate-state.mjs:2138`），还会把后续迭代更新时间隐藏为初始feature日期。它不应把同一包所有迭代折叠成首条记录。

| Feature | manifest记录 | 对应真实工作流状态/证据 | 优化 |
|---|---|---|---|
| `xai-web-ai-tool-edit-delete` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-ai-tool-edit-delete.md:20) | SHIPPED (packages/xai-web-ai-chat/docs/dev_log.md:1135) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-ai-tool-layer` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-ai-tool-layer.md:20) | SHIPPED (packages/xai-web-ai-chat/docs/dev_log.md:686) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-ai-tool-openai-compatible` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-ai-tool-openai-compatible.md:20) | SHIPPED (packages/xai-web-ai-chat/docs/dev_log.md:1494) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-calendar-event-create` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-calendar-event-create.md:24) | SHIPPED (packages/xai-web-calendar/docs/dev_log.md:1155) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-dashboard-real-data` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-dashboard-real-data.md:22) | SHIPPED (packages/xai-web-dashboard-widgets/docs/dev_log.md:528) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-dashboard-stickies-create` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-dashboard-stickies-create.md:22) | SHIPPED (packages/xai-web-dashboard-widgets/docs/dev_log.md:304) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-dashboard-weather-mail` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-dashboard-weather-mail.md:24) | SHIPPED (packages/xai-web-dashboard-widgets/docs/dev_log.md:818) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-matrix-card-create` | READY_FOR_VERIFY (docs/workflow/roadmap/xai-web-matrix-card-create.md:22) | SHIPPED (packages/xai-web-matrix/docs/dev_log.md:428) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-statistics-real-aggregation` | NEEDS_REVIEW (B1 revised → re-review) (docs/workflow/roadmap/xai-web-statistics-real-aggregation.md:23) | SHIPPED (packages/xai-web-statistics/docs/dev_log.md:297) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-tasks-card-create` | APPROVED (docs/workflow/roadmap/xai-web-tasks-card-create.md:21) | SHIPPED (packages/xai-web-tasks/docs/dev_log.md:232) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |
| `xai-web-tasks-smartlist-filter` | NEEDS_REVIEW (docs/workflow/roadmap/xai-web-tasks-smartlist-filter.md:21) | SHIPPED (packages/xai-web-tasks/docs/dev_log.md:622) | 用Target定位迭代，回写事实并保留测试/部署独立状态 |

## 流程、Skill 与门禁现状

本次实际执行并通过：`pnpm dashboard:verify-static`（在审查分支建立前，web / 9257be4 / dirty=0 / modules=6 / records=17 / entries=66）、`pnpm dashboard:verify-modules`、`node --check scripts/dashboard/generate-state.mjs`、`python3 scripts/lint/check_portable_sync.py`。项目 agent/skill untracked 审计为空。本子代理未运行 generator，未修改跟踪的 dashboard 状态；父会话随后为了 UI 检查启动 dashboard:serve，该服务自动更新 gitignored 快照，详见文末。

14 个项目 skills：`xai-sync-fanout-dispatch`、`xai-admin-control-plane-sync`、`xai-roadmap-loop`、`xai-web-deploy-preflight`、`xai-feature-full-loop`、`xai-account-sync-scope-check`、`xai-feature-brief`、`xai-module-classify`、`xai-desktop-release-gate`、`xai-consistency-audit`、`xai-feature-dossier-sync`、`xai-dev-dashboard-sync`、`xai-release-log`、`xai-web-to-desktop-sync`。逐个确认 `.teams` → `.claude/.codex` 文件内容一致，Cursor rule 均存在。无需把 curated 固定 skill KPI 强行改成目录原始数量。

Workflow V2 模板、生成脚本和 portable lint 有实际闭环；`.codex/config.toml` max_depth=2，模型映射与 generator 一致。模型“是否仍最优/当前账户可调用”不属于本次静态通过结论。Skill / Agent registry 的 66/66 resolved 中只有 1 项源元数据完整，65 项依赖生成器补齐；这是明确披露的 source-backfill，不应误称 65 个坏技能，也不应把生成说明当作者已验证的运行能力。

当前主要治理缺口是输入完整性和状态语义，不是缺少流程模板。建议给 feature 建立稳定键：`feature_id → surface → runtime registration → source packages → canonical PRD → latest dev_log iteration → verify record → deployment receipt`。保持产品状态、依赖稳定性、工作流状态、运行验证、部署状态五个维度，不合并为一个绿色 SHIPPED。

## 14 个项目 Skill 逐项审查

所有14个均有受版本控制的 `.teams/skills/<name>/SKILL.md`，Claude/Codex镜像内容一致，Cursor镜像存在。下表风险针对能力合同和本次发现；“可发现”不等于实际执行过全部技能，本次实际采用 consistency-audit/report 与 dashboard-sync/check，portable lint通过。

| Skill | 当前状态/职责 | 针对性风险 | 优化建议 |
|---|---|---|---|
| xai-feature-brief | 规范需求、范围和QA入口已建 | 后续实现迭代可能没有新的brief/Source进入dossier | 输出固定feature_id、范围/非目标、失败与恢复验收，并由后续状态链接回原brief |
| xai-feature-full-loop | 父会话编排plan→review→build→verify→ship；Codex路径明确 | 多阶段自动化容易只更新包级Status，忽略新迭代/roadmap | 各阶段产出统一receipt，记录Target与验证commit；收口时校验registry可解析性与dossier增量 |
| xai-roadmap-loop | 波次依赖和暂停/外部阻塞合同已建 | 实际manifest有无#两种格式；现看板漏3份，11条源状态滞后 | 将manifest schema作为唯一可验证输入；emit/serial执行后对照dev_log对应Target，避免显示旧状态 |
| xai-release-log | repository级变更/Verification有稳定格式 | release entry可能混合产品上线、代码合入、纯文档；历史PASS可泛化 | 显式记录change_kind、source_commit、deployed_commit、feature_ids、环境与artifact；纯文档不改变产品验证健康 |
| xai-dev-dashboard-sync | 六面对齐合同完整；本次静态/模块校验PASS | parser漏19日志，fresh只证明快照时间；65 registry元数据为生成补齐 | 增加discovered/parsed/missing集合断言、迭代状态解析；显示源完整度和当前commit验证范围 |
| xai-consistency-audit | boundary/feature/registration三组+report/apply分离已建 | 缺feature稳定ID；依赖自然语言对账，漏项可能与人工ship统计并存 | 从JSON registry串联PRD/package/Target/test/deploy并校验双向覆盖；代码违规与记录漂移分别出证据 |
| xai-module-classify | 六模块与未来面边界机器表已建 | 顶部重复旧文案仍把organizer/G1冻结或分支不存在；物理host易误作产品app归属 | 对所有authority镜像做结构化规则对比；先产品意图、后实现位置，报告冲突来源而不自行改优先级 |
| xai-feature-dossier-sync | product级PRD规范、Source链、audit/draft/apply合同清楚 | 9个主要可见功能尚无canonical dossier；基础包与产品包可能一一建档导致重复 | 按用户能力补九份；一个feature映射多包/迭代，保留未证实需求待确认，不从实现反推需求 |
| xai-account-sync-scope-check | D4 scope/本地存储/双设备gate明确 | 使用统一prefs并不证明account-sync；device-local边界需要可执行验证 | 输出实体级scope矩阵，结合Web导出、outbox过滤、App映射与两设备测试证明；不把stub升为云同步 |
| xai-web-to-desktop-sync | D3 W0–W4/parity receipt已建 | Web/App独立分支下“已合并/已build”可能被误认运行一致 | receipt绑定两端commit、runtime profile与跨页恢复测试；需要Desktop增量时保持单独gate |
| xai-sync-fanout-dispatch | 语义触发、波次、独立owner合同已建 | feature已ship后dossier/dashboard/release同步不一定都完成，现11条漂移为证 | receipt逐消费者列done/not-applicable/pending及证据；同步失败可重入，不能只靠最终口头总结 |
| xai-admin-control-plane-sync | admin控制面与Web设置分域，roadmap-gated已建 | 用户端AI配置/用量与admin原型同名导致scope混淆；缺生产read model | 每次影响分类输出backend owner、RBAC/audit/secret boundary；前端可视变化不等于控制面数据已接通 |
| xai-web-deploy-preflight | Cloudflare、CSP、SW、跨浏览器门已建 | 首次部署24h deferral留存过久；当前上线版本/测试commit/构建commit可能不同 | gate要求可解析deployed commit、线上version endpoint和过期gate清单；静态配置PASS与实际deploy成功分开 |
| xai-desktop-release-gate | W4 RC/signing/notarization/DMG/updater gate已建 | `desktop build`或Web preview通过不能替代真机离线和签名链 | 收集平台/架构/产物hash、签名公证、升级/回退/睡眠唤醒实际证据；未有证据保持partial |

## 工作流逐项审查

| 流程 | 现状 | 主要问题/优化 |
|---|---|---|
| Feature plan→review→build→verify→ship | 模板、代理、portable镜像齐；多包有完整历史交付证据 | 当前Status格式不统一且多迭代被首表覆盖。按feature_id/Target与iteration_id形成状态记录；verify绑定commit；ship不等于deploy。 |
| Bug diagnose→fix→verify→ship | 独立诊断/修复/验证和Handoff合同齐 | 旧bugfix状态可被后续feature取代但仍显FIX_READY（如calendar历史块）。保留superseded_by关系，区分已修、已测、未复现和旧问题已被替代。 |
| Roadmap波次编排 | 167个slug包含依赖、暂停和外部门，Codex支持emit/serial | 看板只读164；11个workflow已SHIPPED但manifest未对齐。对Source/Depends On/Status做schema校验，完成receipt必须对应manifest与dev_log同一迭代。 |
| Sync fanout | 有sync-registry、语义动作与owner/并发边界 | 下游同步不应依靠人工记住。每个fanout consumer单独完成凭据；幂等重跑；未完成项进入开发任务页并显示阻塞原因。 |
| Web deploy与Desktop release gates | Web预检与Desktop W4分开；账号sync另有D4 | 将代码/构建/预览/生产/签名发布五类状态独立；过期延期不能自动放行；上线工件必须追溯源码commit与运行验收。 |
| Multi-machine handoff | GitHub交换源、精准stage、secret外置、git:sync-check与深度门已建；tracked配置无遗漏 | 审查报告也应commit/push后才跨机安全；Git完整性不证明本地工具/secret已恢复。为新机给names-only环境恢复与最小执行门，不合并web/dev正常分叉。 |
| 个人看板启动/刷新 | Node静态服务可运行并自动生成本地快照 | startup先同步生成会延迟监听；本次约90秒线索待profile。先服务可启动/显生成中状态，生成失败明确显示，不能以空页冒充无项目状态。 |

## 46 个产品能力条目的逐项核对

下面“优化”侧重记录/验收与正确产品边界；UI 和后端具体修复见其他并行审查。每条保留独立项，不把 paused/planned 误作缺陷。

本表中的 App/Plugin/Admin planned、in-dev 等描述首先反映 Web 基线上的看板记录，不能据此推断最新独立产品分支没有实现。最新 `dev`、`desktop-plugin-next`、Admin 分支的实际实现与验证状态，以 [04 部署与平台逐项审查](04-deployment-platform.md) 的冻结 SHA 证据为准；记录和实现的差距正是本次要揭示的内容。

| 功能 | 现状 | 问题/需要补证 | 对应优化 |
|---|---|---|---|
| Web Dashboard | 已挂载；grid+widgets 两包；有 canonical PRD | 总条目掩盖每个挂件真假数据与恢复契约；跨浏览器 gate 延期 | 拆挂件能力/数据来源/空态与时间挂件恢复验收，关联两包和运行 smoke |
| Web Tasks | 已挂载；有 PRD；4 时间桶及扩展 | 基础 SHIPPED 与后续新增筛选/AI写入状态混杂 | 以增量需求区分完成/日期桶/智能列表/AI变更，统一跨日和重开测试 |
| Web Boards | 已挂载；3业务包 + 17个后续切片；有PRD | “6视图已交付”容易掩盖 share/ACL/integrations 的本地或模拟边界 | 各视图、卡片/列表/工作区 CRUD、Task/Calendar 联动、分享权限独立登记；真实协作另立验收 |
| Web Calendar | 已挂载；有PRD；CRUD/周日视图/重复事件 | PLUGIN_MAP 仍嵌 demo/延期历史 | 把当前实体来源、重复规则、时区/跨日与刷新恢复写入现状章节 |
| Web Matrix | 已挂载；有 package docs | 缺 canonical PRD，Task数据复用范围需明确 | 独立需求条目记录象限动作与任务同步，补键盘/移动端拖动对偶 |
| Web Pomodoro | 已挂载；有PRD | 完成会话与运行中计时应分别验证 | 将关闭页面/切路由/睡眠后恢复及完成幂等列为必须验收 |
| Web Habits | 已挂载；无canonical PRD | 连续天、时区、日记/提醒语义散落包文档 | 补日期边界与重开后的当天状态测试及可访问打卡流程 |
| Web Meditation | 已挂载；无canonical PRD | prefs持久化与session持续性不能混为一谈；历史说明音频延期 | 明确一次冥想关闭/重开是否续播，声音可用性和减弱动效各自验收 |
| Web Countdown | 已挂载；实现和日志分属 plugin-web-countdown / xai-web-countdown | canonical PRD缺失；目录别名可能造成漏查 | 明确目标日期/时区模型、逾期显示和重开补算，建立别名映射 |
| Web Statistics | 已挂载；日志在xai-web-statistics；无canonical PRD | 统计页面存在不证明所有来源/周期真实 | 为每个KPI标来源、时间范围、空值口径及回算能力 |
| Web AI Chat + tools | 已挂载，3工具迭代已SHIPPED | 3 roadmap漏读且陈旧；canonical PRD缺；真实provider验收与mock测试不同 | 分层记录对话、流、六工具确认/回执/重试/中断；绑定真实provider smoke |
| Web Settings | 已挂载；主+3子PRD | 文案13，代码14 panes；真实能力和stub混排 | 按14 pane逐一登记可写状态、模拟状态、账号级/设备级及保存即时性 |
| Web Pet (DOM) | App全局挂载；SHIPPED；无canonical PRD | 易与原生桌宠混淆 | 标网页内生命周期、位置恢复、关闭开关持久化及遮挡规则；保持与plugin-pet分离 |
| Web Cmd+K | App全局挂载；dev_log SHIPPED | PLUGIN_MAP/dashboard仍in-dev；与新增模块搜索覆盖需同步 | 收口状态对账；registry按新增功能核对查询、跳转和禁用功能过滤 |
| Web Time Tracker | route已挂载；dev_log READY_TO_SHIP | 看板任务漏项、旧分支note、canonical PRD缺 | 首先补恢复/多标签/暂停结算验证，再独立verify收口；不能凭合入自动标SHIPPED |
| Web Bookkeeping | route已挂载；PRD与release entry存在；dev_log READY_TO_REVIEW | 已集成与验证流程未闭合 | 按账户/流水/预算/周期规则/投资/CSV分别验证，再更新工作流与发布证据 |
| Web Metric Tracker | route已挂载；无manifest但是真功能；READY_FOR_VERIFY | 任务页漏项、日志字段不足、无canonical PRD | 先核对体重/BMI真实范围与其余禁用指标；补测、规范日志、独立verify |
| App Web容器主窗口 | 看板planned；web基线desktop仍有原生旧host | 壳重构目标不能由旧host存在推断完成 | 在App线记录容器入口/profile/路由兼容及离线验收；经D3接受Web增量 |
| App native chrome | 看板planned，部分底层anchor已交付 | 菜单/托盘/深链/开机启动不能用一个状态覆盖 | 各原生命令分别列运行证据、系统权限和重启验收 |
| App离线profile/缓存 | planned；有Web runtime profile基础 | profile代码存在与桌面断网可用不同 | 断网启动、账号过期、缓存版本升级分场景验证 |
| App账号+Keychain | planned；有plugin-account和crypto基础 | 密钥/会话seam并非完整真机账号体验 | 绑定Keychain真机、锁屏/重启、撤销设备和清理验收 |
| App本地通知 | planned | 需区分浏览器通知与系统调度 | 以App关闭/后台/系统睡眠下的实际提醒语义立契约 |
| App自动更新/RC | planned | build通过不等于签名公证/update ready | 保持W4签名/公证/DMG/updater门独立，记录真实产物与版本 |
| App G1 host commands | in-dev；多G1 anchor已有历史ship | 产品归属跨app/plugin，物理目录不足以定归属 | 按命令消费者与产品职责登记，记录外部签名门而不阻塞无关路径 |
| Plugin平台运行时 | active-gate | testing文案仍说宿主暂停 | 同步修正文案；窗口/Spaces/click-through/grid恢复分别验收 |
| Plugin Center入口 | planned，设计已决 | 原型/设计不能表示可安装可运行 | 后续围绕发现→添加→实例配置→移除完整路径立PRD验收 |
| Organizer | Stable/shipped | 顶部paused记录相冲突 | 作为已交付参考单列维护；保留真机文件操作回归 |
| Organizer closeout | planned | tags注册/真实pin仍属后续 | 将Finder tags和pin各自建独立验收，避免只更新按钮文案 |
| Widget Host MVP | planned/paused包工作 | 与Web dashboard widgets同名易误认 | 保持原生host/实例持久化/跨桌面生命周期的独立测试 |
| Clipboard MVP | planned stub | clipboard.item/entry契约漂移已知；OCR需native | 先统一实体/事件再做隐私、历史上限、OCR失败交互 |
| Native Pet | planned stub独立包 | 与Web Pet分离，AI集成延后 | 先低依赖原生窗口/点击穿透/位置恢复，再接AI |
| Desktop Meditation | paused、未建包 | 缺包是明确计划不是幽灵实现 | 继续Web现状；解冻后只做桌面差异，复用可移植状态 |
| Sync账号同步 | paused | 协议/crypto历史ship不等于云端启用 | 以两设备、撤销、重连和server部署证据判可用 |
| Sync配置同步 | paused | 设备本地偏好不应全部上云 | 列每字段syncScope、冲突策略和恢复默认语义 |
| Sync push/pull冲突 | paused，基础代码/测试丰富 | live适配器/部署/双设备gate deferred | 分别登记outbox、cursor、冲突、重试、幂等、密钥恢复证据 |
| Sync双设备/device-local | paused | 目前没有最近两设备运行验收 | 以两个真实账号/设备正负场景验证，不用同进程mock代替 |
| Workflow/Dashboard同步 | proposed项目系统层 | 在sync产品条目出现容易与账号数据同步混淆 | 单列project-system支持能力；Git/工具配置同步与用户实体同步分域 |
| Site下载页 | proposed | archive release-site包不代表新官网已授权 | 只登记现有包与规划边界，激活后验证下载链接/平台版本 |
| Site Release notes | proposed | repository release-log与公开产品说明不同 | 后续建立用户可读版本页与产物commit映射 |
| Site自动更新host | proposed | 与App updater分属发布承载/客户端 | 联动签名feed、版本/回滚与渠道隔离验收 |
| Site账号/公开入口 | proposed | 对外入口与Web app登录边界需明确 | 激活后验证重定向、深链及访问保护，不复制一套账户状态 |
| Admin AI配置 | roadmap-gated prototype | 原型不代表provider secret backend | 先shell/RBAC，再secret handle/API/审计；不把管理功能塞入Web设置 |
| Admin RBAC | roadmap-gated | 生产权限未建全 | deny-by-default和API负向用例先于管理写入 |
| Admin用量统计 | roadmap-gated | 原型指标无生产账本证明 | 建事件来源/聚合口径/账号边界/延迟说明 |
| Admin审计日志 | roadmap-gated | 与本地开发日志不同 | 服务端不可变事件、权限、查询与保留策略独立验收 |
| Admin运营入口 | roadmap-gated | 无package/deploy target；不是未授权模块 | 按已激活roadmap从shell切片推进，统一导航/空态/失败恢复 |

## 167 个 roadmap feature 逐条清单与证据核对（非逐项运行审计）

本节覆盖所有顶层 roadmap 的 Slug 行（含无 # 表头的 3 个 AI manifest）。每行保留独立状态、来源、现状范围与优化动作。SHIPPED 是原记录；条目中的通过数是历史证据。不同路线图切片可共享同一实现包，不重复解释为产品数量。实现候选与测试文件明细可从 JSON 按 id 查询。

### account-cloud-sync-foundation.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `account-sync-architecture-charter` (docs/workflow/roadmap/account-cloud-sync-foundation.md:16) | SHIPPED | A-Codex serial; build `22de0e6`; verify/status `15d71f5`; shipped via ship gate; dev_log=docs/reviews/account-sync-architecture-charter/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-entity-scope-matrix` (docs/workflow/roadmap/account-cloud-sync-foundation.md:17) | SHIPPED | A-Codex serial; build `c5ad0d8`; verify/status `dc4a34b`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-entity-scope-matrix/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-device-identity-contract` (docs/workflow/roadmap/account-cloud-sync-foundation.md:18) | SHIPPED | A-Codex serial; build `9fd1cb7`; verify/status `fcdb7f4`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-device-identity-contract/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-local-first-boundaries` (docs/workflow/roadmap/account-cloud-sync-foundation.md:19) | SHIPPED | A-Codex serial; build `0e03cea`; verify/status `254d7e4`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-local-first-boundaries/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-protocol-surface-contract` (docs/workflow/roadmap/account-cloud-sync-foundation.md:20) | SHIPPED | A-Codex serial; build `df37e5b`; verify/status `baab759`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-protocol-surface-contract/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-surface-adapters` (docs/workflow/roadmap/account-cloud-sync-foundation.md:21) | SHIPPED | A-Codex serial; build `aeade97`; verify/status in dev_log; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-surface-adapters/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-admin-read-models` (docs/workflow/roadmap/account-cloud-sync-foundation.md:22) | SHIPPED | A-Codex serial; build `29b1a27`; verify/status `f8fc43b`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-admin-read-models/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-site-entry-contract` (docs/workflow/roadmap/account-cloud-sync-foundation.md:23) | SHIPPED | A-Codex serial; build `9654a5a`; verify/status `2bf145e`, `4df9af5`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-site-entry-contract/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-workflow-state-contract` (docs/workflow/roadmap/account-cloud-sync-foundation.md:24) | SHIPPED | A-Codex serial; build `d4b53fe`; verify/status `58047bd`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-workflow-state-contract/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `account-sync-verification-gates` (docs/workflow/roadmap/account-cloud-sync-foundation.md:25) | SHIPPED | A-Codex serial; build `b5f1b4b`; verify/status `c3b3c1f`; shipped via ship gate (`this commit`); dev_log=docs/reviews/account-sync-verification-gates/dev_log.md<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |

### sync-v1.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `roadmap-kickoff` (docs/workflow/roadmap/sync-v1.md:18) | SHIPPED | SHIPPED 2026-05-19 (bg:2a941912; 9 commits 211762a..46847e9 FF-merged into refactor/microkernel-plugin-architecture + pushed origin) · W0 · pkg scaffold plugin-account + core-data + EventMap account:* + useTauriInvoke + AppError E3xxx + PLUGIN_MAP rows; unblocks all<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `crypto-deps-lockdown` (docs/workflow/roadmap/sync-v1.md:19) | SHIPPED | SHIPPED 2026-05-19 (bg:1f84bff3; commits 711542a..9a1d263 on trunk refactor/microkernel-plugin-architecture pushed origin; feature-verify PASS independent; AC-8 osv-scanner = post-ship CI gate by design) ·<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `kdf-primitives` (docs/workflow/roadmap/sync-v1.md:20) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(kdf-primitives): add sync KDF primitives`) · Argon2id KEK/auth_password + HKDF helpers under Rust `crypto` feature; local tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `aes-gcm-aead-core` (docs/workflow/roadmap/sync-v1.md:21) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(aes-gcm-aead-core): add AES-GCM primitive`) · AES-256-GCM explicit-AAD primitive + detached tag; local tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `deterministic-cbor-aad` (docs/workflow/roadmap/sync-v1.md:22) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(deterministic-cbor-aad): add canonical AAD vectors`) · Rust deterministic CBOR AAD schemas + 3 fixture vectors; local tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `bip39-mnemonic-24w` (docs/workflow/roadmap/sync-v1.md:23) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(bip39-mnemonic-24w): add DEK mnemonic codec`) · 24-word English BIP-39 active DEK backup codec in Rust + plugin-account; local Rust/JS fixture smoke and typecheck pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `cipher-envelope-codec` (docs/workflow/roadmap/sync-v1.md:24) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(cipher-envelope-codec): add envelope codec`) · Binary envelope codec + nonce reconstruction; local tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `keychain-bridge-macos` (docs/workflow/roadmap/sync-v1.md:25) | SHIPPED | SHIPPED 2026-05-19 (bg:061fd54b; commits acd3126..93a298b on trunk pushed origin; feature-verify PASS independent; real-hardware ACL/MAS gates deferred to #10) ·<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `supabase-project-provisioning` (docs/workflow/roadmap/sync-v1.md:26) | BLOCKED_EXTERNAL | W0 · EXTERNAL: register Supabase staging+prod + billing + region (human, PRD §12.1 / dev-plan T-01)<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `apple-developer-account` (docs/workflow/roadmap/sync-v1.md:27) | BLOCKED_EXTERNAL | W0 · EXTERNAL: Apple Developer account for signed-build Keychain ACL + MAS sandbox verify · T3<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `rust-keyvault-opaque-handle` (docs/workflow/roadmap/sync-v1.md:28) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(rust-keyvault-opaque-handle): add Rust KeyVault`) · Non-zero u32 opaque handles for resident DEK/device_priv, zeroize-on-evict/drop, DEK handle AES-GCM round-trip tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `x25519-device-keypair` (docs/workflow/roadmap/sync-v1.md:29) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(x25519-device-keypair): add device key generation`) · Local CSPRNG X25519 device key generation, Keychain store abstraction, KeyVault device_priv handle, and all-zero/low-order public-key rejection tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `hpke-per-device-wrap` (docs/workflow/roadmap/sync-v1.md:30) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(hpke-per-device-wrap): add HPKE DEK wrapping`) · HPKE Base-mode DEK wrap/open with KeyVault handles, deterministic wrap info, info≠aad enforcement, AAD mismatch and low-order public-key tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `ed25519-recovery-signing` (docs/workflow/roadmap/sync-v1.md:31) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(ed25519-recovery-signing): add recovery proof signing`) · DEK-derived recovery signing pub, canonical CBOR transcript signing, verify_strict verification, and E3014 wrong-DEK/tamper tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `supabase-schema-migrations` (docs/workflow/roadmap/sync-v1.md:32) | SHIPPED | SHIPPED 2026-05-19 (bg:3022847e resumed from 7b5391f5; branch wt-supabase-schema-migrations 0481428..9ea9458 pushed origin; review+verify verdicts conductor-transcribed [read-only agent recovery, fixed by 9a47314/9a38d78]; TRUNK INTEGRATION DEFERRED — pending merge into active branch) ·<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `sqlcipher-local-db` (docs/workflow/roadmap/sync-v1.md:33) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(sqlcipher-local-db): add SQLCipher open path`) · KEK-derived SQLCipher db_key, raw-key PRAGMA guard, cipher_compatibility=4, correct/wrong KEK file tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `account-signup-login` (docs/workflow/roadmap/sync-v1.md:34) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(account-signup-login): add account auth orchestration`) · plugin-account signup/login/refresh orchestration, raw password/secret-key confined to local crypto seam, wrong secret-key auth failure, refresh-token Keychain lifecycle tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `onboarding-backfill-ui` (docs/workflow/roadmap/sync-v1.md:35) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(onboarding-backfill-ui): add recovery backfill flow`) · plugin-account three-screen backfill flow, zxcvbn score gate, 6-word mnemonic + 4 Secret Key digit type-back, local recovery-check seam, PDF/QR Emergency Kit, and Edge acknowledgement proof core tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `crypto-tauri-commands` (docs/workflow/roadmap/sync-v1.md:36) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(crypto-tauri-commands): add crypto IPC handlers`) · `crypto_*` Tauri handlers registered, Rust builds blob/wrap/recovery AAD, opaque KeyVault handle tests pass, non-allowlisted window rejected. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `core-data-sqlite-driver` (docs/workflow/roadmap/sync-v1.md:37) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(core-data-sqlite-driver): add SQLite repo boundary`) · `@repo/core-data` SQLite driver boundary, namespace repo CRUD, mutation hook, idempotent localStorage migration, and `@repo/core-data/testing` in-memory SQLite driver tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `realtime-private-channel-config` (docs/workflow/roadmap/sync-v1.md:38) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(realtime-private-channel-config): add private channel policy`) · `config.private:true` contract plus `realtime.messages` RLS for `sync:<account_id>` and active JWT device verified in local Postgres shim. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `menubar-sync-status-icon` (docs/workflow/roadmap/sync-v1.md:39) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(menubar-sync-status-icon): add sync status tray`) · plugin-account owns `account:sync-*` lifecycle helpers; desktop listens and updates idle/syncing/success/error Tauri menu-bar states. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `commit-seq-authority` (docs/workflow/roadmap/sync-v1.md:40) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(commit-seq-authority): verify commit sequence RPC`) · fixed invalid advisory-lock signature, verified SECURITY DEFINER + PUBLIC revoke + regression guard + concurrent same-account allocation in local Postgres. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `nonce-lease-server` (docs/workflow/roadmap/sync-v1.md:41) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(nonce-lease-server): add nonce lease RPC`) · `fn_grant_nonce_lease` issues monotone non-overlapping ranges for active JWT devices, `used_nonces` trigger ledger blocks cross-table reuse after hard delete, and Docker Vitest covers RLS/direct-write denial. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `rls-policies-and-tests` (docs/workflow/roadmap/sync-v1.md:42) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(rls-policies-and-tests): add RLS behavior harness`) · Docker-backed Vitest applies migrations 1-7, verifies cross-tenant deny, revoked-device deny, anon deny, no direct client writes, and active-only `sync_devices`; shared active-device helper avoids recursive policy evaluation. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `sync-engine-push` (docs/workflow/roadmap/sync-v1.md:43) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(sync-engine-push): add lazy push batch`) · `@repo/plugin-account` push engine stores plaintext outbox entries, squashes same-entity edits, computes `proposed_revision = base + 1`, lazy-encrypts through injected `crypto_encrypt_for` seam, and posts one `/sync/push` request. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `sync-engine-pull` (docs/workflow/roadmap/sync-v1.md:44) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(sync-engine-pull): add global pull cursor`) · `@repo/plugin-account` pull engine uses single account commit_seq cursor, routes PullRecord by entity_type, distinguishes idempotent duplicate vs legit re-encrypt vs true rollback, and raises E3024 on account cursor rollback. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `push-edge-function` (docs/workflow/roadmap/sync-v1.md:45) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(push-edge-function): add sync push core`) · Edge Function core handler covers conditional write, mutation_dedup idempotency, conflict shadow loser metadata, envelope-column parse, and mixed 207 response with local tests. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `recovery-proof-edge-function` (docs/workflow/roadmap/sync-v1.md:46) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(recovery-proof-edge-function): add recovery proof core`) · Edge Function core issues 32B/5min challenges, verifies unique canonical CBOR message + full payload hash + signature seam, rejects replay/tamper/expired/disallowed paths as E3014. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `single-table-todos-e2e` (docs/workflow/roadmap/sync-v1.md:47) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(single-table-todos-e2e): add local todos sync harness`) · local Phase 0.3 exit core covers same-transaction todo+outbox write, encrypted two-device push/pull, server dump opacity, and stale-write conflict shadow. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `protocol-integrity-integration-tests` (docs/workflow/roadmap/sync-v1.md:48) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(protocol-integrity-integration-tests): add protocol regression suite`) · local protocol regression suite covers blob-swap AAD binding, revision rollback E3015, no-proof recovery 401/E3014, mutation idempotency 10x, and Tauri crypto allowlist denial. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `rekey-two-phase` (docs/workflow/roadmap/sync-v1.md:49) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(rekey-two-phase): add rekey orchestration core`) · plugin-account rekey state machine, SQL start/swap/quarantine primitives, `/sync/push` E3033 guard, E3028 proof/mnemonic gate, preserved-revision staging, mnemonic rotation, and restart classification tests pass. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `tla-protocol-model` (docs/workflow/roadmap/sync-v1.md:50) | SHIPPED | SHIPPED 2026-05-23 (W0.D unblock; Homebrew openjdk@21 + tla2tools v1.8.0) · TLC bounded-exhaustive run on `docs/spec/sync.tla`: 12,165,098 states / 1,685,800 distinct / depth 22 / 0 in queue / all 7 invariants pass / no deadlock. Two spec-level over-assertions fixed in the model (`RecoveredDevicesHaveDEK` weakened to `recovered ∩ active`; `ReplayPending` success path cleans `conflictShadow` by mutation id). See `docs/spec/sync-model-check.md`. account_commit_seq equivocation remains a documented limitation.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `rls-fuzz-property` (docs/workflow/roadmap/sync-v1.md:51) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(rls-fuzz-property): add RLS property fuzz gate`) · fast-check Docker RLS harness builds 1000 users x 100 devices, randomized cross-tenant attempts leak 0 rows, and revoked/pending devices read 0 active-gated rows. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `rfc-test-vectors-gate` (docs/workflow/roadmap/sync-v1.md:52) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(rfc-test-vectors-gate): add crypto vector gate`) · RFC 9106 Argon2id, RFC 8032 Ed25519 verify_strict, RFC 9180 HPKE Base X25519/HKDF-SHA256/AES-256-GCM, RFC 8949 CBOR AAD cbor-x/cbor2 cross-check, and CI rfc-vectors job pass locally. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `audit-log-integrity` (docs/workflow/roadmap/sync-v1.md:53) | SHIPPED | SHIPPED 2026-05-19 (Codex serial autorun; local commit `feat(audit-log-integrity): add audit mirror`) · append-only audit integrity migration, HMAC device hash, count/last-hash summary, Docker SQL tests, and plugin-account E3025 local mirror mismatch detection. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `hardening-admission-gate` (docs/workflow/roadmap/sync-v1.md:54) | PENDING | W4 · **PHASE 4.8 → PHASE 5 GATE** · PRD §10.x 10-item admission checklist all-pass; blocks every Phase-5 feature<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `realtime-subscription` (docs/workflow/roadmap/sync-v1.md:55) | PENDING | W5 · Phase 5 · FR-SY-27~31 dev-plan T-21/22/25 · sync:<acct> private channel + RealtimeReceiver→pull + reconnect backoff · T7<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `all-entity-types-wiring` (docs/workflow/roadmap/sync-v1.md:56) | PENDING | W5 · Phase 5 · dev-plan T-23/24 · wire remaining entity_types per §4 sync matrix + per-entity integration test<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `offline-outbox-resilience` (docs/workflow/roadmap/sync-v1.md:57) | PENDING | W5 · Phase 5 · FR-SY-32~37/47~49/65/66/78 M-12/H-06 dev-plan T-30~34/56 · outbox same-txn + DAG replay + squash + reachability flush + backoff + dead-letter · T9<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `device-list-remote-revoke` (docs/workflow/roadmap/sync-v1.md:58) | PENDING | W5 · Phase 5 · FR-AC-14 H-11 dev-plan T-35 · settings device list + remote revoke → triggers Re-key · T11<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `mnemonic-full-recovery` (docs/workflow/roadmap/sync-v1.md:59) | PENDING | W5 · Phase 5 · FR-AC-10 FR-SY-13 dev-plan T-41 · full 24-word recovery: decrypt DEK→dek_check→reset→recovery proof→full pull + donor grant · T4<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `quota-rate-limit` (docs/workflow/roadmap/sync-v1.md:60) | PENDING | W5 · Phase 5 · FR-SY-62~64 dev-plan T-43/44/45 · 100 req/min/account + monthly cap read-only degrade + cost dashboard<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `data-export-encrypted` (docs/workflow/roadmap/sync-v1.md:61) | PENDING | W5 · Phase 5 · FR-SY-50/51/70 C-10 dev-plan T-50 · .json.age + .zip.age (key=HKDF(mp‖sk)) + plaintext 2nd-confirm · T13<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `oauth-passkey` (docs/workflow/roadmap/sync-v1.md:62) | PENDING | W5 · Phase 5 · FR-AC-06 H-12 · OAuth Apple/Google + Passkey + Secure Enclave KEK option · T1<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `supply-chain-hardening` (docs/workflow/roadmap/sync-v1.md:63) | PENDING | W5 · Phase 5 · R-18 H-13 dev-plan T-82 · cargo vet/crev + sigstore npm + dependency-review-action + Tauri strict + reproducible build + quarterly CVE runbook · T10<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `fuzz-harness-24h` (docs/workflow/roadmap/sync-v1.md:64) | PENDING | W5 · Phase 5 · FR-SY-14 dev-plan T-52 §5.2 · cargo-fuzz envelope_parse+decrypt, INDEPENDENT 24h 0 crash/panic · T1<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `credential-rotation-sop` (docs/workflow/roadmap/sync-v1.md:65) | PENDING | W5 · Phase 5 · FR-SY-59/60 R-10.8 M-05 dev-plan T-57 · docs/runbook/credential-rotation.md + rotation drill + graded response playbook · T8<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `sync-audit-conflict-ui` (docs/workflow/roadmap/sync-v1.md:66) | PENDING | W6 · Phase 5 · FR-SY-26/43/71 dev-plan T-34 · Console sync-status page + last 100 audit + conflict shadow recovery UI<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `device-pairing-anti-abuse` (docs/workflow/roadmap/sync-v1.md:67) | PENDING | W6 · Phase 5 · GAP-T2 NEW R-10.27 · pending-device rate-limit + unknown-device surge alert + donor anti-confirmation-fatigue UX · T11<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `account-deletion-gdpr` (docs/workflow/roadmap/sync-v1.md:68) | PENDING | W6 · Phase 5 · FR-AC-12/13 FR-SY-52 dev-plan T-51 · deletion request + 30d hard-delete cron + pre-delete forced export · compliance<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `recovery-rehearsal-1-server-wipe` (docs/workflow/roadmap/sync-v1.md:69) | PENDING | W6 · Phase 5 · PRD §10.2 ① dev-plan T-53 · server staging wipe → KEK decrypt → re-encrypt → push → device-B mnemonic recover → A/B consistent · T1 · INDEPENDENT<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `recovery-rehearsal-2-local-wipe` (docs/workflow/roadmap/sync-v1.md:70) | PENDING | W6 · Phase 5 · PRD §10.2 ② dev-plan T-54 · local SQLite wipe → login + donor grant DEK wrap → full pull < 5 min · INDEPENDENT<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `recovery-rehearsal-3-rekey-kill9` (docs/workflow/roadmap/sync-v1.md:71) | BLOCKED | BLOCKED 2026-05-19 (Codex serial autorun) · Rehearsal seed requires real Re-key, four `kill -9` process interruptions, restart, and consistency assertions; autorun rules require recovery rehearsals to be recorded as deferred rather than performed in this environment. Deferred gates recorded in docs/workflow/roadmap/sync-v1.deferred-gates.md<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `recovery-rehearsal-4-device-revoke-rekey` (docs/workflow/roadmap/sync-v1.md:72) | PENDING | W6 · Phase 5 · PRD §10.2 ④ R-10.11 dev-plan T-55b · revoke device A → device B Re-key → A cannot decrypt new blob even after re-login · INDEPENDENT<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `ga-acceptance-suite` (docs/workflow/roadmap/sync-v1.md:73) | PENDING | W7 · **GA GATE** · PRD §10.2 13-item + §10.3 M6 · 2-Mac+1-browser 30min 100%, property 100k, kill-9 ×100, clock-jump, toxiproxy, all PoCs, R-10.1~R-10.27 closure<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |

### web-ticktick-parity.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `web-architecture-adr-lite` (docs/workflow/roadmap/web-ticktick-parity.md:21) | SHIPPED | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, roadmap reconciled by ship run.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-plugin-map-contract-reconcile` (docs/workflow/roadmap/web-ticktick-parity.md:22) | SHIPPED | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, isolated scope push branch `ship/web-plugin-map-contract-reconcile`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-sync-crypto-contract-preflight` (docs/workflow/roadmap/web-ticktick-parity.md:23) | SHIPPED | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, commit `bc565ae` / ship evidence on `origin/main`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-external-env-provisioning` (docs/workflow/roadmap/web-ticktick-parity.md:24) | BLOCKED_EXTERNAL | W1 · EXTERNAL: domains/DNS, Vercel or CF project, OAuth redirect allowlists, Sentry/Vercel/Supabase secrets; blocks deployment, not local authoring.<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `web-release-site-archive-vite-shell` (docs/workflow/roadmap/web-ticktick-parity.md:25) | SHIPPED | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, pushed to `origin/main` at `d094845`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-auth-device-session` (docs/workflow/roadmap/web-ticktick-parity.md:26) | SHIPPED | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, commits `690e766`..`d219bd1` plus batch ship-state docs commit.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-browser-e2e-crypto-runtime` (docs/workflow/roadmap/web-ticktick-parity.md:27) | SHIPPED | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, commits `813205c`..`a789658` plus batch ship-state docs commit.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-sync-blob-driver` (docs/workflow/roadmap/web-ticktick-parity.md:28) | PENDING | W4 · @repo/core-data driver-sync-blob implementing Repository over /sync/pull and /sync/push.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-encrypted-indexeddb-cache` (docs/workflow/roadmap/web-ticktick-parity.md:29) | SHIPPED | SHIPPED 2026-05-22 · dev_log Status=SHIPPED, Current Phase=SHIP, implementation commit `48ca6ac` on `origin/main`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-console-host-router` (docs/workflow/roadmap/web-ticktick-parity.md:30) | SHIPPED | SHIPPED 2026-05-22 · dev_log Status=SHIPPED, Current Phase=SHIP, commits `6bbbf14`..`c8ce390` plus ship-state docs commit.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-todo-first-slice` (docs/workflow/roadmap/web-ticktick-parity.md:31) | SHIPPED | SHIPPED 2026-05-22 · dev_log Status=SHIPPED, Current Phase=SHIP, isolated scope push for W7 commits only.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-realtime-metadata-sync` (docs/workflow/roadmap/web-ticktick-parity.md:32) | PENDING | W8 · sync:<account_id> metadata-only channel, seq gap detection, pull queue, polling fallback, 5s visibility target.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-offline-outbox-conflicts` (docs/workflow/roadmap/web-ticktick-parity.md:33) | PENDING | W9 · Encrypted pending_mutations, dead-letter, replay order, 409 three-way diff UI.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-productivity-habits-pomodoro` (docs/workflow/roadmap/web-ticktick-parity.md:34) | BLOCKED_EXTERNAL | SUPERSEDED by xai-web-console rows #14/#15 (xai-web-pomodoro/xai-web-habits) per ADR-0007 §S9+§S10 (2026-05-23 authority override). Do not dispatch.<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `web-project-label-calendar` (docs/workflow/roadmap/web-ticktick-parity.md:35) | BLOCKED_EXTERNAL | SUPERSEDED by xai-web-console rows #7/#8/#9/#12 (board-core/board-views/board-workspaces/calendar) per ADR-0007 §S9+§S10. Do not dispatch.<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `web-search-keyboard-theme` (docs/workflow/roadmap/web-ticktick-parity.md:36) | BLOCKED_EXTERNAL | SUPERSEDED by xai-web-console rows #5/#21/#22 (shell search + settings-shell + settings-appearance) per ADR-0007 §S9+§S10. Do not dispatch.<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `web-statistics-views` (docs/workflow/roadmap/web-ticktick-parity.md:37) | BLOCKED_EXTERNAL | SUPERSEDED by xai-web-console row #20 (xai-web-statistics) per ADR-0007 §S9+§S10. Do not dispatch.<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `web-responsive-mobile` (docs/workflow/roadmap/web-ticktick-parity.md:38) | PENDING | W10 · Desktop/tablet/mobile breakpoints, mobile read/minimal-edit mode, a11y and safe-area rules.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-device-management-revoke` (docs/workflow/roadmap/web-ticktick-parity.md:39) | PENDING | W10 · Device list, revoke others, cross-tab session sync, revoked-device 403 interception.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-security-csp-sentry` (docs/workflow/roadmap/web-ticktick-parity.md:40) | SHIPPED | SHIPPED 2026-05-22 · dev_log Status=SHIPPED, Current Phase=SHIP, ship commit `568e557` on `origin/main` (chain `503a528`..`568e557`).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `web-export-delete-privacy` (docs/workflow/roadmap/web-ticktick-parity.md:41) | PENDING | W11 · Client-side zero-knowledge export, account deletion/undelete, consent, privacy/legal pages.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-pwa-sw-release` (docs/workflow/roadmap/web-ticktick-parity.md:42) | PENDING | W11 · Service worker, app manifest, update prompt, emergency kill/reset, PWA install behavior.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-i18n-seo-landing` (docs/workflow/roadmap/web-ticktick-parity.md:43) | PENDING | W11 · Landing/auth/legal SEO, sitemap/robots/meta, zh-CN/zh-TW/en resources.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-deploy-ci-browser-matrix` (docs/workflow/roadmap/web-ticktick-parity.md:44) | PENDING | W12 · GitHub Actions, Vercel/CF staging/prod, Playwright matrix, Lighthouse/size gates, RUM.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `web-ga-acceptance-suite` (docs/workflow/roadmap/web-ticktick-parity.md:45) | PENDING | W13 · Roadmap exit gate: PRD §10.1/§10.2 and brief acceptance criteria all pass or carry-over is explicit.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |

### xai-admin-dashboard-system-integration.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-admin-dashboard-shell` (docs/workflow/roadmap/xai-admin-dashboard-system-integration.md:17) | PENDING | Create the isolated admin surface decision and shell. Wire admin route guard through `@repo/web-auth-device-session`, admin-claim negative tests, and typed mock adapters that preserve the current prototype pages without production data access.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `xai-admin-data-contracts-rbac` (docs/workflow/roadmap/xai-admin-dashboard-system-integration.md:18) | PENDING | Define admin read models, permission keys, RBAC enforcement contract, and server/API boundary. No UI mutation may ship before this row is green.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `xai-admin-users-orgs-billing` (docs/workflow/roadmap/xai-admin-dashboard-system-integration.md:19) | PENDING | Connect Users, Organizations, and Billing pages to typed adapters/endpoints. Keep billing mutations gated until webhook-backed Stripe state exists.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `xai-admin-feature-ai-provider-control` (docs/workflow/roadmap/xai-admin-dashboard-system-integration.md:20) | PENDING | Connect feature flags, entitlements, AI quota, provider secret handles, and model routing. Browser must receive secret handles/status only, never provider keys.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `xai-admin-audit-ops-queue` (docs/workflow/roadmap/xai-admin-dashboard-system-integration.md:21) | PENDING | Build the immutable admin audit log and overview ops queue. Every guarded mutation must append actor/action/target/IP/result.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |
| `xai-admin-deploy-observability` (docs/workflow/roadmap/xai-admin-dashboard-system-integration.md:22) | PENDING | Add deployment isolation, CSP/env checks, observability, manual browser smoke, and release/operator runbook before promoting beyond prototype.<br>规划切片尚未完成；源代码候选或原型不证明此切片交付。 | 按本行依赖与授权顺序建立验收、实现 owner、持久化/恢复约束，再进入规划。 |

### xai-g0-window-spike.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `window-ground-truth` (docs/workflow/roadmap/xai-g0-window-spike.md:20) | SHIPPED | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Build commit `3b571f6`; evidence anchor complete.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `grid-window-prototype` (docs/workflow/roadmap/xai-g0-window-spike.md:21) | SHIPPED | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Runtime fixed/confirmed via commits `7b7ff35`, `f65a1b5`, `a33c74d`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `click-through-matrix` (docs/workflow/roadmap/xai-g0-window-spike.md:22) | SHIPPED | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Default runtime hit-test passes; MAS fallback risk tracked under G0.6.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `finder-dnd-path` (docs/workflow/roadmap/xai-g0-window-spike.md:23) | SHIPPED | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Tauri file/folder/.app/alias paths confirmed; `PRESERVE_ALIAS_PATH` in ADR-0005; commits `58c926d`, `18b48da`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `spaces-multimonitor-matrix` (docs/workflow/roadmap/xai-g0-window-spike.md:24) | SHIPPED | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. User confirmed Grid follows across Spaces/multi-display on DELL setup.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `mas-sandbox-dry-run` (docs/workflow/roadmap/xai-g0-window-spike.md:25) | BLOCKED_EXTERNAL | BLOCKED_EXTERNAL 2026-05-19 · `mas-sandbox` compile fallback passes private-API-disabled `cargo check`; Apple Developer/signed sandbox runtime evidence deferred and decoupled from G1 DMG/private path. Not shipped — requires Apple Developer signing environment. See docs/workflow/roadmap/xai-v1.deferred-gates.md Entry 13.<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |

### xai-g1-native-foundation.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `window-command-contract` (docs/workflow/roadmap/xai-g1-native-foundation.md:21) | SHIPPED | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Rust command contract, TS types, Organizer adapter, manifest, and contract docs verified. Commits `dce4fb9`, `1fa8c75`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `grid-shell-organizer-content` (docs/workflow/roadmap/xai-g1-native-foundation.md:22) | SHIPPED | SHIPPED 2026-05-20 (Track A) · Manifest promoted on `codex/track-a-desktop-foundation`. Production split commits: `26d9f57` (feat), `03ca86a` (docs ship promote), `3751f43` (dev_log ready).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `native-dnd-path-first` (docs/workflow/roadmap/xai-g1-native-foundation.md:23) | BLOCKED_EXTERNAL | Production implementation still blocked by MAS/security-scope evidence; skip under unattended mode and continue next eligible feature.<br>路线图明确阻塞；需保留外部依赖/被替代原因，不能计作可用功能。 | 先验证本行 Note 中阻塞条件；解除后以独立运行验收记录更新，冻结线只记影响。 |
| `multi-grid-event-scope` (docs/workflow/roadmap/xai-g1-native-foundation.md:24) | SHIPPED | SHIPPED 2026-05-20 (Track A) · Manifest promoted on `codex/track-a-desktop-foundation`. Event migration commits: `78aef01` (feat), `59da1e5` (docs ship promote), `44345cf` (dev_log ready).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `grid-persistence` (docs/workflow/roadmap/xai-g1-native-foundation.md:25) | SHIPPED | SHIPPED 2026-05-20 (Track A) · LayoutStore seam + Repository v0 adapter + async whiteout-safe hydrate; userTouched guard prevents late-hydrate clobber (P1 Beta); URL payload round-trip preserved. Commits `91dc6b6` (feat), `1b34b54` (P1 hardening). 46 vitest cases passing.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `host-business-residuals` (docs/workflow/roadmap/xai-g1-native-foundation.md:26) | SHIPPED | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Audit-only residual inventory complete; production cleanup remains blocked by G0/G1 sequencing.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |

### xai-web-ai-tool-edit-delete.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-ai-tool-edit-delete` (docs/workflow/roadmap/xai-web-ai-tool-edit-delete.md:20) | NEEDS_REVIEW | Extends SHIPPED create-only tool layer with edit/delete. 4 new tools (delete_task, delete_calendar_event, update_task, update_calendar_event) + tasks deleteCard/updateCard pure reducer actions + reuse calendar updateEvent/deleteEvent + 4 per-op event channels + owning-module update/delete subscribers + context id exposure for targeting. Delete phased before update. 4 phases. Carve-out `e404a45`.<br>此manifest被parser遗漏；路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-ai-tool-layer.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-ai-tool-layer` (docs/workflow/roadmap/xai-web-ai-tool-layer.md:20) | NEEDS_REVIEW | Full tool layer — READ context injection + WRITE tool-use (create_task + create_calendar_event) + mandatory confirmation + per-module write event channels + owning-module subscribers. 5 phases. Carve-out `e101bc6`.<br>此manifest被parser遗漏；路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-ai-tool-openai-compatible.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-ai-tool-openai-compatible` (docs/workflow/roadmap/xai-web-ai-tool-openai-compatible.md:20) | NEEDS_REVIEW | Lifts the openai-compatible tool deferral. Implements the OpenAI Chat Completions function-calling wire format (request tools/tool_choice + streaming delta.tool_calls index-keyed accumulation + finish_reason + tool-role result round-trip) on the adapter so the SHIPPED 6 create/edit/delete tools work on openai-compatible providers via the SAME provider-agnostic confirmation→event→owning-reducer path. Both providers converge on the SHIPPED internal ToolUseResult shape (NO new public type). Anthropic path byte-stable. Self-contained to 3 adapter files; NO events.ts/cross-plugin/apps/web/new-ch…（完整原行在JSON）<br>此manifest被parser遗漏；路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-calendar-event-create.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-calendar-event-create` (docs/workflow/roadmap/xai-web-calendar-event-create.md:24) | NEEDS_REVIEW | Single-row Calendar event CRUD feature. Lifts design.md §15.2 HC8 ("no event-creation/editing UI") per ADR-0010 §D4 carve-out. 5-phase build (P1 data layer / P2 composer dialog / P3 toolbar+Month wire / P4 Week/Day+recurrence / P5 HC8 lift+verify). Realistic v1 — daily/weekly recurrence only, no monthly, no until-date, no cross-device sync, no external calendar. NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `plugin-web-tokens` edit. Uses `xai_calendar_events` new localStorage key (registry additive) + new internal `eventStore` directory in `packages…（完整原行在JSON）<br>路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-console-gap-closure.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-pomodoro-counters-test-fix` (docs/workflow/roadmap/xai-web-console-gap-closure.md:24) | SHIPPED | W0 · test-only fix · plugin-web-pomodoro · pipeline validator · SHIPPED 2026-05-24 (commits 1a9ba10/235eca1/3035a85/6efb275 pushed to origin/main); 122/122 plugin + 100/100 web tests pass. Pipeline-validator confirmed end-to-end (bug-diagnose → bug-fix → bug-verify → roadmap-loop reconcile → ship).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-ai-chat-real-llm-adapter` (docs/workflow/roadmap/xai-web-console-gap-closure.md:25) | SHIPPED | W1 · SHIPPED 2026-05-25 (commits 86403e8/6b910eb/9209aa4/d26b63e/2c13ed4/477cfb2/8b9dc2f/ade513b pushed to origin/main). 146+93+101+88 tests pass; ADR-0008 §S3 D3 amended as wave 1+2+3 CSP binding precedent. 5 deferred residual risks (R1 manual smoke / R2 cross-vendor cold-read / R3 web-auth-device-session PLUGIN_MAP row / R4 Vite dev no _headers / R5 OpenAI base URL not in CSP) documented in verify-report + Ship Report.<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-cmdk-search` (docs/workflow/roadmap/xai-web-console-gap-closure.md:26) | SHIPPED | W1 · SHIPPED 2026-05-25 (commits 74ce9bb/59d7989/1b3efda/6575054/f8ef2e1/8caad35/3b9c200/99acf36/612074b pushed to origin/main). 137+85+106 tests pass; PB1 p95=0.001ms (50ms budget); escapeHtml 12-case + rendered-DOM XSS guards; 11 pure-fn adapters; Codex cold-read XSS audit + cross-vendor manual smoke deferred 24h per ADR-0008 carve-out (documented in verify-checklist + cross-vendor-smoke reviews).<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-calendar-week-day-views` (docs/workflow/roadmap/xai-web-console-gap-closure.md:27) | SHIPPED | W1 · SHIPPED 2026-05-25 (commits b5a7033/bd90327/2de234a/bfe66ea/73490bf/cdb80a8/22144e0 pushed to origin/main). 197+88+106 tests pass; PB-EXT-1 perf OK; HC1-HC11 + 5 acceptance signals all met; Week 7×24 + Day 1×24 + pill-segmented toggle + xai_calendar_view persistence + activeDate SoT refactor + ComingSoonPanel deleted; 4 deferred residuals (XVENDOR-EXT 24h / Codex 5 cold-read 24h / MAY_2026_ANCHOR carryover / jsdom scrollTop presence-only).<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-dashboard-add-widget-picker` (docs/workflow/roadmap/xai-web-console-gap-closure.md:28) | SHIPPED | W1 LAST · SHIPPED 2026-05-25 (commits 4379897/be9b652/57d93ad/903717b/bf37d13 pushed to origin/main). 151+93+106 tests pass; HC1-HC10 + REC-1 emit-before-close + REC-2 backdrop-click mirror; native `<dialog>` picker; duplicate prevention. **WAVE 1 COMPLETE — 5/5 SHIPPED.** Cross-vendor smoke deferred 24h per ADR-0008 carve-out (must complete before xai-web-deploy-cloudflare reaches READY_TO_SHIP).<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-board-filter-share-map` (docs/workflow/roadmap/xai-web-console-gap-closure.md:29) | SHIPPED | W2 first · SHIPPED 2026-05-25 (12 commits 389ee17..a86f58f pushed to origin/main). 516/516 tests pass; Leaflet 149.90 KB lazy-chunk; OSM tile CSP via ADR-0008 §S3 D3 SECOND amendment; 3 deferred residuals (RR-1 cross-vendor 24h / RR-2 main bundle informational / RR-3 manual smoke 24h).<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-settings-integrations-3rd-party` (docs/workflow/roadmap/xai-web-console-gap-closure.md:30) | SHIPPED | W2 · SHIPPED 2026-05-26 (13 commits 85bf836..5085a03 + orphan plan-docs 0e9ca34 pushed to origin/main). 361/361 tests; RFC 7636 §B.1 PKCE verified; ADR-0008 §S3 D3 THIRD amend (3 OAuth token endpoints). 3 deferred residuals (R5 frame-src cross-vendor / R6 Disconnect doesn't revoke provider grant / P6 Codex cold-read 24h carve-out).<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-settings-premium-stripe` (docs/workflow/roadmap/xai-web-console-gap-closure.md:31) | SHIPPED | W2 · SHIPPED 2026-05-26 (8 commits 0a17b3e..00580dd pushed to origin/main). 498/498 tests; ADR-0008 §S3 D3 FOURTH amend (Stripe hostnames); no-SK + no-Stripe.js guards 0 matches; preemptive RouteErrorBoundary union (cycle-2 B2 lesson absorbed); render-prop PremiumTierBadge resolves circular dep. 3 deferred residuals (R4 client-clock rewindable / R5 frame-src cross-vendor / P6 Codex 6-item cold-read 24h carve-out).<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-settings-account-delete-wire` (docs/workflow/roadmap/xai-web-console-gap-closure.md:32) | SHIPPED | W2 LAST · SHIPPED 2026-05-26 (10 commits 91e3bc6..8b8933c pushed to origin/main). 485/485 tests; 6 critical security gates green; web-auth-device-session extended with deleteAccount(). **🎉 WAVE 2 COMPLETE (rows #6/#7/#8/#9) + 9-ROW GAP-CLOSURE MANIFEST COMPLETE (rows #1-#9 all SHIPPED) — unblocks P1 Desktop pivot per ADR-0009 §D2-G3.**<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |

### xai-web-console.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-build-form-adr` (docs/workflow/roadmap/xai-web-console.md:23) | SHIPPED | W0 · ADR-0007 Accepted; 3 commits (f167310/c4f1f1b/fe8444a) pushed 2026-05-23; all 13 verify gates PASS; SHIPPED.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-tokens-and-i18n` (docs/workflow/roadmap/xai-web-console.md:24) | SHIPPED | W1 · @repo/plugin-web-tokens; 3 commits (e44bbc3/c9079c9/6c556e6); 50/50 tests pass; 12/12 verify gates PASS; SHIPPED 2026-05-23 (pushed in row #1 ship batch b0f4fdd..65fcd97).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-persistence-contract` (docs/workflow/roadmap/xai-web-console.md:25) | SHIPPED | W1 · @repo/plugin-web-storage; 3 commits (ce6270c/0109326/3085911); 70/70 tests pass; 11/11 verify gates PASS; SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-event-bus` (docs/workflow/roadmap/xai-web-console.md:26) | SHIPPED | W1 · @repo/xai-web-event-bus + 5 web:* in @repo/core; 2 commits (a798384/0cb8e27); 18+4+37/59 tests pass; 13/13 verify gates PASS; SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-shell` (docs/workflow/roadmap/xai-web-console.md:27) | SHIPPED | W1b · @repo/xai-web-shell; 5 commits (5a1ef24/d4a6777/b5b5fa6/b75db5f/7da2733); 84+46 tests pass; vite build green; 17/17 verify gates PASS; SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-tasks` (docs/workflow/roadmap/xai-web-console.md:28) | SHIPPED | W2b · @repo/plugin-web-tasks; 3 commits (3c0d6bd/e5ac21b/bbaae81); 40/40 tests pass; 14/14 verify gates PASS; SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-core` (docs/workflow/roadmap/xai-web-console.md:29) | SHIPPED | W2d · @repo/plugin-web-board-core; 4 commits (f991cba/8226aae/cc52060/24567e9); 104/104 tests pass; 7/7 verify gates PASS; SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-views` (docs/workflow/roadmap/xai-web-console.md:30) | SHIPPED | W2e · @repo/plugin-web-board-views; 4 commits (0649c0b/1114cba/0f6ca12/d2594b7); 90/90 tests pass; 17/17 verify gates PASS. SHIPPED 2026-05-23 (chore fc3a0ba); post-bugfix re-ship 2026-05-24 (chore 0bfe9e9).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-workspaces` (docs/workflow/roadmap/xai-web-console.md:31) | SHIPPED | W2e · @repo/plugin-web-board-workspaces; 4 commits (214f28f/a107980/fdd1521/05734c3); 135/135 tests pass; 6/6 verify gates PASS. SHIPPED 2026-05-23 (chore 5f00476).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-dashboard-grid` (docs/workflow/roadmap/xai-web-console.md:32) | SHIPPED | W2d · @repo/plugin-web-dashboard-grid; 4 commits (2d9655f/7691f97/7daa255/78e1b43); 104/104 tests pass; 15/15 verify gates PASS. SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-dashboard-widgets` (docs/workflow/roadmap/xai-web-console.md:33) | SHIPPED | W2e · @repo/plugin-web-dashboard-widgets; 4 commits (9a78d17/b4bcf22/95bbdc8/e9891de); 93+104+70+54 tests pass; 15/15 verify gates PASS. SHIPPED 2026-05-23 (chore 4f64683).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-calendar` (docs/workflow/roadmap/xai-web-console.md:34) | SHIPPED | W2c · @repo/plugin-web-calendar; 5 commits (b9c5267/19616e2/9a69d75/e32cd0a/f3a9194); 90/90 tests pass; 17/17 verify gates PASS; SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-matrix` (docs/workflow/roadmap/xai-web-console.md:35) | SHIPPED | W2a · @repo/plugin-web-matrix; 4 commits (439cd9c/3161a3c/b9e1143/a0cf47e); 54/54 tests pass; 15/15 verify gates PASS. SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-pomodoro` (docs/workflow/roadmap/xai-web-console.md:36) | SHIPPED | W2b · @repo/plugin-web-pomodoro; 4 commits (13038fc/4f794fd/1b1ce4c/8e173db); 122/122 tests pass; 14/14 verify gates PASS. SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-habits` (docs/workflow/roadmap/xai-web-console.md:37) | SHIPPED | W2b · @repo/plugin-web-habits; 5 commits (d096f37/6d39407/3b4f63d/d391268 + chore-ship); 118/118 tests pass; 17/17 verify gates PASS. SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-meditation` (docs/workflow/roadmap/xai-web-console.md:38) | SHIPPED | W2c · @repo/plugin-web-meditation; 3 commits (812c009/dcd9abd/710b995); 95/95 tests pass; 14/14 verify gates PASS. SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-countdown` (docs/workflow/roadmap/xai-web-console.md:39) | SHIPPED | W2a · @repo/plugin-web-countdown; 5 commits (ead2916/bf01ff4/a6de6a0/e78aeee); 110/110 tests pass; 14/14 verify gates PASS. SHIPPED 2026-05-23.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-ai-chat` (docs/workflow/roadmap/xai-web-console.md:40) | SHIPPED | W2c · @repo/plugin-web-ai-chat; 5 commits (fa748a1/a94c91b/9a69d75/8e1f5e8/8c758e8); Option A no-op claude.complete adapter; 84/84 plugin + 51/51 web tests pass. SHIPPED 2026-05-23 (chore e0bca9c); post-bugfix re-ship 2026-05-24 (chore 37be4e5 + chore e02ef6f).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-pet` (docs/workflow/roadmap/xai-web-console.md:41) | SHIPPED | W2a · @repo/plugin-web-pet; 4 commits (67d2aa1/8c37023/5fb9e7b/9537b65); 129/129 tests pass; 17/17 verify gates PASS. SHIPPED 2026-05-23 (chore 6ebae93).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-statistics` (docs/workflow/roadmap/xai-web-console.md:42) | SHIPPED | W3 · @repo/plugin-web-statistics; 4 commits (8226aae/363999f/4f26fca/8483382); 124/124 tests pass; verify gates PASS. SHIPPED 2026-05-23 (chore 1cce362 + record fd3e354).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-settings-shell` (docs/workflow/roadmap/xai-web-console.md:43) | SHIPPED | W4a · @repo/plugin-web-settings-shell; 4 commits (3cb7e6a/f637a3d/39da7af/46ebcf6); 49/49 tests pass; verify gates PASS. SHIPPED 2026-05-23 (chore 9bdd7c1).<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |

### xai-web-dashboard-real-data.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-dashboard-real-data` (docs/workflow/roadmap/xai-web-dashboard-real-data.md:22) | NEEDS_REVIEW | Single-row read-only real-data wiring (item-3 local cluster #2; consolidates carve-out 3d-i + 3d-ii). Rewires 5 of the SHIPPED 10 widgets — `StatTasks`/`StatStreak`/`StatPomos`/`UpcomingWidget`/`MiniCalWidget` — from hardcoded constants / fixtures to REAL local-store reads via `usePref(<key>)` + a LOCAL narrowing predicate (the SHIPPED Statistics + Cmd-K cross-module-read law: NO plugin import; only `@repo/plugin-web-storage` + the key string). **CRITICAL recon corrections (discovery §3):** pomodoro reads canonical `finishedAt`+`completed` (NOT Cmd-K's stale `completedAt`); tasks cards live…（完整原行在JSON）<br>路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-dashboard-stickies-create.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-dashboard-stickies-create` (docs/workflow/roadmap/xai-web-dashboard-stickies-create.md:22) | NEEDS_REVIEW | Single-row store-from-scratch sticky-create feature (CLOSEST precedent = SHIPPED `xai-web-calendar-event-create`, NOT Tasks/Matrix). Wires the no-op StickiesWidget header `+` (`StickiesWidget.tsx:24-27`, D-21 / Audit #6) to a new `StickyComposer` native `<dialog>` mirroring `EventComposer`/`TaskComposer`/`MatrixComposer`. Builds a from-scratch store under a NEW authorized registry key `xai_dashboard_stickies` (codec json, default `{}`, owner `xai-web-dashboard-widgets`, category module, schemaVersion 1, proposed false — byte-parallel to `xai_calendar_events` registry.ts:943-950) + 2 parity-…（完整原行在JSON）<br>路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-dashboard-weather-mail.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-dashboard-weather-mail` (docs/workflow/roadmap/xai-web-dashboard-weather-mail.md:24) | NEEDS_REVIEW | Single-row, 2-phase widget-transform feature (item-3 local cluster #5; 4 of the cluster already SHIPPED — stickies §E / real-data §F / smart-list / statistics-real-aggregation; after #5 only 3e AI remains). Repurposes 2 of the SHIPPED 10 widgets from mock fiction to REAL local widgets. **Phase A — Weather → manual-entry (WRITE):** a from-scratch SINGLETON store `UserWeather \/ null` (`{city; temp; condition: "sunny"\/"cloudy"\/"rainy"; hi?; lo?; updatedAt}`) under a NEW AUTHORIZED registry key `xai_dashboard_weather` (codec json, default `null`, owner `xai-web-dashboard-widgets`, schemaVers…（完整原行在JSON）<br>路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-matrix-card-create.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-matrix-card-create` (docs/workflow/roadmap/xai-web-matrix-card-create.md:22) | READY_FOR_VERIFY | Single-row Matrix card-create feature (mirror of SHIPPED `xai-web-tasks-card-create`). Wires the no-op header `+` (`MatrixModule.tsx:39-41`, M-01) + per-quadrant `+` (`Quadrant.tsx:81-83`, M-03) to a new `MatrixComposer` native `<dialog>` mirroring `TaskComposer`/`EventComposer`/`BoardDeleteConfirmDialog`. Adds ONE pure reducer action `addCard` in a new `internal/create.ts` (`move.ts` has only `moveCardTo` today — confirmed in discovery R1/R2) + new `internal/ids.ts` `createMatrixId()` (mirrors Tasks `ids.ts`) + `NewMatrixCardDraft` type + local `internal/strings.ts` `STR_MATRIX_COMPOSER` (…（完整原行在JSON）<br>路线图READY_FOR_VERIFY落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-project-module.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-project-prd-sync` (docs/workflow/roadmap/xai-web-project-module.md:18) | SHIPPED | Align Web PRD, PLUGIN_MAP, and product structure docs around `/app/board` vs formal Project naming. Shipped in `e79ecc5`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-card-detail` (docs/workflow/roadmap/xai-web-project-module.md:19) | SHIPPED | Wire card click to detail modal/page with title, description, checklist, dates, labels, members, links, and activity notes. Shipped in `de9e120`.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-date-model` (docs/workflow/roadmap/xai-web-project-module.md:20) | SHIPPED | Replace display date strings with typed ISO fields and derived today/overdue labels across Board/Table/Calendar/Timeline/Dashboard. Shipped through `6661e51` plus ship docs/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-list-crud` (docs/workflow/roadmap/xai-web-project-module.md:21) | SHIPPED | Add rename, delete/archive, and reorder for lists. Shipped through `bd8066d` plus verify/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-card-crud` (docs/workflow/roadmap/xai-web-project-module.md:22) | SHIPPED | Add card rename, archive/delete, and within-list reorder; preserve stable ordering. Shipped through `b87d8de` plus verify/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-checklist-editor` (docs/workflow/roadmap/xai-web-project-module.md:23) | SHIPPED | Formalize card-detail checklist add/toggle/edit/remove, derived progress, and empty-list chip clearing. Shipped through `aeb4ee2` plus verify/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-storage-contract` (docs/workflow/roadmap/xai-web-project-module.md:24) | SHIPPED | Define v1 envelope read/migration/write-preservation helpers for `xai_boards_v2` and lossless board/list/card logical entity projection. Shipped through `5dc2276` plus verify/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-task-link` (docs/workflow/roadmap/xai-web-project-module.md:25) | SHIPPED | Link/create Task from Board card; surface linked task status in card detail. Shipped through `79a8bf3` plus verify/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-calendar-feed` (docs/workflow/roadmap/xai-web-project-module.md:26) | SHIPPED | Feed active dated Board cards into Calendar Month/Week/Day without duplicating calendar data ownership. Shipped through `de4158e` plus verify/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-saved-filters` (docs/workflow/roadmap/xai-web-project-module.md:27) | SHIPPED | Persist per-board filters and support clear/reset. Shipped through `dfe7fbd` plus verify/live smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-share-contract` (docs/workflow/roadmap/xai-web-project-module.md:28) | SHIPPED | Visibly label mock share URL and emit explicit mock share-envelope fields. Shipped through `1806ee4` plus verify/live smoke.<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-board-responsive-smoke` (docs/workflow/roadmap/xai-web-project-module.md:29) | SHIPPED | Verify Board/Table/Calendar/Timeline/Detail on desktop and mobile widths. Shipped through `4712786` plus desktop/mobile Playwright smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-export-import` (docs/workflow/roadmap/xai-web-project-module.md:30) | SHIPPED | Add board logical entities to export/import/delete flows. Shipped through `128f4be` plus package/web verification.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-automation-lite` (docs/workflow/roadmap/xai-web-project-module.md:31) | SHIPPED | Preset rules only: Done completion, due-soon urgent label, daily due sort. Shipped through `3a678cd` plus package/web verification and Chrome smoke.<br>路线图是历史交付凭据；没有绑定当前 HEAD 的本行运行验证结果。 | 保留已有交付；为本行 owner 补 commit、环境、测试命令/结果及运行恢复证据链接，避免历史 PASS 泛化。 |
| `xai-web-board-integrations` (docs/workflow/roadmap/xai-web-project-module.md:32) | SHIPPED | Board-core provider adapter metadata plus card-detail typed integration links shipped through `34efdc6`; real third-party sync remains future work.<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-board-comments-activity` (docs/workflow/roadmap/xai-web-project-module.md:33) | SHIPPED | Card-detail comments plus backward-compatible activity notes shipped through `3dd4b81`; mention notifications remain future collaboration work.<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |
| `xai-web-board-permissions` (docs/workflow/roadmap/xai-web-project-module.md:34) | SHIPPED | Private/shared Board visibility state plus Share payload disclosure shipped through `a1fe590`; real ACL/share-token backend remains future work.<br>SHIPPED 只覆盖本行限定实现；Note 中仍有模拟/未来工作/运行验收延期。 | 把本行残余门禁拆为可追踪 issue，用户界面明确模拟状态；用实际后端/浏览器证据逐项关闭。 |

### xai-web-statistics-real-aggregation.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-statistics-real-aggregation` (docs/workflow/roadmap/xai-web-statistics-real-aggregation.md:23) | NEEDS_REVIEW (B1 revised → re-review) | Single-row read-only real-data swap (item-3 local cluster #4; after T-10 ✅ + dashboard-real-data ✅ + smart-list ✅). **Post-review B1 (Path 1):** user-visible "current board" marker on KPI + BarChart panel via LOCAL `internal/strings.ts` STR (ZERO `plugin-web-tokens` edit); REC-1 (BarChart consistency) + REC-2 (dual JSDoc) folded in. Awaiting re-review. **RETIRES the SHIPPED pomodoro-as-tasks-completed proxy** (`internal/aggregators.ts:14-19` JSDoc + L110-130 logic) and replaces it with a REAL `done`-count read of `xai_task_cols` (the SHIPPED key T-10 made carry `TaskCard.done?: boolean`). N…（完整原行在JSON）<br>路线图NEEDS_REVIEW (B1 revised → re-review)落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-tasks-card-create.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-tasks-card-create` (docs/workflow/roadmap/xai-web-tasks-card-create.md:21) | APPROVED | Single-row Tasks card-create feature. Wires the no-op column `+` (`TaskColumn.tsx:68-74`, `col.action==="add"`) to a new `TaskComposer` native `<dialog>` mirroring `EventComposer`/`BoardDeleteConfirmDialog`/`SignOutConfirmDialog`. Adds ONE pure reducer action `addCard` (tasksReducer.ts has only `moveCard`+`toggleComplete` today — confirmed in discovery) + new `internal/ids.ts` `createTaskId()` (mirrors calendar `eventStore/ids.ts`) + `NewTaskDraft` type + local `internal/strings.ts` STR (en+zh). State lifted into `TasksModule` (no new `web:*` channel — Calendar Q5-A). Reuses existing `xai_t…（完整原行在JSON）<br>路线图APPROVED落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

### xai-web-tasks-smartlist-filter.md

| Feature / 证据 | 记录状态 | 已知现状与问题 | 建议 |
|---|---|---|---|
| `xai-web-tasks-smartlist-filter` (docs/workflow/roadmap/xai-web-tasks-smartlist-filter.md:21) | NEEDS_REVIEW | Single-row Tasks smart-list-filter feature. Makes the sidebar smart-list rows (All/Today/Tomorrow/Next7/Inbox/Summary) REALLY filter the 4-bucket board — today they only flip a `data-active` highlight (`activeList` trapped in `TasksSidebar.tsx:56` local useState, never lifted to `TasksModule`, never applied → entire left sidebar is a cosmetic no-op, audit T-01). Lifts `activeList` into `TasksModule` via props+callback (controlled sidebar; NO new `web:*` channel — card-create Iteration-2 / Calendar Q5-A precedent). Adds ONE pure view selector `filterCardsByList(cols, list, now?)` in `interna…（完整原行在JSON）<br>路线图NEEDS_REVIEW落后于对应dev_log迭代SHIPPED，实际实现与管理记录不一致。 | 按对应Target的Status Panel与ship证据对齐roadmap；看板按迭代汇总，保留验收延期与部署状态，不能只读文件首个表格。 |

## 129 个 package 目录逐项核对

代码数只统计该目录源码型文件，测试列为本地测试文件数量，不是断言数/本次通过数。`文档锚点/外部owner` 表示实现可能在其他包、Rust、SQL或脚本，不表示功能缺失。`无manifest` 对基础包和docs anchor正常。已识别的 owner 和 imports 保存在 JSON，不能根据本表目录数推断运行覆盖。

| 目录 | package / manifest | 实现/挂载线索 | dev_log 状态 | 测试文件 | 对账建议 |
|---|---|---|---|---:|---|
| `account-signup-login` | 无 / 无 | 文档锚点/外部owner | Shipped locally with deferred runtime gates | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `aes-gcm-aead-core` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `audit-log-integrity` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `bip39-mnemonic-24w` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `cipher-envelope-codec` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `click-through-matrix` | 无 / 无 | 文档锚点/外部owner | READY_TO_SHIP; DONE. Commit: `(this commit)`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `commit-seq-authority` | 无 / 无 | 文档锚点/外部owner | Shipped locally with deferred Supabase deploy | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `core` | 有 / 无 | 本目录 20 个源码文件；Web host import；Desktop host import | 独立日志未设置/见共享文档 | 2 | 共享基础/配置：关联中央合同与消费方集成测试；无产品PRD正常 |
| `core-data` | 有 / 无 | 本目录 14 个源码文件 | 独立日志未设置/见共享文档 | 10 | 共享基础/配置：关联中央合同与消费方集成测试；无产品PRD正常 |
| `core-data-sqlite-driver` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `crypto-deps-lockdown` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `crypto-tauri-commands` | 无 / 无 | 文档锚点/外部owner | Shipped locally with deferred runtime gates | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `deterministic-cbor-aad` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `ed25519-recovery-signing` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `eslint-config` | 有 / 无 | 本目录 3 个源码文件 | 独立日志未设置/见共享文档 | 0 | 共享基础/配置：关联中央合同与消费方集成测试；无产品PRD正常 |
| `finder-dnd-path` | 无 / 无 | 文档锚点/外部owner | READY_TO_SHIP; DONE. Commit: `(this commit)`.; DONE. Commit: `7e20ca8`.; DONE. Commit: `58c926d`.; DONE. Commit: `18b48da`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `grid-persistence` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. Commit: `dcf2750`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `grid-shell-organizer-content` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. Commit: `eaae46e`.; DONE. Commit: `26d9f57`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `grid-window-prototype` | 无 / 无 | 文档锚点/外部owner | READY_TO_SHIP; DONE. Commit: `6b121ea`.; READY_TO_SHIP. Deferred gates remain recorded for independent review/verify and any deeper alpha/beta scoped-event evidence. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `host-business-residuals` | 无 / 无 | 文档锚点/外部owner | READY_TO_SHIP; DONE. Commit: `(this commit)`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `hpke-per-device-wrap` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `kdf-primitives` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `keychain-bridge-macos` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `keychain-opaque-handle` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `localstorage-migration` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `mas-sandbox-dry-run` | 无 / 无 | 文档锚点/外部owner | BLOCKED_EXTERNAL; DONE. Commit: `(this commit)`.; DONE. Commit: `2fda0c8`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `menubar-sync-status-icon` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `multi-grid-event-scope` | 无 / 无 | 文档锚点/外部owner | READY_TO_SHIP; DONE. Commit: `a7d4803`.; DONE. Commit: `78aef01`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `native-dnd-path-first` | 无 / 无 | 文档锚点/外部owner | BLOCKED; DONE. Commit: `707a8d1`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `nonce-lease-server` | 有 / 无 | 本目录 1 个源码文件 | 日志无可识别规范状态 | 1 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `onboarding-backfill-ui` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `plugin-account` | 有 / 有 | 本目录 18 个源码文件；Desktop host import | In-Dev | 10 | 实际挂载与workflow验证分离；按最新迭代补verify/ship凭据 |
| `plugin-ai-cube` | 有 / 有 | 本目录 21 个源码文件；Desktop host import | SHIPPED | 5 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-calendar` | 有 / 有 | 本目录 11 个源码文件 | 日志无可识别规范状态 | 1 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `plugin-clipboard` | 有 / 有 | 本目录 11 个源码文件 | READY_FOR_VERIFY | 1 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `plugin-console` | 有 / 有 | 本目录 19 个源码文件；Desktop host import | SHIPPED; DONE. | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-labels` | 有 / 有 | 本目录 11 个源码文件；Desktop host import | SHIPPED; READY_FOR_VERIFY | 3 | 实际挂载与workflow验证分离；按最新迭代补verify/ship凭据 |
| `plugin-organizer` | 有 / 有 | 本目录 28 个源码文件；Desktop host import | SHIPPED; ACTIVE — multiple G3 features landed via Track A unattended batch | 13 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-pet` | 有 / 有 | 本目录 12 个源码文件 | 日志无可识别规范状态 | 2 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `plugin-productivity` | 有 / 有 | 本目录 24 个源码文件；Web host import；Desktop host import | SHIPPED | 7 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-project` | 有 / 有 | 本目录 10 个源码文件 | SHIPPED | 2 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `plugin-web-ai-chat` | 有 / 有 | 本目录 32 个源码文件；Web host import | 独立日志未设置/见共享文档 | 29 | 实现/日志命名分离：显式关联xai-web-*锚点，避免统计遗漏 |
| `plugin-web-board-core` | 有 / 有 | 本目录 23 个源码文件 | SHIPPED | 21 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-web-board-views` | 有 / 有 | 本目录 20 个源码文件 | SHIPPED | 16 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-web-board-workspaces` | 有 / 有 | 本目录 28 个源码文件；Web host import | SHIPPED | 21 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-web-bookkeeping` | 有 / 有 | 本目录 15 个源码文件；Web host import | READY_TO_REVIEW | 4 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `plugin-web-countdown` | 有 / 有 | 本目录 21 个源码文件；Web host import | 独立日志未设置/见共享文档 | 13 | 实现/日志命名分离：显式关联xai-web-*锚点，避免统计遗漏 |
| `plugin-web-metric-tracker` | 有 / 无 | 本目录 13 个源码文件；Web host import | READY_FOR_VERIFY | 4 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `plugin-web-pomodoro` | 有 / 有 | 本目录 23 个源码文件；Web host import | SHIPPED | 16 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-web-settings-rest` | 有 / 有 | 本目录 40 个源码文件；Web host import | SHIPPED; APPROVED → feature-auto-build. | 39 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-web-settings-shell` | 有 / 有 | 本目录 17 个源码文件；Web host import | SHIPPED; SHIPPED. Sibling rows #22 (xai-web-settings-appearance), #23 (features-panel), #24 (rest) may now proceed. | 11 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `plugin-web-statistics` | 有 / 有 | 本目录 28 个源码文件；Web host import | 独立日志未设置/见共享文档 | 22 | 实现/日志命名分离：显式关联xai-web-*锚点，避免统计遗漏 |
| `plugin-web-storage` | 有 / 无 | 本目录 8 个源码文件；Web host import | 独立日志未设置/见共享文档 | 10 | 实现/日志命名分离：显式关联xai-web-*锚点，避免统计遗漏 |
| `plugin-web-time-tracker` | 有 / 有 | 本目录 12 个源码文件；Web host import | READY_TO_SHIP | 3 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `plugin-web-tokens` | 有 / 有 | 本目录 5 个源码文件；Web host import | 独立日志未设置/见共享文档 | 6 | 实现/日志命名分离：显式关联xai-web-*锚点，避免统计遗漏 |
| `plugin-widgets` | 有 / 有 | 本目录 11 个源码文件 | 日志无可识别规范状态 | 1 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `protocol-integrity-integration-tests` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `push-edge-function` | 有 / 无 | 本目录 1 个源码文件 | 日志无可识别规范状态 | 1 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `realtime-private-channel-config` | 有 / 无 | 本目录 1 个源码文件 | Shipped locally with deferred Supabase deploy | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `recovery-proof-edge-function` | 有 / 无 | 本目录 1 个源码文件 | 日志无可识别规范状态 | 1 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `recovery-rehearsal-3-rekey-kill9` | 有 / 无 | 本目录 1 个源码文件 | BLOCKED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `rekey-two-phase` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `repository-v0-contract` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `rfc-test-vectors-gate` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `rls-fuzz-property` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `rls-policies-and-tests` | 有 / 无 | 本目录 1 个源码文件 | 日志无可识别规范状态 | 1 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `roadmap-kickoff` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `rust-keyvault-opaque-handle` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `single-table-todos-e2e` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `spaces-multimonitor-matrix` | 无 / 无 | 文档锚点/外部owner | READY_TO_SHIP; DONE. Commit: `(this commit)`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `sqlcipher-local-db` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `supabase-schema-migrations` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `sync-engine-pull` | 无 / 无 | 文档锚点/外部owner | 日志无可识别规范状态 | 0 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `sync-engine-push` | 无 / 无 | 文档锚点/外部owner | 日志无可识别规范状态 | 0 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `tauri-capability-allowlist` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `tla-protocol-model` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `typescript-config` | 有 / 无 | 文档锚点/外部owner | 独立日志未设置/见共享文档 | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `ui` | 有 / 无 | 本目录 6 个源码文件 | SHIPPED | 0 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `web-architecture-adr-lite` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-auth-device-session` | 有 / 无 | 本目录 18 个源码文件；Web host import | SHIPPED; DONE (`690e766`).; DONE (`7186d5f`).; DONE (`15a297a`). | 11 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `web-browser-e2e-crypto-runtime` | 有 / 无 | 本目录 14 个源码文件 | SHIPPED; DONE (`813205c`, parent rescue commit).; DONE (`10c8b8a`).; DONE (`40f6905`). | 12 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `web-console-host-router` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE (`6bbbf14`).; DONE (`18a30c2`).; DONE (`41db694`). | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-encrypted-indexeddb-cache` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-plugin-map-contract-reconcile` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-release-site-archive-vite-shell` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE (`f7c9de4`).; DONE (`14f2597`).; DONE (`26d1bf6`). | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-security-csp-sentry` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE (commit `029246a`).; DONE (commit `c55bcc8`).; DONE (commit `28f74fb`).; DONE (commit `7e5e46f`). | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-sync-blob-driver` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE (`7a26f5d`).; DONE (`d653181`).; DONE (`b72b234`; superseded runtime drift repair: `4a554e1`). | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-sync-crypto-contract-preflight` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `web-todo-first-slice` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `window-command-contract` | 无 / 无 | 文档锚点/外部owner | SHIPPED; DONE. Commit: `(this commit)`.; DONE. Commit: `dce4fb9`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `window-ground-truth` | 无 / 无 | 文档锚点/外部owner | READY_TO_SHIP; DONE. Commit: `3b571f6`. | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `x25519-device-keypair` | 有 / 无 | 本目录 1 个源码文件 | SHIPPED | 1 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-ai-chat` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-automation-lite` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-calendar-feed` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-card-crud` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-card-detail` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-checklist-editor` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-comments-activity` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-date-model` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-export-import` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-integrations` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-list-crud` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-permissions` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-responsive-smoke` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-saved-filters` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-share-contract` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-storage-contract` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-task-link` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-board-workspaces` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-build-form-adr` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `xai-web-calendar` | 有 / 有 | 本目录 46 个源码文件；Web host import | SHIPPED; FIX_READY | 45 | 实际挂载与workflow验证分离；按最新迭代补verify/ship凭据 |
| `xai-web-cmdk` | 有 / 有 | 本目录 31 个源码文件；Web host import | SHIPPED | 27 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-countdown` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-dashboard-grid` | 有 / 有 | 本目录 19 个源码文件；Web host import | SHIPPED | 24 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-dashboard-widgets` | 有 / 有 | 本目录 42 个源码文件 | SHIPPED | 35 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-deploy-cloudflare` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-event-bus` | 有 / 无 | 本目录 7 个源码文件；Web host import | SHIPPED | 2 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-habits` | 有 / 有 | 本目录 27 个源码文件；Web host import | SHIPPED | 24 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-matrix` | 有 / 有 | 本目录 21 个源码文件；Web host import | SHIPPED | 20 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-meditation` | 有 / 有 | 本目录 19 个源码文件；Web host import | SHIPPED | 15 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-persistence-contract` | 无 / 无 | 文档锚点/外部owner | SHIPPED; SHIPPED** | 0 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `xai-web-pet` | 有 / 有 | 本目录 13 个源码文件；Web host import | SHIPPED | 17 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-settings-appearance` | 有 / 有 | 本目录 9 个源码文件；Web host import | SHIPPED | 7 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `xai-web-settings-features-panel` | 有 / 有 | 本目录 13 个源码文件；Web host import | SHIPPED | 6 | 任务页遗漏；补格式适配与状态覆盖校验 |
| `xai-web-shell` | 有 / 有 | 本目录 14 个源码文件；Web host import | SHIPPED | 10 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-statistics` | 无 / 无 | 文档锚点/外部owner | SHIPPED; **SHIPPED** | 0 | 保留锚点→实际实现owner映射及运行证据，勿按无包误删 |
| `xai-web-tasks` | 有 / 有 | 本目录 23 个源码文件；Web host import | SHIPPED | 15 | 保留历史状态，绑定当前验收commit及与产品feature的关系 |
| `xai-web-tokens-and-i18n` | 无 / 无 | 文档锚点/外部owner | SHIPPED | 0 | 任务页遗漏；补格式适配与状态覆盖校验 |

## PRD 覆盖与规划边界

以下逐文档列出产品需求入口。主PRD和旧Console/Web sub-PRD包含长期目标、历史priority和未来功能，不可用其checkbox反推当前Web所有能力已交付。产品级canonical PRD优先承接后续迭代，原设计和历史来源继续保留。

| PRD | 本次识别的逐功能/验收入口 | 状态/优化 |
|---|---|---|
| `docs/planning/2026-05-12-PRD-v1.md` | 5. 功能模块详细规格 (:179)；5.1 智能桌面整理(Smart Container) (:181)；5.1.1 概述 (:183)；5.1.2 功能需求(FR) (:187)；5.1.3 数据模型对应 (:206)；5.1.4 边界与降级 (:210)；5.2 待办清单(Todo · 中度复刻) (:217)；5.2.1 概述 (:219)；5.2.2 功能需求 (:223)；5.2.3 不做(明确) (:242)；5.3 番茄钟(Pomodoro) (:253)；5.3.1 功能需求 (:255)；5.4 习惯打卡(Habits · P1) (:271)；5.4.1 概述 (:273)；5.4.2 功能需求 (:277)；5.5 剪贴板(Clipboard / Deck-style) (:293)；5.5.1 概述 (:295)；5.5.2 功能需求 (:299)；5.5.3 性能要求 (:319)；5.5.4 对标增强(2026-05-19) (:325)；5.6 桌面 Widgets(时钟 / 天气 / 便签 / 时间进度条) (:339)；5.6.1 时钟 (:341)；5.6.2 天气 (:347)；5.6.3 便签(P1) (:354)；5.6.4 时间进度条 / 倒计时(P0) (:360)；5.6.5 数据模型对应 (:378)；5.7 冥想 / 专注模式(P1) (:384)；5.8 AI Cube(Phase 4 才开发) (:394)；5.8.1 概述 (:396)；5.8.2 Phase 4 功能 (:400)；5.9 账号系统 + 云同步 (:413)；5.9.1 账号(v0.6 总览) (:417)；5.9.2 云同步(v0.6 总览) (:428)；5.9.3 后端选型(Phase 0 启动技术决策) (:440)；5.10 插件机制 + 静态目录 (:451)；5.10.1 插件机制 (:453)；5.10.2 静态目录(免后端) (:463)；5.11 全局 Label 系统(P0,新增) (:476)；5.11.1 概述 (:478)；5.11.2 功能需求 (:482)；5.11.3 数据模型对应 (:494)；5.12 桌面日历(P0,新增) (:500)；5.12.1 概述 (:502)；5.12.2 功能需求 (:506)；5.12.3 设计说明 (:519)；5.13 整体控制台(P0,新增) (:525)；5.13.1 概述 (:527)；5.13.2 功能需求 (:536)；5.13.3 设计说明与范围控制 (:553)；5.13.4 数据模型对应 (:559)；5.14 项目管理(Trello 式看板,P0,新增) (:565)；5.14.1 概述 (:567)；5.14.2 功能需求 (:577)；5.14.3 不做(明确,v1) (:594)；5.14.4 数据模型对应 (:601)；5.15 网页版(Web Console,P0,新增) (:607)；5.15.1 概述 (:609)；5.15.2 功能需求 (:613)；5.15.3 架构影响(重要) (:625)；5.15.4 数据模型对应 (:633)；5.16 AI 桌面宠物(Desktop Pet,P1,新增 · 初版) (:639)；5.16.1 概述 (:643)；5.16.2 功能需求 (:652)；5.16.3 初版范围控制(明确) (:668)；5.16.4 数据模型对应 (:674)；5.17 产品美学与体验规格(新增) (:678)；5.17.1 视觉北极星 (:682)；5.17.2 Design Tokens 验收 (:692)；5.17.3 竞品审美定位 (:704) | 规划/历史合同：与当前模块优先级、runtime及roadmap逐项对照，未实施项保留planned |
| `docs/planning/sub-prds/console/PRD.md` | 5. 功能需求 (:352)；5.1 窗口生命周期(FR-CON-13~20) (:357)；5.2 Sidebar 导航(FR-CON-21~30) (:370)；5.3 三栏布局与拖动(FR-CON-31~38) (:385)；5.4 各业务模块在 Console 中的视图 (:398)；5.4.1 任务(Todo)模块视图(FR-CON-40~48,v0.2 范围收敛) (:402)；5.4.2 桌面日历模块视图(FR-CON-49~55,v0.2 整组降级 Phase 3) (:425)；5.4.3 四象限视图(FR-CON-56~58) (:449)；5.4.4 番茄专注模块视图(FR-CON-59~62) (:457)；5.4.5 习惯打卡模块视图(FR-CON-63~67,v0.2 热力图降级) (:466)；5.4.6 项目管理模块视图(FR-CON-68~75,v0.2 修正拖源) (:478)；5.4.7 标签管理模块视图(FR-CON-76~80,v0.2 加 resolver 协议) (:491)；5.4.8 时间进度条模块视图(FR-CON-81~83) (:530)；5.4.9 设置模块视图(FR-CON-84~95,v0.2 大幅收敛) (:538)；5.5 全局搜索 Cmd+K(FR-CON-96~105,v0.2 改作用域 + 加 provider 协议) (:591)；5.5.1 作用域分层 (:597)；5.5.2 SearchProvider 协议 (:605)；5.5.3 P0 / P1 / P2 provider 分层 (:642)；5.5.4 FR (:657)；5.6 键盘流与快捷键(FR-CON-106~115,v0.2 拖拽对偶补全) (:674)；5.6.1 全局(Console 前台) (:678)；5.6.2 List 通用 (:695)；5.6.3 模块专属 (:711)；5.6.4 拖拽 / 右键 P0 的键盘对偶清单(整合) (:738)；5.6.5 通用 a11y (:757)；5.7 通知中心(FR-CON-116~123,v0.2 AI tab 动态注册) (:766)；5.8 多显示器 / 多 Space(FR-CON-124~128,v0.2 加场景矩阵) (:795)；5.8.1 基础 FR (:799)；5.8.2 Console × overlay × 多 Space / 多屏 / Stage Manager 场景矩阵 (:809)；5.8.3 真机验收脚本 (:827)；5.9 主题 / 密度 / 字体(FR-CON-129~133) (:831)；5.10 与 overlay 模式的互通(FR-CON-134~140,v0.2 加 ack / revision) (:845)；5.10.1 一致性策略 (:849)；5.10.2 FR (:860)；5.11 Onboarding / Empty / Error / 模块缺席 状态(FR-CON-141~150,v0.2 大幅扩展) (:873)；5.11.1 Onboarding (:880)；5.11.2 Empty States(每模块必有) (:889)；5.11.3 模块级状态矩阵(v0.2 新增,审查 Major-5 + 增补 A2) (:905)；5.11.4 模块缺席 / 未安装 / 禁用 / 加载失败 矩阵(v0.2 新增,增补 A2) (:919)；5.11.5 Error / Recovery FR (:929)；5.12 i18n / 无障碍(FR-CON-151~158,v0.2 对齐 dev-plan + 按组件细化 a11y) (:943)；5.12.1 i18n (:949)；5.12.2 无障碍 — 按组件类型定义 (:959)；5.12.3 FR (:975) | 规划/历史合同：与当前模块优先级、runtime及roadmap逐项对照，未实施项保留planned |
| `docs/planning/sub-prds/plugin/PRD.md` | 5. Plugin Center / Entry Model（入口与管理模型） (:87)；5.1 推荐入口 (:91)；5.2 用户添加流程（MVP） (:103)；5.3 Plugin Center 页面内容 (:114)；5.4 实例设置 schema（产品层） (:124)；5.5 当前风险与顺序约束 (:138) | 规划/历史合同：与当前模块优先级、runtime及roadmap逐项对照，未实施项保留planned |
| `docs/planning/sub-prds/sync/PRD.md` | 5. 功能需求 (:592)；5.1 账号(FR-AC-06~10) (:601)；5.2 密钥与加密(FR-SY-07~14 v0.2 修订 + FR-SY-67~75 新增) (:615)；5.3 增量同步协议(FR-SY-15~21 v0.2 修订) (:640)；5.4 冲突解决(FR-SY-22~26 v0.2 重写) (:652)；5.5 Realtime 订阅(FR-SY-27~31 v0.2 修订) (:664)；5.6 离线模式 + 队列(FR-SY-32~37 v0.2 修订) (:674)；5.7 多设备协调(FR-SY-38~41) (:685)；5.8 同步状态 UI(FR-SY-42~45) (:694)；5.9 失败恢复 + 重试(FR-SY-46~49) (:703)；5.10 数据导出 + 账号删除(FR-SY-50~52) (:712)；5.11 隐私默认值 + 选择性禁同步(FR-SY-53~55) (:720)；5.12 服务端零知识承诺(FR-SY-56~58 v0.2 修订) (:728)；5.13 凭据轮换 + 审计(FR-SY-59~61) (:736)；5.14 速率限制 + 成本控制(FR-SY-62~64) (:744)；5.15 网络弱网处理(FR-SY-65~66) (:752) | 规划/历史合同：与当前模块优先级、runtime及roadmap逐项对照，未实施项保留planned |
| `docs/planning/sub-prds/web/PRD.md` | 5. 功能需求 (:202)；5.1 浏览器端 Auth (:206)；5.1.1 Token 存储模型(纯 SPA) (:210)；5.1.1.a 威胁模型(显式声明) (:214)；5.1.1.b 实现方案 (:225)；5.1.2 FR 表 (:238)；5.1.3 自建 devices / app_sessions 表(后端 schema 增量) (:262)；5.2 数据访问层(Sync blob driver) (:309)；5.2.1 网络协议层 (:315)；5.2.1.b 服务端 schema 增量(由 Sync 子 PRD 归口建表) (:334)；5.2.2 FR 表 (:369)；5.2.3 mutation 信封示例 (:389)；5.3 实时同步(Supabase Realtime — metadata-only) (:440)；5.3.1 Channel 与事件 (:444)；5.3.2 FR 表 (:457)；5.4 离线模式 (:473)；5.4.1 离线写入策略 (:477)；5.4.2 FR 表 (:491)；5.5 响应式断点 (:509)；5.6 浏览器存储边界 (:526)；5.6.1 设置同步映射(device-local vs account-global) (:530)；5.6.2 存储用途表 (:553)；5.6.3 FR 表 (:564)；5.7 PWA(P1)+ 安装提示策略 (:574)；5.7.1 安装提示触发策略 (:578)；5.7.2 FR 表 (:590)；5.8 路由 + 深链接 (:602)；5.9 性能(Web Vitals 目标值) (:614)；5.9.1 RUM(线上 75th percentile) (:618)；5.9.2 Lab(CI 预算,不上 RUM) (:628)；5.9.3 优化手段 (:640)；5.9.4 FR 表 (:648)；5.10 SEO + landing page (:657)；5.11 兼容性 (:667)；5.11.1 验收矩阵 (:671)；5.11.2 真机验收清单(每周末跑) (:683)；5.11.3 FR 表 (:691)；5.12 安全 (:703)；5.12.1 完整 CSP 头 (:707)；5.12.2 上线流程 (:741)；5.12.3 style-src 处理 (:747)；5.12.4 FR 表 (:755)；5.13 错误边界 + Sentry web (:775)；5.14 i18n (:786)；5.15 浏览器扩展接口预留(P2) (:796)；5.15.1 Quick Capture RPC 契约 (:800)；5.15.2 FR 表 (:840)；5.16 移动端浏览器(只读 + 最小编辑) (:850)；5.17 与桌面 App 的双向状态同步 (:861)；5.18 数据导出 / 账号删除 / 分享链接 / GDPR (:874)；5.18.1 客户端数据导出(零知识保留) (:878)；5.18.2 Share 链接:v1 不实现,P1 设计 (:891)；5.18.3 FR 表 (:895)；5.18.4 子处理者清单(隐私页须列) (:912) | 规划/历史合同：与当前模块优先级、runtime及roadmap逐项对照，未实施项保留planned |
| `docs/product/board/prd.md` | 1. Overview — why / problem solved (:17)；2. Target users & core scenarios (:25)；3. In Scope（按 3 包分层） (:36)；4. Non-Goals（明示不做） (:70)；5. Acceptance Criteria（映射各包 test.md / Verify Report） (:75)；6. Owning modules / packages（多包合 1） (:85)；7. Revision History (:96)；8. Traceability Matrix (:110)；9. Open Items（诚实标注，非阻塞） (:122) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/bookkeeping/prd.md` | 1. Overview (:16)；2. Target Users & Scenarios (:22)；3. In Scope (:28)；4. Non-Goals (:41)；5. Acceptance Criteria (:47)；6. Owning Package (:58)；7. Revision History (:62)；8. Traceability (:68)；9. Open Items (:78) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/calendar/prd.md` | 1. Overview — why / problem solved (:16)；2. Target users & core scenarios (:23)；3. In Scope (:33)；4. Non-Goals（明示不做） (:53)；5. Acceptance Criteria（映射 test ID） (:58)；6. Owning modules / packages (:70)；7. Revision History (:77)；8. Traceability Matrix (:87)；9. Open Items（诚实标注，非阻塞） (:95) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/dashboard/prd.md` | 1. Overview — why / problem solved (:18)；2. Target users & core scenarios (:24)；3. In Scope (:34)；4. Non-Goals（明示不做） (:72)；5. Acceptance Criteria（映射 test ID） (:81)；6. Owning modules / packages（多包合 1） (:96)；7. Revision History (:105)；8. Traceability Matrix (:119)；9. Open Items（诚实标注，非阻塞） (:131) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/pomodoro/prd.md` | 1. Overview — why / problem solved (:17)；2. Target users & core scenarios (:23)；3. In Scope (:34)；4. Non-Goals（明示不做） (:48)；5. Acceptance Criteria（映射 test ID） (:56)；6. Owning modules / packages (:70)；7. Revision History (:79)；8. Traceability Matrix (:87)；9. Open Items（诚实标注，非阻塞） (:97) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/settings/appearance/prd.md` | 1. Overview (:13)；2. Target users & core scenarios (:17)；3. In Scope (:21)；4. Non-Goals (:28)；5. Acceptance Criteria (:32)；6. Owning packages (:39)；7. Revision History (:42)；8. Traceability (:48)；9. Open Items (:54) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/settings/features/prd.md` | 1. Overview (:13)；2. Target users & core scenarios (:17)；3. In Scope (:21)；4. Non-Goals (:29)；5. Acceptance Criteria (:32)；6. Owning packages (:38)；7. Revision History (:41)；8. Traceability (:47)；9. Open Items (:53) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/settings/prd.md` | 1. Overview — why / problem solved (:19)；2. Target users & core scenarios (:25)；3. In Scope（主壳） (:34)；4. Non-Goals（明示不做） (:46)；5. Acceptance Criteria (:51)；6. Owning modules / packages (:62)；7. Revision History (:73)；8. Traceability Matrix (:82)；9. Open Items（诚实标注，非阻塞） (:91) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/settings/rest/prd.md` | 1. Overview (:14)；2. Target users & core scenarios (:18)；3. In Scope (:22)；4. Non-Goals (:44)；5. Acceptance Criteria (:51)；6. Owning packages (:60)；7. Revision History (:63)；8. Traceability Matrix (:73)；9. Open Items（诚实标注，非阻塞） (:82) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |
| `docs/product/tasks/prd.md` | 1. Overview — why / problem solved (:17)；2. Target users & core scenarios (:25)；3. In Scope (:36)；4. Non-Goals（明示不做） (:67)；5. Acceptance Criteria（二元可测，映射 test ID） (:75)；6. Owning modules / packages (:87)；7. Revision History (:96)；8. Traceability Matrix (:106)；9. Open Items（诚实标注，非阻塞） (:117) | 产品canonical：按迭代补源→实现→测试→ship→deploy链 |

## Skill / Agent 逐项登记核对

下表是生成 registry 的全部66条。tracked表示定义受版本控制；resolved只是展示元数据已补齐，不是本次执行该技能的验证结果。项目14 skills镜像核对结果见上文/JSON；公共helper与Workflow Agent定义本次做入口、登记与portable一致性检查。

| 名称/类型 | 定义来源 | 当前状态 | 建议 |
|---|---|---|---|
| agent-behavioral-guidelines / agent | `.codex/agents/skill-agent-behavioral-guidelines.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| composition-patterns / agent | `.codex/agents/skill-composition-patterns.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| frontend-dev / agent | `.codex/agents/skill-frontend-dev.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| skill-creator / agent | `.codex/agents/skill-skill-creator.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| agent-behavioral-guidelines / skill | `.codex/skills/agent-behavioral-guidelines/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| agent-behavioral-guidelines / skill | `docs/workflow/_portable/skills/agent-behavioral-guidelines/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| composition-patterns / skill | `.codex/skills/composition-patterns/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| composition-patterns / skill | `docs/workflow/_portable/skills/composition-patterns/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| Frontend Responsive Design Standards / skill | `.codex/skills/frontend-responsive-ui/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| frontend-dev / skill | `.codex/skills/frontend-dev/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| frontend-dev / skill | `docs/workflow/_portable/skills/frontend-dev/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| skill-creator / skill | `.codex/skills/skill-creator/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| skill-creator / skill | `docs/workflow/_portable/skills/skill-creator/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| planning-with-files / agent | `.codex/agents/skill-planning-with-files.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| superpowers / agent | `.codex/agents/skill-superpowers.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| workflow-router / agent | `.codex/agents/skill-workflow-router.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| planning-with-files / skill | `.codex/skills/planning-with-files/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| planning-with-files / skill | `docs/workflow/_portable/skills/planning-with-files/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| superpowers / skill | `.codex/skills/superpowers/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| superpowers / skill | `docs/workflow/_portable/skills/superpowers/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| workflow-router / skill | `.codex/skills/workflow-router/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| workflow-router / skill | `docs/workflow/_portable/skills/workflow-router/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-admin-control-plane-sync / skill | `.teams/skills/xai-admin-control-plane-sync/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-admin-control-plane-sync / skill | `.codex/skills/xai-admin-control-plane-sync/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-module-classify / skill | `.teams/skills/xai-module-classify/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-module-classify / skill | `.codex/skills/xai-module-classify/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-roadmap-loop / skill | `.teams/skills/xai-roadmap-loop/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-web-deploy-preflight / skill | `.teams/skills/xai-web-deploy-preflight/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| bug-auto-fix / agent | `.agents/templates/bug-auto-fix.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| bug-diagnose / agent | `.agents/templates/bug-diagnose.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| bug-fix / agent | `.agents/templates/bug-fix.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| bugfix-full-loop / agent | `.agents/templates/bugfix-full-loop.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| bugfix-loop / agent | `.agents/templates/bugfix-loop.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-auto-build / agent | `.agents/templates/feature-auto-build.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-build / agent | `.agents/templates/feature-build.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-dev-loop / agent | `.agents/templates/feature-dev-loop.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-full-loop / agent | `.agents/templates/feature-full-loop.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-phase-review / agent | `.agents/templates/feature-phase-review.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-plan / agent | `.agents/templates/feature-plan.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-feature-brief / skill | `.teams/skills/xai-feature-brief/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-feature-dossier-sync / skill | `.teams/skills/xai-feature-dossier-sync/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-feature-full-loop / skill | `.teams/skills/xai-feature-full-loop/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| ship / agent | `.agents/templates/ship.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-account-sync-scope-check / skill | `.teams/skills/xai-account-sync-scope-check/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-desktop-release-gate / skill | `.teams/skills/xai-desktop-release-gate/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-dev-dashboard-sync / skill | `.teams/skills/xai-dev-dashboard-sync/SKILL.md` | tracked；resolved | 源元数据完整，保持定义和镜像同步 |
| xai-release-log / skill | `.teams/skills/xai-release-log/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-sync-fanout-dispatch / skill | `.teams/skills/xai-sync-fanout-dispatch/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-web-to-desktop-sync / skill | `.teams/skills/xai-web-to-desktop-sync/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| bug-verify / agent | `.agents/templates/bug-verify.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| codebase-explorer / agent | `.codex/agents/skill-codebase-explorer.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-review / agent | `.agents/templates/feature-review.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| feature-verify / agent | `.agents/templates/feature-verify.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| gh-fix-ci / agent | `.codex/agents/skill-gh-fix-ci.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| security-skills-claude-code / agent | `.codex/agents/skill-security-skills-claude-code.toml` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| codebase-explorer / skill | `.codex/skills/codebase-explorer/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| codebase-explorer / skill | `docs/workflow/_portable/skills/codebase-explorer/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| gh-fix-ci / skill | `.codex/skills/gh-fix-ci/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| gh-fix-ci / skill | `docs/workflow/_portable/skills/gh-fix-ci/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| high-end-visual-design / skill | `.codex/skills/soft-skill/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| redesign-existing-projects / skill | `.codex/skills/redesign-skill/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| security-skills-claude-code / skill | `.codex/skills/security-skills-claude-code/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| security-skills-claude-code / skill | `docs/workflow/_portable/skills/security-skills-claude-code/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| stitch-design-taste / skill | `.codex/skills/stitch-skill/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-consistency-audit / skill | `.teams/skills/xai-consistency-audit/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |
| xai-consistency-audit / skill | `.codex/skills/xai-consistency-audit/SKILL.md` | tracked；resolved | 看板可用；输入/输出/场景等仍有自动补齐，维护该技能时逐项回写源定义并验证实际产物 |

## 修正顺序与未闭合边界

1. 优先修 G01 的静默漏项与 feature→证据链接，再修 G02 的 manifest 识别。否则新功能合入后仍可能在看板消失。
2. 对齐 G04/G05/G06/G07 的陈旧文案，和受影响 dashboard/模块文档在一次事实修正中一致更新；不因此改变产品优先级、长期分支、依赖稳定性或发布许可。
3. 补九个缺失 canonical dossier 与关键增量验收，尤其Time Tracker、Bookkeeping、Metric Tracker。
4. 以关闭页面/浏览器退出/断网/休眠/跨日/多标签/重登为基准补当前commit的行为证据；将历史cross-vendor deferred独立跟踪。

父会话为UI检查启动 `dashboard:serve`，该服务自动运行 generator 并更新了 gitignored `state.generated.js`（末次在审查分支）。这没有修改 tracked dashboard 状态，也不推翻初始fresh结论。启动至端口可用曾约90秒，仅记为值得profile的体验线索；未做重复基准，不能据此断言稳定性能退化。

本审查未把本地报告更新为业务release，没有修代码、更新roadmap、提升SHIPPED/Stable或更改冻结规则。远端对齐与部署最新事实由父报告记录。
