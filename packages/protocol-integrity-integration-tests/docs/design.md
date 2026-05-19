# protocol-integrity-integration-tests — Design

Feature #31 adds local regression coverage for the Phase 4.8 protocol-integrity
gate.

## Implemented Coverage

- Blob-swap rejection is covered by an AES-GCM test that decrypts ciphertext
  only with AAD bound to the expected account/entity/revision/key position.
- Revision rollback rejection is covered through `applyServerRecords()`, which
  rejects an older server revision as `E3015` before the applier runs.
- Recovery-proof enforcement is covered through the recovery Edge handler:
  `PATCH /auth/me` without proof returns HTTP 401 and `E3014`.
- Mutation idempotency is covered through the sync-push core: resending the same
  `mutation_id` 10 times creates exactly one stored revision and nine duplicate
  responses.
- Tauri capability allowlist enforcement remains covered by the Rust
  `rejects_non_allowlisted_window` command test under the `crypto` feature.

## Boundaries

- Tests run against local seams and in-memory databases.
- Hosted Supabase deployment and malicious plugin/window runtime verification
  are deferred until external provisioning/runtime gates are available.
- Crypto vectors remain scoped to `rfc-test-vectors-gate` (#35).
