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

## Fixed 3241529 after-run and encoding diagnosis

All three initial actual-UI cases and all three whole-process reopen cases now PASS. Chrome PID 72943 exited normally via SIGTERM; PID 72961 reopened the isolated profile/origin. Exact persisted bytes, newer human title, latest saved composer draft and receipt preservation match the external checkpoint. Product code is the fixed 3241529 archive. See native-3241529.json.

Two earlier observations on the same commit are retained as native-3241529-first-observation.json and native-3241529-encoding-diagnosis.json. The apparent startup mismatch was a harness error: the HTML response lacked a UTF-8 declaration, so the re-injected non-ASCII checkpoint decoded incorrectly. Actual persisted Chinese text, revision and receipts were correct. Comparing actual/expected diagnostic bytes identified this; the runner now sets UTF-8 Content-Type and meta charset and decodes accumulated POST buffers once. No Tasks product change or weakened assertion was used to obtain PASS. The first empty-board selector attempt also remains separately classified as harness evidence.

This is bounded native UI/storage/restart evidence, not full Tasks D1 acceptance, production activation, visual review, or durability of uncommitted drafts. Astra independently reviews the full implementation scope.
# Follow-up fixed Tasks repair

Parent independently reran the unchanged native suite at `170c526`: startup, conflicting checkbox retry and composer latest-draft retry all pass initially; their three persisted-state/UI checks pass after whole Chrome PID 83961 exits via SIGTERM and PID 83995 reopens the same profile. Evidence `native-170c526.json`. The earlier fixed/before/encoding diagnostic evidence is retained. These are the same bounded scenarios, not a new claim about every Tasks interaction or unsaved-draft durability.


## Integrated fixed verification at e9fb5e7

Parent independently reran the unchanged native initial assertions on fixed `e9fb5e7`, including Tasks repair `0c4b6b4` and the native adapter repair: 3 initial cases PASS, then 3 persisted-state/UI cases PASS after observed Chrome SIGTERM exit, PID 91754 → 91770. See `native-e9fb5e7.json`. Prior failing logs and author evidence remain separate. The original scope limitations still apply; this does not accept the remaining D2 foundation failures or every product caller.
