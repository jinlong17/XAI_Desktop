# REL-06 independent verification — durable deletion intent

Date: 2026-09-09. Module: web. Bounded verdict: **PASS after 35d7b11** for the pre-request intent and sequential-retry guard. Full REL-06 remains open.

## Reviewed changes

- `762778c33226b072c2ca2030aa0a7051a7dbe952`: prepare and read back a non-destructive intent before contacting the server; keep ambiguous outcomes discoverable; render a generic signed-out recovery notice which does not erase unconfirmed data.
- `35d7b110088b5fd15b659cc2a0b2e66089fc8677`: preserve existing intent and prevent a subsequent request from overwriting unresolved evidence.

Independent review identified a concrete sequence defect in the first commit: request 1 loses its response, request 2 overwrites intent, then 401 causes its removal. A later authorization denial cannot establish the outcome of an earlier possibly successful deletion. Parent was notified before the correction. Native Chrome reproduces the failure before and passes the same behavioral expectation after the correction.

## Method and evidence

`verify-browser-intent.mjs` uses immutable Git archives, pins every workspace package import, and launches isolated native Chrome profiles. It executes actual React WebAuthSessionProvider, the actual deletion orchestrator/auth action, native localStorage, actual intent/recovery code and Notice. Server behavior is an explicitly synthetic client seam; no production endpoint or account is touched. Actual FunctionsHttpError and native Response represent the 401 result. Storage faults are injected into Storage.prototype.setItem for the exact intent or tombstone key; all other native storage remains operational.

Two scenarios use full `location.reload()`, then activate synthetic B before rendering the Notice. The fresh document begins with locked scope. This tests page lifecycle recovery, not browser-process termination or a genuine remote deletion.

Commands:

```sh
node docs/reviews/web-account-deletion-reliability/verify-browser-intent.mjs
REL06_VERIFY_REF=35d7b11 REL06_VERIFY_LOG=20260909-intent-after.log node docs/reviews/web-account-deletion-reliability/verify-browser-intent.mjs
```

The default run intentionally pins the defective commit and exits 1 on the known before-case. The explicit after run exits 0. Logs are `20260909-intent-before.log` and `20260909-intent-after.log`.

| Scenario | Before 762778c | After 35d7b11 |
| --- | --- | --- |
| First intent write denied | PASS: failure visible, server calls = 0, A/B records unchanged | PASS: same |
| Response lost after possible server mutation | PASS: intent exists before request, reload retains generic unknown notice; A/B retained, no tombstone or cleanup action; metadata excludes token | PASS: same |
| Server reports success, first tombstone write denied | PASS: intent survives full reload; unknown notice, A/B retained, no automatic server retry or local erasure | PASS: same |
| Unknown result followed by user retry leading to 401 | **FAIL**: server calls = 2, intent removed, first unknown outcome lost | **PASS**: server calls remain 1; retry blocked before invocation; original intent byte-for-byte unchanged |

For the reload cases the rendered notice exposes no account ID or data and no local-cleanup retry button; server call count stays unchanged. The probe checks actual persisted values, not merely operation return states.

## Remaining gaps and exact scope

1. The prepare check followed by setItem is not an atomic cross-tab lock. Two simultaneous first requests can still race; these tests cover sequential retry only. A per-operation journal and/or coordinated ownership is still needed for concurrency acceptance.
2. Server status/idempotency reconciliation is absent. An unknown outcome is now safely visible and retained, but the product cannot resolve it automatically. The operation ID is local metadata, not yet an implemented backend idempotency key.
3. Process kill/power loss, IDB blocked/error/late-handle cleanup, complete auth/cache participants, and cross-tab connection-close acknowledgements remain separate REL-06 work from the earlier diagnosis. Neither this PASS nor the existing AI-secret cleanup proves complete account erasure.
4. An initial intent write that succeeds but whose verification read fails leaves retained evidence and prevents a request; this conservative branch is not separately fault-injected here. Real browser quota-policy variation is also outside the synthetic fault test.
5. No production deployment, live account removal or cross-vendor verification. No product files or author tests were modified. Parent owns final full-task acceptance and shipping.
