# Roadmap Seed — realtime-private-channel-config

> sync-v1 roadmap · feature #21 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-04
> Status hint: PENDING

## Requirement
Enable Supabase Realtime Private Channels + Authorization and configure the `realtime.messages` RLS policy so each account has a `sync:<account_id>` private channel. Configuration only — Phase 0 does NOT subscribe, but the config is in place.

## Hard constraints
- FR-SY-27 (H-09 / H-I): `config.private: true` is MANDATORY (not optional); `realtime.messages` RLS = `USING (extension = 'postgres_changes' AND realtime.topic() = 'sync:' || auth.uid())`; v0.6 H-12 RLS also includes active-device check.
- Phase 0 = config only, no subscribe (dev-plan T-04); subscription itself is feature #38 (Phase 5).
- Code boundary: `apps/web/supabase/` Realtime config + migration per dev-plan T-04; no client subscribe code.

## Threat model binding
- T7 (Realtime channel snooping): Private Channels + Authorization + RLS topic-binding to auth.uid() prevents cross-account channel subscription (PRD §2 T7, FR-SY-27, GAP-D3 related).
- STRIDE Information Disclosure / Spoofing across TB-9 (Supabase Realtime channel).

## Acceptance signal
`config.private:true` enforced; integration test (deferred to #38): user_B subscribing to `sync:<user_A_id>` receives 0 messages; RLS policy deployed (blocked-by #9 for live verify).

## Dependencies (advisory — manifest is authoritative)
Depends On: supabase-schema-migrations (shipped) · deploy blocked-by supabase-project-provisioning
