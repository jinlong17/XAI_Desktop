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

## Core Rules

1. **文档驱动交接** — 不靠聊天上下文，靠 `dev_log.md` + 共享文档
2. **断点续接** — 每个 subagent 启动时自动检测 Fresh / Continue / Review / Revise / Wait / Block / Done
3. **人工确认点** — feature-build 每个 phase 完成后停下等确认；ship 需要人工确认 push
4. **状态写入契约** — 每次写 dev_log.md 必须维护 Workflow / Executor / Updated / Suggested Next / Work Log
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

本项目 V2 工作流基于：
- `COMMON_SUBAGENT_WORKFLOW_TEMPLATE.md` — 通用 Subagent 工作流模板手册
- `SUBAGENT_WORKFLOW_V2.md` — V2 设计与落地说明
