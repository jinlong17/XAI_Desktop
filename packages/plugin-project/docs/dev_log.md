# Plugin Project Dev Log

## Workflow

- Status: READY_FOR_VERIFY
- Executor: Track B Codex worker
- Updated: 2026-05-20
- Suggested Next: Cross-review verification (claude-review-fix-pass)
- Pending: emit `project:card-created` / `project:card-moved` / `project:card-updated` via `@repo/core/events`.

## Work Log

- Created project package scaffold.
- Added Project/Card entities and mock adapters.
- Added `useProjectStore` with project/card CRUD and card movement.
- Added `BoardView` with pure React drag/drop and `CardDetail` with description, checklist, labels, and due date.
- `fix(plugin-project): stop ProjectStoreProvider adapter default-arg loop (both adapters)`
- `perf(plugin-project): only persist moved cards in moveCard`
- `perf(plugin-project): commit CardDetail edits on blur instead of every keystroke`
- `feat(plugin-project): drop card above another to insert at position`
- `feat(plugin-project): add createdAt/updatedAt to Project and Card`
- `chore(plugin-project): memoize BoardView list sort, share createId helper, document event-emit gap`
- 2026-05-20 Track D: migrated Project/Card to Repository v0, added `RepoAdapter`/`ProjectRepoProvider`, preserved card order updates, and passed `pnpm --filter @repo/plugin-project check-types`.
