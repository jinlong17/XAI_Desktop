# Roadmap Seed — apple-developer-account

> sync-v1 roadmap · feature #10 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): companion to T-10/T-17 (signed-build verification)
> Status hint: BLOCKED_EXTERNAL

## Requirement
Obtain an Apple Developer account so signed-build Keychain ACL (bundle-id-restricted trusted application list) and MAS-sandbox behavior can be verified for real. External/human task; gates real verification of #8 (keychain-bridge) and #17 (signup/login) — not their implementation.

## Hard constraints
- FR-AC-08: ACL limited to trusted application list requires a signed build; unsigned dev builds cannot fully exercise the bundle-id ACL — verification is what this row unblocks (PRD §5.1 FR-AC-08).
- Included per roadmap-prompts §2.2 hint (expect 1–2 BLOCKED_EXTERNAL: Supabase + Apple Developer); gates signed-build Keychain-ACL + MAS-sandbox verification of #8/#17 only (manifest Decomposition Rationale §R8).
- Code boundary: external Apple Developer portal + signing config in build pipeline (no business code).

## Threat model binding
- T3 (stolen-but-locked Mac): signed-build ACL verification confirms the Keychain `WhenUnlockedThisDeviceOnly` + bundle-id ACL protection holds on a real signed binary (PRD §2 T3, FR-AC-08).
- STRIDE Information Disclosure / Elevation-of-Privilege across TB-4 (macOS Keychain ACL).

## Acceptance signal
Apple Developer account active; signed build + MAS sandbox available so #8/#17 can verify the bundle-id ACL and sandbox behavior on real hardware.

## Dependencies (advisory — manifest is authoritative)
Depends On: — (EXTERNAL, human; gates signed-build verification of #8/#17)
