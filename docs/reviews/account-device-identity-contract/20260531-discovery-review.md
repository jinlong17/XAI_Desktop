# Discovery Review - account-device-identity-contract

| Field | Value |
|---|---|
| Feature | account-device-identity-contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #3 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for one docs-only contract that defines shared
account, device, session, role, and lifecycle semantics across Web, Mac
Desktop, Desktop Plugin, Site, Admin Dashboard, and Workflow systems.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` fixes Account Cloud Sync
  as shared infrastructure, not a standalone product.
- `docs/contracts/account-sync-entity-scope-matrix.md` keeps `account.device`
  deferred and points this row at the ownership decision.
- `docs/contracts/data-repository-v0.md` reserves `account.device` for
  post-v0 work but does not force it to become a user-payload `RepoRecord`.
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
  already freeze the device model: client `device_id`, server
  `encryption_device_id`, per-device keypair, per-device DEK wrap,
  active/revoked lifecycle, and device-bound request rules.
- `@repo/web-auth-device-session` already owns the browser auth/device/session
  seam, and `@repo/plugin-account` already owns desktop-side account/revoke/
  rekey type seams.

This row must align those authorities without unpausing runtime sync-v1 work or
inventing a new auth protocol.

## 2. Selected output shape

Selected shape: a canonical contract document under `docs/contracts/` plus
review artifacts under `docs/reviews/account-device-identity-contract/`.

Reasoning:

- the requirement spans six product surfaces and several existing contracts, so
  it belongs in the shared contracts directory instead of a package-local doc;
- later rows for local-first boundaries, protocol surfaces, admin read models,
  Site entry, and workflow state need one stable identity contract to cite;
- the row is strictly docs/contracts only, so the row #1 and row #2 review-doc
  pattern is the correct precedent.

Rejected shapes:

- new runtime implementation or server API work: rejected because sync-v1
  runtime remains paused and the request is docs/contracts only;
- promoting `account.device` into a shipped `RepoRecord` now: rejected because
  the current authorities treat device identity as server/account metadata plus
  local secure material, not as ordinary payload sync;
- separate Web/App/Admin contracts: rejected because the point of this row is to
  freeze the shared cross-surface identity spine.

## 3. Key decisions

### 3.1 `account.device` remains server-authoritative in v1

This row should resolve the ambiguity left open by row #2:

- the reserved slug `account.device` stays **deferred** as a user-payload record;
- device identity in v1 is expressed through server/account registry metadata,
  local device storage, per-device keypairs, per-device wraps, and guarded API
  projections;
- later work may expose a typed read model or API resource called
  `account.device`, but not a client-authored sync payload record.

This preserves the current protocol and avoids pretending device revoke/rekey is
just another repository mutation.

### 3.2 One account authority, two local session surfaces

The contract needs to state explicitly that:

- Web and Mac Desktop authenticate one shared account identity;
- each surface keeps its own local session/runtime storage;
- neither surface becomes the other's upstream source of session truth;
- both consume one account cloud authority through their own adapters.

### 3.3 Admin claims are separate from product sessions

The contract must freeze that:

- Admin Dashboard uses dedicated admin claims and admin/server APIs;
- ordinary Web Console and Desktop product sessions stay non-admin by default;
- Site may link into account entry and status, but never inherit admin power or
  bypass device checks.

## 4. Current seam map and observed gaps

| Surface | What already exists | Gap this row must capture |
|---|---|---|
| `@repo/web-auth-device-session` | Browser auth/session storage, local `device.id`, device register/heartbeat, canonical `Authorization` + `X-Device-Id` + `X-Sync-Version` request seam, `unknown_device` / `device_revoked` cleanup semantics | It intentionally does not own DEK/KEK/runtime crypto, admin claims, or desktop orchestration. Later rows must reuse this seam rather than fork it. |
| `@repo/plugin-account` | Desktop-facing account credential types, refresh-token Keychain persistence, device revoke types, rekey state machine, deletion/revoke operational helpers | Some transports are still mock/deferred until real server/admin APIs exist. This row should state the required contract they must satisfy. |
| sync-v1 protocol / technical requirements | `encryption_device_id`, per-device wrap model, rekey quarantine, recovery proof, RLS active/revoked enforcement, nonce/AAD/device binding | This row must not drift from those details or restate them as a new protocol. |
| future Admin APIs | expected control-plane authority for admin claims, device moderation, audit, and read models | No stable production API surface exists yet, so the contract must freeze the separation rule before implementation convenience collapses it. |

## 5. Recommended contract sections

The canonical contract should contain:

1. a resolved ownership decision for account identity, session state, and
   `account.device`;
2. an identity object table covering account, session, device registration,
   device crypto binding, admin claims, and workflow snapshots;
3. a device model invariants table preserving `device_id`,
   `encryption_device_id`, keypair, wrap, status, and device-bound headers;
4. a lifecycle table for sign-up/login, register/heartbeat, new-device grant,
   revoke, recovery/rekey, refresh/logout, and account deletion;
5. a surface responsibility matrix for Web, Desktop, Plugin, Site, Admin, and
   Workflow;
6. explicit secret/credential boundary rules;
7. a seam map and verification gates for later rows.

## 6. Risks and open questions

| Risk / question | Treatment in this row |
|---|---|
| Treating `account.device` like an ordinary sync payload | Resolve it as server-authoritative metadata plus local secure material in v1, not a shipped payload `RepoRecord`. |
| Browser auth or Desktop auth inventing parallel device semantics | State one shared device model and point both surfaces back to the same invariant table. |
| Admin power leaking into ordinary product sessions | Separate admin claims and admin APIs from product session state at the contract level. |
| Site bypassing auth/device rules for convenience | Limit Site to account entry/status/public messaging only. |
| Secret material accidentally appearing in browser-visible state | Add an explicit boundary table for service-role credentials, provider secrets, master password, secret key, KEK/DEK, refresh tokens, and device private key. |

## 7. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Contract table defines identity fields, lifecycle transitions, product-surface access, revocation behavior, and admin role boundaries | Canonical contract sections 3 through 7 |
| Plan identifies gaps between `@repo/web-auth-device-session`, `@repo/plugin-account`, sync-v1 device rows, and future admin APIs | Discovery review section 4 and canonical contract section 8 |
| Existing device model is preserved | Canonical contract section 4 |
| Browser-visible secret leakage is explicitly forbidden | Canonical contract section 7 |
| Admin Dashboard stays claim-gated and Site stays non-bypass | Canonical contract sections 2, 5, and 6 |

## 8. Review recommendation

APPROVE a single docs-only build phase that:

- adds `docs/contracts/account-device-identity-contract.md`;
- registers it in `docs/contracts/README.md`;
- records the lifecycle/seam decision that `account.device` stays
  server-authoritative in v1;
- advances `docs/reviews/account-device-identity-contract/dev_log.md` to
  `READY_FOR_VERIFY`.

The build must not touch runtime code, unpause sync-v1, redefine
`RepoRecord`/`syncScope`/crypto, or grant admin power to ordinary product
sessions.
