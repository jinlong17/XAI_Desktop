# DateTime final review at 611062e: queued recovery remains blocked

Generic Astra independent review, Web module, fixed product `611062ee2eb80727440c731c62a09626ca87d8eb`. This executor read the complete DateTime contract, shared uncertainty decision, the two previous caller failures, current caller/hook/engine, and immutable prior logs. No product files were edited. **Full DateTime acceptance is withheld: a new correct P1 leaves Retry permanently inert after a predecessor failure.** Do not advance to the next caller or close broad REL/D2/full312 obligations on this result.

## New independently executed failure

`caller-predecessor-before-611062e.log`: unchanged previous four assertions PASS plus one new correct FAIL, through real public DateTime controls, real async hooks, a named physical-key lock, and actual Storage quota injection. No private controller API or mocked product hook is used.

1. Start with physical Monday and hold the real start-week lock.
2. Select Sunday, then select Saturday while Sunday is active.
3. Release the lock; the physical Sunday attempt throws quota. Physical bytes remain Monday; visible latest Saturday and departure/unload protection remain.
4. Restore writable storage and click the actual Retry Start week on action.
5. Required: the shared queue can progress to a verified Saturday, then clear protection. Actual: physical Monday remains. Retry ignores the unresolved latest draft indefinitely.

The earlier successful-predecessor/failed-latest oracle and its healthy all-success comparator still pass. The same-field source repair negative/healthy pair also passes. This new failure is a distinct legal ordering, not a weakening or reinterpretation of their prior results.

## Cause and bounded caller correction

The shared hook resolves the predecessor's request, sets `controller.failed = request` and stops on failure. Its newer queued Saturday request is still unresolved. The caller's latest draft receives `settledFailure` only when that draft's own edit Promise settles. Consequently `retry()` returns at its `!draft.settledFailure` gate even though the hook has a settled failed predecessor that must be retried to unblock the queue.

Permit a recovery Retry to advance a **settled failed predecessor** when the latest edit is queued behind it; distinguish this from an operation that is actually still running. Continue using the existing public hook status/retry contract and the original latest edit's own Promise. A predecessor Retry result must never be passed to `settleDraft` as if it verified the latest draft. Only the latest draft's own edit/retry completion may clear it. Repeated Retry must remain idempotent while recovery is active; another failed predecessor recovery must permit a later attempt. New edits, explicit discard/reload, unmount, scope changes and delayed callbacks retain the existing identity rules. Keep the previous predecessor-success/latest-failure oracle unchanged.

This is a caller recovery-ownership correction. Do not change the shared queue/activePromise API or add raw preflight/rebase. Terra owns product changes; Astra retains this oracle. Required after gates are the expanded caller5, Sol complete45, parent actual host20 and native predecessor-failure scenario (plus the already fixed latest-pending/source-repair paths). Broaden only for any additional material shared delta.

## Shared decision and evidence attribution

The narrow shared uncertainty repair is accepted within the explicit scope of `shared-uncertainty-decision.md`, independently of this unaccepted DateTime caller. I inspected the exact `96c4915..611062e` package diff: shared production changes after96 are precisely two truthiness-to-undefined presence checks in `prefMutation.ts` and `usePrefAsync.ts`. The added storage package test exercises the empty token. Remaining production changes in that interval are DateTime-local. `b9ae2d9..611062e` has no storage changes.

The following logs were executed by the **previous Astra executor**, were untracked on entry, and have now been inspected and preserved without relabelling them as this executor's reruns:

| Fixed product / evidence | Inspected result |
| --- | --- |
| b9ae2d9 `uncertain-final-b9ae2d9.log` | 19 PASS, including the two formerly failing explicit-empty set/reset grants. |
| b9ae2d9 `engine21-shared-b9ae2d9.log` | Original engine21 PASS. |
| b9ae2d9 `token13-shared-b9ae2d9.log` | Original token13 PASS. |
| b9ae2d9 `storage-package-shared-b9ae2d9.log` | 22 files / 195 tests PASS; expected malformed-storage diagnostic output is retained. |
| 611062e `caller-after-611062e.log` | Previous four caller assertions PASS; does not cover this new fifth ordering. |

The96 shared foundation/admission/protected storage/hooks/functional and affected Header/Pomodoro/Collaborate/Smart results retain their exact96 attribution as recorded in `review-96c4915.md` and `../web-date-time-recovery-independent/shared-96c4915.md`. Reuse is justified only for the unchanged no-token and engine-issued nonempty-token branches; token generation remains nonempty, lock/owner/admission/encoding/notification/functional paths did not change. This does not assert those older suites ran at611. Parent owns the current host/native/types and other-caller evidence; Sol owns its current45 caller verification.

## Requirement-by-requirement status

| DateTime contract requirement | Final decision at611062e |
| --- | --- |
| Exact five keys/domain/default/codec/device owner; original UI, absence/invalid/unavailable handling and no mount writes | Source matches the contract; existing Sol and native positive/negative matrices remain applicable with versioned attribution. No calendar propagation or IANA timezone claim. |
| Immediate latest intent and per-field/session/operation attribution | Prior same-value and latest failure assertions pass, but queued latest recovery after predecessor failure FAILS. Not accepted. |
| Strict baseline, conflict, uncertain token and temporary-denial one-write retry | Shared correction and malformed-token boundary accepted as above; parent/Sol own actual caller/native assertions. |
| Pending/duplicate Retry and recoverability | Previously exposed false clear is repaired; new permanent Retry refusal prevents full acceptance. |
| Independent partial recovery and truthful Saved | Existing mixed/targeted cases pass; source guard fix preserves source-only/read-only control. Must preserve these while repairing queue advancement. |
| Sparse/all-five in-memory export, setup failure/cleanup, current scope | Existing source and Sol/parent matrix cover these paths; no new defect confirmed here, no broad account/export acceptance inferred. |
| Device work survives scope while old host permission refuses | Current guard captures token/scope and checks live state; existing owner/unmount cases remain evidence. No account conversion or cloud sync. |
| Actual Settings/Shell producer matrix, first intent, latest completion, unload | Parent owns host20/current native chain. New failed predecessor cannot finish through Retry, so the caller's complete recovery-through-host contract remains open. |
| EN/ZH responsive layout, toggle states, focus and hit targets | Versioned18f4e82 visual evidence remains correctly attributed; subsequent production diff did not touch DOM/CSS layout. |
| Final package/type/lint and accepted caller regressions | Bounded shared delta permits explicit96 reuse as above. Parent/Sol final logs do not override this new correct failure. |

The overall audit ledger remains parent-owned. This review closes no full312 item or remaining writer class and does not authorize deployment, branch promotion, account mutation or release. A next-caller contract is deliberately deferred until DateTime satisfies this unchanged complete contract.
