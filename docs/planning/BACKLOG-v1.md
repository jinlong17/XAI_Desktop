# XAI_Desktop v1 全量工程 Backlog

| 字段 | 值 |
|---|---|
| 版本 | v1.0 execution backlog |
| 日期 | 2026-05-19 |
| 范围 | v1 全部 16 模块 |
| 来源 | PRD v1.7 + 产品开发方案 v2 + 重构方案 v1.1 |

## 1. 使用规则

- G0-G2 是地基,必须先细拆并通过。
- G3-G10 可并行做设计和 contract,但不能绕过前置 Gate 写生产实现。
- 每个 Task 开工前必须补齐:Scope / Non-goals / Acceptance / Tests / Docs。
- 任何新增 Tauri command、Repository entity、EventMap event 都必须同步 contracts 文档。

## 2. Gate 总览

| Gate | 执行包 | 周期 | 阻塞项 |
|---|---|---:|---|
| G0 | `execution/G0-window-spike.md` | 1.5-2 周 | click-through、DnD path、Spaces、MAS path |
| G1 | `execution/G1-native-foundation.md` | 3-4 周 | Grid lifecycle、event scope、persistence |
| G2 | `execution/G2-data-security-foundation.md` | 4-5 周 | Repository、SQLite/SQLCipher、Keychain、allowlist |
| G3 | `execution/G3-organizer-loop.md` | 2-3 周 | Organizer 日用闭环 |
| G4 | `execution/G4-productivity-clipboard.md` | 6-7.5 周 | Todo/Pomodoro/Habits/Clipboard/Labels |
| G5 | `execution/G5-console-project.md` | 4-6 周 | Console、Project board |
| G6 | `execution/G6-widgets-calendar-pet.md` | 6-7 周 | Widgets、Calendar、Pet 基础 |
| G7 | `execution/G7-ai-experience.md` | 3-4.5 周 | AI Cube、隐私、成本 |
| G8 | `execution/G8-web-console.md` | 8-10 周 | Web Console、安全、设备管理 |
| G9 | `execution/G9-sync-hardening-beta.md` | 6-7 周 + 2-3 周前置 | Sync hardening、公测 |
| G10 | `execution/G10-release-ga.md` | 2-3 周 | DMG/MAS、法律、官网、GA suite |

## 3. v1 模块映射

| 模块 | Gate | Primary package |
|---|---|---|
| 桌面整理/Grid/File Zone | G1/G3 | `packages/plugin-organizer` |
| 自动分类/一键整理 | G3 | `packages/plugin-organizer` |
| Todo | G4 | `packages/plugin-productivity` |
| Pomodoro | G4 | `packages/plugin-productivity` |
| Habits | G4/G6 | `packages/plugin-productivity` |
| Clipboard | G4/G7/G9 | `packages/plugin-clipboard` |
| Global Labels | G4 | `packages/plugin-labels` |
| Cmd+K/Search | G4/G5 | `packages/plugin-console` |
| Console | G5/G8 | `packages/plugin-console` |
| Project board | G5 | `packages/plugin-project` |
| Widgets | G6 | `packages/plugin-widgets` |
| Desktop Calendar | G6 | `packages/plugin-calendar` |
| Time progress/countdown | G6 | `packages/plugin-widgets` |
| Pet | G6/G7 | `packages/plugin-pet` |
| AI Cube | G7 | `packages/plugin-ai-cube` |
| Account/Sync/Web | G2/G8/G9 | `packages/plugin-account`, `apps/web` |

## 4. 第一批可开工任务

| ID | Gate | Task | 文件范围 | Done |
|---|---|---|---|---|
| XAI-G0-001 | G0 | 建 `spike/window-ground-truth` 和证据目录 | `docs/reviews/window-ground-truth/*` | 分支+README |
| XAI-G0-002 | G0 | 两个 Grid prototype | `commands/window.rs`,`GridWindow.tsx` | alpha/beta 不串事件 |
| XAI-G0-003 | G0 | Click-through 矩阵 | `window_ext.rs`,`tauri.conf.json` | true/false 差异记录 |
| XAI-G0-004 | G0 | Finder DnD path 验证 | `useFileDrop.ts`,`window_ext.rs` | 文件/文件夹/App path |
| XAI-G0-005 | G0 | Spaces/multi-monitor 验证 | `window_ext.rs` | 矩阵记录 |
| XAI-G0-006 | G0 | MAS sandbox dry run | `tauri.conf.json`,`capabilities/*` | entitlements 草案 |
| XAI-G1-001 | G1 | Window command contract | `commands/window.rs`,`types/window.ts` | create/update/list/focus |
| XAI-G1-002 | G1 | Grid shell/content 分离 | `GridWindow.tsx`,`plugin-organizer` | Host 无业务规则 |
| XAI-G2-001 | G2 | Repository v0 contract | `core-data/src/types.ts` | contract tests |
| XAI-G2-002 | G2 | Keychain opaque handle | `commands/keychain.rs`,`core-data/keychain.ts` | raw DEK 不进 JS |

## 5. Definition of Done

- 代码通过相关 package tests。
- `pnpm check` 或说明阻塞原因。
- Rust command 变更通过 `cargo test`。
- 文档四件套更新。
- Backlog 对应 item 标记状态。
- 不引入跨 plugin internal import。

## 6. 变更控制

任何任务如果要改变以下内容,必须先更新 PRD/ADR/contracts:

- v1 模块范围。
- Gate 顺序。
- Tauri command 入参/出参。
- Repository contract。
- Sync protocol。
- MAS/DMG 能力差异。
