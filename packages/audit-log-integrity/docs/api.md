# audit-log-integrity — API

## SQL Functions

```sql
fn_append_sync_audit_log(
  p_account_id uuid,
  p_event_type text,
  p_device_id uuid default null,
  p_commit_seq bigint default null,
  p_entity_type sync_entity_type default null,
  p_entity_id text default null,
  p_mutation_id uuid default null,
  p_payload jsonb default '{}'::jsonb
) returns table(entry_count bigint, last_hash bytea, entry_hash bytea)
```

```sql
fn_sync_audit_summary(p_account_id uuid)
returns table(entry_count bigint, last_hash bytea)
```

## plugin-account exports

```ts
createAuditMirror(driver, options?): AuditMirror
SyncAuditMismatchError
```

`AuditMirror.assertConsistent(serverSummary)` updates the local mirror on first
observation or exact match, and throws `E3025` on count/last-hash mismatch.
