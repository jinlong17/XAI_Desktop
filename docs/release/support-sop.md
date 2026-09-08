# Support SOP

Status: GA support flow draft.

## Intake

Issue template fields:

- App version and channel.
- macOS version and hardware.
- Distribution path: DMG or MAS.
- Last successful launch time.
- Sync enabled: yes/no.
- Device action involved: login, revoke, export, import, delete.
- Crash report ID, if available.

## Triage

| Severity | Response target | Criteria |
|---|---:|---|
| S0 | 4 business hours | data loss, account lockout, repeated crash on launch |
| S1 | 1 business day | sync blocked, export/import blocked, device revoke failure |
| S2 | 3 business days | UI defect, non-critical degraded feature |
| S3 | next planning cycle | copy, docs, low-risk polish |

## Crash Flow

1. Locate Sentry event by release and hashed device/account identifiers.
2. Confirm symbolication exists for the build.
3. Check whether the crash affects startup, sync, Keychain, or export/import.
4. Reproduce on the matching channel.
5. Add the incident to release notes if user-visible.

## Known Issues

- Supabase Auth, production device revoke RPC, and delete-account execution are mocked until staging credentials are provisioned.
- DMG signing/notarization and MAS submission require Apple Developer gates.
- Web import restore validates bundles locally but does not write to production sync storage.
