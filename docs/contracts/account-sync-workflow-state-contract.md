# Account Sync Workflow State Contract

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #9 |
| Applies to | Workflow systems, roadmap manifests, release logs, verification receipts, developer dashboards, admin workflow snapshots |
| Builds on | `docs/contracts/account-cloud-sync-architecture.md`, `docs/contracts/account-sync-surface-adapters.md`, `docs/contracts/account-sync-admin-read-models.md`, `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md`, ADR-0013 D4 |

## 1. Purpose

This contract freezes how repository-truth workflow artifacts may share
account/sync status as derived metadata without creating a second mutable state
system beside the repository.

It defines:

- which workflow artifact classes remain repository truth;
- how developer workflow state is separated from user/product account data;
- what a cross-domain workflow dashboard or read model must declare about
  source, refresh cadence, and authority;
- which data is forbidden from workflow-visible state;
- which future hook points are allowed only as deferred read-only derived
  exposures.

This document does not authorize runtime sync implementation, unpause
`sync-v1`, redefine `RepoRecord`, redefine `syncScope`, redefine crypto, or let
Account Cloud Sync overwrite roadmap manifests, `dev_log.md`, release logs, or
ADRs.

## 2. Normative scope and inherited authorities

1. `docs/contracts/account-cloud-sync-architecture.md` remains the authority
   for sync as shared infrastructure and Workflow as a downstream metadata
   consumer rather than a payload authority.
2. `docs/contracts/account-sync-surface-adapters.md` remains the authority that
   Workflow is a downstream metadata consumer and not a Web/App/Plugin adapter.
3. `docs/contracts/account-sync-admin-read-models.md` remains the authority for
   browser-secret boundaries, control-plane workflow snapshots, and derived-only
   admin exposure.
4. `docs/contracts/data-repository-v0.md` remains the sole authority for
   `RepoRecord`, `syncScope`, repository semantics, and driver behavior.
5. `docs/TECHNICAL_REQUIREMENTS.md` and
   `docs/workflow/roadmap/sync-v1.md` remain the sole authorities for encrypted
   blobs, nonce lease, crypto, device-bound sync semantics, and runtime sync
   behavior.
6. ADR-0013 D4 remains the topology rule: account-sync work builds on
   `syncScope`, and this row does not replace development workflow governance
   with cloud-owned sync state.
7. Workflow artifacts remain git-tracked repository truth even if later
   dashboards, release tooling, or admin read models display derived summaries
   from them.

## 3. Workflow truth model

| Artifact class | Authoritative source | Allowed derived exposure | Forbidden treatment |
|---|---|---|---|
| Roadmap manifests | Git-tracked manifest files under `docs/workflow/roadmap/` | operator-facing summary or status snapshot with explicit source/cadence/authority declaration | cloud-owned mutable source of truth; account-sync payload; outbox or encrypted-blob entry |
| `dev_log.md` state | feature or bug workflow `dev_log.md` files | operator-facing workflow summary, shipping queue, or verify status snapshot | cloud-owned mutable workflow database; account-sync entity; hidden status override |
| Release logs and ship receipts | git-tracked release-log files and ship commits | operator-facing release summary or shipping history snapshot | direct account-sync payload; mutable dashboard-only replacement |
| ADRs and contract docs | git-tracked docs under `docs/adr/` and `docs/contracts/` | citation-backed dashboard or workflow guidance summary | workflow runtime state store; payload source |
| Verification receipts | git-tracked verify artifacts in review dirs | operator-facing verification summary or badge derived from the stored receipt | replacing the underlying receipt; pushing raw logs or payload data into workflow state |
| Dashboard source snapshots | committed prototype or documentation files | rendered operator-visible view of the committed source | cloud-owned writable dashboard state that supersedes repo content |

Normative rules:

1. Every authoritative workflow artifact remains repository-local and git
   tracked.
2. Derived exposures may summarize workflow state but do not become the
   authority for that state.
3. Workflow state is not a `RepoRecord` and must never be assigned
   `syncScope: account-sync`.
4. Workflow artifacts must never enter account-sync outboxes, encrypted blobs,
   sync cursors, or conflict handling flows.

## 4. Product-data versus workflow-state separation

| Data class | Category | Authority | Workflow visibility |
|---|---|---|---|
| Account, device, sync-health, usage, quota, provider, and other product or control-plane metadata | user/product account or control-plane data | upstream account/sync/admin authorities | may appear in workflow-facing views only as declared derived metadata |
| Roadmap phases, review verdicts, build/verify status, release-log state, ship receipts, ADR decisions | developer workflow state | repository-truth workflow artifacts | visible to operators through repository files or declared derived summaries only |
| Encrypted user payloads, private user content, raw protocol envelopes | private payload data | product data stores and crypto authorities | never visible in workflow state |
| Secrets, service-role credentials, provider raw keys, key material, raw logs | secret or unsafe operational data | dedicated secret or log systems | never visible in workflow state |

Required separation rules:

1. User/product account data and developer workflow state must be represented
   as separate classes in every dashboard, workflow export, or admin snapshot.
2. Workflow status must not be used as a substitute source for product account
   or sync-health truth; product metadata must still cite its upstream source.
3. Product account data must not be copied into workflow artifacts beyond the
   minimum declared derived metadata required for operator understanding.

## 5. Cross-domain read-model declaration schema

Any dashboard, control-plane view, or workflow export that mixes workflow state
with account/sync metadata must declare at least the following fields for each
rendered domain or field group:

| Declaration field | Requirement |
|---|---|
| Source | Name the authoritative upstream system or file path |
| Refresh cadence | State whether the value is real-time, bounded poll, manual snapshot, or commit-time generated |
| Authority | Declare whether the value is repository-truth, server-truth, or derived-only |
| Scope | State whether the value represents developer workflow state or user/product account data |

Minimum examples:

- a workflow dashboard card showing `row #9 = READY_TO_SHIP` must cite the
  feature `dev_log.md` as repository-truth;
- a card showing sync-health counts alongside that workflow status must cite the
  sync-health projection source separately and mark the view as mixed-domain;
- a release-log summary may cite release-log markdown as repository-truth and
  derived sync-health as server-truth or derived-only, but it may not collapse
  both into one undeclared status field.

## 6. Forbidden workflow-visible state

Workflow-visible state must not contain any of the following:

- private user payloads or encrypted payload plaintext;
- raw encrypted envelopes, nonce values, or cursor internals beyond operator-
  safe summary counts;
- service-role credentials, provider raw secrets, or raw API keys;
- DEK, KEK, device private key, recovery material, or equivalent key material;
- raw logs or unbounded log payloads;
- mutable copies of roadmap manifests, `dev_log.md`, release logs, ADRs, or
  verification receipts that supersede the repository source.

Allowed workflow-visible data is limited to operator-safe summaries, derived
counts, typed status values, links back to authoritative files, and explicitly
declared mixed-domain read-model projections.

## 7. Deferred hook-point catalog

The following hook points are allowed only as deferred read-only derived
exposures in this row:

| Hook point | Intended use | Current status |
|---|---|---|
| `release_log_aggregation` | summarize release-log or ship state for operators | deferred; no implementation in this row |
| `roadmap_state_snapshot` | summarize roadmap wave or row state from manifest truth | deferred; no implementation in this row |
| `verification_summary_feed` | surface verify receipt state or blocker counts | deferred; no implementation in this row |
| `sync_health_workflow_snapshot` | show sync-health summaries next to workflow progress | deferred; no implementation in this row |

Rules:

1. Hook points are read-only projections over authoritative sources.
2. Hook points do not authorize new workflow storage systems.
3. Hook-point implementation belongs to later owning-module rows, not this
   docs-only governance row.

## 8. Verification gates for later implementation rows

Any later implementation row claiming this contract must prove all of the
following:

- repository-truth workflow artifacts remain the authority after the feature is
  installed or shipped;
- workflow state never enters account-sync outboxes, encrypted blobs, or any
  `RepoRecord`/`syncScope` path;
- mixed-domain dashboards declare source, cadence, authority, and scope for all
  rendered data classes;
- workflow-visible state contains no secrets, raw logs, private payloads, or
  encrypted payload plaintext;
- derived snapshots link back to their authoritative sources and do not replace
  them;
- any admin or site consumer still respects the existing browser-secret and
  control-plane boundary contracts.

## 9. Non-goals

- No runtime sync-v1 implementation or unpause.
- No new `RepoRecord`, `syncScope`, event contract, or Tauri command.
- No dashboard, release-log, or roadmap aggregation service implementation.
- No mutation path that rewrites roadmap manifests, `dev_log.md`, release logs,
  ADRs, or dashboard source snapshots as cloud-owned state.
- No exposure of secrets, raw logs, private payloads, or encrypted payload
  plaintext in workflow-visible state.
