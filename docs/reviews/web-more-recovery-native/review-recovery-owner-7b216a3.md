# More native N3 recovery and owner verification

Product fixed at `7b216a3d5a4947d0f66da042fb275302737fb762`. Parent-owned real Chrome verification using the immutable archive, actual composed Settings/Shell surface, isolated storage/profile/download directory, and an independent same-origin document.

## Verdict

**PASS for N3 `recovery-owner`.** Chrome `153.0.8010.48` reported zero runtime exceptions or console errors.

Command:

```sh
node docs/reviews/web-more-recovery-native/verify-native.mjs 7b216a3 recovery-owner control-plane-20260917-n3-v2
```

Authoritative log: `native-7b216a3-control-plane-20260917-n3-v2-recovery-owner.log`

SHA-256: `14512c1913ef71396759d62d057c4e96e094b5d6c4c4bb9a11fff1d8c2719283`

## Evidence

- A denied set retained the exact draft and field attribution. Retry made one successful physical write after one refused attempt and removed the warning.
- A real Web Lock held a pending write. Repeated Retry actions did not duplicate it; release produced exactly one physical write and cleared recovery.
- An uncertain write persisted once but failed immediate readback. Retry reconciled the matching physical value without a second write.
- A separate same-origin Chrome document changed the physical value after an uncertain write. Retry did not overwrite those external bytes or issue another main-document write; recovery remained until explicit discard.
- Actual downloads proved three exact `more-draft.json` payloads without persistence access: sparse device-only, mixed device/account through the departure dialog's Export action, and all 15 fields split into 13 device plus two account changes.
- A Reset Default run with one denied removal completed the other 14 removals, retained the failed physical value, displayed the intended default with reset-specific failure attribution, then removed the final key through Retry. All 15 physical keys were absent and the completion truth appeared.
- Pending A device/account work was carried through A→B→locked. B and locked state never saw or wrote A's private draft; the device draft remained exportable, completed after lock release, and left no recovery or `beforeunload` handler. A and B private physical keys stayed isolated.

## Diagnostic attribution

The first runner invocation reached and passed the export matrix, then was manually stopped because fixture refresh had not discarded the deliberate drafts before browser reload. Chrome correctly held the reload with `beforeunload`. This was a verifier sequencing issue, produced no evidence file, and changed no product source. The authoritative second invocation added explicit draft cleanup before reload and passed the complete N3 contract.

## Limits

N3 does not provide N4 bilingual responsive visual, hit-testing, target-size, or manual screenshot evidence. Final Settings/Web/storage and accepted-caller regressions plus Astra reconciliation also remain pending.

This result closes no 312 item, D2/REL/AI obligation, deployment gate, or release gate.
