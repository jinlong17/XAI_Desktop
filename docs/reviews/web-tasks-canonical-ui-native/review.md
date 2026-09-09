# Actual Tasks UI: native recovery and whole-process restart

Parent/non-author runner pins product imports to a Git archive and mounts actual TasksModule in an isolated Chrome profile. Canonical activation is explicitly enabled only in synthetic accounts. No CSS/visual acceptance, live production account, or cloud synchronization claim is made.

Three initial cases: legitimate absent initialization; quota-failed checkbox followed by a supported public-writer human edit and conflict-safe retry; quota-failed composer followed by latest-draft edit and double-click retry with one persisted task and retained receipts. The conflicting retry is fenced by the actual canonical Web Lock before its byte/result assertions. If all initial cases pass, the runner captures raw records outside the browser, observes Chrome process exit, reopens a new process with the same origin/profile, and checks exact stored bytes plus recovered UI/data.

## Before: fixed 94f1183

One correct product FAIL (absent initialization); two initial UI controls PASS (retry conflict and latest composer retry). Since initial setup does not entirely pass, the whole-process restart stage is deliberately not reached. See native-94f1183.json (exit 1).

The first harness attempt used an Add selector absent from the empty board; native-94f1183-harness-attempt.json preserves that selector failure. It is not a second product defect. The final harness uses the actual visible New task action (`.task-primary-action`) and the composer control passes. The startup defect independently matches the jsdom fixture in 56f1aaf.

```sh
node docs/reviews/web-tasks-canonical-ui-native/verify-native.mjs <fixed-commit>
```

Pending after-run: committed Sol Tasks D1 implementation. This suite does not promise that uncommitted drafts survive browser termination; it verifies committed data, recovery UI while mounted, and subsequent restart behavior separately. Full Tasks D1 still needs independent scope review, including detail sessions, cascades and all action paths.
