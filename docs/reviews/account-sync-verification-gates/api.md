# account-sync-verification-gates - API

## Contract Outputs

This docs-only feature does not add a runtime API, typed event, or Tauri
command. Its output is the contract document
`docs/contracts/account-sync-verification-gates.md`.

That contract defines five governance-facing interfaces:

1. master verification gate matrix
2. evidence-lane separation model
3. stage checklist set
4. observability field allowlist and denylist
5. verification receipt and deferred-gate storage rules

## Upstream Interfaces

The contract must consume, not redefine, these authorities:

- `docs/contracts/account-sync-surface-adapters.md`
  - downstream surface responsibilities and sync-state semantics
- `docs/contracts/account-sync-admin-read-models.md`
  - admin RBAC, audit append, browser-secret, and workflow snapshot boundaries
- `docs/contracts/account-sync-site-entry-contract.md`
  - Site public-boundary and source-backed claim requirements
- `docs/contracts/account-sync-workflow-state-contract.md`
  - repository-truth workflow governance and derived-only snapshot rules
- `docs/contracts/data-repository-v0.md`
  - `RepoRecord`, `syncScope`, repository semantics, outbox ownership
- `docs/TECHNICAL_REQUIREMENTS.md`
  - encrypted-blob and crypto invariants
- `docs/workflow/roadmap/sync-v1.md`
  - paused runtime scope and protocol intent
- ADR-0013 D4
  - account-cloud topology and 9-item completeness rule

## Downstream Contract Requirements

### Master verification gate matrix

Must specify, per gate:

- what must be proven;
- which prior authority it traces to;
- which evidence lane or lanes are required;
- what counts as a blocker or deferred gate.

Minimum gates:

- D4 completeness
- repository driver/store mapping
- device-local outbox exclusion
- push/pull protocol invariants
- conflict shadow and explicit merge routing
- admin RBAC/audit/secret boundary
- Site public-boundary and claim traceability
- workflow repository-truth preservation
- two-device convergence
- observability privacy

### Evidence-lane separation model

Must specify these lanes:

- mocked contract tests
- Docker/Postgres tests
- browser IndexedDB tests
- desktop SQLite/SQLCipher tests
- live external or two-device tests

Must not allow one lane to silently substitute for another.

### Stage checklist set

Must specify separate checklists for:

- design review and feature-plan intake
- feature-verify
- pre-ship
- live rollout

Each checklist must define the minimum evidence or the required deferral label.

### Observability field allowlist and denylist

Must specify:

- allowed telemetry fields and safe examples;
- forbidden fields and why they are forbidden;
- that raw device ids, private entity ids, payloads, secrets, and key material
  never enter observability output.

### Verification receipt storage rules

Must specify:

- review artifacts remain git-tracked repository truth;
- dashboards may summarize but not replace review artifacts;
- deferred-gate notes and live rollout receipts must link back to the source
  review artifact.

## Error Semantics

The contract describes governance outcomes, not a new protocol error system.
Minimum meanings to preserve:

- pass
- blocked
- deferred_gate
- insufficient_evidence
- forbidden_observability_field
- device_local_outbox_violation

These are documentation semantics only. Runtime error catalogs remain owned by
their existing authorities.

## Permission Notes

- This row grants no new runtime read or write permissions.
- Admin, Site, and Workflow checks inherit their upstream control-plane,
  public-boundary, and repository-truth restrictions.
- Live rollout evidence may summarize health and status, but may not expose
  payloads, secrets, or key material.

## Idempotency Notes

- Repeated verification runs may append new receipts, but do not replace the
  underlying authoritative source artifacts.
- This row does not define a new mutation identity or transport contract.
