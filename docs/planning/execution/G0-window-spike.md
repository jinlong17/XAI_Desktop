# G0 执行包:Phase 0.1 窗口技术 Spike

| 字段 | 值 |
|---|---|
| Gate | G0 |
| 周期 | 1.5-2 周 |
| 状态 | Ready for implementation |
| Owner | Desktop/Tauri lead |
| 输出 | Go/No-Go 结论 + ADR-0005 更新 + spike 证据 |

## 1. 目标

用最小代码验证 XAI_Desktop 的桌面空间产品形态是否成立。G0 不追求好看,不接入完整业务,只回答五个问题:

1. 透明 Grid 空白区域能否稳定点击穿透到桌面/Finder。
2. Finder 文件拖入 Grid 能否拿到真实 path。
3. 多 Grid window 能否按 `gridId` 隔离事件。
4. 多屏、Spaces、全屏应用切换后窗口能否保持或可恢复。
5. `macOSPrivateApi=false` 与 MAS sandbox 下是否存在可接受实现路径。

## 2. 非目标

- 不做完整 Organizer UI。
- 不做 Todo/Clipboard/Console/Sync。
- 不优化视觉。
- 不引入第三方窗口库,除非 spike 明确 Tauri 原生能力不可用。
- 不改长期数据模型,只允许写 spike-only state。

## 3. 允许修改范围

| 范围 | 说明 |
|---|---|
| `apps/desktop/src-tauri/src/commands/window.rs` | 增加 spike command 或临时 telemetry |
| `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` | 验证 click-through、window level、collection behavior |
| `apps/desktop/src-tauri/tauri.conf.json` | 临时对比 `macOSPrivateApi` / dragDrop / sandbox flags |
| `apps/desktop/src/windows/GridWindow.tsx` | 最小 Grid spike surface |
| `packages/plugin-organizer/src/hooks/useFileDrop.ts` | 验证 path-first DnD |
| `docs/adr/0005-window-foundation.md` | 更新 Go/No-Go 结论 |
| `docs/planning/execution/G0-window-spike.md` | 记录执行日志 |

禁止改动:
- `packages/plugin-account` 同步协议。
- Web/Supabase migrations。
- 与窗口 spike 无关的 UI 重构。

## 4. 任务拆解

### G0.1 建立 spike 分支和证据目录

Task:
- 从当前工作分支创建 `spike/window-ground-truth`。
- 新建 `docs/reviews/window-ground-truth/` 记录截图、命令输出、真机矩阵。

Acceptance:
- 分支存在。
- 证据目录包含 `README.md`,列出机器型号、macOS 版本、显示器数量、测试日期。

Tests:
- `git branch --show-current`
- `sw_vers`

### G0.2 最小 Grid window prototype

Task:
- 用 `create_grid_window(gridId, rect)` 创建两个 Grid: `alpha` 和 `beta`。
- 每个 Grid 页面显示自身 `gridId`、window label、当前 rect。
- 增加一个可点击按钮,触发只发送本 Grid 的 scoped event。

Acceptance:
- 两个 Grid 同时存在。
- `alpha` 的事件不会被 `beta` 收到。
- 关闭任一 Grid 不影响另一个 Grid。

Tests:
- 手工打开两个 Grid。
- 在 DevTools/log 中确认 event payload 均包含 `gridId`。

### G0.3 Click-through 真机验证

Task:
- 分别测试 `macOSPrivateApi=true` 与 `false`。
- 验证透明区域、Grid item 区域、resize handle 区域三类 hit-test。
- 记录是否需要 native hit-test forwarding。

Acceptance:
- 透明空白区点击能落到桌面/Finder。
- Grid item 区域仍可接收 React pointer event。
- 行为在 Sonoma/Sequoia 至少一个主版本上稳定。

Failure fallback:
- 如果透明 click-through 不稳定,产品形态改为 "non-transparent File Zones style window + hide/show shortcut"。
- 如果只在 private API 下可用,DMG 与 MAS 必须分叉能力表。

### G0.4 Finder DnD path-first 验证

Task:
- 在 Grid prototype 内放置 drop zone。
- Finder 拖入文件、文件夹、App bundle、alias。
- Rust/JS log 必须打印真实 path、kind、drop target `gridId`。

Acceptance:
- 普通文件和文件夹拿到真实绝对路径。
- App bundle 至少拿到 `.app` path。
- alias 行为被记录:解析真实路径或保留 alias path,二选一写入 ADR。

Failure fallback:
- 如果 Webview drop 拿不到真实 path,转为 Rust/macOS native drop receiver。
- 如果 MAS sandbox 需要 security-scoped bookmark,进入 G1/G2 必做项。

### G0.5 Spaces / fullscreen / multi-monitor 矩阵

Task:
- 在单屏、双屏、Mission Control、多 Space、全屏应用旁边测试 Grid。
- 记录窗口是否丢失、错层、跨 Space、无法点击、无法恢复。

Acceptance:
- Grid 不应随机消失。
- 切 Space 后如果系统不允许常驻,必须能通过 Control 恢复。
- 多屏 rect 坐标写入和恢复没有明显偏移。

Failure fallback:
- 如果 full overlay 不成立,产品默认改为 "per-Space summonable zones"。

### G0.6 MAS sandbox dry run

Task:
- 准备最小 sandbox entitlements 草案。
- 对比 `macOSPrivateApi=false` 下 window/DnD 能力。
- 记录 MAS 风险:private API、file path access、global shortcut、clipboard、login item。

Acceptance:
- `docs/reviews/window-ground-truth/mas-sandbox-notes.md` 明确可行/不可行/待验证。
- PRD 的 DMG/MAS 双轨风险有实际证据。

## 5. 测试命令

```bash
pnpm --filter desktop tauri dev
pnpm --filter @repo/plugin-organizer test
pnpm --filter @repo/core test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

如果某个包暂时没有 test script,在执行日志中写明,不能默默跳过。

## 6. 手工验证矩阵

| 场景 | 通过标准 |
|---|---|
| Finder -> Grid file drop | 收到真实 path + gridId |
| Finder -> Grid folder drop | 收到真实 path + gridId |
| Grid alpha/beta event | 不串事件 |
| 透明空白区点击 | 点击落到桌面/Finder |
| Grid item 点击 | React item 可交互 |
| Mission Control | Window 不错层或可恢复 |
| Fullscreen app | 行为记录清楚 |
| 双屏 | rect 无明显偏移 |
| `macOSPrivateApi=false` | 能力差异记录清楚 |

## 7. 出口标准

G0 只有三种结果:

| 结果 | 条件 | 下一步 |
|---|---|---|
| Go | 五个核心问题均有可接受方案 | 进入 G1 |
| Conditional Go | 一到两个问题有 fallback,但不改变核心产品 | 进入 G1,同时把 fallback 写进 ADR |
| No-Go | click-through / DnD path / MAS 路径任一核心能力无可接受方案 | 暂停 G1,回到 PRD 改产品形态 |

## 8. 完成后更新

- `docs/adr/0005-window-foundation.md`:状态改为 Accepted 或 Superseded。
- `docs/planning/2026-05-12-PRD-v1.md`:更新 R-00 风险。
- `docs/planning/execution/G1-native-foundation.md`:只保留 G0 证实可行的实现路径。
