# account-sync-site-entry-contract - Design

## Selected Option

Add one canonical shared contract at
`docs/contracts/account-sync-site-entry-contract.md` and keep all planning
artifacts under `docs/reviews/account-sync-site-entry-contract/`.

## Review Doc Path

`docs/reviews/account-sync-site-entry-contract/20260531-discovery-review.md`

## Review Date/Version

- Review date: 2026-05-31
- Planning mode: Fresh

## Scope

This feature owns the docs-only contract for the official Site surface's
public-boundary rules within the Account Cloud Sync contract stack.

The contract must freeze:

- the allowed data catalog for public Site pages: public/account-entry
  links, release artifact metadata, download links, updater-metadata links,
  public account status messaging, and source-backed sync/security explanations;
- the forbidden data catalog for Site pages: private product records, sync
  payloads, encrypted blob content, service-role credentials, provider raw
  secrets, key material, admin read models, control-plane state, local-only
  device state, and per-user/per-device identifiers in any visible surface;
- account and auth entry handoff rules requiring reuse of the shared
  account/device/session contract without forking or bypassing device
  registration, session checks, or admin-claim checks;
- release/download/updater-metadata and status-linking rules specifying that
  the Site links to artifact metadata without becoming a product state store
  or sync-payload proxy;
- sync/security claim source rules requiring all public claims to trace to
  named authority documents (ADR-0013 D4, `TECHNICAL_REQUIREMENTS.md`,
  `sync-v1.md`, or a shipped account-sync contract);
- the Site PROPOSED gate and implementation routing rule: Site stays PROPOSED
  and operator-deferred; future implementation routes exclusively through
  `codex/site/<feature>` after operator activation.

## Dependency Overview

- Inherited authorities (do not redefine any of these):
  - `docs/contracts/account-cloud-sync-architecture.md` — shared sync
    topology, source-of-truth hierarchy, Web <-> account cloud <-> App model
  - `docs/contracts/account-sync-entity-scope-matrix.md` — entity class
    classification: `account-sync`, `device-local`, mixed, deferred
  - `docs/contracts/account-device-identity-contract.md` — account, device,
    session, admin-claim, and lifecycle seams that Site entry must reuse
  - `docs/contracts/account-sync-local-first-boundaries.md` — per-surface
    store ownership and local-first exclusions
  - `docs/contracts/account-sync-protocol-surface-contract.md` — push/pull/
    conflict/retry semantics that the Site must never host or proxy
  - `docs/contracts/account-sync-surface-adapters.md` — confirmation that
    Admin/Site/Workflow are downstream metadata consumers without payload
    authority
  - `docs/contracts/account-sync-admin-read-models.md` — admin read model
    catalog and guardrails; Site must never expose these
  - `docs/contracts/data-repository-v0.md` — `RepoRecord`, `syncScope`,
    repository behavior (not redefined here)
  - `docs/TECHNICAL_REQUIREMENTS.md` — AES-256-GCM, deterministic CBOR AAD,
    nonce lease, per-device key wrap, recovery proof, zero-knowledge boundary,
    encrypted blob invariants (not redefined here)
  - `docs/workflow/roadmap/sync-v1.md` — paused runtime sync-v1 scope and
    protocol intent (not redefined here)
  - ADR-0013 D1, D4 — PROPOSED gate and account cloud topology governance
  - `CLAUDE.md` routing lines for `sync` and `site`
  - `docs/PRODUCT_MODULE_MAP.md` — Site module PROPOSED status and operator
    activation requirement
- Downstream consumers (deferred until operator activation):
  - future `site` rows for public UI, account-entry flow, download/release
    integration, and security messaging pages — must cite this contract as
    the entry-point authority
  - future `sync` rows that need public-boundary documentation for release
    or status metadata publication paths

## Frozen Assumptions

- Site remains PROPOSED and isolated until explicit operator activation per
  ADR-0013 D1 and `docs/PRODUCT_MODULE_MAP.md`; this contract row does not
  constitute operator activation.
- The Site is a public metadata and account-entry surface only; it is not a
  product data plane, sync control-plane, admin control-plane, or private-
  payload conduit.
- Account/auth entry on the Site must link into the shared account/device/
  session contract defined by `account-device-identity-contract.md` and must
  not fork, duplicate, or bypass those seams.
- All public sync/security claims on Site pages must be traceable to a named
  authority document; unsupported marketing-only claims are forbidden.
- Release and download metadata displayed by the Site is derived from the
  release/distribution authority; the Site must not become the authoritative
  source of release artifact state.
- Public account status messaging uses operator-safe language; per-device
  sync health, per-user error detail, and user content must never appear.
- This row does not redefine `RepoRecord`, `syncScope`, crypto invariants,
  account/device/session contracts, admin read models, or surface-adapter
  responsibilities.
