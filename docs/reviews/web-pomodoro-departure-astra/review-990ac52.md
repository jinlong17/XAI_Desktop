# Astra follow-up at 990ac52

Decision: **CHANGES_REQUIRED** for the complete bounded Pomodoro recovery contract. The three prior P1 failures are independently repaired; two additional explicit contract requirements remain unsatisfied. No broad audit item is closed.

Fixed product: `990ac52cac4aae9e72d1db84d52f6c9093294195`. Same immutable archive runner and real component/storage/public capability method as `review-e1a69fb.md`. This report preserves all prior failures and attribution. Product files and parent evidence were not edited. Sol also ran these tests into separately named `*-sol-author-*` logs; those are not this reviewer's execution and are excluded from this commit.

## Executed results

| Group | Independent result | Evidence |
| --- | --- | --- |
| Unchanged original draft assertions | 14/14 PASS | draft-990ac52.log |
| Unchanged export assertions | 7/7 PASS | export-990ac52.log |
| Original accepted Dv2 preferences | 24/24 PASS | dv2-990ac52.log |
| Original accepted timer completion | 2/2 PASS | completion-990ac52.log |
| Draft assertions plus two required boundary cases | 14/16, two FAIL | draft-expanded-990ac52.log |

The repair now attributes Retry only after the latest operation itself has settled unsuccessfully, preventing active predecessor success from clearing a queued successor draft. The unchanged pending Retry oracle reaches the later successful retry and confirms native violet bytes before the guard clears. Unchanged uncertainty and same-value tests also remain green. Live scope checks repair the direct stale discard and synchronous URL setup owner-change failure; normal current discard/export and scope-surviving device work remain functional. The original combined discard test now reaches its locked-epoch and disposal follow-on checks as well.

## Remaining correct failures

**P2: old capability still claims it blocks departure.** Capture a failed draft's guard A, switch owner, render the new epoch. A.isCurrent is false but A.isBlocking returns true. Expected false: the old combined departure permission is revoked, while the new capability must report true for the surviving device draft. The new case also contains the fresh-current positive control and current discard release; the failing old assertion prevents those later statements from executing in this particular run, although current controls are covered separately by the passing original cases. Helper registration still computes isBlocking from disposed/draft size alone. Bind this predicate to the same captured/live epoch as isCurrent and the action methods; do not remove the fresh device guard or draft.

**P2: conflict-only recovery was removed.** Hold the real theme mutation lock, choose blue and introduce native external violet plus its storage event. Release the lock so the actual theme operation conflicts. Independently fail a sound change to bell with native quota denial. Both attempted controls remain visible and native bytes remain violet/soft-chime. There is no targeted conflict recovery action; only all-current-draft discard exists. The original `c604951` PomodoroModule lines 224/487 explicitly offered `Discard conflicting preferences` filtered to actual conflicts. The present contract expressly requires preservation of conflict filtering. A button that intentionally discards both theme and sound cannot replace that function.

The added mixed case requests the original accessible targeted action and then requires theme to adopt native violet without reading sound, sound bell to remain a guarded draft, and its later retry to persist bell. At 990 it correctly fails on absent targeted choice before attempting downstream effects. The selector accepts discard or reload wording; an equivalent explicitly targeted public UI can be reviewed if implemented. This is not an arbitrary requirement for a particular internal hook or new recovery workflow.

Restore the targeted capability and clear only its corresponding tracked fields when the explicit recovery action occurs. Keep the existing all-draft departure action available for deliberate discard-and-leave. Reading source-only invalid fields must remain independent, and successful sound/timer bytes must not be modified.

## Completion gate

Run all unchanged groups at the next fixed SHA, including the now 16-case draft file. Reconcile parent original9/advanced8, final native disk/full denial/owner/pending/full CSS bilingual layout and hit tests, original package/type/lint and Smart/Collaborate/App regressions. Current 14/7/24/2 success is evidence for the repairs and preservation above; it does not satisfy the two omitted complete-contract requirements or constitute whole-product acceptance.
