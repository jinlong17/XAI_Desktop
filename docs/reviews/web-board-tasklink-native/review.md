# Parent native Board Task-link evidence

Product fixed `49a55e5`, before the pending Board test-fixture repair. Actual Board UI and Task-link implementation use native Chrome WebLocks in an isolated profile with a synthetic account and complete generation marker. The existing test-only canonical activation switch is explicitly enabled by the probe, matching the package's Task-link tests. Production admission remains closed; this is not a claim that dormant production paths were activated or accepted.

`native-49a55e5-parent-admitted-fixture.log` records three PASS checks, Chrome PID 23613:

1. Clicking Create task reaches a real rejected Task localStorage write; Board's pending link survives and Task storage remains absent.
2. Actual page reload retains the same pending task ID and exposes Retry linking. Clicking it creates exactly one matching Task with the original title/source and clears pending only after acknowledgement.
3. A second page reload preserves exact Task bytes and completed Board acknowledgement.

The fixture uses actual UI callbacks/native locks and only injects the Task storage quota error. It does not replace the lock manager. This independently supports the fixture-only classification of the nine package failures under the admitted test contract; whole-browser restart, cross-tab concurrency, production rollout and all D2 writers are outside this probe.

Calibration is preserved separately: `native-49a55e5-parent-before-fixture-repair.log` is empty because Chrome did not create its DevTools port within the initial five-second startup allowance (no product case ran). After increasing only that allowance to fifteen seconds, `native-49a55e5-parent-initial.log` reaches UI startup but not the injected Task write because the default-off canonical admission switch was omitted. The final fixture explicitly enables test-only admission; no product source or production setting was changed. Neither calibration is classified as a new product failure.

```sh
node docs/reviews/web-board-tasklink-native/verify-native.mjs 49a55e5 parent-admitted-fixture
```
