# Roadmap Seed — recovery-rehearsal-1-server-wipe

> sync-v1 roadmap · feature #52 · wave W6 · Phase 5 · INDEPENDENT
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §10.2 ① · dev-plan task(s): T-53 (dev-plan §5.5 rehearsal ①)
> Status hint: PENDING

## Requirement
Recovery rehearsal ① server-wipe (PRD §10.2 ①): server staging Supabase tables fully DELETEd → client A (local SQLite still intact) uses KEK to decrypt SQLCipher → reads all plaintext → re-encrypts with the same DEK → full push to server → client B (fresh device) recovers via email + master_password + 24-word mnemonic + new secret_key → recovery proof PATCH `/auth/me` → full pull. INDEPENDENT feature.

## Hard constraints
- Execute the dev-plan §5.5 rehearsal ① script exactly: staging DELETE → A KEK-decrypt SQLCipher → re-encrypt same DEK → full push → B mnemonic+secret_key recover → recovery proof → full pull.
- Old server cursor reset; commit_seq restarts from 1 (dev-plan §5.5 expected outcome).
- Kept INDEPENDENT per roadmap §2.2 / R8 (rehearsals are first-class features, not acceptance add-ons).
- Code boundary: rehearsal is an operational/integration drill exercising `packages/plugin-account/` recovery flow; no new business logic (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T1 (server dump/wipe class) — proves data survivable from intact local + mnemonic when server staging is wiped.
- PRD §11 R-10.5 (encrypted_dek corruption / server-side single point of failure) — recovery path validated.

## Acceptance signal
dev-plan §5.5 rehearsal ① pass: after server staging wipe + A re-encrypt-and-push + B mnemonic recovery + full pull, client A and client B data are consistent (old server cursor reset, commit_seq from 1).

## Dependencies (advisory — manifest is authoritative)
Depends On: mnemonic-full-recovery, rekey-two-phase. INDEPENDENT rehearsal.
