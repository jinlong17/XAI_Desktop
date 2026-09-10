# Tasks canonical UI writer: independent baseline protection checks

Module: web. This is parent/non-author evidence using actual TasksModule in jsdom from an immutable Git archive. It is not the complete Tasks D1 or native-browser acceptance.

## Fixed 51338e0 before

Four original assertions: 2 PASS / 2 correct FAIL. A real checkbox queued before an external target edit replaced that newer target's bytes and did not show recovery. A separate queued checkbox dropped an unrelated externally added task. Positive controls showed normal checkbox completion preserved existing durable receipts and a present invalid domain was not physically overwritten with demo tasks.

## Fixed 66a8488 after

The same four assertions pass unchanged. The queued target edit now preserves the exact externally written record and shows an alert; the unrelated external task remains. Normal completion and invalid-domain non-overwrite controls remain green. The test permits refusing a stale whole-dataset operation; it does not claim automatic merging of unrelated changes.

Commands:

```sh
node docs/reviews/web-tasks-canonical-ui-independent/verify-fixed.mjs 51338e0
node docs/reviews/web-tasks-canonical-ui-independent/verify-fixed.mjs 66a8488
```

The fixtures contain valid four-column task data, an explicit persistent account marker, and a retained receipt. Raw fixture writes model another document's storage update while the actual writer awaits its lock; only the lock scheduler is injected. Production activation remains off, enabled explicitly for this isolated test. List/tag cascades, failed-save retry, composer/detail lifetimes, normalization, all remaining callbacks, multi-document native execution and full package regressions still require their own verification. No numbered item is closed here.

## Additional retry boundary: fixed 66a8488

Expanded suite is 5 PASS / 1 correct FAIL. Original four still pass, and quota-failed checkbox retry succeeds when no external change occurs. With an external storage event after that failure, Retry adopts the now-current UI baseline while replaying the old whole-dataset draft: it overwrites the newer title, drops the external addition and clears the recovery alert. This is a distinct failure from the now-fixed initial queued write. The retry must retain its original operation baseline and refuse or explicitly resolve newer data. Evidence: tasks-ui-retry-66a8488.log. Original four-case after log is retained separately.

Expanded-run command: `node docs/reviews/web-tasks-canonical-ui-independent/verify-fixed.mjs 66a8488 tasks-ui retry`. The optional fourth argument separates evidence filenames.

## Retry repair: fixed 35b4964

Parent independently archived 35b4964 and reran the six assertions unchanged: 6/6 PASS (tasks-ui-retry-35b4964.log). Retry after an external storage update now preserves the newer record and keeps recovery visible; unchanged-baseline retry still completes. Author HEAD output is excluded from this independent result. Full Tasks D1 remains open.

## Startup/normalization boundary: fixed 94f1183

The expanded suite retains the previous six PASS and adds two correct FAIL (6 PASS / 2 FAIL, tasks-ui-startup-94f1183.log). A physically absent account record fails to initialize its valid canonical seed. A valid legacy task missing optional list/tags/priority metadata fails to normalize through the writer. The displayed hydrated/grouped snapshot is used as the comparison baseline against the unhydrated stored record, so legitimate startup normalization conflicts with itself. These are actual TasksModule checks with explicit activation, valid marker and lock support; they are not missing test activation failures. The original six cases remain unchanged.

Command: `node docs/reviews/web-tasks-canonical-ui-independent/verify-fixed.mjs 94f1183 tasks-ui startup`. Assigned to Sol together with the remaining Tasks D1 recovery work; no acceptance inferred.

## Complete author batch: fixed 3241529

Parent independently archived 3241529 and reran all eight assertions unchanged: 8/8 PASS (tasks-ui-parent-after-3241529.log). The two startup/legacy normalization failures are repaired while all prior write/retry/data-preservation cases stay green. Author runs are separately labelled tasks-ui-sol-after-3241529.log and author-unpinned-tasks-ui-retry-HEAD.log and are not counted as independent evidence. Full Tasks D1 Astra review remains pending.
