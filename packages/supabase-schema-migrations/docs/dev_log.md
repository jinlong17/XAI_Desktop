# supabase-schema-migrations — Dev Log (Workflow State Machine)

> This is the roadmap workflow state anchor. `xai-roadmap-loop` reconcile and
> the orchestrator read this file by slug:
> `packages/supabase-schema-migrations/docs/dev_log.md`.
> Non-plugin feature — deliverable is SQL under `apps/web/supabase/migrations/`.

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | supabase-schema-migrations |
| Title | Sync v1 Postgres schema + RLS as versioned Supabase migrations (PRD §6.1/§6.2) |
| Roadmap | sync-v1 · feature #15 · wave W1 · Phase 0.3 · dev-plan T-02 |
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | ship |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | feature-verify (claude-opus-4-7) |
| Updated | 2026-05-19 17:05 |

## Phase Plan

> `feature-build` executes ONE phase per run, then stops for human
> confirmation. Phases are ordered so each leaves a cleanly-applicable
> Postgres state (acceptance = local-Postgres apply, see test.md §1).
> All output is SQL under `apps/web/supabase/migrations/` — NO plugin/Host/Rust.

### Phase 1 — Extensions, ENUM & sequences — DONE
- `apps/web/supabase/migrations/20260519000001_extensions_and_enum.sql`:
  `CREATE EXTENSION IF NOT EXISTS btree_gist`; `CREATE TYPE sync_entity_type`
  (19 labels, PRD 802–807); `CREATE SEQUENCE account_commit_seq_global`;
  `CREATE SEQUENCE encryption_device_id_seq START WITH 1`.
- Gate: file 1 applies clean to local Postgres; AC-2 (ENUM 19 labels) green.
- Commit: `0481428`

### Phase 2 — Core tables + H-3 deferred FK — DONE
- `..._20260519000002_core_tables.sql`: `accounts`, `sync_devices`,
  `account_keyring`, `device_dek_wraps` (device FK omitted), `idx_dek_wraps_device`,
  then H-3 `ALTER TABLE device_dek_wraps ADD CONSTRAINT fk_dek_wraps_device`
  AFTER `sync_devices` (PRD 1017–1019). H-8 order honored in-file.
- Gate: files 1–2 apply clean in order; AC-8 (fk_dek_wraps_device) green.
- Commit: `5aa42da`

### Phase 3 — Blob tables + nonce defense (T1.1) — DONE
- `..._20260519000003_blob_tables_and_nonce_defense.sql`: `encrypted_blobs`,
  `used_nonces` (PK 4-tuple + counter CHECK + source CHECK), `uniq_encrypted_blobs_nonce`
  partial unique, `idx_blobs_*`, `encrypted_blobs_conflict_shadow` +
  `idx_conflict_shadow_gc`, `staging_blobs`.
- Gate: files 1–3 apply clean; AC-4/AC-5/AC-7 (used_nonces PK, counter CHECK,
  partial unique) green.
- Commit: `3f9c15a`

### Phase 4 — Lease, dedup, progress, audit, quota — DONE
- `..._20260519000004_lease_dedup_progress.sql`: `nonce_lease` +
  `no_lease_overlap` EXCLUDE USING gist + RLS-enable + `idx_nonce_lease_lookup`;
  `mutation_dedup` + `idx_mutation_dedup_gc`; `device_sync_progress`;
  `sync_audit_log` + `idx_audit_account_at`; `sync_quota`.
- Gate: files 1–4 apply clean; AC-6 (no_lease_overlap EXCLUDE gist) green.
- Commit: `84eaafb`

### Phase 5 — commit_seq RPC — DONE
- `..._20260519000005_commit_seq_rpc.sql`: `fn_alloc_commit_seq()` SECURITY
  DEFINER (PRD 773–797) + `REVOKE ALL ON FUNCTION ... FROM PUBLIC`.
- Gate: files 1–5 apply clean; AC-9 (prosecdef + PUBLIC revoked) green.
- Commit: `2cd8c72`

### Phase 6 — RLS policies + acceptance sweep — DONE
- `..._20260519000006_rls_policies.sql`: `ENABLE ROW LEVEL SECURITY` on the
  §6.2 tables (NOT re-enabling `nonce_lease`) + all 11 named §6.2 policies
  verbatim (PRD 1080–1216).
- Full acceptance sweep AC-1..AC-12 + NEG-1..NEG-4 via test.md §1 canonical
  command.
- Gate: all AC green → READY_FOR_VERIFY.
- Commit: `9e6da85`

## Risks

See discovery review §5. Top:
- R-1: `btree_gist` must be present for `no_lease_overlap` (mitigated by
  `CREATE EXTENSION IF NOT EXISTS` + contrib-enabled local Postgres).
- R-2: §6.2 RLS references `auth.uid()`/`auth.jwt()` — canonical apply path is
  `supabase db reset` (provides `auth` schema); local-only shim is the
  documented `psql` fallback (NOT a production migration). feature-review to
  confirm canonical-vs-shim.
- R-3: migration filename monotonicity (fixed date prefix + 6-digit seq).
- R-4: remote deploy genuinely blocked-by #9 — scoped out, Note only.

## Notes (blocked-by, not hard edges)

- **Deploy/remote-verify blocked-by `supabase-project-provisioning` (#9,
  BLOCKED_EXTERNAL)** — modeled per manifest §R8 as a Note, NOT a hard
  Depends-On edge. Authoring + local-Postgres apply proceeds and is the full
  acceptance scope. Roadmap reconcile must not treat #9 as a hard predecessor
  of #15.

## Review Notes

**APPROVED** — 2 non-blocking recommendations, 0 blockers (feature-review independent verdict, 2026-05-19).

Independent re-verification vs live PRD `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT §6.1/§6.2 (lines 761–1228): `sync_entity_type` ENUM exactly 19 labels (PRD 802–807); all §6.1 + v0.5/v0.6 new tables present, phase-mapped, line-traced in discovery §4 (no drift); v0.6 hard invariants modeled correctly — `used_nonces` 4-tuple PK never-DELETEd (900–901) + redundant `uniq_encrypted_blobs_nonce` partial unique (907–909), `no_lease_overlap` EXCLUDE USING gist verbatim (1035–1041) with `btree_gist` enabled Phase 1 before Phase 4 use, `counter CHECK BETWEEN 0 AND 4294967295` (897); H-3/H-8 deferred-FK ordering correct (device_dek_wraps FK ALTERed after sync_devices in-file; nonce_lease FK resolves Phase 2 < Phase 4); each phase leaves a cleanly-applicable local-Postgres state with an AC-mapped gate; all 6 files strictly under `apps/web/supabase/migrations/`, no plugin/Host/Rust, remote deploy correctly scoped OUT as a blocked-by-#9 Note. T1.1 / STRIDE-Tampering / TB-7 binding present in design.md §Threat Model.

Non-blocking recommendations (carry into feature-build, NOT REVISE-worthy):
1. R-2 canonical-vs-shim — `supabase db reset` is canonical; keep `_local_auth_shim.sql` (clearly-marked non-production fallback) OUT of `apps/web/supabase/migrations/` (test.md §5).
2. OQ-1 — `fn_alloc_commit_seq` confirmed in scope (physically inside the §6.1 fence; schema infra, not Edge logic).

> **Recovery transcription:** feature-review returned APPROVED but the current `feature-review` agent config is read-only (`tools: Read, Glob, Grep`) and could not write the Status Panel. Verdict transcribed by the roadmap conductor under explicit one-time user authorization after reading the full feature-review return. NOT a normal path — `feature-review` agent config must be fixed so it can write APPROVED itself (see Work Log).

## Verify Notes

**PASS — READY_TO_SHIP** (feature-verify independent verdict, claude-opus-4-7, 2026-05-19).

Independent re-verification against live PRD docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.1/§6.2 and the actual committed migration SQL, with a real Postgres apply.

Apply path: psql fallback (Docker postgres:16-alpine, PostgreSQL 16.14, ON_ERROR_STOP=1) — Supabase CLI unavailable in this environment; canonical `supabase db reset` documented in test.md §1 was therefore not exercised. Local-only auth shim used to satisfy auth.uid()/auth.jwt() references; shim is NOT committed inside apps/web/supabase/migrations/ (confirmed). Path is acceptance-equivalent per test.md §1.1.

Evidence / AC results:
- AC-1: all 6 migrations apply in lexicographic order, rc=0; `\d` consistent after each file (AC-11 H-8 order, AC-12 incremental consistency, no dangling FK — all PASS).
- AC-2: sync_entity_type ENUM = exactly 19 labels, verbatim vs PRD 802–807.
- AC-3: all 13 §6.1 + v0.5/v0.6 tables present.
- AC-4: used_nonces PK = (account_id,key_id,encryption_device_id,counter).
- AC-5: counter CHECK ((counter >= 0) AND (counter <= 4294967295)).
- AC-6: no_lease_overlap EXCLUDE USING gist (... int8range(lease_start,lease_end,'[]') WITH &&); btree_gist created Phase 1 before Phase 4 use.
- AC-7: uniq_encrypted_blobs_nonce UNIQUE (account_id,key_id,encryption_device_id,counter) WHERE (hard_deleted = false).
- AC-8: fk_dek_wraps_device FK device_dek_wraps.device_id → sync_devices(device_id) ON DELETE CASCADE, ALTERed after sync_devices (H-3 honored).
- AC-9: fn_alloc_commit_seq prosecdef=true; has_function_privilege(public,...,execute)=false (REVOKE ALL FROM PUBLIC effective).
- AC-10: 12 tables RLS-enabled (nonce_lease enabled Phase 4, not re-enabled Phase 6); 11 named §6.2 policies present matching api.md §1.5.
- NEG-1 (nonce reuse) → used_nonces_pkey violation; NEG-2 (counter=4294967296) → used_nonces_counter_check violation; NEG-3 (overlapping lease) → no_lease_overlap exclusion violation; NEG-4 (invalid ENUM) → invalid input value for enum sync_entity_type. All four fail exactly as designed.

DDL is a faithful verbatim transcription of live PRD §6.1/§6.2 (ENUM, fn_alloc_commit_seq H-13 UUID hi/lo split, all tables/indexes/constraints) — no drift detected. T1.1 / STRIDE-Tampering / TB-7 binding present in design.md §Threat Model and structurally reflected in the schema (immutable used_nonces ledger, counter bound, EXCLUDE gist, partial unique).

Code boundary: clean — build commits touch only apps/web/supabase/migrations/ (6 SQL files) + packages/supabase-schema-migrations/docs/dev_log.md; no plugin/Host/Rust; no _local_auth_shim.sql inside migrations/; remote deploy correctly scoped OUT as a blocked-by-#9 Note (no remote/cloud deploy attempted). Commit hygiene: each phase is one focused single-file commit; messages follow type(scope): summary per COMMIT_CONVENTION.

Residual (non-blocking): canonical `supabase db reset` not exercised (Supabase CLI absent in this env) — psql fallback used, acceptance-equivalent; re-run `supabase db reset` once #9 (supabase-project-provisioning) unblocks, before any remote deploy. Remote deploy itself is scoped OUT (blocked-by-#9 Note, not a hard edge).

> **Recovery transcription:** feature-verify returned PASS/READY_TO_SHIP but the current feature-verify agent config is read-only (tools: Read, Bash, Glob, Grep) and could not write the Status Panel. Verdict transcribed mechanically by the roadmap conductor under explicit one-time user authorization after reading the full feature-verify return. NOT a normal path — follow-up required: fix the feature-verify agent config (tools: grant) so it can write its own verdict; until then the read-only-verifier hard-block recurs every feature (same defect as feature-review).

## Iterations

(none — initial Fresh plan)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 | feature-plan (Claude Opus) | Fresh plan. Live-verified every §6.1/§6.2 schema claim against PRD v0.6-DRAFT (lines 761–1228, audit table in discovery §4 — no drift). Wrote discovery review + design/api/test/dev_log. Selected Option B: 6 dependency-ordered migration files honoring H-8/H-3/H-9; v0.6 invariants (used_nonces PK, EXCLUDE gist, counter CHECK) concentrated in files 3–4. Scoped OUT: §6.3 client SQLite, realtime.messages (T-04), RLS tests (T-03), Edge Function bodies, remote deploy (blocked-by #9 = Note). T1.1/STRIDE-Tampering/TB-7 bound into design.md §Threat Model. Worktree base HEAD 46847e9. | (this commit) | feature-review |
| 2026-05-19 | feature-review (Claude Opus) → conductor (recovery transcription) | Recovery transcription: feature-review independently returned APPROVED (2 non-blocking recs, 0 blockers) but the current feature-review agent config is read-only and could not write the Status Panel. Conductor transcribed the verdict (Status→APPROVED, Phase→FEATURE_REVIEW, Suggested Next→feature-build, Review Notes) under explicit one-time user authorization after reading the full feature-review return. NOT a normal path — follow-up required: fix the `feature-review` agent config (`tools:` grant) so feature-review can write APPROVED itself; until then the read-only-reviewer hard-block will recur on every feature. | (transcription only — no code change) | feature-build |
| 2026-05-19 14:00 | feature-auto-build (claude-sonnet-4-6) | Phase 1 DONE: Created `20260519000001_extensions_and_enum.sql` — btree_gist extension, sync_entity_type ENUM (19 labels), account_commit_seq_global, encryption_device_id_seq. Applied cleanly to local Postgres (Docker postgres:15-alpine, psql fallback path — Supabase CLI unavailable in env; auth shim kept out of migrations/ per rec R-2). AC-1 (exit 0), AC-2 (ENUM 19 labels) PASS. | `0481428` | Phase 2 |
| 2026-05-19 14:00 | feature-auto-build (claude-sonnet-4-6) | Phase 2 DONE: Created `20260519000002_core_tables.sql` — accounts, account_keyring, device_dek_wraps (device FK omitted per H-3), idx_dek_wraps_device, sync_devices, then H-3 ALTER TABLE fk_dek_wraps_device after sync_devices. H-8 order strictly honored in-file. AC-1 (files 1-2), AC-8 (fk_dek_wraps_device present) PASS. | `5aa42da` | Phase 3 |
| 2026-05-19 14:00 | feature-auto-build (claude-sonnet-4-6) | Phase 3 DONE: Created `20260519000003_blob_tables_and_nonce_defense.sql` — encrypted_blobs, used_nonces (4-tuple PK + counter CHECK BETWEEN 0 AND 4294967295 + source CHECK), uniq_encrypted_blobs_nonce partial unique (WHERE hard_deleted=false), idx_blobs_*, encrypted_blobs_conflict_shadow + idx_conflict_shadow_gc, staging_blobs. T1.1 nonce defense invariants confirmed. AC-1 (files 1-3), AC-4 (PK 4-tuple), AC-5 (counter CHECK), AC-7 (partial unique) PASS. NEG-1 (duplicate nonce → PK error), NEG-2 (counter=4294967296 → CHECK error) PASS. | `3f9c15a` | Phase 4 |
| 2026-05-19 14:00 | feature-auto-build (claude-sonnet-4-6) | Phase 4 DONE: Created `20260519000004_lease_dedup_progress.sql` — mutation_dedup + idx_mutation_dedup_gc, nonce_lease + lease_start/end CHECKs + no_lease_overlap EXCLUDE USING gist + RLS-enable (no client policy) + idx_nonce_lease_lookup, device_sync_progress, sync_audit_log + idx_audit_account_at, sync_quota. btree_gist (Phase 1) confirmed present before EXCLUDE. AC-1 (files 1-4), AC-6 (EXCLUDE gist contains '&&') PASS. NEG-3 (overlapping leases → EXCLUDE error) PASS. | `84eaafb` | Phase 5 |
| 2026-05-19 14:00 | feature-auto-build (claude-sonnet-4-6) | Phase 5 DONE: Created `20260519000005_commit_seq_rpc.sql` — fn_alloc_commit_seq(UUID) SECURITY DEFINER SET search_path=public, pg_advisory_xact_lock UUID hi/lo split (H-13), nextval + UPDATE + RAISE EXCEPTION on regression; REVOKE ALL FROM PUBLIC. AC-1 (files 1-5), AC-9 (prosecdef=true, has_function_privilege(public, execute)=false) PASS. | `2cd8c72` | Phase 6 |
| 2026-05-19 14:00 | feature-auto-build (claude-sonnet-4-6) | Phase 6 DONE + full acceptance sweep: Created `20260519000006_rls_policies.sql` — ENABLE RLS on 11 tables (nonce_lease already enabled Phase 4, omitted here), 11 named §6.2 policies verbatim from PRD. Full sweep: AC-1 (all 6 files, exit 0), AC-2 (ENUM 19), AC-3 (13 tables), AC-4 (PK 4-tuple), AC-5 (counter CHECK), AC-6 (EXCLUDE gist), AC-7 (partial unique), AC-8 (fk_dek_wraps_device), AC-9 (prosecdef + PUBLIC revoked), AC-10 (12 tables RLS-enabled, 11 named policies), AC-11/AC-12 (incremental apply + no dangling FKs) — all PASS. NEG-1..NEG-4 all PASS. Apply path: psql fallback (Docker postgres:15-alpine + local auth shim); canonical path (supabase db reset) deferred to feature-verify with Supabase CLI. Status→READY_FOR_VERIFY. Automation: self-implemented (codex+cursor CLIs available in env but SQL content fully specified from PRD; self-fallback path per Mode D contract). | `9e6da85` | feature-verify |
| 2026-05-19 17:05 | feature-verify (claude-opus-4-7) → conductor (recovery transcription) | Independent feature-verify: applied all 6 migrations to real Postgres 16.14 (Docker postgres:16-alpine, psql fallback — Supabase CLI absent; local-only auth shim, NOT in migrations/). AC-1..AC-12 PASS, NEG-1..NEG-4 fail-as-designed, DDL verbatim vs live PRD v0.6-DRAFT §6.1/§6.2, boundary + commit hygiene clean. Verdict PASS → Status=READY_TO_SHIP. Conductor transcribed verdict under one-time user authorization (feature-verify agent config read-only — must be fixed). | 0481428,5aa42da,3f9c15a,84eaafb,2cd8c72,9e6da85,c3a82e8 | ship |
