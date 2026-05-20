# Roadmap Seed — recovery-rehearsal-2-local-wipe

> sync-v1 roadmap · feature #53 · wave W6 · Phase 5 · INDEPENDENT
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §10.2 ② · dev-plan task(s): T-54 (dev-plan §5.5 rehearsal ②)
> Status hint: PENDING

## Requirement
Recovery rehearsal ② local-wipe (PRD §10.2 ②): delete `~/Library/.../xai.db*` → restart app → re-login + donor device cooperatively grants DEK wrap → full pull restores complete data within 5 minutes. INDEPENDENT feature.

## Hard constraints
- Execute the dev-plan §5.5 rehearsal ② script exactly: delete local SQLite (`xai.db*`) → restart → re-login → donor device grant DEK wrap → full pull.
- Expected: full data restored within 5 minutes (dev-plan §5.5 expected outcome).
- Kept INDEPENDENT per roadmap §2.2 / R8.
- Code boundary: drill exercises `packages/plugin-account/` login + donor-grant + pull path; no new business logic (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T3 / T3.5 (local SQLite loss / disk wipe class) — proves recoverability when local DB is destroyed but account + donor exist.
- PRD §11 R-10.5 (encrypted_dek single point of failure) — donor-grant DEK wrap recovery path validated.

## Acceptance signal
dev-plan §5.5 rehearsal ② pass: after local SQLite wipe + re-login + donor grant, full pull restores complete data within 5 minutes.

## Dependencies (advisory — manifest is authoritative)
Depends On: mnemonic-full-recovery, device-list-remote-revoke. INDEPENDENT rehearsal.
