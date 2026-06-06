# XAI_Desktop v1 Execution Packs

本目录把 PRD v1.7 和产品开发方案 v2 转成工程执行包。每个 `G*` 文件对应一个 Gate,包含目标、非目标、文件范围、任务拆解、验收和测试。

## 顺序

| Gate | 文件 | 颗粒度 |
|---|---|---|
| G0 | `G0-window-spike.md` | 可直接开 spike 分支 |
| G1 | `G1-native-foundation.md` | 可直接拆 implementation PR |
| G2 | `G2-data-security-foundation.md` | 可直接拆 contract/security PR |
| G3 | `G3-organizer-loop.md` | epic/story/task |
| G4 | `G4-productivity-clipboard.md` | epic/story/task |
| G5 | `G5-console-project.md` | epic/story/task |
| G6 | `G6-widgets-calendar-pet.md` | epic/story/task |
| G7 | `G7-ai-experience.md` | epic/story/task |
| G8 | `G8-web-console.md` | epic/story/task |
| G9 | `G9-sync-hardening-beta.md` | security gate |
| G10 | `G10-release-ga.md` | release gate |
| Plugin Phase 1 | `desktop-plugin-platform-phase1.md` | plugin 系统底座 / 小步 commit |

## 开工规则

1. G0-G2 必须按顺序关闭核心风险。
2. G3-G10 可以提前做设计和 contract,但生产实现不得绕过前置 Gate。
3. 每个 PR 只能声称完成一个明确 Task 或 Story。
4. 新增跨模块契约时,必须同步 `docs/contracts/*`。
5. 新增或修改 macOS/Tauri 能力时,必须同步 ADR 或 execution pack。

## 相关入口

- `docs/planning/BACKLOG-v1.md`
- `docs/planning/2026-05-12-PRD-v1.md`
- `docs/planning/2026-05-12-product-development-plan-v1.md`
- `docs/planning/REFACTORING_PLAN.md`
- `docs/adr/0005-window-foundation.md`
- `docs/planning/execution/desktop-plugin-platform-phase1.md`
