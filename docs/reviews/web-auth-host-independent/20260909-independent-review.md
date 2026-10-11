# REL06 React/provider/host independent verification

Date: 2026-09-09. Product module: web. Reviewed parent integration `cfc2d6d`, then parent fix `10a90ce`. This verifier did not author these integration changes. The same verifier authored the underlying generation foundation/client probes/coordinator, so this report does **not** claim independent authorship separation for those layers.

## Verdict

The scoped host integration native functional verification passes after `10a90ce`. The original failure is retained in `20260909-native-host-before.log`. This does not close all REL06, approve production deployment, or claim real Supabase service acceptance.

## Reproduction

Run from repository root:

```sh
node docs/reviews/web-auth-host-independent/verify-native-host.mjs
```

The runner bundles actual `AppProviders`, actual router, `WebAuthSessionProvider`, `WebAuthPage`, route gates, `DeviceSessionBridge`, and the actual `App`/account onboarding/shell. A read-only context observer records state. Real form controls/buttons trigger product actions. It runs development React StrictMode, native IndexedDB/sessionStorage/BroadcastChannel, actual installed Supabase SDK, and an isolated native Chrome profile. Auth HTTP results are synthetic; external fetch destinations are blocked. OAuth authorize uses a loopback HTTP redirect to the actual callback route.

The runner terminates the entire Chrome process, waits for exit, and starts a new process with the same temporary profile and same origin. The log records distinct process IDs. Finally the test-owned process/profile/server are removed. No real user profile/account or production endpoints are used.

## Original independently discovered defect

Injected native `IDBObjectStore.put` transaction abort during A logout. Actual host logout enters provider `error`; outer `ProtectedAppRouteElement` unmounts `App`. The App-local logout failure banner therefore disappears, leaving only generic session-restoration text. Original exact failure: `host failure alert absent UI=Unable to restore this session...`.

Parent fix `10a90ce` carries the failure marker in the provider above the outer route gate and renders an explicit logout failure in that gate. The unchanged business assertion requires `Sign-out did not complete.`; generic restoration text alone is never accepted. The recovery action uses the gate's existing `Retry session recovery` button. The final probe accumulates this original assertion failure and returns `pass:false` even if other independent scenarios pass.

## Native business checks

| Scenario | Oracle | Result after fix |
|---|---|---|
| Actual email/password form | Full navigation restores owner A and actual shell | PASS |
| Logout native IDB transaction abort | Delayed explicit failure notice, private shell absent, context client/session null | PASS |
| Explicit recovery | Actual recovery button restores durable A | PASS |
| Whole Chrome close/reopen | Different process, same profile, authenticated A and shell | PASS |
| Successful actual shell logout | Authenticated state cleared and actual auth form reached | PASS |
| OAuth | Real button → authorize HTTP redirect → actual callback → app; exactly one PKCE exchange under StrictMode | PASS |
| Password reset | Actual Reset/Send reset → SDK redirect → actual verify callback → Set password; exactly one owner-bound PUT | PASS |
| Two real pages, stale A response | Hold SlowA form HTTP; B form publishes in another page; main observes B; observe A HTTP return and a further 400 ms dispatch window; main remains B without auth error | PASS |

The synthetic server records method/path counts, not credentials. The probe does not drive auth by calling coordinator methods. Native failures retain original stored state; all destructive operations are confined to the temporary fixture profile.

## Limits and remaining work

- This is functional host verification. CSS is omitted by the diagnostic bundle; visual/responsive/a11y acceptance is separate.
- The diagnostic mounts the actual providers/router/host but omits `main.tsx` observability and service-worker bootstrap. It is not a production Vite/PWA/deployment acceptance test.
- DeviceSessionBridge mounts and makes actual synthetic register/heartbeat requests. This probe does not separately inject a stale device RPC callback; the parent reports dedicated bridge tests, not independently rerun here.
- Remote global sign-out is an irreversible server action once dispatched. Generation isolation protects local newer state, not remote same-owner sessions. The host currently handles `status` and does not separately display unsuccessful/indeterminate remote outcome when local revocation succeeds. This remains a documented product/remote acceptance boundary.
- Callback server consumption followed by failure before durable SDK session save cannot fabricate recovery. Other deletion-receipt/storage-failure gaps from REL06 remain outside this scoped verdict.
- No claims about real OAuth providers, email delivery, production Supabase policies or cross-vendor review are made.
