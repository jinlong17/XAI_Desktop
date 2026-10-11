# Pomodoro durable session — dev log

- Workflow = BUGFIX
- Target = web / plugin-web-pomodoro (POMO-01/POMO-02)
- Title = Active sessions disappear on route teardown; late and failed completion are misreported
- Current Phase = BUG_FIX
- Status = FIX_READY_FOR_VERIFY
- Executor = Codex /root/rel02_auth_fix
- Updated = 2026-09-09
- Suggested Next = bug-verify (independent)

## Reproduction / root cause / rationale

See `20260909-diagnosis.md`:8 correct-expectation package probes (7FAIL/1controlPASS) plus real isolatedChrome reload/second-window diagnostic (3 expectation failures). Component-local state/refs cannot survive navigation or coordinate windows; completion uses observation time and ignores false writes. Proposed scope-aware app controller with durable deadlines and pending reconciliation, lock-protected authoritative reads, sessionId idempotency and source-compatible history. No product source changes.

## Work Log

- 2026-09-09: Parent assigned read-only POMO01/02 diagnosis. Read current rules/TODO/Pomodoro design+implementation+storage contract. Built package and realChrome diagnostic evidence; mapped event/statistics implications. Submitted state/order/concurrency/identity/failure contract before implementation to avoid diverging timer protocols. Corrected prior TT documentation: performance is TT-07, TT-04 is category-delete transaction.

- 2026-09-09 implementation: Parent approved the documented protocol. Implemented package-owned durable controller and lightweight host. Owner suite140PASS, original8expectationsPASS, storage126PASS, web143PASS; native reload/second-window3, lifecycle4, WAL crash5 and whole-browser closed/reopen proofPASS. Typecheck/lintPASS. See20260909-fix.md for exact scope, fixture changes and limits. No independent approval or push claimed.

- 2026-09-09 independent follow-up: Reviewer /root/rel01_independent_verify found stale-revision retry deadlock on ce4b767. Author separated conflict from write failure, cleared obsolete/frozen retry intents, refreshed the winner and exposed a nonblocking UI notice. Added three regression tests; 143 package tests and typecheck/lint PASS. Status remains FIX_READY_FOR_VERIFY pending independent real two-tab replay on this patch; no independent approval claimed.
