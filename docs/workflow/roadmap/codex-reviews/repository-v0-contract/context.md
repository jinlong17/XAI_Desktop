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
