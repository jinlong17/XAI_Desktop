# Independent DeviceSessionBridge regression evidence

Owner: independent reviewer `/root/rel02_auth_fix`. Product repair by parent; this directory contains no product changes.

## Baselines and scope

Before: Git `4001170ca823d177a3e26150f2fa9b899cc11a02`, original DeviceSessionBridge extracted from Git. Relative imports alone were relocated for execution. The first attempted working-tree snapshot already contained the concurrent repair and was discarded before these final logs.

After: parent working-tree DeviceSessionBridge SHA-256 `e1d95ddba38a7a53aa73d7b08265777c861b762bb2b6795c605a1da47f795a5d`. A fixed implementation commit and browser-level auth flow acceptance remain separate gates.

Real React/jsdom component with real device-fetch header logic; auth hook and device-controller boundary are mocked to control owner and deferred context. Fetch is a spy; no real account, credential, or network is involved. This is not native browser or full-host acceptance.

## Correct business assertions

1. Error/locked auth removes context capability immediately.
2. An already captured A fetch rejects after logout/error without sending network credentials.
3. Late A buildContext cannot replace ready B or invoke onReady after supersession.
4. Switching to B synchronously while A awaits getContext prevents A network dispatch.
5. Same token with a new captured cleanup/generation invalidates the old fetch.

Before: 5/5 FAIL (exit 1). After: identical five assertions, 5/5 PASS (exit 0). The only test-source difference is the imported implementation. Failure logs preserve the stale Authorization and successful obsolete request evidence.

## Run

```sh
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-auth-session-cleanup/independent-device-bridge/verify.config.mjs
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-auth-session-cleanup/independent-device-bridge/verify-after.config.mjs
```

Before intentionally fails. Do not include the frozen reproduction in aggregate green suite totals.
