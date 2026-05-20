# Roadmap Seed — rls-policies-and-tests

> sync-v1 roadmap · feature #25 · wave W2 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-03
> Status hint: PENDING

## Requirement
Author and test all §6.2 per-table RLS policies: `accounts` self-read only (no client UPDATE), `account_keyring` read-only, `device_dek_wraps`/`encrypted_blobs`/`conflict_shadow`/`staging_blobs` self + active-device-only SELECT, all writes via Edge Function service_role. Plus a Vitest harness simulating two users + revoked-token device proving cross-tenant deny and revoked-device-INSERT deny.

## Hard constraints
- `accounts` has NO client UPDATE policy (v0.3 C-B): all sensitive-column writes go through Edge Function service_role + Ed25519 recovery proof; only `accounts_self_read ON SELECT USING (id = auth.uid())` (PRD §6.2).
- `encrypted_blobs` is client read-only: NO `blobs_self_write`/`blobs_self_update` policy — all INSERT/UPDATE/DELETE via `/sync/push` Edge Function service_role so conditional-write / mutation_dedup / conflict-shadow / commit_seq invariants are server-guaranteed (v0.4 C-D).
- Every user-data SELECT policy MUST include the active-device check: `(auth.jwt() ->> 'device_id')::uuid IN (SELECT device_id FROM sync_devices WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL)` (FR-SY-58 H-08/H-12; pending/revoked devices denied).
- Explicit scope: RLS defends against client/authenticated privilege escalation, NOT service_role/Studio Admin (latter covered by zero-knowledge: sees ciphertext, cannot decrypt) (FR-SY-58).
- Code boundary: SQL migration + RLS tests in `apps/web/supabase/migrations/` + Vitest with `@supabase/supabase-js` (codebase-orientation §6, CLAUDE.md §Code Boundaries).

## Threat model binding
- FR-SY-58 H-08/H-12; R-10.4 (RLS config hole, service-admin can read blob — mitigated by zero-knowledge); H-08 device check.
- STRIDE Elevation-of-Privilege — RLS service_role boundary + active-device gate (stride-cve.md §2.1 T1.1 E column, §2.3 T6).

## Acceptance signal
Vitest: user_A token reading user_B's blobs → 0 rows; revoked-token device attempting INSERT/SELECT → denied; anon role → denied; client direct UPDATE of accounts sensitive columns → RLS rejects (dev-plan §5.3 scenario 13, §5.6 RLS audit).

## Dependencies (advisory — manifest is authoritative)
Depends On: supabase-schema-migrations (shipped). Live-Supabase verify blocked-by supabase-project-provisioning (#9) per R8; policy authoring + Vitest against local Supabase not blocked.
