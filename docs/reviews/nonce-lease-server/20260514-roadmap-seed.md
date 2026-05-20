# Roadmap Seed — nonce-lease-server

> sync-v1 roadmap · feature #24 · wave W2 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-02 (§6.1 nonce_lease / used_nonces SQL)
> Status hint: PENDING

## Requirement
Implement the server-side nonce uniqueness anchor: `nonce_lease` table + `fn_grant_nonce_lease(account_id, key_id, count)` SECURITY DEFINER RPC issuing strictly-monotone non-overlapping leases, plus the `used_nonces` append-only ledger (first-insert on every nonce-consuming path) as the hard GCM-nonce-global-uniqueness invariant. macOS Keychain `high_water` anchor is the optional secondary reinforcement.

## Hard constraints
- `used_nonces` is **append-only, NEVER DELETE** — hard_deleted blobs do NOT release nonces (prevents attacker hard-delete-then-reuse); every consuming path (`encrypted_blobs`/`staging_blobs`/`conflict_shadow`/`rekey_swap`) must INSERT `used_nonces` in the SAME transaction; PK violation = nonce reuse → E3027 + severe alert (PRD §6.1 C-A, R-10.23).
- `nonce_lease` MUST enforce non-overlap via `EXCLUDE USING gist (... int8range(lease_start, lease_end, '[]') WITH &&)`; `counter CHECK BETWEEN 0 AND 4294967295` (v0.6 H-6); `nonce_lease` RLS enabled, no client SELECT/INSERT — all access via `fn_grant_nonce_lease` SECURITY DEFINER (v0.6 H-2).
- Three-platform unified server lease (FR-SY-07 C-C); `lease_start = max_lease_end + 1` under `SELECT ... FOR UPDATE`; nonce = `encryption_device_id (8B) ‖ counter (4B)`; 0xFFFFFF00 → forced Re-key. Redundant `encrypted_blobs` UNIQUE index retained as second line of defense (C-B).
- macOS `high_water` anchor stored Keychain `WhenUnlockedThisDeviceOnly` (not iCloud Keychain) for backup-rollback detection (R-10.18).
- Code boundary: SQL migration in `apps/web/supabase/migrations/`; Keychain anchor read via Rust `security-framework` under `src-tauri/src/platform/macos/` (codebase-orientation §6 + CLAUDE.md §Code Boundaries).

## Threat model binding
- T1/T2/T13 (FR-SY-07 C-C nonce lease); R-10.18 nonce backup rollback (🔴); R-10.23 server-side nonce constraint (🔴); R-10.24 Web nonce backup rollback.
- STRIDE Tampering — nonce-reuse = catastrophic GCM auth-key leak (stride-cve.md §3 dep #2 footgun).

## Acceptance signal
Resubmitting the same `(account_id, key_id, encryption_device_id, counter)` across any table → `used_nonces` PK violation, rejected with E3027 + severe alert; leases issued by `fn_grant_nonce_lease` are strictly monotone and non-overlapping; SQLite backup rollback → next_counter < Keychain high_water → encryption refused + E3021 (dev-plan §5.1 used_nonces_ledger / nonce_counter 100%).

## Dependencies (advisory — manifest is authoritative)
Depends On: cipher-envelope-codec, supabase-schema-migrations, keychain-bridge-macos (all shipped). Deploy/verify against live Supabase blocked-by supabase-project-provisioning (#9) per R8.
