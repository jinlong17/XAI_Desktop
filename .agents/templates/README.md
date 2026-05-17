# `_portable/templates/` — Subagent Prompt Templates

This folder is the **single source of truth** for the Workflow V2 subagent prompts. The generation
script (see `../scripts/README.md` and `../01-workflow-model.md` §10) expands each template here into
three tool-specific agent configs — Claude Code `.md`, Codex `.toml`, Cursor `.md`.

These files are **not** active agent configs. They are project-agnostic templates: every project-specific
path or name is a `<placeholder>`, and the shared project context is a `<!-- INJECT:PROJECT_BACKGROUND -->`
marker. You do not run these directly — you instantiate them, then generate.

## The 15 templates

**12 workers + loop orchestrators** (the core subagent pipeline — see `../01-workflow-model.md` §4–§6):

| Template | Pipeline | Role |
|----------|----------|------|
| `feature-plan.md` | Feature Dev | Discovery review + design snapshot + API contract + test strategy + phased plan |
| `feature-review.md` | Feature Dev | Review the plan, return APPROVED or REVISE (read-only) |
| `feature-build.md` | Feature Dev | Implement exactly one approved phase, test, commit, stop for human confirm |
| `feature-auto-build.md` | Feature Dev | Auto-implement all remaining phases, commit each, stop before verify |
| `feature-verify.md` | Feature Dev | Independently verify implementation vs plan/contracts/docs (read-only) |
| `feature-dev-loop.md` | Feature Dev | Loop orchestrator: auto-run feature-auto-build → feature-verify, retry on BLOCKED |
| `bug-diagnose.md` | Bugfix | Reproduce, analyze impact, classify root cause, define fix strategy |
| `bug-fix.md` | Bugfix | Implement minimal-scope fix + regression tests + commit |
| `bug-auto-fix.md` | Bugfix | Auto-implement all sub-fixes, commit each, stop before bug-verify |
| `bug-verify.md` | Bugfix | Independently verify the fix, regression, boundary behavior (read-only) |
| `bugfix-loop.md` | Bugfix | Loop orchestrator: auto-run bug-auto-fix → bug-verify, retry on BLOCKED |
| `ship.md` | Shared | Verify commit quality, push to remote, write SHIPPED (the release gate) |

**3 meta-orchestrators** (the automation entry layer — see `../04-automation-loop.md`):

| Template | Pipeline | Role |
|----------|----------|------|
| `feature-full-loop.md` | Feature Dev | End-to-end meta-orchestrator: step0 → plan → review → build → verify, stops before ship. The single user-facing entry for the automation variants. |
| `bugfix-full-loop.md` | Bugfix | End-to-end meta-orchestrator: diagnose → fix → verify, stops before ship (phase-granularity variants not applicable). |
| `feature-phase-review.md` | Feature Dev | Phase-level reviewer for phase-granularity automation variants — reviews one phase's commit range, writes Phase N Verdict (does NOT touch the Status Panel). |

## Placeholder convention

Every `<lower_snake_case>` token in a template is a **project-config placeholder** that must be replaced
when instantiating into a new project. The complete registry — what each placeholder means and this
repo's worked-example value — is in `../00-PORTABLE-MANIFEST.md` §3:

- **§3.1** path / structure placeholders (`packages/`, `packages/core/`, `docs/reviews/`,
  `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `developer.md`, `/tmp/cw-orchestrator/`, …)
- **§3.2** skill / role placeholders (`xai-feature-brief`, `<status_writer>`, `<feature_name>`, …)
- **§3.4** runtime fill-in tokens (`<feature>`, `<commit>`, `<first>`..`<last>`, `<ts>`, …) — these are
  **not** replaced at instantiation; the subagents fill them in at runtime. They are registered only so
  the placeholder-registration lint stays complete.

Upper-case / digit forms (`XAI_Desktop — AI Smart Desktop`, `<YYYYMMDD>`, `<N>`) are a deliberately separate class —
`XAI_Desktop — AI Smart Desktop` etc. belong in `.agents/project_background.md` (§3.3); `<YYYYMMDD>` / `<N>` are runtime stamps.

The shared project context (architecture, boundaries, conventions, tooling) is **not** spelled out in
each template — every template carries a `<!-- INJECT:PROJECT_BACKGROUND -->` marker under its
`## Project Background` heading. The generation script replaces that marker with the contents of
`.agents/project_background.md` (whose template is in `../01-workflow-model.md` §9). This keeps the project
context defined once and injected everywhere.

## How a new project uses this folder

1. **Copy** all 15 `templates/*.md` into the project's `.agents/templates/` (e.g. `.agents/templates/`).
2. **Search-and-replace** the §3.1 / §3.2 placeholders across the copied templates with concrete values
   (the §3.4 runtime tokens are left as-is — the subagents fill those in).
3. **Create** `.agents/project_background.md` from the §9 template in `01-workflow-model.md`.
4. **Run** the generation script (`../scripts/README.md` + `01` §10) to expand the templates into
   `.claude/agents/`, `.codex/agents/`, `.cursor/agents/` — the script injects the project background,
   maps the platform extension fields (`allowed_tools`, `color`, `codex_sandbox_mode`, `cursor_readonly`,
   `cursor_is_background`), and expands the model alias to each platform's real model slug.
5. **Verify** with the post-generation checks in `01` §10.8 (count checks, content checks,
   format-compliance checks).

> Full instantiation walkthrough: `../00-PORTABLE-MANIFEST.md` §4 and §5.

## Editing discipline

`_portable/templates/` is the **portable source**. The project-instantiated copy under `.agents/templates/`
is a downstream artifact. When the paradigm changes (a new subagent, a new Status enum value, a changed
Handoff field), edit the template **here first**, then re-instantiate. The reverse direction — editing
the instantiated copy and forgetting the portable source — is the drift this layer exists to prevent.
A project should keep a mechanical sync lint (`scripts/lint/check_portable_sync.py` in this repo) plus a
governance skill that flags portable/project divergence; see `../../README.md` "Maintenance discipline".
