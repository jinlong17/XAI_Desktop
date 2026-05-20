# Roadmap Seed — device-list-remote-revoke

> sync-v1 roadmap · feature #41 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-35
> Status hint: PENDING

## Requirement
Settings page lists logged-in devices (device_id / random name / last_active_at). "Revoke this device" performs: revoke refresh_token; set `sync_devices.revoked_at = now() AND status='revoked'`; `DELETE FROM device_dek_wraps WHERE device_id=...`; then trigger FR-SY-13 Re-key.

## Hard constraints
- Revocation MUST trigger Re-key (FR-AC-14 / C-D): new DEK_v_n+1, wrapped to other active devices' device_pub, all blobs re-encrypted — the revoked device must lose ability to decrypt new data.
- Device names default to random "Mac-XXXX", never hostname (FR-AC-14 / L-3); strong pre-revoke UI confirmation required.
- Code boundary: device-list UI + revoke logic in `packages/plugin-account/src/components/SettingsSection`; Re-key invoked via Rust crypto commands (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T11 (revoked device decrypts new data) — revoked device's KEK+DEK Keychain cache must be neutralized via Re-key.
- PRD §11 R-10.11 (revoked device still decrypts new data) — keyring marks old DEK retired.

## Acceptance signal
Revoking device A on device B sets `sync_devices.revoked_at` and deletes A's wrap; device A, even after re-login with correct secret_key, cannot fetch the new DEK_v_n+1 wrap and cannot decrypt blobs written after revocation.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, rekey-two-phase. Blocked by #37 Phase 4.8 → Phase 5 gate.
