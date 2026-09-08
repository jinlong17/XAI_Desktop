# XAI_Desktop — AI Smart Desktop

## Current Priority (2026-05-30 — Web mainline active; ADR-0010 amended)

Active focus order — supersedes any conflicting prior PRD / roadmap:

- **P0 — Web Console (ACTIVE WEB MAINLINE)** (`apps/web/` + `packages/{xai-web-*, plugin-web-*}`): `web` is the Web product mainline and the most complete product surface. New Web feature and bug-fix work are permitted on `web` / `codex/web/<feature>` without a P0 carve-out. Web changes that may affect Desktop still require ADR-0013 D3 classification before promotion toward `desktop-next` / `dev`.
- **P1 — Desktop client (ACTIVE APP LANE)** (`apps/desktop/` + `packages/plugin-{account, console, productivity, ai-cube, calendar, labels, project}` + G0/G1 anchors): Tauri native shell that **hosts the Web SPA as a desktop app (Web container)** — menubar / tray / offline / account+Keychain / auto-update / notifications. **Multi-window, overlay, and desktop-widget capability is owned by the Desktop Plugin product (P2/P3), NOT the shell** (see `docs/MODULE_BOUNDARIES.md` + `docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`). G0 = CONDITIONAL_GO (G0.1-G0.5 SHIPPED 2026-05-19 on `origin/spike/window-ground-truth`; G0.6 BLOCKED_EXTERNAL pending Apple Developer signing — non-blocking). G1 native foundation remains permitted on the independent App lane; it no longer freezes Web new work. Authority: `docs/adr/0010-p1-desktop-resume-plan.md` (Accepted 2026-05-26, amended 2026-05-30).
- **P2 — Desktop organizer plugins & tools + sync-v1 + G2** (`packages/plugin-{organizer, clipboard, widgets, pet}` — note `plugin-meditation` is a *Planned PLUGIN_MAP row, not yet a package*; its Web form ships as `xai-web-meditation` — plus sync-v1 crypto stack, xai-g2 data-security foundation): Paused. Resumes only after G1 SHIPPED. **Gating split (avoid deadlock):** the plugin **platform-runtime / G1 native-foundation anchor** (multi-window engine, grid persistence, window-command) is the *active gate* — it executes on the P1 App lane and is plugin-platform product, but it is **NOT part of this P2 freeze**; the freeze is the plugin **packages** (clipboard/widgets/pet/meditation) + sync-v1 + G2, which resume once G1 ships. `organizer` is a delivered flagship plugin (Stable/shipped, NOT in the P2-paused freeze; ADR-0015 web-side Accepted, dev ADR-0011 reconcile pending). Surface/module boundary + desktop-plugin scope: `docs/MODULE_BOUNDARIES.md` + `docs/planning/sub-prds/plugin/PRD.md`.

Authority basis: **ADR-0010 Accepted 2026-05-26, amended 2026-05-30** supersedes the old "P0 Web maintenance-only / P0 carve-out required" reading. ADR-0013 governs branch topology and the Web to Desktop D3 gate.

### Branch & sync governance (ADR-0013, Accepted 2026-06-01)

`docs/adr/0013-branch-sync-governance.md` is the authority for branch topology,
the Web→Desktop sync gate, and the account cloud-sync per-feature contract. It is
**additive governance** — it does NOT change the amended ADR-0010 active-focus order
above. Key rules (do not contradict; cite ADR-0013 §D-N):

- **`web` and `dev` are two independent focus branches** (ADR-0013 §D5): `web`
  focuses on the Web product, `dev` focuses on the macOS App. Each evolves in its
  own direction, so **divergence between them is the normal, healthy state**
  (2026-05-30: 147 web-only / 184 dev-only) — NOT drift, NOT a subset/superset.
  Do NOT force-merge or rebase one onto the other to "make them equal"; they
  reconcile at `main`, and specific changes are shared on-demand via the D3 gate.
- **Branch topology** (ADR-0013 §D2, DEFINED not yet created): long-term `web`
  (Web mainline) → `desktop-next` (Web→App sync integration) ↔
  `desktop-plugin-next` (App plugin platform/SDK) → `dev` (Desktop stable / App
  RC); ephemeral `release/desktop/<version>` (freeze-only). Forward flow:
  `codex/web/<feature>` → `web` → (D3 gate) → `desktop-next` → `dev` →
  `release/desktop/<version>` → tag. Creating `desktop-next` /
  `desktop-plugin-next` / `release/*` is a SEPARATE operator-confirmed step
  (anything touching `dev` needs explicit confirmation); none exist yet.
- **Web→Desktop sync gate** (ADR-0013 §D3): every Web change is classified
  W0–W4 before flowing `web → desktop-next`, emitting a parity receipt. The
  `xai-web-to-desktop-sync` skill implements this gate; use manual D3 fallback
  only if the skill is unavailable in the current runtime.
- **Account cloud-sync** (ADR-0013 §D4, builds on `data-repository-v0` syncScope
  + sync-v1): Web and App do NOT sync to each other; both sync to one account
  cloud (Web IndexedDB ⇄ `/sync/push`,`/sync/pull` ⇄ server encrypted blobs ⇄
  App SQLite). Only `syncScope: account-sync` entities sync; `device-local`
  never does.

### Product module map & task routing (READ FIRST when a task arrives)

**Before starting ANY dev task, classify it into exactly one of the six product
modules below, then use that module's branch + skill + workflow.** This is the
single source for "which module does this requirement belong to". Full per-module
navigation (开发目标 / 绑定 skill / prompt 模板 / 开发 workflow / 进入下一模块的触发条件 /
影响的模块) lives in **`docs/PRODUCT_MODULE_MAP.md`** and is mirrored in the
dev-dashboard 产品结构图 (`docs/prototypes/dev-dashboard/`). Authority: ADR-0013 §D1/§D2.

| # | 模块 | key | Surface | 主 / 短分支 | 任务归属信号（命中即归该模块） | 状态 |
|---|---|---|---|---|---|---|
| 1 | Web 版本 | `web` | `apps/web/`, `packages/xai-web-*`, `plugin-web-*` | `web` / `codex/web/<feature>` | Web 页面·组件、Vite SPA、浏览器持久化、共享 UI、`/app/*` 路由、Cloudflare Pages | P0 active |
| 2 | Mac 桌面版 App | `app` | `apps/desktop/` (Tauri 2 + React 19) | `desktop-next`→`dev` / `codex/desktop/<feature>` | Tauri 壳、菜单栏/托盘、离线缓存、账号+Keychain、自动更新、系统通知、深链、开机启动、承载 Web SPA 容器 | P1 active lane |
| 3 | 桌面整理插件 / Widget | `plugin` | `apps/desktop/` 插件槽 + 插件平台运行时 | `desktop-plugin-next` / `codex/plugin/<feature>` | 插件 SDK、widget host、**多窗口引擎/原生窗口/grid 持久化/window-command/G1 native foundation/点击穿透**(代码物理在 host,产品归插件平台)、桌面整理、单插件功能 | 平台运行时/G1=active · 插件包=P2 paused |
| 4 | 账号云同步层 | `sync` | sync-v1 stack + server | (paused) / `codex/sync/<feature>` | `syncScope`、push/pull、冲突、跨设备、账号云、加密 blob | P2 paused |
| 5 | 官方网页 | `site` | Cloudflare deploy infra (无独立 package) | (proposed) / `codex/site/<feature>` | 下载页、自动更新、release notes、营销说明、对外/账号入口 | PROPOSED |
| 6 | Admin Dashboard / 控制面 | `admin` | prototype `docs/prototypes/admin-dashboard/` + roadmap manifest | `codex/admin/<feature>` | AI 配置、权限、用量、审计日志、运营后台 | ACTIVE roadmap-gated |

Routing rules (do not violate):

- **跨模块归属**：先按"任务归属信号"命中主模块；若改动会牵动其它模块，主模块照常开发，再按
  `PRODUCT_MODULE_MAP.md` 的 transitions / impacts 决定联动（例如功能改了下载产物 → 同步更新 `site`）。
- **`web` → `app` 只能走 D3 gate**（`xai-web-to-desktop-sync`，W0–W4 + parity receipt）；**禁止**把 Web 改动
  直接合进 `dev`。
- **`sync` 只搬 `syncScope: account-sync` 的实体**；`device-local` 永不上云（ADR-0013 §D4）。
- **`site` 仍是 PROPOSED**：未经 operator 确认，不得开新工作分支、不得当作 active 开发线。
- **`admin` 已由 operator 于 2026-06-05 激活为 roadmap-gated**：只允许经 `codex/admin/<feature>` +
  `docs/workflow/roadmap/xai-admin-dashboard-system-integration.md` 推进，首个切片是
  `xai-admin-dashboard-shell`；不得绕过 RBAC/审计/secret 边界直接做生产后台写入。
- `desktop-plugin-next` 已存在；`desktop-next` / `release/desktop/<version>` 目前**已定义但尚未创建**。
  创建新长期分支、推进到 `dev`、或进入 release 分支仍是独立的 operator 确认步骤。

## Project Overview

Multi-face product — single monorepo, three product surfaces:

- **Web Console (P0, active)** — Vite SPA at `apps/web/`, registers 24 modules via `xai-web-shell` slot pattern. Browser-only persistence via `xai-web-persistence-contract`; typed events via `xai-web-event-bus`. Authority spec: `web design/DESIGN.md` (Claude-Artifact prototype, per ADR-0007).
- **macOS Desktop shell (P1)** — Tauri 2 + React 19 **native shell that hosts the Web SPA as a desktop app (Web container)**: single main window + native chrome (menubar, tray, offline cache, account+Keychain, auto-update, system notifications, deep links, launch-at-login). Its product identity is "Web, natively wrapped" — **NOT** a desktop organizer. Built in this monorepo (Turborepo + pnpm).
- **Desktop Plugin product (G1 runtime active · packages P2 paused)** — The macOS desktop-native superpower layer: the plugin **platform runtime** (multi-window engine, click-through, Spaces, grid persistence, Plugin Host/SDK — physical code lives in the Tauri host but its product attribution is *plugin*, not the shell) is the active G1 gate; the individual plugins under `packages/plugin-*/` (organizer / clipboard / widgets / pet / sticky notes / quick-entry & quick-action floating panels) remain package work, with organizer shipped and the rest paused until G1.
- **长期平台路线 (planning-only)** — 未来 iPhone / iPad / Apple Watch / Android / 浏览器扩展 等平台作为"同一产品的面（surface）"规划在 `docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`（仅规划，未授权开工；当前开发仍以 Web / Mac 壳 / 桌面插件三面为主）。

Local project cockpit: `docs/prototypes/dev-dashboard/index.html` is the
personal developer dashboard. Machine-facing rules for Codex / Claude Code live
in `docs/workflow/project/dev-dashboard.md`; use `xai-dev-dashboard-sync` before
trusting Overview freshness or when dashboard / workflow / skill / release-log
changes need the machine contract and reusable template checked for alignment.

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
- Codex + Claude Code parallel-use rules live in
  `docs/workflow/project/workflow.md`; use that file for cross-tool ownership,
  branch, commit, review, and `A-Codex` / `D-Codex` semantics.

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
- `docs/workflow/project/workflow.md`
- `docs/workflow/project/multi-machine-development.md`
- `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/handoff.mdc`

Rules:

- Do not leave project agent/skill changes only in `~/.claude`, `~/.codex`, a
  local plugin cache, or any other untracked machine-local directory.
- Prefer changing `.agents/templates/` and `docs/workflow/_portable/` first,
  then regenerate platform outputs when applicable.
- Before finishing an agent/skill change, run a tracking audit such as:
  `git ls-files -o --exclude-standard .agents .claude .codex .cursor .teams docs/workflow/_portable docs/workflow/project AGENTS.md CLAUDE.md`
  and resolve any project-level untracked files intentionally.
- After committing, push the branch when the change is meant to be available on
  another machine.

### Multi-machine development contract

All recoverable project work—not only Agent/Skill configuration—must follow
`docs/workflow/project/multi-machine-development.md`.

- A writable short branch has one active machine/worktree owner. Parallel
  computers use sibling branches and reconcile explicitly.
- Before switching computers or ending a session, commit and push the current
  checkpoint. Stash, reflog, hidden refs, untracked source, and application chat
  history are not cross-machine handoff mechanisms.
- Secrets remain outside Git; tracked `.env.example` files carry names only.
- Run `pnpm git:sync-check -- --fetch`; use `--deep` for migration/cleanup.
- This completeness rule preserves ADR-0013 branch independence and never
  authorizes force-alignment, release, or a D3 bypass.

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
