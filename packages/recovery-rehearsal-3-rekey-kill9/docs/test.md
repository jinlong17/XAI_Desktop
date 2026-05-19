# recovery-rehearsal-3-rekey-kill9 — Test Report

## 2026-05-19 Local Autorun

Not executed.

Reason:

- The seed requires the exact recovery rehearsal: Re-key, `kill -9` at staging
  30%, staging 70%, before swap, and after swap, restart, and verify data
  consistency.
- The autorun policy explicitly says recovery rehearsals are recorded as
  deferred instead of being performed in this environment.

## Deferred Verification

- Real app process kill/restart at all four Re-key points.
- Real post-restart consistency verification:
  - staging before swap rolls back and retries.
  - after swap continues with keyring dual-read behavior.
- Human review and independent verification of the rehearsal log.
