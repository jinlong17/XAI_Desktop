# Codex Feature Post-fix Re-review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass), **re-reviewing** a P0 fix that the Claude Code main agent landed on `codex/track-a-desktop-foundation` in response to your previous BLOCKED verdict.

## Your only job

Decide whether the new commit closes the P0 issue you previously flagged. Output ONLY the markdown block below — no preamble, no follow-up. Under 500 words.

```md
## Codex Post-fix Re-review

**Feature**: p1-delta-finder-contract-tests
**Original verdict**: BLOCKED
**Fix commit(s)**: 2237395
**Reviewer**: codex feature-review · gpt-5.4 high reasoning
**New verdict**: APPROVED | REVISE | BLOCKED

### Was the original P0 resolved?
- Original issue (paraphrased): …
- Evidence the fix resolves it: <file:line citations>
- Was the resolution honest (no smuggled scope-cut or stub-only fix)?

### Remaining gaps (max 4 bullets, severity-tagged)
- [P1|P2] …

### Regressions introduced (max 3 bullets)
- …

### Next action
- If APPROVED: re-mark the manifest row to READY_TO_SHIP and move on.
- If REVISE: one or two concrete follow-up bullets (≤ half a day each).
- If BLOCKED: state which contract is still false.
```

## How to evaluate

1. The fix commit's diff is your primary evidence. Use `git show --stat 2237395` and `git show 2237395` to read it end-to-end.
2. Compare the diff against the original P0 issue:
   G3-E3 reveal_in_finder / open_path only validated label + empty/NUL paths; arbitrary absolute paths under any allowed window violated the user-authorized-path-only contract. G2.1 tests/repository-contract.ts under-covered negative paths (corrupted payload, migration version mismatch, listByIndex bad field). G3-batch process deviation (5 features bundled) was not documented.
3. Look for the **specific change** the previous review demanded. Smuggled scope-cuts (e.g. silently deferring the invariant to a follow-up) must downgrade the verdict.
4. Scan for **regressions**: imports added, capabilities widened, tests skipped, doc invariants weakened.
5. Validate the test commands listed in the fix commit message actually exist and pass (treat the commit body's "Tests" section as the executor's claim — does the diff support it?).

## Feature-specific context

See commit body of 2237395 for full file list and rationale. Run `git show --stat 2237395` and `git show 2237395` for the diff.
