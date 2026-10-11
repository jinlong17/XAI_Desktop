# D2 foundation e9ff409 — independent review

Astra, Web, 2026-09-09. Product fixed at `e9ff409768a8fcf92cf9a4de3adf7685700b987e`; every execution below uses `git archive` and pinned workspace-package aliases. No Tasks repair, later product changes, production state or deployment is included. Contract: `20260909-d2-implementation-entry-contract.md` (`0b3a043`) and author caller checklist in `docs/reviews/web-d2-account-coordination-terra/`. **Do not accept this foundation yet.** The account-lock direction is correct, but four bounded defect groups require repair.

## Confirmed blockers and minimum ownership

| Defect | Evidence and user-visible consequence | Minimum repair owner |
| --- | --- | --- |
| P1: native account lock cannot run | Parent independent `45b83b6`, `../web-account-coordination-native/review.md` and `native-e9ff409.json`: actual Chrome direct shared lock, public autosave and actual migration all FAIL with unbound `Illegal invocation`. Native request arity is 2; retaining the arity branch after fixing its receiver would request exclusive instead of shared. This also affects the already-connected canonical primitives, not just future callers. | `plugin-web-storage/src/internal/accountCoordination.ts`: invoke the native method with its receiver and explicit `{mode}`. Update test adapters to the actual overload at the test boundary; never infer support from `.length`. Re-run the native held-mode oracle. |
| P1: new scoped async APIs bypass canonical protection | My two FAILs: `createScopedStorage(localStorage).setItemAccount('xai_task_cols','[]')` and `removeItemAccount` both return `{ok:true}` and replace/delete a valid protected envelope containing a receipt. The typed async APIs reject the same operations, a passing control. Taking the account shared lock does not serialize against another shared writer's dataset lock or preserve receipts. | `accountScope.ts`, new scoped coordinated/raw mutation path. Refuse protected canonical writes/removals, including unreadable states, or use the existing receipt-preserving canonical dataset engine with account-before-dataset ordering. Do not recursively acquire the same account lock. Account-exclusive lifecycle cleanup is a separate explicitly authorized context. |
| P1: incomplete persistent marker authorizes mutation/deletion | My three FAILs: with marker exactly `{"generation":"g1"}`, typed async write and scoped async write change `["keep"]` to `[]`; async deletion removes it. All return success. This marker is not valid under the existing C guard (`canonicalCommandState.ts:189–191` requires migrationId and an own previous field of the proper shape). New helpers check only generation equality. | `storage.ts` (`assertCurrentAccountGeneration`), `accountScope.ts` (`assertMarker`), `accountDataLifecycle.ts` marker admission. Reuse a complete marker validator and truthful typed refusal. Do not weaken canonical's established marker contract or silently synthesize missing fields. Missing/corrupt marker remains recovery-required except the separately proven tombstoned deletion-resume case. |
| P1: partial deletion is not retryable | My failure injection allows deletion of the generation marker, then throws on removal of an actual account record. The tombstone remains and the first result refuses correctly. After removing the fault, retry returns `recovery-required` and leaves the record behind because the marker is now absent. A second control scenario finds an already successful deletion is also not idempotently retryable. | `accountDataLifecycle.ts`, `deleteAccountLocalDataAccount` preflight. Under the exclusive lock, allow an authenticated, captured-owner deletion recovery with valid tombstone/resume provenance to finish without the already-deleted marker. Preserve the tombstone; stale/different owner must still refuse. Do not allow ordinary writers through this exception or manufacture cleanup success while bytes remain. |

All source pointers in this report describe the fixed revision. Existing synchronous scoped setters are not counted as the new scoped defect: the independently failing calls are the newly introduced Promise-returning APIs themselves.

## Independent execution and limits

| Execution | Result | Evidence |
| --- | --- | --- |
| New foundation public-API oracles | **7 PASS / 7 FAIL** (14 tests, three local defect groups above) | `d2-foundation-independent-astra-e9ff409.log`, `d2-foundation-independent.test.ts` |
| Existing C primary contract, unchanged | **28 PASS / 1 timeout** | `c-primitive-independent-e9ff409.log` |
| Existing C helper/length/semantic boundaries, unchanged | **8 PASS** | `c-primitive-boundaries-e9ff409.log` |
| Existing D1 shared-writer contract, unchanged | **8 PASS** | `d1-shared-independent-astra-e9ff409.log` |

The C timeout is specifically `two same-identity commands serialized by the supplied lock commit only once`: its reviewer fixture uses one global Promise tail for *every* lock name (`c-primitive-contract.test.ts:123–124`). After D2 adds account → dataset nesting, the inner dataset request waits behind the account callback that is awaiting it. This fixture self-deadlocks; it is not independent evidence of a production duplicate-command bug. Keep this original timeout log. Repair the fixture to distinguish names and shared/exclusive semantics for the next revision while preserving the one-mutator/one-physical-write/replay oracle; two dataset requests remain expected, account requests are additional. No 37/37 claim is made here.

The new passing controls establish typed preference publication exactly once per set/remove despite a throwing subscriber; autosave set/remove physical outcomes; typed and scoped tombstone refusal; typed protected-record refusal; queued A→B refusal with neither account receiving the old draft; canonical account-shared before dataset-exclusive requests and unchanged bytes for a true no-op; and an independently scheduled writer waiting outside migration's exclusive stage then refusing its stale generation after visibility changes. The deterministic scheduler serializes by lock name and records requested modes; it does not emulate shared-reader concurrency or prove native Web Locks. Parent's real-browser adapter failures remain controlling native evidence.

Parent separately reports fixed-source migration comparison 7 PASS with original source-change failures preserved. Author reports storage 168/type PASS. Those are attributed evidence, not my execution and not substitutes for the public API/native failures. No package-wide or actual UI claim is added from my focused runs.

Reproduction:

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d2.mjs e9ff409 d2-foundation-independent astra
node docs/reviews/web-board-workspace-astra-review/verify-c-primitive.mjs e9ff409 c-primitive-independent
node docs/reviews/web-board-workspace-astra-review/verify-c-primitive.mjs e9ff409 c-primitive-boundaries
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs e9ff409 d1-shared-independent astra
```

Use a new revision/suffix for repairs; retain all before logs.

## Bounded source assessment and next sequence

The stable account/demo lock name excludes generation, canonical requests account before dataset, migration/rollback request account-exclusive, and migration now rechecks the complete generation source key set and raw bytes after secret stage/verify. These are useful foundation changes. Existing canonical validation, receipt-preserving single-record commit, baseline/revision guards, final owner/marker/tombstone checks and same-tab publication remain in the engine. Source comparison is defense against currently uncoordinated writers, not proof that old JavaScript cannot write immediately after that comparison.

1. Repair the four foundation groups above first, including production-native invocation/mode and nested test adapters. Re-run these unchanged business oracles, parent native checks, migration source oracles and C/D1 regressions at a new fixed hash. The deletion marker exception must remain narrowly confined to legitimate recovery.
2. Then convert Settings deletion recovery to await the real local cleanup result before advancing phases; coordinate import/rollback/export snapshots and already-held-lock contexts. Preserve owner capture, partial-failure recovery and secret/auth phase boundaries.
3. Convert the writer checklist in owned slices: typed/autosave hooks and all their ordinary UI callers; direct Bookkeeping/Metrics/Time Tracker storage; Pomodoro/Meditation timer transactions with account-before-domain order; ordinary provider-secret writes as well as lifecycle secret participants. Return and await explicit success/refusal through each callback. Tasks/Board/Calendar D1 acceptance does not prove their metadata/autosave paths have D2 participation.
4. Add coordinated admission and refusal of every retained synchronous account bypass only alongside proven converted callers. The checklist correctly says this is **not admitted** now; old synchronous pref/autosave/scoped and lifecycle callers still exist. Default-off canonical activation is unchanged, but activating existing canonical clients already exercises the broken native foundation. No default-off argument neutralizes the defects above.

The prior implementation-entry contract is still sufficient to organize those next slices; the repairs do not authorize changing physical keys, adding a receipt journal, or bypassing domain validation. Ordinary secret-store coordination, multi-store recovery, current-client completeness, native multi-document lifecycle races and the old-client rollout/admission gate remain separate work. A new lock cannot compel old direct localStorage writers to obey it. Full D2, D1, AI-02, REL-05, Board detail draft recovery and release readiness stay open; this report changes no ledger or production activation.
