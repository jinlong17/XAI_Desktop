---
name: agent-behavioral-guidelines
description: Apply micro-level behavioral discipline when making a small fix, surgical edit, or quick change — prioritizes simplicity, don't over-engineer, verify each step, and goal-driven execution. Suitable for any agent tackling a tiny change, minor refactor, or single-line edit without escalating to full plan-first workflow. Triggers — small fix · surgical edit · don't over-engineer · quick edit · verify each step.
---

# agent-behavioral-guidelines

**Purpose.** Apply four micro-level rules whenever an agent is asked to make a small fix, surgical
edit, or quick change. These rules govern *how* the agent behaves during execution — they are not a
planning framework. For tasks that need a planning framework, escalate to `superpowers` (or the
V2 `feature-plan` pipeline).

## Triggers

- "small fix"
- "surgical edit"
- "don't over-engineer"
- "quick edit"
- "verify each step"

## The 4 micro-rules

### 1. Think Before Coding

Surface assumptions and multiple interpretations before writing a single line. If the request is
ambiguous, ask — never silently pick one reading. A 30-second clarification avoids a 30-minute
revert.

### 2. Simplicity First

Write the minimum code that solves the problem. No speculative abstractions, no "while I'm in
here" refactors, no future-proofing for requirements that don't exist yet. The right solution is
usually the simplest one that passes the test.

### 3. Surgical Changes

Touch only what is needed to satisfy the request. Do not refactor adjacent code; do not clean up
issues you did not create (unless explicitly asked). Scope creep in small fixes is the leading
cause of regression.

### 4. Goal-Driven Execution

Define the success criterion before starting. After each change, verify the criterion is met.
If it is not, loop — don't declare done and hand off. The exit condition is verified success, not
"it looks right".

## Relationship to V2 workflow

These micro-rules operate *below* the V2 pipeline threshold. Escalate to `feature-plan` (and the
full V2 pipeline) when:

- The change touches **multiple files** with architectural consequence.
- The fix requires a new ADR or documents a significant design decision.
- The change has **breaking-change risk** for callers outside the immediate file.
- The task requires a **`dev_log.md` Status Panel flip** (plan → build → verify → ship).

For everything below that threshold — the single-file tweak, the typo fix, the one-liner patch —
stay here and apply the 4 rules above.

## Attribution

Inspired by common open-source `CLAUDE.md` guideline patterns (micro-discipline / surgical-change /
goal-driven loops). Original phrasing; no vendored upstream content.
License: Internal-Original. See `PROVENANCE.md` and `docs/adr/0008-internal-original-skill-convention.md`.
