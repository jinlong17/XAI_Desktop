# Parent native async-preference before evidence

Fixed product `a82efa0`, actual Collaborate select in isolated Chrome with real native account locks, complete synthetic account markers, and physical string preference values. No production admission or provider is involved. `native-a82efa0-parent-before-confirmed-fault.json` reproduces two correct failures:

1. While an actual exclusive lifecycle lock is held, selecting edit immediately changes physical bytes rather than retaining comment and showing pending.
2. A confirmed actual quota rejection leaves physical comment intact but loses the user's selected edit value rather than retaining it for retry.

The second assertion now explicitly checks the injected rejected-write counter before testing draft retention; the earlier `native-a82efa0-parent-before.json` is preserved separately. Subsequent Not saved/Retry/Saving and restart assertions are not claimed reached in failing runs. On a repaired product the unchanged probe requires visible pending/failure feedback, actual Retry persistence to raw string edit, then exact persisted value after whole-browser exit/reopen. This covers the first concrete user flow only; the contract's two-document functional updater/other boundaries remain separate acceptance work.

Harness initialization initially lacked a ReactDOM resolver and stopped before product execution; the runner now uses the installed apps/web dependency path while all workspace packages remain pinned to the git archive. No product code was changed to obtain the failures.
