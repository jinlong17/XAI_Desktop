# Desktop Design System — API Contract

## Public Surface

F1 计划在 `@repo/ui` 中新增以下共享导出面：

### `@repo/ui/tokens`

导出内容：

- `colorTokens`
- `spaceTokens`
- `radiusTokens`
- `shadowTokens`
- `motionTokens`
- `typographyTokens`
- 聚合只读对象 `designTokens`

契约要求：

- 六类 token 都必须可从包外直接 import。
- token key 使用语义命名，不暴露业务语义（例如不要出现 `cubePrimary` / `gridHeaderDanger` 这类 feature-specific key）。
- 导出对象应为只读常量；同名 key 的重命名属于 breaking contract，必须同步更新 docs。

### `@repo/ui/icons`

导出内容：

- `DesktopIcon`
- `desktopIconRegistry`
- `DesktopIconName`
- `iconAliasMap`

契约要求：

- 统一使用共享 viewBox / size / stroke 基线。
- alias 层负责把当前 emoji、字符串图标名或业务层旧标识映射到统一图标名。
- F1 不要求完成所有业务图标迁移，但要求提供后续替换的单一入口。

## Packaging / Export Assumptions

- `packages/ui/package.json` 需要扩大 export surface，不能继续只暴露 `*.tsx`。
- token 模块可以是 `.ts`，icon 模块可以是 `.ts` 或 `.tsx`，但外部导入路径必须稳定。
- build 阶段若引入 CSS variable bridge，其入口需与 token 导出同步记录。

## Upstream / Downstream Interfaces

### Upstream

- 无 Tauri command
- 无 typed events
- 无 `@repo/core/events` 契约变化

### Downstream

- `plugin-organizer` 与 `plugin-ai-cube` 通过 import 使用 token/icon 导出
- proof consumer 至少 1 处，作为 contract smoke test

## Error Semantics

- 静态 token import 不应产生运行时异常。
- 不允许“缺 key 时 silent fallback 到任意硬编码颜色”；缺失应尽量在 TypeScript 层暴露。
- alias 查找若需要运行时 fallback，必须返回明确的默认 icon 名，而不是 emoji 字符串。

## Permission / Idempotency

- 无权限需求。
- 纯静态导出，重复导入和重复应用是幂等的。

## Compatibility Notes

- F1 不改任何事件 payload、Tauri command 签名或持久化结构。
- 由于 `@repo/ui` 仍为 In-Dev，下游仅限同 program wave 的 F2/F3 直接消费；对其他 feature，不应在未审查前把该 contract 当作稳定依赖。
