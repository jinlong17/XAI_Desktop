# Feature Brief — plugin-console

| 字段 | 值 |
|---|---|
| Feature Slug | `plugin-console` |
| Feature Alias | `console-ticktick-parity` |
| 创建日期 | 2026-05-21 |
| 来源文档 | `docs/reviews/console-ticktick-parity-audit-2026-05-21.md`, `docs/reviews/console-ticktick-parity/20260521-feature-brief.md` |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| 输出状态 | `READY_FOR_FEATURE_PLAN` |

## Canonical Target Resolution

- Feature Title: `Console TickTick parity host shell`
- Canonical workflow target: `plugin-console`
- Naming rationale:
  - Workflow V2 的默认 feature 单元是 `packages/plugin-<name>/`
  - 本轮拥有主要外壳职责的 package 是 `packages/plugin-console/`
  - `console-ticktick-parity` 保留为需求/审计别名，用于描述目标形态，不作为最终 package slug

## Problem / Motivation

`plugin-console` 当前是两栏导航脚手架，未接入 `apps/desktop`，也未实现 Console PRD 要求的三栏 TickTick 风格宿主壳。`ConsoleView` 契约、独立 Console 窗口生命周期、菜单栏、主题/密度、Sidebar IA、以及 Console 与 overlay 的 revision/ack/reconcile 一致性链路均未落地。

## Desired Outcome

交付一个独立的 macOS Console 窗口，采用 `宿主壳 + 业务 plugin ConsoleView slot` 架构，实现：

- 三栏 Sidebar / List / Detail 布局
- `plugin-productivity` 的任务 / 番茄 / 习惯 / 四象限视图
- `plugin-labels` 的标签视图
- Cmd+K、通知中心、设置容器、主题/密度/字号切换
- Console 与 overlay 的事件级一致性

## Scope

### In scope

- `plugin-console` 三栏宿主壳重写
- `@repo/core` ConsoleView 契约族、registry slot API、typed `console:*` events、manifest typing
- `apps/desktop/src/` Console 路由注册
- `apps/desktop/src-tauri/` Console 窗口命令与 frame 持久化
- `plugin-productivity` / `plugin-labels` 导出并接入 `ConsoleView`
- `docs/PLUGIN_MAP.md` 最小必要更新：登记 `plugin-console`

### Out of scope

- Calendar 完整 ConsoleView（仅灰显占位）
- `plugin-project` 看板 / 表格 ConsoleView
- Todo 附件、复杂 RRULE、批量改字段
- 同步引擎实现本身
- Web Console host
- 将 TickTick 业务逻辑搬进 `plugin-console`

## Constraints

- 业务逻辑不得进入 host / core / `plugin-console` shell 之外的壳层
- Plugin 间交互必须走 `@repo/core/events`
- Plugin 内禁止直接调用 `@tauri-apps/api`
- `plugin-console` 必须保持平台无关，可未来复用到 Web host
- 未到 Stable 的依赖必须以 Contract Mock 解耦
- 真机 macOS 窗口/菜单栏/多 Space 验证作为 deferred gates 记录，不阻塞自动化规划完成

## Dependencies

- Stable: `@repo/core`
- In-Dev: `@repo/core-data`, `@repo/ui`, `plugin-account`
- Authority gap in `docs/PLUGIN_MAP.md`: `plugin-productivity`, `plugin-labels` package directories exist, but neither plugin is registered in the canonical dependency table yet
- Native host: `apps/desktop/src/main.tsx`, `apps/desktop/src-tauri/src/commands/window.rs`

## Acceptance Criteria

1. Console 可作为独立窗口开/关/最小化/全屏，并恢复 frame 与 nav state。
2. 三栏布局支持拖动、折叠、宽度持久化。
3. `@repo/core` 冻结 ConsoleView 契约族，manifest/registry 校验 console-capable plugins。
4. `plugin-productivity` 与 `plugin-labels` 在 Console 内提供真实可用的 ConsoleViews。
5. Cmd+K 搜索支持 Todo/Label/模块跳转，200ms timeout 后保留部分结果。
6. Console 改数据后，overlay 通过 revision + ack + reconcile 刷新。
7. 主题/密度/字号切换零闪烁。
8. `plugin-console` 在 `PLUGIN_MAP.md` 登记，manifest 改为 `windows.console=true`，host 注册完成。

## Planner Notes

- Contract Mock 不是最终交付形态，而是 Phase 2 shell 与 Phase 3/4 真实模块接入之间的并行解耦手段。
- `@repo/ui` 仅在需要抽取真正通用 split-pane primitive 时参与；shell 专属布局默认留在 `plugin-console`。
- broader `PLUGIN_MAP` 失真治理不纳入本轮，仅修正 `plugin-console` 自身登记。
- `plugin-productivity` 与 `plugin-labels` 在 `docs/PLUGIN_MAP.md` 完成正式登记并获得可解释状态前，Phase 3/4 只能停留在计划态，不能把真实 ConsoleView 接入当作已授权依赖。
