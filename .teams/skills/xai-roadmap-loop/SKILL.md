---
name: xai-roadmap-loop
description: >
  Roadmap orchestration layer (Layer 3.5). Parses a reviewed roadmap source doc into a manifest
  (init mode), then confirms dispatch mode and dispatches or emits xai-feature-full-loop work wave
  by wave to push every eligible feature to READY_TO_SHIP (run mode). Triggers: roadmap loop,
  roadmap orchestration, batch-run features, auto-develop a roadmap, advance a roadmap,
  roadmap manifest.
---

# xai-roadmap-loop

## Read First

- `docs/workflow/_portable/06-roadmap-orchestration.md` (the canonical spec)
- `docs/workflow/_portable/07-automation-mode-picker.md` (Mode picker)
- `docs/workflow/SUBAGENT_WORKFLOW_V2.md` (project-layer V2 landing)

Layer 3.5 roadmap orchestration skill. Full spec: `docs/workflow/_portable/06-roadmap-orchestration.md`.
This skill is the project-layer instantiation; the portable spec is the source of truth for
behaviour and the hard constraints below.

## 0. Hard constraints (inviolable in any mode)

1. **Never spawn `ship`.** Ship is always human-triggered (the project's V2 `ship` constraint).
2. **Never write any feature's `dev_log.md` Status Panel.** The skill writes only the roadmap
   manifest and — on the decompose path — the per-feature seed briefs (§2b step 5); it only *reads*
   every `dev_log`.
3. **Every feature needs an independent execution context unless `dispatch: serial` is explicit.**
   Default `dispatch: emit` emits a paste-ready `xai-feature-full-loop` prompt block for a
   new session/window. Recommended Claude Code `dispatch: bg` launches one background session per
   eligible feature and manages them through Agent View. `dispatch: serial` is the only mode allowed
   to inline the parent-session recipe, and it must dispatch the real worker agents directly from the
   caller context rather than spawning `feature-full-loop`.
4. **BLOCKED does not raise an exception and does not stop the whole roadmap.** Mark + skip + continue.
5. **Write the manifest to disk before and after every state-changing dispatch.** Crash recovery
   depends on this. In `emit` this means before emitting the wave summary and after every reconcile
   update; in `bg`, `serial`, and legacy `spawn` it also means before/after each feature dispatch.
6. **The manifest is the single source of state.** Never keep roadmap content in conversation memory.
7. **Every exit of every mode ends with an explicit, copy-pasteable Next Step** (the Universal Next
   Step Contract — `02` §3.3).
8. **init never auto-continues into run, and the decompose path never bypasses Step 0.** init always
   stops at the human review gate; the decompose path's seed briefs are Step 0's *input*, not a
   replacement for it.
9. **On the decompose path, ask before guessing.** When a decomposition decision is genuinely
   ambiguous and materially changes the manifest, raise a focused AskUserQuestion-style clarification
   round before finalising; record every guess in the Decomposition Rationale.
10. **Default dispatch is `emit`; recommended Claude Code parallel dispatch is `bg`.** `run` mode
    must not make spawned `feature-full-loop` subagents the default, because the nesting chain
    (caller → roadmap-loop → feature-full-loop → feature-plan) hits the spawn-depth cap on most tool
    platforms (Claude Code default; Codex `max_depth=2`). `dispatch: bg` sidesteps this by starting
    separate Claude Code background sessions. `dispatch: serial` sidesteps it by keeping the caller
    as the orchestrator and dispatching real worker agents directly. `dispatch: spawn` remains an
    advanced opt-in for hosts with sufficient nesting capacity.
11. **`emit` never marks rows IN_PROGRESS; executing modes do.** In `emit`, rows stay PENDING until
    reconcile sees SHIPPED / READY_TO_SHIP / BLOCKED in the corresponding dev_log Status Panel. In
    `bg`, `serial`, and legacy `spawn`, mark a row IN_PROGRESS before launching that feature and
    update it after the feature reaches READY_TO_SHIP or BLOCKED.
12. **Run-time Mode fallback is session-local and never written back to the manifest.** The
    `run_time_fallback` resolved at picker `07` §4 layer 4 stays in session memory; persistence
    requires init or a human hand-edit of the manifest header.
13. **`claude -p` is not the `bg` path.** Headless `claude -p` does not support user-invoked skills
    the same way an interactive/background Claude Code session does; use `claude --bg` / Agent View
    for `dispatch: bg`. Treat a future headless wrapper as a separate engineering project.
14. **`bg` must protect worktrees and quota.** Before launching bg sessions, satisfy the clean-tree /
    `worktree.baseRef=head` / inline-content visibility gate, respect `Wave Concurrency Cap` (default
    `3`), queue overflow rows with `QUEUED_BG`, and make ship instructions point to the background
    session worktree. Agent View PR dots are never the A2K truth source.
15. **Dispatch confirmation is mandatory, in Chinese, on every `run`.** After resolving the candidate
    dispatch mode but before emitting prompt blocks, marking rows `IN_PROGRESS`, launching bg
    sessions, or dispatching any worker, present a Chinese AskUserQuestion-style confirmation that
    lists all four modes with detailed explanations. This gate fires whether the user supplied
    `dispatch:` in the prompt or omitted it and got the default `emit`. The answer overrides the
    session-local dispatch choice only; never write it back to the manifest unless the human edits
    the manifest separately. If the host cannot ask interactively, STOP with a Next Step that asks
    the user to re-run and confirm the dispatch mode explicitly.

## 1. Mode detection

- call arguments contain `mode: init`, or a `source:` is given and the matching manifest file does
  not exist → **init mode**.
- call arguments contain `mode: run`, or a `manifest:` is given and the file already exists → **run mode**.
- when both could be inferred, the explicit `mode:` argument wins.
- within init, the input doc's shape selects the internal path: a pre-decomposed roadmap doc →
  **parse path**; a raw PRD / multi-subsystem plan → **decompose path**. An explicit
  `input_kind: roadmap | prd` argument forces it; otherwise auto-detect — but the parse-vs-decompose
  choice is **material** (it changes the manifest's whole shape), so if it is genuinely ambiguous,
  ask the user before proceeding (same ask-before-guess rule as §2b step 4). Only proceed on a
  stated guess when the classification is low-stakes.

## 2. init mode

Input: `source:` pointing at a reviewed source doc. Output: a manifest per spec §A6 — plus, on the
decompose path, per-feature seed briefs and a `## Decomposition Rationale`.

### 2a. parse path — input is an already-decomposed roadmap doc

Mechanical extraction; invent nothing.

1. Read the source doc; section by section, extract each feature's slug, `Source` (`§N`), and
   dependency relationships (parse "execution order" / "depends on" / "after X is SHIPPED" wording).
2. Dependency semantics default to `shipped`; only mark `ready_to_ship` if the source doc explicitly
   says "can start once X is READY".
3. Items blocked on external input (waiting on legal / a business decision) get Status
   `BLOCKED_EXTERNAL` directly.
4. Automation Mode defaults to the header Default; mark individual rows when the source doc has a
   specific recommendation.

### 2b. decompose path — input is a raw PRD / multi-subsystem plan

Propose a decomposition; the shared-tail review gate is where the author confirms it.

1. Read the project's structural context — `docs/PLUGIN_MAP.md`, `docs/planning/REFACTORING_PLAN.md`,
   `developer.md` when present, and the `packages/` plugin layout — so features land on real plugin
   boundaries. XAI naming: each `<slug>` is a `plugin-<name>` package.
2. Partition the PRD into the smallest independent candidate units that each make sense as one
   `xai-feature-full-loop` run; prefer existing plugin boundaries. This step MAY spawn parallel
   analysis subagents (e.g. one per subsystem named in the PRD), then synthesise their results —
   this keeps init's own context small (spec §A3 principle 3).
3. Analyse inter-feature relationships first, then infer the dependency graph from them: shared
   modules/files (concurrent-edit conflict risk in `packages/core/` or `packages/ui/`),
   contract/data dependencies (shared typed events in `packages/core/src/events/`), sequencing/foundation,
   true independence (do not invent edges). Set `depends_on` + `Dep Semantics` (default `shipped`;
   relax to `ready_to_ship` only where the PRD clearly allows). Assign a canonical `Slug` per feature.
4. Clarify genuine ambiguity with the user — do NOT silently guess. When a decision is genuinely
   ambiguous AND materially changes the manifest (one feature or two? real dependency or
   parallelisable? priority/sequencing? scope in or out?), pause and ask a focused, batched
   AskUserQuestion-style clarification round before finalising. Guess only low-stakes details, and
   record every guess in the Decomposition Rationale.
5. For each feature, write a `<roadmap_seed_brief>` stub at
   `docs/reviews/<slug>/<YYYYMMDD>-roadmap-seed.md` (1-3 sentence requirement + hard constraints +
   acceptance signal, drawn from the PRD and any step-4 answers); the manifest row's `Source` cell
   points at it. The seed brief is Step 0's input, NOT a conformant feature brief.
6. Write a `## Decomposition Rationale` section into the manifest, below the `## Features` table:
   the boundaries and the inter-feature relationships found, the dependency edges and what they were
   inferred from, what was asked in step 4 and how the user answered, what assumptions/guesses were
   made, what is still uncertain.

### 2c. both paths — shared tail (the review gate)

- For each row drafted, fire the per-feature Automation Mode picker per
  `_portable/07-automation-mode-picker.md` §5 (smart inheritance shortcut on by default):
  - **Row #1:** full 4-option picker → answer becomes header `Default Automation Mode`; row #1's
    Mode cell written as `(default)`.
  - **Row #2..N:** AskUserQuestion with 2 options — "Same as Default (<Mode_1>)" → write
    `(default)`; "Pick a different Mode" → fire full picker → write explicit variant.
  - If a decompose-path ambiguity round (§2b step 4) already locked a row's Mode, skip that row's
    per-row picker.
  - To disable the shortcut and force a full picker per row, set a project-layer config flag
    (portable spec keeps shortcut ON by default).
- AskUserQuestion **once** for the cross-vendor verify gate
  (`docs/workflow/SUBAGENT_WORKFLOW_V2.md` V2 portable-layer note):
  - Question: "Strict cross-vendor verify gate? (recommended yes — strict; opt out to allow `feature-dev-loop` and skip the manual cross-vendor verify hand-off)"
  - Option 1: "Yes — strict (default)" → header `Default Verify Cross-vendor: yes`
  - Option 2: "No — allow feature-dev-loop (echo chamber accepted)" → header `Default Verify Cross-vendor: no`
  - All row `Verify Cross-vendor` cells are written as `(default)`; the user can hand-edit individual rows post-init for per-row overrides.
- Write the manifest to `docs/workflow/roadmap/<roadmap_name>.md` (set `Init Path:` accordingly);
  schema per spec §A6.
- **Stop at the review gate.** Output the manifest path + a dependency-graph wave summary; on the
  decompose path also surface the Decomposition Rationale and the seed-brief locations. Hand to a
  human for review. **init does not auto-continue into run** — and on the decompose path the review
  is *substantive* (the author signs off on the proposed feature boundaries + dependency graph). End
  with a Next Step: the literal run-mode invocation.

## 3. run mode

Input: `manifest:` pointing at an existing manifest.

### 3.1 reconcile (before the loop)

The manifest is the **source of truth for queue eligibility**; the dev_log is the source of truth
for in-flight execution state. Reconcile only writes **monotonic advances** and never regresses a
human-edited manifest row. The manifest Status enum is closed (`PENDING` / `IN_PROGRESS` /
`READY_TO_SHIP` / `SHIPPED` / `BLOCKED` / `BLOCKED_EXTERNAL`); the dev_log's mid-pipeline values
(`PLAN_DRAFT` / `NEEDS_REVIEW` / `APPROVED` / `READY_FOR_VERIFY`) are never written through verbatim.

For each manifest row, branch on the row's **prior manifest Status** (not the dev_log Status):

- **prior `SHIPPED`** → no-op.
- **prior `BLOCKED_EXTERNAL`** → **no-op (preserve)**. The row waits on legal / business / vendor
  input; the absence of a dev_log is the *expected* state. Only a human edit (manifest row →
  `PENDING`) releases it — reconcile must never infer "no dev_log → PENDING".
- **prior `BLOCKED`** → **no-op (preserve)**. Recovery is human-driven: a human edits the manifest
  row from `BLOCKED` back to `PENDING` after fixing the cause. Without this no-op rule a stale
  `dev_log BLOCKED` would re-flip the manifest right after the human reset and strand the row. A
  manual reset to `PENDING` is the **only** path out of `BLOCKED`.
- **prior `READY_TO_SHIP`** → advance only: dev_log `SHIPPED` → manifest `SHIPPED` (downstream deps
  unlock); otherwise no-op (still waiting for the human `ship`).
- **prior `IN_PROGRESS`** → an executing dispatch mode (`bg`, `serial`, or legacy `spawn`) left the
  row mid-flight (background session still running, orchestrator exited `AWAITING_*`, or a crash).
  Reconcile by dev_log Status:
  - `SHIPPED` → manifest `SHIPPED`; `READY_TO_SHIP` → manifest `READY_TO_SHIP`.
  - `BLOCKED` → manifest `BLOCKED` (record the dev_log Blocker in `Note`) — the **only** path that
    writes manifest `BLOCKED` automatically.
  - a mid-pipeline value → apply the stale-`IN_PROGRESS` rule below.
  - dev_log missing / empty / unreadable → revert to `PENDING` (the prior spawn never reached a
    writable state; safe to retry).
- **prior `PENDING`** → advance only if the dev_log clearly shows work finished outside this skill:
  `SHIPPED` → `SHIPPED`; `READY_TO_SHIP` → `READY_TO_SHIP`; anything else (including `BLOCKED` and
  the mid-pipeline values) → **stay `PENDING`** (the human may have just reset the row; the next
  emitted `xai-feature-full-loop` block hands the dev_log's actual state to the
  parent-session recipe, which knows how to resume).

**Stale `IN_PROGRESS` rule.** For an `IN_PROGRESS` row whose dev_log shows a mid-pipeline state:
- `Last Run` recent (same human-driven session, e.g. ≤ 24 h) AND either a live marker exists at
  `/tmp/cw-orchestrator/<slug>.awaiting_*` OR `Note` records a live/recent background session
  (`bg:<session-id-or-name>`) → keep `IN_PROGRESS`, add/keep `Note: resume pending`; do not
  re-eligibilise (the human resumes `xai-feature-full-loop` for `<slug>` directly, or
  opens the background row in Agent View).
- otherwise (stale `Last Run` or no live marker) → revert to `PENDING` so the next loop iteration
  emits a fresh `xai-feature-full-loop` block from the dev_log's current resume point; add
  a `Note` recording the prior `IN_PROGRESS` and the dev_log Status at reconcile time.

### 3.1.5 Automation Mode resolution preflight

After reconcile and before entering the main loop, resolve the Automation Mode for every PENDING
row per the 5-layer fallback in `_portable/07-automation-mode-picker.md` §4. Summary:

```
1. row 'Automation Mode' ∈ legal variants               → use row
2. row '(default)' AND header Default legal             → use header
3. row '(default)' AND header invalid AND
   run_time_fallback already set                        → use run_time_fallback
4. row '(default)' AND header invalid AND no fallback   → fire picker §2 ONCE per session,
                                                          store as run_time_fallback, loop back to layer 3
5. row value invalid                                    → row Status = BLOCKED, Note set, skip in main loop
```

If layer 4 fires the picker and the host tool does not support AskUserQuestion, STOP with Handoff:
Status `BLOCKED`, Blocker "Manifest header 'Default Automation Mode' missing or invalid; cannot
ask interactively in this tool.", Next Step "Edit `docs/workflow/roadmap/<roadmap_name>.md` header
`Default Automation Mode:` to one of the 8 legal variants (see `_portable/04-automation-loop.md`
§3), then re-run."

Record the resolution outcome in a per-session log line (not in the manifest):

```
Resolved Automation Mode: row#<N> <slug> → <variant> (source: row|header|run_time_fallback)
```

### 3.2 dispatch mode resolution

Resolve dispatch mode before the main loop:

```
dispatch absent or dispatch: emit       → emit-dispatch (default, portable-safe)
dispatch: bg | dispatch: agent-view     → Claude Code background-session dispatch
dispatch: serial                        → caller-session serial execution
dispatch: spawn                         → legacy nested spawn-dispatch
anything else                           → STOP with Next Step: choose emit|bg|serial|spawn
```

Use `bg` as the recommended one-window parallel Claude Code path when `claude agents` and
`claude --bg` are available. If direct background launch is blocked by a nested-session guard, fall
back to bg-script. If background sessions are unavailable altogether, degrade to `emit` and output
the exact commands the user can run later; do not silently fall back to `spawn`.

Before continuing to any dispatch branch, show this mandatory Chinese confirmation. No prompt block
may be emitted and no manifest row may be marked `IN_PROGRESS` before the answer is received:

```text
AskUserQuestion: Roadmap dispatch 模式确认

我检测到本次 roadmap-loop run 的候选 dispatch 模式是: {resolved_mode}
来源: <prompt 中显式提供 | 未提供 dispatch,使用默认 emit | agent-view alias 解析为 bg>

继续前请确认。四种模式含义如下:

1. dispatch: emit — 默认/最稳。只输出每个 eligible feature 的
   xai-feature-full-loop prompt block,不启动后台任务,不把 manifest row 标成 IN_PROGRESS。
   适合 wave 较小、需要人工逐窗口掌控、或当前机器还没验证 bg 能力。

2. dispatch: bg — Claude Code 推荐并行路径。为每个 eligible feature 启动独立
   claude --bg background session,用 Agent View 统一监控;默认并发 cap=3,超出的 row
   标 QUEUED_BG。适合 wave >= 3 且已通过 worktree/baseRef/smoke-test preflight。
   到 READY_TO_SHIP 后必须在对应 bg worktree 或 attach session 里 ship。

3. dispatch: serial — 一个主会话串行执行。当前 session 逐个 feature 直接派发
   feature-plan → feature-review → feature-auto-build → feature-verify,不 spawn
   xai-feature-full-loop 这种 meta-orchestrator。适合想要一个 transcript、能接受不并行、
   或 bg 被 nested-session guard 拦截的情况。

4. dispatch: spawn — legacy 高风险路径。让 roadmap-loop 嵌套 spawn feature-full-loop。
   只有宿主明确支持 >=4 层 nested agent 时才可选;Claude Code 默认配置和 Codex max_depth=2
   都不推荐,日常不要使用。

请选择本次实际要使用的 dispatch 模式:
- emit
- bg
- serial
- spawn
```

If the user chooses a different mode than `{resolved_mode}`, use the user's answer for this run and
record a session-local line:

```text
Confirmed dispatch mode: {chosen_mode} (candidate: {resolved_mode}, source: {source})
```

### 3.3 main loop (emit-dispatch — default)

After §3.1 reconcile + §3.1.5 Mode preflight:

```
eligible_set = rows where:
  - Status == PENDING
  - all deps satisfied per Dep Semantics
      (shipped:        dep row Status == SHIPPED
       ready_to_ship:  dep row Status ∈ {READY_TO_SHIP, SHIPPED})
  - no dep is BLOCKED / BLOCKED_EXTERNAL
  - row's resolved Mode is a legal variant (preflight already guarantees this)

if eligible_set is empty:
  if any PENDING rows remain → wave is blocked at dep chain; STOP with wrap-up case 3
  else                       → all SHIPPED or BLOCKED; STOP with wrap-up case 1
  return

# Emit one prompt block per eligible feature.
# DO NOT mark rows IN_PROGRESS. Reconcile on next invocation reads dev_log truth.
# DO NOT spawn anything.

emit to user:
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║ 🚀 Wave <N> — <K> features eligible. Copy each block to a new session.    ║
  ║                                                                           ║
  ║ ──────────────── Block 1 (first eligible): <slug> ────────────────                       ║
  ║ /xai-feature-full-loop                                          ║
  ║ Feature: <slug>                                                           ║
  ║ Automation Mode: <Mode_1>                                                 ║
  ║ Verify Cross-vendor: <resolved value from row or header default>          ║
  ║ Requirement: <resolved from row.Source — see "Source resolution" below>   ║
  ║                                                                           ║
  ║ ──────────────── Block 2 (second eligible): <slug> ────────────────                       ║
  ║ ...                                                                       ║
  ╚═══════════════════════════════════════════════════════════════════════════╝

  Next Step:
    Open <K> new sessions in parallel and paste each block. Each will produce
    its own dev_log under `packages/<slug>/docs/dev_log.md` and reach
    READY_TO_SHIP (or BLOCKED) independently. After any feature(s) SHIPPED,
    re-run `xai-roadmap-loop manifest: docs/workflow/roadmap/<roadmap_name>.md` here.
    Reconcile will pick up the new state from dev_logs and emit the next wave.

  STOP. (Skill exits; no spawn, no waiting.)
```

### 3.4 bg-dispatch / Agent View (recommended Claude Code parallel path)

If the invocation passes `dispatch: bg` or `dispatch: agent-view`, compute the same eligible set as
emit-dispatch, then start one Claude Code background session per eligible feature. This mode keeps
roadmap-loop as the tracker while removing the manual copy/paste step.

Before dispatching, bg mode has three hard preflight gates. At least one worktree visibility gate
must pass, and the nested-session guard must be handled:

1. **Worktree visibility gate.** Continue only when one of these is true:
   - `git status --short` is empty.
   - `git config worktree.baseRef` returns `head`; record `bg sessions inherit local HEAD` in the
     wave summary.
   - The expanded prompt inlines all required manifest/source/seed-brief content, so the background
     session does not depend on uncommitted files being visible in its worktree.
2. **Nested-session guard gate.** If manifest header `BG Direct Verified: yes`, try bg-direct. If it
   is `unknown`, run or require a smoke test first. If `claude --bg` exits non-zero or stderr says it
   is already running inside Claude Code, do not retry direct launch; fall back to bg-script.
3. **Concurrency cap gate.** Resolve `Wave Concurrency Cap` from the manifest header; default to `3`
   when absent or invalid. Count existing active `IN_PROGRESS` bg rows against the cap.

There are two internal tiers:

```text
Tier 1: bg-direct
  call `claude --bg --name ...` from the current session after the gates pass

Tier 2: bg-script
  write scripts/cowork/roadmap_bg_run_<roadmap_name>_wNN.sh with the same commands
  STOP and tell the user to run that script from a normal shell, outside Claude Code
```

If bg-script is emitted, do not pretend work has launched unless the script is actually run. Rows may
remain `PENDING` with a `bg-script:` note; the next `run` reconciles from real dev_logs.

Apply the concurrency cap before launching:

```text
available_slots = max(0, Wave Concurrency Cap - active_bg_in_progress_count)
dispatch_set = first available_slots eligible rows by manifest order
queued_set = remaining eligible rows

for each queued row:
  keep Status = PENDING
  set Note = "QUEUED_BG cap=N"
  write manifest to disk
```

Before launching each feature:

1. Resolve `Requirement`, `Automation Mode`, and `Verify Cross-vendor` exactly as emit-dispatch does.
2. Set the manifest row `Status = IN_PROGRESS`, `Last Run = now`, and `Note = bg:<session-name>`.
3. Write the manifest to disk.

Launch from the repository root:

```bash
claude --bg --name "roadmap-w<row-or-wave>-<slug>" "<expanded xai-feature-full-loop prompt>"
```

The expanded prompt MUST be the same content emit-dispatch would print:

```text
/xai-feature-full-loop
Feature: <slug>
Automation Mode: <resolved Automation Mode>
Verify Cross-vendor: <resolved yes|no>
Requirement: <resolved from row.Source>
```

After every launch, read stdout and append the returned background session short id to `Note` when
available (`bg:<session-id> name=<session-name>`), then write the manifest again. If launch fails,
set the row back to `PENDING`, record `Note: bg dispatch failed: reason`, continue with the next
eligible feature, and report the failure in the wave summary.

After launching the wave, STOP. Output:

- the background session names / ids launched
- queued rows marked `QUEUED_BG`, if any
- `claude agents --cwd /path/to/repo`
- `Worktree: pending until first file edit`; check with `git worktree list | grep SESSION_ID`
- bg-aware ship prompt blocks for every READY_TO_SHIP row
- warning: Agent View PR dots are not A2K truth; `dev_log` Status Panel + reconcile are truth
- the fallback emit blocks for any row that failed to launch
- Next Step: monitor Agent View; after rows reach READY_TO_SHIP and are shipped, re-run
  `xai-roadmap-loop manifest: docs/workflow/roadmap/<roadmap_name>.md`

Never use `claude -p` for this mode. Headless mode is a separate SDK/script path and user-invoked
skills are interactive-only there.

**Bg-aware ship handoff.** For bg-dispatched features, do not ask the user to manually run the full
worktree lookup/check sequence. The human gate is the explicit `ship` invocation; once the user
starts `ship`, the `ship` agent owns worktree lookup, branch/status/log verification, push, and
SHIPPED state write. The summary must emit a copy-pasteable block per READY_TO_SHIP row:

```text
Start the ship agent for <slug>.
Background Session: {session_id_or_name}
Roadmap Manifest: docs/workflow/roadmap/<roadmap_name>.md
```

If the session id/name is missing or ambiguous, include `Worktree: {absolute_worktree_path}` when it
is known, or tell the user to run `git worktree list | grep {slug_or_session}` and re-run `ship` with
that `Worktree:` line. Do not tell the user to `claude rm SESSION_ID` until after `ship` reports that
commits were pushed and the dev_log was marked `SHIPPED`; removing the background session can remove
the worktree.

Agent View is a monitor, not the A2K source of truth. Its "Ready for review" / PR indicators only
reflect Claude Code PR state when a PR exists. A2K shippability is determined by
`packages/<slug>/docs/dev_log.md` `Status: READY_TO_SHIP` plus the next roadmap reconcile.

### 3.5 serial-dispatch (one transcript, no parallelism)

If the invocation passes `dispatch: serial`, process the eligible set one feature at a time in the
caller session. This mode exists for users who want one transcript to keep working without opening
parallel sessions, accepting that a wave with K features now takes roughly the sum of K feature
runtimes.

For each eligible feature:

1. Set `Status = IN_PROGRESS`, `Last Run = now`, `Note = serial:timestamp`, and write the manifest.
2. Load/read `xai-feature-full-loop` and execute its Runtime Recipe inline from the caller
   context. Do NOT spawn `feature-full-loop` or `feature-dev-loop` as meta-orchestrators. Dispatch
   only the real worker agents (`xai-feature-brief` as needed, then `feature-plan`, `feature-review`,
   `feature-auto-build`, `feature-verify`) and read `packages/<slug>/docs/dev_log.md` between
   every worker.
3. If the feature reaches `READY_TO_SHIP`, set the manifest row to `READY_TO_SHIP`.
4. If the feature reaches `BLOCKED`, set the manifest row to `BLOCKED`, record the blocker in `Note`,
   and continue with the next eligible feature.
5. If the caller context is approaching its limit or the user interrupts, write the manifest and STOP
   with a Next Step to re-run `dispatch: serial`; reconcile will resume from disk truth.

Never spawn `ship`; serial mode still stops with a batch ship queue.

### 3.6 opt-in spawn-dispatch (advanced, requires nesting capacity)

If the invocation passes `dispatch: spawn`, use the legacy behaviour: for each eligible feature,
mark IN_PROGRESS, spawn `feature-full-loop`, read the returned Handoff + dev_log Status Panel,
update the manifest row, loop until the eligible set empties. This path REQUIRES the host tool to
support ≥ 4-level nesting (caller → roadmap-loop → feature-full-loop → feature-plan / worker). On
most tools as of 2026-05 (Claude Code's default subagent depth cap, Codex's `max_depth=2`), this
fails. Verify the host tool's nesting cap before using.

```
loop:
  eligible = (same predicate as emit-dispatch above)
  if eligible is empty: break
  next = lowest-numbered feature in eligible
  next.Status = IN_PROGRESS; next.Last Run = now; write the manifest to disk
  spawn feature-full-loop:
    Requirement: <resolved per next.Source — see "Source resolution" below>
    Automation Mode: <resolved per §3.1.5 preflight — guaranteed concrete legal variant>
  after it returns, read the Handoff + packages/<slug>/docs/dev_log.md Status Panel:
    Status == READY_TO_SHIP → next.Status = READY_TO_SHIP
    Status == BLOCKED       → next.Status = BLOCKED (record the Blocker in Note)
    otherwise               → next.Status = BLOCKED (exception fallback, record the reason)
  write the manifest to disk
```

**Source resolution.** A manifest row's `Source` cell takes one of two shapes, depending on the
init path that produced the row:

- **`§N`** (parse path) — resolve the requirement by reading the matching section of the reviewed
  roadmap doc passed at init time (its brief + hard constraints + acceptance signal).
- **a seed-brief path** (decompose path — `<roadmap_seed_brief>`, written by init §2b step 5) —
  resolve the requirement by reading that file directly. **Do NOT** fall back to re-reading the
  original PRD: the seed brief is the carved-out per-feature input the decompose path already
  produced, and re-reading the PRD would re-introduce scope the decompose pass intentionally left out.

If the `Source` cell is empty or unreadable, mark the row `BLOCKED` with `Note: source resolution
failed` and continue with the next eligible row.

### 3.7 wrap-up

After the loop ends, output the wave summary and **STOP**:

- the `READY_TO_SHIP` queue (waiting for the human batch ship — list each slug)
- the `BLOCKED` / `BLOCKED_EXTERNAL` list + reasons
- **Next Step** (mandatory): one of — "batch-ship the N items above, then re-run roadmap-loop to
  unlock the next wave" / "all features SHIPPED, roadmap wrap-up" / "dependency chain fully stuck,
  human intervention needed: <the blocking chain>".

**Never spawn `ship`.** Wrap-up only stops and reports.

## 4. Exception handling

- manifest parse failure / invalid schema → stop and report, do not run on a broken manifest. End
  with a Next Step describing how to fix the manifest.
- `xai-feature-full-loop` skill not available → stop, instruct the human to land it first
  (spec §B1). End with a Next Step.
- source doc has no matching § for a feature → mark that feature BLOCKED, Note records "source
  section missing", continue.
