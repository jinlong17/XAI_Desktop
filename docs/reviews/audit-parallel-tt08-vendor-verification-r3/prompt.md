You are a fresh independent actual Claude Code verifier for TT-08/verify3, not the Codex writer. Read the ORIGINAL GOAL FIRST at /Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md. Then manually read project AGENTS.md, CLAUDE.md, docs/workflow/project/workflow.md and parallel-control-r1/authority-overlay.md. The human explicitly supersedes only global serial dispatch, authorizes parallel agents/worktrees and routine technical work, and preserves all module/evidence/independence/release protections. Sole root controller persists this output; you never repair or update any file. No children, Bash, MCP, hooks, browser, native, package/test/build/lint/typecheck, historical runtime reruns, status publication, push, merge, rebase, release/deploy/D3. Tools are Read/Glob/Grep only. If something cannot be established, report BLOCKED accurately; do not ask a human or invent evidence.

Read exact committed task card docs/reviews/20260908-full-product-audit/parallel-control-r1/task-tt08-vendor-verify-r3.json, this folder's preflight.json, approved contract docs/reviews/audit-parallel-tt08-preparation-r1/contract.md, independent approval docs/reviews/audit-parallel-tt08-contract-review-r1/review.md, and COMPLETE static before docs/reviews/audit-parallel-tt08-before-r1/before.md. Parent is 6db0903f966b49d4c9cfeb099db5885d5ec76758. Candidate is EXACT 59809b32a4dc19dbdefff871cf9c60bb5b0b96b1 (root integration d08b5c6ee46a98fad6354a1b626f9ebea74ed474 has identical five outputs). P0 runtime source f9eb4b1f207bc4b46f547b90afc250424b3c8695. Root preflight separately recomputed all307 immutable before identities, all5 outputs/fullpatch and30 protected package-host inputs, binding this checkout; do not falsely claim you independently ran hashing or tests with unavailable tools. Independently read and compare actual source/evidence to every documentary requirement.

Read ALL five candidate docs: docs/product/time-tracker/prd.md and packages/plugin-web-time-tracker/docs/design.md,api.md,test.md,dev_log.md. Check ALL approved D1-D7 obligations, original TT08 modes/PRD/log/page correspondence, actual src/TimeTrackerModule.tsx, internal/storage.ts,time.ts, types.ts,index.ts, widget snapshot/navigation, actual tests and accepted historical TT01/TT02/TT03/REL01 reports. Verify exact single default/Start confirmation/new-running lock/controller invariants, multi distinct sessions, paused versus running, Resume refusal, account content versus device mode. Conversion and preference-write limits must remain observations rather than invented owner policy. No fictional widget commands or page edit needed when existing EN/ZH controls correspond. Preserve original failing attempts, overlapping test groups and limitations; never claim historical runtime freshly rerun at P0. Existing reports are immutable current files with identities in307-row index/preflight. Canonical PRD is bounded accepted user capability with requirement-source-evidence-future acceptance trace, not whole GOV05 or release closure. Current dated docs iteration PENDING_INDEPENDENT_VERIFICATION; original June READY_TO_SHIP/commands remain historical literal tail. Links and unsupported future/shared/caller/cloud/release claims must be accurate. No current READY_TO_SHIP or audit formal-state update is allowed from this verification.

Emit your complete immutable verification report as your FINAL TEXT, root copies it literally. Use Verdict APPROVED or BLOCKED for exact documentation candidate only, a D1-D7 coverage table with concrete file/line/evidence, all actionable findings with exact coordinates, and honest method/cost/limitations. Actual cross-tool run is this new CLI session, not prior Codex names/auth preflight. Separate registered status writer then fresh Astra full-chain acceptance and root reconciliation/inventory still follow. Formal counts13completed/3verification_pending/3in_progress/293pending=312,299unclosed and Clock budgets/gates remain unchanged. Do not repair or launch child agents. No file writes.

This is cumulative verification iteration3/3, cap3; first exact candidate BLOCKED F1 remains in verification-r1/receipt.md and raw logs. Read that failure and assess corrected F1/A1 without treating it as whole acceptance. NEW candidate combines original five-doc author with fresh exact2-doc correction; root full-index correction patch 90bc2ec9a5ea000e8ae93ebe0e0533e22cf5e0537d4687353c49d37364565df7. Read COMPLETE approved contract, approval, before and ALL FOUR historical independent TT01/TT02/TT03/REL01 reports, full relevant candidate-referenced test bodies (including sessionEditor, TimeTrackerModule, sessionController, invariants/dayRollover/windowConsumers/accountIsolation) and source, not targeted-search snippets alone. If Read truncates, request remaining parts. Reassess ALL D1-D7 and every candidate statement, including test trace and absent selector UI coverage, no unsourced Owner. You do not hash/test; root preflight binds bytes, distinguish method limits. Full independent documentary verification only, no current status publication. Family3/3, $12 maximum, 900 seconds.

<provided_complete_governance_input path="AGENTS.md" sha256="519c72bcbdd1018af9a369614b9db04a674bf91870d99dcca03665dabe162100">
# AGENTS.md — Codex Session Rules for XAI_Desktop

> This file is auto-loaded by Codex at session start. It governs how the
> Codex parent session handles Workflow V2 subagent output.
>
> For shared project rules (architecture, code boundaries, conventions, testing),
> see `CLAUDE.md` — those apply to all platforms and are not duplicated here.
>
> For Codex + Claude Code parallel development rules, see
> `docs/workflow/project/workflow.md`.

---

## 1. Workflow V2 Handoff Display

### 1.1 Hard constraint

When spawning any Workflow V2 subagent (feature-plan, feature-review,
feature-build, feature-verify, ship, bug-diagnose, bug-fix, bug-verify,
feature-dev-loop, bugfix-loop) via the built-in agent-spawn mechanism,
the subagent's final response is a structured `## Handoff` block designed
to be copy-pasted into the next session by the user.

The parent session (`gpt-5.4` / `gpt-5.3-codex` or whatever model is
running) **MUST display the Handoff block VERBATIM**. Do NOT:

- Paraphrase it into a conversational summary
- Extract fields like "Blockers" or "Summary" into bullet lists outside the block
- Append "要不要启动下一步？" or similar conversational follow-ups after it
- Strip the `## Handoff` heading or the `### Next Step` section
- Reformat the block into a different structure

### 1.2 What you CAN do

If you want to add observations beyond the verbatim Handoff, put them
**ABOVE** the Handoff block under a separate `## Context` heading.
Keep the Handoff block intact below so the user can copy it with one selection.

### 1.3 Inline execution scenario

If `max_depth` is exhausted or the user explicitly asks you to execute
a subagent's instructions inline (within the parent session), then there
is no parent/child boundary — you ARE the subagent. In this case:

- Your final response MUST still be ONLY the `## Handoff` block
- The Output Contract from the subagent template applies directly to you
- Do NOT add conversational follow-ups after the Handoff block

---

## 2. Codex Runtime Conventions

### 2.1 Agent configuration

- Agent definitions: `.codex/agents/*.toml`
- Global config: `.codex/config.toml` — must include `[agents] max_depth = 2`
  for loop orchestrators (`feature-dev-loop`, `bugfix-loop`) to spawn workers

### 2.2 Model mapping

Templates use abstract tiers. Codex mappings are set in the generation script:

| Template tier | Codex model | Usage |
|--------------|-------------|-------|
| `opus` | `CODEX_STRONG_MODEL` (currently `gpt-5.4`) | plan, review, verify, diagnose, loop |
| `sonnet` | `CODEX_FAST_MODEL` (currently `gpt-5.3-codex`) | build, fix, ship |

#### Spark specialist routing

When delegation is authorized and supported by the current session:

- Use `spark-explorer` for bounded code searches, symbol location, and checklist evidence.
- Use `spark-ui-fixer` for local UI or fixture changes only after the parent defines
  allowed files, acceptance conditions, risk, and protected boundaries.
- Keep Terra as the default for medium implementation, Sol for complex races and
  cross-module work, and Astra for architecture, risk, acceptance, and final review.
- Spark implementations require independent review by an uninvolved Terra, Sol,
  or Astra. Passing tests alone does not close the business contract.
- Do not assign Spark sole ownership of persistence, account lifecycle, asynchronous
  races, timer recovery, migrations, deletion/recovery, security, payments, deployment,
  architecture, screenshot-based visual judgment, or final acceptance.
- Report model/launch failures explicitly; never label a fallback model as Spark.
- If the runtime reports Spark quota exhaustion or a usage-window limit, the parent
  is authorized to continue the same bounded task with `gpt-5.5` without asking again.
  Use the reported reset time when available; do not infer exhaustion from elapsed
  session time, a generic network failure, or an unsupported-tool error.
- Preserve the original role's instructions, sandbox, allowed files, acceptance
  conditions, and independent Terra/Sol/Astra review when falling back. Use a fresh
  generic worker explicitly configured for `gpt-5.5`; do not reuse a Spark-pinned
  custom role and assume a spawn model override supersedes its TOML.
- Before retrying interrupted implementation, inspect git status/diff and completed
  work so the fallback does not overwrite changes or repeat completed actions.
  Record the quota reason and actual model as `gpt-5.5 (Spark quota fallback)`.
  If GPT-5.5 also fails, report it; do not silently cascade or retry indefinitely.
- These are parent dispatch rules, not a claim that Codex automatically changes
  models or that a quota-exhaustion fallback has already been tested.

The project-owned `.codex/agents/spark-explorer.toml` and
`.codex/agents/spark-ui-fixer.toml` are standalone custom agents, maintained separately
from generated Workflow V2 templates. Preserve them when regenerating agents; do not
set the generator's shared `CODEX_FAST_MODEL` to Spark to enable these specialists.
File configuration does not establish successful runtime model access; verify actual
agent/model selection in an authorized parent session before claiming Spark execution.

CLI 0.135 compatibility: `.codex/config.toml` explicitly registers these two role
names without changing concurrency/depth defaults. For CLI delegation smoke checks,
use a persisted session with `--enable multi_agent_v2`; `--ephemeral` cannot resolve
the parent thread in this version. Spawn with the exact `agent_type` and
`fork_turns = "none"`. Both role files disable inherited `image_generation`, which
Spark rejects. These CLI checks do not add Spark to an already-running app's tool schema.
On this installation project-only discovery still returned `unknown agent_type`;
use the explicit per-invocation role registration in the runtime receipt below.
Do not run the agent generator with `--force` unless custom `[agents.*]` registrations
are preserved/restored: its default config template overwrites this file.
Runtime evidence and reproducible invocation: `docs/reviews/spark-agent-runtime-20260911/README.md`.

### 2.3 Sandbox mode

Each `.toml` agent includes `sandbox_mode` sourced from the template's
`codex_sandbox_mode` field:

- `read-only`: review, verify, loop agents — cannot write files
- `workspace-write`: plan, build, fix, diagnose, ship agents — can write

### 2.4 Agent / skill tracking

Project-level agent, skill, and workflow settings are repository state and must
be Git-tracked, committed, and pushed when they should work on another machine.
Do not rely on local-only copies under `~/.codex`, `~/.claude`, plugin caches,
or generated files that were never committed.

The tracked sync surface includes at least:

- `.agents/`
- `.claude/agents/`, `.claude/agents-v2/`, `.claude/skills/`
- `.codex/agents/`, `.codex/skills/`, `.codex/config.toml`
- `.cursor/agents/`, `.cursor/rules/`
- `.teams/skills/`
- `docs/workflow/_portable/`
- `docs/workflow/project/workflow.md`
- `docs/workflow/project/multi-machine-development.md`
- `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/handoff.mdc`

Before finishing a workflow/agent/skill change, audit for project-level
untracked files:

```bash
git ls-files -o --exclude-standard .agents .claude .codex .cursor .teams docs/workflow/_portable docs/workflow/project AGENTS.md CLAUDE.md
```

If the change is intended to apply on another computer, push it after commit.

### 2.5 Multi-machine development

GitHub is the exchange source of truth for all recoverable project work. Follow
`docs/workflow/project/multi-machine-development.md` whenever more than one
computer or worktree may continue the project.

- One writable short branch belongs to one machine/worktree at a time; use
  sibling branches when two computers work on the same feature.
- Before switching computers or ending a session, commit and push all
  recoverable work. A local stash, reflog entry, hidden ref, untracked source,
  or chat transcript is not a handoff.
- Keep secrets outside Git and maintain tracked names-only `.env.example`
  templates plus a documented secure restore channel.
- Run `pnpm git:sync-check -- --fetch` at normal handoff and add `--deep` before
  migration or cleanup. Do not delete local recovery state merely to make the
  check pass.
- Independent long-lived product branches remain intentionally divergent; this
  rule never authorizes a bulk merge or D3 bypass.

### 2.6 Personal developer dashboard

The local personal developer dashboard is the project-system cockpit at
`docs/prototypes/dev-dashboard/index.html`. Machine-facing rules live in
`docs/workflow/project/dev-dashboard.md`; use the `xai-dev-dashboard-sync` skill
when checking or refreshing whether Overview reflects the current branch, dirty
files, key docs, skills, agents, and release-log state, and when checking
whether the machine contract or reusable dashboard template needs alignment.

---

## 3. Product Module Routing (classify every task first)

Before starting any dev task, classify it into exactly one of the six product
modules, then use that module's branch + skill + workflow. The authoritative
router (the six-module table with task-attribution signals, plus the
`web→app` D3 gate / `syncScope` / PROPOSED-line rules) is **`CLAUDE.md`
§"Product module map & task routing"**, and the full per-module navigation
(开发目标 / 绑定 skill / prompt 模板 / 开发 workflow / 进入下一模块的触发条件 /
影响的模块) is **`docs/PRODUCT_MODULE_MAP.md`** (mirrored in the dev-dashboard
产品结构图). Quick reference:

- `web` → `apps/web/`, branch `codex/web/<feature>`→`web`.
- `app` → Mac shell / Web container in `apps/desktop/` (single Web SPA main window + native chrome; host process may implement native commands), branch `codex/desktop/<feature>`→`desktop-next`→`dev`.
- `plugin` → desktop plugin platform/runtime + widget/plugin packages (multi-window / overlay / click-through / grid persistence product ownership lives here even when code is physically in the Tauri host), branch `codex/plugin/<feature>`→`desktop-plugin-next`; G1 platform-runtime/window-command anchor is active gate, concrete plugin packages are paused until G1 ships.
- `sync` → account cloud-sync, branch `codex/sync/<feature>` (paused; only `syncScope: account-sync`).
- `site` → official website (Cloudflare), branch `codex/site/<feature>` (PROPOSED — needs operator OK).
- `admin` → Admin/Control Plane prototype + roadmap, branch `codex/admin/<feature>` (operator-activated · roadmap-gated; start with `xai-admin-dashboard-shell`).

`web→app` only flows through the D3 gate (`xai-web-to-desktop-sync`); never merge
Web changes straight into `dev`. Do not open new work branches for `site`
without operator confirmation. Admin work is operator-confirmed but must stay
inside the admin roadmap gates. Future iPhone / iPad / Apple Watch / Android /
browser-extension surfaces are planning-only in
`docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`; do not classify them as active
module targets or open work branches without operator confirmation.
`desktop-plugin-next` already exists; creating `desktop-next` /
`release/desktop/<version>`, advancing to `dev`, or starting a release branch
still requires explicit operator confirmation.

---

## 4. Cross-Platform Rule Sync

| File | Platform | Handoff display rule |
|------|----------|---------------------|
| `CLAUDE.md` §Workflow V2 Subagent Output Display | Claude Code | Task tool return — do not rewrite |
| `AGENTS.md` §1 (this file) | Codex | Built-in agent-spawn return — do not rewrite + inline fallback |
| `.cursor/rules/handoff.mdc` V2.x | Cursor | Inline execution — final response must be Handoff block |

**Any change to Handoff display rules must be synced across all three files.**

Module-routing rules are shared too: `CLAUDE.md` §"Product module map & task
routing" (authority) ↔ `AGENTS.md` §3 (this file) ↔
`.cursor/rules/product-module-routing.mdc` ↔ `docs/PRODUCT_MODULE_MAP.md`.

---

## 5. Codex + Claude Code Parallel Use

Use `docs/workflow/project/workflow.md` as the shared policy for running both
tools in this repo.

Codex-specific reminders:

- `A-Codex` is the Codex-primary long-running Automation Mode. Use it when the
  current Codex session is the lead runtime for plan/build/verify. Use
  `D-Codex` only when another lead delegates implementation phases to Codex as
  an external executor.
- `claude --bg` and Agent View are Claude Code paths, not Codex background
  automation. In Codex, prefer roadmap `emit` or `serial` unless the CLI hook
  path is explicitly being tested. The post-commit hook may launch Claude review
  / verify only through opt-in `scripts/cowork/dispatch_claude.sh`
  (`CW_ENABLE_CLAUDE_BG=1` or `git config cowork.claudeBg true`); the hook never
  treats launch success as a cross-vendor PASS.
- If agent-spawn depth is unavailable, execute the subagent instructions inline.
  In that case, the current session is the subagent and its final response must
  be only the `## Handoff` block.
- Before editing in a shared worktree, check `git status --short` and avoid
  files that another tool already has dirty. Stage exact files only.

</provided_complete_governance_input>

<provided_complete_governance_input path="CLAUDE.md" sha256="6597e484cb5bde938fadb3c728f2e76c6228364584306a453655eeebd1e61ffb">
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

</provided_complete_governance_input>

<provided_complete_governance_input path="docs/workflow/project/workflow.md" sha256="99bb429d2a9facd7cebfbcb52e97c7ccea648d19953e05e10f824189f6b9f050">
# Codex + Claude Code Parallel Workflow

> Project-layer workflow for running XAI_Desktop with both Codex and Claude Code.
> `CLAUDE.md` remains the Claude Code auto-loaded rule file. `AGENTS.md`
> remains the Codex auto-loaded rule file. This document is the shared human
> operating guide for using both tools in the same repository without drifting
> state or overwriting each other.

---

## 1. Current Fit Gap

The existing Workflow V2 implementation is usable from Codex, but several parts
still read as Claude Code-first:

1. The default examples say "Start the ... agent" and assume Claude Code's Task
   tool is the lead runtime.
2. The original portable matrix only had `A-Claude` as the single-IDE mode,
   which left long-running Codex-primary development without a first-class
   Automation Mode.
3. `claude --bg`, Agent View, and Claude background sessions are Claude Code
   features. Codex should not treat them as Codex automation.
4. `feature-dev-loop`, `bugfix-loop`, and full-loop meta-orchestrators can hit
   nested-spawn limits. Codex must be allowed to execute the same subagent
   contract inline when agent depth is exhausted.
5. The conflict model for two tools editing the same worktree was implicit.
   It must be explicit: one writer owns a file set at a time, and reviewers do
   not silently repair the writer's work inside the same phase.

The fix is to keep the portable V2 state machine, add `A-Codex` as a first-class
single-IDE/lead mode, and keep `D-Codex` reserved for "another lead delegates
implementation to Codex".

---

## 2. Document Structure

Use this structure going forward:

| File | Owner | Purpose |
|---|---|---|
| `CLAUDE.md` | Claude Code | Auto-loaded Claude rules: architecture, module routing, Claude Task/handoff behavior, agent generation notes. |
| `AGENTS.md` | Codex | Auto-loaded Codex rules: handoff display, Codex runtime, Codex fallback behavior, routing reminders. |
| `docs/workflow/project/workflow.md` | Shared | Unified Codex + Claude Code collaboration workflow. This file is the coordination source for humans. |
| `docs/workflow/project/usage-guide.md` | Shared | Hands-on cookbook for XAI paths, feature/full-loop usage, roadmap-loop, hooks, dashboard. |
| `docs/workflow/SUBAGENT_WORKFLOW_V2.md` | Shared | XAI's concrete V2 state machine and agent matrix. |
| `docs/workflow/_portable/` | Portable spec | Cross-project source spec. Do not hand-edit in XAI except through resync. |

Do not add a top-level `codex.md`: Codex already auto-loads `AGENTS.md`.
Do not add `cloud.md`: there is no current Cloud workflow entrypoint in this
repo. If "cloud" means Claude Code, update `CLAUDE.md` and link here.

---

## 3. Legal Automation Modes

Legal Workflow V2 Automation Modes are:

```text
A-Claude
A-Codex
B-Codex
B-Cursor
C-Codex
C-Cursor
D-Codex
D-Cursor
D-Codex+Cursor
```

Rules:

- `A-Claude` means the full loop runs inside Claude Code. It is not a generic
  "single tool" placeholder.
- `A-Codex` means the full loop runs under Codex as the lead runtime. In a
  long-running Codex session, this is the normal "stay in Codex and drive the
  V2 state machine" mode.
- `D-Codex` means a non-Codex lead delegates implementation phases to Codex
  through the external executor path. Do not use `D-Codex` as a substitute for
  Codex-primary long-running development.
- `B-Codex` and `C-Codex` require the event-driven hook/CLI path to be verified.
  Prefer `D-Codex` for normal Codex delegation.
- `Verify Cross-vendor: yes` remains the default for meaningful implementation
  work. The writer and verifier should be different tools when practical.

---

## 4. Codex Workflow

Codex has three supported paths.

### 4.1 A-Codex — Codex Lead Long-Run

Use this when the user is already in Codex and wants the roadmap or feature to
continue here for a long time.

```text
Automation Mode: A-Codex
Verify Cross-vendor: yes
```

Semantics:

- Codex is the lead runtime for intake, plan, review-loop, build/fix, verify,
  and the pre-ship handoff.
- No `codex exec` delegation is required; the current Codex session may spawn
  Codex subagents when available.
- If agent-spawn depth is unavailable, the current Codex parent session executes
  the next V2 role inline while preserving that role's output contract.
- The pipeline still stops before `ship`; ship remains a separate human-triggered
  gate.
- In roadmap-loop, pair `A-Codex` with `dispatch: serial` for current-session
  execution or `dispatch: emit` when you want pasteable feature blocks.

### 4.2 Codex Level 1 Inline

This is the fallback execution technique inside `A-Codex` when the current Codex
session cannot spawn the next worker cleanly.

```text
1. Classify the product module.
2. Read the owning docs and dev_log.md.
3. Execute the next V2 role inline:
   - feature-plan / bug-diagnose may write planning docs and Status Panel.
   - feature-build / bug-fix may edit code and create scoped commits.
   - feature-review / feature-verify should stay read-only unless explicitly
     asked to fix.
   - ship may push only after READY_TO_SHIP.
4. Preserve the subagent Output Contract. If acting as the subagent, the final
   response is only the `## Handoff` block.
```

Use this path to implement the `A-Codex` contract without requiring a nested
meta-orchestrator.

### 4.3 Codex as External Executor

Use this when Claude Code or roadmap-loop remains the lead coordinator and
Codex is delegated implementation work.

Preferred mode:

```text
Automation Mode: D-Codex
Verify Cross-vendor: yes
```

Operational constraints:

- `codex` CLI must be authenticated and available if the path uses headless
  dispatch.
- Codex writes only the assigned feature/phase scope and updates the relevant
  docs.
- The lead tool reads `dev_log.md` after Codex finishes and dispatches verify.
- If Codex hits quota or cannot spawn workers, write a precise Blocker instead
  of silently switching to another tool.

---

## 5. Claude Code Workflow

Claude Code remains the most complete native V2 lead runtime in this repo.

Use Claude Code for:

- `A-Claude` single-IDE loops.
- `claude --bg` / Agent View roadmap background sessions.
- Optional hook-launched cross-vendor review/verify via
  `scripts/cowork/dispatch_claude.sh`, only after `CW_ENABLE_CLAUDE_BG=1` or
  `git config cowork.claudeBg true` is set for the checkout.
- Native Task-spawn orchestration when depth is sufficient.
- Cross-vendor review/verify when Codex wrote the implementation.

Claude Code constraints:

- Do not assume spawned meta-orchestrators can spawn more workers. If Task depth
  blocks a loop, return to the parent session and dispatch workers manually.
- Do not treat `claude --bg` launch success as review/verify success. The
  session must write the normal `dev_log.md` verdict and receipt evidence.
- Do not paraphrase subagent Handoff blocks.
- Do not run `ship` until the feature or bugfix is `READY_TO_SHIP` and the
  human intentionally starts ship.

---

## 6. Collaboration Workflow

The shared state is files, not chat context.

| Workflow role | Default owner | Alternative owner | Rule |
|---|---|---|---|
| Intake / feature brief | Either | Either | Write the brief once; do not maintain competing briefs. |
| Plan | Claude Code for high-risk architecture | Codex inline for repo-local docs/code tasks | Plan writes `NEEDS_REVIEW`; another tool reviews when practical. |
| Review | Tool that did not plan | Same tool only for low-risk docs | Review is read-only. If it finds blockers, write them to `dev_log.md`. |
| Build / fix | Codex for broad mechanical edits and tests | Claude Code for architecture-sensitive or bg-owned work | One writer owns a phase. No parallel edits to the same files. |
| Verify | Tool that did not build | Same tool only with explicit opt-out | Verify is read-only and records exact commands/results. |
| Ship | One chosen owner | None in parallel | Ship stages exact files, checks unrelated dirty work, commits/pushes only the scoped work. |

For normal parallel work:

1. Split work by feature/package or by roadmap row.
2. Use separate branches or worktrees for simultaneous writers.
3. Keep `dev_log.md` as the handoff authority.
4. Use Handoff blocks verbatim when moving between tools.
5. Cross-check implementation with the other tool before ship.

---

## 7. Branch, Commit, and File Ownership

### Branches

- Use the product module router before creating work branches.
- Web work uses `codex/web/<feature>` and lands on `web`.
- Desktop app work uses `codex/desktop/<feature>` and lands through
  `desktop-next` to `dev`.
- Plugin work uses `codex/plugin/<feature>` and lands on
  `desktop-plugin-next` while that line is active.
- `site` remains PROPOSED; get operator confirmation before opening new work
  branches.
- `admin` is operator-activated but roadmap-gated; use `codex/admin/<feature>`
  only through `docs/workflow/roadmap/xai-admin-dashboard-system-integration.md`,
  starting with `xai-admin-dashboard-shell`.

### Shared Worktree Rules

Before writing, every tool must check:

```bash
git status --short
git diff --name-only
```

Rules:

- Do not overwrite unrelated dirty files.
- Do not run repo-wide formatters in a dirty shared worktree.
- Stage exact files only.
- If another tool has dirty changes in a file you must edit, stop and ask for
  ownership unless the needed change can be made without touching that file.
- Re-run `git status --short` immediately before commit or handoff.

### Commits

- The writer creates implementation commits for its assigned phase.
- Review and verify do not amend writer commits unless explicitly asked.
- Commit messages follow `docs/conventions/COMMIT_CONVENTION.md`.
- Workflow/agent/skill changes must include tracked project surfaces when they
  are meant to work on another machine:

```bash
git ls-files -o --exclude-standard .agents .claude .codex .cursor .teams docs/workflow/_portable docs/workflow/project AGENTS.md CLAUDE.md
```

### Multi-machine closeout

When another computer may continue the work, use
`docs/workflow/project/multi-machine-development.md` as the authority. Each
writable short branch has one active machine/worktree owner; parallel machines
use sibling branches. A session is not handed off until its recoverable
checkpoint is committed and pushed.

```bash
pnpm git:sync-check -- --fetch
```

Use `--deep` before moving machines or deleting a worktree. A stash, reflog,
hidden ref, untracked source file, or local application history must never be
the only copy of project work. Secret values remain outside Git and use a
documented secure restore channel.

---

## 8. Review Policy

For Codex + Claude Code parallel development, review has three levels:

| Level | When | Reviewer |
|---|---|---|
| Local self-check | Every phase | Same tool runs focused tests and status audit. |
| Cross-tool verify | Feature build/fix complete | The other tool reads code and runs verification. |
| Ship gate | `READY_TO_SHIP` | `ship` checks commit scope, docs, tests, branch target, and push readiness. |

Review findings should be written to the owning `dev_log.md` or review artifact,
not left only in chat. A reviewer may suggest fixes, but the phase writer or an
explicit follow-up fix role should make the change.

---

## 9. Recommended Defaults

Use these defaults unless the user says otherwise:

| Situation | Recommended path |
|---|---|
| Small repo/doc fix in current Codex session | `A-Codex` or Codex Level 1 inline + focused verification. |
| High-risk architecture/security/native work | `A-Claude` plan/review plus cross-vendor verify. |
| Broad TypeScript implementation with clear plan | Claude Code lead + `D-Codex` build + Claude verify. |
| Roadmap decomposition | `/xai-roadmap-loop mode: init`, review manifest, then `emit` or `serial`. |
| Roadmap parallel execution in Claude Agent View | `/xai-roadmap-loop` run with `bg` after preflight. |
| Current-session Codex roadmap execution | `Automation Mode: A-Codex` + `dispatch: serial`; use `emit` when you want pasteable feature blocks. |
| Non-Codex lead wants Codex implementation | `D-Codex` with `Verify Cross-vendor: yes`. |

---

## 10. Update Plan for This Repo

The project workflow should now be maintained as:

1. Keep `CLAUDE.md` and `AGENTS.md` as the auto-loaded tool entrypoints.
2. Keep `docs/workflow/project/usage-guide.md` as the hands-on XAI cookbook.
3. Use this file as the shared Codex + Claude Code collaboration policy.
4. Add links from top-level tool entrypoints and V2 docs to this file.
5. Do not add top-level `codex.md` or `cloud.md` unless a future tool requires
   that exact filename for auto-loading.

</provided_complete_governance_input>

<provided_complete_governance_input path="docs/reviews/20260908-full-product-audit/parallel-control-r1/authority-overlay.md" sha256="184ebab89778a4ebfd837d72bd299f882d8b121893c1b897e8ba8482c3f49583">
# 原 goal 的并行执行补充 · operator authorized 2026-10-10

原goal附件 `/Users/lijinlong/.codex/attachments/5ad08a9a-b470-446f-9ee0-205f5ffb672a/goal-objective.md` SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615` 保持不可变。本次用户指令明确取代其全局“一次只做一个有界批次”和“下一个单一批次”限制，授权一个总控、四流、dependency-driven parallel agents及必要worktrees。所有未被明确替换的模块、证据、独立执行、保护、发布与台账规则继续。普通cherry-pick兄弟提交的接收技术修订见scheduler§6；不merge/rebase。

M+G+B仅在原213aafd两份proposal限定范围条件生效：新hash-bound测量副本与字段级Reloadoracle→完整资格及独立审查后采用→完整有效原P0before→严格两个CSS的Clock geometry修复→独立geometry acceptance→versionedbaseline addendum与E1-E5→原已授权Clock完整实施/验证。canonicalr2/source/hash/oldlogs不可覆盖；不弱化测量标准、不扩共享CSS、不绕acceptance。其他authorized范围技术修订须独立impact审查，不能改变owner决定或降低验收。

任务分区模块为web(project-system)，不把审计control plane误归admin。每产品子任务仍按scope-map原唯一module+gate路由。Verify Cross-vendor: yes保留项目默认和既有实际门禁；不能将fresh Codex instance报为跨vendor证据。

Goal API在本检查点返回status=blocked，objective仍是旧文本；公开update_goal仅支持complete/blocked/paused、不支持编辑或resume。用户本次明确恢复/重排的授权由本文件和CURRENT-CONTROL-PLANE承载并立即执行；未伪造工具active或complete状态。runtime metadata限制不阻止手动持续调度。

正式统计13 completed /3 verification_pending /3 in_progress /293 pending，299unclosed。范围全312原action/acceptance/旧evidence无遗漏；目标仍未完成。四份prompt是同一goal的工作流，不创建四个独立app goal/controller。

</provided_complete_governance_input>

REQUIRED: Read each complete provided governance block above (exact committed bytes, not summary). Final report explicit complete-input census of these four blocks; distinguish provided text read from tool file read. You may also read files. Original goal must still be read first at its exact path. Prior vendor2 source541a016fa64051a0b952e6c87ea839de99cc623d gave documentary APPROVED but explicitly skipped AGENTS/CLAUDE, so root withheld acceptance. Do not repeat or waive the gap. This is final cumulative3/3, no fourth automatic attempt. Full five docs/D1-D7/approvedcontract/completebefore/fourfullhistoricalreports/source/tests mandatory; missing input=BLOCKED, no repairs.
