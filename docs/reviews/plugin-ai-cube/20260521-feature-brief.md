# Feature Brief — plugin-ai-cube

| 字段 | 值 |
|---|---|
| Brief 日期 | 2026-05-21 |
| Topic Slug | plugin-ai-cube |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_FEATURE_PLAN` |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| 来源 | `docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md` · Handoff 2 (F2) |
| 归属包 | `packages/plugin-ai-cube/` |

> 本文档是从 program brief `desktop-ux-rebuild` 拆出的 F2 子 feature brief。
> 原 program brief 保留不动；本文件作为 `plugin-ai-cube` 的独立 Step 0 锚点。

## Structured Brief

### Feature Title

AI Cube Control Surface Integration (F2)

### Canonical Slug

`plugin-ai-cube`

### Naming Rationale

- 本轮工作直接对应已有业务包 `packages/plugin-ai-cube/`，不需要再抽象成 program 级 slug。
- F2 目标不是“做一个新 UI 包”，而是把 `plugin-ai-cube` 从 Planned 推进到真正接入 desktop control window 的状态。
- `plugin-ai-cube` 同时是代码所有权、manifest 所有权和 workflow target，命名最稳妥。

### Problem / Motivation

正式业务 UI `plugin-ai-cube` 从未接入桌面。当前 control window 仍由 Host 自己渲染
`apps/desktop/src/components/AiAssistant/AiCube.tsx` 与
`apps/desktop/src/components/Settings/SettingsPanel.tsx`：前者只是文字 `"AI"` 的占位 Cube，
后者几乎全靠内联样式、单卡混装多类设置并附带 `MOCK_DATA` 调试块。这既无法满足
`desktop-ux-rebuild` 的对外展示目标，也持续违反“业务 UI 不得留在 Host”的红线 #1 / #8。

### Goal

把 `plugin-ai-cube` 正式 UI 接入 control window，完成托盘 + 对话面板视觉接入（mock only，不接 LLM），
并把 Host 中的 AI Cube / SettingsPanel 业务 UI 迁回插件，留下仅负责窗口壳、provider 与桥接回调的 Host shell。

### Scope

- 将 control window 的业务 UI 所有权迁到 `packages/plugin-ai-cube/`
- 接入 `AiCubePanel` 等现有组件，并重组为适合 control window 的托盘 / 面板结构
- 实现 PRD §5.8 Phase 0–3 的托盘动作集：
  - 新建 Grid
  - 剪贴板入口
  - 番茄入口
  - 设置入口
  - 全局搜索入口
- 重构 SettingsPanel 信息架构：
  - 画布操作区（新建 Grid / 清空）
  - 外观区（Cube / Grid 分区）
  - 移除 `MOCK_DATA` 调试块
- 用 F1 `@repo/ui` token / icon 完成 AI Cube 视觉重构
- 以静态 import 注册方式把 `plugin-ai-cube` 纳入 Host 启动路径

### Non-goals

- 不接真实 LLM，不进入 PRD §5.8 Phase 4
- 不做 OrganizerLayer / `useMultiWindowGrids` 迁移或 F3 grid redesign
- 不改 typed event protocol / Tauri command 签名
- 不触发 ship

### Dependencies

- `@repo/ui`（F1 产物，In-Dev，同一 wave 内可直接消费 token / icon）
- `@repo/core` / `@repo/core/events`
- `plugin-organizer`（Stable；仅通过既有 Host 回调/事件桥接使用）
- `@repo/core-data`（In-Dev；沿用 `plugin-ai-cube` 已有 repo provider，不扩 scope）

### Constraints

- 遵守 `docs/SYSTEM_ARCHITECTURE.md` §4，特别是红线 #1 / #8 / #11 / #12
- Host 只保留 control window 壳、window sizing / focus 逻辑、provider 桥接与静态注册
- `plugin-ai-cube` 不直接 import Host context；如需 host state，必须通过 plugin-own provider/adapters 注入
- Planned / In-Dev 依赖不得被当作稳定业务依赖：clipboard / pomodoro / search 只能做 placeholder 或 host no-op adapter
- 仅规划 `plugin-ai-cube` 与 `desktop-ux-rebuild/F2` 范围，不修改无关脏文件

### Acceptance Criteria

1. `apps/desktop/src` 不再含 `AiCube.tsx` / `SettingsPanel.tsx` 的业务 UI 实现；control window 渲染来自 `@repo/plugin-ai-cube` 的导出组件。
2. `plugin-ai-cube` 以静态 import 注册进入桌面启动路径，`manifest.json` / 四件套 / `PLUGIN_MAP` 在后续 build 中同步到接入后的状态。
3. Control 面板包含 PRD §5.8 Phase 0–3 托盘动作集；SettingsPanel 不再渲染 `MOCK_DATA` 调试块，且分区清晰。
4. AI Cube 视觉不再是纯 `"AI"` 文本占位，而是消费 F1 token / icon 的正式视觉。
5. 真机 macOS 下，Cube 单击展开、拖拽移动、拖拽后不误触发点击。

### Open Questions

1. 对话面板 mock 接入与 PRD “Phase 0–3 不假装能聊天” 的张力，是否采用“预览 / 未启用”可见态还是 feature flag。
2. 当前 Host `SettingsContext` 是否只作为临时 shell adapter 保留，还是顺带抽离到更通用位置。
3. clipboard / pomodoro / search 入口在对应 plugin 尚未稳定前，placeholder 的交互深度做到什么程度。
