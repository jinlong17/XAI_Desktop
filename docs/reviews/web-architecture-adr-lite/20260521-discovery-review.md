# Discovery Review — web-architecture-adr-lite

| 字段 | 值 |
|---|---|
| Feature | `web-architecture-adr-lite` |
| 日期 | 2026-05-21 |
| 执行者 | Codex (`feature-plan` inline) |
| 外部调研 | No external research required |

## Problem Framing

`ADR-0003` 当前要求 overlay / console / Web 共享同一套平台无关 plugin，差异只在宿主壳与 driver。与此同时，Web 路线的 Step 0 brief、roadmap manifest 和用户决策都指向“clean Web rewrite”。如果不在实现前解决，后续 rows 会在三类问题上持续漂移:

- UI 该复用 `plugin-console` 还是独立实现浏览器视图层。
- 数据与 Sync 契约是否允许 Web 分叉。
- reviewer 该按源码复用还是按行为一致性验收。

## Source Evidence

- `docs/adr/0003-three-faces-architecture.md`: `Accepted`，方案 C 明确要求三面基于 plugin 复用。
- `docs/planning/sub-prds/web/PRD.md`: Web 被定义为第三个面，并多处继承 `ADR-0003`。
- `docs/planning/sub-prds/console/PRD.md`: Console PRD 已经是三栏布局、模块视图、键盘流的细化真理源。
- `docs/reviews/web-ticktick-parity/20260521-feature-brief.md`: 已把该冲突标记为最高优先 ADR-lite。
- `docs/workflow/roadmap/web-ticktick-parity.md`: row #1 就是为了解决这个冲突。

## Options

### Option A — Keep ADR-0003 strict plugin reuse

Web 必须复用现有平台无关 plugin 源码，差异只允许在 host shell 和 data driver。

Pros:
- 最大化跨 face 一致性。
- 源码级复用带来最低的长期重复实现成本。
- 与 `ADR-0003` 和 Web PRD 原文最一致。

Cons:
- 直接违背用户已选择的 clean rewrite 方向。
- 需要先证明 `plugin-console`、`plugin-productivity` 等都具备 browser-safe build 边界，否则 roadmap 被根前置条件卡死。
- 把“能否开工 Web”绑定到现有 plugin 的平台无关成熟度，当前风险过高。

### Option B — Full Web-specific rewrite

Web 拥有独立 UI、独立业务层实现，只共享后端账号与数据存储。

Pros:
- 最符合“clean rewrite”的直觉。
- 不受现有 desktop/plugin 实现细节牵制。
- Web 交互可围绕浏览器场景自由演化。

Cons:
- 直接推翻 `ADR-0003` 的核心收益。
- 漂移风险最高，尤其是快捷键、模块 IA、Sync 行为、设置语义。
- 数据和行为语义会形成双实现，维护成本高，bug 修复需要双线跟进。

### Option C — Hybrid rule: Web-specific shell and view layer, shared contracts and UX truth

Web 允许独立宿主壳与浏览器视图层实现，但必须共享数据契约 / Repository 契约 / Sync 协议，并以 Console PRD 作为共享模块的 UI/行为真理源；现有 plugin 源码复用是“可选优化”，不是 Web 开工前置门。

Pros:
- 保留用户想要的 clean Web rewrite。
- 避免完整双实现的数据/行为分叉。
- 把 reviewer 的重点从“是否复用源码”转为“是否遵守契约与行为真理源”。
- 允许后续逐步抽取可复用组件，而不是在 W0 强行证明所有 plugin 已 browser-safe。

Cons:
- 仍然会有 Web 专属 UI 实现成本。
- 需要更严格的文档和验收纪律来控制 drift。
- 需要明确“允许偏离 Console PRD 的条件”和记录方式。

## Recommendation

选择 **Option C**。

这是对 `ADR-0003` 的**收窄**而不是完全推翻:

- Overlay / Console 仍遵守现有 plugin reuse 原则。
- Web 不再被要求把“复用现有 plugin 源码”作为硬前提。
- Web 仍必须共享数据契约、Sync 协议、Repository 语义和核心 IA/行为定义。
- Console PRD 保持 Web 的共享 UI truth source；浏览器特有差异必须在 Web docs 中显式记录。

## Decision Rules To Freeze

1. Web 可以重写 host shell 和浏览器 view layer。
2. Web 不可以分叉 `Repository<T>`、Sync blob protocol、加密/设备会话契约、实体行为语义。
3. Console PRD 是共享模块 UI/交互的真理源，除非浏览器约束要求偏离。
4. 任何偏离 Console PRD 的 Web 决策，都必须在 Web feature docs 中写明“为什么仅 Web 例外”。
5. 后续 Web rows 的评审重点是“契约一致 + 行为一致 + 例外有文档”，不是“源码复用率”。

## Risks

- 若 reviewer 不接受混合规则，Web roadmap 需要整体回退到 strict reuse 或 full rewrite，影响后续所有依赖 row。
- 若后续 rows 不持续引用 Console PRD / ADR，混合规则会退化成事实上的自由重写。
- 需要后续 feature 明确补 browser-safe contract tests，否则“共享契约”只能停留在文档层。

## Open Questions

- 是否需要在后续某个 feature 中补一份“Web allowed deviations register”集中记录所有对 Console PRD 的例外。
- 是否需要在 `docs/PLUGIN_MAP.md` 或单独地图中标出“可源码复用 / 仅行为复用 / 桌面专属”的 Web 兼容性状态。
