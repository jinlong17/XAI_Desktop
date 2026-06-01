# Discovery Review - account-sync-admin-read-models

| Field | Value |
|---|---|
| Feature | account-sync-admin-read-models |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #7 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for a docs-only contract that defines how Admin
Dashboard obtains a unified data source from Account Cloud Sync and adjacent
account infrastructure without exposing browser-visible secrets or encrypted
user payload plaintext.

Required coverage:

- admin read models for accounts, devices, organizations, usage, quotas,
  billing state, feature flags, provider status, sync health, audit, and
  operational queues;
- clear source mapping for which data comes from account/sync metadata, which
  comes from billing or AI governance systems, and which remains deferred;
- strict separation between admin audit and user sync audit;
- mandatory guardrails on admin mutations: RBAC, high-risk confirmation,
  append-only audit, and explicit success/failure results.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` already positions sync as
  shared infrastructure and says Admin consumes server-side read models rather
  than raw user payloads.
- `docs/contracts/account-sync-entity-scope-matrix.md` already classifies
  admin read models as control-plane read projections, not user payload
  authorities.
- `docs/contracts/account-device-identity-contract.md` already freezes account,
  device, session, admin-claim, and secret-boundary rules.
- `docs/contracts/account-sync-protocol-surface-contract.md` already freezes
  push/pull/conflict/retry/manual-sync semantics and keeps user payload storage
  encrypted-envelope-only.
- `docs/contracts/account-sync-surface-adapters.md` already says Admin remains
  a downstream metadata consumer and not a product payload authority.
- `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, and
  `docs/workflow/roadmap/sync-v1.md` already own `RepoRecord`, `syncScope`,
  crypto, encrypted blobs, nonce lease, and protocol invariants.
- ADR-0013 D4 already freezes the Web <-> account cloud <-> App topology.
- The `admin` product module remains PROPOSED, so this row must stay
  docs/contracts only and must not activate implementation work.

## 2. Canonical naming and output shape

Canonical feature name: `account-sync-admin-read-models`.

Title: Account Sync admin read models.

Naming rationale:

- the roadmap row and seed brief are centered on Admin’s unified control-plane
  data source;
- the scope is narrower than full admin-system integration and broader than any
  one billing or audit subdomain;
- the output is a shared contract that later `admin`, `site`, and `workflow`
  rows can cite without reopening sync protocol or secret-handling rules.

Selected shape: one canonical contract under `docs/contracts/` plus review
artifacts under `docs/reviews/account-sync-admin-read-models/`.

Rejected shapes:

- runtime admin UI or API implementation: rejected because the lane remains
  PROPOSED and this row is docs-only;
- merging the contract into `account-sync-surface-adapters.md`: rejected
  because row #6 already states Admin is downstream and row #7 needs its own
  read-model and mutation-guard authority;
- defining raw payload access paths for Admin: rejected because the requirement
  explicitly forbids encrypted payload plaintext and browser-visible secrets.

## 3. Candidate options

### Option A - One shared admin read-model contract with per-domain matrices

Create one shared contract at `docs/contracts/account-sync-admin-read-models.md`
that defines each admin domain as a read-model projection with source,
freshness, privacy boundary, RBAC scope, and mutation guardrails.

Pros:

- one authority for later `admin`, `site`, and `workflow` rows;
- keeps secret boundaries and audit rules consistent;
- clearly separates shipped authorities from deferred domains.

Cons:

- the contract must be disciplined enough not to drift into UI or service design
  details.

### Option B - Split by source system

Write separate contracts for account/device, billing/quota, AI/provider, and
audit/operations.

Pros:

- each source domain stays narrow.

Cons:

- no unified control-plane authority for later admin work;
- increased risk of inconsistent privacy or mutation rules across domains;
- conflicts with the roadmap row’s singular focus on Admin’s unified data
  source.

### Option C - Defer all read-model specifics until admin activation

Only state high-level boundaries and postpone the actual catalog.

Pros:

- lowest short-term commitment.

Cons:

- too weak to guide future admin/system-integration rows;
- secret, audit, and workflow-source-of-truth boundaries would remain fuzzy.

## 4. Recommendation

Recommend Option A: one shared admin read-model contract with per-domain
matrices and explicit mutation/audit guardrails.

Why this is the correct fit:

- row #7 is where Admin’s data-source boundary must become explicit before any
  control-plane implementation work;
- the contract can remain docs-only while still being concrete enough to block
  bad future designs;
- the shared matrix format makes it easy to say which domains are already
  supported by shipped account/sync authorities and which remain deferred.

## 5. Decisions to freeze

### 5.1 Admin reads metadata and projections, never user payload plaintext

Admin consumes server-side metadata, counters, derived status, and audit
projections. It never reads encrypted user payload plaintext, raw product
records, or raw secret material in browser-delivered code.

### 5.2 One typed read-model catalog per control-plane domain

The canonical contract should define one row per admin domain:

- accounts;
- organizations;
- devices;
- sync health;
- usage;
- quotas;
- billing state;
- feature flags;
- provider status;
- audit;
- operational queues;
- workflow/release metadata as a derived support domain, if included.

Each domain should record source of truth, refresh model, privacy boundary,
RBAC scope, and whether mutations are allowed or deferred.

### 5.3 Admin mutations are always guarded control-plane actions

Any admin mutation described by the contract must require:

1. RBAC/claim validation;
2. high-risk confirmation for dangerous actions;
3. append-only admin audit write;
4. explicit success/failure result;
5. no bypass of existing account/device/protocol authorities.

### 5.4 Admin audit is separate from user sync audit

The contract should freeze:

- admin audit is a distinct append-only control-plane stream;
- it may reuse audit-log-integrity precedent such as chain/hash discipline and
  immutable event semantics;
- it must not be merged into or confused with end-user sync mutation history.

### 5.5 Repository truth stays outside the cloud control plane

Roadmap rows, `dev_log.md`, ADRs, and release logs remain repository truth.
Admin may consume derived snapshots or summaries, but the control plane must
not replace git-tracked workflow state as the source of truth.

### 5.6 Deferred domains stay explicit

If a domain lacks a stable owner or approved source system today, the contract
should mark it deferred rather than inventing a fake authority. This is likely
for some provider-status, dunning, or operations-queue details.

## 6. Recommended contract sections

The canonical contract should contain:

1. normative scope and inherited authorities from rows #1-#6,
   `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, `sync-v1`, and ADR-0013 D4;
2. an admin read-model catalog matrix with per-domain source/freshness/privacy/
   RBAC fields;
3. a source-system map separating account/sync metadata, billing/quota/usage,
   AI/provider governance, workflow snapshots, and deferred domains;
4. an admin mutation guardrail section covering RBAC, confirmation, audit, and
   result semantics;
5. an admin-audit integrity section that keeps audit append-only and separate
   from user sync audit;
6. a browser-secret and payload boundary section;
7. verification gates for later runtime rows.

## 7. Risks and open questions

| Risk / question | Treatment in this row |
|---|---|
| The contract drifts into admin implementation design | Keep it at read-model, source, guardrail, and verification-gate level only. |
| Browser bundles accidentally receive provider or service secrets | Freeze a browser-secret prohibition section with server-only summaries/status handles. |
| Admin audit and user sync audit get mixed together | Make separation an explicit invariant and reuse integrity precedent only structurally. |
| Workflow status becomes cloud-authoritative | Keep repo files as the only workflow truth and treat admin/workflow views as derived snapshots. |
| Source systems for billing/provider/ops are not all stable yet | Mark uncertain domains as deferred and keep the contract honest about current authorities. |

## 8. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Typed admin read-model catalog exists | Recommended contract sections 2 and 3 |
| Source-system split is explicit | Decisions 5.2 and 5.6 |
| Browser never gets service-role credentials, provider secrets, or payload plaintext | Decisions 5.1 and recommended contract section 6 |
| Admin mutations require RBAC, confirmation, audit, and result semantics | Decision 5.3 and recommended contract section 4 |
| Admin audit stays append-only and separate from user sync audit | Decision 5.4 and recommended contract section 5 |
| Workflow/dev-log/release-log remain repository truth | Decision 5.5 |

## 9. Review recommendation

APPROVE one docs-only build phase that:

- adds `docs/contracts/account-sync-admin-read-models.md`;
- registers it in `docs/contracts/README.md`;
- defines the unified admin read-model catalog and deferred-domain map;
- freezes mutation guardrails, audit separation, browser-secret boundaries, and
  workflow-source-of-truth rules;
- leaves the `admin` lane PROPOSED and all runtime implementation work out of
  scope.
