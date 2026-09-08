# Account Sync Site Entry Contract

| Field | Value |
|---|---|
| Contract | `account-sync-site-entry-contract` |
| Roadmap row | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #8 |
| Module lane | `sync` (shared cross-surface boundary; `site` lane remains PROPOSED) |
| Status | Frozen — docs-only |
| Created | 2026-05-31 |

## 1. Normative Scope and Inherited Authorities

This contract defines the public-boundary rules for the official Site surface
within the Account Cloud Sync contract stack. It consumes the following shipped
authorities and must not redefine any of them:

| Authority | What it owns (do not redefine) |
|---|---|
| `docs/contracts/account-cloud-sync-architecture.md` | Web ↔ account cloud ↔ App topology; sync as shared infrastructure |
| `docs/contracts/account-sync-entity-scope-matrix.md` | `account-sync` vs `device-local` entity class separation |
| `docs/contracts/account-device-identity-contract.md` | Account, device, session, admin-claim, and lifecycle seams |
| `docs/contracts/account-sync-local-first-boundaries.md` | Per-surface store ownership and local-first exclusions |
| `docs/contracts/account-sync-protocol-surface-contract.md` | Push/pull/conflict/retry semantics; outbox and encrypted-blob boundaries |
| `docs/contracts/account-sync-surface-adapters.md` | Site/Admin/Workflow as downstream metadata consumers without payload authority |
| `docs/contracts/account-sync-admin-read-models.md` | Admin read-model catalog and mutation guardrails |
| `docs/contracts/data-repository-v0.md` | `RepoRecord`, `syncScope`, repository behavior |
| `docs/TECHNICAL_REQUIREMENTS.md` | AES-256-GCM, deterministic CBOR AAD, nonce lease, per-device key wrap, recovery proof, zero-knowledge boundary, encrypted blob invariants |
| `docs/workflow/roadmap/sync-v1.md` | Paused runtime sync-v1 scope and protocol intent |
| ADR-0013 D2/D3/D4 | Account cloud topology, `syncScope` governance, Web→Desktop D3 gate |
| ADR-0003 | Three-face architecture (Site is outside the three faces) |

The Site does not own any of the three faces defined in ADR-0003. It is a
public metadata and account-entry surface only.

## 2. Allowed Site Data and Metadata

The Site may present the following categories. Each row must have an authority
source citation; any claim without one is forbidden.

| Category | Allowed data and metadata | Source of truth | Privacy constraint |
|---|---|---|---|
| Account-entry links | Links to account creation, sign-in, and sign-out flows | `docs/contracts/account-device-identity-contract.md` entry points | Public-safe; no per-user identifiers embedded in public URLs |
| Download links and release artifact metadata | Version string, file name, SHA checksum, release date, changelog summary | Release/distribution authority (deferred to future Site activation row for canonical location) | Public-safe; no per-device or per-account scope |
| Updater metadata links | Update endpoint URL, latest available version, minimum required version | Release/distribution authority | Public-safe; no private device identifiers or account IDs |
| Public account status messaging | Service availability notices, planned maintenance announcements, incident summaries in operator-safe language | Operator-controlled status authority | Operator-safe summary only; no per-device sync health, per-user error detail, or user content |
| Public sync and security explanations | Source-backed statements about sync topology, encryption approach, and privacy model | ADR-0013 D4; `docs/TECHNICAL_REQUIREMENTS.md`; `docs/workflow/roadmap/sync-v1.md`; shipped account-sync contracts (rows #1–#7) | No new claims beyond what cited sources support |

## 3. Forbidden Site Data and Metadata

The Site must never host, proxy, cache, render, or make queryable any of the
following categories.

| Category | Why forbidden |
|---|---|
| Private product state records and user-authored content | Private data boundary; user data never crosses to a public surface |
| Sync payloads, outbox items, or any fragment of a user's synced data | Sync payload boundary per `account-sync-protocol-surface-contract`; payload authority belongs to the account cloud, not the Site |
| Encrypted blob content, nonce values, or encrypted-envelope fragments | Crypto boundary per `TECHNICAL_REQUIREMENTS`; key material and ciphertext must never appear on a public surface |
| Service-role credentials, provider API keys, platform secrets, or raw key material of any kind | Secret boundary; credentials must never be exposed on a public surface |
| Admin read models, control-plane state, RBAC claims, or audit log entries | Control-plane boundary per `account-sync-admin-read-models`; the Site is a downstream metadata consumer, not a control-plane surface |
| Operator configuration or admin mutation interfaces | Admin authority boundary; no Site page may expose or trigger control-plane mutations |
| Local-only device state: file paths, bookmarks, window positions, local preferences, machine identifiers classified `device-local` per the entity scope matrix | `device-local` exclusion per `account-sync-entity-scope-matrix`; local state never goes to a public surface |
| Per-user account identifiers, device identifiers, or session tokens in any logged, cached, or publicly visible surface | Identity boundary per `account-device-identity-contract`; individual identifiers must not appear in public pages, URL parameters, analytics logs, or HTTP logs |
| Per-device sync health records, per-user error detail, raw push/pull counts, or user-specific diagnostic data | Privacy boundary; only operator-safe summaries are permitted (see allowed table, row 4) |

## 4. Account and Auth Entry Handoff

Site account and auth entry must:

1. Route account creation, sign-in, and sign-out through the entry points
   defined by `docs/contracts/account-device-identity-contract.md`. These
   seams are the canonical authority for account and device identity; the Site
   links into them, it does not own them.
2. Not invent a separate account, device, or session system.
3. Not bypass device registration, session checks, or admin-claim checks
   defined in `account-device-identity-contract`.
4. Not create a Web-to-App or App-to-Site direct sync path. The only
   authorised topology remains Web ↔ account cloud ↔ App per ADR-0013 D4.
5. Defer the choice of whether account entry links to a Web-hosted auth route
   or a separate Site-local auth form to the future Site activation row; the
   constraint is that whichever form is chosen must reuse the shared
   account/device/session contract without forking or duplicating those seams.

The Site must not specify a new auth provider, token exchange, or session
implementation. It must not add a Site-owned device registration flow.

## 5. Release, Download, Updater-Metadata, and Status Linking

1. The Site may link to release artifact download URLs and display release
   artifact metadata (version, checksum, release date, changelog summary).
2. The release/distribution system remains the authoritative source of release
   artifact state. The Site is a linker and summary surface; it does not become
   the artifact metadata source of truth.
3. The canonical public location for release artifact metadata is deferred to
   the future release/site activation row.
4. The Site must not host or proxy sync payloads, encrypted blob content, or
   account-scoped sync decisions.
5. The Site must not proxy or re-host binary release artifacts unless the future
   Site activation row explicitly grants that role to a named distribution
   authority.
6. If the Site later exposes an account-scoped "update available" notice, that
   notice must consume a safe public update-metadata endpoint; it must not read
   a private sync channel, a per-device sync health record, or a per-account
   outbox item.
7. Public account status messaging must use operator-safe language. Per-device
   sync health, per-user error detail, and user content must not appear in any
   status page, incident summary, or maintenance notice.

## 6. Sync and Security Claim Source Rules

Any public statement on the Site about sync, encryption, privacy, or security
must be grounded in one or more of the following named authority documents:

| Authority document | What it covers |
|---|---|
| ADR-0013 D4 | Account cloud topology and `syncScope` governance |
| `docs/TECHNICAL_REQUIREMENTS.md` | AES-256-GCM, deterministic CBOR AAD, nonce lease, per-device key wrap, recovery proof, zero-knowledge boundary, encrypted blob invariants |
| `docs/workflow/roadmap/sync-v1.md` | Paused runtime sync-v1 scope and protocol intent |
| Shipped account-sync contracts (rows #1–#7) | Boundary, entity, identity, protocol, adapter, and admin read-model authorities |

Claims that cannot be traced to one of these sources must be removed or
replaced with neutral factual descriptions. Marketing-only assertions without
source backing are prohibited on the Site.

Statements must not:

- restate or expand crypto invariants in ways that differ from
  `TECHNICAL_REQUIREMENTS`;
- assert zero-knowledge, end-to-end encryption, or other security properties
  beyond what the cited sources already support;
- imply a sync or identity capability that has not shipped or is paused
  (e.g. sync-v1 is paused; it must not be presented as a live runtime feature).

## 7. Site PROPOSED Gate and Implementation Routing

1. The `site` product module is PROPOSED and owner-deferred per ADR-0013 D1
   and `docs/PRODUCT_MODULE_MAP.md`.
2. No Site implementation, Cloudflare route, deploy configuration, landing
   page, or branch under `codex/site/<feature>` may be created until the
   operator explicitly activates the `site` module.
3. This contract row does not constitute operator activation of the `site`
   module.
4. When the operator activates the `site` module, the first
   `codex/site/<feature>` planning document must cite this contract as its
   entry-point authority and must demonstrate compliance with sections 2–6
   above before any implementation may begin.
5. Open questions deferred to the future Site activation row:
   - Whether account entry links to a Web-hosted auth route or a Site-local
     auth form, and what "reuse" of the shared contract means in that context.
   - Which release artifact metadata fields have an approved canonical public
     location and which require a new publication path.
   - Whether auto-update status and security-claim freshness are served from
     a static Cloudflare-cached endpoint, a server-side status API, or a
     repository-generated static file.

## 8. No Redefinition of Prior Shipped Authorities

This contract does not redefine:

- `RepoRecord` or `syncScope` — owned by `docs/contracts/data-repository-v0.md`;
- crypto invariants or encrypted-blob behavior — owned by
  `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`;
- account, device, or session contracts — owned by
  `docs/contracts/account-device-identity-contract.md`;
- admin read models or mutation guardrails — owned by
  `docs/contracts/account-sync-admin-read-models.md`;
- surface adapter responsibilities — owned by
  `docs/contracts/account-sync-surface-adapters.md`.

## 9. Verification Gates for Future Site Activation Rows

Any future `codex/site/<feature>` implementation row must prove:

- public Site pages contain no private product state records, sync payloads,
  encrypted blob content, nonce values, service-role credentials, provider API
  keys, platform secrets, raw key material, admin read models, control-plane
  state, RBAC claims, audit log entries, or local-only device state;
- Site account and auth entry flows invoke the shared account/device/session
  seams from `account-device-identity-contract` without forking or bypassing
  device registration, session checks, or admin-claim checks;
- release/download/updater-metadata pages link to release artifact sources only
  and do not proxy sync payloads, encrypted blobs, or per-device/per-account
  sync health data;
- public status pages expose operator-safe summaries only and contain no
  per-user error detail, per-device sync health records, or user-authored
  content;
- any public sync/security claim on Site pages can be traced to ADR-0013 D4,
  `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md`, or an
  existing shipped account-sync contract; claims that cannot be traced are
  absent;
- the `site` module activation has been explicitly recorded by an operator
  before any `codex/site/<feature>` branch, Cloudflare route, or deploy config
  is created.
