# Feature Brief — desktop-design-system

| 字段 | 值 |
|---|---|
| Brief 日期 | 2026-05-21 |
| Topic Slug | desktop-design-system |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_FEATURE_PLAN` |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| 来源 | `docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md` · Handoff 1 (F1) |
| 归属包 | `packages/ui/` |

> 本文档是从 program brief `desktop-ux-rebuild` 拆出的 F1 子 feature brief。
> 原 program brief 保留不动；本文件作为 `desktop-design-system` 的独立 Step 0 锚点。

## Structured Brief

### Feature Title

Desktop Design System (Wave 0)

### Canonical Slug

`desktop-design-system`

### Naming Rationale

- 该工作项是 `desktop-ux-rebuild` program 的根依赖波次，不等同于 `@repo/ui` 包本身。
- slug 应描述用户可感知的 feature outcome，而不是仅描述实现载体。
- 实现落点可以是 `packages/ui/`，但 workflow target 仍保持 `desktop-design-system`，便于后续 F2/F3 依赖它的计划结果。

### Problem / Motivation

桌面端目前没有统一设计系统。颜色、阴影、圆角、间距与动效散落在 `apps/desktop/src/`、
`packages/plugin-organizer/` 与 `packages/plugin-ai-cube/` 的内联样式和 `App.css` 中；图标同时混用
emoji、点阵句柄与字符串图标，导致 AI Cube 与 Grid 视觉割裂，且无法形成可主题化的共享基线。

### Goal

建立可被 `plugin-ai-cube` 与 `plugin-organizer` 复用的 shared design token 体系，以及统一图标基线。

### Scope

- 定义并导出 6 类 design token：
  - 颜色
  - 间距
  - 圆角
  - 阴影
  - 动效时长与缓动
  - 字体/字重/渐变文本基线
- 在 `@repo/ui` 中定义统一图标基线与别名映射契约。
- 清理 `apps/desktop/src/App.css` 的 `.border` / `.border-red-500` / `.opacity-50` 调试类，或使其不再被引用。
- 用至少 1 个真实组件消费 token，证明导出面可用。

### Non-goals

- 不做 AI Cube 或 Organizer 的完整视觉重构。
- 不迁移 host 业务 UI。
- 不接真实 LLM。
- 不改 typed events payload schema 或 Tauri command 签名。
- 不修改其他 feature 的 `dev_log.md`。

### Dependencies

- `@repo/ui` (`packages/ui/`) — In-Dev，当前仅 3 个 stub 组件
- `@repo/core` — Stable
- 下游消费者：`plugin-ai-cube`、`plugin-organizer`

### Constraints

- 遵守 `docs/SYSTEM_ARCHITECTURE.md` §4，特别是红线 #8 / #11 / #12。
- 通用 UI 与 token 归属 `packages/ui/`，不落业务 plugin。
- F1 只能建立共享底座和最小可用证明，不顺带把 `@repo/ui` 扩成完整组件库。
- 不触发 ship。

### Acceptance Criteria

1. 6 类 token 齐全，且可被外部 import。
2. `App.css` 中 `.border` / `.border-red-500` / `.opacity-50` 被移除或不再被任何组件引用。
3. 至少 1 个真实组件引用 token，以证明可用。

### Open Questions

1. token 应落 `@repo/ui` 还是各 plugin 自管。
2. F1 是否要把 `@repo/ui` 从 In-Dev 升为 Stable。
3. 统一图标基线是否需要引入第三方图标库，还是先以内置 SVG baseline 落地。
