# Roadmap Seed — credential-rotation-sop

> sync-v1 roadmap · feature #48 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-57
> Status hint: PENDING

## Requirement
Write `docs/runbook/credential-rotation.md` covering service_role key and JWT secret rotation SOP, run a rotation drill once (rotate service_role + JWT secret with graceful user-session transition), and include a graded-response playbook.

## Hard constraints
- `.env.production` never in git; secrets only in CI secret + GitHub Actions runner; quarterly rotation; SOP documented in `docs/runbook/credential-rotation.md` (FR-SY-59).
- JWT secret rotation forces all users to re-login (acceptable); Realtime WS proactively reconnects on token rotation (FR-SY-60 / L-04).
- Graded-response playbook required (M-05) — drill must exercise it.
- Code boundary: runbook in `docs/runbook/`; drill is ops procedure, no plugin code change (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T8 (credential leak — service_role / JWT secret / OAuth secret) — rotation SOP freezes exposure within 2 hours.
- PRD §11 R-10.8 (credential leak) — quarterly rotation SOP + graded-response playbook (M-05).

## Acceptance signal
PRD §10.3 / dev-plan §7: one rotation SOP drill completed (service_role + JWT secret rotated with graceful session transition) including the graded-response playbook walkthrough; runbook file exists and is followed end-to-end.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate. Blocked by #37 Phase 4.8 → Phase 5 gate.
