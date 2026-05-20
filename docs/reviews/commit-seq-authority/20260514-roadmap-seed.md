# Roadmap Seed — commit-seq-authority

> sync-v1 roadmap · feature #23 · wave W2 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-02 (§6.1 commit_seq SQL)
> Status hint: PENDING

## Requirement
Implement the global authoritative ordering primitive: `account_commit_seq_global` BIGSERIAL sequence plus the `fn_alloc_commit_seq(account_id)` SECURITY DEFINER RPC that allocates a monotone commit_seq per mutation and updates `accounts.current_account_commit_seq`. This is the single global ordering authority (FR-SY-22) and the account-level rollback monitor anchor (FR-SY-77, H-A lightweight Merkle substitute).

## Hard constraints
- `fn_alloc_commit_seq` MUST be `SECURITY DEFINER`, `SET search_path = public`, `REVOKE ALL ... FROM PUBLIC`; callable only from the `/sync/push` Edge Function with service_role inside a REPEATABLE READ transaction (PRD §6.1).
- Per-account regression guard: `UPDATE accounts SET current_account_commit_seq = v_new_seq WHERE id = p_account_id AND current_account_commit_seq < v_new_seq`; `IF NOT FOUND THEN RAISE EXCEPTION 'commit_seq regression'` (PRD §6.1, FR-SY-22).
- Advisory lock MUST use the v0.6 H-13 UUID hi/lo 64-bit split (`pg_advisory_xact_lock`), NOT 32-bit `hashtext()` (collision-prone).
- `commit_seq` is the ONLY global ordering authority; client timestamps are display-only (FR-SY-22/23). BIGINT crosses JSON as string (v0.4 H-8).
- Code boundary: SQL migration in `apps/web/supabase/migrations/`; no client-side commit_seq logic (per codebase-orientation §6 + CLAUDE.md §Code Boundaries).

## Threat model binding
- T1.1 malicious-server active write (FR-SY-77 account-level commit_seq monotone monitor; FR-SY-22 authoritative ordering).
- R-10.13 (protocol-level defect: commit_seq must be in schema before Phase 5).
- STRIDE Tampering (stride-cve.md §2.1 T1.1 — commit_seq monotone detection detects gross rollback).

## Acceptance signal
`fn_alloc_commit_seq` allocates strictly monotone seqs under concurrent same-account calls; a forced lower `current_account_commit_seq` UPDATE raises the regression exception; PULL returns `current_account_commit_seq` and client `>= last_seen` check fires E3024 on rollback (PRD §7.4, dev-plan §5.1 verifyAccountCommitSeqMonotone).

## Dependencies (advisory — manifest is authoritative)
Depends On: supabase-schema-migrations (shipped). Deploy/verify against live Supabase is blocked-by supabase-project-provisioning (#9, BLOCKED_EXTERNAL) per manifest R8 note; SQL authoring is not blocked.
