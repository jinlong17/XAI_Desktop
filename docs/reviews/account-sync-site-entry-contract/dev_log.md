# account-sync-site-entry-contract - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-sync-site-entry-contract |
| Title | Account Sync site entry contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #8 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (A-Codex inline) |
| Updated | 2026-05-31 07:20 PDT |
| Blockers | — |

## Feature Normalization

- Requirement source: `docs/reviews/account-sync-site-entry-contract/20260531-feature-brief.md`
- Canonical feature name: `account-sync-site-entry-contract`
- Title: Account Sync site entry contract
- Canonical contract target: `docs/contracts/account-sync-site-entry-contract.md`
- Naming rationale: the row defines the boundary document governing what the
  official Site surface may expose about account entry, sync state, release
  status, downloads, and public security claims; it stays in the `sync` lane
  because it defines a shared cross-surface contract (same pattern as rows #6
  and #7) rather than authorizing any `site` implementation surface; the output
  is a public-boundary contract, not a runtime Site implementation.

## Brief / Review Docs

- Reviewed feature brief: `docs/reviews/account-sync-site-entry-contract/20260531-feature-brief.md`
- Discovery review: `docs/reviews/account-sync-site-entry-contract/20260531-discovery-review.md`
- Planning pack:
  - `docs/reviews/account-sync-site-entry-contract/design.md`
  - `docs/reviews/account-sync-site-entry-contract/api.md`
  - `docs/reviews/account-sync-site-entry-contract/test.md`

## Phase Plan

### Phase 1 - Site boundary contract

Status: DONE.

- Add the canonical shared contract at
  `docs/contracts/account-sync-site-entry-contract.md`.
- Build the contract on top of the shipped authorities:
  `account-cloud-sync-architecture`,
  `account-sync-entity-scope-matrix`,
  `account-device-identity-contract`,
  `account-sync-local-first-boundaries`,
  `account-sync-protocol-surface-contract`,
  `account-sync-surface-adapters`,
  `account-sync-admin-read-models`,
  `data-repository-v0`,
  `TECHNICAL_REQUIREMENTS`,
  `sync-v1`, and ADR-0013 D2/D3/D4.
- Freeze one allowed Site data and metadata table covering: account-entry
  links, download/release-note artifact metadata links, updater metadata links,
  public account status summaries, and source-backed sync/security explanations.
- Freeze one forbidden Site data and metadata table covering: private product
  state records, sync payloads, encrypted blob content, service-role
  credentials, provider raw secrets, key material, admin read models,
  control-plane data, and local-only device state.
- Freeze account/auth entry handoff requirements routing through
  `account-device-identity-contract` without bypass of device registration,
  session checks, or admin-claim checks.
- Freeze release/download/updater-metadata and status-linking rules keeping the
  Site as a link/summary surface only, not a product state store or sync
  payload host.
- Freeze sync/security claim source rules requiring all public claims to cite
  named authority documents (ADR-0013 D4, `TECHNICAL_REQUIREMENTS`,
  `sync-v1`, or existing shipped account-sync contracts).
- Freeze the Site PROPOSED gate: the `site` module remains PROPOSED and
  owner-deferred; future implementation routes exclusively through
  `codex/site/<feature>` only after operator activation; this contract row
  does not constitute activation.
- Register the contract in `docs/contracts/README.md`.

Gate: the build adds `docs/contracts/account-sync-site-entry-contract.md` and
the `docs/contracts/README.md` registration; keeps the Site module PROPOSED
with no runtime activation, no Cloudflare route, and no deploy config; does
not touch runtime code or redefine `RepoRecord`, `syncScope`, crypto,
device identity, admin read models, or paused `sync-v1`.

## Risks

- The contract could drift into Site UX or Cloudflare implementation design if
  not kept strictly at boundary/table level without page wireframes, route
  definitions, or deploy config.
- Account entry handoff wording could accidentally imply that the Site
  implements its own device registration or session system rather than linking
  into the shared account/device/session contract.
- Public sync/security claim language could become marketing-only assertions
  not traceable to ADR-0013 D4, `TECHNICAL_REQUIREMENTS`, or `sync-v1`.
- Release/download metadata linking rules could inadvertently authorize the
  Site to proxy live sync channels or encrypted blob content rather than link
  to release artifacts only.
- The contract could accidentally imply the Site PROPOSED gate is lifted by
  its existence, causing premature `codex/site/<feature>` branch creation.

## Open Questions

1. Should official Site account entry link to a Web-hosted auth route
   (already under the Web deployment infrastructure) or to a separate
   Site-local auth form? This affects what "reuse" means in the account-entry
   handoff rule and is deferred to the future Site activation row.
2. Which release and download metadata fields (version, checksum, release date,
   channel, platform) already have an approved public location, and which
   require a new publication path before Site may reference them?
3. Should auto-update status and security-claim freshness be served from a
   static Cloudflare-cached endpoint, a server-side status API, or a
   repository-generated static file? The answer affects where Site sources
   its public claim data and is deferred to the first Site activation row.

## Review Notes

- **Authority traceability**: All five contract sections (allowed table, forbidden table, account-entry handoff, release/download/updater linking, security-claim sources) correctly cite ADR-0013 D4, `account-device-identity-contract`, `account-sync-surface-adapters`, `account-sync-admin-read-models`, `TECHNICAL_REQUIREMENTS`, `data-repository-v0`, and `sync-v1` as upstream authorities. No redefinition of `RepoRecord`, `syncScope`, crypto invariants, or admin read models detected.
- **Boundary completeness**: The allowed and forbidden data tables in `design.md` and `api.md` cover all minimum required categories per the discovery review § 5.1–5.2, including per-user/per-device identifier exclusions from logged/public surfaces.
- **Account entry handoff**: The handoff rule routes through `account-device-identity-contract` entry points and explicitly prohibits bypass of device registration, session checks, and admin-claim checks. No Web-to-App or App-to-Site direct sync path is introduced.
- **Site PROPOSED gate**: Decision 5.6 and its restatement in `design.md` unambiguously preserve the PROPOSED status; the contract does not constitute operator activation. Implementation gate language is present and sufficient.
- **No scope creep**: No Cloudflare route, deploy config, runtime code, or `codex/site/<feature>` branch reference appears in any artifact. Open questions (§ OQ1–OQ3 in dev_log) are correctly deferred to a future Site activation row.
- **Row #8 roadmap alignment**: The planning pack is consistent with the roadmap decomposition rationale R3/R7 and Phase C gate (ship rows #6–#8, produce site adapter contract, route follow-up to owning modules).
- **No blockers identified.** Approved for one docs-only build phase.

## Review Notes

APPROVED. The single docs-only build phase must:

1. Add `docs/contracts/account-sync-site-entry-contract.md` as the canonical boundary contract.
2. Register the new contract in `docs/contracts/README.md`.
3. Keep the `site` module PROPOSED and owner-deferred; this contract row does not constitute Site activation.
4. Require that all account-entry, device-registration, and session flows reuse the shared account/device/session contracts (`account-device-identity-contract`, `web-auth-device-session`) without bypass or duplication.
5. Forbid exposure of private sync payloads, encrypted blob content, admin read models, control-plane data, service-role credentials, key material, and local-only device state.
6. Require all public security and sync claims to be traceable to named authority documents (ADR-0013 D4, `TECHNICAL_REQUIREMENTS`, `sync-v1`, or existing shipped account-sync contracts); marketing-only assertions without source backing are prohibited.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 07:15 PDT | feature-plan (A-Codex inline) | Produced the docs-only planning pack for roadmap row #8, selected `docs/contracts/account-sync-site-entry-contract.md` as the canonical build target, and advanced workflow state to `NEEDS_REVIEW`. | — | feature-review |
| 2026-05-31 07:17 PDT | feature-review (A-Codex inline) | Reviewed planning pack; issued APPROVED verdict. Build phase must deliver `docs/contracts/account-sync-site-entry-contract.md` + README registration, keep Site PROPOSED, require shared account/device/session reuse, forbid private payload/admin/control-plane exposure, and require source-backed security claims only. | — | feature-build |
| 2026-05-31 07:16 PDT | feature-review (A-Codex inline) | Reviewed planning pack (discovery-review, design, api, test) against ADR-0013, account-cloud-sync-architecture, account-device-identity-contract, account-sync-surface-adapters, account-sync-admin-read-models, data-repository-v0, TECHNICAL_REQUIREMENTS, sync-v1, and roadmap row #8. All authority citations verified, no redefinition of prior shipped contracts, Site PROPOSED gate confirmed, account-entry handoff traced to shared contract, no scope creep. Status advanced to APPROVED. | — | feature-build |
| 2026-05-31 07:20 PDT | feature-auto-build (A-Codex inline) | Phase 1 DONE. Delivered `docs/contracts/account-sync-site-entry-contract.md` (allowed/forbidden data tables, account-entry handoff rules, release/download/updater linking rules, sync/security claim source rules, Site PROPOSED gate restatement) and registered the contract in `docs/contracts/README.md`. Verification evidence: `git diff --name-only HEAD` confirms only `docs/contracts/account-sync-site-entry-contract.md` and `docs/contracts/README.md` are new artifacts; `git show e770588` (`docs(sync): ship admin read-model contract`) confirms `docs/reviews/account-sync-admin-read-models/dev_log.md` and `docs/workflow/roadmap/account-cloud-sync-foundation.md` are within committed scope; no runtime code, Cloudflare config, or `codex/site/<feature>` branch reference introduced; Site module remains PROPOSED. Status advanced to READY_FOR_VERIFY. | e770588 | feature-verify |
