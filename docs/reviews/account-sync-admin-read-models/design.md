# account-sync-admin-read-models - Design

## Selected Option

Add one canonical shared contract at
`docs/contracts/account-sync-admin-read-models.md` and keep all planning
artifacts under `docs/reviews/account-sync-admin-read-models/`.

## Review Doc Path

`docs/reviews/account-sync-admin-read-models/20260531-discovery-review.md`

## Review Date/Version

- Review date: 2026-05-31
- Planning mode: Fresh

## Scope

This feature owns the docs-only contract for how an isolated future Admin
Dashboard consumes unified control-plane read models from Account Cloud Sync and
account-adjacent infrastructure.

The contract must freeze:

- the admin read-model catalog for accounts, organizations, devices, sync
  health, usage, quotas, billing, feature flags, provider status, audit, and
  operational queues;
- which source systems are authoritative for each domain and which remain
  deferred;
- browser-secret and encrypted-payload prohibitions;
- mandatory guardrails for any admin mutation;
- workflow/release snapshot treatment as derived metadata only.

## Dependency Overview

- Inherited authorities:
  - `docs/contracts/account-cloud-sync-architecture.md`
  - `docs/contracts/account-sync-entity-scope-matrix.md`
  - `docs/contracts/account-device-identity-contract.md`
  - `docs/contracts/account-sync-local-first-boundaries.md`
  - `docs/contracts/account-sync-protocol-surface-contract.md`
  - `docs/contracts/account-sync-surface-adapters.md`
  - `docs/contracts/data-repository-v0.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/workflow/roadmap/sync-v1.md`
  - ADR-0013 D4
- Downstream consumers:
  - future `admin` rows for guarded control-plane UI and server APIs
  - future `site` rows for public account/status messaging boundaries
  - future `workflow` rows for derived status/read-model snapshots

## Frozen Assumptions

- Admin Dashboard remains PROPOSED and isolated until operator activation.
- Admin reads metadata and read models, not encrypted user payload plaintext.
- Browser-delivered admin code never receives service-role credentials or
  provider raw secrets.
- Admin audit is append-only and separate from user sync audit.
- Workflow state remains repository truth, even if the control plane later
  displays derived summaries.
- This row does not redefine `RepoRecord`, `syncScope`, crypto, device
  identity, or paused `sync-v1` runtime behavior.
