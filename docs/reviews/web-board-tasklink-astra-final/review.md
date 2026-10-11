# Astra acceptance: Board Task-link fixture-only repair

Verdict: **ACCEPTED, bounded to fixture repair at `8ab38ed`**. No product code was changed by this review. The earlier three-append Board detail acceptance remains unchanged. This does not activate canonical commands in production or close full D2, AI02, REL-05, or release readiness.

## Review of author delta

The `8ab38ed` diff contains exactly two existing test setup replacements, one test-only named lock scheduler, and one added concurrency test. Existing business assertions in `BoardWorkspacesModule.test.tsx` and `taskLinkCommand.test.ts` remain intact. The new concurrency test checks one canonical Task write, one linked task, retained acknowledgement semantics, idempotent retry, shared lifecycle mode, and exclusive dataset mode.

The scheduler accepts the two-argument callback overload and three-argument options overload. Per-name reader/writer state allows shared cohorts; an exclusive queue head blocks later readers, so they cannot bypass a waiting writer. Completion, synchronous throw, and promise rejection release ownership and drain the same named queue. Different names have independent state. This is deliberately the Web Locks subset used by these tests, not a claim to implement abort/steal/ifAvailable/query or the browser Lock callback argument.

Independent scheduler probes at fixed `8ab38ed`: **3/3 PASS**, `independent-8ab38ed.log`. They verify shared overlap plus a queued writer before a later reader, progress on a separate name, synchronous/asynchronous failures and subsequent acquisition, and default exclusive semantics for both overloads. These are reviewer-written tests, separate from the author's package assertions.

## Original independent D1 assertions restored

The old review tests still contained two-argument-only adapters. Updated only their adapter imports/setup and controlled lock plumbing; original assertions remain unchanged. All product code and the author's named scheduler come from the immutable archive. Overlay is explicitly recorded in the D1 runner/log headers: the three review test files plus `d1-web-locks-fixture.ts`.

The wrapper delays lifecycle admission for adversarial source changes and old/new modal operations. Once admitted, both lifecycle and nested dataset acquisition use the same named scheduler. Delaying only lifecycle admission avoids separately blocking the nested dataset acquisition and lets the existing operation-level release controls keep their original meaning. The explicit lock-failure test retains its intentional failing adapter.

Fixed `8ab38ed` results:

- Original parent baseline: **4/4 PASS**, `../web-board-workspace-astra-review/d1-board-parent-baseline-fixture-astra-8ab38ed.log`.
- Original boundary suite: **15/15 PASS**, `../web-board-workspace-astra-review/d1-board-boundaries-fixture-astra-8ab38ed.log`.
- Original repair boundaries: **4/4 PASS**, `../web-board-workspace-astra-review/d1-board-repair-fixture-astra-8ab38ed.log`.

These preserve invalid/absent source refusal, original raw bytes, owner/generation replacement refusal, target deletion, identifier collision, latest-list legitimate move, changed pending identity/timestamp, post-Task acknowledgement refusal, real modal duplicate-click suppression, quota retry uniqueness, and old/new modal operation isolation. No old failure log was overwritten.

Parent independent full-package evidence at `e5eb23f` records fixed `8ab38ed`: **27 files / 336 tests PASS**. Parent native evidence at `25dc196` separately records UI rejected write, reload retry with one Task, and another reload remaining stable. Those native runs explicitly enable the test-only activation flag; production default remains off. These are parent executions, not new executions by this reviewer; the present review adds the independent scheduler and original D1 boundary reruns above.

## Reproduce

`node docs/reviews/web-board-tasklink-astra-final/verify-fixed.mjs 8ab38ed`

For the D1 suites, run `node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 8ab38ed SUITE fixture-astra` where SUITE is `d1-board-parent-baseline`, `d1-board-boundaries`, or `d1-board-repair`. Use a different suffix for later runs to retain these raw logs.

Shared working-tree storage engine/hooks and concurrent Collaborate changes were observed and left untouched; all executions used fixed archives. No push was performed.
