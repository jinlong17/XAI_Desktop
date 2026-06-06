# Runbook — Supabase (XAI Account Cloud + Sync Backend)

> Operational procedures for the XAI account cloud (Auth + Postgres + Edge
> Functions + Storage) that backs real login and account-sync.
> Decision context: `docs/adr/0013-branch-sync-governance.md` §D4 ·
> `docs/DEPLOYMENT.md` §6 · `docs/workflow/roadmap/sync-v1.md`
> Backend source: `apps/release-site/supabase/` (migrations + functions + tests)
>
> **Status when written (2026-06-06): NOT YET PROVISIONED.** All backend code
> exists; no live Supabase project. Steps marked `[EXTERNAL]` are human/operator
> actions that gate everything downstream. Do not skip the staging tier.

---

## 0. Tiers & invariants

- Two separate Supabase projects: **staging** and **production**. CI integrates
  against staging; promotion to production is a manual operator step.
- **Web and App do NOT sync to each other** — both sync to this one account
  cloud (ADR-0013 §D4).
- **Only `syncScope: "account-sync"` entities** are stored; `device-local`
  never enters the remote outbox.
- **Server stores ciphertext only** — end-to-end encrypted; `service_role` key
  never reaches any browser/app bundle.

---

## 1. First-time provisioning `[EXTERNAL]` — gates everything (sync-v1 #9)

Run **once per tier** (staging, then production).

1. Create the Supabase project at https://supabase.com/dashboard (record project
   ref, region, DB password).
2. Capture credentials:
   - `VITE_SUPABASE_URL` (project URL — public)
   - `VITE_SUPABASE_ANON_KEY` (anon key — public, RLS-guarded)
   - `service_role` key → **secrets manager only**, never in frontend/CI build env.
3. Install + link the Supabase CLI:
   ```bash
   npx supabase@latest login
   npx supabase@latest link --project-ref <staging-ref>
   ```

**Exit:** both tiers exist; credentials recorded; CLI linked to staging.

---

## 2. Deploy schema, RLS, and functions (per tier)

Backend code already written under `apps/release-site/supabase/`.

```bash
# from apps/release-site/
npx supabase@latest db push                 # migrations: accounts, sync_devices,
                                             # encrypted_blobs, mutation_dedup, device_dek_wraps,
                                             # encrypted_blobs_conflict_shadow, sync_audit_log
npx supabase@latest functions deploy sync-push
npx supabase@latest functions deploy sync-pull
npx supabase@latest functions deploy recovery-proof
npx supabase@latest functions deploy onboarding-backfill
```

Verify RLS:
```bash
npx supabase@latest test db                  # runs apps/release-site/supabase/tests/ (RLS policies)
```

**Exit:** staging has schema + RLS + Edge Functions; RLS tests green.

---

## 3. Auth configuration

1. Enable Email/Password provider.
2. Enable OAuth providers (Google / Notion / Linear — already CSP-allowed in
   `apps/web/public/_headers`); set redirect URLs to the Pages domain
   (`/app/settings/integrations/callback`).
3. **`[BLOCKER — not shipped]`** Deploy the `account-delete` Edge Function
   (`/functions/v1/account-delete`). Per `apps/web/deploy/README.md` this function
   is **NOT shipped in this repository** — `apps/release-site/supabase/functions/`
   contains only `sync-push` / `sync-pull` / `recovery-proof` / `onboarding-backfill`.
   It must be **implemented and deployed separately** before Real-Auth Private Beta
   (account-deletion is a privacy/compliance requirement, §7 法务). Public Demo is
   unaffected (no real accounts to delete).
4. Flip the web app to live auth:
   - `VITE_WEB_AUTH_MODE=live`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Replace the `LoginPage.tsx` mock stub with real Supabase Auth wiring.

**Exit:** staging real signup/login/logout/token-refresh works end to end.

---

## 4. Sync admission + entity rollout (sync-v1 #37, #56)

1. Pass the **hardening admission gate** (#37, 10-item PRD checklist) before any
   Phase-5 entity ships.
2. Wire **one** entity first (`productivity.todo`) through the §6.4 nine-item
   contract (entityType / schemaVersion / local mapping / push / pull / conflict
   / Web IndexedDB test / App SQLite test / two-device smoke).
3. Run the GA acceptance smoke (#56): 2 Macs + 1 browser, 30 min, 100%
   convergence.
4. Only then batch-wire remaining `account-sync` entities.

**Exit:** staging two-device sync smoke passes for the first entity.

---

## 5. Backup & restore drill

1. Enable daily backups (Supabase Pro; 7-day retention).
2. Add a second layer: `pg_dump` / `pg_cron` daily export to Cloudflare R2
   (the exported blobs are ciphertext — safe at rest).
3. **Run a restore drill** before production launch: restore the latest backup
   into a scratch project and verify a known account's blobs decrypt on a
   paired device. "Having a backup" is not the same as "restore works."

**Exit:** a documented, successful restore drill.

---

## 6. Promote staging → production

1. Re-run §2–§3 against the production project.
2. Set production env on Cloudflare Pages (`VITE_SUPABASE_URL`/`ANON_KEY` for
   prod tier).
3. Smoke real login + single-entity sync on production.
4. Register the deploy in `dashboard-state.json` `deployment.records` and via
   the `xai-release-log` skill.

---

## 7. Rollback

- **Edge Functions:** redeploy the previous function version
  (`supabase functions deploy <name>` from a prior commit).
- **Schema:** there is no in-place down-migration policy — roll forward with a
  compensating migration. Restore from backup (§5) only as last resort, and only
  after confirming the restore drill works.
- **Auth flip:** set `VITE_WEB_AUTH_MODE=mock-authenticated` and redeploy Web to
  fall back to the offline-only Demo posture while the backend is repaired.

---

## See also

- `docs/DEPLOYMENT.md` — deployment architecture authority
- `docs/runbooks/cloudflare.md` — Web frontend runbook
- `docs/workflow/roadmap/sync-v1.md` — #1–#56 implementation manifest
- `docs/contracts/data-repository-v0.md` — syncScope + driver contract
