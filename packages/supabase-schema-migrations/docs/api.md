# supabase-schema-migrations — API / Contract

> "API" here = the **schema contract** the migration set must produce. This is
> the introspectable surface downstream sync features (T-03 RLS tests, T-04
> Realtime, `/sync/push` Edge Function) bind against. Every object below is a
> faithful transcription of PRD `docs/planning/sub-prds/sync/PRD.md` §6.1/§6.2.

## 1. Object Inventory (must exist after full apply)

### 1.1 Extension & Types
| Object | Kind | PRD line | Contract |
|---|---|---|---|
| `btree_gist` | EXTENSION | (req. by 1035–1041) | Enables `nonce_lease` EXCLUDE gist |
| `sync_entity_type` | ENUM | 802–807 | Exactly 19 labels: `settings, grids, grid_items, auto_classify_rules, lists, todos, todo_reminders, labels, label_assignments, habits, habit_logs, boards, board_lists, board_cards, board_card_checklist, notes, progress_trackers, pets, plugins` (M-09) |
| `account_commit_seq_global` | SEQUENCE | 771 | Global cross-tenant commit sequence |
| `encryption_device_id_seq` | SEQUENCE | 1014 | `START WITH 1`, per-device unique nonce-high |

### 1.2 Tables (H-8 order) — key columns & constraints
| Table | PK | Notable constraints / FKs | PRD line |
|---|---|---|---|
| `accounts` | `id` (UUID = auth.users.id) | `email UNIQUE NOT NULL`; `current_dek_key_id DEFAULT 1`; `current_account_commit_seq DEFAULT 0`; `key_quarantine_at` nullable | 810–828 |
| `sync_devices` | `device_id` | `account_id → accounts ON DELETE CASCADE`; `encryption_device_id BIGINT NOT NULL UNIQUE`; `status CHECK IN ('pending_dek_wrap','active','revoked')` | 999–1012 |
| `account_keyring` | `(account_id, key_id)` | `account_id → accounts ON DELETE CASCADE`; `status CHECK IN ('active','retired','staging')`; `can_retire DEFAULT false` | 831–839 |
| `device_dek_wraps` | `(account_id, device_id, key_id)` | `account_id → accounts CASCADE`; `(account_id, key_id) → account_keyring CASCADE`; **device FK deferred (H-3)** | 842–864 |
| `encrypted_blobs` | `(account_id, entity_type, entity_id)` | `account_id → accounts CASCADE`; `entity_type sync_entity_type` | 870–889 |
| `used_nonces` | `(account_id, key_id, encryption_device_id, counter)` | `counter CHECK BETWEEN 0 AND 4294967295`; `source CHECK IN ('blob','staging','rekey_swap','shadow_loser')`; **NEVER DELETEd** | 893–902 |
| `encrypted_blobs_conflict_shadow` | `id` (BIGSERIAL) | `account_id → accounts CASCADE`; full loser AAD column set | 936–957 |
| `staging_blobs` | `(account_id, rekey_session_id, entity_type, entity_id)` | `account_id → accounts CASCADE`; `rekey_session_order BIGSERIAL` | 965–983 |
| `nonce_lease` | `id` (BIGSERIAL) | `account_id → accounts CASCADE`; `encryption_device_id → sync_devices(encryption_device_id) CASCADE`; `lease_start/lease_end CHECK BETWEEN 0 AND 4294967295`; `CHECK (lease_end >= lease_start)`; `no_lease_overlap` EXCLUDE gist; RLS enabled, no client policy | 1022–1046 |
| `mutation_dedup` | `(account_id, mutation_id)` | `result JSONB NOT NULL` | 925–933 |
| `device_sync_progress` | `(account_id, device_id)` | `account_id → accounts CASCADE`; `last_ack_commit_seq DEFAULT 0` | 990–996 |
| `sync_audit_log` | `id` (BIGSERIAL) | `account_id → accounts CASCADE` | 1053–1064 |
| `sync_quota` | `account_id` | `account_id → accounts CASCADE` | 1067–1074 |

### 1.3 Indexes
| Index | Table | Spec | PRD line |
|---|---|---|---|
| `uniq_encrypted_blobs_nonce` | encrypted_blobs | UNIQUE `(account_id, key_id, encryption_device_id, counter)` `WHERE hard_deleted = false` | 907–909 |
| `idx_blobs_mutation_id` | encrypted_blobs | UNIQUE `(account_id, mutation_id)` | 911–912 |
| `idx_blobs_pull_cursor` | encrypted_blobs | `(account_id, entity_type, commit_seq)` | 914–915 |
| `idx_blobs_realtime` | encrypted_blobs | `(account_id, commit_seq)` | 917–918 |
| `idx_dek_wraps_device` | device_dek_wraps | `(account_id, device_id)` | 863–864 |
| `idx_mutation_dedup_gc` | mutation_dedup | `(created_at)` | 932–933 |
| `idx_conflict_shadow_gc` | conflict_shadow | `(rejected_at)` | 956–957 |
| `idx_nonce_lease_lookup` | nonce_lease | `(account_id, encryption_device_id, key_id, lease_end)` | 1045–1046 |
| `idx_audit_account_at` | sync_audit_log | `(account_id, at DESC)` | 1064 |

### 1.4 Functions
| Function | Signature | Properties | PRD line |
|---|---|---|---|
| `fn_alloc_commit_seq` | `(p_account_id UUID) RETURNS BIGINT` | `LANGUAGE plpgsql`, `SECURITY DEFINER`, `SET search_path = public`, sorted two-lock `pg_advisory_xact_lock(bigint)` over UUID hi/lo 64-bit halves (H-13), `RAISE EXCEPTION` on regression; `REVOKE ALL ... FROM PUBLIC` | 773–799 |

### 1.5 RLS Policies (§6.2)
RLS enabled on: `accounts`, `account_keyring`, `device_dek_wraps`,
`encrypted_blobs`, `encrypted_blobs_conflict_shadow`, `staging_blobs`,
`mutation_dedup`, `device_sync_progress`, `sync_devices`, `sync_audit_log`,
`sync_quota` (+ `nonce_lease` enabled in file 4).

Named policies (all `FOR SELECT`, read-only by design — writes go through
`service_role` Edge Functions):
`accounts_self_read`, `keyring_self_read`, `dek_wraps_self_active_read`,
`blobs_self_active_read`, `conflict_shadow_self_active_read`,
`staging_blobs_self_active_read`, `mutation_dedup_self_active`,
`device_progress_self_active`, `devices_self_active_read`, `audit_self`,
`quota_self`.

Active-device-gated policies call `public.sync_jwt_device_is_active()`, a
narrow `SECURITY DEFINER` helper that checks the current JWT `device_id`
against `sync_devices(account_id = auth.uid(), status = 'active',
revoked_at IS NULL)`. This avoids recursive RLS evaluation when policies need
to consult `sync_devices`. `public.sync_jwt_device_id()` safely parses the JWT
claim and returns `NULL` for missing/malformed values. `sync_devices` itself is
active-only for an active JWT device, with a pending-device exception limited
to the pending device's own row.

`nonce_lease`: RLS enabled, **no client policy** by design (PRD line 1044 —
all access via `fn_grant_nonce_lease` SECURITY DEFINER, not in scope here).

## 2. Upstream / Downstream Interfaces

- **Upstream**: PRD §6.1/§6.2 (frozen v0.6-DRAFT) is the sole source of truth.
  No runtime upstream.
- **Downstream** (consume this schema; not built here):
  - dev-plan **T-03** — RLS automated tests (two-user deny, revoked-device
    deny). Implemented in `apps/web/supabase/tests/rls-policies.test.ts`.
  - dev-plan **T-04** — Realtime Private Channels (`realtime.messages` RLS).
  - `/sync/push` Edge Function — calls `fn_alloc_commit_seq`, writes
    `encrypted_blobs` + `used_nonces` + `mutation_dedup` in one txn.
  - `fn_grant_nonce_lease` RPC — writes `nonce_lease` under the
    `no_lease_overlap` constraint.

## 3. Error / Failure Semantics

- **Apply-time failure (authoring acceptance)**: any migration that fails to
  apply to a clean local Postgres = FAIL. Each file must be independently
  applicable in numeric order leaving a consistent state.
- **Runtime invariant violations (contract the schema guarantees downstream)**:
  - Duplicate nonce on any write path → `used_nonces` PK violation →
    surfaced by Edge Function as **E3027** + severe alert (PRD line 904).
  - `counter` outside `[0, 4294967295]` → CHECK violation (v0.6 H-6).
  - Overlapping nonce lease → `no_lease_overlap` EXCLUDE violation →
    Edge Function maps to **E3029/E3030** (PRD lines 1617–1618).
  - `commit_seq` regression → `fn_alloc_commit_seq` `RAISE EXCEPTION
    'account % not found or commit_seq regression'`.
- **No HTTP envelope** — this is a DB schema; runtime error mapping is the
  Edge Function layer's responsibility (separate features).

## 4. Idempotency / Permission Notes

- Migrations are **not** re-runnable individually (raw `CREATE` without
  `IF NOT EXISTS` except where the PRD uses it, e.g. extension). The Supabase
  migration tracker (`supabase_migrations.schema_migrations`) provides
  apply-once semantics; the local-apply contract is "apply to a *clean* DB".
  `supabase db reset` rebuilds from zero, satisfying this.
- `fn_alloc_commit_seq` is `SECURITY DEFINER` with `REVOKE ALL ... FROM
  PUBLIC` — only callable by `service_role` (Edge Function context). This
  permission boundary is part of the authored contract.
- RLS policies grant only `SELECT` to `authenticated` self-scoped rows; all
  mutation paths are `service_role`-only (PRD §6.2). Authoring this is in
  scope; *proving* it (T-03) is not.
