---
name: xai-roadmap-loop
description: Roadmap orchestration layer (Layer 3.5). Parses a reviewed roadmap source doc into a manifest (init mode), then emits xai-feature-full-loop prompt blocks wave by wave to push every eligible feature to READY_TO_SHIP (run mode). Triggers: roadmap loop, roadmap orchestration, batch-run features, auto-develop a roadmap, advance a roadmap, roadmap manifest.
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
3. **Never inline-run `feature-full-loop`'s internal steps.** Every feature must go through a spawn
   (spawn-dispatch) or be emitted as a prompt block for the user to run (emit-dispatch),
   guaranteeing an independent context.
4. **BLOCKED does not raise an exception and does not stop the whole roadmap.** Mark + skip + continue.
5. **Write the manifest to disk before and after every spawn.** Crash recovery depends on this.
6. **The manifest is the single source of state.** Never keep roadmap content in conversation memory.
7. **Every exit of every mode ends with an explicit, copy-pasteable Next Step** (the Universal Next
   Step Contract — `_portable/02-handoff-and-state.md` §3.3).
8. **init never auto-continues into run, and the decompose path never bypasses Step 0.** init always
   stops at the human review gate; the decompose path's seed briefs are Step 0's *input*, not a
   replacement for it.
9. **On the decompose path, ask before guessing.** When a decomposition decision is genuinely
   ambiguous and materially changes the manifest, raise a focused AskUserQuestion-style clarification
   round before finalising; record every guess in the Decomposition Rationale.
10. **Default dispatch is emit, not spawn.** `run` mode does NOT spawn `feature-full-loop` as Task
    subagents. Instead, it emits a copy-paste-ready prompt block per eligible feature, telling the
    user to run each in a separate session/window. Rationale: the 3-level nesting (caller →
    roadmap-loop → feature-full-loop → feature-plan) hits the spawn-depth cap on most tool
    platforms (Claude Code default; Codex `max_depth=2`). The user is the real dispatcher;
    roadmap-loop is the tracker. Opt-in to spawn-dispatch by passing `dispatch: spawn` in the
    invocation when running on a tool with sufficient nesting capacity.
11. **Run mode never marks rows IN_PROGRESS.** Since the skill does not actually execute the work
    (the user does, in parallel sessions), Status flips happen via reconcile reading dev_log truth
    on the next `run` invocation. Rows stay PENDING until reconcile sees SHIPPED / BLOCKED in the
    corresponding dev_log Status Panel. (The legacy spawn-dispatch path under `dispatch: spawn`
    retains the old IN_PROGRESS marking — it actually drives the work and needs the lock.)
12. **Run-time Mode fallback is session-local and never written back to the manifest.** The
    `run_time_fallback` resolved at picker `_portable/07` §4 layer 4 stays in session memory;
    persistence requires init or a human hand-edit of the manifest header.

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

Input: `source:` pointing at a reviewed source doc. Output: a manifest per portable spec §A6 — plus,
on the decompose path, per-feature seed briefs and a `## Decomposition Rationale`.

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
   `developer.md` (when present), the `packages/` plugin layout — so features land on real plugin
   boundaries. XAI naming: each `<slug>` is a `plugin-<name>` package.
2. Partition the PRD into the smallest independent candidate units that each make sense as one
   `feature-full-loop` run; prefer existing plugin boundaries. This step MAY spawn parallel
   analysis subagents (e.g. one per subsystem named in the PRD), then synthesise their results —
   this keeps init's own context small (portable spec §A3 principle 3).
3. Analyse inter-feature relationships first, then infer the dependency graph from them: shared
   modules/files (concurrent-edit conflict risk in `packages/core/` or `packages/ui/`),
   contract/data dependencies (shared typed events in `packages/core/src/events/`),
   sequencing/foundation, true independence (do not invent edges). Set `depends_on` +
   `Dep Semantics` (default `shipped`; relax to `ready_to_ship` only where the PRD clearly allows).
   Assign a canonical `Slug` per feature.
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
  (`docs/workflow/SUBAGENT_WORKFLOW_V2.md` cross-vendor verify section):
  - Question: "Strict cross-vendor verify gate? (recommended yes — strict; opt out to allow `feature-dev-loop` and skip the manual cross-vendor verify hand-off)"
  - Option 1: "Yes — strict (default)" → header `Default Verify Cross-vendor: yes`
  - Option 2: "No — allow feature-dev-loop (echo chamber accepted)" → header `Default Verify Cross-vendor: no`
  - All row `Verify Cross-vendor` cells are written as `(default)`; the user can hand-edit individual rows post-init for per-row overrides.
- Write the manifest to `docs/workflow/roadmap/<roadmap_name>.md` (set `Init Path:` accordingly);
  schema per portable spec §A6.
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
- **prior `IN_PROGRESS`** → a prior `feature-full-loop` spawn left the row mid-flight (orchestrator
  exited `AWAITING_*`, or a crash). Reconcile by dev_log Status:
  - `SHIPPED` → manifest `SHIPPED`; `READY_TO_SHIP` → manifest `READY_TO_SHIP`.
  - `BLOCKED` → manifest `BLOCKED` (record the dev_log Blocker in `Note`) — the **only** path that
    writes manifest `BLOCKED` automatically.
  - a mid-pipeline value → apply the stale-`IN_PROGRESS` rule below.
  - dev_log missing / empty / unreadable → revert to `PENDING` (the prior spawn never reached a
    writable state; safe to retry).
- **prior `PENDING`** → advance only if the dev_log clearly shows work finished outside this skill:
  `SHIPPED` → `SHIPPED`; `READY_TO_SHIP` → `READY_TO_SHIP`; anything else (including `BLOCKED` and
  the mid-pipeline values) → **stay `PENDING`** (the human may have just reset the row; the next
  loop spawn hands the dev_log's actual state to `feature-full-loop`, which knows how to resume).

> XAI dev_log location: `packages/<slug>/docs/dev_log.md` (where `<slug>` is the full
> `plugin-<name>` string).

**Stale `IN_PROGRESS` rule.** For an `IN_PROGRESS` row whose dev_log shows a mid-pipeline state:
- `Last Run` recent (same human-driven session, e.g. ≤ 24 h) AND a live marker exists at
  `/tmp/cw-orchestrator/<slug>.awaiting_*` → keep `IN_PROGRESS`, add `Note: resume pending`; do
  not re-eligibilise (the human resumes `feature-full-loop` for `<slug>` directly).
- otherwise (stale `Last Run` or no live marker) → revert to `PENDING` so the next loop iteration
  re-spawns `feature-full-loop` from the dev_log's current resume point; add a `Note` recording the
  prior `IN_PROGRESS` and the dev_log Status at reconcile time.

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

### 3.2 main loop (emit-dispatch — default)

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
  ║ /xai-feature-full-loop                                                    ║
  ║ Automation Mode: <Mode_1>                                                 ║
  ║ Verify Cross-vendor: <resolved value from row or header default>          ║
  ║ Requirement: <resolved from row.Source — see "Source resolution" below>   ║
  ║                                                                           ║
  ║ ──────────────── Block 2 (second eligible): <slug> ────────────────                       ║
  ║ ...                                                                       ║
  ╚═══════════════════════════════════════════════════════════════════════════╝

  Next Step:
    Open <K> new sessions in parallel and paste each block. Each will produce
    its own dev_log under packages/<slug>/docs/dev_log.md and reach
    READY_TO_SHIP (or BLOCKED) independently. After any feature(s) SHIPPED,
    re-run `/xai-roadmap-loop manifest: docs/workflow/roadmap/<roadmap_name>.md` here.
    Reconcile will pick up the new state from dev_logs and emit the next wave.

  STOP. (Skill exits; no spawn, no waiting.)
```

### 3.2-opt-in spawn-dispatch (advanced, requires nesting capacity)

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

### 3.3 wrap-up

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
- `feature-full-loop` not registered → stop, instruct the human to land it first (portable spec
  §B1). End with a Next Step.
- source doc has no matching § for a feature → mark that feature BLOCKED, Note records "source
  section missing", continue.
