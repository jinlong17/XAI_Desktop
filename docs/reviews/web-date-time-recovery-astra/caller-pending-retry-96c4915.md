# DateTime P1: pending Retry attributes predecessor success to a newer failure

Fixed product `96c491542e1a47847fcce0bd431491773dbabbf4`. Full DateTime remains unaccepted despite the passing shared fix and current45 Sol public checks. This is a new correct caller ordering oracle, not a reinterpretation of those passing tests or another shared engine defect.

Astra `caller-boundaries.test.tsx`, `caller-pending-before-96c4915.log`: **1correctFAIL/1healthyPASS**, using actual DateTime controls/hooks, the real named physical-key lock, and actual per-value Storage quota injection:

1. Mount from physical `monday`. Hold the start-week key lock.
2. Select `sunday` (first active operation), then select `saturday` (newer queued draft).
3. While both are outstanding, click the visible **Retry Start week on** twice.
4. Release the lock. Sunday really commits; the actual Saturday setItem throws quota.
5. Required physicalSunday/UI Saturday, guard and beforeunloadtrue, retained Export/recovery. Actual physicalSunday/UI Saturday, but guardfalse, unloadfalse and Export absent.

The positive companion permits Saturday persistence and correctly ends physical/UI Saturday, clean guard/unload. The failure oracle keeps each physical write's meaning and does not prevent normal completion to make protection pass.

Sol's original `repeated Retry during a pending toggle` runs Retry **before** creating the newer choice. That case and the new ordering are different; its PASS does not cover or refute this defect.

The DateTime `retry(field)` captures the current latest draft, but `pref.retry()` may return the currently running predecessor Promise. When it resolves success, `clearIfMatching(field, latestDraft, true)` clears the latest draft even though that draft's queued persistence subsequently fails. The callback from its failure does not recreate the already-cleared draft. The hook's documented active-Promise compatibility alone cannot identify a caller's newer draft.

## Required narrow caller correction

Track whether the **latest field draft's own submitted operation** has settled as failure and whether its own explicit retry is active. Retry on a pending/newer-not-yet-failed draft must not attach success handling to an older Promise. Collect newer controls normally; do not disable edits while pending. Duplicate Retry must not create competing recovery ownership. Clear only the matching current draft on its own verified operation/retry success. Failure, external conflict and temporary retry-read denial retain that draft/token and later Retry eligibility. Stale completion after newer edit/discard/reload/unmount cannot clear/recreate recovery.

Use the existing hook/engine semantics. No shared activePromise API change, raw preflight, timeout, or value-equality ownership check is needed. Terra owns the DateTime pane/helper/tests for this correction; parent/Sol/Astra evidence remains protected.

Run these unchanged2, Sol45 and parent real host12 on the fixed caller. Add a native pending-new-choice-before-Retry journey if practical, retaining actual user controls and physical quota result. The shared empty-token presence patch still needs its independent final token verification, but it does not fix this caller bug. The96 shared engine/foundation/other-caller positives retain exact attribution if the final product changes only DateTime caller state and empty-token detection.
