# Roadmap Seed — quota-rate-limit

> sync-v1 roadmap · feature #43 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-43, T-44, T-45
> Status hint: PENDING

## Requirement
Enforce per-account push rate limit (100 req/min/account) at the Supabase edge function wrapping `/sync/push`, a monthly traffic cap that degrades the account to read-only when exceeded, and a daily cost dashboard with a monthly reconciliation template.

## Hard constraints
- 100 req/min/account via edge function rate limit / Postgres advisory lock; over-limit → 429 + Retry-After (FR-SY-62).
- Monthly cap (Free tier 500MB/month blob upload): over-limit → read-only mode (pull allowed, push blocked) + upgrade UI prompt (FR-SY-63).
- Cost dashboard collects DB size / monthly traffic / API calls daily; monthly reconciliation → `docs/runbook/cost-report-YYYY-MM.md` (FR-SY-64).
- Code boundary: rate-limit wrapper in the Supabase edge function; quota UI in `packages/plugin-account/`; dashboard scrape is ops tooling/runbook (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T8 / §11 R-10.8 (credential leak / abuse via service tier) — rate limit constrains push abuse blast radius; supports graded-response playbook.
- STRIDE Denial of Service on the `/sync/push` boundary (per-account QPS ceiling).

## Acceptance signal
Hitting >100 req/min returns 429 + Retry-After; exceeding the monthly cap degrades the account to read-only (pull still works, push refused) with an upgrade prompt; cost dashboard produces a monthly reconciliation file.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, push-edge-function. Blocked by #37 Phase 4.8 → Phase 5 gate.
