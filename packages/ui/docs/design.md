# Desktop Design System — Design Snapshot

## Selected Option

`desktop-design-system` 作为独立 workflow feature 存在，运行与文档所有权归 `packages/ui/`。
F1 在 `@repo/ui` 内建立 shared design token 与 icon baseline 导出，不在本轮把 `@repo/ui` 升为 Stable。

## Review Doc Path

`docs/reviews/desktop-design-system/20260521-discovery-review.md`

## Review Date / Version

2026-05-21 · v1

## Naming Rationale

- Feature slug 使用 `desktop-design-system`，因为它是 `desktop-ux-rebuild` program 下被 F2/F3 依赖的共享能力。
- 文档路径落 `packages/ui/docs/`，因为实现所有权属于 shared UI 层，而不是单独新建一个 plugin 包。

## Frozen Assumptions

1. `@repo/ui` 仍是 `In-Dev`，F1 只建立共享 token contract，不宣称整个包稳定。
2. F1 范围仅包含 token / icon baseline / export surface / App.css debug cleanup / 最小 proof-of-use。
3. 不修改 typed events、Tauri command、localStorage schema、host/plugin 边界。
4. 不引入第三方图标依赖；先以内置 SVG baseline 与 alias registry 落地。
5. downstream proof consumer 只做最小接入，不在 F1 内顺带完成业务组件重绘。

## Dependency Overview

### Upstream

- React runtime（`@repo/ui` 现有依赖）
- 无 `@repo/core` 强依赖；token 层应保持纯前端常量/类型

### Downstream

- `packages/plugin-organizer/`
- `packages/plugin-ai-cube/`
- 临时仍可能被 `apps/desktop/src/` 中遗留 host 视觉壳引用，但 F2 会继续清理 host 业务 UI

## Scope Boundary

### In Scope

- token 命名体系
- token 导出方式
- icon baseline 命名与 alias 规则
- `App.css` 调试类退出路径
- 最小 consumer 证明

### Out of Scope

- 新组件库大规模建设
- AI Cube / Organizer 完整视觉重构
- PLUGIN_MAP 状态升级
- ship / release 操作
