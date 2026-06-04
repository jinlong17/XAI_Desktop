# ADR-0015: 桌面插件范围 — organizer P 级 reconcile 与 pet 归属

| 字段 | 值 |
|------|---|
| 状态 | **Accepted（web 侧,operator 2026-06-02 批准两项推荐）** — 决策 2 全部落地(PLUGIN_SDK §9.9 + 文档集);决策 1 web 侧落地(organizer = 已交付旗舰);唯一遗留:`dev` 线 ADR-0011 的 organizer→P3 reconcile 待 operator 另行确认后在 dev 线执行 |
| 日期 | 2026-06-02 |
| 决策者 | Claude（subagent）起草;operator 2026-06-02 批准 |
| 关联 | ADR-0010（amended）、ADR-0011（dev 线，web 分支不可见）、ADR-0013 §S7、`docs/MODULE_BOUNDARIES.md`、`docs/planning/sub-prds/plugin/PRD.md` |

## 背景

桌面插件（模块 #3）在 Web 转向后留下两处未 reconcile 的归属问题，直接影响"桌面插件该开发什么"的边界清晰度：

1. **organizer 的 P 级两线冲突（R7，ADR-0013 §S7 自陈未解决）**：`web` 线所有现行文档（CLAUDE.md / PLUGIN_MAP / ADR-0010 D1 / PRODUCT_MODULE_MAP）写 **organizer = P2**；但 `dev` 线 **ADR-0011（2026-05-27）已把 overlay/file-organizer 降为 P3 Future**。ADR-0011/0012 文件在 `web` 分支不存在。这导致 organizer 既被当作"P2 paused greenfield 插件"，又被当作"P3 future"，而实际上它在代码里 **Stable / 已 shipped / 已接入桌面宿主**（25+ 测试，App.tsx/GridWindow/ControlWindow 三处接线）。

2. **pet 归属冲突**：`PRODUCT_MODULE_MAP` 与 CLAUDE.md 把 `plugin-pet` 当**独立 P2 包**；但 `PLUGIN_SDK.md`（2026-05-14 蓝图）把桌宠定义为 **`plugin-widgets` 的子模块**（`desktop-pet` contentType）。代码里 `packages/plugin-pet` 已作为独立骨架包存在。

## 方案

### 决策 1 — organizer P 级

- **方案 A（推荐）**：organizer 是**已交付的旗舰/参考插件**，视为 P1 App 原生地基的一部分（"shipped foundation"），**既不是 P2 greenfield，也不是 P3 future**。P2-paused 冻结只适用于**未建成的**插件（clipboard/widgets/pet/meditation）。
  - 优点：与代码事实一致（Stable/shipped）；消除"已 ship 的东西被标 paused/future"的悖论；让 P2-paused 语义只约束真正没做的插件。
  - 缺点：需要在 reconcile 时同时校正 web 线（P2→"shipped foundation"）与吸收 dev 线 ADR-0011（P3→不适用，因为已交付）。
- **方案 B**：强行二选一——要么全标 P2，要么全标 P3。
  - 缺点：P2 暗示"未开工被冻结"，P3 暗示"未来才做"，**都与 organizer 已 shipped 的事实矛盾**。

### 决策 2 — pet 归属

- **方案 A（推荐）**：保留 `plugin-pet` 为**独立包**，并更新 `PLUGIN_SDK.md` 使其与现实一致（移除"桌宠=widgets 子模块"的旧表述）。
  - 优点：代码已存在独立包；pet 有独立的状态机 + AI persona 生命周期（FR-PET-09~11 依赖 ai-cube），与通用 widget host 关注点不同。
  - 缺点：多一个包要维护；与 2026-05-14 SDK 蓝图不一致（需改 SDK）。
- **方案 B**：把 pet 折叠进 `plugin-widgets`（`desktop-pet` contentType），废弃独立骨架。
  - 优点：与旧 SDK 蓝图一致，少一个包。
  - 缺点：要废弃已存在的 `plugin-pet` 代码；把 AI persona 生命周期塞进通用 widget host 会让后者变重。

## 决策

**Accepted（operator 2026-06-02 批准）**：决策 1 取 **方案 A**(organizer = 已交付旗舰,移出 P2/P3 优先级队列),决策 2 取 **方案 A**(pet 保留独立包 plugin-pet)。落地状态:

- **决策 2 — 已全部落地**:`docs/PLUGIN_SDK.md` §9.9 改为独立 `plugin-pet` manifest(commit d1fc9d8);`MODULE_BOUNDARIES.md` / `module-classification.json` 同步。
- **决策 1 — web 侧已落地**:`CLAUDE.md` / `PLUGIN_MAP.md` / `MODULE_BOUNDARIES.md` / `module-classification.json` 已把 organizer 标为"已交付旗舰(graduated),不属 P2-paused 冻结范围"。
- **决策 1 唯一遗留(待 operator 另行确认)**:`dev` 线 ADR-0011 仍把 organizer 降为 P3 Future;撤销/调整它需切到 `dev` 分支(ADR-0013:任何触及 dev 的操作需 operator 显式确认),不在本 `web` 会话自动执行。

## 后果

- 正面：桌面插件边界对外一致——organizer 作为已交付旗舰、其余四个作为 paused greenfield，不再自相矛盾；pet 归属明确。
- 正面：解开 ADR-0013 §S7 #7 长期挂起的 reconcile 项。
- 负面：reconcile 落地需要触及 `dev` 线（ADR-0011）+ 改 PLUGIN_SDK，属 operator 确认范围（ADR-0013：任何触及 dev 的操作需显式确认）。
- 待办状态:① web 侧把 organizer 标为 "delivered flagship" ✅ 已落地(CLAUDE.md / PLUGIN_MAP / MODULE_BOUNDARIES / classification);② dev 线撤销/调整 ADR-0011 对 organizer 的 P3 降级 ⏳ 待 operator 在 dev 线确认执行;③ 更新 PLUGIN_SDK 的 pet 表述 ✅ 已落地(commit d1fc9d8);④ 同步 dev-dashboard ⏳(product_line 文案已含 ADR-0015 引用,`pnpm dashboard` 重生成待跑)。
