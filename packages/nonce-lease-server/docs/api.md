# nonce-lease-server API

## RPC

```sql
fn_grant_nonce_lease(
  p_account_id uuid,
  p_key_id integer,
  p_count integer
) returns table (
  encryption_device_id bigint,
  lease_start bigint,
  lease_end bigint
)
```

Only `authenticated` can execute the RPC. `PUBLIC` is revoked.

## Error Semantics

- `nonce_lease_not_owned`: caller account/device is absent, mismatched,
  revoked, or pending
- `nonce_lease_count_invalid`: requested count is missing or non-positive
- `nonce_lease_key_not_active`: key_id is not active/staging for the account
- `nonce_lease_exhausted`: requested range reaches the `0xFFFFFF00` re-key
  threshold
- `used_nonces` primary-key violation: duplicate nonce tuple, mapped by
  downstream Edge Functions to E3027
- `used_nonces_append_only`: attempted update/delete of the nonce ledger

## Test Command

```bash
pnpm --filter web test:nonce
```
