# 06 — Roadmap Orchestration: The Layer 3.5 Multi-Feature Driver (Portable)

> **Portable layer.** Project-agnostic. Defines **Layer 3.5** — the layer that drives a whole
> already-reviewed roadmap of N independent features to a shippable state, hands-off, by repeatedly
> emitting `<skill_prefix>feature-full-loop` parent-session recipe blocks wave by wave.
> Source: extracted from the project's `ROADMAP_ORCHESTRATION_SPEC.md` (the paradigm parts — its
> §1-10, §12, and the SKILL.md draft in its appendix B). Project-specific material — the concrete
> roadmap instance, the real manifest directory, the real skill name, the landing checklist — lives
> in the project layer (`../project/`).
> Companion: `04-automation-loop.md` (Layer 3 — the single-feature automation contract this layer
> invokes through the parent-session recipe), `02-handoff-and-state.md` (the state contracts this layer must not violate),
> `usage-guide.md` (the hands-on tutorial). Placeholders: `00-PORTABLE-MANIFEST.md`.

---

This document has two halves. **Part A — Specification** is the machine-readable contract: the
manifest schema, the skill logic, the state machines, the hard constraints. **Part B — Developer
Guide** is the human-facing tutorial: what to type, what you will see, what to do when it stops. A
new project copies both; an AI assistant generating the skill reads Part A; a developer running the
layer reads Part B.

---

# Part A — Specification

## A1. What this layer is

This layer defines **a layer that does not exist** in the core workflow (`01`-`05`) or the
single-feature automation layer (`04`):

**The roadmap orchestration layer** — given a roadmap-level input (either an already-decomposed
roadmap doc, **or** a raw PRD / multi-subsystem plan the skill decomposes into features itself),
produce a structured manifest of N independent feature pipelines, then emit the independent
parent-session feature runs needed to drive each of them, in correct dependency order, to a "ready
to ship" state.

The question it answers is **not** "how do I auto-develop one feature" — that is
`<skill_prefix>feature-full-loop`'s job (`04`). It is:

- a roadmap (or a PRD) implies N features — who carves them out, and who drives them in the right
  order?
- how do you "type once, walk away, come back to results" instead of hand-dispatching each feature?
- how does the work of N features not blow out a single context window?
- without breaking the human `ship` gate, where exactly does the hands-off boundary land?

One-sentence definition:

> **`<skill_prefix>feature-full-loop` strings together the 5 phases of one feature; this layer strings together
> the N features of one roadmap.**

## A2. Where it sits — the three-and-a-half-layer structure

The existing automation stack has three layers (see `04` §1.1):

```text
Layer 3   <skill_prefix>feature-full-loop         ← single-feature parent-session recipe
Layer 2   feature-dev-loop / bugfix-loop          ← build+verify sub-loop
Layer 1   12 + 3 worker subagents                 ← plan / review / build / verify / ship ...
```

This document adds **Layer 3.5**:

```text
Layer 3.5  the roadmap orchestration layer (this doc)   ← multi-feature scheduling
   │ emit (one independent context per feature)
   ▼
Layer 3    <skill_prefix>feature-full-loop               ← the worker of this layer
```

It does **not** replace Layer 3 — it **repeatedly calls** it. One `<skill_prefix>feature-full-loop` run is one
work unit of this layer.

## A3. Design principles

Every decision in this layer follows from these five principles. Principles 1-3 are inherited
directly from `04` §2.3 ("cross-tool relay goes through documents, not conversation context").

1. **State lives on disk, not in context.** A roadmap's progress is carried by a manifest *file*, not
   by some agent "remembering where it got to". The agent can crash, the session can close — the
   manifest is still there, and re-driving it resumes cleanly.

2. **A thin driver + a persistent checklist, not one long-running mega-agent.** The "never stops"
   feeling of a hands-off loop comes from *the loop itself never stopping* — **not** from one huge
   context. The driving logic must stay thin.

3. **Each feature runs in its own independent context.** The driver must not inline several feature
   pipelines into its own context. In the default implementation it emits one paste-ready
   `<skill_prefix>feature-full-loop` block per eligible feature; the user opens each block in a
   separate session/window. Spawn-dispatch is an opt-in implementation only for hosts with enough
   nesting capacity.

4. **Skip-tolerant.** If one feature is BLOCKED (plan did not converge in N rounds, an external
   dependency has not arrived, build failed), the driver does not stop — it marks that feature in the
   manifest and continues with the other features **that do not depend on it**. Hands-off only works
   if a single-point failure cannot stall the whole roadmap.

5. **`ship` stays human — but the human gate collapses from "per feature" to "per wave, in batch".**
   See A4.

## A4. Alignment with the `ship` human gate

The hands-off boundary is determined entirely by the `ship` constraint in the project's V2 workflow
(`<project_workflow_doc>`). That constraint must be stated precisely first.

### A4.1 The constraint, restated

The `ship` constraint is **two layers**, not one sentence:

- **Layer 1: `ship` is never auto-triggered by an orchestrator.** Any orchestrator — `feature-dev-loop`,
  `<skill_prefix>feature-full-loop`, or this layer — finishes at most at `READY_TO_SHIP`; it **never spawns `ship`
  itself.**
- **Layer 2: even when a human starts `ship`, there is still a "wait for human confirmation" step
  before its internal `git push`.**

### A4.2 What the constraint protects

`git push` is the **only irreversible, externally visible** action in the whole pipeline. Before
push, everything is local — commits can be amended, branches reset. After push it is in shared
history. `ship` mechanically checks sensitive files, commit completeness, and commit-message
conventions before push; the human confirmation is the final eyes-on review on top of those checks.

**This layer does not challenge that constraint and does not modify the project's V2 workflow.**
Push stays human.

### A4.3 Where the hands-off boundary lands

Because `ship` must be human, "a whole roadmap auto-running to SHIPPED" **cannot be one command end
to end**. But that does not prevent hands-off operation — the key is to **move the human gate to the
right place**:

> The human gate collapses from "interrupt once per feature" to "interrupt once per dependency
> wave, in batch".

The driver, in one session, **continuously** pushes every feature whose dependencies are satisfied
up to `READY_TO_SHIP`, never handing back to the human. They line up in the manifest as a "pending
ship queue". The human comes back, does **one batch ship session**, ships that queue, then re-runs
the driver for the next wave.

The "walk away" window = one whole wave of development time (several features × plan→build→verify,
usually hours). The human appears once between waves.

### A4.4 Why a "wave" and not "once"

A roadmap's dependency graph generally has **intermediate SHIPPED gates**: a kickoff feature must be
SHIPPED before its downstream features can start; a foundational feature must be SHIPPED before the
features that build on it can start.

As long as a `depends_on` edge requires **SHIPPED**, and SHIPPED must be human, then **every layer of
the dependency graph necessarily has a human ship between it and the next**. This is not a design
flaw — it is jointly determined by the V2 constraint and the dependency semantics the roadmap author
chose.

So a typical roadmap is several waves: roughly *(number of dependency-graph layers)* "type-once,
walk-away" runs plus the same number of batch-ship sessions. But compared to "N features × hand-typing
~8 commands each", the interaction count drops from hundreds to a dozen-ish, and each "walk away"
covers hours of hands-off development.

### A4.5 The tunable knob — relaxing dependency semantics

If a particular dependency edge does not actually need the upstream to be SHIPPED — the downstream
can safely start once the upstream is merely `READY_TO_SHIP` (plan/contract settled, only the push
pending) — the manifest can mark that edge `ready_to_ship` instead of `shipped`. The more edges are
relaxed, the fewer waves. This is the roadmap author's trade-off; this layer only provides the knob,
it does not decide for the author. The default is `shipped` for every edge.

## A5. Architecture — two constructs

The whole layer is just two things, in different forms:

| Construct | Form | Responsibility |
|---|---|---|
| **Roadmap manifest** | a **file** | the single source of truth for a roadmap's state: N feature rows, dependency edges, current status |
| **Roadmap orchestration skill** | a **skill** (slash command) | the logic: parse a human-readable roadmap doc into a manifest (`init` mode); continuously loop and drive (`run` mode) |

**Why the driver is a skill, not a subagent — and why dispatch is emit-by-default.** Roadmap
orchestration uses **emit-dispatch by default**, not spawn-dispatch. The driver (a skill running in
the caller's own session) never spawns `feature-full-loop` as a subagent; instead it computes the
eligible set per wave and emits a copy-paste-ready prompt block per feature. The user opens N
parallel sessions and runs each block.

Why: the natural chain caller → roadmap-loop-driver → `feature-full-loop` → `feature-plan` is 3
levels of nesting and hits the spawn-depth cap on most tool platforms (Claude Code's default
subagent depth limit; Codex's `max_depth=2`). Emit-dispatch sidesteps this by making the user the
dispatcher — every `<skill_prefix>feature-full-loop` runs in the user's parent session and directly
dispatches the worker subagents from there.

The skill is therefore a **tracker + planner + emitter**, not an executor: it parses the source
doc, writes/reads the manifest, reconciles from dev_log truth, computes the eligibility frontier,
and emits the prompts. The user executes in parallel. Re-invoking the skill reconciles and emits
the next wave.

Tools with ≥ 4-level nesting capacity can opt into spawn-dispatch via `dispatch: spawn`
(§A7.3 → §3.2-opt-in). The portable spec recommends emit-dispatch unconditionally for production
use.

**Why `init` and `run` are one skill.** Both share the same manifest schema; splitting them risks
schema drift. One `SKILL.md` decides which mode to run based on "does the manifest file already exist
/ what arguments were passed". The one red line is in A6.6.

**`init` itself has two internal paths, not two modes.** Depending on the input doc, `init` either
*parses* an already-decomposed roadmap (mechanical extraction) or *decomposes* a raw PRD into
features (judgment work — see A7.2). Both paths produce the same manifest schema and both stop at
the same human review gate, so they stay one mode — `init` — with one shared output contract. The
decompose path may itself spawn parallel analysis subagents (A7.2), which keeps `init`'s own context
small for exactly the reason `run`'s does (A3 principle 3).

## A6. Construct 1 — the Roadmap Manifest

This section defines the manifest schema and its state machine.

### A6.1 Form & location

The manifest is a **Markdown file** — humans must be able to read it, and the skill must be able to
parse and update it line by line. Recommended location:

```text
<roadmap_manifest_dir>/<roadmap_name>.md
```

### A6.2 File structure

The file has two parts: **header metadata** + a **feature table**.

```markdown
# Roadmap Manifest — <roadmap_name>

- Roadmap Source: <roadmap_source_doc>
- Init Path: parse | decompose
- Generated: <YYYY-MM-DD>
- Default Automation Mode: D-Codex+Cursor    # one of the 8 named variants — see 04 §3
- Default Dependency Semantics: shipped
- Default Verify Cross-vendor: yes            # 2026-05-16 — see <project_workflow_doc> §16.3 #5 / #7

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | roadmap-kickoff | §1 | — | — | PENDING | (default) | (default) | — | kickoff; unblocks the rest |
| 2 | <slug> | §2 | roadmap-kickoff | shipped | PENDING | (default) | (default) | — | ... |
| ... | | | | | | | | | |
```

The `Source` cell is a roadmap-doc section anchor (`§N`) when `Init Path: parse`, or a per-feature
seed-brief path (`<roadmap_seed_brief>`) when `Init Path: decompose` — see A6.3 and A7.2. A
`decompose`-produced manifest also carries a `## Decomposition Rationale` section below the table
(A7.2); `run` mode parses only the `## Features` table and ignores everything below it.

### A6.3 Field definitions

| Field | Meaning | Values / rules |
|---|---|---|
| `#` | Row number | aligns with the roadmap source doc's section numbering |
| `Slug` | canonical feature slug | parse path: identical to the slug in the roadmap source doc; decompose path: assigned by `init` when it carves the feature out. **Immutable once a `dev_log` is on disk** |
| `Source` | where this feature's requirement text comes from | parse path: a `§N` anchor into `<roadmap_source_doc>`; decompose path: the `<roadmap_seed_brief>` path `init` wrote for this feature |
| `Depends On` | upstream feature slugs | comma-separated; `—` = no dependency |
| `Dep Semantics` | dependency-satisfaction semantics | `shipped` (default) / `ready_to_ship`; see A4.5 |
| `Status` | current status | see A6.4 |
| `Automation Mode` | the variant passed to `<skill_prefix>feature-full-loop` — one of the 8 named variants (`A-Claude` / `B-Codex` / `B-Cursor` / `C-Codex` / `C-Cursor` / `D-Codex` / `D-Cursor` / `D-Codex+Cursor`, see `04` §3). Acquisition: see `_portable/07-automation-mode-picker.md` §5 (init per-row picker) and Appendix SKILL.md §3.1.5 (run preflight). Layer 3.5 never emits a block with `(default)` — preflight always resolves to a concrete variant first. | `(default)` falls back to the header Default |
| `Verify Cross-vendor` | per-row opt-out for the cross-vendor verify gate (`<project_workflow_doc>` §16.3 #5 / #7). `(default)` inherits header `Default Verify Cross-vendor`. Set to `no` only when the feature is low-risk and you accept the echo-chamber trade-off — `<skill_prefix>feature-full-loop` will then be allowed to use `feature-dev-loop` (build + verify same lineage) on hosts where that loop can spawn. When `yes`, the recipe must use `feature-auto-build` + a separate cross-vendor `feature-verify`. `<skill_prefix>feature-full-loop` reads this and passes it through; `feature-plan` writes the resolved value into the dev_log Status Panel `Verify Cross-vendor:` field for audit. | `(default)` falls back to the header Default; explicit `yes` / `no` overrides |
| `Last Run` | timestamp this row was last driven | written by the skill |
| `Note` | human-readable note | risk level, external dependency, special pacing, etc. |

### A6.4 Status state machine

```text
PENDING ──► IN_PROGRESS ──► READY_TO_SHIP ──►(human ship)──► SHIPPED
   │             │
   │             └──► BLOCKED            (driver skips; can resume later)
   └──────────────────► BLOCKED_EXTERNAL  (waiting on external input)
```

- `PENDING` — not started. A row whose dependency is `BLOCKED` / `BLOCKED_EXTERNAL` also stays
  `PENDING` — it is simply *ineligible* this wave (see A7.3); `BLOCKED` never propagates downstream.
- `IN_PROGRESS` — legacy spawn-dispatch has spawned `feature-full-loop`, not yet returned. Default
  emit-dispatch never writes this value. If a spawn-dispatch `run` crashes while a row is here, the
  next `run`'s reconcile detects the stale `IN_PROGRESS` and resets it (A7.3).
- `READY_TO_SHIP` — the feature's `<skill_prefix>feature-full-loop` run finished, `dev_log` Status =
  `READY_TO_SHIP`. **Waiting for
  the human batch ship.**
- `SHIPPED` — human ship done, `dev_log` Status = `SHIPPED`. Downstream dependencies unlock here.
- `BLOCKED` — this feature's `<skill_prefix>feature-full-loop` run returned BLOCKED. Driver skips it,
  reports it at the end of the wave. This value is set **only** by a BLOCKED result from this feature's
  own run — it is never set because a *dependency* is blocked.
- `BLOCKED_EXTERNAL` — waiting on external input (legal sign-off, a business decision, an upstream
  vendor). Driver always skips it; not counted as a failure.

### A6.5 Who writes `Status`

**Key distinction:** the manifest **is not** a `dev_log`, and is **not bound by the Status Panel
write-authority matrix** (`02` §2.6). The manifest's `Status` column is freely updated by the skill —
it is only the roadmap layer's progress mirror.

But the **factual basis** for the `SHIPPED` value still comes from the `dev_log` — at the start of
every `run`, the skill performs a **reconcile** (see A7.3): it reads each non-SHIPPED feature's
`dev_log.md` Status Panel and syncs the manifest status to on-disk truth. So the manifest never
"declares" a feature SHIPPED out of nowhere; it only reflects what the `dev_log` already records.

### A6.6 The red line

> The manifest is always a **standalone file**. The skill is only the logic that produces, reads, and
> updates it. **Never inline the roadmap content into the skill's prompt text.** The skill is logic,
> the manifest is state — break that separation and you are back to "relay by memory".

## A7. Construct 2 — the roadmap orchestration skill

Suggested name: `<skill_prefix>roadmap-loop` (the suffix `roadmap-loop` is frozen and
project-invariant — see `00` §3.5; only `<skill_prefix>` is replaced at instantiation). One
`SKILL.md`, two modes. The full `SKILL.md` draft is in the Appendix.

### A7.1 Mode detection

| Call situation | Mode |
|---|---|
| a roadmap source doc is given, manifest file **does not exist** | `init` |
| the manifest file **already exists** | `run` |
| explicit argument `mode=init` / `mode=run` | forces that mode |

### A7.2 `init` mode

Input: a reviewed, human-readable source doc (`<roadmap_source_doc>`).
Output: a manifest file in the A6 schema (plus, on the decompose path, per-feature seed briefs and a
Decomposition Rationale).

`init` has **two internal paths**, chosen by the input doc's shape. They produce the same manifest
schema and **stop at the same human review gate** — they are not two modes.

- **Path selection.** Honour an explicit `input_kind: roadmap | prd` argument if given; otherwise
  auto-detect: a doc with clear per-feature sections, slugs, and explicit dependency wording is a
  `roadmap` → parse path; a flowing PRD / multi-subsystem plan with no feature-level decomposition is
  a `prd` → decompose path. The parse-vs-decompose choice is itself **material** — it changes the
  manifest's whole shape. So if the choice is genuinely ambiguous, apply the same ask-before-guess
  rule as the decompose path (step 4 / A9): ask the user before proceeding. Only proceed on a stated
  guess when the classification is low-stakes (clearly one or the other, with a minor edge); the
  shared-tail review gate is the final net, not a substitute for asking.

#### Parse path — input is an already-decomposed roadmap doc

Mechanical extraction; `init` invents nothing.

1. Read the source doc; section by section, extract each feature's slug, `Source` (`§N`), and
   dependency relationships (parse the "execution order" / "depends on" / "after X is SHIPPED"
   wording).
2. Dependency semantics default to `shipped`; only mark `ready_to_ship` if the source doc explicitly
   says something like "can start once X is READY".
3. Items blocked on external input (waiting on legal, a business decision) get Status
   `BLOCKED_EXTERNAL` directly.
4. Automation Mode defaults to the header Default; if the source doc has a specific recommendation
   for an individual feature, mark that row.

#### Decompose path — input is a raw PRD / multi-subsystem plan

`init` performs the feature decomposition itself: it partitions the PRD into independent feature
units, **analyses how those features relate**, infers the dependency graph, and seeds each feature
for Step 0. This path *proposes* a decomposition — the shared-tail review gate is where the author
confirms or corrects it.

1. **Read the project's structural context** — not just the PRD. Decomposition must respect how this
   project is actually organised: read `<feature_map_doc>`, `<refactor_plan_doc>`, `<onboarding_doc>`,
   and the `<feature_root>` layout, so the carved-out features land on real module boundaries rather
   than arbitrary ones.
2. **Partition into candidate features.** Carve the PRD into the smallest independent units that
   each make sense as one `feature-full-loop` run — one cohesive change, ideally one module / slice.
   Prefer boundaries that already exist in the project structure. This step *may* spawn parallel
   analysis subagents — e.g. one per subsystem named in the PRD — to propose boundaries + relationships
   concurrently, then `init` synthesises their results. Spawning keeps `init`'s own context small
   (A3 principle 3); `init → analysis-subagent` is a shallow one-level spawn, well under any
   spawn-depth cap.
3. **Analyse inter-feature relationships, then infer the dependency graph.** Do not jump straight to
   `depends_on` edges — first reason explicitly about how the candidate features relate, because the
   relationships are what *justify* the edges:
   - **shared modules / files** — two features that edit the same module are a concurrent-edit
     conflict risk; either sequence them, or carve a cleaner boundary so they stop overlapping.
   - **contract / data dependencies** — feature B consumes an API, schema, or event that feature A
     introduces → B `depends_on` A.
   - **sequencing / foundation** — a kickoff or foundational feature that must land before a group
     can start.
   - **true independence** — features with no shared surface and no contract link can run in the
     same wave; do not invent edges between them.
   Then set the `depends_on` edges and `Dep Semantics` (default every edge to `shipped`; relax to
   `ready_to_ship` only where the PRD's wording clearly allows it). Assign a canonical `Slug` per
   feature.
4. **Clarify genuine ambiguity with the user — do not silently guess.** Decomposition involves real
   judgement, and some of it the skill cannot resolve from the PRD + project structure alone: is
   this one feature or two? does A genuinely depend on B, or can they run in parallel? what is the
   relative priority / sequencing? is this scope in or out? When a decision is genuinely ambiguous
   **and the choice materially changes the manifest**, pause and ask the user a focused
   multiple-choice question (an AskUserQuestion-style clarification round) *before* finalising.
   Batch related questions so the user answers a short round, not a drip. Guessing is only
   acceptable for low-stakes details — and every guess must be recorded in the Decomposition
   Rationale (step 6). The shared-tail review gate is the *final* safety net; it is not a licence to
   skip asking when the skill already knows it is unsure.
5. **Write a per-feature seed brief.** For each carved-out feature, write a `<roadmap_seed_brief>`
   stub at `<review_root>/<slug>/<YYYYMMDD>-roadmap-seed.md`: the 1-3 sentence requirement, the hard
   constraints, and the acceptance signal, drawn from the PRD (and from any clarification answers in
   step 4). The manifest row's `Source` cell points at this file. **The seed brief is not a
	   conformant feature brief** — it is Step 0's *input*. When `run` later emits an
	   `<skill_prefix>feature-full-loop` block for this feature, Phase 1 Step 0 reads the seed brief and normalises it into the real
   `*-feature-brief.md` through the usual QA Gate. Decompose feeds Step 0; it never bypasses it.
6. **Write a `## Decomposition Rationale` section** into the manifest file, below the `## Features`
   table: why these boundaries, what inter-feature relationships were found (shared modules,
   contract links, sequencing), what dependency edges were inferred and from what, **what was asked
   of the user in step 4 and how they answered**, what assumptions / guesses were made, and what is
   still uncertain / needs the author's eyes. This is the artifact the human reviews at the
   shared-tail review gate. (`run` mode parses only the `## Features` table and ignores this section.)

#### Both paths — shared tail (the review gate)

After the path-specific steps above, both paths converge:

- **Write the manifest** to `<roadmap_manifest_dir>/<roadmap_name>.md` (set `Init Path:` accordingly).
- **Stop at the review gate.** Output the manifest path + a dependency-graph wave summary; on the
  decompose path also surface the Decomposition Rationale and the seed-brief locations. Hand to a
  human for review. **`init` never auto-continues into `run`** — the manifest is meant to be
  eyeballed once. On the parse path that review is a quick "did extraction work" check; on the
  decompose path it is *substantive* — the human signs off on the feature boundaries and dependency
  graph the skill proposed. End with a Next Step: the literal `run` invocation, to be used once the
  human is satisfied.

### A7.3 `run` mode — emit-dispatch by default

This is the core of hands-off operation. The skill computes one dependency wave, emits one
`<skill_prefix>feature-full-loop` prompt block per eligible feature, and stops. The human opens those
blocks in independent sessions; re-running `run` reconciles from `dev_log` truth and emits the next
wave.

```text
# ── reconcile: correct the manifest against dev_log truth first ──
# Reconcile only writes MONOTONIC ADVANCES and never regresses a human-edited row.
# Branch on the row's PRIOR MANIFEST Status (not the dev_log Status). Full rules:
# the appendix SKILL.md §3.1.
for each manifest row, by prior manifest Status:
    SHIPPED          → no-op
    BLOCKED_EXTERNAL → no-op (preserve) — only a human edit to PENDING releases it;
                       "no dev_log yet" is the EXPECTED state, never infer PENDING
    BLOCKED          → no-op (preserve) — recovery is a human edit back to PENDING;
                       a stale dev_log BLOCKED must not re-flip it
    READY_TO_SHIP    → dev_log SHIPPED → SHIPPED (deps unlock); else no-op
    IN_PROGRESS      → dev_log SHIPPED/READY_TO_SHIP → set that;
                       dev_log BLOCKED → manifest BLOCKED (only auto-BLOCKED path);
                       dev_log missing/mid-pipeline → stale-IN_PROGRESS rule:
                         recent Last Run + live <orchestrator_marker_dir>/<slug>.awaiting_*
                           → keep IN_PROGRESS (human resumes feature-full-loop directly)
                         else → revert to PENDING for a clean retry
    PENDING          → dev_log SHIPPED/READY_TO_SHIP → set that; else stay PENDING

# ── emit-dispatch ──
eligible = features where:
    Status == PENDING
    AND every dep satisfied:
        dep.Status == SHIPPED                          (dep semantics = shipped)
        OR dep.Status in {READY_TO_SHIP, SHIPPED}      (dep semantics = ready_to_ship)
    AND no dep is BLOCKED / BLOCKED_EXTERNAL
    AND row Automation Mode resolves to a legal variant

if eligible is empty:
    stop with the wrap-up case

write the manifest to disk after reconcile updates
emit one prompt block per eligible feature:
    /<skill_prefix>feature-full-loop
    Feature: <slug>
    Automation Mode: <resolved Automation Mode>
    Verify Cross-vendor: <resolved yes|no>
    Requirement: <resolved from Source>

STOP. Do not mark IN_PROGRESS. Do not spawn anything.

# ── wrap-up ──
output the wave summary:
    READY_TO_SHIP queue (waiting for the human batch ship)
    BLOCKED / BLOCKED_EXTERNAL list + reasons
    Next Step
STOP
```

### A7.4 The 3 ways `run` mode stops

1. **Normal end of a wave** — there are no more `eligible` features. Usually because the rest are
   waiting on some `READY_TO_SHIP` feature to be human-shipped. → output the pending-ship queue.
2. **All done** — every feature is `SHIPPED`, or `SHIPPED` + `BLOCKED_EXTERNAL`. → roadmap wrap-up.
3. **Fully stuck** — there are still `PENDING` features, but all their dependencies are `BLOCKED`. →
   output the blocking chain; needs human intervention.

In all three cases the skill only **stops and reports** — it never runs `ship` itself.

### A7.5 The skill's hard constraints

These go verbatim into the `SKILL.md` (see Appendix):

- **Never spawn `ship`.** The Layer-1 constraint of A4.1.
- **Never write any feature's `dev_log.md` Status Panel.** Status Panel write authority belongs to
  the worker subagents in the `02` §2.6 matrix. The skill writes only the roadmap manifest and — on
  the decompose path — the per-feature seed briefs (A7.2); it only *reads* every `dev_log`.
- **Never inline-run a feature pipeline inside roadmap-loop.** Every feature must run in an
  independent feature execution context. Default implementation: emit a paste-ready
  `<skill_prefix>feature-full-loop` block for a new session/window.
- **BLOCKED does not raise an exception and does not stop the whole roadmap.** Mark + skip + continue.
- **Write the manifest to disk before and after every state-changing dispatch.** Crash recovery depends
  on it. In the default emit-dispatch path this means before emitting the wave summary and after every
  reconcile update; in the legacy spawn-dispatch path it also means before/after each spawn.
- **The manifest is the single source of state.** Never keep roadmap content in conversation memory.
- **On the decompose path, ask before guessing.** When a decomposition decision is genuinely
  ambiguous and materially changes the manifest, raise a focused clarification question (A7.2 step
  4) rather than silently guessing. The review gate is the final net, not a licence to skip asking.

### A7.6 The skill satisfies the Universal Next Step Contract

The roadmap-loop skill is an **orchestration skill**, so it is bound by the Universal Next Step
Contract (`02` §3.3). It does not emit a `## Handoff` block, but **every exit of both modes ends with
an explicit, copy-pasteable Next Step**:

- `init` exit → Next Step = the literal `run`-mode invocation for this manifest, after the human has
  eyeballed the dependency graph.
- `run` exit, normal wave end → Next Step = the spelled-out batch-ship instruction for the
  `READY_TO_SHIP` queue, then "re-run roadmap-loop to unlock the next wave".
- `run` exit, all done → Next Step = the roadmap wrap-up instruction.
- `run` exit, fully stuck → Next Step = the recovery instruction (which blocking chain to unblock,
  and how the unblocked rows return to `PENDING`).

## A8. Failure & recovery

| Situation | Behaviour |
|---|---|
| skill crashed mid-run | the manifest was written to disk incrementally. Re-run `run` → the reconcile step reads `dev_log` truth → resumes from the correct position, does not redo `READY_TO_SHIP` / `SHIPPED` rows. |
| a `run` crashed while a row was `IN_PROGRESS` | reconcile detects the stale `IN_PROGRESS`: if that feature's `dev_log` has not reached a terminal state, reconcile resets the row to `PENDING` (with a Note) so the next `run` cleanly retries it — re-spawning `feature-full-loop` is safe because it resumes from `dev_log`. A row is never left permanently stuck at `IN_PROGRESS`. |
| a feature's `feature-full-loop` returned BLOCKED | manifest marks `BLOCKED`, driver skips and continues; reported at the end of the wave. After a human fixes it, manually set that row back to `PENDING`; the next `run` retries it. |
| external dependency not arrived | marked `BLOCKED_EXTERNAL` at `init` time. Driver always skips it, not counted as a failure. Once the external input arrives, a human sets the row back to `PENDING`. |
| human shipped a batch and wants to continue | just re-run `run`. The reconcile step flips the just-shipped rows to `SHIPPED`, the downstream wave unlocks automatically. |
| dependency chain fully stuck | A7.4 case 3; output the blocking chain, human intervenes. |
| the decompose path proposed a wrong feature boundary or dependency edge | caught at the `init` shared-tail review gate (A7.2) — `init` never auto-continues to `run`. Hand-edit the manifest + the affected seed briefs, or re-run `init` with a corrected PRD. Once `run` has started a feature, its slug is immutable (A6.3). |
| the manifest was hand-edited into an invalid state | the skill validates the schema at the start of `run`; on a parse failure it stops and reports, it does not run on a broken manifest. |

Core property: **the manifest is the state source, the `dev_log` is the fact source, the skill is
stateless logic.** Re-running `run` is always safe.

## A9. Boundaries & non-goals

This layer **does not**:

- **Auto-push.** `ship` stays human; the project's V2 workflow is not modified.
- **Modify the core workflow.** This layer sits entirely on top of the existing core +
  `<skill_prefix>feature-full-loop`,
  with zero changes to `01`-`05`.
- **Do single-feature phase orchestration.** Step 0 → plan → review → build → verify is
  `<skill_prefix>feature-full-loop`'s job (`04`); this layer only emits work for it.
- **Write the `dev_log` Status Panel.** See A7.5.
- **Unilaterally own the feature decomposition or the dependency graph.** On the parse path `init`
  only extracts what the roadmap author already decided. On the decompose path `init` *proposes* a
  decomposition and a dependency graph — and where a decision is genuinely ambiguous it asks the
  user (A7.2 step 4) rather than guessing — but it never reaches `run` without the shared-tail human
  review gate. The author still owns the decisions; `init` drafts and asks, the human signs off. The
  invariant is "ask when unsure + the review gate", not "no proposing".
- **Validate that the PRD's requirements are good.** Decompose carves a reviewed PRD into features;
  it assumes the *requirements themselves* (the business decisions, the scope) were already reviewed
  and approved. It adds structural decomposition, not requirement judgement.
- **Normalize per-feature briefs.** Each feature's brief quality is guaranteed by Step 0 inside
  `feature-full-loop`. The decompose path's seed briefs are Step 0's *input*, not a substitute for
  it — Step 0's QA Gate still runs per feature.

If a future project wants "even push automated", that is a governance decision to **modify the V2
`ship` constraint** — out of scope for this layer, and it should go through that project's own
workflow.

## A10. Portable / project split line for Layer 3.5

This file (`06`) is the **portable** Layer 3.5 paradigm: the manifest schema, the Status state
machine, the skill's two-mode logic, the hard constraints, the failure model. A project's concrete
roadmap doc instantiates it. The following belong in the **project** layer, never here:

- **The concrete roadmap instance** — the actual N-row manifest for a specific roadmap, with real
  slugs, real dependency edges, real wave annotations.
- **The real `<roadmap_manifest_dir>` value** and the real `<skill_prefix>roadmap-loop` skill name.
- **The concrete roadmap source doc** the manifest was generated from.
- **The landing checklist** — which prerequisites are met in this repo, the suggested landing order,
  the registry entry for the skill.
- **Project incident history** — the "why this rule exists" war stories stay in the project doc; `06`
  keeps only the distilled, currently-effective rule.

Rule of thumb (same as `docs/workflow/README.md`): *if a sentence would need to change in another
project, it is project-specific and does not belong in `06`.*

---

# Part B — Developer Guide

This half is for a developer using Layer 3.5 for the first time: what to type, what you will see,
what to do when it gets stuck. For spec details, go back to Part A.

## B1. Preflight checks

Confirm three things before you start — miss any one and this layer cannot run:

| Check | How to confirm |
|---|---|
| `<skill_prefix>feature-full-loop` skill is in place | `ls <skill_root>/<skill_prefix>feature-full-loop/SKILL.md` returns a hit; compatibility `feature-full-loop` agents may also be registered but are not the default runtime |
| the `<skill_prefix>roadmap-loop` skill is in place | `ls <skill_root>/<skill_prefix>roadmap-loop/SKILL.md` returns a hit |
| you have a **reviewed** source doc | either a pre-decomposed roadmap doc (→ `init` parse path) **or** a raw PRD / multi-subsystem plan (→ `init` decompose path). Either way, the *requirements themselves* must already be reviewed and approved |

> This layer does not validate requirement quality for you. With a pre-decomposed roadmap doc, every
> feature section must already be a conformant input. With a PRD, the decompose path will carve out
> the features and infer the dependency graph for you — but you must review that decomposition at
> the `init` gate, and the PRD's requirements must themselves already be approved. This layer
> schedules and (on the decompose path) partitions; it does not "complete vague requirements" —
> per-feature requirement QA still happens in Step 0 inside each `feature-full-loop`.

## B2. The standard flow — three actions

For a developer, the whole layer is just three actions, used in a loop.

**Action 1 · `init` (once per roadmap)**

```text
/<skill_prefix>roadmap-loop
mode: init
source: <roadmap_source_doc>
```

`source:` can be **either**:

- a **pre-decomposed roadmap doc** (features already identified with sections) → `init` takes the
  *parse path*: mechanical extraction, invents nothing; or
- a **raw PRD / multi-subsystem plan** → `init` takes the *decompose path*: it reads the PRD plus
  your project's structural context, carves the work into independent features, analyses how those
  features relate (shared modules, contract links, sequencing), infers the dependency graph, writes
  a seed brief per feature, and adds a `## Decomposition Rationale` to the manifest explaining its
  choices. **On the decompose path it may pause and ask you a focused multiple-choice question**
  when a boundary, a dependency, or a priority is genuinely ambiguous — answer the round and it
  continues. It asks rather than guessing; the few guesses it does make are listed in the Rationale.

`init` auto-detects which path; pass `input_kind: roadmap | prd` to force one. Either way it
produces `<roadmap_manifest_dir>/<roadmap_name>.md` and then **stops** so you can eyeball it. You
will see something like:

```text
✅ Manifest generated: <roadmap_manifest_dir>/<roadmap_name>.md
   Init Path: decompose   (carved N features out of the PRD)
   N features; dependency graph has W waves:
   wave 0: roadmap-kickoff
   wave 1: <slug>, <slug>, <slug>, ...
   wave 2: <slug>, <slug>, ...
   BLOCKED_EXTERNAL: <slug> (waiting on external input)
   Seed briefs written under <review_root>/<slug>/ for each feature.
   ⚠ Review the Decomposition Rationale + the dependency graph before starting run mode.
   Next Step: /<skill_prefix>roadmap-loop  manifest: <roadmap_manifest_dir>/<roadmap_name>.md
```

**What this step asks of you:** open the manifest. On the parse path, just check the dependency
edges and wave split parsed correctly. On the decompose path the review is **substantive** — you are
signing off on the feature boundaries and the dependency graph the skill *proposed*: read the
`## Decomposition Rationale`, skim the seed briefs, fix anything wrong by hand-editing the manifest /
seed briefs. When it looks right, go to Action 2.

**Action 2 — `run` (per wave, repeat until done):**

```text
/<skill_prefix>roadmap-loop
manifest: <roadmap_manifest_dir>/<roadmap_name>.md
```

Reconciles from dev_logs, computes the eligibility frontier, and **emits one prompt block per
eligible feature**. STOP — does NOT execute the work. Open the printed blocks in N parallel
sessions and run each. When any feature reaches SHIPPED, re-run this command and the next wave's
eligible blocks are emitted.

```text
🚀 Wave <N> — <K> features eligible. Copy each block to a new session.

──────────────── Block 1 (first eligible): <slug> ────────────────
/<skill_prefix>feature-full-loop
Feature: <slug>
Automation Mode: <Mode_1>
Verify Cross-vendor: <resolved value from row or header default>
Requirement: <resolved from row.Source>

──────────────── Block 2 (second eligible): <slug> ────────────────
...

Next Step: open <K> new sessions in parallel and paste each block. After any
feature(s) SHIPPED, re-run roadmap-loop here for the next wave.
```

If the host tool has sufficient nesting capacity and you'd rather have the skill drive the spawn
directly, pass `dispatch: spawn` (§A7.3 → §3.2-opt-in). Most users on Claude Code / Codex should
NOT use spawn (it hits the depth cap; see §A5).

**Action 3 · batch ship (once at the end of each wave)**

When you come back, ship the `READY_TO_SHIP` queue one by one:

```text
Start the ship agent for <slug>.
```

`ship` still waits for your `git push` confirmation per the V2 constraint — that human gate is not
skipped. The few features of one wave can be shipped back to back in the same session.

Once shipped, go back to Action 2 for the next wave. So it is `init → (run → batch ship) × W →
wrap-up`.

> **Mode resolution at run time:** if the manifest header `Default Automation Mode` is missing or
> invalid and per-row Modes weren't pre-set, `run` will fire the Automation Mode picker once at
> preflight and use the answer as a session-local fallback (not written back to the manifest). To
> persist, edit the manifest header directly. Full rules: `_portable/07-automation-mode-picker.md`
> §4 + Appendix SKILL.md §3.1.5.

## B3. A worked example — one roadmap from wave 0 to wave 1

Take a roadmap with a kickoff feature (`roadmap-kickoff`) that unblocks everything else, plus a set
of features that fan out from it.

**Day 1 morning** — the developer runs Action 1, `init`. Reviews the manifest, confirms the rows and
waves parsed correctly. The manifest now reads (abbreviated):

```text
| 1 | roadmap-kickoff | —              | PENDING          | ...
| 2 | <slug>          | roadmap-kickoff| PENDING          | ...
| 3 | <slug>          | roadmap-kickoff| BLOCKED_EXTERNAL | ...  (waiting on external input)
| 4 | <slug>          | roadmap-kickoff| PENDING          | ...
... (the rest PENDING)
```

**Day 1 morning** — the developer runs Action 2, `run`. Right now the only `eligible` feature is
`roadmap-kickoff` (everything else depends on it, and it is not SHIPPED yet). The skill emits one
`<skill_prefix>feature-full-loop` block and stops. The developer opens that block in a fresh session,
which drives the kickoff to `READY_TO_SHIP`:

```text
🟢 Wave complete. Processed 1 feature this round:
   READY_TO_SHIP: roadmap-kickoff
   Next Step: ship roadmap-kickoff, then re-run roadmap-loop — wave 1 will unlock.
```

**Day 1 afternoon** — the developer runs Action 3: `Start the ship agent for roadmap-kickoff.`,
confirms push. The kickoff's `dev_log` flips to `SHIPPED`.

**Day 1 afternoon** — runs Action 2, `run`, again. The skill first reconciles: it reads each
feature's `dev_log`, finds `roadmap-kickoff` is now `SHIPPED` → syncs the manifest row 1 to `SHIPPED`
→ wave 1's features now have their dependency satisfied and become `eligible`. The skill emits one
`<skill_prefix>feature-full-loop` block for each. The developer opens the blocks in parallel sessions
and walks away while those runs work independently.

**Day 1 evening / Day 2** — the developer comes back, sees the wave summary from Action 2: several
`READY_TO_SHIP`, maybe one `BLOCKED`.

**Day 2** — batch-ship the `READY_TO_SHIP` features; for the `BLOCKED` one, read its `dev_log`, fix
the requirement, then manually set that manifest row back to `PENDING` so the next `run` retries it.
Then `run` → wave 2.

The whole roadmap goes like this for W rounds. The developer's total interaction ≈ 1 `init` + W
`run`s + N `ship` confirmations (collapsed into W batch-ship sessions) + the occasional BLOCKED
handling. Compared to fully manual operation — hundreds of commands — and each gap between `run`s is
hours of hands-off development.

## B4. Common situations

| Situation | What you do |
|---|---|
| want to peek at progress without interrupting the `run` | open another window, `cat <roadmap_manifest_dir>/<roadmap_name>.md`, look at the Status column; or `tail -f` a feature's `dev_log` |
| the `run` session crashed midway | just re-run Action 2. The reconcile step reads `dev_log` truth and resumes; it does not redo finished features |
| a feature is `BLOCKED` | read its `dev_log` Blockers; after fixing, set that manifest row back to `PENDING`; the next `run` retries it |
| a feature is waiting on external input | it sits as `BLOCKED_EXTERNAL` in the manifest, the driver always skips it; once the external input arrives, set it back to `PENDING` |
| a `run` finished a wave with no `READY_TO_SHIP`, everything `BLOCKED` | the dependency chain is fully stuck (A7.4 case 3); needs human intervention, not something hands-off operation can solve |
| you want to skip a feature entirely | manually set that row's Status to `SHIPPED` or delete the row — but note its downstream dependencies will unlock, so confirm that is safe |

## B5. One-sentence mental model

**`init` once to fix the manifest; after that, each wave is the three-step loop "type `run` once,
walk away, come back and batch-ship" — the manifest remembers progress, so you don't have to.**

---

# Appendix — the `<skill_prefix>roadmap-loop` SKILL.md draft

> At landing time, copy this into `<skill_root>/<skill_prefix>roadmap-loop/SKILL.md` and replace
> `<skill_prefix>`. This is a draft — before landing, align the frontmatter fields and directory
> conventions with the project's skill convention (use an existing skill as the reference).

````markdown
---
name: <skill_prefix>roadmap-loop
description: Roadmap orchestration layer (Layer 3.5). Parses a reviewed roadmap source doc into a manifest (init mode), then emits <skill_prefix>feature-full-loop prompt blocks wave by wave to push every eligible feature to READY_TO_SHIP (run mode). Triggers: roadmap loop, roadmap orchestration, batch-run features, auto-develop a roadmap, advance a roadmap, roadmap manifest.
---

# <skill_prefix>roadmap-loop

Layer 3.5 roadmap orchestration skill. Full spec: `docs/workflow/_portable/06-roadmap-orchestration.md`
(and the project's concrete roadmap-orchestration doc).

## 0. Hard constraints (inviolable in any mode)

1. **Never spawn `ship`.** Ship is always human-triggered (the project's V2 `ship` constraint).
2. **Never write any feature's `dev_log.md` Status Panel.** The skill writes only the roadmap
   manifest and — on the decompose path — the per-feature seed briefs (§2b step 5); it only *reads*
   every `dev_log`.
3. **Never inline-run a feature pipeline inside roadmap-loop.** Every feature must run in an
   independent feature execution context. Default implementation: emit a paste-ready
   `<skill_prefix>feature-full-loop` prompt block for a new session/window.
4. **BLOCKED does not raise an exception and does not stop the whole roadmap.** Mark + skip + continue.
5. **Write the manifest to disk before and after every state-changing dispatch.** Crash recovery
   depends on this. In the default emit-dispatch path this means "before emitting the wave summary"
   and after every reconcile update; in the legacy spawn-dispatch path it also means before/after each
   spawn.
6. **The manifest is the single source of state.** Never keep roadmap content in conversation memory.
7. **Every exit of every mode ends with an explicit, copy-pasteable Next Step** (the Universal Next
   Step Contract — `02` §3.3).
8. **init never auto-continues into run, and the decompose path never bypasses Step 0.** init always
   stops at the human review gate; the decompose path's seed briefs are Step 0's *input*, not a
   replacement for it.
9. **On the decompose path, ask before guessing.** When a decomposition decision is genuinely
   ambiguous and materially changes the manifest, raise a focused AskUserQuestion-style clarification
   round before finalising; record every guess in the Decomposition Rationale.
10. **Default dispatch is emit, not spawn.** `run` mode does NOT spawn `feature-full-loop` as Task
    subagents. Instead, it emits a copy-paste-ready prompt block per eligible feature, telling the
    user to run `<skill_prefix>feature-full-loop` in a separate session/window. Rationale: the
    3-level nesting (caller → roadmap-loop → feature-full-loop → feature-plan) hits the
    spawn-depth cap on most tool platforms (Claude Code default; Codex `max_depth=2`). The user is the real dispatcher;
    roadmap-loop is the tracker. Opt-in to spawn-dispatch by passing `dispatch: spawn` in the
    invocation when running on a tool with sufficient nesting capacity.
11. **Run mode never marks rows IN_PROGRESS.** Since the skill does not actually execute the work
    (the user does, in parallel sessions), Status flips happen via reconcile reading dev_log truth
    on the next `run` invocation. Rows stay PENDING until reconcile sees SHIPPED / BLOCKED in the
    corresponding dev_log Status Panel. (The legacy spawn-dispatch path under `dispatch: spawn`
    retains the old IN_PROGRESS marking — it actually drives the work and needs the lock.)
12. **Run-time Mode fallback is session-local and never written back to the manifest.** The
    `run_time_fallback` resolved at picker `07` §4 layer 4 stays in session memory; persistence
    requires init or a human hand-edit of the manifest header.

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

1. Read the project's structural context — `<feature_map_doc>`, `<refactor_plan_doc>`,
   `<onboarding_doc>`, the `<feature_root>` layout — so features land on real module boundaries.
2. Partition the PRD into the smallest independent candidate units that each make sense as one
   `<skill_prefix>feature-full-loop` run; prefer existing project boundaries. This step MAY spawn parallel
   analysis subagents (e.g. one per subsystem named in the PRD), then synthesise their results —
   this keeps init's own context small (spec §A3 principle 3).
3. Analyse inter-feature relationships first, then infer the dependency graph from them: shared
   modules/files (concurrent-edit conflict risk), contract/data dependencies, sequencing/foundation,
   true independence (do not invent edges). Set `depends_on` + `Dep Semantics` (default `shipped`;
   relax to `ready_to_ship` only where the PRD clearly allows). Assign a canonical `Slug` per feature.
4. Clarify genuine ambiguity with the user — do NOT silently guess. When a decision is genuinely
   ambiguous AND materially changes the manifest (one feature or two? real dependency or
   parallelisable? priority/sequencing? scope in or out?), pause and ask a focused, batched
   AskUserQuestion-style clarification round before finalising. Guess only low-stakes details, and
   record every guess in the Decomposition Rationale.
5. For each feature, write a `<roadmap_seed_brief>` stub at
   `<review_root>/<slug>/<YYYYMMDD>-roadmap-seed.md` (1-3 sentence requirement + hard constraints +
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
- AskUserQuestion **once** for the cross-vendor verify gate (`<project_workflow_doc>` §16.3 #5):
  - Question: "Strict cross-vendor verify gate? (recommended yes — strict; opt out to allow `feature-dev-loop` and skip the manual cross-vendor verify hand-off)"
  - Option 1: "Yes — strict (default)" → header `Default Verify Cross-vendor: yes`
  - Option 2: "No — allow feature-dev-loop (echo chamber accepted)" → header `Default Verify Cross-vendor: no`
  - All row `Verify Cross-vendor` cells are written as `(default)`; the user can hand-edit individual rows post-init for per-row overrides.
- Write the manifest to `<roadmap_manifest_dir>/<roadmap_name>.md` (set `Init Path:` accordingly);
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
- **prior `IN_PROGRESS`** → a legacy spawn-dispatch run left the row mid-flight (orchestrator exited
  `AWAITING_*`, or a crash). Reconcile by dev_log Status:
  - `SHIPPED` → manifest `SHIPPED`; `READY_TO_SHIP` → manifest `READY_TO_SHIP`.
  - `BLOCKED` → manifest `BLOCKED` (record the dev_log Blocker in `Note`) — the **only** path that
    writes manifest `BLOCKED` automatically.
  - a mid-pipeline value → apply the stale-`IN_PROGRESS` rule below.
  - dev_log missing / empty / unreadable → revert to `PENDING` (the prior spawn never reached a
    writable state; safe to retry).
- **prior `PENDING`** → advance only if the dev_log clearly shows work finished outside this skill:
  `SHIPPED` → `SHIPPED`; `READY_TO_SHIP` → `READY_TO_SHIP`; anything else (including `BLOCKED` and
  the mid-pipeline values) → **stay `PENDING`** (the human may have just reset the row; the next
  emitted `<skill_prefix>feature-full-loop` block hands the dev_log's actual state to the
  parent-session recipe, which knows how to resume).

**Stale `IN_PROGRESS` rule.** For an `IN_PROGRESS` row whose dev_log shows a mid-pipeline state:
- `Last Run` recent (same human-driven session, e.g. ≤ 24 h) AND a live marker exists at
  `<orchestrator_marker_dir>/<slug>.awaiting_*` → keep `IN_PROGRESS`, add `Note: resume pending`; do
  not re-eligibilise (the human resumes `<skill_prefix>feature-full-loop` for `<slug>` directly).
- otherwise (stale `Last Run` or no live marker) → revert to `PENDING` so the next loop iteration
  emits a fresh `<skill_prefix>feature-full-loop` block from the dev_log's current resume point; add
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
ask interactively in this tool.", Next Step "Edit `<roadmap_manifest_dir>/<roadmap_name>.md` header
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
  ║ /<skill_prefix>feature-full-loop                                          ║
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
    its own dev_log under <feature_root>/<slug>/docs/dev_log.md and reach
    READY_TO_SHIP (or BLOCKED) independently. After any feature(s) SHIPPED,
    re-run `<skill_prefix>roadmap-loop manifest: <roadmap_manifest_dir>/<roadmap_name>.md` here.
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
  after it returns, read the Handoff + <feature_root>/<slug>/docs/dev_log.md Status Panel:
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
- `<skill_prefix>feature-full-loop` skill not available → stop, instruct the human to land it first
  (spec §B1). End with a Next Step.
- source doc has no matching § for a feature → mark that feature BLOCKED, Note records "source
  section missing", continue.
````
