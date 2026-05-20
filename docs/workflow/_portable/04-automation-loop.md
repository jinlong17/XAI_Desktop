# 04 — Automation Loop: Variant Matrix, Per-Variant Contracts & Degradation Rules (Portable)

> **Portable layer.** Project-agnostic. Defines the parent-session orchestration concept, the **8-variant
> automation matrix (named: A-Claude / B-Codex / B-Cursor / C-Codex / C-Cursor / D-Codex / D-Cursor /
> D-Codex+Cursor)**, the per-variant contracts and the real CLI invocation syntax, the
> quota-fallback chain, and the "Status Panel must not drift" degradation rule.
> **Codex and Cursor are the paradigm's two external executors** — they are *not* project-specific
> placeholders. The reference shell plumbing ships in `_portable/scripts/` (dispatch / hook /
> wrappers / `lib_phase_verdict.sh`).
> What still belongs in the project layer is only: the *concrete values* of the scratch-path
> placeholders, the project's exact `<cowork_scripts_dir>` install path and `.codex/config.toml`
> wiring, and project incident history — see §10.
> Companion: `01-workflow-model.md`, `02-handoff-and-state.md`, `_portable/scripts/`. Placeholders: `00-PORTABLE-MANIFEST.md`.

---

## 1. Goal

Once the core subagent workflow (`01`/`02`) is complete and the `feature-dev-loop` / `bugfix-loop`
orchestrators run, **full-pipeline automation** still needs three things:

1. The automation Modes (A/B/C/D) must have explicit, selectable execution paths.
2. The "external executor" of the cross-tool Modes can be swapped between two external tools
   (e.g. Codex ↔ Cursor). With 1 single-IDE mode + 3 cross-tool modes × 2 external tools =
   **8 named workflow modes**.
3. Any variant, on quota exhaustion / tool unavailability / hook failure, must **degrade gracefully**
   to the single-IDE mode — **without letting the Status Panel drift**.

One-sentence definition:

> **The core workflow (`01`/`02`) decides "who has the authority to write state"; this file decides
> "who types, who relays the baton, who is the fallback."**

### 1.1 The real entry point is a parent-session recipe, not manually typed prompts in sequence

The core 12-subagent set still needs one parent-session recipe plus three compatibility
orchestration-layer contracts for true automation:

1. **`<skill_prefix>feature-full-loop`** — recommended end-to-end parent-session recipe (feature dev)
2. **`feature-full-loop`** — compatibility contract / legacy subagent wrapper (feature dev)
3. **`bugfix-full-loop`** — end-to-end compatibility orchestrator (bugfix)
4. **`feature-phase-review`** — phase-granularity gate review (Mode C only)

Without them, a developer manually dispatches `<step0-skill>` → `feature-plan` → `feature-review` →
`feature-dev-loop` → `ship` — that is not automation, it is manual scheduling.

The single user-facing entry point:

```text
/<skill_prefix>feature-full-loop
Requirement: <a freeform requirement; the orchestrator derives the canonical name>
Automation Mode: <one of the 8 variant identifiers>
```

`<skill_prefix>feature-full-loop` auto-completes Step 0 → plan → review (with REVISE return) → build → verify, and
**only stops before ship for human confirmation** (ship is the one mandatory human push gate).

The 8 variants differ only inside `<skill_prefix>feature-full-loop`'s **Phase 4 (build + verify)** — how it
delegates the external executor. The other 4 phases (intake / plan / review-loop / human-gate) behave
identically across all variants.

The 8 variants, by name (the `Automation Mode:` enum — see §3): **A-Claude** (single-IDE);
**B-Codex / B-Cursor** (hook-relay); **C-Codex / C-Cursor** (phase-granularity); **D-Codex /
D-Cursor** (lead-and-delegate), with **D-Codex+Cursor** as D's strongest external-executor
fallback-chain combo. Per-variant contracts are in §3.3–§3.7.

**Ideal-path interaction count:** the whole pipeline has only 2 user interactions — ① start
`<skill_prefix>feature-full-loop` (input requirement + variant once); ② after seeing the `READY_TO_SHIP` Handoff,
manually run `ship`. The middle 5 phases are fully automatic. Variant-specific extra interactions:
single-IDE / lead-and-delegate variants add 0; hook-relay variants add 1 resume; phase-granularity
variants add 2N (N = phase count).

> **Above the recipe: Layer 3.5.** `<skill_prefix>feature-full-loop` orchestrates one feature's 5
> phases. To drive a whole *reviewed roadmap* of N independent features hands-off — repeatedly
> emitting `<skill_prefix>feature-full-loop` blocks wave by wave, with the human `ship` gate collapsed from per-feature to
> per-wave — see `06-roadmap-orchestration.md` (the roadmap manifest + the roadmap-loop skill). `06`
> sits on top of this file and changes nothing here.

---

## 2. Industry SOTA baseline (the design rests on these)

### 2.1 Planner / Worker / Judge three-layer structure

A mature multi-agent coding loop splits planning, execution, and judging across different agents, and
the Judge is the sole arbiter of "do we proceed to the next round".

| Role | Responsibility | Maps to |
|------|----------------|---------|
| Planner | Continuously scan the codebase, generate tasks | `feature-plan` |
| Worker | Do not coordinate with each other, just implement and push | `feature-build` / `feature-auto-build` (any tool) |
| Judge | Decide each round: continue or BLOCKED | `feature-review` / `feature-verify` |

### 2.2 Multi-model routing — do not let the most expensive model do everything

- `feature-plan` / `feature-review` / `feature-verify` / `bug-diagnose`: a strong reasoning + judging model
- `feature-build` / `feature-auto-build` / `bug-fix` / `bug-auto-fix`: a strong code-generation model (long diffs)
- `ship`: a fast workhorse model

The variants differ only in the **Claude / external-tool split ratio** and the **relay trigger**.

### 2.3 Cross-tool relay goes through documents, not conversation context

All subagents relay through the shared `dev_log.md` / `design.md` / `api.md` / `test.md`. The relay
trigger only needs to *legally start* the next agent's entry point — the state itself is carried by
`dev_log.md`, it does not need to be passed between agents.

### 2.4 Hooks = the mainstream "event → action" trigger mechanism

- IDE lifecycle hooks (session start/end, pre/post tool use, stop) can attach shell commands
- Git hooks (`pre-commit` / `post-commit` / `pre-push`) are the most reliable neutral entry point for cross-tool relay

### 2.5 Quota limits are the norm, not an exception

Every external coding tool has a token/credit/message quota. Quota-exhaustion error signals are often
**not officially guaranteed** — a landing detector must use loose matching + CLI exit code + structured
JSON output from multiple sources, never hard-depend on a single error string. Every Mode must have a
fallback chain so a single executor hitting its cap does not stall the pipeline.

### 2.6 Desktop-IDE injection is unreliable; CLI is the reliable automation entry

Most desktop IDEs have **no officially stable "external-process prompt injection" path**. All
"orchestrator → external executor" automation relay should go through the external tool's **CLI
headless mode**. Desktop-app "wake up" paths are experimental; CLI sync paths are the recommended
"reliable automation".

---

## 3. The 8-variant matrix

> **How a Mode is chosen at runtime:** this section defines *what* the 8 variants are. The runtime
> picker (at meta-orchestrator Phase 0 INTAKE / per-row at roadmap-loop init / run preflight
> fallback) is specified in `_portable/07-automation-mode-picker.md`. Phase 0 INTAKE is **3-field**,
> not Mode-only: Requirement/Bug missing → hard BLOCKED before any picker (`07` §1A); Mode → the
> 4-option Q1; Verify Cross-vendor → Q2 in the *same* AskUserQuestion (`07` §2.6). The 4-option
> Mode layout is A-Claude / D-Codex+Cursor / D-Codex / D-Cursor; B/C variants are reachable only by
> explicit `Automation Mode: <variant>` invocation (see `07` §2.3).

The paradigm has three tools: **Claude Code** is the lead IDE; **Codex** and **Cursor** are the two
external executors. Mode A (single-IDE) has no external-executor swap; the 3 cross-tool Modes each
have a Codex variant and a Cursor variant. `1 + 3 × 2 = 7`.

| Mode | Skeleton | Variants |
|------|----------|----------|
| **A — single-IDE loop** | Step 0 → plan → review → dev-loop → ship all inside Claude Code | **A-Claude** — one variant; everything in one IDE, native Task-spawn orchestrator |
| **B — hook relay to external executor** | The lead runs plan/review/verify/ship; after review APPROVED a hook auto-wakes the external executor for build; after it finishes a hook auto-returns to the lead for verify | **B-Codex** (headless `codex exec` — see §3.4) / **B-Cursor** (`cursor-agent` CLI) |
| **C — phase-granularity alternating dual executor** | Each phase = 1 external build + 1 lead `feature-phase-review` | **C-Codex** / **C-Cursor** — one external build per phase |
| **D — lead + delegation** | The lead's `feature-auto-build` worker delegates every implementation phase to an external CLI; if the configured external executors fail, the worker parks the phase as BLOCKED instead of self-implementing | **D-Codex** (`codex exec`) / **D-Cursor** (`cursor-agent`) / **D-Codex+Cursor** — external chain Codex → Cursor → BLOCKED |

> Naming convention: in `dev_log.md`'s Status Panel mark the variant as the all-caps hyphenated
> `Automation Mode:` field (one of the 8 names above), so hooks can route on it and logs can be
> searched. Per-variant contracts: §3.3 (A) / §3.4 (B) / §3.5 (C) / §3.6 (D) / §3.7 (Cursor specifics).

### 3.1 Selection guidance (by situation)

| Situation | Recommended | Why |
|-----------|-------------|-----|
| Temporary hotfix, single-step solvable | `A-Claude` | Most stable, avoids cross-tool overhead |
| Mid-size feature, plan APPROVED, phases ≥ 3 | `D-Codex` or `D-Cursor` | Sync path, CLI call is most direct |
| Large phase needing a big-context model | `D-Cursor` (`gpt-5.5-high` large context) | Headless CLI + large context window |
| High-risk change (touches core / manifest / cross-module) | `C-Codex` or `C-Cursor` | Per-phase dual-executor mandatory cross-check |
| Primary external tool hit its cap, task is large | `D-Codex+Cursor` | Codex → Cursor; if both fail, park BLOCKED with evidence |
| Both external tools exhausted | write `BLOCKED` + a Blocker; a human switches to `A-Claude` | Auto-degradation would cross the Status Panel write-authority boundary, so a human takes over |

### 3.2 Cross-tool complexity ranking

Low to high (lower is easier to maintain): A-Claude < D-class < B-class < C-class. The
phase-granularity (C) variants are highest because their "per-phase relay" must go through CLI +
post-commit hook — high call frequency, many concurrency guardrails.

**New-team recommendation:** first get the meta-orchestrator working with **A-Claude**, then one
D-class variant (**D-Codex** or **D-Cursor**) — those are the stable entry points. The B-class and
C-class variants are experimental paths; enable them only when the team genuinely needs the
event-driven model and accepts the ops burden.

### 3.3 Mode A — single-IDE (`A-Claude`)

The whole `step 0 → plan → review → dev-loop → ship` chain runs inside Claude Code; no cross-tool
hook fires. The orchestrator spawns workers natively via the Task tool. This is the most stable
variant and the recommended first feature.

- **Phase 4 behaviour:** `feature-full-loop` Task-spawns `feature-dev-loop`, synchronous, waits for
  return. All workers are Claude.
- **Quota fallback:** Opus cap hit → workers drop to Sonnet (reviewer/verify keep Opus); Sonnet also
  capped → write a Blocker, a human switches to a B/D variant so Codex/Cursor can take over.
- **Extra interactions:** 0 — the only 2 user touches are the start command and the human `ship`.

### 3.4 Mode B — hook relay (`B-Codex` / `B-Cursor`)

Event-driven **multi-state Status Panel dispatcher**. The post-commit hook fires on every dev_log
commit, reads the new Status, and dispatches the next workflow step to the appropriate vendor per
§16.3 cross-vendor rules. **2026-05-16 update**: hook scope expanded from "BUILD only" (APPROVED →
external build) to "REVIEW + BUILD + (optional) VERIFY" — covering `NEEDS_REVIEW`, `APPROVED`,
`READY_FOR_VERIFY`, `REVISE`, `BLOCKED` transitions.

**State machine:**

```text
Status: APPROVED (after Step 0)
  → orchestrator dispatches feature-plan to lead vendor (Claude)
  → feature-plan writes Status: NEEDS_REVIEW + commits
  → post-commit hook reads new Status:
      ├─ Status == NEEDS_REVIEW:
      │     resolve plan executor: grep "- Plan Executor:" then FALL BACK to the
      │       rolling "- Executor:" line (no dedicated Plan Executor field exists)
      │     determine OTHER vendor (cross-vendor §16.3 #3 — STRICT);
      │       vendor_dispatchable() sends MANUAL_CLAUDE/UNKNOWN to a clean notify
      │     render review prompt to <orchestrator_marker_dir>/<feature>-review-<ts>.txt
      │     write awaiting_review marker
      │     dispatch_<other_vendor>.sh <feature> <prompt_file> feature-review
      │     notify user "review dispatched to <other_vendor>; will resume on APPROVED/REVISE"
      ├─ Status == APPROVED:
      │     read variant (manifest or Status Panel "Automation Mode:" field)
      │     if variant ∈ {B-Codex, B-Cursor}:
      │         dispatch feature-auto-build to lead vendor
      │     notify user "build dispatched; will resume on READY_FOR_VERIFY"
      ├─ Status == READY_FOR_VERIFY:
      │     read "Verify Cross-vendor:" from Status Panel (set by feature-plan per §16.3 #5)
      │     if yes:
      │         resolve build executor (grep "- Build Executor:" then fall back
      │           to the rolling "- Executor:" line) → dispatch feature-verify to OTHER vendor
      │     if no:
      │         notify user "build done; verify cross-vendor opted out;
      │                       lead-handled or ship-direct"
      ├─ Status == REVISE:
      │     notify user "review returned REVISE — feed back to feature-plan manually,
      │                   then re-loop"
      └─ Status == BLOCKED:
            notify user "STOP — read dev_log Blocker section"
```

**Cross-vendor identity routing** (the hook must know which vendor ran what):

- The dev_log Status Panel keeps **ONE rolling `- Executor:` line** (whoever last committed) —
  there is **no** dedicated `Plan Executor:` / `Review Executor:` / `Build Executor:` field. The
  hook greps the named field for back-compat, then **falls back to the rolling `- Executor:`
  line** (at the NEEDS_REVIEW commit that line IS the plan executor; at READY_FOR_VERIFY it IS
  the build executor — the just-committed value is correct by construction).
- `vendor_dispatchable()` gates the result: only `codex` / `cursor` reach `dispatch_*.sh`; the
  sentinels `MANUAL_CLAUDE` (cross-vendor peer is Claude, no headless) and `UNKNOWN` short-circuit
  to a clean notify (a bare `[ -z ]` guard previously let them fall through to a bogus
  `dispatch_UNKNOWN.sh` / `dispatch_MANUAL_CLAUDE.sh`).
- "OTHER vendor" relative to a given step = any vendor in the project's executor pool except the
  one resolved from the rolling `- Executor:` line for that step.
- 2-vendor projects (Claude + Codex): trivially the other.
- 3+-vendor projects: pick deterministically per a project-layer routing config; if unspecified,
  prefer the vendor with fewest recent invocations (loose load-balancing).

**Status Panel write authority (extended from existing B-* — same as `_portable/02` §2.6):**

- Claude lead writes: `NEEDS_REVIEW` (via `feature-plan`), `READY_TO_SHIP`, `SHIPPED`.
- External vendor (Codex / Cursor) writes: `APPROVED` / `REVISE` (via `feature-review`),
  `READY_FOR_VERIFY` (via `feature-auto-build`), verify PASS / BLOCKED (via `feature-verify`).
  Trailers name the host worker (`feature-review`, `feature-auto-build`, `feature-verify`), never
  the tool.

**Resume behaviour:**

- All hook actions are fire-and-forget; the orchestrator session may have exited.
- User receives notifications (terminal beep + macOS notification or equivalent).
- To resume after any hook completes: re-invoke `/<skill_prefix>feature-full-loop Feature: <feature>`.
  The orchestrator reads current Status and decides next step (skip what's done, dispatch what's
  next).

**Reference scripts:** `_portable/scripts/dispatch_codex.sh`, `dispatch_cursor.sh`,
`git-post-commit`. All take an `<agent_name>` 3rd parameter (NEW 2026-05-16). See
`_portable/scripts/README.md`.

- **B-Cursor** is the cleaner B variant — `cursor-agent --print` runs headless from a shell, with a
  CLI exit code + JSON envelope for failure detection.
- **B-Codex is headless by default:** `dispatch_codex.sh` runs `codex exec --sandbox
  workspace-write --cd <repo> --json -` (genuinely unattended, verified working 2026-05-17 →
  `BRIDGE-OK`). The Codex *desktop app* has no officially stable "inject a prompt from an external
  process" path on macOS (`open -a "Codex"` / `codex app DIR` only open the workspace); the pbcopy
  + manual-`Cmd+V` route is a documented degraded fallback for teams that insist on the desktop
  app, not the automated path.
- **Extra interactions:** +0 in happy path (review / build / verify all auto-dispatch). User
  intervention only on REVISE or BLOCKED (or RTS → ship).

### 3.5 Mode C — phase-granularity (`C-Codex` / `C-Cursor`)

The highest-rigour variant: **every phase is one external build + one lead `feature-phase-review`**
(dual-executor cross-check). Use it for high-risk changes (core / config-manifest / cross-module).
One orchestrator session per phase — fully event-driven.

```text
per phase N:
  orchestrator dispatches a single-phase build (feature-build, not auto-build) → writes
    awaiting_phase_<N>_build marker → exits Handoff(AWAITING_PHASE_<N>_BUILD)
  external executor builds phase N → commits → hook notifies "run feature-phase-review"
  user runs feature-phase-review for phase N → it writes the Phase N Verdict (PASS/BLOCKED)
  hook notifies → user resumes orchestrator:
    Verdict PASS + a PENDING phase remains → dispatch phase N+1
    every phase Verdict PASS → Task-spawn feature-verify (verify-after-phases entry mode)
    any Verdict BLOCKED → STOP
```

- **Reference scripts:** same dispatch scripts + `git-post-commit`; the per-phase marker schema and
  the `read_phase_verdict()` protocol are in §8. `feature-phase-review` is the dedicated 13th
  subagent (Mode C only).
- **C-Codex / C-Cursor** differ only in which executor does the per-phase build.
- **Extra interactions:** +2N (N = phase count) — one to trigger phase-review, one to resume, per phase.

> **2026-05-16 update:** like Mode B, Mode C's hook now also dispatches `feature-review` on
> `NEEDS_REVIEW` (cross-vendor §16.3 #3 STRICT). The per-phase mechanics (per-phase external build
> + `feature-phase-review` on the lead) remain unchanged. The `READY_FOR_VERIFY` dispatch (§3.4
> state machine, last branch) also applies after the final phase Verdict is PASS — the multi-state
> dispatcher is shared between B-* and C-*.

### 3.6 Mode D — lead + delegation (`D-Codex` / `D-Cursor` / `D-Codex+Cursor`)

Synchronous and hook-free: the lead's `feature-auto-build` worker delegates each implementation
phase to an external CLI inline. No marker, no post-commit hook, no resume — `feature-dev-loop`
runs to completion in one session. The recommended cross-tool entry when the build work must be
performed by Codex and/or Cursor rather than by Claude.

**The real CLI invocation syntax (literal — this is portable):**

```bash
# D-Codex — Codex CLI 0.130+. --prompt-file / --workdir / --timeout are NOT real flags.
#   --cd DIR                   switch working directory
#   --sandbox workspace-write  REQUIRED — Codex non-interactive defaults to read-only; without it
#                              the run "succeeds" but every file write / git commit is silently
#                              dropped by the sandbox
#   -                          read the prompt from stdin
#   --json                     structured JSONL event stream (for quota / error detection)
#   the outer `gtimeout 600` provides the timeout (there is no --timeout flag)
gtimeout 600 codex exec --sandbox workspace-write --cd <repo-root> --json - < <prompt_file>

# D-Cursor — see §3.7 for the full recommended form. NOTE: the installed CLI
#   REJECTS --workdir (use --workspace); needs --force (clears the Workspace
#   Trust gate + auto-approves commands); default model gpt-5.5-high (verified
#   via `cursor-agent --list-models`, NOT `cursor-agent models`)
cursor-agent --print --force --model ${CW_CURSOR_MODEL:-gpt-5.5-high} --output-format json --workspace <repo-root> < <prompt_file>
```

- **Delegation decision (per phase):** every implementation phase is delegated. The Claude worker
  may prepare prompts, review external diffs, run verification commands, update workflow state, and
  commit status/documentation updates, but it must not implement production code, tests, migrations,
  or feature documentation content itself in D modes.
- **`D-Codex+Cursor`** is the external fallback chain: `codex exec` → `cursor-agent` → `BLOCKED`
  (§4.1). It is the most cap-resistant external-only variant.
- **D mounts no hooks** — it does not depend on the B/C post-commit-hook plumbing; a `dev_log`
  `Automation Mode: D-*` makes the hook exit `0` immediately.
- **Status Panel write authority (D variants):** the `feature-auto-build` worker (Claude) is always
  the writer of Phase Progress and `READY_FOR_VERIFY` — **even when Codex / Cursor did the
  implementation**, the on-disk writer is the Claude worker and the trailer is `feature-auto-build`.
- **Extra interactions:** 0.

### 3.7 Cursor specifics (all `*-Cursor` variants)

**Recommended CLI form:**

```bash
LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 \
flock <quota_state_dir>/cursor.lock \
gtimeout 700 \
cursor-agent --print --force --model ${CW_CURSOR_MODEL:-gpt-5.5-high} --output-format json --workspace <repo-root> \
             < <prompt_file>
```

- `--print` is the long form of `-p` — automation scripts pin the long flag (short flags drift).
- `--force` is **required for unattended use**: without `--trust`/`--yolo`/`-f`, headless `--print`
  hits `⚠ Workspace Trust Required` in an untrusted dir and never runs (verified 2026-05-17).
  `--force` also auto-approves commands so the build worker can actually write/test.
- `--workspace <repo-root>` — the installed `cursor-agent` (2026.01.23) **rejects the older
  `--workdir`** (`error: unknown option '--workdir'`).
- `--model gpt-5.5-high` is the default — **self-check with `cursor-agent --list-models`** (NOT
  `cursor-agent models`, which is not a real subcommand); model ids are account-scoped, override
  via `CW_CURSOR_MODEL`.
- `--output-format json` gives one JSON result; the consumer must `try/except` one JSON parse and,
  on failure, scan the last stdout line for exit semantics.
- `flock` serializes `cursor-agent` (a known concurrent-hang issue); `gtimeout 700` guards a hung
  CLI; explicit `LC_ALL` / `LANG` guards CJK / non-UTF-8 output corruption.
- **macOS deps:** `gtimeout` (`brew install coreutils`) and `flock` (`brew install util-linux`)
  are not present by default. **`util-linux` is keg-only — `flock` is NOT symlinked onto PATH**;
  the dispatch scripts probe `/opt/homebrew/opt/util-linux/bin/flock` (and the `/usr/local` Intel
  prefix). Dispatch scripts detect both, WARN if missing, and do not hard-fail.

**The contract the external executor's prompt must hard-code** (so it cannot be relaxed by the
delegated prompt): commit each phase with the trailer naming the *host worker*
(`Co-authored-by: feature-auto-build <workflow-v2@local>`, never `cursor` / `gpt-5.5`); do not touch
`dev_log.md`, the Status Panel, or Phase Progress — the host worker reviews the delegated result and
writes Phase Progress / Work Log afterward; do not spawn other subagents; do not call MCP tools that
mutate external systems; stop after the single phase; on an ambiguous plan report a Blocker and exit
(do not guess); obey the file-size hard ceilings.

**Why IDE wake-up is not in the automated chain:** neither the Cursor IDE nor the Codex desktop app
has a publicly supported "inject a prompt into the active session from an external process" path on
macOS. All `*-Cursor` / `*-Codex` automated relay goes through the **CLI** (`cursor-agent` /
`codex exec`); IDE wake-up is only a developer manual fallback.

---

## 4. Universal degradation rule — the Status Panel must not drift

### 4.1 Quota fallback chain (shared across variants)

When any variant's build-class executor hits its cap, degrade along this chain:

```
Layer 1: the current variant's primary executor — Codex CLI (codex exec) or cursor-agent CLI
   ↓ cap hit / unavailable / permission failure
Layer 2: the other external executor (Codex ↔ Cursor)
         (D-class variants may degrade directly; B/C-class need a human marker first)
   ↓
Layer 3: if an A-Claude run is explicitly selected, the lead Claude worker may self-implement.
For D-Codex / D-Cursor / D-Codex+Cursor, Layer 3 is `BLOCKED` with recorded CLI failure evidence;
the D worker must not silently degrade to Claude implementation.
   ↓
Layer 4: pipeline parks for a human + a Blocker is written to dev_log
```

`D-Codex+Cursor` is this external chain made explicit as a variant: Codex → Cursor → BLOCKED. Quota exhaustion
is detected by the `codex_wrapper.sh` / `cursor_wrapper.sh` reference scripts, which write
`<quota_state_dir>/<executor>-exhausted-until` (see `_portable/scripts/` + §3.7).

Every degradation must append a `dev_log` Work Log entry with `Executor: <new>` + `Action: <fallback reason>`.

### 4.2 The hard rule: a degradation action never flips the Status Panel

This is the single most important constraint of the automation layer. The Status Panel write-authority
matrix (`02-handoff-and-state.md` §2.6) is absolute — a quota fallback, a hook, a quota monitor, an
orchestrator, an external executor: **none of them flip the Status Panel.** They only:

- read the Status Panel to decide whether to proceed
- append Work Log entries (Work Log is append-only and not write-authority-scoped)
- BLOCK and park the pipeline if they cannot proceed

If a fallback would require a Status change, the variant degrades to "park + write a Blocker" and a
**human** takes over the Status transition.

### 4.3 Trailer attribution across fallbacks

When a worker falls through the external fallback chain (Codex → Cursor → BLOCKED),
the commit's Status-Panel trailer (`02-handoff-and-state.md` §4) **always names the host worker**
(`feature-auto-build` or `feature-build`), not the actual executing tool. The trailer does not record
the executing tool — that is traced by a separate non-lint commit-body annotation line (e.g.
`Implemented-by: <tool>/<model>`).

### 4.4 Distinguish two kinds of "Status"

- **dev_log Status Panel field set** — the persisted, lint-checked, write-authority-scoped
  *project-level* state. Its legal value set is fixed; it cannot be extended.
- **Handoff exit state** — a *session-level control-flow marker* that only appears in the
  orchestrator's Handoff `Status` field, telling the user why this session stopped (e.g.
  `AWAITING_EXTERNAL`, `AWAITING_PHASE_N_BUILD`). These values are **never written into the dev_log
  Status Panel.**

Mixing the two is a classic implementation bug — an implementer thinks `AWAITING_EXTERNAL` is a legal
value to write to the dev_log Status row. It is not.

---

## 5. Variant selection decision tree

```text
Task complexity?
├── simple (≤ 1 phase, hotfix) → single-IDE
└── multi-phase
    ├── high risk (touches core/manifest/cross-module) → a C-class variant
    └── low/medium risk
        ├── want a hook to run fully automatically → a B-class variant
        └── want the lead to stay in control + external only implements → a D-class variant
            (pick the fallback chain by which external tools you have / want)
```

**New-team recommendation:** first get the whole meta-orchestrator behavior working with the
single-IDE variant and one D-class variant (the stable ones). The B/C-class variants are experimental
paths to enable only "if the team genuinely needs it + it's been tested + you accept the ops burden".

---

## 6. Hard-constraint alignment with the core workflow

Every variant must obey the core-workflow contracts from `01`/`02`:

| Contract | Source | Every variant must |
|----------|--------|--------------------|
| Status Panel write-authority matrix | `02` §2.6 | hooks / quota-monitors / orchestrators / external executors never directly set Status |
| Status-Panel commit trailer | `02` §4 | hook auto-commits must carry the correct role name |
| State Verification field | `02` §4 | a hook-triggered agent still must emit `### State Verification` |
| Read-only Gate Contract | orchestrator/build agents | a hook must confirm dev_log Status is APPROVED before waking build |
| Output Contract (Handoff block only) | each agent prompt | a hook parsing output only trusts Handoff fields |
| Step 0 front gate | `03` | before entering `feature-plan` there must be a `*-feature-brief.md` or an explicit skip |
| Single-phase boundary | `feature-build` single / `feature-auto-build` multi | hook auto-relay defaults to `feature-auto-build`; C-class variants explicitly use `feature-build` |

---

## 7. The meta-orchestrator 5-phase state machine

The meta-orchestrator (`feature-full-loop` / `bugfix-full-loop`) runs an internal 5-phase state
machine. **Only Phase 4 is variant-specific** — Phase 0/1/2/3/5 behave identically across all variants.
This is the contract a portable implementation must reproduce; the project layer owns the concrete
dispatch scripts and marker directories, not the structure below.

### 7.1 State overview

```text
[*] ──→ INTAKE ──→ STEP_0 ──→ PLAN ──→ REVIEW ──→ BUILD_VERIFY ──→ HUMAN_GATE ──→ [*]
          │           │         │        │  ▲           │
          │           │         │        │  └─ REVISE ──┘ (revise_count++, ≤ MAX_REVISE)
          ▼           ▼         ▼        ▼              ▼
        BLOCKED     BLOCKED   BLOCKED  BLOCKED        BLOCKED ──→ [*]
   (name ambiguity  (brief QA  (plan   (review 3×    (build/verify
    / Mode missing)  Gate fail) BLOCKED) unconverged   BLOCKED 3× /
                                          / BLOCKED)    external no-response)
```

- The `REVISE` edge is the **review loop auto-reflow**: `REVIEW → PLAN → REVIEW` repeats until
  `APPROVED` or `revise_count > MAX_REVISE`.
- `HUMAN_GATE` is a hard stop — the orchestrator never spawns `ship`. Ship is the one mandatory human
  push gate.
- Any `BLOCKED` exit emits a Handoff and parks for human intervention.

### 7.2 Phase pseudocode (portable structure)

```text
Phase 0: INTAKE
  - Parse input:
    - (a) requirement text + Automation Mode → go to Phase 1
    - (b) canonical target name → resume mode: read dev_log, decide current position, jump to that phase
  - Read-only on the Status Panel; never write here.

Phase 1: STEP 0 (need-only)
  - If a <feature_brief> already exists → skip.
  - Else: invoke the <step0-skill> skill; wait for it to exit.
  - Read dev_log / brief; if the QA Gate did not pass → STOP, emit Handoff (Status: BLOCKED).
  - On success → continue.
  (Bugfix pipeline: Phase 1 is NO-OP — bug-diagnose self-normalizes the bug report. The phase number
   is kept so the resume state machine stays uniform.)

Phase 2: PLAN / DIAGNOSE
  - If on-disk Status already indicates plan/diagnose is done → skip (resume mode).
  - Else: Task spawn the entry agent (feature-plan, or bug-diagnose for the bugfix pipeline).
  - Read dev_log; verify the expected post-state.
  - State Verification (the 4 checks — see §7.3).
  - On BLOCKED → STOP.

Phase 3: REVIEW LOOP
  - revise_count = 0; MAX_REVISE = <param, default 3>
  - while True:
      - Task spawn feature-review
      - read dev_log Status
      - APPROVED → break
      - NEEDS_REVIEW (REVISE):
          revise_count++
          if revise_count > MAX_REVISE → STOP (Blocker: review did not converge)
          Task spawn feature-plan (with the REVISE notes from dev_log)
      - BLOCKED → STOP
  (Bugfix pipeline: Phase 3 is NO-OP — no separate review loop; diagnose emits a fix-ready state and
   the downstream goes straight to build.)

Phase 4: BUILD + VERIFY  ── variant-specific; the only phase that branches. Three families:

  ── synchronous path (single-IDE / lead-and-delegate variants) ──
      Task spawn the loop orchestrator (feature-dev-loop / bugfix-loop), synchronous, wait for return.
      The worker reads dev_log Automation Mode and routes the external CLI.
      A-Claude may self-implement; D-* parks BLOCKED if the configured external executors fail.
      After return: Read dev_log.
        Status indicates verify passed (READY_TO_SHIP) → Phase 5.
        BLOCKED → STOP.

  ── event-driven path (hook-relay variants) ──
      ⚠️ The orchestrator does NOT poll. It triggers the external executor, writes a marker, and EXITS.
         A git post-commit hook notifies the user to resume.

      fresh entry (Status: APPROVED / fix-ready):
        Bash-trigger the dispatch script for the external executor.
        Write a `<feature>.awaiting_external` marker (JSON — see §8.1).
        Append a Work Log entry (does NOT write Status).
        Exit with Handoff Status: AWAITING_EXTERNAL.

      resume entry (Status: ready-for-verify):
        Task spawn the verify agent (feature-verify / bug-verify).
        Returns ready-to-ship → Phase 5; BLOCKED → STOP.

  ── event-driven per-phase path (phase-granularity variants — feature pipeline only) ──
      ⚠️ One orchestrator session per phase.

      fresh entry / resume — branch on the dev_log Phase Progress state:
        a. there is a PENDING phase N → dispatch a single-phase build for N, write
           `<feature>.awaiting_phase_<N>_build` marker, exit Handoff(AWAITING_PHASE_<N>_BUILD).
        b. Phase N Status: DONE but its Verdict is empty → phase-review has not run; exit
           Handoff(AWAITING_PHASE_<N>_REVIEW), tell the user to run feature-phase-review.
        c. Phase N Verdict: PASS and a PENDING phase N+1 exists → dispatch phase N+1 build, exit
           Handoff(AWAITING_PHASE_<N+1>_BUILD).
        d. every phase Verdict: PASS (last phase too) → Task spawn the verify agent (note: dev_log
           Status is still APPROVED here; the verify agent must support the verify-after-phases entry
           mode). Returns ready-to-ship → Phase 5; BLOCKED → STOP.
        e. any Phase N Verdict: BLOCKED → STOP with Blockers from that phase's Verdict block.

Phase 5: HUMAN GATE
  - STOP (do NOT spawn ship).
  - Emit the final Handoff:
      Status: READY_TO_SHIP
      Next Step: Start the ship agent for <feature>.
```

### 7.3 Resume mode — the three-layer priority

When the orchestrator is started with only a canonical target name (resume mode), Phase 0 decides the
current position by a fixed three-layer priority. **Do not branch on the dev_log `Status:` field
alone** — the event-driven exit states (`AWAITING_*`) are never written there.

1. **Marker file first.** `ls <orchestrator_marker_dir>/<feature>.awaiting_*` — the marker is the
   resume source of truth for event-driven variants:
   - `awaiting_external` → a hook-relay dispatch is outstanding.
   - `awaiting_phase_<N>_build` / `awaiting_phase_<N>_review` → a phase-granularity dispatch is
     outstanding.
2. **Marker-typed branch.** Given a marker, cross-check the dev_log Status / Phase Progress to decide
   whether the external work finished:
   - hook-relay: marker present + Status still pre-verify → external not done → exit `STILL_AWAITING_*`.
     Status flipped to ready-for-verify → external done → clean the marker, spawn the verify agent.
   - phase-granularity: combine the marker type with `read_phase_verdict()` (see §8.2) to decide
     dispatch-next-phase / spawn-phase-review / spawn-verify / STOP.
3. **No marker → plain Status branch.** Branch on the dev_log Status Panel's legal values only
   (the persisted state machine — `PLAN_DRAFT` → `NEEDS_REVIEW` → `APPROVED` → `READY_FOR_VERIFY` →
   `READY_TO_SHIP` → `SHIPPED`, plus `BLOCKED`). Also compare `<feature_brief>` mtime vs `dev_log.md`
   mtime — if the brief is newer than the dev_log, STOP with a Blocker ("brief modified after plan;
   need force-replan").

### 7.4 State Verification obligation (after every child spawn)

The meta-orchestrator is a parent session; after every child spawn it must run the 4 State
Verification checks (`02-handoff-and-state.md` §4):

1. **Existence** — the child's Handoff must include a `### State Verification` field; if missing, the
   orchestrator reads dev_log itself as a fallback and records the gap in the Work Log.
2. **Freshness** — the child's `Verified at:` timestamp more than ~5 minutes stale → re-read dev_log.
3. **Consistency** — child Handoff Status == child State Verification Status == on-disk Status Panel;
   any mismatch → STOP with a Blocker (do not pick a side, do not self-correct the Status Panel).
4. **No trust in prose** — only Handoff fields and dev_log are authoritative; ignore narration.

### 7.5 Max-retry configuration

| Loop | Default cap | On exceed |
|------|-------------|-----------|
| Phase 3 REVISE loop | 3 | STOP; Blocker = "plan/review did not converge; need a Step 0 requirement rewrite" |
| Phase 4 build loop (synchronous variants) | 3 (inherited from the loop orchestrator) | STOP; Blocker = "build BLOCKED 3 times" |
| Phase 4 per-phase BLOCKED retry (phase-granularity) | 3 per phase | same |

The event-driven model has **no polling timeout** — there is no polling. A long-unresponsive external
executor is noticed by the human (the git post-commit hook simply does not fire). All caps should be
overridable via a prompt parameter.

---

## 8. The marker-file contract and the Phase Verdict reader protocol

Event-driven variants relay through two cross-process artifacts: **marker files** (orchestrator writes,
hook reads) and the **Phase Verdict** record (phase-review writes, every reader reads). Because these
are written by one piece of code and read by another, their formats are locked contracts. The portable
layer owns the *schema*; the project layer owns the bash that produces / consumes it.

### 8.1 Marker file JSON schema (v1)

A marker file lives at `<orchestrator_marker_dir>/<feature>.<marker_type>` and contains a single JSON
object. All fields are required.

| Field | Type | Constraint |
|-------|------|------------|
| `schema_version` | int | currently fixed `1` |
| `feature` | string | canonical feature/target name; ASCII kebab-case |
| `automation_mode` | string (enum) | one of the event-driven variant identifiers |
| `marker_type` | string (pattern) | `^(awaiting_external\|awaiting_phase_[0-9]+_build\|awaiting_phase_[0-9]+_review)$` |
| `phase` | int / null | a positive integer for phase-granularity variants; `null` for hook-relay variants |
| `dispatched_at` | int | UNIX epoch seconds — used for timeout calculation and dedup |
| `dispatch_script` | string | **repo-root-relative** path (not absolute — keeps it portable across dev machines) |
| `prompt_file` | string | absolute path of the prompt file dispatched to the external executor |
| `expected_next_status` | string | natural-language description of the event being waited on (a hook hint, not a strict enum) |
| `max_wait_seconds` | int | recommended `1800`; a timeout notifies the user, it does not unblock the orchestrator |

Contract notes:

- **File name vs `marker_type` field.** The file name suffix (e.g. `.awaiting_phase_2_build`) and the
  JSON `marker_type` field must be byte-identical — both carry the concrete phase number, not a
  `<N>` placeholder. The orchestrator finds its marker with a glob (`<feature>.awaiting_*`), so only
  one marker per feature may exist at a time. When advancing a phase-granularity run, the orchestrator
  **deletes the old marker before writing the new one** — two coexisting `awaiting_*` files make
  `ls | head -1` non-deterministic.
- **`phase` redundancy.** The `phase` field duplicates the number embedded in `marker_type`; it exists
  purely so a `jq` consumer does not have to regex the type string.
- **Cleanup.** On a successful resume the orchestrator removes `<feature>.awaiting_*`.

### 8.2 `read_phase_verdict(feature, N)` — the four-state reader protocol

A phase's Verdict can land in **either of two places** depending on the dev_log table schema:

1. the **Phase Progress table `Verdict` column** (present only if the plan agent initialized the table
   with the recommended schema), or
2. the **`### Phase <N> Verdict` subblock** (the primary write — `feature-phase-review` always appends
   this subblock, regardless of table schema).

Every reader — the orchestrator's INTAKE, the git post-commit hook, the verify agent's
verify-after-phases entry check, the Handoff State Verification field — **must** resolve a phase's
verdict through one shared protocol, not by ad-hoc grepping. The protocol reads **both** sources and
returns one of **four states**:

```pseudo
function read_phase_verdict(feature, N) -> PASS | BLOCKED | NONE | ERROR:
  table_v    = the Verdict cell for row N in the first Phase Progress table,
               if that table has a Verdict column; else NONE
  subblock_v = the verdict in the latest "### Phase <N> Verdict — PASS|BLOCKED" anchor; else NONE

  if table_v != NONE and subblock_v != NONE:
    if table_v != subblock_v: return ERROR   # the two sources disagree → dev_log hand-edited / corrupt
    return table_v                            # both agree
  if table_v    != NONE: return table_v       # single source has a value
  if subblock_v != NONE: return subblock_v
  return NONE                                 # phase-review has not run / not written
```

Four-state semantics:

- `PASS` / `BLOCKED` — a definitive verdict (either source alone has it, or both agree).
- `NONE` — phase-review has not run or has not written back yet. A reader treating this as anything
  but "not reviewed" is a bug.
- `ERROR` — the table column and the subblock both have a value and they **disagree**. This means the
  dev_log was hand-edited or corrupted. A reader **must not silently pick one** — surface it so the
  divergence is resolved by a human.

**Why dual-source.** The subblock is the mandatory primary write; the table column is an optional
secondary write. Implementing the reader as "table column only" breaks every reader the moment a plan
agent uses a table without a Verdict column. Reading both, with the conflict → `ERROR` rule, keeps all
readers consistent with each other.

### 8.3 Where the contract is enforced

A portable implementation should make the four reader call-sites depend on **one** shared
implementation (e.g. a sourced shell library), not re-derive the logic four times:

| Call site | Why it reads a verdict |
|-----------|------------------------|
| orchestrator INTAKE (phase-granularity resume) | decide dispatch-next-phase / spawn-review / spawn-verify |
| git post-commit hook | route the post-build / post-review notification |
| verify agent — verify-after-phases entry check | confirm every phase is `PASS` before allowing verify |
| Handoff `### State Verification` field | report the on-disk verdict the agent acted on |

---

## 9. The Phase Verdict block format and the standardized write-back protocol

In phase-granularity variants, `feature-phase-review` is the only writer of a phase's verdict. dev_log
Phase Progress tables are **not uniform** across a repo (some have a `Verdict` column, some do not;
column widths and anchors vary), so the write-back protocol is **"primary write = subblock, table
update = optional secondary"** — this avoids an LLM corrupting the markdown table while editing it.

### 9.1 Primary write — the `### Phase <N> Verdict` subblock (mandatory)

`feature-phase-review` **always** appends this subblock to the end of the dev_log file, so the
`### Phase <N> Verdict` line is a globally unique anchor:

```markdown
### Phase <N> Verdict — <PASS | BLOCKED>
- Executor: feature-phase-review (<reviewer tool / model>)
- Verified at: <YYYY-MM-DD HH:MM>
- Module Type: <feature | shared>
- Gates Applied: <gate count>
- Commits Reviewed: <first>..<last>
- Findings:
  - (none if PASS, else list B-1, B-2, ...)
- Next: <orchestrator resume (if PASS) | build-agent phase <N> fix (if BLOCKED)>
```

It is appended via a shell heredoc (`cat >> ... <<'EOF'`), **not** via an Edit/Write into the middle
of the file — appending side-steps the table-corruption risk entirely.

### 9.2 Secondary write — the Phase Progress table Verdict column (conditional)

Only if the first `## Phase Progress` table already has a `Verdict` column in its header row:

- **has a Verdict column** → locate the `| <N> | ... | <empty> |` row and set the empty Verdict cell to
  `PASS` / `BLOCKED`.
- **no Verdict column** → **do not touch the table**; keep only the subblock, and note in the subblock
  that the table lacks a Verdict column.

This is why `read_phase_verdict()` (§8.2) reads both sources — the table column is best-effort, the
subblock is guaranteed.

### 9.3 Recommended Phase Progress table schema

The plan agent is *recommended* (not required) to initialize the table with this schema so the
secondary write is always available:

```markdown
## Phase Progress

| Phase | Description  | Status               | Verdict             | Commits        |
|-------|--------------|----------------------|---------------------|----------------|
| 1     | <desc>       | PENDING / DONE       | — / PASS / BLOCKED  | <first>..<last>|
| 2     | <desc>       | PENDING              | —                   | —              |
```

Existing dev_log tables with non-uniform formats are historical debt; `feature-phase-review` does not
force a retrofit.

### 9.4 Write-authority boundary

`feature-phase-review` is a **Phase Progress writer, not a Status Panel writer**. It writes the
Verdict subblock and (conditionally) the Verdict column, and it may append a Work Log entry — but it
**never** touches `Status:` or `Suggested Next:`. It is therefore not in the Status Panel
write-authority matrix (`02-handoff-and-state.md` §2.6). If a phase review surfaces a finding that
*should* flip the Status Panel (e.g. a critical defect that should send the plan back), phase-review
lists it in its Handoff Findings and leaves the decision to the orchestrator on resume.

---

## 10. Portable / project split line for the automation layer

The automation layer is a **complete tri-tool implementation** — Claude Code + Codex + Cursor — and
it lives entirely in the portable layer. `04` (this file) carries the variant matrix, the named
8-variant enum, the per-variant contracts, the real CLI invocation syntax, the degradation rule, the
5-phase state machine, the marker-file schema, the reader protocol, and the Phase Verdict format.
`_portable/scripts/` carries the actual reference shell scripts. `_portable/templates/` carries the
placeholder-form meta-orchestrator prompts.

**Codex and Cursor, the variant names, the CLI flags, the quota-signal heuristics, and the dispatch
/ hook / wrapper scripts are all portable** — they are the paradigm, not a project instance. Only a
short, genuinely project-specific residue stays in the project automation doc:

- **The concrete values of the scratch-path placeholders** — what `<orchestrator_marker_dir>` /
  `<quota_state_dir>` / `<cowork_scripts_dir>` actually resolve to in the project.
- **Install / wiring specifics** — the exact `.git/hooks/post-commit` chained-wrapper install (back
  up + run any prior hook, then `source lib_hook_helpers.sh` and exec `git-post-commit`; not a
  symlink), the project's
  `.codex/config.toml` contents, any launchd / cron registration for quota monitors.
- **A fully-instantiated, annotated copy of the meta-orchestrator prompts** (optional) — the
  placeholder-form prompts are in `_portable/templates/`; a project may keep an instantiated copy
  with project-specific commentary.
- **Project incident history and round-by-round acceptance logs** — the "why this rule exists"
  war stories stay in the project doc; `04` keeps only the distilled, currently-effective rule.

Rule of thumb (same as `docs/workflow/README.md`): *if a sentence would need to change in another
project, it is project-specific.* For the automation layer that residue is small — a new project
copies `_portable/04` + `_portable/scripts/` + `_portable/templates/` and has a working tri-tool
automation loop after filling in the scratch-path values and wiring the hook.

---

# Appendix — the `<skill_prefix>feature-full-loop` SKILL.md draft

> At landing time, render this into `<skill_root>/<skill_prefix>feature-full-loop/SKILL.md` and
> replace the project placeholders from `00-PORTABLE-MANIFEST.md` §3. The project copy is a rendered
> artifact; edit this appendix first when changing the cross-project runtime contract.

````markdown
---
name: <skill_prefix>feature-full-loop
description: Parent-session feature orchestration recipe for running the full Workflow V2 feature pipeline without nested meta-orchestrator spawn. Use when user asks feature full loop, run a feature end to end, parent-session feature orchestration, single feature automation, or avoid feature-full-loop subagent Task limits.
---

# <skill_prefix>feature-full-loop

Parent-session runtime entry for one feature's Workflow V2 pipeline.

Use this skill instead of spawning the `feature-full-loop` subagent when the host tool withholds
recursive `Task` / agent-spawn from spawned subagents. The old `feature-full-loop` agent remains a
portable contract / compatibility wrapper; this skill is the recommended executable path.

## Read First

- `<project_workflow_doc>`
- `docs/workflow/_portable/04-automation-loop.md`
- `docs/workflow/_portable/07-automation-mode-picker.md`

## Hard Constraints

1. **Run in the parent session.** Do not spawn `feature-full-loop` or `feature-dev-loop` as a nested
   meta-orchestrator on Claude Code. Dispatch the real worker subagents directly from the caller
   context.
2. **Never run `ship`.** Stop at `READY_TO_SHIP` and return a copy-pasteable `ship` next step.
3. **Never write the Status Panel directly.** Only authorized worker subagents may flip
   `dev_log.md` `Status:` / `Suggested Next:`. This skill may read `dev_log` and may report
   Handoff-style summaries.
4. **Verify Cross-vendor is authoritative.**
   - `Verify Cross-vendor: yes` → use `feature-auto-build`, then dispatch `feature-verify`
     independently.
   - `Verify Cross-vendor: no` → `feature-dev-loop` is allowed only on hosts where it can actually
     spawn; otherwise use `feature-auto-build` + `feature-verify` anyway.
5. **Between every worker, read `<feature_root>/<feature>/docs/dev_log.md`.** Do not trust a child
   Handoff without verifying the real Status Panel.
6. **Background/worktree safe.** This skill may be launched by `<skill_prefix>roadmap-loop
   dispatch: bg` inside a Claude Code background session and its isolated worktree. In that case,
   keep all reads/writes in the current checkout, do not clean up the background session/worktree,
   and preserve any `Roadmap Manifest:`, `Background Session:`, or `Worktree:` fields passed in the
   prompt so the final Next Step can hand `ship` the right worktree context.

## Inputs

Fresh start:

```text
/<skill_prefix>feature-full-loop
Requirement: <freeform requirement or roadmap source excerpt>
Automation Mode: <A-Claude | B-Codex | B-Cursor | C-Codex | C-Cursor | D-Codex | D-Cursor | D-Codex+Cursor>
Verify Cross-vendor: <yes|no>  # default yes when omitted and no picker is available
```

Resume:

```text
/<skill_prefix>feature-full-loop
Feature: <canonical-feature-slug>
Roadmap Manifest: <optional manifest path>
Background Session: <optional bg session id/name>
Worktree: <optional absolute worktree path>
```

## Runtime Recipe

1. **Intake.** If no `Feature:` is given, require a non-empty `Requirement:`. Resolve
   `Automation Mode:` using `_portable/07-automation-mode-picker.md`; default
   `Verify Cross-vendor` to `yes` if the host cannot ask.
2. **Step 0.** If no reviewed feature brief exists, run `<step0-skill>`; otherwise reuse the
   existing brief or roadmap seed/source.
3. **Plan.** Dispatch `feature-plan` with the brief/requirement plus resolved Automation Mode and
   Verify Cross-vendor. Continue only when `dev_log` says `Status: NEEDS_REVIEW`.
4. **Review loop.** Dispatch `feature-review`. If it returns REVISE, dispatch `feature-plan` again
   with the review notes. Stop as BLOCKED after `Max Revise` attempts (default 3). Continue only
   when `dev_log` says `Status: APPROVED`.
5. **Build.**
   - If `Verify Cross-vendor: yes`: dispatch `feature-auto-build`; continue only when `dev_log`
     says `Status: READY_FOR_VERIFY`.
   - If `Verify Cross-vendor: no` and the host supports the loop worker: dispatch
     `feature-dev-loop`; continue only when `dev_log` says `READY_TO_SHIP` or stop on `BLOCKED`.
   - If the loop worker is unavailable or blocked by Task recursion, fall back to
     `feature-auto-build`.
6. **Verify.** If `dev_log` is `READY_FOR_VERIFY`, dispatch `feature-verify` independently. Continue
   only when `dev_log` says `READY_TO_SHIP`; stop on `BLOCKED`.
7. **Human ship gate.** Stop. Output the current Status Panel and the literal next command:
   `Start the ship agent for <feature>.` If `Background Session:` or `Worktree:` was provided,
   include those lines under the ship command. If only `Roadmap Manifest:` was provided, include it
   as context for the human and roadmap-loop reconcile.

## Output

End with a compact Handoff-style block containing:

- Feature / slug
- Current `dev_log` Status Panel values actually read from disk
- Workers dispatched
- Blockers, if any
- Next Step

Do not append a conversational "continue?" prompt after the Next Step.
````
