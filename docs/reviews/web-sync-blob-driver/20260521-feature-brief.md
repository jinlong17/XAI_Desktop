# Feature Brief — web-sync-blob-driver

| 字段 | 值 |
|---|---|
| Feature Slug | `web-sync-blob-driver` |
| 创建日期 | 2026-05-21 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-sync-blob-driver/20260521-roadmap-seed.md` |
| 关联文档 | `docs/workflow/roadmap/web-ticktick-parity.md`、`packages/core-data/src/{types.ts,testing.ts}`、`packages/core-data/tests/repository-contract.ts`、`packages/web-sync-crypto-contract-preflight/docs/{design.md,api.md}`、`packages/web-browser-e2e-crypto-runtime/docs/api.md`、`packages/web-auth-device-session/docs/api.md`、`docs/planning/sub-prds/sync/{PRD.md,dev-plan.md}` |

---

## Structured Brief

### Feature Title

W4 Web Sync blob driver for `@repo/core-data`

### Canonical Name And Rationale

- Canonical slug: `web-sync-blob-driver`
- Package docs anchor: `packages/web-sync-blob-driver/docs/`
- Why this name fits:
  - the roadmap row already uses it
  - the feature is Web-only
  - the runtime responsibility is a Sync blob-backed data driver, not a general Sync engine rewrite

### Problem / Motivation

`@repo/core-data` already has in-memory, SQLite, and Tauri-SQLite `Repo<T>` surfaces, but Web still has no driver that can speak the shipped encrypted Sync contract without falling back to forbidden business-table CRUD.

That leaves a hard gap between the shipped browser auth/crypto rows and the later Web product rows:

1. `web-auth-device-session` can produce authenticated, device-bound requests.
2. `web-browser-e2e-crypto-runtime` can unlock DEK state and encrypt/decrypt envelopes.
3. Nothing in `@repo/core-data` can yet expose those pieces as a `Repository<T>` over `/sync/pull` and `/sync/push`.

Without this row, later Web rows either bypass `@repo/core-data`, invent browser-only repository contracts, or talk directly to business tables such as `/rest/v1/todos`, which the seed explicitly forbids.

### Desired Outcome

Plan a conservative Web Sync blob driver that:

- keeps the public repository contract inside `@repo/core-data`
- uses encrypted blob envelopes only
- consumes injected device-bound fetch and browser crypto seams rather than importing app-shell logic
- passes the existing repository contract suite wherever the remote transport model allows it
- makes retries, idempotency, conflict/status handling, and mock transports explicit before implementation starts

### Scope

- Define the canonical boundary between `packages/web-sync-blob-driver/docs/` and runtime code that will later land in `packages/core-data/`.
- Freeze the injected transport/crypto/header seams that connect `@repo/core-data` to `web-auth-device-session` and `web-browser-e2e-crypto-runtime`.
- Define Sync pull/push request/response handling, encrypted envelope usage, revision/mutation metadata, retry rules, and typed error semantics.
- Define contract-test expectations against `packages/core-data/tests/repository-contract.ts`.
- Initialize `design.md`, `api.md`, `test.md`, and `dev_log.md` for this feature.

### Non-goals

- No production code in this run.
- No IndexedDB persistence layer yet; that belongs to `web-encrypted-indexeddb-cache`.
- No `apps/web` business logic or provider wiring.
- No Supabase business-table CRUD such as `/rest/v1/todos`.
- No redefinition of browser auth/session or browser crypto runtime contracts already frozen upstream.

### Constraints

- Runtime implementation must satisfy the same `Repository<T>` contract as existing drivers where applicable.
- All business entities must travel as encrypted blob envelopes over `/sync/pull` and `/sync/push`.
- The canonical `/sync/*` request contract for this feature is exactly:
  - `Authorization`
  - `X-Device-Id`
  - `Accept-Version: sync.protocol=1`
- `401` / `403` / `409` / `426` / `429` paths must be handled explicitly.
- Browser app-shell logic must stay outside `@repo/core-data`; the driver must consume injected seams.
- `@repo/core-data` is still `In-Dev` per `docs/PLUGIN_MAP.md`, so downstream feature rows must keep mock-first discipline until this row and core-data are promoted by later workflow stages.

### Acceptance Criteria

1. `docs/reviews/web-sync-blob-driver/20260521-discovery-review.md` records the boundary decision, tradeoffs, recommendation, risks, and mock strategy.
2. `packages/web-sync-blob-driver/docs/{design,api,test,dev_log}.md` exist and agree on one implementation shape.
3. `api.md` freezes the injected transport/crypto contracts, the canonical `/sync/*` request contract `Authorization` + `X-Device-Id` + `Accept-Version: sync.protocol=1`, envelope mapping, mutation-id/revision semantics, and explicit handling for `401/403/409/426/429` plus missing-version protocol failures.
4. `test.md` defines contract coverage against the existing repository contract suite plus Sync-transport mocks that prove no business-table CRUD occurs.
5. `dev_log.md` ends with `Status = NEEDS_REVIEW` and `Suggested Next = feature-review`.

### Open Questions

1. Whether the first build phase should add a dedicated `createSyncBlobRepo()` export to `packages/core-data/src/index.ts`, or land the implementation behind a narrower internal module until tests settle.
2. How much of `/sync/pull` snapshot state should live in a process-local mirror before the later IndexedDB cache row lands.
3. Whether `Repo.delete(id)` maps to hard-delete only at the repository layer, leaving soft-delete semantics to business-record payload updates.

### Planner Handoff

- Recommended direction: treat `packages/web-sync-blob-driver/docs/` as the workflow anchor package, but keep the actual runtime code conservative inside `packages/core-data/`, following the `core-data-sqlite-driver` precedent.
- Key review focus: injected seam design, `Repository<T>` parity expectations, explicit conflict/retry behavior, and whether the planned in-memory mirror is sufficient before the IndexedDB cache row.
- Expected next output: discovery review + docs four-pack in `NEEDS_REVIEW`, ready for `feature-review`.
