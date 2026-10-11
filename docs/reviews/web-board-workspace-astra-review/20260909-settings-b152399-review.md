# Settings b152399 — original repairs pass, entry snapshot still missing

Astra, Web, 2026-09-09. Fixed product `b152399`; reviewed the repair chain 3472b69 → f43dff6 → 5adf530 → b152399 against `0203c56` / `ea5ba0b` and the eight groups in `c35898f`. **The original reported repairs pass independent verification. The complete slice remains blocked by one confirmed receipt-entry snapshot gap.** No product or Board files were edited. Author `8105cc9` logs, including untracked `terra-*` artifacts in this directory, are not my evidence and were not staged or overwritten.

## One remaining P1: queued recovery silently adopts replacement receipt bytes

The new `d2-settings-entry-snapshot.test.ts` holds the same account's recovery workflow lock, starts an actual `resumeAccountLocalDeletion(receipt, auth)` call, and verifies that it has not touched data or dispatched participants. While that call waits, a competing writer replaces the physical deleted receipt with another valid raw value. Owner, kind, business generation, version, authGeneration and phase are unchanged; updatedAt changes. Releasing the workflow lock should refuse the old call and preserve the replacement/data without dispatching secrets/auth.

At fixed b152399 the old call instead fulfills, deletes the account record, calls secret and auth once each and overwrites the replacement with complete. The unchanged-raw control completes correctly. Evidence: `d2-settings-entry-snapshot-astra-b152399.log`, **1 PASS / 1 correct FAIL**, with physical receipt/data and participant counts.

This is the previously required different-raw replacement boundary, not a new provider or old-client rollout requirement. Test raw mutation is an explicit competitor; initial receipt and marker are valid, and both normal/competing cases use the actual Settings/storage path with the named lock scheduler. It does not claim an additional native browser run.

The source explains the outcome: `resumeAccountLocalDeletion` keys its in-page map on kind/account/generation/version/authGeneration and calls `runRecoveryWorkflow`. Only *inside* that acquired workflow lock does `resumeAccountLocalDeletionOnce` read `expectedRaw`; its comparison with the caller's receipt checks generation/version/authGeneration but not entry bytes/phase/timestamp. The new value is therefore adopted as the expected authority, and the downstream storage CAS correctly compares against the wrong, newly adopted snapshot.

**Minimum repair ownership: Settings `accountDeletionRecovery.ts` entry capture, single-flight identity and lock handoff, with its focused tests.** Capture and validate the physical raw receipt against the requested receipt before enqueueing, retain that snapshot through the workflow wait, and reject an unrelated raw replacement when execution starts. Do not refresh expectedRaw from whatever happens to be present after the wait or return an operation authorized by another receipt token. Use an unambiguous representation for identity/token association.

Preserve legitimate coordination progress: two compatible contexts already recovering the same validated receipt must still finish idempotently when the first has produced complete, with no duplicate participants. Explicitly distinguish that monotonic completed observation from a different pending raw replacement. A partial-failure retry may read the latest persisted valid receipt as a **new** entry operation. Do not restore current-owner restrictions for durable A→B resume, discard the recovery lock, or weaken the existing cross-instance/same-page/native assertions to fix this case.

## Independent fixed results

All executions below use `git archive b152399` and pinned workspace source aliases. Only reviewer-owned fixtures are copied; the package suite uses its fixed committed package tests.

| Scope | Result | Own artifact |
| --- | --- | --- |
| Actual Settings orchestrator, including confirmed A→B and operationId replacement | 16 PASS | `d2-settings-orchestrator-astra-b152399.log` |
| Original seven slice boundaries | 7 PASS | `d2-settings-slice-astra-b152399.log` |
| Settings package | 42 files / 282 tests PASS | `d2-settings-package-astra-b152399.log` |
| D2 foundation | 14 PASS | `d2-foundation-independent-astra-b152399.log` |
| Original deletion admission | 2 PASS | `d2-deletion-admission-astra-b152399.log` |
| C primary / semantic-length boundaries | 29 PASS / 8 PASS | `c-primitive-independent-astra-b152399.log`, `c-primitive-boundaries-astra-b152399.log` |
| D1 shared writer | 8 PASS | `d1-shared-independent-astra-b152399.log` |
| New entry snapshot control/refusal | 1 PASS / 1 correct FAIL | `d2-settings-entry-snapshot-astra-b152399.log` |

No old assertion or before log was changed. The prior unmodified package's 274 PASS / 8 FAIL remains in the a6 log; the fixed package now includes only the required marker/native-lock fixture initialization changes in its original orchestrator tests and preserves their business expectations. Counts overlap and are not a combined coverage percentage. Type checks remain author evidence, not claimed rerun here.

## Verified repair semantics

- Confirmed begin is called by the actual orchestrator only after server success/already-deleted. It receives the captured scope/auth generation and original operationId/raw; validates the physical intent, account/generation/phase and complete marker under account-exclusive lock; refuses an existing deleted receipt. Unknown server outcomes retain local data. Demo current begin retains its current-owner gate; confirmed A→B does not reactivate A. Both real-hook A→B cases and replaced-operationId refusal now pass.
- Storage's shared decoder now rejects non-string authGeneration; the account-wide eraser removes prior/candidate records while retaining the receipt. Complete requires local-data-cleared or already complete. Both public deletion paths refuse a conflicting present marker even with a structured old receipt. Original valid partial marker-removal retry remains passing.
- The generation-independent native recovery lock now surrounds the workflow before short account-exclusive operations. Account/domain locks are released across synthetic secret/auth waits. Different auth identities no longer inherit the prior in-page successful Promise; independent module instances serialize and observe one completed result/participant sequence.
- The raw check added immediately before secret cleanup preserves replacement bytes and suppresses subsequent participants in the previously failing await-boundary case. Existing post-secret, post-auth and final locked receipt CAS checks remain. That fixes later-stage replacements, while the new test isolates the earlier workflow-enqueue gap described above.

Parent independent `b484a6e` supplies four original Settings consumer assertions PASS and real Chrome held-lock/same-page/independent-iframe three cases plus three exact process-reopen checks PASS at b152399 (PID 8948 → 9122). Earlier cross-context failure `95afb81` and repaired `507c1af` evidence remain. I read and attribute those results, rather than rerunning them or calling them proof of the new entry replacement case. They do not establish real auth/server network delivery or universal old-client safety.

## Reproduce and hand back

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs b152399 d2-settings-entry-snapshot astra
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs b152399 d2-settings-orchestrator astra
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs b152399 d2-settings-slice astra
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs b152399 d2-settings-package astra
node docs/reviews/web-board-workspace-astra-review/verify-d2.mjs b152399 '' astra
node docs/reviews/web-board-workspace-astra-review/verify-c-primitive.mjs b152399 c-primitive-independent astra
node docs/reviews/web-board-workspace-astra-review/verify-c-primitive.mjs b152399 c-primitive-boundaries astra
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs b152399 d1-shared-independent astra
```

Use fresh revision/suffix names after repair. The new runner option adds only this bounded snapshot test; no new full-slice investigation is needed before the author repairs it. Preserve the passing original repair groups and validate the new refusal/control together with existing concurrent-complete, partial retry and native cases. The approved contract and this minimal repair are sufficient to proceed without a new architecture or permission cycle.

No full D2/all-writer, provider, old-client admission, AI-02/REL-05, Board-detail or release conclusion follows from these results. Tasks D1's bounded acceptance remains unchanged. No total ledger, production activation or deployment was changed, and no push was performed.
