# rls-policies-and-tests Test Notes

## Local Verification

Run:

```bash
pnpm --filter web test:rls
pnpm --filter web check-types
```

The Vitest harness starts a temporary `postgres:16-alpine` Docker container,
creates local-only `auth` and `realtime` shims, applies Supabase migrations
`20260519000001` through `20260519000007`, grants test roles, seeds two
accounts with active/revoked/pending devices, and executes RLS queries under
`authenticated` and `anon` roles.

## Deferred

Live Supabase/PostgREST verification remains deferred until
`supabase-project-provisioning` (#9) is unblocked. The Docker harness proves
the SQL/RLS behavior but is not a hosted Supabase deployment.
