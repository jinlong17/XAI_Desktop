# Roadmap Seed — offline-outbox-resilience

> sync-v1 roadmap · feature #40 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-30, T-31, T-32, T-33, T-34, T-56
> Status hint: PENDING

## Requirement
Build the offline write path: every mutation writes the entity table and `sync_outbox` in the same SQLite transaction; on reconnect, replay in commit-seq order with entity-DAG topological merge, squash repeated edits of the same entity, flush on network-reachability change, exponential backoff, and dead-letter surfacing.

## Hard constraints
- Atomic txn: `BEGIN IMMEDIATE; -- entity table -- sync_outbox -- COMMIT;` — crash mid-state (data without outbox row) MUST never occur (FR-SY-32 / M-12).
- DAG replay: parent-delete waits for all child-deletes merged; label-delete cascades label_assignments tombstone first; no cross-dependency merge (FR-SY-34 / H-06 / P-01).
- Outbox stores plaintext + metadata, NOT pre-encrypted ciphertext; flush is one-shot lazy encrypt (read base_revision → proposed=base+1 → CBOR AAD → encrypt within active nonce lease → single POST); two-phase reservation forbidden (FR-SY-78 / C-F).
- Backoff 1s…60s ×jitter 0.5–1.5 (FR-SY-47); ≥10 4xx retries → dead_letter + UI (FR-SY-48); 5xx 5min → degrade notice (FR-SY-49); reachability via Rust `SCNetworkReachability` (FR-SY-36).
- Code boundary: outbox + flush engine in `packages/plugin-account/`; SQLite repo in `packages/core-data/`; reachability via Rust command (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T9 (stale device returns) — offline queue vs server resolved by commit_seq; loser → conflict shadow 30 days (FR-SY-71), no silent loss.
- PRD §11 R-10.3 (distributed write conflict data loss) — conditional write + DAG topological merge.

## Acceptance signal
PRD §10.2: offline 1h + 200 mutations → on reconnect outbox fully flushes and converges with the other device, including cross-entity dependency case (create label → assign → delete label, DAG order correct, H-06); weak-net (toxiproxy 500ms / 10% loss) sync still P95 < 10s.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate. Blocked by #37 Phase 4.8 → Phase 5 gate.
