# push-edge-function Design

## Scope

Feature #28 authors the `/sync/push` Edge Function core contract under
`apps/web/supabase/functions/sync-push/`.

The live Supabase service_role database adapter and deployment are deferred
until Supabase provisioning (#9). The core handler is isolated so the adapter
can bind real DB operations without changing protocol logic.

## Per-record Flow

For each record:

1. Check `mutation_dedup` first. A duplicate mutation returns
   `duplicate_mutation_id` with the stored result and allocates no new
   revision/commit sequence.
2. Read current `encrypted_blobs` state for `(account_id, entity_type,
   entity_id)`.
3. Validate `base_revision == current_revision` and
   `proposed_revision == base_revision + 1`.
4. On mismatch, return `revision_mismatch` and write incoming loser metadata
   to conflict shadow when a current winner exists.
5. On success, allocate `commit_seq`, parse envelope metadata into server
   columns, upsert the blob, and store the per-record result in
   `mutation_dedup`.

The batch response is always a 207-style per-record response and can contain
mixed statuses.

## Boundary

The core does not parse or construct AAD. It only parses envelope metadata
needed by server columns (`key_id`, `encryption_device_id`, `counter`) and
preserves the submitted envelope bytes.
