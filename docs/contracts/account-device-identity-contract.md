# Account Device Identity Contract

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #3 |
| Applies to | Web, Mac Desktop, Desktop Plugin, Site, Admin Dashboard, Workflow systems |
| Builds on | `docs/contracts/account-cloud-sync-architecture.md`, `docs/contracts/account-sync-entity-scope-matrix.md`, ADR-0013 D4, `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md`, `@repo/web-auth-device-session`, `@repo/plugin-account` |

## 1. Purpose

This contract freezes the shared account, device, session, role, and lifecycle
rules that every Account Cloud Sync surface must follow.

It answers five questions:

- what is server-authoritative account identity versus client-local session
  state;
- how one device is identified in browser and desktop runtimes;
- how per-device crypto, revocation, and recovery interact with auth flows;
- how admin claims differ from ordinary product sessions;
- which current packages already own each seam and where future rows must plug
  in.

This document does not redefine `RepoRecord`, `syncScope`, `/sync/push`,
`/sync/pull`, DEK/KEK cryptography, or sync-v1 runtime sequencing.

## 2. Resolved decisions

### 2.1 `account.device` stays server-authoritative in v1

`docs/contracts/data-repository-v0.md` reserves the `account.device` slug, but
this row resolves that v1 device identity remains **server/account metadata plus
local secure material**, not a first-class user-payload `RepoRecord`.

Reasoning:

- current browser auth already treats `device.id` as a local identity that is
  registered against server RPCs;
- sync-v1 crypto and RLS depend on server-assigned `encryption_device_id`,
  active/revoked state, and per-device wrap rows;
- device revocation and rekey are control-plane lifecycle operations, not
  ordinary repository payload mutations.

The reserved `account.device` slug may later become a projected read model or a
typed API resource, but not a v1 client-authored sync payload record.

### 2.2 Sessions are surface-local views of one shared account contract

- Web and Mac Desktop both authenticate one shared account identity.
- Each surface maintains its own local session material and local device
  identity.
- Sessions do not make Web and App peers of each other; both remain clients of
  the shared account cloud layer.

### 2.3 Admin authority is claim-gated and API-gated

- Ordinary Web Console or Desktop product sessions do not gain admin powers.
- Admin Dashboard uses dedicated admin claims plus server/admin APIs and read
  models.
- Site may link into account entry or status pages, but must not bypass account,
  device, or admin claim checks.

## 3. Identity object contract

| Object | Authority | Required fields / invariants | Where it may live | Forbidden treatment |
|---|---|---|---|---|
| Account identity | auth/account service | `account_id`, email/login identifier, membership metadata, claim metadata | server auth store; surface-local read model caches only as needed | Must not become a `RepoRecord` payload or a mutable browser-owned source of truth |
| Surface session | surface-local runtime backed by auth service | `account_id`, access token/session handle, expiry/refresh state, local auth state | browser custom auth storage and sessionStorage; desktop secure/local runtime state | Must not carry admin power by default or expose refresh/service credentials to unrelated surfaces |
| Device registration | account-sync device registry | client `device_id`, server `encryption_device_id`, device status, paired/last-seen timestamps | local device store plus server registry rows/RPCs | Must not be modeled as freeform sync payload data |
| Device crypto binding | sync-v1 crypto authority | per-device keypair, per-device DEK wrap, key version linkage, revoke/rekey semantics | local secure storage for private material; server wrap/metadata rows | Must not expose device private key, raw DEK, KEK, or recovery seed to browser-visible state |
| Admin claim | auth/admin service | explicit admin role/claim set, scope, auditability | server-issued claims and admin API checks | Must not be inferred from ordinary product login state |
| Workflow snapshot | repo-truth plus derived read model | roadmap/dev_log/release state, optional sync-health snapshot | repo files, optional derived projections | Must not replace repository truth or leak private account payloads |

## 4. Device model invariants

| Element | Contract |
|---|---|
| Client `device_id` | Surface-local durable identifier used by browser/device bootstrap and desktop runtime orchestration. It is the client-visible device identity anchor. |
| Server `encryption_device_id` | Server-assigned unique device encryption identifier used by sync-v1 nonce/AAD/device matching. Browser JS must not invent or override it. |
| Per-device keypair | Every active device has its own keypair. Private key stays in local secure storage only; public key may be registered server-side. |
| Per-device DEK wrap | DEK access is granted per active device through wrap rows, not by sharing one browser-visible secret. |
| Device status | Minimum states are `active` and `revoked`; local UI may also expose `current` or `pending_dek_wrap` projections, but revoke semantics remain server-authoritative. |
| Device-bound API headers | Business and sync-facing requests that require device identity must attach `Authorization`, `X-Device-Id`, and `X-Sync-Version` through one canonical helper seam. |
| Revocation side effects | A revoked device must lose normal sync access, force local session cleanup, and trigger rekey/quarantine semantics where required by sync-v1. |

## 5. Lifecycle contract

| Lifecycle | Required flow | Must preserve |
|---|---|---|
| Browser sign-up / login | `@repo/web-auth-device-session` owns browser session restore/creation, local `device.id`, and device-bound request bootstrap | PKCE/session boundaries, same-origin redirect policy, and no browser-visible secret/service credentials |
| Desktop sign-up / login | `@repo/plugin-account` owns account credentials, auth-password derivation, refresh-token Keychain persistence, and local account session types | master password + secret key dual-factor derivation, Keychain-only refresh/secret handling, and no Web-to-App shortcut |
| Device register / heartbeat | authenticated surface session ensures local `device_id`, calls register, then maintains heartbeat/status | idempotent register, repeatable heartbeat, and one canonical request/session seam |
| New-device grant | donor/active device and server registry coordinate per-device wrap creation before the new device becomes fully active | per-device keypair + wrap model, active-only access, and no plaintext DEK transfer |
| Device revoke | control-plane or account-management action marks the target device revoked and requires rekey follow-up where the current key remains exposed to the old device set | server-authoritative revoke state, forced cleanup on the revoked client, and auditability |
| Recovery | recovery proof, mnemonic, and rekey flows operate against the current sync-v1 protocol and recovery-signing contract | no raw recovery secret in browser-visible state; no bypass around device wraps or proof gates |
| Session refresh / logout | local session storage may be refreshed or cleared without silently escalating claims or rewriting device registry truth | ordinary sign-out may preserve local `device_id`; revoked/unknown-device cleanup may rotate or replace it |
| Account deletion | account lifecycle may revoke all devices and clear account-scoped data through guarded account/admin flows | deletion must remain claim-gated, audited, and separate from ordinary product payload sync |

## 6. Surface responsibility matrix

| Surface | Allowed responsibilities | Must not do |
|---|---|---|
| Web | Browser auth/session UX, local `device.id`, register/heartbeat, device-bound fetch, account entry/status UI | Must not expose service-role credentials, provider secrets, KEK/DEK material, recovery seed, or admin-only API power |
| Mac Desktop | Native/local account orchestration, secure secret storage, desktop account/session surfaces, device lifecycle UI, rekey/recovery orchestration | Must not treat Web as its upstream authority or export private key / raw secret material to plugins |
| Desktop Plugin | Consume account/sync status through public contracts and repository APIs only | Must not own auth/session/device registry transport or direct secret handling |
| Site | Offer account entry links, release/status messaging, and curated public account/security documentation | Must not bypass auth/device checks, host private account data, or act as an admin surface |
| Admin Dashboard | Read and mutate guarded control-plane/device/account state through admin APIs with explicit claims and audit | Must not borrow ordinary product sessions as admin authority or expose encrypted payload plaintext |
| Workflow systems | Record repo-truth state and optionally display derived sync/account health summaries | Must not become the live account/device authority or store secrets/private payload data |

## 7. Secret and credential boundary rules

| Material | Browser-visible state | Desktop-local secure state | Server/admin state |
|---|---|---|---|
| Service-role credentials | Never | Never | Guarded service/backend only |
| Provider raw secrets | Never | Never unless an explicitly approved local-only integration requires it | Guarded service/backend only |
| Master password | Never persisted in browser-visible state | User-entered, local derivation only | Never |
| Secret key | Never persisted in browser-visible state | Local-only recovery/auth factor | Never |
| KEK / DEK raw material | Never | Local secure storage / Rust KeyVault only | Never plaintext |
| Device private key | Never | Local secure storage only | Never |
| Refresh token | Browser JS must not read HttpOnly-only variants; no unrelated storage mirrors | Keychain/secure local storage only | Auth service only as required |
| Recovery seed / proof secret | Never | Local derivation/runtime only | Server stores only the approved public/verification counterpart where required |

## 8. Current package seam map and gaps

| Surface / source | Current authority | Gap this row records |
|---|---|---|
| `@repo/web-auth-device-session` | Owns browser auth/session storage, local `device.id`, `device_register` / heartbeat lifecycle, device-bound header injection, and `unknown_device` / `device_revoked` cleanup semantics | It intentionally stops before DEK/KEK/runtime sync cryptography and before admin claims. Future rows must consume this seam rather than invent a second browser device/session owner. |
| `@repo/plugin-account` | Owns desktop-side account credential types, refresh-token persistence, device revoke types, rekey state machine, and mock/deferred operational seams | Device revoke transport and some control-plane flows remain mock/deferred until real server/admin APIs are provisioned. This row records the contract they must satisfy, not a runtime unfreeze. |
| sync-v1 docs and protocol rows | Own actual `encryption_device_id`, per-device wrap, nonce/AAD, rekey, RLS, and recovery-proof invariants | This row must not redefine crypto or transport. It only binds account/device/session semantics to those authorities. |
| Future Admin APIs | Must own admin claim issuance, device/account moderation, audit append, and control-plane read models | The APIs do not exist as stable production surfaces yet. This row freezes the separation rule so ordinary product sessions never become admin sessions by convenience. |

## 9. Verification gates for later rows

Any later implementation row that touches account/device/session identity must
prove all of the following:

- one shared account authority exists across Web and App, with no direct Web to
  App session handoff;
- browser and desktop both preserve the client `device_id` plus server
  `encryption_device_id` split;
- per-device keypair and per-device wrap semantics remain intact;
- revoked devices trigger forced cleanup and cannot silently continue normal
  sync;
- admin claims are checked through admin APIs and are not inherited from
  ordinary product sessions;
- Site entry/status pages do not bypass auth/device/admin checks;
- no browser-visible bundle or browser storage path contains service-role
  credentials, provider secrets, raw DEK/KEK, master password, secret key, or
  device private key;
- workflow/read-model snapshots remain derived and do not replace repo truth or
  account authority.

## 10. Non-goals

- No runtime sync-v1 unpause.
- No new `RepoRecord` or `syncScope` definition.
- No promotion of `account.device` into a user-payload sync record.
- No admin UI or Site implementation branch authorization.
- No new browser runtime crypto or secret-storage implementation.
