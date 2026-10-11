# Canonical primitive: whole Chrome process exit and resume

Web, fixed product `37252bcafe8efbd24cb8514d3e564c61fcabf3dc`. Independent parent verification using an immutable git archive and isolated temporary Chrome profile. Run `node docs/reviews/web-canonical-primitive-browser-reopen/verify-native.mjs 37252bc`; the runner writes `native-37252bc.json` directly.

**PASS.** The initial browser process PID was 39536 and the reopened browser PID was 39620. The runner sent SIGTERM, awaited the actual first process exit, and reopened the same profile against the still-running local origin. No SIGKILL fallback was needed. It does not merely remount a component or reload a document.

Before exit, the real primitive commits a create followed by delete. The actual persisted dataset is empty, revision 2, with both durable receipts. The Node runner retains the pre-exit raw dataset/marker and original target as an external comparison oracle; the second browser must read its own persisted localStorage, not receive a seeded copy.

After reopen, eight assertions verify:

- The external comparison checkpoint is available.
- The original persisted generation marker is unchanged.
- Dataset and receipt bytes are exactly unchanged.
- The fresh process defaults to activation-disabled before the test explicitly enables its seam.
- Replaying the committed create returns the original target without recreating the subsequently deleted record.
- Replaying the committed delete succeeds despite the missing target and preserves exact bytes.
- A fresh create continues normally, reaching revision 3, one data item and all three receipts.
- Repeating the fresh create replays without another write.

The first phase's three assertions establish its prerequisite commits and empty receipt-bearing state; do not add this 3+8 breakdown to overlapping component/native suite totals as a coverage percentage.

## Scope limits

This directly exercises the generic storage primitive with a small validator-backed map on the Calendar physical key. It is not an actual Calendar/Tasks subscriber or UI flow, and does not cover all six AI operations, provider continuation, D1 ordinary writers, D2 migration, public activation or old deployed clients. Activation is explicit test-only opt-in on both processes; its default remains closed.

SIGTERM with observed process exit is the tested termination mechanism. This is not evidence for power loss, kernel failure, arbitrary SIGKILL, physical browser window controls or a persisted command that had not reached the sole setItem. No production service, real account credential or existing user Chrome profile is involved. Full AI-02 remains open.
