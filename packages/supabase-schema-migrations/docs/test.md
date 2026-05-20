# supabase-schema-migrations — Test / Validation Strategy

> Acceptance signal (from roadmap seed): **migrations apply cleanly to a local
> Postgres; ENUM + all listed tables + constraints (UNIQUE, EXCLUDE gist,
> counter CHECK) present.** Remote deploy/verify is blocked-by #9 — explicitly
> NOT a test target here (documented Note only).

## 1. Canonical Local-Apply Command

The canonical acceptance command (provides the Supabase `auth` schema that
§6.2 RLS policies reference — see discovery review R-2):

```bash
cd apps/web
# fresh local Supabase Postgres, applies every file in apps/web/supabase/migrations/
supabase db reset
# exit code 0 + no migration error  ==  authoring acceptance PASS
```

Prerequisite: `supabase` CLI installed and `apps/web/supabase/config.toml`
present (created by `supabase init` if absent — config-only, no secrets, not
the blocked provisioning of #9).

### 1.1 Pure-`psql` fallback (R-2 — local only, NOT production)

If the Supabase CLI/local stack is unavailable, apply against a contrib-enabled
Postgres with a **local-only `auth` shim** (stub `auth.uid()` / `auth.jwt()`),
which is NOT committed as a production migration:

```bash
# postgres image MUST include contrib (btree_gist). Official postgres:16 does.
createdb xai_sync_local
psql -d xai_sync_local -f apps/web/supabase/_local_auth_shim.sql   # local-only, gitignored / clearly marked
for f in apps/web/supabase/migrations/2026*.sql; do
  psql -v ON_ERROR_STOP=1 -d xai_sync_local -f "$f" || { echo "FAIL $f"; exit 1; }
done
```

`feature-build` decides shim-vs-CLI; design.md §Frozen Assumptions #9 records
CLI as canonical, feature-review to confirm.

## 2. Acceptance Checks (introspection after full apply)

Each is a `psql` assertion run post-apply (acceptance harness, runnable by
feature-verify):

| ID | Check | SQL probe (expected) |
|---|---|---|
| AC-1 | All 6 migration files apply, exit 0 | `supabase db reset` rc=0 / loop rc=0 |
| AC-2 | ENUM exists, exactly 19 labels | `SELECT count(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid WHERE t.typname='sync_entity_type';` → 19 |
| AC-3 | All 13 tables present | `to_regclass` non-null for accounts, sync_devices, account_keyring, device_dek_wraps, encrypted_blobs, used_nonces, encrypted_blobs_conflict_shadow, staging_blobs, nonce_lease, mutation_dedup, device_sync_progress, sync_audit_log, sync_quota |
| AC-4 | `used_nonces` PK = nonce 4-tuple | `pg_index`/`pg_constraint` PK columns = (account_id, key_id, encryption_device_id, counter) |
| AC-5 | counter CHECK BETWEEN 0 AND 4294967295 | `pg_get_constraintdef` on used_nonces contains `4294967295` |
| AC-6 | `no_lease_overlap` EXCLUDE USING gist exists | `SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname='no_lease_overlap';` contains `EXCLUDE USING gist` + `&&` |
| AC-7 | `uniq_encrypted_blobs_nonce` partial unique | `pg_get_indexdef` contains `UNIQUE` + `WHERE (hard_deleted = false)` |
| AC-8 | H-3 deferred FK present | `pg_constraint` `fk_dek_wraps_device` on device_dek_wraps → sync_devices(device_id) |
| AC-9 | `fn_alloc_commit_seq` SECURITY DEFINER + REVOKE | `pg_proc.prosecdef = true`; PUBLIC not in `proacl` |
| AC-10 | RLS enabled on the 12 tables; 11 named policies exist | `pg_class.relrowsecurity = true`; `pg_policies` row count per §6.2 |
| AC-11 | H-8 order honored (no FK created before its target) | each file applies in numeric order with `ON_ERROR_STOP=1`, no "relation does not exist" — implied by AC-1 |
| AC-12 | Each file independently leaves a consistent state | apply files 1..N incrementally; after each, `psql -c '\d'` succeeds, no dangling unvalidated FK |

## 3. Unit / Contract Coverage

- No application unit tests (pure SQL feature). The "unit" is each migration
  file; coverage = AC-1/AC-12 (every file applies and leaves consistency).
- Contract coverage = AC-2..AC-10 (the introspectable schema contract in
  `api.md` §1 is exactly produced — every PRD-sourced object present with the
  v0.6 hard invariants).

## 4. Invariant / Threat Regression Scenarios

Optional negative probes (defense-in-depth confidence, not blocking
acceptance — full behavioral RLS proof is dev-plan T-03):

- **NEG-1 (T1.1 nonce reuse)**: insert two `used_nonces` rows with identical
  `(account_id, key_id, encryption_device_id, counter)` → 2nd must fail PK.
- **NEG-2 (H-6 counter bound)**: insert `used_nonces` with `counter =
  4294967296` → must fail CHECK.
- **NEG-3 (lease overlap)**: insert two `nonce_lease` rows with overlapping
  `int8range` for same `(account_id, encryption_device_id, key_id)` → 2nd
  must fail `no_lease_overlap` EXCLUDE.
- **NEG-4 (ENUM closed set)**: insert `encrypted_blobs.entity_type =
  'not_a_real_type'` → must fail (invalid enum input).

## 5. Mock Strategy

- No application mocks. The only environmental substitute is the **local-only
  `auth` schema shim** (§1.1) used purely so RLS DDL referencing
  `auth.uid()`/`auth.jwt()` parses on a vanilla Postgres. It is NOT part of
  the production migration set and must be excluded from
  `apps/web/supabase/migrations/`.
- The canonical path (`supabase db reset`) needs no mock — the local Supabase
  stack provides the real `auth` schema.

## 6. Out of Scope (NOT tested here)

- Remote staging/prod apply (blocked-by #9 — Note only).
- RLS behavioral isolation (two-user deny, revoked/pending/stolen-token) —
  dev-plan T-03.
- Realtime `realtime.messages` policy — dev-plan T-04.
- Edge Function runtime behavior (E3027/E3029/E3030 mapping, idempotency).
- Nonce lease RPC and trigger-level used nonce behavior are covered by
  `pnpm --filter web test:nonce` after feature #24.
