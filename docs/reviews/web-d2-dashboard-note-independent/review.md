# Dashboard note: next account autosave caller baseline

Parent independent check, fixed product `fa4b306`, immutable git archive. This is preparation for the next caller migration, not permission to skip the current hooks contract.

Two assertions fail against the unchanged real `DashHeader`:

- Holding the generation-independent account lifecycle lock does not delay Save: storage already contains `Newest note`, and the editor has closed while the exclusive lock is still held. After release the value remains the intended note. The failure is the missing coordinated wait and premature UI completion, not data corruption proved by this test.
- Mounting an absent account note persists an empty string with no user edit. The new async autosave contract requires absence to remain absent until an explicit mutation.

[Original evidence](independent-before-fa4b306.log), [assertions](contracts.test.tsx), [fixed runner](verify-fixed.mjs).

The test uses the real component and storage packages with a named shared/exclusive Web Locks fixture and complete synthetic account marker. It does not claim native browser or production verification. It preserves the device-owned offset independently. Existing note quota/latest draft/export/baseline/account and device-position recovery assertions must also remain satisfied in the eventual migration, with asynchronous timing updated honestly.

Next: finish the current shared hooks acceptance, then have Astra define the bounded caller contract and Terra implement it. No product source changed and no numbered item closed.
