# commit-seq-authority — Test Strategy

## Local Verification

Using a throwaway `postgres:16-alpine` Docker container:

- Apply migrations `20260519000001` through `20260519000005`.
- Insert a minimal account row.
- Sequentially call `fn_alloc_commit_seq` three times; observed `1,2,3`.
- Assert `has_function_privilege('public', 'fn_alloc_commit_seq(uuid)', 'execute') = false`.
- Force the sequence below the account cursor with `setval`; next call raises the regression exception.
- Run ten parallel same-account calls; sorted observed values were `1,2,3,4,5,6,7,8,9,10`.

## Static Checks

- Migration contains no `hashtext` usage.
- Migration no longer uses invalid `pg_advisory_xact_lock(bigint,bigint)`.
- Function keeps `SECURITY DEFINER`, `SET search_path = public`, and `REVOKE ALL ... FROM PUBLIC`.

## Deferred Gates

- Supabase staging/prod deployment.
- Edge Function transaction integration.
- Client pull rollback monitor integration.
