# Canonical six-tool AiChat continuation verification

This harness mounts the actual AiChat UI, real six Tasks/Calendar subscribers and native Chrome localStorage from a fixed Git archive. The stream adapter is synthetic: it proposes each tool and captures the outgoing continuation request. No live model/provider/network acceptance is claimed.

For each operation, double-clicking Confirm under an exact-key quota fault must attempt one business write, retain the confirmation, preserve original bytes, and withhold model continuation. After removing the fault, double-clicking Retry must persist the actual business change and exactly one durable receipt, then send exactly one continuation with the matching tool_use_id. The synthetic adapter captures physical storage bytes at continuation entry; they must match the committed result. Native final data is checked separately from the success receipt.

Run:

```sh
node docs/reviews/web-ai-canonical-continuation-native/verify-native.mjs <fixed-commit>
```

## Pre-integration baseline db1eddc

All six cases failed before reaching persistence: explicit canonical activation rejects the old synchronous writer, so the actual write-attempt count was zero rather than the expected one. The UI retained the failed confirmation and no success continuation occurred. The error message says “multiple writes” but its numeric evidence is expected 1 / actual 0; it is not evidence of duplicated writes. The unchanged assertion will distinguish the integrated path in the after run. See native-db1eddc.json (exit 1).

This complements the separate whole-Chrome restart harness. It does not prove reload/restart continuation, production activation, old-client rollout, or provider transport correctness. Both native suites need the committed subscriber integration before after verification.
