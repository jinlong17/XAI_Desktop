# _portable/scripts/ — Generation Script + Automation-Loop Reference Scripts

This folder holds two things, **both shipped as real, runnable files** — the portable layer is
"copy and it works", not "copy and re-implement":

1. **The agent-config generation script** — `setup_subagents_v2.py` + `setup_subagents_v2.sh` — the
   script that turns the templates in `../templates/` into tool-specific agent configs (Claude
   `.md`, Codex `.toml`, Cursor `.md`). It **is** bundled here as a working reference (it used to be
   spec-only; bundled 2026-05-15). It is a real Python script, not a placeholder template — copy it
   verbatim, then adjust the four constants its header marks `# >>> ADJUST`. The "What the script
   does" spec below stays as the contract documentation.
2. **Real reference shell scripts for the event-driven automation variants** —
   `lib_phase_verdict.sh`, `dispatch_codex.sh`, `dispatch_cursor.sh`, `git-post-commit`,
   `codex_wrapper.sh`, `cursor_wrapper.sh`. These use `<...>` placeholder tokens and are copied into
   a project's `<cowork_scripts_dir>` (see the section near the end).

## Migrating the generation script to a new project

Copy `setup_subagents_v2.py` + `setup_subagents_v2.sh` to `<repo>/scripts/`. Placement at
`<repo>/scripts/` is the only path assumption — `ROOT` is derived from the script's own location.
Then review the four constants the `.py` header marks `# >>> ADJUST`: `TEMPLATES_DIR`,
`BACKGROUND_FILE`, the model-slug maps (`CLAUDE_MODEL_MAP` / `CURSOR_MODEL_MAP`), and the Codex
model constants (`CODEX_STRONG_MODEL` / `CODEX_FAST_MODEL`). Everything else is project-agnostic.
The migration skill's `instantiate` mode (`../00-PORTABLE-MANIFEST.md` appendix) automates the copy
and prompts for the constants.

> The reference project's own copy lives at `scripts/setup_subagents_v2.{py,sh}` — this bundled
> file is kept byte-identical to it except for the portable-reference header.

## What the script does

See `../01-workflow-model.md` §10 ("Cross-tool generation script model") for the full spec. In brief:

1. **Inputs:** `<templates_dir>/*.md` (the unified template source — start from `../templates/`) and
   `<project_background_file>` (the project background, see `01-workflow-model.md` §9).
2. **Per template:** parse frontmatter + body, including the platform extension fields
   (`allowed_tools`, `color`, `codex_sandbox_mode`, `cursor_readonly`, `cursor_is_background`).
3. **Inject** the project background by replacing `<!-- INJECT:PROJECT_BACKGROUND -->`.
4. **Map fields per platform** (model slugs follow the per-platform tiering policy in
   `../01-workflow-model.md` §10.4 — Claude keeps the opus/sonnet/haiku tier split; Codex and Cursor
   are **flat**, one model for every agent, in the reference project Codex = `gpt-5.5` and Cursor =
   `inherit`):
   - Claude Code → keep Markdown + frontmatter, map the abstract tier to a Claude model alias, inject `tools` / `color`
   - Codex → convert to TOML, `strip()` the body into `developer_instructions`, inject `sandbox_mode` / `model_reasoning_effort` (flat `high`)
   - Cursor → keep Markdown, set the flat model slug (reference project: `inherit`), conditionally inject `readonly` / `is_background`
5. **Output** to `.claude/agents/` (or `.claude/agents-v2/` in safe mode), `.codex/agents/`, `.cursor/agents/`,
   with skip / backup / overwrite handling.
6. **First run:** auto-create `.codex/config.toml` with `[agents] max_depth = 2` so orchestrators can spawn workers.
7. **Print a generation summary.**

## Required parameters

```text
--targets claude,codex,cursor
--replace-claude
--force
--dry-run
```

## Post-generation checks

See `../01-workflow-model.md` §10.8 — count checks, content checks, and format-compliance checks
(full model IDs, read-only review agents, verb-first descriptions, etc.).

---

## Reference shell scripts for the event-driven automation variants

The generation script above produces the agent configs. The **event-driven** automation variants
(hook-relay and phase-granularity — see `../04-automation-loop.md` §3) need a second set of shell
scripts: the cross-process relay plumbing. **The portable layer ships these as real reference
scripts in this folder:**

| File | Role |
|------|------|
| `lib_phase_verdict.sh` | the shared `read_phase_verdict()` four-state reader (sourced by every reader) |
| `dispatch_codex.sh` / `dispatch_cursor.sh` | fire-and-forget dispatch of one build prompt to Codex / Cursor |
| `git-post-commit` | the neutral cross-tool relay trigger (chained wrapper at `.git/hooks/post-commit`, NOT a symlink) |
| `lib_hook_helpers.sh` | project-layer helpers `git-post-commit` HARD-DEPENDS on (`determine_other_vendor` / `determine_lead_from_variant` / `render_*_prompt`); ships here as a working reference — copy + de-placeholder like the others |
| `codex_wrapper.sh` / `cursor_wrapper.sh` | thin quota-aware wrappers that detect executor exhaustion |

They use `<...>` placeholder tokens for project-specific paths (`<feature_root>`,
`<orchestrator_marker_dir>`, `<quota_state_dir>`, `<cowork_scripts_dir>`) — replace them per
`../00-PORTABLE-MANIFEST.md` §3, then copy the scripts into your project's `<cowork_scripts_dir>`.
The Codex / Cursor CLI invocations in them are **literal and portable** — Codex and Cursor are the
two external executors of the paradigm (see `../04-automation-loop.md` §3). The subsections below
document each script's contract: its inputs, outputs, and exit-code contract.

> The synchronous variants (single-IDE, lead-and-delegate) need **none** of the dispatch / hook
> plumbing — they run entirely inside one IDE session via native sub-agent spawn. (`lib_phase_verdict.sh`
> is still used by the phase-granularity verify path.) Only enable the hook/dispatch plumbing when you
> actually adopt an event-driven variant.

### `lib_phase_verdict.sh` — the shared Phase Verdict reader

The single implementation of the `read_phase_verdict()` four-state protocol (`../04-automation-loop.md`
§8.2). Every reader (orchestrator INTAKE, post-commit hook, verify agent's verify-after-phases entry
check) **sources this one file** rather than re-deriving the logic.

- **Inputs:** `read_phase_verdict <feature> <phase_num>` (resolves the dev_log path from the feature
  name), and `read_phase_verdict_from_path <dev_log_abs_path> <phase_num>` (for unit tests / cross-feature
  calls).
- **Output (stdout):** exactly one of `PASS` | `BLOCKED` | `NONE` | `ERROR`.
- **Exit code:** `0` on `PASS` / `BLOCKED` / `NONE`; `1` on `ERROR` or a missing dev_log file.
- May also expose a helper like `all_phases_pass <feature> <n_phases>` → exit `0` if every phase is
  `PASS`, `1` otherwise.
- Recommended: ship a `bats` test file alongside it covering the four states.

### `dispatch_codex.sh` / `dispatch_cursor.sh` — external-executor dispatch scripts

One per external executor (Codex, Cursor). Fire-and-forget: it hands a prompt to an external tool
and returns immediately; it does **not** wait for the external work to finish.

- **Inputs:**
  - `$1 = <feature>`
  - `$2 = <prompt_file>` (absolute path; the rendered dispatch prompt the orchestrator or the
    post-commit hook wrote to `<orchestrator_marker_dir>/`)
  - `$3 = <agent_name>` (optional; **NEW 2026-05-16**; defaults to `feature-auto-build` for
    back-compat with the pre-extension B-* contract). Legal values: `feature-plan` /
    `feature-review` / `feature-auto-build` / `feature-verify` / `bug-diagnose` / `bug-fix` /
    `bug-auto-fix` / `bug-verify`. Any other value → exit code 2.
- **Outputs (side effects):** starts the external executor (headless CLI is the reliable path — see
  `../04-automation-loop.md` §2.6 + §3.4); writes a run log somewhere the user can `tail` (log
  filename includes `<agent_name>` so multi-step runs don't clobber each other).
- **Exit code:** `0` if the external executor was successfully launched; non-zero if it could not be
  launched (binary missing, unknown agent_name, etc.) — the orchestrator uses this to decide whether
  to fall through the quota fallback chain.
- **Cross-vendor identity routing:** these scripts are **vendor-pure** — they do not decide "which
  vendor should run this step". The caller (orchestrator or post-commit hook) reads `Plan Executor:`
  / `Build Executor:` from the dev_log Status Panel and chooses `dispatch_codex.sh` vs
  `dispatch_cursor.sh` accordingly. See `git-post-commit` below.
- Must **not** write the dev_log Status Panel. The dispatched agent itself writes the Status Panel
  per the §16.3 / §2.6 write-authority matrix.

### `codex_wrapper.sh` / `cursor_wrapper.sh` — quota-aware executor wrappers

A thin wrapper around each external executor's CLI that intercepts its output to detect quota
exhaustion (`../04-automation-loop.md` §2.5 — use loose keyword matching + CLI exit code + structured
JSON from multiple sources; never hard-depend on a single error string).

- **Inputs:** pass-through of the underlying CLI's arguments.
- **Outputs (side effects):** on a detected quota-exhaustion signal, writes
  `<quota_state_dir>/<executor>-exhausted-until` containing a future UNIX timestamp.
- **Exit code:** mirrors the underlying CLI's exit code (so callers can still branch on it).

### `git-post-commit` — the event-driven multi-state dispatcher

**Pre-2026-05-16:** the hook detected `dev_log.md` changes, found the matching `awaiting_*` marker,
and notified the user to resume. BUILD-only dispatch path; review and verify hand-offs stayed
manual.

**2026-05-16 extension:** the hook is now a **multi-state Status Panel dispatcher** per
`../04-automation-loop.md` §3.4. It installs as a **chained wrapper** at `.git/hooks/post-commit`
(backs up + runs any pre-existing post-commit hook, then `source`s `lib_hook_helpers.sh` and execs
this script — NOT a symlink, so it coexists with other post-commit hooks). The marker-file path is
retained as a fallback for legacy / C-* per-phase cases. After parsing the new Status from the
just-committed dev_log, it routes:

| Status | Action |
|---|---|
| `NEEDS_REVIEW` | dispatch `feature-review` to the OTHER vendor (§16.3 #3 STRICT). Resolves the executor from the rolling `- Executor:` Status Panel line (it greps `- Plan Executor:` then falls back to `- Executor:`; **there is no dedicated Plan/Build Executor field** in the schema). `vendor_dispatchable()` short-circuits the sentinels `MANUAL_CLAUDE` / `UNKNOWN` to a clean notify (never a bogus `dispatch_UNKNOWN.sh` / `dispatch_MANUAL_CLAUDE.sh`). |
| `APPROVED` (B-* only) | dispatch `feature-auto-build` to the lead vendor named by the variant. |
| `READY_FOR_VERIFY` | if `Verify Cross-vendor: yes`: resolve via the rolling `- Executor:` line (greps `- Build Executor:` then falls back) → dispatch `feature-verify` to OTHER vendor. If `no`: notify only (lead-handled or direct-ship). |
| `REVISE` | notify user (manual: feed REVISE back to `feature-plan`, re-loop). |
| `BLOCKED` | notify user (read dev_log Blocker section). |
| `READY_TO_SHIP` / `SHIPPED` | notify user (manual ship gate). |
| C-* `awaiting_phase_<N>_build` marker | notify user to run `feature-phase-review` for Phase N (unchanged). |
| C-* `awaiting_phase_<N>_review` marker | read Phase N Verdict via `read_phase_verdict()`; notify on PASS / BLOCKED (unchanged). |

- **Inputs:** none (git invokes it; it inspects `HEAD`).
- **Exit code:** **always `0`** — a hook failure must be a no-op, never block a commit. All real
  work (notify + dispatch) is best-effort.
- **Project-layer helpers** — ship as `lib_hook_helpers.sh` in this dir (a working reference; copy
  it into `<cowork_scripts_dir>/lib_hook_helpers.sh` and replace placeholders, same as the other
  scripts). Defines:
  - `determine_other_vendor <executor>` → echoes `codex` / `cursor` / `MANUAL_CLAUDE` / `UNKNOWN`
  - `determine_lead_from_variant <variant>` → echoes the lead vendor for `B-Codex` / `B-Cursor` / etc.
  - `render_review_prompt <feature>` / `render_build_prompt <feature>` / `render_verify_prompt <feature>` → stdout = prompt body for that step
  If `lib_hook_helpers.sh` is absent the multi-state branches degrade to notify-only — so a
  migration that copies only the dispatch/wrapper scripts gets a silently dead hook. Copy the
  FULL `_portable/scripts/*` set.
- Must **not** write the dev_log Status Panel; it only reads state, dispatches via
  `dispatch_<vendor>.sh`, and notifies.
- The hook's dispatch path is only active for `B-Codex` / `B-Cursor` / `C-Codex` / `C-Cursor`
  variants — A and D variants never enter this code (the orchestrator drives them directly).

### Optional: a marker / quota CLI

A small convenience CLI (e.g. `cw-quota mark-exhausted | status | resume`) for the developer to
inspect and manually clear quota state and orchestrator markers. Not required for the pipeline to
run; it just makes the scratch state (`<orchestrator_marker_dir>`, `<quota_state_dir>`) inspectable.

### Common contract across all of the above

- **None of these scripts ever write the dev_log Status Panel.** Status flips are reserved for the
  authorized subagents in the write-authority matrix (`../02-handoff-and-state.md` §2.6). Hooks /
  wrappers / dispatch scripts may only read state, append a Work Log line, or write marker / quota
  scratch files. This is the §4 "degradation never flips the Status Panel" rule of
  `../04-automation-loop.md`, enforced at the shell layer.
- Marker files follow the JSON v1 schema in `../04-automation-loop.md` §8.1.
- Paths inside markers are **repo-root-relative** where possible, so the plumbing is portable across
  dev machines.
