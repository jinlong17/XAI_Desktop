# Roadmap Seed — sync-engine-push

> sync-v1 roadmap · feature #26 · wave W2 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-31 pattern (engine pushBatch)
> Status hint: PENDING

## Requirement
Implement the client sync engine PUSH path: `pushBatch` builds per-record requests with `entity_id`, `mutation_id` (UUIDv7), `base_revision`, `proposed_revision = base_revision + 1`, lazy-encrypts at flush via the Rust `crypto_encrypt_for` command (Rust builds the CBOR AAD), and does a single one-shot `POST /sync/push` carrying the full envelope (FR-SY-15/72/78, C-E/C-F).

## Hard constraints
- One-shot push only: client reads `base_revision = entity_state.max_seen_revision`, computes `proposed_revision = base+1`, builds CBOR AAD with proposed_revision, encrypts, single POST; **two-phase reservation forbidden** (FR-SY-78 C-F — "server returns proposed_revision then encrypt" is dead).
- `proposed_revision` is client-submitted and server-validated, NEVER server-rewritten; AAD uses proposed_revision so server-not-changing-revision keeps AAD consistent → decrypt passes (FR-SY-15 C-E).
- Outbox stores plaintext payload + metadata, NOT pre-encrypted ciphertext; same-entity multiple edits squash to latest plaintext + latest mutation_id; encrypt happens only at flush with the correct proposed_revision (FR-SY-78 C-F).
- AAD is computed by Rust KeyVault (`crypto_encrypt_for`), never in JS; DEK never crosses the JS boundary (FR-SY-75/10).
- Code boundary: engine in `packages/plugin-account/` (or `packages/core-data/` sync adapter); Tauri invoke only via `@repo/core/hooks` `useTauriInvoke`, never `@tauri-apps/api` directly (red line #4, codebase-orientation §4/§6).

## Threat model binding
- FR-SY-72 (mutation idempotency, network jitter/retry); R-10.3 (distributed write conflict data loss); R-10.13 (protocol defect — base_revision/proposed_revision must be in protocol).
- STRIDE Tampering (stride-cve.md §2.1 T1.1 revision/AAD chain).

## Acceptance signal
`sync/engine` unit tests: pushBatch sends proposed_revision = base+1, server-side revision_mismatch path returns the C-E protocol error, squash collapses N same-entity edits to 1 plaintext+latest mutation_id (dev-plan §5.1 sync/engine ≥80%).

## Dependencies (advisory — manifest is authoritative)
Depends On: crypto-tauri-commands, core-data-sqlite-driver (both shipped).
