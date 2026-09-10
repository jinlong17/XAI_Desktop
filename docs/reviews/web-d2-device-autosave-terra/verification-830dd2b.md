# Dv1 Dashboard pending source reload

Functional source revision: `830dd2b659cc053a566b3401b710c10441647bba`.
Direct caller-test revision: `0027a6c236a5afc0b7c0f401d0a239001b087ac2`.

## Trigger and containment

An invalid device source can remain marked invalid while an explicit position
edit waits on the physical-key lock. The Reload control is therefore still
available while that caller operation is pending. The caller now marks only
that active operation ignored before it calls `meta.reload()`. A completion
from the disposed controller cannot add an `account-changed` recovery error;
the existing failed-operation reference and its opaque retry token are not
cleared or replaced.

The focused test seeds raw `null`, holds the device request after drag/up,
reloads while pending, repairs the raw position to `80`, reloads again, then
releases the old promise. It verifies that no position write occurs and the
new valid source clears recovery.

## Verification

- `DashHeader.recovery.test.tsx`: 7/7 passed, including pending reload.
- Full dashboard package at `0027a6c`: 24 files, 216 tests passed.
- Types and lint at `830dd2b`: passed.
- Immutable archive checks at `830dd2b`: source feedback 3/3, Astra device
  contract 13/13, original device contract 3/3, account-note contract 11/11.

The raw immutable outputs are retained beside this report. Native Chrome and
Astra acceptance are parent-owned.
