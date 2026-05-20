# Roadmap Seed — recovery-rehearsal-3-rekey-kill9

> sync-v1 roadmap · feature #54 · wave W6 · Phase 5 · INDEPENDENT
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §10.2 ③ · dev-plan task(s): T-55 (dev-plan §5.5 rehearsal ③)
> Status hint: PENDING

## Requirement
Recovery rehearsal ③ rekey-kill9 (PRD §10.2 ③): trigger Re-key (user-initiated or device revocation) → `kill -9` the process at 4 points — staging 30%, staging 70%, before swap, after swap → restart → assert data consistency. INDEPENDENT feature.

## Hard constraints
- Execute the dev-plan §5.5 rehearsal ③ script exactly: Re-key → kill -9 at staging 30% / 70% / before-swap / after-swap → restart.
- Expected consistency rule: staging not yet swapped → rollback + retry; already swapped → continue (keyring dual-read guarantee) (dev-plan §5.5; FR-SY-13 two-phase staging+quarantine+atomic swap).
- Kept INDEPENDENT per roadmap §2.2 / R8.
- Code boundary: drill exercises the FR-SY-13 Re-key flow in `packages/plugin-account/` + Rust crypto; no new business logic (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T11 (device revocation → Re-key path) — Re-key must be crash-safe.
- PRD §11 R-10.6 (Re-key / upgrade interrupted → corrupted state) — two-phase commit + interruption recovery drill.

## Acceptance signal
dev-plan §5.5 rehearsal ③ pass: after `kill -9` at all 4 Re-key points and restart, data is consistent (un-swapped staging rolled back + retried; swapped continues, keyring dual-read holds).

## Dependencies (advisory — manifest is authoritative)
Depends On: rekey-two-phase. INDEPENDENT rehearsal.
