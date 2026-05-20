# 01 — Subagent Workflow Model (Portable)

> **Portable layer.** This file is project-agnostic. It defines the paradigm:
> task-typed subagent pipelines, doc-driven handoff, breakpoint continuity,
> human gates, and the cross-tool generation script model.
> Source: extracted from the original `COMMON_SUBAGENT_WORKFLOW_TEMPLATE.md` (§1-8, §11-19).
> Companion: `02-handoff-and-state.md` (handoff contract + state protocol).
> Placeholders like `<feature_root>`, `<review_root>`, `<step0-skill>` are defined in `00-PORTABLE-MANIFEST.md`.

Version: `v1.1` (portable extraction 2026-05-13)

---

## 1. What this is

This is not a project's implementation detail — it is a **cross-project reuse manual**.

It solves problems like:

- You don't want to keep using a generic `analyze -> implement -> test -> summarize -> ship` pipeline
- You want the workflow split by task semantics ("new feature dev" vs "bugfix")
- You want Claude Code / Codex / Cursor to share one subagent architecture
- You want executors to hand off through shared documents, not chat context
- You want agent definitions batch-generated from templates + a script, not three hand-written configs

Recommended adoption path:

1. Read this file + `02-handoff-and-state.md`, decide if the structure fits your project
2. Write a project-local `SUBAGENT_WORKFLOW_V2.md` (the concrete instance — see `../project/` for an example)
3. Prepare `<templates_dir>/` (start from `templates/` in this folder) and `<project_background_file>`
4. Run the generation script to produce Claude / Codex / Cursor configs

---

## 2. Applicability

Fits projects that:

- Have both "feature development" and "bug fixing" as typical task types
- Need multi-round human confirmation / review / verify
- Need multi-tool collaboration
- Treat agents as long-lived project infrastructure

Does not fit:

- One-off small-task repos with no long-term maintenance
- Small prototypes that don't need review / verify / ship separation
- Codebases with no stable docs directory and no willingness to maintain a state file

---

## 3. Core design principles

### 3.1 Split by task type, not by generic role

Keep at least two pipelines:

- New feature development workflow
- Bug fixing workflow

Do not funnel every task into one generic pipeline.

### 3.2 Decouple subagents from skills / rules / repo guidance

- **Subagent**: advances the workflow
- **Skill / Rule / AGENTS.md / Repo Guidance**: long-term knowledge, constraints, techniques

A subagent must not depend on a particular skill to run. A skill may be a reference source, but not a runtime prerequisite.

### 3.3 Document-driven handoff

Executors do not relay context through chat. They relay through shared documents:

- discovery review
- design
- api
- test
- dev_log

### 3.4 Breakpoint continuity is built in

Every subagent, on startup, must auto-decide one of:

`Fresh` / `Continue` / `Review` / `Revise` / `Wait` / `Block` / `Done`

(Detailed semantics in `02-handoff-and-state.md` §1.)

### 3.5 Keep a human confirmation point at every step

Recommended gates: plan review gate, build phase gate, verify gate, ship gate.

In particular, `feature-build` should default to **one phase per run**, then stop for human confirmation. When you need to auto-complete multiple phases, use a separate `feature-auto-build` — do not loosen `feature-build`'s single-phase constraint. Bugfix is symmetric: `bug-fix` defaults to a single fix step; batch sub-fixes go to `bug-auto-fix`.

---

## 4. Recommended workflow structure

### 4.0 Step 0: Requirement Brief Normalization (front gate)

Before entering the Feature Dev / Bugfix workflow, route through **Step 0 — requirement normalization**.

Step 0 is not a subagent — it is a **skill-form input gate** (the `<step0-skill>` skill). Its job:

- Collapse a vague requirement into a structured brief (motivation / goal / scope / non-goals / constraints / risks)
- Explicitly record unknowns, dependency status, mock strategy, QA Gate result
- Decide whether the next step is discovery or planning directly
- Produce `<review_root>/<feature>/<YYYYMMDD>-feature-brief.md` (if the canonical target is undecided, land it under `<review_root>/_intake/` first)

Core value: stop `feature-plan` / `bug-diagnose` from guessing requirements and drifting scope. Any **new feature** or **batch idea with multiple requirement points** should go through Step 0 first; clear small patches / deltas skip it. Full spec: `03-step0-brief-spec.md`.

### 4.1 Feature Dev workflow

Six subagents (`feature-auto-build` is the optional batch path), with Step 0 as the front gate:

```text
Step 0 (<step0-skill>) ─→ feature-plan -> feature-review -> feature-build -> feature-verify -> ship
Step 0 (<step0-skill>) ─→ feature-plan -> feature-review -> feature-auto-build -> feature-verify -> ship
```

### 4.2 Bugfix workflow

Five subagents (`bug-auto-fix` is the optional batch path):

```text
bug-diagnose -> bug-fix -> bug-verify -> ship
bug-diagnose -> bug-auto-fix -> bug-verify -> ship
```

Bugfix usually skips Step 0 (`bug-diagnose` already normalizes the bug description), but if a bug report is very vague or bundles multiple independent defects, run Step 0 first to split the brief.

### 4.3 Why split this way

- `feature-review` is kept separate because it is usually best done by a *different* executor (cross-review)
- `feature-verify` is kept separate because verify must not be mixed into the build agent
- `ship` is kept separate because commit / push is a delivery gate, not an implementation step
- `bug-diagnose` and `bug-fix` are split to avoid "guessing root cause while writing the fix"

---

## 5. Feature Dev pipeline overview

```text
┌──────────────┐ human ┌──────────────┐ human ┌────────────────┐ human ┌──────────────┐ human ┌────────────────┐ human ┌────────┐
│ Step 0       │ ────→ │ feature-plan │ ────→ │ feature-review │ ────→ │ feature-build│ ────→ │ feature-verify │ ────→ │  ship  │
│ <step0-skill>│       └──────────────┘       └────────────────┘       └──────────────┘       └────────────────┘       └────────┘
└──────────────┘
  requirement norm.    discovery report      plan review            one phase / run        independent verify     commit / push
  QA gate / unknowns   dependency scan       APPROVED / REVISE      tests + doc sync       READY_TO_SHIP/BLOCKED  detailed commit body
  *-feature-brief.md   contract + phased plan                       stop for human confirm  risk summary           push confirmation
```

### 5.0 `<step0-skill>` (Step 0 — front gate)

Responsibilities:

- Normalize a vague requirement into a structured brief (motivation / goal / scope / non-goals / constraints / risks / unknowns / dependency status / mock strategy)
- Run the QA Gate, decide whether the requirement may enter `feature-plan`
- Produce `<review_root>/<feature>/<YYYYMMDD>-feature-brief.md` (land in `<review_root>/_intake/` if the name is undecided; `feature-plan` migrates it later)

Constraints:

- Does not replace `feature-plan`'s discovery; only normalizes the input
- Does not write `design.md` / `api.md` / `test.md` — those stay with `feature-plan`
- Does not create `dev_log.md` — `feature-plan` initializes it once the target is fixed

Invocation: triggered as a skill; not a subagent, no enforced Handoff contract.

### 5.1 `feature-plan`

Responsibilities:

- Extract the Feature Title and canonical target from the feature brief
- If the Step 0 brief landed in `_intake/`, migrate/rename it into the formal review directory once the canonical target is confirmed
- If technology selection or external dependencies are involved, use web search for candidates and cite sources in the research doc
- Produce the full discovery review (with search evidence)
- Write `design.md` (decision snapshot), `api.md`, `test.md`, and the `dev_log.md` phase plan

Key outputs:

- `<review_root>/<feature>/<YYYYMMDD>-feature-brief.md` (if a Step 0 brief exists)
- `<review_root>/<feature>/<YYYYMMDD>-discovery-review.md`
- `<feature_root>/<feature>/docs/design.md`, `api.md`, `test.md`, `dev_log.md`

### 5.2 `feature-review`

Responsibilities:

- Review the discovery report and design/api/test/dev_log
- Output `APPROVED` or `REVISE`

Return rules:

- On `REVISE`, do not rewrite the structural plan yourself
- Must return to `feature-plan`

### 5.3 `feature-build`

Responsibilities:

- Implement exactly one phase
- Run that phase's tests
- Commit per phase (record the commit hash)
- Update implementation facts and state

Constraints:

- One phase per run
- After a phase finishes, commit, then stop for human confirmation

### 5.4 `feature-auto-build`

Responsibilities:

- Auto-implement multiple PENDING/BLOCKED phases continuously
- Each phase still gets independent tests, independent commit, independent Work Log entry
- Record feature-specific evidence (dispatch list, matrix assertions, E2E trace)
- Stop before `feature-verify`

Constraints:

- Does not replace `feature-build`; manual step mode stays with `feature-build`
- Does not run final verify, does not push, does not ship
- Stops immediately and writes back to `dev_log.md` when any phase is BLOCKED

### 5.5 `feature-verify`

Responsibilities:

- Review each phase's change scope against commit history
- Run verification independently
- Check implementation consistency with design/api/test
- Output `READY_TO_SHIP` or `BLOCKED`

Return rules:

- On `BLOCKED`, return to `feature-build` or `feature-auto-build`

### 5.5b `bug-auto-fix`

Responsibilities:

- When `bug-diagnose`'s fix strategy lists multiple sub-fix steps, auto-complete all of them
- When `bug-verify` reports multiple BLOCKED failing scenarios, treat each as an independent sub-fix and batch-fix
- Each sub-fix gets independent tests, independent commit, independent Work Log entry
- Stop before `bug-verify`

Constraints:

- Does not replace `bug-fix`; single-step mode stays with `bug-fix`
- Does not run final verify, does not push, does not ship
- Stops immediately and writes back to `dev_log.md` when any sub-fix is BLOCKED

### 5.6 `ship`

Responsibilities:

- Check the workflow is already `READY_TO_SHIP`
- Verify commit completeness (main commits done by feature-build / bug-fix)
- Add commits for any missed small changes
- When invoked with a roadmap-loop background session id or worktree path, locate and verify that
  worktree itself; the developer should not need to manually run the worktree/git check sequence
- Push gate + write `SHIPPED` after pushing

### 5.7 Feature Reopen / Delta Iteration

After a feature is SHIPPED, when adding content:

| Situation | Path |
|-----------|------|
| Missed implementation/test/doc, still within original scope | Delta → back to `feature-build` or `feature-auto-build` |
| Involves design/contract/phase changes | Increment → back to `feature-plan` |
| Independent new capability | New feature workflow |
| Post-release defect | Bugfix workflow |

- **Delta path:** append a Delta Phase to `dev_log.md`, run `feature-build`/`feature-auto-build` → `feature-verify` → `ship`
- **Increment path:** `feature-plan` (Increment mode) → `feature-review` → build → `feature-verify` → `ship`. Increment mode does not redo discovery; it only appends an incremental plan.

### 5.8 Orchestrator subagents (auto-orchestration layer)

Provide one orchestrator subagent per workflow to auto-loop build/fix + verify:

- **`feature-dev-loop`**: one-shot start, auto-spawn `feature-auto-build`, then auto-spawn `feature-verify`. Reports but does not wait for human confirmation between. Auto-retries on BLOCKED / verify failure (max 3 rounds), then stops. Does not replace manual mode.
- **`bugfix-loop`**: one-shot start, auto-loop `bug-auto-fix` → `bug-verify`. Auto-spawn `bug-auto-fix` retry on verify BLOCKED (max 3 rounds). Precondition: `bug-diagnose` done.

**Orchestrator design principles:**

- Orchestrate only — do not write code, run tests, or write dev_log
- Coordinate through `dev_log.md` — read it before and after every spawn
- Never skip ship — ship always needs a manual human trigger
- Stoppable any time — auto-stop and report on BLOCKED

**Cross-tool spawn mechanism:**

- The orchestrator does not rely on "look up agent by name". It reads `<templates_dir>/<worker>.md`, strips the frontmatter, and injects the body as the spawned worker's prompt
- This way Claude Code, Codex, and Cursor all work
- `<templates_dir>/*.md` serves both as standalone agent definition and as the orchestrator's playbook source

---

## 6. Bugfix pipeline overview

```text
┌──────────────┐ human ┌─────────┐ human ┌────────────┐ human ┌────────┐
│ bug-diagnose │ ────→ │ bug-fix │ ────→ │ bug-verify │ ────→ │  ship  │
└──────────────┘       └─────────┘       └────────────┘       └────────┘
  reproduction         minimal fix+commit  commit review       verify commits
  impact analysis      regression tests    regression verify   push gate
  root cause           doc sync            READY_TO_SHIP/BLOCKED push confirmation
  fix strategy
```

### 6.1 `bug-diagnose`

Responsibilities: extract Bug Title and primary target; register the issue; minimal reproduction; impact analysis; root-cause classification; fix strategy.

Complex-defect escalation path — if the bug hits a core/feature boundary, a config-manifest/routing boundary, or has regressed multiple times, do **dual-perspective diagnosis**: external behavior chain + internal architecture-boundary chain.

### 6.2 `bug-fix`

Responsibilities: minimal-scope fix; add regression tests; commit the fix (record hash); sync docs.

### 6.3 `bug-verify`

Responsibilities: review fix scope against commit history; verify the original reproduction path, boundary paths, key paths; output `READY_TO_SHIP` or `BLOCKED`. On `BLOCKED`, return to `bug-fix`.

### 6.4 `ship`

Shared with the feature workflow.

---

## 7. Directory protocol

These paths are template placeholders:

```text
<review_root>/<feature_name>/<YYYYMMDD>-discovery-review.md
<feature_root>/<feature_name>/docs/design.md
<feature_root>/<feature_name>/docs/api.md
<feature_root>/<feature_name>/docs/test.md
<feature_root>/<feature_name>/docs/dev_log.md
```

Semantics:

- `discovery-review.md` — new feature's full research doc
- `design.md` — decision snapshot / dependency overview / finalized design
- `api.md` — interface contract / error semantics
- `test.md` — test strategy / mock strategy / acceptance scope
- `dev_log.md` — full-flow state machine and breakpoint-continuity carrier

If the project has no "feature" concept, substitute `<module_name>` / `<domain_name>` / `<task_name>`. A common mapping example — once `<review_root>` and `<feature_root>` are assigned this project's real root directories (see `00-PORTABLE-MANIFEST.md` §3.1), the template paths above expand to concrete on-disk paths like `<review_root>/billing/20260409-discovery-review.md` and `<feature_root>/billing/docs/design.md`.

---

## 8. Target-passing protocol

Do not assume every subagent receives a clear `<feature_name>` at start. The real entry point is usually a freeform description.

### 8.1 Entry-type subagents

`feature-plan` and `bug-diagnose`. They accept natural-language descriptions.

- `feature-plan` input: motivation / problem background, target outcome, scope / non-goals, constraints / dependency clues
- `bug-diagnose` input: symptom, reproduction clues, expected/actual result, candidate modules or impact scope

Entry-type subagents also: extract a Title, extract the canonical target, generate a short tag if needed, initialize directories or the state file.

### 8.2 Continuation-type subagents

`feature-review` / `feature-build` / `feature-auto-build` / `feature-verify` / `bug-fix` / `bug-auto-fix` / `bug-verify` / `ship`. These run after the target is fixed. Example calls: `feature-review billing`, `feature-build billing`, `bug-fix auth`, `ship billing`.

### 8.3 Rules

1. Entry-type subagents may derive a canonical target from the description
2. A caller-supplied candidate target is a hint, not a hard prerequisite
3. Only continuation-type subagents require an explicit target by default
4. If the derived target conflicts with the caller-supplied candidate, stop and ask for confirmation
5. If the target is not yet stable, do not rush to initialize directories

### 8.4 New feature initialization

1. **Step 0** — normalize with `<step0-skill>`, produce `<review_root>/<feature>/<YYYYMMDD>-feature-brief.md` (or `<review_root>/_intake/` if the name is undecided)
2. **feature-plan** — read the brief, fix the canonical target, then: initialize `<feature_root>/<feature>/docs/`, initialize `<review_root>/<feature>/`, migrate the `_intake/` brief if present, and write `Target` / `Title` / `Workflow` into `dev_log.md`

### 8.5 Bugfix initialization

`bug-diagnose` need not create a new bug directory, but must at least write into `dev_log.md`: `Target`, `Title`, reproduction summary, diagnosis summary.

---

## 9. Generic project background template

A background template you can copy directly as the start of `<project_background_file>`:

```md
Project: <PROJECT_NAME>

Project summary:
- This repository implements <ONE_SENTENCE_SUMMARY>.
- The default working unit is `<feature_name>` under `<feature_root>/`.

Architecture:
- `<core_root>/` contains shared infrastructure only.
- `<feature_root>/` contains business slices and is the default landing zone for feature code.
- `<plugin_root>/` contains pluggable capabilities if applicable.
- `<frontend_root>/` contains the main frontend if applicable.

Key boundaries:
- Do not move business logic into shared infrastructure.
- Do not directly import another feature's private internals.
- Cross-module interaction should go through public contracts, SDKs, or event mechanisms.
- If `<config_manifest>` is touched, keep it aligned with actual runtime loading behavior.

Documentation contract:
- `<feature_root>/<feature>/docs/design.md`
- `<feature_root>/<feature>/docs/api.md`
- `<feature_root>/<feature>/docs/test.md`
- `<feature_root>/<feature>/docs/dev_log.md`
- `<review_root>/<feature>/<YYYYMMDD>-discovery-review.md` for new features

Workflow references:
- <project_workflow_doc>
- <your_feature_sop>
- <your_bugfix_sop>
- <your_commit_convention>

Required conventions:
- <api_response_format>
- `dev_log.md` is the source of truth for workflow state.
- Every workflow write should maintain `Workflow`, `Executor`, `Updated`, and append `Work Log`.
- Commit messages should follow `<type(scope): summary>` plus body fields.

Testing expectations:
- New features should cover unit, contract, and end-to-end or regression scenarios as appropriate.
- Bugfixes must verify the original reproduction path plus key boundary cases.

Tooling notes:
- Preferred planning/review model: <planning_model>
- Preferred implementation model: <build_model>
- Preferred verification model: <verify_model>
```

### 9.1 Fields that must be replaced

`<PROJECT_NAME>`, `<ONE_SENTENCE_SUMMARY>`, `<core_root>`, `<feature_root>`, `<plugin_root>`, `<frontend_root>`, `<config_manifest>`, `<review_root>`, `<project_workflow_doc>`, `<your_feature_sop>`, `<your_bugfix_sop>`, `<your_commit_convention>`, `<api_response_format>`, `<planning_model>`, `<build_model>`, `<verify_model>`.

### 9.2 What NOT to put in the project background

Not recommended in `<project_background_file>`: full list of current features; temporary iteration state; specific feature field details; historical handoff bodies. The project background should be stable, long-lived, reusable.

### 9.3 project_background maintenance rules

`<project_background_file>` is the shared runtime context for all subagents — keep it maintained.

**When to update:** after an architecture refactor (boundary rules, layering changes); when adding a core convention (new error-code spec, new DI pattern); on tech-stack changes (ORM upgrade, frontend framework switch); when adding/removing a top-level directory.

**After updating:** re-run the generation script (`<setup_script> --replace-claude --force` or equivalent); confirm every subagent's `## Project Background` is synced; for critical rule changes, test-run a subagent on a small task to confirm it follows the new rules.

**Do not put in it:** same as §9.2 — feature lists, temporary state, iteration progress, historical handoffs; full refactor plans or migration history (only distill currently-effective rules); subagent-specific instructions (those belong in the template, not the background).

---

## 10. Cross-tool generation script model

Do not hand-write three sets of agents. Use:

```text
<templates_dir>/             # unified template source (start from templates/ in this folder)
<project_background_file>    # project background injection source
<setup_script>               # e.g. scripts/setup_subagents_v2.py + .sh
```

### 10.1 Inputs

- `<templates_dir>/*.md` — unified template source
- `<project_background_file>` — project background injection source

### 10.2 Output directories

```text
.claude/agents/   (or .claude/agents-v2/ for safe-mode)
.codex/agents/
.cursor/agents/
```

### 10.3 Generation strategy — format-compliance requirements

Every platform has its **own permission/sandbox fields**. The `CAN / DO NOT` in a subagent prompt is a semantic constraint; it must be paired with platform fields that tighten permissions **at the tool layer too**, or review/verify agents can bypass the prompt and edit code directly.

**Claude Code** — Markdown agent, `.md`. Frontmatter required: `name`; `description` (**must start with a verb** — this drives Claude Code auto-routing); `model` (**full model ID**, not `opus`/`sonnet` aliases, to avoid silent cross-version drift). Recommended: `tools` (explicit allow-list — read-only agents declare `Read, Glob, Grep`; orchestrators declare `Read, Task`); `color`. Default safe-mode output to `.claude/agents-v2/`, then `--replace-claude` once stable.

**Codex** — TOML agent, `.toml`. Required: `name`; `description` (verb-first); `developer_instructions` (template body, `strip()`-ed, into a triple-quoted multiline string). Recommended: `sandbox_mode` (review agents `"read-only"`, implementation agents `"workspace-write"` — **do not leave blank to inherit**, or review/verify can still write); `model`; `model_reasoning_effort` (`high` for plan/review/verify, `medium` for build/fix/ship). **Global config `.codex/config.toml` must include**:

```toml
[agents]
max_depth = 2                    # allow orchestrator to spawn one worker layer
max_threads = 4
job_max_runtime_seconds = 1800
```

Without this, `feature-dev-loop` / `bugfix-loop` are hard-capped by the default `max_depth = 1` and cannot start workers. The generation script should auto-create this file on first run.

**Cursor** — Markdown agent, `.md`. Required: `name`; `description` (verb-first; Cursor depends on this field even more than Claude/Codex); `model` (**only legal values are `inherit` / `fast` / explicit model ID** — not `auto`; reference project uses **flat `inherit`** for every agent, see §10.4 tiering policy). Optional: `readonly: true` (required for review agents — Cursor's permission-tightening field); `is_background: true` (recommended for orchestrator/loop agents). Cursor has no native recursive sub-agent spawn — a loop agent in Cursor splices the worker prompt into its own execution, so loop agents must be `readonly: false`.

### 10.4 Format-compliance field mapping (three tools unified)

| Unified semantic | Claude Code | Codex | Cursor |
|---|---|---|---|
| Agent identity | `name` | `name` | `name` |
| Trigger description (verb-first) | `description` | `description` | `description` |
| System prompt | Markdown body | `developer_instructions = '''...'''` | Markdown body |
| Read-only review | `tools: Read, Glob, Grep` | `sandbox_mode = "read-only"` | `readonly: true` |
| Writable implementation | `tools: Read, Write, Edit, Bash, ...` | `sandbox_mode = "workspace-write"` | (omit `readonly`, default false) |
| Orchestration spawn | `tools: Read, Task` | `sandbox_mode = "read-only"` + global `max_depth = 2` | `is_background: true` + `readonly: false` (no native spawn) |
| Strong-reasoning tier (plan / review / verify / orchestrators) | `model: <strong-model-id>` | `model = "<codex-model>"` (flat — see note) | `model: inherit` (flat — see note) |
| Fast-execution tier (build / fix / ship) | `model: <fast-model-id>` | `model = "<codex-model>"` (flat — see note) | `model: inherit` (flat — see note) |
| Visual / background marker | `color: <color>` | `nickname_candidates = [...]` (optional) | `is_background: true` (loop only) |

> **Per-platform tiering policy (recommended default — adopted by the reference project 2026-05-14).** Only **Claude Code** differentiates models by tier (`<strong-model-id>` vs `<fast-model-id>`). **Codex** and **Cursor** are **flat — no tiering**:
> - **Codex**: a single model id for *all* agents (`<codex-model>`), plus `model_reasoning_effort = "high"` for all. The generation script keeps `CODEX_STRONG_MODEL` / `CODEX_FAST_MODEL` as two constants only for structural uniformity; both point to the same id.
> - **Cursor**: every agent uses `model: inherit` (follows the IDE's model picker). No `fast` tier.
>
> A new project may re-tier Codex/Cursor if it wants, but the flat default is simpler and matches how the reference project's `.codex/agents/` + `.cursor/agents/` are actually configured. Whatever a project picks, the **generation script's model maps must match the on-disk agent files** — otherwise re-running the script silently reverts hand edits.

### 10.5 Script capabilities

The generation script should at least support: target selection (`claude` / `codex` / `cursor`); project-background injection; safe-mode output; overwrite-mode output; backup of existing files; `dry-run`; generation summary; reading template extension fields (`allowed_tools` / `color` / `codex_sandbox_mode` / `cursor_readonly` / `cursor_is_background`); model-alias expansion (`opus`/`sonnet`/`haiku` → each platform's real model slug, per the tiering policy above); auto-generating `.codex/config.toml` on first run.

**Optional public-skill branch (`--include-skills`):** in addition to the 15 frozen subagent templates, the generator may load **public-skill shim** SKILL.md files from `<public_skill_root>` (typically `_portable/skills/<name>/SKILL.md`) and emit per-vendor wrappers under a reserved `skill-` namespace prefix. The output paths are:

- Claude: `<ROOT>/.claude/skills/skill-<name>/SKILL.md`
- Codex: `<ROOT>/.codex/agents/skill-<name>.toml` (`sandbox_mode = "read-only"`)
- Cursor: `<ROOT>/.cursor/rules/skill-<name>.mdc` (`alwaysApply: false`)

The branch is **opt-in**: without `--include-skills`, the generator's behavior is byte-identical to the pre-public-skill scope. The namespace prefix `skill-` is reserved and enforced at the write boundary — the generator MUST refuse to write outside the `skill-` namespace (any `.toml` whose filename does not start with `skill-`, any `SKILL.md` whose folder does not start with `skill-`, etc.). This isolates the public-skill renderer from private `<skill_prefix>`-prefixed skills which live in `<skill_root>` and are not regenerated by the script. See `<public_skill_root>/README.md` (if present) and the project's ADR (e.g. `docs/adr/0006-public-skills-portable-library.md` in the source repo) for the policy that locks `--include-skills` as opt-in and `.cursor/rules/*.mdc` (not `.cursor/agents/`) as the Cursor surface.

### 10.6 Conversion steps

```text
1. Read <templates_dir>/*.md
2. Parse frontmatter + body (including platform extension fields)
3. Read <project_background_file>
4. Replace <!-- INJECT:PROJECT_BACKGROUND --> with the project background
5. Map fields per target platform:
   - Claude: keep Markdown + frontmatter, expand model slug, inject tools/color
   - Codex: convert to TOML, strip body into developer_instructions, inject sandbox_mode
   - Cursor: keep Markdown, set model per §10.4 tiering policy (reference project: flat `inherit`), conditionally inject readonly/is_background
6. Handle output directory: skip / backup / overwrite
7. If codex is a target, check and generate .codex/config.toml
8. Output a generation summary (what was generated, where, whether a backup happened)
```

### 10.7 Script parameters

```text
--targets claude,codex,cursor
--replace-claude
--force
--dry-run
```

### 10.8 Post-generation checks

**Count checks:** with the full set, `.claude/agents/` should have 15 `.md` (10 workers + 2 loop orchestrators + 3 meta-orchestrators); `.codex/agents/` 15 `.toml`; `.cursor/agents/` 15 `.md`; `.codex/config.toml` exists with `[agents] max_depth = 2`. (The 3 meta-orchestrators — `feature-full-loop` / `bugfix-full-loop` / `feature-phase-review` — are the automation entry layer defined in `04-automation-loop.md`; a project that only generates the manual pipeline will see 12 instead of 15.)

**Content checks:** `<!-- INJECT:PROJECT_BACKGROUND -->` replaced; `ship` still keeps the `READY_TO_SHIP` gate; `feature-build` still keeps "one phase per run".

**Format-compliance checks:** Claude `model` is a full ID, not an alias; Claude review agents (`feature-review` / `feature-verify` / `bug-verify`) `tools` exclude `Write`/`Edit`/`Bash`; Codex review agents `sandbox_mode = "read-only"`; Cursor `model` is `inherit`/`fast`, not `auto`; Cursor review agents have `readonly: true`; Cursor loop agents have `is_background: true`; all platforms' `description` start with a verb.

---

## 11. Generic subagent template structure

Each subagent template should contain at least:

```markdown
---
name: <subagent_name>
description: <verb-first trigger description>
model: <preferred_model>      # abstract tier: opus / sonnet / haiku
allowed_tools: Read, Glob, Grep    # Claude: maps to tools
color: yellow                       # Claude: maps to color
codex_sandbox_mode: read-only       # Codex: maps to sandbox_mode
cursor_readonly: true               # Cursor: conditional readonly: true
cursor_is_background: false         # Cursor: conditional is_background: true
---

You are `<subagent_name>`.

Pipeline position:
<workflow chain>

## Project Background
<!-- INJECT:PROJECT_BACKGROUND -->

## Role
- CAN ...
- DO NOT ...

## Target Feature Protocol
- how target is resolved

## Read First
- required docs

## Startup Protocol
- Fresh / Continue / Review / Revise / Wait / Block / Done

## State Write Rules
- Workflow / Executor / Updated / Work Log

## Execution Rules
- actual steps

## Required Output
- what to write
- what to report
```

The script expands `model: opus` to each platform's real slug.

### 11.1 Recommended permission/sandbox matrix (10 workers + 2 orchestrators)

| Agent | tier | `allowed_tools` (Claude) | `color` | `codex_sandbox_mode` | `cursor_readonly` | `cursor_is_background` |
|---|---|---|---|---|---|---|
| `feature-plan` | opus | `Read, Write, Edit, Glob, Grep, WebSearch, WebFetch` | blue | `workspace-write` | false | false |
| `feature-review` | opus | `Read, Glob, Grep` | yellow | `read-only` | **true** | false |
| `feature-build` | sonnet | `Read, Write, Edit, Bash, Glob, Grep` | green | `workspace-write` | false | false |
| `feature-auto-build` | sonnet | `Read, Write, Edit, Bash, Glob, Grep` | green | `workspace-write` | false | **true** |
| `feature-verify` | opus | `Read, Bash, Glob, Grep` | red | `read-only` | **true** | false |
| `bug-diagnose` | opus | `Read, Write, Edit, Bash, Glob, Grep` | blue | `workspace-write` | false | false |
| `bug-fix` | sonnet | `Read, Write, Edit, Bash, Glob, Grep` | green | `workspace-write` | false | false |
| `bug-auto-fix` | sonnet | `Read, Write, Edit, Bash, Glob, Grep` | green | `workspace-write` | false | **true** |
| `bug-verify` | opus | `Read, Bash, Glob, Grep` | red | `read-only` | **true** | false |
| `ship` | sonnet | `Read, Bash, Glob, Grep` | cyan | `workspace-write` | false | false |
| `feature-dev-loop` | opus | `Read, Task` | purple | `read-only` | false | **true** |
| `bugfix-loop` | opus | `Read, Task` | purple | `read-only` | false | **true** |

**Matrix design principles:**

- **Review class** (review/verify): read-only on all platforms — `tools` drop Write/Edit/Bash, `sandbox_mode = read-only`, `readonly = true`. The prompt-level `DO NOT silently rewrite` is then also hard-blocked at the tool/sandbox layer.
- **Implementation class** (build/fix/diagnose): writable on all platforms; Bash kept for running tests and git.
- **plan class**: allowed `WebSearch / WebFetch` for candidate research, but no `Bash` (should not run code).
- **ship class**: only `Bash` (just git commit/push); no Write/Edit to prevent last-second code edits.
- **orchestrator (loop) class**: behaves differently per tool — Claude `tools: Read, Task` (native Task spawn); Codex `sandbox_mode: read-only` + global `max_depth = 2`; Cursor `readonly: false` + `is_background: true` (no native spawn).

> **Meta-orchestrators.** The matrix above is the 12-template manual pipeline. The 3 meta-orchestrator
> templates (`feature-full-loop` / `bugfix-full-loop` / `feature-phase-review`) are the automation
> entry layer. All three are **Status-Panel-read-only** — they never flip `Status:` / `Suggested
> Next:`, enforced by the body Read-only Gate Contract and (on Claude) by dropping `Write` / `Edit`
> from `allowed_tools` (`Task, Read, Bash, Grep, Glob`). But — unlike the Layer-2 loop class —
> `feature-full-loop` / `bugfix-full-loop` are **Codex `codex_sandbox_mode: workspace-write`, not
> `read-only`**: the event-driven (B/C) variants must `Bash`-write marker files, dispatch-prompt
> files, and Work Log appends, all of which a read-only sandbox would silently block.
> `feature-phase-review` is `workspace-write` as a Phase-Progress writer (it still never touches the
> Status Panel). Their full design is in `04-automation-loop.md`.

### 11.2 Recommended fixed sections

All templates should keep: `Pipeline position`, `Project Background`, `Role`, `Target Feature Protocol`, `Read First`, `Startup Protocol`, `State Write Rules`, `Execution Rules`, `Required Output`.

### 11.3 Recommended role-boundary style

Write boundaries with `CAN / DO NOT` directly:

- `feature-plan` — CAN write plan docs; DO NOT approve your own plan
- `feature-review` — CAN review the plan; DO NOT silently rewrite the structural plan
- `feature-build` — CAN implement per phase; DO NOT span multiple phases in one run
- `feature-verify` — CAN verify independently; DO NOT implement new feature code
- `ship` — CAN commit and push; DO NOT bypass workflow gates by default

---

## 12. Cross-executor breakpoint continuity

### 12.1 Generic startup logic

Every subagent on startup:

```text
1. Resolve target
2. Read shared docs
3. Parse workflow / phase / status / suggested next / executor
4. Decide run mode
5. Either continue, stop, or hand off cleanly
```

(Run-mode semantics — `Fresh` / `Continue` / `Review` / `Revise` / `Wait` / `Block` / `Done` — are in `02-handoff-and-state.md` §1.)

### 12.2 Cross-executor scenario examples

**Feature Plan Cross-Review** — Run `feature-plan` in tool 1 (input a brief, not a name) → it derives the canonical name → produces the docs four-piece set → `Status = NEEDS_REVIEW`, `Suggested Next = feature-review`. Switch to tool 2, run `feature-review <name>` → detects an existing draft → enters Review mode → reads the `Executor` field, sees the previous step came from a different executor → outputs `APPROVED` or `REVISE`. On `REVISE`, switch back to tool 1, run `feature-plan <name>` → reads Review Notes → Revise mode.

**Feature Phase Continue** — Run `feature-build <name>` in tool 1 → completes only Phase 1 → `Suggested Next = feature-build` → stop. After human confirmation, switch to tool 2, run `feature-build <name>` → auto-detects Phase 1 done, Phase 2 pending → resumes from Phase 2, does not re-touch Phase 1.

**Verify Return Path** — Run `feature-build <name>` in tool 1 → last phase done → `Status = READY_FOR_VERIFY`. Switch to tool 2, run `feature-verify <name>` → finds an implementation/contract mismatch → `Status = BLOCKED`, `Suggested Next = feature-build`. Switch back, run `feature-build <name>` → auto-detects a verify return → fixes the mismatch (does not re-plan). Bugfix is symmetric (`bug-fix` ↔ `bug-verify`).

**Ship by a different tool** — After `feature-verify <name>` reaches `READY_TO_SHIP`, switch to any tool, run `ship <name>` → reads `dev_log.md`, confirms `Status = READY_TO_SHIP`, checks git status/commit/push, writes `SHIPPED`. If the work ran in a roadmap-loop background session, pass the session id or worktree path so `ship` can perform those checks in the correct checkout.

---

## 13. New-project landing steps

1. Copy `_portable/` into the new project
2. Copy the `templates/` content into your `<templates_dir>`
3. Create `<project_background_file>` from the template in §9
4. Copy / write the generation script
5. Replace all background and path placeholders (see `00-PORTABLE-MANIFEST.md` for the full list)
6. Write a project-local `SUBAGENT_WORKFLOW_V2.md` (the concrete instance)
7. Test-run on a small feature first
8. Test-run on a bugfix
9. Then decide whether to formally overwrite old agents

---

## 14. Usage notes

### 14.1 Command input format

Examples like `feature-plan`, `feature-review billing`, `bug-fix auth`, `ship subscription` mean "invoke the named subagent, passing a target or task description". The actual trigger differs per tool (Claude Code: select agent then pass the target name; Codex: invoke the custom agent with a target; Cursor: select from the agent UI then input the target). What matters: which subagent is invoked; entry-type subagents get a description, continuation-type subagents get a fixed target. Do not read these examples as one fixed CLI syntax.

### 14.2 Feature Dev minimal sequence

```text
1. feature-plan <feature brief>
2. feature-review <feature>
3. human confirm plan
4. feature-build <feature>   # one phase per run
5. human confirm phase result
6. feature-build <feature>   # if there is a next phase
7. feature-verify <feature>
8. human confirm verify verdict
9. ship <feature>
```

Human confirmation points: after `feature-review` gives `APPROVED/REVISE`; after each `feature-build` phase; after `feature-verify` gives `READY_TO_SHIP/BLOCKED`; before `ship` pushes.

### 14.3 Bugfix minimal sequence

```text
1. bug-diagnose <bug report>
2. human confirm root cause + fix strategy
3. bug-fix <feature>
4. bug-verify <feature>
5. human confirm verify verdict
6. ship <feature>
```

### 14.4 Post-ship incremental iteration

**Small patch (Delta):** append a Delta Phase to `dev_log.md` (or tell `feature-build` what to add) → `feature-build` → `feature-verify` → `ship`.
**Medium change (Increment):** `feature-plan` (detects SHIPPED, enters Increment mode) → `feature-review` → `feature-build` → `feature-verify` → `ship`.
Decision rule: missed implementation/test/doc → Delta; design/contract/phase change → Increment; independent new requirement → new feature workflow; post-release defect → bugfix workflow.

### 14.5 How a developer decides the next subagent

Don't rely on memory — read `dev_log.md`: check `Status`, `Current Phase`, `Suggested Next`, and the latest `Work Log` entry. Common rules:

- `Status = NEEDS_REVIEW` and `Suggested Next = feature-review` → run `feature-review`
- `Status = NEEDS_REVIEW` and `Suggested Next = feature-plan` → run `feature-plan` (review return)
- `Status = APPROVED` → run `feature-build`
- `Status = READY_FOR_VERIFY` → run `feature-verify`
- `Status = FIX_READY` → run `bug-fix`
- `Status = FIX_READY_FOR_VERIFY` → run `bug-verify`
- `Status = READY_TO_SHIP` → run `ship`

### 14.6 Common usage mistakes

- Don't silently rewrite the full plan during `feature-review`
- Don't let `feature-build` span multiple phases; use `feature-auto-build` for continuous multi-phase
- Don't fix code on the side inside `feature-verify` / `bug-verify`
- Don't run `ship` by default when `Status != READY_TO_SHIP`
- Don't bypass `dev_log.md` and decide the next step from chat context

---

## 15. What must be replaced per project

Most-often missed: project name; architecture-boundary description; feature root directory; review root directory; commit convention; test commands; API response format; manifest or equivalent config file; whether the project needs plugin/app/admin/frontend multi-layer boundaries.

## 16. What NOT to put in the portable layer

These belong in project-specific docs: the project's current feature list; the project's status table; the project's historical refactor background; specific business field definitions; a project's unique compatibility layers and migration debt.

## 17. Recommended companion files

To turn this into a project scaffold, keep at least: this `_portable/` folder; a project-local `SUBAGENT_WORKFLOW_V2.md`; `<templates_dir>/*`; `<project_background_file>`; the generation script (`.py` + `.sh`). The portable layer owns the "framework", the project doc owns the "concrete landing", templates + script own the "actual generation".
