# account-sync-site-entry-contract - API

## Contract Outputs

This docs-only feature does not add a runtime API, typed event, or Tauri
command. Its output is the contract document
`docs/contracts/account-sync-site-entry-contract.md`.

That contract defines five interface groups:

1. Allowed Site data and metadata table
2. Forbidden Site data and metadata table
3. Account/auth entry handoff contract
4. Release/download/updater-metadata and status-linking contract
5. Sync/security claim source contract

## Upstream Interfaces

The contract must consume, not redefine, these authorities:

- `docs/contracts/account-cloud-sync-architecture.md`
  - Web <-> account cloud <-> App topology
  - sync as shared infrastructure, not a product surface
- `docs/contracts/account-sync-entity-scope-matrix.md`
  - `account-sync` versus `device-local` entity class separation
  - user payload versus public-safe metadata classification
- `docs/contracts/account-device-identity-contract.md`
  - account/device/session/admin-claim boundary
  - entry-point seam that the Site must link into, not bypass
- `docs/contracts/account-sync-protocol-surface-contract.md`
  - sync payload, outbox, push/pull, and encrypted-blob boundaries
  - what the Site must never expose or proxy
- `docs/contracts/account-sync-surface-adapters.md`
  - Site/Admin remain downstream metadata consumers, not payload authorities
- `docs/contracts/account-sync-admin-read-models.md`
  - admin read models and control-plane data the Site must never expose
- `docs/contracts/data-repository-v0.md`
  - `RepoRecord`
  - `syncScope`
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
  - AES-256-GCM, CBOR AAD, nonce lease, per-device key wrap, recovery proof,
    zero-knowledge boundary, encrypted blob invariants
  - source authorities for any public sync/security claim on the Site
- ADR-0013 D2/D3/D4
  - account cloud topology and `syncScope` governance
  - required citation for any public account-cloud topology claim
- ADR-0003
  - three-face architecture; the Site is outside the three faces

## Downstream Contract Requirements

### Allowed Site data and metadata table

Must specify, for each allowed category:

- category name;
- allowed data and metadata (links, summaries, artifact metadata, status text);
- source of truth for the data (release authority, status authority, contract);
- privacy constraint (public-safe, no per-user or per-device detail).

Minimum allowed categories:

- account-entry links (pointing to account creation, sign-in, sign-out flows
  governed by the shared account/device/session contract)
- download links and release artifact metadata (version, checksum, file name,
  release date, changelog summary)
- updater metadata links (update endpoint, latest version, minimum required
  version)
- public account status messaging (service availability, maintenance notices,
  incident summaries in operator-safe language)
- public sync/security explanations (source-backed claims only; see below)

### Forbidden Site data and metadata table

Must specify, for each forbidden category:

- category name;
- why it is forbidden (privacy boundary, secret boundary, control-plane rule).

Minimum forbidden categories:

- private product state records and user-authored content
- sync payloads, outbox items, or any piece of a user's synced data
- encrypted blob content, nonce values, or encrypted-envelope fragments
- service-role credentials, provider API keys, platform secrets, or raw
  key material
- admin read models, control-plane state, RBAC claims, or audit log entries
- local-only device state (`device-local` entities per the entity scope
  matrix): file paths, bookmarks, window positions, local preferences
- per-user account identifiers or session tokens in any logged or public
  surface
- per-device sync health, per-user error detail, or raw push/pull counts

### Account/auth entry handoff contract

Must specify:

- that Site account-entry links route through the entry points defined by
  `docs/contracts/account-device-identity-contract.md`;
- that the Site does not implement its own account, device, or session system;
- that device registration and admin-claim checks are not bypassed;
- that there is no Web-to-App or App-to-Site direct sync path.

Must not specify:

- new auth provider, token, or session implementation;
- Site-owned device registration flow;
- bypass of existing session or admin checks;
- any Web/App/Site sync bridge outside the account cloud topology.

### Release/download/updater-metadata and status-linking contract

Must specify:

- that the Site links to release artifact download URLs and displays release
  artifact metadata (version, checksum, date, changelog summary);
- that the release/distribution system remains the source of truth for
  artifact metadata;
- that the Site does not proxy live sync channels, encrypted blob content,
  or account-scoped sync decisions;
- that account-scoped "update available" notices, if ever added, must consume
  a public update-metadata endpoint, not a private sync channel.

### Sync/security claim source contract

Must specify:

- that all public statements about sync, encryption, privacy, or security
  must be grounded in one or more of:
  - ADR-0013 D4 (account cloud topology and `syncScope`);
  - `docs/TECHNICAL_REQUIREMENTS.md` (AES-256-GCM, CBOR AAD, nonce, per-device
    key wrap, recovery proof, zero-knowledge boundary, encrypted blob);
  - `docs/workflow/roadmap/sync-v1.md` (paused runtime scope and protocol
    intent);
  - existing shipped account-sync contracts (rows #1–#7);
- that claims not traceable to one of these sources must be removed or
  replaced with neutral factual descriptions.

Must not specify:

- new security claims beyond what the cited sources already support;
- restatements of crypto invariants that differ from `TECHNICAL_REQUIREMENTS`;
- marketing copy not traceable to a named authority.

## Error Semantics

The contract does not define a runtime error code system. For the boundary
tables, the contract should describe consequence categories:

- allowed: the Site may present this data category with stated constraints;
- forbidden: the Site must never host, proxy, or display this data category;
- deferred: implementation detail deferred to future Site activation row;
- source required: a specific claim is permissible only with an explicit
  named source citation.

## Permission Notes

- The Site is a public-facing read-only presentation surface.
- No Site surface gains read or write access to sync payloads, encrypted
  blobs, admin read models, or private account/device state.
- Account entry handoff is outbound link-only from the Site to the shared
  account/device/session entry surface.
- Release artifact delivery is link/metadata reference only; the Site is
  not a binary or payload host.

## Idempotency Notes

- This row does not define a mutation identity model.
- The contract is a boundary document; it does not describe server requests
  from the Site.
- Future Site activation rows will own idempotency semantics for any
  Site-specific server interactions.
