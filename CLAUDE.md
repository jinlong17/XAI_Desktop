# XAI_Desktop — AI Smart Desktop

## Project Overview

macOS transparent desktop overlay for organizing files, folders, and apps into floating Smart Containers (grids). Built with Tauri 2 + React 19 in a monorepo (Turborepo + pnpm).

## Architecture

- **Host** (`apps/desktop/src/`): Tauri shell — routing + providers + window shells. Zero business logic.
- **Core** (`packages/core/`): Shared infrastructure — types, typed events, PluginRegistry, hooks. Zero business logic.
- **Plugins** (`packages/plugin-*/`): Feature modules as React packages. All business logic lives here.
- **UI Library** (`packages/ui/`): Shared components.
- **Rust Backend** (`apps/desktop/src-tauri/`): Modular commands (`commands/`) + macOS platform adapters (`platform/`).

Multi-window: main (transparent click-through) + control (AI Cube) + per-grid native windows.
Cross-window communication: Typed event layer (`@repo/core/events`) wrapping Tauri event system.

### Key Documents
- `docs/SYSTEM_ARCHITECTURE.md` — System constitution (architectural constraints + coding red lines)
- `docs/PLUGIN_MAP.md` — Global state machine (all plugins + their status)
- `docs/CORE_INFRA.md` — Infrastructure API reference

## Workflow (V2)

This project uses the V2 Subagent Workflow with two pipelines:

### Feature Dev
```
feature-plan → feature-review → feature-build → feature-verify → ship
```

### Bugfix
```
bug-diagnose → bug-fix → bug-verify → ship
```

### Auto-orchestration (optional)
- `feature-dev-loop` — auto-cycle build + verify (max 3 retries)
- `bugfix-loop` — auto-cycle fix + verify (max 3 retries)

### Key Rules
- `dev_log.md` is the source of truth for workflow state
- Every workflow write must maintain: Workflow, Executor, Updated, Suggested Next, Work Log
- `feature-build` does ONE phase per run, then stops for human confirmation
- `ship` requires READY_TO_SHIP status and human confirmation to push

### Documentation Contract
- `packages/plugin-*/docs/design.md` — Decision snapshot
- `packages/plugin-*/docs/api.md` — Interface contracts
- `packages/plugin-*/docs/test.md` — Test strategy
- `packages/plugin-*/docs/dev_log.md` — Workflow state machine
- `docs/adr/NNNN-*.md` — Architecture decision records

## How to Use the Workflow

### Calling Format

Use natural language instructions to invoke subagents:

```text
Start the feature-plan agent.
Start the feature-build agent for subscription.
Start the feature-dev-loop agent for subscription.
Start the bugfix-loop agent for auth.
Start the ship agent for subscription.
```

Entry-point subagents (`feature-plan` / `bug-diagnose`) need a description attached:

```text
Start the feature-plan agent.
  动机：需要添加文件系统真实读取能力
  目标：通过 Tauri fs API 读取文件元数据
  范围：plugin-organizer 内的文件操作，不涉及写入
  约束：需兼容 macOS 沙箱权限

Start the bug-diagnose agent.
  现象：Grid 窗口拖拽后位置不保存
  预期：拖拽结束后位置持久化到 localStorage
  实际：刷新后回到默认位置
  线索：怀疑 useMultiWindowGrids debounce 问题
```

### New Feature — Standard Call Sequence

**Manual mode (step-by-step):**
```text
1. Start the feature-plan agent.        (attach feature brief)
2. Start the feature-review agent for <feature>.
3. Confirm plan
4. Start the feature-build agent for <feature>.   # one phase at a time
5. Confirm phase
6. Start the feature-build agent for <feature>.   # next phase
7. Start the feature-verify agent for <feature>.
8. Confirm verify
9. Start the ship agent for <feature>.
```

**Auto mode (loop, after plan APPROVED):**
```text
1. Start the feature-plan agent.        (attach feature brief)
2. Start the feature-review agent for <feature>.
3. Confirm plan
4. Start the feature-dev-loop agent for <feature>.   # auto-run all phases + verify
5. Start the ship agent for <feature>.
```

### Bugfix — Standard Call Sequence

**Manual mode:**
```text
1. Start the bug-diagnose agent.        (attach bug report)
2. Confirm root cause and fix strategy
3. Start the bug-fix agent for <feature>.
4. Start the bug-verify agent for <feature>.
5. Confirm verify
6. Start the ship agent for <feature>.
```

**Auto mode:**
```text
1. Start the bug-diagnose agent.        (attach bug report)
2. Confirm root cause and fix strategy
3. Start the bugfix-loop agent for <feature>.   # auto fix → verify
4. Start the ship agent for <feature>.
```

### How to Decide the Next Step from dev_log.md

| Status | Suggested Next | Manual | Auto (loop) |
|--------|---------------|--------|-------------|
| `NEEDS_REVIEW` + `→ feature-review` | `feature-review` | `Start the feature-review agent for <feature>.` | — |
| `NEEDS_REVIEW` + `→ feature-plan` | `feature-plan` (revise) | `Start the feature-plan agent for <feature>.` | — |
| `APPROVED` | `feature-build` | `Start the feature-build agent for <feature>.` | `Start the feature-dev-loop agent for <feature>.` |
| `READY_FOR_VERIFY` | `feature-verify` | `Start the feature-verify agent for <feature>.` | — |
| `BLOCKED` + `→ feature-build` | `feature-build` (fix) | `Start the feature-build agent for <feature>.` | `Start the feature-dev-loop agent for <feature>.` |
| `FIX_READY` | `bug-fix` | `Start the bug-fix agent for <feature>.` | `Start the bugfix-loop agent for <feature>.` |
| `FIX_READY_FOR_VERIFY` | `bug-verify` | `Start the bug-verify agent for <feature>.` | — |
| `BLOCKED` + `→ bug-fix` | `bug-fix` (re-fix) | `Start the bug-fix agent for <feature>.` | `Start the bugfix-loop agent for <feature>.` |
| `READY_TO_SHIP` | `ship` | `Start the ship agent for <feature>.` | — |

## Conventions

### Commits
Format: `type(scope): summary` + body with Why / What / Scope / Risk / Docs / Tests.

### Code Boundaries
- Business logic → `packages/plugin-*/`, never in `apps/desktop/src/`
- Plugin-to-plugin interaction → `@repo/core/events`, not direct imports
- Canonical data types → `packages/core/src/types/` (global), `packages/plugin-*/src/types.ts` (local)
- Host depends on Plugin/Core only; Plugin depends on Core only; never reverse
- Rust commands in `src-tauri/src/commands/`; macOS platform code in `src-tauri/src/platform/macos/`

### Testing
- Desktop: `pnpm dev` in `apps/desktop/` for manual verification
- Unit tests: `pnpm --filter @repo/core test` (Vitest)
- Rust tests: `cargo test` in `apps/desktop/src-tauri/`
- Check multi-window behavior on real macOS hardware

## Agent Configuration

- Templates: `.agents/templates/*.md`
- Background: `.agents/project_background.md`
- Generation: `./scripts/setup_subagents_v2.sh`

### Platform-specific generation

The script reads extended frontmatter fields from templates and generates platform-compliant configs:

| Platform | Model expansion | Permissions | Output |
|----------|----------------|-------------|--------|
| Claude Code | `opus` → `claude-opus-4-7`, `sonnet` → `claude-sonnet-4-6` | `tools` field | `.claude/agents/*.md` |
| Codex | `opus` → `gpt-5.4`, `sonnet` → `gpt-5.3-codex` | `sandbox_mode` | `.codex/agents/*.toml` + `.codex/config.toml` |
| Cursor | `opus` → `inherit`, `sonnet` → `fast` | `readonly` / `is_background` | `.cursor/agents/*.md` |

### Regenerate agents after changing templates or background:
```bash
# Safe mode (Claude → .claude/agents-v2/)
./scripts/setup_subagents_v2.sh

# Replace active Claude agents
./scripts/setup_subagents_v2.sh --replace-claude --force

# Only specific targets
./scripts/setup_subagents_v2.sh --targets codex,cursor

# Preview only
./scripts/setup_subagents_v2.sh --dry-run
```

## Workflow V2 Subagent Output Display

When spawning any Workflow V2 subagent (feature-plan, feature-review,
feature-build, feature-verify, ship, bug-diagnose, bug-fix, bug-verify,
feature-dev-loop, bugfix-loop) via the Task tool, the subagent's final
response is a copy-pasteable Handoff block designed to be handed to the next
session by the user.

### Hard constraint

Display the Handoff block **VERBATIM** to the user. Do NOT:
- Paraphrase it into a conversational summary
- Extract fields like "Blockers" or "Summary" into bullet lists outside the block
- Append "是否现在启动下一步？" or similar conversational follow-ups after it
- Strip the `## Handoff` heading or the `### Next Step` section

### What you CAN do

If you want to add value beyond the verbatim Handoff, put your commentary
**ABOVE** the Handoff block under a separate heading like `## Context`;
keep the Handoff block intact below so the user can copy it into the next
session with one selection.

### Why this rule exists

The template's Output Contract controls what the **subagent** generates.
This section controls how the **main session** displays the subagent's return.
Both layers are needed — without this rule, the main session will paraphrase
the structured Handoff into free-form prose, breaking the cross-tool
copy-paste workflow.
