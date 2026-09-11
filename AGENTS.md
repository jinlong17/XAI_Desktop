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
