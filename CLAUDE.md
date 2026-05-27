# XAI_Desktop — AI Smart Desktop

## Current Priority (2026-05-26 — P1 active per ADR-0011 Accepted, supersedes ADR-0010 §D1/§D2 in part)

Active focus order — supersedes any conflicting prior PRD / roadmap:

- **P1 — Desktop client (ACTIVE — Phase 1: Tauri-wrap of `apps/web` dist + normal Mac window + offline UI launch)** (`apps/desktop/` + reuses `apps/web/` + `packages/{xai-web-*, plugin-web-*}`): React+Tauri+Local-first hybrid app. Phase 1 goal (1–2 weeks): shippable `.dmg` that launches the full Web shell from bundled static assets, enters `/app` without network, shows clear offline degradation for online-only panels. Phase 2: notifications + status bar + global hotkeys + auto-update + full macOS menu. Phase 3: local-first data layer (own ADR). **Branch map:** machine A = `dev` (desktop Phase 1); machine B = `web` (Web optimisation + WEB-B non-blockers). First wave (Codex audit Part 4): `desktop-tauri-web-dist-normal-window` → `desktop-web-auth-offline-mode` → `desktop-phase1-build-packaging-pipeline` → `web-external-runtime-offline-gates`. Authority: `docs/adr/0011-p1-react-tauri-local-first-hybrid.md` (Accepted 2026-05-26).
- **P0 — Web Console (MAINTENANCE-ONLY + Phase 1 UI source)** (`apps/web/` + `packages/{xai-web-*, plugin-web-*}`): 24/24 + 9/9 gap-closure SHIPPED; deployed to Cloudflare Pages. **Also serves as the Phase 1 UI source for P1 desktop wrap.** Bug-fix permitted; new feature plans require P0 carve-out commit citing ADR-0010 §D4 (still active). Deferred-by-carve-out items: Safari/Firefox/iOS Safari smoke + external-provider flows.
- **P3 Future — Legacy overlay / file-organizer scope** (`packages/plugin-{organizer, clipboard, widgets, meditation, pet}` + transparent-overlay Tauri scaffold + `xai-g0-window-spike.md` + `xai-g1-native-foundation.md` anchors + `sync-v1` crypto stack + `xai-g2-data-security-foundation`): **Deferred until Phase 3 local-first SHIPPED** per ADR-0011 §D3. Legacy G0.1–G0.5 / G1.1, G1.2, G1.4, G1.5, G1.6 PLUGIN_MAP `Shipped` rows are retained as historical evidence; no new active work is dispatched against these roadmaps.

Authority basis: **ADR-0011 Accepted 2026-05-26** supersedes ADR-0010 §D1 (P1 surface definition) + §D2 (xai-g0/g1 unfreeze) + §D1 P2 row (legacy plugins demoted P3). ADR-0010 §D3 (SYSTEM_ARCHITECTURE enforcement) + §D4 (operational rules) + §D5 (G2 evidence protocol for Web P0 carve-out) remain Active. Predecessor: ADR-0009 §D2 + ADR-0008 §S3.

## Project Overview

Multi-face product — single monorepo, evolving from "Web-first + future Desktop overlay" into **"Web Console + React+Tauri+Local-first Mac desktop hybrid"** per ADR-0011 (2026-05-26):

- **Web Console (P0, maintenance-only + Phase 1 UI source)** — Vite SPA at `apps/web/`, registers 12 modules via `xai-web-shell` slot pattern. Browser-only persistence via `xai-web-persistence-contract`; typed events via `xai-web-event-bus`. Authority spec: `web design/DESIGN.md` (Claude-Artifact prototype, per ADR-0007). Also wrapped by Tauri as the Phase 1 Mac app UI.
- **macOS Desktop (P1, active — Phase 1 hybrid app)** — Tauri 2 + React 19, normal Mac window (not transparent overlay), wraps `apps/web` static dist. Three-phase delivery per ADR-0011 §D1. Built in this monorepo (Turborepo + pnpm).
- **Legacy overlay / organizer (P3 Future)** — Transparent click-through main window + per-grid native windows + Smart Container file organizer + `packages/plugin-{organizer, clipboard, widgets, meditation, pet}`. Code retained as historical reference; per-plugin disposition revisited only after Phase 3 local-first SHIPPED.

## Architecture

- **Host** (`apps/desktop/src/`): Tauri shell — routing + providers + window shells. Zero business logic. **Phase 1 transition:** the legacy `OrganizerLayer` / transparent overlay shell at `apps/desktop/src/App.tsx` + transparent-overlay `tauri.conf.json` will be replaced by a normal-window shell loading `apps/web` dist in the first Phase 1 feature (`desktop-tauri-web-dist-normal-window`).
- **Core** (`packages/core/`): Shared infrastructure — types, typed events, PluginRegistry, hooks. Zero business logic.
- **Web Plugins** (`packages/plugin-web-*/` + `packages/xai-web-*/`): Web Console business modules. **Reused by P1 desktop in Phase 1 directly** (per ADR-0011 §S5 short-term cross-surface coupling note).
- **Legacy desktop plugins** (`packages/plugin-{organizer, clipboard, widgets, meditation, pet}/`): P3 Future; do not depend on these from new P1 work.
- **UI Library** (`packages/ui/`): Shared components.
- **Rust Backend** (`apps/desktop/src-tauri/`): Modular commands (`commands/`) + macOS platform adapters (`platform/`). **Phase 1 transition:** the legacy overlay setup in `lib.rs` / `platform/macos/window_ext.rs` is scoped for removal/refactor by the first Phase 1 feature.

Multi-window (Phase 1): single normal Mac window loading `apps/web` dist. Multi-window overlay/grid (legacy P3 Future): main (transparent click-through) + control (AI Cube) + per-grid native windows.
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

### Code Boundaries (MUST follow)
- Business logic → `packages/plugin-*/`, never in `apps/desktop/src/`
- Plugin-to-plugin interaction → `@repo/core/events`, not direct imports
- Canonical data types → `packages/core/src/types/` (global), `packages/plugin-*/src/types.ts` (local)
- Host depends on Plugin/Core only; Plugin depends on Core only; never reverse
- `index.ts` is a Plugin's only public surface — never import from `plugin-*/src/internal/`
- UI: generic components → `packages/ui/`; business components → inside the owning plugin
- Rust commands in `src-tauri/src/commands/`; macOS platform code in `src-tauri/src/platform/macos/`
- Full rules → `docs/SYSTEM_ARCHITECTURE.md` §4 编码红线 (12 条)

### Before Working on Any Plugin
- **Check `docs/PLUGIN_MAP.md` first** — only Stable/Production plugins can be depended on
- Plugins in Planned/In-Dev/Migrating status must be mocked if used as a dependency

### Testing
- Desktop: `pnpm dev` in `apps/desktop/` for manual verification
- Unit tests: `pnpm --filter @repo/core test` (Vitest)
- Rust tests: `cargo test` in `apps/desktop/src-tauri/`
- Check multi-window behavior on real macOS hardware

### Adding a New Plugin
```
1. packages/plugin-xxx/ (package.json + tsconfig.json + manifest.json)
2. src/index.ts + components + hooks
3. docs/ 四件套 (design.md, api.md, test.md, dev_log.md)
4. apps/desktop/src/main.tsx — add import registration
5. docs/PLUGIN_MAP.md — add row with status
```

## Agent Configuration

- Templates: `.agents/templates/*.md`
- Background: `.agents/project_background.md`
- Generation: `./scripts/setup_subagents_v2.sh`

### Agent / Skill Tracking Contract

Project-level agent, skill, and workflow settings are source-controlled project
state, not local machine state. Any change that affects how Claude, Codex, Cursor,
Workflow V2, or project skills behave MUST be committed and pushed so a fresh
clone on another computer has the same behavior.

Track and keep synchronized at minimum:

- `.agents/` — source templates and project background
- `.claude/agents/`, `.claude/agents-v2/`, `.claude/skills/`
- `.codex/agents/`, `.codex/skills/`, `.codex/config.toml`
- `.cursor/agents/`, `.cursor/rules/`
- `.teams/skills/`
- `docs/workflow/_portable/`
- `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/handoff.mdc`

Rules:

- Do not leave project agent/skill changes only in `~/.claude`, `~/.codex`, a
  local plugin cache, or any other untracked machine-local directory.
- Prefer changing `.agents/templates/` and `docs/workflow/_portable/` first,
  then regenerate platform outputs when applicable.
- Before finishing an agent/skill change, run a tracking audit such as:
  `git ls-files -o --exclude-standard .agents .claude .codex .cursor .teams docs/workflow/_portable AGENTS.md CLAUDE.md`
  and resolve any project-level untracked files intentionally.
- After committing, push the branch when the change is meant to be available on
  another machine.

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
