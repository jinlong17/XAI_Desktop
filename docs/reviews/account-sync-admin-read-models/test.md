# account-sync-admin-read-models - Test Plan

## Planning-Phase Validation

This feature-plan run is docs-only. No runtime/unit/manual product tests are
required at the planning step.

The planning artifacts should be reviewed for:

- authority traceability back to rows #1-#6, ADR-0013 D4,
  `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, and paused `sync-v1`;
- complete admin read-model domain coverage;
- explicit browser-secret and encrypted-payload prohibitions;
- explicit admin-audit separation from user sync audit;
- explicit guarded-mutation requirements;
- preservation of repository-truth workflow state.

## Build-Phase Acceptance Checks

When the docs-only build phase creates
`docs/contracts/account-sync-admin-read-models.md`, review it against these
gates:

- the contract includes a domain matrix covering accounts, organizations,
  devices, sync health, usage, quotas, billing state, feature flags, provider
  status, audit, and operational queues;
- each domain row includes source, freshness, privacy boundary, RBAC scope, and
  mutation/deferred notes;
- the contract clearly separates account/sync metadata, billing/quota/usage,
  provider/AI governance, workflow snapshots, and deferred domains;
- the contract explicitly forbids browser delivery of service-role credentials,
  provider raw secrets, and encrypted user payload plaintext;
- the contract explicitly separates admin audit from user sync audit and keeps
  admin audit append-only;
- the contract defines RBAC, high-risk confirmation, audit append, and explicit
  success/failure as the mutation guard stack;
- the contract is registered in `docs/contracts/README.md`.

## Later Runtime Verification Matrix

This row should require later implementation rows to prove:

- browser bundles contain no service-role credentials, provider raw secrets, or
  encrypted user payload plaintext;
- admin routes deny access without the correct claim and RBAC scope;
- high-risk admin actions require operator confirmation and produce auditable
  outcomes;
- admin audit writes are append-only and distinct from user sync audit streams;
- workflow/release status remains derived from repository truth rather than
  becoming a mutable control-plane source.

## Mock Strategy

- `Deferred Integration` for any read-model domain whose source system is not
  yet stable, operator-approved, or clearly owned by a shipped contract.
- The contract may name those domains, but must mark them deferred instead of
  inventing runtime-ready semantics.

## Commands

No mandatory test command runs for the planning phase.

Recommended verification during later build/verify phases:

```bash
git diff --check -- docs/contracts/README.md docs/contracts/account-sync-admin-read-models.md docs/reviews/account-sync-admin-read-models
rg -n "service-role|provider|payload plaintext|RBAC|audit|workflow" docs/contracts/account-sync-admin-read-models.md docs/reviews/account-sync-admin-read-models
```
