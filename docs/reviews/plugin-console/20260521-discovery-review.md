# Discovery Review — plugin-console

## 1. Problem Framing

`plugin-console` 的现状与其自有 Console PRD 存在结构性错位，而不是简单的“缺几个组件”。

当前证据：

- `apps/desktop/src/main.tsx` 只有 `main` / `grid` / `control` 路由，未注册 Console 窗口。
- `packages/plugin-console/manifest.json` 仍声明 `windows.control=true` 且 `enabled=false`，未把 Console 作为独立窗口类型。
- `packages/plugin-console/docs/dev_log.md` 把当前两栏脚手架标成 `READY_FOR_VERIFY`，但审计显示其对目标外壳能力仅有极少量占位。
- `packages/core/src/registry/plugin-registry.ts` 当前仅暴露 overlay / control / grid 注册面，没有 Console slot API。
- `packages/core/src/types/plugin.ts` 当前没有 `windows.console`、`ui.consoleSidebar` 或 `ConsoleView` 相关 typing。
- `packages/core/src/types/events.ts` 当前没有 `console:*` typed events。
- `packages/plugin-productivity/src/index.ts` 与 `packages/plugin-labels/src/index.ts` 目前都没有 `ConsoleView` 导出。

结论：

- 这不是“把现有 console 壳稍微补完”的问题。
- 正确目标是把 `plugin-console` 重新定位为平台无关的三栏宿主壳，并把业务模块接入责任分配回各自 plugin。

## 2. Feature Target Resolution

- Feature Title: `Console TickTick parity host shell`
- Canonical workflow target: `plugin-console`
- Review alias: `console-ticktick-parity`

命名结论：

- `plugin-console` 是实际拥有外壳实现与 docs contract 的 package 单元，符合 Workflow V2 的 `<feature> = packages/plugin-<name>` 约定。
- `console-ticktick-parity` 继续保留为需求主题名称，用于关联 2026-05-21 审计和原始 Step 0 brief。

## 3. Current State Constraints

- `@repo/core` 为 Stable，可承接共享 contracts / registry / typed events，但必须保持零业务逻辑。
- `@repo/core-data` 与 `@repo/ui` 均为 In-Dev，因此只能按最小必要原则接入。
- `plugin-productivity` 与 `plugin-labels` 虽然在仓库中已有 package 目录和独立 docs，但它们目前**未出现在 `docs/PLUGIN_MAP.md`**，因此不能被当作已登记依赖，更不能从 planning 层假设 ready state。
- 在 `docs/PLUGIN_MAP.md` 为这两个 plugin 建立 canonical rows 并写明状态前，`plugin-console` 只能把它们视为 authority-missing dependencies；Phase 2 必须继续使用 Contract Mock，Phase 3/4 只能作为 gated future work。
- `plugin-console` 必须保持平台无关，因为 `ADR-0003` 已冻结“三个面共享 plugin 业务层、宿主壳各自注入能力”的方向。
- 真机窗口行为验证目前不在自动化能力范围内，只能作为 deferred gate 进入后续 verify。

## 4. External Research

No external research required.

理由：

- 本轮核心决策是 repo 内部的边界与阶段拆分，不是引入第三方窗口库、状态库或 UI 框架。
- 所需主要技术能力（Tauri window commands、typed events、plugin registry、Repo adapter）已经在仓库内存在前置模式。
- 若 build 阶段新增外部依赖，应作为单独 dependency review 处理，而不是在本轮 discovery 中假设引入。

## 5. Candidate Options

### Option A

让 `plugin-console` 继续演化成“壳 + 业务模块实现”一体的单体 TickTick App。

优点：

- 直觉上最接近“做一个 TickTick 桌面端”。
- 短期内对 `plugin-productivity` / `plugin-labels` 的改动最少。

缺点：

- 直接违反三面架构和“业务逻辑不进 console 壳”的红线。
- 与后续 Web host 复用方向冲突。
- 会制造一套与现有 productivity/labels 数据模型重复但又不完全一致的实现。

### Option B

把 Console 主要能力放到 host / `@repo/core`，`plugin-console` 仅保留薄 UI 层。

优点：

- 对现有 `plugin-console` 脚手架看起来改动路径更直接。
- host 能更方便拿到窗口和全局能力。

缺点：

- 会把业务编排和 UI orchestration 推回 host/core，违反零业务逻辑边界。
- `@repo/core` 会被迫承载 view composition，而不仅是 contract/registry。
- 后续任何业务模块变化都会变成 host/core 变更，架构上不可持续。

### Option C

`plugin-console` 负责平台无关三栏宿主壳，`@repo/core` 负责共享 Console contracts / registry / events，`plugin-productivity` 与 `plugin-labels` 各自导出 `ConsoleView`，host/Tauri 只负责窗口集成。

优点：

- 完整符合现有三面架构与 PRD 的“壳 + plugin slot”策略。
- 能在 Phase 2 先用 Contract Mock 推进 shell，再在后续 phase 分别接入真实业务模块。
- 为未来 Web Console host 保留最干净的复用边界。

缺点：

- Phase 1 的 contract freeze 成为硬前置，需要更强的 upfront discipline。
- 首轮拆分的 phase 数更多，对 docs 驱动和 review 质量要求更高。

## 6. Recommendation

选择 **Option C**。

同时冻结以下实施决策：

1. **Contract Mock sequencing**
   - Phase 2 先交付真实宿主壳 + mocked business slots。
   - Phase 3/4 再把 mocked `plugin-productivity` / `plugin-labels` 依次替换为真实 `ConsoleView` 接入。
   - 因此 Mock 是并行解耦机制，不是最终交付物。
2. **`@repo/ui` participation**
   - 仅在 split-pane / shell primitive 明显具备跨 host 复用价值时抽到 `@repo/ui`。
   - 三栏编排、Sidebar/List/Detail orchestration 默认留在 `plugin-console`。
3. **Sidebar placeholder policy**
   - `plugin-calendar` / `plugin-widgets` 本轮保留灰显占位，满足 IA 完整性，但不形成真实 runtime dependency。
4. **PLUGIN_MAP cleanup policy**
   - 本轮只登记和描述 `plugin-console`，不顺带做整表治理。
   - 对 `plugin-productivity` / `plugin-labels` 不擅自补写 authority rows；改为在计划中把真实集成显式 gate 到 owning tracks 完成 `PLUGIN_MAP` reconciliation 之后。
5. **Todo field gap policy**
   - subtasks / reminder / recurrence 是 `plugin-productivity` 领域扩展，不在本 feature 里扩 scope；Console contract 需允许能力部分缺省。

## 7. ADR-lite Decisions

### ADR-lite 1 — ConsoleView contract ownership

- Decision: `ConsoleView*` 契约落在 `@repo/core`
- Why: 这是共享 contract 面，不是 shell 私有 API，也不应放在任一业务 plugin 内
- Guardrail: `@repo/core` 只承载 type/registry/event contract，不承载业务实现

### ADR-lite 2 — Console window integration boundary

- Decision: desktop host + Tauri 只拥有 console window route/command/frame persistence
- Why: 原生窗口生命周期必须在 host/native 层，但 view/business orchestration 不能上移
- Guardrail: host 不得引入模块级业务逻辑或直接操作业务 stores

### ADR-lite 3 — First-round phase split

- Decision: 采用 5-phase 方案，而不是“一次做完 Shell + 全部模块 + 一致性”
- Why: `feature-build` 一次只做一个 phase；如果不切开，单轮 scope 过大且难审
- Guardrail: 每个 phase 都必须有独立 gate，并尽量减少跨 phase 回滚耦合

## 8. Build Implications

建议 phase 顺序：

1. **Phase 1**
   - `@repo/core` 合同冻结
   - manifest typing / registry slot API / `console:*` events
   - `plugin-console` in `PLUGIN_MAP`
2. **Phase 2**
   - `plugin-console` 三栏 shell
   - `apps/desktop` route registration
   - Tauri console window commands + frame persistence
   - Contract Mock shell integration
3. **Phase 3**
   - Precondition: owning tracks first add `plugin-productivity` to `docs/PLUGIN_MAP.md` with an explicit state and dependency note
   - `plugin-productivity` ConsoleViews
   - keyboard-first workflows
   - productivity search/event participation
4. **Phase 4**
   - Precondition: owning tracks first add `plugin-labels` to `docs/PLUGIN_MAP.md` with an explicit state and dependency note
   - `plugin-labels` ConsoleView
   - label search/sidebar/settings integration
5. **Phase 5**
   - revision/ack/reconcile
   - timeout/error hardening
   - deferred real-macOS gates capture

## 9. Risks

1. `ConsoleViewProps` 如果在 Phase 1 冻结得不够稳，会导致 Phase 3/4 大面积返工。
2. `@repo/ui` 若在 Phase 2 被过度扩张，shell 重构会被共享组件建设拖慢。
3. `plugin-productivity` / `plugin-labels` 真实接入时，可能暴露更多领域能力缺口，但不应反向污染 `plugin-console` 壳职责。
4. Tauri console window 与现有 `main` / `control` / `grid_*` 生命周期交互仍需真机检验。
5. 旧的 `plugin-console` 文档/状态与本轮 canonical docs 并存，review 时必须以后者为准。
6. 如果 owning tracks 长期未补齐 `plugin-productivity` / `plugin-labels` 的 `PLUGIN_MAP` authority rows，Phase 3/4 会持续 blocked，最终 parity 只能以 mocked shell 停在 Phase 2。

## 10. Remaining Open Questions

1. `entity_change_log` 当前在 `@repo/core-data` / sync 流程中的 ready state 是否足以支撑 Phase 5 自动化验证。
2. Console 菜单栏最终是否完全复用现有 menubar helper，还是需要单独的 console-specific adapter。
3. 真机 deferred gates 需要的最低证据矩阵（Sonoma / Sequoia / 多显示器）是否已有统一模板可复用。
