# account-sync-site-entry-contract - Test Plan

## Planning-Phase Validation

This feature-plan run is docs-only. No runtime/unit/manual product tests are
required at the planning step.

The planning artifacts should be reviewed for:

- authority traceability back to row #8, ADR-0013 D1/D4,
  `account-device-identity-contract`, `account-sync-surface-adapters`,
  `TECHNICAL_REQUIREMENTS`, and paused `sync-v1`;
- complete allowed/forbidden Site data table coverage;
- explicit account/auth entry handoff rule traced to the shared account/device/
  session contract without bypass or fork;
- explicit release/download/updater-metadata and status-linking rules that keep
  the Site as a linker, not a product state store or sync payload host;
- explicit sync/security claim source rules requiring named authority traceability;
- explicit Site PROPOSED gate: no implementation, branch, or operator activation
  in this row;
- absence of redefinition of `RepoRecord`, `syncScope`, crypto invariants,
  device identity, admin read models, or surface adapter responsibilities.

## Build-Phase Acceptance Checks

When the docs-only build phase creates
`docs/contracts/account-sync-site-entry-contract.md`, review it against these
gates:

- the contract contains an allowed Site data table covering: account-entry
  links, download/release-note/updater-metadata links, public status summaries,
  and source-backed sync/security explanations; each row must include an
  authority source citation;
- the contract contains a forbidden Site data table covering: private product
  state records, sync payloads, encrypted blob content, nonce values, user
  content, service-role credentials, provider API keys, platform secrets, raw
  key material, admin read models, control-plane state, RBAC claims, audit log
  entries, operator configuration, local-only device state, and per-user/
  per-device identifiers or session tokens in any logged or publicly visible
  surface;
- the contract specifies that Site account and auth entry must route through
  the entry points defined by `docs/contracts/account-device-identity-contract.md`
  and must not invent a separate account, device, or session system, bypass
  device registration, bypass session checks, bypass admin-claim checks, or
  create a Web-to-App or App-to-Site direct sync path outside the account cloud
  topology in ADR-0013 D4;
- the contract specifies that any public sync/security claim must be grounded in
  one or more of: ADR-0013 D4, `docs/TECHNICAL_REQUIREMENTS.md`,
  `docs/workflow/roadmap/sync-v1.md`, or existing shipped account-sync
  contracts (rows #1–#7); claims not traceable to these sources must be removed
  or replaced with neutral factual descriptions;
- the contract specifies release/download/updater-metadata linking rules: Site
  may link to release artifact URLs and display artifact metadata (version,
  checksum, date, changelog summary) without becoming the authoritative source
  of release metadata and without hosting or proxying sync payloads, encrypted
  blobs, or account-scoped update decisions;
- the contract explicitly states that the `site` module is PROPOSED and
  owner-deferred; no Site implementation, Cloudflare route, deploy config, or
  `codex/site/<feature>` branch may be created until operator activation; this
  contract row does not constitute operator activation; the contract must be
  cited as the entry-point authority for any future `codex/site/<feature>`
  planning;
- the contract does not redefine `RepoRecord` or `syncScope` (owned by
  `data-repository-v0`), crypto invariants or encrypted-blob behavior (owned by
  `TECHNICAL_REQUIREMENTS` and `sync-v1`), account/device/session contracts
  (owned by `account-device-identity-contract`), admin read models or mutation
  guardrails (owned by `account-sync-admin-read-models`), or surface adapter
  responsibilities (owned by `account-sync-surface-adapters`);
- the contract is registered in `docs/contracts/README.md`.

## Later Runtime Verification Matrix

This row should require later implementation rows to prove:

- public Site pages contain no private product state records, sync payloads,
  encrypted blob content, nonce values, service-role credentials, provider API
  keys, platform secrets, raw key material, admin read models, control-plane
  state, RBAC claims, audit log entries, or local-only device state;
- Site account and auth entry flows invoke the shared account/device/session
  seams from `account-device-identity-contract` without forking or bypassing
  device registration, session checks, or admin-claim checks;
- release/download/updater-metadata pages link to release artifact sources only
  and do not proxy sync payloads, encrypted blobs, or per-device/per-account
  sync health data;
- public status pages expose operator-safe summaries only and contain no
  per-user error detail, per-device sync health records, or user-authored
  content;
- any public sync/security claim on Site pages can be traced to ADR-0013 D4,
  `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md`, or an
  existing shipped account-sync contract; claims that cannot be traced are
  absent;
- the `site` module remains PROPOSED and no `codex/site/<feature>` branch,
  Cloudflare route, or deploy config exists until operator activation is
  explicitly recorded.

## Mock Strategy

- `Deferred Integration` for any future Site implementation component, page,
  or Cloudflare route; this contract row covers public-boundary and contract
  definitions only and does not activate the `site` lane.
- Account/auth entry seams must remain `Deferred Integration` until a
  `codex/site/<feature>` implementation row is operator-activated and routes
  through `account-device-identity-contract`.
- Release/download/updater-metadata sources must remain `Deferred Integration`
  until a dedicated release/site row identifies the canonical public artifact
  metadata location.

## Commands

No mandatory test command runs for the planning phase.

Recommended verification during later build/verify phases:

```bash
git diff --check -- docs/contracts/README.md docs/contracts/account-sync-site-entry-contract.md docs/reviews/account-sync-site-entry-contract
rg -n "PROPOSED|operator activation|account-entry|forbidden|security claim|source-backed|release|updater|RepoRecord|syncScope|device-local|admin" docs/contracts/account-sync-site-entry-contract.md docs/reviews/account-sync-site-entry-contract
```
