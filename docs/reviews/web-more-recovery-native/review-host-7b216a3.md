# More native N2 host verification

Product fixed at `7b216a3d5a4947d0f66da042fb275302737fb762`. Parent-owned real Chrome verification using the immutable archive and actual composed Settings/Shell surface.

## Verdict

**PASS for N2 `host`.** Chrome `153.0.8010.48` reported zero runtime exceptions or console errors.

Command:

```sh
node docs/reviews/web-more-recovery-native/verify-native.mjs 7b216a3 host control-plane-20260917-n2-v1
```

Authoritative log: `native-7b216a3-control-plane-20260917-n2-v1-host.log`

SHA-256: `1c66866b4943143138e88dc5aec18ede599d88fe62273fa965c035a48d1e4582`

## Evidence

- A failed trusted More edit blocked an actual programmatic route. A sign-out requested in the same JavaScript turn resolved `false`, so the first route intent remained authoritative.
- The real decision dialog received focus. Native Tab and Shift+Tab wrapped inside it; native Escape chose Stay and returned focus to the originating More select.
- The actual AppRail Tasks control was blocked by the same draft. Stay preserved the draft and restored focus to the Tasks trigger.
- A relative `../date_time` navigation retained its state payload after explicit Discard and leave. Discard performed no More write, preserved the original physical bytes, and removed the `beforeunload` warning.
- Actual browser Back was blocked, Stay preserved the draft, the second Back retained its original target after explicit discard, and Forward returned to More. The POP was not replayed as a new push.
- Two real Web Locks held one device and one account write. Releasing only the first did not release the route or close the dialog; releasing the final write completed the original Notifications route and removed the warning.
- During a pending sign-out, account A was replaced by account B. The old decision resolved `false`, B did not see A's private account draft, the device draft survived and completed, and stale A account work did not write after the epoch change.
- Unmount while a failed draft and sign-out decision were active resolved the sign-out `false`, removed the composed host, and removed the `beforeunload` handler.

## Limits

N2 verifies the actual host/navigation/lifecycle contract only. N3 must still cover set/reset refusal attribution, pending/uncertainty recovery, second-document conflict, disk exports, and the full owner/locked matrix. N4 must still cover bilingual responsive visual, trusted keyboard, focus, hit-testing, and target-size evidence.

This result does not run final Settings/Web/storage regressions, does not provide Astra acceptance, and closes no 312 item, D2/REL/AI obligation, deployment gate, or release gate.
