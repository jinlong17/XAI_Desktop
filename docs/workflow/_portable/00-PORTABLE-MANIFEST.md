# 00 — Portable Workflow: Migration Manifest

> **Start here.** This is the migration manual for the portable agent/skill workflow paradigm.
> Everything in `_portable/` is project-agnostic and meant to be copied wholesale into any new project.

---

## 1. What this deliverable is

`_portable/` is a self-contained, project-agnostic specification of a **multi-subagent, document-driven,
breakpoint-resumable, cross-tool (Claude / Codex / Cursor) development workflow**. It is the distilled
paradigm — no `features/`, no `apps/web`, no `a2k-*`, no company-specific names. To bring this workflow
to a new project, you copy this one folder and fill in the placeholders.

What you get:

```
_portable/
├── 00-PORTABLE-MANIFEST.md   ← you are here: migration guide + placeholder table + reading order
├── 01-workflow-model.md      ← the paradigm core: task-typed pipelines, subagents, generation script
├── 02-handoff-and-state.md   ← the Handoff block + dev_log state protocol + State Verification contract
├── 03-step0-brief-spec.md    ← Step 0 requirement-brief gate (the front gate before planning)
├── 04-automation-loop.md     ← parent-session recipe + compatibility orchestrators + 7-variant automation matrix + quota fallback
├── 05-commit-convention.md   ← the commit paradigm (small-step / single-intent / Definition of Done)
├── 06-roadmap-orchestration.md ← Layer 3.5: roadmap manifest + the roadmap-loop skill (multi-feature waves)
├── usage-guide.md            ← cross-cutting hands-on tutorial: the whole workflow, 3 ways to drive it
├── templates/                ← 15 subagent prompt templates (the generation-script source of truth)
│                               12 workers/loops + 3 compatibility orchestrators
└── scripts/                  ← the generation script (setup_subagents_v2.py/.sh, runnable reference)
                                + the automation-loop reference shell scripts + README
```

---

## 2. Recommended reading order

Read in numeric order — each file builds on the previous:

| # | File | Read it to learn |
|---|------|------------------|
| 00 | `00-PORTABLE-MANIFEST.md` | how to migrate, what the placeholders are (this file) |
| 01 | `01-workflow-model.md` | the core paradigm: two task-typed pipelines, 12 subagents, the generation-script model |
| 02 | `02-handoff-and-state.md` | how subagents hand off — the `## Handoff` block, the `dev_log.md` state machine, the `### State Verification` anti-echo-chamber contract |
| 03 | `03-step0-brief-spec.md` | the requirement-normalization gate that runs before `feature-plan` |
| 04 | `04-automation-loop.md` | how to make the whole pipeline run hands-off — the single-feature parent-session recipe, compatibility orchestrators, the 7-variant matrix, graceful degradation, the 5-phase state machine, the marker-file schema, the Phase Verdict protocol |
| 05 | `05-commit-convention.md` | the commit discipline that makes commits a review + handoff carrier |
| 06 | `06-roadmap-orchestration.md` | Layer 3.5: how to drive a whole reviewed roadmap of N features hands-off — the roadmap manifest file, the init/run roadmap-loop skill, dispatch modes, dependency-wave scheduling, where the human `ship` gate lands |
| — | `usage-guide.md` | the cross-cutting, hands-on tutorial for the **whole** workflow — three ways to drive it (manual subagent dispatch / the single-feature parent-session recipe / the roadmap skill), what to type at each level, what to do when it stops. Read it after skimming `01`-`02` + `04` + `06`. |
| — | `templates/*.md` | the 15 subagent prompts (12 workers/loops + 3 compatibility orchestrators); feed these to the generation script |
| — | `scripts/README.md` | the generation-script contract + the bundled runnable reference (`setup_subagents_v2.py/.sh`) + the automation-loop reference shell scripts |

A new project's AI assistant should be pointed at `00 → 01 → 02 → 03 → 04 → 05 → 06` in that order;
`usage-guide.md` is the hands-on companion — read it alongside `04` / `06`, not as a separate layer.

---

## 3. The placeholder table

Every `<placeholder>` in `_portable/` must be replaced with a project-specific value. Replace them in
the templates (`templates/*.md`), in your `<project_background_file>`, and anywhere a portable doc
tells you to instantiate a path. The middle column explains the placeholder; the right column shows
**this repo's (Any2Knowledge) actual values** as a worked example.

### 3.1 Path / structure placeholders

| Placeholder | Meaning | Any2Knowledge actual value |
|-------------|---------|----------------------------|
| `<feature_root>` | Root dir holding business slices / the default unit of work | `features/` |
| `<core_root>` | Root dir for shared infrastructure only | `core/` |
| `<plugin_root>` | Root dir for pluggable capabilities (omit if N/A) | `plugins/` |
| `<frontend_root>` | Root dir for the main frontend (omit if N/A) | `apps/web/src/` |
| `<review_root>` | Root dir for discovery reviews + feature briefs | `docs/reviews/` |
| `<config_manifest>` | The per-module config file whose runtime-loading behavior must stay in sync | `manifest.json` |
| `<templates_dir>` | Where the subagent templates live in the project | `.agents/templates/` (a copy is also in `_portable/templates/`) |
| `<project_background_file>` | The shared runtime-context file injected into every subagent | `.agents/project_background.md` |
| `<setup_script>` | The generation script | `scripts/setup_subagents_v2.py` (+ `.sh` wrapper) |
| `<project_workflow_doc>` | The project-local concrete V2 workflow doc | `docs/workflow/project/SUBAGENT_WORKFLOW_V2.md` |
| `<your_feature_sop>` | The project's new-feature SOP | `docs/workflow/project/SOP_NEW_FEATURE.md` |
| `<your_bugfix_sop>` | The project's bugfix SOP | `docs/workflow/project/SOP_BUGFIX.md` |
| `<your_commit_convention>` | The project's commit convention | `docs/workflow/project/commit-convention.project.md` (paradigm: `_portable/05`) |
| `<onboarding_doc>` | The developer onboarding / navigation doc subagents read first | `developer.md` |
| `<refactor_plan_doc>` | The project's refactor / restructuring plan doc (read by plan/build to stay aligned) | `docs/REFACTORING_PLAN.md` |
| `<feature_map_doc>` | The project's global feature/plugin state map | `docs/FEATURE_MAP.md` |
| `<orchestrator_marker_dir>` | Scratch dir where meta-orchestrators write `awaiting_*` marker files for event-driven resume | `/tmp/cw-orchestrator/` |
| `<quota_state_dir>` | Scratch dir where quota monitors write `<executor>-exhausted-until` files | `/tmp/cw-quota/` |
| `<skill_root>` | Root dir where skill definitions (`SKILL.md`) live in the project | `.teams/skills/` |
| `<roadmap_manifest_dir>` | Dir where Layer 3.5 roadmap manifest files live (see `06-roadmap-orchestration.md`) | `docs/workflow/project/roadmap/` |
| `<cowork_scripts_dir>` | Dir where the automation-loop reference shell scripts (dispatch / hook / quota wrappers / `lib_phase_verdict.sh`) are installed in the project — copy `_portable/scripts/*.sh` here | `scripts/cowork/` |
| `<public_skill_root>` | Root dir where the portable public-skill shims live in the project — `a2k-workflow-migrate instantiate` copies `_portable/skills/` verbatim here. Optional: omit if the project does not adopt the public-skill bundle (Step 6a in §4 is skippable). | `docs/workflow/_portable/skills/` |
| `<mcp_servers_root>` | Root dir where the portable MCP-server install README lives — `a2k-workflow-migrate instantiate` copies `_portable/mcp-servers/` verbatim here. Optional: omit if the project does not adopt any MCP servers. | `docs/workflow/_portable/mcp-servers/` |

### 3.2 Skill / role placeholders

| Placeholder | Meaning | Any2Knowledge actual value |
|-------------|---------|----------------------------|
| `<skill_prefix>` | The project's skill-name prefix — prepended to every frozen skill suffix so skill names stay project-scoped yet portable (see §3.5) | `a2k-` |
| `<step0-skill>` | The Step 0 requirement-brief skill (legacy whole-name placeholder — see §3.5) | `a2k-feature-brief` |
| `<status_writer>` | A role from the Status Panel write-authority matrix (`02` §2.6) used in commit trailers | one of: `feature-plan` / `feature-review` / `feature-build` / `feature-auto-build` / `feature-verify` / `bug-diagnose` / `bug-fix` / `bug-auto-fix` / `bug-verify` / `ship` |
| `<feature_name>` / `<module_name>` / `<domain_name>` / `<task_name>` | The canonical name of the current unit of work | e.g. `billing`, `subscription`, `data_agent` |
| `<feature_brief>` | The Step 0 feature-brief artifact for the current unit of work | `<review_root>/<feature>/<YYYYMMDD>-feature-brief.md` |

### 3.3 Project-identity / convention placeholders (for `<project_background_file>`)

| Placeholder | Meaning | Any2Knowledge actual value |
|-------------|---------|----------------------------|
| `<PROJECT_NAME>` | Project name | `LUMX AI Agent` / `Any2Knowledge` |
| `<ONE_SENTENCE_SUMMARY>` | One-sentence repo summary | "an AI-native spreadsheet processing platform" |
| `<api_response_format>` | The project's standard API response shape | `{ success, data, message, error_code }` |
| `<planning_model>` | Preferred planning/review model | Claude Opus |
| `<build_model>` | Preferred implementation model | Claude Sonnet / Codex / Cursor |
| `<verify_model>` | Preferred verification model | Claude Opus |
| `<codex-strong-model>` / `<codex-fast-model>` | Codex model slugs for strong-reasoning vs fast-execution roles | see `scripts/setup_subagents_v2.py` `CODEX_STRONG_MODEL` / `CODEX_FAST_MODEL` constants |
| `<strong-model-id>` / `<fast-model-id>` | Full Claude model IDs for strong vs fast roles | e.g. `claude-opus-4-7` / `claude-sonnet-4-6` |

### 3.4 Runtime fill-in placeholders (NOT pre-filled at instantiation)

These `<...>` tokens are **not** project-config placeholders — the subagents fill them at runtime when
they derive a target, record a commit hash, stamp a timestamp, etc. They appear in `templates/*.md` (and
sometimes the portable docs) as fill-in slots inside Handoff blocks and write-back snippets. They are
listed here only so the placeholder-registration lint (`scripts/lint/check_portable_sync.py` rule 2)
has a complete registry — there is nothing to search-and-replace for these at instantiation time.

| Placeholder | What the subagent fills it with at runtime |
|-------------|--------------------------------------------|
| `<feature>` | the canonical feature/target name for this run (alias of `<feature_name>`) |
| `<target>` | the canonical target name in the bugfix pipeline |
| `<slug>` | a single feature's canonical slug inside a roadmap manifest row (alias of `<feature>`; see `06`) |
| `<roadmap_name>` | the manifest name for a given roadmap — the file is `<roadmap_manifest_dir>/<roadmap_name>.md` (see `06`) |
| `<roadmap_source_doc>` | the reviewed, human-readable source doc a roadmap-loop `init` run consumes — either a pre-decomposed roadmap doc (parse path) or a raw PRD / multi-subsystem plan the skill decomposes itself (decompose path); see `06` |
| `<roadmap_seed_brief>` | a per-feature seed brief stub the `init` decompose path writes for each feature it carves out — `<review_root>/<slug>/<YYYYMMDD>-roadmap-seed.md`; it feeds Step 0, it does not replace it (see `06` §A7.2) |
| `<worker>` | the worker template name an orchestrator is about to spawn (e.g. `feature-auto-build`) |
| `<executor>` | the current tool/model identifier, or an external-executor name in a fallback chain |
| `<agent>` | a child subagent name referenced in a State Verification / Blocker line |
| `<name>` | the feature/subagent name slot in a Handoff field |
| `<desc>` | a phase description cell in a Phase Progress table |
| `<ts>` | a UNIX-epoch or formatted timestamp |
| `<commit>` | a single commit hash |
| `<first>` / `<last>` / `<first_hash>` / `<last_hash>` | the first / last commit hash of a phase's commit range |
| `<empty>` | a literal "this table cell is empty" marker in schema examples |
| `<marker_type>` | the concrete marker-file type suffix at runtime (e.g. `awaiting_phase_2_build`) |
| `<model>` | a model identifier slot in a write-back / Handoff snippet |
| `<tool>` | an external-tool name slot in the variant / fallback discussion |
| `<new>` | the new executor name in a `Executor: <new>` fallback Work Log line |
| `<subagent_name>` | the subagent name slot in the generic template-structure example (`01` §11) |
| `<preferred_model>` | the abstract model-tier slot in a template's frontmatter example (`01` §11) |
| `<color>` | the Claude `color` value slot in the field-mapping example (`01` §10.4) |
| `<next_subagent>` | the next-agent slot in a `Suggested Next:` example (`02`) |
| `<value>` | a Status-value slot in a Handoff "Files Changed" example (`02`) |
| `<topic>` | a short topic slug in a temporary `_intake/` brief filename example (`03`) |
| `<phase_num>` / `<n_phases>` | phase-number arguments in the `lib_phase_verdict.sh` skeleton contract (`scripts/README.md`) |
| `<dev_log_abs_path>` | the absolute dev_log path argument in the `read_phase_verdict_from_path` skeleton (`scripts/README.md`) |
| `<prompt_file>` | the dispatch-prompt file argument in the `dispatch_<executor>.sh` skeleton (`scripts/README.md`) |
| `<text>` | the free-text requirement body slot in an invocation-prompt example (`07-automation-mode-picker.md`) |
| `<variant>` | the Automation Mode variant value slot — one of the 8 legal variants enumerated in `04-automation-loop.md` §3 — used in picker / invocation examples (`07-automation-mode-picker.md`) |
| `<i>` | the feature-row index slot in a roadmap-loop `init` per-row question (`07-automation-mode-picker.md` §5.1) |
| `<vendor>` | the generic vendor-name slot in shell-script invocation examples (`07-automation-mode-picker.md` / `04-automation-loop.md` §3.4 multi-state hook) — one of `codex` / `cursor` / `claude` |
| `<other_vendor>` | the cross-vendor-routing slot (the vendor that is NOT the one named by the just-committed step's `* Executor:` field) used in `04-automation-loop.md` §3.4 hook state machine |
| `<agent_name>` | the 3rd positional argument of `dispatch_<vendor>.sh` (one of the 8 V2 worker agents — `feature-plan` / `feature-review` / `feature-auto-build` / `feature-verify` / `bug-diagnose` / `bug-fix` / `bug-auto-fix` / `bug-verify`), used in shell-script invocation examples in `04-automation-loop.md` §3.4 and `scripts/README.md` |

> **Note on `<YYYYMMDD>` and `<N>`:** like the table above, these are runtime stamps, not
> instantiation-time placeholders — `<YYYYMMDD>` is a date stamp on dated files (e.g.
> `<review_root>/<feature>/<YYYYMMDD>-feature-brief.md`) and `<N>` is a phase number. They use
> upper-case / digit forms on purpose so they are visibly distinct from the `<lower_snake_case>`
> project-config placeholders in §3.1–§3.3.

### 3.5 Naming stability policy

Two naming rules keep the portable docs and tutorials reusable **verbatim** across projects — so a
new project does not have to rewrite `usage-guide.md` or `06-roadmap-orchestration.md` just because
its names differ.

**Agent names are frozen.** The 15 subagent names — `feature-plan`, `feature-review`, `feature-build`,
`feature-auto-build`, `feature-verify`, `feature-dev-loop`, `feature-full-loop`, `feature-phase-review`,
`bug-diagnose`, `bug-fix`, `bug-auto-fix`, `bug-verify`, `bugfix-loop`, `bugfix-full-loop`, `ship` — are
a fixed, project-invariant vocabulary. They are deliberately **not** placeholders: a migrating project
keeps them byte-identical. Renaming an agent in a new project silently breaks every portable doc and
tutorial that names it. If a project truly must rename, do it as a project-local alias layer, never by
editing `_portable/`.

**Skill names = `<skill_prefix>` + a frozen suffix.** Skill names *do* carry a project-scoped prefix
(this repo: `a2k-`), so they cannot be frozen whole like agent names. The portable form splits them:
the **suffix is frozen and project-invariant** (`roadmap-loop`, `feature-brief`, …); the **prefix is
the one search-and-replace token** `<skill_prefix>`. Portable docs always write a skill as
`<skill_prefix>roadmap-loop`. At instantiation you replace `<skill_prefix>` exactly once and every
skill name resolves. This is precisely what lets `usage-guide.md` and `06` be copied without a
per-project rewrite.

> **Legacy exception:** `<step0-skill>` (= `a2k-feature-brief`) predates this policy and is registered
> as a whole-name placeholder rather than `<skill_prefix>feature-brief`. It is kept as-is to avoid a
> multi-file churn across the templates and `04`. Treat it as the one grandfathered exception; all
> *new* skill references use the `<skill_prefix>` + frozen-suffix form.

---

## 4. How to instantiate (step by step)

1. **Copy** the entire `_portable/` folder into the new project (e.g. as `docs/workflow/_portable/`).
2. **Copy** all 15 `_portable/templates/*.md` into your chosen `<templates_dir>` (e.g. `.agents/templates/`).
3. **Create** `<project_background_file>` from the template in `01-workflow-model.md` §9; fill in all
   §3.3 placeholders above.
4. **Search-and-replace** the §3.1 / §3.2 path and skill placeholders across `<templates_dir>/*.md`
   and your `<project_background_file>`. Replacing `<skill_prefix>` once resolves every skill name
   (see §3.5). The §3.4 runtime fill-in tokens are NOT replaced at this step — the subagents fill
   them in at runtime. The portable docs themselves can stay as-is (they are the spec, not the
   instance) — only the templates and background file need concrete values.
5. **Copy** the generation script — `scripts/setup_subagents_v2.py` + `.sh` +
   `setup_subagents_v2_skills.py` — into `<repo>/scripts/`, then adjust the constants its header
   marks `# >>> ADJUST` (`TEMPLATES_DIR`, `BACKGROUND_FILE`, `SKILLS_DIR`, the model-slug maps). It
   is a runnable reference, not a re-implement-it spec. See `scripts/README.md`.
6. **Run** the generation script to produce `.claude/agents/`, `.codex/agents/`, `.cursor/agents/`.
   ⚠️ The generator substitutes ONLY `<!-- INJECT:PROJECT_BACKGROUND -->`. It does **not**
   substitute the `<...>` path tokens inside generated agent bodies — those are propagated by hand
   into `.claude/.codex/.cursor` (targeted), as are any post-generation hand-fixes. Re-running with
   `--force` **regresses** those hand-edits: re-run only when a template changed, then re-propagate.
6a. **(optional public-skill bundle)** Run the generation script again with `--include-skills`
   to render the public-skill shims under `<public_skill_root>` into `.claude/skills/skill-*/SKILL.md`,
   `.codex/agents/skill-*.toml`, and `.cursor/rules/skill-*.mdc`. Optional `--skills NAME[,NAME]`
   selects a subset. Without `--include-skills`, behavior is byte-identical to step 6.
   Then (optional) follow `<mcp_servers_root>/README.md` for the Playwright MCP and Rube install
   commands — those servers stay out of the generator path. Skip this step entirely if the project
   does not adopt the public-skill bundle.
7. **(event-driven `B-*` / `C-*` variants only)** Copy **all** of `_portable/scripts/*` into
   `<cowork_scripts_dir>` (the full set incl. `lib_hook_helpers.sh` — `git-post-commit`
   hard-depends on it; copying only the dispatch/wrapper scripts yields a hook that resolves no
   vendor and dispatches nothing). Replace each script's `<...>` placeholders. Then install
   `.git/hooks/post-commit` as a **chained wrapper** (NOT a symlink): it backs up any pre-existing
   post-commit hook and runs it, then `source <cowork_scripts_dir>/lib_hook_helpers.sh` and execs
   `<cowork_scripts_dir>/git-post-commit`. Prereqs for this path: `gtimeout` (`brew install
   coreutils`); `flock` (`brew install util-linux` — **keg-only on macOS, NOT on PATH**; the
   dispatch scripts probe `/opt/homebrew/opt/util-linux/bin/flock`); an authenticated `codex` CLI;
   `cursor-agent login` (cursor-agent runs `--force` on default model `gpt-5.5-high`, override via
   `CW_CURSOR_MODEL`). Skip this entire step for synchronous variants (`A-Claude` / `D-*`).
7a. **Render portable-sourced project workflow skills.** Extract
   `<skill_prefix>feature-full-loop` from `04-automation-loop.md` Appendix and
   `<skill_prefix>roadmap-loop` from `06-roadmap-orchestration.md` Appendix, apply the target
   placeholder map, write them to `<skill_root>/`, and register them in the target's skill registry.
   Treat `_portable/04` and `_portable/06` as the sources; do not hand-patch only the target copies.
8. **Write** a project-local concrete workflow doc (`<project_workflow_doc>`) — the worked instance,
   like this repo's `project/SUBAGENT_WORKFLOW_V2.md`. The portable docs stay generic; the project
   doc records "how it was actually wired here".
9. **Test-run** on one small feature, then one bugfix, before overwriting any pre-existing agents.

---

## 5. How to generate the agent configs

The 15 subagent templates in `templates/` are the single source of truth — 12 workers/loops plus 3
compatibility orchestrators (`feature-full-loop` / `bugfix-full-loop` / `feature-phase-review`). The generation
script expands them into three tool-specific config sets. The full spec is in `01-workflow-model.md` §10
(generation strategy, the format-compliance field-mapping table, conversion steps, parameters,
post-generation checks) and `scripts/README.md` (what the script framework must do).

> The 3 orchestrator templates are compatibility contracts; the preferred single-feature runtime on
> hosts that withhold recursive Task is the project-prefixed `<skill_prefix>feature-full-loop` skill.
> A new project that only wants the manual subagent pipeline can defer generating the compatibility
> contracts, but they are part of the single source of truth and ship with `_portable/templates/`.

Key points:

- One template → three outputs (Claude `.md`, Codex `.toml`, Cursor `.md`), driven by the platform
  extension fields in each template's frontmatter (`allowed_tools`, `color`, `codex_sandbox_mode`,
  `cursor_readonly`, `cursor_is_background`).
- Permission tightening must happen at the **tool layer**, not just in the prompt — see the
  permission/sandbox matrix in `01` §11.1.
- The generation script must also drop a global `.codex/config.toml` with `[agents] max_depth = 2`,
  or the loop orchestrators cannot spawn workers.

---

## 6. What is NOT in the portable layer (by design)

The portable layer deliberately excludes anything that would change between projects. If you need
the Any2Knowledge concrete instances — the rendered `a2k-*` skill specs, the V2 landing details, the
SOPs, the automation scripts, the conductor playbook — look in `../project/`. The exception is a
portable source draft such as the `<skill_prefix>roadmap-loop` appendix in `06`: migration renders it
into a project-prefixed skill instead of treating the target copy as the source. Deprecated V1
material is in `../_archive/`. See `../README.md` for the three-layer map.

---

## 7. Migrating with a skill instead of by hand

§4 above is the by-hand instantiation procedure. It is also automatable: the appendix below is a
portable **migration skill** that *executes* §4 — it scans a target repo, infers the §3 placeholder
values (asking where ambiguous), then copies `_portable/`, fills the placeholders, runs the
generation script, verifies the result, and can later update already-migrated targets. It has three modes:

- **`survey`** — read-only. Scans the target repo, drafts the filled §3 placeholder table + the
  `<project_background_file>` content + a migration plan, and STOPS for human review. Writes nothing
  into the target repo.
- **`instantiate`** — consumes a reviewed survey plan. Copies `_portable/`, fills placeholders, copies
  and adjusts the generation script, runs it, verifies counts + lint, then STOPS and emits a
  **project-layer checklist**. It deliberately does **not** scaffold the target's project-layer docs
  (`<project_workflow_doc>`, the SOPs, `<your_commit_convention>`) — authoring those stays with the
  human, exactly like §4 step 7. Project-prefixed workflow skills with a portable source, currently
  `<skill_prefix>roadmap-loop`, are rendered from that source before the checklist.
- **`resync`** — updates an already-migrated target after the source portable workflow changes.
  Refuses dirty targets, preserves project customizations, refreshes portable agents / public
  skills / scripts, re-renders portable-sourced workflow skills, then STOPS with a project-layer
  doc-delta checklist.

The skill runs from the *source* project (where `_portable/` already lives) and operates on a target
repo path, so there is no chicken-and-egg problem. The split — automate the mechanical copy + fill +
generate + verify, stop at the judgement-heavy project layer — is the same boundary §4 draws.

---

# Appendix — the `<skill_prefix>workflow-migrate` SKILL.md draft

> At landing time, copy the fenced block below into
> `<skill_root>/<skill_prefix>workflow-migrate/SKILL.md` and replace `<skill_prefix>`. This is a
> draft — before landing, align the frontmatter fields and directory conventions with the project's
> skill convention (use an existing skill as the reference). §3 (the placeholder table) and §4 (the
> instantiation steps) of this manifest are the source of truth; the skill *executes* them and must
> not re-define them.

````markdown
---
name: <skill_prefix>workflow-migrate
description: Migrate or resync the portable agent/skill workflow paradigm into another project. survey mode scans a target repo, instantiate mode copies the portable layer and generates agents/public skills, and resync mode updates already-migrated projects without clobbering local customizations. Triggers: migrate the workflow, resync workflow, port the workflow to another project, set up the workflow in a new repo, instantiate the portable layer.
---

# <skill_prefix>workflow-migrate

Migration skill for the portable workflow paradigm. Full spec: `docs/workflow/_portable/00-PORTABLE-MANIFEST.md`
— §3 (the placeholder table) and §4 (the instantiation steps) are the source of truth. This skill
*executes* §4; it does not re-define the procedure.

## 0. Hard constraints (inviolable in any mode)

1. **survey never writes into the target repo.** It only reads the target and writes a migration
   plan into the source project's scratch area for human review. Every target-repo write happens in
   instantiate mode.
2. **instantiate copies the portable docs verbatim — it never edits them in the target.** Only
   `<templates_dir>/*.md`, `<project_background_file>`, the copied generation script, and the copied
   automation-loop shell scripts get search-replaced / adjusted. The portable docs are the spec, not
   the instance.
3. **Never scaffold the target's project-layer docs.** `<project_workflow_doc>`, the SOPs,
   `<your_commit_convention>`, the project-layer instance docs — those are the human's to author.
   instantiate stops at "configs generated + checklist emitted".
4. **Agent names are frozen; only `<skill_prefix>` and the §3.1 / §3.2 / §3.3 placeholders are
   replaced.** Never rename a subagent during migration (§3.5 naming-stability policy).
5. **Ask before guessing.** Whenever a placeholder value is genuinely ambiguous from the target
   repo's structure, raise a focused AskUserQuestion round — never silently guess a path that
   determines where generated agents land.
6. **Every exit of every mode ends with an explicit, copy-pasteable Next Step** (the Universal Next
   Step Contract — `02-handoff-and-state.md` §3.3).
7. **instantiate is gated on a reviewed survey.** It consumes a survey plan; it does not re-derive
   placeholders itself. If invoked without a reviewed plan, it runs survey first and stops at the
   review gate.
8. **resync never runs against a dirty target, and never silently overwrites a hand-customized
   template.** Before any write, resync checks the target's git working tree for every path it
   would touch; if any is dirty it STOPS read-only and tells the human to commit/stash. If a target
   template diverges from upstream beyond placeholder substitution (the project customized it),
   resync lists the conflict and STOPS for a human 3-way merge — it does not clobber.
9. **Source-first only.** Do not patch generated outputs or target runtime copies as the primary
   fix. Source locations are: `_portable/templates/` for generated agents,
   `_portable/scripts/` for cowork scripts, `_portable/06-roadmap-orchestration.md` appendix for
   `<skill_prefix>roadmap-loop`, and `_portable/skills/` for public shims. Project/generated copies
   must be rendered from these sources or listed as conflicts.

## 1. Mode detection

- call arguments contain `mode: survey`, or only a target repo path is given → **survey mode**.
- call arguments contain `mode: instantiate`, or a reviewed `plan:` file is given → **instantiate mode**.
- call arguments contain `mode: resync` (or `mode: update`), OR the target already has a populated
  `docs/workflow/_portable/` + a non-empty `<templates_dir>/` (i.e. it was migrated before and is
  now behind upstream) → **resync mode**.
- when both could be inferred, the explicit `mode:` argument wins.
- instantiate with no reviewed plan → run survey first, stop at its review gate, do not proceed.

## 2. survey mode

Input: a path to the repo the workflow is being migrated into. Output: a migration plan (filled §3
placeholder table + drafted `<project_background_file>` content + a per-step checklist), written to
the source project's scratch area; STOP for human review. Writes nothing into the target repo.

1. **Scan the target repo structure.** Walk the top-level layout and build a map: where business
   modules live, whether there is a separate core/infra root, a pluggable-capability root, a
   frontend root, a docs root. Read the target's README / CLAUDE.md / equivalent for stated
   conventions.
2. **Infer the §3.1 path / structure placeholders.** Map each one to a concrete target path from
   the scan. Where the target has no equivalent (e.g. no plugin root), mark the placeholder N/A.
3. **Infer the §3.2 skill / role placeholders.** Derive `<skill_prefix>` from the target's existing
   skill naming, or propose one; the role placeholders are paradigm-fixed and need no inference.
4. **Draft the §3.3 project-identity values** for `<project_background_file>` — project name,
   one-sentence summary, API response shape, preferred models — pulling from the target's own docs
   where possible.
5. **Ask where ambiguous.** Batch every placeholder whose value is not unambiguous from the scan
   into one focused AskUserQuestion round. Never guess a path that determines where generated
   agents land.
6. **Emit the migration plan** — the filled §3 placeholder table, the drafted background-file
   content, a per-step checklist mirroring §4, and a note of which §3.4 runtime tokens are left for
   the subagents to fill. STOP. Tell the human to review the plan, then re-invoke in instantiate
   mode with it.

## 3. instantiate mode

Input: a reviewed survey plan. Output: a fully wired workflow in the target repo (portable layer
copied, templates filled, generation script run, configs generated, lint passing) + a project-layer
checklist. STOP.

1. **Copy `_portable/`** into the target (e.g. as the target's `docs/workflow/_portable/`), verbatim.
2. **Copy the 15 templates** `_portable/templates/*.md` into the target's `<templates_dir>`.
3. **Create `<project_background_file>`** from the plan's drafted content.
4. **Search-and-replace** the §3.1 / §3.2 / §3.3 placeholders across `<templates_dir>/*.md` and
   `<project_background_file>`, using the plan's table. Replacing `<skill_prefix>` once resolves
   every skill name. The §3.4 runtime tokens are left untouched.
5. **Copy the generation script** `_portable/scripts/setup_subagents_v2.py` + `.sh` +
   `setup_subagents_v2_skills.py` (the public-skill submodule) into the target's `scripts/`, then
   adjust the four constants its header marks `# >>> ADJUST` (`TEMPLATES_DIR`, `BACKGROUND_FILE`,
   the model-slug maps) to the target's values. Set `SKILLS_DIR` to point at the target's
   `<public_skill_root>` (the project running script's `ROOT` resolves to the repo root, so the
   path is typically `ROOT / "docs" / "workflow" / "_portable" / "skills"`).
5a. **(optional public-skill carry-over)** Copy `_portable/skills/` verbatim into the target's
   `<public_skill_root>` and `_portable/mcp-servers/` into `<mcp_servers_root>`. The shims are
   project-agnostic; no placeholder substitution is needed. Skip if the target opts out of the
   public-skill bundle.
6. **(event-driven `B-*` / `C-*` variants only)** Copy **all** of `_portable/scripts/*` into the
   target's `<cowork_scripts_dir>` — the full set including `lib_hook_helpers.sh` (`git-post-commit`
   hard-depends on its `determine_other_vendor` / `render_*_prompt`; copying only the
   dispatch/wrapper/`lib_phase_verdict.sh` subset yields a hook that resolves no vendor and
   dispatches nothing). Replace every script's `<...>` tokens. Then install `.git/hooks/post-commit`
   as a **chained wrapper** (NOT a symlink): back up + run any pre-existing post-commit hook, then
   `source <cowork_scripts_dir>/lib_hook_helpers.sh` and exec `<cowork_scripts_dir>/git-post-commit`.
   Prereqs: `gtimeout` (`brew install coreutils`); `flock` (`brew install util-linux` — keg-only on
   macOS, NOT on PATH; scripts probe `/opt/homebrew/opt/util-linux/bin/flock`); authenticated
   `codex` CLI; `cursor-agent login`. Skip this whole step for synchronous variants (`A-Claude` /
   `D-*`) — see `04-automation-loop.md` §3.
6b. **Render project-prefixed workflow skills with portable sources.** Extract
   `<skill_prefix>feature-full-loop` from `_portable/04-automation-loop.md` Appendix and
   `<skill_prefix>roadmap-loop` from `_portable/06-roadmap-orchestration.md` Appendix, replace the
   project placeholders (`<skill_prefix>`, `<step0-skill>`, paths from §3), and write them to
   `<skill_root>/`. This is a source render, not a project-layer hand patch. Other project SOP skills
   that do not have a portable source still stay in the human checklist.
7. **Run the generation script** to produce `.claude/agents/`, `.codex/agents/`, `.cursor/agents/`
   and `.codex/config.toml`. ⚠️ The generator substitutes ONLY `<!-- INJECT:PROJECT_BACKGROUND -->`;
   the `<...>` path tokens in generated agent bodies (and any post-gen hand-fix) are propagated by
   hand into `.claude/.codex/.cursor`. Re-running with `--force` **regresses** those — re-run only
   on template change, then re-propagate. Flag this in the emitted checklist.
8. **Verify.** Count (without `--include-skills`): 15 templates → 15 × 3 = 45 generated configs +
   1 `.codex/config.toml`. Count (with `--include-skills`): 15 × 3 = 45 frozen + 9 × 3 = 27
   skill outputs = **72 outputs** + 1 `.codex/config.toml`. Skip the +27 if the target opted out of
   the public-skill bundle. Run `check_portable_sync.py` against the copied portable layer (must
   PASS). Spot-check that no `<placeholder>` token survived in `<templates_dir>/*.md` or the
   generated configs.
9. **Emit the project-layer checklist and STOP.** Do not author the project-layer docs — list them
   for the human:
   - write `<project_workflow_doc>` — the concrete V2 landing (use the source project's instance as
     the reference)
   - write `<your_feature_sop>` / `<your_bugfix_sop>` / `<your_commit_convention>`
   - land all required `<skill_prefix>`-prefixed workflow skills into `<skill_root>` and register them
     in the target's skill registry; do not migrate only one entry point.
     `<skill_prefix>feature-full-loop` and `<skill_prefix>roadmap-loop` are rendered automatically
     from `_portable/04` and `_portable/06` in step 6b. Remaining reusable skills still need
     project-layer sources or human landing: the Step 0 brief skill, `<skill_prefix>workflow-migrate`,
     sync/registry governance helpers
     (`portable-sync-check`, skills/agents registry, etc.), plus any project SOP skills the source
     workflow expects. These project-prefixed skills are not the same as `_portable/skills/*` public
     shims.
   - test-run on one small feature, then one bugfix, before passing `--replace-claude`

## 4. resync mode

Input: a target repo path that was migrated by an earlier `instantiate` and is now behind upstream
`_portable/`. Output: the target's portable layer + instantiated scripts/agents brought up to date,
plus a **project-layer doc-delta checklist** the human must hand-apply. STOP.

resync is the repeatable answer to "the source workflow had a big update — sync my already-migrated
project". It is **idempotent** (safe to re-run) and **non-destructive** (constraint §0.8).

1. **Precondition — clean-target gate (read-only until it passes).** `git -C <target> status --short`
   for every path resync writes: `docs/workflow/_portable/`, `<cowork_scripts_dir>/`,
   `<templates_dir>/`, `.claude/agents/` `.codex/agents/` `.cursor/agents/`, the copied
   `<setup_script>`, `<skill_root>/<skill_prefix>feature-full-loop/SKILL.md`,
   `<skill_root>/<skill_prefix>roadmap-loop/SKILL.md`, and
   `scripts/lint/check_portable_sync.py` if present. If ANY is dirty → STOP with Handoff
   `Status: BLOCKED`, Blocker listing the dirty paths, Next Step "commit or stash the target's work,
   then re-run resync". Never clobber uncommitted work.
2. **Resolve the target's placeholder map.** Prefer a recorded migration plan; else re-derive it
   survey-style from the target's existing instantiated artifacts (`<project_background_file>`,
   substituted `<cowork_scripts_dir>/*`, the `<setup_script>` ADJUST constants). AskUserQuestion for
   any slot still ambiguous — `<skill_prefix>` especially (it is not recoverable from substituted
   scripts alone).
3. **Show the upstream delta.** Summarize what changed in source `_portable/` since the target's
   copy (diff the two `_portable/` trees; list new files like `scripts/lib_hook_helpers.sh`,
   changed scripts, changed `04` / `07` / `00-MANIFEST`, changed templates). Do not dump full diffs.
4. **Overwrite the target `docs/workflow/_portable/` verbatim** from source (it is project-agnostic;
   this is always a safe whole-tree replace once §1 passed). This includes `_portable/skills/` and
   `_portable/mcp-servers/` — both are project-agnostic and ride the same whole-tree replace.
   Additionally re-overwrite `<public_skill_root>` (from `_portable/skills/`) and `<mcp_servers_root>`
   (from `_portable/mcp-servers/`) if the target adopted the public-skill bundle.
5. **Re-render `_portable/scripts/*` → `<cowork_scripts_dir>/`** with the target's token map — the
   FULL set including any new files. Re-confirm `.git/hooks/post-commit` is the chained wrapper
   (`00-PORTABLE-MANIFEST.md` §4). Scan: no `<placeholder>` may survive in `<cowork_scripts_dir>/`.
6. **Re-instantiate templates with a conflict guard.** For each `_portable/templates/*.md`, compute
   the placeholder-substituted upstream form and compare to the target's `<templates_dir>/` copy. If
   they differ ONLY by upstream content → overwrite. If the target copy has project-specific
   hand-customization (differs beyond substitution) → **do NOT overwrite**; add it to a CONFLICTS
   list. The same conflict guard extends to every `_portable/skills/<name>/SKILL.md` shim (a
   project-customized shim → CONFLICTS list, STOP for human 3-way merge). Then run the
   `<setup_script>` (with `--include-skills` if the target adopted the public-skill bundle) to
   regenerate `.claude/.codex/.cursor` (note the `--force` regression caveat — `00-MANIFEST` §4
   step 6; targeted re-propagation for any hand-fixed agents). If CONFLICTS is non-empty, STOP
   after this step for human 3-way merge before generating.
   **Active Claude replacement gate:** after all CONFLICTS are clear, if the target has both
   `.claude/agents/` and `.claude/agents-v2/` and the two directories differ, resolve
   `replace_claude` before finishing — even when this resync did not regenerate templates. If the
   invocation includes `replace_claude: yes`, replace active `.claude/agents/` with the regenerated
   output. If it includes `replace_claude: no`, keep `.claude/agents-v2/` only and report that active
   Claude may remain old. If it is omitted, run an AskUserQuestion before replacement. If an earlier
   gate is BLOCKED by dirty paths or CONFLICTS, STOP there first and do not ask the replacement
   question until the next clean rerun:
   - **Question:** Replace active `.claude/agents/` with regenerated agents now?
   - **Option 1 — `yes` (Recommended for full resync):** replace `.claude/agents/` with the
     regenerated Claude agents so the Claude Code active surface matches `_portable/`, templates,
     Codex, Cursor, and `.claude/agents-v2/`. Choose this when the target actually uses Claude Code
     from `.claude/agents/` and you want `ship`, `feature-*`, and other active agents to be current.
     Impact: active-only hand edits in `.claude/agents/` are overwritten; they should first be moved
     to the source templates/portable docs or captured as CONFLICTS.
   - **Option 2 — `no`:** keep `.claude/agents-v2/` as the regenerated review copy and leave active
     `.claude/agents/` untouched. Choose this only when the target is not currently using Claude
     Code active agents, or when a human wants to inspect/copy the regenerated files manually.
     Impact: Codex/Cursor and `.claude/agents-v2/` are current, but Claude Code may still execute
     stale `.claude/agents/` behavior until a later replacement.
6b. **Re-render project-prefixed workflow skills with portable sources.** For
   `<skill_prefix>feature-full-loop`, extract the canonical `SKILL.md` source from the updated
   `_portable/04-automation-loop.md` Appendix; for `<skill_prefix>roadmap-loop`, extract the
   canonical `SKILL.md` source from the updated `_portable/06-roadmap-orchestration.md` Appendix.
   Apply the target token map to both. If the target's existing rendered skill equals the previous
   rendered source (or is absent), overwrite it with the new render. If it contains project
   hand-customization beyond the render, add it to CONFLICTS and STOP for a human 3-way merge. This
   is what makes a second resync report "up to date" for feature-full-loop / roadmap-loop instead of
   repeatedly asking for manual skill updates.
7. **Refresh the lint.** If the project carries `scripts/lint/check_portable_sync.py`, replace it
   from source. The source lint is target-project-aware: it infers `<skill_prefix>`, skill root,
   `<feature_root>`, workflow doc, and roadmap paths from the checked repo, so target token-map
   differences such as `xai-` / `packages/` are not a reason to fork or block on this file. If the
   target lint has unrelated project-only checks that cannot be preserved by the shared source lint,
   list those as a CONFLICT; otherwise take the source copy verbatim. If the target does not carry
   the lint, list it in the checklist as a recommended add. Run it — must PASS (it catches any
   placeholder left unsubstituted in §5 and any portable-sourced workflow skill drift from §6b).
8. **Emit the project-layer doc-delta checklist + STOP.** resync NEVER edits the target's own
   `<project_workflow_doc>` / SOPs / usage-guide-equivalent (constraint §0.3). Instead, list the
   specific upstream changes the human must hand-apply there (e.g. "Phase 0 is now 3-field — add the
   Requirement gate + Verify Cross-vendor companion to your SUBAGENT_WORKFLOW_V2 §2.5 + dev_log
   schema", "drop any Plan/Build Executor wording", "Task-withheld-subagent constraint",
   "`feature-full-loop` runtime moved to `<skill_prefix>feature-full-loop` parent-session skill",
   "roadmap-loop default dispatch is emit, not spawn"). Do not list
   `<skill_prefix>feature-full-loop` or `<skill_prefix>roadmap-loop` as manual follow-ups when step
   6b rendered them cleanly; instead say they are up to date. List only workflow skill deltas that
   still lack a portable source or were blocked by CONFLICTS. `_portable/skills/*` public shims are
   refreshed mechanically, but most project-prefixed SOP skills remain project-layer artifacts. End
   with a Next Step: review
   CONFLICTS (if any), apply the doc deltas, update any still-manual workflow skills, then test-run
   one feature to confirm the B/C hooks work end-to-end. If there are no portable deltas,
   no generated/script diffs, no workflow-skill renders, and no project-layer checklist items, report
   "up to date" explicitly.

## 5. Exception handling

- **target repo path invalid / unreadable** → stop, report, do not proceed.
- **a §3.1 placeholder has no target equivalent and is not optional** → AskUserQuestion; never guess.
- **generation script fails** → surface the error verbatim, do not partially-verify. The target is
  left with the portable layer + templates copied, which is safe — nothing destructive ran.
- **`check_portable_sync.py` fails after the copy** → report which rule tripped; the likeliest cause
  is a template that was hand-edited in the source project. Fix it in the source, then re-copy —
  never patch the target's copied portable layer directly.
- **pre-existing `.claude/agents/` in the target** → the generation script defaults to
  `.claude/agents-v2/`; resync must either receive `replace_claude: yes|no` or ask whether to replace
  active `.claude/agents/`. For full sync, the recommended answer is yes.

## 6. The skill satisfies the Universal Next Step Contract

Both modes terminate with a copy-pasteable Next Step block (`02-handoff-and-state.md` §3.3):
survey's points at "review the plan, then re-invoke in instantiate mode with it"; instantiate's is
the project-layer checklist of §3 step 9.
````
