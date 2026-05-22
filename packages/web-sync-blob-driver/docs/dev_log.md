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
| Executor | feature-build (Codex gpt-5.3-codex inline) |
| Updated | 2026-05-22 01:03 PDT |
| Blockers | none — prior docs-evidence blockers repaired; waiting for independent feature-verify confirmation |

## Phase Plan

### Phase 1 — Driver scaffold and repository-contract mirror

Status: DONE (`7a26f5d`).

- add a new Sync blob driver module to `packages/core-data/`
- freeze the factory options, injected transport/crypto seams, and the canonical `/sync/*` header rule `Accept-Version: sync.protocol=1`
- implement a process-local mirror so the existing repository query methods remain available
- wire the repository contract suite against deterministic mock transport + crypto

Gate:

- the repo exposes one credible `Repository<T>` implementation for Web without business-table CRUD

### Phase 2 — Pull/push transport, status handling, and idempotent retries

Status: DONE (`d653181`).

- implement `/sync/pull` hydration and `/sync/push` batch commit
- preserve `mutation_id` across retries
- add explicit `401/403/409/426/429` handling plus upstream `version_required` protocol failure handling
- prove requests always include `Authorization`, `X-Device-Id`, and `Accept-Version: sync.protocol=1`

Gate:

- mock transport proves encrypted blob-only traffic and explicit failure-path behavior

### Phase 3 — Contract hardening and downstream handoff

Status: DONE (`b72b234`; superseded runtime drift repair: `4a554e1`).

- finalize metadata/migration semantics for the Sync-backed driver
- document the handoff seam for `web-encrypted-indexeddb-cache`
- confirm repository contract parity remains intact after conflict/retry logic

Gate:

- downstream Web rows can depend on `@repo/core-data` rather than inventing their own repository layer

## Risks

- `Repo.delete(id)` has only one deletion mode; repository-level hard delete remains the chosen mapping.
- `@repo/core-data` remains `In-Dev`, so downstream Web rows should keep mock-first discipline until broader promotion.
- Real browser crypto/runtime validation and live Supabase middleware behavior remain upstream gates outside this row.

## Suggested Review Focus

- Confirm the docs-anchor plus `@repo/core-data` runtime split remains the right conservative boundary.
- Confirm the injected auth/crypto seams keep app-shell logic out of `@repo/core-data`.
- Confirm the canonical `/sync/*` request contract is unambiguous: `Authorization`, `X-Device-Id`, and `Accept-Version: sync.protocol=1`.
- Confirm `syncState()` is a sufficient downstream handoff seam until persistent cache work lands.

## Review Notes

- APPROVED: discovery/design/api/test/dev_log consistently treat `Accept-Version: sync.protocol=1` as the sole canonical `/sync/*` version header for this feature.
- APPROVED: the injected request seam remains the owner of `Authorization` and `X-Device-Id`; the `@repo/core-data` driver owns only appending `Accept-Version: sync.protocol=1`.
- APPROVED: scope remains conservative and executable: `@repo/core-data` driver only, encrypted blob transport only, local mocks, repository-contract parity target, no business-table CRUD, no business UI.

## Verification Summary

- PASS. Existing `@repo/core-data` runtime commits satisfy the approved phase plan on `main`: `7a26f5d` (Phase 1 scaffold), `d653181` (Phase 2 transport/status handling), `b72b234` (Phase 3 metadata/handoff seam), with post-repair runtime reconciliation captured by `4a554e1`.
- PASS. The implementation stays within the requested boundary: business logic lives in `packages/core-data/`, requests go only to `/sync/pull` and `/sync/push`, and the driver appends only `Accept-Version: sync.protocol=1` while consuming an injected `Authorization` + `X-Device-Id` seam.
- PASS. Local verification commands completed cleanly: `pnpm --filter @repo/core-data check-types`; `pnpm --filter @repo/core-data test` (93 passed).
- BLOCKED. `packages/web-sync-blob-driver/docs/design.md` still records Phase 3 as `b72b234`, `4ac3e24`, even though `4ac3e24` is explicitly superseded by the repaired chain.
- BLOCKED. `packages/web-sync-blob-driver/docs/api.md` still lists `4ac3e24` as post-phase drift evidence in the current tree, so the docs do not yet match the authoritative commit chain recorded in this dev log.
- REPAIRED (docs-only, 2026-05-22 01:03 PDT). `design.md` and `api.md` now treat `4ac3e24` as superseded history only and use the authoritative active evidence chain `5638003`, `4a554e1`, `321f469`, `530d239`, `d74aa2e`.

Authoritative post-repair chain for the next independent verify pass:

- phase runtime commits: `7a26f5d` -> `d653181` -> `b72b234`
- review artifacts split from runtime drift repair: `5638003` (review docs), `4a554e1` (runtime drift repair)
- docs/state chain: `321f469` (runtime-doc reconciliation), `530d239` (verify-ready state), `d74aa2e` (verify repair record)
- `4ac3e24` is superseded by the split commits above and is no longer authoritative for current verification scope

## Residual Risks

- `@repo/core-data` remains `In-Dev`, so downstream Web rows should continue mock-first discipline until broader row promotion and browser/runtime acceptance happen.
- Real browser crypto/runtime validation and real Supabase device/session middleware remain upstream gates outside this row.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 23:56 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh plan: created the canonical feature brief and discovery review, initialized `packages/web-sync-blob-driver/docs/`, and froze the conservative boundary where workflow docs live under the feature package but the runtime driver lands in `packages/core-data/` with injected auth/crypto seams, local mirror semantics, and explicit `401/403/409/426/429` handling. | — | feature-review |
| 2026-05-22 00:01 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass: boundary, repository-contract parity plan, and mock-first transport strategy are sound, but returned the plan for revision because the feature docs preserved a non-canonical extra version header while the shipped Sync preflight contract requires `Accept-Version: sync.protocol=1` as the canonical `/sync/*` version header. | — | feature-plan |
| 2026-05-22 00:03 PDT | feature-review (Codex gpt-5.3-codex inline) | Review refresh: re-checked the feature docs against `web-auth-device-session`, Sync preflight, and the sync PRD, and kept the plan in revision because the canonical `/sync/*` header rule was still unresolved and the generated plan artifacts had not fully converged on the preflight contract. | — | feature-plan |
| 2026-05-22 00:06 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revision pass: attempted to reconcile the `/sync/*` version-header rule, but the generated plan artifacts still preserved a non-canonical additive version-header assumption and needed another correction before review could pass. | — | feature-review |
| 2026-05-22 00:09 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass: re-checked the revised docs against Sync preflight, the sync PRD, and the requested review gate, and returned the plan for another revision because discovery/design/api still treated an upstream extra version header as part of this feature's `/sync/*` transport contract instead of leaving `Accept-Version: sync.protocol=1` as canonical. | — | feature-plan |
| 2026-05-22 00:13 PDT | feature-plan (Codex gpt-5.3-codex inline) | Second revision pass: aligned the active planning artifacts to the canonical `/sync/*` request contract `Authorization` + `X-Device-Id` + `Accept-Version: sync.protocol=1`, removed the extra version-header requirement from generated build-gating docs, and preserved roadmap-seed plus review/drift references for follow-up cleanup context. | — | feature-review |
| 2026-05-22 00:18 PDT | feature-review (Codex gpt-5.3-codex inline) | Approval pass: confirmed discovery/design/api/test/dev_log consistently treat `Accept-Version: sync.protocol=1` as the sole canonical `/sync/*` version header for this feature, keep `Authorization` + `X-Device-Id` in the injected fetch seam, preserve `version_required` vs `426` semantics, and maintain the conservative `@repo/core-data`-only driver scope. | — | feature-build |
| 2026-05-22 00:20 PDT | feature-review (Codex gpt-5.3-codex inline) | Final review pass after the requested header-contract revision: verified the generated plan artifacts against the upstream preflight/auth/PRD/core-data sources, confirmed `X-Sync-Version` is absent from active build-gating requirements, and kept the row APPROVED for `feature-build`. | — | feature-build |
| 2026-05-22 00:46 PDT | feature-auto-build (Codex gpt-5.3-codex inline fallback) | Reconciled the approved phase plan against the existing `@repo/core-data` implementation already present on `main`. Phase 1 maps to `7a26f5d`, Phase 2 maps to `d653181`, Phase 3 maps to `b72b234`. Updated `design.md`, `api.md`, `test.md`, and this dev log so the feature docs match the actual `deviceId` seam, explicit `pull()` / `pushPending()` / `syncState()` runtime shape, and current verification surface. Validation run: `pnpm --filter @repo/core-data check-types`; `pnpm --filter @repo/core-data test` (93 passed). | `321f469` | feature-verify |
| 2026-05-22 00:46 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verification PASS. Reviewed runtime commits `7a26f5d`, `d653181`, `b72b234` against the approved docs, then re-ran `pnpm --filter @repo/core-data check-types` and `pnpm --filter @repo/core-data test` (93 passed). The driver remains inside `packages/core-data/`, never hits business-table CRUD, and preserves the canonical `/sync/*` contract `Authorization` + `X-Device-Id` + `Accept-Version: sync.protocol=1`. | `321f469`; reviewed runtime commits `7a26f5d`, `d653181`, `b72b234` | ship |
| 2026-05-22 00:51 PDT | feature-build (Codex gpt-5.3-codex inline) | Verify-repair pass for BLOCKED feedback: replaced mixed commit `4ac3e24` with single-intent commits for review docs and runtime hardening, then re-ran `pnpm --filter @repo/core-data test` and `pnpm --filter @repo/core-data check-types` (pass). | `5638003`, `4a554e1` | feature-verify |
| 2026-05-22 00:55 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Workflow-state reconciliation pass for feature-dev-loop blocker: kept Status Panel at `READY_FOR_VERIFY` / `FEATURE_VERIFY`, made the authoritative post-repair commit chain explicit (`7a26f5d`, `d653181`, `b72b234`, `5638003`, `4a554e1`, `321f469`, `530d239`, `d74aa2e`), and marked `4ac3e24` as superseded for current verification scope. | docs(web-sync-blob-driver): reconcile verify-state commit chain | feature-verify |
| 2026-05-22 01:01 PDT | feature-verify (Codex gpt-5.4 inline) | Verification BLOCKED. Re-reviewed the authoritative commit chain (`7a26f5d`, `d653181`, `b72b234`, `5638003`, `4a554e1`, `321f469`, `530d239`, `d74aa2e`, `51d5b5b`) and re-ran `pnpm --filter @repo/core-data check-types` plus `pnpm --filter @repo/core-data test` (93 passed). Runtime behavior is ready, but docs traceability is still wrong because `design.md` and `api.md` continue to cite superseded commit `4ac3e24` as active evidence. | — | feature-build |
| 2026-05-22 01:03 PDT | feature-build (Codex gpt-5.3-codex inline) | Narrow docs-only verify repair: replaced active-evidence references to superseded `4ac3e24` in `design.md` and `api.md` with the authoritative split chain (`5638003`, `4a554e1`, `321f469`, `530d239`, `d74aa2e`), and restored Status Panel to `READY_FOR_VERIFY` / `FEATURE_VERIFY` for an independent verify rerun. | pending commit | feature-verify |
