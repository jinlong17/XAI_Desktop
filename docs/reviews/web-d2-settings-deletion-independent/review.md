# Settings deletion coordination — independent consumer baseline

Parent, Web, fixed `c201a1d`, 2026-09-09. Actual Settings `resumeAccountLocalDeletion` and storage APIs; isolated jsdom storage, controlled native-style lock callback gate, only the separate secret participant stubbed. These are consumer ordering/recovery checks, not native-browser or secret-store integration acceptance.

The original three assertions produce two correct failures and one passing control:

- While an exclusive cleanup request should wait, existing Settings synchronously deletes data, advances its receipt, and calls secret/auth cleanup before the gate releases. No account lock is requested.
- An unavailable account lock does not refuse existing cleanup; data and phase still advance.
- Partial physical removal after the marker is removed can retry, targeting captured A while B remains current and untouched; repeated completed receipt does not repeat auth cleanup. This positive baseline must remain working when async coordination is connected.

See `independent-c201a1d.log`. The queue assertions always release and await the operation before final completion checks. The removal control faults the real physical remove path and verifies A/B bytes and exact captured auth owner/generation.

```sh
node docs/reviews/web-d2-settings-deletion-independent/verify-fixed.mjs c201a1d
```

Source compatibility gap: Settings reconstructs a durable captured scope with epoch -1; `deleteAccountLocalDataAccount` currently requires object identity with the live account controller. A direct awaited replacement therefore cannot preserve cross-session recovery. Terra's attempted change was reverted rather than introducing a synchronous fallback. Astra is defining a narrowly authorized, durable-receipt-bound recovery entry point. This baseline does not itself authorize weakening ordinary owner guards, interpreting any tombstone string as a valid deletion intent, or holding secret/auth network work under the account lock.

The four-case follow-up at `dbc2e69` retains three correct failures / one passing control (`independent-dbc2e69.log`). The new case externally replaces the saved receipt with a valid same-account/business-generation receipt carrying a different auth generation while the old secret cleanup is awaited. The old operation calls its old auth cleanup and overwrites the replacement with its own completed receipt. The oracle requires refusal, replacement preservation and no subsequent old auth call. External raw replacement deliberately does not require the new begin API to authorize replacing an existing pending intent.

The lock fixture now checks the exact account-lifecycle name and exclusive mode rather than requiring exactly one total lock request. This accommodates Astra's approved separate recovery single-flight lock and short lifecycle phase transitions; all pending/data/participant ordering assertions remain. The original three-case baseline log is untouched. These tests still stub the secret participant and do not claim multi-store or browser evidence.

The approved begin operation can now wait, so the fixture explicitly awaits `beginAccountLocalDeletion` under a native-style immediate lock adapter before installing each recovery fault/gate. This works for the previous synchronous begin too. Fixed pre-repair `ea5ba0b` still reproduces the same three correct failures and one passing control (`independent-ea5ba0b.log`); no business assertion changed to accommodate a false cleanup result.
