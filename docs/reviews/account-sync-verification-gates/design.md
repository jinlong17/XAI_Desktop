# account-sync-verification-gates - Design

## Selected Option

Add one canonical shared contract at
`docs/contracts/account-sync-verification-gates.md` and keep all planning
artifacts under `docs/reviews/account-sync-verification-gates/`.

## Review Doc Path

`docs/reviews/account-sync-verification-gates/20260531-discovery-review.md`

## Review Date/Version

- Review date: 2026-05-31
- Planning mode: Fresh

## Scope

This feature owns the docs-only verification, observability, and governance
contract for Account Cloud Sync.

The contract must freeze:

- one master gate matrix covering entity contracts, repository drivers,
  push/pull behavior, conflict handling, admin read models, Site boundaries,
  workflow truth, two-device convergence, and observability privacy;
- one evidence-lane model separating mocked contract, Docker/Postgres, browser
  IndexedDB, desktop SQLite/SQLCipher, and live external/two-device proofs;
- explicit stage checklists for design review, feature-plan intake,
  feature-verify, pre-ship, and live rollout;
- telemetry allowlist and denylist rules;
- repository-truth storage rules for verify receipts and deferred-gate notes.

## Dependency Overview

- Inherited authorities:
  - `docs/contracts/account-cloud-sync-architecture.md`
  - `docs/contracts/account-sync-entity-scope-matrix.md`
  - `docs/contracts/account-device-identity-contract.md`
  - `docs/contracts/account-sync-local-first-boundaries.md`
  - `docs/contracts/account-sync-protocol-surface-contract.md`
  - `docs/contracts/account-sync-surface-adapters.md`
  - `docs/contracts/account-sync-admin-read-models.md`
  - `docs/contracts/account-sync-site-entry-contract.md`
  - `docs/contracts/account-sync-workflow-state-contract.md`
  - `docs/contracts/data-repository-v0.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/workflow/roadmap/sync-v1.md`
  - ADR-0013 D4
- Downstream consumers:
  - future runtime rows in `sync`, `web`, `app`, `admin`, `site`, and
    `workflow`
  - future `feature-verify` and ship receipts for account-sync work

## Frozen Assumptions

- This row is governance-only and does not authorize runtime implementation.
- ADR-0013 D4 remains the base completeness rule; this contract explains how it
  is proven, not what the topology is.
- Verification receipts remain repository-truth review artifacts.
- Device-local negative proof is mandatory whenever mixed or device-local
  classes are in play.
- This row does not redefine `RepoRecord`, `syncScope`, crypto, device
  identity, admin guardrails, Site public-boundary, or workflow truth.
