# rls-fuzz-property — Test Report

## 2026-05-19 Local Autorun

Passed:

- `pnpm --filter web test:rls-fuzz`
- `pnpm --filter web check-types`
- `pnpm install --frozen-lockfile`

Coverage:

- 1000 accounts.
- 100 devices per account.
- 100,000 total device rows.
- Randomized fast-check access attempts over actor account, actor device, and
  target account.
- Cross-tenant leak count: 0.
- Revoked/pending active-gated table leak count: 0.

Warnings:

- `pnpm add` repeated existing Next deprecation and React peer warnings.
- `next typegen` repeated the existing `baseline-browser-mapping` data-age warning.

## Deferred Verification

- Human review and cross-vendor verify.
- Hosted Supabase/PostgREST or `@supabase/supabase-js` API-level property run.
