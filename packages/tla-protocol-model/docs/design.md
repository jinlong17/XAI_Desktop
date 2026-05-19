# tla-protocol-model — Design

Feature #33 adds the Phase 4.8 TLA+ protocol model.

## Artifacts

- `docs/spec/sync.tla`
- `docs/spec/sync.cfg`
- `docs/spec/sync-model-check.md`

## Model Scope

The finite model bounds devices, mutation IDs, and `account_commit_seq`. It
tracks active/revoked/joined devices, DEK possession, key epochs, pending
offline mutations, applied mutation IDs, conflict shadow entries, and recovery
state.

The six mandatory scenarios are represented as explicit actions:

- device revocation
- new-device join
- concurrent Re-key
- offline replay
- full recovery
- duplicate mutation

## Limitation

The model treats `account_commit_seq` as one honest global counter. Server
equivocation remains a documented limitation, not a proven property.
