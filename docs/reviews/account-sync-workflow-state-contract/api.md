# account-sync-workflow-state-contract - API

## Contract Outputs

This docs-only feature does not add a runtime API, typed event, or Tauri
command. Its output is the contract document
`docs/contracts/account-sync-workflow-state-contract.md`.

That contract should define three governance-facing interfaces:

1. workflow artifact separation matrix
2. cross-domain read-model declaration schema
3. deferred hook-point catalog

## Upstream Interfaces

The contract must consume, not redefine, these authorities:

- `docs/contracts/account-cloud-sync-architecture.md`
  - sync as shared infrastructure
  - downstream consumer boundaries
- `docs/contracts/account-sync-surface-adapters.md`
  - Workflow as downstream metadata consumer
- `docs/contracts/account-sync-admin-read-models.md`
  - workflow snapshots as derived control-plane projections
  - browser-secret and payload boundary
- `docs/contracts/data-repository-v0.md`
  - `RepoRecord`
  - `syncScope`
  - repository behavior
- `docs/TECHNICAL_REQUIREMENTS.md`
  - crypto and encrypted-blob invariants
- `docs/workflow/roadmap/sync-v1.md`
  - paused runtime sync scope
- ADR-0013 D4
  - account-cloud topology and governance

## Downstream Contract Requirements

### Workflow artifact separation matrix

Must specify:

- which workflow artifact classes remain repository truth;
- which derived summaries are allowed to leave the repo as operator-visible
  metadata;
- that workflow artifacts are not account-sync payload entities and may not
  enter outbox or blob flows.

Must not specify:

- a new storage engine;
- a new mutable workflow database;
- any reclassification of workflow artifacts into `RepoRecord` or
  `syncScope: account-sync`.

### Cross-domain read-model declaration schema

Must specify:

- required source declaration per field or domain;
- required refresh cadence or snapshot model;
- required authority declaration such as repository-truth, server-truth, or
  derived-only.

Must not specify:

- a runtime transport or event bus;
- an implementation-specific JSON API;
- any permission bypass around the existing admin read-model boundary.

### Deferred hook-point catalog

Must specify:

- release-log aggregation hook intent;
- roadmap-state snapshot hook intent;
- verification summary hook intent;
- sync-health summary hook intent.

Must not specify:

- implementation of those hooks;
- mutation rights over the underlying workflow artifacts;
- runtime unpause of `sync-v1`, `admin`, or `site`.

## Error Semantics

The contract should describe governance outcomes, not invent new protocol error
codes. Minimum meanings to preserve:

- repository_truth_only
- derived_snapshot_allowed
- source_declaration_required
- forbidden_secret_or_payload_exposure
- forbidden_account_sync_reclassification
- deferred_not_implemented

These are documentation semantics only. Runtime error catalogs remain owned by
their existing authorities.

## Permission Notes

- Workflow viewers may consume derived metadata only.
- Account/product payload authority remains outside workflow artifacts.
- Control-plane or dashboard consumers still inherit the browser-secret and
  RBAC boundaries from the admin read-model contract.
- This row grants no new permission to mutate roadmap manifests, `dev_log.md`,
  release logs, or ADRs through cloud-owned state.

## Idempotency Notes

- Derived workflow snapshots must remain pure readers of authoritative sources.
- Repeated snapshot generation must not create new workflow truth or mutate the
  source artifacts.
- This row must not define a second mutation identity model beside existing
  repository and protocol authorities.
