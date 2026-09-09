# db1eddc narrow repair — independent follow-up

Web. Fixed product `db1eddccadfecdbea2e078e09c4b5808d25b0e56`; immutable git archive, excluding Sol subscriber changes and the parent's separate native harness. No product edits or push.

**Bounded result: the original 24 assertions pass, including both f764731 failures. Calendar's tested cross-editor delete completion is repaired. Keep one narrow storage reset outcome blocker.** Source review of the newly added reset postcondition warranted a direct read-failure test; it produces 1 correct FAIL and 1 normal-removal PASS. Complete D1/AI-02 remains open.

| Independent execution | Result | Evidence |
| --- | --- | --- |
| Calendar original domain/queue/recovery | 11/11 PASS | `d1-calendar-independent-db1eddc.log` |
| Shared writer original | 8/8 PASS | `d1-shared-independent-db1eddc.log` |
| Pending create/new editor | 1/1 PASS | `d1-calendar-pending-db1eddc.log` |
| Original repair boundaries | 4/4 PASS | `d1-calendar-repair-boundaries-db1eddc.log` |
| Reset actual-outcome read failure | 1 correct FAIL / 1 PASS | `d1-reset-outcome-db1eddc.log` |

Run `node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs db1eddc [suite]`. Original 20+4 assertion files were not changed. Their original `496039f`/`f764731` FAIL logs remain intact. Existing author runs were moved to `author-db1eddc-*` filenames before independent execution; HEAD-named author output is not fixed-hash acceptance evidence.

## Confirmed repairs

`EventComposer` now captures a session counter for deletion and checks it before calling `onClose` after the awaited result. In the original actual Module sequence (old Delete → Cancel → new create editor → old delete completion), the new editor and its current draft remain open. The old event deletion still commits as requested. The original pending-create, locked target-baseline, real Calendar schema, low-year, receipt-only revision and failure/retry checks also remain passing.

For reset, a preflight result-bearing snapshot now protects a readable envelope with activation closed, as well as corrupt/unsupported/unavailable states and the activated protocol. Both original reset cases pass. The additional post-removal check, however, uses the lossy `readRawPref` compatibility helper rather than a real removal outcome.

## Remaining P2: failed reset still claims success if outcome read is unavailable

The new focused test uses actual jsdom Storage, a captured account scope, a present legacy JSON preference and the real `usePref`/`removePref`. The first exact-key preflight read succeeds. Subsequent exact-key reads throw a synthetic `SecurityError`:

- `removePref`'s own protected read fails and correctly returns without calling removeItem.
- `usePref`'s new `readRawPref` postcheck catches the next read error and returns null.
- The hook interprets null as absence, sets local `{}` and `isDefault:true` while original physical bytes remain present.

The independent log records `reads:3`, `removeCalls:0`, `localValue:{}`, `isDefault:true`; after restoring the read method, exact original bytes are asserted. The readable legacy-removal control performs the real removal and resets successfully. This is a deterministic storage-fault seam, not a claim about browser permission timing or Calendar domain validation.

Minimum ownership remains storage `usePref.ts` plus an internal result-bearing removal helper if needed. Prefer propagating actual `removeItem` success/refusal to the hook. If a postcondition is used, require a result-bearing physical read that proves absence; an unavailable read must not authorize local reset. Avoid another lossy null check. Keep unrelated preference behavior and all 24 passing original assertions.

No additional product investigation was performed. Calendar's demonstrated repaired paths may proceed as bounded evidence, but this reset claim is not fully accepted. The shared ordinary clear API, Tasks/Board caller work, D2 lifecycle coordination and old-client activation gate remain separate; none is closed by this follow-up.
