# Feature Brief - account-sync-site-entry-contract

| Field | Value |
|---|---|
| Feature Slug | `account-sync-site-entry-contract` |
| Created | 2026-05-31 |
| Author | Codex (`xai-feature-brief` inline) |
| Product Module | `sync` |
| Step 0 QA Gate | PASS |
| Output Status | `READY_FOR_FEATURE_PLAN` |
| Source | `docs/reviews/account-sync-site-entry-contract/20260531-roadmap-seed.md` |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #8 |
| Depends On | `account-device-identity-contract` |
| Automation Mode | `A-Codex` |
| Verify Cross-vendor | `yes` |

## Structured Brief

### Feature Title

Account Sync site entry contract

### Canonical Name And Rationale

- Canonical slug: `account-sync-site-entry-contract`
- Canonical output target: `docs/contracts/account-sync-site-entry-contract.md`
- Why this name fits:
  - the roadmap row specifically defines the boundary document governing what the
    official Site surface may expose about account entry, sync state, release
    status, downloads, and public security claims;
  - the row stays in the `sync` lane because it defines a shared cross-surface
    contract (same pattern as rows #7 and #6) rather than authorizing any `site`
    implementation surface;
  - the output is a public-boundary contract, not a runtime Site implementation.

### Problem / Motivation

Rows #1–#7 now freeze account-cloud topology, entity scope, device identity,
local-first boundaries, protocol sequencing, surface-adapter rules, and admin
read-model boundaries. Row #8 closes the remaining gap for the official Site
surface:

How does the official Site surface expose public and account-entry information
about Account Cloud Sync — including login/account entry, release/download
context, account status, and sync/security claims — without becoming a product
data plane, admin control-plane, or private-payload conduit?

Without a dedicated contract:

1. Future Site work could drift into hosting product payloads, admin metadata,
   service-role credentials, or encrypted blob content.
2. Account entry points on Site could diverge from the shared account/device/
   session contract defined in `account-device-identity-contract`.
3. Security claims on Site pages could become marketing-only assertions
   unsupported by ADR-0013, `TECHNICAL_REQUIREMENTS.md`, or the account-sync
   contract stack.
4. Release, download, update, and status data could be served from inconsistent
   or private-path sources rather than approved public metadata.

### Target User / Actor

- Primary actors: planners and implementers working on future `site` and `sync`
  follow-up rows.
- Indirect actors: end users who will visit the official Site for account entry,
  downloads, release notes, auto-update checks, product status, and security
  explanations.

### Desired Outcome

Produce a docs-only contract that:

- defines the allowed data catalog for public Site pages: public/account-entry,
  release metadata, download links, update/auto-update status, product status,
  and verifiable security claims;
- defines what is explicitly forbidden on Site pages: private product payloads,
  admin data, internal sync control-plane state, service-role credentials,
  encrypted blob content, device private keys, provider raw secrets;
- specifies that account and auth entry points on Site must reuse the shared
  account/device/session contract from `account-device-identity-contract`
  without forking or re-implementing session material;
- specifies that security claims must be traceable to ADR-0013, `TECHNICAL_REQUIREMENTS.md`,
  and the account-sync contract stack — never marketing-only wording;
- confirms that Site remains PROPOSED and any future implementation routes
  exclusively through `codex/site/<feature>` after operator confirmation;
- preserves `RepoRecord`, `syncScope`, sync-v1 crypto, and runtime sync
  authorities unchanged.

### Scope

- Create the reviewed Step 0 brief and planning pack under
  `docs/reviews/account-sync-site-entry-contract/`.
- Plan for a canonical shared contract at
  `docs/contracts/account-sync-site-entry-contract.md`.
- Freeze one site boundary document covering:
  - allowed public/account-entry data and page types;
  - allowed release, download, update, auto-update, and status data;
  - allowed public sync/security claim categories and required traceability;
  - forbidden data classes on Site pages;
  - account entry flow reuse rules referencing `account-device-identity-contract`;
  - routing rules for future Site implementation work.

### Non-goals

- No Site implementation branch, production UI, or Cloudflare Pages deployment.
- No runtime sync-v1 unpause or protocol rewrite.
- No redefinition of `RepoRecord`, `syncScope`, crypto, `commit_seq`, nonce
  lease, or device identity.
- No browser access to service-role credentials, provider raw secrets, admin
  read models, or user encrypted payload plaintext via Site pages.
- No activation of the `site` PROPOSED lane; this row is a `sync`-module
  contract definition only.
- No replacement of `account-device-identity-contract` session rules with
  Site-local session handling.

### Architecture Kind

Cross-surface public-boundary contract for shared sync infrastructure and
Site exposure rules.

### User Surface

Public-boundary contract only. This row informs a future official Site surface
but does not authorize or implement it. Site remains PROPOSED per ADR-0013 D1
and `CLAUDE.md` routing lines until operator confirmation.

### Change Type

New docs/contracts feature building on the shipped account-sync contract stack
(rows #1–#7).

### Impacted Layers

- Current row: `docs/contracts/` and `docs/reviews/` only.
- Downstream owners implied by this brief:
  - `sync` for public-boundary authorities and security claim traceability;
  - `site` for future public UI, account-entry flow, and download/release
    integration (PROPOSED, operator-gated);
  - `web` and `app` only as upstream providers of the account/session entry
    contract that Site must reuse.
- Explicitly out of scope for this row:
  - runtime code in `apps/web`, `apps/desktop`, `packages/core`, or
    `packages/plugin-*`;
  - Cloudflare Pages deploy config, CSP headers, or wrangler.toml changes.

### Target Plugin Slice / State

- No single plugin slice owns this contract.
- `@repo/web-auth-device-session` is the browser/device-session seam and is
  cited as a stable dependency authority for the account entry reuse rule.
- No new `packages/core/src/events/` contract or Tauri command change is
  authorized by this row.

### Risk Level

Medium.

Reasoning:

- the row is docs-only, but it sits at the public security and data-exposure
  boundary;
- poor phrasing here could create downstream secret-handling or marketing-claim
  drift on publicly-visible pages;
- the contract must stay narrow enough to avoid accidentally activating the
  PROPOSED `site` lane or blurring the Site/Admin/Sync boundaries.

### Dependencies And Constraints

- Required authorities:
  - `docs/contracts/account-cloud-sync-architecture.md`
  - `docs/contracts/account-device-identity-contract.md`
  - `docs/contracts/account-sync-surface-adapters.md`
  - `docs/contracts/data-repository-v0.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #8
  - ADR-0013 D1, D4
  - `CLAUDE.md` routing lines for `sync` and `site`
- Hard constraints preserved from the seed and roadmap:
  - Site remains PROPOSED and isolated until operator activation; future
    implementation routes exclusively through `codex/site/<feature>`.
  - Site pages may expose only: public/account-entry links, release metadata,
    download links, update/auto-update status, account status messaging, and
    public sync/security claims traceable to ADR-0013 and account-sync contracts.
  - Site pages must never expose: private product payloads, admin data,
    internal sync control-plane state, service-role credentials, encrypted blob
    content, device private keys, or provider raw secrets.
  - Account and auth entry points on Site must reuse the shared account/device/
    session contract from `account-device-identity-contract`; no fork or
    re-implementation of session material is permitted.
  - Security claims on Site pages must trace to ADR-0013, `TECHNICAL_REQUIREMENTS.md`,
    and account-sync contracts — not marketing-only wording.
  - `RepoRecord`, `syncScope`, sync-v1 crypto, and runtime sync authorities
    remain unchanged.

### Data / Permission / Security Impact

- Data impact: yes, public-boundary metadata only; private product data and
  admin data are explicitly forbidden.
- Permission impact: yes, future Site routes are operator-gated; account entry
  reuses existing account/session claims without Site-local privilege escalation.
- Security impact: yes. The row must preserve public-only claim sourcing,
  traceable security assertions, and strict exclusion of encrypted payloads,
  admin metadata, and service-role credentials from Site pages.

### Release Strategy

- Docs-only `sync` contract row.
- No promotion into an active `site` implementation lane.
- Future Site implementation work remains gated by operator activation and
  separate Workflow V2 rows routed through `codex/site/<feature>`.

### Rollback / Degrade Strategy

- If review finds the row too broad, degrade it to a pure allowed-data-list and
  forbidden-data-list contract and defer account entry flow detail to the first
  Site implementation row.
- If a required source contract is not yet stable, keep affected claim categories
  marked deferred rather than inventing an unsupported authority.

### Acceptance Criteria

1. The planned canonical contract target is
   `docs/contracts/account-sync-site-entry-contract.md`.
2. The contract lists the complete set of data classes allowed on public Site
   pages, each with an authority source.
3. The contract explicitly forbids private product payloads, admin data,
   internal sync control-plane state, service-role credentials, encrypted blob
   content, device private keys, and provider raw secrets from Site pages.
4. The contract specifies that account and auth entry points on Site must reuse
   `account-device-identity-contract` session rules without forking.
5. The contract specifies that security claims on Site pages must trace to
   ADR-0013, `TECHNICAL_REQUIREMENTS.md`, or an account-sync contract — not
   marketing-only wording.
6. The contract defines a routing rule: any future Site implementation uses
   `codex/site/<feature>` only after operator confirmation.
7. The contract preserves ADR-0013 D4, `RepoRecord`, `syncScope`, and paused
   `sync-v1` runtime authorities unchanged.
8. The handoff is specific enough for `feature-plan` to produce a single
   docs-only build phase.

## Open Questions / Unknowns

1. Should official Site account entry be a separate `site` implementation page
   or reuse an auth page already under the Web deployment infrastructure? This
   affects whether account entry reuse means linking to a Web-hosted auth route
   or implementing a duplicate entry form under Site.
2. Which release and download metadata fields (version, checksum, release date,
   channel, platform) are already public in an approved location, and which
   require a new publication path before Site can reference them?
3. Should auto-update status and security-claim freshness be served from a
   static Cloudflare-cached endpoint, a server-side status API, or a
   repository-generated static file? The answer affects where Site sources its
   public claim data.

## ADR-lite Trigger

Needed: Yes

- Decision Topic: official Site public-boundary rules for account entry,
  release/download, update, status, and security claims within the Account Cloud
  Sync contract stack.
- Why Decision Is Needed:
  - the row crosses `sync` contract authority and the PROPOSED `site` surface;
  - the contract must settle which data is public-safe and which is forbidden
    before any `site` implementation work begins;
  - account entry reuse and security claim traceability rules must be frozen so
    future Site rows cannot inadvertently diverge from the shared account/device/
    session contract.
- Options To Evaluate:
  - one shared contract with per-category allowed/forbidden matrices;
  - split contracts per site page type (account-entry, release, status, security);
  - defer all Site rules until the `site` lane is operator-activated.
- Risks If Deferred:
  - future Site work may introduce inconsistent data exposure, marketing-only
    security claims, or session-handling that diverges from the shared
    account/device contract.

## Planner Handoff

- Three-faces decision: no host/core/plugin business logic changes in this row;
  current work is docs/contracts only in the `sync` module, with future
  downstream `site` implementation still PROPOSED and operator-gated.
- Target plugin slice: none. This is a shared contract artifact.
- Mock strategy: `Deferred Integration` for any future Site implementation
  component; this row stays at public-boundary and contract level only.
- Cross-window contract impact: none in this row. No new
  `packages/core/src/events/` contract or Tauri command change is authorized.
- Site routing note: any future implementation of the official Site surface must
  route through `codex/site/<feature>` only after explicit operator confirmation;
  the PROPOSED status is not lifted by this contract row.
- Recommended next agent: `feature-plan`
