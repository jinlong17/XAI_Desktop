# web-todo-first-slice — Test Plan

## Validation Strategy

Validation for W7 must prove four claims:

1. `/app/todos` is the first real browser module, not placeholder or mock content.
2. CRUD flows use the encrypted repository path rather than host-local state or business-table HTTP calls.
3. route params fully drive list/detail restore across refresh and deep links.
4. the slice leaves reusable fixtures and seams for realtime/offline/search follow-up rows.

## Required Automated Coverage

### Unit coverage

- smart-list derivation for:
  - `smart:inbox`
  - `smart:today`
  - `smart:done`
- route param to list/detail selection resolution
- soft-delete filtering
- Todo record mapping/alignment between repo records and UI model
- locked/not-ready state handling for write actions

### Contract coverage

- W7 route registration exports `moduleId = "todos"` through the browser-safe package surface
- authenticated Todo reads/writes use `Repo<T>` only
- no W7 flow uses `/rest/v1/todos` or other business-table CRUD endpoints
- soft delete is persisted as record update, not default hard delete
- invalid `listId` and missing `todoId` degrade deterministically

### Integration coverage

- `/app/todos` with empty fixture
- `/app/todos/smart:inbox`
- `/app/todos/smart:inbox/:todoId`
- create Todo, refresh, and restore from encrypted local repo state
- edit title/notes, refresh, and restore
- complete/uncomplete, refresh, and restore
- soft delete, refresh, and confirm exclusion from active lists

### Repository/data-plane coverage

- repo-backed writes hit the Sync blob mutation path
- encrypted local cache bootstraps the module without static `accountMocks`
- locked crypto state blocks write actions explicitly
- device-session loss surfaces typed failure rather than silent fallback

### Regression / downstream coverage

- 50-row Todo fixture for later perf/search/realtime rows
- fixture set includes:
  - empty inbox
  - mixed done/open/today rows
  - soft-deleted row
  - deep-linkable selected detail row
- W7 tests provide a stable seed for later `web-realtime-metadata-sync` and `web-offline-outbox-conflicts`

## Local Mock Strategy

Allowed seams:

- mock authenticated device session from the shipped host/provider seam
- deterministic in-memory or browser-test repo fixtures built through `@repo/core-data` interfaces
- fake clock helpers for due-date smart-list derivation
- browser-safe route integration tests in `apps/web`

Rules:

- no static `accountMocks` or placeholder route pages may satisfy W7 assertions
- do not bypass repository writes by mutating React state directly in tests
- do not add a business-table network mock such as `/rest/v1/todos`
- if fixture seeding is needed, seed via the repository contract or W7-specific repo helpers, not hard-coded rendered arrays

## Per-Phase Verification Gates

### Phase 1 — Browser-safe route registration

- `test -f docs/reviews/web-todo-first-slice/20260522-feature-brief.md`
- `test -f docs/reviews/web-todo-first-slice/20260522-discovery-review.md`
- `test -f packages/web-todo-first-slice/docs/design.md`
- `test -f packages/web-todo-first-slice/docs/api.md`
- `test -f packages/web-todo-first-slice/docs/test.md`
- `test -f packages/web-todo-first-slice/docs/dev_log.md`
- route registration tests prove `todos` no longer resolves to placeholder-only content

### Phase 2 — Repo-backed provider and entity alignment

- targeted tests for repo-backed Todo provider logic
- targeted tests for smart-list derivation and soft-delete filtering
- contract tests confirm no LocalStorage/mock fallback on authenticated Web routes

### Phase 3 — Real CRUD and restore

- browser route integration tests for create/edit/complete/delete/refresh/deep-link
- targeted typecheck/tests across:
  - `apps/web`
  - `plugin-productivity`
  - `core-data` if entity contract is extended
- fixture matrix includes 0-row and 50-row cases

## Suggested Commands

```bash
test -f docs/reviews/web-todo-first-slice/20260522-feature-brief.md
test -f docs/reviews/web-todo-first-slice/20260522-discovery-review.md
test -f packages/web-todo-first-slice/docs/design.md
test -f packages/web-todo-first-slice/docs/api.md
test -f packages/web-todo-first-slice/docs/test.md
test -f packages/web-todo-first-slice/docs/dev_log.md
pnpm --filter @repo/web check-types
pnpm --filter @repo/plugin-productivity check-types
pnpm --filter @repo/core-data check-types
```

## Acceptance Focus

- Reviewers can see one clear path from the shipped browser host/auth/sync/cache rows to a real `/app/todos` module.
- The first real slice is repository-backed and refresh-safe.
- Delete semantics are explicit and testable.
- W7 leaves usable fixtures and contract seams for later realtime/offline/search rows instead of locking the roadmap into a one-off UI.

## Verify Remediation Coverage (2026-05-22)

Added automated coverage for blocked verify gates:

- `apps/web/src/routes/router.integration.test.tsx`
  - validates `/app/todos` module routing still resolves and remains stable under plugin-owned route behavior.
- `packages/plugin-productivity/src/web/browserTodoRepo.test.ts`
  - asserts missing session seam rejects repo bootstrap (`todo_device_session_missing`).
  - asserts crypto snapshot normalization and write-ready transitions.
- `packages/plugin-productivity/src/web/TodoWebModuleRoute.test.tsx`
  - validates account/device/fetch seam propagation into repo creation.
  - validates CRUD path (create/complete/edit/soft-delete) and deep-link restore (`:listId/:todoId`).
  - validates locked-session behavior when crypto snapshot is unavailable.
