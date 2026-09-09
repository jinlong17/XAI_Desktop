# REL-06 step 3: framework-independent auth coordinator

This commit introduces the complete coordination surface in `auth-generation-coordinator.ts`. It does not change React, auth pages, device bridge or App routing; their integration and acceptance are separate parent-owned work. The implementation uses public SDK methods, actual generation store transactions and generation-specific SDK clients. No SDK private patch is used.

## Caller ABI

`createAuthGenerationCoordinator({config,store?,transientStorage?,fetch?,legacy?,now?,createGeneration?})` returns:

| Method | Contract |
| --- | --- |
| `getSnapshot()` / `subscribe(listener)` | Stable snapshot until notification; status loading/authenticated/unauthenticated/error/unconfigured, current session/generation/owner/client, stable error reason, increasing revision. Raw client is for read-only consumers; auth actions belong to the coordinator. |
| `bootstrap()` | Read durable active generation first; default legacy reader is `createIndexedDbStore().getItem(config.storageKey ?? 'xai-web-auth')`. Legacy session bytes are owner-validated and imported through atomic guarded import, never through a fallback SDK storage reader. |
| `reconcile()` | Explicit durable-state retry; restores the current authenticated owner or unauthenticated state. Internal SDK/channel/visibility events use automatic reconciliation, which cannot clear unresolved errors for the same generation or a null pointer. |
| `capture()` | Immutable `{generation,owner}` for later update/logout/device/account-deletion operations. |
| `signInWithPassword({email,password,nextPath?})` | Fresh candidate per invocation, SDK persistence, owner-bound atomic publication and predecessor revocation. |
| `signUp({email,password,redirectTo,nextPath?})` | Fresh candidate; returns pending when confirmation is required or publishes a returned valid session. |
| `startOAuth({provider,redirectTo,nextPath?})` | Fresh generation and envelope; returns the SDK URL without performing navigation. |
| `requestPasswordReset({email,redirectTo,nextPath?})` | Fresh recovery generation and pending envelope. |
| `readPendingAttempt()` | Returns validated envelope or null; malformed/expired/denied metadata throws a stable coordinator error. A deliberate new auth attempt can replace an expired existing attempt safely. |
| `completeCallback({generation,code})` | Validates the same pending envelope, durable attempt marker and captured active expectation. Exchanges through that generation's SDK, then publishes its actual owner. |
| `updatePassword(capture,password)` | Requires authenticated status and checks captured generation against snapshot/durable pointer before calling SDK, then checks again before reporting/adopting completion. An error-latched snapshot cannot authorize this mutation; sign-out cleanup has a separate explicit retry contract. |
| `signOut(capture,{remote?,scope?})` | Separate remote/local/transient results; never navigates. Scope defaults to **global**, preserving prior App behavior; explicit local is supported, others is intentionally excluded. Device/account cleanup can use remote:false. Stale captured operations skip remote calls and only clean their own local generation. |
| `dispose()` | Invalidates pending publications, unsubscribes selected SDK events, stops auto-refresh through public API, closes the coordinator channel and detaches visibility listeners. It does not cancel a remote request already issued. |

Action results are applied/pending/superseded/failed with stable reason and optional generation/nextPath/URL. Sign-out additionally reports remote as succeeded/failed/indeterminate/not-requested; local is the actual generation mutation result; transient reports envelope, verifier and pending-index cleanup independently. If post-commit observation fails, the already-known local mutation result remains intact. Consumers must not turn superseded or failed into unconditional navigation.

## Persistence, replacement and recovery

Each new attempt stores a names-only generation-specific envelope in sessionStorage, plus a namespace pending index containing only its generation. The redirect URL receives `xai_auth_attempt`; the callback must supply that generation. No old `xai.web-auth.pkce` shared metadata key is used. Index cleanup compares its current value before removing it, so A cleanup cannot erase a newer B attempt. A durable attempt marker/context contains no code, verifier or password and binds crash recovery to the original generation. Envelope lifetime is a local 24-hour policy; expired attempts fail clearly and can be replaced by a new login.

Publication uses `publishAndRevokePredecessor`: candidate publication, pointer CAS and prior generation revocation happen in one native IDB transaction. Failure preserves both generations and pointer. A revoked predecessor is a durable names-only receipt for separately retriable transient cleanup. Physical cleanup failure keeps the new session bytes and reports failure; it does not claim IDB and sessionStorage are one transaction. Revoked rows are reprocessed during bootstrap, so a failed captured transient removal can be retried after restart.

Default migration preserves legacy bytes exactly. A validated migration claim matching that generation/owner's revocation proves retained legacy bytes must remain inert: normal logout/restart returns unauthenticated, not a perpetual migration error. An unknown claim, corrupt schema, failed read or unproven recovery remains an explicit error. Concurrent migration losers reconcile a valid winning active generation rather than replaying legacy bytes. Ordinary foundation `publish` semantics remain unchanged; the coordinator opts into atomic predecessor revocation.

## Async events and errors

New actions and errors invalidate in-flight reconciliation. An error latch prevents delayed same-generation INITIAL_SESSION/refresh events from hiding an unresolved storage/cleanup error and reopening business handles. Explicit bootstrap/reconcile can retry; an independently validated new non-null durable generation can also recover the snapshot. Async adoption rechecks its local operation/reconciliation epoch after its durable read, so a previous completion cannot overwrite a newer local snapshot.

The coordinator's names-only BroadcastChannel announces changes; receivers read IDB rather than trust event payload identity. Channel construction, subscription, posting and closing are best-effort. Channel failures cannot turn an already committed publish/revoke into a fabricated persistence failure; manual/visibility reconciliation remains available. This does not alter SDK-internal channel behavior. Subscribers are isolated so one consumer throwing cannot undo persistence or block other subscribers.

Old client subscriptions/refresh are stopped, and known-stale update/logout actions are rejected before new remote work. A remote call already started cannot be undone. Global logout can revoke other sessions of the same account, including a newer generation's server session; local generation isolation does not override server scope semantics. Remote failure/indeterminate outcomes are distinct from successful local revocation and do not establish a durable remote retry queue.

## Callback reentry and crash boundary

Concurrent same-attempt/same-code callback calls share one promise while in flight. Completed promises are not replayed blindly: after B replaces A, an old A callback returns superseded and cannot navigate using an old applied result. Different codes cannot concurrently redeem one attempt. A failed result can be explicitly retried. If the SDK committed a valid candidate session before effect disposal or remount, the fresh coordinator validates the original envelope/marker and finishes owner-bound publication **without redeeming the consumed code again**. If publication already completed, the durable attempt context and active owner permit idempotent reconciliation without another exchange.

If the server consumed the code but the SDK could not durably save the session, this code cannot invent the missing session. The installed SDK also removes its transient verifier before session persistence, so a subsequent retry may fail locally without even sending a second exchange. The result remains an explicit error; the user needs a fresh authentication attempt. This boundary is different from the covered reload-before-exchange scenario.

## Evidence and limits

The focused tests use actual SDK code, synthetic HTTP, jsdom and fake-indexeddb. They cover legacy import/logout recovery, fresh attempts, delayed login/logout, stale action rejection, all current auth entrypoints, pending-envelope remount, cleanup failure/retry, broadcast faults, global/local scope, StrictMode-like duplicate callback, saved-session-before-publish recovery and irrecoverable consumed-code persistence failure. Error-latch tests retain errors across delayed reconciliation and allow explicit retry/new-generation recovery. Parent-authored managed-session regression waits after the injected failure and verifies the production context does not silently return to authenticated.

The native runner uses **two real Chrome pages**, native IDB/sessionStorage/BroadcastChannel and the installed SDK with synthetic auth HTTP. It verifies cross-page bootstrap and B publication, delayed A logout preserving B, stale action rejected before network, actual full-page reload preserving the OAuth generation, and migrated legacy surviving replacements followed by logout/reload without resurrection. Its log is separate from unit totals. It does not exercise complete production React/App routing or browser process termination.

No real account or production network was used. REL-06 remains open for parent caller integration and author-independent end-to-end acceptance. The local first-write failure boundary, physically retained transient bytes while storage is denied, and server-side global logout effects must not be described as fully solved by these tests.

Final focused run: **4 files / 62 tests PASS** (foundation 29, adapter 8, coordinator 23, parent managed-session 2); package typecheck PASS. Native coordinator final run: **6 checks PASS**. Counts overlap with preceding layer runs and must not be added. A preceding native run timed out on a peer RPC; the harness now waits for an explicit peer-ready message instead of assuming readiness after 250ms. The pre-handshake timeout is retained separately and is not counted as passing evidence.
