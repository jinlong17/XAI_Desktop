# Settings durable deletion a6ad06d — independent rejection

Astra, Web, 2026-09-09. Product fixed `a6ad06d` (51ae929 → 10c208e → 051d7fa → a6ad06d). **Do not accept this slice yet.** Several original refusals/recovery cases pass, but the complete implementation contract from `0203c56` / `ea5ba0b` is not implemented. This review changes only its own tests/runner/report, preserves every before log and avoids Sol's dirty Board files.

## Confirmed defects and minimum repair scope

All code references below are against the fixed revision. Tests use actual public storage APIs and actual Settings recovery/orchestrator code. Only lock scheduling, initial data and external auth/secret participants are controlled.

| Priority / contract gap | Independent observed result | Minimum owner and required repair |
| --- | --- | --- |
| P1: confirmed server-success A→B cannot begin cleanup | The existing two actual orchestrator assertions fail even with valid complete markers and working lock fixture: after the server resolves successfully and B becomes current, A content remains, no complete receipt is produced and captured auth cleanup is not called. `beginAccountLocalDeletion` still calls `accountScope.assertCurrent(scope)` after the backend await. | Settings `useAccountDeleteOrchestrator.ts` + `accountDeletionRecovery.ts`, storage confirmed-begin API if factored there. Implement the already-approved captured confirmed-operation entry, without activating A or relaxing ordinary writer owner guards. Durable resume A→B PASS does not cover this earlier admission boundary. |
| P1: original server operationId is not checked | New actual-hook case replaces the existing deletion-intent raw metadata with a new operationId while the backend request is pending. The old response nevertheless publishes a complete receipt, erases A and calls secret cleanup, returning success. The new unknown intent bytes remain, but its authority has been incorrectly superseded. | Preserve the original operationId/raw token from `prepareAccountDeletionIntent` through server response and confirmed receipt publication; verify it under account-exclusive admission. Unknown outcome records alone remain non-destructive. A replacement must refuse the old continuation without publishing deleted metadata or local erasure. |
| P1: truthy non-string authGeneration passes the shared decoder | Public `decodeAccountDeletionReceipt` accepts version-2 records with authGeneration `7`, `{}` and `[]` instead of null/refusal. | Storage `accountDeletionReceipt.ts`: enforce nonempty **string** type, account-only v2 and the complete shared contract. Settings must consume that decoder rather than add a divergent schema. |
| P1: local-data-cleared leaves prior/candidate private records | `resumeAccountLocalDataDeletion` returns successful `local-data-cleared` after removing g1, while actual `prior` and `candidate` generation records remain. `eraseUnderReceipt` uses a generation prefix (`accountDataLifecycle.ts:48–51`), unlike the approved account-local deletion scope. | Storage `accountDataLifecycle.ts`: under matching receipt/marker and account-exclusive authority, remove all captured-account records except the durable receipt, including prior/candidate generations and stale intent metadata; preserve B/device/unowned data. Do not change the product operation to generation-only deletion without revising its contract. |
| P1: complete API can skip local cleanup | Public `completeAccountLocalDataDeletion` accepts a valid pending receipt, writes complete and returns success while its g1 record still exists. It compares expected phase but never requires local-data-cleared (`:94–99`). | Require the legitimate transition local-data-cleared → complete, plus already-complete idempotence, complete identity/version/token matching and truthful persistence. Do not accept pending → complete or use the input's phase as authorization. |
| P1: structured receipt still bypasses newer-marker refusal in the other public delete API | With current captured g1, a valid structured g1 receipt and complete committed marker naming g2, `deleteAccountLocalDataAccount` returns success and removes the g2 record/marker. Only the missing-tombstone branch checks the marker (`:118–127`). | Apply present complete-marker matching in this entry too. Missing marker is a narrow valid-receipt retry exception; a present conflicting marker cannot be overridden. Keep current-owner refusal and legitimate partial/idempotent retry. |
| P1: recovery single flight is neither identity-safe nor cross-instance | Same-page calls keyed only by kind/account/business generation return the first operation's successful old-auth receipt to a second request with a different authGeneration. Two independently loaded Settings module instances sharing the same origin lock scheduler dispatch two simultaneous secret participants, with one later rejecting after a receipt-token collision. There is no recovery Web Lock. | Settings workflow coordination: the approved generation-independent recovery → account lock order, complete identity/raw matching on entry and after acquiring workflow ownership. Re-read complete state before doing work. Do not return another receipt identity's Promise or rely solely on a module-local map. Keep account/domain locks released during secret/auth work. |
| P1: receipt is not checked before the first secret participant | A controlled concurrent replacement immediately after local cleanup's account lock returns, before the awaiting Settings continuation resumes, still dispatches `clearAccountAiSecrets` once. It detects the replacement only after that participant; auth is correctly suppressed and replacement bytes retained. | Settings `resumeAccountLocalDeletionOnce`, before `:79`: compare the current raw/identity token after each await **before** the next participant, retaining existing post-secret/post-auth checks and final locked publication guard. |

These are bounded failures of previously specified requirements. In particular, the two independent module instances are a deterministic isolation/concurrency probe, not a claim that this review ran a native multi-tab browser case. The absent cross-instance recovery lock is also directly visible in source. Parent's same-page native concurrent calls pass because a6 adds a module-local Promise map; that does not satisfy the cross-instance requirement.

## Independent fixed execution

| Execution | Result | Own artifact |
| --- | --- | --- |
| Original D2 foundation business assertions | 14 PASS | `d2-foundation-independent-astra-a6ad06d.log` |
| Original two malformed/legacy tombstone admissions | 2 PASS | `d2-deletion-admission-astra-a6ad06d.log` |
| C primary + helper boundaries | 29 PASS + 8 PASS | `c-primitive-independent-astra-a6ad06d.log`, `c-primitive-boundaries-astra-a6ad06d.log` |
| D1 shared writer | 8 PASS | `d1-shared-independent-astra-a6ad06d.log` |
| Original actual orchestrator assertions with valid fixture initialization | 13 PASS / 2 correct FAIL | `d2-settings-orchestrator-astra-a6ad06d.log` |
| Same original orchestrator assertions + operationId replacement | 13 PASS / 3 correct FAIL | `d2-settings-orchestrator-astra-intent-a6ad06d.log` |
| New slice boundaries, then added structured-receipt/new-marker case | 6 correct FAIL; then 7 correct FAIL | `d2-settings-slice-astra-a6ad06d.log`, `d2-settings-slice-astra-marker-a6ad06d.log` |
| Original unmodified Settings package | 41 files PASS / 1 file FAIL; 274 PASS / 8 FAIL (42 files / 282 tests) | `d2-settings-package-astra-a6ad06d.log` |

The package's eight failures all occur in its old orchestrator fixture, which lacks the newly required complete marker/native-style lock initialization. The independent copy adds only those initialization details and keeps every original business assertion: six of those failures become passing controls, while the two server-success A→B failures remain. Do not label all eight package failures new product defects, and do not claim the package passed. It still needs its test fixture migrated and its two genuine business failures repaired. No other package test or product module was overlaid for the package run.

`d2-foundation-independent.test.ts` changes only its two literal tombstone `1` expectations to matching structured version/account/kind/generation/pending receipt assertions, as approved by the implementation contract. Actual partial remove fault, missing marker, retained tombstone, retry removal, success idempotence and every other business assertion remain. The old c201/e9 logs are unchanged. C/D1 retain their prior named shared/exclusive test adapter and single mutator/setItem/replay requirements.

The seven slice tests inspect physical bytes/results, not author PASS labels. Their failures include important positive intermediate assertions: local phase completion and B preservation, first matching recovery success, second identity outcome, and later replacement/auth suppression. The two independent module imports share real localStorage and the named lock manager but have separate in-memory maps. Synthetic secret/auth gates do not exercise external providers.

## Preserved fixes and native attribution

The shared receipt helper/key is now storage-owned and exported; Settings uses it. Malformed/legacy tombstones no longer authorize the tested missing/legacy marker cases. Durable matching receipt resume survives marker removal and B-current state, uses short account-exclusive sections, persists/refuses actual phase writes, and compares replacement raw bytes after secret/auth waits. Same-page identical recovery shares one operation. Those implemented repairs should be retained while fixing the gaps above.

Parent independent `cc70314` supplies fixed a6ad06d original Settings four consumer cases PASS and two native initial + two reopen checks PASS (Chrome PID 1391 → 1415). The native checks establish lock waiting, same-page concurrent recovery, captured participant/account separation and exact reopened receipt/IndexedDB state in their declared scope. Author native logs remain separately named. I read those results; I did not rerun their browser suite or treat it as full-slice proof. Original native FAILs remain preserved.

## Reproduction and exit scope

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs a6ad06d d2-settings-orchestrator astra-intent
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs a6ad06d d2-settings-slice astra-marker
node docs/reviews/web-board-workspace-astra-review/verify-d2-settings.mjs a6ad06d d2-settings-package astra
node docs/reviews/web-board-workspace-astra-review/verify-d2.mjs a6ad06d '' astra
node docs/reviews/web-board-workspace-astra-review/verify-c-primitive.mjs a6ad06d c-primitive-independent astra
node docs/reviews/web-board-workspace-astra-review/verify-c-primitive.mjs a6ad06d c-primitive-boundaries astra
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs a6ad06d d1-shared-independent astra
```

Use a new revision/suffix for after evidence. Existing `20260909-settings-durable-deletion-contract.md` remains the implementation contract; no new design permission or provider/network expansion is needed. Repair storage receipt/transition/erase guards and Settings confirmed-intent/workflow/await boundaries together, then rerun these unchanged business oracles plus parent native/consumer cases. Tests that simulate queued callbacks must retain generation/token/phase consequences rather than asserting only a lock name.

No additional unrelated probes are necessary before that repair. This review does not approve full D2, sync writer admission, every account caller, old-client rollout, provider/network behavior, AI-02/REL-05 or Board detail draft work; Tasks D1's prior acceptance is unchanged. No product file, total ledger or production state was changed, and no push was performed.
