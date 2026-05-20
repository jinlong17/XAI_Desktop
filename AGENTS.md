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

---

## 3. Cross-Tool CLI Dispatch

This machine has Claude Code, Codex CLI, and Cursor CLI installed.
**When the user asks to use another tool (e.g. "让 claude review 一下", "用 cursor 去改"),
invoke it directly via shell. Do NOT refuse or suggest manual copy-paste.**

| Tool | Command | Output |
|------|---------|--------|
| Claude Code | `claude -p "<prompt>" --allowedTools "Read Glob Grep" > out.md` | stdout |
| Cursor | `cursor agent --trust "<prompt>" > out.md` | stdout |

Output goes to `docs/reviews/<feature>/`. Details: `docs/workflow/project/usage-guide.md` §11.

---

## 4. Cross-Platform Rule Sync

| File | Platform | Scope |
|------|----------|-------|
| `CLAUDE.md` §Workflow V2 Subagent Output Display | Claude Code | Handoff display |
| `CLAUDE.md` §Cross-Tool CLI Dispatch | Claude Code | CLI dispatch |
| `AGENTS.md` §1 (this file) | Codex | Handoff display |
| `AGENTS.md` §3 (this file) | Codex | CLI dispatch |
| `.cursor/rules/handoff.mdc` | Cursor | Handoff display |
| `.cursor/rules/cli-dispatch.mdc` | Cursor | CLI dispatch |

**Any change to these rules must be synced across all three files.**
