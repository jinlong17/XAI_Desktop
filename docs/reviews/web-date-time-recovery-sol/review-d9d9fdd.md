# Sol independent Date & Time caller verification — `d9d9fdd`

## Verdict and exact attribution

Independent immutable-archive verification passes **47/47** at `d9d9fdde211e19fc258f97e7184a8ee77338d80c`:

- committed product pane suite: 8/8 (`DT1`–`DT8`)
- Sol-owned core caller assertions: 5/5
- Sol-owned recovery/owner/export assertions: 5/5
- Sol-owned operation/conflict/targeted-recovery assertions: 8/8
- Sol-owned expanded field/source/lock/Retry/export/disposal assertions: 21/21

The arithmetic is 8 product-authored tests plus 39 Sol-authored assertions. `DT8` is the new product regression for advancing a failed predecessor without acknowledging the queued latest choice; it must not be labelled as a Sol test. The prior 46/46 at `611062e` and 45/45 at `96c4915` retain their original fixed-SHA attribution.

All five new `final3` logs record the exact full SHA above and `exit=0`. `verify-fixed.mjs` archived `d9d9fdd`, reconstructed package aliases from that archive, and copied the committed, clean Sol fixture and verifier sources into the temporary archive. These are new executions at the fixed product revision, not renamed earlier logs.

## Delta and independent regression result

The product-code delta is confined to the Date & Time caller and its product test. The shared storage hook/engine is unchanged from `611062e`, and the 39 Sol assertions plus their runner are unchanged from their committed source at `889c95d`.

The caller correction now allows Retry to advance a failed predecessor while preserving the newer queued draft's independent identity. The product DT8 oracle proves the public sequence in both stages: predecessor Sunday is retried and physically commits while the visible Saturday draft stays recoverable, then Saturday's own Retry commits and clears recovery. The unchanged Sol matrix simultaneously passes all five controls, physical device-key/codec behavior, normal and unavailable sources, pending and partial outcomes, per-field Retry, targeted/all discard, sparse/all-five export, owner/disposal permission, named locks, external conflicts, and uncertainty recovery.

No new Sol failure was observed. Any failure in Astra's exact caller-five sequences remains Astra-owned evidence; this report does not replace or pre-accept those tests. Parent-owned real native/host/types verification also remains separate.

The recovery, advanced, and boundary logs still contain React `act(...)` warnings (10, 9, and 10 instances across 3, 4, and 3 named tests respectively). The awaited business assertions pass with exit zero, but those three modes remain warning-bearing rather than terminal-clean.

## Reuse and acceptance boundary

Header's historical Sol regression remains 42/42 at `96c4915`, with exact original attribution. Neither `d9d9fdd` nor the commits after `611062e` modify the shared storage hook/engine, so Header was not pointlessly rerun or relabelled as a current execution.

This is a bounded independent Date & Time caller regression PASS at `d9d9fdd`. It does not by itself accept the complete Date & Time contract or close full312, REL, D2, all Settings writers, calendar propagation, or release readiness. Final contract acceptance remains Astra-owned after the caller-five, shared, parent native/host/types, and source-review evidence are reconciled.
