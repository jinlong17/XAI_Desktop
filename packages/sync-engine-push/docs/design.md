# sync-engine-push Design

## Scope

Feature #26 implements the client PUSH path seam in `@repo/plugin-account`.
It does not implement the `/sync/push` Edge Function or pull/reconcile logic.

## Flow

1. `createSyncOutbox().enqueue()` stores plaintext payload bytes and metadata.
2. Repeated edits to the same `(entity_type, entity_id)` replace the prior
   entry, preserving only the latest plaintext and latest mutation_id.
3. `pushBatch()` reads `base_revision` from the injected revision reader.
4. The client computes `proposed_revision = base_revision + 1`.
5. `pushBatch()` calls the injected crypto seam `encryptFor()` with
   `entityType`, `entityId`, `proposedRevision`, and plaintext.
6. Rust-side `crypto_encrypt_for` remains responsible for CBOR AAD and DEK
   access; JS never builds AAD and never sees DEK material.
7. The encrypted records are sent as one request through the push transport.

## Boundary

The exported HTTP transport posts JSON to `/sync/push` with bearer auth. Tests
mock this transport; live Supabase Edge Function behavior is owned by #28.
