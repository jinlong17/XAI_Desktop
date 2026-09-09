# REL-06 generation-bound SDK participant

Scope: Web auth persistence participant. This is **not yet wired to the session provider, auth pages, device cleanup or App sign-out**. The original production path remains open until those callers adopt the coordinator protocol and pass their original regressions.

## Implemented boundary

`createAuthGenerationClient` uses public `createClient` with an immutable lease and a generation-specific SDK `storageKey`. In the installed `@supabase/auth-js` 2.106.1 implementation this key also names BroadcastChannel and SDK Web Locks; separate generations cannot consume each other's SDK channel events. SDK storage calls map to stable logical `session`/`user` keys inside the generation row. Legacy import must use the exported `AUTH_GENERATION_SESSION_KEY` (`session`). Unknown SDK keys fail explicitly.

Session writes parse `user.id` without exposing credential bytes in errors and use `setSessionItem` to atomically enforce the generation's session owner. Candidate owner claims prevent a mismatched subsequent publish; published A cannot be rewritten to B even if a caller misuses A's client for a new password login. A new login requires a new candidate. Rejected writes, transaction abort and revoked leases reject the SDK promise rather than returning a false persistence success.

PKCE remains in sessionStorage, with never-reused generation-specific keys. A durable names-only participant marker controls reads; no verifier is stored in that marker. Old cleanup can remove only its own transient key. Missing/denied transient storage is an explicit failure. IDB and sessionStorage are not one transaction: a revoke interleaving after the permission check can leave old-generation transient bytes, but these are unreadable via the revoked lease and cannot address another generation. Coordinator cleanup must retain a truthful receipt until its captured transient cleanup succeeds.

The factory always enables persistence and disables automatic URL consumption. Callback dispatch and candidate publication belong to the coordinator; the existing config booleans cannot bypass these requirements. Auto-refresh follows config. Separate userStorage writes are unsupported, rather than allowing a second unvalidated identity writer.

## Verification

- `pnpm --filter @repo/web-auth-device-session test`: 16 files / **109 tests PASS**, including 26 generation-store tests and 8 SDK participant tests. Counts describe this run, not independent totals added together.
- `pnpm --filter @repo/web-auth-device-session check-types`: PASS. This package has no `typecheck` script; a prior attempt with that name ran no check and is not evidence.
- The eight participant tests exercise distinct SDK channel names, durable byte isolation, actual SDK delayed logout against a newly published B, revoked writes/PKCE visibility, transaction abort preservation, unavailable transient storage, actual SDK failed persistence without SIGNED_IN, same-generation A→B refusal, and malformed session preservation (some cases combine related assertions).
- Participant tests use actual installed Supabase SDK with synthetic HTTP, fake-indexeddb and jsdom. Their channel stub proves SDK key selection, not native inter-window delivery. Separate native probes in this directory use actual IDB/sessionStorage/BroadcastChannel and retain the owner-binding failure before the correction.

## Required next integration

1. Bootstrap only through `readActive` and guarded legacy import. Never fall back to shared legacy bytes after a names-only migration claim or revocation. Storage failure needs a retryable state, not an unauthenticated success.
2. Create a candidate before each login/signup/OAuth attempt. Keep the candidate identity and PKCE callback metadata in a generation-specific transient envelope; remount must recover the same candidate, not allocate a new one. Bind/publish only the authenticated session owner and compare the captured active generation.
3. Expose coordinator actions instead of reusing a mutable shared client. Suppress stale callbacks/events and navigation. Stop auto-refresh and unsubscribe replaced clients using public APIs. Merely rejecting their storage writes does not stop already-started network calls.
4. App sign-out, device failure and account deletion must capture the generation/owner before awaiting any remote work. Revoke only the captured generation; do not run shared cleanup or navigate away from a newly published B. Local revoke failure must stay visible/retryable. Remote revocation and local cleanup are distinct outcomes.
5. Reconcile active-pointer changes across tabs from durable state; generation-isolated SDK broadcasts alone deliberately do not publish a newly selected generation to other tabs. Cover startup, visibility, auth callbacks and restart with actual native probes.

No hosted credentials, service-role keys, remote mutations or deployments were used. Reference review: [initializing](https://supabase.com/docs/reference/javascript/initializing), [signOut](https://supabase.com/docs/reference/javascript/auth-signout), and the [changelog index](https://supabase.com/changelog.md), checked 2026-09-09. The current index's TypeScript minimum notice is already satisfied by 5.9.2; self-hosted SAML URL changes do not change this local browser participant. Installed source and exercised behavior determine this version's contract.
