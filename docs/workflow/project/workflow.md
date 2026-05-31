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
2. `A-Claude` is the only legal single-IDE Automation Mode. There is no
   `A-Codex` variant in the portable matrix.
3. `claude --bg`, Agent View, and Claude background sessions are Claude Code
   features. Codex should not treat them as Codex automation.
4. `feature-dev-loop`, `bugfix-loop`, and full-loop meta-orchestrators can hit
   nested-spawn limits. Codex must be allowed to execute the same subagent
   contract inline when agent depth is exhausted.
5. The conflict model for two tools editing the same worktree was implicit.
   It must be explicit: one writer owns a file set at a time, and reviewers do
   not silently repair the writer's work inside the same phase.

The fix is not to rename the whole workflow around Codex. The fix is to keep
the portable V2 state machine and add clear tool-specific entry points plus a
shared concurrency contract.

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
- `A-Codex` is invalid. If a prompt contains `Automation Mode: A-Codex`,
  normalize it before execution:
  - use `A-Claude` only when the intended owner is Claude Code single-IDE mode;
  - use `D-Codex` when Codex should be the external build executor;
  - use "Codex Level 1 inline" when the current Codex session should run the
    manual V2 sequence itself.
- `B-Codex` and `C-Codex` require the event-driven hook/CLI path to be verified.
  Prefer `D-Codex` for normal Codex delegation.
- `Verify Cross-vendor: yes` remains the default for meaningful implementation
  work. The writer and verifier should be different tools when practical.

---

## 4. Codex Workflow

Codex has two supported paths.

### 4.1 Codex Level 1 Inline

Use this when the user is already in a Codex session and wants the work done
here, or when nested agent spawn is unavailable.

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

Use this path instead of inventing `A-Codex`.

### 4.2 Codex as External Executor

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
- Native Task-spawn orchestration when depth is sufficient.
- Cross-vendor review/verify when Codex wrote the implementation.

Claude Code constraints:

- Do not assume spawned meta-orchestrators can spawn more workers. If Task depth
  blocks a loop, return to the parent session and dispatch workers manually.
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
- `site` and `admin` remain PROPOSED; get operator confirmation before opening
  new work branches.

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
| Small repo/doc fix in current Codex session | Codex Level 1 inline + focused verification. |
| High-risk architecture/security/native work | `A-Claude` plan/review plus cross-vendor verify. |
| Broad TypeScript implementation with clear plan | Claude Code lead + `D-Codex` build + Claude verify. |
| Roadmap decomposition | `/xai-roadmap-loop mode: init`, review manifest, then `emit` or `serial`. |
| Roadmap parallel execution in Claude Agent View | `/xai-roadmap-loop` run with `bg` after preflight. |
| Current-session Codex roadmap execution | Use `emit` or `serial`; do not request `claude --bg`. |
| User provides `A-Codex` | Correct it before run; choose `D-Codex` or Codex Level 1 inline. |

---

## 10. Update Plan for This Repo

The project workflow should now be maintained as:

1. Keep `CLAUDE.md` and `AGENTS.md` as the auto-loaded tool entrypoints.
2. Keep `docs/workflow/project/usage-guide.md` as the hands-on XAI cookbook.
3. Use this file as the shared Codex + Claude Code collaboration policy.
4. Add links from top-level tool entrypoints and V2 docs to this file.
5. Do not add top-level `codex.md` or `cloud.md` unless a future tool requires
   that exact filename for auto-loading.
