# Desktop Design System — Test Strategy

## Unit Coverage

- 验证 `designTokens` 含 6 类顶层 token。
- 验证每类 token 至少存在 1 个可消费键值。
- 验证 `iconAliasMap` 能覆盖当前已知遗留来源：
  - organizer 文件默认 emoji
  - Grid 头部/锁定等常见语义
  - AI Cube / control 面板所需基础动作语义
- 验证 token 导出是只读 contract（类型层或 snapshot 层均可）。

## Contract Coverage

- `pnpm --filter @repo/ui check-types`
- 目标 consumer 包 typecheck（至少 `@repo/plugin-organizer`）
- 如接入 host 壳样式文件，补 `pnpm --filter desktop build` 作为 contract smoke test
- grep/静态检查：
  - `App.css` 中 `.border` / `.border-red-500` / `.opacity-50` 已删除，或无引用
  - 至少 1 个真实组件从 `@repo/ui/tokens` 导入

## Regression / Manual Scenarios

- proof consumer 渲染后，原交互不回退（拖拽、hover、基础文案不受影响）
- AI Cube 与 Organizer 后续接入时，token 语义无需重命名即可覆盖各自表面
- 桌面壳加载时不出现因 export path 变更导致的模块解析失败

## Mock Strategy

- F1 自身不需要 mock：token 与 icon baseline 是纯静态前端 contract。
- 对 F2/F3 而言，允许直接消费同分支上的 `@repo/ui` 新导出，不单独 mock。
- 对 program 外的其它 feature，如需提前消费，仍应视 `@repo/ui` 为 In-Dev 并通过轻量 wrapper 隔离。

## Acceptance Trace

1. 六类 token 齐全且可 import → 单元测试 + typecheck
2. `App.css` 调试类退出 → grep / build 证明
3. 至少一个真实组件消费 token → import 证据 + smoke test
