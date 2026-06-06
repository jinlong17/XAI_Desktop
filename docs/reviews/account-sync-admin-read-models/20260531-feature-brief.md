# Feature Brief - account-sync-admin-read-models

| Field | Value |
|---|---|
| Feature Slug | `account-sync-admin-read-models` |
| Created | 2026-05-31 |
| Author | Codex (`xai-feature-brief` inline) |
| Product Module | `sync` |
| Step 0 QA Gate | PASS |
| Output Status | `READY_FOR_FEATURE_PLAN` |
| Source | `docs/reviews/account-sync-admin-read-models/20260531-roadmap-seed.md` |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #7 |
| Depends On | `account-device-identity-contract`, `account-sync-protocol-surface-contract` |
| Automation Mode | `A-Codex` |
| Verify Cross-vendor | `yes` |

## Structured Brief

### Feature Title

Account Sync admin read models

### Canonical Name And Rationale

- Canonical slug: `account-sync-admin-read-models`
- Canonical output target: `docs/contracts/account-sync-admin-read-models.md`
- Why this name fits:
  - the roadmap row is specifically about the control-plane read-model layer
    consumed by Admin Dashboard;
  - the row must stay in the `sync` lane because it defines shared account and
    sync metadata boundaries rather than an `admin` implementation surface;
  - the output is a cross-surface contract, not runtime admin code.

### Problem / Motivation

Rows #1-#6 now freeze account-cloud topology, entity scope, device identity,
local-first boundaries, protocol sequencing, and surface-adapter rules, but the
roadmap still lacks one canonical answer to this question:

How does Admin Dashboard get one unified control-plane view of account and sync
state without becoming a second product data plane or seeing encrypted user
payload plaintext?

Without a dedicated contract:

1. Admin could drift into reading raw payload paths or browser-exposed secrets.
2. Billing, quota, provider, audit, and sync health data could arrive through
   inconsistent authorities.
3. Later rows could mix control-plane audit with user sync audit or blur which
   mutations require RBAC, type-to-confirm, and append-only audit.

### Target User / Actor

- Primary actors: planners and implementers working on future `admin`, `site`,
  `workflow`, and `sync` follow-up rows.
- Indirect actors: operators and support staff who will eventually consume
  unified account, device, billing, quota, AI, and sync-health projections
  through an isolated Admin Dashboard surface.

### Desired Outcome

Produce a docs-only contract that:

- defines the typed admin read-model catalog for accounts, devices,
  organizations, usage, quotas, billing state, feature flags, provider status,
  sync health, audit, and operational queues;
- states which read models come from account/sync server metadata, which come
  from billing or AI governance systems, and which remain deferred;
- keeps Admin Dashboard PROPOSED and isolated from user-facing runtime lanes;
- forbids service-role credentials, provider secrets, and user encrypted
  payload plaintext from browser-delivered admin code;
- defines the mandatory guardrails for admin mutations: RBAC, high-risk
  confirmation, append-only audit, and explicit success/failure results.

### Scope

- Create the reviewed Step 0 brief and planning pack under
  `docs/reviews/account-sync-admin-read-models/`.
- Plan for a canonical shared contract at
  `docs/contracts/account-sync-admin-read-models.md`.
- Freeze one admin read-model catalog covering:
  - account and organization projections;
  - device inventory and device health;
  - usage, quota, billing, and dunning status projections;
  - feature-flag and provider-status projections;
  - sync-health, audit, and operational-queue projections.
- Freeze privacy, RBAC, mutation, and audit rules for the admin control plane.
- Keep workflow/release snapshots as derived metadata only.

### Non-goals

- No Admin Dashboard implementation branch or production UI.
- No runtime sync-v1 unpause or protocol rewrite.
- No redefinition of `RepoRecord`, `syncScope`, crypto, `commit_seq`, nonce
  lease, or device identity.
- No browser access to service-role credentials, provider raw secrets, or user
  encrypted payload plaintext.
- No replacement of repository-truth workflow state with cloud-only status.

### Architecture Kind

Cross-surface control-plane contract for shared sync infrastructure and admin
read-model boundaries.

### User Surface

Control-plane contract only. This row informs a future isolated Admin Dashboard
surface but does not authorize or implement it.

### Change Type

New docs/contracts feature building on the shipped account-sync contract stack.

### Impacted Layers

- Current row: `docs/contracts/` and `docs/reviews/` only.
- Downstream owners implied by this brief:
  - `sync` for metadata/read-model authorities and guardrails;
  - `admin` for future control-plane UI and guarded mutation flows;
  - `site` and `workflow` only as downstream consumers of approved metadata.
- Explicitly out of scope for this row:
  - runtime code in `apps/web`, `apps/desktop`, `packages/core`, or
    `packages/plugin-*`.

### Target Plugin Slice / State

- No single plugin slice owns this contract.
- `@repo/web-auth-device-session` is the browser/device-session seam and may be
  cited as a stable dependency authority.
- Business-domain packages may appear as read-model sources later, but this row
  remains contract-only and mock-first where `docs/PLUGIN_MAP.md` shows
  non-stable owners.

### Risk Level

Medium.

Reasoning:

- the row is docs-only, but it sits at the security and control-plane boundary;
- poor phrasing here would create downstream secret-handling, audit, or source-
  of-truth drift;
- the contract must stay narrow enough to avoid accidentally activating the
  PROPOSED `admin` lane.

### Dependencies And Constraints

- Required authorities:
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
- Hard constraints preserved from the seed and user prompt:
  - Admin remains PROPOSED and isolated until operator activation.
  - Browser bundles must never receive service-role credentials, provider
    secrets, or user encrypted payload plaintext.
  - Admin audit is append-only and separate from user sync audit.
  - Every admin mutation requires RBAC, high-risk confirmation when applicable,
    audit append, and explicit success/failure result.
  - Workflow/dev-log/release-log state remains repository truth.

### Data / Permission / Security Impact

- Data impact: yes, metadata/control-plane only.
- Permission impact: yes, future admin routes and mutations are claim-gated and
  RBAC-gated.
- Security impact: yes. The row must preserve server-only secrets, strict audit
  separation, and no browser access to encrypted payload plaintext.

### Release Strategy

- Docs-only `sync` contract row.
- No promotion into an active `admin` or `site` implementation lane.
- Future implementation work stays gated by operator activation and separate
  Workflow V2 rows.

### Rollback / Degrade Strategy

- If review finds the row too broad, degrade it back to a pure read-model and
  mutation-guard contract and defer any UI or workflow-projection questions to
  later rows.
- If a required source system is not yet stable, keep that read model marked
  deferred rather than inventing a fake authority.

### Acceptance Criteria

1. The planned canonical contract target is
   `docs/contracts/account-sync-admin-read-models.md`.
2. The contract defines one admin read-model catalog with data source,
   freshness, privacy boundary, RBAC scope, and mutation/audit notes for each
   domain.
3. The contract clearly separates account/sync metadata, billing/quota/usage
   projections, provider/feature-flag projections, and deferred items.
4. The contract explicitly forbids browser access to service-role credentials,
   provider raw secrets, and user encrypted payload plaintext.
5. The contract explicitly separates admin audit from user sync audit while
   reusing integrity precedent where practical.
6. The contract defines the mandatory mutation guard stack: RBAC, high-risk
   confirmation, append-only audit, explicit success/failure result.
7. The contract preserves ADR-0013 D4, `RepoRecord`, `syncScope`, and paused
   `sync-v1` runtime authorities unchanged.
8. The handoff is specific enough for `feature-plan` to produce a single
   docs-only build phase.

## Open Questions / Unknowns

1. Which read-model domains must remain explicitly deferred because the owning
   source systems are not yet stable or operator-approved?
2. Should workflow/release-log projections appear as a separate admin domain, or
   only as derived support metadata under sync health and operations?
3. Which provider-status fields can be safely exposed to browser-delivered admin
   code versus staying server-only and summarized?

## ADR-lite Trigger

Needed: Yes

- Decision Topic: unified admin read-model and mutation-guard boundaries for
  Account Cloud Sync control-plane work.
- Why Decision Is Needed:
  - the row crosses `sync`, future `admin`, and workflow/audit boundaries;
  - the contract must settle secret-handling and audit-separation rules before
    any control-plane implementation work begins;
  - the row must freeze which data stays metadata-only and which items are
    deferred.
- Options To Evaluate:
  - one shared contract with per-domain matrices;
  - split contracts per source system;
  - defer read-model integration until admin activation.
- Risks If Deferred:
  - downstream admin work may invent inconsistent data sources, audit behavior,
    or secret-handling rules.

## Planner Handoff

- Three-faces decision: no host/core/plugin business logic changes in this row;
  current work is docs/contracts only in the `sync` module, with future
  downstream `admin` implementation still PROPOSED.
- Target plugin slice: none. This is a shared contract artifact.
- Mock strategy: `Deferred Integration` for any future source system that is not
  already frozen by shipped account/sync contracts; the current row stays at
  metadata and boundary level only.
- Cross-window contract impact: none in this row. No new
  `packages/core/src/events/` contract or Tauri command change is authorized.
- Recommended next agent: `feature-plan`
