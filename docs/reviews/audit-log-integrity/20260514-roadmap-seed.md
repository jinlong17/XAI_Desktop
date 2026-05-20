# Roadmap Seed — audit-log-integrity

> sync-v1 roadmap · feature #36 · wave W3 · Phase 4.8
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): (new — GAP-T1, no existing FR; pattern reuses FR-SY-77)
> Status hint: PENDING

## Requirement
GAP-T1 (Repudiation, NEW R-10.26): implement append-only `sync_audit_log` integrity — server-side append-only audit table + a client-side local audit mirror + an account-level count / last-hash consistency check at PULL/login, reusing the FR-SY-77 commit_seq rollback-detection pattern. (Full Merkle / hash-chain stays v2 per §12.3 C-03.)

## Hard constraints
- `sync_audit_log` MUST be append-only (no UPDATE/DELETE by service_role in normal paths); records push/pull/conflict/dead_letter/device_register/login/mnemonic_reset; `device_id` hashed `HMAC(account_id, device_id)` (FR-SY-57/61 M-03).
- Client keeps a local audit mirror; at PULL/login compares account-level audit entry count + last-hash against server, surfacing a severe alert + sync pause on mismatch — directly modeled on the FR-SY-77 server-rollback-detection pattern (stride-cve.md §4.1 P0 GAP-T1, §2.4 GAP-T1).
- This implements NEW R-10.26 and is a hard Phase 4.8 admission item; full Merkle/hash-chain is explicitly out of scope (v2, §12.3 C-03) (stride-cve.md §2.5 GAP-T1).
- Code boundary: SQL migration in `apps/web/supabase/migrations/`; client mirror + consistency check in `packages/plugin-account/` / `core-data` (local SQLCipher table); zero Host logic (codebase-orientation §6, CLAUDE.md §Code Boundaries).

## Threat model binding
- NEW R-10.26 (GAP-T1 audit-log integrity); affects T1.1 / T8 / T11 (Re-key) — malicious service_role can silently alter/delete sync_audit_log, rotation records, Re-key chain (stride-cve.md §2.4 GAP-T1, §4.1).
- STRIDE Repudiation — the globally weakest STRIDE dimension; no attacker R-column control today (stride-cve.md §2.5 special note, §6).

## Acceptance signal
Server-side audit table is append-only; client mirror + count/last-hash check detects a server-side silent audit deletion/alteration → severe alert + sync pause; rotation + Re-key events are tamper-evidently recorded (PRD §10.x admission gate, stride-cve.md §4.1 P0 GAP-T1; T1.1 / T8 Repudiation coverage).

## Dependencies (advisory — manifest is authoritative)
Depends On: commit-seq-authority (shipped) — reuses the FR-SY-77 monotone-monitor pattern.
