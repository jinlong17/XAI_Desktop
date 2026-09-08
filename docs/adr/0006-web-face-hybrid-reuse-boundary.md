# ADR-0006: Web 面的混合复用边界

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-21 |
| 决策者 | Jinlong(产品/项目 Owner) + Codex(`feature-plan` inline, based on accepted requirement input) |

## 背景

`ADR-0003` 把 overlay / console / Web 定义为三个宿主壳装载同一套平台无关 plugin，目标是避免三份业务实现和三份数据逻辑。

但 Web 路线在 2026-05-21 出现了新的明确输入:

- 用户已选择 **clean Web rewrite**。
- `docs/reviews/web-ticktick-parity/20260521-feature-brief.md` 把该冲突标记为最高优先 ADR-lite。
- `docs/workflow/roadmap/web-ticktick-parity.md` 把 `web-architecture-adr-lite` 设为 W0 第一个 row。
- `docs/planning/sub-prds/console/PRD.md` 已经成为三栏布局、模块信息架构、键盘流、设置容器等共享交互的细化真理源。

如果仍按 `ADR-0003` 的原字面执行，Web 开工前就必须先证明现有 plugin 源码全部 browser-safe；如果完全放弃共享约束，又会把 drift risk、双实现维护成本、数据语义分叉重新带回项目。

## 方案

### 方案 A: 继续严格执行 ADR-0003 的源码级 plugin 复用

Web 必须复用现有 plugin 源码，只允许在 host shell 与 data driver 层做差异。

**优点**:
- 最大化三面一致性。
- 源码级复用理论上维护成本最低。
- 与 `ADR-0003` 原文最一致。

**缺点**:
- 与“clean Web rewrite”的明确输入冲突。
- 把 Web 启动前置为“现有 plugin 已 browser-safe”，阻塞风险高。
- reviewer 会继续在“是否必须直接复用源码”上反复争论。

### 方案 B: 完整 Web 专属重写

Web 拥有独立 UI、独立业务实现，只与桌面共享账号和后端存储。

**优点**:
- Web 架构最独立，浏览器体验自由度最高。
- 不受现有 desktop/plugin 实现细节影响。

**缺点**:
- 直接违背 `ADR-0003` 想避免的三份实现问题。
- Drift risk 最大。
- 数据契约、Sync 语义、设置语义、快捷键行为都可能长期双轨分叉。

### 方案 C: 混合规则

Web 允许 **独立宿主壳 + 浏览器视图层重写**，但必须共享:

- 数据契约与实体语义
- `Repository<T>` 契约与 driver 语义
- Sync blob protocol / device session / crypto contract
- Console PRD 定义的共享模块 IA、键盘流与交互真理源

现有 plugin 源码的直接复用从“硬前提”降级为“可选优化”:能安全复用就复用，不能复用也必须按共享契约和 UI truth source 重实现。

**优点**:
- 保留 clean Web rewrite 的决策空间。
- 避免完整双实现带来的数据/行为分叉。
- 让 roadmap 可以先按 Web 子系统推进，再逐步抽可复用层。

**缺点**:
- 仍需承担 Web 专属 UI 实现成本。
- 需要更严格的文档和 review 纪律控制 drift。
- 对“允许偏离 Console PRD 的条件”必须写清楚。

## 决策

选择 **方案 C: 混合规则**。

这份 ADR 对 `ADR-0003` 做如下**收窄**:

1. `ADR-0003` 继续适用于“共享数据模型、共享平台无关契约、避免三份业务语义”的总体方向。
2. 对 Web 面，不再要求“复用现有 plugin 源码”作为硬规则。
3. Web 可以独立实现 Vite SPA host shell 与浏览器 view layer。
4. Web 必须共享 `@repo/core` / `@repo/core-data` 暴露的稳定契约，以及后续明确冻结的 Sync / crypto / device session contracts。
5. `docs/planning/sub-prds/console/PRD.md` 继续作为共享模块 UI/交互的真理源。若 Web 因浏览器约束需要偏离，必须在对应 Web feature docs 中显式记录“偏离点 / 原因 / 影响面”。
6. 后续 Web rows 的 reviewer 不再按“源码是否复用”做硬门，而按“契约一致、行为一致、偏离有文档”验收。

## 后果

**正面**:
- Web roadmap 获得明确开工边界，不再被 `ADR-0003` 的源码复用字面要求卡死。
- 用户要的 clean Web rewrite 被保留，但不会演变成完全自由分叉。
- Console PRD 继续承担共享 UI truth source，降低信息架构和交互漂移。
- 数据契约、Sync 语义、设备会话、加密边界仍可保持单一事实来源。

**负面**:
- Web 会承担一部分专属 UI 实现和长期维护成本。
- 若后续 rows 不持续维护“偏离记录”，混合规则可能退化为事实上的双轨产品。
- 需要后续 feature 补 contract tests / behavior parity checks，文档规则才能真正落地。

## 实施规则

- Web feature 可以新建或重写浏览器专属组件，但不得自行发明新的数据契约。
- Web feature 不得绕开 `Repository<T>`、Sync blob protocol、device revoke / `X-Device-Id` 规则。
- 共享模块的 IA、默认导航、详情语义、键盘流、设置容器语义以 Console PRD 为准。
- 浏览器特有例外只允许发生在输入法、权限模型、窗口能力、安装/PWA、响应式布局等 Web 约束相关区域。

## 相关

- `docs/adr/0003-three-faces-architecture.md`
- `docs/planning/sub-prds/web/PRD.md`
- `docs/planning/sub-prds/console/PRD.md`
- `docs/reviews/web-ticktick-parity/20260521-feature-brief.md`
- `docs/workflow/roadmap/web-ticktick-parity.md`
