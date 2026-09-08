# Feature Brief — web-architecture-adr-lite

| 字段 | 值 |
|---|---|
| Feature Slug | `web-architecture-adr-lite` |
| 创建日期 | 2026-05-21 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-architecture-adr-lite/20260521-roadmap-seed.md` |
| 关联文档 | `docs/adr/0003-three-faces-architecture.md`、`docs/planning/sub-prds/web/PRD.md`、`docs/planning/sub-prds/console/PRD.md`、`docs/workflow/roadmap/web-ticktick-parity.md` |

---

## Structured Brief

### Problem / Motivation

Web 路线在实现前存在一条根级冲突:用户已选择“Web clean rewrite”，但 `ADR-0003` 仍是 `Accepted`，且把 overlay / console / Web 定义为三种宿主壳装载同一套平台无关 plugin。若不先决策，后续 Web roadmap 会同时受到“必须复用 plugin UI/业务层”和“允许独立重写 Web 形态”两套相反规则约束。

### Desired Outcome

产出一份**被接受的** ADR 级决策，明确 Web 后续实现必须遵守的复用边界，并把该结论同步到 Web brief / PRD / roadmap 说明中，使后续 feature row 不再反复讨论根架构。

### Scope

- 评估三条候选路径:严格沿用 `ADR-0003`、完整 Web 专属重写、混合规则。
- 明确 Console PRD 是否继续作为 Web 的 UI 真理源。
- 明确 Web 对共享数据契约、Sync 协议、Repository 契约、行为一致性的继承边界。
- 产出新 ADR 或 ADR-0003 修订。
- 更新最少量的 Web 相关参考文档，使 reviewer 能直接看见结论。

### Non-goals

- 不修改产品运行时代码。
- 不启动 `apps/web` 重构、Vite 迁移、Sync driver、加密栈或任何业务模块实现。
- 不在本 feature 中解决 `PLUGIN_MAP` 漂移或 Web 技术栈落地细节。

### Constraints

- 这是 docs-only ADR-lite feature。
- 必须显式覆盖:plugin reuse vs Web-specific rewrite、Console PRD 作为 UI truth source、drift risk、data-contract sharing、future maintenance cost。
- 允许的代码改动仅限极小的文档链接/引用修正。
- `dev_log.md` 在本轮结束时必须为 `NEEDS_REVIEW`。

### Acceptance Criteria

1. 仓库内存在一份 `Accepted` 状态的 ADR，明确 Web 后续遵循的实现 stance。
2. 该 ADR 明确回答五个问题:复用边界、UI 真理源、漂移控制、共享契约、维护成本。
3. Web 相关 brief / PRD / roadmap 注释中可直接追溯到该 ADR。
4. 本 feature 只产生文档改动，无产品代码改动。

### Open Questions

1. Web 是否仍强制复用 `plugin-console` / `plugin-productivity` 等现有 package 源码，还是仅复用其契约与行为定义?
2. 若允许 Web 专属 UI 重写，谁是跨 face 行为一致性的真理源?
3. 未来 Web row 的评审是按“组件源码复用率”还是按“契约/行为一致性”验收?

### Planner Handoff

- 优先级:W0 root decision，必须早于任何实现 row。
- 推荐方向:若保留“clean rewrite”，需以正式 ADR 明确它是**混合规则**而非“完整脱离现有契约”的自由重写。
- 预期输出:新 ADR + discovery review + `packages/web-architecture-adr-lite/docs/*` + 最少参考文档更新。
