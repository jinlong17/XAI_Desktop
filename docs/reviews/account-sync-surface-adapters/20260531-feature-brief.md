# Feature Brief — account-sync-surface-adapters

| 字段 | 值 |
|---|---|
| Feature Slug | `account-sync-surface-adapters` |
| 创建日期 | 2026-05-31 |
| 作者 | Codex (`xai-feature-brief` inline) |
| Product Module | `sync` |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_FEATURE_PLAN` |
| Source | `docs/reviews/account-sync-surface-adapters/20260531-roadmap-seed.md` |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #6 |
| Depends On | `account-sync-local-first-boundaries`, `account-sync-protocol-surface-contract` |
| Automation Mode | `A-Codex` |
| Verify Cross-vendor | `yes` |

---

## Structured Brief

### Feature Title

Account Cloud Sync surface adapters

### Canonical Name And Rationale

- Canonical slug: `account-sync-surface-adapters`
- Canonical output target: `docs/contracts/account-sync-surface-adapters.md`
- Why this name fits:
  - the roadmap row is specifically about Web, Mac Desktop, and Desktop Plugin
    adapter boundaries;
  - the work is a shared sync contract, not a runtime sync-v1 implementation
    row and not a product-surface feature;
  - it sits after local-first and protocol contracts and before later workflow,
    admin, and site follow-up rows.

### Problem / Motivation

Rows #1-#5 establish the shared account-cloud topology, entity scope, device
identity, local-first boundaries, and protocol surface, but they stop short of
freezing how each product surface is allowed to consume those contracts.

That leaves a planning gap in three places:

1. Web, App, and Plugin can each overreach into sync concerns unless adapter
   seams are stated explicitly.
2. Local-first exclusions can drift back into product code if the row does not
   say which surface owns local writes, sync status, conflict affordances, and
   repository access.
3. Future Web-to-App or Plugin-to-Sync work could accidentally treat Account
   Cloud Sync as a user-facing product surface instead of shared infrastructure.

This row closes that gap by defining adapter responsibilities per surface
without unpausing runtime sync-v1 work or reopening `RepoRecord`,
`syncScope`, encryption, or D3 branch-governance rules.

### Target User / Actor

- Primary actors: planners and implementers in the `web`, `app`, `plugin`, and
  `sync` module lanes who need one shared adapter contract before later runtime
  work.
- Indirect end users: account holders using Web or Mac Desktop who need
  consistent sync behavior, explicit local-first boundaries, and deterministic
  sync-status/conflict handling across surfaces.

### Desired Outcome

Produce a single docs-only contract that:

- defines what Web owns when it writes account-sync data and renders sync
  status/conflict state;
- defines what Mac Desktop owns when it writes account-sync data and bridges
  native/local-first seams;
- defines what Desktop Plugin may declare and consume through repository APIs
  without implementing transport or storage internals;
- explains how local-first data stays local on each surface;
- routes future implementation work to `web`, `app`, `plugin`, or `sync`
  without turning Account Cloud Sync into a standalone product surface.

### Scope

- Create the reviewed Step 0 brief for roadmap row #6 under
  `docs/reviews/account-sync-surface-adapters/`.
- Plan for a canonical contract doc at
  `docs/contracts/account-sync-surface-adapters.md`.
- Freeze adapter-boundary expectations for:
  - Web account-sync writes, local store ownership, sync status, and conflict
    affordances;
  - Mac Desktop account-sync writes, SQLCipher/Keychain/native seam ownership,
    sync status, and conflict affordances;
  - Desktop Plugin repository-only access, entity declaration rules, and
    sync-status/conflict consumption hooks.
- Make explicit which data remains local-first and which metadata may surface
  remotely or through derived read models.
- Preserve D3 branch/governance rules for any future Desktop-impacting Web
  change.

### Non-goals

- No runtime sync-v1 unfreeze or implementation work.
- No new product UI, sync engine, push/pull code path, Tauri command, or
  `packages/core/src/events/` change in this Step 0 artifact.
- No redefinition of `RepoRecord`, `syncScope`, encrypted envelope, nonce
  lease, conflict shadow, crypto, or account/device identity.
- No plugin SDK/widget-host implementation; plugin lane remains P2 paused.
- No Admin or Site contract work beyond citing their future rows as downstream
  consumers.
- No direct Web-to-App state bridge outside ADR-0013 D4 and D3 governance.

### Architecture Kind

Cross-surface contract / boundary definition for shared sync infrastructure.

### User Surface

API and adapter contract only. The row informs Web settings/status UI, Mac
Desktop runtime UI, and Plugin repository integrations later, but Step 0 itself
does not define a user-facing screen.

### Change Type

New docs/contracts feature that extends the shipped Account Cloud Sync planning
stack with surface-adapter boundaries.

### Impacted Layers

- Current row: `docs/contracts/` and `docs/reviews/` only.
- Downstream ownership implied by this brief:
  - `apps/web` / Web packages for browser adapter and sync-status UI.
  - `apps/desktop/src-tauri/` plus App-owned runtime seams for native/local
    adapter behavior.
  - `packages/plugin-*` for repository-only entity consumers.
  - `sync` contracts for scope enforcement and protocol reuse.
- Explicitly out of scope for this row: business logic in `apps/desktop/src/`
  or `packages/core/`.

### Target Plugin Slice / State

- No single target plugin slice owns this contract.
- Downstream plugin consumers will be generic `packages/plugin-*` slices using
  repository APIs only.
- Dependency-state check against `docs/PLUGIN_MAP.md`:
  - `@repo/core-data`: `In-Dev` -> consumers must keep mock-first or
    contract-only discipline until promoted.
  - `account` / `productivity` / `labels` / `project`: `In-Dev` -> this row may
    cite them as owning domains, but must not assume stable direct integration.
  - `@repo/web-auth-device-session`: `Stable` -> safe to cite as the browser
    device/session seam.
- Plugin platform/runtime work remains P2 paused per `docs/PRODUCT_MODULE_MAP.md`.

### Risk Level

Medium.

Reasoning:

- the row is docs-only, which keeps implementation risk low;
- but it spans Web, App, Plugin, and Sync boundaries, so a vague contract here
  would cause downstream architecture drift;
- the biggest risks are ownership drift, accidental core/host leakage, and
  implied unpausing of P2 sync/plugin runtime work.

### Dependencies & Constraints

- Required authorities:
  - `docs/contracts/account-cloud-sync-architecture.md`
  - `docs/contracts/account-sync-entity-scope-matrix.md`
  - `docs/contracts/account-device-identity-contract.md`
  - `docs/contracts/account-sync-local-first-boundaries.md`
  - `docs/contracts/account-sync-protocol-surface-contract.md`
  - `docs/contracts/data-repository-v0.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/workflow/roadmap/sync-v1.md`
  - ADR-0013 D4 and D3 governance
- Hard constraints preserved from the seed and roadmap context:
  - Web remains the P0 product surface and App UI source.
  - Desktop-impacting Web changes still flow through D3 before App work.
  - Native/runtime work stays in `app`; plugin SDK/widget work stays in
    `plugin`; protocol/entity work stays in `sync`.
  - Plugins declare entities and use repository APIs; they do not implement
    push/pull engines.
  - Row #6 must respect P2 paused status for plugin and sync-v1 runtime work.
  - The row must not redefine `RepoRecord`, `syncScope`, or cryptographic
    authorities.

### Data / Permission / Security Impact

- Data impact: yes, but contract-only. The row defines which adapter may write
  account-sync data, which state stays local-first, and which metadata may
  appear in derived sync-status/conflict surfaces.
- Permission impact: yes, by boundary. Desktop local adapters may depend on
  native secure storage, SQLCipher, file/bookmark permissions, or future Tauri
  seams, but this row must keep those below App-owned adapters rather than
  exposing them to plugins.
- Security impact: yes, by boundary. The row must preserve:
  - encrypted-envelope-only remote storage;
  - no plaintext payload or key-material exposure to Admin/Site/Workflow;
  - no plugin direct access to secure stores or transport credentials;
  - no accidental reclassification of `device-local` data into account-sync.

### Release Strategy

- Docs-only `sync` contract row.
- No branch or runtime unfreeze is authorized by this brief.
- Later Web/App/Plugin implementation work must route into the owning module and
  keep D3 / paused-lane governance intact.
- Because `Verify Cross-vendor = yes`, later build/verify phases must keep the
  split-vendor workflow once the contract moves beyond Step 0.

### Rollback / Degrade Strategy

- If planning review finds the adapter contract too broad or module ownership is
  unclear, degrade by narrowing the row back to pure responsibility tables and
  push any unresolved runtime/UI mechanics into later owning-module rows.
- If a downstream team needs behavior not covered here, the fallback is to add a
  later module-specific contract or D3 parity receipt rather than weakening the
  shared sync boundary in this row.

### Acceptance Criteria

1. A canonical contract target is defined as
   `docs/contracts/account-sync-surface-adapters.md`.
2. The planned contract explicitly separates Web, Mac Desktop, and Desktop
   Plugin responsibilities for:
   - write path ownership;
   - repository/store ownership;
   - sync status rendering inputs;
   - conflict handling inputs or hooks.
3. The brief explicitly states how local-first data remains local on each
   surface and which classes must never enter remote sync.
4. The brief preserves ADR-0013 D4 topology and D3 governance, with no direct
   Web-to-App sync path.
5. The brief preserves the rule that plugins declare entities and use
   repository APIs only, with no push/pull engine ownership.
6. The brief treats plugin and sync-v1 runtime work as paused and does not
   unpause them by implication.
7. The brief explicitly avoids redefining `RepoRecord`, `syncScope`, crypto, or
   device identity.
8. The resulting handoff is specific enough for `feature-plan` to produce a
   single docs-only plan without requiring another intake round.

## Open Questions / Unknowns

1. Which future surface, if any, should own a shared sync-status vocabulary for
   "idle / syncing / conflict / remediation required" without forcing a new
   `@repo/core` event or product-global UI contract in this row?
2. Does `organizer.item` need row #6 to carry an explicit Web-vs-Desktop
   adapter example for mixed sync-safe metadata versus local-only path details,
   or is row #4 already sufficient as the sole authority?
3. Should the eventual contract include one neutral adapter matrix for Admin,
   Site, and Workflow observers, or keep row #6 strictly limited to Web/App/
   Plugin and leave observers entirely to rows #7-#10?

## ADR-lite Trigger

Needed: Yes

- Decision Topic: surface-adapter ownership for Web, Mac Desktop, and Desktop
  Plugin consumption of Account Cloud Sync.
- Why Decision Is Needed:
  - multiple product modules consume the same sync substrate;
  - the repo has explicit paused lanes and D3 governance that can be weakened by
    a vague adapter contract;
  - later status/conflict UI hooks could drift into `@repo/core`, App host, or
    plugin internals unless ownership is fixed now.
- Options To Evaluate:
  - keep row #6 as a pure responsibility matrix with no shared event/command
    additions;
  - define a minimal shared sync-status contract while still forbidding runtime
    implementation in this row;
  - split App/Plugin examples into later module rows if row #6 becomes too broad.
- Risks If Deferred:
  - Web/App/Plugin may implement inconsistent sync-status or conflict affordance
    surfaces;
  - plugin/runtime seams may start bypassing repository-only rules;
  - future D3 or paused-lane decisions may be forced from incomplete contract
    language instead of explicit review.

## Planner Handoff

- Final brief status: `READY_FOR_FEATURE_PLAN`
- Three-faces decision:
  - host shell: no ownership in this row beyond being a consumer of later
    adapter outputs;
  - core: no business logic or state ownership moves into `packages/core/`;
  - plugin slice: downstream plugin slices own business semantics only and must
    stay repository-only.
  - this Step 0 artifact itself is a `sync` contract row, not a host/core/
    plugin runtime implementation.
- Target plugin slice: `N/A` for a single owning slice. The contract covers
  generic `packages/plugin-*` consumers; `account`, `productivity`, `labels`,
  and `project` remain non-stable (`In-Dev`) dependency authorities per
  `docs/PLUGIN_MAP.md`.
- Mock strategy: `Deferred Integration`.
  - Reason: plugin lane and sync-v1 runtime work remain paused, and
    `@repo/core-data` plus multiple plugin slices are still non-stable. This row
    should freeze boundaries now and defer real adapter/runtime integration to
    later owning-module features.
- Cross-window contract impact:
  - none required in Step 0;
  - do not add or modify `packages/core/src/events/` typed events or Tauri
    command signatures in this row;
  - if later App/Web surfaces need shared sync-status or conflict notifications,
    that change must be justified explicitly in the owning downstream plan.
- Recommended plan shape:
  - one docs-only phase that creates `docs/contracts/account-sync-surface-adapters.md`
    and updates `docs/contracts/README.md` only if the contract file is added;
  - the contract should use adapter matrices for Web, Mac Desktop, and Desktop
    Plugin responsibilities, plus a short "observer surfaces" boundary note.
- Review focus:
  - P0 Web authority versus D3-to-App handoff;
  - repository-only plugin boundary;
  - local-first exclusions staying local on both Web and Desktop;
  - no implied unpause of plugin or sync-v1 runtime tracks;
  - no business logic drift into `apps/desktop/src/` or `packages/core/`.

## Saved Brief Path

`docs/reviews/account-sync-surface-adapters/20260531-feature-brief.md`
