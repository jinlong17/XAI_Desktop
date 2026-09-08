# Supabase Sync Tests

Last verified against repository configuration: 2026-09-08.

These tests belong to the archive package **@repo/release-site-archive**,
not the active Web package. The source location is historical; migrating its
ownership/configuration is a prerequisite tracked in [the production plan](../../../../docs/DEPLOYMENT.md).

## Smoke Layer

The package's test scripts exercise in-memory mocks and inspect migration
fixtures. Their presence does not establish that a deployed Supabase instance
has the same schema or that the application is running with live auth.

## Integration Layer

The integration scripts set SUPABASE_INTEGRATION_TESTS=1 and use a local Docker
Postgres container. They apply migrations and verify SQL, RLS, RPC, nonce,
rekey, and audit behavior through psql.

With dependencies installed and Docker available:

~~~sh
pnpm --filter @repo/release-site-archive test:audit:integration
pnpm --filter @repo/release-site-archive test:nonce:integration
pnpm --filter @repo/release-site-archive test:rekey:integration
pnpm --filter @repo/release-site-archive test:rls:integration
pnpm --filter @repo/release-site-archive test:rls-fuzz:integration
~~~

The checked-in GitHub workflows currently do **not** run these scripts or
contain a G9 nightly job. Adding PR migration/RLS gates and a scheduled integration
run is pending work. Do not report them as CI coverage until a workflow and
successful run receipt exist.

These tests are not a substitute for staging Auth/OAuth, Edge Function routing,
CORS, device RPC, account deletion, storage cleanup, or two-device recovery
tests. See [the Supabase runbook](../../../../docs/runbooks/supabase.md).
