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

**Feature**: repository-v0-contract
**Commit(s)**: 744d578
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
2. Run `git show --stat 744d578` mentally — review the diff for the listed files.
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

Feature ID: G2.1 / repository-v0-contract
Branch: codex/track-a-desktop-foundation
Commit under review: 744d578 (feat(repository-v0-contract): freeze Repository v0 entity surface)

Files added or changed by this commit (read these):
- packages/core-data/src/entities.ts (new) — canonical Repository v0 entity surface
- packages/core-data/src/index.ts — re-exports
- packages/core-data/src/types.ts — RepoRecord / Repo / Migration types
- packages/core-data/src/sqlite.ts — createSqliteRepo + SqliteDriver
- packages/core-data/src/repo-utils.ts (new) — applyRepoListQuery / listByIndex helpers / assertRepoRecord
- packages/core-data/src/testing.ts — createInMemoryRepo + createInMemorySqliteDriver
- packages/core-data/tests/entities.test.ts (new) — entity round-trip + naming regex + listByIndex
- packages/core-data/tests/in-memory-repo.test.ts
- packages/core-data/tests/sqlite-repo.test.ts
- packages/core-data/tests/repository-contract.ts (new) — reusable contract suite
- docs/contracts/data-repository-v0.md — adds §3.1 entity table, full Repo<T> interface
- packages/repository-v0-contract/docs/dev_log.md — Status → READY_TO_SHIP
- docs/workflow/roadmap/xai-g2-data-security-foundation.md — manifest row #1 → READY_TO_SHIP

Intended scope:
- Define a typed entity surface for every persisted plugin (Grid, GridItem, Label, Todo,
  Habit, ClipboardEntry, Project, Card) on top of the RepoRecord base.
- Freeze the Repo<T> interface so SQLite, sync, and plugins agree on it.
- Provide a reusable contract test suite that drivers must pass.

Explicit non-goals (deferred):
- SQLCipher PRAGMA application (G2.4)
- Live Supabase / 2-Mac smoke (G2.6 follow-up)
- localStorage runtime cut-over in plugin-organizer (G1.5 / G3-E1)
- MAS / signed-runtime smoke (G0.6 / G2.7)

Key invariants to verify:
- ClipboardEntryEntity narrows syncScope to the literal "device-local" (cannot be widened).
- entityType matches /^[a-z]+\.[a-z_]+$/.
- Repository v0 helpers (assertRepoRecord, applyRepoListQuery, applyRepoIndexQuery)
  reject bad records with E3005 / E3006 messages.

Test evidence:
- pnpm --filter @repo/core-data test → 45 tests (now 58 after later commits) passing.
- pnpm --filter @repo/core-data check-types passes.

Cross-vendor checklist (verify or flag):
1. Does the entity surface match docs/contracts/data-repository-v0.md §3.1 row-for-row?
2. Are there entities the project clearly needs (e.g. WidgetEntity / AccountDeviceEntity)
   that were missed?
3. Is the `RepoEntity` discriminated union usable from plugins without runtime narrowing
   helpers? Suggest a helper if missing.
4. Is the test in tests/repository-contract.ts adequate for a new SQLCipher-backed driver
   to claim contract compliance?
5. Any naming-regex edge cases? (e.g. `productivity.todo-list`?)
6. Future-proof: if G2.6 adds OutboxEntry (`sync.outbox`) — does the naming regex accept it?
