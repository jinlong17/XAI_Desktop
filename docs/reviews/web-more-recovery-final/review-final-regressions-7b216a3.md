# More final regression receipt

Product fixed at `7b216a3d5a4947d0f66da042fb275302737fb762`. This is the parent/Sol final-regression gate required by the More contract. It is not Astra's final acceptance and closes no 312 item.

## Verdict

**PASS.** Every required regression and static gate completed with exit 0 from an immutable `git archive` of the fixed product.

| Gate | Fresh result |
| --- | --- |
| Settings-rest package | 43 files / 300 tests PASS |
| Settings-rest typecheck / lint | PASS / PASS |
| Web package | 27 files / 146 tests PASS |
| Web check-types / lint | PASS / PASS |
| Storage check-types | PASS |
| Notifications Sol complete caller | 41/41 PASS: product11 + independent30 |
| Notifications Astra high-risk boundaries | 24/24 PASS |
| Notifications Astra actual host | 15/15 PASS |
| Notifications parent original actual host | 12/12 PASS |
| DateTime accepted caller | 7/7 PASS |

No correct product failure was observed, so no repair task/window was created and no product source was edited in this controller task.

## Fixed-boundary proof

`git diff --name-only afbfb24..7b216a3 -- apps packages package.json pnpm-lock.yaml` contains only:

- `packages/plugin-web-settings-rest/src/__tests__/morePane.test.tsx`
- `packages/plugin-web-settings-rest/src/panes/morePane.tsx`
- `packages/plugin-web-settings-rest/src/styles.css`

The same diff limited to shared storage, Notifications, DateTime, Settings host/coordinator, `package.json`, and `pnpm-lock.yaml` is empty. The stylesheet delta is More-scoped and the accepted callers were nevertheless rerun. `7b216a3..a9921b9` contains no production-code delta; its only `apps`/`packages` changes are unrelated Calendar and Meditation test setup files. All results below use the immutable `7b216a3` archive rather than the current checkout.

## Reproduction

```sh
node docs/reviews/web-notifications-recovery-sol/verify-fixed.mjs 7b216a3 '' more-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs 7b216a3 boundaries more-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs 7b216a3 host more-final-v1
node docs/reviews/web-notifications-recovery-independent/verify-fixed.mjs 7b216a3 host more-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs 7b216a3 datetime more-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs 7b216a3 package more-final-v1
node docs/reviews/web-more-recovery-final/verify-final.mjs 7b216a3 final-v1
```

## Evidence hashes

Notifications Sol 41:

- `core-more-final-v1-7b216a3.log` — `19729a6fa4594819abee867056e565b7c66ab695d8e18b525a1062e06829cbbc`
- `recovery-more-final-v1-7b216a3.log` — `d3dac8fe1e7668f025f20c5c42210090c66efc56a22d5a9718c8f034ef39f317`
- `operations-more-final-v1-7b216a3.log` — `4028ad3157a9839635c54d420689b2a687556e862aa2f7cd70701b5568029d98`
- `boundaries-more-final-v1-7b216a3.log` — `1418b7bc0d25dbe712553c385ac58f4a070388452ff5337a3607145449038163`
- `extended-more-final-v1-7b216a3.log` — `1c5781dbdfc10a7b7a8ac215fb70218ee1299bd1886049e27bbd96439e6ad8f0`
- `original-more-final-v1-7b216a3.log` — `6a8ff60091109f499162441dd1c98fe79687c4f87d2b78799cfecc096c25b8af`

Notifications Astra/parent and DateTime:

- Astra boundaries — `5d5344c3e56bd92d87978c06213f5fc1a94c2730e3caf9af92da1aebdc1e6e61`
- Astra host — `07e5a0341b4509f28acc63890181e25ead0a0fd66ce167ef497699e9e9f6b39c`
- parent original host — `0d8739e7601dc96b8d79eddb337b6d4c2869a5648f084fecd977aa30a0f0ae7a`
- DateTime caller — `24167569691d890f6edd4114030e14610b6d8be5bcf2a99ca7cb9c1faaa65ece`

Package and static gates:

- Settings-rest package — `f56123a70b7a8d0fe955681ff3145985869675356330b039b5d0c6b97dfa334a`
- Settings-rest typecheck — `9863a7e910ef6138e8c0fc790ec8fba0e6fbf8a37988905711f40815a1fb91d7`
- Settings-rest lint — `ad43fe2d306f8ce3e84d9a5f5f28dcebf0dd0462716643912c66e19ac7738cb2`
- Web check-types — `b3b315c2603b52d0f5192b64e877841e0a82fd8e8766b251fbb9e392701ea1c2`
- Web tests — `59788cf9429fad97c946730a0b09b05fc210cd1d191cddf47e7e997cf1091d23`
- Web lint — `52b4ddee3534c6bf160662aa760a45627da5def2be0501e05db82db29c49103e`
- Storage check-types — `a8eb8227b2972582e34a97398e77ed6f8927b6d290d8fd0b3733b0af1a00ca5b`

## Remaining boundary

More remains `verification_pending` until an independent Astra review reconciles every row of `next-more-contract.md` against the fixed source, correct baseline failures, Sol/parent matrices, native evidence, and these fresh regressions. Even a future caller acceptance does not establish SET-09 business completion, full D2/REL/AI, deployment, release, Tasks default consumption, template CRUD, or native launch/tray/window behavior.
