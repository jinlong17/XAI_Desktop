# Tasks detail completion continuation — author evidence

Sol, product author; Web; 2026-09-09. Astra fixed the remaining assertion and review at `f3a519c`: product `170c526` passed the original 8 + 18 assertions and 176 package tests, while the new continuation suite produced 4 PASS / 1 correct FAIL. The narrow repair is commit `0c4b6b4`.

The detail panel now records a version for explicit completion-checkbox edits. After a current-session save succeeds, it reconciles the form to the committed `done` value only when the user did not edit that checkbox while the write was pending. This makes Complete followed by a title-only Save retain `done:true` and the original `completedAt`, while a newer explicit user choice stays in the form for the next save.

Two package assertions cover both directions: successful Complete followed by title editing, and a newer explicit checkbox edit while an older save is pending.

## Isolated verification

Terra's separate D2 storage commit `e9ff409` landed on the shared branch while this patch was in progress and independently had a confirmed browser-lock regression. To avoid attributing that shared failure to Tasks, verification extracted `170c526` with `git archive`, overlaid only the two Tasks files from this patch, and copied Astra's unchanged review assertions from `f3a519c`.

| Evidence | Result |
| --- | --- |
| `author-continuation-independent-170c526-plus-patch.log` | Original 8 + original 18 + continuation 5 = 31/31 PASS |
| `author-continuation-package-170c526-plus-patch.log` | 19 files / 178 tests PASS |
| `author-continuation-static-0c4b6b4.log` | Tasks typecheck and lint PASS |

Commit `0c4b6b4` contains only `TasksModule.tsx` and `saveRecovery.test.tsx`, although its ancestry includes the separately owned `e9ff409`. Root will rerun the immutable integrated revision after the D2 adapter is repaired. This author evidence does not accept Tasks D1 independently or close D2, AI-02, REL-05, deployment activation, or release readiness.
