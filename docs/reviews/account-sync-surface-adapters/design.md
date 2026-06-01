# account-sync-surface-adapters - Design

## Selected Option

Add one canonical shared contract at
`docs/contracts/account-sync-surface-adapters.md` and keep all planning
artifacts under `docs/reviews/account-sync-surface-adapters/`.

## Review Doc Path

`docs/reviews/account-sync-surface-adapters/20260531-discovery-review.md`

## Review Date/Version

- Review date: 2026-05-31
- Planning mode: Fresh

## Scope

This feature owns the docs-only adapter-boundary contract for how Web, Mac
Desktop, and Desktop Plugin surfaces consume Account Cloud Sync.

The contract must freeze:

- Web adapter ownership of browser repository access, sync-status/conflict
  affordances, and D3 routing obligations;
- App adapter ownership of native runtime seams, SQLite/SQLCipher + Keychain
  boundaries, sync-status/conflict affordances, and local-first behavior;
- Plugin repository-only access, entity declaration expectations, and
  read-only sync-status/conflict consumption boundaries;
- downstream routing rules for later `web`, `app`, `plugin`, and `sync`
  implementation rows.

## Dependency Overview

- Inherited authorities:
  - `docs/contracts/account-cloud-sync-architecture.md`
  - `docs/contracts/account-sync-entity-scope-matrix.md`
  - `docs/contracts/account-device-identity-contract.md`
  - `docs/contracts/account-sync-local-first-boundaries.md`
  - `docs/contracts/account-sync-protocol-surface-contract.md`
  - `docs/contracts/data-repository-v0.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/workflow/roadmap/sync-v1.md`
  - ADR-0013 D3/D4
- Downstream consumers:
  - `web` module follow-up rows for browser adapter or sync-status/conflict UI
  - `app` module follow-up rows for native/runtime adapter or secure/local
    storage seams
  - `plugin` module follow-up rows for entity declaration and repository
    consumption
  - later `sync` rows that need a stable surface-consumption contract

## Frozen Assumptions

- Web remains the P0 primary product surface and App UI source.
- Desktop-impacting Web changes still require ADR-0013 D3 classification before
  App work.
- Account Cloud Sync remains shared infrastructure, not a standalone product
  surface.
- Plugin and sync-v1 runtime work remain P2 paused; this row only defines the
  contract they will eventually consume.
- Plugins declare entities and use repository APIs only; they never own
  push/pull engines or secure-key seams.
- This row does not redefine `RepoRecord`, `syncScope`, device identity,
  encrypted-envelope rules, or sync-v1 cryptography.
