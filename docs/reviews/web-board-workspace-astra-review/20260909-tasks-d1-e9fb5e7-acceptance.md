# Tasks D1 — bounded independent acceptance

Astra, Web, 2026-09-09. **Accept the requested Tasks D1 scope at product `e9fb5e7dcc56679a0b2525da926fb4b53ec1ef91`, including Tasks repair `0c4b6b4`.** This resolves the remaining Complete → continued-title-edit defect from `f3a519c` / `20260909-tasks-d1-170c526-review.md`; the earlier six failures from `0143952` also remain repaired. The original failing logs are retained. No product file was changed by this review.

## Fix semantics and evidence

`TaskDetailPanel.save` captures a completion-field edit version alongside its existing session token. Only a successful current-session result with no newer explicit checkbox edit synchronizes local `done` to the committed `nextDone`. The version increments on every explicit checkbox change and resets for a new opened task. The existing session check still precedes pending/error/form reconciliation. Thus a successful Complete is reflected in the form for later title-only Save, while an explicit pending undo is retained for a subsequent save. Failure retains the draft; the patch does not change domain validation, captured source/baseline, completed timestamp generation, storage revision, task identity or receipt handling.

Fresh independent runs use immutable product archives. The author `aa747d4` isolated 170c526-plus-two-files run was not used as my result. The four test-only integration overlays below adapt the package's old two-argument/global-tail Web Lock fixtures to the new account-before-dataset protocol; all production imports remain fixed `e9fb5e7`.

| My run | Result | Artifact |
| --- | --- | --- |
| Original startup/checkbox/normalization baseline | 8 PASS | `d1-tasks-parent-baseline-astra-integrated-e9fb5e7.log` |
| Original full D1 independent boundaries | 18 PASS | `d1-tasks-boundaries-astra-integrated-e9fb5e7.log` |
| Original five continuation assertions | 5 PASS | `d1-tasks-continuation-astra-integrated-e9fb5e7.log` |
| Same five plus one focused pending-checkbox regression | 6 PASS | `d1-tasks-continuation-astra-pending-repair-e9fb5e7.log` |
| Actual Tasks package with test-only lock adaptation | 19 files / 178 tests PASS | `d1-tasks-package-astra-integrated-e9fb5e7.log` |

The original formerly failing case now observes checkbox checked, persisted `done:true`, and unchanged `completedAt` of `2026-09-09T19:00:00.000Z` after the title-only save. The new case makes two explicit checkbox edits while Complete is pending, ending at false. Completion commits true but does not overwrite the newer local false; the next Save intentionally persists false and removes completedAt, retaining task ID `t1` and all prior receipts. This distinguishes an explicit user undo from the previously unintended state reversal.

The unchanged 8+18+5 assertions retain three successive edits then deletion, receipt-only changes during editing, close/reopen of the same ID during pending work, stale-target and missing-target recovery, pending duplicate prevention, actual Promise rejection, A→B refusal/export isolation, list/tag cascade ordering and completed-array references, valid absent/legacy initialization, valid empty and invalid-source protection. Package coverage adds the existing reducer, drag/drop, date, composer, subscribers and recovery contracts. These overlapping counts are not summed into a coverage percentage.

## Test adaptation custody

The explicit package test-only overlays are:

- `packages/xai-web-tasks/vitest.setup.ts`
- `packages/xai-web-tasks/src/__tests__/webLocksHarness.ts` (new helper)
- `packages/xai-web-tasks/src/__tests__/canonicalSubscriberHarness.ts`
- `packages/xai-web-tasks/src/__tests__/saveRecovery.test.tsx`

The helper supports the callback-only and explicit-options overloads, separate lock-name queues, shared cohorts, exclusive exclusion and FIFO admission. It provides an idle barrier for subscriber tests. Delayed domain callbacks remain independently controllable; account shared requests do not get trapped behind the dataset Promise they enclose. This is a deterministic test subset, not an implementation of browser receiver checks, abort signals, ifAvailable or process locking, and not a native evidence substitute.

Only fixtures changed in the package: no business assertion was removed or weakened. The three saveRecovery delay seams now delay dataset execution beneath the shared account lock. The reviewer duplicate-save spy still counts one admitted dataset execution; receipt and final-domain assertions are unchanged. The reviewer close/reopen case now expects one admitted dataset callback before releasing the first operation, then two total after release, reflecting actual dataset exclusion. It still requires the second editor/draft to stay pending and then truthfully report its baseline conflict; the first committed title must remain. Source/owner race tests still mutate physical data only as explicit competitor/fault injection or initial seed, never as a replacement for the UI action under test.

The runner logs the exact overlay paths. The new helper is also copied as reviewer infrastructure when replaying old archives so the old review assertions remain runnable; historical FAIL logs are never regenerated in place. Scoped ESLint on the four package test files passes; this is test-file lint only, not a claim of a new product typecheck.

```sh
ASTRA_TASKS_LOCK_FIXTURE=1 node docs/reviews/web-board-workspace-astra-review/verify-d1-tasks.mjs e9fb5e7 '' astra-integrated
ASTRA_TASKS_LOCK_FIXTURE=1 node docs/reviews/web-board-workspace-astra-review/verify-d1-tasks.mjs e9fb5e7 d1-tasks-continuation astra-pending-repair
```

The first command now includes the added sixth continuation assertion. Use a new suffix for further executions to preserve the original five-case log.

## Native attribution and scope closure

Parent-produced independent evidence `40e4adb` was read at this same product revision. Keep its suites separate:

- `../web-account-coordination-native/native-e9fb5e7.json`: three actual native adapter/autosave/migration checks plus one persisted autosave reopen check PASS.
- `../web-tasks-detail-native/native-e9fb5e7.json`: three detail recovery cases plus three persisted-state/UI checks after Chrome PID 91661 → 91677 PASS.
- `../web-tasks-canonical-ui-native/native-e9fb5e7.json`: startup/checkbox/composer three cases plus three reopen checks after PID 91754 → 91770 PASS.

Astra did not run those browser suites again. They validate their stated actual UI/restart paths; they do not claim the Complete continuation case (covered here by actual rendered UI/storage assertions), every possible interaction, or persistence of an unsaved draft after termination.

Together with the existing full source assessment in `0143952` and the `170c526` repair review, this is sufficient bounded Tasks D1 acceptance. No further unrelated Tasks tests are required to resolve this batch. Metadata cascades remain ordered across keys rather than cross-key atomic transactions. D2 all-account coordination, its separate foundation defects and caller conversion, production activation/old-client admission, Board detail drafts, provider-network evidence, full AI-02 and REL-05 remain open. This report changes no ledger, production gate or deployment state and does not incorporate the later D2 c201a1d source.
