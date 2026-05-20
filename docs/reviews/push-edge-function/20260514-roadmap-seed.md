# Roadmap Seed — push-edge-function

> sync-v1 roadmap · feature #28 · wave W2 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-14
> Status hint: PENDING

## Requirement
Implement the `/sync/push` Supabase Edge Function (service_role): per-record conditional write (`base_revision == current_revision AND proposed_revision == current_revision + 1`), `mutation_dedup` true-idempotency, conflict shadow on loser, commit_seq allocation via `fn_alloc_commit_seq`, and a 207 per-record partial response with mixed statuses.

## Hard constraints
- Conditional write: server validates `base_revision == current_revision AND proposed_revision == base_revision + 1`; mismatch → 409 / status `revision_mismatch`; server validates but NEVER rewrites revision (FR-SY-15 C-E).
- `mutation_dedup` `(account_id, mutation_id)` UNIQUE: duplicate mutation_id returns the previous result (true idempotency), produces NO new revision (FR-SY-72).
- Per-record transaction with mixed status (ok / conflict / causal_dep_unsatisfied / duplicate_mutation_id / revision_mismatch) → 207; batch-atomic is dead (FR-SY-46 H-F). Loser blob → `encrypted_blobs_conflict_shadow` with full AAD metadata (FR-SY-71 C-H).
- Every nonce-consuming insert must first-insert `used_nonces` in the same transaction (PRD §6.1 C-A); commit_seq via `fn_alloc_commit_seq` SECURITY DEFINER in a REPEATABLE READ tx; commit_seq crosses as string (M-2).
- Code boundary: Edge Function in `apps/web/supabase/functions/`; service_role only, never exposed to client (codebase-orientation §6, CLAUDE.md §Code Boundaries).

## Threat model binding
- FR-SY-15/46/71/72; R-10.3 (write conflict data loss — conflict shadow); R-10.13.
- STRIDE Tampering / Elevation-of-Privilege — server-guaranteed conditional-write invariant (stride-cve.md §2.1 T1.1 T/E).

## Acceptance signal
Integration: same mutation_id resent 10× → 1 revision; concurrent write with stale base_revision → 409 + loser in conflict shadow recoverable; mixed batch → 207 per-record results (dev-plan §5.3 scenarios 3/7, T-14).

## Dependencies (advisory — manifest is authoritative)
Depends On: rls-policies-and-tests, sync-engine-push (both shipped). Deploy blocked-by supabase-project-provisioning (#9, BLOCKED_EXTERNAL) per manifest Note + R8; function authoring not blocked.
