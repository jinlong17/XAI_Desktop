# Account Sync Admin Read Models Contract

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #7 |
| Applies to | Admin Dashboard, Site status surfaces, Workflow snapshots, account/sync control-plane integrations |
| Builds on | `docs/contracts/account-cloud-sync-architecture.md`, `docs/contracts/account-sync-entity-scope-matrix.md`, `docs/contracts/account-device-identity-contract.md`, `docs/contracts/account-sync-local-first-boundaries.md`, `docs/contracts/account-sync-protocol-surface-contract.md`, `docs/contracts/account-sync-surface-adapters.md`, `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md`, ADR-0013 D4 |

## 1. Purpose

This contract freezes how a future isolated Admin Dashboard obtains one unified
control-plane data source from Account Cloud Sync and adjacent account
infrastructure.

It defines:

- the typed admin read-model catalog for account, device, organization,
  usage/quota/billing, feature-flag, provider-status, sync-health, audit, and
  operational-queue domains;
- which shipped authority owns each domain and which domains remain explicitly
  deferred;
- the browser-secret and payload boundary for control-plane surfaces;
- the mandatory mutation guard stack for any admin write path;
- the rule that workflow/release/dev-log state remains repository truth even if
  the control plane later displays derived summaries.

This document does not authorize Admin implementation, unpause runtime
`sync-v1`, redefine `RepoRecord`, redefine `syncScope`, or expose encrypted user
payload plaintext to browser-delivered code.

## 2. Normative scope and inherited authorities

1. `docs/contracts/account-cloud-sync-architecture.md` remains the authority
   for sync as shared infrastructure and Admin as a downstream read-model
   consumer rather than a payload authority.
2. `docs/contracts/account-sync-entity-scope-matrix.md` remains the authority
   for separating user payload classes, control-plane read models, mixed
   records, and local-only records.
3. `docs/contracts/account-device-identity-contract.md` remains the authority
   for account/device/session/admin-claim boundaries and secret-handling rules.
4. `docs/contracts/account-sync-protocol-surface-contract.md` remains the
   authority for push/pull/conflict/retry/manual-sync semantics and the health
   metadata that read models may summarize.
5. `docs/contracts/account-sync-surface-adapters.md` remains the authority that
   Admin is a downstream metadata consumer and not a direct sync or payload
   adapter.
6. `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`,
   and `docs/workflow/roadmap/sync-v1.md` remain the sole authorities for
   `RepoRecord`, `syncScope`, encrypted blobs, nonce lease, crypto, and runtime
   sync semantics.
7. ADR-0013 D4 remains the topology rule: Web and App do not sync to each
   other; both sync through one account cloud layer.
8. The `admin` product module remains PROPOSED. This contract is a control-
   plane boundary document only.

## 3. Control-plane data-source rules

| Rule | Contract |
|---|---|
| Unified source | Admin consumes a unified view through server-side read models and guarded control-plane APIs, not by reading product payload stores directly. |
| Metadata only | Admin may read metadata, counters, summaries, status, policy state, and projections. It must not read encrypted user payload plaintext. |
| Browser least privilege | Browser-delivered admin code may receive safe summaries, status values, and opaque handles only where required. It must never receive service-role credentials, provider raw secrets, raw key material, or plaintext payload data. |
| Deferred honesty | If a domain lacks an approved or stable source of truth, this contract marks it deferred instead of inventing semantics. |
| Workflow truth | Roadmap manifests, `dev_log.md`, release logs, and ADRs remain git-tracked truth. Admin may only display derived snapshots. |

## 4. Admin read-model catalog

| Domain | Source of truth | Freshness model | Privacy boundary | RBAC scope | Mutation note |
|---|---|---|---|---|---|
| Accounts | account/auth service plus account-control metadata | near-real-time on auth/control changes | metadata only; no raw user payloads | `admin.account.read` | guarded mutations only through separate account-control actions |
| Organizations | account/org membership service or projected org ledger | eventual within control-plane SLA | membership and plan metadata only | `admin.org.read` | membership/ownership changes are guarded mutations |
| Devices | device registry, device status, revoke/rekey projections | near-real-time after device events | device metadata only; use hashed/scoped identifiers where raw ids are unnecessary | `admin.device.read` | revoke/quarantine/rekey actions are guarded mutations |
| Sync health | sync protocol metrics, retry/dead-letter/conflict counters, cursor and queue summaries | near-real-time to periodic poll | status and counts only; never payload plaintext | `admin.sync.read` | remediation actions are guarded mutations or deferred |
| Usage | AI/product usage telemetry projections | periodic aggregation | aggregated or scoped operator-safe usage only | `admin.usage.read` | read-only in this row |
| Quotas | quota policy store and derived consumption state | near-real-time or bounded poll | policy + consumption metadata only | `admin.quota.read` | quota overrides require guarded mutations |
| Billing state | billing/subscription/dunning projection | bounded poll or webhook-driven refresh | billing metadata only; never raw processor secrets | `admin.billing.read` | billing control actions require guarded mutations and may remain deferred |
| Feature flags | feature-governance store | near-real-time or config refresh | flag metadata and rollout state only | `admin.flags.read` | rollout/override changes require guarded mutations |
| Provider status | provider-health, model-availability, cost ceiling, secret-handle status projections | bounded poll | summaries and safe handles only; never provider raw secrets | `admin.provider.read` | provider-routing changes require guarded mutations and may remain partially deferred |
| Audit | append-only admin audit log | append immediately, read near-real-time | control-plane event metadata only | `admin.audit.read` | append-only; no mutation beyond retention/governance controls |
| Operational queues | remediation queues, failed jobs, pending confirmations, deferred actions | near-real-time to bounded poll | queue metadata only | `admin.ops.read` | queue actions require guarded mutations |
| Workflow snapshots | derived projections from repo-truth roadmap/dev-log/release artifacts | eventual snapshot | repository-derived state only | `admin.workflow.read` | read-only; cannot become authoritative |

## 5. Source-system map

| Domain group | Authoritative source | Allowed admin exposure | Explicit exclusions |
|---|---|---|---|
| Account and organization metadata | auth/account/org control services | identity, role, membership, plan, account health summaries | no passwords, refresh tokens, or private session secrets |
| Device and sync metadata | device registry, sync protocol projections, retry/conflict/dead-letter summaries | device counts, status, queue summaries, sync health, remediation needs | no DEK/KEK, device private key, nonce details beyond operator-safe summaries, or payload plaintext |
| Billing, quota, and usage | billing processor projections, quota policy store, usage telemetry | subscription state, quota caps/usage, dunning state, aggregate usage | no processor secrets, raw webhook secrets, or unrelated user payloads |
| Feature-flag and provider governance | rollout/config service, provider health projections, cost-policy store | flag state, rollout cohort summaries, provider availability, safe secret-handle status | no provider raw API keys, service-role credentials, or model prompts/payloads |
| Workflow and release metadata | git-tracked roadmap/dev-log/release files rendered into snapshots | operator summaries and navigation links | no rewrite of repository truth, no cloud-only canonical workflow status |

## 6. Browser-secret and payload boundary

Admin browser code must never receive any of the following:

- service-role credentials;
- provider raw secrets or raw API keys;
- refresh tokens outside approved HttpOnly/session-control patterns;
- raw KEK/DEK/device private key or recovery material;
- encrypted user payload plaintext or raw product-record blobs;
- private workflow artifacts that are not already approved for operator
  visibility.

Admin browser code may receive:

- operator-safe summaries and counters;
- claim-scoped control-plane projections;
- opaque handles or boolean status for secret presence/health when required;
- explicit mutation results and audit receipts.

## 7. Admin mutation guardrails

Every admin mutation described by this contract must satisfy all of the
following:

1. **RBAC / claim check** — the request is denied unless the actor holds the
   required admin claim and scoped permission.
2. **High-risk confirmation** — destructive or security-sensitive actions
   require explicit confirmation such as type-to-confirm or equivalent
   operator-affirmation flow.
3. **Append-only audit write** — the mutation appends a control-plane audit
   event before reporting completion.
4. **Explicit result contract** — the caller receives a typed success/failure
   outcome; silent best-effort behavior is forbidden.
5. **Upstream authority preservation** — the action must not bypass existing
   account/device/protocol/source-of-truth contracts.

### Minimum mutation result categories

- success
- denied_by_rbac
- confirmation_required
- deferred_unavailable
- failed_retryable
- failed_terminal

## 8. Admin audit separation and integrity

Admin audit is a dedicated control-plane stream, not a projection of user sync
mutation history.

Required properties:

- append-only semantics;
- immutable actor/action/target/result/timestamp metadata;
- separate storage or logical stream from end-user sync audit;
- compatibility with existing audit-log-integrity precedent where practical,
  such as chain/hash discipline and tamper-evident ordering;
- operator-facing readability without exposing encrypted user payload
  plaintext.

Forbidden treatment:

- mixing admin control actions into end-user sync history;
- mutating or deleting prior audit rows as part of normal operations;
- treating audit as an implementation detail outside the control-plane
  contract.

## 9. Deferred-domain rules

If a read-model or mutation domain lacks a stable and approved authority today,
the contract must mark it deferred.

Deferred is appropriate when:

- the source system is not yet operator-approved;
- the source system exists only as a proposed lane;
- exposing even summarized data would currently violate the browser-secret
  boundary;
- workflow semantics are not yet reconciled with repository-truth policy.

Deferred is not permission to invent stopgap sources of truth inside the Admin
surface.

## 10. Verification gates for later runtime rows

Any later implementation row that claims to satisfy this contract must prove all
of the following:

- browser bundles contain no service-role credentials, provider raw secrets, or
  encrypted user payload plaintext;
- admin routes deny access without the required claim and RBAC scope;
- high-risk actions require explicit operator confirmation;
- every mutation appends a control-plane audit record and returns an explicit
  result;
- admin audit remains append-only and separate from user sync audit;
- workflow and release snapshots remain derived from repository truth;
- deferred domains remain deferred until their upstream authority is approved.

## 11. Non-goals

- No Admin Dashboard implementation.
- No activation of `admin` or `site` implementation branches.
- No new runtime sync protocol, crypto, or payload contract.
- No redefinition of `RepoRecord`, `syncScope`, or device identity.
- No browser access to service-role credentials, provider raw secrets, or user
  encrypted payload plaintext.

