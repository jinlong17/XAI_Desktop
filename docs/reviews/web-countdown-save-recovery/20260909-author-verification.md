# Countdown REL05 author verification

Product `179e6d5`; baseline `3cd8870`. This is author verification, awaiting another agent's independent acceptance. REL05 is not closed.

## Confirmed before and corrected behavior

The fixed-before native probe fails the correct oracles: create loses editor and text, no visible error; delete closes the editor without changing stored bytes. Source cause was ignored usePref setter results in Module, plus Dialog.closeWith closing before invoking save/delete.

All card writes now pass through useCountdownSaveRecovery: one retained scoped proposal and original raw baseline, explicit failure, retry and export. Card action retry writes the identical proposal (including duplicate IDs), not a newly generated duplicate. Editor retry uses latest fields. Changed raw or old account cannot overwrite or export. A changed live editor entity also refuses saving/deleting. All pin/hide/delete/duplicate/restore/reorder handlers and auto-preset merge use this path. Failed preset reconciliation is visible and only retries explicitly.

Dialog invokes callbacks before closing, and treats explicit false as failure; legacy standalone void callback consumers remain compatible. Failure and export actions are inside the native dialog; recovery touch targets are at least 44px. Explicit Cancel/scrim/Escape retain their existing discard semantics.

## Validation

- Full package: **14 files / 128 tests PASS**, including 10 new recovery cases. Preserve original business assertions.
- `pnpm --filter @repo/plugin-web-countdown typecheck`: exit 0.
- `pnpm --filter @repo/plugin-web-countdown lint`: exit 0.
- Fixed native after: **7 groups PASS**. Actual Module/Dialog, original create/delete oracle, delete retry, real downloaded JSON (current title + note + original stored bytes), exactly one latest card on retry, actual Pin failure/retry, newer baseline rejection, A/B old retry/export rejection and no file.
- Parameterized regression applies native Storage faults to pin/hide/duplicate/delete/restore/reorder proposals, preserves old bytes, retries exactly once. Automatic preset failure/retry has a separate actual Module test.

Commands:

```sh
node docs/reviews/web-countdown-save-recovery/verify-native.mjs
COUNTDOWN_VERIFY_COMMIT=179e6d5 node docs/reviews/web-countdown-save-recovery/verify-native.mjs
pnpm --filter @repo/plugin-web-countdown test
```

First command intentionally exits 1 for the broken snapshot. Native harness pins all @repo imports through Git archive, uses temporary Chrome profile and download directory, native dialog/Storage and actual JSON download. No user data or production services. No anchor/Blob interception. Button interaction is DOM click, not human pointer input. The native renderer tests Pin; the other mutation paths are covered by the shared recovery/reducer regression, not claimed as individually pointer-tested.

## Limits

Synchronous raw comparisons do not implement cross-tab atomicity. Drafts are memory-held, not durable across full reload. Export is manual recovery, no automatic import. Preset cards remain a computed presentation; an unsuccessful persistence reconciliation now has an explicit unsaved warning rather than silent success. Invalid schema behavior and countdown computation/product design remain outside this REL05 fix. No cross-vendor or deploy approval is claimed.
