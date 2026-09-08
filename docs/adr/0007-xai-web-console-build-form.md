# ADR-0007: XAI Web Console — Build-form & port mapping (Vite + TS migration)

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-23 |
| 决策者 | Jinlong (project owner) + Claude (`feature-plan` → `feature-review`) |
| Supersedes | none |
| Superseded by | none |

---

## 背景

### 问题陈述

`web design/DESIGN.md` v1.0 是 XAI Console 的原型设计规格（约 24KB 正文、14 个模块），覆盖任务、项目板、习惯、专注、日历、四象限、统计、AI 对话、桌宠与冥想等模块，设计上高度完整（§12 验收清单 28 项全部 `[x]`）。然而，该原型为 **Babel-in-browser 平文件形式**，不可构建、无 TypeScript、无测试，仅在浏览器内通过 CDN 拉取 React + Babel Standalone 实时转译运行。

`web design/index.html` 第 16–18 行加载了三条 CDN 脚本：

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" ...></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" ...></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" ...></script>
```

与此同时，`apps/web/package.json`（v0.1.0）已经是一个生产级 Vite 7 + React 19 + TS 5.9 SPA，已依赖：

- `react@^19.2.0` + `react-dom@^19.2.0`
- `vite@^7.0.4` + `@vitejs/plugin-react@^4.6.0`
- `@repo/plugin-console` + `@repo/plugin-productivity`
- `@repo/web-auth-device-session`
- `@sentry/react`（含多条 `sourcemaps:*` 脚本）

`web-ticktick-parity` 路线图已 SHIPPED 10 条平台底座行（`web-architecture-adr-lite`、`web-plugin-map-contract-reconcile`、`web-sync-crypto-contract-preflight`、`web-release-site-archive-vite-shell`、`web-auth-device-session`、`web-browser-e2e-crypto-runtime`、`web-encrypted-indexeddb-cache`、`web-console-host-router`、`web-security-csp-sentry`、`web-todo-first-slice`）。

用户 2026-05-23 明确指示：**将原型的设计保真度迁移进生产级 Vite+TS shell（`apps/web/`）+ 新建 `packages/plugin-web-*` 包，并复用已 SHIPPED 的平台底座**。

**本 ADR 回答的核心问题**：Babel-in-browser 原型如何迁移进生产级 Vite+TS `apps/web/` shell + 新包，以及如何与 SHIPPED `web-ticktick-parity` 平台底座互操作？

### 相关上下文

- `docs/workflow/roadmap/xai-web-console.md` 路线图：R2（Authority override，`web design/DESIGN.md` 取代所有冲突的旧 PRD）、R3（`web-ticktick-parity` 底座复用）、R6（按用户 2026-05-23 回答，以 `packages/plugin-web-<module>/` 新包为基线方案）。
- `docs/PLUGIN_MAP.md` 存在潜在过期风险（per `web-ticktick-parity` rationale R3）；本 ADR 引用时附带此警告，下游行须在 consume 时自行核验各插件的实际状态。
- 本 ADR 精炼（refines）`docs/adr/0003-three-faces-architecture.md`（三面架构）与 `docs/adr/0006-web-face-hybrid-reuse-boundary.md`（Web 面混合复用边界），不推翻任一。ADR-0003 的平台无关插件纪律、ADR-0006 的"Web 可独立实现 Vite SPA host shell 与浏览器视图层但不得自行发明新数据契约"规则，在本 ADR 中均得到延续与具化。

---

## 方案

### 方案 A — 保留 Babel-standalone 平文件于 `apps/web/public/`

直接将原型文件放入 `apps/web/public/` 提供服务，不做构建迁移。

**优点**
- 零迁移成本。
- 原型视觉效果原样保留。

**缺点**
- 无类型安全；整个代码库依赖 `window.I18N`、`window.BOARDS`、JSX-via-Babel-standalone 全局变量。
- Sentry source-map 上传（`apps/web/package.json` 已有 8 条 `sourcemaps:*` 脚本）无法索引未编译文件。
- 无法满足 `web-security-csp-sentry`（已 SHIPPED）使用的 CSP nonce 路径。
- 阻断 `@repo/web-auth-device-session` 设备 ID 注入（已 SHIPPED 的认证模块使用 ES module import，原型无法访问）。
- 原型运行在 React 18；`apps/web` 依赖 React 19，两者严格模式行为存在已知差异。

**结论：否决。** 与用户明确要求复用的 SHIPPED 平台底座冲突。

### 方案 B — 仅迁移至 `apps/web/src/modules/<name>/` 文件夹（不新建包）

将每个 `.jsx` 迁移为 `apps/web/src/modules/<name>/<Component>.tsx`，所有业务模块保留在 host shell 内部。

**优点**
- 只需维护一个包。
- 无 workspace 依赖图增量。

**缺点**
- 违反 CLAUDE.md `Code Boundaries` 规则："Business logic → `packages/plugin-*`, never in `apps/desktop/src/`"。`apps/web/src/` 是 host shell，与 `apps/desktop/src/` 对称——同样的规则适用。
- 阻断未来 overlay/console 复用：若任一模块日后需被桌面 overlay 加载（per ADR-0003），必须重新提取为包。
- 统计聚合行（statistics）的数据形态契约难以显式声明——数据消费者与提供者同在 host shell 内，ADR-0003 的平台无关性纪律无法被校验工具自动执行。

**结论：否决。** 有架构债，无技术收益。

### 方案 C — Vite+TS 迁移至 `apps/web/src/` shell + 新建 `packages/plugin-web-<module>/` 包（**已选**）

每个业务模块作为独立 workspace 包发布，host shell 位于 `apps/web/src/`，负责注册所有模块。设计 token、i18n、图标各自对应小型专用包。

**优点**
- 符合 CLAUDE.md / ADR-0003 / ADR-0006 既有的插件纪律。
- W2 中 14 个模块行（`xai-web-*`）每行一个干净的单包单次运行单元，支持波次并行。
- 统计行可显式声明类型化的事件/仓库依赖。
- 保留 ADR-0003 三面复用（overlay / console / web）的结构性可能。
- Tree-shake 友好：host shell 只注册其加载的模块。

**缺点**
- 需新建 20 个包（每包：`package.json` + `manifest.json` + `tsconfig.json` + docs 四件套），有可量化的样板工作量。
- Workspace 解析图增大；pnpm + Turborepo 可处理，但 CI 缓存失效模式会变化。
- `@repo/plugin-productivity` / `@repo/plugin-console`（已是 `apps/web/package.json` 依赖项）可能成为 dead dep。ADR 将此记录为未来清理项，非 v1 阻塞。

**结论：已选。** 与既有架构对齐，为路线图假设的可并行波次发布结构提供基础。

### 方案 D — 扩展现有 `@repo/plugin-productivity` 与 `@repo/plugin-console`

将任务 / 番茄 / 习惯 / 日历 / 看板推入现有插件，复用其已 SHIPPED 的接口。

**优点**
- 最少新建包。
- 复用生产中已有代码。
- 保持 `@repo/plugin-productivity` / `@repo/plugin-console` 为 `apps/web` 的活依赖。

**缺点**
- `web design/DESIGN.md` v1.0 的 UI 表面与 `@repo/plugin-productivity` / `@repo/plugin-console` 的原始 Console PRD 存在实质性偏离：
  - DESIGN.md §4.3 看板有 6 种视图（含 Timeline gantt 与 Map 占位），原 Console PRD 没有。
  - DESIGN.md §4.4 Dashboard 使用 380ms FLIP-drag macOS Stage Manager 动画，原 PRD 未指定。
  - DESIGN.md §4 有 4 种 rail 方向（Left/Right/Top/Bottom Dock）及独立视觉变体，原 plugin-console 没有。
- 在并行 W2 发布期间对 SHIPPED 插件做大规模改写，引入回归风险。
- 用户 2026-05-23 的 AskUserQuestion（路线图 R6）已记录"新建 `packages/plugin-web-<module>/`"为基线预期。

**结论：v1 否决。** 在 ADR §后果 中记录为两套插件家族稳定后的未来合并可能，非 v1 路径。

---

## 决策

**选择方案 C**。

理由：与项目既有插件纪律（CLAUDE.md + ADR-0003 + ADR-0006）完全对齐，允许 W2 的 14 个模块行真正并行发布，并为 ADR-0003 的三面复用保留结构性可能。方案 D 的回归风险在设计表面差异已被量化的情况下不可接受。

### 冻结假设（10 条）

以下假设通过本 ADR 锁定，成为每条下游 `xai-web-*` 行的硬性输入。更改任一假设需开新 ADR（或有记录的 ADR 修订），不允许静默编辑本文件。

1. **工具链** — `apps/web/` 已运行 Vite 7 + React 19 + TS 5.9 + `@vitejs/plugin-react`（per `apps/web/package.json`）。迁移目标即该工具链。Babel CDN 独立表单（`web design/index.html` 第 16–18 行）**不发布**。
2. **包布局** — 每个业务模块拥有独立的 `packages/plugin-web-<module>/` 包（`package.json` + `manifest.json` + `src/index.ts` + docs 四件套）。`apps/web/` host shell 通过 workspace 依赖消费它们。
3. **Host shell 位置** — `apps/web/src/` 是 Vite SPA shell：`main.tsx` + router + provider tree + 插件注册。零业务逻辑。与 `apps/desktop/src/` 对称。
4. **跨模块通信** — 使用 `packages/core/src/events/` 中的现有类型化事件层（`@repo/core/events`），新增 `web:<module>:<verb>-<noun>` 前缀通道族。禁止跨 `packages/plugin-web-*/` 边界的直接插件间导入。**不创建**单独的 `@repo/plugin-web-events` 包（已否决：仅增加重导出间接层，无架构收益；`@repo/core/events` 已提供类型化总线）。
5. **持久化契约** — `web design/DESIGN.md` §9.2 中的 24 个 localStorage 键是权威持久化注册表。所有权移交 `xai-web-persistence-contract`（行 #3）。本 ADR 枚举这些键以提供溯源性；行 #3 声明类型化注册表与 `usePref` hook。
6. **平台底座复用** — 以下 SHIPPED `web-ticktick-parity` 行按原样消费，**不得重新实现**：`web-architecture-adr-lite`、`web-plugin-map-contract-reconcile`、`web-sync-crypto-contract-preflight`、`web-release-site-archive-vite-shell`、`web-auth-device-session`、`web-browser-e2e-crypto-runtime`、`web-encrypted-indexeddb-cache`、`web-console-host-router`、`web-security-csp-sentry`、`web-todo-first-slice`。
7. **已取代的 parity 行** — 以下四条 PENDING `web-ticktick-parity` 行被等价的 `xai-web-*` 行取代：
   - `web-productivity-habits-pomodoro` → `xai-web-pomodoro` + `xai-web-habits`
   - `web-project-label-calendar` → `xai-web-board-core` + `xai-web-board-views` + `xai-web-board-workspaces` + `xai-web-calendar`
   - `web-search-keyboard-theme` → `xai-web-shell`（搜索键盘）+ `xai-web-settings-appearance`（主题）
   - `web-statistics-views` → `xai-web-statistics`
   
   本 ADR 推荐对 `web-ticktick-parity` 路线图的上述四行进行手动编辑，将其改为 `BLOCKED_EXTERNAL`，注释为 `Note: superseded by xai-web-console`。**本 ADR feature 本身不编辑另一路线图**（路线图驱动者约束）。
8. **PLUGIN_MAP.md 过期警告** — 根据 `web-ticktick-parity` rationale R3，`docs/PLUGIN_MAP.md` 可能存在过期。本 ADR 引用时附带此警告；下游行须在 consume 时核验各插件的实际状态。本 ADR 不编辑 PLUGIN_MAP.md。
9. **无新顶层包命名空间** — 所有新包均位于 `packages/plugin-web-<module>/`。不引入新的 `@repo/core-*`、`@repo/ui-*` 或 `@repo/web-*` 包（现有 `@repo/web-auth-device-session` workspace 包作为 host shell 依赖被复用）。
10. **ADR 接受状态** — 本 ADR 最终以 **Accepted** 状态结束（非 Draft、非 Proposed）。来自 seed brief 的硬约束。

### 平台底座消费规则（ADR-0003 / ADR-0006 兼容性）

本 ADR 精炼（而非推翻）ADR-0003 与 ADR-0006：

- **ADR-0003** 规定：Plugin 代码 100% 平台无关，禁止直接 import Tauri API。本 ADR 确认 `packages/plugin-web-*` 为纯浏览器包，零 Tauri 依赖。
- **ADR-0006** 规定：Web 可以独立实现 Vite SPA host shell 与浏览器视图层；Web feature 不得自行发明新的数据契约。本 ADR 通过以下方式遵守：UI 偏好 → localStorage（冻结假设 §5）；持久数据实体（任务、卡片、习惯打卡等）→ 已 SHIPPED 的加密 IndexedDB + sync blob（冻结假设 §6）。

### 已取代的 PENDING parity 行（手动操作推荐）

以下四行建议由人工将 `web-ticktick-parity` 路线图对应行手动编辑为 `BLOCKED_EXTERNAL`：

| `web-ticktick-parity` 行 | 取代者（`xai-web-console` 行） |
|---|---|
| `web-productivity-habits-pomodoro` | `xai-web-pomodoro` + `xai-web-habits` |
| `web-project-label-calendar` | `xai-web-board-core` + `xai-web-board-views` + `xai-web-board-workspaces` + `xai-web-calendar` |
| `web-search-keyboard-theme` | `xai-web-shell` + `xai-web-settings-appearance` |
| `web-statistics-views` | `xai-web-statistics` |

建议注释文本：`Note: superseded by xai-web-console`

---

## 后果

### 正面

- **类型安全**：每个模块以 TypeScript 编写，消除 `window.I18N` / `window.BOARDS` 等全局变量，组件与状态均有类型。
- **Sentry source map**：Vite 构建产物可被 `@sentry/react` source-map 上传脚本正确索引，错误堆栈可追溯至源码。
- **CSP-clean 发布**：符合 `web-security-csp-sentry`（已 SHIPPED）的 CSP nonce 路径，不再依赖 `eval`-based Babel-standalone。
- **Tree-shake**：host shell 只加载已注册模块，未用模块自动从 bundle 中移除。
- **平台底座复用**：复用 10 条 SHIPPED `web-ticktick-parity` 行，无需重写加密存储、设备会话、Sync 语义。
- **可并行发布的模块行**：20 个新包的边界即 W2 并行发布窗口的边界，14 行可真正并行。
- **Three-Faces 架构保留**：`packages/plugin-web-*` 包符合 ADR-0003 的平台无关插件约束，为未来 overlay/console 复用保留结构性可能。
- **局部优先承诺**：localStorage（UI 偏好）+ 加密 IndexedDB（数据实体）均为本地优先存储，DESIGN.md §2"本地优先"承诺在技术上得到保留。

### 负面

- **20 个新包**：每包需 `package.json` + `manifest.json` + `tsconfig.json` + docs 四件套，存在可量化的样板工作量。
- **JSX → TSX 迁移工作**：下游模块行必须自行完成 JSX→TSX 转换（遵循 §实施规则 中的 10 条规则）。
- **Dead dep 风险**：`@repo/plugin-productivity` / `@repo/plugin-console`（已是 `apps/web/package.json` 依赖项）在新包并行发布后可能成为 dead dep。已记录为未来清理项，非 v1 阻塞。
- **AI Chat adapter 待定**：`window.claude.complete` 在 Vite 运行时下的适配器策略推迟至 `xai-web-ai-chat` 行（行 #18）的 feature-plan 决定。本 ADR 将此记录为已知开放问题，非 ADR 接受阻塞项。
- **四条 parity 行需手动暂停**：本 ADR feature 不编辑 `web-ticktick-parity` 路线图，建议人工操作。

### 已推迟事项

以下开放问题本 ADR **不解决**：

- AI Chat 的 `window.claude.complete` 在 Vite 时代的适配器实现（→ 行 #18 feature-plan）。
- Pomodoro/Countdown 持久化键名（`xai_pomodoro_sessions` / `xai_countdowns`）最终确认（→ 对应行的 feature-plan 可重命名，不需要重开 ADR）。
- `@repo/plugin-productivity` / `@repo/plugin-console` 是否最终从 `apps/web/package.json` 移除（→ 未来 `web-ticktick-parity` 清理行）。

---

## 实施规则

### JSX → TSX 策略（10 条规则）

所有下游模块行必须统一遵循以下转换规则：

1. **重命名** `.jsx` → `.tsx`。组件按文件一个或一族（例如 `shell.jsx` → `AppRail.tsx` + `Topbar.tsx` + `AvatarMenu.tsx`）。
2. **移除** `<script src="https://unpkg.com/@babel/standalone…">`。Vite 通过 `@vitejs/plugin-react` 处理 JSX 转换（已在 `apps/web/package.json` devDependencies 中）。
3. **移除** CDN React 脚本（`<script src="https://unpkg.com/react@18.3.1…">`）。使用 workspace 的 `react@^19.2.0` + `react-dom@^19.2.0`。**注意**：原型基于 React 18 约定；React 19 的稳定新特性（`use`、`useFormStatus`、自动 `forwardRef`、更严格的 `act`）要求在迁移时注意（例如：删除手动 `forwardRef`，优先使用 `useEffect` cleanup 而非原型未用到的 class lifecycle 模式）。
4. **窗口全局 → 类型化导入**。所有 `window.I18N`、`window.BOARDS`、`window.<Component>` 引用替换为来自所属包的类型化导入。本 ADR 禁止任何新的 `window.*` 业务全局（唯一例外：AI Chat 行记录的 `window.claude.complete` 适配器，需包裹在类型化 shim 中）。
5. **移除 `type="text/babel"`**。`index.html` 中所有 `<script>` 标签移除（保留 Vite 入口 `<script type="module" src="/src/main.tsx">` 及 Google Fonts `<link>`）。
6. **`useState` / `useEffect` 类型化** — 每个状态字段需显式类型；禁止 `useState<any>`。Mock 数据（`window.BOARDS`）由 seed 模块以相同类型化形态导出。
7. **Props 类型化** — 每个组件拥有类型化 `Props` interface 或 type。本 ADR 不强制 `interface` vs `type`；由模块行本地选择。
8. **禁用 `defaultProps`** — React 19 在函数组件上废弃 `defaultProps`，改用解构默认值。
9. **CSS imports** — 每个模块通过 `@repo/plugin-web-tokens` 的传递依赖导入 `tokens.css` 与 `layout.css`。模块可通过 Vite 标准 CSS import 添加自己的 side-effect CSS，不使用 CSS Modules / `styled-components`（DESIGN.md §10.2 以 tokens 层为唯一样式真理来源）。
10. **禁止新的状态库** — `useState` + `useReducer` + `useContext` + 类型化事件总线是唯一的状态原语。本 ADR 禁止 `zustand` / `jotai` / `redux` / `@tanstack/store`（原型无此需求，可在后续 ADR 中重新评估）。

### 跨模块通信规则

> 模块**必须**通过 `@repo/core/events`（`packages/core/src/events/` 中的现有基础设施）中的类型化事件总线进行通信。跨 `packages/plugin-web-*/` 边界的直接插件间导入**禁止**。对共享持久状态的读取通过 `xai-web-persistence-contract` 注册表（行 #3）进行，不在该模块外直接调用 `localStorage.getItem`。

事件命名规范（由本 ADR 冻结）：

- `web:<module>:<verb>-<noun>` 用于模块发出的事件。
  示例：`web:tasks:card-completed`、`web:pomodoro:session-finished`、`web:habits:checkin-recorded`、`web:shell:module-change`、`web:settings:preference-changed`。
- Statistics 行订阅其所需事件（只读消费者）。
- AI Chat 行如需响应用户活动，订阅模块事件，不直接导入模块代码。

本 ADR 明确**拒绝**引入 `@repo/plugin-web-events` 包：`@repo/core/events` 已提供类型化总线；新包仅增加重导出间接层。

跨行契约：`xai-web-event-bus` 行（#4）是 `web:*` 事件前缀族声明的权威来源（EventMap 条目）。它**不引入新的**总线基础设施，仅向 `packages/core/src/types/events.ts` 添加类型化事件条目，与现有 `project:card-*` / `labels:*` 模式对称（W0.B 已 SHIPPED）。

### localStorage 键注册表移交

本 ADR 枚举来自 DESIGN.md §9.2 的 24 个键（详见 §S8 附录），并将所有权移交 `xai-web-persistence-contract`（行 #3）。该行将：

- 在 `WebPrefRegistry` 中将每个键声明为类型化条目。
- 实现 `usePref(key)` 返回类型化 `[value, setter]`。
- 在任何模块 schema 在首次发布后发生变化时执行 schema 版本迁移（当前无计划中的迁移）。

**本 ADR 不实现该注册表**。它仅锁定契约：注册表存在、是 24 个键的唯一类型化访问点，且被每个涉及持久状态的模块导入。

### DESIGN.md §9 与平台底座的协调规则

DESIGN.md §2 中的"本地优先"承诺（"用 localStorage 持久化所有偏好，零网络依赖"）需要与 `web-ticktick-parity` 平台底座的同步要求进行协调。本 ADR 的协调方案如下：

- **UI 偏好**（24 个键，见 §S8）→ **localStorage**（符合 DESIGN.md §9）。
- **模块数据实体**（任务卡片、看板数据、习惯打卡、番茄记录、倒计时、AI 对话）→ **加密 IndexedDB + sync blob 协议**（符合 `web-ticktick-parity` 底座）。

DESIGN.md 的"本地优先"承诺在技术上得到保留：底座是本地优先的（数据首先写入本地 IndexedDB，网络同步为可选增强）。DESIGN.md §9 中的"零网络依赖"适用于 UI 偏好层，不适用于数据实体层（数据实体层的网络同步已由 `web-ticktick-parity` 底座决定并 SHIPPED）。

下游行**必须遵守**此协调规则；任何试图将任务卡片、看板数据等持久化到 localStorage 的实现均违反本 ADR。

---

## 文件级端口映射表

以下为原型文件与目标路径的完整映射。每条下游行的 feature-plan 均应以此表作为权威合同。

| 原型文件（`web design/`） | 类型 | 目标路径 | 所属行 | 备注 |
|---|---|---|---|---|
| `index.html` | HTML 入口 | `apps/web/index.html`（现有）扩展 | xai-web-shell | 现有 Vite 入口保留；移除独立 Babel 脚本；Manrope + Noto Sans SC + JetBrains Mono 的 Google Fonts `<link>` 保留或移至 CSS `@import`。 |
| `tokens.css` | CSS 变量 | `packages/plugin-web-tokens/src/tokens.css` + `index.ts` 重导出 | xai-web-tokens-and-i18n | 以 side-effect CSS import + 类型化 token 名 TS 模块发布（用于 IDE 自动补全）。 |
| `layout.css` | CSS 布局 | `packages/plugin-web-tokens/src/layout.css`（与 tokens 同包） | xai-web-tokens-and-i18n | 与 tokens 同包 — 均为纯 CSS 基础设施，无 JS 接口；同包避免引入第二个极小包。 |
| `i18n.js` | 窗口全局 `window.I18N` + `useI18n` | `packages/plugin-web-tokens/src/i18n.ts` + `useI18n` hook | xai-web-tokens-and-i18n | 消除窗口全局。`I18N` 导出为类型化 `Record<Lang, Record<Module, Record<Key, string>>>`。`useI18n(lang)` 返回 `{ s(key) }`（per DESIGN.md §8）。 |
| `board-data.js` | 窗口全局 `window.BOARDS` MOCK | `packages/plugin-web-board-core/src/seed/board-data.ts` | xai-web-board-core | 成为类型化 seed 模块，仅由 board-core 的首次运行种子化 helper 导入。不再是窗口全局。 |
| `icons.jsx` | SVG 图标组件 | `packages/plugin-web-icons/src/index.tsx` | xai-web-shell（消费者） | 新小型包——每个模块均使用的纯 SVG 组件。无业务逻辑。 |
| `shell.jsx`（`<AppRail>` `<Topbar>` `<AvatarMenu>`） | Shell 组件 | `packages/plugin-web-shell/src/{AppRail,Topbar,AvatarMenu}.tsx` + `index.ts` | xai-web-shell | 模块切换状态位于 host shell `apps/web/src/App.tsx`；AppRail 发出 `web:shell:module-change`。 |
| `app.jsx`（`<App>`） | 根组合 | `apps/web/src/App.tsx`（host shell） | xai-web-shell | 仅 host shell。连接 provider（theme / lang / persistence）+ router + 插件注册。内部无模块业务逻辑。 |
| `module-tasks.jsx` | 任务 UI + 状态 | `packages/plugin-web-tasks/src/` | xai-web-tasks | 4 桶时间视图 + 跨列 DnD 日期重写（per DESIGN.md §4.2）。 |
| `module-board.jsx` | 看板 + 6 视图 + workspaces | 预拆分：`packages/plugin-web-board-core/`、`packages/plugin-web-board-views/`、`packages/plugin-web-board-workspaces/` | xai-web-board-core / xai-web-board-views / xai-web-board-workspaces | Per 路线图 R6 粒度决策（2026-05-23 用户）。board-core 提供 Kanban 视图 + schema + 10 色列；views 添加 Table/Calendar/Dashboard/Timeline/Map；workspaces 添加 Switcher/Creator/PM 模板/多面板。 |
| `module-dashboard.jsx` | 12 列 widget 网格 + 8 widgets | 预拆分：`packages/plugin-web-dashboard-grid/`、`packages/plugin-web-dashboard-widgets/` | xai-web-dashboard-grid / xai-web-dashboard-widgets | Grid 提供 FLIP-drag 12 列容器 + widget slot 注册；widgets 提供 Clock/MiniCal/WorldClocks/Weather/Stickies/Mail/Upcoming/3-stats。 |
| `module-calendar.jsx` | 月视图 | `packages/plugin-web-calendar/src/` | xai-web-calendar | 月份 + 4 色事件条 + 从 MiniCal widget 深链接（per DESIGN.md §4.5）。 |
| `module-matrix.jsx` | 四象限 2×2 | `packages/plugin-web-matrix/src/` | xai-web-matrix | DESIGN.md §4.6。 |
| `module-pomodoro.jsx` | 圆形计时器 + 历史 | `packages/plugin-web-pomodoro/src/` | xai-web-pomodoro | DESIGN.md §4.7。持久化键 `xai_pomodoro_sessions`（路线图 R6 建议——所属行的 feature-plan 可重命名）。 |
| `module-habits.jsx` | 每周打卡 + 日记 | `packages/plugin-web-habits/src/` | xai-web-habits | DESIGN.md §4.8。 |
| `module-meditation.jsx` | 5 场景 + 4 时钟 + 播放器 | `packages/plugin-web-meditation/src/` | xai-web-meditation | DESIGN.md §4.9。 |
| `module-countdown.jsx` | 倒计时卡片网格 | `packages/plugin-web-countdown/src/` | xai-web-countdown | DESIGN.md §4.10。持久化键 `xai_countdowns`（路线图 R6 建议）。 |
| `module-statistics.jsx` | 7 种可视化 | `packages/plugin-web-statistics/src/` | xai-web-statistics | DESIGN.md §4.11。聚合行——通过类型化事件 + 仓库读取从 tasks/pomodoro/habits 读取数据。 |
| `module-ai.jsx` | AI Chat + aurora + orb | `packages/plugin-web-ai-chat/src/` | xai-web-ai-chat | DESIGN.md §4.1。`window.claude.complete` 适配器在 Vite 下的策略推迟至该行的 feature-plan（路线图 R6）。 |
| `module-settings.jsx` | 13 面板设置 | 预拆分：`packages/plugin-web-settings-shell/`、`packages/plugin-web-settings-appearance/`、`packages/plugin-web-settings-features-panel/`、`packages/plugin-web-settings-rest/` | xai-web-settings-shell / -appearance / -features-panel / -rest | DESIGN.md §4.12。settings-shell 提供 13 面板骨架 + 原子组件；appearance/features-panel/rest 分别提供各自面板内容。 |
| `pet.jsx` | 8 桌宠 + Picker + 拖拽 | `packages/plugin-web-pet/src/` | xai-web-pet | DESIGN.md §4.13。 |

**新包总计：20 个**
（`plugin-web-tokens`、`plugin-web-icons`、`plugin-web-shell`、`plugin-web-tasks`、`plugin-web-board-core`、`plugin-web-board-views`、`plugin-web-board-workspaces`、`plugin-web-dashboard-grid`、`plugin-web-dashboard-widgets`、`plugin-web-calendar`、`plugin-web-matrix`、`plugin-web-pomodoro`、`plugin-web-habits`、`plugin-web-meditation`、`plugin-web-countdown`、`plugin-web-statistics`、`plugin-web-ai-chat`、`plugin-web-pet`、`plugin-web-settings-shell`，加 3 个 settings 子面板 `-appearance`、`-features-panel`、`-rest`，后三个在路线图中作为 settings-* 家族管理）

另加 `apps/web/src/` 中的 host shell 扩展。

---

## 持久化键附录

以下为 `web design/DESIGN.md` §9.2 的 24 个 localStorage 键，逐字枚举，供溯源参考。所有权移交 `xai-web-persistence-contract`（行 #3）。

### Shell / 外观

| 键 | 内容 | 所属行 |
|---|---|---|
| `xai_accent_hue` | 主题色 hue 值 | xai-web-settings-appearance |
| `xai_rail_pos` | 侧栏方向（Left / Right / Top / Bottom Dock） | xai-web-settings-appearance |
| `xai_bg_tone` | 背景调子（Sage / Cream / Mist / Lavender / Peach / Graphite） | xai-web-settings-appearance |
| `xai_rail_order` | Rail 图标顺序（拖拽序） | xai-web-shell |

### 桌宠

| 键 | 内容 | 所属行 |
|---|---|---|
| `xai_pet_pos` | 桌宠位置（x, y） | xai-web-pet |
| `xai_pet_id` | 桌宠角色 ID（1–8） | xai-web-pet |

### 模块数据

| 键 | 内容 | 所属行 |
|---|---|---|
| `xai_task_cols` | 任务列折叠/展开状态 | xai-web-tasks |
| `xai_boards_v2` | 看板数据（工作区 / 看板 / 卡片） | xai-web-board-core |
| `xai_active_board` | 当前看板 ID | xai-web-board-core |
| `xai_board_panels` | 底部多面板状态 | xai-web-board-core |
| `xai_board_inbox` | 收件箱卡片数组 | xai-web-board-core |
| `xai_dash_order` | Dashboard widget 顺序 | xai-web-dashboard-grid |
| `xai_clock_style` | 时钟样式（Analog / Digital / Minimal） | xai-web-dashboard-widgets |
| `xai_clock_tz` | 主时区 | xai-web-dashboard-widgets |
| `xai_zones` | 世界时区列表 | xai-web-dashboard-widgets |
| `xai_ai_convos` | AI 对话历史 | xai-web-ai-chat |
| `xai_ai_insights` | AI Insights 显示开关 | xai-web-ai-chat |
| `xai_ai_voice` | AI 语音功能开关 | xai-web-ai-chat |
| `xai_pomodoro_sessions` | 番茄历史记录 **(proposed — 所属行 feature-plan 可重命名)** | xai-web-pomodoro |
| `xai_countdowns` | 倒计时卡片数组 **(proposed — 所属行 feature-plan 可重命名)** | xai-web-countdown |

### Settings 偏好（`usePref` hook）

| 键 | 内容 | 所属行 |
|---|---|---|
| `xai_pref_*` | 所有 Settings 偏好（`usePref` hook 自动写，可变数量键，`xai_pref_` 前缀） | xai-web-persistence-contract（注册表行） |

**合计**：4 Shell/外观 + 2 桌宠 + 13 模块数据 + 1 设置偏好前缀族 + 2 proposed = **22 个显式键 + 1 个前缀族（= 24 个逻辑条目**，与 seed brief 的计数一致）。

---

## 溯源关系：xai-web-console 路线图

以下表格将 `xai-web-console` 路线图中的每条下游行（#2..#24）链接至本 ADR 中约束该行的章节。

| 行 # | Slug | 主要约束章节 | 键约束 |
|---|---|---|---|
| #2 | xai-web-tokens-and-i18n | [§文件级端口映射表](#文件级端口映射表)（`tokens.css`、`layout.css`、`i18n.js` 行）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则) 规则 9 | `@repo/plugin-web-tokens` 包名冻结 |
| #3 | xai-web-persistence-contract | [§持久化键附录](#持久化键附录)（24 键权威列表）；[§localStorage 键注册表移交](#localstorage-键注册表移交)；[§DESIGN.md §9 协调规则](#designmd-9-与平台底座的协调规则) | `WebPrefRegistry` + `usePref(key)` 为唯一访问点 |
| #4 | xai-web-event-bus | [§跨模块通信规则](#跨模块通信规则)（`web:<module>:<verb>-<noun>` 命名规范）；冻结假设 §4 | 向 `packages/core/src/types/events.ts` 添加 EventMap 条目，不创建新总线基础设施 |
| #5 | xai-web-shell | [§文件级端口映射表](#文件级端口映射表)（`shell.jsx`、`app.jsx`、`icons.jsx`、`index.html` 行）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则) 规则 1–5 | host shell 零业务逻辑；`@repo/web-auth-device-session` 导入保持不变 |
| #6 | xai-web-tasks | [§文件级端口映射表](#文件级端口映射表)（`module-tasks.jsx` 行）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则)；[§DESIGN.md §9 协调规则](#designmd-9-与平台底座的协调规则) | `xai_task_cols` 键（UI 偏好 → localStorage） |
| #7 | xai-web-board-core | [§文件级端口映射表](#文件级端口映射表)（`module-board.jsx` 预拆分、`board-data.js` 行）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则) | `xai_boards_v2`、`xai_active_board`、`xai_board_panels`、`xai_board_inbox` 键 |
| #8 | xai-web-board-views | [§文件级端口映射表](#文件级端口映射表)（board views 预拆分）；[§跨模块通信规则](#跨模块通信规则) | 依赖 board-core API（ready_to_ship 边） |
| #9 | xai-web-board-workspaces | [§文件级端口映射表](#文件级端口映射表)（board workspaces 预拆分）；[§跨模块通信规则](#跨模块通信规则) | 依赖 board-core API（ready_to_ship 边） |
| #10 | xai-web-dashboard-grid | [§文件级端口映射表](#文件级端口映射表)（`module-dashboard.jsx` grid 预拆分）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则) | `xai_dash_order` 键 |
| #11 | xai-web-dashboard-widgets | [§文件级端口映射表](#文件级端口映射表)（dashboard widgets 预拆分）；[§持久化键附录](#持久化键附录) | `xai_clock_style`、`xai_clock_tz`、`xai_zones` 键；依赖 dashboard-grid API（ready_to_ship 边） |
| #12 | xai-web-calendar | [§文件级端口映射表](#文件级端口映射表)（`module-calendar.jsx` 行）；[§跨模块通信规则](#跨模块通信规则) | 从 MiniCal widget 接收 `web:shell:module-change` 深链接事件 |
| #13 | xai-web-matrix | [§文件级端口映射表](#文件级端口映射表)（`module-matrix.jsx` 行）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则) | 无专属持久化键 |
| #14 | xai-web-pomodoro | [§文件级端口映射表](#文件级端口映射表)（`module-pomodoro.jsx` 行）；[§持久化键附录](#持久化键附录) | `xai_pomodoro_sessions`（proposed）；发出 `web:pomodoro:session-finished` |
| #15 | xai-web-habits | [§文件级端口映射表](#文件级端口映射表)（`module-habits.jsx` 行）；[§跨模块通信规则](#跨模块通信规则) | 发出 `web:habits:checkin-recorded` |
| #16 | xai-web-meditation | [§文件级端口映射表](#文件级端口映射表)（`module-meditation.jsx` 行）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则) | 无专属持久化键 |
| #17 | xai-web-countdown | [§文件级端口映射表](#文件级端口映射表)（`module-countdown.jsx` 行）；[§持久化键附录](#持久化键附录) | `xai_countdowns`（proposed） |
| #18 | xai-web-ai-chat | [§文件级端口映射表](#文件级端口映射表)（`module-ai.jsx` 行）；[§后果 — 已推迟事项](#已推迟事项) | `xai_ai_convos`、`xai_ai_insights`、`xai_ai_voice` 键；`window.claude.complete` adapter 策略推迟至本行 feature-plan |
| #19 | xai-web-pet | [§文件级端口映射表](#文件级端口映射表)（`pet.jsx` 行）；[§持久化键附录](#持久化键附录) | `xai_pet_pos`、`xai_pet_id` 键 |
| #20 | xai-web-statistics | [§文件级端口映射表](#文件级端口映射表)（`module-statistics.jsx` 行）；[§跨模块通信规则](#跨模块通信规则) | 只读消费者；通过类型化事件 + 仓库读取聚合 tasks/pomodoro/habits 数据；ready_to_ship 边依赖 #6/#14/#15 |
| #21 | xai-web-settings-shell | [§文件级端口映射表](#文件级端口映射表)（`module-settings.jsx` settings-shell 预拆分）；[§JSX → TSX 策略](#jsx--tsx-策略10-条规则) 规则 10 | 13 面板骨架 + 原子组件（`<Toggle>` `<SettingRow>` `<SectionBlock>`） |
| #22 | xai-web-settings-appearance | [§文件级端口映射表](#文件级端口映射表)（settings-appearance 预拆分）；[§持久化键附录](#持久化键附录) | `xai_accent_hue`、`xai_rail_pos`、`xai_bg_tone` 键 |
| #23 | xai-web-settings-features-panel | [§文件级端口映射表](#文件级端口映射表)（settings-features-panel 预拆分）；[§跨模块通信规则](#跨模块通信规则) | 渲染 8 个模块的 on/off 开关 + SVG 缩略图；ready_to_ship 边依赖 #6/#7/#10/#12/#13/#14/#15/#16 |
| #24 | xai-web-settings-rest | [§文件级端口映射表](#文件级端口映射表)（settings-rest 预拆分）；[§实施规则](#实施规则) | 10 个剩余设置面板（Account/Premium/Smart Lists/Notifications/Date&Time/More/Integrations/Collaborate/Sticky Note/Hotkeys/About） |

### 手动操作推荐：`web-ticktick-parity` 四行状态变更

以下四条 PENDING `web-ticktick-parity` 行已被 `xai-web-console` 的等价行取代。建议人工将 `docs/workflow/roadmap/web-ticktick-parity.md` 中的对应行状态编辑为 `BLOCKED_EXTERNAL`，附注：

> `Note: superseded by xai-web-console (ADR-0007)`

| `web-ticktick-parity` 行 | 取代者 |
|---|---|
| `web-productivity-habits-pomodoro` | `xai-web-pomodoro` + `xai-web-habits`（#14、#15） |
| `web-project-label-calendar` | `xai-web-board-core` + `xai-web-board-views` + `xai-web-board-workspaces` + `xai-web-calendar`（#7、#8、#9、#12） |
| `web-search-keyboard-theme` | `xai-web-shell`（搜索键盘，#5）+ `xai-web-settings-appearance`（主题，#22） |
| `web-statistics-views` | `xai-web-statistics`（#20） |

**重要**：本 ADR feature 不编辑 `docs/workflow/roadmap/web-ticktick-parity.md`（路线图驱动者约束）。上述为人工操作推荐，非自动化步骤。

---

## 相关

- [`docs/adr/0003-three-faces-architecture.md`](../adr/0003-three-faces-architecture.md) — 三面架构（Overlay / Console / Web）：Plugin 代码平台无关原则。本 ADR 精炼而非推翻。
- [`docs/adr/0006-web-face-hybrid-reuse-boundary.md`](../adr/0006-web-face-hybrid-reuse-boundary.md) — Web 面混合复用边界：Web 可独立实现 Vite SPA host shell；不得自行发明数据契约。本 ADR 精炼而非推翻。
- [`docs/workflow/roadmap/xai-web-console.md`](../workflow/roadmap/xai-web-console.md) — xai-web-console 路线图全文（24 行，R1..R7 说明）。本 ADR 是路线图 W0 ADR 行（#1）的产出物，门控所有下游行。
- [`docs/reviews/xai-web-build-form-adr/20260523-roadmap-seed.md`](../reviews/xai-web-build-form-adr/20260523-roadmap-seed.md) — 种子简报（需求规范化）。
- [`docs/reviews/xai-web-build-form-adr/20260523-discovery-review.md`](../reviews/xai-web-build-form-adr/20260523-discovery-review.md) — 调研主文档（Option A/B/C/D 分析；R1..R7 风险；Q-Rev-1..4）。
- [`web design/DESIGN.md`](../../web%20design/DESIGN.md) — XAI Console 原型设计规格（v1.0）。§9.2 持久化键注册表；§10 文件结构与技术栈；§12 验收清单。
- [`web design/index.html`](../../web%20design/index.html) — 原型入口（第 16–18 行 CDN 脚本标签，本 ADR 决定移除）。
- [`apps/web/package.json`](../../apps/web/package.json) — 现有 Vite+TS SPA（v0.1.0）依赖（`react@^19.2.0`、`vite@^7.0.4`、`@repo/web-auth-device-session` 等）。
- [`docs/PLUGIN_MAP.md`](../PLUGIN_MAP.md) — 全局插件状态机（注：可能存在过期；下游行须在 consume 时核验实际状态）。
- [`docs/workflow/roadmap/web-ticktick-parity.md`](../workflow/roadmap/web-ticktick-parity.md) — web-ticktick-parity 路线图（本 ADR 建议人工将 4 条 PENDING 行改为 BLOCKED_EXTERNAL）。
