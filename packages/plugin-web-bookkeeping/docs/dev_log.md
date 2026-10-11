# Bookkeeping Dev Log

## Current REL-05 status

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-bookkeeping-save-recovery |
| Module | web |
| Status | FIX_READY_FOR_VERIFY |
| Current Phase | BUG_FIX |
| Executor | Codex bug-fix (Bookkeeping owner) |
| Updated | 2026-09-09 |
| Suggested Next | Independent bug-verify |
| Verify Cross-vendor | Not performed; no PASS claimed |

Canonical write errors now propagate before mirror writes. Explicit partial outcomes distinguish committed records from failed device settings. Pending snapshots, retained editor fields and account-bound retry/export/discard replace false success. Original diagnosis/probes are preserved in `docs/reviews/web-storage-write-results/`.

## Previous baseline (2026-06-02)

Status: READY_TO_REVIEW
Suggested Next: Review, merge to `web`, then decide whether to dispatch D3 Web-to-App parity.
Updated: 2026-06-02

## Notes

- Implemented the Cloud Design bookkeeping module as `@repo/plugin-web-bookkeeping`.
- Added a formal Web route and rail registration at `/app/bookkeeping`.
- Added local persistence with Cloud Design keys and a sync-ready adapter contract.
- Implemented ledgers, accounts, transactions, categories, recurring rules, investments, budgets, assets, statistics, calendar, search/filter, and CSV import/export.
- Current sync status is `device-local`; no account-sync line is unpaused or claimed.
- Fixed dev/StrictMode duplicate save behavior by moving persistence out of React updater side effects and making transaction upsert idempotent by id.

## Verification

- `pnpm --filter @repo/plugin-web-bookkeeping lint`
- `pnpm --filter @repo/plugin-web-bookkeeping check-types`
- `pnpm --filter @repo/plugin-web-bookkeeping test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/xai-web-shell check-types`
- `pnpm --filter @repo/plugin-web-tokens check-types`
- `pnpm --filter @repo/web test src/routes/modules/__tests__/shellRegistrations.integration.test.tsx`
- `pnpm --filter @repo/web test src/routes/__tests__/router-modules.integration.test.tsx`
- `pnpm --filter @repo/web test src/routes/modules/__tests__/railFeatureFilter.test.tsx`
- `pnpm --filter @repo/web exec eslint --max-warnings 0 src/routes/modules/shellRegistrations.tsx src/routes/modules/__tests__/shellRegistrations.integration.test.tsx src/routes/__tests__/router-modules.integration.test.tsx`
- `pnpm --filter @repo/web build`
- Browser smoke via Python Playwright against `http://localhost:3001/app/bookkeeping`: 8 tabs rendered; one expense record saved exactly once; record survived reload; 390px viewport had no horizontal overflow.

Known environment note: full `pnpm --filter @repo/web lint` is currently blocked by an existing restricted-import warning in `apps/web/src/App.tsx`, unrelated to this bookkeeping change.

## 2026-09-09 — REL-05 implementation

- Preserved canonical bytes/device state on rejected canonical writes and separated committed state from pending work.
- Added explicit device-partial results, immutable retry intent and raw-baseline conflict refusal; retries do not recreate financial transactions.
- Added a focused recovery surface and guarded all editor closure paths, including CSV import and budget blur.
- Existing independent component/native probes rerun without edits and pass in the combined workspace; owner suite and lint/type checks recorded in review receipt. Pending independent verification is not a release approval.
- Drafts are held in current mount memory. Closing/reloading/navigating away is outside this patch's recovery guarantee; the UI offers export and instructs keeping the page open.
