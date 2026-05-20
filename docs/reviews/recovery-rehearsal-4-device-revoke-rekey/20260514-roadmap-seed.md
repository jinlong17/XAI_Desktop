# Roadmap Seed — recovery-rehearsal-4-device-revoke-rekey

> sync-v1 roadmap · feature #55 · wave W6 · Phase 5 · INDEPENDENT
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §10.2 ④ · dev-plan task(s): T-55b (dev-plan §5.5 rehearsal ④)
> Status hint: PENDING

## Requirement
Recovery rehearsal ④ device-revoke-rekey (PRD §10.2 ④): two devices A,B same account → A revokes B → server sets `sync_devices.revoked_at = now()` + triggers Re-key → B, even after re-login (KEK + old DEK retained), cannot decrypt new blobs (encrypted with DEK_v2; old DEK keyring-marked retired). INDEPENDENT feature.

## Hard constraints
- Execute the dev-plan §5.5 rehearsal ④ script exactly: A,B same account → A revokes B → revoked_at + Re-key → B re-login → B fails to decrypt new blobs; A normal.
- Re-key generates DEK_v2; old DEK marked `retired` in keyring; revoked device cannot obtain the new wrap (FR-AC-14 + FR-SY-13).
- Kept INDEPENDENT per roadmap §2.2 / R8.
- Code boundary: drill exercises revoke + Re-key path in `packages/plugin-account/` + Rust crypto; no new business logic (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T11 (revoked device decrypts new data) — must be blocked even after re-login with retained KEK+DEK.
- PRD §11 R-10.11 (revoked device still decrypts new data) — keyring retired marking validated by this rehearsal.

## Acceptance signal
dev-plan §5.5 rehearsal ④ pass: after A revokes B and Re-key completes, B (even re-logged-in with old KEK+DEK) fails to decrypt blobs written post-revocation; A continues normally.

## Dependencies (advisory — manifest is authoritative)
Depends On: device-list-remote-revoke, rekey-two-phase. INDEPENDENT rehearsal.
