# SOP_NEW_FEATURE.md
# 新 Feature 开发标准流程 (XAI_Desktop)

## 1. 目标

规范新 Feature 从立项、设计、开发、测试到状态更新的全过程。
所有新 Feature 必须遵循 **"先设计、后实现；先契约、后联调；先测试计划、后验收"** 原则。

XAI_Desktop 的 "Feature" 单元 = 一个 `packages/plugin-<name>/` 包。本 SOP 与
`docs/workflow/SUBAGENT_WORKFLOW_V2.md` 互补：V2 描述 subagent pipeline，本 SOP 描述每一阶段的
项目侧约束。

---

## 2. 适用范围

适用于：

- 新增 Plugin 包（`packages/plugin-<name>/`）
- `packages/core/` 共享基础设施扩展（typed events / hooks / PluginRegistry）
- `apps/desktop/src/` host 层壳扩展（routing / providers / window 注册）
- `apps/desktop/src-tauri/` Rust 后端新增 commands / 平台适配
- `packages/ui/` 共享 UI 组件扩展
- 对现有 Plugin 的大规模能力扩展（若接口或依赖关系变化，按新 Feature 流程处理）

说明：

- 当前架构以 `docs/SYSTEM_ARCHITECTURE.md` 为准；三面（host / core / plugin）边界见
  `docs/adr/0003-three-faces-architecture.md`。
- 新功能默认落在 plugin 层；落到 host 或 core 必须走 ADR-lite。

---

## 3. 流程总览

### Phase 0：立项与登记

1. 在 `docs/PLUGIN_MAP.md` 中登记该 Feature。
2. 初始化状态为：`Planned` 或 `Designing`。
3. 确认 Feature 命名、归属层（host / core / plugin）、上下游依赖、跨窗口契约影响。
4. 命名约定：
   - Plugin 目录：`packages/plugin-<kebab-case>/`（如 `packages/plugin-organizer`）
   - `manifest.json` 的 `name`：与目录后缀一致（`organizer`、`launcher`、…）

---

### Phase 1：Step 0 需求规范化

任何新 Feature 在调研 / 计划前必须先经 Step 0。

- 调用：`/xai-feature-brief` skill（项目层），或直接走 V2 的 `feature-plan` subagent —— 后者会
  在 Phase 1 自动触发 Step 0。
- 输出：`docs/reviews/<feature>/<YYYYMMDD>-feature-brief.md`（结构化 brief + Planner Handoff）。
- canonical feature name 未定前可临时落到 `docs/reviews/_intake/<YYYYMMDD>-<topic>-feature-brief.md`，
  Plan 阶段再迁移到正式路径。
- Step 0 必须明确：
  - **Three-faces 决策**：本变更归属 host / core / 哪个 plugin？（ADR-0003）
  - **目标 plugin 状态**：当前在 PLUGIN_MAP.md 是 Stable / Production / In-Dev / Migrating？
  - **Cross-window contract impact**：是否新增/修改 `packages/core/src/events/` 的 typed events，
    或 Tauri command 签名变更？
  - **Mock strategy**（依赖非 Stable/Production 时）

---

### Phase 1.5：方案调研（Solution Scan）

适用于标准型功能或存在成熟开源实现的场景。

必须输出：

- 该 Feature 属于哪类：
  - 标准型功能（grid / dnd / file io 等）
  - 业务编排型功能
  - 项目专属核心能力（macOS 透明覆盖、多窗口、Tauri 桥接）
- 是否需要 Web 调研
- 候选方案（2~3 个）
- 评估维度：
  - 架构兼容性（Tauri 2 / React 19 / pnpm monorepo）
  - 社区活跃度
  - 引入成本
  - 维护成本
  - License 风险
  - 是否适合直接引入 / 局部借鉴 / 仅参考思路
- 最终结论：直接采用 / 部分借鉴 / 不引入仅参考

调研主文档：`docs/reviews/<feature>/<YYYYMMDD>-discovery-review.md`（人工 review）

强约束：

- Discovery 细节不写入 `design.md`；`design.md` 仅决策快照
- `design.md` 必含字段：`Selected Option` / `Review Doc Path` / `Review Date/Version` /
  `Frozen Assumptions`
- 若调研结论变更：同步更新 review 主文档 + `design.md` + `dev_log.md`

---

### Phase 2：依赖与契约扫描（Dependency & Contract Scan）

在写代码前必须明确：

- 上游调用方是哪些 plugin / host 区域
- 下游依赖（其他 plugin / `@repo/core/events` / `@repo/ui`）
- 哪些依赖是 `Stable/Production`（可直接依赖）
- 哪些只能 Mock（PLUGIN_MAP 标 `Planned` / `In-Dev` / `Migrating` 的）
- 本 Feature 对外暴露：
  - `index.ts` 公开导出
  - 注册到 `@repo/core/events` 的 typed event 列表
  - 新增的 Tauri command 签名
- 错误语义、并发约束、跨窗口同步策略

同步落档：

- 总览 → `design.md`
- 接口细节 → `api.md`
- Mock 策略 → `test.md`

---

### Phase 3：Plugin 四件套初始化

每个 plugin 必须具备以下文档（路径：`packages/plugin-<name>/docs/`）：

- `design.md` — 决策快照 / 依赖概览
- `api.md` — 接口契约（导出、events、commands）/ 错误语义
- `test.md` — 测试策略 / Mock 策略 / 验收标准
- `dev_log.md` — 状态机 / 断点续传

要求顺序：先 `design.md` → 再 `api.md` → 再 `test.md` → 最后 `dev_log.md`。

四件套未形成最小闭环前，不允许直接写大规模业务代码。

---

### Phase 3.5：`manifest.json` 初始化

每个 plugin 必须在 `packages/plugin-<name>/manifest.json` 建立元信息：

- 行为字段（影响 PluginRegistry 加载）：
  - `enabled`
  - `name`（与目录后缀一致）
  - `entry`（默认 `src/index.ts`）
  - `dependencies`（其他 plugin / core 模块）
- 元信息字段：
  - `version`
  - `displayName`
  - `description`
  - `author`

初始化完成后必须确认：

- `manifest.json` 的 `entry` 路径与实际 `src/index.ts` 存在
- 在 `apps/desktop/src/main.tsx` 中已添加 import 注册
- 若声明 `dependencies`，对应 plugin 在 `PLUGIN_MAP.md` 中处于 `Stable` / `Production` 状态

---

### Phase 4：实现计划输出

在正式编码前，必须先在 `dev_log.md` 中输出：

- 目录结构变更计划
- 改动范围分层（host / core / plugin / Rust 后端）
- 依赖调用策略
- Mock 方案
- 风险点（多窗口、macOS native API、持久化 schema 变更等）
- 预计拆分 commit 数

`feature-build` 一次只跑一个 phase，所以每个 phase 的 commit 计划必须清晰。

---

### Phase 4.5：`dev_log.md` 增量更新规则

`dev_log.md` 采用 V2 双层结构：

- **顶部 Status Panel**（覆盖更新）：
  - `Workflow`（feature-plan / review / build / verify / ship）
  - `Executor`（claude-opus-4-7 / claude-sonnet-4-6 / gpt-5.4 / cursor）
  - `Updated`（时间戳）
  - `Status`（PLAN_DRAFT / NEEDS_REVIEW / APPROVED / READY_FOR_VERIFY / READY_TO_SHIP /
    BLOCKED / SHIPPED）
  - `Suggested Next`（下一个 subagent 入口）
  - `Blockers`（如有）
- **底部 Work Log**（仅追加，不删历史）：
  - 每一轮工作（Round）追加一条
  - 每条记录包含 `Goal` / `Done` / `Commits` / `Tests` / `Risks` / `Handoff`

粒度：

- 不要求"一条日志对应一个 commit"
- 建议"一轮有效工作"对应 1 条日志（通常覆盖 1~3 个 commits）
- `Commits` 字段必须记录 commit hash 或 commit message

Status Panel 写入权限矩阵见 `docs/workflow/SUBAGENT_WORKFLOW_V2.md`。

---

### Phase 5：分层实现

实现时严格遵守 `docs/SYSTEM_ARCHITECTURE.md` §4 编码红线（12 条）。核心红线：

#### Host 层 (`apps/desktop/src/`)

- 仅做路由、Provider、window 壳
- **零业务逻辑**
- 不直接调用具体 plugin 内部，只在 `main.tsx` 做 import 注册

#### Core 层 (`packages/core/`)

- 仅基础设施：types、typed events、hooks、PluginRegistry
- **零业务逻辑**
- 新增 typed event 必须在 `packages/core/src/events/` 集中声明，并写入 plugin 的 `api.md`

#### Plugin 层 (`packages/plugin-<name>/`)

- 所有业务逻辑必须在此
- `index.ts` 是唯一公开入口，**禁止外部 import `src/internal/`**
- Plugin 间通信走 `@repo/core/events`，**禁止直接 import 其他 plugin**
- 业务专用 UI 在 plugin 内；通用 UI 抽到 `@repo/ui`

#### Rust 后端 (`apps/desktop/src-tauri/src/`)

- Commands 落 `commands/<topic>.rs`
- macOS 平台代码落 `platform/macos/`
- 不要在未在真机验证前改 macOS window level 常量

---

### Phase 6：测试实现

必须覆盖三层（按需）：

#### 1）单元测试

- Vitest：`pnpm --filter @repo/<package> test`
- 覆盖核心算法、输入校验、错误分支、边界条件

#### 2）契约测试

- 验证 `api.md` 中定义的导出 / typed events / Tauri commands 入参出参 / 错误码

#### 3）多窗口 / 真机验证

- 主成功路径
- 核心失败路径
- 至少一组多窗口边界场景（拖拽、resize、跨窗口事件、macOS 焦点切换）
- `pnpm dev` in `apps/desktop/` 在真机 macOS 跑通

#### 4）Rust 后端测试

- `cargo test` in `apps/desktop/src-tauri/`

---

### Phase 7：验证与问题归纳（Verification Pass）

由 `feature-verify` subagent 执行（默认跨厂商 verify gate 强约束）。必须输出：

- 执行了哪些测试
- 哪些通过 / 失败 / 失败归因 / 修复建议
- 多窗口真机验证结果
- 当前是否允许进入 `Testing`

验证摘要写入 `dev_log.md` 的 Work Log，Status Panel 翻 `READY_TO_SHIP` 或 `BLOCKED`。

---

### Phase 8：收尾与状态更新

`ship` agent 跑通后必须确认：

1. `design.md` / `api.md` / `test.md` / `dev_log.md` 已同步
2. `manifest.json` 与实际 entry / dependencies 一致
3. `PLUGIN_MAP.md` 状态已更新（一般 `In-Dev` → `Testing` → `Stable`；首版上线后 `Stable` →
   `Production`）
4. `apps/desktop/src/main.tsx` 的注册行存在
5. `dev_log.md` 本轮 `Work Log` 已追加并引用相关 commits + commit 末尾带正确的
   `Co-authored-by: <agent> <workflow-v2@local>` trailer

状态流转：

```
Planned → Designing → In-Dev → Testing → Stable → Production → Deprecated
```

---

## 4. 禁止事项

- 未读 `SYSTEM_ARCHITECTURE.md` §4 12 条红线就开始实现
- 未确认依赖状态就直接 import 其他 plugin
- 在 host (`apps/desktop/src/`) 或 core (`packages/core/`) 放业务逻辑
- 直接 import `packages/plugin-*/src/internal/`
- 跨 plugin 直接 import（必须走 `@repo/core/events`）
- 在未真机验证的前提下改 macOS NSWindow 常量
- 未更新 `dev_log.md` / `PLUGIN_MAP.md` 就宣布完成
- 未补多窗口验证就宣布完成
- 一个 commit 同时包含业务实现 + 大规模 refactor

---

## 5. 完成定义（Definition of Done）

一个新 Feature 只有满足以下条件才算完成一个开发周期：

- [ ] `design.md` 同步最新设计 + 决策快照字段齐全
- [ ] `api.md` 同步真实契约（exports / events / commands）
- [ ] `test.md` 已列出测试计划与关键结果
- [ ] `dev_log.md` 当前 Status Panel 为 `SHIPPED`（或人工 ship 前的 `READY_TO_SHIP`）
- [ ] `dev_log.md` Work Log 按轮次增量追加并关联本轮 commits
- [ ] 单元测试通过
- [ ] 契约测试通过（如适用）
- [ ] 多窗口 / 真机验证通过
- [ ] Rust 测试通过（如涉及 Tauri command）
- [ ] `manifest.json` 与实现保持一致
- [ ] `apps/desktop/src/main.tsx` 的注册行存在（若是新 plugin）
- [ ] `PLUGIN_MAP.md` 状态已更新
- [ ] 所有相关 commits 带正确 `Co-authored-by` trailer
