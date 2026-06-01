# account-sync-workflow-state-contract - Design

## Selected Option

Add one canonical shared contract at
`docs/contracts/account-sync-workflow-state-contract.md` and keep all planning
artifacts under `docs/reviews/account-sync-workflow-state-contract/`.

## Review Doc Path

`docs/reviews/account-sync-workflow-state-contract/20260531-discovery-review.md`

## Review Date/Version

- Review date: 2026-05-31
- Planning mode: Fresh

## Scope

This feature owns the docs-only workflow-state governance contract for how
repository-truth workflow artifacts may expose derived account/sync status
without becoming an account-sync payload system.

The contract must freeze:

- repository-truth ownership of roadmap manifests, `dev_log.md`, release logs,
  ADRs, and committed dashboard snapshots;
- explicit separation between user/product account data and developer workflow
  state;
- source/cadence/authority declaration rules for any cross-domain dashboard or
  read model that mixes workflow status with account, device, sync-health,
  usage, quota, or provider metadata;
- a strict exclusion list for secrets, raw logs, private user payloads, and
  encrypted payload plaintext in workflow-visible state;
- deferred, read-only future hook points for release-log, roadmap-state,
  verification, and sync-health aggregation.

## Dependency Overview

- Inherited authorities:
  - `docs/contracts/account-cloud-sync-architecture.md`
  - `docs/contracts/account-sync-surface-adapters.md`
  - `docs/contracts/account-sync-admin-read-models.md`
  - `docs/contracts/data-repository-v0.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/workflow/roadmap/sync-v1.md`
  - ADR-0013 D4
- Downstream consumers:
  - future workflow dashboard or release-log aggregation rows
  - future `admin` rows that expose workflow snapshots
  - later verification-gates row that will validate the governance rules

## Frozen Assumptions

- Workflow remains a downstream metadata consumer, not a payload authority.
- Repository-truth workflow artifacts are not `RepoRecord`s and never enter
  account-sync outboxes.
- Any future workflow dashboard or control-plane surface remains derived-only
  for workflow state unless a later contract explicitly says otherwise.
- This row does not redefine `RepoRecord`, `syncScope`, crypto, device
  identity, or runtime sync-v1 semantics.
- This row does not authorize runtime implementation in `web`, `app`, `plugin`,
  `admin`, or `site`.
