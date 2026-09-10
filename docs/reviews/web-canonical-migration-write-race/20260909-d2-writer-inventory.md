# D2 account lifecycle: writer inventory for architecture handoff

Parent read-only inventory, Web module, fixed source `0b236cd`, 2026-09-09. This is a source-path inventory, not acceptance or a new implementation contract. The original migration stage/verify and autosave acknowledged-write failures remain open. Astra owns the subsequent design decision.

## Confirmed coordination gap

`packages/plugin-web-storage/src/internal/accountMigration.ts` acquires `${accountPrefix}migration` around snapshot, secret stage/verify and marker publication (lines 59–115); rollback uses that same migration-only lock (125–137). `canonicalCommandState.ts` acquires dataset locks at 247 and 346. Ordinary synchronous storage calls do not acquire the migration lock. Consequently the migration lock serializes migrations with each other, but does not by itself exclude ordinary writers. The existing independent failures demonstrate the consequence; this inventory does not introduce another runtime claim.

## Surfaces the implementation must classify

All paths below are repository-relative and refer to the pinned source.

| Surface | Observed physical mutation | Required design consideration |
| --- | --- | --- |
| `plugin-web-storage/src/internal/storage.ts` | `setPref` 162, `removePref` 207, `setPrefAutosave` 378, `removePrefAutosave` 413 | Account versus device ownership; synchronous return contracts and all dependent hooks/UI. An async replacement must not let a Promise masquerade as a successful boolean. Removal currently returns void in the autosave API. |
| `plugin-web-storage/src/internal/canonicalCommandState.ts` | Ordinary mutation 299 and AI receipt commit 426 | Acquire account shared writer coordination before the existing dataset exclusive lock. Preserve receipt replay and owner/marker/tombstone checks after waiting. |
| `plugin-web-storage/src/internal/accountScope.ts` | Exported `createScopedStorage` setters 68–69 | Public raw writer bypass; no production call site found by symbol search beyond its export. Lack of current calls is not proof the public capability can bypass the contract safely. |
| `plugin-web-bookkeeping/src/internal/storage.ts` | Scoped write 40 | Migrate the direct business-state writer and its synchronous callers. |
| `plugin-web-metric-tracker/src/internal/storage.ts` | Scoped state write 70 | Preserve existing save/refusal recovery when introducing waiting. |
| `plugin-web-time-tracker/src/internal/storage.ts` and `TimeTrackerModule.tsx` | Scoped writes 107 and 3648 | Include both business storage and module helper; mode preference at storage line 139 is a separate device write. Preserve active-timer and settlement contracts. |
| `plugin-web-pomodoro/src/internal/sessionController.ts` | Active write/remove 67–68; history append 83 | Existing multi-record settlement/retry semantics must survive coordination; avoid acquiring locks in reverse order. |
| `xai-web-meditation/src/internal/sessionController.ts` | Active write/remove 93 | Existing session lock must nest after account coordination. Preserve issued-time and pending-action behavior. |
| `plugin-web-storage/src/internal/accountDataLifecycle.ts` | Tombstone and account-prefix deletion 36–37 | Currently synchronous. Define account exclusive deletion and how it composes with retry/partial cleanup. |
| `plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts` | Calls deletion at 78, writes phase, then awaits secret/auth cleanup | If local deletion becomes async, this caller must await it before recording completion. Whole cleanup scope must be decided explicitly; an account-data lock is not automatically an auth-store transaction. |
| `plugin-web-ai-chat/src/internal/secretStore.ts` | Async provider secret writes and migration staging | Separate persistent store and migration participant. Inventory normal secret updates as well as stage/verify; do not claim they are covered by wrapping localStorage alone. |

Product package paths above are prefixed with `packages/`. Shared setPref/autosave consumers include other account-owned categories, including Board, list/tag metadata and conversation/settings state. This table identifies common entry points rather than claiming an exhaustive list of every indirect caller.

## Scope boundaries and next decisions

The search covered `.setItem(`/`.removeItem(` in `packages/*/src` and `apps/web/src`, excluding test files, then inspected the account-scoped paths and ownership registry. It also found desktop plugin adapters, auth/session storage, device preferences and migration bookkeeping. Those are not all ordinary Web account-generation writers; a raw match count would overstate coverage. Other persistence mechanisms, computed calls and external clients require separate inspection.

The already approved D1 document specifies account shared writer → dataset exclusive, versus account exclusive migration/rollback/deletion. D2 still needs an implementable decision for synchronous APIs, existing timer lock ordering, account metadata/secret participants, pending UI and default-off/old-client activation. A new version's cooperative WebLocks do not restrain already running old JavaScript. Do not silently activate a mixed-client protocol or interpret this inventory as permission to replace storage architecture.

Acceptance should retain original correct failures and controls, then exercise supported async writes both before and during migration stage/verify, rollback and deletion. Verify actual current-generation bytes and UI result after the scheduled operations finish; an acknowledged write stranded in the old generation is not success. Include account autosave and representative direct timer/business writers, not just Tasks/Calendar. Native multi-document testing remains separate from the existing deterministic jsdom interleavings.
