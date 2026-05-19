# supabase-schema-migrations — Design (Decision Snapshot)

> Non-plugin feature (roadmap-kickoff non-plugin precedent). Deliverable is
> versioned SQL migrations under `apps/web/supabase/migrations/`, NOT a
> `packages/plugin-*` package. These docs are the workflow anchor only.

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option B — decomposed, dependency-ordered migration set (6 files) |
| Review Doc | `docs/reviews/supabase-schema-migrations/20260519-discovery-review.md` |
| Review Date | 2026-05-19 |
| Source PRD | `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT §6.1 + §6.2 |
| dev-plan task | T-02 |
| Roadmap | sync-v1 · feature #15 · wave W1 · Phase 0.3 |
| Worktree base HEAD | 46847e9 |
| Code boundary | `apps/web/supabase/migrations/` only — no plugin/Host/Rust |

## Frozen Assumptions

1. **Scope = authoring + local-apply only.** Remote deploy/verify is
   blocked-by `supabase-project-provisioning` (#9), modeled as a **Note, not a
   hard Depends-On edge** (manifest §R8). Acceptance = migrations apply cleanly
   to a **local Postgres**; remote staging deploy happens later when #9 unblocks.
2. **Faithful PRD transcription.** Every DDL statement is a verbatim/structural
   copy of PRD §6.1 (lines 761–1075) + §6.2 (lines 1077–1228). No invented
   columns, types, defaults, or constraints. Live-verified — see discovery
   review §4 audit table.
3. **H-8 deployment order is binding** (PRD line 763):
   `accounts → sync_devices → account_keyring → device_dek_wraps →
   encrypted_blobs → encrypted_blobs_conflict_shadow → staging_blobs →
   nonce_lease → mutation_dedup → device_sync_progress`. Honored both across
   files and within files.
4. **H-3 deferred FK** (PRD lines 1017–1019): `device_dek_wraps.device_id` FK
   to `sync_devices(device_id)` is added via `ALTER TABLE` *after*
   `sync_devices` is created — never inline in the `device_dek_wraps` CREATE.
5. **H-9 / commit_seq SQL is in scope** (PRD lines 770–799):
   `account_commit_seq_global` sequence + `fn_alloc_commit_seq()` SECURITY
   DEFINER + `REVOKE ALL ... FROM PUBLIC` are inside the §6.1 fenced block and
   are schema infrastructure (not Edge-Function logic). Edge Function bodies
   remain OUT of scope.
6. **§6.3 client SQLite tables are OUT of scope** — they are SQLCipher
   client-side, owned by client/core-data features, not T-02.
7. **`realtime.messages` RLS is OUT of scope** — commented-out in PRD,
   belongs to dev-plan T-04 (Realtime Private Channels).
8. **RLS functional tests are OUT of scope** — dev-plan T-03. This feature
   only authors the policy DDL; behavioral RLS proof is T-03's deliverable.
9. **Local-apply path = Supabase CLI (`supabase db reset`)** as the canonical
   command (provides the `auth` schema that §6.2 policies reference). A
   minimal local-only `auth` shim is the documented `psql`-only fallback,
   explicitly NOT part of the production migration set. (R-2; feature-review
   to confirm the canonical-vs-shim choice.)
10. **Filename scheme**: `apps/web/supabase/migrations/20260519000001_*.sql`
    … `20260519000006_*.sql` — fixed date prefix + monotonic 6-digit sequence
    so lexicographic apply order is unambiguous (R-3).

## Dependency Overview

- **Depends on**: `roadmap-kickoff` (SHIPPED — scaffolding on base HEAD
  46847e9; provides `apps/web/` workspace). No code dependency on its
  TypeScript artifacts; this feature only adds a sibling `supabase/migrations/`
  tree under `apps/web/`.
- **Deploy blocked-by (Note, not edge)**: `supabase-project-provisioning`
  (#9, BLOCKED_EXTERNAL). Local-apply acceptance does not require #9.
- **Downstream consumers** (not built here): dev-plan T-03 (RLS automated
  tests), T-04 (Realtime), `/sync/push` + `fn_grant_nonce_lease` Edge
  Functions, all sync client features. They depend on this schema being
  authored and applicable.
- **External tooling**: Supabase CLI (already mandated by T-02) +
  `btree_gist` contrib extension. No new repo libraries.

## Migration Set (Selected Option B)

| # | File (under `apps/web/supabase/migrations/`) | Contents | PRD source |
|---|---|---|---|
| 1 | `20260519000001_extensions_and_enum.sql` | `CREATE EXTENSION IF NOT EXISTS btree_gist`; `CREATE TYPE sync_entity_type`; `CREATE SEQUENCE account_commit_seq_global`; `CREATE SEQUENCE encryption_device_id_seq START WITH 1` | 802–807, 771, 1014 |
| 2 | `20260519000002_core_tables.sql` | `accounts`, `sync_devices`, `account_keyring`, `device_dek_wraps` (device FK omitted), `idx_dek_wraps_device`, then H-3 `ALTER TABLE device_dek_wraps ADD CONSTRAINT fk_dek_wraps_device` (after `sync_devices`) | 810–864, 999–1019 |
| 3 | `20260519000003_blob_tables_and_nonce_defense.sql` | `encrypted_blobs`, `used_nonces`, `uniq_encrypted_blobs_nonce`, `idx_blobs_mutation_id`, `idx_blobs_pull_cursor`, `idx_blobs_realtime`, `encrypted_blobs_conflict_shadow` + `idx_conflict_shadow_gc`, `staging_blobs` | 870–983 |
| 4 | `20260519000004_lease_dedup_progress.sql` | `nonce_lease` + `no_lease_overlap` EXCLUDE gist + RLS-enable + `idx_nonce_lease_lookup`; `mutation_dedup` + `idx_mutation_dedup_gc`; `device_sync_progress`; `sync_audit_log` + `idx_audit_account_at`; `sync_quota` | 925–1074 |
| 5 | `20260519000005_commit_seq_rpc.sql` | `fn_alloc_commit_seq()` SECURITY DEFINER + `REVOKE ALL ... FROM PUBLIC` | 773–799 |
| 6 | `20260519000006_rls_policies.sql` | `ENABLE ROW LEVEL SECURITY` on the 10 §6.2 tables (+ `nonce_lease` already enabled in file 4) + all 11 named §6.2 policies | 1080–1216 |

> File 4 also issues `ALTER TABLE nonce_lease ENABLE ROW LEVEL SECURITY`
> (PRD line 1043 places it inline with the table). File 6 must NOT
> re-enable it (idempotent guard or simply omit nonce_lease from file 6's
> enable list — it has no client policy by design, PRD line 1044).

## Threat Model

Bound from discovery review §6 (carried here per task requirement):

- **T1.1 — malicious server / active write (GCM nonce reuse).** The schema is
  the *last line* of nonce-reuse defense (the cryptographic layers above
  cannot stop a server that re-issues a nonce). Enforced by:
  - `used_nonces` table — PK
    `(account_id, key_id, encryption_device_id, counter)`, **never DELETEd**
    (even for `hard_deleted` blobs, PRD line 901), first-insert on every write
    path (blob / staging / shadow_loser / rekey_swap). A duplicate nonce
    violates the PK → E3027 + severe alert (PRD lines 891–904).
  - Redundant `uniq_encrypted_blobs_nonce` partial unique index
    (`WHERE hard_deleted = false`) — defense-in-depth second barrier
    (PRD lines 906–909).
  - Maps to **FR-SY-77, R-10.23**, PRD §6.1.
- **STRIDE — Tampering across TB-7 (Supabase Postgres).** A compromised
  Postgres / `service_role` replaying counters is structurally constrained by:
  - `counter CHECK BETWEEN 0 AND 4294967295` on `used_nonces` (v0.6 H-6 —
    4-byte GCM counter upper bound, PRD line 897).
  - `lease_start/lease_end CHECK BETWEEN 0 AND 4294967295` +
    `CHECK (lease_end >= lease_start)` on `nonce_lease` (PRD lines 1027–1030).
  - `no_lease_overlap` `EXCLUDE USING gist (account_id WITH =,
    encryption_device_id WITH =, key_id WITH =, int8range(lease_start,
    lease_end, '[]') WITH &&)` — guarantees no two nonce-lease ranges overlap
    for the same `(account, device, key)` (v0.6 C-A, PRD lines 1035–1041).
  - **Boundary disclaimer (PRD §6.2 note 11)**: RLS defends against
    `authenticated`/`anon` lateral access only; it explicitly does **NOT**
    defend against `service_role` — that boundary is protected by the
    zero-knowledge commitment and is owned by #9 (provisioning) + the
    credential-rotation SOP. Recorded here as a **Note**, not a hard edge.
