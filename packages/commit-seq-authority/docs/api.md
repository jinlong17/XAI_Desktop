# commit-seq-authority — API Contract

## SQL Objects

- `account_commit_seq_global`: global `SEQUENCE`.
- `fn_alloc_commit_seq(p_account_id UUID) RETURNS BIGINT`.

## Function Contract

```sql
SELECT fn_alloc_commit_seq('<account_uuid>');
```

Returns a new `BIGINT` commit sequence that is strictly greater than `accounts.current_account_commit_seq` for the account at update time.

## Security Contract

- `LANGUAGE plpgsql`
- `SECURITY DEFINER`
- `SET search_path = public`
- `REVOKE ALL ON FUNCTION fn_alloc_commit_seq(UUID) FROM PUBLIC`

The intended caller is the `/sync/push` Edge Function using `service_role`, inside a `REPEATABLE READ` transaction.

## Error Contract

If the account does not exist or the global sequence returns a value not greater than `accounts.current_account_commit_seq`, the function raises:

```text
account <uuid> not found or commit_seq regression
```
