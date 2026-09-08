# Discovery Review — plugin-ai-cube

## 1. Problem Framing

`plugin-ai-cube` 已经有一套 mock conversation scaffold，但桌面 control window 仍然由 Host 的占位实现承载。
这造成三个问题同时存在：

- 架构问题：`apps/desktop/src/windows/ControlWindow.tsx` 直接渲染 Host 内部的 `AiCube` 与 `SettingsPanel`，违反 Host 零业务原则。
- 体验问题：当前 Cube 只是 `"AI"` 文字气泡，设置面板把画布动作、外观设置和调试块混在一起，和 F1 建立的视觉基线脱节。
- phase 问题：PRD §5.8 明确要求 Phase 0–3 把 AI Cube 当快捷入口托盘，而不是假装已经有可聊天的 AI 能力。

本轮 F2 的本质不是“把旧 panel 搬个位置”，而是把 control window 改造成一个插件拥有的业务表面，同时保持 Host 只做窗口壳与桥接。

## 2. Feature Target Resolution

- Feature Title: `AI Cube Control Surface Integration (F2)`
- Canonical Slug: `plugin-ai-cube`
- Runtime / docs owner: `packages/plugin-ai-cube/`
- Program parent: `desktop-ux-rebuild` F2

命名结论：

- 这里不需要再抽象 program 级 slug，因为代码、manifest、四件套和接入边界都收束到同一个 plugin。
- 直接以 `plugin-ai-cube` 作为 workflow target，最符合后续 build / verify / ship 的路径约束。

## 3. Current State Evidence

### Host residuals

- `apps/desktop/src/windows/ControlWindow.tsx` 硬编码渲染 `../components/AiAssistant/AiCube` 和 `../components/Settings/SettingsPanel`。
- `apps/desktop/src/components/AiAssistant/AiCube.tsx` 内持有拖拽、edge dock、hover hint、纯文字 `"AI"` glyph 以及 panel toggle 行为。
- `apps/desktop/src/components/Settings/SettingsPanel.tsx` 内同时处理新建 Grid、清空、Cube 外观、Grid 外观，并附带 `MOCK_DATA` 调试块。

### Plugin baseline

- `packages/plugin-ai-cube/src/index.ts` 目前只导出 `AiCubePanel`、conversation hooks、repo provider 等 scaffold surface，没有 control window 注册入口。
- `packages/plugin-ai-cube/src/components/AiCubePanel.tsx` 是完整 mock conversation card，但现态更像 Phase 4 的对话界面，不是 Phase 0–3 的 tray-first surface。
- `packages/plugin-ai-cube/src/hooks/useAiConversation.ts` 仍通过 `window.dispatchEvent("ai-cube:mock-action")` 发本地事件，说明当前 UI 还没对接正式控制面。

### Architecture / PRD constraints

- `packages/core/src/types/plugin.ts` 已支持 `ControlWidget` / `SettingsPanel` 组件位，`PluginRegistry` 与 `ControlHost` 基础设施已存在。
- `apps/desktop/src/main.tsx` 目前只静态注册了 `plugin-account`，`plugin-ai-cube` 还未纳入注册路径。
- PRD §5.8 明确规定：Phase 0–3 是快捷入口托盘；真实对话能力属于 Phase 4。
- F1 已在 `@repo/ui` 提供 token / icon baseline，可供 F2 消费。

## 4. External Research

No external research required.

理由：

- 本 feature 是纯内部边界重构 + 现有业务 UI 接入，不涉及第三方库选型或协议变更。
- 关键决策取决于仓库内既有 `PluginRegistry`、Host shell、`plugin-ai-cube` scaffold、以及 PRD §5.8 的 phase 约束。

## 5. Candidate Options

### Option A — Host direct-import plugin components

做法：

- `ControlWindow.tsx` 直接从 `@repo/plugin-ai-cube` import 新的 `AiCubeControlSurface` / `AiCubeSettingsPanel`
- Host 把 settings / organizer actions 作为 props 传给这些组件

优点：

- 实现路径最短
- 不需要先补 plugin 注册文件
- 可以最快把业务 UI 从 Host 文件夹迁走

缺点：

- 没有用上仓库现成的 `PluginRegistry` / static registration contract
- ControlWindow 仍显式耦合到具体 plugin 组件名，演进空间较差
- 容易把 “临时直接 import” 留成长期结构

### Option B — Static registration + plugin-owned control surface + host adapters

做法：

- 在 `packages/plugin-ai-cube/` 新增 `registerAiCubePlugin()`，通过静态 import 在 `apps/desktop/src/main.tsx` 注册
- `PluginRegistry.register()` 暴露一个零 props 的 `ControlWidget`
- Host shell 在 `ControlWindow` 中只负责：
  - native window 尺寸 / focus / blur 关闭
  - organizer create/clear 回调
  - appearance/settings adapter 注入
- `plugin-ai-cube` 导出自己的 provider / adapter contract，让零-props `ControlWidget` 在插件内部消费这些上下文

优点：

- 完整符合红线 #1 / #8 / #12
- Host 不需要 import plugin 内部组件树，只负责 shell + provider
- 保留未来把 control window 扩展为更多 plugin widget 的结构可能
- 可以把 SettingsPanel 并入 plugin-own control surface，避免 Host 再保留一个业务面板壳

缺点：

- 需要补一层 adapter/provider 契约
- `ControlHost` 当前只渲染 `ControlWidget`，要求本轮把 tray + panel + settings 作为一个组合 surface 设计好

### Option C — Keep Host tray shell, embed plugin panel only

做法：

- 保留 Host `AiCube.tsx` 与 `SettingsPanel.tsx`
- 只在 panel 内嵌 `AiCubePanel` 或其局部组件

优点：

- 代码变更最小
- 不需要重新设计 control surface contract

缺点：

- 直接违背 brief 和架构红线
- SettingsPanel 依然留在 Host
- PRD phase 张力和 F1 token 接入都只会得到半吊子结果

## 6. Recommendation

选择 **Option B — Static registration + plugin-owned control surface + host adapters**。

原因：

- 它是唯一一个同时满足架构边界、静态注册要求、以及未来可演进性的方案。
- 它允许 Host 保留真正应由壳层拥有的能力：native window size、focus dismiss、organizer bridge、settings state bridge。
- 它避免让 `plugin-ai-cube` 反向 import Host context，同时又不强迫本轮顺带完成 `plugin-settings` 或 F3 organizer 重构。

## 7. Recommended Architecture Slice

### Host responsibilities

- `apps/desktop/src/main.tsx`
  - 静态 import `registerAiCubePlugin()`
  - 启动时执行注册
- `apps/desktop/src/windows/ControlWindow.tsx`
  - 只保留 control window shell
  - 保留 native size / position / focus handling
  - 组装 organizer create/clear callbacks
  - 读取现有 `SettingsContext`，把 appearance adapter 注入 plugin provider
  - 渲染 `ControlHost` 或 `PluginRegistry.getPlugin("ai-cube")` 的 control widget

### Plugin responsibilities

- 新增 `registerAiCubePlugin()`
- 新增 plugin-own control provider / adapters
- 新增 control surface business UI：
  - Cube trigger / drag affordance
  - tray action rail
  - preview conversation panel
  - sectioned settings content
- 现有 `AiCubePanel`、`MessageBubble`、`InputBar` 等组件重组成 preview mode，而不是把 Phase 4 聊天能力假装成已启用

### Dependency notes

- `plugin-organizer` 是 Stable，可通过 Host 持有的现有 create-grid / clear-all 行为桥接，不需要本轮新增 plugin-to-plugin direct import
- `clipboard` / `pomodoro` / `search` 没有稳定 plugin 可依赖，因此 Phase 0–3 只能使用 placeholder / disabled action / host no-op adapter
- `@repo/ui` 仍是 In-Dev，但作为同一 `desktop-ux-rebuild` wave 的上游 F1，可以直接消费 token / icon

## 8. ADR-lite Decisions Captured Here

### D1 — Control window 接入方式

- **Decision**: 使用静态注册的 plugin-owned `ControlWidget`，Host 只负责 shell + provider/adapters。
- **Why**: 满足红线 #1 / #8 / #12，且不需要运行时动态插件加载。

### D2 — 对话面板与 PRD Phase 门控

- **Decision**: 对话面板允许“视觉接入”，但必须以 **Preview / AI disabled until Phase 4** 的显式状态呈现。
- **UI rule**:
  - 可展示现有 mock transcript / suggestion cards 作为视觉占位
  - 不允许呈现“可真实发送并得到智能回答”的误导性状态
  - 如保留输入框，发送动作必须禁用或走明确的 preview no-op 文案
- **Why**: 兼顾用户要求的“接入已有对话面板视觉”与 PRD “Phase 0–3 不假装能聊天”的硬约束。

### D3 — SettingsContext 处理策略

- **Decision**: 本轮不重做全局 settings 架构；Host `SettingsContext` 作为临时 shell-side adapter 保留，由 Host 读出后注入 plugin-own provider。
- **Why**: 可以在不修改 F3 Organizer 结构的前提下完成 UI 迁移，并避免 `plugin-ai-cube` 反向 import Host。

## 9. Risks

1. `ControlHost` 当前只渲染 `ControlWidget`，如果 control surface 仍被拆成多个松散组件，build 阶段容易退回 Host 组装，导致边界回退。
2. PRD preview gating 若标识不够明确，用户会误以为 AI 已真正可聊天。
3. 若 build 阶段试图顺带迁移 `SettingsContext` 或 Organizer grid 架构，会和 F3 范围缠绕，导致 phase 膨胀。
4. 拖拽与单击判定在旧 Host `AiCube.tsx` 中已有细节 bug 风险；迁移时必须保留真机验证作为硬门槛。

## 10. Open Questions for Review

1. `ControlWindow` 最终是直接渲染 `ControlHost`，还是只 lookup `ai-cube` 单插件 widget，更适合当前单-widget control window。
2. preview mode 中是否保留输入框但禁用发送，还是完全改成静态 transcript + action cards。
3. F2 build 是否允许删除旧 Host `AiCube.tsx` / `SettingsPanel.tsx` 文件，还是先保留薄 wrapper 过渡一轮。
