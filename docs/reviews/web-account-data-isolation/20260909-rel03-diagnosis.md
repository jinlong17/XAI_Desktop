# REL-03 — Web local account data and BYOK isolation

## Scope and acceptance

Module: **web**. Target: **web-account-data-isolation**. Source: audit TODO REL-03: A signs out, B cannot read A's content/key; unowned legacy data has an explicit migration choice and rollback. This is local account isolation, not account cloud sync; no `/sync/*` protocol, RLS or server schema changes are proposed. Auth provider still owns session identity. Source snapshot is the current shared worktree after REL-02 repair; unrelated time-contract edits are not part of this diagnosis.

Severity P1. Status FIX_READY. No product fix or commit in this diagnosis round.

## Reproduction and root cause

Run `node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-account-data-isolation/rel03-reproduction.config.mjs` from repository root. **2 characterization tests PASS, confirming the defects**:

1. Store synthetic A session and conversation with actual adapters, remove auth key (matching current local sign-out semantics), store B session, read the same conversation adapter: A content remains readable.
2. Save synthetic A BYOK using real WebCrypto plus fake-indexeddb, remove A auth, store B auth, call actual `aiKeyStorage.loadKey`: returns A's synthetic key.

These prove the local adapter boundary, not a live Supabase two-account browser flow. No real credentials, production data or network calls are involved.

Evidence chain:

- `apps/web/src/App.tsx:187` sign-out clears auth then redirects; no account boundary for business repositories.
- `packages/web-auth-device-session/src/session.tsx:102` removes auth material and updates session state. Auth callbacks change React state, not storage ownership.
- `packages/plugin-web-storage/src/internal/storage.ts:115,176` read/write literal origin-wide key names. Same-tab listener map keys also have no account identifier.
- `packages/plugin-web-storage/src/internal/usePref.ts:103,113,147` bypasses getPref for presence checks and accepts storage events without account scope. `usePrefAutosave.ts:69,76` similarly bypasses the central imperative adapter. Prefixing only getPref/setPref would leave inconsistent reads and leaks.
- TimeTracker, Bookkeeping and Metrics have independent localStorage repositories (see inventory), including direct component accesses and custom events. Search, dashboard and statistics read those sources too.
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts:55` uses DB `xai-web-ai-secrets`, store `secrets`, and provider-only keys. Decryption derives from device UUID, which ordinarily survives sign-out. At-rest encryption does not implement account ownership.
- `secretStore.ts:182,204` deletes corrupt/undecryptable rows while reading: incompatible with preservation of legacy records during migration.
- `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts:96` clears registry entries plus fixed whole databases; after namespacing this must target the deleting account only. `morePane.tsx:55` bypasses removePref. Reset/export/import are part of the same scope audit.

Root cause categories: missing ownership contract; incomplete storage abstraction; asynchronous lifecycle races; mock-versus-real integration coverage gap. Dual-perspective escalation applies because storage, auth, AI and feature repositories share the same boundary.

## Complete key ownership surface

[storage-inventory.md](storage-inventory.md) and [storage-inventory.json](storage-inventory.json) enumerate **114 concrete localStorage keys (85 registered + 29 extra)** with key owner, proposed account/device scope and evidence. 38 require account-local namespaces; 76 are proposed device-local allowlisted controls. This is a classification proposal; runtime currently has no such enforcement.

Additional non-localStorage surfaces:

| Surface | Current ownership | Required handling |
|---|---|---|
| `xai-web-auth/session`, configured auth storage key (default `xai-web-auth`) | auth runtime | Keep provider-controlled session persistence; never put tokens into migration export. Account scope uses stable `session.user.id`, not email, user_metadata, device ID or access token. |
| `xai-web-auth/device`, `device.id` | device | Preserve ordinary sign-out; avoid rotating UUID while old encrypted BYOK still depends on it. |
| `xai-web-ai-secrets/secrets`, one key per supported provider | origin/device, currently unowned | New account/provider/generation composite keys. Legacy provider-only rows quarantined; explicit separate secret import. |
| `web-encrypted-cache-<namespace>-<accountId>` with entity_blobs/entity_index/entity_sort_keys/pending_mutations/dead_letter_mutations/sync_state | core-data already account-specific by default (`indexeddb-sync-blob.ts:370`) | Preserve; do not reclassify as unscoped or alter protocol. Check overrides and consumers do not reuse handles across accounts. Deletion needs scoped DB inventory, not fixed base-name assumptions (REL-04 interface). |
| Auth PKCE/sessionStorage transient keys | login attempt/tab | Keep auth contract; expire/cancel old attempts on switch. Do not migrate to durable business namespace. |
| `xai_oauth_pending_<providerId>` sessionStorage | current integration attempt only | Bind pending attempt to initiating account and epoch; old callback must not attach an integration to B. Clear/cancel on switch. |
| `__XAI_WEB_TODO_SESSION__`, `__XAI_WEB_TODO_CRYPTO__` in-memory bridge | mounted auth session | Clear synchronously on transition; asynchronous nonce result already has active guard, but keyed remount and identity comparison need regression tests. No new cloud-sync work. |
| Open-ended `xai_pref_*`, unknown custom keys | unknown | Quarantine unknown legacy records; require explicit owner/scope registration before runtime use or import. Never share by prefix alone. |
| React state, module caches, AI plaintext/config/request, pending actions, timers and debounced saves | mounted feature | Lifetime must be bounded by account scope and epoch, not just navigation. |

Desktop-only local adapters found in plugin-account/productivity/calendar/organizer/etc are outside this Web fix. The separate `plugin-productivity/src/web/browserTodoRepo.ts:431` browser entry uses core-data account-specific storage and stays in the verification inventory above. Their existence is not evidence they are loaded by the Web shell; no blanket migration of all origin keys or desktop data is allowed.

## Fix strategy — implement in dependency order

### 1. Explicit scope and registry contract

Add a package-owned account-local storage boundary, preferably in `plugin-web-storage`, with immutable `StorageScope { kind: account | device | locked | demo; accountId?; epoch }`. Host only mounts the scope gate; business migration and persistence stay in owning packages. Keep a device preference allowlist independent of naming/category: module keys can be device settings and pref keys can contain private text/list IDs.

Account-scoped operations require authenticated stable user ID. Loading, unauthenticated or unconfigured live-auth states must not read the prior account's data or fallback to legacy. Mock/demo storage must use a distinct namespace and must not silently claim production legacy data. Identity-bound subtree is keyed by account and migration generation; identity transitions render a locked state before any other account's children mount.

Storage handles capture the owner and epoch at creation. An old callback cannot resolve a mutable global account and write A state into B. On transition, revoke the old epoch, cancel in-flight requests/debounces, unsubscribe scoped events, discard plaintext and reset reducer/ref caches. Reads/writes and async completions check validity; stale writes reject with a typed result instead of silently becoming B writes. Existing A persisted data remains intact for A's later login.

### 2. Complete adapter coverage

Route get/set/remove, hook initial existence checks, autosave, migration helpers and same/cross-tab subscriptions through the same physical-key resolver. Add scoped adapter entry points for the three direct repositories and direct TimeTracker component access. Update consumer imports via public exports only. Do not monkey-patch global Storage or copy account data into global legacy keys.

Namespace example: `xai:account:v1:<encoded-user-id>:<generation>:<logical-key>`. Include reversible safe encoding and avoid ambiguous delimiters. Notifications contain account/generation/epoch/key metadata only; ignore other-account events. Search/dashboard/statistics receive the same account view. Keep same-account cross-tab writes inside the existing concurrency contract; do not claim prefixing alone fixes last-writer-wins (REL-08 separate).

Reset/export/delete operate through explicit scoped key ownership, never `localStorage.clear`, blanket `xai_` removal or whole secrets DB deletion. Device preferences remain; deleting A must not delete B or the retained unowned quarantine. This is necessary compatibility work even though comprehensive deletion/export improvements are later TODO items.

### 3. Legacy migration with explicit choice and rollback

Before regular business hydration, detect legacy records without rendering their content to the newly authenticated user. Offer: **start empty and keep archive**, **review and import selected categories into this account**, or **postpone and remain locked**. State that the old data has no provable account owner; do not auto-assign it to the first account that logs in. Review shows categories/counts first; content and secret adoption require explicit local user action. BYOK adoption is a separate unchecked choice; no plaintext key export or logging.

Use copy-on-write generations. Preserve original raw strings/secret ciphertext and a manifest with schema, checksums, source ownership=unassigned, selected target account, category selection and migration ID. Validate supported shapes without rewriting/dropping invalid source bytes. Corrupt entries stay in quarantine with a recoverable error. Existing target generation remains intact; imports into a nonempty account create a new candidate and report conflicts instead of overwriting IDs silently.

Serialize migration with Web Locks where available. If exclusive coordination is unavailable, block migration until other tabs close rather than inventing unsafe localStorage compare-and-swap. Stage all selected LS keys under the new generation; stage adopted BYOK under the same account/generation in IDB; reread and verify all staged values. **Only then atomically write a single committed generation marker.** Both content and key readers require that committed marker, so partial writes in either backend stay invisible. Cross-backend writes are not one transaction: crash recovery must explicitly handle prepare/verify/commit, discard or resume uncommitted staging, and retain previous generation/legacy backup. Store no plaintext secrets in the journal. Quota/blocked-IDB/closed-page failures cannot mark success or remove originals.

After commit, switch the account subtree to the new generation and show import receipt. Rollback points the account back to its previous generation and preserves imported data as an archive; an empty first generation can be restored without deleting source. Source deletion is a separate explicit action after backup/export policy, never automatic during this repair. Legacy tabs may still write legacy keys: ignore their events in scoped runtime, preserve new legacy changes for a later explicit import; never merge them silently.

### 4. BYOK and auth lifecycle

Persist each provider secret using account/provider/generation identity. Retain encryption-at-rest, attach owner/version metadata and bind it through AES-GCM additionalData for new envelopes. Derivation is not an authorization boundary; the application scope gate controls access. Legacy decrypt failure must preserve ciphertext for recovery, not auto-remove it. Use independent epoch capture across derive/encrypt/decrypt/load/save/testConnection and AI stream setup; switching accounts must abort pending requests and prevent A plaintext from being used with B's selected provider/base URL. Any queued tool side effect must keep its originating account or be cancelled.

Auth state-change callback should invalidate local scope synchronously and schedule asynchronous storage work outside the callback. Use stable user identity, ignore token refresh as an account switch, handle SIGNED_OUT and direct A→B transition even without a full navigation, and cancel stale getSession resolutions. Broadcast account-invalidation metadata across tabs; each tab re-evaluates its auth state and enters locked mode before displaying data. No credentials in that channel.

## Required regression / verification matrix

1. A→sign-out→B and direct A→B: zero A content in all feature repositories, search, widgets, statistics and AI settings; B missing key cannot fall back to A/legacy; A re-login restores A.
2. Same-user token refresh preserves state and does not remigrate. Loading/unconfigured/unauthenticated fail closed. Demo namespace never leaks into live scope.
3. Pending autosave, AI KDF/key test/stream/tool result, timers and stale auth refresh across switch cannot read/write/display under B. Compare captured account + epoch after awaits.
4. Device theme/language/density/font/pet/layout controls persist across switches; list/category-bound UI state stays account-local.
5. Legacy choices: start empty, import selected, postpone, invalid data, empty data, already populated target, duplicate IDs, key decrypt failure, repeated import, rollback. Original byte-identical archive preserved.
6. Fault injection at every migration step: denied LS, quota, IDB blocked/error, close/reopen, crash between IDB and LS stages, commit marker failure, rollback failure, competing tab, legacy tab mutation. No success until all verified; no data discarded.
7. Two tabs same account and different accounts: scoped notifications and auth invalidation; old tab callbacks cannot corrupt new account. Raw legacy access scan guards future bypasses.
8. Current-account export/reset/delete does not include/delete another account or device preferences. Existing encrypted cache default naming remains account-specific; no cloud protocol change.
9. Full package regressions/type checks and browser tests with two mock identities plus real browser persistence; real hosted auth is a separate environment-backed gate, not replaced by emulator PASS.

## External source verification

Supabase Skill read. Changelog fetched as markdown using curl after web tool rejected its content type; current entries inspected. Relevant recent auth breaking entry concerns self-hosted URL configuration; this repair changes no endpoints/config. Official [onAuthStateChange documentation](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) supports using auth lifecycle events. The diagnosis is based on repository behavior, not presumed SDK internals. No Supabase client/version, SQL/RLS, service credentials or network integration are modified.

## Implementation refinement — 2026-09-09

The existing open-ended `xai_pref_*` API remains compatible: unknown new preference names default to account-private. Unknown **unowned** legacy names still cannot be adopted without classification; archives preserve them verbatim. Generation migration enumerates every already-owned private key, including these open-ended preferences, so subsequent imports cannot hide existing custom values.

Module guards are registered by each consumer package through its public entry point, avoiding a storage-to-consumer dependency cycle and keeping business formats with their owners. Invalid blobs remain in the original unowned key and raw archive; migration refuses publication. A prepared journal is exposed through `listAccountMigrations`; retry builds a new invisible candidate rather than discarding interrupted bytes. Captured-account deletion writes a tombstone before removing generations, preventing stale work from recreating deleted data. Web Locks serialize commits and rollback across tabs; unavailable lock support fails explicitly.
