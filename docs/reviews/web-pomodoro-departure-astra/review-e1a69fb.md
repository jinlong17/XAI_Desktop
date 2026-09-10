# Astra independent Pomodoro departure review

Decision: **CHANGES_REQUIRED** for the complete six-preference current-user recovery contract. Fixed product `e1a69fbb5305356decb75f03e85fdb4933761699` has three independently reproduced failures. This is a generic non-author review. It does not close REL-05, REL-09, D2 or any whole audit number.

## Scope and execution provenance

The authority is `../web-pomodoro-departure-contract/contract.md`, including preservation of the already accepted Dv2 preference/timer contracts. `verify-fixed.mjs` archives the specified Git object, aliases repository packages to that archive, and copies only these independent test/fixture files into it. Installed dependencies are shared; product source is immutable. No product hook is mocked. Real Pomodoro controls, async preference hooks, named lock manager, account-scope transitions, physical Storage operations, beforeunload events and the optional public departure registration capability are exercised. Download setup/click is instrumented to inspect the actual Blob and boundary effects; this is not a native disk claim.

The public registration callback captures the supplied capability, without providing app/coordinator behavior. Parent-owned native evidence and product files remain untouched. Source comparison includes the helper, six real callers, public types, app adapter, shared delegate compatibility aliases and route registration. The prior coordinator extraction acceptance remains `ba7f0da`; it did not accept this subsequent caller.

## Fixed execution results

| Fixed product | Independent group | Result | Evidence |
| --- | --- | --- | --- |
| c604951 | Initial draft assertions | 0/13 | draft-baseline-c604951.log |
| c604951 | Export assertions | 0/7 | export-baseline-c604951.log |
| 0d7f885 | Draft assertions | 11/13 | draft-0d7f885.log |
| 0d7f885 | Export assertions | 6/7 | export-0d7f885.log |
| 0d7f885 | Original Dv2 / completion | 21/24 and 2/2 | dv2-0d7f885.log, completion-0d7f885.log |
| e1a69fb | Draft assertions, including added pending Retry oracle | 12/14 | draft-e1a69fb.log |
| e1a69fb | Export assertions | 6/7 | export-e1a69fb.log |
| e1a69fb | Original Dv2 / completion | 24/24 and 2/2 | dv2-e1a69fb.log, completion-e1a69fb.log |

Baseline draft failures and six baseline export failures stop at the absent public capability; downstream assertions in those cases were not executed. The other baseline export failure is the independently observable forbidden download click. Baseline failure does not invalidate accepted storage behavior. The four new-version groups overlap intentionally and are not an aggregate product-coverage count. The pending Retry case was added after the original 13-case baseline/0d runs; those historical logs are unchanged.

## Correct business failures

### P1: Retry while a predecessor is pending clears a newer failed draft

`draft-attribution.test.tsx`: hold the real theme mutation lock, choose blue, then violet. Configure only the violet physical write to fail. Click the visible Retry preferences button before releasing the predecessor lock. Release it. Native bytes are `"blue"`, the real selected control remains violet, yet the published guard returns false. Expected true: the user's latest explicit violet intent was not saved.

At fixed helper lines 87–97, `retryDrafts` attaches the latest draft ID to `draft.retry()` without proving that this returned result belongs to that latest operation. The underlying async binding can return its currently active predecessor Promise. A blue success therefore clears violet's draft. The normal edit Promise identity check alone does not protect this separate path. This can release pending navigation/sign-out or unload protection while the latest choice is lost. The normal same-value successor case and uncertainty controls pass, so suppressing all retries or comparing only saved values is not an acceptable correction.

Required repair: preserve operation-level attribution through Retry, including queued/latest versus active predecessor. A pending retry must not transfer predecessor success to a newer draft. Keep unchanged uncertainty-token retries and saved-sibling isolation. After repair the same test must also persist violet on a subsequent successful retry and then release the guard.

### P1: An old departure capability can discard surviving device drafts

`draft-attribution.test.tsx`: create failed blue theme draft, capture guard A, activate a successor owner and allow React to render. `A.isCurrent()` correctly returns false. Invoke **A.discardDraft itself**. Blue disappears and the draft is cleared. Expected: old capability is revoked; the current device draft survives for a fresh current decision.

At helper registration lines 143–150, `discardDraft` directly references unrestricted `discardDrafts`. Host checks cannot substitute for the contract's independently revoked callback methods. Apply captured-epoch and disposal checks inside the exported capability action, against live scope state. Fresh current discard must still work and remain physically read-only. The combined test includes locked-epoch and disposed follow-ons, but its e1 failure stops before those later assertions; this report does not claim their execution passed.

### P1: A synchronous owner change during export setup still downloads

`export-boundary.test.tsx`: create a real failed theme draft; make the actual `URL.createObjectURL` setup boundary activate another account owner. The production handler continues and actually calls the download anchor's click with `pomodoro-preferences.json`. Expected zero clicks, with cleanup and preserved current device work.

At helper lines 109 and 121, export checks `epochRef`, refreshed only on a React render. Scope changes synchronously before that render, so the same handler observes a stale ref at both checks. Compare the captured decision to live in-memory account-scope state at the actual download boundary, including before any error/success side effects. Preserve the passing fresh-current export after a completed owner render, full six-value schema, cleanup and memory-only export under complete storage denial.

## Established positives and remaining full acceptance

All six real failed fields retain their selected values and unload protection; current explicit discard rereads only actual draft fields, performs no preference writes and preserves successful sibling/timer bytes. Same-value predecessor/successor attribution without the pending Retry path passes. Unchanged uncertainty retries do not duplicate settlement, and changed intent cannot borrow the previous uncertainty token. A running timer alone remains clean. Completion-driven next-preset failure is guarded, and successful retry does not replay history/events. Complete memory exports preserve all six values, source/successful siblings, schema and guard; URL/append/click error controls retain recovery and clean temporary resources. Old export after a completed owner render is rejected, fresh current export works, and disposed export refuses.

The e1 run independently confirms repair of the three 0d source-recovery regressions and original 24/2 remain intact. Review also notes that the former specifically labelled conflict-only discard control has been replaced by all-current-draft discard: the contract explicitly requires preservation of conflict filtering. Existing single-conflict regression passes via all-draft discard; a future final gate should explicitly exercise conflict plus an unrelated failed sibling before concluding filtered recovery is preserved.

Parent is independently running actual production host original9/advanced8, native disk/full-denial/owner/pending and complete CSS bilingual five-width/hit-testing gates. These are complementary parent-owned results, not executions attributed to this Astra report. Package146/type/lint and Smart/Collaborate/App regressions must be reconciled at the final fixed product. Do not accept the complete contract while any of the three correct failures remains, even when those other suites pass. Keep historical native visual failures and source-recovery failures as before evidence.

## Reproduction and next gate

Run `node docs/reviews/web-pomodoro-departure-astra/verify-fixed.mjs <fixed-sha>` for all four groups; optional third argument selects `draft`, `export`, `dv2` or `completion`, and optional fourth argument creates a distinct immutable log suffix. Existing log names are never overwritten. After the author supplies a new fixed SHA, rerun these unchanged business oracles, add the mixed-conflict isolation gate, inspect the narrow patch, and reconcile the parent's complete native/host/package matrix before accepting only this bounded contract.
