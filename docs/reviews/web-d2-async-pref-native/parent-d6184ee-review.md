# Parent fixed hook integration verification

Product: `d6184ee24eb1f72d826fc3548e4099845e5c628b`, immutable git archive.

Original independent hook assertions: 2/2 PASS; [log](../web-d2-async-pref-independent/independent-parent-hooks-after-d6184ee.log). Actual Collaborate/native WebLocks browser: 5/5 PASS; [raw result](native-d6184ee-parent-hooks-after.json). Chrome PID 45710 exited with observed SIGTERM completion; new PID 45819 reused the isolated synthetic profile and all five persisted checkpoints passed.

The five cases cover held account lock, quota failure retaining latest draft and explicit retry, two documents each applying one functional increment, pending A operation isolated from B with device control usable, and successful physical write followed by failed readback. The last case now reaches Saved on explicit retry with exactly one physical write; prior fixed 2c failure is preserved.

This verifies the actual select and physical preference values, not CSS aesthetics, deployment, durable unsaved drafts, or a server job continuing after browser shutdown. Engine acceptance e75d5b3 and author hook report 8c49657 remain distinct evidence. Full hooks review and open-ended bindings remain pending. No numbered item is closed.
