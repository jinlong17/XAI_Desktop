# Tasks detail recovery — native independent verification

Parent independent evidence, Web, 2026-09-09. Actual TasksModule and public `mutateCanonicalDataset`, pinned package imports from a git archive, isolated headless Chrome profile, native WebLocks/localStorage. Quota is deliberately faulted at the physical write. No provider calls or production accounts.

Fixed `3241529` reproduces three correct failures: observed external target changes are overwritten by a detail Save both initially and after quota recovery; a public writer deleting the target hides the unsaved detail. These are native counterparts to part of Astra `0143952`, not a new full Tasks review or UI appearance acceptance. The external mutation uses the supported public ordinary writer and same-tab publication, not a raw unvalidated replacement.

```sh
node docs/reviews/web-tasks-detail-native/verify-native.mjs 3241529
```

`native-3241529.json` retains all three failures. No process-restart phase is run when initial cases fail. On a future fully passing run the runner checkpoints exact committed bytes externally, observes the Chrome process exit and starts another process with the same profile. Reopened assertions cover persisted external edits/deletion and rendered state only; they do not claim unsaved detail drafts survive a process exit. The original separate three-case Tasks startup/checkbox/composer restart evidence remains unchanged.
