# Collaborate complete current-user recovery acceptance

**Current status: historical parent acceptance reopened by subsequent independent Astra review.** Astra reproduced global Saved coexisting with invalid/unavailable source recovery on c604951. Terra ad689dd fixes the aggregate condition; independent Astra successor acceptance is now recorded in ../web-collaborate-recovery-astra-final/acceptance-ad689dd.md at6254cb4. The requirement reconciliation below records the parent checkpoint, not a claim that the newly discovered gap was already covered.

Web, parent non-author review at product **c604951**. This accepts the bounded complete three-control contract in `../web-collaborate-recovery-contract/contract.md`. Terra authored product changes; parent independently authored and executed the oracles below. The runtime could not initialize a new Astra reviewer Agent, so this is explicitly the parent main-review acceptance, not a fabricated external Agent execution. No numbered audit item is closed: Collaborate is one caller inside REL-05/D2, with REL-09 crash/forced-auth durability still open.

## Requirement-to-evidence reconciliation

| Contract area | Current evidence and outcome |
| --- | --- |
| Three real producers and compatibility | Independent37: all controls write their own physical source; absent mount/rerender no seed; three invalid-source mounts preserve bytes; actual forged option refused; clean two-pane/same-document and external projection. Stable strict validators and original keys/ownership retained in source. PASS. |
| Locking and scope | Independent37: all three actual key locks, account-exclusive versus independent device write, missing lock refusal, actual account migration with acknowledged share copied and stale queued share fenced while device commits. PASS. |
| Latest intent, partial success and attribution | Independent37: rapid toggles, failed-only Retry, duplicate Retry single-flight, equal-valued successor lock rejection. Host8: older share success/newer share failure and mixed sibling success cannot release original navigation until the latest real drafts save. PASS. |
| Source and field recovery | Independent37: malformed/unavailable source repair, dirty conflict, sibling isolation; newest c604951 all-discard reads only actual draft fields and leaves saved/untouched siblings alone. Read-only repair remains available without a user draft. PASS. |
| Uncertainty | Independent37: write/readback denial retains draft; unchanged Retry one physical write; external replacement refuses; edited target cannot inherit old token; device uncertainty survives account change. PASS. |
| Mixed ownership and old capabilities | Independent37: A→B and locked transitions remove account draft, retain editable device work, invalidate old guard/export/discard, permit fresh device-only export. Host8 cancels old sign-out and re-guards surviving device work. PASS. |
| Export, cleanup and unload | Native7 on2a536c1: exact all-failed/partial/device-after-owner JSON, full storage denial, pending export disk file and lock release; no-storage memory export preserved. Independent37: URL/append/click failures retain drafts and separate failure text, revoke URL/remove anchor, stale setup zero click, correct unload lifetime, source-only mount no warning. c604951 only narrows targeted discard; final native host departure rechecks export/discard after that change. PASS. |
| Real host and App | Host8 on c604951 exercises actual Composed host/data router, first-intent same-turn navigation/sign-out, Back/Stay/discard, mixed pending/success, owner cancellation, focus/Escape and correct labels. Native host departure c604951 passes with0 Runtime errors and exact disk bytes. Unchanged App5 passed2a536c1; later changes do not touch App/auth/host. PASS. |
| Presentation and regressions | English full CSS five widths and375 dialog at2a536c1; Chinese five widths and375 dialog at53a4d96,0 Runtime errors,44×44 and first-viewport recovery. Parent directly viewed English and Chinese375 screenshots. c604951 does not alter labels/styles/layout. Smart Lists original39/host10/entry3/wrapper5/export8 and Settings43 files/293 tests all pass c604951 after the narrowly reviewed unused-dependency lint repair. Settings lint and types gates recorded separately. PASS. |

Fixed independent final: `contracts-lock-complete-c604951.log`37/37 and `host-complete-edges-fixed-c604951.log`8/8. The earlier36-test completion result is a subset, not additional coverage. Package and native layers likewise overlap and are not summed into a single test total.

## Reviewed product changes and preserved failures

The final feature supplies three independently persisted preference drafts across account/device scope, with field-specific recovery, current-user memory export, beforeunload warning and ordinary host departure protection. Exact physical keys, codecs, ownership, storage engine, auth logic and timer state are unchanged. Shared host/type changes are display metadata only; the accepted routing arbitration remains intact.

Parent review found and retained failures for pending export feedback, actual host update-depth loop, stale combined callbacks, narrow recovery overflow, equal-valued successor draft clearing and unfiltered all-discard. Each was fixed by Terra and rerun against the original business oracle. Fixture expectation mistakes (message wording, no-op equal-value writes, uncertainty baseline) are separately documented in review.md and never counted as product fixes. The old native suites lacked a runtime-error gate; the strengthened native gate independently reproduced the loop and now passes.

Smart Lists lint repair53a4d96 removes only an unused dependency from a callback that does not read scope; current bindingRef and the hook's owner/session logic remain. The full affected Smart Lists behavior suites pass afterward. The prior failed lint log remains retained rather than overwritten.

## Boundaries that remain open

This is current mounted user-session recovery with explicit download, not automatic durable storage for unsaved work. A forced auth unmount, browser crash, process kill, browser-policy suppression of beforeunload, deployed service behavior and account-cloud sync are not proven by these tests. Other callers, actual timer lifecycle, old-client fencing, SET-06 integration and broad REL-05/REL-09/D2 remain separate. No production deployment, branch promotion or release approval occurs here.
