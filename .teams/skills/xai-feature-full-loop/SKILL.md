---
name: xai-feature-full-loop
description: Parent-session feature orchestration recipe for running the full Workflow V2 feature pipeline without nested meta-orchestrator spawn. Use when user asks feature full loop, run a feature end to end, parent-session feature orchestration, single feature automation, or avoid feature-full-loop subagent Task limits.
---

# xai-feature-full-loop

Parent-session runtime entry for one feature's Workflow V2 pipeline.

Use this skill instead of spawning the `feature-full-loop` subagent when the host tool withholds
recursive `Task` / agent-spawn from spawned subagents. The old `feature-full-loop` agent remains a
portable contract / compatibility wrapper; this skill is the recommended executable path.

## Read First

- `docs/workflow/SUBAGENT_WORKFLOW_V2.md`
- `docs/workflow/SOP_NEW_FEATURE.md`
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
5. **Between every worker, read `packages/<feature>/docs/dev_log.md`.** Do not trust a child
   Handoff without verifying the real Status Panel. If project convention maps feature slugs to a
   prefixed package/path, resolve `<feature>` to the concrete directory before reading.
6. **Background/worktree safe.** This skill may be launched by `xai-roadmap-loop
   dispatch: bg` inside a Claude Code background session and its isolated worktree. In that case,
   keep all reads/writes in the current checkout, do not clean up the background session/worktree,
   and preserve any `Roadmap Manifest:`, `Background Session:`, or `Worktree:` fields passed in the
   prompt so the final Next Step can hand `ship` the right worktree context.
7. **Native / real-hardware gate.** If the feature touches multi-window behaviour, typed event
   contracts, host-app command signatures, or native OS APIs, record in the final Handoff that
   real-hardware verification is required before the human ship gate.

## Inputs

Fresh start:

```text
/xai-feature-full-loop
Requirement: <freeform requirement or roadmap source excerpt>
Automation Mode: <A-Claude | A-Codex | B-Codex | B-Cursor | C-Codex | C-Cursor | D-Codex | D-Cursor | D-Codex+Cursor>
Verify Cross-vendor: <yes|no>  # default yes when omitted and no picker is available
```

Resume:

```text
/xai-feature-full-loop
Feature: <canonical-feature-slug>
Roadmap Manifest: <optional manifest path>
Background Session: <optional bg session id/name>
Worktree: <optional absolute worktree path>
```

## Runtime Recipe

1. **Intake.** If no `Feature:` is given, require a non-empty `Requirement:`. Resolve
   `Automation Mode:` using `_portable/07-automation-mode-picker.md`; default
   `Verify Cross-vendor` to `yes` if the host cannot ask.
2. **Step 0.** If no reviewed feature brief exists, run `xai-feature-brief`; otherwise reuse the
   existing brief or roadmap seed/source.
3. **Plan.** Dispatch `feature-plan` with the brief/requirement plus resolved Automation Mode and
   Verify Cross-vendor. Continue only when `dev_log` says `Status: NEEDS_REVIEW`.
4. **Review loop.** Dispatch `feature-review`. If it returns REVISE, dispatch `feature-plan` again
   with the review notes. Stop as BLOCKED after `Max Revise` attempts (default 3). Continue only
   when `dev_log` says `Status: APPROVED`.
5. **Build.**
   - If `Automation Mode: A-Codex` and worker spawn is unavailable, execute the
     next worker contract inline in the current Codex parent session.
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
- Blockers, if any, including real-hardware verification still required when applicable
- Next Step

Do not append a conversational "continue?" prompt after the Next Step.
