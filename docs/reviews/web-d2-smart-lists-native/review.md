# Smart Lists actual native browser baseline

Parent fixed archive `3b02e2a`, actual Smart Lists pane, synthetic complete account, real Chrome Web Locks; CSS intentionally omitted. [Before result](native-3b02e2a-before.json), [probe](native-probe.ts), [runner](verify-native.mjs).

Three correct failures reproduce the separate parent component baseline: actual row change writes early under held account lifecycle exclusive lock and held physical preference-key exclusive lock; quota loses the latest two selections. Empty-map mount remains a passing compatibility control with all twelve rows showing existing `show` fallbacks and no default write.

The unchanged after probe will also require latest pending selection, actual Retry saving both changed fields plus the unknown string extension, and a whole Chrome process exit/reopen with both exact final map bytes and actual re-rendered select values restored. These latter after/reopen assertions did not pass or run on this failing baseline. Four representative browser cases are not full twelve-producer/schema/migration coverage; Astra owns complete contract acceptance. No production data or running timer is involved.

## Expanded two-document baseline

The expanded same-version probe adds a real second-document map replacement while the first document has a dirty queued edit. [Extended before](native-3b02e2a-extended-before.json) is4 correct FAIL /1 control PASS; the new failure loses the first document's local map after the other document's storage event. Its later actual Retry/refusal and explicit whole-map discard assertions are retained for after but cannot be reached on this failing baseline. The original four-case raw result remains unchanged. The runner now refuses overwriting an existing evidence filename.

## Fixed caller40ffbe1

The unchanged expanded five PASS: [after](native-40ffbe1-after.json). Chrome99710 exits by SIGTERM with observed process exit, then new Chrome99767 opens the same isolated profile. Exact final account map bytes and actual re-rendered first two select values are restored. This is one committed map checkpoint, not durable unsaved drafts or all lifecycle interleavings.

## Recovery successor 6bf02de regression

[Fixed native recovery result](native-6bf02de-recovery.json) retains all original five representative scenarios: absent map, held account/key locks, two-document conflict, latest quota draft Retry. Chrome PID10817 exited via observed SIGTERM, and same-profile PID10832 restored the exact saved map and actual first-two select values. This verifies a saved checkpoint after a whole browser process restart; it does not establish durable recovery of an unsaved draft or all12 producer/owner/migration cases.

## Fixed 115efb2 saved checkpoint and driver cleanup repair

The first invocation exited13 in driver cleanup and produced no final receipt; [diagnostic](driver-115efb2-first-diagnostic.log) preserves the observed failure and its limits. Cleanup was waiting for an already-signalled child, and the first-process delayed termination callback captured the mutable `browser`, allowing it to target a successor. The driver now captures each child, clears its deadline on exit, checks both exitCode/signalCode, and records earlier errors before cleanup. It does not change browser business assertions.

With that repair, the [fixed115efb2 result](native-115efb2-guarded-stop.json) passes the original five cases. Chrome19233 exits via observed SIGTERM without forced fallback; Chrome19250 opens the same profile and restores exact saved raw map plus actual select values. The failed driver invocation is not a product failure or successful reopen. This completed run establishes saved-state restoration, not durable unsaved draft recovery.
