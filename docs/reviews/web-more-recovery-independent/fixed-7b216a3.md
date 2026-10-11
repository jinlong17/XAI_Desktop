# More actual Settings/Shell fixed baseline

Parent-owned fixed verification for the complete More contract `fc56d5e`, with product pinned to `7b216a3d5a4947d0f66da042fb275302737fb762`.

## Result

The unchanged 11-test actual Settings/Shell baseline passed **11/11**:

```sh
node docs/reviews/web-more-recovery-independent/verify-fixed.mjs 7b216a3 host control-plane-20260917
```

Authoritative fixed log: `host-control-plane-20260917-7b216a3.log`

SHA-256: `cc2e2abbe5ea524e09a7880ee599bf94fb3e45b63950663ecf189c59b8e7358b`

The log records the resolved full SHA and `exit=0`. It reruns the same reviewer-owned assertions whose authoritative baseline at `afbfb24` was 10 correct failures and one clean positive control.

## Verified boundary

- Failed device and both account-owned edits retain the latest visible choice through the actual composed Settings surface.
- The actual router and voluntary signout path remain held while those edits are unresolved.
- Failed removal for the same three fields retains recovery truth even when the intended reset value equals the displayed registry default.
- The clean positive control still permits navigation/signout and performs no seeded More write.

## Limits

This is component-host evidence with the production composition and deterministic named-lock fixture. It is not native Chrome, production authentication, physical disk-download, trusted-keyboard, cross-document conflict, held-native-lock, visual/focus/hit-target, or complete host-contract evidence.

The complete first-intent/history/relative/partial/latest-release/Stay/Escape/export/epoch/unmount host expansion, native/browser matrix, final regressions, and Astra acceptance remain pending. It closes no 312 item, D2/REL/AI obligation, deployment gate, or release gate.
