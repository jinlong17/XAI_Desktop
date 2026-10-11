# Async preference engine residual repair — Terra evidence

Fixed product commit: `650458908342013acffd7a43fc5161f7d687fea2`.
This follows Astra's independent [2c5dc31 repair report](../web-d2-async-pref-astra-engine/review-2c5dc31.md).

The engine now limits `allowAbsentDefault` to unregistered dynamic removal with
an actual `undefined` absent value. Registered bindings always validate their
registry default. Validator exceptions fail closed as typed `invalid` results.
Both registered and dynamic bindings enforce their primitive codec at runtime,
and registered autosave removal publishes its registry default.

`readback-uncertain` failures now contain an opaque, process-local `retryToken`.
The engine records the token with the full physical key (including account and
generation), original raw baseline, intended raw bytes, and operation kind. A
retry may reconcile before baseline conflict only when all fields and the token
match; it publishes once then consumes the token. Wrong token, different key or
intent, external replacement, a changed generation, and repeated use refuse or
remain ordinary no-ops. Existing public Account adapters keep their no-token
same-intended retry reconciliation for the original 21-case contract.

Verification:

- [original 21-case archive output](fixed-6504589-original21-after.log): 21/21 PASS.
- [seven repair-boundary archive output](fixed-6504589-repair-boundaries-after.log): 7/7 PASS.
- `pnpm --filter @repo/plugin-web-storage check-types`: PASS.
- Focused engine and coordination tests: 16/16 PASS.
- Current integrated workspace storage package test: 22 files, 184/184 PASS.

The final package count includes Sol's uncommitted hook integration test in the
shared workspace, so it is not evidence for this product commit by itself. The
two archive results above isolate the committed engine. No push occurred; D2,
AI-02, and REL-05 remain open pending hook and native-pane verification.
