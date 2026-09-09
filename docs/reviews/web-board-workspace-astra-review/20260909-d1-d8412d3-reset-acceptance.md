# Reset outcome repair — Astra bounded acceptance

Web. Fixed product `d8412d365f0d91b0ad7b97f0c2652a582b85b0f9`, isolated with git archive. **Accept the narrow reset repair and the previously tested Calendar recovery cases.** Original 24 plus reset-outcome two assertions pass unchanged: 26/26. This does not accept full D1, Tasks/Board caller integration, D2 or AI-02.

Independent command: `node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs d8412d3`.

| Suite | Result | Evidence |
| --- | --- | --- |
| Calendar domain/queue/recovery | 11/11 PASS | `d1-calendar-independent-d8412d3.log` |
| Shared writer | 8/8 PASS | `d1-shared-independent-d8412d3.log` |
| Pending create | 1/1 PASS | `d1-calendar-pending-d8412d3.log` |
| Repair boundaries | 4/4 PASS | `d1-calendar-repair-boundaries-d8412d3.log` |
| Actual reset outcome | 2/2 PASS | `d1-reset-outcome-d8412d3.log` |

Source now makes `removePref` return false for SSR/read refusal/protected data/removal failure and true only after physical removal returns. `usePref.reset` consumes that result for canonical keys rather than inferring success from `readRawPref`'s null fallback. The original injected failure now records two reads, zero removals, preserved local legacy value and `isDefault:false`; exact storage bytes remain unchanged. The real successful legacy removal control also passes.

Original `496039f`, `f764731` and `db1eddc` FAIL evidence is retained. Pre-existing author HEAD logs have `author-d8412d3-*` names and are not counted as independent evidence. This run used the original assertions and real jsdom Storage; no native/full-product result is inferred. The separate `4202c79` six-subscriber review is not included in this acceptance.
