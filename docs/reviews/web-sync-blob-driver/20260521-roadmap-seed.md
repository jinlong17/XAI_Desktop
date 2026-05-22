# Roadmap Seed — web-sync-blob-driver

> web-ticktick-parity roadmap · feature #8 · wave W4 · core-data driver
> Source PRD: docs/planning/sub-prds/web/PRD.md §5.2, §8.1 · dev-plan Week 2
> Status hint: PENDING

## Requirement

Implement `@repo/core-data` `driver-sync-blob` for Web. It must satisfy the same `Repository<T>` contract as the SQLite driver while internally using `/sync/pull`, `/sync/push`, device-aware RPCs, encrypted blob envelopes, idempotent mutation ids, retries, and local mock transports.

## Hard constraints

- No PostgREST business-table CRUD such as `/rest/v1/todos`; all business entities travel as encrypted blob envelopes.
- Contract tests must run against both the Sync blob driver and existing SQLite/in-memory driver surfaces where applicable.
- All requests include `X-Device-Id` and `X-Sync-Version`; 401/403/409/426/429 paths are handled explicitly.

## Acceptance signal

Repository contract tests pass for Sync blob driver locally, network mocks prove no business-table CRUD occurs, and Todo can later persist through encrypted `/sync/*` flows.

## Dependencies (advisory — manifest is authoritative)

Depends On: web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell, web-browser-e2e-crypto-runtime.
