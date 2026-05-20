# Roadmap Seed — account-deletion-gdpr

> sync-v1 roadmap · feature #51 · wave W6 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-51
> Status hint: PENDING

## Requirement
Account deletion flow: UI entry sets `accounts.deletion_scheduled_at = now + 30d` (login during window cancels it); a 30-day hard-delete cron (Supabase scheduled function) purges all the user's encrypted_blobs + accounts row + Supabase auth user; deletion is gated behind a forced pre-delete export.

## Hard constraints
- Pre-delete forced export of all data (`.json.age` encrypted, FR-SY-70) before entering the 30-day hard-delete flow (FR-AC-13).
- 30-day grace: client local data NOT deleted immediately, retained 30 days aligned with server grace period (FR-SY-52 / FR-AC-12).
- Code boundary: deletion-request UI in `packages/plugin-account/`; hard-delete cron is a Supabase scheduled function; export reuses #44 path (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T4 / T13 context — deletion must not leave decryptable residue; pre-delete export stays E2E-encrypted (FR-SY-70).
- PRD §11 R-10.7 (server dump) — hard delete must purge encrypted_blobs so a later dump yields nothing for the deleted account; compliance (GDPR) requirement.

## Acceptance signal
Submitting deletion schedules `deletion_scheduled_at = now+30d`; logging in during the window cancels it; after 30 days the cron purges all encrypted_blobs + accounts row + auth user; the forced encrypted export is presented before deletion proceeds.

## Dependencies (advisory — manifest is authoritative)
Depends On: data-export-encrypted.
