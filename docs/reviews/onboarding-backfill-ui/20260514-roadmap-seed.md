# Roadmap Seed — onboarding-backfill-ui

> sync-v1 roadmap · feature #18 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-09 (UI flow, PRD §3.3 step 10)
> Status hint: PENDING

## Requirement
Build the first-registration mandatory UI flow: a 3-screen "master password + Secret Key double-loss = data loss" strong prompt, type-back verification of 6 of the 24 mnemonic words and 4 digits of the secret_key, local validation via dek_check/secret_key_check, and an Emergency Kit (print / PDF, secret_key + QR). Weak passwords rejected (zxcvbn ≥ 3).

## Hard constraints
- FR-AC-09: 3-screen strong prompt + type-back 6 mnemonic words ✅ + 4 secret_key digits ✅; reject weak password (zxcvbn ≥ 3); FR-SY-73 Emergency Kit print/PDF backup.
- Mnemonic acknowledgement / secret_key acknowledgement must be set via Edge Function + Ed25519 proof (accounts UPDATE controlled by service_role, PRD §3.3 step 10d) — not a direct client UPDATE.
- Business components live inside `plugin-account`; generic widgets (PasswordPrompt / MnemonicDisplay) may go in `@repo/ui` (dev-plan §2, codebase-orientation §6).
- Code boundary: `packages/plugin-account/src/components/` (+ `@repo/ui` for generic prompts) per codebase-orientation §6.

## Threat model binding
- T4 (forgot master password): the strong prompt + forced backfill is the primary mitigation against permanent data loss (PRD §2 T4, FR-AC-09, R-10.2).
- STRIDE availability / user-error class across TB-1 (user-held recovery secret).

## Acceptance signal
Onboarding cannot complete without correct 6-word + 4-digit backfill; weak password rejected; Emergency Kit PDF generated; FR-AC-09 + FR-SY-73 backfill acceptance pass (PRD §10.1).

## Dependencies (advisory — manifest is authoritative)
Depends On: account-signup-login, bip39-mnemonic-24w (shipped)
