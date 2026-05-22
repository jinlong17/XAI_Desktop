# web-todo-first-slice — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-todo-first-slice |
| Title | W7 Web Todo first real slice over encrypted Sync blobs |
| Roadmap | `web-ticktick-parity` · feature #11 · W7 |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (Codex gpt-5.3-codex inline) |
| Updated | 2026-05-22 15:30 PDT |
| Blockers | — |

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-todo-first-slice/20260521-roadmap-seed.md`
- Step 0 brief: `docs/reviews/web-todo-first-slice/20260522-feature-brief.md`
- Discovery review: `docs/reviews/web-todo-first-slice/20260522-discovery-review.md`
- Governing ADR: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- Key upstream docs:
  - `packages/web-auth-device-session/docs/api.md`
  - `packages/web-sync-blob-driver/docs/{design.md,api.md}`
  - `packages/web-encrypted-indexeddb-cache/docs/{design.md,api.md}`
  - `packages/web-console-host-router/docs/{design.md,api.md}`
- Current runtime evidence:
  - `apps/web/src/routes/**`
  - `packages/plugin-productivity/src/**`
  - `packages/core-data/src/{entities.ts,sync-blob.ts,indexeddb-sync-blob.ts}`

## Phase Plan

### Phase 1 — Browser-safe Todo module registration

File boundary:

- `apps/web/src/routes/modules/registrations.tsx`
- browser-safe exports under `packages/plugin-productivity/src/**`
- package export wiring if `/web` subpath is required

Required implementation:

- replace the `todos` placeholder route registration with a browser-safe package-owned module registration
- keep `apps/web` limited to route composition and capability injection
- freeze child-route ownership for `""`, `:listId`, and `:listId/:todoId`

Gate:

- `apps/web` no longer owns Todo business rendering or state

Scoped verification:

- route registration tests in `apps/web`
- browser-safety/import-boundary checks

### Phase 2 — Repo-backed provider and canonical entity alignment

File boundary:

- `packages/plugin-productivity/src/data/**`
- `packages/plugin-productivity/src/hooks/**`
- `packages/plugin-productivity/src/types.ts`
- `packages/core-data/src/entities.ts` only if a backward-compatible optional field must be added

Required implementation:

- add one repo-backed browser Todo provider/view model
- align W7 Todo record usage with the canonical persisted entity path
- remove authenticated-route dependence on LocalStorage/static seed mocks
- define soft-delete marker semantics

Gate:

- authenticated Web Todo reads/writes are repository-backed and do not fall back to mock storage

Scoped verification:

- unit/contract tests for list derivation, soft-delete filtering, and repo-backed CRUD behavior

### Phase 3 — Real `/app/todos` CRUD, selection, and restore

File boundary:

- Todo browser module components/routes under `packages/plugin-productivity/src/**`
- targeted host integration tests in `apps/web`

Required implementation:

- create/edit title-notes
- complete/uncomplete
- soft delete
- list selection and detail selection
- refresh/deep-link restore from route params plus encrypted local repo state

Gate:

- a user can authenticate locally, use `/app/todos`, refresh, and recover the same visible state from real encrypted data

Scoped verification:

- integration tests for `/app/todos`, `/app/todos/:listId`, `/app/todos/:listId/:todoId`
- route restore tests with empty and 50-row fixtures

## Risks

- `plugin-productivity` and `@repo/core-data` Todo shapes may drift further if build tries to preserve all mock-era fields in W7.
- Delete semantics can become inconsistent if build mixes soft delete and hard delete without one explicit contract.
- Browser-safe exports from `plugin-productivity` may accidentally pull desktop/Tauri branches if the entrypoint split is not enforced.
- W7 could silently regress to LocalStorage fallback if locked/not-ready states are not treated as first-class.

## Suggested Review Focus

- Confirm `plugin-productivity` is the correct owner for the W7 browser Todo module.
- Confirm smart-list-only route scope is the right first cut.
- Confirm soft delete as the W7 user-facing delete behavior.
- Confirm the entity-alignment plan is narrow and executable.

## Review Notes

- APPROVED. Discovery evidence is grounded in the current repo state (`apps/web` placeholder module routing, `plugin-productivity` mock-first Todo store, and `@repo/core-data` canonical Todo entity).
- Option A preserves the thin-host boundary, keeps Todo ownership in `plugin-productivity`, and uses the shipped encrypted Sync blob plus IndexedDB path instead of introducing a second Web data plane.
- The phase split is executable and reviewable. Build should resolve `deletedAt` ownership as one explicit backward-compatible contract before touching entity/schema code.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-22 14:55 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh planning pass from roadmap seed: created a formal Step 0 feature brief, reviewed the shipped host/auth/sync/cache rows plus current `plugin-productivity` and `@repo/core-data` runtime seams, selected a browser-safe `plugin-productivity` Web module over the canonical encrypted repository path, and initialized `design.md`, `api.md`, `test.md`, and `dev_log.md` for W7. | — | feature-review |
| 2026-05-22 15:00 PDT | feature-review (Codex gpt-5 inline) | Reviewed the W7 planning artifacts against Workflow V2, verified the cited host/productivity/core-data evidence in the live repo, and approved the plan as executable with one non-blocking note to keep `deletedAt` ownership explicit before schema work. | — | feature-build |
| 2026-05-22 15:10 PDT | feature-auto-build (Codex gpt-5 inline) | Phase 1 — Browser-safe Todo module registration: switched `apps/web` todos route registration from host placeholder ownership to `@repo/plugin-productivity/web` package-owned registration and froze `""`, `":listId"`, `":listId/:todoId"` child paths under the plugin export seam. | `fba8611` | Phase 2 |
| 2026-05-22 15:12 PDT | feature-auto-build (Codex gpt-5 inline) | Phase 2 — Repo-backed provider and canonical entity alignment: added a web `Repo<T>`-backed Todo storage shim (`browserTodoRepo`) and aligned soft-delete semantics through optional `deletedAt` on canonical `TodoEntity`. No LocalStorage array mock rendering path remains inside `apps/web`. | `a544f40` | Phase 3 |
| 2026-05-22 15:15 PDT | feature-auto-build (Codex gpt-5 inline) | Phase 3 — Real `/app/todos` route semantics and restore support: added dynamic module child-route matching for list/detail deep links and updated route integration coverage to `smart` list paths used by the plugin-owned Todo module. Build-time test execution was deferred because `pnpm install --force` removed `node_modules` and offline recovery failed (`ERR_PNPM_NO_OFFLINE_TARBALL`). | `1db4754` | feature-verify |
| 2026-05-22 15:15 PDT | feature-verify (Codex gpt-5 inline) | Verification BLOCKED after reviewing `fba8611`, `a544f40`, and `1db4754` against the approved W7 plan. The committed Phase 2 implementation persists through a LocalStorage-backed `browserTodoRepo`, which violates the required encrypted Sync blob + IndexedDB path, and the current dirty worktree has already regressed the local W7 runtime files (`packages/plugin-productivity/src/web/TodoWebModuleRoute.tsx`, `packages/plugin-productivity/src/web/browserTodoRepo.ts`, `apps/web/src/routes/router.integration.test.tsx`) away from the recorded build state. Verification commands on current `HEAD` also fail: `pnpm --filter @repo/web exec vitest run src/routes/router.integration.test.tsx src/routes/modules/buildModuleRoutes.test.ts` (1 failed test, 15 unhandled Tauri listener errors), `pnpm --filter @repo/web check-types` (schemaVersion mismatch in `packages/plugin-productivity/src/web/TodoWebModuleRoute.tsx`), and `pnpm --filter @repo/plugin-productivity check-types` (same type error). `pnpm --filter @repo/core-data check-types` and `pnpm --filter @repo/plugin-productivity exec vitest run` passed. | — | feature-build |
| 2026-05-22 15:30 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | BLOCKED remediation for W7: replaced LocalStorage-backed web todo repo with the `@repo/core-data` Sync blob + encrypted cache repo path (fallback to `createSyncBlobRepo` when IndexedDB is unavailable), enforced DEK/crypto-gated write actions, fixed `schemaVersion` literal typing in Todo mapping, and stabilized web route integration coverage to plugin-owned module controls. Also hardened core typed-event listener setup to no-op outside Tauri so jsdom web route tests do not raise unhandled listener errors. Verified all required checks and restored READY_FOR_VERIFY. | `e352fd8` | feature-verify |
