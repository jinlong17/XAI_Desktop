# Parent native async-preference before evidence

Fixed product `a82efa0`, actual Collaborate select in isolated Chrome with real native account locks, complete synthetic account markers, and physical string preference values. No production admission or provider is involved. `native-a82efa0-parent-before-confirmed-fault.json` reproduces two correct failures:

1. While an actual exclusive lifecycle lock is held, selecting edit immediately changes physical bytes rather than retaining comment and showing pending.
2. A confirmed actual quota rejection leaves physical comment intact but loses the user's selected edit value rather than retaining it for retry.

The second assertion now explicitly checks the injected rejected-write counter before testing draft retention; the earlier `native-a82efa0-parent-before.json` is preserved separately. Subsequent Not saved/Retry/Saving and restart assertions are not claimed reached in failing runs. On a repaired product the unchanged probe requires visible pending/failure feedback, actual Retry persistence to raw string edit, then exact persisted value after whole-browser exit/reopen. This covers the first concrete user flow only; the contract's two-document functional updater/other boundaries remain separate acceptance work.

Harness initialization initially lacked a ReactDOM resolver and stopped before product execution; the runner now uses the installed apps/web dependency path while all workspace packages remain pinned to the git archive. No product code was changed to obtain the failures.

## First fixed implementation

At `5ed9329` both original native cases remain correct FAIL: the held lock now preserves old physical bytes, but the actual pane loses latest selection during pending; the quota case also loses latest selection after a confirmed rejected write. `native-5ed9329-parent-initial.json` preserves this transition rather than calling the original failure wholly fixed. Parent stable-validator hook two-case suite passes at this same revision; the rendered consumer boundary needs further repair. No process-reopen claim is made after initial failure.

## Repaired real pane

Fixed `04d036b` passes both unchanged initial browser cases: held native lifecycle lock preserves physical comment while select edit and Saving remain visible; quota failure preserves edit with Not saved/Retry, then Retry commits raw string edit. Both physical-value checks also pass after observed Chrome SIGTERM exit and whole-process reopen (PID 30302 → 30329), no forced fallback. Evidence `native-04d036b-parent-pane-validator.json`. This accepts neither the complete hook/session/reset contract nor all async preference APIs; those remain independently reviewed.

## Native two-document functional serialization

At fixed `04d036b`, the expanded suite adds an independent same-origin iframe with its own module/account scope. The parent holds the actual physical-key exclusive Web Lock, queues one increment from each document, confirms no early physical mutation, then releases. Both public mutatePref operations succeed, each updater runs once, and raw counter equals 2. All three initial cases and all three process-reopen checks PASS, Chrome PID 31421 → 31477 (`native-04d036b-parent-two-document.json`). This supplies the contract's native two-document update preservation layer; it does not prove every hook session, reset, uncertain commit or old synchronous writer is coordinated.

## Native account-switch control

At fixed partial session source `2820917`, a fourth real-pane case queues A's edit behind its native lifecycle lock, switches to seeded B, and verifies B's view selection, usable device toggle, unchanged A/comment and B/view bytes after releasing the old operation, and no late UI overwrite. All four initial and four whole-browser reopen checks PASS (Chrome PID 35032 → 35049), `native-2820917-parent-session-calibrated.json`. This establishes this concrete account-switch control, not all reset/remount/session semantics.

The earlier `native-2820917-parent-session-before.json` is fixture calibration: it tried to resolve B's physical key through an invalid copied A scope and correctly hit the account scope guard before the intended switch. The fixture now seeds B with the public `generationKey` helper; no guard is bypassed and no product change was made. That earlier result is not a product regression.
