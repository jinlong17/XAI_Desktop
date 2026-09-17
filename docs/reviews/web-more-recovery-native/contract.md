# More native/browser verification contract

Product revision: `7b216a3d5a4947d0f66da042fb275302737fb762`.

This parent-owned verifier uses an immutable Git archive, pinned workspace package aliases, the actual `ComposedSettings`/Shell registration, an isolated real Chrome profile, Chrome DevTools Protocol trusted input, and physical localStorage/download observations. It contacts no production authentication, provider, server, deployment, or user data.

## Mode inventory

| Batch | Mode | Required evidence |
| --- | --- | --- |
| N1 | `controls-reset` | Trusted interaction for all 15 fields, exact physical device/account bytes, new-document reload, zero mount writes, actual Reset Default, all 15 physical keys absent, registry defaults displayed, unrelated bytes preserved |
| N2 | `host` | Actual route/rail/history/relative/signout/beforeunload, first-intent competition, Stay/Escape/focus return, discard-and-leave, partial/latest release, epoch and unmount cleanup |
| N3 | `recovery-owner` | Set/reset refusal, pending lock, uncertainty Retry, second-document conflict, sparse/mixed/all-15 disk export, A to B to locked privacy and surviving device work |
| N4 | `visual` / `visual-zh` | EN/ZH 375/414/768/1024/1440 containment, real hit testing, 44px recovery/dialog targets, trusted checkbox keyboard operation, focus trap and manual screenshot review |

Each mode gets one authoritative fixed log. Diagnostic harness failures use a distinct suffix and are not acceptance evidence. No batch may rewrite production source; a correct business failure is frozen before any new product contract is considered.

## N1 command

```sh
node docs/reviews/web-more-recovery-native/verify-native.mjs 7b216a3 controls-reset control-plane-20260917
```

N1 does not accept the complete caller and closes no 312 item. N2-N4, final Settings/Web/storage and accepted-caller regressions, and Astra reconciliation remain mandatory.

## N1 result

`controls-reset` passed at `7b216a3`; see `review-controls-reset-7b216a3.md`. N2-N4 remain pending.
