# Board Task-link canonical fixture repair

- Module: Web
- Author: Sol
- Product/test baseline: `97f89da` (the same nine failures were already present at `8105cc9` and `99c36b0`)
- Fixed revision: `8ab38ed`
- Scope: Board package Task-link and Module test fixtures only; no product code changed

## Diagnosis

The six `taskLinkCommand` failures and three `BoardWorkspacesModule` failures shared one test-adapter regression. After D2 fixed `browserAccountLock`, the product correctly calls the native three-argument Web Locks overload for the account lifecycle shared lock. The Board fixtures still implemented only `(name, callback)`, so they tried to invoke the lifecycle lock options object as a callback. The command returned an honest Task-phase failure before any canonical Task write.

The replacement `createTestLockManager` implements both standard Web Locks callback overloads and deterministic named FIFO scheduling with shared cohorts. It therefore models the outer shared lifecycle lock and the inner exclusive dataset lock instead of accepting options and immediately bypassing contention.

The added same-owner concurrency assertion proves that two overlapping attempts take shared lifecycle locks and exclusive Task dataset locks, produce one canonical Task write and one linked task, then allow the losing acknowledgement attempt to retry without another Task write. Existing quota, retained intent, account isolation, identifier collision, durable receipt preservation, invalid-domain refusal, move/archive recovery, changed pending request, and Module retry assertions were unchanged.

## Results

| Check | Before | Fixed `8ab38ed` |
| --- | --- | --- |
| Full Board package | 26 files passed, 2 files failed; 326 passed / 9 failed | 27/27 files, 336/336 tests passed |
| Task-link focused package tests | 6 existing failures | 12/12 passed, including the new queued same-owner case |
| Module Task-link cases | 3 failures | 3/3 passed |
| TypeScript | not part of the old failure capture | passed |
| ESLint | not part of the old failure capture | passed |

Raw evidence:

- `before-package-99c36b0.log` is an unchanged copy of the earlier immutable package run and preserves all nine original failures.
- `after-package-8ab38ed.log` records the author full-package run with the exact file state committed as `8ab38ed`.
- `after-focused-8ab38ed.log` records the 15 focused Task-link/Module business checks.
- `typecheck-8ab38ed.log` and `lint-8ab38ed.log` record the package checks. Only later review/native documentation commits were above `8ab38ed` when these two commands were archived; the package tree was unchanged.

Parent independent evidence also pins the fixed revision: `docs/reviews/web-board-tasklink-native/parent-tasklink-fixed-8ab38ed.log` reruns the complete package, while commit `25dc196` records real Chrome/native Web Locks failure, reload retry, and second-reload idempotence with a complete marker and explicit test-only activation.

## Boundary

The deterministic test lock manager validates ordering and lock modes, while the parent native run validates the browser receiver and native scheduler. Canonical command activation remains off by default in production. This fixture repair does not activate the feature, close D2/AI02, or replace the remaining independent review gates.
