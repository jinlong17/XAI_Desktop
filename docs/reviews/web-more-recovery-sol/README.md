# More independent evidence archive

This directory contains the Sol-authored More 15-field and Reset Default business matrix, its immutable archive runner, and every raw run produced while correcting reviewer fixtures and independently verifying the product. The logs are retained so another machine can reconstruct both the accepted evidence and the diagnostic path; diagnostic logs do not add coverage or change the final counts.

## Authoritative baseline at `afbfb24`

- `fields-before3-afbfb24.log`: 2 passed, 20 failed (22)
- `reset-before3-afbfb24.log`: 2 passed, 18 failed (20)
- `queues-before3-afbfb24.log`: 0 passed, 14 failed (14)
- `boundaries-before4-afbfb24.log`: 0 passed, 10 failed (10)
- `owner-export-before4-afbfb24.log`: 1 passed, 12 failed (13)
- `original-before2-afbfb24.log`: 12 passed (MP1–MP10 plus the two existing REL-03 cases)

The independent baseline is therefore 5 passed and 74 correctly failed across 79 Sol cases. The separate inherited product suite is 12/12.

## Authoritative fixed evidence at `7b216a3`

- `fields-final1-7b216a3.log`: 22 passed
- `reset-final1-7b216a3.log`: 20 passed
- `queues-final1-7b216a3.log`: 14 passed
- `boundaries-final1-7b216a3.log`: 10 passed
- `owner-export-final1-7b216a3.log`: 13 passed
- `original-final1-7b216a3.log`: 15 passed (the preserved 12 plus 3 product-author additions)

The independent fixed matrix is 79/79. The separate current product suite is 15/15. See `review-7b216a3.md` for attribution and limits.

## Diagnostic logs

All other 22 `.log` files are immutable diagnostics. `before1` and `before2` captured the first reviewer fixture iterations; the superseded `before3` boundaries/owner runs exposed a missing helper import and an overstrict post-deletion Retry expectation. The `fixed1`/`fixed2`/`fixed3` runs against `982ab68` separated reviewer issues from a real caller defect: pending reset drafts displayed saved values rather than registry defaults. They are retained as investigation evidence and are not included in the authoritative 79-case before/final arithmetic.

`verify-fixed.mjs` always expands the requested Git revision into a temporary archive, copies the current reviewer oracle into that archive, runs Vitest there, refuses to overwrite an existing log, and records both the requested revision and resolved full commit.
