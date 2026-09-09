# REL-06 generation client: native SDK review and before/after evidence

Module: web. Evaluator did not author `auth-generation-client.ts`; evaluator authored the foundation and, after detecting the owner defect, implemented its atomic owner-claim repair. Therefore this is independent adapter defect discovery plus a post-repair regression run, **not an author-independent acceptance of the entire owner chain**.

## Finding and result

Initial adapter code isolated generations but allowed an actual SDK password login P through an already-published O client. The active metadata still said owner O while persisted session.user.id became P. `20260909-native-generation-client-before.log` records `pass:false`, exit 1 and this exact inconsistency. The probe's original business assertions were retained.

The subsequent foundation `setSessionItem` atomically binds sessionOwner/sessionKey and rejects owner mismatch; the parent adapter parses actual SDK session JSON and uses that entrypoint. `20260909-native-generation-client-after.log` records `pass:true`: the same O→P attempt rejects `owner-mismatch`, leaving both pointer and persisted user O.

| Actual native scenario | Result after repair |
| --- | --- |
| A SDK signOut waits at synthetic logout response; B SDK password login and OAuth PKCE complete and publish; A response finishes | B session and newly generated verifier remain identical; A returns active-changed |
| Native BroadcastChannel posts old-generation SIGNED_OUT using A SDK's channel name | B SDK subscriber receives no SIGNED_OUT |
| Actual SDK save hits native IDB transaction abort | Caller receives transaction-failed; prior committed session bytes remain |
| Actual SDK A refresh waits at synthetic refresh response; S publishes before the response returns | Old refresh returns active-changed; S bytes and owner remain |
| Actual SDK P login misuses bound O client | owner-mismatch; O bytes preserved |
| Superseded old A client explicitly signs in Q | Synthetic network request still occurs, then local persistence rejects active-changed |

The BroadcastChannel check uses an actual native channel message under the SDK's generation-specific channel name; it is not an SDK-generated SIGNED_OUT on that path, because superseded signOut already fails at persistence before its broadcast. Before repair, the first four preservation checks also passed; only the owner assertion failed. Distinct SDK storageKey names isolate both channel names and SDK Web Lock names, rather than merely remapping persisted keys.

## Reproduction and boundaries

```sh
node docs/reviews/web-auth-session-cleanup/verify-native-generation-client.mjs
```

The script bundles actual installed Supabase/Auth JS 2.106.1 and current adapter/foundation into isolated real Chrome with native IndexedDB, sessionStorage, Web Locks and BroadcastChannel. Auth HTTP uses the public SDK fetch override with synthetic responses. No production account/network, real browser profile, SDK private monkeypatch, or user credentials are involved. IDB failure injection uses the native public object-store put method to abort the transaction. Both logs remain committed; before is a defect observation, not a PASS.

This is one browser page with multiple actual SDK clients. It does not verify the production provider, host redirects, device bridge, full two-tab coordinator, page reload or browser process restart. The original `native-cleanup-races.ts` targets the still-unintegrated production provider and remains a separate release regression requirement.

Generation isolation prevents cross-generation writes; it does not prevent old clients from sending remote requests. Public caller coordination must reject stale operations before starting them, detach old listeners and use public stopAutoRefresh, while transaction leases reject in-flight writes that finish later. Do not equate local cleanup with remote token revocation.

PKCE permission markers contain no verifier bytes and native transient keys are generation-specific. There remains an asynchronous gap between checking/setting a durable marker and accessing sessionStorage: a concurrent revocation can allow one already-started old-generation read/write to finish. It cannot address B's key, but physical A transient cleanup and stale callback suppression remain coordinator responsibilities. Unavailable transient storage must continue failing explicitly. This probe verifies B challenge preservation; it does not establish a general cross-backend atomic transaction or multiple simultaneous OAuth attempts in the same generation. Each new login/recovery attempt requires its own generation.

The adapter currently uses default session-embedded user storage. A future separate SDK userStorage or new auth flow must receive its own owner-aware contract; current session validation must not be assumed to cover unrelated user rows. Retained legacy rows and candidate lifecycle also need bootstrap/migration policy. **REL-06 remains open until coordinator/host integration and independent lifecycle acceptance.**
