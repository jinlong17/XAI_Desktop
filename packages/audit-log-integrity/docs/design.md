# audit-log-integrity — Design

Feature #36 implements GAP-T1 / R-10.26 audit integrity.

## Server

- Migration: `apps/web/supabase/migrations/20260519000009_audit_log_integrity.sql`
- Adds `sync_audit_account_state` as an account-level summary table.
- Extends the existing `sync_audit_log` table with:
  - `event_type`
  - HMAC `device_hash`
  - `commit_seq`
  - `entity_id`
  - `mutation_id`
  - `payload_hash`
  - `prev_hash`
  - `entry_hash`
- Adds append-only triggers that reject UPDATE and DELETE.
- Adds `fn_append_sync_audit_log()` and `fn_sync_audit_summary()`.

## Client

- `packages/plugin-account/src/audit-log.ts` stores local account summaries in
  `sync_audit_mirror`.
- `assertConsistent()` compares server count/last-hash with the local mirror.
- Mismatch raises `SyncAuditMismatchError` (`E3025`) and leaves the local mirror
  unchanged so the caller can pause sync and surface a severe alert.

## Out of Scope

Full Merkle/hash-chain proof remains v2 per the seed constraints.
