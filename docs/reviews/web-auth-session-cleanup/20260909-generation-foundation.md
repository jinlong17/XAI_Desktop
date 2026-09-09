# REL-06 step 1: atomic auth generation persistence foundation

Module: web. **Dormant foundation, not an integrated REL-06 fix.** Existing session provider, SDK client factory, auth UI and host logout remain on their existing storage path. The original three defect probes remain regression requirements for the next step; their results are not superseded by these lower-level checks.

## Public contract

Exported by `@repo/web-auth-device-session`:

- `createAuthGenerationStore({storageKey?, dbName?, storeName?})` uses the existing native IDB connection/schema manager. Default database/store are `xai-web-auth` / `session`; existing `device` is untouched. Each base SDK storageKey gets a distinct reserved prefix and active pointer.
- Immutable `AuthGenerationLease = {generation}` identifies a login lifetime, distinct from account-data generation. The coordinator should generate an unpredictable unique ID (e.g. crypto.randomUUID). `createCandidate(lease)` creates an owner:null candidate and rejects every previously existing ID, including revoked tombstones. Methods copy incoming lease fields before any await.
- `publish({lease,owner,expectedActive})` checks the active generation CAS, binds owner once, and updates candidate+pointer in one readwrite transaction. A published generation cannot be republished or change owner. Same-account new login still uses a new generation.
- `readActive()` returns `{generation,owner}` or null. `getItem(lease,key)` returns bytes/null for a valid candidate/current active generation; missing, revoked or replaced leases return null. Physical read failures reject with `AuthGenerationStorageError`, never a false unauthenticated null.
- `setItem(lease,key,value)` and `removeItem(lease,key)` check the lease and mutate inside the same IDB transaction. Old published A writes are rejected as soon as B is published, even before explicit A cleanup. Unpublished candidates may write; they still need CAS publication.
- `revoke({generation,owner})` requires the captured bound owner, removes that generation's entries and persists its tombstone atomically. It clears the active pointer only if it still names that generation/owner. Repeated owner-matching revocation is idempotent. `cancelCandidate(lease)` only handles unpublished owner:null candidates.
- `readRecovery()` returns names-only `{generation,owner,state:'revoked'}` records. No session/token/value bytes are returned. Tombstones are retained to prevent ID reuse. This is evidence of durable local revocation, not evidence that remote or transient cleanup completed.
- `importLegacy({lease,owner,expectedActive,legacyKey,expectedRaw,destinationKey})` compares the legacy row's exact bytes, copies them into the candidate, claims migration and publishes in one transaction. It leaves the original legacy row byte-for-byte intact. A names-only migration claim survives revocation and rejects repeat imports (`legacy-already-imported`), preventing retained legacy bytes from resurrecting a logged-out generation through this API. The coordinator must parse/validate the legacy session's owner before calling this method. This generic foundation does not interpret or authenticate session JSON.

Mutation results are `{status:'applied'}`, `{status:'superseded',reason}` or `{status:'failed',reason}`. Reasons are stable typed literals without raw data. Applied is returned only after transaction completion. IDB abort/open/storage failures yield failed, not best-effort success. A public SDK SupportedStorage adapter **must translate every non-applied write/removal into a failure**; ignoring these results reintroduces the original defect. No SDK private method is patched. Persisted pointer/version, generation, owner/state and entry shapes are validated before use; unknown or corrupt metadata returns/rejects `schema-invalid` and aborts without rewriting the original row. Migration claims are versioned and validated too.

## Native atomicity and limits

Generation entries and metadata share one object-store transaction. Request continuations schedule only synchronous IDB operations; no network, React work or arbitrary asynchronous callback runs between checking and mutation. Local connection serialization is not the cross-context integrity mechanism: native readwrite transaction ordering is. Concurrent publishers comparing against A produce one winner. Revocation racing a writer ends with a tombstone and no readable session regardless of ordering.

A failed transaction preserves the prior pointer, rows and values. If the initial durable revocation transaction cannot commit, there is **no durable cleanup guarantee**: report failure and keep this release condition open. This foundation does not manufacture a pending receipt when all writes are denied. Recovery metadata does not mean remote logout completed.

Transient PKCE and app nextPath state are intentionally absent here. The next coordinator must give SDK instances generation-specific storageKey/channel names, bind transient attempts, verify session.user.id on lease writes, validate bootstrap/migration, guard stale events/navigation, and coordinate public SDK operations. Use native synchronous captured-attempt checks for sessionStorage or an explicitly atomic custom adapter; do not assume IDB plus sessionStorage forms one transaction. Retained legacy bytes remain available to old unscoped readers until integration disables that path; preserving bytes is not a completed logout migration. Cross-namespace migration is not globally de-duplicated, and each configured namespace must have its own deliberate migration policy.

Revoked tombstones/migration claims currently remain indefinitely; safe compaction needs a separate protocol proving an ID can never be reused. Candidate garbage collection is likewise future coordinator work. This foundation does not claim encryption, cross-device sync, server revocation, general SupportedStorage atomicity or complete browser restart recovery.

## Verification

Commands:

```sh
pnpm --filter @repo/web-auth-device-session test
pnpm --filter @repo/web-auth-device-session check-types
node docs/reviews/web-auth-session-cleanup/verify-native-generation-participant.mjs
```

Results: final focused storage boundary **3 files / 31 tests PASS** (18 generation + 11 native-adapter simulation + 2 existing storage contract), package typecheck PASS, native Chrome six checks PASS. The earlier full package run was 15 files / 86 tests PASS before the additional seven corruption cases; these totals overlap and are not additive.

Focused tests cover candidate lifetime, concurrent publication, late writes/revocation, owner mismatch, cancellation, native-like transaction aborts, copy/publish rollback, exact-byte migration and replay refusal, device preservation, caller argument capture, custom namespaces and denied storage.

`20260909-native-generation-participant.log` records six real Chrome checks. The fixture uses two independent JavaScript contexts and native IDB connections in one isolated browser tab; it proves native cross-context transaction behavior, **not a full two-tab SDK/React lifecycle**. Native IDB put-triggered transaction abort verifies rollback. No production service or user browser profile is used. Generation-bound SDK integration, actual two tabs and browser restart remain next-step independent gates.
