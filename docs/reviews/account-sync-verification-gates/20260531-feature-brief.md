# Feature Brief - account-sync-verification-gates

| Field | Value |
|---|---|
| Feature Slug | `account-sync-verification-gates` |
| Created | 2026-05-31 |
| Author | Codex (`xai-feature-brief` inline fallback) |
| Product Module | `sync` |
| Step 0 QA Gate | PASS |
| Output Status | `READY_FOR_FEATURE_PLAN` |
| Source | `docs/reviews/account-sync-verification-gates/20260531-roadmap-seed.md` |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #10 |
| Depends On | `account-sync-surface-adapters`, `account-sync-admin-read-models`, `account-sync-site-entry-contract`, `account-sync-workflow-state-contract` |
| Automation Mode | `A-Codex` |
| Verify Cross-vendor | `yes` |

## Structured Brief

### Feature Title

Account Sync verification gates

### Canonical Name And Rationale

- Canonical slug: `account-sync-verification-gates`
- Canonical output target: `docs/contracts/account-sync-verification-gates.md`
- Why this name fits:
  - the roadmap row is the final governance gate for the Account Cloud Sync
    contract stack;
  - the output is a shared verification and observability authority, not a
    runtime sync implementation;
  - the contract closes rows #1-#9 by defining how later rows prove
    completeness, boundary preservation, and two-device convergence.

### Problem / Motivation

Rows #1-#9 now freeze account-cloud topology, entity scope, device identity,
local-first ownership, protocol sequencing, surface-adapter rules, admin
read-model boundaries, Site public-boundary rules, and workflow-state
governance. What the roadmap still lacks is one canonical answer to this final
question:

How does an Account Cloud Sync feature prove it is complete, safe, observable,
and ship-ready without inventing a new source of truth, weakening privacy
boundaries, or silently skipping hard runtime evidence?

Without a dedicated verification-gates contract:

1. later rows could claim ADR-0013 D4 completeness without naming the exact
   proof required for each of the nine items;
2. device-local regressions could leak into a remote outbox without a mandatory
   negative-proof gate;
3. mocked contract tests, Docker/Postgres tests, browser IndexedDB tests,
   desktop SQLite/SQLCipher tests, and live external evidence could be mixed
   together with no lane separation, making coverage look broader than it is;
4. conflict handling, admin RBAC/audit, Site public-boundary, and
   workflow-truth rules could each be tested differently by each team;
5. sync observability could drift into collecting payloads, private entity ids,
   raw device ids, provider secrets, or key material.

### Target User / Actor

- Primary actors: planners, reviewers, builders, verifiers, and operators
  working on future `sync`, `web`, `app`, `admin`, `site`, and `workflow`
  follow-up rows.
- Secondary actors: maintainers of test harnesses, sync-health dashboards, and
  release gates who need one canonical checklist for what "ready to ship"
  means.
- The contract is not end-user UI; it is a governance and verification surface.

### Desired Outcome

Produce a docs-only contract that:

- defines one master gate matrix covering entity contracts, repository drivers,
  push/pull behavior, conflict handling, admin read models, Site boundaries,
  workflow state, two-device convergence, and observability privacy;
- separates required evidence lanes into:
  - mocked contract tests;
  - local Docker/Postgres tests;
  - browser IndexedDB tests;
  - desktop SQLite/SQLCipher tests;
  - live external or two-device gates;
- provides explicit checklists for:
  - design review and feature-plan intake;
  - feature-verify;
  - pre-ship;
  - live rollout;
- makes "device-local produces no remote outbox entry" a first-class required
  proof, not an implied assumption;
- makes telemetry redaction and privacy-preserving observability a first-class
  gate;
- preserves ADR-0013 D4, `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, and
  paused `sync-v1` authorities unchanged.

### Scope

- Create the reviewed Step 0 brief and planning pack under
  `docs/reviews/account-sync-verification-gates/`.
- Plan for a canonical contract doc at
  `docs/contracts/account-sync-verification-gates.md`.
- Freeze:
  - the master verification-gate matrix for account-sync features;
  - evidence-lane separation rules;
  - stage checklists for design review, plan intake, feature-verify, pre-ship,
    and live rollout;
  - observability field allowlist and denylist rules;
  - two-device convergence and conflict-shadow proof expectations;
  - repository-truth rules for how verification receipts are stored and cited.

### Non-goals

- No runtime sync-v1 unpause or implementation.
- No new Web/App/Admin/Site/Workflow UI.
- No new `RepoRecord`, `syncScope`, event contract, or Tauri command.
- No protocol rewrite, crypto restatement, or device-identity redesign.
- No new mutable workflow database or cloud-owned verification authority.
- No activation of `site`, `admin`, or `plugin` implementation lanes.

### Architecture Kind

Cross-surface governance and verification contract for shared account-cloud
infrastructure.

### User Surface

Contract only. This row produces a `docs/contracts/` authority and review-pack
artifacts. It informs future verify, ship, rollout, and observability work but
does not define a runtime screen or API.

### Change Type

New docs/contracts feature building on the shipped account-sync contract stack.

### Impacted Layers

- Current row: `docs/contracts/` and `docs/reviews/` only.
- Downstream owners implied by this brief:
  - `sync` for account-cloud verification rules and observability boundaries;
  - `web` for IndexedDB and browser-safe verification lanes;
  - `app` for SQLite/SQLCipher and native/offline verification lanes;
  - `admin`, `site`, and `workflow` for their checkpoint-specific boundary
    gates.
- Explicitly out of scope for this row: runtime code in `apps/web`,
  `apps/desktop`, `packages/core/`, or `packages/plugin-*`.

### Target Plugin Slice / State

- No single plugin slice owns this contract.
- `@repo/core-data` remains a dependency authority for repository semantics and
  is still non-stable in `docs/PLUGIN_MAP.md`; later examples must remain
  contract-level or mock-first.
- `@repo/web-auth-device-session` is a stable browser/device-session seam that
  later admin/Site checks may cite.

### Risk Level

Medium.

Reasoning:

- the row is docs-only, but it defines the final acceptance authority for a
  sensitive sync and privacy surface;
- a vague gate contract here would let later features overstate coverage or
  under-specify negative proofs such as device-local outbox exclusion;
- telemetry/privacy language must be exact enough to prevent secret or payload
  leakage in observability tooling.

### Dependencies & Constraints

- Required authorities:
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
- Hard constraints preserved from the seed and roadmap:
  - every account-sync feature must satisfy ADR-0013 D4's 9-item completeness
    rule;
  - device-local regressions must prove no remote outbox entry is produced;
  - verification must separate mocked contract tests, local Docker/Postgres
    tests, browser IndexedDB tests, desktop SQLite/SQLCipher tests, and live
    external gates;
  - telemetry must never include payloads, entity ids with private meaning, raw
    device ids, provider secrets, or key material;
  - the gate suite must cover entity contracts, repository drivers, push/pull,
    conflict handling, admin, Site, workflow, and two-device convergence;
  - no redefinition of `RepoRecord`, `syncScope`, crypto, or paused runtime
    sync-v1.

### Data / Permission / Security Impact

- Data impact: yes, at the governance level. The contract defines what proof is
  required for account-sync versus device-local flows and what evidence may be
  stored as verification artifacts.
- Permission impact: yes. Admin and Site gate rules inherit claim and
  public-boundary restrictions from their upstream contracts and must be proven
  rather than assumed.
- Security impact: yes. The contract must freeze telemetry redaction rules and
  forbid payload, key, and secret disclosure in observability surfaces.

### Release Strategy

- Docs-only `sync` contract row.
- No branch activation or runtime unfreeze is authorized.
- Later runtime rows may only claim `READY_TO_SHIP` once their verify receipts
  satisfy this contract's evidence lanes and stage checklists.

### Rollback / Degrade Strategy

- If review finds the gate matrix too broad, degrade by keeping the master gate
  table and stage checklists while deferring any optional example evidence
  schema to later module-specific rows.
- If a later feature cannot satisfy one evidence lane (for example live
  external), the contract should force an explicit deferred gate or blocker
  rather than a silent pass.

### Acceptance Criteria

1. The canonical contract target is
   `docs/contracts/account-sync-verification-gates.md`.
2. The contract defines one master gate matrix covering the required surfaces:
   entity contracts, repository drivers, push/pull, conflict handling, admin
   boundaries, Site boundaries, workflow truth, two-device convergence, and
   observability privacy.
3. The contract separates required proof into mocked contract, Docker/Postgres,
   browser IndexedDB, desktop SQLite/SQLCipher, and live external evidence
   lanes.
4. The contract provides explicit checklists for design review, feature-plan
   intake, feature-verify, pre-ship, and live rollout.
5. The contract makes "device-local produced no remote outbox entry" a required
   negative proof.
6. The contract defines telemetry allowlist and denylist rules that forbid
   payloads, private entity ids, raw device ids, provider secrets, and key
   material.
7. The contract preserves ADR-0013 D4, `data-repository-v0`,
   `TECHNICAL_REQUIREMENTS`, and paused `sync-v1` authorities unchanged.
8. The handoff is specific enough for `feature-plan` to produce one docs-only
   build phase.

## Open Questions / Unknowns

1. Should live rollout require one canonical "two-device rehearsal receipt"
   format shared by Web and App, or is a per-feature receipt acceptable as long
   as it covers the same gate items?
2. Should telemetry redaction rules later name a standard pseudonymization
   scheme for device identifiers, or is "hashed/scoped device handle" sufficient
   at this governance layer?
3. Should pre-ship require explicit deferred-gate labeling when live external
   environments are unavailable, or may that remain in the feature-specific
   verify receipt format?

## ADR-lite Trigger

Needed: Yes

- Decision Topic: account-cloud verification, observability, and governance
  gate model for all later account-sync runtime rows.
- Why Decision Is Needed:
  - the row crosses `sync`, `web`, `app`, `admin`, `site`, and `workflow`
    boundaries and defines how all of them prove readiness;
  - without one authority, later rows can each choose different evidence rules
    and overstate completeness;
  - telemetry privacy and device-local negative proofs need one stable review
    anchor before runtime work resumes.
- Options To Evaluate:
  - one shared master gate contract with lane-separated evidence and stage
    checklists;
  - minimal ADR-0013 D4 checklist only, leaving per-surface gates to later rows;
  - separate verification contracts per surface, with no shared final authority.
- Risks If Deferred:
  - later runtime rows may claim completeness without the same proof standard;
  - device-local regressions may ship without explicit outbox-negative proof;
  - observability tooling may drift into collecting secrets or private payload
    identifiers.

## Planner Handoff

- Final brief status: `READY_FOR_FEATURE_PLAN`
- Three-faces decision:
  - host shell: no ownership in this row; the contract is docs-only and does
    not authorize host implementation changes;
  - core: no business logic or shared runtime state moves into
    `packages/core/`;
  - plugin slice: downstream plugin slices remain consumers of repository and
    sync authorities only; no plugin runtime work is activated here;
  - the row itself belongs to the `sync` product module as a governance
    contract, not a host/core/plugin runtime feature.
- Target plugin slice: `N/A` for a single owning slice. Later runtime rows in
  `sync`, `web`, `app`, `admin`, `site`, and `workflow` all consume this
  contract.
- Mock strategy: `Deferred Integration`.
  - Reason: this row freezes verification rules only; live runtime evidence
    still belongs to later owning-module rows after the paused lanes resume.
- Cross-window contract impact:
  - none required in this row;
  - do not add or modify `packages/core/src/events/` typed events or Tauri
    command signatures;
  - if a later feature needs shared sync-status or rollout events, that change
    must be justified in the owning runtime row.
- Recommended plan shape:
  - one docs-only phase that creates
    `docs/contracts/account-sync-verification-gates.md` and updates
    `docs/contracts/README.md`;
  - the contract should contain a master gate matrix, evidence-lane rules,
    stage checklists, telemetry redaction rules, and two-device/convergence
    proof expectations.
- Review focus:
  - ADR-0013 D4 completeness coverage;
  - explicit negative proof that device-local does not reach remote outbox;
  - lane-separated evidence expectations;
  - telemetry privacy and secret exclusion;
  - no implied runtime unpause or contract redefinition.

## Saved Brief Path

`docs/reviews/account-sync-verification-gates/20260531-feature-brief.md`
