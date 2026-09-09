# Canonical primitive: independent native Chrome checks

Module: Web. Fixed product `37252bcafe8efbd24cb8514d3e564c61fcabf3dc`. Product imports are bundled from a git archive, excluding ongoing subscriber changes. Run `node docs/reviews/web-canonical-primitive-native/verify-native.mjs 37252bc`.

**Seven native scenario groups PASS**, recorded directly by the runner in `native-37252bc.json`. This supplements Astra's component/storage acceptance `782f7b7`; it does not close full AI-02.

The runner creates a temporary local HTTP origin and isolated headless Chrome profile, then removes its browser and files. Two same-origin iframe documents each load their own product module instance and capture their own account scope. They share real browser localStorage and the real `navigator.locks` service. No lock mock or intercepted storage writer is used.

| Scenario | Observed result |
| --- | --- |
| Cold default activation | A fresh document's command refuses as activation-disabled; physical record remains absent. Tests then explicitly enable the test-only seam. |
| Concurrent duplicate identity | Two independent documents return one new commit and one durable replay; exactly one data item, receipt and revision exist. |
| Concurrent distinct identities | Both updates remain, with three total items and revision 3. |
| Actual document navigation/reload | Reloaded module heap replays the original identity with reordered semantic object properties; exact persisted bytes remain unchanged. |
| Changed operation after reload | Same identity/different title returns request-conflict without writing. |
| Delete last item and reload | All three items are actually removed. After reloading the other document, the final deletion replays successfully with unchanged bytes; a fresh-ID deletion of the missing target returns not-found. |
| Real lock queue plus generation change | The parent document holds the implementation's physical-key lock. `navigator.locks.query()` confirms the child command is queued; a synthetic persisted generation-marker replacement occurs before release. The queued command returns account-changed and does not modify its old dataset. |

## Evidence limits

The domain is deliberately a small validator-backed object map passed to the real generic primitive using the Calendar physical key. These checks do not instantiate Calendar/Tasks subscribers, UI, tools or provider continuation. They demonstrate primitive serialization and persistence behavior, not the six-operation product contract.

The documents are real browser browsing contexts inside one headless Chrome instance. Reload means actual iframe document navigation with a fresh module heap; it is not an entire browser-process close/reopen, a separate OS process guarantee, or an old-client upgrade test. The marker replacement is an explicit fault/interleaving setup, not execution of `migrateAccount`. The known migration write-race and all-writer coordination requirements therefore remain open.

The activation seam is enabled only in this synthetic local profile after verifying its cold default. Production activation remains off. No account credentials, external provider requests, production service or user browser profile were used.
