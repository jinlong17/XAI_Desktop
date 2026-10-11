# Sol independent Notifications caller verification — `afbfb24`

## Fixed-archive result and attribution

The complete current Sol archive run passes **41/41** at `afbfb24d6f7311366b77852eda927d08467478c2`:

- current product Notifications tests: 11/11 (`NF1`–`NF11`)
- Sol core: 11/11
- Sol recovery: 3/3
- Sol operations/owner: 2/2
- Sol boundaries: 4/4
- Sol extended contract boundaries: 10/10

The current arithmetic is 11 product-authored tests plus 30 Sol-authored assertions. `NF10` was added by the product evidence commit `f2f2ca8` for hidden quiet-start recovery. `NF11` was added with the caller fix `afbfb24` for independent quiet-time validation feedback. Neither is relabelled as a Sol test. The original baseline remains NF1–NF9 only.

All six authoritative current logs use the `final6-afbfb24` suffix, record the exact full SHA above and report `exit=0`. The immutable runner archives that Git revision, reconstructs package aliases from the archive and copies the committed Sol fixture/tests into the temporary tree. No working-tree product code is admitted.

## Red-to-green chain

The authoritative initial matrix at `d9d9fdd` recorded 10 PASS / 19 correct FAIL across 29 tests. Its healthy native sound/time control and NF1–NF9 passed while all recovery assertions failed for product behavior. The first fixed caller `6b90b22` improved the same matrix to 28 PASS / 1 correct FAIL. The remaining public failure proved that one invalid time field replaced another field's unresolved feedback and an unrelated valid edit could erase it.

The unchanged malformed-field oracle passes at `afbfb24`: invalid Start and End feedback coexist, an unrelated valid Sound edit clears neither, global Saved stays absent, and a valid Start edit clears only Start while End remains. The caller now stores per-field validation state rather than one shared field slot.

The final ten-test extension was also frozen against `d9d9fdd`: 2 positive PASS for registry defaults without storage seeding and device persistence under an unrelated held account lock, plus 8 correct FAILs for recovery behavior. All ten pass unchanged at `afbfb24`. Across the final expanded baseline there are therefore **12 PASS / 27 correct FAIL across 39 then-existing tests**; the two later product tests did not exist at the baseline SHA.

## Independent business coverage

The 30 Sol assertions establish:

- all eight fields retain the latest same-turn choice after a later write failure, preserve the predecessor's physical bytes, expose field Retry and recover independently;
- all five Sound values and strict zero-padded `HH:mm` midnight, boundary, overnight and equal endpoints persist, while malformed or incomplete values do not persist or become drafts;
- invalid/unavailable hidden time sources remain labelled Reload-only and repair without writes;
- quiet=false preserves failed/pending hidden Start and End drafts for host blocking, exact sparse export, targeted Retry/discard and later visible restoration;
- exact all-eight pending export contains only device values, including hidden times;
- boolean/select/time mixed success and failure settle independently in both directions, with exact sparse export;
- predecessor-success/latest-failure and predecessor-failure/latest-queued recovery keep operation attribution; duplicate pending Retry is inert;
- missing and rejected Web Locks retain recoverable work;
- all eight absent bindings render their registry defaults without mount-time writes or storage seeding; boolean, Sound and time invalid/unavailable sources fall back to defaults, remain nonblocking and expose only Reload;
- a failed Quiet toggle does not turn successful Start/End writes into recovery drafts, while a successful global disable cannot clear failed Sound/Task subordinate choices;
- a Sound conflict and an unrelated Enabled quota failure coexist with exact two-field export, independent Retry and external-byte preservation;
- Discard all followed immediately by a same-field new Sound choice cannot let the older request settlement erase the new draft;
- unchanged uncertainty Retry survives temporary read denial with one total write, while an externally restored baseline is preserved until distinct new input supplies authority;
- targeted discard rereads only its field with zero writes and keeps a failed sibling; external conflicting bytes are not overwritten;
- device work survives A→B→locked with stale/fresh permission separation, and an unrelated held account lifecycle lock does not serialize a device-key write.

The passing recovery, operations, boundaries, extended and product logs contain some React `act(...)` warnings from late asynchronous state updates. Their awaited business assertions all pass with exit zero, but the affected outputs are warning-bearing rather than terminal-clean.

## Acceptance boundary

This is a bounded independent mounted-caller PASS. Parent-owned actual Settings/Shell/native/types and Astra-owned full host matrix, package regression and final source/contract reconciliation remain separate gates. Parent's visual evidence at `72c9a60` is not claimed as Sol execution.

This result does not accept real notification delivery, browser/native permission, push/service-worker registration, audio, Tasks/Pomodoro/Habit scheduling, all Settings writers, full312, D2, REL, or release readiness. It cannot close the complete Notifications contract by itself.
