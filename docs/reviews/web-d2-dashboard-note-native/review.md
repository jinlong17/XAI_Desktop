# Dashboard async account note: native baseline

Fixed product `9aac0ea`, isolated git archive, real Chrome with a temporary profile and synthetic complete account markers. [Raw result](native-9aac0ea-before.json).

Two expected failures reproduce the unchanged account caller's gaps: Save writes while the generation-independent account lifecycle lock remains held, and mount seeds an absent account note with an empty string. The fault-recovery control passes: quota reaches the physical note write, latest edited text remains visible, explicit Retry persists it and closes the unchanged editor.

This corroborates the earlier component tests with native Web Locks and the actual DashHeader DOM. No whole-process reopen is claimed for this failing baseline. The runner will only terminate/reopen and verify saved checkpoints when all initial cases pass. Device position protocol remains outside this account conversion; CSS is omitted, so this is not visual acceptance.

Keep [the probe](native-probe.ts) assertions unchanged when verifying Terra's fixed implementation. The broader caller contract and original recovery tests remain necessary; three native cases are not full Dashboard acceptance.

## Fixed caller after c79330c

Parent executed the unchanged probe against `c79330cd287d53e6b37eae6597497beb1dad1f7d`: **3/3 PASS**. Both original failures are repaired and the quota/latest-draft control remains passing. Chrome PID 55311 exited normally under observed SIGTERM; PID 55411 reopened the isolated profile and all three persisted checkpoints passed, including continued physical absence for the never-submitted account note. [Raw after result](native-c79330c-after.json).

The original component assertions also pass 2/2 in a separate immutable archive: [log](../web-d2-dashboard-note-independent/independent-parent-after-c79330c.log). Author coverage of the complete caller contract and Astra independent review remain pending. No full Dashboard, UI aesthetics, device offset conversion, or numbered-item closure is claimed.
