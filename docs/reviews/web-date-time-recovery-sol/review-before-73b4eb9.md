# Independent Date & Time recovery baseline — 73b4eb9

Independent verifier: Sol. Fixed product baseline: `73b4eb9184c06764a3befd101961a3856988022f`.

The immutable archive runner mounts the real public `dateTimePane.render`, uses the real storage hooks, physical device keys and named mutation locks, and copies only this directory's reviewer assertions. It does not mock pane hooks or host state.

The original pane suite passes 6/6. The new core matrix yields one positive normal-path PASS and four correct business FAILs: all five normal edits preserve their exact codecs and physical values without mount writes; quota loses all latest visible choices; real key locks do not delay the synchronous caller; partial failure has no guard; invalid/unavailable sources have no field-specific Reload UI. Recovery yields five correct FAILs covering sparse full-denial export, zero-write all discard and late completion, stale/fresh owner permission, synchronous owner change during export setup, and one-write uncertainty Retry.

These failures are product behavior at the fixed baseline. The earlier no-test output caused by an incorrect setup-file path was deleted and is not evidence. Parent's actual-host baseline remains separately owned.
