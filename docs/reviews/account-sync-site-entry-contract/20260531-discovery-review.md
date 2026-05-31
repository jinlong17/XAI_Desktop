# Discovery Review - account-sync-site-entry-contract

| Field | Value |
|---|---|
| Feature | account-sync-site-entry-contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #8 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for a docs-only contract that freezes the
sync/site boundary before any official Site implementation begins. The future
Site is expected to provide account entry, downloads, release notes, update
metadata, account status messaging, and public sync/security explanations.
Without a contract, the Site could drift into an unsafe role as a private-data
surface, an auth bypass, or an unverifiable security marketing surface.

Required coverage from the reviewed brief and roadmap row:

- a Site boundary table listing which data and metadata the Site may expose
  (account-entry links, download/release-note/updater metadata links, public
  status summaries, source-backed sync/security explanations);
- a Site boundary table listing what the Site must never host or display
  (private product records, sync payloads, encrypted blob content,
  service-role credentials, provider raw secrets, key material, admin read
  models, control-plane data, local-only device state);
- account/auth entry handoff requirements: entry must reuse the shared
  account/device/session contract and must not bypass device registration,
  session checks, or admin-claim checks;
- download, release-note, updater-metadata, and status linking rules: the
  Site may link to artifact metadata without becoming a product state store;
- sync/security messaging source rules: public claims must trace to ADR-0013
  D4, `docs/TECHNICAL_REQUIREMENTS.md`, and `docs/workflow/roadmap/sync-v1.md`
  rather than marketing-only wording.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` already positions sync
  as shared infrastructure and the account cloud topology as Web <-> account
  cloud <-> App, never Web <-> App directly.
- `docs/contracts/account-sync-entity-scope-matrix.md` already classifies
  entity classes as `account-sync`, `device-local`, mixed, or deferred;
  the Site must not become an `account-sync` consumer that writes or reads
  private user records.
- `docs/contracts/account-device-identity-contract.md` already freezes
  account/device/session/admin-claim boundaries; Site account entry must
  link into those seams, not bypass them.
- `docs/contracts/account-sync-protocol-surface-contract.md` already freezes
  push/pull/conflict/retry semantics; the Site must not host sync payloads,
  encrypted blobs, or wire-protocol details.
- `docs/contracts/account-sync-surface-adapters.md` already states that
  Admin/Site/Workflow remain downstream metadata consumers and do not gain
  payload authority.
- `docs/contracts/account-sync-admin-read-models.md` already freezes
  admin read models and mutation guardrails; the Site must never expose
  admin control-plane data.
- `docs/contracts/data-repository-v0.md` owns `RepoRecord` and `syncScope`;
  this row must not redefine them.
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
  own crypto invariants (AES-256-GCM, CBOR AAD, nonce lease, per-device wrap,
  recovery proof, encrypted blobs, zero-knowledge boundary); the Site may only
  cite these documents for public claims, not restate or expand them.
- ADR-0013 D4 freezes the account cloud topology and `syncScope` governance;
  any public sync/security claim must trace back to this ADR.
- ADR-0003 governs three-face architecture boundaries; the Site does not own
  any of the three faces.
- The `site` product module remains PROPOSED and owner-deferred per
  ADR-0013 and `docs/PRODUCT_MODULE_MAP.md`; this row must stay docs/contracts
  only and must not activate implementation work.

## 2. Canonical naming and output shape

Canonical feature name: `account-sync-site-entry-contract`.

Title: Account Sync site entry contract.

Naming rationale:

- the roadmap row defines the boundary between Account Cloud Sync and the
  future official Site;
- the scope is narrower than a full Site implementation plan and broader than
  any one page or download artifact;
- the contract is reusable by a later `codex/site/<feature>` workflow only
  after explicit operator activation;
- the output is a shared contract under `docs/contracts/` that the `sync`
  lane owns and the future `site` lane must consume.

Selected shape: one canonical contract at
`docs/contracts/account-sync-site-entry-contract.md` plus review artifacts
under `docs/reviews/account-sync-site-entry-contract/`.

Rejected shapes:

- Site implementation (landing page, Cloudflare route, deploy config):
  rejected because the Site module is PROPOSED and owner-deferred; no
  implementation may start without operator activation.
- Merging site-boundary rules into the existing admin read-models contract:
  rejected because the Site boundary crosses account-entry, release/download,
  public status, and security-messaging concerns that are distinct from
  control-plane admin data access.
- Splitting into separate account-entry and release/status contracts:
  rejected because the brief recommends one unified boundary document and the
  ADR-lite trigger calls for a single table covering allowed/forbidden data;
  the open question about implementation splitting is deferred to the future
  Site activation row.

## 3. Candidate options

### Option A - One unified sync/site boundary contract with allowed/forbidden matrices

Create one canonical contract at
`docs/contracts/account-sync-site-entry-contract.md` with:

- an allowed Site data table (account-entry links, download/release/updater
  metadata links, public status summaries, source-backed security
  explanations);
- a forbidden Site data table (private records, sync payloads, encrypted
  blobs, credentials, key material, admin data, control-plane state,
  local-only device state);
- account/auth entry handoff rules;
- release/download/updater-metadata and status-linking rules;
- sync/security claim source rules;
- implementation gate (Site stays PROPOSED, future work routes via
  `codex/site/<feature>` after operator activation).

Pros:

- one authority for later `site`, `sync`, and release rows;
- keeps private data and security claims consistent;
- clearly separates shipped sync/account authorities from deferred Site
  implementation.

Cons:

- the contract must be disciplined enough not to drift into marketing copy,
  Site UX, or Cloudflare implementation details.

### Option B - Minimal non-authorization rule only

Only state that the Site must not access private sync data and defer all
positive allowed/forbidden specifics until the Site is activated.

Pros:

- shortest commitment.

Cons:

- too weak to block unsafe Site designs before operator activation;
- account entry bypasses, security overclaims, and private-state exposure
  are the exact risks the roadmap row exists to prevent;
- a reviewer could not determine what the Site may expose versus must not
  expose.

### Option C - Split into account-entry, release/status, and security-messaging sub-contracts

Write three separate documents for the three concern areas.

Pros:

- each concern stays narrow.

Cons:

- no single authority for future Site implementers;
- higher risk of conflicting rules across the three documents;
- the brief's recommended plan shape calls for one unified contract.

## 4. Recommendation

Recommend Option A: one unified sync/site boundary contract with
allowed/forbidden matrices, account-entry handoff rules, release/download/
status linking rules, and source-backed security claim rules.

Why this is the correct fit:

- row #8 is where the Site boundary must become explicit before any Site
  implementation work starts;
- the contract can remain docs-only while still being concrete enough to block
  the three unsafe Site roles identified in the brief;
- the shared table format makes it easy to add future Site domains as allowed
  (with source citations) or forbidden (with rationale).

## 5. Decisions to freeze

### 5.1 Site exposes only public-safe data and metadata

The Site may present:

- account entry points that link into or reuse the shared account/device/
  session contract without bypassing device registration, session checks, or
  admin-claim checks;
- download links and release artifact metadata (version string, file name,
  checksum, release date, changelog summary) that are derived from
  release/distribution sources without hosting live sync payloads or encrypted
  blob content;
- updater metadata links (update endpoint, latest version, min required
  version) that are derived from the release/update authority without exposing
  private device identifiers or account ids;
- public account status messaging (service availability, planned maintenance,
  incident summaries) using operator-safe language without exposing per-device
  sync health, per-user error detail, or user content;
- public sync/security explanations that are grounded in named authority
  documents (see 5.4).

### 5.2 Site must never host or display private data

The Site must never host or display:

- private product state records or user-authored content;
- sync payloads, outbox items, encrypted blob content, nonce values, or
  any piece of a user's synced data;
- service-role credentials, provider API keys, platform secrets, or raw key
  material of any kind;
- admin read models, control-plane state, RBAC claims, audit log entries, or
  operator configuration;
- local-only device state (file paths, bookmarks, window positions, local
  preferences, machine identifiers that are `device-local` per the entity
  scope matrix);
- per-user account identifiers, device identifiers, or session tokens in
  any logged, cached, or publicly visible surface.

### 5.3 Account and auth entry must reuse the shared contract

Site account entry and auth handoff must:

- route account creation, sign-in, and sign-out through the entry points
  defined by `docs/contracts/account-device-identity-contract.md`;
- not invent a separate account, device, or session system;
- not bypass device registration or admin-claim checks;
- not create a Web-to-App or App-to-Site direct sync path outside the
  account cloud topology in ADR-0013 D4.

### 5.4 Public sync/security claims must be source-backed

Any public statement on the Site about sync, encryption, privacy, or security
must be grounded in one or more of:

- ADR-0013 D4 (account cloud topology and `syncScope` governance);
- `docs/TECHNICAL_REQUIREMENTS.md` (AES-256-GCM, deterministic CBOR AAD,
  nonce lease, per-device key wrap, recovery proof, zero-knowledge boundary,
  encrypted blob invariants);
- `docs/workflow/roadmap/sync-v1.md` (paused runtime sync-v1 scope and
  protocol intent);
- existing shipped account-sync contracts (rows #1–#7).

Claims that cannot be traced to one of these sources must be removed or
replaced with neutral factual descriptions.

### 5.5 Release/download/updater-metadata linking rules

- The Site may link to release artifact download URLs and display release
  artifact metadata (version, checksum, date, changelog summary).
- The Site must not become the authoritative source of release artifact
  metadata; the release/distribution system remains the source of truth.
- The Site must not host or proxy sync payloads, encrypted blobs, or
  account-scoped update decisions.
- If the Site later exposes an account-scoped "update available" notice, that
  must consume a safe public update-metadata endpoint, not a private sync
  channel or per-device sync health record.

### 5.6 Site stays PROPOSED; future implementation routes via operator activation

- The `site` module is PROPOSED and owner-deferred per ADR-0013 and
  `docs/PRODUCT_MODULE_MAP.md`.
- No Site implementation, Cloudflare route, deploy config, or branch under
  `codex/site/<feature>` may be created until the operator explicitly activates
  the `site` module.
- This contract row does not constitute operator activation.
- The contract must be cited as the entry-point authority for any future
  `codex/site/<feature>` planning.

### 5.7 No redefinition of prior shipped authorities

This row must not redefine:

- `RepoRecord` or `syncScope` (owned by `data-repository-v0`);
- crypto invariants or encrypted-blob behavior (owned by
  `TECHNICAL_REQUIREMENTS` and `sync-v1`);
- account, device, or session contracts (owned by
  `account-device-identity-contract`);
- admin read models or mutation guardrails (owned by
  `account-sync-admin-read-models`);
- surface adapter responsibilities (owned by `account-sync-surface-adapters`).

## 6. Recommended contract sections

The canonical contract at
`docs/contracts/account-sync-site-entry-contract.md` should contain:

1. normative scope and inherited authorities from rows #1–#7, ADR-0013 D2/D3/D4,
   ADR-0003, `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, and paused `sync-v1`;
2. an allowed Site data and metadata table (see decision 5.1);
3. a forbidden Site data and metadata table (see decision 5.2);
4. an account/auth entry handoff section (see decision 5.3);
5. a release/download/updater-metadata and status-linking section (see decision 5.5);
6. a sync/security claim source section (see decision 5.4);
7. a Site PROPOSED status and implementation gate section (see decision 5.6);
8. verification gates for later `site` activation rows.

## 7. Risks and open questions

| Risk / question | Treatment in this row |
|---|---|
| The contract drifts into Site UX or Cloudflare implementation design | Keep the document at boundary/table level only; no page wireframes, route definitions, or deploy config. |
| Account entry bypasses the shared account/device/session contract | Freeze entry handoff rules explicitly in decision 5.3 and reference `account-device-identity-contract.md`. |
| Public security claims overclaim AES-256-GCM or zero-knowledge without source tracing | Require all claims to cite named authority documents per decision 5.4; remove or neutralize unsupported claims. |
| The Site inadvertently hosts live sync health per user or per device | Freeze public status as operator-safe summaries only in decisions 5.1 and 5.2; no per-device or per-user detail. |
| Release/download metadata links become a proxy for live sync payloads | Freeze that Site links to release artifacts only and must not proxy sync channels or encrypted blob content. |
| Future Site implementation starts before operator activation | Freeze the PROPOSED gate explicitly in decision 5.6 and require this contract to be cited in any future Site planning. |
| Whether account entry should be a separate `site` page or reuse Web auth surface | Deferred to future Site activation row; this contract only requires handoff to the shared account/device/session contract. |
| Which release artifact metadata fields are canonical for the updater | Deferred to the future release/site row; this contract defines the boundary (link/metadata only, no live sync payload). |

## 8. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Allowed Site data table exists | Decision 5.1 and recommended contract section 2 |
| Forbidden Site data table exists | Decision 5.2 and recommended contract section 3 |
| Account/auth entry handoff rule traced to shared contract | Decision 5.3 and recommended contract section 4 |
| Release/download/updater-metadata and status-linking rules exist | Decision 5.5 and recommended contract section 5 |
| Security claims require named authority source | Decision 5.4 and recommended contract section 6 |
| Site PROPOSED gate is explicit | Decision 5.6 and recommended contract section 7 |
| No redefinition of prior shipped authorities | Decision 5.7 and normative scope section |

## 9. Review recommendation

APPROVE one docs-only build phase that:

- adds `docs/contracts/account-sync-site-entry-contract.md`;
- registers it in `docs/contracts/README.md`;
- freezes the allowed/forbidden data tables, account-entry handoff rules,
  release/download/status linking rules, security claim source rules, and the
  Site PROPOSED gate;
- preserves all prior shipped account-sync contracts without redefinition;
- leaves the `site` module PROPOSED and all Site implementation work out of
  scope.

The build must not touch runtime code, redefine `RepoRecord`, `syncScope`,
crypto, device identity, or admin read models, create a Site branch, or
imply that the Site module is now active.
