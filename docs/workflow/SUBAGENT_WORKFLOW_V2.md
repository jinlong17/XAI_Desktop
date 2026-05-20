# Subagent Workflow V2 — XAI_Desktop

> 本项目采用 V2 Subagent 工作流。详细规范参见源文档。

## Pipeline

### Feature Dev (5 步)
```
feature-plan → feature-review → feature-build → feature-verify → ship
```

### Bugfix (4 步)
```
bug-diagnose → bug-fix → bug-verify → ship
```

### Auto-Orchestration (可选)
- `feature-dev-loop` — 自动循环 build + verify（最多 3 轮）
- `bugfix-loop` — 自动循环 fix + verify（最多 3 轮）

> ⚠️ **Claude Code 运行时约束(2026-05-17 实测)**:`feature-dev-loop` / `bugfix-loop`（以及 resync 新带入的 `feature-full-loop` / `bugfix-full-loop` meta-orchestrator）被作为 Task subagent spawn 时,Claude Code **静默不给 `Task` 工具**(防递归)→ 它们**无法自己 spawn worker**,会立即 `Status: BLOCKED`。可工作路径:**main session 自己当 orchestrator,直接 Task-spawn worker**(`feature-plan`→`feature-review`→`feature-build`/`feature-auto-build`→`feature-verify`,每步间读 dev_log Status Panel)。事件驱动 B-*/C-* 变体不受此约束(编排在 post-commit hook,非 in-session Task)。

### Phase 0 INTAKE & 事件驱动变体（resync 引入,见 `docs/workflow/_portable/`）

resync 后本项目已具备完整 V2 portable 层:`feature-full-loop` / `bugfix-full-loop` meta-orchestrator 的 **Phase 0 是 3 字段**——① Requirement/Bug 缺失=硬 BLOCKED(free-text 装不进 picker,绝不问)② Automation Mode picker Q1 ③ Verify Cross-vendor picker Q2(同一次 AskUserQuestion;host 不能问时默认 `yes`)。事件驱动 `B-Codex`/`B-Cursor`(headless `codex exec` / `cursor-agent --print --force`)+ `C-*` 经 `.git/hooks/post-commit` 链式 wrapper 自动跨厂商派发 review/verify。完整规格见 `docs/workflow/_portable/07-automation-mode-picker.md` §1A/§2.6 + `04-automation-loop.md` §3.4。前置:`codex` 已认证、`cursor-agent login`、`brew install coreutils util-linux`。

### Level 3 — Roadmap Orchestration（可选,跨多 feature 编排）

当你有一组 feature 要按依赖波次推进时(reviewed roadmap 或 raw PRD),用 **`xai-roadmap-loop` skill**（项目层,`.teams/skills/xai-roadmap-loop/SKILL.md`）。

- **`init` 模式**:吃 source doc,产出 manifest 到 `docs/workflow/roadmap/<roadmap_name>.md`,**停在人工 review gate**。
- **`run` 模式(默认 emit-dispatch)**:reconcile 每个 feature 的 `dev_log.md`,对每个 eligible feature **emit 一段可复制粘贴的 prompt block**(指向 `feature-full-loop`),**不 spawn 任何 subagent**;每个 prompt block 由人开到独立 session 跑。skill 只做 tracker,你做 dispatcher。Feature 跑完 SHIPPED/BLOCKED 后再调一次 `run` reconcile 下一波。
- **opt-in `dispatch: spawn`**:旧 spawn-dispatch 行为(skill 自己 spawn `feature-full-loop`),仅在嵌套深度 ≥ 4 的工具上可用(Claude Code 默认 / Codex `max_depth=2` 都不够)。

完整规格:`docs/workflow/_portable/06-roadmap-orchestration.md`(§3.2 emit-dispatch / §3.2-opt-in spawn)。

## Core Rules

1. **文档驱动交接** — 不靠聊天上下文，靠 `dev_log.md` + 共享文档
2. **断点续接** — 每个 subagent 启动时自动检测 Fresh / Continue / Review / Revise / Wait / Block / Done
3. **人工确认点** — feature-build 每个 phase 完成后停下等确认；ship 需要人工确认 push
4. **状态写入契约** — 每次写 dev_log.md 必须维护 Workflow / Executor / Updated / Suggested Next / Work Log。
   - `Executor` 是**单行滚动**字段(最后写盘者)——没有 Plan/Build/Review Executor 专用字段;hook 解析厂商时读这一行(NEEDS_REVIEW 时它=plan 执行者,READY_FOR_VERIFY 时=build 执行者)。
   - `feature-plan`(首次 NEEDS_REVIEW)/ `bug-diagnose`(首次 FIX_READY)额外写 `Automation Mode:` **和** `Verify Cross-vendor:` 两个 Status Panel 字段;其它 agent 只读这两行。meta-orchestrator(若使用)只 append Work Log,绝不写 Status Panel。
5. **跨工具无缝** — Claude Code / Codex / Cursor 通过读写同一组文件接力

## Directory Protocol

> 本项目的 `<feature>` 单元命名约定为 `plugin-<name>`（见 CLAUDE.md §Architecture），落地于 `packages/` 下，例：`plugin-organizer`。

```
packages/<feature>/docs/              ← 例：packages/plugin-organizer/docs/
├── design.md     ← 决策快照
├── api.md        ← 接口契约
├── test.md       ← 测试策略
└── dev_log.md    ← 状态机（核心）

docs/reviews/<feature>/               ← 例：docs/reviews/plugin-organizer/
├── <YYYYMMDD>-feature-brief.md       ← Step 0 需求规范化
└── <YYYYMMDD>-discovery-review.md    ← 调研主文档
```

## Subagent 权限矩阵

| Agent | Model Tier | 类型 | Claude tools | Codex sandbox | Cursor readonly |
|---|---|---|---|---|---|
| feature-plan | opus | 入口/可写 | Read, Write, Edit, Glob, Grep, WebSearch, WebFetch | workspace-write | false |
| feature-review | opus | 审核/只读 | Read, Glob, Grep | read-only | true |
| feature-build | sonnet | 实现/可写 | Read, Write, Edit, Bash, Glob, Grep | workspace-write | false |
| feature-verify | opus | 审核/只读 | Read, Bash, Glob, Grep | read-only | true |
| bug-diagnose | opus | 入口/可写 | Read, Write, Edit, Bash, Glob, Grep | workspace-write | false |
| bug-fix | sonnet | 实现/可写 | Read, Write, Edit, Bash, Glob, Grep | workspace-write | false |
| bug-verify | opus | 审核/只读 | Read, Bash, Glob, Grep | read-only | true |
| ship | sonnet | 交付 | Read, Bash, Glob, Grep | workspace-write | false |
| feature-dev-loop | opus | 编排 | Read, Task | read-only | false (bg) |
| bugfix-loop | opus | 编排 | Read, Task | read-only | false (bg) |

## 调用格式

使用自然语言指令调用 subagent：

```text
Start the feature-plan agent.        (附带 feature brief)
Start the feature-review agent for <feature>.
Start the feature-build agent for <feature>.
Start the feature-dev-loop agent for <feature>.
Start the ship agent for <feature>.
```

## dev_log.md → 下一步映射

| Status | Suggested Next | 手动模式 | 自动模式 |
|--------|---------------|---------|---------|
| NEEDS_REVIEW + → feature-review | feature-review | feature-review | — |
| NEEDS_REVIEW + → feature-plan | feature-plan (修订) | feature-plan | — |
| APPROVED | feature-build | feature-build | feature-dev-loop |
| READY_FOR_VERIFY | feature-verify | feature-verify | — |
| BLOCKED + → feature-build | feature-build (修复) | feature-build | feature-dev-loop |
| FIX_READY | bug-fix | bug-fix | bugfix-loop |
| FIX_READY_FOR_VERIFY | bug-verify | bug-verify | — |
| BLOCKED + → bug-fix | bug-fix (重修) | bug-fix | bugfix-loop |
| READY_TO_SHIP | ship | ship | — |

## Agent Regeneration

```bash
./scripts/setup_subagents_v2.sh --replace-claude --force
```

## Handoff 输出规范

每个 subagent 响应末尾必须输出 `## Handoff` 块（裸 markdown，不用代码块），包含：
- Feature / Completed / Summary / Status / Commits / Files Changed / Blockers / Next Step
- Next Step 使用自然语言格式：`Start the <agent> agent for <feature>.`
- 占位符使用 `(fill in ...)` 格式，不使用 `<...>`

## Source Documents

本项目 V2 工作流基于 portable 层规格 + 项目层 SOP:

**Portable 层（spec，禁止在本项目编辑；resync 同步）:**

- `docs/workflow/_portable/00-PORTABLE-MANIFEST.md` — placeholder table + 迁移/resync 入口
- `docs/workflow/_portable/01-workflow-model.md` — subagent pipeline 定义
- `docs/workflow/_portable/02-handoff-and-state.md` — Handoff block + dev_log 状态契约
- `docs/workflow/_portable/03-step0-brief-spec.md` — Step 0 feature-brief schema（canonical）
- `docs/workflow/_portable/04-automation-loop.md` — `feature-full-loop` parent-session recipe + 8 个 Automation Mode 变体
- `docs/workflow/_portable/06-roadmap-orchestration.md` — Level 3.5 roadmap-loop（emit-dispatch 默认）
- `docs/workflow/_portable/07-automation-mode-picker.md` — Mode picker 4 层 fallback
- **`docs/workflow/_portable/usage-guide.md` — 跨层 hands-on 教程；§0 是新项目迁移本工作流的 6 步走法（survey → review → instantiate → 项目层人工补完），需要把这套 paradigm 搬到另一个 repo 时从这里开始。**

**项目层（XAI 自己写，resync 不动）:**

- `docs/workflow/SUBAGENT_WORKFLOW_V2.md` — 本文件（V2 在 XAI 的具体落地）
- `docs/workflow/SOP_NEW_FEATURE.md` — 新 feature 标准流程
- `docs/workflow/SOP_BUGFIX.md` — bug 修复标准流程
- `docs/conventions/COMMIT_CONVENTION.md` — commit 格式
- `.teams/skills/xai-feature-brief/SKILL.md` — Step 0 需求规范化 skill
- `.teams/skills/xai-roadmap-loop/SKILL.md` — Layer 3.5 roadmap 编排 skill
