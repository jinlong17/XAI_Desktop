# Astra B–D supplement: old-client rollout boundary

**B–D implementation may proceed under `9df552e`; complete AI-02/rollout acceptance additionally requires a verified old-client compatibility or drain boundary.** A new Web Lock cannot compel already-running old JavaScript to acquire it. This is a deduction from the current legacy writer, not a claimed execution of a new protocol failure: the canonical protocol has not been implemented or tested against an old tab in this review.

## Separate the two guarantees

1. **Current compatible version:** every writer of each canonical Tasks/Calendar key must use the common lock and canonical read/validate/commit API. Real two-tab current/current tests can establish serialized data-and-receipt preservation within that participating client population.
2. **Legacy runtime population:** old `setPref` directly encodes a domain value and calls `localStorage.setItem` on the same account-owned physical key. It does not acquire the future lock or preserve envelope metadata. If it runs after migration, new code alone cannot prevent its replacement write. A StorageEvent or envelope marker detects changes only after they occur; erased receipts cannot be safely reconstructed from the surviving domain data.

Therefore “all new writers use Web Locks” cannot be reported as “old tabs cannot overwrite.” A no-response BroadcastChannel handshake, a current-tab version flag, or an exclusive lock does not prove that nonparticipating, suspended or offline old contexts are absent. A service-worker update alone does not replace already executing JavaScript.

## Required migration/rollout gate

Before the **first envelope write** into an existing physical key, the rollout must establish a compatible client population for that browser storage partition, or keep canonical mutation activation disabled. The affected population includes every window/frame/app context capable of writing that same store, including suspended/restored contexts. The gate must address stale cached app versions reopening after the initial drain, not merely the currently visible tab.

For a controlled deployment, an operational drain/upgrade can be a valid boundary only with evidence that old editing work is safely saved/exported, all relevant old contexts are terminated or navigated to a verified compatible build, the new build is what subsequent navigations/restores/offline startup load, and migration is not activated while that evidence is uncertain. Do not silently discard old-tab drafts to satisfy a rollout check. Version acknowledgements can verify participating clients, but cannot by themselves certify the absence of an older client that never implemented the protocol.

For a general Web rollout, if the actual delivery/runtime mechanism cannot substantiate both draining existing legacy writers and preventing their reentry, the `9df552e` old-tab preservation gate remains **BLOCKED**. Merely labeling old clients “unsupported” does not prove the stated storage-preservation guarantee. Report the narrower current-compatible-clients result honestly and keep full AI-02/rollout closure open for an explicit architecture decision. This review does not assert that the current app already has a working drain/upgrade mechanism.

## Evidence required before full closure

- Use a pinned real old build and a pinned candidate build sharing the same origin/account storage, not two copies of the new writer. Retain a pending old edit across the attempted upgrade/migration.
- Exercise normal old window, suspended/resumed window, session restoration and stale/offline navigation for the supported deployment environments. Prove envelope activation is withheld until the relevant old writer is gone or upgraded; prove the old edit is not silently lost.
- After activation, show that supported navigation/restore paths cannot restart the incompatible writer. Separately run all current-version AI/AI and AI/UI lock scenarios and inspect both data and receipts.
- Test rollback: reverting to an old reader/writer must not resume writes to the migrated keys. Rollback must stay on a compatible build/protocol or remain visibly unable to write until a separately reviewed recovery procedure is performed.
- Record exact build identities, storage partition, activation barrier and migration timeline. If an old runtime can remain active and write the same key, report that counterexample and stop the rollout gate rather than interpreting a new-client lock test as protection.

Do not implement a second-key journal, silently switch physical keys, or invent an IndexedDB migration as a workaround without returning for architecture review. Such changes alter the approved protocol/compatibility boundary. A separate backend/protocol may offer a hard isolation boundary, but it still requires complete migration and reader/writer/lifecycle analysis.

This supplement preserves the A1 acceptance and B–D entry decision. It adds no claim that new canonical code or old-client rollout has passed. It makes explicit the release prerequisite already implicit in `9df552e`'s requirement that old app tabs not silently erase receipt-bearing records.
