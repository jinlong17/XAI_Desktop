# Codex Feature Post-fix Re-review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass), **re-reviewing** a P0 fix that the Claude Code main agent landed on `codex/track-a-desktop-foundation` in response to your previous BLOCKED verdict.

## Your only job

Decide whether the new commit closes the P0 issue you previously flagged. Output ONLY the markdown block below — no preamble, no follow-up. Under 500 words.

```md
## Codex Post-fix Re-review

**Feature**: p0-echo-bookmark-provenance
**Original verdict**: BLOCKED
**Fix commit(s)**: 520737c
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

1. The fix commit's diff is your primary evidence. Use `git show --stat 520737c` and `git show 520737c` to read it end-to-end.
2. Compare the diff against the original P0 issue:
   reveal_in_finder / open_path accepted any path under /Users//Applications//Volumes//tmp/ without proving user provenance; the previous fix weakened the contract doc to match the implementation. This rerun verifies the bookmark-registry-based gate that the Echo sub-agent landed.
3. Look for the **specific change** the previous review demanded. Smuggled scope-cuts (e.g. silently deferring the invariant to a follow-up) must downgrade the verdict.
4. Scan for **regressions**: imports added, capabilities widened, tests skipped, doc invariants weakened.
5. Validate the test commands listed in the fix commit message actually exist and pass (treat the commit body's "Tests" section as the executor's claim — does the diff support it?).

## Feature-specific context

Feature ID: P0-Echo (Delta escalation)
Branch: codex/track-a-desktop-foundation
Commit under review: 520737c (fix(commands/bookmarks, commands/finder): user-authorized bookmark provenance for reveal/open (P0 Delta escalation))

# Context (must read before scoring)

Previous Codex review of commit `2237395` (P1-Delta finder + tests) returned BLOCKED with the verdict:
> "The user-authorized-path-only contract is still false: any allowed window can open arbitrary paths under /Users/ or /Volumes/ without provenance or bookmark proof. The contract doc was narrowed to match the implementation instead of the implementation being raised to the documented security boundary."

The Echo sub-agent was tasked to implement an in-memory `BookmarkRegistry` that:
1. Holds canonical paths registered by an explicit Tauri command.
2. Gets populated when the user drops files (via `useFileDrop` → `finderClient.registerBookmark`).
3. Gates `reveal_in_finder` / `open_path` — paths not in the registry are rejected.

# Files changed (read these end-to-end)

- apps/desktop/src-tauri/src/commands/bookmarks.rs (NEW)
  Tauri-state `BookmarkRegistry` with `register_path_bookmark` / `clear_path_bookmark` IPC commands + Rust-internal `is_path_bookmarked` helper. 5 cargo tests.
- apps/desktop/src-tauri/src/commands/finder.rs (modified)
  `validate_user_path` made `pub(crate)`. `reveal_in_finder` and `open_path` take `tauri::State<'_, BookmarkRegistry>` and reject unregistered paths with `E3004`. 2 new cargo tests (reveal_rejects_unbookmarked_path, reveal_allows_bookmarked_path).
- apps/desktop/src-tauri/src/commands/mod.rs (modified)  `pub mod bookmarks;`
- apps/desktop/src-tauri/src/lib.rs (modified) registers BookmarkRegistry + 2 new commands.
- packages/plugin-organizer/src/finderClient.ts (modified) adds `registerBookmark` / `clearBookmark` methods + 4 new vitest cases.
- packages/plugin-organizer/src/hooks/useFileDrop.ts (modified) optional `finderClient` arg; on drop, registers each path. Warns when client missing.
- docs/contracts/tauri-commands-v0.md (modified) §4 restored the strict "user drop/open panel or authorized bookmark" sentence; deleted the previous "deferred bookmark enforcement" caveat; added rows for `register_path_bookmark` / `clear_path_bookmark`.
- apps/desktop/src-tauri/capabilities/AUDIT.md (modified) added rows for the 2 new bookmark commands.
- packages/grid-shell-organizer-content/docs/dev_log.md or G3-E3 dev_log (modified) noting P0 resolution.
- docs/workflow/roadmap/codex-reviews/g3-organizer-batch/PROCESS-NOTE.md (modified) G3-E3 P0 resolution.

# What to evaluate for the rerun

1. Does the fix actually close the previously cited P0? The path-shape gate is still there as a first-line defense, but **the new gate that matters** is the registry lookup. Confirm both `reveal_in_finder` and `open_path` call `is_path_bookmarked` AFTER `validate_user_path`.
2. Is the registry populated honestly? The only TS caller is `useFileDrop`, triggered by an actual user drop event. There is no other code path that auto-registers paths.
3. Did the contract doc actually restore the strict sentence and delete the deferred caveat (the previous bug was the OPPOSITE: doc was weakened)?
4. Are there gaps:
   - Open-panel registration isn't wired yet — is this called out clearly as a TODO with a code marker?
   - Bookmark registry is in-memory and clears on restart — is this an acceptable trade-off documented in the dev_log?
   - Any test that PROVES `register_path_bookmark` is the only entry point (e.g. no other commands write to the registry)?
   - Any way a non-allowed window can register a bookmark and then have an allowed window read it?
5. Are tests honest? Specifically, does the `reveal_allows_bookmarked_path` cargo test populate the registry through the public API or sidestep it via internal helpers?

# Verdict guidance

- **APPROVED**: registry is the dominant gate; only path is via user-action `register_path_bookmark`; doc strict-text restored; tests prove both admit and reject behavior; in-memory + session-scoped trade-off is acknowledged.
- **REVISE**: the gate works but some hole exists (e.g. doc still keeps old caveat; missing open-panel TODO; weak test).
- **BLOCKED**: the registry can be bypassed; or `validate_user_path` is still the only check on one of the two commands.

# Out of scope for this rerun

- Persistent bookmark store across restarts.
- macOS NSURL security-scoped bookmark integration (that's G2.7 MAS work).
- `Open…` panel registration wiring (the prompt explicitly said leave a TODO).
