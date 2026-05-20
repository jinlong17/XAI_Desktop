# Roadmap Seed — sync-engine-pull

> sync-v1 roadmap · feature #27 · wave W2 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-31 pattern (engine pull) · §7.4
> Status hint: PENDING

## Requirement
Implement the client sync engine PULL path: a single global `account_commit_seq_cursor` BIGINT (no entity_type param), `GET /sync/pull?since_commit_seq=&limit=`, `applyServerRecords` routing by `entity_type`, and the FR-SY-68 H-6 four-way classification distinguishing idempotent-duplicate vs legit-re-encrypt vs true-rollback.

## Hard constraints
- Single global account-level cursor, NOT per-entity_type (FR-SY-16 H-7); PullRecord MUST carry `entity_type`; client routes to the matching table.
- FR-SY-68 H-6 classification by `(entity_id, revision, commit_seq, blob_hash)`: ① revision==max_seen AND blob_hash==last → idempotent (ignore); ② revision==max_seen AND key_id changed AND commit_seq>local last → legit re-encrypt (update entity_state.last_key_id); ③ revision<max_seen OR (==max_seen AND blob_hash≠last AND commit_seq<last) → true rollback → reject + E3015 alert.
- Client MUST verify `current_account_commit_seq >= sync_state.last_seen_account_commit_seq`, else E3024 account-rollback severe alert + pause sync (FR-SY-77, PRD §7.4).
- BIGINT crosses JSON as string (v0.4 H-8); `entity_state(entity_id, max_seen_revision, last_blob_hash, last_commit_seq, last_key_id)` is the client classification table (FR-SY-68).
- Code boundary: engine in `packages/plugin-account/` / `core-data` sync adapter; shares `engine.ts` contract with sync-engine-push; Tauri invoke via `@repo/core/hooks` only (codebase-orientation §4/§6, CLAUDE.md §Code Boundaries).

## Threat model binding
- T1.1 (FR-SY-68 revision rollback H-6; FR-SY-77 account commit_seq monitor); R-10.13.
- STRIDE Tampering — revision rollback rejection (stride-cve.md §2.1 T1.1).

## Acceptance signal
`sync/engine` unit tests: server UPDATE of an old revision → client rejects + E3015; key_id change with higher commit_seq → accepted as re-encrypt; `current_account_commit_seq < last_seen` → E3024 + sync paused (dev-plan §5.1 sync/engine ≥80%, §5.3 scenario 10).

## Dependencies (advisory — manifest is authoritative)
Depends On: sync-engine-push (shipped) — shares engine.ts contract.
