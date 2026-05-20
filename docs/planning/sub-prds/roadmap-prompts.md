# XAI v1 Roadmap Prompts: Codex Goal 连续开发版

> 更新日期: 2026-05-19
> 用途: 用最新 PRD、G0-G10 执行包、BACKLOG 和 Workflow V2 项目教程,驱动 Codex 通过 Goal 连续推进 v1 工程开发。
> 替代: 旧版 Sync / Console / Web 三子 PRD prompt 集。

本文件不再把 v1 拆成 Sync、Console、Web 三条平行 roadmap。当前权威工程入口已经变为:

- `docs/planning/execution/README.md`
- `docs/planning/execution/G0-window-spike.md`
- `docs/planning/execution/G1-native-foundation.md`
- `docs/planning/execution/G2-data-security-foundation.md`
- `docs/planning/BACKLOG-v1.md`
- `docs/contracts/README.md`
- `docs/workflow/project/usage-guide.md`

---

## 0. 硬规则

### 0.1 开工顺序

1. G0、G1、G2 必须按顺序关闭核心风险。
2. G3-G10 可以提前做设计、contract、mock 和 brief,但生产实现不得绕过前置 Gate。
3. 每个 PR 或一次 Workflow V2 feature run 只能声称完成一个明确 Task 或 Story。
4. 每个 feature 必须跑完 `Step 0 -> feature-plan -> feature-review -> build -> feature-verify`。
5. `ship` 永远是人工触发。Goal 可以做到 `READY_TO_SHIP`,不能自动 push。

### 0.2 Codex 运行约束

在 Codex 里不要让 roadmap agent 再嵌套 spawn `feature-full-loop`。原因是 Codex `max_depth=2`,典型链路 `roadmap-loop -> feature-full-loop -> feature-plan` 会撞深度。

Codex 推荐路径:

- 单 feature: 在 Codex parent session 内按 `/xai-feature-full-loop` 的 runtime recipe 执行,或直接派发真实 worker agents。
- 多 feature: 先产出 roadmap manifest,再按 wave 逐个 feature 运行 Goal。需要并行时开多个 Codex session,每个 session 只跑一个 feature。
- `xai-roadmap-loop run` 如可用,选择 `emit` 或 `serial`。不要选 `spawn`。`bg` 是 Claude Code Agent View 路径,不是 Codex 默认路径。

### 0.3 Feature 单元和状态文件

XAI 的默认 feature 单元是 `packages/<slug>/docs/`:

- 业务 plugin 使用 `packages/plugin-<name>/docs/`。
- 基础设施或安全任务可使用 roadmap anchor,例如 `packages/window-ground-truth/docs/`、`packages/repository-v0-contract/docs/`。
- 每个 feature 必须维护四件套: `design.md`、`api.md`、`test.md`、`dev_log.md`。
- `dev_log.md` Status Panel 是 feature 执行真相,roadmap manifest 是队列真相。

### 0.4 Contract 变更

只要新增或修改以下内容,必须同步 contract 文档:

- EventMap: `docs/contracts/events-v0.md`
- Repository / driver / migration: `docs/contracts/data-repository-v0.md`
- Tauri command / window label / capability: `docs/contracts/tauri-commands-v0.md`
- macOS/Tauri 能力或窗口策略: `docs/adr/0005-window-foundation.md` 或对应 execution pack

### 0.5 askquestion 边界

遇到会实质改变产品、架构、安全或发布路径的问题,必须用 AskQuestion / AskUserQuestion-style 先问,不要猜。

必须问的边界:

- G0 任一核心能力失败,需要选择 fallback 产品形态。
- 是否接受 DMG-only private API,或 MAS 需要降级体验。
- 是否移动用户真实文件,还是只保存 path/bookmark 引用。
- 后端路线从 Supabase baseline 改为 CloudKit、自建或其他服务。
- Clipboard 是否默认 Sync,或是否允许 AI 默认读取剪贴板全文。
- AI provider、预算、数据保留和发送范围未明确。
- 设备撤销、rekey、删除账号等 destructive flow 的用户确认语义不明确。
- 法律、公司主体、Apple Developer、域名、Logo、付费模式未定但会阻塞 G10。
- feature 边界不清: 一个 feature 还是两个 feature,依赖是否必须等 SHIPPED,是否可并行。

低风险细节可以保守假设,但必须写入 `Decomposition Rationale` 或 feature `dev_log.md` 的 assumptions。

---

## 1. Pre-flight

先确认工作流、agents、skills 和项目文档存在:

```bash
ls .codex/agents
ls .teams/skills/xai-feature-brief/SKILL.md
ls .teams/skills/xai-feature-full-loop/SKILL.md
ls .teams/skills/xai-roadmap-loop/SKILL.md
python3 scripts/lint/check_portable_sync.py
git status --short
```

建议每次 Goal 开始前先读:

```text
docs/workflow/project/usage-guide.md
docs/workflow/SOP_NEW_FEATURE.md
docs/workflow/SUBAGENT_WORKFLOW_V2.md
docs/planning/execution/README.md
docs/planning/BACKLOG-v1.md
docs/contracts/README.md
```

如果 working tree 有与本次目标无关的未提交文件,不要清理、不要 revert。只在 final 里说明你实际改了哪些文件。

---

## 2. Codex Master Goal: 从当前状态连续推进下一项

把下面整段作为 Codex Goal 粘贴。它适合日常继续开发,由 Codex 自己根据 repo 状态选择下一项 eligible work。

```text
Goal:
按 XAI Workflow V2 连续推进 v1 roadmap 的下一项 eligible feature,做到 READY_TO_SHIP 或 BLOCKED 后停止,不要自动 ship。

必须先读:
- docs/planning/sub-prds/roadmap-prompts.md
- docs/workflow/project/usage-guide.md
- docs/workflow/SOP_NEW_FEATURE.md
- docs/workflow/SUBAGENT_WORKFLOW_V2.md
- docs/planning/execution/README.md
- docs/planning/BACKLOG-v1.md
- docs/contracts/README.md
- 当前 Gate 的 execution pack
- 相关 package 的 docs/dev_log.md、design.md、api.md、test.md

选择下一项工作:
1. 如果 G0 未 Go 或 Conditional Go,只推进 G0。
2. 如果 G0 已通过但 G1 未通过,只推进 G1。
3. 如果 G1 已通过但 G2 未通过,只推进 G2。
4. G2 之后按 G3 -> G4 -> G5 -> G6 -> G7 -> G8 -> G9 -> G10,只做满足前置的 Story/Task。
5. 如果已有 docs/workflow/roadmap/<name>.md,先 reconcile manifest 与 packages/<feature>/docs/dev_log.md。

执行流程:
1. 明确 feature slug、Scope、Non-goals、Acceptance、Tests、Docs。
2. 如果缺任一项,或边界会影响产品/安全/发布路径,先 askquestion,等待回答。
3. 走 Workflow V2:
   - Step 0 brief: docs/reviews/<feature>/<YYYYMMDD>-feature-brief.md
   - feature-plan
   - feature-review,REVISE 最多 3 轮
   - feature-auto-build 或 feature-build,按 plan phase 拆 commit
   - feature-verify,默认 Verify Cross-vendor: yes
4. 每个 worker 后读取 packages/<feature>/docs/dev_log.md Status Panel,不要只信口头总结。
5. 任何 EventMap、Repository、Tauri command、capability、ADR 影响都同步 docs/contracts/* 或 ADR。
6. 运行 execution pack 指定测试。若缺 test script 或真机条件不足,写入 dev_log Blockers / Deferred gates,不能默默跳过。
7. 停在 READY_TO_SHIP 或 BLOCKED。不要自动运行 ship。最终输出必须包含下一步 ship 或 unblock 命令。

Codex 限制:
- 不要 spawn feature-full-loop meta-orchestrator。
- 如需 subagent,只派发真实 Workflow V2 worker: feature-plan / feature-review / feature-auto-build / feature-verify / ship。
- 如果内联执行某个 Workflow V2 worker 模板,最终响应必须遵守该 worker 的 Handoff 输出契约。
```

---

## 3. 初始化 Roadmap Manifest

### 3.1 推荐 manifest 切分

不要做一个无限大的 `xai-v1.md` 后直接跑到底。推荐按 Gate 生成 manifest:

| Manifest | Source | 前置 | 默认 Mode | Verify |
|---|---|---|---|---|
| `xai-g0-window-spike` | `G0-window-spike.md` | 无 | `D-Codex` | yes |
| `xai-g1-native-foundation` | `G1-native-foundation.md` | G0 Go/Conditional Go | `D-Codex` | yes |
| `xai-g2-data-security-foundation` | `G2-data-security-foundation.md` | G1 通过或接口冻结 | `D-Codex` | yes |
| `xai-g3-organizer-loop` | `G3-organizer-loop.md` | G1 + G2 contract | `D-Codex` | yes |
| `xai-g4-productivity-clipboard` | `G4-productivity-clipboard.md` | G2 + G3 | `D-Codex+Cursor` | yes |
| `xai-g5-console-project` | `G5-console-project.md` | G4 数据/Label 稳定 | `D-Codex+Cursor` | yes |
| `xai-g6-widgets-calendar-pet` | `G6-widgets-calendar-pet.md` | G5 稳定 | `D-Codex+Cursor` | yes |
| `xai-g7-ai-experience` | `G7-ai-experience.md` | G4/G5/G6 入口稳定 | `D-Codex` | yes |
| `xai-g8-web-console` | `G8-web-console.md` | G5 contract + G9 接口冻结 | `D-Codex+Cursor` | yes |
| `xai-g9-sync-hardening-beta` | `G9-sync-hardening-beta.md` | G2 baseline + G8 入口 | `D-Codex` | yes |
| `xai-g10-release-ga` | `G10-release-ga.md` | G9 Beta 通过 | `D-Codex` | yes |

说明:

- 如果当前宿主是 Claude Code,高风险 native/security 也可以用 `A-Claude`。
- 如果 Codex 和 Cursor CLI 都稳定可用,UI-heavy Gate 优先 `D-Codex+Cursor`。
- 如果只有 Codex 可用,统一降级 `D-Codex`,但 verify 仍保持 `yes`。

### 3.2 `xai-roadmap-loop` init prompt

如果当前环境支持 project-layer skill,用这个初始化单个 Gate manifest:

```text
/xai-roadmap-loop
mode: init
input_kind: roadmap
source: docs/planning/execution/<G_FILE>.md
roadmap_name: <ROADMAP_NAME>
notes: |
  这是 XAI v1 Gated execution roadmap,不是旧 Sync/Console/Web 子 PRD。
  必须参考:
    - docs/planning/execution/README.md
    - docs/planning/BACKLOG-v1.md
    - docs/planning/2026-05-12-PRD-v1.md
    - docs/planning/2026-05-12-product-development-plan-v1.md
    - docs/planning/REFACTORING_PLAN.md
    - docs/contracts/README.md
    - docs/workflow/project/usage-guide.md
  分解规则:
    - 每一行 feature 必须来自执行包里的明确 Task/Story,不要把整 Gate 做成一个 feature。
    - 每个 feature 必须有 Scope / Non-goals / Acceptance / Tests / Docs。
    - G0-G2 feature 默认按执行包顺序串行。
    - G3-G10 可按 contract/mock 允许并行,但生产实现不得越过前置 Gate。
    - 新增或修改 EventMap / Repository / Tauri command 必须在 acceptance 中写 contract 更新。
    - macOS native / 多窗口 / Tauri command feature 必须把真机验证写入 acceptance。
    - 默认 Verify Cross-vendor: yes。
    - Codex 运行时不要使用 dispatch: spawn。
  不清楚的边界必须 askquestion,不要猜。
```

init 后必须人工 review manifest:

- feature 是否 1 到 3 天可完成。
- G0-G2 是否保持顺序。
- dependency graph 是否只表达真实依赖。
- `Default Verify Cross-vendor:` 是否为 `yes`。
- `BLOCKED_EXTERNAL` 是否保留 Apple Developer、法律、域名、后端最终拍板等外部依赖。
- seed brief 是否指向 `docs/reviews/<feature>/<YYYYMMDD>-roadmap-seed.md`。

### 3.3 Roadmap run prompt

```text
/xai-roadmap-loop
manifest: docs/workflow/roadmap/<ROADMAP_NAME>.md
```

运行时如果弹 dispatch 确认:

- Codex 日常选 `emit`。拿到每个 `/xai-feature-full-loop` block 后,新开独立 Codex session 跑。
- 想在当前 Codex session 串行推进,选 `serial`。
- 不选 `spawn`。
- `bg` 只在你明确使用 Claude Code Agent View 并且 bg preflight 已过时选择。

---

## 4. 单 Feature Goal 模板

当 manifest emit 出一条 feature,或你想直接跑执行包里的某个 Task/Story,用这个模板。

```text
Goal:
把 <FEATURE_SLUG> 从当前状态推进到 READY_TO_SHIP,不要自动 ship。

Feature:
- Slug: <FEATURE_SLUG>
- Gate: <GATE_ID>
- Source: docs/planning/execution/<G_FILE>.md <section or row>
- Requirement: <1-3 句说明用户价值和工程目标>
- Automation Mode: <D-Codex | D-Codex+Cursor | A-Claude if in Claude Code>
- Verify Cross-vendor: yes

Scope:
- <允许修改的路径>

Non-goals:
- <明确不做的内容>

Acceptance:
- <二元可验收条件>

Tests:
- <execution pack 指定测试命令>
- <额外 contract/unit/integration tests>
- 如果必须真机验证,列出 macOS/显示器/Spaces/权限矩阵。

Docs:
- packages/<FEATURE_SLUG>/docs/design.md
- packages/<FEATURE_SLUG>/docs/api.md
- packages/<FEATURE_SLUG>/docs/test.md
- packages/<FEATURE_SLUG>/docs/dev_log.md
- 如影响跨模块接口,同步 docs/contracts/*。

Workflow V2:
1. 如无 Step 0 brief,先写 docs/reviews/<FEATURE_SLUG>/<YYYYMMDD>-feature-brief.md。
2. 派发 feature-plan,直到 dev_log Status = NEEDS_REVIEW。
3. 派发 feature-review,REVISE 则回 feature-plan,最多 3 轮。
4. 派发 feature-auto-build 或逐 phase feature-build。每个 phase commit 要小且可解释。
5. 派发 feature-verify。verify 必须检查 tests、contracts、docs、manual gates。
6. 停在 READY_TO_SHIP 或 BLOCKED。输出下一步 ship 或 unblock。

AskQuestion:
如果 Scope、contract、数据安全、macOS 能力、发布路径、用户破坏性动作、AI/Clipboard 隐私边界不清,先问我,不要实现。
```

---

## 5. Gate Feature 拆分清单

下面是给 roadmap init 和 Codex Goal 选任务用的 canonical split。最终以对应 execution pack 为准。

### 5.1 G0: Window Spike

Source: `docs/planning/execution/G0-window-spike.md`

| Feature slug | Source task | 关键验收 | 验证 |
|---|---|---|---|
| `window-ground-truth` | G0.1 | 分支和 `docs/reviews/window-ground-truth/README.md` | `git branch --show-current`, `sw_vers` |
| `grid-window-prototype` | G0.2 | alpha/beta 两个 Grid,事件带 `gridId` 且不串 | 手工 DevTools/log |
| `click-through-matrix` | G0.3 | 透明区落到 Finder,item/handle 可交互 | Sonoma/Sequoia 真机 |
| `finder-dnd-path` | G0.4 | 文件、文件夹、App、alias path 记录 | Finder drop 真机 |
| `spaces-multimonitor-matrix` | G0.5 | Space/fullscreen/双屏行为清楚 | 手工矩阵 |
| `mas-sandbox-dry-run` | G0.6 | MAS 风险和 entitlements 草案 | `mas-sandbox-notes.md` |

G0 总体验证:

```bash
pnpm --filter desktop tauri dev
pnpm --filter @repo/plugin-organizer test
pnpm --filter @repo/core test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

G0 出口必须更新:

- `docs/adr/0005-window-foundation.md`
- `docs/planning/2026-05-12-PRD-v1.md` 的 R-00 风险
- `docs/planning/execution/G1-native-foundation.md` 的实现路径

### 5.2 G1: Native Foundation

Source: `docs/planning/execution/G1-native-foundation.md`

| Feature slug | Source task | 关键验收 |
|---|---|---|
| `window-command-contract` | G1.1 | TS 不拼 label,Rust 是 label 权威,CommandError 有 code/message |
| `grid-shell-organizer-content` | G1.2 | Host shell 无业务规则,`plugin-organizer/index.ts` 是 public import 面 |
| `native-dnd-path-first` | G1.3 | Drop payload 统一 `DroppedFile[]`,真实 path 持久化 |
| `multi-grid-event-scope` | G1.4 | 所有 `organizer:grid:*` payload 必带 `gridId`,无 scope event 被拒绝或忽略 |
| `grid-persistence` | G1.5 | 重启恢复 rect/items,损坏 state 可 reset |
| `host-business-residuals` | G1.6 | Host 残余业务清单落档,Host 不新增业务状态 |

G1 验证:

```bash
pnpm --filter @repo/core test
pnpm --filter @repo/plugin-organizer test
pnpm --filter desktop test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm check
```

手工门: 两个 Grid、文件/文件夹/App drop、重启恢复、Spaces/fullscreen、missing path。

### 5.3 G2: Data and Security Foundation

Source: `docs/planning/execution/G2-data-security-foundation.md`

| Feature slug | Source task | 关键验收 |
|---|---|---|
| `repository-v0-contract` | G2.1 | `core-data` 不 import plugin,contract tests 复用于 drivers |
| `sqlite-sqlcipher-poc` | G2.2 | encrypted DB roundtrip,错 key 不可读,损坏恢复策略 |
| `localstorage-migration` | G2.3 | 幂等 migration,失败不删旧数据 |
| `keychain-opaque-handle` | G2.4 | JS 只拿 `KeyHandle`,raw DEK 不跨 IPC |
| `tauri-capability-allowlist` | G2.5 | capabilities 最小化,每个 command owner 可解释 |
| `single-table-sync-baseline` | G2.6 | test entity push/pull/integrity baseline |
| `dmg-mas-security-dry-run` | G2.7 | `docs/reviews/release-sandbox-dry-run/README.md` 有证据 |

G2 验证:

```bash
pnpm --filter @repo/core-data test
pnpm --filter @repo/plugin-account test
pnpm --filter web test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm check
```

### 5.4 G3: Organizer Daily Loop

Source: `docs/planning/execution/G3-organizer-loop.md`

建议 feature:

- `organizer-item-model`: 文件、文件夹、App、URL、文本占位 item CRUD。
- `organizer-file-drop-item`: Finder 文件 drop 生成 file item,missing state。
- `organizer-app-url-items`: App bundle launch/reveal,URL 校验和 favicon fallback。
- `organizer-auto-classify-rules`: kind/extension/tag/source folder 规则。
- `organizer-desktop-dry-run`: Desktop 一键整理 preview/apply/undo。
- `organizer-finder-collaboration`: reveal、rename missing、remove broken link、tag fallback。
- `organizer-empty-error-states`: 空状态、失效路径状态、恢复动作。

验证:

```bash
pnpm --filter @repo/plugin-organizer test
pnpm --filter @repo/core-data test
pnpm --filter desktop test
pnpm check
```

手工门: 20+ Desktop 文件 dry run、文件夹/App/URL drop、删除原文件、双 Grid state 不串。

### 5.5 G4: Productivity, Clipboard, Labels, Cmd+K

Source: `docs/planning/execution/G4-productivity-clipboard.md`

建议 feature:

- `plugin-labels`: Label CRUD、picker、孤儿引用防护。
- `plugin-productivity-todo`: inbox/list/detail/due/priority/subtask。
- `plugin-productivity-eisenhower`: Todo 视图,不新增实体。
- `plugin-productivity-quick-add`: Cmd+K 或 quick tray 建任务。
- `plugin-productivity-pomodoro`: 任务绑定计时、暂停、完成记录、桌面轻量计时器。
- `plugin-productivity-habits`: Habit CRUD、每日打卡、streak、mini calendar。
- `plugin-clipboard-history`: 文本/图片/文件/link/code 基础历史。
- `plugin-clipboard-privacy`: 禁用应用、暂停记录、清空历史。
- `plugin-clipboard-search-queue`: 类型过滤、搜索、顺序粘贴。
- `plugin-console-cmdk-local-search`: organizer/todo/clipboard/labels 搜索和 action。

验证:

```bash
pnpm --filter @repo/plugin-productivity test
pnpm --filter @repo/plugin-clipboard test
pnpm --filter @repo/plugin-labels test
pnpm --filter @repo/core-data test
pnpm check
```

隐私门: Clipboard 默认 device-local。除非用户明确开启 Sync,否则不进入 remote outbox。

### 5.6 G5: Console and Project Board

Source: `docs/planning/execution/G5-console-project.md`

建议 feature:

- `plugin-console-shell`: sidebar/list/detail/command bar。
- `plugin-console-slot-registry`: Productivity/Clipboard/Project/Settings 注册 view。
- `plugin-console-global-search`: 跨实体 search/filter/action。
- `plugin-console-settings`: 隐私、快捷键、外观、同步入口。
- `plugin-project-board-crud`: board/list/card/checklist/due/label。
- `plugin-project-card-dnd`: 3 lists、50 cards 拖拽和顺序持久化。
- `plugin-project-card-detail`: description/checklist/due/labels/link todo。
- `console-desktop-link`: Grid item 创建 task/card。
- `notification-center-baseline`: due/pomodoro/sync/privacy warning。

验证:

```bash
pnpm --filter @repo/plugin-console test
pnpm --filter @repo/plugin-project test
pnpm --filter desktop test
pnpm check
```

UX 门: Console 是工作台,不是 landing page。禁止卡片套卡片,常用操作键盘可达。

### 5.7 G6: Widgets, Calendar, Pet

Source: `docs/planning/execution/G6-widgets-calendar-pet.md`

建议 feature:

- `plugin-widgets-host`: add/remove/move/resize/persist。
- `plugin-widgets-theme-density`: compact/comfortable,light/dark。
- `plugin-calendar-desktop`: Todo due、Pomodoro、Habit、Project due 只读聚合。
- `plugin-habits-enhanced-stats`: streak/calendar/weekly summary。
- `plugin-widgets-time-progress`: day/week/month/project countdown。
- `plugin-pet-basic`: 状态、动画、提醒气泡、可隐藏。
- `plugin-pet-non-intrusive`: 不抢焦点,不遮挡关键操作。
- `personalization-theme-baseline`: theme tokens,wallpaper-aware contrast baseline。

验证:

```bash
pnpm --filter @repo/plugin-widgets test
pnpm --filter @repo/plugin-calendar test
pnpm --filter @repo/plugin-pet test
pnpm check
```

长跑门: 7 天长跑无窗口堆积和明显内存增长。未完成时必须作为 deferred gate 写入 verify Handoff。

### 5.8 G7: AI Experience

Source: `docs/planning/execution/G7-ai-experience.md`

建议 feature:

- `plugin-ai-cube-conversation`: 对话展开,上下文来源可见。
- `ai-natural-language-task`: 自然语言生成 Todo draft。
- `ai-clipboard-context`: 只处理用户选中的 clipboard item。
- `ai-desktop-file-assist`: 文件名/path metadata 整理建议。
- `ai-privacy-gate`: 每次发送前展示数据类型和范围。
- `ai-redaction-baseline`: secrets/password-like content 默认不发送。
- `pet-ai-persona`: 桌宠轻量提醒/反馈化身。
- `ai-cost-latency-guard`: daily cap、timeout、offline fallback。

验证:

```bash
pnpm --filter @repo/plugin-ai-cube test
pnpm --filter @repo/plugin-clipboard test
pnpm check
```

隐私门: 生成 Todo/Card 必须是 draft,用户确认后才写库。网络失败不能影响非 AI 功能。

### 5.9 G8: Web Console

Source: `docs/planning/execution/G8-web-console.md`

建议 feature:

- `web-host-shell`: 复用 plugin-console,替换 host capabilities。
- `web-browser-safe-stubs`: window/fs/clipboard 降级清楚。
- `web-data-driver`: IndexedDB local cache + remote encrypted blob。
- `web-account-login`: OAuth/passkey baseline。
- `web-device-management`: 查看设备、撤销设备入口。
- `web-security-baseline`: CSP、Sentry、rate limit、RLS。
- `web-export-import`: 用户可导出加密数据。
- `web-responsive-console`: desktop/tablet/mobile 基础可用。

验证:

```bash
pnpm --filter web test
pnpm --filter web build
pnpm --filter @repo/plugin-console test
pnpm --filter @repo/plugin-account test
pnpm check
```

安全门: Web 不调用 Tauri-only API,远端不落明文核心数据。

### 5.10 G9: Sync Hardening and Beta

Source: `docs/planning/execution/G9-sync-hardening-beta.md`

建议 feature:

- `protocol-integrity`: deterministic CBOR/AAD,test vectors,property tests。
- `tla-protocol-model`: nonce/rekey 状态机模型或等价证明。
- `nonce-lease-defense`: server lease,dedup,progress tracking。
- `device-pairing`: X25519/Ed25519,anti-abuse,recovery proof。
- `rekey-two-phase`: device revoke 后 rekey 可恢复。
- `recovery-rehearsals`: server wipe、local wipe、rekey kill-9、device revoke。
- `audit-observability`: audit log integrity,Sentry/privacy-safe telemetry。
- `beta-operations`: quota/rate limit/support/export/delete account。

验证:

```bash
pnpm --filter @repo/plugin-account test
pnpm --filter web test
pnpm --filter @repo/core-data test
pnpm check
supabase test db
supabase functions serve
```

Beta 准入:

- 20 个内部测试账户。
- 7 天同步长跑无数据丢失。
- RLS fuzz/property tests 通过。
- Recovery rehearsals 4 个场景都有证据。
- Device revoke 后旧设备不能继续写有效数据。

### 5.11 G10: Release GA

Source: `docs/planning/execution/G10-release-ga.md`

建议 feature:

- `release-engineering`: versioning、notarization、auto-update、crash symbols。
- `release-dmg-candidate`: DMG 可下载、安装、启动、公证。
- `release-mas-candidate`: sandbox entitlement 审核包。
- `legal-privacy`: privacy policy、terms、data deletion、export。
- `marketing-site`: landing page、真实产品截图、download/docs。
- `app-assets`: icon、App Store screenshots、copy、category。
- `support-ops`: issue template、crash triage、SLA、known issues。
- `ga-acceptance-suite`: smoke、e2e、long-run、upgrade、migration。

验证:

```bash
pnpm check
pnpm --filter desktop build
pnpm --filter web build
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

发布门: DMG/MAS 双轨 release candidate、法律文本、删除账号、导出路径、known limitations 全部可访问。

---

## 6. Manifest Review Checklist

每次 init 后,必须人工检查:

- [ ] 每行 feature 都能在 1 到 3 天内完成,不是整个 Gate。
- [ ] 每行都有明确 Source、Requirement、Acceptance、Tests。
- [ ] G0-G2 没有越序。
- [ ] 后置 Gate 没有绕过前置 Gate 写生产实现。
- [ ] dependency semantics 默认是 `shipped`;只有明确安全时才用 `ready_to_ship`。
- [ ] `Default Verify Cross-vendor: yes`。
- [ ] Codex 运行路径没有依赖 `dispatch: spawn`。
- [ ] macOS native / 多窗口 / Tauri command 行包含真机验证。
- [ ] security / sync / AI / clipboard 行包含隐私和威胁边界。
- [ ] contract 影响写入 acceptance。
- [ ] BLOCKED_EXTERNAL 行保留真实外部依赖。
- [ ] Decomposition Rationale 记录 assumptions 和 askquestion 答案。

如果 5 处以上不对,不要 run。手改 manifest 或重跑 init。

---

## 7. 每波结束后的 batch ship

当一波 feature 到 `READY_TO_SHIP`,不要让 roadmap 或 Goal 自动 ship。人工逐个运行:

```text
Start the ship agent for <FEATURE_SLUG>.
Roadmap Manifest: docs/workflow/roadmap/<ROADMAP_NAME>.md
```

ship 后重新 run roadmap 或重新执行 Master Goal,让 manifest reconcile 到下一波。

---

## 8. 常见坑

1. 不要把旧 Sync/Console/Web 三子 PRD 当作当前 primary source。现在以 G0-G10 execution pack 为准。
2. 不要在 Codex 里 spawn `feature-full-loop` meta-orchestrator。直接派发真实 worker 或按 parent-session recipe 内联执行。
3. 不要跳过 `feature-verify`。每个 feature 必须有独立验证 gate。
4. 不要因为 test script 缺失就默认通过。必须记录阻塞或补测试。
5. 不要把业务逻辑放回 Host 或 Core。Host 是 shell,Core 是 infra,业务属于 plugin。
6. 不要新增未登记 event、repository entity 或 Tauri command。
7. 不要用 Web/Sync/AI 工作绕过 G2 数据安全底座。
8. 不要在 G10 临时新增大功能。GA 只做 release、legal、support、acceptance。

一句话: Codex Goal 每次只拿一个明确 feature,用 Workflow V2 跑到 `READY_TO_SHIP`,把不确定边界问清楚,把验证和 contract 写进磁盘,由人工 ship 解锁下一波。
