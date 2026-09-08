# Supabase Sync Tests

These tests use two layers.

## Smoke Layer

The smoke layer runs by default in CI and local `pnpm --filter web test:*` commands. It exercises the in-memory JS mocks and checks that the expected SQL migration files are present and parseable for local review.

## Integration Layer

The integration layer is gated by `SUPABASE_INTEGRATION_TESTS=1`. It starts a local Docker Postgres container, applies the Supabase migrations in order, and verifies the real SQL, RLS, RPC, nonce, rekey, and audit-log behavior through `psql`.

Run these locally with Docker available:

```sh
pnpm --filter web test:audit:integration
pnpm --filter web test:nonce:integration
pnpm --filter web test:rekey:integration
pnpm --filter web test:rls:integration
pnpm --filter web test:rls-fuzz:integration
```

CI runs the smoke layer by default. The integration layer runs in the G9 nightly job.
