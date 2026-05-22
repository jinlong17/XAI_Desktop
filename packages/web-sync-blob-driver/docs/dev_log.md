# web-sync-blob-driver — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-sync-blob-driver |
| Title | W4 Web Sync blob driver for `@repo/core-data` |
| Roadmap | `web-ticktick-parity` · feature #8 · W4 |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (Codex gpt-5.3-codex inline) |
| Updated | 2026-05-22 00:38 PDT |
| Blockers | — |

## Phase Plan

### Phase 1 — Driver scaffold and repository-contract mirror

Status: DONE.

- add a new Sync blob driver module to `packages/core-data/`
- freeze the factory options, injected transport/crypto seams, and the canonical `/sync/*` header rule `Accept-Version: sync.protocol=1`
- implement a process-local mirror so the existing repository query methods remain available
- wire the repository contract suite against deterministic mock transport + crypto

Gate:

- the repo exposes one credible `Repository<T>` implementation for Web without business-table CRUD
- completion evidence:
  - commit `7a26f5d` (`feat(core-data): Phase 1 - scaffold sync-blob repository driver`)
  - added `packages/core-data/src/sync-blob.ts`
  - repository contract suite runs against `createSyncBlobRepo` with deterministic mock transport/crypto

### Phase 2 — Pull/push transport, status handling, and idempotent retries

Status: DONE.

- implement `/sync/pull` hydration and `/sync/push` batch commit
- preserve `mutation_id` across retries
- add explicit `401/403/409/426/429` handling plus upstream `version_required` protocol failure handling
- prove requests always include `Authorization`, `X-Device-Id`, and `Accept-Version: sync.protocol=1`

Gate:

- mock transport proves encrypted blob-only traffic and explicit failure-path behavior
- completion evidence:
  - commit `d653181` (`feat(core-data): Phase 2 - add sync transport retries and status paths`)
  - explicit tests for `401/403/409/426/429` + `400 version_required`
  - push/pull request assertions cover `Authorization`, `X-Device-Id`, `Accept-Version: sync.protocol=1`
  - retry path preserves one logical `mutation_id`

### Phase 3 — Contract hardening and downstream handoff

Status: DONE.

- finalize metadata/migration semantics for the Sync-backed driver
- document the handoff seam for `web-encrypted-indexeddb-cache`
- confirm repository contract parity remains intact after conflict/retry logic

Gate:

- downstream Web rows can depend on `@repo/core-data` rather than inventing their own repository layer
- completion evidence:
  - commit: current Phase 3 hardening commit in this run
  - added `syncState()` seam (`lastCommitSeq`, pending count, mirror count)
  - migration-failure rollback semantics verified without `migrationVersion` drift
  - feature docs updated for downstream `web-encrypted-indexeddb-cache` adoption seam

## Risks

- `Repo.delete(id)` has only one deletion mode; reviewers must confirm hard-delete mapping at repository level.
- A process-local mirror introduces cursor/staleness decisions that need discipline before the persistent cache row lands.
- `@repo/core-data` remains `In-Dev`, so downstream feature packages still need mock-first discipline until later workflow stages promote it.
- upstream helper docs may still drift; generated plan artifacts for this feature follow only `Authorization`, `X-Device-Id`, and `Accept-Version: sync.protocol=1` as the canonical `/sync/*` request contract.

## Suggested Review Focus

- Confirm the docs-anchor plus `@repo/core-data` runtime split is the right conservative boundary.
- Confirm injected auth/crypto seams are sufficient and keep app-shell logic out of `@repo/core-data`.
- Confirm the local mirror and transaction interpretation are acceptable against the current repository contract tests.
- Confirm the canonical `/sync/*` request contract is unambiguous: `Authorization`, `X-Device-Id`, and `Accept-Version: sync.protocol=1`.

## Review Notes

- APPROVED: discovery/design/api/test/dev_log now align on `Accept-Version: sync.protocol=1` as the sole canonical `/sync/*` protocol-version header for this feature, matching the shipped Sync authority.
- The injected request seam owns only `Authorization` and `X-Device-Id`; the planned `@repo/core-data` driver owns appending `Accept-Version: sync.protocol=1` on `/sync/pull` and `/sync/push`.
- `version_required` is correctly treated as the missing/malformed `Accept-Version` path, and `426` remains the upgrade-required path after a canonically versioned request.
- Scope remains conservative and executable: `@repo/core-data` driver only, encrypted blob transport only, local mocks, repository-contract parity target, no business-table CRUD, no business UI, no ship scope.
- Re-validated against the primary upstream authorities (`web-sync-crypto-contract-preflight`, `web-auth-device-session`, Sync PRD, and `@repo/core-data` contract tests): generated build-gating artifacts no longer require or add `X-Sync-Version`; remaining mentions are historical drift/seed context only.
- Non-blocking cleanup note: the older Step 0 brief and roadmap seed still contain historical extra-header wording, but the active build-gating docs no longer require or assert it for this feature.

## Revision Response

- Revised:
  - removed the non-canonical extra version header from this feature's required/additive `/sync/*` transport contract across discovery, design, API, and test docs.
  - rewrote the header ownership rule so the injected device-bound fetch seam owns `Authorization` and `X-Device-Id`, while the `@repo/core-data` driver owns `Accept-Version: sync.protocol=1`.
  - keep `version_required` tied to missing or malformed `Accept-Version`, and keep `426` as the post-versioned-request upgrade path.
- Intentionally unchanged:
  - docs-anchor package plus `@repo/core-data` runtime split
  - injected auth/crypto seam model
  - process-local mirror, transaction interpretation, and hard-delete repository mapping

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 23:56 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh plan: created the canonical feature brief and discovery review, initialized `packages/web-sync-blob-driver/docs/`, and froze the conservative boundary where workflow docs live under the feature package but the future runtime driver lands in `packages/core-data/` with injected auth/crypto seams, local mirror semantics, and explicit `401/403/409/426/429` handling. | — | feature-review |
| 2026-05-22 00:01 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass: boundary, repository-contract parity plan, and mock-first transport strategy are sound, but returned the plan for revision because the feature docs preserved a non-canonical extra version header while the shipped Sync preflight contract requires `Accept-Version: sync.protocol=1` as the canonical `/sync/*` version header. | — | feature-plan |
| 2026-05-22 00:03 PDT | feature-review (Codex gpt-5.3-codex inline) | Review refresh: re-checked the feature docs against `web-auth-device-session`, Sync preflight, and the sync PRD, and kept the plan in revision because the canonical `/sync/*` header rule was still unresolved and the generated plan artifacts had not fully converged on the preflight contract. | — | feature-plan |
| 2026-05-22 00:06 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revision pass: attempted to reconcile the `/sync/*` version-header rule, but the generated plan artifacts still preserved a non-canonical additive version-header assumption and needed another correction before review could pass. | — | feature-review |
| 2026-05-22 00:09 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass: re-checked the revised docs against Sync preflight, the sync PRD, and the requested review gate, and returned the plan for another revision because discovery/design/api still treated an upstream extra version header as part of this feature's `/sync/*` transport contract instead of leaving `Accept-Version: sync.protocol=1` as canonical. | — | feature-plan |
| 2026-05-22 00:13 PDT | feature-plan (Codex gpt-5.3-codex inline) | Second revision pass: aligned the active planning artifacts to the canonical `/sync/*` request contract `Authorization` + `X-Device-Id` + `Accept-Version: sync.protocol=1`, removed the extra version-header requirement from generated build-gating docs, and preserved roadmap-seed plus review/drift references for follow-up cleanup context. | — | feature-review |
| 2026-05-22 00:18 PDT | feature-review (Codex gpt-5.3-codex inline) | Approval pass: confirmed discovery/design/api/test/dev_log consistently treat `Accept-Version: sync.protocol=1` as the sole canonical `/sync/*` version header for this feature, keep `Authorization` + `X-Device-Id` in the injected fetch seam, preserve `version_required` vs `426` semantics, and maintain the conservative `@repo/core-data`-only driver scope. | — | feature-build |
| 2026-05-22 00:20 PDT | feature-review (Codex gpt-5.3-codex inline) | Final review pass after the requested header-contract revision: verified the generated plan artifacts against the upstream preflight/auth/PRD/core-data sources, confirmed `X-Sync-Version` is absent from active build-gating requirements, and kept the row APPROVED for `feature-build`. | — | feature-build |
| 2026-05-22 00:34 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 1 completed (`Driver scaffold and repository-contract mirror`): implemented `createSyncBlobRepo` in `packages/core-data`, wired local mirror CRUD/transaction/migrate semantics, added `/sync/*` request scaffolding with driver-owned `Accept-Version: sync.protocol=1`, and ran repository-contract + transport-baseline tests with deterministic mock transport/crypto. | `7a26f5d` | feature-auto-build |
| 2026-05-22 00:37 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 2 completed (`Pull/push transport, status handling, and idempotent retries`): added explicit `401/403/409/426/429` + `version_required` mapping, conflict refresh path, retry/backoff handling with stable `mutation_id`, and header assertions proving requests carry injected `Authorization`/`X-Device-Id` plus driver-owned `Accept-Version`. | `d653181` | feature-auto-build |
| 2026-05-22 00:38 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 3 completed (`Contract hardening and downstream handoff`): hardened conflict mirror consistency, exported sync cursor state seam (`syncState()`), verified migration rollback invariants, updated design/api/test docs for downstream cache handoff, and re-ran core-data tests and typecheck to confirm repository-contract parity after conflict/retry logic. | current Phase 3 hardening commit | feature-verify |
