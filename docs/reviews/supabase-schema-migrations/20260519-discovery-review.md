# Discovery Review — supabase-schema-migrations

> sync-v1 roadmap · feature #15 · wave W1 · Phase 0.3
> Source PRD: `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT · dev-plan T-02
> Author: feature-plan (Claude Opus) · Date: 2026-05-19
> Worktree base HEAD: 46847e9 (roadmap-kickoff SHIPPED scaffolding present)

## 1. Problem Framing

The sync-v1 backend (PRD §6) requires a complete, versioned Postgres schema for
the zero-knowledge multi-device sync service hosted on Supabase. dev-plan task
**T-02** mandates that PRD **§6.1** (all tables + the `sync_entity_type` ENUM +
v0.5/v0.6 new tables) **and §6.2** (all RLS policies) be authored as versioned
migrations under `apps/web/supabase/migrations/`.

This feature delivers the **authoring** half only. The seed is explicit:
authoring is pure and valuable; *deployment + remote verify* is gated by
`supabase-project-provisioning` (#9, BLOCKED_EXTERNAL — human registers the
Supabase staging/prod projects). Per manifest §R8 that block is modeled as a
**Note, not a hard Depends-On edge**, so SQL authoring proceeds now.

**Acceptance reframed for authoring scope**: the migration set must apply
cleanly to a **local Postgres** (the canonical, non-blocked equivalent of
"deploy"), with the ENUM, every listed table, and the three v0.6 invariant
constraints (UNIQUE nonce defense, EXCLUDE USING gist lease, counter CHECK)
present and verifiable by introspection.

### In scope
- `sync_entity_type` ENUM (PRD §6.1, M-09 — 19 entity labels).
- All §6.1 Postgres objects in **H-8 deployment order**: `accounts` →
  `sync_devices` → `account_keyring` → `device_dek_wraps` → `encrypted_blobs`
  → `encrypted_blobs_conflict_shadow` → `staging_blobs` → `nonce_lease` →
  `mutation_dedup` → `device_sync_progress`, plus `used_nonces`,
  `sync_audit_log`, `sync_quota`.
- The two H-9 / commit_seq SQL objects co-located in §6.1: sequence
  `account_commit_seq_global` + `fn_alloc_commit_seq()` SECURITY DEFINER RPC
  (PRD lines 770–799 — they are part of the §6.1 fenced block).
- The `encryption_device_id_seq` sequence (PRD line 1014).
- The H-3 deferred FK ALTER (`device_dek_wraps.device_id` →
  `sync_devices.device_id`), applied **after** `sync_devices` exists.
- All §6.2 RLS: `ENABLE ROW LEVEL SECURITY` on the 10 tables + the named
  read/active-device policies (`accounts_self_read`, `keyring_self_read`,
  `dek_wraps_self_active_read`, `blobs_self_active_read`,
  `conflict_shadow_self_active_read`, `staging_blobs_self_active_read`,
  `mutation_dedup_self_active`, `device_progress_self_active`,
  `devices_self_active_read`, `audit_self`, `quota_self`) + `nonce_lease`
  RLS-enabled with no client policy.
- All §6.1 indexes (`uniq_encrypted_blobs_nonce` partial unique,
  `idx_blobs_mutation_id`, `idx_blobs_pull_cursor`, `idx_blobs_realtime`,
  `idx_dek_wraps_device`, `idx_mutation_dedup_gc`, `idx_conflict_shadow_gc`,
  `idx_nonce_lease_lookup`, `idx_audit_account_at`).
- The `btree_gist` extension enablement (required by the `nonce_lease`
  EXCLUDE USING gist constraint).
- A documented, reproducible **local-apply** command in `test.md`.

### Out of scope (explicit non-goals)
- Remote deployment to Supabase staging/prod (blocked-by #9 — documented Note).
- The §6.3 **client SQLite** tables (`sync_outbox`, `sync_state`,
  `nonce_counter`, `entity_state`, `sync_audit_local`) — these are SQLCipher
  client-side, not Postgres; owned by `core-data` / client features, not T-02.
- The §6.2 `realtime.messages` RLS policy — it is presented commented-out in the
  PRD and is dev-plan **T-04** (Realtime Private Channels), a separate feature.
- RLS automated tests (two-user deny, revoked-device deny) — dev-plan **T-03**,
  a separate feature. This feature only authors the policies; functional RLS
  proof is T-03's deliverable.
- Edge Function bodies (`/sync/push`, `fn_grant_nonce_lease` business logic,
  `grant_dek_wrap`) — separate sync features. We author the SQL `fn_alloc_commit_seq`
  / sequences because they live inside the §6.1 fenced block and the schema is
  not self-consistent without them; we do **not** author Edge Functions.
- Seed data, GC cron jobs, plugin/Host/Rust code (code boundary T-02).

## 2. Candidate Options

This feature is **internal schema authoring against a frozen PRD**; the only
external dependency is the Supabase CLI's own migration mechanism, which is
already mandated by dev-plan T-02 (`apps/web/supabase/migrations/`). No library
selection or open-source alternative comparison is required.

**No external research required** (per template §4 — purely internal, the
tooling is PRD-fixed; the only "options" are migration-file decomposition
strategy, evaluated below).

### Option A — Single monolithic migration file
One `*_sync_v1_schema.sql` containing the entire §6.1 + §6.2 verbatim.
- Pros: matches the PRD's single fenced block 1:1; trivially "in PRD order".
- Cons: a single 300-line migration is hard to review per-invariant; a failure
  mid-file leaves an ambiguous partial state; no logical phase boundary for
  `feature-build`'s one-phase-per-run rule; the H-3 deferred FK and the
  `btree_gist` extension get buried.

### Option B — Decomposed, dependency-ordered migration set (RECOMMENDED)
Multiple numbered migration files, each a self-contained, cleanly-applicable
unit, ordered to honor H-8 / H-3 / H-9 and grouped by invariant concern:
1. `..._extensions_and_enum.sql` — `CREATE EXTENSION IF NOT EXISTS btree_gist;`
   + `CREATE TYPE sync_entity_type` + `account_commit_seq_global` sequence +
   `encryption_device_id_seq` sequence.
2. `..._core_tables.sql` — `accounts`, `sync_devices`, `account_keyring`,
   `device_dek_wraps` (FK to `sync_devices` **omitted here**), then the H-3
   deferred `ALTER TABLE device_dek_wraps ADD CONSTRAINT fk_dek_wraps_device`
   placed *after* `sync_devices` within this file (H-8 in-file order).
3. `..._blob_tables_and_nonce_defense.sql` — `encrypted_blobs`,
   `used_nonces`, `uniq_encrypted_blobs_nonce`, `idx_blobs_*`,
   `encrypted_blobs_conflict_shadow`, `staging_blobs` + their indexes.
4. `..._lease_dedup_progress.sql` — `nonce_lease` (+ EXCLUDE gist + RLS +
   index), `mutation_dedup` (+ GC index), `device_sync_progress`,
   `sync_audit_log`, `sync_quota`.
5. `..._commit_seq_rpc.sql` — `fn_alloc_commit_seq` SECURITY DEFINER +
   `REVOKE ALL ... FROM PUBLIC`.
6. `..._rls_policies.sql` — all `ENABLE ROW LEVEL SECURITY` + all named
   §6.2 policies (depends on every table existing → must be last).
- Pros: every file is independently `psql`-applicable and leaves a consistent
  state; review can target one invariant group at a time; maps cleanly onto
  `feature-build`'s phase-per-run rule; H-3/H-8/H-9 ordering is explicit and
  auditable; the v0.6 hard invariants (used_nonces PK, EXCLUDE gist, counter
  CHECK) are concentrated in files 3–4 for focused review.
- Cons: must keep cross-file FK ordering disciplined; Supabase applies files
  lexicographically by timestamp prefix, so the numbering must be monotonic.

### Option C — One file per table
Maximum granularity (≈14 files).
- Pros: finest review unit.
- Cons: FK ordering becomes a fragile cross-file web (H-8 hard to read across
  14 files); over-fragments a schema that the PRD authored as one cohesive
  block; high ceremony for no invariant-isolation benefit beyond Option B.

## 3. Tradeoffs & Recommendation

**Recommendation: Option B — decomposed, dependency-ordered migration set
(6 files).**

Rationale:
- It is the only option where each migration file independently satisfies the
  acceptance signal ("applies cleanly to a local Postgres") *and* the workflow
  constraint ("`feature-build` does ONE phase per run, leaving the tree in a
  clean state").
- It makes the three v0.6 hard invariants (C-A `used_nonces` global-unique PK,
  EXCLUDE USING gist `no_lease_overlap`, counter `CHECK BETWEEN 0 AND
  4294967295`) reviewable as concentrated, named units rather than buried in a
  300-line monolith.
- H-8 deployment order is preserved *both* across files (file 2 before file 3
  before file 4) *and* within file 2 (the H-3 deferred FK ALTER follows
  `sync_devices`), exactly mirroring the PRD's "下方按部署顺序列出" directive.
- File 6 (RLS) last guarantees no policy references a not-yet-created table.

The migration content is a **faithful, live-verified transcription** of PRD
§6.1 + §6.2 — no invented columns, types, or constraints. Every DDL statement
traces to a specific PRD line (recorded in `design.md` §Frozen Assumptions and
`api.md` §Object Inventory).

## 4. Live-Verified PRD Claim Audit

Every schema claim re-checked against `docs/planning/sub-prds/sync/PRD.md`
(lines 761–1228) in this worktree — CONFIRMED, no drift:

| Claim | PRD line(s) | Status |
|---|---|---|
| H-8 deploy order string | 763 | CONFIRMED verbatim |
| `sync_entity_type` ENUM, 19 labels | 802–807 | CONFIRMED (settings…plugins) |
| `fn_alloc_commit_seq` SECURITY DEFINER + sequence | 770–799 | CONFIRMED (inside §6.1 fence) |
| `accounts` (incl. `key_quarantine_at`, `current_account_commit_seq`) | 810–828 | CONFIRMED |
| `account_keyring` composite PK + status CHECK | 831–839 | CONFIRMED |
| `device_dek_wraps` composite FK to keyring; device FK deferred | 842–861 | CONFIRMED (H-3 ALTER at 1017–1019) |
| `encrypted_blobs` full column set | 870–889 | CONFIRMED |
| `used_nonces` PK + counter CHECK BETWEEN 0 AND 4294967295 + source CHECK | 893–902 | CONFIRMED (v0.6 C-A / H-6) |
| `uniq_encrypted_blobs_nonce` partial unique WHERE hard_deleted=false | 907–909 | CONFIRMED (redundant defense) |
| `encrypted_blobs_conflict_shadow` (full AAD shadow) | 936–957 | CONFIRMED |
| `staging_blobs` composite PK + rekey ordering | 965–983 | CONFIRMED |
| `device_sync_progress` | 990–996 | CONFIRMED |
| `sync_devices` + `encryption_device_id_seq` | 999–1014 | CONFIRMED |
| H-3 deferred FK ALTER (`fk_dek_wraps_device`) | 1017–1019 | CONFIRMED |
| `nonce_lease` + lease_start/end CHECK + `no_lease_overlap` EXCLUDE USING gist | 1022–1046 | CONFIRMED (v0.6 C-A) |
| `sync_audit_log`, `sync_quota` | 1053–1074 | CONFIRMED |
| §6.2 RLS enable + 11 named policies | 1080–1216 | CONFIRMED |
| `realtime.messages` RLS commented-out (= T-04, out of scope) | 1220–1227 | CONFIRMED out-of-scope |
| dev-plan T-02 = §6.1 + §6.2 as versioned migrations | dev-plan:113 | CONFIRMED |

## 5. Risks & Open Questions

- **R-1 (btree_gist availability)** — `nonce_lease.no_lease_overlap` requires
  `EXCLUDE USING gist` over `int8range`, which needs the `btree_gist`
  extension. *Mitigation*: migration file 1 issues
  `CREATE EXTENSION IF NOT EXISTS btree_gist;`. `btree_gist` is in the standard
  Postgres `contrib` set and pre-installed on Supabase; for local apply the
  test.md command notes the dev must use a Postgres image that includes
  `contrib` (the official `postgres:16` image and `supabase db reset` both do).
- **R-2 (`auth.uid()` / `auth.jwt()` in RLS on bare local Postgres)** — the
  §6.2 policies call `auth.uid()` and `auth.jwt()`, which exist in the Supabase
  Postgres image (the `auth` schema) but **not** in a vanilla `postgres:16`
  container. *Mitigation*: the canonical local-apply path in test.md is
  `supabase db reset` against the Supabase local stack (which provides the
  `auth` schema), making the RLS file apply cleanly. A documented fallback for
  pure-`psql` apply is to create a minimal `auth` schema shim
  (`auth.uid()`/`auth.jwt()` stub functions) *for local apply only* — clearly
  marked NOT part of the production migration set. Decision recorded in
  design.md; feature-review to confirm the shim-vs-supabase-cli choice.
- **R-3 (migration filename monotonicity)** — Supabase applies migrations in
  lexicographic order of the `<timestamp>_` prefix. *Mitigation*: use a single
  fixed authoring date prefix with a monotonic 6-digit sequence
  (`20260519000001_…` … `20260519000006_…`) so order is unambiguous and stable.
- **R-4 (deploy genuinely blocked)** — remote staging/prod apply cannot be
  exercised until #9 unblocks. *Mitigation*: explicitly scoped out; acceptance
  is local-Postgres apply only; a Note (not a hard edge) is recorded in
  design.md and dev_log.md so the roadmap reconcile does not treat #9 as a
  hard predecessor.
- **OQ-1** — Should `fn_alloc_commit_seq` (a SECURITY DEFINER plpgsql function,
  arguably "logic") be authored here? **Resolved**: yes — it is physically
  inside the PRD §6.1 fenced DDL block (lines 773–797) and the schema's
  `commit_seq` contract is not self-consistent without it; it is schema-level
  infrastructure, not Edge-Function business logic. Edge Function bodies remain
  out of scope. feature-review to confirm.
- **OQ-2** — `sync_audit_log` / `sync_quota` are RLS-enabled with read-only
  self policies in §6.2 but are not in the H-8 ordered list. They have FKs only
  to `accounts`, so they are safe to create any time after `accounts`; placed
  in file 4. No invariant risk.

## 6. Threat Model Binding (carried into design.md §Threat Model)

- **T1.1 — malicious server / active write (nonce reuse)**: the schema is the
  *last line* of GCM-nonce-reuse defense. `used_nonces` (PK
  `(account_id, key_id, encryption_device_id, counter)`, **never DELETEd**,
  even for `hard_deleted` blobs) + the redundant
  `uniq_encrypted_blobs_nonce` partial unique index enforce global nonce
  uniqueness across every write path (blob / staging / shadow / rekey_swap).
  Maps to PRD FR-SY-77, R-10.23, §6.1 lines 891–909.
- **STRIDE Tampering across TB-7 (Supabase Postgres)**: a compromised server
  attempting to replay a nonce/counter is structurally rejected by the
  `used_nonces` PK and the `counter CHECK BETWEEN 0 AND 4294967295` (4-byte
  GCM counter bound, v0.6 H-6) plus the `no_lease_overlap` EXCLUDE constraint
  preventing overlapping nonce-lease ranges. RLS (§6.2) defends against
  authenticated/anon lateral access; it explicitly does **not** defend against
  `service_role` (zero-knowledge commitment, PRD §6.2 note 11) — that boundary
  is owned by #9 (provisioning) and the rotation SOP, recorded as a Note.
