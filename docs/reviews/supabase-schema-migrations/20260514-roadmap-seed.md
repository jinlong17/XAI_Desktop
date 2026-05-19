# Roadmap Seed — supabase-schema-migrations

> sync-v1 roadmap · feature #15 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-02
> Status hint: PENDING

## Requirement
Author all PRD §6.1 Postgres tables + the `sync_entity_type` ENUM + the v0.5/v0.6 new tables (account_keyring, mutation_dedup, encrypted_blobs_conflict_shadow, staging_blobs, device_sync_progress, used_nonces, nonce_lease) as versioned migrations under `apps/web/supabase/migrations/`. Authoring is pure and valuable; *deployment* is blocked by supabase-project-provisioning.

## Hard constraints
- PRD §6.1: schema MUST include the v0.6 invariants — `used_nonces` first-insert across encrypted_blobs/staging_blobs/shadow/rekey_swap (global unique), `nonce_lease` EXCLUDE USING gist (no lease overlap), counter CHECK BETWEEN 0 AND 4294967295 (v0.6 C-A/H-6).
- DDL deployment order must follow H-3/H-8 (ALTER FK true order).
- Deploy + verify is `blocked-by supabase-project-provisioning` (#9) — modeled as a Note, not a hard edge (manifest §R8); authoring proceeds now.
- Code boundary: `apps/web/supabase/migrations/` per dev-plan T-02; no plugin/Host/Rust code.

## Threat model binding
- T1.1 (malicious server / active write): schema-level UNIQUE(account_id, key_id, encryption_device_id, counter) + used_nonces ledger is the last-line nonce-reuse defense (PRD §6.1, FR-SY-77, R-10.23).
- STRIDE Tampering across TB-7 (Supabase Postgres).

## Acceptance signal
Migrations apply cleanly to a local Postgres; ENUM + all listed tables + constraints (UNIQUE, EXCLUDE gist, counter CHECK) present; deploy to staging once #9 unblocks.

## Dependencies (advisory — manifest is authoritative)
Depends On: roadmap-kickoff (shipped) · deploy blocked-by supabase-project-provisioning
