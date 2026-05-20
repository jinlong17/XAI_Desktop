# 02 — Handoff Contract & State Protocol (Portable)

> **Portable layer.** Project-agnostic. Defines the run-mode state machine, the
> `dev_log.md` state-write contract, the `## Handoff` block schema, and the
> `### State Verification` anti-echo-chamber contract.
> Source: extracted from the original `COMMON_SUBAGENT_WORKFLOW_TEMPLATE.md` (§9-10, §13.5)
> and `SUBAGENT_WORKFLOW_V2.md` appendix A.
> Companion: `01-workflow-model.md` (pipeline structure). Placeholders: see `00-PORTABLE-MANIFEST.md`.

---

## 1. Run-mode state machine

Every subagent, on startup, resolves the target, reads shared docs, then decides one run mode:

- `Fresh` — no prior artifacts, start from scratch
- `Continue` — prior artifacts exist but are incomplete, resume from the breakpoint
- `Review` — a draft exists, it is this round's turn to review
- `Revise` — review bounced it back, the planner/builder must revise
- `Wait` — another subagent should continue; this one must not re-enter
- `Block` — a precondition is not met, cannot continue
- `Done` — this step is already complete, move to the next step

This decision is made by **reading `dev_log.md`**, never from chat memory.

---

## 2. State-write contract

### 2.1 Current Status template

Every write should include at least:

```markdown
## Current Status
- Workflow: FEATURE_DEV / BUGFIX
- Phase: FEATURE_PLAN / FEATURE_REVIEW / FEATURE_BUILD / FEATURE_VERIFY / BUG_DIAGNOSE / BUG_FIX / BUG_VERIFY / SHIP
- Status: NOT_STARTED / IN_PROGRESS / NEEDS_REVIEW / APPROVED / BLOCKED / READY_FOR_VERIFY / FIX_READY / FIX_READY_FOR_VERIFY / READY_TO_SHIP / SHIPPED
- Target: <canonical feature/module name>
- Title: <feature title / bug title>
- Current Step: <current action>
- Executor: <current tool / model identifier>
- Updated: <YYYY-MM-DD HH:MM>
- Suggested Next: <next_subagent>
```

### 2.2 Work Log template

```markdown
## Work Log

### [YYYY-MM-DD HH:MM] <Action>
- Executor:
- Action:
- Commits:
- Next:
```

Must be **append-only** — never overwrite history.

### 2.3 Feature state flow

```text
NOT_STARTED -> IN_PROGRESS -> NEEDS_REVIEW -> APPROVED
-> IN_PROGRESS (feature-build) -> READY_FOR_VERIFY -> READY_TO_SHIP -> SHIPPED
```

Returns:

- `feature-review` -> `REVISE` -> back to `feature-plan`
- `feature-build` -> `BLOCKED` -> fix, then continue `feature-build`
- `feature-verify` -> `BLOCKED` -> back to `feature-build`

### 2.4 Bugfix state flow

```text
NOT_STARTED -> IN_PROGRESS -> FIX_READY
-> IN_PROGRESS (bug-fix) -> FIX_READY_FOR_VERIFY -> READY_TO_SHIP -> SHIPPED
```

Return: `bug-verify` -> `BLOCKED` -> back to `bug-fix`.

### 2.5 Fields every write must maintain

On every create/update of `dev_log.md`, all subagents must maintain: `Workflow`, `Executor`, `Updated`, `Suggested Next`, `Work Log`.

Extra constraints:

- `feature-plan` writes `Workflow = FEATURE_DEV` on init
- `bug-diagnose` writes `Workflow = BUGFIX` on init
- All other subagents must preserve the existing `Workflow`
- `ship` must read `Workflow` to decide how to organize commits

### 2.6 Status Panel write-authority matrix

Status Panel writes are **role-scoped** — only one role may flip each value. This is the anti-echo-chamber backbone:

| Status / field flip | Sole writer |
|---|---|
| `NEEDS_REVIEW` (init / revise) | `feature-plan` |
| `APPROVED` | `feature-review` |
| `READY_FOR_VERIFY` | `feature-build` / `feature-auto-build` |
| `READY_TO_SHIP` | `feature-verify` |
| `SHIPPED` | `ship` |
| `BLOCKED` | the agent owning the current phase (must attach a Blockers list) |
| `FIX_READY` | `bug-diagnose` |
| `FIX_READY_FOR_VERIFY` | `bug-fix` / `bug-auto-fix` |

**Read-only gates never write Status:** orchestrator/loop agents and any hook scripts only *read* the Status Panel — they BLOCK on a non-expected status, they never write it. A reviewer writes the review verdict; a verify agent writes the verify verdict; the main session is read-only on the Status Panel.

---

## 3. The `## Handoff` block

Every subagent response must **end with a `## Handoff` block**, used for copy-paste between tools.

Required fields, **in this exact terminal order** (§3.3 fixes the ordering as part of the Universal
Next Step Contract):

- **Feature** — canonical name
- **Completed** — subagent + what it did
- **Summary** — 1-2 sentences
- **Status** — dev_log status
- **Commits** — hash + message (when there are commits)
- **Files Changed** — count + key files (when there are changes; a reviewer writing back the Status Panel must explicitly list `dev_log.md (Status Panel flipped to <value>)`)
- **Blockers** — concrete failing items (when BLOCKED)
- **State Verification** — the subagent's hard evidence that it read the state file (see §4)
- **Next Step** — a copy-paste-ready subagent command + one line of explanation; immediately
  followed by the `### Next Step Options` A/B/C block when multiple downstream paths exist. This is
  the **last thing in the Handoff** — nothing comes after it. Mandatory and absolute — see §3.3, the
  Universal Next Step Contract.

When there are multiple downstream paths (manual vs batch vs loop), output **all three Options A / B / C verbatim** — do not merge, omit, or rename:

- **A) Manual mode**: `feature-build` / `bug-fix` (one phase / single step, needs human confirmation)
- **B) Batch mode**: `feature-auto-build` / `bug-auto-fix` (all phases / sub-fixes continuously, stop before verify)
- **C) Loop mode**: `feature-dev-loop` / `bugfix-loop` (auto-build/auto-fix + verify, fully automatic loop)

Even if a path seems unsuitable for the current case, do not omit it from the Handoff; you may only add a one-line suggestion in an optional `## Context` section *outside* the Handoff. This rule must be written explicitly into each subagent template's Output Contract, or the LLM will "self-trim" to two options in a long context.

**Next Step format:** use a natural-language instruction, e.g. `Start the feature-build agent for billing.`, so it works as a prompt in any tool.

### 3.1 Template-authoring constraints (must follow when writing subagent prompts)

| Rule | Reason |
|------|--------|
| The Handoff template must NOT be wrapped in a ``` code block | The LLM treats code-block content as an "example" and skips it instead of actually emitting it |
| Placeholders use `(fill in ...)` format | `<...>` looks like an XML tag; `(fill in ...)` more clearly says "you must replace this" |
| Write the CRITICAL instruction "not a code example, but real rendered markdown" | Prevents the LLM treating the Handoff as a reference rather than mandatory output |
| The template's last line must be a REMINDER | In a long prompt, an end-of-prompt reminder is the most likely to be followed |
| No free-form question at the end | e.g. "Should I start feature-build?" replaces the Handoff block |
| Next Step Options must output all three (A/B/C) verbatim — no merge/omit/rename | In a long context the LLM "self-simplifies" to two; the Output Contract must nail this down |
| Never demonstrate a data structure in the prompt body in "verbatim external-output form" | See §3.2 below |
| Forbidden trailing-prose lists must enumerate down to skill / slash-command granularity | Just forbidding "want me to continue?"-style questions is not enough — the agent treats `/schedule`, `/init`, skill proposals as "a different kind of behavior" and routes around the ban |

### 3.2 Engineering iron law: concrete templates override abstract rules

**An LLM is not a compiler** — it does not infer output from abstract rules, it imitates the **nearest concrete pattern**. Therefore:

> If a prompt body contains, in the same file, (a) an abstract rule requiring X, and (b) a concrete template demonstrating ¬X, the agent will almost certainly emit ¬X.

**Iron law (must follow when writing new prompt bodies):**

1. When demonstrating a data structure in a prompt body (dev_log field values, state-machine transition tables, config examples), **never use the verbatim form of the external output format**. If you must write an example, explicitly label it "this is an internal data structure, NOT the format you emit", or use a clearly different context (e.g. an `// internal:` prefix, pseudocode instead of real markdown).
2. If a prompt must demonstrate both (a) a single-valued field write and (b) a multi-option UI render, explicitly distinguish the two contexts and add a "do NOT confuse this with X" anti-pattern callout next to the easily-confused template.
3. The COMPLIANT RESPONSE example at the top of the Output Contract **must match the Required Output template's complexity 1:1** — do not demonstrate only the simplest form to "save effort". A simplified template gets treated as canonical.
4. Every prohibition (`Do NOT ...`) must **enumerate down to concrete granularity**. "Do NOT offer to start the next agent" is not enough — the agent treats slash commands and skill proposals as "not an agent, so not covered". When writing a new prohibition, enumerate these five categories one by one: workflow agent / skill / slash command / follow-up scheduling proposal / self-reflection / inviting the user to continue the conversation.

**Audit tip:** before adding new content to a subagent prompt, self-check the whole file with `grep -E "\(or .* / .*\)|\bor .* / "` to confirm you haven't introduced a new "concrete-template-overrides-abstract-rule" risk point.

### 3.3 The Universal Next Step Contract

The single rule that makes the whole paradigm copy-paste-driven, stated once, in absolute terms:

> **Every agent and every orchestration skill — without exception — must terminate its output with a
> Next Step block: a directly copy-pasteable instruction that drives the following step.** An agent or
> skill that exits without one is non-conformant.

This is not merely "a field that usually appears in the Handoff" — it is the load-bearing contract.
The entire cross-tool relay model (`04` §2.3 — relay goes through documents, not conversation
context) rests on the developer always being able to take the **last block** of any agent's output
and run it as-is in the next session or the next tool. If even one agent can exit without a Next
Step, the relay chain has a hole and the developer is back to reconstructing state from memory.

**Terminal ordering (canonical).** The Next Step section must be the **last** thing in the output.
For a `## Handoff` block the field order is fixed: Feature → Completed → Summary → Status → Commits →
Files Changed → Blockers → State Verification → **Next Step** (immediately followed by
`### Next Step Options` when multiple downstream paths exist — the Options are part of the Next Step
section). Nothing — no Blockers, no State Verification, no prose, no follow-up question — may appear
after the Next Step section. "Take the last block and run it" only holds if the Next Step is
genuinely last. An orchestration skill has no `## Handoff` block, but the same rule applies: its
final emitted content is the Next Step.

**Scope — the contract binds all of:**

- **The 12 worker subagents and the 3 meta-orchestrators.** Their Next Step lives inside the
  `## Handoff` block (§3); where multiple downstream paths exist, all three Options A / B / C appear
  verbatim (§3.1).
- **Orchestration skills** (e.g. the Layer 3.5 roadmap-loop skill — see `06-roadmap-orchestration.md`).
  A skill does not emit a `## Handoff` block, but it still must end every exit — success, partial, or
  blocked — with an explicit Next Step: the literal next command the developer runs, or, when the
  next move is a human action (a batch `ship`, a manual unblock), the spelled-out instruction for it.
- **BLOCKED exits.** "Blocked" is never an excuse to drop the Next Step — a BLOCKED Handoff's Next
  Step is the recovery instruction: which agent to re-run, what to fix first.

**Conformance check (mechanical, project-level):** a lint may assert that every `templates/*.md` and
every generated agent config contains a `Next Step` token, and that an orchestration skill's
`SKILL.md` describes a Next Step on each of its exit paths. See the project layer for the concrete
lint wiring.

The §3.1 template-authoring rules — "the template's last line must be a REMINDER", "no free-form
question at the end", "Next Step Options output all three A/B/C verbatim" — are the *enforcement
mechanics* of this contract at the prompt-authoring level. §3.3 is the contract those rules serve.

---

## 4. The `### State Verification` field (hard anti-echo-chamber contract)

Every subagent, before exiting, must `Read` the state file it claims to update or depend on (typically `dev_log.md`), and paste the real on-disk Status Panel values into this field. This is the subagent's hard proof that it "did not just verbally report — it actually read the disk".

**Field position:** inside the Handoff block, after `Blockers`, before `Next Step`.

**Field format** (bare markdown, not wrapped in a code block):

```
### State Verification
- File: <feature_root>/<name>/docs/dev_log.md
- Status Panel (verified on-disk): Status: APPROVED, Suggested Next: feature-auto-build
- Verified at: <ISO-8601 timestamp or commit SHA>
- Consistency check: Handoff Status field == on-disk Status Panel ✅
```

**Consistency constraint:** if the Handoff `Status` field disagrees with the on-disk `dev_log` value, the subagent **must not exit** — it must first write `dev_log` to a consistent state (only reviewer-class agents have this authority; other subagents should raise BLOCKED so the main session routes back to a reviewer).

**Machine-gate constraint (optional, project-level):** projects can enforce that any commit modifying the Status Panel's `Status:` or `Suggested Next:` line must carry a precise, case-sensitive trailer (e.g. `Co-authored-by: <status-writing-role> <workflow-v2@local>`), checked by a lint script + CI. `<status-writing-role>` must come from the §2.6 write-authority matrix. This is project infrastructure — see the project layer for the concrete lint/CI wiring.

**The main session's matching obligation:** on receiving a subagent's Handoff:

1. Check whether the `State Verification` field exists → if not, the main session must `Read` `dev_log` itself as a fallback
2. If `Verified at` is more than 5 minutes before the current session time, re-Read to recheck
3. If fresh and consistent, display the entire Handoff **verbatim** (do not delete the State Verification field)

**Why this field exists:** the failure mode without it is that the main session reads only the subagent's Handoff text and relays the conclusion to the user — so when a reviewer writes `Status: APPROVED` in the Handoff but never actually wrote it back to `dev_log`, the main session also mis-reports "all APPROVED". Making "read-the-disk evidence" a required Handoff field promotes the implicit rule to the schema layer — the LLM cannot skip it.

### 4.1 Complete Handoff example (with the field)

```
## Handoff
**Feature**: foo
**Completed**: feature-review (round 3)
**Summary**: All 5 focus questions resolved; Path B alignment verified.
**Status**: APPROVED

### Files Changed
- <feature_root>/foo/docs/dev_log.md (Status Panel flipped to APPROVED)
- <feature_root>/foo/docs/design.md (round-3 corrections)

**Blockers**: None.

### State Verification
- File: <feature_root>/foo/docs/dev_log.md
- Status Panel (verified on-disk): Status: APPROVED, Suggested Next: feature-auto-build
- Verified at: 2026-05-01T14:23:11Z
- Consistency check: Handoff Status field == on-disk Status Panel ✅

### Next Step
> Start the feature-auto-build agent for foo.

### Next Step Options
- A) `feature-build` — manual, one phase at a time
- B) `feature-auto-build` — batch implement, stop before verify
- C) `feature-dev-loop` — auto-build + verify, fully automatic
```

---

## 5. `dev_log.md` document protocol

A reference `dev_log.md` skeleton (the top status panel is overwrite-updated; the bottom Work Log is append-only):

```markdown
# Dev Log — <Feature Name>

## Current Status
- Workflow / Phase / Status / Target / Title / Current Step / Executor / Updated / Suggested Next

## Discovery Review
- (link or snapshot)

## Phase Plan
- Phase 1 ...
- Phase 2 ...

## Phase Progress
| Phase | Description | Status | Commits |
|-------|-------------|--------|---------|
| 1     | ...         | DONE   | abc123  |

## Work Log
### [YYYY-MM-DD HH:MM] <Action>
- Executor: / Action: / Commits: / Next:
```

The dual-layer structure is the key: a stable **top status panel** (overwrite-updated, role-scoped writes per §2.6) and an append-only **Work Log** at the bottom. Together they make handoff possible without chat context: design rationale is traceable, current state is traceable, change granularity is traceable, the next-step entry point is explicit.
