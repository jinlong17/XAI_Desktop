# Feature Brief — account-sync-workflow-state-contract

| 字段 | 值 |
|---|---|
| Feature Slug | `account-sync-workflow-state-contract` |
| 创建日期 | 2026-05-31 |
| 作者 | Codex (`xai-feature-brief` inline) |
| Product Module | `sync` |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_FEATURE_PLAN` |
| Source | `docs/reviews/account-sync-workflow-state-contract/20260531-roadmap-seed.md` |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #9 |
| Depends On | `account-sync-surface-adapters`, `account-sync-admin-read-models` |
| Automation Mode | `A-Codex` |
| Verify Cross-vendor | `yes` |

---

## Structured Brief

### Feature Title

Account Sync workflow state contract

### Canonical Name And Rationale

- Canonical slug: `account-sync-workflow-state-contract`
- Canonical output target: `docs/contracts/account-sync-workflow-state-contract.md`
- Why this name fits:
  - the roadmap row is specifically about preserving repository-truth for
    workflow artifacts (manifests, dev logs, release logs, dashboard snapshots)
    while defining what read-only status account/sync infrastructure may expose
    to those surfaces;
  - the work is a boundary and separation contract, not a runtime sync-v1
    implementation row and not a new product-surface feature;
  - it sits after the surface-adapter and admin-read-model contracts (rows #6
    and #7) and before the cross-surface verification gates (row #10);
  - the core problem is preventing developer workflow state from becoming a
    parallel source of truth for account/sync state, or vice versa.

### Problem / Motivation

Rows #1-#8 freeze the account-cloud topology, entity scope, device identity,
local-first boundaries, protocol surface, surface adapter rules, admin read
models, and site entry contract. However, the roadmap still lacks one canonical
answer to this question:

How do Workflow systems, roadmap manifests, dev logs, release logs, and
developer dashboards share account/sync status without either side becoming a
parallel source of truth?

Without a dedicated contract, three failure modes emerge:

1. Account Cloud Sync could drift into overwriting or supplanting
   `dev_log.md`, roadmap manifests, ADRs, or release logs with cloud-derived
   status — destroying the git-tracked, repository-truth discipline.
2. Developer workflow state (roadmap status, build phases, verification results,
   release receipts) could be mistakenly scoped as user/product account data
   and flow into remote account-sync outboxes or admin read models.
3. Hybrid dashboards or control-plane views could mix product usage data with
   developer workflow status without stating source, refresh cadence, or
   authority — making it impossible to audit which state is canonical.

This row closes that gap by defining separation rules, allowed derived
read-only exposures, and source-of-truth anchors without unpausing runtime
sync-v1 work or reopening any prior contract.

### Target User / Actor

- Primary actors: planners and implementers in the `sync`, `admin`, and
  `workflow` lanes who need a shared boundary before the final verification
  gates row (#10).
- Secondary actors: any future dashboard, control-plane, or observability
  author who might render workflow state alongside account/sync health
  summaries.
- The contract does not address end-user product account holders directly;
  it addresses developer and operator tooling boundaries.

### Desired Outcome

Produce a single docs-only contract that:

- states explicitly that roadmap manifests, `dev_log.md` files, release logs,
  ADRs, and dashboard snapshots remain git-tracked repository truth for
  developer workflow and must not be overwritten or superseded by Account Cloud
  Sync operations;
- defines what account/sync infrastructure is allowed to expose to workflow
  surfaces as read-only derived status (e.g., sync-health summaries, feature
  progress snapshots, error-rate indicators) versus what must stay in the
  account/sync data plane;
- defines what developer workflow state is account-scoped versus repository-
  local, and forbids `device-local` or `account-sync` classification for
  repository-truth artifacts;
- specifies how any dashboard or control-plane view that spans product usage
  data and workflow status must declare its source, refresh cadence, and
  authority for each data class;
- names future hook points for release-log, roadmap-state, and sync-health
  aggregation without authorizing runtime implementation of those hooks in
  this row.

### Scope

- Create the reviewed Step 0 brief for roadmap row #9 under
  `docs/reviews/account-sync-workflow-state-contract/`.
- Plan for a canonical contract doc at
  `docs/contracts/account-sync-workflow-state-contract.md`.
- Freeze the separation rules between:
  - user/product account data (owned by account/sync infrastructure, may
    participate in `account-sync` scope, may appear in admin read models);
  - developer workflow state (owned by repository-truth git artifacts, must
    not enter remote outboxes, may be projected as read-only derived snapshots
    only).
- Define which account/sync status classes may be consumed as derived read-only
  inputs by workflow tools and dashboards.
- Define how any cross-domain view must document source, cadence, and
  authority for each data class it renders.
- Name hook points for future aggregation (release-log, roadmap-state,
  sync-health) without implementing them.
- Preserve all prior contracts in `docs/contracts/` as inherited authorities.

### Non-goals

- No runtime sync-v1 unpause or implementation of push/pull, outbox, or
  conflict-resolution code.
- No implementation of dashboard UI, release-log hook, or roadmap-state
  aggregation service in this Step 0 artifact.
- No new product UI, event contract, Tauri command, or
  `packages/core/src/events/` change.
- No secret storage, raw log retention, or private user payload exposure in
  workflow-visible state.
- No overwriting or replacing repository-truth artifacts such as
  `dev_log.md`, roadmap manifests, release logs, or ADRs with cloud-only
  workflow status.
- No redefinition of `RepoRecord`, `syncScope`, encrypted envelope, crypto,
  or device identity.
- No plugin SDK or widget-host implementation; plugin lane remains P2 paused.
- No activation of `admin` or `site` implementation branches.
- No mixing of admin audit and developer workflow audit into a single stream.

### Architecture Kind

Cross-surface boundary contract separating user/product account data from
developer workflow state, with read-only derived exposure rules for shared
dashboards.

### User Surface

Contract only. This row produces a `docs/contracts/` boundary document.
It informs future workflow tooling, dashboard authors, and control-plane
integrators but does not define a user-facing screen or runtime API.

### Change Type

New docs/contracts feature building on the shipped surface-adapter and admin
read-model contracts in the Account Cloud Sync planning stack.

### Impacted Layers

- Current row: `docs/contracts/` and `docs/reviews/` only.
- Downstream ownership implied by this brief:
  - `sync` module for account/sync status exposure and scope enforcement;
  - `admin` module for any future workflow snapshot domain in the admin
    read-model catalog;
  - workflow tooling authors for any derived dashboard or release-log
    aggregation.
- Explicitly out of scope for this row: runtime code in `apps/web`,
  `apps/desktop`, `packages/core/`, or `packages/plugin-*`.

### Target Plugin Slice / State

- No single plugin slice owns this contract.
- Dependency-state check against `docs/PLUGIN_MAP.md`:
  - `@repo/core-data`: `In-Dev` — consumers must keep mock-first or
    contract-only discipline until promoted.
  - Business-domain packages (`account`, `productivity`, `labels`, `project`):
    `In-Dev` — this row must not assume stable direct integration.
  - `@repo/web-auth-device-session`: `Stable` — safe to cite as the browser
    device/session seam.
- Plugin platform/runtime work remains P2 paused.

### Risk Level

Medium.

Reasoning:

- the row is docs-only, so implementation risk is low;
- but it spans the sync/workflow/admin knowledge boundary, and a vague
  separation contract here would allow downstream work to accidentally
  treat repository-truth as cloud-replaceable;
- the biggest risks are source-of-truth drift, accidental classification of
  workflow artifacts as account-sync entities, and dashboard authors mixing
  data classes without authority declarations.

### Dependencies & Constraints

- Required authorities:
  - `docs/contracts/account-cloud-sync-architecture.md`
  - `docs/contracts/account-sync-entity-scope-matrix.md`
  - `docs/contracts/account-device-identity-contract.md`
  - `docs/contracts/account-sync-local-first-boundaries.md`
  - `docs/contracts/account-sync-protocol-surface-contract.md`
  - `docs/contracts/account-sync-surface-adapters.md`
  - `docs/contracts/account-sync-admin-read-models.md`
  - `docs/contracts/data-repository-v0.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/workflow/roadmap/sync-v1.md`
  - ADR-0013 D4 governance
- Hard constraints preserved from the seed and roadmap context:
  - Roadmap manifests, `dev_log.md`, release logs, and dashboard snapshots
    remain repository-truth; Account Cloud Sync must not overwrite them.
  - User/product account data and developer workflow state must be clearly
    separated in every contract statement.
  - Any dashboard or control-plane read model spanning both domains must
    declare source, refresh cadence, and authority.
  - Secrets, raw logs, and private user payloads must not appear in
    workflow-visible state.
  - Row #9 must preserve ADR-0013 D4, `RepoRecord`, `syncScope`, and
    paused sync-v1 runtime authorities unchanged.

### Data / Permission / Security Impact

- Data impact: yes, boundary-only. The row defines which workflow artifacts
  may not be classified as account-sync data and which sync status classes
  may be read as derived metadata by workflow surfaces.
- Permission impact: yes, by separation rule. Dashboard or control-plane
  views rendering cross-domain data must state their authority for each
  data class rendered.
- Security impact: yes, by exclusion. The row must ensure:
  - no secrets, raw logs, or private user payloads enter workflow-visible
    state;
  - workflow artifacts do not enter account-sync outboxes or encrypted blobs;
  - derived sync-health summaries exposed to workflow tooling follow the same
    browser-secret boundary already defined in the admin read-model contract.

### Release Strategy

- Docs-only `sync` contract row.
- No branch or runtime unfreeze is authorized by this brief.
- Later implementation work for release-log hooks, roadmap-state aggregation,
  or sync-health dashboard feeds must route into the owning module and keep
  paused-lane governance intact.
- Because `Verify Cross-vendor = yes`, later build/verify phases must keep the
  split-vendor workflow once the contract moves beyond Step 0.

### Rollback / Degrade Strategy

- If planning review finds the separation contract too broad or the source/
  cadence/authority rules too prescriptive for early-stage workflow tooling,
  degrade by narrowing to a pure separation matrix and deferring the hook-
  point definitions to a later row.
- If a downstream team needs a cross-domain view not covered here, the
  fallback is to add a later module-specific hook contract rather than
  weakening the shared workflow/sync boundary in this row.

### Acceptance Criteria

1. The canonical contract target is defined as
   `docs/contracts/account-sync-workflow-state-contract.md`.
2. The contract explicitly states that roadmap manifests, `dev_log.md` files,
   release logs, and ADRs remain git-tracked repository truth and must not be
   overwritten or superseded by Account Cloud Sync operations.
3. The contract defines the separation between user/product account data
   (may be `account-sync` scoped) and developer workflow state (repository-
   local only, must not enter account-sync outboxes).
4. The contract specifies that any cross-domain dashboard or read model
   spanning product usage and workflow status must declare data source,
   refresh cadence, and authority for each data class it renders.
5. The contract explicitly prohibits storing secrets, raw logs, or private
   user payloads in workflow-visible state.
6. The contract names future hook points for release-log, roadmap-state, and
   sync-health aggregation as read-only derived-only exposures and explicitly
   defers their implementation to later rows.
7. The contract preserves ADR-0013 D4, `RepoRecord`, `syncScope`, paused
   sync-v1 runtime, and all prior account-sync contract authorities unchanged.
8. The handoff is specific enough for `feature-plan` to produce a single
   docs-only build phase without requiring another intake round.

## Open Questions / Unknowns

1. Should the workflow state contract include a formal separation table (like
   the admin read-model catalog) listing each workflow artifact class with its
   repository-truth authority, allowed derived exposure scope, and forbidden
   account-sync treatments — or is a narrative rule set sufficient for row #9?
2. If a future dashboard renders both account sync-health and roadmap-phase
   status together, should row #9 mandate a formal `WorkflowStateSnapshot`
   typed shape with declared source/cadence, or defer that shape definition
   to row #10's verification gates?
3. Is developer workflow state (e.g., current roadmap phase, shipping status)
   ever legitimately product-facing user state (i.e., visible to an account
   holder rather than only to an operator), and if so, does that require a
   separate account-scoped entity class to be named in this row?

## ADR-lite Trigger

Needed: Yes

- Decision Topic: separation boundary between user/product account data and
  developer workflow state, and rules for cross-domain dashboard read models.
- Why Decision Is Needed:
  - the row crosses `sync`, `workflow`, and `admin` boundaries and sits at the
    junction where account/sync infrastructure and developer tooling most easily
    blur;
  - without explicit rules, a dashboard could render account data and workflow
    state side-by-side using undeclared sources, making repository-truth
    non-authoritative by default;
  - the contract must freeze what counts as repo-truth, what counts as derived,
    and how shared dashboards declare authority before any implementation work
    begins.
- Options To Evaluate:
  - define a minimal separation matrix and leave all cross-domain view rules
    to consuming tools;
  - define separation rules plus a mandatory source/cadence/authority
    declaration schema for every cross-domain read model;
  - split workflow and sync-health concerns into two separate downstream rows
    if row #9 becomes too broad.
- Risks If Deferred:
  - workflow tooling may invent its own account/sync state copies, undermining
    repository-truth discipline;
  - dashboard authors may mix user data and workflow data without source
    declarations, creating audit and governance gaps;
  - admin read-model rows may later fail verification because workflow snapshot
    rules were not pre-agreed.

## Planner Handoff

- Final brief status: `READY_FOR_FEATURE_PLAN`
- Three-faces decision:
  - host shell: no ownership in this row; the contract applies to docs/contracts
    only and does not authorize host implementation changes;
  - core: no business logic or state ownership moves into `packages/core/`;
  - plugin slice: downstream plugin slices are unaffected; repository-only rules
    from prior contracts continue to apply;
  - this Step 0 artifact itself is a `sync` module contract row, not a host,
    core, or plugin runtime implementation.
- Target plugin slice: `N/A` for a single owning slice. The contract covers
  developer workflow tooling, dashboard authors, and the `admin` read-model
  catalog as downstream consumers. Business-domain plugin slices remain
  non-stable (`In-Dev`) per `docs/PLUGIN_MAP.md`.
- Mock strategy: `Deferred Integration`.
  - Reason: plugin lane and sync-v1 runtime work remain paused; future release-
    log, roadmap-state, and sync-health hook implementations must wait for their
    owning-module rows. This row should freeze the separation rules and defer all
    hook implementation to later features.
- Cross-window contract impact:
  - none required in Step 0;
  - do not add or modify `packages/core/src/events/` typed events or Tauri
    command signatures in this row;
  - if later workflow tooling needs shared sync-status or release-log events,
    that change must be justified explicitly in the owning downstream plan.
- Recommended plan shape:
  - one docs-only phase that creates
    `docs/contracts/account-sync-workflow-state-contract.md` and updates
    `docs/contracts/README.md` only if the contract file requires registration;
  - the contract should use a separation table for data-class ownership rules,
    a source/cadence/authority schema for cross-domain views, and a named
    hook-point list for deferred future aggregation work.
- Review focus:
  - repository-truth preservation for all git-tracked workflow artifacts;
  - explicit prohibition of workflow artifact entry into account-sync outboxes;
  - source/cadence/authority declaration requirements for cross-domain dashboards;
  - no implied unpause of sync-v1 runtime, plugin lane, admin branch, or site
    branch;
  - no secret, raw log, or private user payload exposure in workflow-visible
    state.

## Saved Brief Path

`docs/reviews/account-sync-workflow-state-contract/20260531-feature-brief.md`
