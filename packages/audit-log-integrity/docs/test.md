# audit-log-integrity — Test

Focused checks run during the autorun:

```bash
pnpm --filter web test:audit
pnpm --filter @repo/plugin-account test -- tests/audit-log.test.ts
pnpm --filter @repo/plugin-account check-types
pnpm --filter @repo/plugin-account test
pnpm --filter web check-types
```

Coverage:

- Server append function increments count and changes last hash.
- Device ID is stored only as a 32-byte HMAC hash.
- UPDATE and DELETE on `sync_audit_log` are rejected by triggers.
- Client mirror accepts matching count/last-hash.
- Client mirror throws `SyncAuditMismatchError` (`E3025`) on mismatch and does
  not overwrite the last known-good local summary.

Deferred:

- Live Supabase deploy and service_role integration.
- Independent cross-vendor security review.
- Runtime UI severe alert + sync pause wiring.
