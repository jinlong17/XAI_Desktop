# Dashboard async account note: native baseline

Fixed product `9aac0ea`, isolated git archive, real Chrome with a temporary profile and synthetic complete account markers. [Raw result](native-9aac0ea-before.json).

Two expected failures reproduce the unchanged account caller's gaps: Save writes while the generation-independent account lifecycle lock remains held, and mount seeds an absent account note with an empty string. The fault-recovery control passes: quota reaches the physical note write, latest edited text remains visible, explicit Retry persists it and closes the unchanged editor.

This corroborates the earlier component tests with native Web Locks and the actual DashHeader DOM. No whole-process reopen is claimed for this failing baseline. The runner will only terminate/reopen and verify saved checkpoints when all initial cases pass. Device position protocol remains outside this account conversion; CSS is omitted, so this is not visual acceptance.

Keep [the probe](native-probe.ts) assertions unchanged when verifying Terra's fixed implementation. The broader caller contract and original recovery tests remain necessary; three native cases are not full Dashboard acceptance.
