# account-sync-workflow-state-contract - Test Plan

## Planning-Phase Validation

This feature-plan run is docs-only. No runtime, unit, or manual product tests
are required at the planning step.

The planning artifacts should be reviewed for:

- authority traceability back to the shipped adapter and admin contracts,
  `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, paused `sync-v1`, and
  ADR-0013 D4;
- complete coverage of repository-truth workflow artifacts and derived-only
  exposure rules;
- explicit separation between product account data and developer workflow
  state;
- explicit source/cadence/authority declarations for cross-domain read models;
- absence of new `RepoRecord`, `syncScope`, crypto, device-identity, or runtime
  sync definitions.

## Build-Phase Acceptance Checks

When the docs-only build phase creates
`docs/contracts/account-sync-workflow-state-contract.md`, review it against
these gates:

- the contract explicitly names repository-truth artifact classes and keeps
  them authoritative;
- the contract explicitly states that workflow artifacts are not account-sync
  payload data and may not enter outbox, encrypted-blob, or cursor flows;
- the contract includes a source/cadence/authority table or equivalent schema
  for mixed workflow + account/sync dashboards;
- the contract includes a strict forbidden-data list covering secrets, raw
  logs, private payloads, encrypted payload plaintext, provider raw secrets,
  and service-role credentials;
- the contract lists deferred future hook points as read-only derived exposures
  only;
- the contract is registered in `docs/contracts/README.md`.

## Later Runtime Verification Matrix

This row should require later implementation rows to prove:

- derived workflow snapshots never overwrite roadmap manifests, `dev_log.md`,
  release logs, ADRs, or committed dashboard sources;
- workflow state is never reclassified into `RepoRecord` or
  `syncScope: account-sync`;
- mixed-domain dashboards declare per-domain source, cadence, and authority;
- no secret, raw log, or private payload data crosses into workflow-visible
  state;
- admin or site consumers do not use this row as permission to bypass existing
  control-plane and browser-secret boundaries.

## Mock Strategy

- `@repo/core-data` remains `In-Dev`; any future implementation examples must
  stay contract-level or mock-first rather than claiming stable integration.
- Business-domain plugin packages remain non-stable in `docs/PLUGIN_MAP.md`;
  this row may cite them as product data owners, but not as stable workflow
  integration dependencies.

## Commands

No mandatory test command runs for the planning phase.

Recommended verification during later build and verify phases:

```bash
git diff --check -- docs/contracts/README.md docs/contracts/account-sync-workflow-state-contract.md docs/reviews/account-sync-workflow-state-contract
rg -n "repository truth|source|cadence|authority|account-sync|RepoRecord|syncScope|secret|raw log|payload" docs/contracts/account-sync-workflow-state-contract.md docs/reviews/account-sync-workflow-state-contract
```
