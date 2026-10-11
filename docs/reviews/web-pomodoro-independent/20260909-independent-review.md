# POMO-01 / POMO-02 independent verification

Baseline fixed `ce4b767`; verifier did not author Pomodoro implementation. Every probe archives the Git snapshot and resolves all @repo source from that snapshot. Browser profiles and storage are disposable synthetic localhost fixtures; no production/user session or real service is used.

## Final separate conclusions at `4868d0a`

- **POMO-01: PASS; complete for its current TODO acceptance contract.** Activity survives route changes, reload and full browser close/reopen; paused elapsed is retained without offline accumulation. The independently found stale-revision and competing-Start liveness defects are fixed and strict native after assertions pass.
- **POMO-02: PASS; complete for its current TODO acceptance contract.** Original deadline/elapsed/recordedAt semantics and stable session-id deduplication hold across two-tab settlement, all tested recovery cuts and repeated full process reopen. No remaining blocker was found for this numbered acceptance scope.

After source is pinned `4868d0a682e27a7789fe58168ee6f7006e5946bb`. Main after log: `20260909-independent-after.log`; whole-process running and paused logs: `20260909-whole-close-after.log`, `20260909-paused-close-after.log`. Main run uses `POMO_EXPECT_FIXED=1`; the real module Continue button is disabled on baseline and enabled/functional after fix. Competing Start followed by fresh Pause also succeeds after fix. All other independent assertions replayed unchanged. Whole-process running and paused variants were separately replayed against the fix.

Commands:

```
POMO_VERIFY_REF=4868d0a POMO_EXPECT_FIXED=1 POMO_LOG=20260909-independent-after.log node docs/reviews/web-pomodoro-independent/verify-independent-pomo.mjs
POMO_VERIFY_REF=4868d0a POMO_CLOSE_LOG=20260909-whole-close-after.log node docs/reviews/web-pomodoro-independent/verify-independent-close.mjs
POMO_VERIFY_REF=4868d0a POMO_CLOSE_PAUSED=1 POMO_CLOSE_LOG=20260909-paused-close-after.log node docs/reviews/web-pomodoro-independent/verify-independent-close.mjs
```

Harness precision: after the two-tab cases, the second browser target is actually closed before injecting single-tab Storage faults; merely closing the debugging socket would leave a healthy second writer able to recover pending data. Route reconciliation waits up to5seconds for background browser timer scheduling, not an assumed500ms SLA. These corrections prevent harness-induced false failures. No production code was modified by this verifier.

## Separate conclusions at original baseline (preserved history)

- **POMO-01: BLOCKED.** Activity survives real route-view unmount with actual PomodoroSessionHost retained, page reload, whole browser process close/reopen, and paused process reopening. However, rejected stale revision commands leave a permanently bound retry action, preventing subsequent valid commands in that tab. This is a new independently reproduced cross-tab liveness defect, sent to the assigned fixer immediately.
- **POMO-02: settlement assertions PASS, final closure pending conflict fix.** Verified original deadline and duration/elapsed/recordedAt separation, two real tabs ending one session, stable id/first recordedAt across reload and multiple full process restarts, and failure cuts below. Do not infer all reachable timer paths settle while POMO-01's sticky conflict can also suppress the controller's reconciliation loop.

## Independent evidence

`verify-independent-pomo.mjs` / `native-pomo.ts` mount the actual PomodoroModule and actual PomodoroSessionHost. Commands/faults use the actual exported controller and native Storage methods. Cases:

1. A starts at revision0, A pauses to revision1. B submits original revision0 Pause, retries, then sends a fresh Resume. Baseline leaves phase paused with the same conflict error. Correct result is a refreshable rejected stale action followed by successful fresh Resume. The baseline diagnostic records expected/actual; `POMO_EXPECT_FIXED=1` makes this a strict acceptance assertion.
2. Two actual Chrome tabs issue End on the same session; assert exactly one matching history id and active cleared.
3. Duplicate Start against another tab's active session must not poison subsequent valid Pause. This semantic rejection is checked separately from stale revision.
4. Pending-write quota cut: no history is added; export contains frozen uncommitted early End; restore storage and retry after deadline. The final row remains incomplete, keeps the frozen early finishedAt and elapsed, and gets later recordedAt.
5. History-write quota cut: active persists settlement-pending and history remains absent; actual Page.reload clears the injected fault, reconciliation writes exactly one matching id/finishedAt, then clears active. Repeated reconciliation leaves history unchanged.
6. Active-clear quota cut: history already contains one row and active remains pending; reload cleans up without another row or changed first recordedAt.
7. Paused page reload retains accumulated elapsed exactly. Advancing wall time by120seconds does not finish the paused session; Resume produces remaining duration equal to total minus accumulated elapsed.
8. Actual Pomodoro route view is removed while actual host stays mounted. Advancing past deadline settles once at original deadline; returning actual module creates no duplicate.
9. Hold native A Web Lock, enqueue End, change to B, release lock: old request rejects and A active bytes remain unchanged; B stays empty. Captured A recovery export rejects after switch.

Main probe logs `20260909-independent-conflict.log`; environment `POMO_VERIFY_REF` pins a follow-up commit and `POMO_LOG` preserves separate after evidence. No author test totals are added to these cases.

`verify-independent-close.mjs` / `close-independent.ts` independently assert whole-process closure with real elapsed time. Phase0 starts a1500ms timer, parent waits for Chrome process exit, then waits2200ms with no browser process before reopening same synthetic profile. Phase1 asserts exactly one row matching original sessionId/startedAt/deadline, elapsed=duration=1500, completed=true, finishedAt=originaldeadline and recordedAt later. Entire browser is exited/reopened a second time; row including recordedAt is identical. `20260909-independent-whole-close.log` stores the payloads.

Run `POMO_CLOSE_PAUSED=1` for the independent paused variant: pause before closing, remain closed past old deadline, reopen twice; active JSON is identical to original paused state and history remains empty. Evidence: `20260909-independent-paused-close.log`.

## Limits and recovery semantics

A rejected pending write cannot make an unsaved End intention durable across process termination; the old committed running/paused activity remains authoritative, with explicit failure and manual recovery export. History/pending/clear recovery is not a cross-key atomic transaction. No scheduled sound/notification occurs while browser is absent; events after durable commit remain best-effort. No cloud sync, importer, browser eviction, hardware sleep or adversarial storage-edit acceptance is claimed. Invalid history/active ownership preservation and no-Web-Locks behavior are reviewed in source; new independent probes here focus on the requested lifecycle/settlement invariants.
