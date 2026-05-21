# Discovery Review — desktop-design-system

## 1. Problem Framing

`desktop-design-system` 是 `desktop-ux-rebuild` 的 Wave 0 根依赖。它解决的是 shared UI 缺位问题，
不是单一业务 plugin 的视觉 polish。

当前证据：

- `apps/desktop/src/App.css` 含硬编码颜色、阴影、圆角和调试类 `.border` / `.border-red-500` / `.opacity-50`。
- `packages/plugin-organizer/src/SmartContainer.tsx` 直接引用调试类，且根容器、resize handle、hover 态均内联样式硬编码。
- `packages/plugin-ai-cube/src/components/MessageBubble.tsx`、`InputBar.tsx`、`ActionSuggestion.tsx` 等存在独立配色和圆角常量。
- `packages/plugin-organizer/src/hooks/useFileDrop.ts` 仍以 emoji 作为部分文件类型默认图标。

这说明 F2/F3 如果先改业务组件而没有 F1，会继续复制样式常量，无法形成稳定可复用的桌面设计基线。

## 2. Feature Target Resolution

- Feature Title: `Desktop Design System (Wave 0)`
- Canonical Slug: `desktop-design-system`
- Owning Package for docs/runtime implementation: `packages/ui/`

命名结论：

- workflow target 使用 `desktop-design-system`，因为它描述的是被 F2/F3 消费的共享 feature 结果；
- 实现所有权落 `packages/ui/`，因为红线 #11 明确要求通用 UI 归 `packages/ui/`。

## 3. Current State Constraints

- `@repo/ui` 当前在 `docs/PLUGIN_MAP.md` 中是 `In-Dev`，仅有 `button.tsx` / `card.tsx` / `code.tsx` 三个 stub。
- `packages/ui/package.json` 目前 `exports` 为 `"./*": "./src/*.tsx"`，无法直接暴露纯 `.ts` token 模块。
- `plugin-organizer` 为 Stable，但其 `dev_log.md` 已处于长期 G3 workflow，F1 不能改写其 workflow state。
- `plugin-ai-cube` 已有基础 docs，但尚未成为桌面正式接入面。

## 4. External Research

No external research required.

理由：

- 本 feature 的主要决策是 repo 内部边界与所有权，不是引入外部技术栈。
- 图标基线可先以 repo 内部 SVG baseline 实现，不强依赖第三方库。
- 若后续 build 阶段确需引入第三方图标库，应在新增依赖前单独补做 dependency review。

## 5. Candidate Options

### Option A

`@repo/ui` 持有纯 token + icon baseline 导出，F1 不把 `@repo/ui` 升为 Stable。

内容：

- 在 `packages/ui/src/` 增加 token 模块与 icon baseline 模块。
- token 既提供 JS/TS import 面，也提供 CSS variable bridge 或等价常量层。
- 在 1 个真实组件上做最小 proof-of-use。
- `@repo/ui` 继续保持 In-Dev，待 F2/F3 消费并验证后再决定是否升 Stable。

优点：

- 符合红线 #11。
- 满足 F1 共享基线目标，同时控制范围。
- 不会把 F1 变成“大修整个组件库”。

缺点：

- F2/F3 需要依赖一个仍处于 In-Dev 的共享包。
- 需要在 build 阶段补 `package.json` export 面和最小测试覆盖。

### Option B

`@repo/ui` 持有 token + icon baseline，并在 F1 内把 `@repo/ui` 一次性升到 Stable。

优点：

- 后续消费者依赖关系最干净。
- 共享层稳定性信号更强。

缺点：

- 与当前 `@repo/ui` 仅 3 stub 的现实不匹配。
- 稳定化意味着需要更强的组件、测试、回归和 adoption 证据，超出 F1 范围。
- 会把 F1 从“底座建立”膨胀成“组件库整顿”。

### Option C

token 仍由 `plugin-ai-cube` 与 `plugin-organizer` 各自维护，未来再收敛。

优点：

- 当前 build 改动面最小。
- 对 `@repo/ui` 出口变更最少。

缺点：

- 违背 shared design system 目标。
- 会继续复制常量，F2/F3 之后还要再做一轮收口。
- 图标与动效依然难统一。

## 6. Recommendation

选择 **Option A**。

具体决策：

1. `desktop-design-system` 作为独立 workflow feature 存在，但实现所有权归 `packages/ui/`。
2. F1 只建立 token 与 icon baseline 的共享导出，不在本轮把 `@repo/ui` 升为 Stable。
3. proof-of-use 选择 `plugin-organizer` 的单个真实组件作为最小落点，并顺带完成 `App.css` 调试类清理。
4. 图标基线先采用 repo 内部 SVG baseline + alias registry，不在 F1 引入第三方图标依赖。

## 7. ADR-lite Decisions

### ADR-lite 1 — Token Ownership

- Decision: token 与 icon baseline 归 `@repo/ui`
- Why: 红线 #11 明确要求通用 UI 在 `packages/ui/`；如果继续分散在 plugin 内，F1 的目标本身就失效
- Guardrail: `@repo/ui` 在 F1 后仍保持 In-Dev，不提前宣称稳定

### ADR-lite 2 — Package Stability

- Decision: F1 不把 `@repo/ui` 升为 Stable
- Why: 目前证据仅够证明 token contract 可用，不足以证明整个共享 UI 包稳定
- Exit criteria for later promotion:
  - F2 与 F3 都消费 token
  - 至少一轮 desktop build + targeted typecheck 通过
  - icon baseline 替换掉当前关键 emoji/debug visual debt

### ADR-lite 3 — Icon Baseline Strategy

- Decision: F1 先建立内部 SVG baseline，不新增外部图标依赖
- Why: scope 只要求统一基线，不要求完整 icon library；避免在 planning 期引入额外依赖评审
- Deferred: 若 F2/F3 扩展后发现图标覆盖不足，再单独评审第三方库

## 8. Build Implications

建议 Phase 拆分：

1. 在 `packages/ui/` 建立 token contract、icon baseline、export surface 和 docs。
2. 在一个真实 consumer 上接入 token，并移除 `App.css` 调试类/引用。

关键实施提示：

- `packages/ui/package.json` 的 `exports` 需要支持 `.ts` token/icon 模块，不应继续只指向 `*.tsx`。
- proof consumer 不应演变为全量业务重绘；只需证明 import 与应用路径成立。
- 由于 `plugin-organizer` 已在长期 workflow 中，F1 build 只应做局部视觉基线消费，不改其 `dev_log`。

## 9. Risks

1. `@repo/ui` export 面调整若处理不好，会影响现有 stub 组件导入路径。
2. 只做一个 proof consumer 容易让 token 命名偏向单一场景，需要在命名上保持中性。
3. 图标 baseline 若仅覆盖当前最常见语义，F2/F3 可能追加新别名需求。

## 10. Open Questions

1. proof consumer 优先落 `SmartContainer` 还是 `GridItem`，需要 build 阶段按改动最小原则选择。
2. 字体 token 是否只定义桌面现有字体栈，还是同时定义 display/body/mono 三类语义槽位。
3. F2 是否要消费同一套渐变 token 来替换当前 AI Cube 蓝紫渐变，这影响 token 命名中是否暴露“cube”语义；当前建议不要。
