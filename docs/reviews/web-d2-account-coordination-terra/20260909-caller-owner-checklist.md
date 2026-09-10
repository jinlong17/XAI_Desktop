# D2 caller and owner checklist

This implementation batch establishes the shared storage foundation only. It does not admit coordinated mode for legacy synchronous callers, alter production activation, or claim account-wide lifecycle completion.

| Logical writer | Ownership | Current writer/caller | Required lock order | Current status |
| --- | --- | --- | --- | --- |
| Registry account preference | account | `setPrefAccount` / `removePrefAccount` | account shared, then no further domain lock | New explicit Promise API; existing boolean API remains uncoordinated. |
| Open-ended account autosave | account | `setPrefAutosaveAccount` / `removePrefAutosaveAccount` | account shared, then no further domain lock | New explicit Promise API; `usePrefAutosave` callers remain to convert. |
| Scoped raw account storage | account | `createScopedStorage().setItemAccount/removeItemAccount` | account shared, then caller domain lock | New explicit Promise API; old raw setters remain uncoordinated. |
| Canonical Tasks and Calendar datasets | account | `commitCanonicalCommand` / `mutateCanonicalDataset` | account shared, then dataset exclusive | Public primitives are coordinated in this batch; their Task and Calendar product callers remain separately owned and unconverted. |
| Generation migration and rollback | account lifecycle | `migrateAccount` / `rollbackAccount` | account exclusive, then raw already-held lifecycle context | Uses generation-independent account lock name and raw source-key/byte revalidation before marker publication. |
| Local account deletion | account lifecycle | `deleteAccountLocalDataAccount` | account exclusive | New Promise result; Settings recovery caller remains a separate coordinated batch. |
| Bookkeeping, metrics, time tracker, pomodoro, meditation | account | package-local writers/controllers | account shared, then their existing domain/timer locks | Not converted; preserve their UI/retry contracts before coordinated admission. |
| Board, list/tag metadata, conversation/settings | account | indirect registry/autosave callers | account shared, then module lock if any | Not converted; synchronous callers cannot count toward D2 completion. |
| Provider secrets | account plus separate store | `secretStore` and migration participant | account shared/exclusive before secret lock | Not converted; provider/network operations remain outside this batch. |

The account lock name excludes generation, so an old-generation write and a lifecycle transition for the same account contend. Async APIs capture their scope before enqueueing and verify current owner, tombstone, and committed generation marker inside the shared lock. Migration compares the complete previous-generation key set and raw bytes plus the legacy import source after secret stage/verify; a difference refuses marker publication and leaves the current generation visible.

Evidence in this batch: `accountCoordination.test.ts` covers shared/exclusive mode, stale owner, unavailable lock, scoped async raw storage, and changed-source migration refusal. Existing storage tests retain synchronous API behavior and migration controls.
