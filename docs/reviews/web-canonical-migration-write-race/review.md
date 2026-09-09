# Tasks save versus account migration: independent regression evidence

Module: Web. Fixed product revision `2dc5333`; imports use an immutable git archive, excluding the concurrent Sol C primitive work. This is a jsdom storage/production-function interleaving test, not real two-tab or production authentication acceptance.

## Result

Run `node docs/reviews/web-canonical-migration-write-race/verify-fixed.mjs 2dc5333`.

Three assertions: one positive control PASS, two correct FAIL. The process returns 1; the failures remain as regression evidence, not an accepted test result.

- A successful ordinary Tasks `setPref` before migration is copied into the next visible generation: PASS.
- The same actual writer called during asynchronous `secrets.stage` returns true and persists the latest bytes in the original generation. Migration nevertheless returns success and publishes its earlier Tasks snapshot: FAIL.
- The same write during `secrets.verify` also returns true but disappears from the newly visible generation: FAIL.

The old generation retains the latest bytes; this is a loss of the acknowledged update from the current visible dataset, not physical deletion of all recovery data. No canonical envelope activation is needed to reproduce it.

## Mechanism and D acceptance requirement

`accountMigration.ts` snapshots the previous generation into `candidate` before its asynchronous secret participant. Afterwards it verifies only the staged destination and unchanged generation marker. It does not revalidate source data against the snapshot. `storage.ts` ordinary `setPref` neither participates in the migration lock nor changes that marker. An independent page can therefore successfully save after the copy but before publication. Separate account scope controllers model independent page identities; the same physical localStorage and actual migration/setPref implementations are used. The migration-lock seam serializes its callback only; it does not claim actual browser locks were exercised.

The D lifecycle design must coordinate generation publication with all relevant writers, or refuse/restart migration when the copied source changed. A key lock solely around the destination command does not by itself protect an earlier migration snapshot. The independent oracle permits safe refusal (old generation remains current) or a success that preserves the latest acknowledged value; it does not prescribe one architecture. The two existing failing tests should be rerun unchanged after the chosen repair, then expanded to actual current-client concurrent command/migration and rollback behavior.

This evidence adds a concrete lifecycle regression to the existing B-D requirements. It neither invalidates the bounded B2 null-source acceptance nor closes AI-02, REL-05 or REL-06. Architecture and final acceptance remain Astra responsibilities.

## Noncanonical account-writer follow-up

Fixed `946ded3`, the original three assertions were retained and two autosave cases added. Result: **3 correct FAIL / 2 positive controls PASS**, process exit 1 (`independent-946ded3.log`). Actual `setPrefAutosave` of account-owned `xai_pref_migration_race_private` succeeds during secret staging but the next published generation contains the previous preference. The same save before migration is preserved. This demonstrates that the migration problem is not confined to Tasks/Calendar or future canonical receipts.

Source inspection at this revision identifies these concrete participation boundaries for D; this list is not a claim that every indirect caller has been audited:

| Boundary | Current entry points | Implication |
| --- | --- | --- |
| Typed registry persistence | storage `setPref` / `removePref`, hooks `usePref` | Account keys share migration exposure; device keys are routed separately by ownership. Canonical envelope refusal alone does not coordinate legacy data writes. |
| Open-ended autosave | storage `setPrefAutosave` / `removePrefAutosave`, `usePrefAutosave` | Unknown `xai_pref_*` is account-owned. Migration explicitly copies owned open-ended keys; the new failed test exercises the actual setter. |
| Exported scoped wrapper | `createScopedStorage().setItem/removeItem` | Bypasses typed setters. Current source search finds its definition/export but no production consumer; distinguish exposed bypass from an active product path. |
| Time Tracker | internal `writeStored`, `writeTimeTrackerEntries`, `writeTimeTrackerCategories`, `commitTimeTrackerEntries`; Module `writeStringStorage` | Entries have their own `xai-tt:` key lock; it is not the migration lock. Ownership must be applied per key, particularly for view preferences. |
| Bookkeeping | internal `writeRaw` / state persistence | Uses `accountScope.physicalKey` and direct storage writes; adapting only the shared typed setter misses it. |
| Metrics | internal state writer | Direct physical account-key write outside typed setter. |
| Pomodoro | controller `writeActive` / `settle` | Domain lock and persisted-generation checks already exist, but migration exclusion still requires coordinated ownership; active/history writes are multiple ordered steps. |
| Meditation | session controller `key` / command persistence | Existing domain lock and generation check do not themselves participate in migration exclusion. |
| Migration/lifecycle | `migrateAccount`, `rollbackAccount`, `deleteAccountLocalData` | Raw copy, marker swap and deletion are participants, not ordinary domain setters. Raw export must preserve receipt bytes; it does not authorize mutation. |

The inventory was derived from `setItem/removeItem`, `physicalKey`, `generationKey/generationMarkerKey`, and scoped-wrapper references in `packages` and `apps/web/src`, followed by direct source reads. Existing bounded timer/save-recovery acceptances are retained; they did not prove universal account migration interleavings. The account lifecycle lock and ordering decision remains Astra's design responsibility. Do not make old synchronous APIs pretend to acquire an asynchronous lock.
