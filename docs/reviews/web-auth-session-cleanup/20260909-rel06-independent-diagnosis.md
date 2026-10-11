# REL-06 independent diagnosis: auth cleanup can erase a newer login

Date: 2026-09-09. Module: web. Source checkpoint: `45d066579ef3cd3a8de9409ea1c2af8f562a3cd7`; installed Supabase JS/Auth JS: **2.106.1**. Diagnosis only; no product source changes. Tasks fix `dd744f5` is a separate work item.

## Verdict and reproducibility

**FIX_READY; correctness FAIL.** `clearSessionStorage` is not the only remover that requires repair. The actual SDK's pending sign-out can also delete a newer login and PKCE challenge. A React revision or a compare followed by asynchronous remove cannot establish cross-tab ownership.

Run from repository root:

```sh
node docs/reviews/web-auth-session-cleanup/verify-native-cleanup-races.mjs
```

The checked-in `20260909-native-cleanup-before.log` records intentional exit 1 / `pass:false`. This is a reproduced defect, not a repaired behavior PASS. The runner bundles the actual provider, native auth storage adapter, React and installed SDK into an isolated Chrome profile with native IndexedDB, sessionStorage and Web Locks. All auth HTTP responses are synthetic through the SDK's public fetch option; no production credentials, account or profile is used. Loopback serves the fixture/results. The browser profile is removed afterward.

| Scenario | Correct business behavior | Observed behavior |
| --- | --- | --- |
| A provider cleanup pauses before main-key remove; actual SDK signs B in and creates a new PKCE verifier | Cleanup captured for A preserves B and its newer challenge | React remains B, but both persisted session and challenge are null |
| A main-key remove throws a storage error; fresh provider/client mounts against retained storage | Cleanup reports failure and a durable pending/revoked state prevents silent restoration | Cleanup resolves, UI says unauthenticated, fresh client/provider restores A |
| Actual SDK A `signOut({scope:'local'})` waits for `/logout`; actual password login B and OAuth challenge finish first | A completion cannot erase B or publish B's sign-out | SDK removes B and its challenge, publishes SIGNED_OUT, React becomes unauthenticated |

Scenario 1 explicitly injects asynchronous latency at the SupportedStorage remove entrypoint, then delegates bytes to native storage. It also holds the SDK's actual `lock:rel06-auth-session` Web Lock while SDK password and OAuth writers finish. This proves those writer paths do not share that lock; it does not claim the default IDB scheduler itself was paused. Scenario 3 uses no storage delay or failure: the only gate is the synthetic remote logout response. Scenario 2 is fresh SDK/provider remount, **not** full-page reload, browser kill or production server revocation. The probe is one browser document, not a true two-tab race test. A true multi-tab test remains an acceptance gate.

## Root causes and storage contract

`packages/web-auth-device-session/src/session.tsx:113` clears React first, then sequentially removes the configured main key and its `-code-verifier`, swallowing all errors. It captures no immutable owner, session generation, exact bytes or OAuth attempt. Its existing revision protects refresh result publication, not destructive persistence.

`storage.ts` puts the main session in IndexedDB and verifier in per-tab sessionStorage. Each IDB get/set/remove is a separate transaction; the database-operation promise is local to its JS context and does not make read/check/remove atomic across tabs. The native transient adapter's optional storage calls can silently do nothing if no storage is available. Arbitrary asynchronous injected stores offer no compare/delete guarantee.

Installed Auth JS `lib/types.ts` SupportedStorage exposes only get/set/remove, not CAS, revocation or multi-key transactions. In `GoTrueClient.ts`, `_saveSession` (4752) unconditionally removes the verifier before writing a session; `_removeSession` (4792) removes main, verifier and `-user`, then broadcasts SIGNED_OUT. `signOut` (3783) holds `_acquireLock` but waits for the remote request before unconditional removal. `signInWithPassword` (1087) does not acquire that lock. PKCE generation uses `getCodeChallengeAndMethod` (`lib/helpers.ts:304`) to write the shared verifier. A custom public SDK lock therefore cannot by itself serialize all writers.

The browser default uses navigator.locks when available; otherwise it can use a no-op lock. The SDK BroadcastChannel is named by storageKey and republishes received events to subscribers. Old-generation events can invalidate a new generation if both use the same channel and the provider trusts every event.

## Writer/remover inventory and ownership boundary

The following covers current Web call sites, their SDK persistence effects, and automatic paths. Search included all packages and apps/web TypeScript source, excluding tests and docs. Raw SupabaseClient is publicly exposed, so future direct callers must be constrained by the same protocol.

| Trigger / source | Writes or removes | Required captured boundary |
| --- | --- | --- |
| WebAuthPage login → `auth-actions.ts:101` signInWithPassword | SDK session save, preceding verifier remove, SIGNED_IN | New login generation; completion must not adopt a later global owner |
| WebAuthPage signup → `auth-actions.ts:94` signUp | PKCE challenge; session save when returned | Signup attempt generation |
| WebAuthPage OAuth → `auth-actions.ts:140` signInWithOAuth | SDK verifier; app `xai.web-auth.pkce` nextPath/createdAt | Unique attempt and generation for both records |
| Password reset → `auth-actions.ts:116` resetPasswordForEmail | PKCE verifier | Recovery attempt generation |
| Reset completion → `auth-actions.ts:123` updateUser | Updated user/session save | Captured session generation |
| Callback → `callback.ts:73` exchangeCodeForSession | SDK session/challenge consumption; app clearPkceState | Validated pending attempt, not current arbitrary challenge |
| Provider `session.tsx:96` getSession / initial refresh | SDK can recover/refresh/save or remove invalid session | Captured generation; stale refresh cannot recreate revoked session |
| Provider `session.tsx:113` clearSessionStorage | Main and verifier sequential remove | Atomic captured owner/generation cleanup intent |
| App.tsx:193–200 logout | SDK signOut, provider cleanup, unconditional redirect | One captured intent covering SDK, storage and navigation |
| `auth-actions.ts:266` deleteAccount default post-delete helper | Best-effort SDK signOut unless disabled | Captured owner/generation; settings currently disables this branch |
| Settings useAccountDeleteOrchestrator | Captured server token/account-data deletion, then provider cleanup if scope still current | Existing scope checks do not make subsequent auth deletion atomic |
| DeviceSessionBridge onFailureCleanup | Calls provider cleanup after device failure from registration/heartbeat/bound fetch | Device request's captured auth generation; active-effect flag is insufficient once cleanup starts |
| SDK initialization, `_recoverAndRefresh`, visibility recovery | Read, refresh/save, invalid-session removal | Bootstrap honors durable revocation and pending cleanup before hydration |
| SDK `_autoRefreshTokenTick` / `_callRefreshToken` | Refreshed session save, removal on terminal refresh error | Same generation; old in-flight responses cannot publish or persist into new generation |
| SDK onAuthStateChange / BroadcastChannel | Provider publishes session/null; remote events can trigger UI and dependent behavior | Validate immutable client generation and active pointer |
| Other tabs / clients using same storageKey | Shared IDB writes/removes and SDK event channel; each tab has its own verifier | Cross-tab atomic pointer/revocation, generation-specific SDK channels |

The app-owned `xai.web-auth.pkce` stores only nextPath and createdAt. `clearPkceState` removes it unconditionally (including OAuth failure/callback completion); it needs an attempt nonce too. Settings integration OAuth state is a separate account-scoped mechanism, not this Supabase challenge.

No currently configured separate SDK userStorage was found. The `-user` removal contract must nevertheless be accounted for before supporting that SDK option. Other raw SDK authentication entrypoints (OTP/SSO/token/session setters/MFA etc.) are not current Web UI flows; exposing them later requires participant integration, not an assumption that they share the SDK lock.

Official documentation confirms getSession reads attached storage and may refresh; it does not prove durable logout. See [getSession](https://supabase.com/docs/reference/javascript/auth-getsession). Auth event callbacks must remain synchronous: do not await a coordinated SDK auth call inside them, because that can deadlock existing SDK locking. See [onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) and [Supabase troubleshooting](https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0). Installed source, not later documentation features, is the version-specific lock evidence here.

## Public-API implementation strategy

Implement two bounded steps, then independent verification. Do not patch SDK private methods.

### 1. Atomic auth persistence participant

Introduce immutable auth **session generations**, distinct from business account generation and account ID. A new login by the same account still gets a new generation. A participant should capture owner/generation/attempt, atomically publish a candidate active generation, and revoke/delete a captured generation with structured `cleared`, `superseded` or `failed` results. Comparison, revocation metadata and IDB row deletion must occur in one readwrite transaction. Every writer must check the generation lease in its write transaction; old refresh responses must fail closed after revocation. A get/check/await/remove sequence is not CAS.

Persist a cleanup intent before destructive work and retain enough names-only phase information to resume. Readers/bootstrap must refuse revoked generations even when physical cleanup is incomplete. If the first durable intent write is rejected, report an unresolved cleanup failure; do not promise recovery across browser restart. That remains a REL-06 boundary, not a reason to silently succeed.

Native sessionStorage permits synchronous compare/delete by attempt nonce within one JS turn. Cross-backend IDB plus sessionStorage is not a single atomic transaction: use a phase receipt and idempotent captured-attempt cleanup. An arbitrary injected async storage needs an explicit equivalent atomic participant or an explicit unsupported/failure result. Preserve B, device identity and unrelated account data.

### 2. Generation-bound SDK and host/auth coordination

Use public `createClient` auth `storage` and `storageKey` options to create a generation-bound client/storage facade. The facade captures its generation immutably; never consult a mutable current-owner global when an old operation finally writes. Use distinct logical SDK storageKeys per generation so lock and BroadcastChannel names also separate generations. Old A SDK `_removeSession` then addresses A only, and its SIGNED_OUT event cannot log B out. Atomic active-pointer publication determines which successful candidate login becomes current.

All UI auth operations, callback/recovery attempts, device cleanup, account deletion and host logout use one project coordinator with explicit captured intent. Bind both SDK verifier and app nextPath state to the pending attempt; callback bootstrap resolves a validated receipt rather than trusting an arbitrary generation from a URL. Publish only after candidate authentication succeeds. On replacement, unsubscribe the old provider and call public stopAutoRefresh; atomic leases remain necessary because already-running SDK requests and broadcasts may finish later. Do not rely on an unavailable dispose API or private `_acquireLock`/`_removeSession` monkeypatches.

A project Web Lock with a **different name** from SDK locks can serialize pointer/lifecycle coordination across tabs without recursively deadlocking public SDK calls. It is not the sole integrity mechanism: IDB transaction checks must withstand writers that bypass the outer lock and environments without Web Locks. Coordinating only UI actions leaves automatic refresh, initialization and SDK removers uncovered. Exposing raw clients without the generation-bound facade likewise breaks the guarantee.

Before hydration, load the active generation and resume/deny pending cleanup. Plan one-time migration from legacy unscoped auth rows with exact-byte preservation and failure recovery. A settings account deletion receipt is not automatically an auth revocation receipt. Capture navigation ownership as well: a completed old App logout must not redirect a newly authenticated B.

## Independent acceptance gates (not yet executed)

1. Original three native probes satisfy their original business assertions; do not rewrite defect tests into characterization PASS.
2. Two real tabs race publish/revoke and refresh completion, including same account new login, SDK BroadcastChannel events, custom storageKey and Web Lock absence.
3. Login/signup/OAuth/reset/exchange/update, getSession, initial recovery, visibility and automatic refresh cannot persist or publish revoked generations.
4. Quota/denied/blocked storage, partial IDB/transient cleanup and initial receipt failure produce truthful retryable UI; full page reload and actual browser restart exercise durable recovery.
5. Old A logout/deletion/device failure cannot remove B/new PKCE or redirect B. UI auth events remain synchronous and deadlock-free.
6. Device identity, B bytes, unrelated business stores and attempt ownership remain intact; no tokens or verifier contents enter reports.

These gates are proposed work. Current evidence does not close REL-06 or the overall release checklist.
