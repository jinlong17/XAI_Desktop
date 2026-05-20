# Codex Feature Post-fix Re-review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass), **re-reviewing** a P0 fix that the Claude Code main agent landed on `codex/track-a-desktop-foundation` in response to your previous BLOCKED verdict.

## Your only job

Decide whether the new commit closes the P0 issue you previously flagged. Output ONLY the markdown block below — no preamble, no follow-up. Under 500 words.

```md
## Codex Post-fix Re-review

**Feature**: tauri-capability-allowlist
**Original verdict**: BLOCKED
**Fix commit(s)**: 143bca5
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

1. The fix commit's diff is your primary evidence. Use `git show --stat 143bca5` and `git show 143bca5` to read it end-to-end.
2. Compare the diff against the original P0 issue:
   commands/keychain.rs secret_set/get/del had no WebviewWindow parameter and no ensure_*_allowed check, yet AUDIT.md and contracts/tauri-commands-v0.md claimed every JS-callable command runtime-enforces a window allow-list.
3. Look for the **specific change** the previous review demanded. Smuggled scope-cuts (e.g. silently deferring the invariant to a follow-up) must downgrade the verdict.
4. Scan for **regressions**: imports added, capabilities widened, tests skipped, doc invariants weakened.
5. Validate the test commands listed in the fix commit message actually exist and pass (treat the commit body's "Tests" section as the executor's claim — does the diff support it?).

## Feature-specific context

Feature ID: G2.5 / tauri-capability-allowlist
Branch: codex/track-a-desktop-foundation
Commit under review: ad5f1d3 (feat(tauri-capability-allowlist): add db capability file + runtime window allow-list)

Files added or changed:
- apps/desktop/src-tauri/capabilities/plugin-data-database.json (new)
- apps/desktop/src-tauri/capabilities/AUDIT.md (new — full window×command×layer audit)
- apps/desktop/src-tauri/src/commands/database.rs — DATABASE_ALLOWED_WINDOWS + ensure_database_window_allowed + checks in all 5 db_* commands + 2 new cargo tests
- docs/contracts/tauri-commands-v0.md — §6.1 cross-ref + §7 audit pointer
- packages/tauri-capability-allowlist/docs/dev_log.md (new)
- docs/workflow/roadmap/xai-g2-data-security-foundation.md row #6 → READY_TO_SHIP

Intended scope:
- Every JS-callable command has (a) a capability file declaring allowed windows and
  (b) a runtime `ensure_*_allowed(label)` defence-in-depth check.
- New capability file `plugin-data-database.json` scopes db_* to
  main/control/grid_*/account/console.
- Widget/pet/ai-cube cannot reach db_*/crypto_*/secret_* even with a mis-attached
  capability file.

Cross-vendor checklist:
1. Capability files are markers only — actual permission policy lives in the runtime
   check. Does `plugin-data-database.json` get loaded by Tauri at all (does it
   appear in tauri.conf.json capabilities array, or auto-discovered)?
2. Does `default.json` actually grant the surface to `widget_*` / `pet` / `ai_cube`
   somewhere else (e.g. inherited from a wildcard)? If so, the runtime guard is the
   only thing standing.
3. Runtime guard test coverage: 2 new cargo tests check admit/reject. Are there
   off-by-one cases (e.g. label `gridXXX` w/o underscore, label with NUL)?
4. AUDIT.md correctness: does each row in the audit table actually match the
   reality of `lib.rs` invoke_handler registration?
5. Consistency: crypto_* uses `CRYPTO_ALLOWED_WINDOWS` constant, database uses
   `DATABASE_ALLOWED_WINDOWS`. Should there be a shared helper / enum to prevent
   drift?
6. Future-proofing: when finder commands land (G3-E3) they need their own
   FINDER_ALLOWED_WINDOWS — does the pattern scale? (Note: finder.rs already exists
   in commit 533391e — that's a separate review.)
7. Doc/code alignment: §6.1 says "Every JS-callable command has a runtime
   `ensure_*_allowed(label)` check". Window commands (`create_grid_window` etc.)
   in commands/window.rs — do they actually have such a check, or only via the
   capability file?
