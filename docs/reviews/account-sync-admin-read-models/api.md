# account-sync-admin-read-models - API

## Contract Outputs

This docs-only feature does not add a runtime API, typed event, or Tauri
command. Its output is the contract document
`docs/contracts/account-sync-admin-read-models.md`.

That contract should define four interface groups:

1. admin read-model catalog
2. source-system and freshness map
3. admin mutation guardrail contract
4. browser-secret, audit, and workflow-truth boundary contract

## Upstream Interfaces

The contract must consume, not redefine, these authorities:

- `docs/contracts/account-cloud-sync-architecture.md`
  - sync as shared infrastructure
  - admin as downstream read-model consumer
- `docs/contracts/account-sync-entity-scope-matrix.md`
  - admin read models as control-plane projections
  - user payload versus control-plane class separation
- `docs/contracts/account-device-identity-contract.md`
  - account/device/session/admin-claim boundaries
  - secret and credential boundary rules
- `docs/contracts/account-sync-protocol-surface-contract.md`
  - sync-health, retry, conflict, and queue semantics that later read models
    may summarize
- `docs/contracts/account-sync-surface-adapters.md`
  - admin remains downstream metadata consumer, not payload authority
- `docs/contracts/data-repository-v0.md`
  - `RepoRecord`
  - `syncScope`
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
  - crypto and encrypted-blob invariants
- ADR-0013 D4
  - shared account cloud topology

## Downstream Contract Requirements

### Admin read-model catalog

Must specify, for each domain:

- canonical domain name;
- source of truth;
- expected freshness model;
- privacy boundary;
- RBAC scope;
- mutation capability: read-only, guarded mutation, or deferred.

Minimum planned domains:

- accounts
- organizations
- devices
- sync health
- usage
- quotas
- billing state
- feature flags
- provider status
- audit
- operational queues

### Source-system map

Must separate:

- account/sync server metadata;
- billing/quota/usage telemetry;
- provider/AI governance summaries;
- workflow/release snapshots;
- explicitly deferred domains.

### Admin mutation guardrail contract

Must specify:

- RBAC or claim check requirement;
- high-risk confirmation requirement when applicable;
- append-only audit requirement;
- explicit success/failure result requirement.

Must not specify:

- unaudited silent mutation paths;
- direct browser-side access to service-role APIs or secrets;
- mutation semantics that bypass account/device/protocol authorities.

### Browser-secret and payload boundary contract

Must specify:

- browser-visible admin code may receive summaries, handles, or health/status
  projections only where safe;
- browser-visible admin code must never receive service-role credentials,
  provider raw secrets, raw key material, or user encrypted payload plaintext.

## Error Semantics

The contract should define control-plane result categories, not invent a new
wire protocol:

- success;
- denied by RBAC or claim scope;
- confirmation required;
- deferred/not yet implemented;
- failed with explicit operator-facing reason;
- unavailable because the source system is degraded or paused.

## Permission Notes

- Admin route access is claim-gated and RBAC-gated.
- Browser-delivered admin code is a least-privilege consumer of server-side
  read models and mutation results.
- Source systems may remain server-only even when their health/status is
  exposed through read models.

## Idempotency Notes

- This row does not define a second mutation identity model.
- Admin actions that touch existing account/device/sync authorities inherit the
  idempotency and audit semantics of those upstream systems.
- Repeated read-model refreshes must be pure reads, not implied mutations.
