# G1 执行包:Phase 0.2 Mac 原生地基

| 字段 | 值 |
|---|---|
| Gate | G1 |
| 周期 | 3-4 周 |
| 前置 | G0 Go 或 Conditional Go |
| 状态 | Draft ready |
| 输出 | 稳定 Grid window lifecycle + 原生 DnD + Host shell 收敛 |

## 1. 目标

把 G0 spike 证明可行的窗口模型产品化,让 Organizer 成为可日用的桌面地基:

- Grid window 生命周期由 Rust 统一管理。
- Grid 内容由 `plugin-organizer` 渲染,Host 只负责 shell。
- Finder DnD 以真实 path 为一等数据源。
- 多 Grid 事件按 `gridId` scope 隔离。
- Grid rect 和 item placement 可持久化并恢复。

## 2. 非目标

- 不做 AI。
- 不做 Web。
- 不做完整 Sync。
- 不做复杂自动分类模型,只做规则引擎的最小闭环。
- 不做第三方插件运行时加载。

## 3. 文件级范围

| 范围 | 目标 |
|---|---|
| `apps/desktop/src-tauri/src/commands/window.rs` | create/update/close/list/focus Grid command 契约稳定 |
| `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` | window level、collection behavior、hit-test/DnD 能力收敛 |
| `apps/desktop/src-tauri/capabilities/default.json` | window command allowlist 最小化 |
| `apps/desktop/src/windows/GridWindow.tsx` | 只保留 shell、route param、provider |
| `apps/desktop/src/windows/ControlWindow.tsx` | Control 只触发 plugin slots,不硬编码业务 |
| `packages/plugin-organizer/src/OrganizerLayer.tsx` | Organizer 主内容归位 |
| `packages/plugin-organizer/src/hooks/useGridWindow.ts` | Grid lifecycle hook |
| `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts` | 多 Grid state 和 event scope |
| `packages/plugin-organizer/src/hooks/useFileDrop.ts` | path-first DnD |
| `packages/core/src/types/window.ts` | Window contract |
| `packages/core/src/types/events.ts` | Grid scoped events |

## 4. 任务拆解

### G1.1 固化 Window Command Contract

Task:
- 定义 `GridWindowRect`、`GridWindowSnapshot`、`CreateGridWindowInput`、`UpdateGridWindowInput`。
- Rust command 输出统一 `Result<T, CommandError>` 风格。
- 增加 `list_grid_windows` 和 `focus_grid_window`。

Acceptance:
- TS 侧不拼 window label,只传 `gridId`。
- Rust 侧是唯一 label 生成点。
- command error 有 code/message,便于 UI 展示。

### G1.2 Grid shell 与 Organizer content 分离

Task:
- `GridWindow.tsx` 只解析 `gridId`,加载 host providers,渲染 `OrganizerGridContent`。
- `plugin-organizer` 暴露 public component/hook,Host 禁止 import internal 文件。

Acceptance:
- `apps/desktop/src/windows/GridWindow.tsx` 不包含业务规则。
- `packages/plugin-organizer/src/index.ts` 是唯一 public import 面。

### G1.3 原生 DnD path-first

Task:
- 根据 G0 结论选择 Webview drop 或 Rust native drop receiver。
- Drop payload 统一为 `DroppedFile[]`:path/name/kind/size/aliasInfo/securityScope。
- 对 App、文件夹、普通文件分别写测试/手工验证。

Acceptance:
- Finder 拖入真实文件后,Grid item 持久化的是 path-backed item。
- 如果 MAS 需要 security-scoped bookmark,字段必须进入数据模型。

### G1.4 多 Grid event scope

Task:
- 所有 Grid event 统一命名: `organizer:grid:*`。
- payload 必须包含 `gridId`。
- `useMultiWindowGrids` 不监听无 scope 的全局事件。

Acceptance:
- 同时打开两个 Grid,拖入/移动/关闭互不影响。
- 单测覆盖 "event without gridId is rejected or ignored"。

### G1.5 Grid persistence

Task:
- 定义 Grid rect/item placement 的 repository 接口。
- 初期可接 local repo,但接口要兼容 G2 SQLite driver。
- 启动恢复所有 open Grid 或 last active Grid。

Acceptance:
- 重启 app 后 Grid rect 和 items 恢复。
- 损坏 state 不导致 app 白屏,Control 可 reset。

### G1.6 Host 残余业务剥离

Task:
- 列出 `apps/desktop/src` 中仍属于业务的组件。
- Settings、AiCube、sync status 只允许作为临时 public plugin slot 或登记迁移任务。

Acceptance:
- 新增 `docs/planning/execution/host-residuals.md` 或在 G1 执行日志中列出残余清单。
- Host 不新增业务状态。

## 5. 验收标准

| 类别 | 标准 |
|---|---|
| 功能 | 创建/移动/关闭/恢复 Grid 稳定 |
| DnD | 文件、文件夹、App path-backed drop 成功 |
| Scope | 多 Grid 事件不串 |
| Host | Grid shell 无业务规则 |
| 数据 | 重启后 rect/items 恢复 |
| macOS | Spaces/多屏行为符合 G0 决策 |

## 6. 测试

```bash
pnpm --filter @repo/core test
pnpm --filter @repo/plugin-organizer test
pnpm --filter desktop test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm check
```

## 7. 手工验证

- 打开 Control,创建两个 Grid。
- 分别拖入文件、文件夹、App。
- 移动 Grid,重启应用,检查恢复。
- 切换 Space 和全屏应用,检查可恢复。
- 删除/重命名原始文件,检查 Grid item 错误状态。

## 8. 出口标准

G1 通过后,用户应能把 XAI 当作一个轻量桌面整理工具连续使用一天,不依赖开发者手工清理状态。
