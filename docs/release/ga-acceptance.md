# GA Acceptance Checklist

Status: release-candidate acceptance plan.

## Smoke Commands

```bash
pnpm check
pnpm --filter desktop build
pnpm --filter web build
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm --filter @repo/core-data test
pnpm --filter @repo/plugin-account test
```

## E2E Scenarios

- Fresh install, first launch, control window opens.
- Existing local data migrates without data loss.
- Login mock path returns a session and passkey stub reports WebAuthn availability.
- Device list shows current and paired devices; remote revoke marks the target device revoked and records re-key required.
- Export downloads an encrypted bundle envelope; import verifies the bundle before restore.
- Delete-account page generates a plugin-account-compatible deletion plan.
- Offline launch preserves local state.

## Upgrade and Migration Plan

1. Install the latest beta build.
2. Create organizer, task, project, clipboard, and account mock data.
3. Upgrade to `1.0.0-rc.1`.
4. Verify Repository v0 records and plugin state are readable.
5. Run export/import verification.
6. Repeat from a copied app data directory to detect rollback or stale schema behavior.

## Long-Run Stability

- 8-hour idle run with desktop/control windows open.
- 1-hour interaction run across organizer, console, devices, and export/import.
- Crash-free threshold: zero S0/S1 crashes on the RC candidate.
- Memory threshold: no unbounded growth during idle or repeated export/import.

## Deferred Gates

- Real two-device Supabase sync and revoke rehearsal.
- Apple notarized DMG install/upgrade.
- MAS sandbox runtime smoke.
- Legal approval for terms/privacy.
