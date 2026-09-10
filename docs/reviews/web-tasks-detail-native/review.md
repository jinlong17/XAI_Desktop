# Tasks detail recovery — native independent verification

Parent independent evidence, Web, 2026-09-09. Actual TasksModule and public `mutateCanonicalDataset`, pinned package imports from a git archive, isolated headless Chrome profile, native WebLocks/localStorage. Quota is deliberately faulted at the physical write. No provider calls or production accounts.

Fixed `3241529` reproduces three correct failures: observed external target changes are overwritten by a detail Save both initially and after quota recovery; a public writer deleting the target hides the unsaved detail. These are native counterparts to part of Astra `0143952`, not a new full Tasks review or UI appearance acceptance. The external mutation uses the supported public ordinary writer and same-tab publication, not a raw unvalidated replacement.

```sh
node docs/reviews/web-tasks-detail-native/verify-native.mjs 3241529
```

`native-3241529.json` retains all three failures. No process-restart phase is run when initial cases fail. On a future fully passing run the runner checkpoints exact committed bytes externally, observes the Chrome process exit and starts another process with the same profile. Reopened assertions cover persisted external edits/deletion and rendered state only; they do not claim unsaved detail drafts survive a process exit. The original separate three-case Tasks startup/checkbox/composer restart evidence remains unchanged.

## Fixed repair verification

The unchanged runner and three assertions pass at `170c526`: three initial detail recovery cases, followed by three persisted-state/UI checks after Chrome PID 83894 exits via SIGTERM and PID 83912 starts with the same isolated profile. Evidence: `native-170c526.json`. The prior correct failures remain intact. This verifies visible latest draft recovery during the current page lifetime and preservation of the external committed data; it does not assert that closing the browser persists an unsaved draft.

The parent separately reran Astra's unchanged 18 boundaries at this snapshot (18 PASS; `../web-board-workspace-astra-review/d1-tasks-boundaries-parent-170c526.log`). Full Tasks D1 scope acceptance remains with the non-author Astra reviewer.


## Integrated fixed verification at e9fb5e7

Parent independently reran the unchanged native initial assertions on fixed `e9fb5e7`, including Tasks repair `0c4b6b4` and the native adapter repair: 3 initial cases PASS, then 3 persisted-state/UI cases PASS after observed Chrome SIGTERM exit, PID 91661 → 91677. See `native-e9fb5e7.json`. Prior failing logs and author evidence remain separate. The original scope limitations still apply; this does not accept the remaining D2 foundation failures or every product caller.
