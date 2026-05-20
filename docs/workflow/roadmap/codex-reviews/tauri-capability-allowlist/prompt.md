# Codex Feature Post-merge Review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass).
Your job is to audit a Track A feature that has already been built and committed to
`codex/track-a-desktop-foundation`. The original executor was Claude Code; you provide an
independent cross-vendor verdict.

## Hard output contract

Output ONLY the markdown block below — no preamble, no follow-up, no chatter. Keep total
length under 600 words.

```md
## Codex Cross-vendor Review

**Feature**: tauri-capability-allowlist
**Commit(s)**: ad5f1d3
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: APPROVED | REVISE | BLOCKED

### Strengths (max 4 bullets)
- …

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0|P1|P2] …

### Concrete next-phase targets (max 6 bullets)
- …

### Out of scope confirmed
- …
```

## How to evaluate

1. Read the listed dev_log and contract docs to understand the *intended* scope.
2. Run `git show --stat ad5f1d3` mentally — review the diff for the listed files.
3. Score against:
   - **Contract integrity** (red lines #4 / #8 / #9 in `docs/SYSTEM_ARCHITECTURE.md` §4)
   - **Test coverage adequacy** (boundary, error, concurrency, capability)
   - **Doc-code alignment** (`docs/contracts/*` matches actual surface)
   - **Security boundary** (raw key bytes, capability allow-list, IPC payload)
   - **Workflow V2 hygiene** (dev_log Status Panel, Work Log row, commit message Why/What/Scope/Risk)
   - **Future-proofing** (does the design accommodate the next 1-2 G2/G3 rows?)
4. Verdict guidance:
   - **APPROVED**: ship-ready; gaps are P2-only and recorded.
   - **REVISE**: at least one P1 issue worth fixing before next phase.
   - **BLOCKED**: at least one P0 issue (broken contract, missing test on critical path, security regression).
5. Concrete next-phase targets must be small, mergeable items (each ≤ half a day).
6. Out-of-scope: confirm which deferred gates remain valid (live Supabase, MAS sandbox, real
   macOS Finder smoke, etc.) — call them out so the next agent does not re-investigate.

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
