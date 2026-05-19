# commit-seq-authority — Design Snapshot

## Scope

- Feature: `commit-seq-authority` (#23)
- SQL surface: `apps/web/supabase/migrations/20260519000005_commit_seq_rpc.sql`
- Status: migration fixed and locally verified; live Supabase deploy deferred

## Authority

`account_commit_seq_global` is the only global ordering source. `fn_alloc_commit_seq(p_account_id UUID)` allocates from that global sequence and advances `accounts.current_account_commit_seq` only when the new value is greater than the account's current value.

Client timestamps remain display-only. JSON transport of BIGINT values remains a downstream API concern.

## Advisory Lock

The function is `SECURITY DEFINER` with `SET search_path = public` and `REVOKE ALL ... FROM PUBLIC`.

The per-account lock now strips UUID hyphens, derives the high and low 64-bit halves, sorts them, and acquires two single-`bigint` transaction-scoped advisory locks. This preserves the H-13 UUID hi/lo intent without using the invalid `pg_advisory_xact_lock(bigint,bigint)` signature or a 32-bit text hash.

## Regression Guard

The critical guard is:

```sql
UPDATE accounts
  SET current_account_commit_seq = v_new_seq
  WHERE id = p_account_id
    AND current_account_commit_seq < v_new_seq;
IF NOT FOUND THEN
  RAISE EXCEPTION 'account % not found or commit_seq regression', p_account_id;
END IF;
```

## Deferred Runtime Gates

- Supabase staging/prod deployment.
- `/sync/push` Edge Function service_role call inside a `REPEATABLE READ` transaction.
- Pull response `current_account_commit_seq` JSON string contract and client rollback monitor integration.
