# Archived Notifications verification logs

These 28 logs are retained for cross-machine recovery of the Sol verification history. They are exploratory, repeated, partial, or fixture-diagnostic runs and do not add contract coverage beyond [review-afbfb24.md](./review-afbfb24.md).

The authoritative baseline is the five tracked `*-before3-d9d9fdd.log` files plus `extended-before6-d9d9fdd.log`: 12 PASS and 27 expected FAIL across the 39 tests that existed at that revision. The authoritative fixed result is the six `*-final6-afbfb24.log` files: 41/41 PASS, comprising 11 product-authored tests and 30 Sol-authored assertions.

The archived logs differ as follows:

- `*-before-d9d9fdd.log` and `*-before2-d9d9fdd.log` are early baseline attempts. The first Core run still had a fixture problem that incorrectly lost its healthy positive control; `before2` corrected it and `before3` froze the complete canonical baseline.
- `*-after1-6b90b22.log` is an incomplete first-fix subset. The tracked `after2` bundle is the canonical 28 PASS / 1 FAIL evidence that isolated the shared field-error defect.
- `boundaries-final1`, all `*-final1-afbfb24.log`, and all `*-final2-afbfb24.log` are repeated or pre-expansion green runs. They were superseded by the single complete `final6` run.
- `extended-before4` contains an early test-fixture failure; `extended-before5` is the corrected four-test baseline subset. The ten-test `extended-before6` is authoritative.
- `extended-final2` is the earlier four-test green subset. `extended-final3` records a missing test-helper import, `extended-final4` records correction of that fixture plus discovery of an inaccurate physical-value expectation, and `extended-final5` is the corrected ten-test subset. The unified `extended-final6` result is authoritative.

Expected red logs and fixture-diagnostic failures in this archive must not be counted as current product failures or as additional tests.
