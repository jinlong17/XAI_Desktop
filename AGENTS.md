# AGENTS.md — Codex Session Rules for XAI_Desktop

> This file is auto-loaded by Codex at session start. It governs how the
> Codex parent session handles Workflow V2 subagent output.
>
> For shared project rules (architecture, code boundaries, conventions, testing),
> see `CLAUDE.md` — those apply to all platforms and are not duplicated here.

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
- `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/handoff.mdc`

Before finishing a workflow/agent/skill change, audit for project-level
untracked files:

```bash
git ls-files -o --exclude-standard .agents .claude .codex .cursor .teams docs/workflow/_portable AGENTS.md CLAUDE.md
```

If the change is intended to apply on another computer, push it after commit.

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
- `app` → `apps/desktop/` (Tauri), branch `codex/desktop/<feature>`→`desktop-next`→`dev`.
- `plugin` → desktop plugin/widget slots, branch `codex/plugin/<feature>`→`desktop-plugin-next` (paused).
- `sync` → account cloud-sync, branch `codex/sync/<feature>` (paused; only `syncScope: account-sync`).
- `site` → official website (Cloudflare), branch `codex/site/<feature>` (PROPOSED — needs operator OK).
- `admin` → Admin/Control Plane prototype, branch `codex/admin/<feature>` (PROPOSED — needs operator OK).

`web→app` only flows through the D3 gate (`xai-web-to-desktop-sync`); never merge
Web changes straight into `dev`. Do not open new work branches for `site`/`admin`
without operator confirmation.

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
