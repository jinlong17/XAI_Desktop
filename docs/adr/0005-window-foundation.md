# ADR-0005: macOS 窗口地基与 Grid 原生化策略

| 字段 | 值 |
|------|---|
| 状态 | Accepted — Conditional Go |
| 日期 | 2026-05-19 |
| 决策者 | Product Owner + Codex |

## 背景

XAI_Desktop 的核心体验不是普通窗口应用,而是 macOS 桌面上的长期工作空间:

1. 桌面 overlay 需要透明、无边框、低干扰。
2. Grid 窗口需要支持 Finder 文件拖入并拿到真实 path。
3. 多 Grid、多屏、Spaces、全屏应用切换不能互相串状态。
4. MAS 路线要求提前验证 `macOSPrivateApi=false` 与 sandbox entitlements。

现有仓库已经有 `commands/window.rs`、`platform/macos/window_ext.rs`、`GridWindow.tsx` 和 `plugin-organizer`,但 PRD 已把 R-00 识别为最高风险:窗口模型不成立会直接改变产品形态。

## 方案

### 方案 A: 继续用透明 Webview 承载所有 Grid 行为

优点:
- UI 实现简单,React 组件复用最高。
- 不需要额外 native view。

缺点:
- 透明区域点击穿透、Finder path drop、Spaces 行为都依赖 Tauri/Webview 能力边界。
- MAS sandbox 风险不清晰。
- 多 Grid event scope 容易被路由和全局 listener 污染。

### 方案 B: Grid 使用 Tauri window shell + 原生 DnD/window ops + React content

优点:
- React 仍负责 Grid 内容和交互。
- Rust/macOS 侧负责窗口生命周期、真实文件路径、窗口层级和能力边界。
- Host shell 与 plugin content 可分离,符合微内核方向。

缺点:
- 需要在 Phase 0 把 window command、event scope、persistence、capability allowlist 一次设计清楚。
- 需要真机验证,不能只靠单测。

### 方案 C: 放弃桌面 overlay,改为普通控制台应用

优点:
- 工程风险最低。
- MAS 上架路径更常规。

缺点:
- 失去产品差异化,无法对齐 File Zones / Dropover / Apple Stacks 的桌面空间目标。

## 决策

选择方案 B,并把方案 C 作为 G0 失败 fallback。

G0 不做完整 UI,只做最小真机 spike。G0 通过后进入 G1,把 spike 结果产品化到 `commands/window.rs`、`platform/macos/window_ext.rs`、`GridWindow.tsx` 和 `plugin-organizer`。

## 窗口分类

| Window | Label 规则 | 责任 | 原生能力 | React 责任 |
|---|---|---|---|---|
| main | `main` | app bootstrap / invisible coordinator | app lifecycle | route shell |
| control | `control` | 全局控制台入口 | normal window, shortcuts | plugin slots |
| grid | `grid_{gridId}` | 桌面区域 | position/size/layer/DnD/path | Grid content |
| console | `console` | 深度管理窗口 | normal window | Console shell |
| widget | `widget_{id}` | 小组件 | position/always-on-top | widget content |
| pet | `pet` | 桌宠 | transparent/non-activating if allowed | animation/content |

## 硬约束

- `gridId` 是 Grid window 的唯一 scope。任何 Grid event 必须带 `gridId`。
- Plugin 不直接 import Tauri API,只能通过 `@repo/core` hook 或 host-injected capability。
- `macOSPrivateApi=true` 只能作为 DMG 专用能力候选,不能作为 MAS 默认方案。
- Finder drop 以真实 path 为一等验收项。拿不到真实 path 时,G0 必须明确 fallback 产品形态。
- 空白透明区域点击穿透必须真机验证,不能只看 DOM 行为。

## G0.4 Finder DnD 结论

2026-05-19 真机截图证据确认 Grid window 的 Tauri path-first DnD 路径成立:

- 普通文件通过 `tauri://drag-drop` 返回绝对 path。
- 文件夹可以拖入 Grid,并在 Organizer item 中保留绝对 path。
- App bundle 返回 `.app` bundle root path,例如 `/Applications/QQ.app`。
- Alias 返回 alias 文件自身 path,例如 `/Applications/QuickTime Player.app alias`,kind 归类为 `file`;不会自动解析为目标 app path。

G1 policy:

- 默认保留 Finder/Tauri 返回的原始 alias path。
- 不在 DnD ingress 阶段静默解析 alias target。
- 如后续产品需要 resolved target,必须作为显式解析/预览能力设计,并保留原始 alias path 用于审计与用户解释。

## G0.3 Click-Through / Private API 结论

2026-05-19 真机与构建证据确认:

- `macOSPrivateApi=true` 默认运行时下,透明空白区域点击可落到桌面/Finder。
- Grid item 区域可收到 React/dnd-kit pointer 反馈。
- Resize handle 可拖动,说明 Grid window 交互区域 hit-test 正常。
- 临时关闭 private API 路径后运行 `pnpm --filter desktop tauri dev`,构建失败:
  - `apps/desktop/src-tauri/tauri.conf.json` 改为 `"macOSPrivateApi": false`。
  - `apps/desktop/src-tauri/Cargo.toml` 临时移除 Rust `macos-private-api` feature。
  - `src/commands/window.rs:36`: `WebviewWindowBuilder` 无 `.transparent(true)` 方法。
  - `src/lib.rs:94`: `WebviewWindowBuilder` 无 `.transparent(true)` 方法。

结论:

- 当前透明桌面 Grid/control window 路径是 DMG/private-API 路线。
- MAS/non-private 路线不能复用无条件 `.transparent(true)` 实现。
- G0.6 已加入 compile-only `mas-sandbox` fallback:该 feature 下 Grid/control Rust builders 不调用 `.transparent(true)`,并在临时关闭 `macOSPrivateApi` 与 Tauri dependency `macos-private-api` 后通过 `cargo check --no-default-features --features mas-sandbox`。
- 若继续 MAS,必须在此 compile fallback 基础上做 sandbox/signing/runtime 验证,确认非透明或降级 UX 是否可接受。

## G0.5 Spaces / Multi-Display 结论

2026-05-19 用户人工验证确认:

- 在当前 LG Ultra HD + DELL P2720DC 双屏环境下,Grid window 可以跟随 Spaces/多屏移动。
- 未报告随机消失、错层、无法恢复或明显 rect 偏移。
- `CanJoinAllSpaces` / `Stationary` / `IgnoresCycle` 的当前实现可作为 G1 DMG/private path 的基础。

可选项:

- ship 前仍可独立重放截图矩阵,但该项不再阻塞 G1 native foundation。

## G0 Go/No-Go

| 条件 | Go | No-Go |
|---|---|---|
| Click-through | 透明空白区点击落到桌面/Finder | 只能落到 Webview 或行为不稳定 |
| DnD path | Finder 文件拖入 Grid 可得到真实 path | 只能得到文件名/虚拟对象/无事件 |
| Spaces | 多 Space/全屏切换不丢窗口或可恢复 | 窗口错层、丢失、无法恢复 |
| Multi-grid | 两个 Grid 同时存在且事件不串 | 任意 event 无法稳定 scope |
| MAS path | compile fallback 存在且 release gate 可延后验证 | compile fallback 存在但 runtime/sandbox UX 不可接受 |

G0 Verdict: **Conditional Go**。

- DMG/private path:可以进入 G1 native foundation。
- MAS path:保留为外部 release gate,需要 Apple Developer/signing 或等效 sandbox 环境后再验证。

## 后果

正面:
- 产品核心体验先验真,后续功能不在坏地基上堆叠。
- Web/Console/Overlay 三面可继续共享 plugin content。
- MAS/DMG 双轨不再靠后期猜测。

负面:
- Phase 0 需要真机手工矩阵,不能完全自动化。
- 若 G0 失败,PRD 必须改形态:从桌面 overlay 主产品改为 Console-first + 可选 desktop zones。

## 相关

- `docs/planning/execution/G0-window-spike.md`
- `docs/planning/execution/G1-native-foundation.md`
- `docs/planning/2026-05-12-PRD-v1.md` §1.4 / §7.5 / §10.6
- `apps/desktop/src-tauri/src/commands/window.rs`
- `apps/desktop/src-tauri/src/platform/macos/window_ext.rs`
- `packages/plugin-organizer/src/OrganizerLayer.tsx`
